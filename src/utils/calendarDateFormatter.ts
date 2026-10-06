import { getStoredLanguage, LanguageCode } from './localizationSystem';

const LANG_LOCALE_MAP: Record<LanguageCode, string> = {
  'en-GB': 'en-GB',
  'es-ES': 'es-ES',
  'es-AR': 'es-AR',
  'pt-BR': 'pt-BR',
  'fr-FR': 'fr-FR',
};

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ENGLISH_DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export interface FormattedCalendarDate {
  dayOfWeek: string;
  dayNumber: number;
  monthName: string;
  year: number;
  fullDateString: string; // e.g. "Monday, 15 August 2029"
}

/**
 * Derives the exact calendar Date for a given weekly matchday in the season.
 * Single Master Timeline:
 * - Europe:
 *   - Summer Block: Matchday 1 (~Aug 15) to Matchday 19 (~Jan 25)
 *   - Winter Block: Matchday 20 (~Feb 5) to Matchday 38 (~Jun 15)
 *   - July: International competition window (or skipped)
 * - South America:
 *   - Winter Block: Matchday 1 (~Feb 15) to Matchday 19 (~Jun 25)
 *   - July: Mid-season stop & International competition window / Continental draws
 *   - Summer Block: Matchday 20 (~Aug 15) to Matchday 38 (~Dec 15)
 */
export function getCalendarDateForMatchdayIndex(
  matchdayIndex: number,
  seasonYear: string = '2026/27',
  isSouthAmerica: boolean = false
): Date {
  const startYear = parseInt(seasonYear.split('/')[0], 10) || 2026;
  const safeIdx = Math.max(1, Math.min(38, matchdayIndex || 1));

  if (isSouthAmerica) {
    if (safeIdx <= 19) {
      // South America Winter Block: Feb 15 -> Jun 25 of startYear
      const startDate = new Date(startYear, 1, 15).getTime();
      const endDate = new Date(startYear, 5, 25).getTime();
      const progress = (safeIdx - 1) / 18;
      return new Date(startDate + progress * (endDate - startDate));
    } else {
      // South America Summer Block: Aug 15 -> Dec 15 of startYear
      const startDate = new Date(startYear, 7, 15).getTime();
      const endDate = new Date(startYear, 11, 15).getTime();
      const progress = (safeIdx - 20) / 18;
      return new Date(startDate + progress * (endDate - startDate));
    }
  }

  // European Season Flow
  if (safeIdx <= 19) {
    // Europe Summer Block: Aug 15 of startYear -> Jan 25 of (startYear + 1)
    const startDate = new Date(startYear, 7, 15).getTime();
    const endDate = new Date(startYear + 1, 0, 25).getTime();
    const progress = (safeIdx - 1) / 18;
    return new Date(startDate + progress * (endDate - startDate));
  } else {
    // Europe Winter Block: Feb 5 -> Jun 15 of (startYear + 1)
    const startDate = new Date(startYear + 1, 1, 5).getTime();
    const endDate = new Date(startYear + 1, 5, 15).getTime();
    const progress = (safeIdx - 20) / 18;
    return new Date(startDate + progress * (endDate - startDate));
  }
}

/**
 * Formats a calendar Date into a localized display string containing:
 * - Day of week
 * - Day number
 * - Month name
 * - Year
 * 
 * Example in English: "Monday, 15 August 2029"
 * Example in Spanish: "Lunes, 15 de agosto de 2029"
 * Example in Portuguese: "Segunda-feira, 15 de agosto de 2029"
 * Example in French: "Lundi 15 août 2029"
 */
export function formatSimulationCalendarDate(date: Date | string, customLang?: LanguageCode): FormattedCalendarDate {
  const d = typeof date === 'string' ? new Date(date) : date;
  const validDate = isNaN(d.getTime()) ? new Date(2026, 7, 15) : d;
  const lang = customLang || getStoredLanguage();
  const locale = LANG_LOCALE_MAP[lang] || 'en-GB';

  let dayOfWeek = '';
  let monthName = '';
  let fullDateString = '';

  try {
    const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    const fullFormatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    dayOfWeek = dayFormatter.format(validDate);
    monthName = monthFormatter.format(validDate);
    fullDateString = fullFormatter.format(validDate);
  } catch {
    dayOfWeek = ENGLISH_DAYS[validDate.getDay()];
    monthName = ENGLISH_MONTHS[validDate.getMonth()];
    fullDateString = `${dayOfWeek}, ${validDate.getDate()} ${monthName} ${validDate.getFullYear()}`;
  }

  // Capitalize first letter of string and day of week
  if (fullDateString.length > 0) {
    fullDateString = fullDateString.charAt(0).toUpperCase() + fullDateString.slice(1);
  }
  if (dayOfWeek.length > 0) {
    dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  }
  if (monthName.length > 0) {
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  }

  return {
    dayOfWeek,
    dayNumber: validDate.getDate(),
    monthName,
    year: validDate.getFullYear(),
    fullDateString,
  };
}

/**
 * Returns the localized full date string for a given matchday index.
 */
export function getLocalizedCalendarDateString(
  matchdayIndex: number,
  seasonYear: string = '2026/27',
  lang?: LanguageCode,
  isSouthAmerica: boolean = false
): string {
  const date = getCalendarDateForMatchdayIndex(matchdayIndex, seasonYear, isSouthAmerica);
  return formatSimulationCalendarDate(date, lang).fullDateString;
}
