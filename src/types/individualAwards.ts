import { Top30Entry, YearlyHistoricalRecord } from './yearlyAwards';

export type MainPosition = 'GK' | 'DEF' | 'MID' | 'ATT';

export interface BaseNominee {
  id: string;
  name: string;
  club: string;
  countryCode: string;
  nationalityName?: string;
  mainPosition: MainPosition;
  subPosition?: string;
  ovr: number;
  isUserPlayer?: boolean;
}

export interface EuropeanGoldenBootEntry extends BaseNominee {
  rank: number;
  goals: number;
  leagueId: string;
  leagueName: string;
  leagueFactor: number;
  weightedPoints: number;
  isWinner: boolean;
}

export interface BestStrikerNominee extends BaseNominee {
  rank: number;
  goals: number;
  assists: number;
  matches: number;
  avgRating: number;
  attackingScore: number;
  pointsBreakdown: string[];
  isWinner: boolean;
}

export interface EuropeanGoldenShoeEntry extends BaseNominee {
  rank: number;
  domesticLeagueGoals: number;
  goals: number;
  leagueId: string;
  leagueName: string;
  countryCode: string;
  associationRank: number;
  coefficient: number; // 2.0, 1.5, or 1.0
  weightedPoints: number; // domesticLeagueGoals * coefficient
  points: number;
  isWinner: boolean;
}

export interface GoldenCreatorEntry extends BaseNominee {
  rank: number;
  assists: number;
  leagueId: string;
  leagueName: string;
  leagueFactor: number;
  weightedPoints: number;
  isWinner: boolean;
}

export interface DomesticLeaderboardEntry {
  rank: number;
  playerName: string;
  clubName: string;
  value: number; // goals, assists, or avgRating
  isPlayer: boolean;
  countryCode?: string;
}

export interface DomesticLeagueAwards {
  leagueId: string;
  leagueName: string;
  domesticTopScorerTrophyName: string;
  topScorerWinner: DomesticLeaderboardEntry;
  topScorers: DomesticLeaderboardEntry[];
  topAssistsWinner: DomesticLeaderboardEntry;
  topAssists: DomesticLeaderboardEntry[];
  bestPlayerWinner: DomesticLeaderboardEntry;
  topRatings: DomesticLeaderboardEntry[];
  bestYoungPlayerWinner?: DomesticLeaderboardEntry & { age?: number; ovr?: number };
  topYoungPlayers?: (DomesticLeaderboardEntry & { age?: number; ovr?: number })[];
  leagueBestXI?: WorldXISelection;
  bestGoalkeeperWinner?: {
    playerName: string;
    clubName: string;
    cleanSheets: number;
    goalsConceded: number;
    isPlayer: boolean;
  };
}

export interface SquadLeagueAwards {
  squadLevel: 'U17' | 'U20' | 'Reserves' | string;
  leagueName: string;
  topScorerWinner: { playerName: string; clubName: string; value: number; isPlayer: boolean };
  topAssistsWinner: { playerName: string; clubName: string; value: number; isPlayer: boolean };
  bestGoalkeeperWinner: { playerName: string; clubName: string; cleanSheets: number; goalsConceded: number; isPlayer: boolean };
  bestPlayerWinner: { playerName: string; clubName: string; value: number; isPlayer: boolean };
}

export interface WorldXICandidate extends BaseNominee {
  points: number;
  pointsBreakdown: string[];
  selected: boolean;
  selectedRole?: string;
}

export type WorldXIFormation = '3-4-3' | '3-5-2' | '4-3-3' | '4-4-2';

export interface WorldXISelection {
  formation: WorldXIFormation;
  defCount: number;
  midCount: number;
  attCount: number;
  goalkeeper: WorldXICandidate;
  defenders: WorldXICandidate[];
  midfielders: WorldXICandidate[];
  attackers: WorldXICandidate[];
  allEleven: WorldXICandidate[];
}

export interface BallonDorNominee extends BaseNominee {
  rank: number;
  points: number;
  pointsBreakdown: string[];
  isWinner: boolean;
}

export interface GoldenBoyNominee extends BaseNominee {
  rank: number;
  age: number;
  tier: 'Gold' | 'Silver' | 'Bronze' | 'Nominee';
  isWinner: boolean;
}

export interface YashinNominee extends BaseNominee {
  rank: number;
  points: number;
  pointsBreakdown: string[];
  isWinner: boolean;
}

export interface PositionalAwardNominee extends BaseNominee {
  rank: number;
  points: number;
  pointsBreakdown: string[];
  isWinner: boolean;
  statSummary?: string;
  cleanSheets?: number;
  goals?: number;
  assists?: number;
  avgRating?: number;
}

export interface ManagerAwardNominee {
  id: string;
  name: string;
  club: string;
  countryCode: string;
  rank: number;
  points: number;
  pointsBreakdown: string[];
  isWinner: boolean;
  trophiesWon: string[];
}

export interface WorldAwardsSeasonResults {
  seasonYear: string;
  calendarYear?: number;
  europeanGoldenBoot: EuropeanGoldenBootEntry[]; // Retained for compatibility, holds Best Striker entries
  bestStriker?: BestStrikerNominee[];
  europeanGoldenShoe?: EuropeanGoldenShoeEntry[];
  goldenCreator: GoldenCreatorEntry[];
  domesticAwards: DomesticLeagueAwards;
  ballonDor: BallonDorNominee[];
  goldenBoy: GoldenBoyNominee[];
  yashinTrophy: YashinNominee[];
  bestGoalkeeper?: YashinNominee[];
  bestDefender?: PositionalAwardNominee[];
  bestMidfielder?: PositionalAwardNominee[];
  bestAttacker?: PositionalAwardNominee[];
  bestYoungPlayer?: GoldenBoyNominee[];
  bestManager?: ManagerAwardNominee[];
  worldXI: WorldXISelection;
  revealed: boolean;
  top30Goalscorers?: Top30Entry[];
  top30AssistProviders?: Top30Entry[];
  top30RatedPlayers?: Top30Entry[];
  top30BallonDor?: Top30Entry[];
  historicalRecord?: YearlyHistoricalRecord;
}
