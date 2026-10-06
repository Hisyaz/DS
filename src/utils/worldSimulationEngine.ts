import { LeagueDatabase, EditorTeamData, LeagueData, TacticalStyle } from '../types/leagueEditor';
import { PlayerCardData, PlayerConfig } from '../types';
import { YouthLeagueStanding, QualificationBadge } from '../types/youthLeague';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { getCareerLeagueDatabase, saveCareerLeagueDatabase } from './careerSaveSystem';
import { getSanitizedTeamsForLeague, cleanLeagueName } from './leagueSanitizer';
import {
  simulateDatabaseMatch,
  SimulatedDatabaseMatchResult,
  MatchPlayerStats,
  MatchPlayerEvent,
} from './databaseMatchSimulationEngine';
import {
  simulateLightweightMatch,
  invalidateTeamStrengthCache,
  getCachedTeamTacticalProfile,
  calculateLightweightPlayerRating,
} from './lightweightMatchEngine';
import { getLocalizedCalendarDateString, getCalendarDateForMatchdayIndex } from './calendarDateFormatter';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';
import { PROFESSIONAL_LEAGUE_RULES, LeagueFormatRule, getProfessionalQualificationBadge } from './professionalLeagueEngine';
import { safeGetItem, safeSetItem, getSafeLocalStorage } from './storageCleaner';
import { isProfessionalPlayer, getPlayerCareerStage } from './playerIdentitySystem';
import {
  getContinentalTournamentState,
  saveContinentalTournamentState,
  generateContinentalTournamentDraw,
  simulateContinentalGroupMatchday,
  simulateContinentalLeaguePhaseMatchday,
  simulateSingleContinentalMatch,
  advanceContinentalKnockoutStage,
} from './continentalTournamentEngine';
import { CONTINENTAL_COMPETITIONS_CATALOG } from './continentalDatabaseSystem';
import {
  determineContinentalQualifiers,
  buildDomesticSeasonSnapshots,
} from './continentalQualificationSystem';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { syncContinentalSimulationAfterMatch } from './continentalScheduleIntegration';
import { recordUniqueCareerMatchToYearlyAwardData, getYearlyAwardData } from './yearlyAwardDataSystem';
import { recordLeagueSeasonFinish } from './powerscaleSystem';

export interface WorldPlayerSeasonStat {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  countryCode?: string;
  position: string;
  subPosition: string;
  playStyle: string;
  ovr: number;
  isUserPlayer?: boolean;
  matchesPlayed: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  totalRating: number;
  avgRating: number;
  cleanSheets: number;
  defensiveStops: number;
  yellowCards: number;
  redCards: number;
}

export interface WorldSimulationDebugMetrics {
  currentWorldDate: string;
  currentCareerDate: string;
  currentSeason: string;
  currentMatchday: number;
  matchesSimulatedThisAdvance: number;
  totalMatchesSimulated: number;
  totalGoalsSimulated: number;
  totalAssistsSimulated: number;
  totalRatingsGenerated: number;
  competitionsUpdated: number;
  lastSimulatedMatch?: {
    homeTeam: string;
    awayTeam: string;
    score: string;
    competitionName: string;
    matchday: number;
    goals: { minute: number; scorer: string; assist?: string }[];
    topPerformers: { name: string; rating: number; club: string }[];
  };
}

export interface WorldLeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  value: number;
  ovr: number;
  position: string;
  subPosition: string;
  isUserPlayer?: boolean;
}

export interface WorldLeagueStandingRow {
  rank: number;
  teamId: string;
  teamName: string;
  countryCode?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  teamOvr: number;
  form: ('W' | 'D' | 'L')[];
  isPlayerTeam: boolean;
  qualificationBadge?: QualificationBadge;
}

export interface WorldLeagueState {
  leagueId: string;
  name: string;
  countryCode: string;
  divisionTier: '1st' | '2nd' | 'youth';
  currentMatchday: number;
  totalMatchdays: number;
  standings: WorldLeagueStandingRow[];
  matchdays: Record<number, SimulatedDatabaseMatchResult[]>;
  topScorers: WorldLeaderboardEntry[];
  topAssists: WorldLeaderboardEntry[];
  topRatings: WorldLeaderboardEntry[];
  playerStatsMap: Record<string, WorldPlayerSeasonStat>;
}

export interface WorldCupRound {
  roundName: string;
  matches: SimulatedDatabaseMatchResult[];
  isCompleted: boolean;
}

export interface WorldDomesticCupState {
  cupId: string;
  name: string;
  countryCode: string;
  currentRoundIndex: number;
  rounds: WorldCupRound[];
  winner?: { teamId: string; teamName: string };
}

export interface WorldContinentalState {
  competitionId: string;
  name: string;
  federation: 'UEFA' | 'CONMEBOL' | 'AFC' | 'CAF' | 'CONCACAF' | string;
  tier: 1 | 2 | 3 | 'supercup';
  groups: {
    groupLetter: string;
    teams: { id: string; name: string; ovr: number; countryCode?: string }[];
    standings: WorldLeagueStandingRow[];
    matchdays: Record<number, SimulatedDatabaseMatchResult[]>;
    isCompleted: boolean;
  }[];
  knockoutRounds: WorldCupRound[];
  winner?: { teamId: string; teamName: string };
  topScorers: WorldLeaderboardEntry[];
  topAssists: WorldLeaderboardEntry[];
  topRatings: WorldLeaderboardEntry[];
}

export interface WorldInternationalAwards {
  mvp?: { name: string; nationName: string; nationCode: string; iso: string; statLabel: string; statValue: string | number; isPlayer?: boolean };
  bestGoalkeeper?: { name: string; nationName: string; nationCode: string; iso: string; statLabel: string; statValue: string | number; isPlayer?: boolean };
  bestDefender?: { name: string; nationName: string; nationCode: string; iso: string; statLabel: string; statValue: string | number; isPlayer?: boolean };
  bestCreator?: { name: string; nationName: string; nationCode: string; iso: string; statLabel: string; statValue: string | number; isPlayer?: boolean };
  topGoalscorer?: { name: string; nationName: string; nationCode: string; iso: string; statLabel: string; statValue: string | number; isPlayer?: boolean };
}

export interface WorldInternationalState {
  competitionId: string;
  name: string;
  type: 'world_cup' | 'continental' | 'u20' | 'u17' | 'club_world_cup';
  seasonYear: string;
  isActive: boolean;
  groups: {
    groupLetter: string;
    standings: WorldLeagueStandingRow[];
    matchdays: Record<number, SimulatedDatabaseMatchResult[]>;
  }[];
  knockoutRounds: WorldCupRound[];
  winner?: { teamId: string; teamName: string };
  runnerUp?: { teamId: string; teamName: string };
  thirdPlace?: { teamId: string; teamName: string };
  topScorers: WorldLeaderboardEntry[];
  topAssists: WorldLeaderboardEntry[];
  topRatings: WorldLeaderboardEntry[];
  awards?: WorldInternationalAwards;
}

export interface WorldSimulationState {
  version: number;
  seasonYear: string;
  currentCalendarMatchday: number; // 0 to 38
  currentCalendarWeek: number; // 0 to 38
  currentCalendarDate: string; // e.g. "Monday, 15 August 2026"
  totalCalendarMatchdays: number;
  leagues: Record<string, WorldLeagueState>;
  domesticCups: Record<string, WorldDomesticCupState>;
  continental: Record<string, WorldContinentalState>;
  international: Record<string, WorldInternationalState>;
  lastUpdated: string;
}

const WORLD_STATE_STORAGE_KEY_PREFIX = 'WORLD_SIMULATION_STATE_ACTIVE_V3_';
let activeWorldStateCache: WorldSimulationState | null = null;

// Telemetry & Debug tracking variables
let matchesSimulatedLastAdvance = 0;
let totalMatchesSimulatedCount = 0;
let totalGoalsSimulatedCount = 0;
let totalAssistsSimulatedCount = 0;
let totalRatingsGeneratedCount = 0;
let lastSimulatedMatchRecord: WorldSimulationDebugMetrics['lastSimulatedMatch'] | undefined;

export function resolveAuthoritativeSeasonYear(
  player?: PlayerCardData | PlayerConfig,
  seasonYearProp?: string
): string {
  if (seasonYearProp && typeof seasonYearProp === 'string' && seasonYearProp.includes('/')) {
    return seasonYearProp;
  }
  if ((player as any)?.seasonYear && typeof (player as any).seasonYear === 'string' && (player as any).seasonYear.includes('/')) {
    return (player as any).seasonYear;
  }
  if ((player as any)?.season && typeof (player as any).season === 'string' && (player as any).season.includes('/')) {
    return (player as any).season;
  }
  if (player?.age && player.age >= 10) {
    const age = player.age;
    return `${2026 + (age - 10)}/${2027 + (age - 10)}`;
  }
  if (seasonYearProp) return seasonYearProp;
  return '2026/27';
}

/**
 * Parses any date string into an authoritative domestic matchday index (0 to 38).
 * Season begins August 15 of startYear (MD 0/1) and ends late May (MD 38).
 */
export function parseDateToMatchday(dateStr?: string, seasonYear: string = '2026/27'): number {
  if (!dateStr) return 0;
  const startYear = parseInt(seasonYear.split('/')[0], 10) || 2026;
  const startDate = new Date(startYear, 7, 15); // August 15

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    // Attempt parsing "17 April 2027" or "Saturday, 17 April 2027"
    const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '').trim();
    const parts = cleaned.split(' ');
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const mIdx = months.findIndex((m) => m.startsWith(parts[1].toLowerCase()));
      const yr = parseInt(parts[2], 10);
      if (!isNaN(day) && mIdx !== -1 && !isNaN(yr)) {
        const d = new Date(yr, mIdx, day);
        const diffMs = d.getTime() - startDate.getTime();
        if (diffMs <= 0) return 0;
        const week = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
        return Math.max(0, Math.min(38, week));
      }
    }
    return 0;
  }

  const diffMs = parsed.getTime() - startDate.getTime();
  if (diffMs <= 0) return 0;
  const week = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(0, Math.min(38, week));
}

/**
 * Returns the single authoritative career simulation timeline date and matchday.
 * Guarantees zero discrepancy between Career Mode date and World Simulation date.
 */
export function getAuthoritativeCareerSimulationTimeline(
  player?: PlayerCardData | PlayerConfig,
  seasonYearProp?: string,
  currentStage?: string,
  block1Count?: number,
  block2Count?: number,
  matchdayOverride?: number
): {
  seasonYear: string;
  targetMatchday: number;
  dateString: string;
  date: Date;
} {
  const age = (player as any)?.age || 10;
  const derivedSeasonYear = `${2026 + (age - 10)}/${2027 + (age - 10)}`;
  const seasonYear = (player as any)?.seasonYear || (player as any)?.season || seasonYearProp || derivedSeasonYear;
  const startYear = parseInt(seasonYear.split('/')[0], 10) || 2026;

  let targetMatchday = 0;

  if (typeof matchdayOverride === 'number' && !isNaN(matchdayOverride)) {
    targetMatchday = Math.max(0, Math.min(38, matchdayOverride));
  } else if (player?.calendarDate) {
    targetMatchday = parseDateToMatchday(player.calendarDate, seasonYear);
  }

  // Adjust matchday if player is currently in specific seasonal stages
  if (currentStage === 'summary' || currentStage === 'draw' || currentStage === 'game_over') {
    targetMatchday = Math.max(targetMatchday, 38);
  } else if (currentStage === 'block2') {
    const b2Matches = block2Count || 0;
    targetMatchday = Math.max(targetMatchday, Math.min(38, 18 + b2Matches * 2));
  } else if (currentStage === 'mid_cards') {
    targetMatchday = Math.max(targetMatchday, 19);
  } else if (currentStage === 'block1') {
    const b1Matches = block1Count || 0;
    if (b1Matches > 0) {
      targetMatchday = Math.max(targetMatchday, Math.min(19, b1Matches * 2));
    }
  }

  const dateString = getCalendarDateForMatchday(targetMatchday, seasonYear);
  const date = getCalendarDateForMatchdayIndex(targetMatchday, seasonYear);

  return {
    seasonYear,
    targetMatchday,
    dateString,
    date,
  };
}

/**
 * Derives the exact localized calendar date for a given weekly matchday in the season.
 * Format: "Day of week, Day Month Year" (e.g. "Monday, 15 August 2029") localized to current language.
 */
export function getCalendarDateForMatchday(matchdayIndex: number, seasonYear: string = '2026/27', isSouthAmerica: boolean = false): string {
  return getLocalizedCalendarDateString(matchdayIndex, seasonYear, undefined, isSouthAmerica);
}

export function getActiveWorldSimulationKey(seasonYear: string = '2026/27'): string {
  const safeYear = seasonYear.replace('/', '_');
  return `${WORLD_STATE_STORAGE_KEY_PREFIX}${safeYear}`;
}

/**
 * Creates double round-robin fixtures schedule for a list of teams in a league.
 */
export function generateLeagueSchedule(
  leagueId: string,
  leagueName: string,
  teams: (EditorTeamData | { id: string; name: string; ovr?: number; countryCode?: string })[]
): Record<number, SimulatedDatabaseMatchResult[]> {
  const schedule: Record<number, SimulatedDatabaseMatchResult[]> = {};
  if (teams.length < 2) return schedule;

  const teamList = teams.map((t) => ({
    id: t.id,
    name: t.name,
    countryCode: t.countryCode || 'ENG',
    ovr: (t as any).overallRating || (t as any).ovr || 72,
    leagueId,
  }));
  if (teamList.length % 2 !== 0) {
    // Add dummy if odd
    teamList.push({ ...teamList[0], id: 'bye_team', name: 'Bye' });
  }

  const numTeams = teamList.length;
  const numRounds = (numTeams - 1) * 2;
  const halfRounds = numTeams - 1;

  for (let round = 0; round < numRounds; round++) {
    const md = round + 1;
    schedule[md] = [];
    const isSecondHalf = round >= halfRounds;
    const roundOffset = round % halfRounds;

    for (let match = 0; match < numTeams / 2; match++) {
      let homeIdx = (roundOffset + match) % (numTeams - 1);
      let awayIdx = (numTeams - 1 - match + roundOffset) % (numTeams - 1);

      if (match === 0) {
        awayIdx = numTeams - 1;
      }

      let homeTeam = teamList[homeIdx];
      let awayTeam = teamList[awayIdx];

      if (isSecondHalf) {
        // Swap for second leg
        const temp = homeTeam;
        homeTeam = awayTeam;
        awayTeam = temp;
      }

      if (homeTeam.id === 'bye_team' || awayTeam.id === 'bye_team') continue;

      schedule[md].push({
        id: `fix_${leagueId}_md${md}_${homeTeam.id}_vs_${awayTeam.id}`,
        competitionId: leagueId,
        competitionName: leagueName,
        stageName: `Matchday ${md}`,
        matchdayIndex: md,
        homeTeamId: homeTeam.id,
        homeTeamName: homeTeam.name,
        homeTeamOvr: homeTeam.ovr || 72,
        awayTeamId: awayTeam.id,
        awayTeamName: awayTeam.name,
        awayTeamOvr: awayTeam.ovr || 72,
        homeScore: 0,
        awayScore: 0,
        isDraw: false,
        isCompleted: false,
        isPlayerMatch: false,
        ticksPlayed: 0,
        events: [],
        homePlayers: [],
        awayPlayers: [],
        homeScorers: [],
        awayScorers: [],
      });
    }
  }

  return schedule;
}

/**
 * Initializes full world simulation state for all active domestic leagues and competitions.
 */
export function initializeWorldSimulationState(
  seasonYear: string = '2026/27',
  db?: LeagueDatabase,
  player?: PlayerCardData
): WorldSimulationState {
  const currentDb = db || getCareerLeagueDatabase();
  const playerClubId = player?.clubId;
  const playerClubName = (player?.club || '').toLowerCase();

  const leaguesState: Record<string, WorldLeagueState> = {};

  // List of all professional canonical leagues
  const leagueIds = [
    'england_d1', 'england_d2',
    'spain_d1', 'spain_d2',
    'italy_d1', 'italy_d2',
    'germany_d1', 'germany_d2',
    'france_d1', 'france_d2',
    'portugal_d1', 'portugal_d2',
    'argentina_d1', 'argentina_d2',
    'brazil_d1', 'brazil_d2',
    'saudi_d1', 'saudi_d2',
  ];

  leagueIds.forEach((leagueId) => {
    const leagueData = currentDb.leagues?.[leagueId];
    let teams = getSanitizedTeamsForLeague(leagueId, currentDb);
    const countryCode = leagueData?.countryCode || (leagueId.split('_')[0] || 'ENG').toUpperCase();
    const isTier2 = leagueId.endsWith('_d2');
    const divisionTier = isTier2 ? '2nd' : '1st';

    // Ensure player's club is injected into their domestic league if they belong to it
    if (player && playerClubName && playerClubName !== 'free agent' && !playerClubName.includes('youth')) {
      const isPlayerInThisLeague =
        player.leagueId === leagueId ||
        teams.some((t) => t.name.toLowerCase() === playerClubName) ||
        (leagueData && player.league && cleanLeagueName(leagueData.name).toLowerCase() === player.league.toLowerCase());

      if (isPlayerInThisLeague) {
        const alreadyIn = teams.some(
          (t) => (playerClubId && t.id === playerClubId) || t.name.toLowerCase() === playerClubName
        );
        if (!alreadyIn) {
          teams.unshift({
            id: playerClubId || 'player_club',
            name: player.club || 'Current Club',
            countryCode,
            overallRating: player.ovr || 75,
          } as any);
        }
      }
    }

    const matchdays = generateLeagueSchedule(leagueId, cleanLeagueName(leagueData?.name || leagueId), teams);
    const totalMatchdays = Object.keys(matchdays).length || (teams.length - 1) * 2 || 38;

    const standings: WorldLeagueStandingRow[] = teams.map((team, idx) => {
      const isPlayer = !!(
        player &&
        ((playerClubId && team.id === playerClubId) ||
          (playerClubName && playerClubName !== 'free agent' && team.name.toLowerCase() === playerClubName))
      );

      const rule = PROFESSIONAL_LEAGUE_RULES[leagueId] || PROFESSIONAL_LEAGUE_RULES.england_d1;
      const qBadge = getProfessionalQualificationBadge(idx + 1, teams.length, rule, countryCode);

      return {
        rank: idx + 1,
        teamId: team.id,
        teamName: team.name,
        countryCode: team.countryCode || countryCode,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        teamOvr: team.ovr || (team as any).overallRating || 72,
        form: [],
        isPlayerTeam: isPlayer,
        qualificationBadge: qBadge,
      };
    });

    leaguesState[leagueId] = {
      leagueId,
      name: cleanLeagueName(leagueData?.name || leagueId),
      countryCode,
      divisionTier,
      currentMatchday: 0,
      totalMatchdays,
      standings,
      matchdays,
      topScorers: [],
      topAssists: [],
      topRatings: [],
      playerStatsMap: {},
    };
  });

  // Provide integrated Youth Super League so youth players and academy matches are also unified
  const youthTeams = [
    { id: playerClubId || 'youth_player_club', name: playerClubName || 'Youth Academy FC', overallRating: player?.ovr || 62, countryCode: 'ENG' },
    { id: 'y_academy_2', name: 'Manchester Academy U18', overallRating: 63, countryCode: 'ENG' },
    { id: 'y_academy_3', name: 'La Masia Juvenil', overallRating: 65, countryCode: 'ESP' },
    { id: 'y_academy_4', name: 'Castilla U18', overallRating: 64, countryCode: 'ESP' },
    { id: 'y_academy_5', name: 'Ajax De Toekomst', overallRating: 63, countryCode: 'NED' },
    { id: 'y_academy_6', name: 'Bayern Campus U18', overallRating: 63, countryCode: 'GER' },
    { id: 'y_academy_7', name: 'Dortmund Nachwuchs', overallRating: 62, countryCode: 'GER' },
    { id: 'y_academy_8', name: 'Benfica Seixal Academy', overallRating: 62, countryCode: 'POR' },
    { id: 'y_academy_9', name: 'Sporting Alcochete', overallRating: 61, countryCode: 'POR' },
    { id: 'y_academy_10', name: 'PSG Youth Academy', overallRating: 63, countryCode: 'FRA' },
    { id: 'y_academy_11', name: 'Milan Primavera', overallRating: 61, countryCode: 'ITA' },
    { id: 'y_academy_12', name: 'Juventus Next Gen U18', overallRating: 62, countryCode: 'ITA' },
  ];
  const youthMatchdays = generateLeagueSchedule('youth_super_league', 'Youth Super League', youthTeams as any);
  const youthStandings: WorldLeagueStandingRow[] = youthTeams.map((team, idx) => ({
    rank: idx + 1,
    teamId: team.id,
    teamName: team.name,
    countryCode: team.countryCode,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    teamOvr: team.overallRating,
    form: [],
    isPlayerTeam: idx === 0,
  }));
  leaguesState['youth_super_league'] = {
    leagueId: 'youth_super_league',
    name: 'Youth Super League',
    countryCode: 'INT',
    divisionTier: 'youth',
    currentMatchday: 0,
    totalMatchdays: Object.keys(youthMatchdays).length || 22,
    standings: youthStandings,
    matchdays: youthMatchdays,
    topScorers: [],
    topAssists: [],
    topRatings: [],
    playerStatsMap: {},
  };

  const worldState: WorldSimulationState = {
    version: 2,
    seasonYear,
    currentCalendarMatchday: 0,
    currentCalendarWeek: 0,
    currentCalendarDate: getCalendarDateForMatchday(0, seasonYear),
    totalCalendarMatchdays: 38,
    leagues: leaguesState,
    domesticCups: {},
    continental: {},
    international: {},
    lastUpdated: new Date().toISOString(),
  };

  activeWorldStateCache = worldState;
  saveWorldSimulationState(worldState);
  return worldState;
}

/**
 * Strict Gatekeeper: Checks if the player is currently in a professional club environment.
 * World Simulation background processing activates when the player has joined a professional club with an active contract.
 */
export function isPlayerInProClub(player?: Partial<PlayerCardData> | Partial<PlayerConfig> | null): boolean {
  if (!player) return false;

  const stage = getPlayerCareerStage(player as any);
  if (stage === 'YOUTH_ACADEMY' || stage === 'FREE_AGENT') {
    return false;
  }

  const club = (player.club || '').toLowerCase().trim();
  if (!club || club === 'free agent' || club === 'youth prospect' || club.includes('youth academy')) {
    return false;
  }

  if (stage === 'PROFESSIONAL') {
    return true;
  }

  return isProfessionalPlayer(player as any);
}

export interface WorldSimulationValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  repaired: boolean;
}

/**
 * Validates simulation integrity before advancing the world calendar (Checks 1 - 7).
 * - Check 1: player.careerStage === 'PROFESSIONAL' / isPlayerInProClub
 * - Check 2: Player's club exists in database
 * - Check 3: Player's league exists in database
 * - Check 4: Exactly one instance of Player ID exists across squads
 * - Check 5: Continental tournament state contains 32 unique teams for UCL / UEL
 * - Check 6: No team exists in both UCL and UEL
 * - Check 7: No match references an invalid or empty team ID
 */
export function validateWorldSimulationIntegrity(
  worldState: WorldSimulationState,
  db: LeagueDatabase,
  userPlayer?: PlayerCardData
): WorldSimulationValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  let repaired = false;

  // Check 1: Career Stage & Pro Club Check
  if (userPlayer) {
    const isPro = isPlayerInProClub(userPlayer);
    if (!isPro) {
      warnings.push(`Check 1: Player is in youth/academy or free agent stage (stage: ${userPlayer.careerStage || 'youth'}, club: ${userPlayer.club || 'academy'}). Background leagues will simulate normally.`);
    }

    // Check 2: Player's club exists in database
    if (userPlayer.clubId) {
      const club = db.teams?.[userPlayer.clubId];
      if (!club) {
        warnings.push(`Check 2: Player clubId "${userPlayer.clubId}" not found in teams database. Auto-repaired.`);
        if (!db.teams) db.teams = {};
        db.teams[userPlayer.clubId] = {
          id: userPlayer.clubId,
          name: userPlayer.club || 'Club',
          leagueId: userPlayer.leagueId || 'england_d1',
          overallRating: userPlayer.ovr || 75,
          countryCode: userPlayer.countryCode || 'INT',
        } as any;
        repaired = true;
      }
    }

    // Check 3: Player's league exists in database
    if (userPlayer.leagueId) {
      const leagueInDb = db.leagues?.[userPlayer.leagueId];
      const leagueInWorld = worldState.leagues[userPlayer.leagueId];
      if (!leagueInDb && !leagueInWorld) {
        warnings.push(`Check 3: Player leagueId "${userPlayer.leagueId}" missing from leagues database.`);
      }
    }

    // Check 4: Exactly one instance of Player ID exists across all squads
    const pid = userPlayer.id;
    if (pid && db.teams) {
      let instancesFound = 0;
      Object.values(db.teams).forEach((t: any) => {
        const squad = t.squad || [];
        if (squad.some((p: any) => p.id === pid)) {
          instancesFound++;
        }
      });
      if (instancesFound > 1) {
        warnings.push(`Check 4: Player ID "${pid}" found in ${instancesFound} club squads. Auto-sanitizing duplicates.`);
        Object.values(db.teams).forEach((t: any) => {
          if (t.id !== userPlayer.clubId && t.squad) {
            t.squad = t.squad.filter((p: any) => p.id !== pid);
          }
        });
        repaired = true;
      }
    }
  }

  // Check 5 & 6: Continental tournament 32 unique teams & mutual exclusivity between UCL and UEL
  const seasonNum = parseInt(worldState.seasonYear.split('/')[0], 10) || 2026;
  const uclState = getContinentalTournamentState('UEFA_CL', seasonNum);
  const uelState = getContinentalTournamentState('UEFA_EL', seasonNum);

  if (uclState && uclState.groups) {
    const uclTeams = new Set<string>();
    uclState.groups.forEach((g) => g.teams.forEach((t) => uclTeams.add(t.id)));
    if (uclTeams.size !== 32) {
      warnings.push(`Check 5: UEFA_CL has ${uclTeams.size} unique teams instead of 32.`);
    }

    if (uelState && uelState.groups) {
      const uelTeams = new Set<string>();
      uelState.groups.forEach((g) => g.teams.forEach((t) => uelTeams.add(t.id)));
      if (uelTeams.size !== 32) {
        warnings.push(`Check 5: UEFA_EL has ${uelTeams.size} unique teams instead of 32.`);
      }

      // Check 6: Mutual exclusivity between UCL and UEL
      const overlap = Array.from(uclTeams).filter((id) => uelTeams.has(id));
      if (overlap.length > 0) {
        errors.push(`Check 6: ${overlap.length} teams overlap in both UCL and UEL (${overlap.join(', ')}). Auto-rebuilding UEL draw.`);
        const uelQualifiers = determineContinentalQualifiers('UEFA_EL', db, [], userPlayer, seasonNum);
        const fixedUel = generateContinentalTournamentDraw('UEFA_EL', seasonNum, uelQualifiers, userPlayer?.clubId);
        saveContinentalTournamentState(fixedUel);
        repaired = true;
      }
    }
  }

  // Check 7: No match references an invalid team ID
  Object.values(worldState.leagues).forEach((league) => {
    Object.values(league.matchdays).forEach((fixtures) => {
      fixtures.forEach((fix) => {
        if (!fix.homeTeamId || !fix.awayTeamId) {
          errors.push(`Check 7: Match fixture "${fix.id}" references an empty or invalid team ID.`);
        }
      });
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    repaired,
  };
}

/**
 * Loads or initializes the authoritative world simulation state.
 * Strictly reads from database / storage without running unsolicited match simulation.
 * The viewer is strictly a live window into the existing simulation state.
 */
export function getWorldSimulationState(
  seasonYear: string = '2026/27',
  db?: LeagueDatabase,
  player?: PlayerCardData | PlayerConfig
): WorldSimulationState {
  const currentDb = db || getCareerLeagueDatabase();
  let state: WorldSimulationState | null = null;

  if (activeWorldStateCache && activeWorldStateCache.seasonYear === seasonYear) {
    state = activeWorldStateCache;
  } else {
    const key = getActiveWorldSimulationKey(seasonYear);
    try {
      const raw = safeGetItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.leagues && Object.keys(parsed.leagues).length > 0) {
          state = parsed;
          activeWorldStateCache = parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading world simulation state from storage:', err);
    }
  }

  if (!state) {
    state = initializeWorldSimulationState(seasonYear, currentDb, player as PlayerCardData);
  }

  return state;
}

/**
 * Advances all active continental competitions (Champions League, Europa League, Conference League,
 * Copa Libertadores, Sudamericana, AFC Champions League, etc.) matching the current calendar week.
 */
export function simulateContinentalCompetitionsForWeek(
  weekMatchday: number,
  seasonYear: string,
  userPlayer?: PlayerCardData,
  db?: LeagueDatabase
): void {
  const currentDb = db || getCareerLeagueDatabase();
  const numericYear = parseInt(seasonYear.split('/')[0], 10) || 2026;
  const compIds: (keyof typeof CONTINENTAL_COMPETITIONS_CATALOG)[] = [
    'UEFA_CL',
    'UEFA_EL',
    'UEFA_ECL',
    'CONMEBOL_LIB',
    'CONMEBOL_SUD',
    'AFC_CL',
    'CAF_CL',
    'CONCACAF_CC',
  ];

  const domesticSnapshots = buildDomesticSeasonSnapshots(currentDb);

  compIds.forEach((compId) => {
    let state = getContinentalTournamentState(compId, numericYear);
    if (!state) {
      const qualifiers = determineContinentalQualifiers(
        compId,
        currentDb,
        domesticSnapshots,
        userPlayer,
        numericYear
      );
      state = generateContinentalTournamentDraw(compId, numericYear, qualifiers, userPlayer?.clubId);
    }
    if (!state) return;

    let updated = false;

    if (state.isLeaguePhaseFormat) {
      // UEFA 36-team League Phase (8 matchdays for UCL/UEL, 6 matchdays for ECL)
      const totalMds = state.leaguePhaseTotalMatchdays || (compId === 'UEFA_ECL' ? 6 : 8);
      const leagueMdMilestones = [
        { domesticWeek: 3, md: 1 },
        { domesticWeek: 6, md: 2 },
        { domesticWeek: 9, md: 3 },
        { domesticWeek: 12, md: 4 },
        { domesticWeek: 15, md: 5 },
        { domesticWeek: 18, md: 6 },
        { domesticWeek: 21, md: 7 },
        { domesticWeek: 24, md: 8 },
      ].filter((m) => m.md <= totalMds);

      leagueMdMilestones.forEach(({ domesticWeek, md }) => {
        if (weekMatchday >= domesticWeek && state && state.currentStage === 'league_phase') {
          const hasUncompleted = state.leaguePhaseFixtures?.some(
            (f) => f.matchdayIndex === md && !f.isCompleted
          );
          if (hasUncompleted) {
            state = simulateContinentalLeaguePhaseMatchday(state, md, userPlayer);
            updated = true;
          }
        }
      });

      // Knockout Phase Play-offs (ranks 9-24)
      if (weekMatchday >= 25 && state && state.currentStage === 'knockout_playoffs') {
        state = advanceContinentalKnockoutStage(state, userPlayer);
        updated = true;
      }
    } else {
      // Group Stage: Matchdays 1 to 6 (at domestic weeks 3, 6, 9, 12, 15, 18)
      const mdMilestones = [
        { domesticWeek: 3, groupMd: 1 },
        { domesticWeek: 6, groupMd: 2 },
        { domesticWeek: 9, groupMd: 3 },
        { domesticWeek: 12, groupMd: 4 },
        { domesticWeek: 15, groupMd: 5 },
        { domesticWeek: 18, groupMd: 6 },
      ];

      mdMilestones.forEach(({ domesticWeek, groupMd }) => {
        if (weekMatchday >= domesticWeek && state && state.currentStage === 'group_stage') {
          const hasUncompleted = state.groups?.some((g) =>
            g.fixtures?.some((f) => f.matchdayIndex === groupMd && !f.isCompleted)
          );
          if (hasUncompleted) {
            state = simulateContinentalGroupMatchday(state, groupMd, userPlayer);
            updated = true;
          }
        }
      });
    }

    // Knockout Round of 16 (Leg 1 at week 27, Leg 2 & advance at week 29)
    if (weekMatchday >= 27 && state && state.currentStage === 'round_of_16') {
      state.r16Ties?.forEach((tie) => {
        if (tie.leg1 && !tie.leg1.isCompleted) {
          tie.leg1 = simulateSingleContinentalMatch(tie.leg1, tie.teamA.ovr, tie.teamB.ovr, userPlayer, true, false);
          updated = true;
        }
      });
    }

    if (weekMatchday >= 29 && state && state.currentStage === 'round_of_16') {
      state = advanceContinentalKnockoutStage(state, userPlayer);
      updated = true;
    }

    // Knockout Quarter-Finals (Leg 1 at week 31, Leg 2 & advance at week 33)
    if (weekMatchday >= 31 && state && (state.currentStage === 'quarter_finals' || (state.currentStage as any) === 'quarter_final')) {
      state.qfTies?.forEach((tie) => {
        if (tie.leg1 && !tie.leg1.isCompleted) {
          tie.leg1 = simulateSingleContinentalMatch(tie.leg1, tie.teamA.ovr, tie.teamB.ovr, userPlayer, true, false);
          updated = true;
        }
      });
    }

    if (weekMatchday >= 33 && state && (state.currentStage === 'quarter_finals' || (state.currentStage as any) === 'quarter_final')) {
      state = advanceContinentalKnockoutStage(state, userPlayer);
      updated = true;
    }

    // Knockout Semi-Finals (Leg 1 at week 35, Leg 2 & advance at week 36)
    if (weekMatchday >= 35 && state && (state.currentStage === 'semi_finals' || (state.currentStage as any) === 'semi_final')) {
      state.sfTies?.forEach((tie) => {
        if (tie.leg1 && !tie.leg1.isCompleted) {
          tie.leg1 = simulateSingleContinentalMatch(tie.leg1, tie.teamA.ovr, tie.teamB.ovr, userPlayer, true, false);
          updated = true;
        }
      });
    }

    if (weekMatchday >= 36 && state && (state.currentStage === 'semi_finals' || (state.currentStage as any) === 'semi_final')) {
      state = advanceContinentalKnockoutStage(state, userPlayer);
      updated = true;
    }

    // Knockout Grand Final (at domestic week 38)
    if (weekMatchday >= 38 && state && state.currentStage === 'final') {
      if (state.finalTie?.leg1 && !state.finalTie.leg1.isCompleted) {
        state = advanceContinentalKnockoutStage(state, userPlayer);
        updated = true;
      }
    }

    if (updated && state) {
      saveContinentalTournamentState(state);
    }
  });
}

/**
 * Explicitly synchronizes the world simulation state view to the player's career timeline.
 * Automatically advances world leagues and continental competitions if behind the career calendar.
 */
export function syncWorldSimulationToCareerTimeline(
  player?: PlayerCardData | PlayerConfig,
  seasonYear?: string,
  currentStage?: string,
  block1Count?: number,
  block2Count?: number,
  matchdayOverride?: number,
  db?: LeagueDatabase
): WorldSimulationState {
  const currentDb = db || getCareerLeagueDatabase();
  const yr = resolveAuthoritativeSeasonYear(player, seasonYear);
  
  const timeline = getAuthoritativeCareerSimulationTimeline(
    player,
    yr,
    currentStage,
    block1Count,
    block2Count,
    matchdayOverride
  );

  let state = getWorldSimulationState(timeline.seasonYear, currentDb, player);

  if (timeline.targetMatchday > state.currentCalendarMatchday) {
    state = advanceWorldSimulationToMatchday(
      timeline.targetMatchday,
      player as PlayerCardData,
      player?.clubId,
      undefined,
      currentDb
    );
  }

  return state;
}

/**
 * Saves world simulation state to storage and in-memory cache.
 */
export function saveWorldSimulationState(worldState: WorldSimulationState): void {
  activeWorldStateCache = worldState;
  const key = getActiveWorldSimulationKey(worldState.seasonYear);
  try {
    safeSetItem(key, JSON.stringify(worldState));
  } catch (err) {
    console.warn('Error persisting world simulation state:', err);
  }
}

/**
 * Updates player cumulative season statistics from match players.
 */
function recordPlayerStatsFromMatch(
  statsMap: Record<string, WorldPlayerSeasonStat>,
  matchPlayers: MatchPlayerStats[],
  teamCountryCode?: string
): void {
  matchPlayers.forEach((p) => {
    let existing = statsMap[p.id];
    const isStarter = p.minutesPlayed >= 45 || p.rating > 0;
    const mins = p.minutesPlayed > 0 ? p.minutesPlayed : 90;

    if (!existing) {
      existing = {
        playerId: p.id,
        playerName: p.name,
        teamId: p.teamId,
        teamName: p.teamName,
        countryCode: teamCountryCode,
        position: p.position,
        subPosition: p.subPosition,
        playStyle: p.playStyle,
        ovr: p.ovr,
        isUserPlayer: p.isUserPlayer,
        matchesPlayed: 0,
        starts: 0,
        minutes: 0,
        goals: 0,
        assists: 0,
        totalRating: 0,
        avgRating: 6.0,
        cleanSheets: 0,
        defensiveStops: 0,
        yellowCards: 0,
        redCards: 0,
      };
      statsMap[p.id] = existing;
    } else {
      // Ensure club identity stays current if player moved clubs
      if (p.teamId && p.teamId !== existing.teamId) {
        existing.teamId = p.teamId;
        existing.teamName = p.teamName;
      }
      if (p.ovr && p.ovr > existing.ovr) {
        existing.ovr = p.ovr;
      }
    }

    existing.matchesPlayed += 1;
    if (isStarter) existing.starts += 1;
    existing.minutes += mins;
    existing.goals += p.goals;
    existing.assists += p.assists;
    existing.totalRating += p.rating;
    existing.avgRating = Math.round((existing.totalRating / existing.matchesPlayed) * 10) / 10;
    if (p.cleanSheet) existing.cleanSheets += 1;
    existing.defensiveStops += p.defensiveStops;
    existing.yellowCards += p.yellowCards;
    existing.redCards += p.redCards;
  });
}

/**
 * Fully recalculates player cumulative season statistics from all completed league fixtures.
 * Guarantees zero duplicate appearances, correct goal/assist tallies, and accurate average ratings.
 */
export function recalculateLeaguePlayerStats(league: WorldLeagueState): void {
  league.playerStatsMap = {};
  Object.values(league.matchdays).forEach((fixtures) => {
    fixtures.forEach((fix) => {
      if (!fix.isCompleted) return;
      const allPlayers: MatchPlayerStats[] = [
        ...(fix.homePlayers || []),
        ...(fix.awayPlayers || []),
        ...(fix.homeBench || []).filter((b) => b.minutesPlayed > 0),
        ...(fix.awayBench || []).filter((b) => b.minutesPlayed > 0),
      ];
      if (allPlayers.length > 0) {
        recordPlayerStatsFromMatch(league.playerStatsMap, allPlayers, league.countryCode);
      }
    });
  });
}

/**
 * Recalculates top goalscorers, top assists, and top ratings leaderboards for a league.
 */
export function recalculateLeagueLeaderboards(league: WorldLeagueState): void {
  const allPlayers = Object.values(league.playerStatsMap);

  // Top Goalscorers
  const scorers = [...allPlayers]
    .filter((p) => p.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.avgRating - a.avgRating || (a.isUserPlayer ? -1 : 1))
    .slice(0, 15)
    .map((p, idx) => ({
      rank: idx + 1,
      playerId: p.playerId,
      playerName: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      value: p.goals,
      ovr: p.ovr,
      position: p.position,
      subPosition: p.subPosition,
      isUserPlayer: p.isUserPlayer,
    }));

  // Top Assists
  const assists = [...allPlayers]
    .filter((p) => p.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.avgRating - a.avgRating || (a.isUserPlayer ? -1 : 1))
    .slice(0, 15)
    .map((p, idx) => ({
      rank: idx + 1,
      playerId: p.playerId,
      playerName: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      value: p.assists,
      ovr: p.ovr,
      position: p.position,
      subPosition: p.subPosition,
      isUserPlayer: p.isUserPlayer,
    }));

  // Top 5 Average-Rated Players (min 2 matches)
  const ratings = [...allPlayers]
    .filter((p) => p.matchesPlayed >= 2)
    .sort((a, b) => b.avgRating - a.avgRating || b.goals + b.assists - (a.goals + a.assists) || (a.isUserPlayer ? -1 : 1))
    .slice(0, 5)
    .map((p, idx) => ({
      rank: idx + 1,
      playerId: p.playerId,
      playerName: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      value: p.avgRating,
      ovr: p.ovr,
      position: p.position,
      subPosition: p.subPosition,
      isUserPlayer: p.isUserPlayer,
    }));

  league.topScorers = scorers;
  league.topAssists = assists;
  league.topRatings = ratings;
}

/**
 * Recalculates standings table for a league from completed matchdays.
 */
export function recalculateLeagueStandings(league: WorldLeagueState, totalTeams: number): void {
  const standingsMap = new Map<string, WorldLeagueStandingRow>();

  league.standings.forEach((row) => {
    standingsMap.set(row.teamId, {
      ...row,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    });
  });

  Object.values(league.matchdays).forEach((fixtures) => {
    fixtures.forEach((fix) => {
      if (!fix.isCompleted) return;

      const homeRow = standingsMap.get(fix.homeTeamId);
      const awayRow = standingsMap.get(fix.awayTeamId);

      if (homeRow && awayRow) {
        homeRow.played += 1;
        awayRow.played += 1;
        homeRow.goalsFor += fix.homeScore;
        homeRow.goalsAgainst += fix.awayScore;
        awayRow.goalsFor += fix.awayScore;
        awayRow.goalsAgainst += fix.homeScore;

        if (fix.homeScore > fix.awayScore) {
          homeRow.won += 1;
          homeRow.points += 3;
          homeRow.form.unshift('W');
          awayRow.lost += 1;
          awayRow.form.unshift('L');
        } else if (fix.homeScore < fix.awayScore) {
          awayRow.won += 1;
          awayRow.points += 3;
          awayRow.form.unshift('W');
          homeRow.lost += 1;
          homeRow.form.unshift('L');
        } else {
          homeRow.drawn += 1;
          homeRow.points += 1;
          homeRow.form.unshift('D');
          awayRow.drawn += 1;
          awayRow.points += 1;
          awayRow.form.unshift('D');
        }

        homeRow.form = homeRow.form.slice(0, 5);
        awayRow.form = awayRow.form.slice(0, 5);
      }
    });
  });

  const sorted = Array.from(standingsMap.values()).map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
  }));

  sorted.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return b.teamOvr - a.teamOvr;
  });

  const rule = PROFESSIONAL_LEAGUE_RULES[league.leagueId] || PROFESSIONAL_LEAGUE_RULES.england_d1;
  sorted.forEach((row, idx) => {
    row.rank = idx + 1;
    row.qualificationBadge = getProfessionalQualificationBadge(row.rank, sorted.length, rule, league.countryCode);
  });

  league.standings = sorted;
}

/**
 * Simulates exactly ONE calendar week of world football matches across all professional leagues.
 * The calendar runs week-by-week (1 to 38) and guarantees no giant uncalibrated multi-month jumps.
 */
export function simulateWorldCalendarWeek(
  targetWeek?: number,
  userPlayer?: PlayerCardData,
  userTeamId?: string,
  userMatchResult?: SimulatedDatabaseMatchResult,
  db?: LeagueDatabase,
  seasonYear?: string
): WorldSimulationState {
  const currentDb = db || getCareerLeagueDatabase();
  const currentSeasonYear = resolveAuthoritativeSeasonYear(userPlayer, seasonYear || (userPlayer as any)?.seasonYear);
  const worldState = getWorldSimulationState(
    currentSeasonYear,
    currentDb,
    userPlayer
  );

  // Pre-advancement Simulation Validation (Checks 1 - 7)
  const validation = validateWorldSimulationIntegrity(worldState, currentDb, userPlayer);
  if (!validation.isValid) {
    console.warn('[WorldSimulationEngine] Simulation validation encountered blocking errors:', validation.errors);
    if (!validation.repaired) {
      return worldState;
    }
  }

  const nextWeek = targetWeek !== undefined ? targetWeek : worldState.currentCalendarWeek + 1;
  if (nextWeek <= worldState.currentCalendarWeek) {
    return worldState;
  }

  const teamsMap = currentDb.teams || {};

  // Advance week-by-week incrementally
  matchesSimulatedLastAdvance = 0;

  for (let w = worldState.currentCalendarWeek + 1; w <= nextWeek; w++) {
    const weekMatchday = Math.min(w, worldState.totalCalendarMatchdays);

    Object.values(worldState.leagues).forEach((league) => {
      // Exclude any non-professional competitions
      if (league.divisionTier === 'youth') return;

      if (weekMatchday <= league.totalMatchdays && weekMatchday > league.currentMatchday) {
        const fixtures = league.matchdays[weekMatchday] || [];

        fixtures.forEach((fix) => {
          if (fix.isCompleted) return;

          const isUserMatch = !!userTeamId && (fix.homeTeamId === userTeamId || fix.awayTeamId === userTeamId);

          // 1. User Match: apply direct result if already simulated or skip to prevent double simulation
          if (isUserMatch) {
            const isProFirstTeam = isPlayerInProClub(userPlayer) &&
              (!userPlayer?.squadDestination || userPlayer.squadDestination === 'First Team' || userPlayer.squadDestination === 'Senior');

            if (isProFirstTeam) {
              if (userMatchResult) {
                Object.assign(fix, userMatchResult);
                fix.isCompleted = true;
                fix.isPlayerMatch = true;
                recordPlayerStatsFromMatch(
                  league.playerStatsMap,
                  [
                    ...fix.homePlayers,
                    ...fix.awayPlayers,
                    ...(fix.homeBench || []).filter((b) => b.minutesPlayed > 0),
                    ...(fix.awayBench || []).filter((b) => b.minutesPlayed > 0),
                  ],
                  league.countryCode
                );
                matchesSimulatedLastAdvance++;
                totalMatchesSimulatedCount++;
                totalGoalsSimulatedCount += (fix.homeScore + fix.awayScore);
                totalAssistsSimulatedCount += (fix.events || []).filter((e) => e.type === 'assist').length;
                totalRatingsGeneratedCount += (fix.homePlayers.length + fix.awayPlayers.length);
                return;
              }

              // CRITICAL DIRECTIVE: DO NOT DOUBLE-SIMULATE
              // If the Unique Career player is scheduled to play for the First Team and hasn't played yet,
              // REMOVE/SKIP that fixture from the normal simulation queue!
              // Never generate a simulated result and then overwrite it with the Unique Career result.
              return;
            }

            // If user is in youth/reserves, user does NOT play in the First Team fixture.
            // Fall through to simulate the First Team fixture normally without the user player.
          }

          // 2. All Background Non-Player Matches: Ultra-fast lightweight statistical simulation
          const homeTeam = teamsMap[fix.homeTeamId];
          const awayTeam = teamsMap[fix.awayTeamId];

          if (!homeTeam || !awayTeam) {
            fix.isCompleted = true;
            return;
          }

          const lightResult = simulateLightweightMatch(homeTeam, awayTeam, {
            competitionId: league.leagueId,
            competitionName: league.name,
            stageName: `Matchday ${weekMatchday}`,
            matchdayIndex: weekMatchday,
          });

          Object.assign(fix, lightResult);
          fix.isCompleted = true;

          recordPlayerStatsFromMatch(
            league.playerStatsMap,
            [
              ...lightResult.homePlayers,
              ...lightResult.awayPlayers,
            ],
            league.countryCode
          );

          matchesSimulatedLastAdvance++;
          totalMatchesSimulatedCount++;
          totalGoalsSimulatedCount += (lightResult.homeScore + lightResult.awayScore);
          totalAssistsSimulatedCount += (lightResult.events || []).filter((e) => e.type === 'assist').length;
          totalRatingsGeneratedCount += (lightResult.homePlayers.length + lightResult.awayPlayers.length);

          lastSimulatedMatchRecord = {
            homeTeam: lightResult.homeTeamName,
            awayTeam: lightResult.awayTeamName,
            score: `${lightResult.homeScore} - ${lightResult.awayScore}`,
            competitionName: league.name,
            matchday: weekMatchday,
            goals: (lightResult.events || []).filter((e) => e.type === 'goal').map((g) => ({
              minute: g.minute,
              scorer: g.playerName || 'Player',
              assist: g.detail?.replace('Assist by ', ''),
            })),
            topPerformers: [...lightResult.homePlayers, ...lightResult.awayPlayers]
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 4)
              .map((p) => ({ name: p.name, rating: p.rating, club: p.teamName })),
          };
        });

        league.currentMatchday = weekMatchday;
        if (w === nextWeek) {
          recalculateLeagueStandings(league, league.standings.length);
          recalculateLeagueLeaderboards(league);
          if (league.currentMatchday >= league.totalMatchdays && league.standings.length > 0) {
            const championId = league.standings[0]?.teamId;
            if (championId) {
              recordLeagueSeasonFinish(
                league.leagueId,
                championId,
                league.standings.map((s) => s.teamId),
                currentSeasonYear
              );
            }
          }
        }
      }
    });

    // Advance all active continental tournaments synchronized to the current matchday week
    simulateContinentalCompetitionsForWeek(weekMatchday, currentSeasonYear, userPlayer, currentDb);

    worldState.currentCalendarWeek = w;
    worldState.currentCalendarMatchday = weekMatchday;
    worldState.currentCalendarDate = getCalendarDateForMatchday(weekMatchday, currentSeasonYear);
  }

  worldState.lastUpdated = new Date().toISOString();
  saveWorldSimulationState(worldState);
  return worldState;
}

/**
 * Advances world simulation to match a specific calendar Date.
 */
export function advanceWorldSimulationToDate(
  targetDate: Date | string,
  userPlayer?: PlayerCardData,
  userTeamId?: string,
  userMatchResult?: SimulatedDatabaseMatchResult,
  db?: LeagueDatabase
): WorldSimulationState {
  const seasonYear = (userPlayer as any)?.seasonYear || (userPlayer as any)?.season || '2026/27';
  const startYear = parseInt(seasonYear.split('/')[0], 10) || 2026;
  const startDate = new Date(startYear, 7, 15); // Aug 15

  const parsedDate = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const diffMs = parsedDate.getTime() - startDate.getTime();
  const weekDiff = Math.max(1, Math.min(38, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1));

  return simulateWorldCalendarWeek(weekDiff, userPlayer, userTeamId, userMatchResult, db);
}

/**
 * Advances ALL active professional leagues and competitions week-by-week to target matchday.
 * Uses ONLY real database players from each team's authoritative squad.
 */
export function advanceWorldSimulationToMatchday(
  targetMatchday: number,
  userPlayer?: PlayerCardData,
  userTeamId?: string,
  userMatchResult?: SimulatedDatabaseMatchResult,
  db?: LeagueDatabase,
  seasonYear?: string
): WorldSimulationState {
  return simulateWorldCalendarWeek(targetMatchday, userPlayer, userTeamId, userMatchResult, db, seasonYear);
}

/**
 * Synchronizes the entire world simulation whenever the player completes an individual match.
 */
export function syncWorldSimulationOnPlayerMatch(
  matchdayIndex: number,
  userPlayer: PlayerConfig | PlayerCardData,
  playerMatchResult?: SimulatedDatabaseMatchResult,
  db?: LeagueDatabase
): WorldSimulationState {
  const currentDb = db || getCareerLeagueDatabase();
  const userTeamId = userPlayer.clubId || Object.values(currentDb.teams || {}).find((t) => t.name.toLowerCase() === (userPlayer.club || '').toLowerCase())?.id;

  return advanceWorldSimulationToMatchday(
    matchdayIndex,
    userPlayer as PlayerCardData,
    userTeamId,
    playerMatchResult,
    currentDb
  );
}

/**
 * Returns the exact live top scorers, top assists, and top ratings for the player's league.
 * Guarantees zero fake/hard-coded players.
 */
export function getAuthoritativeLeagueLeaderboards(
  leagueId: string,
  worldState?: WorldSimulationState
): {
  topScorers: WorldLeaderboardEntry[];
  topAssists: WorldLeaderboardEntry[];
  topRatings: WorldLeaderboardEntry[];
} {
  const ws = worldState || getWorldSimulationState();
  const league = ws.leagues[leagueId];
  if (!league) {
    return { topScorers: [], topAssists: [], topRatings: [] };
  }
  return {
    topScorers: league.topScorers,
    topAssists: league.topAssists,
    topRatings: league.topRatings,
  };
}

/**
 * Retrieves the live World Simulation Debug telemetry metrics.
 */
export function getWorldSimulationDebugMetrics(
  player?: PlayerCardData | PlayerConfig,
  seasonYear?: string
): WorldSimulationDebugMetrics {
  const timeline = getAuthoritativeCareerSimulationTimeline(player, seasonYear);
  const worldState = getWorldSimulationState(timeline.seasonYear, undefined, player);

  // Derive counts from actual world state if counters are zero (e.g. after refresh)
  let totalMatches = totalMatchesSimulatedCount;
  let totalGoals = totalGoalsSimulatedCount;
  let totalAssists = totalAssistsSimulatedCount;
  let totalRatings = totalRatingsGeneratedCount;
  const competitionsCount = Object.keys(worldState.leagues).length;

  if (totalMatches === 0 && worldState.currentCalendarMatchday > 0) {
    Object.values(worldState.leagues).forEach((l) => {
      l.standings.forEach((s) => {
        totalGoals += s.goalsFor;
      });
      Object.values(l.matchdays).forEach((mList) => {
        mList.forEach((m) => {
          if (m.isCompleted) {
            totalMatches++;
            totalAssists += (m.events || []).filter((e) => e.type === 'assist').length;
            totalRatings += (m.homePlayers?.length || 11) + (m.awayPlayers?.length || 11);
          }
        });
      });
    });
  }

  return {
    currentWorldDate: worldState.currentCalendarDate,
    currentCareerDate: player?.calendarDate || timeline.dateString,
    currentSeason: worldState.seasonYear,
    currentMatchday: worldState.currentCalendarMatchday,
    matchesSimulatedThisAdvance: matchesSimulatedLastAdvance,
    totalMatchesSimulated: totalMatches,
    totalGoalsSimulated: totalGoals,
    totalAssistsSimulated: totalAssists,
    totalRatingsGenerated: totalRatings,
    competitionsUpdated: competitionsCount,
    lastSimulatedMatch: lastSimulatedMatchRecord,
  };
}

/**
 * Fully purges and cleans up old world simulation states from active memory and storage.
 */
export function cleanupWorldSimulationState(oldSeasonYear?: string): void {
  activeWorldStateCache = null;
  matchesSimulatedLastAdvance = 0;
  totalMatchesSimulatedCount = 0;
  totalGoalsSimulatedCount = 0;
  totalAssistsSimulatedCount = 0;
  totalRatingsGeneratedCount = 0;
  lastSimulatedMatchRecord = undefined;

  if (oldSeasonYear) {
    const key = getActiveWorldSimulationKey(oldSeasonYear);
    try {
      const storage = getSafeLocalStorage();
      if (storage) {
        storage.removeItem(key);
      }
    } catch (err) {
      console.warn('Error purging old world simulation state key:', err);
    }
  }
}

/**
 * Resets the world simulation state for testing / development or new season transitions.
 */
export function resetWorldSimulationState(seasonYear: string = '2026/27', db?: LeagueDatabase, player?: PlayerCardData): WorldSimulationState {
  cleanupWorldSimulationState(seasonYear);
  return initializeWorldSimulationState(seasonYear, db, player);
}

/**
 * Transforms an actual played Unique Career match into an authoritative SimulatedDatabaseMatchResult
 * with full Starting XI (1-11), Bench (12-18), exact player ratings, chronological events, scorers, assists,
 * and canonical Player ID integration.
 */
export function buildFullMatchResultFromCareerMatch(
  match: SimulatedMatchResult,
  player: PlayerConfig | PlayerCardData,
  homeTeam: EditorTeamData,
  awayTeam: EditorTeamData,
  competitionId: string,
  competitionName: string,
  matchdayIndex: number,
  fixtureId: string
): SimulatedDatabaseMatchResult {
  const isPlayerHome = !!match.isPlayerHome;
  const playerTeam = isPlayerHome ? homeTeam : awayTeam;
  const oppTeam = isPlayerHome ? awayTeam : homeTeam;

  const playerTeamScore = match.playerTeamScore !== undefined
    ? match.playerTeamScore
    : (isPlayerHome ? match.homeScore : match.awayScore);
  const oppScore = match.opponentScore !== undefined
    ? match.opponentScore
    : (isPlayerHome ? match.awayScore : match.homeScore);

  const homeScore = isPlayerHome ? playerTeamScore : oppScore;
  const awayScore = isPlayerHome ? oppScore : playerTeamScore;

  const homeProfile = getCachedTeamTacticalProfile(homeTeam);
  const awayProfile = getCachedTeamTacticalProfile(awayTeam);

  // Deep copy starters and bench to prevent mutating cache
  const homeStarters: MatchPlayerStats[] = homeProfile.starters.map((s) => ({
    ...s,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    defensiveStops: 0,
    minutesPlayed: 90,
    cleanSheet: awayScore === 0,
    rating: 6.0,
  }));
  const awayStarters: MatchPlayerStats[] = awayProfile.starters.map((s) => ({
    ...s,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    defensiveStops: 0,
    minutesPlayed: 90,
    cleanSheet: homeScore === 0,
    rating: 6.0,
  }));
  const homeBench: MatchPlayerStats[] = homeProfile.bench.map((b) => ({
    ...b,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    defensiveStops: 0,
    minutesPlayed: 0,
    cleanSheet: false,
    rating: 0,
    participationStatus: 'sub_did_not_enter',
  }));
  const awayBench: MatchPlayerStats[] = awayProfile.bench.map((b) => ({
    ...b,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    defensiveStops: 0,
    minutesPlayed: 0,
    cleanSheet: false,
    rating: 0,
    participationStatus: 'sub_did_not_enter',
  }));

  const playerStarters = isPlayerHome ? homeStarters : awayStarters;
  const playerBench = isPlayerHome ? homeBench : awayBench;
  const oppStarters = isPlayerHome ? awayStarters : homeStarters;
  const oppBench = isPlayerHome ? awayBench : homeBench;

  const canonicalUserId = player.id || (player as any).playerId || 'user_player_id';
  const playerStatus = match.playerStatus || 'starter';
  const userMins = match.minutesPlayed !== undefined ? match.minutesPlayed : (playerStatus === 'benched' ? 0 : 90);

  const userStats: MatchPlayerStats = {
    id: canonicalUserId,
    name: player.name || 'User Player',
    teamId: playerTeam.id,
    teamName: playerTeam.name,
    position: player.position || 'FWD',
    subPosition: (player as any).subPosition || 'ST',
    playStyle: (player as any).playStyle || 'Finisher',
    ovr: player.ovr || 75,
    isUserPlayer: true,
    minutesPlayed: userMins,
    participationStatus:
      playerStatus === 'starter'
        ? 'starter'
        : playerStatus === 'sub'
        ? 'sub_in'
        : playerStatus === 'bench'
        ? 'sub_did_not_enter'
        : 'rested',
    goals: match.playerGoals || 0,
    assists: match.playerAssists || 0,
    rating: match.playerRating !== undefined ? match.playerRating : 7.0,
    isMvp: match.isMvp || false,
    cleanSheet: match.cleanSheet !== undefined ? match.cleanSheet : (oppScore === 0),
    defensiveStops: (player.position === 'DEF' || player.position === 'GK') ? 3 : 1,
    yellowCards: match.yellowCard ? 1 : 0,
    redCards: match.redCard ? 1 : 0,
  };

  const events: MatchPlayerEvent[] = [];

  // Integrate User Player into Squad (Starter / Sub / Benched)
  if (playerStatus === 'starter' || playerStatus === 'sub_out') {
    let replaceIdx = playerStarters.findIndex((s) => s.position === userStats.position);
    if (replaceIdx === -1) {
      replaceIdx = playerStarters.findIndex((s) => s.position !== 'GK');
    }
    if (replaceIdx === -1) replaceIdx = 0;

    playerStarters[replaceIdx] = userStats;

    if (playerStatus === 'sub_out' && userMins < 90 && playerBench.length > 0) {
      const subInPlayer = playerBench[0];
      const subMinute = Math.max(45, Math.min(85, userMins));
      subInPlayer.participationStatus = 'sub_in';
      subInPlayer.minutesPlayed = 90 - subMinute;
      events.push({
        minute: subMinute,
        type: 'sub',
        playerId: subInPlayer.id,
        playerName: `${subInPlayer.name} on for ${userStats.name}`,
        teamId: playerTeam.id,
        detail: `Tactical Substitution (${subMinute}')`,
      });
    }
  } else if (playerStatus === 'sub_in' || playerStatus === 'sub') {
    const subMinute = Math.max(45, Math.min(85, 90 - userMins));
    userStats.participationStatus = 'sub_in';
    playerBench.unshift(userStats);

    let subOutIdx = playerStarters.findIndex((s) => s.position === userStats.position);
    if (subOutIdx === -1) subOutIdx = playerStarters.findIndex((s) => s.position !== 'GK');
    if (subOutIdx !== -1) {
      const subOutPlayer = playerStarters[subOutIdx];
      subOutPlayer.participationStatus = 'sub_out';
      subOutPlayer.minutesPlayed = subMinute;
      events.push({
        minute: subMinute,
        type: 'sub',
        playerId: userStats.id,
        playerName: `${userStats.name} on for ${subOutPlayer.name}`,
        teamId: playerTeam.id,
        detail: `Tactical Substitution (${subMinute}')`,
      });
    }
  } else {
    userStats.participationStatus = 'benched';
    userStats.minutesPlayed = 0;
    playerBench.push(userStats);
  }

  // Realistic opposition substitution
  if (oppBench.length > 0 && oppStarters.length > 0) {
    const oppSubIn = oppBench[0];
    const oppSubOut = oppStarters[oppStarters.length - 1];
    oppSubIn.participationStatus = 'sub_in';
    oppSubIn.minutesPlayed = 25;
    oppSubOut.participationStatus = 'sub_out';
    oppSubOut.minutesPlayed = 65;
    events.push({
      minute: 65,
      type: 'sub',
      playerId: oppSubIn.id,
      playerName: `${oppSubIn.name} on for ${oppSubOut.name}`,
      teamId: oppTeam.id,
      detail: `Tactical Substitution (65')`,
    });
  }

  const homeScorers: { playerId: string; name: string; minute: number; assistPlayerName?: string }[] = [];
  const awayScorers: { playerId: string; name: string; minute: number; assistPlayerName?: string }[] = [];
  const playerScorersList = isPlayerHome ? homeScorers : awayScorers;
  const oppScorersList = isPlayerHome ? awayScorers : homeScorers;

  // 1. Record User's Goals
  let userAssistsRemaining = match.playerAssists || 0;
  for (let g = 0; g < (match.playerGoals || 0); g++) {
    const minute = Math.min(90, Math.max(5, Math.floor(15 + g * 35 + (Math.random() * 10 - 5))));
    let assistName: string | undefined;
    const assistCandidates = playerStarters.filter((p) => p.id !== userStats.id && p.position !== 'GK');
    if (assistCandidates.length > 0 && Math.random() < 0.75) {
      const assister = assistCandidates[Math.floor(Math.random() * assistCandidates.length)];
      assister.assists += 1;
      assistName = assister.name;
      events.push({
        minute,
        type: 'assist',
        playerId: assister.id,
        playerName: assister.name,
        teamId: playerTeam.id,
      });
    }
    playerScorersList.push({
      playerId: userStats.id,
      name: userStats.name,
      minute,
      assistPlayerName: assistName,
    });
    events.push({
      minute,
      type: 'goal',
      playerId: userStats.id,
      playerName: userStats.name,
      teamId: playerTeam.id,
      detail: assistName ? `Assist by ${assistName}` : undefined,
    });
  }

  // 2. Distribute Remaining Teammate Goals
  const remainingTeamGoals = Math.max(0, playerTeamScore - (match.playerGoals || 0));
  const otherAttackingStarters = playerStarters.filter((p) => p.id !== userStats.id && p.position !== 'GK');
  const teammateScorerPool = otherAttackingStarters.length > 0 ? otherAttackingStarters : playerStarters;

  for (let g = 0; g < remainingTeamGoals; g++) {
    const minute = Math.min(90, Math.max(10, Math.floor(10 + (g + 1) * (75 / (remainingTeamGoals + 1)) + (Math.random() * 8 - 4))));
    const scorer = teammateScorerPool[Math.floor(Math.random() * teammateScorerPool.length)];
    scorer.goals += 1;

    let assistName: string | undefined;
    if (userAssistsRemaining > 0) {
      userAssistsRemaining--;
      assistName = userStats.name;
      events.push({
        minute,
        type: 'assist',
        playerId: userStats.id,
        playerName: userStats.name,
        teamId: playerTeam.id,
      });
    } else if (Math.random() < 0.70) {
      const assisters = playerStarters.filter((p) => p.id !== scorer.id);
      if (assisters.length > 0) {
        const assister = assisters[Math.floor(Math.random() * assisters.length)];
        assister.assists += 1;
        assistName = assister.name;
        events.push({
          minute,
          type: 'assist',
          playerId: assister.id,
          playerName: assister.name,
          teamId: playerTeam.id,
        });
      }
    }

    playerScorersList.push({
      playerId: scorer.id,
      name: scorer.name,
      minute,
      assistPlayerName: assistName,
    });
    events.push({
      minute,
      type: 'goal',
      playerId: scorer.id,
      playerName: scorer.name,
      teamId: playerTeam.id,
      detail: assistName ? `Assist by ${assistName}` : undefined,
    });
  }

  // 3. Distribute Opponent Goals
  const oppAttackingStarters = oppStarters.filter((p) => p.position !== 'GK');
  const oppScorerPool = oppAttackingStarters.length > 0 ? oppAttackingStarters : oppStarters;
  for (let g = 0; g < oppScore; g++) {
    const minute = Math.min(90, Math.max(8, Math.floor(12 + (g + 1) * (75 / (oppScore + 1)) + (Math.random() * 8 - 4))));
    const scorer = oppScorerPool[Math.floor(Math.random() * oppScorerPool.length)];
    scorer.goals += 1;

    let assistName: string | undefined;
    if (Math.random() < 0.70) {
      const assisters = oppStarters.filter((p) => p.id !== scorer.id);
      if (assisters.length > 0) {
        const assister = assisters[Math.floor(Math.random() * assisters.length)];
        assister.assists += 1;
        assistName = assister.name;
        events.push({
          minute,
          type: 'assist',
          playerId: assister.id,
          playerName: assister.name,
          teamId: oppTeam.id,
        });
      }
    }

    oppScorersList.push({
      playerId: scorer.id,
      name: scorer.name,
      minute,
      assistPlayerName: assistName,
    });
    events.push({
      minute,
      type: 'goal',
      playerId: scorer.id,
      playerName: scorer.name,
      teamId: oppTeam.id,
      detail: assistName ? `Assist by ${assistName}` : undefined,
    });
  }

  // Cards
  if (match.yellowCard) {
    events.push({
      minute: Math.min(88, Math.max(20, Math.floor(Math.random() * 70) + 15)),
      type: 'yellow',
      playerId: userStats.id,
      playerName: userStats.name,
      teamId: playerTeam.id,
    });
  }
  if (match.redCard) {
    events.push({
      minute: Math.min(89, Math.max(50, Math.floor(Math.random() * 40) + 50)),
      type: 'red',
      playerId: userStats.id,
      playerName: userStats.name,
      teamId: playerTeam.id,
    });
  }

  // Calculate ratings for all participating players
  homeStarters.forEach((p) => {
    if (!p.isUserPlayer) {
      p.rating = calculateLightweightPlayerRating(p, homeScore, awayScore, awayProfile.overallRating);
    }
  });
  awayStarters.forEach((p) => {
    if (!p.isUserPlayer) {
      p.rating = calculateLightweightPlayerRating(p, awayScore, homeScore, homeProfile.overallRating);
    }
  });
  homeBench.forEach((b) => {
    if (b.minutesPlayed > 0 && !b.isUserPlayer) {
      b.rating = calculateLightweightPlayerRating(b, homeScore, awayScore, awayProfile.overallRating);
    }
  });
  awayBench.forEach((b) => {
    if (b.minutesPlayed > 0 && !b.isUserPlayer) {
      b.rating = calculateLightweightPlayerRating(b, awayScore, homeScore, homeProfile.overallRating);
    }
  });

  // MVP selection
  let mvpPlayer: { playerId: string; name: string; teamId: string; rating: number } | undefined;
  if (match.isMvp) {
    mvpPlayer = {
      playerId: userStats.id,
      name: userStats.name,
      teamId: playerTeam.id,
      rating: userStats.rating,
    };
    userStats.isMvp = true;
  } else {
    let bestP: MatchPlayerStats = homeStarters[0];
    [...homeStarters, ...awayStarters].forEach((p) => {
      if (p.rating > bestP.rating) bestP = p;
    });
    bestP.isMvp = true;
    mvpPlayer = {
      playerId: bestP.id,
      name: bestP.name,
      teamId: bestP.teamId,
      rating: bestP.rating,
    };
  }

  events.sort((a, b) => a.minute - b.minute);

  const winnerTeamId = homeScore > awayScore ? homeTeam.id : awayScore > homeScore ? awayTeam.id : undefined;

  return {
    id: fixtureId,
    competitionId,
    competitionName,
    stageName: `Matchday ${matchdayIndex}`,
    matchdayIndex,
    homeTeamId: homeTeam.id,
    homeTeamName: homeTeam.name,
    homeTeamOvr: homeProfile.overallRating,
    awayTeamId: awayTeam.id,
    awayTeamName: awayTeam.name,
    awayTeamOvr: awayProfile.overallRating,
    homeScore,
    awayScore,
    winnerTeamId,
    isDraw: homeScore === awayScore,
    isCompleted: true,
    isPlayerMatch: true,
    ticksPlayed: 1,
    events,
    homePlayers: homeStarters,
    awayPlayers: awayStarters,
    homeBench,
    awayBench,
    homeScorers,
    awayScorers,
    mvpPlayer,
  };
}

/**
 * Synchronizes all simulated career matches (from Block 1 or Block 2) into the authoritative World Simulation state.
 * Records user's scores, stats, goals, assists directly into the world league table, fixtures, and leaderboards.
 * 
 * CRITICAL DIRECTIVE:
 * When the Unique Career player is playing for a professional club's FIRST TEAM:
 * - Their match is the real match result.
 * - Their team's match must NOT be simulated again.
 * - The actual result must be inserted into World Results.
 * - The opponent's result must also be recorded normally.
 * - The opponent must receive the result in its own World Results history.
 * - League tables and statistics must use the actual result.
 * - Exclude Youth / Reserve / U-17 / U-20 matches.
 */
export function syncCareerBlockMatchesToWorldSimulation(
  player: PlayerConfig | PlayerCardData,
  matches: SimulatedMatchResult[],
  targetMatchday: number,
  seasonYear?: string,
  db?: LeagueDatabase
): WorldSimulationState {
  const currentDb = db || getCareerLeagueDatabase();
  const currentSeasonYear = resolveAuthoritativeSeasonYear(player, seasonYear);
  const numericYear = parseInt(currentSeasonYear.split('/')[0], 10) || 2026;
  let worldState = getWorldSimulationState(currentSeasonYear, currentDb, player as PlayerCardData);

  const isPro = isPlayerInProClub(player);
  const squadDest = (player as any).squadDestination;
  const isFirstTeam = !squadDest || squadDest === 'First Team' || squadDest === 'Senior';

  // 1. Synchronize any continental tournament matches
  matches.forEach((match) => {
    if (match.competitionType === 'continental' || match.continentalCompId) {
      syncContinentalSimulationAfterMatch(player as any, match, numericYear);
    }
  });

  // CRITICAL DIRECTIVE: EXCLUDED MATCHES
  // Do NOT put Youth, Reserve, U-17, U-20 matches into World Results.
  // Only professional first-team club football belongs in World Results domestic leagues!
  if (!isPro || !isFirstTeam) {
    worldState = advanceWorldSimulationToMatchday(
      targetMatchday,
      player as PlayerCardData,
      undefined,
      undefined,
      currentDb,
      currentSeasonYear
    );
    saveWorldSimulationState(worldState);
    return worldState;
  }

  const playerClubName = (player.club || '').trim().toLowerCase();
  const playerClubId = player.clubId || (player as any).club_id;

  // 2. Advance the world simulation to targetMatchday first in lockstep (simulating all background fixtures)
  worldState = advanceWorldSimulationToMatchday(
    targetMatchday,
    player as PlayerCardData,
    playerClubId,
    undefined,
    currentDb,
    currentSeasonYear
  );

  // 3. Identify player's professional domestic league in the updated world state
  let playerLeague: WorldLeagueState | undefined;
  for (const league of Object.values(worldState.leagues)) {
    const hasClub = league.standings.some(
      (s) => (playerClubId && s.teamId === playerClubId) || s.teamName.toLowerCase() === playerClubName
    );
    if (hasClub || (player.leagueId && league.leagueId === player.leagueId)) {
      playerLeague = league;
      break;
    }
  }

  // 4. For each completed domestic match, apply directly into the player's league fixtures and player stats
  if (playerLeague) {
    const league = playerLeague;

    const teamsMap: Record<string, EditorTeamData> = {};
    if (currentDb.teams) {
      Object.values(currentDb.teams).forEach((t) => {
        teamsMap[t.id] = t;
      });
    }

    matches.forEach((match, idx) => {
      // Feed professional first-team Unique Career match into Yearly Award Data infrastructure
      recordUniqueCareerMatchToYearlyAwardData(match, player, currentSeasonYear);

      if (match.competitionType === 'continental') return;

      const mdIndex = (match as any).matchdayIndex || (match.matchIndex !== undefined ? match.matchIndex + 1 : idx + 1);
      const fixtures = league.matchdays[mdIndex] || [];

      // Find fixture in this matchday matching player's club
      let fix = fixtures.find(
        (f) =>
          (playerClubId && (f.homeTeamId === playerClubId || f.awayTeamId === playerClubId)) ||
          f.homeTeamName.toLowerCase() === playerClubName ||
          f.awayTeamName.toLowerCase() === playerClubName
      );

      // If not in this matchday, search across all matchdays for uncompleted or matching fixture
      if (!fix) {
        for (const mList of Object.values(league.matchdays)) {
          const candidate = mList.find(
            (f) =>
              (playerClubId && (f.homeTeamId === playerClubId || f.awayTeamId === playerClubId)) ||
              f.homeTeamName.toLowerCase() === playerClubName ||
              f.awayTeamName.toLowerCase() === playerClubName
          );
          if (candidate) {
            fix = candidate;
            break;
          }
        }
      }

      if (fix) {
        const homeTeamData: EditorTeamData = teamsMap[fix.homeTeamId] || ({
          id: fix.homeTeamId,
          name: fix.homeTeamName,
          overallRating: fix.homeTeamOvr || 75,
          countryCode: league.countryCode,
        } as any);

        const awayTeamData: EditorTeamData = teamsMap[fix.awayTeamId] || ({
          id: fix.awayTeamId,
          name: fix.awayTeamName,
          overallRating: fix.awayTeamOvr || 75,
          countryCode: league.countryCode,
        } as any);

        const fullResult = buildFullMatchResultFromCareerMatch(
          match,
          player,
          homeTeamData,
          awayTeamData,
          league.leagueId,
          league.name,
          fix.matchdayIndex || mdIndex,
          fix.id
        );

        Object.assign(fix, fullResult);
        fix.isCompleted = true;
        fix.isPlayerMatch = true;
      }
    });

    // Recalculate player stats, standings, and leaderboards authoritatively from completed fixtures
    recalculateLeaguePlayerStats(league);
    recalculateLeagueStandings(league, league.standings.length);
    recalculateLeagueLeaderboards(league);
  }

  saveWorldSimulationState(worldState);
  return worldState;
}

/**
 * Synchronizes an active or completed National Tournament (World Cup, Euro, Copa América, U20, U17)
 * directly into the Authoritative World Simulation state and Yearly Award Data.
 * GUARANTEE: Uses only database squad players and genuine simulation results.
 * Excludes external placeholder legends like Messi/Ronaldo who do not exist in the database.
 */
export function syncNationalTournamentToWorldState(
  tourneyState: any,
  targetWorldState?: WorldSimulationState
): WorldSimulationState {
  if (!tourneyState || !tourneyState.config) {
    return targetWorldState || getWorldSimulationState();
  }

  const seasonYear = tourneyState.seasonYear || 2026;
  const seasonLabel = `${seasonYear}/${(seasonYear + 1).toString().slice(-2)}`;
  const worldState = targetWorldState || getWorldSimulationState(seasonLabel);
  worldState.international = worldState.international || {};

  const config = tourneyState.config;
  const compKey = config.shortName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // Map groups and matchdays
  const mappedGroups = (tourneyState.groups || []).map((group: any) => {
    const standings: WorldLeagueStandingRow[] = (group.standings || []).map((s: any, idx: number) => ({
      rank: s.rankInGroup || idx + 1,
      teamId: s.nationCode,
      teamName: s.nationName,
      played: s.played || 0,
      won: s.wins || 0,
      drawn: s.draws || 0,
      lost: s.losses || 0,
      goalsFor: s.goalsFor || 0,
      goalsAgainst: s.goalsAgainst || 0,
      goalDifference: s.goalDifference || 0,
      points: s.points || 0,
      isPlayerTeam: Boolean(s.isPlayerNation),
    }));

    const groupFixtures = (tourneyState.groupFixtures || []).filter(
      (f: any) => f.homeNation?.code === group.teams?.[0]?.code || (group.teams || []).some((t: any) => t.code === f.homeNation?.code)
    );

    const matchdaysMap: Record<number, SimulatedDatabaseMatchResult[]> = {};
    groupFixtures.forEach((f: any) => {
      const mDay = f.matchday || 1;
      matchdaysMap[mDay] = matchdaysMap[mDay] || [];
      matchdaysMap[mDay].push({
        id: f.id,
        competitionId: config.shortName.toUpperCase(),
        competitionName: config.competitionName,
        matchday: mDay,
        homeTeamId: f.homeNation?.code,
        homeTeamName: f.homeNation?.name,
        awayTeamId: f.awayNation?.code,
        awayTeamName: f.awayNation?.name,
        homeScore: f.homeScore ?? 0,
        awayScore: f.awayScore ?? 0,
        homeScorers: f.homeScorers || [],
        awayScorers: f.awayScorers || [],
        isCompleted: Boolean(f.isPlayed),
        isPlayerMatch: Boolean(f.isPlayerMatch),
      } as any);
    });

    return {
      groupLetter: group.letter,
      standings,
      matchdays: matchdaysMap,
    };
  });

  // Map knockout rounds
  const knockoutRoundsMap: Record<string, SimulatedDatabaseMatchResult[]> = {};
  (tourneyState.knockoutMatches || []).forEach((m: any) => {
    const roundName = m.roundName || 'Knockout';
    knockoutRoundsMap[roundName] = knockoutRoundsMap[roundName] || [];
    knockoutRoundsMap[roundName].push({
      id: m.id,
      competitionId: config.shortName.toUpperCase(),
      competitionName: config.competitionName,
      matchday: 0,
      homeTeamId: m.homeNation?.code,
      homeTeamName: m.homeNation?.name,
      awayTeamId: m.awayNation?.code,
      awayTeamName: m.awayNation?.name,
      homeScore: m.homeScore ?? 0,
      awayScore: m.awayScore ?? 0,
      homeScorers: m.homeScorers || [],
      awayScorers: m.awayScorers || [],
      isCompleted: Boolean(m.isPlayed),
      isPlayerMatch: Boolean(m.isPlayerMatch),
      winner: m.winner ? { teamId: m.winner.code, teamName: m.winner.name } : undefined,
      extraTime: Boolean(m.extraTime),
      penaltiesHome: m.penaltiesHome,
      penaltiesAway: m.penaltiesAway,
    } as any);
  });

  const knockoutRounds: WorldCupRound[] = Object.entries(knockoutRoundsMap).map(([roundName, matches]) => ({
    roundName,
    matches,
    isCompleted: matches.every((m) => m.isCompleted),
  }));

  // Map top scorers to WorldLeaderboardEntry
  const topScorers: WorldLeaderboardEntry[] = (tourneyState.topScorers || []).map((s: any, idx: number) => ({
    rank: idx + 1,
    playerId: `nat_${s.nationCode}_${s.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    playerName: s.name,
    teamId: s.nationCode,
    teamName: s.nationName,
    value: s.goals,
    ovr: 80,
    position: 'FWD',
    subPosition: 'ST',
    isUserPlayer: Boolean(s.isPlayer),
  }));

  const compType = config.tier === 'U17' ? 'u17' : config.tier === 'U20' ? 'u20' : config.isContinental ? 'continental' : 'world_cup';

  const internationalEntry: WorldInternationalState = {
    competitionId: config.shortName.toUpperCase(),
    name: config.competitionName,
    type: compType,
    seasonYear: seasonLabel,
    isActive: !tourneyState.isFinished,
    groups: mappedGroups,
    knockoutRounds,
    winner: tourneyState.champion ? { teamId: tourneyState.champion.code, teamName: tourneyState.champion.name } : undefined,
    runnerUp: tourneyState.runnerUp ? { teamId: tourneyState.runnerUp.code, teamName: tourneyState.runnerUp.name } : undefined,
    thirdPlace: tourneyState.thirdPlace ? { teamId: tourneyState.thirdPlace.code, teamName: tourneyState.thirdPlace.name } : undefined,
    topScorers,
    topAssists: [],
    topRatings: [],
    awards: tourneyState.awards,
  };

  worldState.international[compKey] = internationalEntry;
  // Also alias under standard keys
  if (config.isWorldCup && config.tier === 'Senior') {
    worldState.international['world_cup'] = internationalEntry;
    worldState.international['fifa_world_cup'] = internationalEntry;
  } else if (config.shortName === 'Euro') {
    worldState.international['uefa_euro'] = internationalEntry;
    worldState.international['euro'] = internationalEntry;
  } else if (config.shortName === 'Copa América') {
    worldState.international['copa_america'] = internationalEntry;
  }

  saveWorldSimulationState(worldState);

  // Sync with yearlyAwardData
  try {
    const calendarYear = seasonYear;
    const yearlyData = getYearlyAwardData(calendarYear, {
      activeSeasonYear: seasonLabel,
      activeWorldState: worldState,
    });

    if (tourneyState.champion) {
      yearlyData.competitionWinners.internationalChampions = yearlyData.competitionWinners.internationalChampions || {};
      yearlyData.competitionWinners.internationalChampions[compKey] = tourneyState.champion.code;
      yearlyData.competitionWinners.internationalChampions[`${compKey}_name`] = tourneyState.champion.name;

      if (config.isWorldCup && config.tier === 'Senior') {
        yearlyData.competitionWinners.internationalChampions['world_cup'] = tourneyState.champion.name;
        yearlyData.competitionWinners.internationalChampions['world_cup_code'] = tourneyState.champion.code;
      }
    }

    if (tourneyState.runnerUp) {
      yearlyData.competitionWinners.internationalRunnersUp = yearlyData.competitionWinners.internationalRunnersUp || {};
      yearlyData.competitionWinners.internationalRunnersUp[compKey] = tourneyState.runnerUp.code;
    }

    if (tourneyState.awards?.mvp) {
      yearlyData.competitionWinners.internationalMVPs = yearlyData.competitionWinners.internationalMVPs || {};
      yearlyData.competitionWinners.internationalMVPs[compKey] = {
        name: tourneyState.awards.mvp.name,
        nationCode: tourneyState.awards.mvp.nationCode,
      };
    }

    if (tourneyState.awards?.topGoalscorer) {
      yearlyData.competitionWinners.internationalTopScorers = yearlyData.competitionWinners.internationalTopScorers || {};
      yearlyData.competitionWinners.internationalTopScorers[compKey] = {
        name: tourneyState.awards.topGoalscorer.name,
        nationCode: tourneyState.awards.topGoalscorer.nationCode,
        goals: typeof tourneyState.awards.topGoalscorer.statValue === 'number'
          ? tourneyState.awards.topGoalscorer.statValue
          : parseInt(String(tourneyState.awards.topGoalscorer.statValue), 10) || 5,
      };
    }
  } catch (err) {
    console.warn('Failed to sync tournament to yearlyAwardData:', err);
  }

  return worldState;
}

/**
 * Retrieves the authoritative international tournament state from World Results.
 */
export function getAuthoritativeInternationalState(
  compKeyOrName: string,
  seasonYear?: string
): WorldInternationalState | null {
  const worldState = getWorldSimulationState(seasonYear);
  if (!worldState || !worldState.international) return null;

  const key = compKeyOrName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (worldState.international[key]) return worldState.international[key];

  // Try searching through international entries
  for (const entry of Object.values(worldState.international)) {
    if (
      entry.competitionId.toLowerCase() === key ||
      entry.name.toLowerCase().includes(compKeyOrName.toLowerCase()) ||
      compKeyOrName.toLowerCase().includes(entry.competitionId.toLowerCase())
    ) {
      return entry;
    }
  }

  return null;
}

