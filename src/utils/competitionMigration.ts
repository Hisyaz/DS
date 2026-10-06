import { GlobalCompetitionsDatabase, CompetitionData } from '../types/competitionEditor';
import { LeagueDatabase, LeagueData } from '../types/leagueEditor';
import { saveLeagueDatabase } from './leagueDatabaseSystem';

/**
 * Migrates and reconciles existing LeagueDatabase leagues into GlobalCompetitionsDatabase.
 * Ensures zero data loss for user-customized emblems, trophies, newspaper names, and UI designs.
 */
export function migrateLeagueDbToGlobalCompetitions(
  leagueDb: LeagueDatabase,
  globalDb: GlobalCompetitionsDatabase
): GlobalCompetitionsDatabase {
  if (!leagueDb || !leagueDb.leagues) return globalDb;

  const updatedCompetitions = { ...globalDb.competitions };
  let hasChanges = false;

  Object.entries(leagueDb.leagues).forEach(([leagueId, league]) => {
    // Check if there is an existing competition with matching ID or participatingLeagues
    const existingCompKey = Object.keys(updatedCompetitions).find((key) => {
      const comp = updatedCompetitions[key];
      if (comp.id === leagueId || key === leagueId) return true;
      if (comp.participatingLeagues && comp.participatingLeagues.includes(leagueId)) return true;
      if (
        comp.category === 'national' &&
        comp.countryCode === league.countryCode &&
        comp.divisionTier === league.divisionTier &&
        comp.competitionType === (league.divisionTier === 'youth' ? 'youth' : 'league')
      ) {
        return true;
      }
      return false;
    });

    if (existingCompKey) {
      const existing = updatedCompetitions[existingCompKey];
      // Merge properties non-destructively
      updatedCompetitions[existingCompKey] = {
        ...existing,
        newspaperName: existing.newspaperName || league.newspaperName,
        design: existing.design || league.design,
        structure: existing.structure || league.structure,
        individualAwards: existing.individualAwards || league.individualAwards,
        subCompetitions: existing.subCompetitions || league.competitions,
        emblem: existing.emblem || league.emblem,
        trophy: existing.trophy || league.championshipTrophy,
        participatingTeamIds:
          existing.participatingTeamIds && existing.participatingTeamIds.length > 0
            ? existing.participatingTeamIds
            : league.teamIds,
        branding: existing.branding || {
          primaryHex: league.design?.primaryHex || '#00A8FF',
          secondaryHex: league.design?.secondaryHex || '#74B9FF',
          accentHex: league.design?.accentHex || '#FFD700',
        },
      };
      hasChanges = true;
    } else {
      // Create a brand new national competition entry from this league
      const newComp: CompetitionData = {
        id: league.id,
        name: league.name,
        shortName:
          league.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 6) || 'COMP',
        category: 'national',
        competitionType: league.divisionTier === 'youth' ? 'youth' : 'league',
        countryCode: league.countryCode,
        countryName: league.countryName,
        divisionTier: league.divisionTier,
        numParticipants: league.structure?.numTeams || league.teamIds?.length || 16,
        participantAssignmentMode: 'manual',
        participatingTeamIds: league.teamIds || [],
        participatingLeagues: [league.id],
        qualificationRules: [],
        stages: [
          {
            id: `stg_${league.id}`,
            name: 'League Table',
            stageType: 'league_table',
            order: 1,
          },
        ],
        emblem: league.emblem,
        trophy: league.championshipTrophy,
        newspaperName: league.newspaperName,
        design: league.design,
        structure: league.structure,
        individualAwards: league.individualAwards,
        subCompetitions: league.competitions,
        branding: {
          primaryHex: league.design?.primaryHex || '#00A8FF',
          secondaryHex: league.design?.secondaryHex || '#74B9FF',
          accentHex: league.design?.accentHex || '#FFD700',
        },
      };
      updatedCompetitions[league.id] = newComp;
      hasChanges = true;
    }
  });

  if (!hasChanges) return globalDb;

  return {
    ...globalDb,
    competitions: updatedCompetitions,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Synchronizes edits from a CompetitionData entry back into the LeagueDatabase
 * to ensure that all game engines reading LeagueDatabase stay updated in real time.
 */
export function syncCompetitionToLeagueDb(
  comp: CompetitionData,
  leagueDb: LeagueDatabase
): LeagueDatabase {
  if (!leagueDb || !leagueDb.leagues) return leagueDb;

  // Find matching league entry
  let targetLeagueKey = Object.keys(leagueDb.leagues).find((key) => {
    const l = leagueDb.leagues[key];
    if (l.id === comp.id || key === comp.id) return true;
    if (comp.participatingLeagues && comp.participatingLeagues.includes(l.id)) return true;
    if (
      l.countryCode === comp.countryCode &&
      l.divisionTier === comp.divisionTier
    ) {
      return true;
    }
    return false;
  });

  if (!targetLeagueKey) {
    targetLeagueKey = comp.id;
  }

  const existingLeague: LeagueData = leagueDb.leagues[targetLeagueKey] || {
    id: comp.id,
    name: comp.name,
    countryCode: (comp.countryCode as any) || 'ENG',
    countryName: comp.countryName || 'England',
    divisionTier: (comp.divisionTier as any) || '1st',
    emblem: comp.emblem || { shape: 'crested-shield', mode: '1', color1: '#00A8FF', color2: '#FFFFFF' },
    design: comp.design || {
      shape: 'modern_square',
      primaryColor: 'Blue',
      secondaryColor: 'White',
      accentColor: 'Yellow',
      primaryHex: comp.branding?.primaryHex || '#00A8FF',
      secondaryHex: comp.branding?.secondaryHex || '#74B9FF',
      accentHex: comp.branding?.accentHex || '#FFD700',
    },
    structure: comp.structure || {
      numTeams: comp.numParticipants || 16,
      format: 'double_round_robin',
      directRelegationSpots: 3,
      playoffRelegationSpots: 0,
    },
    teamIds: comp.participatingTeamIds || [],
  };

  const updatedLeague: LeagueData = {
    ...existingLeague,
    name: comp.name || existingLeague.name,
    newspaperName: comp.newspaperName || existingLeague.newspaperName,
    emblem: comp.emblem || existingLeague.emblem,
    championshipTrophy: comp.trophy || existingLeague.championshipTrophy,
    design: comp.design || existingLeague.design,
    structure: comp.structure || existingLeague.structure,
    individualAwards: comp.individualAwards || existingLeague.individualAwards,
    competitions: comp.subCompetitions || existingLeague.competitions,
    teamIds: comp.participatingTeamIds || existingLeague.teamIds || [],
  };

  const updatedLeagueDb: LeagueDatabase = {
    ...leagueDb,
    leagues: {
      ...leagueDb.leagues,
      [targetLeagueKey]: updatedLeague,
    },
    lastUpdated: new Date().toISOString(),
  };

  saveLeagueDatabase(updatedLeagueDb);
  return updatedLeagueDb;
}
