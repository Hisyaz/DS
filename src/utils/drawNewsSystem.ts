import { PlayerConfig } from '../types';
import { ContinentalCompetitionId, ContinentalTournamentSeasonState } from '../types/continentalCompetitions';
import { CONTINENTAL_COMPETITIONS_CATALOG } from './continentalDatabaseSystem';
import { getOrInitContinentalStateForSeason } from './continentalScheduleIntegration';
import {
  InternationalDrawState,
  getOrCreateAuthoritativeDraw,
  isConmebolNation,
} from './internationalDrawEngine';
import { LeagueDatabase } from '../types/leagueEditor';
import { TOP_50_NATIONAL_TEAMS_SEEDS } from '../data/top50NationalTeamsData';

export interface DrawNewsItem {
  id: string;
  category: 'continental' | 'national';
  competitionId: string;
  competitionName: string;
  shortName: string;
  icon: string;
  badgeText: string;
  isPlayerInvolved: boolean;
  headline: string;
  description: string;
  flagOrEmblem?: string;
  continentalTournamentState?: ContinentalTournamentSeasonState;
  nationalDrawState?: InternationalDrawState;
}

/**
 * Detects the continent/region where the player is currently playing at club level.
 */
export function detectPlayerClubContinent(player: PlayerConfig): 'europe' | 'south_america' {
  const clubCountry = (player.clubCountry || player.country || '').toLowerCase();
  const leagueName = (player.league || '').toLowerCase();

  if (
    clubCountry.includes('argentina') ||
    clubCountry.includes('brazil') ||
    clubCountry.includes('uruguay') ||
    clubCountry.includes('colombia') ||
    clubCountry.includes('chile') ||
    clubCountry.includes('ecuador') ||
    clubCountry.includes('peru') ||
    clubCountry.includes('paraguay') ||
    clubCountry.includes('bolivia') ||
    clubCountry.includes('venezuela') ||
    leagueName.includes('libertadores') ||
    leagueName.includes('sudamericana') ||
    leagueName.includes('brasileirao') ||
    leagueName.includes('primera division argentina')
  ) {
    return 'south_america';
  }

  return 'europe';
}

/**
 * Generates news items for continental draws on the player's club continent,
 * plus national team draws for the player's nationality.
 */
export function generateDrawNewsPieces(
  player: PlayerConfig,
  seasonYear: number,
  leagueDb?: LeagueDatabase
): DrawNewsItem[] {
  const newsItems: DrawNewsItem[] = [];
  const playerClubName = player.club || 'Club';
  const playerClubId = player.clubId || `club_${playerClubName.toLowerCase().replace(/\s+/g, '_')}`;

  // 1. Continental tournaments on the continent the player is playing at club level
  const clubContinent = detectPlayerClubContinent(player);
  const continentalCompIds: ContinentalCompetitionId[] =
    clubContinent === 'south_america'
      ? ['CONMEBOL_LIB', 'CONMEBOL_SUD']
      : ['UEFA_CL', 'UEFA_EL', 'UEFA_ECL'];

  continentalCompIds.forEach((compId) => {
    const meta = CONTINENTAL_COMPETITIONS_CATALOG[compId];
    if (!meta) return;

    const { tournamentState, playerClubInTournament } = getOrInitContinentalStateForSeason(
      player,
      seasonYear,
      compId,
      leagueDb
    );

    if (tournamentState) {
      const icon = compId === 'UEFA_CL' ? '⭐' : compId === 'UEFA_EL' ? '🛡️' : compId === 'CONMEBOL_LIB' ? '👑' : compId === 'CONMEBOL_SUD' ? '🌐' : '🏆';
      
      const headline = playerClubInTournament
        ? `${meta.name}: ${playerClubName} Group Decided!`
        : `${meta.name} Draw Completed`;

      const description = playerClubInTournament
        ? `${playerClubName} is officially drawn into the competition. Review your opponents and fixtures.`
        : `The official draw for the ${seasonYear} ${meta.shortName} campaign has finalized all qualified clubs.`;

      newsItems.push({
        id: `news-cont-${compId}-${seasonYear}`,
        category: 'continental',
        competitionId: compId,
        competitionName: meta.name,
        shortName: meta.shortName,
        icon,
        badgeText: playerClubInTournament ? 'CLUB QUALIFIED' : 'CONTINENTAL DRAW',
        isPlayerInvolved: playerClubInTournament,
        headline,
        description,
        continentalTournamentState: tournamentState,
      });
    }
  });

  // 2. National tournaments for the player's nationality country
  const nationCode = (player.nationality?.code || player.countryCode || player.seniorNation || 'ENG').toUpperCase();
  const seed = TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code.toUpperCase() === nationCode);
  const nationName = seed?.name || player.nationality?.name || player.country || 'National Team';
  const isSouthAmericanNation = isConmebolNation(nationCode);

  // Determine relevant international draw for this season
  const isWorldCupYear = seasonYear % 4 === 2; // 2026, 2030, etc.
  const isContinentalEuroOrCopaYear = seasonYear % 4 === 0; // 2028, 2032, etc.

  let nationalCompId = 'UEFA_QUALIFIERS';
  let nationalCompName = 'UEFA European Qualifiers';
  let shortNatName = 'Qualifiers';

  if (isWorldCupYear) {
    nationalCompId = 'FIFA_WORLD_CUP';
    nationalCompName = `FIFA World Cup ${seasonYear}`;
    shortNatName = 'World Cup';
  } else if (isContinentalEuroOrCopaYear) {
    if (isSouthAmericanNation) {
      nationalCompId = 'COPA_AMERICA';
      nationalCompName = `CONMEBOL Copa América ${seasonYear}`;
      shortNatName = 'Copa América';
    } else {
      nationalCompId = 'UEFA_EURO';
      nationalCompName = `UEFA European Championship ${seasonYear}`;
      shortNatName = 'Euro';
    }
  } else {
    if (isSouthAmericanNation) {
      nationalCompId = 'CONMEBOL_ELIMINATORIAS';
      nationalCompName = 'CONMEBOL Eliminatorias';
      shortNatName = 'Eliminatorias';
    } else {
      nationalCompId = 'UEFA_QUALIFIERS';
      nationalCompName = 'UEFA European Qualifiers';
      shortNatName = 'Qualifiers';
    }
  }

  const isTournament = isWorldCupYear || isContinentalEuroOrCopaYear;
  const competitionType: 'tournament' | 'qualifier' = isTournament ? 'tournament' : 'qualifier';

  const authoritativeDraw = getOrCreateAuthoritativeDraw(
    nationCode,
    nationalCompName,
    seasonYear,
    'Senior',
    competitionType
  );

  if (authoritativeDraw) {
    const isPlayerNationIn = authoritativeDraw.groups.some((g) =>
      g.teams.some((t) => t.code.toUpperCase() === nationCode || t.isPlayerNation)
    ) || (authoritativeDraw.leagueTeams && authoritativeDraw.leagueTeams.some((t) => t.code.toUpperCase() === nationCode));

    const iso = seed?.iso || 'un';
    const flagUrl = `https://flagcdn.com/w80/${iso.toLowerCase()}.png`;

    const playerGroup = authoritativeDraw.groups.find((g) =>
      g.teams.some((t) => t.code.toUpperCase() === nationCode || t.isPlayerNation)
    );

    const groupLetter = playerGroup ? playerGroup.groupLetter : (authoritativeDraw.isLeagueFormat ? 'League' : 'A');

    newsItems.push({
      id: `news-nat-${nationalCompId}-${seasonYear}`,
      category: 'national',
      competitionId: nationalCompId,
      competitionName: nationalCompName,
      shortName: shortNatName,
      icon: '🌍',
      badgeText: isPlayerNationIn ? `${nationName.toUpperCase()} IN DRAW` : 'INTERNATIONAL DRAW',
      isPlayerInvolved: isPlayerNationIn,
      headline: `${nationalCompName} Draw: ${nationName} Assigned to Group ${groupLetter}`,
      description: `The draw ceremony has concluded. See all seeded pots and group matchups for ${nationName}.`,
      flagOrEmblem: flagUrl,
      nationalDrawState: authoritativeDraw,
    });
  }

  return newsItems;
}
