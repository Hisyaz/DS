import React, { useState } from 'react';
import { EditorTeamData, ClubTrophyData } from '../../../types/leagueEditor';
import {
  Landmark,
  Trophy,
  Award,
  Crown,
  Globe,
  Sparkles,
  Shield,
  Coffee,
  GraduationCap,
  Medal,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';

interface ClubHistorySectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

type TrophyCategoryFilter = 'all' | 'international' | 'national' | 'friendly';

interface TrophyTierConfig {
  id: keyof ClubTrophyData;
  tierLabel: string;
  title: string;
  examples: string;
  category: 'international' | 'national' | 'friendly';
  color: {
    badge: string;
    border: string;
    bg: string;
    text: string;
    iconBg: string;
    button: string;
  };
  icon: React.ComponentType<{ className?: string }>;
}

const TROPHY_TIERS: TrophyTierConfig[] = [
  // INTERNATIONAL
  {
    id: 'worldClubCups',
    tierLabel: 'Tier 1 • World Championship',
    title: 'World (Intercontinental, Club World Cup)',
    examples: 'FIFA Club World Cup, Intercontinental Cup, Toyota Cup',
    category: 'international',
    color: {
      badge: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
      border: 'border-purple-500/30 hover:border-purple-500/60',
      bg: 'from-purple-950/20 to-slate-900/80',
      text: 'text-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-300',
      button: 'bg-purple-600 hover:bg-purple-500 text-white',
    },
    icon: Globe,
  },
  {
    id: 'primaryContinental',
    tierLabel: 'Tier 2 • Primary Continental',
    title: 'Primary Continental Cup',
    examples: 'UEFA Champions League, Copa Libertadores, CAF/AFC Champions League',
    category: 'international',
    color: {
      badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      bg: 'from-cyan-950/20 to-slate-900/80',
      text: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-300',
      button: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    },
    icon: Trophy,
  },
  {
    id: 'secondaryContinental',
    tierLabel: 'Tier 3 • Secondary Continental',
    title: 'Secondary Continental',
    examples: 'UEFA Europa League, Copa Sudamericana, CAF Confederation Cup',
    category: 'international',
    color: {
      badge: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
      border: 'border-amber-500/30 hover:border-amber-500/60',
      bg: 'from-amber-950/20 to-slate-900/80',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300',
      button: 'bg-amber-600 hover:bg-amber-500 text-slate-950',
    },
    icon: Award,
  },
  {
    id: 'tertiaryContinental',
    tierLabel: 'Tier 4 • 3rd Tier Continental & Supercup',
    title: '3rd Tier Continental',
    examples: 'UEFA Super Cup, UEFA Conference League, Recopa Sudamericana, etc.',
    category: 'international',
    color: {
      badge: 'bg-teal-950/80 text-teal-300 border-teal-800/60',
      border: 'border-teal-500/30 hover:border-teal-500/60',
      bg: 'from-teal-950/20 to-slate-900/80',
      text: 'text-teal-400',
      iconBg: 'bg-teal-500/20 text-teal-300',
      button: 'bg-teal-600 hover:bg-teal-500 text-white',
    },
    icon: Sparkles,
  },

  // NATIONAL
  {
    id: 'leagueTitles',
    tierLabel: 'Tier 1 • Top Flight League',
    title: '1st Division (League Champion)',
    examples: 'Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Primera División',
    category: 'national',
    color: {
      badge: 'bg-yellow-950/80 text-yellow-300 border-yellow-800/60',
      border: 'border-yellow-500/30 hover:border-yellow-500/60',
      bg: 'from-yellow-950/20 to-slate-900/80',
      text: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20 text-yellow-300',
      button: 'bg-yellow-500 hover:bg-yellow-400 text-slate-950',
    },
    icon: Crown,
  },
  {
    id: 'domesticCups',
    tierLabel: 'Tier 2 • National Knockout & Supercups',
    title: 'National Cups',
    examples: 'Domestic Cup (FA Cup, Copa del Rey, DFB-Pokal), Supercup, League Cup',
    category: 'national',
    color: {
      badge: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
      border: 'border-blue-500/30 hover:border-blue-500/60',
      bg: 'from-blue-950/20 to-slate-900/80',
      text: 'text-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-300',
      button: 'bg-blue-600 hover:bg-blue-500 text-white',
    },
    icon: Award,
  },
  {
    id: 'secondDivision',
    tierLabel: 'Tier 3 • Lower Tier & Lower Cups',
    title: '2nd Division & Lower Silverware',
    examples: '2nd division league champions, 2nd division knockout cups, lower tier honours',
    category: 'national',
    color: {
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      border: 'border-slate-700 hover:border-slate-500',
      bg: 'from-slate-900 to-slate-950',
      text: 'text-slate-300',
      iconBg: 'bg-slate-800 text-slate-300',
      button: 'bg-slate-700 hover:bg-slate-600 text-white',
    },
    icon: Shield,
  },

  // FRIENDLY & NON-PROFESSIONAL
  {
    id: 'friendlyCups',
    tierLabel: 'Friendly • Pre-Season & Exhibitions',
    title: 'Pre-Season & Friendly Cups',
    examples: 'Pre-season cups, summer tournaments, Joan Gamper Trophy, Audi Cup, friendly cups',
    category: 'friendly',
    color: {
      badge: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
      border: 'border-rose-500/30 hover:border-rose-500/60',
      bg: 'from-rose-950/20 to-slate-900/80',
      text: 'text-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300',
      button: 'bg-rose-600 hover:bg-rose-500 text-white',
    },
    icon: Coffee,
  },
  {
    id: 'youthLeagues',
    tierLabel: 'Non-Professional • Youth & Reserves Leagues',
    title: 'Youth & Reserves League Titles',
    examples: 'Reserves leagues, U20 league championships, U17 division titles, youth leagues',
    category: 'friendly',
    color: {
      badge: 'bg-violet-950/80 text-violet-300 border-violet-800/60',
      border: 'border-violet-500/30 hover:border-violet-500/60',
      bg: 'from-violet-950/20 to-slate-900/80',
      text: 'text-violet-400',
      iconBg: 'bg-violet-500/20 text-violet-300',
      button: 'bg-violet-600 hover:bg-violet-500 text-white',
    },
    icon: GraduationCap,
  },
  {
    id: 'youthCups',
    tierLabel: 'Non-Professional • Youth & Reserves Cups',
    title: 'Youth & Reserves Cups',
    examples: 'U20 cups, U17 cups, reserves tournament cups, youth knockout silverware',
    category: 'friendly',
    color: {
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      bg: 'from-emerald-950/20 to-slate-900/80',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300',
      button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    icon: Medal,
  },
];

export const ClubHistorySection: React.FC<ClubHistorySectionProps> = ({
  team,
  onUpdate,
  showToast = () => {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TrophyCategoryFilter>('all');

  const rawTrophies: ClubTrophyData = team.trophies || {};
  // Normalize primary continental fallback
  const effectiveTrophies: ClubTrophyData = {
    ...rawTrophies,
    primaryContinental:
      rawTrophies.primaryContinental !== undefined
        ? rawTrophies.primaryContinental
        : rawTrophies.continentalTrophies || 0,
  };

  const updateTrophy = (key: keyof ClubTrophyData, value: number) => {
    const validVal = Math.max(0, Math.floor(value || 0));
    const updates: Partial<ClubTrophyData> = {
      [key]: validVal,
    };
    // Keep continentalTrophies legacy alias synced with primaryContinental
    if (key === 'primaryContinental') {
      updates.continentalTrophies = validVal;
    }

    onUpdate((prev) => ({
      ...prev,
      trophies: {
        ...effectiveTrophies,
        ...updates,
      },
    }));
  };

  // Compute category totals
  const intlTotal =
    (effectiveTrophies.worldClubCups || 0) +
    (effectiveTrophies.primaryContinental || 0) +
    (effectiveTrophies.secondaryContinental || 0) +
    (effectiveTrophies.tertiaryContinental || 0);

  const natTotal =
    (effectiveTrophies.leagueTitles || 0) +
    (effectiveTrophies.domesticCups || 0) +
    (effectiveTrophies.secondDivision || 0);

  const friendlyTotal =
    (effectiveTrophies.friendlyCups || 0) +
    (effectiveTrophies.youthLeagues || 0) +
    (effectiveTrophies.youthCups || 0);

  const totalSilverware = intlTotal + natTotal + friendlyTotal;

  const filteredTiers = TROPHY_TIERS.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 13 • HERITAGE & SILVERWARE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Landmark className="w-7 h-7 text-amber-400" />
            CLUB HERITAGE & TROPHY CABINET
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure club foundation year, official nickname, latin/club motto, and historic silverware cabinet
            divided into International, National, and Friendly/Youth categories ordered by tier.
          </p>
        </div>

        {/* Total trophies pill */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl px-5 py-3 shadow-xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Silverware
            </div>
            <div className="text-2xl font-black font-mono text-white flex items-baseline gap-1.5">
              {totalSilverware}
              <span className="text-xs font-semibold text-amber-400">titles</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOUNDATION & LORE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            Founded Year
          </label>
          <input
            type="number"
            min={1850}
            max={2030}
            value={team.foundedYear || 1900}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                foundedYear: parseInt(e.target.value) || 1900,
              }))
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-white focus:border-amber-500 focus:outline-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Club Nickname
          </label>
          <input
            type="text"
            value={team.nickname || ''}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                nickname: e.target.value,
              }))
            }
            placeholder="e.g. Los Blancos, The Red Devils, Blaugrana"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-amber-500 focus:outline-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            Club Motto
          </label>
          <input
            type="text"
            value={team.motto || ''}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                motto: e.target.value,
              }))
            }
            placeholder="e.g. Més que un club, Victoria Concordia Crescit"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-amber-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* CATEGORY SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* International Summary */}
        <button
          type="button"
          onClick={() => setSelectedCategory(selectedCategory === 'international' ? 'all' : 'international')}
          className={`text-left p-4 rounded-2xl border transition shadow-lg cursor-pointer ${
            selectedCategory === 'international'
              ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              International
            </div>
            <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
              4 Tiers
            </span>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">{intlTotal}</div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">World, Primary & Secondary Continental, Supercups</p>
        </button>

        {/* National Summary */}
        <button
          type="button"
          onClick={() => setSelectedCategory(selectedCategory === 'national' ? 'all' : 'national')}
          className={`text-left p-4 rounded-2xl border transition shadow-lg cursor-pointer ${
            selectedCategory === 'national'
              ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Crown className="w-4 h-4" />
              National
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              3 Tiers
            </span>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">{natTotal}</div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">1st Division League, National Cups, 2nd Division</p>
        </button>

        {/* Friendly / Youth Summary */}
        <button
          type="button"
          onClick={() => setSelectedCategory(selectedCategory === 'friendly' ? 'all' : 'friendly')}
          className={`text-left p-4 rounded-2xl border transition shadow-lg cursor-pointer ${
            selectedCategory === 'friendly'
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Medal className="w-4 h-4" />
              Friendly & Youth
            </div>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              3 Tiers
            </span>
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-white">{friendlyTotal}</div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">Pre-Season cups, Reserves & Youth leagues/cups</p>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-white text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Trophies ({TROPHY_TIERS.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('international')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'international'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-purple-400 hover:text-purple-300 border border-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            International ({intlTotal})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('national')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'national'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'bg-slate-900 text-amber-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            National ({natTotal})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('friendly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'friendly'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-emerald-400 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <Medal className="w-3.5 h-3.5" />
            Friendly & Youth ({friendlyTotal})
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
          Use buttons or type directly in field
        </span>
      </div>

      {/* TROPHY TIERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTiers.map((tier) => {
          const Icon = tier.icon;
          const currentCount = Number(effectiveTrophies[tier.id] || 0);

          return (
            <div
              key={tier.id}
              className={`relative bg-gradient-to-br ${tier.color.bg} border ${tier.color.border} p-5 rounded-2xl shadow-xl transition flex flex-col justify-between gap-4 group`}
            >
              {/* Header: Tier Badge & Icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${tier.color.badge}`}
                  >
                    {tier.tierLabel}
                  </span>
                  <h4 className="text-base font-black text-white tracking-tight">{tier.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{tier.examples}</p>
                </div>

                <div className={`p-3 rounded-xl ${tier.color.iconBg} shrink-0 shadow-inner`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              {/* Counter Controls */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                {/* Direct Numeric Input with large display */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Titles:</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={currentCount}
                    onChange={(e) => updateTrophy(tier.id, parseInt(e.target.value) || 0)}
                    className="w-18 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-center text-lg font-black font-mono text-white focus:border-cyan-500 focus:outline-none transition shadow-inner"
                  />
                </div>

                {/* Stepper Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateTrophy(tier.id, currentCount - 1)}
                    disabled={currentCount <= 0}
                    className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 disabled:opacity-40 transition flex items-center justify-center cursor-pointer shadow"
                    title="-1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTrophy(tier.id, currentCount + 1)}
                    className={`w-8 h-8 rounded-lg font-bold transition flex items-center justify-center cursor-pointer shadow-md ${tier.color.button}`}
                    title="+1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTrophy(tier.id, currentCount + 5)}
                    className="px-2 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 border border-slate-700 transition flex items-center justify-center cursor-pointer shadow"
                    title="+5 titles"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
