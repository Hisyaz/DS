import { PlayerConfig, PlayerCardData } from '../types';
import { LeagueDatabase } from '../types/leagueEditor';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { resolveAuthoritativeClubContext } from './clubContextRebuilder';

export type GlobalCalendarBlockType = 'summer' | 'winter' | 'july_international' | 'preseason' | 'awards';

export interface SeasonFlowConfig {
  region: 'europe' | 'south_america' | 'other';
  regionLabel: string;
  seasonCalendarYearLabel: string; // e.g. "2026/27" for Europe, "2026" for South America
  firstBlock: {
    type: 'summer' | 'winter';
    title: string;
    subtitle: string;
    monthsLabel: string;
    simulateButtonText: string;
    startMonth: number; // 0-indexed (7 = August, 1 = February)
    endMonth: number;
    matchdaysLabel: string;
  };
  secondBlock: {
    type: 'winter' | 'summer';
    title: string;
    subtitle: string;
    monthsLabel: string;
    simulateButtonText: string;
    startMonth: number;
    endMonth: number;
    matchdaysLabel: string;
  };
  hasPreseasonDraw: boolean; // European draws occur before Summer Block
  hasMidseasonDraw: boolean; // South American draws occur at July mid-season stop
  drawRegion: 'europe' | 'south_america' | 'none';
}

const SOUTH_AMERICAN_COUNTRIES = new Set([
  'BRA', 'ARG', 'COL', 'CHI', 'URU', 'PAR', 'ECU', 'PER', 'VEN', 'BOL',
  'BRAZIL', 'ARGENTINA', 'COLOMBIA', 'CHILE', 'URUGUAY', 'PARAGUAY', 'ECUADOR', 'PERU', 'VENEZUELA', 'BOLIVIA'
]);

const EUROPEAN_COUNTRIES = new Set([
  'ENG', 'ESP', 'GER', 'DEU', 'ITA', 'FRA', 'FR', 'POR', 'NED', 'BEL', 'SCO', 'TUR', 'GRE', 'AUT', 'SUI', 'DEN', 'POL',
  'CRO', 'CZE', 'UKR', 'SWE', 'NOR', 'RUS', 'SRB', 'ROU', 'BUL', 'HUN', 'SVK', 'IRL', 'WAL', 'NIR',
  'ENGLAND', 'SPAIN', 'GERMANY', 'ITALY', 'FRANCE', 'PORTUGAL', 'NETHERLANDS', 'BELGIUM', 'SCOTLAND', 'TURKEY', 'GREECE'
]);

/**
 * Checks if a player/club belongs to a South American domestic league context.
 */
export function isSouthAmericanContext(
  player: PlayerConfig | PlayerCardData,
  leagueDb?: LeagueDatabase
): boolean {
  const db = leagueDb || getCareerLeagueDatabase();
  const clubName = player.club || '';
  const auth = clubName ? resolveAuthoritativeClubContext(clubName, db) : null;

  if (auth) {
    const cCode = (auth.countryCode || '').toUpperCase();
    const cName = ((auth as any).countryName || (auth as any).country || '').toUpperCase();
    if (SOUTH_AMERICAN_COUNTRIES.has(cCode) || SOUTH_AMERICAN_COUNTRIES.has(cName)) {
      return true;
    }
  }

  const pClubCountry = ((player as any).clubCountry || '').toUpperCase();
  if (SOUTH_AMERICAN_COUNTRIES.has(pClubCountry)) return true;

  const pLeague = ((player as any).league || '').toLowerCase();
  if (
    pLeague.includes('brasileir') ||
    pLeague.includes('brasil') ||
    pLeague.includes('argentin') ||
    pLeague.includes('colombia') ||
    pLeague.includes('chile') ||
    pLeague.includes('uruguay') ||
    pLeague.includes('libertadores') ||
    pLeague.includes('sudamericana')
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if a player/club belongs to a European league context.
 */
export function isEuropeanContext(
  player: PlayerConfig | PlayerCardData,
  leagueDb?: LeagueDatabase
): boolean {
  if (isSouthAmericanContext(player, leagueDb)) return false;

  const db = leagueDb || getCareerLeagueDatabase();
  const clubName = player.club || '';
  const auth = clubName ? resolveAuthoritativeClubContext(clubName, db) : null;

  if (auth) {
    const cCode = (auth.countryCode || '').toUpperCase();
    const cName = ((auth as any).countryName || (auth as any).country || '').toUpperCase();
    if (EUROPEAN_COUNTRIES.has(cCode) || EUROPEAN_COUNTRIES.has(cName)) {
      return true;
    }
  }

  const pClubCountry = ((player as any).clubCountry || '').toUpperCase();
  if (EUROPEAN_COUNTRIES.has(pClubCountry)) return true;

  // By default, professional clubs and international youth academies default to European Aug-Jun calendar
  return true;
}

/**
 * Returns the exact season flow structure based on whether club is in Europe or South America.
 * Consistent naming rule:
 * - SUMMER BLOCK: August → January (Europe) / August → December (South America)
 * - WINTER BLOCK: February → June (Both)
 * - July: Normally skipped unless International Competition Window
 */
export function getSeasonFlowConfiguration(
  player: PlayerConfig | PlayerCardData,
  seasonYearString: string = '2026/27',
  leagueDb?: LeagueDatabase
): SeasonFlowConfig {
  const isSouthAmerica = isSouthAmericanContext(player, leagueDb);
  const startYearNum = parseInt(seasonYearString.split('/')[0], 10) || 2026;

  if (isSouthAmerica) {
    return {
      region: 'south_america',
      regionLabel: 'South America (Jan → Dec Calendar)',
      seasonCalendarYearLabel: `${startYearNum}`,
      firstBlock: {
        type: 'winter',
        title: 'WINTER BLOCK',
        subtitle: 'Winter Block: February → June (First Half of Season)',
        monthsLabel: 'February → June',
        simulateButtonText: 'Simulate Winter Block',
        startMonth: 1, // February
        endMonth: 5,   // June
        matchdaysLabel: 'Fixtures 1–19 • Opening Phase',
      },
      secondBlock: {
        type: 'summer',
        title: 'SUMMER BLOCK',
        subtitle: 'Summer Block: August → December (Second Half of Season)',
        monthsLabel: 'August → December',
        simulateButtonText: 'Simulate Summer Block',
        startMonth: 7, // August
        endMonth: 11,  // December
        matchdaysLabel: 'Fixtures 20–38 • Closing Phase & Continental',
      },
      hasPreseasonDraw: false,
      hasMidseasonDraw: true, // Copa Libertadores / Copa Sudamericana draws at mid-season stop in July
      drawRegion: 'south_america',
    };
  }

  // European Season Flow (Default for Europe)
  return {
    region: 'europe',
    regionLabel: 'Europe (August → June Season)',
    seasonCalendarYearLabel: `${startYearNum}/${(startYearNum + 1).toString().slice(-2)}`,
    firstBlock: {
      type: 'summer',
      title: 'SUMMER BLOCK',
      subtitle: 'Summer Block: August → January (First Half of Season)',
      monthsLabel: 'August → January',
      simulateButtonText: 'Simulate Summer Block',
      startMonth: 7, // August
      endMonth: 0,   // January
      matchdaysLabel: 'Fixtures 1–19 • League & European Group Stage',
    },
    secondBlock: {
      type: 'winter',
      title: 'WINTER BLOCK',
      subtitle: 'Winter Block: February → June (Second Half of Season)',
      monthsLabel: 'February → June',
      simulateButtonText: 'Simulate Winter Block',
      startMonth: 1, // February
      endMonth: 5,   // June
      matchdaysLabel: 'Fixtures 20–38 • League & European Knockouts',
    },
    hasPreseasonDraw: true, // UCL, UEL, Conference League draws before Summer Block
    hasMidseasonDraw: false,
    drawRegion: 'europe',
  };
}

/**
 * Derives a real calendar Date for any matchday along the Single Master Timeline.
 */
export function getMasterTimelineDateForMatch(
  blockType: 'summer' | 'winter',
  matchIndexInBlock: number,
  totalMatchesInBlock: number,
  startYear: number,
  isSouthAmerica: boolean
): Date {
  const safeTotal = Math.max(1, totalMatchesInBlock);
  const ratio = Math.min(1, Math.max(0, matchIndexInBlock / safeTotal));

  if (blockType === 'summer') {
    if (isSouthAmerica) {
      // South America Summer Block: August 10 -> December 15 of startYear
      const startMs = new Date(startYear, 7, 10).getTime();
      const endMs = new Date(startYear, 11, 15).getTime();
      return new Date(startMs + ratio * (endMs - startMs));
    } else {
      // Europe Summer Block: August 15 of startYear -> January 25 of (startYear + 1)
      const startMs = new Date(startYear, 7, 15).getTime();
      const endMs = new Date(startYear + 1, 0, 25).getTime();
      return new Date(startMs + ratio * (endMs - startMs));
    }
  } else {
    // Winter Block: February 5 -> June 20
    const winterYear = isSouthAmerica ? startYear : startYear + 1;
    const startMs = new Date(winterYear, 1, 5).getTime();
    const endMs = new Date(winterYear, 5, 20).getTime();
    return new Date(startMs + ratio * (endMs - startMs));
  }
}

/**
 * Formats a Date into a clean single timeline string, e.g. "Saturday, 18 October 2026".
 */
export function formatMasterTimelineDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  return date.toLocaleDateString('en-GB', options);
}
