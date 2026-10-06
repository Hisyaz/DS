export type StreetCardRarity = 'bronze' | 'silver' | 'gold' | 'legendary' | 'iconic';

export type StreetCardType = 'positive' | 'negative' | 'double_edged' | 'iconic';

export type StreetCardId =
  // Iconic (2)
  | 'street_scout'
  | 'trivela'
  // Negative (10)
  | 'lost_your_temper'
  | 'bad_landing'
  | 'skipped_training'
  | 'no_structure'
  | 'overshadowed'
  | 'bad_habits'
  | 'street_trouble'
  | 'bad_fields'
  | 'divided_focus'
  | 'playing_injured'
  // Double Edged (5)
  | 'street_warrior'
  | 'street_magician'
  | 'speed_demon'
  | 'shoot_first'
  | 'street_defender'
  // Positive stat cards or any new card ID
  | string;

export interface TierValues {
  bronze: number | string;
  silver: number | string;
  gold: number | string;
  legendary: number | string;
}

export interface StreetCardDefinition {
  id: StreetCardId;
  name: string;
  type: StreetCardType;
  description: string;
  iconName: string;
  designColor: string;
  effects: Record<string, TierValues>;
  // Iconic specifics
  isIconicOnly?: boolean;
  iconicEffects?: string[];
  iconicDescription?: string;
  // Overhauled stat features
  isStatPoints?: boolean;
  isDistributablePoints?: boolean;
  statPointsBonus?: StreetCardStatPointBonus;
  statPointsBonuses?: StreetCardStatPointBonus[];
}

export interface StreetCardStatPointBonus {
  statKey: string;
  statLabel: string;
  points?: number;
}

export interface StreetCardInstance {
  id: string;
  cardId: StreetCardId;
  name: string;
  type: StreetCardType;
  rarity: StreetCardRarity;
  description: string;
  iconName: string;
  designColor: string;
  obtainedAt: string;
  formattedEffects: string[];
  effectsMap: Record<string, number | string>;
  isIconic?: boolean;
  isNewCardGuaranteed?: boolean;
  isStatPoints?: boolean;
  isDistributablePoints?: boolean;
  statPointsBonus?: StreetCardStatPointBonus;
  statPointsBonuses?: StreetCardStatPointBonus[];
}

export interface ProContractOffer {
  id: string;
  clubName: string;
  clubBadgeBg: string;
  countryName: string;
  countryCode: string;
  leagueName: string;
  leagueTier: number; // 1 = Top Tier, 2 = 2nd Tier, etc.
  isEuropean?: boolean;
  squadRole: 'Key Player' | 'First Team Regular' | 'Rotation' | 'Young Prospect';
  expectedRole: 'Starter' | 'Rotation Player' | 'Develop With Reserves' | 'Youth Team';
  playingTimeExpectation?: 'STARTER' | 'FIRST TEAM' | 'ROTATION' | 'RESERVES' | 'U20 PROSPECT' | 'U17 PROSPECT';
  initialSquadDestination?: 'First Team' | 'Reserves' | 'U20' | 'U17';
  roleDescription: string;
  managerName: string;
  managerNationality: string;
  managerTacticalStyle: string;
  managerFormation: string;
  expectedPosition: string;
  expectedSubPosition?: string;
  tacticalRole?: string;
  expectedPlaystyle: string;
  yearlySalary?: number;
  weeklyWage: number;
  contractYears: number;
  signingBonus: number;
  minOvrRequired: number;
  matchesProfile: boolean;
  prestigeStars: number; // 1 to 5
  isSameLeagueBiddingPenalty?: boolean;
  leagueBidCount?: number;
  salaryMultiplier?: number;
  economicConstraintNote?: string;
  clubEconomicTier?: 'ELITE_FINANCES' | 'STRONG_BUDGET' | 'MODERATE_BUDGET' | 'CONSTRAINED_BUDGET';
  clubFame?: number;
  developmentTier?: number;
  developmentTierName?: string;
  developmentPhilosophy?: string;
  youthDevelopmentPoints?: number;
}
