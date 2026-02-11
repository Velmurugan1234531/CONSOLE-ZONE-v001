"use client";

import { createClient } from "@/utils/supabase/client";
import { Loader2, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AuthButton() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium">
                <Loader2 size={16} className="animate-spin text-[#A855F7]" />
            </div>
        );
    }

    if (user) {
        return (
            <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-[#A855F7]/10 hover:bg-[#A855F7]/20 border border-[#A855F7]/20 rounded-lg text-sm font-bold transition-all text-white group"
            >
                <div className="w-5 h-5 rounded-full bg-[#A855F7] flex items-center justify-center text-[10px] text-white overflow-hidden">
                    {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <User size={12} />
                    )}
                </div>
                <span className="max-w-[100px] truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
            </Link>
        );
    }

    return (
        <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-white"
        >
            <LogIn size={16} className="text-[#A855F7]" />
            Login
        </Link>
    );
}
