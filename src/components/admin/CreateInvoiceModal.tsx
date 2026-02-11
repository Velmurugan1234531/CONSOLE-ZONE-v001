"use client";

import { useState } from "react";
import { X, Plus, Trash2, Save, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Item {
    name: string;
    quantity: number;
    price: number;
}

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (invoice: any) => void;
}

export default function CreateInvoiceModal({ isOpen, onClose, onSave }: CreateInvoiceModalProps) {
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [type, setType] = useState<'RENTAL' | 'SALE'>('RENTAL');
    const [status, setStatus] = useState('Pending');
    const [items, setItems] = useState<Item[]>([{ name: "", quantity: 1, price: 0 }]);
    const [gstRate, setGstRate] = useState(18); // Default 18% GST

    const addItem = () => setItems([...items, { name: "", quantity: 1, price: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const updateItem = (index: number, field: keyof Item, value: any) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: value };
        setItems(next);
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const gstAmount = (subtotal * gstRate) / 100;
    const total = subtotal + gstAmount;

    const handleSave = () => {
        if (!customerName || items.some(i => !i.name || i.price <= 0)) {
            alert("Please fill in all required fields.");
            return;
        }

        onSave({
            customerName,
            customerEmail,
            type,
            status,
            amount: total,
            items: items.map(i => ({ ...i, price: Number(i.price) })),
            gstDetails: {
                rate: gstRate,
                amount: gstAmount
            }
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                        <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Plus className="text-[#8B5CF6]" />
                            Create <span className="text-[#8B5CF6]">New Invoice</span>
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Customer Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter full name"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8B5CF6] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Customer Email</label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#8B5CF6] outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Invoice Config */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                                >
                                    <option value="RENTAL">Rental</option>
                                    <option value="SALE">Sale</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Unpaid">Unpaid</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">GST Rate (%)</label>
                                <select
                                    value={gstRate}
                                    onChange={(e) => setGstRate(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                                >
                                    <option value={0}>No GST (0%)</option>
                                    <option value={5}>5%</option>
                                    <option value={12}>12%</option>
                                    <option value={18}>18%</option>
                                    <option value={28}>28%</option>
                                </select>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">Line Items</h3>
                                <button onClick={addItem} className="text-[10px] flex items-center gap-1.5 bg-[#8B5CF6]/10 text-[#8B5CF6] px-3 py-1.5 rounded-full font-black hover:bg-[#8B5CF6] hover:text-white transition-all">
                                    <Plus size={12} /> ADD ITEM
                                </button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-end group">
                                        <div className="flex-1 space-y-1">
                                            <input
                                                type="text"
                                                placeholder="Item description"
                                                value={item.name}
                                                onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white"
                                            />
                                        </div>
                                        <div className="w-20 space-y-1">
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white text-center"
                                            />
                                        </div>
                                        <div className="w-32 space-y-1">
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={item.price}
                                                onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white text-right"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeItem(idx)}
                                            className="p-3.5 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary & Actions */}
                    <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Subtotal</span>
                                <span className="text-sm font-bold">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">GST ({gstRate}%)</span>
                                <span className="text-sm font-bold text-gray-300">₹{gstAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col border-l border-white/10 pl-6">
                                <span className="text-[9px] text-[#8B5CF6] font-black uppercase tracking-widest">Grand Total</span>
                                <span className="text-xl font-black italic">₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 bg-[#8B5CF6] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#7C3AED] transition-all shadow-lg flex items-center gap-2 active:scale-95"
                            >
                                <Save size={16} />
                                Save Invoice
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
