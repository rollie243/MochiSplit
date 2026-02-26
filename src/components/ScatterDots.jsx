import React from 'react';

/** Scattered colored dots like BitePal's confetti decoration */
export default function ScatterDots() {
    const dots = [
        { color: '#FFB7B2', size: 14, top: '8%', left: '6%', delay: 0 },
        { color: '#A8E6CF', size: 10, top: '4%', right: '10%', delay: 0.2 },
        { color: '#FCF4A3', size: 12, top: '12%', right: '25%', delay: 0.4 },
        { color: '#C3B1E1', size: 8, top: '3%', left: '35%', delay: 0.3 },
        { color: '#FFB8C6', size: 11, top: '15%', left: '80%', delay: 0.1 },
        { color: '#B5EAD7', size: 9, top: '10%', left: '55%', delay: 0.5 },
    ];

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {dots.map((dot, i) => (
                <div
                    key={i}
                    className="absolute rounded-full animate-pulse-soft"
                    style={{
                        width: dot.size,
                        height: dot.size,
                        backgroundColor: dot.color,
                        top: dot.top,
                        left: dot.left,
                        right: dot.right,
                        animationDelay: `${dot.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}
