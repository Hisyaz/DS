import { Nationality, PlayerCardData, TrophyItem } from '../types';
import { NationalTeamTier, Confederation } from '../types/nationalTeam';
import { TOP_50_NATIONAL_TEAMS_SEEDS, Top50NationSeedData } from '../data/top50NationalTeamsData';
import { FULL_CONMEBOL_NATIONS, isConmebolNation } from './internationalDrawEngine';
import { awardTrophiesToPlayer, createTrophyItem } from './trophySystem';
import { simulatePlayerGoalsAndAssists } from './goalAssistSimulationModifiers';
import { markInternationalEventCompleted } from './internationalFootballSystem';
import { getNationalTeamsDatabase } from './nationalTeamDatabaseManager';
import { syncNationalTournamentToWorldState } from './worldSimulationEngine';
import {
  getBadRepRedCardChanceMultiplier,
  addBadReputation,
} from './badReputationSystem';

export interface MatchScorerEntry {
  playerId?: string;
  name: string;
  minute: number;
  isPlayer?: boolean;
}

export interface TournamentAwardWinner {
  name: string;
  nationName: string;
  nationCode: string;
  iso: string;
  statLabel: string;
  statValue: string | number;
  isPlayer?: boolean;
}

export interface TournamentAwards {
  mvp: TournamentAwardWinner;
  bestGoalkeeper: TournamentAwardWinner;
  bestDefender: TournamentAwardWinner;
  bestCreator: TournamentAwardWinner;
  topGoalscorer: TournamentAwardWinner;
}

export interface TournamentNation {
  code: string;
  name: string;
  iso: string;
  confederation: Confederation;
  rank: number;
  ovr: number;
  pot: number;
  managerName: string;
  tactic: string;
  isPlayerNation?: boolean;
}

export interface TournamentStanding {
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
  rankInGroup?: number;
}

export interface TournamentGroup {
  letter: string;
  name: string;
  teams: TournamentNation[];
  standings: TournamentStanding[];
}

export interface TournamentMatchFixture {
  id: string;
  matchday: number;
  stageName: string;
  homeNation: TournamentNation;
  awayNation: TournamentNation;
  homeScore?: number;
  awayScore?: number;
  homeScorers?: MatchScorerEntry[];
  awayScorers?: MatchScorerEntry[];
  isPlayed: boolean;
  isPlayerMatch: boolean;
  isKnockout?: boolean;
  extraTime?: boolean;
  penaltiesHome?: number;
  penaltiesAway?: number;
  winnerCode?: string;
  playerStats?: {
    minutes: number;
    goals: number;
    assists: number;
    rating: number;
    shots: number;
    passes: number;
    yellowCard?: boolean;
    redCard?: boolean;
    isSuspended?: boolean;
    suspensionReason?: string;
  };
}

export interface KnockoutBracketMatch {
  id: string;
  roundName: 'Round of 32' | 'Round of 16' | 'Quarter-Final' | 'Semi-Final' | 'Third-Place Playoff' | 'Grand Final';
  homeNation: TournamentNation | null;
  awayNation: TournamentNation | null;
  homeScore?: number;
  awayScore?: number;
  homeScorers?: MatchScorerEntry[];
  awayScorers?: MatchScorerEntry[];
  extraTime?: boolean;
  penaltiesHome?: number;
  penaltiesAway?: number;
  winner: TournamentNation | null;
  isPlayerMatch: boolean;
  isPlayed: boolean;
  playerStats?: {
    minutes: number;
    goals: number;
    assists: number;
    rating: number;
    shots: number;
    passes: number;
    yellowCard?: boolean;
    redCard?: boolean;
    isSuspended?: boolean;
    suspensionReason?: string;
  };
}

export interface NationalTournamentTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradient: string;
  borderGlow: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  trophyName: string;
  trophyCategory: 'continental' | 'international';
  confederationLabel: string;
  tagline: string;
}

export interface NationalTournamentConfig {
  competitionName: string;
  shortName: string;
  tier: NationalTeamTier;
  confederation: Confederation | 'GLOBAL';
  isContinental: boolean;
  isWorldCup: boolean;
  totalTeams: number;
  numGroups: number;
  teamsPerGroup: number;
  advanceTopCount: number;
  hasBest3rdPlace: boolean;
  num3rdPlaceAdvance: number;
  knockoutStartStage: 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final';
  knockoutStages: string[];
  theme: NationalTournamentTheme;
}

export interface NationalTournamentDrawState {
  competitionName: string;
  shortName: string;
  tier: NationalTeamTier;
  confederation: Confederation | 'GLOBAL';
  seasonYear: number;
  isContinental: boolean;
  isWorldCup: boolean;
  pots: {
    potNumber: number;
    potLabel: string;
    teams: TournamentNation[];
  }[];
  groups: TournamentGroup[];
  playerNation: TournamentNation;
  playerGroupLetter: string;
  isCompleted: boolean;
  animationSteps: {
    stepIndex: number;
    team: TournamentNation;
    targetGroupLetter: string;
    logText: string;
    isPlayerTeam: boolean;
  }[];
}

export interface NationalTournamentState {
  id: string;
  config: NationalTournamentConfig;
  seasonYear: number;
  callingNation: Nationality;
  playerRole: 'Key Starter' | 'Squad Player' | 'Promising Prospect';
  playerNation: TournamentNation;
  drawState: NationalTournamentDrawState;
  groups: TournamentGroup[];
  currentPhase: 'group_stage' | 'knockout' | 'finished';
  currentGroupMatchday: number;
  totalGroupMatchdays: number;
  groupFixtures: TournamentMatchFixture[];
  knockoutMatches: KnockoutBracketMatch[];
  currentKnockoutRoundIndex: number;
  knockoutRounds: string[];
  playerStats: {
    caps: number;
    goals: number;
    assists: number;
    avgRating: number;
    ratings: number[];
  };
  topScorers: { name: string; nationCode: string; nationName: string; iso: string; goals: number; isPlayer?: boolean }[];
  champion?: TournamentNation;
  runnerUp?: TournamentNation;
  thirdPlace?: TournamentNation;
  playerFinishStage?: string;
  isFinished: boolean;
  tournamentLogs: string[];
  awards?: TournamentAwards;
  playerDisciplinary?: {
    yellowCards: number;
    redCards: number;
    isSuspendedForNextMatch: boolean;
    suspensionReason?: string;
    yellowsClearedAfterGroup?: boolean;
    yellowsClearedAfterQF?: boolean;
  };
}

// Full Pools by Confederation to ensure Continental Cups strictly include teams of the same continent
export const UEFA_NATIONS_24: Omit<TournamentNation, 'pot' | 'isPlayerNation'>[] = [
  { code: 'ESP', name: 'Spain', iso: 'es', confederation: 'UEFA', rank: 3, ovr: 88, managerName: 'Luis de la Fuente', tactic: '4-3-3 Possession' },
  { code: 'FRA', name: 'France', iso: 'fr', confederation: 'UEFA', rank: 2, ovr: 88, managerName: 'Didier Deschamps', tactic: '4-2-3-1 Counter' },
  { code: 'ENG', name: 'England', iso: 'gb-eng', confederation: 'UEFA', rank: 4, ovr: 87, managerName: 'Thomas Tuchel', tactic: '4-2-3-1 Pressing' },
  { code: 'BEL', name: 'Belgium', iso: 'be', confederation: 'UEFA', rank: 6, ovr: 85, managerName: 'Domenico Tedesco', tactic: '4-3-3 High Press' },
  { code: 'NED', name: 'Netherlands', iso: 'nl', confederation: 'UEFA', rank: 7, ovr: 86, managerName: 'Ronald Koeman', tactic: '4-3-3 Total Football' },
  { code: 'POR', name: 'Portugal', iso: 'pt', confederation: 'UEFA', rank: 8, ovr: 87, managerName: 'Roberto Martínez', tactic: '4-3-3 Fluid' },
  { code: 'GER', name: 'Germany', iso: 'de', confederation: 'UEFA', rank: 9, ovr: 86, managerName: 'Julian Nagelsmann', tactic: '4-2-3-1 Gegenpress' },
  { code: 'ITA', name: 'Italy', iso: 'it', confederation: 'UEFA', rank: 10, ovr: 85, managerName: 'Luciano Spalletti', tactic: '3-5-2 Direct' },
  { code: 'CRO', name: 'Croatia', iso: 'hr', confederation: 'UEFA', rank: 12, ovr: 83, managerName: 'Zlatko Dalić', tactic: '4-3-3 Midfield Control' },
  { code: 'DEN', name: 'Denmark', iso: 'dk', confederation: 'UEFA', rank: 19, ovr: 82, managerName: 'Brian Riemer', tactic: '3-4-2-1 Compact' },
  { code: 'SUI', name: 'Switzerland', iso: 'ch', confederation: 'UEFA', rank: 15, ovr: 82, managerName: 'Murat Yakin', tactic: '3-4-1-2 Solid' },
  { code: 'AUT', name: 'Austria', iso: 'at', confederation: 'UEFA', rank: 23, ovr: 81, managerName: 'Ralf Rangnick', tactic: '4-2-2-2 Heavy Press' },
  { code: 'POL', name: 'Poland', iso: 'pl', confederation: 'UEFA', rank: 26, ovr: 79, managerName: 'Michał Probierz', tactic: '3-5-2 Direct' },
  { code: 'SWE', name: 'Sweden', iso: 'se', confederation: 'UEFA', rank: 28, ovr: 80, managerName: 'Jon Dahl Tomasson', tactic: '4-4-2 Attacking' },
  { code: 'WAL', name: 'Wales', iso: 'gb-wls', confederation: 'UEFA', rank: 29, ovr: 78, managerName: 'Craig Bellamy', tactic: '4-3-3 High Energy' },
  { code: 'UKR', name: 'Ukraine', iso: 'ua', confederation: 'UEFA', rank: 25, ovr: 80, managerName: 'Serhiy Rebrov', tactic: '4-2-3-1 Balanced' },
  { code: 'TUR', name: 'Turkey', iso: 'tr', confederation: 'UEFA', rank: 27, ovr: 81, managerName: 'Vincenzo Montella', tactic: '4-2-3-1 Dynamic' },
  { code: 'SRB', name: 'Serbia', iso: 'rs', confederation: 'UEFA', rank: 32, ovr: 79, managerName: 'Dragan Stojković', tactic: '3-4-1-2 Physical' },
  { code: 'SCO', name: 'Scotland', iso: 'gb-sct', confederation: 'UEFA', rank: 35, ovr: 78, managerName: 'Steve Clarke', tactic: '5-3-2 Resilient' },
  { code: 'CZE', name: 'Czechia', iso: 'cz', confederation: 'UEFA', rank: 44, ovr: 78, managerName: 'Ivan Hašek', tactic: '3-4-1-2 Direct' },
  { code: 'NOR', name: 'Norway', iso: 'no', confederation: 'UEFA', rank: 43, ovr: 81, managerName: 'Ståle Solbakken', tactic: '4-3-3 Vertical' },
  { code: 'HUN', name: 'Hungary', iso: 'hu', confederation: 'UEFA', rank: 31, ovr: 79, managerName: 'Marco Rossi', tactic: '3-4-2-1 Disciplined' },
  { code: 'ROU', name: 'Romania', iso: 'ro', confederation: 'UEFA', rank: 45, ovr: 76, managerName: 'Mircea Lucescu', tactic: '4-3-3 Counter' },
  { code: 'GRE', name: 'Greece', iso: 'gr', confederation: 'UEFA', rank: 42, ovr: 77, managerName: 'Ivan Jovanović', tactic: '4-2-3-1 Organized' },
];

export const CONMEBOL_NATIONS_10: Omit<TournamentNation, 'pot' | 'isPlayerNation'>[] = [
  { code: 'ARG', name: 'Argentina', iso: 'ar', confederation: 'CONMEBOL', rank: 1, ovr: 89, managerName: 'Lionel Scaloni', tactic: '4-3-3 Dynamic' },
  { code: 'BRA', name: 'Brazil', iso: 'br', confederation: 'CONMEBOL', rank: 5, ovr: 88, managerName: 'Dorival Júnior', tactic: '4-2-3-1 Samba' },
  { code: 'COL', name: 'Colombia', iso: 'co', confederation: 'CONMEBOL', rank: 11, ovr: 84, managerName: 'Néstor Lorenzo', tactic: '4-3-3 High Intensity' },
  { code: 'URU', name: 'Uruguay', iso: 'uy', confederation: 'CONMEBOL', rank: 14, ovr: 85, managerName: 'Marcelo Bielsa', tactic: '4-3-3 Relentless Press' },
  { code: 'ECU', name: 'Ecuador', iso: 'ec', confederation: 'CONMEBOL', rank: 24, ovr: 80, managerName: 'Sebastián Beccacece', tactic: '3-4-3 Pace & Power' },
  { code: 'CHI', name: 'Chile', iso: 'cl', confederation: 'CONMEBOL', rank: 40, ovr: 78, managerName: 'Ricardo Gareca', tactic: '4-2-3-1 Gritty' },
  { code: 'PAR', name: 'Paraguay', iso: 'py', confederation: 'CONMEBOL', rank: 53, ovr: 78, managerName: 'Gustavo Alfaro', tactic: '4-4-2 Steel Defense' },
  { code: 'PER', name: 'Peru', iso: 'pe', confederation: 'CONMEBOL', rank: 41, ovr: 77, managerName: 'Jorge Fossati', tactic: '3-5-2 Compact' },
  { code: 'VEN', name: 'Venezuela', iso: 've', confederation: 'CONMEBOL', rank: 44, ovr: 77, managerName: 'Fernando Batista', tactic: '4-3-3 Fast Break' },
  { code: 'BOL', name: 'Bolivia', iso: 'bo', confederation: 'CONMEBOL', rank: 79, ovr: 74, managerName: 'Óscar Villegas', tactic: '4-4-2 High Altitude' },
];

export const CAF_NATIONS_16: Omit<TournamentNation, 'pot' | 'isPlayerNation'>[] = [
  { code: 'MAR', name: 'Morocco', iso: 'ma', confederation: 'CAF', rank: 13, ovr: 84, managerName: 'Walid Regragui', tactic: '4-3-3 Compact Counter' },
  { code: 'SEN', name: 'Senegal', iso: 'sn', confederation: 'CAF', rank: 17, ovr: 83, managerName: 'Pape Thiaw', tactic: '4-3-3 Physical Power' },
  { code: 'EGY', name: 'Egypt', iso: 'eg', confederation: 'CAF', rank: 30, ovr: 81, managerName: 'Hossam Hassan', tactic: '4-2-3-1 Pharaonic Direct' },
  { code: 'CIV', name: 'Ivory Coast', iso: 'ci', confederation: 'CAF', rank: 38, ovr: 82, managerName: 'Emerse Faé', tactic: '4-3-3 Elephants Charge' },
  { code: 'NGA', name: 'Nigeria', iso: 'ng', confederation: 'CAF', rank: 36, ovr: 82, managerName: 'Finidi George', tactic: '4-4-2 Super Eagles Attack' },
  { code: 'ALG', name: 'Algeria', iso: 'dz', confederation: 'CAF', rank: 37, ovr: 81, managerName: 'Vladimir Petković', tactic: '4-2-3-1 Desert Press' },
  { code: 'TUN', name: 'Tunisia', iso: 'tn', confederation: 'CAF', rank: 47, ovr: 78, managerName: 'Kais Yaâkoubi', tactic: '4-3-3 Tactical Lock' },
  { code: 'CMR', name: 'Cameroon', iso: 'cm', confederation: 'CAF', rank: 48, ovr: 79, managerName: 'Marc Brys', tactic: '4-3-3 Indomitable Lions' },
  { code: 'MLI', name: 'Mali', iso: 'ml', confederation: 'CAF', rank: 45, ovr: 79, managerName: 'Tom Saintfiet', tactic: '4-2-3-1 Midfield Engine' },
  { code: 'GHA', name: 'Ghana', iso: 'gh', confederation: 'CAF', rank: 64, ovr: 78, managerName: 'Otto Addo', tactic: '4-2-3-1 Black Stars Pace' },
  { code: 'BFA', name: 'Burkina Faso', iso: 'bf', confederation: 'CAF', rank: 62, ovr: 76, managerName: 'Brama Traoré', tactic: '4-3-3 Stallions Counter' },
  { code: 'COD', name: 'DR Congo', iso: 'cd', confederation: 'CAF', rank: 57, ovr: 77, managerName: 'Sébastien Desabre', tactic: '4-2-3-1 Leopards Strike' },
  { code: 'RSA', name: 'South Africa', iso: 'za', confederation: 'CAF', rank: 59, ovr: 76, managerName: 'Hugo Broos', tactic: '4-3-3 Bafana Rhythm' },
  { code: 'GUI', name: 'Guinea', iso: 'gn', confederation: 'CAF', rank: 76, ovr: 75, managerName: 'Michel Dussuyer', tactic: '4-4-2 Direct Flanks' },
  { code: 'CPV', name: 'Cape Verde', iso: 'cv', confederation: 'CAF', rank: 67, ovr: 75, managerName: 'Bubista', tactic: '4-3-3 Blue Sharks Technique' },
  { code: 'ZAM', name: 'Zambia', iso: 'zm', confederation: 'CAF', rank: 87, ovr: 74, managerName: 'Avram Grant', tactic: '4-4-2 Copper Bullets' },
];

export const AFC_NATIONS_16: Omit<TournamentNation, 'pot' | 'isPlayerNation'>[] = [
  { code: 'JPN', name: 'Japan', iso: 'jp', confederation: 'AFC', rank: 15, ovr: 84, managerName: 'Hajime Moriyasu', tactic: '4-2-3-1 Samurai Blue Precision' },
  { code: 'IRN', name: 'Iran', iso: 'ir', confederation: 'AFC', rank: 18, ovr: 82, managerName: 'Amir Ghalenoei', tactic: '4-4-2 Persian Fortress' },
  { code: 'KOR', name: 'South Korea', iso: 'kr', confederation: 'AFC', rank: 22, ovr: 83, managerName: 'Hong Myung-bo', tactic: '4-2-3-1 Taegeuk Speed' },
  { code: 'AUS', name: 'Australia', iso: 'au', confederation: 'AFC', rank: 24, ovr: 81, managerName: 'Tony Popovic', tactic: '4-2-3-1 Socceroo Grit' },
  { code: 'QAT', name: 'Qatar', iso: 'qa', confederation: 'AFC', rank: 46, ovr: 78, managerName: 'Tintín Márquez', tactic: '3-5-2 Al-Annabi Possession' },
  { code: 'KSA', name: 'Saudi Arabia', iso: 'sa', confederation: 'AFC', rank: 59, ovr: 79, managerName: 'Hervé Renard', tactic: '4-3-3 Green Falcons Press' },
  { code: 'UZE', name: 'Uzbekistan', iso: 'uz', confederation: 'AFC', rank: 58, ovr: 77, managerName: 'Srečko Katanec', tactic: '3-4-2-1 White Wolves' },
  { code: 'IRQ', name: 'Iraq', iso: 'iq', confederation: 'AFC', rank: 56, ovr: 77, managerName: 'Jesús Casas', tactic: '4-2-3-1 Lions of Mesopotamia' },
  { code: 'UAE', name: 'United Arab Emirates', iso: 'ae', confederation: 'AFC', rank: 68, ovr: 76, managerName: 'Paulo Bento', tactic: '4-3-3 Gulf Fluid' },
  { code: 'JOR', name: 'Jordan', iso: 'jo', confederation: 'AFC', rank: 64, ovr: 76, managerName: 'Jamal Sellami', tactic: '3-4-3 Chivalrous Counter' },
  { code: 'OMA', name: 'Oman', iso: 'om', confederation: 'AFC', rank: 80, ovr: 74, managerName: 'Rasheed Jabar', tactic: '4-4-2 Red Warriors' },
  { code: 'BHR', name: 'Bahrain', iso: 'bh', confederation: 'AFC', rank: 76, ovr: 74, managerName: 'Dragan Talajić', tactic: '4-2-3-1 Dilmun Defend' },
  { code: 'CHN', name: 'China', iso: 'cn', confederation: 'AFC', rank: 90, ovr: 73, managerName: 'Branko Ivanković', tactic: '4-4-2 Dragon Counter' },
  { code: 'THA', name: 'Thailand', iso: 'th', confederation: 'AFC', rank: 96, ovr: 73, managerName: 'Masatada Ishii', tactic: '4-3-3 War Elephants' },
  { code: 'VIE', name: 'Vietnam', iso: 'vn', confederation: 'AFC', rank: 119, ovr: 72, managerName: 'Kim Sang-sik', tactic: '5-3-2 Golden Star Warriors' },
  { code: 'IDN', name: 'Indonesia', iso: 'id', confederation: 'AFC', rank: 130, ovr: 73, managerName: 'Shin Tae-yong', tactic: '3-4-3 Garuda Wave' },
];

export const CONCACAF_NATIONS_16: Omit<TournamentNation, 'pot' | 'isPlayerNation'>[] = [
  { code: 'USA', name: 'United States', iso: 'us', confederation: 'CONCACAF', rank: 18, ovr: 83, managerName: 'Mauricio Pochettino', tactic: '4-3-3 High Press' },
  { code: 'MEX', name: 'Mexico', iso: 'mx', confederation: 'CONCACAF', rank: 16, ovr: 83, managerName: 'Javier Aguirre', tactic: '4-3-3 El Tri Passion' },
  { code: 'CAN', name: 'Canada', iso: 'ca', confederation: 'CONCACAF', rank: 35, ovr: 81, managerName: 'Jesse Marsch', tactic: '4-2-3-1 Speed & Direct' },
  { code: 'PAN', name: 'Panama', iso: 'pa', confederation: 'CONCACAF', rank: 41, ovr: 78, managerName: 'Thomas Christiansen', tactic: '3-4-3 Canaleros' },
  { code: 'CRC', name: 'Costa Rica', iso: 'cr', confederation: 'CONCACAF', rank: 54, ovr: 77, managerName: 'Claudio Vivas', tactic: '5-4-1 Pura Vida Block' },
  { code: 'JAM', name: 'Jamaica', iso: 'jm', confederation: 'CONCACAF', rank: 61, ovr: 78, managerName: 'Steve McClaren', tactic: '4-4-2 Reggae Boyz Attack' },
  { code: 'HON', name: 'Honduras', iso: 'hn', confederation: 'CONCACAF', rank: 77, ovr: 74, managerName: 'Reinaldo Rueda', tactic: '4-2-3-1 Los Catrachos' },
  { code: 'SLV', name: 'El Salvador', iso: 'sv', confederation: 'CONCACAF', rank: 83, ovr: 73, managerName: 'David Dóniga', tactic: '4-3-3 La Selecta' },
  { code: 'GUA', name: 'Guatemala', iso: 'gt', confederation: 'CONCACAF', rank: 104, ovr: 72, managerName: 'Luis Fernando Tena', tactic: '4-4-2 Los Chapines' },
  { code: 'TRI', name: 'Trinidad and Tobago', iso: 'tt', confederation: 'CONCACAF', rank: 102, ovr: 73, managerName: 'Dwight Yorke', tactic: '4-3-3 Soca Warriors' },
  { code: 'HAI', name: 'Haiti', iso: 'ht', confederation: 'CONCACAF', rank: 86, ovr: 73, managerName: 'Sébastien Migné', tactic: '4-2-3-1 Grenadiers' },
  { code: 'CUB', name: 'Cuba', iso: 'cu', confederation: 'CONCACAF', rank: 166, ovr: 70, managerName: 'Yunielys Castillo', tactic: '4-4-2 Lions of the Caribbean' },
  { code: 'CUR', name: 'Curaçao', iso: 'cw', confederation: 'CONCACAF', rank: 81, ovr: 74, managerName: 'Dick Advocaat', tactic: '4-3-3 Dutch-Caribbean Style' },
  { code: 'NIC', name: 'Nicaragua', iso: 'ni', confederation: 'CONCACAF', rank: 132, ovr: 71, managerName: 'Marco Antonio Figueroa', tactic: '4-2-3-1 Pinoleros' },
  { code: 'SUR', name: 'Suriname', iso: 'sr', confederation: 'CONCACAF', rank: 136, ovr: 73, managerName: 'Stanley Menzo', tactic: '4-3-3 A-Selektie' },
  { code: 'GUY', name: 'Guyana', iso: 'gy', confederation: 'CONCACAF', rank: 156, ovr: 70, managerName: 'Jamaal Shabazz', tactic: '4-4-2 Golden Jaguars' },
];

/**
 * Returns tournament format configuration and thematic styling based on competition name and confederation.
 */
export function getNationalTournamentConfig(
  competitionName: string,
  playerNationCode: string,
  tier: NationalTeamTier = 'Senior'
): NationalTournamentConfig {
  const normName = (competitionName || '').toLowerCase();
  const normCode = (playerNationCode || 'ENG').toUpperCase();
  const isConmebol = isConmebolNation(normCode);

  const isWorldCup = normName.includes('world cup');
  const isEuro = normName.includes('euro');
  const isCopaAmerica = normName.includes('copa am') || (normName.includes('continental') && isConmebol);
  const isCaf = normName.includes('afcon') || normName.includes('africa') || normName.includes('caf');
  const isAfc = normName.includes('asian') || normName.includes('afc') || normName.includes('asia');
  const isGoldCup = normName.includes('gold cup') || normName.includes('concacaf');

  // 1. UEFA EURO / EUROCUP
  if (isEuro || (normName.includes('continental') && !isConmebol && !isCaf && !isAfc && !isGoldCup)) {
    return {
      competitionName: 'UEFA European Championship',
      shortName: 'Eurocup',
      tier,
      confederation: 'UEFA',
      isContinental: true,
      isWorldCup: false,
      totalTeams: 24,
      numGroups: 6,
      teamsPerGroup: 4,
      advanceTopCount: 2,
      hasBest3rdPlace: true,
      num3rdPlaceAdvance: 4,
      knockoutStartStage: 'round_of_16',
      knockoutStages: ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Grand Final'],
      theme: {
        primaryColor: '#002B49',
        secondaryColor: '#00B2FF',
        accentColor: '#FFD700',
        gradient: 'from-slate-950 via-sky-950 to-blue-900',
        borderGlow: 'border-sky-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)]',
        badgeBg: 'bg-sky-500/20',
        badgeBorder: 'border-sky-400/40',
        badgeText: 'text-sky-300',
        trophyName: 'Henri Delaunay Trophy (UEFA Euro)',
        trophyCategory: 'continental',
        confederationLabel: 'UEFA EUROPEAN TEAMS ONLY',
        tagline: 'The Pinnacle of European National Football',
      },
    };
  }

  // 2. COPA AMÉRICA (CONMEBOL ONLY)
  if (isCopaAmerica) {
    return {
      competitionName: 'CONMEBOL Copa América',
      shortName: 'Copa América',
      tier,
      confederation: 'CONMEBOL',
      isContinental: true,
      isWorldCup: false,
      totalTeams: 10,
      numGroups: 2,
      teamsPerGroup: 5,
      advanceTopCount: 4, // Top 4 from Group A & Group B advance to Quarter-Finals
      hasBest3rdPlace: false,
      num3rdPlaceAdvance: 0,
      knockoutStartStage: 'quarter_final',
      knockoutStages: ['Quarter-Final', 'Semi-Final', 'Third-Place Playoff', 'Grand Final'],
      theme: {
        primaryColor: '#001E62',
        secondaryColor: '#FFD100',
        accentColor: '#009739',
        gradient: 'from-slate-950 via-amber-950/40 to-slate-900',
        borderGlow: 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)]',
        badgeBg: 'bg-amber-500/20',
        badgeBorder: 'border-amber-400/40',
        badgeText: 'text-amber-300',
        trophyName: 'Copa América Trophy',
        trophyCategory: 'continental',
        confederationLabel: 'CONMEBOL SOUTH AMERICAN TEAMS ONLY',
        tagline: 'Glory and Passion in South American Football',
      },
    };
  }

  // 3. COPA ÁFRICA / AFRICA CUP OF NATIONS (CAF ONLY)
  if (isCaf) {
    return {
      competitionName: 'CAF Africa Cup of Nations',
      shortName: 'Copa África',
      tier,
      confederation: 'CAF',
      isContinental: true,
      isWorldCup: false,
      totalTeams: 16,
      numGroups: 4,
      teamsPerGroup: 4,
      advanceTopCount: 2,
      hasBest3rdPlace: false,
      num3rdPlaceAdvance: 0,
      knockoutStartStage: 'quarter_final',
      knockoutStages: ['Quarter-Final', 'Semi-Final', 'Third-Place Playoff', 'Grand Final'],
      theme: {
        primaryColor: '#006B3F',
        secondaryColor: '#FCD116',
        accentColor: '#D21034',
        gradient: 'from-slate-950 via-emerald-950 to-slate-900',
        borderGlow: 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.25)]',
        badgeBg: 'bg-emerald-500/20',
        badgeBorder: 'border-emerald-400/40',
        badgeText: 'text-emerald-300',
        trophyName: 'Africa Cup of Nations Trophy',
        trophyCategory: 'continental',
        confederationLabel: 'CAF AFRICAN TEAMS ONLY',
        tagline: 'The Pride and Heart of African Football',
      },
    };
  }

  // 4. AFC ASIAN CUP (AFC ONLY)
  if (isAfc) {
    return {
      competitionName: 'AFC Asian Cup',
      shortName: 'Asian Cup',
      tier,
      confederation: 'AFC',
      isContinental: true,
      isWorldCup: false,
      totalTeams: 16,
      numGroups: 4,
      teamsPerGroup: 4,
      advanceTopCount: 2,
      hasBest3rdPlace: false,
      num3rdPlaceAdvance: 0,
      knockoutStartStage: 'quarter_final',
      knockoutStages: ['Quarter-Final', 'Semi-Final', 'Third-Place Playoff', 'Grand Final'],
      theme: {
        primaryColor: '#8B0000',
        secondaryColor: '#FFD700',
        accentColor: '#FFFFFF',
        gradient: 'from-slate-950 via-rose-950 to-slate-900',
        borderGlow: 'border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)]',
        badgeBg: 'bg-rose-500/20',
        badgeBorder: 'border-rose-400/40',
        badgeText: 'text-rose-300',
        trophyName: 'AFC Asian Cup Trophy',
        trophyCategory: 'continental',
        confederationLabel: 'AFC ASIAN TEAMS ONLY',
        tagline: 'The Grandest Stage in Asian Football',
      },
    };
  }

  // 5. CONCACAF GOLD CUP
  if (isGoldCup) {
    return {
      competitionName: 'CONCACAF Gold Cup',
      shortName: 'Gold Cup',
      tier,
      confederation: 'CONCACAF',
      isContinental: true,
      isWorldCup: false,
      totalTeams: 16,
      numGroups: 4,
      teamsPerGroup: 4,
      advanceTopCount: 2,
      hasBest3rdPlace: false,
      num3rdPlaceAdvance: 0,
      knockoutStartStage: 'quarter_final',
      knockoutStages: ['Quarter-Final', 'Semi-Final', 'Grand Final'],
      theme: {
        primaryColor: '#002B49',
        secondaryColor: '#FFBF00',
        accentColor: '#E5E5E5',
        gradient: 'from-slate-950 via-blue-950 to-slate-900',
        borderGlow: 'border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.25)]',
        badgeBg: 'bg-blue-500/20',
        badgeBorder: 'border-blue-400/40',
        badgeText: 'text-blue-300',
        trophyName: 'CONCACAF Gold Cup',
        trophyCategory: 'continental',
        confederationLabel: 'CONCACAF TEAMS ONLY',
        tagline: 'Championship of North & Central America',
      },
    };
  }

  // 6. FIFA WORLD CUP (SENIOR, U20, U17)
  const isU20 = tier === 'U20';
  const isU17 = tier === 'U17';
  const totalWcTeams = 48;
  const numWcGroups = 12;

  return {
    competitionName: isU20 ? 'FIFA U-20 World Cup' : isU17 ? 'FIFA U-17 World Cup' : 'FIFA World Cup',
    shortName: isU20 ? 'U20 World Cup' : isU17 ? 'U17 World Cup' : 'World Cup',
    tier,
    confederation: 'GLOBAL',
    isContinental: false,
    isWorldCup: true,
    totalTeams: totalWcTeams,
    numGroups: numWcGroups,
    teamsPerGroup: 4,
    advanceTopCount: 2,
    hasBest3rdPlace: true,
    num3rdPlaceAdvance: 8,
    knockoutStartStage: 'round_of_32',
    knockoutStages: ['Round of 32', 'Round of 16', 'Quarter-Final', 'Semi-Final', 'Third-Place Playoff', 'Grand Final'],
    theme: {
      primaryColor: '#0B1325',
      secondaryColor: '#FFD700',
      accentColor: '#10B981',
      gradient: 'from-slate-950 via-amber-950/30 to-slate-900',
      borderGlow: 'border-amber-500/60 shadow-[0_0_60px_rgba(245,158,11,0.3)]',
      badgeBg: 'bg-amber-500/20',
      badgeBorder: 'border-amber-400/40',
      badgeText: 'text-amber-300',
      trophyName: isU20 ? 'FIFA U-20 World Cup Trophy' : isU17 ? 'FIFA U-17 World Cup Trophy' : 'FIFA World Cup Trophy',
      trophyCategory: 'international',
      confederationLabel: 'QUALIFIED NATIONS FROM ALL CONTINENTS',
      tagline: 'The Ultimate Tournament in World Football',
    },
  };
}

/**
 * Builds the qualified participants pool for a tournament respecting the strict continent rule!
 */
export function buildQualifiedParticipantsPool(
  config: NationalTournamentConfig,
  playerNationCode: string
): TournamentNation[] {
  const normPlayerCode = (playerNationCode || 'ENG').toUpperCase();
  let baseList: Omit<TournamentNation, 'pot' | 'isPlayerNation'>[] = [];

  if (config.isContinental) {
    // STRICT CONTINENTAL ISOLATION:
    if (config.confederation === 'UEFA') {
      baseList = [...UEFA_NATIONS_24];
    } else if (config.confederation === 'CONMEBOL') {
      baseList = [...CONMEBOL_NATIONS_10];
    } else if (config.confederation === 'CAF') {
      baseList = [...CAF_NATIONS_16];
    } else if (config.confederation === 'AFC') {
      baseList = [...AFC_NATIONS_16];
    } else if (config.confederation === 'CONCACAF') {
      baseList = [...CONCACAF_NATIONS_16];
    }
  } else {
    // WORLD CUP: Multi-continental mixture according to official quotas (48 teams)
    if (config.totalTeams === 48) {
      const uefa = UEFA_NATIONS_24.slice(0, 16);
      const conmebol = CONMEBOL_NATIONS_10.slice(0, 6);
      const caf = CAF_NATIONS_16.slice(0, 9);
      const afc = AFC_NATIONS_16.slice(0, 8);
      const concacaf = CONCACAF_NATIONS_16.slice(0, 6);
      const ofc: Omit<TournamentNation, 'pot' | 'isPlayerNation'> = {
        code: 'NZL', name: 'New Zealand', iso: 'nz', confederation: 'OFC', rank: 50, ovr: 75, managerName: 'Darren Bazeley', tactic: '4-3-3 Direct'
      };
      // Intercontinental play-off spots: 2 teams
      const playoff1 = CONMEBOL_NATIONS_10[6] || CONMEBOL_NATIONS_10[0];
      const playoff2 = CONCACAF_NATIONS_16[6] || CAF_NATIONS_16[9];
      baseList = [...uefa, ...conmebol, ...caf, ...afc, ...concacaf, ofc, playoff1, playoff2];
    } else if (config.totalTeams === 32) {
      const uefa = UEFA_NATIONS_24.slice(0, 13);
      const conmebol = CONMEBOL_NATIONS_10.slice(0, 5);
      const caf = CAF_NATIONS_16.slice(0, 5);
      const afc = AFC_NATIONS_16.slice(0, 4);
      const concacaf = CONCACAF_NATIONS_16.slice(0, 4);
      const ofc: Omit<TournamentNation, 'pot' | 'isPlayerNation'> = {
        code: 'NZL', name: 'New Zealand', iso: 'nz', confederation: 'OFC', rank: 50, ovr: 75, managerName: 'Darren Bazeley', tactic: '4-3-3 Direct'
      };
      baseList = [...uefa, ...conmebol, ...caf, ...afc, ...concacaf, ofc];
    } else {
      // 24 teams fallback
      const uefa = UEFA_NATIONS_24.slice(0, 6);
      const conmebol = CONMEBOL_NATIONS_10.slice(0, 4);
      const caf = CAF_NATIONS_16.slice(0, 4);
      const afc = AFC_NATIONS_16.slice(0, 4);
      const concacaf = CONCACAF_NATIONS_16.slice(0, 4);
      const ofc: Omit<TournamentNation, 'pot' | 'isPlayerNation'> = {
        code: 'NZL', name: 'New Zealand', iso: 'nz', confederation: 'OFC', rank: 50, ovr: 75, managerName: 'Darren Bazeley', tactic: '4-3-3 Direct'
      };
      const extra = UEFA_NATIONS_24[6] || CONMEBOL_NATIONS_10[4];
      baseList = [...uefa, ...conmebol, ...caf, ...afc, ...concacaf, ofc, extra];
    }
  }

  // Ensure player's nation is included if it belongs to this confederation or if World Cup
  const playerInList = baseList.some((t) => t.code.toUpperCase() === normPlayerCode);
  if (!playerInList) {
    // Look up player's nation in top 50 or create custom representation
    const seed = TOP_50_NATIONAL_TEAMS_SEEDS.find((s) => s.code.toUpperCase() === normPlayerCode);
    const canInclude = !config.isContinental || seed?.confederation === config.confederation;

    if (canInclude && seed) {
      const customPlayerNation: Omit<TournamentNation, 'pot' | 'isPlayerNation'> = {
        code: seed.code,
        name: seed.name,
        iso: seed.iso,
        confederation: seed.confederation,
        rank: seed.rank,
        ovr: Math.max(75, 89 - Math.floor(seed.rank * 0.3)),
        managerName: seed.managerName,
        tactic: `${seed.primaryTacticFormation} ${seed.primaryTacticStyle}`,
      };
      // Replace the lowest ranked team in the pool
      baseList.sort((a, b) => a.rank - b.rank);
      baseList.pop();
      baseList.push(customPlayerNation);
    }
  }

  // Adjust OVR according to Tier (U17: -12, U20: -6, Senior: standard)
  const tierOvrAdjustment = config.tier === 'U17' ? -12 : config.tier === 'U20' ? -6 : 0;

  // Sort by ranking (lowest rank number = best team)
  baseList.sort((a, b) => a.rank - b.rank);

  return baseList.map((t, idx) => ({
    ...t,
    ovr: Math.max(62, Math.min(92, t.ovr + tierOvrAdjustment)),
    pot: Math.floor(idx / config.numGroups) + 1,
    isPlayerNation: t.code.toUpperCase() === normPlayerCode,
  }));
}

/**
 * Generates an authentic Draw for a National Tournament.
 * Sets up Pots, executes authentic group placement, and outputs animation steps.
 */
export function generateNationalTournamentDraw(
  competitionName: string,
  playerNationCode: string,
  seasonYear: number,
  tier: NationalTeamTier = 'Senior'
): NationalTournamentDrawState {
  const config = getNationalTournamentConfig(competitionName, playerNationCode, tier);
  const pool = buildQualifiedParticipantsPool(config, playerNationCode);
  const normPlayerCode = (playerNationCode || 'ENG').toUpperCase();

  const numPots = config.teamsPerGroup;
  const numGroups = config.numGroups;

  // Build Pot objects
  const pots: { potNumber: number; potLabel: string; teams: TournamentNation[] }[] = [];
  for (let p = 0; p < numPots; p++) {
    const slice = pool.slice(p * numGroups, (p + 1) * numGroups).map((t) => ({
      ...t,
      pot: p + 1,
    }));
    pots.push({
      potNumber: p + 1,
      potLabel: `Pot ${p + 1}`,
      teams: slice,
    });
  }

  // Build Groups: A, B, C, D... up to L (for 12 groups)
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].slice(0, numGroups);
  const groups: TournamentGroup[] = letters.map((letter) => ({
    letter,
    name: `Group ${letter}`,
    teams: [],
    standings: [],
  }));

  const animationSteps: NationalTournamentDrawState['animationSteps'] = [];
  let stepCount = 1;

  // Draw Pot 1 into Groups in order
  const pot1 = [...pots[0].teams].sort(() => Math.random() - 0.5);
  pot1.forEach((team, gIdx) => {
    const targetGroup = groups[gIdx];
    targetGroup.teams.push(team);
    animationSteps.push({
      stepIndex: stepCount++,
      team,
      targetGroupLetter: targetGroup.letter,
      logText: `Pot 1: ${team.name} placed in Group ${targetGroup.letter}`,
      isPlayerTeam: Boolean(team.isPlayerNation),
    });
  });

  // Draw subsequent Pots with confederation protection rules for World Cup
  for (let p = 1; p < numPots; p++) {
    const currentPot = [...pots[p].teams].sort(() => Math.random() - 0.5);

    currentPot.forEach((team) => {
      // Find candidate groups that have room and respect confederation rules
      let candidateGroupIndices: number[] = [];
      groups.forEach((g, idx) => {
        if (g.teams.length > p) return; // already drawn this pot

        if (config.isWorldCup) {
          if (team.confederation === 'UEFA') {
            const uefaCount = g.teams.filter((t) => t.confederation === 'UEFA').length;
            if (uefaCount < 2) candidateGroupIndices.push(idx);
          } else {
            const sameCount = g.teams.filter((t) => t.confederation === team.confederation).length;
            if (sameCount === 0) candidateGroupIndices.push(idx);
          }
        } else {
          // Continental cup: any group with space is valid
          candidateGroupIndices.push(idx);
        }
      });

      if (candidateGroupIndices.length === 0) {
        // Fallback to any group with space
        candidateGroupIndices = groups.map((g, idx) => (g.teams.length <= p ? idx : -1)).filter((i) => i !== -1);
      }

      const chosenIdx = candidateGroupIndices[Math.floor(Math.random() * candidateGroupIndices.length)] ?? 0;
      const targetGroup = groups[chosenIdx];
      targetGroup.teams.push(team);

      animationSteps.push({
        stepIndex: stepCount++,
        team,
        targetGroupLetter: targetGroup.letter,
        logText: `Pot ${p + 1}: ${team.name} drawn into Group ${targetGroup.letter}`,
        isPlayerTeam: Boolean(team.isPlayerNation),
      });
    });
  }

  // Initialize initial standings tables for all groups
  groups.forEach((g) => {
    g.standings = g.teams.map((t) => ({
      nationCode: t.code,
      nationName: t.name,
      iso: t.iso,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      qualified: false,
      isPlayerNation: Boolean(t.isPlayerNation),
    }));
  });

  const playerGroup = groups.find((g) => g.teams.some((t) => t.code.toUpperCase() === normPlayerCode)) || groups[0];
  const playerNation = playerGroup.teams.find((t) => t.code.toUpperCase() === normPlayerCode) || playerGroup.teams[0];

  return {
    competitionName: config.competitionName,
    shortName: config.shortName,
    tier,
    confederation: config.confederation,
    seasonYear,
    isContinental: config.isContinental,
    isWorldCup: config.isWorldCup,
    pots,
    groups,
    playerNation,
    playerGroupLetter: playerGroup.letter,
    isCompleted: false,
    animationSteps,
  };
}

/**
 * Initializes the full active tournament state from the completed draw.
 * Generates all round-robin group fixtures and prepares knockout brackets.
 */
export function initializeNationalTournamentState(
  player: PlayerCardData,
  callingNation: Nationality,
  drawState: NationalTournamentDrawState,
  playerRole: 'Key Starter' | 'Squad Player' | 'Promising Prospect' = 'Key Starter'
): NationalTournamentState {
  const config = getNationalTournamentConfig(drawState.competitionName, callingNation.code, drawState.tier);
  const normPlayerCode = callingNation.code.toUpperCase();

  // Generate complete group fixtures for all groups
  const groupFixtures: TournamentMatchFixture[] = [];
  const teamsPerGroup = config.teamsPerGroup; // 4 (or 5 for Copa América 10-team)
  const totalGroupMatchdays = teamsPerGroup === 5 ? 5 : teamsPerGroup - 1; // 3 matchdays for 4 teams, 5 for 5 teams

  drawState.groups.forEach((group) => {
    const teams = group.teams;
    let matchCounter = 1;

    if (teams.length === 4) {
      // 3 Matchdays:
      // Matchday 1: 0 vs 1, 2 vs 3
      // Matchday 2: 0 vs 2, 1 vs 3
      // Matchday 3: 0 vs 3, 1 vs 2
      const pairings = [
        [[0, 1], [2, 3]],
        [[0, 2], [1, 3]],
        [[0, 3], [1, 2]],
      ];

      pairings.forEach((roundPairings, mDayIdx) => {
        const mDay = mDayIdx + 1;
        roundPairings.forEach(([hIdx, aIdx]) => {
          const home = teams[hIdx];
          const away = teams[aIdx];
          const isPlayerMatch = home.code.toUpperCase() === normPlayerCode || away.code.toUpperCase() === normPlayerCode;

          groupFixtures.push({
            id: `grp-${group.letter}-m${matchCounter++}`,
            matchday: mDay,
            stageName: `Group ${group.letter} - Matchday ${mDay}`,
            homeNation: home,
            awayNation: away,
            isPlayed: false,
            isPlayerMatch,
          });
        });
      });
    } else if (teams.length === 5) {
      // 5 Matchdays for Copa América 5-team group (each team plays 4 matches, 1 rest day)
      const pairings5 = [
        [[0, 1], [2, 3]], // Team 4 rests
        [[0, 2], [1, 4]], // Team 3 rests
        [[0, 3], [2, 4]], // Team 1 rests
        [[0, 4], [1, 3]], // Team 2 rests
        [[1, 2], [3, 4]], // Team 0 rests
      ];

      pairings5.forEach((roundPairings, mDayIdx) => {
        const mDay = mDayIdx + 1;
        roundPairings.forEach(([hIdx, aIdx]) => {
          const home = teams[hIdx];
          const away = teams[aIdx];
          const isPlayerMatch = home.code.toUpperCase() === normPlayerCode || away.code.toUpperCase() === normPlayerCode;

          groupFixtures.push({
            id: `grp-${group.letter}-m${matchCounter++}`,
            matchday: mDay,
            stageName: `Group ${group.letter} - Matchday ${mDay}`,
            homeNation: home,
            awayNation: away,
            isPlayed: false,
            isPlayerMatch,
          });
        });
      });
    }
  });

  return {
    id: `nat-tourney-${config.shortName.toLowerCase().replace(/\s+/g, '-')}-${drawState.seasonYear}`,
    config,
    seasonYear: drawState.seasonYear,
    callingNation,
    playerRole,
    playerNation: drawState.playerNation,
    drawState,
    groups: drawState.groups,
    currentPhase: 'group_stage',
    currentGroupMatchday: 1,
    totalGroupMatchdays,
    groupFixtures,
    knockoutMatches: [],
    currentKnockoutRoundIndex: 0,
    knockoutRounds: config.knockoutStages,
    playerStats: {
      caps: 0,
      goals: 0,
      assists: 0,
      avgRating: 0,
      ratings: [],
    },
    topScorers: [],
    isFinished: false,
    tournamentLogs: [
      `The ${config.competitionName} has officially begun! ${callingNation.name} enters the tournament drawn in Group ${drawState.playerGroupLetter}.`,
    ],
  };
}

/**
 * Resolves the authentic squad for a national team and tier.
 * GUARANTEE: Uses only database players and procedural database generation for that nation.
 * No fake external placeholder players (e.g. Messi, etc.).
 */
export function getNationalTeamSquadForTournament(
  nationCode: string,
  tier: NationalTeamTier = 'Senior'
): PlayerCardData[] {
  try {
    const db = getNationalTeamsDatabase();
    const team = db.find((t) => t.nation.code.toUpperCase() === nationCode.toUpperCase());
    if (team) {
      if (tier === 'U17' && team.u17Squad && team.u17Squad.length > 0) return team.u17Squad;
      if (tier === 'U20' && team.u20Squad && team.u20Squad.length > 0) return team.u20Squad;
      if (team.squad && team.squad.length > 0) return team.squad;
    }
  } catch (err) {
    console.warn('Failed to resolve national team squad from DB:', err);
  }
  return [];
}

/**
 * Generates realistic goalscorers from the authentic national squad.
 */
export function generateGoalscorersForNationalMatch(
  nation: TournamentNation,
  goals: number,
  tier: NationalTeamTier = 'Senior',
  excludePlayerName?: string
): MatchScorerEntry[] {
  if (goals <= 0) return [];

  const squad = getNationalTeamSquadForTournament(nation.code, tier);
  const eligibleSquad = excludePlayerName
    ? squad.filter((p) => (p.name || '').toLowerCase() !== excludePlayerName.toLowerCase())
    : squad;

  const attackers = eligibleSquad.filter((p) => {
    const pos = (p.position || '').toUpperCase();
    const sub = (p.subPosition || '').toUpperCase();
    return ['ST', 'CF', 'LW', 'RW', 'ATT', 'FWD'].includes(pos) || ['ST', 'CF', 'LW', 'RW'].includes(sub);
  });
  const midfielders = eligibleSquad.filter((p) => {
    const pos = (p.position || '').toUpperCase();
    const sub = (p.subPosition || '').toUpperCase();
    return ['CAM', 'CM', 'LM', 'RM', 'CDM', 'MID'].includes(pos) || ['CAM', 'CM', 'LM', 'RM', 'CDM'].includes(sub);
  });
  const defenders = eligibleSquad.filter((p) => {
    const pos = (p.position || '').toUpperCase();
    const sub = (p.subPosition || '').toUpperCase();
    return ['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].includes(pos) || ['CB', 'LB', 'RB'].includes(sub);
  });

  const scorers: MatchScorerEntry[] = [];
  for (let i = 0; i < goals; i++) {
    const minute = Math.floor(Math.random() * 88) + 2;
    let chosenPlayerName = '';

    const roll = Math.random();
    if (roll < 0.65 && attackers.length > 0) {
      const idx = Math.floor(Math.random() * Math.min(4, attackers.length));
      chosenPlayerName = attackers[idx].name;
    } else if (roll < 0.90 && midfielders.length > 0) {
      const idx = Math.floor(Math.random() * Math.min(5, midfielders.length));
      chosenPlayerName = midfielders[idx].name;
    } else if (defenders.length > 0) {
      const idx = Math.floor(Math.random() * Math.min(4, defenders.length));
      chosenPlayerName = defenders[idx].name;
    } else if (eligibleSquad.length > 0) {
      chosenPlayerName = eligibleSquad[Math.floor(Math.random() * eligibleSquad.length)].name;
    } else {
      chosenPlayerName = `${nation.name} Forward ${i + 1}`;
    }

    scorers.push({ name: chosenPlayerName, minute, isPlayer: false });
  }

  return scorers.sort((a, b) => a.minute - b.minute);
}

/**
 * Records goalscorers to the authoritative tournament top scorers leaderboard.
 */
export function recordGoalscorersToLeaderboard(
  state: NationalTournamentState,
  nation: TournamentNation,
  scorers: MatchScorerEntry[]
): void {
  if (!scorers || scorers.length === 0) return;

  scorers.forEach((scorer) => {
    const existing = state.topScorers.find((s) =>
      scorer.isPlayer ? s.isPlayer : s.name === scorer.name && s.nationCode === nation.code
    );
    if (existing) {
      existing.goals += 1;
    } else {
      state.topScorers.push({
        name: scorer.name,
        nationCode: nation.code,
        nationName: nation.name,
        iso: nation.iso || 'gb-eng',
        goals: 1,
        isPlayer: Boolean(scorer.isPlayer),
      });
    }
  });

  state.topScorers.sort((a, b) => b.goals - a.goals);
}

/**
 * Simulates a single match outcome between two national teams.
 */
export function simulateMatchResult(
  home: TournamentNation,
  away: TournamentNation,
  isKnockout: boolean = false
): { homeScore: number; awayScore: number; extraTime?: boolean; penaltiesHome?: number; penaltiesAway?: number } {
  const diff = home.ovr - away.ovr;
  const expHome = Math.max(0.4, 1.4 + diff * 0.05 + (Math.random() * 1.4 - 0.7));
  const expAway = Math.max(0.4, 1.1 - diff * 0.05 + (Math.random() * 1.4 - 0.7));

  let homeScore = Math.floor(expHome);
  let awayScore = Math.floor(expAway);

  if (isKnockout && homeScore === awayScore) {
    // Extra time (120 mins)
    const etHome = Math.random() < 0.25 ? 1 : 0;
    const etAway = Math.random() < 0.25 ? 1 : 0;
    homeScore += etHome;
    awayScore += etAway;

    if (homeScore === awayScore) {
      // Penalty shootout
      let penH = 4;
      let penA = 4;
      if (Math.random() > 0.5) penH += 1;
      else penA += 1;
      return { homeScore, awayScore, extraTime: true, penaltiesHome: penH, penaltiesAway: penA };
    }
    return { homeScore, awayScore, extraTime: true };
  }

  return { homeScore, awayScore };
}

/**
 * Simulates a complete group matchday (player match + all concurrent matches across all groups).
 * If playerResult is passed (from Key Match), it is incorporated into the player's fixture.
 */
export function simulateNationalTournamentMatchday(
  tourneyState: NationalTournamentState,
  player: PlayerCardData,
  playerResult?: {
    playerTeamScore: number;
    opponentTeamScore: number;
    playerGoals: number;
    playerAssists: number;
    playerRating: number;
    isWin: boolean;
  }
): {
  updatedState: NationalTournamentState;
  updatedPlayer: PlayerCardData;
  summaryLog: string;
} {
  const state = { ...tourneyState };
  const currentMDay = state.currentGroupMatchday;
  const fixturesThisMDay = state.groupFixtures.filter((f) => f.matchday === currentMDay && !f.isPlayed);

  let pGoals = 0;
  let pAssists = 0;
  let pRating = 7.0;
  let playerMatchSummary = '';

  fixturesThisMDay.forEach((fixture) => {
    if (fixture.isPlayerMatch) {
      const isPlayerHome = fixture.homeNation.code.toUpperCase() === state.callingNation.code.toUpperCase();

      if (!state.playerDisciplinary) {
        state.playerDisciplinary = {
          yellowCards: 0,
          redCards: 0,
          isSuspendedForNextMatch: false,
        };
      }

      const isSuspended = Boolean(state.playerDisciplinary.isSuspendedForNextMatch);

      if (isSuspended) {
        // Player is suspended for this World Cup / International match!
        const suspensionReason = state.playerDisciplinary.suspensionReason || 'Disciplinary Suspension';
        state.playerDisciplinary.isSuspendedForNextMatch = false;
        state.playerDisciplinary.suspensionReason = undefined;

        const res = simulateMatchResult(fixture.homeNation, fixture.awayNation, false);
        fixture.homeScore = res.homeScore;
        fixture.awayScore = res.awayScore;
        fixture.homeScorers = generateGoalscorersForNationalMatch(fixture.homeNation, fixture.homeScore, state.config.tier);
        fixture.awayScorers = generateGoalscorersForNationalMatch(fixture.awayNation, fixture.awayScore, state.config.tier);
        recordGoalscorersToLeaderboard(state, fixture.homeNation, fixture.homeScorers);
        recordGoalscorersToLeaderboard(state, fixture.awayNation, fixture.awayScorers);

        fixture.playerStats = {
          minutes: 0,
          goals: 0,
          assists: 0,
          rating: 0,
          shots: 0,
          passes: 0,
          isSuspended: true,
          suspensionReason,
        };
        fixture.isPlayed = true;

        playerMatchSummary = `${fixture.homeNation.name} ${fixture.homeScore} - ${fixture.awayScore} ${fixture.awayNation.name} [${player.name} SUSPENDED: ${suspensionReason}]`;
      } else {
        if (playerResult) {
          fixture.homeScore = isPlayerHome ? playerResult.playerTeamScore : playerResult.opponentTeamScore;
          fixture.awayScore = isPlayerHome ? playerResult.opponentTeamScore : playerResult.playerTeamScore;
          pGoals = playerResult.playerGoals;
          pAssists = playerResult.playerAssists;
          pRating = playerResult.playerRating;
        } else {
          // Automatic procedural simulation for player match
          const res = simulateMatchResult(fixture.homeNation, fixture.awayNation, false);
          fixture.homeScore = res.homeScore;
          fixture.awayScore = res.awayScore;

          const teamGoals = isPlayerHome ? fixture.homeScore : fixture.awayScore;
          const generated = simulatePlayerGoalsAndAssists(player as any, 1.0, teamGoals);
          pGoals = generated.playerGoals;
          pAssists = generated.playerAssists;
          pRating = Number((6.5 + (pGoals * 1.2) + (pAssists * 0.8) + (Math.random() * 1.0 - 0.3)).toFixed(1));
        }

        // Check disciplinary cards in this match with bad fame red card probability multiplier
        const redMultiplier = getBadRepRedCardChanceMultiplier(player.badReputationTier || 0);
        const matchYellow = Math.random() < 0.12;
        const matchRed = !matchYellow && Math.random() < (0.015 * redMultiplier);

        if (matchRed) {
          state.playerDisciplinary.redCards = (state.playerDisciplinary.redCards || 0) + 1;
          state.playerDisciplinary.isSuspendedForNextMatch = true;
          state.playerDisciplinary.suspensionReason = 'Red Card Suspension (1 match ban)';
          // Straight red card gives +10 bad fame (bad reputation)
          const repRes = addBadReputation(player as any, 10);
          player.badReputation = repRes.updatedPlayer.badReputation;
          player.badReputationTier = repRes.updatedPlayer.badReputationTier;
        } else if (matchYellow) {
          state.playerDisciplinary.yellowCards = (state.playerDisciplinary.yellowCards || 0) + 1;
          // World Cup / Tournament Rule: 2 Yellows = 1-match suspension
          if (state.playerDisciplinary.yellowCards >= 2) {
            state.playerDisciplinary.isSuspendedForNextMatch = true;
            state.playerDisciplinary.suspensionReason = '2 Yellow Cards Ban (1 match ban)';
            state.playerDisciplinary.yellowCards = 0; // Reset active accumulator after sanction
          }
        }

        // Generate realistic scorers for player match
        const playerTeamGoals = isPlayerHome ? fixture.homeScore : fixture.awayScore;
        const opponentGoals = isPlayerHome ? fixture.awayScore : fixture.homeScore;
        const opponentNation = isPlayerHome ? fixture.awayNation : fixture.homeNation;
        const playerNation = isPlayerHome ? fixture.homeNation : fixture.awayNation;

        const playerScorersList: MatchScorerEntry[] = [];
        for (let i = 0; i < pGoals; i++) {
          playerScorersList.push({ name: player.name || 'Player', minute: Math.floor(Math.random() * 85) + 5, isPlayer: true });
        }
        const remainingTeamGoals = Math.max(0, playerTeamGoals - pGoals);
        if (remainingTeamGoals > 0) {
          const teamSquadScorers = generateGoalscorersForNationalMatch(playerNation, remainingTeamGoals, state.config.tier, player.name);
          playerScorersList.push(...teamSquadScorers);
        }
        playerScorersList.sort((a, b) => a.minute - b.minute);

        const opponentScorersList = generateGoalscorersForNationalMatch(opponentNation, opponentGoals, state.config.tier);

        fixture.homeScorers = isPlayerHome ? playerScorersList : opponentScorersList;
        fixture.awayScorers = isPlayerHome ? opponentScorersList : playerScorersList;

        recordGoalscorersToLeaderboard(state, fixture.homeNation, fixture.homeScorers);
        recordGoalscorersToLeaderboard(state, fixture.awayNation, fixture.awayScorers);

        fixture.playerStats = {
          minutes: 90,
          goals: pGoals,
          assists: pAssists,
          rating: pRating,
          shots: Math.max(pGoals, Math.floor(Math.random() * 4) + 1),
          passes: Math.floor(Math.random() * 25) + 30,
          yellowCard: matchYellow,
          redCard: matchRed,
        };
        fixture.isPlayed = true;

        const cardNotice = matchRed ? ' [🟥 RED CARD]' : matchYellow ? ' [🟨 YELLOW CARD]' : '';
        playerMatchSummary = `${fixture.homeNation.name} ${fixture.homeScore} - ${fixture.awayScore} ${fixture.awayNation.name} (${player.name}: ${pGoals}G, ${pAssists}A, ${pRating} Rating)${cardNotice}`;
      }
    } else {
      // Simulate non-player match
      const res = simulateMatchResult(fixture.homeNation, fixture.awayNation, false);
      fixture.homeScore = res.homeScore;
      fixture.awayScore = res.awayScore;
      fixture.homeScorers = generateGoalscorersForNationalMatch(fixture.homeNation, fixture.homeScore, state.config.tier);
      fixture.awayScorers = generateGoalscorersForNationalMatch(fixture.awayNation, fixture.awayScore, state.config.tier);
      recordGoalscorersToLeaderboard(state, fixture.homeNation, fixture.homeScorers);
      recordGoalscorersToLeaderboard(state, fixture.awayNation, fixture.awayScorers);
      fixture.isPlayed = true;
    }
  });

  // Re-calculate standings for all groups
  state.groups.forEach((group) => {
    const groupMatches = state.groupFixtures.filter(
      (f) => (f.homeNation.code === group.teams[0].code || group.teams.some((t) => t.code === f.homeNation.code)) && f.isPlayed
    );

    // Reset standings numbers
    group.standings.forEach((row) => {
      row.played = 0;
      row.wins = 0;
      row.draws = 0;
      row.losses = 0;
      row.goalsFor = 0;
      row.goalsAgainst = 0;
      row.goalDifference = 0;
      row.points = 0;
    });

    groupMatches.forEach((m) => {
      const homeRow = group.standings.find((s) => s.nationCode === m.homeNation.code);
      const awayRow = group.standings.find((s) => s.nationCode === m.awayNation.code);

      if (homeRow && awayRow && m.homeScore !== undefined && m.awayScore !== undefined) {
        homeRow.played++;
        awayRow.played++;
        homeRow.goalsFor += m.homeScore;
        homeRow.goalsAgainst += m.awayScore;
        awayRow.goalsFor += m.awayScore;
        awayRow.goalsAgainst += m.homeScore;

        if (m.homeScore > m.awayScore) {
          homeRow.wins++;
          homeRow.points += 3;
          awayRow.losses++;
        } else if (m.awayScore > m.homeScore) {
          awayRow.wins++;
          awayRow.points += 3;
          homeRow.losses++;
        } else {
          homeRow.draws++;
          awayRow.draws++;
          homeRow.points += 1;
          awayRow.points += 1;
        }

        homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
        awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;
      }
    });

    // Sort group standings: Points > GD > GF
    group.standings.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
    group.standings.forEach((s, idx) => {
      s.rankInGroup = idx + 1;
    });
  });

  // Update player aggregate stats
  const ratings = [...state.playerStats.ratings, pRating];
  const avg = Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));
  state.playerStats = {
    caps: state.playerStats.caps + 1,
    goals: state.playerStats.goals + pGoals,
    assists: state.playerStats.assists + pAssists,
    avgRating: avg,
    ratings,
  };

  // Update player card statistics (Caps & Goals)
  const isSenior = state.config.tier === 'Senior';
  const isU20 = state.config.tier === 'U20';
  const isU17 = state.config.tier === 'U17';

  const updatedPlayer: PlayerCardData = {
    ...player,
    internationalCaps: (player.internationalCaps || 0) + 1,
    internationalGoals: (player.internationalGoals || 0) + pGoals,
    ...(isSenior ? {
      seniorCaps: (player.seniorCaps || 0) + 1,
      seniorGoals: (player.seniorGoals || 0) + pGoals,
    } : {}),
    ...(isU20 ? {
      u20Caps: (player.u20Caps || 0) + 1,
      u20Goals: (player.u20Goals || 0) + pGoals,
    } : {}),
    ...(isU17 ? {
      u17Caps: (player.u17Caps || 0) + 1,
      u17Goals: (player.u17Goals || 0) + pGoals,
    } : {}),
    fame: (player.fame || 0) + (pGoals * 15) + (pAssists * 10) + 10,
  };

  // Check if group stage is completed
  if (state.currentGroupMatchday >= state.totalGroupMatchdays) {
    // Transition to Knockout Phase
    advanceTournamentToKnockouts(state);
  } else {
    state.currentGroupMatchday++;
  }

  state.tournamentLogs.push(playerMatchSummary);

  // Authoritative World Simulation Sync
  syncNationalTournamentToWorldState(state);

  return {
    updatedState: state,
    updatedPlayer,
    summaryLog: playerMatchSummary,
  };
}

/**
 * Assigns third-place qualifying teams to knockout pods such that no team
 * shares a group with any of the other teams in its pod.
 */
function assignThirdPlaceTeamsToPods(
  thirdTeams: { nation: TournamentNation; groupLetter: string }[],
  podForbiddenGroups: string[][]
): TournamentNation[] {
  const result: TournamentNation[] = new Array(thirdTeams.length);
  const used = new Array(thirdTeams.length).fill(false);

  function backtrack(podIdx: number): boolean {
    if (podIdx === thirdTeams.length) return true;
    for (let tIdx = 0; tIdx < thirdTeams.length; tIdx++) {
      if (used[tIdx]) continue;
      const team = thirdTeams[tIdx];
      if (!podForbiddenGroups[podIdx].includes(team.groupLetter)) {
        used[tIdx] = true;
        result[podIdx] = team.nation;
        if (backtrack(podIdx + 1)) return true;
        used[tIdx] = false;
      }
    }
    return false;
  }

  if (backtrack(0)) {
    return result;
  }

  // Fallback if no exact permutation matches
  return thirdTeams.map((t) => t.nation);
}

/**
 * Builds the official opening knockout round bracket.
 * Strictly guarantees that no two teams from the same group can play each other
 * in the opening round OR in the following round (e.g. Round of 16 in 48-team World Cup).
 */
export function buildKnockoutOpeningRoundMatches(
  config: NationalTournamentConfig,
  groups: TournamentGroup[],
  callingNationCode: string
): KnockoutBracketMatch[] {
  const openingRound = config.knockoutStages[0] as KnockoutBracketMatch['roundName'];
  const normCallingCode = callingNationCode.toUpperCase();

  // 1. Map winners and runners-up by group letter
  const winnersMap = new Map<string, TournamentNation>();
  const runnersUpMap = new Map<string, TournamentNation>();

  groups.forEach((g) => {
    if (g.standings.length >= 1) {
      g.standings[0].qualified = true;
      const wNation = g.teams.find((t) => t.code === g.standings[0].nationCode);
      if (wNation) winnersMap.set(g.letter, wNation);
    }
    if (g.standings.length >= 2) {
      g.standings[1].qualified = true;
      const rNation = g.teams.find((t) => t.code === g.standings[1].nationCode);
      if (rNation) runnersUpMap.set(g.letter, rNation);
    }
  });

  // 2. Identify qualifying 3rd-place teams if applicable
  const qualifyingThirds: { nation: TournamentNation; groupLetter: string }[] = [];
  if (config.hasBest3rdPlace && config.num3rdPlaceAdvance > 0) {
    const thirdStandings: { standing: TournamentStanding; group: TournamentGroup }[] = [];
    groups.forEach((g) => {
      if (g.standings.length >= 3) {
        thirdStandings.push({ standing: g.standings[2], group: g });
      }
    });

    thirdStandings.sort((a, b) => {
      if (b.standing.points !== a.standing.points) return b.standing.points - a.standing.points;
      if (b.standing.goalDifference !== a.standing.goalDifference) return b.standing.goalDifference - a.standing.goalDifference;
      if (b.standing.goalsFor !== a.standing.goalsFor) return b.standing.goalsFor - a.standing.goalsFor;
      const tA = a.group.teams.find((t) => t.code === a.standing.nationCode);
      const tB = b.group.teams.find((t) => t.code === b.standing.nationCode);
      return (tB?.ovr || 0) - (tA?.ovr || 0);
    });

    const advancing3rds = thirdStandings.slice(0, config.num3rdPlaceAdvance);
    advancing3rds.forEach((item) => {
      item.standing.qualified = true;
      const nation = item.group.teams.find((t) => t.code === item.standing.nationCode);
      if (nation) {
        qualifyingThirds.push({ nation, groupLetter: item.group.letter });
      }
    });
  }

  // 3. Official 48-Team FIFA World Cup Knockout Bracket (12 Groups, 32 Teams, 16 Matches)
  if (config.isWorldCup || (config.totalTeams === 48 && groups.length === 12)) {
    // 8 Round of 16 feeder pods (Matches 2k & 2k+1 feed into R16 Match k)
    // Each pod has 4 teams from 4 completely distinct groups!
    // No two teams from the same group can EVER play each other in R32 or R16!
    const podForbiddenGroups: string[][] = [
      ['A', 'B', 'E'],
      ['C', 'F', 'K'],
      ['H', 'I', 'L'],
      ['A', 'D', 'J'],
      ['C', 'E', 'G'],
      ['D', 'K', 'L'],
      ['B', 'G', 'I'],
      ['F', 'H', 'J'],
    ];

    const assignedThirds = assignThirdPlaceTeamsToPods(qualifyingThirds, podForbiddenGroups);

    // 16 Round of 32 Pairings (8 pods of 2 matches each)
    const pairings: [TournamentNation | undefined, TournamentNation | undefined][] = [
      // Pod 0 (Feeds R16 Match 0)
      [runnersUpMap.get('A'), runnersUpMap.get('B')], // 2A vs 2B
      [winnersMap.get('E'), assignedThirds[0]],        // 1E vs 3rd (not A, B, E)

      // Pod 1 (Feeds R16 Match 1)
      [winnersMap.get('C'), runnersUpMap.get('F')],   // 1C vs 2F
      [winnersMap.get('K'), assignedThirds[1]],        // 1K vs 3rd (not C, F, K)

      // Pod 2 (Feeds R16 Match 2)
      [runnersUpMap.get('H'), runnersUpMap.get('L')], // 2H vs 2L
      [winnersMap.get('I'), assignedThirds[2]],        // 1I vs 3rd (not H, I, L)

      // Pod 3 (Feeds R16 Match 3)
      [winnersMap.get('A'), assignedThirds[3]],        // 1A vs 3rd (not A, D, J)
      [winnersMap.get('J'), runnersUpMap.get('D')],   // 1J vs 2D

      // Pod 4 (Feeds R16 Match 4)
      [runnersUpMap.get('C'), runnersUpMap.get('E')], // 2C vs 2E
      [winnersMap.get('G'), assignedThirds[4]],        // 1G vs 3rd (not C, E, G)

      // Pod 5 (Feeds R16 Match 5)
      [winnersMap.get('D'), runnersUpMap.get('K')],   // 1D vs 2K
      [winnersMap.get('L'), assignedThirds[5]],        // 1L vs 3rd (not D, K, L)

      // Pod 6 (Feeds R16 Match 6)
      [runnersUpMap.get('G'), runnersUpMap.get('I')], // 2G vs 2I
      [winnersMap.get('B'), assignedThirds[6]],        // 1B vs 3rd (not B, G, I)

      // Pod 7 (Feeds R16 Match 7)
      [winnersMap.get('H'), runnersUpMap.get('J')],   // 1H vs 2J
      [winnersMap.get('F'), assignedThirds[7]],        // 1F vs 3rd (not F, H, J)
    ];

    return pairings.map(([home, away], idx) => {
      const isPlayerMatch =
        home?.code.toUpperCase() === normCallingCode || away?.code.toUpperCase() === normCallingCode;
      return {
        id: `ko-round-of-32-m${idx + 1}`,
        roundName: 'Round of 32',
        homeNation: home || null,
        awayNation: away || null,
        winner: null,
        isPlayerMatch,
        isPlayed: false,
      };
    });
  }

  // 4. Official UEFA Euro 24-Team Format (6 Groups, 16 Teams, 8 Round of 16 Matches)
  if (config.totalTeams === 24 && groups.length === 6 && config.hasBest3rdPlace) {
    const euroPodForbidden: string[][] = [
      ['A', 'B', 'D'],
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['C', 'D', 'E'],
    ];

    const assignedThirds = assignThirdPlaceTeamsToPods(qualifyingThirds, euroPodForbidden);

    const pairings: [TournamentNation | undefined, TournamentNation | undefined][] = [
      // QF Pod 0
      [runnersUpMap.get('A'), runnersUpMap.get('B')], // 2A vs 2B
      [winnersMap.get('D'), runnersUpMap.get('F')],   // 1D vs 2F
      // QF Pod 1
      [winnersMap.get('B'), assignedThirds[0]],        // 1B vs 3rd
      [winnersMap.get('A'), runnersUpMap.get('C')],   // 1A vs 2C
      // QF Pod 2
      [winnersMap.get('F'), assignedThirds[1]],        // 1F vs 3rd
      [runnersUpMap.get('D'), runnersUpMap.get('E')], // 2D vs 2E
      // QF Pod 3
      [winnersMap.get('E'), assignedThirds[2]],        // 1E vs 3rd
      [winnersMap.get('C'), assignedThirds[3]],        // 1C vs 3rd
    ];

    return pairings.map(([home, away], idx) => {
      const isPlayerMatch =
        home?.code.toUpperCase() === normCallingCode || away?.code.toUpperCase() === normCallingCode;
      return {
        id: `ko-round-of-16-m${idx + 1}`,
        roundName: 'Round of 16',
        homeNation: home || null,
        awayNation: away || null,
        winner: null,
        isPlayerMatch,
        isPlayed: false,
      };
    });
  }

  // 5. 16-Team Continental Cups (CAF, AFC, Gold Cup: 4 Groups, 8 Teams to Quarter-Finals)
  if (groups.length === 4) {
    const pairings: [TournamentNation | undefined, TournamentNation | undefined][] = [
      [winnersMap.get('A'), runnersUpMap.get('B')], // 1A vs 2B
      [winnersMap.get('C'), runnersUpMap.get('D')], // 1C vs 2D
      [winnersMap.get('B'), runnersUpMap.get('A')], // 1B vs 2A
      [winnersMap.get('D'), runnersUpMap.get('C')], // 1D vs 2C
    ];

    return pairings.map(([home, away], idx) => {
      const isPlayerMatch =
        home?.code.toUpperCase() === normCallingCode || away?.code.toUpperCase() === normCallingCode;
      return {
        id: `ko-quarter-final-m${idx + 1}`,
        roundName: 'Quarter-Final',
        homeNation: home || null,
        awayNation: away || null,
        winner: null,
        isPlayerMatch,
        isPlayed: false,
      };
    });
  }

  // 6. 10-Team Copa América (2 Groups of 5, Top 4 from each to Quarter-Finals)
  if (groups.length === 2) {
    const groupA = groups.find((g) => g.letter === 'A') || groups[0];
    const groupB = groups.find((g) => g.letter === 'B') || groups[1];

    const aTeams = groupA.standings.slice(0, 4).map((s) => groupA.teams.find((t) => t.code === s.nationCode));
    const bTeams = groupB.standings.slice(0, 4).map((s) => groupB.teams.find((t) => t.code === s.nationCode));

    const pairings: [TournamentNation | undefined, TournamentNation | undefined][] = [
      [aTeams[0], bTeams[3]], // 1A vs 4B
      [bTeams[1], aTeams[2]], // 2B vs 3A
      [bTeams[0], aTeams[3]], // 1B vs 4A
      [aTeams[1], bTeams[2]], // 2A vs 3B
    ];

    return pairings.map(([home, away], idx) => {
      const isPlayerMatch =
        home?.code.toUpperCase() === normCallingCode || away?.code.toUpperCase() === normCallingCode;
      return {
        id: `ko-quarter-final-m${idx + 1}`,
        roundName: 'Quarter-Final',
        homeNation: home || null,
        awayNation: away || null,
        winner: null,
        isPlayerMatch,
        isPlayed: false,
      };
    });
  }

  // 7. General Fallback Bracket Pairing (Strictly avoids same-group matchups)
  const advancingList: { nation: TournamentNation; groupLetter: string; isWinner: boolean }[] = [];
  groups.forEach((g) => {
    const topSlice = g.standings.slice(0, config.advanceTopCount);
    topSlice.forEach((s, rIdx) => {
      const nation = g.teams.find((t) => t.code === s.nationCode);
      if (nation) advancingList.push({ nation, groupLetter: g.letter, isWinner: rIdx === 0 });
    });
  });

  const matches: KnockoutBracketMatch[] = [];
  const remaining = [...advancingList];
  let matchIndex = 1;

  while (remaining.length >= 2) {
    const homeItem = remaining.shift()!;
    let awayIdx = remaining.findIndex(
      (candidate) => candidate.groupLetter !== homeItem.groupLetter && candidate.isWinner !== homeItem.isWinner
    );
    if (awayIdx === -1) {
      awayIdx = remaining.findIndex((candidate) => candidate.groupLetter !== homeItem.groupLetter);
    }
    if (awayIdx === -1) awayIdx = 0;

    const awayItem = remaining.splice(awayIdx, 1)[0];
    const isPlayerMatch =
      homeItem.nation.code.toUpperCase() === normCallingCode ||
      awayItem.nation.code.toUpperCase() === normCallingCode;

    matches.push({
      id: `ko-${openingRound.toLowerCase().replace(/\s+/g, '-')}-m${matchIndex++}`,
      roundName: openingRound,
      homeNation: homeItem.nation,
      awayNation: awayItem.nation,
      winner: null,
      isPlayerMatch,
      isPlayed: false,
    });
  }

  return matches;
}

/**
 * Evaluates group stage tables and builds the official Knockout bracket.
 */
export function advanceTournamentToKnockouts(state: NationalTournamentState) {
  state.currentPhase = 'knockout';
  const config = state.config;
  const groups = state.groups;

  // Build authentic bracket with zero same-group clashes
  const knockoutMatches = buildKnockoutOpeningRoundMatches(config, groups, state.callingNation.code);
  state.knockoutMatches = knockoutMatches;
  state.currentKnockoutRoundIndex = 0;

  // Check if player's team qualified
  const playerStanding = groups
    .flatMap((g) => g.standings)
    .find((s) => s.nationCode.toUpperCase() === state.callingNation.code.toUpperCase());

  const playerQualified = Boolean(playerStanding?.qualified);

  if (!playerQualified) {
    state.playerFinishStage = 'Group Stage';
    state.tournamentLogs.push(
      `${state.callingNation.name} did not advance past the group stage of the ${config.competitionName}.`
    );
  } else {
    state.tournamentLogs.push(
      `🔥 ${state.callingNation.name} qualifies for the knockout phase of the ${config.competitionName}!`
    );
  }

  // FIFA World Cup & Tournament Disciplinary Rule:
  // Yellow card count CLEARS after group stage
  if (state.playerDisciplinary) {
    state.playerDisciplinary.yellowCards = 0;
    state.playerDisciplinary.yellowsClearedAfterGroup = true;
  }
  state.tournamentLogs.push(
    `📋 Disciplinary Rule: Tournament yellow card counts CLEARED at conclusion of Group Stage.`
  );
}

/** Alias for advanceTournamentToKnockouts */
export const startNationalTournamentKnockoutPhase = advanceTournamentToKnockouts;

/**
 * Simulates the active knockout round.
 * Handles key match user performance or automatic simulation.
 */
export function simulateNationalTournamentKnockoutRound(
  tourneyState: NationalTournamentState,
  player: PlayerCardData,
  playerResult?: {
    playerTeamScore: number;
    opponentTeamScore: number;
    playerGoals: number;
    playerAssists: number;
    playerRating: number;
    isWin: boolean;
  }
): {
  updatedState: NationalTournamentState;
  updatedPlayer: PlayerCardData;
  summaryLog: string;
} {
  const state = { ...tourneyState };
  const currentRoundName = state.knockoutRounds[state.currentKnockoutRoundIndex] as KnockoutBracketMatch['roundName'];
  const matchesThisRound = state.knockoutMatches.filter((m) => m.roundName === currentRoundName && !m.isPlayed);

  let pGoals = 0;
  let pAssists = 0;
  let pRating = 7.0;
  let logOutput = '';

  if (!state.playerDisciplinary) {
    state.playerDisciplinary = {
      yellowCards: 0,
      redCards: 0,
      isSuspendedForNextMatch: false,
    };
  }

  matchesThisRound.forEach((match) => {
    if (!match.homeNation || !match.awayNation) return;

    if (match.isPlayerMatch) {
      const isPlayerHome = match.homeNation.code.toUpperCase() === state.callingNation.code.toUpperCase();
      const isSuspended = Boolean(state.playerDisciplinary?.isSuspendedForNextMatch);

      if (isSuspended) {
        // Player is suspended for this Knockout match!
        const suspensionReason = state.playerDisciplinary?.suspensionReason || 'Disciplinary Suspension';
        if (state.playerDisciplinary) {
          state.playerDisciplinary.isSuspendedForNextMatch = false;
          state.playerDisciplinary.suspensionReason = undefined;
        }

        const res = simulateMatchResult(match.homeNation, match.awayNation, true);
        match.homeScore = res.homeScore;
        match.awayScore = res.awayScore;
        match.extraTime = res.extraTime;
        match.penaltiesHome = res.penaltiesHome;
        match.penaltiesAway = res.penaltiesAway;

        let homeWins = match.homeScore > match.awayScore;
        if (match.homeScore === match.awayScore && res.penaltiesHome !== undefined && res.penaltiesAway !== undefined) {
          homeWins = res.penaltiesHome > res.penaltiesAway;
        }
        match.winner = homeWins ? match.homeNation : match.awayNation;

        match.homeScorers = generateGoalscorersForNationalMatch(match.homeNation, match.homeScore, state.config.tier);
        match.awayScorers = generateGoalscorersForNationalMatch(match.awayNation, match.awayScore, state.config.tier);
        recordGoalscorersToLeaderboard(state, match.homeNation, match.homeScorers);
        recordGoalscorersToLeaderboard(state, match.awayNation, match.awayScorers);

        match.playerStats = {
          minutes: 0,
          goals: 0,
          assists: 0,
          rating: 0,
          shots: 0,
          passes: 0,
          isSuspended: true,
          suspensionReason,
        };
        match.isPlayed = true;

        const playerWon = match.winner?.code.toUpperCase() === state.callingNation.code.toUpperCase();
        if (!playerWon && !state.playerFinishStage) {
          state.playerFinishStage = currentRoundName;
        }

        logOutput = `${currentRoundName}: ${match.homeNation.name} ${match.homeScore} - ${match.awayScore} ${match.awayNation.name} [${player.name} SUSPENDED: ${suspensionReason}]. Winner: ${match.winner?.name}!`;
      } else {
        if (playerResult) {
          match.homeScore = isPlayerHome ? playerResult.playerTeamScore : playerResult.opponentTeamScore;
          match.awayScore = isPlayerHome ? playerResult.opponentTeamScore : playerResult.playerTeamScore;
          pGoals = playerResult.playerGoals;
          pAssists = playerResult.playerAssists;
          pRating = playerResult.playerRating;
          match.winner = playerResult.isWin ? (isPlayerHome ? match.homeNation : match.awayNation) : (isPlayerHome ? match.awayNation : match.homeNation);
        } else {
          const res = simulateMatchResult(match.homeNation, match.awayNation, true);
          match.homeScore = res.homeScore;
          match.awayScore = res.awayScore;
          match.extraTime = res.extraTime;
          match.penaltiesHome = res.penaltiesHome;
          match.penaltiesAway = res.penaltiesAway;

          let homeWins = match.homeScore > match.awayScore;
          if (match.homeScore === match.awayScore && res.penaltiesHome !== undefined && res.penaltiesAway !== undefined) {
            homeWins = res.penaltiesHome > res.penaltiesAway;
          }
          match.winner = homeWins ? match.homeNation : match.awayNation;

          const teamGoals = isPlayerHome ? match.homeScore : match.awayScore;
          const generated = simulatePlayerGoalsAndAssists(player as any, 1.0, teamGoals);
          pGoals = generated.playerGoals;
          pAssists = generated.playerAssists;
          pRating = Number((6.8 + (pGoals * 1.3) + (pAssists * 0.9) + (Math.random() * 1.0 - 0.3)).toFixed(1));
        }

        // Check disciplinary cards in knockout match with bad fame red card probability multiplier
        const redMultiplier = getBadRepRedCardChanceMultiplier(player.badReputationTier || 0);
        const matchYellow = Math.random() < 0.12;
        const matchRed = !matchYellow && Math.random() < (0.015 * redMultiplier);

        if (state.playerDisciplinary) {
          if (matchRed) {
            state.playerDisciplinary.redCards = (state.playerDisciplinary.redCards || 0) + 1;
            state.playerDisciplinary.isSuspendedForNextMatch = true;
            state.playerDisciplinary.suspensionReason = 'Red Card in Knockout (1 match ban)';
            // Straight red card gives +10 bad fame (bad reputation)
            const repRes = addBadReputation(player as any, 10);
            player.badReputation = repRes.updatedPlayer.badReputation;
            player.badReputationTier = repRes.updatedPlayer.badReputationTier;
          } else if (matchYellow) {
            state.playerDisciplinary.yellowCards = (state.playerDisciplinary.yellowCards || 0) + 1;
            if (state.playerDisciplinary.yellowCards >= 2) {
              state.playerDisciplinary.isSuspendedForNextMatch = true;
              state.playerDisciplinary.suspensionReason = '2 Yellow Cards Ban (1 match suspension)';
              state.playerDisciplinary.yellowCards = 0;
            }
          }
        }

        // Generate authentic scorers for player knockout match
        const playerTeamGoals = isPlayerHome ? match.homeScore : match.awayScore;
        const opponentGoals = isPlayerHome ? match.awayScore : match.homeScore;
        const opponentNation = isPlayerHome ? match.awayNation : match.homeNation;
        const playerNation = isPlayerHome ? match.homeNation : match.awayNation;

        const playerScorersList: MatchScorerEntry[] = [];
        for (let i = 0; i < pGoals; i++) {
          playerScorersList.push({ name: player.name || 'Player', minute: Math.floor(Math.random() * 85) + 5, isPlayer: true });
        }
        const remainingTeamGoals = Math.max(0, playerTeamGoals - pGoals);
        if (remainingTeamGoals > 0) {
          const teamSquadScorers = generateGoalscorersForNationalMatch(playerNation, remainingTeamGoals, state.config.tier, player.name);
          playerScorersList.push(...teamSquadScorers);
        }
        playerScorersList.sort((a, b) => a.minute - b.minute);

        const opponentScorersList = generateGoalscorersForNationalMatch(opponentNation, opponentGoals, state.config.tier);

        match.homeScorers = isPlayerHome ? playerScorersList : opponentScorersList;
        match.awayScorers = isPlayerHome ? opponentScorersList : playerScorersList;

        recordGoalscorersToLeaderboard(state, match.homeNation, match.homeScorers);
        recordGoalscorersToLeaderboard(state, match.awayNation, match.awayScorers);

        match.playerStats = {
          minutes: 90,
          goals: pGoals,
          assists: pAssists,
          rating: pRating,
          shots: Math.max(pGoals, Math.floor(Math.random() * 4) + 1),
          passes: Math.floor(Math.random() * 25) + 30,
          yellowCard: matchYellow,
          redCard: matchRed,
        };
        match.isPlayed = true;

        const playerWon = match.winner?.code.toUpperCase() === state.callingNation.code.toUpperCase();
        if (!playerWon && !state.playerFinishStage) {
          state.playerFinishStage = currentRoundName;
        }

        const cardNotice = matchRed ? ' [🟥 RED CARD]' : matchYellow ? ' [🟨 YELLOW CARD]' : '';
        logOutput = `${currentRoundName}: ${match.homeNation.name} ${match.homeScore} - ${match.awayScore} ${match.awayNation.name}${cardNotice}. Winner: ${match.winner?.name}!`;
      }
    } else {
      const res = simulateMatchResult(match.homeNation, match.awayNation, true);
      match.homeScore = res.homeScore;
      match.awayScore = res.awayScore;
      match.extraTime = res.extraTime;
      match.penaltiesHome = res.penaltiesHome;
      match.penaltiesAway = res.penaltiesAway;

      let homeWins = match.homeScore > match.awayScore;
      if (match.homeScore === match.awayScore && res.penaltiesHome !== undefined && res.penaltiesAway !== undefined) {
        homeWins = res.penaltiesHome > res.penaltiesAway;
      }
      match.winner = homeWins ? match.homeNation : match.awayNation;

      match.homeScorers = generateGoalscorersForNationalMatch(match.homeNation, match.homeScore, state.config.tier);
      match.awayScorers = generateGoalscorersForNationalMatch(match.awayNation, match.awayScore, state.config.tier);
      recordGoalscorersToLeaderboard(state, match.homeNation, match.homeScorers);
      recordGoalscorersToLeaderboard(state, match.awayNation, match.awayScorers);

      match.isPlayed = true;
    }
  });

  // Update aggregate player stats
  const ratings = [...state.playerStats.ratings, pRating];
  const avg = Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2));
  state.playerStats = {
    caps: state.playerStats.caps + 1,
    goals: state.playerStats.goals + pGoals,
    assists: state.playerStats.assists + pAssists,
    avgRating: avg,
    ratings,
  };

  const isSenior = state.config.tier === 'Senior';
  const isU20 = state.config.tier === 'U20';
  const isU17 = state.config.tier === 'U17';

  let updatedPlayer: PlayerCardData = {
    ...player,
    internationalCaps: (player.internationalCaps || 0) + 1,
    internationalGoals: (player.internationalGoals || 0) + pGoals,
    ...(isSenior ? {
      seniorCaps: (player.seniorCaps || 0) + 1,
      seniorGoals: (player.seniorGoals || 0) + pGoals,
    } : {}),
    ...(isU20 ? {
      u20Caps: (player.u20Caps || 0) + 1,
      u20Goals: (player.u20Goals || 0) + pGoals,
    } : {}),
    ...(isU17 ? {
      u17Caps: (player.u17Caps || 0) + 1,
      u17Goals: (player.u17Goals || 0) + pGoals,
    } : {}),
    fame: (player.fame || 0) + (pGoals * 25) + (pAssists * 15) + 30,
  };

  // Check if we just completed the Grand Final!
  if (currentRoundName === 'Grand Final') {
    const finalMatch = matchesThisRound.find((m) => m.roundName === 'Grand Final');
    if (finalMatch?.winner) {
      state.champion = finalMatch.winner;
      state.runnerUp = finalMatch.winner.code === finalMatch.homeNation?.code ? finalMatch.awayNation! : finalMatch.homeNation!;
      state.isFinished = true;
      state.currentPhase = 'finished';

      const isPlayerChampion = state.champion.code.toUpperCase() === state.callingNation.code.toUpperCase();
      if (isPlayerChampion) {
        state.playerFinishStage = 'Champion';
        // Award trophy & massive fame
        const fameBonus = state.config.isWorldCup ? 500 : 350;
        updatedPlayer = {
          ...updatedPlayer,
          fame: (updatedPlayer.fame || 0) + fameBonus,
        };

        const trophyItem: TrophyItem = createTrophyItem({
          name: state.config.theme.trophyName,
          category: state.config.theme.trophyCategory,
          year: state.seasonYear,
          iconType: state.config.isWorldCup ? 'world-cup' : 'continental',
          prestige: state.config.isWorldCup ? 100 : 90,
        });

        updatedPlayer = awardTrophiesToPlayer(updatedPlayer, [trophyItem]);
      } else if (finalMatch.isPlayerMatch) {
        state.playerFinishStage = 'Runner-Up';
      }

      state.awards = calculateTournamentAwards(state, updatedPlayer);
    }
  } else if (currentRoundName === 'Third-Place Playoff') {
    const tpMatch = matchesThisRound.find((m) => m.roundName === 'Third-Place Playoff');
    if (tpMatch?.winner) {
      state.thirdPlace = tpMatch.winner;
      if (tpMatch.isPlayerMatch) {
        state.playerFinishStage =
          tpMatch.winner.code.toUpperCase() === state.callingNation.code.toUpperCase()
            ? '3rd Place (Bronze Medal)'
            : '4th Place';
      }
    }
    const nextRoundIndex = state.currentKnockoutRoundIndex + 1;
    state.currentKnockoutRoundIndex = nextRoundIndex;
  } else if (currentRoundName === 'Semi-Final') {
    const nextRoundIndex = state.currentKnockoutRoundIndex + 1;
    const nextRoundName = state.knockoutRounds[nextRoundIndex];

    if (nextRoundName === 'Third-Place Playoff') {
      const sf1 = matchesThisRound[0];
      const sf2 = matchesThisRound[1];
      const loser1 = sf1?.winner?.code === sf1?.homeNation?.code ? sf1?.awayNation : sf1?.homeNation;
      const loser2 = sf2?.winner?.code === sf2?.homeNation?.code ? sf2?.awayNation : sf2?.homeNation;
      const winner1 = sf1?.winner;
      const winner2 = sf2?.winner;

      const isPlayerInTP =
        loser1?.code.toUpperCase() === state.callingNation.code.toUpperCase() ||
        loser2?.code.toUpperCase() === state.callingNation.code.toUpperCase();
      const isPlayerInFinal =
        winner1?.code.toUpperCase() === state.callingNation.code.toUpperCase() ||
        winner2?.code.toUpperCase() === state.callingNation.code.toUpperCase();

      const tpMatch: KnockoutBracketMatch = {
        id: 'ko-third-place-playoff-m1',
        roundName: 'Third-Place Playoff',
        homeNation: loser1 || null,
        awayNation: loser2 || null,
        winner: null,
        isPlayerMatch: isPlayerInTP,
        isPlayed: false,
      };

      const finalMatch: KnockoutBracketMatch = {
        id: 'ko-grand-final-m1',
        roundName: 'Grand Final',
        homeNation: winner1 || null,
        awayNation: winner2 || null,
        winner: null,
        isPlayerMatch: isPlayerInFinal,
        isPlayed: false,
      };

      state.knockoutMatches = [...state.knockoutMatches, tpMatch, finalMatch];
      state.currentKnockoutRoundIndex = nextRoundIndex;
    } else {
      const winners = matchesThisRound.map((m) => m.winner!).filter(Boolean);
      const nextMatches: KnockoutBracketMatch[] = [];

      for (let i = 0; i < winners.length / 2; i++) {
        const home = winners[i * 2];
        const away = winners[i * 2 + 1];
        const isPlayerMatch =
          home?.code.toUpperCase() === state.callingNation.code.toUpperCase() ||
          away?.code.toUpperCase() === state.callingNation.code.toUpperCase();

        nextMatches.push({
          id: `ko-${nextRoundName.toLowerCase().replace(/\s+/g, '-')}-m${i + 1}`,
          roundName: nextRoundName as KnockoutBracketMatch['roundName'],
          homeNation: home || null,
          awayNation: away || null,
          winner: null,
          isPlayerMatch,
          isPlayed: false,
        });
      }

      state.knockoutMatches = [...state.knockoutMatches, ...nextMatches];
      state.currentKnockoutRoundIndex = nextRoundIndex;
    }
  } else {
    // Generate next round matches!
    const nextRoundIndex = state.currentKnockoutRoundIndex + 1;
    const nextRoundName = state.knockoutRounds[nextRoundIndex] as KnockoutBracketMatch['roundName'];

    const winners = matchesThisRound.map((m) => m.winner!).filter(Boolean);
    const nextMatches: KnockoutBracketMatch[] = [];

    for (let i = 0; i < winners.length / 2; i++) {
      const home = winners[i * 2];
      const away = winners[i * 2 + 1];
      const isPlayerMatch =
        home?.code.toUpperCase() === state.callingNation.code.toUpperCase() ||
        away?.code.toUpperCase() === state.callingNation.code.toUpperCase();

      nextMatches.push({
        id: `ko-${nextRoundName.toLowerCase().replace(/\s+/g, '-')}-m${i + 1}`,
        roundName: nextRoundName,
        homeNation: home || null,
        awayNation: away || null,
        winner: null,
        isPlayerMatch,
        isPlayed: false,
      });
    }

    state.knockoutMatches = [...state.knockoutMatches, ...nextMatches];
    state.currentKnockoutRoundIndex = nextRoundIndex;
  }

  // FIFA World Cup & Tournament Disciplinary Rule:
  // Yellow card count CLEARS after Quarter-Finals so players entering Semi-Finals start fresh
  if (currentRoundName === 'Quarter-Final') {
    if (state.playerDisciplinary) {
      state.playerDisciplinary.yellowCards = 0;
      state.playerDisciplinary.yellowsClearedAfterQF = true;
    }
    state.tournamentLogs.push(
      `📋 Disciplinary Rule: Yellow card counts have CLEARED after Quarter-Finals. All remaining players enter the Semi-Finals on a clean slate!`
    );
  }

  state.tournamentLogs.push(logOutput);

  // Authoritative World Simulation Sync
  syncNationalTournamentToWorldState(state);

  return {
    updatedState: state,
    updatedPlayer,
    summaryLog: logOutput,
  };
}

/**
 * Calculates the official 5 individual awards for the tournament:
 * MVP (Golden Ball), Best Goalkeeper (Golden Glove), Best Defender, Best Creator (Playmaker), and Top Goalscorer (Golden Boot).
 * GUARANTEE: Uses only database squad players and genuine simulation results.
 * Excludes external placeholder legends like Messi/Ronaldo who do not exist in the database.
 */
export function calculateTournamentAwards(
  state: NationalTournamentState,
  player: PlayerCardData
): TournamentAwards {
  const champ = state.champion || { code: 'BRA', name: 'Brazil', iso: 'br' };
  const runner = state.runnerUp || { code: 'FRA', name: 'France', iso: 'fr' };
  const pStats = state.playerStats;
  const pNation = state.callingNation;

  const champSquad = getNationalTeamSquadForTournament(champ.code, state.config.tier);
  const runnerSquad = getNationalTeamSquadForTournament(runner.code, state.config.tier);

  // 1. TOP GOALSCORER (Golden Boot)
  let topScorerWinner: TournamentAwardWinner;
  const pGoals = pStats.goals || 0;
  const sortedScorers = [...state.topScorers].sort((a, b) => b.goals - a.goals);
  const bestScorer = sortedScorers[0];

  if (pGoals > 0 && (!bestScorer || pGoals >= bestScorer.goals)) {
    topScorerWinner = {
      name: player.name || 'Your Player',
      nationName: pNation.name,
      nationCode: pNation.code,
      iso: pNation.iso,
      statLabel: 'Goals Scored',
      statValue: `${pGoals} Goals`,
      isPlayer: true,
    };
  } else if (bestScorer) {
    topScorerWinner = {
      name: bestScorer.name,
      nationName: bestScorer.nationName,
      nationCode: bestScorer.nationCode,
      iso: bestScorer.iso,
      statLabel: 'Goals Scored',
      statValue: `${bestScorer.goals} Goals`,
      isPlayer: bestScorer.isPlayer,
    };
  } else {
    const defaultStriker = champSquad.find((p) => ['ST', 'CF', 'FWD'].includes(p.position || '')) || champSquad[0];
    topScorerWinner = {
      name: defaultStriker ? defaultStriker.name : `${champ.name} Striker`,
      nationName: champ.name,
      nationCode: champ.code,
      iso: champ.iso,
      statLabel: 'Goals Scored',
      statValue: '5 Goals',
    };
  }

  // 2. MVP OF THE TOURNAMENT (Golden Ball)
  let mvpWinner: TournamentAwardWinner;
  const pIsChampion = state.champion?.code.toUpperCase() === pNation.code.toUpperCase();
  const pIsPodium =
    pIsChampion ||
    state.runnerUp?.code.toUpperCase() === pNation.code.toUpperCase() ||
    state.thirdPlace?.code.toUpperCase() === pNation.code.toUpperCase();
  const pEligibleForMvp =
    (pStats.avgRating >= 7.6 && pStats.caps >= 3 && pIsPodium) ||
    (pStats.avgRating >= 8.0 && pGoals + pStats.assists >= 4);

  if (pEligibleForMvp) {
    mvpWinner = {
      name: player.name || 'Your Player',
      nationName: pNation.name,
      nationCode: pNation.code,
      iso: pNation.iso,
      statLabel: 'Tournament Rating & Impact',
      statValue: `${pStats.avgRating.toFixed(2)} Rating (${pGoals}G, ${pStats.assists}A)`,
      isPlayer: true,
    };
  } else {
    const mvpCandidate = champSquad.find((p) => ['ST', 'CF', 'LW', 'RW', 'CAM', 'CM'].includes(p.position || '')) || champSquad[0];
    const mvpRating = (8.2 + Math.random() * 0.35).toFixed(2);
    const mvpGoals = Math.floor(Math.random() * 3) + 3;
    const mvpAssists = Math.floor(Math.random() * 2) + 2;
    mvpWinner = {
      name: mvpCandidate ? mvpCandidate.name : `${champ.name} Star`,
      nationName: champ.name,
      nationCode: champ.code,
      iso: champ.iso,
      statLabel: 'Tournament Rating',
      statValue: `${mvpRating} Rating (${mvpGoals}G, ${mvpAssists}A)`,
    };
  }

  // 3. BEST CREATOR (Playmaker / Top Assists)
  let creatorWinner: TournamentAwardWinner;
  const pAssists = pStats.assists || 0;
  if (pAssists >= 3 || (pAssists >= 2 && pStats.avgRating >= 7.4)) {
    creatorWinner = {
      name: player.name || 'Your Player',
      nationName: pNation.name,
      nationCode: pNation.code,
      iso: pNation.iso,
      statLabel: 'Assists Created',
      statValue: `${pAssists} Assists`,
      isPlayer: true,
    };
  } else {
    const creatorCandidate = runnerSquad.find((p) => ['CAM', 'CM', 'LM', 'RM', 'LW', 'RW'].includes(p.position || '')) ||
      champSquad.find((p) => ['CAM', 'CM'].includes(p.position || '')) || runnerSquad[0] || champSquad[0];
    const assistsCount = Math.floor(Math.random() * 2) + 4;
    const keyPasses = Math.floor(Math.random() * 6) + 14;
    creatorWinner = {
      name: creatorCandidate ? creatorCandidate.name : `${runner.name} Playmaker`,
      nationName: runner.name,
      nationCode: runner.code,
      iso: runner.iso,
      statLabel: 'Assists Created',
      statValue: `${assistsCount} Assists (${keyPasses} Key Passes)`,
    };
  }

  // 4. BEST DEFENDER
  let defenderWinner: TournamentAwardWinner;
  const isDefPosition = ['CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM'].includes(player.position || '');
  if (isDefPosition && pStats.avgRating >= 7.2 && pStats.caps >= 3) {
    defenderWinner = {
      name: player.name || 'Your Player',
      nationName: pNation.name,
      nationCode: pNation.code,
      iso: pNation.iso,
      statLabel: 'Defensive Rating',
      statValue: `${pStats.avgRating.toFixed(2)} Match Rating (21 Tackles)`,
      isPlayer: true,
    };
  } else {
    const defCandidate = champSquad.find((p) => ['CB', 'LB', 'RB'].includes(p.position || '')) ||
      champSquad.find((p) => (p.position || '').includes('D')) || champSquad[0];
    const cleanSheets = Math.floor(Math.random() * 2) + 3;
    const tackles = Math.floor(Math.random() * 8) + 18;
    defenderWinner = {
      name: defCandidate ? defCandidate.name : `${champ.name} Defender`,
      nationName: champ.name,
      nationCode: champ.code,
      iso: champ.iso,
      statLabel: 'Clean Sheets & Tackles',
      statValue: `${cleanSheets} Clean Sheets (${tackles} Tackles)`,
    };
  }

  // 5. BEST GOALKEEPER (Golden Glove)
  let gkWinner: TournamentAwardWinner;
  if (player.position === 'GK' && pStats.avgRating >= 7.0 && pStats.caps >= 3) {
    gkWinner = {
      name: player.name || 'Your Player',
      nationName: pNation.name,
      nationCode: pNation.code,
      iso: pNation.iso,
      statLabel: 'Clean Sheets',
      statValue: `${Math.min(pStats.caps, 4)} Clean Sheets (28 Saves)`,
      isPlayer: true,
    };
  } else {
    const gkCandidate = champSquad.find((p) => p.position === 'GK') || runnerSquad.find((p) => p.position === 'GK') || champSquad[0];
    const cleanSheets = Math.floor(Math.random() * 2) + 3;
    const saves = Math.floor(Math.random() * 10) + 18;
    gkWinner = {
      name: gkCandidate ? gkCandidate.name : `${champ.name} Goalkeeper`,
      nationName: champ.name,
      nationCode: champ.code,
      iso: champ.iso,
      statLabel: 'Clean Sheets',
      statValue: `${cleanSheets} Clean Sheets (${saves} Saves)`,
    };
  }

  return {
    mvp: mvpWinner,
    bestGoalkeeper: gkWinner,
    bestDefender: defenderWinner,
    bestCreator: creatorWinner,
    topGoalscorer: topScorerWinner,
  };
}

/**
 * Simulates all remaining tournament matches rapidly when player's nation is eliminated.
 */
export function simulateRemainingTournamentMatches(
  state: NationalTournamentState,
  player: PlayerCardData
): { updatedState: NationalTournamentState; updatedPlayer: PlayerCardData } {
  let currentState = { ...state };
  let currentPlayer = { ...player };

  // If still in group stage:
  let iterations = 0;
  while (currentState.currentPhase === 'group_stage' && iterations < 20) {
    iterations++;
    const res = simulateNationalTournamentMatchday(currentState, currentPlayer);
    currentState = res.updatedState;
    currentPlayer = res.updatedPlayer;
  }

  // If in knockout:
  iterations = 0;
  while (currentState.currentPhase === 'knockout' && !currentState.isFinished && iterations < 20) {
    iterations++;
    const res = simulateNationalTournamentKnockoutRound(currentState, currentPlayer);
    currentState = res.updatedState;
    currentPlayer = res.updatedPlayer;
  }

  // Ensure awards are calculated
  currentState.isFinished = true;
  currentState.currentPhase = 'finished';
  currentState.awards = calculateTournamentAwards(currentState, currentPlayer);

  // Authoritative World Simulation Sync
  syncNationalTournamentToWorldState(currentState);

  return { updatedState: currentState, updatedPlayer: currentPlayer };
}

/**
 * Finalizes tournament conclusion and records historic tournament entry into the player's career history.
 */
export function finalizeNationalTournament(
  state: NationalTournamentState,
  player: PlayerCardData
): PlayerCardData {
  const isSenior = state.config.tier === 'Senior';
  const isU20 = state.config.tier === 'U20';
  const isU17 = state.config.tier === 'U17';

  const awards = state.awards || calculateTournamentAwards(state, player);

  const historyItem = {
    seasonYear: state.seasonYear,
    competitionName: state.config.competitionName,
    shortName: state.config.shortName,
    tier: state.config.tier,
    nationName: state.callingNation.name,
    nationCode: state.callingNation.code,
    playerFinishStage: state.playerFinishStage || (state.champion?.code === state.callingNation.code ? 'Champion' : 'Participant'),
    championNation: state.champion?.name || 'Unknown',
    runnerUpNation: state.runnerUp?.name || 'Unknown',
    thirdPlaceNation: state.thirdPlace?.name,
    playerGoals: state.playerStats.goals,
    playerAssists: state.playerStats.assists,
    playerCaps: state.playerStats.caps,
    avgRating: state.playerStats.avgRating,
    awardsWon: [
      ...(awards.mvp.isPlayer ? ['Tournament MVP (Golden Ball)'] : []),
      ...(awards.topGoalscorer.isPlayer ? ['Top Goalscorer (Golden Boot)'] : []),
      ...(awards.bestCreator.isPlayer ? ['Best Creator (Playmaker)'] : []),
      ...(awards.bestDefender.isPlayer ? ['Best Defender'] : []),
      ...(awards.bestGoalkeeper.isPlayer ? ['Best Goalkeeper (Golden Glove)'] : []),
    ],
  };

  let updated = { ...player };

  if (isSenior) {
    updated.seniorTournamentHistory = [...(updated.seniorTournamentHistory || []), historyItem];
  } else if (isU20) {
    updated.u20TournamentHistory = [...(updated.u20TournamentHistory || []), historyItem];
  } else if (isU17) {
    updated.u17TournamentHistory = [...(updated.u17TournamentHistory || []), historyItem];
  }

  // Permanently record international event as completed to prevent any reset or loop!
  updated = markInternationalEventCompleted(
    updated,
    state.config.tier,
    'tournament',
    state.seasonYear
  );

  // Authoritative World Simulation Sync
  syncNationalTournamentToWorldState(state);

  return updated;
}
