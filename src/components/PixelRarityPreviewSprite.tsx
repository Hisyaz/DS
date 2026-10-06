import React from 'react';
import { motion } from 'motion/react';
import { normalizeTierKey } from './PixelPackOpeningExperience';

interface PixelRarityGlimpseSpriteProps {
  tier: string;
  isIconicAbsent: boolean;
  isBeaconActive?: boolean;
}

/**
 * 32-Bit Quick Rarity Preview Sprite
 *
 * Requirements:
 * - BRONZE: Normal Bronze card appearance. Minimal info. Do NOT reveal card identity.
 * - SILVER: Small Silver-colored pixel-art card. No name, artwork, effects.
 * - GOLD: Small Gold-colored pixel-art card. No name, artwork, effects.
 * - LEGENDARY: Very dark/black pixel-art card silhouette. Identity completely hidden.
 *              No name, artwork, effects. Recognizable as rare without knowing what it is.
 * - ICONIC: Visually ABSENT! Renders an empty position/pedestal.
 *           Must NOT say "Iconic". The player should not know why it's missing.
 */
export const PixelRarityGlimpseSprite: React.FC<PixelRarityGlimpseSpriteProps> = ({
  tier,
  isIconicAbsent,
  isBeaconActive = false,
}) => {
  const norm = normalizeTierKey(tier);

  // If Iconic: card is intentionally VISUALLY ABSENT!
  if (isIconicAbsent || norm === 'iconic') {
    return (
      <div
        className="w-full h-full relative rounded-xl flex flex-col items-center justify-center p-2 select-none overflow-hidden"
        style={{
          imageRendering: 'pixelated',
        }}
      >
        {/* Subtle empty pedestal dashed outline - NO text saying "Iconic", NO badge */}
        <div className="w-full h-full rounded-lg border-2 border-dashed border-slate-700/50 bg-slate-950/40 flex flex-col items-center justify-center relative">
          {/* Subtle 32-bit empty floor pedestal mark */}
          <div className="w-10 h-1 bg-slate-800/60 rounded-none mb-1" />
          <div className="w-6 h-0.5 bg-slate-800/40 rounded-none" />

          {/* Stepped corner markers */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-slate-600/40" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-slate-600/40" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-slate-600/40" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-slate-600/40" />
        </div>
      </div>
    );
  }

  // 1. LEGENDARY: Very dark / pitch-black pixel-art card silhouette (identity completely hidden)
  if (norm === 'legendary' || norm === 'muramasa_blade') {
    return (
      <div
        className={`w-full h-full relative rounded-xl overflow-hidden select-none transition-all ${
          isBeaconActive ? 'ring-2 ring-zinc-700 shadow-[0_0_12px_rgba(0,0,0,0.8)]' : ''
        }`}
        style={{ imageRendering: 'pixelated' }}
      >
        <svg viewBox="0 0 64 96" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
          {/* Deep pitch-black outer boundary */}
          <rect x="1" y="1" width="62" height="94" fill="#020203" />
          {/* Subtle dark charcoal stepped frame */}
          <rect x="3" y="3" width="58" height="90" fill="#09090b" stroke="#18181b" strokeWidth="1" />
          {/* Obsidian interior */}
          <rect x="5" y="5" width="54" height="86" fill="#000000" />
          {/* Dark geometric faceted grid */}
          <rect x="12" y="12" width="40" height="72" fill="#050507" />
          {/* Subtle dark mystery diamond silhouette */}
          <polygon points="32,28 44,48 32,68 20,48" fill="#0d0d12" />
          <polygon points="32,36 38,48 32,60 26,48" fill="#050507" />
          {/* Stepped dark corner brackets */}
          <rect x="5" y="5" width="4" height="2" fill="#27272a" />
          <rect x="5" y="5" width="2" height="4" fill="#27272a" />
          <rect x="55" y="5" width="4" height="2" fill="#27272a" />
          <rect x="57" y="5" width="2" height="4" fill="#27272a" />
          <rect x="5" y="89" width="4" height="2" fill="#27272a" />
          <rect x="5" y="87" width="2" height="4" fill="#27272a" />
          <rect x="55" y="89" width="4" height="2" fill="#27272a" />
          <rect x="57" y="87" width="2" height="4" fill="#27272a" />
        </svg>
      </div>
    );
  }

  // 2. GOLD: Small Gold-colored pixel-art card (no name, artwork, effects)
  if (norm === 'gold' || norm === 'steel_blade') {
    return (
      <div
        className={`w-full h-full relative rounded-xl overflow-hidden select-none transition-all ${
          isBeaconActive ? 'ring-2 ring-yellow-400 shadow-[0_0_14px_rgba(251,191,36,0.6)]' : ''
        }`}
        style={{ imageRendering: 'pixelated' }}
      >
        <svg viewBox="0 0 64 96" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
          <rect x="1" y="1" width="62" height="94" fill="#1c0f03" />
          <rect x="3" y="3" width="58" height="90" fill="#d97706" />
          <rect x="5" y="5" width="54" height="86" fill="#451a03" />
          {/* Gold stepped border */}
          <rect x="7" y="7" width="50" height="82" fill="#78350f" />
          {/* Gold pixel dots */}
          <rect x="12" y="14" width="3" height="3" fill="#fbbf24" opacity="0.4" />
          <rect x="49" y="14" width="3" height="3" fill="#fbbf24" opacity="0.4" />
          <rect x="12" y="79" width="3" height="3" fill="#fbbf24" opacity="0.4" />
          <rect x="49" y="79" width="3" height="3" fill="#fbbf24" opacity="0.4" />
          {/* Center Minimal Gold Star Motif */}
          <polygon points="32,32 37,44 49,48 37,52 32,64 27,52 15,48 27,44" fill="#fbbf24" />
          <polygon points="32,38 35,46 42,48 35,50 32,58 29,50 22,48 29,46" fill="#fef08a" />
          {/* Corner gold studs */}
          <rect x="5" y="5" width="4" height="4" fill="#fbbf24" />
          <rect x="55" y="5" width="4" height="4" fill="#fbbf24" />
          <rect x="5" y="87" width="4" height="4" fill="#fbbf24" />
          <rect x="55" y="87" width="4" height="4" fill="#fbbf24" />
        </svg>
      </div>
    );
  }

  // 3. SILVER: Small Silver-colored pixel-art card (no name, artwork, effects)
  if (norm === 'silver' || norm === 'copper_dagger') {
    return (
      <div
        className={`w-full h-full relative rounded-xl overflow-hidden select-none transition-all ${
          isBeaconActive ? 'ring-2 ring-slate-300 shadow-[0_0_12px_rgba(203,213,225,0.6)]' : ''
        }`}
        style={{ imageRendering: 'pixelated' }}
      >
        <svg viewBox="0 0 64 96" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
          <rect x="1" y="1" width="62" height="94" fill="#090d16" />
          <rect x="3" y="3" width="58" height="90" fill="#64748b" />
          <rect x="5" y="5" width="54" height="86" fill="#1e293b" />
          <rect x="7" y="7" width="50" height="82" fill="#0f172a" />
          {/* Silver pixel studs */}
          <rect x="12" y="14" width="3" height="3" fill="#cbd5e1" opacity="0.4" />
          <rect x="49" y="14" width="3" height="3" fill="#cbd5e1" opacity="0.4" />
          <rect x="12" y="79" width="3" height="3" fill="#cbd5e1" opacity="0.4" />
          <rect x="49" y="79" width="3" height="3" fill="#cbd5e1" opacity="0.4" />
          {/* Center Minimal Silver Shield Motif */}
          <polygon points="32,32 46,38 42,56 32,64 22,56 18,38" fill="#94a3b8" />
          <polygon points="32,36 42,41 39,53 32,59 25,53 22,41" fill="#f1f5f9" />
          {/* Corner silver studs */}
          <rect x="5" y="5" width="4" height="4" fill="#cbd5e1" />
          <rect x="55" y="5" width="4" height="4" fill="#cbd5e1" />
          <rect x="5" y="87" width="4" height="4" fill="#cbd5e1" />
          <rect x="55" y="87" width="4" height="4" fill="#cbd5e1" />
        </svg>
      </div>
    );
  }

  // 4. BRONZE (default): Normal Bronze appearance (minimal, no identity)
  return (
    <div
      className={`w-full h-full relative rounded-xl overflow-hidden select-none transition-all ${
        isBeaconActive ? 'ring-2 ring-amber-600 shadow-[0_0_12px_rgba(184,115,51,0.6)]' : ''
      }`}
      style={{ imageRendering: 'pixelated' }}
    >
      <svg viewBox="0 0 64 96" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
        <rect x="1" y="1" width="62" height="94" fill="#170802" />
        <rect x="3" y="3" width="58" height="90" fill="#8c4820" />
        <rect x="5" y="5" width="54" height="86" fill="#261005" />
        <rect x="7" y="7" width="50" height="82" fill="#3d1c0b" />
        {/* Bronze geometric studs */}
        <rect x="12" y="14" width="3" height="3" fill="#cd7f32" opacity="0.35" />
        <rect x="49" y="14" width="3" height="3" fill="#cd7f32" opacity="0.35" />
        <rect x="12" y="79" width="3" height="3" fill="#cd7f32" opacity="0.35" />
        <rect x="49" y="79" width="3" height="3" fill="#cd7f32" opacity="0.35" />
        {/* Center Minimal Bronze Shield */}
        <polygon points="32,34 44,38 41,54 32,62 23,54 20,38" fill="#8c4820" />
        <polygon points="32,38 40,41 38,51 32,57 26,51 24,41" fill="#cd7f32" />
        {/* Corner bronze studs */}
        <rect x="5" y="5" width="4" height="4" fill="#cd7f32" />
        <rect x="55" y="5" width="4" height="4" fill="#cd7f32" />
        <rect x="5" y="87" width="4" height="4" fill="#cd7f32" />
        <rect x="55" y="87" width="4" height="4" fill="#cd7f32" />
      </svg>
    </div>
  );
};
