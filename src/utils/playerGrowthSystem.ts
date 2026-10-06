import { PlayerCardData } from '../types';
import { ParentCardInstance } from '../types/parentCards';

export interface InheritedHeightInfo {
  label: string;
  description: string;
}

/**
  Roll inherited height (in CM) for Parent Cards:
  1–5 CM   : 50% chance
  6–9 CM   : 25% chance
  10–12 CM : 20% chance
  13–15 CM :  5% chance
 */
export function rollInheritedHeight(): number {
  const rand = Math.random() * 100;
  if (rand < 50) {
    // 1–5 CM
    return Math.floor(Math.random() * 5) + 1;
  } else if (rand < 75) {
    // 6–9 CM
    return Math.floor(Math.random() * 4) + 6;
  } else if (rand < 95) {
    // 10–12 CM
    return Math.floor(Math.random() * 3) + 10;
  } else {
    // 13–15 CM
    return Math.floor(Math.random() * 3) + 13;
  }
}

/**
  Get description and title according to inherited height value.
 */
export function getInheritedHeightInfo(heightCm: number): InheritedHeightInfo {
  if (heightCm <= 5) {
    return {
      label: 'Slightly taller',
      description: "Your parents' genes made you slightly taller.",
    };
  } else if (heightCm <= 9) {
    return {
      label: 'More taller',
      description: "Your parents' genes made you noticeably taller.",
    };
  } else if (heightCm <= 12) {
    return {
      label: 'Much taller',
      description: "Your parents' genes gave you a significant height advantage.",
    };
  } else {
    return {
      label: 'Really taller',
      description: "Your parents' genes gave you an exceptional height advantage.",
    };
  }
}

/**
  Applies the parent card's inherited height bonus to the player exactly once upon selection.
 */
export function applyParentCardInheritedHeight(
  player: PlayerCardData,
  parentCard: ParentCardInstance
): PlayerCardData {
  if (player.inheritedHeightCmApplied) {
    return player;
  }

  const inherited = parentCard.inheritedHeightCm !== undefined ? parentCard.inheritedHeightCm : rollInheritedHeight();
  const baseHeight = player.heightCm !== undefined ? player.heightCm : 145;
  const baseWeight = player.weightKg !== undefined ? player.weightKg : 45;

  const newHeight = baseHeight + inherited;
  const newWeight = baseWeight + inherited; // 1:1 ratio: 1 CM = 1 KG

  return {
    ...player,
    heightCm: newHeight,
    weightKg: newWeight,
    inheritedHeightCmApplied: true,
    inheritedHeightCm: inherited,
  };
}

export interface AnnualGrowthResult {
  oldHeight: number;
  oldWeight: number;
  newHeight: number;
  newWeight: number;
  growthCm: number;
  growthKg: number;
  isGrowthSpurt: boolean;
  hasHadGrowthSpurt: boolean;
  updatedPlayer: PlayerCardData;
}

/**
  Annual physical growth roll executed when player advances one year (active from Age 10 to 18).
  Height and weight are linked 1:1 (+1 CM = +1 KG).
  Growth is deactivated permanently at Age 18.
 */
export function calculateAnnualPhysicalGrowth(player: PlayerCardData): AnnualGrowthResult {
  const currentAge = player.age !== undefined ? player.age : 10;
  const currentHeight = player.heightCm !== undefined ? player.heightCm : 145;
  const currentWeight = player.weightKg !== undefined ? player.weightKg : 45;
  const hasHadGrowthSpurt = !!player.hasHadGrowthSpurt;

  // At age 18 and above, growth is deactivated permanently
  if (currentAge >= 18) {
    return {
      oldHeight: currentHeight,
      oldWeight: currentWeight,
      newHeight: currentHeight,
      newWeight: currentWeight,
      growthCm: 0,
      growthKg: 0,
      isGrowthSpurt: false,
      hasHadGrowthSpurt,
      updatedPlayer: {
        ...player,
        lastYearGrowthCm: 0,
        lastYearWasGrowthSpurt: false,
      },
    };
  }

  let growthCm = 0;
  let isGrowthSpurt = false;

  if (!hasHadGrowthSpurt) {
    const roll = Math.random() * 100;
    if (roll < 50) {
      // Small Growth — 50%: 1–2 CM
      growthCm = Math.floor(Math.random() * 2) + 1;
    } else if (roll < 75) {
      // Regular Growth — 25%: 3–5 CM
      growthCm = Math.floor(Math.random() * 3) + 3;
    } else if (roll < 90) {
      // Good Growth — 15%: 6–9 CM
      growthCm = Math.floor(Math.random() * 4) + 6;
    } else {
      // Growth Spurt — 10%: 10–15 CM
      growthCm = Math.floor(Math.random() * 6) + 10;
      isGrowthSpurt = true;
    }
  } else {
    // Post Growth Spurt probabilities
    const roll = Math.random() * 100;
    if (roll < 70) {
      // Small Growth — 70%: 1–2 CM
      growthCm = Math.floor(Math.random() * 2) + 1;
    } else if (roll < 95) {
      // Regular Growth — 25%: 3–4 CM
      growthCm = Math.floor(Math.random() * 2) + 3;
    } else {
      // Minor Growth — 5%: 5 CM
      growthCm = 5;
    }
  }

  const newHeight = currentHeight + growthCm;
  const newWeight = currentWeight + growthCm; // 1 CM = 1 KG
  const nowHasHadGrowthSpurt = hasHadGrowthSpurt || isGrowthSpurt;

  const updatedPlayer: PlayerCardData = {
    ...player,
    heightCm: newHeight,
    weightKg: newWeight,
    hasHadGrowthSpurt: nowHasHadGrowthSpurt,
    lastYearGrowthCm: growthCm,
    lastYearWasGrowthSpurt: isGrowthSpurt,
    growthSpurtPenaltyMonthsRemaining: isGrowthSpurt ? 1 : player.growthSpurtPenaltyMonthsRemaining,
    growthSpurtPenaltyActive: isGrowthSpurt ? true : player.growthSpurtPenaltyActive,
  };

  return {
    oldHeight: currentHeight,
    oldWeight: currentWeight,
    newHeight,
    newWeight,
    growthCm,
    growthKg: growthCm,
    isGrowthSpurt,
    hasHadGrowthSpurt: nowHasHadGrowthSpurt,
    updatedPlayer,
  };
}
