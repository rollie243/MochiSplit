import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCheck } from 'lucide-react';
import { FriendAvatar } from './FriendAvatar';
import { formatCurrency } from '../utils/taxEngine';

export default function AssignmentGrid({ items, setItems, friends }) {
    const [selectedFriendId, setSelectedFriendId] = useState(friends[0]?.id || null);

    const toggleAssignment = (itemId) => {
        if (!selectedFriendId) return;
        setItems((prev) =>
            prev.map((item) => {
                if (item.id !== itemId) return item;
                const isAssigned = item.assignedTo.includes(selectedFriendId);
                return {
                    ...item,
                    assignedTo: isAssigned
                        ? item.assignedTo.filter((id) => id !== selectedFriendId)
                        : [...item.assignedTo, selectedFriendId],
                };
            })
        );
    };

    const selectAllForFriend = () => {
        if (!selectedFriendId) return;
        // Check if all items are already assigned to this friend
        const allAssigned = items.every((item) => item.assignedTo.includes(selectedFriendId));
        setItems((prev) =>
            prev.map((item) => ({
                ...item,
                assignedTo: allAssigned
                    ? item.assignedTo.filter((id) => id !== selectedFriendId)
                    : item.assignedTo.includes(selectedFriendId)
                        ? item.assignedTo
                        : [...item.assignedTo, selectedFriendId],
            }))
        );
    };

    const allAssignedToSelected = items.every((item) => item.assignedTo.includes(selectedFriendId));

    return (
        <div className="flex flex-col relative">
            {/* Sticky Header Group */}
            <div className="sticky top-[56px] z-30 pt-10 pb-3 px-4 bg-white/95 backdrop-blur-md border-b border-gray-100 flex flex-col gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)] mb-4 rounded-b-2xl">
                {/* Friend selector bar */}
                <div>
                    <p className="text-xs font-extrabold text-text-muted uppercase tracking-widest mb-1">
                        Select a friend
                    </p>
                    <div className="flex gap-3 overflow-x-auto pt-2 pb-1 scrollbar-none">
                        {friends.map((friend) => (
                            <div key={friend.id} className="flex flex-col items-center gap-1 shrink-0">
                                <FriendAvatar
                                    friend={friend}
                                    size="md"
                                    selected={selectedFriendId === friend.id}
                                    onClick={() => setSelectedFriendId(friend.id)}
                                />
                                <span className={`text-[10px] font-bold max-w-16 truncate ${selectedFriendId === friend.id ? 'text-text' : 'text-text-muted'
                                    }`}>
                                    {friend.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hint + Select All */}
                <div className="flex items-center gap-2">
                    <p className="text-xs font-extrabold text-text-muted uppercase tracking-widest flex-1">
                        Tap items they ate
                    </p>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={selectAllForFriend}
                        className={`pill-sm ${allAssignedToSelected ? 'pill-active' : 'pill-outline'}`}
                    >
                        <CheckCheck size={12} />
                        {allAssignedToSelected ? 'Deselect all' : 'Select all'}
                    </motion.button>
                </div>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-2.5">
                {items.map((item) => {
                    const isAssignedToSelected = item.assignedTo.includes(selectedFriendId);
                    const splitCount = item.assignedTo.length;
                    const assignedFriends = item.assignedTo.map((id) => friends.find((f) => f.id === id)).filter(Boolean);

                    return (
                        <motion.div
                            key={item.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleAssignment(item.id)}
                            className={`card cursor-pointer transition-all duration-200 flex flex-col gap-2.5 ${isAssignedToSelected
                                ? '!border-mint !bg-mint-light/15 shadow-[0_2px_12px_rgba(168,230,207,0.2)]'
                                : splitCount > 0
                                    ? 'opacity-75'
                                    : 'hover:border-gray-300'
                                }`}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-sm font-bold text-text flex-1 leading-snug">{item.name}</span>
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className={`text-sm font-extrabold ${isAssignedToSelected ? 'text-mint-dark' : 'text-text'}`}>
                                        {formatCurrency(item.price)}
                                    </span>
                                    {splitCount > 1 && (
                                        <span className="text-[10px] font-extrabold text-peach-dark bg-peach-light/40 px-2 py-0.5 rounded-full">
                                            {formatCurrency(item.price / splitCount)} ea
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Avatar row */}
                            <div className="flex flex-wrap gap-1.5 min-h-[24px] items-center">
                                {splitCount === 0 && (
                                    <span className="text-xs text-text-muted italic font-medium">Unassigned</span>
                                )}
                                <AnimatePresence>
                                    {assignedFriends.map((f) => (
                                        <motion.div
                                            key={f.id}
                                            layoutId={`avatar-${item.id}-${f.id}`}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ type: 'spring', bounce: 0.45, duration: 0.35 }}
                                        >
                                            <FriendAvatar friend={f} size="sm" />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {splitCount > 1 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-[10px] font-extrabold text-text-muted bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center"
                                    >
                                        ÷{splitCount}
                                    </motion.span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bottom spacer to prevent button overlap */}
            <div className="h-20 shrink-0 w-full" />
        </div>
    );
}
