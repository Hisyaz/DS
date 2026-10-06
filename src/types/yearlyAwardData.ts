/**
 * YEARLY AWARD DATA INFRASTRUCTURE TYPES
 * 
 * Lightweight data structures for preserving professional calendar-year data
 * across European season resets (June reset vs. December awards).
 * 
 * Flow: Professional Match → World Results → Yearly Aggregate → December Awards → Permanent Award Result → Delete Aggregate
 */

export type ProfessionalCompetitionType =
  | 'league'
  | 'domestic_cup'
  | 'continental'
  | 'supercup'
  | 'international';

export interface CompetitionStatSummary {
  competitionId: string;
  competitionName: string;
  competitionType: ProfessionalCompetitionType;
  matches: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  cleanSheets: number;
}

export interface PlayerYearlyAggregateStats {
  playerId: string;
  calendarYear: number;
  playerName: string;
  teamId: string;
  teamName: string;
  countryCode: string;
  position: string;
  subPosition?: string;
  ovr: number;
  age?: number;
  isUserPlayer?: boolean;

  // Professional appearances & playing time
  appearances: number;
  starts: number;
  minutes: number;

  // Key performance statistics
  goals: number;
  assists: number;

  // Rating aggregate
  totalRating: number;
  ratingCount: number;
  avgRating: number;

  // Relevant existing professional award statistics
  cleanSheets: number;
  defensiveStops: number;
  yellowCards: number;
  redCards: number;
  mvpCount: number; // Man of the match count

  // International professional statistics
  intlAppearances: number;
  intlStarts: number;
  intlMinutes: number;
  intlGoals: number;
  intlAssists: number;
  intlCleanSheets: number;
  intlTrophies: string[];

  // Team trophies & achievements won in this calendar year
  teamTrophies: string[];
  individualAchievements: string[];

  // Lightweight competition breakdown (useful for weighted award models)
  competitions: Record<string, CompetitionStatSummary>;

  // Internal deduplication guard: tracks processed match IDs to prevent duplicate counting
  processedMatchIds?: string[];
}

export interface YearlyAwardCompetitionWinners {
  domesticChampions: Record<string, string>; // leagueId -> championTeamName
  domesticCupWinners: Record<string, string>; // cupId/country -> winnerTeamName
  continentalChampions: Record<string, string>; // compId -> championTeamName (e.g. ucl -> Real Madrid)
  internationalChampions: Record<string, string>; // compId -> countryName (e.g. world_cup -> Argentina)
  internationalRunnersUp?: Record<string, string>; // compId -> countryName / code
  internationalMVPs?: Record<string, { name: string; nationCode: string }>;
  internationalTopScorers?: Record<string, { name: string; nationCode: string; goals: number }>;
  internationalBestAssisters?: Record<string, { name: string; nationCode: string; assists: number }>;
}

export interface YearlyAwardData {
  calendarYear: number;
  players: Record<string, PlayerYearlyAggregateStats>; // Keyed by canonical PlayerID
  competitionWinners: YearlyAwardCompetitionWinners;
  teamTrophies: Record<string, string[]>; // teamId -> list of trophies won in this calendar year
  createdAt: number;
  lastUpdated: number;
}
