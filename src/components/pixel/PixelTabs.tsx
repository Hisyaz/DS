import React, { useRef, useEffect } from 'react';
import { PixelCursor } from './PixelCursor';
import { audioManager } from '../../utils/audioSystem';

export interface PixelTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

interface PixelTabsProps {
  tabs: PixelTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'cartridge' | 'classic' | 'minimal';
  id?: string;
}

/**
 * 32-Bit Pixel Tabs
 * Console/cartridge-style tab bar with tactile raised active tabs,
 * keyboard Arrow Left/Right cycling, controller bumper cycling, and sound feedback.
 */
export const PixelTabs: React.FC<PixelTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'cartridge',
  id,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (tabId: string, disabled?: boolean) => {
    if (disabled || tabId === activeTab) return;
    try {
      audioManager.playWhistle();
    } catch {}
    onChange(tabId);
  };

  // Keyboard navigation across tabs
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const enabledTabs = tabs.filter((t) => !t.disabled);
      const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab);
      if (currentIndex === -1) return;

      const nextIndex =
        e.key === 'ArrowRight'
          ? (currentIndex + 1) % enabledTabs.length
          : (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;

      handleSelect(enabledTabs[nextIndex].id);
    }
  };

  return (
    <div
      ref={containerRef}
      id={id}
      role="tablist"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`
        w-full flex items-end gap-1 sm:gap-2 overflow-x-auto smooth-scroll pb-1 select-none outline-none
        border-b-4 border-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-400
        ${className}
      `}
      style={{ imageRendering: 'pixelated' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const isDisabled = !!tab.disabled;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={isDisabled}
            onClick={() => handleSelect(tab.id, isDisabled)}
            className={`
              relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5
              min-h-[44px] font-pixel text-[11px] sm:text-xs uppercase tracking-wider
              border-t-2 border-x-2 border-black transition-all shrink-0
              ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 border-b-0 -mb-1 z-10 pixel-bevel-cyan shadow-[0_-3px_0_0_#083344]'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-b-2 border-b-slate-900 opacity-80'
              }
              ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Active Pointer Marker */}
            {isActive && (
              <span className="hidden sm:inline-flex shrink-0 -ml-1">
                <PixelCursor variant="arrow" size="sm" color="#38bdf8" />
              </span>
            )}

            {/* Icon */}
            {tab.icon && (
              <span className={`inline-flex shrink-0 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                {tab.icon}
              </span>
            )}

            {/* Label */}
            <span className="whitespace-nowrap">{tab.label}</span>

            {/* Badge */}
            {tab.badge && <span className="shrink-0 ml-0.5">{tab.badge}</span>}

            {/* Stepped corner accents */}
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/20 pointer-events-none" />
            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white/20 pointer-events-none" />
          </button>
        );
      })}
    </div>
  );
};
