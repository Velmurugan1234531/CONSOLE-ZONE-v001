
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkStock() {
    const { data: consoles, error } = await supabase.from('consoles').select('*');
    if (error) {
        console.error("Error fetching consoles:", error);
        return;
    }

    console.log(`Total Consoles: ${consoles.length}`);

    const aggregated = (consoles || []).reduce((acc: any, console: any) => {
        if (!console.category) return acc;

        // Skip Lost
        if (console.status === 'Lost') return acc;

        const cat = console.category.toLowerCase().split(' ')[0];
        if (!acc[cat]) {
            acc[cat] = { total: 0, rented: 0, available: 0, statusBreakdown: {} };
        }

        acc[cat].total += 1;

        const isUnavailable = ['RENTED', 'MAINTENANCE', 'UNDER_REPAIR', 'Rented', 'Maintenance', 'Under-Repair'].includes(console.status);

        if (isUnavailable) {
            acc[cat].rented += 1;
        } else {
            acc[cat].available += 1;
        }

        // Detailed breakdown
        acc[cat].statusBreakdown[console.status] = (acc[cat].statusBreakdown[console.status] || 0) + 1;

        return acc;
    }, {});

    console.log("Stock Aggregation Results:", JSON.stringify(aggregated, null, 2));
}

checkStock();
