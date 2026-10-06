import { PlayerCardData } from '../types';
import { stepProEquipmentMatchDuration } from '../data/storeItems';
import { YOUTH_LEAGUES_DATABASE } from '../data/youthLeaguesDatabase';
import { getActiveChemistryCeiling } from './chemistrySystem';

export interface InjuryDetails {
  name: string;
  type: 'Hamstring' | 'Groin' | 'Ankle' | 'Calf' | 'Quadriceps' | 'ACL' | 'MCL' | 'Meniscus' | 'Achilles' | 'Catastrophic' | string;
  grade: 'Grade I' | 'Grade II' | 'Grade III' | 'Grave (6+ Months)' | 'Catastrophic';
  weeks: number;
  monthsText: string;
  severity: 'Small' | 'Injury' | 'Grave' | 'Severe' | 'Career-Ending';
  description: string;
}

export type MatchParticipationStatus =
  | 'starter'
  | 'sub_out'
  | 'sub_in'
  | 'benched'
  | 'not_called'
  | 'sub_entered'
  | 'sub_did_not_enter'
  | 'sub'
  | 'bench';

/**
 * Gets permanent Stamina attribute (Hard limits: 40 to 99)
 */
export function getPermanentStamina(player: PlayerCardData): number {
  let val = 70;
  if (player?.stats?.detailed?.stamina !== undefined) {
    val = player.stats.detailed.stamina;
  } else if (player?.stats?.phy !== undefined) {
    val = player.stats.phy;
  }
  return Math.max(40, Math.min(99, Math.round(val)));
}

/**
 * Legacy wrapper for getPermanentStamina
 */
export function getMaxStamina(player: PlayerCardData): number {
  return getPermanentStamina(player);
}

export function hasIronBodyPerk(player: PlayerCardData): boolean {
  if (!player) return false;
  const anyP = player as any;
  return Boolean(
    player.activePerkIds?.includes('iron_body') ||
    (Array.isArray(anyP.perks) && anyP.perks.some((p: any) => p?.id === 'iron_body' || p === 'iron_body'))
  );
}

/**
 * Gets current Fitness percentage (Hard clamped: 0% to 100%, or 60% minimum if Iron Body perk active)
 */
export function getFitnessPercentage(player: PlayerCardData): number {
  const minFloor = hasIronBodyPerk(player) ? 60 : 0;
  if (player.fitness !== undefined) {
    return Math.max(minFloor, Math.min(100, Math.round(player.fitness)));
  }
  if (player.staminaCurrent !== undefined) {
    return Math.max(minFloor, Math.min(100, Math.round(player.staminaCurrent)));
  }
  return 100;
}

/**
 * Legacy wrapper for getFitnessPercentage
 */
export function getCurrentStamina(player: PlayerCardData): number {
  return getFitnessPercentage(player);
}

/**
 * Legacy wrapper for getFitnessPercentage
 */
export function getStaminaPercentage(player: PlayerCardData): number {
  return getFitnessPercentage(player);
}

/**
 * Calculates Fitness loss percentage for a match based on permanent Stamina attribute and minutes played.
 * Linear / proportional to 90 minutes base loss:
 * - Stamina 99: Base 90-min loss = 10%
 * - Stamina 75-80: Base 90-min loss ~17%
 * - Stamina 40: Base 90-min loss = 38%
 *
 * For Sub Out or early exits: Every minute not played out of 90 is subtracted from fitness spent.
 * (e.g. 45 mins played = 50% of 90-min loss; 60 mins played = 66.7% of 90-min loss).
 */
export function calculateFitnessLoss(
  staminaAttr: number,
  minutesPlayed: number = 90,
  isExtraTime: boolean = false
): number {
  const S = Math.max(40, Math.min(99, staminaAttr));

  // Base loss formula per full 90-min match
  const baseLoss90 = 10 + Math.pow((99 - S) / 59, 1.5) * 28;

  // Workload strictly proportional to minutes played out of 90
  const minutes = Math.max(0, minutesPlayed);
  let workload = 0;
  if (isExtraTime || minutes >= 120) {
    workload = 1.3;
  } else {
    workload = minutes / 90;
  }

  return parseFloat((baseLoss90 * workload).toFixed(1));
}

/**
 * Calculates normal non-playing Fitness recovery rate per matchday.
 * Non-playing recovery per matchday = 100% of 90-min match fitness loss.
 */
export function calculateNonPlayingRecovery(staminaAttr: number): number {
  const fullMatchLoss = calculateFitnessLoss(staminaAttr, 90);
  return parseFloat((1.0 * fullMatchLoss).toFixed(1));
}

/**
 * Calculates Fitness recovery percentage based on permanent Stamina attribute and rest days
 */
export function calculateFitnessRecovery(
  staminaAttr: number,
  restDays: number = 3.5
): number {
  const matchdayRecovery = calculateNonPlayingRecovery(staminaAttr);
  // Assume ~3.5 days between matchdays
  return parseFloat(((restDays / 3.5) * matchdayRecovery).toFixed(1));
}

/**
 * Calculates net fitness change based on Match Status:
 * - BENCHED / NOT CALLED: 100% of normal recovery, 0 fitness loss (Benched gives the same recovery bonus as Not Called).
 * - SUB IN: Started on bench and entered later. Recovery bonus is calculated as (90 - minutesPlayed) / 90 of normal recovery.
 *           Fitness loss is proportional to minutes played. Net change = recovery bonus - fitness loss.
 * - SUB OUT: Started as starter and taken out before minute 70. 0 recovery bonus.
 *            Fitness loss is strictly proportional to minutes played (e.g. 45 mins = half loss).
 * - STARTER: Started and played full match or 70+ minutes. 0 recovery bonus.
 *            Fitness loss is calculated based on minutes played.
 */
export function calculateFitnessChangeByStatus(
  staminaAttr: number,
  status: MatchParticipationStatus,
  minutesPlayed: number = 90
): { recoveryGained: number; fitnessLost: number; netChange: number } {
  const normalRecovery = calculateNonPlayingRecovery(staminaAttr);

  // 1. BENCHED or NOT CALLED (0 minutes on pitch: full recovery bonus, 0 loss)
  if (
    status === 'benched' ||
    status === 'not_called' ||
    status === 'sub_did_not_enter' ||
    status === 'bench'
  ) {
    const recoveryGained = normalRecovery;
    const fitnessLost = 0;
    return { recoveryGained, fitnessLost, netChange: recoveryGained };
  }

  // 2. SUB OUT (Started match, taken out before minute 70)
  if (status === 'sub_out') {
    const recoveryGained = 0;
    const fitnessLost = calculateFitnessLoss(staminaAttr, minutesPlayed);
    return { recoveryGained, fitnessLost, netChange: -fitnessLost };
  }

  // 3. SUB IN (Started on bench, entered later in match)
  if (status === 'sub_in' || status === 'sub_entered' || status === 'sub') {
    const mins = Math.max(0, Math.min(90, minutesPlayed));
    const recoveryFraction = Math.max(0, (90 - mins) / 90);
    const recoveryGained = parseFloat((normalRecovery * recoveryFraction).toFixed(1));
    const fitnessLost = calculateFitnessLoss(staminaAttr, mins);
    return {
      recoveryGained,
      fitnessLost,
      netChange: parseFloat((recoveryGained - fitnessLost).toFixed(1)),
    };
  }

  // 4. STARTER (Played full match or >= 70 minutes)
  const recoveryGained = 0;
  const fitnessLost = calculateFitnessLoss(staminaAttr, minutesPlayed);
  return { recoveryGained, fitnessLost, netChange: -fitnessLost };
}

/**
 * Checks if a player is considered a Key Player (highest rated in position / team star / crucial role).
 */
export function isKeyPlayer(player: PlayerCardData): boolean {
  if (player.squadDestination === 'First Team' || player.isUniqueElite) {
    return true;
  }
  // High OVR standing in squad or youth setup
  const ovr = player.ovr || player.overallRating || 60;
  return ovr >= 65;
}

/**
 * Calculates injury risk based on current Fitness percentage:
 * - 1% chance per 1% missing fitness from 100%
 * - When Fitness is >= 50%, the base risk is reduced by 80% (i.e. multiplied by 0.20)
 *   e.g. 100% Fitness = 0% risk
 *   e.g. 90% Fitness = (10% missing * 0.20) = 2.0% risk
 *   e.g. 75% Fitness = (25% missing * 0.20) = 5.0% risk
 *   e.g. 60% Fitness = (40% missing * 0.20) = 8.0% risk
 *   e.g. 50% Fitness = (50% missing * 0.20) = 10.0% risk
 * - When Fitness is < 50%, severe exhaustion removes the 80% reduction (e.g. 40% Fitness = 60% base risk).
 */
export function calculateInjuryRisk(player: PlayerCardData): {
  riskPercentage: number;
  isHighRisk: boolean;
  explanation: string;
} {
  const fitnessPct = getFitnessPercentage(player);
  const missingFitness = Math.max(0, Math.min(100, 100 - fitnessPct));
  
  // 1% chance per 1% missing fitness from 100%
  let baseRisk = missingFitness;

  // If above or equal to 50% fitness, reduce base risk by 80%
  if (fitnessPct >= 50) {
    baseRisk = baseRisk * 0.20;
  } else {
    baseRisk = missingFitness;
  }

  const isInjuryProne = Boolean(
    player.activePerkIds?.includes('injury_prone') ||
    player.equippedParentCard?.perkTitle === 'Injury Prone'
  );

  let riskPercentage = baseRisk;
  if (isInjuryProne) {
    // Increases injury risk by +50%
    riskPercentage = riskPercentage * 1.5;
  }

  // Calculate Equipment, Season Boost, and Taping Injury Protection
  let totalProtectionPct = 0;
  (player.activeEquipment || []).forEach((eq) => {
    if (eq.injuryRiskReduction) {
      totalProtectionPct += eq.injuryRiskReduction;
    }
  });
  (player.activeSeasonBoosts || []).forEach((sb) => {
    if (sb.injuryRiskReduction) {
      totalProtectionPct += sb.injuryRiskReduction;
    }
  });
  if ((player.activeTapingMonths || 0) > 0) {
    totalProtectionPct += 15;
  }

  // Protective Face Mask: -50% injury risk reduction when equipped
  const hasProtectiveMask = Boolean(
    (player.accessories?.accessory as string) === 'protective-mask' ||
    (player.accessories?.headwear as string) === 'protective-mask' ||
    (player.accessories?.eyewear as string) === 'protective-mask'
  );
  if (hasProtectiveMask) {
    totalProtectionPct += 50;
  }

  if (totalProtectionPct > 0) {
    const factor = Math.max(0.1, 1 - Math.min(80, totalProtectionPct) / 100);
    riskPercentage = riskPercentage * factor;
  }

  // Iron Body Perk Protection: -25% injury risk reduction
  const hasIronBody = hasIronBodyPerk(player);
  if (hasIronBody) {
    riskPercentage = riskPercentage * 0.75;
  }

  // Relaxing Vacations Perk Protection: -10% permanent injury risk reduction (always on)
  const hasRelaxingVacations = Boolean(
    player.activePerkIds?.includes('relaxing_vacations') ||
    (player as any)?.perks?.some?.((p: any) => (typeof p === 'string' ? p : p?.id) === 'relaxing_vacations') ||
    player.activePerkIds?.includes('vacation_rested') ||
    (player as any)?.perks?.some?.((p: any) => (typeof p === 'string' ? p : p?.id) === 'vacation_rested') ||
    (player as any)?.hasVacationRested
  );
  if (hasRelaxingVacations) {
    riskPercentage = riskPercentage * 0.9;
  }

  // Post-Injury Recovery Protection: 80% reduction for the month following recovery
  const isPostInjuryProtected = Boolean(
    player.isPostInjuryProtected ||
    (player.postInjuryProtectionMonthsRemaining && player.postInjuryProtectionMonthsRemaining > 0) ||
    (player.postInjuryProtectionUntilTimestamp && Date.now() < player.postInjuryProtectionUntilTimestamp)
  );

  if (isPostInjuryProtected) {
    // 80% risk reduction multiplier
    riskPercentage = riskPercentage * 0.20;
  }

  riskPercentage = parseFloat(Math.min(100, Math.max(0, riskPercentage)).toFixed(1));

  const isHighRisk = fitnessPct < 50 || riskPercentage >= 20;

  let explanation = '';
  if (fitnessPct >= 90) {
    explanation = `Peak Fitness (${fitnessPct}%). Negligible injury risk (${riskPercentage}%).`;
  } else if (fitnessPct >= 75) {
    explanation = `Good condition (${fitnessPct}% Fitness). Low injury risk (${riskPercentage}%).`;
  } else if (fitnessPct >= 60) {
    explanation = `Managed workload (${fitnessPct}% Fitness). Controlled risk (${riskPercentage}%).`;
  } else if (fitnessPct >= 50) {
    explanation = `Moderate fatigue (${fitnessPct}% Fitness). Injury risk (${riskPercentage}%). Manager rotation recommended.`;
  } else {
    explanation = `HIGH INJURY RISK! (${fitnessPct}% Fitness). Severe fatigue (${riskPercentage}% risk). Rest required!`;
  }

  if (isInjuryProne) {
    explanation += ` [⚠️ Injury Prone Perk: +50% Risk]`;
  }
  if (hasIronBody) {
    explanation += ` [🛡️ Iron Body Perk: -25% Risk • 60% Fitness Floor]`;
  }
  if (totalProtectionPct > 0) {
    explanation += ` [🛡️ Protective Gear/Taping: -${Math.min(80, totalProtectionPct)}% Risk]`;
  }
  if (isPostInjuryProtected) {
    explanation += ` [🛡️ Post-Injury Rehab Shield (1 Month): -80% Risk]`;
  }

  return { riskPercentage, isHighRisk, explanation };
}

/**
 * Calculates Training Injury Risk (10% of normal Match Injury Risk)
 * Formula: Training Injury Risk = Match Injury Risk * 0.10
 */
export function calculateTrainingInjuryRisk(player: PlayerCardData): {
  matchRiskPercentage: number;
  trainingRiskPercentage: number;
  explanation: string;
} {
  const { riskPercentage: matchRiskPercentage } = calculateInjuryRisk(player);
  const trainingRiskPercentage = parseFloat((matchRiskPercentage * 0.10).toFixed(2));
  const explanation = `Training Injury Risk: ${trainingRiskPercentage}% (10% of Match Risk ${matchRiskPercentage}%).`;

  return {
    matchRiskPercentage,
    trainingRiskPercentage,
    explanation,
  };
}

/**
 * Determines the Starting XI requirement for the player's current youth or senior team.
 */
export function getTeamStartingXIRequirement(player: PlayerCardData): number {
  const teamName = player.youthLeagueTeam || player.youthTeamName || player.club;
  if (!teamName) return 50;

  // 1. Search youth leagues database
  for (const league of Object.values(YOUTH_LEAGUES_DATABASE)) {
    const youthTeam = league.teams?.find(
      (t) => t.name === teamName || t.id === teamName
    );
    if (youthTeam) {
      return youthTeam.ovr;
    }
  }

  return 50;
}

/**
 * Evaluates whether a player in Big Club Youth Career is restricted to substitute role.
 * Rule:
 * Players joining the Big Club through this Youth Career choice always begin as substitutes.
 * They remain substitutes until:
 * Chemistry = 100
 * Once Chemistry reaches 100:
 * - If player OVR > club/team starting XI requirement -> player becomes a starter.
 * - Otherwise -> player remains a substitute.
 * Do not automatically make the player a starter before 100 Chemistry.
 */
export function evaluateBigClubYouthStatus(player: PlayerCardData): {
  isBigClub: boolean;
  mustBeSubstitute: boolean;
  isStarter: boolean;
  startingXIRequirement: number;
  reason: string;
} {
  const isBigClub = Boolean(
    player.youthClubChoice === 'big_club' ||
    (player as any).isBigClubYouth ||
    player.youthAcademyTier === 'Youth Academy Top Tier' ||
    player.youthDevelopmentPoints === 20
  );

  if (!isBigClub) {
    return {
      isBigClub: false,
      mustBeSubstitute: false,
      isStarter: true,
      startingXIRequirement: 50,
      reason: 'Local or normal youth club: Eligible for starting role based on performance and fitness',
    };
  }

  const startingXIRequirement = getTeamStartingXIRequirement(player);
  const chem = typeof player.chemistry === 'number' && !isNaN(player.chemistry) ? player.chemistry : 50;
  const playerOvr = player.ovr || player.overallRating || 50;

  if (chem < 100) {
    return {
      isBigClub: true,
      mustBeSubstitute: true,
      isStarter: false,
      startingXIRequirement,
      reason: `Big Club Youth: Begins and remains as substitute until Chemistry reaches 100 (Current: ${Math.round(chem)}/100)`,
    };
  }

  // Chemistry = 100 reached!
  if (playerOvr > startingXIRequirement) {
    return {
      isBigClub: true,
      mustBeSubstitute: false,
      isStarter: true,
      startingXIRequirement,
      reason: `Big Club Youth: Chemistry reached 100 and OVR (${playerOvr}) exceeds Starting XI requirement (${startingXIRequirement}) — Promoted to Starter!`,
    };
  }

  return {
    isBigClub: true,
    mustBeSubstitute: true,
    isStarter: false,
    startingXIRequirement,
    reason: `Big Club Youth: Chemistry reached 100, but OVR (${playerOvr}) must be strictly greater than Starting XI requirement (${startingXIRequirement}) to start`,
  };
}

/**
 * Manager AI Selection & Squad Rotation System:
 * - Target: Keep players above 60% fitness through proactive squad rotation and tactical resting.
 * - Key Players: For the best-rated players in their positions, managers preserve their condition in
 *   routine domestic league/cup games to ensure 100% peak fitness for finals, semi-finals, quarter-finals,
 *   and high-stakes end-of-season fixtures.
 * - Rest & Rotation Logic:
 *   - Fitness >= 75%: Fresh player, starts ~95% of matches.
 *   - Fitness 60-74%:
 *       - In High-Stakes / Finals / Semis: Key Players always start (95%+) as they were saved for this!
 *       - In Routine Matches: Key Players are rotated more often (40% start with early sub, 40% sub, 20% bench rest)
 *         to maintain their >60% baseline.
 *   - Fitness < 60% (Protection Trigger):
 *       - In Routine Matches: Manager rests the player (65% benched, 30% late sub, 5% emergency start).
 *       - In High-Stakes Matches: Key Player starts or enters at 45' to chase the trophy (75% start/sub).
 *   - Fitness < 50%: Complete rest protected by manager (90% bench), unless override in crucial final.
 */
export function checkManagerSelection(
  player: PlayerCardData,
  isImportantMatch: boolean = false
): {
  canPlay: boolean;
  willBeSelected: boolean;
  recommendedStatus: 'starter' | 'sub' | 'bench';
  selectionChancePct: number;
  statusText: string;
} {
  if (player.isInjured) {
    return {
      canPlay: false,
      willBeSelected: false,
      recommendedStatus: 'bench',
      selectionChancePct: 0,
      statusText: `🚨 OUT: Injured (${player.injuryName || 'Injury'}, ${player.injuryWeeksRemaining || 1} wks left)`,
    };
  }

  const fitnessPct = getFitnessPercentage(player);
  const isKey = isKeyPlayer(player);
  let result: {
    canPlay: boolean;
    willBeSelected: boolean;
    recommendedStatus: 'starter' | 'sub' | 'bench';
    selectionChancePct: number;
    statusText: string;
  };

  if (fitnessPct >= 75) {
    // Peak condition: Regular start
    const willStart = Math.random() < 0.95;
    result = {
      canPlay: true,
      willBeSelected: true,
      recommendedStatus: willStart ? 'starter' : 'sub',
      selectionChancePct: 95,
      statusText: `✅ STARTING XI: Peak Condition (${fitnessPct}% Fitness)`,
    };
  } else if (fitnessPct >= 60) {
    // Condition between 60% and 74%: Manager AI Rotation Zone
    if (isImportantMatch) {
      // High-stakes tournament match (Final, Semi, Quarter): Key players unleashed!
      result = {
        canPlay: true,
        willBeSelected: true,
        recommendedStatus: 'starter',
        selectionChancePct: 95,
        statusText: isKey
          ? `🏆 KEY MATCH STARTER: Key player starting high-stakes fixture (${fitnessPct}% Fitness)`
          : `⚡ STARTING XI: Selected for important fixture (${fitnessPct}% Fitness)`,
      };
    } else {
      // Routine league / cup match: Protect and save Key Players
      if (isKey) {
        const roll = Math.random();
        if (roll < 0.45) {
          result = {
            canPlay: true,
            willBeSelected: true,
            recommendedStatus: 'starter',
            selectionChancePct: 45,
            statusText: `🟢 KEY PLAYER START: Manager starting star player with managed workload (${fitnessPct}% Fitness)`,
          };
        } else if (roll < 0.80) {
          result = {
            canPlay: true,
            willBeSelected: true,
            recommendedStatus: 'sub',
            selectionChancePct: 35,
            statusText: `🔄 SQUAD ROTATION: Saved as impact sub to preserve 60%+ condition for finals (${fitnessPct}% Fitness)`,
          };
        } else {
          result = {
            canPlay: true,
            willBeSelected: false,
            recommendedStatus: 'bench',
            selectionChancePct: 20,
            statusText: `🛡️ TACTICAL REST: Rested by Manager AI to save for tournament knockouts (${fitnessPct}% Fitness)`,
          };
        }
      } else {
        const roll = Math.random();
        const willStart = roll < 0.70;
        result = {
          canPlay: true,
          willBeSelected: true,
          recommendedStatus: willStart ? 'starter' : 'sub',
          selectionChancePct: 70,
          statusText: willStart
            ? `✅ STARTING XI: Selected (${fitnessPct}% Fitness)`
            : `🔄 ROTATION SUB: Manager rotating squad to balance fitness (${fitnessPct}% Fitness)`,
        };
      }
    }
  } else if (fitnessPct >= 50) {
    // Condition 50% - 59%: Sub-60% Protection Trigger
    if (isImportantMatch) {
      if (isKey) {
        result = {
          canPlay: true,
          willBeSelected: true,
          recommendedStatus: Math.random() < 0.75 ? 'starter' : 'sub',
          selectionChancePct: 75,
          statusText: `⚡ HIGH-STAKES START: Manager playing star player for decisive trophy fixture (${fitnessPct}% Fitness)`,
        };
      } else {
        const willPlay = Math.random() < 0.50;
        result = {
          canPlay: true,
          willBeSelected: willPlay,
          recommendedStatus: willPlay ? 'sub' : 'bench',
          selectionChancePct: 50,
          statusText: willPlay
            ? `⚠️ ROTATED SUB: Brought on for crucial tie (${fitnessPct}% Fitness)`
            : `🛡️ PROTECTED: Benched to prevent injury risk in sub-60% zone (${fitnessPct}% Fitness)`,
        };
      }
    } else {
      // Routine fixture: Manager AI rests player to climb back above 60%
      const roll = Math.random();
      if (roll < 0.15) {
        result = {
          canPlay: true,
          willBeSelected: true,
          recommendedStatus: 'starter',
          selectionChancePct: 15,
          statusText: `⚠️ RISKY START: Selected despite sub-60% fitness (${fitnessPct}% Fitness)`,
        };
      } else if (roll < 0.50) {
        result = {
          canPlay: true,
          willBeSelected: true,
          recommendedStatus: 'sub',
          selectionChancePct: 35,
          statusText: `🔄 LATE IMPACT SUB: Light 20-min workload to recover condition above 60% (${fitnessPct}% Fitness)`,
        };
      } else {
        result = {
          canPlay: true,
          willBeSelected: false,
          recommendedStatus: 'bench',
          selectionChancePct: 50,
          statusText: `🛡️ MANAGER AI REST: Benched to restore fitness above 60% (${fitnessPct}% Fitness)`,
        };
      }
    }
  } else {
    // Critical exhaustion (< 50% Fitness)
    if (isImportantMatch && isKey) {
      const willOverride = Math.random() < 0.60;
      result = {
        canPlay: true,
        willBeSelected: willOverride,
        recommendedStatus: willOverride ? 'starter' : 'bench',
        selectionChancePct: 60,
        statusText: willOverride
          ? `⚡ CRITICAL OVERRIDE: Star player starting vital final despite exhaustion (<50% Fitness)`
          : `⛔ RESTED: Too exhausted for selection (<50% Fitness)`,
      };
    } else {
      const willPlayBriefly = Math.random() < 0.10;
      result = {
        canPlay: true,
        willBeSelected: willPlayBriefly,
        recommendedStatus: willPlayBriefly ? 'sub' : 'bench',
        selectionChancePct: 10,
        statusText: willPlayBriefly
          ? `⚠️ EMERGENCY SUB: Late cameo despite severe exhaustion (<50% Fitness)`
          : `⛔ RESTED BY MANAGER: Protected from selection due to severe exhaustion (<50% Fitness)`,
      };
    }
  }

  // Enforce Big Club Youth selection rule:
  // Starts as substitute; remains substitute until Chemistry === 100.
  // Once Chemistry === 100: starts only if OVR > startingXIRequirement, otherwise remains substitute.
  const bigClubStatus = evaluateBigClubYouthStatus(player);
  if (bigClubStatus.isBigClub && bigClubStatus.mustBeSubstitute) {
    if (result.recommendedStatus === 'starter') {
      result.recommendedStatus = 'sub';
      result.statusText = `🔄 BIG CLUB YOUTH SUB: ${bigClubStatus.reason}`;
    }
  }

  return result;
}

/**
 * Generates random injury severity, grade, and duration:
 * - 5 Core Types: Hamstring, Groin, Ankle, Calf, Quadriceps (Grade I, II, III)
 * - Grave 6+ Months (24–40 weeks): ACL Tear, MCL Tear, Meniscus Tear, Achilles Tendon Rupture
 * - Catastrophic (52+ weeks): Knee Reconstruction
 */
export function generateRandomInjury(): InjuryDetails {
  const rand = Math.random() * 100;

  if (rand < 45) {
    // Grade I (Small: 1–3 weeks)
    const types = ['Hamstring', 'Groin', 'Ankle', 'Calf', 'Quadriceps'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    let name = '';
    let description = '';
    let weeks = 1;

    switch (type) {
      case 'Hamstring':
        weeks = Math.floor(Math.random() * 3) + 1;
        name = 'Grade I Hamstring Strain';
        description = 'Mild stretching of hamstring muscle fibers. Tightness and mild discomfort when sprinting.';
        break;
      case 'Groin':
        weeks = Math.floor(Math.random() * 3) + 1;
        name = 'Grade I Groin Strain';
        description = 'Minor strain of adductor tendon. Localized tenderness when striking the ball.';
        break;
      case 'Ankle':
        weeks = Math.floor(Math.random() * 2) + 1;
        name = 'Grade I Ankle Sprain';
        description = 'Mild stretching of anterior talofibular ligament with light localized swelling.';
        break;
      case 'Calf':
        weeks = Math.floor(Math.random() * 3) + 1;
        name = 'Grade I Calf Muscle Strain';
        description = 'Minor strain of soleus/gastrocnemius. Light stiffness during acceleration.';
        break;
      case 'Quadriceps':
        weeks = Math.floor(Math.random() * 3) + 1;
        name = 'Grade I Quadriceps Strain';
        description = 'Mild strain of rectus femoris muscle. Minor discomfort when executing long passes.';
        break;
    }
    const monthsText = `${weeks} ${weeks === 1 ? 'Week' : 'Weeks'} (~${(weeks / 4).toFixed(1)} Mo)`;
    return { name, type, grade: 'Grade I', weeks, monthsText, severity: 'Small', description };
  } else if (rand < 75) {
    // Grade II (Injury: 4–8 weeks)
    const types = ['Hamstring', 'Groin', 'Ankle', 'Calf', 'Quadriceps'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    let name = '';
    let description = '';
    const weeks = Math.floor(Math.random() * 5) + 4; // 4 to 8 weeks

    switch (type) {
      case 'Hamstring':
        name = 'Grade II Hamstring Strain';
        description = 'Partial tearing of hamstring muscle belly. Acute pain and swelling on explosive acceleration.';
        break;
      case 'Groin':
        name = 'Grade II Groin Pull';
        description = 'Moderate tear in adductor longus muscle. Sharp pain when pivoting or changing direction.';
        break;
      case 'Ankle':
        name = 'Grade II Ankle Ligament Strain';
        description = 'Partial ligament tear with significant joint swelling and localized bruising.';
        break;
      case 'Calf':
        name = 'Grade II Calf Muscle Tear';
        description = 'Partial tear of gastrocnemius muscle fibers. Inability to push off at top speed.';
        break;
      case 'Quadriceps':
        name = 'Grade II Quadriceps Tear';
        description = 'Significant partial tearing in quad muscle belly, severely limiting shot power.';
        break;
    }
    const monthsText = `${weeks} Weeks (~${(weeks / 4.3).toFixed(1)} Months)`;
    return { name, type, grade: 'Grade II', weeks, monthsText, severity: 'Injury', description };
  } else if (rand < 87.5) {
    // Grade III (Grave: 9–16 weeks)
    const types = ['Hamstring', 'Groin', 'Ankle', 'Calf', 'Quadriceps'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    let name = '';
    let description = '';
    const weeks = Math.floor(Math.random() * 8) + 9; // 9 to 16 weeks

    switch (type) {
      case 'Hamstring':
        name = 'Grade III Hamstring Tear';
        description = 'Severe full-thickness rupture of hamstring muscle fibers. Extended rehab required.';
        break;
      case 'Groin':
        name = 'Grade III Groin Adductor Tear';
        description = 'Severe adductor tendon rupture. Severely impairs lateral agility and ball striking.';
        break;
      case 'Ankle':
        name = 'Grade III High Ankle Sprain';
        description = 'Severe syndesmotic ligament disruption causing major joint instability.';
        break;
      case 'Calf':
        name = 'Grade III Deep Calf Rupture';
        description = 'Full-thickness tear of calf muscle complex requiring immobilized splinting.';
        break;
      case 'Quadriceps':
        name = 'Grade III Quad Tendon Rupture';
        description = 'Severe rupture of quadriceps tendon near patellar insertion.';
        break;
    }
    const monthsText = `${weeks} Weeks (~${(weeks / 4.3).toFixed(1)} Months)`;
    return { name, type, grade: 'Grade III', weeks, monthsText, severity: 'Grave', description };
  } else if (rand < 97.5) {
    // GRAVE / MAJOR (6+ Months / 24–40 weeks): ACL Tear, MCL Tear, Meniscus Tear, Achilles
    const graveChoice = Math.random() * 100;
    if (graveChoice < 35) {
      // ACL Tear
      const weeks = Math.floor(Math.random() * 11) + 26; // 26 to 36 weeks (6.5 to 9 months)
      const monthsText = `${weeks} Weeks (~${(weeks / 4.3).toFixed(1)} Months)`;
      return {
        name: 'Complete ACL Tear',
        type: 'ACL',
        grade: 'Grave (6+ Months)',
        weeks,
        monthsText,
        severity: 'Severe',
        description: 'Full-thickness rupture of Anterior Cruciate Ligament. Reconstructive knee surgery and 6.5–9 months rehabilitation required.',
      };
    } else if (graveChoice < 65) {
      // MCL Tear
      const weeks = Math.floor(Math.random() * 9) + 24; // 24 to 32 weeks (6 to 8 months)
      const monthsText = `${weeks} Weeks (~${(weeks / 4.3).toFixed(1)} Months)`;
      return {
        name: 'Grade III MCL Rupture',
        type: 'MCL',
        grade: 'Grave (6+ Months)',
        weeks,
        monthsText,
        severity: 'Severe',
        description: 'Complete tear of Medial Collateral Ligament causing medial knee joint instability. Bracing and 6–8 months physical therapy.',
      };
    } else if (graveChoice < 88) {
      // Meniscus Tear
      const weeks = Math.floor(Math.random() * 7) + 24; // 24 to 30 weeks (6 to 7.5 months)
      const monthsText = `${weeks} Weeks (~${(weeks / 4.3).toFixed(1)} Months)`;
      return {
        name: 'Complex Meniscus Tear',
        type: 'Meniscus',
        grade: 'Grave (6+ Months)',
        weeks,
        monthsText,
        severity: 'Severe',
        description: 'Severe bucket-handle tear of knee cartilage meniscus. Arthroscopic surgical suture repair and non-weight-bearing recovery.',
      };
    } else {
      // Achilles Rupture
      const weeks = Math.floor(Math.random() * 13) + 28; // 28 to 40 weeks (7 to 10 months)
      const monthsText = `${weeks} Weeks (~${(weeks / 4.3).toFixed(1)} Months)`;
      return {
        name: 'Ruptured Achilles Tendon',
        type: 'Achilles',
        grade: 'Grave (6+ Months)',
        weeks,
        monthsText,
        severity: 'Severe',
        description: 'Complete rupture of Achilles tendon. Surgical reattachment and extensive calf re-strengthening required.',
      };
    }
  } else {
    // CATASTROPHIC CAREER-ENDING RISK (52+ weeks / 12+ months)
    const weeks = Math.floor(Math.random() * 27) + 52;
    const monthsText = `${weeks} Weeks (~${(weeks / 4.3).toFixed(1)} Months)`;
    return {
      name: 'Catastrophic Multi-Ligament Knee Disruption',
      type: 'Catastrophic',
      grade: 'Catastrophic',
      weeks,
      monthsText,
      severity: 'Career-Ending',
      description: 'Total destruction of ACL, PCL, and collateral ligaments. Complex multi-stage knee reconstruction required.',
    };
  }
}

/**
 * Processes an injury for a player, attaching details and checking the
 * "Injury Prone" perk requirement (2 injuries in under 6 months -> +50% risk forever).
 */
export function processInjuryForPlayer(
  player: PlayerCardData,
  injuryDetails?: InjuryDetails
): { updatedPlayer: PlayerCardData; unlockedInjuryProne: boolean } {
  const inj = injuryDetails || generateRandomInjury();
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));

  const now = Date.now();
  let unlockedInjuryProne = false;

  // Check trigger condition: 2 injuries in under 6 months (< 180 days) OR a long-term injury (8+ weeks or Grade III/Severe)
  // Rule: Can only get the "Injury Prone" perk once per career run, with a 30% probability when triggered.
  const hasAlreadyHadPerk = Boolean(copy.hasHadInjuryPronePerk || copy.activePerkIds?.includes('injury_prone'));

  if (!hasAlreadyHadPerk) {
    const lastInjuryTime = copy.lastInjuryTimestamp;
    const elapsedDays = lastInjuryTime ? (now - lastInjuryTime) / (1000 * 60 * 60 * 24) : Infinity;
    const isInjuredTwiceIn6Months = elapsedDays < 180;
    const isLongTermInjury = Boolean(
      inj.weeks >= 8 ||
      inj.grade === 'Grade III' ||
      (inj.grade && (inj.grade.includes('Grave') || inj.grade.includes('Severe') || inj.grade.includes('Catastrophic')))
    );

    if (isInjuredTwiceIn6Months || isLongTermInjury) {
      // 30% chance to acquire the Injury Prone perk
      const roll = Math.random();
      if (roll < 0.30) {
        const active = [...(copy.activePerkIds || [])];
        if (!active.includes('injury_prone')) {
          if (active.length < 5) {
            active.push('injury_prone');
          } else {
            active[active.length - 1] = 'injury_prone';
          }
        }
        copy.activePerkIds = active;
        copy.hasHadInjuryPronePerk = true;
        unlockedInjuryProne = true;
        copy.justEarnedInjuryPronePerk = true;
      }
    }
  }

  copy.lastInjuryTimestamp = now;
  copy.isInjured = true;
  copy.healthStatus = 'injured';
  copy.injuryName = inj.name;
  copy.injuryWeeksRemaining = inj.weeks;
  copy.injuryTotalWeeks = inj.weeks;
  copy.injuryDetails = inj;
  copy.hasSeenInjuryModal = false;
  copy.hasSeenFitToPlayModal = false;
  copy.justRecoveredFromInjury = false;
  copy.isPostInjuryProtected = false;
  copy.postInjuryProtectionMonthsRemaining = 0;
  copy.postInjuryProtectionUntilTimestamp = undefined;

  if (inj.weeks >= 52) {
    copy.isCareerEndingRisk = true;
  }

  return { updatedPlayer: copy, unlockedInjuryProne };
}

/**
 * Calculates passive recovery points gained every 6 months based on permanent Stamina attribute
 */
export function calculatePassiveRecoveryPoints(staminaAttribute: number): number {
  return Math.floor(staminaAttribute / 30);
}

/**
 * STEP 1: Simulates Pre-Match Training Injury Check (happens BEFORE match simulation)
 * Training Injury Risk = Match Injury Risk * 0.10
 */
export function simulatePreMatchTrainingCheck(player: PlayerCardData): {
  updatedPlayer: PlayerCardData;
  trainingInjuryOccurred: boolean;
  injuryDetails?: InjuryDetails;
  message: string;
} {
  let copy: PlayerCardData = JSON.parse(JSON.stringify(player));

  if (copy.isInjured) {
    return {
      updatedPlayer: copy,
      trainingInjuryOccurred: false,
      message: `🔴 Player is currently injured (${copy.injuryName || 'Injury'}, ${copy.injuryWeeksRemaining || 1} wks left). Unavailable for training and match.`,
    };
  }

  const { trainingRiskPercentage } = calculateTrainingInjuryRisk(copy);
  const roll = Math.random() * 100;
  const trainingInjuryOccurred = roll < trainingRiskPercentage;

  if (trainingInjuryOccurred) {
    const injuryDetails = generateRandomInjury();
    const processed = processInjuryForPlayer(copy, injuryDetails);
    copy = processed.updatedPlayer;

    let message = '';
    if (injuryDetails.weeks >= 52) {
      message = `🏋️🩸 CRITICAL TRAINING INJURY! ${player.name} suffered a ${injuryDetails.name} during pre-match training! (${injuryDetails.weeks} weeks out, Career-Ending Risk! Unavailable for upcoming match)`;
    } else {
      message = `🏋️🚨 TRAINING INJURY SUFFERED! ${player.name} suffered a ${injuryDetails.severity} ${injuryDetails.name} during pre-match training! (${injuryDetails.weeks} weeks out, Unavailable for upcoming match)`;
    }

    return {
      updatedPlayer: copy,
      trainingInjuryOccurred: true,
      injuryDetails,
      message,
    };
  }

  return {
    updatedPlayer: copy,
    trainingInjuryOccurred: false,
    message: `🟢 Pre-Match Training completed safely (${trainingRiskPercentage}% risk). Cleared for upcoming match.`,
  };
}

/**
 * Simulates playing/participating in 1 match:
 * ORDER OF OPERATIONS:
 * STEP 1: Pre-Match Training Injury Check (unless skipTrainingCheck is true)
 * STEP 2: If injured in training -> Skip match, no match fitness consumption, non-playing recovery.
 * STEP 3: If healthy -> Determine match status, apply match fitness consumption.
 * STEP 4: If participating (starter / sub_entered) -> Roll for normal match injury.
 */
export function simulateMatchParticipation(
  player: PlayerCardData,
  matchStatus: MatchParticipationStatus = 'starter',
  minutesPlayed: number = 90,
  options?: { skipTrainingCheck?: boolean }
): {
  updatedPlayer: PlayerCardData;
  fitnessLost: number;
  recoveryGained: number;
  newFitness: number;
  injuryOccurred: boolean;
  injurySource?: 'training' | 'match';
  injuryDetails?: InjuryDetails;
  message: string;
} {
  let copy: PlayerCardData = JSON.parse(JSON.stringify(player));

  if (copy.isInjured) {
    // While injured: No match-playing Fitness consumption occurs! Non-playing recovery applies.
    const staminaAttr = getPermanentStamina(copy);
    const rec = calculateNonPlayingRecovery(staminaAttr);
    const currentFit = getFitnessPercentage(copy);
    const newFit = Math.min(100, currentFit + rec);
    copy.fitness = newFit;
    copy.staminaCurrent = newFit;

    return {
      updatedPlayer: copy,
      fitnessLost: 0,
      recoveryGained: rec,
      newFitness: newFit,
      injuryOccurred: false,
      message: `Injured player undergoing rehabilitation (${copy.injuryWeeksRemaining} weeks remaining). Recovered +${rec}% condition.`,
    };
  }

  // STEP 1: Pre-Match Training Injury Check
  if (!options?.skipTrainingCheck) {
    const trainingCheck = simulatePreMatchTrainingCheck(copy);
    if (trainingCheck.trainingInjuryOccurred) {
      copy = trainingCheck.updatedPlayer;
      // Training injury applied! Player cannot play match -> non-playing recovery applies, no match fitness loss.
      const staminaAttr = getPermanentStamina(copy);
      const rec = calculateNonPlayingRecovery(staminaAttr);
      const currentFit = getFitnessPercentage(copy);
      const newFit = Math.min(100, currentFit + rec);
      copy.fitness = newFit;
      copy.staminaCurrent = newFit;

      return {
        updatedPlayer: copy,
        fitnessLost: 0,
        recoveryGained: rec,
        newFitness: newFit,
        injuryOccurred: true,
        injurySource: 'training',
        injuryDetails: trainingCheck.injuryDetails,
        message: trainingCheck.message,
      };
    }
  }

  // STEP 2 & 3: Match Simulation & Fitness Change
  const staminaAttr = getPermanentStamina(copy);
  const currentFitness = getFitnessPercentage(copy);

  const { recoveryGained, fitnessLost, netChange } = calculateFitnessChangeByStatus(
    staminaAttr,
    matchStatus,
    minutesPlayed
  );

  const newFitness = Math.max(0, Math.min(100, parseFloat((currentFitness + netChange).toFixed(1))));

  copy.fitness = newFitness;
  copy.staminaCurrent = newFitness;

  // STEP 4: Match Injury Check ONLY if participating (starter or sub_entered)
  let injuryOccurred = false;
  let injuryDetails: InjuryDetails | undefined;
  let message = '';

  if (
    matchStatus === 'starter' ||
    matchStatus === 'sub_out' ||
    matchStatus === 'sub_in' ||
    matchStatus === 'sub_entered' ||
    matchStatus === 'sub'
  ) {
    // Pro Equipment Match Duration Step
    if (copy.activeEquipment && copy.activeEquipment.length > 0) {
      const { remainingEquipment, expiredEquipment } = stepProEquipmentMatchDuration(copy.activeEquipment);
      copy.activeEquipment = remainingEquipment;
      if (expiredEquipment.length > 0) {
        const expiredNames = expiredEquipment.map((e) => e.name).join(', ');
        message += ` [⏱️ Equipment Worn Out: ${expiredNames}]`;
      }
    }

    const { riskPercentage } = calculateInjuryRisk(copy);
    const roll = Math.random() * 100;
    injuryOccurred = roll < riskPercentage;

    if (injuryOccurred) {
      injuryDetails = generateRandomInjury();
      const processed = processInjuryForPlayer(copy, injuryDetails);
      copy = processed.updatedPlayer;

      if (injuryDetails.weeks >= 52) {
        message = `🩸 CRITICAL MATCH INJURY SUFFERED! ${player.name} suffered a ${injuryDetails.name}! Out for ${injuryDetails.weeks} weeks! Decision required! ` + message;
      } else {
        message = `🚨 MATCH INJURY SUFFERED! ${player.name} suffered a ${injuryDetails.severity} ${injuryDetails.name} during the match! Out for ${injuryDetails.weeks} weeks! ` + message;
      }
    } else {
      message = `⚽ Match completed (${matchStatus.toUpperCase()})! Net Fitness: ${newFitness}%. Injury avoided!` + message;
    }
  } else {
    message = `🟢 Non-playing matchday (${matchStatus.toUpperCase()}). Recovered +${recoveryGained}% Fitness (Current: ${newFitness}%).`;
  }

  return {
    updatedPlayer: copy,
    fitnessLost,
    recoveryGained,
    newFitness,
    injuryOccurred,
    injurySource: injuryOccurred ? 'match' : undefined,
    injuryDetails,
    message,
  };
}

/**
 * Handles decision prompt for a potentially career-ending injury (52+ weeks):
 * - 'retire': Sets isRetired = true
 * - 'recover': Reduces potential by 10 points, clears risk flag, player remains injured
 */
export function handleCareerEndingChoice(
  player: PlayerCardData,
  choice: 'retire' | 'recover'
): {
  updatedPlayer: PlayerCardData;
  message: string;
} {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  copy.isCareerEndingRisk = false;

  if (choice === 'retire') {
    copy.isRetired = true;
    return {
      updatedPlayer: copy,
      message: `💔 ${player.name} has announced immediate retirement following a catastrophic career-ending injury.`,
    };
  } else {
    const oldPotential = copy.potentialOvr || copy.ovr + 10;
    const newPotential = Math.max(30, oldPotential - 10);
    copy.potentialOvr = newPotential;

    return {
      updatedPlayer: copy,
      message: `💪 ${player.name} has chosen to focus on long-term recovery! Potential reduced from ${oldPotential} to ${newPotential}.`,
    };
  }
}

/**
 * Simulates days of rest/recovery between matches
 */
export function simulateDaysRest(
  player: PlayerCardData,
  restDays: number = 3.5
): {
  updatedPlayer: PlayerCardData;
  fitnessRecovered: number;
  newFitness: number;
  message: string;
} {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  const staminaAttr = getPermanentStamina(copy);
  const currentFitness = getFitnessPercentage(copy);

  if (copy.isInjured) {
    return {
      updatedPlayer: copy,
      fitnessRecovered: 0,
      newFitness: currentFitness,
      message: `Injured player undergoing rehabilitation (${copy.injuryWeeksRemaining} weeks remaining).`,
    };
  }

  const fitnessGained = calculateFitnessRecovery(staminaAttr, restDays);
  const newFitness = Math.min(100, parseFloat((currentFitness + fitnessGained).toFixed(1)));
  const fitnessRecovered = parseFloat((newFitness - currentFitness).toFixed(1));

  copy.fitness = newFitness;
  copy.staminaCurrent = newFitness;

  return {
    updatedPlayer: copy,
    fitnessRecovered,
    newFitness,
    message: `😴 ${restDays} days rest. Recovered +${fitnessRecovered}% Fitness (Current Fitness: ${newFitness}%).`,
  };
}

/**
 * Uses 1 Injury Recovery Point to heal 1 week of injury
 */
export function useRecoveryPoint(player: PlayerCardData): {
  updatedPlayer: PlayerCardData;
  success: boolean;
  message: string;
} {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  const pts = copy.recoveryPoints || 0;

  if (pts <= 0) {
    return {
      updatedPlayer: copy,
      success: false,
      message: 'No Recovery Points available.',
    };
  }

  if (!copy.isInjured || (copy.injuryWeeksRemaining || 0) <= 0) {
    return {
      updatedPlayer: copy,
      success: false,
      message: 'Player is not currently injured!',
    };
  }

  copy.recoveryPoints = pts - 1;
  const totalWeeks = copy.injuryTotalWeeks || copy.injuryWeeksRemaining || 1;
  const weeksToReduce = Math.max(1, Math.round(totalWeeks * 0.10));
  const newRemaining = Math.max(0, (copy.injuryWeeksRemaining || 1) - weeksToReduce);
  copy.injuryWeeksRemaining = newRemaining;

  const passedWeeks = Math.max(0, totalWeeks - newRemaining);
  const recoveryProgressPct = Math.min(100, Math.round((passedWeeks / totalWeeks) * 100));

  if (newRemaining <= 0 || recoveryProgressPct >= 100) {
    const baseFit = hasIronBodyPerk(copy) ? 60 : 50;
    copy.isInjured = false;
    copy.healthStatus = 'healthy';
    copy.injuryWeeksRemaining = 0;
    copy.injuryName = undefined;
    copy.isCareerEndingRisk = false;
    copy.fitness = baseFit; // Fitness starts at 60% with Iron Body (or 50% default) upon recovery!
    copy.staminaCurrent = baseFit;
    copy.justRecoveredFromInjury = true;
    copy.hasSeenFitToPlayModal = false;
    copy.isPostInjuryProtected = true;
    copy.postInjuryProtectionMonthsRemaining = 1;
    copy.postInjuryProtectionUntilTimestamp = Date.now() + 30 * 24 * 60 * 60 * 1000;
    return {
      updatedPlayer: copy,
      success: true,
      message: `🎉 You're fit to play again! ${player.name} is fully recovered and status is HEALTHY. Fitness starts at ${baseFit}%! 80% Post-Injury Risk Reduction active for 1 month.`,
    };
  }

  return {
    updatedPlayer: copy,
    success: true,
    message: `⚡ Used 1 Recovery Point (+10% Recovery Progress)! ${newRemaining} weeks remaining (${recoveryProgressPct}% Healed).`,
  };
}

/**
 * Simulates 1 week of rest/rehabilitation
 */
export function simulateWeekRest(player: PlayerCardData): {
  updatedPlayer: PlayerCardData;
  message: string;
} {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  if (copy.isInjured) {
    const totalWeeks = copy.injuryTotalWeeks || copy.injuryWeeksRemaining || 1;
    copy.injuryWeeksRemaining = Math.max(0, (copy.injuryWeeksRemaining || 1) - 1);
    if (copy.injuryWeeksRemaining === 0) {
      copy.isInjured = false;
      copy.healthStatus = 'healthy';
      copy.injuryName = undefined;
      copy.isCareerEndingRisk = false;
      copy.fitness = 50; // Starts at 50% fitness
      copy.staminaCurrent = 50;
      copy.justRecoveredFromInjury = true;
      copy.hasSeenFitToPlayModal = false;
      copy.isPostInjuryProtected = true;
      copy.postInjuryProtectionMonthsRemaining = 1;
      copy.postInjuryProtectionUntilTimestamp = Date.now() + 30 * 24 * 60 * 60 * 1000;
      return {
        updatedPlayer: copy,
        message: `🏥 Rehabilitation completed! You're fit to play again! Status is HEALTHY. Fitness starts at 50%! 80% Post-Injury Risk Reduction active for 1 month.`,
      };
    }
    const passed = Math.max(0, totalWeeks - copy.injuryWeeksRemaining);
    const recPct = Math.min(100, Math.round((passed / totalWeeks) * 100));
    return {
      updatedPlayer: copy,
      message: `🏥 1 week of rehab completed (${recPct}% Recovered). Injury remaining: ${copy.injuryWeeksRemaining} weeks.`,
    };
  }

  const res = simulateDaysRest(player, 7);
  return {
    updatedPlayer: res.updatedPlayer,
    message: res.message,
  };
}

/**
 * Applies 6-month bi-annual passive recovery point accumulation
 */
export function applyBiAnnualPassiveRecovery(player: PlayerCardData): {
  updatedPlayer: PlayerCardData;
  pointsAdded: number;
  message: string;
} {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  const staminaAttr = getPermanentStamina(copy);
  const ptsAdded = calculatePassiveRecoveryPoints(staminaAttr);

  copy.recoveryPoints = (copy.recoveryPoints || 0) + ptsAdded;
  // 6-Month Physio Check passes 6 months = +60 chemistry (+10/month, max 100 or active stacked ceiling)
  const ceilingInfo = getActiveChemistryCeiling(copy);
  const maxAllowed = ceilingInfo.hasCeiling ? ceilingInfo.effectiveCeiling : 100;
  copy.chemistry = Math.min(maxAllowed, (copy.chemistry ?? 50) + 60);

  return {
    updatedPlayer: copy,
    pointsAdded: ptsAdded,
    message: `📅 6-Month Physio Check: Earned +${ptsAdded} Recovery Points based on ${staminaAttr} Stamina attribute! Total Points: ${copy.recoveryPoints}.`,
  };
}

/**
 * Resets Fitness to 100% at the start of a new season.
 * Permanent Stamina attribute is preserved.
 */
export function resetFitnessForNewSeason(player: PlayerCardData): PlayerCardData {
  return {
    ...player,
    fitness: 100,
    staminaCurrent: 100,
  };
}
