import React, { forwardRef } from 'react';
import { PixelCursor } from './PixelCursor';
import { audioManager } from '../../utils/audioSystem';

export type PixelButtonVariant =
  | 'primary'
  | 'accent'
  | 'gold'
  | 'danger'
  | 'secondary'
  | 'steel'
  | 'ghost';

export type PixelButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant;
  size?: PixelButtonSize;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  badge?: React.ReactNode;
  isSelected?: boolean;
  showCursor?: boolean;
  playAudio?: boolean;
  fullWidth?: boolean;
}

const VARIANT_CONTAINER: Record<PixelButtonVariant, { base: string; border: string; bevel: string; text: string; shadow: string }> = {
  primary: {
    base: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700',
    border: 'border-emerald-950',
    bevel: 'pixel-bevel-emerald',
    text: 'text-emerald-50 pixel-text-shadow',
    shadow: 'shadow-[0_4px_0_0_#022c22]',
  },
  accent: {
    base: 'bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600',
    border: 'border-cyan-950',
    bevel: 'pixel-bevel-cyan',
    text: 'text-cyan-950 font-bold',
    shadow: 'shadow-[0_4px_0_0_#083344]',
  },
  gold: {
    base: 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500',
    border: 'border-amber-950',
    bevel: 'pixel-bevel-gold',
    text: 'text-amber-950 font-bold',
    shadow: 'shadow-[0_4px_0_0_#713f12]',
  },
  danger: {
    base: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700',
    border: 'border-rose-950',
    bevel: 'pixel-bevel-crimson',
    text: 'text-rose-50 pixel-text-shadow',
    shadow: 'shadow-[0_4px_0_0_#4c0519]',
  },
  secondary: {
    base: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900',
    border: 'border-slate-950',
    bevel: 'pixel-bevel-raised',
    text: 'text-slate-100 pixel-text-shadow',
    shadow: 'shadow-[0_4px_0_0_#020617]',
  },
  steel: {
    base: 'bg-slate-700 hover:bg-slate-600 active:bg-slate-800',
    border: 'border-slate-950',
    bevel: 'pixel-bevel-raised',
    text: 'text-slate-200 pixel-text-shadow',
    shadow: 'shadow-[0_4px_0_0_#0f172a]',
  },
  ghost: {
    base: 'bg-slate-900/60 hover:bg-slate-800/80 active:bg-slate-950',
    border: 'border-slate-600/80',
    bevel: 'border-2',
    text: 'text-slate-200 hover:text-white',
    shadow: 'shadow-[0_2px_0_0_#000]',
  },
};

const SIZE_STYLES: Record<PixelButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 min-h-[38px] min-w-[38px]',
  md: 'text-xs sm:text-sm px-4 py-2.5 min-h-[44px] min-w-[44px]',
  lg: 'text-sm sm:text-base px-6 py-3 min-h-[52px] min-w-[52px]',
  icon: 'p-2 min-h-[44px] min-w-[44px] justify-center items-center',
};

/**
 * 32-Bit Pixel Button
 * Authentic arcade/console button with physical tactile press feedback,
 * 3D bevels, stepped borders, audio cues, and console navigation focus.
 */
export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      rightIcon,
      badge,
      isSelected = false,
      showCursor,
      playAudio = true,
      fullWidth = false,
      disabled = false,
      className = '',
      onClick,
      onMouseEnter,
      id,
      ...props
    },
    ref
  ) => {
    const config = VARIANT_CONTAINER[variant] || VARIANT_CONTAINER.primary;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (playAudio) {
        try {
          audioManager.playWhistle();
        } catch {}
      }
      onClick?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseEnter?.(e);
    };

    return (
      <button
        ref={ref}
        id={id}
        disabled={disabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        className={`
          group relative inline-flex items-center justify-center gap-2 select-none border-2 font-pixel tracking-wider
          transition-transform duration-75 active:translate-y-1 active:shadow-none
          outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
          ${fullWidth ? 'w-full' : ''}
          ${config.base}
          ${config.border}
          ${config.bevel}
          ${config.text}
          ${disabled ? 'opacity-45 grayscale pointer-events-none shadow-none cursor-not-allowed' : config.shadow}
          ${SIZE_STYLES[size]}
          ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950' : ''}
          ${className}
        `}
        style={{
          imageRendering: 'pixelated',
        }}
        {...props}
      >
        {/* Animated Pixel Cursor when Selected or Hovered */}
        {(isSelected || showCursor) && (
          <span className="shrink-0 -ml-1">
            <PixelCursor variant="arrow" size="sm" color="#facc15" />
          </span>
        )}

        {/* Left Icon */}
        {icon && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}

        {/* Text Content */}
        {children && <span className="whitespace-nowrap truncate">{children}</span>}

        {/* Right Icon */}
        {rightIcon && <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>}

        {/* Optional Badge */}
        {badge && <span className="shrink-0 ml-1">{badge}</span>}

        {/* Stepped Corner Accent Pixel Dots */}
        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/40 pointer-events-none" />
        <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-black/40 pointer-events-none" />
      </button>
    );
  }
);

PixelButton.displayName = 'PixelButton';
