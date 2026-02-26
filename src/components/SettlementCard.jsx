import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, MessageCircle, Check, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import { FriendAvatar } from './FriendAvatar';
import ShareWhatsApp from './ShareWhatsApp';
import MochiIcon from './MochiIcon';
import { formatCurrency } from '../utils/taxEngine';

export default function SettlementCard({ settlement, restaurantName }) {
    const { friend, items, subtotal, serviceCharge, tax, total } = settlement;
    const [showShareModal, setShowShareModal] = useState(false);
    const [imageCopied, setImageCopied] = useState(false);
    const cardRef = useRef(null);

    const handleCopyAsImage = async () => {
        if (!cardRef.current) return;

        // Temporarily show the logo watermark and hide buttons
        const buttonsEl = cardRef.current.querySelector('[data-actions]');
        const logoEl = cardRef.current.querySelector('[data-watermark]');
        if (buttonsEl) buttonsEl.style.display = 'none';
        if (logoEl) logoEl.style.display = 'flex';

        try {
            const dataUrl = await toPng(cardRef.current, {
                backgroundColor: '#FAFAFA',
                pixelRatio: 2,
            });

            // Restore UI
            if (buttonsEl) buttonsEl.style.display = '';
            if (logoEl) logoEl.style.display = 'none';

            const res = await fetch(dataUrl);
            const blob = await res.blob();

            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }),
            ]);

            setImageCopied(true);
            setTimeout(() => setImageCopied(false), 2500);
        } catch (err) {
            console.error('Copy as image failed:', err);
            // Restore UI
            if (buttonsEl) buttonsEl.style.display = '';
            if (logoEl) logoEl.style.display = 'none';

            // Fallback: download
            try {
                const dataUrl = await toPng(cardRef.current, { backgroundColor: '#FAFAFA', pixelRatio: 2 });
                const link = document.createElement('a');
                link.download = `${friend.name}-share.png`;
                link.href = dataUrl;
                link.click();
                setImageCopied(true);
                setTimeout(() => setImageCopied(false), 2500);
            } catch (e2) {
                console.error('Download fallback also failed:', e2);
            }
        }
    };

    return (
        <>
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.25 }}
                className="card-elevated overflow-hidden relative"
            >
                {/* Color accent bar */}
                <div className="h-2 -mx-6 -mt-6 mb-4 rounded-t-3xl" style={{ background: friend.color.bg }} />

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <FriendAvatar friend={friend} size="lg" />
                    <div className="flex-1">
                        <h3 className="text-xl font-extrabold text-text">{friend.name}</h3>
                        <p className="text-sm font-bold text-text-muted">their share</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-extrabold" style={{ color: friend.color.text }}>
                            {formatCurrency(total)}
                        </p>
                    </div>
                </div>

                {/* Items */}
                {items.length > 0 && (
                    <div className="flex flex-col gap-2 mb-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex-1 pr-2 flex items-center gap-1.5">
                                    <span className="font-bold text-text">{item.name}</span>
                                    {item.splitWith && (
                                        <span className="text-[10px] font-extrabold text-white bg-dark rounded-full px-1.5 py-0.5">
                                            ÷{item.splitWith}
                                        </span>
                                    )}
                                </div>
                                <span className="font-extrabold text-text-secondary">{formatCurrency(item.share)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {items.length === 0 && (
                    <p className="text-sm font-medium text-text-muted text-center py-3 mb-3">
                        Didn't order anything! ✨
                    </p>
                )}

                {/* Breakdown */}
                {items.length > 0 && (
                    <>
                        <div className="h-px bg-gray-100 my-3" />
                        <div className="flex flex-col gap-1 text-xs mb-3">
                            <div className="flex justify-between text-text-muted font-bold">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            {serviceCharge > 0 && (
                                <div className="flex justify-between text-text-muted font-bold">
                                    <span>Service Charge</span>
                                    <span>{formatCurrency(serviceCharge)}</span>
                                </div>
                            )}
                            {tax > 0 && (
                                <div className="flex justify-between text-text-muted font-bold">
                                    <span>Tax</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>
                            )}
                        </div>
                        <div className="h-px bg-gray-200 my-3" />
                        <div className="flex justify-between items-center">
                            <span className="text-base font-extrabold text-text">Total</span>
                            <span className="text-2xl font-extrabold" style={{ color: friend.color.text }}>
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </>
                )}

                {/* Watermark logo (hidden, shown only during screenshot) */}
                <div
                    data-watermark
                    className="items-center justify-center gap-1.5 pt-4 pb-1"
                    style={{ display: 'none' }}
                >
                    <MochiIcon size={20} />
                    <span className="text-xs font-bold text-text-muted">MochiSplit</span>
                </div>

                {/* Action buttons — single row, thinner */}
                {items.length > 0 && (
                    <div data-actions className="flex gap-2.5 mt-5">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopyAsImage}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold border-2 transition-all ${imageCopied
                                    ? 'bg-mint-light border-mint text-mint-dark'
                                    : 'bg-white border-gray-200 text-text-secondary hover:border-gray-300'
                                }`}
                        >
                            {imageCopied ? <><Check size={13} /> Copied!</> : <><ImageIcon size={13} /> Copy as Image</>}
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowShareModal(true)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold bg-[#25D366] text-white hover:bg-[#1EBE5A] transition-colors"
                        >
                            <MessageCircle size={13} /> WhatsApp
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {/* Share modal */}
            <ShareWhatsApp
                settlement={settlement}
                restaurantName={restaurantName}
                show={showShareModal}
                onClose={() => setShowShareModal(false)}
            />

            {/* Toast for image copied */}
            {imageCopied && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="toast flex items-center gap-2"
                >
                    <Check size={16} />
                    Image copied to clipboard!
                </motion.div>
            )}
        </>
    );
}
