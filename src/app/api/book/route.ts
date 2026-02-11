import { NextResponse } from "next/server";
import { BookingLogic } from "@/services/booking-logic";
import { createClient } from "@/utils/supabase/server";
import { PLANS } from "@/constants";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            userId, // Ideally from session, but passed for now if auth not fully integrated
            // OR use: const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser();
            productCategory, // 'PS5', 'Xbox'
            planId, // 'daily', 'weekly'
            startDate,
            endDate,
            deliveryType, // 'DELIVERY', 'PICKUP'
            address,
            addons
        } = body;

        // Basic validation
        if (!productCategory || !startDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // 1. Validate User Constraints (if userId provided)
        if (userId) {
            try {
                const constraints = await BookingLogic.validateUserConstraints(userId);
                if (deliveryType === 'PICKUP' && !constraints.canPickup) {
                    return NextResponse.json({ error: "Pickup not available for your account type." }, { status: 403 });
                }
            } catch (e) {
                // Ignore if user lookup fails for guest checkout (if allowed)
                console.warn("User validation skipped or failed", e);
            }
        }

        // 2. Find Available Console (Tetris Logic)
        const consoleId = await BookingLogic.findAvailableConsole(productCategory, start, end);

        if (!consoleId) {
            return NextResponse.json({
                error: "No consoles available for these dates.",
                available: false
            }, { status: 409 });
        }

        // 3. Create Booking Record
        // 3. Create Rental Record (Unified with Admin System)
        const supabase = await createClient();

        // 3a. Resolve Product ID for the category (needed for rentals table)
        // Try to find a product that matches the category
        const { data: product } = await supabase
            .from('products')
            .select('id')
            .ilike('category', `%${productCategory}%`)
            .limit(1)
            .maybeSingle();

        // 3b. Insert into Rentals
        // Format Notes to include Guest Details if applicable
        let noteContent = `Delivery: ${deliveryType}, Address: ${address}`;
        if (!userId || userId === 'guest') {
            const guestInfo = `[GUEST] Name: ${body.firstName} ${body.lastName} | Mobile: ${body.mobile} | Email: ${body.email}`;
            noteContent = `${guestInfo} || ${noteContent}`;
        }

        const { data: rental, error } = await supabase
            .from('rentals')
            .insert({
                user_id: (userId && userId !== 'guest') ? userId : null, // Handle guest later or assume auth
                console_id: consoleId,
                product_id: product?.id,
                plan_id: planId, // Save the Plan ID
                start_date: start.toISOString(),
                end_date: end.toISOString(),
                status: 'active', // Active immediately upon booking for this flow
                payment_status: 'paid', // Assuming paid via Razorpay before this call if finalized
                total_price: body.totalAmount || 0,
                notes: noteContent,
                addons: addons // Save Addons (JSONB)
            })
            .select()
            .single();

        if (error) {
            console.error("Rental Insert Error:", error);
            return NextResponse.json({ error: "Failed to create rental record" }, { status: 500 });
        }

        // 4. Update Console Status to RENTED
        // This ensures it doesn't get picked again and shows in Fleet Manager
        await supabase
            .from('consoles')
            .update({ status: 'RENTED' })
            .eq('console_id', consoleId);

        // 5. Record Addons (if table supports rental_id, otherwise skip or adapt)
        // Assuming addons table might link to bookings. If so, we might need a bridge.
        // For now, logging usage.
        if (addons && addons.length > 0) {
            console.log("Addons for rental:", rental.id, addons);
            // Implement addons insertion if rentals_addons exists
        }

        return NextResponse.json({
            success: true,
            bookingId: rental.id, // Using rental.id as bookingId for frontend compatibility
            consoleId: consoleId,
            message: "Booking confirmed!"
        });

    } catch (error) {
        console.error("Booking API Error:", error);
        return NextResponse.json({ error: "Internal System Error" }, { status: 500 });
    }
}
