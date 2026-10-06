import React from 'react';

export type PixelBadgeVariant = 'red' | 'gold' | 'green' | 'cyan' | 'purple' | 'steel' | 'dark';
export type PixelBadgeSize = 'xs' | 'sm' | 'md';

interface PixelBadgeProps {
  children: React.ReactNode;
  variant?: PixelBadgeVariant;
  size?: PixelBadgeSize;
  icon?: React.ReactNode;
  pulse?: boolean;
  className?: string;
  id?: string;
}

const VARIANT_STYLES: Record<PixelBadgeVariant, string> = {
  red: 'bg-rose-600 text-rose-50 border-rose-950 pixel-bevel-crimson text-shadow-sm',
  gold: 'bg-amber-500 text-amber-950 border-amber-950 pixel-bevel-gold font-bold',
  green: 'bg-emerald-600 text-emerald-50 border-emerald-950 pixel-bevel-emerald',
  cyan: 'bg-cyan-500 text-cyan-950 border-cyan-950 pixel-bevel-cyan font-bold',
  purple: 'bg-violet-600 text-violet-50 border-violet-950 pixel-bevel-raised',
  steel: 'bg-slate-700 text-slate-200 border-slate-950 pixel-bevel-raised',
  dark: 'bg-black text-amber-300 border-zinc-800 pixel-bevel-sunken',
};

const SIZE_STYLES: Record<PixelBadgeSize, string> = {
  xs: 'text-[9px] px-1.5 py-0.5 min-h-[18px]',
  sm: 'text-[10px] px-2 py-1 min-h-[22px]',
  md: 'text-xs px-2.5 py-1 min-h-[26px]',
};

/**
 * 32-Bit Pixel Notification Badge
 * Stepped chunky tag with high-contrast text and bevel for alerts, states, and counts.
 */
export const PixelBadge: React.FC<PixelBadgeProps> = ({
  children,
  variant = 'cyan',
  size = 'sm',
  icon,
  pulse = false,
  className = '',
  id,
}) => {
  return (
    <span
      id={id}
      className={`inline-flex items-center justify-center gap-1 font-pixel uppercase tracking-tight select-none border-2 transition-transform ${
        VARIANT_STYLES[variant]
      } ${SIZE_STYLES[size]} ${pulse ? 'animate-pixel-blink' : ''} ${className}`}
      style={{
        boxShadow: '1px 1px 0px 0px #000',
      }}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
};
