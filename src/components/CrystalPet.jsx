import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

// ─── Storage ────────────────────────────────────────────────────────────────

const USAGE_KEY = 'crystal_pet_usage_v1';
const POS_KEY   = 'crystal_pet_pos_v1';

const defaultUsage = () => ({
  dailyUsed: 0, dailyLimit: 45,
  weeklyUsed: 0, weeklyLimit: 200,
  unit: 'messages', lastUpdated: null,
});

function loadUsage() {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) return { ...defaultUsage(), ...JSON.parse(raw) };
  } catch {}
  return defaultUsage();
}
function saveUsage(data) {
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(data)); } catch {}
}
function loadPos() {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { x: 0, y: 0 };
}
function savePos(x, y) {
  try { localStorage.setItem(POS_KEY, JSON.stringify({ x, y })); } catch {}
}

// ─── Mood system ─────────────────────────────────────────────────────────────

function getMoodId(dailyUsed, dailyLimit, weeklyUsed, weeklyLimit) {
  const d = dailyLimit  > 0 ? (dailyUsed  / dailyLimit)  * 100 : 0;
  const w = weeklyLimit > 0 ? (weeklyUsed / weeklyLimit) * 100 : 0;
  const pct = Math.max(d, w);
  if (pct <= 25) return 'energized';
  if (pct <= 50) return 'content';
  if (pct <= 75) return 'tired';
  return 'exhausted';
}

const MOODS = {
  energized: {
    label: 'Energized', emoji: '✨',
    bodyLight: '#A78BFA', body: '#8B5CF6', bodyDark: '#6D28D9',
    glow: '#EDE9FE', shine: '#DDD6FE',
    floatY: [-10, 2, -10], floatDur: 0.9,
    message: "Full of energy! Let's go! 💎",
    particles: 'sparkles',
  },
  content: {
    label: 'Content', emoji: '💜',
    bodyLight: '#8B5CF6', body: '#7C3AED', bodyDark: '#5B21B6',
    glow: '#EDE9FE', shine: '#C4B5FD',
    floatY: [-6, 1, -6], floatDur: 1.5,
    message: 'Vibing along~ all good 🌸',
    particles: 'none',
  },
  tired: {
    label: 'Getting Tired', emoji: '😴',
    bodyLight: '#C084FC', body: '#9333EA', bodyDark: '#7E22CE',
    glow: '#F5F3FF', shine: '#E9D5FF',
    floatY: [-3, 0.5, -3], floatDur: 2.5,
    message: 'Feeling a bit drained... 🌙',
    particles: 'zzz',
  },
  exhausted: {
    label: 'Exhausted', emoji: '💤',
    bodyLight: '#A8A29E', body: '#78716C', bodyDark: '#57534E',
    glow: '#FAFAF9', shine: '#E7E5E4',
    floatY: [-1.5, 0.5, -1.5], floatDur: 4.0,
    message: 'Almost out of quota... zzz 😪',
    particles: 'zzz',
  },
};

// ─── Crystal SVG ─────────────────────────────────────────────────────────────

function CrystalSVG({ moodId, isHovered, size = 110 }) {
  const m = MOODS[moodId];
  const h = size * 1.2;
  const gid = `g${moodId}`;
  const rid = `r${moodId}`;
  const fid = `f${moodId}`;

  return (
    <svg
      width={size} height={h}
      viewBox="0 0 80 96"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={m.bodyLight} />
          <stop offset="55%"  stopColor={m.body} />
          <stop offset="100%" stopColor={m.bodyDark} />
        </linearGradient>
        <radialGradient id={rid} cx="35%" cy="28%" r="55%">
          <stop offset="0%"   stopColor={m.shine}  stopOpacity="0.9" />
          <stop offset="100%" stopColor={m.body}   stopOpacity="0" />
        </radialGradient>
        <filter id={fid} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={isHovered ? 4 : 2} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer ambient glow */}
      <ellipse
        cx="40" cy="56" rx="33" ry="40"
        fill={m.glow}
        opacity={isHovered ? 0.65 : 0.22}
        style={{ transition: 'opacity 0.3s' }}
      />

      {/* Main hexagonal body */}
      <path
        d="M 40,4 L 70,24 L 70,72 L 40,92 L 10,72 L 10,24 Z"
        fill={`url(#${gid})`}
        filter={`url(#${fid})`}
        opacity={moodId === 'exhausted' ? 0.72 : 1}
      />

      {/* Top-left bright facet */}
      <path d="M 40,4 L 10,24 L 40,30 Z" fill="rgba(255,255,255,0.35)" />
      {/* Top-right dimmer facet */}
      <path d="M 40,4 L 70,24 L 40,30 Z" fill="rgba(255,255,255,0.20)" />
      {/* Left shadow facet */}
      <path d="M 10,24 L 10,72 L 40,65 L 40,30 Z" fill="rgba(0,0,0,0.10)" />
      {/* Bottom reflection */}
      <path d="M 10,72 L 40,92 L 70,72 L 40,80 Z" fill="rgba(0,0,0,0.14)" />

      {/* Inner radial glow overlay */}
      <path
        d="M 40,4 L 70,24 L 70,72 L 40,92 L 10,72 L 10,24 Z"
        fill={`url(#${rid})`}
      />

      {/* Shine streaks */}
      <line x1="18" y1="30" x2="15" y2="57"
        stroke="rgba(255,255,255,0.55)" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="24" y1="26" x2="22" y2="41"
        stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Face ── */}

      {moodId === 'energized' && (
        <>
          {/* Arch eyes */}
          <path d="M 26,50 Q 30,44 34,50" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 46,50 Q 50,44 54,50" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Eye sparkles */}
          <circle cx="34" cy="47" r="1.5" fill="white" />
          <circle cx="54" cy="47" r="1.5" fill="white" />
          {/* Rosy cheeks */}
          <ellipse cx="20" cy="58" rx="5.5" ry="3.5" fill="#FECDD3" opacity="0.55" />
          <ellipse cx="60" cy="58" rx="5.5" ry="3.5" fill="#FECDD3" opacity="0.55" />
          {/* Big smile */}
          <path d="M 28,65 Q 40,77 52,65"
            stroke="white" strokeWidth="2.5"
            fill="rgba(255,255,255,0.18)" strokeLinecap="round" />
        </>
      )}

      {moodId === 'content' && (
        <>
          <circle cx="29" cy="52" r="4.5" fill="white" />
          <circle cx="51" cy="52" r="4.5" fill="white" />
          <circle cx="30.5" cy="50.5" r="2.5" fill={m.bodyDark} />
          <circle cx="52.5" cy="50.5" r="2.5" fill={m.bodyDark} />
          <circle cx="31.5" cy="49.5" r="1"   fill="white" opacity="0.8" />
          <circle cx="53.5" cy="49.5" r="1"   fill="white" opacity="0.8" />
          <path d="M 32,65 Q 40,72 48,65"
            stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}

      {moodId === 'tired' && (
        <>
          {/* Half-open eyes */}
          <ellipse cx="29" cy="54" rx="4.5" ry="3.5" fill="white" opacity="0.82" />
          <ellipse cx="51" cy="54" rx="4.5" ry="3.5" fill="white" opacity="0.82" />
          {/* Droopy upper lids */}
          <path d="M 24.5,52 Q 29,49 33.5,52" fill={m.body} />
          <path d="M 46.5,52 Q 51,49 55.5,52" fill={m.body} />
          {/* Small smile */}
          <path d="M 34,66 Q 40,71 46,66"
            stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.75" />
          {/* Sweat drop */}
          <ellipse cx="63" cy="36" rx="2.5" ry="4"  fill="#93C5FD" opacity="0.85" />
          <circle  cx="63" cy="32" r="1.5"           fill="#93C5FD" opacity="0.85" />
        </>
      )}

      {moodId === 'exhausted' && (
        <>
          {/* Slit eyes */}
          <line x1="24" y1="56" x2="34" y2="57" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          <line x1="46" y1="56" x2="56" y2="57" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          {/* Under-eye arcs */}
          <path d="M 24,59 Q 29,62 34,59" stroke={m.bodyDark} strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M 46,59 Q 51,62 56,59" stroke={m.bodyDark} strokeWidth="1" fill="none" opacity="0.4" />
          {/* Flat mouth */}
          <line x1="34" y1="68" x2="46" y2="68" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          {/* Two sweat drops */}
          <ellipse cx="63" cy="33" rx="2"   ry="3.5" fill="#93C5FD" opacity="0.9" />
          <circle  cx="63" cy="29.5" r="1.2"         fill="#93C5FD" opacity="0.9" />
          <ellipse cx="67" cy="43" rx="1.5" ry="2.5" fill="#93C5FD" opacity="0.7" />
          <circle  cx="67" cy="40.5" r="1"            fill="#93C5FD" opacity="0.7" />
        </>
      )}
    </svg>
  );
}

// ─── Sparkle particle ────────────────────────────────────────────────────────

const SPARKLE_POSITIONS = [
  { left: -22, top: 8 },  { left: 112, top: 4 },
  { left: -28, top: 55 }, { left: 118, top: 50 },
  { left: 18,  top: -18 },{ left: 72,  top: -14 },
];

function Sparkles({ color }) {
  return (
    <>
      {SPARKLE_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          style={{ position: 'absolute', left: pos.left, top: pos.top, pointerEvents: 'none' }}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: -28 }}
          transition={{
            duration: 1.3,
            delay: i * 0.22,
            repeat: Infinity,
            repeatDelay: 1.2 + i * 0.3,
            ease: 'easeOut',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24">
            <path
              d="M12 2 L13.5 9.5 L21 8 L15 13.5 L17.5 21 L12 16.5 L6.5 21 L9 13.5 L3 8 L10.5 9.5 Z"
              fill={color} opacity="0.9"
            />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

// ─── ZZZ particle ────────────────────────────────────────────────────────────

function ZzzParticles() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', right: -6, top: 8,
            fontSize: 13 - i * 2,
            fontWeight: 800, color: '#93C5FD',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{ opacity: [0, 0.9, 0.9, 0], y: -32, x: 14 }}
          transition={{ duration: 2.6, delay: i * 1.0, repeat: Infinity, repeatDelay: 0.6 }}
        >
          z
        </motion.div>
      ))}
    </>
  );
}

// ─── Usage progress bar ──────────────────────────────────────────────────────

function UsageBar({ label, used, limit, unit, color }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const barColor = pct > 75 ? '#EF4444' : pct > 50 ? '#F59E0B' : color;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 11, color: '#6B7280' }}>
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: '#F3F4F6', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 4, background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div style={{ textAlign: 'right', fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
        {pct.toFixed(0)}% used
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CrystalPet() {
  const [usage,      setUsage]      = useState(loadUsage);
  const [showPanel,  setShowPanel]  = useState(false);
  const [isEditing,  setIsEditing]  = useState(false);
  const [editValues, setEditValues] = useState({});
  const [isHovered,  setIsHovered]  = useState(false);
  const [showMsg,    setShowMsg]    = useState(false);

  const isDragging = useRef(false);
  const msgTimer   = useRef(null);
  const petRef     = useRef(null);

  const savedPos = loadPos();
  const mx = useMotionValue(savedPos.x);
  const my = useMotionValue(savedPos.y);

  const moodId = getMoodId(usage.dailyUsed, usage.dailyLimit, usage.weeklyUsed, usage.weeklyLimit);
  const mood   = MOODS[moodId];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleClick = useCallback(() => {
    if (isDragging.current) return;
    setShowPanel(p => !p);
    setIsEditing(false);
    clearTimeout(msgTimer.current);
    setShowMsg(true);
    msgTimer.current = setTimeout(() => setShowMsg(false), 3000);
  }, []);

  const startEdit = useCallback(() => {
    setEditValues({
      dailyUsed:   usage.dailyUsed,
      dailyLimit:  usage.dailyLimit,
      weeklyUsed:  usage.weeklyUsed,
      weeklyLimit: usage.weeklyLimit,
      unit:        usage.unit,
    });
    setIsEditing(true);
  }, [usage]);

  const handleSave = useCallback(() => {
    const updated = {
      dailyUsed:   Math.max(0, Number(editValues.dailyUsed)   || 0),
      dailyLimit:  Math.max(1, Number(editValues.dailyLimit)  || 45),
      weeklyUsed:  Math.max(0, Number(editValues.weeklyUsed)  || 0),
      weeklyLimit: Math.max(1, Number(editValues.weeklyLimit) || 200),
      unit:        editValues.unit || 'messages',
      lastUpdated: new Date().toISOString(),
    };
    setUsage(updated);
    saveUsage(updated);
    setIsEditing(false);
  }, [editValues]);

  // ── Outside-click to close panel ──────────────────────────────────────────

  useEffect(() => {
    if (!showPanel) return;
    const handler = (e) => {
      if (petRef.current && !petRef.current.contains(e.target)) {
        setShowPanel(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPanel]);

  useEffect(() => () => clearTimeout(msgTimer.current), []);

  // ── Last-updated label ────────────────────────────────────────────────────

  const lastUpdatedLabel = () => {
    if (!usage.lastUpdated) return 'Never updated';
    const diff  = Date.now() - new Date(usage.lastUpdated).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (days  > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins  > 0) return `${mins}m ago`;
    return 'Just now';
  };

  // ── Shared input/button styles ────────────────────────────────────────────

  const inputStyle = {
    width: '100%', padding: '6px 8px', border: '1.5px solid #E5E7EB',
    borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      ref={petRef}
      drag
      dragMomentum={false}
      style={{ x: mx, y: my, position: 'relative', cursor: 'grab', userSelect: 'none' }}
      onDragStart={() => { isDragging.current = true; }}
      onDragEnd={() => {
        savePos(mx.get(), my.get());
        setTimeout(() => { isDragging.current = false; }, 60);
      }}
    >
      {/* Crystal + particles container */}
      <div style={{ position: 'relative', width: 110, height: 132 }}>

        {/* Particles */}
        {mood.particles === 'sparkles' && <Sparkles color={mood.shine} />}
        {mood.particles === 'zzz'      && <ZzzParticles />}

        {/* Speech bubble */}
        <AnimatePresence>
          {showMsg && (
            <motion.div
              key="bubble"
              initial={{ opacity: 0, y: 8, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.9 }}
              transition={{ type: 'spring', damping: 18, stiffness: 280 }}
              style={{
                position: 'absolute', bottom: '108%',
                left: '50%', transform: 'translateX(-50%)',
                background: 'white', borderRadius: 14,
                padding: '7px 14px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700,
                color: '#374151', border: '1.5px solid #F3F4F6',
                pointerEvents: 'none', zIndex: 10,
              }}
            >
              {mood.message}
              {/* Triangle pointer */}
              <div style={{
                position: 'absolute', bottom: -7, left: '50%',
                transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '7px solid white',
                filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.05))',
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating crystal */}
        <motion.div
          animate={{ y: mood.floatY }}
          transition={{ repeat: Infinity, duration: mood.floatDur, ease: 'easeInOut' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ cursor: 'pointer', display: 'inline-block' }}
        >
          <CrystalSVG moodId={moodId} isHovered={isHovered} size={110} />
        </motion.div>

        {/* Mood badge */}
        <div style={{
          position: 'absolute', bottom: -12,
          left: '50%', transform: 'translateX(-50%)',
          background: mood.body, color: 'white',
          borderRadius: 20, padding: '3px 10px',
          fontSize: 10, fontWeight: 800,
          whiteSpace: 'nowrap',
          boxShadow: `0 2px 10px ${mood.body}55`,
        }}>
          {mood.emoji} {mood.label}
        </div>
      </div>

      {/* Stats panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            style={{
              position: 'absolute', bottom: '120%', right: 0,
              width: 268, background: 'white',
              borderRadius: 22, padding: '18px 16px',
              boxShadow: '0 8px 40px rgba(100,60,180,0.18)',
              border: `1.5px solid ${mood.glow}`,
              zIndex: 20,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 30, lineHeight: 1 }}>💎</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1F2937' }}>Crystal Mochi</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: mood.body }}>
                  {mood.emoji} {mood.label}
                </div>
              </div>
              <button
                onClick={() => { setShowPanel(false); setIsEditing(false); }}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 18, color: '#9CA3AF',
                  lineHeight: 1, padding: '2px 4px', borderRadius: 6,
                }}
              >
                ×
              </button>
            </div>

            {!isEditing ? (
              <>
                {/* Usage bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <UsageBar
                    label="Daily Usage" used={usage.dailyUsed}
                    limit={usage.dailyLimit} unit={usage.unit} color={mood.body}
                  />
                  <UsageBar
                    label="Weekly Usage" used={usage.weeklyUsed}
                    limit={usage.weeklyLimit} unit={usage.unit} color={mood.body}
                  />
                </div>

                <div style={{ height: 1, background: '#F3F4F6', margin: '14px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#9CA3AF' }}>
                    Updated: {lastUpdatedLabel()}
                  </span>
                  <button
                    onClick={startEdit}
                    style={{
                      background: mood.body, color: 'white',
                      border: 'none', borderRadius: 10,
                      padding: '6px 13px', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    Update Usage
                  </button>
                </div>

                <p style={{ fontSize: 9.5, color: '#D1D5DB', marginTop: 10, textAlign: 'center' }}>
                  Check usage at console.anthropic.com
                </p>
              </>
            ) : (
              /* Edit form */
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 12 }}>
                  Update Your Usage
                </div>

                {[
                  { label: 'Daily Used',    key: 'dailyUsed' },
                  { label: 'Daily Limit',   key: 'dailyLimit' },
                  { label: 'Weekly Used',   key: 'weeklyUsed' },
                  { label: 'Weekly Limit',  key: 'weeklyLimit' },
                ].map(({ label, key }) => (
                  <div key={key} style={{ marginBottom: 9 }}>
                    <label style={{
                      display: 'block', fontSize: 10, fontWeight: 700,
                      color: '#6B7280', marginBottom: 3,
                    }}>
                      {label}
                    </label>
                    <input
                      type="number"
                      value={editValues[key] ?? ''}
                      onChange={(e) => setEditValues((v) => ({ ...v, [key]: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: 14 }}>
                  <label style={{
                    display: 'block', fontSize: 10, fontWeight: 700,
                    color: '#6B7280', marginBottom: 3,
                  }}>
                    Unit
                  </label>
                  <select
                    value={editValues.unit || 'messages'}
                    onChange={(e) => setEditValues((v) => ({ ...v, unit: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="messages">Messages</option>
                    <option value="tokens">Tokens</option>
                    <option value="requests">Requests</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      flex: 1, padding: '8px', border: '1.5px solid #E5E7EB',
                      borderRadius: 10, fontSize: 11, cursor: 'pointer',
                      background: 'white', fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      flex: 2, padding: '8px', background: mood.body,
                      color: 'white', border: 'none', borderRadius: 10,
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Save ✓
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
