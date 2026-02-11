import { createClient } from "@/utils/supabase/client";
import { SaleRecord } from "@/types";

export const getSales = async (): Promise<SaleRecord[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching sales:", error);
        return [];
    }

    return (data || []).map((sale: any) => ({
        id: sale.id,
        items: sale.items,
        total_amount: Number(sale.total_amount),
        payment_method: sale.payment_method,
        status: sale.status,
        date: sale.created_at,
        timestamp: new Date(sale.created_at).getTime()
    }));
};

export const getDailyRevenue = async (): Promise<number> => {
    const supabase = createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', today.toISOString());

    if (error) {
        console.error("Error fetching daily revenue:", error);
        return 0;
    }

    return (data || []).reduce((sum: number, sale: any) => sum + Number(sale.total_amount), 0);
};

export const getMonthlyRevenue = async (): Promise<number> => {
    const supabase = createClient();
    const firstDay = new Date();
    firstDay.setDate(1);
    firstDay.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('created_at', firstDay.toISOString());

    if (error) {
        console.error("Error fetching monthly revenue:", error);
        return 0;
    }

    return (data || []).reduce((sum: number, sale: any) => sum + Number(sale.total_amount), 0);
};

export const recordSale = async (sale: Omit<SaleRecord, 'id' | 'date' | 'timestamp'>): Promise<boolean> => {
    const supabase = createClient();
    const { data: record, error } = await supabase
        .from('sales')
        .insert({
            user_id: sale.user_id,
            items: sale.items,
            total_amount: sale.total_amount,
            payment_method: sale.payment_method,
            status: sale.status || 'completed'
        })
        .select()
        .single();

    if (error) {
        console.error("Error recording sale:", error);
        return false;
    }

    // Automated Notification
    if (sale.user_id) {
        try {
            const { sendNotification } = await import("./notifications");
            await sendNotification({
                user_id: sale.user_id,
                type: 'success',
                title: 'Purchase Successful!',
                message: `Thank you for your purchase of ₹${sale.total_amount}. Your transaction id is ${record.id}.`
            });
        } catch (e) {
            console.warn("Failed to send sale notification:", e);
        }
    }

    return true;
};
