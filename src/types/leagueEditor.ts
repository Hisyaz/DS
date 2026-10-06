import {
  EmblemConfig,
  KitConfig,
  PlayerCardData,
  SponsorDesignConfig,
  SponsorWritingStyle,
  SponsorBorderStyle,
} from '../types';
import { ClubFinances } from './clubEconomy';
export type { EmblemConfig, KitConfig, SponsorDesignConfig, SponsorWritingStyle, SponsorBorderStyle };

export interface SquadSlot {
  slotNumber: number;
  player?: PlayerCardData | null;
}

export type SquadGroupKey = 'squad' | 'reserves' | 'u20' | 'u17';

export interface TeamSquadSaveFile {
  squad: SquadSlot[];    // Slots 1-35 (19-35 active)
  reserves: SquadSlot[]; // Slots 36-60 (19-25 active)
  u20: SquadSlot[];      // Slots 1-25 (19-25 active)
  u17: SquadSlot[];      // Slots 1-25 (19-25 active)
}

export type CountryCode = 'FR' | 'FRA' | 'ENG' | 'ESP' | 'ARG' | 'BRA' | string;

export type LeagueShapeStyle =
  | 'modern_square'
  | 'modern_rounded'
  | 'classic'
  | 'futuristic'
  | 'simple'
  | 'rhomboid_chamfer'
  | 'architectural_double'
  | 'tactical_chalkboard';

export type LeagueColorOption = 'Red' | 'Blue' | 'Yellow' | 'Green' | 'Black' | 'White' | 'Grey';

export type TextOutlineStyleOption = 'none' | 'solid' | 'soft' | 'sharp' | 'double' | 'glow';
export type BackgroundStyleOption = 'solid' | 'gradient' | 'radial_glow' | 'stadium_bokeh' | 'sleek_glass' | 'mesh_dark';
export type PanelStyleOption = 'glassmorphic' | 'sharp_solid' | 'soft_glow' | 'metallic' | 'rounded_card' | 'neon_border';
export type ButtonStyleOption = 'pill' | 'sharp' | 'rounded' | 'gradient' | 'outlined';
export type IconStyleOption = 'primary_tint' | 'accent_glow' | 'monochrome' | 'dual_tone';

export interface LeagueDesignConfig {
  shape: LeagueShapeStyle;
  primaryColor: LeagueColorOption;
  secondaryColor: LeagueColorOption;
  accentColor: LeagueColorOption;
  textColor?: LeagueColorOption;
  textOutlineColor?: LeagueColorOption;

  // Custom Hex Colors
  primaryHex?: string;
  secondaryHex?: string;
  accentHex?: string;
  textColorHex?: string;
  textOutlineHex?: string;

  // Text Outline
  textOutlineStyle?: TextOutlineStyleOption;
  textOutlineStrength?: number; // 0 to 100

  // Background Appearance
  backgroundStyle?: BackgroundStyleOption;
  backgroundCustomColor?: string;
  backgroundOverlayOpacity?: number; // 0 to 100

  // Panels Appearance
  panelStyle?: PanelStyleOption;
  panelBgTint?: string;
  panelOpacity?: number; // 0 to 100
  panelBorderRadius?: 'none' | 'sm' | 'md' | 'lg' | '2xl';

  // Buttons Appearance
  buttonStyle?: ButtonStyleOption;
  buttonHoverGlow?: boolean;

  // Icons Visual Treatment
  iconStyle?: IconStyleOption;
}

export type TrophyIconType =
  | 'league'
  | 'cup'
  | 'super-cup'
  | 'champions-league'
  | 'crown-cup'
  | 'globe-trophy'
  | 'statue'
  | 'golden-boot'
  | 'golden-glove'
  | 'ballon-or'
  | 'whistle';

export type TrophyBaseDesign =
  | 'marble_black'
  | 'mahogany_wood'
  | 'gold_tier'
  | 'silver_pedestal'
  | 'glass_stand';

export type TrophyShapeStyle =
  | 'cup'
  | 'tower'
  | 'shield'
  | 'globe'
  | 'star'
  | 'statue'
  | 'boot'
  | 'glove'
  | 'whistle';

export interface CompetitionTrophyConfig {
  name: string;
  metalTone: 'gold' | 'silver' | 'bronze' | 'platinum';
  iconType: TrophyIconType;
  ribbonColor: string;
  accentColor?: string;
  shape?: TrophyShapeStyle;
  baseDesign?: TrophyBaseDesign;
  engravingText?: string;
  details?: string;
}

export interface CompetitionSubConfig {
  id: string; // e.g. 'domestic_cup', 'league_cup', 'super_cup'
  name: string; // e.g. "FA Cup", "EFL Cup", "Community Shield"
  enabled: boolean;
  emblem: EmblemConfig;
  trophy: CompetitionTrophyConfig;
  format: 'knockout_single' | 'knockout_home_away' | 'single_match_final';
}

export interface LeagueStructureConfig {
  numTeams: number; // e.g., 20, 18, 10
  format: 'double_round_robin' | 'single_round_robin' | 'split_season' | 'knockout';
  directRelegationSpots: number; // e.g. 3
  playoffRelegationSpots: number; // e.g. 1
  // European qualification
  uclSpots?: number; // UEFA Champions League
  uelSpots?: number; // UEFA Europa League
  ueclSpots?: number; // UEFA Conference League
  // South American qualification
  libertadoresSpots?: number; // Copa Libertadores
  sudamericanaSpots?: number; // Copa Sudamericana
}

export interface IndividualAwardConfig {
  id: 'topGoalscorer' | 'topAssist' | 'bestPlayer' | 'bestYoungPlayer' | 'bestManager';
  enabled: boolean;
  awardName: string;
  trophy: CompetitionTrophyConfig;
}

export interface IndividualAwardsConfig {
  topGoalscorer: IndividualAwardConfig;
  topAssist: IndividualAwardConfig;
  bestPlayer: IndividualAwardConfig;
  bestYoungPlayer: IndividualAwardConfig;
  bestManager: IndividualAwardConfig;
}

export interface LeagueData {
  id: string; // e.g., 'england_d1', 'argentina_youth'
  name: string;
  newspaperName?: string; // League Newspaper for headlines, articles & cinematics
  countryCode: CountryCode;
  countryName: string;
  cityName?: string; // For youth leagues
  divisionTier: '1st' | '2nd' | 'youth' | 'state_only';
  isStateChampionshipsOnly?: boolean;
  isCupOnly?: boolean;
  isProfessionalLeague?: boolean;
  emblem: EmblemConfig;
  design: LeagueDesignConfig;
  structure: LeagueStructureConfig;
  championshipTrophy?: CompetitionTrophyConfig; // Main League Championship Trophy
  individualAwards?: IndividualAwardsConfig; // Individual Awards Trophies
  competitions?: {
    domesticCup?: CompetitionSubConfig;
    leagueCup?: CompetitionSubConfig;
    superCup?: CompetitionSubConfig;
  };
  teamIds: string[];
}

// Manager & Tactical System Types
export type TacticalStyle =
  | 'possession'
  | 'gegenpressing'
  | 'counter_attack'
  | 'long_balls'
  | 'catenaccio';

export type FormationType =
  | '4-3-3'
  | '4-2-3-1'
  | '4-4-2'
  | '3-4-3'
  | '3-5-2'
  | '3-4-1-2'
  | '3-4-2-1'
  | '5-3-2'
  | '5-4-1';

export type PlayerRolePosition =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'CF'
  | 'SS'
  | 'ST';

export type PlaystyleAssignment =
  | 'Poacher'
  | 'Target'
  | 'Complete'
  | 'Finisher'
  | 'Decoy'
  | 'Traditional'
  | 'Inverted'
  | 'Prolific'
  | 'Pressing'
  | 'Creator'
  | 'Shadow'
  | 'Classic N10'
  | 'Engine'
  | 'Box-to-Box'
  | 'Maestro'
  | 'Runner'
  | 'Enforcer'
  | 'Anchor'
  | 'Defensive'
  | 'Attacker'
  | 'Balanced'
  | 'Destroyer'
  | 'Distributor'
  | 'Playmaker'
  | 'Stopper'
  | 'Sweeper'
  | 'Wall'
  | (string & {});

export interface TacticalPositionSetup {
  slotId: string;
  role: PlayerRolePosition;
  playstyle: PlaystyleAssignment;
  zoneRow: number; // 0 to 9 (10 horizontal zones: 0-1 attackers, 2-3 CAM/wings, 4-5 CM, 6 CDM, 7-8 Defenders, 9 GK)
  zoneCol: number; // 0 (Left), 1 (Center), 2 (Right)
  heightOffset?: number; // -1 (lower), 0 (balanced), +1 (higher)
}

export interface ManagerTacticConfig {
  formation: FormationType;
  style: TacticalStyle;
  positions: TacticalPositionSetup[];
}

export interface ManagerData {
  name: string;
  nationality: string;
  age?: number;
  hasSecondaryTactic: boolean;
  primaryTactic: ManagerTacticConfig;
  secondaryTactic?: ManagerTacticConfig;
}

export type StadiumTier = 1 | 2 | 3 | 4 | 5;

export interface StadiumConfig {
  name: string;
  capacity: number;
  tier: StadiumTier;
  developmentLevel?: number;
}

export interface TeamKeyRoles {
  captainPlayerId?: string;
  goalscorerPlayerId?: string;
  creatorPlayerId?: string;
  defenderPlayerId?: string;
  goalkeeperPlayerId?: string;
}

export interface EditorTeamData {
  id: string;
  name: string;
  shortName?: string;
  leagueId?: string;
  countryCode: CountryCode;
  countryName?: string;
  city?: string;
  emblem?: EmblemConfig;
  kit?: KitConfig;
  awayKit?: KitConfig;
  thirdKit?: KitConfig;
  reputation?: number;
  attackRating?: number;
  midfieldRating?: number;
  defenseRating?: number;
  overallRating?: number;
  ovr?: number;
  isUserClub?: boolean;
  manager?: ManagerData;
  stadium?: StadiumConfig;
  captainPlayerId?: string;
  goalscorerPlayerId?: string;
  creatorPlayerId?: string;
  defenderPlayerId?: string;
  goalkeeperPlayerId?: string;
  keyRoles?: TeamKeyRoles;
  squadSaveFile?: TeamSquadSaveFile;
  finances?: ClubFinances;
  isTemporaryContinentalClub?: boolean;
  competitionId?: string;
  continentalCompetitionId?: string;
  isStateChampionshipsOnly?: boolean;
  isCupOnly?: boolean;
  federation?: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC' | string;
  rivals?: string[]; // Up to 5 rival team IDs or team names for dynamic derby detection
  staff?: {
    assistantManager?: { name: string; nationality: string; rating: number };
    fitnessCoach?: { name: string; rating: number };
    chiefScout?: { name: string; rating: number };
    headPhysio?: { name: string; rating: number };
  };
  youthAcademy?: {
    tier: 1 | 2 | 3 | 4 | 5;
    developmentFocus: 'technical' | 'physical' | 'tactical' | 'balanced';
    scoutingRegion: string;
    facilitiesRating: number;
  };
  foundedYear?: number;
  nickname?: string;
  motto?: string;
  trophies?: ClubTrophyData;
}

export interface ClubTrophyData {
  // International Category
  worldClubCups?: number; // Tier 1: World (Intercontinental, Club World Cup)
  primaryContinental?: number; // Tier 2: Primary Continental Cup (Libertadores, UCL, etc.)
  secondaryContinental?: number; // Tier 3: Secondary Continental (UEL, Sudamericana, etc.)
  tertiaryContinental?: number; // Tier 4: 3rd Tier Continental (Supercup, Conference League, Recopa, etc.)

  // National Category
  leagueTitles?: number; // Tier 1: 1st Division (League champion)
  domesticCups?: number; // Tier 2: National Cups (Cup, Supercup, League Cup, etc.)
  secondDivision?: number; // Tier 3: 2nd Division (2nd division league, 2nd division cups, etc.)

  // Friendly & Non-professional Category
  friendlyCups?: number; // Pre-season cups, friendly tournaments
  youthLeagues?: number; // U20 leagues, U17 leagues, reserves leagues
  youthCups?: number; // U20 cups, U17 cups, reserves cups, friendly cups

  // Legacy fallback alias
  continentalTrophies?: number;
}

export interface StartingXIPositionSlot {
  slotIndex: number; // 1 to 11
  role: PlayerRolePosition;
  roleLabel: string;
  category: 'GK' | 'DEF' | 'MID' | 'ATT';
  xPercent: number; // 0 to 100 on pitch
  yPercent: number; // 0 to 100 on pitch
}

export interface SubstitutePositionSlot {
  slotNumber: number; // 12 to 18
  subIndex: number; // 1 to 7
  suggestedCategory: 'GK' | 'DEF' | 'MID' | 'ATT';
  suggestedRole: string;
}

export interface LeagueDatabase {
  version: string;
  lastUpdated: string;
  leagues: Record<string, LeagueData>;
  teams: Record<string, EditorTeamData>;
}

