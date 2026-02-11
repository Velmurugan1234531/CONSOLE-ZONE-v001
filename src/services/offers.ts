import { createClient, isSupabaseConfigured } from "@/utils/supabase/client";

export interface PromotionalOffer {
    id: string;
    code: string;
    title: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_rental_days: number;
    max_uses: number | null;
    current_uses: number;
    valid_from: string;
    valid_until: string | null;
    is_active: boolean;
    applicable_categories: string[] | null;
}

export interface OfferValidationResult {
    is_valid: boolean;
    discount_type: string | null;
    discount_value: number | null;
    message: string;
}

// DEMO DATA for testing without Supabase
const DEMO_OFFERS: PromotionalOffer[] = [
    {
        id: "demo-offer-1",
        code: "FIRST10",
        title: "First Time User Discount",
        description: "Get 10% off your first rental",
        discount_type: "percentage",
        discount_value: 10,
        min_rental_days: 1,
        max_uses: null,
        current_uses: 0,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        applicable_categories: null
    },
    {
        id: "demo-offer-2",
        code: "WEEKEND50",
        title: "Weekend Special",
        description: "Flat ₹50 off on weekend rentals",
        discount_type: "fixed",
        discount_value: 50,
        min_rental_days: 2,
        max_uses: 100,
        current_uses: 15,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        applicable_categories: ["PS5", "Xbox"]
    },
    {
        id: "demo-offer-3",
        code: "MONTHLY20",
        title: "Monthly Plan Discount",
        description: "20% off on monthly rentals",
        discount_type: "percentage",
        discount_value: 20,
        min_rental_days: 28,
        max_uses: null,
        current_uses: 0,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        applicable_categories: null
    }
];

export const getAllOffers = async (): Promise<PromotionalOffer[]> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured. Returning DEMO offers.");
        return DEMO_OFFERS;
    }

    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('promotional_offers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn("Error fetching offers (using demo fallback):", error.message);
            return DEMO_OFFERS;
        }

        return data || [];
    } catch (e) {
        console.warn("Offers fetch crash (using demo fallback):", e);
        return DEMO_OFFERS;
    }
};

export const getActiveOffers = async (): Promise<PromotionalOffer[]> => {
    const allOffers = await getAllOffers();
    const now = new Date();

    return allOffers.filter(offer =>
        offer.is_active &&
        new Date(offer.valid_from) <= now &&
        (!offer.valid_until || new Date(offer.valid_until) >= now)
    );
};

export const validateOfferCode = async (
    code: string,
    category: string,
    rentalDays: number
): Promise<OfferValidationResult> => {
    if (!isSupabaseConfigured()) {
        // Demo validation
        const offer = DEMO_OFFERS.find(o => o.code.toUpperCase() === code.toUpperCase());

        if (!offer) {
            return {
                is_valid: false,
                discount_type: null,
                discount_value: null,
                message: "Invalid offer code"
            };
        }

        if (!offer.is_active) {
            return {
                is_valid: false,
                discount_type: null,
                discount_value: null,
                message: "Offer is no longer active"
            };
        }

        const now = new Date();
        if (new Date(offer.valid_from) > now || (offer.valid_until && new Date(offer.valid_until) < now)) {
            return {
                is_valid: false,
                discount_type: null,
                discount_value: null,
                message: "Offer has expired"
            };
        }

        if (offer.max_uses && offer.current_uses >= offer.max_uses) {
            return {
                is_valid: false,
                discount_type: null,
                discount_value: null,
                message: "Offer has reached maximum usage limit"
            };
        }

        if (rentalDays < offer.min_rental_days) {
            return {
                is_valid: false,
                discount_type: null,
                discount_value: null,
                message: `Minimum rental period of ${offer.min_rental_days} days required`
            };
        }

        if (offer.applicable_categories && !offer.applicable_categories.includes(category)) {
            return {
                is_valid: false,
                discount_type: null,
                discount_value: null,
                message: "Offer not applicable to this device category"
            };
        }

        return {
            is_valid: true,
            discount_type: offer.discount_type,
            discount_value: offer.discount_value,
            message: "Offer applied successfully"
        };
    }

    const supabase = createClient();
    const { data, error } = await supabase
        .rpc('validate_offer_code', {
            p_code: code,
            p_category: category,
            p_rental_days: rentalDays
        });

    if (error) {
        console.error("Error validating offer:", error);
        return {
            is_valid: false,
            discount_type: null,
            discount_value: null,
            message: "Error validating offer code"
        };
    }

    return data[0] || {
        is_valid: false,
        discount_type: null,
        discount_value: null,
        message: "Invalid offer code"
    };
};

export const createOffer = async (offerData: Omit<PromotionalOffer, 'id' | 'current_uses'>): Promise<PromotionalOffer | null> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured. Cannot create offer in demo mode.");
        return null;
    }

    const supabase = createClient();
    const { data, error } = await supabase
        .from('promotional_offers')
        .insert([{ ...offerData, current_uses: 0 }])
        .select()
        .single();

    if (error) {
        console.error("Error creating offer:", error);
        throw error;
    }

    return data;
};

export const updateOffer = async (id: string, updates: Partial<PromotionalOffer>): Promise<PromotionalOffer | null> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured. Cannot update offer in demo mode.");
        return null;
    }

    const supabase = createClient();
    const { data, error } = await supabase
        .from('promotional_offers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating offer:", error);
        throw error;
    }

    return data;
};

export const deleteOffer = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured. Cannot delete offer in demo mode.");
        return false;
    }

    const supabase = createClient();
    const { error } = await supabase
        .from('promotional_offers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting offer:", error);
        throw error;
    }

    return true;
};

export const incrementOfferUsage = async (code: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
        // Demo mode: increment locally
        const offer = DEMO_OFFERS.find(o => o.code === code);
        if (offer) {
            offer.current_uses++;
        }
        return;
    }

    const supabase = createClient();
    const { error } = await supabase
        .rpc('increment_offer_usage', { p_code: code });

    if (error) {
        console.error("Error incrementing offer usage:", error);
    }
};

// Calculate final price with offer applied
export const applyOffer = (
    basePrice: number,
    discountType: 'percentage' | 'fixed',
    discountValue: number
): { discount: number; finalPrice: number } => {
    let discount = 0;

    if (discountType === 'percentage') {
        discount = (basePrice * discountValue) / 100;
    } else {
        discount = discountValue;
    }

    // Ensure discount doesn't exceed base price
    discount = Math.min(discount, basePrice);

    return {
        discount,
        finalPrice: basePrice - discount
    };
};
