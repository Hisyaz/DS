import { ContinentalFederation } from '../types/competitionEditor';
import { EditorTeamData, LeagueDatabase } from '../types/leagueEditor';
import {
  ContinentalCompetitionId,
  ContinentalCompetitionMeta,
} from '../types/continentalCompetitions';
import { TEMPORARY_CONTINENTAL_CLUBS } from '../data/temporaryContinentalClubs';
import { getLeagueDatabase } from './leagueDatabaseSystem';

export const CONTINENTAL_COMPETITIONS_CATALOG: Record<ContinentalCompetitionId, ContinentalCompetitionMeta> = {
  // UEFA (Europe)
  UEFA_CL: {
    id: 'UEFA_CL',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    federation: 'UEFA',
    tier: 1,
    format: '36_league_phase_knockout',
    minTeamsRequired: 36,
    bannerColor: '#0984E3',
    accentColor: '#6C5CE7',
    iconType: 'star',
  },
  UEFA_EL: {
    id: 'UEFA_EL',
    name: 'UEFA Europa League',
    shortName: 'UEL',
    federation: 'UEFA',
    tier: 2,
    format: '36_league_phase_knockout',
    minTeamsRequired: 36,
    bannerColor: '#E17055',
    accentColor: '#D63031',
    iconType: 'trophy',
  },
  UEFA_ECL: {
    id: 'UEFA_ECL',
    name: 'UEFA Conference League',
    shortName: 'UECL',
    federation: 'UEFA',
    tier: 3,
    format: '36_league_phase_knockout',
    minTeamsRequired: 36,
    bannerColor: '#00B894',
    accentColor: '#00CEC9',
    iconType: 'shield',
  },
  UEFA_SC: {
    id: 'UEFA_SC',
    name: 'UEFA Super Cup',
    shortName: 'Super Cup',
    federation: 'UEFA',
    tier: 'supercup',
    format: 'supercup_single',
    minTeamsRequired: 2,
    bannerColor: '#0984E3',
    accentColor: '#FDCB6E',
    iconType: 'trophy',
    isSuperCup: true,
    superCupPair: {
      primaryCompId: 'UEFA_CL',
      secondaryCompId: 'UEFA_EL',
    },
  },

  // CONMEBOL (South America)
  CONMEBOL_LIB: {
    id: 'CONMEBOL_LIB',
    name: 'Copa Libertadores',
    shortName: 'Libertadores',
    federation: 'CONMEBOL',
    tier: 1,
    format: '32_groups_knockout',
    minTeamsRequired: 32,
    bannerColor: '#FDCB6E',
    accentColor: '#D35400',
    iconType: 'trophy',
  },
  CONMEBOL_SUD: {
    id: 'CONMEBOL_SUD',
    name: 'Copa Sudamericana',
    shortName: 'Sudamericana',
    federation: 'CONMEBOL',
    tier: 2,
    format: '32_groups_knockout',
    minTeamsRequired: 32,
    bannerColor: '#0984E3',
    accentColor: '#74B9FF',
    iconType: 'globe',
  },
  CONMEBOL_REC: {
    id: 'CONMEBOL_REC',
    name: 'Recopa Sudamericana',
    shortName: 'Recopa',
    federation: 'CONMEBOL',
    tier: 'supercup',
    format: 'supercup_single',
    minTeamsRequired: 2,
    bannerColor: '#E1B12C',
    accentColor: '#2F3542',
    iconType: 'trophy',
    isSuperCup: true,
    superCupPair: {
      primaryCompId: 'CONMEBOL_LIB',
      secondaryCompId: 'CONMEBOL_SUD',
    },
  },

  // CONCACAF (North/Central America)
  CONCACAF_CC: {
    id: 'CONCACAF_CC',
    name: 'CONCACAF Champions Cup',
    shortName: 'Champions Cup',
    federation: 'CONCACAF',
    tier: 1,
    format: '32_groups_knockout',
    minTeamsRequired: 32,
    bannerColor: '#1E3799',
    accentColor: '#4A69BD',
    iconType: 'trophy',
  },
  CONCACAF_CAC: {
    id: 'CONCACAF_CAC',
    name: 'CONCACAF Central American Cup',
    shortName: 'Central American Cup',
    federation: 'CONCACAF',
    tier: 2,
    format: '32_groups_knockout',
    minTeamsRequired: 20,
    bannerColor: '#0C2461',
    accentColor: '#1E3799',
    iconType: 'shield',
  },

  // AFC (Asia)
  AFC_CL: {
    id: 'AFC_CL',
    name: 'AFC Champions League Elite',
    shortName: 'ACL Elite',
    federation: 'AFC',
    tier: 1,
    format: '32_groups_knockout',
    minTeamsRequired: 24,
    bannerColor: '#B71540',
    accentColor: '#E55039',
    iconType: 'crown',
  },
  AFC_CUP: {
    id: 'AFC_CUP',
    name: 'AFC Champions League Two',
    shortName: 'ACL Two',
    federation: 'AFC',
    tier: 2,
    format: '32_groups_knockout',
    minTeamsRequired: 32,
    bannerColor: '#E58E26',
    accentColor: '#F6B93B',
    iconType: 'trophy',
  },

  // CAF (Africa)
  CAF_CL: {
    id: 'CAF_CL',
    name: 'CAF Champions League',
    shortName: 'TotalEnergies CAF CL',
    federation: 'CAF',
    tier: 1,
    format: '32_groups_knockout',
    minTeamsRequired: 16,
    bannerColor: '#079992',
    accentColor: '#38ADA9',
    iconType: 'crown',
  },
  CAF_CONFED_CUP: {
    id: 'CAF_CONFED_CUP',
    name: 'CAF Confederation Cup',
    shortName: 'CAF Confed Cup',
    federation: 'CAF',
    tier: 2,
    format: '32_groups_knockout',
    minTeamsRequired: 16,
    bannerColor: '#78E08F',
    accentColor: '#38ADA9',
    iconType: 'shield',
  },
  CAF_SC: {
    id: 'CAF_SC',
    name: 'CAF Super Cup',
    shortName: 'CAF Super Cup',
    federation: 'CAF',
    tier: 'supercup',
    format: 'supercup_single',
    minTeamsRequired: 2,
    bannerColor: '#079992',
    accentColor: '#F6B93B',
    iconType: 'trophy',
    isSuperCup: true,
    superCupPair: {
      primaryCompId: 'CAF_CL',
      secondaryCompId: 'CAF_CONFED_CUP',
    },
  },

  // OFC (Oceania)
  OFC_CL: {
    id: 'OFC_CL',
    name: 'OFC Champions League',
    shortName: 'OFC CL',
    federation: 'OFC',
    tier: 1,
    format: 'knockout_tournament',
    minTeamsRequired: 8,
    bannerColor: '#4A69BD',
    accentColor: '#60A3BC',
    iconType: 'globe',
  },
};

export interface CompetitionPlayabilityStatus {
  competitionId: ContinentalCompetitionId;
  name: string;
  federation: ContinentalFederation;
  isPlayable: boolean;
  eligibleClubsCount: number;
  minTeamsRequired: number;
  reason: string;
}

/**
 * Evaluates whether a continental competition has enough clubs in the database to be playable.
 */
export function checkContinentalCompetitionPlayability(
  compId: ContinentalCompetitionId,
  leagueDb?: LeagueDatabase
): CompetitionPlayabilityStatus {
  const meta = CONTINENTAL_COMPETITIONS_CATALOG[compId];
  if (!meta) {
    return {
      competitionId: compId,
      name: compId,
      federation: 'UEFA',
      isPlayable: false,
      eligibleClubsCount: 0,
      minTeamsRequired: 32,
      reason: 'Unknown competition identifier',
    };
  }

  const db = leagueDb || getLeagueDatabase();
  const eligibleClubs = getEligibleClubsForFederation(meta.federation, db);
  const eligibleCount = eligibleClubs.length;

  if (meta.isSuperCup) {
    // Super Cup requires that primary & secondary competitions are playable or have champions
    const isPlayable = eligibleCount >= 16;
    return {
      competitionId: compId,
      name: meta.name,
      federation: meta.federation,
      isPlayable,
      eligibleClubsCount: eligibleCount,
      minTeamsRequired: meta.minTeamsRequired,
      reason: isPlayable
        ? `Playable — Season-opening showpiece connecting Continental Champions.`
        : `Not Currently Playable — Requires active parent continental competitions in ${meta.federation}.`,
    };
  }

  const isPlayable = eligibleCount >= meta.minTeamsRequired;
  const reason = isPlayable
    ? `Playable — ${eligibleCount} participating & pool clubs available in ${meta.federation} database.`
    : `Not Currently Playable — Insufficient clubs in database (Found ${eligibleCount}/${meta.minTeamsRequired} required for tournament format).`;

  return {
    competitionId: compId,
    name: meta.name,
    federation: meta.federation,
    isPlayable,
    eligibleClubsCount: eligibleCount,
    minTeamsRequired: meta.minTeamsRequired,
    reason,
  };
}

/**
 * Returns all eligible clubs in the database and temporary pool belonging to a federation.
 */
export function getEligibleClubsForFederation(
  federation: ContinentalFederation,
  leagueDb?: LeagueDatabase
): EditorTeamData[] {
  const db = leagueDb || getLeagueDatabase();
  const clubsMap = new Map<string, EditorTeamData>();

  // 1. Add matching domestic league clubs from leagueDb
  const europeanCountries = new Set(['ENG', 'ESP', 'FR', 'FRA', 'GER', 'ITA', 'POR', 'NED', 'SCO', 'TUR', 'BEL', 'UKR', 'AUT', 'CRO', 'GRE', 'DEN', 'CZE', 'NOR', 'SUI']);
  const southAmericanCountries = new Set(['ARG', 'BRA', 'URU', 'PAR', 'CHI', 'ECU', 'COL', 'BOL', 'PER', 'VEN']);
  const northAmericanCountries = new Set(['USA', 'MEX', 'CAN', 'CRC', 'HON', 'JAM', 'PAN']);
  const asianCountries = new Set(['KSA', 'JPN', 'KOR', 'QAT', 'UAE', 'AUS', 'IRN', 'CHN']);
  const africanCountries = new Set(['EGY', 'MAR', 'SEN', 'NGA', 'ALG', 'TUN', 'GHA', 'CIV', 'RSA']);
  const oceanianCountries = new Set(['NZL', 'FIJ', 'TAH', 'PNG', 'NCL', 'SOL', 'VAN']);

  Object.values(db?.teams || {}).forEach((team) => {
    const cc = (team.countryCode || '').toUpperCase();
    let teamFed: ContinentalFederation | undefined = (team.federation as ContinentalFederation);

    if (!teamFed) {
      if (europeanCountries.has(cc)) teamFed = 'UEFA';
      else if (southAmericanCountries.has(cc)) teamFed = 'CONMEBOL';
      else if (northAmericanCountries.has(cc)) teamFed = 'CONCACAF';
      else if (asianCountries.has(cc)) teamFed = 'AFC';
      else if (africanCountries.has(cc)) teamFed = 'CAF';
      else if (oceanianCountries.has(cc)) teamFed = 'OFC';
    }

    if (teamFed === federation) {
      // Exclude youth clubs from senior continental competitions
      const isYouth = team.leagueId?.includes('youth') || team.leagueId?.includes('u20') || team.leagueId?.includes('u17');
      if (!isYouth) {
        clubsMap.set(team.id, team);
      }
    }
  });

  // 2. Add temporary continental clubs for this federation
  Object.values(TEMPORARY_CONTINENTAL_CLUBS).forEach((tempClub) => {
    if (tempClub.federation === federation && !clubsMap.has(tempClub.id)) {
      clubsMap.set(tempClub.id, tempClub);
    }
  });

  return Array.from(clubsMap.values());
}
