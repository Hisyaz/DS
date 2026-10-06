import React, { useState, useMemo } from 'react';
import { Sparkles, Search, Check, X, Shield, Crown, Award, Flame, Zap, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface GenericCardItem {
  id?: string;
  instanceId?: string;
  name: string;
  rarity?: string;
  tier?: string;
  category?: string;
  categoryLabel?: string;
  description?: string;
  effects?: string[] | Record<string, any>;
  effectDescriptions?: string[];
  perkTitle?: string;
  perkDescription?: string;
  iconName?: string;
  designColor?: string;
  [key: string]: any;
}

export interface TestCardPickerModalProps<T extends GenericCardItem = GenericCardItem> {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  cards: T[];
  onSelectCard: (card: T) => void;
  onClose: () => void;
}

export function TestCardPickerModal<T extends GenericCardItem>({
  isOpen,
  title = 'Test Card Picker',
  subtitle = 'Browse all available cards sorted from Highest to Lowest Tier',
  cards,
  onSelectCard,
  onClose,
}: TestCardPickerModalProps<T>) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Helper to extract rarity string
  const getCardRarity = (card: T): string => {
    return (card.rarity || card.tier || 'Bronze').toLowerCase();
  };

  // Rank rarity from highest (5) to lowest (1)
  const getRarityRank = (rarity: string): number => {
    const r = rarity.toLowerCase();
    if (r.includes('iconic') || r.includes('goat') || r.includes('master') || r.includes('muramasa')) return 5;
    if (r.includes('legendary') || r.includes('steel')) return 4;
    if (r.includes('gold') || r.includes('epic') || r.includes('world') || r.includes('copper')) return 3;
    if (r.includes('silver') || r.includes('rare') || r.includes('elite') || r.includes('stone')) return 2;
    return 1; // bronze / common / amateur / rust
  };

  // Sort cards strictly from Highest to Lowest Tier
  const sortedCards = useMemo(() => {
    const copy = [...cards];
    return copy.sort((a, b) => {
      const rankA = getRarityRank(getCardRarity(a));
      const rankB = getRarityRank(getCardRarity(b));
      if (rankB !== rankA) return rankB - rankA;
      return a.name.localeCompare(b.name);
    });
  }, [cards]);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [cards]);

  // Filtered list
  const filteredCards = useMemo(() => {
    return sortedCards.filter((card) => {
      const cardRarity = getCardRarity(card);
      const rank = getRarityRank(cardRarity);

      // Tier filter
      if (selectedTierFilter !== 'all') {
        if (selectedTierFilter === 'iconic' && rank !== 5) return false;
        if (selectedTierFilter === 'legendary' && rank !== 4) return false;
        if (selectedTierFilter === 'gold' && rank !== 3) return false;
        if (selectedTierFilter === 'silver' && rank !== 2) return false;
        if (selectedTierFilter === 'bronze' && rank !== 1) return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'all') {
        if (card.category !== selectedCategoryFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = card.name.toLowerCase().includes(q);
        const descMatch = (card.description || '').toLowerCase().includes(q);
        const perkMatch = (card.perkTitle || '').toLowerCase().includes(q) || (card.perkDescription || '').toLowerCase().includes(q);
        const effectMatch = Array.isArray(card.effectDescriptions)
          ? card.effectDescriptions.some((e) => e.toLowerCase().includes(q))
          : Array.isArray(card.effects)
          ? card.effects.some((e) => typeof e === 'string' && e.toLowerCase().includes(q))
          : false;

        if (!nameMatch && !descMatch && !perkMatch && !effectMatch) return false;
      }

      return true;
    });
  }, [sortedCards, selectedTierFilter, selectedCategoryFilter, searchQuery]);

  if (!isOpen) return null;

  const getTierBadgeStyle = (rarity: string) => {
    const rank = getRarityRank(rarity);
    switch (rank) {
      case 5:
        return 'bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 text-white border-amber-300 shadow-[0_0_15px_rgba(236,72,153,0.4)]';
      case 4:
        return 'bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-900 text-purple-100 border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.35)]';
      case 3:
        return 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-amber-950 font-black border-yellow-300 shadow-sm';
      case 2:
        return 'bg-gradient-to-r from-slate-300 via-slate-200 to-slate-400 text-slate-900 font-black border-slate-200 shadow-sm';
      default:
        return 'bg-gradient-to-r from-amber-900 via-amber-800 to-stone-800 text-amber-200 border-amber-700/80';
    }
  };

  const getTierLabel = (rarity: string) => {
    const rank = getRarityRank(rarity);
    switch (rank) {
      case 5:
        return '⭐ ICONIC / GOAT';
      case 4:
        return '👑 LEGENDARY';
      case 3:
        return '🥇 GOLD / EPIC';
      case 2:
        return '🥈 SILVER / RARE';
      default:
        return '🥉 BRONZE / COMMON';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl bg-slate-950 border-2 border-emerald-500/50 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.25)] flex flex-col text-left overflow-hidden my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER ================= */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center font-black shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black tracking-wider uppercase font-mono">
                  TEST MODE
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {filteredCards.length} / {cards.length} Cards Available
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate tracking-tight">
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0 border border-slate-700"
            title="Close Card Picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= SEARCH & TIER FILTERS BAR ================= */}
        <div className="bg-slate-900/50 border-b border-slate-800 p-3 sm:p-4 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('Search cards by name, perk, effect...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter dropdown if multiple categories */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">Category:</span>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Categories ({cards.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Tier Filter Buttons (Sorted Highest to Lowest Tier) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: 'all', label: 'All Tiers' },
              { id: 'iconic', label: '⭐ Iconic' },
              { id: 'legendary', label: '👑 Legendary' },
              { id: 'gold', label: '🥇 Gold' },
              { id: 'silver', label: '🥈 Silver' },
              { id: 'bronze', label: '🥉 Bronze' },
            ].map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTierFilter(tier.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                  selectedTierFilter === tier.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= SCROLLABLE CARDS GRID ================= */}
        <div className="p-3 sm:p-5 flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
          {filteredCards.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Layers className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold">No cards match the current search or tier filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTierFilter('all');
                  setSelectedCategoryFilter('all');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredCards.map((card, idx) => {
                const cardKey = card.id || card.instanceId || `card-idx-${idx}`;
                const rarity = getCardRarity(card);
                const isSelected = activeCardId === cardKey;
                const tierStyle = getTierBadgeStyle(rarity);
                const tierLabel = getTierLabel(rarity);

                // Compile effects array
                const effectsList: string[] = [];
                if (Array.isArray(card.effectDescriptions)) {
                  effectsList.push(...card.effectDescriptions);
                } else if (Array.isArray(card.effects)) {
                  card.effects.forEach((e) => {
                    if (typeof e === 'string') effectsList.push(e);
                  });
                } else if (Array.isArray(card.perkEffects)) {
                  effectsList.push(...card.perkEffects);
                }

                return (
                  <div
                    key={cardKey}
                    onClick={() => setActiveCardId(cardKey)}
                    className={`bg-slate-900/90 rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4 relative group cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.01]'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Row: Rarity Tier Badge & Category */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black tracking-wider ${tierStyle}`}>
                          {tierLabel}
                        </span>
                        {card.category && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            {card.category.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      {/* Card Title */}
                      <div>
                        <h3 className="text-sm font-black text-white leading-tight group-hover:text-emerald-300 transition-colors">
                          {card.name}
                        </h3>
                        {card.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {card.description}
                          </p>
                        )}
                      </div>

                      {/* Perk title if present */}
                      {card.perkTitle && (
                        <div className="bg-slate-950/80 border border-slate-800/80 p-2 rounded-xl text-[11px] text-amber-300 font-bold space-y-0.5">
                          <div className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
                            ✨ Perk: {card.perkTitle}
                          </div>
                          {card.perkDescription && (
                            <p className="text-[10px] text-slate-300 font-normal leading-tight">
                              {card.perkDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Effects List */}
                      {effectsList.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {effectsList.slice(0, 3).map((eff, eIdx) => (
                            <div
                              key={eIdx}
                              className="text-[11px] font-medium text-slate-300 flex items-start gap-1.5 leading-snug"
                            >
                              <span className="text-emerald-400 font-bold shrink-0">•</span>
                              <span className="truncate">{eff}</span>
                            </div>
                          ))}
                          {effectsList.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-bold block">
                              +{effectsList.length - 3} more effects...
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-3 mt-3 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCard(card);
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>SELECT THIS CARD</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-3 sm:p-4 shrink-0 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-bold text-[11px]">
            Sorted strictly from highest to lowest tier (Iconic → Legendary → Gold → Silver → Bronze)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
