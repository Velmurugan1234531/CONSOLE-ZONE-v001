import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// Robust key handling avoiding strict '!' to prevent crash if env is missing
const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

const isConfigured = !!(key_id && key_secret && key_id !== 'YOUR_RAZORPAY_KEY_ID');

if (!isConfigured) {
    console.warn("⚠️  RAZORPAY NOT CONFIGURED - Running in DEMO mode. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local for live payments.");
}

const razorpay = isConfigured ? new Razorpay({
    key_id: key_id!,
    key_secret: key_secret!,
}) : null;

export async function POST(request: Request) {
    try {
        const { amount, currency = "INR" } = await request.json();

        if (!amount) {
            return NextResponse.json(
                { error: "Amount is required" },
                { status: 400 }
            );
        }

        // DEMO MODE: Return mock order when Razorpay isn't configured
        if (!isConfigured || !razorpay) {
            console.log("🎮 DEMO MODE: Simulating payment order creation");
            return NextResponse.json({
                id: `demo_order_${Date.now()}`,
                entity: "order",
                amount: Math.round(amount * 100),
                amount_paid: 0,
                amount_due: Math.round(amount * 100),
                currency,
                receipt: `demo_receipt_${Date.now()}`,
                status: "created",
                attempts: 0,
                notes: { demo: "true" },
                created_at: Math.floor(Date.now() / 1000)
            });
        }

        // LIVE MODE: Create actual Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
