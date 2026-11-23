import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { playUiSound, type UiSoundKind } from '../../utils/uiSounds';

/**
 * Aceternity UI + Astryx-inspired cursor-following Spotlight Card surface.
 * Uses radial spotlight glow on hover + hairline Astryx border + subtle depth.
 */
interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowTone?: 'sky' | 'amber' | 'emerald' | 'cobalt';
  children: React.ReactNode;
}

const GLOW_COLORS: Record<NonNullable<SpotlightCardProps['glowTone']>, string> = {
  sky: 'rgba(21, 98, 158, 0.085)',
  amber: 'rgba(243, 146, 0, 0.11)',
  emerald: 'rgba(23, 163, 74, 0.1)',
  cobalt: 'rgba(56, 189, 248, 0.14)',
};

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  glowTone = 'sky',
  className = '',
  children,
  onMouseMove,
  onMouseLeave,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        setSpot({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          visible: true,
        });
      }
      onMouseMove?.(e);
    },
    [onMouseMove]
  );

  const handleLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setSpot((prev) => ({ ...prev, visible: false }));
      onMouseLeave?.(e);
    },
    [onMouseLeave]
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tc-card-surface relative overflow-hidden rounded-[var(--tc-radius-card)] ${className}`}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: spot.visible ? 1 : 0,
          background: `radial-gradient(420px circle at ${spot.x}px ${spot.y}px, ${GLOW_COLORS[glowTone]}, transparent 70%)`,
        }}
      />
      <div className="relative z-10 flex flex-col flex-1 h-full">{children}</div>
    </div>
  );
};

/**
 * Aceternity UI + Bencho-inspired micro-tilt interactive action button card.
 * Subtle 3D tilt (compositor transform only) + cursor sheen + tactile click sound.
 */
interface TiltActionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  sheenColor?: string;
  sound?: UiSoundKind;
  children: React.ReactNode;
}

export const TiltActionCard: React.FC<TiltActionCardProps> = ({
  sheenColor = 'rgba(255, 255, 255, 0.22)',
  sound = 'click',
  className = '',
  children,
  onMouseMove,
  onMouseLeave,
  onClick,
  ...rest
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 50, sy: 50, hovered: false });

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const ry = (px - 0.5) * 6; // subtle +-3 deg max
        const rx = (0.5 - py) * 6;
        setTilt({ rx, ry, sx: px * 100, sy: py * 100, hovered: true });
      }
      onMouseMove?.(e);
    },
    [onMouseMove]
  );

  const handleLeave = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setTilt({ rx: 0, ry: 0, sx: 50, sy: 50, hovered: false });
      onMouseLeave?.(e);
    },
    [onMouseLeave]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      playUiSound(sound);
      onClick?.(e);
    },
    [onClick, sound]
  );

  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className={`bencho-press relative overflow-hidden ${className}`}
      style={{
        transform: tilt.hovered
          ? `perspective(700px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg) translateY(-2px)`
          : 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease, border-color 180ms ease',
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: tilt.hovered ? 1 : 0,
          background: `radial-gradient(240px circle at ${tilt.sx}% ${tilt.sy}%, ${sheenColor}, transparent 68%)`,
        }}
      />
      {children}
    </button>
  );
};

/**
 * HorizonX-inspired atmospheric hero surface with layered cobalt aurora lightfield,
 * crisp fine film grain, and subtle top-edge light refraction.
 */
interface HorizonHeroSurfaceProps {
  className?: string;
  children: React.ReactNode;
}

export const HorizonHeroSurface: React.FC<HorizonHeroSurfaceProps> = ({
  className = '',
  children,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--tc-radius-card)] bg-gradient-to-br from-[#16336D] via-[#1B4A91] to-[#0E4378] border border-white/15 shadow-[0_12px_34px_rgba(17,58,122,0.24)] ${className}`}
    >
      {/* HorizonX soft animated atmospheric aurora blobs */}
      <div
        aria-hidden="true"
        className="hx-aurora-blob pointer-events-none absolute -right-14 -top-14 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="hx-aurora-blob pointer-events-none absolute -left-12 -bottom-20 h-56 w-56 rounded-full bg-amber-300/14 blur-3xl"
        style={{ animationDelay: '-4.5s' }}
      />
      {/* Ultra-subtle fine film grain overlay */}
      <div
        aria-hidden="true"
        className="hx-grain-overlay pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay"
      />
      {/* Crisp top specular edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
      />
      <div className="relative z-10 flex flex-col justify-between h-full gap-5">{children}</div>
    </div>
  );
};

/**
 * Bencho-inspired spring-tactile button with crisp press physics and micro-sound.
 */
interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  sound?: UiSoundKind;
  children: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  sound = 'click',
  className = '',
  onClick,
  children,
  ...rest
}) => {
  return (
    <motion.button
      type={rest.type ?? 'button'}
      whileHover={rest.disabled ? undefined : { y: -1 }}
      whileTap={rest.disabled ? undefined : { scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.6 }}
      onClick={(e) => {
        if (!rest.disabled) playUiSound(sound);
        onClick?.(e);
      }}
      className={className}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
};

/**
 * Obsidian UI-inspired spring-animated progress bar with subtle surface gloss.
 */
interface AnimatedProgressBarProps {
  percent: number;
  completed?: boolean;
  trackClassName?: string;
  barClassName?: string;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  percent,
  completed = false,
  trackClassName = 'bg-amber-200/70',
  barClassName,
}) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillColor = barClassName ?? (completed ? 'bg-emerald-600' : 'bg-[#F39200]');

  return (
    <div className={`relative h-1.5 w-full rounded-full overflow-hidden ${trackClassName}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        className={`h-full rounded-full ${fillColor}`}
      />
    </div>
  );
};

/**
 * BoardUI-inspired agentic thinking indicator with shimmer sweep and staggered dots.
 */
interface AgentThinkingIndicatorProps {
  label?: string;
}

export const AgentThinkingIndicator: React.FC<AgentThinkingIndicatorProps> = ({
  label = 'Maya is crafting your step-by-step explanation…',
}) => {
  return (
    <div className="relative overflow-hidden inline-flex items-center gap-2.5 rounded-2xl border border-sky-200/90 bg-white px-3.5 py-2.5 shadow-[0_2px_10px_rgba(21,98,158,0.06)]">
      <span
        aria-hidden="true"
        className="board-thinking-shimmer pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-sky-100/70 to-transparent"
      />
      <span className="relative inline-flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-[#15629E]"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
            transition={{
              duration: 1.05,
              repeat: Infinity,
              delay: dot * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </span>
      <span className="relative text-xs font-medium text-slate-600">{label}</span>
    </div>
  );
};
