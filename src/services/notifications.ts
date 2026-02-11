import { createClient, isSupabaseConfigured } from "@/utils/supabase/client";
import { Notification, NotificationType } from "@/types";

export const getNotifications = async (userId?: string): Promise<Notification[]> => {
    // Return empty if not configured to prevent terminal pollution
    if (!isSupabaseConfigured()) return [];

    try {
        const supabase = createClient();
        let query = supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (userId) {
            query = query.or(`user_id.eq.${userId},user_id.is.null`);
        } else {
            query = query.is('user_id', null);
        }

        const { data, error } = await query;

        if (error) {
            // Handle missing table gracefully
            if (error.code === '42P01') {
                console.warn("Table 'notifications' does not exist. Please run the migration: supabase/migrations/20240211_create_notifications_table.sql");
            } else {
                console.error("Error fetching notifications:", {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
            }
            return [];
        }

        return data as Notification[];
    } catch (e: any) {
        console.error("Unexpected error in getNotifications:", e?.message || e);
        return [];
    }
};

export const sendNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('notifications')
        .insert([{
            ...notification,
            read: false,
            created_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) throw error;
    return data as Notification;
};

export const markAsRead = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

    if (error) throw error;
};

export const markAllAsRead = async (userId: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) throw error;
};

export const deleteNotification = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const getUnreadCount = async (userId: string): Promise<number> => {
    if (!isSupabaseConfigured()) return 0;
    const supabase = createClient();
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

    if (error) {
        console.error("Error fetching unread count:", error);
        return 0;
    }
    return count || 0;
};
