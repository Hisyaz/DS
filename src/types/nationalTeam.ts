import { Nationality, PlayerCardData } from '../types';
import { ManagerData, StadiumConfig, KitConfig } from './leagueEditor';

export type NationalTeamTier = 'U17' | 'U20' | 'Senior';
export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';

export interface NationalTeamManager {
  name: string;
  nationality: string;
  tactic?: string;
  preferredFormation?: string;
}

export interface NationalTeam {
  id: string; // e.g. "nat-team-eng"
  nation: Nationality;
  tier?: NationalTeamTier;
  ovr?: number; // calculated average OVR of top players
  confederation?: Confederation;
  fifaRanking?: number;
  teamOvr?: number;
  manager: ManagerData | NationalTeamManager;
  stadium?: StadiumConfig;
  homeKit?: KitConfig;
  awayKit?: KitConfig;
  squad: PlayerCardData[]; // Senior squad
  u20Squad?: PlayerCardData[]; // U20 squad
  u17Squad?: PlayerCardData[]; // U17 squad
  competitions?: string[];
}

export interface InternationalCallUp {
  id: string;
  nation: Nationality;
  tier: NationalTeamTier;
  competitionName: string;
  managerName: string;
  role: 'Key Starter' | 'Squad Player' | 'Promising Prospect';
  bonusFame: number;
  date: string;
  isSeniorLockWarning?: boolean;
}

export interface InternationalStats {
  u17Nation?: string;
  u20Nation?: string;
  seniorNation?: string;
  isSeniorLocked?: boolean;
  u17Caps?: number;
  u17Goals?: number;
  u20Caps?: number;
  u20Goals?: number;
  seniorCaps?: number;
  seniorGoals?: number;
  totalCaps?: number;
  totalGoals?: number;
}
