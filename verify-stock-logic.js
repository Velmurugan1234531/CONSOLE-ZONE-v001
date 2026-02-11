
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkStock() {
    console.log("Fetching consoles...");
    const { data: consoles, error } = await supabase.from('consoles').select('*');
    if (error) {
        console.error("Error fetching consoles:", error);
        return;
    }

    console.log(`Total Consoles: ${consoles.length}`);

    const aggregated = (consoles || []).reduce((acc, consoleItem) => {
        if (!consoleItem.category) return acc;

        // Skip Lost
        if (consoleItem.status === 'Lost') return acc;

        const cat = consoleItem.category.toLowerCase().split(' ')[0];
        if (!acc[cat]) {
            acc[cat] = { total: 0, rented: 0, available: 0, statusBreakdown: {} };
        }

        acc[cat].total += 1;

        const isUnavailable = ['RENTED', 'MAINTENANCE', 'UNDER_REPAIR', 'Rented', 'Maintenance', 'Under-Repair'].includes(consoleItem.status);

        if (isUnavailable) {
            acc[cat].rented += 1;
        } else {
            acc[cat].available += 1;
        }

        // Detailed breakdown
        acc[cat].statusBreakdown[consoleItem.status] = (acc[cat].statusBreakdown[consoleItem.status] || 0) + 1;

        return acc;
    }, {});

    console.log("Stock Aggregation Results:", JSON.stringify(aggregated, null, 2));
}

checkStock();
