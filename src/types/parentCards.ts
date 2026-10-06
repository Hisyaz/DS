import { Nationality, CardTier } from '../types';

export type ParentCardRarity = 'bronze' | 'silver' | 'gold' | 'legendary' | 'iconic';

export type ParentCardTypeId =
  | 'ex_pro_player'
  | 'average_family'
  | 'helicopter_parents'
  | 'immigrant_family'
  | 'raised_in_ghetto'
  | 'rich_parents'
  | 'iconic_parent';

export interface ParentCardInstance {
  id: string;
  typeId: ParentCardTypeId;
  name: string;
  rarity: ParentCardRarity;
  description: string;
  iconName: string;
  gradient: string;
  borderColor: string;
  badgeText: string;
  // Specific card bonuses
  weakFootBonus?: number;
  freeStatPointsBonus?: number;
  freeStatPoints?: number;
  fameBonus?: number;
  composureBonus?: number;
  potentialBonus?: number;
  staminaBonus?: number;
  strengthBonus?: number;
  dribblingBonus?: number;
  reactionsBonus?: number;
  positioningBonus?: number;
  startingCashBonus?: number;
  extraNationalities?: Nationality[];
  startingBusinessName?: string;
  startingBusinessTier?: number;
  managerName?: string;
  managerRating?: number; // Negotiation, network, marketing rating
  inheritedHeightCm?: number; // Permanent inherited height bonus (1–15 CM)
  // Family Name & Heritage System
  familyName?: string;
  familyDisplay?: string;
  familyCountry?: string;
  isBrazilHeritage?: boolean;
  nameSuffix?: string;
  isNewCardGuaranteed?: boolean;
  // Perks
  perkTitle: string;
  perkDescription: string;
  perkEffects: string[];
}

export interface ParentAdviceEffect {
  id: string;
  title: string;
  description: string;
  type: 'composure' | 'chemistry' | 'bad_rep' | 'injury_recovery' | 'focus';
}
