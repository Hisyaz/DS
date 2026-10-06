import { MainPosition, WorldXISelection } from './individualAwards';

export interface CompetitionStatBreakdown {
  competitionId: string;
  competitionName: string;
  competitionType: 'league' | 'domestic_cup' | 'continental' | 'international' | 'supercup' | 'other';
  matches: number;
  goals: number;
  assists: number;
  avgRating: number;
  cleanSheets?: number;
}

export interface YearlyPlayerStatsRecord {
  playerId: string; // Canonical PlayerID
  playerName: string;
  teamId: string;
  teamName: string;
  countryCode: string;
  mainPosition: MainPosition;
  subPosition?: string;
  ovr: number;
  age: number;
  isUserPlayer: boolean;
  
  // Aggregate Yearly Statistics across all blocks and competitions
  goals: number;
  assists: number;
  avgRating: number;
  matchesPlayed: number;
  cleanSheets: number;

  // Breakdown by individual competitions
  competitionAppearances: Record<string, CompetitionStatBreakdown>;

  // Honors and Trophies Won in this Yearly Period
  majorTrophies: string[];
  domesticTrophies: string[];
  europeanTrophies: string[];
  internationalTrophies: string[];

  // Player Merits (e.g. League Champion, UCL Winner, Golden Boot, Domestic Cup Winner)
  merits: string[];

  // Canonical Year Key (e.g., "2026/27" or "2026")
  yearKey: string;
  updatedAt: number;
}

export interface Top30Entry {
  rank: number;
  playerId: string; // Authoritative PlayerID
  name: string;
  teamId: string; // Authoritative TeamID
  teamName: string;
  countryCode: string;
  mainPosition: MainPosition;
  ovr: number;
  value: number; // Primary metric: goals, assists, rating, or Ballon d'Or points
  secondaryStats: {
    goals: number;
    assists: number;
    matches: number;
    avgRating: number;
    cleanSheets?: number;
  };
  relevantCompetitions: string[];
  relevantTrophiesAndMerits: string[];
  isUserPlayer: boolean;

  // Ballon d'Or Specific
  points?: number;
  pointsBreakdown?: string[];
  isWinner?: boolean;
}

export interface CompetitionWinnersSummary {
  uclWinner?: string;
  uclWinnerTeamId?: string;
  uelWinner?: string;
  uelWinnerTeamId?: string;
  ueclWinner?: string;
  ueclWinnerTeamId?: string;
  libertadoresWinner?: string;
  libertadoresWinnerTeamId?: string;
  sudamericanaWinner?: string;
  sudamericanaWinnerTeamId?: string;
  worldCupWinner?: string;
  worldCupWinnerCode?: string;
  domesticChampions: Record<string, string>; // leagueId -> championTeamName
  domesticCupWinners: Record<string, string>; // leagueId/country -> cupWinnerTeamName
}

export interface YearlyHistoricalRecord {
  seasonYear: string;
  calendarYear: number;
  winnerPlayerId: string;
  winnerName: string;
  winnerTeamId: string;
  winnerTeamName: string;
  winnerOvr: number;
  winnerPoints: number;
  winnerBreakdown: string[];

  // Top 30 Lists
  top30Goalscorers: Top30Entry[];
  top30AssistProviders: Top30Entry[];
  top30RatedPlayers: Top30Entry[];
  ballonDorRankings: Top30Entry[]; // Top 30 Ballon d'Or Nominees with points

  // Major Individual Honors
  goldenBootWinner: Top30Entry;
  bestStrikerWinner?: any;
  europeanGoldenShoeWinner?: any;
  goldenCreatorWinner: Top30Entry;
  yearlyXI: WorldXISelection;
  bestGoalkeeperWinner?: any;
  bestDefenderWinner?: any;
  bestMidfielderWinner?: any;
  bestAttackerWinner?: any;
  bestYoungPlayerWinner?: any;
  bestManagerWinner?: any;

  // Global Context & Merits
  majorMerits: string[];
  majorTrophies: string[];
  relevantCompetitionWinners: CompetitionWinnersSummary;
  timestamp: number;
}

export * from './yearlyAwardData';
