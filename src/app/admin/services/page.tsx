"use client";

import { Wrench, Plus, Search, Filter, MoreVertical, CheckCircle, Clock, AlertTriangle, X, Save, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { ServiceItem } from "@/types";
import { getServices, createService, updateService, deleteService } from "@/services/repair-services";
import { motion, AnimatePresence } from "framer-motion";

export default function ServicesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceItem | null>(null);

    const [formData, setFormData] = useState<Partial<ServiceItem>>({
        name: "",
        category: "Repair",
        price: 0,
        duration: "24h",
        status: "Active",
        description: ""
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await getServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to load services", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (service?: ServiceItem) => {
        if (service) {
            setEditingService(service);
            setFormData(service);
        } else {
            setEditingService(null);
            setFormData({
                name: "",
                category: "Repair",
                price: 0,
                duration: "24h",
                status: "Active",
                description: ""
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editingService) {
                await updateService(editingService.id, formData);
            } else {
                await createService(formData);
            }
            await loadServices();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save service", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this service?")) {
            await deleteService(id);
            await loadServices();
        }
    };

    // Filter services
    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 w-full max-w-none mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Service Catalog</h1>
                    <p className="text-gray-500 font-mono text-sm mt-1">Manage repair and maintenance offerings</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-[#06B6D4] text-black font-bold px-4 py-2 rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                    <Plus size={18} /> Add Service
                </button>
            </div>

            {/* Command Bar */}
            <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search services..."
                        className="w-full bg-white/5 border border-transparent focus:border-[#06B6D4] rounded-lg py-2 pl-10 pr-4 text-sm text-white outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                    <Filter size={16} /> Filter
                </button>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                    <div key={service.id} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-[#06B6D4]/10 rounded-lg flex items-center justify-center text-[#06B6D4]">
                                <Wrench size={20} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(service)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-white font-bold text-lg mb-1">{service.name}</h3>
                        {service.description && (
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{service.description}</p>
                        )}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/10">{service.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${service.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                <CheckCircle size={10} /> {service.status}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Price</span>
                                <span className="text-white font-mono">₹{service.price}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Duration</span>
                                <span className="text-white font-mono flex items-center gap-1"><Clock size={12} /> {service.duration}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit/Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                    {editingService ? "Edit Service" : "New Service"}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Service Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#06B6D4] outline-none"
                                        placeholder="e.g. PS5 Deep Clean"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#06B6D4] outline-none"
                                        >
                                            <option value="Repair">Repair</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Modification">Modification</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#06B6D4] outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Duration</label>
                                        <input
                                            type="text"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#06B6D4] outline-none"
                                            placeholder="e.g. 24h"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#06B6D4] outline-none"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase font-bold text-gray-500 block mb-2">Description</label>
                                    <textarea
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#06B6D4] outline-none h-24 resize-none"
                                        placeholder="Detailed description of the service..."
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 rounded-xl text-gray-400 hover:text-white font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 rounded-xl bg-[#06B6D4] text-black font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
                                >
                                    <Save size={18} /> Save Service
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
