import React from 'react';

interface PixelSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * 32-Bit Pixel Section Header
 * Arcade-style title divider with pixel stripe decoration, icon badge, and action slot.
 */
export const PixelSectionHeader: React.FC<PixelSectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  badge,
  className = '',
  id,
}) => {
  return (
    <div id={id} className={`w-full flex flex-col gap-1 select-none my-2 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 bg-slate-900 border-2 border-slate-700 pixel-bevel-raised shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-pixel text-xs sm:text-sm text-cyan-300 uppercase tracking-wider pixel-text-shadow truncate">
                {title}
              </h2>
              {badge && <span className="shrink-0">{badge}</span>}
            </div>
            {subtitle && (
              <p className="font-arcade text-[11px] text-slate-400 truncate tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* 32-Bit Striped Rule Line */}
      <div className="w-full flex items-center gap-1 mt-1">
        <div className="w-3 h-1.5 bg-cyan-500 border border-cyan-300 shrink-0" />
        <div className="w-2 h-1.5 bg-amber-400 border border-amber-300 shrink-0" />
        <div
          className="flex-1 h-1 bg-slate-800 border-y border-slate-700"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #334155, #334155 4px, transparent 4px, transparent 8px)',
          }}
        />
        <div className="w-1.5 h-1.5 bg-slate-600 shrink-0" />
      </div>
    </div>
  );
};
