import { PlayerConfig } from '../types';
import { YouthSeasonStats, YouthLeagueStanding, QualificationBadge } from '../types/youthLeague';
import { LeagueData, EditorTeamData, LeagueDatabase } from '../types/leagueEditor';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { getCareerLeagueDatabase, saveCareerLeagueDatabase } from './careerSaveSystem';
import {
  cleanLeagueName,
  getCanonicalLeagueIds,
  getSanitizedTeamsForLeague,
} from './leagueSanitizer';
import { simulateDatabaseMatch } from './databaseMatchSimulationEngine';
import { getWorldSimulationState } from './worldSimulationEngine';

export interface LeagueFormatRule {
  countryCode: string;
  tier: 1 | 2;
  numTeams: number;
  // Tier 1 Continental spots
  uclSpots?: number; // Champions League (UEFA)
  uelSpots?: number; // Europa League (UEFA)
  ueclSpots?: number; // Conference League (UEFA)
  libertadoresSpots?: number; // Copa Libertadores (CONMEBOL)
  sudamericanaSpots?: number; // Copa Sudamericana (CONMEBOL)
  afcEliteSpots?: number; // AFC Champions League Elite (AFC)
  afcTwoSpots?: number; // AFC Champions League Two (AFC)
  // Relegation
  directRelegationCount: number;
  playoffRelegationCount: number;
  // Tier 2 Rules
  autoPromotionCount?: number;
  playoffPromotionSpots?: number[]; // Ranks that enter promotion playoff
  playoffPromotedCount?: number; // Number of teams that win the playoff
  tier2RelegationCount?: number;
}

export const PROFESSIONAL_LEAGUE_RULES: Record<string, LeagueFormatRule> = {
  // ENGLAND
  england_d1: {
    countryCode: 'ENG',
    tier: 1,
    numTeams: 20,
    uclSpots: 4,
    uelSpots: 2,
    ueclSpots: 1,
    directRelegationCount: 3,
    playoffRelegationCount: 0,
  },
  england_d2: {
    countryCode: 'ENG',
    tier: 2,
    numTeams: 24,
    autoPromotionCount: 2,
    playoffPromotionSpots: [3, 4, 5, 6],
    playoffPromotedCount: 1,
    tier2RelegationCount: 3,
    directRelegationCount: 3,
    playoffRelegationCount: 0,
  },

  // SPAIN
  spain_d1: {
    countryCode: 'ESP',
    tier: 1,
    numTeams: 20,
    uclSpots: 4,
    uelSpots: 2,
    ueclSpots: 1,
    directRelegationCount: 3,
    playoffRelegationCount: 0,
  },
  spain_d2: {
    countryCode: 'ESP',
    tier: 2,
    numTeams: 22,
    autoPromotionCount: 2,
    playoffPromotionSpots: [3, 4, 5, 6],
    playoffPromotedCount: 1,
    tier2RelegationCount: 4,
    directRelegationCount: 4,
    playoffRelegationCount: 0,
  },

  // ITALY
  italy_d1: {
    countryCode: 'ITA',
    tier: 1,
    numTeams: 20,
    uclSpots: 4,
    uelSpots: 2,
    ueclSpots: 1,
    directRelegationCount: 3,
    playoffRelegationCount: 0,
  },
  italy_d2: {
    countryCode: 'ITA',
    tier: 2,
    numTeams: 20,
    autoPromotionCount: 2,
    playoffPromotionSpots: [3, 4, 5, 6, 7, 8],
    playoffPromotedCount: 1,
    tier2RelegationCount: 3,
    directRelegationCount: 3,
    playoffRelegationCount: 1,
  },

  // GERMANY
  germany_d1: {
    countryCode: 'GER',
    tier: 1,
    numTeams: 18,
    uclSpots: 4,
    uelSpots: 2,
    ueclSpots: 1,
    directRelegationCount: 2,
    playoffRelegationCount: 1,
  },
  germany_d2: {
    countryCode: 'GER',
    tier: 2,
    numTeams: 18,
    autoPromotionCount: 2,
    playoffPromotionSpots: [3],
    playoffPromotedCount: 1,
    tier2RelegationCount: 2,
    directRelegationCount: 2,
    playoffRelegationCount: 1,
  },

  // FRANCE
  france_d1: {
    countryCode: 'FR',
    tier: 1,
    numTeams: 18,
    uclSpots: 4,
    uelSpots: 2,
    ueclSpots: 1,
    directRelegationCount: 2,
    playoffRelegationCount: 1,
  },
  france_d2: {
    countryCode: 'FR',
    tier: 2,
    numTeams: 18,
    autoPromotionCount: 2,
    playoffPromotionSpots: [3, 4, 5],
    playoffPromotedCount: 1,
    tier2RelegationCount: 3,
    directRelegationCount: 3,
    playoffRelegationCount: 1,
  },

  // PORTUGAL
  portugal_d1: {
    countryCode: 'POR',
    tier: 1,
    numTeams: 18,
    uclSpots: 3,
    uelSpots: 2,
    ueclSpots: 1,
    directRelegationCount: 2,
    playoffRelegationCount: 1,
  },
  portugal_d2: {
    countryCode: 'POR',
    tier: 2,
    numTeams: 18,
    autoPromotionCount: 2,
    playoffPromotionSpots: [3],
    playoffPromotedCount: 1,
    tier2RelegationCount: 2,
    directRelegationCount: 2,
    playoffRelegationCount: 1,
  },

  // ARGENTINA
  argentina_d1: {
    countryCode: 'ARG',
    tier: 1,
    numTeams: 28,
    libertadoresSpots: 4,
    sudamericanaSpots: 6,
    directRelegationCount: 2,
    playoffRelegationCount: 0,
  },
  argentina_d2: {
    countryCode: 'ARG',
    tier: 2,
    numTeams: 22,
    autoPromotionCount: 1,
    playoffPromotionSpots: [2, 3, 4, 5, 6, 7, 8],
    playoffPromotedCount: 1,
    tier2RelegationCount: 3,
    directRelegationCount: 3,
    playoffRelegationCount: 1,
  },

  // BRAZIL
  brazil_d1: {
    countryCode: 'BRA',
    tier: 1,
    numTeams: 20,
    libertadoresSpots: 6,
    sudamericanaSpots: 6,
    directRelegationCount: 4,
    playoffRelegationCount: 0,
  },
  brazil_d2: {
    countryCode: 'BRA',
    tier: 2,
    numTeams: 20,
    autoPromotionCount: 4,
    playoffPromotionSpots: [],
    playoffPromotedCount: 0,
    tier2RelegationCount: 4,
    directRelegationCount: 4,
    playoffRelegationCount: 0,
  },

  // SAUDI ARABIA
  saudi_d1: {
    countryCode: 'KSA',
    tier: 1,
    numTeams: 18,
    afcEliteSpots: 3,
    afcTwoSpots: 1,
    directRelegationCount: 3,
    playoffRelegationCount: 0,
  },
  saudi_d2: {
    countryCode: 'KSA',
    tier: 2,
    numTeams: 18,
    autoPromotionCount: 3,
    playoffPromotionSpots: [],
    playoffPromotedCount: 0,
    tier2RelegationCount: 3,
    directRelegationCount: 3,
    playoffRelegationCount: 0,
  },
};

/**
 * Resolves authentic League IDs for any country code, country name, or league name.
 */
export function getLeagueIdsForCountry(
  countryCode?: string,
  countryName?: string,
  fallbackLeagueName?: string
): { d1Id: string; d2Id: string; youthId: string } {
  const code = (countryCode || '').toUpperCase().trim();
  const name = (countryName || '').toLowerCase().trim();
  const fb = (fallbackLeagueName || '').toLowerCase().trim();

  if (code === 'GB' || code === 'ENG' || code === 'UK' || name.includes('england') || fb.includes('premier') || fb.includes('championship')) {
    return { d1Id: 'england_d1', d2Id: 'england_d2', youthId: 'england_youth' };
  }
  if (code === 'ESP' || name.includes('spain') || fb.includes('laliga') || fb.includes('la liga') || fb.includes('hypermotion')) {
    return { d1Id: 'spain_d1', d2Id: 'spain_d2', youthId: 'spain_youth' };
  }
  if (code === 'ITA' || name.includes('italy') || name.includes('italia') || fb.includes('serie a') || fb.includes('serie b')) {
    return { d1Id: 'italy_d1', d2Id: 'italy_d2', youthId: 'italy_youth' };
  }
  if (code === 'GER' || code === 'DEU' || name.includes('germany') || name.includes('deutschland') || fb.includes('bundesliga')) {
    return { d1Id: 'germany_d1', d2Id: 'germany_d2', youthId: 'germany_youth' };
  }
  if (code === 'FR' || code === 'FRA' || name.includes('france') || fb.includes('ligue 1') || fb.includes('ligue 2')) {
    return { d1Id: 'france_d1', d2Id: 'france_d2', youthId: 'france_youth' };
  }
  if (code === 'POR' || code === 'PRT' || name.includes('portugal') || fb.includes('primeira') || fb.includes('segunda') || fb.includes('portugal')) {
    return { d1Id: 'portugal_d1', d2Id: 'portugal_d2', youthId: 'portugal_youth' };
  }
  if (code === 'ARG' || name.includes('argentina') || fb.includes('profesional') || fb.includes('nacional')) {
    return { d1Id: 'argentina_d1', d2Id: 'argentina_d2', youthId: 'argentina_youth' };
  }
  if (code === 'BRA' || name.includes('brazil') || name.includes('brasil') || fb.includes('brasileir') || fb.includes('série')) {
    return { d1Id: 'brazil_d1', d2Id: 'brazil_d2', youthId: 'brazil_youth' };
  }
  if (code === 'KSA' || code === 'SAU' || name.includes('saudi') || fb.includes('saudi') || fb.includes('roshn')) {
    return { d1Id: 'saudi_d1', d2Id: 'saudi_d1', youthId: 'saudi_youth' };
  }

  // Fallback to canonical helper
  return getCanonicalLeagueIds(code);
}

/**
 * Finds the corresponding professional league from player config and database.
 */
export function resolvePlayerProfessionalLeague(
  player: PlayerConfig,
  db?: LeagueDatabase
): { league: LeagueData; tier: 1 | 2; rule: LeagueFormatRule } {
  const currentDb = db || getLeagueDatabase();
  const countryCode = (player.countryCode || player.clubCountry || '').toUpperCase();
  const rawPlayerLeagueName = player.league || (player as any).leagueName || '';
  const cleanPlayerLeague = cleanLeagueName(rawPlayerLeagueName);
  const playerLeagueLower = cleanPlayerLeague.toLowerCase();
  const playerClubName = (player.club || '').toLowerCase();

  // 1. Try matching by player club in db teams
  let matchedTeam: EditorTeamData | undefined;
  if (currentDb.teams) {
    matchedTeam = Object.values(currentDb.teams).find(
      (t) => t.name.toLowerCase() === playerClubName || (player.clubId && t.id.toLowerCase() === player.clubId.toLowerCase())
    );
  }

  let leagueId = matchedTeam?.leagueId;

  // 2. Try matching by league name in db leagues
  if (!leagueId && currentDb.leagues) {
    const leaguesList = Object.values(currentDb.leagues).filter((l) => l.divisionTier !== 'youth');
    const byName = leaguesList.find((l) => cleanLeagueName(l.name).toLowerCase() === playerLeagueLower);
    if (byName) {
      leagueId = byName.id;
    }
  }

  // 3. Fallback to Country Code mapping
  if (!leagueId) {
    const isTier2 =
      playerLeagueLower.includes('2') ||
      playerLeagueLower.includes('championship') ||
      playerLeagueLower.includes('hypermotion') ||
      playerLeagueLower.includes('nacional') ||
      playerLeagueLower.includes('série b') ||
      playerLeagueLower.includes('serie b') ||
      player.leagueTier === 2 ||
      player.leagueTier === '2';

    const leagueIds = getLeagueIdsForCountry(countryCode, player.clubCountry, cleanPlayerLeague);
    leagueId = isTier2 ? leagueIds.d2Id : leagueIds.d1Id;
  }

  const league = currentDb.leagues?.[leagueId || 'england_d1'] || currentDb.leagues?.england_d1;
  const tier: 1 | 2 = league?.divisionTier === '2nd' ? 2 : 1;
  const rule = PROFESSIONAL_LEAGUE_RULES[league?.id || 'england_d1'] || PROFESSIONAL_LEAGUE_RULES.england_d1;

  // Clean displayed league name
  const safeLeague: LeagueData = {
    ...league,
    name: cleanLeagueName(league?.name || 'Professional League'),
  };

  return { league: safeLeague, tier, rule };
}

/**
 * Generates the authentic qualification badge based on federation, tier, and final rank.
 */
export function getProfessionalQualificationBadge(
  rank: number,
  totalTeams: number,
  rule: LeagueFormatRule,
  countryCode: string
): QualificationBadge {
  const isTier1 = rule.tier === 1;
  const code = (countryCode || rule.countryCode || 'ENG').toUpperCase();

  const UEFA_COUNTRIES = ['ENG', 'ESP', 'FR', 'FRA', 'ITA', 'GER', 'DEU', 'POR', 'PRT', 'NED', 'BEL', 'SCO', 'TUR', 'AUT', 'SUI', 'GRE', 'DEN', 'SWE', 'NOR', 'POL', 'CZE', 'CRO', 'SRB', 'UKR', 'ROU'];
  const CONMEBOL_COUNTRIES = ['ARG', 'BRA', 'URU', 'COL', 'CHI', 'PAR', 'ECU', 'PER', 'BOL', 'VEN'];
  const AFC_COUNTRIES = ['KSA', 'SAU', 'JPN', 'KOR', 'QAT', 'UAE', 'IRN', 'AUS', 'CHN', 'UZB', 'IRQ', 'JOR'];

  if (isTier1) {
    if (UEFA_COUNTRIES.includes(code)) {
      const uclLimit = rule.uclSpots || 4;
      const uelLimit = uclLimit + (rule.uelSpots || 2);
      const ueclLimit = uelLimit + (rule.ueclSpots || 1);

      if (rank <= uclLimit) {
        return {
          type: 'ucl',
          label: 'UEFA Champions League',
          shortLabel: 'UCL Group Stage',
          badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          iconName: 'star',
        };
      }
      if (rank <= uelLimit) {
        return {
          type: 'uel',
          label: 'UEFA Europa League',
          shortLabel: 'Europa League',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          iconName: 'trophy',
        };
      }
      if (rank <= ueclLimit) {
        return {
          type: 'uecl',
          label: 'UEFA Conference League',
          shortLabel: 'Conference League',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          iconName: 'shield',
        };
      }
    } else if (CONMEBOL_COUNTRIES.includes(code)) {
      const libLimit = rule.libertadoresSpots || 4;
      const sudLimit = libLimit + (rule.sudamericanaSpots || 6);

      if (rank <= libLimit) {
        return {
          type: 'libertadores',
          label: 'Copa Libertadores',
          shortLabel: 'Copa Libertadores',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          iconName: 'trophy',
        };
      }
      if (rank <= sudLimit) {
        return {
          type: 'sudamericana',
          label: 'Copa Sudamericana',
          shortLabel: 'Copa Sudamericana',
          badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          iconName: 'globe',
        };
      }
    } else if (AFC_COUNTRIES.includes(code)) {
      const afcEliteLimit = rule.afcEliteSpots || 3;
      const afcTwoLimit = afcEliteLimit + (rule.afcTwoSpots || 1);

      if (rank <= afcEliteLimit) {
        return {
          type: 'afc_elite',
          label: 'AFC Champions League Elite',
          shortLabel: 'AFC Elite',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          iconName: 'trophy',
        };
      }
      if (rank <= afcTwoLimit) {
        return {
          type: 'afc_two',
          label: 'AFC Champions League Two',
          shortLabel: 'AFC CL 2',
          badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          iconName: 'globe',
        };
      }
    }

    // Relegation in Tier 1
    const directRelegationThreshold = totalTeams - rule.directRelegationCount + 1;
    const playoffRelegationThreshold = directRelegationThreshold - (rule.playoffRelegationCount || 0);

    if (rank >= directRelegationThreshold) {
      return {
        type: 'relegation_direct',
        label: 'Relegation to 2nd Division',
        shortLabel: 'Relegated (D2)',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        iconName: 'arrow-down',
      };
    }
    if (rule.playoffRelegationCount > 0 && rank >= playoffRelegationThreshold) {
      return {
        type: 'relegation_playoff',
        label: 'Relegation Playoff',
        shortLabel: 'Relegation Playoff',
        badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        iconName: 'playoff',
      };
    }

    return {
      type: 'none',
      label: 'First Division Safe',
      shortLabel: 'Mid-Table',
      badgeClass: 'bg-slate-800/60 text-slate-400 border-slate-700/50',
      iconName: 'shield',
    };
  }

  // TIER 2 PROMOTION & RELEGATION RULES
  const autoPromoteLimit = rule.autoPromotionCount || 2;
  if (rank <= autoPromoteLimit) {
    return {
      type: 'promotion_auto',
      label: 'Direct Promotion to 1st Division',
      shortLabel: 'Direct Promotion 🚀',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      iconName: 'arrow-up',
    };
  }

  if (rule.playoffPromotionSpots && rule.playoffPromotionSpots.includes(rank)) {
    const playoffName = code === 'ARG' ? 'Torneo Reducido Playoff' : 'Promotion Playoff';
    return {
      type: 'promotion_playoff',
      label: playoffName,
      shortLabel: playoffName,
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      iconName: 'playoff',
    };
  }

  const d2RelegationThreshold = totalTeams - (rule.tier2RelegationCount || 3) + 1;
  const d2PlayoffRelegationThreshold = d2RelegationThreshold - (rule.playoffRelegationCount || 0);

  if (rank >= d2RelegationThreshold) {
    return {
      type: 'relegation_direct',
      label: 'Relegation',
      shortLabel: 'Relegated 🔻',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      iconName: 'arrow-down',
    };
  }
  if (rule.playoffRelegationCount > 0 && rank >= d2PlayoffRelegationThreshold) {
    return {
      type: 'relegation_playoff',
      label: 'Relegation Playoff',
      shortLabel: 'Relegation Playoff',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      iconName: 'playoff',
    };
  }

  return {
    type: 'none',
    label: 'Second Division Safe',
    shortLabel: 'Mid-Table',
    badgeClass: 'bg-slate-800/60 text-slate-400 border-slate-700/50',
    iconName: 'shield',
  };
}

/**
 * Helper to simulate a division table in a double round-robin format using the database match simulation engine.
 */
function simulateDivisionTable(
  teams: { id: string; name: string; ovr: number }[],
  playerClubName: string,
  playerClubId: string | undefined,
  playerStats: YouthSeasonStats,
  playerOvr: number,
  isPlayerInThisDivision: boolean
): {
  sortedStandings: { teamId: string; teamName: string; W: number; D: number; L: number; GF: number; GA: number; pts: number; isPlayer: boolean; teamOvr: number }[];
} {
  const statsMap = new Map<
    string,
    { teamId: string; teamName: string; W: number; D: number; L: number; GF: number; GA: number; pts: number; isPlayer: boolean; teamOvr: number }
  >();

  teams.forEach((t) => {
    const isMyTeam = isPlayerInThisDivision && (
      (playerClubId && t.id === playerClubId) ||
      (playerClubName && playerClubName !== 'Free Agent' && t.name.toLowerCase() === playerClubName.toLowerCase())
    );

    statsMap.set(t.id, {
      teamId: t.id,
      teamName: t.name,
      W: 0,
      D: 0,
      L: 0,
      GF: 0,
      GA: 0,
      pts: 0,
      isPlayer: isMyTeam,
      teamOvr: t.ovr || 70,
    });
  });

  // Double round-robin simulation
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const teamA = teams[i];
      const teamB = teams[j];

      for (let leg = 0; leg < 2; leg++) {
        const homeTeam = leg === 0 ? teamA : teamB;
        const awayTeam = leg === 0 ? teamB : teamA;

        const homeEditorTeam: EditorTeamData = {
          id: homeTeam.id,
          name: homeTeam.name,
          countryCode: 'ENG',
          leagueId: 'league',
          overallRating: homeTeam.ovr || 72,
          isUserClub: isPlayerInThisDivision && ((playerClubId && homeTeam.id === playerClubId) || (playerClubName && homeTeam.name.toLowerCase() === playerClubName.toLowerCase())),
        };

        const awayEditorTeam: EditorTeamData = {
          id: awayTeam.id,
          name: awayTeam.name,
          countryCode: 'ENG',
          leagueId: 'league',
          overallRating: awayTeam.ovr || 72,
          isUserClub: isPlayerInThisDivision && ((playerClubId && awayTeam.id === playerClubId) || (playerClubName && awayTeam.name.toLowerCase() === playerClubName.toLowerCase())),
        };

        const matchResult = simulateDatabaseMatch(homeEditorTeam, awayEditorTeam);

        const homeStat = statsMap.get(homeTeam.id);
        const awayStat = statsMap.get(awayTeam.id);

        if (homeStat && awayStat) {
          homeStat.GF += matchResult.homeScore;
          homeStat.GA += matchResult.awayScore;
          awayStat.GF += matchResult.awayScore;
          awayStat.GA += matchResult.homeScore;

          if (matchResult.homeScore > matchResult.awayScore) {
            homeStat.W += 1;
            homeStat.pts += 3;
            awayStat.L += 1;
          } else if (matchResult.homeScore < matchResult.awayScore) {
            awayStat.W += 1;
            awayStat.pts += 3;
            homeStat.L += 1;
          } else {
            homeStat.D += 1;
            homeStat.pts += 1;
            awayStat.D += 1;
            awayStat.pts += 1;
          }
        }
      }
    }
  }

  const sortedStandings = Array.from(statsMap.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.GF - a.GA;
    const gdB = b.GF - b.GA;
    if (gdB !== gdA) return gdB - gdA;
    return b.GF - a.GF;
  });

  return { sortedStandings };
}

/**
 * Simulates both 1st and 2nd division professional seasons, resolving promotions, relegations,
 * playoffs, and persisting database roster swaps in isolated career storage.
 */
export function simulateFullProfessionalLeague(
  player: PlayerConfig,
  playerStats: YouthSeasonStats,
  db?: LeagueDatabase
): {
  standings: YouthLeagueStanding[];
  playerTeamStanding: YouthLeagueStanding;
  leagueName: string;
  leagueId: string;
  divisionTier: '1st' | '2nd';
  promotedTeamIds: string[];
  relegatedTeamIds: string[];
  continentalQualifiedTeams: { teamId: string; comp: 'ucl' | 'uel' | 'uecl' | 'libertadores' | 'sudamericana' | 'afc_elite' | 'afc_two' }[];
  isPlayerPromoted: boolean;
  isPlayerRelegated: boolean;
  playerContinentalQualification: 'ucl' | 'uel' | 'uecl' | 'libertadores' | 'sudamericana' | 'afc_elite' | 'afc_two' | string | boolean | null;
  sisterDivisionStandings?: YouthLeagueStanding[];
  sisterDivisionName?: string;
  isPlayerInPlayoff?: boolean;
  playoffPressureNote?: string;
  firstTeamStandings?: YouthLeagueStanding[];
  firstTeamLeagueName?: string;
} {
  const currentDb = db || getCareerLeagueDatabase();
  const { league, tier, rule } = resolvePlayerProfessionalLeague(player, currentDb);
  const isFreeAgent = !player.club || player.club.toLowerCase() === 'free agent' || player.club.toLowerCase() === 'unassigned';
  const playerClubName = isFreeAgent ? 'Free Agent' : (player.club || 'Current Squad');
  const squadDest = player.squadDestination || 'First Team';

  const countryCode = (league.countryCode || player.countryCode || 'ENG').toUpperCase();
  const leagueIds = getLeagueIdsForCountry(countryCode, player.clubCountry, league.id || league.name);
  const d1Id = leagueIds.d1Id;
  const d2Id = leagueIds.d2Id;

  const d1League = currentDb.leagues?.[d1Id] || league;
  const d2League = currentDb.leagues?.[d2Id];

  const d1Rule = PROFESSIONAL_LEAGUE_RULES[d1Id] || rule;
  const d2Rule = PROFESSIONAL_LEAGUE_RULES[d2Id] || rule;

  // Load strictly sanitized D1 teams (zero cross-country leakage)
  let d1Teams = getSanitizedTeamsForLeague(d1Id, currentDb).map((t) => ({ id: t.id, name: t.name, ovr: t.ovr }));
  // Load strictly sanitized D2 teams (zero cross-country leakage)
  let d2Teams = d2League ? getSanitizedTeamsForLeague(d2Id, currentDb).map((t) => ({ id: t.id, name: t.name, ovr: t.ovr })) : [];

  // Make sure player's club is injected into their respective division
  if (!isFreeAgent) {
    if (tier === 1) {
      const inD1 = d1Teams.find((t) => t.name.toLowerCase() === playerClubName.toLowerCase() || t.id === player.clubId);
      if (!inD1) {
        d1Teams.unshift({ id: player.clubId || 'player_club', name: playerClubName, ovr: player.ovr || 75 });
      }
    } else {
      const inD2 = d2Teams.find((t) => t.name.toLowerCase() === playerClubName.toLowerCase() || t.id === player.clubId);
      if (!inD2) {
        d2Teams.unshift({ id: player.clubId || 'player_club', name: playerClubName, ovr: player.ovr || 70 });
      }
    }
  }

  // Safety fallbacks if custom league definition was completely empty
  if (d1Teams.length < 4) {
    d1Teams = [
      { id: 'd1-1', name: 'FC Capital', ovr: 82 },
      { id: 'd1-2', name: 'Athletic City', ovr: 79 },
      { id: 'd1-3', name: 'United FC', ovr: 77 },
      { id: 'd1-4', name: 'Sporting D1', ovr: 74 },
    ];
  }
  if (d2Teams.length < 4 && d2League) {
    d2Teams = [
      { id: 'd2-1', name: 'Real Provincial', ovr: 72 },
      { id: 'd2-2', name: 'Wanderers', ovr: 70 },
      { id: 'd2-3', name: 'Northern Town', ovr: 68 },
      { id: 'd2-4', name: 'Southern FC', ovr: 66 },
    ];
  }

  // 1. Authoritative Unified World Simulation Standings Check
  let d1Sim: { sortedStandings: any[] } | null = null;
  let d2Sim: { sortedStandings: any[] } | null = null;

  try {
    const seasonYear = (player as any).seasonYear || (player as any).season || '2026/27';
    const ws = getWorldSimulationState(seasonYear, currentDb, player as any);
    const worldD1 = ws?.leagues?.[d1Id];
    const worldD2 = d2League ? ws?.leagues?.[d2Id] : undefined;

    if (worldD1 && worldD1.standings && worldD1.standings.length > 0 && worldD1.currentMatchday >= 1) {
      d1Sim = {
        sortedStandings: worldD1.standings.map((s) => ({
          teamId: s.teamId,
          teamName: s.teamName,
          teamOvr: s.teamOvr,
          isPlayer: s.isPlayerTeam,
          W: s.won,
          D: s.drawn,
          L: s.lost,
          GF: s.goalsFor,
          GA: s.goalsAgainst,
          pts: s.points,
        })),
      };
    }

    if (worldD2 && worldD2.standings && worldD2.standings.length > 0 && worldD2.currentMatchday >= 1) {
      d2Sim = {
        sortedStandings: worldD2.standings.map((s) => ({
          teamId: s.teamId,
          teamName: s.teamName,
          teamOvr: s.teamOvr,
          isPlayer: s.isPlayerTeam,
          W: s.won,
          D: s.drawn,
          L: s.lost,
          GF: s.goalsFor,
          GA: s.goalsAgainst,
          pts: s.points,
        })),
      };
    }
  } catch (err) {
    console.warn('World simulation state lookup failed in simulateFullProfessionalLeague:', err);
  }

  // Fallback if world simulation standings were not available
  if (!d1Sim) {
    d1Sim = simulateDivisionTable(
      d1Teams,
      playerClubName,
      player.clubId,
      playerStats,
      player.ovr || 75,
      tier === 1 && !isFreeAgent
    );
  }

  if (!d2Sim) {
    d2Sim = d2Teams.length > 0 ? simulateDivisionTable(
      d2Teams,
      playerClubName,
      player.clubId,
      playerStats,
      player.ovr || 70,
      tier === 2 && !isFreeAgent
    ) : { sortedStandings: [] };
  }

  // 3. Process D1 Relegation & Continental spots
  const d1Total = d1Sim.sortedStandings.length;
  const d1RelegatedIds: string[] = [];
  const continentalQualifiedTeams: { teamId: string; comp: 'ucl' | 'uel' | 'uecl' | 'libertadores' | 'sudamericana' | 'afc_elite' | 'afc_two' }[] = [];

  const formatSquadTeamName = (name: string) => {
    if (squadDest === 'First Team' || !squadDest) return name;
    if (name.includes(' U17') || name.includes(' U20') || name.includes(' Reserves')) return name;
    return `${name} ${squadDest}`;
  };

  const d1StandingsList: YouthLeagueStanding[] = d1Sim.sortedStandings.map((s, idx) => {
    const rank = idx + 1;
    const badge = getProfessionalQualificationBadge(rank, d1Total, d1Rule, countryCode);

    let isRelegated = false;
    let inPlayoff = false;
    let continentalComp: 'ucl' | 'uel' | 'uecl' | 'libertadores' | 'sudamericana' | 'afc_elite' | 'afc_two' | null = null;

    if (['ucl', 'uel', 'uecl', 'libertadores', 'sudamericana', 'afc_elite', 'afc_two'].includes(badge.type)) {
      continentalComp = badge.type as any;
      continentalQualifiedTeams.push({ teamId: s.teamId, comp: continentalComp! });
    } else if (badge.type === 'relegation_direct') {
      isRelegated = true;
      d1RelegatedIds.push(s.teamId);
    } else if (badge.type === 'relegation_playoff') {
      inPlayoff = true;
      if (Math.random() < 0.5) {
        isRelegated = true;
        d1RelegatedIds.push(s.teamId);
      }
    }

    return {
      rank,
      teamId: s.teamId,
      teamName: formatSquadTeamName(s.teamName),
      played: s.W + s.D + s.L,
      won: s.W,
      drawn: s.D,
      lost: s.L,
      goalsFor: s.GF,
      goalsAgainst: s.GA,
      goalDifference: s.GF - s.GA,
      points: s.pts,
      isPlayerTeam: s.isPlayer,
      qualifiedForIntCup: false,
      teamOvr: s.teamOvr,
      qualificationBadge: badge,
      qualificationText: badge.label,
      promoted: false,
      relegated: isRelegated,
      inPlayoff,
      qualifiedContinental: continentalComp,
    };
  });

  // 4. Process D2 Promotion
  const d2Total = d2Sim.sortedStandings.length;
  const d2PromotedIds: string[] = [];
  let d2PlayoffWinnerId: string | null = null;

  if (d2Rule.playoffPromotionSpots && d2Rule.playoffPromotionSpots.length > 0) {
    const playoffTeams = d2Sim.sortedStandings.filter((s, idx) => d2Rule.playoffPromotionSpots!.includes(idx + 1));
    if (playoffTeams.length > 0) {
      const sortedPlayoff = [...playoffTeams].sort((a, b) => (b.teamOvr + Math.random() * 8) - (a.teamOvr + Math.random() * 8));
      d2PlayoffWinnerId = sortedPlayoff[0]?.teamId || null;
    }
  }

  const d2StandingsList: YouthLeagueStanding[] = d2Sim.sortedStandings.map((s, idx) => {
    const rank = idx + 1;
    const badge = getProfessionalQualificationBadge(rank, d2Total, d2Rule, countryCode);

    let isPromoted = false;
    let isRelegated = false;
    let inPlayoff = false;

    if (badge.type === 'promotion_auto') {
      isPromoted = true;
      d2PromotedIds.push(s.teamId);
    } else if (badge.type === 'promotion_playoff') {
      inPlayoff = true;
      if (s.teamId === d2PlayoffWinnerId) {
        isPromoted = true;
        d2PromotedIds.push(s.teamId);
      }
    } else if (badge.type === 'relegation_direct') {
      isRelegated = true;
    }

    return {
      rank,
      teamId: s.teamId,
      teamName: formatSquadTeamName(s.teamName),
      played: s.W + s.D + s.L,
      won: s.W,
      drawn: s.D,
      lost: s.L,
      goalsFor: s.GF,
      goalsAgainst: s.GA,
      goalDifference: s.GF - s.GA,
      points: s.pts,
      isPlayerTeam: s.isPlayer,
      qualifiedForIntCup: false,
      teamOvr: s.teamOvr,
      qualificationBadge: badge,
      qualificationText: badge.label,
      promoted: isPromoted,
      relegated: isRelegated,
      inPlayoff,
      qualifiedContinental: null,
    };
  });

  const activeStandings = tier === 1 ? d1StandingsList : d2StandingsList;
  const sisterStandings = tier === 1 ? d2StandingsList : d1StandingsList;

  const playerStanding = activeStandings.find((s) => s.isPlayerTeam) || activeStandings[0];
  const isPlayerPromoted = Boolean(playerStanding?.promoted);
  const isPlayerRelegated = Boolean(playerStanding?.relegated);
  const isPlayerInPlayoff = Boolean(playerStanding?.inPlayoff);
  const playerContinentalQualification = playerStanding?.qualifiedContinental || null;

  let playoffPressureNote = '';
  if (isPlayerInPlayoff) {
    if (tier === 1) {
      playoffPressureNote = 'High-Stakes Relegation Playoff! Fighting for survival to avoid relegation.';
    } else {
      playoffPressureNote = 'High-Stakes Promotion Playoff! Fighting for glory to reach the 1st Division.';
    }
  }

  const baseLeagueName = cleanLeagueName(league.name);
  let displayLeagueName = baseLeagueName;
  if (squadDest === 'U17') displayLeagueName = `${baseLeagueName} U17 League`;
  else if (squadDest === 'U20') displayLeagueName = `${baseLeagueName} U20 League`;
  else if (squadDest === 'Reserves') displayLeagueName = `${baseLeagueName} Reserve Division`;

  const cleanD1Name = cleanLeagueName(d1League?.name || '1st Division');
  const cleanD2Name = cleanLeagueName(d2League?.name || '2nd Division');

  // Compute clean First Team standings (without squad suffixes) for player viewing
  const firstTeamStandingsList: YouthLeagueStanding[] = d1Sim.sortedStandings.map((s, idx) => {
    const rank = idx + 1;
    const badge = getProfessionalQualificationBadge(rank, d1Total, d1Rule, countryCode);
    return {
      rank,
      teamId: s.teamId,
      teamName: s.teamName, // Clean first team club name
      played: s.W + s.D + s.L,
      won: s.W,
      drawn: s.D,
      lost: s.L,
      goalsFor: s.GF,
      goalsAgainst: s.GA,
      goalDifference: s.GF - s.GA,
      points: s.pts,
      isPlayerTeam: s.isPlayer,
      qualifiedForIntCup: false,
      teamOvr: s.teamOvr,
      qualificationBadge: badge,
      qualificationText: badge.label,
      promoted: false,
      relegated: d1RelegatedIds.includes(s.teamId),
      inPlayoff: false,
      qualifiedContinental: ['ucl', 'uel', 'uecl', 'libertadores', 'sudamericana', 'afc_elite', 'afc_two'].includes(badge.type) ? (badge.type as any) : null,
      qualifiedContinentalCompId: badge.type === 'ucl' ? 'UEFA_CL' : badge.type === 'uel' ? 'UEFA_EL' : badge.type === 'uecl' ? 'UEFA_ECL' : badge.type === 'libertadores' ? 'CONMEBOL_LIB' : badge.type === 'sudamericana' ? 'CONMEBOL_SUD' : badge.type === 'afc_elite' ? 'AFC_CL' : badge.type === 'afc_two' ? 'AFC_CUP' : null,
    };
  });

  return {
    standings: activeStandings,
    playerTeamStanding: playerStanding,
    leagueName: displayLeagueName,
    leagueId: league.id,
    divisionTier: (tier === 1 ? '1st' : '2nd'),
    promotedTeamIds: d2PromotedIds,
    relegatedTeamIds: d1RelegatedIds,
    continentalQualifiedTeams,
    isPlayerPromoted,
    isPlayerRelegated,
    playerContinentalQualification,
    sisterDivisionStandings: sisterStandings,
    sisterDivisionName: tier === 1 ? cleanD2Name : cleanD1Name,
    isPlayerInPlayoff,
    playoffPressureNote,
    firstTeamStandings: firstTeamStandingsList,
    firstTeamLeagueName: cleanD1Name,
  };
}

/**
 * Applies authoritative promotion and relegation roster swaps between 1st and 2nd division
 * in the ISOLATED career database instance for the active save slot.
 * Ensures the global Editor Mode database remains untouched.
 */
export function executePromotionRelegationRosterSwap(
  countryCode: string,
  promotedTeamIds: string[],
  relegatedTeamIds: string[],
  fallbackLeagueName?: string,
  db?: LeagueDatabase,
  onSaveDb?: (updatedDb: LeagueDatabase) => void
): void {
  const currentDb = db || getCareerLeagueDatabase();
  if (!currentDb || !currentDb.leagues) return;

  const leagueIds = getLeagueIdsForCountry(countryCode, undefined, fallbackLeagueName);
  const d1Id = leagueIds.d1Id;
  const d2Id = leagueIds.d2Id;

  if (d1Id === d2Id) return; // Single division leagues like Saudi Pro League don't swap with a sub-division

  const d1League = currentDb.leagues[d1Id];
  const d2League = currentDb.leagues[d2Id];

  if (!d1League || !d2League) return;

  const currentD1Teams = new Set(d1League.teamIds || []);
  const currentD2Teams = new Set(d2League.teamIds || []);

  // Remove relegated from D1, add to D2
  relegatedTeamIds.forEach((tId) => {
    currentD1Teams.delete(tId);
    currentD2Teams.add(tId);
    if (currentDb.teams?.[tId]) {
      currentDb.teams[tId].leagueId = d2Id;
    }
  });

  // Remove promoted from D2, add to D1
  promotedTeamIds.forEach((tId) => {
    currentD2Teams.delete(tId);
    currentD1Teams.add(tId);
    if (currentDb.teams?.[tId]) {
      currentDb.teams[tId].leagueId = d1Id;
    }
  });

  currentDb.leagues[d1Id].teamIds = Array.from(currentD1Teams);
  currentDb.leagues[d2Id].teamIds = Array.from(currentD2Teams);

  if (onSaveDb) {
    onSaveDb(currentDb);
  } else {
    saveCareerLeagueDatabase(currentDb);
  }
}
