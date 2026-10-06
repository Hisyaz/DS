import { BusinessItem } from '../types';

export interface BusinessTier {
  tier: number;
  cost: number; // Purchase cost for Tier 1, Upgrade cost for Tier 2..5
  minRevenue: number;
  maxRevenue: number;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  operatingCostsPct: number; // e.g. 0.68 for 68%
  netProfitPct: number; // e.g. 0.32 for 32%
  iconName: 'Shirt' | 'Dumbbell' | 'Utensils' | 'TrendingUp' | 'Building2';
  tiers: Record<number, BusinessTier>;
}

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  {
    id: 'sportswear',
    name: 'Premium Sportswear Line',
    category: 'Apparel & Fashion',
    description: 'High-end athletic wear brand endorsed by world-class footballers.',
    operatingCostsPct: 0.68,
    netProfitPct: 0.32,
    iconName: 'Shirt',
    tiers: {
      1: { tier: 1, cost: 150000, minRevenue: 180000, maxRevenue: 270000 },
      2: { tier: 2, cost: 420000, minRevenue: 700000, maxRevenue: 1200000 },
      3: { tier: 3, cost: 1580000, minRevenue: 2800000, maxRevenue: 4500000 },
      4: { tier: 4, cost: 6050000, minRevenue: 11000000, maxRevenue: 20000000 },
      5: { tier: 5, cost: 23050000, minRevenue: 45000000, maxRevenue: 85000000 },
    },
  },
  {
    id: 'fitness',
    name: 'Fitness Center Franchise',
    category: 'Health & Wellness',
    description: 'Modern, high-tech gym facilities offering elite strength and conditioning.',
    operatingCostsPct: 0.71,
    netProfitPct: 0.29,
    iconName: 'Dumbbell',
    tiers: {
      1: { tier: 1, cost: 750000, minRevenue: 900000, maxRevenue: 1400000 },
      2: { tier: 2, cost: 1500000, minRevenue: 2700000, maxRevenue: 4300000 },
      3: { tier: 3, cost: 4500000, minRevenue: 8100000, maxRevenue: 13200000 },
      4: { tier: 4, cost: 13500000, minRevenue: 24500000, maxRevenue: 41000000 },
      5: { tier: 5, cost: 40500000, minRevenue: 75000000, maxRevenue: 128000000 },
    },
  },
  {
    id: 'restaurant',
    name: 'Fine Dining Restaurant',
    category: 'Hospitality & Culinary',
    description: 'Exclusive Michelin-grade culinary experiences frequented by celebrities and athletes.',
    operatingCostsPct: 0.76,
    netProfitPct: 0.24,
    iconName: 'Utensils',
    tiers: {
      1: { tier: 1, cost: 1200000, minRevenue: 1400000, maxRevenue: 2100000 },
      2: { tier: 2, cost: 2150000, minRevenue: 4000000, maxRevenue: 6200000 },
      3: { tier: 3, cost: 6050000, minRevenue: 11500000, maxRevenue: 18500000 },
      4: { tier: 4, cost: 16900000, minRevenue: 32000000, maxRevenue: 54000000 },
      5: { tier: 5, cost: 47450000, minRevenue: 90000000, maxRevenue: 155000000 },
    },
  },
  {
    id: 'vc_fund',
    name: 'Tech Venture Capital Fund',
    category: 'Finance & Investments',
    description: 'Early-stage venture fund investing in disruptive AI, fintech, and sports-tech startups.',
    operatingCostsPct: 0.30,
    netProfitPct: 0.70,
    iconName: 'TrendingUp',
    tiers: {
      1: { tier: 1, cost: 2500000, minRevenue: 1000000, maxRevenue: 3500000 },
      2: { tier: 2, cost: 7500000, minRevenue: 4000000, maxRevenue: 14000000 },
      3: { tier: 3, cost: 30000000, minRevenue: 16000000, maxRevenue: 56000000 },
      4: { tier: 4, cost: 120000000, minRevenue: 65000000, maxRevenue: 225000000 },
      5: { tier: 5, cost: 480000000, minRevenue: 260000000, maxRevenue: 900000000 },
    },
  },
  {
    id: 'hotel',
    name: 'Boutique Hotel & Resort',
    category: 'Real Estate & Luxury Tourism',
    description: '5-star beachfront resorts offering private villas and ultra-luxury concierge services.',
    operatingCostsPct: 0.66,
    netProfitPct: 0.34,
    iconName: 'Building2',
    tiers: {
      1: { tier: 1, cost: 15000000, minRevenue: 2500000, maxRevenue: 3800000 },
      2: { tier: 2, cost: 33000000, minRevenue: 8000000, maxRevenue: 12200000 },
      3: { tier: 3, cost: 105600000, minRevenue: 25500000, maxRevenue: 39000000 },
      4: { tier: 4, cost: 337900000, minRevenue: 82000000, maxRevenue: 125000000 },
      5: { tier: 5, cost: 1081000000, minRevenue: 265000000, maxRevenue: 405000000 },
    },
  },
];

/**
 * Format raw numbers cleanly in Euros (e.g., €150,000, €1.2M, €1.081B)
 */
export function formatEuros(amount: number): string {
  if (amount >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return `€${val % 1 === 0 ? val : val.toFixed(3).replace(/\.?0+$/, '')}B`;
  }
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `€${val % 1 === 0 ? val : val.toFixed(1).replace(/\.?0+$/, '')}M`;
  }
  if (amount >= 1_000) {
    return `€${Math.round(amount).toLocaleString()}`;
  }
  return `€${Math.round(amount)}`;
}

/**
 * Generate randomized season revenue & expenses for a given business tier
 */
export function calculateSeasonFinancials(template: BusinessTemplate, tier: number) {
  const tierData = template.tiers[tier] || template.tiers[1];
  const min = tierData.minRevenue;
  const max = tierData.maxRevenue;
  const revenue = Math.floor(Math.random() * (max - min + 1)) + min;
  const expenses = Math.round(revenue * template.operatingCostsPct);
  const netProfit = revenue - expenses;

  return { revenue, expenses, netProfit };
}

/**
 * Helper to create an initial owned BusinessItem instance
 */
export function createBusinessInstance(template: BusinessTemplate): BusinessItem {
  const financials = calculateSeasonFinancials(template, 1);
  return {
    id: `biz-${template.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    templateId: template.id,
    name: template.name,
    tier: 1,
    revenue: financials.revenue,
    expenses: financials.expenses,
    netProfit: financials.netProfit,
  };
}

/**
 * Default starting owned businesses for Career mode initialized with proper template definitions
 */
export const INITIAL_CAREER_BUSINESSES: BusinessItem[] = [
  {
    id: 'b1',
    templateId: 'sportswear',
    name: 'Premium Sportswear Line',
    tier: 1,
    revenue: 220000,
    expenses: 149600,
    netProfit: 70400,
  },
  {
    id: 'b2',
    templateId: 'fitness',
    name: 'Fitness Center Franchise',
    tier: 1,
    revenue: 1100000,
    expenses: 781000,
    netProfit: 319000,
  },
];
