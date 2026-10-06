import { TOP_50_NATIONAL_TEAMS_SEEDS, Top50NationSeedData, Confederation } from '../data/top50NationalTeamsData';
import { NationalTeamTier } from '../types/nationalTeam';

export interface NationalTeamDrawTeam {
  code: string;
  name: string;
  iso: string;
  confederation: Confederation;
  rank: number;
  pot: number;
  isPlayerNation: boolean;
  ovr: number;
}

export interface NationalTeamDrawGroup {
  groupLetter: string; // 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'
  groupName: string;   // 'Group A'
  teams: NationalTeamDrawTeam[];
  isPlayerGroup: boolean;
}

export interface DrawAnimationStep {
  stepIndex: number;
  potNumber: number;
  team: NationalTeamDrawTeam;
  targetGroupLetter: string;
  logText: string;
  isPlayerTeam: boolean;
}

export interface InternationalDrawState {
  id: string;
  competitionId: string;
  competitionName: string;
  shortName: string;
  tier: NationalTeamTier;
  seasonYear: number;
  format: 'uefa_qualifiers' | 'conmebol_league' | 'tournament_groups';
  isLeagueFormat: boolean;
  playerNationCode: string;
  playerGroupLetter?: string;
  pots: {
    potNumber: number;
    potLabel: string;
    teams: NationalTeamDrawTeam[];
  }[];
  groups: NationalTeamDrawGroup[];
  leagueTeams?: NationalTeamDrawTeam[]; // For CONMEBOL 10-nation single league table
  animationSteps: DrawAnimationStep[];
  isCompleted: boolean;
}

// Complete 10 CONMEBOL nations for authentic South American Qualifiers
export const FULL_CONMEBOL_NATIONS: { code: string; name: string; iso: string; rank: number; ovr: number }[] = [
  { code: 'ARG', name: 'Argentina', iso: 'ar', rank: 1, ovr: 87 },
  { code: 'BRA', name: 'Brazil', iso: 'br', rank: 5, ovr: 86 },
  { code: 'COL', name: 'Colombia', iso: 'co', rank: 12, ovr: 83 },
  { code: 'URU', name: 'Uruguay', iso: 'uy', rank: 14, ovr: 84 },
  { code: 'ECU', name: 'Ecuador', iso: 'ec', rank: 27, ovr: 80 },
  { code: 'PAR', name: 'Paraguay', iso: 'py', rank: 53, ovr: 77 },
  { code: 'CHI', name: 'Chile', iso: 'cl', rank: 40, ovr: 78 },
  { code: 'PER', name: 'Peru', iso: 'pe', rank: 43, ovr: 77 },
  { code: 'VEN', name: 'Venezuela', iso: 've', rank: 44, ovr: 76 },
  { code: 'BOL', name: 'Bolivia', iso: 'bo', rank: 79, ovr: 73 },
];

export function isConmebolNation(code: string): boolean {
  if (!code) return false;
  const upper = code.toUpperCase();
  return FULL_CONMEBOL_NATIONS.some((n) => n.code === upper);
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function calculateNationalTeamOvr(rank: number, tier: NationalTeamTier): number {
  const baseSenior = Math.max(72, Math.min(88, 89 - Math.floor(rank * 0.35)));
  if (tier === 'U17') return Math.max(65, baseSenior - 14);
  if (tier === 'U20') return Math.max(68, baseSenior - 8);
  return baseSenior;
}

/**
 * Checks whether a nation is qualified for a major international tournament (e.g. World Trophy, Euros, Copa América).
 * Ensures that if a national team is NOT qualified, the Career Hub will never display an irrelevant draw button.
 */
export function isNationQualifiedForTournament(
  playerNationCode: string,
  competitionName: string,
  tier: NationalTeamTier = 'Senior'
): boolean {
  if (!playerNationCode) return false;
  const upper = playerNationCode.toUpperCase();
  const compLower = competitionName.toLowerCase();

  // World Trophy / World Cup: 32 nations worldwide quota
  if (compLower.includes('world cup') || compLower.includes('world trophy')) {
    const uefaCodes = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'UEFA').slice(0, 13).map((s) => s.code.toUpperCase());
    const conmebolCodes = FULL_CONMEBOL_NATIONS.slice(0, 6).map((s) => s.code.toUpperCase());
    const cafCodes = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CAF').slice(0, 5).map((s) => s.code.toUpperCase());
    const afcCodes = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'AFC').slice(0, 4).map((s) => s.code.toUpperCase());
    const concacafCodes = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CONCACAF').slice(0, 4).map((s) => s.code.toUpperCase());
    const ofcCodes = ['NZL'];

    const qualifiedPool = new Set([...uefaCodes, ...conmebolCodes, ...cafCodes, ...afcCodes, ...concacafCodes, ...ofcCodes]);
    return qualifiedPool.has(upper);
  }

  // European Championship (UEFA Euro - 24 teams)
  if (compLower.includes('euro')) {
    const uefaCodes = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'UEFA').slice(0, 24).map((s) => s.code.toUpperCase());
    return uefaCodes.includes(upper);
  }

  // Copa América (10 CONMEBOL + 6 CONCACAF = 16 teams)
  if (compLower.includes('copa am')) {
    const conmebolCodes = FULL_CONMEBOL_NATIONS.map((s) => s.code.toUpperCase());
    const concacafCodes = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CONCACAF').slice(0, 6).map((s) => s.code.toUpperCase());
    return [...conmebolCodes, ...concacafCodes].includes(upper);
  }

  // Youth U17 World Cup: 24 teams worldwide
  if (tier === 'U17' && (compLower.includes('u-17') || compLower.includes('u17'))) {
    const uefa = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'UEFA').slice(0, 6).map((s) => s.code.toUpperCase());
    const conmebol = FULL_CONMEBOL_NATIONS.slice(0, 4).map((s) => s.code.toUpperCase());
    const caf = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CAF').slice(0, 4).map((s) => s.code.toUpperCase());
    const afc = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'AFC').slice(0, 4).map((s) => s.code.toUpperCase());
    const concacaf = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CONCACAF').slice(0, 4).map((s) => s.code.toUpperCase());
    const qualifiedPool = new Set([...uefa, ...conmebol, ...caf, ...afc, ...concacaf, 'NZL']);
    return qualifiedPool.has(upper);
  }

  return true;
}

/**
 * Generates a full European Qualifiers Draw (UEFA).
 * Distributed into seeded pots 1-5, with 1 team from each pot drawn into groups.
 * 1st place qualifies directly, 2nd advances to playoffs.
 */
export function generateEuropeanQualifiersDraw(
  playerNationCode: string,
  seasonYear: number,
  tier: NationalTeamTier = 'Senior'
): InternationalDrawState {
  const normPlayerCode = (playerNationCode || 'ENG').toUpperCase();
  const uefaSeeds = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'UEFA');

  // Ensure player's nation is included if UEFA
  const playerSeed = TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code.toUpperCase() === normPlayerCode);
  const isPlayerUefa = playerSeed?.confederation === 'UEFA';

  // Build candidate pool of UEFA nations (24-30 teams for 6 groups of 4-5 teams)
  const poolTeams: NationalTeamDrawTeam[] = uefaSeeds.map((seed) => ({
    code: seed.code,
    name: seed.name,
    iso: seed.iso,
    confederation: 'UEFA',
    rank: seed.rank,
    pot: 1,
    isPlayerNation: seed.code.toUpperCase() === normPlayerCode,
    ovr: calculateNationalTeamOvr(seed.rank, tier),
  }));

  // Sort by ranking descending (rank 1 is best)
  poolTeams.sort((a, b) => a.rank - b.rank);

  // Distribute into 4 or 5 Pots of 6 teams each (for 6 groups A through F)
  const numGroups = 6;
  const numPots = 4;
  const potsData: { potNumber: number; potLabel: string; teams: NationalTeamDrawTeam[] }[] = [];

  for (let p = 0; p < numPots; p++) {
    const potSlice = poolTeams.slice(p * numGroups, (p + 1) * numGroups).map((t) => ({
      ...t,
      pot: p + 1,
    }));
    potsData.push({
      potNumber: p + 1,
      potLabel: `Pot ${p + 1}`,
      teams: potSlice,
    });
  }

  // Build 6 Groups: A to F
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const groups: NationalTeamDrawGroup[] = groupLetters.map((l) => ({
    groupLetter: l,
    groupName: `Group ${l}`,
    teams: [],
    isPlayerGroup: false,
  }));

  // Perform authentic pot-by-pot draw with animation steps
  const animationSteps: DrawAnimationStep[] = [];
  let stepCount = 1;

  potsData.forEach((pot) => {
    // Shuffle teams within pot for randomized draw
    const shuffledPotTeams = shuffleArray(pot.teams);
    shuffledPotTeams.forEach((team, groupIdx) => {
      const targetGroup = groups[groupIdx];
      targetGroup.teams.push(team);
      if (team.isPlayerNation) {
        targetGroup.isPlayerGroup = true;
      }
      animationSteps.push({
        stepIndex: stepCount++,
        potNumber: pot.potNumber,
        team,
        targetGroupLetter: targetGroup.groupLetter,
        logText: `Pot ${pot.potNumber}: ${team.name} is drawn into Group ${targetGroup.groupLetter}`,
        isPlayerTeam: team.isPlayerNation,
      });
    });
  });

  const playerGroup = groups.find((g) => g.isPlayerGroup);

  return {
    id: `uefa-qual-draw-${seasonYear}-${Date.now()}`,
    competitionId: 'UEFA_QUALIFIERS',
    competitionName: tier === 'Senior' ? 'UEFA European Qualifiers' : `UEFA ${tier} Continental Qualifiers`,
    shortName: 'European Qualifiers',
    tier,
    seasonYear,
    format: 'uefa_qualifiers',
    isLeagueFormat: false,
    playerNationCode: normPlayerCode,
    playerGroupLetter: playerGroup?.groupLetter || 'A',
    pots: potsData,
    groups,
    animationSteps,
    isCompleted: false,
  };
}

/**
 * Generates South American Qualifiers (CONMEBOL Eliminatorias).
 * Authentic 10-nation single league table where all nations play each other.
 * Standings determine qualification directly (top 6 direct, 7th playoff).
 */
export function generateConmebolQualifiersLeague(
  playerNationCode: string,
  seasonYear: number,
  tier: NationalTeamTier = 'Senior'
): InternationalDrawState {
  const normPlayerCode = (playerNationCode || 'ARG').toUpperCase();

  const leagueTeams: NationalTeamDrawTeam[] = FULL_CONMEBOL_NATIONS.map((n, idx) => ({
    code: n.code,
    name: n.name,
    iso: n.iso,
    confederation: 'CONMEBOL',
    rank: n.rank,
    pot: 1,
    isPlayerNation: n.code.toUpperCase() === normPlayerCode,
    ovr: calculateNationalTeamOvr(n.rank, tier),
  }));

  // Sort by ranking
  leagueTeams.sort((a, b) => a.rank - b.rank);

  // Schedule presentation animation steps
  const animationSteps: DrawAnimationStep[] = leagueTeams.map((team, idx) => ({
    stepIndex: idx + 1,
    potNumber: 1,
    team,
    targetGroupLetter: 'CONMEBOL',
    logText: `${team.name} entered into CONMEBOL Eliminatorias League Table (Seed #${idx + 1})`,
    isPlayerTeam: team.isPlayerNation,
  }));

  const singleGroup: NationalTeamDrawGroup = {
    groupLetter: 'CONMEBOL',
    groupName: 'CONMEBOL League Table',
    teams: leagueTeams,
    isPlayerGroup: true,
  };

  return {
    id: `conmebol-qual-league-${seasonYear}-${Date.now()}`,
    competitionId: 'CONMEBOL_ELIMINATORIAS',
    competitionName: tier === 'Senior' ? 'CONMEBOL Eliminatorias' : `CONMEBOL Sudamericano ${tier}`,
    shortName: 'Eliminatorias',
    tier,
    seasonYear,
    format: 'conmebol_league',
    isLeagueFormat: true,
    playerNationCode: normPlayerCode,
    playerGroupLetter: 'CONMEBOL',
    pots: [
      {
        potNumber: 1,
        potLabel: 'CONMEBOL Nations',
        teams: leagueTeams,
      },
    ],
    groups: [singleGroup],
    leagueTeams,
    animationSteps,
    isCompleted: false,
  };
}

/**
 * Generates an authentic Major Tournament Group Draw (World Cup, Euros, Copa América, U17/U20 WC).
 * Totally independent of qualifying groups!
 * Applies genuine seeding pots and confederation constraints:
 * - Max 2 UEFA teams per group
 * - Max 1 from other confederations (CONMEBOL, CAF, AFC, CONCACAF)
 */
export function generateMajorTournamentGroupDraw(
  playerNationCode: string,
  competitionName: string,
  seasonYear: number,
  tier: NationalTeamTier = 'Senior'
): InternationalDrawState {
  const normPlayerCode = (playerNationCode || 'ENG').toUpperCase();
  const isWorldCup = competitionName.toLowerCase().includes('world cup');
  const isEuro = competitionName.toLowerCase().includes('euro');
  const isCopaAmerica = competitionName.toLowerCase().includes('copa am');
  const isU20 = tier === 'U20';

  let totalTeams = isEuro ? 24 : isCopaAmerica ? 16 : isU20 ? 24 : 32;
  const groupLetters = (isEuro || isU20)
    ? ['A', 'B', 'C', 'D', 'E', 'F']
    : isCopaAmerica
    ? ['A', 'B', 'C', 'D']
    : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const numGroups = groupLetters.length;

  // Build Qualified Nations Pool
  let qualifiedPool: Top50NationSeedData[] = [];

  if (isEuro) {
    qualifiedPool = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'UEFA').slice(0, 24);
  } else if (isCopaAmerica) {
    const conmebol = FULL_CONMEBOL_NATIONS.map((c) =>
      TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code === c.code) || {
        rank: c.rank,
        code: c.code,
        iso: c.iso,
        name: c.name,
        confederation: 'CONMEBOL' as Confederation,
        managerName: `${c.name} Coach`,
        managerNationality: c.name,
        primaryTacticStyle: 'possession' as const,
        primaryTacticFormation: '4-3-3' as const,
        secondaryTacticStyle: 'counter_attack' as const,
        secondaryTacticFormation: '4-4-2' as const,
        stadiumName: 'National Stadium',
        stadiumCapacity: 50000,
        homeKit: { style: 'normal' as const, color1: '#2563eb', color2: '#ffffff', pattern: 'solid' as const, collar: 'crew' as const },
        awayKit: { style: 'normal' as const, color1: '#ffffff', color2: '#2563eb', pattern: 'solid' as const, collar: 'crew' as const },
      }
    );
    const concacaf = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CONCACAF').slice(0, 6);
    qualifiedPool = [...conmebol, ...concacaf];
  } else if (isU20) {
    // U20 World Cup (24 nations: 5 UEFA, 4 CONMEBOL, 4 CAF, 4 AFC, 4 CONCACAF, 1 OFC, 2 wildcards)
    const uefa = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'UEFA').slice(0, 5);
    const conmebol = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CONMEBOL').slice(0, 4);
    const caf = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CAF').slice(0, 4);
    const afc = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'AFC').slice(0, 4);
    const concacaf = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CONCACAF').slice(0, 4);
    const ofc = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'OFC').slice(0, 1);
    const others = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => ![...uefa, ...conmebol, ...caf, ...afc, ...concacaf, ...ofc].includes(s)).slice(0, 2);
    qualifiedPool = [...uefa, ...conmebol, ...caf, ...afc, ...concacaf, ...ofc, ...others].slice(0, 24);
  } else {
    // World Cup (Senior & U17: 32 nations worldwide)
    const uefa = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'UEFA').slice(0, 13);
    const conmebol = FULL_CONMEBOL_NATIONS.slice(0, 6).map((c) =>
      TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code === c.code)!
    ).filter(Boolean);
    const caf = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CAF').slice(0, 5);
    const afc = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'AFC').slice(0, 4);
    const concacaf = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.confederation === 'CONCACAF').slice(0, 4);
    qualifiedPool = [...uefa, ...conmebol, ...caf, ...afc, ...concacaf].slice(0, 32);
  }

  // Ensure player's nation is included if not already in pool
  const playerInPool = qualifiedPool.some((s) => s.code.toUpperCase() === normPlayerCode);
  if (!playerInPool) {
    const playerSeed = TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code.toUpperCase() === normPlayerCode);
    if (playerSeed) {
      qualifiedPool.pop();
      qualifiedPool.push(playerSeed);
    }
  }

  // Sort qualified pool by FIFA ranking
  qualifiedPool.sort((a, b) => a.rank - b.rank);

  // Divide into 4 Pots of `numGroups` teams each
  const potsData: { potNumber: number; potLabel: string; teams: NationalTeamDrawTeam[] }[] = [];
  for (let p = 0; p < 4; p++) {
    const slice = qualifiedPool.slice(p * numGroups, (p + 1) * numGroups).map((seed) => ({
      code: seed.code,
      name: seed.name,
      iso: seed.iso,
      confederation: seed.confederation,
      rank: seed.rank,
      pot: p + 1,
      isPlayerNation: seed.code.toUpperCase() === normPlayerCode,
      ovr: calculateNationalTeamOvr(seed.rank, tier),
    }));
    potsData.push({
      potNumber: p + 1,
      potLabel: `Pot ${p + 1}`,
      teams: slice,
    });
  }

  // Initialize empty groups
  const groups: NationalTeamDrawGroup[] = groupLetters.map((l) => ({
    groupLetter: l,
    groupName: `Group ${l}`,
    teams: [],
    isPlayerGroup: false,
  }));

  const animationSteps: DrawAnimationStep[] = [];
  let stepIndex = 1;

  // Pot 1: Drawn directly into Groups A through H
  const pot1Shuffled = shuffleArray(potsData[0].teams);
  pot1Shuffled.forEach((team, gIdx) => {
    const targetGroup = groups[gIdx];
    targetGroup.teams.push(team);
    if (team.isPlayerNation) targetGroup.isPlayerGroup = true;
    animationSteps.push({
      stepIndex: stepIndex++,
      potNumber: 1,
      team,
      targetGroupLetter: targetGroup.groupLetter,
      logText: `Pot 1: ${team.name} is placed in Group ${targetGroup.groupLetter}`,
      isPlayerTeam: team.isPlayerNation,
    });
  });

  // Pots 2, 3, 4: Drawn with confederation protection rules
  for (let p = 1; p < 4; p++) {
    const currentPot = potsData[p];
    const potTeamsShuffled = shuffleArray(currentPot.teams);

    for (const team of potTeamsShuffled) {
      // Find candidate groups that don't violate confederation rules and have space
      const validGroups = groups.filter((g) => {
        if (g.teams.length > p) return false; // Already filled for this pot round

        if (isWorldCup) {
          if (team.confederation === 'UEFA') {
            const uefaCount = g.teams.filter((t) => t.confederation === 'UEFA').length;
            if (uefaCount >= 2) return false; // Max 2 UEFA
          } else {
            const sameFedCount = g.teams.filter((t) => t.confederation === team.confederation).length;
            if (sameFedCount >= 1) return false; // Max 1 non-UEFA
          }
        } else if (isCopaAmerica) {
          if (team.confederation === 'CONMEBOL') {
            const conCount = g.teams.filter((t) => t.confederation === 'CONMEBOL').length;
            if (conCount >= 3) return false;
          } else if (team.confederation === 'CONCACAF') {
            const conCount = g.teams.filter((t) => t.confederation === 'CONCACAF').length;
            if (conCount >= 2) return false;
          }
        }
        return true;
      });

      // Fallback: if strict rule cannot be satisfied, take first group with space
      const chosenGroup = validGroups[0] || groups.find((g) => g.teams.length <= p) || groups[0];
      chosenGroup.teams.push(team);
      if (team.isPlayerNation) {
        chosenGroup.isPlayerGroup = true;
      }

      animationSteps.push({
        stepIndex: stepIndex++,
        potNumber: p + 1,
        team,
        targetGroupLetter: chosenGroup.groupLetter,
        logText: `Pot ${p + 1}: ${team.name} drawn into Group ${chosenGroup.groupLetter}`,
        isPlayerTeam: team.isPlayerNation,
      });
    }
  }

  const playerGroup = groups.find((g) => g.isPlayerGroup);

  const compId = isWorldCup
    ? (tier === 'Senior' ? 'FIFA_WORLD_CUP' : `FIFA_${tier}_WORLD_CUP`)
    : isEuro
    ? (tier === 'Senior' ? 'UEFA_EURO' : `${tier}_UEFA_EURO`)
    : isCopaAmerica
    ? (tier === 'Senior' ? 'COPA_AMERICA' : `${tier}_COPA_AMERICA`)
    : `MAJOR_TOURNAMENT_${tier}`;

  return {
    id: `tourn-draw-${seasonYear}-${tier}-${Date.now()}`,
    competitionId: compId,
    competitionName,
    shortName: isWorldCup ? 'World Cup' : isEuro ? 'Euro' : 'Copa América',
    tier,
    seasonYear,
    format: 'tournament_groups',
    isLeagueFormat: false,
    playerNationCode: normPlayerCode,
    playerGroupLetter: playerGroup?.groupLetter || 'A',
    pots: potsData,
    groups,
    animationSteps,
    isCompleted: false,
  };
}

/**
 * Storage key helper for persistence of draw results
 */
export function getDrawStorageKey(competitionId: string, seasonYear: number, tier?: string): string {
  const tierPart = tier && !competitionId.includes(tier) ? `_${tier}` : '';
  return `fifa_draw_${competitionId}${tierPart}_${seasonYear}`;
}

export function saveDrawState(drawState: InternationalDrawState): void {
  try {
    const key = getDrawStorageKey(drawState.competitionId, drawState.seasonYear, drawState.tier);
    localStorage.setItem(key, JSON.stringify(drawState));
    // Also save under base key without tier for backwards compatibility
    const baseKey = `fifa_draw_${drawState.competitionId}_${drawState.seasonYear}`;
    localStorage.setItem(baseKey, JSON.stringify(drawState));
  } catch (e) {
    console.error('Failed to save draw state:', e);
  }
}

export function loadDrawState(competitionId: string, seasonYear: number, tier?: string): InternationalDrawState | null {
  try {
    const key = getDrawStorageKey(competitionId, seasonYear, tier);
    let raw = localStorage.getItem(key);
    if (!raw) {
      raw = localStorage.getItem(`fifa_draw_${competitionId}_${seasonYear}`);
    }
    if (!raw) return null;
    return JSON.parse(raw) as InternationalDrawState;
  } catch (e) {
    return null;
  }
}

/**
 * Authoritative Master Resolver: Gets existing draw or runs and saves a new one.
 */
export function getOrCreateAuthoritativeDraw(
  playerNationCode: string,
  competitionName: string,
  seasonYear: number,
  tier: NationalTeamTier = 'Senior',
  competitionType: 'qualifier' | 'tournament' = 'tournament'
): InternationalDrawState {
  const normCode = (playerNationCode || 'ENG').toUpperCase();
  const isConmebol = isConmebolNation(normCode);
  const isQual = competitionType === 'qualifier';

  const isEuro = competitionName.toLowerCase().includes('euro');
  const isCopaAmerica = competitionName.toLowerCase().includes('copa am');

  const compId = isQual
    ? (isConmebol ? (tier === 'Senior' ? 'CONMEBOL_ELIMINATORIAS' : `CONMEBOL_ELIMINATORIAS_${tier}`) : (tier === 'Senior' ? 'UEFA_QUALIFIERS' : `UEFA_QUALIFIERS_${tier}`))
    : isEuro
    ? (tier === 'Senior' ? 'UEFA_EURO' : `${tier}_UEFA_EURO`)
    : isCopaAmerica
    ? (tier === 'Senior' ? 'COPA_AMERICA' : `${tier}_COPA_AMERICA`)
    : (tier === 'Senior' ? 'FIFA_WORLD_CUP' : `FIFA_${tier}_WORLD_CUP`);

  const existing = loadDrawState(compId, seasonYear, tier);
  if (existing && existing.groups && existing.groups.length > 0 && existing.groups.some(g => g.teams.length > 0)) {
    return existing;
  }

  let newDraw: InternationalDrawState;
  if (isQual) {
    newDraw = isConmebol
      ? generateConmebolQualifiersLeague(normCode, seasonYear, tier)
      : generateEuropeanQualifiersDraw(normCode, seasonYear, tier);
  } else {
    newDraw = generateMajorTournamentGroupDraw(normCode, competitionName, seasonYear, tier);
  }

  saveDrawState(newDraw);
  return newDraw;
}

/**
 * Determines authentic knockout opponent for tournament progression based on the draw bracket.
 */
export function getTournamentKnockoutOpponentFromDraw(
  drawState: InternationalDrawState,
  playerNationCode: string,
  stageIndex: number = 0,
  playerGroupRank: 1 | 2 = 1
): { code: string; name: string; iso: string; ovr: number } {
  const normPlayerCode = (playerNationCode || 'ENG').toUpperCase();
  const numGroups = drawState.groups.length;
  const playerGroup = drawState.groups.find((g) => g.teams.some((t) => t.code.toUpperCase() === normPlayerCode)) || drawState.groups[0];
  const playerGroupLetter = playerGroup.groupLetter;

  let pairedGroupLetter = 'B';
  if (numGroups === 8) {
    const pairMap: Record<string, string> = {
      A: 'B', B: 'A',
      C: 'D', D: 'C',
      E: 'F', F: 'E',
      G: 'H', H: 'G',
    };
    pairedGroupLetter = pairMap[playerGroupLetter] || 'B';
  } else if (numGroups === 4) {
    const pairMap: Record<string, string> = {
      A: 'B', B: 'A',
      C: 'D', D: 'C',
    };
    pairedGroupLetter = pairMap[playerGroupLetter] || 'B';
  } else if (numGroups === 6) {
    const pairMap: Record<string, string> = {
      A: 'C', C: 'A',
      B: 'D', D: 'B',
      E: 'F', F: 'E',
    };
    pairedGroupLetter = pairMap[playerGroupLetter] || 'C';
  }

  const pairedGroup = drawState.groups.find((g) => g.groupLetter === pairedGroupLetter) || drawState.groups[1] || drawState.groups[0];

  // If stageIndex === 0 (Round of 16 or Quarter-Final):
  // 1st place in player's group plays 2nd place of paired group; 2nd place plays 1st place
  const targetOppRankInGroup = playerGroupRank === 1 ? 1 : 0;
  let oppTeam = pairedGroup.teams[targetOppRankInGroup] || pairedGroup.teams[0];

  if (oppTeam.code.toUpperCase() === normPlayerCode) {
    oppTeam = pairedGroup.teams.find((t) => t.code.toUpperCase() !== normPlayerCode) || pairedGroup.teams[0];
  }

  // If subsequent stage (SF, Final), choose another elite qualifier from the other side of the draw
  if (stageIndex > 0) {
    const otherGroups = drawState.groups.filter((g) => g.groupLetter !== playerGroupLetter && g.groupLetter !== pairedGroupLetter);
    const candidateTeams = otherGroups.flatMap((g) => g.teams.slice(0, 2)).filter((t) => t.code.toUpperCase() !== normPlayerCode);
    if (candidateTeams.length > 0) {
      candidateTeams.sort((a, b) => b.ovr - a.ovr);
      const chosen = candidateTeams[Math.min(stageIndex - 1, candidateTeams.length - 1)];
      return {
        code: chosen.code,
        name: chosen.name,
        iso: chosen.iso,
        ovr: chosen.ovr,
      };
    }
  }

  return {
    code: oppTeam.code,
    name: oppTeam.name,
    iso: oppTeam.iso,
    ovr: oppTeam.ovr,
  };
}
