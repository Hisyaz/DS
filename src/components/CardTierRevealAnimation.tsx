import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardSubclass } from './CardVisualRenderer';
import { shouldDisableAnimations, shouldDisableParticles } from '../utils/graphicSettingsSystem';

export interface CardTierRevealAnimationProps {
  tierName?: string;
  subclass?: CardSubclass;
  isIconic?: boolean;
  isStatBreak?: boolean;
  triggerKey?: string | number;
  className?: string;
}

export const CardTierRevealAnimation: React.FC<CardTierRevealAnimationProps> = ({
  tierName = 'Bronze',
  subclass = 'development',
  isIconic = false,
  isStatBreak = false,
  triggerKey,
  className = '',
}) => {
  if (shouldDisableAnimations() || shouldDisableParticles()) {
    return null;
  }

  const [active, setActive] = useState<boolean>(true);

  // Normalize tier name
  const rawTier = (tierName || '').toLowerCase().replace(/_/g, ' ');

  // Determine the exact animation archetype
  const animType = useMemo(() => {
    if (isIconic || isStatBreak || rawTier === 'iconic' || rawTier.includes('stat break')) {
      return 'iconic';
    }

    if (subclass === 'setback') {
      if (rawTier.includes('disaster') || rawTier.includes('tier 4') || rawTier.includes('legendary') || rawTier === 'goat') {
        return 'disaster';
      }
      if (rawTier.includes('ash') || rawTier.includes('tier 3') || rawTier.includes('gold') || rawTier === 'epic') {
        return 'ash';
      }
      if (rawTier.includes('rust') || rawTier.includes('tier 2') || rawTier.includes('silver') || rawTier === 'rare') {
        return 'rust';
      }
      return 'scrap';
    }

    if (subclass === 'double_edged') {
      if (rawTier.includes('muramasa') || rawTier.includes('tier 4') || rawTier.includes('legendary') || rawTier === 'goat') {
        return 'muramasa';
      }
      if (rawTier.includes('steel') || rawTier.includes('sword') || rawTier.includes('tier 3') || rawTier.includes('gold') || rawTier === 'epic') {
        return 'steel_blade';
      }
      if (rawTier.includes('copper') || rawTier.includes('dagger') || rawTier.includes('knife') || rawTier.includes('tier 2') || rawTier.includes('silver') || rawTier === 'rare') {
        return 'copper_dagger';
      }
      return 'obsidian_knife';
    }

    // Default: Positive / Development & Parent
    if (rawTier.includes('legendary') || rawTier.includes('tier 4') || rawTier === 'goat') {
      return 'legendary';
    }
    if (rawTier.includes('gold') || rawTier.includes('tier 3') || rawTier === 'epic') {
      return 'gold';
    }
    if (rawTier.includes('silver') || rawTier.includes('tier 2') || rawTier === 'rare') {
      return 'silver';
    }
    return 'bronze';
  }, [subclass, rawTier, isIconic, isStatBreak]);

  // Duration in milliseconds (Universal Rule: Max 3s for standard, 5.5s for Iconic)
  const durationMs = useMemo(() => {
    switch (animType) {
      case 'iconic':
        return 5500; // 5.5s Iconic exception
      case 'legendary':
      case 'disaster':
      case 'muramasa':
        return 2800; // ~2.8s
      case 'gold':
      case 'ash':
      case 'steel_blade':
        return 2200; // ~2.2s
      case 'silver':
      case 'rust':
      case 'copper_dagger':
        return 1800; // ~1.8s
      case 'bronze':
      case 'scrap':
      case 'obsidian_knife':
      default:
        return 1500; // ~1.5s
    }
  }, [animType]);

  // Re-trigger animation when triggerKey or animType changes
  useEffect(() => {
    setActive(true);
    const timer = setTimeout(() => {
      // For iconic, we gracefully fade the intense reveal effects after 5.5s
      setActive(false);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [triggerKey, animType, durationMs]);

  if (!active) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-30 select-none ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {/* ========================================================================= */}
        {/* 🥉 1. BRONZE REVEAL (Metallic copper/brown bronze shimmer & sweep) */}
        {/* ========================================================================= */}
        {animType === 'bronze' && (
          <motion.div
            key={`bronze-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Metallic Copper/Bronze Diagonal Light Sweep */}
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: [0, 0.85, 0.85, 0] }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-[#b87333]/40 via-[#e69c5e]/30 to-transparent transform -skew-x-12"
            />

            {/* Bronze Surface Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.45, 0] }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute inset-0 bg-[#8c4820]/15 mix-blend-screen"
            />

            {/* Copper/Bronze Sparkle Dots */}
            {[
              { top: '25%', left: '30%', delay: 0.2 },
              { top: '65%', left: '70%', delay: 0.4 },
              { top: '40%', left: '80%', delay: 0.6 },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 0], opacity: [0, 0.9, 0] }}
                transition={{ duration: 0.7, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className="absolute w-1.5 h-1.5 rounded-full bg-[#e69c5e] shadow-[0_0_8px_rgba(184,115,51,0.9)]"
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 🥈 2. SILVER REVEAL (Soft metallic silver light sweep, reflective sheen) */}
        {/* ========================================================================= */}
        {animType === 'silver' && (
          <motion.div
            key={`silver-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Metallic Silver Light Sweep */}
            <motion.div
              initial={{ x: '-130%', opacity: 0 }}
              animate={{ x: '240%', opacity: [0, 0.85, 0.85, 0] }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-40 bg-gradient-to-r from-transparent via-slate-100/35 to-transparent transform -skew-x-15"
            />

            {/* Edge Metallic Gleam */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
              className="absolute inset-0 border border-slate-200/50 rounded-2xl shadow-[inset_0_0_15px_rgba(226,232,240,0.25)]"
            />

            {/* Silver Twinkles */}
            {[
              { top: '20%', left: '20%', delay: 0.15 },
              { top: '35%', left: '75%', delay: 0.35 },
              { top: '70%', left: '35%', delay: 0.55 },
              { top: '80%', left: '80%', delay: 0.75 },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ scale: [0, 1.4, 0], opacity: [0, 0.9, 0], rotate: 90 }}
                transition={{ duration: 0.8, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className="absolute w-2 h-2 flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 🥇 3. GOLD REVEAL (Brighter metallic shine, distinct golden sweep, ember burst) */}
        {/* ========================================================================= */}
        {animType === 'gold' && (
          <motion.div
            key={`gold-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Dual Golden Diagonal Beams */}
            <motion.div
              initial={{ x: '-140%', opacity: 0 }}
              animate={{ x: '260%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-48 bg-gradient-to-r from-transparent via-amber-300/40 via-yellow-200/60 to-transparent transform -skew-x-20"
            />

            {/* Golden Frame Pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.98, 1, 0.99] }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              className="absolute inset-0 border-2 border-yellow-300 rounded-2xl shadow-[0_0_25px_rgba(250,204,21,0.6),inset_0_0_20px_rgba(250,204,21,0.3)]"
            />

            {/* Golden Sparkles / Embers */}
            {[
              { top: '15%', left: '25%', delay: 0.1, size: 'w-2 h-2' },
              { top: '25%', left: '80%', delay: 0.25, size: 'w-2.5 h-2.5' },
              { top: '50%', left: '15%', delay: 0.4, size: 'w-2 h-2' },
              { top: '65%', left: '85%', delay: 0.55, size: 'w-3 h-3' },
              { top: '80%', left: '30%', delay: 0.7, size: 'w-2 h-2' },
              { top: '40%', left: '60%', delay: 0.85, size: 'w-2.5 h-2.5' },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], y: -12 }}
                transition={{ duration: 0.9, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className={`absolute ${pt.size} rounded-full bg-gradient-to-r from-yellow-200 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,1)]`}
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 👑 4. LEGENDARY REVEAL (Cinematic golden-amber radiant flares, energy surge) */}
        {/* ========================================================================= */}
        {animType === 'legendary' && (
          <motion.div
            key={`legendary-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Center Golden Light Burst Flare */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 1.5, 1.2], opacity: [0, 0.7, 0] }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-radial from-amber-300/60 via-yellow-500/25 to-transparent blur-xl"
            />

            {/* Crossing Double Light Sweeps */}
            <motion.div
              initial={{ x: '-150%', opacity: 0 }}
              animate={{ x: '260%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-56 bg-gradient-to-r from-transparent via-amber-300/50 via-yellow-100/70 to-transparent transform -skew-x-25"
            />
            <motion.div
              initial={{ x: '260%', opacity: 0 }}
              animate={{ x: '-150%', opacity: [0, 0.7, 0.7, 0] }}
              transition={{ duration: 1.6, delay: 0.2, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent transform skew-x-20"
            />

            {/* Glowing Golden Rim Energy Surge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.6, 0] }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
              className="absolute inset-0 border-[3px] border-amber-400 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.8),inset_0_0_25px_rgba(245,158,11,0.4)]"
            />

            {/* Floating Golden Embers Stream */}
            {[
              { top: '15%', left: '20%', delay: 0.05, dx: 10, dy: -25 },
              { top: '30%', left: '80%', delay: 0.2, dx: -15, dy: -30 },
              { top: '45%', left: '15%', delay: 0.35, dx: 12, dy: -35 },
              { top: '60%', left: '85%', delay: 0.5, dx: -10, dy: -28 },
              { top: '75%', left: '25%', delay: 0.65, dx: 14, dy: -32 },
              { top: '85%', left: '75%', delay: 0.8, dx: -12, dy: -30 },
              { top: '20%', left: '50%', delay: 0.95, dx: 5, dy: -35 },
              { top: '70%', left: '55%', delay: 1.1, dx: -8, dy: -30 },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0], x: pt.dx, y: pt.dy }}
                transition={{ duration: 1.3, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 shadow-[0_0_14px_rgba(250,204,21,1)]"
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* ⭐/🌟 5. ICONIC & STAT BREAK REVEAL (5+ Seconds Spectacular Masterpiece) */}
        {/* ========================================================================= */}
        {animType === 'iconic' && (
          <motion.div
            key={`iconic-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Celestial Rotating Background Energy Rays */}
            <motion.div
              initial={{ rotate: 0, scale: 0.7, opacity: 0 }}
              animate={{ rotate: 360, scale: [0.7, 1.3, 1.1], opacity: [0, 0.45, 0.35, 0] }}
              transition={{ duration: 5.2, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none opacity-40 bg-[conic-gradient(from_0deg,_#06b6d4_0deg,_#eab308_60deg,_transparent_90deg,_#06b6d4_180deg,_#f59e0b_240deg,_transparent_270deg,_#06b6d4_360deg)] blur-2xl"
            />

            {/* Central Celestial Radiance Core */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{
                scale: [0.2, 1.6, 1.3, 1.5, 0.9],
                opacity: [0, 0.9, 0.6, 0.75, 0],
              }}
              transition={{ duration: 5.0, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-radial from-cyan-300/60 via-amber-300/30 to-transparent blur-xl"
            />

            {/* Prismatic Sweeping Light Beams Passing Multiple Times */}
            <motion.div
              initial={{ x: '-160%', opacity: 0 }}
              animate={{
                x: ['-160%', '280%', '-160%', '280%'],
                opacity: [0, 1, 0, 1, 0],
              }}
              transition={{ duration: 4.8, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-64 bg-gradient-to-r from-transparent via-cyan-300/40 via-white/70 via-amber-300/40 to-transparent transform -skew-x-25"
            />

            {/* Pulsing Cyan-Gold Majestic Frame Surge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0.6, 1, 0.4, 0],
              }}
              transition={{ duration: 5.2, ease: 'easeInOut' }}
              className="absolute inset-0 border-2 border-cyan-300 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.9),inset_0_0_30px_rgba(250,204,21,0.5)]"
            />

            {/* Cosmic Stardust & Constellation Sparkle Field (16 Particles) */}
            {[
              { top: '10%', left: '15%', delay: 0.1, size: 'w-2.5 h-2.5', color: 'bg-cyan-200' },
              { top: '18%', left: '80%', delay: 0.3, size: 'w-3 h-3', color: 'bg-yellow-200' },
              { top: '32%', left: '25%', delay: 0.6, size: 'w-2 h-2', color: 'bg-white' },
              { top: '40%', left: '75%', delay: 0.9, size: 'w-3.5 h-3.5', color: 'bg-cyan-300' },
              { top: '55%', left: '15%', delay: 1.2, size: 'w-2.5 h-2.5', color: 'bg-amber-200' },
              { top: '65%', left: '85%', delay: 1.5, size: 'w-3 h-3', color: 'bg-white' },
              { top: '78%', left: '20%', delay: 1.8, size: 'w-2 h-2', color: 'bg-cyan-200' },
              { top: '85%', left: '70%', delay: 2.1, size: 'w-3.5 h-3.5', color: 'bg-yellow-300' },
              { top: '22%', left: '50%', delay: 2.4, size: 'w-2.5 h-2.5', color: 'bg-white' },
              { top: '70%', left: '45%', delay: 2.7, size: 'w-3 h-3', color: 'bg-cyan-100' },
              { top: '48%', left: '90%', delay: 3.0, size: 'w-2 h-2', color: 'bg-amber-300' },
              { top: '88%', left: '35%', delay: 3.3, size: 'w-2.5 h-2.5', color: 'bg-cyan-300' },
              { top: '12%', left: '65%', delay: 3.6, size: 'w-3 h-3', color: 'bg-white' },
              { top: '35%', left: '10%', delay: 3.9, size: 'w-2 h-2', color: 'bg-yellow-200' },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{
                  scale: [0, 1.8, 1, 1.6, 0],
                  opacity: [0, 1, 0.6, 1, 0],
                  y: [0, -18, -36],
                }}
                transition={{ duration: 2.2, delay: pt.delay, ease: 'easeInOut' }}
                style={{ top: pt.top, left: pt.left }}
                className={`absolute ${pt.size} rounded-full ${pt.color} shadow-[0_0_15px_rgba(6,182,212,1)]`}
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 🔴 6. SCRAP REVEAL (Setback Tier 1: Rough chipped reveal, friction sparks) */}
        {/* ========================================================================= */}
        {animType === 'scrap' && (
          <motion.div
            key={`scrap-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Rough Slate/Iron Light Sweep */}
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '220%', opacity: [0, 0.7, 0.7, 0] }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-slate-400/25 to-transparent transform -skew-x-12"
            />

            {/* Industrial Friction Flecks */}
            {[
              { top: '30%', left: '40%', delay: 0.15 },
              { top: '55%', left: '60%', delay: 0.35 },
              { top: '75%', left: '30%', delay: 0.55 },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{ scale: [0, 1.2, 0], opacity: [0, 0.8, 0], x: 8, y: 12 }}
                transition={{ duration: 0.6, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className="absolute w-1.5 h-1.5 rounded-sm bg-slate-300 shadow-[0_0_6px_rgba(203,213,225,0.7)]"
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* ⚙️ 7. RUST REVEAL (Setback Tier 2: Corroded grinding reveal, rust flakes) */}
        {/* ========================================================================= */}
        {animType === 'rust' && (
          <motion.div
            key={`rust-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Gritty Brown-Amber Sweep */}
            <motion.div
              initial={{ x: '-130%', opacity: 0 }}
              animate={{ x: '230%', opacity: [0, 0.75, 0.75, 0] }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-amber-900/40 via-stone-500/20 to-transparent transform -skew-x-15"
            />

            {/* Corroded Border Wear Pulse */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.65, 0] }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
              className="absolute inset-0 border-2 border-amber-800/60 rounded-2xl shadow-[inset_0_0_15px_rgba(120,53,15,0.4)]"
            />

            {/* Falling Rust Particles */}
            {[
              { top: '20%', left: '30%', delay: 0.1 },
              { top: '35%', left: '70%', delay: 0.25 },
              { top: '50%', left: '20%', delay: 0.4 },
              { top: '65%', left: '80%', delay: 0.55 },
              { top: '80%', left: '45%', delay: 0.7 },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ scale: [0, 1.4, 0], opacity: [0, 0.85, 0], y: 15 }}
                transition={{ duration: 0.8, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className="absolute w-2 h-2 rounded-full bg-amber-700 shadow-[0_0_6px_rgba(180,83,9,0.8)]"
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 🔥 8. ASH REVEAL (Setback Tier 3: Smoldering embers, burning fire crackle) */}
        {/* ========================================================================= */}
        {animType === 'ash' && (
          <motion.div
            key={`ash-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Fiery Crimson/Orange Sweep */}
            <motion.div
              initial={{ x: '-140%', opacity: 0 }}
              animate={{ x: '250%', opacity: [0, 0.9, 0.9, 0] }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-44 bg-gradient-to-r from-transparent via-red-600/40 via-orange-500/50 to-transparent transform -skew-x-20"
            />

            {/* Burning Heat Frame Pulse */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 1.7, ease: 'easeOut' }}
              className="absolute inset-0 border-2 border-red-600 rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.7),inset_0_0_20px_rgba(239,68,68,0.3)]"
            />

            {/* Rising Fire Embers (8 particles) */}
            {[
              { top: '80%', left: '20%', delay: 0.1, dy: -35 },
              { top: '75%', left: '75%', delay: 0.25, dy: -40 },
              { top: '65%', left: '35%', delay: 0.4, dy: -30 },
              { top: '85%', left: '50%', delay: 0.55, dy: -45 },
              { top: '55%', left: '80%', delay: 0.7, dy: -35 },
              { top: '70%', left: '15%', delay: 0.85, dy: -40 },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ scale: [0, 1.6, 0], opacity: [0, 1, 0], y: pt.dy }}
                transition={{ duration: 1.0, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-t from-red-600 to-amber-300 shadow-[0_0_12px_rgba(239,68,68,1)]"
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* ☠️ 9. DISASTER REVEAL (Setback Tier 4: Toxic alarm pulse, catastrophic glitch) */}
        {/* ========================================================================= */}
        {animType === 'disaster' && (
          <motion.div
            key={`disaster-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Alarm Danger Strobe (Flashing Crimson & Emerald) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0.2, 0.8, 0.3, 0] }}
              transition={{ duration: 2.4, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-b from-rose-950/60 via-red-900/30 to-emerald-950/40 mix-blend-color-dodge"
            />

            {/* Catastrophic Shockwave Sweep */}
            <motion.div
              initial={{ x: '-150%', opacity: 0 }}
              animate={{ x: '260%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-52 bg-gradient-to-r from-transparent via-red-600/50 via-emerald-400/60 to-transparent transform -skew-x-25"
            />

            {/* Toxic Hazard Border Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.4, 0.9, 0] }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
              className="absolute inset-0 border-[3px] border-emerald-400 rounded-2xl shadow-[0_0_35px_rgba(52,211,153,0.8),inset_0_0_25px_rgba(225,29,72,0.6)]"
            />

            {/* Danger Biohazard Sparks */}
            {[
              { top: '20%', left: '15%', delay: 0.1, color: 'bg-emerald-400' },
              { top: '35%', left: '80%', delay: 0.25, color: 'bg-red-500' },
              { top: '50%', left: '25%', delay: 0.4, color: 'bg-emerald-300' },
              { top: '65%', left: '75%', delay: 0.55, color: 'bg-rose-500' },
              { top: '80%', left: '35%', delay: 0.7, color: 'bg-emerald-400' },
              { top: '25%', left: '60%', delay: 0.85, color: 'bg-red-400' },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0], rotate: 180 }}
                transition={{ duration: 0.9, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className={`absolute w-2.5 h-2.5 rounded-sm ${pt.color} shadow-[0_0_14px_rgba(52,211,153,1)]`}
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 🗡️ 10. OBSIDIAN KNIFE REVEAL (Double-Edged Tier 1: Dark purple razor slash) */}
        {/* ========================================================================= */}
        {animType === 'obsidian_knife' && (
          <motion.div
            key={`obsidian-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Razor-Thin Dark Purple Slash Line across diagonal */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1.2, 0.8], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 via-fuchsia-300 to-transparent transform -rotate-35 origin-center shadow-[0_0_12px_rgba(168,85,247,1)]"
            />

            {/* Obsidian Glass Reflection Sweep */}
            <motion.div
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '230%', opacity: [0, 0.75, 0] }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-purple-500/25 to-transparent transform -skew-x-15"
            />

            {/* Crystal Shards along slash (4 shards) */}
            {[
              { top: '35%', left: '35%', delay: 0.2 },
              { top: '48%', left: '50%', delay: 0.35 },
              { top: '60%', left: '65%', delay: 0.5 },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{ scale: [0, 1.4, 0], opacity: [0, 0.9, 0], x: 6, y: -6 }}
                transition={{ duration: 0.7, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className="absolute w-2 h-2 rounded-xs bg-purple-300 shadow-[0_0_8px_rgba(192,132,252,1)]"
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 🥉🗡️ 11. COPPER DAGGER REVEAL (Double-Edged Tier 2: Warm copper slash trace) */}
        {/* ========================================================================= */}
        {animType === 'copper_dagger' && (
          <motion.div
            key={`copper-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Fiery Copper Slash Trace across the card */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1.3, 0.9], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-400 via-amber-300 to-transparent transform rotate-35 origin-center shadow-[0_0_15px_rgba(249,115,22,1)]"
            />

            {/* Copper Metallic Light Sweep */}
            <motion.div
              initial={{ x: '-130%', opacity: 0 }}
              animate={{ x: '240%', opacity: [0, 0.85, 0] }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-orange-500/35 to-transparent transform skew-x-15"
            />

            {/* Copper Spark Shower along cut */}
            {[
              { top: '30%', left: '60%', delay: 0.15, dx: 10, dy: 8 },
              { top: '45%', left: '48%', delay: 0.3, dx: -8, dy: 10 },
              { top: '60%', left: '35%', delay: 0.45, dx: 12, dy: -6 },
              { top: '75%', left: '20%', delay: 0.6, dx: -6, dy: 12 },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], x: pt.dx, y: pt.dy }}
                transition={{ duration: 0.8, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-orange-300 to-amber-500 shadow-[0_0_10px_rgba(234,88,12,1)]"
              />
            ))}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* ⚔️ 12. STEEL BLADE REVEAL (Double-Edged Tier 3: Mirror-sheen cold white flash) */}
        {/* ========================================================================= */}
        {animType === 'steel_blade' && (
          <motion.div
            key={`steel-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Brilliant Katana Flash (High velocity white slash) */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1.4, 0.9], opacity: [0, 1, 0] }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white via-slate-100 to-transparent transform -rotate-40 origin-center shadow-[0_0_20px_rgba(255,255,255,1)]"
            />

            {/* Specular White Cross-Cut Glare */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-radial from-white via-slate-200/50 to-transparent blur-xs"
            />

            {/* Cold Metallic Edge Gleam */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 1.6, ease: 'easeInOut' }}
              className="absolute inset-0 border-2 border-white rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.7),inset_0_0_15px_rgba(255,255,255,0.4)]"
            />
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 👹🗡️ 13. MURAMASA BLADE REVEAL (Double-Edged Tier 4: Cursed demonic cross-slash) */}
        {/* ========================================================================= */}
        {animType === 'muramasa' && (
          <motion.div
            key={`muramasa-${triggerKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {/* Cursed Violet Slash 1 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1.4, 0.8], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-purple-400 via-fuchsia-300 to-transparent transform -rotate-40 origin-center shadow-[0_0_25px_rgba(168,85,247,1)]"
            />

            {/* Cursed Emerald Slash 2 (Crossing 'X') */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1.4, 0.8], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, delay: 0.15, ease: 'easeOut' }}
              className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 via-teal-200 to-transparent transform rotate-40 origin-center shadow-[0_0_25px_rgba(52,211,153,1)]"
            />

            {/* Demonic Rune Smoke Core */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: [0.3, 1.6, 1.1], opacity: [0, 0.8, 0] }}
              transition={{ duration: 2.0, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-radial from-purple-600/40 via-emerald-500/25 to-transparent blur-xl"
            />

            {/* Pulsating Demonic Edge Surge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 0.9, 0] }}
              transition={{ duration: 2.4, ease: 'easeInOut' }}
              className="absolute inset-0 border-[3px] border-emerald-400 rounded-2xl shadow-[0_0_35px_rgba(52,211,153,0.8),inset_0_0_25px_rgba(168,85,247,0.6)]"
            />

            {/* Demonic Flame Sparks */}
            {[
              { top: '25%', left: '25%', delay: 0.1, color: 'bg-fuchsia-400' },
              { top: '30%', left: '75%', delay: 0.25, color: 'bg-emerald-400' },
              { top: '70%', left: '30%', delay: 0.45, color: 'bg-emerald-300' },
              { top: '75%', left: '70%', delay: 0.6, color: 'bg-purple-300' },
            ].map((pt, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0], y: -16 }}
                transition={{ duration: 1.0, delay: pt.delay, ease: 'easeOut' }}
                style={{ top: pt.top, left: pt.left }}
                className={`absolute w-2.5 h-2.5 rounded-full ${pt.color} shadow-[0_0_14px_rgba(168,85,247,1)]`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
