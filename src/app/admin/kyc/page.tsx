"use client";

import { useState } from "react";
import { Check, X, FileText, User, Eye } from "lucide-react";
import { motion } from "framer-motion";

// Mock Data
const initialStandardDocuments = [
    {
        id: 1,
        user: "Alex Chen",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
        type: "ID Card",
        url: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=300",
        status: "pending",
        date: "2026-01-28"
    },
    {
        id: 2,
        user: "Sarah Jones",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100",
        type: "Driver License",
        url: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=300",
        status: "pending",
        date: "2026-01-27"
    },
    {
        id: 3,
        user: "Mike Ross",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100",
        type: "Passport",
        url: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=300",
        status: "rejected",
        date: "2026-01-26"
    },
];

export default function KYCPage() {
    const [documents, setDocuments] = useState(initialStandardDocuments);

    const handleStatusChange = (id: number, newStatus: string) => {
        setDocuments((prev) =>
            prev.map((doc) => (doc.id === id ? { ...doc, status: newStatus } : doc))
        );
    };

    return (
        <div className="min-h-screen bg-[#050505] p-8 text-white pt-24">
            <div className="w-full max-w-none mx-auto">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]">
                            KYC Verification
                        </h1>
                        <p className="text-gray-400 mt-1">Review and approve user identification documents.</p>
                    </div>
                    <div className="bg-[#8B5CF6]/10 px-4 py-2 rounded-lg border border-[#8B5CF6]/20">
                        <span className="text-[#8B5CF6] font-mono font-bold">
                            PENDING: {documents.filter(d => d.status === 'pending').length}
                        </span>
                    </div>
                </header>

                <div className="grid gap-6">
                    {documents.map((doc) => (
                        <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#8B5CF6]/50 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <img
                                    src={doc.avatar}
                                    alt={doc.user}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                                />
                                <div>
                                    <h3 className="font-bold text-lg text-white">{doc.user}</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1 text-[#06B6D4]">
                                            <FileText size={14} /> {doc.type}
                                        </span>
                                        <span>•</span>
                                        <span>{doc.date}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Document Preview Thumbnail */}
                            <div className="hidden md:block w-32 h-20 bg-white/5 rounded-lg overflow-hidden relative group cursor-pointer border border-white/10">
                                <img src={doc.url} alt="Doc Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                    <Eye size={20} className="text-white" />
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${doc.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                        doc.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        {doc.status}
                                    </div>
                                </div>

                                {doc.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusChange(doc.id, 'rejected')}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors border border-transparent hover:border-red-500/50"
                                            title="Reject"
                                        >
                                            <X size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(doc.id, 'approved')}
                                            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors border border-transparent hover:border-green-500/50"
                                            title="Approve"
                                        >
                                            <Check size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
