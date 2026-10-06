import { PlayerConfig, CareerCollectedCard } from '../types';
import { calculateModifiedBadReputationGain } from './perksSystem';
import { MAX_TOTAL_CHEMISTRY, getActiveChemistryCeiling } from './chemistrySystem';
import { drawUniqueCareerCategoryCards } from './storeCollectionSystem';
import {
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
  getOrCreateGkDetailed,
} from './statCalculations';
import {
  YouthCardTemplate,
  YouthCardInstance,
  YouthCardRarity,
  YouthCardEffectSet,
  YouthCardCategory,
} from '../types/youthLeagueCards';
import { getYouthStatCardTemplates } from '../data/statProgressionCardsData';
import { applyStatPointInvestment, isStatWeaknessForPlayerType } from './statProgressionSystem';

// --- CARD TEMPLATES POOL ---
export const YOUTH_CARD_TEMPLATES: YouthCardTemplate[] = [
  ...getYouthStatCardTemplates(),
  // ================= CATEGORY 1: POSITIVE STAT CARDS (16) =================
  {
    id: 'yc-pos-overflow-chem',
    name: 'Overflow Chemistry Surge',
    category: 'positive_stat',
    isTemporal: true,
    temporalSubtype: 'temporal_positive',
    duration: 'temporal',
    description: 'An electrifying surge of squad bonding and locker room cohesion pushes team synergy beyond normal limits into Overflow Chemistry (+1 stat bonus to all attributes per 1% overflow)!',
    iconName: 'Zap',
    effectsByRarity: {
      Bronze: { chemistryChange: 10 },
      Silver: { chemistryChange: 20 },
      Gold: { chemistryChange: 50 },
      Legendary: { chemistryChange: 100 },
    },
  },

  // ================= CATEGORY 2: NEGATIVE YOUTH CARDS (10) =================
  {
    id: 'yc-neg-01',
    name: 'Training Injury',
    category: 'negative_youth',
    description: 'A training injury keeps you from developing normally.',
    iconName: 'AlertTriangle',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: -1 }] },
      Silver: { statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: -4 }] },
      Gold: { statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: -7 }] },
      Legendary: { statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: -14 }] },
    },
  },
  {
    id: 'yc-neg-02',
    name: 'Broke Boots',
    category: 'negative_youth',
    description: 'Your equipment is falling apart and replacing it costs more than expected.',
    iconName: 'Coins',
    effectsByRarity: {
      Bronze: { moneyChange: -50 },
      Silver: { moneyChange: -250 },
      Gold: { moneyChange: -600 },
      Legendary: { moneyChange: -1500 },
    },
  },
  {
    id: 'yc-neg-03',
    name: 'Locker Room Conflict',
    category: 'negative_youth',
    description: 'An argument with teammates damages the atmosphere around you.',
    iconName: 'Users',
    effectsByRarity: {
      Bronze: { chemistryChange: -2 },
      Silver: { chemistryChange: -10 },
      Gold: { chemistryChange: -18 },
      Legendary: { chemistryChange: -30 },
    },
  },
  {
    id: 'yc-neg-04',
    name: 'Media Distraction',
    category: 'negative_youth',
    description: 'Unwanted early media noise disrupts your focus and hurts your composure.',
    iconName: 'VolumeX',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'composure', statLabel: 'Composure', value: -1 }], fameChange: -1 },
      Silver: { statBonuses: [{ statKey: 'composure', statLabel: 'Composure', value: -4 }], fameChange: -4 },
      Gold: { statBonuses: [{ statKey: 'composure', statLabel: 'Composure', value: -7 }], fameChange: -8 },
      Legendary: { statBonuses: [{ statKey: 'composure', statLabel: 'Composure', value: -14 }], fameChange: -15 },
    },
  },
  {
    id: 'yc-neg-05',
    name: 'Bad Reputation Spike',
    category: 'negative_youth',
    description: 'On-pitch arguments lead to booking warnings and a rising bad reputation.',
    iconName: 'Flame',
    effectsByRarity: {
      Bronze: { badReputationChange: 2 },
      Silver: { badReputationChange: 10 },
      Gold: { badReputationChange: 18 },
      Legendary: { badReputationChange: 30 },
    },
  },
  {
    id: 'yc-neg-06',
    name: 'Growth Stagnation',
    category: 'negative_youth',
    description: 'A slump in form leads to tactical doubts and loss of confidence.',
    iconName: 'TrendingDown',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: -1 }] },
      Silver: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: -4 }, { statKey: 'reactions', statLabel: 'Reactions', value: -2 }] },
      Gold: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: -7 }, { statKey: 'reactions', statLabel: 'Reactions', value: -4 }] },
      Legendary: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: -14 }, { statKey: 'reactions', statLabel: 'Reactions', value: -8 }] },
    },
  },
  {
    id: 'yc-neg-07',
    name: 'Overtired & Sluggish',
    category: 'negative_youth',
    description: 'Back-to-back fixture congestion drains your physical speed and energy.',
    iconName: 'Activity',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'pace', statLabel: 'Pace', value: -1 }] },
      Silver: { statBonuses: [{ statKey: 'pace', statLabel: 'Pace', value: -4 }, { statKey: 'stamina', statLabel: 'Stamina', value: -3 }] },
      Gold: { statBonuses: [{ statKey: 'pace', statLabel: 'Pace', value: -7 }, { statKey: 'stamina', statLabel: 'Stamina', value: -6 }] },
      Legendary: { statBonuses: [{ statKey: 'pace', statLabel: 'Pace', value: -14 }, { statKey: 'stamina', statLabel: 'Stamina', value: -10 }] },
    },
  },
  {
    id: 'yc-neg-08',
    name: 'Tactical Confusion',
    category: 'negative_youth',
    description: 'Changing tactical instructions leaves you uncertain about your movement.',
    iconName: 'HelpCircle',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: -1 }] },
      Silver: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: -4 }, { statKey: 'composure', statLabel: 'Composure', value: -2 }] },
      Gold: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: -7 }, { statKey: 'composure', statLabel: 'Composure', value: -4 }] },
      Legendary: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: -14 }, { statKey: 'composure', statLabel: 'Composure', value: -8 }] },
    },
  },
  {
    id: 'yc-neg-09',
    name: 'Ankle Sprain',
    category: 'negative_youth',
    description: 'A sharp twist in training hampers your mobility and dribbling confidence.',
    iconName: 'ShieldAlert',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'dribbling', statLabel: 'Dribbling', value: -1 }] },
      Silver: { statBonuses: [{ statKey: 'dribbling', statLabel: 'Dribbling', value: -4 }, { statKey: 'pace', statLabel: 'Pace', value: -2 }] },
      Gold: { statBonuses: [{ statKey: 'dribbling', statLabel: 'Dribbling', value: -7 }, { statKey: 'pace', statLabel: 'Pace', value: -4 }] },
      Legendary: { statBonuses: [{ statKey: 'dribbling', statLabel: 'Dribbling', value: -14 }, { statKey: 'pace', statLabel: 'Pace', value: -8 }] },
    },
  },
  {
    id: 'yc-neg-10',
    name: 'Manager Doghouse',
    category: 'negative_youth',
    description: 'Disagreeing with the youth coach drops your standing in the team.',
    iconName: 'UserX',
    effectsByRarity: {
      Bronze: { chemistryChange: -2, managerRelationshipChange: -5 },
      Silver: { chemistryChange: -10, managerRelationshipChange: -20 },
      Gold: { chemistryChange: -18, managerRelationshipChange: -35 },
      Legendary: { chemistryChange: -30, managerRelationshipChange: -50 },
    },
  },

  // ================= CATEGORY 3: DOUBLE EDGED CARDS (5) =================
  {
    id: 'yc-de-01',
    name: 'Obsessed with Training',
    category: 'double_edged',
    description: 'You train harder than everyone else, but your body struggles to recover.',
    iconName: 'Flame',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: 4 }], injuryRiskPercent: 3 },
      Silver: { statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: 10 }], injuryRiskPercent: 8 },
      Gold: { statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: 18 }], injuryRiskPercent: 12 },
      Legendary: { statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: 30 }], injuryRiskPercent: 16 },
    },
  },
  {
    id: 'yc-de-02',
    name: 'Shooting Addict',
    category: 'double_edged',
    description: 'You stay after every session practicing your finishing, but your passing development suffers.',
    iconName: 'Target',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'shooting', statLabel: 'Shooting', value: 5 }, { statKey: 'shortPass', statLabel: 'Short Pass', value: -2 }] },
      Silver: { statBonuses: [{ statKey: 'shooting', statLabel: 'Shooting', value: 12 }, { statKey: 'shortPass', statLabel: 'Short Pass', value: -6 }] },
      Gold: { statBonuses: [{ statKey: 'shooting', statLabel: 'Shooting', value: 20 }, { statKey: 'shortPass', statLabel: 'Short Pass', value: -8 }] },
      Legendary: { statBonuses: [{ statKey: 'shooting', statLabel: 'Shooting', value: 32 }, { statKey: 'shortPass', statLabel: 'Short Pass', value: -12 }] },
    },
  },
  {
    id: 'yc-de-03',
    name: 'Physical Development',
    category: 'double_edged',
    description: 'You dedicate yourself to becoming physically dominant.',
    iconName: 'Dumbbell',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'strength', statLabel: 'Strength', value: 5 }, { statKey: 'dribbling', statLabel: 'Dribbling', value: -2 }] },
      Silver: { statBonuses: [{ statKey: 'strength', statLabel: 'Strength', value: 12 }, { statKey: 'dribbling', statLabel: 'Dribbling', value: -6 }] },
      Gold: { statBonuses: [{ statKey: 'strength', statLabel: 'Strength', value: 20 }, { statKey: 'dribbling', statLabel: 'Dribbling', value: -8 }] },
      Legendary: { statBonuses: [{ statKey: 'strength', statLabel: 'Strength', value: 32 }, { statKey: 'dribbling', statLabel: 'Dribbling', value: -12 }] },
    },
  },
  {
    id: 'yc-de-04',
    name: 'All-Out Attack',
    category: 'double_edged',
    description: 'You throw yourself completely into offensive runs at the cost of your defensive work.',
    iconName: 'Zap',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'pace', statLabel: 'Pace', value: 5 }, { statKey: 'tackling', statLabel: 'Tackling', value: -2 }] },
      Silver: { statBonuses: [{ statKey: 'pace', statLabel: 'Pace', value: 12 }, { statKey: 'tackling', statLabel: 'Tackling', value: -6 }] },
      Gold: { statBonuses: [{ statKey: 'pace', statLabel: 'Pace', value: 20 }, { statKey: 'tackling', statLabel: 'Tackling', value: -8 }] },
      Legendary: { statBonuses: [{ statKey: 'pace', statLabel: 'Pace', value: 32 }, { statKey: 'tackling', statLabel: 'Tackling', value: -12 }] },
    },
  },
  {
    id: 'yc-de-05',
    name: 'Defensive Obsession',
    category: 'double_edged',
    description: 'You focus entirely on shutting down opponents, neglecting your goalscoring development.',
    iconName: 'Shield',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'tackling', statLabel: 'Tackling', value: 5 }, { statKey: 'shooting', statLabel: 'Shooting', value: -2 }] },
      Silver: { statBonuses: [{ statKey: 'tackling', statLabel: 'Tackling', value: 12 }, { statKey: 'shooting', statLabel: 'Shooting', value: -6 }] },
      Gold: { statBonuses: [{ statKey: 'tackling', statLabel: 'Tackling', value: 20 }, { statKey: 'shooting', statLabel: 'Shooting', value: -8 }] },
      Legendary: { statBonuses: [{ statKey: 'tackling', statLabel: 'Tackling', value: 32 }, { statKey: 'shooting', statLabel: 'Shooting', value: -12 }] },
    },
  },

  // ================= CATEGORY 4: YOUTH FOOTBALL LIFESTYLE CARDS (10) =================
  {
    id: 'yc-ls-01',
    name: 'Teammate’s Family',
    category: 'youth_lifestyle',
    description: 'You become close with one of your teammates and spend more time together outside training.',
    iconName: 'Heart',
    effectsByRarity: {
      Bronze: { chemistryChange: 2 },
      Silver: { chemistryChange: 10 },
      Gold: { chemistryChange: 18 },
      Legendary: { chemistryChange: 35 },
    },
  },
  {
    id: 'yc-ls-02',
    name: 'Locker Room Favorite',
    category: 'youth_lifestyle',
    description: 'Your personality makes you popular with the squad.',
    iconName: 'Smile',
    effectsByRarity: {
      Bronze: { chemistryChange: 2 },
      Silver: { chemistryChange: 10 },
      Gold: { chemistryChange: 18 },
      Legendary: { chemistryChange: 35 },
    },
  },
  {
    id: 'yc-ls-03',
    name: 'Weekend Job',
    category: 'youth_lifestyle',
    description: 'You start earning a little money outside football, but it takes some time away from recovery.',
    iconName: 'Briefcase',
    effectsByRarity: {
      Bronze: { moneyChange: 100, statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: -1 }] },
      Silver: { moneyChange: 500, statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: -2 }] },
      Gold: { moneyChange: 1200, statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: -3 }] },
      Legendary: { moneyChange: 3000, statBonuses: [{ statKey: 'stamina', statLabel: 'Stamina', value: -4 }] },
    },
  },
  {
    id: 'yc-ls-04',
    name: 'Manager’s Favorite',
    category: 'youth_lifestyle',
    description: 'The manager begins to trust you and takes a personal interest in your development.',
    iconName: 'UserCheck',
    effectsByRarity: {
      Bronze: { managerRelationshipChange: 2, chemistryChange: 1 },
      Silver: { managerRelationshipChange: 10, chemistryChange: 4 },
      Gold: { managerRelationshipChange: 18, chemistryChange: 8 },
      Legendary: { managerRelationshipChange: 35, chemistryChange: 15 },
    },
  },
  {
    id: 'yc-ls-05',
    name: 'Local Youth Star',
    category: 'youth_lifestyle',
    description: 'Local news outlets run features on your progress, boosting your reputation.',
    iconName: 'Star',
    effectsByRarity: {
      Bronze: { fameChange: 2, moneyChange: 50 },
      Silver: { fameChange: 10, moneyChange: 250 },
      Gold: { fameChange: 18, moneyChange: 600 },
      Legendary: { fameChange: 35, moneyChange: 1800 },
    },
  },
  {
    id: 'yc-ls-06',
    name: 'Mentor Relationship',
    category: 'youth_lifestyle',
    description: 'A senior team veteran takes you under their wing and shares priceless wisdom.',
    iconName: 'Users',
    effectsByRarity: {
      Bronze: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: 1 }], managerRelationshipChange: 2 },
      Silver: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: 4 }], managerRelationshipChange: 10 },
      Gold: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: 8 }], managerRelationshipChange: 18 },
      Legendary: { statBonuses: [{ statKey: 'positioning', statLabel: 'Positioning', value: 16 }], managerRelationshipChange: 35 },
    },
  },
  {
    id: 'yc-ls-07',
    name: 'Agent Guidance',
    category: 'youth_lifestyle',
    description: 'An experienced agent offers career management and connects you to club scouts.',
    iconName: 'Award',
    effectsByRarity: {
      Bronze: { grantsManager: { quality: 'Bronze', negotiation: 30, network: 30, marketing: 30 }, fameChange: 1 },
      Silver: { grantsManager: { quality: 'Silver', negotiation: 50, network: 50, marketing: 50 }, fameChange: 5 },
      Gold: { grantsManager: { quality: 'Gold', negotiation: 75, network: 75, marketing: 75 }, fameChange: 10 },
      Legendary: { grantsManager: { quality: 'Legendary', negotiation: 90, network: 90, marketing: 90 }, fameChange: 20 },
    },
  },
  {
    id: 'yc-ls-08',
    name: 'Boot Sponsor Deal',
    category: 'youth_lifestyle',
    description: 'A local sports brand sponsors your footwear in exchange for social media promo.',
    iconName: 'Sparkles',
    effectsByRarity: {
      Bronze: { moneyChange: 100, fameChange: 1 },
      Silver: { moneyChange: 600, fameChange: 6 },
      Gold: { moneyChange: 1500, fameChange: 12 },
      Legendary: { moneyChange: 4000, fameChange: 25 },
    },
  },
  {
    id: 'yc-ls-09',
    name: 'Viral Youth Highlight',
    category: 'youth_lifestyle',
    description: 'A clip of your solo goal goes viral on TikTok and Instagram.',
    iconName: 'Flame',
    effectsByRarity: {
      Bronze: { fameChange: 3, badReputationChange: 1 },
      Silver: { fameChange: 15, badReputationChange: 4 },
      Gold: { fameChange: 30, badReputationChange: 6 },
      Legendary: { fameChange: 60, badReputationChange: 10 },
    },
  },
  {
    id: 'yc-ls-10',
    name: 'Veteran Representative',
    category: 'youth_lifestyle',
    description: 'A veteran youth representative signs you onto their boutique agency.',
    iconName: 'Briefcase',
    effectsByRarity: {
      Bronze: { grantsManager: { quality: 'Bronze', negotiation: 40, network: 40, marketing: 30 }, fameChange: 1 },
      Silver: { grantsManager: { quality: 'Silver', negotiation: 60, network: 60, marketing: 50 }, fameChange: 6 },
      Gold: { grantsManager: { quality: 'Gold', negotiation: 80, network: 80, marketing: 70 }, fameChange: 12 },
      Legendary: { grantsManager: { quality: 'Legendary', negotiation: 95, network: 95, marketing: 90 }, fameChange: 25 },
    },
  },

  // ================= CATEGORY 5: ⭐ ICONIC YOUTH LEAGUE CARDS (3) =================
  {
    id: 'yc-ico-01',
    name: '⭐ ICONIC — ELITE SCOUT',
    category: 'iconic_youth',
    isIconic: true,
    description:
      'A top-level football agent/scout has been watching your development and believes you are one of the most exciting young talents in the competition. He represents elite prospects and decides to personally take you under his wing.',
    iconName: 'Award',
    effectsByRarity: {
      Iconic: {
        grantsManager: { quality: 'Elite', negotiation: 100, network: 100, marketing: 100 },
        fameChange: 15,
        boostFirstContract: true,
      },
    },
  },
  {
    id: 'yc-ico-02',
    name: '⭐ ICONIC — THE MASTER’S CHOICE',
    category: 'iconic_youth',
    isIconic: true,
    description:
      'One of the most respected managers in football has personally noticed your potential. He doesn’t normally recruit unknown youth players, but something about your game convinces him to make an exception.',
    iconName: 'Trophy',
    effectsByRarity: {
      Iconic: {
        grantsManager: { quality: 'Master', negotiation: 100, network: 100, marketing: 100 },
        potentialChange: 5,
        fameChange: 15,
        chemistryChange: 15,
      },
    },
  },
  {
    id: 'yc-ico-03',
    name: '⭐ ICONIC — STEP ON THE BALL',
    category: 'iconic_youth',
    isIconic: true,
    description:
      'The legendary mastery of "La Pisadita" (Step on the ball). Freezing defenders with your sole and body shielding grants an unstoppable retention edge (+30% in duels, +1 yearly, stat break to 100 at 99).',
    iconName: 'Footprints',
    effectsByRarity: {
      Iconic: {
        grantsPerkId: 'step_on',
        statBonuses: [{ statKey: 'retention', statLabel: 'Retention', value: 5 }],
        fameChange: 15,
      },
    },
  },
];

/**
 * Rolls rarity based on exact prompt specifications:
 * 1% Iconic
 * 5% Legendary
 * 25% Gold
 * 50% Silver
 * 100% Bronze
 */
export function rollYouthCardRarity(): YouthCardRarity {
  const roll = Math.random() * 100;
  if (roll <= 1.0) return 'Iconic';
  if (roll <= 6.0) return 'Legendary'; // 1% to 6% = 5% chance
  if (roll <= 31.0) return 'Gold'; // 6% to 31% = 25% chance
  if (roll <= 81.0) return 'Silver'; // 31% to 81% = 50% chance
  return 'Bronze';
}

/**
 * Helper to check if a youth card template grants a manager/representative
 */
function isManagerYouthCard(template: YouthCardTemplate): boolean {
  if (Object.values(template.effectsByRarity || {}).some((eff) => eff && Boolean(eff.grantsManager))) {
    return true;
  }
  const norm = template.name.toLowerCase();
  return norm.includes('agent') || norm.includes('scout') || norm.includes('representative') || norm.includes('manager');
}

/**
 * Draws 3 Youth League Cards for Mid-Season or Pre-Season draw.
 * Directly draws from the player's persistent Unique Career Active Deck for the 'youth' category.
 * Each copy has equal probability (no rarity weighting, no tier weighting).
 * If hasManager is true, filters out any manager/representative granting cards.
 */
export function drawThreeYouthCards(hasManager: boolean = false): YouthCardInstance[] {
  const drawnCustomCards = drawUniqueCareerCategoryCards('youth', 3, undefined, {
    filter: (card) => {
      if (hasManager && (card.id.includes('agent') || card.id.includes('scout') || card.name.toLowerCase().includes('scout') || card.name.toLowerCase().includes('agent') || card.name.toLowerCase().includes('representative'))) {
        return false;
      }
      return true;
    },
  });

  const instances: YouthCardInstance[] = [];

  for (let i = 0; i < drawnCustomCards.length; i++) {
    const customCard = drawnCustomCards[i];
    const rawId = customCard.id.replace('card-youth-', '');
    let selectedTemplate = YOUTH_CARD_TEMPLATES.find((t) => t.id === rawId || customCard.id.includes(t.id));
    if (!selectedTemplate) {
      selectedTemplate = YOUTH_CARD_TEMPLATES.find((t) => customCard.name.toLowerCase().includes(t.name.toLowerCase())) || YOUTH_CARD_TEMPLATES[0];
    }

    let effectiveRarity: YouthCardRarity = 'Bronze';
    if (customCard.tier === 'silver') effectiveRarity = 'Silver';
    else if (customCard.tier === 'gold') effectiveRarity = 'Gold';
    else if (customCard.tier === 'legendary') effectiveRarity = 'Legendary';
    else if (customCard.tier === 'iconic' || selectedTemplate.isIconic || selectedTemplate.category === 'iconic_youth') effectiveRarity = 'Iconic';
    else effectiveRarity = 'Bronze';

    const effectSet =
      selectedTemplate.effectsByRarity[effectiveRarity] ||
      selectedTemplate.effectsByRarity.Bronze ||
      {};

    const effectDescriptions = buildEffectDescriptions(effectSet, effectiveRarity);
    const designColor = getCardGradientColor(selectedTemplate.category, effectiveRarity);

    let categoryLabel = 'Positive Stat Card';
    if (selectedTemplate.category === 'negative_youth') categoryLabel = 'Negative Youth Card';
    if (selectedTemplate.category === 'double_edged') categoryLabel = 'Double Edged Card';
    if (selectedTemplate.category === 'youth_lifestyle') categoryLabel = 'Youth Lifestyle Card';
    if (selectedTemplate.category === 'iconic_youth' || selectedTemplate.isIconic) categoryLabel = '⭐ Iconic Card';

    instances.push({
      instanceId: `yci-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
      templateId: selectedTemplate.id,
      name: selectedTemplate.name,
      category: selectedTemplate.category,
      categoryLabel,
      rarity: effectiveRarity,
      description: selectedTemplate.description,
      effects: effectSet,
      effectDescriptions,
      iconName: selectedTemplate.iconName,
      designColor,
      isTemporal: selectedTemplate.isTemporal,
      duration: selectedTemplate.duration,
      temporalSubtype: selectedTemplate.temporalSubtype,
      isNewCardGuaranteed: (customCard as any)?.isNewCardGuaranteed,
    });
  }

  // Safety fallback if instances has fewer than 3
  if (instances.length < 3) {
    const fallbackTemplates = YOUTH_CARD_TEMPLATES.filter((t) => !hasManager || !isManagerYouthCard(t));
    while (instances.length < 3) {
      const t = fallbackTemplates[instances.length % fallbackTemplates.length];
      const effectSet = t.effectsByRarity.Bronze || {};
      instances.push({
        instanceId: `yci-fallback-${Date.now()}-${instances.length}`,
        templateId: t.id,
        name: t.name,
        category: t.category,
        categoryLabel: 'Youth Card',
        rarity: 'Bronze',
        description: t.description,
        effects: effectSet,
        effectDescriptions: buildEffectDescriptions(effectSet, 'Bronze'),
        iconName: t.iconName,
        designColor: getCardGradientColor(t.category, 'Bronze'),
        isTemporal: t.isTemporal,
        duration: t.duration,
        temporalSubtype: t.temporalSubtype,
      });
    }
  }

  return instances;
}

/**
 * Builds text descriptions for a card effect set
 */
function buildEffectDescriptions(effects: YouthCardEffectSet, rarity: YouthCardRarity): string[] {
  const desc: string[] = [];

  if (effects.freeStatPoints) {
    desc.push(`+${effects.freeStatPoints} Free Development Stat Points`);
  }

  if (effects.statPointsBonus) {
    const { statLabel, points } = effects.statPointsBonus;
    desc.push(`+${points} Stat Development Point${points > 1 ? 's' : ''} for ${statLabel}`);
    desc.push(`📈 Directly advances ${statLabel} progress toward next level`);
  }

  if (effects.grantsPerkId === 'step_on') {
    desc.push(`⭐ Unlocks Iconic Perk: "Step on" (Pisarla)`);
    desc.push(`🛡️ +30% Retention duel boost in matches`);
    desc.push(`⚡ +1 Retention yearly & Stat Break to 100 at 99`);
  }

  if (effects.statBonuses) {
    effects.statBonuses.forEach((b) => {
      if (b.isStatPoints) {
        if (!effects.statPointsBonus) {
          desc.push(`+${b.value} Stat Development Point${b.value > 1 ? 's' : ''} for ${b.statLabel}`);
          desc.push(`📈 Directly advances ${b.statLabel} progress toward next level`);
        }
      } else {
        const sign = b.value > 0 ? '+' : '';
        desc.push(`${b.statLabel}: ${sign}${b.value}`);
      }
    });
  }

  if (effects.chemistryChange) {
    const sign = effects.chemistryChange > 0 ? '+' : '';
    if (effects.chemistryChange >= 10) {
      desc.push(`Team Chemistry: ${sign}${effects.chemistryChange}%`);
      desc.push(`⚡ Unlocks Overflow Chemistry beyond 100% (+1 to all stats per 1%)`);
    } else {
      desc.push(`Chemistry: ${sign}${effects.chemistryChange}%`);
    }
  }

  if (effects.fameChange) {
    const sign = effects.fameChange > 0 ? '+' : '';
    desc.push(`Fame: ${sign}${effects.fameChange}`);
  }

  if (effects.moneyChange) {
    const sign = effects.moneyChange > 0 ? '+' : '';
    desc.push(`Money: ${sign}€${Math.abs(effects.moneyChange).toLocaleString()}`);
  }

  if (effects.badReputationChange) {
    const sign = effects.badReputationChange > 0 ? '+' : '';
    desc.push(`Bad Reputation: ${sign}${effects.badReputationChange}`);
  }

  if (effects.potentialChange) {
    const sign = effects.potentialChange > 0 ? '+' : '';
    desc.push(`Potential OVR: ${sign}${effects.potentialChange}`);
  }

  if (effects.injuryRiskPercent) {
    desc.push(`Injury Risk Factor: +${effects.injuryRiskPercent}%`);
  }

  if (effects.managerRelationshipChange) {
    const sign = effects.managerRelationshipChange > 0 ? '+' : '';
    desc.push(`Manager Relationship: ${sign}${effects.managerRelationshipChange}`);
  }

  if (effects.grantsManager) {
    desc.push(`Grants ${effects.grantsManager.quality} Representative / Manager`);
  }

  if (effects.boostFirstContract) {
    desc.push(`Significantly Increases First Contract Opportunities`);
  }

  return desc;
}

function getCardGradientColor(category: YouthCardCategory, rarity: YouthCardRarity): string {
  if (rarity === 'Iconic') {
    return 'from-amber-400 via-yellow-500 to-amber-700 text-slate-950 border-amber-300';
  }
  if (rarity === 'Legendary') {
    return 'from-amber-600 via-orange-600 to-slate-950 text-white border-amber-400';
  }
  if (rarity === 'Gold') {
    return 'from-yellow-600 via-amber-700 to-slate-900 text-white border-yellow-400';
  }
  if (rarity === 'Silver') {
    return 'from-slate-600 via-gray-700 to-slate-950 text-white border-slate-300';
  }
  return 'from-amber-900 via-amber-950 to-slate-950 text-white border-amber-800';
}

import { sanitizeAndRepairPlayerIdentity } from './playerIdentitySystem';

/**
 * Applies a Youth League Card to a player and appends it to collectedCards
 */
export function applyYouthCardToPlayer(
  player: PlayerConfig,
  card: YouthCardInstance,
  seasonLabel: string
): { updatedPlayer: PlayerConfig; appliedEffectsSummary: string[] } {
  const updatedPlayer = JSON.parse(JSON.stringify(player)) as PlayerConfig;
  const effects = card.effects;
  const appliedSummary: string[] = [];

  // Ensure detailed stats exist
  if (!updatedPlayer.stats.detailed) {
    updatedPlayer.stats.detailed = {
      pace: updatedPlayer.stats.phy || 65,
      stamina: updatedPlayer.stats.phy || 65,
      strength: updatedPlayer.stats.phy || 65,
      ballControl: updatedPlayer.stats.pro || 65,
      retention: updatedPlayer.stats.pro || 65,
      dribbling: updatedPlayer.stats.pro || 65,
      shortPass: updatedPlayer.stats.cre || 65,
      longPass: updatedPlayer.stats.cre || 65,
      crossing: updatedPlayer.stats.cre || 65,
      shooting: updatedPlayer.stats.goa || 65,
      heading: updatedPlayer.stats.goa || 65,
      longShots: updatedPlayer.stats.goa || 65,
      tackling: updatedPlayer.stats.def || 65,
      marking: updatedPlayer.stats.def || 65,
      interceptions: updatedPlayer.stats.def || 65,
      positioning: updatedPlayer.stats.men || 65,
      composure: updatedPlayer.stats.men || 65,
      reactions: updatedPlayer.stats.men || 65,
    };
  }

  // 1. Stat Development Points Bonus (Direct Stat Point Tier Progression)
  if (!updatedPlayer.statTrainingProgress) updatedPlayer.statTrainingProgress = {};
  if (!updatedPlayer.statBreakStats) updatedPlayer.statBreakStats = {};
  const isGk = (updatedPlayer.subPosition || updatedPlayer.position || '').toUpperCase() === 'GK';

  if (effects.statPointsBonus) {
    const { statKey, statLabel, points } = effects.statPointsBonus;
    const detailed = isGk ? getOrCreateGkDetailed(updatedPlayer.stats) : (updatedPlayer.stats.detailed || {});
    if (statKey in detailed) {
      const curVal = (detailed as any)[statKey] || 40;
      const curProg = updatedPlayer.statTrainingProgress[statKey] || 0;
      const isWeakness = isStatWeaknessForPlayerType(updatedPlayer.playerTypeId, statKey);
      const invRes = applyStatPointInvestment(curVal, curProg, points, isWeakness);
      (detailed as any)[statKey] = invRes.newLevel;
      updatedPlayer.statTrainingProgress[statKey] = invRes.newProgress;
      if (invRes.statBreakTriggered) {
        updatedPlayer.statBreakActive = true;
        updatedPlayer.statBreakStats[statKey] = 100;
      }
      const label = statLabel || statKey.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      const levelsGainedStr = invRes.levelsGained > 0 ? ` (+${invRes.levelsGained} level${invRes.levelsGained > 1 ? 's' : ''}!)` : '';
      appliedSummary.push(
        `📈 ${label}: +${points} Stat Development Point${points > 1 ? 's' : ''} invested${levelsGainedStr} (Level ${curVal} ➔ ${invRes.newLevel} [${Math.round(invRes.newProgress * 100)}% progress])`
      );
    }
  }

  // 1b. Stat Bonuses (with progressive investment support for isStatPoints)
  if (effects.statBonuses && effects.statBonuses.length > 0) {
    let overflowFromStats = 0;

    effects.statBonuses.forEach((bonus) => {
      if (bonus.isStatPoints) {
        if (!effects.statPointsBonus) {
          const key = bonus.statKey;
          const detailed = isGk ? getOrCreateGkDetailed(updatedPlayer.stats) : (updatedPlayer.stats.detailed || {});
          if (key in detailed) {
            const curVal = (detailed as any)[key] || 40;
            const curProg = updatedPlayer.statTrainingProgress[key] || 0;
            const isWeakness = isStatWeaknessForPlayerType(updatedPlayer.playerTypeId, key);
            const invRes = applyStatPointInvestment(curVal, curProg, bonus.value, isWeakness);
            (detailed as any)[key] = invRes.newLevel;
            updatedPlayer.statTrainingProgress[key] = invRes.newProgress;
            if (invRes.statBreakTriggered) {
              updatedPlayer.statBreakActive = true;
              updatedPlayer.statBreakStats[key] = 100;
            }
            const label = bonus.statLabel || key;
            const levelsGainedStr = invRes.levelsGained > 0 ? ` (+${invRes.levelsGained} level${invRes.levelsGained > 1 ? 's' : ''}!)` : '';
            appliedSummary.push(
              `📈 ${label}: +${bonus.value} Stat Development Point${bonus.value > 1 ? 's' : ''} invested${levelsGainedStr} (Level ${curVal} ➔ ${invRes.newLevel} [${Math.round(invRes.newProgress * 100)}% progress])`
            );
          }
        }
      } else {
        const key = bonus.statKey as keyof typeof updatedPlayer.stats.detailed;
        if (key && typeof updatedPlayer.stats.detailed![key] === 'number') {
          const current = updatedPlayer.stats.detailed![key] as number;
          if (bonus.value > 0) {
            // Check if stat break allows up to 100 (e.g., retention with step_on perk)
            const hasBreak = (key === 'retention' && (updatedPlayer.hasStepOnPerk || updatedPlayer.activePerkIds?.includes('step_on') || effects.grantsPerkId === 'step_on'));
            const maxCap = hasBreak ? 100 : 99;

            const target = current + bonus.value;
            if (target > maxCap) {
              const applied = Math.max(current, maxCap);
              const overflow = target - applied;
              overflowFromStats += overflow;
              (updatedPlayer.stats.detailed![key] as number) = applied;
              appliedSummary.push(
                `${bonus.statLabel}: +${bonus.value} (Capped at ${applied}, +${overflow} overflow transferred to Unassigned Points)`
              );
            } else {
              (updatedPlayer.stats.detailed![key] as number) = target;
              appliedSummary.push(`${bonus.statLabel}: +${bonus.value}`);
            }
          } else {
            const nextVal = Math.max(1, current + bonus.value);
            (updatedPlayer.stats.detailed![key] as number) = nextVal;
            appliedSummary.push(`${bonus.statLabel}: ${bonus.value}`);
          }
        }
      }
    });

    if (overflowFromStats > 0) {
      const currentUnassigned = (updatedPlayer.freeStatPoints ?? updatedPlayer.unassignedPoints ?? 0);
      const newTotal = currentUnassigned + overflowFromStats;
      updatedPlayer.freeStatPoints = newTotal;
      updatedPlayer.unassignedPoints = newTotal;
      appliedSummary.push(`✨ Stat Overflow: +${overflowFromStats} Points added to Unassigned Stat Points!`);
    }

    // Recalculate main stats from detailed and recalculate weighted OVR
    const isGk = (updatedPlayer.subPosition || updatedPlayer.position || '').toUpperCase() === 'GK';
    if (isGk) {
      const gk = getOrCreateGkDetailed(updatedPlayer.stats);
      updatedPlayer.stats = syncCategoryStatsFromGkDetailed(updatedPlayer.stats, gk);
      updatedPlayer.ovr = calculateWeightedOvr('GK', 'GK', updatedPlayer.stats, updatedPlayer.playStyle);
    } else {
      const d = updatedPlayer.stats.detailed!;
      updatedPlayer.stats = syncCategoryStatsFromDetailed(updatedPlayer.stats, d);
      updatedPlayer.ovr = calculateWeightedOvr(
        updatedPlayer.position || 'ST',
        updatedPlayer.subPosition || updatedPlayer.position || 'ST',
        updatedPlayer.stats,
        updatedPlayer.playStyle
      );
    }
  }

  // 2. Direct Free Stat Points (e.g. "Training Hard" card)
  if (effects.freeStatPoints && effects.freeStatPoints > 0) {
    const currentUnassigned = (updatedPlayer.freeStatPoints ?? updatedPlayer.unassignedPoints ?? 0);
    const newTotal = currentUnassigned + effects.freeStatPoints;
    updatedPlayer.freeStatPoints = newTotal;
    updatedPlayer.unassignedPoints = newTotal;
    appliedSummary.push(`🎯 Unassigned Stat Points: +${effects.freeStatPoints}`);
  }

  // 3. Grant Iconic Perk (e.g. "Step on" / Pisarla)
  if (effects.grantsPerkId || card.templateId === 'yc-ico-03' || card.name.includes('STEP ON') || card.name.includes('PISADITA')) {
    const perkId = effects.grantsPerkId || 'step_on';
    if (perkId === 'step_on') {
      updatedPlayer.hasStepOnPerk = true;
    }
    const currentPerks = [...(updatedPlayer.activePerkIds || [])];
    if (!currentPerks.includes(perkId)) {
      if (currentPerks.length < 5) {
        currentPerks.push(perkId);
      } else {
        currentPerks[currentPerks.length - 1] = perkId;
      }
      updatedPlayer.activePerkIds = currentPerks;
    }
    appliedSummary.push(`⭐ Unlocked Iconic Perk: Step on (Pisarla)`);
  }

  // 4. Fame
  if (effects.fameChange) {
    updatedPlayer.fame = Math.max(0, Math.min(1000, (updatedPlayer.fame || 0) + effects.fameChange));
    appliedSummary.push(`Fame: ${effects.fameChange > 0 ? '+' : ''}${effects.fameChange}`);
  }

  // 5. Bad Reputation
  if (effects.badReputationChange) {
    const effectiveBadRepDelta = calculateModifiedBadReputationGain(updatedPlayer, effects.badReputationChange);
    updatedPlayer.badReputation = Math.max(
      1,
      Math.min(100, (updatedPlayer.badReputation || 1) + effectiveBadRepDelta)
    );
    appliedSummary.push(`Bad Reputation: ${effectiveBadRepDelta > 0 ? '+' : ''}${effectiveBadRepDelta}`);
  }

  // 6. Chemistry (supports Overflow Chemistry up to 200%)
  if (effects.chemistryChange) {
    const oldChem = updatedPlayer.chemistry || 50;
    const ceilingInfo = getActiveChemistryCeiling(updatedPlayer);
    if (ceilingInfo.hasCeiling && effects.chemistryChange > 0) {
      const maxAllowed = ceilingInfo.effectiveCeiling;
      const desiredChem = oldChem + effects.chemistryChange;
      const newChem = Math.max(0, Math.min(maxAllowed, desiredChem));
      const blockedAmt = Math.max(0, desiredChem - newChem);
      updatedPlayer.chemistry = newChem;
      if (blockedAmt > 0) {
        appliedSummary.push(`⚠️ Chemistry: +${effects.chemistryChange - blockedAmt}% (+${blockedAmt}% held by active ${maxAllowed}% cap, activates once cap expires)`);
        if (!updatedPlayer.pendingBlockedChemistry) updatedPlayer.pendingBlockedChemistry = [];
        updatedPlayer.pendingBlockedChemistry.push({
          amount: blockedAmt,
          source: card.name,
        });
      } else {
        appliedSummary.push(`Chemistry: +${effects.chemistryChange}%`);
      }
    } else {
      const newChem = Math.max(0, Math.min(MAX_TOTAL_CHEMISTRY, oldChem + effects.chemistryChange));
      updatedPlayer.chemistry = newChem;
      if (newChem > 100) {
        const overflow = newChem - 100;
        appliedSummary.push(`⚡ Team Chemistry: +${effects.chemistryChange}% (Overflow: +${overflow}% bonus stats active!)`);
      } else {
        appliedSummary.push(`Chemistry: ${effects.chemistryChange > 0 ? '+' : ''}${effects.chemistryChange}%`);
      }
    }
  }

  // 7. Potential
  if (effects.potentialChange) {
    updatedPlayer.potentialOvr = Math.min(99, (updatedPlayer.potentialOvr || 80) + effects.potentialChange);
    appliedSummary.push(`Potential OVR: +${effects.potentialChange}`);
  }

  // 8. Grants Manager
  if (effects.grantsManager) {
    (updatedPlayer as any).managerState = {
      name: `${card.effects.grantsManager?.quality} Representative (${card.name})`,
      negotiation: effects.grantsManager.negotiation,
      network: effects.grantsManager.network,
      marketing: effects.grantsManager.marketing,
    };
    appliedSummary.push(`Assigned ${effects.grantsManager.quality} Representative`);
  }

  // 9. Record in collectedCards
  const collectedCardRecord: CareerCollectedCard = {
    id: `ylc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: card.name,
    category: 'youth_league',
    rarity: card.rarity,
    effects: card.effectDescriptions,
    obtainedAt: `Age ${player.age || 10} - ${seasonLabel}`,
    designColor: card.designColor,
    iconName: card.iconName,
  };

  if (!updatedPlayer.collectedCards) {
    updatedPlayer.collectedCards = [];
  }

  // Ensure card is recorded permanently into collection
  updatedPlayer.collectedCards.push(collectedCardRecord);

  const sanitizedPlayer = sanitizeAndRepairPlayerIdentity(updatedPlayer) as PlayerConfig;

  return {
    updatedPlayer: sanitizedPlayer,
    appliedEffectsSummary: appliedSummary,
  };
}

/**
 * Creates a YouthCardInstance from a template and target rarity.
 */
export function createYouthCardInstanceFromTemplate(
  template: YouthCardTemplate,
  rarity: YouthCardRarity
): YouthCardInstance {
  const effectiveRarity: YouthCardRarity = template.isIconic ? 'Iconic' : rarity;
  const effectSet =
    template.effectsByRarity[effectiveRarity] ||
    template.effectsByRarity.Bronze ||
    {};

  const effectDescriptions = buildEffectDescriptions(effectSet, effectiveRarity);
  const designColor = getCardGradientColor(template.category, effectiveRarity);

  let categoryLabel = 'Positive Stat Card';
  if (template.category === 'negative_youth') categoryLabel = 'Negative Youth Card';
  if (template.category === 'double_edged') categoryLabel = 'Double Edged Card';
  if (template.category === 'youth_lifestyle') categoryLabel = 'Youth Lifestyle Card';
  if (template.category === 'iconic_youth') categoryLabel = '⭐ Iconic Card';

  return {
    instanceId: `yci-${template.id}-${effectiveRarity}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    templateId: template.id,
    name: template.name,
    category: template.category,
    categoryLabel,
    rarity: effectiveRarity,
    description: template.description,
    effects: effectSet,
    effectDescriptions,
    iconName: template.iconName,
    designColor,
    isTemporal: template.isTemporal,
    duration: template.duration,
    temporalSubtype: template.temporalSubtype,
  };
}

/**
 * Returns all available Youth Cards sorted strictly from HIGHEST to LOWEST tier
 * (Iconic -> Legendary -> Gold -> Silver -> Bronze).
 */
export function getAllAvailableYouthCards(): YouthCardInstance[] {
  const cards: YouthCardInstance[] = [];

  // 1. Iconic cards
  const iconicTemplates = YOUTH_CARD_TEMPLATES.filter((t) => t.isIconic || t.category === 'iconic_youth');
  iconicTemplates.forEach((t) => {
    cards.push(createYouthCardInstanceFromTemplate(t, 'Iconic'));
  });

  // 2. Standard templates across Legendary -> Gold -> Silver -> Bronze
  const standardTemplates = YOUTH_CARD_TEMPLATES.filter((t) => !t.isIconic && t.category !== 'iconic_youth');
  const rarities: YouthCardRarity[] = ['Legendary', 'Gold', 'Silver', 'Bronze'];

  rarities.forEach((rarity) => {
    standardTemplates.forEach((t) => {
      if (t.effectsByRarity && (t.effectsByRarity as any)[rarity]) {
        cards.push(createYouthCardInstanceFromTemplate(t, rarity));
      }
    });
  });

  return cards;
}

