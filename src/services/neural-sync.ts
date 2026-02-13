import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/types";

export type NeuralTier = {
    name: string;
    minXp: number;
    color: string;
    perks: string[];
};

export const NEURAL_TIERS: NeuralTier[] = [
    {
        name: "Initiate",
        minXp: 0,
        color: "#94a3b8", // Slate
        perks: ["Standard Rental Rates", "Digital Receipt Only"]
    },
    {
        name: "Operator",
        minXp: 500,
        color: "#a855f7", // Purple
        perks: ["10% Discount on Accessories", "Priority Support", "Neural Sync Badge"]
    },
    {
        name: "Elite",
        minXp: 2000,
        color: "#39ff14", // Neon Green
        perks: ["Zero Deposit (Select Gear)", "Prototype Early Access", "Elite Fleet Priority"]
    }
];

export const NeuralSyncService = {
    getUserXP: async (userId: string, supabaseClient?: any): Promise<number> => {
        const supabase = supabaseClient || createClient();
        const { data, error } = await supabase
            .from('users')
            .select('neural_sync_xp')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching XP, defaulting to 0:", error);
            return 0;
        }

        return data.neural_sync_xp || 0;
    },

    getCurrentTier: (xp: number): NeuralTier => {
        const reversedTiers = [...NEURAL_TIERS].reverse();
        return reversedTiers.find(tier => xp >= tier.minXp) || NEURAL_TIERS[0];
    },

    getNextTier: (xp: number): { tier: NeuralTier; xpNeeded: number } | null => {
        const nextTier = NEURAL_TIERS.find(tier => tier.minXp > xp);
        if (!nextTier) return null;
        return {
            tier: nextTier,
            xpNeeded: nextTier.minXp - xp
        };
    },

    addXP: async (userId: string, amount: number, supabaseClient?: any) => {
        const supabase = supabaseClient || createClient();
        const currentXp = await NeuralSyncService.getUserXP(userId, supabase);

        const { error } = await supabase
            .from('users')
            .update({ neural_sync_xp: currentXp + amount })
            .eq('id', userId);

        if (error) throw error;
        return currentXp + amount;
    }
};
