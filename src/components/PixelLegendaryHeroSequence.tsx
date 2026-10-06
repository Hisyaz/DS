import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Crown, Zap, Sparkles, Award } from 'lucide-react';
import { CustomCard } from '../types';
import { StoreCollection, getCardOwnedCount, getNewCardCount } from '../utils/storeCollectionSystem';
import { audioManager } from '../utils/audioSystem';
import confetti from 'canvas-confetti';
import { shouldDisableAnimations, shouldDisableParticles } from '../utils/graphicSettingsSystem';

const triggerConfetti = (opts?: any) => {
  if (shouldDisableParticles()) return;
  try {
    if (typeof confetti === 'function') {
      confetti(opts);
    } else if ((confetti as any)?.default && typeof (confetti as any).default === 'function') {
      (confetti as any).default(opts);
    }
  } catch {}
};

interface PixelLegendaryHeroCardProps {
  card: CustomCard;
  onProceed: () => void;
  remainingCount: number;
  collection: StoreCollection;
}

/**
 * 32-BIT LEGENDARY HERO MOMENT CARD
 * Golden royal presentation with sweeping sheen, crown emblems, and stat badges
 */
export const PixelLegendaryHeroCard: React.FC<PixelLegendaryHeroCardProps> = ({
  card,
  onProceed,
  remainingCount,
  collection,
}) => {
  const ownedTotal = getCardOwnedCount(card.id, collection);
  const newCopiesCount = getNewCardCount(card.id);

  useEffect(() => {
    // Auto-advance after 4.5 seconds if untouched
    const autoTimer = window.setTimeout(() => {
      onProceed();
    }, 4500);
    return () => window.clearTimeout(autoTimer);
  }, [onProceed]);

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="flex flex-col items-center justify-center relative select-none w-full max-w-sm sm:max-w-md px-2"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 32-Bit Golden Ambient Aura */}
      <div className="absolute -inset-4 rounded-3xl bg-amber-400/25 blur-2xl pointer-events-none animate-pulse" />

      {/* Orbiting Golden Pixel Stars */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
        className="absolute w-80 sm:w-96 h-80 sm:h-96 pointer-events-none"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-amber-300 shadow-[0_0_0_2px_#020617,0_0_10px_#f59e0b]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-yellow-100 shadow-[0_0_0_2px_#020617,0_0_10px_#ffffff]" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-200 shadow-[0_0_0_2px_#020617]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 shadow-[0_0_0_2px_#020617]" />
      </motion.div>

      {/* Hero Header Banner */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-3 px-4 py-1.5 rounded-lg bg-slate-950 border-2 border-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.8)] flex items-center gap-2 z-20"
      >
        <Crown className="w-4 h-4 text-amber-300 animate-bounce" />
        <span className="font-mono text-xs sm:text-sm font-black text-amber-200 tracking-wider uppercase">
          👑 LEGENDARY REVEAL 👑
        </span>
        <Crown className="w-4 h-4 text-amber-300 animate-bounce" />
      </motion.div>

      {/* Massive 32-Bit Centered Legendary Card */}
      <div
        className="w-72 sm:w-84 md:w-96 min-h-[460px] sm:min-h-[510px] rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative border-4 border-amber-400 shadow-[0_0_0_3px_#451a03,0_0_30px_rgba(251,191,36,0.9)] overflow-hidden z-10"
        style={{
          background: 'linear-gradient(180deg, #451a03 0%, #78350f 45%, #1c0a00 100%)',
        }}
      >
        {/* 32-Bit Diagonal Pixel Shine Sweep Loop */}
        <motion.div
          animate={{ x: [-200, 450] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', repeatDelay: 0.7 }}
          className="absolute -inset-y-10 w-24 bg-gradient-to-r from-transparent via-amber-200/35 to-transparent skew-x-12 pointer-events-none"
        />

        {/* 4 Stepped Corner Brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-amber-200 shadow-[0_0_0_2px_#020617]" />
        <div className="absolute top-2 right-2 w-3 h-3 bg-amber-200 shadow-[0_0_0_2px_#020617]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-amber-200 shadow-[0_0_0_2px_#020617]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-amber-200 shadow-[0_0_0_2px_#020617]" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between border-b-2 border-amber-400/60 pb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/90 border border-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.5)]">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-mono text-[11px] font-black tracking-widest text-amber-300 uppercase">
              LEGENDARY TIER
            </span>
          </div>

          <div className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400 font-mono text-[10px] font-black text-amber-200 tracking-wider">
            {card.category.toUpperCase()}
          </div>
        </div>

        {/* Center Card Graphic */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center space-y-3 py-2">
          {/* 32-Bit Pixel Crown Icon Container */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-700 p-1 border-3 border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.8)] flex items-center justify-center relative">
            <div className="w-full h-full bg-slate-950/80 rounded-xl flex items-center justify-center relative overflow-hidden">
              <span className="text-5xl sm:text-6xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] select-none">
                👑
              </span>
            </div>
          </div>

          {/* Card Name */}
          <div className="space-y-1">
            <h3 className="font-mono text-xl sm:text-2xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {card.name}
            </h3>
            <p className="font-mono text-xs sm:text-sm text-amber-100/90 max-w-[280px] line-clamp-3 leading-relaxed">
              {card.description}
            </p>
          </div>

          {/* Modifier List if applicable */}
          {card.modifiers && Object.keys(card.modifiers).length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[280px] pt-1">
              {Object.entries(card.modifiers).map(([stat, val]) => {
                const num = Number(val);
                return (
                  <span
                    key={stat}
                    className="px-2 py-0.5 rounded bg-amber-950/90 border border-amber-400/80 text-amber-200 font-mono text-[10px] font-black shadow-sm"
                  >
                    {stat.toUpperCase()} {num > 0 ? `+${num}` : num}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Status & Ownership */}
        <div className="relative z-10 pt-2 border-t-2 border-amber-400/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-mono text-[11px] font-bold text-amber-200">
              {newCopiesCount > 0 ? '✨ NEW LEGENDARY!' : `OWNED: ${ownedTotal}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
            <span className="font-mono text-[10px] font-black text-amber-300 uppercase">
              STORE VAULT
            </span>
          </div>
        </div>
      </div>

      {/* Action Proceed Button */}
      <div className="mt-4 flex flex-col items-center gap-1.5 z-20">
        <button
          type="button"
          onClick={onProceed}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-white hover:to-amber-300 text-slate-950 font-mono text-sm sm:text-base font-black uppercase tracking-wider shadow-[0_0_0_3px_#020617,0_0_22px_rgba(251,191,36,0.9)] cursor-pointer active:scale-95 transition-all"
        >
          {remainingCount > 0
            ? `CONTINUE (${remainingCount} MORE HIGH TIER)`
            : 'CLAIM LEGENDARY CARD ➔'}
        </button>
        <span className="font-mono text-[10px] text-amber-300/80 uppercase">
          [ TAP OR WAIT TO CLAIM ]
        </span>
      </div>
    </motion.div>
  );
};

interface PixelLegendarySuspenseAndRevealProps {
  card: CustomCard;
  isFirst: boolean;
  onRevealComplete: () => void;
}

/**
 * 32-BIT LEGENDARY SUSPENSE & REVEAL SPECTACLE
 *
 * Sequence:
 * ROYAL DARK SCREEN
 * → golden embers pulse
 * → expanding sunburst/crown star
 * → golden fanfare flash & explosion
 * → Legendary card manifests with spring physics
 */
export const PixelLegendarySuspenseAndReveal: React.FC<PixelLegendarySuspenseAndRevealProps> = ({
  card,
  isFirst,
  onRevealComplete,
}) => {
  const [subStage, setSubStage] = useState<
    'dark_screen' | 'light_pulses' | 'expanding_shine' | 'powerful_flash' | 'card_emergence'
  >('dark_screen');

  useEffect(() => {
    if (shouldDisableAnimations()) {
      audioManager.playLegendaryFlashSound();
      onRevealComplete();
      return;
    }

    // 1. Play legendary suspense sound
    audioManager.playLegendarySuspenseSound();

    const tPulses = isFirst ? 500 : 250;
    const tShine = isFirst ? 1000 : 500;
    const tFlash = isFirst ? 1400 : 750;
    const tCard = isFirst ? 1650 : 950;
    const tComplete = isFirst ? 2450 : 1550;

    const timer1 = window.setTimeout(() => setSubStage('light_pulses'), tPulses);
    const timer2 = window.setTimeout(() => setSubStage('expanding_shine'), tShine);
    const timer3 = window.setTimeout(() => {
      setSubStage('powerful_flash');
      audioManager.playLegendaryFlashSound();
      triggerConfetti({
        particleCount: isFirst ? 85 : 55,
        spread: 75,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff'],
      });
    }, tFlash);

    const timer4 = window.setTimeout(() => setSubStage('card_emergence'), tCard);
    const timer5 = window.setTimeout(() => onRevealComplete(), tComplete);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(timer3);
      window.clearTimeout(timer4);
      window.clearTimeout(timer5);
    };
  }, [isFirst, onRevealComplete]);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#080501] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 32-Bit Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 z-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.6) 50%), linear-gradient(90deg, rgba(251, 191, 36, 0.05), rgba(0, 0, 0, 0), rgba(251, 191, 36, 0.05))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />

      {/* Floating Golden Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: isFirst ? 22 : 14 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: (Math.random() - 0.5) * 360,
              y: 220,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              y: -240,
              opacity: [0, 1, 0],
              scale: 1,
            }}
            transition={{
              repeat: Infinity,
              duration: 2 + (i % 3) * 0.5,
              delay: i * 0.1,
              ease: 'easeOut',
            }}
            className="absolute left-1/2 bottom-1/4 w-2.5 h-2.5 bg-amber-300 shadow-[0_0_0_1px_#020617,0_0_8px_#fbbf24]"
          />
        ))}
      </div>

      {/* SUB-STAGE 2: Stepped Light Pulses (Golden Crown Box) */}
      {(subStage === 'light_pulses' || subStage === 'expanding_shine') && (
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 0.35, ease: 'linear' }}
          className="absolute w-24 h-24 sm:w-32 sm:h-32 border-4 border-amber-400 shadow-[0_0_28px_#f59e0b] flex items-center justify-center bg-amber-950/30"
        >
          <div className="w-12 h-12 bg-amber-300 border-2 border-white shadow-[0_0_12px_#ffffff] flex items-center justify-center">
            <span className="text-xl">👑</span>
          </div>
        </motion.div>
      )}

      {/* SUB-STAGE 3: Expanding 32-Bit Pixel Sunburst Star */}
      {subStage === 'expanding_shine' && (
        <motion.div
          initial={{ scale: 0.2, rotate: 0, opacity: 0 }}
          animate={{ scale: 2.2, rotate: 45, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute w-64 h-64 flex items-center justify-center"
        >
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
            <polygon points="32,2 38,26 62,32 38,38 32,62 26,38 2,32 26,26" fill="#fbbf24" opacity="0.85" />
            <polygon points="32,10 36,28 54,32 36,36 32,54 28,36 10,32 28,28" fill="#ffffff" />
          </svg>
        </motion.div>
      )}

      {/* SUB-STAGE 4: Powerful 32-Bit Stepped Screen Flash */}
      {subStage === 'powerful_flash' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.4, 1, 0] }}
          transition={{ duration: 0.28, times: [0, 0.3, 0.6, 1] }}
          className="absolute inset-0 bg-amber-200 z-40"
        />
      )}

      {/* SUB-STAGE 5: Legendary Card Manifestation */}
      {subStage === 'card_emergence' && (
        <motion.div
          initial={{
            scale: 0.2,
            y: 80,
            rotate: isFirst ? 5 : -5,
            opacity: 0.6,
          }}
          animate={{
            scale: 1,
            y: 0,
            rotate: 0,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 240,
            damping: 18,
          }}
          className="z-30 w-72 sm:w-84 md:w-96 min-h-[460px] rounded-2xl p-4 border-4 border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.9)] flex flex-col justify-between"
          style={{
            background: 'linear-gradient(180deg, #451a03 0%, #78350f 45%, #1c0a00 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-amber-200 font-black">👑 LEGENDARY REVEAL</span>
            <span className="w-3 h-3 bg-amber-300 animate-ping" />
          </div>
          <div className="text-center my-auto space-y-2">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-950 border-2 border-amber-300 flex items-center justify-center shadow-lg">
              <span className="text-4xl">👑</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-mono text-white uppercase">
              {card.name}
            </h3>
            <p className="text-xs text-amber-200 line-clamp-2">
              {card.description}
            </p>
          </div>
          <div className="text-center font-mono text-xs font-black text-amber-300 animate-pulse">
            ★ LEGENDARY POWER CONFIRMED ★
          </div>
        </motion.div>
      )}

      {/* Suspense Notification */}
      <div className="absolute bottom-10 z-30 font-mono text-xs font-black tracking-widest text-amber-400 uppercase animate-pulse">
        {subStage === 'dark_screen' && '✦ ROYAL SIGNAL DETECTED ✦'}
        {subStage === 'light_pulses' && '✦ GOLDEN FREQUENCY PEAKING ✦'}
        {subStage === 'expanding_shine' && '✦ LEGENDARY CONVERGENCE ✦'}
        {subStage === 'card_emergence' && '✦ LEGENDARY CARD UNLOCKED ✦'}
      </div>
    </div>
  );
};
