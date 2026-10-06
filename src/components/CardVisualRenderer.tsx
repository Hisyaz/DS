import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getPotentialBonusColor } from '../utils/potentialSystem';
import { isHighQualityModeActive } from '../utils/graphicSettingsSystem';
import {
  Sparkles,
  Zap,
  Shield,
  Target,
  Trophy,
  Award,
  Users,
  AlertTriangle,
  Skull,
  ShieldAlert,
  XCircle,
  Split,
  CheckCircle2,
  Crown,
  Flame,
  Star,
  Coins,
  Building,
  Video,
  Brain,
  Footprints,
  Compass,
  Clock,
  UserX,
  CloudRain,
  Activity,
  Lock,
  Eye,
  Crosshair,
  Sword,
  HeartHandshake,
  Briefcase,
  Layers,
  Heart,
  Timer,
  Hourglass,
  Gauge,
  Smile,
  Megaphone,
} from 'lucide-react';
import { CardTierRevealAnimation } from './CardTierRevealAnimation';
import { OutsideFootBallIcon } from './OutsideFootBallIcon';
import { translateCardEffect } from '../utils/cardEffectTranslator';
import { getLocalizedCardDescription, getLocalizedCardName } from '../utils/cardTranslationsDatabase';

export type CardFamily =
  | 'youth'
  | 'street'
  | 'career'
  | 'lifestyle'
  | 'sponsor'
  | 'manager'
  | 'parent'
  | 'life'
  | 'parents'
  | 'agent'
  | 'match_day'
  | 'interview';

export type CardSubclass = 'development' | 'setback' | 'double_edged' | 'parent';

export type DevelopmentTier = 'Bronze' | 'Silver' | 'Gold' | 'Legendary' | 'Iconic';
export type NegativeTier = 'Scrap' | 'Rust' | 'Ash' | 'Disaster';
export type DoubleEdgedTier = 'Obsidian Knife' | 'Copper Dagger' | 'Steel Blade' | 'Muramasa Blade';

export type UniversalCardCategory =
  | 'positive'
  | 'negative'
  | 'double_edged'
  | 'iconic'
  | 'parent'
  | 'temporal'
  | 'temporal_positive'
  | 'temporal_negative'
  | 'temporal_double_edged';

export type UniversalCardRarity = string;
export type CardDurationType = 'none' | '6_months' | '1_year' | '6m' | '1y' | string;

export interface CardVisualRendererProps {
  name: string;
  categoryType?: UniversalCardCategory | string;
  subclass?: CardSubclass;
  cardFamily?: CardFamily | string;
  categoryLabel?: string;
  rarity?: UniversalCardRarity;
  tier?: UniversalCardRarity;
  effectCategory?: 'positive' | 'negative' | 'double_edged' | 'temporal' | string;
  temporalSubtype?: 'temporal_positive' | 'temporal_negative' | 'temporal_double_edged' | string;
  isTemporal?: boolean;
  duration?: CardDurationType;
  description?: string;
  effectDescriptions?: string[];
  iconName?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  selectButtonText?: string;
  index?: number;
  subTitle?: string;
  badgeTextOverride?: string;
  parentPotentialBonus?: number;
  isNewCardGuaranteed?: boolean;
  disableRevealAnimation?: boolean;
  cardId?: string;
  card?: any;
  className?: string;
}

const HIGHLIGHT_REGEX = /([+-]?€?\$?[\d,]+%?|\b\d+x\b|\b[+-]\d+\s*(?:OVR|PAC|SHO|PAS|DRI|DEF|PHY|Rating|Fame|Stamina|Fitness|Weeks?|Months?|Years?)\b|\b\d+★\b)/gi;

/**
 * Helper to render highlighted effect text with bold, high-contrast big numbers for instant readability
 */
export const renderHighlightedEffectText = (text: string) => {
  if (!text) return null;
  const parts = text.split(HIGHLIGHT_REGEX);

  return (
    <span className="inline leading-relaxed">
      {parts.map((part, pIdx) => {
        if (!part) return null;
        const isMatch = part.match(HIGHLIGHT_REGEX);

        if (isMatch) {
          const isNegative =
            part.startsWith('-') ||
            part.includes('Penalty') ||
            part.includes('Loss') ||
            part.includes('Injury') ||
            part.includes('Penalización') ||
            part.includes('Pérdida') ||
            part.includes('Lesión');
          const isPositive =
            part.startsWith('+') ||
            part.includes('Bonus') ||
            part.includes('Gain') ||
            part.includes('★') ||
            part.includes('Mejora') ||
            part.includes('Aumento') ||
            part.includes('Libres');

          if (isNegative) {
            return (
              <span
                key={pIdx}
                className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md text-xs sm:text-sm font-black font-mono text-rose-300 bg-rose-950/90 border border-rose-500/50 shadow-sm"
              >
                {part}
              </span>
            );
          }

          if (isPositive) {
            if (part.includes('★')) {
              return (
                <span
                  key={pIdx}
                  className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md text-xs sm:text-sm font-black font-mono text-amber-200 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 border border-amber-300 shadow-md animate-pulse"
                >
                  {part}
                </span>
              );
            }

            return (
              <span
                key={pIdx}
                className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md text-xs sm:text-sm font-black font-mono text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 shadow-sm"
              >
                {part}
              </span>
            );
          }

          return (
            <span
              key={pIdx}
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md text-xs sm:text-sm font-black font-mono text-amber-300 bg-amber-950/90 border border-amber-500/50 shadow-sm"
            >
              {part}
            </span>
          );
        }

        return <span key={pIdx}>{part}</span>;
      })}
    </span>
  );
};

const CardVisualRendererComponent: React.FC<CardVisualRendererProps> = ({
  name,
  categoryType,
  subclass: explicitSubclass,
  cardFamily = 'career',
  categoryLabel,
  rarity = 'Bronze',
  tier,
  effectCategory,
  temporalSubtype,
  isTemporal: explicitIsTemporal,
  duration,
  description,
  effectDescriptions = [],
  iconName,
  isSelected = false,
  onSelect,
  selectButtonText,
  index = 0,
  subTitle,
  badgeTextOverride,
  parentPotentialBonus,
  isNewCardGuaranteed,
  disableRevealAnimation = false,
  cardId,
  card,
  className = '',
}) => {
  const { t, currentLanguage } = useLanguage();
  const effectiveSelectButtonText = selectButtonText || (isSelected ? t('CARD_BTN_SELECTED') : t('CARD_BTN_SELECT'));
  const targetCardEntity = card || (cardId ? { id: cardId } : undefined);
  const displayName = getLocalizedCardName(name, targetCardEntity, currentLanguage) || (name ? t(name) : '');
  const displayDescription = getLocalizedCardDescription(description, targetCardEntity, currentLanguage) || (description ? t(description) : '');
  const rawRarity = (tier || rarity || 'Bronze').toString();
  const normalizedRarityLower = rawRarity.toLowerCase().replace(/_/g, ' ');
  const potBonusColor = parentPotentialBonus !== undefined ? getPotentialBonusColor(parentPotentialBonus) : null;

  const renderNewCardGuaranteeBadge = () => {
    if (!isNewCardGuaranteed) return null;
    return (
      <div className="z-20 flex items-center justify-between px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/25 via-yellow-400/35 to-amber-500/25 border border-yellow-400/80 text-yellow-300 text-xs font-black shadow-[0_0_12px_rgba(250,204,21,0.4)] animate-pulse">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          <span className="tracking-wide uppercase font-black text-[11px]">NEW CARD GUARANTEED</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950 font-black uppercase tracking-wider">
          PRIORITY
        </span>
      </div>
    );
  };

  // Normalized Card Family
  const normalizedFamily = (cardFamily || '').toLowerCase();
  const resolvedFamily: CardFamily =
    normalizedFamily.includes('youth')
      ? 'youth'
      : normalizedFamily.includes('street')
      ? 'street'
      : normalizedFamily.includes('life')
      ? 'lifestyle'
      : normalizedFamily.includes('sponsor')
      ? 'sponsor'
      : normalizedFamily.includes('manager') || normalizedFamily.includes('agent')
      ? 'manager'
      : normalizedFamily.includes('parent')
      ? 'parent'
      : 'career';

  // Check Temporal Status & Duration
  const isTemporal =
    Boolean(explicitIsTemporal) ||
    Boolean(duration && duration !== 'none') ||
    Boolean(temporalSubtype) ||
    categoryType === 'temporal' ||
    categoryType === 'temporal_positive' ||
    categoryType === 'temporal_negative' ||
    categoryType === 'temporal_double_edged' ||
    effectCategory === 'temporal';

  const normalizedDuration = (duration || '').toString().toLowerCase();
  const displayDurationLabel =
    normalizedDuration.includes('6') || normalizedDuration.includes('6m') || normalizedDuration.includes('6_months')
      ? t('CARD_DURATION_6_MONTHS') || 'Duration: 6 Months'
      : normalizedDuration.includes('1') || normalizedDuration.includes('1y') || normalizedDuration.includes('1_year') || isTemporal
      ? t('CARD_DURATION_1_YEAR') || 'Duration: 1 Year'
      : null;

  // 1. DETERMINE SUBCLASS (Effect Category)
  let resolvedSubclass: CardSubclass = 'development';
  if (explicitSubclass) {
    resolvedSubclass = explicitSubclass;
  } else if (resolvedFamily === 'parent' || categoryType === 'parent') {
    resolvedSubclass = 'parent';
  } else if (
    effectCategory === 'negative' ||
    categoryType === 'negative' ||
    categoryType === 'temporal_negative' ||
    temporalSubtype === 'temporal_negative' ||
    normalizedRarityLower.includes('scrap') ||
    normalizedRarityLower.includes('rust') ||
    normalizedRarityLower.includes('ash') ||
    normalizedRarityLower.includes('disaster')
  ) {
    resolvedSubclass = 'setback';
  } else if (
    effectCategory === 'double_edged' ||
    categoryType === 'double_edged' ||
    categoryType === 'temporal_double_edged' ||
    temporalSubtype === 'temporal_double_edged' ||
    normalizedRarityLower.includes('obsidian') ||
    normalizedRarityLower.includes('copper dagger') ||
    normalizedRarityLower.includes('copper knife') ||
    normalizedRarityLower.includes('stone dagger') ||
    normalizedRarityLower.includes('steel blade') ||
    normalizedRarityLower.includes('steel sword') ||
    normalizedRarityLower.includes('muramasa')
  ) {
    resolvedSubclass = 'double_edged';
  } else {
    resolvedSubclass = 'development';
  }

  const isStatBreak =
    name === 'New Ways to Play' ||
    name === 'Football Idol' ||
    name === 'Training Discovery' ||
    effectDescriptions.some((e) => e.includes('STAT BREAK') || e.includes('100 (Historic'));

  const isIconic =
    isStatBreak ||
    normalizedRarityLower === 'iconic' ||
    categoryType === 'iconic' ||
    badgeTextOverride?.toLowerCase().includes('iconic');

  // 2. RESOLVE DISPLAY TIER & BADGE CONFIG PER SUBCLASS
  const getSubclassTierConfig = () => {
    // --- 🟢 POSITIVE / DEVELOPMENT SUBCLASS & PARENT CARDS ---
    if (resolvedSubclass === 'development' || resolvedSubclass === 'parent') {
      if (isStatBreak) {
        return {
          tierName: 'Stat Break',
          displayBadge: '🌟 STAT BREAK',
          badgeStyle:
            'bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 text-slate-950 font-black border-yellow-100 shadow-[0_0_24px_rgba(250,204,21,1)] animate-pulse',
          frameStyle:
            'border-yellow-300 bg-gradient-to-b from-yellow-950/90 via-black to-amber-950 shadow-[0_0_50px_rgba(250,204,21,0.7)] ring-2 ring-yellow-400',
          badgeSubclassTag: '🌟 ICONIC CAREER',
          iconSymbol: '🌟',
        };
      }
      if (isIconic) {
        return {
          tierName: 'Iconic',
          displayBadge: '⭐ ICONIC',
          badgeStyle:
            'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-slate-950 font-black border-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.9)] animate-pulse',
          frameStyle:
            'border-amber-300/90 bg-gradient-to-b from-black via-amber-950/80 to-black shadow-[0_0_40px_rgba(251,191,36,0.55)] ring-2 ring-amber-300/60',
          badgeSubclassTag: '🟢 POSITIVE',
          iconSymbol: '⭐',
        };
      }
      if (normalizedRarityLower.includes('legendary') || normalizedRarityLower.includes('tier 4') || normalizedRarityLower === 'goat') {
        return {
          tierName: 'Legendary',
          displayBadge: '👑 LEGENDARY',
          badgeStyle:
            'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black border-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.7)]',
          frameStyle:
            'border-amber-400 bg-gradient-to-b from-black via-zinc-950 to-black shadow-[0_0_35px_rgba(245,158,11,0.55)] ring-2 ring-amber-400/60',
          badgeSubclassTag: '🟢 POSITIVE',
          iconSymbol: '👑',
        };
      }
      if (normalizedRarityLower.includes('gold') || normalizedRarityLower.includes('tier 3') || normalizedRarityLower === 'epic') {
        return {
          tierName: 'Gold',
          displayBadge: '🥇 GOLD',
          badgeStyle: 'bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 text-amber-950 border-yellow-200 font-black shadow-[0_0_16px_rgba(250,204,21,0.6)]',
          frameStyle:
            'border-yellow-400 border-2 bg-gradient-to-b from-yellow-950/95 via-amber-950/90 to-stone-950 shadow-[0_0_32px_rgba(234,179,8,0.55)] ring-2 ring-yellow-400/70',
          badgeSubclassTag: '🟢 POSITIVE',
          iconSymbol: '🥇',
        };
      }
      if (normalizedRarityLower.includes('silver') || normalizedRarityLower.includes('tier 2') || normalizedRarityLower === 'rare') {
        return {
          tierName: 'Silver',
          displayBadge: '🥈 SILVER',
          badgeStyle: 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-950 border-slate-100 font-black shadow-md',
          frameStyle:
            'border-slate-300 border-2 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_0_22px_rgba(203,213,225,0.35)] ring-1 ring-slate-300/40',
          badgeSubclassTag: '🟢 POSITIVE',
          iconSymbol: '🥈',
        };
      }
      // Bronze / default Positive (Tier 1) - clearly bronze metallic appearance with copper/brown bronze tones
      return {
        tierName: 'Bronze',
        displayBadge: '🥉 BRONZE',
        badgeStyle: 'bg-gradient-to-r from-[#8c4820] via-[#b87333] to-[#6e3515] text-[#ffeedd] border-[#cd7f32] font-black shadow-[0_0_12px_rgba(184,115,51,0.4)]',
        frameStyle:
          'border-[#b87333] border-2 bg-gradient-to-b from-[#3d2012] via-[#24130b] to-[#120905] shadow-[0_0_24px_rgba(184,115,51,0.35)] ring-1 ring-[#cd7f32]/50',
        badgeSubclassTag: '🟢 POSITIVE',
        iconSymbol: '🥉',
      };
    }

    // --- 🔴 NEGATIVE / SETBACK SUBCLASS (Scrap, Rust, Ash, Disaster) ---
    if (resolvedSubclass === 'setback') {
      // Tier 4: Disaster (Deep crimson flame appearance, bright green borders, clearly dangerous and destructive)
      if (
        normalizedRarityLower.includes('disaster') ||
        normalizedRarityLower.includes('tier 4') ||
        normalizedRarityLower.includes('legendary') ||
        normalizedRarityLower === 'goat'
      ) {
        return {
          tierName: 'Disaster',
          displayBadge: '☠️ DISASTER',
          badgeStyle:
            'bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 text-emerald-300 border-emerald-400 font-black tracking-wider animate-pulse shadow-[0_0_16px_rgba(34,197,94,0.5)]',
          frameStyle:
            'border-emerald-400 border-2 bg-gradient-to-b from-red-950 via-rose-950 to-black shadow-[0_0_35px_rgba(225,29,72,0.8)] ring-2 ring-emerald-400/80',
          badgeSubclassTag: '🔴 NEGATIVE',
          iconSymbol: '☠️',
        };
      }
      // Tier 3: Ash (Burnt black body, fire-red borders, orange glowing/burning details)
      if (
        normalizedRarityLower.includes('ash') ||
        normalizedRarityLower.includes('tier 3') ||
        normalizedRarityLower.includes('gold') ||
        normalizedRarityLower === 'epic'
      ) {
        return {
          tierName: 'Ash',
          displayBadge: '🔥 ASH',
          badgeStyle: 'bg-gradient-to-r from-black via-red-700 to-black text-red-100 border-red-500 font-black shadow-[0_0_15px_rgba(239,68,68,0.7)]',
          frameStyle:
            'border-red-600 border-2 bg-gradient-to-b from-black via-red-950 to-stone-950 shadow-[0_0_30px_rgba(220,38,38,0.6)] ring-1 ring-red-500/70',
          badgeSubclassTag: '🔴 NEGATIVE',
          iconSymbol: '🔥',
        };
      }
      // Tier 2: Rust (Grey iron base, brown-orange rust-colored borders, corroded metallic texture)
      if (
        normalizedRarityLower.includes('rust') ||
        normalizedRarityLower.includes('tier 2') ||
        normalizedRarityLower.includes('silver') ||
        normalizedRarityLower === 'rare'
      ) {
        return {
          tierName: 'Rust',
          displayBadge: '⚙️ RUST',
          badgeStyle: 'bg-gradient-to-r from-stone-600 via-amber-900 to-stone-700 text-amber-200 border-amber-800 font-black shadow',
          frameStyle:
            'border-amber-800 border-[3px] bg-gradient-to-b from-stone-700 via-zinc-800 to-stone-800 shadow-[0_0_24px_rgba(120,53,15,0.5)] ring-1 ring-amber-800/80',
          badgeSubclassTag: '🔴 NEGATIVE',
          iconSymbol: '⚙️',
        };
      }
      // Tier 1: Scrap (Dark stone-like material, silver shine, rough damaged texture)
      return {
        tierName: 'Scrap',
        displayBadge: '🗑️ SCRAP',
        badgeStyle: 'bg-gradient-to-r from-stone-800 via-slate-400 to-stone-800 text-slate-950 border-slate-200 font-black shadow-[0_0_12px_rgba(203,213,225,0.5)]',
        frameStyle:
          'border-slate-300 border-2 bg-gradient-to-b from-stone-900 via-zinc-900 to-slate-900 shadow-[0_0_22px_rgba(203,213,225,0.45)] ring-1 ring-slate-300/60',
        badgeSubclassTag: '🔴 NEGATIVE',
        iconSymbol: '🗑️',
      };
    }

    // --- ⚔️ DOUBLE-EDGED SUBCLASS (Obsidian Knife, Copper Dagger, Steel Blade, Muramasa Blade) ---
    if (resolvedSubclass === 'double_edged') {
      // Tier 4: Muramasa Blade (Shiny purple metallic/blade texture, bright green border, extremely powerful and dangerous)
      if (
        normalizedRarityLower.includes('muramasa') ||
        normalizedRarityLower.includes('tier 4') ||
        normalizedRarityLower.includes('legendary') ||
        normalizedRarityLower === 'goat'
      ) {
        return {
          tierName: 'Muramasa Blade',
          displayBadge: '👹🗡️ MURAMASA BLADE',
          badgeStyle:
            'bg-gradient-to-r from-purple-900 via-fuchsia-700 to-purple-950 text-emerald-300 border-emerald-400 font-black shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-pulse',
          frameStyle:
            'border-emerald-400 border-2 bg-gradient-to-b from-purple-950 via-fuchsia-950 to-indigo-950 shadow-[0_0_35px_rgba(52,211,153,0.55)] ring-2 ring-emerald-400/80',
          badgeSubclassTag: '⚔️ DOUBLE-EDGED',
          iconSymbol: '👹🗡️',
          bladeIcon: 'katana',
        };
      }
      // Tier 3: Steel Blade (Bright silver steel, white shiny border, highly polished blade appearance)
      if (
        normalizedRarityLower.includes('steel') ||
        normalizedRarityLower.includes('sword') ||
        normalizedRarityLower.includes('tier 3') ||
        normalizedRarityLower.includes('gold') ||
        normalizedRarityLower === 'epic'
      ) {
        return {
          tierName: 'Steel Blade',
          displayBadge: '⚔️ STEEL BLADE',
          badgeStyle: 'bg-gradient-to-r from-slate-200 via-white to-slate-300 text-black border-2 border-white font-black shadow-md',
          frameStyle:
            'border-white border-2 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 text-slate-950 shadow-[0_0_25px_rgba(255,255,255,0.45)] ring-1 ring-slate-100',
          badgeSubclassTag: '⚔️ DOUBLE-EDGED',
          iconSymbol: '⚔️',
          bladeIcon: 'sword',
        };
      }
      // Tier 2: Copper Dagger (Warm metallic copper, bright polished copper border, distinct dagger styling)
      if (
        normalizedRarityLower.includes('copper') ||
        normalizedRarityLower.includes('dagger') ||
        normalizedRarityLower.includes('knife') ||
        normalizedRarityLower.includes('tier 2') ||
        normalizedRarityLower.includes('silver') ||
        normalizedRarityLower === 'rare'
      ) {
        return {
          tierName: 'Copper Dagger',
          displayBadge: '🥉🗡️ COPPER DAGGER',
          badgeStyle: 'bg-gradient-to-r from-orange-700 via-amber-600 to-orange-800 text-amber-100 border-orange-400 font-black shadow',
          frameStyle:
            'border-orange-500 border-2 bg-gradient-to-b from-orange-900 via-amber-900 to-orange-950 shadow-[0_0_24px_rgba(234,88,12,0.45)] ring-1 ring-orange-500/60',
          badgeSubclassTag: '⚔️ DOUBLE-EDGED',
          iconSymbol: '🥉🗡️',
          bladeIcon: 'dagger',
        };
      }
      // Tier 1: Obsidian Knife (Volcanic dark glass, purple edge, sharp obsidian appearance)
      return {
        tierName: 'Obsidian Knife',
        displayBadge: '🗡️ OBSIDIAN KNIFE',
        badgeStyle: 'bg-gradient-to-r from-stone-900 via-purple-950 to-black text-purple-200 border-purple-500 font-black shadow',
        frameStyle:
          'border-purple-500 border-2 bg-gradient-to-b from-stone-950 via-neutral-900 to-black shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-purple-500/60',
        badgeSubclassTag: '⚔️ DOUBLE-EDGED',
        iconSymbol: '🗡️',
        bladeIcon: 'knife',
      };
    }

    return {
      tierName: 'Bronze',
      displayBadge: '🥉 BRONZE',
      badgeStyle: 'bg-amber-900/60 text-amber-200 border-amber-700 font-bold',
      frameStyle: 'border-amber-700/80 bg-gradient-to-b from-amber-900/90 via-stone-900 to-amber-950 shadow-[0_0_20px_rgba(180,83,9,0.35)]',
      badgeSubclassTag: '🟢 POSITIVE',
      iconSymbol: '🥉',
    };
  };

  const tierConfig = getSubclassTierConfig();

  // Category Icon Resolver
  const renderCardIcon = () => {
    if (iconName) {
      switch (iconName) {
        case 'Flame': return <Flame className="w-5 h-5 text-amber-400" />;
        case 'Coins': return <Coins className="w-5 h-5 text-emerald-400" />;
        case 'Building': return <Building className="w-5 h-5 text-blue-400" />;
        case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
        case 'Video': return <Video className="w-5 h-5 text-purple-400" />;
        case 'Trophy': return <Trophy className="w-5 h-5 text-amber-300" />;
        case 'Brain': return <Brain className="w-5 h-5 text-indigo-400" />;
        case 'Footprints': return <Footprints className="w-5 h-5 text-orange-400" />;
        case 'Compass': return <Compass className="w-5 h-5 text-teal-400" />;
        case 'Crown': return <Crown className="w-5 h-5 text-cyan-400" />;
        case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
        case 'Clock': return <Clock className="w-5 h-5 text-slate-400" />;
        case 'XCircle': return <XCircle className="w-5 h-5 text-red-400" />;
        case 'UserX': return <UserX className="w-5 h-5 text-gray-400" />;
        case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'Skull': return <Skull className="w-5 h-5 text-rose-500" />;
        case 'CloudRain': return <CloudRain className="w-5 h-5 text-sky-400" />;
        case 'Split': return <Split className="w-5 h-5 text-violet-400" />;
        case 'Activity': return <Activity className="w-5 h-5 text-pink-400" />;
        case 'Shield': return <Shield className="w-5 h-5 text-amber-400" />;
        case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-300" />;
        case 'Target': return <Target className="w-5 h-5 text-orange-400" />;
        case 'Lock': return <Lock className="w-5 h-5 text-emerald-400" />;
        case 'Eye': return <Eye className="w-5 h-5 text-amber-300" />;
        case 'Heart': return <Heart className="w-5 h-5 text-rose-400" />;
        case 'Briefcase': return <Briefcase className="w-5 h-5 text-amber-300" />;
        case 'Users': return <Users className="w-5 h-5 text-blue-400" />;
        case 'Smile': return <Smile className="w-5 h-5 text-fuchsia-400" />;
        case 'Megaphone': return <Megaphone className="w-5 h-5 text-amber-400" />;
        case 'OutsideFoot':
        case 'outside_foot':
        case 'Trivela':
        case 'trivela':
          return <OutsideFootBallIcon className="w-5 h-5 text-amber-300" />;
      }
    }

    if (resolvedFamily === 'youth') return <Award className="w-5 h-5 text-emerald-400" />;
    if (resolvedFamily === 'street') return <Flame className="w-5 h-5 text-orange-400" />;
    if (resolvedFamily === 'lifestyle') return <Sparkles className="w-5 h-5 text-purple-300" />;
    if (resolvedFamily === 'sponsor') return <Briefcase className="w-5 h-5 text-yellow-400" />;
    if (resolvedFamily === 'manager') return <Brain className="w-5 h-5 text-cyan-400" />;
    if (resolvedFamily === 'parent') return <HeartHandshake className="w-5 h-5 text-rose-400" />;
    if (resolvedSubclass === 'setback') return <Skull className="w-5 h-5 text-rose-400" />;
    if (resolvedSubclass === 'double_edged') return <Crosshair className="w-5 h-5 text-amber-400" />;
    if (isIconic) return <Crown className="w-5 h-5 text-amber-300" />;
    return <Zap className="w-5 h-5 text-emerald-400" />;
  };

  // Card Family Watermark & Design Motifs
  const renderFamilyWatermark = () => {
    switch (resolvedFamily) {
      case 'youth':
        return (
          <div className="absolute right-2 bottom-2 text-emerald-400/10 pointer-events-none select-none text-6xl font-black">
            ⚽
          </div>
        );
      case 'street':
        return (
          <div className="absolute right-2 bottom-2 text-amber-400/10 pointer-events-none select-none text-6xl font-black">
            🔥
          </div>
        );
      case 'career':
        return (
          <div className="absolute right-2 bottom-2 text-amber-300/10 pointer-events-none select-none text-6xl font-black">
            🏆
          </div>
        );
      case 'lifestyle':
        return (
          <div className="absolute right-2 bottom-2 text-purple-400/10 pointer-events-none select-none text-6xl font-black">
            💎
          </div>
        );
      case 'sponsor':
        return (
          <div className="absolute right-2 bottom-2 text-yellow-400/10 pointer-events-none select-none text-6xl font-black">
            💼
          </div>
        );
      case 'manager':
        return (
          <div className="absolute right-2 bottom-2 text-cyan-400/10 pointer-events-none select-none text-6xl font-black">
            📋
          </div>
        );
      case 'parent':
        return (
          <div className="absolute right-2 bottom-2 text-rose-400/10 pointer-events-none select-none text-6xl font-black">
            ❤️
          </div>
        );
      default:
        return null;
    }
  };

  // Card Family Pill Header Label
  const getFamilyDisplayName = () => {
    switch (resolvedFamily) {
      case 'youth': return 'YOUTH ACADEMY';
      case 'street': return 'STREET';
      case 'career': return 'CAREER';
      case 'lifestyle': return 'LIFESTYLE';
      case 'sponsor': return 'SPONSOR';
      case 'manager': return 'AGENT';
      case 'parent': return 'PARENT';
      default: return 'CAREER';
    }
  };

  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHighQualityModeActive()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 14, y: -y * 14 });
  };

  const handleMouseLeave = () => {
    if (tilt !== null) setTilt(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isHighQualityModeActive() || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 14, y: -y * 14 });
  };

  const handleTouchEnd = () => {
    if (tilt !== null) setTilt(null);
  };

  const isHoloEligible =
    Boolean(isIconic) ||
    ['Silver', 'Gold', 'Legendary', 'GOAT', 'Disaster', 'Ash', 'Muramasa Blade', 'Steel Blade'].includes(
      tierConfig.tierName
    ) ||
    normalizedRarityLower.includes('silver') ||
    normalizedRarityLower.includes('gold') ||
    normalizedRarityLower.includes('legend') ||
    normalizedRarityLower.includes('iconic') ||
    normalizedRarityLower.includes('epic') ||
    normalizedRarityLower.includes('rare');

  const tiltStyle = tilt
    ? {
        perspective: '1000px',
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale3d(1.03, 1.03, 1.03)`,
      }
    : undefined;

  const animationDelayStyle = { animationDelay: `${index * 100}ms` };

  // =========================================================================
  // 🔴 SETBACK SUBCLASS RENDER (Scrap, Rust, Ash, Disaster)
  // =========================================================================
  if (resolvedSubclass === 'setback') {
    const isDisaster = tierConfig.tierName === 'Disaster';
    const isAsh = tierConfig.tierName === 'Ash';
    const isRust = tierConfig.tierName === 'Rust';
    const isScrap = tierConfig.tierName === 'Scrap';

    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ ...animationDelayStyle, ...tiltStyle }}
        className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden animate-in fade-in zoom-in-95 card-3d-tilt ${
          tierConfig.frameStyle
        } ${
          isTemporal
            ? 'opacity-90 saturate-[0.82] backdrop-blur-md bg-opacity-70 border-dashed ring-2 ring-sky-400/50'
            : ''
        } ${
          isSelected
            ? isDisaster
              ? 'ring-4 ring-emerald-400 scale-[1.02] shadow-[0_0_30px_rgba(34,197,94,0.6)]'
              : 'ring-4 ring-rose-500 scale-[1.02] shadow-2xl shadow-rose-600/40'
            : 'hover:border-rose-400/80'
        } ${className}`}
      >
        {/* HOLOGRAPHIC FOIL SHIMMER LAYER (High Quality Mode) */}
        {isHighQualityModeActive() && isHoloEligible && <div className="holo-foil-shimmer" />}
        {/* REVEAL ANIMATION LAYER */}
        {!disableRevealAnimation && (
          <CardTierRevealAnimation
            tierName={tierConfig.tierName}
            subclass={resolvedSubclass}
            isIconic={isIconic}
            isStatBreak={isStatBreak}
            triggerKey={`${name}-${index}-${isSelected ? '1' : '0'}`}
          />
        )}

        {/* TEXTURE OVERLAYS PER TIER */}
        {isDisaster && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950 via-slate-950 to-black pointer-events-none opacity-90" />
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-rose-600 to-emerald-400 animate-pulse" />
            <div className="absolute bottom-2 right-2 text-emerald-400/20 text-4xl font-black pointer-events-none select-none">
              ☠️
            </div>
          </>
        )}

        {isAsh && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-neutral-900/80 via-stone-950 to-black pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 pointer-events-none" />
            <div className="absolute bottom-2 right-2 text-red-500/15 text-4xl font-black pointer-events-none select-none">
              🔥
            </div>
          </>
        )}

        {isRust && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-stone-950 to-black pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-1 bg-amber-800/80 pointer-events-none" />
            <div className="absolute bottom-2 right-2 text-amber-700/20 text-4xl font-black pointer-events-none select-none">
              ⚙️
            </div>
          </>
        )}

        {isScrap && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-stone-800/40 via-stone-950 to-black pointer-events-none" />
            <div className="absolute top-0 inset-x-0 h-1 bg-slate-400/60 pointer-events-none" />
            <div className="absolute bottom-2 right-2 text-slate-400/15 text-4xl font-black pointer-events-none select-none">
              🗑️
            </div>
          </>
        )}

        {renderFamilyWatermark()}

        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-2 z-10">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-950/90 text-rose-300 border border-rose-600/70 flex items-center gap-1 shadow-md">
            <span>🔴</span>
            <span>{categoryLabel ? t(categoryLabel) : getFamilyDisplayName()}</span>
          </span>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] uppercase flex items-center gap-1 border ${tierConfig.badgeStyle}`}
          >
            <span>{tierConfig.iconSymbol}</span>
            <span>{tierConfig.displayBadge}</span>
          </span>
        </div>

        {/* NEW CARD GUARANTEE BADGE */}
        {renderNewCardGuaranteeBadge()}

        {/* TEMPORAL DURATION BADGE */}
        {isTemporal && displayDurationLabel && (
          <div className="z-10 flex items-center justify-between px-3 py-1.5 rounded-lg bg-sky-950/80 border border-sky-400/60 text-sky-200 text-xs font-black shadow-inner animate-pulse">
            <div className="flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5 text-sky-400" />
              <span className="tracking-wide uppercase font-mono">{displayDurationLabel}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 uppercase">{t('CARD_TAG_TEMPORARY')}</span>
          </div>
        )}

        {/* CARD TITLE & DESCRIPTION */}
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border shadow-inner ${isDisaster ? 'bg-rose-950 border-emerald-500/60 text-emerald-400' : 'bg-stone-950 border-rose-500/50 text-rose-400'}`}>
              {renderCardIcon()}
            </div>
            <div>
              <h3 className={`text-base sm:text-lg font-black leading-tight drop-shadow-md ${isDisaster ? 'text-rose-200' : 'text-slate-100'}`}>
                {displayName}
              </h3>
              {subTitle && (
                <span className="text-[10px] text-rose-400/80 font-semibold block">{t(subTitle)}</span>
              )}
            </div>
          </div>

          <p className="text-xs text-stone-200 leading-relaxed font-medium bg-black/60 p-3 rounded-xl border border-rose-500/20 backdrop-blur-sm">
            {displayDescription}
          </p>
        </div>

        {/* EFFECTS BREAKDOWN (SETBACK PENALTIES) */}
        {effectDescriptions.length > 0 && (
          <div className={`backdrop-blur-md p-3 rounded-xl border space-y-1.5 z-10 ${isDisaster ? 'bg-rose-950/80 border-emerald-500/50' : 'bg-black/70 border-rose-900/60'}`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block border-b pb-1 flex items-center gap-1 ${isDisaster ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-300 border-rose-900/40'}`}>
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              {t('CARD_SETBACK_PENALTIES')} ({tierConfig.tierName.toUpperCase()}):
            </span>
            {effectDescriptions.map((eff, i) => (
              <div key={i} className="text-xs text-rose-200 font-bold flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{renderHighlightedEffectText(translateCardEffect(eff) || t(eff))}</div>
              </div>
            ))}
          </div>
        )}

        {/* SELECT BUTTON */}
        {onSelect && (
          <button
            onClick={onSelect}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 z-10 ${
              isDisaster
                ? 'bg-gradient-to-r from-rose-800 via-emerald-600 to-rose-900 hover:from-rose-700 hover:to-emerald-500 text-white border border-emerald-400/60'
                : 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 hover:from-rose-600 hover:to-red-500 text-white border border-rose-400/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>{t(effectiveSelectButtonText)}</span>
          </button>
        )}
      </div>
    );
  }

  // =========================================================================
  // ⚔️ DOUBLE-EDGED SUBCLASS RENDER (Obsidian Knife, Copper Dagger, Steel Blade, Muramasa Blade)
  // =========================================================================
  if (resolvedSubclass === 'double_edged') {
    const isTier4 = tierConfig.tierName === 'Muramasa Blade';
    const isTier3 = tierConfig.tierName === 'Steel Blade';
    const isTier2 = tierConfig.tierName === 'Copper Dagger';
    const isTier1 = tierConfig.tierName === 'Obsidian Knife';

    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ ...animationDelayStyle, ...tiltStyle }}
        className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden animate-in fade-in zoom-in-95 card-3d-tilt ${
          tierConfig.frameStyle
        } ${
          isTemporal
            ? 'opacity-90 saturate-[0.82] backdrop-blur-md bg-opacity-70 border-dashed ring-2 ring-sky-400/50'
            : ''
        } ${
          isSelected
            ? isTier4
              ? 'ring-4 ring-purple-400 scale-[1.02] shadow-[0_0_30px_rgba(168,85,247,0.6)]'
              : 'ring-4 ring-amber-400 scale-[1.02] shadow-2xl shadow-purple-500/30'
            : 'hover:border-purple-400/80'
        } ${className}`}
      >
        {/* HOLOGRAPHIC FOIL SHIMMER LAYER (High Quality Mode) */}
        {isHighQualityModeActive() && isHoloEligible && <div className="holo-foil-shimmer" />}
        {/* REVEAL ANIMATION LAYER */}
        {!disableRevealAnimation && (
          <CardTierRevealAnimation
            tierName={tierConfig.tierName}
            subclass={resolvedSubclass}
            isIconic={isIconic}
            isStatBreak={isStatBreak}
            triggerKey={`${name}-${index}-${isSelected ? '1' : '0'}`}
          />
        )}

        {/* SLASH MOTIFS */}
        {isTier4 && (
          <>
            <div className="absolute -right-3 top-1/6 w-4 h-32 bg-gradient-to-b from-purple-500 via-emerald-500 to-purple-950 -rotate-12 rounded-l-xl shadow-2xl border-l border-emerald-400/60 animate-pulse pointer-events-none" />
            <div className="absolute top-2 right-2 text-purple-300/40 text-xl font-black pointer-events-none">🗡️</div>
          </>
        )}

        {isTier3 && (
          <>
            <div className="absolute -right-2 top-1/4 w-3 h-24 bg-gradient-to-b from-white via-slate-300 to-slate-600 rotate-6 rounded-l-lg shadow-lg pointer-events-none" />
            <div className="absolute top-2 right-2 text-slate-300/40 text-xl font-black pointer-events-none">⚔️</div>
          </>
        )}

        {isTier2 && (
          <>
            <div className="absolute -right-1 top-1/3 w-2.5 h-16 bg-gradient-to-b from-orange-500 via-amber-700 to-orange-950 rotate-12 rounded-full shadow-md pointer-events-none" />
            <div className="absolute top-2 right-2 text-amber-400/40 text-xl font-black pointer-events-none">🗡️</div>
          </>
        )}

        {isTier1 && (
          <>
            <div className="absolute right-0 top-1/2 w-2 h-10 bg-purple-600/90 rounded-l-full shadow-sm pointer-events-none" />
            <div className="absolute top-2 right-2 text-purple-400/40 text-lg font-black pointer-events-none">🗡️</div>
          </>
        )}

        {renderFamilyWatermark()}

        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-2 z-10 pr-6">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-950/90 text-amber-300 border border-purple-500/60 flex items-center gap-1 shadow-md">
            <span>⚔️</span>
            <span>{categoryLabel ? t(categoryLabel) : getFamilyDisplayName()}</span>
          </span>

          <span
            className={`px-2.5 py-1 rounded-full text-[10px] uppercase flex items-center gap-1 border ${tierConfig.badgeStyle}`}
          >
            <span>{tierConfig.iconSymbol}</span>
            <span>{tierConfig.displayBadge}</span>
          </span>
        </div>

        {/* NEW CARD GUARANTEE BADGE */}
        {renderNewCardGuaranteeBadge()}

        {/* TEMPORAL DURATION BADGE */}
        {isTemporal && displayDurationLabel && (
          <div className="z-10 flex items-center justify-between px-3 py-1.5 rounded-lg bg-sky-950/80 border border-sky-400/60 text-sky-200 text-xs font-black shadow-inner animate-pulse">
            <div className="flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5 text-sky-400" />
              <span className="tracking-wide uppercase font-mono">{displayDurationLabel}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 uppercase">{t('CARD_TAG_TEMPORARY')}</span>
          </div>
        )}

        {/* CARD TITLE & DESCRIPTION */}
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-950/90 rounded-xl border border-purple-500/50 shadow-inner text-amber-300">
              {renderCardIcon()}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-md">
                {displayName}
              </h3>
              {subTitle && (
                <span className="text-[10px] text-amber-300/80 font-semibold block">{t(subTitle)}</span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium bg-black/60 p-3 rounded-xl border border-purple-500/20 backdrop-blur-sm">
            {displayDescription}
          </p>
        </div>

        {/* EFFECTS BREAKDOWN (TRADE-OFF) */}
        {effectDescriptions.length > 0 && (
          <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-purple-500/40 space-y-1.5 z-10">
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block border-b border-purple-500/30 pb-1 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-purple-400" />
              {t('CARD_DOUBLE_EDGED_TRADEOFF')} ({tierConfig.tierName.toUpperCase()}):
            </span>
            {effectDescriptions.map((eff, i) => (
              <div key={i} className="text-xs text-purple-100 font-bold flex items-start gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">{renderHighlightedEffectText(translateCardEffect(eff) || t(eff))}</div>
              </div>
            ))}
          </div>
        )}

        {/* SELECT BUTTON */}
        {onSelect && (
          <button
            onClick={onSelect}
            className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-purple-400 via-amber-300 to-purple-500 hover:from-purple-300 hover:to-amber-200 shadow-xl shadow-purple-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 z-10"
          >
            <Split className="w-4 h-4 stroke-[2.5]" />
            <span>{t(effectiveSelectButtonText)}</span>
          </button>
        )}
      </div>
    );
  }

  // =========================================================================
  // 🟢 POSITIVE / DEVELOPMENT SUBCLASS & PARENT CARDS (Bronze, Silver, Gold, Legendary, Iconic)
  // =========================================================================
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ ...animationDelayStyle, ...tiltStyle }}
      className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden animate-in fade-in zoom-in-95 card-3d-tilt ${
        tierConfig.frameStyle
      } ${
        isTemporal
          ? 'opacity-90 saturate-[0.82] backdrop-blur-md bg-opacity-70 border-dashed ring-2 ring-sky-400/50'
          : ''
      } ${
        isSelected
          ? isIconic
            ? 'ring-4 ring-cyan-300 scale-[1.03] shadow-[0_0_45px_rgba(6,182,212,0.8)]'
            : 'ring-4 ring-amber-400 scale-[1.02] shadow-2xl shadow-amber-500/30'
          : isIconic
          ? 'hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
          : 'hover:border-amber-400/80'
      } ${className}`}
    >
      {/* HOLOGRAPHIC FOIL SHIMMER LAYER (High Quality Mode) */}
      {isHighQualityModeActive() && isHoloEligible && <div className="holo-foil-shimmer" />}
      {/* REVEAL ANIMATION LAYER */}
      {!disableRevealAnimation && (
        <CardTierRevealAnimation
          tierName={tierConfig.tierName}
          subclass={resolvedSubclass}
          isIconic={isIconic}
          isStatBreak={isStatBreak}
          triggerKey={`${name}-${index}-${isSelected ? '1' : '0'}`}
        />
      )}

      {/* Top Metallic / Sheen */}
      {isIconic ? (
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-white to-amber-300 animate-pulse pointer-events-none" />
      ) : tierConfig.tierName === 'Bronze' ? (
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#8c4820] via-[#e69c5e] to-[#6e3515] pointer-events-none shadow-[0_0_10px_rgba(184,115,51,0.5)]" />
      ) : tierConfig.tierName === 'Silver' ? (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-400 via-white to-slate-400 pointer-events-none" />
      ) : (
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-yellow-400 via-yellow-100 to-amber-500 pointer-events-none shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
      )}

      {renderFamilyWatermark()}

      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-2 z-10">
        <span
          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm ${
            isIconic
              ? 'bg-cyan-950/90 text-cyan-200 border border-cyan-400/50'
              : 'bg-stone-950/90 text-amber-300 border border-amber-500/40'
          }`}
        >
          <span>{isIconic ? '💎' : resolvedSubclass === 'parent' ? '👑' : '🟢'}</span>
          <span>{categoryLabel ? t(categoryLabel) : getFamilyDisplayName()}</span>
        </span>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] uppercase flex items-center gap-1 border ${tierConfig.badgeStyle}`}
        >
          <span>{tierConfig.iconSymbol}</span>
          <span>{tierConfig.displayBadge}</span>
        </span>
      </div>

      {/* NEW CARD GUARANTEE BADGE */}
      {renderNewCardGuaranteeBadge()}

      {/* TEMPORAL DURATION BADGE */}
      {isTemporal && displayDurationLabel && (
        <div className="z-10 flex items-center justify-between px-3 py-1.5 rounded-lg bg-sky-950/80 border border-sky-400/60 text-sky-200 text-xs font-black shadow-inner animate-pulse">
          <div className="flex items-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 text-sky-400" />
            <span className="tracking-wide uppercase font-mono">{displayDurationLabel}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 uppercase">{t('CARD_TAG_TEMPORARY')}</span>
        </div>
      )}

      {/* CARD TITLE & DESCRIPTION */}
      <div className="space-y-2 z-10">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border shadow-inner ${
              isIconic
                ? 'bg-cyan-950/90 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-stone-950/90 border-amber-500/40'
            }`}
          >
            {renderCardIcon()}
          </div>
          <div>
            <h3
              className={`text-base sm:text-lg font-black leading-tight drop-shadow-md ${
                isIconic ? 'text-cyan-100' : 'text-white'
              }`}
            >
              {displayName}
            </h3>
            {subTitle && (
              <span
                className={`text-[10px] font-semibold block ${
                  isIconic ? 'text-cyan-300/90' : 'text-amber-300/80'
                }`}
              >
                {t(subTitle)}
              </span>
            )}
          </div>
        </div>

        <p
          className={`text-xs leading-relaxed font-medium p-3 rounded-xl border backdrop-blur-sm ${
            isIconic
              ? 'text-cyan-50 bg-cyan-950/60 border-cyan-400/30'
              : 'text-slate-200 bg-black/50 border-amber-500/20'
          }`}
        >
          {displayDescription}
        </p>
      </div>

      {/* PARENT CARD POTENTIAL BONUS BADGE */}
      {parentPotentialBonus !== undefined && potBonusColor && (
        <div
          className={`flex items-center justify-between px-3.5 py-2 rounded-xl font-black text-xs border ${potBonusColor.badgeBg} ${potBonusColor.textColor} ${potBonusColor.borderColor} ${potBonusColor.glowClass} z-10`}
        >
          <div className="flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{t('POTENTIAL') || 'Potential'}</span>
          </div>
          <span className="font-mono text-sm sm:text-base font-black tracking-wide">
            {80 + parentPotentialBonus}
          </span>
        </div>
      )}

      {/* EFFECTS BREAKDOWN */}
      {(() => {
        const displayEffects = parentPotentialBonus !== undefined
          ? effectDescriptions.filter(
              (eff) => !eff.startsWith('Potential:') && !eff.startsWith('Starting Potential') && !eff.match(/^Potential\s*\+/i)
            )
          : effectDescriptions;

        return displayEffects.length > 0 ? (
          <div
            className={`p-3 rounded-xl border space-y-1.5 z-10 backdrop-blur-md ${
              isIconic
                ? 'bg-slate-950/90 border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : 'bg-black/70 border-amber-500/30'
            }`}
          >
            <span
              className={`text-[10px] font-black uppercase tracking-wider block border-b pb-1 flex items-center gap-1 ${
                isIconic
                  ? 'text-cyan-300 border-cyan-400/30'
                  : 'text-amber-300 border-amber-500/20'
              }`}
            >
              <CheckCircle2 className={`w-3 h-3 ${isIconic ? 'text-cyan-400' : 'text-amber-400'}`} />
              {t('CARD_EFFECTS_TITLE')} ({tierConfig.tierName.toUpperCase()})
            </span>
            {displayEffects.map((eff, i) => (
              <div
                key={i}
                className={`text-xs font-bold flex items-start gap-1.5 ${
                  isIconic ? 'text-cyan-100' : 'text-amber-100'
                }`}
              >
                <Sparkles
                  className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    isIconic ? 'text-cyan-400' : 'text-amber-400'
                  }`}
                />
                <div className="flex-1">{renderHighlightedEffectText(translateCardEffect(eff) || t(eff))}</div>
              </div>
            ))}
          </div>
        ) : null;
      })()}

      {/* SELECT BUTTON */}
      {onSelect && (
        <button
          onClick={onSelect}
          className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 z-10 ${
            isIconic
              ? 'bg-gradient-to-r from-cyan-300 via-white to-amber-300 hover:from-cyan-200 hover:to-amber-200 shadow-cyan-500/30 font-black'
              : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-amber-500/20'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{t(effectiveSelectButtonText)}</span>
        </button>
      )}
    </div>
  );
};

export const CardVisualRenderer = React.memo(CardVisualRendererComponent);
