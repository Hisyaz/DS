export type ClubFameLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type OwnerType =
  | 'member_owned'       // Member / Supporter-owned (e.g. Real Madrid, Barcelona, Osasuna, Athletic Bilbao, River, Boca, Gimnasia, German 50+1)
  | 'private_owner'      // Traditional private businessman / local owner
  | 'investment_group'   // US / European private equity, multi-club ownership groups (e.g. Red Bull, 777)
  | 'billionaire'        // Individual mega-wealthy tycoon / patron
  | 'corporation'        // Corporate conglomerate ownership (e.g. Leverkusen/Bayer, Wolfsburg/VW)
  | 'state_backed';      // Sovereign wealth / state investment linked (e.g. Man City / Abu Dhabi, PSG / Qatar, Newcastle / PIF)

export type EconomicTier =
  | 'tiny'
  | 'small'
  | 'developing'
  | 'established'
  | 'strong'
  | 'major'
  | 'elite'
  | 'super_elite';

export type FinancialHealth =
  | 'critical'      // Heavy debts, strict spending restrictions
  | 'vulnerable'    // Low cash buffer, must balance books carefully
  | 'stable'        // Sustainable operational balance
  | 'healthy'       // Solid profit margins and growth reserves
  | 'prosperous'    // Substantial commercial dominance and reserves
  | 'unstoppable';   // Elite global superpower financial strength

export type SponsorCategory =
  | 'main_shirt'
  | 'sleeve'
  | 'stadium_naming'
  | 'kit_supplier'
  | 'global_partner'
  | 'regional_partner';

export interface ClubSponsor {
  id: string;
  name: string;
  category: SponsorCategory;
  annualPayment: number; // In Euros (€)
  contractDurationYears: number;
  remainingYears: number;
  logoText?: string;
  color?: string;
}

export interface ClubRevenue {
  broadcasting: number;
  matchday: number;
  sponsorships: number;
  merchandising: number;
  memberships: number;
  prizeMoney: number;
  continentalCompetitions: number;
  domesticCompetitions: number;
  playerSales: number;
  loanIncome: number;
  otherIncome: number;
  totalRevenue: number;
}

export interface ClubExpenses {
  playerSalaries: number; // Annual total wage bill
  managerAndCoaching: number;
  staffAndAdmin: number;
  transfersAmortization: number;
  stadiumUpkeep: number;
  trainingAndYouthAcademy: number;
  medicalAndRecovery: number;
  travelAndMatchOps: number;
  debtAndInterest: number;
  otherExpenses: number;
  totalExpenses: number;
}

export interface TransferStrategy {
  recruitmentFocus: 'develop_youth' | 'balanced' | 'buy_stars' | 'veteran_experience' | 'hidden_gems';
  geographicPreference: 'domestic_priority' | 'balanced' | 'global_scouting' | 'south_american_pipeline';
  financialPhilosophy: 'sustainable_profit' | 'sell_to_buy' | 'moderate_investment' | 'aggressive_spending';
  loanUsage: 'high' | 'moderate' | 'low';
}

export interface ClubFinances {
  clubFame: number; // 0 to 10
  ownerType: OwnerType;
  ownerInvestmentAnnual: number;
  transferBudget: number; // Available liquid transfer spending funds
  wageBudgetWeekly: number; // Maximum sustainable weekly wage cap
  currentWageBillWeekly: number; // Active weekly squad wage bill
  cashBalance: number; // Treasury balance
  totalDebt: number; // Long-term debt commitments
  teamMarketValue: number; // Combined player valuations
  economicTier: EconomicTier;
  financialHealth: FinancialHealth;
  sponsors: ClubSponsor[]; // 1 to 5 sponsors
  revenue: ClubRevenue;
  expenses: ClubExpenses;
  strategy: TransferStrategy;
  lastSeasonNetProfit?: number;
  consecutiveProfitableYears?: number;
}

export interface FameBenchmarkInfo {
  fame: number;
  title: string;
  subtitle: string;
  description: string;
  examples: string[];
  typicalTransferBudgetRange: string;
  typicalMaxWageWeekly: string;
  typicalAnnualRevenueRange: string;
  sponsorTiers: string;
  colorClass: string;
  badgeBg: string;
}

export interface TransferAffordabilityCheck {
  isAffordable: boolean;
  maxAffordableFee: number;
  maxAffordableWeeklyWage: number;
  totalDealCostOverContract: number;
  reasons: string[];
  score: number; // 0 to 100
}

export interface PlayerAttractionAssessment {
  willJoin: boolean;
  attractionScore: number; // 0 to 100
  fameDelta: number;
  prestigeAppeal: number;
  financialAppeal: number;
  sportingAppeal: number;
  reasons: string[];
}
