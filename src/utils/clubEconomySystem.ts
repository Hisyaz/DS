export * from '../types/clubEconomy';
import {
  ClubFinances,
  ClubFameLevel,
  OwnerType,
  EconomicTier,
  FinancialHealth,
  ClubSponsor,
  ClubRevenue,
  ClubExpenses,
  TransferStrategy,
  FameBenchmarkInfo,
  TransferAffordabilityCheck,
  PlayerAttractionAssessment,
} from '../types/clubEconomy';
import { EditorTeamData } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import { REAL_CLUB_FINANCIAL_REGISTRY } from '../data/realClubPresets';

// ============================================================================
// 1. CLUB FAME SCALE BENCHMARKS & DEFINITIONS (0 to 10)
// ============================================================================

export const CLUB_FAME_BENCHMARKS: Record<number, FameBenchmarkInfo> = {
  0: {
    fame: 0,
    title: 'Neighborhood Club',
    subtitle: 'Amateur / Semi-Pro Local Community',
    description: 'Tiny local club with almost no national or international recognition. Very limited revenue, local neighborhood sponsors, minimal wages, and negligible transfer spending.',
    examples: ['Small district teams', 'Sunday league champions', 'Regional amateur sides'],
    typicalTransferBudgetRange: '€0 – €50K',
    typicalMaxWageWeekly: '€100 – €500/wk',
    typicalAnnualRevenueRange: '€20K – €150K',
    sponsorTiers: 'Local bakery, corner garage, district shop (€5K–€25K/yr)',
    colorClass: 'text-stone-400',
    badgeBg: 'bg-stone-800/80 border-stone-600 text-stone-300',
  },
  1: {
    fame: 1,
    title: 'Local Club',
    subtitle: 'Municipal / Regional Lower Tier',
    description: 'Known mainly within its municipal area or lower regional division. Small commercial footprint, local sponsors, developing or inexpensive talent.',
    examples: ['Town clubs', 'Regional 4th/5th division teams'],
    typicalTransferBudgetRange: '€20K – €150K',
    typicalMaxWageWeekly: '€400 – €1,200/wk',
    typicalAnnualRevenueRange: '€100K – €500K',
    sponsorTiers: 'Regional suppliers, town businesses (€15K–€60K/yr)',
    colorClass: 'text-zinc-400',
    badgeBg: 'bg-zinc-800/80 border-zinc-600 text-zinc-300',
  },
  2: {
    fame: 2,
    title: 'Regional Contender',
    subtitle: 'Semi-Professional / Lower National League',
    description: 'Modest regional following with local derby rivalries. Developing talent pipeline, humble stadium infrastructure, regional sponsors.',
    examples: ['Regional league stalwarts', 'National 3rd tier competitors'],
    typicalTransferBudgetRange: '€100K – €400K',
    typicalMaxWageWeekly: '€1,000 – €2,500/wk',
    typicalAnnualRevenueRange: '€400K – €1.5M',
    sponsorTiers: 'Provincial banks, regional transport (€30K–€120K/yr)',
    colorClass: 'text-slate-400',
    badgeBg: 'bg-slate-800/80 border-slate-600 text-slate-300',
  },
  3: {
    fame: 3,
    title: 'Established Small Pro Club',
    subtitle: 'National Second Tier / Stable Professional',
    description: 'Recognized nationally as a stable professional football organization. Modest wages, dependable domestic sponsorships, occasional player sales to higher tiers.',
    examples: ['EFL League One / Two leaders', 'Spanish Primera RFEF top sides', 'Argentine Primera B Nacional clubs'],
    typicalTransferBudgetRange: '€300K – €1.5M',
    typicalMaxWageWeekly: '€2,500 – €7,000/wk',
    typicalAnnualRevenueRange: '€1.5M – €5.0M',
    sponsorTiers: 'National betting, mid-tier domestic retail (€80K–€350K/yr)',
    colorClass: 'text-teal-400',
    badgeBg: 'bg-teal-950/80 border-teal-600 text-teal-300',
  },
  4: {
    fame: 4,
    title: 'Respected Domestic Club',
    subtitle: 'First-Tier Mid-Table / Second-Tier Giants',
    description: 'Solid domestic profile with loyal fan base. Able to sign seasoned domestic professionals, occasionally make notable transfer purchases, and compete in domestic cups.',
    examples: ['EFL Championship sides', 'Segunda División top teams', 'Argentine Primera mid-table'],
    typicalTransferBudgetRange: '€1.0M – €4.0M',
    typicalMaxWageWeekly: '€5,000 – €16,000/wk',
    typicalAnnualRevenueRange: '€4.0M – €14.0M',
    sponsorTiers: 'National brands, telecom operators (€250K–€1.2M/yr)',
    colorClass: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/80 border-cyan-600 text-cyan-300',
  },
  5: {
    fame: 5,
    title: 'Recognized Traditional Club',
    subtitle: 'Historic Domestic Institution (Benchmark: Gimnasia LP)',
    description: 'A historic club with a meaningful fanbase and national recognition, but limited global prestige. Strong domestic sponsors, competitive domestic wage structure, established home fortress.',
    examples: ['Gimnasia y Esgrima La Plata', "Newell's Old Boys", 'Lanús', 'Rayo Vallecano', 'Empoli', 'Augsburg'],
    typicalTransferBudgetRange: '€2.5M – €9.0M',
    typicalMaxWageWeekly: '€10,000 – €30,000/wk',
    typicalAnnualRevenueRange: '€10.0M – €30.0M',
    sponsorTiers: 'Major national companies, regional banks (€600K–€3.0M/yr)',
    colorClass: 'text-sky-400',
    badgeBg: 'bg-sky-950/80 border-sky-600 text-sky-300',
  },
  6: {
    fame: 6,
    title: 'Strong National Club',
    subtitle: 'Top-Half First Tier / Continental Aspirants',
    description: 'A respected club with significant history, large supporter base, and competitive infrastructure. Strong domestic commercial presence, solid transfer pull in domestic markets.',
    examples: ['Racing Club', 'San Lorenzo', 'Getafe', 'Osasuna', 'Torino', 'Freiburg', 'Feyenoord'],
    typicalTransferBudgetRange: '€6.0M – €25.0M',
    typicalMaxWageWeekly: '€20,000 – €65,000/wk',
    typicalAnnualRevenueRange: '€25.0M – €75.0M',
    sponsorTiers: 'Multinational domestic brands, major airlines (€1.5M–€7.0M/yr)',
    colorClass: 'text-blue-400',
    badgeBg: 'bg-blue-950/80 border-blue-600 text-blue-300',
  },
  7: {
    fame: 7,
    title: 'Major Historic Club',
    subtitle: 'Continental Competitor (Vélez, Estudiantes, Sevilla, Betis, Milan)',
    description: 'Substantial history, recognizable continental brand, and elite football infrastructure. Regular continental participants, high revenue, can attract established stars and elite young talent.',
    examples: ['Vélez Sarsfield', 'Estudiantes LP', 'Boca Juniors', 'River Plate', 'Sevilla FC', 'Real Betis', 'AC Milan', 'AS Roma', 'Porto', 'Benfica', 'Sporting CP'],
    typicalTransferBudgetRange: '€15.0M – €65.0M',
    typicalMaxWageWeekly: '€40,000 – €140,000/wk',
    typicalAnnualRevenueRange: '€60.0M – €220.0M',
    sponsorTiers: 'Global corporations, elite automotive/apparel (€4.0M–€22.0M/yr)',
    colorClass: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/80 border-indigo-600 text-indigo-300',
  },
  8: {
    fame: 8,
    title: 'Major Financial & Global Club',
    subtitle: 'Global Commercial Power (Tottenham, Aston Villa, Atlético)',
    description: 'Enormous financial and broadcasting infrastructure with worldwide brand recognition. Massive transfer budgets, high Premier League / European wages, strong global commercial reach.',
    examples: ['Tottenham Hotspur', 'Aston Villa', 'Newcastle United', 'Chelsea FC', 'Atlético de Madrid', 'Juventus', 'Borussia Dortmund'],
    typicalTransferBudgetRange: '€50.0M – €160.0M',
    typicalMaxWageWeekly: '€90,000 – €280,000/wk',
    typicalAnnualRevenueRange: '€180.0M – €550.0M',
    sponsorTiers: 'Top-tier global conglomerates, financial giants (€15.0M–€55.0M/yr)',
    colorClass: 'text-violet-400',
    badgeBg: 'bg-violet-950/80 border-violet-600 text-violet-300',
  },
  9: {
    fame: 9,
    title: 'Global Elite Club',
    subtitle: 'World Football Power (Liverpool, Man City, PSG, Bayern, Arsenal)',
    description: 'Globally recognized football giants with elite financial, sporting, and marketing resources. Massive global fanbases, world-record transfer capability, magnetic attraction for world-class stars.',
    examples: ['Liverpool FC', 'Manchester City', 'Paris Saint-Germain', 'Bayern München', 'Arsenal FC', 'Inter Milan'],
    typicalTransferBudgetRange: '€90.0M – €260.0M',
    typicalMaxWageWeekly: '€160,000 – €450,000/wk',
    typicalAnnualRevenueRange: '€450.0M – €850.0M',
    sponsorTiers: 'Elite global headline sponsors, sovereign partners (€35.0M–€90.0M/yr)',
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 border-amber-500 text-amber-300',
  },
  10: {
    fame: 10,
    title: 'Absolute Football Superpower',
    subtitle: 'Pinnacle of Football Prestige (Real Madrid, FC Barcelona)',
    description: 'The highest level of football fame, prestige, and global desirability. World-leading commercial revenue, historic mystique, premium sponsors, maximum player motivation to join.',
    examples: ['Real Madrid', 'FC Barcelona'],
    typicalTransferBudgetRange: '€140.0M – €360.0M',
    typicalMaxWageWeekly: '€220,000 – €650,000/wk',
    typicalAnnualRevenueRange: '€750.0M – €1.1B+',
    sponsorTiers: 'Record-shattering global partnerships, world icons (€50.0M–€130.0M/yr)',
    colorClass: 'text-yellow-400',
    badgeBg: 'bg-yellow-950/90 border-yellow-400 text-yellow-300 ring-1 ring-yellow-400/50',
  },
};

// ============================================================================
// 2. REALISTIC TRANSFERMARKT PLAYER VALUATION ENGINE
// ============================================================================

/**
 * Calculates a realistic, non-linear market value for any player in the game.
 * Respects: OVR, Age, Potential, Position, Performance, Reputation, International Status, Contract.
 */
export function calculateRealisticPlayerMarketValue(player: Partial<PlayerCardData>): {
  marketValue: number;
  formattedValue: string;
  weeklyWageEstimate: number;
  formattedWeeklyWage: string;
  annualSalaryEstimate: number;
  details: {
    ageFactor: number;
    positionFactor: number;
    potentialBonus: number;
    ovrBase: number;
    reputationMultiplier: number;
    tierMultiplier: number;
  };
} {
  const ovr = Math.min(99, Math.max(45, player.ovr || player.overallRating || 65));
  const potential = Math.min(99, Math.max(ovr, player.potentialOvr || ovr + 4));
  const age = Math.min(42, Math.max(15, player.age || 22));
  const fame = Math.max(0, player.fame || 0);
  const position = (player.position || 'ST').toUpperCase();
  const contractYears = (player as any)?.accounting?.contractYears || 3;

  // 1. Base Exponential Ability Curve (Transfermarkt benchmark curve)
  // 60 OVR -> ~€400k, 70 OVR -> ~€3M, 80 OVR -> ~€25M, 88 OVR -> ~€85M, 91 OVR -> ~€130M, 94+ OVR -> ~€180M+
  let ovrBase = 0;
  if (ovr < 60) {
    ovrBase = 50000 + (ovr - 45) * 25000;
  } else if (ovr < 70) {
    ovrBase = 425000 * Math.pow(1.22, ovr - 60);
  } else if (ovr < 80) {
    ovrBase = 3200000 * Math.pow(1.24, ovr - 70);
  } else if (ovr < 88) {
    ovrBase = 26000000 * Math.pow(1.17, ovr - 80);
  } else {
    ovrBase = 85000000 * Math.pow(1.12, ovr - 88);
  }

  // 2. Age Factor (Young high-potential players command massive market premiums)
  let ageFactor = 1.0;
  if (age <= 18) {
    ageFactor = 1.45;
  } else if (age <= 21) {
    ageFactor = 1.35;
  } else if (age <= 23) {
    ageFactor = 1.20;
  } else if (age <= 27) {
    ageFactor = 1.05; // Peak athletic prime
  } else if (age <= 30) {
    ageFactor = 0.85;
  } else if (age <= 33) {
    ageFactor = 0.55;
  } else {
    ageFactor = 0.28; // Veteran twilight
  }

  // 3. Potential Gap Premium
  const potGap = Math.max(0, potential - ovr);
  let potentialBonus = 1.0;
  if (age <= 23 && potGap > 0) {
    potentialBonus = 1.0 + (potGap * 0.045 * (24 - age) / 7);
  }

  // 4. Positional Rarity Factor
  let positionFactor = 1.0;
  if (['ST', 'CF'].includes(position)) positionFactor = 1.15;
  else if (['LW', 'RW', 'CAM'].includes(position)) positionFactor = 1.12;
  else if (['CM', 'CDM'].includes(position)) positionFactor = 1.00;
  else if (['CB', 'LB', 'RB'].includes(position)) positionFactor = 0.92;
  else if (['GK'].includes(position)) positionFactor = 0.80;

  // 5. Reputation & International Status Multiplier
  let reputationMultiplier = 1.0;
  if (fame > 0) {
    reputationMultiplier = 1.0 + Math.min(1.2, (fame / 600) * 0.8);
  }

  // 6. Contract Length Leverage
  let contractFactor = 1.0;
  if (contractYears >= 4) contractFactor = 1.15;
  else if (contractYears === 3) contractFactor = 1.05;
  else if (contractYears === 2) contractFactor = 1.00;
  else if (contractYears === 1) contractFactor = 0.70;
  else contractFactor = 0.40;

  let rawValue = ovrBase * ageFactor * potentialBonus * positionFactor * reputationMultiplier * contractFactor;

  // Round to clean football market value steps
  let finalMarketValue = 50000;
  if (rawValue >= 50000000) {
    finalMarketValue = Math.round(rawValue / 1000000) * 1000000;
  } else if (rawValue >= 10000000) {
    finalMarketValue = Math.round(rawValue / 500000) * 500000;
  } else if (rawValue >= 1000000) {
    finalMarketValue = Math.round(rawValue / 100000) * 100000;
  } else {
    finalMarketValue = Math.max(50000, Math.round(rawValue / 25000) * 25000);
  }

  // 7. Realistic Weekly Wage Estimate
  // Base wage from OVR and reputation
  let weeklyWage = 0;
  if (ovr < 60) weeklyWage = 300 + (ovr - 45) * 60;
  else if (ovr < 70) weeklyWage = 1200 + (ovr - 60) * 450;
  else if (ovr < 78) weeklyWage = 6000 + (ovr - 70) * 2500;
  else if (ovr < 84) weeklyWage = 28000 + (ovr - 78) * 12000;
  else if (ovr < 90) weeklyWage = 100000 + (ovr - 84) * 32000;
  else weeklyWage = 290000 + (ovr - 90) * 60000;

  weeklyWage = Math.round((weeklyWage * (1 + Math.min(0.5, fame / 1000))) / 100) * 100;
  const annualSalary = weeklyWage * 52;

  return {
    marketValue: finalMarketValue,
    formattedValue: formatCurrencyEuro(finalMarketValue),
    weeklyWageEstimate: weeklyWage,
    formattedWeeklyWage: `€${weeklyWage.toLocaleString()}/wk`,
    annualSalaryEstimate: annualSalary,
    details: {
      ageFactor: Math.round(ageFactor * 100) / 100,
      positionFactor,
      potentialBonus: Math.round(potentialBonus * 100) / 100,
      ovrBase: Math.round(ovrBase),
      reputationMultiplier: Math.round(reputationMultiplier * 100) / 100,
      tierMultiplier: 1.0,
    },
  };
}

/**
 * Format any Euro value to clean readable string (e.g. €45M, €850K, €35,000)
 */
export function formatCurrencyEuro(amount: number): string {
  if (amount >= 1000000000) {
    const b = (amount / 1000000000).toFixed(2);
    return `€${b.endsWith('.00') ? b.slice(0, -3) : b}B`;
  }
  if (amount >= 1000000) {
    const m = (amount / 1000000).toFixed(1);
    return `€${m.endsWith('.0') ? m.slice(0, -2) : m}M`;
  }
  if (amount >= 1000) {
    const k = (amount / 1000).toFixed(0);
    return `€${k}K`;
  }
  return `€${Math.round(amount).toLocaleString()}`;
}

// ============================================================================
// 3. AUTHENTIC SPONSOR GENERATION BY FAME & COUNTRY
// ============================================================================

interface SponsorTemplate {
  name: string;
  category: ClubSponsor['category'];
  countrySuitability: string[]; // e.g. ['ENG', 'ESP', 'GLOBAL']
  minFame: number;
  maxFame: number;
  baseAnnualMultiplier: number;
}

const SPONSOR_TEMPLATES: SponsorTemplate[] = [
  // GLOBAL & ELITE TIER (Fame 7-10)
  { name: 'Fly Emirates', category: 'main_shirt', countrySuitability: ['GLOBAL', 'ESP', 'ENG', 'ITA', 'FRA', 'GER'], minFame: 7, maxFame: 10, baseAnnualMultiplier: 1.25 },
  { name: 'Spotify', category: 'main_shirt', countrySuitability: ['GLOBAL', 'ESP'], minFame: 9, maxFame: 10, baseAnnualMultiplier: 1.30 },
  { name: 'Etihad Airways', category: 'main_shirt', countrySuitability: ['GLOBAL', 'ENG'], minFame: 8, maxFame: 10, baseAnnualMultiplier: 1.35 },
  { name: 'Standard Chartered', category: 'main_shirt', countrySuitability: ['GLOBAL', 'ENG'], minFame: 8, maxFame: 10, baseAnnualMultiplier: 1.20 },
  { name: 'Qatar Airways', category: 'main_shirt', countrySuitability: ['GLOBAL', 'FRA', 'ESP', 'ITA'], minFame: 8, maxFame: 10, baseAnnualMultiplier: 1.30 },
  { name: 'Adidas Football', category: 'kit_supplier', countrySuitability: ['GLOBAL'], minFame: 6, maxFame: 10, baseAnnualMultiplier: 1.40 },
  { name: 'Nike Athletic', category: 'kit_supplier', countrySuitability: ['GLOBAL'], minFame: 6, maxFame: 10, baseAnnualMultiplier: 1.35 },
  { name: 'Puma Performance', category: 'kit_supplier', countrySuitability: ['GLOBAL'], minFame: 5, maxFame: 10, baseAnnualMultiplier: 1.15 },
  { name: 'HP Global', category: 'sleeve', countrySuitability: ['GLOBAL', 'ESP', 'ENG'], minFame: 8, maxFame: 10, baseAnnualMultiplier: 0.65 },
  { name: 'Allianz Insurance', category: 'stadium_naming', countrySuitability: ['GLOBAL', 'GER', 'ITA'], minFame: 7, maxFame: 10, baseAnnualMultiplier: 0.85 },
  { name: 'Santander Bank', category: 'global_partner', countrySuitability: ['ESP', 'GLOBAL', 'BRA', 'ARG'], minFame: 6, maxFame: 10, baseAnnualMultiplier: 0.50 },

  // PREMIER LEAGUE / HIGH FINANCIAL (Fame 6-8)
  { name: 'AIA Life Assurance', category: 'main_shirt', countrySuitability: ['ENG', 'GLOBAL'], minFame: 7, maxFame: 9, baseAnnualMultiplier: 1.10 },
  { name: 'Betano Gaming', category: 'main_shirt', countrySuitability: ['ENG', 'POR', 'BRA', 'ESP'], minFame: 5, maxFame: 8, baseAnnualMultiplier: 0.95 },
  { name: 'Castore Sports', category: 'kit_supplier', countrySuitability: ['ENG', 'ESP', 'GER'], minFame: 5, maxFame: 8, baseAnnualMultiplier: 0.80 },
  { name: 'Visit Saudi / Riyadh Season', category: 'main_shirt', countrySuitability: ['KSA', 'SAU', 'GLOBAL', 'ITA', 'ESP'], minFame: 6, maxFame: 10, baseAnnualMultiplier: 1.45 },
  { name: 'Red Bull Global', category: 'main_shirt', countrySuitability: ['GER', 'AUT', 'BRA', 'ENG'], minFame: 6, maxFame: 9, baseAnnualMultiplier: 1.20 },

  // SOUTH AMERICAN / ARGENTINA / BRAZIL (Fame 3-7)
  { name: 'Rapicuota Finanzas', category: 'main_shirt', countrySuitability: ['ARG'], minFame: 3, maxFame: 6, baseAnnualMultiplier: 0.85 },
  { name: 'Banco Macro', category: 'main_shirt', countrySuitability: ['ARG'], minFame: 4, maxFame: 7, baseAnnualMultiplier: 0.95 },
  { name: 'Betsson Sudamérica', category: 'main_shirt', countrySuitability: ['ARG', 'BRA', 'ESP'], minFame: 5, maxFame: 8, baseAnnualMultiplier: 1.05 },
  { name: 'Banco Provincia', category: 'sleeve', countrySuitability: ['ARG'], minFame: 3, maxFame: 6, baseAnnualMultiplier: 0.40 },
  { name: 'Givova Sport', category: 'kit_supplier', countrySuitability: ['ARG', 'ITA', 'ESP'], minFame: 2, maxFame: 6, baseAnnualMultiplier: 0.50 },
  { name: 'Umbro Athletic', category: 'kit_supplier', countrySuitability: ['ENG', 'ARG', 'BRA'], minFame: 4, maxFame: 7, baseAnnualMultiplier: 0.70 },
  { name: 'Crefisa Crédito', category: 'main_shirt', countrySuitability: ['BRA'], minFame: 6, maxFame: 8, baseAnnualMultiplier: 1.20 },
  { name: 'Petrobras Energía', category: 'global_partner', countrySuitability: ['BRA', 'ARG'], minFame: 5, maxFame: 8, baseAnnualMultiplier: 0.75 },

  // MID / DOMESTIC TIERS (Fame 3-6)
  { name: 'Mahou Cervezas', category: 'regional_partner', countrySuitability: ['ESP'], minFame: 4, maxFame: 9, baseAnnualMultiplier: 0.45 },
  { name: 'Estrella Galicia', category: 'main_shirt', countrySuitability: ['ESP'], minFame: 4, maxFame: 7, baseAnnualMultiplier: 0.80 },
  { name: 'Joma Sportswear', category: 'kit_supplier', countrySuitability: ['ESP', 'ITA', 'GLOBAL'], minFame: 3, maxFame: 7, baseAnnualMultiplier: 0.65 },
  { name: 'Macron Technical', category: 'kit_supplier', countrySuitability: ['ITA', 'ENG', 'FRA', 'ESP'], minFame: 4, maxFame: 7, baseAnnualMultiplier: 0.70 },
  { name: 'Kappa Authentic', category: 'kit_supplier', countrySuitability: ['FRA', 'ITA', 'ESP', 'ARG'], minFame: 3, maxFame: 7, baseAnnualMultiplier: 0.60 },
  { name: 'AutoHero Mobility', category: 'main_shirt', countrySuitability: ['GER', 'FRA', 'ITA'], minFame: 3, maxFame: 6, baseAnnualMultiplier: 0.75 },

  // LOWER / LOCAL TIERS (Fame 0-2)
  { name: 'Local Commercial Logistics', category: 'main_shirt', countrySuitability: ['GLOBAL', 'ENG', 'ESP', 'ARG', 'GER', 'FRA', 'ITA'], minFame: 0, maxFame: 2, baseAnnualMultiplier: 0.90 },
  { name: 'Provincial Credit Union', category: 'sleeve', countrySuitability: ['GLOBAL', 'ENG', 'ESP', 'ARG', 'GER', 'FRA', 'ITA'], minFame: 0, maxFame: 3, baseAnnualMultiplier: 0.50 },
  { name: 'Community Builders Ltd', category: 'stadium_naming', countrySuitability: ['GLOBAL', 'ENG', 'ESP', 'ARG', 'GER', 'FRA', 'ITA'], minFame: 0, maxFame: 2, baseAnnualMultiplier: 0.60 },
  { name: 'District Teamwear Supplies', category: 'kit_supplier', countrySuitability: ['GLOBAL', 'ENG', 'ESP', 'ARG', 'GER', 'FRA', 'ITA'], minFame: 0, maxFame: 2, baseAnnualMultiplier: 0.40 },
];

/**
 * Generates 1 to 5 realistic sponsors for a club based on its Club Fame (0-10), country, and profile.
 */
export function generateClubSponsors(fame: number, countryCode: string = 'ENG'): ClubSponsor[] {
  const clampedFame = Math.min(10, Math.max(0, Math.round(fame)));
  const cc = (countryCode || 'ENG').toUpperCase();

  // Baseline Main Shirt Value per Fame level
  const fameBaseSponsorValue: Record<number, number> = {
    0: 18000,
    1: 45000,
    2: 120000,
    3: 350000,
    4: 1200000,
    5: 2800000,
    6: 7500000,
    7: 18000000,
    8: 45000000,
    9: 75000000,
    10: 110000000,
  };

  // Country commercial scaling factor (Premier League & Global vs South America)
  let countryScale = 1.0;
  if (['ENG'].includes(cc)) countryScale = 1.25;
  else if (['ESP', 'GER'].includes(cc)) countryScale = 1.0;
  else if (['ITA', 'FRA'].includes(cc)) countryScale = 0.90;
  else if (['KSA', 'SAU'].includes(cc)) countryScale = 1.35;
  else if (['ARG', 'BRA'].includes(cc)) countryScale = 0.35; // Argentine/Brazilian domestic market currency scale
  else countryScale = 0.60;

  const baseAnnual = (fameBaseSponsorValue[clampedFame] || 1000000) * countryScale;

  // Number of sponsors: Fame 0-2 -> 2, Fame 3-5 -> 3, Fame 6-7 -> 4, Fame 8-10 -> 5
  const numSponsors = clampedFame <= 2 ? 2 : clampedFame <= 5 ? 3 : clampedFame <= 7 ? 4 : 5;

  // Filter templates
  const suitableTemplates = SPONSOR_TEMPLATES.filter(
    (t) =>
      clampedFame >= t.minFame &&
      clampedFame <= t.maxFame &&
      (t.countrySuitability.includes('GLOBAL') || t.countrySuitability.includes(cc))
  );

  const categoriesNeeded: ClubSponsor['category'][] = [
    'main_shirt',
    'kit_supplier',
    'sleeve',
    'stadium_naming',
    'global_partner',
  ].slice(0, numSponsors) as any;

  const sponsors: ClubSponsor[] = [];

  categoriesNeeded.forEach((cat, idx) => {
    const matching = suitableTemplates.find((t) => t.category === cat && !sponsors.some((s) => s.name === t.name));
    let sponsorName = matching ? matching.name : `${cat.replace('_', ' ').toUpperCase()} Sponsor ${idx + 1}`;
    let multiplier = matching ? matching.baseAnnualMultiplier : cat === 'main_shirt' ? 1.0 : cat === 'kit_supplier' ? 0.9 : 0.45;

    // Fallbacks if no specific match
    if (!matching) {
      if (cat === 'main_shirt') sponsorName = clampedFame >= 8 ? 'Global Telecommunications' : clampedFame >= 5 ? 'National Bank Group' : 'Municipal Services';
      if (cat === 'kit_supplier') sponsorName = clampedFame >= 6 ? 'Puma Performance' : clampedFame >= 3 ? 'Joma Sportswear' : 'Regional Athletic Goods';
      if (cat === 'sleeve') sponsorName = clampedFame >= 8 ? 'Crypto Digital Exchange' : 'Regional Tourism Board';
      if (cat === 'stadium_naming') sponsorName = clampedFame >= 8 ? 'Allianz Arena Partner' : 'Provincial Energy';
      if (cat === 'global_partner') sponsorName = 'International Auto Group';
    }

    const calculatedAnnual = Math.max(5000, Math.round(baseAnnual * multiplier));
    const duration = 2 + Math.floor(Math.random() * 3); // 2 to 4 years

    sponsors.push({
      id: `sp_${cat}_${Date.now()}_${idx}`,
      name: sponsorName,
      category: cat,
      annualPayment: calculatedAnnual,
      contractDurationYears: duration,
      remainingYears: duration,
      logoText: sponsorName.slice(0, 12),
    });
  });

  return sponsors;
}

// ============================================================================
// 4. CLUB REVENUE & EXPENSES BUILDER
// ============================================================================

/**
 * Builds realistic annual revenue & expenses breakdown based on Club Fame, country, stadium, and roster.
 */
export function calculateClubFinancialProfile(
  fame: number,
  countryCode: string = 'ENG',
  stadiumCapacity: number = 35000,
  squadWageWeeklyEstimate: number = 100000,
  ownerType: OwnerType = 'private_owner',
  customSponsors?: ClubSponsor[]
): {
  revenue: ClubRevenue;
  expenses: ClubExpenses;
  transferBudget: number;
  wageBudgetWeekly: number;
  cashBalance: number;
  totalDebt: number;
  economicTier: EconomicTier;
  financialHealth: FinancialHealth;
} {
  const clampedFame = Math.min(10, Math.max(0, fame));
  const cc = (countryCode || 'ENG').toUpperCase();

  // 1. Sponsorship Total
  const sponsors = customSponsors && customSponsors.length > 0 ? customSponsors : generateClubSponsors(clampedFame, cc);
  const totalSponsorshipRevenue = sponsors.reduce((sum, s) => sum + s.annualPayment, 0);

  // 2. League & Broadcasting Revenue by Fame and Market
  const broadcastingByFame: Record<number, number> = {
    0: 5000,
    1: 30000,
    2: 120000,
    3: 600000,
    4: 2500000,
    5: 8000000,
    6: 22000000,
    7: 55000000,
    8: 140000000,
    9: 210000000,
    10: 250000000,
  };

  let countryBroadcastingScale = 1.0;
  if (cc === 'ENG') countryBroadcastingScale = 1.45; // Premier League massive TV rights
  else if (['ESP', 'GER'].includes(cc)) countryBroadcastingScale = 1.0;
  else if (['ITA', 'FRA'].includes(cc)) countryBroadcastingScale = 0.85;
  else if (['ARG', 'BRA'].includes(cc)) countryBroadcastingScale = 0.28;
  else countryBroadcastingScale = 0.50;

  const broadcasting = Math.round((broadcastingByFame[Math.round(clampedFame)] || 5000000) * countryBroadcastingScale);

  // 3. Matchday & Stadium Revenue
  const avgTicketPriceByFame: Record<number, number> = {
    0: 5, 1: 10, 2: 15, 3: 22, 4: 32, 5: 45, 6: 60, 7: 75, 8: 95, 9: 120, 10: 140,
  };
  const ticketPrice = avgTicketPriceByFame[Math.round(clampedFame)] || 40;
  const matchesPerYear = clampedFame >= 7 ? 26 : 21; // League + Cups + Continental
  const attendanceRate = 0.70 + (clampedFame / 10) * 0.25; // 70% to 95% sellout
  const matchday = Math.round(stadiumCapacity * attendanceRate * ticketPrice * matchesPerYear);

  // 4. Merchandising & Memberships
  const merchandising = Math.round(totalSponsorshipRevenue * (0.35 + (clampedFame / 10) * 0.50));
  const isMemberOwned = ownerType === 'member_owned';
  const memberships = Math.round(
    isMemberOwned
      ? totalSponsorshipRevenue * 0.45 + (clampedFame >= 7 ? 25000000 : 3000000)
      : totalSponsorshipRevenue * 0.12
  );

  // 5. Prize Money & Continental
  const prizeMoney = Math.round(broadcasting * (0.15 + (clampedFame / 10) * 0.25));
  const continentalCompetitions = clampedFame >= 9 ? 85000000 : clampedFame >= 8 ? 45000000 : clampedFame >= 7 ? 20000000 : clampedFame >= 6 ? 4000000 : 0;
  const playerSales = Math.round(broadcasting * 0.25);
  const loanIncome = Math.round(broadcasting * 0.04);
  const otherIncome = Math.round(broadcasting * 0.05);

  const totalRevenue =
    broadcasting +
    matchday +
    totalSponsorshipRevenue +
    merchandising +
    memberships +
    prizeMoney +
    continentalCompetitions +
    playerSales +
    loanIncome +
    otherIncome;

  const revenue: ClubRevenue = {
    broadcasting,
    matchday,
    sponsorships: totalSponsorshipRevenue,
    merchandising,
    memberships,
    prizeMoney,
    continentalCompetitions,
    domesticCompetitions: Math.round(prizeMoney * 0.4),
    playerSales,
    loanIncome,
    otherIncome,
    totalRevenue,
  };

  // EXPENSES
  const playerSalaries = Math.round(squadWageWeeklyEstimate * 52);
  const managerAndCoaching = Math.round(playerSalaries * 0.12);
  const staffAndAdmin = Math.round(totalRevenue * 0.10);
  const transfersAmortization = Math.round(totalRevenue * (clampedFame >= 8 ? 0.28 : 0.16));
  const stadiumUpkeep = Math.round(matchday * 0.22);
  const trainingAndYouthAcademy = Math.round(totalRevenue * 0.08);
  const medicalAndRecovery = Math.round(totalRevenue * 0.03);
  const travelAndMatchOps = Math.round(totalRevenue * 0.05);
  const debtAndInterest = Math.round(totalRevenue * (clampedFame >= 8 ? 0.06 : 0.03));
  const otherExpenses = Math.round(totalRevenue * 0.04);

  const totalExpenses =
    playerSalaries +
    managerAndCoaching +
    staffAndAdmin +
    transfersAmortization +
    stadiumUpkeep +
    trainingAndYouthAcademy +
    medicalAndRecovery +
    travelAndMatchOps +
    debtAndInterest +
    otherExpenses;

  const expenses: ClubExpenses = {
    playerSalaries,
    managerAndCoaching,
    staffAndAdmin,
    transfersAmortization,
    stadiumUpkeep,
    trainingAndYouthAcademy,
    medicalAndRecovery,
    travelAndMatchOps,
    debtAndInterest,
    otherExpenses,
    totalExpenses,
  };

  // Transfer Budget & Wage Budget derived sustainably from Total Revenue
  // Safe transfer budget is roughly 25-40% of annual turnover, scaled by Fame and Owner
  let transferBudget = Math.round(totalRevenue * (0.15 + (clampedFame / 10) * 0.20));
  if (ownerType === 'state_backed') transferBudget = Math.round(transferBudget * 1.35);
  else if (ownerType === 'billionaire') transferBudget = Math.round(transferBudget * 1.20);
  else if (ownerType === 'member_owned') transferBudget = Math.round(transferBudget * 0.85); // Stricter balance

  const wageBudgetWeekly = Math.round((totalRevenue * 0.58) / 52); // Standard UEFA 70% revenue cap guideline
  const cashBalance = Math.max(100000, Math.round(totalRevenue * 0.18));
  const totalDebt = Math.round(totalRevenue * (isMemberOwned ? 0.35 : 0.65));

  // Determine Economic Tier
  let economicTier: EconomicTier = 'developing';
  if (totalRevenue < 500000) economicTier = 'tiny';
  else if (totalRevenue < 3000000) economicTier = 'small';
  else if (totalRevenue < 15000000) economicTier = 'developing';
  else if (totalRevenue < 60000000) economicTier = 'established';
  else if (totalRevenue < 150000000) economicTier = 'strong';
  else if (totalRevenue < 350000000) economicTier = 'major';
  else if (totalRevenue < 700000000) economicTier = 'elite';
  else economicTier = 'super_elite';

  // Determine Financial Health
  let financialHealth: FinancialHealth = 'healthy';
  const profitMargin = (totalRevenue - totalExpenses) / Math.max(1, totalRevenue);
  if (profitMargin < -0.15) financialHealth = 'critical';
  else if (profitMargin < 0) financialHealth = 'vulnerable';
  else if (profitMargin < 0.08) financialHealth = 'stable';
  else if (profitMargin < 0.20) financialHealth = 'healthy';
  else if (clampedFame >= 9) financialHealth = 'unstoppable';
  else financialHealth = 'prosperous';

  return {
    revenue,
    expenses,
    transferBudget,
    wageBudgetWeekly,
    cashBalance,
    totalDebt,
    economicTier,
    financialHealth,
  };
}

// ============================================================================
// 5. TRANSFER AFFORDABILITY ENGINE (CRITICAL: PREVENTS ABSURD BIDS)
// ============================================================================

/**
 * Checks if a club can realistically and economically afford to sign a player.
 * Checks:
 * 1. Transfer Fee <= Available Transfer Budget + realistic overdraft.
 * 2. Offered Weekly Wage <= Max Wage Budget & Headroom.
 * 3. Total Commitment (Fee + 4yr wages) <= 60% of Annual Club Turnover.
 * 4. Fame Alignment: Clubs cannot make bids wildly out of their economic stratum.
 */
export function checkTransferAffordability(
  clubFinances: ClubFinances,
  transferFee: number,
  weeklySalary: number,
  contractYears: number = 4
): TransferAffordabilityCheck {
  const reasons: string[] = [];
  let score = 100;

  const { transferBudget, wageBudgetWeekly, currentWageBillWeekly, revenue, ownerType, clubFame } = clubFinances;
  const annualSalary = weeklySalary * 52;
  const totalDealCost = transferFee + annualSalary * contractYears;

  // 1. Transfer Fee Check
  // Owner investment buffer
  let maxOverdraftMultiplier = 1.15;
  if (ownerType === 'state_backed') maxOverdraftMultiplier = 1.45;
  else if (ownerType === 'billionaire') maxOverdraftMultiplier = 1.30;
  else if (ownerType === 'member_owned') maxOverdraftMultiplier = 1.05;

  const maxAffordableFee = Math.round(transferBudget * maxOverdraftMultiplier);

  if (transferFee > maxAffordableFee) {
    const deficit = transferFee - maxAffordableFee;
    reasons.push(
      `Transfer fee (${formatCurrencyEuro(transferFee)}) exceeds club's maximum transfer capacity (${formatCurrencyEuro(maxAffordableFee)}) by ${formatCurrencyEuro(deficit)}.`
    );
    score -= 60;
  }

  // 2. Weekly Wage & Wage Cap Check
  const availableWageHeadroom = Math.max(0, wageBudgetWeekly - currentWageBillWeekly);
  // Maximum single player wage cap: cannot exceed 28% of total weekly wage budget for a single player
  const maxSinglePlayerWage = Math.round(wageBudgetWeekly * 0.28);

  if (weeklySalary > maxSinglePlayerWage) {
    reasons.push(
      `Demanded wage (${formatCurrencyEuro(weeklySalary)}/wk) exceeds club's maximum individual wage ceiling (${formatCurrencyEuro(maxSinglePlayerWage)}/wk).`
    );
    score -= 45;
  } else if (weeklySalary > availableWageHeadroom && availableWageHeadroom < weeklySalary * 0.6) {
    reasons.push(
      `Wage bill already near capacity (Headroom: ${formatCurrencyEuro(availableWageHeadroom)}/wk vs Demanded: ${formatCurrencyEuro(weeklySalary)}/wk).`
    );
    score -= 25;
  }

  // 3. Total Turnover Commitment Check (Financial Fair Play & Sanity)
  // Deal cost cannot exceed 65% of entire annual turnover
  const maxDealRatio = ownerType === 'state_backed' ? 0.85 : 0.60;
  const maxTotalDeal = revenue.totalRevenue * maxDealRatio;

  if (totalDealCost > maxTotalDeal) {
    reasons.push(
      `Total deal commitment (${formatCurrencyEuro(totalDealCost)}) represents an unsafe share of annual revenue (${formatCurrencyEuro(revenue.totalRevenue)}).`
    );
    score -= 50;
  }

  // 4. Absolute Club Fame Absurdity Firewall (e.g. Fame 5 or 6 making €300M+ bids)
  if (clubFame <= 5 && transferFee > 25000000) {
    reasons.push(`A Club Fame ${clubFame} organization cannot execute a €25M+ transfer.`);
    score = 0;
  } else if (clubFame <= 6 && transferFee > 50000000) {
    reasons.push(`A Club Fame ${clubFame} organization cannot execute a €50M+ transfer.`);
    score = 0;
  } else if (clubFame <= 7 && transferFee > 100000000) {
    reasons.push(`A Club Fame ${clubFame} organization cannot execute a €100M+ transfer.`);
    score = 0;
  }

  const isAffordable = score >= 50 && reasons.length === 0;

  return {
    isAffordable,
    maxAffordableFee,
    maxAffordableWeeklyWage: maxSinglePlayerWage,
    totalDealCostOverContract: totalDealCost,
    reasons,
    score: Math.max(0, score),
  };
}

// ============================================================================
// 6. PLAYER ATTRACTION & WILLINGNESS TO JOIN
// ============================================================================

/**
 * Assesses whether a player would realistically consider joining a buyer club.
 * Influenced by Club Fame (0-10), financial package, prestige, and continental ambitions.
 */
export function assessPlayerAttraction(
  player: Partial<PlayerCardData>,
  buyerFinances: ClubFinances,
  offeredWeeklyWage: number,
  expectedRole: 'Starter' | 'Rotation Player' | 'Squad Player' | 'Youth Team' = 'Starter'
): PlayerAttractionAssessment {
  const reasons: string[] = [];
  const playerOvr = player.ovr || player.overallRating || 65;
  const playerFame = player.fame || 0;
  const buyerFame = buyerFinances.clubFame;

  // 1. Prestige Appeal (Club Fame vs Player Ability)
  // Elite 88+ OVR players want Fame 8-10 clubs
  let prestigeAppeal = 50;
  if (buyerFame >= 9) {
    prestigeAppeal = 95;
    reasons.push('Enticed by world-renowned prestige and global spotlight.');
  } else if (buyerFame >= 7) {
    prestigeAppeal = 75;
    reasons.push('Attracted by strong continental ambitions and historic badge.');
  } else if (buyerFame >= 5) {
    prestigeAppeal = 55;
    if (playerOvr >= 85) {
      prestigeAppeal = 25;
      reasons.push('Reluctant to join due to player having higher profile than club reputation.');
    }
  } else {
    prestigeAppeal = 30;
    if (playerOvr >= 75) {
      prestigeAppeal = 10;
      reasons.push('Unwilling to step down to lower-reputation club.');
    }
  }

  // 2. Financial Appeal
  const mvData = calculateRealisticPlayerMarketValue(player);
  const expectedWage = mvData.weeklyWageEstimate;
  const wageRatio = offeredWeeklyWage / Math.max(100, expectedWage);
  let financialAppeal = 50;

  if (wageRatio >= 1.5) {
    financialAppeal = 95;
    reasons.push('Extremely motivated by lucrative wage offer.');
  } else if (wageRatio >= 1.15) {
    financialAppeal = 75;
    reasons.push('Satisfied with competitive salary increase.');
  } else if (wageRatio >= 0.85) {
    financialAppeal = 50;
  } else {
    financialAppeal = 15;
    reasons.push('Disappointed with subpar wage offer below market rate.');
  }

  // 3. Sporting Appeal (Role in squad)
  let sportingAppeal = 60;
  if (expectedRole === 'Starter') {
    sportingAppeal = 85;
    reasons.push('Guaranteed key starter status.');
  } else if (expectedRole === 'Rotation Player') {
    sportingAppeal = 55;
  } else {
    sportingAppeal = 25;
    reasons.push('Concerned about lack of guaranteed first-team minutes.');
  }

  const attractionScore = Math.round(prestigeAppeal * 0.40 + financialAppeal * 0.35 + sportingAppeal * 0.25);
  const willJoin = attractionScore >= 45;

  return {
    willJoin,
    attractionScore,
    fameDelta: buyerFame,
    prestigeAppeal,
    financialAppeal,
    sportingAppeal,
    reasons,
  };
}

// ============================================================================
// 7. DEFAULT DATABASE PRESETS & INITIALIZERS FOR WELL-KNOWN CLUBS
// ============================================================================

export const REAL_CLUB_FAME_DEFAULTS: Record<string, { fame: number; ownerType: OwnerType }> = {
  // SPAIN
  esp_realmadrid: { fame: 10, ownerType: 'member_owned' },
  esp_barcelona: { fame: 10, ownerType: 'member_owned' },
  esp_atletico: { fame: 8, ownerType: 'investment_group' },
  esp_sevilla: { fame: 7, ownerType: 'private_owner' },
  esp_betis: { fame: 7, ownerType: 'private_owner' },
  esp_athletic: { fame: 7, ownerType: 'member_owned' },
  esp_sociedad: { fame: 6, ownerType: 'private_owner' },
  esp_villarreal: { fame: 6, ownerType: 'billionaire' },
  esp_valencia: { fame: 6, ownerType: 'private_owner' },
  esp_osasuna: { fame: 5, ownerType: 'member_owned' },
  esp_rayo: { fame: 5, ownerType: 'private_owner' },
  esp_getafe: { fame: 5, ownerType: 'private_owner' },
  esp_girona: { fame: 6, ownerType: 'investment_group' },
  esp_celta: { fame: 5, ownerType: 'private_owner' },
  esp_mallorca: { fame: 5, ownerType: 'investment_group' },
  esp_laspalmas: { fame: 4, ownerType: 'private_owner' },
  esp_alaves: { fame: 4, ownerType: 'private_owner' },
  esp_leganes: { fame: 4, ownerType: 'private_owner' },
  esp_valladolid: { fame: 4, ownerType: 'private_owner' },
  esp_espanyol: { fame: 5, ownerType: 'corporation' },

  // ENGLAND
  eng_mancity: { fame: 9, ownerType: 'state_backed' },
  eng_liverpool: { fame: 9, ownerType: 'investment_group' },
  eng_arsenal: { fame: 9, ownerType: 'billionaire' },
  eng_manunited: { fame: 9, ownerType: 'billionaire' },
  eng_chelsea: { fame: 8, ownerType: 'investment_group' },
  eng_tottenham: { fame: 8, ownerType: 'investment_group' },
  eng_astonvilla: { fame: 8, ownerType: 'billionaire' },
  eng_newcastle: { fame: 8, ownerType: 'state_backed' },
  eng_brighton: { fame: 6, ownerType: 'billionaire' },
  eng_westham: { fame: 6, ownerType: 'private_owner' },
  eng_crystalpalace: { fame: 5, ownerType: 'investment_group' },
  eng_fulham: { fame: 5, ownerType: 'billionaire' },
  eng_brentford: { fame: 5, ownerType: 'private_owner' },
  eng_bournemouth: { fame: 5, ownerType: 'investment_group' },
  eng_everton: { fame: 6, ownerType: 'investment_group' },
  eng_nottingham: { fame: 5, ownerType: 'billionaire' },
  eng_wolves: { fame: 5, ownerType: 'corporation' },
  eng_leicester: { fame: 5, ownerType: 'corporation' },
  eng_ipswich: { fame: 4, ownerType: 'investment_group' },
  eng_southampton: { fame: 4, ownerType: 'investment_group' },

  // FRANCE
  fra_psg: { fame: 9, ownerType: 'state_backed' },
  fra_monaco: { fame: 7, ownerType: 'billionaire' },
  fra_marseille: { fame: 7, ownerType: 'billionaire' },
  fra_lyon: { fame: 7, ownerType: 'investment_group' },
  fra_lille: { fame: 6, ownerType: 'investment_group' },
  fra_rennes: { fame: 6, ownerType: 'billionaire' },
  fra_nice: { fame: 6, ownerType: 'billionaire' },
  fra_lens: { fame: 5, ownerType: 'private_owner' },

  // GERMANY
  ger_bayern: { fame: 9, ownerType: 'member_owned' },
  ger_dortmund: { fame: 8, ownerType: 'member_owned' },
  ger_leverkusen: { fame: 8, ownerType: 'corporation' },
  ger_leipzig: { fame: 7, ownerType: 'corporation' },
  ger_stuttgart: { fame: 6, ownerType: 'member_owned' },
  ger_frankfurt: { fame: 6, ownerType: 'member_owned' },
  ger_wolfsburg: { fame: 5, ownerType: 'corporation' },
  ger_monchengladbach: { fame: 5, ownerType: 'member_owned' },

  // ITALY
  ita_inter: { fame: 9, ownerType: 'investment_group' },
  ita_milan: { fame: 7, ownerType: 'investment_group' },
  ita_juventus: { fame: 8, ownerType: 'corporation' },
  ita_napoli: { fame: 7, ownerType: 'billionaire' },
  ita_atalanta: { fame: 7, ownerType: 'investment_group' },
  ita_roma: { fame: 7, ownerType: 'investment_group' },
  ita_lazio: { fame: 7, ownerType: 'private_owner' },
  ita_fiorentina: { fame: 6, ownerType: 'billionaire' },
  ita_bologna: { fame: 6, ownerType: 'billionaire' },
  ita_torino: { fame: 6, ownerType: 'private_owner' },

  // ARGENTINA
  arg_river: { fame: 7, ownerType: 'member_owned' },
  arg_boca: { fame: 7, ownerType: 'member_owned' },
  arg_racing: { fame: 6, ownerType: 'member_owned' },
  arg_independiente: { fame: 6, ownerType: 'member_owned' },
  arg_sanlorenzo: { fame: 6, ownerType: 'member_owned' },
  arg_velez: { fame: 7, ownerType: 'member_owned' },
  arg_estudiantes: { fame: 7, ownerType: 'member_owned' },
  arg_gimnasia: { fame: 5, ownerType: 'member_owned' },
  arg_newells: { fame: 5, ownerType: 'member_owned' },
  arg_rosariocentral: { fame: 5, ownerType: 'member_owned' },
  arg_lanus: { fame: 5, ownerType: 'member_owned' },
  arg_talleres: { fame: 5, ownerType: 'member_owned' },
  arg_argentinos: { fame: 5, ownerType: 'member_owned' },
  arg_defensa: { fame: 5, ownerType: 'member_owned' },
  arg_huracan: { fame: 5, ownerType: 'member_owned' },
  arg_banfield: { fame: 4, ownerType: 'member_owned' },
  arg_godoycruz: { fame: 4, ownerType: 'member_owned' },
  arg_platense: { fame: 4, ownerType: 'member_owned' },
  arg_barracas: { fame: 3, ownerType: 'member_owned' },
  arg_riestra: { fame: 3, ownerType: 'private_owner' },

  // BRAZIL
  bra_flamengo: { fame: 8, ownerType: 'member_owned' },
  bra_palmeiras: { fame: 8, ownerType: 'member_owned' },
  bra_atleticomg: { fame: 7, ownerType: 'billionaire' },
  bra_botafogo: { fame: 7, ownerType: 'billionaire' },
  bra_saopaulo: { fame: 7, ownerType: 'member_owned' },
  bra_corinthians: { fame: 7, ownerType: 'member_owned' },
  bra_fluminense: { fame: 6, ownerType: 'member_owned' },
  bra_gremio: { fame: 6, ownerType: 'member_owned' },
  bra_internacional: { fame: 6, ownerType: 'member_owned' },
  bra_cruzeiro: { fame: 6, ownerType: 'billionaire' },
  bra_vasco: { fame: 6, ownerType: 'investment_group' },
  bra_bahia: { fame: 6, ownerType: 'investment_group' },
  bra_bragantino: { fame: 5, ownerType: 'corporation' },
  bra_fortaleza: { fame: 5, ownerType: 'member_owned' },
  bra_athleticopr: { fame: 5, ownerType: 'member_owned' },

  // SAUDI ARABIA
  sau_alhilal: { fame: 8, ownerType: 'state_backed' },
  sau_alnassr: { fame: 8, ownerType: 'state_backed' },
  sau_alittihad: { fame: 7, ownerType: 'state_backed' },
  sau_alahli: { fame: 7, ownerType: 'state_backed' },
  sau_alshabab: { fame: 5, ownerType: 'private_owner' },
  sau_alettifaq: { fame: 5, ownerType: 'private_owner' },
};

/**
 * Ensures any team object in the League Editor has a fully populated, valid ClubFinances object.
 */
export function ensureTeamFinances(team: EditorTeamData): EditorTeamData {
  if (team.finances && typeof team.finances.clubFame === 'number' && team.finances.revenue) {
    return team;
  }

  const teamId = (team.id || '').toLowerCase();
  const teamName = (team.name || '').toLowerCase();
  const country = (team.countryCode || 'ENG').toUpperCase();

  // Check real club financial registry first
  const realPreset = REAL_CLUB_FINANCIAL_REGISTRY[teamId] ||
    Object.entries(REAL_CLUB_FINANCIAL_REGISTRY).find(([k]) => teamId.includes(k) || k.includes(teamId))?.[1];

  let defaultFame = 5;
  let defaultOwner: OwnerType = 'private_owner';
  let customStrategy: TransferStrategy | undefined = undefined;
  let initialCashOverride: number | undefined = undefined;
  let initialDebtOverride: number | undefined = undefined;
  let ownerInvestmentOverride: number | undefined = undefined;

  if (realPreset) {
    defaultFame = realPreset.fame;
    defaultOwner = realPreset.ownerType;
    customStrategy = realPreset.strategy;
    initialCashOverride = realPreset.initialCash;
    initialDebtOverride = realPreset.initialDebt;
    ownerInvestmentOverride = realPreset.ownerInvestment;
  } else {
    const matchingKey = Object.keys(REAL_CLUB_FAME_DEFAULTS).find((k) => teamId.includes(k) || k.includes(teamId));
    if (matchingKey) {
      defaultFame = REAL_CLUB_FAME_DEFAULTS[matchingKey].fame;
      defaultOwner = REAL_CLUB_FAME_DEFAULTS[matchingKey].ownerType;
    } else {
      // Infer based on name and country
      if (teamName.includes('madrid') || teamName.includes('barcelona')) {
        defaultFame = 10;
        defaultOwner = 'member_owned';
      } else if (teamName.includes('city') || teamName.includes('liverpool') || teamName.includes('bayern') || teamName.includes('paris') || teamName.includes('arsenal')) {
        defaultFame = 9;
        defaultOwner = teamName.includes('bayern') ? 'member_owned' : 'billionaire';
      } else if (teamName.includes('tottenham') || teamName.includes('chelsea') || teamName.includes('juventus') || teamName.includes('dortmund') || teamName.includes('atletico')) {
        defaultFame = 8;
        defaultOwner = 'investment_group';
      } else if (teamName.includes('milan') || teamName.includes('roma') || teamName.includes('sevilla') || teamName.includes('betis') || teamName.includes('porto') || teamName.includes('benfica') || teamName.includes('river') || teamName.includes('boca') || teamName.includes('velez') || teamName.includes('estudiantes')) {
        defaultFame = 7;
        defaultOwner = country === 'ARG' ? 'member_owned' : 'private_owner';
      } else if (teamName.includes('gimnasia') || teamName.includes('newell') || teamName.includes('lanus')) {
        defaultFame = 5;
        defaultOwner = 'member_owned';
      } else {
        // Scale by team overall rating
        const ovr = team.overallRating || 70;
        if (ovr >= 85) defaultFame = 8;
        else if (ovr >= 80) defaultFame = 7;
        else if (ovr >= 75) defaultFame = 6;
        else if (ovr >= 70) defaultFame = 5;
        else if (ovr >= 65) defaultFame = 4;
        else if (ovr >= 60) defaultFame = 3;
        else defaultFame = 2;
      }
    }
  }

  const stadiumCap = team.stadium?.capacity || (defaultFame >= 9 ? 65000 : defaultFame >= 7 ? 48000 : defaultFame >= 5 ? 28000 : 12000);
  const weeklyWageEstimate = defaultFame >= 9 ? 3500000 : defaultFame >= 7 ? 1200000 : defaultFame >= 5 ? 300000 : 50000;

  const profile = calculateClubFinancialProfile(
    defaultFame,
    country,
    stadiumCap,
    weeklyWageEstimate,
    defaultOwner
  );

  const strategy: TransferStrategy = customStrategy || {
    recruitmentFocus: defaultFame >= 9 ? 'buy_stars' : defaultFame <= 4 ? 'develop_youth' : 'balanced',
    geographicPreference: country === 'ARG' || country === 'BRA' ? 'south_american_pipeline' : 'global_scouting',
    financialPhilosophy: defaultOwner === 'state_backed' ? 'aggressive_spending' : defaultOwner === 'member_owned' ? 'sustainable_profit' : 'moderate_investment',
    loanUsage: defaultFame <= 4 ? 'high' : 'moderate',
  };

  // Build authentic sponsors
  let sponsors = generateClubSponsors(defaultFame, country);
  if (realPreset && realPreset.sponsorName) {
    sponsors = sponsors.map((sp) => {
      if (sp.category === 'main_shirt') {
        return {
          ...sp,
          name: realPreset.sponsorName || sp.name,
          annualPayment: realPreset.sponsorAnnualPayment || sp.annualPayment,
        };
      }
      if (sp.category === 'kit_supplier' && realPreset.kitManufacturer) {
        return {
          ...sp,
          name: realPreset.kitManufacturer,
          annualPayment: realPreset.kitPayment || sp.annualPayment,
        };
      }
      if (sp.category === 'stadium_naming' && realPreset.stadiumNaming) {
        return {
          ...sp,
          name: realPreset.stadiumNaming,
          annualPayment: realPreset.stadiumNamingPayment || sp.annualPayment,
        };
      }
      if (sp.category === 'sleeve' && realPreset.sleevePartner) {
        return {
          ...sp,
          name: realPreset.sleevePartner,
          annualPayment: realPreset.sleevePayment || sp.annualPayment,
        };
      }
      return sp;
    });
  }

  const finances: ClubFinances = {
    clubFame: defaultFame,
    ownerType: defaultOwner,
    ownerInvestmentAnnual: ownerInvestmentOverride ?? (defaultOwner === 'state_backed' ? 50000000 : defaultOwner === 'billionaire' ? 20000000 : 0),
    transferBudget: profile.transferBudget,
    wageBudgetWeekly: profile.wageBudgetWeekly,
    currentWageBillWeekly: Math.round(profile.wageBudgetWeekly * 0.82),
    cashBalance: initialCashOverride ?? profile.cashBalance,
    totalDebt: initialDebtOverride ?? profile.totalDebt,
    teamMarketValue: defaultFame >= 9 ? 950000000 : defaultFame >= 7 ? 320000000 : defaultFame >= 5 ? 65000000 : 12000000,
    economicTier: profile.economicTier,
    financialHealth: profile.financialHealth,
    sponsors,
    revenue: profile.revenue,
    expenses: profile.expenses,
    strategy,
    lastSeasonNetProfit: Math.round(profile.revenue.totalRevenue * 0.06),
    consecutiveProfitableYears: 3,
  };

  return {
    ...team,
    finances,
  };
}

/**
 * Creates a complete fallback ClubFinances object for any club given fame, country, and owner.
 */
export function createFallbackClubFinances(
  fame: number = 5,
  countryCode: string = 'ENG',
  ownerType: OwnerType = 'private_owner'
): ClubFinances {
  const clampedFame = Math.max(0, Math.min(10, fame));
  const stadiumCap = clampedFame >= 9 ? 65000 : clampedFame >= 7 ? 48000 : clampedFame >= 5 ? 28000 : 12000;
  const weeklyWageEstimate = clampedFame >= 9 ? 3500000 : clampedFame >= 7 ? 1200000 : clampedFame >= 5 ? 300000 : 50000;

  const profile = calculateClubFinancialProfile(
    clampedFame,
    countryCode,
    stadiumCap,
    weeklyWageEstimate,
    ownerType
  );

  const strategy: TransferStrategy = {
    recruitmentFocus: clampedFame >= 9 ? 'buy_stars' : clampedFame <= 4 ? 'develop_youth' : 'balanced',
    geographicPreference: countryCode === 'ARG' || countryCode === 'BRA' ? 'south_american_pipeline' : 'global_scouting',
    financialPhilosophy: ownerType === 'state_backed' ? 'aggressive_spending' : ownerType === 'member_owned' ? 'sustainable_profit' : 'moderate_investment',
    loanUsage: clampedFame <= 4 ? 'high' : 'moderate',
  };

  const sponsors = generateClubSponsors(clampedFame, countryCode);

  return {
    clubFame: clampedFame,
    ownerType,
    ownerInvestmentAnnual: ownerType === 'state_backed' ? 50000000 : ownerType === 'billionaire' ? 20000000 : 0,
    transferBudget: profile.transferBudget,
    wageBudgetWeekly: profile.wageBudgetWeekly,
    currentWageBillWeekly: Math.round(profile.wageBudgetWeekly * 0.82),
    cashBalance: profile.cashBalance,
    totalDebt: profile.totalDebt,
    teamMarketValue: clampedFame >= 9 ? 950000000 : clampedFame >= 7 ? 320000000 : clampedFame >= 5 ? 65000000 : 12000000,
    economicTier: profile.economicTier,
    financialHealth: profile.financialHealth,
    sponsors,
    revenue: profile.revenue,
    expenses: profile.expenses,
    strategy,
    lastSeasonNetProfit: Math.round(profile.revenue.totalRevenue * 0.06),
    consecutiveProfitableYears: 3,
  };
}

// ============================================================================
// 8. SEASONAL FINANCIAL EVOLUTION & ROLLOVER
// ============================================================================

export interface SeasonFinancialRolloverResult {
  updatedFinances: ClubFinances;
  netProfit: number;
  fameChange: number;
  messages: string[];
}

/**
 * End-of-season financial accounting rollover.
 * Updates cash balances, recalculates turnover, sponsor contract years, and spending capacities.
 */
export function processSeasonFinancialRollover(
  currentFinances: ClubFinances,
  seasonPerformance: {
    leaguePosition: number;
    totalTeams: number;
    wonLeagueTitle?: boolean;
    wonCup?: boolean;
    qualifiedChampionsLeague?: boolean;
    wonChampionsLeague?: boolean;
    wasRelegated?: boolean;
  }
): SeasonFinancialRolloverResult {
  const messages: string[] = [];
  let { clubFame, ownerType, sponsors, revenue, expenses, cashBalance, totalDebt } = currentFinances;

  // 1. Performance Bonus & Prize Income Adjustments
  let bonusPrizeMoney = 0;
  if (seasonPerformance.wonChampionsLeague) {
    bonusPrizeMoney += 45000000;
    messages.push('🏆 Continental Championship Prize: +€45,000,000 awarded!');
  } else if (seasonPerformance.qualifiedChampionsLeague) {
    bonusPrizeMoney += 18000000;
    messages.push('🌟 UEFA Champions League Qualification: +€18,000,000 revenue boost!');
  }

  if (seasonPerformance.wonLeagueTitle) {
    bonusPrizeMoney += 25000000;
    messages.push('🥇 League Champions Prize: +€25,000,000 awarded!');
  }

  if (seasonPerformance.wasRelegated) {
    messages.push('⚠️ Relegation Impact: Broadcasting and commercial revenues down by 40%.');
    revenue.broadcasting = Math.round(revenue.broadcasting * 0.60);
  }

  revenue.prizeMoney += bonusPrizeMoney;
  revenue.totalRevenue = Object.entries(revenue)
    .filter(([k]) => k !== 'totalRevenue')
    .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0);

  // 2. Calculate Net Annual Profit / Loss
  const netProfit = revenue.totalRevenue - expenses.totalExpenses;
  cashBalance += netProfit;

  // 3. Apply Owner Investment (if applicable)
  let ownerCash = 0;
  if (ownerType === 'state_backed') ownerCash = 35000000;
  else if (ownerType === 'billionaire') ownerCash = 15000000;
  else if (ownerType === 'investment_group') ownerCash = 5000000;

  if (ownerCash > 0) {
    cashBalance += ownerCash;
    messages.push(`💼 Owner Investment Injection: +${formatCurrencyEuro(ownerCash)} added to treasury.`);
  }

  // 4. Update Sponsor Contracts
  const updatedSponsors: ClubSponsor[] = sponsors.map((s) => {
    const rem = s.remainingYears - 1;
    if (rem <= 0) {
      // Contract expired, renew with modest market inflation (+2-5%)
      const newDuration = 2 + Math.floor(Math.random() * 3);
      const inflation = 1.02 + Math.random() * 0.05;
      messages.push(`✍️ Sponsor Renewal: ${s.name} renewed for ${newDuration} years at ${formatCurrencyEuro(s.annualPayment * inflation)}/yr.`);
      return {
        ...s,
        contractDurationYears: newDuration,
        remainingYears: newDuration,
        annualPayment: Math.round(s.annualPayment * inflation),
      };
    }
    return {
      ...s,
      remainingYears: rem,
    };
  });

  // 5. Dynamic Club Fame Adjustment (slow, realistic changes)
  let fameChange = 0;
  if (seasonPerformance.wonChampionsLeague && clubFame < 10) {
    fameChange = 0.5;
    messages.push('⭐ Continental Triumph has elevated the club’s global prestige!');
  } else if (seasonPerformance.wonLeagueTitle && clubFame < 9) {
    fameChange = 0.3;
  } else if (seasonPerformance.wasRelegated && clubFame > 1) {
    fameChange = -0.5;
  }

  const updatedFame = Math.min(10, Math.max(0, Math.round((clubFame + fameChange) * 10) / 10));

  // 6. Recalculate New Transfer Budget & Wage Budget
  const safeTransferBudget = Math.max(100000, Math.round(cashBalance * 0.55 + revenue.totalRevenue * 0.15));
  const newWageBudgetWeekly = Math.round((revenue.totalRevenue * 0.58) / 52);

  // Recalculate Health & Tier
  let economicTier = currentFinances.economicTier;
  if (revenue.totalRevenue > 700000000) economicTier = 'super_elite';
  else if (revenue.totalRevenue > 350000000) economicTier = 'elite';
  else if (revenue.totalRevenue > 150000000) economicTier = 'major';
  else if (revenue.totalRevenue > 60000000) economicTier = 'strong';
  else if (revenue.totalRevenue > 15000000) economicTier = 'established';
  else if (revenue.totalRevenue > 3000000) economicTier = 'developing';
  else economicTier = 'small';

  const updatedFinances: ClubFinances = {
    ...currentFinances,
    clubFame: updatedFame,
    cashBalance: Math.max(50000, cashBalance),
    transferBudget: safeTransferBudget,
    wageBudgetWeekly: newWageBudgetWeekly,
    sponsors: updatedSponsors,
    revenue,
    economicTier,
    lastSeasonNetProfit: netProfit,
  };

  return {
    updatedFinances,
    netProfit,
    fameChange,
    messages,
  };
}
