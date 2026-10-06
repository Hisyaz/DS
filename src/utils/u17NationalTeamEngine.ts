import { Nationality, PlayerCardData, TrophyItem } from '../types';
import { NationalTeam, NationalTeamTier, Confederation, InternationalCallUp } from '../types/nationalTeam';
import {
  InternationalTournamentHubState,
  InternationalFixture,
  InternationalStandingRow,
  MatchCommentaryItem,
} from '../types/internationalFootball';
import { TOP_50_NATIONAL_TEAMS_SEEDS, Top50NationSeedData } from '../data/top50NationalTeamsData';
import { getNationalTeamsDatabase } from './nationalTeamDatabaseManager';
import { getEligibleNationalities } from './nationalTeamSystem';
import { awardTrophiesToPlayer, createTrophyItem } from './trophySystem';

export interface U17NationDescriptor {
  code: string;
  name: string;
  iso: string;
  confederation: Confederation;
  ovr: number;
  isSimulationOnly: boolean;
  fifaRank?: number;
  managerName?: string;
  managerTactic?: string;
}

export interface U17TournamentRecord {
  seasonYear: string;
  year: number;
  stageReached: 'Champions' | 'Runners-up' | 'Third Place' | 'Semi-Final' | 'Quarter-Final' | 'Round of 16' | 'Round of 32' | 'Group Stage' | 'Qualifiers';
  playerNation: string;
  playerNationCode: string;
  playerRole: 'Key Starter' | 'Squad Player' | 'Promising Prospect';
  caps: number;
  goals: number;
  assists: number;
  avgRating: number;
  champion: { name: string; code: string; iso: string };
  runnerUp?: { name: string; code: string; iso: string };
  isWorldCup: boolean;
  competitionName: string;
  trophiesWon?: string[];
}

export interface U17MatchSimulationResult {
  homeScore: number;
  awayScore: number;
  penaltiesHome?: number;
  penaltiesAway?: number;
  extraTime?: boolean;
  winnerCode: string;
}

export interface U17GroupStanding {
  nation: U17NationDescriptor;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  groupLetter: string;
  qualified: boolean;
}

export interface U17QualifiersOutcome {
  seasonYear: number;
  competitionName: string;
  qualifiedNationCodes: string[];
  qualifiedNations: U17NationDescriptor[];
  playerNationQualified: boolean;
  playerNationStandingsRow?: U17GroupStanding;
  allGroups: Record<string, U17GroupStanding[]>;
}

export interface U17WorldCupOutcome {
  seasonYear: number;
  competitionName: string;
  groups: Record<string, U17GroupStanding[]>;
  knockoutRoundOf32: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[];
  knockoutRoundOf16: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[];
  knockoutQuarterFinals: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[];
  knockoutSemiFinals: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[];
  thirdPlaceMatch: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult };
  finalMatch: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult };
  champion: U17NationDescriptor;
  runnerUp: U17NationDescriptor;
  thirdPlace: U17NationDescriptor;
  playerFinishStage?: string;
  playerStats?: { goals: number; assists: number; caps: number; avgRating: number };
}

// ---------------------------------------------------------------------------
// 1. TOP 20 NATIONS CHECK & ELIGIBILITY THRESHOLDS
// ---------------------------------------------------------------------------

export const TOP_20_NATION_CODES = new Set([
  'ARG', 'FRA', 'ESP', 'ENG', 'BRA', 'BEL', 'NED', 'POR', 'COL', 'ITA',
  'URU', 'CRO', 'GER', 'MAR', 'SUI', 'USA', 'MEX', 'JPN', 'SEN', 'IRN'
]);

export function isTop20NationalTeam(nationCode: string, nationName?: string): boolean {
  const code = (nationCode || '').toUpperCase();
  if (TOP_20_NATION_CODES.has(code)) return true;

  const match = TOP_50_NATIONAL_TEAMS_SEEDS.find(
    (s) => s.code.toUpperCase() === code || (nationName && s.name.toLowerCase() === nationName.toLowerCase())
  );
  return Boolean(match && match.rank <= 20);
}

/**
 * Evaluates player eligibility for U17 Qualifiers:
 * - Age <= 16 (once age 17, cannot play qualifiers)
 * - Top 20: OVR 70+ (74+ for Starter, 70-73 for Squad Player)
 * - Outside Top 20: OVR 68+ (72+ for Starter, 68-71 for Squad Player)
 */
export function checkU17QualifiersEligibility(
  player: PlayerCardData,
  nation: Nationality
): {
  isEligible: boolean;
  role: 'Key Starter' | 'Squad Player';
  minOvrNeeded: number;
  starterOvrNeeded: number;
  reason?: string;
} {
  const age = player.age || 10;
  const ovr = player.ovr || player.overallRating || 60;
  const isTop20 = isTop20NationalTeam(nation.code, nation.name);

  const minOvrNeeded = isTop20 ? 70 : 68;
  const starterOvrNeeded = isTop20 ? 74 : 72;

  if (age > 16) {
    return {
      isEligible: false,
      role: 'Squad Player',
      minOvrNeeded,
      starterOvrNeeded,
      reason: `Age ${age} exceeds U17 Qualifiers limit (Age <= 16 required).`,
    };
  }

  if (ovr < minOvrNeeded) {
    return {
      isEligible: false,
      role: 'Squad Player',
      minOvrNeeded,
      starterOvrNeeded,
      reason: `OVR ${ovr} below ${minOvrNeeded} threshold for ${isTop20 ? 'Top 20 Nation' : 'National Team'}.`,
    };
  }

  const role: 'Key Starter' | 'Squad Player' = ovr >= starterOvrNeeded ? 'Key Starter' : 'Squad Player';

  return {
    isEligible: true,
    role,
    minOvrNeeded,
    starterOvrNeeded,
  };
}

/**
 * Evaluates player eligibility for U17 World Cup:
 * - Age <= 17 (once age 18, NEVER called for U17 World Cup)
 * - Nation must be qualified
 * - Top 20: OVR 70+ (74+ for Starter, 70-73 for Squad Player)
 * - Outside Top 20: OVR 68+ (72+ for Starter, 68-71 for Squad Player)
 */
export function checkU17WorldCupEligibility(
  player: PlayerCardData,
  nation: Nationality,
  isNationQualified: boolean = true
): {
  isEligible: boolean;
  role: 'Key Starter' | 'Squad Player';
  minOvrNeeded: number;
  starterOvrNeeded: number;
  reason?: string;
} {
  const age = player.age || 10;
  const ovr = player.ovr || player.overallRating || 60;
  const isTop20 = isTop20NationalTeam(nation.code, nation.name);

  const minOvrNeeded = isTop20 ? 70 : 68;
  const starterOvrNeeded = isTop20 ? 74 : 72;

  if (age > 17) {
    return {
      isEligible: false,
      role: 'Squad Player',
      minOvrNeeded,
      starterOvrNeeded,
      reason: `Age ${age} exceeds U17 World Cup limit (Age <= 17 required).`,
    };
  }

  if (!isNationQualified) {
    return {
      isEligible: false,
      role: 'Squad Player',
      minOvrNeeded,
      starterOvrNeeded,
      reason: `${nation.name} did not qualify for the U17 World Cup.`,
    };
  }

  if (ovr < minOvrNeeded) {
    return {
      isEligible: false,
      role: 'Squad Player',
      minOvrNeeded,
      starterOvrNeeded,
      reason: `OVR ${ovr} below ${minOvrNeeded} threshold for ${isTop20 ? 'Top 20 Nation' : 'National Team'}.`,
    };
  }

  const role: 'Key Starter' | 'Squad Player' = ovr >= starterOvrNeeded ? 'Key Starter' : 'Squad Player';

  return {
    isEligible: true,
    role,
    minOvrNeeded,
    starterOvrNeeded,
  };
}

// ---------------------------------------------------------------------------
// 2. SIMULATION-ONLY NATIONS DATABASE & OVR CALCULATION (RULE 8)
// ---------------------------------------------------------------------------

export interface SimOnlyNationSeed {
  code: string;
  name: string;
  iso: string;
  confederation: Confederation;
  worldRank: number; // 51, 52, ...
}

export const SIMULATION_ONLY_NATIONS_SEEDS: SimOnlyNationSeed[] = [
  // UEFA (Ranks 51 - 65)
  { code: 'NOR', name: 'Norway', iso: 'no', confederation: 'UEFA', worldRank: 51 },
  { code: 'GRE', name: 'Greece', iso: 'gr', confederation: 'UEFA', worldRank: 52 },
  { code: 'IRL', name: 'Republic of Ireland', iso: 'ie', confederation: 'UEFA', worldRank: 53 },
  { code: 'FIN', name: 'Finland', iso: 'fi', confederation: 'UEFA', worldRank: 54 },
  { code: 'BIH', name: 'Bosnia and Herzegovina', iso: 'ba', confederation: 'UEFA', worldRank: 55 },
  { code: 'NIR', name: 'Northern Ireland', iso: 'gb-nir', confederation: 'UEFA', worldRank: 56 },
  { code: 'ISL', name: 'Iceland', iso: 'is', confederation: 'UEFA', worldRank: 57 },
  { code: 'ALB', name: 'Albania', iso: 'al', confederation: 'UEFA', worldRank: 58 },
  { code: 'MKD', name: 'North Macedonia', iso: 'mk', confederation: 'UEFA', worldRank: 59 },
  { code: 'MNE', name: 'Montenegro', iso: 'me', confederation: 'UEFA', worldRank: 60 },
  { code: 'GEO', name: 'Georgia', iso: 'ge', confederation: 'UEFA', worldRank: 61 },
  { code: 'BUL', name: 'Bulgaria', iso: 'bg', confederation: 'UEFA', worldRank: 62 },
  { code: 'SVN', name: 'Slovenia', iso: 'si', confederation: 'UEFA', worldRank: 63 },
  { code: 'LUX', name: 'Luxembourg', iso: 'lu', confederation: 'UEFA', worldRank: 64 },

  // CONMEBOL (All remaining CONMEBOL teams not in Top 50)
  { code: 'BOL', name: 'Bolivia', iso: 'bo', confederation: 'CONMEBOL', worldRank: 65 },
  { code: 'PAR', name: 'Paraguay', iso: 'py', confederation: 'CONMEBOL', worldRank: 66 },
  { code: 'VEN', name: 'Venezuela', iso: 've', confederation: 'CONMEBOL', worldRank: 67 },

  // AFC (Asian teams)
  { code: 'KSA', name: 'Saudi Arabia', iso: 'sa', confederation: 'AFC', worldRank: 68 },
  { code: 'UZB', name: 'Uzbekistan', iso: 'uz', confederation: 'AFC', worldRank: 69 },
  { code: 'IRQ', name: 'Iraq', iso: 'iq', confederation: 'AFC', worldRank: 70 },
  { code: 'JOR', name: 'Jordan', iso: 'jo', confederation: 'AFC', worldRank: 71 },
  { code: 'CHN', name: 'China PR', iso: 'cn', confederation: 'AFC', worldRank: 72 },
  { code: 'TJK', name: 'Tajikistan', iso: 'tj', confederation: 'AFC', worldRank: 73 },
  { code: 'VIE', name: 'Vietnam', iso: 'vn', confederation: 'AFC', worldRank: 74 },
  { code: 'THA', name: 'Thailand', iso: 'th', confederation: 'AFC', worldRank: 75 },
  { code: 'IDN', name: 'Indonesia', iso: 'id', confederation: 'AFC', worldRank: 76 },
  { code: 'OMA', name: 'Oman', iso: 'om', confederation: 'AFC', worldRank: 77 },
  { code: 'BHR', name: 'Bahrain', iso: 'bh', confederation: 'AFC', worldRank: 78 },
  { code: 'SYR', name: 'Syria', iso: 'sy', confederation: 'AFC', worldRank: 79 },
  { code: 'LBN', name: 'Lebanon', iso: 'lb', confederation: 'AFC', worldRank: 80 },
  { code: 'IND', name: 'India', iso: 'in', confederation: 'AFC', worldRank: 81 },

  // CONCACAF (North/Central America and Caribbean)
  { code: 'JAM', name: 'Jamaica', iso: 'jm', confederation: 'CONCACAF', worldRank: 82 },
  { code: 'HON', name: 'Honduras', iso: 'hn', confederation: 'CONCACAF', worldRank: 83 },
  { code: 'SLV', name: 'El Salvador', iso: 'sv', confederation: 'CONCACAF', worldRank: 84 },
  { code: 'HAI', name: 'Haiti', iso: 'ht', confederation: 'CONCACAF', worldRank: 85 },
  { code: 'TRI', name: 'Trinidad and Tobago', iso: 'tt', confederation: 'CONCACAF', worldRank: 86 },
  { code: 'GUA', name: 'Guatemala', iso: 'gt', confederation: 'CONCACAF', worldRank: 87 },
  { code: 'CUR', name: 'Curaçao', iso: 'cw', confederation: 'CONCACAF', worldRank: 88 },
  { code: 'NCA', name: 'Nicaragua', iso: 'ni', confederation: 'CONCACAF', worldRank: 89 },
  { code: 'SUR', name: 'Suriname', iso: 'sr', confederation: 'CONCACAF', worldRank: 90 },
  { code: 'CUB', name: 'Cuba', iso: 'cu', confederation: 'CONCACAF', worldRank: 91 },
  { code: 'BLZ', name: 'Belize', iso: 'bz', confederation: 'CONCACAF', worldRank: 92 },

  // CAF (African teams)
  { code: 'NGA', name: 'Nigeria', iso: 'ng', confederation: 'CAF', worldRank: 93 },
  { code: 'GHA', name: 'Ghana', iso: 'gh', confederation: 'CAF', worldRank: 94 },
  { code: 'RSA', name: 'South Africa', iso: 'za', confederation: 'CAF', worldRank: 95 },
  { code: 'COD', name: 'DR Congo', iso: 'cd', confederation: 'CAF', worldRank: 96 },
  { code: 'GUI', name: 'Guinea', iso: 'gn', confederation: 'CAF', worldRank: 97 },
  { code: 'ZAM', name: 'Zambia', iso: 'zm', confederation: 'CAF', worldRank: 98 },
  { code: 'UGA', name: 'Uganda', iso: 'ug', confederation: 'CAF', worldRank: 99 },
  { code: 'ANG', name: 'Angola', iso: 'ao', confederation: 'CAF', worldRank: 100 },
  { code: 'BEN', name: 'Benin', iso: 'bj', confederation: 'CAF', worldRank: 101 },
  { code: 'KEN', name: 'Kenya', iso: 'ke', confederation: 'CAF', worldRank: 102 },
  { code: 'GAB', name: 'Gabon', iso: 'ga', confederation: 'CAF', worldRank: 103 },
  { code: 'BFA', name: 'Burkina Faso', iso: 'bf', confederation: 'CAF', worldRank: 104 },

  // OFC (Oceania teams)
  { code: 'FIJ', name: 'Fiji', iso: 'fj', confederation: 'OFC', worldRank: 105 },
  { code: 'SOL', name: 'Solomon Islands', iso: 'sb', confederation: 'OFC', worldRank: 106 },
  { code: 'NCL', name: 'New Caledonia', iso: 'nc', confederation: 'OFC', worldRank: 107 },
  { code: 'TAH', name: 'Tahiti', iso: 'pf', confederation: 'OFC', worldRank: 108 },
  { code: 'VAN', name: 'Vanuatu', iso: 'vu', confederation: 'OFC', worldRank: 109 },
  { code: 'PNG', name: 'Papua New Guinea', iso: 'pg', confederation: 'OFC', worldRank: 110 },
  { code: 'SAM', name: 'Samoa', iso: 'ws', confederation: 'OFC', worldRank: 111 },
];

/**
 * Returns the baseline U17 OVR of the 50th-ranked implemented national team.
 */
export function get50thNationU17Ovr(): number {
  const db = getNationalTeamsDatabase();
  const sorted = [...db].sort((a, b) => (a.fifaRanking || 25) - (b.fifaRanking || 25));
  const team50 = sorted[sorted.length - 1];
  if (team50 && team50.u17Squad && team50.u17Squad.length > 0) {
    const top11 = team50.u17Squad.slice(0, 11);
    const sum = top11.reduce((acc, p) => acc + (p.ovr || p.overallRating || 60), 0);
    return Math.round(sum / top11.length);
  }
  return 55; // Default realistic 50th U17 OVR
}

/**
 * Calculates a Simulation-Only National Team OVR using Rule 8:
 * OVR = OVR of 50th nation - 1 point per rank position below 50.
 */
export function calculateSimOnlyU17Ovr(worldRank: number, base50Ovr?: number): number {
  const base = base50Ovr ?? get50thNationU17Ovr();
  const delta = Math.max(1, (worldRank || 51) - 50);
  return Math.max(25, base - delta);
}

/**
 * Fetches all implemented national teams mapped to their confederation.
 */
export function getImplementedU17Nations(): U17NationDescriptor[] {
  const db = getNationalTeamsDatabase();
  return db.map((team) => {
    let ovr = 65;
    if (team.u17Squad && team.u17Squad.length > 0) {
      const top11 = team.u17Squad.slice(0, 11);
      const sum = top11.reduce((acc, p) => acc + (p.ovr || p.overallRating || 65), 0);
      ovr = Math.round(sum / top11.length);
    } else if (team.fifaRanking) {
      ovr = Math.max(52, 75 - Math.round(team.fifaRanking * 0.4));
    }

    return {
      code: team.nation.code.toUpperCase(),
      name: team.nation.name,
      iso: team.nation.iso || 'gb-eng',
      confederation: (team.confederation || 'UEFA') as Confederation,
      ovr,
      isSimulationOnly: false,
      fifaRank: team.fifaRanking || 25,
      managerName: team.manager?.name || `${team.nation.name} U17 Coach`,
      managerTactic: (team.manager as any)?.primaryTactic?.style || (team.manager as any)?.preferredTactic || 'Balanced',
    };
  });
}

/**
 * Builds the complete confederation pool for U17 qualification.
 * Combines implemented nations with generated simulation-only nations as needed.
 */
export function getConfederationPool(confederation: Confederation): U17NationDescriptor[] {
  const implemented = getImplementedU17Nations().filter((n) => n.confederation === confederation);
  const base50Ovr = get50thNationU17Ovr();

  const simSeeds = SIMULATION_ONLY_NATIONS_SEEDS.filter(
    (s) => s.confederation === confederation && !implemented.some((imp) => imp.code === s.code)
  );

  const simOnlyNations: U17NationDescriptor[] = simSeeds.map((seed) => ({
    code: seed.code,
    name: seed.name,
    iso: seed.iso,
    confederation: seed.confederation,
    ovr: calculateSimOnlyU17Ovr(seed.worldRank, base50Ovr),
    isSimulationOnly: true,
    fifaRank: seed.worldRank,
    managerName: `${seed.name} U17 Coach`,
    managerTactic: 'Balanced',
  }));

  return [...implemented, ...simOnlyNations];
}

/**
 * Checks whether a given nation code is a simulation-only nation.
 */
export function isSimulationOnlyNation(code: string): boolean {
  const db = getNationalTeamsDatabase();
  return !db.some((t) => t.nation.code.toUpperCase() === code.toUpperCase());
}

// ---------------------------------------------------------------------------
// 3. MATCH SIMULATION ENGINE WITH RIGGING RULE (RULE 9 & 10)
// ---------------------------------------------------------------------------

/**
 * Core match simulation with Rule 9:
 * - Implemented Nation vs Simulation-Only Nation: Implemented MUST win!
 * - Simulation-Only vs Simulation-Only: Normal OVR-based simulation.
 * - Implemented vs Implemented: Normal lightweight simulation with 30% random factor.
 */
export function simulateU17Match(
  home: U17NationDescriptor,
  away: U17NationDescriptor,
  isKnockout: boolean = false
): U17MatchSimulationResult {
  const homeIsSimOnly = home.isSimulationOnly;
  const awayIsSimOnly = away.isSimulationOnly;

  // RULE 9: RIGGING APPLIES ONLY BETWEEN IMPLEMENTED AND SIMULATION-ONLY NATIONS
  if (!homeIsSimOnly && awayIsSimOnly) {
    // HOME (Implemented) MUST WIN!
    const winScores = [
      [2, 0], [3, 0], [2, 1], [3, 1], [4, 0], [4, 1], [1, 0]
    ];
    const pick = winScores[Math.floor(Math.random() * winScores.length)];
    return {
      homeScore: pick[0],
      awayScore: pick[1],
      winnerCode: home.code,
    };
  }

  if (homeIsSimOnly && !awayIsSimOnly) {
    // AWAY (Implemented) MUST WIN!
    const winScores = [
      [0, 2], [0, 3], [1, 2], [1, 3], [0, 4], [1, 4], [0, 1]
    ];
    const pick = winScores[Math.floor(Math.random() * winScores.length)];
    return {
      homeScore: pick[0],
      awayScore: pick[1],
      winnerCode: away.code,
    };
  }

  // UNRIGGED SIMULATION: Both Implemented OR Both Simulation-Only
  // Primary strength (70%) + Random factor (30%)
  const homeRoll = (home.ovr + 1.5) * 0.70 + (Math.random() * 85 + 15) * 0.30;
  const awayRoll = away.ovr * 0.70 + (Math.random() * 85 + 15) * 0.30;
  const diff = homeRoll - awayRoll;

  const expectedHome = Math.max(0.2, 1.25 + diff * 0.05);
  const expectedAway = Math.max(0.2, 1.05 - diff * 0.05);

  let homeScore = samplePoissonGoals(expectedHome);
  let awayScore = samplePoissonGoals(expectedAway);

  let penaltiesHome: number | undefined;
  let penaltiesAway: number | undefined;
  let extraTime = false;
  let winnerCode = homeScore > awayScore ? home.code : awayScore > homeScore ? away.code : 'DRAW';

  if (isKnockout && homeScore === awayScore) {
    extraTime = true;
    if (Math.random() < 0.25) {
      if (Math.random() > 0.5) homeScore += 1;
      else awayScore += 1;
      winnerCode = homeScore > awayScore ? home.code : away.code;
    } else {
      // Penalty shootout
      penaltiesHome = Math.random() > 0.5 ? 5 : 4;
      penaltiesAway = penaltiesHome === 5 ? (Math.random() > 0.5 ? 4 : 3) : 5;
      winnerCode = penaltiesHome > penaltiesAway ? home.code : away.code;
    }
  }

  return {
    homeScore,
    awayScore,
    penaltiesHome,
    penaltiesAway,
    extraTime,
    winnerCode,
  };
}

function samplePoissonGoals(lambda: number): number {
  const L = Math.exp(-Math.max(0.2, Math.min(3.5, lambda)));
  let k = 0;
  let p = 1.0;
  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 8);
  return Math.min(5, Math.max(0, k - 1));
}

// ---------------------------------------------------------------------------
// 4. CONFEDERATION QUALIFICATION TOURNAMENTS (11 UEFA, 7 CONMEBOL, 9 AFC, 8 CONCACAF, 10 CAF, 3 OFC = 48)
// ---------------------------------------------------------------------------

/**
 * Runs a 4-team single round-robin group.
 */
function simulateSingleGroup(
  groupLetter: string,
  teams: U17NationDescriptor[],
  playerNationCode?: string
): { standings: U17GroupStanding[]; fixtures: { home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[] } {
  const standingsMap = new Map<string, U17GroupStanding>();
  teams.forEach((t) => {
    standingsMap.set(t.code, {
      nation: t,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      groupLetter,
      qualified: false,
    });
  });

  const fixtures: { home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[] = [];

  // Round-robin: 6 matches
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const home = teams[i];
      const away = teams[j];
      const res = simulateU17Match(home, away, false);
      fixtures.push({ home, away, result: res });

      const hRow = standingsMap.get(home.code)!;
      const aRow = standingsMap.get(away.code)!;

      hRow.played += 1;
      aRow.played += 1;
      hRow.goalsFor += res.homeScore;
      hRow.goalsAgainst += res.awayScore;
      aRow.goalsFor += res.awayScore;
      aRow.goalsAgainst += res.homeScore;
      hRow.goalDifference = hRow.goalsFor - hRow.goalsAgainst;
      aRow.goalDifference = aRow.goalsFor - aRow.goalsAgainst;

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
  }

  const sorted = Array.from(standingsMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.nation.ovr - a.nation.ovr;
  });

  return { standings: sorted, fixtures };
}

/**
 * Simulates the entire U17 qualification cycle across all 6 confederations.
 * Produces exactly 48 qualified nations:
 * - UEFA: 11
 * - CONMEBOL: 7
 * - AFC: 9
 * - CONCACAF: 8
 * - CAF: 10
 * - OFC: 3
 */
export function runCompleteU17Qualifiers(
  seasonYear: number,
  playerNation?: Nationality
): U17QualifiersOutcome {
  const pCode = playerNation?.code?.toUpperCase();
  const qualified: U17NationDescriptor[] = [];
  const allGroups: Record<string, U17GroupStanding[]> = {};
  let playerRow: U17GroupStanding | undefined;

  // --- 1. UEFA (28 teams, 7 groups of 4; 7 winners + 4 best runners-up = 11 qualify) ---
  const uefaPool = getConfederationPool('UEFA');
  // Seed teams into 7 groups
  const uefaGroupsTeams: U17NationDescriptor[][] = Array.from({ length: 7 }, () => []);
  uefaPool.slice(0, 28).forEach((team, idx) => {
    uefaGroupsTeams[idx % 7].push(team);
  });

  const uefaRunnersUp: U17GroupStanding[] = [];
  uefaGroupsTeams.forEach((grp, idx) => {
    const letter = String.fromCharCode(65 + idx); // A through G
    const { standings } = simulateSingleGroup(letter, grp, pCode);
    allGroups[`UEFA_${letter}`] = standings;

    // Winner qualifies
    standings[0].qualified = true;
    qualified.push(standings[0].nation);

    // Runner-up candidate
    if (standings[1]) uefaRunnersUp.push(standings[1]);

    if (pCode && standings.some((s) => s.nation.code === pCode)) {
      playerRow = standings.find((s) => s.nation.code === pCode);
    }
  });

  // Pick 4 best runners-up
  uefaRunnersUp.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
  uefaRunnersUp.slice(0, 4).forEach((ru) => {
    ru.qualified = true;
    qualified.push(ru.nation);
  });

  // --- 2. CONMEBOL (10 teams: 2 groups of 5; top 3 each + 1 playoff winner = 7 qualify) ---
  const conmebolPool = getConfederationPool('CONMEBOL');
  const conmebolTeams = conmebolPool.slice(0, 10);
  const grpA = conmebolTeams.slice(0, 5);
  const grpB = conmebolTeams.slice(5, 10);

  const resConmebolA = simulateSingleGroup('A', grpA, pCode);
  const resConmebolB = simulateSingleGroup('B', grpB, pCode);
  allGroups['CONMEBOL_A'] = resConmebolA.standings;
  allGroups['CONMEBOL_B'] = resConmebolB.standings;

  // Top 3 from each qualify (6 teams)
  for (let i = 0; i < 3; i++) {
    resConmebolA.standings[i].qualified = true;
    qualified.push(resConmebolA.standings[i].nation);
    resConmebolB.standings[i].qualified = true;
    qualified.push(resConmebolB.standings[i].nation);
  }
  // Playoff between 4th place teams for the 7th spot
  const team4A = resConmebolA.standings[3];
  const team4B = resConmebolB.standings[3];
  const playoff = simulateU17Match(team4A.nation, team4B.nation, true);
  if (playoff.winnerCode === team4A.nation.code) {
    team4A.qualified = true;
    qualified.push(team4A.nation);
  } else {
    team4B.qualified = true;
    qualified.push(team4B.nation);
  }

  if (pCode) {
    const found = [...resConmebolA.standings, ...resConmebolB.standings].find((s) => s.nation.code === pCode);
    if (found) playerRow = found;
  }

  // --- 3. AFC (16 teams, 4 groups of 4; top 2 each + 1 host/playoff = 9 qualify) ---
  const afcPool = getConfederationPool('AFC');
  const afcGroupsTeams: U17NationDescriptor[][] = Array.from({ length: 4 }, () => []);
  afcPool.slice(0, 16).forEach((team, idx) => {
    afcGroupsTeams[idx % 4].push(team);
  });

  const afcThirdPlace: U17GroupStanding[] = [];
  afcGroupsTeams.forEach((grp, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const { standings } = simulateSingleGroup(letter, grp, pCode);
    allGroups[`AFC_${letter}`] = standings;

    // Top 2 qualify
    standings[0].qualified = true;
    qualified.push(standings[0].nation);
    standings[1].qualified = true;
    qualified.push(standings[1].nation);

    if (standings[2]) afcThirdPlace.push(standings[2]);

    if (pCode && standings.some((s) => s.nation.code === pCode)) {
      playerRow = standings.find((s) => s.nation.code === pCode);
    }
  });

  // Best 3rd place gets 9th spot
  afcThirdPlace.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  if (afcThirdPlace[0]) {
    afcThirdPlace[0].qualified = true;
    qualified.push(afcThirdPlace[0].nation);
  }

  // --- 4. CONCACAF (16 teams, 4 groups of 4; top 2 each = 8 qualify) ---
  const concacafPool = getConfederationPool('CONCACAF');
  const concacafGroupsTeams: U17NationDescriptor[][] = Array.from({ length: 4 }, () => []);
  concacafPool.slice(0, 16).forEach((team, idx) => {
    concacafGroupsTeams[idx % 4].push(team);
  });

  concacafGroupsTeams.forEach((grp, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const { standings } = simulateSingleGroup(letter, grp, pCode);
    allGroups[`CONCACAF_${letter}`] = standings;

    standings[0].qualified = true;
    qualified.push(standings[0].nation);
    standings[1].qualified = true;
    qualified.push(standings[1].nation);

    if (pCode && standings.some((s) => s.nation.code === pCode)) {
      playerRow = standings.find((s) => s.nation.code === pCode);
    }
  });

  // --- 5. CAF (16 teams, 4 groups of 4; top 2 each + 2 best 3rd = 10 qualify) ---
  const cafPool = getConfederationPool('CAF');
  const cafGroupsTeams: U17NationDescriptor[][] = Array.from({ length: 4 }, () => []);
  cafPool.slice(0, 16).forEach((team, idx) => {
    cafGroupsTeams[idx % 4].push(team);
  });

  const cafThirdPlace: U17GroupStanding[] = [];
  cafGroupsTeams.forEach((grp, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const { standings } = simulateSingleGroup(letter, grp, pCode);
    allGroups[`CAF_${letter}`] = standings;

    standings[0].qualified = true;
    qualified.push(standings[0].nation);
    standings[1].qualified = true;
    qualified.push(standings[1].nation);

    if (standings[2]) cafThirdPlace.push(standings[2]);

    if (pCode && standings.some((s) => s.nation.code === pCode)) {
      playerRow = standings.find((s) => s.nation.code === pCode);
    }
  });

  cafThirdPlace.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  cafThirdPlace.slice(0, 2).forEach((tp) => {
    tp.qualified = true;
    qualified.push(tp.nation);
  });

  // --- 6. OFC (8 teams, 2 groups of 4; finalists + 3rd place = 3 qualify) ---
  const ofcPool = getConfederationPool('OFC');
  const ofcGrpA = ofcPool.slice(0, 4);
  const ofcGrpB = ofcPool.slice(4, 8);

  const resOfcA = simulateSingleGroup('A', ofcGrpA, pCode);
  const resOfcB = simulateSingleGroup('B', ofcGrpB, pCode);
  allGroups['OFC_A'] = resOfcA.standings;
  allGroups['OFC_B'] = resOfcB.standings;

  // Semi-finals: A1 vs B2, B1 vs A2
  const sf1 = simulateU17Match(resOfcA.standings[0].nation, resOfcB.standings[1].nation, true);
  const sf2 = simulateU17Match(resOfcB.standings[0].nation, resOfcA.standings[1].nation, true);

  const finalist1 = sf1.winnerCode === resOfcA.standings[0].nation.code ? resOfcA.standings[0].nation : resOfcB.standings[1].nation;
  const finalist2 = sf2.winnerCode === resOfcB.standings[0].nation.code ? resOfcB.standings[0].nation : resOfcA.standings[1].nation;

  const sf1Loser = sf1.winnerCode === resOfcA.standings[0].nation.code ? resOfcB.standings[1].nation : resOfcA.standings[0].nation;
  const sf2Loser = sf2.winnerCode === resOfcB.standings[0].nation.code ? resOfcA.standings[1].nation : resOfcB.standings[0].nation;
  const thirdPlaceMatch = simulateU17Match(sf1Loser, sf2Loser, true);
  const thirdPlaceNation = thirdPlaceMatch.winnerCode === sf1Loser.code ? sf1Loser : sf2Loser;

  [finalist1, finalist2, thirdPlaceNation].forEach((team) => {
    qualified.push(team);
    const matchRow = [...resOfcA.standings, ...resOfcB.standings].find((s) => s.nation.code === team.code);
    if (matchRow) matchRow.qualified = true;
  });

  if (pCode) {
    const found = [...resOfcA.standings, ...resOfcB.standings].find((s) => s.nation.code === pCode);
    if (found) playerRow = found;
  }

  // Deduplicate and ensure exactly 48 qualified nations
  const uniqueQualifiedMap = new Map<string, U17NationDescriptor>();
  qualified.forEach((n) => uniqueQualifiedMap.set(n.code, n));

  // If slightly under 48 due to duplicates, fill from top implemented nations
  if (uniqueQualifiedMap.size < 48) {
    const implemented = getImplementedU17Nations();
    for (const imp of implemented) {
      if (!uniqueQualifiedMap.has(imp.code)) {
        uniqueQualifiedMap.set(imp.code, imp);
        if (uniqueQualifiedMap.size >= 48) break;
      }
    }
  }

  const finalQualifiedList = Array.from(uniqueQualifiedMap.values()).slice(0, 48);
  const playerQualified = Boolean(playerRow?.qualified || (pCode && finalQualifiedList.some((n) => n.code === pCode)));

  return {
    seasonYear,
    competitionName: 'FIFA U17 World Cup Continental Qualifiers',
    qualifiedNationCodes: finalQualifiedList.map((n) => n.code),
    qualifiedNations: finalQualifiedList,
    playerNationQualified: playerQualified,
    playerNationStandingsRow: playerRow,
    allGroups,
  };
}

// ---------------------------------------------------------------------------
// 5. 48-NATION FIFA U17 WORLD CUP (12 GROUPS OF 4, 32-TEAM KNOCKOUT BRACKET)
// ---------------------------------------------------------------------------

/**
 * Simulates the 48-Nation FIFA U17 World Cup.
 * - 12 Groups of 4 (Groups A to L)
 * - Single round-robin (3 matches per team)
 * - 32 teams advance: Top 2 from each group (24) + 8 best 3rd place teams (8)
 * - Knockout: Round of 32 -> Round of 16 -> Quarter-Finals -> Semi-Finals -> Final
 */
export function runCompleteU17WorldCup(
  seasonYear: number,
  qualifiedNations: U17NationDescriptor[],
  player: PlayerCardData,
  playerParticipating: boolean = false,
  callingNation?: Nationality
): U17WorldCupOutcome {
  const pCode = callingNation?.code || player.nationality?.code || '';

  // Ensure 48 nations present
  let pool = [...qualifiedNations];
  if (pool.length < 48) {
    const qualOutcome = runCompleteU17Qualifiers(seasonYear, callingNation);
    for (const qn of qualOutcome.qualifiedNations) {
      if (!pool.some((n) => n.code === qn.code)) {
        pool.push(qn);
        if (pool.length >= 48) break;
      }
    }
  }
  pool = pool.slice(0, 48);

  // Shuffle pool with seed determinism
  pool.sort(() => Math.random() - 0.5);

  // If player is participating, ensure player nation is in Group A or prominent
  if (playerParticipating && pCode) {
    const pIdx = pool.findIndex((n) => n.code === pCode);
    if (pIdx !== -1 && pIdx >= 4) {
      const temp = pool[0];
      pool[0] = pool[pIdx];
      pool[pIdx] = temp;
    }
  }

  // 12 Groups of 4 (A through L)
  const groupStandings: Record<string, U17GroupStanding[]> = {};
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const winnersMap = new Map<string, U17NationDescriptor>();
  const runnersUpMap = new Map<string, U17NationDescriptor>();
  const thirdPlacePool: { nation: U17NationDescriptor; groupLetter: string; points: number; goalDifference: number; goalsFor: number; standing: U17GroupStanding }[] = [];

  groupLetters.forEach((letter, idx) => {
    const grpTeams = pool.slice(idx * 4, idx * 4 + 4);
    const { standings } = simulateSingleGroup(letter, grpTeams, pCode);
    groupStandings[letter] = standings;

    // Top 2 advance directly (24 teams)
    standings[0].qualified = true;
    standings[1].qualified = true;
    winnersMap.set(letter, standings[0].nation);
    runnersUpMap.set(letter, standings[1].nation);

    if (standings[2]) {
      thirdPlacePool.push({
        nation: standings[2].nation,
        groupLetter: letter,
        points: standings[2].points,
        goalDifference: standings[2].goalDifference,
        goalsFor: standings[2].goalsFor,
        standing: standings[2],
      });
    }
  });

  // Pick 8 best third-place teams
  thirdPlacePool.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.nation.ovr - a.nation.ovr;
  });
  const qualifyingThirds = thirdPlacePool.slice(0, 8);
  qualifyingThirds.forEach((tp) => {
    tp.standing.qualified = true;
  });

  // Assign third-place teams to 8 pods avoiding same groups
  const podForbiddenGroups: string[][] = [
    ['A', 'B', 'E'],
    ['C', 'F', 'K'],
    ['H', 'I', 'L'],
    ['A', 'D', 'J'],
    ['C', 'E', 'G'],
    ['D', 'K', 'L'],
    ['B', 'G', 'I'],
    ['F', 'H', 'J'],
  ];

  const assignedThirds: U17NationDescriptor[] = new Array(8);
  const usedThird = new Array(8).fill(false);
  function backtrackThird(podIdx: number): boolean {
    if (podIdx === 8) return true;
    for (let tIdx = 0; tIdx < 8; tIdx++) {
      if (usedThird[tIdx]) continue;
      const t = qualifyingThirds[tIdx];
      if (!podForbiddenGroups[podIdx].includes(t.groupLetter)) {
        usedThird[tIdx] = true;
        assignedThirds[podIdx] = t.nation;
        if (backtrackThird(podIdx + 1)) return true;
        usedThird[tIdx] = false;
      }
    }
    return false;
  }
  if (!backtrackThird(0)) {
    qualifyingThirds.forEach((t, i) => { assignedThirds[i] = t.nation; });
  }

  // 16 Round of 32 Pairings (8 pods of 2 matches each)
  const ko32Pairs: [U17NationDescriptor, U17NationDescriptor][] = [
    // Pod 0 (Feeds R16 Match 0)
    [runnersUpMap.get('A')!, runnersUpMap.get('B')!], // 2A vs 2B
    [winnersMap.get('E')!, assignedThirds[0]],        // 1E vs 3rd
    // Pod 1 (Feeds R16 Match 1)
    [winnersMap.get('C')!, runnersUpMap.get('F')!],   // 1C vs 2F
    [winnersMap.get('K')!, assignedThirds[1]],        // 1K vs 3rd
    // Pod 2 (Feeds R16 Match 2)
    [runnersUpMap.get('H')!, runnersUpMap.get('L')!], // 2H vs 2L
    [winnersMap.get('I')!, assignedThirds[2]],        // 1I vs 3rd
    // Pod 3 (Feeds R16 Match 3)
    [winnersMap.get('A')!, assignedThirds[3]],        // 1A vs 3rd
    [winnersMap.get('J')!, runnersUpMap.get('D')!],   // 1J vs 2D
    // Pod 4 (Feeds R16 Match 4)
    [runnersUpMap.get('C')!, runnersUpMap.get('E')!], // 2C vs 2E
    [winnersMap.get('G')!, assignedThirds[4]],        // 1G vs 3rd
    // Pod 5 (Feeds R16 Match 5)
    [winnersMap.get('D')!, runnersUpMap.get('K')!],   // 1D vs 2K
    [winnersMap.get('L')!, assignedThirds[5]],        // 1L vs 3rd
    // Pod 6 (Feeds R16 Match 6)
    [runnersUpMap.get('G')!, runnersUpMap.get('I')!], // 2G vs 2I
    [winnersMap.get('B')!, assignedThirds[6]],        // 1B vs 3rd
    // Pod 7 (Feeds R16 Match 7)
    [winnersMap.get('H')!, runnersUpMap.get('J')!],   // 1H vs 2J
    [winnersMap.get('F')!, assignedThirds[7]],        // 1F vs 3rd
  ];

  // KNOCKOUT ROUND OF 32 (16 matches)
  const ko32Matches: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[] = [];
  const ko16Teams: U17NationDescriptor[] = [];

  for (let i = 0; i < 16; i++) {
    const [home, away] = ko32Pairs[i];
    const res = simulateU17Match(home, away, true);
    ko32Matches.push({ matchId: `u17-r32-${i + 1}`, home, away, result: res });
    const winner = res.winnerCode === home.code ? home : away;
    ko16Teams.push(winner);
  }

  // ROUND OF 16 (8 matches) - Winner of Match 2k vs Winner of Match 2k+1 (ZERO same group clashes!)
  const ko16Matches: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[] = [];
  const qfTeams: U17NationDescriptor[] = [];

  for (let i = 0; i < 8; i++) {
    const home = ko16Teams[i * 2];
    const away = ko16Teams[i * 2 + 1];
    const res = simulateU17Match(home, away, true);
    ko16Matches.push({ matchId: `u17-r16-${i + 1}`, home, away, result: res });
    const winner = res.winnerCode === home.code ? home : away;
    qfTeams.push(winner);
  }

  // QUARTER-FINALS (4 matches)
  const qfMatches: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[] = [];
  const sfTeams: U17NationDescriptor[] = [];

  for (let i = 0; i < 4; i++) {
    const home = qfTeams[i * 2];
    const away = qfTeams[i * 2 + 1];
    const res = simulateU17Match(home, away, true);
    qfMatches.push({ matchId: `u17-qf-${i + 1}`, home, away, result: res });
    const winner = res.winnerCode === home.code ? home : away;
    sfTeams.push(winner);
  }

  // SEMI-FINALS (2 matches)
  const sfMatches: { matchId: string; home: U17NationDescriptor; away: U17NationDescriptor; result: U17MatchSimulationResult }[] = [];
  const finalTeams: U17NationDescriptor[] = [];
  const losersSf: U17NationDescriptor[] = [];

  const sf1Res = simulateU17Match(sfTeams[0], sfTeams[3], true);
  const sf1Winner = sf1Res.winnerCode === sfTeams[0].code ? sfTeams[0] : sfTeams[3];
  const sf1Loser = sf1Res.winnerCode === sfTeams[0].code ? sfTeams[3] : sfTeams[0];
  sfMatches.push({ matchId: 'u17-sf-1', home: sfTeams[0], away: sfTeams[3], result: sf1Res });
  finalTeams.push(sf1Winner);
  losersSf.push(sf1Loser);

  const sf2Res = simulateU17Match(sfTeams[1], sfTeams[2], true);
  const sf2Winner = sf2Res.winnerCode === sfTeams[1].code ? sfTeams[1] : sfTeams[2];
  const sf2Loser = sf2Res.winnerCode === sfTeams[1].code ? sfTeams[2] : sfTeams[1];
  sfMatches.push({ matchId: 'u17-sf-2', home: sfTeams[1], away: sfTeams[2], result: sf2Res });
  finalTeams.push(sf2Winner);
  losersSf.push(sf2Loser);

  // THIRD-PLACE PLAY-OFF
  const thirdRes = simulateU17Match(losersSf[0], losersSf[1], true);
  const thirdPlaceWinner = thirdRes.winnerCode === losersSf[0].code ? losersSf[0] : losersSf[1];
  const thirdPlaceMatch = { matchId: 'u17-third-place', home: losersSf[0], away: losersSf[1], result: thirdRes };

  // FINAL MATCH
  const finalRes = simulateU17Match(finalTeams[0], finalTeams[1], true);
  const champion = finalRes.winnerCode === finalTeams[0].code ? finalTeams[0] : finalTeams[1];
  const runnerUp = finalRes.winnerCode === finalTeams[0].code ? finalTeams[1] : finalTeams[0];
  const finalMatch = { matchId: 'u17-final', home: finalTeams[0], away: finalTeams[1], result: finalRes };

  // Evaluate Player Stage
  let playerFinishStage = 'Did Not Participate';
  if (playerParticipating && pCode) {
    if (champion.code === pCode) playerFinishStage = 'Champions 🏆';
    else if (runnerUp.code === pCode) playerFinishStage = 'Runners-up 🥈';
    else if (thirdPlaceWinner.code === pCode) playerFinishStage = 'Third Place 🥉';
    else if (sfTeams.some((n) => n.code === pCode)) playerFinishStage = 'Semi-Final';
    else if (qfTeams.some((n) => n.code === pCode)) playerFinishStage = 'Quarter-Final';
    else if (ko16Teams.some((n) => n.code === pCode)) playerFinishStage = 'Round of 16';
    else if (ko32Matches.some((m) => m.home.code === pCode || m.away.code === pCode)) playerFinishStage = 'Round of 32';
    else playerFinishStage = 'Group Stage';
  }

  return {
    seasonYear,
    competitionName: 'FIFA U17 World Cup',
    groups: groupStandings,
    knockoutRoundOf32: ko32Matches,
    knockoutRoundOf16: ko16Matches,
    knockoutQuarterFinals: qfMatches,
    knockoutSemiFinals: sfMatches,
    thirdPlaceMatch,
    finalMatch,
    champion,
    runnerUp,
    thirdPlace: thirdPlaceWinner,
    playerFinishStage,
  };
}

// ---------------------------------------------------------------------------
// 6. INTERACTIVE HUB STATE BUILDER & FIXTURE GENERATOR
// ---------------------------------------------------------------------------

/**
 * Initializes the full International Live Hub state for interactive play.
 * Generates fixtures, standings, opponent models, and commentary logs.
 */
export function initializeU17HubState(
  player: PlayerCardData,
  callingNation: Nationality,
  competitionType: 'qualifier' | 'world_cup',
  seasonYear: number,
  keyMatchPlayMode: 'slow' | 'decisive' | 'finals_only' = 'decisive'
): InternationalTournamentHubState {
  const isWorldCup = competitionType === 'world_cup';
  const tier: NationalTeamTier = 'U17';
  const competitionName = isWorldCup ? 'FIFA U17 World Cup' : `${callingNation.name} U17 International Championship Qualifiers`;
  const shortName = isWorldCup ? 'U17 World Cup' : 'U17 Qualifiers';
  const confederation = (callingNation.iso === 'br' || callingNation.code === 'ARG' || callingNation.code === 'BRA' || callingNation.code === 'COL') ? 'CONMEBOL' : 'UEFA';

  // Determine role & starter status
  const evalRes = isWorldCup
    ? checkU17WorldCupEligibility(player, callingNation, true)
    : checkU17QualifiersEligibility(player, callingNation);

  const playerRole = evalRes.role;

  // Build opponents
  const allImpl = getImplementedU17Nations().filter((n) => n.code !== callingNation.code);
  allImpl.sort(() => Math.random() - 0.5);

  const opp1 = allImpl[0] || { code: 'FRA', name: 'France', iso: 'fr', ovr: 72 };
  const opp2 = allImpl[1] || { code: 'GER', name: 'Germany', iso: 'de', ovr: 70 };
  const opp3 = allImpl[2] || { code: 'NED', name: 'Netherlands', iso: 'nl', ovr: 68 };

  const playerTeamOvr = evalRes.isEligible ? (player.ovr || 70) : 68;

  // Create group fixtures (3 matchdays)
  const fixtures: InternationalFixture[] = [
    {
      id: `u17-fix-1-${Date.now()}`,
      matchNumber: 1,
      stageMatchday: 1,
      stageName: 'Group Stage - Matchday 1',
      competitionName,
      windowLabel: isWorldCup ? 'World Cup Group Stage' : 'Continental Qualifiers',
      homeNation: {
        code: callingNation.code,
        name: callingNation.name,
        iso: callingNation.iso || 'gb-eng',
        ovr: playerTeamOvr,
        manager: `${callingNation.name} U17 Coach`,
      },
      awayNation: {
        code: opp1.code,
        name: opp1.name,
        iso: opp1.iso,
        ovr: opp1.ovr,
        manager: `${opp1.name} U17 Coach`,
      },
      isPlayerMatch: true,
      isPlayerHome: true,
      isPlayed: false,
    },
    {
      id: `u17-fix-2-${Date.now()}`,
      matchNumber: 2,
      stageMatchday: 2,
      stageName: 'Group Stage - Matchday 2',
      competitionName,
      windowLabel: isWorldCup ? 'World Cup Group Stage' : 'Continental Qualifiers',
      homeNation: {
        code: opp2.code,
        name: opp2.name,
        iso: opp2.iso,
        ovr: opp2.ovr,
        manager: `${opp2.name} U17 Coach`,
      },
      awayNation: {
        code: callingNation.code,
        name: callingNation.name,
        iso: callingNation.iso || 'gb-eng',
        ovr: playerTeamOvr,
        manager: `${callingNation.name} U17 Coach`,
      },
      isPlayerMatch: true,
      isPlayerHome: false,
      isPlayed: false,
    },
    {
      id: `u17-fix-3-${Date.now()}`,
      matchNumber: 3,
      stageMatchday: 3,
      stageName: 'Group Stage - Matchday 3 (Decider)',
      competitionName,
      windowLabel: isWorldCup ? 'World Cup Group Stage' : 'Continental Qualifiers',
      homeNation: {
        code: callingNation.code,
        name: callingNation.name,
        iso: callingNation.iso || 'gb-eng',
        ovr: playerTeamOvr,
        manager: `${callingNation.name} U17 Coach`,
      },
      awayNation: {
        code: opp3.code,
        name: opp3.name,
        iso: opp3.iso,
        ovr: opp3.ovr,
        manager: `${opp3.name} U17 Coach`,
      },
      isPlayerMatch: true,
      isPlayerHome: true,
      isPlayed: false,
    },
  ];

  // Initial group standings
  const standings: InternationalStandingRow[] = [
    {
      nationCode: callingNation.code,
      nationName: callingNation.name,
      iso: callingNation.iso || 'gb-eng',
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      qualified: false,
      isPlayerNation: true,
    },
    {
      nationCode: opp1.code,
      nationName: opp1.name,
      iso: opp1.iso,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      qualified: false,
      isPlayerNation: false,
    },
    {
      nationCode: opp2.code,
      nationName: opp2.name,
      iso: opp2.iso,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      qualified: false,
      isPlayerNation: false,
    },
    {
      nationCode: opp3.code,
      nationName: opp3.name,
      iso: opp3.iso,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      qualified: false,
      isPlayerNation: false,
    },
  ];

  // Knockout stages for World Cup (Round of 32 -> Round of 16 -> QF -> SF -> Final)
  const knockoutStages = isWorldCup
    ? ['Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final']
    : [];

  return {
    id: `u17-hub-${competitionType}-${seasonYear}-${callingNation.code}`,
    tier: 'U17',
    seasonYear,
    competitionType: isWorldCup ? 'tournament' : 'qualifier',
    competitionName,
    shortName,
    confederation,
    hostCountry: isWorldCup ? 'Qatar' : 'Europe',
    isWorldCup,
    isContinental: !isWorldCup,
    callingNation,
    playerRole,
    managerName: `${callingNation.name} U17 Head Coach`,
    managerTactic: '4-3-3 High Press',
    windowLabel: isWorldCup ? 'FIFA U17 World Cup Final Tournament' : 'U17 Continental Qualifiers',
    fixtures,
    currentFixtureIndex: 0,
    standings,
    isKnockoutStageActive: false,
    knockoutStages,
    currentKnockoutStageIndex: 0,
    isFinished: false,
    playerQualified: false,
    newsHeadline: `${callingNation.name.toUpperCase()} U17 NATIONAL SQUAD ANNOUNCED`,
    newsSummary: `${player.name} called up for ${callingNation.name} U17 national team duty in the ${competitionName}.`,
    totalGoals: 0,
    totalAssists: 0,
    capsGained: 0,
  };
}

/**
 * Checks if a fixture should be playable as a Key Match based on:
 * - Match Priority setting ('slow', 'decisive', 'finals_only')
 * - Player role ('Key Starter' vs 'Squad Player')
 */
export function isU17FixturePlayableKeyMatch(
  hubState: InternationalTournamentHubState,
  fixture: InternationalFixture,
  keyMatchPlayMode: 'slow' | 'decisive' | 'finals_only' = 'decisive'
): boolean {
  if (hubState.playerRole !== 'Key Starter') {
    // Squad players are substitutes; simulated unless specifically requested
    return false;
  }

  if (keyMatchPlayMode === 'slow') {
    return true; // Every match is playable
  }

  if (keyMatchPlayMode === 'finals_only') {
    return fixture.stageName.toLowerCase().includes('final') && !fixture.stageName.toLowerCase().includes('quarter') && !fixture.stageName.toLowerCase().includes('semi');
  }

  // 'decisive' mode: Matchday 3 (group decider) and all knockout matches are key matches
  if (fixture.isKnockout) return true;
  if (fixture.stageMatchday === 3) return true;

  return false;
}

/**
 * Concludes U17 international duty, records tournament history, and awards trophies.
 */
export function finalizeU17InternationalDuty(
  player: PlayerCardData,
  hubState: InternationalTournamentHubState
): { updatedPlayer: PlayerCardData; message: string } {
  const isWorldCup = hubState.isWorldCup;
  const seasonYear = hubState.seasonYear;
  const nationName = hubState.callingNation.name;
  const isChampion = hubState.champion?.code === hubState.callingNation.code;

  let finishStage = hubState.playerFinishStage || (hubState.playerQualified ? 'Qualified' : 'Group Stage');
  if (isChampion) finishStage = 'Champions 🏆';

  const historyRecord: U17TournamentRecord = {
    seasonYear: `${seasonYear}/${seasonYear + 1}`,
    year: seasonYear,
    stageReached: finishStage as any,
    playerNation: nationName,
    playerNationCode: hubState.callingNation.code,
    playerRole: hubState.playerRole,
    caps: hubState.capsGained,
    goals: hubState.totalGoals,
    assists: hubState.totalAssists,
    avgRating: 7.4,
    champion: hubState.champion || { name: nationName, code: hubState.callingNation.code, iso: hubState.callingNation.iso || 'gb-eng' },
    isWorldCup,
    competitionName: hubState.competitionName,
  };

  let updated: PlayerCardData = {
    ...player,
    u17Caps: (player.u17Caps || 0) + hubState.capsGained,
    u17Goals: (player.u17Goals || 0) + hubState.totalGoals,
    internationalCaps: (player.internationalCaps || 0) + hubState.capsGained,
    internationalGoals: (player.internationalGoals || 0) + hubState.totalGoals,
    fame: (player.fame || 0) + (isChampion ? 500 : hubState.capsGained * 40),
    u17TournamentHistory: [...(player.u17TournamentHistory || []), historyRecord],
  };

  let msg = `🏁 Concluded U17 international duty with ${nationName}. Gained ${hubState.capsGained} caps, ${hubState.totalGoals} goals.`;

  if (isChampion && isWorldCup) {
    const trophy = createTrophyItem({
      name: 'FIFA U17 World Cup Trophy',
      category: 'international',
      year: seasonYear,
      prestige: 90,
      iconType: 'world-cup',
    });
    updated = awardTrophiesToPlayer(updated, [trophy]);
    msg = `🏆 CHAMPIONS OF THE WORLD! ${nationName} lifted the FIFA U17 World Cup! Trophy added to cabinet!`;
  }

  return { updatedPlayer: updated, message: msg };
}
