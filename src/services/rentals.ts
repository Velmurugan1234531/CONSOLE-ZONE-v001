import { createClient } from "@/utils/supabase/client";
import { Rental } from "@/types";
import { sendNotification } from "./notifications";

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
        await sendNotification({
            user_id: data.user_id,
            type: 'success',
            title: 'Booking Confirmed!',
            message: `Your rental for unit #${data.console_id} has been successfully registered. Mission starts now!`
        });
    } catch (e) {
        console.warn("Failed to send automated notification:", e);
    }

    return data;
};

export const getUserRentals = async (userId: string) => {
    const supabase = createClient();

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
