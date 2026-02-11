import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    // Basic security check (e.g., Cron secret)
    // const authHeader = req.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

    try {
        const supabase = await createClient();

        // 1. Check for overdue rentals
        const now = new Date().toISOString();
        const { data: overdueRentals, error } = await supabase
            .from('rentals')
            .select('id, end_date')
            .eq('status', 'active')
            .lt('end_date', now);

        if (overdueRentals && overdueRentals.length > 0) {
            const ids = overdueRentals.map(r => r.id);

            // Update status to 'overdue'
            await supabase
                .from('rentals')
                .update({ status: 'overdue' })
                .in('id', ids);

            // In a real app, send emails here
            // await sendOverdueEmails(ids);
        }

        return NextResponse.json({
            success: true,
            processed: overdueRentals?.length || 0,
            message: "Automation checks completed."
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Automation failed' }, { status: 500 });
    }
}
