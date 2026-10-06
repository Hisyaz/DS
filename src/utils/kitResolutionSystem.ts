import { PlayerCardData, EmblemConfig } from '../types';
import { KitConfig, LeagueDatabase, EditorTeamData } from '../types/leagueEditor';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { getNationalTeamsDatabase } from './nationalTeamDatabaseManager';
import { NationalTeam } from '../types/nationalTeam';
import { TOP_50_NATIONAL_TEAMS_SEEDS } from '../data/top50NationalTeamsData';

export interface ResolvedPlayerKitData {
  kit: KitConfig;
  emblem: EmblemConfig;
  teamName: string;
  teamCountryCode: string;
  isNationalTeam: boolean;
  source: 'national_team' | 'club' | 'default';
}

export const DEFAULT_FALLBACK_KIT: KitConfig = {
  style: 'normal',
  color1: '#2563eb',
  color2: '#ffffff',
  pattern: 'solid',
  collar: 'crew',
};

export const DEFAULT_FALLBACK_EMBLEM: EmblemConfig = {
  shape: 'square',
  mode: '1',
  color1: '#2563eb',
  color2: '#ffffff',
  color3: '#ffffff',
};

/**
 * Normalizes team names for fuzzy matching against the league database.
 */
function normalizeName(name?: string): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/\b(fc|cf|sc|ac|as|rc|afc|club|de|futbol|football|youth|academy|u16|u17|u18|u19|u20|reserves|first team|juniors|colts|squad|b team|ii)\b/gi, '')
    .replace(/[^a-z0-9]/gi, '')
    .trim();
}

/**
 * Derives a clean EmblemConfig for a national team based on flag / country colors.
 */
function deriveNationalEmblem(nation?: { code?: string; name?: string; iso?: string }): EmblemConfig {
  const code = (nation?.code || '').toUpperCase();
  
  // Custom national emblem styling per major nations
  if (code === 'ARG') {
    return { shape: 'circle', mode: '3', color1: '#38bdf8', color2: '#ffffff', color3: '#facc15' };
  }
  if (code === 'FRA') {
    return { shape: 'real-madrid', mode: '3', color1: '#0f172a', color2: '#ffffff', color3: '#dc2626' };
  }
  if (code === 'ESP') {
    return { shape: 'star-shield', mode: '3', color1: '#dc2626', color2: '#facc15', color3: '#991b1b' };
  }
  if (code === 'ENG') {
    return { shape: 'star-shield', mode: '3', color1: '#ffffff', color2: '#dc2626', color3: '#1e3a8a' };
  }
  if (code === 'BRA') {
    return { shape: 'diamond', mode: '3', color1: '#eab308', color2: '#16a34a', color3: '#2563eb' };
  }
  if (code === 'GER' || code === 'DEU') {
    return { shape: 'star-shield', mode: '3', color1: '#ffffff', color2: '#000000', color3: '#dc2626' };
  }
  if (code === 'ITA') {
    return { shape: 'barcelona', mode: '3', color1: '#1d4ed8', color2: '#ffffff', color3: '#16a34a' };
  }
  if (code === 'POR') {
    return { shape: 'star-shield', mode: '3', color1: '#dc2626', color2: '#16a34a', color3: '#facc15' };
  }
  if (code === 'NED') {
    return { shape: 'star-shield', mode: '3', color1: '#f97316', color2: '#ffffff', color3: '#0f172a' };
  }
  
  return {
    shape: 'circle',
    mode: '1',
    color1: '#1e40af',
    color2: '#ffffff',
    color3: '#facc15',
  };
}

/**
 * Searches the league database for a club matching the given ID or name.
 */
export function findClubInLeagueDatabase(
  clubNameOrId: string,
  providedLeagueDb?: LeagueDatabase
): EditorTeamData | null {
  if (!clubNameOrId || clubNameOrId === 'Youth Prospect' || clubNameOrId === 'Free Agent' || clubNameOrId === 'Unassigned') {
    return null;
  }

  const db = providedLeagueDb || getLeagueDatabase();
  if (!db || !db.teams) return null;

  // Clean squad suffix if present
  const baseName = clubNameOrId
    .replace(/\s+(U16|U17|U18|U19|U20|Reserves|First Team|B Team|II|Academy)\b/gi, '')
    .trim();

  // 1. Direct ID match
  if (db.teams[clubNameOrId]) return db.teams[clubNameOrId];
  if (db.teams[baseName]) return db.teams[baseName];

  const allTeams = Object.values(db.teams) as EditorTeamData[];

  // 2. Exact name match (case-insensitive)
  const lowerInput = clubNameOrId.trim().toLowerCase();
  const lowerBase = baseName.toLowerCase();
  const exactMatch = allTeams.find(
    (t) =>
      t.name.toLowerCase() === lowerInput ||
      t.name.toLowerCase() === lowerBase ||
      (t.shortName && (t.shortName.toLowerCase() === lowerInput || t.shortName.toLowerCase() === lowerBase))
  );
  if (exactMatch) return exactMatch;

  // 3. Normalized fuzzy name match
  const normInput = normalizeName(clubNameOrId);
  const normBase = normalizeName(baseName);

  if (normInput.length >= 3 || normBase.length >= 3) {
    const fuzzyMatch = allTeams.find((t) => {
      const normTeam = normalizeName(t.name);
      const normShort = normalizeName(t.shortName);
      return (
        normTeam === normInput ||
        normTeam === normBase ||
        normShort === normInput ||
        normShort === normBase ||
        (normInput.length >= 4 && normTeam.includes(normInput)) ||
        (normBase.length >= 4 && normTeam.includes(normBase)) ||
        (normTeam.length >= 4 && normInput.includes(normTeam)) ||
        (normTeam.length >= 4 && normBase.includes(normTeam))
      );
    });
    if (fuzzyMatch) return fuzzyMatch;
  }

  return null;
}

/**
 * Searches the national teams database for a nation matching code or name.
 */
export function findNationalTeamInDatabase(
  nationCodeOrName: string,
  providedLeagueDb?: LeagueDatabase
): NationalTeam | null {
  if (!nationCodeOrName) return null;
  const db = getNationalTeamsDatabase(providedLeagueDb);
  if (!Array.isArray(db) || db.length === 0) return null;

  const upperInput = nationCodeOrName.trim().toUpperCase();
  const lowerInput = nationCodeOrName.trim().toLowerCase();

  // 1. Match nation code
  const codeMatch = db.find(
    (t) => t.nation.code.toUpperCase() === upperInput || (t.nation.iso && t.nation.iso.toUpperCase() === upperInput)
  );
  if (codeMatch) return codeMatch;

  // 2. Match nation name
  const nameMatch = db.find(
    (t) => t.nation.name.toLowerCase() === lowerInput || t.nation.name.toLowerCase().includes(lowerInput)
  );
  if (nameMatch) return nameMatch;

  return null;
}

/**
 * Resolves the active Kit and Emblem for a player card according to the strict priority rules:
 * 1. Currently representing a national team -> National Team Kit (from National Team Info -> Kits)
 * 2. Otherwise playing for a club -> Current Club Kit (from Team Info -> Kits)
 * 3. No current team -> Existing default/creation kit behavior
 */
export function resolvePlayerKitAndEmblem(
  player: Partial<PlayerCardData> | null | undefined,
  providedLeagueDb?: LeagueDatabase
): ResolvedPlayerKitData {
  if (!player) {
    return {
      kit: DEFAULT_FALLBACK_KIT,
      emblem: DEFAULT_FALLBACK_EMBLEM,
      teamName: 'Unassigned',
      teamCountryCode: 'ENG',
      isNationalTeam: false,
      source: 'default',
    };
  }

  // --- EXPLICIT DIRECT KIT OVERRIDE (e.g. Kit Studio Player Card Preview, Card Creator) ---
  if (
    (player as any).useDirectKit ||
    (player as any).isKitPreview ||
    (player as any).overrideKit ||
    Boolean((player as any)._forceKit)
  ) {
    return {
      kit: player.kit
        ? { ...DEFAULT_FALLBACK_KIT, ...player.kit, style: player.kit.style || 'normal' }
        : DEFAULT_FALLBACK_KIT,
      emblem: player.emblem || DEFAULT_FALLBACK_EMBLEM,
      teamName: player.club || 'Club',
      teamCountryCode: player.clubCountry || player.nationality?.code || 'ENG',
      isNationalTeam: false,
      source: 'club',
    };
  }

  // --- PRIORITY 1: Currently representing a national team ---
  const isActivelyOnInternationalDuty = Boolean(
    player.activeInternationalDuty && !player.activeInternationalDuty.isResolved
  );
  const isExplicitlyRepresentingNationalTeam = Boolean((player as any).isRepresentingNationalTeam);

  if (isActivelyOnInternationalDuty || isExplicitlyRepresentingNationalTeam) {
    const duty = player.activeInternationalDuty;
    const targetNationCode = duty?.nation?.code || duty?.nationCode || player.nationality?.code || player.seniorNation || '';
    const targetNationName = duty?.nation?.name || duty?.nationName || player.nationality?.name || player.seniorNation || 'National Team';
    const tier = duty?.tier || 'Senior';

    const natTeam = findNationalTeamInDatabase(targetNationCode || targetNationName, providedLeagueDb);
    const seed = TOP_50_NATIONAL_TEAMS_SEEDS.find(
      (s) =>
        s.code.toUpperCase() === (targetNationCode || '').toUpperCase() ||
        s.name.toLowerCase() === (targetNationName || '').toLowerCase()
    );

    const activeKit: KitConfig =
      natTeam?.homeKit ||
      seed?.homeKit || {
        style: 'normal',
        color1: '#1e40af',
        color2: '#ffffff',
        pattern: 'solid',
        collar: 'crew',
      };

    const nationObj = natTeam?.nation || (seed ? { code: seed.code, name: seed.name, iso: seed.iso } : { code: targetNationCode, name: targetNationName });
    const activeEmblem: EmblemConfig = deriveNationalEmblem(nationObj);
    const displayNationName = natTeam?.nation?.name || seed?.name || targetNationName || 'National Team';
    const displayTeamName = `${displayNationName} ${tier !== 'Senior' ? tier : ''}`.trim();

    return {
      kit: {
        ...activeKit,
        style: player.kit?.style || activeKit.style || 'normal',
      },
      emblem: activeEmblem,
      teamName: displayTeamName,
      teamCountryCode: nationObj.code || targetNationCode || 'INT',
      isNationalTeam: true,
      source: 'national_team',
    };
  }

  // --- PRIORITY 2: Playing for a club (Club Career) ---
  const clubIdentifier = player.clubId || player.club;
  const isNoTeam =
    !player.club ||
    player.club === 'Youth Prospect' ||
    player.club === 'Free Agent' ||
    player.club === 'Unassigned';

  if (!isNoTeam && clubIdentifier) {
    const matchedClub = findClubInLeagueDatabase(clubIdentifier, providedLeagueDb);
    if (matchedClub && matchedClub.kit) {
      return {
        kit: {
          ...matchedClub.kit,
          style: player.kit?.style || matchedClub.kit.style || 'normal',
        },
        emblem: matchedClub.emblem ? { ...matchedClub.emblem } : DEFAULT_FALLBACK_EMBLEM,
        teamName: matchedClub.name,
        teamCountryCode: matchedClub.countryCode || player.clubCountry || 'ENG',
        isNationalTeam: false,
        source: 'club',
      };
    }

    // If club is named but not found in DB, preserve any kit attached to player
    if (player.kit) {
      return {
        kit: {
          ...player.kit,
          style: player.kit?.style || 'normal',
        },
        emblem: player.emblem ? { ...player.emblem } : DEFAULT_FALLBACK_EMBLEM,
        teamName: player.club,
        teamCountryCode: player.clubCountry || player.nationality?.code || 'ENG',
        isNationalTeam: false,
        source: 'club',
      };
    }
  }

  // --- PRIORITY 3: No current team / Default / Creation behavior ---
  return {
    kit: player.kit
      ? { ...player.kit, style: player.kit?.style || 'normal' }
      : DEFAULT_FALLBACK_KIT,
    emblem: player.emblem ? { ...player.emblem } : DEFAULT_FALLBACK_EMBLEM,
    teamName: player.club || 'Youth Prospect',
    teamCountryCode: player.clubCountry || player.nationality?.code || 'ENG',
    isNationalTeam: false,
    source: 'default',
  };
}
