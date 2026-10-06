import { PlayerCardData, OutfieldDetailedStats, GkDetailedStats } from '../types';
import {
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
} from './statCalculations';
import {
  getBadFameDrawChancePercent,
  getRandomBadFameCard,
  DEFAULT_COLLECTED_CARDS,
} from './cardsCollectionSystem';
import { applyMonthlyChemistryGrowth, getChemistryInfo } from './chemistrySystem';
import { calculateAnnualPhysicalGrowth } from './playerGrowthSystem';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { applyClubDevelopmentPointsToPlayer } from './clubDevelopmentEngine';
import { calculateModifiedBadReputationGain } from './perksSystem';
import {
  getDevelopmentStageForAge,
  getFootballSchoolForClub,
  getFootballSchoolById,
  mapPositionToCategory,
  DEVELOPMENT_STAGES,
} from '../data/youthFootballSchools';
import {
  FootballSchoolPhilosophy,
  AcademySeasonApplicationResult,
  DevelopmentStageInfo,
} from '../types/youthFootballSchools';
import { applyStatPointInvestment } from './statProgressionSystem';
import { isStatWeaknessForPlayerType } from '../data/playerTypes';

export type StreetLearnedMessage =
  | 'YOU LEARNED NOTHING'
  | 'YOU LEARNED A FEW THINGS'
  | 'YOU LEARNED A LOT'
  | 'You learned nothing.'
  | 'You learned a few things.'
  | 'You learned a lot.'
  | string;

export interface StreetDevelopmentResult {
  points: number;
  message: StreetLearnedMessage;
  tier: 'low' | 'medium' | 'high';
  age: number;
}

export interface ProCareerDevelopmentResult {
  points: number;
  isRandom: boolean;
  age: number;
  message?: string;
  tier?: 'low' | 'medium' | 'high';
  stage?: DevelopmentStageInfo;
}

export type DevelopmentRollResult =
  | ({ isPro: true } & ProCareerDevelopmentResult)
  | ({ isPro: false } & StreetDevelopmentResult);

/**
 * STREET FOOTBALL — RANDOM DEVELOPMENT (1–90 STAT POINTS)
 * Each time the player chooses "PLAY ON THE STREETS":
 * - Roll category with exact probability:
 *   - 40% Chance: 1–14 Stat Points ("YOU LEARNED NOTHING" — low development)
 *   - 30% Chance: 15–30 Stat Points ("YOU LEARNED A FEW THINGS" — moderate progress)
 *   - 30% Chance: 31–90 Stat Points ("YOU LEARNED A LOT" — exceptional development)
 * - Stat points are randomly generated inside the selected category.
 * - Every street session rolls again independently.
 */
export function rollStreetFootballDevelopment(age: number = 10): StreetDevelopmentResult {
  const roll = Math.random();
  let points: number;
  let message: StreetLearnedMessage;
  let tier: 'low' | 'medium' | 'high';

  // After age 16, stat points gained from playing on the streets are heavily reduced
  if (age > 16) {
    if (roll < 0.45) {
      // 45% Chance — 1 to 2 Stat Points
      points = Math.floor(Math.random() * 2) + 1; // 1..2
      message = 'YOU LEARNED NOTHING';
      tier = 'low';
    } else if (roll < 0.80) {
      // 35% Chance — 3 to 5 Stat Points
      points = Math.floor(Math.random() * 3) + 3; // 3..5
      message = 'YOU LEARNED A FEW THINGS';
      tier = 'medium';
    } else {
      // 20% Chance — 6 to 8 Stat Points max
      points = Math.floor(Math.random() * 3) + 6; // 6..8
      message = 'YOU LEARNED A LOT';
      tier = 'high';
    }
  } else {
    if (roll < 0.40) {
      // 40% Chance — 1 to 14 Stat Points
      points = Math.floor(Math.random() * (14 - 1 + 1)) + 1; // 1..14
      message = 'YOU LEARNED NOTHING';
      tier = 'low';
    } else if (roll < 0.70) {
      // 30% Chance — 15 to 30 Stat Points
      points = Math.floor(Math.random() * (30 - 15 + 1)) + 15; // 15..30
      message = 'YOU LEARNED A FEW THINGS';
      tier = 'medium';
    } else {
      // 30% Chance — 31 to 90 Stat Points
      points = Math.floor(Math.random() * (90 - 31 + 1)) + 31; // 31..90
      message = 'YOU LEARNED A LOT';
      tier = 'high';
    }
  }

  return { points, message, tier, age };
}

/**
 * CAREER DEVELOPMENT POINTS BY STAGE
 * Development points received by the player to personally distribute:
 * - Ages 10–19 — Teenage Development: 15 player-controlled Stat Points per year
 * - Ages 20–27 — Mature Development: 5 player-controlled Stat Points per year
 * - Ages 28–32 — Peak Years: 0 player-controlled Stat Points
 * - Age 33+ — Declining Years: -3 Physical Stat Points per year
 */
export function getProCareerSeasonDevelopmentPoints(age: number): ProCareerDevelopmentResult {
  const stage = getDevelopmentStageForAge(age);
  if (age <= 19) {
    return {
      points: 15,
      isRandom: false,
      age,
      stage,
      message: 'Teenage Development (+15 Player PTS)',
      tier: 'high',
    };
  } else if (age <= 27) {
    return {
      points: 5,
      isRandom: false,
      age,
      stage,
      message: 'Mature Development (+5 Player PTS)',
      tier: 'medium',
    };
  } else if (age <= 32) {
    return {
      points: 0,
      isRandom: false,
      age,
      stage,
      message: 'Peak Years (0 Player PTS)',
      tier: 'low',
    };
  } else {
    return {
      points: 0,
      isRandom: false,
      age,
      stage,
      message: 'Declining Years (-3 Physical PTS)',
      tier: 'low',
    };
  }
}

/**
 * Calculates annual player development points according to development stages.
 * - Youth League Player: Personal Development (+15 PTS) + Youth Team Development
 * - Pro Player: Personal Development according to age stage
 * - Street Player: Purely random Street Development (1–90 Stat Points)
 */
export function calculateAnnualDevelopmentPoints(
  player: PlayerCardData,
  targetAge?: number
): DevelopmentRollResult {
  const isPro = isProfessionalPlayer(player);
  const isYouth = Boolean(
    player.youthLeagueTeam ||
    player.isYouthCareerActive ||
    (player.club && player.club !== 'Free Agent' && player.league !== 'Street Football')
  );
  const age = targetAge !== undefined ? targetAge : (player.age || 10);

  if (isPro || isYouth) {
    const proResult = getProCareerSeasonDevelopmentPoints(age);
    return {
      isPro: true,
      ...proResult,
    };
  } else {
    // Pure Street Football: Independent random roll (1-90 Stat Points)
    const streetResult = rollStreetFootballDevelopment(age);
    return {
      isPro: false,
      ...streetResult,
    };
  }
}

/**
 * Applies Academy / Club Youth Development Points (+5 to +30 based on Club Development Tier)
 * to player stats based on Position → Sub-Position → Playstyle hierarchy and Club Philosophy,
 * with full 99 stat overflow redirection.
 */
export function applyAcademySeasonDevelopmentPoints(
  player: PlayerCardData,
  explicitSchoolId?: string
): { updatedPlayer: PlayerCardData; result: AcademySeasonApplicationResult } {
  const clubRes = applyClubDevelopmentPointsToPlayer(player);
  const result: AcademySeasonApplicationResult = {
    applied: clubRes.result.applied,
    school: clubRes.result.philosophy,
    positionCategory: clubRes.result.positionCategory,
    totalPoints: clubRes.result.totalPoints,
    allocatedStats: clubRes.result.allocatedStats,
    logs: clubRes.result.logs,
  };

  return {
    updatedPlayer: clubRes.updatedPlayer,
    result,
  };
}

export interface PhysicalRegressionResult {
  hasRegressed: boolean;
  lossPerStat: number;
  declinedStats: Array<{
    statKey: string;
    label: string;
    oldVal: number;
    newVal: number;
    delta: number;
  }>;
  logs: string[];
}

/**
 * Applies natural physical regression for players aged 33 and above:
 * Starting at age 33 onward until retirement, the player loses -3 in ALL physical attributes
 * (Pace, Stamina, and Strength) every preseason year.
 * If the player has the World-Class Football Performance Center upgrade, decay is mitigated (-2 instead of -3).
 */
export function applyAgePhysicalRegression(
  player: PlayerCardData,
  age: number,
  hasPerformanceCenter: boolean = false
): { updatedPlayer: PlayerCardData; regression: PhysicalRegressionResult } {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const declinedStats: PhysicalRegressionResult['declinedStats'] = [];
  const logs: string[] = [];

  if (age < 33) {
    return {
      updatedPlayer: updated,
      regression: {
        hasRegressed: false,
        lossPerStat: 0,
        declinedStats: [],
        logs: [],
      },
    };
  }

  const lossPerStat = hasPerformanceCenter ? 2 : 3;
  const isGk = (updated.subPosition || updated.position || '').toUpperCase() === 'GK';
  const brokenMap = updated.statBreakStats || {};

  if (isGk) {
    const gk = getOrCreateGkDetailed(updated.stats);
    const oldReflexes = gk.reflexes || 50;
    const oldAerial = gk.aerialReach || 50;
    const oldSaving = gk.saving || 50;

    gk.reflexes = Math.max(15, oldReflexes - lossPerStat);
    gk.aerialReach = Math.max(15, oldAerial - lossPerStat);
    gk.saving = Math.max(15, oldSaving - lossPerStat);

    declinedStats.push(
      { statKey: 'reflexes', label: 'Reflexes', oldVal: oldReflexes, newVal: gk.reflexes, delta: -lossPerStat },
      { statKey: 'aerialReach', label: 'Aerial Reach', oldVal: oldAerial, newVal: gk.aerialReach, delta: -lossPerStat },
      { statKey: 'saving', label: 'Saving Agility', oldVal: oldSaving, newVal: gk.saving, delta: -lossPerStat }
    );

    if (updated.stats?.detailed) {
      const d = updated.stats.detailed;
      if (!brokenMap['pace'] && (d.pace || 50) < 100) d.pace = Math.max(15, (d.pace || 50) - lossPerStat);
      if (!brokenMap['stamina'] && (d.stamina || 50) < 100) d.stamina = Math.max(15, (d.stamina || 50) - lossPerStat);
      if (!brokenMap['strength'] && (d.strength || 50) < 100) d.strength = Math.max(15, (d.strength || 50) - lossPerStat);
    }

    updated.stats = syncCategoryStatsFromGkDetailed(updated.stats, gk);
  } else {
    const d = getOrCreateOutfieldDetailed(updated.stats);
    const oldPace = d.pace || 50;
    const oldStamina = d.stamina || 50;
    const oldStrength = d.strength || 50;

    // Stat Break Protection: Any stat broken to 100 is permanently immune to decay
    if (!brokenMap['pace'] && oldPace < 100) {
      d.pace = Math.max(15, oldPace - lossPerStat);
      declinedStats.push({ statKey: 'pace', label: 'Pace', oldVal: oldPace, newVal: d.pace, delta: -lossPerStat });
    } else {
      d.pace = 100;
    }

    if (!brokenMap['stamina'] && oldStamina < 100) {
      d.stamina = Math.max(15, oldStamina - lossPerStat);
      declinedStats.push({ statKey: 'stamina', label: 'Stamina', oldVal: oldStamina, newVal: d.stamina, delta: -lossPerStat });
    } else {
      d.stamina = 100;
    }

    if (!brokenMap['strength'] && oldStrength < 100) {
      d.strength = Math.max(15, oldStrength - lossPerStat);
      declinedStats.push({ statKey: 'strength', label: 'Strength', oldVal: oldStrength, newVal: d.strength, delta: -lossPerStat });
    } else {
      d.strength = 100;
    }

    // Reinforce all Stat Broken attributes remain permanently locked at 100
    Object.keys(brokenMap).forEach((k) => {
      if ((d as any)[k] !== undefined) {
        (d as any)[k] = 100;
      }
    });

    updated.stats = syncCategoryStatsFromDetailed(updated.stats, d);
    updated.stats.detailed = d;
  }

  // Recalculate OVR after physical stat regression
  const newOvr = isGk
    ? calculateWeightedOvr('GK', 'GK', updated.stats, updated.playStyle)
    : calculateWeightedOvr(
        updated.position || 'ST',
        updated.subPosition || updated.position || 'ST',
        updated.stats,
        updated.playStyle
      );
  updated.ovr = newOvr;

  const logMessage = `📉 [Age ${age} Physical Regression] -${lossPerStat} Pace, -${lossPerStat} Stamina, -${lossPerStat} Strength applied due to aging.`;
  logs.push(logMessage);

  return {
    updatedPlayer: updated,
    regression: {
      hasRegressed: true,
      lossPerStat,
      declinedStats,
      logs,
    },
  };
}

export type TrainingFocusId = 'physical' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'mental';

export interface TrainingCategoryInfo {
  id: TrainingFocusId;
  name: string;
  iconName: string;
  description: string;
  targetedStats: string[];
  isPhysical: boolean;
}

export const TRAINING_CATEGORIES: TrainingCategoryInfo[] = [
  {
    id: 'physical',
    name: 'Physical & Athletic Maintenance',
    iconName: 'Dumbbell',
    description: 'Focuses on athletic conditioning, pace, stamina, strength, and reflexes.',
    targetedStats: ['Pace', 'Stamina', 'Strength', 'Reflexes', 'Jumping'],
    isPhysical: true,
  },
  {
    id: 'shooting',
    name: 'Shooting & Finishing',
    iconName: 'Target',
    description: 'Enhances goalscoring, heading, long shots, and 1v1 execution.',
    targetedStats: ['Shooting', 'Heading', 'Long Shots', '1v1 Saving'],
    isPhysical: false,
  },
  {
    id: 'passing',
    name: 'Passing & Playmaking',
    iconName: 'GitCommit',
    description: 'Improves short passing, vision, long passing, crossing, and distribution.',
    targetedStats: ['Short Pass', 'Long Pass', 'Crossing', 'Distribution'],
    isPhysical: false,
  },
  {
    id: 'dribbling',
    name: 'Dribbling & Ball Control',
    iconName: 'Footprints',
    description: 'Refines close control, dribbling, ball retention, and handling.',
    targetedStats: ['Ball Control', 'Dribbling', 'Retention', 'Handling'],
    isPhysical: false,
  },
  {
    id: 'defending',
    name: 'Defending & Tackle Timing',
    iconName: 'Shield',
    description: 'Develops defensive awareness, tackling, marking, and interception read.',
    targetedStats: ['Tackling', 'Marking', 'Interceptions', 'Positioning'],
    isPhysical: false,
  },
  {
    id: 'mental',
    name: 'Mental & Tactical Composure',
    iconName: 'Brain',
    description: 'Sharpens offensive positioning, composure under pressure, and reaction speed.',
    targetedStats: ['Positioning', 'Composure', 'Reactions'],
    isPhysical: false,
  },
];

export interface PlayerCareerPhase {
  phase: 'Youth Growth' | 'Physical Peak' | 'Post-Peak Adaptation' | 'Veteran Decline';
  peakAge: number;
  deadlineAge: number;
  isPastPeak: boolean;
  isPastDeadline: boolean;
  isPermanentlyCapped: boolean;
  declineRatePerYear: number;
  description: string;
}

/**
  Checks if player is goalkeeper
 */
export function isGoalkeeperPlayer(player: PlayerCardData): boolean {
  const pos = (player.subPosition || player.position || '').toUpperCase();
  return pos === 'GK';
}

/**
  Gets peak age and cap deadline for a player based on position
 */
export function getPlayerPeakInfo(player: PlayerCardData) {
  const isGk = isGoalkeeperPlayer(player);
  const peakAge = isGk ? 31 : 28;
  const deadlineAge = isGk ? 32 : 29;
  return { isGk, peakAge, deadlineAge };
}

/**
  Calculates career phase and potential status
 */
export function getPlayerCareerPhase(player: PlayerCardData): PlayerCareerPhase {
  const { isGk, peakAge, deadlineAge } = getPlayerPeakInfo(player);
  const age = player.age || 20;
  const ovr = player.ovr || 50;
  const potential = player.potentialOvr ?? Math.max(ovr + 5, 80);

  const isPastPeak = age > peakAge;
  const isPastDeadline = age >= deadlineAge;
  const isPermanentlyCapped = isPastDeadline && (ovr >= potential || potential <= ovr);

  let phase: PlayerCareerPhase['phase'] = 'Youth Growth';
  let description = '';
  let declineRatePerYear = 0;

  if (age < peakAge) {
    phase = 'Youth Growth';
    description = `Promising development era. Full physical & technical attribute growth unlocked until age ${peakAge}.`;
  } else if (age === peakAge) {
    phase = 'Physical Peak';
    description = `Peak physical & athletic prime (${isGk ? 'Goalkeeper' : 'Outfield'} peak age ${peakAge}). Maximum natural athletic power.`;
  } else if (age <= 35) {
    phase = 'Post-Peak Adaptation';
    declineRatePerYear = 1;
    description = `Post-peak career era. Athletic attributes naturally decline (-1 pt/yr) unless Physical Maintenance is trained. Technical stats can still grow.`;
  } else {
    phase = 'Veteran Decline';
    declineRatePerYear = 2.5; // -2 to -3
    description = `Veteran era (Age 35+). Physical decline accelerates (-2 to -3 pts/yr without maintenance). Tactically experienced master.`;
  }

  return {
    phase,
    peakAge,
    deadlineAge,
    isPastPeak,
    isPastDeadline,
    isPermanentlyCapped,
    declineRatePerYear,
    description,
  };
}

export interface AttributeChange {
  statKey: string;
  label: string;
  oldVal: number;
  newVal: number;
  delta: number;
  type: 'growth' | 'decline' | 'maintained';
}

export interface SeasonSimulationResult {
  updatedPlayer: PlayerCardData;
  oldAge: number;
  newAge: number;
  oldOvr: number;
  newOvr: number;
  oldPotential: number;
  newPotential: number;
  focusCategory: TrainingCategoryInfo;
  phaseInfo: PlayerCareerPhase;
  changes: AttributeChange[];
  cappedAtDeadline: boolean;
  logs: string[];
  growthCm?: number;
  isGrowthSpurt?: boolean;
  oldHeight?: number;
  newHeight?: number;
  oldWeight?: number;
  newWeight?: number;
  statPointsAwarded?: number;
  developmentResult?: DevelopmentRollResult;
}

/**
  Simulates 1 Preseason Year with Training Focus & Aging Rules
 */
export function simulatePreseasonTraining(
  player: PlayerCardData,
  focusId: TrainingFocusId
): SeasonSimulationResult {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  const { isGk, peakAge, deadlineAge } = getPlayerPeakInfo(copy);

  const oldAge = copy.age || 20;
  const newAge = oldAge + 1;
  copy.age = newAge;

  // Execute Annual Physical Growth Roll (ages 10 to 18)
  const physicalGrowth = calculateAnnualPhysicalGrowth(copy);
  copy.heightCm = physicalGrowth.newHeight;
  copy.weightKg = physicalGrowth.newWeight;
  copy.hasHadGrowthSpurt = physicalGrowth.hasHadGrowthSpurt;
  copy.lastYearGrowthCm = physicalGrowth.growthCm;
  copy.lastYearWasGrowthSpurt = physicalGrowth.isGrowthSpurt;

  // Apply Player Development Rebalance for New Season
  const devResult = calculateAnnualDevelopmentPoints(copy, newAge);
  const currentPoints = copy.freeStatPoints !== undefined ? copy.freeStatPoints : (copy.unassignedPoints !== undefined ? copy.unassignedPoints : 0);
  const updatedPoints = currentPoints + devResult.points;
  copy.freeStatPoints = updatedPoints;
  copy.unassignedPoints = updatedPoints;

  const oldOvr = copy.ovr || 50;
  let currentPot = copy.potentialOvr ?? Math.max(oldOvr + 5, 80);
  const oldPotential = currentPot;

  const logs: string[] = [];
  const changes: AttributeChange[] = [];

  if (devResult.isPro) {
    logs.push(
      `⭐ Professional Development (Age ${newAge}): +${devResult.points} Stat Points awarded for the new season (Total available: ${updatedPoints}).`
    );
  } else {
    logs.push(
      `⚽ Street Football Development (Age ${newAge}): Rolled +${devResult.points} Stat Points. "${devResult.message}" (Total available: ${updatedPoints}).`
    );
  }

  if (physicalGrowth.growthCm > 0) {
    logs.push(
      `🌱 Physical Growth (Age ${oldAge} → ${newAge}): Height ${physicalGrowth.newHeight} CM (+${physicalGrowth.growthCm} CM), Weight ${physicalGrowth.newWeight} KG (+${physicalGrowth.growthKg} KG) ${physicalGrowth.isGrowthSpurt ? '⚡ GROWTH SPURT!' : ''}`
    );
  }

  // Check Potential Cap Deadline Lock
  let cappedAtDeadline = false;
  if (newAge >= deadlineAge) {
    if (oldOvr < currentPot) {
      currentPot = oldOvr; // Permanent cap lock to current OVR
      copy.potentialOvr = currentPot;
      cappedAtDeadline = true;
      logs.push(
        `🔒 Age Limit Reached (Age ${newAge} >= ${deadlineAge}): Potential cap permanently set to current Overall (${oldOvr}). No further Overall growth possible.`
      );
    } else {
      currentPot = Math.min(currentPot, oldOvr);
      copy.potentialOvr = currentPot;
    }
  }

  const focusCategory = TRAINING_CATEGORIES.find((c) => c.id === focusId) || TRAINING_CATEGORIES[0];
  const isPostPeak = newAge > peakAge;
  const canGrowOvr = oldOvr < currentPot;

  // Roll for Bad Fame Card based on Bad Reputation (Chance = badReputation * 0.1%)
  const currentBadRep = copy.badReputation ?? 1;
  const drawChancePercent = getBadFameDrawChancePercent(currentBadRep);
  const badFameRoll = Math.random() * 100;
  if (badFameRoll < drawChancePercent) {
    const drawnCard = getRandomBadFameCard(newAge);
    const existingCards = copy.collectedCards && copy.collectedCards.length > 0 ? copy.collectedCards : DEFAULT_COLLECTED_CARDS;
    copy.collectedCards = [...existingCards, drawnCard];
    const badRepGain = calculateModifiedBadReputationGain(copy, 10);
    copy.badReputation = Math.min(200, currentBadRep + badRepGain);
    logs.push(
      `🔥 PRESEASON BAD FAME CARD DRAWN (${drawChancePercent}% chance at Bad Rep ${currentBadRep}): Received "${drawnCard.name}". Bad Reputation increased to ${copy.badReputation}.`
    );
  } else {
    logs.push(
      `🛡️ Preseason Reputation Check (${drawChancePercent}% Bad Fame card draw chance at Bad Rep ${currentBadRep}): No Bad Fame event.`
    );
  }

  // Apply Passive Chemistry Growth (+10 per month, or +5 if halved, capped at 100 or ceiling)
  const currentChem = copy.chemistry ?? 50;
  const { newChemistry, gained, newCeilingMonths, activeCeiling, newHalvedGainMonths, newChemistryCaps } = applyMonthlyChemistryGrowth(
    currentChem,
    copy.chemistryCeiling,
    copy.chemistryCeilingMonthsRemaining,
    copy.chemistryGainHalvedMonthsRemaining,
    copy.chemistryCaps
  );
  copy.chemistry = newChemistry;
  copy.chemistryCeiling = activeCeiling;
  copy.chemistryCeilingMonthsRemaining = newCeilingMonths;
  copy.chemistryCaps = newChemistryCaps;
  if (!activeCeiling) copy.chemistryCeilingReason = undefined;
  copy.chemistryGainHalvedMonthsRemaining = newHalvedGainMonths;

  const chemInfo = getChemistryInfo(
    newChemistry,
    copy.chemistryCeiling,
    copy.chemistryCeilingMonthsRemaining,
    copy.chemistryCeilingReason,
    copy.chemistryGainHalvedMonthsRemaining
  );
  if (gained > 0) {
    logs.push(
      `🤝 Team Chemistry Passive Growth: +${gained} Chemistry (${newChemistry}/100). Status: ${chemInfo.statusLabel} (${chemInfo.penaltyPercent}% Attribute Penalty).`
    );
  }

  if (isGk) {
    const gkDetailed = getOrCreateGkDetailed(copy.stats);

    // Apply Focus Training
    if (!isPostPeak) {
      // PRE-PEAK TRAINING: +1 to category stats if under potential cap
      if (canGrowOvr) {
        if (focusId === 'physical') {
          gkDetailed.reflexes = Math.min(99, gkDetailed.reflexes + 1);
          gkDetailed.aerialReach = Math.min(99, gkDetailed.aerialReach + 1);
          logs.push('⚡ Pre-Peak Physical Training: +1 Reflexes, +1 Aerial Reach.');
        } else if (focusId === 'shooting') {
          gkDetailed.saving = Math.min(99, gkDetailed.saving + 1);
          gkDetailed.oneOnOne = Math.min(99, gkDetailed.oneOnOne + 1);
          logs.push('🎯 Goal Defense Focus: +1 Saving, +1 1v1.');
        } else if (focusId === 'passing') {
          gkDetailed.distribution = Math.min(99, gkDetailed.distribution + 1);
          logs.push('🎯 Distribution Focus: +1 Distribution.');
        } else if (focusId === 'dribbling') {
          gkDetailed.handling = Math.min(99, gkDetailed.handling + 1);
          logs.push('🧤 Handling Focus: +1 Handling.');
        } else if (focusId === 'defending') {
          gkDetailed.positioning = Math.min(99, gkDetailed.positioning + 1);
          logs.push('🛡️ Goalkeeper Positioning Focus: +1 Positioning.');
        } else if (focusId === 'mental') {
          gkDetailed.reflexes = Math.min(99, gkDetailed.reflexes + 1);
          logs.push('🧠 Goalkeeper Mental Focus: +1 Reflexes.');
        }
      } else {
        logs.push('⚠️ Potential Cap Reached: Training maintained skill set without Overall growth.');
      }
    } else {
      // POST-PEAK TRAINING (Age > 31 for GK)
      if (focusId === 'physical') {
        // Physical Maintenance Focus
        logs.push('🛡️ Physical Maintenance Focus: Preserved goalkeeper reflexes & athletic reach. Physical decline negated.');
      } else {
        // Technical / Mental Focus
        if (canGrowOvr) {
          if (focusId === 'shooting') {
            gkDetailed.saving = Math.min(99, gkDetailed.saving + 1);
            gkDetailed.oneOnOne = Math.min(99, gkDetailed.oneOnOne + 1);
          } else if (focusId === 'passing') {
            gkDetailed.distribution = Math.min(99, gkDetailed.distribution + 1);
          } else if (focusId === 'dribbling') {
            gkDetailed.handling = Math.min(99, gkDetailed.handling + 1);
          } else if (focusId === 'defending') {
            gkDetailed.positioning = Math.min(99, gkDetailed.positioning + 1);
          }
          logs.push(`🧠 Post-Peak Focus (${focusCategory.name}): Technical skill improved +1.`);
        }

        // Apply Physical Decline for GK (Reflexes)
        const declineAmount = newAge > 35 ? Math.floor(Math.random() * 2) + 2 : 1; // -2 to -3 if age > 35 else -1
        const oldReflexes = gkDetailed.reflexes;
        gkDetailed.reflexes = Math.max(10, gkDetailed.reflexes - declineAmount);

        changes.push({
          statKey: 'reflexes',
          label: 'Reflexes',
          oldVal: oldReflexes,
          newVal: gkDetailed.reflexes,
          delta: gkDetailed.reflexes - oldReflexes,
          type: 'decline',
        });
        logs.push(`📉 Post-Peak Physical Decline: Reflexes declined by -${declineAmount} (Age ${newAge}).`);
      }
    }

    copy.stats = syncCategoryStatsFromGkDetailed(copy.stats, gkDetailed);

  } else {
    // OUTFIELD PLAYER
    const d = getOrCreateOutfieldDetailed(copy.stats);

    if (!isPostPeak) {
      // PRE-PEAK TRAINING (Age <= 28)
      if (canGrowOvr) {
        if (focusId === 'physical') {
          d.pace = Math.min(99, d.pace + 1);
          d.stamina = Math.min(99, d.stamina + 1);
          d.strength = Math.min(99, d.strength + 1);
          logs.push('⚡ Pre-Peak Physical Focus: +1 Pace, +1 Stamina, +1 Strength.');
        } else if (focusId === 'shooting') {
          d.shooting = Math.min(99, d.shooting + 1);
          d.heading = Math.min(99, d.heading + 1);
          d.longShots = Math.min(99, d.longShots + 1);
          logs.push('🎯 Shooting Focus: +1 Shooting, +1 Heading, +1 Long Shots.');
        } else if (focusId === 'passing') {
          d.shortPass = Math.min(99, d.shortPass + 1);
          d.longPass = Math.min(99, d.longPass + 1);
          d.crossing = Math.min(99, d.crossing + 1);
          logs.push('🎯 Passing Focus: +1 Short Pass, +1 Long Pass, +1 Crossing.');
        } else if (focusId === 'dribbling') {
          d.ballControl = Math.min(99, d.ballControl + 1);
          d.dribbling = Math.min(99, d.dribbling + 1);
          d.retention = Math.min(99, d.retention + 1);
          logs.push('⚽ Dribbling Focus: +1 Ball Control, +1 Dribbling, +1 Retention.');
        } else if (focusId === 'defending') {
          d.tackling = Math.min(99, d.tackling + 1);
          d.marking = Math.min(99, d.marking + 1);
          d.interceptions = Math.min(99, d.interceptions + 1);
          logs.push('🛡️ Defending Focus: +1 Tackling, +1 Marking, +1 Interceptions.');
        } else if (focusId === 'mental') {
          d.positioning = Math.min(99, d.positioning + 1);
          d.composure = Math.min(99, d.composure + 1);
          d.reactions = Math.min(99, d.reactions + 1);
          logs.push('🧠 Mental Focus: +1 Positioning, +1 Composure, +1 Reactions.');
        }
      } else {
        logs.push('⚠️ Potential Cap Reached: Training maintained attributes at maximum potential.');
      }
    } else {
      // POST-PEAK ERA (Age > 28)
      if (focusId === 'physical') {
        // Physical Maintenance Focus
        logs.push(
          '🏋️ Physical Maintenance Focus: Preserved Pace, Sprint Speed, Strength & Stamina. Athletic decline successfully buffered.'
        );
      } else {
        // Development Focus (Technical or Mental)
        if (canGrowOvr) {
          if (focusId === 'shooting') {
            d.shooting = Math.min(99, d.shooting + 1);
            d.heading = Math.min(99, d.heading + 1);
            d.longShots = Math.min(99, d.longShots + 1);
          } else if (focusId === 'passing') {
            d.shortPass = Math.min(99, d.shortPass + 1);
            d.longPass = Math.min(99, d.longPass + 1);
            d.crossing = Math.min(99, d.crossing + 1);
          } else if (focusId === 'dribbling') {
            d.ballControl = Math.min(99, d.ballControl + 1);
            d.dribbling = Math.min(99, d.dribbling + 1);
            d.retention = Math.min(99, d.retention + 1);
          } else if (focusId === 'defending') {
            d.tackling = Math.min(99, d.tackling + 1);
            d.marking = Math.min(99, d.marking + 1);
            d.interceptions = Math.min(99, d.interceptions + 1);
          } else if (focusId === 'mental') {
            d.positioning = Math.min(99, d.positioning + 1);
            d.composure = Math.min(99, d.composure + 1);
            d.reactions = Math.min(99, d.reactions + 1);
          }
          logs.push(`🧠 Post-Peak Technical Focus (${focusCategory.name}): Developed technical stats by +1.`);
        }

        // Natural Physical Attribute Decline (Starting at age 33+, -3 to Pace, Stamina, and Strength)
        const declineAmount = newAge >= 33 ? 3 : 1;
        const brokenMap = copy.statBreakStats || {};
        const oldPace = d.pace;
        const oldStamina = d.stamina;
        const oldStrength = d.strength;

        if (!brokenMap['pace'] && oldPace < 100) {
          d.pace = Math.max(15, oldPace - declineAmount);
          changes.push({
            statKey: 'pace',
            label: 'Pace',
            oldVal: oldPace,
            newVal: d.pace,
            delta: d.pace - oldPace,
            type: 'decline',
          });
        } else {
          d.pace = 100;
        }

        if (!brokenMap['stamina'] && oldStamina < 100) {
          d.stamina = Math.max(15, oldStamina - declineAmount);
          changes.push({
            statKey: 'stamina',
            label: 'Stamina',
            oldVal: oldStamina,
            newVal: d.stamina,
            delta: d.stamina - oldStamina,
            type: 'decline',
          });
        } else {
          d.stamina = 100;
        }

        if (!brokenMap['strength'] && oldStrength < 100) {
          d.strength = Math.max(15, oldStrength - declineAmount);
          changes.push({
            statKey: 'strength',
            label: 'Strength',
            oldVal: oldStrength,
            newVal: d.strength,
            delta: d.strength - oldStrength,
            type: 'decline',
          });
        } else {
          d.strength = 100;
        }

        // Permanently preserve all broken stats at 100
        Object.keys(brokenMap).forEach((k) => {
          if ((d as any)[k] !== undefined) {
            (d as any)[k] = 100;
          }
        });

        logs.push(
          `📉 Physical Attribute Decline (Age ${newAge}): Pace -${oldPace - d.pace}, Stamina -${oldStamina - d.stamina}, Strength -${oldStrength - d.strength}.`
        );
      }
    }

    copy.stats = syncCategoryStatsFromDetailed(copy.stats, d);
  }

  // Recalculate Weighted OVR
  let rawNewOvr = calculateWeightedOvr(
    copy.position || 'ST',
    copy.subPosition || copy.position || 'ST',
    copy.stats,
    copy.playStyle
  );

  // Handle Overconfidence Drop Penalty for Next Season
  if (copy.overconfidenceDropPending) {
    copy.overconfidenceDropPending = false;
    rawNewOvr = Math.min(currentPot, Math.max(40, oldOvr - 1));
    logs.push(
      `📉 Overconfidence Trap Penalty: As predicted after reaching potential early, complacency caused your Overall to drop by -1 to match your new Potential ceiling (${currentPot}).`
    );
  } else if (rawNewOvr > currentPot) {
    // Enforce Standard Potential Cap Limits
    rawNewOvr = currentPot;
  }

  copy.ovr = rawNewOvr;
  copy.potentialOvr = currentPot;

  const phaseInfo = getPlayerCareerPhase(copy);

  return {
    updatedPlayer: copy,
    oldAge,
    newAge,
    oldOvr,
    newOvr: copy.ovr,
    oldPotential,
    newPotential: copy.potentialOvr,
    focusCategory,
    phaseInfo,
    changes,
    cappedAtDeadline,
    logs,
    growthCm: physicalGrowth.growthCm,
    isGrowthSpurt: physicalGrowth.isGrowthSpurt,
    oldHeight: physicalGrowth.oldHeight,
    newHeight: physicalGrowth.newHeight,
    oldWeight: physicalGrowth.oldWeight,
    newWeight: physicalGrowth.newWeight,
    statPointsAwarded: devResult.points,
    developmentResult: devResult,
  };
}

/**
 * Simulates Midseason Review (Midseason Bad Fame Card Check)
 * Rolls for Bad Fame Card based on Bad Reputation (Chance = badReputation * 0.1%)
 */
export function simulateMidseasonReview(
  player: PlayerCardData
): SeasonSimulationResult {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  const oldAge = copy.age || 20;
  const oldOvr = copy.ovr || 50;
  const oldPotential = copy.potentialOvr ?? Math.max(oldOvr + 5, 80);
  const logs: string[] = [];

  const currentBadRep = copy.badReputation ?? 1;
  const drawChancePercent = getBadFameDrawChancePercent(currentBadRep);
  const badFameRoll = Math.random() * 100;

  if (badFameRoll < drawChancePercent) {
    const drawnCard = getRandomBadFameCard(oldAge);
    const existingCards =
      copy.collectedCards && copy.collectedCards.length > 0 ? copy.collectedCards : DEFAULT_COLLECTED_CARDS;
    copy.collectedCards = [...existingCards, drawnCard];
    const badRepGain = calculateModifiedBadReputationGain(copy, 10);
    copy.badReputation = Math.min(200, currentBadRep + badRepGain);
    logs.push(
      `🔥 MIDSEASON BAD FAME CARD DRAWN (${drawChancePercent}% chance at Bad Rep ${currentBadRep}): Received "${drawnCard.name}". Bad Reputation increased to ${copy.badReputation}.`
    );
  } else {
    logs.push(
      `✅ Midseason Review (${drawChancePercent}% Bad Fame card draw chance at Bad Rep ${currentBadRep}): No Bad Fame event.`
    );
  }

  // Apply Passive Chemistry Growth
  const currentChem = copy.chemistry ?? 50;
  const { newChemistry, gained, newCeilingMonths, activeCeiling, newHalvedGainMonths, newChemistryCaps } = applyMonthlyChemistryGrowth(
    currentChem,
    copy.chemistryCeiling,
    copy.chemistryCeilingMonthsRemaining,
    copy.chemistryGainHalvedMonthsRemaining,
    copy.chemistryCaps
  );
  copy.chemistry = newChemistry;
  copy.chemistryCeiling = activeCeiling;
  copy.chemistryCeilingMonthsRemaining = newCeilingMonths;
  copy.chemistryCaps = newChemistryCaps;
  if (!activeCeiling) copy.chemistryCeilingReason = undefined;
  copy.chemistryGainHalvedMonthsRemaining = newHalvedGainMonths;

  const chemInfo = getChemistryInfo(
    newChemistry,
    copy.chemistryCeiling,
    copy.chemistryCeilingMonthsRemaining,
    copy.chemistryCeilingReason,
    copy.chemistryGainHalvedMonthsRemaining
  );
  if (gained > 0) {
    logs.push(
      `🤝 Midseason Team Chemistry: +${gained} Chemistry (${newChemistry}/100). Status: ${chemInfo.statusLabel}.`
    );
  }

  const focusCategory = TRAINING_CATEGORIES[0];
  const phaseInfo = getPlayerCareerPhase(copy);

  return {
    updatedPlayer: copy,
    oldAge,
    newAge: oldAge,
    oldOvr,
    newOvr: copy.ovr,
    oldPotential,
    newPotential: copy.potentialOvr,
    focusCategory,
    phaseInfo,
    changes: [],
    cappedAtDeadline: false,
    logs,
  };
}

/**
 * Gets transition age for development / training progress:
 * Outfield players = 28
 * Goalkeepers = 31
 */
export function getTrainingTransitionAge(player: PlayerCardData): number {
  return isGoalkeeperPlayer(player) ? 31 : 28;
}

/**
 * Calculates required months to reach 100% Training Progress based on age.
 * Before/at transition age (28 for outfield, 31 for GK): 12 months (1 year).
 * After transition age: adds 1 additional month per year of age above transition age.
 */
export function getMonthsRequiredForTrainingLevel(player: PlayerCardData): number {
  const age = player.age || 16;
  const transitionAge = getTrainingTransitionAge(player);
  const extraMonths = Math.max(0, age - transitionAge);
  return 12 + extraMonths;
}

/**
 * Calculates weekly training progress percentage increment.
 */
export function calculateWeeklyTrainingProgressIncrement(player: PlayerCardData): number {
  const months = getMonthsRequiredForTrainingLevel(player);
  const weeks = months * 4;
  return parseFloat((100 / weeks).toFixed(2));
}

/**
 * Checks if the manual Train button is available for the player.
 * Maximum 2 uses per career year: 1 per preseason, 1 per mid-season.
 * Training is unavailable while injured.
 */
export function canUseTrainButton(player: PlayerCardData): {
  canTrain: boolean;
  windowLabel: 'preseason' | 'midseason' | 'none';
  buttonText: string;
  reason: string;
} {
  if (player.isInjured) {
    return {
      canTrain: false,
      windowLabel: 'none',
      buttonText: 'Injured (Training Paused)',
      reason: `Player is injured (${player.injuryName || 'Injury'}). Training unavailable while recovering.`,
    };
  }

  const usedPreseason = !!player.usedPreseasonTrain;
  const usedMidseason = !!player.usedMidseasonTrain;

  if (!usedPreseason) {
    return {
      canTrain: true,
      windowLabel: 'preseason',
      buttonText: '+10% Train (Preseason)',
      reason: 'Preseason manual training available (+10% progress)',
    };
  }

  if (!usedMidseason) {
    return {
      canTrain: true,
      windowLabel: 'midseason',
      buttonText: '+10% Train (Mid-Season)',
      reason: 'Mid-season manual training available (+10% progress)',
    };
  }

  return {
    canTrain: false,
    windowLabel: 'none',
    buttonText: 'Trained (2/2 Used)',
    reason: 'Maximum manual training uses reached for this career year (1 Preseason, 1 Mid-Season)',
  };
}

/**
 * Applies a manual or natural training progress percentage increment.
 * Handles 100% completion (+1 to all attributes pre-transition, or age-decline protection post-transition).
 * While injured: No normal training progress, no +1 stat completion, no additional training bonuses.
 */
export function applyTrainingProgressIncrement(
  player: PlayerCardData,
  increment: number = 10
): {
  updatedPlayer: PlayerCardData;
  completedLevel: boolean;
  isProtected: boolean;
  message: string;
} {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));

  if (copy.isInjured) {
    return {
      updatedPlayer: copy,
      completedLevel: false,
      isProtected: false,
      message: `🚑 Player is currently injured (${copy.injuryName || 'Injury'}, ${copy.injuryWeeksRemaining || 1} wks left). Training progression is paused.`,
    };
  }

  const currentProgress = copy.trainingProgress || 0;
  let nextProgress = currentProgress + increment;
  let completedLevel = false;
  let isProtected = false;
  let message = '';

  const age = copy.age || 16;
  const transitionAge = getTrainingTransitionAge(copy);
  const updatedStats = { ...copy.stats };

  if (nextProgress >= 100) {
    completedLevel = true;
    nextProgress = nextProgress - 100;

    if (age < transitionAge) {
      isProtected = false;
      const isGk = isGoalkeeperPlayer(copy);
      if (isGk) {
        const gkDetailed = getOrCreateGkDetailed(copy.stats);
        const statTrainingProg = { ...(copy.statTrainingProgress || {}) };
        const statBreakStats = { ...(copy.statBreakStats || {}) };
        Object.keys(gkDetailed).forEach((k) => {
          const key = k as keyof typeof gkDetailed;
          if (typeof gkDetailed[key] === 'number') {
            const curVal = gkDetailed[key] || 40;
            const curProg = statTrainingProg[key] || 0;
            const invRes = applyStatPointInvestment(curVal, curProg, 1, false);
            gkDetailed[key] = invRes.newLevel;
            statTrainingProg[key] = invRes.newProgress;
            if (invRes.statBreakTriggered) {
              copy.statBreakActive = true;
              statBreakStats[key] = 100;
            }
          }
        });
        copy.statTrainingProgress = statTrainingProg;
        copy.statBreakStats = statBreakStats;
        copy.stats = syncCategoryStatsFromGkDetailed(copy.stats, gkDetailed);
        copy.ovr = calculateWeightedOvr('GK', 'GK', copy.stats, copy.playStyle);
      } else {
        const d = getOrCreateOutfieldDetailed(copy.stats);
        const statTrainingProg = { ...(copy.statTrainingProgress || {}) };
        const statBreakStats = { ...(copy.statBreakStats || {}) };
        Object.keys(d).forEach((k) => {
          const key = k as keyof typeof d;
          if (typeof d[key] === 'number') {
            const curVal = d[key] || 40;
            const curProg = statTrainingProg[key] || 0;
            const isWeakness = isStatWeaknessForPlayerType(copy.playerTypeId, key);
            const invRes = applyStatPointInvestment(curVal, curProg, 1, isWeakness);
            d[key] = invRes.newLevel;
            statTrainingProg[key] = invRes.newProgress;
            if (invRes.statBreakTriggered) {
              copy.statBreakActive = true;
              statBreakStats[key] = 100;
            }
          }
        });
        copy.statTrainingProgress = statTrainingProg;
        copy.statBreakStats = statBreakStats;
        copy.stats = syncCategoryStatsFromDetailed(copy.stats, d);
        copy.ovr = calculateWeightedOvr(
          copy.position || 'ST',
          copy.subPosition || copy.position || 'ST',
          copy.stats,
          copy.playStyle
        );
      }

      message = `🏋️ Training Level Completed (100%)! +1 Stat Point progression allocated to each attribute!`;
    } else {
      isProtected = true;
      message = `🛡️ Training Level Completed (100%)! Attributes protected against age-related decline (Age ${age}, ${getMonthsRequiredForTrainingLevel(copy)} mo/lvl).`;
    }
  } else {
    message = `🏋️ Training Progress: ${Math.round(nextProgress)}% / 100%`;
  }

  copy.trainingProgress = parseFloat(nextProgress.toFixed(1));

  return {
    updatedPlayer: copy,
    completedLevel,
    isProtected,
    message,
  };
}

/**
 * Resets annual manual Train button limits (called at the start of a new career year).
 */
export function resetAnnualTrainButtonLimits(player: PlayerCardData): PlayerCardData {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  copy.usedPreseasonTrain = false;
  copy.usedMidseasonTrain = false;
  return copy;
}

