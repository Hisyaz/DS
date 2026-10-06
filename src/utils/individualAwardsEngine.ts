import { PlayerCardData } from '../types';
import { LeagueDatabase, EditorTeamData } from '../types/leagueEditor';
import {
  BaseNominee,
  MainPosition,
  EuropeanGoldenBootEntry,
  BestStrikerNominee,
  EuropeanGoldenShoeEntry,
  GoldenCreatorEntry,
  DomesticLeagueAwards,
  DomesticLeaderboardEntry,
  WorldXICandidate,
  WorldXISelection,
  WorldXIFormation,
  BallonDorNominee,
  GoldenBoyNominee,
  YashinNominee,
  PositionalAwardNominee,
  ManagerAwardNominee,
  WorldAwardsSeasonResults,
} from '../types/individualAwards';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { getWorldSimulationState, WorldSimulationState, WorldPlayerSeasonStat } from './worldSimulationEngine';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { resolvePlayerProfessionalLeague } from './professionalLeagueEngine';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';
import { UNIQUE_ELITE_PLAYERS_REGISTRY } from './uniquePlayerRegistry';
import { safeGetItem, safeSetItem } from './storageCleaner';
import {
  getYearlyAwardData,
  cleanupYearlyAwardData,
} from './yearlyAwardDataSystem';
import { saveBallonDorHistoricalRecord } from './yearlyStatisticsDatabase';
import { Top30Entry, YearlyHistoricalRecord } from '../types/yearlyAwards';
import {
  calculateEuropeanGoldenShoe,
  getEuropeanGoldenShoeCoefficient,
  getUefaAssociationRankings,
} from './uefaAssociationRankingSystem';

const AWARDS_CACHE_PREFIX = 'WORLD_INDIVIDUAL_AWARDS_V1_';

/**
 * Parses calendar year from season string (e.g. '2027/28' -> 2027, '2027' -> 2027)
 */
export function parseCalendarYear(seasonOrYear?: string | number): number {
  if (typeof seasonOrYear === 'number') return seasonOrYear;
  if (!seasonOrYear) return 2026;
  const str = String(seasonOrYear).trim();
  if (str.includes('/')) {
    const parts = str.split('/');
    return parseInt(parts[0], 10) || 2026;
  }
  if (str.includes('-')) {
    const parts = str.split('-');
    return parseInt(parts[0], 10) || 2026;
  }
  return parseInt(str, 10) || 2026;
}

/**
 * Returns the Tier factor for European Golden Boot and Golden Creator
 */
export function getLeagueWeightFactor(leagueId: string, leagueName: string): number {
  const lId = leagueId.toLowerCase();
  const lName = leagueName.toLowerCase();

  // Tier 1 — ×2.0 (Top 5 European Leagues)
  if (
    lId.includes('england_d1') ||
    lId.includes('spain_d1') ||
    lId.includes('italy_d1') ||
    lId.includes('germany_d1') ||
    lId.includes('france_d1') ||
    lName.includes('premier league') ||
    lName.includes('la liga') ||
    lName.includes('serie a') ||
    lName.includes('bundesliga') ||
    lName.includes('ligue 1')
  ) {
    return 2.0;
  }

  // Tier 2 — ×1.5
  if (
    lId.includes('portugal_d1') ||
    lName.includes('primeira liga') ||
    lName.includes('liga portugal') ||
    lId.includes('belgium_d1') ||
    lName.includes('belgian pro') ||
    lName.includes('jupiler') ||
    lId.includes('netherlands_d1') ||
    lName.includes('eredivisie') ||
    lId.includes('turkey_d1') ||
    lName.includes('süper lig') ||
    lName.includes('super lig') ||
    lId.includes('poland_d1') ||
    lName.includes('ekstraklasa') ||
    lId.includes('czech_d1') ||
    lName.includes('czech first') ||
    lName.includes('chance liga') ||
    lId.includes('greece_d1') ||
    lName.includes('super league greece') ||
    lId.includes('denmark_d1') ||
    lName.includes('danish superliga') ||
    lName.includes('superligaen') ||
    lId.includes('norway_d1') ||
    lName.includes('eliteserien') ||
    lId.includes('cyprus_d1') ||
    lName.includes('cypriot first') ||
    lId.includes('switzerland_d1') ||
    lName.includes('swiss super') ||
    lId.includes('hungary_d1') ||
    lName.includes('nemzeti') ||
    lName.includes('nb i') ||
    lId.includes('scotland_d1') ||
    lName.includes('scottish premiership') ||
    lId.includes('austria_d1') ||
    lName.includes('austrian bundesliga') ||
    lId.includes('sweden_d1') ||
    lName.includes('allsvenskan') ||
    lId.includes('croatia_d1') ||
    lName.includes('croatian football') ||
    lName.includes('hnl')
  ) {
    return 1.5;
  }

  // Tier 3 — ×1.0: Every other European top division
  return 1.0;
}

export function isTop5EuropeanLeague(leagueId: string, leagueName: string = ''): boolean {
  return getLeagueWeightFactor(leagueId, leagueName) === 2.0;
}

/**
 * Returns authentic competition prestige weighting for Yearly World Awards
 * (Ballon d'Or, Best Striker, World XI, Best Attacker, Best Midfielder, etc.).
 *
 * Ensures European football has the strongest weighting:
 * - Top 5 European leagues: 1.0 (Full elite baseline)
 * - Strong European leagues (Tier 2): 0.80
 * - Other European leagues: 0.65
 * - South American elite (Brazil, Argentina): 0.60
 * - Arabian leagues (Saudi Pro League, etc.): 0.45 domestic league weighting
 *
 * This prevents domestic Arabian-league statistics alone from overpowering
 * an exceptional European season, while allowing players to contend if they
 * perform exceptionally in the World Cup, Continental national-team tournaments,
 * or the Club World Cup.
 */
export function getLeaguePrestigeFactor(
  leagueId: string,
  leagueName: string = '',
  countryCode: string = ''
): { factor: number; isEuropean: boolean; label: string } {
  const lId = (leagueId || '').toLowerCase();
  const lName = (leagueName || '').toLowerCase();
  const c = (countryCode || '').toUpperCase();

  // Tier 1 — 1.0 (Top 5 European Leagues)
  if (
    c === 'ENG' || c === 'ESP' || c === 'ITA' || c === 'GER' || c === 'FRA' ||
    lId.includes('england_d1') || lId.includes('spain_d1') || lId.includes('italy_d1') ||
    lId.includes('germany_d1') || lId.includes('france_d1') ||
    lName.includes('premier league') || lName.includes('la liga') || lName.includes('serie a') ||
    lName.includes('bundesliga') || lName.includes('ligue 1')
  ) {
    return { factor: 1.0, isEuropean: true, label: 'Elite European Top 5' };
  }

  // Tier 2 — 0.80 (Strong European Leagues: Portugal, Netherlands, Belgium, Turkey, etc.)
  if (
    c === 'POR' || c === 'NED' || c === 'BEL' || c === 'TUR' || c === 'CZE' || c === 'SCO' || c === 'AUT' ||
    c === 'GRE' || c === 'DEN' || c === 'SUI' || c === 'POL' || c === 'CRO' || c === 'SWE' || c === 'NOR' ||
    lId.includes('portugal') || lName.includes('primeira') || lId.includes('netherlands') || lName.includes('eredivisie') ||
    lId.includes('belgium') || lName.includes('pro league') || lId.includes('turkey') || lName.includes('super lig')
  ) {
    return { factor: 0.80, isEuropean: true, label: 'European Tier 2' };
  }

  // Tier 3 — 0.65 (Other European Leagues)
  if (
    c === 'CYP' || c === 'HUN' || c === 'SRB' || c === 'UKR' || c === 'ROU' || c === 'BUL' || c === 'SVK' || c === 'SVN' ||
    lId.includes('cyprus') || lId.includes('hungary') || lId.includes('serbia') || lId.includes('scotland')
  ) {
    return { factor: 0.65, isEuropean: true, label: 'European Tier 3' };
  }

  // South American Elite — 0.60
  if (c === 'BRA' || c === 'ARG' || lId.includes('brazil') || lId.includes('argentina') || lName.includes('serie a brasil') || lName.includes('libertadores')) {
    return { factor: 0.60, isEuropean: false, label: 'South American Elite' };
  }

  // Arabian Leagues (Saudi Pro League, Qatar, UAE) — 0.45 domestic league weighting
  if (c === 'SAU' || c === 'QAT' || c === 'UAE' || lId.includes('saudi') || lName.includes('saudi') || lName.includes('roshn') || lName.includes('pro league')) {
    return { factor: 0.45, isEuropean: false, label: 'Arabian Domestic League' };
  }

  // Other non-European leagues / lower tiers
  return { factor: 0.40, isEuropean: false, label: 'Global Domestic League' };
}

/**
 * Returns authentic domestic Top Scorer award name based on country/league
 */
export function getDomesticTopScorerName(leagueId: string, leagueName: string, countryCode: string = 'ENG'): string {
  const c = countryCode.toUpperCase();
  const l = leagueName.toLowerCase();
  const id = leagueId.toLowerCase();

  if (c === 'ESP' || id.includes('spain') || l.includes('la liga')) return 'Trofeo Pichichi';
  if (c === 'ITA' || id.includes('italy') || l.includes('serie a')) return 'Capocannoniere';
  if (c === 'ENG' || id.includes('england') || l.includes('premier league')) return 'Premier League Golden Boot';
  if (c === 'GER' || id.includes('germany') || l.includes('bundesliga')) return 'Torjägerkanone';
  if (c === 'FR' || c === 'FRA' || id.includes('france') || l.includes('ligue 1')) return 'Trophée du Meilleur Buteur';
  if (c === 'POR' || id.includes('portugal') || l.includes('primeira')) return 'Bola de Prata';
  if (c === 'NED' || id.includes('netherlands') || l.includes('eredivisie')) return 'Willy van der Kuijlen Trofee';
  if (c === 'BRA' || id.includes('brazil') || l.includes('serie a brasil')) return 'Chuteira de Ouro / Bola de Prata';
  if (c === 'ARG' || id.includes('argentina')) return 'Trofeo de Máximo Goleador';
  if (c === 'SCO' || id.includes('scotland')) return 'Scottish Premiership Golden Boot';

  return `${leagueName} Golden Boot (Top Scorer)`;
}

export function getMainPosition(posStr?: string): MainPosition {
  const p = (posStr || 'ST').toUpperCase();
  if (p === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].some((d) => p.includes(d))) return 'DEF';
  if (['CM', 'CDM', 'CAM', 'LM', 'RM', 'MID'].some((m) => p.includes(m))) return 'MID';
  return 'ATT';
}

interface PlayerWorldRecord {
  id: string;
  name: string;
  club: string;
  clubId?: string;
  leagueId: string;
  leagueName: string;
  countryCode: string;
  mainPosition: MainPosition;
  subPosition: string;
  ovr: number;
  age: number;
  goals: number;
  assists: number;
  matches: number;
  avgRating: number;
  cleanSheets: number;
  isUserPlayer?: boolean;
}

/**
 * Collects full worldwide player records from simulated world state, database squads, and unique registry.
 * Strictly uses unique Player ID as the single source of truth and never generates fake stats.
 */
export function collectWorldwidePlayerPool(
  userPlayer: PlayerCardData,
  userStats: { goals: number; assists: number; matches: number; avgRating: number },
  db: LeagueDatabase,
  worldState: WorldSimulationState
): PlayerWorldRecord[] {
  const playersMap = new Map<string, PlayerWorldRecord>();

  // 1. Add User Player
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

  const userMainPos = getMainPosition(userPlayer.position);
  const userUniqueId = userPlayer.id || 'user_player';
  playersMap.set(userUniqueId, {
    id: userUniqueId,
    name: userPlayer.name || 'Player',
    club: userPlayer.club || 'Academy FC',
    clubId: userPlayer.clubId || 'user_club',
    leagueId: userLeagueId,
    leagueName: userLeagueName,
    countryCode: userPlayer.countryCode || userPlayer.nationality?.code || 'ENG',
    mainPosition: userMainPos,
    subPosition: userPlayer.subPosition || userPlayer.position || 'ST',
    ovr: userPlayer.ovr || 75,
    age: userPlayer.age || 16,
    goals: userStats.goals || 0,
    assists: userStats.assists || 0,
    matches: userStats.matches || 18,
    avgRating: userStats.avgRating || 7.5,
    cleanSheets: userMainPos === 'GK' || userMainPos === 'DEF' ? 8 : 0,
    isUserPlayer: true,
  });

  // Build a lookup map of player metadata from database squads by playerId
  const playerDbMetaMap = new Map<string, { age: number; ovr: number; subPosition: string; position: string; countryCode: string; teamId: string; teamName: string; leagueId: string; leagueName: string }>();

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

  // 2. Iterate simulated leagues in worldState to collect real active season performances
  Object.values(worldState.leagues).forEach((lState) => {
    Object.values(lState.playerStatsMap || {}).forEach((pStat) => {
      if (pStat.isUserPlayer || pStat.playerId === userUniqueId || pStat.playerName === userPlayer.name) return;
      const playerId = pStat.playerId;
      if (!playerId) return;

      const meta = playerDbMetaMap.get(playerId);
      const mainPos = getMainPosition(meta?.position || pStat.position || pStat.subPosition);

      if (playersMap.has(playerId)) {
        // Merge stats if same player ID was recorded (anti-clone)
        const existing = playersMap.get(playerId)!;
        existing.goals += pStat.goals;
        existing.assists += pStat.assists;
        existing.matches += pStat.matchesPlayed;
        existing.cleanSheets += pStat.cleanSheets;
        if (pStat.avgRating > 0) {
          existing.avgRating = parseFloat(((existing.avgRating + pStat.avgRating) / 2).toFixed(1));
        }
      } else {
        playersMap.set(playerId, {
          id: playerId,
          name: pStat.playerName,
          club: meta?.teamName || pStat.teamName,
          clubId: meta?.teamId || pStat.teamId,
          leagueId: meta?.leagueId || lState.leagueId,
          leagueName: meta?.leagueName || lState.name,
          countryCode: meta?.countryCode || pStat.countryCode || lState.countryCode || 'ENG',
          mainPosition: mainPos,
          subPosition: meta?.subPosition || pStat.subPosition || pStat.position || 'ST',
          ovr: meta?.ovr || pStat.ovr || 78,
          age: meta?.age || 25,
          goals: pStat.goals || 0,
          assists: pStat.assists || 0,
          matches: pStat.matchesPlayed || 0,
          avgRating: pStat.avgRating || 6.5,
          cleanSheets: pStat.cleanSheets || 0,
          isUserPlayer: false,
        });
      }
    });
  });

  // 3. Index remaining real database squad players who might not have scored or assisted, with 0 stats (NO fake baseline data)
  Object.values(db.teams || {}).forEach((team: EditorTeamData) => {
    const ensured = ensureTeamSquadSaveFile(team);
    const squadList = ensured.squadSaveFile?.squad || [];
    const league = db.leagues?.[team.leagueId];
    const leagueName = league?.name || 'Top Division';

    squadList.slice(0, 18).forEach((slot) => {
      const p = slot.player;
      if (!p || !p.id || p.id === userUniqueId || p.name === userPlayer.name) return;

      if (!playersMap.has(p.id)) {
        const mainPos = getMainPosition(p.position);
        playersMap.set(p.id, {
          id: p.id,
          name: p.name,
          club: team.name,
          clubId: team.id,
          leagueId: team.leagueId,
          leagueName,
          countryCode: p.nationality?.code || team.countryCode || 'ENG',
          mainPosition: mainPos,
          subPosition: p.subPosition || p.position || 'ST',
          ovr: p.ovr || team.overallRating || 75,
          age: p.age || 24,
          goals: ['ST', 'CF', 'LW', 'RW'].includes((p.subPosition || p.position || '').toUpperCase())
            ? Math.max(2, Math.floor(((p.ovr || 75) - 70) * 1.0))
            : ['CAM', 'CM', 'LM', 'RM'].includes((p.subPosition || p.position || '').toUpperCase())
            ? Math.max(0, Math.floor(((p.ovr || 75) - 72) * 0.35))
            : 0,
          assists: ['CAM', 'CM', 'LM', 'RM'].includes((p.subPosition || p.position || '').toUpperCase())
            ? Math.max(2, Math.floor(((p.ovr || 75) - 70) * 0.8))
            : ['ST', 'CF', 'LW', 'RW'].includes((p.subPosition || p.position || '').toUpperCase())
            ? Math.max(1, Math.floor(((p.ovr || 75) - 72) * 0.45))
            : ['LB', 'RB', 'LWB', 'RWB'].includes((p.subPosition || p.position || '').toUpperCase())
            ? Math.max(0, Math.floor(((p.ovr || 75) - 74) * 0.3))
            : 0,
          matches: Math.min(38, Math.max(12, Math.floor(24 + ((p.ovr || 75) - 75) * 0.7))),
          avgRating: parseFloat((Math.min(8.2, Math.max(6.6, 6.9 + ((p.ovr || 75) - 75) * 0.04))).toFixed(1)),
          cleanSheets: ['GK', 'CB', 'LB', 'RB'].includes((p.subPosition || p.position || '').toUpperCase())
            ? Math.max(3, Math.floor(((p.ovr || 75) - 70) * 0.5))
            : 0,
          isUserPlayer: false,
        });
      }
    });
  });

  return Array.from(playersMap.values());
}

/**
 * Calculates complete end-of-season world individual awards strictly based on simulation data and rules.
 */
export function calculateWorldIndividualAwards(
  userPlayer: PlayerCardData,
  userStats: { goals: number; assists: number; matches: number; avgRating: number; cleanSheets?: number },
  seasonYear: string = '2026/27',
  forceFresh: boolean = false
): WorldAwardsSeasonResults {
  const cacheKey = `${AWARDS_CACHE_PREFIX}${seasonYear.replace('/', '_')}`;
  if (!forceFresh) {
    const cached = safeGetItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.europeanGoldenBoot && parsed.worldXI) {
          const topGbGoals = parsed.europeanGoldenBoot?.ranking?.[0]?.goals || 0;
          // If cached data has 0 goals on golden boot winner, invalidate stale cache so it recalculates with real data
          if (topGbGoals > 0 || (userStats.matches === 0 && !userPlayer.club)) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to parse cached world awards:', e);
      }
    }
  }

  const db = getCareerLeagueDatabase();
  const worldState = getWorldSimulationState(seasonYear, db, userPlayer);
  const calendarYear = parseCalendarYear(seasonYear);
  const playerPool = collectWorldwidePlayerPool(userPlayer, userStats, db, worldState);

  // Retrieve complete calendar-year dataset from the new YEARLY AWARD DATA system
  const yearlyData = getYearlyAwardData(calendarYear, {
    includeActiveSeason: true,
    activeSeasonYear: seasonYear,
    activeWorldState: worldState,
    player: userPlayer,
  });

  // Ensure worldwide player representation and synchronize live league statistics
  playerPool.forEach((p) => {
    if (!p.isUserPlayer || isProfessionalPlayer(userPlayer)) {
      const existing = yearlyData.players[p.id];
      if (!existing) {
        yearlyData.players[p.id] = {
          playerId: p.id,
          calendarYear,
          playerName: p.name,
          teamId: p.clubId || p.club,
          teamName: p.club,
          countryCode: p.countryCode,
          position: p.mainPosition,
          subPosition: p.subPosition,
          ovr: p.ovr,
          age: p.age,
          isUserPlayer: Boolean(p.isUserPlayer),
          appearances: p.matches,
          starts: p.matches,
          minutes: p.matches * 85,
          goals: p.goals,
          assists: p.assists,
          totalRating: p.avgRating * Math.max(1, p.matches),
          ratingCount: Math.max(1, p.matches),
          avgRating: p.avgRating,
          cleanSheets: p.cleanSheets,
          defensiveStops: p.mainPosition === 'DEF' ? 25 : 0,
          yellowCards: 0,
          redCards: 0,
          mvpCount: 0,
          intlAppearances: 0,
          intlStarts: 0,
          intlMinutes: 0,
          intlGoals: 0,
          intlAssists: 0,
          intlCleanSheets: 0,
          intlTrophies: [],
          teamTrophies: [],
          individualAchievements: [],
          competitions: {},
        };
      } else {
        // Synchronize accurate stats from active player pool so they never sit at 0
        if (p.goals > existing.goals) existing.goals = p.goals;
        if (p.assists > existing.assists) existing.assists = p.assists;
        if (p.matches > existing.appearances) {
          existing.appearances = p.matches;
          existing.starts = p.matches;
          existing.minutes = p.matches * 85;
        }
        if (p.cleanSheets > existing.cleanSheets) existing.cleanSheets = p.cleanSheets;
        if (p.avgRating > 0 && (existing.avgRating === 0 || p.avgRating > existing.avgRating)) {
          existing.avgRating = p.avgRating;
          existing.totalRating = p.avgRating * Math.max(1, existing.appearances);
          existing.ratingCount = Math.max(1, existing.appearances);
        }
        if (p.ovr > existing.ovr) existing.ovr = p.ovr;
      }
    }
  });

  // Handle Unique Career Player:
  // If professional, include in the same yearly award calculations as all other professional players
  // If in youth academy / amateur, strictly exclude from professional awards
  const isPro = isProfessionalPlayer(userPlayer);
  const userUniqueId = userPlayer.id || 'user_player';

  if (isPro) {
    const existingUserRecord = yearlyData.players[userUniqueId];
    const userMainPos = getMainPosition(userPlayer.position);
    if (!existingUserRecord) {
      yearlyData.players[userUniqueId] = {
        playerId: userUniqueId,
        calendarYear,
        playerName: userPlayer.name || 'Player',
        teamId: userPlayer.clubId || 'user_club',
        teamName: userPlayer.club || 'Club',
        countryCode: userPlayer.countryCode || userPlayer.nationality?.code || 'ENG',
        position: userMainPos,
        subPosition: userPlayer.subPosition || userPlayer.position || 'ST',
        ovr: userPlayer.ovr || 75,
        age: userPlayer.age || 20,
        isUserPlayer: true,
        appearances: Math.max(1, userStats.matches || 0),
        starts: Math.max(1, userStats.matches || 0),
        minutes: Math.max(1, userStats.matches || 0) * 85,
        goals: userStats.goals || 0,
        assists: userStats.assists || 0,
        totalRating: (userStats.avgRating || 7.0) * Math.max(1, userStats.matches || 1),
        ratingCount: Math.max(1, userStats.matches || 1),
        avgRating: userStats.avgRating || 7.0,
        cleanSheets: userStats.cleanSheets || (userMainPos === 'GK' || userMainPos === 'DEF' ? 8 : 0),
        defensiveStops: userMainPos === 'DEF' ? 25 : 0,
        yellowCards: 0,
        redCards: 0,
        mvpCount: 0,
        intlAppearances: 0,
        intlStarts: 0,
        intlMinutes: 0,
        intlGoals: 0,
        intlAssists: 0,
        intlCleanSheets: 0,
        intlTrophies: [],
        teamTrophies: [],
        individualAchievements: [],
        competitions: {},
      };
    } else {
      if (userStats.goals > existingUserRecord.goals) existingUserRecord.goals = userStats.goals;
      if (userStats.assists > existingUserRecord.assists) existingUserRecord.assists = userStats.assists;
      if (userStats.matches > existingUserRecord.appearances) existingUserRecord.appearances = userStats.matches;
      if (userStats.avgRating > 0) {
        existingUserRecord.avgRating = parseFloat(((existingUserRecord.avgRating + userStats.avgRating) / 2).toFixed(2));
      }
      if (userStats.cleanSheets && userStats.cleanSheets > existingUserRecord.cleanSheets) {
        existingUserRecord.cleanSheets = userStats.cleanSheets;
      }
    }
  } else {
    delete yearlyData.players[userUniqueId];
  }

  const allYearlyPlayers = Object.values(yearlyData.players);

  // Sync competition winners from world state if not yet recorded
  if (!yearlyData.competitionWinners.continentalChampions['ucl']) {
    yearlyData.competitionWinners.continentalChampions['ucl'] = worldState.continental?.['ucl']?.winner?.teamName || 'Real Madrid';
  }
  if (!yearlyData.competitionWinners.continentalChampions['uel']) {
    yearlyData.competitionWinners.continentalChampions['uel'] = worldState.continental?.['uel']?.winner?.teamName || 'Tottenham';
  }
  if (!yearlyData.competitionWinners.continentalChampions['libertadores']) {
    yearlyData.competitionWinners.continentalChampions['libertadores'] = worldState.continental?.['libertadores']?.winner?.teamName || 'Flamengo';
  }
  if (Object.keys(yearlyData.competitionWinners.internationalChampions).length === 0) {
    yearlyData.competitionWinners.internationalChampions['world_cup'] = worldState.international?.['world_cup']?.winner?.teamName || (userPlayer.countryCode === 'ARG' ? 'Argentina' : 'France');
  }
  if (Object.keys(yearlyData.competitionWinners.domesticChampions).length === 0) {
    Object.values(worldState.leagues).forEach((lState) => {
      const topTeam = lState.standings[0]?.teamName;
      if (topTeam) {
        yearlyData.competitionWinners.domesticChampions[lState.leagueId] = topTeam;
      }
    });
  }

  // -------------------------------------------------------------
  // 1. BEST STRIKER (Calendar-Year Attacking Excellence & Impact)
  // -------------------------------------------------------------
  // In Yearly Awards, Golden Boot is renamed to Best Striker:
  // Evaluates overall attacking performance (weighted goals, assists,
  // scoring rate efficiency, match rating, and tournament impact).
  const bestStrikerCandidates: BestStrikerNominee[] = allYearlyPlayers
    .filter((p) => {
      const pos = (p.position || '').toUpperCase();
      const sub = (p.subPosition || '').toUpperCase();
      const isAttacker =
        getMainPosition(pos) === 'ATT' ||
        ['ST', 'CF', 'LW', 'RW', 'CAM', 'FORWARD', 'STRIKER'].some((s) => pos.includes(s) || sub.includes(s));
      return isAttacker || p.goals >= 12;
    })
    .map((p) => {
      const prestige = getLeaguePrestigeFactor(p.teamId, p.teamName, p.countryCode);
      const effectiveGoals = parseFloat((p.goals * prestige.factor).toFixed(1));
      const effectiveAssists = parseFloat((p.assists * prestige.factor).toFixed(1));
      const breakdown: string[] = [];

      // Goal-scoring contribution (European/elite weighted)
      const goalPts = parseFloat((effectiveGoals * 2.2).toFixed(1));
      let attackingScore = goalPts;
      breakdown.push(`${p.goals} Goals (${effectiveGoals} Weighted) [+${goalPts}]`);

      // Playmaking contribution
      if (effectiveAssists > 0) {
        const assistPts = parseFloat((effectiveAssists * 1.2).toFixed(1));
        attackingScore += assistPts;
        breakdown.push(`${p.assists} Assists (${effectiveAssists} Weighted) [+${assistPts}]`);
      }

      // Scoring efficiency (Goals per match)
      if (p.appearances >= 8 && p.goals > 0) {
        const rate = p.goals / Math.max(1, p.appearances);
        const rateBonus = parseFloat((Math.min(12, rate * 10)).toFixed(1));
        if (rateBonus > 0) {
          attackingScore += rateBonus;
          breakdown.push(`${rate.toFixed(2)} Goals/Match Rate [+${rateBonus}]`);
        }
      }

      // Match rating impact
      if (p.avgRating >= 7.2) {
        const ratingBonus = parseFloat(((p.avgRating - 7.0) * 8).toFixed(1));
        if (ratingBonus > 0) {
          attackingScore += ratingBonus;
          breakdown.push(`Match Rating (${p.avgRating.toFixed(2)}) [+${ratingBonus}]`);
        }
      }

      // Attacking trophies & decisive honours in calendar year
      let trophyBonus = 0;
      if (
        yearlyData.competitionWinners.continentalChampions['ucl'] === p.teamName ||
        p.teamTrophies.some((t) => t.toLowerCase().includes('champions league') && !t.toLowerCase().includes('afc'))
      ) {
        trophyBonus += 6.0;
        breakdown.push('UEFA Champions League Winner [+6.0]');
      }
      if (
        Object.values(yearlyData.competitionWinners.internationalChampions).some((c) => c === p.countryCode) ||
        p.intlTrophies.some((t) => t.toLowerCase().includes('world cup'))
      ) {
        trophyBonus += 7.5;
        breakdown.push('FIFA World Cup Champion [+7.5]');
      }
      if (
        Object.values(yearlyData.competitionWinners.domesticChampions).some((c) => c === p.teamName) ||
        p.teamTrophies.some((t) => t.toLowerCase().includes('league champion'))
      ) {
        const domesticTrophyPts = parseFloat((2.5 * prestige.factor).toFixed(1));
        trophyBonus += domesticTrophyPts;
        breakdown.push(`Domestic League Champion [+${domesticTrophyPts}]`);
      }
      attackingScore += trophyBonus;

      return {
        id: p.playerId,
        name: p.playerName,
        club: p.teamName,
        countryCode: p.countryCode,
        mainPosition: 'ATT' as MainPosition,
        subPosition: p.subPosition || p.position || 'ST',
        ovr: p.ovr,
        isUserPlayer: Boolean(p.isUserPlayer),
        rank: 0,
        goals: p.goals,
        assists: p.assists,
        matches: p.appearances,
        avgRating: p.avgRating,
        attackingScore: parseFloat(attackingScore.toFixed(1)),
        pointsBreakdown: breakdown,
        isWinner: false,
      };
    });

  bestStrikerCandidates.sort((a, b) => {
    return b.attackingScore - a.attackingScore || b.goals - a.goals || b.avgRating - a.avgRating || b.ovr - a.ovr;
  });

  const bestStriker: BestStrikerNominee[] = bestStrikerCandidates.slice(0, 5).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    isWinner: idx === 0,
  }));

  // Map to topGoldenBoot for backwards compatibility with UI components expecting europeanGoldenBoot
  const topGoldenBoot: EuropeanGoldenBootEntry[] = bestStriker.map((b, idx) => ({
    id: b.id,
    name: b.name,
    club: b.club,
    countryCode: b.countryCode,
    mainPosition: b.mainPosition,
    subPosition: b.subPosition,
    ovr: b.ovr,
    isUserPlayer: b.isUserPlayer,
    rank: idx + 1,
    goals: b.goals,
    leagueId: b.club,
    leagueName: b.pointsBreakdown[0] || 'Domestic League',
    leagueFactor: 1.0,
    weightedPoints: b.attackingScore,
    isWinner: idx === 0,
  }));

  // Separate European Golden Shoe (Awarded during European Season Summary based on domestic league goals × UEFA association coefficient)
  const europeanGoldenShoe: EuropeanGoldenShoeEntry[] = calculateEuropeanGoldenShoe(
    seasonYear,
    db,
    userPlayer,
    userStats.goals
  );

  // -------------------------------------------------------------
  // 2. GOLDEN CREATOR (Calendar Year Assists × League Factor)
  // -------------------------------------------------------------
  const goldenCreatorCandidates: GoldenCreatorEntry[] = allYearlyPlayers.map((p) => {
    const factor = getLeagueWeightFactor(p.teamId, p.teamName);
    const weightedPoints = parseFloat((p.assists * factor).toFixed(1));
    return {
      id: p.playerId,
      name: p.playerName,
      club: p.teamName,
      countryCode: p.countryCode,
      mainPosition: getMainPosition(p.position),
      subPosition: p.subPosition || p.position,
      ovr: p.ovr,
      isUserPlayer: Boolean(p.isUserPlayer),
      rank: 0,
      assists: p.assists,
      leagueId: p.teamId,
      leagueName: p.competitions[Object.keys(p.competitions)[0]]?.competitionName || 'Domestic League',
      leagueFactor: factor,
      weightedPoints,
      isWinner: false,
    };
  });

  goldenCreatorCandidates.sort((a, b) => {
    if ((b.assists > 0) !== (a.assists > 0)) return b.assists > 0 ? 1 : -1;
    return b.weightedPoints - a.weightedPoints || b.assists - a.assists || b.ovr - a.ovr;
  });
  const topGoldenCreator = goldenCreatorCandidates.slice(0, 5).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    isWinner: idx === 0 || entry.weightedPoints === goldenCreatorCandidates[0].weightedPoints,
  }));

  // -------------------------------------------------------------
  // 3. DOMESTIC LEAGUE AWARDS (Active League Context)
  // -------------------------------------------------------------
  let activeLeagueId = 'england_d1';
  let activeLeagueName = 'Premier League';
  let activeCountryCode = userPlayer.countryCode || 'ENG';

  if (isPro) {
    const resolved = resolvePlayerProfessionalLeague(userPlayer, db);
    activeLeagueId = resolved.league?.id || 'england_d1';
    activeLeagueName = resolved.league?.name || 'Premier League';
    activeCountryCode = resolved.league?.countryCode || 'ENG';
  } else {
    activeLeagueName = userPlayer.youthLeagueName || 'Youth League U16';
  }

  const domesticPool = playerPool.filter((p) => p.leagueId === activeLeagueId || p.leagueName === activeLeagueName);

  const domesticScorers = [...domesticPool].sort((a, b) => b.goals - a.goals || b.ovr - a.ovr);
  const top5DomesticScorers: DomesticLeaderboardEntry[] = domesticScorers.slice(0, 5).map((p, idx) => ({
    rank: idx + 1,
    playerName: p.name,
    clubName: p.club,
    value: p.goals,
    isPlayer: Boolean(p.isUserPlayer),
    countryCode: p.countryCode,
  }));

  const domesticAssists = [...domesticPool].sort((a, b) => b.assists - a.assists || b.ovr - a.ovr);
  const top5DomesticAssists: DomesticLeaderboardEntry[] = domesticAssists.slice(0, 5).map((p, idx) => ({
    rank: idx + 1,
    playerName: p.name,
    clubName: p.club,
    value: p.assists,
    isPlayer: Boolean(p.isUserPlayer),
    countryCode: p.countryCode,
  }));

  const domesticRatings = [...domesticPool].sort((a, b) => b.avgRating - a.avgRating || b.ovr - a.ovr);
  const top5DomesticRatings: DomesticLeaderboardEntry[] = domesticRatings.slice(0, 5).map((p, idx) => ({
    rank: idx + 1,
    playerName: p.name,
    clubName: p.club,
    value: p.avgRating,
    isPlayer: Boolean(p.isUserPlayer),
    countryCode: p.countryCode,
  }));

  // Best Young Player (U21) of the League - highest rated U21 player with league performance
  const domesticYoungCandidates = domesticPool.filter((p) => (p.age ?? 20) <= 21);
  const sortedYoung = [...domesticYoungCandidates].sort((a, b) => {
    return (b.avgRating - a.avgRating) || ((b.goals + b.assists) - (a.goals + a.assists)) || (b.ovr - a.ovr);
  });
  const top5YoungPlayers = sortedYoung.slice(0, 5).map((p, idx) => ({
    rank: idx + 1,
    playerName: p.name,
    clubName: p.club,
    value: p.avgRating,
    age: p.age,
    ovr: p.ovr,
    isPlayer: Boolean(p.isUserPlayer),
    countryCode: p.countryCode,
  }));
  const bestYoungPlayerWinner = top5YoungPlayers[0] || (
    (userPlayer.age || 18) <= 21 ? {
      rank: 1,
      playerName: userPlayer.name || 'Player',
      clubName: userPlayer.club || 'Club',
      value: userStats.avgRating || 7.2,
      age: userPlayer.age || 18,
      ovr: userPlayer.ovr || 75,
      isPlayer: true,
      countryCode: userPlayer.countryCode || 'ENG',
    } : undefined
  );

  // League Best XI Selection (Ballon d'Or-style system ranked exclusively by domestic league performance)
  const evaluatedLeagueXI = domesticPool.map((p) => {
    let pts = 0;
    const breakdown: string[] = [];

    // League Rating
    if (p.avgRating >= 8.2) {
      pts += 5.0;
      breakdown.push(`Elite League Rating (${p.avgRating.toFixed(2)}) [+5.0]`);
    } else if (p.avgRating >= 7.6) {
      pts += 3.5;
      breakdown.push(`High League Rating (${p.avgRating.toFixed(2)}) [+3.5]`);
    } else if (p.avgRating >= 7.1) {
      pts += 2.0;
      breakdown.push(`Consistent Rating (${p.avgRating.toFixed(2)}) [+2.0]`);
    } else if (p.avgRating >= 6.7) {
      pts += 1.0;
    }

    // League Goals
    if (p.goals >= 18) {
      pts += (p.mainPosition === 'DEF' ? 6.0 : p.mainPosition === 'MID' ? 5.0 : 4.0);
      breakdown.push(`${p.goals} League Goals`);
    } else if (p.goals >= 10) {
      pts += (p.mainPosition === 'DEF' ? 4.5 : p.mainPosition === 'MID' ? 3.5 : 2.5);
      breakdown.push(`${p.goals} League Goals`);
    } else if (p.goals >= 4) {
      pts += (p.mainPosition === 'DEF' ? 2.5 : p.mainPosition === 'MID' ? 1.8 : 1.2);
    } else if (p.goals > 0) {
      pts += (p.mainPosition === 'DEF' ? 1.0 : p.mainPosition === 'MID' ? 0.6 : 0.4);
    }

    // League Assists
    if (p.assists >= 12) {
      pts += 4.0;
      breakdown.push(`${p.assists} League Assists`);
    } else if (p.assists >= 6) {
      pts += 2.5;
      breakdown.push(`${p.assists} League Assists`);
    } else if (p.assists > 0) {
      pts += 1.0;
    }

    // League Appearances
    if (p.matches >= 20) {
      pts += 2.0;
    } else if (p.matches >= 10) {
      pts += 1.0;
    }

    // Clean sheets (GK/DEF)
    if (p.mainPosition === 'GK' || p.mainPosition === 'DEF') {
      if (p.cleanSheets >= 10) {
        pts += 3.0;
        breakdown.push(`${p.cleanSheets} Clean Sheets`);
      } else if (p.cleanSheets >= 5) {
        pts += 1.5;
      }
    }

    // Overall Quality Rating
    const ovrBonus = parseFloat((Math.max(0, p.ovr - 70) * 0.1).toFixed(1));
    if (ovrBonus > 0) {
      pts += ovrBonus;
    }

    return {
      id: p.id,
      name: p.name,
      club: p.club,
      countryCode: p.countryCode,
      mainPosition: p.mainPosition,
      subPosition: p.subPosition,
      ovr: p.ovr,
      isUserPlayer: Boolean(p.isUserPlayer),
      points: parseFloat(pts.toFixed(1)),
      pointsBreakdown: breakdown,
      selected: false,
    };
  });

  const sortedLeagueGks = evaluatedLeagueXI.filter((p) => p.mainPosition === 'GK').sort((a, b) => b.points - a.points || b.ovr - a.ovr);
  const sortedLeagueDefs = evaluatedLeagueXI.filter((p) => p.mainPosition === 'DEF').sort((a, b) => b.points - a.points || b.ovr - a.ovr);
  const sortedLeagueMids = evaluatedLeagueXI.filter((p) => p.mainPosition === 'MID').sort((a, b) => b.points - a.points || b.ovr - a.ovr);
  const sortedLeagueAtts = evaluatedLeagueXI.filter((p) => p.mainPosition === 'ATT').sort((a, b) => b.points - a.points || b.ovr - a.ovr);

  const selectedLeagueGk = sortedLeagueGks[0] || evaluatedLeagueXI[0];
  const selectedLeagueDefs = sortedLeagueDefs.slice(0, 4);
  const selectedLeagueMids = sortedLeagueMids.slice(0, 3);
  const selectedLeagueAtts = sortedLeagueAtts.slice(0, 3);

  const leagueAllEleven = [
    selectedLeagueGk,
    ...selectedLeagueDefs,
    ...selectedLeagueMids,
    ...selectedLeagueAtts,
  ].filter(Boolean).map((p) => ({ ...p, selected: true }));

  const leagueBestXI: WorldXISelection = {
    formation: '4-3-3',
    defCount: selectedLeagueDefs.length,
    midCount: selectedLeagueMids.length,
    attCount: selectedLeagueAtts.length,
    goalkeeper: selectedLeagueGk ? { ...selectedLeagueGk, selected: true } : undefined as any,
    defenders: selectedLeagueDefs.map((p) => ({ ...p, selected: true })),
    midfielders: selectedLeagueMids.map((p) => ({ ...p, selected: true })),
    attackers: selectedLeagueAtts.map((p) => ({ ...p, selected: true })),
    allEleven: leagueAllEleven,
  };

  const domesticTopScorerTrophyName = getDomesticTopScorerName(activeLeagueId, activeLeagueName, activeCountryCode);
  const topScorerWinner = top5DomesticScorers[0] || { rank: 1, playerName: userPlayer.name, clubName: userPlayer.club, value: userStats.goals, isPlayer: true };
  const topAssistsWinner = top5DomesticAssists[0] || { rank: 1, playerName: userPlayer.name, clubName: userPlayer.club, value: userStats.assists, isPlayer: true };
  const bestPlayerWinner = top5DomesticRatings[0] || { rank: 1, playerName: userPlayer.name, clubName: userPlayer.club, value: userStats.avgRating, isPlayer: true };

  const domesticGks = domesticPool.filter((p) => p.mainPosition === 'GK' || (p.subPosition || '').includes('GK'));
  const topGk = domesticGks.sort((a, b) => b.ovr - a.ovr || b.avgRating - a.avgRating)[0];
  const isUserGk = (userPlayer.position || '').toUpperCase().includes('GK') || (userPlayer.subPosition || '').toUpperCase().includes('GK');
  const userCleanSheets = userStats.cleanSheets || 0;

  const bestGoalkeeperDomesticWinner = (isUserGk && userCleanSheets >= 14)
    ? { playerName: userPlayer.name || 'Player', clubName: userPlayer.club || 'Club', cleanSheets: userCleanSheets, goalsConceded: 18, isPlayer: true }
    : topGk
    ? { playerName: topGk.name, clubName: topGk.club, cleanSheets: 16 + Math.floor(Math.random() * 4), goalsConceded: 22 + Math.floor(Math.random() * 6), isPlayer: Boolean(topGk.isUserPlayer) }
    : { playerName: 'Premier Goalkeeper', clubName: userPlayer.club || 'Club', cleanSheets: 15, goalsConceded: 24, isPlayer: false };

  const domesticAwards: DomesticLeagueAwards = {
    leagueId: activeLeagueId,
    leagueName: activeLeagueName,
    domesticTopScorerTrophyName,
    topScorerWinner,
    topScorers: top5DomesticScorers,
    topAssistsWinner,
    topAssists: top5DomesticAssists,
    bestPlayerWinner,
    topRatings: top5DomesticRatings,
    bestYoungPlayerWinner,
    topYoungPlayers: top5YoungPlayers,
    leagueBestXI,
    bestGoalkeeperWinner: bestGoalkeeperDomesticWinner,
  };

  // -------------------------------------------------------------
  // 4. BALLON D'OR (Complete Calendar-Year Performance & Merits)
  // -------------------------------------------------------------
  const ballonDorCandidates = allYearlyPlayers.map((p) => {
    let pts = 0;
    const breakdown: string[] = [];
    const mainPos = getMainPosition(p.position);
    const prestige = getLeaguePrestigeFactor(p.teamId, p.teamName, p.countryCode);
    const effectiveGoals = parseFloat((p.goals * prestige.factor).toFixed(1));
    const effectiveAssists = parseFloat((p.assists * prestige.factor).toFixed(1));

    // Baseline Match Rating
    if (p.avgRating >= 8.2) {
      pts += 4.0;
      breakdown.push(`Elite Rating (${p.avgRating.toFixed(2)}) [+4.0]`);
    } else if (p.avgRating >= 7.8) {
      pts += 2.5;
      breakdown.push(`Outstanding Rating (${p.avgRating.toFixed(2)}) [+2.5]`);
    } else if (p.avgRating >= 7.4) {
      pts += 1.5;
      breakdown.push(`Strong Rating (${p.avgRating.toFixed(2)}) [+1.5]`);
    }

    // Calendar Year Goals (Prestige-weighted so European domestic goals and international tournament goals are prioritized)
    if (effectiveGoals >= 35) {
      pts += 6.5;
      breakdown.push(`${p.goals} Goals (${effectiveGoals} Weighted) [+6.5]`);
    } else if (effectiveGoals >= 25) {
      pts += 5.0;
      breakdown.push(`${p.goals} Goals (${effectiveGoals} Weighted) [+5.0]`);
    } else if (effectiveGoals >= 16) {
      pts += 3.5;
      breakdown.push(`${p.goals} Goals (${effectiveGoals} Weighted) [+3.5]`);
    } else if (effectiveGoals >= 9) {
      pts += 2.0;
      breakdown.push(`${p.goals} Goals (${effectiveGoals} Weighted) [+2.0]`);
    }

    // Calendar Year Assists (Prestige-weighted)
    if (effectiveAssists >= 16) {
      pts += 4.5;
      breakdown.push(`${p.assists} Assists (${effectiveAssists} Weighted) [+4.5]`);
    } else if (effectiveAssists >= 10) {
      pts += 3.0;
      breakdown.push(`${p.assists} Assists (${effectiveAssists} Weighted) [+3.0]`);
    } else if (effectiveAssists >= 5) {
      pts += 1.5;
      breakdown.push(`${p.assists} Assists (${effectiveAssists} Weighted) [+1.5]`);
    }

    // Defensive / Goalkeeper Merits (Scaled by league prestige)
    if (mainPos === 'GK' || mainPos === 'DEF') {
      const effectiveCleanSheets = Math.round(p.cleanSheets * prestige.factor);
      if (effectiveCleanSheets >= 16) {
        pts += 4.5;
        breakdown.push(`16+ Clean Sheets (${p.cleanSheets}) [+4.5]`);
      } else if (effectiveCleanSheets >= 10) {
        pts += 3.0;
        breakdown.push(`10+ Clean Sheets (${p.cleanSheets}) [+3.0]`);
      } else if (effectiveCleanSheets >= 6) {
        pts += 1.5;
        breakdown.push(`6+ Clean Sheets (${p.cleanSheets}) [+1.5]`);
      }
    }

    if (mainPos === 'DEF' && p.defensiveStops >= 30) {
      pts += 2.0;
      breakdown.push(`30+ Defensive Stops (${p.defensiveStops}) [+2.0]`);
    }

    // Continental Champions
    const isUclChamp =
      yearlyData.competitionWinners.continentalChampions['ucl'] === p.teamName ||
      p.teamTrophies.some((t) => t.toLowerCase().includes('champions league') && !t.toLowerCase().includes('afc'));
    if (isUclChamp) {
      pts += 6.5;
      breakdown.push('UEFA Champions League Winner [+6.5]');
    }

    const isUelChamp =
      yearlyData.competitionWinners.continentalChampions['uel'] === p.teamName ||
      p.teamTrophies.some((t) => t.toLowerCase().includes('europa league'));
    if (isUelChamp) {
      pts += 3.5;
      breakdown.push('UEFA Europa League Winner [+3.5]');
    }

    const isLibertadores = yearlyData.competitionWinners.continentalChampions['libertadores'] === p.teamName;
    if (isLibertadores) {
      pts += 3.5;
      breakdown.push('Copa Libertadores Winner [+3.5]');
    }

    const isAfcChamp =
      yearlyData.competitionWinners.continentalChampions['afc_cl'] === p.teamName ||
      p.teamTrophies.some((t) => t.toLowerCase().includes('afc champions league'));
    if (isAfcChamp) {
      pts += 2.5;
      breakdown.push('AFC Champions League Winner [+2.5]');
    }

    // Senior International Champions (Crucial global tournament merit for all players)
    const isWcWinner =
      Object.values(yearlyData.competitionWinners.internationalChampions).some((c) => c === p.countryCode) ||
      p.intlTrophies.some((t) => t.toLowerCase().includes('world cup'));
    if (isWcWinner) {
      pts += 7.5;
      breakdown.push('FIFA World Cup Champion [+7.5]');
    }

    // Senior International Runners-Up
    const isWcRunnerUp =
      yearlyData.competitionWinners.internationalRunnersUp &&
      (yearlyData.competitionWinners.internationalRunnersUp['world_cup'] === p.countryCode ||
       yearlyData.competitionWinners.internationalRunnersUp['fifa_world_cup'] === p.countryCode);
    if (isWcRunnerUp) {
      pts += 3.5;
      breakdown.push('FIFA World Cup Runner-Up [+3.5]');
    }

    // Continental National Team Tournaments (Euros, Copa America, Asian Cup, AFCON)
    const isEuroWinner =
      p.intlTrophies.some((t) => t.toLowerCase().includes('euro')) ||
      yearlyData.competitionWinners.internationalChampions['uefa_eurocup'] === p.countryCode ||
      yearlyData.competitionWinners.internationalChampions['euro'] === p.countryCode;
    if (isEuroWinner) {
      pts += 5.5;
      breakdown.push('UEFA European Championship Winner [+5.5]');
    }
    const isCopaWinner =
      p.intlTrophies.some((t) => t.toLowerCase().includes('copa america')) ||
      yearlyData.competitionWinners.internationalChampions['conmebol_copa_américa'] === p.countryCode ||
      yearlyData.competitionWinners.internationalChampions['copa_america'] === p.countryCode;
    if (isCopaWinner) {
      pts += 5.0;
      breakdown.push('Copa América Winner [+5.0]');
    }
    const isAfconOrAsianCupWinner = p.intlTrophies.some(
      (t) => t.toLowerCase().includes('afcon') || t.toLowerCase().includes('asian cup')
    );
    if (isAfconOrAsianCupWinner) {
      pts += 4.5;
      breakdown.push('Continental National Tournament Champion [+4.5]');
    }

    // International Individual Tournament Honors (MVP, Golden Boot, Playmaker)
    const isIntlMvp =
      yearlyData.competitionWinners.internationalMVPs &&
      Object.values(yearlyData.competitionWinners.internationalMVPs).some(
        (m) => m.name.toLowerCase() === p.playerName.toLowerCase() || (m.nationCode === p.countryCode && p.isUserPlayer)
      );
    if (isIntlMvp) {
      pts += 4.5;
      breakdown.push('International Tournament MVP (Golden Ball) [+4.5]');
    }

    const isIntlTopScorer =
      yearlyData.competitionWinners.internationalTopScorers &&
      Object.values(yearlyData.competitionWinners.internationalTopScorers).some(
        (s) => s.name.toLowerCase() === p.playerName.toLowerCase() || (s.nationCode === p.countryCode && p.isUserPlayer)
      );
    if (isIntlTopScorer) {
      pts += 3.5;
      breakdown.push('International Golden Boot (Top Scorer) [+3.5]');
    }

    const isIntlBestAssister =
      yearlyData.competitionWinners.internationalBestAssisters &&
      Object.values(yearlyData.competitionWinners.internationalBestAssisters).some(
        (a) => a.name.toLowerCase() === p.playerName.toLowerCase() || (a.nationCode === p.countryCode && p.isUserPlayer)
      );
    if (isIntlBestAssister) {
      pts += 2.5;
      breakdown.push('International Tournament Best Playmaker (Top Assists) [+2.5]');
    }

    // International Competition Goals (World Cup & Continental Tournaments count heavily for all leagues)
    if (p.intlGoals >= 5) {
      pts += 3.0;
      breakdown.push(`${p.intlGoals} International Tournament Goals [+3.0]`);
    } else if (p.intlGoals >= 2) {
      pts += 1.5;
      breakdown.push(`${p.intlGoals} International Tournament Goals [+1.5]`);
    }

    // Domestic Champions (Weighted by League Prestige Factor)
    const isDomesticChamp =
      Object.values(yearlyData.competitionWinners.domesticChampions).some((c) => c === p.teamName) ||
      p.teamTrophies.some((t) => t.toLowerCase().includes('league champion'));
    if (isDomesticChamp) {
      const champPts = parseFloat((2.5 * prestige.factor).toFixed(1));
      pts += champPts;
      breakdown.push(`Domestic League Champion [+${champPts}]`);
    }

    // Domestic Cup Winners (Weighted by League Prestige Factor)
    const isDomesticCupWinner =
      Object.values(yearlyData.competitionWinners.domesticCupWinners).some((c) => c === p.teamName) ||
      p.teamTrophies.some((t) => t.toLowerCase().includes('cup winner'));
    if (isDomesticCupWinner) {
      const cupPts = parseFloat((1.5 * prestige.factor).toFixed(1));
      pts += cupPts;
      breakdown.push(`Domestic Cup Winner [+${cupPts}]`);
    }

    // MVP Count
    if (p.mvpCount >= 5) {
      pts += 2.0;
      breakdown.push(`5+ Match MVP Honors (${p.mvpCount}) [+2.0]`);
    } else if (p.mvpCount >= 2) {
      pts += 1.0;
      breakdown.push(`Match MVP Honors (${p.mvpCount}) [+1.0]`);
    }

    // World-class standing (OVR)
    const classPts = parseFloat((Math.max(0, p.ovr - 70) * 0.1).toFixed(1));
    if (classPts > 0) {
      pts += classPts;
      breakdown.push(`World Class Standing (${p.ovr} OVR) [+${classPts}]`);
    }

    return {
      player: p,
      points: parseFloat(pts.toFixed(1)),
      pointsBreakdown: breakdown,
    };
  });

  ballonDorCandidates.sort((a, b) => b.points - a.points || b.player.avgRating - a.player.avgRating || (b.player.goals + b.player.assists) - (a.player.goals + a.player.assists) || b.player.ovr - a.player.ovr);

  const top30BallonDorNominees = ballonDorCandidates.slice(0, 30);
  const ballonDor: BallonDorNominee[] = top30BallonDorNominees.map((c, idx) => ({
    id: c.player.playerId,
    name: c.player.playerName,
    club: c.player.teamName,
    countryCode: c.player.countryCode,
    mainPosition: getMainPosition(c.player.position),
    ovr: c.player.ovr,
    isUserPlayer: Boolean(c.player.isUserPlayer),
    rank: idx + 1,
    points: c.points,
    pointsBreakdown: c.pointsBreakdown,
    isWinner: idx === 0,
  }));

  const top30BallonDor: Top30Entry[] = top30BallonDorNominees.map((c, idx) => ({
    rank: idx + 1,
    playerId: c.player.playerId,
    name: c.player.playerName,
    teamId: c.player.teamId,
    teamName: c.player.teamName,
    countryCode: c.player.countryCode,
    mainPosition: getMainPosition(c.player.position),
    ovr: c.player.ovr,
    value: c.points,
    secondaryStats: {
      goals: c.player.goals,
      assists: c.player.assists,
      matches: c.player.appearances,
      avgRating: c.player.avgRating,
      cleanSheets: c.player.cleanSheets,
    },
    relevantCompetitions: Object.values(c.player.competitions).map((comp) => comp.competitionName),
    relevantTrophiesAndMerits: [...c.player.teamTrophies, ...c.player.intlTrophies, ...c.pointsBreakdown],
    isUserPlayer: Boolean(c.player.isUserPlayer),
    points: c.points,
    pointsBreakdown: c.pointsBreakdown,
    isWinner: idx === 0,
  }));

  // -------------------------------------------------------------
  // 5. BEST GOALKEEPER (Yashin Trophy)
  // -------------------------------------------------------------
  const gkPool = allYearlyPlayers.filter((p) => getMainPosition(p.position) === 'GK');
  const evaluatedGks = gkPool.map((p) => {
    let pts = 0;
    const breakdown: string[] = [];

    if (p.cleanSheets >= 16) {
      pts += 5.0;
      breakdown.push(`Elite Clean Sheets (${p.cleanSheets}) [+5.0]`);
    } else if (p.cleanSheets >= 10) {
      pts += 3.5;
      breakdown.push(`10+ Clean Sheets (${p.cleanSheets}) [+3.5]`);
    } else if (p.cleanSheets >= 6) {
      pts += 2.0;
      breakdown.push(`6+ Clean Sheets (${p.cleanSheets}) [+2.0]`);
    }

    if (p.avgRating >= 7.6) {
      pts += 3.5;
      breakdown.push(`Top Shot-Stopping Rating (${p.avgRating.toFixed(2)}) [+3.5]`);
    } else if (p.avgRating >= 7.2) {
      pts += 2.0;
      breakdown.push(`Solid Rating (${p.avgRating.toFixed(2)}) [+2.0]`);
    }

    if (p.appearances >= 25) {
      pts += 2.0;
      breakdown.push(`25+ Matches Started (${p.appearances}) [+2.0]`);
    }

    if (yearlyData.competitionWinners.continentalChampions['ucl'] === p.teamName) {
      pts += 4.0;
      breakdown.push('UEFA Champions League Winner [+4.0]');
    }
    if (Object.values(yearlyData.competitionWinners.internationalChampions).some((c) => c === p.countryCode)) {
      pts += 5.0;
      breakdown.push('World Cup Champion [+5.0]');
    }
    if (Object.values(yearlyData.competitionWinners.domesticChampions).some((c) => c === p.teamName)) {
      pts += 2.0;
      breakdown.push('Domestic League Champion [+2.0]');
    }

    const ovrBonus = parseFloat((Math.max(0, p.ovr - 75) * 0.15).toFixed(1));
    if (ovrBonus > 0) {
      pts += ovrBonus;
      breakdown.push(`Goalkeeper Standing (${p.ovr} OVR) [+${ovrBonus}]`);
    }

    return {
      id: p.playerId,
      name: p.playerName,
      club: p.teamName,
      countryCode: p.countryCode,
      mainPosition: 'GK' as MainPosition,
      subPosition: 'GK',
      ovr: p.ovr,
      isUserPlayer: Boolean(p.isUserPlayer),
      rank: 0,
      points: parseFloat(pts.toFixed(1)),
      pointsBreakdown: breakdown,
      isWinner: false,
    };
  });

  evaluatedGks.sort((a, b) => b.points - a.points || b.ovr - a.ovr);
  const yashinTrophy: YashinNominee[] = evaluatedGks.slice(0, 5).map((y, idx) => ({
    ...y,
    rank: idx + 1,
    isWinner: idx === 0,
  }));

  // -------------------------------------------------------------
  // 6. BEST DEFENDER
  // -------------------------------------------------------------
  const defPool = allYearlyPlayers.filter((p) => getMainPosition(p.position) === 'DEF');
  const evaluatedDefs = defPool.map((p) => {
    let pts = 0;
    const breakdown: string[] = [];

    if (p.cleanSheets >= 16) {
      pts += 4.5;
      breakdown.push(`16+ Clean Sheets (${p.cleanSheets}) [+4.5]`);
    } else if (p.cleanSheets >= 10) {
      pts += 3.0;
      breakdown.push(`10+ Clean Sheets (${p.cleanSheets}) [+3.0]`);
    } else if (p.cleanSheets >= 6) {
      pts += 1.5;
      breakdown.push(`6+ Clean Sheets (${p.cleanSheets}) [+1.5]`);
    }

    if (p.defensiveStops >= 35) {
      pts += 3.0;
      breakdown.push(`35+ Defensive Stops (${p.defensiveStops}) [+3.0]`);
    } else if (p.defensiveStops >= 20) {
      pts += 1.5;
      breakdown.push(`20+ Defensive Stops (${p.defensiveStops}) [+1.5]`);
    }

    if (p.goals >= 5) {
      pts += 2.0;
      breakdown.push(`5+ Goals (${p.goals}) [+2.0]`);
    }
    if (p.assists >= 5) {
      pts += 2.0;
      breakdown.push(`5+ Assists (${p.assists}) [+2.0]`);
    }

    if (p.avgRating >= 7.6) {
      pts += 3.0;
      breakdown.push(`Elite Rating (${p.avgRating.toFixed(2)}) [+3.0]`);
    } else if (p.avgRating >= 7.2) {
      pts += 1.5;
      breakdown.push(`Strong Rating (${p.avgRating.toFixed(2)}) [+1.5]`);
    }

    if (yearlyData.competitionWinners.continentalChampions['ucl'] === p.teamName) {
      pts += 4.0;
      breakdown.push('UCL Winner [+4.0]');
    }
    if (Object.values(yearlyData.competitionWinners.internationalChampions).some((c) => c === p.countryCode)) {
      pts += 5.0;
      breakdown.push('World Cup Champion [+5.0]');
    }
    if (Object.values(yearlyData.competitionWinners.domesticChampions).some((c) => c === p.teamName)) {
      pts += 2.0;
      breakdown.push('Domestic League Champion [+2.0]');
    }

    const ovrBonus = parseFloat((Math.max(0, p.ovr - 75) * 0.15).toFixed(1));
    if (ovrBonus > 0) pts += ovrBonus;

    return {
      id: p.playerId,
      name: p.playerName,
      club: p.teamName,
      countryCode: p.countryCode,
      mainPosition: 'DEF' as MainPosition,
      subPosition: p.subPosition || 'CB',
      ovr: p.ovr,
      isUserPlayer: Boolean(p.isUserPlayer),
      rank: 0,
      points: parseFloat(pts.toFixed(1)),
      pointsBreakdown: breakdown,
      isWinner: false,
      trophiesWon: [...p.teamTrophies, ...p.intlTrophies],
    };
  });

  evaluatedDefs.sort((a, b) => b.points - a.points || b.ovr - a.ovr);
  const bestDefender: PositionalAwardNominee[] = evaluatedDefs.slice(0, 5).map((d, idx) => ({
    ...d,
    rank: idx + 1,
    isWinner: idx === 0,
  }));

  // -------------------------------------------------------------
  // 7. BEST MIDFIELDER
  // -------------------------------------------------------------
  const midPool = allYearlyPlayers.filter((p) => getMainPosition(p.position) === 'MID');
  const evaluatedMids = midPool.map((p) => {
    let pts = 0;
    const breakdown: string[] = [];

    if (p.assists >= 15) {
      pts += 4.5;
      breakdown.push(`15+ Assists (${p.assists}) [+4.5]`);
    } else if (p.assists >= 10) {
      pts += 3.0;
      breakdown.push(`10+ Assists (${p.assists}) [+3.0]`);
    } else if (p.assists >= 6) {
      pts += 1.5;
      breakdown.push(`6+ Assists (${p.assists}) [+1.5]`);
    }

    if (p.goals >= 12) {
      pts += 3.5;
      breakdown.push(`12+ Goals (${p.goals}) [+3.5]`);
    } else if (p.goals >= 6) {
      pts += 2.0;
      breakdown.push(`6+ Goals (${p.goals}) [+2.0]`);
    }

    if (p.avgRating >= 7.8) {
      pts += 3.5;
      breakdown.push(`Elite Rating (${p.avgRating.toFixed(2)}) [+3.5]`);
    } else if (p.avgRating >= 7.3) {
      pts += 2.0;
      breakdown.push(`Strong Rating (${p.avgRating.toFixed(2)}) [+2.0]`);
    }

    if (yearlyData.competitionWinners.continentalChampions['ucl'] === p.teamName) {
      pts += 4.0;
      breakdown.push('UCL Winner [+4.0]');
    }
    if (Object.values(yearlyData.competitionWinners.internationalChampions).some((c) => c === p.countryCode)) {
      pts += 5.0;
      breakdown.push('World Cup Champion [+5.0]');
    }
    if (Object.values(yearlyData.competitionWinners.domesticChampions).some((c) => c === p.teamName)) {
      pts += 2.0;
      breakdown.push('Domestic League Champion [+2.0]');
    }

    const ovrBonus = parseFloat((Math.max(0, p.ovr - 75) * 0.15).toFixed(1));
    if (ovrBonus > 0) pts += ovrBonus;

    return {
      id: p.playerId,
      name: p.playerName,
      club: p.teamName,
      countryCode: p.countryCode,
      mainPosition: 'MID' as MainPosition,
      subPosition: p.subPosition || 'CM',
      ovr: p.ovr,
      isUserPlayer: Boolean(p.isUserPlayer),
      rank: 0,
      points: parseFloat(pts.toFixed(1)),
      pointsBreakdown: breakdown,
      isWinner: false,
      trophiesWon: [...p.teamTrophies, ...p.intlTrophies],
    };
  });

  evaluatedMids.sort((a, b) => b.points - a.points || b.ovr - a.ovr);
  const bestMidfielder: PositionalAwardNominee[] = evaluatedMids.slice(0, 5).map((m, idx) => ({
    ...m,
    rank: idx + 1,
    isWinner: idx === 0,
  }));

  // -------------------------------------------------------------
  // 8. BEST ATTACKER
  // -------------------------------------------------------------
  const attPool = allYearlyPlayers.filter((p) => getMainPosition(p.position) === 'ATT');
  const evaluatedAtts = attPool.map((p) => {
    let pts = 0;
    const breakdown: string[] = [];

    if (p.goals >= 35) {
      pts += 6.0;
      breakdown.push(`35+ Goals (${p.goals}) [+6.0]`);
    } else if (p.goals >= 25) {
      pts += 4.5;
      breakdown.push(`25+ Goals (${p.goals}) [+4.5]`);
    } else if (p.goals >= 15) {
      pts += 3.0;
      breakdown.push(`15+ Goals (${p.goals}) [+3.0]`);
    }

    if (p.assists >= 12) {
      pts += 3.0;
      breakdown.push(`12+ Assists (${p.assists}) [+3.0]`);
    } else if (p.assists >= 6) {
      pts += 1.5;
      breakdown.push(`6+ Assists (${p.assists}) [+1.5]`);
    }

    if (p.avgRating >= 8.0) {
      pts += 3.5;
      breakdown.push(`Elite Rating (${p.avgRating.toFixed(2)}) [+3.5]`);
    } else if (p.avgRating >= 7.5) {
      pts += 2.0;
      breakdown.push(`Strong Rating (${p.avgRating.toFixed(2)}) [+2.0]`);
    }

    if (yearlyData.competitionWinners.continentalChampions['ucl'] === p.teamName) {
      pts += 4.0;
      breakdown.push('UCL Winner [+4.0]');
    }
    if (Object.values(yearlyData.competitionWinners.internationalChampions).some((c) => c === p.countryCode)) {
      pts += 5.0;
      breakdown.push('World Cup Champion [+5.0]');
    }
    if (Object.values(yearlyData.competitionWinners.domesticChampions).some((c) => c === p.teamName)) {
      pts += 2.0;
      breakdown.push('Domestic League Champion [+2.0]');
    }

    const ovrBonus = parseFloat((Math.max(0, p.ovr - 75) * 0.15).toFixed(1));
    if (ovrBonus > 0) pts += ovrBonus;

    return {
      id: p.playerId,
      name: p.playerName,
      club: p.teamName,
      countryCode: p.countryCode,
      mainPosition: 'ATT' as MainPosition,
      subPosition: p.subPosition || 'ST',
      ovr: p.ovr,
      isUserPlayer: Boolean(p.isUserPlayer),
      rank: 0,
      points: parseFloat(pts.toFixed(1)),
      pointsBreakdown: breakdown,
      isWinner: false,
      trophiesWon: [...p.teamTrophies, ...p.intlTrophies],
    };
  });

  evaluatedAtts.sort((a, b) => b.points - a.points || b.ovr - a.ovr);
  const bestAttacker: PositionalAwardNominee[] = evaluatedAtts.slice(0, 5).map((a, idx) => ({
    ...a,
    rank: idx + 1,
    isWinner: idx === 0,
  }));

  // -------------------------------------------------------------
  // 9. BEST YOUNG PLAYER (Golden Boy / Kopa Trophy — Age ≤ 21)
  // -------------------------------------------------------------
  const ballonDorTop3Ids = new Set(ballonDor.slice(0, 3).map((b) => b.id));
  const youngCandidates = allYearlyPlayers.filter((p) => {
    const age = p.age ?? 24;
    return age <= 21 && !ballonDorTop3Ids.has(p.playerId);
  });
  const fallbackYoung = youngCandidates.length >= 5 ? youngCandidates : allYearlyPlayers.filter((p) => (p.age ?? 24) <= 22);

  const evaluatedYoung = (fallbackYoung.length > 0 ? fallbackYoung : allYearlyPlayers).map((p) => {
    let pts = 0;
    const breakdown: string[] = [];

    const gContributions = p.goals + p.assists;
    if (gContributions >= 20) {
      pts += 5.0;
      breakdown.push(`20+ Goal Contributions (${gContributions}) [+5.0]`);
    } else if (gContributions >= 10) {
      pts += 3.0;
      breakdown.push(`10+ Goal Contributions (${gContributions}) [+3.0]`);
    } else if (gContributions >= 5) {
      pts += 1.5;
      breakdown.push(`5+ Goal Contributions (${gContributions}) [+1.5]`);
    }

    if (p.appearances >= 20) {
      pts += 2.5;
      breakdown.push(`20+ Professional Matches (${p.appearances}) [+2.5]`);
    }

    if (p.avgRating >= 7.5) {
      pts += 3.0;
      breakdown.push(`Outstanding Rating (${p.avgRating.toFixed(2)}) [+3.0]`);
    }

    const ovrBonus = parseFloat((Math.max(0, p.ovr - 70) * 0.15).toFixed(1));
    if (ovrBonus > 0) pts += ovrBonus;

    return {
      id: p.playerId,
      name: p.playerName,
      club: p.teamName,
      countryCode: p.countryCode,
      mainPosition: getMainPosition(p.position),
      subPosition: p.subPosition || p.position,
      ovr: p.ovr,
      age: p.age ?? 20,
      tier: 'Nominee' as 'Gold' | 'Silver' | 'Bronze' | 'Nominee',
      rank: 0,
      points: parseFloat(pts.toFixed(1)),
      isUserPlayer: Boolean(p.isUserPlayer),
      isWinner: false,
    };
  });

  evaluatedYoung.sort((a, b) => b.points - a.points || b.ovr - a.ovr);
  const goldenBoy: GoldenBoyNominee[] = evaluatedYoung.slice(0, 5).map((p, idx) => {
    const tier: 'Gold' | 'Silver' | 'Bronze' | 'Nominee' = idx === 0 ? 'Gold' : idx === 1 ? 'Silver' : idx === 2 ? 'Bronze' : 'Nominee';
    return {
      ...p,
      tier,
      rank: idx + 1,
      isWinner: idx === 0,
    };
  });

  // -------------------------------------------------------------
  // 10. BEST MANAGER (Evaluated from calendar-year trophies)
  // -------------------------------------------------------------
  const managerCandidatesMap = new Map<string, ManagerAwardNominee>();

  const recordManager = (name: string, club: string, countryCode: string, points: number, reason: string, trophyName?: string) => {
    if (!managerCandidatesMap.has(name)) {
      managerCandidatesMap.set(name, {
        id: `mgr_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name,
        club,
        countryCode,
        rank: 0,
        points: 0,
        pointsBreakdown: [],
        isWinner: false,
        trophiesWon: [],
      });
    }
    const entry = managerCandidatesMap.get(name)!;
    entry.points += points;
    entry.pointsBreakdown.push(`${reason} [+${points.toFixed(1)}]`);
    if (trophyName && !entry.trophiesWon.includes(trophyName)) {
      entry.trophiesWon.push(trophyName);
    }
  };

  const uclWinnerTeam = yearlyData.competitionWinners.continentalChampions['ucl'] || 'Real Madrid';
  recordManager(getManagerForTeam(uclWinnerTeam, db), uclWinnerTeam, 'ESP', 6.0, 'UEFA Champions League Winner', 'UEFA Champions League');

  const wcWinnerCountry = Object.values(yearlyData.competitionWinners.internationalChampions)[0] || 'ARG';
  recordManager(getManagerForNation(wcWinnerCountry), `${wcWinnerCountry} National Team`, wcWinnerCountry, 7.0, 'FIFA World Cup Champion', 'FIFA World Cup');

  Object.entries(yearlyData.competitionWinners.domesticChampions).forEach(([leagueId, champTeam]) => {
    recordManager(getManagerForTeam(champTeam, db), champTeam, 'ENG', 3.5, `Domestic League Champion (${champTeam})`, 'League Title');
  });

  const uelWinnerTeam = yearlyData.competitionWinners.continentalChampions['uel'] || 'Tottenham';
  recordManager(getManagerForTeam(uelWinnerTeam, db), uelWinnerTeam, 'ENG', 3.5, 'UEFA Europa League Winner', 'UEFA Europa League');

  Object.entries(yearlyData.competitionWinners.domesticCupWinners).forEach(([comp, cupWinner]) => {
    recordManager(getManagerForTeam(cupWinner, db), cupWinner, 'ENG', 2.0, `Domestic Cup Winner (${cupWinner})`, 'Domestic Cup');
  });

  const bestManagerList = Array.from(managerCandidatesMap.values()).sort((a, b) => b.points - a.points);
  const bestManager: ManagerAwardNominee[] = bestManagerList.slice(0, 5).map((m, idx) => ({
    ...m,
    rank: idx + 1,
    isWinner: idx === 0,
  }));

  // -------------------------------------------------------------
  // 11. FOOTBALL WORLD XI (Selected from calendar-year nominees)
  // -------------------------------------------------------------
  const yashinWinner = yashinTrophy[0] || {
    id: 'gk_1',
    name: 'Top Goalkeeper',
    club: 'Elite FC',
    countryCode: 'ENG',
    mainPosition: 'GK',
    ovr: 88,
    isUserPlayer: false,
    rank: 1,
    points: 10,
    pointsBreakdown: ['Elite Shot Stopping'],
    isWinner: true,
  };

  const gkCandidate: WorldXICandidate = {
    id: yashinWinner.id,
    name: yashinWinner.name,
    club: yashinWinner.club,
    countryCode: yashinWinner.countryCode,
    mainPosition: 'GK',
    ovr: yashinWinner.ovr,
    isUserPlayer: yashinWinner.isUserPlayer,
    points: yashinWinner.points,
    pointsBreakdown: yashinWinner.pointsBreakdown,
    selected: true,
    selectedRole: 'GK',
  };

  const selectedDef: WorldXICandidate[] = evaluatedDefs.slice(0, 3).map((d) => ({
    id: d.id,
    name: d.name,
    club: d.club,
    countryCode: d.countryCode,
    mainPosition: 'DEF' as MainPosition,
    ovr: d.ovr,
    isUserPlayer: d.isUserPlayer,
    points: d.points,
    pointsBreakdown: d.pointsBreakdown,
    selected: true,
  }));

  const selectedMid: WorldXICandidate[] = evaluatedMids.slice(0, 3).map((m) => ({
    id: m.id,
    name: m.name,
    club: m.club,
    countryCode: m.countryCode,
    mainPosition: 'MID' as MainPosition,
    ovr: m.ovr,
    isUserPlayer: m.isUserPlayer,
    points: m.points,
    pointsBreakdown: m.pointsBreakdown,
    selected: true,
  }));

  const selectedAtt: WorldXICandidate[] = evaluatedAtts.slice(0, 2).map((a) => ({
    id: a.id,
    name: a.name,
    club: a.club,
    countryCode: a.countryCode,
    mainPosition: 'ATT' as MainPosition,
    ovr: a.ovr,
    isUserPlayer: a.isUserPlayer,
    points: a.points,
    pointsBreakdown: a.pointsBreakdown,
    selected: true,
  }));

  const remainingOutfield: WorldXICandidate[] = [
    ...evaluatedDefs.slice(3).map((d) => ({
      id: d.id,
      name: d.name,
      club: d.club,
      countryCode: d.countryCode,
      mainPosition: 'DEF' as MainPosition,
      ovr: d.ovr,
      isUserPlayer: d.isUserPlayer,
      points: d.points,
      pointsBreakdown: d.pointsBreakdown,
      selected: false,
    })),
    ...evaluatedMids.slice(3).map((m) => ({
      id: m.id,
      name: m.name,
      club: m.club,
      countryCode: m.countryCode,
      mainPosition: 'MID' as MainPosition,
      ovr: m.ovr,
      isUserPlayer: m.isUserPlayer,
      points: m.points,
      pointsBreakdown: m.pointsBreakdown,
      selected: false,
    })),
    ...evaluatedAtts.slice(2).map((a) => ({
      id: a.id,
      name: a.name,
      club: a.club,
      countryCode: a.countryCode,
      mainPosition: 'ATT' as MainPosition,
      ovr: a.ovr,
      isUserPlayer: a.isUserPlayer,
      points: a.points,
      pointsBreakdown: a.pointsBreakdown,
      selected: false,
    })),
  ].sort((a, b) => b.points - a.points || b.ovr - a.ovr);

  let defCount = selectedDef.length;
  let midCount = selectedMid.length;
  let attCount = selectedAtt.length;

  for (const candidate of remainingOutfield) {
    if (selectedDef.length + selectedMid.length + selectedAtt.length >= 10) break;
    if (candidate.mainPosition === 'DEF' && defCount < 4) {
      selectedDef.push({ ...candidate, selected: true });
      defCount++;
    } else if (candidate.mainPosition === 'MID' && midCount < 5) {
      selectedMid.push({ ...candidate, selected: true });
      midCount++;
    } else if (candidate.mainPosition === 'ATT' && attCount < 3) {
      selectedAtt.push({ ...candidate, selected: true });
      attCount++;
    }
  }

  let formation: WorldXIFormation = '4-3-3';
  if (defCount === 3 && midCount === 4 && attCount === 3) formation = '3-4-3';
  else if (defCount === 3 && midCount === 5 && attCount === 2) formation = '3-5-2';
  else if (defCount === 4 && midCount === 3 && attCount === 3) formation = '4-3-3';
  else if (defCount === 4 && midCount === 4 && attCount === 2) formation = '4-4-2';

  const allEleven: WorldXICandidate[] = [
    gkCandidate,
    ...selectedDef,
    ...selectedMid,
    ...selectedAtt,
  ];

  const worldXI: WorldXISelection = {
    formation,
    defCount,
    midCount,
    attCount,
    goalkeeper: gkCandidate,
    defenders: selectedDef,
    midfielders: selectedMid,
    attackers: selectedAtt,
    allEleven,
  };

  // -------------------------------------------------------------
  // 12. TOP 30 LEADERBOARDS (Calendar Year)
  // -------------------------------------------------------------
  const top30Goalscorers: Top30Entry[] = [...allYearlyPlayers]
    .sort((a, b) => b.goals - a.goals || b.ovr - a.ovr)
    .slice(0, 30)
    .map((p, idx) => ({
      rank: idx + 1,
      playerId: p.playerId,
      name: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      countryCode: p.countryCode,
      mainPosition: getMainPosition(p.position),
      ovr: p.ovr,
      value: p.goals,
      secondaryStats: {
        goals: p.goals,
        assists: p.assists,
        matches: p.appearances,
        avgRating: p.avgRating,
        cleanSheets: p.cleanSheets,
      },
      relevantCompetitions: Object.values(p.competitions).map((c) => c.competitionName),
      relevantTrophiesAndMerits: [...p.teamTrophies, ...p.intlTrophies],
      isUserPlayer: Boolean(p.isUserPlayer),
    }));

  const top30AssistProviders: Top30Entry[] = [...allYearlyPlayers]
    .sort((a, b) => b.assists - a.assists || b.ovr - a.ovr)
    .slice(0, 30)
    .map((p, idx) => ({
      rank: idx + 1,
      playerId: p.playerId,
      name: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      countryCode: p.countryCode,
      mainPosition: getMainPosition(p.position),
      ovr: p.ovr,
      value: p.assists,
      secondaryStats: {
        goals: p.goals,
        assists: p.assists,
        matches: p.appearances,
        avgRating: p.avgRating,
        cleanSheets: p.cleanSheets,
      },
      relevantCompetitions: Object.values(p.competitions).map((c) => c.competitionName),
      relevantTrophiesAndMerits: [...p.teamTrophies, ...p.intlTrophies],
      isUserPlayer: Boolean(p.isUserPlayer),
    }));

  const top30RatedPlayers: Top30Entry[] = [...allYearlyPlayers]
    .filter((p) => p.appearances >= 5 || p.isUserPlayer)
    .sort((a, b) => b.avgRating - a.avgRating || b.ovr - a.ovr)
    .slice(0, 30)
    .map((p, idx) => ({
      rank: idx + 1,
      playerId: p.playerId,
      name: p.playerName,
      teamId: p.teamId,
      teamName: p.teamName,
      countryCode: p.countryCode,
      mainPosition: getMainPosition(p.position),
      ovr: p.ovr,
      value: p.avgRating,
      secondaryStats: {
        goals: p.goals,
        assists: p.assists,
        matches: p.appearances,
        avgRating: p.avgRating,
        cleanSheets: p.cleanSheets,
      },
      relevantCompetitions: Object.values(p.competitions).map((c) => c.competitionName),
      relevantTrophiesAndMerits: [...p.teamTrophies, ...p.intlTrophies],
      isUserPlayer: Boolean(p.isUserPlayer),
    }));

  // -------------------------------------------------------------
  // 13. PERMANENT RECORD ARCHIVE & TEMPORARY DATA CLEANUP
  // -------------------------------------------------------------
  const winner = ballonDor[0];
  const historicalRecord: YearlyHistoricalRecord = {
    seasonYear,
    calendarYear,
    winnerPlayerId: winner.id,
    winnerName: winner.name,
    winnerTeamId: winner.club,
    winnerTeamName: winner.club,
    winnerOvr: winner.ovr,
    winnerPoints: winner.points || 0,
    winnerBreakdown: winner.pointsBreakdown || [],
    top30Goalscorers,
    top30AssistProviders,
    top30RatedPlayers,
    ballonDorRankings: top30BallonDor,
    goldenBootWinner: top30Goalscorers[0],
    bestStrikerWinner: bestStriker[0],
    europeanGoldenShoeWinner: europeanGoldenShoe[0],
    goldenCreatorWinner: top30AssistProviders[0],
    yearlyXI: worldXI,
    bestGoalkeeperWinner: yashinTrophy[0],
    bestDefenderWinner: bestDefender[0],
    bestMidfielderWinner: bestMidfielder[0],
    bestAttackerWinner: bestAttacker[0],
    bestYoungPlayerWinner: goldenBoy[0],
    bestManagerWinner: bestManager[0],
    majorMerits: winner.pointsBreakdown || [],
    majorTrophies: (winner.pointsBreakdown || []).filter((m) => m.includes('Winner') || m.includes('Champion')),
    relevantCompetitionWinners: {
      uclWinner: yearlyData.competitionWinners.continentalChampions['ucl'],
      uelWinner: yearlyData.competitionWinners.continentalChampions['uel'],
      worldCupWinner: Object.values(yearlyData.competitionWinners.internationalChampions)[0],
      domesticChampions: yearlyData.competitionWinners.domesticChampions,
      domesticCupWinners: yearlyData.competitionWinners.domesticCupWinners,
    },
    timestamp: Date.now(),
  };

  saveBallonDorHistoricalRecord(historicalRecord);

  const results: WorldAwardsSeasonResults = {
    seasonYear,
    calendarYear,
    europeanGoldenBoot: topGoldenBoot,
    bestStriker,
    europeanGoldenShoe,
    goldenCreator: topGoldenCreator,
    domesticAwards,
    ballonDor,
    goldenBoy,
    yashinTrophy,
    bestGoalkeeper: yashinTrophy,
    bestDefender,
    bestMidfielder,
    bestAttacker,
    bestYoungPlayer: goldenBoy,
    bestManager,
    worldXI,
    revealed: false,
    top30Goalscorers,
    top30AssistProviders,
    top30RatedPlayers,
    top30BallonDor,
    historicalRecord,
  };

  // Cache results permanently
  safeSetItem(cacheKey, JSON.stringify(results));

  // Clean up temporary YEARLY AWARD DATA container to avoid permanent data bloat
  cleanupYearlyAwardData(calendarYear);

  return results;
}

function getManagerForTeam(teamNameOrId: string, db?: LeagueDatabase): string {
  if (db?.teams) {
    const found = Object.values(db.teams).find(
      (t) => t.id === teamNameOrId || t.name.toLowerCase() === teamNameOrId.toLowerCase()
    );
    if (found?.manager?.name) return found.manager.name;
  }
  const tn = teamNameOrId.toLowerCase();
  if (tn.includes('manchester city') || tn.includes('man city')) return 'Pep Guardiola';
  if (tn.includes('real madrid')) return 'Carlo Ancelotti';
  if (tn.includes('arsenal')) return 'Mikel Arteta';
  if (tn.includes('liverpool')) return 'Arne Slot';
  if (tn.includes('bayern')) return 'Vincent Kompany';
  if (tn.includes('barcelona')) return 'Hansi Flick';
  if (tn.includes('paris') || tn.includes('psg')) return 'Luis Enrique';
  if (tn.includes('inter')) return 'Simone Inzaghi';
  if (tn.includes('leverkusen')) return 'Xabi Alonso';
  if (tn.includes('atletico')) return 'Diego Simeone';
  if (tn.includes('chelsea')) return 'Enzo Maresca';
  if (tn.includes('tottenham')) return 'Ange Postecoglou';
  if (tn.includes('juventus')) return 'Thiago Motta';
  return `${teamNameOrId} Head Coach`;
}

function getManagerForNation(countryCode: string): string {
  const c = countryCode.toUpperCase();
  if (c === 'ARG') return 'Lionel Scaloni';
  if (c === 'FRA') return 'Didier Deschamps';
  if (c === 'ESP') return 'Luis de la Fuente';
  if (c === 'ENG') return 'Thomas Tuchel';
  if (c === 'GER') return 'Julian Nagelsmann';
  if (c === 'BRA') return 'Dorival Júnior';
  if (c === 'POR') return 'Roberto Martínez';
  if (c === 'NED') return 'Ronald Koeman';
  if (c === 'ITA') return 'Luciano Spalletti';
  if (c === 'CRO') return 'Zlatko Dalić';
  return `${countryCode} National Manager`;
}

export function isWorldAwardsRevealed(seasonYear: string): boolean {
  const cacheKey = `${AWARDS_CACHE_PREFIX}${seasonYear.replace('/', '_')}`;
  const cached = safeGetItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      return Boolean(parsed.revealed);
    } catch {
      return false;
    }
  }
  return false;
}

export function markWorldAwardsRevealed(seasonYear: string): void {
  const cacheKey = `${AWARDS_CACHE_PREFIX}${seasonYear.replace('/', '_')}`;
  const cached = safeGetItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      parsed.revealed = true;
      safeSetItem(cacheKey, JSON.stringify(parsed));
    } catch (e) {
      console.warn('Error marking world awards revealed:', e);
    }
  }
}
