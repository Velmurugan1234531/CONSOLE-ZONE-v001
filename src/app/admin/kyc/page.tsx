"use client";



import { useState, useEffect } from "react";
import { Check, X, FileText, User, Eye, Loader2, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { getPendingKYCRequests, updateKYCStatus } from "@/services/admin";
import { format } from "date-fns";

export default function KYCPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await getPendingKYCRequests();
            setDocuments(data || []);
        } catch (e: any) {
            console.error(`Failed to load KYC requests: ${e?.message || e}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
        try {
            setProcessingId(id);
            // If rejected, usually we'd ask for a reason. For now, we'll just set a default reason.
            await updateKYCStatus(id, newStatus, newStatus === 'REJECTED' ? "Document verification failed" : undefined);

            // Remove from list or update status
            setDocuments(prev => prev.filter(d => d.id !== id));

        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
        } finally {
            setProcessingId(null);
        }
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
                            PENDING: {documents.length}
                        </span>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No pending verification requests.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {documents.map((doc) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#8B5CF6]/50 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] font-bold border-2 border-white/10">
                                        {doc.full_name?.charAt(0) || <User size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{doc.full_name || "Unknown User"}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-1">
                                            <span className="flex items-center gap-1 text-[#06B6D4] font-bold">
                                                <FileText size={14} /> {doc.aadhar_number}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Phone size={14} className="opacity-50" /> {doc.phone}
                                                {doc.secondary_phone && (
                                                    <span className="text-gray-600 ml-1">/ {doc.secondary_phone}</span>
                                                )}
                                            </span>
                                            <span>•</span>
                                            <span className="text-[10px]">{doc.kyc_submitted_at ? format(new Date(doc.kyc_submitted_at), 'MMM dd, HH:mm') : 'Recently'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Previews */}
                                <div className="flex gap-3">
                                    {doc.id_card_front_url && (
                                        <a href={doc.id_card_front_url} target="_blank" rel="noopener noreferrer" className="block w-20 h-14 bg-white/5 rounded-lg overflow-hidden relative group cursor-pointer border border-white/10 hover:border-[#8B5CF6]">
                                            <img src={doc.id_card_front_url} alt="ID Front" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                                <Eye size={12} className="text-white" />
                                            </div>
                                            <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[6px] font-black tracking-tighter text-center text-white p-0.5">FRONT</span>
                                        </a>
                                    )}
                                    {doc.id_card_back_url && (
                                        <a href={doc.id_card_back_url} target="_blank" rel="noopener noreferrer" className="block w-20 h-14 bg-white/5 rounded-lg overflow-hidden relative group cursor-pointer border border-white/10 hover:border-[#8B5CF6]">
                                            <img src={doc.id_card_back_url} alt="ID Back" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                                <Eye size={12} className="text-white" />
                                            </div>
                                            <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[6px] font-black tracking-tighter text-center text-white p-0.5">BACK</span>
                                        </a>
                                    )}
                                    {doc.selfie_url && (
                                        <a href={doc.selfie_url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 bg-white/5 rounded-full overflow-hidden relative group cursor-pointer border border-white/10 hover:border-[#8B5CF6]">
                                            <img src={doc.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                                <Eye size={16} className="text-white" />
                                            </div>
                                        </a>
                                    )}
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className={`text-xs font-bold uppercase px-3 py-1 rounded-full border bg-yellow-500/10 text-yellow-500 border-yellow-500/20`}>
                                            PENDING
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusChange(doc.id, 'REJECTED')}
                                            disabled={processingId === doc.id}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors border border-transparent hover:border-red-500/50 disabled:opacity-50"
                                            title="Reject"
                                        >
                                            {processingId === doc.id ? <Loader2 size={20} className="animate-spin" /> : <X size={20} />}
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(doc.id, 'APPROVED')}
                                            disabled={processingId === doc.id}
                                            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors border border-transparent hover:border-green-500/50 disabled:opacity-50"
                                            title="Approve"
                                        >
                                            {processingId === doc.id ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
