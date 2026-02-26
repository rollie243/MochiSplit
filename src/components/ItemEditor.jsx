import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Check, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/taxEngine';
import TaxToggle from './TaxToggle';

export default function ItemEditor({ items, setItems, billMeta, setBillMeta, onNext }) {
    const [editingId, setEditingId] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');

    const addItem = () => {
        const name = newItemName.trim();
        const price = parseFloat(newItemPrice);
        if (!name || isNaN(price) || price <= 0) return;
        setItems((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name, price: Math.round(price * 100) / 100, assignedTo: [] },
        ]);
        setNewItemName('');
        setNewItemPrice('');
    };

    const deleteItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditPrice(item.price.toString());
    };

    const saveEdit = () => {
        const price = parseFloat(editPrice);
        if (!editName.trim() || isNaN(price) || price <= 0) return;
        setItems((prev) =>
            prev.map((i) => i.id === editingId ? { ...i, name: editName.trim(), price: Math.round(price * 100) / 100 } : i)
        );
        setEditingId(null);
    };

    const subtotal = items.reduce((sum, i) => sum + i.price, 0);
    const scPercent = billMeta?.serviceChargePercent || 0;
    const taxPercent = billMeta?.taxPercent || 0;
    const sc = Math.round(subtotal * (scPercent / 100) * 100) / 100;
    const tax = Math.round((subtotal + sc) * (taxPercent / 100) * 100) / 100;
    const receiptTotal = Math.round((subtotal + sc + tax) * 100) / 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-5 pt-12 pb-10"
        >
            {/* Single-line title */}
            <div className="mb-2">
                <h1 className="text-title text-text">
                    {billMeta?.isManual ? "Add your" : "Review your"} <span className="text-peach-dark">yummy items</span> {billMeta?.isManual ? "✍️" : "🧾"}
                </h1>
            </div>

            {/* Item list */}
            <div className="flex flex-col gap-2.5">
                <AnimatePresence>
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30, height: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.03 }}
                            className="card flex items-center gap-2 min-w-0"
                        >
                            {editingId === item.id ? (
                                <>
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 min-w-0 text-sm px-3 py-2.5 rounded-xl border border-mint bg-mint-light/20 font-semibold focus:bg-white transition-colors"
                                        autoFocus
                                    />
                                    <input
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        type="number"
                                        step="0.01"
                                        className="w-20 text-sm px-3 py-2.5 rounded-xl border border-mint bg-mint-light/20 text-right font-bold focus:bg-white transition-colors"
                                    />
                                    <button onClick={saveEdit} className="w-9 h-9 flex-shrink-0 rounded-full bg-dark text-white flex items-center justify-center hover:bg-dark-soft transition-colors">
                                        <Check size={15} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="w-7 h-7 rounded-full bg-cream-light flex items-center justify-center text-xs font-extrabold text-text-secondary">
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1 text-sm font-bold text-text truncate">{item.name}</span>
                                    <span className="text-sm font-extrabold text-text">{formatCurrency(item.price)}</span>
                                    <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-text-muted hover:text-text transition-colors">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => deleteItem(item.id)} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-text-muted hover:text-danger transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Add new item — optimized to fit */}
            <div className="card border-dashed !border-gray-300 flex items-center gap-2 !p-2 md:!p-3 min-w-0">
                <input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Item name"
                    className="flex-1 min-w-0 text-sm px-3 py-3.5 rounded-xl border border-gray-200 bg-gray-50 font-semibold placeholder:text-text-muted transition-all focus:border-mint focus:bg-white"
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                />
                <input
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="w-20 text-sm px-3 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-right font-bold placeholder:text-text-muted transition-all focus:border-mint focus:bg-white"
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={addItem}
                    className="w-12 h-12 rounded-full bg-dark text-white flex items-center justify-center shadow-sm flex-shrink-0"
                >
                    <Plus size={20} />
                </motion.button>
            </div>

            {/* Totals & Tax Configuration */}
            {items.length > 0 && (
                <>
                    <div className="bg-white border-t border-gray-100 rounded-2xl mt-4">
                        <TaxToggle
                            serviceChargePercent={billMeta.serviceChargePercent}
                            taxPercent={billMeta.taxPercent}
                            setServiceChargePercent={(val) => setBillMeta((p) => ({ ...p, serviceChargePercent: val }))}
                            setTaxPercent={(val) => setBillMeta((p) => ({ ...p, taxPercent: val }))}
                        />
                    </div>
                    <div className="card !bg-gray-50 flex flex-col gap-1.5 mt-2 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-text-secondary">
                                Subtotal · {items.length} item{items.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-sm font-extrabold text-text-secondary">{formatCurrency(subtotal)}</span>
                        </div>
                        {scPercent > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-text-muted">Service Charge ({scPercent}%)</span>
                                <span className="text-xs font-bold text-text-muted">{formatCurrency(sc)}</span>
                            </div>
                        )}
                        {taxPercent > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-text-muted">Tax ({taxPercent}%)</span>
                                <span className="text-xs font-bold text-text-muted">{formatCurrency(tax)}</span>
                            </div>
                        )}
                        <div className="h-px bg-gray-200 my-1" />
                        <div className="flex justify-between items-center">
                            <span className="text-base font-extrabold text-text">Receipt Total</span>
                            <span className="text-xl font-extrabold text-text">{formatCurrency(receiptTotal)}</span>
                        </div>
                    </div>
                </>
            )}

            {/* Next button */}
            {items.length > 0 && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onNext}
                    className="btn-primary w-full text-lg py-4 mt-2"
                >
                    Add Friends
                    <ArrowRight size={20} />
                </motion.button>
            )}
        </motion.div>
    );
}
