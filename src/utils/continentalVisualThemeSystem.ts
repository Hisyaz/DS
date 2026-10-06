import { ContinentalCompetitionId } from '../types/continentalCompetitions';

export interface ContinentalVisualTheme {
  id: string;
  name: string;
  shortName: string;
  primaryColorName: string;
  secondaryColorName: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  bgGradient: string;
  headerGradient: string;
  borderColor: string;
  borderActiveColor: string;
  textColor: string;
  subTextColor: string;
  accentTextColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  glowEffect: string;
  cardBg: string;
  qteGlowColor: string;
  buttonGradient: string;
  buttonHoverGradient: string;
  buttonTextColor: string;
}

export const CONTINENTAL_VISUAL_THEMES: Record<string, ContinentalVisualTheme> = {
  // UEFA Champions League: Blue + White
  UEFA_CL: {
    id: 'UEFA_CL',
    name: 'UEFA Champions League',
    shortName: 'UCL',
    primaryColorName: 'Blue',
    secondaryColorName: 'White',
    primaryHex: '#001C58',
    secondaryHex: '#FFFFFF',
    accentHex: '#60A5FA',
    bgGradient: 'from-blue-950 via-slate-950 to-blue-900',
    headerGradient: 'from-blue-900 via-blue-950 to-slate-950',
    borderColor: 'border-blue-400/70',
    borderActiveColor: 'border-blue-300',
    textColor: 'text-white',
    subTextColor: 'text-blue-200',
    accentTextColor: 'text-blue-300',
    badgeBg: 'bg-blue-600/40',
    badgeText: 'text-white font-black',
    badgeBorder: 'border-blue-300/80 shadow-[0_0_12px_rgba(59,130,246,0.5)]',
    pillBg: 'bg-blue-950/90',
    pillText: 'text-blue-100',
    pillBorder: 'border-blue-400/50',
    glowEffect: 'shadow-[0_0_30px_rgba(37,99,235,0.45)]',
    cardBg: 'from-blue-950/70 via-slate-900/90 to-blue-950/50',
    qteGlowColor: 'rgba(96, 165, 250, 0.7)',
    buttonGradient: 'from-blue-600 via-blue-500 to-indigo-600',
    buttonHoverGradient: 'from-blue-500 via-blue-400 to-indigo-500',
    buttonTextColor: 'text-white',
  },

  // UEFA Europa League: Orange + Black
  UEFA_EL: {
    id: 'UEFA_EL',
    name: 'UEFA Europa League',
    shortName: 'UEL',
    primaryColorName: 'Orange',
    secondaryColorName: 'Black',
    primaryHex: '#FF5500',
    secondaryHex: '#000000',
    accentHex: '#FB923C',
    bgGradient: 'from-orange-950 via-black to-slate-950',
    headerGradient: 'from-orange-950 via-black to-stone-950',
    borderColor: 'border-orange-500/80',
    borderActiveColor: 'border-orange-400',
    textColor: 'text-orange-100',
    subTextColor: 'text-orange-200/90',
    accentTextColor: 'text-orange-400',
    badgeBg: 'bg-orange-600/40',
    badgeText: 'text-orange-100 font-black',
    badgeBorder: 'border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]',
    pillBg: 'bg-black/90',
    pillText: 'text-orange-200',
    pillBorder: 'border-orange-500/60',
    glowEffect: 'shadow-[0_0_30px_rgba(234,88,12,0.45)]',
    cardBg: 'from-orange-950/60 via-black/90 to-stone-950/80',
    qteGlowColor: 'rgba(249, 115, 22, 0.7)',
    buttonGradient: 'from-orange-600 via-amber-600 to-orange-700',
    buttonHoverGradient: 'from-orange-500 via-amber-500 to-orange-600',
    buttonTextColor: 'text-white',
  },

  // UEFA Europa Conference League: Green + Black
  UEFA_ECL: {
    id: 'UEFA_ECL',
    name: 'UEFA Conference League',
    shortName: 'UECL',
    primaryColorName: 'Green',
    secondaryColorName: 'Black',
    primaryHex: '#059669',
    secondaryHex: '#000000',
    accentHex: '#34D399',
    bgGradient: 'from-emerald-950 via-black to-slate-950',
    headerGradient: 'from-emerald-950 via-black to-slate-950',
    borderColor: 'border-emerald-500/80',
    borderActiveColor: 'border-emerald-400',
    textColor: 'text-emerald-100',
    subTextColor: 'text-emerald-200/90',
    accentTextColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-600/40',
    badgeText: 'text-emerald-100 font-black',
    badgeBorder: 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    pillBg: 'bg-black/90',
    pillText: 'text-emerald-200',
    pillBorder: 'border-emerald-500/60',
    glowEffect: 'shadow-[0_0_30px_rgba(16,185,129,0.45)]',
    cardBg: 'from-emerald-950/60 via-black/90 to-slate-950/80',
    qteGlowColor: 'rgba(52, 211, 153, 0.7)',
    buttonGradient: 'from-emerald-600 via-green-600 to-teal-700',
    buttonHoverGradient: 'from-emerald-500 via-green-500 to-teal-600',
    buttonTextColor: 'text-white',
  },

  // CONMEBOL Libertadores: Gold + Black
  CONMEBOL_LIB: {
    id: 'CONMEBOL_LIB',
    name: 'Copa CONMEBOL Libertadores',
    shortName: 'LIB',
    primaryColorName: 'Gold',
    secondaryColorName: 'Black',
    primaryHex: '#F59E0B',
    secondaryHex: '#000000',
    accentHex: '#FDE047',
    bgGradient: 'from-amber-950 via-black to-yellow-950',
    headerGradient: 'from-amber-950 via-black to-slate-950',
    borderColor: 'border-amber-400/80',
    borderActiveColor: 'border-yellow-300',
    textColor: 'text-amber-100',
    subTextColor: 'text-amber-200/90',
    accentTextColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/30',
    badgeText: 'text-yellow-200 font-black',
    badgeBorder: 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    pillBg: 'bg-black/90',
    pillText: 'text-amber-200',
    pillBorder: 'border-amber-400/60',
    glowEffect: 'shadow-[0_0_30px_rgba(245,158,11,0.45)]',
    cardBg: 'from-amber-950/60 via-black/90 to-yellow-950/60',
    qteGlowColor: 'rgba(253, 224, 71, 0.7)',
    buttonGradient: 'from-amber-500 via-yellow-500 to-amber-600',
    buttonHoverGradient: 'from-amber-400 via-yellow-400 to-amber-500',
    buttonTextColor: 'text-slate-950 font-black',
  },

  // CONMEBOL Sudamericana: Blue + Silver
  CONMEBOL_SUD: {
    id: 'CONMEBOL_SUD',
    name: 'Copa CONMEBOL Sudamericana',
    shortName: 'SUD',
    primaryColorName: 'Blue',
    secondaryColorName: 'Silver',
    primaryHex: '#2563EB',
    secondaryHex: '#CBD5E1',
    accentHex: '#94A3B8',
    bgGradient: 'from-slate-950 via-blue-950 to-slate-900',
    headerGradient: 'from-blue-950 via-slate-950 to-slate-900',
    borderColor: 'border-cyan-300/80',
    borderActiveColor: 'border-slate-200',
    textColor: 'text-slate-100',
    subTextColor: 'text-slate-200/90',
    accentTextColor: 'text-cyan-300',
    badgeBg: 'bg-blue-600/30',
    badgeText: 'text-slate-100 font-black',
    badgeBorder: 'border-cyan-300/80 shadow-[0_0_12px_rgba(56,189,248,0.4)]',
    pillBg: 'bg-slate-950/90',
    pillText: 'text-slate-200',
    pillBorder: 'border-cyan-300/50',
    glowEffect: 'shadow-[0_0_30px_rgba(56,189,248,0.4)]',
    cardBg: 'from-slate-950 via-blue-950/60 to-slate-900',
    qteGlowColor: 'rgba(203, 213, 225, 0.7)',
    buttonGradient: 'from-blue-600 via-sky-600 to-slate-700',
    buttonHoverGradient: 'from-blue-500 via-sky-500 to-slate-600',
    buttonTextColor: 'text-white',
  },

  // AFC Champions League: Gold + Deep Blue
  AFC_CL: {
    id: 'AFC_CL',
    name: 'AFC Champions League',
    shortName: 'ACL',
    primaryColorName: 'Gold',
    secondaryColorName: 'Blue',
    primaryHex: '#D97706',
    secondaryHex: '#1E3A8A',
    accentHex: '#FBBF24',
    bgGradient: 'from-amber-950 via-blue-950 to-slate-950',
    headerGradient: 'from-amber-900 via-blue-950 to-slate-950',
    borderColor: 'border-amber-400/80',
    borderActiveColor: 'border-amber-300',
    textColor: 'text-amber-100',
    subTextColor: 'text-amber-200',
    accentTextColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/30',
    badgeText: 'text-amber-200 font-black',
    badgeBorder: 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    pillBg: 'bg-slate-950/90',
    pillText: 'text-amber-200',
    pillBorder: 'border-amber-400/50',
    glowEffect: 'shadow-[0_0_30px_rgba(245,158,11,0.4)]',
    cardBg: 'from-amber-950/50 via-slate-900 to-blue-950/50',
    qteGlowColor: 'rgba(251, 191, 36, 0.7)',
    buttonGradient: 'from-amber-500 via-yellow-500 to-amber-600',
    buttonHoverGradient: 'from-amber-400 via-yellow-400 to-amber-500',
    buttonTextColor: 'text-slate-950 font-black',
  },

  // CAF Champions League: Emerald + Gold
  CAF_CL: {
    id: 'CAF_CL',
    name: 'CAF Champions League',
    shortName: 'CAF-CL',
    primaryColorName: 'Green',
    secondaryColorName: 'Gold',
    primaryHex: '#059669',
    secondaryHex: '#F59E0B',
    accentHex: '#34D399',
    bgGradient: 'from-emerald-950 via-amber-950/40 to-slate-950',
    headerGradient: 'from-emerald-900 via-slate-950 to-amber-950',
    borderColor: 'border-emerald-400/80',
    borderActiveColor: 'border-emerald-300',
    textColor: 'text-emerald-100',
    subTextColor: 'text-emerald-200',
    accentTextColor: 'text-amber-300',
    badgeBg: 'bg-emerald-600/30',
    badgeText: 'text-emerald-200 font-black',
    badgeBorder: 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    pillBg: 'bg-slate-950/90',
    pillText: 'text-emerald-200',
    pillBorder: 'border-emerald-400/50',
    glowEffect: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    cardBg: 'from-emerald-950/50 via-slate-900 to-amber-950/40',
    qteGlowColor: 'rgba(52, 211, 153, 0.7)',
    buttonGradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    buttonHoverGradient: 'from-emerald-500 via-teal-500 to-emerald-600',
    buttonTextColor: 'text-white',
  },

  // CONCACAF Champions Cup: Blue + Gold
  CONCACAF_CC: {
    id: 'CONCACAF_CC',
    name: 'CONCACAF Champions Cup',
    shortName: 'CCC',
    primaryColorName: 'Blue',
    secondaryColorName: 'Gold',
    primaryHex: '#1E40AF',
    secondaryHex: '#F59E0B',
    accentHex: '#60A5FA',
    bgGradient: 'from-blue-950 via-slate-950 to-amber-950/40',
    headerGradient: 'from-blue-900 via-slate-950 to-slate-900',
    borderColor: 'border-blue-400/80',
    borderActiveColor: 'border-amber-400',
    textColor: 'text-blue-100',
    subTextColor: 'text-blue-200',
    accentTextColor: 'text-amber-300',
    badgeBg: 'bg-blue-600/30',
    badgeText: 'text-blue-200 font-black',
    badgeBorder: 'border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    pillBg: 'bg-slate-950/90',
    pillText: 'text-blue-200',
    pillBorder: 'border-blue-400/50',
    glowEffect: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    cardBg: 'from-blue-950/50 via-slate-900 to-amber-950/40',
    qteGlowColor: 'rgba(96, 165, 250, 0.7)',
    buttonGradient: 'from-blue-600 via-indigo-600 to-blue-700',
    buttonHoverGradient: 'from-blue-500 via-indigo-500 to-blue-600',
    buttonTextColor: 'text-white',
  },
};

/**
 * Detects and returns the continental visual theme for a given competition ID or name string.
 */
export function getContinentalVisualTheme(
  compIdOrName?: string | ContinentalCompetitionId | null
): ContinentalVisualTheme | null {
  if (!compIdOrName) return null;
  const norm = String(compIdOrName).toUpperCase().trim();

  // Direct lookup
  if (CONTINENTAL_VISUAL_THEMES[norm]) {
    return CONTINENTAL_VISUAL_THEMES[norm];
  }

  // Name keyword heuristics
  const lower = norm.toLowerCase();

  // 1. Champions League (UEFA) -> Blue + White
  if (
    lower.includes('champions league') ||
    lower.includes('uefa_cl') ||
    lower.includes('ucl') ||
    lower.includes('champions cup') ||
    (lower.includes('champions') && !lower.includes('afc') && !lower.includes('caf') && !lower.includes('concacaf'))
  ) {
    return CONTINENTAL_VISUAL_THEMES.UEFA_CL;
  }

  // 2. Europa League (UEFA) -> Orange + Black
  if (
    lower.includes('europa league') ||
    lower.includes('uefa_el') ||
    lower.includes('uel') ||
    lower.includes('europa cup')
  ) {
    return CONTINENTAL_VISUAL_THEMES.UEFA_EL;
  }

  // 3. Conference League (UEFA) -> Green + Black
  if (
    lower.includes('conference league') ||
    lower.includes('uefa_ecl') ||
    lower.includes('uecl') ||
    lower.includes('conference cup')
  ) {
    return CONTINENTAL_VISUAL_THEMES.UEFA_ECL;
  }

  // 4. Copa Libertadores (CONMEBOL) -> Gold + Black
  if (
    lower.includes('libertadores') ||
    lower.includes('conmebol_lib') ||
    lower.includes('copa libertadores')
  ) {
    return CONTINENTAL_VISUAL_THEMES.CONMEBOL_LIB;
  }

  // 5. Copa Sudamericana (CONMEBOL) -> Blue + Silver
  if (
    lower.includes('sudamericana') ||
    lower.includes('conmebol_sud') ||
    lower.includes('copa sudamericana')
  ) {
    return CONTINENTAL_VISUAL_THEMES.CONMEBOL_SUD;
  }

  // AFC Champions League
  if (lower.includes('afc') || lower.includes('asian champions')) {
    return CONTINENTAL_VISUAL_THEMES.AFC_CL;
  }

  // CAF Champions League
  if (lower.includes('caf') || lower.includes('african champions')) {
    return CONTINENTAL_VISUAL_THEMES.CAF_CL;
  }

  // CONCACAF Champions Cup
  if (lower.includes('concacaf')) {
    return CONTINENTAL_VISUAL_THEMES.CONCACAF_CC;
  }

  return null;
}
