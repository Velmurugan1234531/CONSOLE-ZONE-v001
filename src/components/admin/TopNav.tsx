"use client";

import { Bell, Search, Settings, ChevronRight, Menu, Home, Zap, Loader2, AlertCircle, Clock, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CommandPalette } from "./CommandPalette";
import { getNotificationCounts } from "@/services/admin";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export function TopNav() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);
    const [counts, setCounts] = useState({ rentals: 0, kyc: 0, total: 0 });
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const res = await getNotificationCounts();
                setCounts(res);
            } catch (err) {
                console.error(err);
            }
        };
        loadCounts();

        // Refresh every 30 seconds
        const interval = setInterval(loadCounts, 30000);

        const handleClickOutside = (e: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-[#0a0a0a]/80 px-6 backdrop-blur w-full">
            {/* Mobile Menu Trigger (Hidden on Desktop for now, can be implemented later) */}
            <button className="md:hidden p-2 text-gray-400 hover:text-white">
                <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                <Link href="/admin" className="flex items-center gap-2 hover:text-white transition-colors group">
                    <Home size={14} className="group-hover:scale-110 transition-transform" />
                    <span>Admin</span>
                </Link>
                {segments.slice(1).map((segment, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <ChevronRight size={10} className="text-gray-700 font-bold" />
                        <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/5 italic">
                            {segment.replace(/-/g, ' ')}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex-1" />

            {/* Command Palette Trigger */}
            <div className="flex-1 max-w-md mx-6">
                <div className="relative group cursor-pointer" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-[#8B5CF6] transition-colors" size={16} />
                    <div className="h-10 w-full rounded-2xl border border-white/5 bg-white/5 flex items-center pl-11 pr-4 text-xs text-gray-400 group-hover:border-[#8B5CF6]/30 transition-all select-none">
                        <span>Search any subsystem...</span>
                        <div className="ml-auto flex items-center gap-1 opacity-60">
                            <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px]">CTRL</span>
                            <span className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px]">K</span>
                        </div>
                    </div>
                </div>
                <CommandPalette />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Bell size={20} />
                        {counts.total > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-[#0a0a0a] flex items-center justify-center animate-pulse">
                                {counts.total}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                            >
                                <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest italic">Operations Alert</h3>
                                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">Live Feed</span>
                                </div>

                                <div className="max-h-[350px] overflow-y-auto p-2">
                                    {counts.total === 0 ? (
                                        <div className="py-12 text-center space-y-3">
                                            <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-600">
                                                <Zap size={20} />
                                            </div>
                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">System Nominal • No Alerts</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {counts.rentals > 0 && (
                                                <Link
                                                    href="/admin/rentals"
                                                    onClick={() => setShowNotifications(false)}
                                                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                                        <Clock size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white group-hover:text-[#8B5CF6] transition-colors">{counts.rentals} Active Rentals</p>
                                                        <p className="text-[10px] text-gray-500 mt-1">Pending return checks and validation.</p>
                                                    </div>
                                                </Link>
                                            )}
                                            {counts.kyc > 0 && (
                                                <Link
                                                    href="/admin/users"
                                                    onClick={() => setShowNotifications(false)}
                                                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center shrink-0">
                                                        <ShieldCheck size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white group-hover:text-[#8B5CF6] transition-colors">{counts.kyc} Pending KYC</p>
                                                        <p className="text-[10px] text-gray-500 mt-1">New identity documents awaiting review.</p>
                                                    </div>
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href="/admin/notifications"
                                    onClick={() => setShowNotifications(false)}
                                    className="block p-3 text-center bg-white/[0.03] hover:bg-white/[0.05] border-t border-white/5 transition-all"
                                >
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B5CF6]">Access All Command Nodes</span>
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
                    <Settings size={20} />
                </button>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-2">
                    <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10">
                        <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100"
                            alt="Admin"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="hidden md:block">
                        <p className="text-xs font-bold text-white">Admin User</p>
                        <p className="text-[10px] text-gray-500">Super Admin</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
