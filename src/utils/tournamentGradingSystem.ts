import { PlayerCardData } from '../types';
import { NationalTournamentState } from './nationalTournamentManager';

export type DrawStarPerformanceGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface TournamentGradeEvaluation {
  grade: DrawStarPerformanceGrade;
  title: string;
  verdict: string;
  championCoinsAwarded: number;
  gradeModifier: number;
  isPerfectTournament: boolean;
  criteriaMet: {
    wonTournament: boolean;
    wonMvp: boolean;
    wonAdditionalIndividualTrophy: boolean;
    highAverageRating: boolean;
    clutchGoalscorer: boolean;
  };
  trophiesWonList: string[];
}

/**
 * Authoritative Draw Star Tournament Performance Grading Engine.
 * Evaluates performance upon tournament conclusion:
 * - Grade S: Champion + MVP + At least 1 additional individual award (Golden Boot, Playmaker, Defender, Glove) -> 10 Coins
 * - Grade A: Finalist/Champion with high stats or MVP -> 7-8 Coins
 * - Grade B: Deep knockout run (Semis/Quarters) with strong rating -> 5-6 Coins
 * - Grade C: Solid Round of 16 / strong group stage -> 3-4 Coins
 * - Grade D/E: Group stage qualification battle -> 2 Coins
 * - Grade F: Early group exit / low participation -> 1 Coin (Participation)
 */
export function evaluateTournamentPerformanceGrade(
  tournamentState: NationalTournamentState,
  player: PlayerCardData
): TournamentGradeEvaluation {
  const callingNationCode = (tournamentState.callingNation.code || 'ENG').toUpperCase();
  const champCode = (tournamentState.champion?.code || '').toUpperCase();
  const wonTournament = champCode === callingNationCode;

  const awards = tournamentState.awards;
  const wonMvp = Boolean(awards?.mvp?.isPlayer);
  const wonGoldenBoot = Boolean(awards?.topGoalscorer?.isPlayer);
  const wonPlaymaker = Boolean(awards?.bestCreator?.isPlayer);
  const wonDefender = Boolean(awards?.bestDefender?.isPlayer);
  const wonGlove = Boolean(awards?.bestGoalkeeper?.isPlayer);

  const additionalTrophies: string[] = [];
  if (wonGoldenBoot) additionalTrophies.push('Golden Boot (Top Goalscorer)');
  if (wonPlaymaker) additionalTrophies.push('Best Creator (Playmaker)');
  if (wonDefender) additionalTrophies.push('Best Defender Trophy');
  if (wonGlove) additionalTrophies.push('Golden Glove (Best Goalkeeper)');

  const wonAdditionalIndividualTrophy = additionalTrophies.length > 0;

  const trophiesWonList: string[] = [];
  if (wonTournament) trophiesWonList.push(`${tournamentState.config.competitionName} Trophy`);
  if (wonMvp) trophiesWonList.push('Tournament MVP (Golden Ball)');
  trophiesWonList.push(...additionalTrophies);

  const stats = tournamentState.playerStats;
  const avgRating = stats.avgRating || 6.5;
  const goals = stats.goals || 0;
  const assists = stats.assists || 0;
  const caps = stats.caps || 0;
  const highAverageRating = avgRating >= 7.8;
  const clutchGoalscorer = goals >= 4 || (goals >= 2 && assists >= 2);

  const finishStage = (tournamentState.playerFinishStage || '').toLowerCase();
  const isFinalist = finishStage.includes('runner') || finishStage.includes('final');
  const isSemiFinalist = finishStage.includes('semi') || finishStage.includes('third');
  const isQuarterFinalist = finishStage.includes('quarter');
  const isRoundOf16 = finishStage.includes('16');

  let grade: DrawStarPerformanceGrade = 'C';
  let championCoinsAwarded = 3;
  let gradeModifier = 1.0;
  let title = 'Solid International Campaign';
  let verdict = 'You demonstrated professional discipline and held your ground on the world stage.';

  // 1. GRADE S: Champion + MVP + At least 1 Additional Trophy
  if (wonTournament && wonMvp && wonAdditionalIndividualTrophy) {
    grade = 'S';
    championCoinsAwarded = 10;
    gradeModifier = 2.5;
    title = 'IMMORTAL LEGEND OF FOOTBALL (GRADE S)';
    verdict = `Unprecedented perfection! You conquered the world with ${tournamentState.callingNation.name}, claimed the Tournament MVP, and secured the ${additionalTrophies[0]}! An era-defining performance recognized across the globe.`;
  }
  // 2. GRADE A: Won tournament without all 3, OR Finalist with MVP/Golden Boot + 8.0+ rating
  else if (
    (wonTournament && (wonMvp || wonAdditionalIndividualTrophy || highAverageRating)) ||
    (isFinalist && (wonMvp || wonGoldenBoot || avgRating >= 8.0))
  ) {
    grade = 'A';
    championCoinsAwarded = 8;
    gradeModifier = 1.8;
    title = 'WORLD-CLASS SHOWCASE (GRADE A)';
    verdict = `Elite international tier! Your technical mastery and tactical influence elevated ${tournamentState.callingNation.name} to the highest heights.`;
  }
  // 3. GRADE B: Semi-Finals / Quarter-Finals with notable stats OR Won tournament as squad contributor
  else if (wonTournament || isSemiFinalist || (isQuarterFinalist && avgRating >= 7.2)) {
    grade = 'B';
    championCoinsAwarded = 5;
    gradeModifier = 1.4;
    title = 'EXCELLENT CAMPAIGN (GRADE B)';
    verdict = `A deeply commanding showing. You proved your readiness to face football's most demanding opponents under relentless global pressure.`;
  }
  // 4. GRADE C: Round of 16 or respectable group stage with goals/assists
  else if (isRoundOf16 || (goals + assists >= 2) || avgRating >= 7.0) {
    grade = 'C';
    championCoinsAwarded = 3;
    gradeModifier = 1.0;
    title = 'COMMENDABLE EFFORT (GRADE C)';
    verdict = `Solid contributions for your country. The international experience gained here will sharpen your instincts for future glory.`;
  }
  // 5. GRADE D / E: Group stage struggle with some caps
  else if (caps >= 2 && avgRating >= 6.2) {
    grade = 'D';
    championCoinsAwarded = 2;
    gradeModifier = 0.7;
    title = 'VALIANT PARTICIPATION (GRADE D)';
    verdict = `A grueling tournament where results slipped away, but valuable lessons were etched into your international pedigree.`;
  }
  else if (caps >= 1) {
    grade = 'E';
    championCoinsAwarded = 2;
    gradeModifier = 0.5;
    title = 'TOUGH BATTLE (GRADE E)';
    verdict = `A frustrating tournament where your national side could not find rhythm against high-level tactical blocks.`;
  }
  // 6. GRADE F: Early exit or no significant participation
  else {
    grade = 'F';
    championCoinsAwarded = 1;
    gradeModifier = 0.3;
    title = 'DISAPPOINTING EXIT (GRADE F)';
    verdict = `Participation registered. Your country was eliminated prematurely without leaving a mark. +1 Champion Coin awarded for participation.`;
  }

  return {
    grade,
    title,
    verdict,
    championCoinsAwarded,
    gradeModifier,
    isPerfectTournament: grade === 'S',
    criteriaMet: {
      wonTournament,
      wonMvp,
      wonAdditionalIndividualTrophy,
      highAverageRating,
      clutchGoalscorer,
    },
    trophiesWonList,
  };
}

/**
 * Calculates Season Summary Performance Grade & Champion Coins Modifier
 */
export function evaluateSeasonSummaryGrade(player: PlayerCardData): {
  grade: DrawStarPerformanceGrade;
  title: string;
  championCoins: number;
} {
  const pAny = player as any;
  const avgRating = pAny.avgRating || pAny.rating || 7.0;
  const trophies = (player.trophies || []).length;
  const goals = pAny.goals || 0;
  const assists = pAny.assists || 0;

  if (trophies >= 3 && avgRating >= 8.0 && (goals + assists >= 25)) {
    return { grade: 'S', title: 'Historic Treble / Ballon d’Or Season', championCoins: 10 };
  }
  if (trophies >= 1 && avgRating >= 7.6) {
    return { grade: 'A', title: 'Champion Season', championCoins: 7 };
  }
  if (avgRating >= 7.3) {
    return { grade: 'B', title: 'Breakthrough Top Tier Season', championCoins: 5 };
  }
  if (avgRating >= 6.8) {
    return { grade: 'C', title: 'Consistent Starter Season', championCoins: 3 };
  }
  if (avgRating >= 6.2) {
    return { grade: 'D', title: 'Developmental Season', championCoins: 2 };
  }
  return { grade: 'F', title: 'Struggling Season', championCoins: 1 };
}
