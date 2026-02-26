import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, MessageSquare, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { formatCurrency } from '../utils/taxEngine';
import MochiIcon from './MochiIcon';
import ShareGroupModal from './ShareGroupModal';

export default function GroupSummaryCard({ settlements, restaurantName, grandTotal }) {
    const [imageCopied, setImageCopied] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const cardRef = useRef(null);

    const generateGroupMessage = () => {
        const restaurant = restaurantName || 'our meal';
        let msg = `Hi guys! 👋\nHere's the split for ${restaurant} today:\n\n`;

        settlements.forEach((s) => {
            msg += `• ${s.friend.name}: *${formatCurrency(s.total)}*\n`;
        });

        msg += `\nGrand Total: ${formatCurrency(grandTotal)}\n\nSplit cutely with MochiSplit! 🍡: https://rollie243.github.io/MochiSplit/`;
        return msg;
    };

    const handleWhatsApp = () => {
        setShowShareModal(true);
    };

    const handleCopyAsImage = async () => {
        if (!cardRef.current) return;

        const buttonsEl = cardRef.current.querySelector('[data-actions]');
        const logoEl = cardRef.current.querySelector('[data-watermark]');
        if (buttonsEl) buttonsEl.style.display = 'none';
        if (logoEl) logoEl.style.display = 'flex';

        try {
            const makeImagePromise = async () => {
                const dataUrl = await toPng(cardRef.current, { backgroundColor: '#FAFAFA', pixelRatio: 2 });
                if (buttonsEl) buttonsEl.style.display = '';
                if (logoEl) logoEl.style.display = 'none';
                const res = await fetch(dataUrl);
                return await res.blob();
            };

            if (window.ClipboardItem) {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': makeImagePromise() })]);
                setImageCopied(true);
                setTimeout(() => setImageCopied(false), 2500);
            } else {
                throw new Error("ClipboardItem not supported");
            }
        } catch (err) {
            console.error('Clipboard copy failed, trying Web Share API:', err);
            if (buttonsEl) buttonsEl.style.display = '';
            if (logoEl) logoEl.style.display = 'none';

            try {
                const dataUrl = await toPng(cardRef.current, { backgroundColor: '#FAFAFA', pixelRatio: 2 });
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], `mochisplit-group.png`, { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: `Group Split`,
                    });
                    setImageCopied(true);
                    setTimeout(() => setImageCopied(false), 2500);
                } else {
                    throw new Error("Web Share API not supported");
                }
            } catch (e2) {
                try {
                    const dataUrl = await toPng(cardRef.current, { backgroundColor: '#FAFAFA', pixelRatio: 2 });
                    const link = document.createElement('a');
                    link.download = `mochisplit-group.png`;
                    link.href = dataUrl;
                    link.click();
                    setImageCopied(true);
                    setTimeout(() => setImageCopied(false), 2500);
                } catch (e3) {
                    console.error('Download fallback failed:', e3);
                }
            }
        }
    };

    if (!settlements || settlements.length === 0) return null;

    return (
        <>
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="card-elevated mb-6 bg-gradient-to-br from-mint-light/30 to-white border-mint/20 relative overflow-hidden"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-extrabold text-text flex items-center gap-2">
                            <MessageSquare size={18} className="text-mint-dark" />
                            Group Summary
                        </h3>
                        <p className="text-xs font-bold text-text-muted mt-0.5">Share with the group chat!</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-100 mb-4 shadow-sm">
                    <div className="flex flex-col gap-2 text-sm">
                        {settlements.map((s) => (
                            <div key={s.friend.id} className="flex justify-between items-center">
                                <span className="font-bold text-text-secondary">{s.friend.name}</span>
                                <span className="font-extrabold text-text">{formatCurrency(s.total)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="h-px bg-gray-100 my-3" />
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-text-muted uppercase tracking-widest">Total</span>
                        <span className="text-base font-extrabold text-mint-dark">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>

                {/* Watermark logo (hidden, shown only during screenshot) */}
                <div
                    data-watermark
                    className="items-center justify-center gap-1.5 pt-4 pb-1"
                    style={{ display: 'none' }}
                >
                    <MochiIcon size={20} />
                    <span className="text-xs font-bold text-text-muted">MochiSplit</span>
                </div>

                <div data-actions className="flex gap-2.5 mt-2">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyAsImage}
                        className={`pill flex-1 ${imageCopied ? 'bg-mint-light text-mint-dark border-mint-dark' : 'pill-outline'}`}
                    >
                        {imageCopied ? <><Check size={14} /> Copied!</> : <><ImageIcon size={14} /> Copy as Image</>}
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleWhatsApp}
                        className="pill flex-1 bg-[#E8F9EF] text-[#21C05B] border-[#21C05B]/20"
                    >
                        <MessageCircle size={14} /> WhatsApp
                    </motion.button>
                </div>
            </motion.div>

            <ShareGroupModal
                show={showShareModal}
                onClose={() => setShowShareModal(false)}
                message={generateGroupMessage()}
            />
        </>
    );
}
