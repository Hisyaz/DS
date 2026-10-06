import { PlayerCardData, TrophyItem } from '../types';
import { ChampionTitleData } from '../components/ChampionsCelebrationModal';
import { ContinentalFinalVenue } from '../types/continentalCompetitions';
import { getContinentalVisualTheme } from './continentalVisualThemeSystem';
import {
  calculateLegendaryFinalTitle,
  getContinentalFinalVenue,
  getLocalizedCity,
} from './continentalVenueSystem';
import { getStoredLanguage } from './localizationSystem';

export interface ContinentalVictoryNewsEvent {
  competitionName: string;
  competitionShort: string;
  competitionId: string;
  finalResult: string; // e.g. "3 - 1"
  winnerClub: string;
  runnerUpClub: string;
  finalVenue?: ContinentalFinalVenue;
  legendaryTitle?: string;
  finalMvp: {
    name: string;
    club: string;
    rating: number;
    isPlayer: boolean;
  };
  goalscorers: {
    name: string;
    goals: number;
    isPlayer?: boolean;
  }[];
  socialReactions: {
    username: string;
    handle: string;
    avatar: string;
    comment: string;
    likes: string;
    verified?: boolean;
  }[];
  fameReward: number;
  careerWinMilestoneTitle?: string;
  careerWinMilestoneDescription?: string;
  headline: string;
  articleBody: string;
  celebrationData: ChampionTitleData;
}

/**
 * Counts how many times this specific continental trophy has been won by the player.
 */
export function countContinentalTrophiesWon(
  player: PlayerCardData,
  competitionNameOrId: string
): {
  totalWins: number;
  consecutiveWins: number;
  recentYearsWon: number[];
} {
  const norm = competitionNameOrId.toLowerCase();
  const trophies = player.trophies || [];

  const matched = trophies.filter((t) => {
    const tNorm = (t.name || '').toLowerCase();
    const cat = (t.category || '').toLowerCase();
    if (cat !== 'continental' && !tNorm.includes('champions') && !tNorm.includes('libertadores') && !tNorm.includes('europa') && !tNorm.includes('sudamericana') && !tNorm.includes('conference')) {
      return false;
    }
    if (norm.includes('ucl') || norm.includes('champions league') || norm.includes('uefa_cl')) {
      return tNorm.includes('champions league') || tNorm.includes('ucl');
    }
    if (norm.includes('uel') || norm.includes('europa league') || norm.includes('uefa_el')) {
      return tNorm.includes('europa league') || tNorm.includes('uel');
    }
    if (norm.includes('uecl') || norm.includes('conference league') || norm.includes('uefa_ecl')) {
      return tNorm.includes('conference') || tNorm.includes('uecl');
    }
    if (norm.includes('lib') || norm.includes('libertadores') || norm.includes('conmebol_lib')) {
      return tNorm.includes('libertadores');
    }
    if (norm.includes('sud') || norm.includes('sudamericana') || norm.includes('conmebol_sud')) {
      return tNorm.includes('sudamericana');
    }
    return tNorm.includes(norm);
  });

  const totalWins = matched.length;
  const years = matched
    .map((t) => parseInt(String(t.year).split('/')[0], 10))
    .filter((y) => !isNaN(y))
    .sort((a, b) => b - a);

  let consecutiveWins = totalWins > 0 ? 1 : 0;
  for (let i = 0; i < years.length - 1; i++) {
    if (years[i] - years[i + 1] === 1) {
      consecutiveWins++;
    } else {
      break;
    }
  }

  return {
    totalWins,
    consecutiveWins,
    recentYearsWon: years,
  };
}

/**
 * Generates unique victory news and celebration event whenever the player wins
 * a Champions League, Europa League, Conference League, Libertadores, or Sudamericana final.
 */
export function generateContinentalVictoryNews(
  player: PlayerCardData,
  params: {
    competitionId: string;
    competitionName?: string;
    seasonYear: number | string;
    playerScore?: number;
    opponentScore?: number;
    opponentName?: string;
    playerGoals?: number;
    playerAssists?: number;
    playerRating?: number;
    isMvp?: boolean;
    simulatedGoalscorers?: { name: string; goals: number; isPlayer?: boolean }[];
    finalVenue?: ContinentalFinalVenue;
    trailedByTwoOrMore?: boolean;
    redCardsCount?: number;
    wonOnPenalties?: boolean;
    wonInExtraTime?: boolean;
    lastMinuteWinner?: boolean;
    isGoalkeeperMasterclass?: boolean;
    isHistoricUnderdogVictory?: boolean;
  }
): ContinentalVictoryNewsEvent {
  const theme = getContinentalVisualTheme(params.competitionId);
  const compFull = params.competitionName || theme?.name || 'UEFA Champions League';
  const compShort = theme?.shortName || 'UCL';
  const playerClub = player.club || 'FC Club';
  const oppClub = params.opponentName || 'Elite Rivals';

  const pScore = params.playerScore ?? 2;
  const oScore = params.opponentScore ?? 1;
  const finalResult = `${pScore} - ${oScore}`;

  const pGoals = params.playerGoals ?? 1;
  const pAssists = params.playerAssists ?? 1;
  const pRating = params.playerRating ?? 8.8;
  const isPlayerMvp = params.isMvp ?? true;

  // Track wins history including this current win
  const { totalWins: previousWins, consecutiveWins: previousConsecutive } = countContinentalTrophiesWon(
    player,
    params.competitionId
  );
  const currentTotalWins = previousWins + 1;
  const currentConsecutive = previousConsecutive + 1;

  // Retrieve locked final venue
  const numericYear = typeof params.seasonYear === 'number' ? params.seasonYear : parseInt(String(params.seasonYear), 10) || 2026;
  const venue: ContinentalFinalVenue = params.finalVenue || getContinentalFinalVenue(params.competitionId, numericYear);

  // Compute Legendary Final Title
  const legendaryResult = calculateLegendaryFinalTitle({
    city: venue.city,
    isWon: true,
    teamConsecutiveWins: currentConsecutive,
    playerTotalWins: currentTotalWins,
    trailedByTwoOrMore: params.trailedByTwoOrMore,
    playerGoals: pGoals,
    playerAssists: pAssists,
    playerRating: pRating,
    isMvp: isPlayerMvp,
    finalGoalDiff: Math.abs(pScore - oScore),
    redCardsCount: params.redCardsCount,
    wonOnPenalties: params.wonOnPenalties,
    wonInExtraTime: params.wonInExtraTime,
    lastMinuteWinner: params.lastMinuteWinner,
    isGoalkeeperMasterclass: params.isGoalkeeperMasterclass,
    isHistoricUnderdogVictory: params.isHistoricUnderdogVictory,
    language: getStoredLanguage(),
  });
  const legendaryTitle = legendaryResult.title || undefined;

  // Determine Milestone Recognition
  let milestoneTitle: string | undefined;
  let milestoneDesc: string | undefined;

  const isUclOrLib =
    params.competitionId.includes('UEFA_CL') ||
    params.competitionId.includes('CONMEBOL_LIB') ||
    compFull.toLowerCase().includes('champions league') ||
    compFull.toLowerCase().includes('libertadores');

  if (currentTotalWins > 7) {
    milestoneTitle = '👑 ALL-TIME RECORD BREAKER • HISTORIC ACHIEVEMENT';
    milestoneDesc = `A legendary achievement that defies modern football! ${player.name} has now lifted their ${currentTotalWins}th continental crown, shattering every known record in the sport's history!`;
  } else if (currentTotalWins === 7 && isUclOrLib) {
    milestoneTitle = '⭐ SEVENTH CONTINENTAL CROWN • THE IMMORTAL HEPTA';
    milestoneDesc = `Seventh heaven! ${player.name} cements their name alongside the greatest footballing dynasties of all time with 7 historic ${compShort} titles!`;
  } else if (currentTotalWins === 6 && isUclOrLib) {
    milestoneTitle = '🏆 SIXTH CONTINENTAL GLORY • GOD TIER';
    milestoneDesc = `A 6th ${compShort} title places ${player.name} into the rarest football stratosphere, matching the absolute icons of European & South American football.`;
  } else if (currentTotalWins === 5) {
    milestoneTitle = '⚡ FIFTH CONTINENTAL TRIUMPH • 5x CHAMPION';
    milestoneDesc = `Five times on top of the continent! ${player.name} writes a masterclass five-trophy legacy in the ${compFull}.`;
  } else if (currentTotalWins === 4) {
    milestoneTitle = '🌟 FOUR-TIME CONTINENTAL CHAMPION';
    milestoneDesc = `Four career ${compShort} victories! An undisputed titan of continental knockout football.`;
  } else if (currentTotalWins === 3) {
    milestoneTitle = '✨ TRIPLE CONTINENTAL CROWN • 3x CHAMPION';
    milestoneDesc = `A monumental third continental title! ${player.name} has proven their dominance across three distinct campaigns.`;
  } else if (currentTotalWins === 2) {
    milestoneTitle = '🥇 TWO-TIME CONTINENTAL CHAMPION';
    milestoneDesc = `Second ${compShort} title in the cabinet! ${player.name} establishes themselves among the absolute elite.`;
  }

  // Consecutive Wins Overrides
  if (currentConsecutive === 3) {
    milestoneTitle = '🔥 HISTORIC THREE-PEAT • 3 CONSECUTIVE WINS!';
    milestoneDesc = `A mythical three-peat dynasty! ${playerClub} and ${player.name} have conquered the continent for 3 consecutive seasons in an era of unmatched dominance!`;
  } else if (currentConsecutive === 2 && !milestoneTitle) {
    milestoneTitle = '⚡ BACK-TO-BACK CHAMPIONS • 2 CONSECUTIVE TITLES!';
    milestoneDesc = `Back-to-back continental champions! ${playerClub} successfully defend their ${compShort} crown!`;
  }

  // Goalscorers Breakdown
  const goalscorers = params.simulatedGoalscorers || [
    { name: player.name, goals: pGoals, isPlayer: true },
    { name: `${playerClub} Striker`, goals: Math.max(0, pScore - pGoals) },
    { name: `${oppClub} Forward`, goals: oScore },
  ].filter((g) => g.goals > 0);

  // MVP
  const finalMvp = {
    name: isPlayerMvp ? player.name : `${playerClub} Playmaker`,
    club: playerClub,
    rating: pRating,
    isPlayer: isPlayerMvp,
  };

  // Varied Social Reactions
  const reactionsPool = [
    [
      {
        username: 'UltraTactics_EU',
        handle: '@ultra_tactics',
        avatar: '📊',
        comment: `UNREAL MASTERCLASS!! ${playerClub} just put on an absolute clinic in ${venue.city}! ${player.name} was untouchable on the pitch at ${venue.stadium}! 🔥🏆`,
        likes: '48.9K',
        verified: true,
      },
      {
        username: 'ContinentalFooty',
        handle: '@cont_footy_hub',
        avatar: '⚽',
        comment: `Scenes at ${venue.stadium} at full time!! ${playerClub} are officially Champions of the continent! ${player.name} deserved that MVP trophy! 👑`,
        likes: '34.2K',
        verified: true,
      },
    ],
    [
      {
        username: 'FootballArchive',
        handle: '@football_archive',
        avatar: '📜',
        comment: `History written in stone in ${venue.city}! The atmosphere inside ${venue.stadium} (${venue.capacity.toLocaleString()} fans) gave me absolute chills! ⭐️⭐️`,
        likes: '52.1K',
        verified: true,
      },
      {
        username: 'PitchSideLive',
        handle: '@pitchside_live',
        avatar: '🎙️',
        comment: `The fans in ${venue.stadium} are weeping with joy! ${finalResult} in the final, what an unbelievable campaign from ${playerClub}! 🍾🎉`,
        likes: '29.7K',
        verified: true,
      },
    ],
    [
      {
        username: 'ScoutReportGlobal',
        handle: '@scout_report_gl',
        avatar: '🌍',
        comment: `World class rating (${pRating}) from ${player.name} under maximum floodlights in ${venue.city}. Generational greatness! 💫`,
        likes: '61.4K',
        verified: true,
      },
      {
        username: 'SupportersTrust',
        handle: '@supporters_united',
        avatar: '🔴',
        comment: `WE CONQUERED ${venue.city.toUpperCase()}!! ${venue.stadium} belongs to ${playerClub}! Build the statue for ${player.name}! 🏆🔥`,
        likes: '41.8K',
        verified: false,
      },
    ],
  ];

  const seed = (currentTotalWins * 7 + numericYear) % reactionsPool.length;
  const socialReactions = reactionsPool[seed];

  // Fame Reward based on competition prestige
  let fameReward = 15;
  if (compShort === 'UCL' || compShort === 'LIB') {
    fameReward = 25;
  } else if (compShort === 'UEL' || compShort === 'SUD') {
    fameReward = 18;
  } else if (compShort === 'UECL') {
    fameReward = 14;
  }

  // Headline and Article Body
  let headline: string;
  if (legendaryTitle) {
    headline = `${legendaryTitle.toUpperCase()}: ${playerClub.toUpperCase()} LIFT THE ${compShort}!`;
  } else if (milestoneTitle) {
    headline = `${milestoneTitle} • ${playerClub.toUpperCase()} LIFT THE ${compShort}!`;
  } else {
    headline = `KINGS OF GLORY: ${playerClub.toUpperCase()} WIN THE ${compFull.toUpperCase()}!`;
  }

  const legendaryParagraph = legendaryResult.description ? `\n\n⭐ ${legendaryResult.description}` : '';

  const articleBody = `Under the electric floodlights of ${venue.stadium} in ${venue.city}, ${venue.country} in front of ${venue.capacity.toLocaleString()} roaring fans, ${playerClub} produced an unforgettable continental masterclass to defeat ${oppClub} ${finalResult} and lift the prestigious ${compFull} trophy.${legendaryParagraph}\n\n${player.name} stood at the center of footballing destiny, delivering an authoritative display (${pRating} Match Rating) punctuated with decisive contributions that broke the deadlock and sparked jubilant celebrations across the globe. ${
    milestoneDesc ? `\n\n${milestoneDesc}` : ''
  }`;

  const celebrationData: ChampionTitleData = {
    titleName: compFull,
    seasonYear: params.seasonYear,
    clubName: playerClub,
    opponentName: oppClub,
    finalScore: finalResult,
    trophyType: compShort === 'UCL' || compShort === 'LIB' ? 'ucl' : 'cup',
    isUcl: compShort === 'UCL' || compShort === 'LIB',
    legendaryTitle,
    finalVenue: venue,
    goalscorers,
    mvp: finalMvp,
    playerPerformance: {
      name: player.name,
      position: player.position || 'FWD',
      ovr: player.ovr || 80,
      matchesPlayed: 13,
      goals: pGoals,
      assists: pAssists,
      avgRating: pRating,
      keyContributionText: legendaryResult.description || milestoneDesc || `Decisive performance at ${venue.stadium} in the ${compShort} Grand Final victory!`,
    },
    newsArticle: {
      headline,
      content: articleBody,
    },
    socialComments: socialReactions,
  };

  return {
    competitionName: compFull,
    competitionShort: compShort,
    competitionId: params.competitionId,
    finalResult,
    winnerClub: playerClub,
    runnerUpClub: oppClub,
    finalVenue: venue,
    legendaryTitle,
    finalMvp,
    goalscorers,
    socialReactions,
    fameReward,
    careerWinMilestoneTitle: milestoneTitle,
    careerWinMilestoneDescription: milestoneDesc,
    headline,
    articleBody,
    celebrationData,
  };
}
