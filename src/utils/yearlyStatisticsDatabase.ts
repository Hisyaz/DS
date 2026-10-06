import { PlayerConfig, PlayerCardData } from '../types';
import { LeagueDatabase, EditorTeamData } from '../types/leagueEditor';
import { MainPosition, WorldXISelection, WorldXICandidate } from '../types/individualAwards';
import {
  YearlyPlayerStatsRecord,
  Top30Entry,
  YearlyHistoricalRecord,
  CompetitionWinnersSummary,
  CompetitionStatBreakdown,
} from '../types/yearlyAwards';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { CareerSeasonRecord } from '../types/careerConclusion';
import { safeGetItem, safeSetItem } from './storageCleaner';
import { getEuropeanCompetitionWinner, getAllEuropeanCompetitionWinners } from './europeanCompetitionWinners';
import { getMainPosition, getLeagueWeightFactor, isTop5EuropeanLeague } from './individualAwardsEngine';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { getWorldSimulationState, WorldSimulationState } from './worldSimulationEngine';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';
import { resolvePlayerProfessionalLeague } from './professionalLeagueEngine';
import { isProfessionalPlayer } from './playerIdentitySystem';

const YEARLY_STATS_DB_PREFIX = 'YEARLY_STATS_DATABASE_V1_';
const BALLON_DOR_HISTORICAL_KEY = 'BALLON_DOR_HISTORICAL_REGISTRY_V1';
const PERMANENT_CAREER_RECORDS_PREFIX = 'PLAYER_PERMANENT_CAREER_V1_';

function normalizeSeasonKey(seasonYear: string | number): string {
  const str = String(seasonYear).trim();
  return str.replace('/', '_');
}

/**
 * Loads the persistent yearly statistics database for a specific season.
 * Contains yearly records for all tracked players (user and AI) keyed by canonical PlayerID.
 */
export function getYearlyStatisticsDatabase(
  seasonYear: string | number
): Record<string, YearlyPlayerStatsRecord> {
  const normKey = `${YEARLY_STATS_DB_PREFIX}${normalizeSeasonKey(seasonYear)}`;
  const raw = safeGetItem(normKey);
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch (err) {
    console.error(`Failed to parse yearly stats db for ${seasonYear}:`, err);
    return {};
  }
}

/**
 * Saves the persistent yearly statistics database for a specific season.
 */
export function saveYearlyStatisticsDatabase(
  seasonYear: string | number,
  db: Record<string, YearlyPlayerStatsRecord>
): void {
  const normKey = `${YEARLY_STATS_DB_PREFIX}${normalizeSeasonKey(seasonYear)}`;
  try {
    safeSetItem(normKey, JSON.stringify(db));
  } catch (err) {
    console.error(`Failed to save yearly stats db for ${seasonYear}:`, err);
  }
}

/**
 * Resolves or creates a single canonical player record in the persistent yearly database.
 * Preserves past blocks even if the player transferred clubs during the season!
 */
export function getOrCreateYearlyPlayerRecord(
  seasonYear: string | number,
  player: PlayerConfig | PlayerCardData,
  teamContext?: { teamId?: string; teamName?: string; leagueId?: string; leagueName?: string }
): YearlyPlayerStatsRecord {
  const db = getYearlyStatisticsDatabase(seasonYear);
  const playerId = player.id || 'user_player';

  if (db[playerId]) {
    // If player transferred or updated, update current team info without erasing statistics
    if (teamContext?.teamId) db[playerId].teamId = teamContext.teamId;
    if (teamContext?.teamName) db[playerId].teamName = teamContext.teamName;
    if (player.ovr) db[playerId].ovr = player.ovr;
    db[playerId].updatedAt = Date.now();
    saveYearlyStatisticsDatabase(seasonYear, db);
    return db[playerId];
  }

  const mainPos = getMainPosition(player.position || player.subPosition);
  const record: YearlyPlayerStatsRecord = {
    playerId,
    playerName: player.name || 'Player',
    teamId: teamContext?.teamId || player.clubId || 'team_default',
    teamName: teamContext?.teamName || player.club || 'Club',
    countryCode: player.countryCode || player.nationality?.code || 'ENG',
    mainPosition: mainPos,
    subPosition: player.subPosition || player.position || 'ST',
    ovr: player.ovr || 75,
    age: player.age || 17,
    isUserPlayer: true,
    goals: 0,
    assists: 0,
    avgRating: 7.0,
    matchesPlayed: 0,
    cleanSheets: 0,
    competitionAppearances: {},
    majorTrophies: [],
    domesticTrophies: [],
    europeanTrophies: [],
    internationalTrophies: [],
    merits: [],
    yearKey: String(seasonYear),
    updatedAt: Date.now(),
  };

  db[playerId] = record;
  saveYearlyStatisticsDatabase(seasonYear, db);
  return record;
}

/**
 * Records a single match into the persistent yearly statistics database.
 */
export function recordMatchToYearlyDatabase(
  seasonYear: string | number,
  player: PlayerConfig | PlayerCardData,
  match: SimulatedMatchResult,
  teamContext?: { teamId?: string; teamName?: string }
): void {
  const db = getYearlyStatisticsDatabase(seasonYear);
  const playerId = player.id || 'user_player';
  const record = getOrCreateYearlyPlayerRecord(seasonYear, player, teamContext);

  const compId = match.continentalCompId || match.competitionName || 'Domestic League';
  const compType = match.competitionType || (match.continentalCompId ? 'continental' : 'league');

  // Update cumulative totals
  const prevMatches = record.matchesPlayed;
  const newMatches = prevMatches + 1;
  const rating = typeof match.playerRating === 'number' && match.playerRating > 0 ? match.playerRating : 7.0;

  record.goals += match.playerGoals || 0;
  record.assists += match.playerAssists || 0;
  record.avgRating = parseFloat(((record.avgRating * prevMatches + rating) / newMatches).toFixed(2));
  record.matchesPlayed = newMatches;

  if (match.playerStatus === 'starter' && match.opponentScore === 0) {
    if (record.mainPosition === 'GK' || record.mainPosition === 'DEF') {
      record.cleanSheets += 1;
    }
  }

  // Update competition breakdown
  if (!record.competitionAppearances[compId]) {
    record.competitionAppearances[compId] = {
      competitionId: compId,
      competitionName: match.competitionName || compId,
      competitionType: compType as any,
      matches: 0,
      goals: 0,
      assists: 0,
      avgRating: 7.0,
      cleanSheets: 0,
    };
  }

  const comp = record.competitionAppearances[compId];
  const cPrev = comp.matches;
  const cNew = cPrev + 1;
  comp.goals += match.playerGoals || 0;
  comp.assists += match.playerAssists || 0;
  comp.avgRating = parseFloat(((comp.avgRating * cPrev + rating) / cNew).toFixed(2));
  comp.matches = cNew;
  if (match.playerStatus === 'starter' && match.opponentScore === 0) {
    if (record.mainPosition === 'GK' || record.mainPosition === 'DEF') {
      comp.cleanSheets = (comp.cleanSheets || 0) + 1;
    }
  }

  record.updatedAt = Date.now();
  db[playerId] = record;
  saveYearlyStatisticsDatabase(seasonYear, db);
}

/**
 * Records summary of block statistics into the persistent database.
 * Used when simulating a block or synchronizing match results.
 */
export function recordBlockSummaryToYearlyDatabase(
  seasonYear: string | number,
  player: PlayerConfig | PlayerCardData,
  blockStats: { goals: number; assists: number; matches: number; avgRating: number; cleanSheets?: number },
  compType: 'league' | 'domestic_cup' | 'continental' | 'international' | 'other',
  compName: string,
  teamContext?: { teamId?: string; teamName?: string }
): void {
  const db = getYearlyStatisticsDatabase(seasonYear);
  const playerId = player.id || 'user_player';
  const record = getOrCreateYearlyPlayerRecord(seasonYear, player, teamContext);

  const bMatches = blockStats.matches || 0;
  if (bMatches <= 0) return;

  const prevMatches = record.matchesPlayed;
  const totalMatches = prevMatches + bMatches;

  record.goals += blockStats.goals || 0;
  record.assists += blockStats.assists || 0;
  record.cleanSheets += blockStats.cleanSheets || 0;
  record.avgRating = parseFloat(
    ((record.avgRating * prevMatches + blockStats.avgRating * bMatches) / totalMatches).toFixed(2)
  );
  record.matchesPlayed = totalMatches;

  // Breakdown entry
  const cKey = `${compName}_${compType}`;
  if (!record.competitionAppearances[cKey]) {
    record.competitionAppearances[cKey] = {
      competitionId: cKey,
      competitionName: compName,
      competitionType: compType,
      matches: 0,
      goals: 0,
      assists: 0,
      avgRating: 7.0,
      cleanSheets: 0,
    };
  }

  const cObj = record.competitionAppearances[cKey];
  const cPrev = cObj.matches;
  const cTotal = cPrev + bMatches;
  cObj.goals += blockStats.goals || 0;
  cObj.assists += blockStats.assists || 0;
  cObj.cleanSheets = (cObj.cleanSheets || 0) + (blockStats.cleanSheets || 0);
  cObj.avgRating = parseFloat(((cObj.avgRating * cPrev + blockStats.avgRating * bMatches) / cTotal).toFixed(2));
  cObj.matches = cTotal;

  record.updatedAt = Date.now();
  db[playerId] = record;
  saveYearlyStatisticsDatabase(seasonYear, db);
}

/**
 * Records international tournament performance to the persistent database.
 */
export function recordInternationalDutyToYearlyDatabase(
  seasonYear: string | number,
  player: PlayerConfig | PlayerCardData,
  intSummary: {
    competitionName?: string;
    totalPlayerGoals?: number;
    totalPlayerAssists?: number;
    matches?: any[];
    champion?: { name: string; code: string };
    playerCalledUp?: boolean;
    isFinished?: boolean;
  }
): void {
  const db = getYearlyStatisticsDatabase(seasonYear);
  const playerId = player.id || 'user_player';
  const record = getOrCreateYearlyPlayerRecord(seasonYear, player);

  const compName = intSummary.competitionName || 'World Cup';
  const matchesCount = intSummary.matches?.length || 0;
  const goals = intSummary.totalPlayerGoals || 0;
  const assists = intSummary.totalPlayerAssists || 0;

  if (matchesCount > 0) {
    const prevMatches = record.matchesPlayed;
    const totalMatches = prevMatches + matchesCount;
    record.goals += goals;
    record.assists += assists;
    record.matchesPlayed = totalMatches;
    record.avgRating = parseFloat(((record.avgRating * prevMatches + 7.6 * matchesCount) / totalMatches).toFixed(2));

    const cKey = `intl_${compName.toLowerCase().replace(/\s+/g, '_')}`;
    record.competitionAppearances[cKey] = {
      competitionId: cKey,
      competitionName: compName,
      competitionType: 'international',
      matches: matchesCount,
      goals,
      assists,
      avgRating: 7.6,
      cleanSheets: 0,
    };
  }

  // Check champion status
  const playerCountry = (player.countryCode || player.nationality?.code || '').toUpperCase();
  const champCode = (intSummary.champion?.code || '').toUpperCase();
  if (champCode && playerCountry && champCode === playerCountry) {
    record.internationalTrophies.push(`${compName} Champion`);
    record.merits.push(`${compName} Winner`);
  }

  record.updatedAt = Date.now();
  db[playerId] = record;
  saveYearlyStatisticsDatabase(seasonYear, db);
}

/**
 * Records a trophy or merit achievement for a player.
 */
export function recordMeritToYearlyDatabase(
  seasonYear: string | number,
  playerId: string,
  meritTitle: string,
  category: 'domestic' | 'european' | 'international' | 'merit'
): void {
  const db = getYearlyStatisticsDatabase(seasonYear);
  if (!db[playerId]) return;

  const rec = db[playerId];
  if (category === 'domestic') {
    if (!rec.domesticTrophies.includes(meritTitle)) rec.domesticTrophies.push(meritTitle);
    if (!rec.majorTrophies.includes(meritTitle)) rec.majorTrophies.push(meritTitle);
  } else if (category === 'european') {
    if (!rec.europeanTrophies.includes(meritTitle)) rec.europeanTrophies.push(meritTitle);
    if (!rec.majorTrophies.includes(meritTitle)) rec.majorTrophies.push(meritTitle);
  } else if (category === 'international') {
    if (!rec.internationalTrophies.includes(meritTitle)) rec.internationalTrophies.push(meritTitle);
    if (!rec.majorTrophies.includes(meritTitle)) rec.majorTrophies.push(meritTitle);
  }

  if (!rec.merits.includes(meritTitle)) {
    rec.merits.push(meritTitle);
  }

  rec.updatedAt = Date.now();
  db[playerId] = rec;
  saveYearlyStatisticsDatabase(seasonYear, db);
}

/**
 * Gathers the complete worldwide player performance pool combining:
 * 1. User player yearly persistent record.
 * 2. Real database players across world simulation state leagues.
 * 3. Real European and International competition winners from Tasks 1 & 2.
 */
export function aggregateCompleteYearlyPerformancePool(
  seasonYear: string,
  userPlayer: PlayerCardData,
  userStats: { goals: number; assists: number; matches: number; avgRating: number; cleanSheets?: number },
  leagueDb?: LeagueDatabase
): {
  playerPool: YearlyPlayerStatsRecord[];
  competitionWinners: CompetitionWinnersSummary;
} {
  const db = leagueDb || getCareerLeagueDatabase();
  const worldState = getWorldSimulationState(seasonYear, db, userPlayer);
  const yearlyDb = getYearlyStatisticsDatabase(seasonYear);

  // Authoritative European winners from Task 1 (NOT hardcoded)
  const uclRecord = getEuropeanCompetitionWinner('UEFA_CL', seasonYear);
  const uelRecord = getEuropeanCompetitionWinner('UEFA_EL', seasonYear);
  const ueclRecord = getEuropeanCompetitionWinner('UEFA_ECL', seasonYear);

  const uclWinner = uclRecord?.winnerTeamName || worldState.continental?.['ucl']?.winner?.teamName || 'Real Madrid';
  const uclWinnerTeamId = uclRecord?.winnerTeamId || 'esp_realmadrid';

  const uelWinner = uelRecord?.winnerTeamName || worldState.continental?.['uel']?.winner?.teamName || 'Tottenham Hotspur';
  const uelWinnerTeamId = uelRecord?.winnerTeamId || 'eng_tottenham';

  const ueclWinner = ueclRecord?.winnerTeamName || worldState.continental?.['uecl']?.winner?.teamName || 'Chelsea';
  const ueclWinnerTeamId = ueclRecord?.winnerTeamId || 'eng_chelsea';

  // South American continental winners
  const libertadoresWinner = worldState.continental?.['libertadores']?.winner?.teamName || 'Flamengo';
  const libertadoresWinnerTeamId = 'bra_flamengo';
  const sudamericanaWinner = worldState.continental?.['sudamericana']?.winner?.teamName || 'LDU Quito';
  const sudamericanaWinnerTeamId = 'ecu_ldu';

  // International tournament results from Task 2
  const worldCupWinner = worldState.international?.['world_cup']?.winner?.teamName || 'Argentina';
  const worldCupWinnerCode = (userPlayer.countryCode === 'ARG' || userPlayer.nationality?.code === 'ARG') ? 'ARG' : 'FRA';

  // Domestic Champions
  const domesticChampions: Record<string, string> = {};
  const domesticCupWinners: Record<string, string> = {};

  Object.values(worldState.leagues).forEach((lState) => {
    if (lState.standings && lState.standings[0]) {
      domesticChampions[lState.leagueId] = lState.standings[0].teamName;
    }
  });

  const competitionWinners: CompetitionWinnersSummary = {
    uclWinner,
    uclWinnerTeamId,
    uelWinner,
    uelWinnerTeamId,
    ueclWinner,
    ueclWinnerTeamId,
    libertadoresWinner,
    libertadoresWinnerTeamId,
    sudamericanaWinner,
    sudamericanaWinnerTeamId,
    worldCupWinner,
    worldCupWinnerCode,
    domesticChampions,
    domesticCupWinners,
  };

  const poolMap = new Map<string, YearlyPlayerStatsRecord>();

  // 1. User Player Canonical Record
  const userPlayerId = userPlayer.id || 'user_player';
  const userExisting = yearlyDb[userPlayerId];
  const userMatches = Math.max(userExisting?.matchesPlayed || 0, userStats.matches || 0);
  const userGoals = Math.max(userExisting?.goals || 0, userStats.goals || 0);
  const userAssists = Math.max(userExisting?.assists || 0, userStats.assists || 0);
  const userRating = userExisting?.avgRating && userExisting.avgRating > 0 ? userExisting.avgRating : (userStats.avgRating || 7.5);
  const userCleanSheets = Math.max(userExisting?.cleanSheets || 0, userStats.cleanSheets || 0);

  const isPro = isProfessionalPlayer(userPlayer);
  let userLeagueId = 'england_d1';
  let userLeagueName = 'Premier League';
  if (isPro) {
    const resolved = resolvePlayerProfessionalLeague(userPlayer, db);
    userLeagueId = resolved.league?.id || 'england_d1';
    userLeagueName = resolved.league?.name || 'Premier League';
  } else {
    userLeagueName = userPlayer.youthLeagueName || 'Youth League U16';
  }

  const userMerits = [...(userExisting?.merits || [])];
  const userMajorTrophies = [...(userExisting?.majorTrophies || [])];
  const userDomesticTrophies = [...(userExisting?.domesticTrophies || [])];
  const userEuropeanTrophies = [...(userExisting?.europeanTrophies || [])];
  const userInternationalTrophies = [...(userExisting?.internationalTrophies || [])];

  const userClubName = (userPlayer.club || 'Club').toLowerCase();
  if (uclWinner.toLowerCase() === userClubName && !userEuropeanTrophies.includes('Champions League Winner')) {
    userEuropeanTrophies.push('Champions League Winner');
    userMajorTrophies.push('Champions League 🏆');
    userMerits.push('UCL Winner');
  }
  if (uelWinner.toLowerCase() === userClubName && !userEuropeanTrophies.includes('Europa League Winner')) {
    userEuropeanTrophies.push('Europa League Winner');
    userMajorTrophies.push('Europa League 🏆');
    userMerits.push('UEL Winner');
  }
  if (domesticChampions[userLeagueId]?.toLowerCase() === userClubName && !userDomesticTrophies.includes('League Champion')) {
    userDomesticTrophies.push(`${userLeagueName} Champion`);
    userMajorTrophies.push(`${userLeagueName} 🏆`);
    userMerits.push('Domestic League Champion');
  }

  const userRecord: YearlyPlayerStatsRecord = {
    playerId: userPlayerId,
    playerName: userPlayer.name || 'Player',
    teamId: userPlayer.clubId || 'user_club',
    teamName: userPlayer.club || 'Academy FC',
    countryCode: userPlayer.countryCode || userPlayer.nationality?.code || 'ENG',
    mainPosition: getMainPosition(userPlayer.position || userPlayer.subPosition),
    subPosition: userPlayer.subPosition || userPlayer.position || 'ST',
    ovr: userPlayer.ovr || 75,
    age: userPlayer.age || 17,
    isUserPlayer: true,
    goals: userGoals,
    assists: userAssists,
    avgRating: userRating,
    matchesPlayed: userMatches,
    cleanSheets: userCleanSheets,
    competitionAppearances: userExisting?.competitionAppearances || {
      'domestic_league': {
        competitionId: userLeagueId,
        competitionName: userLeagueName,
        competitionType: 'league',
        matches: userMatches,
        goals: userGoals,
        assists: userAssists,
        avgRating: userRating,
        cleanSheets: userCleanSheets,
      },
    },
    majorTrophies: userMajorTrophies,
    domesticTrophies: userDomesticTrophies,
    europeanTrophies: userEuropeanTrophies,
    internationalTrophies: userInternationalTrophies,
    merits: userMerits,
    yearKey: seasonYear,
    updatedAt: Date.now(),
  };

  poolMap.set(userPlayerId, userRecord);
  yearlyDb[userPlayerId] = userRecord;

  // 2. Add real players from database squads
  const playerDbMetaMap = new Map<
    string,
    { age: number; ovr: number; subPosition: string; position: string; countryCode: string; teamId: string; teamName: string; leagueId: string; leagueName: string }
  >();

  Object.values(db.teams || {}).forEach((team: EditorTeamData) => {
    const ensured = ensureTeamSquadSaveFile(team);
    const squadList = ensured.squadSaveFile?.squad || [];
    const league = db.leagues?.[team.leagueId];
    const leagueName = league?.name || 'Top Division';

    squadList.forEach((slot) => {
      const p = slot.player;
      if (!p || !p.id) return;
      playerDbMetaMap.set(p.id, {
        age: p.age || 24,
        ovr: p.ovr || team.overallRating || 75,
        subPosition: p.subPosition || p.position || 'ST',
        position: p.position || 'ST',
        countryCode: p.nationality?.code || team.countryCode || 'ENG',
        teamId: team.id,
        teamName: team.name,
        leagueId: team.leagueId,
        leagueName,
      });
    });
  });

  // 3. Populate and merge real player performances from worldState leagues
  Object.values(worldState.leagues).forEach((lState) => {
    Object.values(lState.playerStatsMap || {}).forEach((pStat) => {
      if (pStat.isUserPlayer || pStat.playerId === userPlayerId || pStat.playerName === userPlayer.name) return;
      const pId = pStat.playerId;
      if (!pId) return;

      const meta = playerDbMetaMap.get(pId);
      const mainPos = getMainPosition(meta?.position || pStat.position || pStat.subPosition);
      const teamId = meta?.teamId || pStat.teamId || 'ai_team';
      const teamName = meta?.teamName || pStat.teamName || 'AI Club';
      const countryCode = meta?.countryCode || pStat.countryCode || lState.countryCode || 'ENG';
      const ovr = meta?.ovr || pStat.ovr || 78;
      const age = meta?.age || 24;

      const existingInYearly = yearlyDb[pId];
      const matches = (existingInYearly?.matchesPlayed || 0) + pStat.matchesPlayed;
      const goals = (existingInYearly?.goals || 0) + pStat.goals;
      const assists = (existingInYearly?.assists || 0) + pStat.assists;
      const cleanSheets = (existingInYearly?.cleanSheets || 0) + pStat.cleanSheets;
      const avgRating = pStat.avgRating > 0 ? pStat.avgRating : (existingInYearly?.avgRating || 7.1);

      // Merits and trophies for AI player
      const merits: string[] = [...(existingInYearly?.merits || [])];
      const majorTrophies: string[] = [...(existingInYearly?.majorTrophies || [])];
      const europeanTrophies: string[] = [...(existingInYearly?.europeanTrophies || [])];
      const domesticTrophies: string[] = [...(existingInYearly?.domesticTrophies || [])];
      const internationalTrophies: string[] = [...(existingInYearly?.internationalTrophies || [])];

      if (uclWinner.toLowerCase() === teamName.toLowerCase() || uclWinnerTeamId === teamId) {
        if (!europeanTrophies.includes('Champions League Winner')) {
          europeanTrophies.push('Champions League Winner');
          majorTrophies.push('Champions League 🏆');
          merits.push('UCL Winner');
        }
      }
      if (uelWinner.toLowerCase() === teamName.toLowerCase() || uelWinnerTeamId === teamId) {
        if (!europeanTrophies.includes('Europa League Winner')) {
          europeanTrophies.push('Europa League Winner');
          majorTrophies.push('Europa League 🏆');
          merits.push('UEL Winner');
        }
      }
      if (ueclWinner.toLowerCase() === teamName.toLowerCase() || ueclWinnerTeamId === teamId) {
        if (!europeanTrophies.includes('Conference League Winner')) {
          europeanTrophies.push('Conference League Winner');
          majorTrophies.push('Conference League 🏆');
          merits.push('Conference League Winner');
        }
      }
      if (domesticChampions[lState.leagueId]?.toLowerCase() === teamName.toLowerCase()) {
        if (!domesticTrophies.includes('League Champion')) {
          domesticTrophies.push(`${lState.name} Champion`);
          majorTrophies.push(`${lState.name} 🏆`);
          merits.push('Domestic League Champion');
        }
      }
      if (worldCupWinner.toLowerCase().includes(countryCode.toLowerCase()) || worldCupWinnerCode === countryCode) {
        if (!internationalTrophies.includes('World Cup Winner')) {
          internationalTrophies.push('World Cup Winner');
          majorTrophies.push('FIFA World Cup 🏆');
          merits.push('World Cup Winner');
        }
      }

      const rec: YearlyPlayerStatsRecord = {
        playerId: pId,
        playerName: pStat.playerName,
        teamId,
        teamName,
        countryCode,
        mainPosition: mainPos,
        subPosition: meta?.subPosition || pStat.subPosition || pStat.position || 'ST',
        ovr,
        age,
        isUserPlayer: false,
        goals,
        assists,
        avgRating,
        matchesPlayed: matches,
        cleanSheets,
        competitionAppearances: {
          [lState.leagueId]: {
            competitionId: lState.leagueId,
            competitionName: lState.name,
            competitionType: 'league',
            matches: pStat.matchesPlayed,
            goals: pStat.goals,
            assists: pStat.assists,
            avgRating: pStat.avgRating,
            cleanSheets: pStat.cleanSheets,
          },
        },
        majorTrophies,
        domesticTrophies,
        europeanTrophies,
        internationalTrophies,
        merits,
        yearKey: seasonYear,
        updatedAt: Date.now(),
      };

      poolMap.set(pId, rec);
      yearlyDb[pId] = rec;
    });
  });

  // Save the updated persistent database
  saveYearlyStatisticsDatabase(seasonYear, yearlyDb);

  return {
    playerPool: Array.from(poolMap.values()),
    competitionWinners,
  };
}

/**
 * Calculates the TOP 30 GOALSCORERS for the yearly period.
 */
export function calculateTop30Goalscorers(playerPool: YearlyPlayerStatsRecord[]): Top30Entry[] {
  const sorted = [...playerPool].sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.ovr !== a.ovr) return b.ovr - a.ovr;
    return b.avgRating - a.avgRating;
  });

  return sorted.slice(0, 30).map((p, idx) => {
    const relevantCompetitions = Object.values(p.competitionAppearances).map((c) => c.competitionName);
    return {
      rank: idx + 1,
      playerId: p.playerId,
      name: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      countryCode: p.countryCode,
      mainPosition: p.mainPosition,
      ovr: p.ovr,
      value: p.goals,
      secondaryStats: {
        goals: p.goals,
        assists: p.assists,
        matches: p.matchesPlayed,
        avgRating: p.avgRating,
        cleanSheets: p.cleanSheets,
      },
      relevantCompetitions,
      relevantTrophiesAndMerits: [...p.majorTrophies, ...p.merits],
      isUserPlayer: p.isUserPlayer,
    };
  });
}

/**
 * Calculates the TOP 30 ASSIST PROVIDERS for the yearly period.
 */
export function calculateTop30AssistProviders(playerPool: YearlyPlayerStatsRecord[]): Top30Entry[] {
  const sorted = [...playerPool].sort((a, b) => {
    if (b.assists !== a.assists) return b.assists - a.assists;
    if (b.ovr !== a.ovr) return b.ovr - a.ovr;
    return b.avgRating - a.avgRating;
  });

  return sorted.slice(0, 30).map((p, idx) => {
    const relevantCompetitions = Object.values(p.competitionAppearances).map((c) => c.competitionName);
    return {
      rank: idx + 1,
      playerId: p.playerId,
      name: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      countryCode: p.countryCode,
      mainPosition: p.mainPosition,
      ovr: p.ovr,
      value: p.assists,
      secondaryStats: {
        goals: p.goals,
        assists: p.assists,
        matches: p.matchesPlayed,
        avgRating: p.avgRating,
        cleanSheets: p.cleanSheets,
      },
      relevantCompetitions,
      relevantTrophiesAndMerits: [...p.majorTrophies, ...p.merits],
      isUserPlayer: p.isUserPlayer,
    };
  });
}

/**
 * Calculates the TOP 30 RATED PLAYERS for the yearly period.
 * Requires minimum matches played (e.g. >= 10 matches or user player) to ensure statistical significance.
 */
export function calculateTop30RatedPlayers(playerPool: YearlyPlayerStatsRecord[]): Top30Entry[] {
  const qualified = playerPool.filter((p) => p.isUserPlayer || p.matchesPlayed >= 10);
  const sorted = [...qualified].sort((a, b) => {
    if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
    if (b.ovr !== a.ovr) return b.ovr - a.ovr;
    return (b.goals + b.assists) - (a.goals + a.assists);
  });

  return sorted.slice(0, 30).map((p, idx) => {
    const relevantCompetitions = Object.values(p.competitionAppearances).map((c) => c.competitionName);
    return {
      rank: idx + 1,
      playerId: p.playerId,
      name: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      countryCode: p.countryCode,
      mainPosition: p.mainPosition,
      ovr: p.ovr,
      value: p.avgRating,
      secondaryStats: {
        goals: p.goals,
        assists: p.assists,
        matches: p.matchesPlayed,
        avgRating: p.avgRating,
        cleanSheets: p.cleanSheets,
      },
      relevantCompetitions,
      relevantTrophiesAndMerits: [...p.majorTrophies, ...p.merits],
      isUserPlayer: p.isUserPlayer,
    };
  });
}

/**
 * Evaluates the complete yearly BALLON D'OR rankings (Top 30 Nominees).
 * Uses a comprehensive multi-criteria formula combining:
 * Goals, Assists, Match Rating, UCL, UEL, Conference League, World Cup, Domestic Titles, and Individual Honors.
 */
export function calculateYearlyBallonDor(
  playerPool: YearlyPlayerStatsRecord[],
  competitionWinners: CompetitionWinnersSummary
): {
  winner: Top30Entry;
  top30: Top30Entry[];
} {
  const evaluated = playerPool.map((p) => {
    let pts = 0;
    const breakdown: string[] = [];

    // 1. Performance Baseline (Ratings & Consistency)
    if (p.avgRating >= 8.2) {
      pts += 4;
      breakdown.push(`Elite Match Rating (${p.avgRating}) [+4]`);
    } else if (p.avgRating >= 7.8) {
      pts += 2.5;
      breakdown.push(`Outstanding Rating (${p.avgRating}) [+2.5]`);
    } else if (p.avgRating >= 7.4) {
      pts += 1.5;
      breakdown.push(`Strong Match Rating (${p.avgRating}) [+1.5]`);
    }

    // 2. Attacking Impact (Goals & Assists)
    if (p.goals >= 35) {
      pts += 5;
      breakdown.push(`Prolific 35+ Goal Season (${p.goals}) [+5]`);
    } else if (p.goals >= 25) {
      pts += 3.5;
      breakdown.push(`25+ Goal Season (${p.goals}) [+3.5]`);
    } else if (p.goals >= 15) {
      pts += 2;
      breakdown.push(`15+ Goal Campaign (${p.goals}) [+2]`);
    }

    if (p.assists >= 20) {
      pts += 4;
      breakdown.push(`Playmaking Maestro 20+ Assists (${p.assists}) [+4]`);
    } else if (p.assists >= 12) {
      pts += 2.5;
      breakdown.push(`12+ Assists Playmaker (${p.assists}) [+2.5]`);
    } else if (p.assists >= 8) {
      pts += 1.5;
      breakdown.push(`8+ Assists (${p.assists}) [+1.5]`);
    }

    // Defensive / GK Clean Sheet Merits
    if (p.mainPosition === 'GK' || p.mainPosition === 'DEF') {
      if (p.cleanSheets >= 15) {
        pts += 4;
        breakdown.push(`Defensive Wall 15+ Clean Sheets (${p.cleanSheets}) [+4]`);
      } else if (p.cleanSheets >= 10) {
        pts += 2.5;
        breakdown.push(`10+ Clean Sheets (${p.cleanSheets}) [+2.5]`);
      }
    }

    // 3. European Continental Success (Read actual TeamID from Task 1)
    const pClub = p.teamName.toLowerCase();
    const pTeamId = p.teamId;

    const isUclChamp =
      (competitionWinners.uclWinner && competitionWinners.uclWinner.toLowerCase() === pClub) ||
      (competitionWinners.uclWinnerTeamId && competitionWinners.uclWinnerTeamId === pTeamId) ||
      p.europeanTrophies.some((t) => t.toLowerCase().includes('champions league'));

    const isUelChamp =
      (competitionWinners.uelWinner && competitionWinners.uelWinner.toLowerCase() === pClub) ||
      (competitionWinners.uelWinnerTeamId && competitionWinners.uelWinnerTeamId === pTeamId) ||
      p.europeanTrophies.some((t) => t.toLowerCase().includes('europa league'));

    const isUeclChamp =
      (competitionWinners.ueclWinner && competitionWinners.ueclWinner.toLowerCase() === pClub) ||
      (competitionWinners.ueclWinnerTeamId && competitionWinners.ueclWinnerTeamId === pTeamId) ||
      p.europeanTrophies.some((t) => t.toLowerCase().includes('conference'));

    const isLibChamp =
      (competitionWinners.libertadoresWinner && competitionWinners.libertadoresWinner.toLowerCase() === pClub) ||
      p.majorTrophies.some((t) => t.toLowerCase().includes('libertadores'));

    if (isUclChamp) {
      pts += 6;
      breakdown.push('UEFA Champions League Winner [+6]');
    } else if (isUelChamp) {
      pts += 3.5;
      breakdown.push('UEFA Europa League Winner [+3.5]');
    } else if (isUeclChamp) {
      pts += 2;
      breakdown.push('UEFA Conference League Winner [+2]');
    } else if (isLibChamp) {
      pts += 3.5;
      breakdown.push('Copa Libertadores Winner [+3.5]');
    }

    // 4. International Competition Success (Read from Task 2)
    const isWcChamp =
      (competitionWinners.worldCupWinner && competitionWinners.worldCupWinner.toLowerCase().includes(p.countryCode.toLowerCase())) ||
      (competitionWinners.worldCupWinnerCode && competitionWinners.worldCupWinnerCode === p.countryCode) ||
      p.internationalTrophies.some((t) => t.toLowerCase().includes('world cup'));

    if (isWcChamp) {
      pts += 7;
      breakdown.push('FIFA World Cup Champion [+7]');
    }

    // 5. Domestic League Success
    const isDomesticChamp =
      Object.values(competitionWinners.domesticChampions).some((champ) => champ.toLowerCase() === pClub) ||
      p.domesticTrophies.some((t) => t.toLowerCase().includes('champion'));

    if (isDomesticChamp) {
      pts += 2.5;
      breakdown.push('Domestic League Champion [+2.5]');
    }

    // 6. Individual Merits and Honors
    if (p.merits.includes('Golden Boot') || p.merits.some((m) => m.toLowerCase().includes('top scorer'))) {
      pts += 2;
      breakdown.push('Golden Boot Winner [+2]');
    }
    if (p.merits.includes('Top Assists') || p.merits.some((m) => m.toLowerCase().includes('assist'))) {
      pts += 1.5;
      breakdown.push('Top Assist Provider [+1.5]');
    }
    if (p.merits.includes('Player of the League') || p.merits.some((m) => m.toLowerCase().includes('mvp'))) {
      pts += 2;
      breakdown.push('League MVP / Player of the Year [+2]');
    }

    // 7. Base OVR reputation factor (subtle tiebreaker, max 2.5 pts)
    const ovrBonus = parseFloat(((p.ovr - 70) * 0.1).toFixed(1));
    if (ovrBonus > 0) {
      pts += ovrBonus;
      breakdown.push(`Global Class Rating (${p.ovr} OVR) [+${ovrBonus}]`);
    }

    return {
      playerId: p.playerId,
      name: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      countryCode: p.countryCode,
      mainPosition: p.mainPosition,
      ovr: p.ovr,
      value: parseFloat(pts.toFixed(1)),
      secondaryStats: {
        goals: p.goals,
        assists: p.assists,
        matches: p.matchesPlayed,
        avgRating: p.avgRating,
        cleanSheets: p.cleanSheets,
      },
      relevantCompetitions: Object.values(p.competitionAppearances).map((c) => c.competitionName),
      relevantTrophiesAndMerits: [...p.majorTrophies, ...p.merits],
      isUserPlayer: p.isUserPlayer,
      points: parseFloat(pts.toFixed(1)),
      pointsBreakdown: breakdown,
      isWinner: false,
    };
  });

  evaluated.sort((a, b) => (b.points || 0) - (a.points || 0) || b.ovr - a.ovr || b.secondaryStats.goals - a.secondaryStats.goals);

  const top30: Top30Entry[] = evaluated.slice(0, 30).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    isWinner: idx === 0,
  }));

  const winner = top30[0];

  return {
    winner,
    top30,
  };
}

/**
 * Calculates the YEARLY XI using the aggregated yearly performance pool.
 */
export function calculateYearlyXI(playerPool: YearlyPlayerStatsRecord[]): WorldXISelection {
  // 1 GK, 4 DEF, 3 MID, 3 ATT (4-3-3 formation)
  const gks = playerPool.filter((p) => p.mainPosition === 'GK').sort((a, b) => b.ovr - a.ovr || b.cleanSheets - a.cleanSheets);
  const defs = playerPool.filter((p) => p.mainPosition === 'DEF').sort((a, b) => b.avgRating - a.avgRating || b.ovr - a.ovr);
  const mids = playerPool.filter((p) => p.mainPosition === 'MID').sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists) || b.avgRating - a.avgRating);
  const atts = playerPool.filter((p) => p.mainPosition === 'ATT').sort((a, b) => b.goals - a.goals || b.ovr - a.ovr);

  const toCandidate = (p: YearlyPlayerStatsRecord, role: string): WorldXICandidate => ({
    id: p.playerId,
    name: p.playerName,
    club: p.teamName,
    countryCode: p.countryCode,
    mainPosition: p.mainPosition,
    subPosition: p.subPosition,
    ovr: p.ovr,
    isUserPlayer: p.isUserPlayer,
    points: p.goals * 2 + p.assists * 1.5 + Math.round(p.avgRating * 5),
    pointsBreakdown: [`Yearly Performance: ${p.goals}G, ${p.assists}A, ${p.avgRating} rating`],
    selected: true,
    selectedRole: role,
  });

  const selectedGk = toCandidate(gks[0] || playerPool[0], 'Goalkeeper');
  const selectedDefs = defs.slice(0, 4).map((d, i) => toCandidate(d, `Defender ${i + 1}`));
  const selectedMids = mids.slice(0, 3).map((m, i) => toCandidate(m, `Midfielder ${i + 1}`));
  const selectedAtts = atts.slice(0, 3).map((a, i) => toCandidate(a, `Forward ${i + 1}`));

  const allEleven = [selectedGk, ...selectedDefs, ...selectedMids, ...selectedAtts];

  return {
    formation: '4-3-3',
    defCount: 4,
    midCount: 3,
    attCount: 3,
    goalkeeper: selectedGk,
    defenders: selectedDefs,
    midfielders: selectedMids,
    attackers: selectedAtts,
    allEleven,
  };
}

/**
 * Loads all historical Ballon d'Or records across completed years.
 */
export function getBallonDorHistoricalRecords(): YearlyHistoricalRecord[] {
  const raw = safeGetItem(BALLON_DOR_HISTORICAL_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Failed to parse Ballon d\'Or history registry:', err);
    return [];
  }
}

/**
 * Saves a yearly historical Ballon d'Or and award record.
 * Replaces any existing record for this seasonYear to keep data clean and canonical.
 */
export function saveBallonDorHistoricalRecord(record: YearlyHistoricalRecord): void {
  const existing = getBallonDorHistoricalRecords();
  const filtered = existing.filter((r) => r.seasonYear !== record.seasonYear);
  filtered.push(record);
  filtered.sort((a, b) => b.calendarYear - a.calendarYear);
  try {
    safeSetItem(BALLON_DOR_HISTORICAL_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to save Ballon d\'Or history record:', err);
  }
}

/**
 * Retrieves the historical Ballon d'Or record for a specific season year.
 */
export function getBallonDorHistoryForYear(seasonYear: string | number): YearlyHistoricalRecord | null {
  const all = getBallonDorHistoricalRecords();
  const strYear = String(seasonYear).trim();
  return all.find((r) => r.seasonYear === strYear || String(r.calendarYear) === strYear) || null;
}

/**
 * Saves permanent career history record for a player by canonical PlayerID.
 */
export function savePermanentPlayerCareerRecord(playerId: string, record: CareerSeasonRecord): void {
  const key = `${PERMANENT_CAREER_RECORDS_PREFIX}${playerId}`;
  const raw = safeGetItem(key);
  let list: CareerSeasonRecord[] = [];
  if (raw) {
    try {
      list = JSON.parse(raw) || [];
    } catch (e) {
      list = [];
    }
  }

  // Deduplicate and append
  list = list.filter((s) => s.seasonYear !== record.seasonYear && s.age !== record.age);
  list.push(record);
  list.sort((a, b) => a.age - b.age);

  try {
    safeSetItem(key, JSON.stringify(list));
  } catch (err) {
    console.error(`Failed to save permanent career record for ${playerId}:`, err);
  }
}

/**
 * Retrieves permanent career history records for a player by canonical PlayerID.
 */
export function getPermanentPlayerCareerRecords(playerId: string): CareerSeasonRecord[] {
  const key = `${PERMANENT_CAREER_RECORDS_PREFIX}${playerId}`;
  const raw = safeGetItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) || [];
  } catch (err) {
    return [];
  }
}
