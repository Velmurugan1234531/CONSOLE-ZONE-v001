import { createClient } from "@/utils/supabase/client";
import { Device, MaintenancePolicy, WorkOrder, QCRecord } from "@/types";

export interface RentalEligibility {
    allowed: boolean;
    reason?: string;
    maintenanceStatus?: string;
}

export const checkRentalEligibility = async (deviceId: string): Promise<RentalEligibility> => {
    const supabase = createClient();

    // 1. Fetch Device Status & Metrics
    const { data: device, error } = await supabase
        .from('consoles')
        .select('id, serial_number, status, maintenance_status, usage_metrics')
        .eq('id', deviceId)
        .single();

    if (error || !device) {
        console.error("Error fetching device for eligibility check:", error);
        return { allowed: false, reason: "Device not found or system error." };
    }

    // 2. Check Explicit Maintenance Status
    if (['Overdue', 'Critical', 'In-Repair'].includes(device.maintenance_status)) {
        return {
            allowed: false,
            reason: `Device is flagged as ${device.maintenance_status} in Maintenance Control.`,
            maintenanceStatus: device.maintenance_status
        };
    }

    // 3. Check Open Critical Work Orders
    const { data: openOrders } = await supabase
        .from('work_orders')
        .select('id, priority')
        .eq('device_id', deviceId)
        .in('status', ['Open', 'In-Progress', 'Waiting-Parts'])
        .in('priority', ['High', 'Critical']);

    if (openOrders && openOrders.length > 0) {
        return {
            allowed: false,
            reason: "Active Critical Work Order in progress.",
            maintenanceStatus: 'In-Repair'
        };
    }

    // 4. (Extension) Check Automated Policy Thresholds
    // Here we would compare usage_metrics against maintenance_policies
    // For MVP, we rely on the pre-calculated device.maintenance_status

    return { allowed: true };
};

export const getMaintenanceDashboardStats = async () => {
    const supabase = createClient();

    // Fetch Overdue Count
    const { count: overdueCount } = await supabase
        .from('consoles')
        .select('*', { count: 'exact', head: true })
        .in('maintenance_status', ['Overdue', 'Critical']);

    // Fetch In-Repair Count
    const { count: repairCount } = await supabase
        .from('consoles')
        .select('*', { count: 'exact', head: true })
        .eq('maintenance_status', 'In-Repair');

    // Fetch Pending QC
    // Placeholder logic for QC

    return {
        overdue: overdueCount || 0,
        inRepair: repairCount || 0,
        healthScore: 92 // Mocked for now
    };
};

export const triggerMaintenanceAlerts = async () => {
    const supabase = createClient();

    // 1. Fetch Active Policies
    const { data: policies } = await supabase
        .from('maintenance_policies')
        .select('*')
        .eq('is_active', true);

    if (!policies || policies.length === 0) return { updated: 0 };

    // 2. Fetch All Consoles
    const { data: consoles } = await supabase
        .from('consoles')
        .select('*');

    if (!consoles) return { updated: 0 };

    const updates = [];

    // 3. Evaluate Each Console against Policies
    for (const device of consoles) {
        let newStatus = device.maintenance_status;

        // Skip if already Critical or In-Repair
        if (['Critical', 'In-Repair'].includes(device.maintenance_status)) continue;

        const metrics = device.usage_metrics || { total_rentals: 0, total_days_rented: 0, last_service_date: null };
        const lastService = metrics.last_service_date ? new Date(metrics.last_service_date) : new Date(0);
        const daysSinceService = Math.floor((new Date().getTime() - lastService.getTime()) / (1000 * 3600 * 24));

        for (const policy of policies) {
            // Time-based check
            if (policy.interval_days) {
                if (daysSinceService >= policy.interval_days) {
                    newStatus = 'Overdue';
                } else if (daysSinceService >= policy.interval_days - 7) {
                    // Only escalate, don't downgrade from Overdue
                    if (newStatus !== 'Overdue') newStatus = 'Due-Soon';
                }
            }
        }

        if (newStatus !== device.maintenance_status) {
            updates.push({
                id: device.id,
                maintenance_status: newStatus
            });
        }
    }

    // 4. Batch Update (Sequential for now to check errors)
    for (const update of updates) {
        await supabase.from('consoles').update({ maintenance_status: update.maintenance_status }).eq('id', update.id);
    }

    return { updated: updates.length };
};

export const getCriticalAssets = async () => {
    const supabase = createClient();

    // Fetch Overdue, Due-Soon, Critical, In-Repair
    const { data } = await supabase
        .from('consoles')
        .select('*')
        .in('maintenance_status', ['Overdue', 'Critical', 'In-Repair', 'Due-Soon'])
        .order('maintenance_status', { ascending: false }); // Critical first? Needs custom sort or client side

    return data || [];
};
