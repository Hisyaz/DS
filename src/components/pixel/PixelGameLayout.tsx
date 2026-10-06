import React from 'react';

export type PixelLayoutTheme = 'pitch' | 'arcade' | 'trophy' | 'night';

interface PixelGameLayoutProps {
  topArea?: React.ReactNode;
  children: React.ReactNode;
  bottomNavigation?: React.ReactNode;
  theme?: PixelLayoutTheme;
  enableScanlines?: boolean;
  enablePitchStripes?: boolean;
  className?: string;
  mainClassName?: string;
  id?: string;
}

const THEME_BACKGROUNDS: Record<PixelLayoutTheme, string> = {
  pitch: 'bg-emerald-950 text-slate-100',
  arcade: 'bg-slate-950 text-slate-100',
  trophy: 'bg-amber-950/90 text-amber-50',
  night: 'bg-zinc-950 text-zinc-100',
};

/**
 * 32-Bit Reusable Full-Screen Game Interface Layout
 * Contains:
 * - TOP AREA: Current player/game status & transfer alerts
 * - MAIN AREA: Context-specific content (responsive & scrollable)
 * - BOTTOM/LOWER NAVIGATION: Primary game actions with comfortable touch/controller targets
 *
 * Automatically adapts between Mobile Portrait, Mobile Landscape, Tablet, and Desktop.
 */
export const PixelGameLayout: React.FC<PixelGameLayoutProps> = ({
  topArea,
  children,
  bottomNavigation,
  theme = 'arcade',
  enableScanlines = false,
  enablePitchStripes = false,
  className = '',
  mainClassName = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`
        relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden select-none
        ${THEME_BACKGROUNDS[theme]}
        ${enablePitchStripes ? 'pixel-pitch-stripes' : ''}
        ${className}
      `}
      style={{
        imageRendering: 'pixelated',
      }}
    >
      {/* Optional CRT Scanlines Layer */}
      {enableScanlines && (
        <div className="absolute inset-0 pixel-scanlines pointer-events-none z-30 opacity-40" />
      )}

      {/* TOP AREA: Status Bar & Transfer Notifications */}
      {topArea && (
        <div className="relative z-20 shrink-0 w-full">
          {topArea}
        </div>
      )}

      {/* MAIN AREA: Context-Specific Content */}
      <main
        className={`
          relative z-10 flex-1 overflow-y-auto smooth-scroll w-full max-w-7xl mx-auto
          p-2 sm:p-4 md:p-6 flex flex-col
          ${mainClassName}
        `}
      >
        {children}
      </main>

      {/* BOTTOM/LOWER NAVIGATION: Primary Game Actions */}
      {bottomNavigation && (
        <nav
          className="relative z-20 shrink-0 w-full border-t-4 border-slate-950 bg-slate-900/95 pixel-bevel-raised px-2 sm:px-4 py-2 sm:py-3 shadow-[0_-4px_0_0_#000]"
          role="navigation"
          aria-label="Primary Game Navigation"
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-3">
            {bottomNavigation}
          </div>
        </nav>
      )}
    </div>
  );
};
