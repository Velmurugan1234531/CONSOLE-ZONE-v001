import { createClient, isSupabaseConfigured } from "@/utils/supabase/client";

export interface PageSEO {
    title: string;
    description: string;
    keywords: string;
}

export interface SiteSettings {
    siteTitle: string;
    siteDescription: string;
    holidayMode: boolean;
    maintenanceMode: boolean;
    announcement: string;
    seo: Record<string, PageSEO>;
}

const STORAGE_KEY = 'site_settings';
const DB_KEY = 'global_config';

const DEFAULT_SETTINGS: SiteSettings = {
    siteTitle: "Console Zone",
    siteDescription: "Premium Gaming Rental Platform",
    holidayMode: false,
    maintenanceMode: false,
    announcement: "",
    seo: {
        'home': {
            title: "Console Zone | Rent PS5, Xbox & Gaming Gear",
            description: "Premium gaming rentals delivered to your doorstep. Experience the latest consoles without the commitment.",
            keywords: "ps5 rental, xbox rental, gaming console, rent games"
        },
        'rentals': {
            title: "Rent Consoles | PS5, Xbox Series X, PS4",
            description: "Browse our fleet of calibrated gaming consoles. Flexible daily, weekly, and monthly plans.",
            keywords: "ps5 rent price, xbox series x rental, gaming laptop rent"
        },
        'buy': {
            title: "Buy Gaming Gear | New & Pre-Owned",
            description: "Shop certified pre-owned consoles and new gaming accessories. Best prices guaranteed.",
            keywords: "buy ps5, used ps5, second hand gaming console"
        },
        'sell': {
            title: "Sell Your Console | Instant Cash Quote",
            description: "Get the best price for your old gaming gear. Instant quotes and doorstep pickup.",
            keywords: "sell ps5, sell xbox, cash for consoles"
        },
        'services': {
            title: "Repair & Mod | Expert Console Services",
            description: "Professional repair services for controllers, consoles, and gaming hardware.",
            keywords: "ps5 repair, controller stick drift fix, console cleaning"
        }
    }
};

/**
 * Get site settings from Supabase (Async) or LocalStorage (Fallback)
 */
export const fetchSiteSettings = async (): Promise<SiteSettings> => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    if (!isSupabaseConfigured()) return getSiteSettings();

    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', DB_KEY)
            .single();

        if (data && !error) {
            const settings = data.value as SiteSettings;
            // Sync with local storage for offline fallback
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            return settings;
        }

        if (error) {
            // PGRST116: The result contains 0 rows
            if (error.code === 'PGRST116') {
                console.warn("Global configuration row not found in site_settings. Using defaults.");
            } else if (error.code === '42P01') {
                console.error("Table site_settings does not exist in Supabase! Please run the migration: supabase/migrations/20240210_create_site_settings.sql");
            } else {
                console.error("Supabase settings fetch error:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
            }
        }
    } catch (e: any) {
        console.error("Failed to fetch from Supabase:", e?.message || e);
    }

    // Fallback to localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

/**
 * Sync version for legacy components (returns last known cached state)
 */
export const getSiteSettings = (): SiteSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

/**
 * Save site settings to Supabase and LocalStorage
 */
export const saveSiteSettings = async (settings: SiteSettings) => {
    if (typeof window === 'undefined') return;

    try {
        const supabase = createClient();

        // Fetch current to check for announcement changes
        const { data: current } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', DB_KEY)
            .single();

        const oldSettings = current?.value as SiteSettings | undefined;

        // Save to LocalStorage immediately for responsive UI
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

        if (isSupabaseConfigured()) {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    key: DB_KEY,
                    value: settings,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

            if (error) {
                console.error("Supabase settings save error:", {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }
        }

        // Global Announcement Link
        if (settings.announcement && settings.announcement !== oldSettings?.announcement) {
            try {
                const { sendNotification } = await import("./notifications");
                await sendNotification({
                    type: 'info',
                    title: 'System Announcement',
                    message: settings.announcement
                });
            } catch (e) {
                console.warn("Announcement notification failed:", e);
            }
        }
    } catch (e) {
        console.error("Failed to save to Supabase:", e);
    }
};

export const resetSiteSettings = async () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);

    if (isSupabaseConfigured()) {
        try {
            const supabase = createClient();
            await supabase.from('site_settings').delete().eq('key', DB_KEY);
        } catch (e) {
            console.error("Failed to reset in Supabase:", e);
        }
    }
};
