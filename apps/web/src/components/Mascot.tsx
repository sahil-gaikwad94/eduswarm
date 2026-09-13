import React, { useId } from 'react';
import { motion } from 'framer-motion';

/**
 * Doddly — the EduSwarm honey-bee mascot.
 *
 * Hand-built SVG, animated with framer-motion spring/keyframe variants so the
 * character has real weight: floating, blinking, wing flutter, waving arms.
 * Render it anywhere at any size; moods drive the performance.
 */

export type MascotMood = 'idle' | 'wave' | 'dance' | 'think' | 'cheer';

const INK = '#241d33';

const floatByMood: Record<MascotMood, any> = {
  idle: { y: [0, -9, 0], rotate: [-1.5, 1.5, -1.5], transition: { duration: 2.9, repeat: Infinity, ease: 'easeInOut' } },
  wave: { y: [0, -8, 0], rotate: [0, 1, 0], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  dance: { y: [0, -15, 0], rotate: [-6, 6, -6], transition: { duration: 0.62, repeat: Infinity, ease: 'easeInOut' } },
  think: { y: [0, -5, 0], rotate: [-3, -1, -3], transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } },
  cheer: { y: [0, -22, 0], rotate: [-3, 3, -3], transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } },
};

const shadowByMood: Record<MascotMood, any> = {
  idle: { scaleX: [1, 0.86, 1], transition: { duration: 2.9, repeat: Infinity, ease: 'easeInOut' } },
  wave: { scaleX: [1, 0.88, 1], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  dance: { scaleX: [1, 0.7, 1], transition: { duration: 0.62, repeat: Infinity, ease: 'easeInOut' } },
  think: { scaleX: [1, 0.93, 1], transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } },
  cheer: { scaleX: [1, 0.6, 1], transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } },
};

const wingSpeed = (mood: MascotMood) => (mood === 'dance' || mood === 'cheer' ? 0.22 : mood === 'think' ? 0.9 : 0.5);

const armLeftByMood: Record<MascotMood, any> = {
  idle: { rotate: [18, 26, 18], transition: { duration: 2.9, repeat: Infinity, ease: 'easeInOut' } },
  wave: { rotate: [18, 28, 18], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  dance: { rotate: [30, -55, 30], transition: { duration: 0.62, repeat: Infinity, ease: 'easeInOut' } },
  think: { rotate: [12, 16, 12], transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } },
  cheer: { rotate: [-60, -48, -60], transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } },
};

const armRightByMood: Record<MascotMood, any> = {
  idle: { rotate: [-18, -26, -18], transition: { duration: 2.9, repeat: Infinity, ease: 'easeInOut' } },
  wave: { rotate: [-35, 25, -35], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } },
  dance: { rotate: [-30, 55, -30], transition: { duration: 0.62, repeat: Infinity, ease: 'easeInOut', delay: 0.31 } },
  think: { rotate: [-8, -12, -8], transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } },
  cheer: { rotate: [60, 48, 60], transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } },
};

const fillBox = { transformBox: 'fill-box' as const };

export function Mascot({ size = 200, mood = 'idle', className = '' }: { size?: number; mood?: MascotMood; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const body = `doddly-body-${uid}`;
  const wing = `doddly-wing-${uid}`;
  const clip = `doddly-clip-${uid}`;
  const excited = mood === 'cheer' || mood === 'dance';
  const smilePath = excited
    ? 'M93 122 Q110 146 127 122 Q110 132 93 122 Z'
    : mood === 'think'
      ? 'M102 128 Q110 132 118 128'
      : 'M96 123 Q110 137 124 123';

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 220 232"
      className={`doddly doddly-${mood} ${className}`}
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd964" />
          <stop offset="55%" stopColor="#ffbe33" />
          <stop offset="100%" stopColor="#f59d10" />
        </linearGradient>
        <linearGradient id={wing} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eaf7ff" />
          <stop offset="100%" stopColor="#bfe4ff" />
        </linearGradient>
        <clipPath id={clip}>
          <rect x="58" y="58" width="104" height="124" rx="52" />
        </clipPath>
      </defs>

      {/* ground shadow */}
      <motion.ellipse
        cx="110" cy="217" rx="46" ry="9" fill={INK} opacity="0.13"
        animate={shadowByMood[mood]} style={{ ...fillBox, transformOrigin: 'center' }}
      />

      <motion.g animate={floatByMood[mood]} style={{ ...fillBox, transformOrigin: 'center' }}>
        {/* wings */}
        <motion.ellipse
          cx="46" cy="86" rx="30" ry="40" fill={`url(#${wing})`} stroke="#a5d4f4" strokeWidth="3" opacity="0.92"
          animate={{ rotate: [-14, 16, -14] }}
          transition={{ duration: wingSpeed(mood), repeat: Infinity, ease: 'easeInOut' }}
          style={{ ...fillBox, transformOrigin: '90% 70%' }}
        />
        <motion.ellipse
          cx="174" cy="86" rx="30" ry="40" fill={`url(#${wing})`} stroke="#a5d4f4" strokeWidth="3" opacity="0.92"
          animate={{ rotate: [14, -16, 14] }}
          transition={{ duration: wingSpeed(mood), repeat: Infinity, ease: 'easeInOut' }}
          style={{ ...fillBox, transformOrigin: '10% 70%' }}
        />

        {/* antennae */}
        <motion.g
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: mood === 'dance' ? 0.62 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ ...fillBox, transformOrigin: '50% 100%' }}
        >
          <path d="M96 62 C92 44 86 36 78 30" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="76" cy="27" r="7" fill="#ffd964" stroke={INK} strokeWidth="4.5" />
          <path d="M124 62 C128 44 134 36 142 30" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cx="144" cy="27" r="7" fill="#ffd964" stroke={INK} strokeWidth="4.5" />
        </motion.g>

        {/* arms (behind body) */}
        <motion.path
          d="M60 128 Q44 134 34 148" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round"
          animate={armLeftByMood[mood]} style={{ ...fillBox, transformOrigin: '100% 0%' }}
        />
        <motion.path
          d="M160 128 Q176 134 186 148" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round"
          animate={armRightByMood[mood]} style={{ ...fillBox, transformOrigin: '0% 0%' }}
        />

        {/* body */}
        <rect x="58" y="58" width="104" height="124" rx="52" fill={`url(#${body})`} stroke={INK} strokeWidth="5.5" />
        <g clipPath={`url(#${clip})`}>
          <rect x="52" y="140" width="116" height="15" fill="#6b4310" opacity="0.85" />
          <rect x="52" y="163" width="116" height="15" fill="#6b4310" opacity="0.85" />
          <ellipse cx="84" cy="74" rx="26" ry="14" fill="#fff" opacity="0.35" />
        </g>

        {/* feet */}
        <ellipse cx="92" cy="185" rx="13" ry="7" fill="#b97b16" stroke={INK} strokeWidth="4.5" />
        <ellipse cx="128" cy="185" rx="13" ry="7" fill="#b97b16" stroke={INK} strokeWidth="4.5" />

        {/* face */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.06, 1] }}
          transition={{ duration: mood === 'cheer' ? 2.2 : 3.9, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
          style={{ ...fillBox, transformOrigin: 'center' }}
        >
          <circle cx="88" cy="97" r="14" fill="#fff" stroke={INK} strokeWidth="4" />
          <circle cx="132" cy="97" r="14" fill="#fff" stroke={INK} strokeWidth="4" />
          <circle cx={mood === 'think' ? 85 : 90} cy={mood === 'think' ? 94 : 99} r="6.3" fill={INK} />
          <circle cx={mood === 'think' ? 129 : 134} cy={mood === 'think' ? 94 : 99} r="6.3" fill={INK} />
          <circle cx={mood === 'think' ? 83 : 88} cy={mood === 'think' ? 92 : 96.5} r="2.1" fill="#fff" />
          <circle cx={mood === 'think' ? 127 : 132} cy={mood === 'think' ? 92 : 96.5} r="2.1" fill="#fff" />
        </motion.g>
        <ellipse cx="76" cy="116" rx="9" ry="5.5" fill="#ff9d8a" opacity="0.7" />
        <ellipse cx="144" cy="116" rx="9" ry="5.5" fill="#ff9d8a" opacity="0.7" />
        <motion.path
          key={smilePath}
          d={excited ? 'M93 122 Q110 144 127 122 Z' : smilePath}
          fill={excited ? '#5b2b22' : 'none'}
          stroke={INK} strokeWidth="4.5" strokeLinecap="round"
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          style={{ ...fillBox, transformOrigin: 'center' }}
        />
      </motion.g>
    </motion.svg>
  );
}

/** Compact static Doddly face — used for avatars and small chrome. */
export function MascotFace({ className = '' }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = `doddly-face-${uid}`;
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd964" />
          <stop offset="100%" stopColor="#f59d10" />
        </linearGradient>
      </defs>
      <path d="M26 12 C24 7 21 5 18 4" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="17" cy="3" r="3.4" fill="#ffd964" stroke={INK} strokeWidth="2.4" />
      <path d="M38 12 C40 7 43 5 46 4" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="47" cy="3" r="3.4" fill="#ffd964" stroke={INK} strokeWidth="2.4" />
      <rect x="10" y="10" width="44" height="48" rx="22" fill={`url(#${g})`} stroke={INK} strokeWidth="3.4" />
      <circle cx="24" cy="30" r="7.4" fill="#fff" stroke={INK} strokeWidth="2.6" />
      <circle cx="40" cy="30" r="7.4" fill="#fff" stroke={INK} strokeWidth="2.6" />
      <circle cx="25.4" cy="31.4" r="3.2" fill={INK} />
      <circle cx="41.4" cy="31.4" r="3.2" fill={INK} />
      <ellipse cx="18" cy="40" rx="4.4" ry="2.6" fill="#ff9d8a" opacity="0.75" />
      <ellipse cx="46" cy="40" rx="4.4" ry="2.6" fill="#ff9d8a" opacity="0.75" />
      <path d="M26 43 Q32 50 38 43" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Orbiting sparkles that give hero/loader stages a little swarm magic. */
export function Sparkles({ radius = 150, count = 5 }: { radius?: number; count?: number }) {
  const glyphs = ['✦', '✧', '✦', '⭑', '✧'];
  return (
    <motion.div
      className="sparkle-ring"
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.62;
        return (
          <motion.span
            key={i}
            className={`sparkle sparkle-${i % 3}`}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 1.6 + i * 0.35, repeat: Infinity, ease: 'easeInOut' }}
          >
            {glyphs[i % glyphs.length]}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
