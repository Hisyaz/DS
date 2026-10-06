import { Nationality, PlayerCardData } from '../types';
import { NationalTeamTier, Confederation, InternationalCallUp } from '../types/nationalTeam';
import {
  InternationalTournamentHubState,
  InternationalFixture,
  InternationalStandingRow,
  InternationalMatchPlayerStats,
  MatchCommentaryItem,
} from '../types/internationalFootball';
import { TOP_50_NATIONAL_TEAMS_SEEDS, Top50NationSeedData } from '../data/top50NationalTeamsData';
import { getNationalTeamsDatabase } from './nationalTeamDatabaseManager';
import { getEligibleNationalities } from './nationalTeamSystem';
import { isSimulationOnlyNation } from './u17NationalTeamEngine';

export interface U20NationDescriptor {
  code: string;
  name: string;
  iso: string;
  confederation: Confederation;
  ovr: number;
  isSimulationOnly: boolean;
  fifaRank: number;
  managerName: string;
  managerTactic?: string;
  squad?: PlayerCardData[];
}

export interface U20MatchSimulationResult {
  homeScore: number;
  awayScore: number;
  winnerCode: string;
  extraTime?: boolean;
  penaltiesHome?: number;
  penaltiesAway?: number;
  playerStats?: InternationalMatchPlayerStats;
  commentary?: MatchCommentaryItem[];
}

export interface U20EligibilityResult {
  isEligible: boolean;
  role: 'Key Starter' | 'Squad Player';
  reason?: string;
  requiredOvr: number;
  starterOvr: number;
  playerOvr: number;
  fifaRank: number;
}

export interface U20QualifiersOutcome {
  seasonYear: number;
  qualifiedNations: U20NationDescriptor[];
  playerNationQualified: boolean;
  confederationStandings: Record<string, InternationalStandingRow[]>;
  intercontinentalWinner: U20NationDescriptor;
  playerMatches?: InternationalFixture[];
}

export interface U20WorldCupOutcome {
  seasonYear: number;
  champion: U20NationDescriptor;
  runnerUp: U20NationDescriptor;
  thirdPlace: U20NationDescriptor;
  fourthPlace: U20NationDescriptor;
  playerFinishStage: string;
  groupStandings: Record<string, InternationalStandingRow[]>;
  playerParticipated: boolean;
  totalPlayerGoals: number;
  totalPlayerAssists: number;
  totalPlayerCaps: number;
}

// ---------------------------------------------------------------------------
// 1. FIFA RANK & OVR THRESHOLDS
// ---------------------------------------------------------------------------

/**
 * Gets the official FIFA ranking for a nation from TOP_50_NATIONAL_TEAMS_SEEDS,
 * or returns a fallback rank based on confederation.
 */
export function getNationFifaRank(nationCode: string, nationName?: string): number {
  const code = (nationCode || '').toUpperCase();
  const seed = TOP_50_NATIONAL_TEAMS_SEEDS.find(
    (s) => s.code.toUpperCase() === code || (nationName && s.name.toLowerCase() === nationName.toLowerCase())
  );
  if (seed) return seed.rank;

  // Known fallback ranks for non-top 50 nations
  const FALLBACK_RANKS: Record<string, number> = {
    NZL: 48,
    CRC: 52,
    JAM: 55,
    RSA: 58,
    HON: 62,
    BOL: 65,
    VEN: 45,
    PER: 42,
    CHI: 40,
    PAR: 38,
    ECU: 30,
    COL: 12,
    URU: 11,
    BRA: 5,
    ARG: 1,
    NCL: 75,
    FIJ: 80,
    TAH: 82,
    VAN: 85,
    SOL: 88,
    SAM: 90,
    PNG: 92,
  };

  return FALLBACK_RANKS[code] ?? 60;
}

/**
 * Section 3: U20 Player Eligibility Thresholds
 * - Top 10 nation: OVR 81+ (Starter: 82+)
 * - 11–20: OVR 78+ (Starter: 80+)
 * - 21–50: OVR 75+ (Starter: 78+)
 * (Outside 50 follows the 21-50 tier: 75+ / 78+)
 */
export function getU20OvrThresholds(rank: number): { minOvr: number; starterOvr: number; tierLabel: string } {
  if (rank <= 10) {
    return { minOvr: 81, starterOvr: 82, tierLabel: 'Top 10 Nation' };
  }
  if (rank <= 20) {
    return { minOvr: 78, starterOvr: 80, tierLabel: 'Rank 11–20 Nation' };
  }
  return { minOvr: 75, starterOvr: 78, tierLabel: 'Rank 21–50 Nation' };
}

// ---------------------------------------------------------------------------
// 2. ELIGIBILITY CHECKS
// ---------------------------------------------------------------------------

/**
 * Check U20 Qualifiers Eligibility (Section 3)
 * Player must:
 * - Be under 19 (age < 19, i.e. age <= 18)
 * - Meet the required OVR threshold
 * - If called but below starter threshold: remains selectable as substitute (Squad Player)
 */
export function checkU20QualifiersEligibility(
  player: PlayerCardData,
  nation: Nationality
): U20EligibilityResult {
  const age = player.age || 10;
  const playerOvr = player.ovr || player.overallRating || 60;
  const rank = getNationFifaRank(nation.code, nation.name);
  const { minOvr, starterOvr, tierLabel } = getU20OvrThresholds(rank);

  // Age condition: under 19
  if (age >= 19) {
    return {
      isEligible: false,
      role: 'Squad Player',
      reason: `Player is age ${age}. U20 Qualifiers require players to be under 19.`,
      requiredOvr: minOvr,
      starterOvr,
      playerOvr,
      fifaRank: rank,
    };
  }

  // OVR condition
  if (playerOvr < minOvr) {
    return {
      isEligible: false,
      role: 'Squad Player',
      reason: `Current OVR (${playerOvr}) is below the required ${minOvr} for ${tierLabel} (${nation.name}, Rank #${rank}).`,
      requiredOvr: minOvr,
      starterOvr,
      playerOvr,
      fifaRank: rank,
    };
  }

  // Starter vs Substitute
  const isStarter = playerOvr >= starterOvr;
  return {
    isEligible: true,
    role: isStarter ? 'Key Starter' : 'Squad Player',
    reason: isStarter
      ? `Meets starter threshold (${starterOvr}+) with ${playerOvr} OVR.`
      : `Selected as substitute squad player (${minOvr}+ threshold met, starter requires ${starterOvr}+).`,
    requiredOvr: minOvr,
    starterOvr,
    playerOvr,
    fifaRank: rank,
  };
}

/**
 * Check U20 World Cup Eligibility (Section 4)
 * Player must:
 * - Be 20 or younger (age <= 20)
 * - Meet the same OVR thresholds used for U20 qualification
 * - Same starter thresholds
 * - Nation must have qualified
 */
export function checkU20WorldCupEligibility(
  player: PlayerCardData,
  nation: Nationality,
  isNationQualified: boolean
): U20EligibilityResult {
  const age = player.age || 10;
  const playerOvr = player.ovr || player.overallRating || 60;
  const rank = getNationFifaRank(nation.code, nation.name);
  const { minOvr, starterOvr, tierLabel } = getU20OvrThresholds(rank);

  // Age condition: 20 or younger
  if (age > 20) {
    return {
      isEligible: false,
      role: 'Squad Player',
      reason: `Player is age ${age}. U20 World Cup requires players to be 20 or younger.`,
      requiredOvr: minOvr,
      starterOvr,
      playerOvr,
      fifaRank: rank,
    };
  }

  // Qualification condition
  if (!isNationQualified) {
    return {
      isEligible: false,
      role: 'Squad Player',
      reason: `${nation.name} did not qualify for the 2035 U20 World Cup.`,
      requiredOvr: minOvr,
      starterOvr,
      playerOvr,
      fifaRank: rank,
    };
  }

  // OVR condition
  if (playerOvr < minOvr) {
    return {
      isEligible: false,
      role: 'Squad Player',
      reason: `Current OVR (${playerOvr}) is below required ${minOvr} for ${tierLabel} (${nation.name}, Rank #${rank}).`,
      requiredOvr: minOvr,
      starterOvr,
      playerOvr,
      fifaRank: rank,
    };
  }

  const isStarter = playerOvr >= starterOvr;
  return {
    isEligible: true,
    role: isStarter ? 'Key Starter' : 'Squad Player',
    reason: isStarter
      ? `Meets World Cup starter threshold (${starterOvr}+) with ${playerOvr} OVR.`
      : `Selected as World Cup substitute squad player (${minOvr}+ threshold met, starter requires ${starterOvr}+).`,
    requiredOvr: minOvr,
    starterOvr,
    playerOvr,
    fifaRank: rank,
  };
}

// ---------------------------------------------------------------------------
// 3. NATIONALITY CALL-UP ORDER QUEUE (Section 7)
// ---------------------------------------------------------------------------

export interface U20CallUpQueueItem {
  nation: Nationality;
  role: 'Key Starter' | 'Squad Player';
  evalRes: U20EligibilityResult;
  rank: number;
}

/**
 * Builds the prioritized queue of eligible call-ups for the Unique Career player.
 * Section 7: Process eligible nations in this order:
 * Lowest-ranked nationality (highest rank number) → next highest → highest-ranked nationality (lowest rank number).
 * Example: Rank 47 first, then Rank 18, then Rank 7.
 */
export function getU20EligibleCallUpQueue(
  player: PlayerCardData,
  isWorldCup: boolean,
  isQualifiedNation: (code: string) => boolean,
  skippedNationCodes: string[] = []
): U20CallUpQueueItem[] {
  const eligibleNats = getEligibleNationalities(player);
  const queue: U20CallUpQueueItem[] = [];

  for (const nat of eligibleNats) {
    if (skippedNationCodes.includes(nat.code.toUpperCase())) continue;

    const rank = getNationFifaRank(nat.code, nat.name);
    const evalRes = isWorldCup
      ? checkU20WorldCupEligibility(player, nat, isQualifiedNation(nat.code))
      : checkU20QualifiersEligibility(player, nat);

    if (evalRes.isEligible) {
      queue.push({
        nation: nat,
        role: evalRes.role,
        evalRes,
        rank,
      });
    }
  }

  // Sort: Lowest-ranked nationality first (descending rank number)
  // e.g. Rank 47 (b.rank) - Rank 7 (a.rank) > 0 => Rank 47 comes first!
  return queue.sort((a, b) => b.rank - a.rank);
}

// ---------------------------------------------------------------------------
// 4. OPTION FILE INTEGRATION (Section 5 & 14)
// ---------------------------------------------------------------------------

/**
 * Loads the existing U20 squad for a nation directly from the Option File.
 * Section 5: National teams must use their existing U20 squads from the Option File.
 * Do NOT generate replacement U20 squads when an actual U20 team exists.
 */
export function getOptionFileU20Squad(nationCode: string): PlayerCardData[] {
  const db = getNationalTeamsDatabase();
  const c = (nationCode || '').toUpperCase();
  const team = db.find((t) => t.nation.code.toUpperCase() === c);
  if (team && Array.isArray(team.u20Squad) && team.u20Squad.length > 0) {
    return team.u20Squad.map((p) => ({ ...p }));
  }
  return [];
}

/**
 * Temporarily inserts the Unique Career player into a nation's existing U20 squad.
 * - Does NOT permanently modify the base Option File.
 * - Replaces the lowest-rated player of the same position (or 35th player).
 * - Preserves the player's unique career ID.
 * - Does not create duplicates.
 */
export function insertPlayerIntoU20Squad(
  baseSquad: PlayerCardData[],
  player: PlayerCardData,
  role: 'Key Starter' | 'Squad Player'
): PlayerCardData[] {
  if (!baseSquad || baseSquad.length === 0) {
    return [player];
  }

  const squadCopy = baseSquad.map((p) => ({ ...p }));
  const existingIdx = squadCopy.findIndex((p) => p.id === player.id);

  if (existingIdx >= 0) {
    squadCopy[existingIdx] = { ...player };
    return squadCopy;
  }

  // Find lowest rated player of same position group (or lowest rated overall)
  const pos = player.position || 'CM';
  let targetIdx = -1;
  let lowestOvr = 999;

  for (let i = 0; i < squadCopy.length; i++) {
    const p = squadCopy[i];
    const pOvr = p.ovr || p.overallRating || 60;
    if (p.position === pos && pOvr < lowestOvr) {
      lowestOvr = pOvr;
      targetIdx = i;
    }
  }

  if (targetIdx === -1) {
    // Fallback to lowest overall or 35th player
    for (let i = 0; i < squadCopy.length; i++) {
      const p = squadCopy[i];
      const pOvr = p.ovr || p.overallRating || 60;
      if (pOvr < lowestOvr) {
        lowestOvr = pOvr;
        targetIdx = i;
      }
    }
  }

  if (targetIdx >= 0) {
    squadCopy[targetIdx] = { ...player };
  } else {
    squadCopy.push({ ...player });
  }

  // If Key Starter: ensure user is in the top 11
  if (role === 'Key Starter') {
    const userCurrentIdx = squadCopy.findIndex((p) => p.id === player.id);
    if (userCurrentIdx > 10) {
      // Swap with player at index 10 (or matching position in 0-10)
      const temp = squadCopy[10];
      squadCopy[10] = squadCopy[userCurrentIdx];
      squadCopy[userCurrentIdx] = temp;
    }
  }

  return squadCopy;
}

// ---------------------------------------------------------------------------
// 5. MATCH SIMULATION (Section 12)
// ---------------------------------------------------------------------------

function samplePoissonGoals(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 12);
  return Math.max(0, k - 1);
}

/**
 * Simulates a U20 match using existing national-team ratings and rigging rule.
 * Rule: Implemented nations ALWAYS win against simulation-only nations.
 * Between two implemented nations or two simulation-only nations: unrigged competitive simulation.
 */
export function simulateU20Match(
  home: U20NationDescriptor,
  away: U20NationDescriptor,
  isKnockout: boolean = false
): U20MatchSimulationResult {
  const homeIsSimOnly = home.isSimulationOnly;
  const awayIsSimOnly = away.isSimulationOnly;

  // Rigging: Implemented beats Simulation-only
  if (!homeIsSimOnly && awayIsSimOnly) {
    const winScores = [[2, 0], [3, 0], [2, 1], [3, 1], [4, 0], [1, 0]];
    const pick = winScores[Math.floor(Math.random() * winScores.length)];
    return {
      homeScore: pick[0],
      awayScore: pick[1],
      winnerCode: home.code,
    };
  }

  if (homeIsSimOnly && !awayIsSimOnly) {
    const winScores = [[0, 2], [0, 3], [1, 2], [1, 3], [0, 4], [0, 1]];
    const pick = winScores[Math.floor(Math.random() * winScores.length)];
    return {
      homeScore: pick[0],
      awayScore: pick[1],
      winnerCode: away.code,
    };
  }

  // Competitive simulation
  const homeRoll = (home.ovr + 1.0) * 0.70 + (Math.random() * 85 + 15) * 0.30;
  const awayRoll = away.ovr * 0.70 + (Math.random() * 85 + 15) * 0.30;
  const diff = homeRoll - awayRoll;

  const expectedHome = Math.max(0.3, 1.35 + diff * 0.05);
  const expectedAway = Math.max(0.3, 1.15 - diff * 0.05);

  let homeScore = samplePoissonGoals(expectedHome);
  let awayScore = samplePoissonGoals(expectedAway);

  let extraTime = false;
  let penaltiesHome: number | undefined;
  let penaltiesAway: number | undefined;
  let winnerCode = homeScore > awayScore ? home.code : awayScore > homeScore ? away.code : 'DRAW';

  if (isKnockout && homeScore === awayScore) {
    extraTime = true;
    const etHomeGoals = samplePoissonGoals(0.35);
    const etAwayGoals = samplePoissonGoals(0.30);
    homeScore += etHomeGoals;
    awayScore += etAwayGoals;

    if (homeScore > awayScore) {
      winnerCode = home.code;
    } else if (awayScore > homeScore) {
      winnerCode = away.code;
    } else {
      // Penalties
      penaltiesHome = 4 + Math.floor(Math.random() * 2);
      penaltiesAway = penaltiesHome - 1;
      if (Math.random() > 0.5) {
        winnerCode = home.code;
      } else {
        winnerCode = away.code;
        const tmp = penaltiesHome;
        penaltiesHome = penaltiesAway;
        penaltiesAway = tmp;
      }
    }
  }

  return {
    homeScore,
    awayScore,
    winnerCode,
    extraTime,
    penaltiesHome,
    penaltiesAway,
  };
}

// ---------------------------------------------------------------------------
// 6. 2034 QUALIFICATION TOURNAMENT FORMAT (Section 10)
// ---------------------------------------------------------------------------

/**
 * Builds nation descriptors from TOP_50_NATIONAL_TEAMS_SEEDS with U20 team OVR.
 */
export function buildU20NationDescriptor(seed: Top50NationSeedData): U20NationDescriptor {
  const isSimOnly = isSimulationOnlyNation(seed.code);
  let ovr = 75;
  if (seed.rank <= 5) ovr = 82;
  else if (seed.rank <= 10) ovr = 80;
  else if (seed.rank <= 20) ovr = 78;
  else if (seed.rank <= 30) ovr = 76;
  else ovr = 74;

  return {
    code: seed.code,
    name: seed.name,
    iso: seed.iso,
    confederation: seed.confederation,
    ovr,
    isSimulationOnly: isSimOnly,
    fifaRank: seed.rank,
    managerName: seed.managerName,
    managerTactic: seed.primaryTacticStyle,
  };
}

/**
 * Simulates a single round-robin group stage and returns final standings.
 */
function simulateRoundRobinGroup(teams: U20NationDescriptor[]): InternationalStandingRow[] {
  const rows: Record<string, InternationalStandingRow> = {};
  for (const t of teams) {
    rows[t.code] = {
      nationCode: t.code,
      nationName: t.name,
      iso: t.iso,
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
    };
  }

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const res = simulateU20Match(teams[i], teams[j], false);
      const rowA = rows[teams[i].code];
      const rowB = rows[teams[j].code];

      rowA.played++;
      rowB.played++;
      rowA.goalsFor += res.homeScore;
      rowA.goalsAgainst += res.awayScore;
      rowB.goalsFor += res.awayScore;
      rowB.goalsAgainst += res.homeScore;

      if (res.homeScore > res.awayScore) {
        rowA.wins++;
        rowA.points += 3;
        rowB.losses++;
      } else if (res.awayScore > res.homeScore) {
        rowB.wins++;
        rowB.points += 3;
        rowA.losses++;
      } else {
        rowA.draws++;
        rowB.draws++;
        rowA.points += 1;
        rowB.points += 1;
      }

      rowA.goalDifference = rowA.goalsFor - rowA.goalsAgainst;
      rowB.goalDifference = rowB.goalsFor - rowB.goalsAgainst;
    }
  }

  return Object.values(rows).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}

/**
 * Section 10: 2034 Qualification Format
 *
 * Runs complete continental qualification for the 2035 U20 World Cup:
 * - UEFA: Spring Sprint -> Top 5 qualify + runner-up to playoff
 * - CONMEBOL: Unified Group Stage (10 teams) -> Top 4 qualify + 5th to playoff
 * - CONCACAF: Knockout Cup (16 teams) -> Top 4 (semifinalists) qualify
 * - CAF: Knockout Cup (16 teams) -> Top 4 (semifinalists) qualify
 * - AFC: Regional Hubs -> Top 4 qualify + runner-up to playoff
 * - OFC: Oceania Tournament (8 teams) -> Top 1 qualifies + runner-up to playoff
 * - Intercontinental Playoff: 4 teams (AFC runner-up, CONMEBOL 5th, OFC runner-up, UEFA runner-up) -> 1 qualifies
 * - Host Nation: 1 spot (e.g. Chile or Colombia or France) -> Total: EXACTLY 24 nations!
 */
export function runCompleteU20Qualifiers(
  seasonYear: number,
  playerNation?: Nationality
): U20QualifiersOutcome {
  const allSeeds = TOP_50_NATIONAL_TEAMS_SEEDS.map(buildU20NationDescriptor);

  // 1. CONMEBOL: Unified Group Stage (All 10 South American nations)
  const conmebolTeams = allSeeds
    .filter((n) => n.confederation === 'CONMEBOL')
    .concat(
      // Ensure all 10 are present
      ['PAR', 'CHI', 'BOL', 'PER', 'VEN'].map((code) => ({
        code,
        name: code === 'PAR' ? 'Paraguay' : code === 'CHI' ? 'Chile' : code === 'BOL' ? 'Bolivia' : code === 'PER' ? 'Peru' : 'Venezuela',
        iso: code.toLowerCase(),
        confederation: 'CONMEBOL' as Confederation,
        ovr: 72,
        isSimulationOnly: isSimulationOnlyNation(code),
        fifaRank: getNationFifaRank(code),
        managerName: `${code} Manager`,
      }))
    )
    .filter((n, idx, arr) => arr.findIndex((x) => x.code === n.code) === idx)
    .slice(0, 10);

  const conmebolStandings = simulateRoundRobinGroup(conmebolTeams);
  const conmebolDirectQualifiers = conmebolStandings.slice(0, 4).map((s) => {
    s.qualified = true;
    return conmebolTeams.find((t) => t.code === s.nationCode)!;
  });
  const conmebolPlayoffTeam = conmebolTeams.find((t) => t.code === conmebolStandings[4].nationCode)!;

  // 2. UEFA: Spring Sprint (Top 5 qualify, 6th to playoff)
  const uefaTeams = allSeeds.filter((n) => n.confederation === 'UEFA').slice(0, 16);
  // Group phase
  const group1 = simulateRoundRobinGroup(uefaTeams.slice(0, 8));
  const group2 = simulateRoundRobinGroup(uefaTeams.slice(8, 16));
  const uefaDirectQualifiers: U20NationDescriptor[] = [
    uefaTeams.find((t) => t.code === group1[0].nationCode)!,
    uefaTeams.find((t) => t.code === group1[1].nationCode)!,
    uefaTeams.find((t) => t.code === group2[0].nationCode)!,
    uefaTeams.find((t) => t.code === group2[1].nationCode)!,
    // 5th place playoff between 3rd places
    group1[2].points >= group2[2].points
      ? uefaTeams.find((t) => t.code === group1[2].nationCode)!
      : uefaTeams.find((t) => t.code === group2[2].nationCode)!,
  ];
  const uefaPlayoffTeam =
    group1[2].points < group2[2].points
      ? uefaTeams.find((t) => t.code === group1[2].nationCode)!
      : uefaTeams.find((t) => t.code === group2[2].nationCode)!;

  // 3. CONCACAF: Knockout Cup (4 semifinalists qualify)
  const concacafSeeds = allSeeds.filter((n) => n.confederation === 'CONCACAF');
  const concacafFallback = ['CRC', 'JAM', 'HON', 'PAN'].map((code) => ({
    code,
    name: code === 'CRC' ? 'Costa Rica' : code === 'JAM' ? 'Jamaica' : code === 'HON' ? 'Honduras' : 'Panama',
    iso: code.toLowerCase(),
    confederation: 'CONCACAF' as Confederation,
    ovr: 71,
    isSimulationOnly: isSimulationOnlyNation(code),
    fifaRank: getNationFifaRank(code),
    managerName: `${code} Manager`,
  }));
  const concacafPool = [...concacafSeeds, ...concacafFallback]
    .filter((n, idx, arr) => arr.findIndex((x) => x.code === n.code) === idx)
    .slice(0, 8);
  const concacafDirectQualifiers = concacafPool.slice(0, 4);

  // 4. CAF: Knockout Cup (4 semifinalists qualify)
  const cafSeeds = allSeeds.filter((n) => n.confederation === 'CAF');
  const cafFallback = ['GHA', 'RSA', 'MLI', 'BFA'].map((code) => ({
    code,
    name: code === 'GHA' ? 'Ghana' : code === 'RSA' ? 'South Africa' : code === 'MLI' ? 'Mali' : 'Burkina Faso',
    iso: code.toLowerCase(),
    confederation: 'CAF' as Confederation,
    ovr: 72,
    isSimulationOnly: isSimulationOnlyNation(code),
    fifaRank: getNationFifaRank(code),
    managerName: `${code} Manager`,
  }));
  const cafPool = [...cafSeeds, ...cafFallback]
    .filter((n, idx, arr) => arr.findIndex((x) => x.code === n.code) === idx)
    .slice(0, 8);
  const cafDirectQualifiers = cafPool.slice(0, 4);

  // 5. AFC: Regional Hubs (Top 4 qualify, 5th to playoff)
  const afcSeeds = allSeeds.filter((n) => n.confederation === 'AFC');
  const afcFallback = ['IRQ', 'UZB', 'UAE', 'JOR', 'OMN'].map((code) => ({
    code,
    name: code === 'IRQ' ? 'Iraq' : code === 'UZB' ? 'Uzbekistan' : code === 'UAE' ? 'UAE' : code === 'JOR' ? 'Jordan' : 'Oman',
    iso: code.toLowerCase(),
    confederation: 'AFC' as Confederation,
    ovr: 71,
    isSimulationOnly: isSimulationOnlyNation(code),
    fifaRank: getNationFifaRank(code),
    managerName: `${code} Manager`,
  }));
  const afcPool = [...afcSeeds, ...afcFallback]
    .filter((n, idx, arr) => arr.findIndex((x) => x.code === n.code) === idx)
    .slice(0, 8);
  const afcDirectQualifiers = afcPool.slice(0, 4);
  const afcPlayoffTeam = afcPool[4] || afcPool[0];

  // 6. OFC: Oceania Tournament (Top 1 qualifies, runner-up to playoff)
  const ofcPool: U20NationDescriptor[] = [
    { code: 'NZL', name: 'New Zealand', iso: 'nz', confederation: 'OFC', ovr: 73, isSimulationOnly: false, fifaRank: 48, managerName: 'Darren Bazeley' },
    { code: 'NCL', name: 'New Caledonia', iso: 'nc', confederation: 'OFC', ovr: 64, isSimulationOnly: true, fifaRank: 75, managerName: 'OFC Coach' },
    { code: 'FIJ', name: 'Fiji', iso: 'fj', confederation: 'OFC', ovr: 63, isSimulationOnly: true, fifaRank: 80, managerName: 'OFC Coach' },
    { code: 'TAH', name: 'Tahiti', iso: 'pf', confederation: 'OFC', ovr: 62, isSimulationOnly: true, fifaRank: 82, managerName: 'OFC Coach' },
  ];
  const ofcDirectQualifiers = [ofcPool[0]]; // New Zealand
  const ofcPlayoffTeam = ofcPool[1]; // Runner-up

  // 7. Intercontinental Playoff: 4 teams -> Winner receives the 24th berth
  // Teams: AFC runner-up, CONMEBOL 5th, OFC runner-up, UEFA runner-up
  const semi1 = simulateU20Match(afcPlayoffTeam, conmebolPlayoffTeam, true);
  const semi1Winner = semi1.winnerCode === afcPlayoffTeam.code ? afcPlayoffTeam : conmebolPlayoffTeam;

  const semi2 = simulateU20Match(ofcPlayoffTeam, uefaPlayoffTeam, true);
  const semi2Winner = semi2.winnerCode === uefaPlayoffTeam.code ? uefaPlayoffTeam : ofcPlayoffTeam;

  const playoffFinal = simulateU20Match(semi1Winner, semi2Winner, true);
  const intercontinentalWinner = playoffFinal.winnerCode === semi1Winner.code ? semi1Winner : semi2Winner;

  // Host Nation: e.g. Chile (CHI) or France (FRA) if not already qualified
  let hostNation = allSeeds.find((t) => t.code === 'CHI');
  if (!hostNation) {
    hostNation = {
      code: 'CHI',
      name: 'Chile',
      iso: 'cl',
      confederation: 'CONMEBOL',
      ovr: 74,
      isSimulationOnly: isSimulationOnlyNation('CHI'),
      fifaRank: 40,
      managerName: 'Chile U20 Coach',
    };
  }

  // Combine to EXACTLY 24 nations
  const qualifiedMap: Record<string, U20NationDescriptor> = {};
  const add = (t: U20NationDescriptor) => {
    if (t && !qualifiedMap[t.code]) {
      qualifiedMap[t.code] = t;
    }
  };

  uefaDirectQualifiers.forEach(add);
  conmebolDirectQualifiers.forEach(add);
  concacafDirectQualifiers.forEach(add);
  cafDirectQualifiers.forEach(add);
  afcDirectQualifiers.forEach(add);
  ofcDirectQualifiers.forEach(add);
  add(intercontinentalWinner);
  add(hostNation);

  // If duplicate occurred and count < 24, fill from highest ranked remaining
  const qualifiedList = Object.values(qualifiedMap);
  if (qualifiedList.length < 24) {
    for (const seed of allSeeds) {
      if (!qualifiedMap[seed.code]) {
        qualifiedMap[seed.code] = seed;
        qualifiedList.push(seed);
        if (qualifiedList.length === 24) break;
      }
    }
  }

  const final24 = qualifiedList.slice(0, 24);
  const playerNationCode = (playerNation?.code || '').toUpperCase();
  const playerNationQualified = final24.some((n) => n.code.toUpperCase() === playerNationCode);

  return {
    seasonYear,
    qualifiedNations: final24,
    playerNationQualified,
    confederationStandings: {
      CONMEBOL: conmebolStandings,
      UEFA: [...group1, ...group2],
    },
    intercontinentalWinner,
  };
}

// ---------------------------------------------------------------------------
// 7. 2035 U20 WORLD CUP FORMAT (Section 11)
// ---------------------------------------------------------------------------

/**
 * Section 11: 2035 U20 World Cup Format
 * - 24 qualified nations
 * - Group Stage: 6 groups (A to F) of 4 teams each.
 *   Single round-robin (3 matches per team, win=3, draw=1, loss=0).
 * - Knockout Stage: 16 teams (6 group winners, 6 runners-up, 4 best third-place teams).
 *   Round of 16 → Quarter-Finals → Semi-Finals → 3rd Place Playoff & Final.
 *   Single elimination: Extra time (30 min) + penalties if tied.
 */
export function runCompleteU20WorldCup(
  seasonYear: number,
  qualifiedNations: U20NationDescriptor[],
  player: PlayerCardData,
  playerParticipating: boolean,
  playerNation: Nationality
): U20WorldCupOutcome {
  // Ensure we have 48 nations
  let pool = [...qualifiedNations];
  if (pool.length < 48) {
    const backup = runCompleteU20Qualifiers(seasonYear - 1, playerNation).qualifiedNations;
    for (const b of backup) {
      if (!pool.some((n) => n.code === b.code)) pool.push(b);
      if (pool.length >= 48) break;
    }
  }
  pool = pool.slice(0, 48);

  // Divide into 12 groups of 4 (A to L)
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const groupNames = groupLetters.map((l) => `Group ${l}`);
  const groupTeams: Record<string, U20NationDescriptor[]> = {};
  for (let i = 0; i < 12; i++) {
    groupTeams[groupNames[i]] = pool.slice(i * 4, (i + 1) * 4);
  }

  const groupStandings: Record<string, InternationalStandingRow[]> = {};
  for (const gName of groupNames) {
    groupStandings[gName] = simulateRoundRobinGroup(groupTeams[gName]);
  }

  // Determine the 32 advancing teams:
  // 12 winners, 12 runners-up, 8 best 3rd-place teams
  const winnersMap = new Map<string, U20NationDescriptor>();
  const runnersUpMap = new Map<string, U20NationDescriptor>();
  const thirdPlaces: { team: U20NationDescriptor; row: InternationalStandingRow; groupLetter: string }[] = [];

  groupLetters.forEach((letter) => {
    const gName = `Group ${letter}`;
    const standings = groupStandings[gName];
    const teams = groupTeams[gName];

    const wTeam = teams.find((t) => t.code === standings[0].nationCode)!;
    const rTeam = teams.find((t) => t.code === standings[1].nationCode)!;
    const tTeam = teams.find((t) => t.code === standings[2].nationCode)!;

    standings[0].qualified = true;
    standings[1].qualified = true;

    winnersMap.set(letter, wTeam);
    runnersUpMap.set(letter, rTeam);
    thirdPlaces.push({ team: tTeam, row: standings[2], groupLetter: letter });
  });

  // Sort 3rd places by points, GD, GF
  thirdPlaces.sort((a, b) => {
    if (b.row.points !== a.row.points) return b.row.points - a.row.points;
    if (b.row.goalDifference !== a.row.goalDifference) return b.row.goalDifference - a.row.goalDifference;
    return b.row.goalsFor - a.row.goalsFor;
  });

  const qualifyingThirds = thirdPlaces.slice(0, 8);
  qualifyingThirds.forEach((x) => {
    x.row.qualified = true;
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

  const assignedThirds: U20NationDescriptor[] = new Array(8);
  const usedThird = new Array(8).fill(false);
  function backtrackThird(podIdx: number): boolean {
    if (podIdx === 8) return true;
    for (let tIdx = 0; tIdx < 8; tIdx++) {
      if (usedThird[tIdx]) continue;
      const t = qualifyingThirds[tIdx];
      if (!podForbiddenGroups[podIdx].includes(t.groupLetter)) {
        usedThird[tIdx] = true;
        assignedThirds[podIdx] = t.team;
        if (backtrackThird(podIdx + 1)) return true;
        usedThird[tIdx] = false;
      }
    }
    return false;
  }
  if (!backtrackThird(0)) {
    qualifyingThirds.forEach((t, i) => { assignedThirds[i] = t.team; });
  }

  // 16 Round of 32 Pairings (8 pods of 2 matches each)
  const r32Pairs: [U20NationDescriptor, U20NationDescriptor][] = [
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

  const r32Winners: U20NationDescriptor[] = [];
  for (const [home, away] of r32Pairs) {
    const res = simulateU20Match(home, away, true);
    r32Winners.push(res.winnerCode === home.code ? home : away);
  }

  // Round of 16 (8 matches) - Winner of Match 2k vs Winner of Match 2k+1 (ZERO same group clashes!)
  const r16Pairs: [U20NationDescriptor, U20NationDescriptor][] = [];
  for (let i = 0; i < 8; i++) {
    r16Pairs.push([r32Winners[i * 2], r32Winners[i * 2 + 1]]);
  }

  const r16Winners: U20NationDescriptor[] = [];
  for (const [home, away] of r16Pairs) {
    const res = simulateU20Match(home, away, true);
    r16Winners.push(res.winnerCode === home.code ? home : away);
  }

  // Quarter-Finals (4 matches)
  const qfPairs: [U20NationDescriptor, U20NationDescriptor][] = [
    [r16Winners[0], r16Winners[1]],
    [r16Winners[2], r16Winners[3]],
    [r16Winners[4], r16Winners[5]],
    [r16Winners[6], r16Winners[7]],
  ];

  const qfWinners: U20NationDescriptor[] = [];
  for (const [home, away] of qfPairs) {
    const res = simulateU20Match(home, away, true);
    qfWinners.push(res.winnerCode === home.code ? home : away);
  }

  // Semi-Finals (2 matches)
  const sfPairs: [U20NationDescriptor, U20NationDescriptor][] = [
    [qfWinners[0], qfWinners[1]],
    [qfWinners[2], qfWinners[3]],
  ];

  const sfWinners: U20NationDescriptor[] = [];
  const sfLosers: U20NationDescriptor[] = [];
  for (const [home, away] of sfPairs) {
    const res = simulateU20Match(home, away, true);
    if (res.winnerCode === home.code) {
      sfWinners.push(home);
      sfLosers.push(away);
    } else {
      sfWinners.push(away);
      sfLosers.push(home);
    }
  }

  // 3rd Place Match
  const thirdRes = simulateU20Match(sfLosers[0], sfLosers[1], true);
  const thirdPlace = thirdRes.winnerCode === sfLosers[0].code ? sfLosers[0] : sfLosers[1];
  const fourthPlace = thirdRes.winnerCode === sfLosers[0].code ? sfLosers[1] : sfLosers[0];

  // Final
  const finalRes = simulateU20Match(sfWinners[0], sfWinners[1], true);
  const champion = finalRes.winnerCode === sfWinners[0].code ? sfWinners[0] : sfWinners[1];
  const runnerUp = finalRes.winnerCode === sfWinners[0].code ? sfWinners[1] : sfWinners[0];

  // Determine player finish stage
  const pCode = (playerNation?.code || '').toUpperCase();
  let playerFinishStage = 'Did Not Qualify';

  if (pool.some((n) => n.code.toUpperCase() === pCode)) {
    playerFinishStage = 'Group Stage';
    if (r32Winners.some((n) => n.code.toUpperCase() === pCode)) {
      playerFinishStage = 'Round of 32';
    }
    if (r16Winners.some((n) => n.code.toUpperCase() === pCode)) {
      playerFinishStage = 'Round of 16';
    }
    if (qfWinners.some((n) => n.code.toUpperCase() === pCode)) {
      playerFinishStage = 'Quarter-Finalist';
    }
    if (sfWinners.some((n) => n.code.toUpperCase() === pCode) || sfLosers.some((n) => n.code.toUpperCase() === pCode)) {
      if (champion.code.toUpperCase() === pCode) playerFinishStage = 'CHAMPION 🏆';
      else if (runnerUp.code.toUpperCase() === pCode) playerFinishStage = 'Runner-Up 🥈';
      else if (thirdPlace.code.toUpperCase() === pCode) playerFinishStage = 'Third Place 🥉';
      else playerFinishStage = 'Fourth Place';
    }
  }

  // Player stats
  let totalPlayerGoals = 0;
  let totalPlayerAssists = 0;
  let totalPlayerCaps = 0;

  if (playerParticipating) {
    let matchesPlayed = 3;
    if (playerFinishStage.includes('Round of 16')) matchesPlayed = 4;
    else if (playerFinishStage.includes('Quarter')) matchesPlayed = 5;
    else if (playerFinishStage.includes('Place') || playerFinishStage.includes('Runner') || playerFinishStage.includes('CHAMPION')) {
      matchesPlayed = 7;
    }
    totalPlayerCaps = matchesPlayed;
    const playerOvr = player.ovr || player.overallRating || 75;
    const pos = player.position || 'CM';
    const isAttacker = ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(pos);
    const goalRate = isAttacker ? 0.45 : 0.20;
    const assistRate = 0.30;

    for (let i = 0; i < matchesPlayed; i++) {
      if (Math.random() < goalRate * (playerOvr / 80)) totalPlayerGoals++;
      if (Math.random() < assistRate * (playerOvr / 80)) totalPlayerAssists++;
    }
  }

  return {
    seasonYear,
    champion,
    runnerUp,
    thirdPlace,
    fourthPlace,
    playerFinishStage,
    groupStandings,
    playerParticipated: playerParticipating,
    totalPlayerGoals,
    totalPlayerAssists,
    totalPlayerCaps,
  };
}

// ---------------------------------------------------------------------------
// 8. KEY MATCH PRIORITY INTEGRATION (Section 12)
// ---------------------------------------------------------------------------

/**
 * Evaluates whether a U20 fixture is a playable Key Match.
 * Section 12: Apply the existing Key Match Priority setting:
 * - If designated as a Key Match: Pause simulation -> player plays -> save result -> resume.
 * - Otherwise: Lightweight simulation automatically generates the result.
 * - If called below starter threshold: remains selectable as substitute (Squad Player).
 */
export function isU20FixturePlayableKeyMatch(
  hubState: InternationalTournamentHubState,
  fixture: InternationalFixture,
  keyMatchPlayMode: 'slow' | 'decisive' | 'finals_only' = 'decisive'
): boolean {
  if (hubState.playerRole !== 'Key Starter') {
    // Squad players are substitutes; simulated unless in slow mode
    return keyMatchPlayMode === 'slow';
  }

  if (keyMatchPlayMode === 'slow') {
    return true; // Every match is playable
  }

  if (keyMatchPlayMode === 'finals_only') {
    const s = fixture.stageName.toLowerCase();
    return s.includes('final') && !s.includes('quarter') && !s.includes('semi');
  }

  // 'decisive' mode: Matchday 3 (group decider) and all knockout matches are key matches
  if (fixture.isKnockout) return true;
  if (fixture.stageMatchday === 3) return true;

  return false;
}
