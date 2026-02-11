"use client";

import { useState, useEffect } from "react";
import {
    Globe,
    Lock,
    Zap,
    Percent,
    Tag,
    AlertTriangle,
    Type,
    ImageIcon,
    Save,
    Megaphone,
    Search,
    Download,
    RefreshCw,
    Trash2,
    Gamepad2,
    LucideIcon,
    Info,
    DollarSign,
    Truck,
    Cpu,
    Activity,
    Shield,
    Terminal,
    Radio,
    Key,
    Database,
    LayoutDashboard,
    ShoppingBag,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Monitor,
    CreditCard
} from "lucide-react";
import { getMarketplaceSettings, saveMarketplaceSettings, resetMarketplaceSettings, type MarketplaceSettings } from '@/services/marketplace-settings';
import { getSiteSettings, saveSiteSettings, resetSiteSettings, fetchSiteSettings, type SiteSettings } from '@/services/site-settings';
import { getBusinessSettings, saveBusinessSettings, resetBusinessSettings, type BusinessSettings } from '@/services/business-settings';
import { motion, AnimatePresence } from "framer-motion";
import { getAllDevices, getSystemMetrics, getFleetAnalytics, getRevenueAnalytics } from "@/services/admin";
import { Device } from "@/types";
import { NexusTerminal } from "@/components/admin/NexusTerminal";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, BarChart, Bar
} from 'recharts';

export default function MasterControlPage() {
    const [activeTab, setActiveTab] = useState("system");
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);


    // Marketplace Settings State
    const [marketplaceSettings, setMarketplaceSettings] = useState<MarketplaceSettings>(getMarketplaceSettings());

    // Site Settings State (Starts with cached/default, then fetches)
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());

    // Business Settings State
    const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(getBusinessSettings());

    // Fleet Metrics
    const [devices, setDevices] = useState<Device[]>([]);
    const [fleetHealth, setFleetHealth] = useState(0);

    // System Nexus State
    const [systemMetrics, setSystemMetrics] = useState<any>(null);
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const [fleetAnalytics, setFleetAnalytics] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [settings, allDevices, metrics, fleetStats, revenue] = await Promise.all([
                    fetchSiteSettings(),
                    getAllDevices(),
                    getSystemMetrics(),
                    getFleetAnalytics(),
                    getRevenueAnalytics(7)
                ]);
                setSiteSettings(settings);
                setDevices(allDevices);
                setSystemMetrics(metrics);
                setFleetAnalytics(fleetStats);
                setRevenueData(revenue.data);

                // Calculate average health
                if (allDevices.length > 0) {
                    const avg = allDevices.reduce((acc: number, d: Device) => acc + (d.health || 0), 0) / allDevices.length;
                    setFleetHealth(Math.round(avg));
                }
            } finally {
                setIsLoadingSettings(false);
            }
        };
        load();
    }, []);

    // SEO Settings State
    const [selectedSeoPage, setSelectedSeoPage] = useState('home');

    // Save All Settings
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const handleSaveSettings = async () => {
        setSaveStatus('saving');
        try {
            saveMarketplaceSettings(marketplaceSettings);
            await saveSiteSettings(siteSettings);
            saveBusinessSettings(businessSettings);

            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 5000);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-10 space-y-10 custom-scrollbar overflow-x-hidden">
            {/* HUD Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6]/20 via-[#8B5CF6]/20 to-[#3B82F6]/20 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-[#3B82F6]/5 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                    <Cpu size={32} className="text-[#3B82F6] animate-pulse" />
                                </div>
                                <div>
                                    <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                                        MASTER <span className="text-[#3B82F6]">CONTROL</span>
                                    </h1>
                                    <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em] mt-2 ml-1">Central Intelligence Hub // V4.2.0</p>
                                </div>
                            </div>

                            {/* HUD Indicators */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <HUDIndicator
                                    label="Fleet Signal"
                                    value={`${devices.length} UNITS ONLINE`}
                                    active={devices.length > 0}
                                    color="emerald"
                                />
                                <HUDIndicator
                                    label="Integrity Core"
                                    value={`${fleetHealth}% SYNC`}
                                    active={fleetHealth > 80}
                                    color={fleetHealth > 80 ? "blue" : "red"}
                                />
                                <HUDIndicator
                                    label="System Status"
                                    value={siteSettings.maintenanceMode ? "OFFLINE" : "OPERATIONAL"}
                                    active={!siteSettings.maintenanceMode}
                                    color={siteSettings.maintenanceMode ? "red" : "emerald"}
                                />
                                <HUDIndicator
                                    label="Launch Protocols"
                                    value={siteSettings.holidayMode ? "PAUSED" : "ACTIVE"}
                                    active={!siteSettings.holidayMode}
                                    color={siteSettings.holidayMode ? "orange" : "blue"}
                                />
                                <HUDIndicator
                                    label="SEO Transmission"
                                    value="ENCRYPTED"
                                    active={true}
                                    color="purple"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[300px]">
                            <button
                                onClick={handleSaveSettings}
                                disabled={saveStatus === 'saving'}
                                className={`group relative px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all active:scale-95 flex items-center justify-center gap-3 ${saveStatus === 'success' ? 'bg-emerald-500 text-white' :
                                    saveStatus === 'error' ? 'bg-red-500 text-white' :
                                        'bg-white text-black hover:bg-[#3B82F6] hover:text-white'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                                {saveStatus === 'saving' ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                <span>
                                    {saveStatus === 'saving' ? 'Pushing Updates...' :
                                        saveStatus === 'success' ? 'Protocol Saved' :
                                            saveStatus === 'error' ? 'Sync Failed' :
                                                'Push Master Config'}
                                </span>
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <RefreshCw size={12} /> Reload
                                </button>
                                <button onClick={() => {
                                    if (confirm('Wipe local settings cache?')) {
                                        resetSiteSettings();
                                        window.location.reload();
                                    }
                                }} className="flex-1 py-3 bg-red-500/5 border border-red-500/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                                    <Trash2 size={12} /> Purge
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <nav className="w-full lg:w-72 space-y-2 lg:sticky lg:top-10">
                    <NavTab id="system" icon={Zap} label="Launch Protocols" active={activeTab} onClick={setActiveTab} />
                    <NavTab id="transmission" icon={Radio} label="Transmission" active={activeTab} onClick={setActiveTab} />
                    <NavTab id="optimization" icon={Shield} label="Optimization" active={activeTab} onClick={setActiveTab} />
                    <NavTab id="nexus" icon={Terminal} label="System Nexus" active={activeTab} onClick={setActiveTab} />
                    <NavTab id="commerce" icon={DollarSign} label="Commerce Hub" active={activeTab} onClick={setActiveTab} />
                    <NavTab id="marketplace" icon={Tag} label="Trade-In Matrix" active={activeTab} onClick={setActiveTab} />
                    <NavTab id="security" icon={Lock} label="Admin Security" active={activeTab} onClick={setActiveTab} />
                </nav>

                <main className="flex-1 w-full min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {/* SYSTEM & LAUNCH CONTROL */}
                        {activeTab === 'system' && (
                            <motion.div key="system" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        <MasterSection title="Launch Momentum" description="Analytical trajectory of rental transmissions and revenue." icon={<Zap size={24} className="text-yellow-400" />}>
                                            <div className="h-[300px] w-full mt-6 bg-white/5 rounded-3xl p-6 border border-white/5">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={revenueData}>
                                                        <defs>
                                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                                        <XAxis dataKey="formattedDate" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                                        <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '10px' }}
                                                            itemStyle={{ color: '#fff' }}
                                                        />
                                                        <Area type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </MasterSection>
                                    </div>
                                    <div>
                                        <MasterSection title="Fleet Integrity" description="Health distribution across units." icon={<Shield size={24} className="text-emerald-400" />}>
                                            <div className="h-[300px] w-full flex items-center justify-center relative">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={fleetAnalytics?.healthDistribution || []}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {fleetAnalytics?.healthDistribution?.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '10px' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-black text-white">{fleetHealth}%</span>
                                                    <span className="text-[8px] text-gray-500 uppercase font-black">Avg Health</span>
                                                </div>
                                            </div>
                                        </MasterSection>
                                    </div>
                                </div>
                                <MasterSection title="Site Availability" description="Manage global accessibility states and public visibility." icon={<Zap size={24} className="text-orange-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ProtocolToggle
                                            title="Maintenance Protocol"
                                            description="Locks the entire storefront for maintenance. Public users will see a system-down message."
                                            active={siteSettings.maintenanceMode}
                                            onToggle={() => setSiteSettings({ ...siteSettings, maintenanceMode: !siteSettings.maintenanceMode })}
                                            color="red"
                                        />
                                        <ProtocolToggle
                                            title="Holiday Protocol"
                                            description="Pauses all new rental transmissions. Existing rentals remain unaffected but discovery is locked."
                                            active={siteSettings.holidayMode}
                                            onToggle={() => setSiteSettings({ ...siteSettings, holidayMode: !siteSettings.holidayMode })}
                                            color="orange"
                                        />
                                    </div>
                                </MasterSection>

                                <MasterSection title="Advanced Protocols" description="Bulk system overrides and global broadcasts." icon={<Terminal size={24} className="text-red-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <button
                                            onClick={() => alert('TRANSMITTING: Alpha Alert Broadcast initiated across all nodes.')}
                                            className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl hover:bg-red-500/10 transition-all text-left flex items-start gap-4 group"
                                        >
                                            <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                                                <Megaphone size={20} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-black uppercase text-red-500">Alpha Alert Broadcast</span>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Immediate high-priority message to all active users.</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => alert('EXECUTING: Global Fleet Sync. Core integrity verified.')}
                                            className="p-6 bg-[#3B82F6]/5 border border-[#3B82F6]/20 rounded-3xl hover:bg-[#3B82F6]/10 transition-all text-left flex items-start gap-4 group"
                                        >
                                            <div className="p-3 bg-[#3B82F6]/10 rounded-xl text-[#3B82F6] group-hover:scale-110 transition-transform">
                                                <RefreshCw size={20} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-black uppercase text-[#3B82F6]">Global Fleet Sync</span>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Force synchronize all hardware unit telemetry.</span>
                                            </div>
                                        </button>
                                    </div>
                                </MasterSection>

                                <MasterSection title="Diagnostic Overrides" description="Low-level administrative operations and cache management." icon={<Activity size={24} className="text-blue-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <CommandButton label="Verify DB Integrity" icon={Database} onClick={() => alert('TRANSMISSION SUCCESS: Database Signal 100% | Latency 12ms')} />
                                        <CommandButton label="Flush CDN Edge" icon={RefreshCw} onClick={() => alert('CACHE PURGED: Edge nodes wiped successfully.')} />
                                        <CommandButton label="Sync System Time" icon={Activity} onClick={() => alert('TIME SYNC: NTP server 162.159.200.1 verified.')} />
                                    </div>
                                </MasterSection>
                            </motion.div>
                        )}

                        {/* TRANSMISSION (TITLES, DESCRIPTION, ANNOUNCEMENTS) */}
                        {activeTab === 'transmission' && (
                            <motion.div key="transmission" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <MasterSection title="Brand Transmission" description="Global identifiers transmitted to client browsers." icon={<Radio size={24} className="text-[#8B5CF6]" />}>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <HUDInput
                                                label="Platform Hostname"
                                                value={siteSettings.siteTitle}
                                                onChange={(val) => setSiteSettings({ ...siteSettings, siteTitle: val })}
                                                placeholder="Console Zone"
                                            />
                                            <HUDInput
                                                label="Sub-Identity Tag"
                                                value={siteSettings.siteDescription}
                                                onChange={(val) => setSiteSettings({ ...siteSettings, siteDescription: val })}
                                                placeholder="Premium Gaming Hub"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Global Announcement Broadcaster</label>
                                                <Megaphone size={14} className="text-[#8B5CF6]" />
                                            </div>
                                            <textarea
                                                value={siteSettings.announcement}
                                                onChange={(e) => setSiteSettings({ ...siteSettings, announcement: e.target.value })}
                                                rows={4}
                                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-[#8B5CF6] transition-all resize-none font-mono text-sm leading-relaxed"
                                                placeholder="Message to display at the top of every page..."
                                            />
                                        </div>
                                    </div>
                                </MasterSection>
                            </motion.div>
                        )}

                        {/* OPTIMIZATION (SEO) */}
                        {activeTab === 'optimization' && (
                            <motion.div key="optimization" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <MasterSection title="SEO Protocols" description="Manage metadata and search engine visibility descriptors." icon={<Shield size={24} className="text-emerald-400" />}>
                                    <div className="space-y-8">
                                        <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-xl w-fit">
                                            {Object.keys(siteSettings.seo || {}).map(pageKey => (
                                                <button
                                                    key={pageKey}
                                                    onClick={() => setSelectedSeoPage(pageKey)}
                                                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedSeoPage === pageKey ? 'bg-[#3B82F6] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    {pageKey}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                                <Globe size={120} />
                                            </div>

                                            <h4 className="flex items-center gap-3 text-xs font-black uppercase text-gray-400 tracking-widest">
                                                <Globe size={16} className="text-[#3B82F6]" />
                                                Transmitting: <span className="text-white italic">{selectedSeoPage} metadata</span>
                                            </h4>

                                            <div className="space-y-6 relative z-10">
                                                <HUDInput
                                                    label="Meta Title Tag"
                                                    value={siteSettings.seo?.[selectedSeoPage]?.title || ''}
                                                    onChange={(val) => setSiteSettings({
                                                        ...siteSettings,
                                                        seo: {
                                                            ...siteSettings.seo,
                                                            [selectedSeoPage]: { ...siteSettings.seo[selectedSeoPage], title: val }
                                                        }
                                                    })}
                                                />
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Meta Description Protocol</label>
                                                    <textarea
                                                        value={siteSettings.seo?.[selectedSeoPage]?.description || ''}
                                                        onChange={(e) => setSiteSettings({
                                                            ...siteSettings,
                                                            seo: {
                                                                ...siteSettings.seo,
                                                                [selectedSeoPage]: { ...siteSettings.seo[selectedSeoPage], description: e.target.value }
                                                            }
                                                        })}
                                                        rows={3}
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#3B82F6] transition-all resize-none text-sm"
                                                    />
                                                </div>
                                                <HUDInput
                                                    label="Encrypted Keywords"
                                                    value={siteSettings.seo?.[selectedSeoPage]?.keywords || ''}
                                                    onChange={(val) => setSiteSettings({
                                                        ...siteSettings,
                                                        seo: {
                                                            ...siteSettings.seo,
                                                            [selectedSeoPage]: { ...siteSettings.seo[selectedSeoPage], keywords: val }
                                                        }
                                                    })}
                                                    placeholder="comma, separated, list"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </MasterSection>
                            </motion.div>
                        )}

                        {/* COMMERCE HUB */}
                        {activeTab === 'commerce' && (
                            <motion.div key="commerce" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <MasterSection title="Logistics Config" description="Manage physical transmission and threshold algorithms." icon={<Truck size={24} className="text-[#3B82F6]" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <HUDInput
                                            label="Base Transmission Fee (₹)"
                                            value={businessSettings.logistics.deliveryFee.toString()}
                                            onChange={(val) => setBusinessSettings({ ...businessSettings, logistics: { ...businessSettings.logistics, deliveryFee: Number(val) } })}
                                            type="number"
                                        />
                                        <HUDInput
                                            label="Free Logistics Threshold (₹)"
                                            value={businessSettings.logistics.freeDeliveryThreshold.toString()}
                                            onChange={(val) => setBusinessSettings({ ...businessSettings, logistics: { ...businessSettings.logistics, freeDeliveryThreshold: Number(val) } })}
                                            type="number"
                                        />
                                    </div>
                                </MasterSection>

                                <MasterSection title="Financial Protocols" description="Taxes, platform fees, and violation penalties." icon={<DollarSign size={24} className="text-emerald-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <HUDInput
                                            label="Global Tax Rate (%)"
                                            value={businessSettings.finance.taxRate.toString()}
                                            onChange={(val) => setBusinessSettings({ ...businessSettings, finance: { ...businessSettings.finance, taxRate: Number(val) } })}
                                            type="number"
                                        />
                                        <HUDInput
                                            label="Platform Fee (₹/Order)"
                                            value={businessSettings.finance.platformFee.toString()}
                                            onChange={(val) => setBusinessSettings({ ...businessSettings, finance: { ...businessSettings.finance, platformFee: Number(val) } })}
                                            type="number"
                                        />
                                        <HUDInput
                                            label="Violation Penalty (₹/Day)"
                                            value={businessSettings.finance.lateFeePerDay.toString()}
                                            onChange={(val) => setBusinessSettings({ ...businessSettings, finance: { ...businessSettings.finance, lateFeePerDay: Number(val) } })}
                                            type="number"
                                            className="!text-red-500"
                                        />
                                    </div>
                                </MasterSection>
                            </motion.div>
                        )}

                        {/* TRADE-IN MATRIX */}
                        {activeTab === 'marketplace' && (
                            <motion.div key="marketplace" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <MasterSection title="Buy-Back Algorithms" description="Manage trade-in multipliers and credit bonuses." icon={<Tag size={24} className="text-blue-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Payout Multipliers</h4>

                                            <ProtocolToggle
                                                title="Liquidity Factor"
                                                description={`Standard cash payout is strictly ${Math.round(marketplaceSettings.tradeInRate * 100)}% of street value.`}
                                                active={true}
                                                onToggle={() => { }}
                                                color="blue"
                                                showToggle={false}
                                            />

                                            <HUDInput
                                                label="Base Trade-In Rate (0.0 - 1.0)"
                                                value={marketplaceSettings.tradeInRate.toString()}
                                                onChange={(val) => setMarketplaceSettings({ ...marketplaceSettings, tradeInRate: Number(val) })}
                                                type="number"
                                            />

                                            <HUDInput
                                                label="Store Credit Incentive (0.0 - 1.0)"
                                                value={marketplaceSettings.creditBonus.toString()}
                                                onChange={(val) => setMarketplaceSettings({ ...marketplaceSettings, creditBonus: Number(val) })}
                                                type="number"
                                            />
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Processing Timelines (Hours)</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {Object.entries(marketplaceSettings.payoutTiers).map(([key, value]) => (
                                                    <HUDInput
                                                        key={key}
                                                        label={key}
                                                        value={value.toString()}
                                                        onChange={(val) => setMarketplaceSettings({
                                                            ...marketplaceSettings,
                                                            payoutTiers: { ...marketplaceSettings.payoutTiers, [key]: Number(val) }
                                                        })}
                                                        type="number"
                                                    />
                                                ))}
                                            </div>
                                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                                <p className="text-[10px] text-blue-400 font-mono italic">NOTICE: Payout estimations will sync globally across user mission profiles.</p>
                                            </div>
                                        </div>
                                    </div>
                                </MasterSection>
                            </motion.div>
                        )}

                        {/* SYSTEM NEXUS */}
                        {activeTab === 'nexus' && (
                            <motion.div key="nexus" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <MasterSection title="Nexus Integration Matrix" description="Monitor real-time status of critical system pipelines." icon={<Activity size={24} className="text-blue-400" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <NexusCard label="Supabase DB" status={systemMetrics?.integrations?.supabase} icon={Database} color="emerald" />
                                        <NexusCard label="Razorpay API" status={systemMetrics?.integrations?.razorpay} icon={CreditCard} color="blue" />
                                        <NexusCard label="AI Engine" status={systemMetrics?.integrations?.ai_core} icon={Cpu} color="purple" />
                                        <NexusCard label="Edge Runtime" status="active" icon={Zap} color="orange" />
                                    </div>
                                </MasterSection>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2">
                                        <div className="grid grid-cols-1 gap-8">
                                            <MasterSection title="Live Feedback Loop" description="Real-time terminal transmission of administrative actions." icon={<Terminal size={24} className="text-[#8B5CF6]" />}>
                                                <div className="h-[400px]">
                                                    <NexusTerminal />
                                                </div>
                                            </MasterSection>
                                            <MasterSection title="Latency Telemetry" description="Real-time database and API response times." icon={<Activity size={24} className="text-[#3B82F6]" />}>
                                                <div className="h-[200px] w-full mt-4 bg-white/5 rounded-3xl p-6 border border-white/5">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={systemMetrics?.latencySeries}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                                            <XAxis dataKey="time" stroke="#4b5563" fontSize={8} axisLine={false} tickLine={false} />
                                                            <YAxis stroke="#4b5563" fontSize={8} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}ms`} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '8px' }}
                                                            />
                                                            <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} animationDuration={300} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </MasterSection>
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <MasterSection title="Core Metrics" description="System load and latency." icon={<Zap size={24} className="text-emerald-400" />}>
                                            <div className="space-y-6">
                                                <MetricBar label="Global Latency" value={systemMetrics?.database?.latency || 0} max={100} unit="ms" />
                                                <MetricBar label="Traffic Load" value={(systemMetrics?.traffic?.load || 0) * 100} max={100} unit="%" />
                                                <MetricBar label="Pool Saturation" value={systemMetrics?.database?.pool || 0} max={100} unit="%" />
                                            </div>
                                        </MasterSection>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* SECURITY */}
                        {activeTab === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="bg-[#0a0a0a] border-2 border-dashed border-white/5 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center group">
                                    <div className="p-6 bg-white/5 rounded-full border border-white/10 mb-8 group-hover:scale-110 group-hover:bg-red-500/10 group-hover:border-red-500/30 transition-all duration-500">
                                        <Lock size={64} className="text-gray-600 group-hover:text-red-500 transition-colors" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Core Security Protocols</h3>
                                    <p className="text-[10px] text-gray-500 max-w-sm mt-6 uppercase tracking-widest font-black leading-relaxed">
                                        Access control lists and biometric overrides are currently managed via the <span className="text-white italic">Primary Server Terminal</span>. Direct master encryption keys reside in the secure vault.
                                    </p>
                                    <div className="mt-10 flex gap-4">
                                        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">Audit Logs</button>
                                        <button className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2">
                                            <Terminal size={12} /> Root Override
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

// Sub-components

function NavTab({ id, icon: Icon, label, active, onClick }: { id: string, icon: LucideIcon, label: string, active: string, onClick: (id: string) => void }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`w-full group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all relative overflow-hidden ${isActive ? 'bg-[#3B82F6] text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {isActive && (
                <motion.div layoutId="nav-bg" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400" />
            )}
            <Icon size={18} className={`relative z-10 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className={`relative z-10 text-[11px] font-black uppercase tracking-[0.15em] ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform`}>
                {label}
            </span>
        </button>
    );
}

function MasterSection({ title, description, icon, children }: { title: string, description: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <section className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden group/sec">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover/sec:scale-110 transition-transform duration-1000">
                {icon}
            </div>
            <div className="space-y-2 mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                    {icon}
                    <h2 className="text-xl font-black uppercase tracking-tight italic">{title}</h2>
                </div>
                <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">{description}</p>
            </div>
            {children}
        </section>
    );
}

function HUDIndicator({ label, value, active, color }: { label: string, value: string, active: boolean, color: 'blue' | 'emerald' | 'orange' | 'red' | 'purple' }) {
    const colors = {
        blue: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
        emerald: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
        orange: 'text-orange-400 border-orange-400/20 bg-orange-400/5',
        red: 'text-red-400 border-red-400/20 bg-red-400/5',
        purple: 'text-[#8B5CF6] border-[#8B5CF6]/20 bg-[#8B5CF6]/5',
    };

    return (
        <div className={`px-4 py-2 rounded-xl border ${colors[color]} flex flex-col gap-0.5`}>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">{label}</span>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${active ? 'animate-pulse' : ''} bg-current`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{value}</span>
            </div>
        </div>
    );
}

function HUDInput({ label, value, onChange, placeholder, type = "text", className = "" }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string, type?: string, className?: string }) {
    return (
        <div className="space-y-3 flex-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#3B82F6] transition-all bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] ${className}`}
            />
        </div>
    );
}

function ProtocolToggle({ title, description, active, onToggle, color, showToggle = true }: { title: string, description: string, active: boolean, onToggle: () => void, color: 'red' | 'orange' | 'blue', showToggle?: boolean }) {
    const colors = {
        red: active ? 'border-red-500/30 bg-red-500/10 text-red-500' : 'border-white/10 bg-white/5 text-gray-500',
        orange: active ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' : 'border-white/10 bg-white/5 text-gray-500',
        blue: active ? 'border-blue-500/30 bg-blue-500/10 text-blue-500' : 'border-white/10 bg-white/5 text-gray-500'
    };

    return (
        <button
            onClick={onToggle}
            className={`flex items-center justify-between p-6 rounded-3xl border transition-all text-left group ${colors[color]}`}
        >
            <div className="space-y-2">
                <h4 className="text-sm font-black uppercase tracking-tighter">{title}</h4>
                <p className="text-[10px] opacity-60 font-bold max-w-[250px] leading-relaxed uppercase tracking-widest">{description}</p>
            </div>
            {showToggle && (
                <div className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${active ? (color === 'red' ? 'bg-red-500' : color === 'orange' ? 'bg-orange-500' : 'bg-blue-500') : 'bg-gray-800'}`}>
                    <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${active ? 'translate-x-6' : 'translate-x-0'} shadow-lg`} />
                </div>
            )}
        </button>
    );
}

function CommandButton({ label, icon: Icon, onClick }: { label: string, icon: LucideIcon, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-between p-5 bg-[#0a0a0a] border border-white/10 rounded-2xl hover:bg-white/5 hover:border-white/20 transition-all text-gray-400 hover:text-white group"
        >
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            <Icon size={16} className="group-hover:scale-110 transition-transform" />
        </button>
    );
}

function NexusCard({ label, status, icon: Icon, color }: { label: string, status: string, icon: LucideIcon, color: string }) {
    const isOnline = status === 'operational' || status === 'active';
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 group hover:border-[#3B82F6]/30 transition-all">
            <div className="flex items-center justify-between">
                <Icon size={16} className={`text-${color}-500 opacity-60`} />
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse'}`} />
            </div>
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                <span className={`text-[10px] font-mono uppercase italic ${isOnline ? 'text-white' : 'text-red-500'}`}>{status || 'Offline'}</span>
            </div>
        </div>
    );
}

function MetricBar({ label, value, max, unit }: { label: string, value: number, max: number, unit: string }) {
    const percentage = (value / max) * 100;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em]">
                <span className="text-gray-500">{label}</span>
                <span className="text-white italic">{value}{unit}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-400' : 'bg-[#3B82F6]'}`}
                />
            </div>
        </div>
    );
}

