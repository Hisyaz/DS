import { StoreUpgradeItem, PlayerCardData } from '../types';
import {
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
} from '../utils/statCalculations';

export type { StoreUpgradeItem };

export const STORE_PRICING = {
  tier1: { coins: 50, cash: 10000 },
  tier2: { coins: 150, cash: 50000 },
  tier3: { coins: 400, cash: 250000 },
  tier4: { coins: 1000, cash: 1000000 },
  tier5: { coins: 2500, cash: 10000000 },
  tier6: { coins: 5000, cash: 100000000 },
};

export const TIER_COIN_COSTS = {
  tier1: 50,
  tier2: 150,
  tier3: 400,
  tier4: 1000,
  tier5: 2500,
  tier6: 5000,
};

export const TIER_CASH_COSTS = {
  tier1: 10000,
  tier2: 50000,
  tier3: 250000,
  tier4: 1000000,
  tier5: 10000000,
  tier6: 100000000,
};

export const ALL_STORE_CATEGORIES = [
  { id: 'all', name: 'All Store' },
  { id: 'consumables', name: 'Consumables' },
  { id: 'upgrade', name: 'Facilities & Upgrades' },
  { id: 'season_boost', name: 'Season Boosts' },
  { id: 'pro_equipment', name: 'Pro Equipment' },
  { id: 'special_hair', name: 'Cosmetics' },
] as const;

export const STORE_TIER_NAMES: Record<number, { name: string; colorScheme: string; color: string; badge: string; border: string; glow: string }> = {
  1: {
    name: 'Tier 1',
    colorScheme: 'bronze',
    color: 'border-amber-700/70 text-amber-500 bg-amber-950/40',
    badge: 'Tier 1',
    border: 'border-amber-700/60',
    glow: 'shadow-amber-950/30',
  },
  2: {
    name: 'Tier 2',
    colorScheme: 'silver',
    color: 'border-slate-300/70 text-slate-200 bg-slate-800/50',
    badge: 'Tier 2',
    border: 'border-slate-400/60',
    glow: 'shadow-slate-900/30',
  },
  3: {
    name: 'Tier 3',
    colorScheme: 'gold',
    color: 'border-yellow-400/80 text-yellow-300 bg-yellow-950/50',
    badge: 'Tier 3',
    border: 'border-yellow-500/60',
    glow: 'shadow-yellow-950/40',
  },
  4: {
    name: 'Tier 4',
    colorScheme: 'platinum',
    color: 'border-cyan-300/80 text-cyan-200 bg-cyan-950/50',
    badge: 'Tier 4',
    border: 'border-cyan-400/60',
    glow: 'shadow-cyan-950/40',
  },
  5: {
    name: 'Tier 5',
    colorScheme: 'diamond',
    color: 'border-blue-400/90 text-blue-200 bg-blue-950/60',
    badge: 'Tier 5',
    border: 'border-blue-400/70',
    glow: 'shadow-blue-950/50',
  },
  6: {
    name: 'Tier 6',
    colorScheme: 'shiny_purple',
    color: 'border-purple-400/90 text-purple-200 bg-purple-950/60 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    badge: 'Tier 6',
    border: 'border-purple-400/80',
    glow: 'shadow-purple-900/50 shadow-[0_0_15px_rgba(168,85,247,0.45)]',
  },
};

export const STORE_CATEGORY_THEMES = {
  consumables: {
    id: 'consumables',
    name: 'Consumables',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    activeTab: 'bg-emerald-600 text-white shadow-emerald-950/50 shadow-md',
    buttonGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
  },
  upgrade: {
    id: 'upgrade',
    name: 'Facilities & Upgrades',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-950/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    activeTab: 'bg-amber-600 text-white shadow-amber-950/50 shadow-md',
    buttonGradient: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
  },
  season_boost: {
    id: 'season_boost',
    name: 'Season Boosts',
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-950/30',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    activeTab: 'bg-purple-600 text-white shadow-purple-950/50 shadow-md',
    buttonGradient: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500',
  },
  pro_equipment: {
    id: 'pro_equipment',
    name: 'Pro Equipment',
    text: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-950/30',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    activeTab: 'bg-cyan-600 text-white shadow-cyan-950/50 shadow-md',
    buttonGradient: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500',
  },
  special_hair: {
    id: 'special_hair',
    name: 'Cosmetics',
    text: 'text-pink-400',
    border: 'border-pink-500/40',
    bg: 'bg-pink-950/30',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    activeTab: 'bg-pink-600 text-white shadow-pink-950/50 shadow-md',
    buttonGradient: 'from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500',
  },
};

// ==========================================
// 1. CONSUMABLES MASTER POOL
// Used once and permanently consumed.
// 1 random consumable per tier added each Preseason (stacks if already in store).
// ==========================================
export const CONSUMABLES_ITEMS: StoreUpgradeItem[] = [
  // --- TIER 1 --- (€10,000 / 50 coins)
  {
    id: 'con_ankle_taping',
    name: 'Ankle Taping',
    category: 'consumables',
    tier: 1,
    coinPrice: 50,
    costEuros: 10000,
    description: 'Specialized protective ankle taping to support joints and reduce strain during matches.',
    effectSummary: '-15% injury chance for 6 months',
    effect: '-15% injury chance for 6 months',
    availableStock: 1,
    maxStock: 1,
    injuryRiskReduction: 15,
    iconKey: 'bandage',
  },
  {
    id: 'con_electrolyte_shot',
    name: 'Electrolyte Energy Gel',
    category: 'consumables',
    tier: 1,
    coinPrice: 50,
    costEuros: 10000,
    description: 'Rapid-absorption isotonic carbohydrate gel for quick in-match stamina replenishment.',
    effectSummary: '+2 Stamina & +2% Fitness',
    effect: '+2 Stamina & +2% Fitness',
    availableStock: 1,
    maxStock: 1,
    statBonuses: { stamina: 2 },
    iconKey: 'zap',
  },
  {
    id: 'con_compression_wrap',
    name: 'Joint Compression Wrap',
    category: 'consumables',
    tier: 1,
    coinPrice: 50,
    costEuros: 10000,
    description: 'Elastic supportive compression wrap for knee and tendon stabilization.',
    effectSummary: '-10% injury chance for 6 months, +1 Recovery Point',
    effect: '-10% injury chance for 6 months, +1 Recovery Point',
    availableStock: 1,
    maxStock: 1,
    injuryRiskReduction: 10,
    iconKey: 'bandage',
  },

  // --- TIER 2 --- (€50,000 / 150 coins)
  {
    id: 'con_hydrating_drink',
    name: 'Hydrating Drink',
    category: 'consumables',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Electrolyte & carbohydrate drink for rapid physical stamina and fitness replenishment.',
    effectSummary: '+5 Stamina, +5% Fitness',
    effect: '+5 Stamina, +5% Fitness',
    availableStock: 1,
    maxStock: 1,
    statBonuses: { stamina: 5 },
    iconKey: 'cup',
  },
  {
    id: 'con_cryo_freeze_spray',
    name: 'Muscle Cryo-Freeze Spray',
    category: 'consumables',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Pressurized medical cold analgesic spray for instantaneous micro-tear relief.',
    effectSummary: '-25% injury chance for 6 months',
    effect: '-25% injury chance for 6 months',
    availableStock: 1,
    maxStock: 1,
    injuryRiskReduction: 25,
    iconKey: 'sparkles',
  },
  {
    id: 'con_whey_isolate_shake',
    name: 'Bio-Protein Shake',
    category: 'consumables',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Cold-filtered whey isolate infused with BCAAs for accelerated muscle reconstruction.',
    effectSummary: '+5 Strength, +3% Fitness',
    effect: '+5 Strength, +3% Fitness',
    availableStock: 1,
    maxStock: 1,
    statBonuses: { strength: 5 },
    iconKey: 'cup',
  },

  // --- TIER 3 --- (€250,000 / 400 coins)
  {
    id: 'con_recovery_supplement',
    name: 'Recovery Supplement',
    category: 'consumables',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'High-purity amino acid and peptide formula that restores athletic vitality.',
    effectSummary: '+1 Recovery Point',
    effect: '+1 Recovery Point',
    availableStock: 1,
    maxStock: 1,
    iconKey: 'pill',
  },
  {
    id: 'con_hyperbaric_dose',
    name: 'Hyperbaric Oxygen Shot',
    category: 'consumables',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Single high-pressure oxygen therapy session saturating plasma and accelerating tissue repair.',
    effectSummary: '+1 Recovery Point & +8% Fitness',
    effect: '+1 Recovery Point & +8% Fitness',
    availableStock: 1,
    maxStock: 1,
    iconKey: 'activity',
  },
  {
    id: 'con_nootropic_capsule',
    name: 'Nootropic Focus Capsule',
    category: 'consumables',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Cognitive neuro-enhancer optimizing pitch vision, tactical anticipation, and nerve speed.',
    effectSummary: '+5 Reactions, +5 Composure for 6 months',
    effect: '+5 Reactions, +5 Composure for 6 months',
    availableStock: 1,
    maxStock: 1,
    statBonuses: { reactions: 5, composure: 5 },
    iconKey: 'brain',
  },

  // --- TIER 4 --- (€1,000,000 / 1000 coins)
  {
    id: 'con_performance_taping',
    name: 'Performance Taping',
    category: 'consumables',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Advanced kinesiology structure offering maximum muscle activation, support and stability.',
    effectSummary: '+5 Strength, +5 Stamina, -50% injury chance for 6 months',
    effect: '+5 Strength, +5 Stamina, -50% injury chance for 6 months',
    availableStock: 1,
    maxStock: 1,
    statBonuses: { strength: 5, stamina: 5 },
    injuryRiskReduction: 50,
    iconKey: 'zap',
  },
  {
    id: 'con_stem_cell_patch',
    name: 'Stem Cell Tissue Patch',
    category: 'consumables',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Concentrated autologous stem cell matrix patch for deep muscle tendon renewal.',
    effectSummary: '+3 Recovery Points',
    effect: '+3 Recovery Points',
    availableStock: 1,
    maxStock: 1,
    iconKey: 'shield',
  },
  {
    id: 'con_neuro_stim_gel',
    name: 'Neuromuscular Shock Gel',
    category: 'consumables',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Transdermal bio-electric formulation activating explosive fast-twitch muscle fibers.',
    effectSummary: '+8 Pace, +8 Reactions for 6 months',
    effect: '+8 Pace, +8 Reactions for 6 months',
    availableStock: 1,
    maxStock: 1,
    statBonuses: { pace: 8, reactions: 8 },
    iconKey: 'flame',
  },

  // --- TIER 5 --- (€10,000,000 / 2500 coins)
  {
    id: 'con_experimental_supplement',
    name: 'Experimental Supplement',
    category: 'consumables',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'State-of-the-art cellular regeneration compound designed for instantaneous peak recovery.',
    effectSummary: '+5 Recovery Points',
    effect: '+5 Recovery Points',
    availableStock: 1,
    maxStock: 1,
    iconKey: 'flask',
  },
  {
    id: 'con_nanotech_infusion',
    name: 'Nanotech Recovery Infusion',
    category: 'consumables',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Microscopic cellular repair nanobots providing instant full restoration of physiological fatigue.',
    effectSummary: '+8 Recovery Points & 100% Full Fitness',
    effect: '+8 Recovery Points & 100% Full Fitness',
    availableStock: 1,
    maxStock: 1,
    iconKey: 'dna',
  },
  {
    id: 'con_cellular_surge',
    name: 'Mitochondrial Surge Elixir',
    category: 'consumables',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Super-oxygenated ATP substrate permanently priming energy synthesis for competitive fixtures.',
    effectSummary: '+10 Stamina & +10 Strength for 6 months',
    effect: '+10 Stamina & +10 Strength for 6 months',
    availableStock: 1,
    maxStock: 1,
    statBonuses: { stamina: 10, strength: 10 },
    iconKey: 'sparkles',
  },
];

// ==========================================
// 2. UPGRADES
// Permanent upgrades with Preseason recurring effects.
// Only can be purchased once.
// ==========================================
export const UPGRADES_ITEMS: StoreUpgradeItem[] = [
  {
    id: 'upg_recovery_equip',
    name: 'Recovery Equipment',
    category: 'upgrade',
    tier: 1,
    coinPrice: 50,
    costEuros: 10000,
    description: 'Foam Roller, Massage Gun & Compression Boots for home recovery.',
    effectSummary: '+1 Recovery Point every Preseason',
    effect: '+1 Recovery Point every Preseason',
    iconKey: 'dumbbell',
  },
  {
    id: 'upg_home_gym',
    name: 'Home Gym',
    category: 'upgrade',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Simple home gym for training at home.',
    effectSummary: '+1 random Physical stat (Pace, Stamina or Strength) every Preseason',
    effect: '+1 random Physical stat (Pace, Stamina or Strength) every Preseason',
    iconKey: 'home',
  },
  {
    id: 'upg_pro_kitchen',
    name: 'Professional Kitchen',
    category: 'upgrade',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Specialized athlete meal preparation.',
    effectSummary: '+1 Recovery Point every Preseason, +1 Stamina',
    effect: '+1 Recovery Point every Preseason, +1 Stamina',
    statBonuses: { stamina: 1 },
    iconKey: 'utensils',
  },
  {
    id: 'upg_perf_complex',
    name: 'Complete Football Performance Complex',
    category: 'upgrade',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Private training, medical, recovery and analysis facility.',
    effectSummary: '+5 Stat Points every Preseason',
    effect: '+5 Stat Points every Preseason',
    iconKey: 'building',
  },
  {
    id: 'upg_perf_center',
    name: 'World-Class Football Performance Center',
    category: 'upgrade',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Facility comparable to elite professional clubs.',
    effectSummary: '-1 Stat Decay per season after age 28 (-2 instead of -3), +5 Retirement Years',
    effect: '-1 Stat Decay per season after age 28 (-2 instead of -3), +5 Retirement Years',
    iconKey: 'award',
  },
  {
    id: 'upg_genetic_activation',
    name: 'Genetic Potential Activation',
    category: 'upgrade',
    tier: 6,
    coinPrice: 5000,
    costEuros: 100000000,
    description: 'HIGH-RISK EXPERIMENTAL PROCEDURE. Undergo cutting-edge epigenetic reprogramming to artificially alter your biological ceiling. Beware: severe cellular rejection or miraculous athletic evolution may occur. One-time irreversible procedure.',
    effectSummary: 'Risky Procedure: 5% Crit Fail, 15% Fail, 50% Small, 15% Mod, 10% Total, 5% Huge',
    effect: 'Risky Procedure (100M): 5% -10 all stats & -5 Pot | 15% Nothing | 50% +1 Pot & +10 Pts | 15% +3 Pot & +20 Pts | 10% +5 Pot & +30 Pts | 5% +10 Pot & +50 Pts',
    iconKey: 'dna',
  },
];

// ==========================================
// 3. SEASON BOOSTS
// Temporary boosts for the current season.
// Replenishes at every preseason so there is always one of each.
// ==========================================
export const SEASON_BOOST_ITEMS: StoreUpgradeItem[] = [
  {
    id: 'sbt_extra_training',
    name: 'Extra Individual Training',
    category: 'season_boost',
    tier: 1,
    coinPrice: 50,
    costEuros: 10000,
    description: 'Extra individualized daily drills to boost attributes.',
    effectSummary: '+1 random stat for the current season',
    effect: '+1 random stat for the current season',
    iconKey: 'dumbbell',
  },
  {
    id: 'sbt_pro_nutrition',
    name: 'Professional Nutrition Program',
    category: 'season_boost',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Specialized nutritionist meal scheduling and micro-nutrient tracking.',
    effectSummary: '+5 Stamina for the current season',
    effect: '+5 Stamina for the current season',
    statBonuses: { stamina: 5 },
    iconKey: 'utensils',
  },
  {
    id: 'sbt_kinesiologist',
    name: 'Personal Kinesiologist',
    category: 'season_boost',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Dedicated professional movement therapist to protect joints and ligaments.',
    effectSummary: '-30% injury chance for the current season',
    effect: '-30% injury chance for the current season',
    injuryRiskReduction: 30,
    iconKey: 'heart',
  },
  {
    id: 'sbt_david_goggins',
    name: 'Hire David Goggins',
    category: 'season_boost',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Extreme mental conditioning and unrelenting physical resilience regimen.',
    effectSummary: '+10 Composure, +10 Stamina, +10 Strength, +5 Pace for the current season',
    effect: '+10 Composure, +10 Stamina, +10 Strength, +5 Pace for the current season',
    statBonuses: { composure: 10, stamina: 10, strength: 10, pace: 5 },
    iconKey: 'flame',
  },
  {
    id: 'sbt_experimental_chemical',
    name: 'Experimental Chemical Enhancement',
    category: 'season_boost',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Groundbreaking pharmacological formulation providing unprecedented athletic performance and physical synergy across every stat for 12 months.',
    effectSummary: '+10 bonus to every stat for the season (lasts 12 months)',
    effect: '+10 bonus to every stat for 12 months (removed at next preseason)',
    iconKey: 'flask',
  },
  {
    id: 'sbt_luxury_car_bonus',
    name: 'Luxury Car Team Bonus',
    category: 'season_boost',
    tier: 6,
    coinPrice: 5000,
    costEuros: 100000000,
    description: 'Gift luxury bespoke supercars to the entire first-team squad and coaching staff to instantly skyrocket locker room camaraderie to legendary heights.',
    effectSummary: 'Instant 200% Team Chemistry (subject to normal decay)',
    effect: 'Instantly sets team chemistry to 200% (subject to standard monthly chemistry decay rules)',
    iconKey: 'car',
  },
];

// ==========================================
// 4. PRO EQUIPMENT MASTER POOL
// Each item has a Match Duration.
// 1 match consumed per played match.
// 0 matches = permanently removed from inventory.
// 5 random items replenished each Preseason (>= 1 per tier).
// ==========================================
export const ALL_PRO_EQUIPMENT_ITEMS: StoreUpgradeItem[] = [
  // --- TIER 1 --- (€10,000 / 50 coins)
  {
    id: 'eq_compression_socks',
    name: 'Compression Socks',
    category: 'pro_equipment',
    tier: 1,
    coinPrice: 50,
    costEuros: 10000,
    description: 'Performance compression socks designed to reduce muscle fatigue and strain.',
    effectSummary: '-5% injury risk (14 matches)',
    effect: '-5% injury risk',
    matchDuration: 14,
    durability: { current: 14, max: 14 },
    availableStock: 2,
    maxStock: 2,
    injuryRiskReduction: 5,
  },
  {
    id: 'eq_anti_slip_boots',
    name: 'Anti-Slip Boot System',
    category: 'pro_equipment',
    tier: 1,
    coinPrice: 50,
    costEuros: 10000,
    description: 'Enhanced inner sole grip preventing unwanted foot movement inside boots.',
    effectSummary: '+1 Short Pass, +1 Shooting, +1 Long Shots, +1 Ball Control (12 matches)',
    effect: '+1 Short Pass, +1 Shooting, +1 Long Shots, +1 Ball Control',
    matchDuration: 12,
    durability: { current: 12, max: 12 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { shortPass: 1, shooting: 1, longShots: 1, ballControl: 1 },
  },
  {
    id: 'eq_pro_undershirt',
    name: 'Professional Match Undershirt',
    category: 'pro_equipment',
    tier: 1,
    coinPrice: 50,
    costEuros: 10000,
    description: 'Tight-fit thermal base layer optimizing posture and physical presence.',
    effectSummary: '+2 Strength, +2 Retention (8 matches)',
    effect: '+2 Strength, +2 Retention',
    matchDuration: 8,
    durability: { current: 8, max: 8 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { strength: 2, retention: 2 },
  },

  // --- TIER 2 --- (€50,000 / 150 coins)
  {
    id: 'eq_carbon_shinguards',
    name: 'Carbon-Fiber Shin Guards',
    category: 'pro_equipment',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Featherweight aerospace-grade carbon fiber offering robust impact deflection.',
    effectSummary: '+5 Reaction, +5 Pace, -10% injury chance (15 matches)',
    effect: '+5 Reaction, +5 Pace, -10% injury chance',
    matchDuration: 15,
    durability: { current: 15, max: 15 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { reactions: 5, pace: 5 },
    injuryRiskReduction: 10,
  },
  {
    id: 'eq_custom_fitted_boots',
    name: 'Custom-Fitted Football Boots',
    category: 'pro_equipment',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Boots 3D-molded to the contours of the player’s feet for superior touch.',
    effectSummary: '+5 Ball Control, +5 Dribbling, +5 Pace, +5 Shooting, +5 Short Pass (20 matches)',
    effect: '+5 Ball Control, +5 Dribbling, +5 Pace, +5 Shooting, +5 Short Pass',
    matchDuration: 20,
    durability: { current: 20, max: 20 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { ballControl: 5, dribbling: 5, pace: 5, shooting: 5, shortPass: 5 },
  },
  {
    id: 'eq_match_sensor_kit',
    name: 'Professional Match Sensor Kit',
    category: 'pro_equipment',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Biometric GPS vest that informs tactical positioning and work-rate.',
    effectSummary: '+10 Position, +10 Interceptions, +5 Stamina (30 matches)',
    effect: '+10 Position, +10 Interceptions, +5 Stamina',
    matchDuration: 30,
    durability: { current: 30, max: 30 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { positioning: 10, interceptions: 10, stamina: 5 },
  },

  // --- TIER 3 --- (€250,000 / 400 coins)
  {
    id: 'eq_bespoke_footwear_coll',
    name: 'Bespoke Match Footwear Collection',
    category: 'pro_equipment',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Handcrafted boot collection with tailored tactical specialization.',
    effectSummary: '+8 to +10 Role Stats (Defensive, Creative, or Offensive) (60 matches)',
    effect: 'Specialization: Defensive (+8 Tackling, Marking, Interceptions), Creative (+8 Short Pass, Long Pass, Crossing), or Offensive (+8 Shooting, Long Shots, Position)',
    matchDuration: 60,
    durability: { current: 60, max: 60 },
    availableStock: 1,
    maxStock: 1,
    equipmentVariant: 'creative',
    statBonuses: { shortPass: 8, longPass: 8, crossing: 8 },
  },
  {
    id: 'eq_precision_traction',
    name: 'Precision Traction System',
    category: 'pro_equipment',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Dynamic multi-surface stud geometry ensuring seamless acceleration and turn stability.',
    effectSummary: '-20% injury chance, +5 Stamina, +5 Ball Control, +5 Dribbling, +5 Retention (70 matches)',
    effect: '-20% injury chance, +5 Stamina, +5 Ball Control, +5 Dribbling, +5 Retention',
    matchDuration: 70,
    durability: { current: 70, max: 70 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { stamina: 5, ballControl: 5, dribbling: 5, retention: 5 },
    injuryRiskReduction: 20,
  },
  {
    id: 'eq_impact_reduction',
    name: 'Custom Impact-Reduction System',
    category: 'pro_equipment',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Shock-absorbing polymer plates distributing heavy challenge force away from vulnerable joints.',
    effectSummary: '-50% injury chance (70 matches)',
    effect: '-50% injury chance',
    matchDuration: 70,
    durability: { current: 70, max: 70 },
    availableStock: 1,
    maxStock: 1,
    injuryRiskReduction: 50,
  },

  // --- TIER 4 --- (€1,000,000 / 1000 coins)
  {
    id: 'eq_neural_performance_wear',
    name: 'Neural Performance Wear',
    category: 'pro_equipment',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Smart compression textile with micro-haptic spatial cues improving tactical awareness.',
    effectSummary: '+10 Position, +10 Interceptions, +10 Marking, +10 Retention (15 matches)',
    effect: '+10 Position, +10 Interceptions, +10 Marking, +10 Retention',
    matchDuration: 15,
    durability: { current: 15, max: 15 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { positioning: 10, interceptions: 10, marking: 10, retention: 10 },
  },
  {
    id: 'eq_aerodynamic_matchwear',
    name: 'Custom Aerodynamic Matchwear',
    category: 'pro_equipment',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Wind-tunnel tested fabric reducing drag and boosting continuous sprint stamina.',
    effectSummary: '+15 Pace, +10 Stamina (25 matches)',
    effect: '+15 Pace, +10 Stamina',
    matchDuration: 25,
    durability: { current: 25, max: 25 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { pace: 15, stamina: 10 },
  },
  {
    id: 'eq_protective_headgear',
    name: 'Elite Protective Headgear',
    category: 'pro_equipment',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Cech-style lightweight protective skull guard enhancing aerial duel confidence.',
    effectSummary: '+15 Reaction, +15 Heading, +10 Composure (55 matches)',
    effect: '+15 Reaction, +15 Heading, +10 Composure',
    matchDuration: 55,
    durability: { current: 55, max: 55 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { reactions: 15, heading: 15, composure: 10 },
  },
  {
    id: 'eq_performance_insole',
    name: 'Elite Performance Insole System',
    category: 'pro_equipment',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Energy-return carbon fiber insoles that maximize launch velocity for distance shots.',
    effectSummary: '+15 Long Shots, +5 Stamina, +5 Pace (55 matches)',
    effect: '+15 Long Shots, +5 Stamina, +5 Pace',
    matchDuration: 55,
    durability: { current: 55, max: 55 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { longShots: 15, stamina: 5, pace: 5 },
  },

  // --- TIER 5 --- (€10,000,000 / 2500 coins, 85 matches duration)
  {
    id: 'eq_precision_creator_boots',
    name: 'Precision Creator Boots',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Micro-textured kangaroo leather with laser-milled passing fins.',
    effectSummary: '+12 Short Pass, +10 Long Pass (85 matches)',
    effect: '+12 Short Pass, +10 Long Pass',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { shortPass: 12, longPass: 10 },
  },
  {
    id: 'eq_world_class_crossing',
    name: 'World-Class Crossing Boots',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Asymmetrical lacing engineered for wicked curve and pinpoint crosses.',
    effectSummary: '+15 Crossing, +10 Short Pass (85 matches)',
    effect: '+15 Crossing, +10 Short Pass',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { crossing: 15, shortPass: 10 },
  },
  {
    id: 'eq_master_playmaker',
    name: 'Master Playmaker System',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Complete maestro equipment setup designed to dictate the entire game rhythm.',
    effectSummary: '+12 Short Pass, +12 Long Pass, +10 Crossing (85 matches)',
    effect: '+12 Short Pass, +12 Long Pass, +10 Crossing',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { shortPass: 12, longPass: 12, crossing: 10 },
  },
  {
    id: 'eq_deadly_finisher',
    name: 'Deadly Finisher Boots',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Reinforced instep strike zone that converts half-chances into clinical goals.',
    effectSummary: '+15 Shooting, +10 Reaction (85 matches)',
    effect: '+15 Shooting, +10 Reaction',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { shooting: 15, reactions: 10 },
  },
  {
    id: 'eq_long_range_cannon',
    name: 'Long-Range Cannon Boots',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Stiffened power soleplate transferring explosive force into thunderous long shots.',
    effectSummary: '+15 Long Shots, +10 Shooting (85 matches)',
    effect: '+15 Long Shots, +10 Shooting',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { longShots: 15, shooting: 10 },
  },
  {
    id: 'eq_complete_striker',
    name: 'Complete Striker System',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'All-around attacking kit optimized for poaching, aerial finishing, and distance power.',
    effectSummary: '+12 Shooting, +12 Heading, +10 Long Shots (85 matches)',
    effect: '+12 Shooting, +12 Heading, +10 Long Shots',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { shooting: 12, heading: 12, longShots: 10 },
  },
  {
    id: 'eq_aerial_dominance',
    name: 'Aerial Dominance System',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Spring-assist insoles and reinforced collar for towering aerial dominance.',
    effectSummary: '+15 Heading, +10 Position, +10 Strength (85 matches)',
    effect: '+15 Heading, +10 Position, +10 Strength',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { heading: 15, positioning: 10, strength: 10 },
  },
  {
    id: 'eq_lockdown_defender',
    name: 'Lockdown Defender Boots',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'High-traction bladed studs that anchor defensive tackles and block passing lanes.',
    effectSummary: '+15 Tackling, +12 Marking (85 matches)',
    effect: '+15 Tackling, +12 Marking',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { tackling: 15, marking: 12 },
  },
  {
    id: 'eq_defensive_reading',
    name: 'Defensive Reading System',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Lightweight reactive boots designed for rapid interception steps and shape control.',
    effectSummary: '+15 Interceptions, +12 Position (85 matches)',
    effect: '+15 Interceptions, +12 Position',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { interceptions: 15, positioning: 12 },
  },
  {
    id: 'eq_complete_defender',
    name: 'Complete Defender System',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'The ultimate defensive fortress kit combining tackling power, tight marking, and interceptions.',
    effectSummary: '+12 Tackling, +12 Marking, +12 Interceptions (85 matches)',
    effect: '+12 Tackling, +12 Marking, +12 Interceptions',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { tackling: 12, marking: 12, interceptions: 12 },
  },
  {
    id: 'eq_elite_positioning',
    name: 'Elite Positioning System',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Ergonomic footwear that reduces movement lag and keeps you always in the right zone.',
    effectSummary: '+15 Position, +10 Interceptions (85 matches)',
    effect: '+15 Position, +10 Interceptions',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { positioning: 15, interceptions: 10 },
  },
  {
    id: 'eq_rapid_reaction',
    name: 'Rapid Reaction System',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Ultra-responsive low-profile chassis for lightning-quick loose ball reactions.',
    effectSummary: '+15 Reaction, +10 Position (85 matches)',
    effect: '+15 Reaction, +10 Position',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { reactions: 15, positioning: 10 },
  },
  {
    id: 'eq_ice_cold_kit',
    name: 'Ice-Cold Match Kit',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Breathable cooling matchwear that maintains mental calmness under maximum stadium pressure.',
    effectSummary: '+15 Composure, +10 Reaction (85 matches)',
    effect: '+15 Composure, +10 Reaction',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { composure: 15, reactions: 10 },
  },
  {
    id: 'eq_big_game_system',
    name: 'Big-Game System',
    category: 'pro_equipment',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Championship-proven equipment package tailored for derby and final showdowns.',
    effectSummary: '+12 Composure, +12 Position (85 matches)',
    effect: '+12 Composure, +12 Position',
    matchDuration: 85,
    durability: { current: 85, max: 85 },
    availableStock: 1,
    maxStock: 1,
    statBonuses: { composure: 12, positioning: 12 },
  },
];

// ==========================================
// 5. COSMETICS (Special Hairstyles & Dyes)
// ==========================================
export const SPECIAL_HAIR_ITEMS: StoreUpgradeItem[] = [
  {
    id: 'hair_el_shaarawy',
    name: "Faraon's Crest",
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'el-shaarawy-spikes',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Signature aerodynamic spiked crest with razor slit temple styling.',
    effectSummary: '+2 Shooting, +2 Dribbling, +2 Pace',
    effect: '+2 Shooting, +2 Dribbling, +2 Pace',
    statBonuses: { shooting: 2, dribbling: 2, pace: 2 },
  },
  {
    id: 'hair_taribo_west',
    name: "Nigeria's Horns",
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'taribo-west',
    tier: 2,
    coinPrice: 150,
    costEuros: 50000,
    description: 'Iconic emerald braided dual horn knots tied with vibrant ribbons.',
    effectSummary: '+2 Stamina, +2 Pace, +2 Crossing, +2 Marking',
    effect: '+2 Stamina, +2 Pace, +2 Crossing, +2 Marking',
    statBonuses: { stamina: 2, pace: 2, crossing: 2, marking: 2 },
  },
  {
    id: 'hair_valderrama',
    name: 'Playmaking Afro',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'valderrama-afro',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Golden voluminous afro embodying legendary vision, retention, and passing.',
    effectSummary: '+5 Long Pass, +5 Short Pass, +5 Retention',
    effect: '+5 Long Pass, +5 Short Pass, +5 Retention',
    statBonuses: { longPass: 5, shortPass: 5, retention: 5 },
  },
  {
    id: 'hair_davids_goggles',
    name: 'Elite Box to Box Tools',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'davids-goggles',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Signature dreads combined with high-tempo orange tactical protective goggles.',
    effectSummary: '+5 Stamina, +5 Tackling, +5 Long Shots',
    effect: '+5 Stamina, +5 Tackling, +5 Long Shots',
    statBonuses: { stamina: 5, tackling: 5, longShots: 5 },
  },
  {
    id: 'hair_pogba_razor',
    name: '100M Midfield Star',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'pogba-razor',
    tier: 3,
    coinPrice: 400,
    costEuros: 250000,
    description: 'Precision-etched side razor pattern with cyan dye highlights for dynamic midfielders.',
    effectSummary: '+5 Long Pass, +5 Strength, +15 Long Shots',
    effect: '+5 Long Pass, +5 Strength, +15 Long Shots',
    statBonuses: { longPass: 5, strength: 5, longShots: 15 },
  },
  {
    id: 'hair_beckham_mohawk',
    name: 'British Star',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'beckham-mohawk',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Legendary 2002 blonde mohawk engineered for immaculate dead-ball delivery.',
    effectSummary: '+15 Crossing, +10 Long Pass, +10 Long Shots',
    effect: '+15 Crossing, +10 Long Pass, +10 Long Shots',
    statBonuses: { crossing: 15, longPass: 10, longShots: 10 },
  },
  {
    id: 'hair_cucurella_afro',
    name: 'Haaland Tiembla',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'cucurella-afro',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Massive wild afro curls that intimidate the world’s most feared goalscorers.',
    effectSummary: '+10 Tackling, +10 Marking, +10 Interception',
    effect: '+10 Tackling, +10 Marking, +10 Interception',
    statBonuses: { tackling: 10, marking: 10, interceptions: 10 },
  },
  {
    id: 'hair_vidal_crest',
    name: 'Austral Crest',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'vidal-crest',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    description: 'Aggressive warrior crest with razor-sharp side tribal geometry.',
    effectSummary: '+15 Tackling, +15 Stamina, +10 Positioning, +5 Shooting, +5 Heading',
    effect: '+15 Tackling, +15 Stamina, +10 Positioning, +5 Shooting, +5 Heading',
    statBonuses: { tackling: 15, stamina: 15, positioning: 10, shooting: 5, heading: 5 },
  },
  {
    id: 'hair_ronaldo_noodle',
    name: 'Mr. Champions',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'ronaldo-noodle',
    tier: 4,
    coinPrice: 1000,
    costEuros: 1000000,
    isChampionsLeagueOnly: true,
    description: 'Golden noodle curls activating legendary finishing in Champions League matches.',
    effectSummary: 'Champions League ONLY: +15 Shooting, +15 Positioning, +15 Composure, +15 Heading',
    effect: 'Champions League ONLY: +15 Shooting, +15 Positioning, +15 Composure, +15 Heading',
    statBonuses: { shooting: 15, positioning: 15, composure: 15, heading: 15 },
  },
  {
    id: 'hair_puyol_curly',
    name: 'Spanish Lion',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'puyol-curly',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Legendary curly mane embodying unmatched defensive leadership and courage.',
    effectSummary: '+10 Stamina, +10 Pace, +15 Tackling, +15 Heading',
    effect: '+10 Stamina, +10 Pace, +15 Tackling, +15 Heading',
    statBonuses: { stamina: 10, pace: 10, tackling: 15, heading: 15 },
  },
  {
    id: 'hair_neymar_mohawk',
    name: 'Brazilian Youngstar',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'neymar-mohawk',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Blonde crest mohawk that lit up Brazilian stadiums with samba flair.',
    effectSummary: '+20 Dribbling, +15 Ball Control, +10 Pace',
    effect: '+20 Dribbling, +15 Ball Control, +10 Pace',
    statBonuses: { dribbling: 20, ballControl: 15, pace: 10 },
  },
  {
    id: 'hair_r9_2002',
    name: 'Phenomenal Hair',
    category: 'special_hair',
    cosmeticType: 'special_hair',
    specialHairType: 'r9-2002',
    tier: 5,
    coinPrice: 2500,
    costEuros: 10000000,
    description: 'Iconic 2002 World Cup shaved cut with the legendary front crescent tuft worn by Ronaldo R9 in their historic title triumph.',
    effectSummary: '+15 Shooting, +15 Positioning, +15 Pace, +15 Dribbling',
    effect: '+15 Shooting, +15 Positioning, +15 Pace, +15 Dribbling',
    statBonuses: { shooting: 15, positioning: 15, pace: 15, dribbling: 15 },
  },
];

// ==========================================
// 6. UNLOCKABLE TATTOOS (Tiers 1 to 5 in order, Min Age 18)
// ==========================================
export const TATTOO_STORE_ITEMS: StoreUpgradeItem[] = [
  // --- NECK TATTOOS ---
  {
    id: 'tat_neck_script',
    name: 'Script Lettering (Neck)',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'script',
    tier: 1,
    minAge: 18,
    coinPrice: 50,
    costEuros: 10000,
    badFameBonus: 5,
    statBonuses: { composure: 1 },
    description: 'Minimalist cursive calligraphy running along the collar line.',
    effectSummary: '+5 Bad Fame • +1 Composure (Equipped)',
    effect: 'Unlock Script Lettering Neck Tattoo',
  },
  {
    id: 'tat_neck_rose',
    name: 'Rose Neck Tattoo',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'rose',
    tier: 2,
    minAge: 18,
    coinPrice: 150,
    costEuros: 35000,
    badFameBonus: 10,
    statBonuses: { composure: 3 },
    description: 'Detailed blooming crimson rose placed elegantly along the throat.',
    effectSummary: '+10 Bad Fame • +3 Composure (Equipped)',
    effect: 'Unlock Rose Neck Tattoo',
  },
  {
    id: 'tat_neck_wings',
    name: 'Winged Crest Neck Tattoo',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'wings',
    tier: 3,
    minAge: 18,
    coinPrice: 350,
    costEuros: 100000,
    badFameBonus: 15,
    statBonuses: { composure: 5 },
    description: 'Majestic dual angel wings fanning symmetrically across the neck.',
    effectSummary: '+15 Bad Fame • +5 Composure (Equipped)',
    effect: 'Unlock Winged Crest Neck Tattoo',
  },
  {
    id: 'tat_neck_tribal',
    name: 'Tribal Neck Tattoo',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'tribal',
    tier: 4,
    minAge: 18,
    coinPrice: 600,
    costEuros: 250000,
    badFameBonus: 20,
    statBonuses: { composure: 10 },
    description: 'Intricate tribal markings extending across both sides of the neck.',
    effectSummary: '+20 Bad Fame • +10 Composure (Equipped)',
    effect: 'Unlock Tribal Neck Tattoo',
  },
  {
    id: 'tat_neck_blackout',
    name: 'Blackout Neck Tattoo',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'blackout',
    tier: 5,
    minAge: 18,
    coinPrice: 1200,
    costEuros: 750000,
    badFameBonus: 20,
    statBonuses: { composure: 30 },
    description: 'Heavy solid blackout neck ink embodying intense pitch aura.',
    effectSummary: '+20 Bad Fame • +30 Composure (Equipped)',
    effect: 'Unlock Blackout Neck Tattoo',
  },

  // --- ARM SLEEVE TATTOOS ---
  {
    id: 'tat_arm_double_stripe',
    name: 'Double Stripe Arm Band',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'double-stripe',
    tier: 1,
    minAge: 18,
    coinPrice: 60,
    costEuros: 15000,
    statBonuses: { shortPass: 1 },
    description: 'Classic dual athletic stripe band tattoo around forearm.',
    effectSummary: '+1 Short Pass (Equipped)',
    effect: 'Unlock Double Stripe Arm Band',
  },
  {
    id: 'tat_arm_script_sleeve',
    name: 'Script / Name Sleeve',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'script-sleeve',
    tier: 2,
    minAge: 18,
    coinPrice: 180,
    costEuros: 45000,
    statBonuses: { dribbling: 3 },
    description: 'Vertical name and motivational calligraphy down the arm.',
    effectSummary: '+3 Dribbling (Equipped)',
    effect: 'Unlock Script / Name Arm Sleeve',
  },
  {
    id: 'tat_arm_tribal',
    name: 'Tribal Arm Sleeve',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'tribal',
    tier: 3,
    minAge: 18,
    coinPrice: 400,
    costEuros: 125000,
    statBonuses: { ballControl: 5 },
    description: 'Polynesian-inspired sharp tribal patterns covering the arm.',
    effectSummary: '+5 Ball Control (Equipped)',
    effect: 'Unlock Tribal Arm Sleeve',
  },
  {
    id: 'tat_arm_mandala',
    name: 'Floral Mandala Sleeve',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'mandala-sleeve',
    tier: 4,
    minAge: 18,
    coinPrice: 800,
    costEuros: 350000,
    statBonuses: { longPass: 10 },
    description: 'Intricate multi-color geometric mandala full sleeve.',
    effectSummary: '+10 Long Pass (Equipped)',
    effect: 'Unlock Floral Mandala Sleeve',
  },
  {
    id: 'tat_arm_blackout',
    name: 'Blackout Arm Sleeve',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'blackout-sleeve',
    tier: 5,
    minAge: 18,
    coinPrice: 1400,
    costEuros: 800000,
    badFameBonus: 10,
    statBonuses: { strength: 15 },
    description: 'Full blackout ink coverage across the arm.',
    effectSummary: '+10 Bad Fame • +15 Strength (Equipped)',
    effect: 'Unlock Blackout Arm Sleeve',
  },

  // --- FACE TATTOOS ---
  {
    id: 'tat_face_star',
    name: 'Cheek Star Tattoo',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'star',
    tier: 1,
    minAge: 18,
    coinPrice: 75,
    costEuros: 20000,
    badFameBonus: 10,
    statBonuses: { retention: 1 },
    description: 'Subtle minimalist star tattoo beneath the cheekbone.',
    effectSummary: '+10 Bad Fame • +1 Retention (Equipped)',
    effect: 'Unlock Cheek Star Tattoo',
  },
  {
    id: 'tat_face_script',
    name: 'Cheek Script Tattoo',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'script-cheek',
    tier: 2,
    minAge: 18,
    coinPrice: 200,
    costEuros: 60000,
    badFameBonus: 20,
    statBonuses: { marking: 3 },
    description: 'Fine cursive script lettering contoured along the jawline.',
    effectSummary: '+20 Bad Fame • +3 Marking (Equipped)',
    effect: 'Unlock Cheek Script Tattoo',
  },
  {
    id: 'tat_face_crown',
    name: 'Temple Crown Tattoo',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'crown-temple',
    tier: 3,
    minAge: 18,
    coinPrice: 450,
    costEuros: 150000,
    badFameBonus: 30,
    statBonuses: { interceptions: 5 },
    description: 'Regal 3-point crown etched onto the temple for champion mentality.',
    effectSummary: '+30 Bad Fame • +5 Interceptions (Equipped)',
    effect: 'Unlock Temple Crown Tattoo',
  },
  {
    id: 'tat_face_heart',
    name: 'Heart Face Tattoo',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'heart',
    tier: 4,
    minAge: 18,
    coinPrice: 800,
    costEuros: 350000,
    badFameBonus: 40,
    statBonuses: { reactions: 10 },
    description: 'Bold under-eye cheek heart tattoo showing rebellious style.',
    effectSummary: '+40 Bad Fame • +10 Reactions (Equipped)',
    effect: 'Unlock Heart Face Tattoo',
  },
  {
    id: 'tat_face_cross',
    name: 'Under-Eye Cross Tattoo',
    category: 'cosmetics',
    cosmeticType: 'tattoo',
    cosmeticValue: 'under-eye-cross',
    tier: 5,
    minAge: 18,
    coinPrice: 1500,
    costEuros: 800000,
    badFameBonus: 40,
    statBonuses: { tackling: 15 },
    description: 'Bold under-eye Latin cross tattoo giving a fearless edge.',
    effectSummary: '+40 Bad Fame • +15 Tackling (Equipped)',
    effect: 'Unlock Under-Eye Cross Tattoo',
  },
];

// ==========================================
// 6B. UNLOCKABLE FACIAL HAIR (Age-Gated Tiers)
// ==========================================
export const FACIAL_HAIR_STORE_ITEMS: StoreUpgradeItem[] = [
  {
    id: 'fh_pubescent_moustache',
    name: 'Pubescent Moustache',
    category: 'cosmetics',
    cosmeticType: 'facial_hair',
    cosmeticValue: 'pubescent-moustache',
    tier: 1,
    minAge: 10,
    coinPrice: 0,
    costEuros: 0,
    fameBonus: 1,
    description: 'Very light teenage mustache showing the early signs of youth progression.',
    effectSummary: '+1 Fame (Unlocked)',
    effect: 'Unlock Pubescent Moustache (Age 10+)',
    unlocked: true,
  },
  {
    id: 'fh_3_day_stubble',
    name: '3-Day Stubble',
    category: 'cosmetics',
    cosmeticType: 'facial_hair',
    cosmeticValue: '3-day-beard',
    tier: 2,
    minAge: 16,
    coinPrice: 80,
    costEuros: 20000,
    statBonuses: { strength: 1 },
    description: 'Rugged 3-day designer stubble giving an athletic edge.',
    effectSummary: '+1 Strength (Equipped)',
    effect: 'Unlock 3-Day Stubble (Age 16+)',
  },
  {
    id: 'fh_well_kept',
    name: 'Well-Kept Beard',
    category: 'cosmetics',
    cosmeticType: 'facial_hair',
    cosmeticValue: 'well-kept',
    tier: 3,
    minAge: 18,
    coinPrice: 250,
    costEuros: 75000,
    statBonuses: { strength: 5 },
    description: 'Sharp, manicured professional beard crafted with barber precision.',
    effectSummary: '+5 Strength (Equipped)',
    effect: 'Unlock Well-Kept Beard (Age 18+)',
  },
  {
    id: 'fh_chin_strap',
    name: 'Chin Strap',
    category: 'cosmetics',
    cosmeticType: 'facial_hair',
    cosmeticValue: 'chin-strap',
    tier: 3,
    minAge: 18,
    coinPrice: 250,
    costEuros: 75000,
    statBonuses: { crossing: 5 },
    description: 'Crisp chin-line beard strap popular with modern wingbacks.',
    effectSummary: '+5 Crossing (Equipped)',
    effect: 'Unlock Chin Strap (Age 18+)',
  },
  {
    id: 'fh_goatee',
    name: 'Goatee',
    category: 'cosmetics',
    cosmeticType: 'facial_hair',
    cosmeticValue: 'goatee',
    tier: 3,
    minAge: 18,
    coinPrice: 250,
    costEuros: 75000,
    statBonuses: { positioning: 5 },
    description: 'Classic sculpted goatee providing a confident veteran aura.',
    effectSummary: '+5 Positioning (Equipped)',
    effect: 'Unlock Goatee (Age 18+)',
  },
  {
    id: 'fh_mutton_chops',
    name: 'Mutton Chops',
    category: 'cosmetics',
    cosmeticType: 'facial_hair',
    cosmeticValue: 'mutton-chops',
    tier: 4,
    minAge: 18,
    coinPrice: 600,
    costEuros: 250000,
    statBonuses: { strength: 10 },
    description: 'Bold sideburn beard chops embodying raw physical power.',
    effectSummary: '+10 Strength (Equipped)',
    effect: 'Unlock Mutton Chops (Age 18+)',
  },
  {
    id: 'fh_wild_beard',
    name: 'Wild Beard',
    category: 'cosmetics',
    cosmeticType: 'facial_hair',
    cosmeticValue: 'wild-beard',
    tier: 4,
    minAge: 18,
    coinPrice: 600,
    costEuros: 250000,
    statBonuses: { heading: 10 },
    description: 'Thick warrior full beard commanding aerial dominance.',
    effectSummary: '+10 Heading (Equipped)',
    effect: 'Unlock Wild Beard (Age 18+)',
  },
  {
    id: 'fh_royal_beard',
    name: 'Royal Beard',
    category: 'cosmetics',
    cosmeticType: 'facial_hair',
    cosmeticValue: 'royal-beard',
    tier: 5,
    minAge: 18,
    coinPrice: 2000,
    costEuros: 1000000,
    description: 'Legendary royal imperial beard fit for football royalty.',
    effectSummary: '+18 Stat Points (Equipped, Distributed Sequentially < 99)',
    effect: 'Unlock Royal Beard (Age 18+)',
  },
];

// ==========================================
// 6C. UNLOCKABLE ACCESSORIES
// ==========================================
export const ACCESSORY_STORE_ITEMS: StoreUpgradeItem[] = [
  // Eyewear
  {
    id: 'acc_protective_mask',
    name: 'Protective Face Mask',
    category: 'cosmetics',
    cosmeticType: 'headwear',
    cosmeticValue: 'protective-mask',
    tier: 5,
    coinPrice: STORE_PRICING.tier5.coins,
    costEuros: STORE_PRICING.tier5.cash,
    injuryRiskReduction: 50,
    description: 'Elite carbon-fiber protective face mask that prevents facial & nasal re-injuries.',
    effectSummary: '-50% Injury Risk when equipped',
    effect: 'Unlock Protective Face Mask (-50% Injury Risk when equipped)',
  },
  {
    id: 'acc_sports_glasses',
    name: 'Sports Glasses',
    category: 'cosmetics',
    cosmeticType: 'headwear',
    cosmeticValue: 'sports-glasses',
    tier: 4,
    coinPrice: STORE_PRICING.tier4.coins,
    costEuros: STORE_PRICING.tier4.cash,
    statBonuses: { shortPass: 10, longPass: 10, crossing: 10 },
    description: 'Iconic aerodynamic wraparound sports goggles enhancing vision precision.',
    effectSummary: '+10 Short Pass, +10 Long Pass, +10 Crossing when equipped',
    effect: 'Unlock Sports Glasses (+10 Short Pass, +10 Long Pass, +10 Crossing when equipped)',
  },
  {
    id: 'acc_classic_glasses',
    name: 'Classic Glasses',
    category: 'cosmetics',
    cosmeticType: 'headwear',
    cosmeticValue: 'classic-glasses',
    tier: 2,
    coinPrice: STORE_PRICING.tier2.coins,
    costEuros: STORE_PRICING.tier2.cash,
    description: 'Elegant lightweight designer frames for refined style.',
    effectSummary: 'Cosmetic: Classic Eyewear',
    effect: 'Unlock Classic Glasses',
  },

  // Headwear
  {
    id: 'acc_performance_band',
    name: 'Performance Band',
    category: 'cosmetics',
    cosmeticType: 'headwear',
    cosmeticValue: 'performance-band',
    tier: 3,
    coinPrice: STORE_PRICING.tier3.coins,
    costEuros: STORE_PRICING.tier3.cash,
    statBonuses: { pace: 5, strength: 5, longShots: 5 },
    description: 'Aerodynamic silicone performance band optimizing focus and acceleration.',
    effectSummary: '+5 Pace, +5 Strength, +5 Long Shots when equipped',
    effect: 'Unlock Performance Band (+5 Pace, +5 Strength, +5 Long Shots when equipped)',
  },
  {
    id: 'acc_headband',
    name: 'Sports Headband',
    category: 'cosmetics',
    cosmeticType: 'headwear',
    cosmeticValue: 'headband',
    tier: 2,
    coinPrice: STORE_PRICING.tier2.coins,
    costEuros: STORE_PRICING.tier2.cash,
    statBonuses: { tackling: 3, retention: 3, composure: 3, reactions: 3 },
    description: 'Elastic athletic headband keeping sweat away from eyes and stabilizing focus.',
    effectSummary: '+3 Tackling, +3 Retention, +3 Composure, +3 Reactions when equipped',
    effect: 'Unlock Sports Headband (+3 Tackling, +3 Retention, +3 Composure, +3 Reactions when equipped)',
  },

  // Earrings
  {
    id: 'acc_earring_gem',
    name: 'Gem / Diamond Earrings',
    category: 'cosmetics',
    cosmeticType: 'earring',
    cosmeticValue: 'gem',
    tier: 5,
    coinPrice: STORE_PRICING.tier5.coins,
    costEuros: STORE_PRICING.tier5.cash,
    fameBonus: 100,
    statBonuses: { retention: 20 },
    description: 'Brilliant diamond/gemstone earrings with customizable jewel tint.',
    effectSummary: '+100 Fame (Purchased) • +20 Retention when equipped',
    effect: 'Unlock Gem Earrings (+100 Fame, +20 Retention when equipped)',
  },
  {
    id: 'acc_earring_large_barbell',
    name: 'Large Barbell Earrings',
    category: 'cosmetics',
    cosmeticType: 'earring',
    cosmeticValue: 'large-barbell',
    tier: 2,
    coinPrice: STORE_PRICING.tier2.coins,
    costEuros: STORE_PRICING.tier2.cash,
    statBonuses: { composure: 10 },
    description: 'Industrial heavy metallic large barbell earrings.',
    effectSummary: '+10 Composure when equipped',
    effect: 'Unlock Large Barbell Earrings (+10 Composure when equipped)',
  },
  {
    id: 'acc_earring_small_barbell',
    name: 'Small Barbell Earrings',
    category: 'cosmetics',
    cosmeticType: 'earring',
    cosmeticValue: 'small-barbell',
    tier: 1,
    coinPrice: STORE_PRICING.tier1.coins,
    costEuros: STORE_PRICING.tier1.cash,
    statBonuses: { reactions: 5 },
    description: 'Minimalist titanium barbell studs.',
    effectSummary: '+5 Reactions when equipped',
    effect: 'Unlock Small Barbell Earrings (+5 Reactions when equipped)',
  },
  {
    id: 'acc_earring_gold',
    name: 'Gold Earrings',
    category: 'cosmetics',
    cosmeticType: 'earring',
    cosmeticValue: 'gold',
    tier: 3,
    coinPrice: STORE_PRICING.tier3.coins,
    costEuros: STORE_PRICING.tier3.cash,
    description: '18k solid gold hoop/stud earrings.',
    effectSummary: 'Cosmetic: Gold Earrings',
    effect: 'Unlock Gold Earrings',
  },
  {
    id: 'acc_earring_silver',
    name: 'Silver Earrings',
    category: 'cosmetics',
    cosmeticType: 'earring',
    cosmeticValue: 'silver',
    tier: 1,
    coinPrice: STORE_PRICING.tier1.coins,
    costEuros: STORE_PRICING.tier1.cash,
    description: 'Clean polished silver stud earrings.',
    effectSummary: 'Cosmetic: Silver Earrings',
    effect: 'Unlock Silver Earrings',
  },
  {
    id: 'acc_earring_steel',
    name: 'Steel Earrings',
    category: 'cosmetics',
    cosmeticType: 'earring',
    cosmeticValue: 'steel',
    tier: 1,
    coinPrice: STORE_PRICING.tier1.coins,
    costEuros: STORE_PRICING.tier1.cash,
    description: 'Industrial matte steel stud earrings.',
    effectSummary: 'Cosmetic: Steel Earrings',
    effect: 'Unlock Steel Earrings',
  },

  // Necklaces
  {
    id: 'acc_necklace_diamonds',
    name: 'Diamond-Encrusted Gold Chain',
    category: 'cosmetics',
    cosmeticType: 'necklace',
    cosmeticValue: 'diamonds-incrusted',
    tier: 5,
    coinPrice: STORE_PRICING.tier5.coins,
    costEuros: STORE_PRICING.tier5.cash,
    fameBonus: 100,
    statBonuses: { dribbling: 15, ballControl: 15, longPass: 15, longShots: 15 },
    description: 'Exquisite 24k solid gold curb chain encrusted with brilliant-cut diamonds.',
    effectSummary: '+100 Fame (Purchased) • +15 Dribbling, +15 Ball Control, +15 Long Pass, +15 Long Shots when equipped',
    effect: 'Unlock Diamond-Encrusted Gold Chain (+100 Fame, +15 Dribbling, +15 Ball Control, +15 Long Pass, +15 Long Shots when equipped)',
  },
  {
    id: 'acc_necklace_gold',
    name: 'Gold Necklace',
    category: 'cosmetics',
    cosmeticType: 'necklace',
    cosmeticValue: 'gold-chain',
    tier: 4,
    coinPrice: STORE_PRICING.tier4.coins,
    costEuros: STORE_PRICING.tier4.cash,
    statBonuses: { shooting: 10, dribbling: 10, retention: 10, positioning: 10 },
    description: 'Heavy 18k solid gold curb chain necklace.',
    effectSummary: '+10 Shooting, +10 Dribbling, +10 Retention, +10 Positioning when equipped',
    effect: 'Unlock Gold Necklace (+10 Shooting, +10 Dribbling, +10 Retention, +10 Positioning when equipped)',
  },
  {
    id: 'acc_necklace_silver',
    name: 'Silver Necklace',
    category: 'cosmetics',
    cosmeticType: 'necklace',
    cosmeticValue: 'silver-chain',
    tier: 3,
    coinPrice: STORE_PRICING.tier3.coins,
    costEuros: STORE_PRICING.tier3.cash,
    statBonuses: { longPass: 5, shortPass: 5, shooting: 5, longShots: 5 },
    description: 'Sterling silver Cuban link chain necklace.',
    effectSummary: '+5 Long Pass, +5 Short Pass, +5 Shooting, +5 Long Shots when equipped',
    effect: 'Unlock Silver Necklace (+5 Long Pass, +5 Short Pass, +5 Shooting, +5 Long Shots when equipped)',
  },
  {
    id: 'acc_necklace_dog_tags',
    name: 'Military Dog Tag Necklace',
    category: 'cosmetics',
    cosmeticType: 'necklace',
    cosmeticValue: 'dog-tags',
    tier: 2,
    coinPrice: STORE_PRICING.tier2.coins,
    costEuros: STORE_PRICING.tier2.cash,
    statBonuses: { composure: 15 },
    description: 'Stainless steel dual military dog tags with ball chain.',
    effectSummary: '+15 Composure when equipped',
    effect: 'Unlock Military Dog Tag Necklace (+15 Composure when equipped)',
  },
];

// ==========================================
// 7. UNLOCKABLE HAIR DYES
// ==========================================
export const HAIR_DYE_STORE_ITEMS: StoreUpgradeItem[] = [
  {
    id: 'dye_silver_white',
    name: 'Silver White Hair Dye',
    category: 'cosmetics',
    cosmeticType: 'hair_dye',
    cosmeticValue: '#cbd5e1',
    tier: 2,
    coinPrice: 150,
    costEuros: 40000,
    description: 'Metallic silver-white dye for an icy futuristic aesthetic.',
    effectSummary: 'Cosmetic: Silver White Hair Dye',
    effect: 'Unlock Silver White Hair Dye',
  },
  {
    id: 'dye_platinum',
    name: 'Platinum Hair Dye',
    category: 'cosmetics',
    cosmeticType: 'hair_dye',
    cosmeticValue: '#e5e4e2',
    tier: 2,
    coinPrice: 150,
    costEuros: 40000,
    description: 'Bright bleached platinum dye popular with superstar wingers.',
    effectSummary: 'Cosmetic: Platinum Hair Dye',
    effect: 'Unlock Platinum Hair Dye',
  },
  {
    id: 'dye_red',
    name: 'Crimson Red Hair Dye',
    category: 'cosmetics',
    cosmeticType: 'hair_dye',
    cosmeticValue: '#ef4444',
    tier: 2,
    coinPrice: 150,
    costEuros: 30000,
    description: 'Fiery crimson red hair dye.',
    effectSummary: 'Cosmetic: Red Hair Dye',
    effect: 'Unlock Red Hair Dye',
  },
  {
    id: 'dye_orange',
    name: 'Orange Hair Dye',
    category: 'cosmetics',
    cosmeticType: 'hair_dye',
    cosmeticValue: '#f97316',
    tier: 2,
    coinPrice: 150,
    costEuros: 30000,
    description: 'Vibrant neon orange hair dye.',
    effectSummary: 'Cosmetic: Orange Hair Dye',
    effect: 'Unlock Orange Hair Dye',
  },
  {
    id: 'dye_yellow',
    name: 'Electric Yellow Hair Dye',
    category: 'cosmetics',
    cosmeticType: 'hair_dye',
    cosmeticValue: '#ffeb3b',
    tier: 2,
    coinPrice: 150,
    costEuros: 30000,
    description: 'Electric bright yellow hair dye.',
    effectSummary: 'Cosmetic: Yellow Hair Dye',
    effect: 'Unlock Yellow Hair Dye',
  },
  {
    id: 'dye_pink',
    name: 'Neon Pink Hair Dye',
    category: 'cosmetics',
    cosmeticType: 'hair_dye',
    cosmeticValue: '#ff69b4',
    tier: 3,
    coinPrice: 250,
    costEuros: 60000,
    description: 'Showstopping neon pink hair dye.',
    effectSummary: 'Cosmetic: Pink Hair Dye',
    effect: 'Unlock Pink Hair Dye',
  },
  {
    id: 'dye_blue',
    name: 'Electric Cyan / Blue Dye',
    category: 'cosmetics',
    cosmeticType: 'hair_dye',
    cosmeticValue: '#00a2ff',
    tier: 3,
    coinPrice: 250,
    costEuros: 60000,
    description: 'Vibrant azure blue hair dye.',
    effectSummary: 'Cosmetic: Blue Hair Dye',
    effect: 'Unlock Blue Hair Dye',
  },
  {
    id: 'dye_green',
    name: 'Emerald Green Dye',
    category: 'cosmetics',
    cosmeticType: 'hair_dye',
    cosmeticValue: '#00ff66',
    tier: 3,
    coinPrice: 250,
    costEuros: 60000,
    description: 'Vibrant electric emerald green hair dye.',
    effectSummary: 'Cosmetic: Green Hair Dye',
    effect: 'Unlock Green Hair Dye',
  },
];

/**
 * Creates an instance of Bespoke Match Footwear Collection with a random specialization
 */
export function createBespokeFootwearInstance(): StoreUpgradeItem {
  const base = ALL_PRO_EQUIPMENT_ITEMS.find((i) => i.id === 'eq_bespoke_footwear_coll')!;
  const variants: Array<{
    type: 'defensive' | 'creative' | 'offensive';
    label: string;
    stats: Partial<Record<string, number>>;
    summary: string;
  }> = [
    {
      type: 'defensive',
      label: 'Bespoke Footwear (Defensive)',
      stats: { tackling: 8, marking: 8, interceptions: 8 },
      summary: '+8 Tackling, +8 Marking, +8 Interceptions (60 matches)',
    },
    {
      type: 'creative',
      label: 'Bespoke Footwear (Creative)',
      stats: { shortPass: 8, longPass: 8, crossing: 8 },
      summary: '+8 Short Pass, +8 Long Pass, +8 Crossing (60 matches)',
    },
    {
      type: 'offensive',
      label: 'Bespoke Footwear (Offensive)',
      stats: { shooting: 8, longShots: 8, positioning: 8 },
      summary: '+8 Shooting, +8 Long Shots, +8 Position (60 matches)',
    },
  ];
  const picked = variants[Math.floor(Math.random() * variants.length)];
  return {
    ...base,
    id: `eq_bespoke_footwear_${picked.type}_${Date.now()}`,
    name: picked.label,
    equipmentVariant: picked.type,
    statBonuses: picked.stats,
    effectSummary: picked.summary,
    effect: picked.summary,
    matchDuration: 60,
    durability: { current: 60, max: 60 },
  };
}

/**
 * GENERATE PRE-SEASON STORE REPLENISHMENT
 * - Consumables: Add 1 random consumable per tier. If already in store, stack it (+1 stock).
 * - Equipment: Add 1 random equipment per tier. If already in store, stack it (+1 stock).
 * - Season Boosts: Always replenish all season boosts so there is one of each (unlocked: false).
 * - Upgrades: Retain unlocked status (can only be bought once).
 * - Cosmetics: Retain unlocked status.
 */
export function generatePreSeasonStoreReplenishment(previousStore?: StoreUpgradeItem[]): StoreUpgradeItem[] {
  const currentStore = previousStore ? [...previousStore] : [];

  // 1. Replenish Consumables stock: Add 1 random per tier, stack if existing
  const existingConsumables = currentStore.filter((i) => i.category === 'consumables' || i.category === 'consumable');
  const otherItemsNonConsumables = currentStore.filter((i) => i.category !== 'consumables' && i.category !== 'consumable');
  const updatedConsumables = [...existingConsumables];

  for (let t = 1; t <= 5; t++) {
    const tierPool = CONSUMABLES_ITEMS.filter((c) => c.tier === t);
    if (tierPool.length > 0) {
      const picked = tierPool[Math.floor(Math.random() * tierPool.length)];
      const existingIdx = updatedConsumables.findIndex((item) => item.id === picked.id);
      if (existingIdx >= 0) {
        const existing = updatedConsumables[existingIdx];
        const newStock = (existing.availableStock || 0) + 1;
        updatedConsumables[existingIdx] = {
          ...existing,
          availableStock: newStock,
          maxStock: Math.max(existing.maxStock || 1, newStock),
        };
      } else {
        updatedConsumables.push({
          ...picked,
          availableStock: 1,
          maxStock: 1,
          unlocked: false,
        });
      }
    }
  }

  // 2. Replenish Equipment stock: Add 1 random per tier, stack if existing
  const existingEquipment = otherItemsNonConsumables.filter((i) => i.category === 'pro_equipment' || i.category === 'equipment');
  const otherItemsNonEquip = otherItemsNonConsumables.filter((i) => i.category !== 'pro_equipment' && i.category !== 'equipment');
  const updatedEquipment = [...existingEquipment];

  for (let t = 1; t <= 5; t++) {
    const tierPool = ALL_PRO_EQUIPMENT_ITEMS.filter((eq) => eq.tier === t);
    if (tierPool.length > 0) {
      const picked = tierPool[Math.floor(Math.random() * tierPool.length)];
      const existingIdx = updatedEquipment.findIndex((item) => item.id === picked.id);
      if (existingIdx >= 0) {
        const existing = updatedEquipment[existingIdx];
        const newStock = (existing.availableStock || 0) + 1;
        updatedEquipment[existingIdx] = {
          ...existing,
          availableStock: newStock,
          maxStock: Math.max(existing.maxStock || 1, newStock),
        };
      } else {
        updatedEquipment.push({
          ...picked,
          availableStock: 1,
          maxStock: 1,
          durability: { current: picked.matchDuration || 15, max: picked.matchDuration || 15 },
          unlocked: false,
        });
      }
    }
  }

  // 3. Replenish Season Boosts: Always replenish all season boosts (one of each available)
  const freshSeasonBoosts: StoreUpgradeItem[] = SEASON_BOOST_ITEMS.map((sb) => ({
    ...sb,
    unlocked: false,
  }));

  // 4. Upgrades keep their unlocked status if already purchased
  const prevUpgradesMap = new Map(otherItemsNonEquip.filter((i) => i.category === 'upgrade').map((i) => [i.id, i.unlocked]));
  const freshUpgrades: StoreUpgradeItem[] = UPGRADES_ITEMS.map((u) => ({
    ...u,
    unlocked: !!prevUpgradesMap.get(u.id),
  }));

  // 5. Cosmetics retain unlocked state
  const prevCosmeticsMap = new Map(otherItemsNonEquip.filter((i) => i.category === 'special_hair' || i.category === 'cosmetics').map((i) => [i.id, i.unlocked]));
  const freshSpecialHair: StoreUpgradeItem[] = SPECIAL_HAIR_ITEMS.map((sh) => ({
    ...sh,
    unlocked: !!prevCosmeticsMap.get(sh.id),
  }));

  const freshTattoos: StoreUpgradeItem[] = TATTOO_STORE_ITEMS.map((tat) => ({
    ...tat,
    unlocked: !!prevCosmeticsMap.get(tat.id),
  }));

  const freshFacialHair: StoreUpgradeItem[] = FACIAL_HAIR_STORE_ITEMS.map((fh) => ({
    ...fh,
    unlocked: fh.unlocked || !!prevCosmeticsMap.get(fh.id),
  }));

  const freshAccessories: StoreUpgradeItem[] = ACCESSORY_STORE_ITEMS.map((acc) => ({
    ...acc,
    unlocked: !!prevCosmeticsMap.get(acc.id),
  }));

  const freshHairDyes: StoreUpgradeItem[] = HAIR_DYE_STORE_ITEMS.map((dye) => ({
    ...dye,
    unlocked: !!prevCosmeticsMap.get(dye.id),
  }));

  return [
    ...updatedConsumables,
    ...updatedEquipment,
    ...freshUpgrades,
    ...freshSeasonBoosts,
    ...freshSpecialHair,
    ...freshTattoos,
    ...freshFacialHair,
    ...freshAccessories,
    ...freshHairDyes,
  ];
}

export const INITIAL_STORE_ITEMS: StoreUpgradeItem[] = generatePreSeasonStoreReplenishment();

/**
 * Applies Preseason Upgrade effects to player:
 * - Tier 1: Recovery Equipment (+1 Recovery Point every Preseason)
 * - Tier 2: Home Gym (+1 random Physical stat [Pace, Stamina or Strength] every Preseason until retirement)
 * - Tier 3: Professional Kitchen (flat +1 Stamina, +1 Recovery Point every Preseason)
 * - Tier 4: Complete Football Performance Complex (+5 Stat Points every Preseason)
 * - Tier 5: World-Class Football Performance Center (-1 Stat Decay after age 28, +5 Retirement Years)
 * - Chemical Enhancement: Reverts +10 to all stats after 12 months (Preseason)
 */
export function applyPreseasonUpgrades(player: PlayerCardData, storeItems: StoreUpgradeItem[] = []): {
  updatedPlayer: PlayerCardData;
  logs: string[];
} {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const logs: string[] = [];

  const isUpgradeUnlocked = (id: string) => {
    return (
      storeItems.some((i) => i.id === id && i.unlocked) ||
      ((updated as any).unlockedFacilityIds || []).includes(id) ||
      ((updated as any).purchasedStoreItems || []).includes(id)
    );
  };

  const isGk = updated.position === 'GK';
  let detailedOutfield = !isGk ? getOrCreateOutfieldDetailed(updated.stats) : undefined;
  let detailedGk = isGk ? getOrCreateGkDetailed(updated.stats) : undefined;
  let statsModified = false;

  // Recharge Transfer Request Limit at Preseason (Requirement 2)
  updated.transferRequestUsedThisSeason = false;
  updated.requestedTransfer = false;

  // 0. Chemical Enhancement 12-Month Duration Expiration
  if (updated.activeChemicalEnhancementSeason) {
    if (!isGk && detailedOutfield) {
      (Object.keys(detailedOutfield) as Array<keyof typeof detailedOutfield>).forEach((key) => {
        if (typeof detailedOutfield[key] === 'number') {
          (detailedOutfield as any)[key] = Math.max(20, (detailedOutfield[key] || 50) - 10);
        }
      });
      statsModified = true;
    } else if (isGk && detailedGk) {
      (Object.keys(detailedGk) as Array<keyof typeof detailedGk>).forEach((key) => {
        if (typeof detailedGk[key] === 'number') {
          (detailedGk as any)[key] = Math.max(20, (detailedGk[key] || 50) - 10);
        }
      });
      statsModified = true;
    }
    updated.activeChemicalEnhancementSeason = false;
    logs.push('🧪 [Experimental Chemical Enhancement] 12-month season duration concluded. Temporary bonus attributes concluded.');
  }

  // 1. Tier 1: Recovery Equipment (+1 Recovery Point every Preseason)
  if (isUpgradeUnlocked('upg_recovery_equip')) {
    updated.recoveryPoints = (updated.recoveryPoints || 0) + 1;
    logs.push('🏠 [Recovery Equipment] +1 Recovery Point awarded for Preseason recovery.');
  }

  // 2. Tier 2: Home Gym (+1 random Physical stat [Pace, Stamina or Strength] every Preseason until retirement)
  if (isUpgradeUnlocked('upg_home_gym')) {
    const physicalChoices: Array<'pace' | 'stamina' | 'strength'> = ['pace', 'stamina', 'strength'];
    const chosen = physicalChoices[Math.floor(Math.random() * physicalChoices.length)];

    if (!isGk && detailedOutfield) {
      detailedOutfield[chosen] = Math.min(99, (detailedOutfield[chosen] || 50) + 1);
      statsModified = true;
      logs.push(`🏋️‍♂️ [Home Gym] +1 ${chosen.toUpperCase()} awarded from daily home workouts!`);
    } else if (isGk && detailedGk) {
      if (chosen === 'pace') {
        detailedGk.aerialReach = Math.min(99, (detailedGk.aerialReach || 50) + 1);
      } else {
        detailedGk.aerialReach = Math.min(99, (detailedGk.aerialReach || 50) + 1);
      }
      statsModified = true;
      logs.push(`🏋️‍♂️ [Home Gym] +1 ${chosen.toUpperCase()} awarded from home conditioning!`);
    }
  }

  // 3. Tier 3: Professional Kitchen (flat +1 Stamina, +1 Recovery Point every Preseason)
  if (isUpgradeUnlocked('upg_pro_kitchen')) {
    updated.recoveryPoints = (updated.recoveryPoints || 0) + 1;
    if (!isGk && detailedOutfield) {
      detailedOutfield.stamina = Math.min(99, (detailedOutfield.stamina || 50) + 1);
      statsModified = true;
    } else if (isGk && detailedGk) {
      detailedGk.aerialReach = Math.min(99, (detailedGk.aerialReach || 50) + 1);
      statsModified = true;
    }
    logs.push('🥗 [Professional Kitchen] +1 STAMINA & +1 Recovery Point awarded for elite athlete nutrition!');
  }

  // 4. Tier 4: Complete Football Performance Complex (+5 Stat Points every Preseason)
  if (isUpgradeUnlocked('upg_perf_complex')) {
    const currentFree = updated.freeStatPoints !== undefined ? updated.freeStatPoints : (updated.unassignedPoints || 0);
    const newTotal = currentFree + 5;
    updated.freeStatPoints = newTotal;
    updated.unassignedPoints = newTotal;
    logs.push('🏟️ [Complete Football Performance Complex] +5 Free Stat Points awarded for Preseason!');
  }

  // 5. Tier 5: World-Class Football Performance Center (-1 Stat Decay after age 28, +5 Retirement Years)
  if (isUpgradeUnlocked('upg_perf_center')) {
    updated.bonusRetirementYears = 5;
    const baseRetirement = 35;
    if (!updated.retirementAge || updated.retirementAge === baseRetirement) {
      updated.retirementAge = baseRetirement + 5;
    }
    logs.push('🌟 [World-Class Performance Center] Active: Reduces stat decay by 1 point after age 28 (-2 instead of -3) & extends Retirement Age to ' + (updated.retirementAge || 40) + '!');
  }

  // Sync detailed and category stats if any physical attribute changed
  if (statsModified) {
    if (!isGk && detailedOutfield) {
      const syncedStats = syncCategoryStatsFromDetailed(updated.stats, detailedOutfield);
      updated.stats = {
        ...syncedStats,
        detailed: detailedOutfield,
      };
      updated.ovr = calculateWeightedOvr(updated.position, updated.subPosition || updated.position, updated.stats, updated.playStyle);
    } else if (isGk && detailedGk) {
      const syncedStats = syncCategoryStatsFromGkDetailed(updated.stats, detailedGk);
      updated.stats = {
        ...syncedStats,
        gkDetailed: detailedGk,
      };
      updated.ovr = calculateWeightedOvr(updated.position, updated.subPosition || updated.position, updated.stats, updated.playStyle);
    }
  }

  return { updatedPlayer: updated, logs };
}

/**
 * Decrements match duration for all active Pro Equipment items when a match is played.
 * Removes items that hit 0 matches duration.
 */
export function stepProEquipmentMatchDuration(
  activeEquipment: StoreUpgradeItem[]
): {
  remainingEquipment: StoreUpgradeItem[];
  expiredEquipment: StoreUpgradeItem[];
} {
  const remainingEquipment: StoreUpgradeItem[] = [];
  const expiredEquipment: StoreUpgradeItem[] = [];

  (activeEquipment || []).forEach((item) => {
    const currentMatches = item.durability?.current ?? item.matchDuration ?? 1;
    const newMatches = currentMatches - 1;

    if (newMatches <= 0) {
      expiredEquipment.push({
        ...item,
        durability: { current: 0, max: item.durability?.max ?? item.matchDuration ?? 1 },
      });
    } else {
      remainingEquipment.push({
        ...item,
        matchDuration: newMatches,
        durability: { current: newMatches, max: item.durability?.max ?? item.matchDuration ?? 1 },
      });
    }
  });

  return { remainingEquipment, expiredEquipment };
}

/**
 * Calculates aggregate injury risk reduction from active equipment, active season boosts, and taping
 */
export function getActiveInjuryRiskReduction(
  activeEquipment: StoreUpgradeItem[] = [],
  activeSeasonBoosts: StoreUpgradeItem[] = [],
  activeTapingMonthsRemaining: number = 0
): number {
  let totalReduction = 0;

  // Equipment reduction
  activeEquipment.forEach((eq) => {
    if (eq.injuryRiskReduction) {
      totalReduction += eq.injuryRiskReduction;
    }
  });

  // Season Boost reduction
  activeSeasonBoosts.forEach((sb) => {
    if (sb.injuryRiskReduction) {
      totalReduction += sb.injuryRiskReduction;
    }
  });

  // Active Taping reduction
  if (activeTapingMonthsRemaining > 0) {
    totalReduction += 15;
  }

  return Math.min(80, totalReduction); // Cap total injury risk reduction at 80%
}

// Re-export Card Store Packs for unified access
export {
  STARTER_PACKS,
  EPIC_UPGRADE_PACK,
  ALL_STORE_PACKS,
  STORE_PACKS,
} from '../utils/storeCollectionSystem';
export type { StorePackDefinition } from '../utils/storeCollectionSystem';
