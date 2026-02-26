import React from 'react';

const FRIEND_COLORS = [
    { bg: '#A8E6CF', text: '#2D5A3D' },
    { bg: '#FFB7B2', text: '#6B3A37' },
    { bg: '#C3B1E1', text: '#4A3B6B' },
    { bg: '#FFECD2', text: '#6B5A3A' },
    { bg: '#B5EAD7', text: '#3A5A4A' },
    { bg: '#FFB8C6', text: '#6B3A4A' },
    { bg: '#FCF4A3', text: '#5A5A2D' },
    { bg: '#D4F5E6', text: '#2D5A3D' },
    { bg: '#FFD6D2', text: '#6B3A37' },
    { bg: '#DDD0F0', text: '#4A3B6B' },
];

export function getFriendColor(index) {
    return FRIEND_COLORS[index % FRIEND_COLORS.length];
}

export function FriendAvatar({ friend, size = 'md', selected = false, onClick, showName = false }) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        ${sizeClasses[size]}
        rounded-full font-bold flex items-center justify-center
        transition-all duration-200 cursor-pointer flex-shrink-0
        ${selected ? 'ring-3 ring-offset-2 ring-mint-dark scale-110 shadow-lg' : 'hover:scale-105'}
      `}
            style={{
                backgroundColor: friend.color.bg,
                color: friend.color.text,
            }}
            title={friend.name}
        >
            {friend.initial}
            {showName && (
                <span className="ml-1 text-xs font-medium truncate max-w-16">{friend.name}</span>
            )}
        </button>
    );
}

export default FriendAvatar;
