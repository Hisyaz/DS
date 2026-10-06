import {
  GlobalCompetitionsDatabase,
  CompetitionData,
  CompetitionValidationResult,
  ContinentalFederation,
} from '../types/competitionEditor';
import { INITIAL_GLOBAL_COMPETITIONS_DATABASE } from '../data/defaultCompetitions';
import { LeagueDatabase } from '../types/leagueEditor';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { migrateLeagueDbToGlobalCompetitions } from './competitionMigration';
import { safeSetItem, safeGetItem, safeRemoveItem } from './storageCleaner';
import { getOptionFile, saveOptionFile } from './optionFileSystem';

const COMPETITIONS_STORAGE_KEY = 'footballer_career_global_competitions_v3_5';

let cachedCompetitionsDb: GlobalCompetitionsDatabase | null = null;

/**
 * Retrieves the Global Competitions Database from LocalStorage or initial defaults,
 * automatically migrating any existing LeagueDatabase entries.
 */
export function getGlobalCompetitionsDatabase(): GlobalCompetitionsDatabase {
  if (cachedCompetitionsDb) {
    return cachedCompetitionsDb;
  }
  let baseDb = INITIAL_GLOBAL_COMPETITIONS_DATABASE;
  try {
    const stored = safeGetItem(COMPETITIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as GlobalCompetitionsDatabase;
      if (parsed && parsed.competitions && typeof parsed.competitions === 'object') {
        // Merge defaults to ensure no newly added default competitions are missed
        baseDb = {
          ...parsed,
          competitions: {
            ...INITIAL_GLOBAL_COMPETITIONS_DATABASE.competitions,
            ...parsed.competitions,
          },
        };
      }
    }
  } catch (err) {
    console.error('Failed to load global competitions database from storage:', err);
  }

  // Automatically migrate/merge existing LeagueDatabase entries into GlobalCompetitionsDatabase
  try {
    const leagueDb = getLeagueDatabase();
    cachedCompetitionsDb = migrateLeagueDbToGlobalCompetitions(leagueDb, baseDb);
    return cachedCompetitionsDb;
  } catch (e) {
    console.warn('League database migration skipped:', e);
    cachedCompetitionsDb = baseDb;
    return cachedCompetitionsDb;
  }
}

/**
 * Saves the Global Competitions Database to LocalStorage.
 */
export function saveGlobalCompetitionsDatabase(
  db: GlobalCompetitionsDatabase
): void {
  try {
    const updatedDb: GlobalCompetitionsDatabase = {
      ...db,
      lastUpdated: new Date().toISOString(),
    };
    cachedCompetitionsDb = updatedDb;
    safeSetItem(COMPETITIONS_STORAGE_KEY, JSON.stringify(updatedDb));

    // Synchronize to unified Option File
    try {
      const of = getOptionFile();
      of.competitions = updatedDb.competitions;
      saveOptionFile(of);
    } catch (e) {
      console.warn('Option file sync from competitions database skipped:', e);
    }
  } catch (err) {
    console.warn('Failed to save global competitions database:', err);
  }
}

/**
 * Resets the Global Competitions Database back to factory defaults.
 */
export function resetGlobalCompetitionsDatabase(): GlobalCompetitionsDatabase {
  try {
    safeRemoveItem(COMPETITIONS_STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing storage:', err);
  }
  cachedCompetitionsDb = INITIAL_GLOBAL_COMPETITIONS_DATABASE;
  return INITIAL_GLOBAL_COMPETITIONS_DATABASE;
}

/**
 * Exports the Global Competitions Database to a downloadable JSON file.
 */
export function exportGlobalCompetitionsJSON(
  db: GlobalCompetitionsDatabase,
  fileName: string = 'global_competitions_database.json'
): void {
  const jsonStr = JSON.stringify(db, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Thorough Schema & Integrity Validation for importing Global Competitions.
 */
export function validateGlobalCompetitionsDatabase(
  importedObj: any,
  leagueDb?: LeagueDatabase
): CompetitionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!importedObj || typeof importedObj !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid file format: Import data must be a valid JSON object.'],
      warnings: [],
    };
  }

  const compsObj = importedObj.competitions;
  if (!compsObj || typeof compsObj !== 'object' || Array.isArray(compsObj)) {
    return {
      isValid: false,
      errors: [
        'Missing required "competitions" dictionary object in imported JSON.',
      ],
      warnings: [],
    };
  }

  const validFederations: ContinentalFederation[] = [
    'UEFA',
    'CONMEBOL',
    'CONCACAF',
    'CAF',
    'AFC',
    'OFC',
    'FIFA',
  ];

  let nationalCount = 0;
  let continentalCount = 0;
  let internationalCount = 0;

  const validLeagueIds = leagueDb ? Object.keys(leagueDb.leagues) : [];
  const validTeamIds = leagueDb ? Object.keys(leagueDb.teams) : [];

  Object.entries(compsObj).forEach(([idKey, compObj]: [string, any]) => {
    if (!compObj || typeof compObj !== 'object') {
      errors.push(`Competition key "${idKey}" contains an invalid non-object payload.`);
      return;
    }

    // 1. Competition ID Validation
    if (!compObj.id || typeof compObj.id !== 'string') {
      errors.push(`Competition "${idKey}" is missing a valid string "id".`);
    } else if (compObj.id !== idKey) {
      warnings.push(
        `Competition key mismatch: dictionary key "${idKey}" differs from internal id "${compObj.id}".`
      );
    }

    // 2. Name & Category
    if (!compObj.name || typeof compObj.name !== 'string') {
      errors.push(`Competition "${idKey}" is missing a valid "name".`);
    }

    if (!['national', 'continental', 'international'].includes(compObj.category)) {
      errors.push(
        `Competition "${idKey}" has invalid category "${compObj.category}". Expected national, continental, or international.`
      );
    } else {
      if (compObj.category === 'national') nationalCount++;
      if (compObj.category === 'continental') continentalCount++;
      if (compObj.category === 'international') internationalCount++;
    }

    // 3. Federation
    if (compObj.federationId && !validFederations.includes(compObj.federationId)) {
      warnings.push(
        `Competition "${idKey}" references unrecognized federation "${compObj.federationId}".`
      );
    }

    // 4. Qualification Rules Validation
    if (compObj.qualificationRules) {
      if (!Array.isArray(compObj.qualificationRules)) {
        errors.push(`Competition "${idKey}" "qualificationRules" must be an array.`);
      } else {
        compObj.qualificationRules.forEach((rule: any, idx: number) => {
          if (!rule.id) {
            errors.push(
              `Competition "${idKey}" qualification rule #${idx + 1} is missing an "id".`
            );
          }
          if (!rule.sourceType) {
            errors.push(
              `Competition "${idKey}" qualification rule #${idx + 1} is missing "sourceType".`
            );
          }
          if (!rule.sourceId) {
            warnings.push(
              `Competition "${idKey}" qualification rule #${idx + 1} is missing "sourceId".`
            );
          } else if (
            leagueDb &&
            rule.sourceType === 'league' &&
            !validLeagueIds.includes(rule.sourceId)
          ) {
            warnings.push(
              `Competition "${idKey}" qualification rule refers to unknown League ID "${rule.sourceId}".`
            );
          }
        });
      }
    }

    // 5. Stage System Validation
    if (compObj.stages) {
      if (!Array.isArray(compObj.stages)) {
        errors.push(`Competition "${idKey}" "stages" must be an array.`);
      } else {
        compObj.stages.forEach((stg: any, sIdx: number) => {
          if (!stg.id || !stg.name || !stg.stageType) {
            errors.push(
              `Competition "${idKey}" stage #${sIdx + 1} requires "id", "name", and "stageType".`
            );
          }
        });
      }
    }

    // 6. Participating Team IDs Validation
    if (compObj.participatingTeamIds && Array.isArray(compObj.participatingTeamIds)) {
      if (leagueDb) {
        compObj.participatingTeamIds.forEach((tId: string) => {
          if (!validTeamIds.includes(tId)) {
            warnings.push(
              `Competition "${idKey}" references Team ID "${tId}" which does not exist in the active Team Database.`
            );
          }
        });
      }
    }
  });

  const totalCompetitions = Object.keys(compsObj).length;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalCompetitions,
      nationalCount,
      continentalCount,
      internationalCount,
    },
  };
}
