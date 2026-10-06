import {
  OptionFile,
  OptionFileMetadata,
  OptionFileManagerProfile,
  OptionFileValidationResult,
  OptionFileValidationIssue,
} from '../types/optionFile';
import { PlayerCardData, CustomCard, CustomCardCategory } from '../types';
import { EditorTeamData, LeagueData, LeagueDatabase } from '../types/leagueEditor';
import { CompetitionData, GlobalCompetitionsDatabase } from '../types/competitionEditor';
import { safeGetItem, safeSetItem, safeRemoveItem } from './storageCleaner';
import { DEFAULT_LEAGUE_DATABASE } from '../data/defaultLeagues';
import { TEMPORARY_CONTINENTAL_CLUBS } from '../data/temporaryContinentalClubs';
import { INITIAL_GLOBAL_COMPETITIONS_DATABASE } from '../data/defaultCompetitions';
import { getAllDefaultCustomCards } from './cardDatabaseSystem';
import { attachCardTranslations } from './cardTranslationsDatabase';
import { PRESET_PLAYERS } from '../constants';
import { createFirstLegendPlayer } from './legendCareerSystem';
import { getProfileStorageKey } from './profileSystem';
import { useEffect, useState } from 'react';

export const OPTION_FILE_STORAGE_KEY = 'FOOTBALL_CAREER_OPTION_FILE_V1';
export const OPTION_FILE_UPDATE_EVENT = 'option_file_updated';

let cachedOptionFile: OptionFile | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('drawstar_profile_switched', () => {
    cachedOptionFile = null;
    const of = getOptionFile();
    window.dispatchEvent(new CustomEvent(OPTION_FILE_UPDATE_EVENT, { detail: of }));
  });
}

/**
 * Generates the factory default Option File consolidating all standard game data.
 */
export function generateDefaultOptionFile(): OptionFile {
  const timestamp = new Date().toISOString();

  // 1. Cards
  const defaultCardsList = getAllDefaultCustomCards();
  const cardsMap: Record<string, CustomCard> = {};
  defaultCardsList.forEach((c) => {
    cardsMap[c.id] = c;
  });

  // 2. Competitions
  const competitionsMap: Record<string, CompetitionData> = {
    ...INITIAL_GLOBAL_COMPETITIONS_DATABASE.competitions,
  };

  // 3. Leagues
  const leaguesMap: Record<string, LeagueData> = {
    ...DEFAULT_LEAGUE_DATABASE.leagues,
  };

  // 4. Teams (League teams + Continental clubs)
  const teamsMap: Record<string, EditorTeamData> = {
    ...DEFAULT_LEAGUE_DATABASE.teams,
    ...TEMPORARY_CONTINENTAL_CLUBS,
  };

  // 5. Players & Managers extracted from presets, legends, and squads
  const playersMap: Record<string, PlayerCardData> = {};
  const managersMap: Record<string, OptionFileManagerProfile> = {};

  // Add default preset players
  PRESET_PLAYERS.forEach((p) => {
    playersMap[p.id] = { ...p };
  });

  // Add first legend
  try {
    const legendPlayer = createFirstLegendPlayer();
    playersMap[legendPlayer.id] = legendPlayer;
  } catch (e) {
    console.warn('Failed to build default legend player into Option File:', e);
  }

  // Extract squad players & managers from teams
  Object.values(teamsMap).forEach((team) => {
    if (team.manager) {
      const mgrId = `mgr-${team.id}`;
      managersMap[mgrId] = {
        id: mgrId,
        name: team.manager.name,
        nationality: team.manager.nationality,
        age: team.manager.age || 45,
        currentTeamId: team.id,
        preferredFormation: team.manager.primaryTactic?.formation || '4-3-3',
        tacticalStyle: team.manager.primaryTactic?.style || 'possession',
        reputation: team.reputation || 70,
        experience: 10,
        primaryTactic: team.manager.primaryTactic,
        secondaryTactic: team.manager.secondaryTactic,
      };
    }

    if (team.squadSaveFile) {
      const groups = ['squad', 'reserves', 'u20', 'u17'] as const;
      groups.forEach((groupKey) => {
        const slots = team.squadSaveFile?.[groupKey];
        if (Array.isArray(slots)) {
          slots.forEach((slot, idx) => {
            if (slot && slot.player) {
              const p = slot.player;
              const pid = p.id || `p-${team.id}-${groupKey}-${slot.slotNumber || idx + 1}`;
              playersMap[pid] = {
                ...p,
                id: pid,
                club: team.name,
                clubCountry: team.countryName || 'Unknown',
                league: team.leagueId || 'Unassigned',
              };
            }
          });
        }
      });
    }
  });

  const metadata: OptionFileMetadata = {
    id: 'default-option-file-v1',
    name: 'Official Option File',
    description: 'Unified single-source-of-truth database for all players, teams, leagues, competitions, cards, and managers.',
    author: 'Become A Legend Studio',
    version: '1.0.0',
    schemaVersion: 1,
    createdAt: timestamp,
    lastUpdated: timestamp,
    gameVersion: '2026.1',
  };

  return {
    metadata,
    players: playersMap,
    teams: teamsMap,
    competitions: competitionsMap,
    leagues: leaguesMap,
    cards: cardsMap,
    managers: managersMap,
  };
}

/**
 * Validates an Option File for ID uniqueness and reference integrity.
 */
export function validateOptionFile(of: OptionFile): OptionFileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const issues: OptionFileValidationIssue[] = [];

  if (!of) {
    return {
      isValid: false,
      errors: ['Option File is null or undefined'],
      warnings: [],
      issues: [{ type: 'error', entityType: 'metadata', entityId: 'root', message: 'Option File root object missing' }],
      stats: { totalPlayers: 0, totalTeams: 0, totalCompetitions: 0, totalLeagues: 0, totalCards: 0, totalManagers: 0, cardsByCategory: {} },
    };
  }

  // 1. Metadata check
  if (!of.metadata || !of.metadata.name) {
    errors.push('Option File metadata or name is missing');
    issues.push({ type: 'error', entityType: 'metadata', entityId: 'meta', message: 'Metadata name is required' });
  }

  // 2. Duplicate Player IDs Check
  const playerIds = new Set<string>();
  Object.entries(of.players || {}).forEach(([key, p]) => {
    if (!p.id) {
      errors.push(`Player with key "${key}" is missing an ID`);
      issues.push({ type: 'error', entityType: 'player', entityId: key, message: 'Missing Player ID' });
    } else if (playerIds.has(p.id)) {
      errors.push(`Duplicate Player ID detected: "${p.id}"`);
      issues.push({ type: 'error', entityType: 'player', entityId: p.id, message: `Duplicate Player ID: ${p.id}` });
    } else {
      playerIds.add(p.id);
    }
  });

  // 3. Duplicate Team IDs Check
  const teamIds = new Set<string>();
  Object.entries(of.teams || {}).forEach(([key, t]) => {
    if (!t.id) {
      errors.push(`Team with key "${key}" is missing an ID`);
      issues.push({ type: 'error', entityType: 'team', entityId: key, message: 'Missing Team ID' });
    } else if (teamIds.has(t.id)) {
      errors.push(`Duplicate Team ID detected: "${t.id}"`);
      issues.push({ type: 'error', entityType: 'team', entityId: t.id, message: `Duplicate Team ID: ${t.id}` });
    } else {
      teamIds.add(t.id);
    }
  });

  // 4. Duplicate League IDs Check
  const leagueIds = new Set<string>();
  Object.entries(of.leagues || {}).forEach(([key, l]) => {
    if (!l.id) {
      errors.push(`League with key "${key}" is missing an ID`);
      issues.push({ type: 'error', entityType: 'league', entityId: key, message: 'Missing League ID' });
    } else if (leagueIds.has(l.id)) {
      errors.push(`Duplicate League ID detected: "${l.id}"`);
      issues.push({ type: 'error', entityType: 'league', entityId: l.id, message: `Duplicate League ID: ${l.id}` });
    } else {
      leagueIds.add(l.id);
    }
  });

  // 5. Duplicate Competition IDs Check
  const compIds = new Set<string>();
  Object.entries(of.competitions || {}).forEach(([key, c]) => {
    if (!c.id) {
      errors.push(`Competition with key "${key}" is missing an ID`);
      issues.push({ type: 'error', entityType: 'competition', entityId: key, message: 'Missing Competition ID' });
    } else if (compIds.has(c.id)) {
      errors.push(`Duplicate Competition ID detected: "${c.id}"`);
      issues.push({ type: 'error', entityType: 'competition', entityId: c.id, message: `Duplicate Competition ID: ${c.id}` });
    } else {
      compIds.add(c.id);
    }
  });

  // 6. Duplicate Card IDs Check
  const cardIds = new Set<string>();
  const cardsByCategory: Record<string, number> = {};
  Object.entries(of.cards || {}).forEach(([key, c]) => {
    if (!c.id) {
      errors.push(`Card with key "${key}" is missing an ID`);
      issues.push({ type: 'error', entityType: 'card', entityId: key, message: 'Missing Card ID' });
    } else if (cardIds.has(c.id)) {
      errors.push(`Duplicate Card ID detected: "${c.id}"`);
      issues.push({ type: 'error', entityType: 'card', entityId: c.id, message: `Duplicate Card ID: ${c.id}` });
    } else {
      cardIds.add(c.id);
    }

    if (c.category) {
      cardsByCategory[c.category] = (cardsByCategory[c.category] || 0) + 1;
    } else {
      warnings.push(`Card "${c.name || key}" has no assigned category`);
      issues.push({ type: 'warning', entityType: 'card', entityId: c.id || key, message: 'Card category undefined' });
    }

    if (!c.modifiers || c.modifiers.length === 0) {
      warnings.push(`Card "${c.name || key}" has 0 modifiers`);
      issues.push({ type: 'warning', entityType: 'card', entityId: c.id || key, message: 'Card has no active stat/perk modifiers' });
    }
  });

  // 7. Team -> League reference integrity check
  Object.values(of.teams || {}).forEach((t) => {
    if (t.leagueId && !leagueIds.has(t.leagueId) && !t.isTemporaryContinentalClub && !t.isCupOnly && !t.isStateChampionshipsOnly) {
      warnings.push(`Team "${t.name}" references non-existent League ID: "${t.leagueId}"`);
      issues.push({ type: 'warning', entityType: 'team', entityId: t.id, message: `Unknown leagueId "${t.leagueId}"` });
    }
  });

  // 8. League -> Team references check
  Object.values(of.leagues || {}).forEach((l) => {
    (l.teamIds || []).forEach((tid) => {
      if (!teamIds.has(tid)) {
        warnings.push(`League "${l.name}" contains teamId "${tid}" which does not exist in Teams table`);
        issues.push({ type: 'warning', entityType: 'league', entityId: l.id, message: `Missing referenced teamId: ${tid}` });
      }
    });
  });

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    issues,
    stats: {
      totalPlayers: playerIds.size,
      totalTeams: teamIds.size,
      totalCompetitions: compIds.size,
      totalLeagues: leagueIds.size,
      totalCards: cardIds.size,
      totalManagers: Object.keys(of.managers || {}).length,
      cardsByCategory,
    },
  };
}

/**
 * Migration helper: Reads legacy storage keys (if present) and consolidates them into the Option File.
 */
function migrateLegacyStorageToOptionFile(baseOptionFile: OptionFile): OptionFile {
  const merged: OptionFile = {
    ...baseOptionFile,
    metadata: {
      ...baseOptionFile.metadata,
      lastUpdated: new Date().toISOString(),
    },
    players: { ...baseOptionFile.players },
    teams: { ...baseOptionFile.teams },
    competitions: { ...baseOptionFile.competitions },
    leagues: { ...baseOptionFile.leagues },
    cards: { ...baseOptionFile.cards },
    managers: { ...baseOptionFile.managers },
  };

  // 1. Migrate custom cards from 'footballer_custom_cards_v2'
  try {
    const savedCards = safeGetItem('footballer_custom_cards_v2');
    if (savedCards) {
      const parsedCards = JSON.parse(savedCards);
      if (Array.isArray(parsedCards) && parsedCards.length > 0) {
        parsedCards.forEach((c: CustomCard) => {
          if (c && c.id) {
            merged.cards[c.id] = c;
          }
        });
      }
    }
  } catch (e) {
    console.warn('Migration: cards load skipped:', e);
  }

  // 2. Migrate leagues and teams from 'FOOTBALL_CAREER_LEAGUE_DB_V7'
  try {
    const savedLeagueDb = safeGetItem('FOOTBALL_CAREER_LEAGUE_DB_V7');
    if (savedLeagueDb) {
      const parsedLeagueDb = JSON.parse(savedLeagueDb) as LeagueDatabase;
      if (parsedLeagueDb.leagues) {
        Object.entries(parsedLeagueDb.leagues).forEach(([id, l]) => {
          merged.leagues[id] = l;
        });
      }
      if (parsedLeagueDb.teams) {
        Object.entries(parsedLeagueDb.teams).forEach(([id, t]) => {
          merged.teams[id] = t;
        });
      }
    }
  } catch (e) {
    console.warn('Migration: league db load skipped:', e);
  }

  // 3. Migrate competitions from 'footballer_career_global_competitions_v3_5'
  try {
    const savedComps = safeGetItem('footballer_career_global_competitions_v3_5');
    if (savedComps) {
      const parsedComps = JSON.parse(savedComps) as GlobalCompetitionsDatabase;
      if (parsedComps.competitions) {
        Object.entries(parsedComps.competitions).forEach(([id, c]) => {
          merged.competitions[id] = c;
        });
      }
    }
  } catch (e) {
    console.warn('Migration: competitions db load skipped:', e);
  }

  return merged;
}

/**
 * Gets the current Option File (Single Source of Truth).
 * Automatically loads from LocalStorage or builds and migrates if not yet initialized.
 */
export function getOptionFile(): OptionFile {
  if (cachedOptionFile) {
    return cachedOptionFile;
  }

  const key = getProfileStorageKey(OPTION_FILE_STORAGE_KEY);
  try {
    const raw = safeGetItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as OptionFile;
      if (parsed && parsed.metadata && parsed.players && parsed.teams && parsed.leagues && parsed.cards) {
        // Ensure all cards in the Option File have complete translations across all languages
        let updatedAny = false;
        Object.values(parsed.cards).forEach((c) => {
          if (!c.translations || Object.keys(c.translations).length < 5) {
            parsed.cards[c.id] = attachCardTranslations(c);
            updatedAny = true;
          }
        });
        if (updatedAny) {
          cachedOptionFile = parsed;
          safeSetItem(key, JSON.stringify(parsed));
        } else {
          cachedOptionFile = parsed;
        }
        return cachedOptionFile;
      }
    }
  } catch (err) {
    console.error('Error reading Option File from storage:', err);
  }

  // First time initialization: generate default and migrate any legacy data
  const defaultOptionFile = generateDefaultOptionFile();
  const migrated = migrateLegacyStorageToOptionFile(defaultOptionFile);
  cachedOptionFile = migrated;

  try {
    safeSetItem(key, JSON.stringify(migrated));
  } catch (err) {
    console.warn('Could not persist initial Option File:', err);
  }

  return cachedOptionFile;
}

/**
 * Saves the Option File to LocalStorage and notifies the entire application.
 * Also synchronizes backward-compatible legacy storage keys so older code never desyncs.
 */
export function saveOptionFile(optionFile: OptionFile): void {
  try {
    const updated: OptionFile = {
      ...optionFile,
      metadata: {
        ...optionFile.metadata,
        lastUpdated: new Date().toISOString(),
      },
    };

    cachedOptionFile = updated;
    const key = getProfileStorageKey(OPTION_FILE_STORAGE_KEY);
    safeSetItem(key, JSON.stringify(updated));

    // Backward compatibility synchronization
    try {
      safeSetItem(getProfileStorageKey('footballer_custom_cards_v2'), JSON.stringify(Object.values(updated.cards)));
    } catch {
      // ignore
    }

    try {
      const compactTeams: Record<string, any> = {};
      Object.entries(updated.teams || {}).forEach(([id, t]) => {
        compactTeams[id] = t;
      });
      safeSetItem(
        getProfileStorageKey('FOOTBALL_CAREER_LEAGUE_DB_V7'),
        JSON.stringify({
          version: '7.0',
          lastUpdated: updated.metadata.lastUpdated,
          leagues: updated.leagues,
          teams: compactTeams,
        })
      );
    } catch {
      // ignore
    }

    try {
      safeSetItem(
        getProfileStorageKey('footballer_career_global_competitions_v3_5'),
        JSON.stringify({
          version: '3.5',
          lastUpdated: updated.metadata.lastUpdated,
          competitions: updated.competitions,
        })
      );
    } catch {
      // ignore
    }

    // Broadcast update event across application
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(OPTION_FILE_UPDATE_EVENT, { detail: updated })
      );
    }
  } catch (err) {
    console.error('Failed to save Option File:', err);
  }
}

/**
 * Resets Option File completely back to default official database.
 */
export function resetOptionFileToDefaults(): OptionFile {
  const fresh = generateDefaultOptionFile();
  saveOptionFile(fresh);
  return fresh;
}

/**
 * Exports Option File as a downloadable JSON file.
 */
export function exportOptionFileJSON(optionFile?: OptionFile, filename?: string): void {
  const of = optionFile || getOptionFile();
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = filename || `OptionFile_${of.metadata.name.replace(/\s+/g, '_')}_${dateStr}.json`;

  const jsonStr = JSON.stringify(of, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports an external Option File JSON string with schema validation.
 */
export function importOptionFileJSON(jsonStr: string): {
  success: boolean;
  message: string;
  validation?: OptionFileValidationResult;
  optionFile?: OptionFile;
} {
  try {
    const parsed = JSON.parse(jsonStr) as OptionFile;

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON file: Root object is missing.' };
    }

    if (!parsed.players || !parsed.teams || !parsed.leagues || !parsed.competitions || !parsed.cards) {
      return {
        success: false,
        message: 'Option File format incompatible: Required tables (players, teams, leagues, competitions, cards) are incomplete.',
      };
    }

    const validation = validateOptionFile(parsed);
    if (!validation.isValid) {
      return {
        success: false,
        message: `Validation failed with ${validation.errors.length} error(s): ${validation.errors.slice(0, 3).join(', ')}`,
        validation,
      };
    }

    // Save and commit
    saveOptionFile(parsed);

    return {
      success: true,
      message: `Option File "${parsed.metadata.name}" successfully imported (${validation.stats.totalPlayers} players, ${validation.stats.totalTeams} teams, ${validation.stats.totalCards} cards)!`,
      validation,
      optionFile: parsed,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to parse JSON file: ${err?.message || 'Syntax error'}`,
    };
  }
}

// -------------------------------------------------------------
// GRANULAR CRUD HELPERS (ALL PASS THROUGH THE OPTION FILE)
// -------------------------------------------------------------

export function getOptionFileCards(category?: CustomCardCategory): CustomCard[] {
  const of = getOptionFile();
  const allCards = Object.values(of.cards || {});
  if (!category) return allCards;
  return allCards.filter((c) => c.category === category);
}

export function saveOptionFileCard(card: CustomCard): void {
  const of = getOptionFile();
  of.cards[card.id] = card;
  saveOptionFile(of);
}

export function deleteOptionFileCard(cardId: string): void {
  const of = getOptionFile();
  delete of.cards[cardId];
  saveOptionFile(of);
}

export function saveAllOptionFileCards(cards: CustomCard[]): void {
  const of = getOptionFile();
  const newMap: Record<string, CustomCard> = {};
  cards.forEach((c) => {
    newMap[c.id] = c;
  });
  of.cards = newMap;
  saveOptionFile(of);
}

export function getOptionFilePlayer(playerId: string): PlayerCardData | undefined {
  const of = getOptionFile();
  return of.players[playerId];
}

export function saveOptionFilePlayer(player: PlayerCardData): void {
  const of = getOptionFile();
  of.players[player.id] = player;
  saveOptionFile(of);
}

export function getOptionFileTeam(teamId: string): EditorTeamData | undefined {
  const of = getOptionFile();
  return of.teams[teamId];
}

export function saveOptionFileTeam(team: EditorTeamData): void {
  const of = getOptionFile();
  of.teams[team.id] = team;
  saveOptionFile(of);
}

export function getOptionFileLeague(leagueId: string): LeagueData | undefined {
  const of = getOptionFile();
  return of.leagues[leagueId];
}

export function saveOptionFileLeague(league: LeagueData): void {
  const of = getOptionFile();
  of.leagues[league.id] = league;
  saveOptionFile(of);
}

export function getOptionFileCompetition(compId: string): CompetitionData | undefined {
  const of = getOptionFile();
  return of.competitions[compId];
}

export function saveOptionFileCompetition(comp: CompetitionData): void {
  const of = getOptionFile();
  of.competitions[comp.id] = comp;
  saveOptionFile(of);
}

/**
 * React Hook that subscribes to Option File changes and provides the live Option File instance.
 */
export function useOptionFile(): {
  optionFile: OptionFile;
  validation: OptionFileValidationResult;
  save: (of: OptionFile) => void;
  reset: () => void;
  exportJSON: () => void;
  importJSON: (jsonStr: string) => { success: boolean; message: string; validation?: OptionFileValidationResult };
} {
  const [optionFile, setOptionFileState] = useState<OptionFile>(() => getOptionFile());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<OptionFile>;
      if (customEvent.detail) {
        setOptionFileState(customEvent.detail);
      } else {
        setOptionFileState(getOptionFile());
      }
    };

    window.addEventListener(OPTION_FILE_UPDATE_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(OPTION_FILE_UPDATE_EVENT, handleUpdate);
    };
  }, []);

  const validation = validateOptionFile(optionFile);

  return {
    optionFile,
    validation,
    save: (of: OptionFile) => saveOptionFile(of),
    reset: () => {
      const fresh = resetOptionFileToDefaults();
      setOptionFileState(fresh);
    },
    exportJSON: () => exportOptionFileJSON(optionFile),
    importJSON: (jsonStr: string) => {
      const res = importOptionFileJSON(jsonStr);
      if (res.success && res.optionFile) {
        setOptionFileState(res.optionFile);
      }
      return res;
    },
  };
}
