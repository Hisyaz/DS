import { PlayerCardData } from '../types';
import { applyMonthlyChemistryGrowth } from './chemistrySystem';

export interface CalendarAdvancementResult {
  updatedPlayer: PlayerCardData;
  monthsCrossed: number;
  halfSeasonsCrossed: number;
  weeksElapsed: number;
  messages: string[];
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
  Parse a date string like "15 January 2029" or return a default Date
 */
export function parseCalendarDate(dateStr?: string): Date {
  if (!dateStr) return new Date(2028, 7, 1); // Default Aug 1 2028 (Preseason)
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    // Try parsing manual format "15 January 2028"
    const parts = dateStr.trim().split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase().startsWith(parts[1].toLowerCase()));
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && monthIdx !== -1 && !isNaN(year)) {
        return new Date(year, monthIdx, day);
      }
    }
    return new Date(2028, 7, 1);
  }
  return d;
}

/**
  Formats a Date object into "15 January 2029" string format
 */
export function formatCalendarDate(date: Date): string {
  const day = date.getDate();
  const monthName = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${monthName} ${year}`;
}

/**
  Determines season phase based on month index (0-indexed)
  Europe:
    Aug(7) - Jan(0): Summer Block (First Half)
    Jan(0): Mid-Season Stop
    Feb(1) - Jun(5): Winter Block (Second Half)
    Jul(6): International Competition Window (or offseason)
  South America:
    Jan(0): Preseason
    Feb(1) - Jun(5): Winter Block (First Half)
    Jul(6): Mid-Season Stop & International Window / Continental Draws
    Aug(7) - Dec(11): Summer Block (Second Half)
 */
export function getSeasonPhaseFromMonth(
  monthIdx: number,
  isSouthAmerica: boolean = false
): 'preseason' | 'first_half' | 'midseason' | 'second_half' | 'offseason' {
  if (isSouthAmerica) {
    if (monthIdx === 0) return 'preseason';
    if (monthIdx >= 1 && monthIdx <= 5) return 'first_half'; // Winter Block in SA
    if (monthIdx === 6) return 'midseason';                 // July stop in SA
    if (monthIdx >= 7 && monthIdx <= 11) return 'second_half'; // Summer Block in SA
    return 'offseason';
  }

  // European Season
  if (monthIdx === 7) return 'preseason';
  if (monthIdx >= 8 && monthIdx <= 11) return 'first_half'; // Summer Block
  if (monthIdx === 0) return 'midseason';                  // January mid-season stop
  if (monthIdx >= 1 && monthIdx <= 5) return 'second_half'; // Winter Block
  return 'offseason';                                      // July (International / Offseason)
}

/**
  Determines block ID e.g. "S1-SUMMER", "S1-WINTER" based on date and player season
 */
export function getHalfSeasonId(date: Date, seasonNum: number = 1, isSouthAmerica: boolean = false): string {
  const m = date.getMonth();
  if (isSouthAmerica) {
    // Winter Block: Feb(1) - Jun(5)
    // Summer Block: Aug(7) - Dec(11)
    const block = m >= 1 && m <= 6 ? 'WINTER' : 'SUMMER';
    return `S${seasonNum}-${block}`;
  }
  // Europe:
  // Summer Block: Aug(7) - Jan(0)
  // Winter Block: Feb(1) - Jun(5)
  const block = m >= 7 || m === 0 ? 'SUMMER' : 'WINTER';
  return `S${seasonNum}-${block}`;
}

/**
  Authoritative function to advance time on the single Career Calendar.
  Updates player state sequentially for all time-dependent systems.
 */
export function advanceCareerCalendar(
  player: PlayerCardData,
  weeksToAdvance: number = 1,
  options?: {
    isMatchday?: boolean;
    isOffseason?: boolean;
    reason?: string;
  }
): CalendarAdvancementResult {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const messages: string[] = [];

  let currentDate = parseCalendarDate(updated.calendarDate);
  const startMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  let currentSeasonNum = updated.currentSeason || 1;

  let monthsCrossed = 0;
  let halfSeasonsCrossed = 0;

  let processedHalfSeasons = new Set<string>(updated.processedHalfSeasons || []);

  // Process week by week sequentially
  for (let w = 1; w <= weeksToAdvance; w++) {
    // Advance date by 7 days
    const prevMonth = currentDate.getMonth();
    const prevYear = currentDate.getFullYear();
    const prevHalfId = getHalfSeasonId(currentDate, currentSeasonNum);

    currentDate.setDate(currentDate.getDate() + 7);

    const newMonth = currentDate.getMonth();
    const newYear = currentDate.getFullYear();

    // Check if new season year increment (August boundary)
    if (prevMonth === 6 && newMonth === 7) {
      currentSeasonNum += 1;
      updated.currentSeason = currentSeasonNum;
      messages.push(`📅 New Season ${currentSeasonNum} has begun!`);
    }

    const newHalfId = getHalfSeasonId(currentDate, currentSeasonNum);

    // 1. INJURY WEEK PROGRESSION
    if (updated.isInjured) {
      updated.injuryWeeksRemaining = Math.max(0, (updated.injuryWeeksRemaining || 1) - 1);
      if (updated.injuryWeeksRemaining === 0) {
        updated.isInjured = false;
        updated.healthStatus = 'healthy';
        updated.injuryName = undefined;
        updated.isCareerEndingRisk = false;
        updated.fitness = 50; // Fitness bar starts at 50% post-injury!
        updated.staminaCurrent = 50;
        updated.justRecoveredFromInjury = true;
        updated.hasSeenFitToPlayModal = false;
        updated.isPostInjuryProtected = true;
        updated.postInjuryProtectionMonthsRemaining = 1;
        updated.postInjuryProtectionUntilTimestamp = Date.now() + 30 * 24 * 60 * 60 * 1000;
        messages.push(`🏥 You're fit to play again! ${updated.name} has fully recovered (Status: HEALTHY). Fitness starts at 50% with -80% Injury Risk for 1 month.`);
      }
    }

    // 2. MONTHLY BOUNDARY CHECK (Monthly Chemistry Boost)
    if (newMonth !== prevMonth) {
      monthsCrossed++;
      const monthYearKey = `${newYear}-${String(newMonth + 1).padStart(2, '0')}`;

      if (updated.lastProcessedMonthYear !== monthYearKey) {
        updated.lastProcessedMonthYear = monthYearKey;

        // Chemistry +10% per month spent at club, or -5% decay if in Overflow (>100%)
        if (!updated.club || (updated.club !== 'Free Agent' && updated.club !== 'Unassigned')) {
          const chemGrowth = applyMonthlyChemistryGrowth(
            updated.chemistry,
            updated.chemistryCeiling,
            updated.chemistryCeilingMonthsRemaining,
            updated.chemistryGainHalvedMonthsRemaining,
            updated.chemistryCaps
          );
          updated.chemistry = chemGrowth.newChemistry;
          updated.chemistryCeiling = chemGrowth.activeCeiling;
          updated.chemistryCeilingMonthsRemaining = chemGrowth.newCeilingMonths;
          updated.chemistryCaps = chemGrowth.newChemistryCaps;
          if (!chemGrowth.activeCeiling) updated.chemistryCeilingReason = undefined;
          updated.chemistryGainHalvedMonthsRemaining = chemGrowth.newHalvedGainMonths;

          if (chemGrowth.gained > 0) {
            messages.push(`🤝 Squad Chemistry increased +${chemGrowth.gained}% for ${MONTH_NAMES[newMonth]} (Current: ${chemGrowth.newChemistry}%).`);
          } else if (chemGrowth.gained < 0) {
            messages.push(`⚡ Overflow Chemistry normalized ${chemGrowth.gained}% for ${MONTH_NAMES[newMonth]} (Current: ${chemGrowth.newChemistry}%).`);
          }
        }
      }
    }

    // 3. HALF-SEASON BOUNDARY CHECK (+1 Recovery Point)
    if (newHalfId !== prevHalfId && !processedHalfSeasons.has(newHalfId)) {
      halfSeasonsCrossed++;
      processedHalfSeasons.add(newHalfId);
      updated.recoveryPoints = (updated.recoveryPoints || 0) + 1;
      messages.push(`⚡ Half-Season Completed (${newHalfId})! Awarded +1 Recovery Point (Total: ${updated.recoveryPoints}).`);
    }
  }

  // Update final calendar fields
  updated.calendarDate = formatCalendarDate(currentDate);
  updated.currentWeek = Math.ceil(((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
  updated.currentMonth = currentDate.getMonth() + 1;
  updated.seasonPhase = getSeasonPhaseFromMonth(currentDate.getMonth());
  updated.processedHalfSeasons = Array.from(processedHalfSeasons);

  return {
    updatedPlayer: updated,
    monthsCrossed,
    halfSeasonsCrossed,
    weeksElapsed: weeksToAdvance,
    messages,
  };
}

// ---------------------------------------------------------------------------
// SENIOR INTERNATIONAL CALENDAR WINDOWS SYSTEM
// ---------------------------------------------------------------------------

export type SeniorInternationalWindowId =
  | 'sep_oct_window' // Late September to Early October (3 weeks, 4 matches; UEFA Nations League or 4 Friendlies)
  | 'nov_window'     // November (2 matches; Qualifiers/Friendlies)
  | 'jan_window'     // January (2 matches; Winter Training Camp & Friendlies)
  | 'summer_window'; // Late June to July (Major Summer Tournaments: World Cup, Euro, Copa América, etc.)

export interface SeniorInternationalWindowInfo {
  id: SeniorInternationalWindowId;
  name: string;
  durationWeeks: number;
  matchCount: number;
  isUefaNationsLeague: boolean;
  flavorTitle: string;
  description: string;
  badgeLabel: string;
  startMonth: number; // 0-indexed (8 = Sep, 9 = Oct, 10 = Nov, 0 = Jan, 5 = Jun, 6 = Jul)
  startDay: number;
  endMonth: number;
  endDay: number;
}

export const SENIOR_INTERNATIONAL_WINDOWS: Record<SeniorInternationalWindowId, SeniorInternationalWindowInfo> = {
  sep_oct_window: {
    id: 'sep_oct_window',
    name: 'Autumn Extended International Window',
    durationWeeks: 3,
    matchCount: 4,
    isUefaNationsLeague: true,
    flavorTitle: 'UEFA Nations League / Global International Tour',
    description: '3-week extended international window. European teams compete in the high-stakes UEFA Nations League group phase (4 matches), while rest of the world plays 4 prestigious international friendlies.',
    badgeLabel: 'AUTUMN 3-WEEK WINDOW (4 MATCHES)',
    startMonth: 8, // September
    startDay: 18,
    endMonth: 9,   // October
    endDay: 10,
  },
  nov_window: {
    id: 'nov_window',
    name: 'November International Window',
    durationWeeks: 2,
    matchCount: 2,
    isUefaNationsLeague: false,
    flavorTitle: 'Continental Qualifiers & Friendlies',
    description: 'Mid-autumn national team break featuring 2 high-intensity continental championship qualifiers and international friendlies.',
    badgeLabel: 'NOVEMBER WINDOW (2 MATCHES)',
    startMonth: 10, // November
    startDay: 10,
    endMonth: 10,
    endDay: 24,
  },
  jan_window: {
    id: 'jan_window',
    name: 'January Winter International Window',
    durationWeeks: 2,
    matchCount: 2,
    isUefaNationsLeague: false,
    flavorTitle: 'Winter Camp & Exhibition Fixtures',
    description: 'Mid-season winter camp where national managers test new tactics and call up in-form talents for 2 friendly encounters.',
    badgeLabel: 'JANUARY WINTER WINDOW (2 MATCHES)',
    startMonth: 0, // January
    startDay: 10,
    endMonth: 0,
    endDay: 24,
  },
  summer_window: {
    id: 'summer_window',
    name: 'Summer Tournament Window',
    durationWeeks: 4,
    matchCount: 7,
    isUefaNationsLeague: false,
    flavorTitle: 'FIFA World Cup & Continental Championships',
    description: 'The pinnacle of international football: Late June to July tournament window featuring the FIFA World Cup, UEFA Euro, CONMEBOL Copa América, AFC Asian Cup, and CAF Africa Cup of Nations.',
    badgeLabel: 'SUMMER PINNACLE WINDOW (LATE JUN - JUL)',
    startMonth: 5, // June
    startDay: 18,
    endMonth: 6,   // July
    endDay: 20,
  },
};

/**
 * Checks whether a given Date falls inside an official Senior International Window.
 */
export function getActiveSeniorInternationalWindow(
  date: Date,
  isUefa: boolean = true
): SeniorInternationalWindowInfo | null {
  const m = date.getMonth();
  const d = date.getDate();

  // 1. Late September to Early October window (Sep 18 - Oct 10)
  if ((m === 8 && d >= 18) || (m === 9 && d <= 10)) {
    const win = { ...SENIOR_INTERNATIONAL_WINDOWS.sep_oct_window };
    if (!isUefa) {
      win.name = 'Global International Friendly Tour';
      win.isUefaNationsLeague = false;
      win.flavorTitle = '4-Match Intercontinental Friendly Series';
    }
    return win;
  }

  // 2. November window (Nov 10 - Nov 24)
  if (m === 10 && d >= 10 && d <= 24) {
    return SENIOR_INTERNATIONAL_WINDOWS.nov_window;
  }

  // 3. January window (Jan 10 - Jan 24)
  if (m === 0 && d >= 10 && d <= 24) {
    return SENIOR_INTERNATIONAL_WINDOWS.jan_window;
  }

  // 4. Summer window (Late June - July)
  if ((m === 5 && d >= 18) || (m === 6 && d <= 20)) {
    return SENIOR_INTERNATIONAL_WINDOWS.summer_window;
  }

  return null;
}

