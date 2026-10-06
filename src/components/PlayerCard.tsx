import React, { useMemo, useState } from 'react';
import {
  PlayerCardData,
  EmblemConfig,
  FacialHairStyle,
  NeckTattooType,
  ArmTattooType,
  FaceTattooType,
  EarringType,
  EarringMaterial,
  EarringGemColor,
  NecklaceType,
} from '../types';
import { getCardTier } from '../constants';
import {
  t,
  translateNationality,
  translateFoot,
  translatePosition,
  translatePlaystyle,
  translateStatLabel,
  translateBio,
} from '../utils/localizationSystem';
import { getOfficialStatName } from '../utils/gameVocabulary';
import {
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  getSubPositionInfo,
  getEffectiveCategoryStats,
  getEffectivePlayerOvr,
  getEffectiveGkDetailed,
  getActiveBonusStats,
  getAttributeModifier,
} from '../utils/statCalculations';
import { ensurePlayerPerksSync, getActivePerks, CareerPerk } from '../utils/perksSystem';
import { resolvePlayerKitAndEmblem } from '../utils/kitResolutionSystem';
import { resolveEffectiveSponsor } from '../utils/uniformSponsorSystem';
import { isBiggerYouthClubActive } from '../utils/youthAdaptationSystem';
import { PerkIcon } from './PerkIcon';
import { Globe2, Lock, Sparkles } from 'lucide-react';
import { formatPersonName } from '../utils/originLastNameSystem';
import { haptics } from '../utils/hapticsSystem';
import { getChemistryInfo } from '../utils/chemistrySystem';
import { isHighQualityModeActive } from '../utils/graphicSettingsSystem';

interface PlayerCardProps {
  player: PlayerCardData;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
  id?: string;
  hideTeam?: boolean;
  hideNationality?: boolean;
  hidePosition?: boolean;
  hideStats?: boolean;
  hidePerks?: boolean;
  hideOvr?: boolean;
  onUpdatePlayer?: (updated: PlayerCardData) => void;
}

export function getTeamCountryCode(country: string): string {
  if (!country) return 'ENG';
  const c = country.trim().toUpperCase();

  const codeMap: Record<string, string> = {
    'GERMANY': 'DEU',
    'ENGLAND': 'ENG',
    'GREAT BRITAIN': 'ENG',
    'UNITED KINGDOM': 'ENG',
    'SOUTH AFRICA': 'SZA',
    'SPAIN': 'ESP',
    'ITALY': 'ITA',
    'FRANCE': 'FRA',
    'ARGENTINA': 'ARG',
    'BRAZIL': 'BRA',
    'PORTUGAL': 'POR',
    'NETHERLANDS': 'NED',
    'UNITED STATES': 'USA',
    'USA': 'USA',
    'US': 'USA',
    'SAUDI ARABIA': 'SAU',
    'KSA': 'SAU',
    'COLOMBIA': 'COL',
    'PARAGUAY': 'PRY',
    'URUGUAY': 'URU',
    'BELGIUM': 'BEL',
    'NORWAY': 'NOR',
    'MEXICO': 'MEX',
    'CROATIA': 'CRO',
    'JAPAN': 'JPN',
    'CHILE': 'CHI',
    'MOROCCO': 'MAR',
    'NIGERIA': 'NGA',
    'CAMEROON': 'CMR',
    'CANADA': 'CAN',
    'TURKEY': 'TUR',
    'EGYPT': 'EGY',
    'NEW ZEALAND': 'NZL',
    'SWITZERLAND': 'SUI',
    'DENMARK': 'DEN',
    'SWEDEN': 'SWE',
    'POLAND': 'POL',
    'AUSTRALIA': 'AUS',
    'KOREA': 'KOR',
    'SOUTH KOREA': 'KOR',
  };

  if (codeMap[c]) return codeMap[c];
  if (c.length === 3) return c;
  return c.slice(0, 3);
}

const renderNeckTattoo = (type: NeckTattooType | boolean | undefined) => {
  if (!type || (type as string) === 'none') return null;
  const t = typeof type === 'boolean' ? 'script' : type;

  if (t === 'blackout') {
    return (
      <div className="absolute inset-x-0 top-[10px] bottom-0 bg-[#020617] opacity-95 rounded-b-[12px] border-b border-black/80 shadow-inner flex items-center justify-center pointer-events-none">
        <div className="w-full h-[2px] bg-black/40" />
      </div>
    );
  }

  if (t === 'tribal') {
    return (
      <svg className="absolute inset-x-0 top-[14px] bottom-0 w-full h-[40px] p-0.5 opacity-90 drop-shadow-sm pointer-events-none" viewBox="0 0 60 40" preserveAspectRatio="none" fill="none">
        {/* Central bold spearhead */}
        <polygon points="30,4 34,16 36,38 30,32 24,38 26,16" fill="#020617" />
        {/* Left tribal hooks & shark teeth */}
        <path d="M 24 16 C 16 10 8 16 2 12 C 8 20 16 22 24 22 Z" fill="#020617" />
        <path d="M 22 26 C 14 24 8 30 2 28 C 8 35 16 35 22 33 Z" fill="#020617" />
        {/* Right tribal hooks & shark teeth */}
        <path d="M 36 16 C 44 10 52 16 58 12 C 52 20 44 22 36 22 Z" fill="#020617" />
        <path d="M 38 26 C 46 24 52 30 58 28 C 52 35 44 35 38 33 Z" fill="#020617" />
        {/* Accent tribal dots & diamond */}
        <circle cx="30" cy="8" r="1.5" fill="#020617" />
        <circle cx="30" cy="22" r="1.8" fill="#020617" />
      </svg>
    );
  }

  if (t === 'wings') {
    return (
      <svg className="absolute inset-x-0 top-[14px] bottom-0 w-full h-[40px] p-0.5 opacity-95 drop-shadow-sm pointer-events-none" viewBox="0 0 60 40" preserveAspectRatio="none" fill="none">
        {/* Left Angel Wing */}
        <g fill="#020617">
          <path d="M 28 20 C 22 12, 10 10, 2 20 C 8 20, 14 24, 20 28 C 12 28, 6 32, 4 36 C 12 34, 20 34, 26 30 Z" />
          <path d="M 26 14 C 18 6, 8 8, 4 14 C 10 14, 18 16, 24 20 Z" opacity="0.85" />
          <path d="M 24 8 C 18 2, 10 4, 8 8 C 14 8, 20 10, 24 12 Z" opacity="0.7" />
        </g>
        {/* Right Angel Wing */}
        <g fill="#020617">
          <path d="M 32 20 C 38 12, 50 10, 58 20 C 52 20, 46 24, 40 28 C 48 28, 54 32, 56 36 C 48 34, 40 34, 34 30 Z" />
          <path d="M 34 14 C 42 6, 52 8, 56 14 C 50 14, 42 16, 36 20 Z" opacity="0.85" />
          <path d="M 36 8 C 42 2, 50 4, 52 8 C 46 8, 40 10, 36 12 Z" opacity="0.7" />
        </g>
        {/* Center Cross / Emblem */}
        <circle cx="30" cy="20" r="2.5" fill="#020617" />
        <rect x="28.8" y="12" width="2.4" height="18" rx="0.5" fill="#020617" />
        <rect x="22" y="17" width="16" height="2.4" rx="0.5" fill="#020617" />
      </svg>
    );
  }

  if (t === 'rose') {
    return (
      <svg className="absolute inset-x-0 top-[12px] bottom-0 w-full h-[40px] p-0.5 opacity-95 drop-shadow-sm pointer-events-none" viewBox="0 0 50 40" fill="none">
        <path d="M 25 38 C 22 28 28 18 25 8 C 23 13 15 15 18 21 C 21 27 23 33 25 38 Z" fill="#020617" />
        <path d="M 25 14 C 19 7 31 5 25 1 C 19 5 31 7 25 14 Z" fill="#991b1b" stroke="#020617" strokeWidth="1" />
        <circle cx="25" cy="9" r="4.5" fill="#be123c" stroke="#020617" strokeWidth="1" />
        <path d="M 22 18 Q 11 15 14 23 Z" fill="#047857" stroke="#020617" strokeWidth="0.8" />
        <path d="M 28 21 Q 39 18 36 26 Z" fill="#047857" stroke="#020617" strokeWidth="0.8" />
        {/* Side thorns & vine lines */}
        <path d="M 12 16 Q 18 18 22 26" stroke="#020617" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 38 16 Q 32 18 28 26" stroke="#020617" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Fallback / Script
  return (
    <svg className="absolute inset-x-0 top-[14px] bottom-0 w-full h-[38px] p-0.5 opacity-90 drop-shadow-sm pointer-events-none" viewBox="0 0 60 40" preserveAspectRatio="none" fill="none">
      <path d="M 5 8 Q 15 2 25 10 T 45 8 T 55 14" stroke="#020617" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 8 18 Q 20 14 30 21 T 52 16" stroke="#020617" strokeWidth="2" strokeLinecap="round" />
      <path d="M 12 28 Q 22 24 35 30 T 50 26" stroke="#020617" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};

const renderArmTattoo = (type: ArmTattooType | boolean | undefined) => {
  if (!type || (type as string) === 'none') return null;
  const t = typeof type === 'boolean' ? 'mandala-sleeve' : type;

  if (t === 'blackout-sleeve') {
    return (
      <div className="absolute inset-0 bg-[#020617] opacity-95 rounded-t-[4px]" />
    );
  }

  if (t === 'two-lines' || t === 'double-stripe') {
    return (
      <div className="absolute inset-x-0 bottom-[8px] flex flex-col items-center gap-[6px] opacity-95">
        <div className="w-full h-[10px] bg-[#020617] shadow-sm" />
        <div className="w-full h-[10px] bg-[#020617] shadow-sm" />
      </div>
    );
  }

  if (t === 'tribal') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-90 p-0.5" viewBox="0 0 24 72" preserveAspectRatio="none" fill="none">
        {/* Top Deltoid Tribal Arc */}
        <path d="M 2 4 Q 12 12 22 4 L 20 10 Q 12 16 4 10 Z" fill="#020617" />
        <path d="M 3 12 C 9 14, 18 10, 21 16 C 15 18, 9 22, 3 18 Z" fill="#020617" />
        
        {/* Mid-Bicep Maori Chevron Blades */}
        <polygon points="12,18 18,25 15,32 12,27 9,32 6,25" fill="#020617" />
        <path d="M 2 24 Q 7 28 12 24 Q 17 28 22 24 L 21 28 Q 17 32 12 28 Q 7 32 3 28 Z" fill="#020617" />
        <path d="M 2 34 C 8 32, 16 38, 22 34 C 18 40, 6 40, 2 34 Z" fill="#020617" />

        {/* Forearm Bands & Shark Teeth stretching down the arm */}
        <path d="M 2 42 L 22 42 L 22 46 L 2 46 Z" fill="#020617" />
        {/* Shark teeth band */}
        <polygon points="3,47 6,51 9,47" fill="#020617" />
        <polygon points="9,47 12,51 15,47" fill="#020617" />
        <polygon points="15,47 18,51 21,47" fill="#020617" />
        
        {/* Lower Arm Tribal Spear & Hooks */}
        <polygon points="12,52 17,60 14,68 12,64 10,68 7,60" fill="#020617" />
        <path d="M 3 55 Q 8 58 12 55 Q 16 58 21 55 L 20 59 Q 16 62 12 59 Q 8 62 4 59 Z" fill="#020617" />
        <circle cx="12" cy="70" r="1.5" fill="#020617" />
      </svg>
    );
  }

  if (t === 'full-sleeve-flowery' || t === 'mandala-sleeve') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-95 p-0.5" viewBox="0 0 24 72" preserveAspectRatio="none" fill="none">
        <defs>
          {/* Vibrant floral gradients inspired by colorful mandala sleeve */}
          <radialGradient id="mandalaStarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </radialGradient>
          <linearGradient id="mandalaCyanTeal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="mandalaMagenta" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
          <linearGradient id="mandalaAmberGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Top Upper Arm Geometric Lotus Arch */}
        <path d="M 3 3 Q 12 10 21 3 L 20 7 Q 12 13 4 7 Z" fill="url(#mandalaCyanTeal)" stroke="#020617" strokeWidth="0.8" />
        <circle cx="12" cy="7" r="2.5" fill="url(#mandalaMagenta)" stroke="#020617" strokeWidth="0.6" />

        {/* CENTRAL RADIANT MANDALA FLOWER (Iconic vibrant star bloom) */}
        {/* Outer Lotus Petals (Cyan & Magenta) */}
        <circle cx="12" cy="24" r="10.5" fill="url(#mandalaCyanTeal)" stroke="#020617" strokeWidth="0.9" />
        <path d="M 12 13 C 8 18 8 30 12 35 C 16 30 16 18 12 13 Z" fill="url(#mandalaMagenta)" stroke="#020617" strokeWidth="0.7" />
        <path d="M 1.5 24 C 6.5 20 17.5 20 22.5 24 C 17.5 28 6.5 28 1.5 24 Z" fill="url(#mandalaMagenta)" stroke="#020617" strokeWidth="0.7" />
        
        {/* Diagonal Petals */}
        <path d="M 4.5 16.5 C 9.5 17.5 17 25 19.5 31.5 C 15.5 30 7.5 22.5 4.5 16.5 Z" fill="url(#mandalaAmberGold)" stroke="#020617" strokeWidth="0.6" />
        <path d="M 19.5 16.5 C 15.5 17.5 7.5 25 4.5 31.5 C 9.5 30 16.5 22.5 19.5 16.5 Z" fill="url(#mandalaAmberGold)" stroke="#020617" strokeWidth="0.6" />

        {/* Inner Glowing Star Center */}
        <circle cx="12" cy="24" r="4.5" fill="url(#mandalaStarGlow)" stroke="#020617" strokeWidth="0.8" />
        <polygon points="12,20.5 13.5,23 16,24 13.5,25 12,27.5 10.5,25 8,24 10.5,23" fill="#fef08a" stroke="#020617" strokeWidth="0.5" />

        {/* Mid-Forearm Geometric Arch Transitions */}
        <path d="M 2 37 Q 12 33 22 37" stroke="#020617" strokeWidth="1.2" />
        <path d="M 3 40 Q 12 44 21 40" stroke="url(#mandalaCyanTeal)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 3 40 Q 12 44 21 40" stroke="#020617" strokeWidth="0.8" fill="none" />

        {/* LOWER FOREARM MANDALA BLOOM (Extending down the arm) */}
        <circle cx="12" cy="54" r="8.5" fill="url(#mandalaMagenta)" stroke="#020617" strokeWidth="0.8" />
        <path d="M 12 45.5 C 9 49.5 9 58.5 12 62.5 C 15 58.5 15 49.5 12 45.5 Z" fill="url(#mandalaCyanTeal)" stroke="#020617" strokeWidth="0.6" />
        <path d="M 3.5 54 C 7.5 51 16.5 51 20.5 54 C 16.5 57 7.5 57 3.5 54 Z" fill="url(#mandalaAmberGold)" stroke="#020617" strokeWidth="0.6" />
        <circle cx="12" cy="54" r="3.2" fill="url(#mandalaStarGlow)" stroke="#020617" strokeWidth="0.7" />

        {/* Wrist Teardrop Accent */}
        <path d="M 12 65 C 10 67 10 70 12 71 C 14 70 14 67 12 65 Z" fill="url(#mandalaCyanTeal)" stroke="#020617" strokeWidth="0.6" />
      </svg>
    );
  }

  if (t === 'text-script' || t === 'script-sleeve') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-90 p-0.5" viewBox="0 0 24 66" preserveAspectRatio="none" fill="none" stroke="#020617">
        <path d="M 12 8 L 12 58" stroke="#020617" strokeDasharray="2 2" strokeWidth="1" opacity="0.4" />
        <path
          d="M 6 12 C 18 8, 20 18, 8 22 C 4 24, 18 26, 14 32 C 10 38, 20 36, 8 42 C 4 45, 18 48, 12 56"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M 14 16 L 19 14" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 11 38 L 17 36" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#020617] opacity-90 tat-arm-pattern" />
  );
};

// --- ATHLETIC VASCULARITY & VEINS SYSTEM ---
const getVeinSkinShade = (skinHex: string = '#f5d0b1', tier: number) => {
  let c = (skinHex || '#f5d0b1').replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    r = 245;
    g = 208;
    b = 177;
  }

  // Darken factor:
  // tier 3 (90-94): very subtle darkening (22% darker than skin tone)
  // tier 4 (95-99): subtle, natural vascular shadow (36% darker than skin tone)
  // tier 5 (100+ Stat Break): deep, very noticeable muscular definition (58% darker than skin tone)
  const factor = tier >= 5 ? 0.42 : tier === 4 ? 0.64 : 0.78;
  const vr = Math.max(10, Math.round(r * factor));
  const vg = Math.max(10, Math.round(g * factor * 0.94));
  const vb = Math.max(10, Math.round(b * factor * 0.92));

  // Soft vascular undertone
  const undertoneFactor = tier >= 5 ? 0.52 : tier === 4 ? 0.72 : 0.84;
  const ur = Math.max(15, Math.round(r * undertoneFactor));
  const ug = Math.max(15, Math.round(g * undertoneFactor * 0.95));
  const ub = Math.max(15, Math.round(b * undertoneFactor * 0.93));

  return {
    strokeColor: `rgb(${vr}, ${vg}, ${vb})`,
    undertoneColor: `rgb(${ur}, ${ug}, ${ub})`,
  };
};

const renderArmVeins = (tier: number, isRight: boolean, skinColor: string = '#f5d0b1') => {
  if (tier < 3) return null;
  const isTier3 = tier === 3;
  const isTier4 = tier === 4;
  const isTier5 = tier >= 5;

  const opacity = isTier3 ? 0.35 : isTier4 ? 0.65 : 0.92;
  const strokeW = isTier3 ? 1.2 : isTier4 ? 1.7 : 2.4;
  const { strokeColor, undertoneColor } = getVeinSkinShade(skinColor, tier);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[4]"
      viewBox="0 0 30 76"
      preserveAspectRatio="none"
      style={{ opacity, transform: isRight ? 'scaleX(-1)' : 'none' }}
    >
      {/* Sub-dermal venous tone glow */}
      <path
        d="M 8 74 Q 14 52 10 38 T 16 10"
        fill="none"
        stroke={undertoneColor}
        strokeWidth={strokeW + 1.2}
        strokeLinecap="round"
        opacity={isTier5 ? 0.55 : isTier4 ? 0.4 : 0.25}
      />
      {/* Main Cephalic/Bicep Vein */}
      <path
        d="M 8 74 Q 14 52 10 38 T 16 10"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      {/* Branch 1 */}
      <path
        d="M 12 45 Q 20 40 24 30"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW * 0.75}
        strokeLinecap="round"
      />
      {/* Branch 2 */}
      {(isTier4 || isTier5) && (
        <path
          d="M 9 60 Q 4 52 6 40"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeW * 0.7}
          strokeLinecap="round"
        />
      )}
      {/* Tier 5 Extra High-Definition Branch */}
      {isTier5 && (
        <path
          d="M 14 26 Q 22 20 20 6"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeW * 0.8}
          strokeLinecap="round"
        />
      )}
      {/* Specular 3D Ridge Highlight */}
      {(isTier4 || isTier5) && (
        <>
          <path
            d="M 8.5 73.5 Q 14.5 51.5 10.5 37.5 T 16.5 9.5"
            fill="none"
            stroke={isTier5 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={strokeW * 0.4}
            strokeLinecap="round"
          />
          <path
            d="M 12.5 44.5 Q 20.5 39.5 24.5 29.5"
            fill="none"
            stroke={isTier5 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.16)'}
            strokeWidth={strokeW * 0.3}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
};

const renderNeckVeins = (tier: number, skinColor: string = '#f5d0b1') => {
  if (tier < 3) return null;
  const isTier3 = tier === 3;
  const isTier4 = tier === 4;
  const isTier5 = tier >= 5;

  const opacity = isTier3 ? 0.35 : isTier4 ? 0.65 : 0.92;
  const strokeW = isTier3 ? 1.2 : isTier4 ? 1.7 : 2.4;
  const { strokeColor, undertoneColor } = getVeinSkinShade(skinColor, tier);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[3]"
      viewBox="0 0 70 54"
      preserveAspectRatio="none"
      style={{ opacity }}
    >
      {/* Left Neck Sternocleidomastoid Vein */}
      <path
        d="M 14 4 Q 10 24 16 50"
        fill="none"
        stroke={undertoneColor}
        strokeWidth={strokeW + 1}
        strokeLinecap="round"
        opacity={isTier5 ? 0.5 : 0.3}
      />
      <path
        d="M 14 4 Q 10 24 16 50"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <path
        d="M 12 22 Q 6 30 8 44"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW * 0.7}
        strokeLinecap="round"
      />

      {/* Right Neck Sternocleidomastoid Vein */}
      <path
        d="M 56 4 Q 60 24 54 50"
        fill="none"
        stroke={undertoneColor}
        strokeWidth={strokeW + 1}
        strokeLinecap="round"
        opacity={isTier5 ? 0.5 : 0.3}
      />
      <path
        d="M 56 4 Q 60 24 54 50"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <path
        d="M 58 22 Q 64 30 62 44"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW * 0.7}
        strokeLinecap="round"
      />

      {/* Tier 5 Extra Central Jugular & Branching */}
      {isTier5 && (
        <>
          <path
            d="M 28 6 Q 32 26 26 48"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeW * 0.75}
            strokeLinecap="round"
          />
          <path
            d="M 42 6 Q 38 26 44 48"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeW * 0.75}
            strokeLinecap="round"
          />
        </>
      )}

      {/* 3D Specular Highlight Ridges */}
      {(isTier4 || isTier5) && (
        <>
          <path
            d="M 14.5 4 Q 10.5 24 16.5 50"
            fill="none"
            stroke={isTier5 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={strokeW * 0.35}
            strokeLinecap="round"
          />
          <path
            d="M 55.5 4 Q 59.5 24 53.5 50"
            fill="none"
            stroke={isTier5 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={strokeW * 0.35}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
};

const renderForeheadVeins = (tier: number, skinColor: string = '#f5d0b1') => {
  if (tier < 4) return null;
  const isTier4 = tier === 4;
  const isTier5 = tier >= 5;

  const opacity = isTier4 ? 0.65 : 0.9;
  const strokeW = isTier4 ? 1.5 : 2.0;
  const { strokeColor, undertoneColor } = getVeinSkinShade(skinColor, tier);

  return (
    <svg
      className="absolute inset-0 w-[216px] h-[260px] pointer-events-none z-[6]"
      viewBox="0 0 216 260"
      style={{ opacity }}
    >
      {/* Right Temple / Forehead Vein */}
      <path
        d="M 144 58 Q 138 68 141 78 T 136 90"
        fill="none"
        stroke={undertoneColor}
        strokeWidth={strokeW + 0.8}
        strokeLinecap="round"
        opacity={isTier5 ? 0.5 : 0.3}
      />
      <path
        d="M 144 58 Q 138 68 141 78 T 136 90"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
      <path
        d="M 140 70 Q 146 74 148 82"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeW * 0.7}
        strokeLinecap="round"
      />
      <path
        d="M 144.5 58 Q 138.5 68 141.5 78 T 136.5 90"
        fill="none"
        stroke={isTier5 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}
        strokeWidth={strokeW * 0.35}
        strokeLinecap="round"
      />

      {/* Tier 5 Left Temple & Central Brow Veins */}
      {isTier5 && (
        <>
          <path
            d="M 72 58 Q 78 68 75 78 T 80 90"
            fill="none"
            stroke={undertoneColor}
            strokeWidth={strokeW + 0.8}
            strokeLinecap="round"
            opacity={0.4}
          />
          <path
            d="M 72 58 Q 78 68 75 78 T 80 90"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          <path
            d="M 76 70 Q 70 74 68 82"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeW * 0.7}
            strokeLinecap="round"
          />
          <path
            d="M 72.5 58 Q 78.5 68 75.5 78 T 80.5 90"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={strokeW * 0.35}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
};

const renderNecklace = (
  type: NecklaceType | undefined,
  neckW: number = 42,
  neckLeft: number = 87,
  headScale: number = 1.0
) => {
  if (!type || type === 'none') return null;

  // Neck left and right borders in standard head coordinate space
  // Spanning from neckLeft to neckLeft + neckW
  const startX = neckLeft;
  const endX = neckLeft + neckW;
  const midX = 108;
  const topY = 152; // Sides of neck just above collar
  const drapeY = 192; // Deepest drape point across collar/upper chest
  const tagDrapeY = 198; // For dog-tags / diamond pendant

  return (
    <div
      className="absolute w-[216px] h-[260px] top-0 left-0 z-[12] pointer-events-none transition-transform duration-200"
      style={{
        transformOrigin: '108px 105px',
        transform: `scale(${headScale})`,
      }}
    >
      <svg className="w-full h-full drop-shadow-md overflow-visible">
        <defs>
          <linearGradient id="diamondGlintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {type === 'gold-chain' && (
          <g>
            {/* Outer deep gold shadow chain */}
            <path
              d={`M ${startX - 1} ${topY} Q ${midX} ${drapeY + 6} ${endX + 1} ${topY}`}
              stroke="#78350f"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Main polished 18k solid gold chain */}
            <path
              d={`M ${startX} ${topY} Q ${midX} ${drapeY} ${endX} ${topY}`}
              stroke="#f59e0b"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />
            {/* Specular bright gold link highlights */}
            <path
              d={`M ${startX + 2} ${topY + 1} Q ${midX} ${drapeY - 1} ${endX - 2} ${topY + 1}`}
              stroke="#fef08a"
              strokeWidth="1.4"
              fill="none"
              strokeDasharray="3 2"
              strokeLinecap="round"
            />
          </g>
        )}

        {type === 'silver-chain' && (
          <g>
            {/* Outer shadow */}
            <path
              d={`M ${startX - 1} ${topY} Q ${midX} ${drapeY + 6} ${endX + 1} ${topY}`}
              stroke="#1e293b"
              strokeWidth="4.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Polished silver body */}
            <path
              d={`M ${startX} ${topY} Q ${midX} ${drapeY} ${endX} ${topY}`}
              stroke="#cbd5e1"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />
            {/* Specular link glint */}
            <path
              d={`M ${startX + 2} ${topY + 1} Q ${midX} ${drapeY - 1} ${endX - 2} ${topY + 1}`}
              stroke="#ffffff"
              strokeWidth="1.4"
              fill="none"
              strokeDasharray="3 2"
              strokeLinecap="round"
            />
          </g>
        )}

        {type === 'dog-tags' && (
          <g>
            {/* Ball chain drape */}
            <path
              d={`M ${startX} ${topY} Q ${midX} ${drapeY - 6} ${endX} ${topY}`}
              stroke="#94a3b8"
              strokeWidth="2.5"
              strokeDasharray="2 2"
              fill="none"
              strokeLinecap="round"
            />
            <line x1={midX} y1={drapeY - 6} x2={midX - 2} y2={tagDrapeY - 8} stroke="#94a3b8" strokeWidth="2" strokeDasharray="1.5 1.5" />
            {/* First Military Tag */}
            <rect
              x={midX - 7}
              y={tagDrapeY - 8}
              width="10"
              height="18"
              rx="2.5"
              fill="#334155"
              stroke="#0f172a"
              strokeWidth="1.2"
              transform={`rotate(-14 ${midX - 7} ${tagDrapeY - 8})`}
            />
            <circle cx={midX - 2} cy={tagDrapeY - 5} r="1.2" fill="#cbd5e1" transform={`rotate(-14 ${midX - 7} ${tagDrapeY - 8})`} />
            <line x1={midX - 5} y1={tagDrapeY + 1} x2={midX + 1} y2={tagDrapeY + 1} stroke="#64748b" strokeWidth="0.8" transform={`rotate(-14 ${midX - 7} ${tagDrapeY - 8})`} />
            <line x1={midX - 5} y1={tagDrapeY + 4} x2={midX} y2={tagDrapeY + 4} stroke="#64748b" strokeWidth="0.8" transform={`rotate(-14 ${midX - 7} ${tagDrapeY - 8})`} />
            {/* Second Military Tag overlapping */}
            <rect
              x={midX - 2}
              y={tagDrapeY - 7}
              width="10"
              height="18"
              rx="2.5"
              fill="#cbd5e1"
              stroke="#475569"
              strokeWidth="1.2"
              transform={`rotate(10 ${midX - 2} ${tagDrapeY - 7})`}
            />
            <circle cx={midX + 3} cy={tagDrapeY - 4} r="1.2" fill="#1e293b" transform={`rotate(10 ${midX - 2} ${tagDrapeY - 7})`} />
            <line x1={midX} y1={tagDrapeY + 2} x2={midX + 6} y2={tagDrapeY + 2} stroke="#94a3b8" strokeWidth="0.8" transform={`rotate(10 ${midX - 2} ${tagDrapeY - 7})`} />
            <line x1={midX} y1={tagDrapeY + 5} x2={midX + 5} y2={tagDrapeY + 5} stroke="#94a3b8" strokeWidth="0.8" transform={`rotate(10 ${midX - 2} ${tagDrapeY - 7})`} />
          </g>
        )}

        {(type === 'diamonds-incrusted' || type === 'diamond-chain') && (
          <g>
            {/* Deep shadow */}
            <path
              d={`M ${startX - 1} ${topY} Q ${midX} ${drapeY + 7} ${endX + 1} ${topY}`}
              stroke="#78350f"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* 24k Gold Heavy Cuban Base */}
            <path
              d={`M ${startX} ${topY} Q ${midX} ${drapeY + 1} ${endX} ${topY}`}
              stroke="#eab308"
              strokeWidth="4.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Continuous row of pavé diamonds */}
            <path
              d={`M ${startX + 1} ${topY + 1} Q ${midX} ${drapeY} ${endX - 1} ${topY + 1}`}
              stroke="#ffffff"
              strokeWidth="2.2"
              fill="none"
              strokeDasharray="2.5 1.8"
              strokeLinecap="round"
            />
            {/* Cyan radiant glint centers */}
            <path
              d={`M ${startX + 2} ${topY + 1} Q ${midX} ${drapeY} ${endX - 2} ${topY + 1}`}
              stroke="#38bdf8"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="1.2 3.1"
              strokeLinecap="round"
            />
            {/* Centerpiece Diamond Cluster Medallion */}
            <g transform={`translate(${midX}, ${drapeY + 2})`}>
              <circle cx="0" cy="0" r="5.5" fill="#ca8a04" stroke="#78350f" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="4.2" fill="url(#diamondGlintGrad)" stroke="#ffffff" strokeWidth="0.6" />
              <polygon points="0,-3.5 1,-1 3.5,0 1,1 0,3.5 -1,1 -3.5,0 -1,-1" fill="#ffffff" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};

const renderFaceTattoo = (type: string | undefined) => {
  if (!type || type === 'none') return null;

  if (type === 'under-eye-cross') {
    return (
      <svg className="absolute w-[12px] h-[12px] top-[74px] right-[68px] z-[9] opacity-90 pointer-events-none drop-shadow-sm" viewBox="0 0 20 20" fill="#0f172a">
        <rect x="8" y="2" width="4" height="16" rx="1" />
        <rect x="2" y="6" width="16" height="4" rx="1" />
      </svg>
    );
  }

  if (type === 'star') {
    return (
      <svg className="absolute w-[11px] h-[11px] top-[76px] left-[68px] z-[9] opacity-90 pointer-events-none drop-shadow-sm" viewBox="0 0 24 24" fill="#0f172a">
        <path d="M12 2L14.8 8.6L22 9.2L16.5 13.8L18.2 21L12 17.2L5.8 21L7.5 13.8L2 9.2L9.2 8.6L12 2Z" />
      </svg>
    );
  }

  if (type === 'crown-temple') {
    return (
      <svg className="absolute w-[15px] h-[13px] top-[68px] right-[72px] z-[9] opacity-95 pointer-events-none drop-shadow-sm" viewBox="0 0 24 20" fill="#0f172a">
        <path d="M 2 16 L 4 4 L 9 10 L 12 2 L 15 10 L 20 4 L 22 16 Z" stroke="#0f172a" strokeWidth="1" strokeLinejoin="round" />
        <circle cx="4" cy="4" r="1.5" fill="#0f172a" />
        <circle cx="12" cy="2" r="1.5" fill="#0f172a" />
        <circle cx="20" cy="4" r="1.5" fill="#0f172a" />
      </svg>
    );
  }

  if (type === 'script-cheek') {
    return (
      <svg className="absolute w-[24px] h-[10px] top-[80px] right-[62px] z-[9] opacity-90 pointer-events-none drop-shadow-sm" viewBox="0 0 40 16" stroke="#0f172a" strokeWidth="2.5" fill="none">
        <path d="M 2 8 Q 12 2 20 12 T 38 6" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'heart') {
    return (
      <svg className="absolute w-[11px] h-[11px] top-[75px] right-[70px] z-[9] opacity-90 pointer-events-none drop-shadow-sm" viewBox="0 0 24 24" fill="#0f172a">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    );
  }

  return null;
};

const getMetalColorHex = (mat: EarringMaterial = 'silver') => {
  switch (mat) {
    case 'gold': return '#fbbf24';
    case 'bronze': return '#cd7f32';
    case 'black': return '#1e293b';
    case 'steel': return '#94a3b8';
    case 'silver': default: return '#e2e8f0';
  }
};

const getGemColorHex = (gem: EarringGemColor = 'diamond') => {
  switch (gem) {
    case 'white': return '#ffffff';
    case 'emerald': return '#10b981';
    case 'sapphire': return '#3b82f6';
    case 'amethyst': return '#a855f7';
    case 'diamond': default: return '#38bdf8';
  }
};

const renderEarring = (
  type: EarringType | undefined,
  side: 'left' | 'right',
  material?: EarringMaterial,
  gemColor?: EarringGemColor
) => {
  if (!type || type === 'none') return null;

  // Determine fallback material if not explicitly provided
  const resolvedMat = material || (type === 'gold' ? 'gold' : type === 'steel' ? 'steel' : 'silver');
  const metalHex = getMetalColorHex(resolvedMat);
  const gemHex = getGemColorHex(gemColor);
  const positionClass = side === 'left' ? 'left-[48px]' : 'right-[48px]';

  if (type === 'small-barbell' || type === 'silver' || type === 'steel') {
    return (
      <div className={`absolute top-[112px] ${positionClass} z-[8] flex flex-col items-center pointer-events-none`}>
        <div
          className="w-[5px] h-[5px] rounded-full shadow-sm border border-black/30"
          style={{ backgroundColor: metalHex }}
        />
      </div>
    );
  }

  if (type === 'large-barbell' || type === 'gold') {
    return (
      <div className={`absolute top-[110px] ${positionClass} z-[8] flex flex-col items-center pointer-events-none`}>
        <div
          className="w-[7px] h-[7px] rounded-full border-[2px] bg-transparent shadow-md"
          style={{ borderColor: metalHex }}
        />
      </div>
    );
  }

  if (type === 'gem') {
    return (
      <div className={`absolute top-[111px] ${positionClass} z-[8] flex flex-col items-center pointer-events-none`}>
        {/* Metal bezel holder with customizable gemstone tint */}
        <div
          className="w-[7px] h-[7px] rotate-45 rounded-[1.5px] shadow-[0_0_5px_rgba(255,255,255,0.75)] border flex items-center justify-center"
          style={{ backgroundColor: gemHex, borderColor: metalHex }}
        >
          <div className="w-[2px] h-[2px] rounded-full bg-white/90 shadow-sm" />
        </div>
      </div>
    );
  }

  return null;
};

const PlayerCardComponent: React.FC<PlayerCardProps> = ({
  player,
  isFlipped = false,
  onFlip,
  className = '',
  id = 'player-card-render',
  hideTeam = false,
  hideNationality = false,
  hidePosition = false,
  hideStats = false,
  hidePerks = false,
  hideOvr = false,
  onUpdatePlayer,
}) => {
  const syncedPlayer = useMemo(() => ensurePlayerPerksSync(player), [player]);
  const activePerks = useMemo(() => getActivePerks(syncedPlayer), [syncedPlayer]);
  const [selectedPerkTooltip, setSelectedPerkTooltip] = useState<CareerPerk | null>(null);

  // 3D Tilt & Specular Light System (GPU-accelerated via CSS custom properties to avoid React state re-renders on mousemove)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normY = (y / rect.height - 0.5) * 2; // -1 to 1
    const rotX = -normY * 12;
    const rotY = normX * 12;
    el.style.setProperty('--card-rot-x', `${rotX.toFixed(2)}deg`);
    el.style.setProperty('--card-rot-y', `${rotY.toFixed(2)}deg`);
    el.style.setProperty('--card-scale', '1.02');
    el.style.setProperty('--card-trans-dur', '80ms');
    el.style.setProperty('--glare-opacity', '1');
    el.style.setProperty('--glare-x', `${((rotY / 12 + 1) * 50).toFixed(1)}%`);
    el.style.setProperty('--glare-y', `${((-rotX / 12 + 1) * 50).toFixed(1)}%`);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--card-rot-x', '0deg');
    el.style.setProperty('--card-rot-y', '0deg');
    el.style.setProperty('--card-scale', '1');
    el.style.setProperty('--card-trans-dur', '400ms');
    el.style.setProperty('--glare-opacity', '0');
  };

  const handleCardClick = () => {
    haptics.lightTap();
    if (onFlip) onFlip();
  };

  const {
    name = 'PLAYER',
    ovr = 40,
    age = 18,
    club = 'Club',
    nationality = { code: 'ARG', iso: 'ar', name: 'Argentina' },
    otherNationalities = player?.otherNationalities || [],
    stats = { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 },
    biometrics = {
      strength: 40,
      skinColor: '#f5d0b1',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#111111',
      hairDye: 'none',
    },
    accessories = {
      accessory: 'none',
      headbandColor: '#ffffff',
    },
  } = player || {};

  // Dynamically resolve the active Kit and Emblem based on the Kit Priority Rules:
  // 1. National Team Representation -> National Team Kit (from National Team Info -> Kits)
  // 2. Club Representation -> Club Kit (from Team Info -> Kits in leagueDb)
  // 3. No current team -> player.kit and player.emblem (default/creation behavior)
  const resolvedKitData = useMemo(() => {
    return resolvePlayerKitAndEmblem(player);
  }, [
    player,
    player?.club,
    player?.clubId,
    player?.clubCountry,
    player?.activeInternationalDuty,
    player?.kit,
    player?.kit?.style,
    player?.kit?.color1,
    player?.kit?.color2,
    player?.kit?.pattern,
    player?.kit?.collar,
    player?.kit?.sponsor,
    (player as any)?.useDirectKit,
    (player as any)?.isKitPreview,
    (player as any)?._forceKit,
    player?.emblem,
  ]);

  const activeKit = resolvedKitData.kit;
  const activeEmblem = resolvedKitData.emblem;
  const activeClubName = resolvedKitData.teamName || club;
  const activeClubCountry = resolvedKitData.teamCountryCode || player?.clubCountry || nationality?.name || '';

  const resolvedSponsor = useMemo(() => {
    return resolveEffectiveSponsor(activeKit, undefined, activeClubName);
  }, [activeKit, activeClubName]);

  let position = player?.position !== undefined ? player.position : '';
  let subPosition = player?.subPosition || '';
  let playStyle = player?.playStyle || '';
  let customBio = player?.customBio;
  let preferredFoot = player?.preferredFoot || 'Right';
  let weakFootStars = typeof player?.weakFootStars === 'number' && !isNaN(player.weakFootStars) ? player.weakFootStars : 4;
  const rawStrength = useMemo(() => {
    if (typeof player?.statBreakStats?.strength === 'number' && player.statBreakStats.strength > 0) {
      return player.statBreakStats.strength;
    }
    if (typeof player?.stats?.detailed?.strength === 'number' && player.stats.detailed.strength > 0) {
      return player.stats.detailed.strength;
    }
    if (typeof biometrics?.strength === 'number' && !isNaN(biometrics.strength) && biometrics.strength > 0) {
      return biometrics.strength;
    }
    if (typeof player?.stats?.phy === 'number' && !isNaN(player.stats.phy) && player.stats.phy > 0) {
      return player.stats.phy;
    }
    return 40;
  }, [
    player?.statBreakStats?.strength,
    player?.stats?.detailed?.strength,
    biometrics?.strength,
    player?.stats?.phy,
  ]);
  let heightCm = player?.heightCm && !isNaN(player.heightCm) ? player.heightCm : (170 + Math.round((rawStrength - 40) * 0.35));
  let weightKg = player?.weightKg && !isNaN(player.weightKg) ? player.weightKg : (65 + Math.round((rawStrength - 40) * 0.4));

  const tier = useMemo(() => getCardTier(ovr), [ovr]);

  // --- STRENGTH & BODYBUILDER SCALING CALCULATIONS ---
  const strengthCalculations = useMemo(() => {
    const isStatBreak =
      rawStrength >= 100 ||
      Boolean(player?.statBreakActive && player?.statBreakStats?.strength && player.statBreakStats.strength >= 100) ||
      Boolean(player?.statBreakActive && player?.stats?.detailed?.strength && player.stats.detailed.strength >= 100);

    const strength = Math.max(40, rawStrength);

    // Determine Strength Tier:
    // 1: 40 - 69 (Skinny)
    // 2: 70 - 89 (Athletic baseline)
    // 3: 90 - 94 (Muscular)
    // 4: 95 - 99 (Massive / Beast)
    // 5: Stat Break (>= 100)
    let strengthTier = 1;
    if (isStatBreak || strength >= 100) {
      strengthTier = 5;
    } else if (strength >= 95) {
      strengthTier = 4;
    } else if (strength >= 90) {
      strengthTier = 3;
    } else if (strength >= 70) {
      strengthTier = 2;
    } else {
      strengthTier = 1;
    }

    let headScale = 1.0;
    let armW = 20;
    let neckW = 42;
    let neckH = 54;
    let baseChestW = 104;
    let shoulderDrop = 0;
    let shoulderOuterRound = 12;

    // Body dimensions scaled per tier (Biometric baseline - NEVER modified by shirt fit):
    if (strengthTier === 1) {
      // 40 to 69 (Skinny / Slender)
      const p = Math.max(0, Math.min(1, (strength - 40) / 29)); // 0 to 1
      headScale = 1.04 - p * 0.04; // 1.04 -> 1.00
      armW = Math.round(14 + p * 4); // 14 -> 18px
      neckW = Math.round(34 + p * 5); // 34 -> 39px
      neckH = Math.round(50 + p * 4); // 50 -> 54px
      baseChestW = Math.round(90 + p * 10); // 90 -> 100px
      shoulderDrop = 0;
      shoulderOuterRound = Math.round(8 + p * 3); // 8 -> 11px
    } else if (strengthTier === 2) {
      // 70 to 89 (Athletic / Standard baseline)
      const p = Math.max(0, Math.min(1, (strength - 70) / 19)); // 0 to 1
      headScale = 0.98 - p * 0.05; // 0.98 -> 0.93
      armW = Math.round(19 + p * 4); // 19 -> 23px
      neckW = Math.round(41 + p * 7); // 41 -> 48px
      neckH = Math.round(54 + p * 3); // 54 -> 57px
      baseChestW = Math.round(102 + p * 12); // 102 -> 114px
      shoulderDrop = Math.round(1 + p * 4); // 1 -> 5px
      shoulderOuterRound = Math.round(12 + p * 3); // 12 -> 15px
    } else if (strengthTier === 3) {
      // 90 to 94 (Muscular / Heavyweight)
      const p = Math.max(0, Math.min(1, (strength - 90) / 4)); // 0 to 1
      headScale = 0.91 - p * 0.03; // 0.91 -> 0.88
      armW = Math.round(25 + p * 3); // 25 -> 28px
      neckW = Math.round(50 + p * 5); // 50 -> 55px
      neckH = Math.round(57 + p * 2); // 57 -> 59px
      baseChestW = Math.round(118 + p * 6); // 118 -> 124px
      shoulderDrop = Math.round(6 + p * 2); // 6 -> 8px
      shoulderOuterRound = Math.round(16 + p * 2); // 16 -> 18px
    } else if (strengthTier === 4) {
      // 95 to 99 (Massive Beast)
      const p = Math.max(0, Math.min(1, (strength - 95) / 4)); // 0 to 1
      headScale = 0.86 - p * 0.04; // 0.86 -> 0.82
      armW = Math.round(30 + p * 4); // 30 -> 34px
      neckW = Math.round(58 + p * 6); // 58 -> 64px
      neckH = Math.round(60 + p * 2); // 60 -> 62px
      baseChestW = Math.round(128 + p * 6); // 128 -> 134px
      shoulderDrop = Math.round(9 + p * 2); // 9 -> 11px
      shoulderOuterRound = Math.round(19 + p * 3); // 19 -> 22px
    } else {
      // Tier 5: Stat Break (>= 100) - Limits pushed to maximum
      headScale = 0.77;
      armW = 38;
      neckW = 70;
      neckH = 64;
      baseChestW = 142;
      shoulderDrop = 13;
      shoulderOuterRound = 24;
    }

    const neckLeft = Math.round(108 - neckW / 2);

    // 1. CHEST SIZE IS STRICTLY BIOMETRIC (Never modified by shirt fit or sleeve style)
    const chestW = Math.round(baseChestW);
    const chestLeft = Math.round(108 - chestW / 2);
    const baseChestLeft = chestLeft;

    // 2. ARM POSITIONS ARE STRICTLY BIOMETRIC (Distance between arms is fixed to chestW - 4, never shifts with fit)
    const armLeftPos = Math.round(chestLeft - armW + 2);
    const armRightPos = Math.round(chestLeft + chestW - 2);

    // 3. SHIRT FIT & SLEEVES STYLE (Only modifies the size, cut, and drape of the shirt sleeves and jersey silhouette)
    // Distinctive in ALL strength tiers:
    // - Tight (Pro Compression): High-cut sleeves (~35px) exposing upper bicep, veins & tattoos, snug flush fit.
    // - Normal (Standard Athletic): Classic mid-bicep drape (~48px), standard athletic clearance.
    // - Loose (Classic Retro Loose): Long oversized sleeves (~56-62px) reaching down toward elbow, generous overhang flare draping past arm.
    let sleeveHeight = 48;
    let shoulderW = armW + 3;

    if (strengthTier === 1) {
      // 40-69 OVR (Slender / Skinny Frame)
      if (activeKit.style === 'tight') {
        sleeveHeight = 35;
        shoulderW = armW + 1;
      } else if (activeKit.style === 'loose') {
        sleeveHeight = 62;
        shoulderW = armW + 8; // Noticeable 90s baggy drape over slender arms
      } else {
        // normal
        sleeveHeight = 48;
        shoulderW = armW + 4;
      }
    } else if (strengthTier === 2) {
      // 70-89 OVR (Standard Athletic Baseline)
      if (activeKit.style === 'tight') {
        sleeveHeight = 36;
        shoulderW = armW + 1;
      } else if (activeKit.style === 'loose') {
        sleeveHeight = 60;
        shoulderW = armW + 7;
      } else {
        // normal
        sleeveHeight = 48;
        shoulderW = armW + 3;
      }
    } else if (strengthTier === 3) {
      // 90-94 OVR (Muscular / Heavyweight)
      if (activeKit.style === 'tight') {
        sleeveHeight = 36;
        shoulderW = armW + 1;
      } else if (activeKit.style === 'loose') {
        sleeveHeight = 58;
        shoulderW = armW + 6;
      } else {
        // normal
        sleeveHeight = 48;
        shoulderW = armW + 3;
      }
    } else if (strengthTier === 4) {
      // 95-99 OVR (Massive Beast)
      if (activeKit.style === 'tight') {
        sleeveHeight = 36;
        shoulderW = armW + 1;
      } else if (activeKit.style === 'loose') {
        sleeveHeight = 57;
        shoulderW = armW + 5;
      } else {
        // normal
        sleeveHeight = 48;
        shoulderW = armW + 2;
      }
    } else {
      // Tier 5: Stat Break (100+ OVR)
      if (activeKit.style === 'tight') {
        sleeveHeight = 35;
        shoulderW = armW + 1;
      } else if (activeKit.style === 'loose') {
        sleeveHeight = 56;
        shoulderW = armW + 4;
      } else {
        // normal
        sleeveHeight = 48;
        shoulderW = armW + 2;
      }
    }

    shoulderW = Math.round(shoulderW);

    // Calculate sleeve bottom cuff height from bottom of card
    const sleeveCuffBottom = 84 - shoulderDrop - sleeveHeight;
    // Arm starts from bottom of the card and goes up 8px inside the sleeve cuff opening.
    // This strictly prevents bare skin from appearing above the sleeve or poking through the shoulder sides,
    // while exposing full biceps and arm tattoos in tight fit, and draping lower in loose fit.
    const armH = Math.max(20, Math.round(sleeveCuffBottom + 8));

    const cLeft = Math.round((chestW - neckW) / 2);
    const emblemLeftPos = Math.round(chestW / 2 + 10);

    return {
      strength,
      strengthTier,
      isStatBreak,
      armW,
      armH,
      neckW,
      neckH,
      neckLeft,
      headScale,
      chestW,
      chestLeft,
      baseChestW,
      baseChestLeft,
      shoulderOuterRound,
      shoulderDrop,
      shoulderW,
      sleeveHeight,
      armLeftPos,
      armRightPos,
      cLeft,
      emblemLeftPos,
      kitStyle: activeKit.style || 'normal',
    };
  }, [rawStrength, player?.statBreakActive, player?.statBreakStats, player?.stats?.detailed, activeKit.style]);

  // --- HAIR STYLING CALCULATIONS ---
  const hairElements = useMemo(() => {
    const rootColor = biometrics.hairRoot || '#111111';
    const isDyed = biometrics.hairDye && biometrics.hairDye !== 'none';
    const dyeColor = isDyed ? biometrics.hairDye : rootColor;
    const style = biometrics.hairStyle;
    const length = biometrics.hairLength;
    const special = biometrics.specialHair;

    let backHair: React.ReactNode = null;
    let topHair: React.ReactNode = null;

    // Universal anatomically precise scalp cap path matching the face box semicircle skull (r=49 at 108,89, top y=40, left x=59, right x=157)
    const scalpCapPath = "M 59 82 A 49 49 0 0 1 157 82 C 153 74, 147 66, 142 62 C 132 55, 122 55, 108 56 C 94 55, 84 55, 74 62 C 69 66, 63 74, 59 82 Z";

    if (style === 'special') {
      const spec = special;

      if (!spec) {
        // Fallback if special is selected without an equipped special cut
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill={rootColor} />
            </svg>
          </div>
        );
      } else if (spec === 'r9-2002') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              {/* Shaved buzzcut base */}
              <path d={scalpCapPath} fill={rootColor} opacity="0.32" />
              {/* Sideburns subtle */}
              <path d="M 59 80 L 59 86 L 62 86 L 62 82 Z" fill={rootColor} opacity="0.4" />
              <path d="M 157 80 L 157 86 L 154 86 L 154 82 Z" fill={rootColor} opacity="0.4" />
              {/* Iconic R9 2002 Front Crescent Tuft */}
              <path
                d="M 80 72 C 84 52, 100 42, 108 42 C 116 42, 132 52, 136 72 C 124 67, 92 67, 80 72 Z"
                fill={dyeColor && dyeColor !== 'none' ? dyeColor : rootColor}
              />
              <path
                d="M 84 71 C 88 56, 101 47, 108 47 C 115 47, 128 56, 132 71 C 122 67, 94 67, 84 71 Z"
                fill={rootColor}
                opacity="0.9"
              />
            </svg>
          </div>
        );
      } else if (spec === 'valderrama-afro') {
        backHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
            <svg className="w-full h-full">
              <circle cx="108" cy="65" r="76" fill="#713f12" />
              <circle cx="48" cy="80" r="50" fill="#854d0e" />
              <circle cx="168" cy="80" r="50" fill="#854d0e" />
              <circle cx="108" cy="62" r="72" fill="#eab308" />
              <circle cx="50" cy="76" r="46" fill="#eab308" />
              <circle cx="166" cy="76" r="46" fill="#eab308" />
            </svg>
          </div>
        );
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <ellipse cx="108" cy="38" rx="62" ry="34" fill="#eab308" />
              <ellipse cx="70" cy="42" rx="30" ry="24" fill="#facc15" />
              <ellipse cx="146" cy="42" rx="30" ry="24" fill="#facc15" />
              <path d="M 60 52 Q 108 38 156 52" fill="none" stroke="#854d0e" strokeWidth="3" opacity="0.7" />
            </svg>
          </div>
        );
      } else if ((spec as any) === 'baggio-ponytail') {
        backHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
            <svg className="w-full h-full">
              <path d="M 102 85 C 100 115, 96 145, 104 170 L 112 170 C 120 145, 116 115, 114 85 Z" fill="#18181b" />
              <path d="M 104 90 L 112 165" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 2" />
              <rect x="101" y="85" width="14" height="5" rx="2" fill="#2563eb" />
              <rect x="103" y="86" width="10" height="3" rx="1" fill="#facc15" />
            </svg>
          </div>
        );
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#18181b" />
              <circle cx="70" cy="44" r="6" fill="#27272a" />
              <circle cx="84" cy="38" r="7" fill="#27272a" />
              <circle cx="100" cy="36" r="7.5" fill="#27272a" />
              <circle cx="116" cy="36" r="7.5" fill="#27272a" />
              <circle cx="132" cy="38" r="7" fill="#27272a" />
              <circle cx="146" cy="44" r="6" fill="#27272a" />
            </svg>
          </div>
        );
      } else if (spec === 'davids-goggles') {
        const topDreads = [68, 76, 84, 92, 100, 108, 116, 124, 132, 140, 148];
        const backDreads = [56, 64, 72, 80, 88, 128, 136, 144, 152, 160];
        backHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
            <svg className="w-full h-full">
              {backDreads.map((x) => (
                <g key={x}>
                  <rect x={x - 4} y="55" width="8" height="90" rx="4" fill="#18181b" />
                  <rect x={x - 3} y="55" width="6" height="45" rx="3" fill="#3f3f46" />
                </g>
              ))}
            </svg>
          </div>
        );
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#18181b" />
              {topDreads.map((x) => {
                const y1 = Math.round(89 - Math.sqrt(Math.max(0, 2401 - Math.pow(x - 108, 2)))) - 4;
                return <line key={x} x1={x} y1={y1} x2={x} y2="58" stroke="#27272a" strokeWidth="5" strokeLinecap="round" />;
              })}
              {/* Edgar Davids Orange Goggles */}
              <rect x="52" y="86" width="112" height="6" rx="2" fill="#09090b" />
              <rect x="64" y="82" width="38" height="20" rx="6" fill="#09090b" stroke="#3b82f6" strokeWidth="1.5" />
              <rect x="114" y="82" width="38" height="20" rx="6" fill="#09090b" stroke="#3b82f6" strokeWidth="1.5" />
              <rect x="67" y="85" width="32" height="14" rx="4" fill="#f97316" opacity="0.85" />
              <rect x="117" y="85" width="32" height="14" rx="4" fill="#f97316" opacity="0.85" />
              <line x1="72" y1="87" x2="82" y2="97" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <line x1="122" y1="87" x2="132" y2="97" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <rect x="102" y="88" width="12" height="5" rx="2" fill="#09090b" />
            </svg>
          </div>
        );
      } else if (spec === 'beckham-mohawk') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#b45309" opacity="0.4" />
              <path d="M 90 48 L 94 14 Q 108 8 122 14 L 126 48 Z" fill="#eab308" />
              <path d="M 96 48 L 98 18 L 108 12 L 118 18 L 120 48 Z" fill="#fef08a" />
              <line x1="104" y1="48" x2="106" y2="15" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
              <line x1="112" y1="48" x2="110" y2="15" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
            </svg>
          </div>
        );
      } else if (spec === 'el-shaarawy-spikes') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              {/* Shaved temple & scalp base */}
              <path d={scalpCapPath} fill="#09090b" opacity="0.95" />
              {/* Shaved razor side slit line on left temple */}
              <path d="M 62 66 L 80 50" stroke={biometrics.skinColor} strokeWidth="3.2" strokeLinecap="round" />
              <path d="M 62 66 L 80 50" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              {/* Taller high-volume Faraone mohawk crest */}
              <path d="M 76 52 L 70 -16 L 82 12 L 94 -24 L 104 8 L 112 -28 L 122 10 L 132 -18 L 140 52 Z" fill={rootColor} />
              <path d="M 80 52 L 76 -8 L 86 18 L 96 -16 L 104 14 L 112 -20 L 120 16 L 128 -10 L 136 52 Z" fill={dyeColor && dyeColor !== 'none' ? dyeColor : '#27272a'} />
              <path d="M 94 -22 L 98 4 M 112 -26 L 114 4 M 130 -16 L 132 8" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        );
      } else if (spec === 'taribo-west') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#18181b" />
              <path d="M 78 40 C 65 28, 56 12, 66 6 C 76 4, 82 18, 84 38 Z" fill="#10b981" />
              <rect x="73" y="32" width="12" height="4" rx="2" fill="#ef4444" />
              <rect x="73" y="26" width="12" height="3" rx="1.5" fill="#facc15" />

              <path d="M 138 40 C 151 28, 160 12, 150 6 C 140 4, 134 18, 132 38 Z" fill="#10b981" />
              <rect x="131" y="32" width="12" height="4" rx="2" fill="#ef4444" />
              <rect x="131" y="26" width="12" height="3" rx="1.5" fill="#facc15" />
            </svg>
          </div>
        );
      } else if (spec === 'ronaldo-noodle') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#1c1917" />
              <path d="M 72 36 Q 80 22 88 34" fill="none" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
              <path d="M 88 34 Q 96 20 102 32" fill="none" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
              <path d="M 102 32 Q 110 18 116 32" fill="none" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
              <path d="M 116 32 Q 124 20 130 34" fill="none" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
              <path d="M 130 34 Q 138 22 144 36" fill="none" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
        );
      } else if (spec === 'neymar-mohawk') {
        backHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
            <svg className="w-full h-full">
              <path d="M 90 60 L 86 128 Q 108 140 130 128 L 126 60 Z" fill="#facc15" />
            </svg>
          </div>
        );
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#1c1917" opacity="0.6" />
              <path d="M 84 50 L 78 14 L 92 26 L 104 8 L 114 26 L 128 12 L 132 50 Z" fill="#facc15" />
            </svg>
          </div>
        );
      } else if (spec === 'pogba-razor') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#18181b" />
              <path d="M 112 34 Q 134 28 148 42 Z" fill="#06b6d4" />
              <path d="M 60 66 C 68 60, 74 68, 82 62 C 76 72, 64 72, 60 66 Z" fill="#ffffff" opacity="0.95" />
            </svg>
          </div>
        );
      } else if (spec === 'vidal-crest') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#1c1917" opacity="0.55" />
              <path d="M 94 52 L 92 16 Q 108 8 124 16 L 122 52 Z" fill="#09090b" />
              <path d="M 64 68 L 76 72 L 68 80 L 82 84" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
              <path d="M 152 68 L 140 72 L 148 80 L 134 84" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
            </svg>
          </div>
        );
      } else if (spec === 'puyol-curly') {
        backHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
            <svg className="w-full h-full">
              <path d="M 32 40 C 12 80, 20 150, 46 195 L 170 195 C 196 150, 204 80, 184 40 Z" fill="#1c1917" />
              <circle cx="38" cy="70" r="18" fill="#1c1917" />
              <circle cx="178" cy="70" r="18" fill="#1c1917" />
              <circle cx="32" cy="110" r="16" fill="#1c1917" />
              <circle cx="184" cy="110" r="16" fill="#1c1917" />
            </svg>
          </div>
        );
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d="M 48 48 C 30 20, 68 8, 108 10 C 148 8, 186 20, 168 48 Z" fill="#1c1917" />
              <circle cx="62" cy="34" r="14" fill="#27272a" />
              <circle cx="86" cy="24" r="16" fill="#27272a" />
              <circle cx="108" cy="20" r="18" fill="#27272a" />
              <circle cx="130" cy="24" r="16" fill="#27272a" />
              <circle cx="154" cy="34" r="14" fill="#27272a" />
            </svg>
          </div>
        );
      } else if (spec === 'cucurella-afro') {
        backHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
            <svg className="w-full h-full">
              {/* Massive voluminous background afro volume */}
              <ellipse cx="108" cy="72" rx="72" ry="58" fill="#09090b" />
              <circle cx="36" cy="85" r="42" fill="#09090b" />
              <circle cx="180" cy="85" r="42" fill="#09090b" />
              <circle cx="42" cy="125" r="38" fill="#09090b" />
              <circle cx="174" cy="125" r="38" fill="#09090b" />
              {/* Cascading wild curls down shoulders */}
              <path d="M 28 110 C 18 150, 30 185, 52 205 Q 68 180, 58 130 Z" fill="#18181b" />
              <path d="M 188 110 C 198 150, 186 185, 164 205 Q 148 180, 158 130 Z" fill="#18181b" />
            </svg>
          </div>
        );
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              {/* Solid scalp cap to guarantee zero skin showing */}
              <path d={scalpCapPath} fill="#09090b" />
              {/* Voluminous bouncy front/top curly ringlets */}
              <ellipse cx="108" cy="38" rx="64" ry="32" fill="#18181b" />
              {/* Individual ringlet clusters for Cucurella's iconic volume */}
              <circle cx="52" cy="46" r="22" fill="#18181b" stroke="#27272a" strokeWidth="2" />
              <circle cx="76" cy="34" r="24" fill="#27272a" stroke="#09090b" strokeWidth="2" />
              <circle cx="108" cy="28" r="26" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
              <circle cx="140" cy="34" r="24" fill="#27272a" stroke="#09090b" strokeWidth="2" />
              <circle cx="164" cy="46" r="22" fill="#18181b" stroke="#27272a" strokeWidth="2" />
              {/* Front curly bangs overlapping forehead organically */}
              <circle cx="62" cy="56" r="14" fill="#09090b" />
              <circle cx="84" cy="52" r="15" fill="#18181b" />
              <circle cx="108" cy="50" r="16" fill="#09090b" />
              <circle cx="132" cy="52" r="15" fill="#18181b" />
              <circle cx="154" cy="56" r="14" fill="#09090b" />
            </svg>
          </div>
        );
      } else if ((spec as any) === 'afro') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <ellipse cx="108" cy="48" rx="60" ry="36" fill="#18181b" />
              <circle cx="58" cy="52" r="24" fill="#18181b" />
              <circle cx="158" cy="52" r="24" fill="#18181b" />
              <circle cx="108" cy="38" r="30" fill="#27272a" />
            </svg>
          </div>
        );
      } else if (spec === 'cornrows') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#18181b" />
              <path d="M 68 62 C 72 35, 90 22, 108 22" fill="none" stroke="#3f3f46" strokeWidth="4" strokeDasharray="3 3" />
              <path d="M 82 60 C 86 38, 98 25, 108 25" fill="none" stroke="#27272a" strokeWidth="4" strokeDasharray="3 3" />
              <path d="M 108 58 L 108 22" fill="none" stroke="#3f3f46" strokeWidth="4" strokeDasharray="3 3" />
              <path d="M 134 60 C 130 38, 118 25, 108 25" fill="none" stroke="#27272a" strokeWidth="4" strokeDasharray="3 3" />
              <path d="M 148 62 C 144 35, 126 22, 108 22" fill="none" stroke="#3f3f46" strokeWidth="4" strokeDasharray="3 3" />
            </svg>
          </div>
        );
      } else if (spec === 'locs') {
        backHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
            <svg className="w-full h-full">
              <path d="M 40 80 Q 25 140 38 190" fill="none" stroke="#18181b" strokeWidth="10" strokeLinecap="round" />
              <path d="M 176 80 Q 191 140 178 190" fill="none" stroke="#18181b" strokeWidth="10" strokeLinecap="round" />
              <path d="M 52 90 Q 40 150, 56 195" fill="none" stroke="#27272a" strokeWidth="8" strokeLinecap="round" />
              <path d="M 164 90 Q 176 150, 160 195" fill="none" stroke="#27272a" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
        );
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#18181b" />
              <path d="M 72 58 Q 60 20, 108 20" fill="none" stroke="#27272a" strokeWidth="7" strokeLinecap="round" />
              <path d="M 144 58 Q 156 20, 108 20" fill="none" stroke="#27272a" strokeWidth="7" strokeLinecap="round" />
              <path d="M 108 56 L 108 18" fill="none" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
        );
      } else if (spec === 'braid-top') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#18181b" opacity="0.4" />
              <circle cx="108" cy="22" r="18" fill="#18181b" stroke="#3f3f46" strokeWidth="3" />
              <path d="M 90 48 Q 108 25 126 48 Z" fill="#27272a" />
            </svg>
          </div>
        );
      } else if (spec === 'zidane-bald-ring') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              {/* Natural Horseshoe bald ring hugging skull sides without sticking out */}
              <path
                d="M 59 82 C 59 62, 64 50, 74 46 C 84 62, 132 62, 142 46 C 152 50, 157 62, 157 82 C 153 74, 147 68, 142 66 C 132 72, 84 72, 74 66 C 69 68, 63 74, 59 82 Z"
                fill={rootColor}
                opacity="0.92"
              />
              {/* Sideburns */}
              <path d="M 59 80 L 59 90 L 62 90 L 62 82 Z" fill={rootColor} opacity="0.85" />
              <path d="M 157 80 L 157 90 L 154 90 L 154 82 Z" fill={rootColor} opacity="0.85" />
            </svg>
          </div>
        );
      } else if (spec === 'beckham-fauxhawk') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#18181b" opacity="0.5" />
              <path d="M 88 56 Q 108 10 128 56 Q 108 42 88 56 Z" fill="#eab308" />
            </svg>
          </div>
        );
      } else {
        // Fallback default for any special haircut
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <path d={scalpCapPath} fill="#18181b" />
              <ellipse cx="108" cy="40" rx="48" ry="24" fill="#27272a" />
            </svg>
          </div>
        );
      }
    } else {
      // STANDARD HAIRSTYLES
      if (length === 'shaved') {
        topHair = (
          <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
            <svg className="w-full h-full">
              <defs>
                {/* Buzz cut gradient: rich natural follicle density on crown, smooth taper at temples */}
                <linearGradient id="buzzCutGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={rootColor} stopOpacity="0.94" />
                  <stop offset="45%" stopColor={rootColor} stopOpacity="0.88" />
                  <stop offset="100%" stopColor={rootColor} stopOpacity="0.78" />
                </linearGradient>
                <radialGradient id="buzzCrownHighlight" cx="50%" cy="25%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                  <stop offset="65%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>

              {/* 1. Main Buzz Cut Stubble Base - Exact anatomical skull fit */}
              <path d={scalpCapPath} fill="url(#buzzCutGradient)" />

              {/* 2. Sideburns tapering down to ears (x=59, y=80..92 and x=157, y=80..92) */}
              <path
                d="M 59 80 L 59 92 L 62 92 L 62 82 Z"
                fill={rootColor}
                opacity="0.82"
              />
              <path
                d="M 157 80 L 157 92 L 154 92 L 154 82 Z"
                fill={rootColor}
                opacity="0.82"
              />

              {/* 3. Crown light reflection giving 3D skull curvature */}
              <path d={scalpCapPath} fill="url(#buzzCrownHighlight)" />

              {/* 4. Fine buzz cut clipper / grain texture arcs across the crown */}
              <path
                d="M 76 50 Q 108 43 140 50"
                fill="none"
                stroke={rootColor}
                strokeWidth="1.5"
                strokeOpacity="0.6"
                strokeDasharray="2 3"
              />
              <path
                d="M 72 58 Q 108 49 144 58"
                fill="none"
                stroke={rootColor}
                strokeWidth="1.5"
                strokeOpacity="0.5"
                strokeDasharray="3 3"
              />
              <path
                d="M 80 44 Q 108 39 136 44"
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* 5. Sharp Barber Lineup edge definition along forehead */}
              <path
                d="M 59 82 C 63 74, 69 66, 74 62 C 84 55, 94 55, 108 56 C 122 55, 132 55, 142 62 C 147 66, 153 74, 157 82"
                fill="none"
                stroke={rootColor}
                strokeWidth="1.2"
                strokeOpacity="0.9"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      } else if (length === 'fade' || (length as any) === 'very-short') {
        // SHORT FADE CUTS: Faded sides with compact, low-profile top (noticeably shorter and tighter than standard short hair)
        if (style === 'straight') {
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Clean side skin fade base */}
                <path d={scalpCapPath} fill={rootColor} opacity="0.6" />
                {/* Low-profile short textured crop top (height y=34, hugging crown closely) */}
                <path
                  d="M 64 62 C 64 36, 76 34, 108 34 C 140 34, 152 36, 152 62 C 140 56, 126 54, 108 54 C 90 54, 76 56, 64 62 Z"
                  fill={dyeColor}
                />
                {/* Crisp short crop texture lines & blunt barber fringe */}
                <path d="M 76 54 L 78 38" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 92 52 L 93 36" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 108 50 L 108 35" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 124 52 L 123 36" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 140 54 L 138 38" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
                {/* Sharp lineup edge definition along forehead */}
                <path d="M 66 60 Q 108 53 150 60" fill="none" stroke={rootColor} strokeWidth="1.2" />
              </svg>
            </div>
          );
        } else if (style === 'wavy') {
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Clean side skin fade base */}
                <path d={scalpCapPath} fill={rootColor} opacity="0.6" />
                {/* Low-profile 360 wave top */}
                <path
                  d="M 64 62 C 64 36, 76 35, 108 35 C 140 35, 152 36, 152 62 C 140 56, 126 54, 108 54 C 90 54, 76 56, 64 62 Z"
                  fill={dyeColor}
                />
                {/* Tight concentric wave ripples hugging skull closely */}
                <path d="M 72 52 Q 108 45 144 52" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 76 46 Q 108 39 140 46" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 84 40 Q 108 35 132 40" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          );
        } else if (style === 'curly') {
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Clean side skin fade base */}
                <path d={scalpCapPath} fill={rootColor} opacity="0.6" />
                {/* Short tight curl deck */}
                <path
                  d="M 64 62 C 64 34, 76 32, 108 32 C 140 32, 152 34, 152 62 C 140 56, 126 54, 108 54 C 90 54, 76 56, 64 62 Z"
                  fill={dyeColor}
                />
                {/* Short compact micro-sponge coils */}
                <circle cx="78" cy="42" r="3.5" fill={dyeColor} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <circle cx="92" cy="38" r="4" fill={dyeColor} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <circle cx="108" cy="36" r="4.5" fill={dyeColor} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <circle cx="124" cy="38" r="4" fill={dyeColor} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <circle cx="138" cy="42" r="3.5" fill={dyeColor} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <circle cx="86" cy="48" r="3.5" fill={dyeColor} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <circle cx="100" cy="46" r="4" fill={dyeColor} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <circle cx="116" cy="46" r="4" fill={dyeColor} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <circle cx="130" cy="48" r="3.5" fill={dyeColor} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              </svg>
            </div>
          );
        } else if (style === 'braided') {
          // FADE BRAIDS: Clean geometric cornrow tracks going straight back over the crown from the hairline with tapered faded sides
          const fadeCornrowTracks = [
            // Center track
            { x1: 108, y1: 56, x2: 108, y2: 24, w: 4.8 },
            // Inner tracks
            { x1: 97, y1: 56, x2: 98, y2: 25, w: 4.5 },
            { x1: 119, y1: 56, x2: 118, y2: 25, w: 4.5 },
            // Mid tracks
            { x1: 86, y1: 58, x2: 89, y2: 28, w: 4.2 },
            { x1: 130, y1: 58, x2: 127, y2: 28, w: 4.2 },
            // Outer tracks curving over top deck
            { x1: 76, y1: 60, x2: 81, y2: 34, w: 3.8 },
            { x1: 140, y1: 60, x2: 135, y2: 34, w: 3.8 },
          ];

          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* 1. Clean side skin fade base with temple taper */}
                <path d={scalpCapPath} fill={rootColor} opacity="0.55" />

                {/* 2. Top deck base layer under cornrows */}
                <path
                  d="M 66 62 C 66 36, 78 30, 108 30 C 138 30, 150 36, 150 62 C 140 56, 126 54, 108 54 C 90 54, 76 56, 66 62 Z"
                  fill={rootColor}
                  opacity="0.8"
                />

                {/* 3. Scalp parting lines between cornrows */}
                <path d="M 102.5 56 L 103 25" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                <path d="M 113.5 56 L 113 25" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                <path d="M 91.5 57 L 93.5 27" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                <path d="M 124.5 57 L 122.5 27" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

                {/* 4. Raised 3D cornrow braid tracks running straight back */}
                {fadeCornrowTracks.map((trk, i) => (
                  <g key={i}>
                    {/* Shadow underneath */}
                    <line
                      x1={trk.x1}
                      y1={trk.y1}
                      x2={trk.x2}
                      y2={trk.y2}
                      stroke={rootColor}
                      strokeWidth={trk.w + 1.5}
                      strokeLinecap="round"
                    />
                    {/* Braided strand with interlocking segment texture */}
                    <line
                      x1={trk.x1}
                      y1={trk.y1}
                      x2={trk.x2}
                      y2={trk.y2}
                      stroke={dyeColor}
                      strokeWidth={trk.w}
                      strokeDasharray="4 2"
                      strokeLinecap="round"
                    />
                    {/* Gloss sheen across braids */}
                    <line
                      x1={trk.x1}
                      y1={trk.y1 - 1}
                      x2={trk.x2}
                      y2={trk.y2}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth={1.2}
                      strokeDasharray="2 4"
                    />
                  </g>
                ))}

                {/* 5. Sharp Barber Lineup edge definition along forehead */}
                <path
                  d="M 66 60 Q 108 53 150 60"
                  fill="none"
                  stroke={rootColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        } else if (style === 'dreads') {
          // FADE DREADLOCKS: High-top dread fade with distinct dreadlocks standing and bursting upwards, clean faded sides
          const upwardDreadLocs = [
            // Center tall dreads standing straight up
            { x1: 108, y1: 52, x2: 108, y2: 10, w: 6.5, cuff: true, cuffY: 22 },
            { x1: 101, y1: 53, x2: 99, y2: 14, w: 6.0, cuff: false, cuffY: 0 },
            { x1: 115, y1: 53, x2: 117, y2: 14, w: 6.0, cuff: true, cuffY: 26 },
            // Inner angle dreads
            { x1: 93, y1: 54, x2: 89, y2: 18, w: 5.8, cuff: false, cuffY: 0 },
            { x1: 123, y1: 54, x2: 127, y2: 18, w: 5.8, cuff: false, cuffY: 0 },
            // Mid angle dreads
            { x1: 84, y1: 56, x2: 78, y2: 24, w: 5.2, cuff: true, cuffY: 34 },
            { x1: 132, y1: 56, x2: 138, y2: 24, w: 5.2, cuff: false, cuffY: 0 },
            // Outer angle dreads
            { x1: 76, y1: 58, x2: 68, y2: 32, w: 4.8, cuff: false, cuffY: 0 },
            { x1: 140, y1: 58, x2: 148, y2: 32, w: 4.8, cuff: false, cuffY: 0 },
            // Front organic layering dreads filling the top crown
            { x1: 90, y1: 56, x2: 87, y2: 36, w: 4.5, cuff: false, cuffY: 0 },
            { x1: 108, y1: 55, x2: 108, y2: 34, w: 5.0, cuff: false, cuffY: 0 },
            { x1: 126, y1: 56, x2: 129, y2: 36, w: 4.5, cuff: false, cuffY: 0 },
          ];

          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* 1. Clean side skin fade base with temple taper */}
                <path d={scalpCapPath} fill={rootColor} opacity="0.55" />

                {/* 2. Elevated high-top crown dread foundation deck */}
                <path
                  d="M 64 62 C 64 36, 76 28, 108 28 C 140 28, 152 36, 152 62 C 140 56, 126 54, 108 54 C 90 54, 76 56, 64 62 Z"
                  fill={dyeColor}
                  opacity="0.9"
                />

                {/* 3. Upward standing dreadlocks with twist textures & highlights */}
                {upwardDreadLocs.map((loc, idx) => (
                  <g key={idx}>
                    {/* Shadow / root contour */}
                    <line
                      x1={loc.x1}
                      y1={loc.y1}
                      x2={loc.x2}
                      y2={loc.y2}
                      stroke={rootColor}
                      strokeWidth={loc.w + 1.5}
                      strokeLinecap="round"
                    />
                    {/* Main loc shaft */}
                    <line
                      x1={loc.x1}
                      y1={loc.y1}
                      x2={loc.x2}
                      y2={loc.y2}
                      stroke={dyeColor}
                      strokeWidth={loc.w}
                      strokeLinecap="round"
                    />
                    {/* Twist highlight sheen */}
                    <line
                      x1={loc.x1 + (loc.x2 - loc.x1) * 0.25}
                      y1={loc.y1 + (loc.y2 - loc.y1) * 0.25}
                      x2={loc.x2}
                      y2={loc.y2}
                      stroke="rgba(255,255,255,0.28)"
                      strokeWidth={loc.w * 0.35}
                      strokeLinecap="round"
                    />
                    {/* Metallic gold accent ring/cuff on highlighted locs */}
                    {loc.cuff && (
                      <circle
                        cx={loc.x1 + (loc.x2 - loc.x1) * 0.65}
                        cy={loc.cuffY}
                        r={loc.w * 0.45}
                        fill="#f59e0b"
                        stroke="#78350f"
                        strokeWidth="0.6"
                      />
                    )}
                  </g>
                ))}

                {/* 4. Sharp Barber Lineup edge definition along forehead */}
                <path
                  d="M 64 60 Q 108 53 152 60"
                  fill="none"
                  stroke={rootColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        } else {
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                <path d={scalpCapPath} fill={dyeColor} opacity="0.88" />
              </svg>
            </div>
          );
        }
      } else if (length === 'short') {
        if (style === 'straight') {
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Scalp root cap base with dye & root undertone */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />
                {/* Short straight hair volume perfectly hugging the skull silhouette (no side overflow) */}
                <path
                  d="M 58 76 C 58 40, 70 24, 108 22 C 146 22, 158 40, 158 76 C 148 60, 132 50, 108 50 C 84 50, 68 60, 58 76 Z"
                  fill={dyeColor}
                />
                <path d="M 72 36 Q 108 24 144 36" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 80 28 Q 108 18 136 28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
          );
        } else if (style === 'wavy') {
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Scalp root cap base with dye & root undertone */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />
                {/* Short Wavy/Flow volume hugging skull width snugly */}
                <path
                  d="M 58 76 C 58 38, 66 26, 76 22 Q 86 16, 96 20 Q 108 16, 120 20 Q 130 16, 140 22 C 150 26, 158 38, 158 76 C 148 60, 132 52, 108 52 C 84 52, 68 60, 58 76 Z"
                  fill={dyeColor}
                />
                <path d="M 68 44 Q 78 36 88 40 T 108 36 T 128 40 T 144 44" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 74 32 Q 84 24 94 28 T 108 24 T 122 28 T 138 32" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          );
        } else if (style === 'curly') {
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Scalp root cap base with dye & root undertone */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />
                {/* Short curly deck contoured inside head profile */}
                <path
                  d="M 58 76 C 58 38, 70 22, 108 20 C 146 20, 158 38, 158 76 C 148 60, 132 50, 108 50 C 84 50, 68 60, 58 76 Z"
                  fill={dyeColor}
                />
                {/* Compact curly ringlet clusters */}
                <circle cx="74" cy="34" r="7" fill={dyeColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                <circle cx="86" cy="28" r="7.5" fill={dyeColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                <circle cx="98" cy="24" r="8" fill={dyeColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                <circle cx="110" cy="23" r="8" fill={dyeColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                <circle cx="122" cy="25" r="7.5" fill={dyeColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                <circle cx="134" cy="29" r="7.5" fill={dyeColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                <circle cx="144" cy="35" r="6.5" fill={dyeColor} stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
                {/* Forehead curl fringe */}
                <circle cx="82" cy="46" r="6" fill={dyeColor} />
                <circle cx="96" cy="44" r="6.5" fill={dyeColor} />
                <circle cx="110" cy="43" r="6.5" fill={dyeColor} />
                <circle cx="124" cy="44" r="6.5" fill={dyeColor} />
                <circle cx="136" cy="47" r="5.5" fill={dyeColor} />
                {/* Highlights */}
                <circle cx="98" cy="23" r="2.5" fill="rgba(255,255,255,0.3)" />
                <circle cx="118" cy="24" r="2.5" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
          );
        } else if (style === 'braided') {
          // SHORT BRAIDS: Clean, close-to-head cornrows hugging the skull contours without hanging back braids
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Scalp root cap base with clear parts */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.45" />
                
                {/* Distinct geometric cornrow tracks hugging the head from hairline to crown */}
                {/* Center cornrow */}
                <path d="M 108 56 L 108 26" stroke={rootColor} strokeWidth="5.5" strokeLinecap="round" />
                <path d="M 108 56 L 108 26" stroke={dyeColor} strokeWidth="4.5" strokeDasharray="4 2.5" strokeLinecap="round" />
                
                {/* Inner left & right tracks */}
                <path d="M 96 56 Q 95 44 94 28" fill="none" stroke={dyeColor} strokeWidth="4.2" strokeDasharray="4 2.5" strokeLinecap="round" />
                <path d="M 120 56 Q 121 44 122 28" fill="none" stroke={dyeColor} strokeWidth="4.2" strokeDasharray="4 2.5" strokeLinecap="round" />
                
                {/* Mid left & right tracks */}
                <path d="M 84 60 Q 81 48 78 32" fill="none" stroke={dyeColor} strokeWidth="4" strokeDasharray="4 2.5" strokeLinecap="round" />
                <path d="M 132 60 Q 135 48 138 32" fill="none" stroke={dyeColor} strokeWidth="4" strokeDasharray="4 2.5" strokeLinecap="round" />
                
                {/* Outer left & right tracks hugging temples */}
                <path d="M 72 66 Q 68 54 64 38" fill="none" stroke={dyeColor} strokeWidth="3.8" strokeDasharray="4 2.5" strokeLinecap="round" />
                <path d="M 144 66 Q 148 54 152 38" fill="none" stroke={dyeColor} strokeWidth="3.8" strokeDasharray="4 2.5" strokeLinecap="round" />

                {/* Fine highlight sheen across braided cornrows */}
                <path d="M 108 52 L 108 30" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3 3.5" />
                <path d="M 96 52 Q 95 44 94 32" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3 3.5" />
                <path d="M 120 52 Q 121 44 122 32" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeDasharray="3 3.5" />
              </svg>
            </div>
          );
        } else if (style === 'dreads') {
          // SHORT DREADLOCKS: Clean, proportioned short locs hugging the skull silhouette (no side overflow)
          const shortDreadLocs = [
            // Left angled dreads (inside skull silhouette)
            { x1: 72, y1: 54, x2: 66, y2: 26, w: 4.8 },
            { x1: 80, y1: 50, x2: 76, y2: 20, w: 5.0 },
            { x1: 89, y1: 46, x2: 86, y2: 16, w: 5.2 },
            { x1: 99, y1: 44, x2: 97, y2: 14, w: 5.5 },
            // Center upward dread
            { x1: 108, y1: 42, x2: 108, y2: 12, w: 5.6 },
            // Right angled dreads (inside skull silhouette)
            { x1: 117, y1: 44, x2: 119, y2: 14, w: 5.5 },
            { x1: 127, y1: 46, x2: 130, y2: 16, w: 5.2 },
            { x1: 136, y1: 50, x2: 140, y2: 20, w: 5.0 },
            { x1: 144, y1: 54, x2: 150, y2: 26, w: 4.8 },
            // Front layering dreads adding organic density
            { x1: 84, y1: 54, x2: 82, y2: 30, w: 4.5 },
            { x1: 102, y1: 52, x2: 101, y2: 24, w: 4.8 },
            { x1: 114, y1: 52, x2: 115, y2: 24, w: 4.8 },
            { x1: 132, y1: 54, x2: 134, y2: 30, w: 4.5 },
          ];

          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Scalp root cap base with dye & root undertone */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />
                
                {/* Organic dread crown foundation contoured to head width */}
                <path
                  d="M 58 74 C 58 36, 72 22, 108 22 C 144 22, 158 36, 158 74 C 146 58, 130 50, 108 50 C 86 50, 70 58, 58 74 Z"
                  fill={dyeColor}
                  opacity="0.96"
                />

                {/* Individual short dreadlocks sprouting upward and outward */}
                {shortDreadLocs.map((loc, i) => (
                  <g key={i}>
                    {/* Shadow / root contour */}
                    <line
                      x1={loc.x1}
                      y1={loc.y1}
                      x2={loc.x2}
                      y2={loc.y2}
                      stroke={rootColor}
                      strokeWidth={loc.w + 1.2}
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                    {/* Main dreadlock shaft */}
                    <line
                      x1={loc.x1}
                      y1={loc.y1}
                      x2={loc.x2}
                      y2={loc.y2}
                      stroke={dyeColor}
                      strokeWidth={loc.w}
                      strokeLinecap="round"
                    />
                    {/* Lock twist sheen / highlight */}
                    <line
                      x1={loc.x1 + (loc.x2 - loc.x1) * 0.2}
                      y1={loc.y1 + (loc.y2 - loc.y1) * 0.2}
                      x2={loc.x2}
                      y2={loc.y2}
                      stroke="rgba(255,255,255,0.28)"
                      strokeWidth={loc.w * 0.35}
                      strokeLinecap="round"
                    />
                  </g>
                ))}
              </svg>
            </div>
          );
        }
      } else if (length === 'medium') {
        if (style === 'straight') {
          // MEDIUM STRAIGHT: Tall, sculpted pompadour / quiff with clean tapered sides hugging head width
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full" overflow="visible">
                {/* Layer 1: Scalp Cap Foundation hugging skull (x: 59 to 157) */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />

                {/* Layer 2: Sleek tapered temples (tapered to skull width, no bulging) */}
                <path
                  d="M 58 82 C 58 62, 66 48, 80 44 L 80 58 C 70 62, 62 70, 58 82 Z"
                  fill={rootColor}
                  opacity="0.65"
                />
                <path
                  d="M 158 82 C 158 62, 150 48, 136 44 L 136 58 C 146 62, 154 70, 158 82 Z"
                  fill={rootColor}
                  opacity="0.65"
                />

                {/* Layer 3: Main Tall Pompadour Volume - sweeping upward from forehead to crown */}
                <path
                  d="M 64 68 C 62 38, 76 12, 108 12 C 140 12, 154 38, 152 68 C 140 54, 126 44, 108 44 C 90 44, 76 54, 64 68 Z"
                  fill={dyeColor}
                />

                {/* Layer 4: Pompadour High Front Lift & Rolled Crest */}
                <path
                  d="M 72 58 C 70 24, 82 8, 108 8 C 134 8, 146 24, 144 58 C 134 48, 122 42, 108 42 C 94 42, 82 48, 72 58 Z"
                  fill={dyeColor}
                />
                <path
                  d="M 78 52 C 76 20, 86 6, 108 6 C 130 6, 140 20, 138 52 C 128 44, 118 40, 108 40 C 98 40, 88 44, 78 52 Z"
                  fill={dyeColor}
                  opacity="0.95"
                />

                {/* Layer 5: Brushed-back texture striations & glossy highlights */}
                <path d="M 82 48 C 82 24, 92 12, 108 11" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 94 50 C 94 26, 100 14, 108 13" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M 122 50 C 122 26, 116 14, 108 13" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M 134 48 C 134 24, 124 12, 108 11" fill="none" stroke="rgba(255,255,255,0.38)" strokeWidth="2.2" strokeLinecap="round" />

                {/* Subtle depth shadow under the pompadour front roll */}
                <path
                  d="M 74 58 C 84 52, 96 48, 108 48 C 120 48, 132 52, 142 58 C 130 52, 120 50, 108 50 C 96 50, 86 52, 74 58 Z"
                  fill={rootColor}
                  opacity="0.35"
                />
              </svg>
            </div>
          );
        } else if (style === 'wavy') {
          backHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
              <svg className="w-full h-full">
                {/* Medium wavy back silhouette */}
                <path d="M 34 46 Q 20 85 36 150 L 180 150 Q 196 85 182 46 Z" fill={dyeColor} />
                {/* Side wave billows */}
                <circle cx="40" cy="90" r="22" fill={dyeColor} />
                <circle cx="176" cy="90" r="22" fill={dyeColor} />
                <circle cx="36" cy="125" r="20" fill={dyeColor} />
                <circle cx="180" cy="125" r="20" fill={dyeColor} />
              </svg>
            </div>
          );
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Layer 1: Solid Gap-Filling Scalp Foundation */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />
                <path
                  d="M 40 76 C 32 20, 60 8, 108 8 C 156 8, 184 20, 176 76 C 160 56, 134 44, 108 44 C 82 44, 56 56, 40 76 Z"
                  fill={dyeColor}
                />

                {/* Layer 2: Medium wave canopy over crown & temples */}
                <path
                  d="M 44 64 C 38 16, 64 6, 108 6 C 152 6, 178 16, 172 64 C 156 46, 134 32, 108 32 C 82 32, 60 46, 44 64 Z"
                  fill={dyeColor}
                />

                {/* Layer 3: Textured wave clusters */}
                <circle cx="56" cy="40" r="16" fill={dyeColor} />
                <circle cx="80" cy="30" r="18" fill={dyeColor} />
                <circle cx="108" cy="24" r="20" fill={dyeColor} />
                <circle cx="136" cy="30" r="18" fill={dyeColor} />
                <circle cx="160" cy="40" r="16" fill={dyeColor} />

                {/* Layer 4: Forehead wave fringe crests */}
                <path
                  d="M 48 54 Q 78 34, 108 38 Q 138 34, 168 54 Q 138 26, 108 28 Q 78 26, 48 54 Z"
                  fill={dyeColor}
                  opacity="0.95"
                />

                {/* Layer 5: Glossy wavy highlights */}
                <path d="M 64 36 Q 88 20 108 26 Q 128 20 152 36" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 74 26 Q 92 14 108 16 Q 124 14 142 26" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
          );
        } else if (style === 'curly') {
          backHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
              <svg className="w-full h-full">
                <circle cx="108" cy="62" r="70" fill={dyeColor} />
                <circle cx="46" cy="80" r="40" fill={dyeColor} />
                <circle cx="170" cy="80" r="40" fill={dyeColor} />
                <circle cx="48" cy="120" r="32" fill={dyeColor} />
                <circle cx="168" cy="120" r="32" fill={dyeColor} />
              </svg>
            </div>
          );
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Layer 1: Solid Gap-Filling Scalp Foundation */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />
                <path
                  d="M 40 76 C 34 20, 60 8, 108 8 C 156 8, 182 20, 176 76 C 160 60, 136 50, 108 50 C 80 50, 56 60, 40 76 Z"
                  fill={dyeColor}
                />

                {/* Layer 2: Main curly canopy */}
                <ellipse cx="108" cy="34" rx="60" ry="26" fill={dyeColor} />
                <circle cx="58" cy="42" r="20" fill={dyeColor} />
                <circle cx="158" cy="42" r="20" fill={dyeColor} />

                {/* Layer 3: Curly ringlet clusters with depth */}
                <circle cx="76" cy="32" r="18" fill={dyeColor} stroke={rootColor} strokeWidth="1" strokeOpacity="0.25" />
                <circle cx="108" cy="24" r="20" fill={dyeColor} stroke={rootColor} strokeWidth="1" strokeOpacity="0.25" />
                <circle cx="140" cy="32" r="18" fill={dyeColor} stroke={rootColor} strokeWidth="1" strokeOpacity="0.25" />

                {/* Layer 4: Forehead ringlet fringe */}
                <circle cx="64" cy="54" r="13" fill={dyeColor} />
                <circle cx="86" cy="50" r="14" fill={dyeColor} />
                <circle cx="108" cy="48" r="15" fill={dyeColor} />
                <circle cx="130" cy="50" r="14" fill={dyeColor} />
                <circle cx="152" cy="54" r="13" fill={dyeColor} />

                {/* Highlights */}
                <circle cx="96" cy="26" r="5" fill="rgba(255,255,255,0.25)" />
                <circle cx="120" cy="26" r="5" fill="rgba(255,255,255,0.25)" />
              </svg>
            </div>
          );
        } else if (style === 'braided') {
          // MEDIUM BRAIDS: Tight cornrows hugging scalp closely from hairline over crown + thin neat braids falling down at the back
          const tightTracks = [
            // Center track
            { x1: 108, y1: 56, x2: 108, y2: 24, w: 4.2 },
            // Inner tracks
            { x1: 97, y1: 56, x2: 97, y2: 25, w: 4.0 },
            { x1: 119, y1: 56, x2: 119, y2: 25, w: 4.0 },
            // Mid tracks
            { x1: 86, y1: 58, x2: 87, y2: 28, w: 3.8 },
            { x1: 130, y1: 58, x2: 129, y2: 28, w: 3.8 },
            // Temple tracks
            { x1: 76, y1: 62, x2: 78, y2: 34, w: 3.5 },
            { x1: 140, y1: 62, x2: 138, y2: 34, w: 3.5 },
            // Outer temple tracks
            { x1: 66, y1: 68, x2: 70, y2: 42, w: 3.2 },
            { x1: 150, y1: 68, x2: 146, y2: 42, w: 3.2 },
          ];

          const thinBackBraids = [
            { x1: 66, y1: 62, cx: 62, cy: 115, x2: 60, y2: 172 },
            { x1: 74, y1: 58, cx: 71, cy: 118, x2: 68, y2: 176 },
            { x1: 82, y1: 54, cx: 80, cy: 120, x2: 78, y2: 180 },
            { x1: 90, y1: 50, cx: 89, cy: 122, x2: 88, y2: 182 },
            { x1: 99, y1: 48, cx: 98, cy: 124, x2: 97, y2: 184 },
            { x1: 108, y1: 46, cx: 108, cy: 125, x2: 108, y2: 185 },
            { x1: 117, y1: 48, cx: 118, cy: 124, x2: 119, y2: 184 },
            { x1: 126, y1: 50, cx: 127, cy: 122, x2: 128, y2: 182 },
            { x1: 134, y1: 54, cx: 136, cy: 120, x2: 138, y2: 180 },
            { x1: 142, y1: 58, cx: 145, cy: 118, x2: 148, y2: 176 },
            { x1: 150, y1: 62, cx: 154, cy: 115, x2: 156, y2: 172 },
          ];

          backHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
              <svg className="w-full h-full">
                {/* Thin braids cascading down the back */}
                {thinBackBraids.map((b, idx) => (
                  <g key={idx}>
                    {/* Shadow outline */}
                    <path
                      d={`M ${b.x1} ${b.y1} Q ${b.cx} ${b.cy} ${b.x2} ${b.y2}`}
                      fill="none"
                      stroke={rootColor}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                    />
                    {/* Braided segment body */}
                    <path
                      d={`M ${b.x1} ${b.y1} Q ${b.cx} ${b.cy} ${b.x2} ${b.y2}`}
                      fill="none"
                      stroke={dyeColor}
                      strokeWidth="2.8"
                      strokeDasharray="4 1.8"
                      strokeLinecap="round"
                    />
                    {/* Fine braid highlight */}
                    <path
                      d={`M ${b.x1} ${b.y1} Q ${b.cx} ${b.cy} ${b.x2} ${b.y2}`}
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1"
                      strokeDasharray="1.5 4.3"
                      strokeLinecap="round"
                    />
                    {/* Neat bead / cuff at tip */}
                    <circle
                      cx={b.x2}
                      cy={b.y2 + 1}
                      r="2.2"
                      fill={idx % 2 === 0 ? "#f59e0b" : "#d97706"}
                      stroke="#78350f"
                      strokeWidth="0.6"
                    />
                  </g>
                ))}
              </svg>
            </div>
          );

          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                <defs>
                  <clipPath id="scalpClipMediumBraids">
                    <path d={scalpCapPath} />
                  </clipPath>
                </defs>

                {/* Scalp Cap Foundation strictly tight to skull */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.4" />

                {/* Scalp tracks & partings strictly clipped within scalp cap */}
                <g clipPath="url(#scalpClipMediumBraids)">
                  {/* Scalp Partings between cornrow tracks */}
                  <line x1="102.5" y1="56" x2="102.5" y2="25" stroke={rootColor} strokeWidth="0.8" opacity="0.3" />
                  <line x1="113.5" y1="56" x2="113.5" y2="25" stroke={rootColor} strokeWidth="0.8" opacity="0.3" />
                  <line x1="91.5" y1="57" x2="92" y2="27" stroke={rootColor} strokeWidth="0.8" opacity="0.3" />
                  <line x1="124.5" y1="57" x2="124" y2="27" stroke={rootColor} strokeWidth="0.8" opacity="0.3" />
                  <line x1="81" y1="60" x2="82.5" y2="31" stroke={rootColor} strokeWidth="0.8" opacity="0.3" />
                  <line x1="135" y1="60" x2="133.5" y2="31" stroke={rootColor} strokeWidth="0.8" opacity="0.3" />

                  {/* Tight Cornrow Tracks hugging skull shape */}
                  {tightTracks.map((trk, i) => (
                    <g key={i}>
                      {/* Shadow / root track */}
                      <line
                        x1={trk.x1}
                        y1={trk.y1}
                        x2={trk.x2}
                        y2={trk.y2}
                        stroke={rootColor}
                        strokeWidth={trk.w + 1.2}
                        strokeLinecap="round"
                      />
                      {/* Braided cornrow stitch pattern */}
                      <line
                        x1={trk.x1}
                        y1={trk.y1}
                        x2={trk.x2}
                        y2={trk.y2}
                        stroke={dyeColor}
                        strokeWidth={trk.w}
                        strokeDasharray="4 2"
                        strokeLinecap="round"
                      />
                      {/* Cornrow glossy stitch highlight */}
                      <line
                        x1={trk.x1}
                        y1={trk.y1 - 0.5}
                        x2={trk.x2}
                        y2={trk.y2 - 0.5}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={trk.w * 0.35}
                        strokeDasharray="1.5 3.5"
                      />
                    </g>
                  ))}
                </g>

                {/* Clean, smooth hairline edge without stray lines */}
                <path
                  d="M 64 62 C 74 57, 86 54, 108 55 C 130 54, 142 57, 152 62"
                  fill="none"
                  stroke={rootColor}
                  strokeWidth="1.2"
                  strokeOpacity="0.75"
                />
              </svg>
            </div>
          );
        } else if (style === 'dreads') {
          // MEDIUM DREADLOCKS: High-top tied pineapple dreadlock bundle with fade base & fanning textured locs (matching reference photo)
          const backFannedLocs = [
            // Left angled back locs
            { x1: 104, y1: 38, cx: 80, cy: 16, x2: 56, y2: 2, w: 5.4, tip: '#b45309' },
            { x1: 105, y1: 38, cx: 88, cy: 6, x2: 68, y2: -14, w: 5.6, tip: '#d97706' },
            { x1: 106, y1: 38, cx: 96, cy: 0, x2: 84, y2: -24, w: 5.8, tip: '#f59e0b' },
            // High center back locs
            { x1: 108, y1: 38, cx: 108, cy: -4, x2: 108, y2: -28, w: 6.0, tip: '#fbbf24' },
            // Right angled back locs
            { x1: 110, y1: 38, cx: 120, cy: 0, x2: 132, y2: -24, w: 5.8, tip: '#f59e0b' },
            { x1: 111, y1: 38, cx: 128, cy: 6, x2: 148, y2: -14, w: 5.6, tip: '#d97706' },
            { x1: 112, y1: 38, cx: 136, cy: 16, x2: 160, y2: 2, w: 5.4, tip: '#b45309' },
            // Low side-falling back locs
            { x1: 102, y1: 40, cx: 76, cy: 36, x2: 52, y2: 32, w: 5.0, tip: '#92400e' },
            { x1: 114, y1: 40, cx: 140, cy: 36, x2: 164, y2: 32, w: 5.0, tip: '#92400e' },
          ];

          const frontFannedLocs = [
            // Center upright locs
            { x1: 108, y1: 38, cx: 107, cy: 2, x2: 104, y2: -24, w: 5.8, tip: '#f59e0b' },
            { x1: 108, y1: 38, cx: 111, cy: 2, x2: 116, y2: -22, w: 5.6, tip: '#fbbf24' },
            // Mid fanning locs
            { x1: 106, y1: 38, cx: 94, cy: 10, x2: 78, y2: -10, w: 5.4, tip: '#d97706' },
            { x1: 110, y1: 38, cx: 122, cy: 10, x2: 138, y2: -10, w: 5.4, tip: '#d97706' },
            // Wide fanning locs
            { x1: 105, y1: 39, cx: 86, cy: 20, x2: 64, y2: 12, w: 5.2, tip: '#b45309' },
            { x1: 111, y1: 39, cx: 130, cy: 20, x2: 152, y2: 12, w: 5.2, tip: '#b45309' },
            // Front cluster sprouts
            { x1: 106, y1: 40, cx: 98, cy: 22, x2: 90, y2: 4, w: 4.8, tip: '#f59e0b' },
            { x1: 110, y1: 40, cx: 118, cy: 22, x2: 126, y2: 4, w: 4.8, tip: '#f59e0b' },
            // Side drapes
            { x1: 104, y1: 41, cx: 78, cy: 32, x2: 58, y2: 24, w: 4.8, tip: '#92400e' },
            { x1: 112, y1: 41, cx: 138, cy: 32, x2: 158, y2: 24, w: 4.8, tip: '#92400e' },
          ];

          backHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
              <svg className="w-full h-full" overflow="visible">
                {/* Back dreadlocks fanning high and wide from the crown tie */}
                {backFannedLocs.map((loc, idx) => (
                  <g key={`back-dread-${idx}`}>
                    {/* Dark shadow loc shaft */}
                    <path
                      d={`M ${loc.x1} ${loc.y1} Q ${loc.cx} ${loc.cy} ${loc.x2} ${loc.y2}`}
                      fill="none"
                      stroke={rootColor}
                      strokeWidth={loc.w + 1.8}
                      strokeLinecap="round"
                    />
                    {/* Main loc body */}
                    <path
                      d={`M ${loc.x1} ${loc.y1} Q ${loc.cx} ${loc.cy} ${loc.x2} ${loc.y2}`}
                      fill="none"
                      stroke={dyeColor}
                      strokeWidth={loc.w}
                      strokeLinecap="round"
                    />
                    {/* Distinct twisted dreadlock ring ridges */}
                    <path
                      d={`M ${loc.x1} ${loc.y1} Q ${loc.cx} ${loc.cy} ${loc.x2} ${loc.y2}`}
                      fill="none"
                      stroke={rootColor}
                      strokeWidth={loc.w - 0.4}
                      strokeDasharray="4 2.2"
                      strokeLinecap="butt"
                      opacity="0.85"
                    />
                    {/* Natural caramel / bleached tip highlight */}
                    <circle
                      cx={loc.x2}
                      cy={loc.y2}
                      r={loc.w * 0.45}
                      fill={loc.tip}
                    />
                  </g>
                ))}
              </svg>
            </div>
          );

          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full" overflow="visible">
                {/* Layer 1: High Skin Fade / Taper Base on Temples & Sides */}
                <path d={scalpCapPath} fill={rootColor} opacity="0.45" />

                {/* Fade gradient on side temples (clean high fade) */}
                <path
                  d="M 59 82 C 58 64, 68 54, 82 50 L 82 60 C 72 64, 64 72, 59 82 Z"
                  fill={rootColor}
                  opacity="0.5"
                />
                <path
                  d="M 157 82 C 158 64, 148 54, 134 50 L 134 60 C 144 64, 152 72, 157 82 Z"
                  fill={rootColor}
                  opacity="0.5"
                />

                {/* Crisp edge-up hairline at forehead */}
                <path
                  d="M 68 64 Q 108 50 148 64 L 148 58 Q 108 44 68 58 Z"
                  fill={rootColor}
                  opacity="0.8"
                />

                {/* Layer 2: Textured short afro / dread roots base at the top crown */}
                <path
                  d="M 76 56 C 74 42, 86 36, 108 36 C 130 36, 142 42, 140 56 C 130 48, 120 44, 108 44 C 96 44, 86 48, 76 56 Z"
                  fill={dyeColor}
                />
                <circle cx="86" cy="46" r="8" fill={dyeColor} />
                <circle cx="98" cy="42" r="9" fill={dyeColor} />
                <circle cx="108" cy="40" r="10" fill={dyeColor} />
                <circle cx="118" cy="42" r="9" fill={dyeColor} />
                <circle cx="130" cy="46" r="8" fill={dyeColor} />

                {/* Layer 3: High-top Dreadlock Tie / Hairband wrap at crown */}
                <ellipse cx="108" cy="40" rx="14" ry="4.5" fill="#0f172a" stroke="#1e293b" strokeWidth="1.2" />

                {/* Layer 4: Front and Mid Dreadlocks radiating from the tie */}
                {frontFannedLocs.map((loc, idx) => (
                  <g key={`front-dread-${idx}`}>
                    {/* Shadow outline */}
                    <path
                      d={`M ${loc.x1} ${loc.y1} Q ${loc.cx} ${loc.cy} ${loc.x2} ${loc.y2}`}
                      fill="none"
                      stroke={rootColor}
                      strokeWidth={loc.w + 1.8}
                      strokeLinecap="round"
                    />
                    {/* Loc shaft */}
                    <path
                      d={`M ${loc.x1} ${loc.y1} Q ${loc.cx} ${loc.cy} ${loc.x2} ${loc.y2}`}
                      fill="none"
                      stroke={dyeColor}
                      strokeWidth={loc.w}
                      strokeLinecap="round"
                    />
                    {/* Twisted lock texture ridges */}
                    <path
                      d={`M ${loc.x1} ${loc.y1} Q ${loc.cx} ${loc.cy} ${loc.x2} ${loc.y2}`}
                      fill="none"
                      stroke={rootColor}
                      strokeWidth={loc.w - 0.4}
                      strokeDasharray="4 2.2"
                      strokeLinecap="butt"
                      opacity="0.8"
                    />
                    {/* Specular dreadlock sheen */}
                    <path
                      d={`M ${loc.x1} ${loc.y1} Q ${loc.cx} ${loc.cy} ${loc.x2} ${loc.y2}`}
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.2"
                      strokeDasharray="2 5"
                      strokeLinecap="round"
                    />
                    {/* Caramel / golden-brown tip highlight (as in reference photo) */}
                    <circle
                      cx={loc.x2}
                      cy={loc.y2}
                      r={loc.w * 0.45}
                      fill={loc.tip}
                    />
                  </g>
                ))}
              </svg>
            </div>
          );
        }
      } else if (length === 'long') {
        if (style === 'straight') {
          // LONG STRAIGHT: Sleek, unified, natural flowing straight hair with full anatomical crown coverage and elegant face-framing drapes
          backHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
              <svg className="w-full h-full">
                {/* Deep back silhouette cascading behind neck & shoulders */}
                <path
                  d="M 32 40 C 14 80, 20 150, 44 220 L 172 220 C 196 150, 202 80, 184 40 Z"
                  fill={dyeColor}
                />
                {/* Subtle interior darker shadow behind neck */}
                <path d="M 64 70 L 64 220 L 152 220 L 152 70 Z" fill={rootColor} opacity="0.3" />
              </svg>
            </div>
          );
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Layer 1: Solid Gap-Filling Scalp & Skull Foundation (exact hair dyeColor + root undertone) */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />
                <path
                  d="M 44 80 C 40 22, 64 8, 108 8 C 152 8, 176 22, 172 80 C 158 64, 138 54, 108 54 C 78 54, 58 64, 44 80 Z"
                  fill={dyeColor}
                />

                {/* Layer 2: Full solid anatomical crown dome & temple connection */}
                <path
                  d="M 42 74 C 38 18, 64 8, 108 8 C 152 8, 178 18, 174 74 C 160 52, 136 40, 108 42 C 80 40, 56 52, 42 74 Z"
                  fill={dyeColor}
                />

                {/* Layer 3: Left flowing front tress cascading gracefully over shoulder */}
                <path
                  d="M 42 60 C 32 95, 36 145, 48 205 C 60 205, 68 155, 68 84 C 58 68, 50 62, 42 60 Z"
                  fill={dyeColor}
                />

                {/* Layer 4: Right flowing front tress cascading gracefully over shoulder */}
                <path
                  d="M 174 60 C 184 95, 180 145, 168 205 C 156 205, 148 155, 148 84 C 158 68, 166 62, 174 60 Z"
                  fill={dyeColor}
                />

                {/* Layer 5: Soft center-parted forehead hairline flow */}
                <path
                  d="M 50 58 C 64 42, 84 38, 108 42 C 132 38, 152 42, 166 58 C 150 48, 130 38, 108 38 C 86 38, 66 48, 50 58 Z"
                  fill={dyeColor}
                  opacity="0.96"
                />

                {/* Layer 6: Natural subtle center part root line */}
                <path d="M 108 12 L 108 42" stroke={rootColor} strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />

                {/* Layer 7: Glossy vertical shine arcs across smooth straight strands */}
                <path d="M 64 48 Q 56 100 54 175" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 152 48 Q 160 100 162 175" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 76 28 Q 108 16 140 28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 84 36 Q 108 26 132 36" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
          );
        } else if (style === 'wavy') {
          // LONG FLOW / WAVY: Voluminous, lush wavy mane with zero gaps, fully uniting crown, sides, and cascading shoulder locks
          backHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
              <svg className="w-full h-full">
                {/* Full lush wavy envelope */}
                <path d="M 26 38 C 8 78, 14 155, 40 220 L 176 220 C 202 155, 208 78, 190 38 Z" fill={dyeColor} />
                {/* Rich wavy billows on the sides */}
                <circle cx="36" cy="80" r="24" fill={dyeColor} />
                <circle cx="180" cy="80" r="24" fill={dyeColor} />
                <circle cx="32" cy="120" r="22" fill={dyeColor} />
                <circle cx="184" cy="120" r="22" fill={dyeColor} />
                <circle cx="40" cy="165" r="20" fill={dyeColor} />
                <circle cx="176" cy="165" r="20" fill={dyeColor} />
              </svg>
            </div>
          );
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Layer 1: Solid Gap-Filling Scalp & Skull Foundation (exact hair dyeColor + root undertone) */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />
                <path
                  d="M 38 78 C 30 20, 60 6, 108 6 C 156 6, 186 20, 178 78 C 162 62, 138 54, 108 54 C 78 54, 54 62, 38 78 Z"
                  fill={dyeColor}
                />

                {/* Layer 2: Voluminous wave canopy across crown and temples with zero gaps */}
                <path
                  d="M 36 70 C 28 14, 58 4, 108 4 C 158 4, 188 14, 180 70 C 162 46, 136 34, 108 36 C 80 34, 54 46, 36 70 Z"
                  fill={dyeColor}
                />

                {/* Layer 3: Left thick cascading wave tress down chest */}
                <path
                  d="M 36 60 C 22 95, 28 140, 46 205 Q 60 168, 68 120 Q 58 80, 48 60 Z"
                  fill={dyeColor}
                />

                {/* Layer 4: Right thick cascading wave tress down chest */}
                <path
                  d="M 180 60 C 194 95, 188 140, 170 205 Q 156 168, 148 120 Q 158 80, 168 60 Z"
                  fill={dyeColor}
                />

                {/* Layer 5: Forehead wave crests framing the face */}
                <path
                  d="M 46 56 Q 76 34, 108 38 Q 140 34, 170 56 Q 140 24, 108 26 Q 76 24, 46 56 Z"
                  fill={dyeColor}
                  opacity="0.96"
                />

                {/* Layer 6: Dynamic glossy wavy light reflection lines */}
                <path d="M 58 40 Q 84 22 108 28 Q 132 22 158 40" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 70 28 Q 90 16 108 18 Q 126 16 146 28" fill="none" stroke="rgba(255,255,255,0.46)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 44 80 Q 34 125 46 175" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2" strokeLinecap="round" />
                <path d="M 172 80 Q 182 125 170 175" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          );
        } else if (style === 'curly') {
          backHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
              <svg className="w-full h-full">
                <circle cx="108" cy="70" r="82" fill={dyeColor} />
                <circle cx="40" cy="90" r="50" fill={dyeColor} />
                <circle cx="176" cy="90" r="50" fill={dyeColor} />
                <circle cx="44" cy="140" r="42" fill={dyeColor} />
                <circle cx="172" cy="140" r="42" fill={dyeColor} />
              </svg>
            </div>
          );
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* Layer 1: Solid Gap-Filling Scalp & Skull Foundation */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.35" />
                <path
                  d="M 40 76 C 34 20, 60 8, 108 8 C 156 8, 182 20, 176 76 C 160 60, 136 52, 108 52 C 80 52, 56 60, 40 76 Z"
                  fill={dyeColor}
                />

                {/* Layer 2: Voluminous curly crown base */}
                <ellipse cx="108" cy="34" rx="64" ry="28" fill={dyeColor} />
                <circle cx="56" cy="44" r="22" fill={dyeColor} />
                <circle cx="160" cy="44" r="22" fill={dyeColor} />
                <circle cx="78" cy="32" r="20" fill={dyeColor} stroke={rootColor} strokeWidth="1" strokeOpacity="0.3" />
                <circle cx="108" cy="26" r="22" fill={dyeColor} stroke={rootColor} strokeWidth="1" strokeOpacity="0.3" />
                <circle cx="138" cy="32" r="20" fill={dyeColor} stroke={rootColor} strokeWidth="1" strokeOpacity="0.3" />

                {/* Layer 3: Curly ringlets overlapping forehead & temples */}
                <circle cx="62" cy="56" r="14" fill={dyeColor} />
                <circle cx="84" cy="50" r="15" fill={dyeColor} />
                <circle cx="108" cy="48" r="16" fill={dyeColor} />
                <circle cx="132" cy="50" r="15" fill={dyeColor} />
                <circle cx="154" cy="56" r="14" fill={dyeColor} />

                {/* Highlights */}
                <circle cx="96" cy="28" r="5" fill="rgba(255,255,255,0.25)" />
                <circle cx="120" cy="28" r="5" fill="rgba(255,255,255,0.25)" />
              </svg>
            </div>
          );
        } else if (style === 'braided') {
          // LONG BRAIDS: Scalp cornrow tracks extending seamlessly over the crown and uniting directly into cascading shoulder braids
          const innerBackBraids = [64, 72, 80, 88, 96, 104, 112, 120, 128, 136, 144, 152];
          const topCornrowTracks = [
            { x1: 108, y1: 58, x2: 108, y2: 14, w: 4.6 },
            { x1: 98, y1: 58, x2: 97, y2: 16, w: 4.4 },
            { x1: 118, y1: 58, x2: 119, y2: 16, w: 4.4 },
            { x1: 88, y1: 60, x2: 86, y2: 20, w: 4.2 },
            { x1: 128, y1: 60, x2: 130, y2: 20, w: 4.2 },
            { x1: 78, y1: 62, x2: 74, y2: 26, w: 4.0 },
            { x1: 138, y1: 62, x2: 142, y2: 26, w: 4.0 },
            { x1: 68, y1: 64, x2: 62, y2: 34, w: 3.8 },
            { x1: 148, y1: 64, x2: 154, y2: 34, w: 3.8 },
          ];
          const shoulderFrontBraids = [
            { x1: 44, y1: 46, x2: 38, y2: 210, beadColor: '#f59e0b' },
            { x1: 52, y1: 52, x2: 46, y2: 218, beadColor: '#e2e8f0' },
            { x1: 60, y1: 58, x2: 56, y2: 222, beadColor: '#f59e0b' },
            { x1: 156, y1: 58, x2: 160, y2: 222, beadColor: '#f59e0b' },
            { x1: 164, y1: 52, x2: 170, y2: 218, beadColor: '#e2e8f0' },
            { x1: 172, y1: 46, x2: 178, y2: 210, beadColor: '#f59e0b' },
          ];

          backHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
              <svg className="w-full h-full">
                {innerBackBraids.map((x) => (
                  <g key={x}>
                    <line x1={x} y1="52" x2={x} y2="210" stroke={dyeColor} strokeWidth="5.5" strokeDasharray="8 4" strokeLinecap="round" />
                    <circle cx={x} cy="212" r="3.5" fill="#f59e0b" stroke="#92400e" strokeWidth="0.8" />
                  </g>
                ))}
              </svg>
            </div>
          );
          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* 1. Full solid scalp cap base to eliminate any gaps (hair color + scalp undertone) */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.45" />

                {/* 2. Solid thick braided crown canopy deck bridging crown to sides */}
                <path
                  d="M 42 76 C 38 20, 64 10, 108 10 C 152 10, 178 20, 174 76 C 158 60, 136 52, 108 52 C 80 52, 58 60, 42 76 Z"
                  fill={dyeColor}
                />
                <path
                  d="M 42 66 C 38 16, 64 8, 108 8 C 152 8, 178 16, 174 66 C 158 48, 134 32, 108 32 C 82 32, 58 48, 42 66 Z"
                  fill={dyeColor}
                  opacity="0.96"
                />

                {/* 3. Top cornrow tracks going from hairline back across the head */}
                {topCornrowTracks.map((trk, i) => (
                  <g key={i}>
                    <line x1={trk.x1} y1={trk.y1} x2={trk.x2} y2={trk.y2} stroke={rootColor} strokeWidth={trk.w + 1.2} strokeLinecap="round" />
                    <line x1={trk.x1} y1={trk.y1} x2={trk.x2} y2={trk.y2} stroke={dyeColor} strokeWidth={trk.w} strokeDasharray="4 2.5" strokeLinecap="round" />
                    <line x1={trk.x1} y1={trk.y1 - 1} x2={trk.x2} y2={trk.y2} stroke="rgba(255,255,255,0.28)" strokeWidth={1.2} strokeDasharray="2 4" />
                  </g>
                ))}

                {/* 4. Front shoulder cascading braids seamlessly rooted at the scalp temples */}
                {shoulderFrontBraids.map((b, i) => (
                  <g key={i}>
                    {/* Root connection node */}
                    <circle cx={b.x1} cy={b.y1} r={3.8} fill={dyeColor} />
                    <line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={rootColor} strokeWidth="6.5" strokeLinecap="round" />
                    <line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={dyeColor} strokeWidth="5.5" strokeDasharray="8 4" strokeLinecap="round" />
                    <circle cx={b.x2} cy={b.y2 + 2} r="3.5" fill={b.beadColor} stroke="#78350f" strokeWidth="0.8" />
                  </g>
                ))}
              </svg>
            </div>
          );
        } else if (style === 'dreads') {
          // LONG DREADLOCKS: Thick solid crown canopy with zero gaps extending to sides, natural height, short dread fringe over forehead, cascading chest locs
          const topCanopyLocs = [
            { x: 48, y1: 34, y2: 60, w: 6.5 },
            { x: 56, y1: 28, y2: 62, w: 6.5 },
            { x: 64, y1: 24, y2: 62, w: 7.0 },
            { x: 72, y1: 20, y2: 64, w: 7.0 },
            { x: 80, y1: 17, y2: 64, w: 7.0 },
            { x: 88, y1: 15, y2: 64, w: 7.2 },
            { x: 96, y1: 13, y2: 64, w: 7.5 },
            { x: 104, y1: 12, y2: 64, w: 7.5 },
            { x: 112, y1: 12, y2: 64, w: 7.5 },
            { x: 120, y1: 13, y2: 64, w: 7.5 },
            { x: 128, y1: 15, y2: 64, w: 7.2 },
            { x: 136, y1: 17, y2: 64, w: 7.0 },
            { x: 144, y1: 20, y2: 64, w: 7.0 },
            { x: 152, y1: 24, y2: 62, w: 7.0 },
            { x: 160, y1: 28, y2: 62, w: 6.5 },
            { x: 168, y1: 34, y2: 60, w: 6.5 },
          ];
          // Short dreadlocks falling naturally on forehead
          const foreheadFringeLocs = [
            { x: 78, y1: 42, y2: 60, w: 5.5 },
            { x: 88, y1: 40, y2: 64, w: 5.8 },
            { x: 98, y1: 38, y2: 66, w: 6.0 },
            { x: 108, y1: 38, y2: 67, w: 6.2 },
            { x: 118, y1: 38, y2: 66, w: 6.0 },
            { x: 128, y1: 40, y2: 64, w: 5.8 },
            { x: 138, y1: 42, y2: 60, w: 5.5 },
          ];
          // Center-back locs behind the neck
          const centerBackLocs = [70, 78, 86, 94, 102, 110, 118, 126, 134, 142, 148];
          // Long front dreadlocks cascading over the chest and shoulders
          const frontChestLocs = [
            { x: 38, yStart: 54, len: 155, beadColor: '#f59e0b' },
            { x: 46, yStart: 56, len: 165, beadColor: '#e2e8f0' },
            { x: 54, yStart: 58, len: 172, beadColor: '#f59e0b' },
            { x: 62, yStart: 60, len: 162, beadColor: '#e2e8f0' },
            { x: 70, yStart: 62, len: 148, beadColor: '#f59e0b' },
            { x: 146, yStart: 62, len: 148, beadColor: '#f59e0b' },
            { x: 154, yStart: 60, len: 162, beadColor: '#e2e8f0' },
            { x: 162, yStart: 58, len: 172, beadColor: '#f59e0b' },
            { x: 170, yStart: 56, len: 165, beadColor: '#e2e8f0' },
            { x: 178, yStart: 54, len: 155, beadColor: '#f59e0b' },
          ];

          backHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[1]">
              <svg className="w-full h-full">
                {centerBackLocs.map((x, idx) => {
                  const len = 140 + (idx % 3) * 15;
                  return (
                    <g key={x}>
                      <rect x={x - 4} y="52" width="8" height={len} rx="4" fill={dyeColor} stroke={rootColor} strokeWidth="1" />
                      <line x1={x - 3} y1="74" x2={x + 3} y2="74" stroke={rootColor} strokeWidth="1.5" />
                      <line x1={x - 3} y1="96" x2={x + 3} y2="96" stroke={rootColor} strokeWidth="1.5" />
                      <line x1={x - 3} y1="118" x2={x + 3} y2="118" stroke={rootColor} strokeWidth="1.5" />
                      <line x1={x - 3} y1="140" x2={x + 3} y2="140" stroke={rootColor} strokeWidth="1.5" />
                      <rect x={x - 2} y="54" width="4" height={len * 0.6} rx="2" fill="rgba(255,255,255,0.18)" />
                      <rect x={x - 4.5} y={52 + len - 6} width="9" height="6" rx="1.5" fill={idx % 2 === 0 ? "#f59e0b" : "#e2e8f0"} stroke="#1e293b" strokeWidth="0.8" />
                    </g>
                  );
                })}
              </svg>
            </div>
          );

          topHair = (
            <div className="absolute top-0 left-0 w-[216px] h-[260px] pointer-events-none z-[7]">
              <svg className="w-full h-full">
                {/* 1. Solid Gap-Filling Scalp Foundation & Crown Underlayer (dyeColor + root tone) */}
                <path d={scalpCapPath} fill={dyeColor} />
                <path d={scalpCapPath} fill={rootColor} opacity="0.4" />
                <path
                  d="M 40 76 C 34 22, 60 12, 108 12 C 156 12, 182 22, 176 76 C 160 60, 136 52, 108 52 C 80 52, 56 60, 40 76 Z"
                  fill={dyeColor}
                />
                
                {/* 2. Thick, solid, gapless dread canopy at the crown (natural height, zero gaps) */}
                <path
                  d="M 38 68 C 30 18, 58 10, 108 10 C 158 10, 186 18, 178 68 C 158 48, 134 30, 108 30 C 82 30, 58 48, 38 68 Z"
                  fill={dyeColor}
                  opacity="0.96"
                />
                <path
                  d="M 46 58 C 42 20, 68 14, 108 14 C 148 14, 174 20, 170 58 C 154 42, 132 26, 108 26 C 84 26, 62 42, 46 58 Z"
                  fill={rootColor}
                  opacity="0.45"
                />

                {/* 3. Dense top dread canopy locks with natural balanced height */}
                {topCanopyLocs.map((loc, idx) => (
                  <g key={idx}>
                    <line x1={loc.x} y1={loc.y1} x2={loc.x} y2={loc.y2} stroke={rootColor} strokeWidth={loc.w + 1.2} strokeLinecap="round" />
                    <line x1={loc.x} y1={loc.y1} x2={loc.x} y2={loc.y2} stroke={dyeColor} strokeWidth={loc.w} strokeLinecap="round" />
                    <line x1={loc.x} y1={loc.y1 + 4} x2={loc.x} y2={loc.y2 - 4} stroke="rgba(255,255,255,0.28)" strokeWidth={loc.w * 0.35} strokeLinecap="round" />
                  </g>
                ))}

                {/* 4. Short natural dreads falling onto the forehead */}
                {foreheadFringeLocs.map((loc, idx) => (
                  <g key={`fringe-${idx}`}>
                    <line x1={loc.x} y1={loc.y1} x2={loc.x} y2={loc.y2} stroke={rootColor} strokeWidth={loc.w + 1.5} strokeLinecap="round" />
                    <line x1={loc.x} y1={loc.y1} x2={loc.x} y2={loc.y2} stroke={dyeColor} strokeWidth={loc.w} strokeLinecap="round" />
                    <line x1={loc.x} y1={loc.y1 + 2} x2={loc.x} y2={loc.y2 - 2} stroke="rgba(255,255,255,0.3)" strokeWidth={loc.w * 0.35} strokeLinecap="round" />
                  </g>
                ))}

                {/* 5. Long front dreadlocks cascading over the chest and shoulders in front */}
                {frontChestLocs.map((loc, idx) => (
                  <g key={`chest-${idx}`}>
                    <rect x={loc.x - 4} y={loc.yStart} width="8" height={loc.len} rx="4" fill={dyeColor} stroke={rootColor} strokeWidth="1" />
                    <line x1={loc.x - 3} y1={loc.yStart + 24} x2={loc.x + 3} y2={loc.yStart + 24} stroke={rootColor} strokeWidth="1.5" />
                    <line x1={loc.x - 3} y1={loc.yStart + 48} x2={loc.x + 3} y2={loc.yStart + 48} stroke={rootColor} strokeWidth="1.5" />
                    <line x1={loc.x - 3} y1={loc.yStart + 72} x2={loc.x + 3} y2={loc.yStart + 72} stroke={rootColor} strokeWidth="1.5" />
                    <line x1={loc.x - 3} y1={loc.yStart + 96} x2={loc.x + 3} y2={loc.yStart + 96} stroke={rootColor} strokeWidth="1.5" />
                    <line x1={loc.x - 3} y1={loc.yStart + 120} x2={loc.x + 3} y2={loc.yStart + 120} stroke={rootColor} strokeWidth="1.5" />
                    <rect x={loc.x - 2} y={loc.yStart + 4} width="4" height={loc.len * 0.65} rx="2" fill="rgba(255,255,255,0.22)" />
                    {/* Decorative metallic cuffs / rings near ends */}
                    <rect x={loc.x - 4.5} y={loc.yStart + loc.len - 8} width="9" height="7" rx="1.5" fill={loc.beadColor} stroke="#0f172a" strokeWidth="0.8" />
                  </g>
                ))}
              </svg>
            </div>
          );
        }
      }
    }

    return { backHair, topHair };
  }, [
    biometrics.hairRoot,
    biometrics.hairDye,
    biometrics.hairLength,
    biometrics.hairStyle,
    biometrics.specialHair,
  ]);

  // --- KIT & SHOULDER CALCULATIONS ---
  const kitStyles = useMemo(() => {
    const { color1: kit1, color2: kit2, pattern } = activeKit;
    const { chestW, shoulderW, shoulderOuterRound, shoulderDrop, sleeveHeight, strengthTier, strength } = strengthCalculations;

    // Straight chest top under 80 strength, smoothly rounded at higher strength (80+)
    let chestTopRound = 0;
    if (strengthTier >= 5) {
      chestTopRound = 22;
    } else if (strengthTier === 4) {
      chestTopRound = 18;
    } else if (strengthTier === 3) {
      chestTopRound = 14;
    } else if (strength >= 80) {
      chestTopRound = Math.round(4 + ((strength - 80) / 9) * 6);
    } else {
      chestTopRound = 0; // Completely straight under 80 strength
    }

    let chestStyle: React.CSSProperties = {
      backgroundColor: kit1,
      backgroundImage: 'none',
      backgroundSize: 'auto',
      backgroundPosition: '0 0',
      borderRadius: `${chestTopRound}px ${chestTopRound}px 0 0`,
    };

    let shoulderLStyle: React.CSSProperties = {
      backgroundColor: kit1,
      backgroundImage: 'none',
      backgroundSize: 'auto',
      backgroundPosition: '0 0',
      borderRadius: `${shoulderOuterRound}px ${Math.min(8, chestTopRound)}px 0 0`,
      top: `${shoulderDrop}px`,
      height: `${sleeveHeight}px`,
    };

    let shoulderRStyle: React.CSSProperties = {
      backgroundColor: kit1,
      backgroundImage: 'none',
      backgroundSize: 'auto',
      backgroundPosition: '0 0',
      borderRadius: `${Math.min(8, chestTopRound)}px ${shoulderOuterRound}px 0 0`,
      top: `${shoulderDrop}px`,
      height: `${sleeveHeight}px`,
    };

    if (pattern === 'solid') {
      chestStyle.backgroundColor = kit1;
      chestStyle.backgroundImage = 'none';
      shoulderLStyle.backgroundColor = kit1;
      shoulderLStyle.backgroundImage = 'none';
      shoulderRStyle.backgroundColor = kit1;
      shoulderRStyle.backgroundImage = 'none';
    } else if (pattern === 'stripes') {
      const stripePattern = `repeating-linear-gradient(90deg, ${kit1}, ${kit1} 18px, ${kit2} 18px, ${kit2} 36px)`;
      chestStyle.backgroundImage = stripePattern;
      shoulderLStyle.backgroundImage = stripePattern;
      shoulderLStyle.backgroundPosition = `-${shoulderW}px 0`;
      shoulderRStyle.backgroundImage = stripePattern;
      shoulderRStyle.backgroundPosition = `-${chestW}px 0`;
    } else if (pattern === 'hoops') {
      const hoopPattern = `repeating-linear-gradient(180deg, ${kit1}, ${kit1} 14px, ${kit2} 14px, ${kit2} 28px)`;
      chestStyle.backgroundImage = hoopPattern;
      shoulderLStyle.backgroundImage = hoopPattern;
      shoulderRStyle.backgroundImage = hoopPattern;
    } else if (pattern === 'halves') {
      const halvePattern = `linear-gradient(90deg, ${kit1} 50%, ${kit2} 50%)`;
      chestStyle.backgroundImage = halvePattern;
      shoulderLStyle.backgroundColor = kit1;
      shoulderRStyle.backgroundColor = kit2;
    } else if (pattern === 'sash') {
      chestStyle.backgroundColor = kit1;
      chestStyle.backgroundImage = `linear-gradient(135deg, transparent 42%, ${kit2} 42%, ${kit2} 58%, transparent 58%)`;
      shoulderLStyle.backgroundColor = kit1;
      shoulderLStyle.backgroundImage = 'none';
      shoulderRStyle.backgroundColor = kit1;
      shoulderRStyle.backgroundImage = 'none';
    } else if (pattern === 'checkered') {
      const checkBg = `linear-gradient(45deg, ${kit2} 25%, transparent 25%, transparent 75%, ${kit2} 75%, ${kit2}), linear-gradient(45deg, ${kit2} 25%, transparent 25%, transparent 75%, ${kit2} 75%, ${kit2})`;
      chestStyle.backgroundColor = kit1;
      chestStyle.backgroundImage = checkBg;
      chestStyle.backgroundSize = `16px 16px`;
      chestStyle.backgroundPosition = `0 0, 8px 8px`;

      shoulderLStyle.backgroundColor = kit1;
      shoulderLStyle.backgroundImage = checkBg;
      shoulderLStyle.backgroundSize = `16px 16px`;
      shoulderLStyle.backgroundPosition = `0 0, 8px 8px`;

      shoulderRStyle.backgroundColor = kit1;
      shoulderRStyle.backgroundImage = checkBg;
      shoulderRStyle.backgroundSize = `16px 16px`;
      shoulderRStyle.backgroundPosition = `0 0, 8px 8px`;
    } else if (pattern === 'raglan-shoulders') {
      chestStyle.backgroundColor = kit1;
      chestStyle.backgroundImage = 'none';
      shoulderLStyle.backgroundColor = kit2;
      shoulderLStyle.backgroundImage = 'none';
      shoulderRStyle.backgroundColor = kit2;
      shoulderRStyle.backgroundImage = 'none';
    } else if (pattern === 'gradient') {
      const gradPattern = `linear-gradient(180deg, ${kit1} 0%, ${kit2} 100%)`;
      chestStyle.backgroundImage = gradPattern;
      shoulderLStyle.backgroundImage = gradPattern;
      shoulderRStyle.backgroundImage = gradPattern;
    } else if (pattern === 'diagonal') {
      const diagPattern = `linear-gradient(135deg, ${kit1} 50%, ${kit2} 50%)`;
      chestStyle.backgroundImage = diagPattern;
      shoulderLStyle.backgroundColor = kit1;
      shoulderRStyle.backgroundColor = kit2;
    } else if (pattern === 'solid-line') {
      const solidLinePattern = `linear-gradient(180deg, ${kit1} 0%, ${kit1} 36px, ${kit2} 36px, ${kit2} 48px, ${kit1} 48px, ${kit1} 100%)`;
      chestStyle.backgroundImage = solidLinePattern;
      shoulderLStyle.backgroundColor = kit1;
      shoulderRStyle.backgroundColor = kit1;
    } else if (pattern === 'two-colors') {
      const twoColorPattern = `linear-gradient(180deg, ${kit1} 50%, ${kit2} 50%)`;
      chestStyle.backgroundImage = twoColorPattern;
      shoulderLStyle.backgroundImage = twoColorPattern;
      shoulderRStyle.backgroundImage = twoColorPattern;
    } else if (pattern === 'horizontal-middle-strip') {
      const midStripPattern = `linear-gradient(180deg, ${kit1} 0%, ${kit1} 30px, ${kit2} 30px, ${kit2} 54px, ${kit1} 54px, ${kit1} 100%)`;
      chestStyle.backgroundImage = midStripPattern;
      shoulderLStyle.backgroundColor = kit1;
      shoulderRStyle.backgroundColor = kit1;
    }

    // Fit-specific visual nuances (Compression cuffs vs standard hem vs retro loose overhang depth)
    const fitStyle = activeKit.style || 'normal';
    if (fitStyle === 'tight') {
      shoulderLStyle.borderBottom = '2.5px solid rgba(0,0,0,0.42)';
      shoulderRStyle.borderBottom = '2.5px solid rgba(0,0,0,0.42)';
      shoulderLStyle.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.22), inset 0 -1px 2px rgba(0,0,0,0.32)';
      shoulderRStyle.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.22), inset 0 -1px 2px rgba(0,0,0,0.32)';
      chestStyle.boxShadow = 'inset 1px 0 2px rgba(0,0,0,0.18), inset -1px 0 2px rgba(0,0,0,0.18)';
    } else if (fitStyle === 'loose') {
      shoulderLStyle.borderBottom = '2.5px solid rgba(0,0,0,0.35)';
      shoulderRStyle.borderBottom = '2.5px solid rgba(0,0,0,0.35)';
      shoulderLStyle.boxShadow = 'inset 0 -3px 5px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.25)';
      shoulderRStyle.boxShadow = 'inset 0 -3px 5px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.25)';
      chestStyle.boxShadow = 'inset 0 -2px 3px rgba(0,0,0,0.15)';
    } else {
      shoulderLStyle.borderBottom = '1.5px solid rgba(0,0,0,0.22)';
      shoulderRStyle.borderBottom = '1.5px solid rgba(0,0,0,0.22)';
      shoulderLStyle.boxShadow = '0 1px 2px rgba(0,0,0,0.15)';
      shoulderRStyle.boxShadow = '0 1px 2px rgba(0,0,0,0.15)';
    }

    return { chestStyle, shoulderLStyle, shoulderRStyle };
  }, [activeKit, strengthCalculations]);

  // --- EMBLEM RENDERER HELPER ---
  const renderEmblemContent = (isCard = false, overrideEmblem?: EmblemConfig) => {
    const cfg = overrideEmblem || activeEmblem;
    const { shape, mode, color1, color2 } = cfg;
    const color3 = cfg.color3 || '#facc15';

    let pathD = 'M 50 4 L 92 18 L 84 64 L 50 98 L 16 64 L 8 18 Z';

    if (shape === 'square') {
      pathD = 'M 10 10 L 90 10 Q 95 10 95 15 L 95 85 Q 95 90 90 90 L 10 90 Q 5 90 5 85 L 5 15 Q 5 10 10 10 Z';
    } else if (shape === 'circle') {
      pathD = 'M 50 5 A 45 45 0 1 1 49.9 5 Z';
    } else if (shape === 'diamond') {
      pathD = 'M 50 5 L 95 50 L 50 95 L 5 50 Z';
    } else if (shape === 'arrow') {
      pathD = 'M 5 5 L 95 5 L 95 65 L 50 95 L 5 65 Z';
    } else if (shape === 'barcelona' || shape === 'crested-shield') {
      pathD = 'M 10 6 C 24 2, 76 2, 90 6 C 98 8, 98 22, 94 36 C 90 52, 90 70, 50 98 C 10 70, 10 52, 6 36 C 2 22, 2 8, 10 6 Z';
    } else if (shape === 'real-madrid' || shape === 'crown-shield') {
      pathD = 'M 35 18 C 35 6, 65 6, 65 18 C 82 18, 94 35, 94 60 C 94 82, 74 96, 50 96 C 26 96, 6 82, 6 60 C 6 35, 18 18, 35 18 Z';
    } else if (shape === 'liverpool' || shape === 'flame-shield') {
      pathD = 'M 14 16 C 4 6, 26 10, 50 4 C 74 10, 96 6, 86 16 L 86 54 C 86 78, 70 92, 50 98 C 30 92, 14 78, 14 54 Z';
    } else if (shape === 'star-shield') {
      pathD = 'M 50 4 L 92 18 L 84 64 L 50 98 L 16 64 L 8 18 Z';
    }

    const clipId = `emblem-clip-${isCard ? 'c' : 's'}-${shape}`;

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible block">
        {/* Mode 2 Outer Border */}
        {mode === '2' && (
          <path d={pathD} fill={color2} stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
        )}
        {/* Mode 3 Outer Border */}
        {mode === '3' && (
          <path d={pathD} fill={color3} stroke="rgba(0,0,0,0.5)" strokeWidth="4" />
        )}

        {/* Mode 1 Base Fill */}
        {mode === '1' && (
          <path d={pathD} fill={color1} stroke="rgba(0,0,0,0.4)" strokeWidth="3" />
        )}
        {/* Mode 2 Core Base Fill */}
        {mode === '2' && (
          <g transform="scale(0.84) translate(9.5, 9.5)">
            <path d={pathD} fill={color1} />
          </g>
        )}
        {/* Mode 3 Core Base Fill */}
        {mode === '3' && (
          <g transform="scale(0.82) translate(11, 11)">
            <clipPath id={clipId}>
              <path d={pathD} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              <rect x="0" y="0" width="34" height="100" fill={color1} />
              <rect x="34" y="0" width="32" height="100" fill={color2} />
              <rect x="66" y="0" width="34" height="100" fill={color1} />
              <polygon points="50,22 56,36 71,36 59,45 63,60 50,50 37,60 41,45 29,36 44,36" fill={color3} opacity="0.95" />
            </g>
          </g>
        )}

        {/* Mode 2 Center Accent Line */}
        {mode === '2' && (
          <g transform="scale(0.84) translate(9.5, 9.5)">
            <clipPath id={`${clipId}-m2`}>
              <path d={pathD} />
            </clipPath>
            <rect x="42" y="0" width="16" height="100" fill={color2} opacity="0.85" clipPath={`url(#${clipId}-m2)`} />
          </g>
        )}

        {/* Special Top Accents */}
        {shape === 'real-madrid' && (
          <path d="M 38 16 Q 50 6 62 16 M 44 10 L 50 4 L 56 10" fill="none" stroke={mode === '3' ? color3 : color2} strokeWidth="3" strokeLinecap="round" />
        )}
        {shape === 'barcelona' && (
          <path d="M 18 24 L 82 24 M 50 6 L 50 42" fill="none" stroke={mode === '3' ? color3 : color2} strokeWidth="3.5" opacity="0.85" />
        )}
      </svg>
    );
  };

  // Tier class name mapping
  const tierContainerClass = useMemo(() => {
    const ovrInfo = getEffectivePlayerOvr(player);
    const isBoosted = ovrInfo.bonusOvr > 0;
    const isPenalized = ovrInfo.bonusOvr < 0;

    switch (tier) {
      case 'white':
        if (isBoosted) return 'bg-white border-4 border-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.35)]';
        if (isPenalized) return 'bg-white border-4 border-rose-500 text-slate-900 shadow-[0_0_20px_rgba(244,63,94,0.35)]';
        return 'bg-white border-4 border-slate-300 text-slate-900 shadow-md';
      case 'bronze':
        if (isBoosted) return 'bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] border-4 border-emerald-400 text-amber-50 shadow-[0_0_22px_rgba(16,185,129,0.4)]';
        if (isPenalized) return 'bg-gradient-to-br from-[#7f1d1d] via-[#b45309] to-[#78350f] border-4 border-rose-500 text-amber-50 shadow-[0_0_22px_rgba(244,63,94,0.4)]';
        return 'bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#78350f] border-4 border-[#92400e] text-amber-50 shadow-lg';
      case 'silver':
        if (isBoosted) return 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border-4 border-emerald-400 text-slate-900 shadow-[0_0_22px_rgba(16,185,129,0.4)]';
        if (isPenalized) return 'bg-gradient-to-br from-slate-100 via-slate-300 to-rose-300 border-4 border-rose-500 text-slate-900 shadow-[0_0_22px_rgba(244,63,94,0.4)]';
        return 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border-4 border-slate-500 text-slate-900 shadow-lg';
      case 'gold':
        if (isBoosted) return 'bg-gradient-to-br from-[#fef08a] via-[#eab308] to-[#ca8a04] border-4 border-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)]';
        if (isPenalized) return 'bg-gradient-to-br from-[#fef08a] via-[#b91c1c] to-[#7f1d1d] border-4 border-rose-500 text-amber-100 shadow-[0_0_25px_rgba(244,63,94,0.5)]';
        return 'bg-gradient-to-br from-[#fef08a] via-[#eab308] to-[#ca8a04] border-4 border-[#a16207] text-slate-950 shadow-xl';
      case 'legendary':
        if (isBoosted) return 'legendary-green-shine-pattern border-4 border-emerald-400 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.6)]';
        if (isPenalized) return 'legendary-red-shine-pattern border-4 border-rose-500 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.6)]';
        return 'legendary-shine-pattern border-4 border-[#eab308] text-[#fef08a] shadow-2xl';
      case 'goat':
        if (isBoosted) return 'goat-emerald-pattern border-4 border-emerald-300 text-white shadow-[0_0_35px_rgba(52,211,153,0.7)]';
        if (isPenalized) return 'goat-ruby-pattern border-4 border-rose-400 text-white shadow-[0_0_35px_rgba(244,63,94,0.7)]';
        return 'goat-diamond-pattern border-4 border-cyan-200 text-white shadow-[0_0_25px_rgba(14,165,233,0.5)]';
      default:
        return 'bg-white border-4 border-slate-300 text-slate-900';
    }
  }, [tier, player]);

  const portraitBorderColor = useMemo(() => {
    const ovrInfo = getEffectivePlayerOvr(player);
    if (ovrInfo.bonusOvr > 0) return '#34d399';
    if (ovrInfo.bonusOvr < 0) return '#f43f5e';

    switch (tier) {
      case 'white':
        return '#cbd5e1';
      case 'bronze':
        return '#92400e';
      case 'silver':
        return '#64748b';
      case 'gold':
        return '#a16207';
      case 'legendary':
        return '#eab308';
      case 'goat':
        return '#38bdf8';
      default:
        return '#cbd5e1';
    }
  }, [tier, player]);

  const effectiveSubPos = (subPosition || position || '').toUpperCase();
  const subPosInfo = useMemo(() => getSubPositionInfo(effectiveSubPos), [effectiveSubPos]);
  const categoryCode = subPosInfo.category;

  const { categoryLabel, categoryBadgeClass } = useMemo(() => {
    switch (categoryCode) {
      case 'ATT':
        return {
          categoryLabel: 'ATT',
          categoryBadgeClass: 'bg-red-600 text-white border border-red-400/60 shadow-sm',
        };
      case 'MID':
        return {
          categoryLabel: 'MID',
          categoryBadgeClass: 'bg-emerald-600 text-white border border-emerald-400/60 shadow-sm',
        };
      case 'DEF':
        return {
          categoryLabel: 'DEF',
          categoryBadgeClass: 'bg-blue-600 text-white border border-blue-400/60 shadow-sm',
        };
      case 'GK':
        return {
          categoryLabel: 'GK',
          categoryBadgeClass: 'bg-yellow-400 text-gray-950 font-black border border-yellow-200 shadow-sm',
        };
      default:
        return {
          categoryLabel: 'UNASSIGNED',
          categoryBadgeClass: 'bg-slate-800 text-slate-200 border border-slate-600 shadow-sm',
        };
    }
  }, [categoryCode]);

  // --- FACIAL HAIR RENDERER ---
  const renderFacialHair = (style: FacialHairStyle = 'none', color: string = '#111111') => {
    if (!style || style === 'none') return null;

    switch (style) {
      case 'pubescent-moustache':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            {/* Light teenage wispy mustache */}
            <path d="M 88 123 Q 96 121 104 123 M 112 123 Q 120 121 128 123" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.45" fill="none" />
          </svg>
        );

      case 'wild-beard':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            {/* Thick rugged warrior full beard */}
            <path d="M 56 88 C 56 138 60 162 108 162 C 156 162 160 138 160 88 C 152 106 140 114 132 116 L 132 122 C 122 110 114 122 108 122 C 102 122 94 110 84 122 L 84 116 C 76 114 64 106 56 88 Z" fill={color} />
            <path d="M 80 120 C 94 116 100 122 108 124 C 116 122 122 116 136 120 C 134 132 116 134 108 132 C 100 134 82 132 80 120 Z" fill={color} />
          </svg>
        );

      case 'full-beard':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            {/* Jaw & chin beard overlay bounded inside face box */}
            <path d="M 58 92 C 58 132 64 156 108 156 C 152 156 158 132 158 92 C 152 104 142 110 134 112 L 134 118 C 124 108 116 119 108 119 C 100 119 92 108 82 118 L 82 112 C 74 110 64 104 58 92 Z" fill={color} />
            {/* Connected Mustache */}
            <path d="M 82 122 C 94 118 100 123 108 125 C 116 123 122 118 134 122 C 132 131 116 133 108 131 C 100 133 84 131 82 122 Z" fill={color} />
          </svg>
        );

      case 'well-kept':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            {/* Trimmed sharp jaw & chin bounded inside face box */}
            <path d="M 60 98 C 60 130 64 156 108 156 C 152 156 156 130 156 98 C 150 108 140 112 132 115 L 132 120 C 122 112 114 120 108 120 C 102 120 94 112 84 120 L 84 115 C 76 112 66 108 60 98 Z" fill={color} />
            {/* Trimmed Mustache */}
            <path d="M 84 122 C 94 119 100 123 108 124 C 116 123 122 119 132 122 C 130 129 116 131 108 129 C 100 131 86 129 84 122 Z" fill={color} />
          </svg>
        );

      case '3-day-beard':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none opacity-45" viewBox="0 0 216 260">
            {/* Stubble full beard shadow */}
            <path d="M 58 92 C 58 132 64 156 108 156 C 152 156 158 132 158 92 C 152 104 142 110 134 112 L 134 118 C 124 108 116 119 108 119 C 100 119 92 108 82 118 L 82 112 C 74 110 64 104 58 92 Z" fill={color} />
            <path d="M 82 122 C 94 118 100 123 108 125 C 116 123 122 118 134 122 C 132 131 116 133 108 131 C 100 133 84 131 82 122 Z" fill={color} />
          </svg>
        );

      case 'mutton-chops':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            <path d="M 58 90 L 58 126 C 62 138 74 144 88 140 L 88 120 C 78 118 70 112 66 98 Z" fill={color} />
            <path d="M 158 90 L 158 126 C 154 138 142 144 128 140 L 128 120 C 138 118 146 112 150 98 Z" fill={color} />
            <path d="M 82 122 C 94 118 100 123 108 125 C 116 123 122 118 134 122 C 132 130 116 131 108 130 C 100 131 84 130 82 122 Z" fill={color} />
          </svg>
        );

      case 'royal-beard':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            <path d="M 82 122 C 94 118 100 123 108 125 C 116 123 122 118 134 122 C 132 131 116 133 108 131 C 100 133 84 131 82 122 Z" fill={color} />
            <path d="M 102 133 L 114 133 L 112 141 L 104 141 Z" fill={color} />
            <path d="M 96 142 C 96 152 100 156 108 156 C 116 156 120 152 120 142 Z" fill={color} />
          </svg>
        );

      case 'goatee':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            <path d="M 82 122 C 82 150 88 156 108 156 C 128 156 134 150 134 122 C 128 126 122 120 116 122 C 110 123 106 123 100 122 C 94 120 88 126 82 122 Z M 92 130 C 98 128 108 128 124 130 C 124 144 116 148 108 148 C 100 148 92 144 92 130 Z" fill={color} />
          </svg>
        );

      case 'chin-strap':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            <path d="M 58 98 C 58 132 64 156 108 156 C 152 156 158 132 158 98 L 154 102 C 154 130 150 152 108 152 C 66 152 62 130 62 102 Z" fill={color} />
          </svg>
        );

      case 'moustache':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            <path d="M 82 122 C 94 118 100 123 108 125 C 116 123 122 118 134 122 C 132 132 116 134 108 131 C 100 134 84 132 82 122 Z" fill={color} />
          </svg>
        );

      case 'pointy-moustache':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            <path d="M 74 118 C 88 120 98 123 108 125 C 118 123 128 120 142 118 C 138 126 124 132 108 130 C 92 132 78 126 74 118 Z" fill={color} />
          </svg>
        );

      case 'classic-moustache':
        return (
          <svg className="absolute inset-0 w-[216px] h-[260px] z-[6] pointer-events-none" viewBox="0 0 216 260">
            <path d="M 86 124 C 96 122 102 124 108 125 C 114 124 120 122 130 124 C 128 129 116 130 108 129 C 100 130 88 129 86 124 Z" fill={color} />
          </svg>
        );

      default:
        return null;
    }
  };

  const primaryNat = useMemo(() => {
    return nationality || player?.nationality || { code: 'ARG', iso: 'ar', name: 'Argentina' };
  }, [nationality, player?.nationality]);

  const otherNats = useMemo(() => {
    const combined = [
      ...(player?.otherNationalities || []),
      ...(player?.extraNationalities || []),
      ...(otherNationalities || []),
    ];
    const mainCode = primaryNat?.code;
    return combined.filter(
      (nat, index, self) =>
        nat &&
        nat.code &&
        nat.code !== mainCode &&
        index === self.findIndex((n) => n && n.code === nat.code)
    );
  }, [player?.otherNationalities, player?.extraNationalities, otherNationalities, primaryNat?.code]);

  const isSeniorLocked = Boolean(player?.isSeniorLocked || player?.seniorNationalTeamLocked);

  const handleSwitchPrimaryNationality = (targetNat: any) => {
    if (isSeniorLocked || !onUpdatePlayer || !player) return;
    const currentActiveNat = primaryNat;
    const currentOthers = [
      ...(player.otherNationalities || []),
      ...(player.extraNationalities || []),
    ];
    const updatedOthersList = [...currentOthers];
    if (currentActiveNat.code !== targetNat.code) {
      if (!updatedOthersList.some((n) => n.code === currentActiveNat.code)) {
        updatedOthersList.push(currentActiveNat);
      }
    }
    const cleanOthers = updatedOthersList.filter((n) => n.code !== targetNat.code);
    const updated: PlayerCardData = {
      ...player,
      nationality: targetNat,
      otherNationalities: cleanOthers,
      extraNationalities: cleanOthers,
    };
    onUpdatePlayer(updated);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[348px] perspective-1000 px-0.5 sm:px-1">
      <div
        id={id}
        onClick={handleCardClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`relative w-full max-w-[348px] rounded-[16px] p-2 sm:p-[14px] cursor-pointer select-none box-border overflow-hidden transition-transform ease-out will-change-transform ${tierContainerClass} ${className}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(var(--card-rot-x, 0deg)) rotateY(var(--card-rot-y, 0deg)) scale3d(var(--card-scale, 1), var(--card-scale, 1), var(--card-scale, 1))',
          transitionDuration: 'var(--card-trans-dur, 400ms)',
        }}
      >
        {/* Holographic Specular Glare Overlay (GPU accelerated opacity & position) */}
        <div
          className="absolute inset-0 pointer-events-none z-30 rounded-[16px] mix-blend-overlay transition-opacity duration-150"
          style={{
            opacity: 'var(--glare-opacity, 0)',
            background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)',
          }}
        />
        {/* Holographic Foil Shimmer Layer (High Quality Mode for Gold, Legendary, GOAT & Legend cards) */}
        {isHighQualityModeActive() && (tier === 'gold' || tier === 'legendary' || tier === 'goat' || Boolean(player?.isLegend)) && (
          <div className="holo-foil-shimmer" style={{ zIndex: 28, borderRadius: '16px' }} />
        )}
      {!isFlipped ? (
        /* FRONT SIDE OF CARD */
        <div>
          {/* Card Body Section: Left Column + Right Area */}
          <div className="flex gap-[6px] items-start mb-[8px]">
            {/* Left Column */}
            <div className="w-[62px] h-[276px] flex flex-col items-center justify-between py-[2px] shrink-0 text-center box-border select-none">
              {/* Card Tier Indicator & OVR directly underneath */}
              <div className="flex flex-col items-center w-full">
                {!hideOvr ? (
                  <>
                    <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase shadow-sm border ${
                      tier === 'goat'
                        ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400/50'
                        : tier === 'legendary'
                        ? 'bg-amber-950/90 text-amber-300 border-amber-400/50'
                        : tier === 'gold'
                        ? 'bg-slate-950/90 text-yellow-300 border-yellow-500/50'
                        : 'bg-slate-900/90 text-white border-slate-700'
                    }`}>
                      {tier.toUpperCase()}
                    </span>
                    {(() => {
                      const ovrInfo = getEffectivePlayerOvr(player);
                      const displayOvr = ovrInfo.effectiveOvr;
                      const hasBonus = ovrInfo.bonusOvr > 0;
                      const hasPenalty = ovrInfo.bonusOvr < 0;
                      const hasModifier = hasBonus || hasPenalty;
                      return (
                        <div className={`flex items-center justify-center ${hasModifier ? 'gap-0.5' : 'gap-1'} w-full max-w-full px-0.5`}>
                          <div
                            className={`font-black leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                              hasModifier
                                ? 'text-[22px] mt-[3px]'
                                : 'text-[32px] mt-[3px]'
                            } ${
                              hasBonus
                                ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                : hasPenalty
                                ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                                : 'text-white'
                            }`}
                          >
                            {displayOvr}
                          </div>
                          {hasBonus && (
                            <span className="px-1 py-0.5 rounded bg-emerald-500 text-white font-black text-[9px] shadow-sm leading-none border border-emerald-300 shrink-0">
                              +{ovrInfo.bonusOvr}
                            </span>
                          )}
                          {hasPenalty && (
                            <span className="px-1 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] shadow-sm leading-none border border-rose-300 shrink-0">
                              {ovrInfo.bonusOvr}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    {/* Potential OVR in prominent style */}
                    <div className="flex flex-col items-center mt-[2px] leading-none">
                      <div className={`font-black tracking-tight text-slate-400 drop-shadow-sm ${
                        (() => {
                          const ovrInfo = getEffectivePlayerOvr(player);
                          return (ovrInfo.bonusOvr !== 0) ? 'text-[22px]' : 'text-[28px]';
                        })()
                      }`}>
                        {player.potentialOvr ?? Math.min(99, Math.max(ovr, ovr + 4))}
                      </div>
                      <div className="text-[7.5px] font-extrabold uppercase tracking-widest text-slate-400 opacity-90">
                        POT
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-[8px] px-1.5 py-0.5 mt-1 rounded font-black tracking-wider uppercase shadow-sm border bg-emerald-950/90 text-emerald-300 border-emerald-500/50">
                    WONDERKID
                  </span>
                )}
              </div>

              {/* Club Emblem / Shield Section (MOVED HIGHER) */}
              {!hideTeam && (
                <div className="flex flex-col items-center gap-[1px] w-full px-0.5 mt-1">
                  <div className="w-[30px] h-[30px] box-border shrink-0">
                    {renderEmblemContent(true)}
                  </div>
                  <span className="text-[9px] font-black tracking-tight uppercase opacity-95 truncate max-w-full leading-tight text-white drop-shadow-sm">
                    {activeClubName}
                  </span>
                  {/* Team Country (3-letter Code) & Placeholder White League Emblem */}
                  <div className="flex items-center justify-center gap-[3px] mt-[2px] leading-none">
                    <span className="text-[8px] font-black tracking-wider uppercase opacity-90 text-slate-200 drop-shadow-sm">
                      {getTeamCountryCode(activeClubCountry || player.clubCountry || nationality?.name || '')}
                    </span>
                    <svg className="w-[10px] h-[10px] text-white opacity-95 drop-shadow-sm shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 5V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V5L12 2Z" fill="white" opacity="0.95" />
                      <path d="M12 6L13.3 9.2L16.8 9.5L14.2 11.8L15 15.2L12 13.3L9 15.2L9.8 11.8L7.2 9.5L10.7 9.2L12 6Z" fill="#0f172a" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Primary Nationality: Single Flag & Country Code (Strictly primary flag only on the card face; no dual nationality) */}
              {!hideNationality && primaryNat && primaryNat.code && primaryNat.name ? (
                <div className="flex flex-col items-center gap-[2px] mt-1">
                  <div className="w-[30px] h-[20px] rounded-[3px] overflow-hidden shadow-md border border-black/20" title={primaryNat.name}>
                    <img
                      src={`https://flagcdn.com/w40/${(primaryNat.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={primaryNat.code}
                      className="w-full h-full object-cover block"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><rect width="40" height="20" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="8" font-weight="bold">FLAG</text></svg>';
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase opacity-90 leading-tight">
                    {primaryNat.code}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Right Area: Top Header Bar + (Portrait Box + Right GOAT Slot) */}
            <div className="flex flex-col w-[244px] shrink-0">
              {/* Top Header Bar OUTSIDE and ABOVE Portrait */}
              <div className="w-full mb-[6px] px-[2px] flex items-center justify-between select-none min-h-[24px]">
                {/* Combined Position & Sub-Position Badge Box (e.g., MID: CAM) */}
                {!hidePosition && (
                  <div className="flex items-center gap-[4px]">
                    <span className={`text-[12px] font-black tracking-wide uppercase px-[8px] py-[3px] rounded-md shadow-md ${categoryBadgeClass}`}>
                      {categoryCode === 'UNASSIGNED' || !effectiveSubPos ? 'Unassigned' : `${categoryCode}: ${effectiveSubPos}`}
                    </span>
                  </div>
                )}

                {/* Playstyle at the right */}
                {!hidePosition && playStyle && (
                  <div className="bg-slate-950/90 border border-yellow-500/50 text-yellow-300 text-[8.5px] font-extrabold px-[6px] py-[3px] rounded-md uppercase tracking-wider shadow-md truncate max-w-[125px] text-center ml-auto">
                    {translatePlaystyle(playStyle)}
                  </div>
                )}
              </div>

              {/* Row containing Portrait Box (216px wide, perfectly centered) + Right Slot (18px) */}
              <div className="flex items-center gap-[6px]">
                {/* Enlarged Centered Portrait Box with Dark Studio Background */}
                <div
                  className="w-[216px] h-[248px] relative bg-[#1a202c] bg-[radial-gradient(ellipse_at_top,#334155_0%,#1e293b_60%,#0f172a_100%)] rounded-[10px] overflow-hidden flex-shrink-0 box-border shadow-inner"
                  style={{ border: `4px solid ${portraitBorderColor}` }}
                >
                  {/* 0. BACK HAIR LAYER (Z-1 - Strictly behind neck, shirt, and chest) */}
                  {hairElements.backHair && (
                    <div
                      className="absolute w-[216px] h-[260px] top-0 left-0 z-[1] transition-transform duration-200 pointer-events-none"
                      style={{
                        transformOrigin: '108px 105px',
                        transform: `scale(${strengthCalculations.headScale})`,
                      }}
                    >
                      {hairElements.backHair}
                    </div>
                  )}

                  {/* 1. ARMS & ARM TATTOOS & VEINS (Z-2) */}
                  <div
                    className="absolute bottom-0 z-[2] transition-all duration-200 rounded-t-[4px] overflow-hidden"
                    style={{
                      width: `${strengthCalculations.armW}px`,
                      height: `${strengthCalculations.armH}px`,
                      backgroundColor: biometrics.skinColor,
                      left: `${strengthCalculations.armLeftPos}px`,
                    }}
                  >
                    {renderArmTattoo(accessories.tattooArmL)}
                    {renderArmVeins(strengthCalculations.strengthTier, false, biometrics.skinColor)}
                  </div>

                  <div
                    className="absolute bottom-0 z-[2] transition-all duration-200 rounded-t-[4px] overflow-hidden"
                    style={{
                      width: `${strengthCalculations.armW}px`,
                      height: `${strengthCalculations.armH}px`,
                      backgroundColor: biometrics.skinColor,
                      left: `${strengthCalculations.armRightPos}px`,
                    }}
                  >
                    {renderArmTattoo(accessories.tattooArmR)}
                    {renderArmVeins(strengthCalculations.strengthTier, true, biometrics.skinColor)}
                  </div>

                  {/* 2. SHIRT & SHOULDER ASSEMBLY (Z-3 - Torso & Shoulders Base) */}
                  <div
                    className="absolute bottom-0 z-[3] pointer-events-none transition-all duration-200"
                    style={{
                      left: `${strengthCalculations.chestLeft}px`,
                      width: `${strengthCalculations.chestW}px`,
                      height: '84px',
                    }}
                  >
                    {/* Left Shoulder Sleeve */}
                    <div
                      className="absolute top-0 z-[3] transition-all duration-200 overflow-hidden"
                      style={{
                        left: `-${strengthCalculations.shoulderW - 2}px`,
                        width: `${strengthCalculations.shoulderW}px`,
                        ...kitStyles.shoulderLStyle,
                      }}
                    >
                      {/* Fabric Texture Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 4px)',
                        }}
                      />
                      {/* Fit-specific sleeve cut details */}
                      {activeKit.style === 'tight' && (
                        <>
                          <div className="absolute top-0 left-[2px] w-[1px] h-full bg-black/25 opacity-70 pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/35 border-t border-white/20 pointer-events-none" />
                        </>
                      )}
                      {activeKit.style === 'loose' && (
                        <>
                          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" preserveAspectRatio="none" viewBox="0 0 30 60">
                            <path d="M 4 10 Q 14 24 6 42" stroke="rgba(0,0,0,0.28)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                            <path d="M 12 8 Q 20 28 14 52" stroke="rgba(0,0,0,0.18)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                          </svg>
                          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                        </>
                      )}
                      {(!activeKit.style || activeKit.style === 'normal') && (
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black/20 pointer-events-none" />
                      )}
                    </div>

                    {/* Right Shoulder Sleeve */}
                    <div
                      className="absolute top-0 z-[3] transition-all duration-200 overflow-hidden"
                      style={{
                        right: `-${strengthCalculations.shoulderW - 2}px`,
                        width: `${strengthCalculations.shoulderW}px`,
                        ...kitStyles.shoulderRStyle,
                      }}
                    >
                      {/* Fabric Texture Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 4px)',
                        }}
                      />
                      {/* Fit-specific sleeve cut details */}
                      {activeKit.style === 'tight' && (
                        <>
                          <div className="absolute top-0 right-[2px] w-[1px] h-full bg-black/25 opacity-70 pointer-events-none" />
                          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/35 border-t border-white/20 pointer-events-none" />
                        </>
                      )}
                      {activeKit.style === 'loose' && (
                        <>
                          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" preserveAspectRatio="none" viewBox="0 0 30 60">
                            <path d="M 26 10 Q 16 24 24 42" stroke="rgba(0,0,0,0.28)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                            <path d="M 18 8 Q 10 28 16 52" stroke="rgba(0,0,0,0.18)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                          </svg>
                          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                        </>
                      )}
                      {(!activeKit.style || activeKit.style === 'normal') && (
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black/20 pointer-events-none" />
                      )}
                    </div>

                    {/* Chest Body */}
                    <div
                      className={`absolute left-0 top-0 w-full h-[84px] pointer-events-auto z-[3] shirt-chest-${activeKit.collar} overflow-hidden`}
                      style={{
                        ...kitStyles.chestStyle,
                      }}
                    >
                      {/* Athletic Micro-Mesh / Performance Weave Fabric Texture Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                        style={{
                          backgroundImage: `
                            radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.3) 100%),
                            repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px),
                            repeating-linear-gradient(-45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 4px)
                          `,
                        }}
                      />
                      {/* Athletic Torso Contouring & Highlights */}
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-black/25 opacity-70" />

                      {activeKit.style === 'tight' && (
                        <>
                          <div className="absolute top-0 left-[6px] w-[1px] h-full bg-black/20 opacity-60 pointer-events-none" />
                          <div className="absolute top-0 right-[6px] w-[1px] h-full bg-black/20 opacity-60 pointer-events-none" />
                        </>
                      )}
                      {activeKit.style === 'loose' && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-75" preserveAspectRatio="none" viewBox="0 0 100 84">
                          <path d="M 6 36 Q 16 54 8 80" stroke="rgba(0,0,0,0.2)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                          <path d="M 94 36 Q 84 54 92 80" stroke="rgba(0,0,0,0.2)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>

                    {/* Shirt Emblem */}
                    {!hideTeam && (
                      <div
                        className="absolute w-[20px] h-[20px] top-[26px] z-[4] box-border transition-all duration-200"
                        style={{
                          left: `${strengthCalculations.emblemLeftPos}px`,
                        }}
                      >
                        {renderEmblemContent(false)}
                      </div>
                    )}

                    {/* Chest Sponsor Print */}
                    {resolvedSponsor && resolvedSponsor.name && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-[46px] z-[4] w-[88%] text-center pointer-events-none select-none overflow-hidden"
                        style={{
                          color: resolvedSponsor.letterColor || '#ffffff',
                          fontFamily:
                            resolvedSponsor.writingStyle === 'classic'
                              ? 'Georgia, serif'
                              : resolvedSponsor.writingStyle === 'bold'
                              ? 'Impact, "Arial Black", sans-serif'
                              : 'system-ui, sans-serif',
                          fontWeight: resolvedSponsor.writingStyle === 'bold' ? 900 : 700,
                          textShadow:
                            resolvedSponsor.borderStyle !== 'none'
                              ? `0 0 2px ${resolvedSponsor.borderColor || '#000'}`
                              : '0 1px 2px rgba(0,0,0,0.7)',
                          letterSpacing: '0.8px',
                        }}
                      >
                        <span className="text-[7.5px] uppercase tracking-wider block truncate opacity-90">
                          {resolvedSponsor.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 3. NECK & NECK TATTOOS & VEINS (Z-5 - Extends from chin over shirt collar line) */}
                  <div
                    className="absolute w-[216px] h-[260px] top-0 left-0 z-[5] transition-transform duration-200 pointer-events-none"
                    style={{
                      transformOrigin: '108px 105px',
                      transform: `scale(${strengthCalculations.headScale})`,
                    }}
                  >
                    <div
                      className="absolute z-[5] transition-all duration-200 rounded-b-[16px] shadow-sm overflow-hidden"
                      style={{
                        width: `${strengthCalculations.neckW}px`,
                        height: `${strengthCalculations.neckH}px`,
                        left: `${strengthCalculations.neckLeft}px`,
                        top: '124px',
                        backgroundColor: biometrics.skinColor,
                      }}
                    >
                      {/* Neck Tattoo sits directly on neck skin */}
                      {renderNeckTattoo(accessories.tattooNeck)}
                      {/* Neck Veins */}
                      {renderNeckVeins(strengthCalculations.strengthTier, biometrics.skinColor)}
                    </div>
                  </div>

                  {/* 4. SHIRT COLLAR DETAILS (Z-6 - Crew / V-Neck / Polo Accents) */}
                  {activeKit.collar === 'crew' && (
                    <div
                      className="absolute top-[162px] z-[6] box-border pointer-events-none transition-all duration-200"
                      style={{
                        left: `${strengthCalculations.chestLeft + strengthCalculations.cLeft}px`,
                        width: `${strengthCalculations.neckW}px`,
                        height: '14px',
                        borderRadius: '0 0 14px 14px',
                        borderBottom: `2.5px solid ${activeKit.color2 || activeKit.color1}`,
                        backgroundColor: 'transparent',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
                      }}
                    />
                  )}

                  {activeKit.collar === 'v-neck' && (
                    <div
                      className="absolute top-[158px] z-[6] pointer-events-none transition-all duration-200"
                      style={{
                        left: `${strengthCalculations.chestLeft + strengthCalculations.cLeft - 4}px`,
                        width: `${strengthCalculations.neckW + 8}px`,
                        height: '28px',
                      }}
                    >
                      <svg
                        className="w-full h-full drop-shadow-md overflow-visible"
                        viewBox="0 0 100 85"
                        preserveAspectRatio="none"
                      >
                        {/* 1. Underlying Neck Skin Extension (fills the V-notch cleanly down to chest) */}
                        <polygon
                          points="14,0 50,68 86,0"
                          fill={biometrics.skinColor}
                        />
                        {/* Clavicle / throat hollow soft shadow on the skin */}
                        <ellipse cx="50" cy="28" rx="14" ry="10" fill="rgba(0,0,0,0.12)" />

                        {/* 2. Left V-Collar Ribbon Band */}
                        <polygon
                          points="0,0 50,85 50,68 14,0"
                          fill={activeKit.color2 || activeKit.color1}
                          stroke="rgba(0,0,0,0.25)"
                          strokeWidth="0.8"
                        />
                        {/* 3. Right V-Collar Ribbon Band (with realistic crossover overlap at apex) */}
                        <polygon
                          points="100,0 48,85 50,68 86,0"
                          fill={activeKit.color2 || activeKit.color1}
                          stroke="rgba(0,0,0,0.25)"
                          strokeWidth="0.8"
                        />

                        {/* 4. Ribbing Texture & Seam Lines on Collar */}
                        <line x1="8" y1="0" x2="49" y2="76" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                        <line x1="92" y1="0" x2="51" y2="76" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                        {/* Athletic Front Crossover Seam */}
                        <line x1="49" y1="68" x2="49" y2="85" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" />
                        <line x1="50" y1="68" x2="50" y2="85" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
                      </svg>
                    </div>
                  )}

                  {activeKit.collar === 'polo' && (
                    <div
                      className="absolute top-[156px] z-[6] box-border pointer-events-none transition-all duration-200"
                      style={{
                        left: `${strengthCalculations.chestLeft + strengthCalculations.cLeft - 8}px`,
                        width: `${strengthCalculations.neckW + 16}px`,
                        height: '38px',
                      }}
                    >
                      {/* 1. Open Athletic Neck Skin Notch (shows more neck & clavicle) */}
                      <svg
                        className="absolute top-0 left-0 w-full h-[22px] pointer-events-none"
                        viewBox="0 0 100 60"
                        preserveAspectRatio="none"
                      >
                        <polygon points="24,0 50,56 76,0" fill={biometrics.skinColor} />
                        <ellipse cx="50" cy="24" rx="12" ry="7" fill="rgba(0,0,0,0.12)" />
                      </svg>

                      {/* 2. Tailored Athletic Placket (below open neck) */}
                      <div
                        className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[14px] h-[20px] rounded-b-[3px] border-x border-b border-black/35 shadow-md flex flex-col items-center justify-evenly py-0.5 overflow-hidden"
                        style={{
                          backgroundColor: activeKit.color2 || activeKit.color1,
                          backgroundImage:
                            'linear-gradient(to right, rgba(0,0,0,0.12), transparent 40%, rgba(255,255,255,0.15) 60%, rgba(0,0,0,0.12))',
                        }}
                      >
                        {/* Placket center seam */}
                        <div className="absolute top-0 left-[7px] w-[1px] h-full bg-black/20 pointer-events-none" />
                        {/* Pearl Button 1 */}
                        <div className="relative z-[1] w-[4px] h-[4px] rounded-full bg-gradient-to-br from-white via-slate-200 to-slate-400 border border-slate-600 shadow-sm flex items-center justify-center">
                          <div className="w-[1.5px] h-[1.5px] rounded-full bg-slate-700 opacity-60" />
                        </div>
                        {/* Pearl Button 2 */}
                        <div className="relative z-[1] w-[4px] h-[4px] rounded-full bg-gradient-to-br from-white via-slate-200 to-slate-400 border border-slate-600 shadow-sm flex items-center justify-center">
                          <div className="w-[1.5px] h-[1.5px] rounded-full bg-slate-700 opacity-60" />
                        </div>
                      </div>

                      {/* 3. Left Folded Wing Lapel (Flared outward, showing neck center) */}
                      <div
                        className="absolute top-[1px] left-[2px] w-[44%] h-[22px] drop-shadow-md transition-all duration-200"
                        style={{
                          backgroundColor: activeKit.color2 || activeKit.color1,
                          clipPath: 'polygon(0% 0%, 55% 0%, 100% 75%, 25% 100%, 0% 50%)',
                          backgroundImage:
                            'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
                        }}
                      >
                        {/* Lapel contrast piping along outer edge */}
                        <div
                          className="absolute inset-0 pointer-events-none border-b border-l border-black/35"
                          style={{
                            boxShadow: `inset 0 -1.5px 0 ${
                              activeKit.color1 !== activeKit.color2 ? activeKit.color1 : 'rgba(255,255,255,0.4)'
                            }`,
                          }}
                        />
                      </div>

                      {/* 4. Right Folded Wing Lapel (Symmetrical outward flare) */}
                      <div
                        className="absolute top-[1px] right-[2px] w-[44%] h-[22px] drop-shadow-md transition-all duration-200"
                        style={{
                          backgroundColor: activeKit.color2 || activeKit.color1,
                          clipPath: 'polygon(45% 0%, 100% 0%, 100% 50%, 75% 100%, 0% 75%)',
                          backgroundImage:
                            'repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
                        }}
                      >
                        {/* Lapel contrast piping along outer edge */}
                        <div
                          className="absolute inset-0 pointer-events-none border-b border-r border-black/35"
                          style={{
                            boxShadow: `inset 0 -1.5px 0 ${
                              activeKit.color1 !== activeKit.color2 ? activeKit.color1 : 'rgba(255,255,255,0.4)'
                            }`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. HEAD ASSEMBLY (Z-8) */}
                  <div
                    className="absolute w-[216px] h-[260px] top-0 left-0 z-[8] transition-transform duration-200 pointer-events-none"
                    style={{
                      transformOrigin: '108px 105px',
                      transform: `scale(${strengthCalculations.headScale})`,
                    }}
                  >
                    {/* Ears */}
                    <div
                      className="absolute w-[12px] h-[32px] top-[90px] left-[50px] rounded-l-full z-[3]"
                      style={{ backgroundColor: biometrics.skinColor }}
                    />
                    <div
                      className="absolute w-[12px] h-[32px] top-[90px] right-[50px] rounded-r-full z-[3]"
                      style={{ backgroundColor: biometrics.skinColor }}
                    />

                    {/* Face Box */}
                    <div
                      className="absolute w-[98px] h-[122px] top-[40px] left-[59px] rounded-t-[49px] rounded-b-[58px] z-[5] shadow-sm"
                      style={{ backgroundColor: biometrics.skinColor }}
                    />

                    {/* Face Tattoos */}
                    {renderFaceTattoo(accessories.tattooFace)}

                    {/* Forehead & Temple Veins */}
                    {renderForeheadVeins(strengthCalculations.strengthTier, biometrics.skinColor)}

                    {/* Earrings */}
                    {renderEarring(
                      (accessories as any).earring || accessories.earringL,
                      'left',
                      accessories.earringMaterial || (accessories as any).earringMaterialL,
                      accessories.earringGemColor || (accessories as any).earringGemL
                    )}
                    {renderEarring(
                      (accessories as any).earring || accessories.earringR,
                      'right',
                      accessories.earringMaterial || (accessories as any).earringMaterialR,
                      accessories.earringGemColor || (accessories as any).earringGemR
                    )}

                    {/* Facial Hair Vector Overlay (Z-6) */}
                    {renderFacialHair(
                      biometrics.facialHairStyle || (biometrics as any).facialHair || 'none',
                      biometrics.facialHairColor || biometrics.hairRoot
                    )}

                    {/* Top Hair (Z-7) */}
                    {hairElements.topHair}

                    {/* Headwear / Glasses / Mask Accessories (Z-8) */}
                    {(() => {
                      const isMedOrLongHair =
                        biometrics.hairLength === 'medium' ||
                        biometrics.hairLength === 'long' ||
                        ['dreads', 'locs', 'afro-medium', 'afro-large', 'curls-long', 'wavy-long', 'braids', 'manbun', 'ponytail', 'slicked-back-long'].includes(
                          biometrics.hairStyle as string
                        );
                      const glassesColorHex = accessories.glassesColor || accessories.sportsGlassesColor || accessories.headbandColor || '#2563eb';

                      return (
                        <>
                          {(accessories.accessory === 'headband' || accessories.headwear === 'headband') && (
                            <div
                              className="absolute z-[8] rounded-[2px] transition-all duration-200"
                              style={{
                                width: isMedOrLongHair ? '102px' : '100px',
                                left: isMedOrLongHair ? '57px' : '58px',
                                height: isMedOrLongHair ? '13px' : '12px',
                                top: isMedOrLongHair ? '56px' : '48px',
                                backgroundColor: accessories.headbandColor || '#ffffff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.2)',
                                borderTop: '1px solid rgba(0,0,0,0.15)',
                                borderBottom: '1px solid rgba(0,0,0,0.25)',
                              }}
                            />
                          )}
                          {(accessories.accessory === 'performance-band' || accessories.headwear === 'performance-band') && (
                            <div
                              className="absolute z-[8] rounded-[1px] transition-all duration-200"
                              style={{
                                width: isMedOrLongHair ? '102px' : '100px',
                                left: isMedOrLongHair ? '57px' : '58px',
                                height: isMedOrLongHair ? '7px' : '6px',
                                top: isMedOrLongHair ? '57px' : '50px',
                                backgroundColor: accessories.headbandColor || '#111111',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                              }}
                            />
                          )}
                          {(accessories.accessory === 'protective-mask' || (accessories.headwear as any) === 'protective-mask' || accessories.eyewear === 'protective-mask') && (
                            <svg
                              className="absolute w-[216px] h-[260px] top-0 left-0 z-[8] pointer-events-none drop-shadow-md transition-all duration-200"
                              style={{
                                transform: isMedOrLongHair ? 'translateY(4px)' : 'none',
                              }}
                            >
                              <path d="M 60 84 Q 108 90 156 84 L 152 118 Q 108 130 64 118 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" opacity="0.95" />
                              <ellipse cx="80" cy="94" rx="14" ry="8" fill={biometrics.skinColor} />
                              <ellipse cx="136" cy="94" rx="14" ry="8" fill={biometrics.skinColor} />
                              <line x1="58" y1="88" x2="48" y2="84" stroke="#09090b" strokeWidth="3" />
                              <line x1="158" y1="88" x2="168" y2="84" stroke="#09090b" strokeWidth="3" />
                            </svg>
                          )}
                          {(accessories.accessory === 'sports-glasses' || (accessories.headwear as any) === 'sports-glasses' || accessories.eyewear === 'sports-glasses') && (
                            <svg
                              className="absolute w-[216px] h-[260px] top-0 left-0 z-[8] pointer-events-none drop-shadow-md transition-all duration-200"
                              style={{
                                transform: isMedOrLongHair ? 'translateY(3px)' : 'none',
                              }}
                            >
                              <rect x="48" y="86" width="120" height="6" rx="3" fill="#09090b" />
                              <rect x="62" y="81" width="40" height="22" rx="7" fill="#09090b" stroke={glassesColorHex} strokeWidth="2.5" />
                              <rect x="114" y="81" width="40" height="22" rx="7" fill="#09090b" stroke={glassesColorHex} strokeWidth="2.5" />
                              <rect x="65" y="84" width="34" height="16" rx="5" fill={glassesColorHex} opacity="0.45" />
                              <rect x="117" y="84" width="34" height="16" rx="5" fill={glassesColorHex} opacity="0.45" />
                              <line x1="70" y1="86" x2="82" y2="96" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                              <line x1="122" y1="86" x2="134" y2="96" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                              <rect x="100" y="87" width="16" height="5" rx="2" fill="#09090b" />
                              <rect x="102" y="88" width="12" height="3" rx="1.5" fill={glassesColorHex} />
                            </svg>
                          )}
                          {(accessories.accessory === 'classic-glasses' || (accessories.headwear as any) === 'classic-glasses' || accessories.eyewear === 'classic-glasses') && (
                            <svg className="absolute w-[216px] h-[260px] top-0 left-0 z-[8] pointer-events-none drop-shadow-md">
                              <rect x="52" y="88" width="112" height="4" rx="2" fill="#334155" />
                              <rect x="64" y="82" width="38" height="22" rx="4" fill="none" stroke="#1e293b" strokeWidth="2" />
                              <rect x="114" y="82" width="38" height="22" rx="4" fill="none" stroke="#1e293b" strokeWidth="2" />
                              <line x1="102" y1="90" x2="114" y2="90" stroke="#1e293b" strokeWidth="2" />
                              <rect x="66" y="84" width="34" height="18" rx="3" fill="#e2e8f0" opacity="0.4" />
                              <rect x="116" y="84" width="34" height="18" rx="3" fill="#e2e8f0" opacity="0.4" />
                            </svg>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* 6. NECKLACE OVERLAY (Z-12 - Topmost layer above neck and collar, hidden when none) */}
                  {renderNecklace(
                    accessories.necklace,
                    strengthCalculations.neckW,
                    strengthCalculations.neckLeft,
                    strengthCalculations.headScale
                  )}
                </div>

                {/* Right Side Vertical Slot */}
                <div className={`w-[18px] h-[248px] flex flex-col items-center justify-center rounded-[8px] shrink-0 select-none ${
                  tier === 'goat'
                    ? 'bg-cyan-950/90 backdrop-blur-sm border border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.35)] py-2'
                    : 'bg-slate-950/30 border border-white/10 py-2'
                }`}>
                  {tier === 'goat' ? (
                    <span className="font-black text-[11px] leading-[1.3] tracking-[1px] text-cyan-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] text-center">
                      G<br />O<br />A<br />T
                    </span>
                  ) : (
                    <div className="w-[2px] h-[160px] bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full opacity-50" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PLAYER NAME BELOW THE PORTRAIT */}
          <div className="text-center py-0.5">
            <h2 className="m-0 text-[20px] font-black tracking-wide truncate leading-tight drop-shadow-sm">
              {formatPersonName(name)}
            </h2>
          </div>

          {/* PLAYER DETAILS STRIP (Foot, Weak Foot, Age, Height, Weight, Market Value) */}
          <div className="flex items-center justify-between text-[10px] font-bold border-y-2 border-current/20 px-1 py-[4px] my-[6px] opacity-90 uppercase">
            <div>
              <span className="opacity-70 mr-0.5">{t('CARD_FOOT')}</span>
              <span className="font-black">{translateFoot(preferredFoot).toUpperCase()}</span>
            </div>
            <div>
              <span className="opacity-70 mr-0.5">{t('CARD_WF')}</span>
              <span className="font-black">{weakFootStars}★</span>
            </div>
            <div>
              <span className="opacity-70 mr-0.5">{t('CARD_AGE')}</span>
              <span className="font-black">{age}</span>
            </div>
            <div>
              <span className="opacity-70 mr-0.5">{t('CARD_VAL')}</span>
              <span className="font-black font-mono text-amber-300">
                {player.marketValue
                  ? player.marketValue >= 1000000
                    ? `€${(player.marketValue / 1000000).toFixed(1)}M`
                    : `€${(player.marketValue / 1000).toFixed(0)}K`
                  : '€500K'}
              </span>
            </div>
          </div>

          {/* Stats Grid & Active Perks */}
          {!hideStats && (
            <>
              {(() => {
                const isGk = (subPosition || position || '').toUpperCase() === 'GK';
                const catInfo = getEffectiveCategoryStats(player);
                if (isGk) {
                  const gk = getOrCreateGkDetailed(stats);
                  const gkGrid = [
                    { val: gk.saving, delta: getAttributeModifier(player, 'saving', gk.saving).delta, label: translateStatLabel('SAV') },
                    { val: gk.reflexes, delta: getAttributeModifier(player, 'reflexes', gk.reflexes).delta, label: translateStatLabel('REF') },
                    { val: gk.handling, delta: getAttributeModifier(player, 'handling', gk.handling).delta, label: translateStatLabel('HAN') },
                    { val: gk.positioning, delta: getAttributeModifier(player, 'positioning', gk.positioning).delta, label: translateStatLabel('POS') },
                    { val: gk.aerialReach, delta: getAttributeModifier(player, 'aerialReach', gk.aerialReach).delta, label: translateStatLabel('AER') },
                    { val: gk.oneOnOne, delta: getAttributeModifier(player, 'oneOnOne', gk.oneOnOne).delta, label: translateStatLabel('ONE') },
                  ];
                  return (
                    <div className="grid grid-cols-2 gap-[6px] font-bold text-[14px] border-t-2 border-current/20 pt-[8px]">
                      {gkGrid.map((item) => (
                        <div key={item.label} className="flex items-center">
                          <span className={`text-[16px] mr-[3px] font-black ${item.delta > 0 ? 'text-emerald-400' : item.delta < 0 ? 'text-rose-400' : ''}`}>
                            {item.val}
                          </span>
                          {item.delta > 0 && item.val < 100 && (
                            <span className="text-[11px] font-black text-emerald-400 mr-[4px]">+{item.delta}</span>
                          )}
                          {item.delta < 0 && item.val < 100 && (
                            <span className="text-[11px] font-black text-rose-400 mr-[4px]">{item.delta}</span>
                          )}
                          <span className="opacity-80 text-[11px]">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                const outfieldGrid = [
                  { val: stats.pro, bonus: catInfo.categoryBonuses.PRO, label: translateStatLabel('PRO') },
                  { val: stats.def, bonus: catInfo.categoryBonuses.DEF, label: translateStatLabel('DEF') },
                  { val: stats.cre, bonus: catInfo.categoryBonuses.CRE, label: translateStatLabel('CRE') },
                  { val: stats.men, bonus: catInfo.categoryBonuses.MEN, label: translateStatLabel('MEN') },
                  { val: stats.goa, bonus: catInfo.categoryBonuses.SCO, label: translateStatLabel('SCO') },
                  { val: stats.phy, bonus: catInfo.categoryBonuses.PHY, label: translateStatLabel('PHY') },
                ];
                return (
                  <div className="grid grid-cols-2 gap-[6px] font-bold text-[14px] border-t-2 border-current/20 pt-[8px]">
                    {outfieldGrid.map((item) => {
                      const isMastery = item.val >= 117;
                      const isBreak = item.val >= 100;
                      return (
                        <div key={item.label} className="flex items-center">
                          <span
                            className={`text-[16px] mr-[3px] font-black ${
                              isMastery
                                ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
                                : isBreak
                                ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                                : item.bonus > 0
                                ? 'text-emerald-400'
                                : item.bonus < 0
                                ? 'text-rose-400'
                                : ''
                            }`}
                          >
                            {isMastery ? `👑 ${item.val}` : isBreak ? `⭐ ${item.val}` : item.val}
                          </span>
                          {!isBreak && item.bonus > 0 && (
                            <span className="text-[11px] font-black text-emerald-400 mr-[4px]">+{item.bonus}</span>
                          )}
                          {!isBreak && item.bonus < 0 && (
                            <span className="text-[11px] font-black text-rose-400 mr-[4px]">{item.bonus}</span>
                          )}
                          <span className="opacity-80 text-[11px]">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* ACTIVE PERKS SECTION (5 SLOTS AT BOTTOM OF PLAYER CARD) */}
              {!hidePerks && (
                <div className="mt-2 pt-1.5 border-t-2 border-current/20">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider opacity-85 mb-1">
                    <span>{t('CARD_ACTIVE_PERKS')}</span>
                    <span>{activePerks.length} / 5</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    {[0, 1, 2, 3, 4].map((slotIdx) => {
                      const perk = activePerks[slotIdx];
                      if (perk) {
                        return (
                          <div
                            key={perk.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPerkTooltip(selectedPerkTooltip?.id === perk.id ? null : perk);
                            }}
                            title={`${perk.name} (${perk.category}): ${perk.effect}`}
                            className="w-7 h-7 rounded-lg bg-black/40 border border-current/50 flex items-center justify-center cursor-pointer hover:bg-black/70 hover:scale-110 transition-all relative group shadow-sm"
                          >
                            <PerkIcon iconName={perk.iconName} className="w-3.5 h-3.5" />
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`empty-slot-${slotIdx}`}
                          title={t('CARD_EMPTY_SLOT')}
                          className="w-7 h-7 rounded-lg border border-dashed border-current/30 flex items-center justify-center opacity-40 text-[9px] font-black"
                        >
                          •
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Click Tooltip */}
                  {selectedPerkTooltip && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPerkTooltip(null);
                      }}
                      className="mt-1.5 p-2 rounded-xl bg-slate-950/95 text-white text-[10px] border border-amber-400/60 shadow-2xl animate-fadeIn relative z-30"
                    >
                      <div className="flex items-center justify-between font-black text-amber-300">
                        <span className="uppercase">{selectedPerkTooltip.name}</span>
                        <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 uppercase">
                          {selectedPerkTooltip.category}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-200 mt-0.5 leading-snug">
                        {selectedPerkTooltip.effect}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* BACK SIDE OF CARD */
        <div className="min-h-[360px] flex flex-col justify-between p-2">
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-3 border-current/20">
              <div>
                <span className="text-[10px] uppercase tracking-wider opacity-75 block font-bold">
                  {t('CARD_CAREER_PROFILE')}
                </span>
                <h3 className="text-lg font-black tracking-tight">
                  {formatPersonName(name)}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold block opacity-75">OVR</span>
                {(() => {
                  const ovrInfo = getEffectivePlayerOvr(player);
                  return (
                    <span className={`text-2xl font-black ${
                      ovrInfo.bonusOvr > 0 ? 'text-emerald-400' : ovrInfo.bonusOvr < 0 ? 'text-rose-400' : ''
                    }`}>
                      {ovrInfo.effectiveOvr}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs opacity-90 leading-relaxed mb-4 italic">
              "{translateBio(customBio, name, hidePosition ? '' : (subPosition || position), hideTeam ? '' : activeClubName)}"
            </p>

            {/* Detailed Stats Bars */}
            <div className="space-y-2 mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1">
                {t('CARD_ATTR_DISTRIBUTION')}
              </div>
              {(() => {
                const isGk = (subPosition || position || '').toUpperCase() === 'GK';
                if (isGk) {
                  const gk = getOrCreateGkDetailed(stats);
                  const gkBars = [
                    { label: `${translateStatLabel('SAV')} (${t('ATTR_SAVING') || 'Saving'})`, val: gk.saving },
                    { label: `${translateStatLabel('REF')} (${t('ATTR_REFLEXES') || 'Reflexes'})`, val: gk.reflexes },
                    { label: `${translateStatLabel('HAN')} (${t('ATTR_HANDLING') || 'Handling'})`, val: gk.handling },
                    { label: `${translateStatLabel('POS')} (${t('ATTR_POSITIONING') || 'Positioning'})`, val: gk.positioning },
                    { label: `${translateStatLabel('AER')} (${t('ATTR_AERIAL_REACH') || 'Aerial Reach'})`, val: gk.aerialReach },
                    { label: `${translateStatLabel('ONE')} (${t('ATTR_ONE_ON_ONE') || 'One-on-One'})`, val: gk.oneOnOne },
                    { label: `${translateStatLabel('DIS')} (${t('ATTR_DISTRIBUTION') || 'Distribution'})`, val: gk.distribution },
                  ];
                  return gkBars.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="text-[10px] w-28 truncate font-medium">
                        {s.label}
                      </span>
                      <div className="flex-1 bg-black/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-current rounded-full"
                          style={{ width: `${Math.min(100, s.val)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold w-6 text-right">
                        {s.val}
                      </span>
                    </div>
                  ));
                }

                const bars = [
                  { label: `${translateStatLabel('PRO')} (${getOfficialStatName('PRO')})`, val: stats.pro },
                  { label: `${translateStatLabel('DEF')} (${getOfficialStatName('DEF')})`, val: stats.def },
                  { label: `${translateStatLabel('CRE')} (${getOfficialStatName('CRE')})`, val: stats.cre },
                  { label: `${translateStatLabel('MEN')} (${getOfficialStatName('MEN')})`, val: stats.men },
                  { label: `${translateStatLabel('SCO')} (${getOfficialStatName('SCO')})`, val: stats.goa },
                  { label: `${translateStatLabel('PHY')} (${getOfficialStatName('PHY')})`, val: stats.phy },
                ];
                return bars.map((s) => {
                  const isMastery = s.val >= 117;
                  const isBreak = s.val >= 100;
                  return (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className={`text-[10px] w-28 truncate font-medium ${isBreak ? 'text-amber-300 font-bold' : ''}`}>
                        {s.label}
                      </span>
                      <div className="flex-1 bg-black/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isBreak
                              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
                              : 'bg-current'
                          }`}
                          style={{ width: `${Math.min(100, isMastery ? 100 : s.val)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-bold w-7 text-right ${
                          isMastery
                            ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                            : isBreak
                            ? 'text-amber-300'
                            : ''
                        }`}
                      >
                        {isMastery ? `👑${s.val}` : isBreak ? `⭐${s.val}` : s.val}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Footer info */}
          <div className="border-t border-current/20 pt-2 text-center text-[10px] opacity-75">
            <div>{t('CARD_ID')} {player.id.toUpperCase()} • {t('CARD_TIER')} {tier.toUpperCase()}</div>
            <div className="mt-0.5 font-medium">{t('CARD_FLIP_BACK')}</div>
          </div>
        </div>
      )}
      </div>

      {/* Senior International Lock Status Banner */}
      {!hideNationality && (player?.isSeniorLocked || player?.seniorNationalTeamLocked) && (
        <div className="mt-2.5 w-full bg-gradient-to-r from-rose-950/95 via-slate-900 to-rose-950/95 border border-rose-500/60 rounded-2xl p-2.5 shadow-xl flex items-center justify-between text-left animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0 text-rose-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9.5px] font-black uppercase text-rose-300 tracking-wider">
                {t('SENIOR_INTERNATIONAL_NATION') || 'Senior International Nation'}: {player.seniorNation || nationality?.name || (t('COMMITTED') || 'Committed')}
              </div>
              <div className="text-[11px] font-black text-white flex items-center gap-1">
                {t('NATIONALITY_LOCKED') || 'NATIONALITY LOCKED'} 🔒
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Nationalities Menu Below Card */}
      {!hideNationality && otherNats.length > 0 && (
        <div className="mt-2.5 w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xl flex flex-col gap-2 text-left animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              {t('OTHER_NATIONALITIES') || 'Other Nationalities'}
            </span>
            <span className="px-2 py-0.5 bg-slate-800 text-sky-300 rounded-full text-[10px] font-mono font-bold border border-sky-500/20">
              {otherNats.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {otherNats.map((nat, idx) => {
              const canSwitch = !isSeniorLocked && Boolean(onUpdatePlayer);
              return (
                <div
                  key={`${nat.code}-${idx}`}
                  onClick={() => {
                    if (canSwitch) handleSwitchPrimaryNationality(nat);
                  }}
                  title={canSwitch ? `${t('SWITCH_PRIMARY_NATION') || 'Make Primary Nation'}: ${nat.name}` : nat.name}
                  className={`inline-flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 shadow-sm ${
                    canSwitch ? 'cursor-pointer hover:border-amber-400/80 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition' : ''
                  }`}
                >
                  <img
                    src={`https://flagcdn.com/w40/${(nat.iso || 'gb-eng').toLowerCase()}.png`}
                    alt={nat.code}
                    className="w-4 h-3 object-cover rounded-[2px] shadow-xs border border-black/20 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="12" viewBox="0 0 20 12"><rect width="20" height="12" fill="%23334155"/></svg>';
                    }}
                  />
                  <span className="text-[11px] text-white font-black">{nat.name}</span>
                  <span className="text-[9.5px] text-sky-400 font-mono font-bold">({nat.code})</span>
                  {canSwitch && (
                    <span className="text-[9px] px-1 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 uppercase font-black tracking-tight">
                      {t('SWITCH_PRIMARY_NATION') || 'Make Primary'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const PlayerCard = React.memo(PlayerCardComponent);
