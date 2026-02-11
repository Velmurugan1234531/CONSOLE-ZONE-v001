"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Tag,
    Truck,
    ShieldCheck,
    Search,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Loader2,
    Package,
    MapPin,
    Wallet
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { usePageSEO } from "@/hooks/use-seo";
import { getProducts } from "@/services/products";
import { Product } from "@/types";

interface SellItem {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    image: string;
    quantity: number;
}

const SUPPORTED_PINCODES = [600020, 560001, 400001, 110001, 700001, 500001]; // Dummy supported metros

import PageHero from "@/components/layout/PageHero";
import { VisualsService, VisualSettings } from "@/services/visuals";

export default function SellPage() {
    usePageSEO('sell');

    // State
    const [items, setItems] = useState<SellItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [visualSettings, setVisualSettings] = useState<VisualSettings | null>(null);

    const [sellCart, setSellCart] = useState<SellItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [pincode, setPincode] = useState("");
    const [isPincodeChecked, setIsPincodeChecked] = useState(false);
    const [isServiceable, setIsServiceable] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const loadVisuals = async () => {
            const settings = await VisualsService.getSettings();
            setVisualSettings(settings);
        };
        loadVisuals();
    }, []);

    const totalValue = sellCart.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);

    // Load Items from Backend
    useEffect(() => {
        const load = async () => {
            try {
                const products = await getProducts('trade-in');

                // Map Product to SellItem
                const mappedItems: SellItem[] = products.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    basePrice: p.price,
                    image: p.images?.[0] || (p as any).image || "/images/products/ps5.png",
                    quantity: 1
                }));

                setItems(mappedItems);
            } catch (error) {
                console.error("Failed to load sell items", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const addToCart = (item: SellItem) => {
        setSellCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setSellCart(sellCart.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setSellCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const checkPincode = () => {
        const pin = parseInt(pincode);
        const serviceable = SUPPORTED_PINCODES.some(p => Math.floor(p / 1000) === Math.floor(pin / 1000));
        setIsServiceable(serviceable);
        setIsPincodeChecked(true);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const filteredItems = items.filter(item => {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#050505] text-white selection:bg-[#A855F7] selection:text-white pb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto bg-[#0A0A0A] border border-[#A855F7]/30 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.15)] mt-32"
                >
                    <div className="w-20 h-20 bg-[#A855F7]/20 rounded-full flex items-center justify-center mx-auto border border-[#A855F7]/30">
                        <CheckCircle2 size={40} className="text-[#A855F7]" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black uppercase italic">Pickup Scheduled!</h2>
                        <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">Our agent will contact you within 24 hours for verification and payout initiation.</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-[#A855F7] text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:text-black transition-all"
                    >
                        DONE
                    </button>
                </motion.div>
            </div>
        );
    }


    return (
        <div className="min-h-screen relative bg-[#050505] text-white">
            <PageHero
                title={visualSettings?.pageContent?.sell_title || "CASH FOR CLUTTER"}
                subtitle={visualSettings?.pageContent?.sell_subtitle || "Get instant valuation for your pre-owned consoles and controllers."}
                images={visualSettings?.pageBackgrounds?.sell || []}
                height="100vh"
            />

            <div className="text-white pb-20">


                <div className="px-4 sm:px-6 lg:px-8 w-full max-w-none mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Side: Item Selection */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Search & Pincode Checker */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="WHAT ARE YOU SELLING? (E.G. PS5, XBOX...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:border-[#A855F7]/50 transition-all uppercase tracking-widest"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-grow">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="ENTER PINCODE"
                                        maxLength={6}
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-gray-600 focus:outline-none focus:border-[#A855F7]/50 transition-all uppercase tracking-widest"
                                    />
                                </div>
                                <button
                                    onClick={checkPincode}
                                    disabled={pincode.length !== 6}
                                    className="bg-white/5 hover:bg-[#A855F7] hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-gray-400 px-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                                >
                                    Check
                                </button>
                            </div>
                        </div>

                        {/* Serviceability Status */}
                        <AnimatePresence>
                            {isPincodeChecked && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={`rounded-2xl p-4 flex items-center gap-3 ${isServiceable ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
                                >
                                    {isServiceable ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-sm font-bold uppercase tracking-wide">
                                        {isServiceable ? "Great news! We offer pickup in your area." : "Sorry! We aren't in this area yet."}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Results Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {loading ? (
                                <div className="col-span-full py-20 flex justify-center text-[#A855F7]"><Loader2 className="animate-spin" size={32} /></div>
                            ) : filteredItems.length === 0 ? (
                                <div className="col-span-full py-10 text-center text-gray-500 text-sm uppercase tracking-wide">
                                    No items found matching your search.
                                </div>
                            ) : (
                                filteredItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layoutId={item.id}
                                        className={`relative group bg-[#0A0A0A] border ${sellCart.find(i => i.id === item.id) ? 'border-[#A855F7] bg-[#A855F7]/5' : 'border-white/10 hover:border-white/20'} rounded-3xl p-4 flex items-center gap-4 cursor-pointer transition-all overflow-hidden`}
                                        onClick={() => addToCart(item)}
                                    >
                                        {/* Selection Indicator */}
                                        {sellCart.find(i => i.id === item.id) && (
                                            <div className="absolute top-4 right-4 text-[#A855F7]">
                                                <CheckCircle2 size={20} fill="currentColor" className="text-black" />
                                            </div>
                                        )}

                                        <div className="w-20 h-20 bg-[#121212] rounded-2xl flex items-center justify-center p-2 shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">{item.category}</p>
                                            <h3 className="font-bold text-white uppercase tracking-tight truncate pr-8">{item.name}</h3>
                                            <p className="text-gray-400 text-xs mt-1">
                                                UP TO <span className="text-white font-black">{formatCurrency(item.basePrice)}</span>
                                            </p>
                                        </div>

                                        {!sellCart.find(i => i.id === item.id) && (
                                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#A855F7] group-hover:bg-[#A855F7] group-hover:text-black transition-all">
                                                <Tag size={14} />
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Side: Sell Cart */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sticky top-24 space-y-6 shadow-2xl">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 italic">
                                    SELL <span className="text-[#A855F7]">CART</span>
                                    <span className="text-[10px] bg-[#A855F7]/20 px-2 py-0.5 rounded-full not-italic tracking-normal">{sellCart.length}</span>
                                </h2>
                                {sellCart.length > 0 && (
                                    <button onClick={() => setSellCart([])} className="text-gray-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 no-scrollbar">
                                {sellCart.length > 0 ? (
                                    sellCart.map(item => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5"
                                        >
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] font-bold text-white truncate uppercase">{item.name}</div>
                                                <div className="text-[9px] font-black text-[#A855F7]">{formatCurrency(item.basePrice * item.quantity)}</div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white transition-colors text-xs font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white transition-colors text-xs font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 space-y-4">
                                        <Package size={40} className="mx-auto text-gray-700" />
                                        <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Cart is looking empty, gamer.</p>
                                    </div>
                                )}
                            </div>

                            {sellCart.length > 0 && (
                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Estimated Value</div>
                                            <div className="text-3xl font-black italic text-[#A855F7] drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">{formatCurrency(totalValue)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[8px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-black tracking-tighter uppercase">Instant Payout</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase">
                                            <ShieldCheck size={12} className="text-[#A855F7]" />
                                            Prices are subject to physical verification
                                        </div>
                                        <button
                                            onClick={handleFinalSubmit}
                                            disabled={isSubmitting || !isServiceable}
                                            className="w-full py-4 bg-[#A855F7] hover:bg-[#9333EA] text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-[#A855F7]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> INITIATING...</> : <>GET QUOTE & PICKUP <ChevronRight size={18} /></>}
                                        </button>
                                        {!isServiceable && isPincodeChecked && (
                                            <p className="text-[8px] text-red-500 text-center font-bold uppercase tracking-widest">Pickup not available for this Pincode</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Steps Section */}
                <section className="px-4 sm:px-6 lg:px-8 w-full max-w-none mx-auto mt-32">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { icon: <Search />, title: "Request Quote", desc: "Select your gear and get an instant value estimate." },
                            { icon: <ShieldCheck />, title: "Verification", desc: "Our agent verifies the product condition at your doorstep." },
                            { icon: <Truck />, title: "Pickup", desc: "Free pickup from your home at your preferred time." },
                            { icon: <Wallet />, title: "Instant Payment", desc: "Get paid instantly via UPI or Bank Transfer after verification." },
                        ].map((step, i) => (
                            <div key={i} className="bg-[#0A0A0A] p-8 rounded-3xl border border-white/5 space-y-4 hover:border-[#A855F7]/30 transition-all">
                                <div className="w-12 h-12 bg-[#A855F7]/10 rounded-2xl flex items-center justify-center border border-[#A855F7]/20 text-[#A855F7]">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-tight">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
