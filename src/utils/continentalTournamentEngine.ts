import { PlayerCardData, PlayerConfig } from '../types';
import {
  ContinentalCompetitionId,
  ContinentalGroup,
  ContinentalGroupStanding,
  ContinentalKnockoutTie,
  ContinentalMatchResult,
  ContinentalTournamentSeasonState,
  ContinentalQualificationEntry,
  SuperCupSeasonState,
} from '../types/continentalCompetitions';
import { EditorTeamData } from '../types/leagueEditor';
import {
  CONTINENTAL_COMPETITIONS_CATALOG,
  getEligibleClubsForFederation,
} from './continentalDatabaseSystem';
import { CONTINENTAL_FINAL_VENUE_POOLS } from './continentalVenueSystem';
import { getSafeLocalStorage } from './storageCleaner';
import { simulateDatabaseMatch } from './databaseMatchSimulationEngine';
import { simulatePlayerGoalsAndAssists } from './goalAssistSimulationModifiers';
import { awardTrophiesToPlayer } from './trophySystem';
import { generateContinentalVictoryNews } from './continentalVictoryNewsSystem';
import { recordEuropeanFinalWinner } from './europeanCompetitionWinners';
import { recordContinentalWinnerTitle, getClubPowerscaleImpact } from './powerscaleSystem';
import {
  getOrCreateDisciplinaryRecord,
  checkIsSuspendedForMatch,
  serveSuspensionForMatch,
  recordMatchDisciplinaryEvents,
  checkAndApplyStageYellowClear,
} from './competitionDisciplinarySystem';
import {
  getBadRepRedCardChanceMultiplier,
  addBadReputation,
} from './badReputationSystem';

const STORAGE_PREFIX = 'CONTINENTAL_TOURNAMENT_STATE_';
const SUPERCUP_PREFIX = 'SUPERCUP_SEASON_STATE_';

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const storage = getSafeLocalStorage();
    if (!storage) return fallback;
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    const storage = getSafeLocalStorage();
    if (!storage) return;
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function removeStoredItem(key: string): void {
  try {
    const storage = getSafeLocalStorage();
    if (!storage) return;
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Storage helpers for Continental Tournament State
 */
export function getContinentalTournamentState(
  competitionId: ContinentalCompetitionId,
  seasonYear: number
): ContinentalTournamentSeasonState | null {
  const key = `${STORAGE_PREFIX}${competitionId}_${seasonYear}`;
  return getStoredItem<ContinentalTournamentSeasonState | null>(key, null);
}

export function saveContinentalTournamentState(
  state: ContinentalTournamentSeasonState
): void {
  const key = `${STORAGE_PREFIX}${state.competitionId}_${state.seasonYear}`;
  setStoredItem(key, state);
}

export function clearContinentalTournamentState(
  competitionId: ContinentalCompetitionId,
  seasonYear: number
): void {
  const key = `${STORAGE_PREFIX}${competitionId}_${seasonYear}`;
  removeStoredItem(key);
}

export function getSuperCupSeasonState(
  superCupId: ContinentalCompetitionId,
  seasonYear: number
): SuperCupSeasonState | null {
  const key = `${SUPERCUP_PREFIX}${superCupId}_${seasonYear}`;
  return getStoredItem<SuperCupSeasonState | null>(key, null);
}

export function saveSuperCupSeasonState(state: SuperCupSeasonState): void {
  const key = `${SUPERCUP_PREFIX}${state.id}_${state.seasonYear}`;
  setStoredItem(key, state);
}

/**
 * Format matchday calendar date string
 */
function getMatchdayDateString(seasonYear: number, mdIndex: number): string {
  const dates = [
    `17 September ${seasonYear}`,
    `1 October ${seasonYear}`,
    `22 October ${seasonYear}`,
    `5 November ${seasonYear}`,
    `26 November ${seasonYear}`,
    `10 December ${seasonYear}`,
    `21 January ${seasonYear + 1}`,
    `28 January ${seasonYear + 1}`,
  ];
  return dates[mdIndex - 1] || `January ${seasonYear + 1}`;
}

/**
 * Creates an authoritative continental match fixture.
 */
function createFixture(
  competitionId: ContinentalCompetitionId,
  seasonYear: number,
  stage: ContinentalMatchResult['stage'],
  stageName: string,
  matchdayIndex: number,
  home: { id: string; name: string; ovr: number; isPlayer: boolean },
  away: { id: string; name: string; ovr: number; isPlayer: boolean },
  dateStr?: string
): ContinentalMatchResult {
  return {
    id: `fix_${competitionId}_${seasonYear}_md${matchdayIndex}_${home.id}_vs_${away.id}`,
    competitionId,
    seasonYear,
    stage,
    stageName,
    matchdayIndex,
    dateStr: dateStr || getMatchdayDateString(seasonYear, matchdayIndex),
    homeTeamId: home.id,
    homeTeamName: home.name,
    awayTeamId: away.id,
    awayTeamName: away.name,
    homeScore: 0,
    awayScore: 0,
    isPlayerMatch: home.isPlayer || away.isPlayer,
    isCompleted: false,
    isKeyMatch: false,
  };
}

/**
 * Generates official Group Stage Fixtures for 32-team traditional formats (Double Round Robin: MD 1 to 6)
 */
export function generateGroupFixtures(
  groupId: string,
  competitionId: ContinentalCompetitionId,
  seasonYear: number,
  teams: { id: string; name: string; ovr: number; isPlayer: boolean }[]
): ContinentalMatchResult[] {
  if (teams.length !== 4) return [];
  const [t0, t1, t2, t3] = teams;
  const fixtures: ContinentalMatchResult[] = [];

  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 1', 1, t0, t1));
  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 1', 1, t2, t3));

  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 2', 2, t1, t2));
  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 2', 2, t3, t0));

  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 3', 3, t0, t2));
  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 3', 3, t1, t3));

  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 4', 4, t2, t0));
  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 4', 4, t3, t1));

  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 5', 5, t1, t0));
  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 5', 5, t3, t2));

  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 6', 6, t2, t1));
  fixtures.push(createFixture(competitionId, seasonYear, 'group', 'Matchday 6', 6, t0, t3));

  return fixtures;
}

/**
 * Helper to build 36-team Swiss League Phase fixtures & rivalries with authentic country protection.
 */
function build36TeamLeaguePhaseData(
  competitionId: ContinentalCompetitionId,
  seasonYear: number,
  qualifiers: ContinentalQualificationEntry[],
  playerClubId?: string
) {
  const isEcl = competitionId === 'UEFA_ECL';
  const numMatchdays = isEcl ? 6 : 8;

  // Organize by pots
  const potsMap = new Map<number, ContinentalQualificationEntry[]>();
  qualifiers.forEach((q) => {
    const pot = q.seedingPot || 1;
    if (!potsMap.has(pot)) potsMap.set(pot, []);
    potsMap.get(pot)!.push(q);
  });

  const teamRivals: Record<string, import('../types/continentalCompetitions').ContinentalLeagueRivalInfo[]> = {};
  qualifiers.forEach((q) => {
    teamRivals[q.teamId] = [];
  });

  const allFixtures: ContinentalMatchResult[] = [];
  const scheduledPairs = new Set<string>();

  const getPairKey = (id1: string, id2: string) => [id1, id2].sort().join('__');

  // Pair generator for UCL / UEL (4 pots of 9 teams, 8 matches: 2 rivals from each pot, 1H/1A)
  if (!isEcl) {
    const potList = [1, 2, 3, 4];

    // For each team, select 2 rivals from each of the 4 pots (total 8 matches)
    qualifiers.forEach((team) => {
      potList.forEach((potNum, potIdx) => {
        const candidatePotTeams = (potsMap.get(potNum) || []).filter(
          (c) => c.teamId !== team.teamId &&
                 (c.countryCode === 'INT' || c.countryCode === 'OTHERS' || c.countryCode !== team.countryCode)
        );
        const fallbackPotTeams = (potsMap.get(potNum) || []).filter((c) => c.teamId !== team.teamId);
        const available = candidatePotTeams.length >= 2 ? candidatePotTeams : fallbackPotTeams;

        // Pick 2 opponents from this pot
        const existingAgainstPot = teamRivals[team.teamId].filter((r) => r.rivalPot === potNum);
        while (existingAgainstPot.length < 2) {
          // Prefer opponents who have < 8 matches and not yet paired
          const candidate = available.find(
            (opp) => !scheduledPairs.has(getPairKey(team.teamId, opp.teamId)) &&
                     teamRivals[opp.teamId].length < 8 &&
                     teamRivals[opp.teamId].filter((r) => r.rivalPot === team.seedingPot).length < 2
          ) || available.find(
            (opp) => !scheduledPairs.has(getPairKey(team.teamId, opp.teamId)) && teamRivals[opp.teamId].length < 8
          ) || available[Math.floor(Math.random() * available.length)];

          if (!candidate) break;

          const pairKey = getPairKey(team.teamId, candidate.teamId);
          scheduledPairs.add(pairKey);

          // Alternating home/away
          const isHomeForTeam = (existingAgainstPot.length % 2 === 0);
          const mdIndex = (potIdx * 2) + existingAgainstPot.length + 1;
          const fixId = `fix_${competitionId}_${seasonYear}_md${mdIndex}_${isHomeForTeam ? team.teamId : candidate.teamId}_vs_${isHomeForTeam ? candidate.teamId : team.teamId}`;

          teamRivals[team.teamId].push({
            rivalTeamId: candidate.teamId,
            rivalTeamName: candidate.teamName,
            countryCode: candidate.countryCode,
            rivalOvr: candidate.teamOvr,
            venue: isHomeForTeam ? 'HOME' : 'AWAY',
            rivalPot: potNum,
            matchdayIndex: mdIndex,
            fixtureId: fixId,
          });

          teamRivals[candidate.teamId].push({
            rivalTeamId: team.teamId,
            rivalTeamName: team.teamName,
            countryCode: team.countryCode,
            rivalOvr: team.teamOvr,
            venue: isHomeForTeam ? 'AWAY' : 'HOME',
            rivalPot: team.seedingPot || 1,
            matchdayIndex: mdIndex,
            fixtureId: fixId,
          });

          const homeObj = isHomeForTeam
            ? { id: team.teamId, name: team.teamName, ovr: team.teamOvr, isPlayer: team.teamId === playerClubId }
            : { id: candidate.teamId, name: candidate.teamName, ovr: candidate.teamOvr, isPlayer: candidate.teamId === playerClubId };
          const awayObj = isHomeForTeam
            ? { id: candidate.teamId, name: candidate.teamName, ovr: candidate.teamOvr, isPlayer: candidate.teamId === playerClubId }
            : { id: team.teamId, name: team.teamName, ovr: team.teamOvr, isPlayer: team.teamId === playerClubId };

          allFixtures.push(createFixture(competitionId, seasonYear, 'league_phase', `Matchday ${mdIndex}`, mdIndex, homeObj, awayObj));
          existingAgainstPot.push(teamRivals[team.teamId][teamRivals[team.teamId].length - 1]);
        }
      });
    });
  } else {
    // ECL: 6 pots of 6 teams, 6 matches (1 from each pot: 3H, 3A)
    const potList = [1, 2, 3, 4, 5, 6];
    qualifiers.forEach((team) => {
      potList.forEach((potNum, pIdx) => {
        if (teamRivals[team.teamId].some((r) => r.rivalPot === potNum)) return;

        const candidates = (potsMap.get(potNum) || []).filter((c) => c.teamId !== team.teamId);
        const candidate = candidates.find(
          (opp) => !scheduledPairs.has(getPairKey(team.teamId, opp.teamId)) && teamRivals[opp.teamId].length < 6
        ) || candidates[0];

        if (!candidate) return;

        const pairKey = getPairKey(team.teamId, candidate.teamId);
        scheduledPairs.add(pairKey);

        const isHome = pIdx % 2 === 0;
        const mdIndex = pIdx + 1;
        const fixId = `fix_${competitionId}_${seasonYear}_md${mdIndex}_${isHome ? team.teamId : candidate.teamId}_vs_${isHome ? candidate.teamId : team.teamId}`;

        teamRivals[team.teamId].push({
          rivalTeamId: candidate.teamId,
          rivalTeamName: candidate.teamName,
          countryCode: candidate.countryCode,
          rivalOvr: candidate.teamOvr,
          venue: isHome ? 'HOME' : 'AWAY',
          rivalPot: potNum,
          matchdayIndex: mdIndex,
          fixtureId: fixId,
        });

        teamRivals[candidate.teamId].push({
          rivalTeamId: team.teamId,
          rivalTeamName: team.teamName,
          countryCode: team.countryCode,
          rivalOvr: team.teamOvr,
          venue: isHome ? 'AWAY' : 'HOME',
          rivalPot: team.seedingPot || 1,
          matchdayIndex: mdIndex,
          fixtureId: fixId,
        });

        const homeObj = isHome
          ? { id: team.teamId, name: team.teamName, ovr: team.teamOvr, isPlayer: team.teamId === playerClubId }
          : { id: candidate.teamId, name: candidate.teamName, ovr: candidate.teamOvr, isPlayer: candidate.teamId === playerClubId };
        const awayObj = isHome
          ? { id: candidate.teamId, name: candidate.teamName, ovr: candidate.teamOvr, isPlayer: candidate.teamId === playerClubId }
          : { id: team.teamId, name: team.teamName, ovr: team.teamOvr, isPlayer: team.teamId === playerClubId };

        allFixtures.push(createFixture(competitionId, seasonYear, 'league_phase', `Matchday ${mdIndex}`, mdIndex, homeObj, awayObj));
      });
    });
  }

  // Deduplicate fixtures by ID
  const uniqueFixturesMap = new Map<string, ContinentalMatchResult>();
  allFixtures.forEach((fix) => uniqueFixturesMap.set(fix.id, fix));
  const uniqueFixtures = Array.from(uniqueFixturesMap.values());

  // Initialize unified 36-team standings
  const standings: ContinentalGroupStanding[] = qualifiers.map((q, idx) => ({
    rank: idx + 1,
    teamId: q.teamId,
    teamName: q.teamName,
    countryCode: q.countryCode,
    isPlayerTeam: q.teamId === playerClubId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    teamOvr: q.teamOvr,
  }));

  return {
    fixtures: uniqueFixtures,
    standings,
    teamRivals,
    numMatchdays,
  };
}

/**
 * Builds the initial tournament draw for a season.
 * Enforces authentic Pot distribution and country protection.
 * Saves immediately to ensure it is never regenerated.
 */
export function generateContinentalTournamentDraw(
  competitionId: ContinentalCompetitionId,
  seasonYear: number,
  qualifiers: ContinentalQualificationEntry[],
  playerClubId?: string
): ContinentalTournamentSeasonState {
  const meta = CONTINENTAL_COMPETITIONS_CATALOG[competitionId];
  const is36LeaguePhase = meta?.format === '36_league_phase_knockout';

  // Pick neutral final venue
  const venuePool = CONTINENTAL_FINAL_VENUE_POOLS[competitionId] || [
    { city: 'London', country: 'England', stadium: 'Wembley Stadium', capacity: 90000 },
  ];
  const finalVenue = venuePool[Math.abs(seasonYear) % venuePool.length];

  const participatingIds = qualifiers.map((q) => q.teamId);
  const isPlayerParticipant = !!playerClubId && participatingIds.includes(playerClubId);

  // Group letters for 32-team tournaments
  const groupLetters: ('A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H')[] = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  ];

  // Segregate pots
  const pot1 = qualifiers.filter((q) => q.seedingPot === 1);
  const pot2 = qualifiers.filter((q) => q.seedingPot === 2);
  const pot3 = qualifiers.filter((q) => q.seedingPot === 3);
  const pot4 = qualifiers.filter((q) => q.seedingPot === 4);
  const pot5 = qualifiers.filter((q) => q.seedingPot === 5);
  const pot6 = qualifiers.filter((q) => q.seedingPot === 6);

  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
  const sPot1 = shuffle(pot1);
  const sPot2 = shuffle(pot2);
  const sPot3 = shuffle(pot3);
  const sPot4 = shuffle(pot4);

  let state: ContinentalTournamentSeasonState;

  if (is36LeaguePhase) {
    const { fixtures, standings, teamRivals, numMatchdays } = build36TeamLeaguePhaseData(
      competitionId,
      seasonYear,
      qualifiers,
      playerClubId
    );

    state = {
      competitionId,
      seasonYear,
      isPlayable: true,
      drawGeneratedTimestamp: Date.now(),
      isDrawCompleted: true,
      isLeaguePhaseFormat: true,
      participatingTeamIds: participatingIds,
      qualifiers,
      pots: {
        pot1: sPot1,
        pot2: sPot2,
        pot3: sPot3,
        pot4: sPot4,
        pot5: pot5.length > 0 ? shuffle(pot5) : undefined,
        pot6: pot6.length > 0 ? shuffle(pot6) : undefined,
      },
      groups: [],
      leaguePhaseStandings: standings,
      leaguePhaseFixtures: fixtures,
      teamRivals,
      leaguePhaseCurrentMatchday: 1,
      leaguePhaseTotalMatchdays: numMatchdays,
      finalVenue,
      legendaryTitle: meta?.name || 'UEFA Champions League',
      currentStage: 'league_phase',
      isPlayerClubParticipant: isPlayerParticipant,
      playerClubStageReached: isPlayerParticipant ? 'League Phase' : undefined,
    };
  } else {
    // Traditional 32-team 8 groups
    const groupBuckets: {
      letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
      teams: { id: string; name: string; ovr: number; isPlayer: boolean; countryCode?: string; seedingPot?: number }[];
    }[] = groupLetters.map((l) => ({ letter: l, teams: [] }));

    const placePotTeams = (potTeams: ContinentalQualificationEntry[], potNum: number) => {
      potTeams.forEach((team) => {
        const isPlayer = team.teamId === playerClubId;
        const teamObj = {
          id: team.teamId,
          name: team.teamName,
          ovr: team.teamOvr || 78,
          isPlayer,
          countryCode: team.countryCode,
          seedingPot: potNum,
        };

        let targetBucket = groupBuckets.find(
          (b) =>
            b.teams.length < potNum &&
            (team.countryCode === 'INT' ||
              team.countryCode === 'OTHERS' ||
              !b.teams.some((existing) => existing.countryCode === team.countryCode))
        );

        if (!targetBucket) {
          targetBucket = groupBuckets.find((b) => b.teams.length < potNum);
        }

        if (targetBucket) {
          targetBucket.teams.push(teamObj);
        }
      });
    };

    placePotTeams(sPot1, 1);
    placePotTeams(sPot2, 2);
    placePotTeams(sPot3, 3);
    placePotTeams(sPot4, 4);

    const groups: ContinentalGroup[] = groupBuckets.map((bucket) => {
      while (bucket.teams.length < 4) {
        bucket.teams.push({
          id: `club_wildcard_${bucket.letter}_${bucket.teams.length + 1}`,
          name: `Continental FC ${bucket.letter}${bucket.teams.length + 1}`,
          ovr: 74,
          isPlayer: false,
          countryCode: 'INT',
          seedingPot: bucket.teams.length + 1,
        });
      }

      const standings: ContinentalGroupStanding[] = bucket.teams.map((t) => ({
        teamId: t.id,
        teamName: t.name,
        countryCode: t.countryCode,
        isPlayerTeam: t.isPlayer,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        teamOvr: t.ovr,
      }));

      const fixtures = generateGroupFixtures(
        `group_${bucket.letter}`,
        competitionId,
        seasonYear,
        bucket.teams
      );

      return {
        id: `group_${bucket.letter}`,
        groupLetter: bucket.letter,
        teams: bucket.teams,
        standings,
        fixtures,
        isCompleted: false,
      };
    });

    state = {
      competitionId,
      seasonYear,
      isPlayable: true,
      drawGeneratedTimestamp: Date.now(),
      isDrawCompleted: true,
      participatingTeamIds: participatingIds,
      qualifiers,
      pots: {
        pot1: sPot1,
        pot2: sPot2,
        pot3: sPot3,
        pot4: sPot4,
      },
      groups,
      finalVenue,
      legendaryTitle: meta?.name || 'Continental Championship',
      currentStage: 'group_stage',
      isPlayerClubParticipant: isPlayerParticipant,
      playerClubStageReached: isPlayerParticipant ? 'Group Stage' : undefined,
    };
  }

  saveContinentalTournamentState(state);
  return state;
}

/**
 * Simulates a single match result using the database simulation engine with knockout variance.
 */
export function simulateSingleContinentalMatch(
  fixture: ContinentalMatchResult,
  homeOvr: number,
  awayOvr: number,
  userPlayer?: PlayerCardData,
  isKnockout: boolean = false,
  isFinal: boolean = false
): ContinentalMatchResult {
  if (fixture.isCompleted) return fixture;

  const homeEditorTeam: EditorTeamData = {
    id: fixture.homeTeamId,
    name: fixture.homeTeamName,
    countryCode: 'INT',
    leagueId: fixture.competitionId,
    overallRating: homeOvr || 75,
    isUserClub: fixture.isPlayerMatch && userPlayer?.clubId === fixture.homeTeamId,
  };

  const awayEditorTeam: EditorTeamData = {
    id: fixture.awayTeamId,
    name: fixture.awayTeamName,
    countryCode: 'INT',
    leagueId: fixture.competitionId,
    overallRating: awayOvr || 75,
    isUserClub: fixture.isPlayerMatch && userPlayer?.clubId === fixture.awayTeamId,
  };

  const result = simulateDatabaseMatch(homeEditorTeam, awayEditorTeam, {
    competitionId: fixture.competitionId,
    competitionName: fixture.stageName,
    stageName: fixture.stageName,
    matchdayIndex: fixture.matchdayIndex,
    isKnockout: isKnockout || fixture.stageName.toLowerCase().includes('leg') || fixture.stageName.toLowerCase().includes('final'),
    allowPenalties: isFinal,
    userPlayer,
  });

  let playerMinutes: number | undefined;
  let playerGoals: number | undefined;
  let playerAssists: number | undefined;
  let playerRating: number | undefined;
  let playerIsMvp: boolean | undefined;
  let playerYellow: boolean | undefined;
  let playerRed: boolean | undefined;

  if (fixture.isPlayerMatch && userPlayer) {
    const store = (userPlayer as any).disciplinaryStore || {};
    const { key, state: discState, rules } = getOrCreateDisciplinaryRecord(
      store,
      fixture.stageName,
      'continental',
      fixture.competitionId
    );

    // Check if yellows clear at this stage
    const { updatedState: clearedState } = checkAndApplyStageYellowClear(discState, fixture.stageName, rules);
    let activeDiscState = clearedState;

    const { isSuspended, reason: suspensionReason } = checkIsSuspendedForMatch(activeDiscState);

    if (isSuspended) {
      // Player is suspended for this continental match!
      playerMinutes = 0;
      playerGoals = 0;
      playerAssists = 0;
      playerRating = undefined;
      playerIsMvp = false;
      playerYellow = false;
      playerRed = false;

      // Serve suspension for this competition match
      activeDiscState = serveSuspensionForMatch(activeDiscState);
      store[key] = activeDiscState;
      (userPlayer as any).disciplinaryStore = store;
    } else {
      playerMinutes = 90;
      const isHome = fixture.homeTeamId === userPlayer.clubId;
      const pOvr = userPlayer.ovr || 75;
      const oppOvr = isHome ? awayOvr : homeOvr;

      const baseRating = 6.4 + (pOvr - oppOvr) * 0.04 + (Math.random() - 0.5) * 1.8;
      playerRating = parseFloat(Math.min(10, Math.max(5.0, baseRating)).toFixed(1));

      const factor = pOvr / Math.max(50, oppOvr);
      const teamGoals = isHome ? result.homeScore : result.awayScore;
      const sim = simulatePlayerGoalsAndAssists(userPlayer, factor, teamGoals);
      playerGoals = Math.min(teamGoals, sim.playerGoals);
      playerAssists = Math.min(teamGoals, sim.playerAssists);

      if ((playerGoals || 0) >= 2 || (playerRating || 0) >= 8.5) {
        playerIsMvp = true;
      }

      // Check cards in continental match with bad fame red card modifier
      const redMultiplier = getBadRepRedCardChanceMultiplier(userPlayer.badReputationTier || 0);
      playerYellow = Math.random() < 0.12;
      playerRed = !playerYellow && Math.random() < (0.015 * redMultiplier);

      // Straight red card gives +10 bad fame (bad reputation)
      if (playerRed) {
        const repRes = addBadReputation(userPlayer, 10);
        userPlayer.badReputation = repRes.updatedPlayer.badReputation;
        userPlayer.badReputationTier = repRes.updatedPlayer.badReputationTier;
      }

      // Champions / Continental Rule: 2 Yellows = 1-match suspension; Red = 1-match suspension
      const discOutcome = recordMatchDisciplinaryEvents(activeDiscState, rules, playerYellow, playerRed);
      store[key] = discOutcome.updatedState;
      (userPlayer as any).disciplinaryStore = store;
    }
  }

  return {
    ...fixture,
    homeScore: result.homeScore,
    awayScore: result.awayScore,
    isCompleted: true,
    playerMinutes,
    playerGoals,
    playerAssists,
    playerRating,
    playerIsMvp,
    playerYellow,
    playerRed,
  };
}

/**
 * Simulates a specific matchday (1 to 8 for UCL/UEL, 1 to 6 for ECL) in the 36-team Swiss League Phase.
 */
export function simulateContinentalLeaguePhaseMatchday(
  tournamentState: ContinentalTournamentSeasonState,
  matchdayIndex: number,
  userPlayer?: PlayerCardData
): ContinentalTournamentSeasonState {
  if (!tournamentState.leaguePhaseFixtures || !tournamentState.leaguePhaseStandings) {
    return tournamentState;
  }

  const teamOvrMap = new Map<string, number>();
  tournamentState.qualifiers.forEach((q) => teamOvrMap.set(q.teamId, q.teamOvr));

  const updatedFixtures = tournamentState.leaguePhaseFixtures.map((fix) => {
    if (fix.matchdayIndex === matchdayIndex && !fix.isCompleted) {
      const homeOvr = teamOvrMap.get(fix.homeTeamId) || 76;
      const awayOvr = teamOvrMap.get(fix.awayTeamId) || 76;
      return simulateSingleContinentalMatch(fix, homeOvr, awayOvr, userPlayer, false, false);
    }
    return fix;
  });

  // Recompute unified 36-team standings
  const standingsMap = new Map<string, ContinentalGroupStanding>();
  tournamentState.qualifiers.forEach((q) => {
    standingsMap.set(q.teamId, {
      rank: 0,
      teamId: q.teamId,
      teamName: q.teamName,
      countryCode: q.countryCode,
      isPlayerTeam: q.teamId === userPlayer?.clubId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      teamOvr: q.teamOvr,
    });
  });

  updatedFixtures.forEach((fix) => {
    if (fix.isCompleted) {
      const home = standingsMap.get(fix.homeTeamId);
      const away = standingsMap.get(fix.awayTeamId);
      if (home && away) {
        home.played += 1;
        away.played += 1;
        home.goalsFor += fix.homeScore;
        home.goalsAgainst += fix.awayScore;
        away.goalsFor += fix.awayScore;
        away.goalsAgainst += fix.homeScore;

        if (fix.homeScore > fix.awayScore) {
          home.won += 1;
          home.points += 3;
          away.lost += 1;
        } else if (fix.homeScore < fix.awayScore) {
          away.won += 1;
          away.points += 3;
          home.lost += 1;
        } else {
          home.drawn += 1;
          away.drawn += 1;
          home.points += 1;
          away.points += 1;
        }
      }
    }
  });

  const updatedStandings = Array.from(standingsMap.values()).map((s) => ({
    ...s,
    goalDifference: s.goalsFor - s.goalsAgainst,
  }));

  // Sort standings: Points > GD > GF > OVR > Name
  updatedStandings.sort((a, b) =>
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    (b.teamOvr || 70) - (a.teamOvr || 70) ||
    a.teamName.localeCompare(b.teamName)
  );

  // Assign ranks 1 to 36
  updatedStandings.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  const totalMatchdays = tournamentState.leaguePhaseTotalMatchdays || 8;
  const allLeaguePhaseCompleted = updatedFixtures.every((f) => f.isCompleted);

  let nextStage = tournamentState.currentStage;
  let playoffTies = tournamentState.knockoutPlayoffTies;
  let nextMatchday = Math.min(totalMatchdays, matchdayIndex + 1);

  if (allLeaguePhaseCompleted) {
    // 1st to 8th directly qualify to Round of 16
    for (let i = 0; i < 8; i++) {
      if (updatedStandings[i]) updatedStandings[i].qualifiedKnockout = true;
    }
    // 9th to 24th qualify for Knockout Play-offs (Elimination Round)
    for (let i = 8; i < 24; i++) {
      if (updatedStandings[i]) updatedStandings[i].qualifiedPlayoffs = true;
    }
    // 25th to 36th eliminated
    for (let i = 24; i < updatedStandings.length; i++) {
      if (updatedStandings[i]) updatedStandings[i].eliminated = true;
    }

    if (!playoffTies) {
      nextStage = 'knockout_playoffs';
      playoffTies = generateKnockoutPlayoffsDraw(
        updatedStandings,
        tournamentState.competitionId,
        tournamentState.seasonYear,
        userPlayer?.clubId
      );
    }
  }

  const updatedState: ContinentalTournamentSeasonState = {
    ...tournamentState,
    leaguePhaseFixtures: updatedFixtures,
    leaguePhaseStandings: updatedStandings,
    leaguePhaseCurrentMatchday: nextMatchday,
    currentStage: nextStage,
    knockoutPlayoffTies: playoffTies,
  };

  saveContinentalTournamentState(updatedState);
  return updatedState;
}

/**
 * Generates official Knockout Play-offs Draw (9th-16th seeded vs 17th-24th unseeded).
 * Seeded teams host the 2nd leg.
 */
export function generateKnockoutPlayoffsDraw(
  standings: ContinentalGroupStanding[],
  competitionId: ContinentalCompetitionId,
  seasonYear: number,
  playerClubId?: string
): ContinentalKnockoutTie[] {
  const seeded = standings.slice(8, 16).map((s) => ({
    id: s.teamId,
    name: s.teamName,
    ovr: s.teamOvr || 78,
    isPlayer: s.teamId === playerClubId,
    countryCode: s.countryCode,
  }));

  const unseeded = standings.slice(16, 24).map((s) => ({
    id: s.teamId,
    name: s.teamName,
    ovr: s.teamOvr || 75,
    isPlayer: s.teamId === playerClubId,
    countryCode: s.countryCode,
  }));

  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
  const shuffledSeeded = shuffle(seeded);
  const shuffledUnseeded = shuffle(unseeded);

  const ties: ContinentalKnockoutTie[] = [];

  for (let i = 0; i < 8; i++) {
    const sTeam = shuffledSeeded[i] || { id: `playoff_seed_${i}`, name: `Seeded ${i + 9}`, ovr: 78, isPlayer: false };
    const uTeam = shuffledUnseeded[i] || { id: `playoff_unseed_${i}`, name: `Unseeded ${i + 17}`, ovr: 75, isPlayer: false };
    const isKeyMatch = sTeam.isPlayer || uTeam.isPlayer;

    ties.push({
      id: `playoff_tie_${competitionId}_${seasonYear}_${i + 1}`,
      stage: 'knockout_playoffs',
      stageName: 'Knockout Phase Play-offs',
      teamA: uTeam, // Unseeded hosts 1st leg
      teamB: sTeam, // Seeded (9th-16th) hosts 2nd leg
      leg1: {
        id: `playoff_${competitionId}_${seasonYear}_${i + 1}_leg1`,
        competitionId,
        seasonYear,
        stage: 'knockout_playoffs',
        stageName: 'Play-offs (1st Leg)',
        dateStr: `11 February ${seasonYear + 1}`,
        homeTeamId: uTeam.id,
        homeTeamName: uTeam.name,
        awayTeamId: sTeam.id,
        awayTeamName: sTeam.name,
        homeScore: 0,
        awayScore: 0,
        isPlayerMatch: isKeyMatch,
        isCompleted: false,
        isKeyMatch,
      },
      leg2: {
        id: `playoff_${competitionId}_${seasonYear}_${i + 1}_leg2`,
        competitionId,
        seasonYear,
        stage: 'knockout_playoffs',
        stageName: 'Play-offs (2nd Leg)',
        dateStr: `18 February ${seasonYear + 1}`,
        homeTeamId: sTeam.id,
        homeTeamName: sTeam.name,
        awayTeamId: uTeam.id,
        awayTeamName: uTeam.name,
        homeScore: 0,
        awayScore: 0,
        isPlayerMatch: isKeyMatch,
        isCompleted: false,
        isKeyMatch,
      },
    });
  }

  return ties;
}

/**
 * Simulates a specific matchday (1 to 6) in the traditional group stage.
 */
export function simulateContinentalGroupMatchday(
  tournamentState: ContinentalTournamentSeasonState,
  matchdayIndex: number,
  userPlayer?: PlayerCardData
): ContinentalTournamentSeasonState {
  if (tournamentState.isLeaguePhaseFormat) {
    return simulateContinentalLeaguePhaseMatchday(tournamentState, matchdayIndex, userPlayer);
  }

  const updatedGroups: ContinentalGroup[] = tournamentState.groups.map((group) => {
    const updatedFixtures = group.fixtures.map((fix) => {
      if (fix.matchdayIndex === matchdayIndex && !fix.isCompleted) {
        const homeTeam = group.teams.find((t) => t.id === fix.homeTeamId) || { ovr: 75 };
        const awayTeam = group.teams.find((t) => t.id === fix.awayTeamId) || { ovr: 75 };
        return simulateSingleContinentalMatch(fix, homeTeam.ovr, awayTeam.ovr, userPlayer);
      }
      return fix;
    });

    // Recompute standings
    const standingsMap = new Map<string, ContinentalGroupStanding>();
    group.teams.forEach((t) => {
      standingsMap.set(t.id, {
        teamId: t.id,
        teamName: t.name,
        countryCode: t.countryCode,
        isPlayerTeam: t.isPlayer,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        teamOvr: t.ovr,
      });
    });

    updatedFixtures.forEach((fix) => {
      if (fix.isCompleted) {
        const home = standingsMap.get(fix.homeTeamId);
        const away = standingsMap.get(fix.awayTeamId);
        if (home && away) {
          home.played += 1;
          away.played += 1;
          home.goalsFor += fix.homeScore;
          home.goalsAgainst += fix.awayScore;
          away.goalsFor += fix.awayScore;
          away.goalsAgainst += fix.homeScore;

          if (fix.homeScore > fix.awayScore) {
            home.won += 1;
            home.points += 3;
            away.lost += 1;
          } else if (fix.homeScore < fix.awayScore) {
            away.won += 1;
            away.points += 3;
            home.lost += 1;
          } else {
            home.drawn += 1;
            away.drawn += 1;
            home.points += 1;
            away.points += 1;
          }
        }
      }
    });

    const newStandings = Array.from(standingsMap.values()).map((s) => ({
      ...s,
      goalDifference: s.goalsFor - s.goalsAgainst,
    }));

    // Sort: Points > GD > GF
    newStandings.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);

    // If MD6, mark top 2
    const allDone = updatedFixtures.every((f) => f.isCompleted);
    if (allDone) {
      if (newStandings[0]) newStandings[0].qualifiedKnockout = true;
      if (newStandings[1]) newStandings[1].qualifiedKnockout = true;
    }

    return {
      ...group,
      fixtures: updatedFixtures,
      standings: newStandings,
      isCompleted: allDone,
    };
  });

  let nextStage = tournamentState.currentStage;
  let r16Ties = tournamentState.r16Ties;

  const allGroupsDone = updatedGroups.every((g) => g.isCompleted);
  if (allGroupsDone && !r16Ties) {
    nextStage = 'round_of_16';
    r16Ties = generateRoundOf16Draw(updatedGroups, tournamentState.competitionId, tournamentState.seasonYear, userPlayer?.clubId);
  }

  const updatedState: ContinentalTournamentSeasonState = {
    ...tournamentState,
    groups: updatedGroups,
    currentStage: nextStage,
    r16Ties,
  };

  saveContinentalTournamentState(updatedState);
  return updatedState;
}

/**
 * Pairs 8 Group Winners vs 8 Runners-up for Round of 16 (Home & Away) with dynamic draw and group protection.
 */
export function generateRoundOf16Draw(
  groups: ContinentalGroup[],
  competitionId: ContinentalCompetitionId,
  seasonYear: number,
  playerClubId?: string
): ContinentalKnockoutTie[] {
  const winners: { id: string; name: string; ovr: number; isPlayer: boolean; groupId: string; countryCode?: string }[] = [];
  const runnersUp: { id: string; name: string; ovr: number; isPlayer: boolean; groupId: string; countryCode?: string }[] = [];

  groups.forEach((g) => {
    const s1 = g.standings[0];
    const s2 = g.standings[1];
    if (s1) winners.push({ id: s1.teamId, name: s1.teamName, ovr: s1.teamOvr, isPlayer: s1.isPlayerTeam, groupId: g.id, countryCode: s1.countryCode });
    if (s2) runnersUp.push({ id: s2.teamId, name: s2.teamName, ovr: s2.teamOvr, isPlayer: s2.isPlayerTeam, groupId: g.id, countryCode: s2.countryCode });
  });

  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
  const shuffledWinners = shuffle(winners);
  const shuffledRunners = shuffle(runnersUp);

  const ties: ContinentalKnockoutTie[] = [];
  const usedRunners = new Set<string>();

  for (let i = 0; i < 8; i++) {
    const w = shuffledWinners[i] || { id: `w_${i}`, name: `Winner ${i + 1}`, ovr: 80, isPlayer: false, groupId: `g_${i}`, countryCode: 'INT' };
    let r = shuffledRunners.find((candidate) => !usedRunners.has(candidate.id) && candidate.groupId !== w.groupId);
    if (!r) {
      r = shuffledRunners.find((candidate) => !usedRunners.has(candidate.id)) || shuffledRunners[i] || { id: `r_${i}`, name: `Runner ${i + 1}`, ovr: 77, isPlayer: false, groupId: `g_r_${i}`, countryCode: 'INT' };
    }
    usedRunners.add(r.id);

    const isKeyMatch = w.isPlayer || r.isPlayer;

    ties.push({
      id: `r16_tie_${competitionId}_${seasonYear}_${i + 1}`,
      stage: 'round_of_16',
      stageName: 'Round of 16',
      teamA: r, // Runner-up hosts 1st leg
      teamB: w, // Group winner hosts 2nd leg
      leg1: {
        id: `r16_${competitionId}_${seasonYear}_${i + 1}_leg1`,
        competitionId,
        seasonYear,
        stage: 'round_of_16',
        stageName: 'Round of 16 (1st Leg)',
        dateStr: `24 February ${seasonYear + 1}`,
        homeTeamId: r.id,
        homeTeamName: r.name,
        awayTeamId: w.id,
        awayTeamName: w.name,
        homeScore: 0,
        awayScore: 0,
        isPlayerMatch: isKeyMatch,
        isCompleted: false,
        isKeyMatch,
      },
      leg2: {
        id: `r16_${competitionId}_${seasonYear}_${i + 1}_leg2`,
        competitionId,
        seasonYear,
        stage: 'round_of_16',
        stageName: 'Round of 16 (2nd Leg)',
        dateStr: `17 March ${seasonYear + 1}`,
        homeTeamId: w.id,
        homeTeamName: w.name,
        awayTeamId: r.id,
        awayTeamName: r.name,
        homeScore: 0,
        awayScore: 0,
        isPlayerMatch: isKeyMatch,
        isCompleted: false,
        isKeyMatch,
      },
    });
  }

  return ties;
}

/**
 * Simulates a knockout stage tie (Round of 16, QF, SF, or Final).
 */
export function simulateKnockoutTie(
  tie: ContinentalKnockoutTie,
  competitionId: ContinentalCompetitionId,
  userPlayer?: PlayerCardData
): ContinentalKnockoutTie {
  const isFinal = tie.stage === 'final' || tie.stage === 'supercup';

  // Leg 1
  let leg1 = tie.leg1;
  if (leg1 && !leg1.isCompleted) {
    leg1 = simulateSingleContinentalMatch(leg1, tie.teamA.ovr, tie.teamB.ovr, userPlayer, true, isFinal);
  }

  // Leg 2 (for two-legged ties)
  let leg2 = tie.leg2;
  if (!isFinal && leg2 && !leg2.isCompleted) {
    leg2 = simulateSingleContinentalMatch(leg2, tie.teamB.ovr, tie.teamA.ovr, userPlayer, true, false);
  }

  // Calculate winner
  let winnerId = '';
  let winnerName = '';

  if (isFinal && leg1) {
    const hScore = leg1.homeScore;
    const aScore = leg1.awayScore;
    if (hScore === aScore) {
      const impactA = getClubPowerscaleImpact(tie.teamA.id, tie.teamA.name, competitionId);
      const impactB = getClubPowerscaleImpact(tie.teamB.id, tie.teamB.name, competitionId);
      const teamAProb = Math.max(0.20, Math.min(0.80, 0.50 + (tie.teamA.ovr - tie.teamB.ovr) * 0.02 + (impactA.effectiveModifier - impactB.effectiveModifier) * 0.35 + (Math.random() - 0.5) * 0.25));
      if (Math.random() < teamAProb) {
        leg1.homePenalties = 4 + Math.floor(Math.random() * 2);
        leg1.awayPenalties = (leg1.homePenalties || 4) - 1;
        winnerId = tie.teamA.id;
        winnerName = tie.teamA.name;
      } else {
        leg1.awayPenalties = 4 + Math.floor(Math.random() * 2);
        leg1.homePenalties = (leg1.awayPenalties || 4) - 1;
        winnerId = tie.teamB.id;
        winnerName = tie.teamB.name;
      }
    } else if (hScore > aScore) {
      winnerId = tie.teamA.id;
      winnerName = tie.teamA.name;
    } else {
      winnerId = tie.teamB.id;
      winnerName = tie.teamB.name;
    }
  } else if (leg1 && leg2) {
    const aggA = leg1.homeScore + leg2.awayScore;
    const aggB = leg1.awayScore + leg2.homeScore;

    if (aggA > aggB) {
      winnerId = tie.teamA.id;
      winnerName = tie.teamA.name;
    } else if (aggB > aggA) {
      winnerId = tie.teamB.id;
      winnerName = tie.teamB.name;
    } else {
      const impactA = getClubPowerscaleImpact(tie.teamA.id, tie.teamA.name, competitionId);
      const impactB = getClubPowerscaleImpact(tie.teamB.id, tie.teamB.name, competitionId);
      const teamAProb = Math.max(0.20, Math.min(0.80, 0.50 + (tie.teamA.ovr - tie.teamB.ovr) * 0.02 + (impactA.effectiveModifier - impactB.effectiveModifier) * 0.35 + (Math.random() - 0.5) * 0.25));
      if (Math.random() < teamAProb) {
        leg2.homePenalties = 3;
        leg2.awayPenalties = 4;
        winnerId = tie.teamA.id;
        winnerName = tie.teamA.name;
      } else {
        leg2.homePenalties = 4;
        leg2.awayPenalties = 3;
        winnerId = tie.teamB.id;
        winnerName = tie.teamB.name;
      }
    }
  }

  return {
    ...tie,
    leg1,
    leg2,
    aggregateHomeScore: leg1 ? leg1.homeScore + (leg2?.awayScore || 0) : undefined,
    aggregateAwayScore: leg1 ? leg1.awayScore + (leg2?.homeScore || 0) : undefined,
    winnerTeamId: winnerId,
    winnerTeamName: winnerName,
  };
}

/**
 * Advances knockout rounds sequentially (R16 -> QF -> SF -> Final -> Champion)
 * with open unseeded randomized draws at each stage.
 */
export function advanceContinentalKnockoutStage(
  state: ContinentalTournamentSeasonState,
  userPlayer?: PlayerCardData
): ContinentalTournamentSeasonState {
  let updated = { ...state };
  const seasonYear = updated.seasonYear || 2026;
  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  if (updated.currentStage === 'knockout_playoffs' && updated.knockoutPlayoffTies) {
    const simPlayoffs = updated.knockoutPlayoffTies.map((t) => simulateKnockoutTie(t, updated.competitionId, userPlayer));
    const playoffWinners = simPlayoffs.map((t) => (t.winnerTeamId === t.teamA.id ? t.teamA : t.teamB));

    // Top 8 teams from leaguePhaseStandings directly qualified as seeded teams
    const top8Seeded = (updated.leaguePhaseStandings || []).slice(0, 8).map((s) => ({
      id: s.teamId,
      name: s.teamName,
      ovr: s.teamOvr || 80,
      isPlayer: s.teamId === userPlayer?.clubId,
      countryCode: s.countryCode,
    }));

    const shuffledPlayoffWinners = shuffle(playoffWinners);
    const shuffledTop8 = shuffle(top8Seeded);

    const r16Ties: ContinentalKnockoutTie[] = [];
    for (let i = 0; i < 8; i++) {
      const seededTeam = shuffledTop8[i] || { id: `top8_seed_${i}`, name: `Top Seed ${i + 1}`, ovr: 82, isPlayer: false };
      const unseededTeam = shuffledPlayoffWinners[i] || { id: `playoff_win_${i}`, name: `Playoff Winner ${i + 1}`, ovr: 78, isPlayer: false };
      const isKeyMatch = seededTeam.isPlayer || unseededTeam.isPlayer;

      r16Ties.push({
        id: `r16_tie_${updated.competitionId}_${seasonYear}_${i + 1}`,
        stage: 'round_of_16',
        stageName: 'Round of 16',
        teamA: unseededTeam, // Playoff winner hosts 1st leg
        teamB: seededTeam,   // Top 8 seed hosts 2nd leg
        leg1: {
          id: `r16_${updated.competitionId}_${seasonYear}_${i + 1}_leg1`,
          competitionId: updated.competitionId,
          seasonYear,
          stage: 'round_of_16',
          stageName: 'Round of 16 (1st Leg)',
          dateStr: `4 March ${seasonYear + 1}`,
          homeTeamId: unseededTeam.id,
          homeTeamName: unseededTeam.name,
          awayTeamId: seededTeam.id,
          awayTeamName: seededTeam.name,
          homeScore: 0,
          awayScore: 0,
          isPlayerMatch: isKeyMatch,
          isCompleted: false,
          isKeyMatch,
        },
        leg2: {
          id: `r16_${updated.competitionId}_${seasonYear}_${i + 1}_leg2`,
          competitionId: updated.competitionId,
          seasonYear,
          stage: 'round_of_16',
          stageName: 'Round of 16 (2nd Leg)',
          dateStr: `11 March ${seasonYear + 1}`,
          homeTeamId: seededTeam.id,
          homeTeamName: seededTeam.name,
          awayTeamId: unseededTeam.id,
          awayTeamName: unseededTeam.name,
          homeScore: 0,
          awayScore: 0,
          isPlayerMatch: isKeyMatch,
          isCompleted: false,
          isKeyMatch,
        },
      });
    }

    updated.knockoutPlayoffTies = simPlayoffs;
    updated.r16Ties = r16Ties;
    updated.currentStage = 'round_of_16';

    // Continental Rule: Yellow count CLEARS after League Phase
    if (userPlayer) {
      const store = (userPlayer as any).disciplinaryStore || {};
      const { key, state: discState } = getOrCreateDisciplinaryRecord(store, 'Continental R16', 'continental', updated.competitionId);
      discState.activeYellowCount = 0;
      discState.clearedGroupStage = true;
      store[key] = discState;
      (userPlayer as any).disciplinaryStore = store;
    }
  } else if (updated.currentStage === 'round_of_16' && updated.r16Ties) {
    const simR16 = updated.r16Ties.map((t) => simulateKnockoutTie(t, updated.competitionId, userPlayer));
    const r16Winners = simR16.map((t) => (t.winnerTeamId === t.teamA.id ? t.teamA : t.teamB));

    const shuffledWinners = shuffle(r16Winners);
    const qfTies: ContinentalKnockoutTie[] = [];
    for (let i = 0; i < 4; i++) {
      const tA = shuffledWinners[i * 2] || { id: `qf_a_${i}`, name: `QF Team ${i * 2 + 1}`, ovr: 80, isPlayer: false };
      const tB = shuffledWinners[i * 2 + 1] || { id: `qf_b_${i}`, name: `QF Team ${i * 2 + 2}`, ovr: 80, isPlayer: false };
      const isKeyMatch = tA.isPlayer || tB.isPlayer;

      qfTies.push({
        id: `qf_tie_${updated.competitionId}_${seasonYear}_${i + 1}`,
        stage: 'quarter_final',
        stageName: 'Quarter-Final',
        teamA: tA,
        teamB: tB,
        leg1: {
          id: `qf_${updated.competitionId}_${seasonYear}_${i + 1}_leg1`,
          competitionId: updated.competitionId,
          seasonYear,
          stage: 'quarter_final',
          stageName: 'Quarter-Final (1st Leg)',
          dateStr: `7 April ${seasonYear + 1}`,
          homeTeamId: tA.id,
          homeTeamName: tA.name,
          awayTeamId: tB.id,
          awayTeamName: tB.name,
          homeScore: 0,
          awayScore: 0,
          isPlayerMatch: isKeyMatch,
          isCompleted: false,
          isKeyMatch,
        },
        leg2: {
          id: `qf_${updated.competitionId}_${seasonYear}_${i + 1}_leg2`,
          competitionId: updated.competitionId,
          seasonYear,
          stage: 'quarter_final',
          stageName: 'Quarter-Final (2nd Leg)',
          dateStr: `14 April ${seasonYear + 1}`,
          homeTeamId: tB.id,
          homeTeamName: tB.name,
          awayTeamId: tA.id,
          awayTeamName: tA.name,
          homeScore: 0,
          awayScore: 0,
          isPlayerMatch: isKeyMatch,
          isCompleted: false,
          isKeyMatch,
        },
      });
    }

    updated.r16Ties = simR16;
    updated.qfTies = qfTies;
    updated.currentStage = 'quarter_finals';
  } else if (updated.currentStage === 'quarter_finals' && updated.qfTies) {
    const simQF = updated.qfTies.map((t) => simulateKnockoutTie(t, updated.competitionId, userPlayer));
    const qfWinners = simQF.map((t) => (t.winnerTeamId === t.teamA.id ? t.teamA : t.teamB));

    const shuffledQFWinners = shuffle(qfWinners);
    const sfTies: ContinentalKnockoutTie[] = [];
    for (let i = 0; i < 2; i++) {
      const tA = shuffledQFWinners[i * 2] || { id: `sf_a_${i}`, name: `SF Team ${i * 2 + 1}`, ovr: 82, isPlayer: false };
      const tB = shuffledQFWinners[i * 2 + 1] || { id: `sf_b_${i}`, name: `SF Team ${i * 2 + 2}`, ovr: 82, isPlayer: false };
      const isKeyMatch = tA.isPlayer || tB.isPlayer;

      sfTies.push({
        id: `sf_tie_${updated.competitionId}_${seasonYear}_${i + 1}`,
        stage: 'semi_final',
        stageName: 'Semi-Final',
        teamA: tA,
        teamB: tB,
        leg1: {
          id: `sf_${updated.competitionId}_${seasonYear}_${i + 1}_leg1`,
          competitionId: updated.competitionId,
          seasonYear,
          stage: 'semi_final',
          stageName: 'Semi-Final (1st Leg)',
          dateStr: `28 April ${seasonYear + 1}`,
          homeTeamId: tA.id,
          homeTeamName: tA.name,
          awayTeamId: tB.id,
          awayTeamName: tB.name,
          homeScore: 0,
          awayScore: 0,
          isPlayerMatch: isKeyMatch,
          isCompleted: false,
          isKeyMatch,
        },
        leg2: {
          id: `sf_${updated.competitionId}_${seasonYear}_${i + 1}_leg2`,
          competitionId: updated.competitionId,
          seasonYear,
          stage: 'semi_final',
          stageName: 'Semi-Final (2nd Leg)',
          dateStr: `5 May ${seasonYear + 1}`,
          homeTeamId: tB.id,
          homeTeamName: tB.name,
          awayTeamId: tA.id,
          awayTeamName: tA.name,
          homeScore: 0,
          awayScore: 0,
          isPlayerMatch: isKeyMatch,
          isCompleted: false,
          isKeyMatch,
        },
      });
    }

    updated.qfTies = simQF;
    updated.sfTies = sfTies;
    updated.currentStage = 'semi_finals';

    // Continental Rule: Yellow count CLEARS after Quarter-Finals
    if (userPlayer) {
      const store = (userPlayer as any).disciplinaryStore || {};
      const { key, state: discState } = getOrCreateDisciplinaryRecord(store, 'Continental Semi-Finals', 'continental', updated.competitionId);
      discState.activeYellowCount = 0;
      discState.clearedQuarterFinals = true;
      store[key] = discState;
      (userPlayer as any).disciplinaryStore = store;
    }
  } else if (updated.currentStage === 'semi_finals' && updated.sfTies) {
    const simSF = updated.sfTies.map((t) => simulateKnockoutTie(t, updated.competitionId, userPlayer));
    const finalTeams = simSF.map((t) => (t.winnerTeamId === t.teamA.id ? t.teamA : t.teamB));

    const finalA = finalTeams[0] || { id: 'final_a', name: 'Finalist A', ovr: 84, isPlayer: false };
    const finalB = finalTeams[1] || { id: 'final_b', name: 'Finalist B', ovr: 84, isPlayer: false };
    const isKeyMatch = finalA.isPlayer || finalB.isPlayer;

    const finalTie: ContinentalKnockoutTie = {
      id: `final_tie_${updated.competitionId}_${seasonYear}`,
      stage: 'final',
      stageName: 'Continental Grand Final',
      teamA: finalA,
      teamB: finalB,
      leg1: {
        id: `final_match_${updated.competitionId}_${seasonYear}`,
        competitionId: updated.competitionId,
        seasonYear,
        stage: 'final',
        stageName: 'Grand Final',
        dateStr: `29 May ${seasonYear + 1}`,
        homeTeamId: finalA.id,
        homeTeamName: finalA.name,
        awayTeamId: finalB.id,
        awayTeamName: finalB.name,
        homeScore: 0,
        awayScore: 0,
        isPlayerMatch: isKeyMatch,
        isCompleted: false,
        isKeyMatch: true,
      },
    };

    updated.sfTies = simSF;
    updated.finalTie = finalTie;
    updated.currentStage = 'final';
  } else if (updated.currentStage === 'final' && updated.finalTie) {
    const simFinal = simulateKnockoutTie(updated.finalTie, updated.competitionId, userPlayer);
    const championId = simFinal.winnerTeamId || simFinal.teamA.id;
    const championName = simFinal.winnerTeamName || simFinal.teamA.name;
    const runnerUpId = championId === simFinal.teamA.id ? simFinal.teamB.id : simFinal.teamA.id;
    const runnerUpName = championId === simFinal.teamA.id ? simFinal.teamB.name : simFinal.teamA.name;

    updated.finalTie = simFinal;
    updated.championTeamId = championId;
    updated.championTeamName = championName;
    updated.runnerUpTeamId = runnerUpId;
    updated.runnerUpTeamName = runnerUpName;
    updated.currentStage = 'completed';

    // Persist permanent European competition winner record
    if (['UEFA_CL', 'UEFA_EL', 'UEFA_ECL'].includes(updated.competitionId)) {
      recordEuropeanFinalWinner(updated, simFinal);
    }

    // Refresh drought decay and increment powerscale title stack for champion
    recordContinentalWinnerTitle(updated.competitionId, championId, String(seasonYear));

    if (userPlayer && userPlayer.clubId) {
      if (championId === userPlayer.clubId) {
        updated.playerClubIsChampion = true;
        updated.playerClubStageReached = 'Champion 🏆';
      } else if (runnerUpId === userPlayer.clubId) {
        updated.playerClubStageReached = 'Runner-Up 🥈';
      }
    }
  }

  saveContinentalTournamentState(updated);
  return updated;
}

/**
 * Builds or retrieves the official Super Cup showpiece match.
 */
export function buildSuperCupSeasonState(
  superCupId: 'UEFA_SC' | 'CONMEBOL_REC',
  seasonYear: number,
  championA: { id: string; name: string; ovr: number; isPlayer: boolean; title: string },
  championB: { id: string; name: string; ovr: number; isPlayer: boolean; title: string }
): SuperCupSeasonState {
  const name = superCupId === 'UEFA_SC' ? 'UEFA Super Cup' : 'Recopa Sudamericana';
  const isKeyMatch = championA.isPlayer || championB.isPlayer;

  const match: ContinentalMatchResult = {
    id: `supercup_${superCupId}_${seasonYear}`,
    competitionId: superCupId,
    seasonYear,
    stage: 'supercup',
    stageName: `${name} Final`,
    dateStr: `12 August ${seasonYear}`,
    homeTeamId: championA.id,
    homeTeamName: championA.name,
    awayTeamId: championB.id,
    awayTeamName: championB.name,
    homeScore: 0,
    awayScore: 0,
    isPlayerMatch: isKeyMatch,
    isCompleted: false,
    isKeyMatch,
  };

  const state: SuperCupSeasonState = {
    id: superCupId,
    name,
    seasonYear,
    teamA: championA,
    teamB: championB,
    match,
    isCompleted: false,
  };

  saveSuperCupSeasonState(state);
  return state;
}

/**
 * Simulates the Super Cup match and crowns the winner.
 */
export function simulateSuperCupMatch(
  state: SuperCupSeasonState,
  userPlayer?: PlayerCardData
): SuperCupSeasonState {
  if (state.isCompleted || !state.match) return state;

  const simMatch = simulateSingleContinentalMatch(
    state.match,
    state.teamA.ovr,
    state.teamB.ovr,
    userPlayer,
    true,
    true
  );

  let winnerId = state.teamA.id;
  let winnerName = state.teamA.name;

  if (simMatch.homeScore > simMatch.awayScore) {
    winnerId = state.teamA.id;
    winnerName = state.teamA.name;
  } else if (simMatch.awayScore > simMatch.homeScore) {
    winnerId = state.teamB.id;
    winnerName = state.teamB.name;
  } else {
    const pWins = (simMatch.homePenalties || 0) > (simMatch.awayPenalties || 0);
    winnerId = pWins ? state.teamA.id : state.teamB.id;
    winnerName = pWins ? state.teamA.name : state.teamB.name;
  }

  const updated: SuperCupSeasonState = {
    ...state,
    match: simMatch,
    isCompleted: true,
    winnerTeamId: winnerId,
    winnerTeamName: winnerName,
  };

  saveSuperCupSeasonState(updated);
  return updated;
}
