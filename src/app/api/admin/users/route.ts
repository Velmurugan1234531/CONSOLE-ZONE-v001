import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, fullName, role } = body;

        // Note: usage of Service Role Key to bypass RLS and use Auth Admin API
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Create Auth User
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (userError) throw userError;

        if (userData.user) {
            // 2. Create Profile Entry (if trigger doesn't handle it, or to set extra fields)
            // Assuming we have a trigger, we might just update it. 
            // If NO trigger, we insert. Let's assume we might need to update the role.

            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userData.user.id,
                    full_name: fullName,
                    email: email, // If schema has email column
                    role: role || 'customer',
                    updated_at: new Date().toISOString()
                });

            if (profileError) {
                console.error("Profile creation warning:", profileError);
                // Don't fail the whole request if auth succeeded, but warn
            }
        }

        return NextResponse.json({ success: true, user: userData.user });

    } catch (error: any) {
        console.error("User creation failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
