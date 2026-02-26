import React from 'react';
import { motion } from 'framer-motion';
import MochiIcon from './MochiIcon';

export default function ProgressBar({ progress }) {
    const isComplete = progress >= 100;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.05)] z-40">
            <div className="max-w-md mx-auto p-4 flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-1.5">
                        <span className="text-xs font-extrabold text-text">
                            {isComplete ? 'All assigned! 🎉' : 'Dine & Dash Prevention 🏃'}
                        </span>
                        <span className={`text-xs font-extrabold ${isComplete ? 'text-mint-dark' : 'text-text-muted'}`}>
                            {Math.min(progress, 100)}%
                        </span>
                    </div>
                    <div className="h-3.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 0.5, type: 'spring', bounce: 0.15 }}
                            className={`h-full rounded-full ${isComplete ? 'bg-mint-dark' : 'bg-peach'}`}
                        />
                    </div>
                </div>

                <motion.div
                    animate={isComplete ? { y: [0, -6, 0] } : {}}
                    transition={{ repeat: isComplete ? Infinity : 0, duration: 1.5 }}
                    className="flex-shrink-0"
                >
                    <MochiIcon size={36} dancing={isComplete} />
                </motion.div>
            </div>
        </div>
    );
}
