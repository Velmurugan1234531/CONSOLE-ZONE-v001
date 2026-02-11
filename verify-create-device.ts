
import { createDevice } from './src/services/admin';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Mock localStorage for Node environment
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    (global as any).localStorage = new LocalStorage('./scratch');
    (global as any).window = { dispatchEvent: () => { } };
}

async function testCreateDevice() {
    console.log("Testing createDevice resilience...");
    try {
        const newDevice = await createDevice({
            name: "Test Console",
            serial_number: "TEST-SN-001",
            category: "PS5",
            health: 100,
            notes: "Test creation",
            controllers: 1,
            connectors: [],
            asset_records: []
        });
        console.log("Success! Device created (or mocked):", newDevice);
        if (newDevice.id.startsWith('demo-local-')) {
            console.log("Verified: Fallback to local demo mode active.");
        } else {
            console.log("Warning: Created in actual DB (unexpected if table missing).");
        }
    } catch (error) {
        console.error("FAILED: createDevice threw an error:", error);
        process.exit(1);
    }
}

testCreateDevice();
