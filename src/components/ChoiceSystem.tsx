import React, { useEffect, useCallback, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Sparkles, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { haptics } from '../utils/hapticsSystem';

export interface ChoiceSystemProps {
  isOpen?: boolean;
  totalChoices: number;
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  selectorLabel?: string; // Defaults to `CHOICE ${currentIndex + 1} OF ${totalChoices}`
  categoryBadge?: React.ReactNode;
  isNewCardGuaranteed?: boolean;
  topActions?: React.ReactNode;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  confirmIcon?: React.ReactNode;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'danger' | 'ghost' | 'secondary';
  };
  extraBottomContent?: React.ReactNode;
  themeColor?: string; // Hex or CSS color for subtle ambient glow
  accentGradient?: string;
  children: React.ReactNode;
  onClose?: () => void;
  hideHeader?: boolean;
  cardBackgroundClass?: string;
}

// Retro 32-bit synthesizer audio generator for tactile feedback
function playChoiceRetroSound(type: 'move' | 'select' | 'back') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'move') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'select') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.setValueAtTime(880, now + 0.04);
      osc.frequency.setValueAtTime(1160, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'back') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export const ChoiceSystem: React.FC<ChoiceSystemProps> = ({
  isOpen = true,
  totalChoices,
  currentIndex,
  onNavigate,
  onConfirm,
  title,
  subtitle,
  selectorLabel,
  categoryBadge,
  isNewCardGuaranteed,
  topActions,
  confirmLabel = 'CONFIRM',
  confirmDisabled = false,
  confirmIcon,
  secondaryAction,
  extraBottomContent,
  themeColor = '#f59e0b',
  accentGradient = 'from-amber-400 via-yellow-300 to-amber-500',
  children,
  onClose,
  hideHeader = false,
  cardBackgroundClass = 'bg-slate-950',
}) => {
  const [direction, setDirection] = useState<number>(0);
  const [hasGamepadConnected, setHasGamepadConnected] = useState<boolean>(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastGamepadActionTimeRef = useRef<number>(0);

  const canGoPrev = totalChoices > 1;
  const canGoNext = totalChoices > 1;

  const handlePrev = useCallback(() => {
    if (totalChoices > 1) {
      haptics.lightTap();
      playChoiceRetroSound('move');
      setDirection(-1);
      const prevIndex = (currentIndex - 1 + totalChoices) % totalChoices;
      onNavigate(prevIndex);
    }
  }, [totalChoices, currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (totalChoices > 1) {
      haptics.lightTap();
      playChoiceRetroSound('move');
      setDirection(1);
      const nextIndex = (currentIndex + 1) % totalChoices;
      onNavigate(nextIndex);
    }
  }, [totalChoices, currentIndex, onNavigate]);

  const handleConfirmClick = useCallback(() => {
    if (!confirmDisabled) {
      haptics.success();
      playChoiceRetroSound('select');
      onConfirm();
    }
  }, [confirmDisabled, onConfirm]);

  const handleSecondaryClick = useCallback(() => {
    if (secondaryAction) {
      haptics.lightTap();
      playChoiceRetroSound('back');
      secondaryAction.onClick();
    } else if (onClose) {
      haptics.lightTap();
      playChoiceRetroSound('back');
      onClose();
    }
  }, [secondaryAction, onClose]);

  const handlePrevRef = useRef(handlePrev);
  handlePrevRef.current = handlePrev;
  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;
  const handleConfirmClickRef = useRef(handleConfirmClick);
  handleConfirmClickRef.current = handleConfirmClick;
  const handleSecondaryClickRef = useRef(handleSecondaryClick);
  handleSecondaryClickRef.current = handleSecondaryClick;
  const canGoPrevRef = useRef(canGoPrev);
  canGoPrevRef.current = canGoPrev;
  const canGoNextRef = useRef(canGoNext);
  canGoNextRef.current = canGoNext;
  const confirmDisabledRef = useRef(confirmDisabled);
  confirmDisabledRef.current = confirmDisabled;
  const canSecondaryRef = useRef(Boolean(secondaryAction || onClose));
  canSecondaryRef.current = Boolean(secondaryAction || onClose);

  // Gamepad Connection Listeners & Polling Loop
  useEffect(() => {
    if (!isOpen) return;

    const handleGamepadConnected = () => setHasGamepadConnected((prev) => (prev ? prev : true));
    const handleGamepadDisconnected = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const anyPad = Array.from(pads).some((p) => p !== null && p.connected);
      setHasGamepadConnected((prev) => (prev !== anyPad ? anyPad : prev));
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Initial probe
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const hasPads = Array.from(pads).some((p) => p !== null && p.connected);
    if (hasPads) {
      setHasGamepadConnected((prev) => (prev ? prev : true));
    }

    let animationFrameId: number;
    const pollGamepad = (timestamp: number) => {
      if (timestamp - lastGamepadActionTimeRef.current > 220) {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const pad of gamepads) {
          if (!pad || !pad.connected) continue;

          // D-Pad Left (button 14) or Left Stick Left (axis 0 < -0.5) or L1 bumper (button 4)
          const leftPressed =
            pad.buttons[14]?.pressed ||
            pad.axes[0] < -0.5 ||
            pad.buttons[4]?.pressed;

          // D-Pad Right (button 15) or Left Stick Right (axis 0 > 0.5) or R1 bumper (button 5)
          const rightPressed =
            pad.buttons[15]?.pressed ||
            pad.axes[0] > 0.5 ||
            pad.buttons[5]?.pressed;

          // A / Cross button (button 0)
          const aPressed = pad.buttons[0]?.pressed;

          // B / Circle button (button 1)
          const bPressed = pad.buttons[1]?.pressed;

          if (leftPressed && canGoPrevRef.current) {
            handlePrevRef.current();
            lastGamepadActionTimeRef.current = timestamp;
            break;
          } else if (rightPressed && canGoNextRef.current) {
            handleNextRef.current();
            lastGamepadActionTimeRef.current = timestamp;
            break;
          } else if (aPressed && !confirmDisabledRef.current) {
            handleConfirmClickRef.current();
            lastGamepadActionTimeRef.current = timestamp;
            break;
          } else if (bPressed && canSecondaryRef.current) {
            handleSecondaryClickRef.current();
            lastGamepadActionTimeRef.current = timestamp;
            break;
          }
        }
      }
      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    animationFrameId = requestAnimationFrame(pollGamepad);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handlePrevRef.current();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleNextRef.current();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (!confirmDisabledRef.current) {
          e.preventDefault();
          handleConfirmClickRef.current();
        }
      } else if (e.key === 'Escape') {
        if (canSecondaryRef.current) {
          e.preventDefault();
          handleSecondaryClickRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 36) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!isOpen) return null;

  const displaySelector = selectorLabel || `CHOICE ${currentIndex + 1} OF ${totalChoices}`;

  return (
    <div
      id="drawstar-choice-system-modal"
      className="fixed inset-0 z-[9999] w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none animate-in fade-in duration-150"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 32-Bit Scanline & Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40 z-20" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,6,23,0.85)_100%)] z-10" />

      {/* Atmospheric Theme Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-56 opacity-20 pointer-events-none blur-3xl transition-all duration-500"
        style={{ background: themeColor }}
      />

      {/* ========================================================================= */}
      {/* 1. 32-BIT RETRO TOP HEADER (BEVEL BORDER & PIXEL STATUS) */}
      {/* ========================================================================= */}
      {!hideHeader && (
        <header className="relative z-30 px-3 py-2 sm:px-6 sm:py-2.5 bg-slate-900 border-b-2 border-slate-700 pixel-bevel-raised flex items-center justify-between gap-2 shadow-md">
          {/* Left Title & Status Section */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Retro Choice Plate */}
            <div className="px-2.5 py-1 bg-slate-950 border border-amber-500/60 pixel-bevel-gold text-amber-300 font-mono font-black text-[10px] sm:text-xs tracking-wider flex items-center gap-1.5 shadow-sm shrink-0">
              <span className="w-2 h-2 bg-amber-400 animate-pixel-blink" />
              <span>{displaySelector.toUpperCase()}</span>
            </div>

            {categoryBadge}

            {isNewCardGuaranteed && (
              <div className="px-2 py-0.5 bg-amber-950/80 border border-yellow-400 pixel-bevel-gold text-yellow-300 font-mono font-black text-[10px] sm:text-xs tracking-wider flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                <span className="hidden sm:inline">NEW CARD GUARANTEE</span>
                <span className="sm:hidden">NEW</span>
              </div>
            )}

            <div className="hidden md:block min-w-0">
              <h1 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase pixel-text-shadow-sm truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Action Buttons & Quick Stepped Pagination */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 32-Bit Stepped Pagination pips */}
            {totalChoices > 1 && totalChoices <= 12 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 px-2 py-1 border border-slate-700 pixel-bevel-raised">
                {Array.from({ length: totalChoices }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      haptics.lightTap();
                      playChoiceRetroSound('move');
                      setDirection(idx > currentIndex ? 1 : -1);
                      onNavigate(idx);
                    }}
                    className={`h-2 transition-all cursor-pointer ${
                      idx === currentIndex
                        ? 'w-5 bg-amber-400 border border-amber-200 pixel-bevel-gold'
                        : 'w-2 bg-slate-700 hover:bg-slate-500 border border-slate-800'
                    }`}
                    aria-label={`Jump to choice ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Controller indicator if active */}
            {hasGamepadConnected && (
              <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-slate-950 border border-cyan-600/50 text-cyan-400 font-mono text-[10px] uppercase tracking-wider">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>PAD 1</span>
              </div>
            )}

            {topActions && <div className="flex items-center gap-1.5">{topActions}</div>}
          </div>
        </header>
      )}

      {/* ========================================================================= */}
      {/* 2. 32-BIT TACTILE PIXEL ARROW CONTROLS (FULL WIDTH ANCHORED LAYER) */}
      {/* ========================================================================= */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-40 flex items-center justify-between px-2 sm:px-4">
        {canGoPrev ? (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous choice"
            className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 hover:bg-slate-800 text-amber-400 border-2 border-slate-700 hover:border-amber-400 pixel-bevel-raised shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer select-none group shrink-0"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] group-hover:-translate-x-0.5 transition-transform" />
            <span className="sr-only">Previous</span>
          </button>
        ) : (
          <div className="w-10 sm:w-12 pointer-events-none shrink-0" />
        )}

        {canGoNext ? (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next choice"
            className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 hover:bg-slate-800 text-amber-400 border-2 border-slate-700 hover:border-amber-400 pixel-bevel-raised shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer select-none group shrink-0"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
            <span className="sr-only">Next</span>
          </button>
        ) : (
          <div className="w-10 sm:w-12 pointer-events-none shrink-0" />
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. SCROLLABLE CENTRAL VIEWPORT (FOCUSED DECISION, NO TOP-CLIPPING) */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full flex-1 overflow-y-auto overscroll-contain custom-scrollbar px-3 sm:px-12 py-2 sm:py-4">
        <div className="w-full max-w-2xl mx-auto min-h-full flex flex-col items-center justify-start sm:justify-center py-2 sm:py-4">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 45, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -45, scale: 0.97 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="w-full flex flex-col items-center justify-center"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. 32-BIT ARCADE BOTTOM ACTION DOCK */}
      {/* ========================================================================= */}
      <footer className="relative z-30 px-3 py-2.5 sm:px-6 sm:py-3 bg-slate-900 border-t-2 border-slate-700 pixel-bevel-raised flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xl">
        {/* Mobile Stepped Indicator */}
        {totalChoices > 1 && totalChoices <= 12 && (
          <div className="flex sm:hidden items-center justify-center gap-1.5 w-full py-0.5">
            {Array.from({ length: totalChoices }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  haptics.lightTap();
                  playChoiceRetroSound('move');
                  setDirection(idx > currentIndex ? 1 : -1);
                  onNavigate(idx);
                }}
                className={`h-1.5 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 bg-amber-400 border border-amber-200'
                    : 'w-2 bg-slate-700'
                }`}
                aria-label={`Go to choice ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Secondary Action / Controller Navigation Prompts */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          {secondaryAction ? (
            <button
              type="button"
              onClick={handleSecondaryClick}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 border-2 ${
                secondaryAction.variant === 'danger'
                  ? 'bg-rose-950 text-rose-300 border-rose-600 pixel-bevel-crimson hover:bg-rose-900'
                  : secondaryAction.variant === 'ghost'
                  ? 'bg-slate-950 text-slate-300 border-slate-700 pixel-bevel-raised hover:bg-slate-800'
                  : 'bg-slate-800 text-white border-slate-600 pixel-bevel-raised hover:bg-slate-700'
              }`}
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          ) : (
            /* Arcade controller and keyboard cheat sheet */
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 text-amber-400">
                ← / →
              </span>
              <span>BROWSE</span>
              <span className="text-slate-600">|</span>
              <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 text-emerald-400">
                SPACE / ENTER
              </span>
              <span>CONFIRM</span>
            </div>
          )}

          {extraBottomContent}
        </div>

        {/* Primary High-Impact 32-Bit Pixel Confirm Button */}
        <button
          type="button"
          id="choice-system-confirm-btn"
          onClick={handleConfirmClick}
          disabled={confirmDisabled}
          className={`w-full sm:w-auto min-h-[46px] sm:min-h-[48px] sm:min-w-[240px] px-6 py-2 sm:py-2.5 font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-150 cursor-pointer active:scale-95 select-none border-2 ${
            confirmDisabled
              ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50 pixel-bevel-raised'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-amber-300 pixel-bevel-gold hover:brightness-110 shadow-[0_0_16px_rgba(245,158,11,0.4)]'
          }`}
        >
          {confirmIcon || <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />}
          <span className="truncate">{confirmLabel}</span>
        </button>
      </footer>
    </div>
  );
};
