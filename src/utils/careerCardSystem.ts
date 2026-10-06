import { PlayerCardData, ManagerState, AccountingState, SponsorItem, CareerCollectedCard, OutfieldDetailedStats } from '../types';
import { hasPerk, isPerkRetired } from './perksSystem';
import { MAX_TOTAL_CHEMISTRY } from './chemistrySystem';
import { drawUniqueCareerCategoryCards } from './storeCollectionSystem';
import {
  NEW_NEGATIVE_LIFESTYLE_CARDS,
  applyArsonDisasterTimeskip,
  addBadReputation,
  getMidseasonNegativeLifestyleDrawChance,
} from './badReputationSystem';
import {
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
  getOrCreateGkDetailed,
  getOrCreateOutfieldDetailed,
  CARD_STAT_BREAK_ELIGIBLE_STATS,
  ALL_STAT_BREAK_ELIGIBLE_STATS,
  getStatBreakBonus,
  STAT_BREAK_GROUPS,
} from './statCalculations';
import { getCareerStatCardPool } from '../data/statProgressionCardsData';
import { applyStatPointInvestment, isStatWeaknessForPlayerType } from './statProgressionSystem';
import { maybeDrawCulturalCard } from '../data/culturalCardsData';

export type CareerCardCategory = 'career' | 'lifestyle' | 'sponsor';
export type CareerCardType = 'good' | 'negative' | 'double_edged';
export type CareerCardRarity = 'Iconic' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Bronze' | 'Silver' | 'Gold';
export type SponsorTier = 'Bronze' | 'Silver' | 'Gold' | 'Legendary';

export interface SponsorDealDetails {
  sponsorName: string;
  category: CareerCardType;
  tier: SponsorTier;
  initialPayment: number;
  yearlyPayment?: number;
  durationYears?: number;
  bonusTerms?: string;
  logoColor?: string;
  debtObligation?: {
    repaymentAmount: number;
    dueWeeksRemaining?: number;
  };
  managerMarketingDelta?: number;
  doubleEdgedRisk?: {
    successProb?: number; // e.g. 0.5
    successCash: number;
    successFame: number;
    successMarketing?: number;
    failCashPenalty: number; // e.g. 500000 or 10000000
    failFameDelta: number; // e.g. -20
    failBadRepDelta: number; // e.g. 25
  };
}

export interface CareerStageCardInstance {
  id: string;
  name: string;
  category: CareerCardCategory;
  type: CareerCardType;
  rarity: CareerCardRarity;
  tier?: SponsorTier;
  description: string;
  effects: string[];
  designColor: string;
  iconName: string;
  isStatBreakCard?: boolean;
  targetStatBreakKey?: string;
  isTemporal?: boolean;
  duration?: string;
  temporalSubtype?: string;
  isNewCardGuaranteed?: boolean;
  isCulturalCard?: boolean;
  culturalCountry?: string;
  culturalFlavor?: string;
  flagEmoji?: string;

  // Sponsor-specific detailed deal
  sponsorDealDetails?: SponsorDealDetails;

  // Legacy sponsor structure fallback
  sponsorDeal?: {
    name: string;
    yearlyPayment: number;
    logoColor: string;
  };

  // Stat / Reputation / Cash modifiers
  modifiers?: {
    fameDelta?: number;
    badRepDelta?: number;
    cashDelta?: number;
    chemistryDelta?: number;
    managerMarketingDelta?: number;
    fitnessDelta?: number;
    staminaDelta?: number;
    strengthDelta?: number;
    composureDelta?: number;
    positioningDelta?: number;
    reactionsDelta?: number;
    trainingProgressDelta?: number;
    injuryWeeksReduction?: number;
    freeStatPoints?: number;
    recurringIncome?: number;
    weightKgDelta?: number;
    isCulturalCard?: boolean;
    culturalCountry?: string;
    culturalFlavor?: string;
    flagEmoji?: string;
    [key: string]: any;
    statBonus?: { stat: string; val: number };
    statDeltas?: Record<string, number>;
    statPointsBonus?: { stat: string; points: number; statLabel?: string };
    statPointsBonuses?: Array<{ stat: string; points: number; statLabel?: string }>;
    doubleEdgedRisk?: {
      successProb?: number;
      successCash?: number;
      successFame?: number;
      successFitness?: number;
      successChemistry?: number;
      successTrainingProgress?: number;
      successMarketing?: number;
      failCashPenalty?: number;
      failFameDelta?: number;
      failBadRepDelta?: number;
      failFitnessDelta?: number;
      failChemistryDelta?: number;
    };
  };
}

// ----------------------------------------------------
// CARD POOL DATABASES
// ----------------------------------------------------

export const CAREER_CARDS_POOL: Omit<CareerStageCardInstance, 'id'>[] = [
  ...getCareerStatCardPool(),
  // ==========================================
  // TEMPORAL OVERFLOW CHEMISTRY CARDS (BRONZE, SILVER, GOLD, LEGENDARY)
  // ==========================================
  {
    name: 'Overflow Chemistry Surge (Bronze)',
    category: 'career',
    type: 'good',
    rarity: 'Bronze',
    isTemporal: true,
    temporalSubtype: 'temporal_positive',
    duration: 'temporal',
    description: 'A focused team-bonding dinner elevates locker room trust beyond normal capacity, triggering Overflow Chemistry (+1 stat bonus to all attributes per 1% overflow).',
    effects: ['+10% Team Chemistry', '⚡ Activates Overflow Chemistry (>100%)', '⚡ +1 to ALL stats per 1% overflow (-5%/month decay)'],
    designColor: 'from-amber-600 via-amber-800 to-slate-950',
    iconName: 'Zap',
    modifiers: { chemistryDelta: 10 },
  },
  {
    name: 'Overflow Chemistry Surge (Silver)',
    category: 'career',
    type: 'good',
    rarity: 'Silver',
    isTemporal: true,
    temporalSubtype: 'temporal_positive',
    duration: 'temporal',
    description: 'An intensive tactical retreat and cohesive squad understanding produces an electric synergy surge, pushing team chemistry well past 100%.',
    effects: ['+20% Team Chemistry', '⚡ Activates Overflow Chemistry (>100%)', '⚡ +1 to ALL stats per 1% overflow (-5%/month decay)'],
    designColor: 'from-slate-400 via-slate-600 to-slate-950',
    iconName: 'Zap',
    modifiers: { chemistryDelta: 20 },
  },
  {
    name: 'Overflow Chemistry Surge (Gold)',
    category: 'career',
    type: 'good',
    rarity: 'Gold',
    isTemporal: true,
    temporalSubtype: 'temporal_positive',
    duration: 'temporal',
    description: 'Unshakeable team spirit and shared tactical intuition unlock immense locker room cohesion, granting a massive overflow chemistry boost across the squad.',
    effects: ['+50% Team Chemistry', '⚡ Activates Overflow Chemistry (>100%)', '⚡ +1 to ALL stats per 1% overflow (-5%/month decay)'],
    designColor: 'from-yellow-400 via-amber-600 to-slate-950',
    iconName: 'Zap',
    modifiers: { chemistryDelta: 50 },
  },
  {
    name: 'Overflow Chemistry Surge (Legendary)',
    category: 'career',
    type: 'good',
    rarity: 'Legendary',
    isTemporal: true,
    temporalSubtype: 'temporal_positive',
    duration: 'temporal',
    description: 'Historic squad brotherhood and absolute tactical telepathy achieve the pinnacle of team synergy, unlocking maximum 200% Overflow Chemistry (+100 stat points distributed)!',
    effects: ['+100% Team Chemistry', '⚡ Activates Maximum Overflow Chemistry (200%)', '⚡ +1 to ALL stats per 1% overflow (-5%/month decay)'],
    designColor: 'from-purple-500 via-indigo-600 to-slate-950',
    iconName: 'Zap',
    modifiers: { chemistryDelta: 100 },
  },

  // ==========================================
  // NEGATIVE CAREER CARDS (13 - 24)
  // ==========================================
  {
    name: 'Sloppy Training',
    category: 'career',
    type: 'negative',
    rarity: 'Bronze',
    description: 'Lack of focus during training drills led to unforced errors and poor touch.',
    effects: ['-1 Ball Control', '-1 Short Pass'],
    designColor: 'from-rose-800 via-red-900 to-slate-950',
    iconName: 'AlertCircle',
    modifiers: { statDeltas: { ballControl: -1, shortPass: -1 } },
  },
  {
    name: 'Finishing Slump',
    category: 'career',
    type: 'negative',
    rarity: 'Bronze',
    description: 'A temporary dip in goalscoring confidence leading to rushed shots in key moments.',
    effects: ['-1 Shooting', '-1 Composure'],
    designColor: 'from-red-800 via-rose-900 to-slate-950',
    iconName: 'TrendingDown',
    modifiers: { statDeltas: { shooting: -1, composure: -1 } },
  },
  {
    name: 'Defensive Mistakes',
    category: 'career',
    type: 'negative',
    rarity: 'Bronze',
    description: 'Misjudged positioning and loose marking during defensive practice scenarios.',
    effects: ['-1 Marking', '-1 Position'],
    designColor: 'from-rose-900 via-red-950 to-slate-950',
    iconName: 'ShieldAlert',
    modifiers: { statDeltas: { marking: -1, positioning: -1 } },
  },
  {
    name: 'Heavy Legs',
    category: 'career',
    type: 'negative',
    rarity: 'Bronze',
    description: 'Overworked muscles and slow recovery result in sluggish sprint speed and endurance.',
    effects: ['-1 Stamina', '-1 Pace'],
    designColor: 'from-red-900 via-stone-900 to-slate-950',
    iconName: 'BatteryLow',
    modifiers: { statDeltas: { stamina: -1, pace: -1 } },
  },
  {
    name: 'Poor First Touch',
    category: 'career',
    type: 'negative',
    rarity: 'Bronze',
    description: 'Heavy touch issues during technical drills cause the ball to bounce away unexpectedly.',
    effects: ['-2 Ball Control'],
    designColor: 'from-rose-800 via-red-900 to-slate-950',
    iconName: 'AlertTriangle',
    modifiers: { statDeltas: { ballControl: -2 } },
  },
  {
    name: 'Lost Concentration',
    category: 'career',
    type: 'negative',
    rarity: 'Bronze',
    description: 'Mental distractions on the pitch lead to delayed reactions and spatial disorientation.',
    effects: ['-1 Position', '-1 Reaction'],
    designColor: 'from-red-900 via-rose-950 to-slate-950',
    iconName: 'EyeOff',
    modifiers: { statDeltas: { positioning: -1, reactions: -1 } },
  },
  {
    name: 'Tactical Confusion',
    category: 'career',
    type: 'negative',
    rarity: 'Bronze',
    description: 'Struggled to absorb complex managerial instructions during tactical walkthroughs.',
    effects: ['-1 Position', '-1 Composure'],
    designColor: 'from-rose-900 via-slate-900 to-slate-950',
    iconName: 'HelpCircle',
    modifiers: { statDeltas: { positioning: -1, composure: -1 } },
  },
  {
    name: 'Bad Crossing Session',
    category: 'career',
    type: 'negative',
    rarity: 'Bronze',
    description: 'Inconsistent delivery from wide positions with multiple overhit crosses and long passes.',
    effects: ['-1 Crossing', '-1 Long Pass'],
    designColor: 'from-red-800 via-rose-900 to-slate-950',
    iconName: 'XCircle',
    modifiers: { statDeltas: { crossing: -1, longPass: -1 } },
  },
  {
    name: 'Training Plateau',
    category: 'career',
    type: 'negative',
    rarity: 'Silver',
    description: 'Development stagnates temporarily during routine training drills.',
    effects: ['-3 Training Progress', '-2 Ball Control'],
    designColor: 'from-red-900 via-rose-950 to-black',
    iconName: 'MinusCircle',
    modifiers: { trainingProgressDelta: -3, statDeltas: { ballControl: -2 } },
  },
  {
    name: 'Tactical Misfit',
    category: 'career',
    type: 'negative',
    rarity: 'Silver',
    description: 'Struggling to fit into the manager\'s tactical system and formation.',
    effects: ['-2 Position', '-2 Composure', 'Temporary reduction in tactical suitability'],
    designColor: 'from-rose-950 via-red-900 to-black',
    iconName: 'AlertOctagon',
    modifiers: { statDeltas: { positioning: -2, composure: -2 } },
  },
  {
    name: 'Competition for Places',
    category: 'career',
    type: 'negative',
    rarity: 'Silver',
    description: 'In-form squad rival challenges your starting position in the lineup.',
    effects: ['-2 Position', '-2 Reaction', 'Temporarily reduces starting priority'],
    designColor: 'from-red-900 via-rose-950 to-black',
    iconName: 'Users',
    modifiers: { statDeltas: { positioning: -2, reactions: -2 } },
  },
  {
    name: 'Poor Tactical Adaptation',
    category: 'career',
    type: 'negative',
    rarity: 'Silver',
    description: 'Difficulty adjusting to new managerial pressing schemes and defensive triggers.',
    effects: ['-3 Position', '-2 Composure'],
    designColor: 'from-rose-950 via-red-950 to-black',
    iconName: 'Slash',
    modifiers: { statDeltas: { positioning: -3, composure: -2 } },
  },

  // ==========================================
  // DOUBLE-EDGED CAREER CARDS (25 - 35)
  // ==========================================
  {
    name: 'Extra Session',
    category: 'career',
    type: 'double_edged',
    rarity: 'Bronze',
    description: 'Pushed through an intense extra shooting workout after team practice.',
    effects: ['Reward: +2 Shooting', 'Cost: -1 Stamina'],
    designColor: 'from-purple-800 via-amber-700 to-slate-950',
    iconName: 'Flame',
    modifiers: { statDeltas: { shooting: 2, stamina: -1 } },
  },
  {
    name: 'Defensive Focus',
    category: 'career',
    type: 'double_edged',
    rarity: 'Bronze',
    description: 'Sacrificed attack flair drills to concentrate entirely on defensive tackling mechanics.',
    effects: ['Reward: +2 Tackling', 'Cost: -1 Dribbling'],
    designColor: 'from-purple-800 via-blue-800 to-slate-950',
    iconName: 'Shield',
    modifiers: { statDeltas: { tackling: 2, dribbling: -1 } },
  },
  {
    name: 'Speed Work',
    category: 'career',
    type: 'double_edged',
    rarity: 'Bronze',
    description: 'Focused heavily on sprint acceleration, leaning down at the expense of raw physical strength.',
    effects: ['Reward: +2 Pace', 'Cost: -1 Strength'],
    designColor: 'from-purple-800 via-cyan-800 to-slate-950',
    iconName: 'Zap',
    modifiers: { statDeltas: { pace: 2, strength: -1 } },
  },
  {
    name: 'Creative Freedom',
    category: 'career',
    type: 'double_edged',
    rarity: 'Bronze',
    description: 'Embraced high-risk dribbling and flair, occasionally wandering out of assigned tactical structure.',
    effects: ['Reward: +2 Dribbling', 'Cost: -1 Position'],
    designColor: 'from-purple-800 via-fuchsia-800 to-slate-950',
    iconName: 'Sparkles',
    modifiers: { statDeltas: { dribbling: 2, positioning: -1 } },
  },
  {
    name: 'Safe Passing',
    category: 'career',
    type: 'double_edged',
    rarity: 'Bronze',
    description: 'Prioritized ball retention and short risk-free passes over daring long-distance balls.',
    effects: ['Reward: +2 Retention', 'Cost: -1 Long Pass'],
    designColor: 'from-purple-800 via-teal-800 to-slate-950',
    iconName: 'CheckCircle',
    modifiers: { statDeltas: { retention: 2, longPass: -1 } },
  },
  {
    name: 'Aggressive Press',
    category: 'career',
    type: 'double_edged',
    rarity: 'Bronze',
    description: 'Relentless closing down on opposition ball carriers, draining energy reserves.',
    effects: ['Reward: +2 Reaction', 'Cost: -1 Stamina'],
    designColor: 'from-purple-800 via-rose-800 to-slate-950',
    iconName: 'Activity',
    modifiers: { statDeltas: { reactions: 2, stamina: -1 } },
  },
  {
    name: 'Aerial Specialist',
    category: 'career',
    type: 'double_edged',
    rarity: 'Bronze',
    description: 'Bulk training for aerial duels and headers, slightly compromising top sprint speed.',
    effects: ['Reward: +2 Heading', 'Cost: -1 Pace'],
    designColor: 'from-purple-800 via-indigo-800 to-slate-950',
    iconName: 'ArrowUpCircle',
    modifiers: { statDeltas: { heading: 2, pace: -1 } },
  },
  {
    name: 'Long-Shot Specialist',
    category: 'career',
    type: 'double_edged',
    rarity: 'Bronze',
    description: 'Practiced long-range power strikes from distance, neglecting short pass combinations.',
    effects: ['Reward: +2 Long Shots', 'Cost: -1 Short Pass'],
    designColor: 'from-purple-800 via-amber-800 to-slate-950',
    iconName: 'Target',
    modifiers: { statDeltas: { longShots: 2, shortPass: -1 } },
  },
  {
    name: 'Attack-Minded Fullback',
    category: 'career',
    type: 'double_edged',
    rarity: 'Silver',
    description: 'Overlapping aggressively down the flank, leaving open spaces behind in defense.',
    effects: ['Reward: +3 Crossing, +2 Pace', 'Cost: -2 Marking, -2 Position'],
    designColor: 'from-purple-800 via-pink-800 to-slate-950',
    iconName: 'ArrowRight',
    modifiers: { statDeltas: { crossing: 3, pace: 2, marking: -2, positioning: -2 } },
  },
  {
    name: 'Deep-Lying Playmaker',
    category: 'career',
    type: 'double_edged',
    rarity: 'Silver',
    description: 'Dictating tempo from deep with supreme passing range, trading off dynamic pace and dribbling.',
    effects: ['Reward: +3 Long Pass, +3 Short Pass', 'Cost: -2 Dribbling, -2 Pace'],
    designColor: 'from-purple-800 via-sky-800 to-slate-950',
    iconName: 'Compass',
    modifiers: { statDeltas: { longPass: 3, shortPass: 3, dribbling: -2, pace: -2 } },
  },
  {
    name: 'Pressing Machine',
    category: 'career',
    type: 'double_edged',
    rarity: 'Silver',
    description: 'Engineered high-intensity pressing engine that strains composure and physical conditioning.',
    effects: ['Reward: +3 Stamina, +2 Reaction, +2 Position', 'Cost: -2 Composure, -2 Fitness'],
    designColor: 'from-purple-900 via-rose-800 to-slate-950',
    iconName: 'Zap',
    modifiers: { fitnessDelta: -2, statDeltas: { stamina: 3, reactions: 2, positioning: 2, composure: -2 } },
  },
  // ==========================================
  // STAT BREAK ICONIC CAREER CARDS (Ultra-Rare 1% Roll)
  // ==========================================
  {
    name: 'New Ways to Play',
    category: 'career',
    type: 'good',
    rarity: 'Legendary',
    description: 'You dreamed about new ways to play. An ultra-rare flash of inspiration breaking through human boundaries to unlock the historic 100 Stat Break rating.',
    effects: [
      '⭐ STAT BREAK: One eligible 99 stat ➔ 100 (Historic Masterclass)',
      '🔥 2x In-Match Success Chance for Broken Stat',
      '👑 Group Bonus: 2x in group ➔ 101, 3x (Mastery) ➔ 117 (+50% Match Bonus)',
      '🏆 +1 Flat OVR Bonus (+5 for Full Group Mastery)',
    ],
    designColor: 'from-yellow-400 via-amber-500 to-yellow-950',
    iconName: 'Sparkles',
    isStatBreakCard: true,
  },
  {
    name: 'Football Idol',
    category: 'career',
    type: 'good',
    rarity: 'Legendary',
    description: 'You were inspired by your football idol. Channeling the supernatural mastery of legends who redefined football history to reach the historic 100 Stat Break rating.',
    effects: [
      '⭐ STAT BREAK: One eligible 99 stat ➔ 100 (Historic Masterclass)',
      '🔥 2x In-Match Success Chance for Broken Stat',
      '👑 Group Bonus: 2x in group ➔ 101, 3x (Mastery) ➔ 117 (+50% Match Bonus)',
      '🏆 +1 Flat OVR Bonus (+5 for Full Group Mastery)',
    ],
    designColor: 'from-amber-400 via-yellow-500 to-amber-950',
    iconName: 'Crown',
    isStatBreakCard: true,
  },
  {
    name: 'Training Discovery',
    category: 'career',
    type: 'good',
    rarity: 'Legendary',
    description: 'You discovered something during training. An unprecedented realization in body mechanics and precision that elevates your craft beyond perfection to 100 rating.',
    effects: [
      '⭐ STAT BREAK: One eligible 99 stat ➔ 100 (Historic Masterclass)',
      '🔥 2x In-Match Success Chance for Broken Stat',
      '👑 Group Bonus: 2x in group ➔ 101, 3x (Mastery) ➔ 117 (+50% Match Bonus)',
      '🏆 +1 Flat OVR Bonus (+5 for Full Group Mastery)',
    ],
    designColor: 'from-yellow-500 via-amber-600 to-slate-950',
    iconName: 'Flame',
    isStatBreakCard: true,
  },
];

export const STAT_BREAK_CARDS: Omit<CareerStageCardInstance, 'id'>[] = [
  {
    name: 'New Ways to Play',
    category: 'career',
    type: 'good',
    rarity: 'Iconic',
    description: 'You dreamed about new ways to play. An ultra-rare flash of inspiration breaking through human boundaries to unlock the historic 100 Stat Break rating.',
    effects: [
      '⭐ STAT BREAK: One eligible 99 stat ➔ 100 (Historic Masterclass)',
      '🔥 2x In-Match Success Chance for Broken Stat',
      '👑 Group Bonus: 2x in group ➔ 101, 3x (Mastery) ➔ 117 (+50% Match Bonus)',
      '🏆 +1 Flat OVR Bonus (+5 for Full Group Mastery)',
    ],
    designColor: 'from-yellow-400 via-amber-500 to-yellow-950',
    iconName: 'Sparkles',
    isStatBreakCard: true,
  },
  {
    name: 'Football Idol',
    category: 'career',
    type: 'good',
    rarity: 'Iconic',
    description: 'You were inspired by your football idol. Channeling the supernatural mastery of legends who redefined football history to reach the historic 100 Stat Break rating.',
    effects: [
      '⭐ STAT BREAK: One eligible 99 stat ➔ 100 (Historic Masterclass)',
      '🔥 2x In-Match Success Chance for Broken Stat',
      '👑 Group Bonus: 2x in group ➔ 101, 3x (Mastery) ➔ 117 (+50% Match Bonus)',
      '🏆 +1 Flat OVR Bonus (+5 for Full Group Mastery)',
    ],
    designColor: 'from-amber-400 via-yellow-500 to-amber-950',
    iconName: 'Crown',
    isStatBreakCard: true,
  },
  {
    name: 'Training Discovery',
    category: 'career',
    type: 'good',
    rarity: 'Iconic',
    description: 'You discovered something during training. An unprecedented realization in body mechanics and precision that elevates your craft beyond perfection to 100 rating.',
    effects: [
      '⭐ STAT BREAK: One eligible 99 stat ➔ 100 (Historic Masterclass)',
      '🔥 2x In-Match Success Chance for Broken Stat',
      '👑 Group Bonus: 2x in group ➔ 101, 3x (Mastery) ➔ 117 (+50% Match Bonus)',
      '🏆 +1 Flat OVR Bonus (+5 for Full Group Mastery)',
    ],
    designColor: 'from-yellow-500 via-amber-600 to-slate-950',
    iconName: 'Flame',
    isStatBreakCard: true,
  },
];

export const LIFESTYLE_CARDS_POOL: Omit<CareerStageCardInstance, 'id'>[] = [
  // ==========================================
  // 1. GOOD LIFESTYLE CARDS (1 - 28)
  // ==========================================
  {
    name: 'Clean Lean Nutrition',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Bronze',
    description: 'You eliminate refined sugars and follow a clean whole-food meal plan, shedding body fat.',
    effects: ['-2 kg Body Weight', '+15 Fitness', '+2 Stamina'],
    designColor: 'from-emerald-600 via-teal-700 to-slate-950',
    iconName: 'Salad',
    modifiers: { weightKgDelta: -2, fitnessDelta: 15, staminaDelta: 2 },
  },
  {
    name: 'Strict Athletic Conditioning & Low-Carb',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'A disciplined high-protein and cardio regimen cuts excess body weight while sharpening your sprint endurance.',
    effects: ['-3 kg Body Weight', '+25 Fitness', '+3 Stamina', '+2 Pace'],
    designColor: 'from-teal-600 via-cyan-700 to-slate-950',
    iconName: 'Flame',
    modifiers: { weightKgDelta: -3, fitnessDelta: 25, staminaDelta: 3, paceDelta: 2 },
  },
  {
    name: 'Elite Sports Science Diet & Cardio Regimen',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Gold',
    description: 'A world-class nutrition team calibrates your exact metabolic intake, stripping away all sluggish excess mass.',
    effects: ['-4 kg Body Weight', '+40 Fitness', '+5 Stamina', '+4 Pace'],
    designColor: 'from-cyan-500 via-emerald-600 to-slate-950',
    iconName: 'Zap',
    modifiers: { weightKgDelta: -4, fitnessDelta: 40, staminaDelta: 5, paceDelta: 4 },
  },
  {
    name: 'Smart Investment',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Bronze',
    description: 'You receive advice from someone who understands money and make a small investment.',
    effects: ['+€10,000 Cash', 'Recurring Investment Income (+€2,500/yr)'],
    designColor: 'from-emerald-700 via-teal-800 to-slate-950',
    iconName: 'TrendingUp',
    modifiers: { cashDelta: 10000, recurringIncome: 2500 },
  },
  {
    name: 'Family Support',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Bronze',
    description: 'Your family helps you during an important period of your career.',
    effects: ['+10 Chemistry', '+5 Fame', 'Reduces negative event probability'],
    designColor: 'from-emerald-600 via-green-700 to-slate-950',
    iconName: 'Heart',
    modifiers: { chemistryDelta: 10, fameDelta: 5 },
  },
  {
    name: 'Private Trainer',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'You hire a specialist trainer to work on your physical condition.',
    effects: ['+5 Training Progress', '+3 Stamina', '+2 Strength'],
    designColor: 'from-emerald-600 via-teal-700 to-slate-950',
    iconName: 'Dumbbell',
    modifiers: { trainingProgressDelta: 5, staminaDelta: 3, strengthDelta: 2 },
  },
  {
    name: 'Recovery Retreat',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'You spend several days recovering away from football.',
    effects: ['+20 Fitness', 'Injury recovery time reduced by 1 week'],
    designColor: 'from-teal-600 via-emerald-700 to-slate-950',
    iconName: 'Sun',
    modifiers: { fitnessDelta: 20, injuryWeeksReduction: 1 },
  },
  {
    name: 'Nutrition Plan',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Bronze',
    description: 'A professional nutritionist creates a personalized diet.',
    effects: ['+3 Stamina', '+2 Strength', '+2 Fitness'],
    designColor: 'from-green-600 via-teal-700 to-slate-950',
    iconName: 'Apple',
    modifiers: { staminaDelta: 3, strengthDelta: 2, fitnessDelta: 2 },
  },
  {
    name: 'Local Hero',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'Your actions in your hometown receive positive attention.',
    effects: ['+15 Fame', '+5 Chemistry', '-5 Bad Reputation'],
    designColor: 'from-emerald-600 via-emerald-800 to-slate-950',
    iconName: 'Home',
    modifiers: { fameDelta: 15, chemistryDelta: 5, badRepDelta: -5 },
  },
  {
    name: 'Viral Moment',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'A harmless moment involving you goes viral for all the right reasons.',
    effects: ['+20 Fame', '+1 Agent Marketing (Sponsor quality up)'],
    designColor: 'from-emerald-500 via-teal-700 to-slate-950',
    iconName: 'Sparkles',
    modifiers: { fameDelta: 20, managerMarketingDelta: 1 },
  },
  {
    name: 'Charity Match',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'You participate in a charity event.',
    effects: ['+15 Fame', '-5 Bad Reputation', '+1 Agent Marketing'],
    designColor: 'from-teal-500 via-emerald-700 to-slate-950',
    iconName: 'Award',
    modifiers: { fameDelta: 15, badRepDelta: -5, managerMarketingDelta: 1 },
  },
  {
    name: 'Mentor',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Gold',
    description: 'A former professional player takes an interest in your development.',
    effects: ['+5 Training Progress', '+2 Composure', '+2 Positioning', '+1 Unassigned Stat Point'],
    designColor: 'from-yellow-500 via-emerald-700 to-slate-950',
    iconName: 'UserCheck',
    modifiers: { trainingProgressDelta: 5, composureDelta: 2, positioningDelta: 2, freeStatPoints: 1 },
  },
  {
    name: 'New Apartment',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Bronze',
    description: 'You move into a better living environment.',
    effects: ['+5 Chemistry', '+5 Fitness', '+2 Fame'],
    designColor: 'from-emerald-600 via-teal-800 to-slate-950',
    iconName: 'Building',
    modifiers: { chemistryDelta: 5, fitnessDelta: 5, fameDelta: 2 },
  },
  {
    name: 'Financial Discipline',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'You decide to stop wasting money and start managing your finances properly.',
    effects: ['+€10,000 Cash', '+5 Fame', 'Reduces future lifestyle expenses'],
    designColor: 'from-emerald-600 via-green-800 to-slate-950',
    iconName: 'ShieldCheck',
    modifiers: { cashDelta: 10000, fameDelta: 5 },
  },
  {
    name: 'Perfect Routine',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'You establish a disciplined daily routine.',
    effects: ['+5 Training Progress', '+5 Fitness', '+2 Stamina', '-2 Bad Reputation'],
    designColor: 'from-teal-600 via-emerald-800 to-slate-950',
    iconName: 'CheckCircle2',
    modifiers: { trainingProgressDelta: 5, fitnessDelta: 5, staminaDelta: 2, badRepDelta: -2 },
  },
  {
    name: 'Childhood Friend Returns',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Bronze',
    description: 'Someone important from your childhood reconnects with you.',
    effects: ['+10 Chemistry', '+5 Fame'],
    designColor: 'from-green-600 via-teal-800 to-slate-950',
    iconName: 'Smile',
    modifiers: { chemistryDelta: 10, fameDelta: 5 },
  },
  {
    name: 'Media Training',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'You receive professional media training.',
    effects: ['+10 Fame', '-5 Bad Reputation', '+1 Agent Marketing'],
    designColor: 'from-emerald-600 via-teal-700 to-slate-950',
    iconName: 'Mic',
    modifiers: { fameDelta: 10, badRepDelta: -5, managerMarketingDelta: 1 },
  },
  {
    name: 'First Luxury Purchase',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Bronze',
    description: 'You finally buy something you have dreamed about since childhood.',
    effects: ['+5 Fame', '+5 Chemistry', '-€10,000 Cash'],
    designColor: 'from-teal-600 via-emerald-700 to-slate-950',
    iconName: 'ShoppingBag',
    modifiers: { fameDelta: 5, chemistryDelta: 5, cashDelta: -10000 },
  },
  {
    name: 'Personal Chef',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'You hire someone to handle your meals.',
    effects: ['+5 Fitness', '+2 Stamina', '-€5,000 Cash'],
    designColor: 'from-emerald-600 via-green-700 to-slate-950',
    iconName: 'Utensils',
    modifiers: { fitnessDelta: 5, staminaDelta: 2, cashDelta: -5000 },
  },
  {
    name: 'Quiet Weekend',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Bronze',
    description: 'You turn down the nightlife and stay home.',
    effects: ['+10 Fitness', '+5 Training Progress', '-5 Bad Reputation'],
    designColor: 'from-teal-700 via-emerald-800 to-slate-950',
    iconName: 'Moon',
    modifiers: { fitnessDelta: 10, trainingProgressDelta: 5, badRepDelta: -5 },
  },
  {
    name: 'Community Project',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Gold',
    description: 'You invest time and money into your local community.',
    effects: ['+15 Fame', '-10 Bad Reputation', '+5 Chemistry', '-€5,000 Cash'],
    designColor: 'from-yellow-500 via-emerald-700 to-slate-950',
    iconName: 'Users',
    modifiers: { fameDelta: 15, badRepDelta: -10, chemistryDelta: 5, cashDelta: -5000 },
  },
  {
    name: 'Financial Advisor',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'You hire a professional financial advisor.',
    effects: ['-€2,000 Cash', '+5 Fame', '+1 Agent Marketing', 'Unlocks investment events'],
    designColor: 'from-emerald-600 via-teal-700 to-slate-950',
    iconName: 'Briefcase',
    modifiers: { cashDelta: -2000, fameDelta: 5, managerMarketingDelta: 1 },
  },
  {
    name: 'Recovery Technology',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Gold',
    description: 'You purchase advanced recovery equipment.',
    effects: ['-€10,000 Cash', '+10 Fitness', '+1 Stamina', 'Injury recovery time reduced by 1 week'],
    designColor: 'from-amber-500 via-emerald-700 to-slate-950',
    iconName: 'Activity',
    modifiers: { cashDelta: -10000, fitnessDelta: 10, staminaDelta: 1, injuryWeeksReduction: 1 },
  },
  {
    name: 'Healthy Relationship',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'A stable relationship gives you greater emotional stability.',
    effects: ['+10 Chemistry', '+5 Composure', '-5 Bad Reputation'],
    designColor: 'from-green-600 via-teal-700 to-slate-950',
    iconName: 'Heart',
    modifiers: { chemistryDelta: 10, composureDelta: 5, badRepDelta: -5 },
  },
  {
    name: 'Personal Brand',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Gold',
    description: 'You begin carefully building your own public identity.',
    effects: ['+10 Fame', '+2 Agent Marketing', 'Improved future Lifestyle & Sponsor deals'],
    designColor: 'from-yellow-500 via-teal-700 to-slate-950',
    iconName: 'Globe',
    modifiers: { fameDelta: 10, managerMarketingDelta: 2 },
  },
  {
    name: 'Study the Game',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Silver',
    description: 'You spend your free time studying football instead of partying.',
    effects: ['+5 Training Progress', '+2 Positioning', '+2 Composure'],
    designColor: 'from-teal-600 via-emerald-800 to-slate-950',
    iconName: 'BookOpen',
    modifiers: { trainingProgressDelta: 5, positioningDelta: 2, composureDelta: 2 },
  },
  {
    name: 'Generous Gesture',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Gold',
    description: 'You quietly help someone in need without seeking publicity.',
    effects: ['+10 Fame', '-10 Bad Reputation', 'Public viral chance (+10 bonus Fame)'],
    designColor: 'from-amber-500 via-emerald-700 to-slate-950',
    iconName: 'Gift',
    modifiers: { fameDelta: 10, badRepDelta: -10 },
  },
  {
    name: 'Big Break Lifestyle',
    category: 'lifestyle',
    type: 'good',
    rarity: 'Legendary',
    description: 'Your growing success allows you to improve several areas of your life simultaneously.',
    effects: ['+€15,000 Cash', '+10 Fame', '+5 Fitness', '+5 Chemistry'],
    designColor: 'from-yellow-400 via-emerald-600 to-slate-950',
    iconName: 'Crown',
    modifiers: { cashDelta: 15000, fameDelta: 10, fitnessDelta: 5, chemistryDelta: 5 },
  },

  // ==========================================
  // 2. NEGATIVE LIFESTYLE CARDS (26 - 43)
  // ==========================================
  {
    name: 'Late Night Fast Food Habit',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Bronze',
    description: 'Post-match drive-thrus and greasy meals begin adding unwelcome weight to your frame.',
    effects: ['+2 kg Body Weight', '-10 Fitness', '-1 Pace'],
    designColor: 'from-rose-800 via-amber-950 to-slate-950',
    iconName: 'Cookie',
    modifiers: { weightKgDelta: 2, fitnessDelta: -10, paceDelta: -1 },
  },
  {
    name: 'Off-Season Fast Food Binge',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Silver',
    description: 'Weeks of holiday buffets, junk food, and zero cardio leave you noticeably heavier and sluggish.',
    effects: ['+3 kg Body Weight', '-20 Fitness', '-2 Stamina', '-2 Pace'],
    designColor: 'from-red-900 via-rose-950 to-slate-950',
    iconName: 'Pizza',
    modifiers: { weightKgDelta: 3, fitnessDelta: -20, staminaDelta: -2, paceDelta: -2 },
  },
  {
    name: 'Sedentary Off-Season Gluttony',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Gold',
    description: 'Complete disregard for physical conditioning results in substantial weight gain and a brutal pre-season wake-up call.',
    effects: ['+5 kg Body Weight', '-35 Fitness', '-4 Stamina', '-4 Pace'],
    designColor: 'from-red-950 via-purple-950 to-slate-950',
    iconName: 'AlertTriangle',
    modifiers: { weightKgDelta: 5, fitnessDelta: -35, staminaDelta: -4, paceDelta: -4 },
  },
  {
    name: 'Expensive Night Out',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Bronze',
    description: 'You spend far more than you intended during a night out.',
    effects: ['-€5,000 Cash', '-5 Fame', '+5 Bad Reputation'],
    designColor: 'from-rose-800 via-red-950 to-slate-950',
    iconName: 'DollarSign',
    modifiers: { cashDelta: -5000, fameDelta: -5, badRepDelta: 5 },
  },
  {
    name: 'Bad Purchase',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Bronze',
    description: 'You buy an expensive item that turns out to be almost worthless.',
    effects: ['-€5,000 Cash', 'No useful benefit'],
    designColor: 'from-rose-800 via-rose-950 to-slate-950',
    iconName: 'ShoppingBag',
    modifiers: { cashDelta: -5000 },
  },
  {
    name: 'Party Photos',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Silver',
    description: 'Photos from a private party appear online.',
    effects: ['-10 Fame', '+10 Bad Reputation', '-5 Chemistry'],
    designColor: 'from-red-900 via-rose-950 to-slate-950',
    iconName: 'Camera',
    modifiers: { fameDelta: -10, badRepDelta: 10, chemistryDelta: -5 },
  },
  {
    name: 'Wrong Crowd',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Silver',
    description: 'You begin spending time with people who create problems around you.',
    effects: ['-10 Fame', '+15 Bad Reputation', '-5 Chemistry'],
    designColor: 'from-rose-900 via-red-950 to-slate-950',
    iconName: 'Users',
    modifiers: { fameDelta: -10, badRepDelta: 15, chemistryDelta: -5 },
  },
  {
    name: 'Financial Mistake',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Bronze',
    description: 'You make a poor financial decision.',
    effects: ['-€10,000 Cash', '-5 Fame'],
    designColor: 'from-red-800 via-rose-950 to-slate-950',
    iconName: 'AlertTriangle',
    modifiers: { cashDelta: -10000, fameDelta: -5 },
  },
  {
    name: 'Missed Opportunity',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Silver',
    description: 'A personal commitment causes you to miss an important development opportunity.',
    effects: ['-5 Training Progress', '-5 Fame'],
    designColor: 'from-rose-900 via-red-950 to-slate-950',
    iconName: 'Clock',
    modifiers: { trainingProgressDelta: -5, fameDelta: -5 },
  },
  {
    name: 'Exhausting Lifestyle',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Silver',
    description: 'Your personal life begins interfering with your recovery.',
    effects: ['-15 Fitness', '-2 Stamina'],
    designColor: 'from-red-900 via-rose-950 to-slate-950',
    iconName: 'BatteryLow',
    modifiers: { fitnessDelta: -15, staminaDelta: -2 },
  },
  {
    name: 'Social Media Disaster',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Silver',
    description: 'You post something you immediately regret.',
    effects: ['-15 Fame', '+15 Bad Reputation'],
    designColor: 'from-rose-900 via-red-950 to-slate-950',
    iconName: 'Flame',
    modifiers: { fameDelta: -15, badRepDelta: 15 },
  },
  {
    name: 'Unwanted Attention',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Bronze',
    description: 'Your growing fame attracts unwanted attention.',
    effects: ['-5 Chemistry', '-10 Fitness', '-€2,000 Cash'],
    designColor: 'from-red-800 via-rose-950 to-slate-950',
    iconName: 'Eye',
    modifiers: { chemistryDelta: -5, fitnessDelta: -10, cashDelta: -2000 },
  },
  {
    name: 'Bad Investment',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Gold',
    description: 'An investment loses money.',
    effects: ['-€15,000 Cash', '-5 Fame'],
    designColor: 'from-rose-950 via-red-900 to-black',
    iconName: 'TrendingDown',
    modifiers: { cashDelta: -15000, fameDelta: -5 },
  },
  {
    name: 'Family Disagreement',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Silver',
    description: 'A serious disagreement affects your personal stability.',
    effects: ['-10 Chemistry', '-5 Composure', '-5 Training Progress'],
    designColor: 'from-red-900 via-rose-950 to-slate-950',
    iconName: 'UserX',
    modifiers: { chemistryDelta: -10, composureDelta: -5, trainingProgressDelta: -5 },
  },
  {
    name: 'Burnout',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Gold',
    description: 'You have pushed yourself too hard outside football.',
    effects: ['-20 Fitness', '-5 Training Progress'],
    designColor: 'from-rose-950 via-red-900 to-black',
    iconName: 'ZapOff',
    modifiers: { fitnessDelta: -20, trainingProgressDelta: -5 },
  },
  {
    name: 'Reckless Purchase',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Silver',
    description: 'You buy an expensive luxury item you cannot really afford.',
    effects: ['-€15,000 Cash', 'No meaningful benefit'],
    designColor: 'from-red-900 via-rose-950 to-slate-950',
    iconName: 'CreditCard',
    modifiers: { cashDelta: -15000 },
  },
  {
    name: 'Public Argument',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Gold',
    description: 'You are involved in an argument that becomes public.',
    effects: ['-15 Fame', '+20 Bad Reputation'],
    designColor: 'from-rose-950 via-red-950 to-black',
    iconName: 'MessageSquareX',
    modifiers: { fameDelta: -15, badRepDelta: 20 },
  },
  {
    name: 'Lifestyle Spiral',
    category: 'lifestyle',
    type: 'negative',
    rarity: 'Legendary',
    description: 'Several small bad decisions begin accumulating.',
    effects: ['-10 Fitness', '-10 Chemistry', '-10 Fame', '+10 Bad Reputation'],
    designColor: 'from-red-950 via-rose-950 to-black',
    iconName: 'AlertOctagon',
    modifiers: { fitnessDelta: -10, chemistryDelta: -10, fameDelta: -10, badRepDelta: 10 },
  },

  // ==========================================
  // 3. DOUBLE-EDGED LIFESTYLE CARDS (41 - 53)
  // ==========================================
  {
    name: 'Heavy Hypertrophy Mass Program',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Bronze',
    description: 'You focus on building upper-body muscle and mass. Great for aerial duels, but costs you sprint quickness.',
    effects: ['+3 kg Body Weight', '+4 Strength', '+3 Heading', '-2 Pace'],
    designColor: 'from-amber-700 via-stone-800 to-slate-950',
    iconName: 'Dumbbell',
    modifiers: { weightKgDelta: 3, strengthDelta: 4, headingDelta: 3, paceDelta: -2 },
  },
  {
    name: 'Bulking Regime & Heavy Weights',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Silver',
    description: 'A heavy caloric bulk packs formidable physical power onto your frame, but makes high-intensity sprinting heavier.',
    effects: ['+4 kg Body Weight', '+7 Strength', '+3 Tackling', '-3 Pace', '-3 Stamina'],
    designColor: 'from-orange-800 via-amber-900 to-slate-950',
    iconName: 'Shield',
    modifiers: { weightKgDelta: 4, strengthDelta: 7, tacklingDelta: 3, paceDelta: -3, staminaDelta: -3 },
  },
  {
    name: 'Colossal Target-Man Bulk Transformation',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Gold',
    description: 'You deliberately transform into an immovable physical tank, dominating every shoulder barge at the cost of agility and sprint pace.',
    effects: ['+6 kg Body Weight', '+12 Strength', '+8 Heading', '-5 Pace', '-4 Stamina'],
    designColor: 'from-purple-900 via-amber-800 to-slate-950',
    iconName: 'Award',
    modifiers: { weightKgDelta: 6, strengthDelta: 12, headingDelta: 8, paceDelta: -5, staminaDelta: -4 },
  },
  {
    name: 'Luxury Lifestyle',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Silver',
    description: 'You embrace the celebrity lifestyle.',
    effects: ['Success: +25 Fame, +€20,000 Cash', 'Risk: -10 Fitness, +10 Bad Reputation'],
    designColor: 'from-purple-800 via-emerald-800 to-slate-950',
    iconName: 'Sparkles',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.55,
        successCash: 20000,
        successFame: 25,
        failCashPenalty: 0,
        failFameDelta: 0,
        failBadRepDelta: 10,
        failFitnessDelta: -10,
      },
    },
  },
  {
    name: 'Nightlife King',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Gold',
    description: "You become one of the biggest personalities in the city's nightlife.",
    effects: ['Success: +30 Fame, +10 Chemistry', 'Risk: -20 Fitness, +20 Bad Reputation'],
    designColor: 'from-purple-800 via-amber-700 to-slate-950',
    iconName: 'Music',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 0,
        successFame: 30,
        successChemistry: 10,
        failCashPenalty: 0,
        failFameDelta: 0,
        failBadRepDelta: 20,
        failFitnessDelta: -20,
      },
    },
  },
  {
    name: 'Risky Investment',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Gold',
    description: 'You invest a large portion of your money into a speculative opportunity.',
    effects: ['Success: +€100,000 Cash', 'Failure: -€50,000 Cash'],
    designColor: 'from-purple-800 via-green-800 to-slate-950',
    iconName: 'TrendingUp',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 100000,
        successFame: 5,
        failCashPenalty: 50000,
        failFameDelta: -5,
        failBadRepDelta: 5,
      },
    },
  },
  {
    name: 'Celebrity Relationship',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Gold',
    description: 'You begin a highly public relationship with another famous person.',
    effects: ['Success: +40 Fame, +2 Agent Marketing', 'Controversy: -30 Fame, +25 Bad Rep, -10 Chemistry'],
    designColor: 'from-purple-700 via-pink-800 to-slate-950',
    iconName: 'Heart',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 0,
        successFame: 40,
        successMarketing: 2,
        failCashPenalty: 0,
        failFameDelta: -30,
        failBadRepDelta: 25,
        failChemistryDelta: -10,
      },
    },
  },
  {
    name: 'Extreme Training Camp',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Gold',
    description: 'You pay for an elite private training camp.',
    effects: ['Success: +15 Training Progress, +5 Stamina, +3 Strength', 'Risk: -20 Fitness'],
    designColor: 'from-purple-800 via-teal-700 to-slate-950',
    iconName: 'Zap',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.60,
        successCash: 0,
        successFame: 5,
        successTrainingProgress: 15,
        failCashPenalty: 0,
        failFameDelta: 0,
        failBadRepDelta: 0,
        failFitnessDelta: -20,
      },
    },
  },
  {
    name: 'Luxury Car',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Silver',
    description: 'You purchase an extremely expensive sports car.',
    effects: ['Success: +20 Fame, +5 Chemistry', 'Failure: -€50,000 Cash'],
    designColor: 'from-purple-700 via-amber-700 to-slate-950',
    iconName: 'Car',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.55,
        successCash: 0,
        successFame: 20,
        successChemistry: 5,
        failCashPenalty: 50000,
        failFameDelta: 0,
        failBadRepDelta: 5,
      },
    },
  },
  {
    name: 'Social Media Empire',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Gold',
    description: 'You aggressively build your personal media presence.',
    effects: ['Success: +50 Fame, +3 Agent Marketing', 'Risk: +15 Bad Reputation, -10 Chemistry'],
    designColor: 'from-purple-800 via-fuchsia-800 to-slate-950',
    iconName: 'Globe',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 0,
        successFame: 50,
        successMarketing: 3,
        failCashPenalty: 0,
        failFameDelta: 0,
        failBadRepDelta: 15,
        failChemistryDelta: -10,
      },
    },
  },
  {
    name: 'High-Stakes Investment',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Legendary',
    description: 'You put a substantial amount of money into a volatile investment.',
    effects: ['Success: +€300,000 Cash, +10 Fame', 'Failure: -€150,000 Cash, -10 Fame'],
    designColor: 'from-yellow-400 via-purple-800 to-slate-950',
    iconName: 'TrendingUp',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.45,
        successCash: 300000,
        successFame: 10,
        failCashPenalty: 150000,
        failFameDelta: -10,
        failBadRepDelta: 10,
      },
    },
  },
  {
    name: 'Party Until Dawn',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Legendary',
    description: 'You become the center of a legendary nightlife story.',
    effects: ['Success: +40 Fame, +20 Chemistry', 'Backfire: -30 Fitness, +25 Bad Reputation'],
    designColor: 'from-purple-900 via-rose-800 to-slate-950',
    iconName: 'Flame',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 0,
        successFame: 40,
        successChemistry: 20,
        failCashPenalty: 0,
        failFameDelta: 0,
        failBadRepDelta: 25,
        failFitnessDelta: -30,
      },
    },
  },
  {
    name: 'Live Like a Superstar',
    category: 'lifestyle',
    type: 'double_edged',
    rarity: 'Legendary',
    description: 'You decide to fully embrace the lifestyle of a football superstar.',
    effects: ['Success: +75 Fame, +€50,000 Cash, +5 Agent Marketing', 'Downside: -20 Fitness, +25 Bad Reputation'],
    designColor: 'from-yellow-300 via-purple-900 to-slate-950',
    iconName: 'Crown',
    modifiers: {
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 50000,
        successFame: 75,
        successMarketing: 5,
        failCashPenalty: 0,
        failFameDelta: 0,
        failBadRepDelta: 25,
        failFitnessDelta: -20,
      },
    },
  },
  ...(NEW_NEGATIVE_LIFESTYLE_CARDS as any[]),
];

// ----------------------------------------------------
// FULL SPONSOR CARDS POOL (36 SPECIFIC CARDS)
// ----------------------------------------------------

export const SPONSOR_CARDS_POOL: Omit<CareerStageCardInstance, 'id'>[] = [
  // ==========================================
  // 1. GOOD SPONSOR CARDS
  // ==========================================

  // BRONZE GOOD
  {
    name: 'KickFuel',
    category: 'sponsor',
    type: 'good',
    rarity: 'Bronze',
    tier: 'Bronze',
    description: 'A tiny fictional sports-drink company looking for a young player to promote its first product.',
    effects: ['+€5,000 Upfront Cash', 'No downside'],
    designColor: 'from-amber-700 via-orange-800 to-slate-950',
    iconName: 'Zap',
    modifiers: { cashDelta: 5000 },
    sponsorDealDetails: {
      sponsorName: 'KickFuel',
      category: 'good',
      tier: 'Bronze',
      initialPayment: 5000,
      yearlyPayment: 2500,
      durationYears: 1,
      logoColor: '#f97316',
    },
  },
  {
    name: 'GoalSnap',
    category: 'sponsor',
    type: 'good',
    rarity: 'Bronze',
    tier: 'Bronze',
    description: 'A football photography app wants the player to appear in a promotional campaign.',
    effects: ['+€8,000 Upfront Cash', '+1 Fame'],
    designColor: 'from-amber-700 via-yellow-700 to-slate-950',
    iconName: 'Camera',
    modifiers: { cashDelta: 8000, fameDelta: 1 },
    sponsorDealDetails: {
      sponsorName: 'GoalSnap',
      category: 'good',
      tier: 'Bronze',
      initialPayment: 8000,
      yearlyPayment: 3000,
      durationYears: 1,
      logoColor: '#eab308',
    },
  },
  {
    name: 'BootBarn',
    category: 'sponsor',
    type: 'good',
    rarity: 'Bronze',
    tier: 'Bronze',
    description: 'A small football equipment retailer offers a promotional partnership.',
    effects: ['+€10,000 Upfront Cash', 'Minor equipment discount'],
    designColor: 'from-amber-700 via-amber-800 to-slate-950',
    iconName: 'ShoppingBag',
    modifiers: { cashDelta: 10000 },
    sponsorDealDetails: {
      sponsorName: 'BootBarn',
      category: 'good',
      tier: 'Bronze',
      initialPayment: 10000,
      yearlyPayment: 5000,
      durationYears: 1,
      logoColor: '#d97706',
    },
  },
  {
    name: 'HydraHydrate',
    category: 'sponsor',
    type: 'good',
    rarity: 'Bronze',
    tier: 'Bronze',
    description: 'A regional hydration brand wants the player in social-media advertising.',
    effects: ['+€12,000 Upfront Cash', '+1 Agent Marketing'],
    designColor: 'from-amber-600 via-cyan-800 to-slate-950',
    iconName: 'Droplet',
    modifiers: { cashDelta: 12000, managerMarketingDelta: 1 },
    sponsorDealDetails: {
      sponsorName: 'HydraHydrate',
      category: 'good',
      tier: 'Bronze',
      initialPayment: 12000,
      yearlyPayment: 6000,
      durationYears: 1,
      managerMarketingDelta: 1,
      logoColor: '#06b6d4',
    },
  },

  // SILVER GOOD
  {
    name: 'Adidash',
    category: 'sponsor',
    type: 'good',
    rarity: 'Silver',
    tier: 'Silver',
    description: 'A major sportswear parody brand wants a young professional as part of its next campaign.',
    effects: ['+€50,000 Upfront Cash', '+3 Fame'],
    designColor: 'from-slate-400 via-zinc-600 to-slate-950',
    iconName: 'Award',
    modifiers: { cashDelta: 50000, fameDelta: 3 },
    sponsorDealDetails: {
      sponsorName: 'Adidash',
      category: 'good',
      tier: 'Silver',
      initialPayment: 50000,
      yearlyPayment: 25000,
      durationYears: 2,
      bonusTerms: '€25,000 bonus if player reaches 15 goals',
      logoColor: '#94a3b8',
    },
  },
  {
    name: 'Pumah',
    category: 'sponsor',
    type: 'good',
    rarity: 'Silver',
    tier: 'Silver',
    description: 'A global sportswear company wants the player wearing its products during promotional appearances.',
    effects: ['+€65,000 Upfront Cash', '+2 Fame'],
    designColor: 'from-slate-300 via-slate-500 to-slate-950',
    iconName: 'Zap',
    modifiers: { cashDelta: 65000, fameDelta: 2 },
    sponsorDealDetails: {
      sponsorName: 'Pumah',
      category: 'good',
      tier: 'Silver',
      initialPayment: 65000,
      yearlyPayment: 30000,
      durationYears: 2,
      logoColor: '#64748b',
    },
  },
  {
    name: 'FastFood FC',
    category: 'sponsor',
    type: 'good',
    rarity: 'Silver',
    tier: 'Silver',
    description: 'A massive fast-food chain wants the player as a regional ambassador.',
    effects: ['+€75,000 Upfront Cash', '+3 Fame'],
    designColor: 'from-amber-500 via-red-600 to-slate-950',
    iconName: 'Utensils',
    modifiers: { cashDelta: 75000, fameDelta: 3 },
    sponsorDealDetails: {
      sponsorName: 'FastFood FC',
      category: 'good',
      tier: 'Silver',
      initialPayment: 75000,
      yearlyPayment: 35000,
      durationYears: 2,
      logoColor: '#ef4444',
    },
  },
  {
    name: 'PlayStationary',
    category: 'sponsor',
    type: 'good',
    rarity: 'Silver',
    tier: 'Silver',
    description: 'A gaming company wants the player to appear in a football-game promotional campaign.',
    effects: ['+€90,000 Upfront Cash', '+4 Fame'],
    designColor: 'from-blue-500 via-indigo-600 to-slate-950',
    iconName: 'Gamepad2',
    modifiers: { cashDelta: 90000, fameDelta: 4 },
    sponsorDealDetails: {
      sponsorName: 'PlayStationary',
      category: 'good',
      tier: 'Silver',
      initialPayment: 90000,
      yearlyPayment: 40000,
      durationYears: 2,
      logoColor: '#3b82f6',
    },
  },

  // GOLD GOOD
  {
    name: 'Nikele',
    category: 'sponsor',
    type: 'good',
    rarity: 'Gold',
    tier: 'Gold',
    description: 'A global sportswear giant offers a serious endorsement deal.',
    effects: ['+€250,000 Upfront Cash', '+8 Fame'],
    designColor: 'from-yellow-500 via-amber-600 to-slate-950',
    iconName: 'Sparkles',
    modifiers: { cashDelta: 250000, fameDelta: 8 },
    sponsorDealDetails: {
      sponsorName: 'Nikele',
      category: 'good',
      tier: 'Gold',
      initialPayment: 250000,
      yearlyPayment: 120000,
      durationYears: 3,
      bonusTerms: '€50,000 bonus if player reaches 20 goals',
      logoColor: '#eab308',
    },
  },
  {
    name: 'Adibas Elite',
    category: 'sponsor',
    type: 'good',
    rarity: 'Gold',
    tier: 'Gold',
    description: "The company's premium division wants the player as one of its international faces.",
    effects: ['+€350,000 Upfront Cash', '+10 Fame'],
    designColor: 'from-amber-400 via-yellow-600 to-slate-950',
    iconName: 'Crown',
    modifiers: { cashDelta: 350000, fameDelta: 10 },
    sponsorDealDetails: {
      sponsorName: 'Adibas Elite',
      category: 'good',
      tier: 'Gold',
      initialPayment: 350000,
      yearlyPayment: 150000,
      durationYears: 3,
      bonusTerms: '€100,000 bonus if player plays 30 matches',
      logoColor: '#f59e0b',
    },
  },
  {
    name: 'Coca-Colder',
    category: 'sponsor',
    type: 'good',
    rarity: 'Gold',
    tier: 'Gold',
    description: 'A global beverage company wants the player in a worldwide football campaign.',
    effects: ['+€500,000 Upfront Cash', '+12 Fame'],
    designColor: 'from-red-500 via-amber-500 to-slate-950',
    iconName: 'Award',
    modifiers: { cashDelta: 500000, fameDelta: 12 },
    sponsorDealDetails: {
      sponsorName: 'Coca-Colder',
      category: 'good',
      tier: 'Gold',
      initialPayment: 500000,
      yearlyPayment: 200000,
      durationYears: 3,
      logoColor: '#dc2626',
    },
  },
  {
    name: "McRonald's",
    category: 'sponsor',
    type: 'good',
    rarity: 'Gold',
    tier: 'Gold',
    description: "The world's largest burger chain wants the player for an international campaign.",
    effects: ['+€600,000 Upfront Cash', '+10 Fame', '+1 Agent Marketing'],
    designColor: 'from-yellow-400 via-red-600 to-slate-950',
    iconName: 'Utensils',
    modifiers: { cashDelta: 600000, fameDelta: 10, managerMarketingDelta: 1 },
    sponsorDealDetails: {
      sponsorName: "McRonald's",
      category: 'good',
      tier: 'Gold',
      initialPayment: 600000,
      yearlyPayment: 250000,
      durationYears: 3,
      managerMarketingDelta: 1,
      logoColor: '#facc15',
    },
  },

  // LEGENDARY GOOD
  {
    name: 'Gooch',
    category: 'sponsor',
    type: 'good',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'A fictional technology giant wants the player to become the face of its global sports division.',
    effects: ['+€2,500,000 Upfront Cash', '+25 Fame', '+5 Agent Marketing'],
    designColor: 'from-emerald-500 via-teal-600 to-slate-950',
    iconName: 'Globe',
    modifiers: { cashDelta: 2500000, fameDelta: 25, managerMarketingDelta: 5 },
    sponsorDealDetails: {
      sponsorName: 'Gooch',
      category: 'good',
      tier: 'Legendary',
      initialPayment: 2500000,
      yearlyPayment: 1000000,
      durationYears: 4,
      managerMarketingDelta: 5,
      logoColor: '#10b981',
    },
  },
  {
    name: 'HyperSport International',
    category: 'sponsor',
    type: 'good',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'A fictional multinational sports conglomerate offers an elite global ambassador contract.',
    effects: ['+€5,000,000 Upfront Cash', '+35 Fame', '+10 Agent Marketing'],
    designColor: 'from-purple-500 via-indigo-600 to-slate-950',
    iconName: 'Trophy',
    modifiers: { cashDelta: 5000000, fameDelta: 35, managerMarketingDelta: 10 },
    sponsorDealDetails: {
      sponsorName: 'HyperSport International',
      category: 'good',
      tier: 'Legendary',
      initialPayment: 5000000,
      yearlyPayment: 2000000,
      durationYears: 4,
      managerMarketingDelta: 10,
      logoColor: '#a855f7',
    },
  },
  {
    name: 'Amazoff',
    category: 'sponsor',
    type: 'good',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'A global technology and commerce empire wants exclusive promotional rights to the player image.',
    effects: ['+€8,000,000 Upfront Cash', '+40 Fame', '+10 Agent Marketing'],
    designColor: 'from-amber-400 via-orange-600 to-slate-950',
    iconName: 'Crown',
    modifiers: { cashDelta: 8000000, fameDelta: 40, managerMarketingDelta: 10 },
    sponsorDealDetails: {
      sponsorName: 'Amazoff',
      category: 'good',
      tier: 'Legendary',
      initialPayment: 8000000,
      yearlyPayment: 3000000,
      durationYears: 5,
      managerMarketingDelta: 10,
      logoColor: '#fb923c',
    },
  },

  // ==========================================
  // 2. NEGATIVE SPONSOR CARDS
  // ==========================================

  // BRONZE NEGATIVE
  {
    name: 'ScamBank',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Bronze',
    tier: 'Bronze',
    description: 'A suspicious financial app offers the player a small promotional payment.',
    effects: ['+€7,500 Upfront Cash', '-3 Fame', '+3 Bad Reputation'],
    designColor: 'from-rose-900 via-red-950 to-slate-950',
    iconName: 'AlertOctagon',
    modifiers: { cashDelta: 7500, fameDelta: -3, badRepDelta: 3 },
    sponsorDealDetails: {
      sponsorName: 'ScamBank',
      category: 'negative',
      tier: 'Bronze',
      initialPayment: 7500,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#e11d48',
    },
  },
  {
    name: 'CryptoBro Finance',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Bronze',
    tier: 'Bronze',
    description: 'A questionable financial startup wants the player to promote its investment platform.',
    effects: ['+€10,000 Upfront Cash', '-5 Fame', '+5 Bad Reputation'],
    designColor: 'from-red-900 via-rose-950 to-slate-950',
    iconName: 'Flame',
    modifiers: { cashDelta: 10000, fameDelta: -5, badRepDelta: 5 },
    sponsorDealDetails: {
      sponsorName: 'CryptoBro Finance',
      category: 'negative',
      tier: 'Bronze',
      initialPayment: 10000,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#f43f5e',
    },
  },
  {
    name: 'ClickBet',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Bronze',
    tier: 'Bronze',
    description: 'A suspicious betting website offers a small promotional deal.',
    effects: ['+€15,000 Upfront Cash', '-5 Fame', '+8 Bad Reputation'],
    designColor: 'from-red-950 via-rose-900 to-slate-950',
    iconName: 'ShieldAlert',
    modifiers: { cashDelta: 15000, fameDelta: -5, badRepDelta: 8 },
    sponsorDealDetails: {
      sponsorName: 'ClickBet',
      category: 'negative',
      tier: 'Bronze',
      initialPayment: 15000,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#f43f5e',
    },
  },

  // SILVER NEGATIVE
  {
    name: 'GetRichFast™',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Silver',
    tier: 'Silver',
    description: 'A dubious investment company offers the player a short promotional contract.',
    effects: ['+€40,000 Upfront Cash', '-10 Fame', '+10 Bad Reputation'],
    designColor: 'from-rose-900 via-red-900 to-black',
    iconName: 'AlertTriangle',
    modifiers: { cashDelta: 40000, fameDelta: -10, badRepDelta: 10 },
    sponsorDealDetails: {
      sponsorName: 'GetRichFast™',
      category: 'negative',
      tier: 'Silver',
      initialPayment: 40000,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#fb7185',
    },
  },
  {
    name: 'NFTiger',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Silver',
    tier: 'Silver',
    description: 'An NFT company wants the player to promote its latest collection.',
    effects: ['+€60,000 Upfront Cash', '-12 Fame', '+15 Bad Reputation'],
    designColor: 'from-rose-950 via-red-950 to-black',
    iconName: 'Flame',
    modifiers: { cashDelta: 60000, fameDelta: -12, badRepDelta: 15 },
    sponsorDealDetails: {
      sponsorName: 'NFTiger',
      category: 'negative',
      tier: 'Silver',
      initialPayment: 60000,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#f43f5e',
    },
  },

  // GOLD NEGATIVE
  {
    name: 'ShadyCoin',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Gold',
    tier: 'Gold',
    description: 'A cryptocurrency exchange with an extremely questionable reputation wants the player as its public face.',
    effects: ['+€200,000 Upfront Cash', '-20 Fame', '+20 Bad Reputation'],
    designColor: 'from-red-950 via-rose-900 to-black',
    iconName: 'AlertOctagon',
    modifiers: { cashDelta: 200000, fameDelta: -20, badRepDelta: 20 },
    sponsorDealDetails: {
      sponsorName: 'ShadyCoin',
      category: 'negative',
      tier: 'Gold',
      initialPayment: 200000,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#e11d48',
    },
  },
  {
    name: 'DebtNow',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Gold',
    tier: 'Gold',
    description: 'A financial company offers an unusually large promotional advance.',
    effects: ['+€300,000 Upfront Cash', '-15 Fame', '+20 Bad Reputation', 'Publicly criticized'],
    designColor: 'from-rose-950 via-red-950 to-slate-950',
    iconName: 'ShieldAlert',
    modifiers: { cashDelta: 300000, fameDelta: -15, badRepDelta: 20 },
    sponsorDealDetails: {
      sponsorName: 'DebtNow',
      category: 'negative',
      tier: 'Gold',
      initialPayment: 300000,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#be123c',
    },
  },

  // LEGENDARY NEGATIVE
  {
    name: 'PonziPro',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'A supposedly revolutionary investment company offers an enormous endorsement payment. Company collapses later.',
    effects: ['+€1,000,000 Upfront Cash', '-35 Fame', '+40 Bad Reputation', 'Scandal Collapse'],
    designColor: 'from-red-950 via-rose-950 to-black',
    iconName: 'Skull',
    modifiers: { cashDelta: 1000000, fameDelta: -35, badRepDelta: 40 },
    sponsorDealDetails: {
      sponsorName: 'PonziPro',
      category: 'negative',
      tier: 'Legendary',
      initialPayment: 1000000,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#9f1239',
    },
  },
  {
    name: 'Scamazon',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'A mysterious international corporation offers the player a huge endorsement contract.',
    effects: ['+€2,000,000 Upfront Cash', '-40 Fame', '+50 Bad Reputation'],
    designColor: 'from-red-950 via-rose-950 to-black',
    iconName: 'Flame',
    modifiers: { cashDelta: 2000000, fameDelta: -40, badRepDelta: 50 },
    sponsorDealDetails: {
      sponsorName: 'Scamazon',
      category: 'negative',
      tier: 'Legendary',
      initialPayment: 2000000,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#881337',
    },
  },
  {
    name: 'BankruptBet',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'A gambling corporation offers the player an enormous promotional deal.',
    effects: ['+€3,000,000 Upfront Cash', '-50 Fame', '+60 Bad Reputation', 'Sponsors harder temporarily'],
    designColor: 'from-red-900 via-black to-slate-950',
    iconName: 'AlertOctagon',
    modifiers: { cashDelta: 3000000, fameDelta: -50, badRepDelta: 60 },
    sponsorDealDetails: {
      sponsorName: 'BankruptBet',
      category: 'negative',
      tier: 'Legendary',
      initialPayment: 3000000,
      yearlyPayment: 0,
      durationYears: 1,
      logoColor: '#991b1b',
    },
  },
  {
    name: 'Debt King',
    category: 'sponsor',
    type: 'negative',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'Offers +€500,000 cash immediately, but requires €1,000,000 repayment 1 year later through Accounting.',
    effects: ['+€500,000 Upfront Cash', 'Must repay €1,000,000 in 1 year', '-10 Fame', '+10 Bad Reputation'],
    designColor: 'from-amber-950 via-red-950 to-black',
    iconName: 'DollarSign',
    modifiers: { cashDelta: 500000, fameDelta: -10, badRepDelta: 10 },
    sponsorDealDetails: {
      sponsorName: 'Debt King',
      category: 'negative',
      tier: 'Legendary',
      initialPayment: 500000,
      yearlyPayment: 0,
      durationYears: 1,
      debtObligation: {
        repaymentAmount: 1000000,
        dueWeeksRemaining: 52,
      },
      logoColor: '#7f1d1d',
    },
  },

  // ==========================================
  // 3. DOUBLE-EDGED SPONSOR CARDS
  // ==========================================

  // BRONZE DOUBLE-EDGED
  {
    name: 'CoinKick',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Bronze',
    tier: 'Bronze',
    description: 'A tiny crypto startup offers a sponsorship partly paid in its own token. Outcome varies.',
    effects: ['Potential €20k–€60k token payout', 'Risk: Token value collapse'],
    designColor: 'from-purple-800 via-amber-800 to-slate-950',
    iconName: 'HelpCircle',
    sponsorDealDetails: {
      sponsorName: 'CoinKick',
      category: 'double_edged',
      tier: 'Bronze',
      initialPayment: 0,
      doubleEdgedRisk: {
        successProb: 0.55,
        successCash: 50000,
        successFame: 2,
        failCashPenalty: 0,
        failFameDelta: -3,
        failBadRepDelta: 5,
      },
      logoColor: '#a855f7',
    },
  },
  {
    name: 'MysteryBox FC',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Bronze',
    tier: 'Bronze',
    description: 'A sportswear company offers a mystery sponsorship package containing money, equipment, or bad rep.',
    effects: ['Potential €30k–€100k package', 'Unpredictable brand impact'],
    designColor: 'from-purple-800 via-indigo-900 to-slate-950',
    iconName: 'HelpCircle',
    sponsorDealDetails: {
      sponsorName: 'MysteryBox FC',
      category: 'double_edged',
      tier: 'Bronze',
      initialPayment: 0,
      doubleEdgedRisk: {
        successProb: 0.60,
        successCash: 75000,
        successFame: 5,
        failCashPenalty: 0,
        failFameDelta: 0,
        failBadRepDelta: 10,
      },
      logoColor: '#8b5cf6',
    },
  },

  // SILVER DOUBLE-EDGED
  {
    name: 'NFT United',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Silver',
    tier: 'Silver',
    description: 'A fashionable NFT company offers a large endorsement deal.',
    effects: ['Potential €100k–€500k payout', 'Risk: NFT market crash (-10 Fame, +15 Bad Rep)'],
    designColor: 'from-purple-700 via-pink-800 to-slate-950',
    iconName: 'TrendingUp',
    sponsorDealDetails: {
      sponsorName: 'NFT United',
      category: 'double_edged',
      tier: 'Silver',
      initialPayment: 0,
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 350000,
        successFame: 10,
        failCashPenalty: 0,
        failFameDelta: -10,
        failBadRepDelta: 15,
      },
      logoColor: '#ec4899',
    },
  },
  {
    name: 'CryptoBall',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Silver',
    tier: 'Silver',
    description: 'A cryptocurrency platform offers a percentage of promotional revenue.',
    effects: ['Potential €150k–€750k payout', 'Risk: Platform failure & scandal'],
    designColor: 'from-purple-800 via-indigo-800 to-slate-950',
    iconName: 'Zap',
    sponsorDealDetails: {
      sponsorName: 'CryptoBall',
      category: 'double_edged',
      tier: 'Silver',
      initialPayment: 0,
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 500000,
        successFame: 12,
        failCashPenalty: 0,
        failFameDelta: -15,
        failBadRepDelta: 20,
      },
      logoColor: '#6366f1',
    },
  },

  // GOLD DOUBLE-EDGED
  {
    name: 'MoonShot Capital',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Gold',
    tier: 'Gold',
    description: 'A mysterious investment company offers a massive endorsement package.',
    effects: ['Success: +€3,000,000, +20 Fame', 'Failure: -€500,000, -20 Fame, +25 Bad Rep'],
    designColor: 'from-amber-500 via-purple-700 to-slate-950',
    iconName: 'Rocket',
    sponsorDealDetails: {
      sponsorName: 'MoonShot Capital',
      category: 'double_edged',
      tier: 'Gold',
      initialPayment: 0,
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 3000000,
        successFame: 20,
        failCashPenalty: 500000,
        failFameDelta: -20,
        failBadRepDelta: 25,
      },
      logoColor: '#f59e0b',
    },
  },
  {
    name: 'InfluenceX',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Gold',
    tier: 'Gold',
    description: 'A controversial social-media company offers an enormous ambassador deal.',
    effects: ['Potential +€1,000,000, +20 Fame', 'Risk: Major controversy & Fame collapse'],
    designColor: 'from-fuchsia-600 via-purple-800 to-slate-950',
    iconName: 'Flame',
    sponsorDealDetails: {
      sponsorName: 'InfluenceX',
      category: 'double_edged',
      tier: 'Gold',
      initialPayment: 0,
      doubleEdgedRisk: {
        successProb: 0.50,
        successCash: 1000000,
        successFame: 20,
        failCashPenalty: 0,
        failFameDelta: -30,
        failBadRepDelta: 35,
      },
      logoColor: '#d946ef',
    },
  },

  // LEGENDARY DOUBLE-EDGED
  {
    name: 'CryptoMoon',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'A mysterious cryptocurrency empire offers a life-changing sponsorship.',
    effects: ['Success: +€10,000,000+, +50 Fame', 'Failure: €0 return, -50 Fame, +60 Bad Rep'],
    designColor: 'from-yellow-400 via-purple-800 to-slate-950',
    iconName: 'Crown',
    sponsorDealDetails: {
      sponsorName: 'CryptoMoon',
      category: 'double_edged',
      tier: 'Legendary',
      initialPayment: 0,
      doubleEdgedRisk: {
        successProb: 0.45,
        successCash: 10000000,
        successFame: 50,
        failCashPenalty: 0,
        failFameDelta: -50,
        failBadRepDelta: 60,
      },
      logoColor: '#eab308',
    },
  },
  {
    name: 'NFT Emperor',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: "A bizarre billionaire wants the player to become face of world's largest virtual football collection.",
    effects: ['Success: +€15,000,000, +60 Fame', 'Failure: -€2,000,000 loss, -60 Fame, +70 Bad Rep'],
    designColor: 'from-amber-400 via-rose-800 to-slate-950',
    iconName: 'Trophy',
    sponsorDealDetails: {
      sponsorName: 'NFT Emperor',
      category: 'double_edged',
      tier: 'Legendary',
      initialPayment: 0,
      doubleEdgedRisk: {
        successProb: 0.45,
        successCash: 15000000,
        successFame: 60,
        failCashPenalty: 2000000,
        failFameDelta: -60,
        failBadRepDelta: 70,
      },
      logoColor: '#f59e0b',
    },
  },
  {
    name: 'North Korea FC',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'A fictional state-backed football organization offers an absurdly lucrative sponsorship.',
    effects: ['Reward: +€20,000,000 Upfront Cash', 'Risk: International backlash (-80 Fame, +90 Bad Rep)'],
    designColor: 'from-red-600 via-purple-900 to-slate-950',
    iconName: 'Globe',
    sponsorDealDetails: {
      sponsorName: 'North Korea FC',
      category: 'double_edged',
      tier: 'Legendary',
      initialPayment: 20000000,
      doubleEdgedRisk: {
        successProb: 0.40,
        successCash: 20000000,
        successFame: 40,
        failCashPenalty: 0,
        failFameDelta: -80,
        failBadRepDelta: 90,
      },
      logoColor: '#dc2626',
    },
  },
  {
    name: 'The Golden Gamble',
    category: 'sponsor',
    type: 'double_edged',
    rarity: 'Legendary',
    tier: 'Legendary',
    description: 'A mysterious international conglomerate offers €50,000,000 for exclusive 1-year global ambassador rights.',
    effects: ['Success: +€50,000,000, +100 Fame, +20 Agent Marketing', 'Failure: -€10M penalty, -100 Fame, +100 Bad Rep'],
    designColor: 'from-yellow-300 via-amber-500 to-purple-950',
    iconName: 'Crown',
    sponsorDealDetails: {
      sponsorName: 'The Golden Gamble',
      category: 'double_edged',
      tier: 'Legendary',
      initialPayment: 0,
      doubleEdgedRisk: {
        successProb: 0.40,
        successCash: 50000000,
        successFame: 100,
        successMarketing: 20,
        failCashPenalty: 10000000,
        failFameDelta: -100,
        failBadRepDelta: 100,
      },
      logoColor: '#facc15',
    },
  },
];

/**
  Check if player has "In The Shadow Of" perk from Ex-Pro Player Parent Card
 */
export function hasInTheShadowOfPerk(player: PlayerCardData): boolean {
  if (isPerkRetired(player, 'in_the_shadow_of')) return false;
  if (hasPerk(player, 'in_the_shadow_of')) return true;
  const parent = player.equippedParentCard;
  if (!parent) return false;
  return (
    parent.typeId === 'ex_pro_player' ||
    parent.perkTitle === 'In The Shadow Of' ||
    (parent.name && parent.name.toLowerCase().includes('ex-pro'))
  );
}

/**
  Draw 4 Career-Stage Cards for Preseason or Midseason card events
  Includes full Fame-based distribution, Manager Marketing modifiers,
  and "In The Shadow Of" perk mechanics.
  Base Probabilities per card: Career 50%, Lifestyle 35%, Sponsor 15%
 */
export function drawThreeCareerStageCards(
  player: PlayerCardData,
  manager?: ManagerState,
  eventType: 'preseason' | 'midseason' = 'preseason',
  cardCount: number = 3
): CareerStageCardInstance[] {
  const cards: CareerStageCardInstance[] = [];
  const inShadowOf = hasInTheShadowOfPerk(player);
  const fame = player.fame || 0;
  const managerMarketing = manager?.marketing || 0;

  // BASE POOL PROBABILITIES:
  // Standard: Career 50%, Lifestyle 35%, Sponsor 15%
  // With In The Shadow Of: Sponsor 22.5% (+50% of 15%), Career 46.25%, Lifestyle 31.25%
  let pCareer = 0.50;
  let pLifestyle = 0.35;
  let pSponsor = 0.15;

  if (inShadowOf) {
    pSponsor = 0.225; // 15% * 1.5 = 22.5%
    pCareer = 0.4625;
    pLifestyle = 0.3125;
  }

  // Determine baseline Negative Sponsor Probability by Fame bracket
  let baselineNegativeSponsorProb = 0.20; // Default moderate
  if (fame < 50) {
    baselineNegativeSponsorProb = 0.45; // Low Fame: ~45%
  } else if (fame <= 250) {
    baselineNegativeSponsorProb = 0.20; // Moderate Fame: ~20%
  } else {
    baselineNegativeSponsorProb = 0.10; // High Fame: ~10%
  }

  // Manager Marketing reduces negative sponsor probability slightly
  baselineNegativeSponsorProb = Math.max(0.05, baselineNegativeSponsorProb - managerMarketing * 0.001);

  // In The Shadow Of DOUBLES the probability of receiving a Negative Sponsor Card within current Fame bracket!
  let pNegSponsor = baselineNegativeSponsorProb;
  if (inShadowOf) {
    pNegSponsor = Math.min(0.95, baselineNegativeSponsorProb * 2);
  }

  // Normalize remaining Sponsor probabilities between Good and Double-Edged (75% Good / 25% Double-Edged ratio)
  const remainingSponsorProb = Math.max(0.05, 1.0 - pNegSponsor);
  const pGoodSponsor = remainingSponsorProb * 0.75;
  const pDoubleSponsor = remainingSponsorProb * 0.25;

  // 10% chance during pre-season or mid-season to draw a Cultural Card from the player's host country
  const hostCountry = (player as any).clubCountry || player.country || 'ENG';
  const culturalRoll = Math.random();
  let culturalCardInstance: CareerStageCardInstance | null = null;
  if (culturalRoll < 0.10) {
    culturalCardInstance = maybeDrawCulturalCard(hostCountry);
  }

  for (let i = 0; i < cardCount; i++) {
    // If a cultural card was rolled for this stage, assign it as the first featured card
    if (i === 0 && culturalCardInstance) {
      cards.push(culturalCardInstance);
      continue;
    }

    // 1. SELECT POOL CATEGORY (Strict Category Isolation)
    const poolRoll = Math.random();
    let chosenCategory: CareerCardCategory = 'career';

    if (poolRoll < pSponsor) {
      chosenCategory = 'sponsor';
    } else if (poolRoll < pSponsor + pLifestyle) {
      chosenCategory = 'lifestyle';
    } else {
      chosenCategory = 'career';
    }

    // 2. DRAW FROM CATEGORY-SPECIFIC UNIQUE CAREER ACTIVE DECK
    // Strictly isolates draw: Career only from Career, Lifestyle only from Lifestyle, Sponsor only from Sponsor.
    // Probability is strictly proportional to individual owned copies (no rarity/tier weighting).
    const storeCat = chosenCategory === 'lifestyle' ? 'life' : chosenCategory;
    const drawnCustom = drawUniqueCareerCategoryCards(storeCat, 1);
    const customCard = drawnCustom[0];

    let sourcePool = CAREER_CARDS_POOL;
    if (chosenCategory === 'lifestyle') sourcePool = LIFESTYLE_CARDS_POOL;
    if (chosenCategory === 'sponsor') sourcePool = SPONSOR_CARDS_POOL;

    let template: Omit<CareerStageCardInstance, 'id'> | undefined;
    if (customCard) {
      // 1. Match by name
      template = sourcePool.find((c) => c.name.toLowerCase() === customCard.name.toLowerCase());
      if (!template) {
        const numMatch = customCard.id.match(/\d+$/);
        if (numMatch) {
          const idx = parseInt(numMatch[0], 10);
          template = sourcePool[idx];
        }
      }
      // 2. Direct conversion from custom card if it has stat points or free stat points
      if (!template && (customCard.statPointsBonus || customCard.name === 'Superior Training' || customCard.modifiers?.some((m) => m.target === 'stat_free_points'))) {
        const rar: CareerCardRarity =
          customCard.tier === 'iconic' ? 'Iconic' :
          customCard.tier === 'legendary' ? 'Legendary' :
          customCard.tier === 'gold' ? 'Gold' :
          customCard.tier === 'silver' ? 'Silver' : 'Bronze';

        const freePointsVal = customCard.modifiers?.find((m) => m.target === 'stat_free_points')?.value;

        template = {
          name: customCard.name,
          category: chosenCategory,
          type: 'good',
          rarity: rar,
          description: customCard.description || '',
          effects: customCard.statPointsBonus
            ? [
                `+${customCard.statPointsBonus.points} Stat Development Point${customCard.statPointsBonus.points > 1 ? 's' : ''} for ${customCard.statPointsBonus.statLabel}`,
                `📈 Progresses ${customCard.statPointsBonus.statLabel} toward next level`,
              ]
            : (freePointsVal ? [`+${freePointsVal} Development Stat Points instantly`] : []),
          designColor: rar === 'Iconic' ? 'from-amber-400 via-yellow-500 to-amber-950' : 'from-amber-600 via-yellow-700 to-slate-950',
          iconName: customCard.iconName || 'Zap',
          modifiers: {
            statPointsBonus: customCard.statPointsBonus
              ? {
                  stat: customCard.statPointsBonus.statKey,
                  points: customCard.statPointsBonus.points,
                  statLabel: customCard.statPointsBonus.statLabel,
                }
              : undefined,
            freeStatPoints: freePointsVal,
          },
        };
      }
    }

    if (!template) {
      template = sourcePool[Math.floor(Math.random() * sourcePool.length)];
    }

    cards.push({
      ...template,
      isNewCardGuaranteed: (customCard as any)?.isNewCardGuaranteed,
      id: `career-card-${chosenCategory}-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
    });
  }

  // 5. STAT BREAK DRAW ROLL (Unique Career only, disabled in Play as a Legend)
  // Requirement: Player must have at least one eligible stat at 99.
  // Chance: 1% per applicable career draw.
  const isPlayAsLegend =
    (player as any).careerMode === 'legend' ||
    (player as any).careerMode === 'play_as_legend' ||
    (player as any).gameMode === 'play_as_a_legend' ||
    (player as any).isPlayAsLegendActive ||
    Boolean(player.isLegend);

  if (!isPlayAsLegend) {
    const isGk = (player.subPosition || player.position || '').toUpperCase() === 'GK';
    const detailed = player.stats?.detailed as any;
    const gkDetailed = player.stats?.gkDetailed as any;

    let hasEligible99 = false;
    if (isGk && gkDetailed) {
      const gkKeys = ['gkReflexes', 'gkDiving', 'gkHandling', 'gkPositioning', 'gkAerial', 'gkSaving'];
      hasEligible99 = gkKeys.some((k) => (gkDetailed[k] || 0) >= 99);
    } else if (detailed) {
      hasEligible99 = ALL_STAT_BREAK_ELIGIBLE_STATS.some((k) => (detailed[k] || 0) >= 99);
    }

    if (hasEligible99 && Math.random() < 0.01) {
      // 1% Stat Break trigger! Replace one card with a random Stat Break Iconic card
      const pickedStatBreakCard =
        STAT_BREAK_CARDS[Math.floor(Math.random() * STAT_BREAK_CARDS.length)];
      const replaceIdx = Math.floor(Math.random() * cards.length);
      cards[replaceIdx] = {
        ...pickedStatBreakCard,
        id: `career-card-statbreak-${Date.now()}-${replaceIdx}-${Math.floor(Math.random() * 1000)}`,
      };
    }
  }

  // 6. BAD REPUTATION MID-SEASON NEGATIVE LIFESTYLE ROLL
  // Tier 1: 10% chance, Tier 2: 20% chance, Tier 3: 30% chance during mid-season
  const badRepTier = player.badReputationTier || 0;
  const isMidSeason = eventType === 'midseason' || player.seasonPhase === 'midseason';
  if (isMidSeason && badRepTier >= 1) {
    const negLifeProb = getMidseasonNegativeLifestyleDrawChance(badRepTier);
    if (Math.random() < negLifeProb) {
      const negativePool = LIFESTYLE_CARDS_POOL.filter((c) => c.type === 'negative');
      if (negativePool.length > 0) {
        const pickedNeg = negativePool[Math.floor(Math.random() * negativePool.length)];
        const replaceIdx = Math.floor(Math.random() * cards.length);
        cards[replaceIdx] = {
          ...pickedNeg,
          id: `career-card-lifestyle-neg-${Date.now()}-${replaceIdx}-${Math.floor(Math.random() * 1000)}`,
        };
      }
    }
  }

  return cards;
}

// Alias for backward compatibility
export const drawFourCareerStageCards = drawThreeCareerStageCards;

/**
  Applies chosen Career-Stage Card to Player & Accounting state
 */
export function applyCareerStageCard(
  card: CareerStageCardInstance,
  player: PlayerCardData,
  accounting?: AccountingState,
  manager?: ManagerState
): {
  updatedPlayer: PlayerCardData;
  updatedAccounting?: AccountingState;
  updatedManager?: ManagerState;
  message: string;
} {
  const updatedP: PlayerCardData = JSON.parse(JSON.stringify(player));
  let updatedM: ManagerState = manager ? JSON.parse(JSON.stringify(manager)) : { name: null, negotiation: 20, network: 20, marketing: 20 };
  const updatedAcc: AccountingState = accounting
    ? JSON.parse(JSON.stringify(accounting))
    : {
        contractYears: 0,
        yearlySalary: 0,
        sponsors: [],
        sanctions: [],
        businesses: [],
        totalSavings: 0,
      };

  let resultMessage = `✨ Card Selected: ${card.name}!`;

  // Add card to collectedCards history
  const collected: CareerCollectedCard = {
    id: card.id,
    name: card.name,
    category: card.category === 'sponsor' ? 'other_career' : card.category === 'lifestyle' ? 'other_career' : 'other_career',
    rarity: card.rarity as any,
    effects: card.effects,
    obtainedAt: card.description,
    designColor: card.designColor,
    iconName: card.iconName,
  };

  updatedP.collectedCards = [...(updatedP.collectedCards || []), collected];

  // 0. HANDLE STAT BREAK CARD EXECUTION
  if (card.isStatBreakCard || card.name === 'New Ways to Play' || card.name === 'Football Idol' || card.name === 'Training Discovery') {
    const isGk = (updatedP.subPosition || updatedP.position || '').toUpperCase() === 'GK';

    if (isGk) {
      const gk = getOrCreateGkDetailed(updatedP.stats);
      const gkKeys = ['gkReflexes', 'gkDiving', 'gkHandling', 'gkPositioning', 'gkAerial', 'gkSaving'];
      let targetGkKey = gkKeys.find((k) => (gk as any)[k] === 99) || gkKeys.sort((a, b) => (gk as any)[b] - (gk as any)[a])[0] || 'gkReflexes';

      const prevVal = (gk as any)[targetGkKey] || 99;
      (gk as any)[targetGkKey] = 100;
      updatedP.statBreakActive = true;
      updatedP.statBreakStats = {
        ...(updatedP.statBreakStats || {}),
        [targetGkKey]: 100,
      };
      updatedP.statBreakHistory = [
        ...(updatedP.statBreakHistory || []),
        {
          statKey: targetGkKey,
          previousValue: prevVal,
          newValue: 100,
          cardName: card.name,
          timestamp: updatedP.calendarDate || `Season ${updatedP.currentSeason || 1}`,
        },
      ];

      updatedP.stats = syncCategoryStatsFromGkDetailed(updatedP.stats, gk);
      const newOvr = calculateWeightedOvr('GK', 'GK', updatedP.stats, updatedP.playStyle);
      updatedP.ovr = Math.min(105, newOvr);

      const statLabel = targetGkKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      resultMessage = `🌟 STAT BREAK IMMORTALITY! "${card.name}" broke through elite limits — ${statLabel} permanently locked at 100!`;
    } else if (updatedP.stats && updatedP.stats.detailed) {
      const detailed = updatedP.stats.detailed as any;
      let targetKey: keyof OutfieldDetailedStats | null = null;

      if (card.targetStatBreakKey && CARD_STAT_BREAK_ELIGIBLE_STATS.includes(card.targetStatBreakKey as any)) {
        targetKey = card.targetStatBreakKey as keyof OutfieldDetailedStats;
      } else {
        // Priority 1: Pick an eligible PRO/CRE/SCO/DEF stat currently at 99
        const candidates99 = CARD_STAT_BREAK_ELIGIBLE_STATS.filter((k) => (detailed[k] || 0) === 99);
        if (candidates99.length > 0) {
          targetKey = candidates99[0];
        } else {
          // Priority 2: Fallback - pick highest eligible PRO/CRE/SCO/DEF stat < 100
          const candidatesBelow100 = CARD_STAT_BREAK_ELIGIBLE_STATS.filter((k) => (detailed[k] || 0) < 100);
          if (candidatesBelow100.length > 0) {
            candidatesBelow100.sort((a, b) => (detailed[b] || 0) - (detailed[a] || 0));
            targetKey = candidatesBelow100[0];
          } else {
            targetKey = CARD_STAT_BREAK_ELIGIBLE_STATS[0];
          }
        }
      }

      if (targetKey) {
        const prevVal = detailed[targetKey] || 99;
        detailed[targetKey] = 100;
        updatedP.statBreakActive = true;
        updatedP.statBreakStats = {
          ...(updatedP.statBreakStats || {}),
          [targetKey]: 100,
        };
        updatedP.statBreakHistory = [
          ...(updatedP.statBreakHistory || []),
          {
            statKey: targetKey,
            previousValue: prevVal,
            newValue: 100,
            cardName: card.name,
            timestamp: updatedP.calendarDate || `Season ${updatedP.currentSeason || 1}`,
          },
        ];

        updatedP.stats = syncCategoryStatsFromDetailed(updatedP.stats, detailed);
        updatedP.stats.detailed = detailed;
        const newOvr = calculateWeightedOvr(
          updatedP.position || 'ST',
          updatedP.subPosition || updatedP.position || 'ST',
          updatedP.stats,
          updatedP.playStyle
        );
        updatedP.ovr = Math.min(105, newOvr);

        const statLabel = targetKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        const breakInfo = getStatBreakBonus(detailed);
        resultMessage = `🌟 STAT BREAK IMMORTALITY! "${card.name}" broke through elite limits — ${statLabel} elevated to 100! (+${breakInfo.flatOvrBonus} Flat OVR, 2x Match Success Chance active).`;
      }
    }
  }

  // 1. APPLY DISASTER ARSON LIFESTYLE RESOLUTION
  if ((card.modifiers as any)?.isArsonDisaster || card.id === 'card-life-disaster-arson' || card.name.includes('Arson Scandal')) {
    const disasterRes = applyArsonDisasterTimeskip(updatedP, updatedAcc);
    return {
      updatedPlayer: disasterRes.updatedPlayer,
      updatedAccounting: disasterRes.updatedAccounting,
      updatedManager: updatedM,
      message: disasterRes.message,
    };
  }

  // 2. APPLY BASIC MODIFIERS
  if (card.modifiers) {
    if (card.modifiers.fameDelta) {
      updatedP.fame = Math.max(0, Math.min(1000, (updatedP.fame || 10) + card.modifiers.fameDelta));
    }
    if (card.modifiers.badRepDelta) {
      const repRes = addBadReputation(updatedP, card.modifiers.badRepDelta);
      updatedP.badReputation = repRes.updatedPlayer.badReputation;
      updatedP.badReputationTier = repRes.updatedPlayer.badReputationTier;
      if (repRes.tierUpEvent) {
        resultMessage = `🚨 BAD REPUTATION TIER ${repRes.tierUpEvent.newTier} REACHED! ${repRes.tierUpEvent.title}`;
        (updatedP as any).pendingBadRepTierEvent = repRes.tierUpEvent;
      }
    }
    if ((card.modifiers as any).chemistryCeiling) {
      updatedP.chemistryCeiling = (card.modifiers as any).chemistryCeiling;
      updatedP.chemistryCeilingMonthsRemaining = (card.modifiers as any).chemistryCeilingMonths || 6;
      updatedP.chemistryCeilingReason = card.name;
    }
    if (card.modifiers.chemistryDelta) {
      const oldChem = updatedP.chemistry || 50;
      const newChem = Math.max(0, Math.min(MAX_TOTAL_CHEMISTRY, oldChem + card.modifiers.chemistryDelta));
      updatedP.chemistry = newChem;
      if (oldChem < 100 && newChem > 100) {
        const deficitFilled = 100 - oldChem;
        const overflow = newChem - 100;
        resultMessage = `⚡ Chemistry +${card.modifiers.chemistryDelta}%: ${deficitFilled}% neutralized negative deficit to 100%, and +${overflow}% overflow synergy unlocked!`;
      } else if (newChem > 100) {
        const overflow = newChem - 100;
        resultMessage = `⚡ Squad Chemistry increased +${card.modifiers.chemistryDelta}% (Overflow Chemistry: +${overflow}% bonus stats active!)`;
      }
    }
    if (typeof (card.modifiers as any)?.weightKgDelta === 'number') {
      const delta = (card.modifiers as any).weightKgDelta;
      const oldW = updatedP.weightKg && !isNaN(updatedP.weightKg) ? updatedP.weightKg : 75;
      const newW = Math.max(45, Math.min(125, oldW + delta));
      updatedP.weightKg = newW;
      const wSign = delta > 0 ? `+${delta}` : `${delta}`;
      resultMessage += ` ⚖️ Body Weight altered ${wSign} kg (Now ${newW} kg)!`;
    }
    if (card.modifiers.cashDelta) {
      updatedAcc.totalSavings = (updatedAcc.totalSavings ?? 0) + card.modifiers.cashDelta;
    }
    if (card.modifiers.managerMarketingDelta) {
      updatedM.marketing = Math.min(100, (updatedM.marketing || 20) + card.modifiers.managerMarketingDelta);
    }
    if (card.modifiers.fitnessDelta) {
      updatedP.fitness = Math.max(0, Math.min(100, (updatedP.fitness ?? 100) + card.modifiers.fitnessDelta));
    }
    if (card.modifiers.trainingProgressDelta) {
      updatedP.trainingProgress = Math.max(0, Math.min(100, (updatedP.trainingProgress || 0) + card.modifiers.trainingProgressDelta));
    }
    if (card.modifiers.injuryWeeksReduction) {
      if (updatedP.isInjured && updatedP.injuryWeeksRemaining) {
        updatedP.injuryWeeksRemaining = Math.max(0, updatedP.injuryWeeksRemaining - card.modifiers.injuryWeeksReduction);
        if (updatedP.injuryWeeksRemaining === 0) {
          updatedP.isInjured = false;
          updatedP.injuryName = undefined;
        }
      }
    }
    if (card.modifiers.freeStatPoints) {
      updatedP.freeStatPoints = (updatedP.freeStatPoints || 0) + card.modifiers.freeStatPoints;
      updatedP.unassignedPoints = (updatedP.unassignedPoints || 0) + card.modifiers.freeStatPoints;
      if (card.name.toLowerCase().includes('superior training')) {
        resultMessage = `👑 SUPERIOR TRAINING! You discovered a new form of training — +${card.modifiers.freeStatPoints} Development Stat Points granted instantly!`;
      } else {
        resultMessage += ` (+${card.modifiers.freeStatPoints} Development Stat Points!)`;
      }
    }
    if (card.modifiers.recurringIncome) {
      const newSponsor: SponsorItem = {
        id: `sp-invest-${Date.now()}`,
        name: `${card.name} (Investment Return)`,
        category: 'good',
        tier: 'Bronze',
        initialPayment: 0,
        yearlyPayment: card.modifiers.recurringIncome,
        durationYears: 3,
        logoColor: '#10b981',
        active: true,
        obtainedDate: updatedP.calendarDate || 'Season 1',
      };
      updatedAcc.sponsors = [...(updatedAcc.sponsors || []), newSponsor];
    }

    // Detailed Stats
    if (updatedP.stats && updatedP.stats.detailed) {
      if (card.modifiers.staminaDelta) {
        updatedP.stats.detailed.stamina = Math.min(99, Math.max(1, updatedP.stats.detailed.stamina + card.modifiers.staminaDelta));
      }
      if (card.modifiers.strengthDelta) {
        updatedP.stats.detailed.strength = Math.min(99, Math.max(1, updatedP.stats.detailed.strength + card.modifiers.strengthDelta));
      }
      if (card.modifiers.composureDelta) {
        updatedP.stats.detailed.composure = Math.min(99, Math.max(1, updatedP.stats.detailed.composure + card.modifiers.composureDelta));
      }
      if (card.modifiers.positioningDelta) {
        updatedP.stats.detailed.positioning = Math.min(99, Math.max(1, updatedP.stats.detailed.positioning + card.modifiers.positioningDelta));
      }
      if (card.modifiers.reactionsDelta) {
        updatedP.stats.detailed.reactions = Math.min(99, Math.max(1, updatedP.stats.detailed.reactions + card.modifiers.reactionsDelta));
      }
      if ((card.modifiers as any).paceDelta) {
        if ('acceleration' in updatedP.stats.detailed) {
          (updatedP.stats.detailed as any).acceleration = Math.min(99, Math.max(1, ((updatedP.stats.detailed as any).acceleration || 50) + (card.modifiers as any).paceDelta));
        }
        if ('sprintSpeed' in updatedP.stats.detailed) {
          (updatedP.stats.detailed as any).sprintSpeed = Math.min(99, Math.max(1, ((updatedP.stats.detailed as any).sprintSpeed || 50) + (card.modifiers as any).paceDelta));
        }
      }
      if (card.modifiers.statDeltas) {
        Object.entries(card.modifiers.statDeltas).forEach(([sKey, delta]) => {
          if (sKey in updatedP.stats.detailed) {
            const current = (updatedP.stats.detailed as any)[sKey] || 50;
            (updatedP.stats.detailed as any)[sKey] = Math.min(99, Math.max(1, current + delta));
          }
        });
      }
    }

    // Direct Stat Points Bonus (Progressive development)
    if (card.modifiers.statPointsBonus) {
      const { stat: statKey, points, statLabel } = card.modifiers.statPointsBonus;
      const isGk = (updatedP.subPosition || updatedP.position || '').toUpperCase() === 'GK';
      if (!updatedP.statTrainingProgress) updatedP.statTrainingProgress = {};
      if (!updatedP.statBreakStats) updatedP.statBreakStats = {};

      const detailed = isGk ? getOrCreateGkDetailed(updatedP.stats) : getOrCreateOutfieldDetailed(updatedP.stats);
      if (statKey in detailed) {
        const curVal = (detailed as any)[statKey] || 40;
        const curProg = updatedP.statTrainingProgress[statKey] || 0;
        const isWeakness = isStatWeaknessForPlayerType(updatedP.playerTypeId, statKey);
        const invRes = applyStatPointInvestment(curVal, curProg, points, isWeakness);
        (detailed as any)[statKey] = invRes.newLevel;
        updatedP.statTrainingProgress[statKey] = invRes.newProgress;
        if (invRes.statBreakTriggered) {
          updatedP.statBreakActive = true;
          updatedP.statBreakStats[statKey] = 100;
        }
        const label = statLabel || statKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        const levelsGainedStr = invRes.levelsGained > 0 ? ` (+${invRes.levelsGained} level${invRes.levelsGained > 1 ? 's' : ''}!)` : '';
        resultMessage = `📈 "${card.name}": +${points} Stat Development Point${points > 1 ? 's' : ''} invested in ${label}${levelsGainedStr} (Level ${curVal} ➔ ${invRes.newLevel} [${Math.round(invRes.newProgress * 100)}% progress])`;
      }
    }

    // Direct Stat Points Bonuses (Progressive development across multiple stats)
    if (card.modifiers.statPointsBonuses && card.modifiers.statPointsBonuses.length > 0) {
      const isGk = (updatedP.subPosition || updatedP.position || '').toUpperCase() === 'GK';
      if (!updatedP.statTrainingProgress) updatedP.statTrainingProgress = {};
      if (!updatedP.statBreakStats) updatedP.statBreakStats = {};

      const detailed = isGk ? getOrCreateGkDetailed(updatedP.stats) : getOrCreateOutfieldDetailed(updatedP.stats);
      const multiSummaries: string[] = [];

      card.modifiers.statPointsBonuses.forEach(({ stat: statKey, points, statLabel }) => {
        if (statKey in detailed) {
          const curVal = (detailed as any)[statKey] || 40;
          const curProg = updatedP.statTrainingProgress[statKey] || 0;
          const isWeakness = isStatWeaknessForPlayerType(updatedP.playerTypeId, statKey);
          const invRes = applyStatPointInvestment(curVal, curProg, points, isWeakness);
          (detailed as any)[statKey] = invRes.newLevel;
          updatedP.statTrainingProgress[statKey] = invRes.newProgress;
          if (invRes.statBreakTriggered) {
            updatedP.statBreakActive = true;
            updatedP.statBreakStats[statKey] = 100;
          }
          const label = statLabel || statKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
          multiSummaries.push(`+${points} pts in ${label} (Level ${curVal} ➔ ${invRes.newLevel})`);
        }
      });

      if (multiSummaries.length > 0) {
        resultMessage = `📈 "${card.name}": ${multiSummaries.join(', ')}`;
      }
    }

    // Recalculate OVR after detailed stat updates
    const isGk = (updatedP.subPosition || updatedP.position || '').toUpperCase() === 'GK';
    if (isGk) {
      const gk = getOrCreateGkDetailed(updatedP.stats);
      updatedP.stats = syncCategoryStatsFromGkDetailed(updatedP.stats, gk);
      updatedP.ovr = calculateWeightedOvr('GK', 'GK', updatedP.stats, updatedP.playStyle);
    } else if (updatedP.stats.detailed) {
      updatedP.stats = syncCategoryStatsFromDetailed(updatedP.stats, updatedP.stats.detailed);
      updatedP.ovr = calculateWeightedOvr(updatedP.position || 'CM', updatedP.subPosition, updatedP.stats, updatedP.playStyle);
    }
  }

  // 2. HANDLE DETAILED SPONSOR DEALS & LIFESTYLE DOUBLE-EDGED RISKS
  if (card.category === 'lifestyle' && card.type === 'double_edged' && card.modifiers?.doubleEdgedRisk) {
    const risk = card.modifiers.doubleEdgedRisk;
    const marketingBonus = (updatedM.marketing || 20) * 0.002;
    const successProb = Math.min(0.85, (risk.successProb || 0.50) + marketingBonus);
    const isSuccess = Math.random() < successProb;

    if (isSuccess) {
      if (risk.successCash) updatedAcc.totalSavings = (updatedAcc.totalSavings ?? 0) + risk.successCash;
      if (risk.successFame) updatedP.fame = Math.max(0, Math.min(1000, (updatedP.fame || 10) + risk.successFame));
      if (risk.successChemistry) updatedP.chemistry = Math.max(0, Math.min(MAX_TOTAL_CHEMISTRY, (updatedP.chemistry || 50) + risk.successChemistry));
      if (risk.successFitness) updatedP.fitness = Math.max(0, Math.min(100, (updatedP.fitness ?? 100) + risk.successFitness));
      if (risk.successTrainingProgress) updatedP.trainingProgress = Math.max(0, Math.min(100, (updatedP.trainingProgress || 0) + risk.successTrainingProgress));
      if (risk.successMarketing) updatedM.marketing = Math.min(100, (updatedM.marketing || 20) + risk.successMarketing);

      resultMessage = `🚀 LIFESTYLE CHOICE SUCCEEDED! ${card.name} was a massive success!`;
    } else {
      if (risk.failCashPenalty) updatedAcc.totalSavings = (updatedAcc.totalSavings ?? 0) - risk.failCashPenalty;
      if (risk.failFameDelta) updatedP.fame = Math.max(0, Math.min(1000, (updatedP.fame || 10) + risk.failFameDelta));
      if (risk.failBadRepDelta) updatedP.badReputation = Math.max(1, Math.min(100, (updatedP.badReputation || 1) + risk.failBadRepDelta));
      if (risk.failFitnessDelta) updatedP.fitness = Math.max(0, Math.min(100, (updatedP.fitness ?? 100) + risk.failFitnessDelta));
      if (risk.failChemistryDelta) updatedP.chemistry = Math.max(0, Math.min(MAX_TOTAL_CHEMISTRY, (updatedP.chemistry || 50) + risk.failChemistryDelta));

      resultMessage = `💥 LIFESTYLE CHOICE BACKFIRED! ${card.name} caused complications!`;
    }
  } else if (card.category === 'sponsor' && card.sponsorDealDetails) {
    const deal = card.sponsorDealDetails;

    // A. DOUBLE-EDGED RISK RESOLUTION
    if (deal.category === 'double_edged' && deal.doubleEdgedRisk) {
      const risk = deal.doubleEdgedRisk;
      const marketingBonus = (updatedM.marketing || 20) * 0.002;
      const successProb = Math.min(0.85, (risk.successProb || 0.50) + marketingBonus);
      const isSuccess = Math.random() < successProb;

      if (isSuccess) {
        // Double-Edged SUCCESS
        updatedAcc.totalSavings = (updatedAcc.totalSavings ?? 0) + risk.successCash;
        updatedP.fame = Math.max(0, Math.min(1000, (updatedP.fame || 10) + risk.successFame));

        if (risk.successMarketing) {
          updatedM.marketing = Math.min(100, (updatedM.marketing || 20) + risk.successMarketing);
        }

        resultMessage = `🚀 GAMBLE SUCCEEDED! ${card.name} paid out €${risk.successCash.toLocaleString()} with +${risk.successFame} Fame!`;

        // Record in Accounting
        const newSponsor: SponsorItem = {
          id: `sp-${Date.now()}`,
          name: `${deal.sponsorName} (Success Deal)`,
          category: 'double_edged',
          tier: deal.tier,
          initialPayment: risk.successCash,
          yearlyPayment: 0,
          durationYears: 1,
          fameDelta: risk.successFame,
          logoColor: deal.logoColor || '#a855f7',
          active: true,
          obtainedDate: updatedP.calendarDate || 'Season 1',
        };
        updatedAcc.sponsors = [...(updatedAcc.sponsors || []), newSponsor];
      } else {
        // Double-Edged FAILURE / CONTROVERSY
        if (risk.failCashPenalty > 0) {
          // Deduct penalty cash, allowing negative balance
          updatedAcc.totalSavings = (updatedAcc.totalSavings ?? 0) - risk.failCashPenalty;
        }

        updatedP.fame = Math.max(0, Math.min(1000, (updatedP.fame || 10) + risk.failFameDelta));
        updatedP.badReputation = Math.max(1, Math.min(100, (updatedP.badReputation || 1) + risk.failBadRepDelta));

        resultMessage = `💥 GAMBLE FAILED! ${card.name} caused a public scandal! (${risk.failFameDelta} Fame, +${risk.failBadRepDelta} Bad Rep${
          risk.failCashPenalty > 0 ? `, -€${risk.failCashPenalty.toLocaleString()} penalty` : ''
        })`;

        // Record in Accounting
        const newSponsor: SponsorItem = {
          id: `sp-${Date.now()}`,
          name: `${deal.sponsorName} (Scandal Collapse)`,
          category: 'double_edged',
          tier: deal.tier,
          initialPayment: risk.failCashPenalty > 0 ? -risk.failCashPenalty : 0,
          yearlyPayment: 0,
          durationYears: 1,
          fameDelta: risk.failFameDelta,
          badRepDelta: risk.failBadRepDelta,
          logoColor: '#f43f5e',
          active: false,
          obtainedDate: updatedP.calendarDate || 'Season 1',
        };
        updatedAcc.sponsors = [...(updatedAcc.sponsors || []), newSponsor];
      }
    } else {
      // B. STANDARD GOOD OR NEGATIVE SPONSOR DEAL
      if (deal.initialPayment > 0) {
        updatedAcc.totalSavings = (updatedAcc.totalSavings ?? 0) + deal.initialPayment;
      }

      if (deal.managerMarketingDelta) {
        updatedM.marketing = Math.min(100, (updatedM.marketing || 20) + deal.managerMarketingDelta);
      }

      const newSponsor: SponsorItem = {
        id: `sp-${Date.now()}`,
        name: deal.sponsorName,
        category: deal.category,
        tier: deal.tier,
        initialPayment: deal.initialPayment,
        yearlyPayment: deal.yearlyPayment || 0,
        durationYears: deal.durationYears || 1,
        bonusTerms: deal.bonusTerms,
        debtObligation: deal.debtObligation,
        fameDelta: card.modifiers?.fameDelta,
        badRepDelta: card.modifiers?.badRepDelta,
        managerMarketingDelta: deal.managerMarketingDelta,
        logoColor: deal.logoColor || '#3b82f6',
        active: true,
        obtainedDate: updatedP.calendarDate || 'Season 1',
      };

      updatedAcc.sponsors = [...(updatedAcc.sponsors || []), newSponsor];

      resultMessage = `💵 SPONSOR ACCEPTED: ${deal.sponsorName} (${deal.tier} Tier)! +€${deal.initialPayment.toLocaleString()} cash received.`;
    }
  } else if (card.sponsorDeal) {
    // Legacy fallback sponsor deal
    const newSponsor: SponsorItem = {
      id: `sp-${Date.now()}`,
      name: card.sponsorDeal.name,
      yearlyPayment: card.sponsorDeal.yearlyPayment,
      logoColor: card.sponsorDeal.logoColor,
      active: true,
    };
    updatedAcc.sponsors = [...(updatedAcc.sponsors || []), newSponsor];
  }

  if (updatedP.stats) {
    const isGk = (updatedP.subPosition || updatedP.position || '').toUpperCase() === 'GK';
    if (isGk) {
      const gk = getOrCreateGkDetailed(updatedP.stats);
      updatedP.stats = syncCategoryStatsFromGkDetailed(updatedP.stats, gk);
      updatedP.ovr = calculateWeightedOvr('GK', 'GK', updatedP.stats, updatedP.playStyle);
    } else {
      const d = getOrCreateOutfieldDetailed(updatedP.stats);
      updatedP.stats = syncCategoryStatsFromDetailed(updatedP.stats, d);
      updatedP.ovr = calculateWeightedOvr(
        updatedP.position || 'ST',
        updatedP.subPosition || updatedP.position || 'ST',
        updatedP.stats,
        updatedP.playStyle
      );
    }
  }

  return {
    updatedPlayer: updatedP,
    updatedAccounting: updatedAcc,
    updatedManager: updatedM,
    message: resultMessage,
  };
}

/**
 * Returns all available Career Stage Cards (Career, Lifestyle, Sponsor)
 * sorted strictly from HIGHEST to LOWEST tier
 * (Legendary -> Gold / Epic -> Silver / Rare -> Bronze / Common).
 */
export function getAllAvailableCareerStageCards(): CareerStageCardInstance[] {
  const rarityRank = (rarity: CareerCardRarity | string): number => {
    const r = (rarity || '').toLowerCase();
    if (r === 'legendary') return 5;
    if (r === 'gold' || r === 'epic') return 4;
    if (r === 'silver' || r === 'rare') return 3;
    if (r === 'bronze') return 2;
    return 1; // common
  };

  const allDefinitions = [
    ...CAREER_CARDS_POOL,
    ...LIFESTYLE_CARDS_POOL,
    ...SPONSOR_CARDS_POOL,
  ];

  const instances: CareerStageCardInstance[] = allDefinitions.map((def, idx) => ({
    ...def,
    id: `csc-avail-${idx}-${def.category}-${def.rarity}`,
  }));

  instances.sort((a, b) => {
    const rankA = rarityRank(a.rarity);
    const rankB = rarityRank(b.rarity);
    if (rankB !== rankA) return rankB - rankA;
    return a.name.localeCompare(b.name);
  });

  return instances;
}

