import { ProClubDefinition } from '../utils/earlyCareerSystem';
import { UnifiedClubOffer } from '../utils/clubOfferSystem';

export type SpecialClubId =
  | 'real_madrid'
  | 'barcelona'
  | 'bayern_munich'
  | 'psg'
  | 'manchester_united'
  | 'liverpool'
  | 'arsenal'
  | 'chelsea'
  | 'manchester_city'
  | 'tottenham_hotspur'
  | 'saudi_pro_league';

export type SpecialClubCategory = 'big_three' | 'psg' | 'big_six' | 'saudi';

export interface SpecialClubConfig {
  id: SpecialClubId;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  leagueName: string;
  category: SpecialClubCategory;
  primaryColor: string;
  badgeBg: string;
  flag: string;
  minOvr: number;
  minFame: number;
  minPotential?: number;
  requiresStarter: boolean;
  keyLeaders: string;
  leaderTitle: string;
  managerName: string;
  managerNationality: string;
  formation: string;
  tacticalStyle: string;
  legacyPitch: string;
  financialTier: 'Generational Wealth' | 'Global Elite' | 'Royal Treasury' | 'Premier League Powerhouse';
  estimatedSalaryRange: { min: number; max: number };
  signingBonusPct: number; // e.g. 0.15 to 0.25
  presidentialQuote: string;
  stadiumName?: string;
  clubMotto?: string;
  historicLegends?: string[];
}

export interface SpecialClubInterestDecay {
  status: 'pending_retry' | 'dropped' | 'final_dropped';
  yearCount: number; // 1 = first follow-up (60%), 2 = 2nd yr (30%), 3 = 3rd yr (15%), 4 = 4th yr (5%), 5 = permanently dropped
  lastAttemptYear?: number;
}

export interface PlayerSpecialClubState {
  permanentlyRejectedClubs?: string[]; // e.g. ['real_madrid', 'barcelona', 'manchester_united']
  permanentlyRejectedSaudi?: boolean;
  interestDecay?: Record<string, SpecialClubInterestDecay>;
  hasBeenHostageBefore?: boolean;
  isCurrentlyHostage?: boolean;
  hostageMonthsRemaining?: number;
}

export interface SpecialClubEvaluation {
  clubId: SpecialClubId;
  config: SpecialClubConfig;
  buyerClub: ProClubDefinition;
  salary: number;
  weeklyWage: number;
  signingBonus: number;
  transferFee: number;
  formattedFee: string;
  contractYears: number;
  proposedRole: string;
  squadRole: 'Key Player' | 'First Team Regular';
  proposedPosition: string;
  proposedPlaystyle: string;
  isEligible: boolean;
  isRetry: boolean;
  decayYear?: number;
  theme: 'glory_legacy' | 'current_glory_money' | 'premier_league_glory' | 'raw_money';
}

export interface SpecialClubChoiceEventData {
  interestedClubs: SpecialClubEvaluation[];
  dilemmaType:
    | 'big_three_and_psg'
    | 'big_three_and_saudi'
    | 'psg_and_saudi'
    | 'big_three_and_big_six'
    | 'psg_and_big_six'
    | 'big_six_and_saudi'
    | 'big_three_psg_and_big_six'
    | 'multiple_big_six'
    | 'all_superpowers'
    | 'multiple_big_three'
    | 'single_club';
  title: string;
  subtitle: string;
}

export type SigningChainStep = 1 | 2 | 3 | 4 | 5;

export interface NegotiationResultState {
  status:
    | 'idle'
    | 'club_negotiating'
    | 'club_accepted'
    | 'club_refused'
    | 'force_negotiating'
    | 'force_accepted'
    | 'force_hostage'
    | 'completed';
  narrativeText?: string;
  rollPercentage?: number;
  isPreviouslyHostage?: boolean;
}
