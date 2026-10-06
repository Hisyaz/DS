import { LeagueDatabase, LeagueData, EditorTeamData } from '../types/leagueEditor';
import { DEFAULT_LEAGUE_DATABASE } from '../data/defaultLeagues';
import { calculateTeamLineRatings } from './teamStrengthSystem';

/**
 * Calculates a team's true effective overall rating from their Starting XI players if present.
 */
function getTeamEffectiveOvr(team: EditorTeamData): number {
  if (team.squadSaveFile?.squad?.length || (team as any).squadFile?.squad?.length) {
    try {
      const line = calculateTeamLineRatings(team);
      if (line.overall && line.overall >= 45) return line.overall;
    } catch {
      // ignore
    }
  }
  return team.overallRating || 75;
}

/**
 * Known corrupted league name patterns and their canonical clean names.
 */
const KNOWN_CORRUPTED_NAMES: Record<string, string> = {
  'serie aefl championship': 'Serie A',
  'serie a efl championship': 'Serie A',
  'premier leaguela liga': 'Premier League',
  'ligue 1 uber eatsligue 2 bkt': 'Ligue 1 Uber Eats',
  'bundesliga2. bundesliga': 'Bundesliga',
  'la liga ea sportsla liga hypermotion': 'La Liga EA Sports',
  'liga profesional de fútbolprimera nacional': 'Liga Profesional de Fútbol',
  'brasileirão série abrasileirão série b': 'Brasileirão Série A',
  'saudi pro leaguesaudi 1st division': 'Saudi Pro League',
};

/**
 * Cleans any corrupted concatenated league name.
 */
export function cleanLeagueName(name: string): string {
  if (!name) return 'Professional League';
  const lower = name.trim().toLowerCase();
  for (const [corrupted, clean] of Object.entries(KNOWN_CORRUPTED_NAMES)) {
    if (lower === corrupted || lower.includes(corrupted)) {
      return clean;
    }
  }

  // If name contains two capitalized league names concatenated without spacing or invalid repetition
  if (name.includes('Serie A') && name.includes('Championship')) return 'Serie A';
  if (name.includes('Premier League') && name.includes('La Liga')) return 'Premier League';
  if (name.includes('Bundesliga') && name.includes('Ligue 1')) return 'Bundesliga';

  return name.trim();
}

/**
 * Maps country code / federation to its primary 1st and 2nd division IDs.
 */
export function getCanonicalLeagueIds(countryCode: string): { d1Id: string; d2Id: string; youthId: string } {
  const code = (countryCode || '').toUpperCase().trim();
  switch (code) {
    case 'ENG':
    case 'GB':
    case 'UK':
      return { d1Id: 'england_d1', d2Id: 'england_d2', youthId: 'england_youth' };
    case 'ESP':
      return { d1Id: 'spain_d1', d2Id: 'spain_d2', youthId: 'spain_youth' };
    case 'FR':
    case 'FRA':
      return { d1Id: 'france_d1', d2Id: 'france_d2', youthId: 'france_youth' };
    case 'ITA':
      return { d1Id: 'italy_d1', d2Id: 'italy_d2', youthId: 'italy_youth' };
    case 'GER':
    case 'DEU':
      return { d1Id: 'germany_d1', d2Id: 'germany_d2', youthId: 'germany_youth' };
    case 'POR':
    case 'PRT':
      return { d1Id: 'portugal_d1', d2Id: 'portugal_d2', youthId: 'portugal_youth' };
    case 'ARG':
      return { d1Id: 'argentina_d1', d2Id: 'argentina_d2', youthId: 'argentina_youth' };
    case 'BRA':
      return { d1Id: 'brazil_d1', d2Id: 'brazil_d2', youthId: 'brazil_youth' };
    case 'KSA':
    case 'SAU':
      return { d1Id: 'saudi_d1', d2Id: 'saudi_d1', youthId: 'saudi_youth' };
    default:
      return { d1Id: 'england_d1', d2Id: 'england_d2', youthId: 'england_youth' };
  }
}

/**
 * Returns the expected country code for a given league ID.
 */
export function getExpectedCountryForLeague(leagueId: string): string {
  const lower = (leagueId || '').toLowerCase();
  if (lower.startsWith('england') || lower.startsWith('eng_')) return 'ENG';
  if (lower.startsWith('spain') || lower.startsWith('esp_')) return 'ESP';
  if (lower.startsWith('france') || lower.startsWith('fr_')) return 'FR';
  if (lower.startsWith('italy') || lower.startsWith('ita_')) return 'ITA';
  if (lower.startsWith('germany') || lower.startsWith('ger_')) return 'GER';
  if (lower.startsWith('portugal') || lower.startsWith('por_')) return 'POR';
  if (lower.startsWith('argentina') || lower.startsWith('arg_')) return 'ARG';
  if (lower.startsWith('brazil') || lower.startsWith('bra_')) return 'BRA';
  if (lower.startsWith('saudi') || lower.startsWith('sau_')) return 'KSA';
  return 'ENG';
}

/**
 * Authoritatively sanitizes the teams list for a competition instance, ensuring:
 * 1. ZERO cross-country club mixing (No English clubs in Serie A, No Saudi clubs in Premier League, etc.)
 * 2. ZERO duplicates
 * 3. Exact target team count matching the league's official structure
 * 4. Fallback to authentic default clubs if clubs were missing or corrupted
 */
export function getSanitizedTeamsForLeague(
  leagueId: string,
  db: LeagueDatabase
): { id: string; name: string; ovr: number; countryCode: string }[] {
  const league = db.leagues?.[leagueId] || DEFAULT_LEAGUE_DATABASE.leagues[leagueId];
  const expectedCountry = league?.countryCode?.toUpperCase() || getExpectedCountryForLeague(leagueId);
  const targetNumTeams = league?.structure?.numTeams || (leagueId.includes('d2') ? 20 : 20);

  const rawTeamIds: string[] = Array.isArray(league?.teamIds) ? league.teamIds : [];
  const validTeams: { id: string; name: string; ovr: number; countryCode: string }[] = [];
  const seenIds = new Set<string>();

  // Helper to check if a team genuinely belongs to this country / league
  const isTeamValidForLeague = (team: EditorTeamData): boolean => {
    if (!team || !team.id) return false;
    const teamCountry = (team.countryCode || '').toUpperCase();
    const teamLeagueId = team.leagueId || '';

    // State championships only / Cup-only isolation
    if (team.isStateChampionshipsOnly || team.isCupOnly || team.leagueId === 'brazil_state_only') {
      return leagueId === 'brazil_state_only';
    }
    if (leagueId === 'brazil_state_only') {
      return !!(team.isStateChampionshipsOnly || team.isCupOnly || team.leagueId === 'brazil_state_only');
    }

    // Direct match by leagueId or matching countryCode
    if (teamLeagueId === leagueId) return true;
    if (teamCountry && teamCountry === expectedCountry) return true;
    if (expectedCountry === 'FR' && teamCountry === 'FRA') return true;
    if (expectedCountry === 'GER' && teamCountry === 'DEU') return true;
    if (expectedCountry === 'POR' && teamCountry === 'PRT') return true;
    if (expectedCountry === 'KSA' && teamCountry === 'SAU') return true;

    // Check ID prefix
    const idPrefix = team.id.slice(0, 3).toLowerCase();
    if (expectedCountry === 'ITA' && (idPrefix === 'ita' || idPrefix.startsWith('it'))) return true;
    if (expectedCountry === 'ENG' && (idPrefix === 'eng' || idPrefix.startsWith('en'))) return true;
    if (expectedCountry === 'ESP' && (idPrefix === 'esp' || idPrefix.startsWith('es'))) return true;
    if (expectedCountry === 'FR' && (idPrefix === 'fr_' || idPrefix.startsWith('fr'))) return true;
    if (expectedCountry === 'GER' && (idPrefix === 'ger' || idPrefix.startsWith('ge'))) return true;
    if (expectedCountry === 'POR' && (idPrefix === 'por' || idPrefix.startsWith('po'))) return true;
    if (expectedCountry === 'ARG' && (idPrefix === 'arg' || idPrefix.startsWith('ar'))) return true;
    if (expectedCountry === 'BRA' && (idPrefix === 'bra' || idPrefix.startsWith('br'))) return true;
    if (expectedCountry === 'KSA' && (idPrefix === 'sau' || idPrefix.startsWith('sa'))) return true;

    return false;
  };

  // 1. Process candidate teams from league.teamIds
  rawTeamIds.forEach((tId) => {
    if (seenIds.has(tId)) return;
    const team = db.teams?.[tId] || DEFAULT_LEAGUE_DATABASE.teams[tId];
    if (team && isTeamValidForLeague(team)) {
      seenIds.add(tId);
      validTeams.push({
        id: team.id,
        name: team.name,
        ovr: getTeamEffectiveOvr(team),
        countryCode: team.countryCode || expectedCountry,
      });
    }
  });

  // 2. If short on teams, pull additional valid teams from db.teams that belong to this league / country
  if (validTeams.length < targetNumTeams && db.teams) {
    Object.values(db.teams).forEach((team) => {
      if (validTeams.length >= targetNumTeams) return;
      if (seenIds.has(team.id)) return;
      if (isTeamValidForLeague(team)) {
        seenIds.add(team.id);
        validTeams.push({
          id: team.id,
          name: team.name,
          ovr: getTeamEffectiveOvr(team),
          countryCode: team.countryCode || expectedCountry,
        });
      }
    });
  }

  // 3. If still short, fallback to DEFAULT_LEAGUE_DATABASE teams for this league
  const defaultLeague = DEFAULT_LEAGUE_DATABASE.leagues[leagueId];
  if (validTeams.length < targetNumTeams && defaultLeague?.teamIds) {
    defaultLeague.teamIds.forEach((tId) => {
      if (validTeams.length >= targetNumTeams) return;
      if (seenIds.has(tId)) return;
      const defTeam = DEFAULT_LEAGUE_DATABASE.teams[tId];
      if (defTeam) {
        seenIds.add(tId);
        validTeams.push({
          id: defTeam.id,
          name: defTeam.name,
          ovr: getTeamEffectiveOvr(defTeam),
          countryCode: defTeam.countryCode || expectedCountry,
        });
      }
    });
  }

  return validTeams;
}

/**
 * Sanitizes an entire LeagueDatabase object, repairing any corrupt league names,
 * removing cross-contaminated teams, and ensuring clean isolated state.
 */
export function sanitizeEntireLeagueDatabase(db: LeagueDatabase): LeagueDatabase {
  if (!db || !db.leagues || !db.teams) return db;

  const cleanedLeagues: Record<string, LeagueData> = {};
  const cleanedTeams: Record<string, EditorTeamData> = { ...db.teams };

  Object.entries(db.leagues).forEach(([leagueId, league]) => {
    const cleanName = cleanLeagueName(league.name);
    const sanitizedTeams = getSanitizedTeamsForLeague(leagueId, db);

    cleanedLeagues[leagueId] = {
      ...league,
      name: cleanName,
      teamIds: sanitizedTeams.map((t) => t.id),
    };

    // Ensure all teams have correct leagueId
    sanitizedTeams.forEach((t) => {
      if (cleanedTeams[t.id]) {
        cleanedTeams[t.id] = {
          ...cleanedTeams[t.id],
          leagueId: leagueId,
        };
      }
    });
  });

  return {
    ...db,
    leagues: cleanedLeagues,
    teams: cleanedTeams,
  };
}
