import { OutfieldDetailedStats, GkDetailedStats } from '../types';

export type DevelopmentStageKey = 'teenage' | 'mature' | 'peak' | 'declining';

export interface DevelopmentStageInfo {
  key: DevelopmentStageKey;
  name: 'Teenage Development' | 'Mature Development' | 'Peak Years' | 'Declining Years';
  ageRange: string;
  minAge: number;
  maxAge: number;
  playerPoints: number;
  academyPoints: number;
  playerPointsLabel: string;
  academyPointsLabel: string;
  quote: string;
  description: string;
  colorClass: string;
  badgeClass: string;
  bgGradient: string;
  borderClass: string;
}

export type FootballSchoolId =
  | 'high_intensity_defense'
  | 'tiki_taka'
  | 'brexit_ball'
  | 'modern_english'
  | 'paladar_negro'
  | 'futbol_champan'
  | 'jogo_bonito'
  | 'relational_play'
  | 'counter_attack'
  | 'french_possession';

export type PositionCategoryKey = 'ST' | 'WINGER' | 'CAM' | 'CM' | 'CDM' | 'FULLBACK' | 'CB' | 'GK';

export type OutfieldStatPointsMap = Partial<Record<keyof OutfieldDetailedStats, number>>;
export type GkStatPointsMap = Partial<Record<keyof GkDetailedStats, number>>;

export interface FootballSchoolPhilosophy {
  id: FootballSchoolId;
  styleNumber: number;
  name: string;
  leagueId: string;
  leagueName: string;
  city: string;
  country: string;
  flag: string;
  inspiration: string;
  corePhilosophy: string;
  primaryAttributes: string[];
  allocations: {
    ST: OutfieldStatPointsMap;
    WINGER: OutfieldStatPointsMap;
    CAM: OutfieldStatPointsMap;
    CM: OutfieldStatPointsMap;
    CDM: OutfieldStatPointsMap;
    FULLBACK: OutfieldStatPointsMap;
    CB: OutfieldStatPointsMap;
    GK: GkStatPointsMap;
  };
  strengths: string;
  weaknesses: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
}

export interface AcademySeasonApplicationResult {
  applied: boolean;
  school: FootballSchoolPhilosophy;
  positionCategory: PositionCategoryKey;
  totalPoints: number;
  allocatedStats: Array<{
    key: string;
    label: string;
    gain: number;
    oldVal: number;
    newVal: number;
    statPointsInvested?: number;
    newProgress?: number;
  }>;
  logs: string[];
}
