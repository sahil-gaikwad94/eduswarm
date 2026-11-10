/**
 * EduSwarm icon set — inline SVGs, stroke-based, 2px line weight, currentColor.
 * Sized to 20px by default; pass size to override.
 */
import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const base = ({ size = 20, ...rest }: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...rest,
});

export const Icon = {
  Logo: (p: IconProps) => (
    <svg {...base(p)} strokeWidth="0" fill="currentColor">
      <path d="M12 2l3.1 7.6L22.5 12l-7.4 1.6L12 21.2l-3.1-7.6L1.5 12l7.4-2.4L12 2z" />
    </svg>
  ),
  Sparkle: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 3l1.9 4.6 4.6 1.4-4.6 1.9L12 15.5l-1.9-4.6-4.6-1.9 4.6-1.4L12 3z" />
    </svg>
  ),
  Home: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 11.5L12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-8.5z" />
    </svg>
  ),
  Practise: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M9 12.5l2.2 2.1 4.3-4.4" />
    </svg>
  ),
  Discussions: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 5h16v11a2 2 0 0 1-2 2H9l-5 4V5z" />
    </svg>
  ),
  CurrentLesson: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Mission: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  ),
  Library: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 4h5v16H4z" />
      <path d="M9 4h5v16H9z" />
      <path d="M14 4l5 2v14l-5-2" />
    </svg>
  ),
  Flashcards: (p: IconProps) => (
    <svg {...base(p)}>
      <rect x="3" y="7" width="15" height="12" rx="2" />
      <path d="M18 5l3 3-3 3" />
    </svg>
  ),
  Progress: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M4 19L9.5 11.5l4 3L20 5" />
      <path d="M15 5h5v5" />
    </svg>
  ),
  Mistakes: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 4v9" />
      <path d="M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  Profile: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  Flame: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M12 3c1.5 3.5-1 4.5-1 7a3.5 3.5 0 0 0 7 0C18 6.5 14 6 12 3z" />
      <path d="M9 13a4 4 0 1 0 6 4" />
    </svg>
  ),
  Check: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  ),
  Search: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </svg>
  ),
  Sun: (p: IconProps) => (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  Moon: (p: IconProps) => (
    <svg {...base(p)}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),

  ChevronDown: (p: IconProps) => (
    <svg {...base(p)}><path d="M6 9l6 6 6-6" /></svg>
  ),
  ChevronRight: (p: IconProps) => (
    <svg {...base(p)}><path d="M9 6l6 6-6 6" /></svg>
  ),
  ArrowRight: (p: IconProps) => (
    <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  ),
  ArrowLeft: (p: IconProps) => (
    <svg {...base(p)}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
  ),
  Star: (p: IconProps) => (
    <svg {...base(p)} fill="currentColor" strokeWidth="0"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
  ),
  StarOutline: (p: IconProps) => (
    <svg {...base(p)}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" /></svg>
  ),
  AlertTriangle: (p: IconProps) => (
    <svg {...base(p)}><path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>
  ),
  CircleDot: (p: IconProps) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" strokeWidth="0"/></svg>
  ),
  Circle: (p: IconProps) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="8"/></svg>
  ),
  Clock: (p: IconProps) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  ),
  Trophy: (p: IconProps) => (
    <svg {...base(p)}><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z"/><path d="M5 6h2a2 2 0 0 0 2 2M17 6h2a2 2 0 0 1-2 2"/></svg>
  ),
  ShieldCheck: (p: IconProps) => (
    <svg {...base(p)}><path d="M12 3l8 4v6a8 8 0 0 1-16 0V7l8-4z"/><path d="M9.5 12l2 2 3.5-3.5"/></svg>
  ),
  Bookmark: (p: IconProps) => (
    <svg {...base(p)}><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>
  ),
  BookOpen: (p: IconProps) => (
    <svg {...base(p)}><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>
  ),
  Sparkles: (p: IconProps) => (
    <svg {...base(p)}><path d="M12 3l1.9 4.6 4.6 1.4-4.6 1.9L12 15.5l-1.9-4.6-4.6-1.9 4.6-1.4L12 3z"/><path d="M19 11l.7 1.8 1.8.6-1.8.6-.7 1.8-.7-1.8-1.8-.6 1.8-.6.7-1.8z"/></svg>
  ),
  Layers: (p: IconProps) => (
    <svg {...base(p)}><path d="M12 2l10 5-10 5L2 7l10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></svg>
  ),
  Zap: (p: IconProps) => (
    <svg {...base(p)}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>
  ),
  LogOut: (p: IconProps) => (
    <svg {...base(p)}><path d="M15 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-3"/><path d="M17 9l4 3-4 3"/></svg>
  ),
  Menu: (p: IconProps) => (
    <svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16"/></svg>
  ),
  X: (p: IconProps) => (
    <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18"/></svg>
  ),
  Globe: (p: IconProps) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></svg>
  ),
  CheckCircle: (p: IconProps) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>
  ),
  ChevronUp: (p: IconProps) => (
    <svg {...base(p)}><path d="M6 15l6-6 6 6"/></svg>
  ),
};

/** Universal sparkle diamond used as the EduSwarm promo mark. */
export function Diamond({ size = 18, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} style={style}>
      <path d="M12 2l3.1 7.6L22.5 12l-7.4 1.6L12 21.2l-3.1-7.6L1.5 12l7.4-2.4L12 2z" />
    </svg>
  );
}
