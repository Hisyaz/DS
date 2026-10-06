import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PixelBallIcon,
  PixelCleatIcon,
  PixelCoinIcon,
  PixelStarIcon,
  PixelArrowRightIcon,
  PixelSparklesIcon,
} from './PixelIcons';
import { audioManager } from '../../utils/audioSystem';
import { haptics } from '../../utils/hapticsSystem';
import {
  shouldDisableAnimations,
  isHighQualityModeActive,
  triggerAppCelebration,
} from '../../utils/graphicSettingsSystem';

interface PixelCoinSlotCareerButtonProps {
  championCredits: number;
  hasSavedCareer?: boolean;
  onContinueCareer?: () => void;
  onStartCareer: () => void;
  onOpenStore: () => void;
  showToast: (msg: string) => void;
  t?: (key: string) => string;
}

type AnimPhase = 'idle' | 'darken_slot' | 'coin_drop' | 'coin_inserted' | 'power_light' | 'done';

export const PixelCoinSlotCareerButton: React.FC<PixelCoinSlotCareerButtonProps> = ({
  championCredits,
  hasSavedCareer = false,
  onContinueCareer,
  onStartCareer,
  onOpenStore,
  showToast,
  t = (s) => s,
}) => {
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle');
  const [sparkKey, setSparkKey] = useState(0);
  const isExecutingRef = useRef(false);

  // Reset to idle on mount to guarantee fresh starting state when returning to menu
  useEffect(() => {
    setAnimPhase('idle');
    isExecutingRef.current = false;
  }, []);

  // Trigger coin animation for starting a new career
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animPhase !== 'idle') return;

    if (championCredits < 1) {
      audioManager.playCardFlipSound();
      haptics.lightTap();
      showToast(t('⚠️ 1 Champion Credit required! Open Card Store or Earn Credits.'));
      onOpenStore();
      return;
    }

    if (shouldDisableAnimations()) {
      audioManager.playSlotMachineCoinInsertSound();
      haptics.firmImpact();
      onStartCareer();
      return;
    }

    isExecutingRef.current = false;
    setAnimPhase('darken_slot');
    audioManager.playCardFlipSound();
    haptics.firmImpact();
  };

  // Continue existing career without paying any coins
  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animPhase !== 'idle') return;
    if (onContinueCareer) {
      audioManager.playCardFlipSound();
      haptics.mediumTap();
      onContinueCareer();
    }
  };

  useEffect(() => {
    if (animPhase === 'idle') return;

    // Timeline of the 32-bit coin insertion sequence:
    // Phase 1: darken_slot (0ms - 350ms) - Bezel darkens and prepares slot
    // Phase 2: coin_drop (350ms - 1000ms) - Rounded 32-bit coin descends above the slot mouth
    // Phase 3: coin_inserted (1000ms - 1500ms) - Coin physically enters and plunges into the slot hole
    // Phase 4: power_light (1500ms - 2150ms) - Mechanical latch engaged, neon acceptance surge!
    // Phase 5: onStartCareer() called, then resets cleanly back to idle for subsequent visits

    let t1: any, t2: any, t3: any, t4: any;

    if (animPhase === 'darken_slot') {
      t1 = setTimeout(() => {
        setAnimPhase('coin_drop');
        audioManager.playCardFlipSound();
      }, 350);
    } else if (animPhase === 'coin_drop') {
      t2 = setTimeout(() => {
        setAnimPhase('coin_inserted');
        audioManager.playSlotMachineCoinInsertSound();
        haptics.success();
        setSparkKey((prev) => prev + 1);
        if (isHighQualityModeActive()) {
          triggerAppCelebration({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.72 },
            colors: ['#ffd700', '#fbbf24', '#fef08a', '#ffffff'],
            ticks: 200,
          });
        }
      }, 650);
    } else if (animPhase === 'coin_inserted') {
      t3 = setTimeout(() => {
        setAnimPhase('power_light');
        audioManager.playLegendaryFlashSound();
        haptics.firmImpact();
        if (isHighQualityModeActive()) {
          triggerAppCelebration({
            particleCount: 90,
            spread: 90,
            origin: { y: 0.65 },
            colors: ['#10b981', '#34d399', '#6ee7b7', '#06b6d4', '#fbbf24'],
            ticks: 250,
          });
        }
      }, 500);
    } else if (animPhase === 'power_light') {
      t4 = setTimeout(() => {
        if (!isExecutingRef.current) {
          isExecutingRef.current = true;
          onStartCareer();
          // Reset back to idle state so returning to main menu immediately recovers its starting state!
          setTimeout(() => {
            setAnimPhase('idle');
            isExecutingRef.current = false;
          }, 350);
        }
      }, 650);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [animPhase, onStartCareer]);

  // Fast skip if clicked while animating
  const handleFastSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animPhase !== 'idle' && !isExecutingRef.current) {
      isExecutingRef.current = true;
      audioManager.playSlotMachineCoinInsertSound();
      haptics.success();
      onStartCareer();
      setTimeout(() => {
        setAnimPhase('idle');
        isExecutingRef.current = false;
      }, 350);
    }
  };

  const isAnimating = animPhase !== 'idle';

  const hasDirectActionButtons = Boolean(hasSavedCareer && onContinueCareer);

  return (
    <div
      id="main-menu-unique-career-pixel-btn"
      tabIndex={hasDirectActionButtons ? -1 : 0}
      data-nav-item={!hasDirectActionButtons ? 'true' : undefined}
      role={hasDirectActionButtons ? undefined : 'button'}
      aria-label="Start Unique Career Mode"
      onClick={isAnimating ? handleFastSkip : hasDirectActionButtons ? undefined : handleClick}
      className={`group relative select-none rounded-none text-left ${hasDirectActionButtons ? '' : 'cursor-pointer'} transition-all duration-300 overflow-hidden min-h-[320px] sm:min-h-[360px] md:min-h-[390px] flex flex-col justify-between p-6 sm:p-7 ${
        isAnimating
          ? 'pixel-bevel-raised bg-[#05070d] border-2 border-emerald-500/80 shadow-[0_0_40px_rgba(16,185,129,0.35)]'
          : 'pixel-bevel-raised bg-gradient-to-b from-[#0e1726] via-[#09111e] to-[#040810] border-2 border-emerald-500/60 hover:border-emerald-400 shadow-[0_16px_36px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_45px_rgba(16,185,129,0.25)] hover:-translate-y-1 active:translate-y-0'
      }`}
    >
      {/* 32-Bit Pixel Grid / Dither Underlay */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />

      {/* Decorative Arcade Corner Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400/80 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400/80 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400/80 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400/80 pointer-events-none" />

      {/* NORMAL STATE (when not animating) */}
      {!isAnimating && (
        <>
          {/* Background Atmospheric Glow */}
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

          {/* Top Row Badges */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm">
                <PixelCleatIcon size={14} className="text-emerald-400" />
                <span>{t('ORIGIN JOURNEY')}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-500/60 font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wide shadow-sm">
                <PixelCoinIcon size={13} />
                <span>{t('1 CREDIT')}</span>
              </span>
            </div>

            {/* Glowing Pixel Cartridge Mark */}
            <div className="hidden sm:flex items-center gap-1 text-[9px] font-mono font-black text-emerald-400/80 uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
              <span>{t('SLOT 01')}</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="relative z-10 my-auto py-3 space-y-2.5 max-w-md">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-500/20 border-2 border-emerald-400/80 flex items-center justify-center text-emerald-300 shadow-sm shrink-0">
                <PixelBallIcon size={18} />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-arcade tracking-wide text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {t('UNIQUE CAREER')}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              {t('Start at age 10 in your chosen origin city. Build attributes, sign pro contracts, and rise to world glory.')}
            </p>

            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-emerald-300/80">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400" />
                {t('Full Deck Progression')}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400" />
                {t('Youth to Legend')}
              </span>
            </div>
          </div>

          {/* Action Footer Bar */}
          {hasSavedCareer && onContinueCareer ? (
            <div className="relative z-10 pt-4 border-t border-emerald-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* PRIMARY CONTINUE BUTTON (0 COINS CHARGED) */}
              <button
                id="unique-career-continue-btn"
                type="button"
                onClick={handleContinueClick}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider pixel-bevel-raised transition-all shadow-md active:scale-95 cursor-pointer"
                title="Resume your saved Unique Career • 0 Credits"
              >
                <PixelArrowRightIcon size={16} />
                <span>{t('CONTINUE CAREER')}</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-200 border border-emerald-400/60 px-1.5 py-0.5 rounded-none ml-1">
                  {t('RESUME')}
                </span>
              </button>

              {/* NEW CAREER (1 COIN) */}
              <button
                id="unique-career-new-coin-btn"
                type="button"
                onClick={handleClick}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-500/70 font-arcade font-black text-xs uppercase tracking-wider pixel-bevel-gold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Pay 1 coin to start a brand new unique career"
              >
                <PixelCoinIcon size={14} />
                <span>{t('NEW (1 🪙)')}</span>
              </button>
            </div>
          ) : (
            <div className="relative z-10 pt-4 border-t border-emerald-500/30 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 group-hover:bg-emerald-500 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider pixel-bevel-raised transition-all shadow-md">
                <PixelCoinIcon size={16} />
                <span>{t('INSERT COIN & PLAY')}</span>
              </div>

              <div className="w-8 h-8 bg-slate-900 border border-emerald-500/60 group-hover:border-emerald-400 group-hover:bg-emerald-950/80 flex items-center justify-center text-emerald-300 transition-colors shadow-sm">
                <PixelArrowRightIcon size={16} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 32-BIT COIN SLOT ANIMATION OVERLAY (WHEN ENTERING UNIQUE CAREER) */}
      {/* ========================================================================= */}
      {isAnimating && (
        <div className="relative z-20 w-full h-full flex flex-col justify-between my-auto py-2">
          {/* Top Marquee Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 ${
                  animPhase === 'power_light' ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400'
                } animate-pulse`}
              />
              <span className="text-[11px] sm:text-xs font-mono font-black uppercase tracking-wider text-emerald-300">
                {animPhase === 'darken_slot' && t('INITIALIZING COIN CHUTE...')}
                {animPhase === 'coin_drop' && t('INSERTING 1 CHAMPION COIN...')}
                {animPhase === 'coin_inserted' && t('COIN ACCEPTED • LATCH ENGAGED!')}
                {animPhase === 'power_light' && t('⚡ CAREER MODE ACTIVATED!')}
              </span>
            </div>

            <span className="text-[9px] font-mono text-slate-400 bg-black/60 border border-slate-700 px-2 py-0.5">
              {t('TAP TO SKIP ⏩')}
            </span>
          </div>

          {/* Center Stage: The 32-Bit Coin Chute & Falling Coin */}
          <div className="relative my-auto flex flex-col items-center justify-center py-4 min-h-[210px]">
            {/* 32-Bit Arcade Coin Slot Bezel */}
            <div
              className={`relative z-10 w-64 sm:w-72 p-4 transition-all duration-500 flex flex-col items-center ${
                animPhase === 'power_light'
                  ? 'bg-gradient-to-b from-[#042f2e] to-[#021e1d] border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.7)]'
                  : 'bg-gradient-to-b from-[#111827] to-[#030712] border-2 border-slate-700 shadow-[inset_0_4px_10px_rgba(0,0,0,0.9)]'
              }`}
            >
              {/* Bezel Title */}
              <div className="w-full flex items-center justify-between text-[10px] font-mono font-black uppercase tracking-wider mb-2.5">
                <span className="text-amber-400 flex items-center gap-1">
                  <PixelCoinIcon size={12} />
                  <span>{t('CREDIT INTAKE')}</span>
                </span>
                <span className={animPhase === 'power_light' ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                  {t('1 PLAY = 1 🪙')}
                </span>
              </div>

              {/* Coin Slot Insertion Chamber (Layered so coin drops physically into the hole) */}
              <div className="relative w-48 h-20 flex flex-col items-center justify-center overflow-visible">
                {/* Back cavity of slot (dark hole background) */}
                <div className="absolute top-7 w-36 h-4 bg-black border border-amber-600/80 shadow-[inset_0_4px_8px_rgba(0,0,0,1)] flex items-center justify-center z-10">
                  <div className="w-28 h-0.5 bg-amber-500/40 blur-[0.5px]" />
                </div>

                {/* THE 32-BIT ROUNDED COIN: Descends and enters directly into the hole */}
                <AnimatePresence>
                  {(animPhase === 'coin_drop' || animPhase === 'coin_inserted') && (
                    <motion.div
                      key="pixel-champion-rounded-coin"
                      initial={{ y: -65, opacity: 0, scale: 1.05, rotateX: 0 }}
                      animate={
                        animPhase === 'coin_drop'
                          ? {
                              y: [ -65, -8, 2 ],
                              opacity: [ 0, 1, 1 ],
                              scale: [ 1.05, 1.0, 0.98 ],
                              rotateX: [ 0, 15, 25 ],
                            }
                          : {
                              // Plunges straight down through the slot hole aperture
                              y: [ 2, 16, 36 ],
                              scale: [ 0.98, 0.85, 0.65 ],
                              rotateX: [ 25, 40, 50 ],
                              opacity: [ 1, 0.8, 0 ],
                            }
                      }
                      transition={
                        animPhase === 'coin_drop'
                          ? { duration: 0.6, ease: 'easeOut' }
                          : { duration: 0.45, ease: 'easeIn' }
                      }
                      className="absolute z-20 flex flex-col items-center justify-center pointer-events-none"
                      style={{ top: '6px' }}
                    >
                      {/* Authentic 32-Bit Rounded Pixel Gold Coin */}
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-b from-[#fef08a] via-[#eab308] to-[#92400e] border-[3px] border-[#78350f] shadow-[0_0_20px_rgba(234,179,8,0.85),inset_0_2px_0_rgba(255,255,255,0.7),inset_0_-2px_0_rgba(113,63,18,0.9)] flex items-center justify-center text-slate-950 font-black pixel-crisp">
                        {/* Circular milled rim notch effect */}
                        <div className="absolute inset-0.5 rounded-full border border-dashed border-[#b45309]/60 pointer-events-none" />

                        {/* Inner debossed gold core */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#fde047] via-[#ca8a04] to-[#78350f] border border-[#a16207] flex flex-col items-center justify-center shadow-inner">
                          <PixelStarIcon size={14} color="#78350f" />
                          <span className="text-[7px] font-mono font-black text-[#451a03] tracking-tighter leading-none mt-0.5">
                            1 COIN
                          </span>
                        </div>

                        {/* 32-Bit Specular Highlight Glint in upper left */}
                        <div className="absolute top-1.5 left-2 w-2 h-2 rounded-full bg-white shadow-[0_0_3px_white] pointer-events-none" />
                        <div className="absolute top-3 left-1.5 w-1 h-1 bg-yellow-100 pointer-events-none" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Foreground Front Lip of the Coin Slot Bezel (Layer z-30 covers the entering coin) */}
                <div className="absolute top-9 w-40 h-7 bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-t-2 border-b border-x border-amber-600/90 shadow-[0_4px_12px_rgba(0,0,0,0.9)] rounded-b-sm z-30 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-[1px] bg-amber-400/40" />
                </div>

                {/* Animated Light Slit inside Slot */}
                <motion.div
                  animate={{
                    opacity: animPhase === 'power_light' ? [0.6, 1, 0.6] : [0.3, 0.8, 0.3],
                    scaleX: animPhase === 'power_light' ? [1, 1.3, 1] : [1, 1.1, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className={`absolute top-8 w-28 h-1 z-25 ${
                    animPhase === 'power_light' ? 'bg-emerald-400' : 'bg-amber-400'
                  } blur-[0.5px] pointer-events-none`}
                />
              </div>

              {/* Sparks Burst on Coin Insertion */}
              {animPhase === 'coin_inserted' && (
                <div key={sparkKey} className="absolute top-14 z-40 pointer-events-none">
                  <motion.div
                    initial={{ scale: 0.4, opacity: 1 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-yellow-300 bg-yellow-400/30 blur-sm flex items-center justify-center">
                      <PixelSparklesIcon size={22} color="#fef08a" />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Status Indicator Screen under slot */}
              <div className="w-full mt-2 px-3 py-1.5 bg-black border border-slate-800 flex items-center justify-between text-[10px] font-mono font-black z-40">
                <span className="text-slate-400 uppercase">{t('STATUS:')}</span>
                <span
                  className={
                    animPhase === 'power_light'
                      ? 'text-emerald-400 animate-pulse'
                      : animPhase === 'coin_inserted'
                      ? 'text-yellow-300'
                      : 'text-amber-400'
                  }
                >
                  {animPhase === 'darken_slot' && t('AWAITING COIN')}
                  {animPhase === 'coin_drop' && t('ENTERING SLOT...')}
                  {animPhase === 'coin_inserted' && t('COIN INSERTED • 1 CREDIT')}
                  {animPhase === 'power_light' && t('⚡ LAUNCHING CAREER')}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Surge Lighting Effect */}
          <div className="relative z-10 pt-2 border-t border-emerald-500/30 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 font-bold uppercase tracking-wider">
              {animPhase === 'power_light' ? t('POWER LEVEL: MAXIMUM (32-BIT)') : t('ARCADE COIN MECHANISM')}
            </span>
            <span className="text-slate-400 font-mono">
              {animPhase === 'power_light' ? '⚡ 100%' : '🪙 READY'}
            </span>
          </div>

          {/* Full-Screen Illumination Surge on Power Light */}
          {animPhase === 'power_light' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.85, 0.4] }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-gradient-to-t from-emerald-500/30 via-emerald-400/20 to-transparent pointer-events-none"
            />
          )}
        </div>
      )}
    </div>
  );
};
