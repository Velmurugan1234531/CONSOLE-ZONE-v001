import { Device, Profile } from "@/types";

export const DEMO_DEVICES: Device[] = [
    // ... existing devices ...
    {
        id: "demo-6",
        serialNumber: "SN-000006",
        model: "PS5 Spiderman Edition",
        category: "PS5",
        status: "Rented",
        health: 98,
        notes: "Premium limited edition unit",
        currentUser: "Ananya Iyer",
        lastService: "Feb 1, 2026",
        cost: 55000,
        purchaseDate: "2026-01-20",
        warrantyExpiry: "2027-01-20",
        supplier: "Sony India"
    }
];

export const DEMO_PROFILES: Profile[] = [
    {
        id: "demo-user-1",
        email: "rahul@example.com",
        full_name: "Rahul Sharma",
        role: "customer",
        kyc_status: "approved",
        wallet_balance: 5000,
        neural_sync_xp: 0,
        created_at: new Date().toISOString()
    },
    {
        id: "demo-user-2",
        email: "ananya@example.com",
        full_name: "Ananya Iyer",
        role: "customer",
        kyc_status: "approved",
        wallet_balance: 7500,
        neural_sync_xp: 0,
        created_at: new Date().toISOString()
    },
    {
        id: "demo-user-3",
        email: "admin@consolezone.in",
        full_name: "Admin User",
        role: "admin",
        kyc_status: "approved",
        wallet_balance: 0,
        neural_sync_xp: 0,
        created_at: new Date().toISOString()
    }
];

export const DEMO_RENTALS = [
    {
        id: "rental-demo-1",
        user_id: "demo-user-123",
        product: {
            name: "PlayStation 5 Spiderman 2 Limited Edition",
            images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=300"]
        },
        console: {
            name: "PS5 Spiderman Edition",
            serial_number: "SN-000006",
            category: "PS5"
        },
        status: "active",
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "rental-demo-2",
        user_id: "demo-user-123",
        product: {
            name: "Xbox Series X",
            images: ["https://images.unsplash.com/photo-1621259182902-885437815cf1?q=80&w=300"]
        },
        console: {
            name: "Xbox Series X",
            serial_number: "XB-778899",
            category: "XBOX"
        },
        status: "completed",
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
];
