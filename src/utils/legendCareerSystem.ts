import { PlayerCardData, OutfieldDetailedStats, TrophyItem } from '../types';
import { isTestModeEnabled } from './testModeSystem';

export interface LegendTrophyRecord {
  id: string;
  name: string;
  count: number;
  category: 'club' | 'international' | 'youth' | 'individual';
  subtitle?: string;
  iconType: 'world_cup' | 'trophy' | 'cup' | 'medal' | 'ballon_dor' | 'golden_boot' | 'ucl' | 'finalissima' | 'copa_america' | 'shield';
}

export interface LegendHistoricRecord {
  id: string;
  label: string;
  target: number;
  unit: string;
  year?: string;
  context: string;
  description: string;
  tagline: string;
}

export interface LegendObjectiveBenchmark {
  id: string;
  label: string;
  target: number;
  unit: string;
  description: string;
  isOfficialTop5Requirement?: boolean;
}

export interface FirstLegendProfile {
  title: string;
  subtitle: string;
  startingAge: number;
  fixedPotential: number;
  startingOvr: number;
  position: string;
  subPosition: string;
  playstyle: string;
  startingDribbling: number;
  startingClub: string;
  clubCountry: string;
  league: string;
  primaryNationality: { code: string; iso: string; name: string };
  secondaryNationality: { code: string; iso: string; name: string };
  dualNationalityLabel: string;
  careerStats: {
    matches: number;
    goals: number;
    assists: number;
    mvpAwards: number;
    clubMatches: number;
    clubGoals: number;
    clubAssists: number;
    internationalMatches: number;
    internationalGoals: number;
    internationalAssists: number;
    majorTournamentMatches: number;
    majorTournamentGoals: number;
  };
  records: {
    calendarYearGoals2012: number;
    singleClubGoals: number;
    laLigaGoals: number;
    laLigaAssists: number;
    laLigaHatTricks: number;
  };
  economics: {
    careerSalary: string;
    careerSalaryExact: number;
    highestAnnualSalary: string;
    highestAnnualSalaryPeriod: string;
    sponsors: string;
    sponsorsExact: number;
    netWorth: string;
    netWorthExact: number;
  };
  perk: {
    id: string;
    name: string;
    tagline: string;
    description: string;
    effectText: string;
  };
  trophies: {
    international: LegendTrophyRecord[];
    club: LegendTrophyRecord[];
    youth: LegendTrophyRecord[];
    individual: LegendTrophyRecord[];
  };
}

export const LEGEND_HISTORIC_RECORDS: LegendHistoricRecord[] = [
  {
    id: 'calendar_year_goals_2012',
    label: '91 Goals in a Calendar Year (2012)',
    target: 91,
    unit: 'Goals in a Single Year',
    year: '2012',
    context: 'FC Barcelona & Argentina (69 Matches)',
    description: 'Surpass the immortal Guinness World Record of 91 goals scored in a single calendar year across all competitions (79 for Barcelona, 12 for Argentina).',
    tagline: 'World Record: 91 Goals in 2012',
  },
  {
    id: 'single_club_goals',
    label: '672 Goals for a Single Club',
    target: 672,
    unit: 'Goals for One Club',
    context: 'FC Barcelona (2004–2021)',
    description: 'Score 672+ official competitive goals for a single club, surpassing the all-time world record for goals scored for a single team in football history.',
    tagline: 'World Record: 672 Goals for FC Barcelona',
  },
  {
    id: 'la_liga_goals',
    label: 'Most La Liga Goals (474 Goals)',
    target: 474,
    unit: 'La Liga Goals',
    context: 'Spanish Primera División (520 Matches)',
    description: 'Surpass 474 goals in the Spanish league (La Liga) to become the greatest top-flight goalscorer in Spanish football history.',
    tagline: 'All-Time Record: 474 Goals in La Liga',
  },
  {
    id: 'la_liga_assists',
    label: 'Most La Liga Assists (192 Assists)',
    target: 192,
    unit: 'La Liga Assists',
    context: 'Spanish Primera División (520 Matches)',
    description: 'Provide 192+ official league assists in La Liga, surpassing the all-time playmaking and assist record in Spanish top-flight history.',
    tagline: 'All-Time Record: 192 Assists in La Liga',
  },
  {
    id: 'la_liga_hat_tricks',
    label: 'Most La Liga Hat-tricks (36 Hat-tricks)',
    target: 36,
    unit: 'Hat-tricks (3+ goals)',
    context: 'Spanish Primera División (36 Hat-tricks)',
    description: 'Score 36+ hat-tricks (3 or more goals in a single match) in the Spanish Primera División (La Liga).',
    tagline: 'All-Time Record: 36 Hat-tricks in La Liga',
  },
];

export const FIRST_LEGEND_DATA: FirstLegendProfile = {
  title: "Barcelona and Argentina's Greatest Ever",
  subtitle: "BARCELONA & ARGENTINA'S GREATEST PLAYER",
  startingAge: 16,
  fixedPotential: 99,
  startingOvr: 80,
  position: 'Attacker',
  subPosition: 'Right Winger (RW)',
  playstyle: 'Inverted',
  startingDribbling: 99,
  startingClub: 'FC Barcelona',
  clubCountry: 'Spain',
  league: 'La Liga',
  primaryNationality: { code: 'ARG', iso: 'ar', name: 'Argentina' },
  secondaryNationality: { code: 'ESP', iso: 'es', name: 'Spain' },
  dualNationalityLabel: 'Dual Nationality: Argentinean (ARG) & Spanish (ESP)',
  careerStats: {
    matches: 1170,
    goals: 923,
    assists: 420,
    mvpAwards: 458,
    clubMatches: 948,
    clubGoals: 765,
    clubAssists: 362,
    internationalMatches: 191,
    internationalGoals: 112,
    internationalAssists: 58,
    majorTournamentMatches: 65,
    majorTournamentGoals: 27,
  },
  records: {
    calendarYearGoals2012: 91,
    singleClubGoals: 672,
    laLigaGoals: 474,
    laLigaAssists: 192,
    laLigaHatTricks: 36,
  },
  economics: {
    careerSalary: '$700,000,000+',
    careerSalaryExact: 700000000,
    highestAnnualSalary: '$167,000,000',
    highestAnnualSalaryPeriod: '2017–2021',
    sponsors: '$850,000,000',
    sponsorsExact: 850000000,
    netWorth: '$1,100,000,000',
    netWorthExact: 1100000000,
  },
  perk: {
    id: 'magnetic_feet',
    name: 'MAGNETIC FEET',
    tagline: 'The ball is glued to your feet. You are nearly impossible to dispossess.',
    description: 'Every dribble attempt receives 2× the normal success chance in all matches, tactical chances, and duels.',
    effectText: '×2 success in dribbling',
  },
  trophies: {
    international: [
      { id: 'intl_wc', name: 'FIFA World Cup', count: 1, category: 'international', iconType: 'world_cup', subtitle: 'Argentina Senior Title' },
      { id: 'intl_finalissima', name: 'CONMEBOL–UEFA Cup of Champions (Finalissima)', count: 1, category: 'international', iconType: 'finalissima', subtitle: 'Intercontinental Super Cup' },
      { id: 'intl_copa', name: 'Copa América', count: 2, category: 'international', iconType: 'copa_america', subtitle: 'South American Continental Titles' },
      { id: 'intl_olympic', name: 'Olympic Gold Medal', count: 1, category: 'international', iconType: 'medal', subtitle: 'Beijing 2008' },
    ],
    club: [
      { id: 'club_ucl', name: 'UEFA Champions League', count: 4, category: 'club', iconType: 'ucl', subtitle: 'European Continental Crowns' },
      { id: 'club_top5_league', name: 'Top-Five European League Titles', count: 12, category: 'club', iconType: 'trophy', subtitle: '10× Spanish League & 2× French League' },
      { id: 'club_domestic_cups', name: 'Domestic Cups', count: 7, category: 'club', iconType: 'cup', subtitle: 'Domestic Knockout Trophies' },
      { id: 'club_domestic_super', name: 'Domestic Super Cups', count: 8, category: 'club', iconType: 'shield', subtitle: 'National Season Openers' },
      { id: 'club_uefa_super', name: 'UEFA Super Cups', count: 3, category: 'club', iconType: 'trophy', subtitle: 'European Super Trophies' },
      { id: 'club_cwc', name: 'FIFA Club World Cups', count: 3, category: 'club', iconType: 'world_cup', subtitle: 'Global Club Champions' },
      { id: 'club_leagues_cup', name: 'Major Inter-League Cups', count: 1, category: 'club', iconType: 'cup', subtitle: 'Leagues Cup' },
      { id: 'club_supporters_shield', name: 'Regular Season Championships', count: 1, category: 'club', iconType: 'shield', subtitle: 'Supporters\' Shield' },
    ],
    youth: [
      { id: 'youth_u20_wc', name: 'FIFA U-20 World Cup', count: 1, category: 'youth', iconType: 'world_cup', subtitle: 'Netherlands 2005' },
      { id: 'youth_u20_ball', name: 'FIFA U-20 World Cup Golden Ball', count: 1, category: 'youth', iconType: 'ballon_dor', subtitle: 'Best Player of the Tournament' },
      { id: 'youth_u20_boot', name: 'FIFA U-20 World Cup Golden Boot', count: 1, category: 'youth', iconType: 'golden_boot', subtitle: 'Top Goalscorer (6 Goals)' },
      { id: 'youth_south_am', name: 'South American U-20 Championship Top Scorer', count: 1, category: 'youth', iconType: 'medal', subtitle: 'Youth International Honor' },
    ],
    individual: [
      { id: 'ind_ballon_dor', name: "Ballon d'Or", count: 8, category: 'individual', iconType: 'ballon_dor', subtitle: 'Record 8× World Player of the Year' },
      { id: 'ind_golden_shoe', name: 'European Golden Shoe', count: 6, category: 'individual', iconType: 'golden_boot', subtitle: 'Record 6× Top European League Scorer' },
      { id: 'ind_pichichi', name: 'Pichichi / Top European League Scorer', count: 8, category: 'individual', iconType: 'trophy', subtitle: 'Top Scorer in Top-Five European Leagues' },
      { id: 'ind_ucl_top_scorer', name: 'UEFA Champions League Top Scorer', count: 6, category: 'individual', iconType: 'ucl', subtitle: 'Continental Golden Boot' },
      { id: 'ind_wc_golden_ball', name: 'FIFA World Cup Golden Ball', count: 2, category: 'individual', iconType: 'ballon_dor', subtitle: '2014 & 2022 Best Player' },
      { id: 'ind_copa_best_player', name: 'Copa América Best Player', count: 2, category: 'individual', iconType: 'medal', subtitle: '2015 & 2021 Tournament MVP' },
      { id: 'ind_cwc_golden_ball', name: 'FIFA Club World Cup Golden Ball', count: 2, category: 'individual', iconType: 'world_cup', subtitle: '2009 & 2011 Club World Cup MVP' },
      { id: 'ind_fifa_the_best', name: 'FIFA World Player / The Best Awards', count: 3, category: 'individual', iconType: 'ballon_dor', subtitle: 'Official FIFA World Player Trophies' },
      { id: 'ind_uefa_poty', name: 'UEFA Men\'s Player of the Year', count: 3, category: 'individual', iconType: 'trophy', subtitle: 'Best Player in Europe' },
      { id: 'ind_golden_boy', name: 'Golden Boy Award', count: 1, category: 'individual', iconType: 'medal', subtitle: 'World Best Young Player 2005' },
      { id: 'ind_laureus', name: 'Laureus World Sportsman of the Year', count: 2, category: 'individual', iconType: 'medal', subtitle: 'Global Sports Icon' },
      { id: 'ind_fifpro_11', name: 'FIFPRO World 11 Appearances', count: 17, category: 'individual', iconType: 'shield', subtitle: '17 Consecutive Years in World 11' },
    ],
  },
};

export const REQUIRED_LEGEND_BENCHMARKS: LegendObjectiveBenchmark[] = [
  {
    id: 'world_cups',
    label: 'FIFA World Cups',
    target: 2,
    unit: 'Trophies',
    description: 'Win 2+ FIFA World Cups with your senior national team.',
  },
  {
    id: 'champions_leagues',
    label: 'UEFA Champions Leagues',
    target: 5,
    unit: 'Titles',
    description: 'Win 5+ UEFA Champions League continental crowns.',
  },
  {
    id: 'ballon_dors',
    label: "Ballon d'Ors",
    target: 9,
    unit: 'Awards',
    description: "Surpass the immortal record by winning 9+ Ballon d'Or awards.",
  },
  {
    id: 'career_goals',
    label: 'Career Goals',
    target: 923,
    unit: 'Goals',
    description: 'Score 923+ official senior career goals across club and country.',
  },
  {
    id: 'career_assists',
    label: 'Career Assists',
    target: 415,
    unit: 'Assists',
    description: 'Provide 415+ official career assists across all competitions.',
  },
  {
    id: 'top5_league_titles',
    label: 'Top-5 European League Titles',
    target: 13,
    unit: 'League Titles',
    description: 'Win 13+ official league titles in England, Spain, France, Germany, or Italy.',
    isOfficialTop5Requirement: true,
  },
  {
    id: 'european_golden_shoes',
    label: 'European Golden Shoes',
    target: 6,
    unit: 'Golden Shoes',
    description: 'Win 6+ European Golden Shoes as the continent\'s top domestic goalscorer.',
  },
];

export const SUPPORTING_LEGEND_BENCHMARKS: LegendObjectiveBenchmark[] = [
  {
    id: 'career_matches',
    label: 'Career Matches',
    target: 1170,
    unit: 'Matches',
    description: 'Play 1,170+ official senior matches.',
  },
  {
    id: 'mvp_awards',
    label: 'MVP / MOTM Awards',
    target: 458,
    unit: 'Awards',
    description: 'Claim 458+ official Match MVP awards.',
  },
  {
    id: 'domestic_cups',
    label: 'Domestic Cups',
    target: 8,
    unit: 'Cups',
    description: 'Win 8+ major domestic cup tournaments.',
  },
  {
    id: 'other_international_trophies',
    label: 'Other International Trophies',
    target: 4,
    unit: 'Trophies',
    description: 'Lift 4+ continental / intercontinental international trophies (Copa América, Finalissima, Olympic Gold).',
  },
];

// Top-Five European League Country Identifiers
export const TOP_5_LEAGUE_COUNTRIES = ['Spain', 'England', 'Italy', 'Germany', 'France'];
export const TOP_5_LEAGUES = ['La Liga', 'Premier League', 'Serie A', 'Bundesliga', 'Ligue 1'];

/**
 * Storage helpers for Global Icon Points and Champion Points
 * In Test Mode: Sets points to 9999 and auto-replenishes if spent.
 */
export function getStoredGlobalIconPoints(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const testModeActive = isTestModeEnabled();
    const val = localStorage.getItem('global_icon_points_total');
    let points = val ? Math.max(0, parseInt(val, 10) || 0) : 0;

    // In Test Mode, ensure points start at 9999 and auto-replenish if spent/below 9999
    if (testModeActive && points < 9999) {
      points = 9999;
      localStorage.setItem('global_icon_points_total', '9999');
    }
    return points;
  } catch (e) {
    return isTestModeEnabled() ? 9999 : 0;
  }
}

export function setStoredGlobalIconPoints(points: number): number {
  if (typeof window === 'undefined') return points;
  try {
    let clamped = Math.max(0, Math.round(points));
    // If in test mode and points are set/reduced below 9999, auto-replenish to 9999
    if (isTestModeEnabled() && clamped < 9999) {
      clamped = 9999;
    }
    localStorage.setItem('global_icon_points_total', String(clamped));
    return clamped;
  } catch (e) {
    return points;
  }
}

export function modifyStoredGlobalIconPoints(delta: number): number {
  const current = getStoredGlobalIconPoints();
  let next = Math.max(0, current + delta);
  if (isTestModeEnabled() && delta < 0) {
    // Auto-replenish back to 9999 if spent in test mode
    next = 9999;
  }
  return setStoredGlobalIconPoints(next);
}

export function getStoredChampionPoints(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const testModeActive = isTestModeEnabled();
    const val = localStorage.getItem('legend_champion_points_total');
    let points = val ? Math.max(0, parseInt(val, 10) || 0) : 0;
    if (testModeActive && points < 9999) {
      points = 9999;
      localStorage.setItem('legend_champion_points_total', '9999');
    }
    return points;
  } catch (e) {
    return isTestModeEnabled() ? 9999 : 0;
  }
}

export function setStoredChampionPoints(points: number): number {
  if (typeof window === 'undefined') return points;
  try {
    let clamped = Math.max(0, Math.round(points));
    if (isTestModeEnabled() && clamped < 9999) {
      clamped = 9999;
    }
    localStorage.setItem('legend_champion_points_total', String(clamped));
    return clamped;
  } catch (e) {
    return points;
  }
}

export function modifyStoredChampionPoints(delta: number): number {
  const current = getStoredChampionPoints();
  let next = Math.max(0, current + delta);
  if (isTestModeEnabled() && delta < 0) {
    next = 9999;
  }
  return setStoredChampionPoints(next);
}

export interface ObjectiveProgress {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  surpassed: boolean;
  description: string;
  tagline?: string;
  year?: string;
  context?: string;
  isOfficialTop5Requirement?: boolean;
}

export interface LegendCareerBenchmarkStatus {
  totalSurpassed: number;
  totalRequired: number;
  totalHistoricRecordsSurpassed: number;
  totalHistoricRecords: number;
  championPointsEarned: number;
  requiredObjectives: ObjectiveProgress[];
  historicRecords: ObjectiveProgress[];
  supportingObjectives: ObjectiveProgress[];
}

/**
 * Calculates player's progress vs Legend benchmarks, Historic Records, and total Champion Points
 */
export function checkLegendBenchmarksProgress(player: PlayerCardData): LegendCareerBenchmarkStatus {
  const stats: any = player.careerHistory || {};
  const seasons: any[] = stats.seasons || [];

  const trophiesList: TrophyItem[] = (player.trophies || []).concat(stats.trophiesWon || stats.trophies || []);
  const awardsList: any[] = stats.individualAwards || [];

  // World Cups
  const worldCupWins = (player.internationalTrophies || trophiesList).filter(
    (t) => t.name?.toLowerCase().includes('world cup') && !t.name?.toLowerCase().includes('u-20') && !t.name?.toLowerCase().includes('u20') && !t.name?.toLowerCase().includes('club')
  ).length;

  // Champions Leagues (UCL)
  const uclWins = trophiesList.filter(
    (t) => t.name?.toLowerCase().includes('champions league') || t.name?.toLowerCase().includes('ucl')
  ).length;

  // Ballon d'Ors
  const ballonDors = awardsList.filter(
    (a) => a.name?.toLowerCase().includes("ballon d'or") || a.name?.toLowerCase().includes('ballon dor')
  ).length;

  // Goals
  const totalGoals = (stats.totalGoals || 0) + (player.internationalGoals || 0);

  // Assists
  const totalAssists = (stats.totalAssists || 0) + (stats.nationalTeamStats?.assists || 0);

  // Top-5 European League Titles
  // Check trophies that are league titles from England, Spain, France, Germany, Italy
  const top5LeagueTitles = trophiesList.filter((t) => {
    const nameLower = t.name?.toLowerCase() || '';
    const isLeague = t.iconType === 'league' || (t as any).category === 'national' || nameLower.includes('league') || nameLower.includes('liga') || nameLower.includes('serie a') || nameLower.includes('bundesliga') || nameLower.includes('ligue 1');
    const matchesTop5 = TOP_5_LEAGUE_COUNTRIES.some((c) => (t as any).country === c || t.name?.includes(c)) || TOP_5_LEAGUES.some((l) => t.name?.includes(l));
    return isLeague && matchesTop5;
  }).length;

  // European Golden Shoes
  const goldenShoes = awardsList.filter(
    (a) => a.name?.toLowerCase().includes('golden shoe') || (a.name?.toLowerCase().includes('golden boot') && !a.name?.toLowerCase().includes('world cup'))
  ).length;

  // Supporting metrics
  const totalMatches = (stats.matchStats?.totalAppearances || stats.totalMatches || 0) + (player.internationalCaps || 0);
  const totalMvp = stats.totalMvpAwards || stats.mvpAwards || 0;
  const domesticCups = trophiesList.filter((t) => t.iconType === 'cup' || t.name?.toLowerCase().includes('cup') || t.name?.toLowerCase().includes('copa del rey') || t.name?.toLowerCase().includes('fa cup')).length;
  const otherIntlTrophies = (player.internationalTrophies || trophiesList).filter((t) => {
    const n = t.name?.toLowerCase() || '';
    return n.includes('copa américa') || n.includes('copa america') || n.includes('euro') || n.includes('finalissima') || n.includes('olympic') || n.includes('nations league');
  }).length;

  // Historic Records Progress Calculations:
  // 1. Calendar Year Goals (Max goals in any single season/year or recorded peak)
  let peakYearGoals = Math.max(0, stats.calendarYearGoalsRecord || stats.maxGoalsInYear || 0);
  seasons.forEach((s) => {
    const seasonG = (s.goals || 0) + (s.nationalTeamStats?.goals || 0);
    if (seasonG > peakYearGoals) peakYearGoals = seasonG;
  });
  if ((stats.currentSeasonGoals || 0) > peakYearGoals) {
    peakYearGoals = stats.currentSeasonGoals || 0;
  }

  // 2. Single Club Goals (Max goals for any single club)
  const clubGoalsMap: Record<string, number> = {};
  seasons.forEach((s) => {
    const clubName = s.teamName || player.club || 'Club';
    clubGoalsMap[clubName] = (clubGoalsMap[clubName] || 0) + (s.goals || 0);
  });
  if (player.club && stats.totalGoals) {
    clubGoalsMap[player.club] = Math.max(clubGoalsMap[player.club] || 0, stats.totalGoals);
  }
  let maxSingleClubGoals = Math.max(0, stats.singleClubGoalsRecord || 0, ...Object.values(clubGoalsMap));

  // 3. Most La Liga Goals
  let laLigaGoals = stats.laLigaGoals || 0;
  if (laLigaGoals === 0 && seasons.length > 0) {
    seasons.forEach((s) => {
      const isLaLiga = (s.competitionName && s.competitionName.toLowerCase().includes('liga')) ||
        (s.teamName && (s.teamName.includes('Barcelona') || s.teamName.includes('Madrid') || s.teamName.includes('Atlético') || s.teamName.includes('Sevilla') || s.teamName.includes('Valencia') || s.teamName.includes('Athletic') || s.teamName.includes('Betis') || s.teamName.includes('Real Sociedad') || s.teamName.includes('Villarreal')));
      if (isLaLiga) {
        laLigaGoals += (s.goals || 0);
      }
    });
  }
  if (laLigaGoals === 0 && (player.league === 'La Liga' || player.clubCountry === 'Spain')) {
    laLigaGoals = stats.totalGoals || 0;
  }

  // 4. Most La Liga Assists
  let laLigaAssists = stats.laLigaAssists || 0;
  if (laLigaAssists === 0 && seasons.length > 0) {
    seasons.forEach((s) => {
      const isLaLiga = (s.competitionName && s.competitionName.toLowerCase().includes('liga')) ||
        (s.teamName && (s.teamName.includes('Barcelona') || s.teamName.includes('Madrid') || s.teamName.includes('Atlético') || s.teamName.includes('Sevilla') || s.teamName.includes('Valencia') || s.teamName.includes('Athletic') || s.teamName.includes('Betis') || s.teamName.includes('Real Sociedad') || s.teamName.includes('Villarreal')));
      if (isLaLiga) {
        laLigaAssists += (s.assists || 0);
      }
    });
  }
  if (laLigaAssists === 0 && (player.league === 'La Liga' || player.clubCountry === 'Spain')) {
    laLigaAssists = stats.totalAssists || 0;
  }

  // 5. Most La Liga Hat-tricks
  let laLigaHatTricks = stats.laLigaHatTricks || stats.hatTricks || 0;
  if (laLigaHatTricks === 0 && (stats.matchStats?.hatTricks || stats.hatTricksCount)) {
    laLigaHatTricks = stats.matchStats?.hatTricks || stats.hatTricksCount || 0;
  }

  const getMetricValue = (id: string): number => {
    switch (id) {
      case 'world_cups':
        return worldCupWins;
      case 'champions_leagues':
        return uclWins;
      case 'ballon_dors':
        return ballonDors;
      case 'career_goals':
        return totalGoals;
      case 'career_assists':
        return totalAssists;
      case 'top5_league_titles':
        return top5LeagueTitles;
      case 'european_golden_shoes':
        return goldenShoes;
      case 'career_matches':
        return totalMatches;
      case 'mvp_awards':
        return totalMvp;
      case 'domestic_cups':
        return domesticCups;
      case 'other_international_trophies':
        return otherIntlTrophies;
      case 'calendar_year_goals_2012':
        return peakYearGoals;
      case 'single_club_goals':
        return maxSingleClubGoals;
      case 'la_liga_goals':
        return laLigaGoals;
      case 'la_liga_assists':
        return laLigaAssists;
      case 'la_liga_hat_tricks':
        return laLigaHatTricks;
      default:
        return 0;
    }
  };

  const requiredObjectives: ObjectiveProgress[] = REQUIRED_LEGEND_BENCHMARKS.map((b) => {
    const current = getMetricValue(b.id);
    const completed = current >= b.target;
    const surpassed = current >= b.target;
    return {
      ...b,
      current,
      completed,
      surpassed,
    };
  });

  const historicRecords: ObjectiveProgress[] = LEGEND_HISTORIC_RECORDS.map((r) => {
    const current = getMetricValue(r.id);
    const completed = current >= r.target;
    const surpassed = current >= r.target;
    return {
      ...r,
      current,
      completed,
      surpassed,
    };
  });

  const supportingObjectives: ObjectiveProgress[] = SUPPORTING_LEGEND_BENCHMARKS.map((b) => {
    const current = getMetricValue(b.id);
    const completed = current >= b.target;
    const surpassed = current >= b.target;
    return {
      ...b,
      current,
      completed,
      surpassed,
    };
  });

  const requiredSurpassed = requiredObjectives.filter((o) => o.surpassed).length;
  const historicSurpassed = historicRecords.filter((o) => o.surpassed).length;
  const storedBonusChampionPoints = getStoredChampionPoints();
  const championPointsEarned = requiredSurpassed + historicSurpassed + storedBonusChampionPoints;

  return {
    totalSurpassed: requiredSurpassed,
    totalRequired: REQUIRED_LEGEND_BENCHMARKS.length,
    totalHistoricRecordsSurpassed: historicSurpassed,
    totalHistoricRecords: LEGEND_HISTORIC_RECORDS.length,
    championPointsEarned,
    requiredObjectives,
    historicRecords,
    supportingObjectives,
  };
}

/**
 * Creates the official First Legend starting player card data (Age 16, OVR 80, Potential 99, Dribbling 99, Magnetic Feet)
 */
export function createFirstLegendPlayer(): PlayerCardData {
  const detailed: OutfieldDetailedStats = {
    pace: 85,
    stamina: 70,
    strength: 55,
    ballControl: 90,
    retention: 88,
    dribbling: 99, // Starting Dribbling: 99!
    shortPass: 82,
    longPass: 76,
    crossing: 78,
    shooting: 82,
    heading: 52,
    longShots: 78,
    tackling: 40,
    marking: 40,
    interceptions: 40,
    positioning: 80,
    composure: 86,
    reactions: 85,
  };

  return {
    id: 'legend-barcelona-argentina',
    name: "Barcelona & Argentina's Greatest",
    number: 10,
    shirtNumber: 10,
    age: 16,
    ovr: 80,
    potentialOvr: 99,
    internalPotentialOvr: 99,
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Inverted',
    preferredFoot: 'Left',
    weakFootStars: 4,
    freeStatPoints: 0,
    fame: 10,
    badReputation: 0,
    chemistry: 80,
    squadRole: 'Rotation Player',
    club: 'FC Barcelona',
    clubCountry: 'Spain',
    league: 'La Liga',
    startingCity: 'Rosario',
    countryCode: 'ARG',
    nationality: {
      code: 'ARG',
      iso: 'ar',
      name: 'Argentina',
    },
    otherNationalities: [
      {
        code: 'ESP',
        iso: 'es',
        name: 'Spain',
      },
    ],
    isProfessional: true,
    isLegend: true,
    stats: {
      pro: 90,
      def: 40,
      cre: 80,
      men: 75,
      goa: 80,
      phy: 65,
      detailed,
    },
    biometrics: {
      strength: 55,
      skinColor: '#f5d0b1',
      hairStyle: 'straight',
      hairLength: 'medium',
      hairRoot: '#2e1c0c',
      hairDye: 'none',
    },
    accessories: {
      accessory: 'none',
      headbandColor: '#ffffff',
      tattooNeck: 'none',
      tattooArmL: 'none',
      tattooArmR: 'none',
    },
    kit: {
      style: 'normal',
      color1: '#a50044', // Blaugrana Garnet
      color2: '#004d98', // Blaugrana Blue
      pattern: 'stripes',
      collar: 'crew',
    },
    emblem: {
      shape: 'crested-shield',
      mode: '3',
      color1: '#a50044',
      color2: '#004d98',
      color3: '#facc15',
    },
    customBio: "Barcelona and Argentina's Greatest Ever. Starting at FC Barcelona (Spain • La Liga) with dual Argentinean & Spanish nationality at age 16, 99 fixed potential, 99 dribbling and the legendary Magnetic Feet perk.",
    trophies: [],
    legendPerk: {
      name: 'MAGNETIC FEET',
      description: 'The ball is glued to your feet. You are nearly impossible to dispossess. Every dribble attempt receives 2× the normal success chance.',
    },
    legendChallenge: {
      title: 'Legend Challenge: Surpass the Greatest Ever',
      description: 'Try to build an even greater career than this legendary player across 7 official benchmarks.',
      objectives: REQUIRED_LEGEND_BENCHMARKS.map((b) => ({
        id: b.id,
        text: b.description,
        target: b.target,
        current: 0,
      })),
    },
    activePerkIds: ['magnetic_feet'],
  };
}

/**
 * Checks if a player has the special Legend perk: Magnetic Feet
 */
export function hasMagneticFeetPerk(player?: PlayerCardData | null): boolean {
  if (!player) return false;
  if (player.legendPerk?.name?.toUpperCase() === 'MAGNETIC FEET' || player.legendPerk?.name?.toUpperCase() === 'MAGNETIC BALL') {
    return true;
  }
  if (player.activePerkIds?.includes('magnetic_feet')) {
    return true;
  }
  return false;
}
