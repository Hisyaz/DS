import { PlayerCardData, PlayerConfig, AccountingState } from '../types';
import { EditorTeamData, LeagueDatabase } from '../types/leagueEditor';
import { CareerSeasonRecord, FullCareerHistory } from '../types/careerConclusion';
import { getCareerLeagueDatabase, saveCareerLeagueDatabase } from './careerSaveSystem';
import { compileFullCareerHistory } from './careerConclusionSystem';
import { invalidateTeamStrengthCache } from './lightweightMatchEngine';
import { getSanitizedTeamsForLeague } from './leagueSanitizer';
import {
  WorldSimulationState,
  initializeWorldSimulationState,
  saveWorldSimulationState,
  getActiveWorldSimulationKey,
  getWorldSimulationState,
} from './worldSimulationEngine';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';
import { getSafeLocalStorage } from './storageCleaner';
import { preserveCalendarYearDataBeforeSeasonReset } from './yearlyAwardDataSystem';
import {
  CONTINENTAL_DOMESTIC_SNAPSHOTS_STORAGE_KEY_PREFIX,
  saveDomesticSeasonSnapshotsForNextSeason,
  buildDomesticSeasonSnapshots,
} from './continentalQualificationSystem';
import {
  detectPlayerContinentalCompetition,
  getOrInitContinentalStateForSeason,
} from './continentalScheduleIntegration';
import { getClubFederation, isCompetitionValidForFederation } from './clubContextRebuilder';

export interface FinalizeSeasonOptions {
  completedSeasonYear: string; // e.g. "2026/27"
  newSeasonYear: string; // e.g. "2027/28"
  player: PlayerConfig | PlayerCardData;
  accounting?: AccountingState;
  seasonRecord?: CareerSeasonRecord;
}

export interface SeasonTransitionResult {
  updatedPlayer: PlayerConfig;
  updatedAccounting?: AccountingState;
  newWorldState: WorldSimulationState;
  memoryCleanedSummary: {
    previousSeasonKeyRemoved: boolean;
    temporaryMatchCachesCleared: number;
    teamStrengthCacheInvalidated: boolean;
    rostersReinitializedCount: number;
    timestamp: string;
  };
}

/**
 * Prefix constants for active simulation storage
 */
const WORLD_STATE_STORAGE_KEY_PREFIX = 'WORLD_SIMULATION_STATE_ACTIVE_V3_';
const CONTINENTAL_STORAGE_PREFIX = 'CONTINENTAL_TOURNAMENT_STATE_';
const SUPERCUP_STORAGE_PREFIX = 'CONTINENTAL_SUPERCUP_STATE_';

/**
 * 1. PERMANENT CAREER HISTORY PRESERVATION
 * Finalizes and permanently records the completed season into the player's Career Summary
 * in a lightweight historical format, without storing active match simulation objects.
 */
export function preservePermanentCareerHistory(
  player: PlayerConfig | PlayerCardData,
  seasonRecord?: CareerSeasonRecord
): FullCareerHistory {
  const currentHistory: FullCareerHistory =
    player.careerHistory || compileFullCareerHistory(player as PlayerCardData);

  let updatedSeasons = [...(currentHistory.seasonsPlayed || [])];

  if (seasonRecord) {
    // Filter out any duplicate record for this age/season and insert clean summary
    updatedSeasons = [
      ...updatedSeasons.filter((s) => s.age !== seasonRecord.age && s.seasonYear !== seasonRecord.seasonYear),
      {
        seasonYear: seasonRecord.seasonYear,
        age: seasonRecord.age,
        teamName: seasonRecord.teamName,
        squadLevel: seasonRecord.squadLevel,
        competitionName: seasonRecord.competitionName,
        isYouth: seasonRecord.isYouth,
        matches: seasonRecord.matches,
        minutesPlayed: seasonRecord.minutesPlayed || 0,
        goals: seasonRecord.goals,
        assists: seasonRecord.assists,
        mvps: seasonRecord.mvps || 0,
        avgRating: seasonRecord.avgRating,
        cleanSheets: seasonRecord.cleanSheets || 0,
        yellowCards: seasonRecord.yellowCards || 0,
        redCards: seasonRecord.redCards || 0,
        trophiesWon: seasonRecord.trophiesWon || [],
        awardsWon: seasonRecord.awardsWon || [],
        competitions: seasonRecord.competitions || [],
        standingsSummary: seasonRecord.standingsSummary,
        topScorerRank: seasonRecord.topScorerRank,
        topAssistRank: seasonRecord.topAssistRank,
        salaryAnnual: seasonRecord.salaryAnnual,
        sponsorsIncome: seasonRecord.sponsorsIncome,
        ovrStart: seasonRecord.ovrStart,
        ovrEnd: seasonRecord.ovrEnd,
        standingRank: seasonRecord.standingRank,
        promoted: seasonRecord.promoted,
        relegated: seasonRecord.relegated,
        qualificationOutcome: seasonRecord.qualificationOutcome,
        statsGained: seasonRecord.statsGained,
        keyHighlight: seasonRecord.keyHighlight,
      },
    ].sort((a, b) => a.age - b.age);
  }

  // Calculate cumulative lifetime match statistics
  const totalMatches = updatedSeasons.reduce((sum, s) => sum + s.matches, 0);
  const totalGoals = updatedSeasons.reduce((sum, s) => sum + s.goals, 0);
  const totalAssists = updatedSeasons.reduce((sum, s) => sum + s.assists, 0);

  // Find best single season records
  let bestGoalsSeason = { count: 0, season: '' };
  let bestAssistsSeason = { count: 0, season: '' };
  let bestScoringSeason = { goals: 0, season: '', club: '' };

  updatedSeasons.forEach((s) => {
    if (s.goals > bestGoalsSeason.count) {
      bestGoalsSeason = { count: s.goals, season: s.seasonYear };
      bestScoringSeason = { goals: s.goals, season: s.seasonYear, club: s.teamName };
    }
    if (s.assists > bestAssistsSeason.count) {
      bestAssistsSeason = { count: s.assists, season: s.seasonYear };
    }
  });

  return {
    ...currentHistory,
    seasonsPlayed: updatedSeasons,
    totalGoals: Math.max(totalGoals, currentHistory.totalGoals || 0),
    totalAssists: Math.max(totalAssists, currentHistory.totalAssists || 0),
    matchStats: {
      ...currentHistory.matchStats,
      totalMatches: Math.max(totalMatches, currentHistory.matchStats?.totalMatches || 0),
    },
    mostGoalsSingleSeason: bestGoalsSeason.count > 0 ? bestGoalsSeason : currentHistory.mostGoalsSingleSeason,
    mostAssistsSingleSeason: bestAssistsSeason.count > 0 ? bestAssistsSeason : currentHistory.mostAssistsSingleSeason,
    bestScoringSeason: bestScoringSeason.goals > 0 ? bestScoringSeason : currentHistory.bestScoringSeason,
  };
}

/**
 * 2. DELETE COMPLETED SEASON SIMULATION DATA & CLEAR SIMULATION CACHES
 * Releases active simulation objects, matchday schedules, event arrays,
 * and temporary tactical/strength caches from memory and storage.
 */
export function purgeCompletedSeasonSimulationData(
  completedSeasonYear: string,
  newSeasonYear?: string
): { removedKeys: string[]; cachesCleared: boolean } {
  const removedKeys: string[] = [];

  // A. Invalidate in-memory tactical strength caches
  invalidateTeamStrengthCache();

  // B. Clean LocalStorage of prior completed seasons
  try {
    const storage = getSafeLocalStorage();
    if (storage) {
      // Find all keys for the completed season
      const keysToExamine: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k) keysToExamine.push(k);
      }

      const nextYearNum = newSeasonYear ? newSeasonYear.split('/')[0] : '';
      const compYearNum = completedSeasonYear.split('/')[0];

      keysToExamine.forEach((key) => {
        // A. NEVER remove domestic season qualification snapshots
        if (key.startsWith(CONTINENTAL_DOMESTIC_SNAPSHOTS_STORAGE_KEY_PREFIX)) {
          return;
        }

        // B. NEVER remove next-season squad registration data
        if (key.startsWith('CONTINENTAL_SQUAD_REGISTRATION_') && nextYearNum && key.includes(nextYearNum)) {
          return;
        }

        // C. NEVER remove next-season continental tournament states
        if (
          (key.startsWith(CONTINENTAL_STORAGE_PREFIX) || key.startsWith(SUPERCUP_STORAGE_PREFIX)) &&
          nextYearNum &&
          key.includes(nextYearNum)
        ) {
          return;
        }

        // D. Remove completed season world state key
        if (key === getActiveWorldSimulationKey(completedSeasonYear)) {
          storage.removeItem(key);
          removedKeys.push(key);
        } else if (
          key.startsWith(WORLD_STATE_STORAGE_KEY_PREFIX) &&
          newSeasonYear &&
          !key.includes(newSeasonYear.replace('/', '_'))
        ) {
          // Remove any other legacy or old season world simulation keys
          storage.removeItem(key);
          removedKeys.push(key);
        }

        // E. Remove completed season continental states (preserving next season)
        if (
          (key.startsWith(CONTINENTAL_STORAGE_PREFIX) || key.startsWith(SUPERCUP_STORAGE_PREFIX)) &&
          key.includes(compYearNum) &&
          (!nextYearNum || compYearNum !== nextYearNum)
        ) {
          storage.removeItem(key);
          removedKeys.push(key);
        }
      });
    }
  } catch (err) {
    console.warn('Error during seasonal storage purge:', err);
  }

  return {
    removedKeys,
    cachesCleared: true,
  };
}

/**
 * 3. REINITIALIZE PROFESSIONAL CLUBS & ROSTERS FROM AUTHORITATIVE TEAM EDITOR DATABASE
 * Rebuilds pristine squad structures, starting XIs, and tactical configurations.
 * Guarantees:
 * - Permanent Player IDs are strictly maintained (no duplicate/cloned/ghost players).
 * - A player belongs to strictly one club.
 * - Starting XI (slots 1-11) and Bench (slots 12-18) are resolved cleanly.
 */
export function reinitializeClubsAndSquadsForNewSeason(
  db?: LeagueDatabase
): { reinitializedCount: number; db: LeagueDatabase } {
  const currentDb = db || getCareerLeagueDatabase();
  let reinitializedCount = 0;

  // Track all registered player IDs to guarantee uniqueness
  const registeredPlayerIds = new Set<string>();

  Object.keys(currentDb.leagues || {}).forEach((leagueId) => {
    const teams = getSanitizedTeamsForLeague(leagueId, currentDb);
    teams.forEach((team: EditorTeamData) => {
      // Ensure team squad save file is sanitized and loaded from permanent data
      const ensured = ensureTeamSquadSaveFile(team);
      const squadSlots = ensured.squadSaveFile?.squad || [];

      // Validate player uniqueness across teams
      squadSlots.forEach((slot) => {
        if (slot.player && slot.player.id) {
          if (registeredPlayerIds.has(slot.player.id)) {
            // Player already belongs to another club: clear duplicate assignment
            slot.player = undefined;
          } else {
            registeredPlayerIds.add(slot.player.id);
          }
        }
      });

      reinitializedCount++;
    });
  });

  saveCareerLeagueDatabase(currentDb);
  return { reinitializedCount, db: currentDb };
}

export function preserveContinentalQualificationBeforeSeasonReset(
  completedSeasonYear: string,
  newSeasonYear: string,
  player: PlayerConfig | PlayerCardData,
  db?: LeagueDatabase
): void {
  try {
    const currentDb = db || getCareerLeagueDatabase();
    const nextSeasonNumericYear = parseInt(newSeasonYear.split('/')[0], 10) || 2027;

    // Build domestic snapshots from the completed world simulation state
    const completedWorldState = getWorldSimulationState(completedSeasonYear, currentDb, player as any);
    const snapshots = buildDomesticSeasonSnapshots(currentDb, completedWorldState);
    if (snapshots && snapshots.length > 0) {
      saveDomesticSeasonSnapshotsForNextSeason(nextSeasonNumericYear, snapshots);
    }

    // If player club is qualified, pre-initialize next season's continental tournament state
    const compId = (player as any).qualifiedContinentalCompId ||
      detectPlayerContinentalCompetition(player as PlayerConfig, currentDb);

    const federation = getClubFederation(player.countryCode, player.league, player.clubCountry);
    if (compId && isCompetitionValidForFederation(compId, federation)) {
      getOrInitContinentalStateForSeason(
        player as PlayerConfig,
        nextSeasonNumericYear,
        compId,
        currentDb
      );
    }
  } catch (err) {
    console.warn('Error preserving continental qualification before season reset:', err);
  }
}

/**
 * 4. RESET PLAYER CURRENT-SEASON ACTIVE STATISTICS
 * Resets the player's personal current-season statistical counters to 0
 * while keeping all permanent career summary history and trophies intact.
 */
export function resetPlayerSeasonalActiveStats(
  player: PlayerConfig | PlayerCardData,
  newSeasonYear: string,
  newAge: number
): PlayerConfig {
  const startYear = parseInt(newSeasonYear.split('/')[0], 10) || 2026;
  const newStartDate = `15 August ${startYear}`;

  const federation = getClubFederation(player.countryCode, player.league, player.clubCountry);
  const rawCompId = (player as any).qualifiedContinentalCompId;
  const validCompId = rawCompId && isCompetitionValidForFederation(rawCompId, federation) ? rawCompId : undefined;
  const validCompShort = (player as any).qualifiedContinental && isCompetitionValidForFederation(validCompId || '', federation)
    ? (player as any).qualifiedContinental
    : (validCompId === 'UEFA_CL' ? 'ucl' : validCompId === 'UEFA_EL' ? 'uel' : validCompId === 'UEFA_ECL' ? 'uecl' : validCompId === 'CONMEBOL_LIB' ? 'libertadores' : validCompId === 'CONMEBOL_SUD' ? 'sudamericana' : undefined);

  return {
    ...(player as PlayerConfig),
    age: newAge,
    calendarDate: newStartDate,
    currentSeason: Math.max(1, newAge - 9),
    currentWeek: 1,
    currentMonth: 8, // August
    seasonPhase: 'preseason',
    fitness: 100,
    staminaCurrent: 100,
    trainingProgress: 0,
    usedPreseasonTrain: false,
    usedMidseasonTrain: false,
    // Strictly preserve continental qualification only if valid for current club's federation
    qualifiedContinental: validCompShort,
    qualifiedContinentalCompId: validCompId,
    previousLeagueFinish: (player as any).previousLeagueFinish,
    leagueFinishRank: (player as any).leagueFinishRank,
    lastSeasonRank: (player as any).lastSeasonRank,
    isDomesticCupWinner: (player as any).isDomesticCupWinner,
  } as any as PlayerCardData;
}

/**
 * 5. MASTER SEASON TRANSITION ORCHESTRATOR
 * Executes the complete seasonal cleanup and reinitialization pipeline:
 * FINISH SEASON → SAVE PERMANENT HISTORY → DELETE TEMPORARY DATA →
 * CLEAR SIMULATION CACHE → LOAD AUTHORITATIVE SQUADS → CREATE NEW SEASON STATE → START NEW SEASON
 */
export function executeSeasonTransitionAndCleanup(
  options: FinalizeSeasonOptions
): SeasonTransitionResult {
  const { completedSeasonYear, newSeasonYear, player, accounting, seasonRecord } = options;

  // Step 1: Save permanent career summary history
  const updatedHistory = preservePermanentCareerHistory(player, seasonRecord);

  // Step 1.5: Preserve January–June professional calendar-year data before seasonal purge
  // The European season ends in June, while yearly awards are in December.
  // We preserve January–June professional data in YEARLY AWARD DATA so it survives the June season reset.
  preserveCalendarYearDataBeforeSeasonReset(completedSeasonYear, player);

  // Step 1.6: Preserve European continental qualification and domestic snapshots for the upcoming season
  preserveContinentalQualificationBeforeSeasonReset(completedSeasonYear, newSeasonYear, player);

  // Step 2: Purge completed season simulation data & flush memory caches
  const purgeResult = purgeCompletedSeasonSimulationData(completedSeasonYear, newSeasonYear);

  // Step 3: Reinitialize club squads from authoritative Team Editor database
  const { reinitializedCount, db: authoritativeDb } = reinitializeClubsAndSquadsForNewSeason();

  // Step 4: Reset player active seasonal stats for the new season
  const targetAge = player.age || 10;
  const updatedPlayer = resetPlayerSeasonalActiveStats(
    {
      ...player,
      careerHistory: updatedHistory,
    },
    newSeasonYear,
    targetAge
  );

  // Step 5: Create fresh, clean active World Simulation state for the new season
  const newWorldState = initializeWorldSimulationState(
    newSeasonYear,
    authoritativeDb,
    updatedPlayer as unknown as PlayerCardData
  );
  saveWorldSimulationState(newWorldState);

  return {
    updatedPlayer,
    updatedAccounting: accounting,
    newWorldState,
    memoryCleanedSummary: {
      previousSeasonKeyRemoved: purgeResult.removedKeys.length > 0,
      temporaryMatchCachesCleared: purgeResult.removedKeys.length,
      teamStrengthCacheInvalidated: purgeResult.cachesCleared,
      rostersReinitializedCount: reinitializedCount,
      timestamp: new Date().toISOString(),
    },
  };
}
