import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UKFlag,
  SpainFlag,
  ArgentinaFlag,
  BrazilFlag,
  FranceFlag,
  GermanyFlag,
  ItalyFlag,
  SaudiArabiaFlag,
  WhiteFlag,
} from './FlagVectors';
import { LanguageCode } from '../utils/localizationSystem';
import { PixelWavingFlagCanvas } from './pixel/PixelWavingFlagCanvas';

export interface LanguageCarouselItem {
  code: string;
  name: string;
  nativeName: string;
  flagName: string;
  component: React.FC<{ className?: string }>;
  isDisabled: boolean;
  isSoon?: boolean;
}

export const CAROUSEL_LANGUAGES: LanguageCarouselItem[] = [
  {
    code: 'en-GB',
    name: 'UK English',
    nativeName: 'English (UK)',
    flagName: 'British flag',
    component: UKFlag,
    isDisabled: false,
  },
  {
    code: 'es-ES',
    name: 'Castilian Spanish',
    nativeName: 'Español (España)',
    flagName: 'Spanish flag',
    component: SpainFlag,
    isDisabled: false,
  },
  {
    code: 'es-AR',
    name: 'Argentinean Spanish',
    nativeName: 'Español (Argentina)',
    flagName: 'Argentinean flag',
    component: ArgentinaFlag,
    isDisabled: false,
  },
  {
    code: 'pt-BR',
    name: 'Portuguese',
    nativeName: 'Português (Brasil)',
    flagName: 'Brazilian flag',
    component: BrazilFlag,
    isDisabled: false,
  },
  {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    flagName: 'French flag',
    component: FranceFlag,
    isDisabled: false,
  },
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flagName: 'German flag',
    component: GermanyFlag,
    isDisabled: true,
    isSoon: true,
  },
  {
    code: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    flagName: 'Italian flag',
    component: ItalyFlag,
    isDisabled: true,
    isSoon: true,
  },
  {
    code: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية (السعودية)',
    flagName: 'Saudi Arabian flag',
    component: SaudiArabiaFlag,
    isDisabled: true,
    isSoon: true,
  },
];

// Synthesized 32-bit retro audio cues
function playRetroSound(type: 'navigate' | 'confirm' | 'reject') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'navigate') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'confirm') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.12);
      });
    } else if (type === 'reject') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    }
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

interface LanguageFlagCarouselProps {
  onConfirm: (code: LanguageCode) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const LanguageFlagCarousel: React.FC<LanguageFlagCarouselProps> = ({
  onConfirm,
  onClose,
  showCloseButton = false,
}) => {
  // Initial state: start on a completely white/blank flag
  const [isWhiteFlag, setIsWhiteFlag] = useState<boolean>(true);
  // Carousel index (0 to 7) once active
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Touch tracking for swipe navigation
  const touchStartXRef = useRef<number | null>(null);

  // Current language item (null if white flag)
  const currentLang = isWhiteFlag ? null : CAROUSEL_LANGUAGES[currentIndex];
  const isCurrentDisabled = currentLang ? currentLang.isDisabled : false;

  // Navigation handlers
  const handleNext = useCallback(() => {
    playRetroSound('navigate');
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 150);

    if (isWhiteFlag) {
      // Move from initial white flag to first language: UK English
      // Once the player moves to UK English, the white flag is permanently removed!
      setIsWhiteFlag(false);
      setCurrentIndex(0);
    } else {
      // Circular navigation: 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 0
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_LANGUAGES.length);
    }
  }, [isWhiteFlag]);

  const handlePrev = useCallback(() => {
    playRetroSound('navigate');
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 150);

    if (isWhiteFlag) {
      // From white flag, player enters carousel permanently
      setIsWhiteFlag(false);
      // Pressing LEFT transitions into carousel
      setCurrentIndex(CAROUSEL_LANGUAGES.length - 1);
    } else {
      // Circular wrap around: UK English (0) -> Arabic (7)
      setCurrentIndex((prev) => (prev - 1 + CAROUSEL_LANGUAGES.length) % CAROUSEL_LANGUAGES.length);
    }
  }, [isWhiteFlag]);

  const handleConfirm = useCallback(() => {
    if (isWhiteFlag) return;
    if (!currentLang || currentLang.isDisabled) {
      playRetroSound('reject');
      return;
    }
    playRetroSound('confirm');
    onConfirm(currentLang.code as LanguageCode);
  }, [isWhiteFlag, currentLang, onConfirm]);

  const nextRef = useRef(handleNext);
  nextRef.current = handleNext;
  const prevRef = useRef(handlePrev);
  prevRef.current = handlePrev;
  const confirmRef = useRef(handleConfirm);
  confirmRef.current = handleConfirm;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        nextRef.current();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        prevRef.current();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        confirmRef.current();
      } else if (e.key === 'Escape' && closeRef.current) {
        e.preventDefault();
        closeRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Controller / Gamepad navigation polling
  useEffect(() => {
    let animId: number;
    let lastStickAction = 0;

    const pollGamepads = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads.find((g) => g !== null);

      if (gp) {
        const now = Date.now();
        const dpadLeft = gp.buttons[14]?.pressed;
        const dpadRight = gp.buttons[15]?.pressed;
        const stickX = gp.axes[0] ?? 0;
        const buttonA = gp.buttons[0]?.pressed;

        if (now - lastStickAction > 280) {
          if (dpadRight || stickX > 0.5) {
            lastStickAction = now;
            nextRef.current();
          } else if (dpadLeft || stickX < -0.5) {
            lastStickAction = now;
            prevRef.current();
          } else if (buttonA) {
            lastStickAction = now;
            confirmRef.current();
          }
        }
      }
      animId = requestAnimationFrame(pollGamepads);
    };

    animId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (deltaX > 40) {
      handlePrev();
    } else if (deltaX < -40) {
      handleNext();
    }
    touchStartXRef.current = null;
  };

  // Flag component to render
  const ActiveFlagComponent = isWhiteFlag ? WhiteFlag : currentLang!.component;

  return (
    <div
      className="relative z-10 w-full max-w-4xl flex flex-col items-center justify-center p-3 sm:p-6 select-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* OPTIONAL CLOSE BUTTON (WHEN USED IN MODAL) */}
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-slate-900 border-2 border-slate-700 hover:border-amber-400 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer z-50 pixel-bevel-silver"
          title="Close"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* MAIN CAROUSEL ROW: [LEFT ARROW] [FLAG AREA] [RIGHT ARROW] */}
      <div className="w-full flex items-center justify-center gap-3 sm:gap-6 md:gap-10 py-2 sm:py-4">
        {/* LARGE LEFT ARROW BUTTON */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous"
          className="group relative w-12 h-14 sm:w-16 sm:h-20 md:w-20 md:h-24 bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-400/80 hover:border-amber-300 text-amber-400 hover:text-amber-200 active:translate-y-1 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-all shadow-[0_4px_0_#78350f,0_10px_20px_rgba(0,0,0,0.6)] pixel-bevel-gold shrink-0 touch-manipulation focus:outline-none"
        >
          <div className="flex items-center justify-center w-full h-full">
            {/* Pixel Arrow Left SVG */}
            <svg viewBox="0 0 16 16" className="w-7 h-7 sm:w-10 sm:h-10 fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" shapeRendering="crispEdges">
              <path d="M8 2 H10 V4 H8 V6 H6 V8 H4 V10 H6 V12 H8 V14 H10 V12 H8 V10 H8 V8 H8 V6 H8 V4 H8 V2 Z" />
              <rect x="8" y="7" width="6" height="2" />
            </svg>
          </div>
        </button>

        {/* FLAG DISPLAY AREA */}
        <div className="relative flex flex-col items-center justify-center">
          {/* DISABLED PADLOCK INDICATOR (WORDLESS, GLOBALLY RECOGNIZED SYMBOL) */}
          {isCurrentDisabled && (
            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-40 pointer-events-none select-none animate-pulse">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/95 border-2 border-amber-500/90 flex items-center justify-center text-amber-400 shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 7a2 2 0 0 1 1 1.73V18a1 1 0 0 1-2 0v-2.27A2 2 0 0 1 12 14z" />
                </svg>
              </div>
            </div>
          )}

          {/* 32-BIT DEFORMING PIXEL-ART WAVING FLAG STAGE */}
          <div
            onClick={!isWhiteFlag && !isCurrentDisabled ? handleConfirm : undefined}
            className={`relative flex items-center justify-center transition-transform duration-150 ${
              !isWhiteFlag && !isCurrentDisabled ? 'cursor-pointer hover:scale-[1.02]' : ''
            } ${
              isTransitioning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
            }`}
          >
            <PixelWavingFlagCanvas
              languageCode={isWhiteFlag ? 'white' : currentLang!.code}
              flagName={isWhiteFlag ? 'White flag' : currentLang!.flagName}
              isDisabled={isCurrentDisabled}
              FlagComponent={ActiveFlagComponent}
              className="w-56 sm:w-72 md:w-88 lg:w-[420px] h-auto drop-shadow-[0_16px_36px_rgba(0,0,0,0.65)]"
            />
          </div>
        </div>

        {/* LARGE RIGHT ARROW BUTTON */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next"
          className={`group relative w-12 h-14 sm:w-16 sm:h-20 md:w-20 md:h-24 bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-400/80 hover:border-amber-300 text-amber-400 hover:text-amber-200 active:translate-y-1 rounded-sm flex flex-col items-center justify-center cursor-pointer transition-all shadow-[0_4px_0_#78350f,0_10px_20px_rgba(0,0,0,0.6)] pixel-bevel-gold shrink-0 touch-manipulation focus:outline-none ${
            isWhiteFlag ? 'animate-pulse ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : ''
          }`}
        >
          <div className="flex items-center justify-center w-full h-full">
            {/* Pixel Arrow Right SVG */}
            <svg viewBox="0 0 16 16" className="w-7 h-7 sm:w-10 sm:h-10 fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" shapeRendering="crispEdges">
              <path d="M8 2 H6 V4 H8 V6 H10 V8 H12 V10 H10 V12 H8 V14 H6 V12 H8 V10 H8 V8 H8 V6 H8 V4 H8 V2 Z" />
              <rect x="2" y="7" width="6" height="2" />
            </svg>
          </div>
        </button>
      </div>

      {/* CONFIRM ACTION AREA (WORDLESS, UNIVERSALLY UNDERSTOOD ICONS) */}
      <div className="mt-6 sm:mt-8 min-h-[64px] flex items-center justify-center">
        {isWhiteFlag ? (
          // Unselected initial state: spacer
          <div className="h-14 sm:h-16" />
        ) : isCurrentDisabled ? (
          // Disabled / Unavailable: Universal Padlock icon
          <button
            type="button"
            disabled={true}
            aria-disabled="true"
            onClick={(e) => {
              e.preventDefault();
              playRetroSound('reject');
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900/90 border-2 border-slate-700 text-slate-500 flex items-center justify-center cursor-not-allowed select-none shadow-inner opacity-75"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
        ) : (
          // Active: Jewel-like Emerald Confirm Checkmark Button (Universal ✓)
          <button
            type="button"
            onClick={handleConfirm}
            aria-label="Confirm"
            className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 hover:from-emerald-300 hover:to-emerald-500 active:scale-95 text-slate-950 flex items-center justify-center cursor-pointer select-none transition-all shadow-[0_4px_0_#064e3b,0_12px_28px_rgba(16,185,129,0.55)] pixel-bevel-emerald focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
          >
            <svg className="w-8 h-8 sm:w-9 sm:h-9 text-slate-950 stroke-[3.5] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        )}
      </div>

      {/* CAROUSEL PAGINATION TICKS (ONLY VISIBLE ONCE IN CAROUSEL) */}
      {!isWhiteFlag && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {CAROUSEL_LANGUAGES.map((item, idx) => {
            const isSel = idx === currentIndex;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  playRetroSound('navigate');
                  setCurrentIndex(idx);
                }}
                className={`transition-all rounded-xs ${
                  isSel
                    ? 'w-6 h-2 bg-amber-400 border border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : item.isDisabled
                    ? 'w-2 h-2 bg-zinc-700 border border-zinc-600 opacity-40'
                    : 'w-2 h-2 bg-slate-600 hover:bg-slate-400 border border-slate-500'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
