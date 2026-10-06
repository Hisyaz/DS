import { TrophyItem } from '../types';

export interface CareerMatchBreakdown {
  totalMatches: number;
  youthMatches: number;
  proMatches: number;
  domesticMatches: number;
  continentalMatches: number;
  internationalMatches: number;
  cupMatches: number;
  otherMatches: number;
}

export interface SeasonCompetitionRecord {
  competitionName: string;
  competitionType: 'league' | 'cup' | 'continental' | 'national_team' | 'youth_cup' | 'other';
  matches: number;
  minutes: number;
  goals: number;
  assists: number;
  mvps: number;
  avgRating: number;
  cleanSheets?: number;
  yellowCards?: number;
  redCards?: number;
  standingRank?: number;
  stageReached?: string; // e.g. "Champions 🏆", "Final 🥈", "Semi-Final", "Quarter-Final", "Group Stage", "Qualified"
  wonTrophy?: boolean;
  topScorerRank?: number; // 1 to 5 if top 5
  topAssistRank?: number; // 1 to 5 if top 5
  trophiesWon?: string[];
  awardsWon?: string[];
}

export interface SeasonTeamStandingsSummary {
  league?: {
    name: string;
    rank: number;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalDifference: number;
    status: string;
  };
  domesticCup?: {
    name: string;
    roundReached: string;
    isWinner: boolean;
  };
  continentalCup?: {
    name: string;
    roundReached: string;
    isWinner: boolean;
  };
  nationalTeam?: {
    teamName: string;
    competitionName: string;
    roundOrStatus: string;
    matchesPlayed: number;
    goals: number;
    assists: number;
    isWinner: boolean;
  };
}

export interface CareerSeasonRecord {
  seasonYear: string; // e.g., "2026/27"
  age: number;
  teamName: string;
  squadLevel: 'U17' | 'U20' | 'Reserves' | 'First Team' | 'Youth' | string;
  competitionName: string;
  isYouth: boolean;
  matches: number;
  minutesPlayed?: number; // Total minutes on pitch this season
  goals: number;
  assists: number;
  mvps?: number; // MVP of the match awards earned
  avgRating: number;
  cleanSheets?: number;
  yellowCards?: number;
  redCards?: number;
  trophiesWon: string[];
  awardsWon: string[];
  competitions?: SeasonCompetitionRecord[]; // Breakdown by competition
  standingsSummary?: SeasonTeamStandingsSummary;
  topScorerRank?: number; // 1-5 rank in league/campaign if top 5
  topAssistRank?: number; // 1-5 rank in assists if top 5
  salaryAnnual?: number;
  sponsorsIncome?: number;
  statsGained?: string[] | Record<string, number>;
  ovrStart?: number;
  ovrEnd?: number;
  standingRank?: number;
  promoted?: boolean;
  relegated?: boolean;
  qualificationOutcome?: string;
  keyHighlight?: string;
}

export interface CareerTeamRecord {
  id: string;
  teamName: string;
  country: string;
  squadLevel: 'U17' | 'U20' | 'Reserves' | 'First Team';
  seasonsSpent: number;
  matches: number;
  goals: number;
  assists: number;
  isYouthClub?: boolean;
}

export interface CareerTransferRecord {
  id: string;
  previousClub: string;
  newClub: string;
  seasonYear: string;
  transferFeeEuros: number; // e.g. 5000000
  formattedFee: string; // e.g. "€5,000,000"
  transferType: 'Transfer Fee' | 'Free Transfer' | 'Loan' | 'Return from Loan';
}

export interface CareerAwardRecord {
  id: string;
  awardName: string;
  seasonYear: string;
  teamName: string;
  competitionName: string;
  category?: 'top_scorer' | 'top_assist' | 'best_player' | 'best_young_player' | 'ballon_dor' | 'golden_boot' | 'other';
}

export interface PeakMarketValueRecord {
  valueEuros: number;
  formattedValue: string;
  age: number;
  clubName: string;
  ovrAtPeak: number;
  fameAtPeak: number;
  year?: string;
}

export interface PeakOvrRecord {
  ovr: number;
  age: number;
  clubName: string;
  year?: string;
}

export interface CareerTimelineEvent {
  id: string;
  age: number;
  year: string;
  title: string;
  description: string;
  category: 'youth' | 'contract' | 'trophy' | 'transfer' | 'peak' | 'retirement' | 'milestone';
}

export interface FarewellMatchResult {
  choice: 'glory' | 'torch'; // Try the Impossible or Pass the Torch
  choiceTitle: string; // "Try The Impossible" | "Pass It To The Next Generation"
  succeeded: boolean;
  inheritorName?: string; // Young teammate symbolic inheritor
  commentary: string; // Final commentary excerpt
  finalMatchScore: string; // e.g., "3 - 2"
  finalMatchGoals: number;
  finalMatchAssists: number;
  finalMatchRating: number;
  date: string;
}

export type PotentialOutcomeClassification =
  | 'REACHED POTENTIAL'
  | 'CURRENTLY AT POTENTIAL'
  | 'EXCEEDED POTENTIAL'
  | 'DID NOT REACH POTENTIAL';

export type LegacyClassification =
  | 'Iconic'
  | 'Legendary'
  | 'Gold'
  | 'Silver'
  | 'Bronze'
  | 'White';

export interface FameTitleDetails {
  title: LegacyClassification;
  badge: string;
  colorClass: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  description: string;
  fameRequired: string;
}

export interface FullCareerHistory {
  startingAge: number;
  retirementAge: number;
  startingClub: string;
  finalClub: string;
  totalDurationYears: number;
  startingOvr: number; // Always 88 baseline
  peakOvr: PeakOvrRecord;
  finalOvr: number;
  startingPotential: number;
  peakPotential: number;
  potentialOutcome: PotentialOutcomeClassification;
  ovrGrowth: number; // Peak OVR - Starting OVR (88)
  finalFame: number;
  finalBadReputation: number;
  
  matchStats: CareerMatchBreakdown;
  totalGoals: number;
  totalAssists: number;
  
  // Records
  mostGoalsSingleSeason: { count: number; season: string };
  mostAssistsSingleSeason: { count: number; season: string };
  bestScoringSeason: { goals: number; season: string; club: string };
  bestRatedSeason: { rating: number; season: string; club: string };
  highestSingleMatchRating: number;
  longestScoringStreakMatches: number;
  mostConsecutiveAppearances: number;
  mostTrophiesSingleSeason: { count: number; season: string };
  
  teamsRepresented: CareerTeamRecord[];
  seasonsPlayed: CareerSeasonRecord[];
  trophiesWon: TrophyItem[];
  youthTitlesWon: string[];
  individualAwards: CareerAwardRecord[];
  transfersHistory: CareerTransferRecord[];
  totalTransferFeesPaid: number; // Sum of transfer fees
  formattedTotalTransferFeesPaid: string;
  peakMarketValue: PeakMarketValueRecord;
  
  timeline: CareerTimelineEvent[];
  narrativeLegacy: string;
  farewellResult?: FarewellMatchResult;
  legacyClassification: LegacyClassification;
}
