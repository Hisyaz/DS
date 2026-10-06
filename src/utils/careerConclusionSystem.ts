import { PlayerCardData, TrophyItem, AccountingState } from '../types';
import {
  FullCareerHistory,
  FarewellMatchResult,
  CareerMatchBreakdown,
  CareerSeasonRecord,
  CareerTeamRecord,
  CareerTransferRecord,
  CareerAwardRecord,
  PeakMarketValueRecord,
  PeakOvrRecord,
  CareerTimelineEvent,
  PotentialOutcomeClassification,
  LegacyClassification,
  FameTitleDetails,
} from '../types/careerConclusion';
import { calculatePlayerMarketValue } from './transferMarketSystem';

export function formatEuroCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = (amount / 1_000_000).toFixed(1).replace('.0', '');
    return `€${millions}M`;
  } else if (amount >= 1_000) {
    const thousands = (amount / 1_000).toFixed(0);
    return `€${thousands}K`;
  }
  return `€${amount.toLocaleString()}`;
}

/**
 * Returns a chronological list of career seasons (from early youth age 10 to current age).
 * Merges recorded seasons with authentic generated history for unrecorded past years.
 */
export function getChronologicalCareerSeasons(
  player: PlayerCardData,
  accounting?: AccountingState
): CareerSeasonRecord[] {
  const currentAge = player.age || 16;
  const startAge = 10;
  const currentYear = 2026;
  const baseStartYear = currentYear - Math.max(0, currentAge - startAge);

  // If player already has recorded seasons in player.careerHistory?.seasonsPlayed
  const recordedMap = new Map<number, CareerSeasonRecord>();
  if (player.careerHistory?.seasonsPlayed && player.careerHistory.seasonsPlayed.length > 0) {
    player.careerHistory.seasonsPlayed.forEach((rec) => {
      recordedMap.set(rec.age, rec);
    });
  }

  const result: CareerSeasonRecord[] = [];

  const startingClubName = player.startingCity
    ? `${player.startingCity} Youth Academy`
    : player.city
    ? `${player.city} Youth Academy`
    : 'Local Youth Academy';

  const position = player.position || 'ST';
  const posUpper = position.toUpperCase();
  const isForward = ['ST', 'CF', 'LW', 'RW', 'FW', 'ATT', 'DEL'].some((p) => posUpper.includes(p));
  const isMidfielder = ['CAM', 'CM', 'CDM', 'LM', 'RM', 'MID', 'VOL'].some((p) => posUpper.includes(p));
  const isDefender = ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF', 'ZAG', 'LAT'].some((p) => posUpper.includes(p));

  const currentSalary = accounting?.yearlySalary || (player.isProPlayer ? 45000 : 0);
  const currentSponsors = (accounting?.sponsors || [])
    .filter((s) => s.active !== false)
    .reduce((sum, s) => sum + (s.yearlyPayment || 0), 0);

  const currentOvr = player.ovr || 70;
  const ageSpan = Math.max(1, currentAge - startAge);
  const startingOvr = Math.max(45, Math.min(65, currentOvr - ageSpan * 2));

  for (let age = startAge; age <= currentAge; age++) {
    if (recordedMap.has(age)) {
      result.push(recordedMap.get(age)!);
      continue;
    }

    const yearOffset = age - startAge;
    const sYear = baseStartYear + yearOffset;
    const seasonLabel = `${sYear}/${(sYear + 1).toString().slice(-2)}`;
    const isYouth = age < 17;

    const squadLevel = isYouth
      ? age <= 13
        ? 'Youth'
        : age <= 15
        ? 'U17'
        : 'U20'
      : (player.squadDestination || 'First Team');

    const clubName = isYouth
      ? (age <= 14 ? startingClubName : `${startingClubName} U17`)
      : (player.club || 'First Team Club');

    const leagueName = isYouth
      ? `${player.city || player.startingCity || 'London'} Youth League U${age}`
      : (player.league || 'National 1st Division');

    // Matches & Performance based on age & position
    const matches = isYouth ? 16 + (age % 3) : 28 + (age % 6);
    let goals = 0;
    let assists = 0;
    if (isForward) {
      goals = Math.max(2, Math.round(matches * (0.32 + Math.min(0.28, yearOffset * 0.03))));
      assists = Math.max(1, Math.round(matches * 0.16));
    } else if (isMidfielder) {
      goals = Math.max(1, Math.round(matches * 0.18));
      assists = Math.max(2, Math.round(matches * (0.26 + Math.min(0.22, yearOffset * 0.025))));
    } else if (isDefender) {
      goals = Math.max(0, Math.round(matches * 0.06));
      assists = Math.max(1, Math.round(matches * 0.12));
    } else {
      goals = 0;
      assists = 0;
    }

    const rating = Number((7.1 + Math.min(1.4, yearOffset * 0.11) + ((age * 7) % 5) * 0.04).toFixed(2));
    const ovrStart = Math.min(99, Math.round(startingOvr + yearOffset * 2.1));
    const ovrEnd = Math.min(99, Math.round(startingOvr + (yearOffset + 1) * 2.1));

    // Financials & Salary History
    let salaryAnnual = 0;
    let sponsorsIncome = 0;
    if (!isYouth) {
      const proYearsSpent = Math.max(0, age - 17);
      salaryAnnual = Math.round(Math.max(18000, currentSalary * (0.35 + proYearsSpent * 0.2)));
      sponsorsIncome = Math.round(currentSponsors * (0.25 + proYearsSpent * 0.25));
    } else if (age >= 14) {
      salaryAnnual = 1200 + (age - 14) * 800; // Youth allowance/stipend
    }

    // Trophies & Awards
    const trophiesWon: string[] = [];
    const awardsWon: string[] = [];

    // Pull any real trophies matching this age / category
    if (player.trophies && player.trophies.length > 0) {
      player.trophies.forEach((t) => {
        if (t.year === String(sYear) || t.year === seasonLabel) {
          if (!trophiesWon.includes(t.name)) trophiesWon.push(t.name);
        }
      });
    }

    if (trophiesWon.length === 0) {
      if (age === 12) {
        trophiesWon.push('Regional Youth Tournament U12');
      } else if (age === 14) {
        trophiesWon.push(`U14 Academy League Cup`);
      } else if (age === 16) {
        awardsWon.push(`Academy Player of the Season`);
      }
    }

    const standingRank = (age % 4) + 1;

    // Attributes / stats gained
    const statGains = [
      `+${Math.max(1, ovrEnd - ovrStart)} OVR`,
      age % 2 === 0 ? '+1 PHY' : '+1 PAC',
      age % 3 === 0 ? '+1 SHO' : '+1 PAS',
      age % 4 === 0 ? '+1 DEF' : '+1 DRI',
    ];

    result.push({
      seasonYear: seasonLabel,
      age,
      teamName: clubName,
      squadLevel,
      competitionName: leagueName,
      isYouth,
      matches,
      goals,
      assists,
      avgRating: rating,
      trophiesWon,
      awardsWon,
      salaryAnnual,
      sponsorsIncome,
      ovrStart,
      ovrEnd,
      standingRank,
      statsGained: statGains,
      promoted: !isYouth && standingRank <= 2 && player.leagueTier === 1,
      relegated: false,
      qualificationOutcome: isYouth
        ? (standingRank <= 2 ? "Int'l Youth Cup Qual" : 'Youth Academy League')
        : (standingRank <= 4 ? 'Continental Qualification' : 'Mid-Table'),
      keyHighlight: isYouth
        ? `Trained in ${clubName} youth program.`
        : `Competitive campaign with ${clubName} in ${leagueName}.`,
    });
  }

  // Sort chronologically ascending
  return result.sort((a, b) => a.age - b.age);
}

/**
 * Returns complete stylistic and narrative details for the Fame-based Career Title:
 * 1000+ Fame: Iconic
 * 900+ Fame: Legendary
 * 800+ Fame: Gold
 * 700+ Fame: Silver
 * 600+ Fame: Bronze
 * 500 or under: White
 */
export function getFameTitleDetails(fame: number): FameTitleDetails {
  if (fame >= 1000) {
    return {
      title: 'Iconic',
      badge: '👑 ICONIC',
      colorClass: 'text-amber-300',
      textColor: 'text-amber-400',
      bgGradient: 'from-amber-500/30 via-yellow-500/20 to-amber-700/40',
      borderColor: 'border-amber-400',
      description: 'The pinnacle of football immortality. A global icon whose name is etched alongside the gods of the game.',
      fameRequired: '1000+ Fame',
    };
  }
  if (fame >= 900) {
    return {
      title: 'Legendary',
      badge: '🌟 LEGENDARY',
      colorClass: 'text-purple-300',
      textColor: 'text-purple-400',
      bgGradient: 'from-purple-600/30 via-indigo-600/20 to-purple-900/40',
      borderColor: 'border-purple-400',
      description: 'A transcendent legend revered across world football for unforgettable mastery and historic dominance.',
      fameRequired: '900–999 Fame',
    };
  }
  if (fame >= 800) {
    return {
      title: 'Gold',
      badge: '🥇 GOLD',
      colorClass: 'text-yellow-300',
      textColor: 'text-yellow-400',
      bgGradient: 'from-yellow-500/30 via-amber-500/20 to-yellow-700/40',
      borderColor: 'border-yellow-400',
      description: 'An elite world-class superstar recognized and respected on every continental stage.',
      fameRequired: '800–899 Fame',
    };
  }
  if (fame >= 700) {
    return {
      title: 'Silver',
      badge: '🥈 SILVER',
      colorClass: 'text-slate-200',
      textColor: 'text-slate-300',
      bgGradient: 'from-slate-400/30 via-slate-500/20 to-slate-700/40',
      borderColor: 'border-slate-300',
      description: 'An established international star with widespread acclaim and consistent top-flight distinction.',
      fameRequired: '700–799 Fame',
    };
  }
  if (fame >= 600) {
    return {
      title: 'Bronze',
      badge: '🥉 BRONZE',
      colorClass: 'text-amber-500',
      textColor: 'text-amber-600',
      bgGradient: 'from-amber-700/30 via-amber-800/20 to-amber-950/40',
      borderColor: 'border-amber-600',
      description: 'A celebrated national standout with proud domestic prestige and devoted supporters.',
      fameRequired: '600–699 Fame',
    };
  }
  return {
    title: 'White',
    badge: '⚪ WHITE',
    colorClass: 'text-slate-300',
    textColor: 'text-slate-400',
    bgGradient: 'from-slate-700/20 via-slate-800/20 to-slate-900/40',
    borderColor: 'border-slate-500',
    description: 'A dedicated professional who served the badge with honest effort and steadfast commitment.',
    fameRequired: '500 or under Fame',
  };
}

/**
 * Calculates Legacy Classification strictly based on Fame:
 * 1000+ Fame: Iconic
 * 900+ Fame: Legendary
 * 800+ Fame: Gold
 * 700+ Fame: Silver
 * 600+ Fame: Bronze
 * 500 or under: White
 */
export function calculateLegacyClassification(
  peakOvr: number,
  fame: number,
  trophiesCount?: number,
  awardsCount?: number,
  totalGoals?: number
): LegacyClassification {
  return getFameTitleDetails(fame).title;
}

/**
 * Evaluates Potential Outcome Classification
 */
export function evaluatePotentialOutcome(
  peakOvr: number,
  finalOvr: number,
  potentialOvr: number
): PotentialOutcomeClassification {
  if (peakOvr > potentialOvr) {
    return 'EXCEEDED POTENTIAL';
  }
  if (peakOvr === potentialOvr) {
    return 'REACHED POTENTIAL';
  }
  if (finalOvr === potentialOvr) {
    return 'CURRENTLY AT POTENTIAL';
  }
  return 'DID NOT REACH POTENTIAL';
}

/**
 * Main function to compile the comprehensive Career History from player state
 */
export function compileFullCareerHistory(player: PlayerCardData): FullCareerHistory {
  const startingAge = 10; // Standard Career Mode start age
  const retirementAge = player.age || 35;
  const totalDurationYears = Math.max(1, retirementAge - startingAge);
  
  const startingOvr = 88; // Explicit Baseline starting OVR as mandated
  const peakOvrValue = Math.max(startingOvr, player.ovr || 88, player.expectedPeak || 88);
  const finalOvr = player.ovr || 88;
  const startingPotential = player.potentialOvr || 85;
  const peakPotential = Math.max(startingPotential, peakOvrValue + 2);
  
  const potentialOutcome = evaluatePotentialOutcome(peakOvrValue, finalOvr, startingPotential);
  const ovrGrowth = peakOvrValue - startingOvr;
  
  const finalFame = player.fame || 500;
  const finalBadReputation = player.badReputation || 10;
  
  // Calculate Peak OVR Record
  const peakOvr: PeakOvrRecord = {
    ovr: peakOvrValue,
    age: Math.min(retirementAge, Math.max(26, startingAge + Math.floor(totalDurationYears * 0.7))),
    clubName: player.club || 'FC Barcelona',
    year: `Season ${Math.floor(totalDurationYears * 0.7)}`,
  };

  // Peak Market Value Record
  const currentMv = calculatePlayerMarketValue(player).marketValue;
  const peakMvEuros = Math.max(currentMv, 45000000);
  const peakMarketValue: PeakMarketValueRecord = {
    valueEuros: peakMvEuros,
    formattedValue: formatEuroCurrency(peakMvEuros),
    age: Math.min(retirementAge, 27),
    clubName: player.club || 'FC Barcelona',
    ovrAtPeak: peakOvrValue,
    fameAtPeak: finalFame,
    year: `Season ${Math.floor(totalDurationYears * 0.65)}`,
  };

  // Match Statistics
  const matchStats: CareerMatchBreakdown = {
    totalMatches: Math.max(120, Math.round(totalDurationYears * 28)),
    youthMatches: Math.round(totalDurationYears * 0.25 * 24),
    proMatches: Math.round(totalDurationYears * 0.75 * 32),
    domesticMatches: Math.round(totalDurationYears * 0.5 * 26),
    continentalMatches: Math.round(totalDurationYears * 0.2 * 10),
    internationalMatches: Math.round(totalDurationYears * 0.1 * 6),
    cupMatches: Math.round(totalDurationYears * 0.15 * 8),
    otherMatches: Math.round(totalDurationYears * 0.05 * 4),
  };

  const totalGoals = Math.max(25, Math.round(totalDurationYears * 12));
  const totalAssists = Math.max(15, Math.round(totalDurationYears * 8));

  // Records
  const bestScoringSeasonGoals = Math.round(totalGoals * 0.22);
  const bestAssistsSeasonCount = Math.round(totalAssists * 0.25);

  const mostGoalsSingleSeason = { count: bestScoringSeasonGoals, season: '2030/31' };
  const mostAssistsSingleSeason = { count: bestAssistsSeasonCount, season: '2031/32' };
  const bestScoringSeason = { goals: bestScoringSeasonGoals, season: '2030/31', club: player.club || 'First Team' };
  const bestRatedSeason = { rating: 8.75, season: '2031/32', club: player.club || 'First Team' };

  // Teams Represented (Including Youth Teams)
  const startingClubName = player.startingCity ? `${player.startingCity} Youth Academy` : 'Buenos Aires Youth Club';
  const finalClubName = player.club || 'Global FC';

  const teamsRepresented: CareerTeamRecord[] = [
    {
      id: 'team_youth_1',
      teamName: startingClubName,
      country: player.country || 'Argentina',
      squadLevel: 'U17',
      seasonsSpent: 4,
      matches: 64,
      goals: Math.round(totalGoals * 0.2),
      assists: Math.round(totalAssists * 0.2),
      isYouthClub: true,
    },
    {
      id: 'team_youth_2',
      teamName: `${startingClubName} U20`,
      country: player.country || 'Argentina',
      squadLevel: 'U20',
      seasonsSpent: 2,
      matches: 38,
      goals: Math.round(totalGoals * 0.15),
      assists: Math.round(totalAssists * 0.15),
      isYouthClub: true,
    },
    {
      id: 'team_pro_1',
      teamName: finalClubName,
      country: player.clubCountry || player.country || 'Spain',
      squadLevel: 'First Team',
      seasonsSpent: Math.max(1, totalDurationYears - 6),
      matches: matchStats.proMatches,
      goals: Math.round(totalGoals * 0.65),
      assists: Math.round(totalAssists * 0.65),
    },
  ];

  // Seasons Played List
  const seasonsPlayed = getChronologicalCareerSeasons(player);

  // Trophies & Youth Titles
  const existingTrophies: TrophyItem[] = player.trophies && player.trophies.length > 0
    ? player.trophies
    : [
        {
          id: 'trophy_youth_1',
          name: 'Liga Bonaerense Juvenil Champion',
          category: 'youth',
          year: '2028',
          prestige: 60,
          iconType: 'youth-trophy',
        },
        {
          id: 'trophy_league_1',
          name: 'National First Division Trophy',
          category: 'national',
          year: '2031',
          prestige: 85,
          iconType: 'league',
        },
      ];

  const youthTitlesWon = existingTrophies
    .filter((t) => t.category === 'youth' || t.name.toLowerCase().includes('juvenil') || t.name.toLowerCase().includes('youth'))
    .map((t) => t.name);

  if (youthTitlesWon.length === 0) {
    youthTitlesWon.push('Liga Bonaerense Juvenil Champion');
  }

  // Individual Awards
  const individualAwards: CareerAwardRecord[] = [
    {
      id: 'award_1',
      awardName: 'Best Young Player U-21',
      seasonYear: '2029/30',
      teamName: finalClubName,
      competitionName: 'First Division League',
      category: 'best_young_player',
    },
    {
      id: 'award_2',
      awardName: 'Top Goalscorer Golden Boot',
      seasonYear: '2030/31',
      teamName: finalClubName,
      competitionName: 'First Division League',
      category: 'top_scorer',
    },
    {
      id: 'award_3',
      awardName: 'Best Player of the Season',
      seasonYear: '2031/32',
      teamName: finalClubName,
      competitionName: 'First Division League',
      category: 'best_player',
    },
  ];

  // Transfer Record & Transfer Spending
  const transfersHistory: CareerTransferRecord[] = [
    {
      id: 'trans_1',
      previousClub: startingClubName,
      newClub: `${startingClubName} U20`,
      seasonYear: '2028/29',
      transferFeeEuros: 0,
      formattedFee: 'Free Promotion',
      transferType: 'Free Transfer',
    },
    {
      id: 'trans_2',
      previousClub: `${startingClubName} U20`,
      newClub: finalClubName,
      seasonYear: '2030/31',
      transferFeeEuros: 8500000,
      formattedFee: '€8,500,000',
      transferType: 'Transfer Fee',
    },
    {
      id: 'trans_3',
      previousClub: finalClubName,
      newClub: player.club || 'FC Barcelona',
      seasonYear: '2033/34',
      transferFeeEuros: 45000000,
      formattedFee: '€45,000,000',
      transferType: 'Transfer Fee',
    },
  ];

  const totalTransferFeesPaid = transfersHistory.reduce((sum, t) => sum + t.transferFeeEuros, 0);

  // Timeline
  const timeline: CareerTimelineEvent[] = [
    {
      id: 'time_1',
      age: 10,
      year: '2026',
      title: 'Joined Youth Academy',
      description: `Began official football journey at ${startingClubName}.`,
      category: 'youth',
    },
    {
      id: 'time_2',
      age: 13,
      year: '2029',
      title: 'Won First Youth Title',
      description: 'Lifting the Liga Bonaerense Juvenil trophy after an undefeated season.',
      category: 'trophy',
    },
    {
      id: 'time_3',
      age: 16,
      year: '2032',
      title: 'Signed First Professional Contract',
      description: `Signed first pro contract with ${finalClubName}.`,
      category: 'contract',
    },
    {
      id: 'time_4',
      age: 18,
      year: '2034',
      title: 'First-Team Debut & Breakthrough',
      description: 'Established regular starting spot in top-tier competition.',
      category: 'milestone',
    },
    {
      id: 'time_5',
      age: 23,
      year: '2039',
      title: 'Peak Market Value Reached',
      description: `Reached a peak valuation of ${formatEuroCurrency(peakMvEuros)}.`,
      category: 'peak',
    },
    {
      id: 'time_6',
      age: 25,
      year: '2041',
      title: 'Peak OVR Mastery',
      description: `Reached career zenith rating of ${peakOvrValue} OVR.`,
      category: 'peak',
    },
    {
      id: 'time_7',
      age: retirementAge,
      year: `${2026 + totalDurationYears}`,
      title: 'Farewell Match & Retirement',
      description: `Concluded an legendary career at age ${retirementAge} representing ${finalClubName}.`,
      category: 'retirement',
    },
  ];

  // Legacy Narrative
  const narrativeLegacy = `${player.name} embarked on an extraordinary football journey at age 10 with ${startingClubName}. Developing through the youth ranks, winning youth titles, and advancing to professional stardom with ${finalClubName}, ${player.name} reached a towering peak of ${peakOvrValue} OVR and a market value of ${formatEuroCurrency(peakMvEuros)}. Winning ${existingTrophies.length} major titles and multiple individual awards, ${player.name}'s name is etched into football history.`;

  const legacyClassification = calculateLegacyClassification(
    peakOvrValue,
    finalFame,
    existingTrophies.length,
    individualAwards.length,
    totalGoals
  );

  return {
    startingAge,
    retirementAge,
    startingClub: startingClubName,
    finalClub: finalClubName,
    totalDurationYears,
    startingOvr,
    peakOvr,
    finalOvr,
    startingPotential,
    peakPotential,
    potentialOutcome,
    ovrGrowth,
    finalFame,
    finalBadReputation,
    matchStats,
    totalGoals,
    totalAssists,
    mostGoalsSingleSeason,
    mostAssistsSingleSeason,
    bestScoringSeason,
    bestRatedSeason,
    highestSingleMatchRating: 9.8,
    longestScoringStreakMatches: 8,
    mostConsecutiveAppearances: 42,
    mostTrophiesSingleSeason: { count: 3, season: '2031/32' },
    teamsRepresented,
    seasonsPlayed,
    trophiesWon: existingTrophies,
    youthTitlesWon,
    individualAwards,
    transfersHistory,
    totalTransferFeesPaid,
    formattedTotalTransferFeesPaid: formatEuroCurrency(totalTransferFeesPaid),
    peakMarketValue,
    timeline,
    narrativeLegacy,
    farewellResult: player.farewellResult,
    legacyClassification,
  };
}

/**
 * Simulates the Farewell Match interaction and applies final results to player state
 */
export function simulateFarewellMatch(
  player: PlayerCardData,
  choice: 'glory' | 'torch',
  inheritorName?: string
): { updatedPlayer: PlayerCardData; result: FarewellMatchResult } {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const fallbackInheritor = inheritorName || 'Mateo Silva';

  let succeeded = false;
  let commentary = '';
  let finalMatchGoals = 0;
  let finalMatchAssists = 0;
  let finalMatchRating = 8.5;

  if (choice === 'glory') {
    // Low probability (28% success chance)
    succeeded = Math.random() < 0.28;
    if (succeeded) {
      finalMatchGoals = 1;
      finalMatchRating = 9.7;
      commentary = `UNBELIEVABLE! ${player.name.toUpperCase()} LAUNCHES A SPECTACULAR OVERHEAD BICYCLE KICK IN HIS FINAL CAREER MATCH! THE BALL SAILS INTO THE TOP CORNER! WHAT A FAIRYTALE GOAL TO CAP OFF AN ICONIC CAREER!`;
    } else {
      finalMatchGoals = 0;
      finalMatchRating = 7.8;
      commentary = `${player.name.toUpperCase()} GOES FOR ABSOLUTE GLORY IN HIS FINAL MOMENT! A DARING 30-YARD BICYCLE VOLLEY SKIMS OFF THE CROSSBAR! THE STADIUM RISES IN UNANIMOUS APPLAUSE FOR THE LEGENDARY AUDACITY!`;
    }
  } else {
    // High probability (98% success chance)
    succeeded = Math.random() < 0.98;
    finalMatchAssists = 1;
    finalMatchRating = 9.2;
    commentary = `A BEAUTIFUL PASSING OF THE TORCH! VETERAN LEGEND ${player.name.toUpperCase()} DELIVERS A DELICATE PINPOINT PASS TO YOUNG ACADEMY PROSPECT ${fallbackInheritor.toUpperCase()}, WHO SLOTS IT HOME! THE RESPONSIBILITY IS OFFICIALLY HANDED TO THE NEXT GENERATION!`;
  }

  const result: FarewellMatchResult = {
    choice,
    choiceTitle: choice === 'glory' ? 'Try The Impossible' : 'Pass It To The Next Generation',
    succeeded,
    inheritorName: choice === 'torch' ? fallbackInheritor : undefined,
    commentary,
    finalMatchScore: '3 - 1',
    finalMatchGoals,
    finalMatchAssists,
    finalMatchRating,
    date: player.calendarDate || '15 May 2038',
  };

  updated.isRetired = true;
  updated.careerConcluded = true;
  updated.farewellResult = result;
  
  // Re-compile career history with farewell match saved
  updated.careerHistory = compileFullCareerHistory(updated);

  return { updatedPlayer: updated, result };
}
