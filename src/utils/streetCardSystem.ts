import {
  StreetCardDefinition,
  StreetCardInstance,
  StreetCardRarity,
  StreetCardId,
  ProContractOffer,
} from '../types/streetCards';
import { PlayerConfig, CareerCollectedCard } from '../types';
import { drawUniqueCareerCategoryCards } from './storeCollectionSystem';
import {
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
} from './statCalculations';
import { getStreetOverhauledCardDefinitions } from '../data/statProgressionCardsData';
import { applyStatPointInvestment, isStatWeaknessForPlayerType } from './statProgressionSystem';

export const STREET_CARD_DEFINITIONS: StreetCardDefinition[] = [
  // ==========================================
  // POSITIVE STREET CARDS (OVERHAULED)
  // ==========================================
  ...getStreetOverhauledCardDefinitions(),

  // ==========================================
  // NEGATIVE STREET CARDS (10)
  // ==========================================
  {
    id: 'lost_your_temper',
    name: 'Lost Your Temper',
    type: 'negative',
    description: 'A confrontation during a match affected your reputation.',
    iconName: 'Flame',
    designColor: 'from-rose-800 via-red-900 to-slate-950',
    effects: {
      composure: { bronze: -3, silver: -5, gold: -8, legendary: -12 },
      badReputation: { bronze: 2, silver: 2, gold: 2, legendary: 2 },
    },
  },
  {
    id: 'bad_landing',
    name: 'Bad Landing',
    type: 'negative',
    description: 'A street match ended with an awkward injury.',
    iconName: 'ShieldAlert',
    designColor: 'from-red-800 via-rose-950 to-slate-950',
    effects: {
      injuryRecovery: { bronze: -3, silver: -5, gold: -8, legendary: -10 },
    },
  },
  {
    id: 'skipped_training',
    name: 'Skipped Training',
    type: 'negative',
    description: 'You spent too much time playing and not enough improving.',
    iconName: 'Clock',
    designColor: 'from-gray-800 via-slate-900 to-black',
    effects: {
      potential: { bronze: -1, silver: -1, gold: -2, legendary: -3 },
    },
  },
  {
    id: 'no_structure',
    name: 'No Structure',
    type: 'negative',
    description: 'Without organized coaching, some fundamentals developed slower.',
    iconName: 'XCircle',
    designColor: 'from-orange-900 via-rose-950 to-slate-950',
    effects: {
      shortPass: { bronze: -3, silver: -5, gold: -7, legendary: -10 },
    },
  },
  {
    id: 'overshadowed',
    name: 'Overshadowed',
    type: 'negative',
    description: 'Another player received the attention you wanted.',
    iconName: 'UserX',
    designColor: 'from-slate-800 via-gray-900 to-slate-950',
    effects: {
      fame: { bronze: -1, silver: -2, gold: -4, legendary: -6 },
    },
  },
  {
    id: 'bad_habits',
    name: 'Bad Habits',
    type: 'negative',
    description: 'You developed habits that affected your preparation.',
    iconName: 'AlertTriangle',
    designColor: 'from-amber-900 via-red-950 to-black',
    effects: {
      stamina: { bronze: -3, silver: -5, gold: -8, legendary: -12 },
    },
  },
  {
    id: 'street_trouble',
    name: 'Street Trouble',
    type: 'negative',
    description: 'A fight outside football affected your image.',
    iconName: 'Skull',
    designColor: 'from-rose-900 via-red-950 to-black',
    effects: {
      badReputation: { bronze: 5, silver: 10, gold: 15, legendary: 20 },
    },
  },
  {
    id: 'bad_fields',
    name: 'Bad Fields',
    type: 'negative',
    description: 'Poor playing conditions limited your technical growth.',
    iconName: 'CloudRain',
    designColor: 'from-stone-800 via-slate-900 to-black',
    effects: {
      ballControl: { bronze: -2, silver: -4, gold: -6, legendary: -8 },
    },
  },
  {
    id: 'divided_focus',
    name: 'Divided Focus',
    type: 'negative',
    description: 'You had less time to dedicate fully to football.',
    iconName: 'Split',
    designColor: 'from-purple-900 via-slate-900 to-black',
    effects: {
      developmentSpeed: { bronze: '-5%', silver: '-10%', gold: '-15%', legendary: '-20%' },
    },
  },
  {
    id: 'playing_injured',
    name: 'Playing Injured',
    type: 'negative',
    description: 'You ignored pain and kept playing.',
    iconName: 'Activity',
    designColor: 'from-red-900 via-rose-950 to-slate-950',
    effects: {
      injuryRisk: { bronze: '+5%', silver: '+5%', gold: '+5%', legendary: '+5%' },
    },
  },

  // ==========================================
  // DOUBLE EDGED STREET CARDS (5)
  // ==========================================
  {
    id: 'street_warrior',
    name: 'Street Warrior',
    type: 'double_edged',
    description: 'You survived every challenge by becoming physically stronger.',
    iconName: 'Shield',
    designColor: 'from-amber-700 via-red-900 to-slate-950',
    effects: {
      strength: { bronze: 10, silver: 20, gold: 30, legendary: 40 },
      dribbling: { bronze: -5, silver: -10, gold: -15, legendary: -20 },
    },
  },
  {
    id: 'street_magician',
    name: 'Street Magician',
    type: 'double_edged',
    description: 'You became impossible to predict but ignored simple football.',
    iconName: 'Sparkles',
    designColor: 'from-purple-700 via-indigo-900 to-slate-950',
    effects: {
      dribbling: { bronze: 10, silver: 20, gold: 30, legendary: 40 },
      positioning: { bronze: -5, silver: -10, gold: -15, legendary: -20 },
    },
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    type: 'double_edged',
    description: 'You focused everything on explosive acceleration.',
    iconName: 'Zap',
    designColor: 'from-cyan-600 via-blue-900 to-slate-950',
    effects: {
      pace: { bronze: 10, silver: 20, gold: 30, legendary: 40 },
      stamina: { bronze: -5, silver: -10, gold: -15, legendary: -20 },
    },
  },
  {
    id: 'shoot_first',
    name: 'Shoot First',
    type: 'double_edged',
    description: 'You always searched for the decisive shot.',
    iconName: 'Target',
    designColor: 'from-orange-600 via-red-900 to-slate-950',
    effects: {
      longShots: { bronze: 10, silver: 20, gold: 30, legendary: 40 },
      shortPass: { bronze: -5, silver: -10, gold: -15, legendary: -20 },
    },
  },
  {
    id: 'street_defender',
    name: 'Street Defender',
    type: 'double_edged',
    description: 'You learned that stopping opponents mattered more than creating highlights.',
    iconName: 'Lock',
    designColor: 'from-emerald-700 via-teal-900 to-slate-950',
    effects: {
      tackling: { bronze: 10, silver: 20, gold: 30, legendary: 40 },
      dribbling: { bronze: -5, silver: -10, gold: -15, legendary: -20 },
    },
  },

  // ==========================================
  // ICONIC STREET CARDS (2)
  // ==========================================
  {
    id: 'street_scout',
    name: 'Street Scout',
    type: 'iconic',
    description: 'A professional scout discovered you while watching a street match. Your talent was impossible to ignore.',
    iconName: 'Eye',
    designColor: 'from-amber-400 via-yellow-500 to-slate-950',
    isIconicOnly: true,
    iconicDescription: '⭐ Iconic Card: Exclusive 1% Draw Chance. Grants instant Professional Opportunity.',
    iconicEffects: [
      '⭐ Fame: +10',
      '🏆 Special Effect: Professional Opportunity (Immediately Triggers FIRST CONTRACT EVENT)',
    ],
    effects: {
      fame: { bronze: 10, silver: 10, gold: 10, legendary: 10 },
    },
  },
  {
    id: 'trivela',
    name: 'Trivela',
    type: 'iconic',
    description: "You learned you don't need your weak foot at all, you mastered your outside foot technique.",
    iconName: 'OutsideFoot',
    designColor: 'from-cyan-400 via-amber-300 to-slate-950',
    isIconicOnly: true,
    iconicDescription: "💎 ⭐ Iconic Card: Exclusive 1% Draw Chance. Grants the 'Outside Foot' Perk.",
    iconicEffects: [
      "✨ Perk: Outside Foot (Master outside foot technique in place of weak foot)",
      "⭐ 5★ Weak Foot Efficiency (Permanent 1.0x multiplier / 0% weak-foot penalty on shots & passes)",
      "🎯 Trivela Curve Mastery: Execute impossible outside-of-the-boot curved strikes and assists",
      "🌟 Fame: +5",
    ],
    effects: {
      fame: { bronze: 5, silver: 5, gold: 5, legendary: 5 },
    },
  },
];

/**
 * Rolls street card rarity according to exact probability draw odds:
 * Iconic: 1%
 * Legendary: 5%
 * Gold: 25%
 * Silver: 50%
 * Bronze: 100% (Default fallback)
 */
export function rollRarityForStreetCard(): StreetCardRarity {
  const rand = Math.random();
  if (rand < 0.01) return 'iconic';
  if (rand < 0.06) return 'legendary';
  if (rand < 0.31) return 'gold';
  if (rand < 0.81) return 'silver';
  return 'bronze';
}

/**
 * Calculates age-based street stat gain multiplier:
 * - Age <= 20: 100% gains (1.0x)
 * - Age 21 - 28: 50% gains (0.5x)
 * - Age > 28: 0% gains (0.0x)
 */
export function getStreetCardAgeStatMultiplier(age: number = 10): number {
  if (age > 28) return 0;
  if (age > 20) return 0.5;
  return 1.0;
}

/**
 * Instantiates a StreetCardInstance from a definition and rarity tier.
 */
export function instantiateStreetCard(
  def: StreetCardDefinition,
  rarity: StreetCardRarity,
  playerAge: number = 16
): StreetCardInstance {
  const isIconic = rarity === 'iconic' || def.isIconicOnly;
  const activeRarity: StreetCardRarity = isIconic ? 'iconic' : rarity;
  const ageMult = getStreetCardAgeStatMultiplier(playerAge);

  const formattedEffects: string[] = [];
  const effectsMap: Record<string, number | string> = {};

  if (isIconic && def.iconicEffects) {
    formattedEffects.push(...def.iconicEffects);
    if (def.id === 'street_scout') {
      effectsMap['fame'] = 10;
      effectsMap['firstContractEvent'] = 'true';
    } else if (def.id === 'trivela') {
      effectsMap['fame'] = 5;
      effectsMap['perk'] = 'outside_foot';
      effectsMap['outside_foot'] = 'true';
    }
  } else {
    Object.entries(def.effects).forEach(([statKey, tierValues]) => {
      const value =
        activeRarity === 'iconic'
          ? tierValues.legendary
          : tierValues[activeRarity as 'bronze' | 'silver' | 'gold' | 'legendary'];

      effectsMap[statKey] = value;

      const statLabel = formatStatLabel(statKey);
      const isPositive = typeof value === 'number' ? value > 0 : !value.toString().startsWith('-');
      const prefix = typeof value === 'number' && value > 0 ? '+' : '';

      let effectStr = `${statLabel}: ${prefix}${value}`;
      if (def.isDistributablePoints || statKey === 'unassignedPoints') {
        effectStr = `+${value} Distributable Stat Points`;
      } else if (def.isStatPoints) {
        effectStr = `${statLabel}: +${value} Stat Points`;
      } else if (typeof value === 'number' && value > 0 && statKey !== 'fame' && statKey !== 'badReputation' && statKey !== 'injuryRecovery') {
        effectStr = `${statLabel}: +${value} (Capped at 99)`;
      }

      if (typeof value === 'number' && value > 0 && statKey !== 'fame' && statKey !== 'badReputation' && statKey !== 'injuryRecovery') {
        if (ageMult === 0) {
          effectStr = `${statLabel}: +0 (Age > 28: No Street Gains)`;
        } else if (ageMult === 0.5) {
          const reduced = Math.max(1, Math.round(value * 0.5));
          effectStr = `${statLabel}: +${reduced} (50% Age Penalty: 21-28)`;
        }
      }

      formattedEffects.push(effectStr);
    });
  }

  return {
    id: `street-${def.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    cardId: def.id,
    name: def.name,
    type: def.type,
    rarity: activeRarity,
    description: def.description,
    iconName: def.iconName,
    designColor: def.designColor,
    obtainedAt: `Age ${playerAge} - Street Experience`,
    formattedEffects,
    effectsMap,
    isIconic,
    isStatPoints: def.isStatPoints,
    isDistributablePoints: def.isDistributablePoints,
    statPointsBonus: def.statPointsBonus,
    statPointsBonuses: def.statPointsBonuses,
  };
}

/**
 * Draws a random Street Card based on the player's persistent Unique Career Active Deck.
 * Duplicates and store-unlocked copies are weighted strictly by owned copy quantities.
 */
export function drawStreetCard(playerAge: number = 16, hasManager: boolean = false): StreetCardInstance {
  const drawn = drawFourStreetCards(playerAge, hasManager);
  return drawn[0] || instantiateStreetCard(STREET_CARD_DEFINITIONS[0], 'bronze', playerAge);
}

/**
 * Draws 3 distinct Street Cards for a choice event during street football.
 * Directly draws from the Unique Career Active Deck for the 'street' category.
 * Each copy has equal probability (no rarity weighting, no tier weighting).
 */
export function drawThreeStreetCards(playerAge: number = 16, hasManager: boolean = false): StreetCardInstance[] {
  const drawnCustomCards = drawUniqueCareerCategoryCards('street', 3, undefined, {
    filter: (card) => {
      if (hasManager && (card.id.includes('street_scout') || card.name.toLowerCase().includes('scout') || card.name.toLowerCase().includes('manager') || card.name.toLowerCase().includes('agent'))) {
        return false;
      }
      return true;
    },
  });

  const result: StreetCardInstance[] = [];

  for (const customCard of drawnCustomCards) {
    const rawId = customCard.id.replace('card-street-', '');
    let def = STREET_CARD_DEFINITIONS.find((d) => d.id === rawId || customCard.id.includes(d.id));
    if (!def) {
      def = STREET_CARD_DEFINITIONS.find((d) => customCard.name.toLowerCase().includes(d.name.toLowerCase())) || STREET_CARD_DEFINITIONS[0];
    }

    let activeRarity: StreetCardRarity = 'bronze';
    if (customCard.tier === 'silver') activeRarity = 'silver';
    else if (customCard.tier === 'gold') activeRarity = 'gold';
    else if (customCard.tier === 'legendary') activeRarity = 'legendary';
    else if (customCard.tier === 'iconic' || def.isIconicOnly || def.type === 'iconic') activeRarity = 'iconic';
    else activeRarity = 'bronze';

    const inst = instantiateStreetCard(def, activeRarity, playerAge);
    if ((customCard as any)?.isNewCardGuaranteed) {
      inst.isNewCardGuaranteed = true;
    }
    result.push(inst);
  }

  // Safety fallback if result has fewer than 3 cards
  if (result.length < 3) {
    const fallbackDefs = STREET_CARD_DEFINITIONS.filter((d) => !hasManager || d.id !== 'street_scout');
    while (result.length < 3) {
      const def = fallbackDefs[result.length % fallbackDefs.length];
      result.push(instantiateStreetCard(def, 'bronze', playerAge));
    }
  }

  return result;
}

// Backward compatibility alias: drawFourStreetCards now defaults to streamlined 3-card draw
export const drawFourStreetCards = drawThreeStreetCards;

function formatStatLabel(key: string): string {
  switch (key) {
    case 'dribbling':
      return 'Dribbling';
    case 'ballControl':
      return 'Ball Control';
    case 'shortPass':
      return 'Short Pass';
    case 'stamina':
      return 'Stamina';
    case 'fame':
      return 'Fame';
    case 'composure':
      return 'Composure';
    case 'positioning':
      return 'Positioning';
    case 'weakFoot':
      return 'Weak Foot';
    case 'chemistry':
      return 'Chemistry';
    case 'money':
      return 'Money';
    case 'badReputation':
      return 'Bad Reputation Score';
    case 'injuryRecovery':
      return 'Injury Recovery';
    case 'potential':
      return 'Potential OVR';
    case 'developmentSpeed':
      return 'Development Speed';
    case 'injuryRisk':
      return 'Injury Risk';
    case 'strength':
      return 'Strength';
    case 'pace':
      return 'Pace';
    case 'longShots':
      return 'Long Shots';
    case 'tackling':
      return 'Tackling';
    case 'retention':
      return 'Retention';
    case 'longPass':
      return 'Long Pass';
    case 'crossing':
      return 'Crossing';
    case 'shooting':
      return 'Shooting';
    case 'heading':
      return 'Heading';
    case 'marking':
      return 'Marking';
    case 'interceptions':
      return 'Interceptions';
    case 'reactions':
      return 'Reactions';
    case 'unassignedPoints':
    case 'freeStatPoints':
      return 'Distributable Stat Points';
    default:
      return key;
  }
}

/**
 * Applies permanent effects of a Street Card to the Player object.
 * Returns the updated PlayerConfig and whether First Contract Event was triggered.
 */
import { sanitizeAndRepairPlayerIdentity } from './playerIdentitySystem';

export function applyStreetCardToPlayer(
  player: PlayerConfig,
  card: StreetCardInstance
): { updatedPlayer: PlayerConfig; triggersFirstContract: boolean } {
  const copy: PlayerConfig = sanitizeAndRepairPlayerIdentity(JSON.parse(JSON.stringify(player)));
  let triggersFirstContract = false;

  if (!copy.stats) return { updatedPlayer: copy, triggersFirstContract: false };

  // Helper clamp stat
  const clampStat = (val: number, min = 1, max = 99) => Math.max(min, Math.min(max, val));

  const detailedStats = getOrCreateOutfieldDetailed(copy.stats);
  copy.stats.detailed = detailedStats;

  const ageMultiplier = getStreetCardAgeStatMultiplier(copy.age || 10);

  Object.entries(card.effectsMap).forEach(([key, rawValue]) => {
    let numVal = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue.toString());

    // Scale positive stat/attribute gains based on player age:
    // Past age 20 (21-28): 50% reduction
    // Past age 28 (29+): 0% stat gains
    const isStatKey = [
      'dribbling',
      'ballControl',
      'retention',
      'shortPass',
      'longPass',
      'crossing',
      'shooting',
      'heading',
      'longShots',
      'tackling',
      'marking',
      'interceptions',
      'positioning',
      'composure',
      'reactions',
      'strength',
      'pace',
      'stamina',
      'weakFoot',
      'potential',
    ].includes(key);

    if (isStatKey && typeof numVal === 'number' && numVal > 0) {
      if (ageMultiplier === 0) {
        numVal = 0;
      } else if (ageMultiplier === 0.5) {
        numVal = Math.max(1, Math.round(numVal * 0.5));
      }
    }

    // Distributable Stat Points / Free Points
    if (card.isDistributablePoints || key === 'unassignedPoints' || key === 'freeStatPoints') {
      copy.unassignedPoints = (copy.unassignedPoints || 0) + numVal;
      copy.freeStatPoints = (copy.freeStatPoints || 0) + numVal;
      return;
    }

    // Direct Stat Points (Progressive Tier Investment)
    if (card.isStatPoints && isStatKey && key !== 'weakFoot' && key !== 'potential') {
      if (!copy.statTrainingProgress) copy.statTrainingProgress = {};
      if (!copy.statBreakStats) copy.statBreakStats = {};
      const curVal = (detailedStats as any)[key] || 50;
      const curProg = copy.statTrainingProgress[key] || 0;
      const isWeakness = isStatWeaknessForPlayerType(copy.playerTypeId, key);
      const invRes = applyStatPointInvestment(curVal, curProg, numVal, isWeakness);
      (detailedStats as any)[key] = invRes.newLevel;
      copy.statTrainingProgress[key] = invRes.newProgress;
      if (invRes.statBreakTriggered) {
        copy.statBreakActive = true;
        copy.statBreakStats[key] = 100;
      }
      return;
    }

    // Flat Detailed Stat Increase (Capped at 99)
    if (key in detailedStats) {
      const curVal = (detailedStats as any)[key] || 50;
      (detailedStats as any)[key] = clampStat(curVal + numVal);
      return;
    }

    switch (key) {
      case 'weakFoot':
        if (numVal > 0) {
          copy.weakFootStars = Math.max(1, Math.min(5, (copy.weakFootStars || 3) + numVal));
        }
        break;
      case 'fame':
        copy.fame = Math.max(0, Math.min(1000, (copy.fame || 0) + numVal));
        break;
      case 'badReputation':
        copy.badReputation = Math.max(1, Math.min(100, (copy.badReputation || 1) + numVal));
        break;
      case 'potential':
        if (copy.potentialOvr && numVal > 0) {
          copy.potentialOvr = clampStat(copy.potentialOvr + numVal, 50, 99);
        }
        break;
      case 'injuryRecovery':
        copy.recoveryPoints = Math.max(0, (copy.recoveryPoints || 0) + numVal);
        break;
      case 'firstContractEvent':
        if ((copy.age || 10) >= 16) {
          triggersFirstContract = true;
        }
        break;
      case 'outside_foot':
      case 'perk':
        // Handled below
        break;
    }
  });

  // Handle Multi-Stat Point Bonuses if present
  if (card.statPointsBonuses && card.statPointsBonuses.length > 0) {
    if (!copy.statTrainingProgress) copy.statTrainingProgress = {};
    if (!copy.statBreakStats) copy.statBreakStats = {};
    card.statPointsBonuses.forEach((bonus) => {
      const sKey = bonus.statKey;
      const effectVal = typeof card.effectsMap?.[sKey] === 'number' ? (card.effectsMap[sKey] as number) : 0;
      const pts = bonus.points ?? effectVal;
      let scaledPoints = pts;
      if (ageMultiplier === 0) scaledPoints = 0;
      else if (ageMultiplier === 0.5) scaledPoints = Math.max(1, Math.round(pts * 0.5));

      if (sKey in detailedStats && scaledPoints > 0) {
        const curVal = (detailedStats as any)[sKey] || 50;
        const curProg = copy.statTrainingProgress[sKey] || 0;
        const isWeakness = isStatWeaknessForPlayerType(copy.playerTypeId, sKey);
        const invRes = applyStatPointInvestment(curVal, curProg, scaledPoints, isWeakness);
        (detailedStats as any)[sKey] = invRes.newLevel;
        copy.statTrainingProgress[sKey] = invRes.newProgress;
        if (invRes.statBreakTriggered) {
          copy.statBreakActive = true;
          copy.statBreakStats[sKey] = 100;
        }
      }
    });
  }

  if (card.cardId === 'street_scout' && (copy.age || 10) >= 16) {
    triggersFirstContract = true;
  }

  // Handle Iconic Trivela Street Card Perk Assignment
  if (
    card.cardId === 'trivela' ||
    card.effectsMap?.perk === 'outside_foot' ||
    card.effectsMap?.outside_foot === 'true'
  ) {
    copy.hasOutsideFootPerk = true;
    const currentPerks = [...(copy.activePerkIds || [])];
    if (!currentPerks.includes('outside_foot')) {
      if (currentPerks.length < 5) {
        currentPerks.push('outside_foot');
      } else {
        // If 5 slots are full, replace the last perk
        currentPerks[currentPerks.length - 1] = 'outside_foot';
      }
    }
    copy.activePerkIds = currentPerks;
  }

  // Convert to CareerCollectedCard for CardsCollectionPanel
  const collectedItem: CareerCollectedCard = {
    id: card.id,
    name: card.name,
    category: 'street',
    rarity: card.rarity === 'iconic' ? 'Iconic' : (card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)) as any,
    effects: card.formattedEffects,
    obtainedAt: card.obtainedAt,
    designColor: card.designColor,
    iconName: card.iconName,
  };

  const existing = copy.collectedCards || [];
  copy.collectedCards = [collectedItem, ...existing];

  const isGk = (copy.subPosition || copy.position || '').toUpperCase() === 'GK';
  if (isGk) {
    const gk = getOrCreateGkDetailed(copy.stats);
    copy.stats = syncCategoryStatsFromGkDetailed(copy.stats, gk);
  } else {
    copy.stats = syncCategoryStatsFromDetailed(copy.stats, detailedStats);
  }

  const sanitized = sanitizeAndRepairPlayerIdentity(copy) as PlayerConfig;
  const currentPot = sanitized.potentialOvr || 80;
  let calculatedOvr = isGk
    ? calculateWeightedOvr('GK', 'GK', sanitized.stats, sanitized.playStyle)
    : calculateWeightedOvr(
        sanitized.position || 'ST',
        sanitized.subPosition || sanitized.position || 'ST',
        sanitized.stats,
        sanitized.playStyle
      );

  if (!sanitized.overconfidenceDropPending && calculatedOvr > currentPot) {
    calculatedOvr = currentPot;
  }
  sanitized.ovr = calculatedOvr;

  return { updatedPlayer: sanitized, triggersFirstContract };
}

import { generateFirstContractOffers as genOffersFromEarlyCareer } from './earlyCareerSystem';

/**
 * Generates initial professional contract offers when "Street Scout" (Iconic Street Card) is drawn.
 */
export function generateFirstContractOffers(player: PlayerConfig): ProContractOffer[] {
  return genOffersFromEarlyCareer(player);
}

/**
 * Returns all available Street Cards sorted strictly from HIGHEST to LOWEST tier
 * (Iconic -> Legendary -> Gold -> Silver -> Bronze).
 */
export function getAllAvailableStreetCards(playerAge: number = 16): StreetCardInstance[] {
  const cards: StreetCardInstance[] = [];

  // 1. Iconic street cards
  const iconicDefs = STREET_CARD_DEFINITIONS.filter((d) => d.isIconicOnly || d.type === 'iconic');
  iconicDefs.forEach((def) => {
    cards.push(instantiateStreetCard(def, 'iconic', playerAge));
  });

  // 2. Standard street cards across Legendary -> Gold -> Silver -> Bronze
  const standardDefs = STREET_CARD_DEFINITIONS.filter((d) => !d.isIconicOnly && d.type !== 'iconic');
  const rarities: StreetCardRarity[] = ['legendary', 'gold', 'silver', 'bronze'];

  rarities.forEach((rarity) => {
    standardDefs.forEach((def) => {
      cards.push(instantiateStreetCard(def, rarity, playerAge));
    });
  });

  return cards;
}

