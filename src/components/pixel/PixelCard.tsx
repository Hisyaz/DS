import React from 'react';
import { PixelCornerReticle } from './PixelCursor';

export type PixelCardTheme = 'pitch' | 'steel' | 'arcade' | 'gold' | 'crimson';

interface PixelCardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  theme?: PixelCardTheme;
  isSelected?: boolean;
  isHoverable?: boolean;
  onClick?: () => void;
  className?: string;
  bodyClassName?: string;
  id?: string;
}

const THEME_STYLES: Record<
  PixelCardTheme,
  {
    bg: string;
    border: string;
    headerBg: string;
    headerBorder: string;
    selectedRing: string;
    bevel: string;
  }
> = {
  steel: {
    bg: 'bg-slate-900/90',
    border: 'border-slate-700',
    headerBg: 'bg-slate-800',
    headerBorder: 'border-slate-700',
    selectedRing: 'border-cyan-400 ring-2 ring-cyan-400',
    bevel: 'pixel-bevel-raised',
  },
  pitch: {
    bg: 'bg-emerald-950/90',
    border: 'border-emerald-700',
    headerBg: 'bg-emerald-900',
    headerBorder: 'border-emerald-800',
    selectedRing: 'border-emerald-300 ring-2 ring-emerald-300',
    bevel: 'pixel-bevel-emerald',
  },
  arcade: {
    bg: 'bg-slate-950/90',
    border: 'border-cyan-700',
    headerBg: 'bg-cyan-950',
    headerBorder: 'border-cyan-800',
    selectedRing: 'border-cyan-400 ring-2 ring-cyan-400',
    bevel: 'pixel-bevel-cyan',
  },
  gold: {
    bg: 'bg-amber-950/90',
    border: 'border-amber-600',
    headerBg: 'bg-amber-900',
    headerBorder: 'border-amber-700',
    selectedRing: 'border-yellow-400 ring-2 ring-yellow-400',
    bevel: 'pixel-bevel-gold',
  },
  crimson: {
    bg: 'bg-rose-950/90',
    border: 'border-rose-700',
    headerBg: 'bg-rose-900',
    headerBorder: 'border-rose-800',
    selectedRing: 'border-rose-400 ring-2 ring-rose-400',
    bevel: 'pixel-bevel-crimson',
  },
};

/**
 * 32-Bit Pixel Card
 * Reusable card unit for players, items, offers, and match fixtures.
 */
export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  header,
  footer,
  theme = 'steel',
  isSelected = false,
  isHoverable = true,
  onClick,
  className = '',
  bodyClassName = '',
  id,
}) => {
  const styles = THEME_STYLES[theme] || THEME_STYLES.steel;
  const isClickable = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      id={id}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        relative border-2 select-none flex flex-col justify-between overflow-hidden
        transition-all duration-75
        ${styles.bg}
        ${styles.border}
        ${styles.bevel}
        ${isSelected ? styles.selectedRing : 'shadow-[0_4px_0_0_#000]'}
        ${isHoverable && isClickable ? 'hover:-translate-y-1 hover:shadow-[0_6px_0_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_0_#000] cursor-pointer' : ''}
        ${isClickable ? 'outline-none focus-visible:ring-2 focus-visible:ring-yellow-400' : ''}
        ${className}
      `}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Reticle brackets when selected */}
      <PixelCornerReticle active={isSelected} color="#facc15" />

      {/* Header Area */}
      {header && (
        <div
          className={`
            relative z-10 px-3 py-2 border-b-2 font-pixel text-xs
            ${styles.headerBg}
            ${styles.headerBorder}
          `}
        >
          {header}
        </div>
      )}

      {/* Body Area */}
      <div className={`relative z-10 p-3 flex-1 ${bodyClassName}`}>{children}</div>

      {/* Footer Area */}
      {footer && (
        <div className="relative z-10 px-3 py-2 border-t-2 border-slate-800 bg-black/40">
          {footer}
        </div>
      )}

      {/* Subtle corner highlight */}
      <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/25 pointer-events-none" />
      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-black/50 pointer-events-none" />
    </div>
  );
};
