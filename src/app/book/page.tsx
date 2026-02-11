"use client";

import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import { motion } from "framer-motion";

export default function BookPage() {
    return (
        <main className="min-h-screen bg-[#050505] flex flex-col pt-16 md:flex-row">
            {/* Left Panel: Visuals & Context */}
            <div className="md:w-1/2 lg:w-5/12 bg-[#0A0A0A] relative overflow-hidden flex flex-col justify-center p-8 md:p-12 lg:p-20">
                {/* Background Texture/Gradient */}
                {/* Background Texture/Gradient Removed */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/backgrounds/bg-1.jpg"
                        alt="Gaming"
                        className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-[#050505]" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 space-y-8"
                >
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
                            START YOUR <br />
                            <span className="text-[#A855F7] drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">NEXT ADVENTURE</span>
                        </h1>
                        <p className="text-gray-400 text-lg md:text-xl max-w-md leading-relaxed">
                            Experience premium gaming on your terms. Select your dates and let us handle the rest.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 text-white/80">
                            <div className="w-10 h-10 rounded-full bg-[#A855F7]/10 flex items-center justify-center text-[#A855F7]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <span className="font-bold text-sm tracking-wide">Insured & Secure Equipment</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/80">
                            <div className="w-10 h-10 rounded-full bg-[#A855F7]/10 flex items-center justify-center text-[#A855F7]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                            <span className="font-bold text-sm tracking-wide">24/7 Support & Fast Delivery</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Panel: Booking Form */}
            <div className="md:w-1/2 lg:w-7/12 bg-[#050505] flex flex-col justify-center p-4 md:p-8 lg:p-12 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full max-w-2xl mx-auto"
                >
                    <BookingForm />
                </motion.div>
            </div>
        </main>
    );
}
