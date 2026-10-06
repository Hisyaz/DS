import { PlayerCardData, Nationality } from '../types';
import { NationalTeamTier, Confederation, InternationalCallUp } from '../types/nationalTeam';
export type { NationalTeamTier };
import { TOP_50_NATIONAL_TEAMS_SEEDS } from '../data/top50NationalTeamsData';
import { NATIONAL_MANAGERS, getEligibleNationalities } from './nationalTeamSystem';
import { isTop20NationalTeam, checkU17QualifiersEligibility, checkU17WorldCupEligibility } from './u17NationalTeamEngine';
import { checkU20QualifiersEligibility, checkU20WorldCupEligibility, getNationFifaRank } from './u20NationalTeamEngine';
import { isProfessionalPlayer } from './playerIdentitySystem';
import {
  getNationalTournamentConfig,
  buildQualifiedParticipantsPool,
  generateNationalTournamentDraw,
  NationalTournamentConfig,
  NationalTournamentState,
} from './nationalTournamentManager';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { getWorldSimulationState, saveWorldSimulationState } from './worldSimulationEngine';
import { getYearlyAwardData, saveYearlyAwardData } from './yearlyAwardDataSystem';
import { getNationalTeamsDatabase } from './nationalTeamDatabaseManager';
import { DrawNewsItem } from './drawNewsSystem';

export interface ScheduledInternationalCompetition {
  tier: NationalTeamTier;
  type: 'qualifier' | 'tournament';
  competitionName: string;
  shortName: string;
  seasonYear: number;
  isWorldCup: boolean;
  isContinental: boolean;
  timing: 'pre_season' | 'mid_season' | 'end_season';
  confederation?: Confederation;
}

export interface CallUpEvaluationResult {
  isEligible: boolean;
  reason: string;
  callUp: InternationalCallUp | null;
  callingNation: Nationality | null;
  role: 'Key Starter' | 'Squad Player' | 'Promising Prospect';
  minOvrRequired: number;
  starterOvrRequired: number;
  isNationQualified: boolean;
}

export interface BackgroundTournamentResult {
  competitionName: string;
  shortName: string;
  tier: NationalTeamTier;
  seasonYear: number;
  champion: { name: string; code: string; iso: string };
  runnerUp: { name: string; code: string; iso: string };
  thirdPlace: { name: string; code: string; iso: string };
  finalScore: string;
  mvp: { name: string; nation: string; nationCode: string; club: string; rating: number; goals: number; assists: number };
  topScorer: { name: string; nation: string; nationCode: string; club: string; goals: number };
  bestAssister: { name: string; nation: string; nationCode: string; club: string; assists: number };
  goldenGlove: { name: string; nation: string; nationCode: string; cleanSheets: number };
  headline: string;
  summaryArticle: string;
  timestamp: number;
}

/**
 * Returns the scheduled international competition for the given calendar year and player status.
 * Covers U17, U20, and Senior across Qualifiers and Tournaments.
 */
/**
 * Returns all scheduled international competitions for the given calendar year and player status.
 * Covers U17 (December mid-season), and U20 / Senior (July end-season after winter block).
 */
export function getScheduledInternationalCompetitions(
  seasonYear: number,
  playerAge: number,
  isPro: boolean,
  timing: 'pre_season' | 'mid_season' | 'end_season',
  preferredConfederation: Confederation = 'UEFA'
): ScheduledInternationalCompetition[] {
  const list: ScheduledInternationalCompetition[] = [];

  // 1. PRE-SEASON (Before Block 1): Qualifiers Window
  if (timing === 'pre_season') {
    if (playerAge <= 16) {
      list.push({
        tier: 'U17',
        type: 'qualifier',
        competitionName: 'FIFA U-17 World Cup Continental Qualifiers',
        shortName: 'U17 Qualifiers',
        seasonYear,
        isWorldCup: true,
        isContinental: true,
        timing: 'pre_season',
      });
    }
    if (playerAge >= 17 && playerAge <= 19) {
      list.push({
        tier: 'U20',
        type: 'qualifier',
        competitionName: 'FIFA U-20 World Cup Continental Qualifiers',
        shortName: 'U20 Qualifiers',
        seasonYear,
        isWorldCup: true,
        isContinental: true,
        timing: 'pre_season',
      });
    }
    if (isPro || playerAge >= 17) {
      const isWcQualYear = (seasonYear + 1) % 4 === 2 || (seasonYear + 2) % 4 === 2;
      if (isWcQualYear) {
        const isConmebol = preferredConfederation === 'CONMEBOL';
        list.push({
          tier: 'Senior',
          type: 'qualifier',
          competitionName: isConmebol ? 'CONMEBOL Eliminatorias' : 'FIFA World Cup European Qualifiers',
          shortName: isConmebol ? 'Eliminatorias' : 'WC Qualifiers',
          seasonYear,
          isWorldCup: true,
          isContinental: isConmebol,
          timing: 'pre_season',
        });
      } else {
        list.push({
          tier: 'Senior',
          type: 'qualifier',
          competitionName: preferredConfederation === 'CONMEBOL' ? 'CONMEBOL Copa América Qualifiers' : 'UEFA European Championship Qualifiers',
          shortName: 'Continental Qualifiers',
          seasonYear,
          isWorldCup: false,
          isContinental: true,
          timing: 'pre_season',
        });
      }
    }
    return list;
  }

  // 2. MID-SEASON (Between Block 1 & Block 2): U-17 World Cup Window (December)
  // ONLY the U-17 World Cup takes place around December replacing the mid-season stop.
  if (timing === 'mid_season') {
    if (playerAge >= 14 && playerAge <= 17) {
      list.push({
        tier: 'U17',
        type: 'tournament',
        competitionName: 'FIFA U-17 World Cup Final Stage',
        shortName: 'U-17 World Cup',
        seasonYear,
        isWorldCup: true,
        isContinental: false,
        timing: 'mid_season',
      });
    }
    return list;
  }

  // 3. END OF SEASON (After Block 2 / July Window): U-20 World Cup & Senior Major Tournaments
  // Both U20 World Cup and Senior World Cup / Continental championships play in July
  // after the winter block is already simulated, appearing before the season summary.
  if (timing === 'end_season') {
    // Senior World Cup or Continental Championship
    const isWcYear = seasonYear % 4 === 2 || seasonYear === 2026 || seasonYear === 2030 || seasonYear === 2034 || seasonYear === 2038 || seasonYear === 2042;
    if (isWcYear) {
      list.push({
        tier: 'Senior',
        type: 'tournament',
        competitionName: 'FIFA World Cup Final Stage',
        shortName: 'World Cup',
        seasonYear,
        isWorldCup: true,
        isContinental: false,
        timing: 'end_season',
      });
    } else {
      const isContinentalYear = seasonYear % 4 === 0 || seasonYear === 2028 || seasonYear === 2032 || seasonYear === 2036 || seasonYear === 2040;
      if (isContinentalYear || isPro) {
        let compName = 'UEFA European Championship';
        let shortName = 'Euro';
        if (preferredConfederation === 'CONMEBOL') {
          compName = 'CONMEBOL Copa América';
          shortName = 'Copa América';
        } else if (preferredConfederation === 'CAF') {
          compName = 'CAF Africa Cup of Nations';
          shortName = 'AFCON';
        } else if (preferredConfederation === 'AFC') {
          compName = 'AFC Asian Cup';
          shortName = 'Asian Cup';
        }
        list.push({
          tier: 'Senior',
          type: 'tournament',
          competitionName: compName,
          shortName,
          seasonYear,
          isWorldCup: false,
          isContinental: true,
          timing: 'end_season',
        });
      }
    }

    // FIFA U-20 World Cup in July (for youth and pro players aged 17-20)
    if (playerAge >= 17 && playerAge <= 20) {
      list.push({
        tier: 'U20',
        type: 'tournament',
        competitionName: 'FIFA U-20 World Cup Final Stage',
        shortName: 'U-20 World Cup',
        seasonYear,
        isWorldCup: true,
        isContinental: false,
        timing: 'end_season',
      });
    }

    return list;
  }

  return list;
}

/**
 * Returns the primary scheduled international competition for the given calendar year and player status.
 * Covers U17 (December mid-season), and U20 / Senior (July end-season after winter block).
 */
export function getScheduledInternationalCompetition(
  seasonYear: number,
  playerAge: number,
  isPro: boolean,
  timing: 'pre_season' | 'mid_season' | 'end_season',
  preferredConfederation: Confederation = 'UEFA'
): ScheduledInternationalCompetition | null {
  const comps = getScheduledInternationalCompetitions(seasonYear, playerAge, isPro, timing, preferredConfederation);
  return comps[0] || null;
}

/**
 * Senior OVR thresholds based on FIFA Ranking tier:
 * - Top 10 nation: Min 80 OVR (Starter 84+)
 * - Rank 11-20: Min 76 OVR (Starter 80+)
 * - Rank 21-50: Min 72 OVR (Starter 76+)
 * - Rank 51+: Min 68 OVR (Starter 72+)
 */
export function getSeniorOvrThresholds(rank: number): { minOvr: number; starterOvr: number; tierLabel: string } {
  if (rank <= 10) {
    return { minOvr: 80, starterOvr: 84, tierLabel: 'Top 10 Nation' };
  }
  if (rank <= 20) {
    return { minOvr: 76, starterOvr: 80, tierLabel: 'Rank 11–20 Nation' };
  }
  if (rank <= 50) {
    return { minOvr: 72, starterOvr: 76, tierLabel: 'Rank 21–50 Nation' };
  }
  return { minOvr: 68, starterOvr: 72, tierLabel: 'Rank 51+ Nation' };
}

/**
 * Checks whether a nation is qualified for the given tournament.
 */
export function isNationQualifiedForTournament(
  nationCode: string,
  competitionName: string,
  seasonYear: number,
  tier: NationalTeamTier
): boolean {
  try {
    const config = getNationalTournamentConfig(competitionName, nationCode, tier);
    const pool = buildQualifiedParticipantsPool(config, nationCode);
    return pool.some((n) => n.code.toUpperCase() === nationCode.toUpperCase());
  } catch (err) {
    return true; // Safe fallback
  }
}

/**
 * Comprehensive evaluator that checks if a player fulfills requirements for an international call-up.
 * Triggers before qualifiers and before tournaments.
 */
export function evaluateNationalTeamCallUp(
  player: PlayerCardData,
  competition: ScheduledInternationalCompetition
): CallUpEvaluationResult {
  const age = player.age || 16;
  const playerOvr = player.ovr || player.overallRating || 65;
  const tier = competition.tier;
  const isQual = competition.type === 'qualifier';

  const eligibleNats = getEligibleNationalities(player);
  if (!eligibleNats || eligibleNats.length === 0) {
    return {
      isEligible: false,
      reason: 'No eligible nationalities registered.',
      callUp: null,
      callingNation: null,
      role: 'Promising Prospect',
      minOvrRequired: 75,
      starterOvrRequired: 80,
      isNationQualified: false,
    };
  }

  // Filter out nations declined by player for this tier
  const declinedNations = player.declinedInternationalCallUps?.[tier] || [];
  const candidateNations = eligibleNats.filter(
    (n) => !declinedNations.includes(n.code.toUpperCase())
  );

  if (candidateNations.length === 0) {
    return {
      isEligible: false,
      reason: `All eligible nationalities have been declined for ${tier} international duty.`,
      callUp: null,
      callingNation: null,
      role: 'Promising Prospect',
      minOvrRequired: 75,
      starterOvrRequired: 80,
      isNationQualified: false,
    };
  }

  // If senior-locked, player can only represent their locked nation
  let activeCandidates = [...candidateNations];
  if (tier === 'Senior' && player.isSeniorLocked && player.seniorNation) {
    const locked = candidateNations.find(
      (n) => n.name.toLowerCase() === player.seniorNation?.toLowerCase() || n.code.toUpperCase() === player.seniorNation?.toUpperCase()
    );
    if (locked) {
      activeCandidates = [locked];
    } else {
      return {
        isEligible: false,
        reason: `Player is senior-locked to ${player.seniorNation}, which is not eligible.`,
        callUp: null,
        callingNation: null,
        role: 'Promising Prospect',
        minOvrRequired: 75,
        starterOvrRequired: 80,
        isNationQualified: false,
      };
    }
  }

  // Evaluate candidate nations in order of priority (active nation first, then by rank)
  for (const cand of activeCandidates) {
    const rank = getNationFifaRank(cand.code, cand.name);

    // ================= U17 EVALUATION =================
    if (tier === 'U17') {
      if (age > 17) continue;

      if (isQual) {
        const u17Res = checkU17QualifiersEligibility(player, cand);
        if (u17Res.isEligible) {
          const mgr = NATIONAL_MANAGERS[cand.code]?.name || `${cand.name} U17 Head Coach`;
          const callUp: InternationalCallUp = {
            id: `callup-${cand.code}-U17-qual-${competition.seasonYear}-${Date.now()}`,
            nation: cand,
            tier: 'U17',
            competitionName: competition.competitionName,
            managerName: mgr,
            role: u17Res.role,
            bonusFame: 40,
            date: `June ${competition.seasonYear}`,
            isSeniorLockWarning: false,
          };
          return {
            isEligible: true,
            reason: `Meets U17 Qualifiers threshold (${u17Res.minOvrNeeded}+ OVR). Selected as ${u17Res.role}.`,
            callUp,
            callingNation: cand,
            role: u17Res.role,
            minOvrRequired: u17Res.minOvrNeeded,
            starterOvrRequired: u17Res.starterOvrNeeded,
            isNationQualified: true,
          };
        }
      } else {
        const isQualified = Boolean(player.u17Qualified) || isNationQualifiedForTournament(cand.code, competition.competitionName, competition.seasonYear, 'U17');
        const u17Res = checkU17WorldCupEligibility(player, cand, isQualified);
        if (u17Res.isEligible) {
          const mgr = NATIONAL_MANAGERS[cand.code]?.name || `${cand.name} U17 Head Coach`;
          const callUp: InternationalCallUp = {
            id: `callup-${cand.code}-U17-wc-${competition.seasonYear}-${Date.now()}`,
            nation: cand,
            tier: 'U17',
            competitionName: competition.competitionName,
            managerName: mgr,
            role: u17Res.role,
            bonusFame: 60,
            date: `July ${competition.seasonYear}`,
            isSeniorLockWarning: false,
          };
          return {
            isEligible: true,
            reason: `Meets U17 World Cup criteria (${u17Res.minOvrNeeded}+ OVR). Selected as ${u17Res.role}.`,
            callUp,
            callingNation: cand,
            role: u17Res.role,
            minOvrRequired: u17Res.minOvrNeeded,
            starterOvrRequired: u17Res.starterOvrNeeded,
            isNationQualified: true,
          };
        }
      }
    }

    // ================= U20 EVALUATION =================
    if (tier === 'U20') {
      if (age > 20) continue;

      if (isQual) {
        const u20Res = checkU20QualifiersEligibility(player, cand);
        if (u20Res.isEligible) {
          const mgr = NATIONAL_MANAGERS[cand.code]?.name || `${cand.name} U20 Head Coach`;
          const callUp: InternationalCallUp = {
            id: `callup-${cand.code}-U20-qual-${competition.seasonYear}-${Date.now()}`,
            nation: cand,
            tier: 'U20',
            competitionName: competition.competitionName,
            managerName: mgr,
            role: u20Res.role,
            bonusFame: 60,
            date: `June ${competition.seasonYear}`,
            isSeniorLockWarning: false,
          };
          return {
            isEligible: true,
            reason: u20Res.reason || `Selected for ${cand.name} U20 squad (${u20Res.requiredOvr}+ OVR threshold met).`,
            callUp,
            callingNation: cand,
            role: u20Res.role,
            minOvrRequired: u20Res.requiredOvr,
            starterOvrRequired: u20Res.starterOvr,
            isNationQualified: true,
          };
        }
      } else {
        const isQualified = Boolean(player.u20Qualified) || isNationQualifiedForTournament(cand.code, competition.competitionName, competition.seasonYear, 'U20');
        const u20Res = checkU20WorldCupEligibility(player, cand, isQualified);
        if (u20Res.isEligible) {
          const mgr = NATIONAL_MANAGERS[cand.code]?.name || `${cand.name} U20 Head Coach`;
          const callUp: InternationalCallUp = {
            id: `callup-${cand.code}-U20-wc-${competition.seasonYear}-${Date.now()}`,
            nation: cand,
            tier: 'U20',
            competitionName: competition.competitionName,
            managerName: mgr,
            role: u20Res.role,
            bonusFame: 100,
            date: `July ${competition.seasonYear}`,
            isSeniorLockWarning: false,
          };
          return {
            isEligible: true,
            reason: u20Res.reason || `Selected for ${cand.name} U20 World Cup roster.`,
            callUp,
            callingNation: cand,
            role: u20Res.role,
            minOvrRequired: u20Res.requiredOvr,
            starterOvrRequired: u20Res.starterOvr,
            isNationQualified: true,
          };
        }
      }
    }

    // ================= SENIOR EVALUATION =================
    if (tier === 'Senior') {
      const thresholds = getSeniorOvrThresholds(rank);

      // Check OVR requirement
      if (playerOvr >= thresholds.minOvr) {
        const role: 'Key Starter' | 'Squad Player' = playerOvr >= thresholds.starterOvr ? 'Key Starter' : 'Squad Player';

        // Check nation qualification if it's a tournament
        let isQualified = true;
        if (!isQual) {
          isQualified = isNationQualifiedForTournament(cand.code, competition.competitionName, competition.seasonYear, 'Senior');
        }

        if (isQualified) {
          const mgr = NATIONAL_MANAGERS[cand.code]?.name || `${cand.name} National Team Head Coach`;
          const callUp: InternationalCallUp = {
            id: `callup-${cand.code}-Senior-${competition.seasonYear}-${Date.now()}`,
            nation: cand,
            tier: 'Senior',
            competitionName: competition.competitionName,
            managerName: mgr,
            role,
            bonusFame: isQual ? 200 : 350,
            date: `June/July ${competition.seasonYear}`,
            isSeniorLockWarning: !player.isSeniorLocked,
          };

          return {
            isEligible: true,
            reason: `Selected for ${cand.name} Senior squad! OVR ${playerOvr} meets ${thresholds.tierLabel} standard (${thresholds.minOvr}+).`,
            callUp,
            callingNation: cand,
            role,
            minOvrRequired: thresholds.minOvr,
            starterOvrRequired: thresholds.starterOvr,
            isNationQualified: true,
          };
        }
      }
    }
  }

  // Not eligible for any candidate nation
  const firstCand = activeCandidates[0];
  const firstRank = getNationFifaRank(firstCand.code, firstCand.name);
  const thresholds = tier === 'Senior'
    ? getSeniorOvrThresholds(firstRank)
    : { minOvr: tier === 'U17' ? 70 : 78, starterOvr: tier === 'U17' ? 74 : 81, tierLabel: `${tier} Standard` };

  return {
    isEligible: false,
    reason: `Current OVR (${playerOvr}) does not reach the required ${thresholds.minOvr} threshold for ${firstCand.name} (${thresholds.tierLabel}).`,
    callUp: null,
    callingNation: firstCand,
    role: 'Promising Prospect',
    minOvrRequired: thresholds.minOvr,
    starterOvrRequired: thresholds.starterOvr,
    isNationQualified: false,
  };
}

/**
 * Resolves top squad players from the authentic national teams database.
 * GUARANTEE: Uses only database players and authentic procedural squads.
 * Never uses placeholder external names (e.g. Messi, etc.) that do not exist in the database.
 */
function getDatabaseStarsForNation(
  nationCode: string,
  tier: NationalTeamTier = 'Senior'
): { name: string; club: string; rating: number; position: string; subPosition?: string }[] {
  try {
    const db = getNationalTeamsDatabase();
    const team = db.find((t) => t.nation.code.toUpperCase() === nationCode.toUpperCase());
    if (team) {
      const squad = tier === 'U17' && team.u17Squad && team.u17Squad.length > 0
        ? team.u17Squad
        : tier === 'U20' && team.u20Squad && team.u20Squad.length > 0
        ? team.u20Squad
        : team.squad;

      if (squad && squad.length > 0) {
        return squad
          .map((p) => ({
            name: p.name,
            club: p.club || `${team.nation.name} FC`,
            rating: p.overallRating || p.ovr || 80,
            position: p.position || 'FWD',
            subPosition: p.subPosition,
          }))
          .sort((a, b) => b.rating - a.rating);
      }
    }
  } catch (err) {
    console.warn('[getDatabaseStarsForNation] Failed to load squad from DB:', err);
  }
  return [];
}

/**
 * Simulates a full background tournament when the player is NOT called up or declines.
 * Generates Champion, Runner-up, Third Place, Final Score, MVP, Top Scorer, and Best Assister
 * using exclusively genuine database squad players and genuine power rankings.
 * Feeds results into world simulation state and yearly awards.
 */
export function simulateBackgroundNationalTournament(
  competitionName: string,
  seasonYear: number,
  playerNationCode: string = 'ENG'
): BackgroundTournamentResult {
  const config = getNationalTournamentConfig(competitionName, playerNationCode, 'Senior');
  const pool = buildQualifiedParticipantsPool(config, playerNationCode);

  // Sort nations by simulated team power (combination of OVR + rank)
  const ranked = [...pool].sort((a, b) => {
    const powerA = a.ovr + (100 - (a.rank || 50)) * 0.2 + (Math.random() * 8 - 4);
    const powerB = b.ovr + (100 - (b.rank || 50)) * 0.2 + (Math.random() * 8 - 4);
    return powerB - powerA;
  });

  const championNation = ranked[0];
  const runnerUpNation = ranked[1];
  const thirdPlaceNation = ranked[2] || ranked[0];

  // Final score generation
  const homeGoals = Math.floor(Math.random() * 3) + 1;
  const awayGoals = Math.max(0, homeGoals - (Math.random() > 0.4 ? 1 : 2));
  const finalScore = `${championNation.name} ${homeGoals} - ${awayGoals} ${runnerUpNation.name}`;

  // Authentic squad stars from database
  const champStars = getDatabaseStarsForNation(championNation.code, config.tier);
  const runnerStars = getDatabaseStarsForNation(runnerUpNation.code, config.tier);

  const champTopAttacker = champStars.find((p) => ['ST', 'CF', 'LW', 'RW', 'FWD'].includes(p.position)) || champStars[0] || {
    name: `${championNation.name} Star Striker`,
    club: `${championNation.name} FC`,
    rating: championNation.ovr + 2,
    position: 'ST',
  };

  const champTopMidfielder = champStars.find((p) => ['CAM', 'CM', 'LM', 'RM', 'MID'].includes(p.position)) || champStars[1] || champTopAttacker;

  const runnerTopAttacker = runnerStars.find((p) => ['ST', 'CF', 'LW', 'RW', 'FWD'].includes(p.position)) || runnerStars[0] || {
    name: `${runnerUpNation.name} Star Striker`,
    club: `${runnerUpNation.name} FC`,
    rating: runnerUpNation.ovr + 1,
    position: 'ST',
  };

  const runnerTopMidfielder = runnerStars.find((p) => ['CAM', 'CM', 'LM', 'RM', 'MID'].includes(p.position)) || runnerStars[1] || runnerTopAttacker;

  // Select MVP (Golden Ball) from Champion or Runner Up
  const mvpCandidate = Math.random() > 0.25 ? champTopAttacker : runnerTopMidfielder;
  const mvpNation = mvpCandidate === champTopAttacker ? championNation : runnerUpNation;
  const mvpGoals = Math.floor(Math.random() * 4) + 3;
  const mvpAssists = Math.floor(Math.random() * 3) + 2;

  // Top Scorer (Golden Boot)
  const topScorerGoals = Math.max(mvpGoals, Math.floor(Math.random() * 3) + 5);
  const topScorerCandidate = Math.random() > 0.4 ? champTopAttacker : runnerTopAttacker;
  const topScorerNation = topScorerCandidate === champTopAttacker ? championNation : runnerUpNation;

  // Best Assister (Playmaker)
  const bestAssists = Math.floor(Math.random() * 2) + 4;
  const assistCandidate = runnerTopMidfielder || champTopMidfielder;
  const assistNation = assistCandidate === runnerTopMidfielder ? runnerUpNation : championNation;

  // Golden Glove Goalkeeper
  const gkCleanSheets = Math.floor(Math.random() * 2) + 3;
  const gkCandidate = champStars.find((s) => s.position === 'GK') || {
    name: `${championNation.name} Goalkeeper`,
    club: `${championNation.name} FC`,
    rating: championNation.ovr,
    position: 'GK',
  };

  // Best Defender
  const defCandidate = champStars.find((s) => ['CB', 'LB', 'RB', 'DEF'].includes(s.position)) || {
    name: `${championNation.name} Defender`,
    club: `${championNation.name} FC`,
    rating: championNation.ovr,
    position: 'CB',
  };

  const headline = `${championNation.name.toUpperCase()} CROWNED ${config.competitionName.toUpperCase()} CHAMPIONS!`;
  const summaryArticle = `${championNation.name} has claimed the ${config.competitionName} title after defeating ${runnerUpNation.name} in an electrifying final. ${mvpCandidate.name} was officially awarded the Golden Ball as Player of the Tournament, while ${topScorerCandidate.name} clinched the Golden Boot with ${topScorerGoals} goals.`;

  const result: BackgroundTournamentResult = {
    competitionName: config.competitionName,
    shortName: config.shortName,
    tier: config.tier,
    seasonYear,
    champion: { name: championNation.name, code: championNation.code, iso: championNation.iso },
    runnerUp: { name: runnerUpNation.name, code: runnerUpNation.code, iso: runnerUpNation.iso },
    thirdPlace: { name: thirdPlaceNation.name, code: thirdPlaceNation.code, iso: thirdPlaceNation.iso },
    finalScore,
    mvp: {
      name: mvpCandidate.name,
      nation: mvpNation.name,
      nationCode: mvpNation.code,
      club: mvpCandidate.club,
      rating: parseFloat((8.2 + Math.random() * 0.8).toFixed(2)),
      goals: mvpGoals,
      assists: mvpAssists,
    },
    topScorer: {
      name: topScorerCandidate.name,
      nation: topScorerNation.name,
      nationCode: topScorerNation.code,
      club: topScorerCandidate.club,
      goals: topScorerGoals,
    },
    bestAssister: {
      name: assistCandidate.name,
      nation: assistNation.name,
      nationCode: assistNation.code,
      club: assistCandidate.club,
      assists: bestAssists,
    },
    goldenGlove: {
      name: gkCandidate.name,
      nation: championNation.name,
      nationCode: championNation.code,
      cleanSheets: gkCleanSheets,
    },
    headline,
    summaryArticle,
    timestamp: Date.now(),
  };

  // Sync to Authoritative World State & Yearly Awards
  try {
    const calendarYear = seasonYear;
    const seasonLabel = `${seasonYear}/${(seasonYear + 1).toString().slice(-2)}`;
    const db = getCareerLeagueDatabase();
    const worldState = getWorldSimulationState(seasonLabel, db);
    worldState.international = worldState.international || {};

    const compKey = config.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const internationalData = {
      competitionId: config.shortName.toUpperCase(),
      name: config.competitionName,
      type: (config.tier === 'U17' ? 'u17' : config.tier === 'U20' ? 'u20' : config.isContinental ? 'continental' : 'world_cup') as any,
      seasonYear: seasonLabel,
      isActive: false,
      groups: [],
      knockoutRounds: [],
      winner: { teamId: championNation.code, teamName: championNation.name },
      runnerUp: { teamId: runnerUpNation.code, teamName: runnerUpNation.name },
      thirdPlace: { teamId: thirdPlaceNation.code, teamName: thirdPlaceNation.name },
      awards: {
        mvp: {
          name: result.mvp.name,
          nationName: result.mvp.nation,
          nationCode: result.mvp.nationCode,
          iso: mvpNation.iso || 'xx',
          statLabel: 'Tournament Rating',
          statValue: `${result.mvp.rating} Rating (${result.mvp.goals}G, ${result.mvp.assists}A)`,
        },
        topGoalscorer: {
          name: result.topScorer.name,
          nationName: result.topScorer.nation,
          nationCode: result.topScorer.nationCode,
          iso: topScorerNation.iso || 'xx',
          statLabel: 'Goals Scored',
          statValue: `${result.topScorer.goals} Goals`,
        },
        bestCreator: {
          name: result.bestAssister.name,
          nationName: result.bestAssister.nation,
          nationCode: result.bestAssister.nationCode,
          iso: assistNation.iso || 'xx',
          statLabel: 'Assists Created',
          statValue: `${result.bestAssister.assists} Assists`,
        },
        bestDefender: {
          name: defCandidate.name,
          nationName: championNation.name,
          nationCode: championNation.code,
          iso: championNation.iso || 'xx',
          statLabel: 'Clean Sheets & Tackles',
          statValue: `${gkCleanSheets} Clean Sheets`,
        },
        bestGoalkeeper: {
          name: result.goldenGlove.name,
          nationName: result.goldenGlove.nation,
          nationCode: result.goldenGlove.nationCode,
          iso: championNation.iso || 'xx',
          statLabel: 'Clean Sheets',
          statValue: `${result.goldenGlove.cleanSheets} Clean Sheets`,
        },
      },
      topScorers: [{
        rank: 1,
        playerId: `star-${result.topScorer.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        playerName: result.topScorer.name,
        teamId: result.topScorer.nationCode,
        teamName: result.topScorer.nation,
        value: result.topScorer.goals,
        ovr: topScorerCandidate.rating || 88,
        position: 'FWD',
        subPosition: 'ST',
      }],
      topAssists: [{
        rank: 1,
        playerId: `star-${result.bestAssister.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        playerName: result.bestAssister.name,
        teamId: result.bestAssister.nationCode,
        teamName: result.bestAssister.nation,
        value: result.bestAssister.assists,
        ovr: assistCandidate.rating || 88,
        position: 'MID',
        subPosition: 'CAM',
      }],
      topRatings: [{
        rank: 1,
        playerId: `star-${result.mvp.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        playerName: result.mvp.name,
        teamId: result.mvp.nationCode,
        teamName: result.mvp.nation,
        value: result.mvp.rating,
        ovr: mvpCandidate.rating || 90,
        position: 'FWD',
        subPosition: 'LW',
      }],
    };

    worldState.international[compKey] = internationalData;
    if (config.isWorldCup && config.tier === 'Senior') {
      worldState.international['world_cup'] = internationalData;
      worldState.international['fifa_world_cup'] = internationalData;
    } else if (config.shortName === 'Euro') {
      worldState.international['uefa_euro'] = internationalData;
      worldState.international['euro'] = internationalData;
    } else if (config.shortName === 'Copa América') {
      worldState.international['copa_america'] = internationalData;
    }

    saveWorldSimulationState(worldState);

    // Sync to Yearly Award Data
    const yearlyData = getYearlyAwardData(calendarYear, {
      activeSeasonYear: seasonLabel,
      activeWorldState: worldState,
    });
    yearlyData.competitionWinners.internationalChampions = yearlyData.competitionWinners.internationalChampions || {};
    yearlyData.competitionWinners.internationalChampions[compKey] = championNation.code;
    yearlyData.competitionWinners.internationalChampions[`${compKey}_name`] = championNation.name;

    if (config.isWorldCup && config.tier === 'Senior') {
      yearlyData.competitionWinners.internationalChampions['world_cup'] = championNation.name;
      yearlyData.competitionWinners.internationalChampions['world_cup_code'] = championNation.code;
    }

    if (config.tier === 'Senior') {
      yearlyData.competitionWinners.internationalRunnersUp = yearlyData.competitionWinners.internationalRunnersUp || {};
      yearlyData.competitionWinners.internationalRunnersUp[compKey] = runnerUpNation.code;

      yearlyData.competitionWinners.internationalMVPs = yearlyData.competitionWinners.internationalMVPs || {};
      yearlyData.competitionWinners.internationalMVPs[compKey] = {
        name: result.mvp.name,
        nationCode: result.mvp.nationCode,
      };

      yearlyData.competitionWinners.internationalTopScorers = yearlyData.competitionWinners.internationalTopScorers || {};
      yearlyData.competitionWinners.internationalTopScorers[compKey] = {
        name: result.topScorer.name,
        nationCode: result.topScorer.nationCode,
        goals: result.topScorer.goals,
      };

      yearlyData.competitionWinners.internationalBestAssisters = yearlyData.competitionWinners.internationalBestAssisters || {};
      yearlyData.competitionWinners.internationalBestAssisters[compKey] = {
        name: result.bestAssister.name,
        nationCode: result.bestAssister.nationCode,
        assists: result.bestAssister.assists,
      };

      // Ensure MVP star player is recorded in yearlyData.players so they qualify for Ballon d'Or
      const mvpId = `pro-star-${result.mvp.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      if (!yearlyData.players[mvpId]) {
        yearlyData.players[mvpId] = {
          playerId: mvpId,
          calendarYear,
          playerName: result.mvp.name,
          teamId: result.mvp.club.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          teamName: result.mvp.club,
          countryCode: result.mvp.nationCode,
          position: 'FWD',
          ovr: 91,
          appearances: 42,
          starts: 40,
          minutes: 3600,
          goals: 28 + result.mvp.goals,
          assists: 14 + result.mvp.assists,
          totalRating: (8.3 + result.mvp.rating) * 21,
          ratingCount: 42,
          avgRating: parseFloat(((8.3 + result.mvp.rating) / 2).toFixed(2)),
          cleanSheets: 0,
          defensiveStops: 10,
          yellowCards: 2,
          redCards: 0,
          mvpCount: 8,
          intlAppearances: 7,
          intlStarts: 7,
          intlMinutes: 630,
          intlGoals: result.mvp.goals,
          intlAssists: result.mvp.assists,
          intlCleanSheets: 0,
          intlTrophies: [result.competitionName],
          teamTrophies: championNation.code === result.mvp.nationCode ? [result.competitionName] : [],
          individualAchievements: [`${result.competitionName} Player of the Tournament (Golden Ball)`],
          competitions: {},
        };
      } else {
        yearlyData.players[mvpId].intlGoals += result.mvp.goals;
        yearlyData.players[mvpId].intlAssists += result.mvp.assists;
        yearlyData.players[mvpId].intlTrophies.push(result.competitionName);
      }
    }
    saveYearlyAwardData(yearlyData);
  } catch (err) {
    console.warn('[BackgroundTournament] Could not sync to awards state:', err);
  }

  return result;
}

/**
 * Creates DrawNewsItem for national tournament results when player was not in the tournament.
 */
export function createNationalTournamentResultNews(
  result: BackgroundTournamentResult
): DrawNewsItem {
  return {
    id: `news-nat-result-${result.seasonYear}-${result.shortName.toLowerCase()}`,
    category: 'national',
    competitionId: result.shortName.toUpperCase(),
    competitionName: result.competitionName,
    shortName: result.shortName,
    icon: '🏆',
    badgeText: `${result.champion.name.toUpperCase()} WINS ${result.shortName.toUpperCase()}`,
    isPlayerInvolved: false,
    headline: result.headline,
    description: `${result.finalScore}. MVP: ${result.mvp.name} (${result.mvp.nation}) • Golden Boot: ${result.topScorer.name} (${result.topScorer.goals} goals) • Runner-Up: ${result.runnerUp.name}.`,
    flagOrEmblem: `https://flagcdn.com/w80/${(result.champion.iso || 'un').toLowerCase()}.png`,
  };
}
