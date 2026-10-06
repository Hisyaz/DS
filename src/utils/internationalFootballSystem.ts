import { Nationality, PlayerCardData, TrophyItem } from '../types';
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
import { getEligibleNationalities, acceptInternationalCallUp, declineInternationalCallUp } from './nationalTeamSystem';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { awardTrophiesToPlayer } from './trophySystem';
import { processWorldCupFeat } from './nicknameSystem';
import { simulatePlayerGoalsAndAssists } from './goalAssistSimulationModifiers';
import {
  calculateSimulatedTeamOvr,
  getConfederationTournamentFormat,
  getQualifiersTournamentInfo,
  getContinentalOpponents,
  isConmebolNation,
  CONMEBOL_NATIONS_SEEDS,
} from './internationalCareerCycleEngine';
import {
  getOrCreateAuthoritativeDraw,
  getTournamentKnockoutOpponentFromDraw,
  loadDrawState,
  InternationalDrawState,
} from './internationalDrawEngine';
import {
  isTop20NationalTeam,
  checkU17QualifiersEligibility,
  checkU17WorldCupEligibility,
  isSimulationOnlyNation,
  simulateU17Match,
} from './u17NationalTeamEngine';
import {
  getU20EligibleCallUpQueue,
} from './u20NationalTeamEngine';
import { getNationalTeamPowerscaleImpact } from './powerscaleSystem';

export interface InternationalCalendarEvent {
  id: string;
  tier: NationalTeamTier;
  type: 'qualifier' | 'tournament';
  windowName: string;
  competitionName: string;
  shortName: string;
  seasonYear: number;
  isContinental?: boolean;
  isWorldCup?: boolean;
  confederation?: Confederation;
  description: string;
}

/**
 * Standardizes event IDs across all international systems to prevent duplicate call-up loops.
 */
export function getInternationalEventId(
  tier: NationalTeamTier,
  type: 'qualifier' | 'tournament',
  seasonYear: number
): string {
  return `int-event-${tier.toLowerCase()}-${type}-${seasonYear}`;
}

/**
 * Checks whether an international event has already been completed or resolved for a given season.
 * Checks the canonical event ID as well as all legacy alias variations.
 */
export function isInternationalEventCompleted(
  player: PlayerCardData,
  tier: NationalTeamTier,
  type: 'qualifier' | 'tournament',
  seasonYear: number
): boolean {
  const completed = player.completedInternationalEvents || [];
  const primaryId = getInternationalEventId(tier, type, seasonYear);
  const legacyCycleId = `int-cycle-${tier}-${type}-${seasonYear}`;
  const legacyShortId = `${tier.toLowerCase()}-${type === 'qualifier' ? 'qualifiers' : 'worldcup'}-${seasonYear}`;
  const legacyIntId = `int-${tier.toLowerCase()}-${type === 'qualifier' ? 'qualifiers' : 'wc'}-${seasonYear}`;
  const legacyWcId = `u17-worldcup-${seasonYear}`;
  const legacyU17QualId = `u17-qualifiers-${seasonYear}`;

  return (
    completed.includes(primaryId) ||
    completed.includes(legacyCycleId) ||
    completed.includes(legacyShortId) ||
    completed.includes(legacyIntId) ||
    (tier === 'U17' && type === 'tournament' && completed.includes(legacyWcId)) ||
    (tier === 'U17' && type === 'qualifier' && completed.includes(legacyU17QualId))
  );
}

/**
 * Marks an international event as completed, saving the canonical ID and all aliases
 * to permanently prevent re-triggering or getting locked in a loop.
 */
export function markInternationalEventCompleted(
  player: PlayerCardData,
  tier: NationalTeamTier,
  type: 'qualifier' | 'tournament',
  seasonYear: number
): PlayerCardData {
  const primaryId = getInternationalEventId(tier, type, seasonYear);
  const legacyCycleId = `int-cycle-${tier}-${type}-${seasonYear}`;
  const legacyShortId = `${tier.toLowerCase()}-${type === 'qualifier' ? 'qualifiers' : 'worldcup'}-${seasonYear}`;
  const legacyIntId = `int-${tier.toLowerCase()}-${type === 'qualifier' ? 'qualifiers' : 'wc'}-${seasonYear}`;
  const legacyWcId = `u17-worldcup-${seasonYear}`;
  const legacyU17QualId = `u17-qualifiers-${seasonYear}`;

  const allEvents = Array.from(
    new Set([
      ...(player.completedInternationalEvents || []),
      primaryId,
      legacyCycleId,
      legacyShortId,
      legacyIntId,
      ...(tier === 'U17' && type === 'tournament' ? [legacyWcId] : []),
      ...(tier === 'U17' && type === 'qualifier' ? [legacyU17QualId] : []),
    ])
  );
  const resolvedSeasons = Array.from(
    new Set([...(player.resolvedInternationalSeasons || []), seasonYear])
  );

  return {
    ...player,
    completedInternationalEvents: allEvents,
    resolvedInternationalSeasons: resolvedSeasons,
  };
}

/**
 * Gets the current or upcoming International Calendar Event based on player age and career year.
 * Schedule:
 * - U17 World Cup: every year from 2030 until 2033 (qualifiers in previous block)
 * - U20 Qualifiers: only once on 2034
 * - U20 World Cup: only once in 2035
 * - Senior Continental: 2036, 2040, 2044...
 * - Senior World Cup Qualifiers: 2041, 2045...
 * - Senior World Cup Final Stage: 2042, 2046...
 */
export function getInternationalCalendarEvent(
  startYear: number,
  playerAge: number,
  block?: 1 | 2
): InternationalCalendarEvent | null {
  // 1. Youth Cycles:
  // Section 1: U17 World Cup & Qualifiers happens for players under 18 (Qualifiers in Block 1, World Cup in Block 2)
  if (playerAge <= 17) {
    if (block === 1) {
      return {
        id: `int-u17-qualifiers-${startYear}`,
        tier: 'U17',
        type: 'qualifier',
        windowName: 'Autumn International Window (Qualifiers)',
        competitionName: 'FIFA U-17 World Cup Continental Qualifiers',
        shortName: 'U17 Qualifiers',
        seasonYear: startYear,
        isWorldCup: true,
        description: 'Continental tournament to determine qualification spots for the upcoming FIFA U-17 World Cup.',
      };
    } else {
      return {
        id: `int-u17-wc-${startYear}`,
        tier: 'U17',
        type: 'tournament',
        windowName: 'FIFA U-17 World Cup (Summer)',
        competitionName: 'FIFA U-17 World Cup Final Stage',
        shortName: 'U17 World Cup',
        seasonYear: startYear,
        isWorldCup: true,
        description: 'The premier global tournament for under-17 national teams.',
      };
    }
  }


  // Section 2: 2034 U20 Qualifiers (happens ONLY ONCE on 2034)
  if (startYear === 2034) {
    return {
      id: `int-u20-qualifiers-${startYear}`,
      tier: 'U20',
      type: 'qualifier',
      windowName: 'Post-Winter International Window (June)',
      competitionName: 'FIFA U-20 World Cup Continental Qualifiers',
      shortName: 'U20 Qualifiers',
      seasonYear: startYear,
      isWorldCup: true,
      description: 'Continental championship determining qualification for the 2035 FIFA U-20 World Cup.',
    };
  }

  // Section 3: 2035 U20 World Cup (happens ONLY ONCE in 2035)
  if (startYear === 2035) {
    return {
      id: `int-u20-wc-${startYear}`,
      tier: 'U20',
      type: 'tournament',
      windowName: 'FIFA U-20 World Cup (July)',
      competitionName: 'FIFA U-20 World Cup Final Stage',
      shortName: 'U20 World Cup',
      seasonYear: startYear,
      isWorldCup: true,
      description: 'The premier global championship for the top under-20 national teams.',
    };
  }

  // Section 4: Senior 4-Year Cycles
  // Senior Continental Championships: 2036, 2040, 2044, 2048, 2052, etc.
  if (startYear >= 2036 && startYear % 4 === 0 && (startYear - 2042) % 4 !== 0) {
    return {
      id: `int-senior-continental-${startYear}`,
      tier: 'Senior',
      type: 'tournament',
      windowName: 'Senior International Tournament Window (June/July)',
      competitionName: 'Continental Championship',
      shortName: 'Continental Championship',
      seasonYear: startYear,
      isContinental: true,
      description: 'The pinnacle continental national team competition for senior football.',
    };
  }

  // Senior World Cup Qualifiers: 2041, 2045, 2049, 2053, etc.
  if (startYear >= 2041 && (startYear - 2041) % 4 === 0) {
    return {
      id: `int-senior-wc-qualifiers-${startYear}`,
      tier: 'Senior',
      type: 'qualifier',
      windowName: 'FIFA International Windows (Sept / Nov / March)',
      competitionName: 'FIFA World Cup Qualifiers',
      shortName: 'World Cup Qualifiers',
      seasonYear: startYear,
      isWorldCup: true,
      description: 'Official FIFA qualification fixtures across international windows to secure a World Cup spot.',
    };
  }

  // Senior World Cup Final Stage: 2042, 2046, 2050, 2054, etc.
  if (startYear >= 2042 && (startYear - 2042) % 4 === 0) {
    return {
      id: `int-senior-wc-${startYear}`,
      tier: 'Senior',
      type: 'tournament',
      windowName: 'FIFA World Cup Final Stage (June/July)',
      competitionName: 'FIFA World Cup Final Tournament',
      shortName: 'FIFA World Cup',
      seasonYear: startYear,
      isWorldCup: true,
      description: 'The ultimate stage in world football: 32 nations competing for the World Cup trophy.',
    };
  }

  return null;
}

/**
 * Procedurally generates realistic detailed in-game match commentary and action breakdown
 */
export function generateInternationalMatchCommentary(
  homeName: string,
  awayName: string,
  homeScore: number,
  awayScore: number,
  playerName: string,
  playerStats?: InternationalMatchPlayerStats
): MatchCommentaryItem[] {
  const logs: MatchCommentaryItem[] = [];
  logs.push({
    minute: 1,
    text: `KICK-OFF! The referee blows the whistle to start this international fixture between ${homeName} and ${awayName}!`,
    type: 'whistle',
  });

  const minuteEvents = [
    { min: 14, text: `${homeName} builds patience through the midfield, probing for openings in the defensive line.` },
    { min: 28, text: `Great defensive tackle on the wing, halting a rapid counter-attack.` },
    { min: 45, text: `Half-time whistle sounds. Tactical adjustments expected for both managers in the locker room.` },
    { min: 62, text: `High intensity pressing from ${awayName} forces a turnover in the final third.` },
    { min: 78, text: `Electrifying atmosphere in the stadium as the decisive minutes approach.` },
    { min: 90, text: `Full-time whistle! Final score: ${homeName} ${homeScore} - ${awayScore} ${awayName}.` },
  ];

  minuteEvents.forEach((ev) => {
    logs.push({ minute: ev.min, text: ev.text, type: ev.min === 90 || ev.min === 45 ? 'whistle' : 'general' });
  });

  if (playerStats && playerStats.goals > 0) {
    for (let g = 0; g < playerStats.goals; g++) {
      const min = 20 + g * 32 + Math.floor(Math.random() * 12);
      logs.push({
        minute: min,
        text: `⚽ GOOOAL! ${playerName} strikes with clinical composure into the bottom corner! Sensational finish!`,
        type: 'goal',
      });
    }
  }

  if (playerStats && playerStats.assists > 0) {
    const min = 54 + Math.floor(Math.random() * 15);
    logs.push({
      minute: min,
      text: `👟 INCREDIBLE VISION! ${playerName} delivers a pinpoint through ball to create a goalscoring masterpiece!`,
      type: 'chance',
    });
  }

  return logs.sort((a, b) => a.minute - b.minute);
}

/**
 * Evaluates national team call-up and returns an authentic call-up proposal if eligible.
 */
export function generateInternationalCallUp(player: PlayerCardData): InternationalCallUp | null {
  const age = player.age || 17;
  const ovr = player.ovr || player.overallRating || 70;
  const startYear = 2026 + ((player.age || 10) - 10);
  const cycle = getInternationalCalendarEvent(startYear, age);

  if (!cycle) return null;

  // U17 allows youth players (Age 10-17) who meet the OVR threshold, even if not yet professional
  if (cycle.tier !== 'U17' && !isProfessionalPlayer(player)) return null;

  const eligibleNats = getEligibleNationalities(player);
  if (!eligibleNats || eligibleNats.length === 0) return null;

  // Filter declined nations for this specific tier
  const declinedNations = player.declinedInternationalCallUps?.[cycle.tier] || [];
  const activeNats = eligibleNats.filter((n) => !declinedNations.includes(n.code.toUpperCase()));
  if (activeNats.length === 0) return null;

  // For U17, evaluate eligibility using the official U17 foundation engine
  if (cycle.tier === 'U17') {
    for (const candNation of activeNats) {
      const evalRes =
        cycle.type === 'tournament'
          ? checkU17WorldCupEligibility(player, candNation, Boolean(player.u17Qualified))
          : checkU17QualifiersEligibility(player, candNation);

      if (evalRes.isEligible) {
        const db = getNationalTeamsDatabase();
        const dbTeam = db.find((t) => t.nation.code.toUpperCase() === candNation.code.toUpperCase());
        const managerName = dbTeam?.manager?.name || `${candNation.name} U17 Head Coach`;

        return {
          id: `callup-${candNation.code}-U17-${startYear}-${Date.now()}`,
          nation: candNation,
          tier: 'U17',
          competitionName: cycle.competitionName,
          managerName,
          role: evalRes.role,
          bonusFame: cycle.type === 'tournament' ? 60 : 40,
          date: cycle.windowName,
          isSeniorLockWarning: false,
        };
      }
    }
    return null;
  }

  // For U20, evaluate eligibility using the official U20 engine with lowest-to-highest queue
  if (cycle.tier === 'U20') {
    const isWc = cycle.type === 'tournament';
    const queue = getU20EligibleCallUpQueue(
      player,
      isWc,
      (code) => Boolean(player.u20Qualified),
      declinedNations
    );
    if (queue.length > 0) {
      const cand = queue[0];
      const db = getNationalTeamsDatabase();
      const dbTeam = db.find((t) => t.nation.code.toUpperCase() === cand.nation.code.toUpperCase());
      const managerName = dbTeam?.manager?.name || `${cand.nation.name} U20 Head Coach`;

      return {
        id: `callup-${cand.nation.code}-U20-${startYear}-${Date.now()}`,
        nation: cand.nation,
        tier: 'U20',
        competitionName: cycle.competitionName,
        managerName,
        role: cand.role,
        bonusFame: isWc ? 100 : 60,
        date: cycle.windowName,
        isSeniorLockWarning: false,
      };
    }
    return null;
  }

  // Check senior locking
  let callingNation = activeNats[0];
  if (player.isSeniorLocked && player.seniorNation) {
    const matched = activeNats.find((n) => n.name.toLowerCase() === player.seniorNation?.toLowerCase());
    if (matched) callingNation = matched;
  } else if (activeNats.length > 1) {
    // Prefer nation with highest ranking or active nationality
    callingNation = activeNats[0];
  }

  // Verify minimum OVR for tier
  let minOvr = 75;
  if (ovr < minOvr) return null;

  const role: 'Key Starter' | 'Squad Player' | 'Promising Prospect' =
    ovr >= minOvr + 10 ? 'Key Starter' : ovr >= minOvr + 5 ? 'Squad Player' : 'Promising Prospect';

  const bonusFame = 200;

  const db = getNationalTeamsDatabase();
  const dbTeam = db.find((t) => t.nation.code.toUpperCase() === callingNation.code.toUpperCase());
  const managerName = dbTeam?.manager?.name || `${callingNation.name} Head Coach`;

  return {
    id: `callup-${callingNation.code}-${cycle.tier}-${startYear}-${Date.now()}`,
    nation: callingNation,
    tier: cycle.tier,
    competitionName: cycle.competitionName,
    managerName,
    role,
    bonusFame,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    isSeniorLockWarning: cycle.tier === 'Senior' && !player.isSeniorLocked,
  };
}

/**
 * Initializes the full International Tournament / Qualifier Hub State with fixtures, standings, and opponents.
 */
export function initializeInternationalHubState(
  player: PlayerCardData,
  callingNation: Nationality,
  tier: NationalTeamTier,
  seasonYear: number,
  forcedType?: 'qualifier' | 'tournament',
  forcedCompetitionName?: string,
  providedDraw?: InternationalDrawState | null
): InternationalTournamentHubState {
  const isQual = forcedType === 'qualifier';
  const cycle = getInternationalCalendarEvent(seasonYear, player.age || 18, isQual ? 1 : 2);
  const competitionType = forcedType || cycle?.type || 'qualifier';
  const isWorldCup = cycle?.isWorldCup ?? true;
  const isContinental = cycle?.isContinental ?? false;
  const competitionName =
    forcedCompetitionName ||
    cycle?.competitionName ||
    (tier === 'Senior'
      ? competitionType === 'qualifier'
        ? 'FIFA World Cup Qualifiers'
        : 'FIFA World Cup Final Stage'
      : `${tier} ${competitionType === 'qualifier' ? 'Continental Qualifiers' : 'World Cup'}`);
  const shortName =
    cycle?.shortName ||
    (tier === 'Senior'
      ? competitionType === 'qualifier'
        ? 'World Cup Qualifiers'
        : 'FIFA World Cup'
      : `${tier} ${competitionType === 'qualifier' ? 'Qualifiers' : 'World Cup'}`);

  const seedNation = TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code.toUpperCase() === callingNation.code.toUpperCase()) || {
    rank: 22,
    name: callingNation.name,
    code: callingNation.code,
    iso: callingNation.iso || 'gb-eng',
    confederation: (isConmebolNation(callingNation.code) ? 'CONMEBOL' : 'UEFA') as Confederation,
    managerName: `${callingNation.name} Head Coach`,
    primaryTacticStyle: 'possession' as const,
    primaryTacticFormation: '4-3-3' as const,
  };

  const confederation = seedNation.confederation;
  const isConmebol = isConmebolNation(callingNation.code);
  const playerTeamOvr = calculateSimulatedTeamOvr(seedNation.rank, tier);

  // Obtain Authoritative Draw (creates genuine drawn groups with pots & confederation rules)
  const drawState = providedDraw || getOrCreateAuthoritativeDraw(
    callingNation.code,
    competitionName,
    seasonYear,
    tier,
    competitionType
  );

  let groupTeams: { code: string; name: string; iso: string; ovr: number; isPlayer: boolean }[] = [];
  let playerGroupLetter = 'A';

  if (drawState.isLeagueFormat && drawState.leagueTeams && drawState.leagueTeams.length > 0) {
    // CONMEBOL single league format
    groupTeams = drawState.leagueTeams.slice(0, 6).map((t) => ({
      code: t.code,
      name: t.name,
      iso: t.iso,
      ovr: t.ovr,
      isPlayer: t.code.toUpperCase() === callingNation.code.toUpperCase(),
    }));
    playerGroupLetter = 'CONMEBOL';
  } else {
    // Find the group where callingNation is drawn
    const foundGroup = drawState.groups.find((g) =>
      g.teams.some((t) => t.code.toUpperCase() === callingNation.code.toUpperCase())
    ) || drawState.groups[0];

    playerGroupLetter = foundGroup?.groupLetter || 'A';
    groupTeams = (foundGroup?.teams || []).map((t) => ({
      code: t.code,
      name: t.name,
      iso: t.iso,
      ovr: t.ovr,
      isPlayer: t.code.toUpperCase() === callingNation.code.toUpperCase(),
    }));
  }

  // Ensure player team is represented in groupTeams with playerTeamOvr
  const playerInGroup = groupTeams.find((gt) => gt.isPlayer);
  if (!playerInGroup && groupTeams.length > 0) {
    groupTeams[0] = {
      code: callingNation.code,
      name: callingNation.name,
      iso: callingNation.iso || 'gb-eng',
      ovr: playerTeamOvr,
      isPlayer: true,
    };
  } else if (playerInGroup) {
    playerInGroup.ovr = playerTeamOvr;
  }

  const standings: InternationalStandingRow[] = groupTeams.map((gt) => ({
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
  }));

  // Build allGroups structure so all tournament groups are persisted and viewable
  const allGroups = drawState.groups.map((g) => ({
    groupLetter: g.groupLetter,
    groupName: g.groupName,
    teams: g.teams.map((t) => ({
      code: t.code,
      name: t.name,
      iso: t.iso,
      ovr: t.ovr,
      isPlayerNation: t.code.toUpperCase() === callingNation.code.toUpperCase(),
    })),
    standings: g.teams.map((t) => ({
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
      isPlayerNation: t.code.toUpperCase() === callingNation.code.toUpperCase(),
    })),
  }));

  // Build Full Round-Robin Fixtures Schedule for ALL teams in group
  const n = groupTeams.length; // 4 or 6
  const numRounds = n - 1; // 3 matchdays for 4 teams, 5 matchdays for 6 teams
  const matchesPerRound = n / 2;
  const fixtures: InternationalFixture[] = [];
  let globalMatchIndex = 1;

  for (let round = 0; round < numRounds; round++) {
    const stageMatchday = round + 1;
    const stageLabel =
      competitionType === 'qualifier'
        ? isConmebol
          ? `CONMEBOL Eliminatorias - Fecha ${stageMatchday}`
          : `Qualifiers - Matchday ${stageMatchday}`
        : `Group Stage - Matchday ${stageMatchday}`;

    const windowLabel =
      tier === 'Senior' && competitionType === 'qualifier'
        ? round < 2
          ? 'FIFA Autumn Window 1 (Sept)'
          : round < 4
          ? 'FIFA Autumn Window 2 (Nov)'
          : 'FIFA Spring Window (March)'
        : 'International Match Period';

    // Berger pairing algorithm for round-robin
    const roundMatches: { homeIdx: number; awayIdx: number }[] = [];
    for (let i = 0; i < matchesPerRound; i++) {
      let t1 = (round + i) % (n - 1);
      let t2 = (n - 1 - i + round) % (n - 1);
      if (i === 0) {
        t2 = n - 1;
      }
      if (round % 2 === 1) {
        roundMatches.push({ homeIdx: t2, awayIdx: t1 });
      } else {
        roundMatches.push({ homeIdx: t1, awayIdx: t2 });
      }
    }

    // Put player's match first on each matchday
    roundMatches.sort((a, b) => {
      const aHasPlayer = groupTeams[a.homeIdx].isPlayer || groupTeams[a.awayIdx].isPlayer;
      const bHasPlayer = groupTeams[b.homeIdx].isPlayer || groupTeams[b.awayIdx].isPlayer;
      return aHasPlayer === bHasPlayer ? 0 : aHasPlayer ? -1 : 1;
    });

    for (const m of roundMatches) {
      const homeTeam = groupTeams[m.homeIdx];
      const awayTeam = groupTeams[m.awayIdx];
      const isPlayerMatch = homeTeam.isPlayer || awayTeam.isPlayer;

      fixtures.push({
        id: `int-fix-${homeTeam.code}-${awayTeam.code}-m${stageMatchday}-${Date.now()}-${globalMatchIndex}`,
        matchNumber: globalMatchIndex++,
        stageMatchday,
        stageName: stageLabel,
        competitionName,
        windowLabel,
        homeNation: {
          code: homeTeam.code,
          name: homeTeam.name,
          iso: homeTeam.iso,
          ovr: homeTeam.ovr,
        },
        awayNation: {
          code: awayTeam.code,
          name: awayTeam.name,
          iso: awayTeam.iso,
          ovr: awayTeam.ovr,
        },
        isPlayerMatch,
        isPlayerHome: homeTeam.isPlayer,
        isPlayed: false,
        isKnockout: false,
      });
    }
  }

  const knockoutStages =
    competitionType === 'tournament'
      ? tier === 'U17'
        ? ['Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Final']
        : ['Quarter-Final', 'Semi-Final', 'Final']
      : [];

  const playerOvr = player.ovr || 75;
  const role = playerOvr >= 85 ? 'Key Starter' : playerOvr >= 75 ? 'Squad Player' : 'Promising Prospect';

  // Find the index of the first player match (which is 0)
  const firstPlayerIdx = fixtures.findIndex((f) => f.isPlayerMatch);

  return {
    id: `int-hub-${callingNation.code}-${tier}-${seasonYear}`,
    tier,
    seasonYear,
    competitionType,
    competitionName,
    shortName,
    confederation,
    hostCountry: isConmebol ? 'South America' : 'International Venue',
    isWorldCup,
    isContinental,
    callingNation,
    playerRole: role,
    managerName: seedNation.managerName || `${callingNation.name} Head Coach`,
    managerTactic: `${seedNation.primaryTacticFormation} ${seedNation.primaryTacticStyle}`,
    windowLabel: cycle?.windowName || 'FIFA International Window',
    fixtures,
    currentFixtureIndex: firstPlayerIdx !== -1 ? firstPlayerIdx : 0,
    standings,
    isKnockoutStageActive: false,
    knockoutStages,
    currentKnockoutStageIndex: 0,
    isFinished: false,
    playerQualified: false,
    newsHeadline: `${callingNation.name.toUpperCase()} ${tier.toUpperCase()} COMMENCE ${competitionName.toUpperCase()}`,
    newsSummary: `${callingNation.name} national team assemble under ${seedNation.managerName || 'the manager'} for ${competitionName}. ${player.name} is selected in the squad as ${role}.`,
    totalGoals: 0,
    totalAssists: 0,
    capsGained: 0,
    drawId: drawState.id,
    drawGroupLetter: playerGroupLetter,
    allGroups,
  };
}

/**
 * Simulates an international fixture automatically or records interactive Key Match results.
 * Simulates EVERY match scheduled for the active matchday so all teams advance simultaneously.
 */
export function simulateInternationalFixture(
  hubState: InternationalTournamentHubState,
  player: PlayerCardData,
  isInteractiveKeyMatch: boolean = false,
  keyMatchResult?: {
    playerScore: number;
    opponentScore: number;
    playerGoals: number;
    playerAssists: number;
    isWin: boolean;
  }
): InternationalTournamentHubState {
  const updated = { ...hubState };
  const fixtures = [...updated.fixtures];
  const curIdx = updated.currentFixtureIndex;

  if (curIdx >= fixtures.length) return updated;

  const fix = { ...fixtures[curIdx] };
  const currentMatchday = fix.stageMatchday || fix.matchNumber;
  const isKnockout = fix.isKnockout || updated.isKnockoutStageActive;
  const pos = player.position || 'ST';

  let homeScore = 0;
  let awayScore = 0;
  let playerStats: InternationalMatchPlayerStats | undefined;

  if (isInteractiveKeyMatch && keyMatchResult) {
    homeScore = fix.isPlayerHome ? keyMatchResult.playerScore : keyMatchResult.opponentScore;
    awayScore = fix.isPlayerHome ? keyMatchResult.opponentScore : keyMatchResult.playerScore;

    playerStats = {
      minutes: 90,
      goals: keyMatchResult.playerGoals,
      assists: keyMatchResult.playerAssists,
      shots: keyMatchResult.playerGoals + Math.floor(Math.random() * 3),
      passes: 28 + Math.floor(Math.random() * 16),
      tackles: 2 + Math.floor(Math.random() * 4),
      matchRating: Number((7.0 + keyMatchResult.playerGoals * 1.2 + keyMatchResult.playerAssists * 0.8).toFixed(1)),
      mvpStatus: keyMatchResult.playerGoals >= 2 ? 'MVP 🏆' : keyMatchResult.isWin ? 'Top Performer ⭐' : 'Solid Performance 👍',
    };
  } else {
    // Automated simulation engine for player's match
    const homeOvr = fix.homeNation.ovr;
    const awayOvr = fix.awayNation.ovr;
    const isWorldCupMatch = updated.tier === 'Senior' && (
      (updated.competitionName || '').toLowerCase().includes('world cup') ||
      (updated.shortName || '').toLowerCase().includes('wc')
    );

    let homePowerscaleMod = 1.0;
    let awayPowerscaleMod = 1.0;
    if (isWorldCupMatch) {
      homePowerscaleMod = getNationalTeamPowerscaleImpact(fix.homeNation.code, fix.homeNation.name).effectiveModifier;
      awayPowerscaleMod = getNationalTeamPowerscaleImpact(fix.awayNation.code, fix.awayNation.name).effectiveModifier;
    }

    const diff = (homeOvr * homePowerscaleMod) - (awayOvr * awayPowerscaleMod) + (fix.isPlayerHome ? 2 : -2);

    const expectedHome = Math.max(0, (1.3 + diff * 0.05 + (Math.random() * 1.5 - 0.75)) * homePowerscaleMod);
    const expectedAway = Math.max(0, (1.1 - diff * 0.04 + (Math.random() * 1.5 - 0.75)) * awayPowerscaleMod);

    homeScore = Math.floor(expectedHome);
    awayScore = Math.floor(expectedAway);

    // Apply U17 Rigging Rule: Implemented nation must win against simulation-only nation
    if (updated.tier === 'U17') {
      const homeIsSim = isSimulationOnlyNation(fix.homeNation.code);
      const awayIsSim = isSimulationOnlyNation(fix.awayNation.code);
      if (homeIsSim && !awayIsSim) {
        awayScore = Math.max(1, Math.floor(1 + Math.random() * 3));
        homeScore = Math.min(awayScore - 1, Math.floor(Math.random() * 2));
      } else if (!homeIsSim && awayIsSim) {
        homeScore = Math.max(1, Math.floor(1 + Math.random() * 3));
        awayScore = Math.min(homeScore - 1, Math.floor(Math.random() * 2));
      }
    }

    const teamGoals = fix.isPlayerHome ? homeScore : awayScore;
    const oppNationOvr = fix.isPlayerHome ? awayOvr : homeOvr;
    const factor = (player.ovr || 75) / Math.max(50, oppNationOvr);
    const sim = simulatePlayerGoalsAndAssists(player, factor, teamGoals);
    const goals = sim.playerGoals;
    const assists = sim.playerAssists;

    const baseRating = 6.4 + goals * 1.1 + assists * 0.7 + (teamGoals > 0 ? 0.3 : -0.2);
    const rating = Math.min(10.0, Math.max(5.8, Number((baseRating + (Math.random() * 0.6 - 0.3)).toFixed(1))));

    playerStats = {
      minutes: Math.floor(70 + Math.random() * 21),
      goals,
      assists,
      shots: goals + Math.floor(Math.random() * 4),
      passes: Math.floor(24 + Math.random() * 25),
      tackles: Math.floor(1 + Math.random() * 5),
      matchRating: rating,
      mvpStatus: goals >= 2 ? 'MVP 🏆' : rating >= 8.0 ? 'Top Performer ⭐' : 'Solid Performance 👍',
    };
  }

  // Handle penalty shootout if knockout draw
  if (isKnockout && homeScore === awayScore) {
    let penHome = 4 + Math.floor(Math.random() * 2);
    let penAway = 4 + Math.floor(Math.random() * 2);
    if (penHome === penAway) {
      const isWorldCup = updated.tier === 'Senior' && (
        (updated.competitionName || '').toLowerCase().includes('world cup') ||
        (updated.shortName || '').toLowerCase().includes('wc')
      );
      let homeComposure = 0.50;
      if (isWorldCup) {
        const hMod = getNationalTeamPowerscaleImpact(fix.homeNation.code, fix.homeNation.name).effectiveModifier;
        const aMod = getNationalTeamPowerscaleImpact(fix.awayNation.code, fix.awayNation.name).effectiveModifier;
        homeComposure += (hMod - aMod) * 0.30;
      }
      if (Math.random() < Math.max(0.20, Math.min(0.80, homeComposure))) {
        penHome += 1;
      } else {
        penAway += 1;
      }
    }
    fix.penaltiesHome = penHome;
    fix.penaltiesAway = penAway;
    fix.extraTime = true;
  }

  fix.homeScore = homeScore;
  fix.awayScore = awayScore;
  fix.isPlayed = true;
  fix.playerStats = playerStats;
  fix.commentaryLogs = generateInternationalMatchCommentary(
    fix.homeNation.name,
    fix.awayNation.name,
    homeScore,
    awayScore,
    player.name,
    playerStats
  );

  fixtures[curIdx] = fix;
  updated.totalGoals += playerStats.goals;
  updated.totalAssists += playerStats.assists;
  updated.capsGained += 1;

  // SIMULATE ALL OTHER MATCHES BELONGING TO THIS MATCHDAY
  fixtures.forEach((f, idx) => {
    if (idx !== curIdx && (f.stageMatchday === currentMatchday || (isKnockout && f.stageName === fix.stageName)) && !f.isPlayed) {
      let simHome = 0;
      let simAway = 0;

      if (updated.tier === 'U17') {
        const fHomeSim = isSimulationOnlyNation(f.homeNation.code);
        const fAwaySim = isSimulationOnlyNation(f.awayNation.code);
        if (fHomeSim && !fAwaySim) {
          // Implemented away team must win
          simAway = Math.max(1, Math.floor(1 + Math.random() * 3));
          simHome = Math.min(simAway - 1, Math.floor(Math.random() * 2));
        } else if (!fHomeSim && fAwaySim) {
          // Implemented home team must win
          simHome = Math.max(1, Math.floor(1 + Math.random() * 3));
          simAway = Math.min(simHome - 1, Math.floor(Math.random() * 2));
        } else {
          const diff = f.homeNation.ovr - f.awayNation.ovr;
          simHome = Math.max(0, Math.floor(1.2 + diff * 0.04 + Math.random() * 1.6));
          simAway = Math.max(0, Math.floor(1.1 - diff * 0.04 + Math.random() * 1.5));
        }
      } else {
        const isWorldCup = updated.tier === 'Senior' && (
          (updated.competitionName || '').toLowerCase().includes('world cup') ||
          (updated.shortName || '').toLowerCase().includes('wc')
        );
        let hMod = 1.0;
        let aMod = 1.0;
        if (isWorldCup) {
          hMod = getNationalTeamPowerscaleImpact(f.homeNation.code, f.homeNation.name).effectiveModifier;
          aMod = getNationalTeamPowerscaleImpact(f.awayNation.code, f.awayNation.name).effectiveModifier;
        }

        const diff = (f.homeNation.ovr * hMod) - (f.awayNation.ovr * aMod);
        simHome = Math.max(0, Math.floor((1.2 + diff * 0.04 + Math.random() * 1.6) * hMod));
        simAway = Math.max(0, Math.floor((1.1 - diff * 0.04 + Math.random() * 1.5) * aMod));
      }

      f.homeScore = simHome;
      f.awayScore = simAway;
      f.isPlayed = true;

      if (f.isKnockout && simHome === simAway) {
        f.extraTime = true;
        const isWorldCup = updated.tier === 'Senior' && (
          (updated.competitionName || '').toLowerCase().includes('world cup') ||
          (updated.shortName || '').toLowerCase().includes('wc')
        );
        let homeComposure = 0.50;
        if (isWorldCup) {
          const hMod = getNationalTeamPowerscaleImpact(f.homeNation.code, f.homeNation.name).effectiveModifier;
          const aMod = getNationalTeamPowerscaleImpact(f.awayNation.code, f.awayNation.name).effectiveModifier;
          homeComposure += (hMod - aMod) * 0.30;
        }
        const homeWon = Math.random() < Math.max(0.20, Math.min(0.80, homeComposure));
        f.penaltiesHome = homeWon ? 5 : 4;
        f.penaltiesAway = homeWon ? 4 : 5;
      }
    }
  });

  updated.fixtures = fixtures;

  // RECALCULATE STANDINGS FROM ALL PLAYED GROUP MATCHES
  if (!isKnockout) {
    const standingsMap = new Map<string, InternationalStandingRow>();
    updated.standings.forEach((r) => {
      standingsMap.set(r.nationCode, {
        ...r,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        qualified: false,
      });
    });

    fixtures
      .filter((f) => !f.isKnockout && f.isPlayed && f.homeScore !== undefined && f.awayScore !== undefined)
      .forEach((f) => {
        const h = standingsMap.get(f.homeNation.code);
        const a = standingsMap.get(f.awayNation.code);
        const hs = f.homeScore!;
        const as = f.awayScore!;

        if (h && a) {
          h.played += 1;
          a.played += 1;
          h.goalsFor += hs;
          h.goalsAgainst += as;
          a.goalsFor += as;
          a.goalsAgainst += hs;
          h.goalDifference = h.goalsFor - h.goalsAgainst;
          a.goalDifference = a.goalsFor - a.goalsAgainst;

          if (hs > as) {
            h.wins += 1;
            h.points += 3;
            a.losses += 1;
          } else if (as > hs) {
            a.wins += 1;
            a.points += 3;
            h.losses += 1;
          } else {
            h.draws += 1;
            h.points += 1;
            a.draws += 1;
            a.points += 1;
          }
        }
      });

    const sortedStandings = Array.from(standingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    const isConmebol = isConmebolNation(updated.callingNation.code);
    const qualifyingSpots = isConmebol ? 4 : 2;
    sortedStandings.forEach((row, idx) => {
      row.qualified = idx < qualifyingSpots;
    });

    updated.standings = sortedStandings;
  }

  // Find next unplayed player fixture
  const nextPlayerFixIdx = fixtures.findIndex((f, idx) => idx > curIdx && f.isPlayerMatch && !f.isPlayed);

  if (nextPlayerFixIdx !== -1) {
    updated.currentFixtureIndex = nextPlayerFixIdx;
  } else {
    // All scheduled player matches in the current stage are finished!
    if (updated.competitionType === 'tournament' && !updated.isKnockoutStageActive) {
      const playerRow = updated.standings.find((s) => s.nationCode === updated.callingNation.code);
      const isQualified = playerRow?.qualified ?? false;

      if (isQualified && updated.knockoutStages.length > 0) {
        // TRANSITION TO KNOCKOUT STAGE
        updated.isKnockoutStageActive = true;
        updated.currentKnockoutStageIndex = 0;

        let oppSeed = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.code !== updated.callingNation.code)[0];
        let oppOvr = calculateSimulatedTeamOvr(oppSeed.rank, updated.tier);

        const compKey = updated.isWorldCup
          ? (updated.tier === 'Senior' ? 'FIFA_WORLD_CUP' : `FIFA_${updated.tier}_WORLD_CUP`)
          : updated.competitionName.toLowerCase().includes('euro')
          ? (updated.tier === 'Senior' ? 'UEFA_EURO' : `${updated.tier}_UEFA_EURO`)
          : (updated.tier === 'Senior' ? 'COPA_AMERICA' : `${updated.tier}_COPA_AMERICA`);

        const drawState = loadDrawState(compKey, updated.seasonYear, updated.tier) ||
          loadDrawState('FIFA_WORLD_CUP', updated.seasonYear, updated.tier);

        if (drawState) {
          const playerRankInGroup = (updated.standings[0]?.nationCode === updated.callingNation.code ? 1 : 2) as 1 | 2;
          const koOpp = getTournamentKnockoutOpponentFromDraw(drawState, updated.callingNation.code, 0, playerRankInGroup);
          if (koOpp) {
            oppSeed = {
              rank: 15,
              name: koOpp.name,
              code: koOpp.code,
              iso: koOpp.iso,
              confederation: 'UEFA',
              managerName: `${koOpp.name} Coach`,
              primaryTacticStyle: 'possession',
              primaryTacticFormation: '4-3-3',
            } as any;
            oppOvr = koOpp.ovr;
          }
        }

        const knockoutFixture: InternationalFixture = {
          id: `int-ko-${updated.callingNation.code}-qf-${Date.now()}`,
          matchNumber: updated.fixtures.length + 1,
          stageName: updated.knockoutStages[0],
          competitionName: updated.competitionName,
          windowLabel: 'Knockout Stage',
          homeNation: {
            code: updated.callingNation.code,
            name: updated.callingNation.name,
            iso: updated.callingNation.iso || 'gb-eng',
            ovr: calculateSimulatedTeamOvr(20, updated.tier),
          },
          awayNation: {
            code: oppSeed.code,
            name: oppSeed.name,
            iso: oppSeed.iso,
            ovr: oppOvr,
          },
          isPlayerMatch: true,
          isPlayerHome: true,
          isPlayed: false,
          isKnockout: true,
        };

        updated.fixtures.push(knockoutFixture);
        updated.currentFixtureIndex = updated.fixtures.length - 1;
        updated.currentKnockoutOpponent = {
          code: oppSeed.code,
          name: oppSeed.name,
          iso: oppSeed.iso,
          ovr: oppOvr,
        };
        updated.newsHeadline = `${updated.callingNation.name.toUpperCase()} ADVANCE TO THE ${updated.knockoutStages[0].toUpperCase()}!`;
        updated.newsSummary = `With impressive performances across all matchdays, ${updated.callingNation.name} secured group qualification and will face ${oppSeed.name} in the ${updated.knockoutStages[0]}.`;
      } else {
        // Eliminated in Group Stage
        updated.isFinished = true;
        updated.playerFinishStage = 'Group Stage';
        updated.newsHeadline = `${updated.callingNation.name} concluded participation in the ${updated.shortName}`;
        updated.newsSummary = `${updated.callingNation.name} did not accumulate sufficient points to advance past the group stage.`;
      }
    } else if (updated.isKnockoutStageActive) {
      // IN KNOCKOUT STAGE: Evaluate Player Win / Loss
      const playerTeamWon = fix.isPlayerHome
        ? (fix.homeScore || 0) > (fix.awayScore || 0) || (fix.penaltiesHome || 0) > (fix.penaltiesAway || 0)
        : (fix.awayScore || 0) > (fix.homeScore || 0) || (fix.penaltiesAway || 0) > (fix.penaltiesHome || 0);

      const koIdx = updated.currentKnockoutStageIndex;
      const currentStageName = updated.knockoutStages[koIdx];

      if (playerTeamWon) {
        if (koIdx < updated.knockoutStages.length - 1) {
          // Advance to next Knockout Round (Semi-Final or Final)
          const nextKoIdx = koIdx + 1;
          const nextStageName = updated.knockoutStages[nextKoIdx];
          let nextOppSeed = TOP_50_NATIONAL_TEAMS_SEEDS.filter((s) => s.code !== updated.callingNation.code)[nextKoIdx + 1] || TOP_50_NATIONAL_TEAMS_SEEDS[nextKoIdx + 2];
          let nextOppOvr = calculateSimulatedTeamOvr(nextOppSeed.rank, updated.tier);

          const compKey = updated.isWorldCup
            ? (updated.tier === 'Senior' ? 'FIFA_WORLD_CUP' : `FIFA_${updated.tier}_WORLD_CUP`)
            : updated.competitionName.toLowerCase().includes('euro')
            ? (updated.tier === 'Senior' ? 'UEFA_EURO' : `${updated.tier}_UEFA_EURO`)
            : (updated.tier === 'Senior' ? 'COPA_AMERICA' : `${updated.tier}_COPA_AMERICA`);

          const drawState = loadDrawState(compKey, updated.seasonYear, updated.tier) ||
            loadDrawState('FIFA_WORLD_CUP', updated.seasonYear, updated.tier);

          if (drawState) {
            const koOpp = getTournamentKnockoutOpponentFromDraw(drawState, updated.callingNation.code, nextKoIdx, 1);
            if (koOpp) {
              nextOppSeed = {
                rank: 10,
                name: koOpp.name,
                code: koOpp.code,
                iso: koOpp.iso,
                confederation: 'UEFA',
                managerName: `${koOpp.name} Coach`,
                primaryTacticStyle: 'possession',
                primaryTacticFormation: '4-3-3',
              } as any;
              nextOppOvr = koOpp.ovr;
            }
          }

          const nextKoFixture: InternationalFixture = {
            id: `int-ko-${updated.callingNation.code}-${nextKoIdx + 1}-${Date.now()}`,
            matchNumber: updated.fixtures.length + 1,
            stageName: nextStageName,
            competitionName: updated.competitionName,
            windowLabel: 'Knockout Stage',
            homeNation: {
              code: updated.callingNation.code,
              name: updated.callingNation.name,
              iso: updated.callingNation.iso || 'gb-eng',
              ovr: calculateSimulatedTeamOvr(20, updated.tier),
            },
            awayNation: {
              code: nextOppSeed.code,
              name: nextOppSeed.name,
              iso: nextOppSeed.iso,
              ovr: nextOppOvr,
            },
            isPlayerMatch: true,
            isPlayerHome: true,
            isPlayed: false,
            isKnockout: true,
          };

          updated.fixtures.push(nextKoFixture);
          updated.currentFixtureIndex = updated.fixtures.length - 1;
          updated.currentKnockoutStageIndex = nextKoIdx;
          updated.currentKnockoutOpponent = {
            code: nextOppSeed.code,
            name: nextOppSeed.name,
            iso: nextOppSeed.iso,
            ovr: nextOppOvr,
          };
          updated.newsHeadline = `VICTORY! ${updated.callingNation.name.toUpperCase()} ADVANCE TO THE ${nextStageName.toUpperCase()}!`;
          updated.newsSummary = `${updated.callingNation.name} triumphed in the ${currentStageName} and now prepare for ${nextStageName} vs ${nextOppSeed.name}.`;
        } else {
          // CHAMPIONS 🏆
          updated.isFinished = true;
          updated.playerFinishStage = 'CHAMPIONS 🏆';
          updated.champion = {
            name: updated.callingNation.name,
            code: updated.callingNation.code,
            iso: updated.callingNation.iso || 'gb-eng',
          };
          updated.newsHeadline = `🏆 HISTORIC TRIUMPH! ${updated.callingNation.name.toUpperCase()} ARE CROWNED ${updated.competitionName.toUpperCase()} CHAMPIONS!`;
          updated.newsSummary = `In an unforgettable final, ${updated.callingNation.name} lifted the trophy of the ${updated.competitionName}! ${player.name} played a decisive role in this international triumph.`;
        }
      } else {
        // Eliminated in Knockout
        updated.isFinished = true;
        updated.playerFinishStage = currentStageName === 'Final' ? 'Runner-Up 🥈' : currentStageName;
        updated.newsHeadline = `${updated.callingNation.name} concluded ${updated.shortName} in the ${currentStageName}`;
        updated.newsSummary = `${updated.callingNation.name} suffered a hard-fought defeat against ${fix.awayNation.name} in the ${currentStageName}.`;
      }
    } else {
      // Finished Qualifiers campaign
      updated.isFinished = true;
      const playerRow = updated.standings.find((s) => s.nationCode === updated.callingNation.code);
      updated.playerQualified = playerRow?.qualified ?? false;

      const worldCupName = updated.tier === 'Senior' ? 'FIFA World Cup' : `FIFA ${updated.tier} World Cup`;
      updated.newsHeadline = updated.playerQualified
        ? `¡${updated.callingNation.name.toUpperCase()} QUALIFY FOR THE ${worldCupName.toUpperCase()}!`
        : `${updated.callingNation.name} fell short in qualification for the ${worldCupName}.`;
      updated.newsSummary = updated.playerQualified
        ? `Finishing rank #${(updated.standings.findIndex((s) => s.nationCode === updated.callingNation.code) || 0) + 1} with ${playerRow?.points || 0} pts, ${updated.callingNation.name} secured their spot in the ${worldCupName}.`
        : `${updated.callingNation.name} concluded their qualifying campaign with ${playerRow?.points || 0} pts, missing the qualification zone.`;
    }
  }

  // Record active match result for immediate feedback
  updated.activeMatchResult = {
    fixture: fix,
    playerRating: playerStats.matchRating,
    xpGained: Math.round(playerStats.matchRating * 15),
    fameGained: Math.round(playerStats.goals * 40 + playerStats.assists * 25 + (playerStats.matchRating >= 8.0 ? 30 : 10)),
  };

  return updated;
}

/**
 * Concludes international duty, persists stats, awards trophies if champions, and returns updated player.
 */
export function finalizeInternationalDuty(
  player: PlayerCardData,
  hubState: InternationalTournamentHubState
): { updatedPlayer: PlayerCardData; message: string } {
  let updated = { ...player };

  const tier = hubState.tier;
  const addedCaps = hubState.capsGained;
  const addedGoals = hubState.totalGoals;
  const addedAssists = hubState.totalAssists;

  if (tier === 'U17') {
    updated.u17Caps = (updated.u17Caps || 0) + addedCaps;
    updated.u17Goals = (updated.u17Goals || 0) + addedGoals;
    if (hubState.playerQualified) updated.u17Qualified = true;
    if (hubState.isWorldCup) {
      const historyItem = {
        seasonYear: hubState.seasonYear,
        playerAge: updated.age || 16,
        nationName: hubState.callingNation.name,
        nationCode: hubState.callingNation.code,
        playerFinishStage: hubState.playerFinishStage || 'Group Stage',
        championNation: hubState.playerFinishStage === 'CHAMPIONS 🏆' ? hubState.callingNation.name : 'Brazil',
        runnerUpNation: 'France',
        thirdPlaceNation: 'Spain',
        playerGoals: addedGoals,
        playerAssists: addedAssists,
        playerCaps: addedCaps,
      };
      updated.u17TournamentHistory = [...(updated.u17TournamentHistory || []), historyItem];
    }
  } else if (tier === 'U20') {
    updated.u20Caps = (updated.u20Caps || 0) + addedCaps;
    updated.u20Goals = (updated.u20Goals || 0) + addedGoals;
    if (hubState.playerQualified) updated.u20Qualified = true;
    if (hubState.isWorldCup) {
      const historyItem = {
        seasonYear: hubState.seasonYear,
        playerAge: updated.age || 19,
        nationName: hubState.callingNation.name,
        nationCode: hubState.callingNation.code,
        playerFinishStage: hubState.playerFinishStage || 'Group Stage',
        championNation: hubState.playerFinishStage === 'CHAMPIONS 🏆' ? hubState.callingNation.name : 'Argentina',
        runnerUpNation: 'Brazil',
        thirdPlaceNation: 'France',
        playerGoals: addedGoals,
        playerAssists: addedAssists,
        playerCaps: addedCaps,
      };
      updated.u20TournamentHistory = [...(updated.u20TournamentHistory || []), historyItem];
    }
  } else {
    updated.seniorCaps = (updated.seniorCaps || 0) + addedCaps;
    updated.seniorGoals = (updated.seniorGoals || 0) + addedGoals;
    if (hubState.playerQualified) updated.seniorQualified = true;
  }

  updated.internationalCaps = (updated.internationalCaps || 0) + addedCaps;
  updated.internationalGoals = (updated.internationalGoals || 0) + addedGoals;

  // If champion, award official Trophy
  if (hubState.playerFinishStage === 'CHAMPIONS 🏆') {
    const trophyTitle = hubState.competitionName;
    const isWc = Boolean(hubState.isWorldCup);
    const iconType = isWc ? 'world-cup' : tier === 'U17' || tier === 'U20' ? 'youth-trophy' : 'cup';
    updated = awardTrophiesToPlayer(updated, [
      {
        name: trophyTitle,
        category: 'international',
        year: String(hubState.seasonYear),
        prestige: tier === 'Senior' ? 100 : tier === 'U20' ? 85 : 75,
        iconType,
      },
    ]);

    if (isWc && tier === 'Senior') {
      const featCheck = processWorldCupFeat(updated, true, true);
      updated = featCheck.player;
    }
  }

  const startYear = hubState.seasonYear;
  const compType = hubState.competitionType;
  updated = markInternationalEventCompleted(updated, tier, compType, startYear);
  if (compType === 'qualifier') {
    if (tier === 'U17') updated.u17Qualified = true;
    if (tier === 'U20') updated.u20Qualified = true;
    if (tier === 'Senior') updated.seniorQualified = true;
  }

  // Clean up active international duty and return player to club state
  updated.activeInternationalDuty = undefined;
  (updated as any).isRepresentingNationalTeam = false;
  (updated as any).activeMatchResult = undefined;

  return {
    updatedPlayer: updated,
    message: `International duty concluded with ${hubState.callingNation.name} ${tier}. Total caps: ${addedCaps}, Goals: ${addedGoals}, Assists: ${addedAssists}.`,
  };
}
