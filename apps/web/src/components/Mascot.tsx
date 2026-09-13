import React, { useEffect, useId, useRef } from 'react';
import { motion, useMotionValue, useSpring, type MotionValue } from 'framer-motion';

/**
 * Doddly — the EduSwarm flame mascot.
 *
 * A little red-orange flame blob, hand-built as SVG and animated with
 * framer-motion so the character has real weight: flame flicker, floating,
 * blinking, raised arm nubs, marching feet and mood-driven faces —
 * friendly, watching, sly, joy, confusion, gusto, angry, upset, walk.
 * Render it anywhere at any size; moods drive the performance.
 */

export type MascotMood =
  | 'idle' | 'watching' | 'wave' | 'dance' | 'think' | 'cheer' | 'gusto' | 'angry' | 'upset' | 'walk';

const BODY = '#f04e2c';
const INK = '#241d2b';

/* The flame silhouette, drawn to match the reference: two slim tips (left one
   curling left, the tall main tip leaning right), a small right shoulder nub,
   smooth egg-shaped cheeks and a scalloped bottom. Reused by the full mascot
   and the avatar. */
const FLAME =
  'M76 198 C62 198 53 190 51 176 C49 160 49 144 50 128 C51 112 53 98 57 86 ' +
  'C59 76 61 66 63 58 C64 44 66 30 69 20 C68 15 72 13 76 19 C78 26 79 33 81 40 ' +
  'C83 44 85 46 88 46 C92 38 96 28 101 19 C105 11 112 8 116 14 C121 22 126 32 130 42 ' +
  'C135 36 142 35 147 41 C152 47 155 57 157 68 C159 82 158 97 160 112 ' +
  'C162 130 168 146 168 162 C168 181 158 196 144 198 C140 199 135 193 130 193 ' +
  'C125 193 122 199 117 199 C112 199 105 193 100 193 C95 193 92 199 87 199 ' +
  'C82 199 79 198 76 198 Z';

const EYE_L = { cx: 86, cy: 118 };
const EYE_R = { cx: 134, cy: 118 };
const EYE_RR = 16;

type LidStyle = 'none' | 'sly' | 'flat' | 'angry' | 'sad';

/** Per-mood face, mapped from the reference sheet:
 *  idle → friendly · watching → watching · wave → sly · dance/cheer → joy
 *  think → confusion · gusto → gusto · angry → angry · upset → upset · walk → walk */
const FACES: Record<MascotMood, { lid: LidStyle; mouth: string; arms: 'none' | 'right' | 'both'; armAngle?: number }> = {
  idle: { lid: 'none', mouth: 'M98 147 Q109 157 120 147', arms: 'none' },
  watching: { lid: 'none', mouth: 'O', arms: 'none' },
  wave: { lid: 'sly', mouth: 'M102 149 Q109 155 116 149', arms: 'right' },
  dance: { lid: 'none', mouth: 'OPEN', arms: 'both', armAngle: 26 },
  cheer: { lid: 'none', mouth: 'OPEN', arms: 'both', armAngle: 26 },
  think: { lid: 'none', mouth: 'M100 150 L118 146', arms: 'none' },
  gusto: { lid: 'flat', mouth: 'M97 148 Q103 153.5 109 148 Q115 153.5 121 148', arms: 'right' },
  angry: { lid: 'angry', mouth: 'OPEN_WIDE', arms: 'none' },
  upset: { lid: 'sad', mouth: 'M98 154 Q109 145 120 154', arms: 'none' },
  walk: { lid: 'none', mouth: 'M100 148 Q109 155 118 148', arms: 'right', armAngle: 35 },
};

/* Lid line endpoints relative to eye centre: [x1, y1, x2, y2] */
const LIDS: Record<Exclude<LidStyle, 'none'>, [number, number, number, number]> = {
  sly: [-14, -6, 14, -5],
  flat: [-14, -3, 14, -1],
  angry: [-14, -9, 14, -2],
  sad: [-14, 1, 14, -6],
};

const floatByMood: Record<MascotMood, any> = {
  idle: { y: [0, -8, 0], rotate: [-1, 1, -1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  watching: { y: [0, -7, 0], rotate: [-1, 1, -1], transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } },
  wave: { y: [0, -7, 0], rotate: [0, 1.5, 0], transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } },
  dance: { y: [0, -15, 0], rotate: [-4, 4, -4], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } },
  think: { y: [0, -5, 0], rotate: [-2.5, -0.5, -2.5], transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } },
  cheer: { y: [0, -21, 0], rotate: [-3, 3, -3], transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } },
  gusto: { y: [0, -9, 0], rotate: [0, 2, 0], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } },
  angry: { y: [0, -4, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } },
  upset: { y: [0, -3, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  walk: {
    x: [0, 22, 0, -22, 0], y: [0, -7, 0, -7, 0], rotate: [-3, 3, -3, 3, 0],
    transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

/** Flame flicker — the tips sway around a bottom anchor, like a real flame. */
const flickByMood: Record<MascotMood, any> = {
  idle: { skewX: [-1.4, 1.4, -1.4], scaleY: [1, 1.02, 1], transition: { duration: 1.7, repeat: Infinity, ease: 'easeInOut' } },
  watching: { skewX: [-1.2, 1.2, -1.2], scaleY: [1, 1.02, 1], transition: { duration: 1.9, repeat: Infinity, ease: 'easeInOut' } },
  wave: { skewX: [-1.6, 1.6, -1.6], scaleY: [1, 1.025, 1], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
  dance: { skewX: [-3, 3, -3], scaleY: [1, 1.05, 1], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } },
  think: { skewX: [-0.7, 0.7, -0.7], scaleY: [1, 1.01, 1], transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } },
  cheer: { skewX: [-2.4, 2.4, -2.4], scaleY: [1, 1.04, 1], transition: { duration: 0.62, repeat: Infinity, ease: 'easeInOut' } },
  gusto: { skewX: [-1.8, 1.8, -1.8], scaleY: [1, 1.03, 1], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } },
  angry: { skewX: [-2.6, 2.6, -2.6], scaleY: [1, 1.045, 1], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } },
  upset: { skewX: [-0.4, 0.4, -0.4], scaleY: [0.955, 0.975, 0.955], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } },
  walk: { skewX: [-1.8, 1.8, -1.8], scaleY: [1, 1.03, 1], transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' } },
};

const shadowByMood: Record<MascotMood, any> = {
  idle: { scaleX: [1, 0.87, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  watching: { scaleX: [1, 0.88, 1], transition: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' } },
  wave: { scaleX: [1, 0.89, 1], transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } },
  dance: { scaleX: [1, 0.7, 1], transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } },
  think: { scaleX: [1, 0.94, 1], transition: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } },
  cheer: { scaleX: [1, 0.62, 1], transition: { duration: 0.55, repeat: Infinity, ease: 'easeInOut' } },
  gusto: { scaleX: [1, 0.88, 1], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } },
  angry: { scaleX: [1, 0.9, 1], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } },
  upset: { scaleX: [1, 0.95, 1], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  walk: { scaleX: [1, 0.84, 1, 0.84, 1], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } },
};

const fillBox = { transformBox: 'fill-box' as const };

function Eye({ cx, cy, lid, left = true, px = 0, py = 0, clipId }: {
  cx: number; cy: number; lid: LidStyle; left?: boolean; px?: number | MotionValue<number>; py?: number | MotionValue<number>; clipId: string;
}) {
  const lidSpec = lid === 'none' ? null : LIDS[lid];
  const [x1, y1, x2, y2] = lidSpec
    ? (lid === 'angry' || lid === 'sad') && !left
      ? [lidSpec[2], lidSpec[3], lidSpec[0], lidSpec[1]]
      : [lidSpec[0], lidSpec[1], lidSpec[2], lidSpec[3]]
    : [0, 0, 0, 0];
  const pupilY = lid === 'none' ? cy + 2.5 : cy + 5.5;
  const pupilR = lid === 'none' ? 7 : 6.5;
  return (
    <g>
      <circle cx={cx} cy={cy} r={EYE_RR} fill="#fff" />
      <motion.g style={{ x: px, y: py }}>
        <circle cx={cx + 1.5} cy={pupilY} r={pupilR} fill={INK} />
      </motion.g>
      {lidSpec && (
        <g clipPath={`url(#${clipId})`}>
          <polygon
            points={`${cx - 17},${cy - 18} ${cx + 17},${cy - 18} ${cx + 17},${cy + y2} ${cx - 17},${cy + y1}`}
            fill={BODY}
          />
          <line x1={cx + x1} y1={cy + y1} x2={cx + x2} y2={cy + y2} stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function Mouth({ d, mood }: { d: string; mood: MascotMood }) {
  const pop = { initial: { scale: 0.6, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring' as const, stiffness: 420, damping: 18 } };
  if (d === 'O') return <motion.circle key={mood} cx="109" cy="150" r="3.4" fill={INK} style={{ ...fillBox, transformOrigin: 'center' }} {...pop} />;
  if (d === 'OPEN') return <motion.ellipse key={mood} cx="109" cy="151" rx="11" ry="12" fill={INK} style={{ ...fillBox, transformOrigin: 'center' }} {...pop} />;
  if (d === 'OPEN_WIDE') return (
    <motion.path key={mood} d="M97 146 Q109 142 121 146 Q125 155 119 163 Q109 168 99 163 Q93 155 97 146 Z" fill={INK}
      style={{ ...fillBox, transformOrigin: 'center' }} {...pop} />
  );
  return <motion.path key={mood} d={d} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" style={{ ...fillBox, transformOrigin: 'center' }} {...pop} />;
}

function Arms({ kind, angle, mood }: { kind: 'none' | 'right' | 'both'; angle?: number; mood: MascotMood }) {
  if (kind === 'none') return null;
  const a = angle ?? (mood === 'dance' || mood === 'cheer' ? 26 : 40);
  return (
    <g>
      {kind !== 'both' && <ellipse cx="172" cy="92" rx="10" ry="24" fill={BODY} transform={`rotate(${-a} 172 92)`} />}
      {kind === 'both' && (
        <>
          <ellipse cx="172" cy="92" rx="10" ry="24" fill={BODY} transform={`rotate(${-a} 172 92)`} />
          <ellipse cx="48" cy="92" rx="10" ry="24" fill={BODY} transform={`rotate(${a} 48 92)`} />
        </>
      )}
    </g>
  );
}

/** Marching feet — only visible while walking, alternating up and down. */
function Feet() {
  return (
    <g>
      <motion.ellipse
        cx="95" cy="204" rx="8.5" ry="5" fill={BODY}
        animate={{ y: [0, -8, 0, 0] }} transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.25, 0.5, 1], ease: 'easeInOut' }}
      />
      <motion.ellipse
        cx="125" cy="204" rx="8.5" ry="5" fill={BODY}
        animate={{ y: [0, 0, 0, -8] }} transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.25, 0.5, 1], ease: 'easeInOut' }}
      />
    </g>
  );
}

export function Mascot({ size = 200, mood = 'idle', className = '', eyesFollow = false }: {
  size?: number; mood?: MascotMood; className?: string;
  /** When true, Doddly's pupils softly track the visitor's cursor. */
  eyesFollow?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clipL = `flame-eye-l-${uid}`;
  const clipR = `flame-eye-r-${uid}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilX = useMotionValue(0);
  const pupilY = useMotionValue(0);
  const followX = useSpring(pupilX, { stiffness: 260, damping: 22 });
  const followY = useSpring(pupilY, { stiffness: 260, damping: 22 });

  useEffect(() => {
    if (!eyesFollow) return;
    const onMove = (event: MouseEvent) => {
      const el = svgRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2 || 1);
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2 || 1);
      pupilX.set(Math.max(-1, Math.min(1, dx)) * 3.2);
      pupilY.set(Math.max(-1, Math.min(1, dy)) * 2.8);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [eyesFollow, pupilX, pupilY]);

  const face = FACES[mood];
  const blink = {
    scaleY: [1, 1, 0.06, 1],
    transition: { duration: mood === 'cheer' || mood === 'dance' ? 2.4 : 3.8, repeat: Infinity, times: [0, 0.9, 0.95, 1] },
  };

  return (
    <motion.svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 220 232"
      className={`doddly doddly-${mood} ${className}`.trim()}
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      <defs>
        <clipPath id={clipL}><circle cx={EYE_L.cx} cy={EYE_L.cy} r={EYE_RR} /></clipPath>
        <clipPath id={clipR}><circle cx={EYE_R.cx} cy={EYE_R.cy} r={EYE_RR} /></clipPath>
      </defs>

      {/* ground shadow */}
      <motion.ellipse
        cx="110" cy="216" rx="44" ry="8.5" fill={INK} opacity="0.12"
        animate={shadowByMood[mood]} style={{ ...fillBox, transformOrigin: 'center' }}
      />

      <motion.g animate={floatByMood[mood]} style={{ ...fillBox, transformOrigin: 'center' }}>
        <motion.g animate={flickByMood[mood]} style={{ ...fillBox, transformOrigin: '50% 100%' }}>
          {/* arms (behind body) */}
          <Arms kind={face.arms} angle={face.armAngle} mood={mood} />

          {/* flame body */}
          <path d={FLAME} fill={BODY} />

          {/* face */}
          <motion.g animate={blink} style={{ ...fillBox, transformOrigin: 'center' }}>
            <Eye cx={EYE_L.cx} cy={EYE_L.cy} lid={face.lid} left px={eyesFollow ? followX : 0} py={eyesFollow ? followY : 0} clipId={clipL} />
            <Eye cx={EYE_R.cx} cy={EYE_R.cy} lid={face.lid} left={false} px={eyesFollow ? followX : 0} py={eyesFollow ? followY : 0} clipId={clipR} />
          </motion.g>
          <Mouth d={face.mouth} mood={mood} />
        </motion.g>

        {/* feet, only while walking */}
        {mood === 'walk' && <Feet />}
      </motion.g>
    </motion.svg>
  );
}

/** Compact static flame face — used for avatars and small chrome. */
export function MascotFace({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="36 4 148 204" className={className} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden>
      <path d={FLAME} fill={BODY} />
      <circle cx={EYE_L.cx} cy={EYE_L.cy} r={EYE_RR} fill="#fff" />
      <circle cx={EYE_R.cx} cy={EYE_R.cy} r={EYE_RR} fill="#fff" />
      <circle cx={EYE_L.cx + 1.5} cy={EYE_L.cy + 2.5} r="7" fill={INK} />
      <circle cx={EYE_R.cx + 1.5} cy={EYE_R.cy + 2.5} r="7" fill={INK} />
      <path d="M98 147 Q109 157 120 147" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
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
