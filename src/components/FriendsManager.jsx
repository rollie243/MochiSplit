import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, ArrowRight, Clock } from 'lucide-react';
import { FriendAvatar, getFriendColor } from './FriendAvatar';

const HISTORY_KEY = 'mochisplit_friend_history';

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
}

function saveToHistory(names) {
    const prev = getHistory();
    const merged = [...new Set([...names, ...prev])].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
}

export default function FriendsManager({ friends, setFriends, onNext }) {
    const [inputName, setInputName] = useState('');
    const history = useMemo(() => getHistory(), []);

    // Save friend names to history whenever they change
    useEffect(() => {
        if (friends.length > 0) {
            saveToHistory(friends.map((f) => f.name));
        }
    }, [friends]);

    const addFriend = (name) => {
        const n = (name || inputName).trim();
        if (!n) return;
        if (friends.some((f) => f.name.toLowerCase() === n.toLowerCase())) return;
        setFriends((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name: n, initial: n.charAt(0).toUpperCase(), color: getFriendColor(prev.length) },
        ]);
        setInputName('');
    };

    const removeFriend = (id) => setFriends((prev) => prev.filter((f) => f.id !== id));

    // Suggestions: history names not already added, plus quick-add defaults
    const suggestions = useMemo(() => {
        const currentNames = new Set(friends.map((f) => f.name.toLowerCase()));
        const fromHistory = history.filter((n) => !currentNames.has(n.toLowerCase()));
        const defaults = ['Me', 'Alex', 'Sam', 'Jun'].filter((n) => !currentNames.has(n.toLowerCase()));
        // Merge: history first, then defaults not in history
        const historySet = new Set(fromHistory.map((n) => n.toLowerCase()));
        const extra = defaults.filter((n) => !historySet.has(n.toLowerCase()));
        return [...fromHistory, ...extra].slice(0, 8);
    }, [friends, history]);

    const hasHistory = history.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 py-6 pb-10"
        >
            {/* Single-line title */}
            <div className="mb-1">
                <h1 className="text-title text-text">Who's <span className="text-mint-dark">splitting?</span> 👥</h1>
                <p className="text-sm text-text-secondary font-medium mt-2">Add everyone sharing the bill</p>
            </div>

            {/* Taller input + button */}
            <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                    <input
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="Friend's name..."
                        className="w-full text-sm px-8 h-16 rounded-2xl border border-gray-200 bg-white
              placeholder:text-text-muted font-bold transition-all focus:border-mint"
                        onKeyDown={(e) => e.key === 'Enter' && addFriend()}
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addFriend()}
                    className="btn-primary !h-14 !px-6"
                >
                    Add
                </motion.button>
            </div>

            {/* Suggestions from history + defaults */}
            {suggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        {hasHistory && <Clock size={12} className="text-text-muted" />}
                        <span className="text-xs font-bold text-text-muted">
                            {hasHistory ? 'Recent friends' : 'Quick add'}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((n) => (
                            <motion.button
                                key={n}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addFriend(n)}
                                className="px-3.5 py-2 text-xs rounded-full border-2 border-gray-200 text-text-secondary
                  bg-white hover:border-mint hover:bg-mint-light/30 transition-all font-bold"
                            >
                                + {n}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Friends grid */}
            <div className="flex flex-wrap gap-4 justify-start min-h-[80px]">
                <AnimatePresence>
                    {friends.map((friend) => (
                        <motion.div
                            key={friend.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ type: 'spring', bounce: 0.5, duration: 0.4 }}
                            className="flex flex-col items-center gap-1.5 relative group"
                        >
                            <div className="relative">
                                <FriendAvatar friend={friend} size="lg" />
                                <button
                                    onClick={() => removeFriend(friend.id)}
                                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-dark text-white
                    flex items-center justify-center opacity-0 group-hover:opacity-100
                    transition-opacity shadow-md text-[10px]"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                            <span className="text-xs font-bold text-text-secondary max-w-16 truncate text-center">
                                {friend.name}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {friends.length === 0 && (
                    <p className="text-text-muted text-sm font-medium py-6 w-full text-center">
                        No friends added yet — don't eat alone! 🍜
                    </p>
                )}
            </div>

            {/* Next */}
            {friends.length >= 2 && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onNext}
                    className="btn-primary w-full text-lg py-4 mt-2"
                >
                    Start Assigning
                    <ArrowRight size={20} />
                </motion.button>
            )}
            {friends.length === 1 && (
                <p className="text-center text-sm text-peach-dark font-bold mt-2">
                    Add at least 2 friends to split 🍡
                </p>
            )}
        </motion.div>
    );
}
