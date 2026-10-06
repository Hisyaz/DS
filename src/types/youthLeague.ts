export type YouthCategory =
  | 'U10'
  | 'U11'
  | 'U12'
  | 'U13'
  | 'U14'
  | 'U15'
  | 'U16';

export type FederationName = 'UEFA' | 'CONMEBOL' | 'CAF' | 'AFC' | 'OFC' | 'CONCACAF';

export interface RepresentativePlayer {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'ATT';
  ovr: number;
  country: string;
}

export interface InternationalYouthClub {
  id: string;
  name: string;
  country: string;
  federation: FederationName;
  flag: string;
  primaryColor: string;
  secondaryColor: string;
  preferredFormation: string;
  teamOvr: number;
  attOvr: number;
  midOvr: number;
  defOvr: number;
  representativePlayers: RepresentativePlayer[];
  sourceType: 'youth_league' | 'federation_pool';
}

export type QualificationStatusType =
  | 'ucl' // UEFA Champions League
  | 'uel' // UEFA Europa League
  | 'uecl' // UEFA Conference League
  | 'libertadores' // Copa Libertadores
  | 'sudamericana' // Copa Sudamericana
  | 'afc_elite' // AFC Champions League Elite
  | 'afc_two' // AFC Champions League Two
  | 'caf_cl' // CAF Champions League
  | 'concacaf_cc' // CONCACAF Champions Cup
  | 'promotion_auto' // Automatic promotion (D2 -> D1)
  | 'promotion_playoff' // Promotion Playoff
  | 'relegation_playoff' // Relegation Playoff
  | 'relegation_direct' // Direct Relegation (D1 -> D2 or D2 -> D3)
  | 'youth_intl_cup' // Youth International Cup
  | 'none';

export interface QualificationBadge {
  type?: QualificationStatusType;
  label: string;
  shortLabel?: string;
  badgeClass?: string;
  color?: string;
  iconName?: 'trophy' | 'arrow-up' | 'arrow-down' | 'playoff' | 'star' | 'globe' | 'shield' | string;
}

export interface YouthLeagueStanding {
  rank: number;
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isPlayerTeam: boolean;
  qualifiedForIntCup: boolean;
  teamOvr: number;
  qualificationBadge?: QualificationBadge | any;
  qualificationText?: string;
  promoted?: boolean;
  relegated?: boolean;
  inPlayoff?: boolean;
  qualifiedContinental?: 'ucl' | 'uel' | 'uecl' | 'libertadores' | 'sudamericana' | string | boolean | null;
  qualifiedContinentalCompId?: string | null;
}

export interface GroupStageGroup {
  groupName: string; // 'Group A', 'Group B', ...
  teams: InternationalYouthClub[];
  standings: {
    clubId: string;
    clubName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    points: number;
  }[];
}

export interface KnockoutStageMatch {
  matchId: string;
  stageName: 'Round of 16' | 'Quarter Final' | 'Semi Final' | 'Third-Place Match' | 'Final';
  homeTeam: InternationalYouthClub;
  awayTeam: InternationalYouthClub;
  homeScore?: number;
  awayScore?: number;
  isPlayerMatch: boolean;
  winnerClubId?: string;
}

export type TrainingGroup = 'PHY' | 'PRO' | 'CRE' | 'SCO' | 'DEF' | 'MEN';

export interface TrainingGroupDefinition {
  id: TrainingGroup;
  name: string;
  code: string;
  stats: string[];
  description: string;
  iconName: string;
}

export interface YouthManagerRoleProposal {
  proposedPosition: string;
  subPosition: string;
  playstyle: string;
  warningNote: string;
  allowedSubPositions: string[];
}

export interface YouthSeasonStats {
  gamesPlayed: number;
  matches?: number;
  minutesPlayed?: number; // Total minutes on pitch
  goals: number;
  assists: number;
  avgRating: number;
  matchRatingAvg?: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  injuryMatchesMissed: number;
  mvps?: number;
}

export interface YouthSeasonAwards {
  topScorer: boolean;
  topAssist: boolean;
  bestPlayer: boolean;
  leagueWinner: boolean;
  topScorerRank?: number; // 1 to 5
  topAssistRank?: number; // 1 to 5
  topScorerName?: string;
  topAssistName?: string;
  mvpName?: string;
  totalFameGained: number;
}

export interface NewspaperArticle {
  headline: string;
  content: string;
  date: string;
  category: 'team' | 'player';
  imageStyle: string;
}

export interface NewspaperArticles {
  teamArticle: NewspaperArticle;
  playerArticle?: NewspaperArticle;
}

export interface TournamentMatch {
  matchId: string;
  stageName: string;
  opponentName: string;
  opponentOvr: number;
  teamScore: number;
  opponentScore: number;
  playerGoals: number;
  playerAssists: number;
  playerRating: number;
  isWinner: boolean;
}

export interface InternationalTournamentResult {
  qualified: boolean;
  teamFinish: string;
  matches: TournamentMatch[];
  awards: {
    topScorer: boolean;
    topAssist: boolean;
    bestPlayer: boolean;
    winner: boolean;
    fameGained: number;
  };
}

export interface YouthSeasonSummaryData {
  seasonYear: string;
  clubName: string;
  age: number;
  category: YouthCategory;
  stats: YouthSeasonStats;
  awards: YouthSeasonAwards;
  newspaper: NewspaperArticles;
  tournament?: InternationalTournamentResult;
}
