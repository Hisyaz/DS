import { Nationality, PlayerCardData } from '../types';
import { NationalTeamTier, Confederation, InternationalCallUp } from './nationalTeam';

export type FifaWindowType =
  | 'U17_POST_SEASON_QUALIFIERS'
  | 'U17_POST_SEASON_WORLD_CUP'
  | 'U20_POST_SEASON_QUALIFIERS'
  | 'U20_POST_SEASON_WORLD_CUP'
  | 'SENIOR_AUTUMN_WINDOW_1'
  | 'SENIOR_AUTUMN_WINDOW_2'
  | 'SENIOR_SPRING_WINDOW'
  | 'SENIOR_CONTINENTAL_FINAL_STAGE'
  | 'SENIOR_WORLD_CUP_FINAL_STAGE'
  | 'INTERNATIONAL_FRIENDLIES';

export interface MatchCommentaryItem {
  minute: number;
  text: string;
  type: 'goal' | 'chance' | 'tackle' | 'foul' | 'general' | 'whistle';
}

export interface InternationalMatchPlayerStats {
  minutes: number;
  goals: number;
  assists: number;
  shots: number;
  passes: number;
  tackles: number;
  matchRating: number;
  mvpStatus?: string;
}

export interface InternationalFixture {
  id: string;
  matchNumber: number;
  stageMatchday?: number;
  stageName: string;
  competitionName: string;
  windowLabel?: string;
  homeNation: {
    code: string;
    name: string;
    iso: string;
    ovr: number;
    manager?: string;
  };
  awayNation: {
    code: string;
    name: string;
    iso: string;
    ovr: number;
    manager?: string;
  };
  isPlayerMatch: boolean;
  isPlayerHome: boolean;
  isPlayed: boolean;
  homeScore?: number;
  awayScore?: number;
  playerStats?: InternationalMatchPlayerStats;
  commentaryLogs?: MatchCommentaryItem[];
  isKnockout?: boolean;
  extraTime?: boolean;
  penaltiesHome?: number;
  penaltiesAway?: number;
}

export interface InternationalStandingRow {
  nationCode: string;
  nationName: string;
  iso: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualified: boolean;
  isPlayerNation: boolean;
}

export interface InternationalTournamentHubState {
  id: string;
  tier: NationalTeamTier;
  seasonYear: number;
  competitionType: 'qualifier' | 'tournament';
  competitionName: string;
  shortName: string;
  confederation: Confederation;
  hostCountry: string;
  isWorldCup: boolean;
  isContinental: boolean;
  callingNation: Nationality;
  playerRole: 'Key Starter' | 'Squad Player' | 'Promising Prospect';
  managerName: string;
  managerTactic: string;
  windowLabel: string;
  fixtures: InternationalFixture[];
  currentFixtureIndex: number;
  standings: InternationalStandingRow[];
  isKnockoutStageActive: boolean;
  knockoutStages: string[];
  currentKnockoutStageIndex: number;
  currentKnockoutOpponent?: {
    code: string;
    name: string;
    iso: string;
    ovr: number;
  };
  isFinished: boolean;
  playerQualified: boolean;
  playerFinishStage?: string;
  champion?: {
    name: string;
    code: string;
    iso: string;
  };
  newsHeadline: string;
  newsSummary: string;
  totalGoals: number;
  totalAssists: number;
  capsGained: number;
  drawId?: string;
  drawGroupLetter?: string;
  allGroups?: {
    groupLetter: string;
    groupName: string;
    teams: { code: string; name: string; iso: string; ovr: number; isPlayerNation?: boolean }[];
    standings: InternationalStandingRow[];
  }[];
  activeMatchResult?: {
    fixture: InternationalFixture;
    playerRating: number;
    xpGained: number;
    fameGained: number;
  };
}
