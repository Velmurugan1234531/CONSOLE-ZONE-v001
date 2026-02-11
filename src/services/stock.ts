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

const STOCK_KEY = 'CONSOLE_STOCK_DATA';

// Local storage is used as a fallback/cache
// DEMO DATA: These values will be replaced by real Supabase data once configured
import { DEMO_DEVICES } from "@/constants/demo-stock";

// Helper to aggregate stock from a list of devices
const aggregateStock = (devices: any[]): StockItem[] => {
    const aggregated = devices.reduce((acc: any, device: any) => {
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
                image: `/assets/products/${cat}-console.png`, // Conventional naming
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

    return Object.values(aggregated) as StockItem[];
};

const DEFAULT_STOCK: StockItem[] = aggregateStock(DEMO_DEVICES);

let listeners: (() => void)[] = [];

function emitChange() {
    for (const listener of listeners) {
        listener();
    }
}

export const StockService = {
    useStock: () => {
        const [stock, setStock] = useState<StockItem[]>([]);
        const [loading, setLoading] = useState(true);

        const fetchStock = async () => {
            try {
                if (!isSupabaseConfigured()) {
                    console.warn("Supabase not configured, using aggregated DEMO stock data.");
                    // In demo mode, we always recalculate from the source truth (DEMO_DEVICES) 
                    // and merge any locally added devices (from Fleet Manager)
                    let allDevices = [...DEMO_DEVICES];
                    if (typeof window !== 'undefined') {
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

                    const aggregated = aggregateStock(allDevices);
                    setStock(aggregated);
                    setLoading(false);
                    return;
                }

                const supabase = createClient();
                const { data: consoles, error } = await supabase
                    .from('consoles')
                    .select('*');

                if (error) throw error;

                const result = aggregateStock(consoles || []);

                // Fallback to defaults if no results but let's prioritize DB types
                const finalStock = result.length > 0 ? result : DEFAULT_STOCK;
                setStock(finalStock);

                if (typeof window !== 'undefined') {
                    localStorage.setItem(STOCK_KEY, JSON.stringify(finalStock));
                }
            } catch (e: any) {
                console.error("Stock fetch error details:", {
                    message: e?.message || "Unknown error",
                    stack: e?.stack,
                    raw: e
                });
                // Fallback to local storage
                const stored = typeof window !== 'undefined' ? localStorage.getItem(STOCK_KEY) : null;
                setStock(stored ? JSON.parse(stored) : DEFAULT_STOCK);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchStock();
            const listener = () => fetchStock();
            listeners.push(listener);
            window.addEventListener('storage', listener);

            let channel: any = null;
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
                if (typeof window === 'undefined') return DEFAULT_STOCK;
                const stored = localStorage.getItem(STOCK_KEY);
                return stored ? JSON.parse(stored) : DEFAULT_STOCK;
            }

            const supabase = createClient();
            const { data: consoles, error } = await supabase.from('consoles').select('*');
            if (error) throw error;

            return aggregateStock(consoles || []);
        } catch (e: any) {
            console.error("Stock.getItems error:", {
                message: e?.message || "Unknown error",
                raw: e
            });
            if (typeof window === 'undefined') return DEFAULT_STOCK;
            const stored = localStorage.getItem(STOCK_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_STOCK;
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
