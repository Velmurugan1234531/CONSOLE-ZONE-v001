"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Box, Shield, AlertTriangle, ChevronRight, Activity } from "lucide-react";

interface Mission {
    id: string;
    item_name: string;
    return_date: string;
    status: 'active' | 'overdue' | 'shipped';
    image_url: string;
}

interface MissionTrackerProps {
    missions: Mission[];
}

export default function MissionTracker({ missions }: MissionTrackerProps) {
    const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft: { [key: string]: string } = {};
            missions.forEach(mission => {
                const now = new Date().getTime();
                const target = new Date(mission.return_date).getTime();
                const difference = target - now;

                if (difference <= 0) {
                    newTimeLeft[mission.id] = "MISSION_EXPIRED";
                } else {
                    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                    const secs = Math.floor((difference % (1000 * 60)) / 1000);
                    newTimeLeft[mission.id] = `${days}D ${hours}H ${mins}M ${secs}S`;
                }
            });
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearInterval(timer);
    }, [missions]);

    if (missions.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#A855F7] animate-pulse" />
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Active Mission Overwatch</h2>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-[#A855F7] bg-[#A855F7]/10 px-2 py-1 rounded border border-[#A855F7]/20">
                    Uplink: Live
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {missions.map((mission) => (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden hover:border-[#A855F7]/30 transition-all"
                        >
                            {/* Decorative scan line */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#A855F7]/50 group-hover:bg-[#A855F7] transition-colors" />

                            <div className="p-4 flex gap-4">
                                <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden shrink-0 border border-white/10 group-hover:border-[#A855F7]/30 transition-all">
                                    <img
                                        src={mission.image_url}
                                        alt={mission.item_name}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xs font-black text-white uppercase italic tracking-wider">{mission.item_name}</h3>
                                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Unit ID: {mission.id.slice(0, 8)}</p>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${mission.status === 'overdue' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            }`}>
                                            {mission.status}
                                        </div>
                                    </div>

                                    {/* Tactical Progress Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-600">
                                            <span>Sync Timer</span>
                                            <span className="text-[#A855F7] font-mono">{timeLeft[mission.id] || "Calculating..."}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="h-full bg-gradient-to-r from-[#A855F7] to-blue-500"
                                                style={{ width: '65%' }} // Simulated progress
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white transition-all border border-white/5 flex items-center justify-center gap-1">
                                            <Shield size={10} /> Sync Status
                                        </button>
                                        <button className="px-3 py-1.5 bg-[#A855F7]/10 hover:bg-[#A855F7]/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-[#A855F7] transition-all border border-[#A855F7]/20">
                                            Report Issue
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect - Tactical Data Overlay */}
                            <div className="absolute inset-0 bg-[#A855F7]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
