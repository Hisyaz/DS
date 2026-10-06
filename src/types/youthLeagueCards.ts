export type YouthCardCategory =
  | 'positive_stat'
  | 'negative_youth'
  | 'double_edged'
  | 'youth_lifestyle'
  | 'iconic_youth';

export type YouthCardRarity = 'Bronze' | 'Silver' | 'Gold' | 'Legendary' | 'Iconic';

export interface YouthCardStatBonus {
  statKey: string; // e.g. 'shooting', 'pace', 'shortPass', 'tackling', 'stamina', 'positioning', 'dribbling', 'heading', etc.
  statLabel: string;
  value: number; // positive or negative
  isStatPoints?: boolean; // When true, uses applyStatPointInvestment to progress the stat development tier
}

export interface YouthCardEffectSet {
  statBonuses?: YouthCardStatBonus[];
  statPointsBonus?: {
    statKey: string;
    statLabel: string;
    points: number;
  };
  freeStatPoints?: number; // Direct unassigned development stat points awarded to player
  grantsPerkId?: string; // Perk ID to grant (e.g. 'step_on')
  chemistryChange?: number;
  fameChange?: number;
  moneyChange?: number; // in Euros
  badReputationChange?: number;
  potentialChange?: number;
  injuryRiskPercent?: number;
  managerRelationshipChange?: number;
  managerTrustChange?: number;
  grantsManager?: {
    quality: 'Bronze' | 'Silver' | 'Gold' | 'Legendary' | 'Elite' | 'Master';
    negotiation: number;
    network: number;
    marketing: number;
  };
  boostFirstContract?: boolean;
}

export interface YouthCardTemplate {
  id: string;
  name: string;
  category: YouthCardCategory;
  description: string;
  iconName: string;
  isIconic?: boolean;
  isTemporal?: boolean;
  duration?: string;
  temporalSubtype?: string;
  effectsByRarity: {
    Bronze?: YouthCardEffectSet;
    Silver?: YouthCardEffectSet;
    Gold?: YouthCardEffectSet;
    Legendary?: YouthCardEffectSet;
    Iconic?: YouthCardEffectSet;
  };
}

export interface YouthCardInstance {
  instanceId: string;
  templateId: string;
  name: string;
  category: YouthCardCategory;
  categoryLabel: string;
  rarity: YouthCardRarity;
  description: string;
  effects: YouthCardEffectSet;
  effectDescriptions: string[];
  iconName: string;
  designColor: string;
  isTemporal?: boolean;
  duration?: string;
  temporalSubtype?: string;
  isNewCardGuaranteed?: boolean;
}
