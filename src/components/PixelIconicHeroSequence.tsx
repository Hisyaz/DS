import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Award, Zap } from 'lucide-react';
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

interface PixelIconicHeroCardProps {
  card: CustomCard;
  onProceed: () => void;
  remainingCount: number;
  collection: StoreCollection;
}

/**
 * 32-BIT ICONIC HERO MOMENT CARD
 * Occupies most of the screen, centered, with shimmering pixel-art shine loop
 */
export const PixelIconicHeroCard: React.FC<PixelIconicHeroCardProps> = ({
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
      {/* 32-Bit Prismatic Cyan Aura / Radial Ambient Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-cyan-400/20 blur-2xl pointer-events-none animate-pulse" />

      {/* Orbiting 32-Bit Pixel Stars */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
        className="absolute w-80 sm:w-96 h-80 sm:h-96 pointer-events-none"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-300 shadow-[0_0_0_2px_#020617,0_0_8px_#22d3ee]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white shadow-[0_0_0_2px_#020617,0_0_8px_#ffffff]" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyan-200 shadow-[0_0_0_2px_#020617]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_0_2px_#020617]" />
      </motion.div>

      {/* Hero Header Banner */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-3 px-4 py-1.5 rounded-lg bg-slate-900 border-2 border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.7)] flex items-center gap-2 z-20"
      >
        <span className="w-2.5 h-2.5 bg-cyan-300 animate-ping" />
        <span className="font-mono text-xs sm:text-sm font-black text-cyan-200 tracking-wider uppercase">
          💎 ICONIC HERO REVEAL 💎
        </span>
        <span className="w-2.5 h-2.5 bg-cyan-300 animate-ping" />
      </motion.div>

      {/* Massive 32-Bit Centered Iconic Card */}
      <div
        className="w-72 sm:w-84 md:w-96 min-h-[460px] sm:min-h-[510px] rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative border-4 border-cyan-400 shadow-[0_0_0_3px_#021d28,0_0_28px_rgba(34,211,238,0.85)] overflow-hidden z-10"
        style={{
          background: 'linear-gradient(180deg, #083344 0%, #0e7490 45%, #041c26 100%)',
        }}
      >
        {/* 32-Bit Diagonal Pixel Shine Sweep Loop */}
        <motion.div
          animate={{ x: [-200, 450] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', repeatDelay: 0.8 }}
          className="absolute -inset-y-10 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
        />

        {/* 4 Stepped Diamond Corner Brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-200 shadow-[0_0_0_2px_#020617]" />
        <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-200 shadow-[0_0_0_2px_#020617]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-cyan-200 shadow-[0_0_0_2px_#020617]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-cyan-200 shadow-[0_0_0_2px_#020617]" />

        {/* Top Tier Badge */}
        <div className="flex items-center justify-between z-10">
          <div className="px-3 py-1 rounded bg-cyan-950/90 border-2 border-cyan-300 font-mono text-[10px] sm:text-xs font-black text-cyan-200 flex items-center gap-1.5 shadow-sm">
            <span>💎</span>
            <span>ICONIC DIAMOND • STAT BREAK</span>
          </div>
          <span className="font-mono text-[10px] text-cyan-300 font-black uppercase">
            #32-BIT
          </span>
        </div>

        {/* Card Header & Artwork Frame */}
        <div className="space-y-3 text-center my-auto z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-cyan-950/80 border-3 border-cyan-300 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] relative">
            {/* 32-Bit Center Diamond Star */}
            <svg viewBox="0 0 64 64" className="w-16 h-16 sm:w-20 sm:h-20" style={{ shapeRendering: 'crispEdges' }}>
              <polygon points="32,6 40,24 58,32 40,40 32,58 24,40 6,32 24,24" fill="#67e8f9" />
              <polygon points="32,14 37,27 50,32 37,37 32,50 27,37 14,32 27,27" fill="#ffffff" />
              <rect x="29" y="29" width="6" height="6" fill="#083344" />
              <rect x="30" y="30" width="4" height="4" fill="#a5f3fc" />
            </svg>
            <div className="absolute -bottom-2 px-2.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-mono text-[9px] font-black uppercase tracking-wider">
              {card.category}
            </div>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black font-mono text-white tracking-wide uppercase drop-shadow-md">
              {card.name}
            </h3>
            <p className="text-xs sm:text-sm text-cyan-200/90 mt-2 line-clamp-3 leading-relaxed font-sans px-2">
              {card.description || 'Rare Iconic 32-bit card with stat-breaking capabilities.'}
            </p>
          </div>

          {/* Guarantee / New Notice */}
          {newCopiesCount > 0 && (
            <div className="px-3 py-1 rounded-lg bg-yellow-400/20 border border-yellow-400/70 font-mono text-[11px] font-bold text-yellow-300 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>GUARANTEED DRAW ON NEXT {card.category.toUpperCase()} PICK</span>
            </div>
          )}

          {/* Modifiers Pill List */}
          {card.modifiers && card.modifiers.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {card.modifiers.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-400 font-mono text-[11px] font-black text-emerald-300"
                >
                  +{m.value} {m.target.toUpperCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Card Footer */}
        <div className="pt-2 border-t border-cyan-400/40 flex items-center justify-between text-xs font-mono z-10">
          <div className="flex items-center gap-1 text-cyan-200">
            <span>COPIES OWNED:</span>
            <span className="font-black text-white">x{ownedTotal}</span>
          </div>
          <span className="text-cyan-300 font-bold uppercase text-[10px]">
            ★ DRAWSTAR ICONIC ★
          </span>
        </div>
      </div>

      {/* Bottom Claim / Next Button */}
      <div className="mt-4 flex flex-col items-center gap-1.5 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onProceed();
          }}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-white hover:to-cyan-300 text-slate-950 font-mono text-sm sm:text-base font-black uppercase tracking-wider shadow-[0_0_0_3px_#020617,0_0_18px_rgba(34,211,238,0.8)] cursor-pointer active:scale-95 transition-all"
        >
          {remainingCount > 0
            ? `NEXT ICONIC CARD (${remainingCount} REMAINING) ➔`
            : 'CLAIM ICONIC CARD ➔'}
        </button>
        <span className="text-[10px] font-mono text-cyan-300/80 tracking-wider">
          [ TAP TO CONTINUE OR WAIT 4s ]
        </span>
      </div>
    </motion.div>
  );
};

interface PixelIconicSuspenseAndRevealProps {
  card: CustomCard;
  isFirst: boolean;
  onRevealComplete: () => void;
}

/**
 * 32-BIT ICONIC SUSPENSE & REVEAL SPECTACLE
 *
 * Sequence:
 * DARK SCREEN
 * → subtle particles
 * → small light pulses
 * → increasing pixel-art brightness
 * → expanding pixel-art shine
 * → powerful flash
 * → Iconic card appears
 * → card moves toward player
 * → full reveal
 */
export const PixelIconicSuspenseAndReveal: React.FC<PixelIconicSuspenseAndRevealProps> = ({
  card,
  isFirst,
  onRevealComplete,
}) => {
  // Reveal sub-stages
  const [subStage, setSubStage] = useState<
    'dark_screen' | 'light_pulses' | 'expanding_shine' | 'powerful_flash' | 'card_emergence'
  >('dark_screen');

  useEffect(() => {
    if (shouldDisableAnimations()) {
      audioManager.playIconicFlashSound();
      onRevealComplete();
      return;
    }

    // 1. Play suspense sound
    audioManager.playIconicSuspenseSound();

    // Timing adjustments for first vs subsequent iconics
    const tPulses = isFirst ? 600 : 300;
    const tShine = isFirst ? 1100 : 550;
    const tFlash = isFirst ? 1500 : 800;
    const tCard = isFirst ? 1750 : 1000;
    const tComplete = isFirst ? 2600 : 1600;

    const timer1 = window.setTimeout(() => setSubStage('light_pulses'), tPulses);
    const timer2 = window.setTimeout(() => setSubStage('expanding_shine'), tShine);
    const timer3 = window.setTimeout(() => {
      setSubStage('powerful_flash');
      audioManager.playIconicFlashSound();
      triggerConfetti({
        particleCount: isFirst ? 90 : 60,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#22d3ee', '#ffffff', '#38bdf8', '#06b6d4', '#a5f3fc'],
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
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 32-Bit Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 z-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.6) 50%), linear-gradient(90deg, rgba(34, 211, 238, 0.05), rgba(0, 0, 0, 0), rgba(34, 211, 238, 0.05))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />

      {/* Subtle Floating Cyan Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: isFirst ? 24 : 16 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: (Math.random() - 0.5) * 360,
              y: 200,
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              y: -240,
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.6],
            }}
            transition={{
              repeat: Infinity,
              duration: 2 + (i % 3) * 0.6,
              delay: (i * 0.12),
              ease: 'easeOut',
            }}
            className="absolute left-1/2 bottom-1/4 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cyan-300 shadow-[0_0_0_1px_#020617,0_0_6px_#22d3ee]"
          />
        ))}
      </div>

      {/* SUB-STAGE 2: Stepped Light Pulses */}
      {(subStage === 'light_pulses' || subStage === 'expanding_shine') && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.4, ease: 'linear' }}
          className="absolute w-24 h-24 sm:w-32 sm:h-32 border-4 border-cyan-400 shadow-[0_0_24px_#22d3ee] flex items-center justify-center"
        >
          <div className="w-12 h-12 bg-cyan-300 border-2 border-white shadow-[0_0_12px_#ffffff]" />
        </motion.div>
      )}

      {/* SUB-STAGE 3: Expanding 32-Bit Pixel Shine Starburst */}
      {subStage === 'expanding_shine' && (
        <motion.div
          initial={{ scale: 0.2, rotate: 0, opacity: 0 }}
          animate={{ scale: 2.2, rotate: 90, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute w-64 h-64 flex items-center justify-center"
        >
          <svg viewBox="0 0 64 64" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
            <polygon points="32,2 38,26 62,32 38,38 32,62 26,38 2,32 26,26" fill="#22d3ee" opacity="0.8" />
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
          className="absolute inset-0 bg-cyan-200 z-40"
        />
      )}

      {/* SUB-STAGE 5: Iconic Card Emergence & Scale Toward Player */}
      {subStage === 'card_emergence' && (
        <motion.div
          initial={{
            scale: 0.2,
            y: 80,
            rotate: isFirst ? -6 : 8,
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
          className="z-30 w-72 sm:w-84 md:w-96 min-h-[460px] rounded-2xl p-4 border-4 border-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.9)] flex flex-col justify-between"
          style={{
            background: 'linear-gradient(180deg, #083344 0%, #0e7490 45%, #041c26 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-cyan-200 font-black">💎 ICONIC REVEAL</span>
            <span className="w-3 h-3 bg-cyan-300 animate-ping" />
          </div>
          <div className="text-center my-auto space-y-2">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-950 border-2 border-cyan-300 flex items-center justify-center">
              <span className="text-4xl">💎</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-mono text-white uppercase">
              {card.name}
            </h3>
            <p className="text-xs text-cyan-200 line-clamp-2">
              {card.description}
            </p>
          </div>
          <div className="text-center font-mono text-xs font-black text-cyan-300 animate-pulse">
            ⚡ RARITY CONFIRMED ⚡
          </div>
        </motion.div>
      )}

      {/* Suspense Typography Notification */}
      <div className="absolute bottom-10 z-30 font-mono text-xs font-black tracking-widest text-cyan-400 uppercase animate-pulse">
        {subStage === 'dark_screen' && '✦ CELESTIAL DISTORTION DETECTED ✦'}
        {subStage === 'light_pulses' && '✦ RESONANCE ESCALATING ✦'}
        {subStage === 'expanding_shine' && '✦ MAXIMUM RARITY BREACH ✦'}
        {subStage === 'card_emergence' && '✦ ICONIC CARD MANIFESTING ✦'}
      </div>
    </div>
  );
};

interface PixelGodPackSequenceProps {
  cards: CustomCard[];
  onProceed: () => void;
}

/**
 * 32-BIT GOD PACK SPECIAL SEQUENCE (All 5 cards are Iconic)
 * Skips normal rarity preview and triggers celestial 5-crystal resonance!
 */
export const PixelGodPackSequence: React.FC<PixelGodPackSequenceProps> = ({
  cards,
  onProceed,
}) => {
  useEffect(() => {
    audioManager.playIconicSuspenseSound();
    const flashTimer = window.setTimeout(() => {
      audioManager.playIconicFlashSound();
      triggerConfetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#22d3ee', '#ffffff', '#38bdf8', '#fbbf24', '#a5f3fc'],
      });
    }, 1000);
    return () => window.clearTimeout(flashTimer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-4 sm:p-6 select-none overflow-hidden"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 z-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.6) 50%), linear-gradient(90deg, rgba(34, 211, 238, 0.05), rgba(0, 0, 0, 0), rgba(34, 211, 238, 0.05))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />

      {/* Header Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mt-4 px-6 py-2 rounded-xl bg-slate-900 border-2 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.8)] text-center z-20"
      >
        <h2 className="font-mono text-base sm:text-xl font-black text-cyan-300 uppercase tracking-widest flex items-center justify-center gap-2">
          <span>★</span>
          <span>ALL-ICONIC GOD PACK EVENT</span>
          <span>★</span>
        </h2>
        <p className="font-mono text-[11px] text-cyan-100/80 mt-0.5 font-bold">
          5 OUT OF 5 CARDS ARE STAT-BREAKING ICONICS!
        </p>
      </motion.div>

      {/* 5 Cards Fan Showcase */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl w-full z-20 my-auto">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.3, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ delay: 0.6 + idx * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
            className="p-3 rounded-xl border-2 border-cyan-400 bg-gradient-to-b from-cyan-950 via-slate-900 to-black flex flex-col justify-between min-h-[220px] shadow-[0_0_15px_rgba(34,211,238,0.5)]"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 font-bold">
              <span>💎 ICONIC</span>
              <span>#{idx + 1}</span>
            </div>
            <div className="text-center my-2">
              <span className="text-2xl">💎</span>
              <h4 className="font-mono font-black text-white text-xs sm:text-sm uppercase mt-1">
                {card.name}
              </h4>
              <p className="text-[10px] text-cyan-200 line-clamp-2 mt-1">
                {card.description}
              </p>
            </div>
            <div className="text-center text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/80 rounded py-0.5 border border-cyan-400/40">
              {card.category.toUpperCase()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Proceed Button */}
      <div className="mb-4 z-20 flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onProceed}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 hover:from-white hover:to-cyan-300 text-slate-950 font-mono text-sm sm:text-base font-black uppercase tracking-wider shadow-[0_0_0_3px_#020617,0_0_20px_rgba(34,211,238,0.9)] cursor-pointer active:scale-95 transition-all"
        >
          PROCEED TO CARD INTERFACE ➔
        </button>
        <span className="text-[10px] font-mono text-cyan-300/80">
          [ ALL 5 ICONICS UNLOCKED ]
        </span>
      </div>
    </div>
  );
};
