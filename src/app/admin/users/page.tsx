"use client";

import { Users, Search, MoreHorizontal, Mail, Calendar, Shield, X, ChevronRight, ShoppingBag, Monitor, Banknote, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface User {
    id: number;
    name: string;
    email: string;
    joined: string;
    role: string;
    status: string;
    trust: number;
    avatar: string;
}

export default function UsersPage() {
    const [selectedUser, setSelectedUser] = useState<number | null>(null);

    const users: User[] = [
        { id: 1, name: "Rahul Kumar", email: "rahul.k@example.com", joined: "Jan 12, 2024", role: "Member", status: "Active", trust: 94, avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop" },
        { id: 2, name: "Priya Sharma", email: "priya.s@example.com", joined: "Dec 05, 2023", role: "Elite", status: "Active", trust: 99, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100" },
        { id: 3, name: "Amit Mishra", email: "amit.m@example.com", joined: "Jan 20, 2024", role: "Member", status: "Pending", trust: 65, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100" },
        { id: 4, name: "Sneha Reddy", email: "sneha.r@example.com", joined: "Nov 15, 2023", role: "Admin", status: "Active", trust: 100, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100" },
        { id: 5, name: "Vikram Singh", email: "vikram.s@example.com", joined: "Feb 01, 2024", role: "Member", status: "Banned", trust: 12, avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100" },
    ];

    // Mock history data
    const history = {
        rentals: [
            { id: "RNT-101", product: "PS5 Console", date: "Jan 10 - Jan 17", status: "Returned", cost: "₹3,500" },
            { id: "RNT-102", product: "Meta Quest 2", date: "Dec 15 - Dec 20", status: "Returned", cost: "₹2,000" }
        ],
        sales: [
            { id: "ORD-552", product: "PS5 Controller", date: "Jan 05, 2024", status: "Delivered", cost: "₹5,400" }
        ],
        selling: [
            { id: "SEL-001", product: "Old Xbox One", date: "Nov 20, 2023", status: "Sold to Us", cost: "₹8,000 (Payout)" }
        ]
    };

    return (
        <div className="flex gap-6 min-h-screen animate-in fade-in duration-500">
            {/* Main User List */}
            <div className={`flex-1 transition-all duration-300 ${selectedUser ? 'w-2/3' : 'w-full'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-l-4 border-[#10B981] pl-6">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 font-display">
                            User <span className="text-[#10B981]">Database</span>
                        </h1>
                        <p className="text-gray-400 font-mono text-xs tracking-widest uppercase">
                            Manage Accounts & Permissions
                        </p>
                    </div>
                    <Link
                        href="/admin/users/add"
                        className="bg-[#10B981] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-[#059669] transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add User
                    </Link>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[#050505] text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                            <tr>
                                <th className="p-4 pl-6">User Profile</th>
                                <th className="p-4 hidden md:table-cell">Contact</th>
                                <th className="p-4 hidden md:table-cell">Role</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className={`group hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedUser === user.id ? 'bg-white/[0.05]' : ''}`}
                                    onClick={() => setSelectedUser(user.id)}
                                >
                                    <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-[#10B981] transition-colors" />
                                            <div>
                                                <h3 className="text-white font-bold text-sm">{user.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${user.trust > 90 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : user.trust > 70 ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>TRUST {user.trust}%</span>
                                                    <span className="text-[10px] text-gray-500 font-bold md:hidden">{user.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-sm text-gray-400">{user.email}</td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${user.role === 'Admin' ? 'bg-orange-500/10 text-orange-500' : 'bg-gray-800 text-gray-400'
                                            }`}>{user.role}</span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-xs font-bold text-[#10B981] flex items-center gap-1 hover:gap-2 transition-all">
                                            VIEW <ChevronRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Side Panel */}
            {selectedUser && (
                <div className="w-96 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 fixed right-8 top-28 bottom-8 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl z-50">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(null); }}
                        className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-24 h-24 rounded-full p-1 border-2 border-[#10B981] mx-auto mb-4 relative">
                            <img
                                src={users.find(u => u.id === selectedUser)?.avatar}
                                className="w-full h-full rounded-full object-cover"
                                alt="Profile"
                            />
                            <div className="absolute bottom-0 right-0 bg-[#10B981] p-1.5 rounded-full border-2 border-[#0a0a0a]">
                                <Shield size={12} className="text-black" />
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-white uppercase">{users.find(u => u.id === selectedUser)?.name}</h2>
                        <p className="text-gray-400 text-sm mb-4">{users.find(u => u.id === selectedUser)?.email}</p>

                        {/* Trust Matrix Summary */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Trust Index</span>
                                <span className={`text-sm font-black ${users.find(u => u.id === selectedUser)!.trust > 90 ? 'text-emerald-500' : 'text-blue-500'}`}>{users.find(u => u.id === selectedUser)?.trust}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden mb-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${users.find(u => u.id === selectedUser)?.trust}%` }}
                                    className={`h-full ${users.find(u => u.id === selectedUser)!.trust > 90 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-left bg-black/40 p-2 rounded-lg">
                                    <p className="text-[8px] font-black text-gray-600 uppercase">Payments</p>
                                    <p className="text-[10px] font-bold text-emerald-500">EXCELLENT</p>
                                </div>
                                <div className="text-left bg-black/40 p-2 rounded-lg">
                                    <p className="text-[8px] font-black text-gray-600 uppercase">Handling</p>
                                    <p className="text-[10px] font-bold text-blue-400">GOOD</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-2 mt-4">
                            <span className="bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold px-3 py-1 rounded-full border border-[#10B981]/20">ACTIVE MEMBER</span>
                            <span className="bg-white/5 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full border border-white/10">ID: #8832</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Rental History */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Monitor size={14} className="text-[#8B5CF6]" /> Rental History
                            </h3>
                            <div className="space-y-2">
                                {history.rentals.map((item, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-white font-medium">{item.product}</span>
                                            <span className="text-[#8B5CF6] font-bold text-xs">{item.cost}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                            <span>{item.date}</span>
                                            <span className="text-green-500">{item.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order History */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShoppingBag size={14} className="text-[#3B82F6]" /> Purchases
                            </h3>
                            <div className="space-y-2">
                                {history.sales.map((item, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-white font-medium">{item.product}</span>
                                            <span className="text-[#3B82F6] font-bold text-xs">{item.cost}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                            <span>{item.date}</span>
                                            <span>{item.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Selling History */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Banknote size={14} className="text-[#F59E0B]" /> Selling Assets
                            </h3>
                            <div className="space-y-2">
                                {history.selling.map((item, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-white font-medium">{item.product}</span>
                                            <span className="text-[#F59E0B] font-bold text-xs">{item.cost}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                            <span>{item.date}</span>
                                            <span>{item.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
