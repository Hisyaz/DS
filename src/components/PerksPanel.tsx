import React, { useState, useMemo } from 'react';
import { PlayerCardData } from '../types';
import {
  CAREER_PERKS_REGISTRY,
  getActivePerks,
  getPerkById,
  getLocalizedPerk,
  CareerPerk,
  ensurePlayerPerksSync,
} from '../utils/perksSystem';
import { PerkIcon } from './PerkIcon';
import {
  Sparkles,
  ShieldAlert,
  Award,
  Lock,
  CheckCircle2,
  XCircle,
  Info,
  Search,
  Target,
  Zap,
  HelpCircle,
  Flame,
  ArrowRight,
  Shield,
  Eye,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PerksPanelProps {
  player: PlayerCardData;
  onUpdatePlayer?: (updated: PlayerCardData) => void;
}

export const PerksPanel: React.FC<PerksPanelProps> = ({ player }) => {
  const { t, language } = useLanguage();
  const syncedPlayer = ensurePlayerPerksSync(player);
  const rawActivePerks = getActivePerks(syncedPlayer);
  const activePerks = useMemo(
    () => rawActivePerks.map((p) => getLocalizedPerk(p, language)),
    [rawActivePerks, language]
  );
  const activeIds = syncedPlayer.activePerkIds || [];
  const retiredIds = syncedPlayer.retiredPerkIds || [];

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED' | 'DEACTIVATED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedPerk, setInspectedPerk] = useState<CareerPerk | null>(null);

  const categories: string[] = [
    'ALL',
    'Key Match',
    'Finance',
    'Lifestyle',
    'Stat',
    'Transfer Market',
    'Parent Card',
  ];

  const localizedRegistry = useMemo(() => {
    return CAREER_PERKS_REGISTRY.map((p) => getLocalizedPerk(p, language));
  }, [language]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: localizedRegistry.length };
    localizedRegistry.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [localizedRegistry]);

  const filteredRegistry = useMemo(() => {
    return localizedRegistry.filter((perk) => {
      // Category filter
      if (selectedCategory !== 'ALL' && perk.category !== selectedCategory) {
        return false;
      }

      // Status filter
      const isActive = activeIds.includes(perk.id);
      const isRetired = retiredIds.includes(perk.id);
      if (statusFilter === 'ACTIVE' && !isActive) return false;
      if (statusFilter === 'DEACTIVATED' && !isRetired) return false;
      if (statusFilter === 'LOCKED' && (isActive || isRetired)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = perk.name.toLowerCase().includes(q);
        const matchDesc = perk.shortDescription.toLowerCase().includes(q);
        const matchEffect = perk.effect.toLowerCase().includes(q);
        const matchObtain = (perk.howToObtain || '').toLowerCase().includes(q);
        const matchCat = perk.category.toLowerCase().includes(q);
        return matchName || matchDesc || matchEffect || matchObtain || matchCat;
      }

      return true;
    });
  }, [selectedCategory, statusFilter, searchQuery, activeIds, retiredIds, localizedRegistry]);

  return (
    <div className="space-y-6 text-white pb-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{t('PERKS_CODEX_HEADER') || 'CAREER PERKS & TRAITS CODEX'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <span>{t('ACTIVE_PERKS') || 'ACTIVE PERKS'}</span>
              <span className="text-amber-400 text-xl font-bold bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-500/40">
                {activePerks.length} / 5
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {t('PERKS_EXPLAINER_TEXT') ||
                'Every perk unlocks powerful permanent advantages. Below you can see your active slots, exact in-game benefits, and how to unlock all 28 perks across your footballing journey.'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-amber-500/40 text-center flex-1 md:flex-initial">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {t('ACTIVE_SLOTS') || 'ACTIVE SLOTS'}
              </div>
              <div className="text-xl font-black text-amber-400">
                {activePerks.length} <span className="text-sm text-slate-500">/ 5</span>
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center flex-1 md:flex-initial">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {t('TOTAL_PERKS') || 'TOTAL PERKS'}
              </div>
              <div className="text-xl font-black text-white">
                {localizedRegistry.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 ACTIVE PERK SLOTS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>ACTIVE PERK SLOTS ({activePerks.length} OF 5 EQUIPPED)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold">
            Max 5 active perks allowed simultaneously
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[0, 1, 2, 3, 4].map((slotIndex) => {
            const perk = activePerks[slotIndex];
            if (perk) {
              return (
                <div
                  key={perk.id}
                  onClick={() => setInspectedPerk(perk)}
                  className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 shadow-xl flex flex-col justify-between hover:border-amber-400 hover:scale-[1.02] transition-all cursor-pointer group relative"
                >
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase">
                    SLOT {slotIndex + 1}
                  </div>

                  <div>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/30 to-slate-800 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform shadow-md">
                      <PerkIcon iconName={perk.iconName} className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-black text-amber-300 uppercase tracking-wide mb-1 leading-snug">
                      {perk.name}
                    </div>
                    <div className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-amber-400/90 border border-slate-700 uppercase mb-2">
                      {perk.category}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mb-3">
                      {perk.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {/* Benefit Box */}
                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[10px] text-emerald-300 leading-tight">
                      <div className="font-black text-emerald-400 uppercase flex items-center gap-1 mb-0.5">
                        <Sparkles className="w-3 h-3" /> BENEFIT:
                      </div>
                      <span className="font-semibold text-slate-200">{perk.effect}</span>
                    </div>

                    {/* How Obtained Box */}
                    <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/30 text-[10px] text-sky-300 leading-tight">
                      <div className="font-black text-sky-400 uppercase flex items-center gap-1 mb-0.5">
                        <Target className="w-3 h-3" /> HOW OBTAINED:
                      </div>
                      <span className="font-medium text-slate-300 line-clamp-2">{perk.howToObtain}</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Empty Slot
            return (
              <div
                key={`empty-${slotIndex}`}
                className="p-4 rounded-2xl bg-slate-900/30 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center gap-2 min-h-[220px]"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase">
                    SLOT {slotIndex + 1} AVAILABLE
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 max-w-[140px] leading-tight">
                    Earned perks from career milestones or cards will fill this slot automatically.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERK DIRECTORY: HOW TO OBTAIN & BENEFITS OF ALL 28 PERKS */}
      <div className="pt-6 border-t border-slate-800 space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              <span>PERKS CODEX: UNLOCK CRITERIA & BENEFITS</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review every available perk, how to trigger its unlock condition, and the full active advantage it provides.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search perk name, benefit, criteria..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar: Category Pills & Status Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      selectedCategory === cat
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
            {(['ALL', 'ACTIVE', 'LOCKED', 'DEACTIVATED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRegistry.map((perk) => {
            const isActive = activeIds.includes(perk.id);
            const isRetired = retiredIds.includes(perk.id);
            const activeSlotIndex = activeIds.indexOf(perk.id);

            return (
              <div
                key={perk.id}
                onClick={() => setInspectedPerk(perk)}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer hover:scale-[1.01] ${
                  isActive
                    ? 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-950 border-amber-500 shadow-xl shadow-amber-950/40'
                    : isRetired
                    ? 'bg-slate-900/40 border-rose-900/50 opacity-70'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-600 shadow-lg'
                }`}
              >
                <div>
                  {/* Top Bar: Icon, Name, Category & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-md ${
                          isActive
                            ? 'bg-gradient-to-br from-amber-500/40 to-slate-800 border-amber-400 text-amber-300'
                            : isRetired
                            ? 'bg-rose-950/60 border-rose-700 text-rose-300'
                            : 'bg-slate-800 border-slate-700 text-amber-400'
                        }`}
                      >
                        <PerkIcon iconName={perk.iconName} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-white truncate leading-tight">
                          {perk.name}
                        </h4>
                        <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-400/90 border border-slate-700/80 mt-1">
                          {perk.category}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isActive && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" /> SLOT {activeSlotIndex + 1} ACTIVE
                        </span>
                      )}
                      {isRetired && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                          <XCircle className="w-3.5 h-3.5" /> DEACTIVATED
                        </span>
                      )}
                      {!isActive && !isRetired && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 text-[10px] font-bold uppercase flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> UNLOCKABLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {perk.shortDescription}
                  </p>
                </div>

                {/* Structured Sections: 1. BENEFIT & 2. HOW TO OBTAIN */}
                <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
                  {/* 1. BENEFIT CALLOUT */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/40 text-xs">
                    <div className="flex items-center gap-1.5 font-black text-emerald-400 uppercase text-[11px] mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WHAT BENEFIT IT GIVES:</span>
                    </div>
                    <p className="text-slate-200 font-semibold text-[11px] leading-relaxed">
                      {perk.effect}
                    </p>
                  </div>

                  {/* 2. HOW TO OBTAIN CALLOUT */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-sky-950/40 to-slate-900 border border-sky-500/30 text-xs">
                    <div className="flex items-center gap-1.5 font-black text-sky-400 uppercase text-[11px] mb-1">
                      <Target className="w-3.5 h-3.5 text-sky-400" />
                      <span>HOW TO OBTAIN / UNLOCK:</span>
                    </div>
                    <p className="text-slate-300 font-medium text-[11px] leading-relaxed">
                      {perk.howToObtain}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-amber-400/80 font-bold">
                      <Eye className="w-3 h-3" /> Click card for deep dive
                    </span>
                    <span className="font-semibold text-slate-500 uppercase">{perk.category} Perk</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Result Fallback */}
        {filteredRegistry.length === 0 && (
          <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No Perks Match Your Filter</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try clearing your search keyword or switching category tabs to see all 28 career perks.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase cursor-pointer hover:bg-amber-400 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Permanently Deactivated Perks Banner */}
      {retiredIds.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-rose-950/30 border-2 border-rose-500/40 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>PERMANENTLY DEACTIVATED PERKS ({retiredIds.length})</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The following perks were replaced when gaining new traits and have been permanently deactivated for this career save:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {retiredIds.map((id) => {
              const p = getPerkById(id);
              return (
                <div
                  key={id}
                  onClick={() => p && setInspectedPerk(p)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-rose-500/40 text-xs font-bold text-rose-300 flex items-center gap-2 cursor-pointer hover:border-rose-400 transition"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{p?.name || id}</span>
                  <span className="text-[10px] text-rose-400/70 font-mono">(Deactivated)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PERK DEEP DIVE MODAL */}
      {inspectedPerk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl text-white max-h-[90vh] flex flex-col overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setInspectedPerk(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-5 shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-slate-800 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-xl shrink-0">
                <PerkIcon iconName={inspectedPerk.iconName} className="w-8 h-8" />
              </div>
              <div className="min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    {inspectedPerk.category} PERK
                  </span>
                  {activeIds.includes(inspectedPerk.id) && (
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> EQUIPPED (SLOT {activeIds.indexOf(inspectedPerk.id) + 1})
                    </span>
                  )}
                  {retiredIds.includes(inspectedPerk.id) && (
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> DEACTIVATED
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  {inspectedPerk.name}
                </h3>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
              {/* Lore / Description */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  PERK OVERVIEW
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {inspectedPerk.shortDescription}
                </p>
              </div>

              {/* Story / Realization Narrative */}
              {inspectedPerk.storyNarrative && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-md">
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>CAREER REALIZATION: {inspectedPerk.storyTitle || inspectedPerk.name}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed italic font-serif bg-black/40 p-3 rounded-xl border border-amber-500/20">
                    “{inspectedPerk.storyNarrative}”
                  </p>
                </div>
              )}

              {/* Exact Benefit Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-2 border-emerald-500/60 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>EXACT BENEFIT & ATTRIBUTE MODIFIERS</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-bold leading-relaxed bg-black/30 p-3 rounded-xl border border-emerald-500/20">
                  {inspectedPerk.effect}
                </p>
              </div>

              {/* How to Obtain Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/60 via-slate-900 to-slate-900 border-2 border-sky-500/50 shadow-lg">
                <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase mb-2">
                  <Target className="w-4 h-4 text-sky-400" />
                  <span>HOW TO OBTAIN / UNLOCK CRITERIA</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed bg-black/30 p-3 rounded-xl border border-sky-500/20">
                  {inspectedPerk.howToObtain}
                </p>
              </div>

              {/* Status Note */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Category: <strong className="text-white">{inspectedPerk.category}</strong></span>
                <span>Active Slots Limit: <strong className="text-amber-400">5 Perks Max</strong></span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-800 shrink-0 flex justify-end">
              <button
                onClick={() => setInspectedPerk(null)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-amber-400 active:scale-95 transition"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
