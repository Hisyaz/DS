import { LeagueDatabase, LeagueData, EditorTeamData, CompetitionTrophyConfig, IndividualAwardsConfig } from '../types/leagueEditor';
import { DEFAULT_LEAGUE_DATABASE } from '../data/defaultLeagues';
import { TEMPORARY_CONTINENTAL_CLUBS } from '../data/temporaryContinentalClubs';
import { createDefaultManager } from './tacticalSystem';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';
import { ensureTeamStadium, autoAssignTeamKeyRoles } from './stadiumAndKeyRoleSystem';
import { ensureTeamFinances } from './clubEconomySystem';
import { safeSetItem, safeGetItem } from './storageCleaner';
import { sanitizeEntireLeagueDatabase } from './leagueSanitizer';
import { autoPickBestStartingXIAndSubs } from './startingXISystem';
import { getOptionFile, saveOptionFile } from './optionFileSystem';

const STORAGE_KEY = 'FOOTBALL_CAREER_LEAGUE_DB_V7';

let cachedLeagueDb: LeagueDatabase | null = null;

/**
 * Creates a deep clone of a LeagueDatabase instance to ensure total runtime isolation.
 */
export function cloneLeagueDatabase(db: LeagueDatabase): LeagueDatabase {
  return JSON.parse(JSON.stringify(db));
}

export function isLeagueProfessional(league: LeagueData): boolean {
  if (league.isStateChampionshipsOnly || league.isCupOnly || league.divisionTier === 'state_only' || league.id === 'brazil_state_only') {
    return false;
  }
  if (league.isProfessionalLeague !== undefined) {
    return league.isProfessionalLeague;
  }
  return league.divisionTier !== 'youth';
}

export function getDefaultNewspaperName(countryCode: string, tier: string): string {
  if (countryCode === 'ENG') return tier === '1st' ? 'The Daily Football' : 'The Championship Times';
  if (countryCode === 'FR') return tier === '1st' ? 'Le Journal du Football' : 'France Foot Express';
  if (countryCode === 'ESP') return tier === '1st' ? 'Marca' : 'Diario Deportivo';
  if (countryCode === 'ARG') return tier === '1st' ? 'Olé' : 'El Gráfico';
  if (countryCode === 'BRA') return tier === '1st' ? 'Lance!' : 'Gazeta Esportiva';
  return 'Global Football Gazette';
}

export function getDefaultChampionshipTrophy(leagueName: string): CompetitionTrophyConfig {
  return {
    name: `${leagueName} Championship Trophy`,
    metalTone: 'gold',
    iconType: 'league',
    ribbonColor: '#2563eb',
    shape: 'tower',
    baseDesign: 'marble_black',
    engravingText: `${leagueName.toUpperCase()} CHAMPIONS`,
    details: 'Awarded to the official league champion team at the end of the season.',
  };
}

export function getDefaultIndividualAwards(leagueName: string): IndividualAwardsConfig {
  return {
    topGoalscorer: {
      id: 'topGoalscorer',
      enabled: true,
      awardName: `${leagueName} Golden Boot`,
      trophy: {
        name: `${leagueName} Golden Boot`,
        metalTone: 'gold',
        iconType: 'golden-boot',
        ribbonColor: '#eab308',
        shape: 'boot',
        baseDesign: 'mahogany_wood',
        engravingText: 'TOP GOALSCORER',
        details: 'Awarded to the player with the most goals scored.',
      },
    },
    topAssist: {
      id: 'topAssist',
      enabled: true,
      awardName: `${leagueName} Playmaker Trophy`,
      trophy: {
        name: `${leagueName} Top Assist Provider Trophy`,
        metalTone: 'silver',
        iconType: 'statue',
        ribbonColor: '#3b82f6',
        shape: 'star',
        baseDesign: 'silver_pedestal',
        engravingText: 'TOP ASSIST PROVIDER',
        details: 'Awarded to the player with the highest assist tally.',
      },
    },
    bestPlayer: {
      id: 'bestPlayer',
      enabled: true,
      awardName: `${leagueName} Player of the Season`,
      trophy: {
        name: `${leagueName} Best Player Award`,
        metalTone: 'gold',
        iconType: 'ballon-or',
        ribbonColor: '#eab308',
        shape: 'globe',
        baseDesign: 'marble_black',
        engravingText: 'BEST PLAYER OF THE SEASON',
        details: 'Awarded to the player with the highest average match rating.',
      },
    },
    bestYoungPlayer: {
      id: 'bestYoungPlayer',
      enabled: true,
      awardName: `${leagueName} Best Young Player U-21`,
      trophy: {
        name: `${leagueName} Golden Boy U-21 Award`,
        metalTone: 'platinum',
        iconType: 'crown-cup',
        ribbonColor: '#06b6d4',
        shape: 'statue',
        baseDesign: 'glass_stand',
        engravingText: 'BEST YOUNG PLAYER U-21',
        details: 'Awarded to the best young talent under 21 years old.',
      },
    },
    bestManager: {
      id: 'bestManager',
      enabled: true,
      awardName: `${leagueName} Manager of the Season`,
      trophy: {
        name: `${leagueName} Manager of the Season Trophy`,
        metalTone: 'silver',
        iconType: 'whistle',
        ribbonColor: '#6366f1',
        shape: 'shield',
        baseDesign: 'mahogany_wood',
        engravingText: 'BEST MANAGER',
        details: 'Awarded to the top performing manager of the campaign.',
      },
    },
  };
}

export function normalizeLeagueDatabase(db: LeagueDatabase): LeagueDatabase {
  const normalizedLeagues: Record<string, LeagueData> = {};
  const normalizedTeams: Record<string, EditorTeamData> = {};

  Object.entries(db.leagues || {}).forEach(([id, l]) => {
    normalizedLeagues[id] = {
      ...l,
      newspaperName: l.newspaperName || getDefaultNewspaperName(l.countryCode, l.divisionTier),
      championshipTrophy: l.championshipTrophy || getDefaultChampionshipTrophy(l.name),
      individualAwards: l.individualAwards || getDefaultIndividualAwards(l.name),
    };
  });

  Object.entries(db.teams || {}).forEach(([id, t]) => {
    const withManager = {
      ...t,
      manager: t.manager || createDefaultManager(t.name, t.countryCode),
    };
    const squadEnsured = ensureTeamSquadSaveFile(withManager);
    const stadiumEnsured = {
      ...squadEnsured,
      stadium: ensureTeamStadium(squadEnsured),
    };
    const keyRolesEnsured = autoAssignTeamKeyRoles(stadiumEnsured);
    const withFinances = ensureTeamFinances(keyRolesEnsured);
    normalizedTeams[id] = autoPickBestStartingXIAndSubs(withFinances);
  });

  return {
    ...db,
    leagues: normalizedLeagues,
    teams: normalizedTeams,
  };
}

export function getLeagueDatabase(): LeagueDatabase {
  if (cachedLeagueDb) {
    return cachedLeagueDb;
  }
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) {
      cachedLeagueDb = normalizeLeagueDatabase(DEFAULT_LEAGUE_DATABASE);
      return cachedLeagueDb;
    }
    const parsed = JSON.parse(raw) as LeagueDatabase;
    if (!parsed || !parsed.leagues || !parsed.teams) {
      cachedLeagueDb = normalizeLeagueDatabase(DEFAULT_LEAGUE_DATABASE);
      return cachedLeagueDb;
    }

    // Merge default youth leagues and teams if missing
    let updated = false;
    const mergedLeagues = { ...parsed.leagues };
    const mergedTeams = { ...parsed.teams };

    Object.entries(DEFAULT_LEAGUE_DATABASE.leagues).forEach(([id, defaultLeague]) => {
      if (!mergedLeagues[id]) {
        mergedLeagues[id] = defaultLeague;
        updated = true;
      } else if (!mergedLeagues[id].teamIds || mergedLeagues[id].teamIds.length === 0) {
        mergedLeagues[id] = {
          ...mergedLeagues[id],
          teamIds: defaultLeague.teamIds || [],
        };
        updated = true;
      }
    });

    Object.entries(DEFAULT_LEAGUE_DATABASE.teams).forEach(([id, defaultTeam]) => {
      if (!mergedTeams[id]) {
        mergedTeams[id] = defaultTeam;
        updated = true;
      }
    });

    Object.entries(TEMPORARY_CONTINENTAL_CLUBS).forEach(([id, tempTeam]) => {
      if (!mergedTeams[id]) {
        mergedTeams[id] = tempTeam;
        updated = true;
      }
    });

    const normalized = normalizeLeagueDatabase({
      ...parsed,
      leagues: mergedLeagues,
      teams: mergedTeams,
    });

    const result = sanitizeEntireLeagueDatabase(normalized);

    cachedLeagueDb = result;

    if (updated) {
      saveLeagueDatabase(result);
    }

    return result;
  } catch (err) {
    console.error('Failed to load league database from localStorage:', err);
    cachedLeagueDb = sanitizeEntireLeagueDatabase(normalizeLeagueDatabase(DEFAULT_LEAGUE_DATABASE));
    return cachedLeagueDb;
  }
}

/**
 * Compacts the League Database before saving to LocalStorage to prevent exceeding the browser quota.
 * Strips redundant duplicate kits and empty slots; normalizeLeagueDatabase restores them on load.
 */
export function compactLeagueDatabaseForStorage(db: LeagueDatabase): any {
  const compactTeams: Record<string, any> = {};

  Object.entries(db.teams || {}).forEach(([id, t]) => {
    let compactSquadSaveFile: any = undefined;
    if (t.squadSaveFile) {
      const groups = ['squad', 'reserves', 'u20', 'u17'] as const;
      const filteredGroups: Record<string, any[]> = {};
      let hasCustomPlayers = false;

      groups.forEach((groupKey) => {
        const slots = t.squadSaveFile?.[groupKey];
        if (Array.isArray(slots)) {
          // Keep only slots with active players, and strip duplicate kit/emblem objects from players
          const compactSlots = slots
            .filter((s) => s && s.player)
            .map((s) => {
              const p = s.player!;
              const { kit, emblem, ...restPlayer } = p;
              return {
                slotNumber: s.slotNumber,
                player: restPlayer,
              };
            });

          if (compactSlots.length > 0) {
            filteredGroups[groupKey] = compactSlots;
            hasCustomPlayers = true;
          }
        }
      });

      if (hasCustomPlayers) {
        compactSquadSaveFile = filteredGroups;
      }
    }

    compactTeams[id] = {
      ...t,
      squadSaveFile: compactSquadSaveFile,
    };
  });

  return {
    version: db.version,
    lastUpdated: new Date().toISOString(),
    leagues: db.leagues,
    teams: compactTeams,
  };
}

export function saveLeagueDatabase(db: LeagueDatabase): void {
  try {
    const updated = {
      ...db,
      lastUpdated: new Date().toISOString(),
    };
    cachedLeagueDb = updated;
    const compactDb = compactLeagueDatabaseForStorage(updated);
    safeSetItem(STORAGE_KEY, JSON.stringify(compactDb));

    // Synchronize to unified Option File
    try {
      const of = getOptionFile();
      of.leagues = updated.leagues;
      of.teams = updated.teams;
      saveOptionFile(of);
    } catch (e) {
      console.warn('Option file sync from league database skipped:', e);
    }
  } catch (err) {
    console.warn('Failed to save league database to localStorage:', err);
  }
}

export function exportLeagueDatabaseJSON(db: LeagueDatabase): void {
  try {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `league_database_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (err) {
    console.error('Export league database failed:', err);
  }
}

export function importLeagueDatabaseJSON(jsonStr: string): LeagueDatabase {
  const parsed = JSON.parse(jsonStr) as LeagueDatabase;
  if (!parsed || typeof parsed !== 'object' || !parsed.leagues || !parsed.teams) {
    throw new Error('Invalid league database JSON format! Missing "leagues" or "teams" fields.');
  }
  const normalized = normalizeLeagueDatabase(parsed);
  saveLeagueDatabase(normalized);
  return normalized;
}

export function resetLeagueDatabaseToDefault(): LeagueDatabase {
  const normalized = normalizeLeagueDatabase(DEFAULT_LEAGUE_DATABASE);
  saveLeagueDatabase(normalized);
  return normalized;
}

export function getLeaguesByCountry(db: LeagueDatabase, countryCode: string): LeagueData[] {
  return Object.values(db.leagues).filter((l) => l.countryCode === countryCode);
}

export function getTeamsByLeague(db: LeagueDatabase, leagueId: string): EditorTeamData[] {
  return Object.values(db.teams).filter((t) => t.leagueId === leagueId);
}

export function getYouthLeagueByCity(db: LeagueDatabase, cityNameOrId: string): LeagueData | undefined {
  const norm = cityNameOrId.toLowerCase().trim();
  return Object.values(db.leagues).find(
    (l) =>
      l.divisionTier === 'youth' &&
      (l.cityName?.toLowerCase() === norm ||
        l.id.toLowerCase().includes(norm) ||
        norm.includes(l.cityName?.toLowerCase() || 'xyz'))
  );
}

export function getYouthTeamsByCity(db: LeagueDatabase, cityNameOrId: string): EditorTeamData[] {
  const youthLeague = getYouthLeagueByCity(db, cityNameOrId);
  if (!youthLeague) return [];
  return getTeamsByLeague(db, youthLeague.id);
}

