import { PlayerConfig, PlayerCardData, Nationality } from '../types';
import { NationalTeamTier, Confederation } from '../types/nationalTeam';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { TOP_50_NATIONAL_TEAMS_SEEDS } from '../data/top50NationalTeamsData';
import {
  FULL_CONMEBOL_NATIONS,
  generateEuropeanQualifiersDraw,
  generateConmebolQualifiersLeague,
  generateMajorTournamentGroupDraw,
  loadDrawState,
  saveDrawState,
  InternationalDrawState,
  NationalTeamDrawTeam,
} from './internationalDrawEngine';
import {
  getInternationalCalendarEvent,
  isInternationalEventCompleted,
  markInternationalEventCompleted,
} from './internationalFootballSystem';
import { isConmebolNation } from './internationalCareerCycleEngine';
import { simulatePlayerGoalsAndAssists } from './goalAssistSimulationModifiers';

export interface MergedBlockMatchesOutput {
  unifiedMatches: SimulatedMatchResult[];
  internationalMatchesCount: number;
  pendingDrawState?: InternationalDrawState;
}

/**
 * Resolves the player's primary national team identity.
 */
export function resolvePlayerNationalTeamInfo(player: PlayerConfig): {
  code: string;
  name: string;
  iso: string;
  confederation: Confederation;
  ovr: number;
} {
  const nationality: Partial<Nationality> =
    player.nationality ||
    (player as any).activeInternationalDuty?.nation ||
    { code: 'ENG', name: 'England', iso: 'gb-eng' };

  const code = (nationality.code || player.countryCode || 'ENG').toUpperCase();
  const seed = TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code.toUpperCase() === code);

  return {
    code,
    name: nationality.name || seed?.name || 'England',
    iso: nationality.iso || seed?.iso || 'gb-eng',
    confederation: seed?.confederation || (isConmebolNation(code) ? 'CONMEBOL' : 'UEFA'),
    ovr: Math.max(74, Math.min(88, seed ? 89 - Math.floor(seed.rank * 0.35) : 78)),
  };
}

/**
 * Checks if the player has an active or eligible international campaign for this season & block.
 */
export function checkSeasonInternationalDuty(
  player: PlayerConfig,
  blockNumber: 1 | 2,
  seasonYear: number | string = 2026
): {
  hasDuty: boolean;
  tier: NationalTeamTier;
  competitionType: 'qualifier' | 'tournament';
  competitionName: string;
  shortName: string;
  isDrawRequired: boolean;
  drawState?: InternationalDrawState;
} {
  const sYear = typeof seasonYear === 'string' ? parseInt(seasonYear.split('/')[0], 10) || 2026 : seasonYear;
  const age = player.age || 18;
  const tier: NationalTeamTier = age <= 17 ? 'U17' : age <= 20 ? 'U20' : 'Senior';

  // Check if international football is unlocked / accepted
  const isDeclined = Boolean((player as any).declinedSeniorCallUp || (player as any).declinedU20CallUp || (player as any).declinedU17CallUp);
  if (isDeclined) {
    return { hasDuty: false, tier, competitionType: 'qualifier', competitionName: '', shortName: '', isDrawRequired: false };
  }

  const cycleEvent = getInternationalCalendarEvent(sYear, age, blockNumber);
  const compType = cycleEvent?.type || (blockNumber === 1 ? 'qualifier' : 'tournament');
  const compName = cycleEvent?.competitionName || (compType === 'qualifier' ? `${tier} Qualifiers` : `${tier} World Cup`);
  const shortName = cycleEvent?.shortName || (compType === 'qualifier' ? 'Qualifiers' : 'Tournament');

  // Check if already completed this cycle
  const isCompleted = isInternationalEventCompleted(player as any, tier, compType, sYear);
  if (isCompleted) {
    return { hasDuty: false, tier, competitionType: compType, competitionName: compName, shortName, isDrawRequired: false };
  }

  const playerNat = resolvePlayerNationalTeamInfo(player);
  const isConmebol = playerNat.confederation === 'CONMEBOL' || isConmebolNation(playerNat.code);

  // Check if Draw has already been conducted
  const compId = compType === 'qualifier'
    ? isConmebol ? 'CONMEBOL_ELIMINATORIAS' : 'UEFA_QUALIFIERS'
    : 'FIFA_WORLD_CUP';

  let drawState = loadDrawState(compId, sYear);
  const isDrawRequired = !drawState || !drawState.isCompleted;

  if (!drawState) {
    if (compType === 'qualifier') {
      drawState = isConmebol
        ? generateConmebolQualifiersLeague(playerNat.code, sYear, tier)
        : generateEuropeanQualifiersDraw(playerNat.code, sYear, tier);
    } else {
      drawState = generateMajorTournamentGroupDraw(playerNat.code, compName, sYear, tier);
    }
  }

  return {
    hasDuty: true,
    tier,
    competitionType: compType,
    competitionName: compName,
    shortName,
    isDrawRequired,
    drawState,
  };
}

/**
 * Builds SimulatedMatchResult objects for National Team matches.
 */
export function buildNationalTeamFixtures(
  player: PlayerConfig,
  tier: NationalTeamTier,
  competitionName: string,
  windowLabel: string,
  opponents: NationalTeamDrawTeam[],
  startMatchIndex: number
): SimulatedMatchResult[] {
  const playerNat = resolvePlayerNationalTeamInfo(player);
  const fixtures: SimulatedMatchResult[] = [];

  opponents.forEach((opp, idx) => {
    const isPlayerHome = idx % 2 === 0;
    const homeTeamName = isPlayerHome ? playerNat.name : opp.name;
    const awayTeamName = isPlayerHome ? opp.name : playerNat.name;
    const homeCode = isPlayerHome ? playerNat.code : opp.code;
    const awayCode = isPlayerHome ? opp.code : playerNat.code;
    const homeIso = isPlayerHome ? playerNat.iso : opp.iso;
    const awayIso = isPlayerHome ? opp.iso : playerNat.iso;
    const homeOvr = isPlayerHome ? playerNat.ovr : opp.ovr;
    const awayOvr = isPlayerHome ? opp.ovr : playerNat.ovr;

    // Simulation calculation
    const ovrDiff = homeOvr - awayOvr;
    const expectedHome = Math.max(0, 1.3 + ovrDiff * 0.04 + (Math.random() * 1.5 - 0.5));
    const expectedAway = Math.max(0, 1.0 - ovrDiff * 0.04 + (Math.random() * 1.5 - 0.5));
    const homeScore = Math.floor(expectedHome);
    const awayScore = Math.floor(expectedAway);

    const playerTeamWon = isPlayerHome ? homeScore > awayScore : awayScore > homeScore;
    const teamGoals = isPlayerHome ? homeScore : awayScore;

    // Calculate realistic player goals & assists
    const factor = (player.ovr || 75) / Math.max(50, isPlayerHome ? awayOvr : homeOvr);
    const sim = simulatePlayerGoalsAndAssists(player as any, factor, teamGoals);
    const goals = sim.playerGoals;
    const assists = sim.playerAssists;

    const baseRating = 6.5 + goals * 1.2 + assists * 0.8 + (playerTeamWon ? 0.4 : -0.2);
    const rating = Math.min(10.0, Math.max(6.0, Number((baseRating + (Math.random() * 0.6 - 0.3)).toFixed(1))));

    const matchFitness = Math.max(45, (player.fitness || 100) - Math.floor(12 + Math.random() * 8));

    fixtures.push({
      matchId: `nat-fix-${playerNat.code}-${opp.code}-${Date.now()}-${idx}`,
      matchIndex: startMatchIndex + idx,
      stageName: `${windowLabel} • Match ${idx + 1}`,
      homeTeamName,
      awayTeamName,
      homeScore,
      awayScore,
      playerTeamScore: isPlayerHome ? homeScore : awayScore,
      opponentScore: isPlayerHome ? awayScore : homeScore,
      isPlayerHome,
      playerStatus: 'starter',
      minutesPlayed: 90,
      playerGoals: goals,
      playerAssists: assists,
      playerRating: rating,
      isMvp: goals >= 2 || rating >= 8.5,
      isInjured: false,
      playerFitness: matchFitness,
      importanceCategory: 'IMPORTANT',
      importanceReason: `${competitionName} • ${windowLabel}`,
      isKeyMatch: idx === opponents.length - 1, // Final match of the window is key
      competitionName,
      competitionType: 'national',
      isNationalTeamMatch: true,
      nationalTier: tier,
      nationalCompName: competitionName,
      nationalWindow: windowLabel,
      homeNationCode: homeCode,
      awayNationCode: awayCode,
      homeNationIso: homeIso,
      awayNationIso: awayIso,
      homeNationOvr: homeOvr,
      awayNationOvr: awayOvr,
    });
  });

  return fixtures;
}

/**
 * Injects National Team matches into the normal season-block simulation timeline.
 * Block 1 (Summer Block):
 *  - Injects Autumn Window 1 around matchday 4-5 (2 matches)
 *  - Injects Autumn Window 2 around matchday 11-12 (2 matches)
 * Block 2 (Winter Block):
 *  - Injects Spring Window around matchday 26-27 (2 matches)
 *  - Injects Tournament Stage at end of Block 2 (3 group matches + knockouts)
 */
export function injectNationalTeamMatchesIntoBlock(
  baseMatches: SimulatedMatchResult[],
  player: PlayerConfig,
  blockNumber: 1 | 2,
  seasonYear: number | string = 2026
): MergedBlockMatchesOutput {
  const duty = checkSeasonInternationalDuty(player, blockNumber, seasonYear);

  if (!duty.hasDuty || !duty.drawState) {
    return {
      unifiedMatches: baseMatches,
      internationalMatchesCount: 0,
    };
  }

  // If draw has not been performed yet, return the draw state so UI can prompt ceremony
  if (duty.isDrawRequired) {
    return {
      unifiedMatches: baseMatches,
      internationalMatchesCount: 0,
      pendingDrawState: duty.drawState,
    };
  }

  const draw = duty.drawState;
  const playerNat = resolvePlayerNationalTeamInfo(player);

  // Get player's group opponents
  let groupOpponents: NationalTeamDrawTeam[] = [];
  if (draw.isLeagueFormat && draw.leagueTeams) {
    // CONMEBOL single league: opponents are all other 9 teams
    groupOpponents = draw.leagueTeams.filter((t) => t.code !== playerNat.code);
  } else {
    const playerGroup = draw.groups.find((g) => g.isPlayerGroup) || draw.groups[0];
    groupOpponents = (playerGroup?.teams || []).filter((t) => t.code !== playerNat.code);
  }

  if (groupOpponents.length === 0) {
    return { unifiedMatches: baseMatches, internationalMatchesCount: 0 };
  }

  const unifiedList: SimulatedMatchResult[] = [];
  let intCount = 0;

  if (blockNumber === 1) {
    // Block 1: Inject Autumn Windows
    // Window 1: Opponent 1 & 2 around base match 4 & 5
    const window1Opponents = groupOpponents.slice(0, 2);
    // Window 2: Opponent 3 & 4 (or 2 & 1 return) around base match 11 & 12
    const window2Opponents = groupOpponents.slice(2, 4).length >= 2
      ? groupOpponents.slice(2, 4)
      : groupOpponents.slice(0, 2);

    const win1Matches = buildNationalTeamFixtures(
      player,
      duty.tier,
      duty.competitionName,
      'FIFA Autumn Window 1',
      window1Opponents,
      4
    );

    const win2Matches = buildNationalTeamFixtures(
      player,
      duty.tier,
      duty.competitionName,
      'FIFA Autumn Window 2',
      window2Opponents,
      12
    );

    baseMatches.forEach((match, idx) => {
      unifiedList.push({
        ...match,
        matchIndex: unifiedList.length,
      });

      // After match 3, insert Window 1 (Autumn Window 1 / UEFA Nations League / U17 Qualifiers Matchday 1 & 2)
      if (idx === 2 || (baseMatches.length < 3 && idx === baseMatches.length - 1)) {
        win1Matches.forEach((wm) => {
          unifiedList.push({ ...wm, matchIndex: unifiedList.length });
          intCount++;
        });
      }

      // After match 6 (or penultimate match), insert Window 2 (Autumn Window 2 / U17 Qualifiers Matchday 3 & 4)
      if (idx === 5 || (baseMatches.length <= 6 && idx === baseMatches.length - 1)) {
        win2Matches.forEach((wm) => {
          unifiedList.push({ ...wm, matchIndex: unifiedList.length });
          intCount++;
        });
      }
    });
  } else {
    // Block 2: Inject Spring Window (match 26-27) and Tournament/Final Stage (end of block)
    const springOpponents = groupOpponents.slice(0, 2);
    const springMatches = buildNationalTeamFixtures(
      player,
      duty.tier,
      duty.competitionName,
      'FIFA Spring Window',
      springOpponents,
      26
    );

    baseMatches.forEach((match, idx) => {
      unifiedList.push({
        ...match,
        matchIndex: unifiedList.length,
      });

      // After match 7 in Block 2 (equivalent to matchday ~26), insert Spring Window
      if (idx === 6) {
        springMatches.forEach((wm) => {
          unifiedList.push({ ...wm, matchIndex: unifiedList.length });
          intCount++;
        });
      }
    });

    // If this season has a major tournament final stage, append Tournament Group Stage (3 matches)
    if (duty.competitionType === 'tournament') {
      const tournOpponents = groupOpponents.slice(0, 3);
      const tournMatches = buildNationalTeamFixtures(
        player,
        duty.tier,
        duty.competitionName,
        'Group Stage',
        tournOpponents,
        unifiedList.length
      );

      tournMatches.forEach((tm) => {
        unifiedList.push({ ...tm, matchIndex: unifiedList.length });
        intCount++;
      });
    }
  }

  return {
    unifiedMatches: unifiedList,
    internationalMatchesCount: intCount,
  };
}

/**
 * Updates player card stats when an international match concludes.
 * Strictly separates youth national stats from senior national stats,
 * and never mixes international goals with domestic club league goals.
 */
export function applyInternationalMatchStatsToPlayer(
  player: PlayerCardData,
  match: SimulatedMatchResult
): PlayerCardData {
  if (!match.isNationalTeamMatch) return player;

  const updated: PlayerCardData = { ...player };
  const goals = match.playerGoals || 0;
  const assists = match.playerAssists || 0;
  const tier = match.nationalTier || 'Senior';

  if (tier === 'U17') {
    updated.u17Caps = (updated.u17Caps || 0) + 1;
    updated.u17Goals = (updated.u17Goals || 0) + goals;
  } else if (tier === 'U20') {
    updated.u20Caps = (updated.u20Caps || 0) + 1;
    updated.u20Goals = (updated.u20Goals || 0) + goals;
  } else {
    // Senior National Team
    updated.seniorCaps = (updated.seniorCaps || 0) + 1;
    updated.seniorGoals = (updated.seniorGoals || 0) + goals;
  }

  // Combined international aggregate
  updated.internationalCaps = (updated.internationalCaps || 0) + 1;
  updated.internationalGoals = (updated.internationalGoals || 0) + goals;

  // Persist fitness
  if (match.playerFitness !== undefined) {
    updated.fitness = match.playerFitness;
    updated.staminaCurrent = match.playerFitness;
  }

  return updated;
}
