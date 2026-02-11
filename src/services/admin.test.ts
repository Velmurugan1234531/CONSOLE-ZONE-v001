import { describe, it, expect, vi } from 'vitest';
import { getAdminStats } from '@/services/admin';

// Mock Supabase client
vi.mock('@/utils/supabase/client', () => ({
    createClient: () => ({
        from: () => ({
            select: (_query: string, options?: { count?: string }) => {
                const isCount = options?.count === 'exact';
                const mockResponse = { data: [], error: null, count: isCount ? 0 : null };

                // Chainable mock
                const chainable = {
                    eq: () => chainable,
                    gte: () => chainable,
                    lte: () => chainable,
                    in: () => chainable,
                    or: () => chainable,
                    order: () => chainable,
                    then: (resolve: (val: any) => void) => resolve(mockResponse)
                };
                return chainable;
            }
        })
    }),
    isSupabaseConfigured: () => true
}));

describe('Admin Service', () => {
    it('should return initial stats when no data', async () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
        const stats = await getAdminStats();
        expect(stats.rentals).toEqual({
            active: 0,
            dueToday: 0,
            late: 0
        });
        expect(stats.shop).toEqual({
            totalSales: 0,
            newOrders: 0,
            outOfStock: 0
        });
        expect(stats.services).toEqual({
            activeTickets: 4,
            pendingAppointments: 2
        });
    });
});
