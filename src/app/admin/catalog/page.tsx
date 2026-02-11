"use client";

import { useState, useEffect } from "react";
import { Settings, DollarSign, ToggleLeft, ToggleRight, Gamepad2, Star, Save, RefreshCw } from "lucide-react";
import { getCatalogSettings, updateCatalogSettings, CatalogSettings } from "@/services/catalog";
import { motion } from "framer-motion";

export default function CatalogSettingsPage() {
    const [settings, setSettings] = useState<CatalogSettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getCatalogSettings();
            setSettings(data);
        } catch (error) {
            console.error("Failed to load catalog settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (category: string, updates: Partial<CatalogSettings>) => {
        setSaving(category);
        try {
            await updateCatalogSettings(category, updates);
            await loadSettings();
            alert("Settings updated successfully!");
        } catch (error) {
            console.error("Failed to update settings:", error);
            alert("Error updating settings");
        } finally {
            setSaving(null);
        }
    };

    const toggleField = (category: string, field: keyof CatalogSettings) => {
        const setting = settings.find(s => s.device_category === category);
        if (setting) {
            handleUpdate(category, { [field]: !setting[field] });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-white">Loading catalog settings...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-wider text-white mb-2">
                            Catalog Management
                        </h1>
                        <p className="text-sm text-gray-400">
                            Configure device availability, pricing, and controller limits
                        </p>
                    </div>
                    <button
                        onClick={loadSettings}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 rounded-xl text-[#8B5CF6] transition-all"
                    >
                        <RefreshCw size={16} />
                        <span className="text-sm font-bold">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Device Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {settings.map((setting) => (
                    <motion.div
                        key={setting.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 space-y-6 relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 blur-[60px] -z-10"></div>

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-wide text-white">
                                    {setting.device_category}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Display Order: {setting.display_order}
                                </p>
                            </div>
                            {setting.is_featured && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <Star size={12} className="text-amber-500" fill="currentColor" />
                                    <span className="text-[9px] font-black uppercase text-amber-500">Featured</span>
                                </div>
                            )}
                        </div>

                        {/* Availability Toggle */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Settings size={16} className="text-gray-400" />
                                <span className="text-sm font-bold text-white">Available for Rent</span>
                            </div>
                            <button
                                onClick={() => toggleField(setting.device_category, 'is_enabled')}
                                disabled={saving === setting.device_category}
                                className="transition-transform hover:scale-110"
                            >
                                {setting.is_enabled ? (
                                    <ToggleRight size={32} className="text-emerald-500" />
                                ) : (
                                    <ToggleLeft size={32} className="text-gray-600" />
                                )}
                            </button>
                        </div>

                        {/* Featured Toggle */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Star size={16} className="text-gray-400" />
                                <span className="text-sm font-bold text-white">Featured Device</span>
                            </div>
                            <button
                                onClick={() => toggleField(setting.device_category, 'is_featured')}
                                disabled={saving === setting.device_category}
                                className="transition-transform hover:scale-110"
                            >
                                {setting.is_featured ? (
                                    <ToggleRight size={32} className="text-amber-500" />
                                ) : (
                                    <ToggleLeft size={32} className="text-gray-600" />
                                )}
                            </button>
                        </div>

                        {/* Controller Settings */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500">
                                <Gamepad2 size={14} />
                                <span>Controller Settings</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-2">
                                        Max Controllers
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="4"
                                        value={setting.max_controllers}
                                        onChange={(e) => handleUpdate(setting.device_category, { max_controllers: Number(e.target.value) })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-[#8B5CF6]/50"
                                    />
                                </div>

                                <div className="p-3 bg-white/5 rounded-lg flex flex-col justify-between">
                                    <label className="text-[9px] font-black uppercase text-gray-500 block mb-2">
                                        Extra Controllers
                                    </label>
                                    <button
                                        onClick={() => toggleField(setting.device_category, 'extra_controller_enabled')}
                                        disabled={saving === setting.device_category}
                                        className="self-start"
                                    >
                                        {setting.extra_controller_enabled ? (
                                            <ToggleRight size={24} className="text-emerald-500" />
                                        ) : (
                                            <ToggleLeft size={24} className="text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500">
                                <DollarSign size={14} />
                                <span>Rental Rates</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <label className="text-[8px] font-black uppercase text-gray-500 block mb-1">Daily</label>
                                    <div className="text-sm font-bold text-white">₹{setting.daily_rate}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <label className="text-[8px] font-black uppercase text-gray-500 block mb-1">Weekly</label>
                                    <div className="text-sm font-bold text-white">₹{setting.weekly_rate}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <label className="text-[8px] font-black uppercase text-gray-500 block mb-1">Monthly</label>
                                    <div className="text-sm font-bold text-white">₹{setting.monthly_rate}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <label className="text-[8px] font-black uppercase text-gray-500 block mb-1">Controller/Day</label>
                                    <div className="text-sm font-bold text-white">₹{setting.controller_daily_rate}</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg">
                                    <label className="text-[8px] font-black uppercase text-gray-500 block mb-1">Controller/Week</label>
                                    <div className="text-sm font-bold text-white">₹{setting.controller_weekly_rate}</div>
                                </div>
                            </div>
                        </div>

                        {/* Saving Indicator */}
                        {saving === setting.device_category && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                                <div className="flex items-center gap-2 text-white">
                                    <RefreshCw size={16} className="animate-spin" />
                                    <span className="text-sm font-bold">Saving...</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
