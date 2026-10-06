import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Sparkles,
  RotateCcw,
  Layers,
  Check,
  ChevronRight,
  Eye,
  Zap,
  Flame,
  Award,
  Shield,
  HeartHandshake,
  Briefcase,
  UserCheck,
  Crown,
} from 'lucide-react';
import { CustomCard } from '../types';
import {
  StorePackDefinition,
  StoreCollection,
  getCardOwnedCount,
  getNewCardCount,
  BASIC_PACK_PRICE_CREDITS,
} from '../utils/storeCollectionSystem';
import { audioManager } from '../utils/audioSystem';
import confetti from 'canvas-confetti';
import { shouldDisableParticles, triggerAppCelebration } from '../utils/graphicSettingsSystem';
import { PixelRarityGlimpseSprite } from './PixelRarityPreviewSprite';
import {
  PixelIconicHeroCard,
  PixelIconicSuspenseAndReveal,
  PixelGodPackSequence,
} from './PixelIconicHeroSequence';
import {
  PixelLegendaryHeroCard,
  PixelLegendarySuspenseAndReveal,
} from './PixelLegendaryHeroSequence';
import { PixelFinalCardCarousel } from './PixelFinalCardCarousel';

const triggerHaptic = (duration: number = 20) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {}
  }
};

const triggerConfetti = (opts?: any) => {
  triggerAppCelebration(opts);
};

export type PackOpeningStage =
  | 'pack_presentation'
  | 'pack_opening'
  | 'rarity_preview'
  | 'cards_move_forward'
  | 'legendary_suspense'
  | 'legendary_hero_moment'
  | 'iconic_suspense'
  | 'iconic_reveal'
  | 'iconic_hero_moment'
  | 'multi_iconic_special'
  | 'final_interface';

interface PixelPackOpeningExperienceProps {
  pack: StorePackDefinition;
  cards: CustomCard[];
  revealedCardIndices: Set<number>;
  onRevealCard: (index: number) => void;
  onRevealAll: () => void;
  onOpenAnother: () => void;
  onViewCollection: () => void;
  onDone: () => void;
  onInspectCard: (card: CustomCard) => void;
  credits: number;
  collection: StoreCollection;
  isOpeningAnother?: boolean;
}

// Helper to normalize tier keys robustly
export function normalizeTierKey(tier?: string): string {
  if (!tier) return 'bronze';
  const lower = tier.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (lower.includes('iconic') || lower.includes('diamond') || lower.includes('stat_break')) return 'iconic';
  if (lower.includes('legendary') || lower.includes('goat') || lower.includes('tier_4')) return 'legendary';
  if (lower.includes('gold') || lower.includes('epic') || lower.includes('tier_3')) return 'gold';
  if (lower.includes('silver') || lower.includes('rare') || lower.includes('tier_2')) return 'silver';
  if (lower.includes('bronze') || lower.includes('tier_1')) return 'bronze';
  if (lower.includes('muramasa')) return 'muramasa_blade';
  if (lower.includes('steel')) return 'steel_blade';
  if (lower.includes('copper')) return 'copper_dagger';
  if (lower.includes('obsidian')) return 'obsidian_knife';
  if (lower.includes('disaster')) return 'disaster';
  if (lower.includes('ash')) return 'ash';
  if (lower.includes('rust')) return 'rust';
  if (lower.includes('scrap')) return 'scrap';
  return 'bronze';
}

// 32-bit Rarity Tier Palette & Full Visual Meta
export interface TierPixelTheme {
  primary: string;
  secondary: string;
  accent: string;
  bgDark: string;
  label: string;
  borderPixel: string;
  glowColor: string;

  // --- CARD BACK SPECIFIC THEMING ---
  backOuterBorder: string;
  backBodyDark: string;
  backBodyMid: string;
  backSteppedBorder: string;
  backInnerLine: string;
  backPixelDots: string;
  backCrestType:
    | 'bronze_crest'
    | 'silver_shield'
    | 'gold_sunburst'
    | 'legendary_crown'
    | 'iconic_diamond'
    | 'obsidian_dagger'
    | 'copper_dagger'
    | 'steel_blade'
    | 'muramasa_katana'
    | 'scrap_gear'
    | 'rust_anvil'
    | 'ash_flame'
    | 'disaster_skull';
  backCrestPrimary: string;
  backCrestSecondary: string;
  backCrestAccent: string;
  backLabelPlateBg: string;
  backLabelBorder: string;
  backLabelTextColor: string;
  backIcon: string;

  // --- CARD FACE-DOWN CONTAINER (IN 5-CARD GRID) ---
  faceDownBg: string;
  faceDownBorder: string;
  faceDownGlow: string;
  flipButtonBg: string;
  flipButtonHover: string;
  flipButtonText: string;
  flipButtonBorder: string;

  // --- CARD FACE-UP REVEALED SPECIFIC THEMING ---
  frontCardBg: string;
  frontBorder: string;
  frontGlow: string;
  frontCornerAccent: string;
  frontHeaderBadgeBg: string;
  frontHeaderBadgeBorder: string;
  frontHeaderBadgeText: string;
  frontNameColor: string;
  frontCategoryColor: string;
  frontDescriptionColor: string;
  frontGuaranteeBg: string;
  frontGuaranteeBorder: string;
  frontGuaranteeText: string;
  frontModifiersBg: string;
  frontModifiersBorder: string;
  frontModifiersText: string;
  frontFooterBorder: string;
  frontOwnedCountColor: string;
  frontDetailsLinkColor: string;
}

export const PIXEL_TIER_THEMES: Record<string, TierPixelTheme> = {
  bronze: {
    primary: '#b87333',
    secondary: '#cd7f32',
    accent: '#ffedd5',
    bgDark: '#3d1a08',
    label: 'BRONZE',
    borderPixel: '#8c4820',
    glowColor: 'rgba(184, 115, 51, 0.6)',

    backOuterBorder: '#1a0a03',
    backBodyDark: '#261005',
    backBodyMid: '#451c0a',
    backSteppedBorder: '#cd7f32',
    backInnerLine: '#b87333',
    backPixelDots: 'rgba(205, 127, 50, 0.25)',
    backCrestType: 'bronze_crest',
    backCrestPrimary: '#b87333',
    backCrestSecondary: '#ffedd5',
    backCrestAccent: '#8c4820',
    backLabelPlateBg: '#261005',
    backLabelBorder: '#cd7f32',
    backLabelTextColor: '#fdba74',
    backIcon: '🥉',

    faceDownBg: 'linear-gradient(180deg, #2a1207 0%, #170802 100%)',
    faceDownBorder: '#8c4820',
    faceDownGlow: '0 0 0 2px #1a0a03, 0 6px 18px rgba(184, 115, 51, 0.35)',
    flipButtonBg: 'bg-gradient-to-r from-amber-700 to-amber-600',
    flipButtonHover: 'hover:from-amber-600 hover:to-amber-500',
    flipButtonText: 'text-amber-100',
    flipButtonBorder: 'border-amber-400',

    frontCardBg: 'linear-gradient(180deg, #3d1c0b 0%, #261105 50%, #150802 100%)',
    frontBorder: '#cd7f32',
    frontGlow: '0 0 0 2px #1a0a03, 0 8px 26px rgba(184, 115, 51, 0.65)',
    frontCornerAccent: '#cd7f32',
    frontHeaderBadgeBg: '#451c0a',
    frontHeaderBadgeBorder: '#cd7f32',
    frontHeaderBadgeText: '#fed7aa',
    frontNameColor: '#ffedd5',
    frontCategoryColor: '#fdba74',
    frontDescriptionColor: '#fed7aa',
    frontGuaranteeBg: 'rgba(184, 115, 51, 0.15)',
    frontGuaranteeBorder: 'rgba(205, 127, 50, 0.45)',
    frontGuaranteeText: '#fdba74',
    frontModifiersBg: 'rgba(184, 115, 51, 0.12)',
    frontModifiersBorder: 'rgba(205, 127, 50, 0.35)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(205, 127, 50, 0.3)',
    frontOwnedCountColor: '#fdba74',
    frontDetailsLinkColor: '#f97316',
  },
  silver: {
    primary: '#94a3b8',
    secondary: '#cbd5e1',
    accent: '#ffffff',
    bgDark: '#1e293b',
    label: 'SILVER',
    borderPixel: '#64748b',
    glowColor: 'rgba(203, 213, 225, 0.6)',

    backOuterBorder: '#090d16',
    backBodyDark: '#0f172a',
    backBodyMid: '#334155',
    backSteppedBorder: '#cbd5e1',
    backInnerLine: '#94a3b8',
    backPixelDots: 'rgba(241, 245, 249, 0.22)',
    backCrestType: 'silver_shield',
    backCrestPrimary: '#cbd5e1',
    backCrestSecondary: '#ffffff',
    backCrestAccent: '#64748b',
    backLabelPlateBg: '#0f172a',
    backLabelBorder: '#cbd5e1',
    backLabelTextColor: '#f8fafc',
    backIcon: '🥈',

    faceDownBg: 'linear-gradient(180deg, #1e293b 0%, #0a0f1d 100%)',
    faceDownBorder: '#475569',
    faceDownGlow: '0 0 0 2px #090d16, 0 6px 18px rgba(203, 213, 225, 0.3)',
    flipButtonBg: 'bg-gradient-to-r from-slate-200 to-slate-100',
    flipButtonHover: 'hover:from-white hover:to-slate-200',
    flipButtonText: 'text-slate-950',
    flipButtonBorder: 'border-white',

    frontCardBg: 'linear-gradient(180deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
    frontBorder: '#cbd5e1',
    frontGlow: '0 0 0 2px #090d16, 0 8px 24px rgba(203, 213, 225, 0.55)',
    frontCornerAccent: '#cbd5e1',
    frontHeaderBadgeBg: '#1e293b',
    frontHeaderBadgeBorder: '#cbd5e1',
    frontHeaderBadgeText: '#f8fafc',
    frontNameColor: '#ffffff',
    frontCategoryColor: '#cbd5e1',
    frontDescriptionColor: '#e2e8f0',
    frontGuaranteeBg: 'rgba(226, 232, 240, 0.12)',
    frontGuaranteeBorder: 'rgba(203, 213, 225, 0.4)',
    frontGuaranteeText: '#f8fafc',
    frontModifiersBg: 'rgba(226, 232, 240, 0.1)',
    frontModifiersBorder: 'rgba(203, 213, 225, 0.3)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(203, 213, 225, 0.25)',
    frontOwnedCountColor: '#f1f5f9',
    frontDetailsLinkColor: '#38bdf8',
  },
  gold: {
    primary: '#f59e0b',
    secondary: '#fbbf24',
    accent: '#fef08a',
    bgDark: '#451a03',
    label: 'GOLD',
    borderPixel: '#d97706',
    glowColor: 'rgba(251, 191, 36, 0.75)',

    backOuterBorder: '#261002',
    backBodyDark: '#3b1c04',
    backBodyMid: '#713f12',
    backSteppedBorder: '#fbbf24',
    backInnerLine: '#fef08a',
    backPixelDots: 'rgba(251, 191, 36, 0.28)',
    backCrestType: 'gold_sunburst',
    backCrestPrimary: '#fbbf24',
    backCrestSecondary: '#fef08a',
    backCrestAccent: '#d97706',
    backLabelPlateBg: '#261002',
    backLabelBorder: '#fbbf24',
    backLabelTextColor: '#fef08a',
    backIcon: '🥇',

    faceDownBg: 'linear-gradient(180deg, #3d1c02 0%, #1c0c01 100%)',
    faceDownBorder: '#d97706',
    faceDownGlow: '0 0 0 2px #261002, 0 6px 20px rgba(251, 191, 36, 0.4)',
    flipButtonBg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
    flipButtonHover: 'hover:from-yellow-300 hover:to-amber-400',
    flipButtonText: 'text-slate-950',
    flipButtonBorder: 'border-yellow-200',

    frontCardBg: 'linear-gradient(180deg, #59300a 0%, #3a1c03 50%, #1c0c01 100%)',
    frontBorder: '#fbbf24',
    frontGlow: '0 0 0 2px #1c0c01, 0 8px 28px rgba(251, 191, 36, 0.7)',
    frontCornerAccent: '#fbbf24',
    frontHeaderBadgeBg: '#713f12',
    frontHeaderBadgeBorder: '#fbbf24',
    frontHeaderBadgeText: '#fef08a',
    frontNameColor: '#fef08a',
    frontCategoryColor: '#fde047',
    frontDescriptionColor: '#fef9c3',
    frontGuaranteeBg: 'rgba(251, 191, 36, 0.16)',
    frontGuaranteeBorder: 'rgba(250, 204, 21, 0.45)',
    frontGuaranteeText: '#fde047',
    frontModifiersBg: 'rgba(251, 191, 36, 0.12)',
    frontModifiersBorder: 'rgba(250, 204, 21, 0.35)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(251, 191, 36, 0.3)',
    frontOwnedCountColor: '#fef08a',
    frontDetailsLinkColor: '#fbbf24',
  },
  legendary: {
    // Distinct Black with Gold Styling
    primary: '#fbbf24',
    secondary: '#f59e0b',
    accent: '#fef08a',
    bgDark: '#09090b',
    label: 'LEGENDARY',
    borderPixel: '#d97706',
    glowColor: 'rgba(245, 158, 11, 0.85)',

    backOuterBorder: '#000000',
    backBodyDark: '#09090b',
    backBodyMid: '#18181b',
    backSteppedBorder: '#fbbf24',
    backInnerLine: '#f59e0b',
    backPixelDots: 'rgba(250, 204, 21, 0.25)',
    backCrestType: 'legendary_crown',
    backCrestPrimary: '#fbbf24',
    backCrestSecondary: '#fef08a',
    backCrestAccent: '#d97706',
    backLabelPlateBg: '#09090b',
    backLabelBorder: '#fbbf24',
    backLabelTextColor: '#fef08a',
    backIcon: '👑',

    faceDownBg: 'linear-gradient(180deg, #141419 0%, #050507 100%)',
    faceDownBorder: '#fbbf24',
    faceDownGlow: '0 0 0 2px #000000, 0 6px 22px rgba(245, 158, 11, 0.45)',
    flipButtonBg: 'bg-black',
    flipButtonHover: 'hover:bg-zinc-900',
    flipButtonText: 'text-amber-300',
    flipButtonBorder: 'border-2 border-amber-400',

    frontCardBg: 'linear-gradient(180deg, #09090b 0%, #15151c 50%, #040405 100%)',
    frontBorder: '#fbbf24',
    frontGlow: '0 0 0 2px #000000, 0 0 0 3px #fbbf24, 0 10px 32px rgba(245, 158, 11, 0.85)',
    frontCornerAccent: '#fbbf24',
    frontHeaderBadgeBg: '#000000',
    frontHeaderBadgeBorder: '#fbbf24',
    frontHeaderBadgeText: '#fbbf24',
    frontNameColor: '#fef08a',
    frontCategoryColor: '#fde047',
    frontDescriptionColor: '#fef9c3',
    frontGuaranteeBg: 'rgba(251, 191, 36, 0.15)',
    frontGuaranteeBorder: 'rgba(251, 191, 36, 0.5)',
    frontGuaranteeText: '#fef08a',
    frontModifiersBg: 'rgba(251, 191, 36, 0.12)',
    frontModifiersBorder: 'rgba(251, 191, 36, 0.4)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(251, 191, 36, 0.4)',
    frontOwnedCountColor: '#fef08a',
    frontDetailsLinkColor: '#fbbf24',
  },
  iconic: {
    // Distinct Diamond Crystalline Cyan Styling
    primary: '#06b6d4',
    secondary: '#22d3ee',
    accent: '#ffffff',
    bgDark: '#083344',
    label: 'ICONIC DIAMOND',
    borderPixel: '#0891b2',
    glowColor: 'rgba(34, 211, 238, 0.9)',

    backOuterBorder: '#021d28',
    backBodyDark: '#041c26',
    backBodyMid: '#083344',
    backSteppedBorder: '#22d3ee',
    backInnerLine: '#67e8f9',
    backPixelDots: 'rgba(103, 232, 249, 0.3)',
    backCrestType: 'iconic_diamond',
    backCrestPrimary: '#22d3ee',
    backCrestSecondary: '#ffffff',
    backCrestAccent: '#06b6d4',
    backLabelPlateBg: '#041c26',
    backLabelBorder: '#22d3ee',
    backLabelTextColor: '#e0f2fe',
    backIcon: '💎',

    faceDownBg: 'linear-gradient(180deg, #083344 0%, #021a24 100%)',
    faceDownBorder: '#22d3ee',
    faceDownGlow: '0 0 0 2px #021d28, 0 6px 22px rgba(34, 211, 238, 0.45)',
    flipButtonBg: 'bg-gradient-to-r from-cyan-400 to-cyan-300',
    flipButtonHover: 'hover:from-cyan-300 hover:to-white',
    flipButtonText: 'text-slate-950',
    flipButtonBorder: 'border-cyan-100',

    frontCardBg: 'linear-gradient(180deg, #083344 0%, #0e7490 45%, #041c26 100%)',
    frontBorder: '#22d3ee',
    frontGlow: '0 0 0 2px #021d28, 0 0 0 3px #22d3ee, 0 10px 32px rgba(34, 211, 238, 0.85)',
    frontCornerAccent: '#67e8f9',
    frontHeaderBadgeBg: '#083344',
    frontHeaderBadgeBorder: '#67e8f9',
    frontHeaderBadgeText: '#e0f2fe',
    frontNameColor: '#ffffff',
    frontCategoryColor: '#67e8f9',
    frontDescriptionColor: '#e0f2fe',
    frontGuaranteeBg: 'rgba(34, 211, 238, 0.18)',
    frontGuaranteeBorder: 'rgba(103, 232, 249, 0.5)',
    frontGuaranteeText: '#a5f3fc',
    frontModifiersBg: 'rgba(34, 211, 238, 0.12)',
    frontModifiersBorder: 'rgba(103, 232, 249, 0.4)',
    frontModifiersText: '#a7f3d0',
    frontFooterBorder: 'rgba(34, 211, 238, 0.35)',
    frontOwnedCountColor: '#a5f3fc',
    frontDetailsLinkColor: '#22d3ee',
  },
  obsidian_knife: {
    primary: '#a855f7',
    secondary: '#c084fc',
    accent: '#f3e8ff',
    bgDark: '#1c1917',
    label: 'OBSIDIAN KNIFE',
    borderPixel: '#7e22ce',
    glowColor: 'rgba(168, 85, 247, 0.7)',

    backOuterBorder: '#0c0a09',
    backBodyDark: '#1c1917',
    backBodyMid: '#2e1065',
    backSteppedBorder: '#a855f7',
    backInnerLine: '#c084fc',
    backPixelDots: 'rgba(192, 132, 252, 0.22)',
    backCrestType: 'obsidian_dagger',
    backCrestPrimary: '#a855f7',
    backCrestSecondary: '#f3e8ff',
    backCrestAccent: '#7e22ce',
    backLabelPlateBg: '#1c1917',
    backLabelBorder: '#a855f7',
    backLabelTextColor: '#e9d5ff',
    backIcon: '🗡️',

    faceDownBg: 'linear-gradient(180deg, #1c1917 0%, #150926 100%)',
    faceDownBorder: '#7e22ce',
    faceDownGlow: '0 0 0 2px #0c0a09, 0 6px 18px rgba(168, 85, 247, 0.35)',
    flipButtonBg: 'bg-purple-950',
    flipButtonHover: 'hover:bg-purple-900',
    flipButtonText: 'text-purple-200',
    flipButtonBorder: 'border border-purple-500',

    frontCardBg: 'linear-gradient(180deg, #1c1917 0%, #2e1065 50%, #0c0a09 100%)',
    frontBorder: '#a855f7',
    frontGlow: '0 0 0 2px #0c0a09, 0 8px 26px rgba(168, 85, 247, 0.65)',
    frontCornerAccent: '#c084fc',
    frontHeaderBadgeBg: '#2e1065',
    frontHeaderBadgeBorder: '#c084fc',
    frontHeaderBadgeText: '#e9d5ff',
    frontNameColor: '#ffffff',
    frontCategoryColor: '#c084fc',
    frontDescriptionColor: '#f3e8ff',
    frontGuaranteeBg: 'rgba(168, 85, 247, 0.15)',
    frontGuaranteeBorder: 'rgba(192, 132, 252, 0.4)',
    frontGuaranteeText: '#e9d5ff',
    frontModifiersBg: 'rgba(168, 85, 247, 0.12)',
    frontModifiersBorder: 'rgba(192, 132, 252, 0.3)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(168, 85, 247, 0.3)',
    frontOwnedCountColor: '#e9d5ff',
    frontDetailsLinkColor: '#c084fc',
  },
  copper_dagger: {
    primary: '#ea580c',
    secondary: '#fdba74',
    accent: '#ffedd5',
    bgDark: '#431407',
    label: 'COPPER DAGGER',
    borderPixel: '#c2410c',
    glowColor: 'rgba(234, 88, 12, 0.7)',

    backOuterBorder: '#270b04',
    backBodyDark: '#431407',
    backBodyMid: '#7c2d12',
    backSteppedBorder: '#ea580c',
    backInnerLine: '#fdba74',
    backPixelDots: 'rgba(253, 186, 116, 0.25)',
    backCrestType: 'copper_dagger',
    backCrestPrimary: '#ea580c',
    backCrestSecondary: '#ffedd5',
    backCrestAccent: '#9a3412',
    backLabelPlateBg: '#270b04',
    backLabelBorder: '#ea580c',
    backLabelTextColor: '#fdba74',
    backIcon: '🗡️',

    faceDownBg: 'linear-gradient(180deg, #3d1408 0%, #1f0802 100%)',
    faceDownBorder: '#c2410c',
    faceDownGlow: '0 0 0 2px #270b04, 0 6px 18px rgba(234, 88, 12, 0.35)',
    flipButtonBg: 'bg-gradient-to-r from-orange-700 to-amber-700',
    flipButtonHover: 'hover:from-orange-600 hover:to-amber-600',
    flipButtonText: 'text-amber-100',
    flipButtonBorder: 'border-orange-400',

    frontCardBg: 'linear-gradient(180deg, #431407 0%, #7c2d12 50%, #270b04 100%)',
    frontBorder: '#ea580c',
    frontGlow: '0 0 0 2px #270b04, 0 8px 24px rgba(234, 88, 12, 0.7)',
    frontCornerAccent: '#ea580c',
    frontHeaderBadgeBg: '#7c2d12',
    frontHeaderBadgeBorder: '#fdba74',
    frontHeaderBadgeText: '#fed7aa',
    frontNameColor: '#ffedd5',
    frontCategoryColor: '#fdba74',
    frontDescriptionColor: '#ffedd5',
    frontGuaranteeBg: 'rgba(234, 88, 12, 0.18)',
    frontGuaranteeBorder: 'rgba(253, 186, 116, 0.45)',
    frontGuaranteeText: '#fdba74',
    frontModifiersBg: 'rgba(234, 88, 12, 0.12)',
    frontModifiersBorder: 'rgba(253, 186, 116, 0.35)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(234, 88, 12, 0.3)',
    frontOwnedCountColor: '#fdba74',
    frontDetailsLinkColor: '#ea580c',
  },
  steel_blade: {
    primary: '#93c5fd',
    secondary: '#ffffff',
    accent: '#ffffff',
    bgDark: '#0f172a',
    label: 'STEEL BLADE',
    borderPixel: '#38bdf8',
    glowColor: 'rgba(255, 255, 255, 0.75)',

    backOuterBorder: '#030712',
    backBodyDark: '#0f172a',
    backBodyMid: '#1e293b',
    backSteppedBorder: '#ffffff',
    backInnerLine: '#93c5fd',
    backPixelDots: 'rgba(255, 255, 255, 0.25)',
    backCrestType: 'steel_blade',
    backCrestPrimary: '#ffffff',
    backCrestSecondary: '#93c5fd',
    backCrestAccent: '#38bdf8',
    backLabelPlateBg: '#030712',
    backLabelBorder: '#ffffff',
    backLabelTextColor: '#ffffff',
    backIcon: '⚔️',

    faceDownBg: 'linear-gradient(180deg, #1e293b 0%, #090d16 100%)',
    faceDownBorder: '#64748b',
    faceDownGlow: '0 0 0 2px #030712, 0 6px 18px rgba(255, 255, 255, 0.35)',
    flipButtonBg: 'bg-slate-100',
    flipButtonHover: 'hover:bg-white',
    flipButtonText: 'text-slate-950',
    flipButtonBorder: 'border-2 border-white',

    frontCardBg: 'linear-gradient(180deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
    frontBorder: '#ffffff',
    frontGlow: '0 0 0 2px #030712, 0 8px 24px rgba(255, 255, 255, 0.65)',
    frontCornerAccent: '#ffffff',
    frontHeaderBadgeBg: '#0f172a',
    frontHeaderBadgeBorder: '#ffffff',
    frontHeaderBadgeText: '#ffffff',
    frontNameColor: '#ffffff',
    frontCategoryColor: '#93c5fd',
    frontDescriptionColor: '#f1f5f9',
    frontGuaranteeBg: 'rgba(255, 255, 255, 0.12)',
    frontGuaranteeBorder: 'rgba(255, 255, 255, 0.4)',
    frontGuaranteeText: '#ffffff',
    frontModifiersBg: 'rgba(255, 255, 255, 0.1)',
    frontModifiersBorder: 'rgba(255, 255, 255, 0.3)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(255, 255, 255, 0.3)',
    frontOwnedCountColor: '#ffffff',
    frontDetailsLinkColor: '#38bdf8',
  },
  muramasa_blade: {
    // Cursed Purple Body with Vivid Toxic Poison Green Border!
    primary: '#34d399',
    secondary: '#10b981',
    accent: '#a7f3d0',
    bgDark: '#3b0764',
    label: 'MURAMASA BLADE',
    borderPixel: '#059669',
    glowColor: 'rgba(52, 211, 153, 0.85)',

    backOuterBorder: '#180327',
    backBodyDark: '#2e0854',
    backBodyMid: '#3b0764',
    backSteppedBorder: '#34d399',
    backInnerLine: '#10b981',
    backPixelDots: 'rgba(52, 211, 153, 0.28)',
    backCrestType: 'muramasa_katana',
    backCrestPrimary: '#34d399',
    backCrestSecondary: '#fda4af',
    backCrestAccent: '#10b981',
    backLabelPlateBg: '#180327',
    backLabelBorder: '#34d399',
    backLabelTextColor: '#34d399',
    backIcon: '👹🗡️',

    faceDownBg: 'linear-gradient(180deg, #2e0854 0%, #160228 100%)',
    faceDownBorder: '#10b981',
    faceDownGlow: '0 0 0 2px #180327, 0 6px 20px rgba(52, 211, 153, 0.45)',
    flipButtonBg: 'bg-purple-950',
    flipButtonHover: 'hover:bg-purple-900',
    flipButtonText: 'text-emerald-300',
    flipButtonBorder: 'border-2 border-emerald-400',

    frontCardBg: 'linear-gradient(180deg, #3b0764 0%, #581c87 50%, #1e0538 100%)',
    frontBorder: '#34d399',
    frontGlow: '0 0 0 2px #180327, 0 0 0 3px #10b981, 0 8px 28px rgba(52, 211, 153, 0.8)',
    frontCornerAccent: '#34d399',
    frontHeaderBadgeBg: '#2e0854',
    frontHeaderBadgeBorder: '#34d399',
    frontHeaderBadgeText: '#34d399',
    frontNameColor: '#ffffff',
    frontCategoryColor: '#6ee7b7',
    frontDescriptionColor: '#a7f3d0',
    frontGuaranteeBg: 'rgba(52, 211, 153, 0.18)',
    frontGuaranteeBorder: 'rgba(52, 211, 153, 0.5)',
    frontGuaranteeText: '#34d399',
    frontModifiersBg: 'rgba(52, 211, 153, 0.15)',
    frontModifiersBorder: 'rgba(52, 211, 153, 0.4)',
    frontModifiersText: '#a7f3d0',
    frontFooterBorder: 'rgba(52, 211, 153, 0.35)',
    frontOwnedCountColor: '#34d399',
    frontDetailsLinkColor: '#10b981',
  },
  scrap: {
    primary: '#a1a1aa',
    secondary: '#d4d4d8',
    accent: '#f4f4f5',
    bgDark: '#27272a',
    label: 'SCRAP',
    borderPixel: '#71717a',
    glowColor: 'rgba(161, 161, 170, 0.5)',

    backOuterBorder: '#18181b',
    backBodyDark: '#27272a',
    backBodyMid: '#3f3f46',
    backSteppedBorder: '#a1a1aa',
    backInnerLine: '#71717a',
    backPixelDots: 'rgba(161, 161, 170, 0.2)',
    backCrestType: 'scrap_gear',
    backCrestPrimary: '#a1a1aa',
    backCrestSecondary: '#f4f4f5',
    backCrestAccent: '#71717a',
    backLabelPlateBg: '#18181b',
    backLabelBorder: '#a1a1aa',
    backLabelTextColor: '#d4d4d8',
    backIcon: '🗑️',

    faceDownBg: 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
    faceDownBorder: '#71717a',
    faceDownGlow: '0 0 0 2px #18181b, 0 6px 16px rgba(161, 161, 170, 0.3)',
    flipButtonBg: 'bg-zinc-800',
    flipButtonHover: 'hover:bg-zinc-700',
    flipButtonText: 'text-zinc-200',
    flipButtonBorder: 'border border-zinc-600',

    frontCardBg: 'linear-gradient(180deg, #27272a 0%, #3f3f46 50%, #18181b 100%)',
    frontBorder: '#a1a1aa',
    frontGlow: '0 0 0 2px #18181b, 0 8px 20px rgba(161, 161, 170, 0.4)',
    frontCornerAccent: '#a1a1aa',
    frontHeaderBadgeBg: '#27272a',
    frontHeaderBadgeBorder: '#a1a1aa',
    frontHeaderBadgeText: '#e4e4e7',
    frontNameColor: '#ffffff',
    frontCategoryColor: '#a1a1aa',
    frontDescriptionColor: '#d4d4d8',
    frontGuaranteeBg: 'rgba(161, 161, 170, 0.12)',
    frontGuaranteeBorder: 'rgba(161, 161, 170, 0.3)',
    frontGuaranteeText: '#e4e4e7',
    frontModifiersBg: 'rgba(161, 161, 170, 0.1)',
    frontModifiersBorder: 'rgba(161, 161, 170, 0.25)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(161, 161, 170, 0.25)',
    frontOwnedCountColor: '#e4e4e7',
    frontDetailsLinkColor: '#a1a1aa',
  },
  rust: {
    primary: '#c2410c',
    secondary: '#ea580c',
    accent: '#fed7aa',
    bgDark: '#431407',
    label: 'RUST',
    borderPixel: '#7c2d12',
    glowColor: 'rgba(194, 65, 12, 0.5)',

    backOuterBorder: '#230b04',
    backBodyDark: '#431407',
    backBodyMid: '#581c0c',
    backSteppedBorder: '#ea580c',
    backInnerLine: '#c2410c',
    backPixelDots: 'rgba(234, 88, 12, 0.2)',
    backCrestType: 'rust_anvil',
    backCrestPrimary: '#c2410c',
    backCrestSecondary: '#fed7aa',
    backCrestAccent: '#7c2d12',
    backLabelPlateBg: '#230b04',
    backLabelBorder: '#ea580c',
    backLabelTextColor: '#fdba74',
    backIcon: '⚙️',

    faceDownBg: 'linear-gradient(180deg, #381206 0%, #1f0903 100%)',
    faceDownBorder: '#7c2d12',
    faceDownGlow: '0 0 0 2px #230b04, 0 6px 16px rgba(194, 65, 12, 0.3)',
    flipButtonBg: 'bg-amber-900',
    flipButtonHover: 'hover:bg-amber-800',
    flipButtonText: 'text-amber-100',
    flipButtonBorder: 'border border-amber-600',

    frontCardBg: 'linear-gradient(180deg, #431407 0%, #290d04 50%, #1a0702 100%)',
    frontBorder: '#c2410c',
    frontGlow: '0 0 0 2px #1a0702, 0 8px 22px rgba(194, 65, 12, 0.45)',
    frontCornerAccent: '#c2410c',
    frontHeaderBadgeBg: '#431407',
    frontHeaderBadgeBorder: '#ea580c',
    frontHeaderBadgeText: '#fed7aa',
    frontNameColor: '#fed7aa',
    frontCategoryColor: '#ea580c',
    frontDescriptionColor: '#fed7aa',
    frontGuaranteeBg: 'rgba(194, 65, 12, 0.15)',
    frontGuaranteeBorder: 'rgba(234, 88, 12, 0.35)',
    frontGuaranteeText: '#fed7aa',
    frontModifiersBg: 'rgba(194, 65, 12, 0.1)',
    frontModifiersBorder: 'rgba(234, 88, 12, 0.25)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(194, 65, 12, 0.25)',
    frontOwnedCountColor: '#fed7aa',
    frontDetailsLinkColor: '#ea580c',
  },
  ash: {
    primary: '#ef4444',
    secondary: '#f87171',
    accent: '#fee2e2',
    bgDark: '#171717',
    label: 'ASH',
    borderPixel: '#dc2626',
    glowColor: 'rgba(239, 68, 68, 0.6)',

    backOuterBorder: '#000000',
    backBodyDark: '#0f0f0f',
    backBodyMid: '#1c1917',
    backSteppedBorder: '#ef4444',
    backInnerLine: '#dc2626',
    backPixelDots: 'rgba(239, 68, 68, 0.25)',
    backCrestType: 'ash_flame',
    backCrestPrimary: '#ef4444',
    backCrestSecondary: '#fca5a5',
    backCrestAccent: '#dc2626',
    backLabelPlateBg: '#000000',
    backLabelBorder: '#ef4444',
    backLabelTextColor: '#f87171',
    backIcon: '🔥',

    faceDownBg: 'linear-gradient(180deg, #1c1917 0%, #080808 100%)',
    faceDownBorder: '#dc2626',
    faceDownGlow: '0 0 0 2px #000000, 0 6px 18px rgba(239, 68, 68, 0.35)',
    flipButtonBg: 'bg-red-950',
    flipButtonHover: 'hover:bg-red-900',
    flipButtonText: 'text-red-200',
    flipButtonBorder: 'border border-red-500',

    frontCardBg: 'linear-gradient(180deg, #171717 0%, #0a0a0a 50%, #000000 100%)',
    frontBorder: '#ef4444',
    frontGlow: '0 0 0 2px #000000, 0 8px 24px rgba(239, 68, 68, 0.6)',
    frontCornerAccent: '#ef4444',
    frontHeaderBadgeBg: '#000000',
    frontHeaderBadgeBorder: '#ef4444',
    frontHeaderBadgeText: '#fca5a5',
    frontNameColor: '#ffffff',
    frontCategoryColor: '#f87171',
    frontDescriptionColor: '#fee2e2',
    frontGuaranteeBg: 'rgba(239, 68, 68, 0.15)',
    frontGuaranteeBorder: 'rgba(239, 68, 68, 0.4)',
    frontGuaranteeText: '#fca5a5',
    frontModifiersBg: 'rgba(239, 68, 68, 0.12)',
    frontModifiersBorder: 'rgba(239, 68, 68, 0.3)',
    frontModifiersText: '#34d399',
    frontFooterBorder: 'rgba(239, 68, 68, 0.3)',
    frontOwnedCountColor: '#fca5a5',
    frontDetailsLinkColor: '#ef4444',
  },
  disaster: {
    // Crimson body with radioactive poison green border!
    primary: '#22c55e',
    secondary: '#4ade80',
    accent: '#fca5a5',
    bgDark: '#450a0a',
    label: 'DISASTER',
    borderPixel: '#16a34a',
    glowColor: 'rgba(34, 197, 94, 0.75)',

    backOuterBorder: '#180303',
    backBodyDark: '#450a0a',
    backBodyMid: '#7f1d1d',
    backSteppedBorder: '#22c55e',
    backInnerLine: '#4ade80',
    backPixelDots: 'rgba(34, 197, 94, 0.25)',
    backCrestType: 'disaster_skull',
    backCrestPrimary: '#22c55e',
    backCrestSecondary: '#f87171',
    backCrestAccent: '#16a34a',
    backLabelPlateBg: '#180303',
    backLabelBorder: '#22c55e',
    backLabelTextColor: '#4ade80',
    backIcon: '☠️',

    faceDownBg: 'linear-gradient(180deg, #3d0808 0%, #150202 100%)',
    faceDownBorder: '#22c55e',
    faceDownGlow: '0 0 0 2px #180303, 0 6px 20px rgba(34, 197, 94, 0.4)',
    flipButtonBg: 'bg-red-950',
    flipButtonHover: 'hover:bg-red-900',
    flipButtonText: 'text-emerald-300',
    flipButtonBorder: 'border-2 border-emerald-400',

    frontCardBg: 'linear-gradient(180deg, #450a0a 0%, #7f1d1d 50%, #1c0404 100%)',
    frontBorder: '#22c55e',
    frontGlow: '0 0 0 2px #180303, 0 0 0 3px #22c55e, 0 8px 28px rgba(34, 197, 94, 0.75)',
    frontCornerAccent: '#22c55e',
    frontHeaderBadgeBg: '#450a0a',
    frontHeaderBadgeBorder: '#22c55e',
    frontHeaderBadgeText: '#4ade80',
    frontNameColor: '#ffffff',
    frontCategoryColor: '#fca5a5',
    frontDescriptionColor: '#fee2e2',
    frontGuaranteeBg: 'rgba(34, 197, 94, 0.15)',
    frontGuaranteeBorder: 'rgba(34, 197, 94, 0.4)',
    frontGuaranteeText: '#4ade80',
    frontModifiersBg: 'rgba(34, 197, 94, 0.12)',
    frontModifiersBorder: 'rgba(34, 197, 94, 0.35)',
    frontModifiersText: '#4ade80',
    frontFooterBorder: 'rgba(34, 197, 94, 0.3)',
    frontOwnedCountColor: '#4ade80',
    frontDetailsLinkColor: '#22c55e',
  },
};

export function getPixelTierTheme(tier?: string): TierPixelTheme {
  const key = normalizeTierKey(tier);
  return PIXEL_TIER_THEMES[key] || PIXEL_TIER_THEMES.bronze;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  parents: HeartHandshake,
  youth: Award,
  career: Shield,
  sponsor: Briefcase,
  life: Sparkles,
  agent: UserCheck,
  street: Flame,
};

// ============================================================================
// 32-BIT PIXEL-ART BOOSTER PACK SPRITE COMPONENT
// ============================================================================
const PixelBoosterPackSprite: React.FC<{
  pack: StorePackDefinition;
  isOpening?: boolean;
  className?: string;
}> = ({ pack, isOpening = false, className = '' }) => {
  // Category specific pixel colors
  const palette = useMemo(() => {
    switch (pack.category) {
      case 'parents':
        return { base: '#be185d', light: '#f472b6', dark: '#831843', trim: '#fbcfe8' };
      case 'youth':
        return { base: '#047857', light: '#34d399', dark: '#064e3b', trim: '#a7f3d0' };
      case 'career':
        return { base: '#1d4ed8', light: '#60a5fa', dark: '#1e3a8a', trim: '#bfdbfe' };
      case 'sponsor':
        return { base: '#d97706', light: '#fbbf24', dark: '#78350f', trim: '#fef3c7' };
      case 'life':
        return { base: '#7c3aed', light: '#c084fc', dark: '#4c1d95', trim: '#ede9fe' };
      case 'agent':
        return { base: '#0891b2', light: '#22d3ee', dark: '#164e63', trim: '#cffafe' };
      case 'street':
      default:
        return { base: '#ea580c', light: '#fb923c', dark: '#7c2d12', trim: '#ffedd5' };
    }
  }, [pack.category]);

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        imageRendering: 'pixelated',
      }}
    >
      <svg
        viewBox="0 0 160 230"
        className="w-full h-auto drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)]"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <defs>
          {/* Foil Specular Sheen Gradient */}
          <linearGradient id={`foilGrad-${pack.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.light} stopOpacity="0.85" />
            <stop offset="25%" stopColor={palette.base} />
            <stop offset="50%" stopColor={palette.light} stopOpacity="0.9" />
            <stop offset="75%" stopColor={palette.dark} />
            <stop offset="100%" stopColor={palette.base} />
          </linearGradient>

          {/* Stepped pixel pattern for foil background */}
          <pattern id="pixelGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="none" />
            <rect x="0" y="0" width="4" height="4" fill="rgba(255,255,255,0.04)" />
            <rect x="4" y="4" width="4" height="4" fill="rgba(0,0,0,0.08)" />
          </pattern>
        </defs>

        {/* Outer Black Pixel Outline (Stepped corners) */}
        <rect x="12" y="6" width="136" height="218" fill="#020617" />
        <rect x="8" y="10" width="144" height="210" fill="#020617" />
        <rect x="6" y="14" width="148" height="202" fill="#020617" />

        {/* ================= TOP FOIL CRIMP (TEARABLE) ================= */}
        <g id="top-crimp">
          {/* Dark border under crimp */}
          <rect x="12" y="8" width="136" height="20" fill="#090d16" />
          {/* Stepped alternating pixel teeth for crimp seal */}
          {Array.from({ length: 17 }).map((_, i) => (
            <React.Fragment key={`top-tooth-${i}`}>
              <rect
                x={14 + i * 8}
                y="8"
                width="4"
                height="18"
                fill={i % 2 === 0 ? palette.light : palette.dark}
              />
              <rect
                x={18 + i * 8}
                y="8"
                width="4"
                height="18"
                fill={i % 2 === 0 ? palette.base : palette.light}
              />
            </React.Fragment>
          ))}
          {/* Crimp horizontal highlight line */}
          <rect x="12" y="24" width="136" height="2" fill="#fef08a" opacity="0.8" />
          <rect x="12" y="26" width="136" height="2" fill="#020617" />
        </g>

        {/* ================= PACK MAIN FOIL BODY ================= */}
        <rect x="12" y="28" width="136" height="174" fill={palette.base} />
        {/* Layer metallic gradient overlay */}
        <rect x="12" y="28" width="136" height="174" fill={`url(#foilGrad-${pack.id})`} opacity="0.85" />
        <rect x="12" y="28" width="136" height="174" fill="url(#pixelGrid)" />

        {/* Diagonal 32-bit pixel light sweep highlight */}
        <polygon points="12,70 56,28 72,28 12,86" fill="#ffffff" opacity="0.3" />
        <polygon points="12,140 124,28 140,28 12,156" fill="#ffffff" opacity="0.25" />
        <polygon points="50,202 148,104 148,120 66,202" fill="#ffffff" opacity="0.18" />

        {/* Foil Bevel Side Highlights */}
        <rect x="12" y="28" width="4" height="174" fill="#ffffff" opacity="0.4" />
        <rect x="144" y="28" width="4" height="174" fill="#020617" opacity="0.5" />

        {/* ================= CENTER BRANDING / HEADER ================= */}
        {/* Top Header Plate */}
        <rect x="22" y="36" width="116" height="22" fill="#020617" />
        <rect x="24" y="38" width="112" height="18" fill="#1e293b" />
        <rect x="26" y="40" width="108" height="2" fill="#38bdf8" />
        <text
          x="80"
          y="51"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="7.5"
          fontWeight="900"
          fontFamily="monospace"
          letterSpacing="1.2"
        >
          DRAW★STAR
        </text>

        {/* Middle Emblem Badge Box */}
        <rect x="26" y="66" width="108" height="88" fill="#020617" />
        <rect x="28" y="68" width="104" height="84" fill="#090d16" />
        {/* Accent inner border */}
        <rect x="30" y="70" width="100" height="80" fill={palette.dark} />

        {/* Pixel Football / Star Emblem in Center */}
        <g id="center-emblem" transform="translate(80, 106)">
          {/* Ambient pixel aura */}
          <rect x="-24" y="-24" width="48" height="48" fill={palette.light} opacity="0.25" />
          <rect x="-20" y="-20" width="40" height="40" fill={palette.light} opacity="0.35" />

          {/* 32-bit Pixel Football / Star Crest */}
          <rect x="-14" y="-14" width="28" height="28" fill="#020617" />
          <rect x="-12" y="-12" width="24" height="24" fill="#f8fafc" />
          {/* Football pentagon pixel tiles */}
          <rect x="-4" y="-4" width="8" height="8" fill="#0f172a" />
          <rect x="-10" y="-10" width="4" height="4" fill="#0f172a" />
          <rect x="6" y="-10" width="4" height="4" fill="#0f172a" />
          <rect x="-10" y="6" width="4" height="4" fill="#0f172a" />
          <rect x="6" y="6" width="4" height="4" fill="#0f172a" />

          {/* 4-corner pixel star sparks */}
          <rect x="-26" y="-2" width="4" height="4" fill="#fef08a" />
          <rect x="22" y="-2" width="4" height="4" fill="#fef08a" />
          <rect x="-2" y="-26" width="4" height="4" fill="#fef08a" />
          <rect x="-2" y="22" width="4" height="4" fill="#fef08a" />
        </g>

        {/* Pack Category Banner Plate */}
        <rect x="20" y="132" width="120" height="18" fill="#020617" />
        <rect x="22" y="134" width="116" height="14" fill={palette.base} />
        <text
          x="80"
          y="144"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8"
          fontWeight="900"
          fontFamily="monospace"
          letterSpacing="0.8"
        >
          {pack.categoryLabel.toUpperCase()}
        </text>

        {/* 5 CARDS / GUARANTEE SEAL BADGE */}
        <rect x="36" y="160" width="88" height="18" fill="#020617" />
        <rect x="38" y="162" width="84" height="14" fill="#fbbf24" />
        <rect x="40" y="164" width="80" height="2" fill="#fef08a" />
        <text
          x="80"
          y="172"
          textAnchor="middle"
          fill="#020617"
          fontSize="7"
          fontWeight="900"
          fontFamily="monospace"
        >
          ★ 5 CARDS PACK ★
        </text>

        {/* Bottom Small Tagline */}
        <text
          x="80"
          y="194"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="5.5"
          fontWeight="bold"
          fontFamily="monospace"
          opacity="0.85"
        >
          BRONZE → ICONIC
        </text>

        {/* ================= BOTTOM FOIL CRIMP ================= */}
        <g id="bottom-crimp">
          <rect x="12" y="202" width="136" height="2" fill="#020617" />
          <rect x="12" y="204" width="136" height="18" fill="#090d16" />
          {Array.from({ length: 17 }).map((_, i) => (
            <React.Fragment key={`bot-tooth-${i}`}>
              <rect
                x={14 + i * 8}
                y="204"
                width="4"
                height="18"
                fill={i % 2 === 0 ? palette.light : palette.dark}
              />
              <rect
                x={18 + i * 8}
                y="204"
                width="4"
                height="18"
                fill={i % 2 === 0 ? palette.base : palette.light}
              />
            </React.Fragment>
          ))}
        </g>
      </svg>
    </div>
  );
};

// ============================================================================
// 32-BIT PIXEL-ART CARD BACK SPRITE COMPONENT
// ============================================================================
const PixelCardBackSprite: React.FC<{
  index: number;
  beaconTier?: string;
  isHighlighted?: boolean;
}> = ({ index, beaconTier, isHighlighted = false }) => {
  const theme = getPixelTierTheme(beaconTier);

  // Render authentic 32-bit pixel crest based on tier
  const renderCrest = () => {
    switch (theme.backCrestType) {
      case 'bronze_crest':
        return (
          <g>
            {/* Bronze Shield */}
            <polygon points="0,-28 26,-12 26,14 0,28 -26,14 -26,-12" fill={theme.backOuterBorder} />
            <polygon points="0,-25 23,-10 23,12 0,25 -23,12 -23,-10" fill={theme.backBodyMid} />
            <polygon points="0,-21 19,-8 19,10 0,21 -19,10 -19,-8" fill={theme.backBodyDark} />
            {/* 4-point Bronze Star */}
            <polygon points="0,-15 4,-4 15,0 4,4 0,15 -4,4 -15,0 -4,-4" fill={theme.backCrestPrimary} />
            <polygon points="0,-9 2,-2 9,0 2,2 0,9 -2,2 -9,0 -2,-2" fill={theme.backCrestSecondary} />
            <rect x="-2" y="-2" width="4" height="4" fill="#ffffff" />
            {/* Shield corner rivets */}
            <rect x="-16" y="-6" width="2" height="2" fill={theme.backSteppedBorder} />
            <rect x="14" y="-6" width="2" height="2" fill={theme.backSteppedBorder} />
            <rect x="-16" y="6" width="2" height="2" fill={theme.backSteppedBorder} />
            <rect x="14" y="6" width="2" height="2" fill={theme.backSteppedBorder} />
          </g>
        );

      case 'silver_shield':
        return (
          <g>
            {/* Polished Silver Shield */}
            <polygon points="0,-30 26,-14 26,14 0,30 -26,14 -26,-14" fill="#090d16" />
            <polygon points="0,-27 23,-12 23,12 0,27 -23,12 -23,-12" fill={theme.backSteppedBorder} />
            <polygon points="0,-24 20,-10 20,10 0,24 -20,10 -20,-10" fill={theme.backBodyMid} />
            <polygon points="0,-20 16,-8 16,8 0,20 -16,8 -16,-8" fill={theme.backBodyDark} />
            {/* Central Silver 4-Point Star */}
            <polygon points="0,-16 5,-5 16,0 5,5 0,16 -5,5 -16,0 -5,-5" fill={theme.backCrestPrimary} />
            <polygon points="0,-10 3,-3 10,0 3,3 0,10 -3,3 -10,0 -3,-3" fill="#ffffff" />
            <rect x="-2" y="-2" width="4" height="4" fill="#ffffff" />
            {/* Chrome reflection slits */}
            <rect x="-12" y="-4" width="2" height="8" fill="#ffffff" opacity="0.6" />
            <rect x="10" y="-4" width="2" height="8" fill="#ffffff" opacity="0.6" />
          </g>
        );

      case 'gold_sunburst':
        return (
          <g>
            {/* 8-Point Royal Golden Sunburst */}
            <polygon points="0,-30 8,-18 24,-18 16,-6 26,6 14,14 16,28 4,22 -6,28 -8,14 -24,6 -16,-6 -24,-18 -8,-18" fill={theme.backOuterBorder} />
            <polygon points="0,-26 7,-15 21,-15 14,-5 23,5 12,12 14,24 3,19 -5,24 -7,12 -21,5 -14,-5 -21,-15 -7,-15" fill={theme.backSteppedBorder} />
            <circle cx="0" cy="0" r="14" fill={theme.backBodyDark} stroke={theme.backInnerLine} strokeWidth="1.5" />
            {/* Central Golden Star */}
            <polygon points="0,-13 4,-4 13,0 4,4 0,13 -4,4 -13,0 -4,-4" fill={theme.backCrestPrimary} />
            <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill={theme.backCrestSecondary} />
            <rect x="-2" y="-2" width="4" height="4" fill="#ffffff" />
          </g>
        );

      case 'legendary_crown':
        return (
          <g>
            {/* Imperial Black with 24K Gold Crown Medallion */}
            <polygon points="-16,-28 16,-28 28,-16 28,16 16,28 -16,28 -28,16 -28,-16" fill="#000000" />
            <polygon points="-14,-26 14,-26 26,-14 26,14 14,26 -14,26 -26,14 -26,-14" fill="#fbbf24" />
            <polygon points="-12,-24 12,-24 24,-12 24,12 12,24 -12,24 -24,12 -24,-12" fill="#09090b" />

            {/* 32-bit Pixel Royal Crown */}
            <g transform="translate(0, -6)">
              <rect x="-14" y="4" width="28" height="6" fill="#fbbf24" />
              <rect x="-14" y="2" width="28" height="2" fill="#fef08a" />
              <polygon points="-14,4 -10,-8 -6,4" fill="#fbbf24" />
              <polygon points="-4,4 0,-12 4,4" fill="#fbbf24" />
              <polygon points="6,4 10,-8 14,4" fill="#fbbf24" />
              {/* Crown Jewels */}
              <rect x="-1" y="-13" width="2" height="2" fill="#ffffff" />
              <rect x="-11" y="-9" width="2" height="2" fill="#ef4444" />
              <rect x="9" y="-9" width="2" height="2" fill="#38bdf8" />
              <rect x="-8" y="6" width="3" height="3" fill="#ef4444" />
              <rect x="-1" y="6" width="3" height="3" fill="#ffffff" />
              <rect x="6" y="6" width="3" height="3" fill="#38bdf8" />
            </g>
            {/* Radiant Starburst below crown */}
            <polygon points="0,13 3,17 8,17 4,20 6,25 0,21 -6,25 -4,20 -8,17 -3,17" fill="#fbbf24" />
            <rect x="-1" y="16" width="2" height="2" fill="#ffffff" />
          </g>
        );

      case 'iconic_diamond':
        return (
          <g>
            {/* Prismatic 32-bit Diamond Gemstone */}
            <polygon points="0,-32 30,0 0,32 -30,0" fill="#021d28" />
            <polygon points="0,-29 27,0 0,29 -27,0" fill="#22d3ee" />
            <polygon points="0,-26 24,0 0,26 -24,0" fill="#041c26" />

            {/* Faceted Diamond Silhouette */}
            <polygon points="-16,-12 16,-12 24,0 -24,0" fill="#67e8f9" />
            <polygon points="-24,0 0,22 24,0" fill="#06b6d4" />
            <polygon points="-10,-12 0,0 10,-12" fill="#e0f2fe" />
            <polygon points="-16,-12 -10,-12 -24,0" fill="#38bdf8" />
            <polygon points="10,-12 16,-12 24,0" fill="#a5f3fc" />
            <polygon points="0,0 0,22 -10,0" fill="#0891b2" />
            <polygon points="0,0 0,22 10,0" fill="#22d3ee" />

            {/* Prismatic Sparkle Glints */}
            <rect x="-2" y="-14" width="4" height="4" fill="#ffffff" />
            <rect x="6" y="4" width="3" height="3" fill="#ffffff" />
            <rect x="-14" y="-3" width="2" height="2" fill="#ffffff" />
            <rect x="14" y="-3" width="2" height="2" fill="#ffffff" />
          </g>
        );

      case 'obsidian_dagger':
        return (
          <g>
            <polygon points="0,-30 18,-10 18,10 0,30 -18,10 -18,-10" fill="#0c0a09" />
            <polygon points="0,-26 15,-8 15,8 0,26 -15,8 -15,-8" fill="#7e22ce" />
            <polygon points="0,-24 13,-6 13,6 0,24 -13,6 -13,-6" fill="#1c1917" />
            {/* Obsidian Blade */}
            <polygon points="0,-20 6,-6 4,10 0,20 -4,10 -6,-6" fill="#2e1065" />
            <line x1="0" y1="-18" x2="0" y2="16" stroke="#c084fc" strokeWidth="1.5" />
            <polygon points="-10,2 10,2 0,6" fill="#a855f7" />
            <rect x="-2" y="-18" width="4" height="4" fill="#ffffff" />
          </g>
        );

      case 'copper_dagger':
        return (
          <g>
            <polygon points="0,-28 22,-8 22,8 0,28 -22,8 -22,-8" fill="#270b04" />
            <polygon points="0,-24 19,-6 19,6 0,24 -19,6 -19,-6" fill="#ea580c" />
            <polygon points="0,-21 16,-4 16,4 0,21 -16,4 -16,-4" fill="#431407" />
            {/* Crossed Daggers */}
            <line x1="-12" y1="-14" x2="12" y2="14" stroke="#fdba74" strokeWidth="3" />
            <line x1="12" y1="-14" x2="-12" y2="14" stroke="#fdba74" strokeWidth="3" />
            <rect x="-4" y="-4" width="8" height="8" fill="#ea580c" />
            <rect x="-2" y="-2" width="4" height="4" fill="#ffedd5" />
          </g>
        );

      case 'steel_blade':
        return (
          <g>
            <polygon points="0,-30 24,-12 24,12 0,30 -24,12 -24,-12" fill="#030712" />
            <polygon points="0,-26 21,-10 21,10 0,26 -21,10 -21,-10" fill="#ffffff" />
            <polygon points="0,-22 18,-8 18,8 0,22 -18,8 -18,-8" fill="#0f172a" />
            {/* Crossed Polished Longswords */}
            <line x1="-14" y1="-16" x2="14" y2="16" stroke="#ffffff" strokeWidth="3" />
            <line x1="14" y1="-16" x2="-14" y2="16" stroke="#ffffff" strokeWidth="3" />
            <line x1="-14" y1="-16" x2="14" y2="16" stroke="#38bdf8" strokeWidth="1" />
            <line x1="14" y1="-16" x2="-14" y2="16" stroke="#38bdf8" strokeWidth="1" />
            <rect x="-3" y="-3" width="6" height="6" fill="#93c5fd" />
            <rect x="-1" y="-1" width="2" height="2" fill="#ffffff" />
          </g>
        );

      case 'muramasa_katana':
        return (
          <g>
            {/* Cursed Demon Horned Crest */}
            <polygon points="0,-30 26,-14 26,14 0,30 -26,14 -26,-14" fill="#180327" />
            <polygon points="0,-26 22,-12 22,12 0,26 -22,12 -22,-12" fill="#34d399" />
            <polygon points="0,-22 18,-10 18,10 0,22 -18,10 -18,-10" fill="#3b0764" />
            {/* Demon Katana Blade with Toxic Green Aura */}
            <path d="M-14,14 Q0,-2 14,-18" stroke="#10b981" strokeWidth="4" fill="none" />
            <path d="M-14,14 Q0,-2 14,-18" stroke="#34d399" strokeWidth="2" fill="none" />
            <circle cx="-14" cy="14" r="3" fill="#fda4af" />
            {/* Poison Flame Sparkles */}
            <rect x="14" y="-18" width="4" height="4" fill="#a7f3d0" />
            <rect x="-4" y="-6" width="3" height="3" fill="#34d399" />
            <rect x="6" y="2" width="3" height="3" fill="#34d399" />
          </g>
        );

      case 'scrap_gear':
        return (
          <g>
            <circle cx="0" cy="0" r="18" fill="#18181b" stroke="#a1a1aa" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="#3f3f46" stroke="#71717a" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="5" fill="#18181b" />
            <rect x="-2" y="-22" width="4" height="6" fill="#a1a1aa" />
            <rect x="-2" y="16" width="4" height="6" fill="#a1a1aa" />
            <rect x="-22" y="-2" width="6" height="4" fill="#a1a1aa" />
            <rect x="16" y="-2" width="6" height="4" fill="#a1a1aa" />
          </g>
        );

      case 'rust_anvil':
        return (
          <g>
            <polygon points="-16,-6 16,-6 12,12 -12,12" fill="#7c2d12" stroke="#ea580c" strokeWidth="2" />
            <rect x="-18" y="-12" width="36" height="6" fill="#c2410c" />
            <rect x="-4" y="-10" width="8" height="2" fill="#fed7aa" />
          </g>
        );

      case 'ash_flame':
        return (
          <g>
            <polygon points="0,-22 14,-6 8,14 -8,14 -14,-6" fill="#dc2626" />
            <polygon points="0,-16 10,-4 5,10 -5,10 -10,-4" fill="#ef4444" />
            <polygon points="0,-10 6,-2 3,6 -3,6 -6,-2" fill="#fef08a" />
          </g>
        );

      case 'disaster_skull':
      default:
        return (
          <g>
            <circle cx="0" cy="-4" r="14" fill="#180303" stroke="#22c55e" strokeWidth="2" />
            <rect x="-6" y="8" width="12" height="8" fill="#22c55e" />
            {/* Eyes */}
            <circle cx="-5" cy="-4" r="3" fill="#22c55e" />
            <circle cx="5" cy="-4" r="3" fill="#22c55e" />
            <circle cx="-5" cy="-4" r="1" fill="#450a0a" />
            <circle cx="5" cy="-4" r="1" fill="#450a0a" />
          </g>
        );
    }
  };

  return (
    <div
      className="w-full h-full relative select-none rounded-2xl overflow-hidden"
      style={{ imageRendering: 'pixelated' }}
    >
      <svg
        viewBox="0 0 120 170"
        className="w-full h-full"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* Outer border matching tier */}
        <rect x="2" y="2" width="116" height="166" fill={theme.backOuterBorder} />
        {/* Stepped pixel frame in tier's signature color */}
        <rect x="4" y="4" width="112" height="162" fill={theme.backSteppedBorder} />
        {/* Main card back body in tier's rich dark tone */}
        <rect x="6" y="6" width="108" height="158" fill={theme.backBodyDark} />

        {/* 4 Stepped Corner Pixel Brackets */}
        <rect x="6" y="6" width="8" height="2" fill={theme.backSteppedBorder} />
        <rect x="6" y="6" width="2" height="8" fill={theme.backSteppedBorder} />
        <rect x="106" y="6" width="8" height="2" fill={theme.backSteppedBorder} />
        <rect x="112" y="6" width="2" height="8" fill={theme.backSteppedBorder} />
        <rect x="6" y="162" width="8" height="2" fill={theme.backSteppedBorder} />
        <rect x="6" y="156" width="2" height="8" fill={theme.backSteppedBorder} />
        <rect x="106" y="162" width="8" height="2" fill={theme.backSteppedBorder} />
        <rect x="112" y="156" width="2" height="8" fill={theme.backSteppedBorder} />

        {/* Diamond pixel grid background in tier color */}
        {Array.from({ length: 9 }).map((_, r) =>
          Array.from({ length: 6 }).map((_, c) => (
            <rect
              key={`grid-${r}-${c}`}
              x={14 + c * 16}
              y={16 + r * 16}
              width="4"
              height="4"
              fill={theme.backPixelDots}
            />
          ))
        )}

        {/* Inner Border Frame in tier color */}
        <rect
          x="10"
          y="10"
          width="100"
          height="150"
          fill="none"
          stroke={theme.backInnerLine}
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Top Rim Rarity Beacon Node */}
        <g transform="translate(60, 16)">
          <rect x="-10" y="-4" width="20" height="8" fill={theme.backOuterBorder} />
          <rect x="-8" y="-3" width="16" height="6" fill={theme.backSteppedBorder} />
          <rect x="-4" y="-1.5" width="8" height="3" fill={theme.accent} />
          {/* Flanking sparks */}
          <rect x="-16" y="-1" width="4" height="2" fill={theme.secondary} />
          <rect x="12" y="-1" width="4" height="2" fill={theme.secondary} />
        </g>

        {/* Central Unique 32-bit Pixel Crest */}
        <g transform="translate(60, 83)">
          {renderCrest()}
        </g>

        {/* Bottom Card Label Plate */}
        <g transform="translate(60, 146)">
          <rect
            x="-44"
            y="-9"
            width="88"
            height="18"
            fill={theme.backLabelPlateBg}
            stroke={theme.backLabelBorder}
            strokeWidth="1.5"
          />
          <rect
            x="-42"
            y="-7"
            width="84"
            height="2"
            fill={theme.backInnerLine}
            opacity="0.4"
          />
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fill={theme.backLabelTextColor}
            fontSize="6.5"
            fontWeight="900"
            fontFamily="monospace"
            letterSpacing="0.4"
          >
            {theme.backIcon} {theme.label} #{index + 1}
          </text>
        </g>
      </svg>
    </div>
  );
};

// ============================================================================
// 32-BIT PIXEL PARTICLE FLASH & FRAGMENTS
// ============================================================================
const PixelFoilFragmentsBurst: React.FC<{
  active: boolean;
  packCategory: string;
}> = ({ active, packCategory }) => {
  if (!active) return null;

  // 18 deterministic pixel flakes flying outward
  const flakes = [
    { x: -90, y: -80, size: 8, color: '#fef08a', delay: 0 },
    { x: -60, y: -120, size: 10, color: '#38bdf8', delay: 0.02 },
    { x: 0, y: -140, size: 12, color: '#f59e0b', delay: 0.01 },
    { x: 60, y: -110, size: 8, color: '#ffffff', delay: 0.03 },
    { x: 95, y: -75, size: 10, color: '#fef08a', delay: 0.02 },
    { x: 120, y: -20, size: 8, color: '#fbbf24', delay: 0.04 },
    { x: 110, y: 50, size: 12, color: '#38bdf8', delay: 0.02 },
    { x: 70, y: 90, size: 8, color: '#fef08a', delay: 0.05 },
    { x: -20, y: 110, size: 10, color: '#ffffff', delay: 0.03 },
    { x: -75, y: 80, size: 8, color: '#fbbf24', delay: 0.04 },
    { x: -115, y: 20, size: 12, color: '#fef08a', delay: 0.01 },
    { x: -110, y: -30, size: 8, color: '#38bdf8', delay: 0.03 },
    { x: -40, y: -50, size: 6, color: '#f59e0b', delay: 0.06 },
    { x: 45, y: -60, size: 6, color: '#ffffff', delay: 0.05 },
    { x: 50, y: 40, size: 6, color: '#fef08a', delay: 0.04 },
    { x: -50, y: 30, size: 6, color: '#38bdf8', delay: 0.05 },
  ];

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-30"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 32-bit Screen White Flash (stepped 4-frame retro flash) */}
      <motion.div
        initial={{ opacity: 0.95 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'linear' }}
        className="absolute inset-0 bg-white"
      />

      {/* Center 32-bit Pixel Crossburst */}
      <motion.div
        initial={{ scale: 0.2, opacity: 1, rotate: 0 }}
        animate={{ scale: 2.5, opacity: 0, rotate: 45 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="absolute w-32 h-32 flex items-center justify-center"
      >
        <div className="w-12 h-12 bg-amber-300 shadow-[0_0_0_8px_#ffffff,0_0_0_16px_#f59e0b]" />
      </motion.div>

      {/* Outward flying pixel foil chips */}
      {flakes.map((f, i) => (
        <motion.div
          key={`flake-${i}`}
          initial={{ x: 0, y: -20, opacity: 1, scale: 1 }}
          animate={{
            x: f.x * 1.6,
            y: f.y * 1.6,
            opacity: [1, 1, 0],
            scale: [1, 1.2, 0.6],
          }}
          transition={{ duration: 0.55, delay: f.delay, ease: 'easeOut' }}
          className="absolute"
          style={{
            width: f.size,
            height: f.size,
            backgroundColor: f.color,
            boxShadow: '0 0 0 2px #020617',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// MAIN PACK OPENING EXPERIENCE COMPONENT
// ============================================================================
export const PixelPackOpeningExperience: React.FC<PixelPackOpeningExperienceProps> = ({
  pack,
  cards,
  revealedCardIndices,
  onRevealCard,
  onRevealAll,
  onOpenAnother,
  onViewCollection,
  onDone,
  onInspectCard,
  credits,
  collection,
  isOpeningAnother = false,
}) => {
  // Stage state machine
  const [stage, setStage] = useState<PackOpeningStage>('pack_presentation');
  const [previewBeaconIndex, setPreviewBeaconIndex] = useState<number>(-1);
  const [currentIconicSeqIndex, setCurrentIconicSeqIndex] = useState<number>(0);
  const [currentLegendarySeqIndex, setCurrentLegendarySeqIndex] = useState<number>(0);
  const [showSkipPrompt, setShowSkipPrompt] = useState<boolean>(false);
  const timersRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Collect all Iconic cards drawn
  const iconicIndices = useMemo(() => {
    const list: number[] = [];
    cards.forEach((c, idx) => {
      if (normalizeTierKey(c.tier) === 'iconic') {
        list.push(idx);
      }
    });
    return list;
  }, [cards]);

  // Collect all Legendary cards drawn
  const legendaryIndices = useMemo(() => {
    const list: number[] = [];
    cards.forEach((c, idx) => {
      const tk = normalizeTierKey(c.tier);
      if (tk === 'legendary' || tk === 'muramasa_blade') {
        list.push(idx);
      }
    });
    return list;
  }, [cards]);

  const hasIconic = iconicIndices.length > 0;
  const hasLegendary = legendaryIndices.length > 0;
  const hasHighTier = hasIconic || hasLegendary;

  // Reorder cards for final interface:
  // 1. Iconic cards appear first (preserving reveal order)
  // 2. Legendary cards appear second
  // 3. Normal pack cards follow
  const displayCards = useMemo(() => {
    const iconics: { card: CustomCard; originalIndex: number; isIconic: boolean; isLegendary: boolean }[] = [];
    const legendaries: { card: CustomCard; originalIndex: number; isIconic: boolean; isLegendary: boolean }[] = [];
    const others: { card: CustomCard; originalIndex: number; isIconic: boolean; isLegendary: boolean }[] = [];

    cards.forEach((c, idx) => {
      const tk = normalizeTierKey(c.tier);
      const isIconic = tk === 'iconic';
      const isLegendary = tk === 'legendary' || tk === 'muramasa_blade';
      const item = { card: c, originalIndex: idx, isIconic, isLegendary };

      if (isIconic) {
        iconics.push(item);
      } else if (isLegendary) {
        legendaries.push(item);
      } else {
        others.push(item);
      }
    });

    return [...iconics, ...legendaries, ...others];
  }, [cards]);

  // Check if any rare card was drawn
  const highestTier = useMemo(() => {
    const tierPriority: Record<string, number> = {
      iconic: 100,
      muramasa_blade: 90,
      legendary: 80,
      steel_blade: 70,
      gold: 60,
      copper_dagger: 50,
      silver: 40,
      obsidian_knife: 30,
      bronze: 20,
    };
    let topTier = 'bronze';
    let maxP = 0;
    cards.forEach((c) => {
      const p = tierPriority[c.tier] || 10;
      if (p > maxP) {
        maxP = p;
      }
    });
    return topTier;
  }, [cards]);

  // STAGE 1 -> STAGE 2: Handle Pack Tear Trigger
  const triggerPackOpening = () => {
    if (stage !== 'pack_presentation') return;

    clearAllTimers();
    triggerHaptic(35);
    audioManager.playPackTearSound();

    // If ALL five cards are Iconic: Skip normal rarity preview entirely!
    if (iconicIndices.length === 5) {
      iconicIndices.forEach((idx) => onRevealCard(idx));
      setStage('multi_iconic_special');
      return;
    }

    setStage('pack_opening');

    // After 650ms tearing animation -> transition into Quick Rarity Preview
    const t1 = window.setTimeout(() => {
      setStage('rarity_preview');
      triggerHaptic(20);

      // Fast sequential chime across normal cards
      cards.forEach((c, idx) => {
        const isIconic = normalizeTierKey(c.tier) === 'iconic';
        const isLegendary = normalizeTierKey(c.tier) === 'legendary' || normalizeTierKey(c.tier) === 'muramasa_blade';
        if (!isIconic && !isLegendary) {
          const tChime = window.setTimeout(() => {
            setPreviewBeaconIndex(idx);
            audioManager.playRarityChime(c.tier);
          }, idx * 100);
          timersRef.current.push(tChime);
        }
      });

      // After rarity preview (~1100ms) -> Cards Move Forward
      const t2 = window.setTimeout(() => {
        setStage('cards_move_forward');
        audioManager.playCardFlipSound();

        // Check for confetti if rare non-iconic
        if (
          highestTier === 'legendary' ||
          highestTier === 'gold' ||
          highestTier === 'muramasa_blade'
        ) {
          triggerConfetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }

        // After visible cards move forward (~500ms):
        // If a Legendary card exists -> enter legendary_suspense!
        // Else if an Iconic card exists -> enter iconic_suspense!
        // Else -> transition to final_interface.
        const t3 = window.setTimeout(() => {
          if (legendaryIndices.length > 0) {
            setCurrentLegendarySeqIndex(0);
            setStage('legendary_suspense');
          } else if (iconicIndices.length > 0) {
            setCurrentIconicSeqIndex(0);
            setStage('iconic_suspense');
          } else {
            setStage('final_interface');
          }
        }, 500);
        timersRef.current.push(t3);
      }, 1100);
      timersRef.current.push(t2);
    }, 650);
    timersRef.current.push(t1);
  };

  // Auto-open if user initiated via "OPEN ANOTHER"
  useEffect(() => {
    if (isOpeningAnother) {
      if (hasHighTier) {
        // High rarity pulled in "Open Another"!
        triggerHaptic(45);
        if (hasIconic) {
          audioManager.playIconicSuspenseSound();
        } else {
          audioManager.playLegendarySuspenseSound();
        }
      }
      const autoTimer = window.setTimeout(() => {
        triggerPackOpening();
      }, hasHighTier ? 600 : 250);
      return () => window.clearTimeout(autoTimer);
    }
  }, [isOpeningAnother]);

  // Move from Legendary Hero moment to next Legendary, or to Iconic suspense, or to final interface
  const handleProceedFromLegendaryHeroMoment = () => {
    const currentIdx = legendaryIndices[currentLegendarySeqIndex];
    if (currentIdx !== undefined) {
      onRevealCard(currentIdx);
    }

    if (currentLegendarySeqIndex + 1 < legendaryIndices.length) {
      setCurrentLegendarySeqIndex((prev) => prev + 1);
      setStage('legendary_suspense');
    } else if (iconicIndices.length > 0) {
      // Transition into Iconic sequence next!
      setCurrentIconicSeqIndex(0);
      setStage('iconic_suspense');
    } else {
      setStage('final_interface');
    }
  };

  // Move from Hero moment to next Iconic or to final interface
  const handleProceedFromHeroMoment = () => {
    const currentIdx = iconicIndices[currentIconicSeqIndex];
    if (currentIdx !== undefined) {
      onRevealCard(currentIdx);
    }

    if (currentIconicSeqIndex + 1 < iconicIndices.length) {
      setCurrentIconicSeqIndex((prev) => prev + 1);
      setStage('iconic_suspense');
    } else {
      setStage('final_interface');
    }
  };

  // Ensure all cards are revealed when entering final carousel
  useEffect(() => {
    if (stage === 'final_interface') {
      onRevealAll();
    }
  }, [stage, onRevealAll]);

  // Instant skip to final interface for player convenience
  const handleFastForwardToFinal = () => {
    clearAllTimers();
    onRevealAll();
    setStage('final_interface');
  };

  // Allow clicking anywhere in presentation to open pack immediately
  const handlePresentationClick = () => {
    if (stage === 'pack_presentation') {
      triggerPackOpening();
    } else if (stage === 'rarity_preview') {
      handleFastForwardToFinal();
    }
  };

  const allRevealed = revealedCardIndices.size >= cards.length;

  return (
    <div
      id="pixel-pack-opening-overlay"
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-y-auto overscroll-contain safe-top safe-bottom safe-px"
      style={{
        imageRendering: 'pixelated',
      }}
      onClick={handlePresentationClick}
    >
      {/* ================= CRT RETRO SCANLINES & AMBIENT TURF ================= */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.45) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
          backgroundSize: '100% 4px, 6px 100%',
        }}
      />

      {/* Stadium Turf Floor Horizon & Spotlight Cone */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-emerald-950/40 via-slate-950/60 to-transparent pointer-events-none" />
      <div className="absolute top-0 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* ================= TOP ARCADE STATUS BAR ================= */}
      <header className="w-full max-w-5xl flex items-center justify-between z-20 shrink-0 pt-1 px-1">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* 32-bit Arcade Header Plate */}
          <div className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-900 border-2 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-none bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs sm:text-sm font-black text-amber-300 tracking-wider uppercase">
              DRAW★STAR CHAMPION STORE
            </span>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300 border border-slate-700">
            {pack.name.toUpperCase()}
          </span>
        </div>

        {/* Credits Balance Display & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border-2 border-amber-400/60 font-mono text-xs">
            <span className="text-amber-400 font-bold text-[10px] sm:text-xs">CREDITS:</span>
            <span className="font-black text-white text-xs sm:text-sm">{credits}</span>
          </div>

          {(stage === 'rarity_preview' || stage === 'pack_presentation') && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (stage === 'pack_presentation') triggerPackOpening();
                else handleFastForwardToFinal();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-mono text-xs font-bold cursor-pointer transition-colors"
            >
              {stage === 'pack_presentation' ? 'OPEN NOW ➔' : 'SKIP ➔'}
            </button>
          )}

          {stage === 'final_interface' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                audioManager.playSuccessChime();
                triggerHaptic(30);
                onDone();
              }}
              className="px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black font-mono text-xs uppercase tracking-wider pixel-bevel-gold flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>CONFIRM</span>
            </button>
          )}
        </div>
      </header>

      {/* ================= MAIN ANIMATION STAGE CENTER ================= */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative z-10 py-2 sm:py-3 min-h-0">
        {/* ========================================================================= */}
        {/* STAGE 1: PACK PRESENTATION */}
        {/* ========================================================================= */}
        {stage === 'pack_presentation' && (
          <motion.div
            initial={{ scale: 0.8, y: -40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex flex-col items-center justify-center cursor-pointer group"
          >
            {/* High Rarity Special Banner if pulled on "Open Another" */}
            {isOpeningAnother && hasHighTier && (
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: -12 }}
                animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="mb-4 px-4 py-2 rounded-xl bg-slate-950 border-2 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.9)] flex items-center gap-2 z-30"
              >
                <Crown className="w-4 h-4 text-amber-300 animate-bounce" />
                <span className="font-mono text-xs sm:text-sm font-black text-amber-200 tracking-wider uppercase">
                  {hasIconic && hasLegendary
                    ? '⚡ GOD PULL IN NEW PACK: ICONIC & LEGENDARY! ⚡'
                    : hasIconic
                    ? '💎 ICONIC DETECTED IN NEW PACK! 💎'
                    : '👑 LEGENDARY PULLED IN NEW PACK! 👑'}
                </span>
                <Crown className="w-4 h-4 text-amber-300 animate-bounce" />
              </motion.div>
            )}

            {/* Ambient Back Glow */}
            <div className="absolute w-72 h-96 rounded-full bg-amber-400/15 blur-3xl group-hover:bg-amber-400/25 transition-all pointer-events-none" />

            {/* Subtle Bobbing Pack */}
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="w-56 sm:w-64 md:w-72"
            >
              <PixelBoosterPackSprite pack={pack} />
            </motion.div>

            {/* Stadium Pitch Floor Reflection Disc */}
            <div className="w-48 h-4 rounded-full bg-black/60 blur-xs mt-2" />

            {/* 32-bit Interactive Prompt */}
            <div className="mt-5 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerPackOpening();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black font-mono text-sm sm:text-base uppercase tracking-wider shadow-[0_0_0_2px_#020617,0_0_0_4px_#fbbf24,0_8px_20px_rgba(251,191,36,0.5)] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                <span>TAP TO TEAR OPEN</span>
              </button>
              <span className="text-[11px] font-mono text-amber-300/80 font-bold uppercase tracking-wider animate-pulse">
                ▼ PRESS ANYWHERE OR BUTTON TO TEAR PACK ▼
              </span>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: PACK OPENING ANIMATION */}
        {/* ========================================================================= */}
        {stage === 'pack_opening' && (
          <div className="relative flex flex-col items-center justify-center">
            {/* Pixel Foil Fragments Burst */}
            <PixelFoilFragmentsBurst active={true} packCategory={pack.category} />

            {/* Shaking & Breaking Foil Pack */}
            <motion.div
              animate={{
                x: [-4, 4, -4, 4, -2, 2, 0],
                y: [0, -6, 2, -2, 0],
              }}
              transition={{ duration: 0.45 }}
              className="w-56 sm:w-64 md:w-72"
            >
              <PixelBoosterPackSprite pack={pack} isOpening={true} />
            </motion.div>

            <div className="mt-4 px-4 py-2 rounded-lg bg-slate-900/90 border-2 border-amber-400 font-mono text-xs font-black text-amber-300 tracking-wider">
              ⚡ TEARING PACK FOIL... ⚡
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: QUICK RARITY PREVIEW (32-BIT GLIMPSE) */}
        {/* ========================================================================= */}
        {stage === 'rarity_preview' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-5 w-full my-auto"
          >
            {/* 32-Bit Rarity Scanning Header Banner */}
            <div className="px-5 py-2 rounded-xl bg-slate-900/95 border-2 border-amber-400 text-center shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <div className="text-[11px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                <span>32-BIT RARITY PREVIEW SCAN</span>
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              </div>
            </div>

            {/* Small Preview Arrangement (5 small cards side-by-side) */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-4 w-full max-w-xl px-2">
              {cards.map((card, idx) => {
                const isIconic = normalizeTierKey(card.tier) === 'iconic';
                const isBeaconActive = !isIconic && idx <= previewBeaconIndex;

                return (
                  <motion.div
                    key={`glimpse-slot-${idx}`}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{
                      y: isBeaconActive ? -6 : 0,
                      opacity: 1,
                    }}
                    transition={{
                      delay: idx * 0.05,
                      type: 'spring',
                      stiffness: 280,
                      damping: 22,
                    }}
                    className="w-16 sm:w-20 md:w-24 h-24 sm:h-30 md:h-36 relative"
                  >
                    <PixelRarityGlimpseSprite
                      tier={card.tier}
                      isIconicAbsent={isIconic}
                      isBeaconActive={isBeaconActive}
                    />
                  </motion.div>
                );
              })}
            </div>

            <p className="text-xs font-mono text-slate-400 tracking-wider">
              [ TAP TO SKIP PREVIEW ]
            </p>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: CARDS MOVE FORWARD */}
        {/* ========================================================================= */}
        {stage === 'cards_move_forward' && (
          <div className="flex flex-col items-center justify-center space-y-6 w-full my-auto">
            <div className="px-5 py-1.5 rounded-xl bg-slate-900 border-2 border-cyan-400/70 font-mono text-xs font-black text-cyan-300 uppercase tracking-widest animate-pulse">
              ★ CARDS MOVING FORWARD ★
            </div>
            <div className="flex items-center justify-center gap-3 sm:gap-4 w-full max-w-4xl px-2">
              {cards.map((card, idx) => {
                const isIconic = normalizeTierKey(card.tier) === 'iconic';
                const isLegendary = normalizeTierKey(card.tier) === 'legendary' || normalizeTierKey(card.tier) === 'muramasa_blade';
                if (isIconic || isLegendary) {
                  return (
                    <div
                      key={`fwd-hidden-${idx}`}
                      className="w-16 sm:w-20 md:w-28 h-28 sm:h-36 md:h-44 border-2 border-dashed border-slate-700/80 rounded-xl bg-slate-950/60 flex items-center justify-center shadow-inner"
                    >
                      <span className="text-sm sm:text-base animate-pulse">
                        {isIconic ? '💎' : '👑'}
                      </span>
                    </div>
                  );
                }
                return (
                  <motion.div
                    key={`fwd-card-${idx}`}
                    initial={{ scale: 0.5, y: 35, opacity: 0.2 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{
                      delay: idx * 0.05,
                      type: 'spring',
                      stiffness: 280,
                      damping: 18,
                    }}
                    className="w-20 sm:w-28 md:w-36 h-32 sm:h-44 md:h-56 rounded-2xl relative shadow-2xl"
                  >
                    <PixelCardBackSprite index={idx} beaconTier={card.tier} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5A: LEGENDARY SUSPENSE & 32-BIT GOLDEN REVEAL SPECTACLE */}
        {/* ========================================================================= */}
        {stage === 'legendary_suspense' && (
          <PixelLegendarySuspenseAndReveal
            card={cards[legendaryIndices[currentLegendarySeqIndex]]}
            isFirst={currentLegendarySeqIndex === 0}
            onRevealComplete={() => {
              const currentIdx = legendaryIndices[currentLegendarySeqIndex];
              if (currentIdx !== undefined) {
                onRevealCard(currentIdx);
              }
              setStage('legendary_hero_moment');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* STAGE 5B: LEGENDARY HERO MOMENT */}
        {/* ========================================================================= */}
        {stage === 'legendary_hero_moment' && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 select-none">
            <PixelLegendaryHeroCard
              card={cards[legendaryIndices[currentLegendarySeqIndex]]}
              remainingCount={
                legendaryIndices.length - 1 - currentLegendarySeqIndex + iconicIndices.length
              }
              collection={collection}
              onProceed={handleProceedFromLegendaryHeroMoment}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5C: ICONIC SUSPENSE & 32-BIT SPECTACLE REVEAL */}
        {/* ========================================================================= */}
        {stage === 'iconic_suspense' && (
          <PixelIconicSuspenseAndReveal
            card={cards[iconicIndices[currentIconicSeqIndex]]}
            isFirst={currentIconicSeqIndex === 0}
            onRevealComplete={() => {
              const currentIdx = iconicIndices[currentIconicSeqIndex];
              if (currentIdx !== undefined) {
                onRevealCard(currentIdx);
              }
              setStage('iconic_hero_moment');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* STAGE 6: ICONIC HERO MOMENT */}
        {/* ========================================================================= */}
        {stage === 'iconic_hero_moment' && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 select-none">
            <PixelIconicHeroCard
              card={cards[iconicIndices[currentIconicSeqIndex]]}
              remainingCount={iconicIndices.length - 1 - currentIconicSeqIndex}
              collection={collection}
              onProceed={handleProceedFromHeroMoment}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* SPECIAL: ALL-ICONIC GOD PACK (5/5 ICONICS) */}
        {/* ========================================================================= */}
        {stage === 'multi_iconic_special' && (
          <PixelGodPackSequence
            cards={cards}
            onProceed={() => setStage('final_interface')}
          />
        )}

        {/* ========================================================================= */}
        {/* STAGE 7: 32-BIT PIXEL FINAL CARD CAROUSEL (ICONICS FIRST, HORIZONTAL LOOP) */}
        {/* ========================================================================= */}
        {stage === 'final_interface' && (
          <PixelFinalCardCarousel
            pack={pack}
            cards={cards}
            collection={collection}
            credits={credits}
            onConfirm={onDone}
            onOpenAnother={onOpenAnother}
            onViewCollection={onViewCollection}
            onInspectCardExternal={onInspectCard}
          />
        )}
      </main>
    </div>
  );
};
