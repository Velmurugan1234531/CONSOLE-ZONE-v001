
const fs = require('fs');
const path = require('path');

// Manually parse .env.local because dotenv might be flaky in this env
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim().replace(/"/g, '');
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

async function fetchSerials() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/consoles?select=id,name,serial_number,status,category&order=category.asc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        console.log("\n--- RENTAL FLEET SERIALS ---\n");
        data.forEach(item => {
            console.log(`[${item.category || 'Unknown'}] ${item.name} | SN: ${item.serial_number || 'N/A'} | Status: ${item.status}`);
        });

    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

fetchSerials();
