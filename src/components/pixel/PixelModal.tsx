import React, { useEffect, useRef } from 'react';
import { PixelButton } from './PixelButton';
import { PixelCloseIcon } from './PixelIcons';

export type PixelModalTheme = 'pitch' | 'steel' | 'arcade' | 'gold' | 'crimson';

interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  theme?: PixelModalTheme;
  maxWidth?: string; // e.g. 'max-w-md', 'max-w-2xl'
  scanlines?: boolean;
  showCloseButton?: boolean;
  id?: string;
}

const THEME_STYLES: Record<
  PixelModalTheme,
  {
    bg: string;
    border: string;
    headerBg: string;
    headerText: string;
    headerBorder: string;
    bevel: string;
  }
> = {
  steel: {
    bg: 'bg-slate-900',
    border: 'border-slate-700',
    headerBg: 'bg-slate-800',
    headerText: 'text-slate-100',
    headerBorder: 'border-slate-700',
    bevel: 'pixel-bevel-raised',
  },
  pitch: {
    bg: 'bg-emerald-950',
    border: 'border-emerald-700',
    headerBg: 'bg-emerald-900',
    headerText: 'text-emerald-200',
    headerBorder: 'border-emerald-800',
    bevel: 'pixel-bevel-emerald',
  },
  arcade: {
    bg: 'bg-slate-950',
    border: 'border-cyan-600',
    headerBg: 'bg-cyan-950',
    headerText: 'text-cyan-300',
    headerBorder: 'border-cyan-800',
    bevel: 'pixel-bevel-cyan',
  },
  gold: {
    bg: 'bg-amber-950',
    border: 'border-amber-600',
    headerBg: 'bg-amber-900',
    headerText: 'text-amber-200',
    headerBorder: 'border-amber-700',
    bevel: 'pixel-bevel-gold',
  },
  crimson: {
    bg: 'bg-rose-950',
    border: 'border-rose-700',
    headerBg: 'bg-rose-900',
    headerText: 'text-rose-200',
    headerBorder: 'border-rose-800',
    bevel: 'pixel-bevel-crimson',
  },
};

/**
 * 32-Bit Pixel Modal / Event Screen
 * Arcade-framed overlay dialog with stepped border, rivet details,
 * focus containment, Escape key handling, and tactile action area.
 */
export const PixelModal: React.FC<PixelModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  actions,
  theme = 'steel',
  maxWidth = 'max-w-lg',
  scanlines = false,
  showCloseButton = true,
  id,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const styles = THEME_STYLES[theme] || THEME_STYLES.steel;

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-focus first interactive element when opened
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelector<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 select-none"
    >
      {/* Dark Backdrop with Dither Effect */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* 32-Bit Arcade Frame Dialog */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${maxWidth} max-h-[92vh] flex flex-col z-10
          border-4 shadow-[0_12px_0_0_#000] overflow-hidden
          ${styles.bg}
          ${styles.border}
          ${styles.bevel}
        `}
        style={{ imageRendering: 'pixelated' }}
      >
        {/* CRT Scanlines Overlay */}
        {scanlines && (
          <div className="absolute inset-0 pixel-scanlines pointer-events-none z-10 opacity-50" />
        )}

        {/* Modal Header */}
        <div
          className={`
            relative z-20 flex items-center justify-between gap-3 px-4 py-3
            border-b-2 font-pixel tracking-wider
            ${styles.headerBg}
            ${styles.headerBorder}
            ${styles.headerText}
          `}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && <span className="shrink-0">{icon}</span>}
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-pixel truncate uppercase pixel-text-shadow">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[10px] text-slate-400 font-arcade truncate normal-case tracking-normal">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {showCloseButton && (
            <PixelButton
              size="sm"
              variant="secondary"
              onClick={onClose}
              icon={<PixelCloseIcon size={14} color="#f87171" />}
              aria-label="Close dialog"
            />
          )}

          {/* Corner Screws */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-black/40 border border-white/20 pointer-events-none" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-black/40 border border-white/20 pointer-events-none" />
        </div>

        {/* Scrollable Body Content */}
        <div className="relative z-20 p-4 sm:p-5 overflow-y-auto smooth-scroll flex-1 text-slate-200">
          {children}
        </div>

        {/* Modal Footer / Action Buttons */}
        {actions && (
          <div className="relative z-20 px-4 py-3 border-t-2 border-slate-900 bg-black/50 flex flex-wrap items-center justify-end gap-2">
            {actions}
          </div>
        )}

        {/* Bottom Corner Screws */}
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-black/40 border border-white/20 pointer-events-none z-20" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-black/40 border border-white/20 pointer-events-none z-20" />
      </div>
    </div>
  );
};
