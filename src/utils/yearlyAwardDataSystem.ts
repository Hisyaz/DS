/**
 * YEARLY PROFESSIONAL AWARDS DATA INFRASTRUCTURE
 * 
 * Lightweight aggregate data system that preserves professional calendar-year data
 * across European season resets (June season reset vs. December yearly awards).
 * 
 * Flow:
 * Professional Match → World Results → Yearly Aggregate → December Awards → Permanent Award Result → Delete Aggregate
 * 
 * Key Constraints:
 * 1. Only store lightweight aggregate numbers (No match histories, no replay events).
 * 2. World Results remains the authoritative match database.
 * 3. Youth statistics must NEVER enter this system.
 * 4. European season ends in June; January–June data is preserved in Yearly Award Data before season reset.
 * 5. August–December data from the subsequent season is added to the same calendar-year dataset.
 * 6. After December awards are calculated and saved permanently, temporary yearly data is cleaned up.
 */

import { PlayerConfig, PlayerCardData } from '../types';
import { LeagueDatabase, EditorTeamData } from '../types/leagueEditor';
import {
  PlayerYearlyAggregateStats,
  YearlyAwardData,
  YearlyAwardCompetitionWinners,
  CompetitionStatSummary,
  ProfessionalCompetitionType,
} from '../types/yearlyAwardData';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { safeGetItem, safeSetItem, safeRemoveItem } from './storageCleaner';
import { getCalendarDateForMatchdayIndex } from './calendarDateFormatter';
import {
  getWorldSimulationState,
  WorldSimulationState,
  WorldLeagueState,
  isPlayerInProClub,
} from './worldSimulationEngine';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { getMainPosition } from './individualAwardsEngine';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { SimulatedDatabaseMatchResult, MatchPlayerStats } from './databaseMatchSimulationEngine';

const STORAGE_PREFIX = 'YEARLY_AWARD_DATA_V1_';
const memoryYearlyDataCache: Map<number, YearlyAwardData> = new Map();

/**
 * Initializes a clean, empty YearlyAwardData container for a calendar year.
 */
export function createEmptyYearlyAwardData(calendarYear: number): YearlyAwardData {
  return {
    calendarYear,
    players: {},
    competitionWinners: {
      domesticChampions: {},
      domesticCupWinners: {},
      continentalChampions: {},
      internationalChampions: {},
    },
    teamTrophies: {},
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };
}

/**
 * Saves a calendar-year dataset to persistent storage and in-memory cache.
 */
export function saveYearlyAwardData(data: YearlyAwardData): void {
  data.lastUpdated = Date.now();
  memoryYearlyDataCache.set(data.calendarYear, data);
  const key = `${STORAGE_PREFIX}${data.calendarYear}`;
  try {
    safeSetItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[YearlyAwardData] Failed to save yearly award data for ${data.calendarYear}:`, err);
  }
}

/**
 * Checks if preserved yearly award data exists for a given calendar year.
 */
export function hasYearlyAwardData(calendarYear: number): boolean {
  if (memoryYearlyDataCache.has(calendarYear)) return true;
  const key = `${STORAGE_PREFIX}${calendarYear}`;
  return safeGetItem(key) !== null;
}

/**
 * Deletes the temporary Yearly Award Data for a calendar year.
 * Called after December yearly awards have been successfully generated and permanently saved.
 */
export function cleanupYearlyAwardData(calendarYear: number): void {
  memoryYearlyDataCache.delete(calendarYear);
  const key = `${STORAGE_PREFIX}${calendarYear}`;
  safeRemoveItem(key);
}

/**
 * Resolves or creates a player's lightweight aggregate record in the yearly dataset.
 */
function getOrCreatePlayerAggregate(
  yearlyData: YearlyAwardData,
  playerId: string,
  defaults: {
    playerName: string;
    teamId: string;
    teamName: string;
    countryCode: string;
    position: string;
    subPosition?: string;
    ovr: number;
    age?: number;
    isUserPlayer?: boolean;
  }
): PlayerYearlyAggregateStats {
  if (yearlyData.players[playerId]) {
    const existing = yearlyData.players[playerId];
    // Keep team, age, and OVR up to date if player moved
    if (defaults.teamId) existing.teamId = defaults.teamId;
    if (defaults.teamName) existing.teamName = defaults.teamName;
    if (defaults.ovr && defaults.ovr > existing.ovr) existing.ovr = defaults.ovr;
    if (defaults.age && (!existing.age || defaults.age > existing.age)) existing.age = defaults.age;
    return existing;
  }

  const record: PlayerYearlyAggregateStats = {
    playerId,
    calendarYear: yearlyData.calendarYear,
    playerName: defaults.playerName,
    teamId: defaults.teamId,
    teamName: defaults.teamName,
    countryCode: defaults.countryCode || 'ENG',
    position: defaults.position || 'ATT',
    subPosition: defaults.subPosition,
    ovr: defaults.ovr || 75,
    age: defaults.age || 24,
    isUserPlayer: defaults.isUserPlayer || false,

    appearances: 0,
    starts: 0,
    minutes: 0,

    goals: 0,
    assists: 0,

    totalRating: 0,
    ratingCount: 0,
    avgRating: 7.0,

    cleanSheets: 0,
    defensiveStops: 0,
    yellowCards: 0,
    redCards: 0,
    mvpCount: 0,

    intlAppearances: 0,
    intlStarts: 0,
    intlMinutes: 0,
    intlGoals: 0,
    intlAssists: 0,
    intlCleanSheets: 0,
    intlTrophies: [],

    teamTrophies: [],
    individualAchievements: [],
    competitions: {},
    processedMatchIds: [],
  };

  yearlyData.players[playerId] = record;
  return record;
}

/**
 * Adds an appearance and performance metrics to a player's yearly aggregate.
 * Enforces deduplication via matchId.
 */
function addMatchToPlayerAggregate(
  record: PlayerYearlyAggregateStats,
  matchId: string,
  stats: {
    isStarter: boolean;
    minutesPlayed: number;
    goals: number;
    assists: number;
    rating: number;
    cleanSheet?: boolean;
    defensiveStops?: number;
    yellowCard?: boolean;
    redCard?: boolean;
    isMvp?: boolean;
    isInternational?: boolean;
    competitionId?: string;
    competitionName?: string;
    competitionType?: ProfessionalCompetitionType;
  }
): void {
  if (!record.processedMatchIds) record.processedMatchIds = [];
  if (matchId && record.processedMatchIds.includes(matchId)) {
    return; // Already processed, avoid duplicate counting
  }

  if (matchId) {
    record.processedMatchIds.push(matchId);
    // Keep deduplication list lightweight (cap at last 100 match IDs)
    if (record.processedMatchIds.length > 100) {
      record.processedMatchIds.shift();
    }
  }

  record.appearances += 1;
  if (stats.isStarter) record.starts += 1;
  record.minutes += stats.minutesPlayed || 0;

  record.goals += stats.goals || 0;
  record.assists += stats.assists || 0;

  if (stats.rating > 0) {
    record.totalRating += stats.rating;
    record.ratingCount += 1;
    record.avgRating = parseFloat((record.totalRating / record.ratingCount).toFixed(2));
  }

  if (stats.cleanSheet) record.cleanSheets += 1;
  if (stats.defensiveStops) record.defensiveStops += stats.defensiveStops;
  if (stats.yellowCard) record.yellowCards += 1;
  if (stats.redCard) record.redCards += 1;
  if (stats.isMvp) record.mvpCount += 1;

  if (stats.isInternational) {
    record.intlAppearances += 1;
    if (stats.isStarter) record.intlStarts += 1;
    record.intlMinutes += stats.minutesPlayed || 0;
    record.intlGoals += stats.goals || 0;
    record.intlAssists += stats.assists || 0;
    if (stats.cleanSheet) record.intlCleanSheets += 1;
  }

  // Lightweight competition breakdown
  if (stats.competitionId && stats.competitionName) {
    const compId = stats.competitionId;
    if (!record.competitions[compId]) {
      record.competitions[compId] = {
        competitionId: compId,
        competitionName: stats.competitionName,
        competitionType: stats.competitionType || 'league',
        matches: 0,
        starts: 0,
        minutes: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0,
      };
    }
    const c = record.competitions[compId];
    c.matches += 1;
    if (stats.isStarter) c.starts += 1;
    c.minutes += stats.minutesPlayed || 0;
    c.goals += stats.goals || 0;
    c.assists += stats.assists || 0;
    if (stats.cleanSheet) c.cleanSheets += 1;
  }
}

/**
 * UNIQUE CAREER INTEGRATION
 * Feeds a professional first-team Unique Career match into the Yearly Award Data system.
 * 
 * Strict Constraint: Youth statistics must NEVER enter this system.
 */
export function recordUniqueCareerMatchToYearlyAwardData(
  match: SimulatedMatchResult,
  player: PlayerConfig | PlayerCardData,
  seasonYear?: string
): void {
  // 1. Strict Eligibility Gate: Professional First Team Only
  const isPro = isPlayerInProClub(player) || isProfessionalPlayer(player as any);
  const squadDest = (player as any)?.squadDestination;
  const isFirstTeam = !squadDest || squadDest === 'First Team' || squadDest === 'Senior';
  const compName = (match.competitionName || '').toLowerCase();
  const isYouthComp =
    compName.includes('youth') ||
    compName.includes('reserve') ||
    compName.includes('u17') ||
    compName.includes('u20') ||
    compName.includes('academy');

  if (!isPro || !isFirstTeam || isYouthComp) {
    // Youth statistics must never enter this system!
    return;
  }

  // 2. Derive Calendar Year of the match
  const safeSeasonYear = seasonYear || (player as any)?.seasonYear || '2026/27';
  const mdIndex = match.matchdayIndex || 1;
  const matchDate = getCalendarDateForMatchdayIndex(mdIndex, safeSeasonYear);
  const calendarYear = matchDate.getFullYear();

  // 3. Load or create container for that calendar year
  const yearlyData = getRawYearlyAwardData(calendarYear);

  const playerId = player.id || (player as any)?.playerId || 'user_player';
  const pos = getMainPosition(player.position || (player as any)?.subPosition);

  const playerRecord = getOrCreatePlayerAggregate(yearlyData, playerId, {
    playerName: player.name || 'User Player',
    teamId: player.clubId || (player as any)?.club_id || 'player_team',
    teamName: player.club || 'Club',
    countryCode: player.countryCode || (player as any)?.nationality?.code || 'ENG',
    position: pos,
    subPosition: (player as any)?.subPosition || player.position,
    ovr: player.ovr || 75,
    age: player.age || (player as any)?.age || 18,
    isUserPlayer: true,
  });

  const isStarter = match.playerStatus === 'starter';
  const isPlayed = isStarter || match.playerStatus === 'sub_out' || match.playerStatus === 'sub_in';
  if (!isPlayed) return;

  const mins = match.minutesPlayed !== undefined ? match.minutesPlayed : (isStarter ? 90 : 30);
  const isCleanSheet = (pos === 'GK' || pos === 'DEF') && (match.cleanSheet || match.opponentScore === 0);
  const isIntl = (match.competitionType as string) === 'international' || compName.includes('international') || compName.includes('world cup');

  addMatchToPlayerAggregate(playerRecord, match.matchId, {
    isStarter,
    minutesPlayed: mins,
    goals: match.playerGoals || 0,
    assists: match.playerAssists || 0,
    rating: match.playerRating || 7.0,
    cleanSheet: isCleanSheet,
    defensiveStops: (pos === 'DEF' || pos === 'GK') ? 2 : 0,
    yellowCard: match.yellowCard,
    redCard: match.redCard,
    isMvp: match.isMvp,
    isInternational: isIntl,
    competitionId: match.continentalCompId || match.competitionName || 'Domestic League',
    competitionName: match.competitionName || 'Domestic League',
    competitionType: match.competitionType as ProfessionalCompetitionType || 'league',
  });

  saveYearlyAwardData(yearlyData);
}

/**
 * Loads raw YearlyAwardData directly from memory or storage without merging active season.
 */
function getRawYearlyAwardData(calendarYear: number): YearlyAwardData {
  if (memoryYearlyDataCache.has(calendarYear)) {
    return memoryYearlyDataCache.get(calendarYear)!;
  }
  const key = `${STORAGE_PREFIX}${calendarYear}`;
  const raw = safeGetItem(key);
  if (raw) {
    try {
      const parsed: YearlyAwardData = JSON.parse(raw);
      memoryYearlyDataCache.set(calendarYear, parsed);
      return parsed;
    } catch (err) {
      console.error(`[YearlyAwardData] Failed to parse stored data for ${calendarYear}:`, err);
    }
  }
  const empty = createEmptyYearlyAwardData(calendarYear);
  memoryYearlyDataCache.set(calendarYear, empty);
  return empty;
}

/**
 * Helper to process a simulated World Results match into the yearly aggregate.
 */
function processWorldSimulatedMatch(
  yearlyData: YearlyAwardData,
  match: SimulatedDatabaseMatchResult,
  competitionId: string,
  competitionName: string,
  compType: ProfessionalCompetitionType,
  isIntl: boolean = false
): void {
  if (!match.isCompleted) return;

  const processPlayer = (p: MatchPlayerStats, isStarter: boolean) => {
    if (p.participationStatus === 'sub_did_not_enter' || p.participationStatus === 'rested') return;
    const mins = p.minutesPlayed || (isStarter ? 90 : 25);
    if (mins <= 0) return;

    const pos = getMainPosition(p.position || p.subPosition);
    const isCleanSheet = (pos === 'GK' || pos === 'DEF') && (p.cleanSheet || match.awayScore === 0);

    const record = getOrCreatePlayerAggregate(yearlyData, p.id, {
      playerName: p.name,
      teamId: p.teamId,
      teamName: p.teamName,
      countryCode: (p as any).countryCode || 'ENG',
      position: pos,
      subPosition: p.subPosition,
      ovr: p.ovr || 75,
      age: (p as any).age || 24,
      isUserPlayer: p.isUserPlayer || false,
    });

    addMatchToPlayerAggregate(record, match.id, {
      isStarter,
      minutesPlayed: mins,
      goals: p.goals || 0,
      assists: p.assists || 0,
      rating: p.rating || 6.5,
      cleanSheet: isCleanSheet,
      defensiveStops: p.defensiveStops || 0,
      yellowCard: (p.yellowCards || 0) > 0,
      redCard: (p.redCards || 0) > 0,
      isMvp: match.mvpPlayer?.playerId === p.id || p.isMvp,
      isInternational: isIntl,
      competitionId,
      competitionName,
      competitionType: compType,
    });
  };

  (match.homePlayers || []).forEach((p) => processPlayer(p, true));
  (match.awayPlayers || []).forEach((p) => processPlayer(p, true));
  (match.homeBench || []).forEach((p) => processPlayer(p, false));
  (match.awayBench || []).forEach((p) => processPlayer(p, false));
}

/**
 * SEASON RESET PRESERVATION
 * 
 * Before a season reset deletes temporary statistics:
 * 1. Identify all professional statistics belonging to the current calendar year (January → June).
 * 2. Add them to that year's Yearly Award Data.
 * 3. Then the caller performs the normal season reset.
 * 
 * Example:
 * European season 2026–27 ends in June 2027.
 * Before deleting the season statistics:
 * - Preserve January–June 2027 professional data in YEARLY AWARD DATA 2027.
 * - Reset the season normally.
 * - Start the 2027–28 season.
 * - Add August–December 2027 professional data to the same 2027 dataset.
 */
export function preserveCalendarYearDataBeforeSeasonReset(
  completedSeasonYear: string,
  player?: PlayerConfig | PlayerCardData,
  db?: LeagueDatabase
): YearlyAwardData {
  const currentDb = db || getCareerLeagueDatabase();
  const startYear = parseInt(completedSeasonYear.split('/')[0], 10) || 2026;
  // European season ends in June of startYear + 1 (e.g. 2026/27 ends in June 2027)
  const targetCalendarYear = startYear + 1;

  const worldState = getWorldSimulationState(completedSeasonYear, currentDb, player as any);
  const yearlyData = getRawYearlyAwardData(targetCalendarYear);

  // 1. Process Senior Professional Leagues (Exclude Youth Leagues)
  Object.values(worldState.leagues).forEach((league) => {
    if (league.divisionTier === 'youth') {
      return; // Youth statistics must never enter this system!
    }

    // Matchdays in the completed season
    Object.entries(league.matchdays).forEach(([mdStr, matches]) => {
      const mdIndex = parseInt(mdStr, 10);
      const matchDate = getCalendarDateForMatchdayIndex(mdIndex, completedSeasonYear);
      // Only include matches that occurred in the target calendar year (January → June)
      if (matchDate.getFullYear() === targetCalendarYear) {
        matches.forEach((m) => {
          processWorldSimulatedMatch(yearlyData, m, league.leagueId, league.name, 'league');
        });
      }
    });

    // Synchronize cumulative league statistics
    const statsSource = Object.values(league.playerStatsMap || (league as any).playerStats || {});
    statsSource.forEach((pStat: any) => {
      const pName = pStat.playerName || pStat.name;
      const pMatches = pStat.matchesPlayed || pStat.matches || pStat.appearances || 0;
      const pOvr = pStat.ovr || pStat.overallRating || 75;
      if (pMatches > 0 || pStat.goals > 0 || pStat.assists > 0) {
        const pRecord = getOrCreatePlayerAggregate(yearlyData, pStat.playerId, {
          playerName: pName,
          teamId: pStat.teamId || league.leagueId,
          teamName: pStat.teamName || league.name,
          countryCode: pStat.countryCode || 'ENG',
          position: getMainPosition(pStat.position || pStat.subPosition),
          subPosition: pStat.subPosition || pStat.position,
          ovr: pOvr,
          age: pStat.age || 24,
          isUserPlayer: Boolean(pStat.isUserPlayer),
        });

        if (pStat.goals > pRecord.goals) pRecord.goals = pStat.goals;
        if (pStat.assists > pRecord.assists) pRecord.assists = pStat.assists;
        if (pMatches > pRecord.appearances) {
          pRecord.appearances = pMatches;
          pRecord.starts = pStat.starts || pMatches;
          pRecord.minutes = pStat.minutes || pMatches * 85;
        }
        if (pStat.cleanSheets > pRecord.cleanSheets) pRecord.cleanSheets = pStat.cleanSheets;
        if (pStat.avgRating > 0 && (pRecord.avgRating === 0 || pStat.avgRating > pRecord.avgRating)) {
          pRecord.avgRating = pStat.avgRating;
          pRecord.totalRating = pStat.totalRating || (pStat.avgRating * pRecord.appearances);
          pRecord.ratingCount = pRecord.appearances;
        }
        if (pOvr > pRecord.ovr) {
          pRecord.ovr = pOvr;
        }
      }
    });

    // Record Domestic League Champions awarded in this calendar year
    if (league.standings && league.standings.length > 0) {
      const champion = league.standings[0];
      if (champion && champion.played >= 10) {
        yearlyData.competitionWinners.domesticChampions[league.leagueId] = champion.teamName;
        const trophyName = `${league.name} Champion`;
        if (!yearlyData.teamTrophies[champion.teamId]) yearlyData.teamTrophies[champion.teamId] = [];
        if (!yearlyData.teamTrophies[champion.teamId].includes(trophyName)) {
          yearlyData.teamTrophies[champion.teamId].push(trophyName);
        }

        // Grant trophy to players on this team
        Object.values(yearlyData.players).forEach((p) => {
          if (p.teamId === champion.teamId && !p.teamTrophies.includes(trophyName)) {
            p.teamTrophies.push(trophyName);
          }
        });
      }
    }
  });

  // 2. Process Domestic Cups Completed in the Target Calendar Year
  Object.values(worldState.domesticCups || {}).forEach((cup) => {
    (cup.rounds || []).forEach((round) => {
      // Cup matches in spring belong to target calendar year
      (round.matches || []).forEach((m) => {
        processWorldSimulatedMatch(yearlyData, m, cup.cupId, cup.name, 'domestic_cup');
      });
    });

    if (cup.winner) {
      yearlyData.competitionWinners.domesticCupWinners[cup.cupId] = cup.winner.teamName;
      const trophyName = `${cup.name} Winner`;
      if (!yearlyData.teamTrophies[cup.winner.teamId]) yearlyData.teamTrophies[cup.winner.teamId] = [];
      if (!yearlyData.teamTrophies[cup.winner.teamId].includes(trophyName)) {
        yearlyData.teamTrophies[cup.winner.teamId].push(trophyName);
      }

      Object.values(yearlyData.players).forEach((p) => {
        if (p.teamId === cup.winner!.teamId && !p.teamTrophies.includes(trophyName)) {
          p.teamTrophies.push(trophyName);
        }
      });
    }
  });

  // 3. Process Continental Competitions Completed in the Target Calendar Year (e.g. UCL, UEL)
  Object.values(worldState.continental || {}).forEach((cont) => {
    (cont.knockoutRounds || []).forEach((round) => {
      (round.matches || []).forEach((m) => {
        processWorldSimulatedMatch(yearlyData, m, cont.competitionId, cont.name, 'continental');
      });
    });

    if (cont.winner) {
      yearlyData.competitionWinners.continentalChampions[cont.competitionId] = cont.winner.teamName;
      const trophyName = `${cont.name} Winner`;
      if (!yearlyData.teamTrophies[cont.winner.teamId]) yearlyData.teamTrophies[cont.winner.teamId] = [];
      if (!yearlyData.teamTrophies[cont.winner.teamId].includes(trophyName)) {
        yearlyData.teamTrophies[cont.winner.teamId].push(trophyName);
      }

      Object.values(yearlyData.players).forEach((p) => {
        if (p.teamId === cont.winner!.teamId && !p.teamTrophies.includes(trophyName)) {
          p.teamTrophies.push(trophyName);
        }
      });
    }
  });

  // 4. Process International Competitions (Exclude Youth U17/U20)
  Object.values(worldState.international || {}).forEach((intl) => {
    if (intl.type === 'u17' || intl.type === 'u20') {
      return; // Exclude youth international
    }
    // Process group matches
    (intl.groups || []).forEach((grp) => {
      Object.values(grp.matchdays || {}).forEach((matches) => {
        matches.forEach((m) => {
          processWorldSimulatedMatch(yearlyData, m, intl.competitionId, intl.name, 'international', true);
        });
      });
    });
    // Process knockout matches
    (intl.knockoutRounds || []).forEach((round) => {
      (round.matches || []).forEach((m) => {
        processWorldSimulatedMatch(yearlyData, m, intl.competitionId, intl.name, 'international', true);
      });
    });

    if (intl.winner) {
      yearlyData.competitionWinners.internationalChampions[intl.competitionId] = intl.winner.teamName;
      const trophyName = `${intl.name} Champion`;
      Object.values(yearlyData.players).forEach((p) => {
        if (p.countryCode === intl.winner!.teamName || p.teamName === intl.winner!.teamName) {
          if (!p.intlTrophies.includes(trophyName)) {
            p.intlTrophies.push(trophyName);
          }
        }
      });
    }
  });

  saveYearlyAwardData(yearlyData);
  return yearlyData;
}

/**
 * Harvests August → December professional data from an active season into the calendar-year dataset.
 * For example: For calendar year 2027, this collects the first half of season 2027/28 (Aug–Dec 2027).
 */
export function harvestActiveSeasonDataForCalendarYear(
  activeSeasonYear: string,
  targetCalendarYear: number,
  activeWorldState?: WorldSimulationState,
  player?: PlayerConfig | PlayerCardData
): YearlyAwardData {
  const worldState = activeWorldState || getWorldSimulationState(activeSeasonYear, undefined, player as any);
  const yearlyData = getRawYearlyAwardData(targetCalendarYear);

  Object.values(worldState.leagues).forEach((league) => {
    if (league.divisionTier === 'youth') return; // Exclude youth

    Object.entries(league.matchdays).forEach(([mdStr, matches]) => {
      const mdIndex = parseInt(mdStr, 10);
      const matchDate = getCalendarDateForMatchdayIndex(mdIndex, activeSeasonYear);
      // August → December of targetCalendarYear
      if (matchDate.getFullYear() === targetCalendarYear) {
        matches.forEach((m) => {
          processWorldSimulatedMatch(yearlyData, m, league.leagueId, league.name, 'league');
        });
      }
    });

    // Also synchronize authoritative cumulative player stats from active season league simulation
    const statsSource = Object.values(league.playerStatsMap || (league as any).playerStats || {});
    statsSource.forEach((pStat: any) => {
      const pName = pStat.playerName || pStat.name;
      const pMatches = pStat.matchesPlayed || pStat.matches || pStat.appearances || 0;
      const pOvr = pStat.ovr || pStat.overallRating || 75;
      if (pMatches > 0 || pStat.goals > 0 || pStat.assists > 0) {
        const pRecord = getOrCreatePlayerAggregate(yearlyData, pStat.playerId, {
          playerName: pName,
          teamId: pStat.teamId || league.leagueId,
          teamName: pStat.teamName || league.name,
          countryCode: pStat.countryCode || 'ENG',
          position: getMainPosition(pStat.position || pStat.subPosition),
          subPosition: pStat.subPosition || pStat.position,
          ovr: pOvr,
          age: pStat.age || 24,
          isUserPlayer: Boolean(pStat.isUserPlayer),
        });

        if (pStat.goals > pRecord.goals) pRecord.goals = pStat.goals;
        if (pStat.assists > pRecord.assists) pRecord.assists = pStat.assists;
        if (pMatches > pRecord.appearances) {
          pRecord.appearances = pMatches;
          pRecord.starts = pStat.starts || pMatches;
          pRecord.minutes = pStat.minutes || pMatches * 85;
        }
        if (pStat.cleanSheets > pRecord.cleanSheets) pRecord.cleanSheets = pStat.cleanSheets;
        if (pStat.avgRating > 0 && (pRecord.avgRating === 0 || pStat.avgRating > pRecord.avgRating)) {
          pRecord.avgRating = pStat.avgRating;
          pRecord.totalRating = pStat.totalRating || (pStat.avgRating * pRecord.appearances);
          pRecord.ratingCount = pRecord.appearances;
        }
        if (pOvr > pRecord.ovr) {
          pRecord.ovr = pOvr;
        }
      }
    });
  });

  // Group stages of continental competitions in autumn
  Object.values(worldState.continental || {}).forEach((cont) => {
    (cont.groups || []).forEach((grp) => {
      Object.values(grp.matchdays || {}).forEach((matches) => {
        matches.forEach((m) => {
          processWorldSimulatedMatch(yearlyData, m, cont.competitionId, cont.name, 'continental');
        });
      });
    });
  });

  // Senior International competitions in calendar year (e.g. World Cup in Dec/July, qualifiers in autumn)
  Object.values(worldState.international || {}).forEach((intl) => {
    if (intl.type === 'u17' || intl.type === 'u20') return; // Exclude youth

    (intl.groups || []).forEach((grp) => {
      Object.values(grp.matchdays || {}).forEach((matches) => {
        matches.forEach((m) => {
          processWorldSimulatedMatch(yearlyData, m, intl.competitionId, intl.name, 'international', true);
        });
      });
    });

    (intl.knockoutRounds || []).forEach((round) => {
      (round.matches || []).forEach((m) => {
        processWorldSimulatedMatch(yearlyData, m, intl.competitionId, intl.name, 'international', true);
      });
    });

    if (intl.winner) {
      yearlyData.competitionWinners.internationalChampions[intl.competitionId] = intl.winner.teamName;
      const trophyName = `${intl.name} Champion`;
      Object.values(yearlyData.players).forEach((p) => {
        if (p.countryCode === intl.winner!.teamName || p.teamName === intl.winner!.teamName) {
          if (!p.intlTrophies.includes(trophyName)) {
            p.intlTrophies.push(trophyName);
          }
        }
      });
    }
  });

  saveYearlyAwardData(yearlyData);
  return yearlyData;
}

/**
 * DECEMBER HANDOFF / RETRIEVAL
 * 
 * Exposes a complete calendar-year dataset to the yearly awards system.
 * 
 * For example:
 * GET_YEARLY_AWARD_DATA(2027)
 * returns the complete professional 2027 performance dataset:
 * - January 2027 → June 2027 (preserved across the June season reset).
 * - August 2027 → December 2027 (from the active season).
 * - Professional international competitions occurring during 2027.
 */
export function getYearlyAwardData(
  calendarYear: number,
  options?: {
    includeActiveSeason?: boolean;
    activeSeasonYear?: string;
    activeWorldState?: WorldSimulationState;
    player?: PlayerConfig | PlayerCardData;
  }
): YearlyAwardData {
  const yearlyData = getRawYearlyAwardData(calendarYear);

  if (options?.includeActiveSeason !== false) {
    // If an active season started in calendarYear (e.g. 2027/28 started in Aug 2027),
    // harvest its August → December matches
    const derivedActiveSeasonYear = options?.activeSeasonYear || `${calendarYear}/${String(calendarYear + 1).slice(-2)}`;
    try {
      harvestActiveSeasonDataForCalendarYear(
        derivedActiveSeasonYear,
        calendarYear,
        options?.activeWorldState,
        options?.player
      );
    } catch {
      // Safe fallback if active season state is not yet initialized
    }
  }

  return yearlyData;
}

/**
 * Direct literal alias matching the requirement:
 * "GET YEARLY AWARD DATA — 2027 must return the complete professional 2027 performance dataset."
 */
export const GET_YEARLY_AWARD_DATA = getYearlyAwardData;
