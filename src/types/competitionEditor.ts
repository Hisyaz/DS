import {
  EmblemConfig,
  CompetitionTrophyConfig,
  LeagueDesignConfig,
  LeagueStructureConfig,
  IndividualAwardsConfig,
  CompetitionSubConfig,
} from './leagueEditor';

export type CompetitionCategory = 'national' | 'continental' | 'international';

export type CompetitionType =
  | 'league'
  | 'cup'
  | 'supercup'
  | 'youth'
  | 'qualifier'
  | 'tournament';

export type ContinentalFederation =
  | 'UEFA'
  | 'CONMEBOL'
  | 'CONCACAF'
  | 'CAF'
  | 'AFC'
  | 'OFC'
  | 'FIFA';

export type QualificationSourceType =
  | 'league'
  | 'cup_winner'
  | 'prev_comp_winner'
  | 'prev_comp_champion'
  | 'host'
  | 'ranking'
  | 'manual';

export type QualificationRuleType =
  | 'top_1'
  | 'top_2'
  | 'top_3'
  | 'top_4'
  | 'top_5'
  | 'top_n'
  | 'specific_positions'
  | 'custom';

export interface QualificationPositionResult {
  position: number; // e.g. 1, 2, 3, 4
  destination: 'direct' | 'preliminary' | 'playoff' | 'none';
}

export interface QualificationRule {
  id: string;
  sourceType: QualificationSourceType;
  sourceId: string; // League ID (e.g., 'england_d1'), Cup ID, or Previous Comp ID
  sourceName?: string; // Display label for source
  ruleType: QualificationRuleType;
  topNCount?: number;
  directQualificationSpots: number;
  preliminarySpots: number;
  playoffSpots?: number;
  positionResults?: QualificationPositionResult[];
  rankingType?: 'federation' | 'club' | 'competition' | 'custom';
  description?: string;
}

export type StageType =
  | 'preliminary_round'
  | 'qualification_round'
  | 'group_stage'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_finals'
  | 'semi_finals'
  | 'third_place'
  | 'final'
  | 'league_table'
  | 'single_round_robin'
  | 'double_round_robin'
  | 'knockout_single'
  | 'knockout_two_legged';

export interface StageConfig {
  id: string;
  name: string; // e.g. "Group Stage", "Quarter-Finals", "Final"
  stageType: StageType;
  order: number;
  numGroups?: number; // e.g., 8 groups for 32 teams
  teamsPerGroup?: number; // e.g., 4
  advancePerGroup?: number; // e.g., top 2 advance
  isHomeAndAway?: boolean;
  hasExtraTime?: boolean;
  hasPenaltyShootout?: boolean;
  hasAwayGoalsRule?: boolean;
}

export interface CompetitionScheduleConfig {
  startMonth: string; // e.g., 'August' or 'June'
  endMonth: string; // e.g., 'May' or 'July'
  matchdayFrequencyDays: number; // e.g. 7 or 14
  preferredDayOfWeek?: string; // e.g. 'Wednesday' or 'Saturday'
}

export interface RegistrationRulesConfig {
  maxSquadSize: number; // e.g., 25
  maxForeignPlayers?: number; // e.g., 5 or 0 (unlimited)
  minHomegrownPlayers?: number; // e.g., 8
  minYouthPlayers?: number; // e.g., 4
  allowEmergencyLoan?: boolean;
}

export interface CompetitionBrandingConfig {
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  logoStyle?: 'modern' | 'classic' | 'minimal' | 'badge';
  bannerBg?: string;
}

export interface CompetitionData {
  id: string; // Unique stable Competition ID (e.g., 'UEFA_CL', 'ARG_CUP', 'FIFA_WC')
  name: string; // e.g., "UEFA Champions League"
  shortName: string; // e.g., "UCL"
  category: CompetitionCategory;
  competitionType: CompetitionType;
  federationId?: ContinentalFederation; // 'UEFA', 'CONMEBOL', etc.
  countryCode?: string; // e.g. 'ARG', 'ENG', 'ESP', 'FR', 'BRA'
  countryName?: string; // e.g. "Argentina"
  divisionTier?: string; // e.g., "1st", "2nd", "3rd", "Youth"
  
  // Participating sources
  participatingLeagues?: string[]; // League IDs
  participatingDivisions?: string[]; // Division labels (e.g., ["First Division", "Second Division"])
  participatingTeamIds?: string[]; // Team IDs (for manual assignment)
  numParticipants: number;
  participantAssignmentMode: 'automatic' | 'manual';

  // Qualification
  qualificationRules: QualificationRule[];

  // Format & Stages
  stages: StageConfig[];

  // Schedule & Registration
  schedule?: CompetitionScheduleConfig;
  registrationRules?: RegistrationRulesConfig;

  // Visuals & Themes
  trophy?: CompetitionTrophyConfig;
  emblem?: EmblemConfig;
  branding?: CompetitionBrandingConfig;
  newspaperName?: string;
  design?: LeagueDesignConfig;
  structure?: LeagueStructureConfig;
  individualAwards?: IndividualAwardsConfig;
  subCompetitions?: {
    domesticCup?: CompetitionSubConfig;
    leagueCup?: CompetitionSubConfig;
    superCup?: CompetitionSubConfig;
  };

  // Status
  isPlaceholder?: boolean;
  notes?: string;
  lastUpdated?: string;
}

export interface GlobalCompetitionsDatabase {
  version: string;
  lastUpdated: string;
  competitions: Record<string, CompetitionData>;
  // Linked database entity ID schemas for external consistency
  referencedLeagueIds?: string[];
  referencedTeamIds?: string[];
  referencedPlayerIds?: string[];
}

export interface CompetitionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary?: {
    totalCompetitions: number;
    nationalCount: number;
    continentalCount: number;
    internationalCount: number;
  };
}
