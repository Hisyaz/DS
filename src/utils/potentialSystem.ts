import { PlayerCardData } from '../types';
import { ParentCardRarity } from '../types/parentCards';

export const BASE_PLAYER_POTENTIAL = 80;
export const MAX_DISPLAYED_POTENTIAL = 99;

/**
 * Roll random potential bonus for Parent Card based on rarity:
 * Bronze: +1 to +10 (Possible final starting potential: 81–90)
 * Silver: +3 to +12 (Possible final starting potential: 83–92)
 * Gold: +5 to +15 (Possible final starting potential: 85–95)
 * Legendary: +8 to +17 (Possible final starting potential: 88–97)
 * Iconic: Fixed +18 total (+8 component + +10 bonus => 80 + 18 = 98 starting potential)
 */
export function rollParentCardPotentialBonus(rarity: ParentCardRarity): number {
  switch (rarity) {
    case 'bronze':
      return Math.floor(Math.random() * 10) + 1; // +1 to +10
    case 'silver':
      return Math.floor(Math.random() * 10) + 3; // +3 to +12
    case 'gold':
      return Math.floor(Math.random() * 11) + 5; // +5 to +15
    case 'legendary':
      return Math.floor(Math.random() * 10) + 8; // +8 to +17
    case 'iconic':
      return 18; // Fixed +18
    default:
      return 5;
  }
}

/**
 * Visual color coding for Parent Card potential bonus:
 * 1–5: Red
 * 6–8: Orange
 * 9–14: Green
 * 15+: Blue
 */
export function getPotentialBonusColor(bonus: number): {
  textColor: string;
  badgeBg: string;
  borderColor: string;
  glowClass: string;
  name: 'red' | 'orange' | 'green' | 'blue';
} {
  if (bonus <= 5) {
    return {
      textColor: 'text-red-400',
      badgeBg: 'bg-red-500/20',
      borderColor: 'border-red-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
      name: 'red',
    };
  }
  if (bonus <= 8) {
    return {
      textColor: 'text-orange-400',
      badgeBg: 'bg-orange-500/20',
      borderColor: 'border-orange-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]',
      name: 'orange',
    };
  }
  if (bonus <= 14) {
    return {
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      name: 'green',
    };
  }
  return {
    textColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/20',
    borderColor: 'border-sky-500/40',
    glowClass: 'shadow-[0_0_15px_rgba(14,165,233,0.2)]',
    name: 'blue',
  };
}

/**
 * Safely clamps displayed potential to 0–99
 */
export function clampDisplayedPotential(potential: number): number {
  return Math.min(MAX_DISPLAYED_POTENTIAL, Math.max(0, Math.round(potential)));
}

/**
 * Calculates initial player potential given base and parent card bonus
 */
export function calculateStartingPotential(parentBonus: number = 0, otherBonuses: number = 0): {
  displayedPotential: number;
  internalPotential: number;
} {
  const raw = BASE_PLAYER_POTENTIAL + parentBonus + otherBonuses;
  return {
    displayedPotential: clampDisplayedPotential(raw),
    internalPotential: Math.max(0, raw),
  };
}

/**
 * Checks if the player is eligible to trigger the one-time Iconic Player event at 99 Potential
 */
export function shouldTriggerIconicPlayerEvent(player: PlayerCardData): boolean {
  if (player.iconicPlayerEventCompleted) return false;
  const currentPot = player.potentialOvr ?? BASE_PLAYER_POTENTIAL;
  return currentPot >= 99;
}
