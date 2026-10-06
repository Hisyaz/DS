/**
 * Powerscale System Types & Interfaces
 * Governs dynamic heritage modifiers, club favorites, tournament prestige, and decay mechanics.
 */

export type PowerscaleTier =
  | 'heavyweight_favorite'
  | 'title_contender'
  | 'european_regular'
  | 'mid_table'
  | 'relegation_threat'
  | 'promoted_underdog';

export interface ClubPowerscaleProfile {
  teamId: string;
  teamName: string;
  leagueId: string;
  tier: PowerscaleTier;
  
  // Domestic League & Local Cup Modifiers
  baseLeagueModifier: number;        // Immutable baseline (e.g. 1.38 for Barcelona, 1.45 for PSG)
  currentLeagueModifier: number;     // Effective modifier after drought decay and performance adjustments
  yearsWithoutLeagueTitle: number;   // Drought counter (decay starts at 5+ years)
  leagueTitlesCount: number;         // Historical league titles
  lastLeagueTitleYear?: number;      // e.g. 2024
  
  // Continental Heritage (UCL, UEL, Libertadores, etc.)
  continentalTitlesCount: number;     // e.g. 15 for Real Madrid, 6 for Bayern/Liverpool, 5 for Barca
  baseContinentalModifier: number;   // Derived from historical titles (e.g. 2.5% per UCL title)
  currentContinentalModifier: number;// Effective continental modifier after drought decay
  yearsWithoutContinentalTitle: number;
  lastContinentalTitleYear?: number;

  // Performance Drift & Mean-Reversion
  performanceTrend: number;          // Range -3 to +3 (recent over/under-performance)
  isFirstSeasonPromoted: boolean;    // First season in top flight gets penalty (-8%)
  
  // Metadata for UI inspection
  favoriteTag?: string;              // E.g. "European Royalty", "Dominant Favorite", "Title Contender"
}

export interface NationalTeamPowerscaleProfile {
  countryCode: string;
  countryName: string;
  worldCupTitlesCount: number;       // Brazil 5, Germany 4, Italy 4, Argentina 3, France 2, Uruguay 2, England 1, Spain 1
  baseWorldCupModifier: number;      // Heritage boost
  currentWorldCupModifier: number;   // Dynamic modifier
  yearsWithoutWorldCup: number;
  lastWorldCupTitleYear?: number;
  favoriteTag?: string;
}

export interface PowerscaleSystemState {
  version: number;
  seasonYear: string;
  clubProfiles: Record<string, ClubPowerscaleProfile>;
  nationalProfiles: Record<string, NationalTeamPowerscaleProfile>;
  lastUpdated: string;
}

export interface MatchPowerscaleImpact {
  teamId: string;
  teamName: string;
  effectiveModifier: number;
  baseModifier: number;
  decayApplied: number;
  tier: PowerscaleTier;
  heritageStacks: number;
  isFavorite: boolean;
  label: string;
}
