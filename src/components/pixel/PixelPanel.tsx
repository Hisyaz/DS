import React from 'react';

export type PixelPanelTheme = 'pitch' | 'steel' | 'arcade' | 'gold' | 'crimson' | 'tactics';

interface PixelPanelProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  theme?: PixelPanelTheme;
  scanlines?: boolean;
  dither?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  id?: string;
}

const THEME_STYLES: Record<
  PixelPanelTheme,
  {
    bg: string;
    border: string;
    headerBg: string;
    headerText: string;
    headerBorder: string;
    innerBevel: string;
  }
> = {
  pitch: {
    bg: 'bg-emerald-950/95',
    border: 'border-emerald-700/80',
    headerBg: 'bg-emerald-900',
    headerText: 'text-emerald-300',
    headerBorder: 'border-emerald-800',
    innerBevel: 'pixel-bevel-emerald',
  },
  steel: {
    bg: 'bg-slate-900/95',
    border: 'border-slate-700/80',
    headerBg: 'bg-slate-800',
    headerText: 'text-slate-200',
    headerBorder: 'border-slate-700',
    innerBevel: 'pixel-bevel-raised',
  },
  arcade: {
    bg: 'bg-slate-950/95',
    border: 'border-cyan-600/80',
    headerBg: 'bg-cyan-950',
    headerText: 'text-cyan-300',
    headerBorder: 'border-cyan-800',
    innerBevel: 'pixel-bevel-cyan',
  },
  gold: {
    bg: 'bg-amber-950/95',
    border: 'border-amber-600/80',
    headerBg: 'bg-amber-900',
    headerText: 'text-amber-300',
    headerBorder: 'border-amber-700',
    innerBevel: 'pixel-bevel-gold',
  },
  crimson: {
    bg: 'bg-rose-950/95',
    border: 'border-rose-700/80',
    headerBg: 'bg-rose-900',
    headerText: 'text-rose-200',
    headerBorder: 'border-rose-800',
    innerBevel: 'pixel-bevel-crimson',
  },
  tactics: {
    bg: 'bg-zinc-900/95',
    border: 'border-zinc-700',
    headerBg: 'bg-zinc-800',
    headerText: 'text-zinc-200',
    headerBorder: 'border-zinc-700',
    innerBevel: 'pixel-bevel-raised',
  },
};

/**
 * 32-Bit Pixel Panel
 * Chunky console/arcade window container with stepped borders,
 * title bar, rivet accents, and optional scanlines.
 */
export const PixelPanel: React.FC<PixelPanelProps> = ({
  children,
  title,
  subtitle,
  icon,
  headerAction,
  theme = 'steel',
  scanlines = false,
  dither = false,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  id,
}) => {
  const styles = THEME_STYLES[theme] || THEME_STYLES.steel;

  return (
    <div
      id={id}
      className={`
        relative border-4 select-none overflow-hidden
        shadow-[0_8px_0_0_rgba(0,0,0,0.85)]
        ${styles.bg}
        ${styles.border}
        ${styles.innerBevel}
        ${className}
      `}
      style={{
        imageRendering: 'pixelated',
      }}
    >
      {/* Optional CRT Scanlines */}
      {scanlines && <div className="absolute inset-0 pixel-scanlines pointer-events-none z-10 opacity-60" />}

      {/* Optional Pixel Dither */}
      {dither && <div className="absolute inset-0 pixel-dither-pattern pointer-events-none z-10 opacity-40" />}

      {/* Title Bar Header */}
      {(title || icon || headerAction) && (
        <div
          className={`
            relative z-20 flex items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2.5
            border-b-2 font-pixel tracking-wider
            ${styles.headerBg}
            ${styles.headerBorder}
            ${styles.headerText}
            ${headerClassName}
          `}
        >
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-pixel truncate uppercase pixel-text-shadow">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[10px] text-slate-400 font-arcade truncate normal-case tracking-normal">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {headerAction && <div className="shrink-0 flex items-center gap-1">{headerAction}</div>}

          {/* Stepped Corner Screws / Rivets */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-black/40 border border-white/20 pointer-events-none" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-black/40 border border-white/20 pointer-events-none" />
        </div>
      )}

      {/* Main Body Content */}
      <div className={`relative z-20 p-3 sm:p-4 md:p-5 ${bodyClassName}`}>
        {children}
      </div>

      {/* Bottom Corner Accent Rivets */}
      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-black/40 border border-white/20 pointer-events-none z-20" />
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-black/40 border border-white/20 pointer-events-none z-20" />
    </div>
  );
};
