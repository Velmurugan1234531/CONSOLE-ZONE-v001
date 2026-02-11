
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fetchSerialNumbers() {
    console.log("Fetching fleet inventory...");
    const { data: consoles, error } = await supabase
        .from('consoles')
        .select('id, name, serial_number, status, category')
        .order('category', { ascending: true });

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    if (!consoles || consoles.length === 0) {
        console.log("No units found in fleet.");
        return;
    }

    console.log("\n--- COMPLETE RENTAL FLEET SERIAL NUMBERS ---\n");

    // Group by Category
    const grouped = consoles.reduce((acc, unit) => {
        const cat = unit.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(unit);
        return acc;
    }, {});

    Object.entries(grouped).forEach(([category, units]) => {
        console.log(`\n[ ${category.toUpperCase()} ]`);
        console.table(units.map(u => ({
            Model: u.name,
            'Serial Number': u.serial_number || 'N/A',
            Status: u.status
        })));
    });
}

fetchSerialNumbers();
