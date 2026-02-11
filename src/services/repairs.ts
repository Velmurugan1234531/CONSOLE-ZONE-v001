import { createClient } from '@/utils/supabase/client';

export type RepairStatus = 'pending' | 'diagnosing' | 'awaiting_parts' | 'repairing' | 'testing' | 'ready' | 'completed' | 'cancelled';
export type RepairPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RepairTicket {
    id: string;
    user_id?: string;
    customer_name: string;
    customer_phone: string;
    device_name: string;
    serial_number?: string;
    issue_description: string;
    status: RepairStatus;
    priority: RepairPriority;
    estimated_cost: number;
    technician_name?: string;
    created_at: string;
    updated_at: string;
    images?: string[];
}

const MOCK_REPAIRS: RepairTicket[] = [
    {
        id: "REP-001",
        customer_name: "Rahul Sharma",
        customer_phone: "+91 98765 43210",
        device_name: "PlayStation 5",
        serial_number: "G912345678",
        issue_description: "HDMI port damaged, no output on TV.",
        status: "repairing",
        priority: "high",
        estimated_cost: 4500,
        technician_name: "Vikram S.",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date().toISOString(),
        images: ["https://images.unsplash.com/photo-1622233020087-0b1652414704?q=80&w=600"]
    },
    {
        id: "REP-002",
        customer_name: "Ananya Iyer",
        customer_phone: "+91 91234 56789",
        device_name: "DualSense Controller",
        issue_description: "Stick drift on left analog stick.",
        status: "pending",
        priority: "medium",
        estimated_cost: 1200,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "REP-003",
        customer_name: "Amit Patel",
        customer_phone: "+91 99887 76655",
        device_name: "Xbox Series X",
        serial_number: "XBX-0921-98",
        issue_description: "Overheating and shutting down after 30 mins.",
        status: "diagnosing",
        priority: "urgent",
        estimated_cost: 3000,
        technician_name: "Suresh K.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString()
    }
];

export const getRepairTickets = async (): Promise<RepairTicket[]> => {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('repair_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.warn("Repairs service: Using mock data");
        return MOCK_REPAIRS;
    }
};

export const updateRepairStatus = async (id: string, status: RepairStatus, technician?: string): Promise<void> => {
    try {
        const supabase = createClient();

        // Fetch ticket to get user_id and device_name
        const { data: ticket } = await supabase
            .from('repair_tickets')
            .select('user_id, device_name')
            .eq('id', id)
            .single();

        const { error } = await supabase
            .from('repair_tickets')
            .update({ status, technician_name: technician, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;

        // Automated Notification
        if (ticket?.user_id) {
            try {
                const { sendNotification } = await import("./notifications");
                await sendNotification({
                    user_id: ticket.user_id,
                    type: status === 'ready' ? 'success' : status === 'cancelled' ? 'error' : 'info',
                    title: `Repair Update: ${status.toUpperCase()}`,
                    message: status === 'ready'
                        ? `Great news! Your ${ticket.device_name} is ready for pickup.`
                        : `Your ${ticket.device_name} repair status has been updated to ${status}.`
                });
            } catch (e) {
                console.warn("Failed to send repair notification:", e);
            }
        }
    } catch (error) {
        console.warn(`Repairs service: Error updating ${id}:`, error);
    }
};

export const createRepairTicket = async (ticket: Partial<RepairTicket>): Promise<void> => {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('repair_tickets')
            .insert([{ ...ticket, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
            .select()
            .single();

        if (error) throw error;

        // Automated Notification for new ticket
        if (ticket.user_id) {
            try {
                const { sendNotification } = await import("./notifications");
                await sendNotification({
                    user_id: ticket.user_id,
                    type: 'info',
                    title: 'Repair Ticket Opened',
                    message: `Your repair ticket for ${ticket.device_name} has been created. Status: ${ticket.status || 'pending'}.`
                });
            } catch (e) {
                console.warn("Failed to send repair creation notification:", e);
            }
        }
    } catch (error) {
        console.error("Repairs service: Error creating ticket:", error);
    }
};
