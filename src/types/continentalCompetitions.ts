import { PlayerCardData } from '../types';
import { ContinentalFederation } from './competitionEditor';
import { EditorTeamData } from './leagueEditor';

export type ContinentalCompetitionId =
  | 'UEFA_CL'
  | 'UEFA_EL'
  | 'UEFA_ECL'
  | 'UEFA_SC'
  | 'CONMEBOL_LIB'
  | 'CONMEBOL_SUD'
  | 'CONMEBOL_REC'
  | 'CONCACAF_CC'
  | 'CONCACAF_CAC'
  | 'AFC_CL'
  | 'AFC_CUP'
  | 'CAF_CL'
  | 'CAF_CONFED_CUP'
  | 'CAF_SC'
  | 'OFC_CL';

export interface ContinentalCompetitionMeta {
  id: ContinentalCompetitionId;
  name: string;
  shortName: string;
  federation: ContinentalFederation;
  tier: 1 | 2 | 3 | 'supercup';
  format: '36_league_phase_knockout' | '32_groups_knockout' | 'supercup_single' | 'knockout_tournament';
  minTeamsRequired: number;
  bannerColor: string;
  accentColor: string;
  iconType: 'star' | 'trophy' | 'shield' | 'globe' | 'crown';
  isSuperCup?: boolean;
  superCupPair?: {
    primaryCompId: ContinentalCompetitionId;
    secondaryCompId: ContinentalCompetitionId;
  };
}

export interface ContinentalClubRegistration {
  teamId: string;
  teamName: string;
  competitionId: ContinentalCompetitionId;
  season: number;
  registeredPlayerIds: string[];
  registeredPlayers: {
    id: string;
    name: string;
    position: string;
    ovr: number;
    isUserPlayer?: boolean;
  }[];
  midSeasonChangesUsed: number;
  isComplete: boolean;
}

export interface ContinentalGroupStanding {
  teamId: string;
  teamName: string;
  countryCode?: string;
  isPlayerTeam: boolean;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  teamOvr: number;
  rank?: number;
  qualifiedKnockout?: boolean;
  qualifiedPlayoffs?: boolean;
  eliminated?: boolean;
  transferredToSecondaryComp?: boolean;
}

export type ContinentalStageType =
  | 'group'
  | 'league_phase'
  | 'knockout_playoffs'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'final'
  | 'supercup';

export interface ContinentalMatchResult {
  id: string; // Permanent Unique Match ID e.g. fix_UEFA_CL_2026_md1_real_vs_milan
  competitionId: ContinentalCompetitionId;
  seasonYear: number;
  stage: ContinentalStageType;
  stageName: string;
  matchdayIndex?: number;
  dateStr?: string; // Calendar date e.g. "16 September 2026"
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  homePenalties?: number;
  awayPenalties?: number;
  isPlayerMatch: boolean;
  isCompleted: boolean;
  isKeyMatch?: boolean;
  playerMinutes?: number;
  playerGoals?: number;
  playerAssists?: number;
  playerRating?: number;
  playerIsMvp?: boolean;
  playerYellow?: boolean;
  playerRed?: boolean;
}

export interface ContinentalKnockoutTie {
  id: string;
  stage: 'knockout_playoffs' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'supercup';
  stageName: string;
  teamA: { id: string; name: string; ovr: number; isPlayer: boolean; countryCode?: string; seedRank?: number };
  teamB: { id: string; name: string; ovr: number; isPlayer: boolean; countryCode?: string; seedRank?: number };
  leg1?: ContinentalMatchResult;
  leg2?: ContinentalMatchResult;
  aggregateHomeScore?: number;
  aggregateAwayScore?: number;
  winnerTeamId?: string;
  winnerTeamName?: string;
}

export interface ContinentalGroup {
  id: string;
  groupLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  teams: { id: string; name: string; ovr: number; isPlayer: boolean; countryCode?: string; seedingPot?: number }[];
  standings: ContinentalGroupStanding[];
  fixtures: ContinentalMatchResult[];
  isCompleted: boolean;
}

export interface ContinentalFinalVenue {
  city: string;
  country: string;
  stadium: string;
  capacity: number;
}

export interface ContinentalQualificationEntry {
  teamId: string;
  teamName: string;
  countryCode: string;
  countryName?: string;
  sourceType: 'domestic_champion' | 'league_rank' | 'domestic_cup_winner' | 'defending_champion' | 'continental_pool';
  sourceDescription: string;
  competitionId: ContinentalCompetitionId;
  seedingPot: 1 | 2 | 3 | 4 | 5 | 6;
  teamOvr: number;
}

export interface ContinentalRivalFixture {
  opponentId: string;
  opponentName: string;
  opponentOvr: number;
  opponentCountryCode?: string;
  isHome: boolean;
  matchdayIndex: number;
  opponentPot: number;
  fixtureId: string;
  completed?: boolean;
  homeScore?: number;
  awayScore?: number;
}

export interface ContinentalLeagueRivalInfo {
  rivalTeamId: string;
  rivalTeamName: string;
  rivalOvr: number;
  countryCode?: string;
  rivalPot: number;
  venue: 'HOME' | 'AWAY';
  matchdayIndex: number;
  fixtureId: string;
}

export interface ContinentalTournamentSeasonState {
  competitionId: ContinentalCompetitionId;
  seasonYear: number;
  isPlayable: boolean;
  unplayableReason?: string;
  drawGeneratedTimestamp: number;
  isDrawCompleted: boolean;
  participatingTeamIds: string[];
  qualifiers?: ContinentalQualificationEntry[];
  pots?: {
    pot1: ContinentalQualificationEntry[];
    pot2: ContinentalQualificationEntry[];
    pot3: ContinentalQualificationEntry[];
    pot4: ContinentalQualificationEntry[];
    pot5?: ContinentalQualificationEntry[];
    pot6?: ContinentalQualificationEntry[];
  };
  groups: ContinentalGroup[];
  // League Phase structure (36 teams Swiss Table)
  isLeaguePhaseFormat?: boolean;
  leaguePhaseStandings?: ContinentalGroupStanding[];
  leaguePhaseFixtures?: ContinentalMatchResult[];
  teamRivals?: Record<string, ContinentalLeagueRivalInfo[]>;
  currentMatchdayIndex?: number;
  currentMatchday?: number;
  totalLeagueMatchdays?: number;
  leaguePhaseCurrentMatchday?: number;
  leaguePhaseTotalMatchdays?: number;
  // Knockout stage
  knockoutPlayoffTies?: ContinentalKnockoutTie[];
  r16Ties?: ContinentalKnockoutTie[];
  qfTies?: ContinentalKnockoutTie[];
  sfTies?: ContinentalKnockoutTie[];
  finalTie?: ContinentalKnockoutTie;
  finalVenue?: ContinentalFinalVenue;
  legendaryTitle?: string;
  currentStage:
    | 'draw'
    | 'league_phase'
    | 'group_stage'
    | 'knockout_playoffs'
    | 'round_of_16'
    | 'quarter_finals'
    | 'semi_finals'
    | 'final'
    | 'completed'
    | 'finished';
  championTeamId?: string;
  championTeamName?: string;
  runnerUpTeamId?: string;
  runnerUpTeamName?: string;
  isPlayerClubParticipant: boolean;
  playerClubStageReached?: string;
  playerClubIsChampion?: boolean;
  playerRegisteredForContinental?: boolean;
}

export interface SuperCupSeasonState {
  id: ContinentalCompetitionId;
  name: string;
  seasonYear: number;
  teamA: { id: string; name: string; ovr: number; isPlayer: boolean; title: string };
  teamB: { id: string; name: string; ovr: number; isPlayer: boolean; title: string };
  match?: ContinentalMatchResult;
  isCompleted: boolean;
  winnerTeamId?: string;
  winnerTeamName?: string;
}
