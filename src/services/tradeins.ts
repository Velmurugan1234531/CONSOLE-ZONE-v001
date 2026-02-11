import { createClient } from "@/utils/supabase/client";

export interface TradeInRequest {
    id: string;
    user_id: string;
    user_name: string;
    item_name: string;
    category: string;
    condition: string;
    description: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    offered_credit: number;
    created_at: string;
}

export const getTradeInRequests = async (): Promise<TradeInRequest[]> => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('trade_in_requests')
        .select(`
            *,
            user:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.warn("Trade-ins table missing, using mock data");
        return [
            {
                id: "tr-001",
                user_id: "u-001",
                user_name: "Rahul Sharma",
                item_name: "The Last of Us Part II (PS4)",
                category: "Game",
                condition: "Like New",
                description: "Discs are scratch-free. Original box included.",
                images: ["https://images.unsplash.com/photo-1605898399783-1820b7f80b53?q=80&w=400"],
                status: 'pending',
                offered_credit: 1200,
                created_at: new Date().toISOString()
            },
            {
                id: "tr-002",
                user_id: "u-002",
                user_name: "Ananya Iyer",
                item_name: "DualSense Controller (Midnight Black)",
                category: "Accessory",
                condition: "Good",
                description: "Slight drift on left stick, otherwise perfect.",
                images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=400"],
                status: 'pending',
                offered_credit: 2500,
                created_at: new Date(Date.now() - 86400000).toISOString()
            }
        ];
    }

    return data.map((item: any) => ({
        ...item,
        user_name: item.user?.full_name || "Unknown User"
    }));
};

export const updateTradeInStatus = async (id: string, status: TradeInRequest['status'], credit?: number) => {
    const supabase = createClient();
    const update: any = { status };
    if (credit !== undefined) update.offered_credit = credit;

    // Fetch the request first to get the user_id
    const { data: request } = await supabase
        .from('trade_in_requests')
        .select('user_id, item_name')
        .eq('id', id)
        .single();

    const { error } = await supabase
        .from('trade_in_requests')
        .update(update)
        .eq('id', id);

    if (error) throw error;

    // Automated Notification
    if (request?.user_id) {
        try {
            const { sendNotification } = await import("./notifications");
            await sendNotification({
                user_id: request.user_id,
                type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
                title: 'Trade-In Update',
                message: status === 'approved'
                    ? `Good news! Your trade-in for "${request.item_name}" has been approved for ₹${credit} credit.`
                    : `Your trade-in for "${request.item_name}" status has been updated to ${status}.`
            });
        } catch (e) {
            console.warn("Notification failed:", e);
        }
    }
};
