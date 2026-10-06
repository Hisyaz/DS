import React, { useState } from 'react';
import { EditorTeamData } from '../types/leagueEditor';
import {
  ClubFinances,
  ClubSponsor,
  OwnerType,
  SponsorCategory,
  CLUB_FAME_BENCHMARKS,
  calculateClubFinancialProfile,
  generateClubSponsors,
  formatCurrencyEuro,
  calculateRealisticPlayerMarketValue,
} from '../utils/clubEconomySystem';
import {
  DollarSign,
  TrendingUp,
  Landmark,
  Building,
  Award,
  Crown,
  Sparkles,
  Shield,
  Plus,
  Trash2,
  RefreshCw,
  HelpCircle,
  Briefcase,
  Layers,
  ChevronRight,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Globe,
  Sliders,
  Scale,
} from 'lucide-react';

interface TeamFinancesEditorProps {
  team: EditorTeamData;
  onUpdateTeam: (updater: (prev: EditorTeamData) => EditorTeamData) => void;
  showToast: (msg: string) => void;
}

export const TeamFinancesEditor: React.FC<TeamFinancesEditorProps> = ({
  team,
  onUpdateTeam,
  showToast,
}) => {
  const finances: ClubFinances = team.finances || {
    clubFame: 5,
    ownerType: 'private_owner',
    ownerInvestmentAnnual: 0,
    transferBudget: 5000000,
    wageBudgetWeekly: 250000,
    currentWageBillWeekly: 200000,
    cashBalance: 8000000,
    totalDebt: 12000000,
    teamMarketValue: 60000000,
    economicTier: 'developing',
    financialHealth: 'stable',
    sponsors: generateClubSponsors(5, team.countryCode),
    revenue: {
      broadcasting: 8000000,
      matchday: 4000000,
      sponsorships: 4500000,
      merchandising: 2000000,
      memberships: 1500000,
      prizeMoney: 1000000,
      continentalCompetitions: 0,
      domesticCompetitions: 500000,
      playerSales: 2000000,
      loanIncome: 200000,
      otherIncome: 300000,
      totalRevenue: 24000000,
    },
    expenses: {
      playerSalaries: 10400000,
      managerAndCoaching: 1200000,
      staffAndAdmin: 2400000,
      transfersAmortization: 3800000,
      stadiumUpkeep: 880000,
      trainingAndYouthAcademy: 1900000,
      medicalAndRecovery: 720000,
      travelAndMatchOps: 1200000,
      debtAndInterest: 720000,
      otherExpenses: 960000,
      totalExpenses: 24180000,
    },
    strategy: {
      recruitmentFocus: 'balanced',
      geographicPreference: 'domestic_priority',
      financialPhilosophy: 'sustainable_profit',
      loanUsage: 'moderate',
    },
    lastSeasonNetProfit: 1440000,
    consecutiveProfitableYears: 2,
  };

  const [activeFinanceSubTab, setActiveFinanceSubTab] = useState<
    'overview' | 'fame' | 'sponsors' | 'revenue' | 'expenses' | 'strategy'
  >('overview');

  // Helper to update finances
  const updateFinances = (updater: (prev: ClubFinances) => ClubFinances) => {
    onUpdateTeam((prev) => {
      const currentFinances = prev.finances || finances;
      const updated = updater(currentFinances);
      return {
        ...prev,
        finances: updated,
      };
    });
  };

  // Calculate actual player roster market value sum
  const calculatedRosterMarketValue = React.useMemo(() => {
    let sum = 0;
    if (team.squadSaveFile) {
      const groups = ['squad', 'reserves', 'u20', 'u17'] as const;
      groups.forEach((g) => {
        const slots = team.squadSaveFile?.[g];
        if (Array.isArray(slots)) {
          slots.forEach((s) => {
            if (s.player) {
              const val = calculateRealisticPlayerMarketValue(s.player).marketValue;
              sum += val;
            }
          });
        }
      });
    }
    return sum > 0 ? sum : finances.teamMarketValue;
  }, [team.squadSaveFile, finances.teamMarketValue]);

  // Handle Full Auto-Recalculate Economy
  const handleAutoRecalculate = () => {
    const stadiumCap = team.stadium?.capacity || 35000;
    const weeklySquadWage = finances.currentWageBillWeekly || 150000;
    const profile = calculateClubFinancialProfile(
      finances.clubFame,
      team.countryCode,
      stadiumCap,
      weeklySquadWage,
      finances.ownerType,
      finances.sponsors
    );

    updateFinances((prev) => ({
      ...prev,
      transferBudget: profile.transferBudget,
      wageBudgetWeekly: profile.wageBudgetWeekly,
      cashBalance: profile.cashBalance,
      totalDebt: profile.totalDebt,
      economicTier: profile.economicTier,
      financialHealth: profile.financialHealth,
      revenue: profile.revenue,
      expenses: profile.expenses,
      teamMarketValue: calculatedRosterMarketValue,
    }));

    showToast(`Economy successfully synchronized with Club Fame ${finances.clubFame}!`);
  };

  // Handle Regenerate Sponsors based on Fame
  const handleRegenerateSponsors = () => {
    const newSponsors = generateClubSponsors(finances.clubFame, team.countryCode);
    updateFinances((prev) => {
      const totalSponsorshipRevenue = newSponsors.reduce((s, sp) => s + sp.annualPayment, 0);
      const updatedRevenue = {
        ...prev.revenue,
        sponsorships: totalSponsorshipRevenue,
        totalRevenue: Object.entries(prev.revenue)
          .filter(([k]) => k !== 'totalRevenue' && k !== 'sponsorships')
          .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), totalSponsorshipRevenue),
      };
      return {
        ...prev,
        sponsors: newSponsors,
        revenue: updatedRevenue,
      };
    });
    showToast(`Generated ${newSponsors.length} authentic sponsors for Fame ${finances.clubFame}!`);
  };

  const currentFameBenchmark = CLUB_FAME_BENCHMARKS[Math.min(10, Math.max(0, Math.round(finances.clubFame)))] || CLUB_FAME_BENCHMARKS[5];
  const netAnnualMargin = finances.revenue.totalRevenue - finances.expenses.totalExpenses;

  return (
    <div className="space-y-6">
      {/* TOP HEADER CARDS: CLUB FAME & FINANCIAL HEALTH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Club Fame */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Club Fame
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${currentFameBenchmark.badgeBg}`}>
              Fame {finances.clubFame} / 10
            </span>
          </div>
          <div className="mt-2">
            <div className="text-lg font-black text-white">{currentFameBenchmark.title}</div>
            <p className="text-[11px] text-slate-400 font-medium line-clamp-1">{currentFameBenchmark.subtitle}</p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={finances.clubFame}
              onChange={(e) => {
                const newFame = parseInt(e.target.value, 10);
                updateFinances((prev) => ({
                  ...prev,
                  clubFame: newFame,
                }));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Card 2: Annual Turnover & Profit */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Annual Turnover
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
              netAnnualMargin >= 0
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-rose-950/80 border-rose-600 text-rose-300'
            }`}>
              {netAnnualMargin >= 0 ? '+Profit' : 'Deficit'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-emerald-400 font-mono">
              {formatCurrencyEuro(finances.revenue.totalRevenue)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
              <span>Expenses: {formatCurrencyEuro(finances.expenses.totalExpenses)}</span>
              <span>•</span>
              <span className={netAnnualMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                Net: {netAnnualMargin >= 0 ? '+' : ''}{formatCurrencyEuro(netAnnualMargin)}
              </span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">
            Roster Value: {formatCurrencyEuro(calculatedRosterMarketValue)}
          </div>
        </div>

        {/* Card 3: Transfer & Wage Budgets */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-sky-400" />
              Transfer & Wages
            </span>
            <button
              type="button"
              onClick={handleAutoRecalculate}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 flex items-center gap-1 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Sync Economy
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">Transfer Budget</span>
              <span className="text-sm font-black text-white font-mono">
                {formatCurrencyEuro(finances.transferBudget)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">Max Wage Budget</span>
              <span className="text-sm font-black text-sky-400 font-mono">
                {formatCurrencyEuro(finances.wageBudgetWeekly)}/wk
              </span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Treasury: {formatCurrencyEuro(finances.cashBalance)}</span>
            <span>Debt: {formatCurrencyEuro(finances.totalDebt)}</span>
          </div>
        </div>
      </div>

      {/* FINANCE NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveFinanceSubTab('overview')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeFinanceSubTab === 'overview'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Financial Health
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceSubTab('fame')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeFinanceSubTab === 'fame'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          Fame Scale (0–10)
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceSubTab('sponsors')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeFinanceSubTab === 'sponsors'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-pink-400" />
          Sponsors ({finances.sponsors?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceSubTab('revenue')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeFinanceSubTab === 'revenue'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          Revenue Streams
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceSubTab('expenses')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeFinanceSubTab === 'expenses'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-rose-400" />
          Expenses Breakdown
        </button>

        <button
          type="button"
          onClick={() => setActiveFinanceSubTab('strategy')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeFinanceSubTab === 'strategy'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          Transfer Policy
        </button>
      </div>

      {/* SUBTAB 1: FINANCIAL HEALTH & BALANCE SHEET */}
      {activeFinanceSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ownership Structure */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-4 h-4 text-indigo-400" />
                Ownership & Governance
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Owner Model</label>
                <select
                  value={finances.ownerType}
                  onChange={(e) => {
                    const newOwner = e.target.value as OwnerType;
                    updateFinances((prev) => ({
                      ...prev,
                      ownerType: newOwner,
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="member_owned">Member-Owned / Socios (Real Madrid, Barca, River, Boca, German 50+1)</option>
                  <option value="private_owner">Private Businessman / Traditional Local Owner</option>
                  <option value="investment_group">Private Equity / Multi-Club Ownership Group</option>
                  <option value="billionaire">Billionaire Tycoon / Wealthy Patron</option>
                  <option value="corporation">Corporate Conglomerate (Leverkusen/Bayer, Wolfsburg/VW)</option>
                  <option value="state_backed">State-Backed / Sovereign Investment Fund</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Annual Owner Funding Support (€)</label>
                <input
                  type="number"
                  step={1000000}
                  value={finances.ownerInvestmentAnnual}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    updateFinances((prev) => ({
                      ...prev,
                      ownerInvestmentAnnual: val,
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white font-mono focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Direct capital contribution injected by the owner per campaign.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Treasury Cash Balance (€)</label>
                <input
                  type="number"
                  step={500000}
                  value={finances.cashBalance}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    updateFinances((prev) => ({
                      ...prev,
                      cashBalance: val,
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 font-mono focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Long-Term Club Debt (€)</label>
                <input
                  type="number"
                  step={1000000}
                  value={finances.totalDebt}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    updateFinances((prev) => ({
                      ...prev,
                      totalDebt: val,
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 font-mono focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Spending Limits & Budgets */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-400" />
                Active Budgets & Caps
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Liquid Transfer Budget (€)</label>
                <input
                  type="number"
                  step={500000}
                  value={finances.transferBudget}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    updateFinances((prev) => ({
                      ...prev,
                      transferBudget: val,
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white font-mono focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Maximum Weekly Wage Budget (€/wk)</label>
                <input
                  type="number"
                  step={10000}
                  value={finances.wageBudgetWeekly}
                  onChange={(e) => {
                    const val = Math.max(100, parseInt(e.target.value, 10) || 100);
                    updateFinances((prev) => ({
                      ...prev,
                      wageBudgetWeekly: val,
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-sky-400 font-mono focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Current Squad Wage Bill (€/wk)</label>
                <input
                  type="number"
                  step={10000}
                  value={finances.currentWageBillWeekly}
                  onChange={(e) => {
                    const val = Math.max(100, parseInt(e.target.value, 10) || 100);
                    updateFinances((prev) => ({
                      ...prev,
                      currentWageBillWeekly: val,
                      expenses: {
                        ...prev.expenses,
                        playerSalaries: val * 52,
                        totalExpenses: Object.entries(prev.expenses)
                          .filter(([k]) => k !== 'totalExpenses' && k !== 'playerSalaries')
                          .reduce((sum, [, v]) => sum + (typeof v === 'number' ? v : 0), val * 52),
                      },
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-400 font-mono focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Squad Market Value (€)</label>
                <input
                  type="number"
                  step={1000000}
                  value={finances.teamMarketValue}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    updateFinances((prev) => ({
                      ...prev,
                      teamMarketValue: val,
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white font-mono focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: CLUB FAME SCALE EXPLORER */}
      {activeFinanceSubTab === 'fame' && (
        <div className="space-y-4">
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 text-slate-300">
              <p className="font-bold text-white">
                Club Fame (0 to 10) represents global prestige, historical magnetism, and commercial pull.
              </p>
              <p className="text-slate-400 text-[11px]">
                Club Fame directly regulates sponsor payouts, player willingness to sign, wage expectations, and transfer market credibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {Object.values(CLUB_FAME_BENCHMARKS).map((bench) => {
              const isSelected = Math.round(finances.clubFame) === bench.fame;
              return (
                <button
                  key={bench.fame}
                  type="button"
                  onClick={() => {
                    updateFinances((prev) => ({
                      ...prev,
                      clubFame: bench.fame,
                    }));
                    showToast(`Club Fame set to Level ${bench.fame}: ${bench.title}`);
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/40 shadow-xl'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${bench.colorClass}`}>
                        Fame {bench.fame}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-xs font-black text-white mt-1">{bench.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{bench.subtitle}</div>
                    <p className="text-[11px] text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {bench.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Budgets:</span>
                      <span className="text-white font-bold">{bench.typicalTransferBudgetRange}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Max Wage:</span>
                      <span className="text-sky-300 font-bold">{bench.typicalMaxWageWeekly}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SPONSORS (1 to 5) */}
      {activeFinanceSubTab === 'sponsors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-pink-400" />
                Active Commercial Partnerships ({finances.sponsors?.length || 0}/5)
              </h4>
              <p className="text-[11px] text-slate-400">
                Sponsorship value scales dynamically with Club Fame {finances.clubFame} and market reach.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRegenerateSponsors}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Generate Realistic
              </button>

              {(finances.sponsors?.length || 0) < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    const newSp: ClubSponsor = {
                      id: `sp_custom_${Date.now()}`,
                      name: 'New Commercial Partner',
                      category: 'regional_partner',
                      annualPayment: Math.round(finances.revenue.sponsorships * 0.15 || 500000),
                      contractDurationYears: 3,
                      remainingYears: 3,
                    };
                    updateFinances((prev) => ({
                      ...prev,
                      sponsors: [...(prev.sponsors || []), newSp],
                    }));
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Sponsor
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(finances.sponsors || []).map((sp, idx) => (
              <div
                key={sp.id || idx}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                    {sp.category.replace('_', ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      updateFinances((prev) => ({
                        ...prev,
                        sponsors: prev.sponsors.filter((_, sIdx) => sIdx !== idx),
                      }));
                    }}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition cursor-pointer"
                    title="Remove Sponsor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Partner Brand Name</label>
                    <input
                      type="text"
                      value={sp.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateFinances((prev) => {
                          const copy = [...prev.sponsors];
                          copy[idx] = { ...copy[idx], name: val };
                          return { ...prev, sponsors: copy };
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Annual Payout (€)</label>
                      <input
                        type="number"
                        step={100000}
                        value={sp.annualPayment}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          updateFinances((prev) => {
                            const copy = [...prev.sponsors];
                            copy[idx] = { ...copy[idx], annualPayment: val };
                            const sum = copy.reduce((s, item) => s + item.annualPayment, 0);
                            return {
                              ...prev,
                              sponsors: copy,
                              revenue: {
                                ...prev.revenue,
                                sponsorships: sum,
                              },
                            };
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-emerald-400 font-mono focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Remaining Years</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={sp.remainingYears}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                          updateFinances((prev) => {
                            const copy = [...prev.sponsors];
                            copy[idx] = { ...copy[idx], remainingYears: val };
                            return { ...prev, sponsors: copy };
                          });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white font-mono focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: REVENUE STREAMS */}
      {activeFinanceSubTab === 'revenue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Annual Revenue Streams Breakdown
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Total: {formatCurrencyEuro(finances.revenue.totalRevenue)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(finances.revenue)
              .filter(([k]) => k !== 'totalRevenue')
              .map(([key, value]) => {
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                const numVal = typeof value === 'number' ? value : 0;
                return (
                  <div key={key} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300">{label}</label>
                    <input
                      type="number"
                      step={500000}
                      value={numVal}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        updateFinances((prev) => {
                          const updatedRev = {
                            ...prev.revenue,
                            [key]: val,
                          };
                          const total = Object.entries(updatedRev)
                            .filter(([k]) => k !== 'totalRevenue')
                            .reduce((sum, [, v]) => sum + (typeof v === 'number' ? v : 0), 0);
                          return {
                            ...prev,
                            revenue: { ...updatedRev, totalRevenue: total },
                          };
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 font-mono focus:border-indigo-500"
                    />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUBTAB 5: EXPENSES BREAKDOWN */}
      {activeFinanceSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-400" />
              Annual Operating Expenses Breakdown
            </h4>
            <span className="text-xs font-mono font-bold text-rose-400">
              Total: {formatCurrencyEuro(finances.expenses.totalExpenses)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(finances.expenses)
              .filter(([k]) => k !== 'totalExpenses')
              .map(([key, value]) => {
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                const numVal = typeof value === 'number' ? value : 0;
                return (
                  <div key={key} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300">{label}</label>
                    <input
                      type="number"
                      step={500000}
                      value={numVal}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        updateFinances((prev) => {
                          const updatedExp = {
                            ...prev.expenses,
                            [key]: val,
                          };
                          const total = Object.entries(updatedExp)
                            .filter(([k]) => k !== 'totalExpenses')
                            .reduce((sum, [, v]) => sum + (typeof v === 'number' ? v : 0), 0);
                          return {
                            ...prev,
                            expenses: { ...updatedExp, totalExpenses: total },
                          };
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 font-mono focus:border-indigo-500"
                    />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUBTAB 6: TRANSFER STRATEGY & RECRUITMENT POLICY */}
      {activeFinanceSubTab === 'strategy' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Recruitment Philosophy
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Recruitment Focus</label>
                <select
                  value={finances.strategy?.recruitmentFocus || 'balanced'}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    updateFinances((prev) => ({
                      ...prev,
                      strategy: { ...prev.strategy, recruitmentFocus: val },
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="develop_youth">Develop Youth Academy & Young Prospects</option>
                  <option value="balanced">Balanced Pragmatic Squad Building</option>
                  <option value="buy_stars">Galáctico / High-Profile Star Signings</option>
                  <option value="veteran_experience">Experienced & Seasoned Veterans</option>
                  <option value="hidden_gems">Undervalued Gems & Data Scouting</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Geographic Scouting Focus</label>
                <select
                  value={finances.strategy?.geographicPreference || 'domestic_priority'}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    updateFinances((prev) => ({
                      ...prev,
                      strategy: { ...prev.strategy, geographicPreference: val },
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="domestic_priority">Domestic Market Priority</option>
                  <option value="balanced">Balanced Continental Scouting</option>
                  <option value="global_scouting">Worldwide Global Talent Pipeline</option>
                  <option value="south_american_pipeline">South American Wonderkid Pipeline</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                Financial Management Style
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Transfer Market Philosophy</label>
                <select
                  value={finances.strategy?.financialPhilosophy || 'sustainable_profit'}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    updateFinances((prev) => ({
                      ...prev,
                      strategy: { ...prev.strategy, financialPhilosophy: val },
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="sustainable_profit">Sustainable Operations & Organic Profit</option>
                  <option value="sell_to_buy">Sell-to-Buy Model (Must sell before buying)</option>
                  <option value="moderate_investment">Moderate Structured Investment</option>
                  <option value="aggressive_spending">Aggressive Spending & Trophy Chasing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Loan Usage</label>
                <select
                  value={finances.strategy?.loanUsage || 'moderate'}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    updateFinances((prev) => ({
                      ...prev,
                      strategy: { ...prev.strategy, loanUsage: val },
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-indigo-500 cursor-pointer"
                >
                  <option value="high">High (Extensive loan signings and developments)</option>
                  <option value="moderate">Moderate (Selective loan additions)</option>
                  <option value="low">Low (Prefer permanent acquisitions only)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
