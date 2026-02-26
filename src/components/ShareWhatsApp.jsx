import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Copy, Send } from 'lucide-react';
import { formatCurrency } from '../utils/taxEngine';

export default function ShareWhatsApp({ settlement, restaurantName, show, onClose }) {
    const [copied, setCopied] = useState(false);
    const { friend, items, subtotal, serviceCharge, tax, total } = settlement;

    const generateMessage = () => {
        const name = friend.name;
        const restaurant = restaurantName || 'our meal';
        let msg = `Hi ${name}! 👋\nYour share for ${restaurant} today is *${formatCurrency(total)}*.\n\nHere's the breakdown:\n`;
        items.forEach((item) => {
            const splitText = item.splitWith ? ` (split by ${item.splitWith})` : '';
            msg += `• ${item.name}${splitText}: ${formatCurrency(item.share)}\n`;
        });
        if (serviceCharge > 0 || tax > 0) {
            msg += `\nSubtotal: ${formatCurrency(subtotal)}\n`;
            if (serviceCharge > 0) msg += `Service Charge: ${formatCurrency(serviceCharge)}\n`;
            if (tax > 0) msg += `Tax: ${formatCurrency(tax)}\n`;
        }
        msg += `\nTotal: *${formatCurrency(total)}* 🌸\n\nSplit cutely with MochiSplit! 🍡: https://rollie243.github.io/MochiSplit/`;
        return msg;
    };

    const message = generateMessage();

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="modal-overlay"
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    onClick={(e) => e.stopPropagation()}
                    className="modal-content"
                >
                    {/* Handle bar */}
                    <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5" />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-subtitle text-text">Share with {friend.name}</h3>
                            <p className="text-xs text-text-muted font-medium mt-0.5">Send the breakdown via WhatsApp or copy it</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Message preview */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-5 max-h-48 overflow-y-auto">
                        <pre className="text-xs text-text-secondary font-sans whitespace-pre-wrap leading-relaxed">{message}</pre>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleWhatsApp}
                            className="w-full py-3.5 rounded-full bg-[#25D366] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md hover:bg-[#1EBE5A] transition-colors"
                        >
                            <Send size={18} />
                            Send via WhatsApp
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCopy}
                            className="btn-secondary w-full"
                        >
                            <Copy size={16} />
                            {copied ? 'Copied! ✅' : 'Copy Message'}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
