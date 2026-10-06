/**
 * STAT PROGRESSION & TRAINING LEVEL SYSTEM
 * 
 * Implements the tiered training level system for player development:
 * - 0 to 20: 1 stat point = 5 levels (rapid foundational growth)
 * - 20 to 30: 1 stat point = 3 levels
 * - 30 to 40: 1 stat point = 2 levels
 * - 40 to 50: 1 stat point = 1.5 levels
 * - 50 to 60: 1 stat point = 1.25 levels
 * - 60 to 70: 1 stat point = 1 level
 * - 70 to 80: 1 stat point = 0.5 levels (2 stat points per level)
 * - 80 to 85: 1 stat point = 0.25 levels (4 stat points per level)
 * - 85 to 90: 1 stat point = 0.15 levels (~6.67 stat points per level)
 * - 90 to 95: 1 stat point = 0.1 levels (10 stat points per level)
 * - 95 to 99: 1 stat point = 0.05 levels (20 stat points per level)
 * - 99 to 100: exactly 100 stat points needed to achieve STAT BREAK (0.01 per point)
 * - 100: Stat Break Immortality Max
 */

import { isStatWeaknessForPlayerType, getPlayerTypeStatRole } from '../data/playerTypes';

export { isStatWeaknessForPlayerType, getPlayerTypeStatRole };

export interface StatTrainingProgressInfo {
  level: number;
  progress: number; // 0 to < 1 (or 1.0 if 100)
  percent: number; // 0 to 100
  levelsPerPoint: number;
  pointsNeededPerLevel: number;
  pointsInvestedInCurrentLevel: number;
  pointsRemainingForNextLevel: number;
  isStatBroken: boolean;
  isAt99StatBreak: boolean;
  isWeakness: boolean;
  summaryLabel: string;
}

/**
 * Returns how many levels 1 stat point yields for a given base level.
 * When isWeakness is true, progression requires 10% more stat points to advance across all tiers.
 */
export function getLevelsPerPoint(level: number, isWeakness = false): number {
  let baseRate = 0;
  if (level < 0) baseRate = 5;
  else if (level < 20) baseRate = 5;
  else if (level < 30) baseRate = 3;
  else if (level < 40) baseRate = 2;
  else if (level < 50) baseRate = 1.5;
  else if (level < 60) baseRate = 1.25;
  else if (level < 70) baseRate = 1;
  else if (level < 80) baseRate = 0.5;
  else if (level < 85) baseRate = 0.25;
  else if (level < 90) baseRate = 0.15;
  else if (level < 95) baseRate = 0.1;
  else if (level < 99) baseRate = 0.05;
  else if (level === 99) baseRate = 0.01; // Exactly 100 stat points needed to break to 100
  else baseRate = 0; // Already 100 or broken

  if (baseRate <= 0) return 0;
  // Weakness requires 10% more points to advance (+10% pointsNeeded = baseRate / 1.10)
  return isWeakness ? baseRate / 1.10 : baseRate;
}

/**
 * Returns how many stat points are required for a complete level at the given level.
 */
export function getPointsPerLevel(level: number, isWeakness = false): number {
  const rate = getLevelsPerPoint(level, isWeakness);
  if (rate <= 0) return 0;
  return 1 / rate;
}

/**
 * Computes full training progress details for display under an attribute.
 */
export function getStatTrainingProgressInfo(
  level: number,
  progress = 0,
  isBroken = false,
  isWeakness = false
): StatTrainingProgressInfo {
  const isStatBroken = isBroken || level >= 100;
  const isAt99StatBreak = level === 99 && !isStatBroken;

  if (isStatBroken) {
    return {
      level: Math.max(100, level),
      progress: 1.0,
      percent: 100,
      levelsPerPoint: 0,
      pointsNeededPerLevel: 0,
      pointsInvestedInCurrentLevel: isWeakness ? 110 : 100,
      pointsRemainingForNextLevel: 0,
      isStatBroken: true,
      isAt99StatBreak: false,
      isWeakness,
      summaryLabel: '⭐ STAT BREAK MAX',
    };
  }

  const clampedProgress = Math.max(0, Math.min(0.9999, progress || 0));
  const levelsPerPt = getLevelsPerPoint(level, isWeakness);
  const totalPtsNeeded = levelsPerPt > 0 ? 1 / levelsPerPt : 1;

  const pointsInvested = Math.round((clampedProgress * totalPtsNeeded) * 100) / 100;
  const pointsRemaining = Math.max(0, Math.round(((1 - clampedProgress) * totalPtsNeeded) * 100) / 100);
  const percent = Math.round(clampedProgress * 100);

  let summaryLabel = '';
  const weaknessTag = isWeakness ? ' [Weakness +10%]' : '';

  if (isAt99StatBreak) {
    const totalTarget = isWeakness ? 110 : 100;
    summaryLabel = `${Math.round(pointsInvested)}/${totalTarget} pts to Stat Break${weaknessTag}`;
  } else if (levelsPerPt >= 1 && !isWeakness) {
    if (levelsPerPt > 1) {
      summaryLabel = `+${levelsPerPt} lvls / pt`;
    } else {
      summaryLabel = `1 pt needed`;
    }
  } else {
    // fractional levels per point or weakness modifier
    if (pointsInvested > 0) {
      const roundedRem = Math.round(pointsRemaining * 10) / 10;
      const roundedInv = Math.round(pointsInvested * 10) / 10;
      const roundedTotal = Math.round(totalPtsNeeded * 10) / 10;
      summaryLabel = `${roundedRem} pt${roundedRem === 1 ? '' : 's'} needed (${roundedInv}/${roundedTotal})${weaknessTag}`;
    } else {
      const roundedTotal = Math.round(totalPtsNeeded * 10) / 10;
      summaryLabel = `${roundedTotal} pt${roundedTotal === 1 ? '' : 's'} needed${weaknessTag}`;
    }
  }

  return {
    level,
    progress: clampedProgress,
    percent,
    levelsPerPoint: levelsPerPt,
    pointsNeededPerLevel: totalPtsNeeded,
    pointsInvestedInCurrentLevel: pointsInvested,
    pointsRemainingForNextLevel: pointsRemaining,
    isStatBroken: false,
    isAt99StatBreak,
    isWeakness,
    summaryLabel,
  };
}

export interface StatInvestmentResult {
  newLevel: number;
  newProgress: number;
  statBreakTriggered: boolean;
  levelsGained: number;
  pointsSpent: number;
}

/**
 * Invests `pointsToAdd` into a stat, advancing levels and fractional progress.
 * Crosses tiers seamlessly.
 */
export function applyStatPointInvestment(
  currentLevel: number,
  currentProgress: number,
  pointsToAdd: number,
  isWeakness = false
): StatInvestmentResult {
  let level = currentLevel;
  let progress = Math.max(0, Math.min(0.9999, currentProgress || 0));
  let remainingPoints = Math.max(0, pointsToAdd);
  const startLevel = level;
  let statBreakTriggered = false;

  if (level >= 100) {
    return {
      newLevel: 100,
      newProgress: 1.0,
      statBreakTriggered: false,
      levelsGained: 0,
      pointsSpent: 0,
    };
  }

  while (remainingPoints > 0.00001 && level < 100) {
    const rate = getLevelsPerPoint(level, isWeakness);
    if (rate <= 0) break;

    // Progress remaining in current level
    const progressNeeded = 1.0 - progress;
    // Points needed to complete current level
    const pointsNeededForLevel = progressNeeded / rate;

    if (remainingPoints >= pointsNeededForLevel - 0.000001) {
      // Completed this level!
      remainingPoints -= pointsNeededForLevel;
      level += 1;
      progress = 0;

      if (level >= 100) {
        level = 100;
        progress = 1.0;
        statBreakTriggered = true;
        break;
      }
    } else {
      // Invest remaining points into current level's progress
      progress += remainingPoints * rate;
      remainingPoints = 0;

      if (progress >= 0.99999) {
        level += 1;
        progress = 0;
        if (level >= 100) {
          level = 100;
          progress = 1.0;
          statBreakTriggered = true;
        }
      }
      break;
    }
  }

  // Precision clamp
  progress = Math.round(progress * 10000) / 10000;
  if (progress >= 1 && level < 100) {
    level += 1;
    progress = 0;
    if (level >= 100) {
      level = 100;
      progress = 1.0;
      statBreakTriggered = true;
    }
  }

  const levelsGained = level - startLevel;
  const pointsSpent = pointsToAdd - remainingPoints;

  return {
    newLevel: level,
    newProgress: progress,
    statBreakTriggered,
    levelsGained,
    pointsSpent: Math.round(pointsSpent * 100) / 100,
  };
}

export interface StatRefundResult {
  newLevel: number;
  newProgress: number;
  refunded: boolean;
}

/**
 * Refunds 1 stat point from a stat, reducing progress and levels if applicable.
 */
export function refundStatPointInvestment(
  currentLevel: number,
  currentProgress: number,
  minLevel = 40,
  isWeakness = false
): StatRefundResult {
  let level = currentLevel;
  let progress = Math.max(0, currentProgress || 0);
  let pointsToRefund = 1.0;

  if (level <= minLevel && progress <= 0.0001) {
    return { newLevel: level, newProgress: progress, refunded: false };
  }

  while (pointsToRefund > 0.00001 && (level > minLevel || (level === minLevel && progress > 0.0001))) {
    const tierLevel = level === 100 ? 99 : level;
    const rate = getLevelsPerPoint(tierLevel, isWeakness);
    if (rate <= 0) break;

    // Points represented by current level's partial progress
    const pointsInCurrentProgress = progress / rate;

    if (pointsToRefund <= pointsInCurrentProgress + 0.00001) {
      progress -= pointsToRefund * rate;
      pointsToRefund = 0;
      break;
    } else {
      pointsToRefund -= pointsInCurrentProgress;
      if (level > minLevel) {
        level -= 1;
        progress = 1.0;
      } else {
        progress = 0;
        break;
      }
    }
  }

  progress = Math.max(0, Math.round(progress * 10000) / 10000);
  return { newLevel: level, newProgress: progress, refunded: true };
}
