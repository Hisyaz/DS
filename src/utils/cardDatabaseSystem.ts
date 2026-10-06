import {
  CustomCard,
  CustomCardCategory,
  CustomCardTier,
  CardModifier,
  ModifierTarget,
  ActiveTemporalCard,
  OfficialEffectCategory,
  TemporalSubtype,
  CardDuration,
} from '../types';
import { generateDefaultParentCustomCards } from './parentCardSystem';
export { generateDefaultParentCustomCards };
import { STREET_CARD_DEFINITIONS } from './streetCardSystem';
import { YOUTH_CARD_TEMPLATES } from './youthLeagueCardSystem';
import { LIFESTYLE_CARDS_POOL, SPONSOR_CARDS_POOL, CAREER_CARDS_POOL } from './careerCardSystem';
import { applyChemistryCeiling, getActiveChemistryCeiling } from './chemistrySystem';
import { attachCardTranslations } from './cardTranslationsDatabase';
import { getYouthStatCustomCards, getCareerStatCustomCards } from '../data/statProgressionCardsData';
import { applyStatPointInvestment, isStatWeaknessForPlayerType } from './statProgressionSystem';
import {
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
  getOrCreateGkDetailed,
} from './statCalculations';

export function mapStatKeyToModifierTarget(statKey: string): ModifierTarget {
  const k = statKey.toLowerCase();
  if (k.includes('composure')) return 'stat_composure';
  if (k.includes('stamina')) return 'stat_stamina';
  if (k.includes('strength')) return 'stat_strength';
  if (k.includes('dribbl') || k.includes('control') || k.includes('retention') || k.includes('agility')) return 'stat_dribbling';
  if (k.includes('react')) return 'stat_reaction';
  if (k.includes('position')) return 'stat_position';
  if (k.includes('pass') || k.includes('cross') || k.includes('vision')) return 'stat_cre';
  if (k.includes('tackl') || k.includes('mark') || k.includes('intercept') || k.includes('def')) return 'stat_def';
  if (k.includes('shoot') || k.includes('finish') || k.includes('pace') || k.includes('head') || k.includes('shot')) return 'stat_pro';
  return 'stat_pro';
}

export function mapRarityToTier(rarity?: string, effectType?: string): CustomCardTier {
  if (!rarity) {
    if (effectType === 'negative') return 'rust';
    if (effectType === 'double_edged') return 'copper_dagger';
    return 'gold';
  }
  const r = rarity.toLowerCase();
  if (r.includes('muramasa')) return 'muramasa_blade';
  if (r.includes('steel') || r.includes('sword') || r.includes('blade')) return 'steel_blade';
  if (r.includes('copper') || r.includes('knife')) return 'copper_dagger';
  if (r.includes('obsidian') || r.includes('dagger') || r.includes('stone')) return 'obsidian_knife';
  if (r.includes('disaster')) return 'disaster';
  if (r.includes('ash')) return 'ash';
  if (r.includes('rust')) return 'rust';
  if (r.includes('scrap')) return 'scrap';
  if (r.includes('iconic') || r.includes('masterpiece') || r.includes('stat break')) return 'iconic';
  if (r.includes('legendary') || r.includes('epic') || r.includes('goat') || r.includes('world class')) return 'legendary';
  if (r.includes('gold')) {
    if (effectType === 'negative') return 'ash';
    if (effectType === 'double_edged') return 'steel_blade';
    return 'gold';
  }
  if (r.includes('silver')) {
    if (effectType === 'negative') return 'rust';
    if (effectType === 'double_edged') return 'copper_dagger';
    return 'silver';
  }
  if (r.includes('bronze')) {
    if (effectType === 'negative') return 'scrap';
    if (effectType === 'double_edged') return 'obsidian_knife';
    return 'bronze';
  }
  if (effectType === 'negative') return 'rust';
  if (effectType === 'double_edged') return 'copper_dagger';
  return 'gold';
}

/**
 * Fallback modifier generator to ensure NO card ever has 0 modifiers
 */
export function ensureCardHasModifiers(
  cardId: string,
  modifiers: CardModifier[],
  category: CustomCardCategory,
  tier: CustomCardTier,
  effectCategory: OfficialEffectCategory
): CardModifier[] {
  if (modifiers && modifiers.length > 0) return modifiers;

  const result: CardModifier[] = [];
  const isNegative = effectCategory === 'negative';
  const isDouble = effectCategory === 'double_edged';
  const op = isNegative ? 'subtract' : 'add';

  let baseVal = 5;
  if (tier === 'iconic' || tier === 'disaster' || tier === 'muramasa_blade') baseVal = 15;
  else if (tier === 'legendary' || tier === 'ash' || tier === 'steel_blade') baseVal = 10;
  else if (tier === 'gold' || tier === 'rust' || tier === 'copper_dagger') baseVal = 6;
  else baseVal = 3;

  switch (category) {
    case 'street':
      result.push({
        id: `fb-${cardId}-1`,
        target: 'stat_dribbling',
        operation: op,
        valueType: 'flat',
        value: baseVal,
      });
      result.push({
        id: `fb-${cardId}-2`,
        target: 'stat_fame',
        operation: op,
        valueType: 'flat',
        value: Math.max(2, Math.round(baseVal * 1.5)),
      });
      break;
    case 'youth':
      result.push({
        id: `fb-${cardId}-1`,
        target: 'stat_pro',
        operation: op,
        valueType: 'flat',
        value: baseVal,
      });
      result.push({
        id: `fb-${cardId}-2`,
        target: 'stat_cre',
        operation: op,
        valueType: 'flat',
        value: Math.max(2, Math.round(baseVal * 0.8)),
      });
      break;
    case 'career':
      result.push({
        id: `fb-${cardId}-1`,
        target: 'stat_pro',
        operation: op,
        valueType: 'flat',
        value: baseVal,
      });
      result.push({
        id: `fb-${cardId}-2`,
        target: 'stat_composure',
        operation: op,
        valueType: 'flat',
        value: Math.max(1, Math.round(baseVal * 0.6)),
      });
      break;
    case 'life':
      result.push({
        id: `fb-${cardId}-1`,
        target: 'stat_fame',
        operation: op,
        valueType: 'flat',
        value: baseVal * 3,
      });
      result.push({
        id: `fb-${cardId}-2`,
        target: 'money',
        operation: op,
        valueType: 'flat',
        value: baseVal * 5000,
      });
      break;
    case 'sponsor':
      result.push({
        id: `fb-${cardId}-1`,
        target: 'money',
        operation: op,
        valueType: 'flat',
        value: baseVal * 10000,
      });
      result.push({
        id: `fb-${cardId}-2`,
        target: 'stat_fame',
        operation: op,
        valueType: 'flat',
        value: Math.max(1, Math.round(baseVal * 0.5)),
      });
      break;
    case 'agent':
      result.push({
        id: `fb-${cardId}-1`,
        target: 'agent_negotiation',
        operation: op,
        valueType: 'flat',
        value: baseVal * 2,
      });
      result.push({
        id: `fb-${cardId}-2`,
        target: 'agent_network',
        operation: op,
        valueType: 'flat',
        value: baseVal * 2,
      });
      break;
    case 'parents':
      result.push({
        id: `fb-${cardId}-1`,
        target: 'stat_potential',
        operation: op,
        valueType: 'flat',
        value: Math.max(1, Math.round(baseVal * 0.5)),
      });
      result.push({
        id: `fb-${cardId}-2`,
        target: 'stat_composure',
        operation: op,
        valueType: 'flat',
        value: baseVal,
      });
      break;
    default:
      result.push({
        id: `fb-${cardId}-1`,
        target: 'stat_pro',
        operation: op,
        valueType: 'flat',
        value: baseVal,
      });
      break;
  }

  if (isDouble) {
    result.push({
      id: `fb-${cardId}-de-downside`,
      target: category === 'sponsor' || category === 'life' ? 'bad_reputation' : 'stat_stamina',
      operation: category === 'sponsor' || category === 'life' ? 'add' : 'subtract',
      valueType: 'flat',
      value: Math.max(2, Math.round(baseVal * 0.7)),
    });
  }

  return result;
}

/**
 * 1. STREET CARDS (Permanent + Temporal)
 */
export function generateDefaultStreetCustomCards(): CustomCard[] {
  const baseCards: CustomCard[] = STREET_CARD_DEFINITIONS.map((def, idx) => {
    const modifiers: CardModifier[] = [];
    if (def.effects) {
      Object.entries(def.effects).forEach(([key, val], mIdx) => {
        let valueNum = 5;
        if (typeof val === 'number') {
          valueNum = Math.abs(val);
        } else if (typeof val === 'object' && val !== null) {
          valueNum = (val as any).gold || (val as any).silver || (val as any).bronze || 5;
        }

        let target: ModifierTarget = 'stat_dribbling';
        if (key.includes('dribbl') || key.includes('ballControl')) target = 'stat_dribbling';
        else if (key.includes('stamina')) target = 'stat_stamina';
        else if (key.includes('fame')) target = 'stat_fame';
        else if (key.includes('badRep')) target = 'bad_reputation';
        else if (key.includes('chemistry')) target = 'team_chemistry';
        else if (key.includes('money') || key.includes('cash')) target = 'money';
        else if (key.includes('weakFoot')) target = 'stat_weak_foot';
        else if (key.includes('composure')) target = 'stat_composure';
        else if (key.includes('potential')) target = 'stat_potential';
        else if (key.includes('pace') || key.includes('shooting') || key.includes('longShots')) target = 'stat_pro';
        else if (key.includes('tackling') || key.includes('defending')) target = 'stat_def';
        else if (key.includes('shortPass') || key.includes('passing')) target = 'stat_cre';

        modifiers.push({
          id: `mod-street-${idx}-${mIdx}`,
          target,
          operation: def.type === 'negative' ? 'subtract' : 'add',
          valueType: 'flat',
          value: valueNum,
        });
      });
    }

    if (def.id === 'trivela') {
      modifiers.push({
        id: `mod-street-${idx}-perk`,
        target: 'perk',
        perkName: 'Outside Foot',
        perkAction: 'add',
        operation: 'add',
        valueType: 'flat',
        value: 1,
      });
    }

    let cardTier: CustomCardTier = 'gold';
    let effCat: OfficialEffectCategory = 'positive';
    if (def.type === 'iconic' || def.isIconicOnly || def.id === 'trivela' || def.id === 'street_scout') {
      cardTier = 'iconic';
      effCat = 'positive';
    } else if (def.type === 'negative') {
      cardTier = 'rust';
      effCat = 'negative';
    } else if (def.type === 'double_edged') {
      cardTier = 'copper_dagger';
      effCat = 'double_edged';
    } else {
      cardTier = 'gold';
      effCat = 'positive';
    }

    const resolvedMods = ensureCardHasModifiers(`card-street-${def.id}`, modifiers, 'street', cardTier, effCat);

    return {
      id: `card-street-${def.id}`,
      name: def.name,
      category: 'street',
      tier: cardTier,
      effectCategory: effCat,
      duration: 'none',
      description: def.description,
      modifiers: resolvedMods,
      createdAt: new Date().toISOString(),
    };
  });

  // Street Temporal Cards (High Impact, 6m / 1y)
  const temporalStreetCards: CustomCard[] = [
    {
      id: 'card-street-temp-positive-1',
      name: 'Cage Tour Domination',
      category: 'street',
      tier: 'legendary',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_positive',
      duration: '6_months',
      description: 'An unstoppable 6-month run across urban street tournaments gives you god-tier swagger on the ball.',
      iconName: 'Flame',
      modifiers: [
        { id: 'st-tp-1', target: 'stat_dribbling', operation: 'add', valueType: 'flat', value: 14 },
        { id: 'st-tp-2', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 25 },
        { id: 'st-tp-3', target: 'stat_reaction', operation: 'add', valueType: 'flat', value: 8 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-street-temp-negative-1',
      name: 'Asphalt Bruised Knee & Ankles',
      category: 'street',
      tier: 'ash',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_negative',
      duration: '6_months',
      description: 'Hard pavement impacts take their toll, leaving severe joint inflammation for the next 6 months.',
      iconName: 'ShieldAlert',
      modifiers: [
        { id: 'st-tn-1', target: 'stat_pro', operation: 'subtract', valueType: 'flat', value: 10 },
        { id: 'st-tn-2', target: 'stat_stamina', operation: 'subtract', valueType: 'flat', value: 12 },
        { id: 'st-tn-3', target: 'injury_chance', operation: 'add', valueType: 'flat', value: 15 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-street-temp-double-1',
      name: 'Underground Cage King',
      category: 'street',
      tier: 'muramasa_blade',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_double_edged',
      duration: '1_year',
      description: 'You become an undisputed street legend for 1 year, trading off-pitch discipline and locker room peace for insane raw flair.',
      iconName: 'Sword',
      modifiers: [
        { id: 'st-tde-1', target: 'stat_dribbling', operation: 'add', valueType: 'flat', value: 18 },
        { id: 'st-tde-2', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 40 },
        { id: 'st-tde-3', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 35 },
        { id: 'st-tde-4', target: 'stat_composure', operation: 'subtract', valueType: 'flat', value: 8 },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  return [...baseCards, ...temporalStreetCards];
}

/**
 * 2. YOUTH ACADEMY CARDS (Permanent + Temporal)
 */
export function generateDefaultYouthCustomCards(): CustomCard[] {
  const baseCards: CustomCard[] = YOUTH_CARD_TEMPLATES
    .filter((tpl) => !tpl.id.startsWith('yc-stat-'))
    .map((tpl, idx) => {
    const modifiers: CardModifier[] = [];

    const goldEffects = tpl.effectsByRarity?.Gold || tpl.effectsByRarity?.Silver || tpl.effectsByRarity?.Bronze;
    if (goldEffects && goldEffects.statBonuses) {
      goldEffects.statBonuses.forEach((b, mIdx) => {
        let target: ModifierTarget = 'stat_dribbling';
        const key = b.statKey.toLowerCase();
        if (key.includes('shoot') || key.includes('finish')) target = 'stat_pro';
        else if (key.includes('pace') || key.includes('speed')) target = 'stat_pro';
        else if (key.includes('pass') || key.includes('vision')) target = 'stat_cre';
        else if (key.includes('tackl') || key.includes('defend')) target = 'stat_def';
        else if (key.includes('stamina') || key.includes('strength')) target = 'stat_stamina';
        else if (key.includes('dribbl') || key.includes('control')) target = 'stat_dribbling';

        modifiers.push({
          id: `mod-youth-${idx}-${mIdx}`,
          target,
          operation: b.value < 0 ? 'subtract' : 'add',
          valueType: 'flat',
          value: Math.abs(b.value),
        });
      });
    }

    let effCat: OfficialEffectCategory = 'positive';
    let cardTier: CustomCardTier = 'gold';
    if (tpl.category === 'negative_youth') {
      effCat = 'negative';
      cardTier = 'rust';
    } else if (tpl.category === 'double_edged') {
      effCat = 'double_edged';
      cardTier = 'copper_dagger';
    } else if (tpl.isIconic || tpl.category === 'iconic_youth') {
      cardTier = 'iconic';
    }

    const resolvedMods = ensureCardHasModifiers(`card-youth-${tpl.id}`, modifiers, 'youth', cardTier, effCat);

    return {
      id: `card-youth-${tpl.id}`,
      name: tpl.name,
      category: 'youth',
      tier: cardTier,
      effectCategory: effCat,
      duration: 'none',
      description: tpl.description,
      modifiers: resolvedMods,
      createdAt: new Date().toISOString(),
    };
  });

  // Youth Academy Temporal Cards
  const temporalYouthCards: CustomCard[] = [
    {
      id: 'card-youth-temp-positive-1',
      name: 'Academy Surge Blitz',
      category: 'youth',
      tier: 'gold',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_positive',
      duration: '6_months',
      description: 'Intense 6-month specialized physical and tactical drills provide rapid developmental stat acceleration.',
      iconName: 'Award',
      modifiers: [
        { id: 'yt-tp-1', target: 'stat_pro', operation: 'add', valueType: 'flat', value: 12 },
        { id: 'yt-tp-2', target: 'stat_cre', operation: 'add', valueType: 'flat', value: 10 },
        { id: 'yt-tp-3', target: 'stat_free_points', operation: 'add', valueType: 'flat', value: 4 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-youth-temp-negative-1',
      name: 'Youth Growth Plate Spurt Fatigue',
      category: 'youth',
      tier: 'rust',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_negative',
      duration: '6_months',
      description: 'Sudden 3-inch biological growth spurt creates temporary clumsiness and severe coordination lag for 6 months.',
      iconName: 'Footprints',
      modifiers: [
        { id: 'yt-tn-1', target: 'stat_pro', operation: 'subtract', valueType: 'flat', value: 8 },
        { id: 'yt-tn-2', target: 'stat_dribbling', operation: 'subtract', valueType: 'flat', value: 10 },
        { id: 'yt-tn-3', target: 'stat_stamina', operation: 'subtract', valueType: 'flat', value: 6 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-youth-temp-double-1',
      name: 'All-In Academy Prodigy Protocol',
      category: 'youth',
      tier: 'steel_blade',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_double_edged',
      duration: '1_year',
      description: '1 full year of nonstop triple-session training. Massive pace and finishing gains at the cost of burnout and physical strain.',
      iconName: 'Zap',
      modifiers: [
        { id: 'yt-tde-1', target: 'stat_pro', operation: 'add', valueType: 'flat', value: 16 },
        { id: 'yt-tde-2', target: 'stat_free_points', operation: 'add', valueType: 'flat', value: 8 },
        { id: 'yt-tde-3', target: 'injury_chance', operation: 'add', valueType: 'flat', value: 20 },
        { id: 'yt-tde-4', target: 'stat_stamina', operation: 'subtract', valueType: 'flat', value: 10 },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  return [...baseCards, ...temporalYouthCards, ...getYouthStatCustomCards()];
}

/**
 * 3. CAREER CARDS (Permanent + Temporal)
 */
export function generateDefaultCareerCustomCards(): CustomCard[] {
  const baseCards: CustomCard[] = CAREER_CARDS_POOL
    .filter((item) => !item.modifiers?.statPointsBonus && item.name !== 'Superior Training')
    .map((item, idx) => {
    const modifiers: CardModifier[] = [];

    const isNeg = item.type === 'negative';
    const isDouble = item.type === 'double_edged';
    const effCat: OfficialEffectCategory = isNeg ? 'negative' : isDouble ? 'double_edged' : 'positive';
    const cardTier: CustomCardTier = item.isStatBreakCard ? 'iconic' : mapRarityToTier(item.rarity, item.type);

    if (item.modifiers) {
      if (item.modifiers.fameDelta) {
        modifiers.push({
          id: `mod-career-${idx}-fame`,
          target: 'stat_fame',
          operation: item.modifiers.fameDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.fameDelta),
        });
      }
      if (item.modifiers.badRepDelta) {
        modifiers.push({
          id: `mod-career-${idx}-badrep`,
          target: 'bad_reputation',
          operation: item.modifiers.badRepDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.badRepDelta),
        });
      }
      if (item.modifiers.chemistryDelta) {
        modifiers.push({
          id: `mod-career-${idx}-chem`,
          target: 'team_chemistry',
          operation: item.modifiers.chemistryDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.chemistryDelta),
        });
      }
      if (item.modifiers.trainingProgressDelta) {
        modifiers.push({
          id: `mod-career-${idx}-training`,
          target: 'stat_free_points',
          operation: item.modifiers.trainingProgressDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.trainingProgressDelta),
        });
      }
      if (item.modifiers.freeStatPoints) {
        modifiers.push({
          id: `mod-career-${idx}-freepoints`,
          target: 'stat_free_points',
          operation: item.modifiers.freeStatPoints >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.freeStatPoints),
        });
      }
      if (item.modifiers.fitnessDelta) {
        modifiers.push({
          id: `mod-career-${idx}-fitness`,
          target: 'stat_stamina',
          operation: item.modifiers.fitnessDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.fitnessDelta),
        });
      }
      if (item.modifiers.staminaDelta) {
        modifiers.push({
          id: `mod-career-${idx}-stamina`,
          target: 'stat_stamina',
          operation: item.modifiers.staminaDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.staminaDelta),
        });
      }
      if (item.modifiers.strengthDelta) {
        modifiers.push({
          id: `mod-career-${idx}-strength`,
          target: 'stat_strength',
          operation: item.modifiers.strengthDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.strengthDelta),
        });
      }
      if (item.modifiers.composureDelta) {
        modifiers.push({
          id: `mod-career-${idx}-composure`,
          target: 'stat_composure',
          operation: item.modifiers.composureDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.composureDelta),
        });
      }
      if (item.modifiers.positioningDelta) {
        modifiers.push({
          id: `mod-career-${idx}-positioning`,
          target: 'stat_position',
          operation: item.modifiers.positioningDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.positioningDelta),
        });
      }
      if (item.modifiers.reactionsDelta) {
        modifiers.push({
          id: `mod-career-${idx}-reactions`,
          target: 'stat_reaction',
          operation: item.modifiers.reactionsDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.reactionsDelta),
        });
      }
      if (item.modifiers.cashDelta) {
        modifiers.push({
          id: `mod-career-${idx}-cash`,
          target: 'money',
          operation: item.modifiers.cashDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.cashDelta),
        });
      }
      if (item.modifiers.managerMarketingDelta) {
        modifiers.push({
          id: `mod-career-${idx}-marketing`,
          target: 'agent_marketing',
          operation: item.modifiers.managerMarketingDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.managerMarketingDelta),
        });
      }
      if (item.modifiers.statDeltas) {
        Object.entries(item.modifiers.statDeltas).forEach(([sKey, val], mIdx) => {
          modifiers.push({
            id: `mod-career-${idx}-stat-${mIdx}`,
            target: mapStatKeyToModifierTarget(sKey),
            operation: val >= 0 ? 'add' : 'subtract',
            valueType: 'flat',
            value: Math.abs(val),
          });
        });
      }
    }

    if (item.isStatBreakCard) {
      modifiers.push({
        id: `mod-career-${idx}-statbreak`,
        target: 'stat_potential',
        operation: 'add',
        valueType: 'flat',
        value: 1,
      });
      modifiers.push({
        id: `mod-career-${idx}-ovr`,
        target: 'stat_free_points',
        operation: 'add',
        valueType: 'flat',
        value: 5,
      });
    }

    const resolvedMods = ensureCardHasModifiers(`card-career-${idx + 1}`, modifiers, 'career', cardTier, effCat);

    return {
      id: `card-career-${idx + 1}`,
      name: item.name,
      category: 'career',
      tier: cardTier,
      effectCategory: effCat,
      duration: 'none',
      description: item.description,
      modifiers: resolvedMods,
      createdAt: new Date().toISOString(),
    };
  });

  // Career Temporal Cards
  const temporalCareerCards: CustomCard[] = [
    {
      id: 'card-career-temp-positive-1',
      name: 'Purple Patch Scoring Spree',
      category: 'career',
      tier: 'legendary',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_positive',
      duration: '6_months',
      description: 'You enter a transcendent 6-month goalscoring zone where everything you touch hits the back of the net.',
      iconName: 'Trophy',
      modifiers: [
        { id: 'car-tp-1', target: 'stat_pro', operation: 'add', valueType: 'flat', value: 15 },
        { id: 'car-tp-2', target: 'stat_composure', operation: 'add', valueType: 'flat', value: 12 },
        { id: 'car-tp-3', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 35 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-career-temp-negative-1',
      name: 'Tactical Freefall & Crisis',
      category: 'career',
      tier: 'ash',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_negative',
      duration: '6_months',
      description: 'Managerial crisis and tactical changes leave you isolated and out of form for 6 tough months.',
      iconName: 'XCircle',
      modifiers: [
        { id: 'car-tn-1', target: 'stat_pro', operation: 'subtract', valueType: 'flat', value: 12 },
        { id: 'car-tn-2', target: 'stat_composure', operation: 'subtract', valueType: 'flat', value: 10 },
        { id: 'car-tn-3', target: 'team_chemistry', operation: 'subtract', valueType: 'flat', value: 20 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-career-temp-double-1',
      name: 'Contract Year Glory Hunt',
      category: 'career',
      tier: 'muramasa_blade',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_double_edged',
      duration: '1_year',
      description: 'Playing for a monster new contract. You hog the ball and shoot from everywhere for a full season.',
      iconName: 'Coins',
      modifiers: [
        { id: 'car-tde-1', target: 'stat_pro', operation: 'add', valueType: 'flat', value: 18 },
        { id: 'car-tde-2', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 50 },
        { id: 'car-tde-3', target: 'team_chemistry', operation: 'subtract', valueType: 'flat', value: 25 },
        { id: 'car-tde-4', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 30 },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  return [...baseCards, ...temporalCareerCards, ...getCareerStatCustomCards()];
}

/**
 * 4. LIFESTYLE CARDS (Permanent + Temporal)
 */
export function generateDefaultLifeCustomCards(): CustomCard[] {
  const baseCards: CustomCard[] = LIFESTYLE_CARDS_POOL.map((item, idx) => {
    const modifiers: CardModifier[] = [];

    const isNeg = item.type === 'negative';
    const isDouble = item.type === 'double_edged';
    const effCat: OfficialEffectCategory = isNeg ? 'negative' : isDouble ? 'double_edged' : 'positive';
    const cardTier: CustomCardTier = mapRarityToTier(item.rarity, item.type);

    if (item.modifiers) {
      if (item.modifiers.cashDelta) {
        modifiers.push({
          id: `mod-life-${idx}-cash`,
          target: 'money',
          operation: item.modifiers.cashDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.cashDelta),
        });
      }
      if (item.modifiers.recurringIncome) {
        modifiers.push({
          id: `mod-life-${idx}-income`,
          target: 'money',
          operation: 'add',
          valueType: 'flat',
          value: Math.abs(item.modifiers.recurringIncome * 2),
        });
      }
      if (item.modifiers.fameDelta) {
        modifiers.push({
          id: `mod-life-${idx}-fame`,
          target: 'stat_fame',
          operation: item.modifiers.fameDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.fameDelta),
        });
      }
      if (item.modifiers.badRepDelta) {
        modifiers.push({
          id: `mod-life-${idx}-badrep`,
          target: 'bad_reputation',
          operation: item.modifiers.badRepDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.badRepDelta),
        });
      }
      if (item.modifiers.chemistryDelta) {
        modifiers.push({
          id: `mod-life-${idx}-chem`,
          target: 'team_chemistry',
          operation: item.modifiers.chemistryDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.chemistryDelta),
        });
      }
      if (item.modifiers.trainingProgressDelta) {
        modifiers.push({
          id: `mod-life-${idx}-training`,
          target: 'stat_free_points',
          operation: item.modifiers.trainingProgressDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.trainingProgressDelta),
        });
      }
      if (item.modifiers.staminaDelta) {
        modifiers.push({
          id: `mod-life-${idx}-stamina`,
          target: 'stat_stamina',
          operation: item.modifiers.staminaDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.staminaDelta),
        });
      }
      if (item.modifiers.strengthDelta) {
        modifiers.push({
          id: `mod-life-${idx}-strength`,
          target: 'stat_strength',
          operation: item.modifiers.strengthDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.strengthDelta),
        });
      }
      if (item.modifiers.fitnessDelta) {
        modifiers.push({
          id: `mod-life-${idx}-fitness`,
          target: 'stat_stamina',
          operation: item.modifiers.fitnessDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.fitnessDelta),
        });
      }
      if (item.modifiers.managerMarketingDelta) {
        modifiers.push({
          id: `mod-life-${idx}-marketing`,
          target: 'agent_marketing',
          operation: item.modifiers.managerMarketingDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.managerMarketingDelta),
        });
      }
      if (item.modifiers.statBonus) {
        modifiers.push({
          id: `mod-life-${idx}-stat`,
          target: 'stat_free_points',
          operation: 'add',
          valueType: 'flat',
          value: Math.abs(item.modifiers.statBonus.val),
        });
      }
      if (item.modifiers.doubleEdgedRisk) {
        const risk = item.modifiers.doubleEdgedRisk;
        if (risk.successCash || risk.failCashPenalty) {
          modifiers.push({
            id: `mod-life-${idx}-risk-cash`,
            target: 'money',
            operation: risk.successCash ? 'add' : 'subtract',
            valueType: 'flat',
            value: risk.successCash || risk.failCashPenalty || 50000,
          });
        }
        if (risk.successFame || risk.failFameDelta) {
          modifiers.push({
            id: `mod-life-${idx}-risk-fame`,
            target: 'stat_fame',
            operation: risk.successFame ? 'add' : 'subtract',
            valueType: 'flat',
            value: Math.abs(risk.successFame || risk.failFameDelta || 20),
          });
        }
        if (risk.failBadRepDelta) {
          modifiers.push({
            id: `mod-life-${idx}-risk-badrep`,
            target: 'bad_reputation',
            operation: 'add',
            valueType: 'flat',
            value: Math.abs(risk.failBadRepDelta),
          });
        }
      }
    }

    const resolvedMods = ensureCardHasModifiers(`card-life-${idx}`, modifiers, 'life', cardTier, effCat);

    return {
      id: `card-life-${idx}`,
      name: item.name,
      category: 'life',
      tier: cardTier,
      effectCategory: effCat,
      duration: 'none',
      description: item.description,
      modifiers: resolvedMods,
      createdAt: new Date().toISOString(),
    };
  });

  // Lifestyle Temporal Cards
  const temporalLifeCards: CustomCard[] = [
    {
      id: 'card-life-temp-positive-1',
      name: 'Paris Fashion Week Ambassador',
      category: 'life',
      tier: 'legendary',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_positive',
      duration: '1_year',
      description: 'A 1-year global luxury brand ambassadorship propels your worldwide recognition into the stratosphere.',
      iconName: 'Sparkles',
      modifiers: [
        { id: 'lf-tp-1', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 60 },
        { id: 'lf-tp-2', target: 'money', operation: 'add', valueType: 'flat', value: 250000 },
        { id: 'lf-tp-3', target: 'stat_composure', operation: 'add', valueType: 'flat', value: 5 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-life-temp-negative-1',
      name: 'Tabloid Paparazzi Siege',
      category: 'life',
      tier: 'ash',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_negative',
      duration: '6_months',
      description: 'Relentless paparazzi hounding and private life leaks shatter your daily focus for 6 grueling months.',
      iconName: 'ShieldAlert',
      modifiers: [
        { id: 'lf-tn-1', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 35 },
        { id: 'lf-tn-2', target: 'stat_composure', operation: 'subtract', valueType: 'flat', value: 12 },
        { id: 'lf-tn-3', target: 'stat_fame', operation: 'subtract', valueType: 'flat', value: 20 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-life-temp-double-1',
      name: 'VIP Celebrity Nightlife Circuit',
      category: 'life',
      tier: 'muramasa_blade',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_double_edged',
      duration: '6_months',
      description: 'Partying with music stars and supermodels brings immense global clout, but drains your physical reserves.',
      iconName: 'Sparkles',
      modifiers: [
        { id: 'lf-tde-1', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 45 },
        { id: 'lf-tde-2', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 30 },
        { id: 'lf-tde-3', target: 'stat_stamina', operation: 'subtract', valueType: 'flat', value: 15 },
        { id: 'lf-tde-4', target: 'stat_reaction', operation: 'subtract', valueType: 'flat', value: 8 },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  return [...baseCards, ...temporalLifeCards];
}

/**
 * 5. SPONSOR CARDS (Permanent + Temporal)
 */
export function generateDefaultSponsorCustomCards(): CustomCard[] {
  const baseCards: CustomCard[] = SPONSOR_CARDS_POOL.map((item, idx) => {
    const modifiers: CardModifier[] = [];

    const isNeg = item.type === 'negative';
    const isDouble = item.type === 'double_edged';
    const effCat: OfficialEffectCategory = isNeg ? 'negative' : isDouble ? 'double_edged' : 'positive';
    const cardTier: CustomCardTier = mapRarityToTier(item.rarity || item.tier, item.type);

    if (item.modifiers) {
      if (item.modifiers.cashDelta) {
        modifiers.push({
          id: `mod-sponsor-${idx}-cash`,
          target: 'money',
          operation: item.modifiers.cashDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.cashDelta),
        });
      }
      if (item.modifiers.fameDelta) {
        modifiers.push({
          id: `mod-sponsor-${idx}-fame`,
          target: 'stat_fame',
          operation: item.modifiers.fameDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.fameDelta),
        });
      }
      if (item.modifiers.badRepDelta) {
        modifiers.push({
          id: `mod-sponsor-${idx}-badrep`,
          target: 'bad_reputation',
          operation: item.modifiers.badRepDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.badRepDelta),
        });
      }
      if (item.modifiers.managerMarketingDelta) {
        modifiers.push({
          id: `mod-sponsor-${idx}-mkt`,
          target: 'agent_marketing',
          operation: item.modifiers.managerMarketingDelta >= 0 ? 'add' : 'subtract',
          valueType: 'flat',
          value: Math.abs(item.modifiers.managerMarketingDelta),
        });
      }
      if (item.modifiers.doubleEdgedRisk) {
        const risk = item.modifiers.doubleEdgedRisk;
        if (risk.successCash || risk.failCashPenalty) {
          modifiers.push({
            id: `mod-sp-${idx}-risk-cash`,
            target: 'money',
            operation: risk.successCash ? 'add' : 'subtract',
            valueType: 'flat',
            value: risk.successCash || risk.failCashPenalty || 20000,
          });
        }
        if (risk.failBadRepDelta) {
          modifiers.push({
            id: `mod-sp-${idx}-risk-badrep`,
            target: 'bad_reputation',
            operation: 'add',
            valueType: 'flat',
            value: Math.abs(risk.failBadRepDelta),
          });
        }
      }
    }

    if (item.sponsorDealDetails) {
      if (item.sponsorDealDetails.initialPayment) {
        const exists = modifiers.some((m) => m.target === 'money');
        if (!exists) {
          modifiers.push({
            id: `mod-sponsor-${idx}-deal-init`,
            target: 'money',
            operation: 'add',
            valueType: 'flat',
            value: item.sponsorDealDetails.initialPayment,
          });
        }
      }
      if (item.sponsorDealDetails.managerMarketingDelta) {
        modifiers.push({
          id: `mod-sponsor-${idx}-deal-mkt`,
          target: 'agent_marketing',
          operation: 'add',
          valueType: 'flat',
          value: item.sponsorDealDetails.managerMarketingDelta,
        });
      }
    }

    if (item.sponsorDeal && item.sponsorDeal.yearlyPayment) {
      const exists = modifiers.some((m) => m.target === 'money');
      if (!exists) {
        modifiers.push({
          id: `mod-sponsor-${idx}-legacy-deal`,
          target: 'money',
          operation: 'add',
          valueType: 'flat',
          value: item.sponsorDeal.yearlyPayment,
        });
      }
    }

    const resolvedMods = ensureCardHasModifiers(`card-sponsor-${idx}`, modifiers, 'sponsor', cardTier, effCat);

    return {
      id: `card-sponsor-${idx}`,
      name: item.name,
      category: 'sponsor',
      tier: cardTier,
      effectCategory: effCat,
      duration: 'none',
      description: item.description,
      modifiers: resolvedMods,
      createdAt: new Date().toISOString(),
    };
  });

  // Sponsor Temporal Cards
  const temporalSponsorCards: CustomCard[] = [
    {
      id: 'card-sponsor-temp-positive-1',
      name: 'Global Energy Drink Headliner',
      category: 'sponsor',
      tier: 'legendary',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_positive',
      duration: '1_year',
      description: 'A 1-year flagship commercial endorsement contract with immense bonus payouts and TV ad blitz.',
      iconName: 'Briefcase',
      modifiers: [
        { id: 'sp-tp-1', target: 'money', operation: 'add', valueType: 'flat', value: 500000 },
        { id: 'sp-tp-2', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 45 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-sponsor-temp-negative-1',
      name: 'Contractual Dispute & Frozen Royalties',
      category: 'sponsor',
      tier: 'rust',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_negative',
      duration: '6_months',
      description: 'Legal conflict with an apparel supplier freezes commercial endorsements and stains your reputation.',
      iconName: 'ShieldAlert',
      modifiers: [
        { id: 'sp-tn-1', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 25 },
        { id: 'sp-tn-2', target: 'stat_fame', operation: 'subtract', valueType: 'flat', value: 15 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-sponsor-temp-double-1',
      name: 'Worldwide Promo Tour Blitz',
      category: 'sponsor',
      tier: 'muramasa_blade',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_double_edged',
      duration: '1_year',
      description: 'Astronomical sponsorship revenue (+€750,000) that demands grueling intercontinental flights all year.',
      iconName: 'Coins',
      modifiers: [
        { id: 'sp-tde-1', target: 'money', operation: 'add', valueType: 'flat', value: 750000 },
        { id: 'sp-tde-2', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 70 },
        { id: 'sp-tde-3', target: 'stat_stamina', operation: 'subtract', valueType: 'flat', value: 14 },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  return [...baseCards, ...temporalSponsorCards];
}

/**
 * 6. AGENT CARDS (Permanent + Temporal)
 */
export function generateDefaultAgentCustomCards(): CustomCard[] {
  const baseCards: CustomCard[] = [
    {
      id: 'card-agent-pro-mendez',
      name: 'Tier 1 Super-Agent (Jorge Style)',
      category: 'agent',
      tier: 'legendary',
      effectCategory: 'positive',
      duration: 'none',
      description: 'World-class agency connection unlocking elite club doors, astronomical transfer leverage and commercial empire.',
      iconName: 'Briefcase',
      modifiers: [
        { id: 'mod-ag-p1', target: 'agent_negotiation', operation: 'add', valueType: 'flat', value: 35 },
        { id: 'mod-ag-p2', target: 'agent_network', operation: 'add', valueType: 'flat', value: 40 },
        { id: 'mod-ag-p3', target: 'agent_marketing', operation: 'add', valueType: 'flat', value: 30 },
        { id: 'mod-ag-p4', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 25 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-agent-ruthless-shark',
      name: 'The Cutthroat Contract Master',
      category: 'agent',
      tier: 'gold',
      effectCategory: 'positive',
      duration: 'none',
      description: 'Relentless wage negotiator who squeezes every last euro from club chairmen with ice in his veins.',
      iconName: 'Coins',
      modifiers: [
        { id: 'mod-ag-r1', target: 'agent_negotiation', operation: 'add', valueType: 'flat', value: 25 },
        { id: 'mod-ag-r2', target: 'agent_marketing', operation: 'add', valueType: 'flat', value: 15 },
        { id: 'mod-ag-r3', target: 'money', operation: 'add', valueType: 'flat', value: 50000 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-agent-trusted-mentor',
      name: 'The Honest Career Mentor',
      category: 'agent',
      tier: 'silver',
      effectCategory: 'positive',
      duration: 'none',
      description: 'Prioritizes playing time and mental stability over quick cash commissions. Solid network and steady guidance.',
      iconName: 'HeartHandshake',
      modifiers: [
        { id: 'mod-ag-t1', target: 'agent_network', operation: 'add', valueType: 'flat', value: 20 },
        { id: 'mod-ag-t2', target: 'stat_composure', operation: 'add', valueType: 'flat', value: 5 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-agent-scrap-amateur',
      name: 'Unregistered Local Fixer',
      category: 'agent',
      tier: 'scrap',
      effectCategory: 'negative',
      duration: 'none',
      description: 'Amateur representative with zero European contacts who leaks false rumors to cheap tabloids.',
      iconName: 'ShieldAlert',
      modifiers: [
        { id: 'mod-ag-sc1', target: 'agent_network', operation: 'subtract', valueType: 'flat', value: 20 },
        { id: 'mod-ag-sc2', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 15 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-agent-rust-embezzler',
      name: 'Greedy Commission Squeezer',
      category: 'agent',
      tier: 'rust',
      effectCategory: 'negative',
      duration: 'none',
      description: 'Demands hidden agent fees that scare away prospective suitors during transfer windows.',
      iconName: 'XCircle',
      modifiers: [
        { id: 'mod-ag-ru1', target: 'agent_negotiation', operation: 'subtract', valueType: 'flat', value: 25 },
        { id: 'mod-ag-ru2', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 20 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-agent-ash-rebellion',
      name: 'The Rogue Media Leaker',
      category: 'agent',
      tier: 'ash',
      effectCategory: 'negative',
      duration: 'none',
      description: 'Burns bridges with your head coach by openly complaining about tactics on national radio.',
      iconName: 'Flame',
      modifiers: [
        { id: 'mod-ag-as1', target: 'team_chemistry', operation: 'subtract', valueType: 'flat', value: 20 },
        { id: 'mod-ag-as2', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 35 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-agent-disaster-mob',
      name: 'Banned Third-Party Extortionist',
      category: 'agent',
      tier: 'disaster',
      effectCategory: 'negative',
      duration: 'none',
      description: 'Under FIFA investigation for illegal third-party ownership. Sullies your reputation across world football.',
      iconName: 'Skull',
      modifiers: [
        { id: 'mod-ag-ds1', target: 'agent_network', operation: 'subtract', valueType: 'flat', value: 40 },
        { id: 'mod-ag-ds2', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 60 },
        { id: 'mod-ag-ds3', target: 'stat_fame', operation: 'subtract', valueType: 'flat', value: 30 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-agent-de-obsidian',
      name: 'Obsidian Knife: Aggressive Wage Demands',
      category: 'agent',
      tier: 'obsidian_knife',
      effectCategory: 'double_edged',
      duration: 'none',
      description: 'Forces massive weekly wage spikes, but creates friction with club board.',
      iconName: 'Sword',
      modifiers: [
        { id: 'mod-ag-deo1', target: 'agent_negotiation', operation: 'add', valueType: 'flat', value: 25 },
        { id: 'mod-ag-deo2', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 20 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-agent-de-muramasa',
      name: 'Muramasa Blade: Hostile Buyout King',
      category: 'agent',
      tier: 'muramasa_blade',
      effectCategory: 'double_edged',
      duration: 'none',
      description: 'Triggers nuclear buyout release clauses. Massive fame and millions in commissions, but despised by club supporters.',
      iconName: 'Flame',
      modifiers: [
        { id: 'mod-ag-dem1', target: 'agent_negotiation', operation: 'add', valueType: 'flat', value: 50 },
        { id: 'mod-ag-dem2', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 60 },
        { id: 'mod-ag-dem3', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 75 },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  // Agent Temporal Cards
  const temporalAgentCards: CustomCard[] = [
    {
      id: 'card-agent-temp-positive-1',
      name: 'Super-Agent Transfer Window Blitz',
      category: 'agent',
      tier: 'legendary',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_positive',
      duration: '1_year',
      description: 'Your agent deploys their absolute highest-level international connections for a 1-year career breakthrough.',
      iconName: 'Briefcase',
      modifiers: [
        { id: 'ag-tp-1', target: 'agent_network', operation: 'add', valueType: 'flat', value: 35 },
        { id: 'ag-tp-2', target: 'agent_negotiation', operation: 'add', valueType: 'flat', value: 30 },
        { id: 'ag-tp-3', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 40 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-agent-temp-negative-1',
      name: 'Agent Audit & Legal Injunction',
      category: 'agent',
      tier: 'rust',
      effectCategory: 'temporal',
      temporalSubtype: 'temporal_negative',
      duration: '6_months',
      description: 'Agency accounts frozen during tax audit, stalling all contract talks for 6 months.',
      iconName: 'Clock',
      modifiers: [
        { id: 'ag-tn-1', target: 'agent_negotiation', operation: 'subtract', valueType: 'flat', value: 25 },
        { id: 'ag-tn-2', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 20 },
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  return [...baseCards, ...temporalAgentCards];
}

/**
 * 7. MATCH DAY & INTERVIEW CARDS
 */
export function generateDefaultMatchDayCustomCards(): CustomCard[] {
  return [
    {
      id: 'card-match-derby-fever',
      name: 'Derby Day Adrenaline',
      category: 'match_day',
      tier: 'gold',
      effectCategory: 'positive',
      duration: 'none',
      description: 'The stadium is roaring. Your heart races as raw passion fuels every sprint and tackle.',
      modifiers: [
        { id: 'm-derby-1', target: 'stat_pro', operation: 'add', valueType: 'flat', value: 4 },
        { id: 'm-derby-2', target: 'stat_strength', operation: 'add', valueType: 'flat', value: 3 },
        { id: 'm-derby-3', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 5 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-match-clutch-winner',
      name: 'Injury-Time Miracle',
      category: 'match_day',
      tier: 'legendary',
      effectCategory: 'positive',
      duration: 'none',
      description: '90+4 minutes on the clock. You demand the ball and unleash a thunderous strike into the top corner.',
      modifiers: [
        { id: 'm-clutch-1', target: 'stat_pro', operation: 'add', valueType: 'flat', value: 6 },
        { id: 'm-clutch-2', target: 'stat_composure', operation: 'add', valueType: 'flat', value: 5 },
        { id: 'm-clutch-3', target: 'stat_reaction', operation: 'add', valueType: 'flat', value: 4 },
        { id: 'm-clutch-4', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 12 },
      ],
      createdAt: new Date().toISOString(),
    },
  ];
}

export function generateDefaultInterviewCustomCards(): CustomCard[] {
  return [
    {
      id: 'card-interview-good-gold',
      name: 'Gold: Humble Team First Leader',
      category: 'interview',
      tier: 'gold',
      effectCategory: 'positive',
      duration: 'none',
      description: 'Gives full credit to teammates and coaching staff, displaying mature leadership.',
      modifiers: [
        { id: 'mod-int-bg-1', target: 'stat_fame', operation: 'add', valueType: 'flat', value: 30 },
        { id: 'mod-int-bg-2', target: 'team_chemistry', operation: 'add', valueType: 'flat', value: 15 },
        { id: 'mod-int-bg-3', target: 'stat_composure', operation: 'add', valueType: 'flat', value: 2 },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'card-interview-bad-ash',
      name: 'Ash: Scorched Earth Dressing Room Rant',
      category: 'interview',
      tier: 'ash',
      effectCategory: 'negative',
      duration: 'none',
      description: 'Publicly attacks teammates work rate, triggering severe locker room unrest.',
      modifiers: [
        { id: 'mod-int-ba-1', target: 'stat_fame', operation: 'subtract', valueType: 'flat', value: 40 },
        { id: 'mod-int-ba-2', target: 'bad_reputation', operation: 'add', valueType: 'flat', value: 50 },
        { id: 'mod-int-ba-3', target: 'team_chemistry', operation: 'subtract', valueType: 'flat', value: 20 },
      ],
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Aggregate all official default cards across all categories
 */
export function getAllDefaultCustomCards(): CustomCard[] {
  const cards = [
    ...generateDefaultParentCustomCards(),
    ...generateDefaultStreetCustomCards(),
    ...generateDefaultYouthCustomCards(),
    ...generateDefaultCareerCustomCards(),
    ...generateDefaultLifeCustomCards(),
    ...generateDefaultSponsorCustomCards(),
    ...generateDefaultAgentCustomCards(),
    ...generateDefaultMatchDayCustomCards(),
    ...generateDefaultInterviewCustomCards(),
  ];
  return cards.map(attachCardTranslations);
}

/**
 * Category Matcher that handles alias compatibility (e.g. parent / parents, life / lifestyle, agent / manager)
 */
export function matchesCategory(cardCategory: string, targetCategory: CustomCardCategory): boolean {
  if (targetCategory === 'parents') {
    return cardCategory === 'parents' || cardCategory === 'parent';
  }
  if (targetCategory === 'life') {
    return cardCategory === 'life' || cardCategory === 'lifestyle';
  }
  if (targetCategory === 'agent') {
    return cardCategory === 'agent' || cardCategory === 'manager';
  }
  return cardCategory === targetCategory;
}

export function getCardsByCategory(cards: CustomCard[], category: CustomCardCategory): CustomCard[] {
  return cards.filter((card) => matchesCategory(card.category, category));
}

export function getCategoryCardCount(cards: CustomCard[], category: CustomCardCategory): number {
  return getCardsByCategory(cards, category).length;
}

/**
 * Live Custom Card Application Engine
 * Applies all modifiers to Player, Accounting, and Manager states in real time, and registers ActiveTemporalCard if card is temporal.
 */
export function applyCustomCardToPlayer(
  card: CustomCard,
  player: any,
  accounting?: any,
  manager?: any
): {
  updatedPlayer: any;
  updatedAccounting?: any;
  updatedManager?: any;
  summaryMessage: string;
} {
  let updatedP = JSON.parse(JSON.stringify(player));
  const updatedAcc = accounting ? JSON.parse(JSON.stringify(accounting)) : undefined;
  const updatedM = manager ? JSON.parse(JSON.stringify(manager)) : undefined;

  const appliedEffects: string[] = [];
  const statDeltas: Record<string, number> = {};
  let fameDelta = 0;
  let badRepDelta = 0;
  let chemistryDelta = 0;

  if (card.modifiers && card.modifiers.length > 0) {
    card.modifiers.forEach((mod) => {
      const isAdd = mod.operation === 'add';
      const val = mod.value;
      const signedVal = isAdd ? val : -val;

      switch (mod.target) {
        case 'stat_pro': {
          if (updatedP.stats?.detailed) {
            updatedP.stats.detailed.sprintSpeed = Math.min(99, Math.max(1, (updatedP.stats.detailed.sprintSpeed || 50) + signedVal));
            updatedP.stats.detailed.acceleration = Math.min(99, Math.max(1, (updatedP.stats.detailed.acceleration || 50) + signedVal));
            updatedP.stats.detailed.finishing = Math.min(99, Math.max(1, (updatedP.stats.detailed.finishing || 50) + signedVal));
            updatedP.stats.detailed.shotPower = Math.min(99, Math.max(1, (updatedP.stats.detailed.shotPower || 50) + signedVal));
            statDeltas.sprintSpeed = (statDeltas.sprintSpeed || 0) + signedVal;
            statDeltas.acceleration = (statDeltas.acceleration || 0) + signedVal;
            statDeltas.finishing = (statDeltas.finishing || 0) + signedVal;
            statDeltas.shotPower = (statDeltas.shotPower || 0) + signedVal;
          }
          if (updatedP.stats) {
            updatedP.stats.pro = Math.min(99, Math.max(1, (updatedP.stats.pro || 50) + signedVal));
          }
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Pace/Shooting`);
          break;
        }
        case 'stat_cre': {
          if (updatedP.stats?.detailed) {
            updatedP.stats.detailed.shortPass = Math.min(99, Math.max(1, (updatedP.stats.detailed.shortPass || 50) + signedVal));
            updatedP.stats.detailed.longPass = Math.min(99, Math.max(1, (updatedP.stats.detailed.longPass || 50) + signedVal));
            updatedP.stats.detailed.vision = Math.min(99, Math.max(1, (updatedP.stats.detailed.vision || 50) + signedVal));
            updatedP.stats.detailed.crossing = Math.min(99, Math.max(1, (updatedP.stats.detailed.crossing || 50) + signedVal));
            statDeltas.shortPass = (statDeltas.shortPass || 0) + signedVal;
            statDeltas.longPass = (statDeltas.longPass || 0) + signedVal;
            statDeltas.vision = (statDeltas.vision || 0) + signedVal;
            statDeltas.crossing = (statDeltas.crossing || 0) + signedVal;
          }
          if (updatedP.stats) {
            updatedP.stats.cre = Math.min(99, Math.max(1, (updatedP.stats.cre || 50) + signedVal));
          }
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Passing/Vision`);
          break;
        }
        case 'stat_def': {
          if (updatedP.stats?.detailed) {
            updatedP.stats.detailed.tackling = Math.min(99, Math.max(1, (updatedP.stats.detailed.tackling || 50) + signedVal));
            updatedP.stats.detailed.marking = Math.min(99, Math.max(1, (updatedP.stats.detailed.marking || 50) + signedVal));
            updatedP.stats.detailed.interceptions = Math.min(99, Math.max(1, (updatedP.stats.detailed.interceptions || 50) + signedVal));
            statDeltas.tackling = (statDeltas.tackling || 0) + signedVal;
            statDeltas.marking = (statDeltas.marking || 0) + signedVal;
            statDeltas.interceptions = (statDeltas.interceptions || 0) + signedVal;
          }
          if (updatedP.stats) {
            updatedP.stats.def = Math.min(99, Math.max(1, (updatedP.stats.def || 50) + signedVal));
          }
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Defense/Marking`);
          break;
        }
        case 'stat_dribbling': {
          if (updatedP.stats?.detailed) {
            updatedP.stats.detailed.dribbling = Math.min(99, Math.max(1, (updatedP.stats.detailed.dribbling || 50) + signedVal));
            updatedP.stats.detailed.ballControl = Math.min(99, Math.max(1, (updatedP.stats.detailed.ballControl || 50) + signedVal));
            updatedP.stats.detailed.agility = Math.min(99, Math.max(1, (updatedP.stats.detailed.agility || 50) + signedVal));
            statDeltas.dribbling = (statDeltas.dribbling || 0) + signedVal;
            statDeltas.ballControl = (statDeltas.ballControl || 0) + signedVal;
            statDeltas.agility = (statDeltas.agility || 0) + signedVal;
          }
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Dribbling/Control`);
          break;
        }
        case 'stat_composure': {
          if (updatedP.stats?.detailed) {
            updatedP.stats.detailed.composure = Math.min(99, Math.max(1, (updatedP.stats.detailed.composure || 50) + signedVal));
            statDeltas.composure = (statDeltas.composure || 0) + signedVal;
          }
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Composure`);
          break;
        }
        case 'stat_stamina': {
          if (updatedP.stats?.detailed) {
            updatedP.stats.detailed.stamina = Math.min(99, Math.max(1, (updatedP.stats.detailed.stamina || 50) + signedVal));
            statDeltas.stamina = (statDeltas.stamina || 0) + signedVal;
          }
          updatedP.fitness = Math.min(100, Math.max(0, (updatedP.fitness ?? 100) + signedVal));
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Stamina/Fitness`);
          break;
        }
        case 'stat_strength': {
          if (updatedP.stats?.detailed) {
            updatedP.stats.detailed.strength = Math.min(99, Math.max(1, (updatedP.stats.detailed.strength || 50) + signedVal));
            updatedP.stats.detailed.jumping = Math.min(99, Math.max(1, (updatedP.stats.detailed.jumping || 50) + signedVal));
            statDeltas.strength = (statDeltas.strength || 0) + signedVal;
            statDeltas.jumping = (statDeltas.jumping || 0) + signedVal;
          }
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Physical Strength`);
          break;
        }
        case 'stat_position': {
          if (updatedP.stats?.detailed) {
            updatedP.stats.detailed.positioning = Math.min(99, Math.max(1, (updatedP.stats.detailed.positioning || 50) + signedVal));
            statDeltas.positioning = (statDeltas.positioning || 0) + signedVal;
          }
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Positioning`);
          break;
        }
        case 'stat_reaction': {
          if (updatedP.stats?.detailed) {
            updatedP.stats.detailed.reactions = Math.min(99, Math.max(1, (updatedP.stats.detailed.reactions || 50) + signedVal));
            statDeltas.reactions = (statDeltas.reactions || 0) + signedVal;
          }
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Reactions`);
          break;
        }
        case 'stat_fame': {
          updatedP.fame = Math.max(0, Math.min(1000, (updatedP.fame || 10) + signedVal));
          fameDelta += signedVal;
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Fame`);
          break;
        }
        case 'stat_potential': {
          updatedP.potentialOvr = Math.min(99, Math.max(50, (updatedP.potentialOvr || 78) + signedVal));
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Potential OVR`);
          break;
        }
        case 'stat_point_investment': {
          const statKey = (mod as any).statKey || (mod as any).specificStatKey || card.statPointsBonus?.statKey;
          if (statKey) {
            const isGk = (updatedP.subPosition || updatedP.position || '').toUpperCase() === 'GK';
            if (!updatedP.statTrainingProgress) updatedP.statTrainingProgress = {};
            if (!updatedP.statBreakStats) updatedP.statBreakStats = {};
            const detailed = isGk
              ? (updatedP.stats?.gkDetailed || (updatedP.stats as any)?.detailed || {})
              : (updatedP.stats?.detailed || {});
            if (statKey in detailed) {
              const curVal = (detailed as any)[statKey] || 40;
              const curProg = updatedP.statTrainingProgress[statKey] || 0;
              const isWeakness = isStatWeaknessForPlayerType(updatedP.playerTypeId, statKey);
              const invRes = applyStatPointInvestment(curVal, curProg, val, isWeakness);
              (detailed as any)[statKey] = invRes.newLevel;
              updatedP.statTrainingProgress[statKey] = invRes.newProgress;
              if (invRes.statBreakTriggered) {
                updatedP.statBreakActive = true;
                updatedP.statBreakStats[statKey] = 100;
              }
              const label = card.statPointsBonus?.statLabel || statKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
              const levelsGainedStr = invRes.levelsGained > 0 ? ` (+${invRes.levelsGained} level${invRes.levelsGained > 1 ? 's' : ''}!)` : '';
              appliedEffects.push(`📈 +${val} Stat Development Points for ${label}${levelsGainedStr} (Level ${curVal} ➔ ${invRes.newLevel} [${Math.round(invRes.newProgress * 100)}%])`);
            }
          }
          break;
        }
        case 'stat_free_points': {
          updatedP.freeStatPoints = Math.max(0, (updatedP.freeStatPoints || 0) + signedVal);
          updatedP.unassignedPoints = updatedP.freeStatPoints;
          if (card.name === 'Superior Training') {
            appliedEffects.push(`👑 +${signedVal} Development Stat Points from Superior Training`);
          } else {
            appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Stat Points`);
          }
          break;
        }
        case 'stat_weak_foot': {
          updatedP.weakFoot = Math.min(5, Math.max(1, (updatedP.weakFoot || 3) + signedVal));
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Weak Foot`);
          break;
        }
        case 'money':
        case 'starting_cash': {
          if (updatedAcc) {
            updatedAcc.totalSavings = Math.max(0, (updatedAcc.totalSavings ?? 0) + signedVal);
            appliedEffects.push(`${signedVal > 0 ? '+' : ''}€${val.toLocaleString()} Cash`);
          }
          break;
        }
        case 'agent_negotiation': {
          if (updatedM) {
            updatedM.negotiation = Math.min(99, Math.max(1, (updatedM.negotiation || 50) + signedVal));
            appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Agent Negotiation`);
          }
          break;
        }
        case 'agent_network': {
          if (updatedM) {
            updatedM.network = Math.min(99, Math.max(1, (updatedM.network || 50) + signedVal));
            appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Agent Network`);
          }
          break;
        }
        case 'agent_marketing': {
          if (updatedM) {
            updatedM.marketing = Math.min(99, Math.max(1, (updatedM.marketing || 50) + signedVal));
            appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Agent Marketing`);
          }
          break;
        }
        case 'bad_reputation': {
          updatedP.badReputation = Math.min(100, Math.max(1, (updatedP.badReputation || 10) + signedVal));
          badRepDelta += signedVal;
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal} Bad Rep`);
          break;
        }
        case 'team_chemistry': {
          const ceilingInfo = getActiveChemistryCeiling(updatedP);
          const currentChem = updatedP.chemistry || 50;
          if (ceilingInfo.hasCeiling && signedVal > 0) {
            const maxAllowed = ceilingInfo.effectiveCeiling;
            const desired = currentChem + signedVal;
            const capped = Math.min(maxAllowed, desired);
            const actualGained = Math.max(0, capped - currentChem);
            const blocked = signedVal - actualGained;
            updatedP.chemistry = capped;
            chemistryDelta += actualGained;
            if (blocked > 0) {
              appliedEffects.push(`+${actualGained}% Chemistry (${blocked}% held by active ${maxAllowed}% cap, activates once cap expires)`);
              if (!updatedP.pendingBlockedChemistry) updatedP.pendingBlockedChemistry = [];
              updatedP.pendingBlockedChemistry.push({
                amount: blocked,
                source: card.name,
              });
            } else {
              appliedEffects.push(`+${actualGained}% Chemistry`);
            }
          } else {
            updatedP.chemistry = Math.min(200, Math.max(0, currentChem + signedVal));
            chemistryDelta += signedVal;
            appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal}% Chemistry`);
          }
          break;
        }
        case 'chemistry_ceiling': {
          const ceilingVal = Math.min(100, Math.max(1, val));
          updatedP = applyChemistryCeiling(updatedP, ceilingVal, 6, 'Custom card chemistry ceiling');
          appliedEffects.push(`Chem Capped @ ${ceilingVal}% (6m)`);
          break;
        }
        case 'injury_chance': {
          updatedP.injuryPronePercent = Math.min(100, Math.max(0, (updatedP.injuryPronePercent || 15) + signedVal));
          appliedEffects.push(`${signedVal > 0 ? '+' : ''}${signedVal}% Injury Risk`);
          break;
        }
        case 'perk': {
          if (mod.perkName) {
            if (!updatedP.perks) updatedP.perks = [];
            if (mod.perkAction === 'remove') {
              updatedP.perks = updatedP.perks.filter((p: string) => p !== mod.perkName);
              appliedEffects.push(`Removed Perk: ${mod.perkName}`);
            } else {
              if (!updatedP.perks.includes(mod.perkName)) {
                updatedP.perks.push(mod.perkName);
                appliedEffects.push(`Added Perk: ${mod.perkName}`);
              }
            }
          }
          break;
        }
      }
    });
  }

  // Handle Temporal Card Expiration Registration
  const isTemporal =
    Boolean(card.duration && card.duration !== 'none') ||
    card.effectCategory === 'temporal' ||
    Boolean(card.temporalSubtype);

  if (isTemporal) {
    if (!updatedP.activeTemporalCards) {
      updatedP.activeTemporalCards = [];
    }
    const durationMonths = card.duration === '6_months' ? 6 : 12;
    const temporalEntry: ActiveTemporalCard = {
      id: `act-temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      cardId: card.id,
      name: card.name,
      cardType: card.category,
      effectCategory:
        card.temporalSubtype === 'temporal_negative'
          ? 'negative'
          : card.temporalSubtype === 'temporal_double_edged'
          ? 'double_edged'
          : 'positive',
      tier: card.tier,
      duration: card.duration === '6_months' ? '6_months' : '1_year',
      remainingMonths: durationMonths,
      appliedDate: new Date().toISOString(),
      appliedSeason: updatedP.season || 1,
      statDeltas,
      fameDelta,
      badRepDelta,
      chemistryDelta,
      description: card.description,
    };
    updatedP.activeTemporalCards.push(temporalEntry);
    appliedEffects.push(`⏳ Active for ${durationMonths} Months`);
  }

  // Recalculate category stats and OVR if detailed stats exist
  const isGk = (updatedP.subPosition || updatedP.position || '').toUpperCase() === 'GK';
  if (isGk) {
    const gk = updatedP.stats?.gkDetailed || getOrCreateGkDetailed(updatedP.stats);
    if (updatedP.stats) {
      updatedP.stats = syncCategoryStatsFromGkDetailed(updatedP.stats, gk);
      updatedP.ovr = calculateWeightedOvr('GK', 'GK', updatedP.stats, updatedP.playStyle);
    }
  } else if (updatedP.stats?.detailed) {
    updatedP.stats = syncCategoryStatsFromDetailed(updatedP.stats, updatedP.stats.detailed);
    updatedP.ovr = calculateWeightedOvr(updatedP.position || 'CM', updatedP.subPosition, updatedP.stats, updatedP.playStyle);
  }

  const summaryMessage =
    appliedEffects.length > 0
      ? `🃏 Card "${card.name}" applied: ${appliedEffects.join(', ')}`
      : `🃏 Card "${card.name}" applied successfully!`;

  return {
    updatedPlayer: updatedP,
    updatedAccounting: updatedAcc,
    updatedManager: updatedM,
    summaryMessage,
  };
}

/**
 * Advances active temporal cards by given months and auto-expires & reverts finished cards
 */
export function advanceActiveTemporalCards(
  player: any,
  monthsPassed: number = 1
): {
  updatedPlayer: any;
  expiredCards: ActiveTemporalCard[];
  summaryMessage?: string;
} {
  if (!player || !player.activeTemporalCards || player.activeTemporalCards.length === 0) {
    return { updatedPlayer: player, expiredCards: [] };
  }

  let updatedP = JSON.parse(JSON.stringify(player));
  const remainingCards: ActiveTemporalCard[] = [];
  const expiredCards: ActiveTemporalCard[] = [];

  updatedP.activeTemporalCards.forEach((tc: ActiveTemporalCard) => {
    const newRemaining = tc.remainingMonths - monthsPassed;
    if (newRemaining <= 0) {
      expiredCards.push(tc);
      // Revert stat deltas
      if (tc.statDeltas) {
        Object.entries(tc.statDeltas).forEach(([sKey, delta]) => {
          if (updatedP.stats?.detailed && (updatedP.stats.detailed as any)[sKey] !== undefined) {
            (updatedP.stats.detailed as any)[sKey] = Math.max(1, Math.min(99, ((updatedP.stats.detailed as any)[sKey] || 50) - delta));
          }
        });
      }
      if (tc.fameDelta) {
        updatedP.fame = Math.max(0, (updatedP.fame || 10) - tc.fameDelta);
      }
      if (tc.badRepDelta) {
        updatedP.badReputation = Math.max(1, (updatedP.badReputation || 10) - tc.badRepDelta);
      }
      if (tc.chemistryDelta) {
        updatedP.chemistry = Math.max(0, Math.min(200, (updatedP.chemistry || 50) - tc.chemistryDelta));
      }
    } else {
      remainingCards.push({ ...tc, remainingMonths: newRemaining });
    }
  });

  // Activate pending blocked chemistry if room has opened up
  if (updatedP.pendingBlockedChemistry && updatedP.pendingBlockedChemistry.length > 0) {
    const currentCeil = getActiveChemistryCeiling(updatedP);
    const maxRoom = (currentCeil.hasCeiling ? currentCeil.effectiveCeiling : 100) - (updatedP.chemistry || 50);
    if (maxRoom > 0) {
      let toAdd = 0;
      const remainingPending: { amount: number; source: string }[] = [];
      for (const item of updatedP.pendingBlockedChemistry) {
        if (toAdd < maxRoom) {
          const canTake = Math.min(item.amount, maxRoom - toAdd);
          toAdd += canTake;
          const leftover = item.amount - canTake;
          if (leftover > 0) {
            remainingPending.push({ ...item, amount: leftover });
          }
        } else {
          remainingPending.push(item);
        }
      }
      if (toAdd > 0) {
        updatedP.chemistry = Math.min(200, (updatedP.chemistry || 50) + toAdd);
      }
      updatedP.pendingBlockedChemistry = remainingPending;
    }
  }

  updatedP.activeTemporalCards = remainingCards;
  const summaryMessage =
    expiredCards.length > 0
      ? `⏳ ${expiredCards.length} Temporal card${expiredCards.length > 1 ? 's have' : ' has'} expired: ${expiredCards.map((c) => c.name).join(', ')}.`
      : undefined;

  return { updatedPlayer: updatedP, expiredCards, summaryMessage };
}
