import React from 'react';

export default function MochiIcon({ size = 40, dancing = false, className = '' }) {
    return (
        <span
            className={`inline-block ${dancing ? 'animate-dance' : ''} ${className}`}
            style={{ width: size, height: size }}
            role="img"
            aria-label="Mochi"
        >
            <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
                {/* Shadow */}
                <ellipse cx="50" cy="88" rx="28" ry="6" fill="#E5E7EB" opacity="0.5" />
                {/* Mochi body */}
                <ellipse cx="50" cy="58" rx="36" ry="30" fill="#FFECD2" stroke="#E8D5B8" strokeWidth="1.5" />
                {/* Mochi topping */}
                <ellipse cx="50" cy="44" rx="28" ry="20" fill="#FFB7B2" stroke="#F0A5A0" strokeWidth="1" />
                {/* Left eye */}
                <circle cx="40" cy="54" r="4" fill="#1A1A2E" />
                <circle cx="41.5" cy="52.5" r="1.8" fill="#FFFFFF" />
                {/* Right eye */}
                <circle cx="60" cy="54" r="4" fill="#1A1A2E" />
                <circle cx="61.5" cy="52.5" r="1.8" fill="#FFFFFF" />
                {/* Smile */}
                <path d="M 43 62 Q 50 70 57 62" stroke="#1A1A2E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Blush */}
                <ellipse cx="33" cy="60" rx="5" ry="3.5" fill="#FFB8C6" opacity="0.6" />
                <ellipse cx="67" cy="60" rx="5" ry="3.5" fill="#FFB8C6" opacity="0.6" />
            </svg>
        </span>
    );
}
