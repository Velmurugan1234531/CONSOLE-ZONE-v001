"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Globe,
    User,
    Bell,
    Search,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Info,
    Zap,
    X,
    Plus,
    Filter
} from "lucide-react";
import { getNotifications, sendNotification, deleteNotification } from "@/services/notifications";
import { Notification, NotificationType } from "@/types";
import { formatDistanceToNow } from "date-fns";

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');

    // Send Form State
    const [showSendModal, setShowSendModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [newType, setNewType] = useState<NotificationType>("info");
    const [targetUser, setTargetUser] = useState(""); // empty for global
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await sendNotification({
                title: newTitle,
                message: newMessage,
                type: newType,
                user_id: targetUser || undefined
            });
            setShowSendModal(false);
            setNewTitle("");
            setNewMessage("");
            setTargetUser("");
            loadNotifications();
        } catch (error) {
            console.error(error);
            alert("Failed to send notification");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const filtered = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || n.type === filterType;
        return matchesSearch && matchesType;
    });

    const getTypeColor = (type: NotificationType) => {
        switch (type) {
            case 'success': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
    };

    const getTypeIcon = (type: NotificationType) => {
        switch (type) {
            case 'success': return <CheckCircle size={14} />;
            case 'warning': return <AlertTriangle size={14} />;
            case 'error': return <AlertTriangle size={14} />;
            default: return <Info size={14} />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 space-y-8 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                        Comms <span className="text-[#8B5CF6]">Hub</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em] mt-2">
                        Global Broadcasts • <span className="text-emerald-500">Active Nexus</span>
                    </p>
                </div>

                <button
                    onClick={() => setShowSendModal(true)}
                    className="flex items-center gap-3 px-6 py-4 bg-[#8B5CF6] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#7C3AED] transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)] group"
                >
                    <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    New Broadcast
                </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-[#8B5CF6]/50 transition-all font-mono"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-2xl px-4 py-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#8B5CF6]/50 transition-all"
                    >
                        <option value="all">All Types</option>
                        <option value="info">Information</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Critical</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3 text-gray-400">
                        <Zap size={18} className="text-[#8B5CF6]" />
                        <span className="text-xs font-black uppercase tracking-widest">Broadcast History</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-600 uppercase">{filtered.length} entries located</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Type</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Recipient</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Title / Message</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-mono text-xs uppercase animate-pulse">Scanning Data Streams...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-mono text-xs uppercase">No notification records found</td>
                                </tr>
                            ) : (
                                filtered.map((n) => (
                                    <tr key={n.id} className="hover:bg-white/[0.02] transition-all group">
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getTypeColor(n.type)}`}>
                                                {getTypeIcon(n.type)}
                                                {n.type}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {n.user_id ? (
                                                    <div className="flex items-center gap-2 text-blue-400">
                                                        <User size={12} />
                                                        <span className="text-[10px] font-mono uppercase">User: {n.user_id.slice(0, 8)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-[#8B5CF6]">
                                                        <Globe size={12} />
                                                        <span className="text-[10px] font-mono uppercase">Global</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-md">
                                                <p className="text-sm font-black text-white group-hover:text-[#8B5CF6] transition-colors">{n.title}</p>
                                                <p className="text-xs text-gray-500 truncate mt-1">{n.message}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-mono text-gray-600 uppercase">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleDelete(n.id)}
                                                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Send Modal */}
            <AnimatePresence>
                {showSendModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                                        <Send size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tight underline decoration-[#8B5CF6]/30 underline-offset-4">Dispatch Broadcast</h3>
                                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">Manual Deployment Sequence</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowSendModal(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSend} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Type Variant</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(['info', 'success', 'warning', 'error'] as NotificationType[]).map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setNewType(type)}
                                                    className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${newType === type ? getTypeColor(type) : 'bg-black border-white/5 text-gray-600 hover:border-white/20'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Recipient ID</label>
                                        <input
                                            type="text"
                                            placeholder="Leave empty for GLOBAL"
                                            value={targetUser}
                                            onChange={(e) => setTargetUser(e.target.value)}
                                            className="w-full bg-black border border-white/5 rounded-xl p-4 text-sm font-mono focus:border-[#8B5CF6]/50 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Broadcast Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Headline for the alert..."
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full bg-black border border-white/5 rounded-xl p-4 text-sm font-bold focus:border-[#8B5CF6]/50 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Full Message Payload</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Details of the transmission..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="w-full bg-black border border-white/5 rounded-xl p-4 text-sm focus:border-[#8B5CF6]/50 transition-all outline-none resize-none"
                                    />
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSendModal(false)}
                                        className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Cancel Operation
                                    </button>
                                    <button
                                        disabled={sending}
                                        type="submit"
                                        className="flex-3 px-12 py-4 bg-[#8B5CF6] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-[#7C3AED] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {sending ? <Search size={16} className="animate-spin" /> : <Plus size={16} />}
                                        Initialize Dispatch
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
