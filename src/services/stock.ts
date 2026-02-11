import { useState, useEffect } from 'react';
import { createClient, isSupabaseConfigured } from "@/utils/supabase/client";

export interface StockItem {
    id: string; // This will map to category (e.g., 'PS5', 'Xbox')
    name: string;
    total: number;
    rented: number;
    available: number;
    image: string;
    label?: string;
    lowStockAlert?: boolean;
    maxControllers?: number;
    extraControllerEnabled?: boolean;
}

const STOCK_KEY = 'CONSOLE_STOCK_DATA_V2';

// Local storage is used as a fallback/cache
// DEMO DATA: These values will be replaced by real Supabase data once configured
// DEMO DATA: These values will be replaced by real Supabase data once configured
import { DEMO_DEVICES } from "@/constants/demo-stock";
import { CONSOLE_IMAGES } from "@/constants/images";
import { Device } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";

// Helper to aggregate stock from a list of devices
const aggregateStock = (devices: Device[]): StockItem[] => {
    const aggregated = devices.reduce((acc: Record<string, StockItem>, device: Device) => {
        // Defensive check for category
        if (!device.category) return acc;

        // Skip Lost units
        if (device.status === 'Lost') return acc;

        // Use full category name for ID to distinguish variants (e.g. 'PS5' vs 'PS5 Pro')
        const cat = device.category.trim().toLowerCase().replace(/\s+/g, '-');
        if (!acc[cat]) {
            acc[cat] = {
                id: cat,
                name: device.category,
                total: 0,
                rented: 0,
                available: 0,
                image: (['ps5', 'ps4', 'xbox'].some(type => cat.includes(type)))
                    ? `/assets/products/${cat}-console.png`
                    : CONSOLE_IMAGES.default.preview,
                label: device.category,
                lowStockAlert: true,
                maxControllers: 4,
                extraControllerEnabled: true
            };
        }

        acc[cat].total += 1;

        // Check if unavailable
        const isUnavailable = ['RENTED', 'MAINTENANCE', 'UNDER_REPAIR', 'Rented', 'Maintenance', 'Under-Repair'].includes(device.status);

        if (isUnavailable) {
            acc[cat].rented += 1;
        } else {
            acc[cat].available += 1;
        }

        return acc;
    }, {});

    return Object.values(aggregated);
};

const DEFAULT_STOCK: StockItem[] = aggregateStock(DEMO_DEVICES);

let listeners: (() => void)[] = [];

function emitChange() {
    for (const listener of listeners) {
        listener();
    }
}

const getMergedDemoDevices = (): StockItem[] => {
    let allDevices: Device[] = [...DEMO_DEVICES];
    if (typeof window !== 'undefined') {
        const localUpdates = localStorage.getItem('DEMO_UPDATED_DEVICES');
        if (localUpdates) {
            try {
                const updates = JSON.parse(localUpdates);
                allDevices = allDevices.map(d => {
                    const update = updates.find((u: Partial<Device>) => u.id === d.id);
                    return update ? { ...d, ...update } : d;
                });
            } catch (e) {
                console.error("Failed to parse local device updates:", e);
            }
        }

        const localAdded = localStorage.getItem('DEMO_ADDED_DEVICES');
        if (localAdded) {
            try {
                const addedDevices = JSON.parse(localAdded);
                allDevices = [...allDevices, ...addedDevices];
            } catch (e) {
                console.error("Failed to parse local demo devices:", e);
            }
        }
    }
    return aggregateStock(allDevices);
};

export const StockService = {
    useStock: () => {
        const [stock, setStock] = useState<StockItem[]>([]);
        const [loading, setLoading] = useState(true);

        const fetchStock = async () => {
            try {
                if (!isSupabaseConfigured()) {
                    console.warn("Dev Mode: Skipping persistence cache for fresh data.");
                    setStock(getMergedDemoDevices());
                    setLoading(false);
                    return;
                }

                let consoles: Device[] = [];
                try {
                    const supabase = createClient();
                    const { data, error } = await supabase.from('consoles').select('*');
                    if (error) {
                        console.warn("Supabase fetch failed (using fallback):", error.message);
                        consoles = [];
                    } else {
                        consoles = data as Device[];
                    }
                } catch (err: unknown) {
                    // Suppress connection errors or missing table errors
                    const msg = err instanceof Error ? err.message : String(err);
                    console.warn("Supabase issue:", msg);
                    consoles = [];
                }

                const result = aggregateStock(consoles || []);

                const finalStock = result.length > 0 ? result : DEFAULT_STOCK;
                setStock(finalStock);

                if (typeof window !== 'undefined') {
                    localStorage.setItem(STOCK_KEY, JSON.stringify(finalStock));
                }
            } catch (e: unknown) {
                // Outer catch: only log unique unexpected errors
                const msg = e instanceof Error ? e.message : "Unknown error";
                console.warn("Using demo stock due to error:", msg);
                if (!isSupabaseConfigured()) {
                    setStock(DEFAULT_STOCK); // Reset to default while loading fresh
                    console.warn("Dev Mode: Skipping persistence cache for fresh data.");
                } else {
                    const stored = typeof window !== 'undefined' ? localStorage.getItem(STOCK_KEY) : null;
                    setStock(stored ? JSON.parse(stored) : DEFAULT_STOCK);
                }
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchStock();
            const listener = () => fetchStock();
            listeners.push(listener);
            window.addEventListener('storage', listener);

            let channel: RealtimeChannel | null = null;
            if (isSupabaseConfigured()) {
                const supabase = createClient();
                channel = supabase
                    .channel('realtime-stock')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'consoles' },
                        () => {
                            fetchStock();
                        }
                    )
                    .subscribe();
            }

            return () => {
                listeners = listeners.filter(l => l !== listener);
                window.removeEventListener('storage', listener);
                if (channel) {
                    const supabase = createClient();
                    supabase.removeChannel(channel);
                }
            };
        }, []);

        return stock;
    },

    getItems: async (): Promise<StockItem[]> => {
        try {
            if (!isSupabaseConfigured()) {
                // Ignore cache, always recalculate for accuracy in dev mode
                return getMergedDemoDevices();
            }

            const supabase = createClient();
            const { data: consoles, error } = await supabase.from('consoles').select('*');
            if (error) throw error;

            return aggregateStock(consoles as Device[] || []);
        } catch (e: unknown) {
            console.error("Stock.getItems error:", {
                message: e instanceof Error ? e.message : "Unknown error",
                raw: e
            });
            // Fallback to merged demo data
            return getMergedDemoDevices();
        }
    },

    // Legacy support or internal use
    saveItems: (items: StockItem[]) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STOCK_KEY, JSON.stringify(items));
        emitChange();
    },

    // Maintenance and repair logic handled in admin service now
    // but Keeping generic update methods for compatibility
    updateUsage: async (id: string, delta: number) => {
        // This should probably be handled by specific rental start/end actions in DB
        emitChange();
    }
};
