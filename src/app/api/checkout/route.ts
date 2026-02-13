import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// Robust key handling avoiding strict '!' to prevent crash if env is missing
const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

const isConfigured = !!(
    key_id &&
    key_secret &&
    key_id !== 'YOUR_RAZORPAY_KEY_ID' &&
    !key_id.includes('DEMO')
);

if (!isConfigured) {
    console.warn("⚠️  RAZORPAY NOT CONFIGURED - Running in DEMO mode.");
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
                created_at: Math.floor(Date.now() / 1000),
                demoMode: true
            });
        }

        if (isNaN(amount)) {
            return NextResponse.json(
                { error: "Invalid Amount: Received NaN" },
                { status: 400 }
            );
        }

        // LIVE MODE: Create actual Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        try {
            const order = await razorpay.orders.create(options);
            return NextResponse.json(order);
        } catch (razorpayError: any) {
            console.error("Razorpay API Call Failed:", razorpayError);

            // If it's an authentication error, imply invalid keys
            if (razorpayError.statusCode === 401) {
                return NextResponse.json(
                    { error: "Invalid Razorpay Credentials", details: razorpayError, demoMode: true },
                    { status: 401 }
                );
            }

            throw razorpayError; // Re-throw to be caught by outer catch for 500
        }
    } catch (error: any) {
        console.error("Payment Route Error:", error);

        // Construct a safe error object
        const safeError = {
            message: error.message || "Unknown Error",
            code: error.code || error.statusCode || "INTERNAL_SERVER_ERROR",
            description: error.description || error.error?.description
        };

        return NextResponse.json(
            { error: safeError.message, details: safeError },
            { status: error.statusCode || 500 }
        );
    }
}
