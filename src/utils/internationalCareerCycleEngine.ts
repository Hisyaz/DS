import { Nationality, PlayerCardData } from '../types';
import { NationalTeamTier, Confederation, InternationalCallUp } from '../types/nationalTeam';
import { TOP_50_NATIONAL_TEAMS_SEEDS, Top50NationSeedData } from '../data/top50NationalTeamsData';
import { getNationalTeamsDatabase } from './nationalTeamDatabaseManager';
import { getEligibleNationalities } from './nationalTeamSystem';
import { isProfessionalPlayer } from './playerIdentitySystem';

export interface InternationalCyclePhase {
  type: 'qualifier' | 'tournament';
  tier: NationalTeamTier;
  seasonYear: string;
  tournamentYear?: string;
  title: string;
  competitionName: string;
  isContinental?: boolean;
  isWorldCup?: boolean;
}

export interface QualifierMatchResult {
  matchNumber: number;
  homeNation: { code: string; name: string; iso: string; ovr: number };
  awayNation: { code: string; name: string; iso: string; ovr: number };
  homeScore: number;
  awayScore: number;
  isPlayerMatch: boolean;
  stageName?: string;
  playerStats?: {
    minutes: number;
    goals: number;
    assists: number;
    shots: number;
    passes: number;
    matchRating: number;
  };
}

export interface QualifierStandingRow {
  nationCode: string;
  nationName: string;
  iso: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualified: boolean;
  isPlayerNation?: boolean;
}

export interface QualifierSummary {
  tier: NationalTeamTier;
  playerNation: Nationality;
  playerCalledUp: boolean;
  playerAccepted: boolean;
  competitionName?: string;
  matches: QualifierMatchResult[];
  standings: QualifierStandingRow[];
  playerQualified: boolean;
  newsHeadline: string;
  newsSummary: string;
  totalPlayerGoals: number;
  totalPlayerAssists: number;
  avgPlayerRating: number;
}

export interface WorldCupSummary {
  tier: NationalTeamTier;
  playerNation: Nationality;
  playerCalledUp: boolean;
  playerParticipated: boolean;
  champion: { name: string; code: string; iso: string };
  playerFinishStage: string;
  matches: QualifierMatchResult[];
  newsHeadline: string;
  newsSummary: string;
  totalPlayerGoals: number;
  totalPlayerAssists: number;
  isContinental?: boolean;
  competitionName?: string;
  groupStandings?: QualifierStandingRow[];
  currentKnockoutStageIndex?: number;
  knockoutStages?: string[];
  currentKnockoutOpponent?: { code: string; name: string; iso: string; ovr: number };
  isFinished?: boolean;
}

export interface ConfederationTournamentFormat {
  confederation: Confederation;
  competitionName: string;
  shortName: string;
  trophyTitle: string;
  totalTeams: number;
  numGroups: number;
  teamsPerGroup: number;
  advanceTopCount: number;
  hasBest3rdPlace: boolean;
  num3rdPlaceAdvance: number;
  knockoutStartStage: 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final';
  knockoutStages: string[];
}

/**
 * Gets the real-world format configuration for each confederation's Senior Continental Championship or World Cup.
 */
export function getConfederationTournamentFormat(
  confederation: Confederation | string = 'UEFA',
  isWorldCup: boolean = false
): ConfederationTournamentFormat {
  if (isWorldCup) {
    return {
      confederation: 'UEFA',
      competitionName: 'FIFA World Cup',
      shortName: 'World Cup',
      trophyTitle: 'FIFA World Cup',
      totalTeams: 32,
      numGroups: 8,
      teamsPerGroup: 4,
      advanceTopCount: 2,
      hasBest3rdPlace: false,
      num3rdPlaceAdvance: 0,
      knockoutStartStage: 'round_of_16',
      knockoutStages: ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'],
    };
  }

  switch ((confederation || 'UEFA').toString().toUpperCase()) {
    case 'UEFA':
      return {
        confederation: 'UEFA',
        competitionName: 'UEFA European Championship',
        shortName: 'UEFA Euro',
        trophyTitle: 'UEFA Euro',
        totalTeams: 24,
        numGroups: 6,
        teamsPerGroup: 4,
        advanceTopCount: 2,
        hasBest3rdPlace: true,
        num3rdPlaceAdvance: 4,
        knockoutStartStage: 'round_of_16',
        knockoutStages: ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'],
      };
    case 'CONMEBOL':
      return {
        confederation: 'CONMEBOL',
        competitionName: 'Copa América',
        shortName: 'Copa América',
        trophyTitle: 'Copa América',
        totalTeams: 16,
        numGroups: 4,
        teamsPerGroup: 4,
        advanceTopCount: 2,
        hasBest3rdPlace: false,
        num3rdPlaceAdvance: 0,
        knockoutStartStage: 'quarter_final',
        knockoutStages: ['Quarter-Final', 'Semi-Final', 'Final'],
      };
    case 'CAF':
      return {
        confederation: 'CAF',
        competitionName: 'Africa Cup of Nations',
        shortName: 'AFCON',
        trophyTitle: 'Africa Cup of Nations',
        totalTeams: 24,
        numGroups: 6,
        teamsPerGroup: 4,
        advanceTopCount: 2,
        hasBest3rdPlace: true,
        num3rdPlaceAdvance: 4,
        knockoutStartStage: 'round_of_16',
        knockoutStages: ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'],
      };
    case 'CONCACAF':
      return {
        confederation: 'CONCACAF',
        competitionName: 'CONCACAF Gold Cup',
        shortName: 'Gold Cup',
        trophyTitle: 'CONCACAF Gold Cup',
        totalTeams: 16,
        numGroups: 4,
        teamsPerGroup: 4,
        advanceTopCount: 2,
        hasBest3rdPlace: false,
        num3rdPlaceAdvance: 0,
        knockoutStartStage: 'quarter_final',
        knockoutStages: ['Quarter-Final', 'Semi-Final', 'Final'],
      };
    case 'AFC':
      return {
        confederation: 'AFC',
        competitionName: 'AFC Asian Cup',
        shortName: 'Asian Cup',
        trophyTitle: 'AFC Asian Cup',
        totalTeams: 24,
        numGroups: 6,
        teamsPerGroup: 4,
        advanceTopCount: 2,
        hasBest3rdPlace: true,
        num3rdPlaceAdvance: 4,
        knockoutStartStage: 'round_of_16',
        knockoutStages: ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'],
      };
    case 'OFC':
    default:
      return {
        confederation: 'OFC',
        competitionName: 'OFC Nations Cup',
        shortName: 'OFC Nations Cup',
        trophyTitle: 'OFC Nations Cup',
        totalTeams: 8,
        numGroups: 2,
        teamsPerGroup: 4,
        advanceTopCount: 2,
        hasBest3rdPlace: false,
        num3rdPlaceAdvance: 0,
        knockoutStartStage: 'semi_final',
        knockoutStages: ['Semi-Final', 'Final'],
      };
  }
}

export const CONMEBOL_NATIONS_SEEDS: Top50NationSeedData[] = TOP_50_NATIONAL_TEAMS_SEEDS.filter(
  (n) => n.confederation === 'CONMEBOL'
);

export function isConmebolNation(code: string): boolean {
  const c = (code || '').toUpperCase();
  return ['ARG', 'BRA', 'COL', 'URU', 'ECU', 'CHI', 'PAR', 'PER', 'VEN', 'BOL'].includes(c);
}

export function getQualifiersTournamentInfo(nationCode: string, tier: NationalTeamTier): {
  competitionName: string;
  shortName: string;
  hostCountry: string;
  isSudamericano: boolean;
  totalSpots: number;
  qualifyingSpots: number;
} {
  const isConmebol = isConmebolNation(nationCode);
  if (isConmebol) {
    if (tier === 'U17') {
      return {
        competitionName: 'CONMEBOL Sudamericano Sub-17',
        shortName: 'Sudamericano Sub-17',
        hostCountry: 'Ecuador',
        isSudamericano: true,
        totalSpots: 10,
        qualifyingSpots: 4, // Top 4 qualify for FIFA U17 World Cup
      };
    }
    if (tier === 'U20') {
      return {
        competitionName: 'CONMEBOL Sudamericano Sub-20',
        shortName: 'Sudamericano Sub-20',
        hostCountry: 'Colombia',
        isSudamericano: true,
        totalSpots: 10,
        qualifyingSpots: 4, // Top 4 qualify for FIFA U20 World Cup
      };
    }
    return {
      competitionName: 'CONMEBOL Eliminatorias Sudamericanas',
      shortName: 'Eliminatorias CONMEBOL',
      hostCountry: 'South America',
      isSudamericano: false,
      totalSpots: 10,
      qualifyingSpots: 6,
    };
  }

  // UEFA / other
  if (tier === 'U17') {
    return {
      competitionName: 'UEFA European Under-17 Championship Qualifiers',
      shortName: 'UEFA Euro U17 Qualifiers',
      hostCountry: 'Europe',
      isSudamericano: false,
      totalSpots: 6,
      qualifyingSpots: 2,
    };
  }
  if (tier === 'U20') {
    return {
      competitionName: 'UEFA European Under-19 Championship Qualifiers',
      shortName: 'UEFA Euro U19 Qualifiers',
      hostCountry: 'Europe',
      isSudamericano: false,
      totalSpots: 6,
      qualifyingSpots: 2,
    };
  }
  return {
    competitionName: 'FIFA World Cup Qualifiers',
    shortName: 'World Cup Qualifiers',
    hostCountry: 'Global',
    isSudamericano: false,
    totalSpots: 6,
    qualifyingSpots: 2,
  };
}

/**
 * Calculate realistic simulated National Team OVR from FIFA Ranking and Tier.
 * Prevents unrealistic OVR inflation (e.g. Colombia U17 will be ~68 OVR, Brazil U17 ~72 OVR).
 */
export function calculateSimulatedTeamOvr(fifaRanking: number, tier: NationalTeamTier = 'Senior'): number {
  const rank = Math.max(1, Math.min(60, fifaRanking || 25));

  if (tier === 'U17') {
    // Realistic U17 baseline: Top 5 = 71–75 OVR, Top 15 = 66–70 OVR, Mid = 60–65 OVR, Low = 55–59 OVR
    if (rank <= 5) return 72 + Math.round((5 - rank) * 0.7);
    if (rank <= 15) return 67 + Math.round((15 - rank) * 0.4);
    if (rank <= 30) return 61 + Math.round((30 - rank) * 0.35);
    return Math.max(55, 59 - Math.round((rank - 30) * 0.25));
  }

  if (tier === 'U20') {
    // Realistic U20 baseline: Top 5 = 78–82 OVR, Top 15 = 73–77 OVR, Mid = 67–72 OVR, Low = 62–66 OVR
    if (rank <= 5) return 78 + Math.round((5 - rank) * 0.8);
    if (rank <= 15) return 73 + Math.round((15 - rank) * 0.45);
    if (rank <= 30) return 67 + Math.round((30 - rank) * 0.35);
    return Math.max(62, 65 - Math.round((rank - 30) * 0.25));
  }

  // Senior baseline: Top 5 = 84–89 OVR, Top 15 = 79–83 OVR, Mid = 74–78 OVR, Low = 68–73 OVR
  if (rank <= 5) return 85 + Math.round((5 - rank) * 0.8);
  if (rank <= 15) return 79 + Math.round((15 - rank) * 0.5);
  if (rank <= 30) return 74 + Math.round((30 - rank) * 0.35);
  return Math.max(68, 72 - Math.round((rank - 30) * 0.25));
}

/**
 * Determines if a season year triggers an International Competition Cycle.
 * Timeline:
 * - 2033: U17 Qualifiers
 * - 2034: U17 World Cup
 * - 2036, 2040, 2044, 2048, 2052...: Senior Continental Championship (Euro, Copa América, AFCON, Gold Cup, Asian Cup, OFC Cup)
 * - 2037: U20 Qualifiers
 * - 2038: U20 World Cup
 * - 2041, 2045, 2049, 2053...: Senior World Cup Qualifiers
 * - 2042, 2046, 2050, 2054...: Senior World Cup Final Stage
 */
export function getInternationalCycleForSeason(startYear: number): InternationalCyclePhase | null {
  const seasonYearLabel = `${startYear}/${(startYear + 1).toString().slice(-2)}`;

  // 1. U17 World Cup: happens every year from 2030 until 2033 (qualifiers in previous block)
  if (startYear >= 2030 && startYear <= 2033) {
    return {
      type: 'tournament',
      tier: 'U17',
      seasonYear: seasonYearLabel,
      title: `${startYear} FIFA U-17 World Cup`,
      competitionName: 'FIFA U-17 World Cup Final Stage',
      isWorldCup: true,
    };
  }

  // 2. U20 Qualifiers: happens ONLY ONCE on 2034
  if (startYear === 2034) {
    return {
      type: 'qualifier',
      tier: 'U20',
      seasonYear: seasonYearLabel,
      tournamentYear: '2035/36',
      title: '2034 U20 World Cup Continental Qualifiers',
      competitionName: 'FIFA U-20 World Cup Continental Qualifiers',
      isWorldCup: true,
    };
  }

  // 3. U20 World Cup: happens ONLY ONCE in 2035
  if (startYear === 2035) {
    return {
      type: 'tournament',
      tier: 'U20',
      seasonYear: seasonYearLabel,
      title: '2035 FIFA U-20 World Cup',
      competitionName: 'FIFA U-20 World Cup Final Stage',
      isWorldCup: true,
    };
  }

  // 4. Senior Continental Championships: 2036, 2040, 2044, 2048, 2052, etc. (every 4 years)
  if (startYear >= 2036 && startYear % 4 === 0 && (startYear - 2042) % 4 !== 0) {
    return {
      type: 'tournament',
      tier: 'Senior',
      seasonYear: seasonYearLabel,
      title: 'Senior Continental Championship',
      competitionName: 'Continental Championship',
      isContinental: true,
    };
  }

  // 5. Senior World Cup Qualifiers: 2041, 2045, 2049, 2053, etc.
  if (startYear >= 2041 && (startYear - 2041) % 4 === 0) {
    return {
      type: 'qualifier',
      tier: 'Senior',
      seasonYear: seasonYearLabel,
      tournamentYear: `${startYear + 1}/${(startYear + 2).toString().slice(-2)}`,
      title: 'Senior World Cup Qualifiers',
      competitionName: 'FIFA World Cup Qualifiers',
      isWorldCup: true,
    };
  }

  // 6. Senior World Cup Final Stage: 2042, 2046, 2050, 2054, etc.
  if (startYear >= 2042 && (startYear - 2042) % 4 === 0) {
    return {
      type: 'tournament',
      tier: 'Senior',
      seasonYear: seasonYearLabel,
      title: 'FIFA World Cup Final Stage',
      competitionName: 'FIFA World Cup Final Stage',
      isWorldCup: true,
    };
  }

  return null;
}

/**
 * Gets 5 continental opponents from the player nation's confederation.
 */
export function getContinentalOpponents(playerNationCode: string, count: number = 5): Top50NationSeedData[] {
  const seeds = TOP_50_NATIONAL_TEAMS_SEEDS;
  const targetSeed = seeds.find((s) => s.code.toUpperCase() === playerNationCode.toUpperCase()) || seeds[0];
  const targetConf = targetSeed.confederation;

  const sameConfSeeds = seeds.filter(
    (s) => s.confederation === targetConf && s.code.toUpperCase() !== playerNationCode.toUpperCase()
  );

  let pool = [...sameConfSeeds];

  // Fallback if not enough in top 50
  if (pool.length < count) {
    const fallbackSeeds = seeds.filter((s) => s.code.toUpperCase() !== playerNationCode.toUpperCase());
    pool = [...pool, ...fallbackSeeds];
  }

  // Shuffle and pick
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Evaluates if player is selected in top 35 eligible players for any of their eligible nationalities.
 */
export function evaluatePlayerInternationalSelection(
  player: PlayerCardData,
  tier: NationalTeamTier
): { isSelected: boolean; callingNation: Nationality | null; rankInSquad: number } {
  // RULE 1: National Teams are NOT active during Youth Academy
  if (!isProfessionalPlayer(player)) {
    return { isSelected: false, callingNation: null, rankInSquad: 99 };
  }

  const eligibleNats = getEligibleNationalities(player);
  if (!eligibleNats || eligibleNats.length === 0) {
    return { isSelected: false, callingNation: null, rankInSquad: 99 };
  }

  // Filter out nations the player explicitly declined for this specific tier
  const declinedNationsForTier = player.declinedInternationalCallUps?.[tier] || [];
  const activeEligibleNats = eligibleNats.filter(
    (n) => !declinedNationsForTier.includes(n.code.toUpperCase())
  );

  if (activeEligibleNats.length === 0) {
    return { isSelected: false, callingNation: null, rankInSquad: 99 };
  }

  const playerOvr = player.ovr || player.overallRating || 70;

  // Check against db teams for eligible nations
  const db = getNationalTeamsDatabase();

  for (const nat of activeEligibleNats) {
    const dbTeam = db.find(
      (t) => t.nation.code.toUpperCase() === nat.code.toUpperCase() || t.nation.name.toLowerCase() === nat.name.toLowerCase()
    );

    let squad = dbTeam?.squad || [];
    if (tier === 'U20' && dbTeam?.u20Squad) squad = dbTeam.u20Squad;
    if (tier === 'U17' && dbTeam?.u17Squad) squad = dbTeam.u17Squad;

    // Filter or sort squad by OVR
    const ovrs = squad.map((p) => p.overallRating || p.ovr || 70).sort((a, b) => b - a);

    // If squad has fewer than 35 players, estimate cutoff OVR based on FIFA ranking
    const rank = dbTeam?.fifaRanking || 25;
    const minRequiredOvr = calculateSimulatedTeamOvr(rank, tier);

    const cutoffOvr = ovrs.length >= 35 ? ovrs[34] : Math.max(50, minRequiredOvr - 12);

    if (playerOvr >= cutoffOvr) {
      let rankInSquad = ovrs.findIndex((o) => playerOvr >= o) + 1;
      if (rankInSquad <= 0) rankInSquad = Math.min(35, ovrs.length + 1);

      return {
        isSelected: true,
        callingNation: nat,
        rankInSquad,
      };
    }
  }

  return { isSelected: false, callingNation: null, rankInSquad: 99 };
}

/**
 * Simulates a single match using team OVRs and generates player stats if player participates.
 */
export function simulateSingleInternationalMatch(
  homeName: string,
  homeOvr: number,
  awayName: string,
  awayOvr: number,
  isPlayerInHomeTeam: boolean = false,
  isPlayerInAwayTeam: boolean = false,
  playerOvr: number = 75,
  playerPosition: string = 'ST'
): {
  homeScore: number;
  awayScore: number;
  playerStats?: {
    minutes: number;
    goals: number;
    assists: number;
    shots: number;
    passes: number;
    matchRating: number;
  };
} {
  const ovrDiff = homeOvr - awayOvr + 3; // home advantage +3
  const expectedHomeGoals = Math.max(0, 1.4 + ovrDiff * 0.05 + (Math.random() * 1.6 - 0.8));
  const expectedAwayGoals = Math.max(0, 1.1 - ovrDiff * 0.04 + (Math.random() * 1.6 - 0.8));

  const homeScore = Math.floor(expectedHomeGoals);
  const awayScore = Math.floor(expectedAwayGoals);

  const playerInMatch = isPlayerInHomeTeam || isPlayerInAwayTeam;
  if (!playerInMatch) {
    return { homeScore, awayScore };
  }

  const teamGoals = isPlayerInHomeTeam ? homeScore : awayScore;

  // Minutes played
  const minutes = Math.floor(65 + Math.random() * 26); // 65-90

  // Goals
  let goals = 0;
  if (teamGoals > 0) {
    const isAttacker = ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(playerPosition.toUpperCase());
    const goalProb = isAttacker ? 0.45 : 0.20;
    for (let g = 0; g < teamGoals; g++) {
      if (Math.random() < goalProb && goals < 3) {
        goals++;
      }
    }
  }

  // Assists
  let assists = 0;
  const remGoals = teamGoals - goals;
  if (remGoals > 0) {
    const assistProb = ['CAM', 'CM', 'LW', 'RW', 'ST'].includes(playerPosition.toUpperCase()) ? 0.35 : 0.15;
    for (let a = 0; a < remGoals; a++) {
      if (Math.random() < assistProb && assists < 2) {
        assists++;
      }
    }
  }

  // Shots & Passes & Rating
  const shots = goals + Math.floor(Math.random() * 4);
  const passes = Math.floor(25 + Math.random() * 35);
  const baseRating = 6.2 + goals * 1.1 + assists * 0.7 + (teamGoals > 0 ? 0.3 : -0.2);
  const matchRating = Math.min(10.0, Math.max(5.5, Number((baseRating + (Math.random() * 0.8 - 0.4)).toFixed(1))));

  return {
    homeScore,
    awayScore,
    playerStats: {
      minutes,
      goals,
      assists,
      shots,
      passes,
      matchRating,
    },
  };
}

/**
 * Runs Continental Qualifier Matches (or CONMEBOL Sudamericano) for the player's nation and builds Standings Table.
 */
export function runQualifiersSimulation(
  player: PlayerCardData,
  nation: Nationality,
  tier: NationalTeamTier
): QualifierSummary {
  const tourneyInfo = getQualifiersTournamentInfo(nation.code, tier);
  const isConmebol = tourneyInfo.isSudamericano;

  let opponents: Top50NationSeedData[];
  if (isConmebol) {
    // All other CONMEBOL nations
    opponents = CONMEBOL_NATIONS_SEEDS.filter(
      (s) => s.code.toUpperCase() !== nation.code.toUpperCase()
    );
  } else {
    opponents = getContinentalOpponents(nation.code, 5);
  }

  const seedPlayerNation = (isConmebol ? CONMEBOL_NATIONS_SEEDS : TOP_50_NATIONAL_TEAMS_SEEDS).find(
    (s) => s.code.toUpperCase() === nation.code.toUpperCase()
  ) || {
    rank: 25,
    name: nation.name,
    code: nation.code,
    iso: nation.iso || 'gb-eng',
    confederation: (isConmebol ? 'CONMEBOL' : 'UEFA') as Confederation,
  };

  const playerTeamOvr = calculateSimulatedTeamOvr(seedPlayerNation.rank, tier);

  const groupTeams = [
    {
      code: nation.code,
      name: nation.name,
      iso: nation.iso || 'gb-eng',
      ovr: playerTeamOvr,
      isPlayer: true,
    },
    ...opponents.map((op) => ({
      code: op.code,
      name: op.name,
      iso: op.iso,
      ovr: calculateSimulatedTeamOvr(op.rank, tier),
      isPlayer: false,
    })),
  ];

  // Initialize Standings
  const tableMap = new Map<string, QualifierStandingRow>();
  groupTeams.forEach((gt) => {
    tableMap.set(gt.code, {
      nationCode: gt.code,
      nationName: gt.name,
      iso: gt.iso,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      qualified: false,
      isPlayerNation: gt.isPlayer,
    });
  });

  const matches: QualifierMatchResult[] = [];
  let totalGoals = 0;
  let totalAssists = 0;
  let totalRatingSum = 0;
  let matchesWithStats = 0;

  // For Sudamericano: play 5-9 tournament fixtures; for regular qualifiers: 5 matches
  const matchSchedule = isConmebol ? opponents.slice(0, Math.min(6, opponents.length)) : opponents;

  matchSchedule.forEach((op, idx) => {
    const opponentOvr = calculateSimulatedTeamOvr(op.rank, tier);
    const isHome = idx % 2 === 0;

    const res = simulateSingleInternationalMatch(
      isHome ? nation.name : op.name,
      isHome ? playerTeamOvr : opponentOvr,
      isHome ? op.name : nation.name,
      isHome ? opponentOvr : playerTeamOvr,
      isHome,
      !isHome,
      player.ovr || (tier === 'U17' ? 68 : tier === 'U20' ? 73 : 80),
      player.position || 'ST'
    );

    const homeCode = isHome ? nation.code : op.code;
    const awayCode = isHome ? op.code : nation.code;

    const hRow = tableMap.get(homeCode);
    const aRow = tableMap.get(awayCode);

    if (hRow && aRow) {
      hRow.played += 1;
      aRow.played += 1;
      hRow.goalsFor += res.homeScore;
      hRow.goalsAgainst += res.awayScore;
      aRow.goalsFor += res.awayScore;
      aRow.goalsAgainst += res.homeScore;

      if (res.homeScore > res.awayScore) {
        hRow.wins += 1;
        hRow.points += 3;
        aRow.losses += 1;
      } else if (res.awayScore > res.homeScore) {
        aRow.wins += 1;
        aRow.points += 3;
        hRow.losses += 1;
      } else {
        hRow.draws += 1;
        hRow.points += 1;
        aRow.draws += 1;
        aRow.points += 1;
      }
    }

    if (res.playerStats) {
      totalGoals += res.playerStats.goals;
      totalAssists += res.playerStats.assists;
      totalRatingSum += res.playerStats.matchRating;
      matchesWithStats++;
    }

    const stageLabel = isConmebol
      ? `${tourneyInfo.shortName} - Fecha ${idx + 1}`
      : `Qualifiers - Match ${idx + 1}`;

    matches.push({
      matchNumber: idx + 1,
      stageName: stageLabel,
      homeNation: {
        code: homeCode,
        name: isHome ? nation.name : op.name,
        iso: isHome ? nation.iso : op.iso,
        ovr: isHome ? playerTeamOvr : opponentOvr,
      },
      awayNation: {
        code: awayCode,
        name: isHome ? op.name : nation.name,
        iso: isHome ? op.iso : nation.iso,
        ovr: isHome ? opponentOvr : playerTeamOvr,
      },
      homeScore: res.homeScore,
      awayScore: res.awayScore,
      isPlayerMatch: true,
      playerStats: res.playerStats,
    });
  });

  // Calculate goal differences and sort standings
  const standings = Array.from(tableMap.values()).map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // Top qualifying slots (4 for Sudamericano Sub-17/Sub-20, 2 for UEFA)
  const qualifyingSlots = tourneyInfo.qualifyingSpots;
  standings.forEach((row, idx) => {
    if (idx < qualifyingSlots) {
      row.qualified = true;
    }
  });

  const playerNationRow = standings.find((s) => s.nationCode === nation.code);
  const playerQualified = playerNationRow ? playerNationRow.qualified : false;
  const playerRank = standings.findIndex((s) => s.nationCode === nation.code) + 1;

  const avgPlayerRating = matchesWithStats > 0 ? Number((totalRatingSum / matchesWithStats).toFixed(2)) : 7.5;

  const worldCupTitle = tier === 'Senior' ? 'FIFA World Cup' : `FIFA ${tier} World Cup`;

  let newsHeadline = '';
  let newsSummary = '';

  if (isConmebol) {
    newsHeadline = playerQualified
      ? `¡${nation.name.toUpperCase()} ${tier} CLASIFICA AL MUNDIAL ${tier} EN EL SUDAMERICANO!`
      : `${nation.name} ${tier} queda fuera del Mundial en el ${tourneyInfo.shortName}`;

    newsSummary = playerQualified
      ? `Con una brillante actuación en el ${tourneyInfo.competitionName} (sede ${tourneyInfo.hostCountry}), ${nation.name} finalizó en el puesto #${playerRank} con ${playerNationRow?.points || 0} pts, asegurando uno de los 4 cupos directos a la ${worldCupTitle}. ${player.name} aportó ${totalGoals} goles y ${totalAssists} asistencias.`
      : `${nation.name} finalizó en el puesto #${playerRank} del ${tourneyInfo.shortName} con ${playerNationRow?.points || 0} pts, quedando fuera de los 4 puestos de clasificación a la ${worldCupTitle}.`;
  } else {
    newsHeadline = playerQualified
      ? `${nation.name.toUpperCase()} ${tier} QUALIFY FOR THE ${worldCupTitle.toUpperCase()}!`
      : `${nation.name} ${tier} FAIL TO QUALIFY FOR THE ${worldCupTitle.toUpperCase()}`;

    newsSummary = playerQualified
      ? `Following intense continental qualifying matches in the ${tourneyInfo.competitionName}, ${nation.name} secured qualification (Rank #${playerRank}, ${playerNationRow?.points || 0} pts). ${player.name} led the campaign with ${totalGoals} goals and ${totalAssists} assists.`
      : `${nation.name} finished rank #${playerRank} with ${playerNationRow?.points || 0} points, falling short of the required qualifying slots for the ${worldCupTitle}.`;
  }

  return {
    tier,
    playerNation: nation,
    playerCalledUp: true,
    playerAccepted: true,
    competitionName: tourneyInfo.competitionName,
    matches,
    standings,
    playerQualified,
    newsHeadline,
    newsSummary,
    totalPlayerGoals: totalGoals,
    totalPlayerAssists: totalAssists,
    avgPlayerRating,
  };
}

/**
 * Simulates qualifiers for player's nation when player is NOT called up or DECLINES.
 */
export function simulateBackgroundQualifiers(
  playerNation: Nationality,
  tier: NationalTeamTier
): QualifierSummary {
  const dummyPlayer: PlayerCardData = {
    id: 'sim-p',
    name: 'Simulated Player',
    ovr: tier === 'U17' ? 66 : tier === 'U20' ? 72 : 78,
    age: tier === 'U17' ? 17 : tier === 'U20' ? 20 : 26,
    club: 'Simulated',
    nationality: playerNation,
    position: 'ST',
    stats: { pro: 70, def: 50, cre: 70, men: 70, goa: 70, phy: 70 },
    biometrics: { strength: 70, skinColor: '#fff', hairStyle: 'straight', hairLength: 'short', hairRoot: '#000', hairDye: '#000' },
    accessories: { accessory: 'none', headbandColor: '#fff' },
    kit: { style: 'normal', color1: '#000', color2: '#fff', pattern: 'solid', collar: 'crew' },
    emblem: { shape: 'circle', mode: '1', color1: '#000', color2: '#fff' },
  };

  const summary = runQualifiersSimulation(dummyPlayer, playerNation, tier);
  summary.playerCalledUp = false;
  summary.playerAccepted = false;
  summary.totalPlayerGoals = 0;
  summary.totalPlayerAssists = 0;

  const tourneyInfo = getQualifiersTournamentInfo(playerNation.code, tier);
  const tourneyName = tier === 'Senior' ? 'FIFA World Cup' : `FIFA ${tier} World Cup`;
  summary.newsHeadline = summary.playerQualified
    ? `${playerNation.name} ${tier} qualify for the ${tourneyName} via ${tourneyInfo.shortName}.`
    : `${playerNation.name} ${tier} fail to qualify for the ${tourneyName}.`;

  summary.newsSummary = summary.playerQualified
    ? `${playerNation.name} ${tier} secured qualification in the ${tourneyInfo.competitionName} and will compete in the upcoming ${tourneyName}.`
    : `${playerNation.name} ${tier} failed to secure a qualification slot in the ${tourneyInfo.shortName}.`;

  return summary;
}

/**
 * Simulates the World Cup tournament (4 group/knockout matches)
 */
export function simulateWorldCupTournament(
  player: PlayerCardData,
  nation: Nationality,
  tier: NationalTeamTier,
  isPlayerParticipating: boolean = true
): WorldCupSummary {
  const matches: QualifierMatchResult[] = [];
  let totalGoals = 0;
  let totalAssists = 0;

  const tournamentName = tier === 'Senior' ? 'FIFA World Cup' : `FIFA ${tier} World Cup`;

  const topSeeds = TOP_50_NATIONAL_TEAMS_SEEDS.slice(0, 8);
  const champSeed = topSeeds[Math.floor(Math.random() * topSeeds.length)];

  if (isPlayerParticipating) {
    const opp1 = getContinentalOpponents(nation.code, 3);
    const stages = ['Group Stage 1', 'Group Stage 2', 'Quarter-Final', 'Semi-Final / Final'];

    stages.forEach((stg, idx) => {
      const opp = opp1[idx % opp1.length];
      const oppOvr = calculateSimulatedTeamOvr(opp.rank, tier);
      const playerTeamOvr = calculateSimulatedTeamOvr(
        TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code === nation.code)?.rank || 20,
        tier
      );

      const res = simulateSingleInternationalMatch(
        nation.name,
        playerTeamOvr,
        opp.name,
        oppOvr,
        true,
        false,
        player.ovr || (tier === 'U17' ? 68 : tier === 'U20' ? 73 : 80),
        player.position || 'ST'
      );

      if (res.playerStats) {
        totalGoals += res.playerStats.goals;
        totalAssists += res.playerStats.assists;
      }

      matches.push({
        matchNumber: idx + 1,
        stageName: stg,
        homeNation: { code: nation.code, name: nation.name, iso: nation.iso, ovr: playerTeamOvr },
        awayNation: { code: opp.code, name: opp.name, iso: opp.iso, ovr: oppOvr },
        homeScore: res.homeScore,
        awayScore: res.awayScore,
        isPlayerMatch: true,
        playerStats: res.playerStats,
      });
    });

    const isWinner = matches.filter((m) => m.homeScore > m.awayScore).length >= 3;
    const finalStage = isWinner ? 'CHAMPIONS 🏆' : 'Quarter-Finals';

    return {
      tier,
      playerNation: nation,
      playerCalledUp: true,
      playerParticipated: true,
      champion: isWinner ? { name: nation.name, code: nation.code, iso: nation.iso } : { name: champSeed.name, code: champSeed.code, iso: champSeed.iso },
      playerFinishStage: finalStage,
      matches,
      newsHeadline: isWinner
        ? `${nation.name.toUpperCase()} ${tier.toUpperCase()} WIN THE ${tournamentName.toUpperCase()}!`
        : `${nation.name} ${tier} conclude ${tournamentName} in the ${finalStage}`,
      newsSummary: isWinner
        ? `${nation.name} ${tier} reached international glory by winning the ${tournamentName}! ${player.name} scored ${totalGoals} goals during the tournament.`
        : `${nation.name} ${tier} put on an inspiring display in the ${tournamentName}, reaching the ${finalStage}.`,
      totalPlayerGoals: totalGoals,
      totalPlayerAssists: totalAssists,
    };
  }

  // When player is not participating (not selected), simulate the full tournament in background so player can see results
  const opp1 = getContinentalOpponents(nation.code, 3);
  const stages = ['Group Stage - Matchday 1', 'Group Stage - Matchday 2', 'Group Stage - Matchday 3', 'Semi-Final', 'Grand Final'];
  const playerTeamOvr = calculateSimulatedTeamOvr(
    TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code === nation.code)?.rank || 20,
    tier
  );

  const tableMap = new Map<string, QualifierStandingRow>();
  const groupNations = [
    { code: nation.code, name: nation.name, iso: nation.iso || 'gb-eng', ovr: playerTeamOvr, isPlayer: false },
    ...opp1.slice(0, 3).map((op) => ({
      code: op.code,
      name: op.name,
      iso: op.iso,
      ovr: calculateSimulatedTeamOvr(op.rank, tier),
      isPlayer: false,
    })),
  ];

  groupNations.forEach((gn) => {
    tableMap.set(gn.code, {
      nationCode: gn.code,
      nationName: gn.name,
      iso: gn.iso,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      qualified: false,
      isPlayerNation: gn.code === nation.code,
    });
  });

  // 3 Group stage matches
  opp1.slice(0, 3).forEach((opp, idx) => {
    const oppOvr = calculateSimulatedTeamOvr(opp.rank, tier);
    const hScore = Math.floor(Math.random() * 3);
    const aScore = Math.floor(Math.random() * 3);

    const hRow = tableMap.get(nation.code);
    const aRow = tableMap.get(opp.code);
    if (hRow && aRow) {
      hRow.played += 1;
      aRow.played += 1;
      hRow.goalsFor += hScore;
      hRow.goalsAgainst += aScore;
      aRow.goalsFor += aScore;
      aRow.goalsAgainst += hScore;
      if (hScore > aScore) {
        hRow.wins += 1;
        hRow.points += 3;
        aRow.losses += 1;
      } else if (aScore > hScore) {
        aRow.wins += 1;
        aRow.points += 3;
        hRow.losses += 1;
      } else {
        hRow.draws += 1;
        hRow.points += 1;
        aRow.draws += 1;
        aRow.points += 1;
      }
    }

    matches.push({
      matchNumber: idx + 1,
      stageName: `Group Stage ${idx + 1}`,
      homeNation: { code: nation.code, name: nation.name, iso: nation.iso, ovr: playerTeamOvr },
      awayNation: { code: opp.code, name: opp.name, iso: opp.iso, ovr: oppOvr },
      homeScore: hScore,
      awayScore: aScore,
      isPlayerMatch: false,
    });
  });

  // Final match between top seeds
  const runnerUp = topSeeds.find((s) => s.code !== champSeed.code) || topSeeds[1];
  matches.push({
    matchNumber: 4,
    stageName: 'Grand Final',
    homeNation: { code: champSeed.code, name: champSeed.name, iso: champSeed.iso, ovr: 88 },
    awayNation: { code: runnerUp.code, name: runnerUp.name, iso: runnerUp.iso, ovr: 87 },
    homeScore: 2,
    awayScore: 1,
    isPlayerMatch: false,
  });

  const groupStandings = Array.from(tableMap.values()).sort(
    (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
  );
  if (groupStandings.length > 0) groupStandings[0].qualified = true;
  if (groupStandings.length > 1) groupStandings[1].qualified = true;

  return {
    tier,
    playerNation: nation,
    playerCalledUp: false,
    playerParticipated: false,
    champion: { name: champSeed.name, code: champSeed.code, iso: champSeed.iso },
    playerFinishStage: 'Group Stage (Spectator)',
    matches,
    groupStandings,
    newsHeadline: `${champSeed.name} crowned ${tier} ${tournamentName} Champions!`,
    newsSummary: `${champSeed.name} dominated the competition to claim the ${tournamentName} trophy. ${nation.name} were eliminated during the tournament while you watched as a spectator.`,
    totalPlayerGoals: 0,
    totalPlayerAssists: 0,
  };
}

/**
 * Creates and runs the Group Stage simulation for a Senior Continental Championship or World Cup,
 * setting up the tournament summary and preparing the first Knockout Key Match if qualified.
 */
export function createSeniorTournamentSummary(
  player: PlayerCardData,
  nation: Nationality,
  isContinental: boolean = false
): WorldCupSummary {
  const seedPlayerNation = TOP_50_NATIONAL_TEAMS_SEEDS.find(
    (s) => s.code.toUpperCase() === nation.code.toUpperCase()
  ) || {
    rank: 20,
    name: nation.name,
    code: nation.code,
    iso: nation.iso || 'gb-eng',
    confederation: 'UEFA' as Confederation,
  };

  const format = getConfederationTournamentFormat(seedPlayerNation.confederation, !isContinental);
  const playerTeamOvr = calculateSimulatedTeamOvr(seedPlayerNation.rank, 'Senior');

  // Group stage opponents
  const oppSeeds = getContinentalOpponents(nation.code, 3);
  const groupTeams = [
    { code: nation.code, name: nation.name, iso: nation.iso || 'gb-eng', ovr: playerTeamOvr, isPlayer: true },
    ...oppSeeds.map((op) => ({
      code: op.code,
      name: op.name,
      iso: op.iso,
      ovr: calculateSimulatedTeamOvr(op.rank, 'Senior'),
      isPlayer: false,
    })),
  ];

  const tableMap = new Map<string, QualifierStandingRow>();
  groupTeams.forEach((gt) => {
    tableMap.set(gt.code, {
      nationCode: gt.code,
      nationName: gt.name,
      iso: gt.iso,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      qualified: false,
      isPlayerNation: gt.isPlayer,
    });
  });

  const matches: QualifierMatchResult[] = [];
  let totalGoals = 0;
  let totalAssists = 0;

  // Simulate 3 Group Stage Matches
  oppSeeds.forEach((op, idx) => {
    const oppOvr = calculateSimulatedTeamOvr(op.rank, 'Senior');
    const isHome = idx % 2 === 0;

    const res = simulateSingleInternationalMatch(
      isHome ? nation.name : op.name,
      isHome ? playerTeamOvr : oppOvr,
      isHome ? op.name : nation.name,
      isHome ? oppOvr : playerTeamOvr,
      isHome,
      !isHome,
      player.ovr || 78,
      player.position || 'ST'
    );

    const homeCode = isHome ? nation.code : op.code;
    const awayCode = isHome ? op.code : nation.code;

    const hRow = tableMap.get(homeCode)!;
    const aRow = tableMap.get(awayCode)!;

    hRow.played += 1;
    aRow.played += 1;
    hRow.goalsFor += res.homeScore;
    hRow.goalsAgainst += res.awayScore;
    aRow.goalsFor += res.awayScore;
    aRow.goalsAgainst += res.homeScore;

    if (res.homeScore > res.awayScore) {
      hRow.wins += 1;
      hRow.points += 3;
      aRow.losses += 1;
    } else if (res.awayScore > res.homeScore) {
      aRow.wins += 1;
      aRow.points += 3;
      hRow.losses += 1;
    } else {
      hRow.draws += 1;
      hRow.points += 1;
      aRow.draws += 1;
      aRow.points += 1;
    }

    if (res.playerStats) {
      totalGoals += res.playerStats.goals;
      totalAssists += res.playerStats.assists;
    }

    matches.push({
      matchNumber: idx + 1,
      stageName: `Group Stage - Match ${idx + 1}`,
      homeNation: { code: homeCode, name: isHome ? nation.name : op.name, iso: isHome ? nation.iso : op.iso, ovr: isHome ? playerTeamOvr : oppOvr },
      awayNation: { code: awayCode, name: isHome ? op.name : nation.name, iso: isHome ? op.iso : nation.iso, ovr: isHome ? oppOvr : playerTeamOvr },
      homeScore: res.homeScore,
      awayScore: res.awayScore,
      isPlayerMatch: true,
      playerStats: res.playerStats,
    });
  });

  const groupStandings = Array.from(tableMap.values()).map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
  }));

  groupStandings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // Mark qualified
  groupStandings.forEach((row, rankIdx) => {
    if (rankIdx < format.advanceTopCount) row.qualified = true;
    else if (format.hasBest3rdPlace && rankIdx === 2) row.qualified = Math.random() < 0.75;
  });

  const playerRowIndex = groupStandings.findIndex((s) => s.nationCode === nation.code);
  const playerQualifiedGroup = playerRowIndex >= 0 ? groupStandings[playerRowIndex].qualified : false;

  const knockoutStages = format.knockoutStages;

  if (playerQualifiedGroup) {
    // Pick first knockout opponent
    const topSeeds = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.code !== nation.code);
    const oppSeed = topSeeds[Math.floor(Math.random() * Math.min(10, topSeeds.length))];
    const oppOvr = calculateSimulatedTeamOvr(oppSeed.rank, 'Senior');

    return {
      tier: 'Senior',
      playerNation: nation,
      playerCalledUp: true,
      playerParticipated: true,
      isContinental,
      competitionName: format.competitionName,
      champion: { name: 'TBD', code: 'TBD', iso: 'gb-eng' },
      playerFinishStage: knockoutStages[0],
      matches,
      groupStandings,
      currentKnockoutStageIndex: 0,
      knockoutStages,
      currentKnockoutOpponent: { code: oppSeed.code, name: oppSeed.name, iso: oppSeed.iso, ovr: oppOvr },
      isFinished: false,
      newsHeadline: `${nation.name.toUpperCase()} ADVANCE TO THE ${knockoutStages[0].toUpperCase()}!`,
      newsSummary: `${nation.name} finished rank #${playerRowIndex + 1} in their Group Stage with ${groupStandings[playerRowIndex]?.points} pts. They now face ${oppSeed.name} in the ${knockoutStages[0]}!`,
      totalPlayerGoals: totalGoals,
      totalPlayerAssists: totalAssists,
    };
  }

  // Eliminated in Group Stage
  return {
    tier: 'Senior',
    playerNation: nation,
    playerCalledUp: true,
    playerParticipated: true,
    isContinental,
    competitionName: format.competitionName,
    champion: { name: 'France', code: 'FRA', iso: 'fr' },
    playerFinishStage: 'Group Stage',
    matches,
    groupStandings,
    currentKnockoutStageIndex: 0,
    knockoutStages,
    isFinished: true,
    newsHeadline: `${nation.name} eliminated in the ${format.shortName} Group Stage`,
    newsSummary: `${nation.name} finished #${playerRowIndex + 1} in Group Stage and failed to qualify for the knockout rounds.`,
    totalPlayerGoals: totalGoals,
    totalPlayerAssists: totalAssists,
  };
}

/**
 * Advances the Senior Continental Championship / World Cup after a Knockout Key Match is completed.
 */
export function advanceSeniorTournamentKnockout(
  summary: WorldCupSummary,
  keyMatchResult: {
    playerScore: number;
    opponentScore: number;
    isWin: boolean;
    playerGoals: number;
    playerAssists: number;
  }
): WorldCupSummary {
  const updated = { ...summary };
  const stages = updated.knockoutStages || ['Quarter-Final', 'Semi-Final', 'Final'];
  const curIdx = updated.currentKnockoutStageIndex || 0;
  const stageName = stages[curIdx] || 'Knockout Round';

  updated.totalPlayerGoals = (updated.totalPlayerGoals || 0) + keyMatchResult.playerGoals;
  updated.totalPlayerAssists = (updated.totalPlayerAssists || 0) + keyMatchResult.playerAssists;

  const opp = updated.currentKnockoutOpponent || { code: 'OPP', name: 'Opponent', iso: 'gb-eng', ovr: 80 };

  // Append match result
  updated.matches = [
    ...(updated.matches || []),
    {
      matchNumber: updated.matches.length + 1,
      stageName,
      homeNation: { code: updated.playerNation.code, name: updated.playerNation.name, iso: updated.playerNation.iso, ovr: 80 },
      awayNation: { code: opp.code, name: opp.name, iso: opp.iso, ovr: opp.ovr },
      homeScore: keyMatchResult.playerScore,
      awayScore: keyMatchResult.opponentScore,
      isPlayerMatch: true,
      playerStats: {
        minutes: 90,
        goals: keyMatchResult.playerGoals,
        assists: keyMatchResult.playerAssists,
        shots: keyMatchResult.playerGoals + 2,
        passes: 32,
        matchRating: keyMatchResult.isWin ? 8.4 : 6.8,
      },
    },
  ];

  if (keyMatchResult.isWin) {
    if (curIdx < stages.length - 1) {
      // Advance to next knockout round!
      const nextIdx = curIdx + 1;
      const nextStageName = stages[nextIdx];

      const topSeeds = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.code !== updated.playerNation.code && s.code !== opp.code);
      const nextOppSeed = topSeeds[Math.floor(Math.random() * Math.min(8, topSeeds.length))];
      const nextOppOvr = calculateSimulatedTeamOvr(nextOppSeed.rank, 'Senior');

      updated.currentKnockoutStageIndex = nextIdx;
      updated.playerFinishStage = nextStageName;
      updated.currentKnockoutOpponent = {
        code: nextOppSeed.code,
        name: nextOppSeed.name,
        iso: nextOppSeed.iso,
        ovr: nextOppOvr,
      };
      updated.newsHeadline = `VICTORY! ${updated.playerNation.name.toUpperCase()} ADVANCE TO THE ${nextStageName.toUpperCase()}!`;
      updated.newsSummary = `${updated.playerNation.name} defeated ${opp.name} ${keyMatchResult.playerScore}-${keyMatchResult.opponentScore} in the ${stageName}! Next match: ${nextStageName} vs ${nextOppSeed.name}.`;
    } else {
      // CHAMPIONS 🏆!
      updated.playerFinishStage = 'CHAMPIONS 🏆';
      updated.champion = { name: updated.playerNation.name, code: updated.playerNation.code, iso: updated.playerNation.iso };
      updated.isFinished = true;
      updated.currentKnockoutOpponent = undefined;
      updated.newsHeadline = `${updated.playerNation.name.toUpperCase()} CROWNED ${updated.competitionName?.toUpperCase() || 'TOURNAMENT'} CHAMPIONS! 🏆`;
      updated.newsSummary = `Historic triumph! ${updated.playerNation.name} defeated ${opp.name} ${keyMatchResult.playerScore}-${keyMatchResult.opponentScore} in the Final to lift the trophy!`;
    }
  } else {
    // Eliminated in current round
    updated.playerFinishStage = stageName === 'Final' ? 'Runner-Up 🥈' : stageName;
    updated.champion = { name: opp.name, code: opp.code, iso: opp.iso };
    updated.isFinished = true;
    updated.currentKnockoutOpponent = undefined;
    updated.newsHeadline = `${updated.playerNation.name} eliminated in the ${stageName}`;
    updated.newsSummary = `${updated.playerNation.name} suffered a heartbreaking ${keyMatchResult.playerScore}-${keyMatchResult.opponentScore} defeat against ${opp.name} in the ${stageName}.`;
  }

  return updated;
}
