import { PlayerConfig, OutfieldDetailedStats } from '../types';
import { getOrCreateOutfieldDetailed, getStatBreakBonus, getEffectiveOutfieldDetailed } from './statCalculations';
import { normalizePositionTaxonomy, getGoalAssistModifiers } from './goalAssistSimulationModifiers';
import { getSkillPerkSimulationMultiplier } from './perksSystem';

export type TacticalGoalChanceType = 'counter' | 'crossing' | 'tap_in' | 'long_shoot' | 'dribbling';

export type TacticalAssistChanceType =
  | 'cross_assist'
  | 'counter_assist'
  | 'tap_in_assist'
  | 'dribble_and_pass_assist'
  | 'very_long_pass_assist';

export type TacticalChanceType = TacticalGoalChanceType | TacticalAssistChanceType;

export interface TacticalChanceResult {
  category: 'goal' | 'assist';
  chanceType: TacticalChanceType;
  chanceTitle: string;
  fellOnWeakFoot: boolean;
  weakFootStars: number;
  weakFootMultiplier: number;
  calculatedSuccessRate: number;
  scored: boolean;
  isDribbleMove: boolean;
  commentary: string;
  statBreakdown: string;
}

/**
 * Checks if the player has the Outside Foot perk active (from the Iconic Trivela Street Card).
 */
export function hasOutsideFootTrait(player?: Partial<PlayerConfig> | null): boolean {
  if (!player) return false;
  if (player.hasOutsideFootPerk) return true;
  if (player.activePerkIds && (player.activePerkIds.includes('outside_foot') || player.activePerkIds.includes('Outside Foot'))) return true;
  if (Array.isArray((player as any).perks) && (player as any).perks.includes('outside_foot')) return true;
  return false;
}

/**
 * Checks if the player has the special Legend perk: Magnetic Feet (2x dribbling success).
 */
export function hasMagneticFeetTrait(player?: Partial<PlayerConfig> | null): boolean {
  if (!player) return false;
  if (player.legendPerk?.name?.toUpperCase() === 'MAGNETIC FEET' || player.legendPerk?.name?.toUpperCase() === 'MAGNETIC BALL') return true;
  if (player.activePerkIds && (player.activePerkIds.includes('magnetic_feet') || player.activePerkIds.includes('Magnetic Feet'))) return true;
  if (Array.isArray((player as any).perks) && (player as any).perks.includes('magnetic_feet')) return true;
  return false;
}

/**
 * Returns the success multiplier based on the player's weak foot star rating (0 to 5).
 * - 5*: 1.00 (0% reduction)
 * - 4*: 0.80 (20% reduction)
 * - 3*: 0.60 (40% reduction)
 * - 2*: 0.40 (60% reduction)
 * - 1*: 0.20 (80% reduction)
 * - 0*: 0.00 (100% reduction)
 */
export function getWeakFootMultiplier(weakFootStars: number = 3): number {
  const stars = Math.max(0, Math.min(5, Math.round(weakFootStars)));
  switch (stars) {
    case 5:
      return 1.0;
    case 4:
      return 0.8;
    case 3:
      return 0.6;
    case 2:
      return 0.4;
    case 1:
      return 0.2;
    case 0:
      return 0.0;
    default:
      return 0.6;
  }
}

/**
 * Derives the tactical style odds of each goal chance type based on team strategy, player playstyle and position:
 * - Possession: mostly tap_in or dribbling
 * - Long Balls: mostly crossing / headers
 * - Catenaccio: mostly long_shoot or counter
 * - Counter Attack: mostly counter with some crossing and long_shoot
 * - Gegenpress: mostly tap_in or counter
 */
export function getTacticalGoalChanceDistribution(
  teamStrategy?: string,
  playStyle?: string,
  detailed?: OutfieldDetailedStats
): Record<TacticalGoalChanceType, number> {
  const style = (teamStrategy || 'possession').toLowerCase().trim();
  const pStyle = (playStyle || '').toLowerCase().trim();
  const isDribbleSpecialist =
    pStyle.includes('complete') ||
    pStyle.includes('prolific') ||
    pStyle.includes('inverted') ||
    (detailed && detailed.dribbling >= 82);

  let rawDistribution: Record<TacticalGoalChanceType, number>;

  if (style.includes('possession') || style.includes('tiki_taka') || style.includes('french_possession')) {
    rawDistribution = {
      tap_in: 0.45,
      dribbling: isDribbleSpecialist ? 0.35 : 0.25,
      crossing: 0.10,
      long_shoot: 0.12,
      counter: 0.08,
    };
  } else if (style.includes('long_ball') || style.includes('long_balls') || style.includes('direct')) {
    rawDistribution = {
      crossing: 0.60,
      long_shoot: 0.15,
      tap_in: 0.10,
      counter: 0.10,
      dribbling: isDribbleSpecialist ? 0.08 : 0.05,
    };
  } else if (style.includes('catenaccio') || style.includes('park_the_bus') || style.includes('defensive')) {
    rawDistribution = {
      counter: 0.45,
      long_shoot: 0.35,
      tap_in: 0.10,
      crossing: 0.05,
      dribbling: isDribbleSpecialist ? 0.08 : 0.05,
    };
  } else if (style.includes('counter') || style.includes('counter_attack') || style.includes('fast_break')) {
    rawDistribution = {
      counter: 0.55,
      crossing: 0.20,
      long_shoot: 0.15,
      tap_in: 0.05,
      dribbling: isDribbleSpecialist ? 0.08 : 0.05,
    };
  } else if (style.includes('gegenpress') || style.includes('pressing') || style.includes('high_press')) {
    rawDistribution = {
      tap_in: 0.45,
      counter: 0.35,
      long_shoot: 0.10,
      crossing: 0.05,
      dribbling: isDribbleSpecialist ? 0.08 : 0.05,
    };
  } else {
    // Balanced distribution
    rawDistribution = {
      tap_in: 0.30,
      counter: 0.30,
      crossing: 0.20,
      long_shoot: 0.12,
      dribbling: isDribbleSpecialist ? 0.15 : 0.08,
    };
  }

  // Normalize
  const sum = Object.values(rawDistribution).reduce((a, b) => a + b, 0);
  return {
    counter: rawDistribution.counter / sum,
    crossing: rawDistribution.crossing / sum,
    tap_in: rawDistribution.tap_in / sum,
    long_shoot: rawDistribution.long_shoot / sum,
    dribbling: rawDistribution.dribbling / sum,
  };
}

/**
 * Derives the tactical style odds of each assist chance type based on team strategy, playstyle, and player attributes:
 * - Cross Assist: relies on crossing
 * - Counter Assist: relies on long pass in fast transition
 * - Tap-in Assist: relies on short pass
 * - Dribble & Pass Assist: uses dribbling, pace, ballControl, retention, then crossing or shortPass
 * - Very Long Pass Assist: mirrors long shoot, relies heavily on long pass individual prowess
 */
export function getTacticalAssistChanceDistribution(
  teamStrategy?: string,
  playStyle?: string,
  detailed?: OutfieldDetailedStats
): Record<TacticalAssistChanceType, number> {
  const style = (teamStrategy || 'possession').toLowerCase().trim();
  const pStyle = (playStyle || '').toLowerCase().trim();
  const isDribbleSpecialist =
    pStyle.includes('complete') ||
    pStyle.includes('prolific') ||
    pStyle.includes('inverted') ||
    (detailed && detailed.dribbling >= 80);

  let rawDistribution: Record<TacticalAssistChanceType, number>;

  if (style.includes('possession') || style.includes('tiki_taka') || style.includes('french_possession')) {
    rawDistribution = {
      tap_in_assist: 0.45,
      dribble_and_pass_assist: isDribbleSpecialist ? 0.35 : 0.25,
      very_long_pass_assist: 0.10,
      cross_assist: 0.10,
      counter_assist: 0.10,
    };
  } else if (style.includes('long_ball') || style.includes('long_balls') || style.includes('direct')) {
    rawDistribution = {
      cross_assist: 0.50,
      very_long_pass_assist: 0.25,
      counter_assist: 0.15,
      tap_in_assist: 0.05,
      dribble_and_pass_assist: isDribbleSpecialist ? 0.08 : 0.05,
    };
  } else if (style.includes('catenaccio') || style.includes('park_the_bus') || style.includes('defensive')) {
    rawDistribution = {
      counter_assist: 0.45,
      very_long_pass_assist: 0.35,
      tap_in_assist: 0.10,
      cross_assist: 0.05,
      dribble_and_pass_assist: isDribbleSpecialist ? 0.08 : 0.05,
    };
  } else if (style.includes('counter') || style.includes('counter_attack') || style.includes('fast_break')) {
    rawDistribution = {
      counter_assist: 0.55,
      cross_assist: 0.20,
      very_long_pass_assist: 0.15,
      tap_in_assist: 0.05,
      dribble_and_pass_assist: isDribbleSpecialist ? 0.08 : 0.05,
    };
  } else if (style.includes('gegenpress') || style.includes('pressing') || style.includes('high_press')) {
    rawDistribution = {
      tap_in_assist: 0.45,
      counter_assist: 0.35,
      very_long_pass_assist: 0.10,
      cross_assist: 0.05,
      dribble_and_pass_assist: isDribbleSpecialist ? 0.08 : 0.05,
    };
  } else {
    // Balanced distribution
    rawDistribution = {
      tap_in_assist: 0.30,
      counter_assist: 0.30,
      cross_assist: 0.20,
      very_long_pass_assist: 0.12,
      dribble_and_pass_assist: isDribbleSpecialist ? 0.15 : 0.08,
    };
  }

  // Normalize
  const sum = Object.values(rawDistribution).reduce((a, b) => a + b, 0);
  return {
    cross_assist: rawDistribution.cross_assist / sum,
    counter_assist: rawDistribution.counter_assist / sum,
    tap_in_assist: rawDistribution.tap_in_assist / sum,
    dribble_and_pass_assist: rawDistribution.dribble_and_pass_assist / sum,
    very_long_pass_assist: rawDistribution.very_long_pass_assist / sum,
  };
}

/**
 * Rolls a random chance type according to the distribution map.
 */
export function rollChanceType<T extends string>(distribution: Record<T, number>): T {
  const roll = Math.random();
  let cumulative = 0;

  for (const [type, prob] of Object.entries(distribution) as [T, number][]) {
    cumulative += prob;
    if (roll <= cumulative) {
      return type;
    }
  }

  return Object.keys(distribution)[0] as T;
}

/**
 * Simulates a single tactical scoring chance attempt for a player with precise stat weightings,
 * weak foot probabilities, and weak foot penalty calculations.
 */
export function simulateSingleTacticalChance(
  player: PlayerConfig,
  chanceType: TacticalGoalChanceType,
  opponentOvr: number = 75
): TacticalChanceResult {
  const detailed: OutfieldDetailedStats = getEffectiveOutfieldDetailed(player as any);

  const hasOutsideFoot = hasOutsideFootTrait(player);
  const wfStars = typeof player.weakFootStars === 'number' ? player.weakFootStars : 3;
  // If player possesses the Outside Foot perk, they use the outside of their dominant foot instead of weak foot (1.0x / 5★ equivalent)
  const wfMultiplier = hasOutsideFoot ? 1.0 : getWeakFootMultiplier(wfStars);

  const pos = (detailed.positioning || 70) * getSkillPerkSimulationMultiplier(player as any, 'positioning');
  const pace = (detailed.pace || 70) * getSkillPerkSimulationMultiplier(player as any, 'pace');
  const sho = (detailed.shooting || 70) * getSkillPerkSimulationMultiplier(player as any, 'shooting');
  const str = (detailed.strength || 70) * getSkillPerkSimulationMultiplier(player as any, 'strength');
  const hea = (detailed.heading || 70) * getSkillPerkSimulationMultiplier(player as any, 'heading');
  const ls = (detailed.longShots || 70) * getSkillPerkSimulationMultiplier(player as any, 'longShots');
  const bc = (detailed.ballControl || 70) * getSkillPerkSimulationMultiplier(player as any, 'ballControl');
  const dri = (detailed.dribbling || 70) * getSkillPerkSimulationMultiplier(player as any, 'dribbling');
  const ret = (detailed.retention || detailed.composure || 70) * getSkillPerkSimulationMultiplier(player as any, 'retention');

  const oppDefFactor = Math.max(0.6, Math.min(1.3, 75 / Math.max(50, opponentOvr)));

  let fellOnWeakFoot = false;
  let baseSuccessRate = 0;
  let statDesc = '';
  let chanceTitle = '';
  let isDribbleMove = false;

  switch (chanceType) {
    case 'counter': {
      chanceTitle = 'Quick Counter-Attack';
      // 33% weak foot chance
      fellOnWeakFoot = Math.random() < 0.33;
      // Relies on positioning, pace, and shooting
      const effectiveStat = (pos + pace + sho) / 3;
      baseSuccessRate = (effectiveStat / 100) * 0.58 * oppDefFactor;
      statDesc = `Positioning (${pos}) + Pace (${pace}) + Shooting (${sho})`;
      break;
    }

    case 'crossing': {
      chanceTitle = 'Wing Cross / Box Delivery';
      // 5% weak foot chance (if volley)
      fellOnWeakFoot = Math.random() < 0.05;
      // Relies 30% on strength, 30% positioning, 30% heading, 10% shooting
      const effectiveStat = 0.3 * str + 0.3 * pos + 0.3 * hea + 0.1 * sho;
      baseSuccessRate = (effectiveStat / 100) * 0.52 * oppDefFactor;
      statDesc = `Strength 30% (${str}) + Positioning 30% (${pos}) + Heading 30% (${hea}) + Shooting 10% (${sho})`;
      break;
    }

    case 'tap_in': {
      chanceTitle = 'Close-Range Tap-In';
      // 30% weak foot chance
      fellOnWeakFoot = Math.random() < 0.3;
      // Relies only on positioning and shooting
      const effectiveStat = 0.5 * pos + 0.5 * sho;
      baseSuccessRate = (effectiveStat / 100) * 0.72 * oppDefFactor;
      statDesc = `Positioning 50% (${pos}) + Shooting 50% (${sho})`;
      break;
    }

    case 'long_shoot': {
      chanceTitle = 'Long-Range Cannon';
      // 20% weak foot chance
      fellOnWeakFoot = Math.random() < 0.2;
      // 20% base success at 99 long shoot, each point below lowers 1% of that 20
      const pointsBelow = Math.max(0, 99 - Math.min(99, ls));
      baseSuccessRate = 0.2 * (1 - 0.01 * pointsBelow);
      baseSuccessRate = Math.max(0.02, baseSuccessRate * oppDefFactor);
      statDesc = `Long Shots (${ls}) -> Base ${Math.round(baseSuccessRate * 100)}%`;
      break;
    }

    case 'dribbling': {
      chanceTitle = 'Solo Dribble Breakthrough';
      isDribbleMove = true;
      // 5% weak foot chance
      fellOnWeakFoot = Math.random() < 0.05;
      // Relies on pace, ball control, dribbling, retention, and shooting
      const effectiveStat = (pace + bc + dri + ret + sho) / 5;
      baseSuccessRate = (effectiveStat / 100) * 0.45 * oppDefFactor;
      statDesc = `Pace (${pace}) + Ball Control (${bc}) + Dribbling (${dri}) + Retention (${ret}) + Shooting (${sho})`;
      break;
    }
  }

  // Stat Break Multiplier & Group Mastery Check
  const breakInfo = getStatBreakBonus(detailed);
  let statBreakMultiplier = 1.0;
  let statBreakActiveForChance = false;
  let groupMasteryActiveForChance = false;
  let brokenStatName = '';

  if (chanceType === 'counter' && (sho >= 100 || pos >= 100)) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = sho >= 100 ? 'Shooting' : 'Positioning';
  } else if (chanceType === 'crossing' && (hea >= 100 || sho >= 100)) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = hea >= 100 ? 'Heading' : 'Shooting';
  } else if (chanceType === 'tap_in' && (sho >= 100 || pos >= 100)) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = sho >= 100 ? 'Shooting' : 'Positioning';
  } else if (chanceType === 'long_shoot' && ls >= 100) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = 'Long Shots';
  } else if (chanceType === 'dribbling' && (dri >= 100 || bc >= 100 || ret >= 100 || sho >= 100)) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = dri >= 100 ? 'Dribbling' : bc >= 100 ? 'Ball Control' : ret >= 100 ? 'Retention' : 'Shooting';
  }

  // Group Mastery Boost (+50% / 1.5x)
  if (breakInfo.masteredGroups.includes('SCO') && (chanceType === 'tap_in' || chanceType === 'long_shoot' || chanceType === 'crossing' || chanceType === 'counter')) {
    statBreakMultiplier *= 1.5;
    groupMasteryActiveForChance = true;
  } else if (breakInfo.masteredGroups.includes('PRO') && (chanceType === 'dribbling' || chanceType === 'counter')) {
    statBreakMultiplier *= 1.5;
    groupMasteryActiveForChance = true;
  }

  // Magnetic Feet Perk Check (2x success chance on all dribble attempts)
  const hasMagneticFeet = hasMagneticFeetTrait(player);
  if (chanceType === 'dribbling' && hasMagneticFeet) {
    statBreakMultiplier *= 2.0;
    statDesc += ` • 🧲 MAGNETIC FEET (2x Dribble Success)`;
  }

  baseSuccessRate *= statBreakMultiplier;
  if (statBreakActiveForChance) {
    statDesc += ` • ⭐ STAT BREAK (100 ${brokenStatName}: 2x Boost)`;
  }
  if (groupMasteryActiveForChance) {
    statDesc += ` • 👑 GROUP MASTERY (117 Rating: +50% Boost)`;
  }

  // Apply weak foot modifier if fell on weak foot
  let finalRate = baseSuccessRate;
  if (fellOnWeakFoot) {
    finalRate = finalRate * wfMultiplier;
    statDesc += hasOutsideFoot
      ? ' • Outside Foot / Trivela Technique (5★ WF Equivalent: 1.0x)'
      : ` • Weak Foot (${wfStars}★: ${wfMultiplier.toFixed(2)}x)`;
  }

  // Bound probability safely between 1% and 98% for Stat Break
  finalRate = Math.max(0.01, Math.min(0.98, finalRate));

  const roll = Math.random();
  const scored = roll < finalRate;

  let commentary = '';
  if (scored) {
    if (groupMasteryActiveForChance) {
      commentary = `GOAL! 👑 IMMORTAL GROUP MASTERY FINISH! Displaying historic perfection (117 Group Rating) that transcends football history!`;
    } else if (statBreakActiveForChance) {
      commentary = `GOAL! 🌟 HISTORIC STAT BREAK MASTERCLASS! 100-rated ${brokenStatName} unlocks an unplayable finish celebrated as the greatest ever seen!`;
    } else if (chanceType === 'counter') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `GOAL! Explosive counter-attack! Swerved a breathtaking Trivela with the outside of the boot past the goalkeeper into the corner!`
            : `GOAL! Explosive counter-attack! Cut inside onto the ${wfStars}★ weak foot and slotted into the corner!`)
        : `GOAL! Lethal counter-attack transition! Sprinted behind the defense and finished cleanly!`;
    } else if (chanceType === 'crossing') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `GOAL! Struck a sensational outside-of-the-boot Trivela volley screaming into the top corner!`
            : `GOAL! Flying volley off a pinpoint cross struck cleanly on the weak foot!`)
        : `GOAL! Rose above the defenders with immense aerial power to head the cross home!`;
    } else if (chanceType === 'tap_in') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `GOAL! Masterful outside-foot flick into the bottom corner with zero hesitation!`
            : `GOAL! Perfect positioning on a slick passing sequence to tap it in with the weak foot!`)
        : `GOAL! Clinical poacher movement! Redirected the pass into the net for a clean tap-in!`;
    } else if (chanceType === 'long_shoot') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `GOAL! Majestic 30-yard TRIVELA missile! Curled with venomous outside spin into the postage stamp!`
            : `GOAL! Spectacular long-range screamer unleashed on the weak foot from 25 yards out!`)
        : `GOAL! Stunner from distance! Absolute rocket arrowed into the top corner!`;
    } else {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `GOAL! Dazzling solo run followed by a sublime outside-of-the-boot Trivela finish! (Double Match Rating Impact)`
            : `GOAL! Breathtaking solo run beating three defenders before tucking it away with the weak foot! (Double Match Rating Impact)`)
        : `GOAL! Magical solo dribble gliding past multiple defenders to score! (Double Match Rating Impact)`;
    }
  } else {
    if (chanceType === 'counter') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `Audacious Trivela attempt on the counter curled just inches past the upright.`
            : `Counter chance fell on the ${wfStars}★ weak foot, but the shot drifted just wide.`)
        : `Breakaway counter-attack denied by an outstretched goalkeeper save.`;
    } else if (chanceType === 'crossing') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `Tried a spectacular outside-of-the-boot Trivela volley, but the keeper tipped it over.`
            : `Volley off the cross miscued on the weak foot under heavy pressure.`)
        : `Header from the cross contested aggressively and sailed over the crossbar.`;
    } else if (chanceType === 'tap_in') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `Outside-foot flick in the box deflected just wide by a sliding defender.`
            : `Tap-in opportunity on the weak foot pushed slightly off-target by a sliding defender.`)
        : `Scramble in the 6-yard box cleared off the goal line at the last millisecond.`;
    } else if (chanceType === 'long_shoot') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `Ambitious Trivela curve shot from distance dipped narrowly over the crossbar.`
            : `Long-range strike on the weak foot lacked power and was gathered easily.`)
        : `Ambitious drive from outside the box whistled inches past the upright.`;
    } else {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `Brilliant solo run, but the outside-foot Trivela strike was smothered by the keeper.`
            : `Dazzling run past two defenders, but the final weak-foot effort was blocked.`)
        : `Brilliant solo dribble inside the box crowded out before finding the opening.`;
    }
  }

  return {
    category: 'goal',
    chanceType,
    chanceTitle,
    fellOnWeakFoot,
    weakFootStars: hasOutsideFoot ? 5 : wfStars,
    weakFootMultiplier: wfMultiplier,
    calculatedSuccessRate: parseFloat((finalRate * 100).toFixed(1)),
    scored,
    isDribbleMove,
    commentary,
    statBreakdown: statDesc,
  };
}

/**
 * Simulates a single tactical assist opportunity for a player:
 * - cross_assist: relies on crossing (and positioning)
 * - counter_assist: relies on longPass (and pace/vision)
 * - tap_in_assist: relies on shortPass (and positioning)
 * - dribble_and_pass_assist: uses dribbling, pace, ballControl, retention, then crossing or shortPass (double rating)
 * - very_long_pass_assist: mirrors long shoot, relies heavily on longPass (20% base at 99, 1% lower per point below 99)
 * - assist chances can also fall on the weak foot with the exact same weak foot multiplier mechanics!
 */
export function simulateSingleTacticalAssistChance(
  player: PlayerConfig,
  chanceType: TacticalAssistChanceType,
  opponentOvr: number = 75
): TacticalChanceResult {
  const detailed: OutfieldDetailedStats = getEffectiveOutfieldDetailed(player as any);

  const hasOutsideFoot = hasOutsideFootTrait(player);
  const wfStars = typeof player.weakFootStars === 'number' ? player.weakFootStars : 3;
  const wfMultiplier = hasOutsideFoot ? 1.0 : getWeakFootMultiplier(wfStars);

  const pos = (detailed.positioning || 70) * getSkillPerkSimulationMultiplier(player as any, 'positioning');
  const pace = (detailed.pace || 70) * getSkillPerkSimulationMultiplier(player as any, 'pace');
  const sp = (detailed.shortPass || 70) * getSkillPerkSimulationMultiplier(player as any, 'shortPass');
  const lp = (detailed.longPass || 70) * getSkillPerkSimulationMultiplier(player as any, 'longPass');
  const cro = (detailed.crossing || 70) * getSkillPerkSimulationMultiplier(player as any, 'crossing');
  const bc = (detailed.ballControl || 70) * getSkillPerkSimulationMultiplier(player as any, 'ballControl');
  const dri = (detailed.dribbling || 70) * getSkillPerkSimulationMultiplier(player as any, 'dribbling');
  const ret = (detailed.retention || detailed.composure || 70) * getSkillPerkSimulationMultiplier(player as any, 'retention');

  const oppDefFactor = Math.max(0.6, Math.min(1.3, 75 / Math.max(50, opponentOvr)));

  let fellOnWeakFoot = false;
  let baseSuccessRate = 0;
  let statDesc = '';
  let chanceTitle = '';
  let isDribbleMove = false;

  switch (chanceType) {
    case 'cross_assist': {
      chanceTitle = 'Pinpoint Cross Delivery';
      // 30% weak foot chance
      fellOnWeakFoot = Math.random() < 0.3;
      // Relies heavily on crossing & positioning
      const effectiveStat = 0.7 * cro + 0.3 * pos;
      baseSuccessRate = (effectiveStat / 100) * 0.54 * oppDefFactor;
      statDesc = `Crossing 70% (${cro}) + Positioning 30% (${pos})`;
      break;
    }

    case 'counter_assist': {
      chanceTitle = 'Counter-Attack Through Ball';
      // 33% weak foot chance
      fellOnWeakFoot = Math.random() < 0.33;
      // Relies heavily on long pass & pace transition
      const effectiveStat = 0.6 * lp + 0.2 * pace + 0.2 * pos;
      baseSuccessRate = (effectiveStat / 100) * 0.56 * oppDefFactor;
      statDesc = `Long Pass 60% (${lp}) + Pace 20% (${pace}) + Positioning 20% (${pos})`;
      break;
    }

    case 'tap_in_assist': {
      chanceTitle = 'Unselfish Cutback / Slip Pass';
      // 30% weak foot chance
      fellOnWeakFoot = Math.random() < 0.3;
      // Relies on short pass & positioning
      const effectiveStat = 0.7 * sp + 0.3 * pos;
      baseSuccessRate = (effectiveStat / 100) * 0.68 * oppDefFactor;
      statDesc = `Short Pass 70% (${sp}) + Positioning 30% (${pos})`;
      break;
    }

    case 'dribble_and_pass_assist': {
      chanceTitle = 'Dribble Breakthrough & Final Assist';
      isDribbleMove = true;
      // 25% weak foot chance (final delivery on weak foot)
      fellOnWeakFoot = Math.random() < 0.25;
      // Uses dribbling, pace, ballControl, retention, then either crossing or short pass
      const finalDelivery = Math.max(cro, sp);
      const dribblePhase = (dri * 0.35 + bc * 0.25 + pace * 0.25 + ret * 0.15);
      const effectiveStat = dribblePhase * 0.6 + finalDelivery * 0.4;
      baseSuccessRate = (effectiveStat / 100) * 0.46 * oppDefFactor;
      statDesc = `Dribble/Control/Pace/Retention (${Math.round(dribblePhase)}) + Final Pass/Cross (${finalDelivery})`;
      break;
    }

    case 'very_long_pass_assist': {
      chanceTitle = 'Visionary Long-Range Hollywood Assist';
      // 20% weak foot chance
      fellOnWeakFoot = Math.random() < 0.2;
      // Mirrors long shoot: 20% base success at 99 long pass, each point below lowers 1% of that 20%
      const pointsBelow = Math.max(0, 99 - Math.min(99, lp));
      baseSuccessRate = 0.2 * (1 - 0.01 * pointsBelow);
      baseSuccessRate = Math.max(0.02, baseSuccessRate * oppDefFactor);
      statDesc = `Long Pass (${lp}) -> Base ${Math.round(baseSuccessRate * 100)}%`;
      break;
    }
  }

  // Stat Break Multiplier & Group Mastery Check
  const breakInfo = getStatBreakBonus(detailed);
  let statBreakMultiplier = 1.0;
  let statBreakActiveForChance = false;
  let groupMasteryActiveForChance = false;
  let brokenStatName = '';

  if (chanceType === 'cross_assist' && (cro >= 100 || pos >= 100)) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = cro >= 100 ? 'Crossing' : 'Positioning';
  } else if (chanceType === 'counter_assist' && (lp >= 100 || pos >= 100)) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = lp >= 100 ? 'Long Pass' : 'Positioning';
  } else if (chanceType === 'tap_in_assist' && (sp >= 100 || pos >= 100)) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = sp >= 100 ? 'Short Pass' : 'Positioning';
  } else if (chanceType === 'very_long_pass_assist' && lp >= 100) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = 'Long Pass';
  } else if (chanceType === 'dribble_and_pass_assist' && (dri >= 100 || bc >= 100 || ret >= 100 || sp >= 100 || cro >= 100)) {
    statBreakMultiplier *= 2.0;
    statBreakActiveForChance = true;
    brokenStatName = dri >= 100 ? 'Dribbling' : bc >= 100 ? 'Ball Control' : ret >= 100 ? 'Retention' : sp >= 100 ? 'Short Pass' : 'Crossing';
  }

  // Group Mastery Boost (+50% / 1.5x)
  if (breakInfo.masteredGroups.includes('CRE') && (chanceType === 'cross_assist' || chanceType === 'counter_assist' || chanceType === 'tap_in_assist' || chanceType === 'very_long_pass_assist' || chanceType === 'dribble_and_pass_assist')) {
    statBreakMultiplier *= 1.5;
    groupMasteryActiveForChance = true;
  } else if (breakInfo.masteredGroups.includes('PRO') && chanceType === 'dribble_and_pass_assist') {
    statBreakMultiplier *= 1.5;
    groupMasteryActiveForChance = true;
  }

  // Magnetic Feet Perk Check (2x success chance on dribble-based assists)
  const hasMagneticFeet = hasMagneticFeetTrait(player);
  if (chanceType === 'dribble_and_pass_assist' && hasMagneticFeet) {
    statBreakMultiplier *= 2.0;
    statDesc += ` • 🧲 MAGNETIC FEET (2x Dribble Success)`;
  }

  baseSuccessRate *= statBreakMultiplier;
  if (statBreakActiveForChance) {
    statDesc += ` • ⭐ STAT BREAK (100 ${brokenStatName}: 2x Boost)`;
  }
  if (groupMasteryActiveForChance) {
    statDesc += ` • 👑 GROUP MASTERY (117 Rating: +50% Boost)`;
  }

  // Apply weak foot modifier if fell on weak foot
  let finalRate = baseSuccessRate;
  if (fellOnWeakFoot) {
    finalRate = finalRate * wfMultiplier;
    statDesc += hasOutsideFoot
      ? ' • Outside Foot / Trivela Technique (5★ WF Equivalent: 1.0x)'
      : ` • Weak Foot (${wfStars}★: ${wfMultiplier.toFixed(2)}x)`;
  }

  // Bound probability safely between 1% and 98% for Stat Break
  finalRate = Math.max(0.01, Math.min(0.98, finalRate));

  const roll = Math.random();
  const scored = roll < finalRate; // In this case, 'scored' means assist completed successfully

  let commentary = '';
  if (scored) {
    if (groupMasteryActiveForChance) {
      commentary = `ASSIST! 👑 IMMORTAL GROUP MASTERY PLAYMAKING! Supernatural vision (117 Rating) executing a pass that defies human geometry!`;
    } else if (statBreakActiveForChance) {
      commentary = `ASSIST! 🌟 HISTORIC STAT BREAK MASTERCLASS! 100-rated ${brokenStatName} unlocks an unplayable assist recognized as absolute genius!`;
    } else if (chanceType === 'cross_assist') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `ASSIST! Curled an unbelievable Trivela cross with the outside of the boot onto the striker's head!`
            : `ASSIST! Whipped a peach of a cross on the ${wfStars}★ weak foot straight onto the striker's head!`)
        : `ASSIST! Majestic pinpoint cross into the danger zone headed home emphatically!`;
    } else if (chanceType === 'counter_assist') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `ASSIST! Masterclass outside-of-the-boot Trivela through-ball slicing the defense open!`
            : `ASSIST! Laser-guided counter through-ball off the weak foot unlocking the entire defense!`)
        : `ASSIST! Lightning-fast transition pass threaded perfectly into the striker's stride!`;
    } else if (chanceType === 'tap_in_assist') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `ASSIST! Deft outside-foot slip pass leaving the keeper frozen for a simple tap-in!`
            : `ASSIST! Unselfish weak-foot square pass across the 6-yard box for an easy tap-in!`)
        : `ASSIST! Dissected the backline with an unselfish square ball for a simple finish!`;
    } else if (chanceType === 'dribble_and_pass_assist') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `ASSIST! Glided past defenders before delivering a world-class outside-foot Trivela assist! (Double Match Rating Impact)`
            : `ASSIST! Danced through two defenders before serving a magnificent weak-foot assist! (Double Match Rating Impact)`)
        : `ASSIST! Mesmerizing solo dribble past defenders before laying off a perfect goal assist! (Double Match Rating Impact)`;
    } else {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `ASSIST! Unbelievable 50-yard bending Trivela Hollywood pass dropped on a penny for the goal!`
            : `ASSIST! Sensational 50-yard weak-foot Hollywood pass cutting right through the backline!`)
        : `ASSIST! World-class long-range pass dropped on a sixpence for a jaw-dropping assist!`;
    }
  } else {
    if (chanceType === 'cross_assist') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `Trivela cross with outside of the boot had venomous curl, but the keeper caught it cleanly.`
            : `Cross on the weak foot had slightly too much curl and was plucked out of the air by the keeper.`)
        : `Dangerous cross delivered into the box cleared by a towering defender.`;
    } else if (chanceType === 'counter_assist') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `Audacious outside-foot through-ball had fractionally too much curve for the winger.`
            : `Counter-attacking through ball on the weak foot had a fraction too much weight.`)
        : `Breakaway counter pass intercepted by a tracking defensive midfielder.`;
    } else if (chanceType === 'tap_in_assist') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `Outside-foot cutback pass intercepted by a desperate sliding tackle.`
            : `Square ball across the box on the weak foot cut out by a sliding tackle.`)
        : `Cutback pass in the 6-yard box blocked right before reaching the striker.`;
    } else if (chanceType === 'dribble_and_pass_assist') {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `Magical dribble, but the outside-foot Trivela pass was cleared off the line.`
            : `Great initial dribble, but the final weak-foot pass was diverted behind for a corner.`)
        : `Slick footwork to beat the first man, but the final pass was blocked by the recovering center back.`;
    } else {
      commentary = fellOnWeakFoot
        ? (hasOutsideFoot
            ? `50-yard curving Trivela pass just drifted out of reach of the sprinting striker.`
            : `Ambitious long-range pass on the weak foot floated slightly over the winger's run.`)
        : `Visionary long-distance pass just intercepted at the edge of the area.`;
    }
  }

  return {
    category: 'assist',
    chanceType,
    chanceTitle,
    fellOnWeakFoot,
    weakFootStars: hasOutsideFoot ? 5 : wfStars,
    weakFootMultiplier: wfMultiplier,
    calculatedSuccessRate: parseFloat((finalRate * 100).toFixed(1)),
    scored,
    isDribbleMove,
    commentary,
    statBreakdown: statDesc,
  };
}

/**
 * Simulates the full set of player scoring & assist opportunities in a match based on team strategy,
 * performance factor, minutes played, opponent level, position, and playstyle modifiers.
 */
export function simulateTacticalMatchScoring(
  player: PlayerConfig,
  teamStrategy?: string,
  perfFactor: number = 1.0,
  playerTeamScore: number = 1,
  minutesPlayed: number = 90,
  opponentOvr: number = 75
): {
  playerGoals: number;
  playerAssists: number;
  dribbleGoals: number;
  regularGoals: number;
  dribbleAssists: number;
  regularAssists: number;
  ratingBonusFromScoring: number;
  chanceEvents: TacticalChanceResult[];
} {
  const { primaryPos, subPos } = normalizePositionTaxonomy(player.position, player.subPosition);
  const pStyle = player.playStyle || (player as any).playstyle || '';
  const detailed = player.stats?.detailed || getOrCreateOutfieldDetailed(player.stats || ({} as any));

  // Get layered position & playstyle odds multipliers
  const posMods = getGoalAssistModifiers(player.position, player.subPosition, pStyle);

  const goalDistribution = getTacticalGoalChanceDistribution(teamStrategy, pStyle, detailed);
  const assistDistribution = getTacticalAssistChanceDistribution(teamStrategy, pStyle, detailed);

  const participationRatio = Math.min(1.0, minutesPlayed / 90);

  // 1. Goal Chances Roll (multiplied by position & playstyle goalChanceMultiplier)
  let numGoalChances = 0;
  if (primaryPos === 'ATT') {
    numGoalChances = Math.floor(
      (1 + perfFactor * 1.8 * participationRatio) * posMods.goalChanceMultiplier +
      (Math.random() < posMods.multiGoalChance ? 1 : 0)
    );
  } else if (primaryPos === 'MID') {
    numGoalChances = Math.floor(
      (0.6 + perfFactor * 1.1 * participationRatio) * posMods.goalChanceMultiplier +
      (Math.random() < posMods.multiGoalChance ? 1 : 0)
    );
  } else if (primaryPos === 'DEF') {
    const cbProb = subPos === 'CB' ? 0.35 : 0.45;
    numGoalChances = Math.random() < cbProb * participationRatio * posMods.goalChanceMultiplier ? 1 : 0;
  } else {
    numGoalChances = 0; // GK
  }
  numGoalChances = Math.min(5, Math.max(0, numGoalChances));

  const chanceEvents: TacticalChanceResult[] = [];
  let playerGoals = 0;
  let dribbleGoals = 0;

  for (let c = 0; c < numGoalChances; c++) {
    const chanceType = rollChanceType<TacticalGoalChanceType>(goalDistribution);
    const result = simulateSingleTacticalChance(player, chanceType, opponentOvr);
    chanceEvents.push(result);
    if (result.scored) {
      playerGoals++;
      if (result.isDribbleMove) {
        dribbleGoals++;
      }
    }
  }

  // Ensure goals do not exceed reasonable boundaries compared to team score
  playerGoals = Math.min(playerGoals, Math.max(1, playerTeamScore));
  dribbleGoals = Math.min(dribbleGoals, playerGoals);
  const regularGoals = playerGoals - dribbleGoals;

  // 2. Assist Chances Roll (multiplied by position & playstyle assistChanceMultiplier)
  let numAssistChances = 0;
  if (primaryPos === 'ATT') {
    // Wingers or Decoy STs get more assist opportunities
    const baseAssistRoll = (subPos === 'LW' || subPos === 'RW') ? 1.5 : 0.8;
    numAssistChances = Math.floor(
      (baseAssistRoll + perfFactor * 1.2 * participationRatio) * posMods.assistChanceMultiplier +
      (Math.random() < posMods.multiAssistChance ? 1 : 0)
    );
  } else if (primaryPos === 'MID') {
    // CAMs / CMs are primary creators
    numAssistChances = Math.floor(
      (1.2 + perfFactor * 1.4 * participationRatio) * posMods.assistChanceMultiplier +
      (Math.random() < posMods.multiAssistChance ? 1 : 0)
    );
  } else if (primaryPos === 'DEF') {
    // Fullbacks / Playmaker CBs
    const isAttackingFb = ['LB', 'RB', 'LWB', 'RWB'].includes(subPos);
    const defProb = isAttackingFb ? 0.75 : 0.35;
    numAssistChances = Math.random() < defProb * participationRatio * posMods.assistChanceMultiplier ? 1 : 0;
    if (isAttackingFb && Math.random() < 0.25 * posMods.assistChanceMultiplier) {
      numAssistChances += 1;
    }
  } else {
    numAssistChances = 0; // GK
  }
  numAssistChances = Math.min(4, Math.max(0, numAssistChances));

  let playerAssists = 0;
  let dribbleAssists = 0;

  for (let a = 0; a < numAssistChances; a++) {
    const assistType = rollChanceType<TacticalAssistChanceType>(assistDistribution);
    const result = simulateSingleTacticalAssistChance(player, assistType, opponentOvr);
    chanceEvents.push(result);
    if (result.scored) {
      playerAssists++;
      if (result.isDribbleMove) {
        dribbleAssists++;
      }
    }
  }

  // Ensure assists do not exceed team score limits
  const maxPossibleAssists = Math.max(0, playerTeamScore - playerGoals + (playerGoals > 0 ? 1 : 0));
  playerAssists = Math.min(playerAssists, Math.max(1, maxPossibleAssists));
  dribbleAssists = Math.min(dribbleAssists, playerAssists);
  const regularAssists = playerAssists - dribbleAssists;

  // Dribbling goals and assists add DOUBLE the points towards match rating:
  // Regular Goal: +0.8 rating | Dribble Goal: +1.6 rating
  // Regular Assist: +0.5 rating | Dribble Assist: +1.0 rating
  const ratingBonusFromScoring =
    regularGoals * 0.8 + dribbleGoals * 1.6 + regularAssists * 0.5 + dribbleAssists * 1.0;

  return {
    playerGoals,
    playerAssists,
    dribbleGoals,
    regularGoals,
    dribbleAssists,
    regularAssists,
    ratingBonusFromScoring,
    chanceEvents,
  };
}
