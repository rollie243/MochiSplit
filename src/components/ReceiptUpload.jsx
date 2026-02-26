import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader, Sparkles, ArrowRight } from 'lucide-react';
import MochiIcon from './MochiIcon';
import ScatterDots from './ScatterDots';

export default function ReceiptUpload({ onItemsExtracted, isProcessing, setIsProcessing }) {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [statusText, setStatusText] = useState('');

    const processImage = async (file) => {
        if (!file) return;
        setIsProcessing(true);
        setStatusText('Scanning your yummy treats... 🍡');

        try {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('eng');
            setStatusText('Reading the receipt magic... ✨');
            const { data } = await worker.recognize(file);
            await worker.terminate();

            const { parseReceiptText } = await import('../utils/ocrParser');
            const result = parseReceiptText(data.text);
            setStatusText('All done! 🎉');
            setTimeout(() => {
                onItemsExtracted(result);
                setIsProcessing(false);
                setStatusText('');
            }, 500);
        } catch (err) {
            console.error('OCR failed:', err);
            setStatusText('Oops! Could not read receipt 😢');
            setIsProcessing(false);
            setTimeout(() => setStatusText(''), 2000);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) processImage(file);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center pt-16 pb-8 relative"
        >
            <ScatterDots />

            <AnimatePresence mode="wait">
                {isProcessing ? (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-6 text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        >
                            <Loader size={48} className="text-mint-dark" strokeWidth={2.5} />
                        </motion.div>
                        <p className="text-subtitle text-text">{statusText}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                        className="flex flex-col items-center gap-8 text-center w-full max-w-sm"
                    >
                        {/* Mochi hero */}
                        <MochiIcon size={80} className="animate-float" />

                        {/* Single-line hero text */}
                        <div>
                            <h1 className="text-hero text-text leading-tight">
                                Snap <span className="text-mint-dark">your bill</span>
                            </h1>
                            <p className="mt-3 text-text-secondary text-base font-medium leading-relaxed">
                                Take a photo of your receipt and<br />we'll magically extract everything ✨
                            </p>
                        </div>

                        {/* Primary actions */}
                        <div className="flex flex-col gap-3 w-full">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => cameraInputRef.current?.click()}
                                className="btn-primary w-full text-lg py-4"
                            >
                                <Camera size={22} />
                                Take a Photo
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => fileInputRef.current?.click()}
                                className="btn-secondary w-full"
                            >
                                <Upload size={18} />
                                Upload Image
                            </motion.button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 w-full">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-sm text-text-muted font-semibold">or</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>

                        {/* Skip to manual */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onItemsExtracted({ items: [], subtotal: 0, serviceChargePercent: null, taxPercent: null, restaurantName: '' })}
                            className="flex items-center gap-2 text-text-secondary font-bold text-sm
                hover:text-mint-dark transition-colors"
                        >
                            <Sparkles size={16} />
                            Enter items manually
                            <ArrowRight size={16} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden inputs */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </motion.div>
    );
}
