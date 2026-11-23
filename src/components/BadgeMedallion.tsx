import React, { useId, useState } from 'react';
import { motion } from 'motion/react';
import type {
  AchievementCategoryId,
  BadgeIconKind,
  BadgeStatus,
} from '../utils/achievementsLogic';

interface BadgeMedallionProps {
  code: string;
  categoryId: AchievementCategoryId;
  status: BadgeStatus;
  iconKind: BadgeIconKind;
  progressPercent: number;
  size?: 'sm' | 'md' | 'lg';
  isPinned?: boolean;
  interactiveTilt?: boolean;
  celebrating?: boolean;
}

interface MedallionPalette {
  outerStart: string;
  outerMid: string;
  outerEnd: string;
  innerRing: string;
  innerFill: string;
  emblemStroke: string;
  ribbonBg: string;
  ribbonText: string;
  progressStroke: string;
}

const EARNED_PALETTES: Record<AchievementCategoryId, MedallionPalette> = {
  LJ: {
    outerStart: '#7AC4E8',
    outerMid: '#3787BC',
    outerEnd: '#1E5A87',
    innerRing: '#D7EFFB',
    innerFill: '#F4FAFE',
    emblemStroke: '#1D5E8B',
    ribbonBg: '#1B5A87',
    ribbonText: '#FFFFFF',
    progressStroke: '#15629E',
  },
  PM: {
    outerStart: '#C8A2FF',
    outerMid: '#8B5CF6',
    outerEnd: '#5B21B6',
    innerRing: '#EFE5FF',
    innerFill: '#FAF7FF',
    emblemStroke: '#6D28D9',
    ribbonBg: '#5B21B6',
    ribbonText: '#FFFFFF',
    progressStroke: '#7C3AED',
  },
  AS: {
    outerStart: '#FDE08D',
    outerMid: '#F59E0B',
    outerEnd: '#B45309',
    innerRing: '#FEF3C7',
    innerFill: '#FFFDF5',
    emblemStroke: '#B45309',
    ribbonBg: '#B45309',
    ribbonText: '#FFFFFF',
    progressStroke: '#D97706',
  },
  NS: {
    outerStart: '#7DD3FC',
    outerMid: '#0284C7',
    outerEnd: '#075985',
    innerRing: '#E0F2FE',
    innerFill: '#F4FBFF',
    emblemStroke: '#0369A1',
    ribbonBg: '#075985',
    ribbonText: '#FFFFFF',
    progressStroke: '#0284C7',
  },
  CD: {
    outerStart: '#FDBA74',
    outerMid: '#F97316',
    outerEnd: '#C2410C',
    innerRing: '#FFEDD5',
    innerFill: '#FFF9F2',
    emblemStroke: '#C2410C',
    ribbonBg: '#C2410C',
    ribbonText: '#FFFFFF',
    progressStroke: '#EA580C',
  },
  HI: {
    outerStart: '#86EFAC',
    outerMid: '#22C55E',
    outerEnd: '#15803D',
    innerRing: '#DCFCE7',
    innerFill: '#F4FDF7',
    emblemStroke: '#15803D',
    ribbonBg: '#15803D',
    ribbonText: '#FFFFFF',
    progressStroke: '#16A34A',
  },
  IN: {
    outerStart: '#FCA5A5',
    outerMid: '#EF4444',
    outerEnd: '#B91C1C',
    innerRing: '#FEE2E2',
    innerFill: '#FFF6F6',
    emblemStroke: '#B91C1C',
    ribbonBg: '#B91C1C',
    ribbonText: '#FFFFFF',
    progressStroke: '#DC2626',
  },
  SP: {
    outerStart: '#F5B5FC',
    outerMid: '#D946EF',
    outerEnd: '#86198F',
    innerRing: '#FAE8FF',
    innerFill: '#FEF6FF',
    emblemStroke: '#A21CAF',
    ribbonBg: '#86198F',
    ribbonText: '#FFFFFF',
    progressStroke: '#C026D3',
  },
  AT: {
    outerStart: '#FEF08A',
    outerMid: '#EAB308',
    outerEnd: '#A16207',
    innerRing: '#FEF9C3',
    innerFill: '#FFFEF4',
    emblemStroke: '#A16207',
    ribbonBg: '#854D0E',
    ribbonText: '#FFFFFF',
    progressStroke: '#CA8A04',
  },
};

const IN_PROGRESS_PALETTES: Record<AchievementCategoryId, MedallionPalette> = {
  LJ: {
    outerStart: '#B7CDD9',
    outerMid: '#6E8CA0',
    outerEnd: '#4A6577',
    innerRing: '#E3EEF4',
    innerFill: '#F7FAFC',
    emblemStroke: '#4A6577',
    ribbonBg: '#4A6577',
    ribbonText: '#FFFFFF',
    progressStroke: '#15629E',
  },
  PM: {
    outerStart: '#D8CBEB',
    outerMid: '#A590C4',
    outerEnd: '#7B6799',
    innerRing: '#EFEAF8',
    innerFill: '#FAF8FD',
    emblemStroke: '#735E91',
    ribbonBg: '#735E91',
    ribbonText: '#FFFFFF',
    progressStroke: '#8B5CF6',
  },
  AS: {
    outerStart: '#E9D6B5',
    outerMid: '#B99864',
    outerEnd: '#8A6D41',
    innerRing: '#F7EFE0',
    innerFill: '#FCF9F2',
    emblemStroke: '#8A6D41',
    ribbonBg: '#8A6D41',
    ribbonText: '#FFFFFF',
    progressStroke: '#D97706',
  },
  NS: {
    outerStart: '#BBDCEB',
    outerMid: '#6D9EB5',
    outerEnd: '#487387',
    innerRing: '#E5F2F8',
    innerFill: '#F7FBFD',
    emblemStroke: '#487387',
    ribbonBg: '#487387',
    ribbonText: '#FFFFFF',
    progressStroke: '#0284C7',
  },
  CD: {
    outerStart: '#EBCAB4',
    outerMid: '#BE8969',
    outerEnd: '#8F5E42',
    innerRing: '#F9ECE4',
    innerFill: '#FDF9F6',
    emblemStroke: '#8F5E42',
    ribbonBg: '#8F5E42',
    ribbonText: '#FFFFFF',
    progressStroke: '#EA580C',
  },
  HI: {
    outerStart: '#BFE0CA',
    outerMid: '#73A685',
    outerEnd: '#4C7A5D',
    innerRing: '#E6F5EB',
    innerFill: '#F7FCF9',
    emblemStroke: '#4C7A5D',
    ribbonBg: '#4C7A5D',
    ribbonText: '#FFFFFF',
    progressStroke: '#16A34A',
  },
  IN: {
    outerStart: '#E4C0C0',
    outerMid: '#B37A7A',
    outerEnd: '#845050',
    innerRing: '#F7E7E7',
    innerFill: '#FDF8F8',
    emblemStroke: '#845050',
    ribbonBg: '#845050',
    ribbonText: '#FFFFFF',
    progressStroke: '#DC2626',
  },
  SP: {
    outerStart: '#E3C3EA',
    outerMid: '#B07CBA',
    outerEnd: '#814F8A',
    innerRing: '#F6E8F9',
    innerFill: '#FCF7FD',
    emblemStroke: '#814F8A',
    ribbonBg: '#814F8A',
    ribbonText: '#FFFFFF',
    progressStroke: '#C026D3',
  },
  AT: {
    outerStart: '#E7DCA8',
    outerMid: '#B5A35D',
    outerEnd: '#857538',
    innerRing: '#F7F3DF',
    innerFill: '#FCFBF4',
    emblemStroke: '#857538',
    ribbonBg: '#857538',
    ribbonText: '#FFFFFF',
    progressStroke: '#CA8A04',
  },
};

const LOCKED_PALETTE: MedallionPalette = {
  outerStart: '#CFD8E3',
  outerMid: '#9AA7B8',
  outerEnd: '#6E7C8F',
  innerRing: '#E6ECF2',
  innerFill: '#F5F7FA',
  emblemStroke: '#6E7C8F',
  ribbonBg: '#7C8A9C',
  ribbonText: '#FFFFFF',
  progressStroke: '#94A3B8',
};

function renderEmblemGlyph(iconKind: BadgeIconKind, stroke: string) {
  switch (iconKind) {
    case 'academy':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M36 45 L50 37 L64 45 Z" />
          <line x1="39" y1="45" x2="39" y2="54" />
          <line x1="46" y1="45" x2="46" y2="54" />
          <line x1="54" y1="45" x2="54" y2="54" />
          <line x1="61" y1="45" x2="61" y2="54" />
          <line x1="35" y1="54.5" x2="65" y2="54.5" />
        </g>
      );
    case 'quiz':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M40 39 H58 V54 H40 Z" />
          <line x1="44" y1="44" x2="54" y2="44" />
          <line x1="44" y1="49" x2="51" y2="49" />
          <path d="M55 36 L60 41 L54 47" />
        </g>
      );
    case 'trophy':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M42 38 H58 V46 C58 50.5 54.4 53.5 50 53.5 C45.6 53.5 42 50.5 42 46 Z" />
          <path d="M42 40 H37.5 C37.5 44.5 39.5 47 42 47" />
          <path d="M58 40 H62.5 C62.5 44.5 60.5 47 58 47" />
          <line x1="50" y1="53.5" x2="50" y2="57" />
          <line x1="45" y1="57" x2="55" y2="57" />
        </g>
      );
    case 'target':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="50" cy="47" r="10" />
          <circle cx="50" cy="47" r="5.5" />
          <circle cx="50" cy="47" r="1.8" fill={stroke} />
        </g>
      );
    case 'compass':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="50" cy="47" r="10" />
          <polygon points="54,43 51.5,49.5 46,51 48.5,44.5" fill={stroke} opacity="0.22" />
          <polygon points="54,43 51.5,49.5 46,51 48.5,44.5" />
        </g>
      );
    case 'folder':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M38 41 H46 L48.5 43.5 H62 V55 H38 Z" />
        </g>
      );
    case 'notebook':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <rect x="40" y="38" width="20" height="18" rx="2" />
          <line x1="45" y1="38" x2="45" y2="56" />
          <line x1="49" y1="44" x2="56" y2="44" />
          <line x1="49" y1="49" x2="55" y2="49" />
        </g>
      );
    case 'flame':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M50 36 C55 41 58 45 58 49.5 C58 53.8 54.4 57 50 57 C45.6 57 42 53.8 42 49.5 C42 46.5 43.8 43.5 46 41.5 C46 44 47.5 45.5 49 45.5 C49 42.5 50.8 39 50 36 Z" />
        </g>
      );
    case 'lightbulb':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M44 48 C42.5 46.5 42 44.6 42.5 42.5 C43.2 39.2 46.3 37 49.8 37 C54.2 37 57.5 40.3 57.5 44.5 C57.5 46.6 56.5 48.4 55 49.6 L54 53 H46 L45 49.6 Z" />
          <line x1="46.5" y1="56" x2="53.5" y2="56" />
        </g>
      );
    case 'shield':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M50 37 L60 41 V48 C60 53 55.6 56.4 50 58 C44.4 56.4 40 53 40 48 V41 Z" />
          <path d="M46.5 47.5 L49 50 L54 44.5" />
        </g>
      );
    case 'sparkle':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M50 36 L52.8 44.2 L61 47 L52.8 49.8 L50 58 L47.2 49.8 L39 47 L47.2 44.2 Z" />
        </g>
      );
    case 'crown':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M38 54 L40 42 L46 47 L50 39 L54 47 L60 42 L62 54 Z" />
        </g>
      );
    case 'flag':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <line x1="42" y1="38" x2="42" y2="57" />
          <path d="M42 39 H57 L54 44.5 L57 50 H42" />
        </g>
      );
    case 'rocket':
      return (
        <g stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M56 38 C51 39 46 43 43 49 L48 54 C54 51 58 46 59 41 Z" />
          <circle cx="52.5" cy="44.5" r="1.6" fill={stroke} />
          <path d="M43 49 L39 51 L41 55 L45 53" />
        </g>
      );
    case 'check':
    default:
      return (
        <g stroke={stroke} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="50" cy="47" r="9.5" />
          <path d="M45.8 47.2 L48.8 50.2 L54.6 44.2" />
        </g>
      );
  }
}

export const BadgeMedallion: React.FC<BadgeMedallionProps> = ({
  code,
  categoryId,
  status,
  iconKind,
  progressPercent,
  size = 'md',
  isPinned = false,
  interactiveTilt = false,
  celebrating = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const palette =
    status === 'earned'
      ? EARNED_PALETTES[categoryId]
      : status === 'in_progress'
      ? IN_PROGRESS_PALETTES[categoryId]
      : LOCKED_PALETTE;

  const sizeClass =
    size === 'lg'
      ? 'w-32 h-32'
      : size === 'sm'
      ? 'w-16 h-16'
      : 'w-[76px] h-[76px]';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 18, ry: x * 18 });
  };

  const handleMouseLeave = () => {
    if (!interactiveTilt) return;
    setTilt({ rx: 0, ry: 0 });
  };

  const radius = 21.5;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (Math.min(100, Math.max(0, progressPercent)) / 100) * circumference;

  // Plump rounded 5-pointed star crest path matching reference silhouette
  const starOuterPath =
    'M 50 4 C 53.5 4 56.5 6 58.1 9.2 L 64.8 22.8 C 66 25.1 68.2 26.8 70.8 27.2 L 85.8 29.4 C 92.2 30.4 94.7 38.2 90.1 42.7 L 79.3 53.3 C 77.4 55.2 76.5 57.9 77 60.5 L 79.5 75.5 C 80.6 81.9 73.9 86.7 68.1 83.7 L 54.7 76.6 C 51.8 75.1 48.2 75.1 45.3 76.6 L 31.9 83.7 C 26.1 86.7 19.4 81.9 20.5 75.5 L 23 60.5 C 23.5 57.9 22.6 55.2 20.7 53.3 L 9.9 42.7 C 5.3 38.2 7.8 30.4 14.2 29.4 L 29.2 27.2 C 31.8 26.8 34 25.1 35.2 22.8 L 41.9 9.2 C 43.5 6 46.5 4 50 4 Z';

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={
        celebrating
          ? {
              scale: [0.85, 1.15, 0.98, 1.04, 1],
              rotate: [0, -8, 8, -3, 0],
            }
          : {
              rotateX: tilt.rx,
              rotateY: tilt.ry,
              scale: 1,
            }
      }
      transition={
        celebrating
          ? { duration: 0.72, ease: [0.16, 1, 0.3, 1] }
          : { type: 'spring', stiffness: 320, damping: 22 }
      }
      style={interactiveTilt ? { perspective: 600, transformStyle: 'preserve-3d' } : undefined}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeClass}`}
    >
      {/* Subtle aura ring during unlock celebration */}
      {celebrating && (
        <motion.span
          aria-hidden="true"
          initial={{ scale: 0.65, opacity: 0.85 }}
          animate={{ scale: 1.55, opacity: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 rounded-full border-4 border-emerald-400"
        />
      )}

      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full overflow-visible ${
          status === 'locked' ? 'opacity-95' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`star-grad-${uid}`} x1="15%" y1="5%" x2="85%" y2="95%">
            <stop offset="0%" stopColor={palette.outerStart} />
            <stop offset="52%" stopColor={palette.outerMid} />
            <stop offset="100%" stopColor={palette.outerEnd} />
          </linearGradient>
          <linearGradient id={`sheen-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.46" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
          </linearGradient>
          <clipPath id={`star-clip-${uid}`}>
            <path d={starOuterPath} />
          </clipPath>
        </defs>

        {/* Lightweight crisp vector shadow (zero Gaussian blur overhead) */}
        <path
          d={starOuterPath}
          transform="translate(0, 3)"
          fill="#0F172A"
          opacity={status === 'locked' ? '0.09' : '0.14'}
        />

        {/* Outer metallic 5-point star */}
        <path
          d={starOuterPath}
          fill={`url(#star-grad-${uid})`}
          stroke="#FFFFFF"
          strokeWidth="2.2"
        />

        {/* Metallic bevel sheen */}
        <path d={starOuterPath} fill={`url(#sheen-grad-${uid})`} />

        {/* Animated diagonal light sweep on hover (parent uses group) */}
        <g clipPath={`url(#star-clip-${uid})`}>
          <rect
            x="-40"
            y="0"
            width="28"
            height="110"
            fill="#FFFFFF"
            opacity="0.34"
            transform="skewX(-22)"
            className="badge-medallion-sheen"
          />
        </g>

        {/* Inner crest circle (proportioned so rich metallic star arms frame it) */}
        <circle
          cx="50"
          cy="48.5"
          r={radius}
          fill={palette.innerFill}
          stroke={palette.innerRing}
          strokeWidth="3.2"
        />

        {/* Progress radial ring for in-progress badges */}
        {status === 'in_progress' && (
          <circle
            cx="50"
            cy="48.5"
            r={radius}
            fill="none"
            stroke={palette.progressStroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 48.5)"
            style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        )}

        {/* Inner emblem glyph gently scaled and centered inside crest */}
        <g transform="translate(50 45.5) scale(0.86) translate(-50 -47)">
          {renderEmblemGlyph(iconKind, palette.emblemStroke)}
        </g>

        {/* Code ribbon plaque cleanly anchored below inner circle */}
        <rect
          x="33"
          y="60.5"
          width="34"
          height="11.5"
          rx="5.75"
          fill={palette.ribbonBg}
          stroke="#FFFFFF"
          strokeWidth="1.4"
        />
        <text
          x="50"
          y="68.3"
          textAnchor="middle"
          fill={palette.ribbonText}
          fontSize="6.3"
          fontWeight="700"
          letterSpacing="0.4"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {code}
        </text>
      </svg>

      {/* Top-right Earned green checkmark seal matching reference */}
      {status === 'earned' && (
        <motion.span
          initial={celebrating ? { scale: 0, rotate: -40 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 460, damping: 20, delay: celebrating ? 0.2 : 0 }}
          className={`absolute -top-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-[#16A34A] text-white ring-2 ring-white dark:ring-slate-900 shadow-sm ${
            size === 'lg' ? 'h-8 w-8' : 'h-5 w-5'
          }`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 16 16"
            className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 8.5 L6.5 11.5 L12.5 4.8" />
          </svg>
        </motion.span>
      )}

      {/* Subtle pinned showcase indicator */}
      {isPinned && status === 'earned' && (
        <span
          className={`absolute -top-0.5 -left-0.5 inline-flex items-center justify-center rounded-full bg-[#F59E0B] text-white ring-2 ring-white dark:ring-slate-900 shadow-sm ${
            size === 'lg' ? 'h-7 w-7' : 'h-4 w-4'
          }`}
          title="Pinned to profile showcase"
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" className={size === 'lg' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'} fill="currentColor">
            <path d="M8 1.5l1.95 3.95 4.36.64-3.16 3.08.75 4.34L8 11.46l-3.9 2.05.75-4.34L1.69 6.09l4.36-.64L8 1.5z" />
          </svg>
        </span>
      )}
    </motion.div>
  );
};
