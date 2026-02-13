import { createClient } from "@/utils/supabase/client";
import { Rental } from "@/types";
import { sendNotification } from "./notifications";
import { Transmissions } from "@/utils/neural-messages";

import { checkRentalEligibility } from "./maintenance";

export const createRental = async (rentalData: Partial<Rental>) => {
    const supabase = createClient();

    // 1. Eligibility Check
    if (rentalData.console_id) {
        const eligibility = await checkRentalEligibility(rentalData.console_id);
        if (!eligibility.allowed) {
            throw new Error(`Rental Blocked: ${eligibility.reason}`);
        }
    }

    const { data, error } = await supabase
        .from('rentals')
        .insert(rentalData)
        .select()
        .single();

    if (error) throw error;

    // Automated Notification
    try {
        const transmission = Transmissions.RENTAL.BOOKED("Gaming Console", data.id);
        await sendNotification({
            user_id: data.user_id,
            type: 'success',
            title: transmission.title,
            message: transmission.message
        });
    } catch (e) {
        console.warn("Failed to send automated notification:", e);
    }

    return data;
};

export const getUserRentals = async (userId: string) => {
    // Demo Mode Support
    if (userId === 'demo-user-123') {
        const { DEMO_RENTALS } = await import("@/constants/demo-stock");
        return DEMO_RENTALS || [];
    }

    const supabase = createClient();

    // Safety check for non-prod environments
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
        return [];
    }

    const { data, error } = await supabase
        .from('rentals')
        .select(`
            *,
            product:products(*),
            console:consoles(name, serial_number, category)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Rental[];
};
