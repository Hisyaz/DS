import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Layers,
  Sparkles,
  Shield,
  Award,
  HeartHandshake,
  Briefcase,
  UserCheck,
  Flame,
  Info,
  ChevronRight,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { CustomCard, CustomCardCategory, CustomCardTier } from '../types';
import {
  getStoreCollection,
  subscribeToStoreCollection,
  StoreCollection,
  getNewCardQueues,
  subscribeToNewCardQueues,
  getNewCardCount,
  NewCardQueues,
  isCardEligibleForUniqueCareerActiveDeck,
} from '../utils/storeCollectionSystem';
import { getAllDefaultCustomCards } from '../utils/cardDatabaseSystem';
import {
  PixelCardsIcon,
  PixelSparklesIcon,
  PixelStarIcon,
  PixelCheckIcon,
  PixelCloseIcon,
  PixelCoinIcon,
} from './pixel/PixelIcons';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';
import { isHighQualityModeActive } from '../utils/graphicSettingsSystem';

interface CardCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onOpenStore?: () => void;
  t?: (key: string) => string;
}

const CATEGORY_NAMES: Record<string, string> = {
  all: 'All Categories',
  parents: 'Parent Cards',
  youth: 'Youth Cards',
  career: 'Career Cards',
  sponsor: 'Sponsor Cards',
  life: 'Lifestyle Cards',
  agent: 'Agent Cards',
  street: 'Street Cards',
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  bronze: { bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-700/60', label: 'Bronze' },
  silver: { bg: 'bg-slate-800/90', text: 'text-slate-200', border: 'border-slate-500/60', label: 'Silver' },
  gold: { bg: 'bg-yellow-950/80', text: 'text-yellow-300', border: 'border-yellow-500/80', label: 'Gold' },
  legendary: { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-500/80', label: 'Legendary' },
  iconic: { bg: 'bg-amber-900/80', text: 'text-amber-200', border: 'border-amber-400/90', label: 'Iconic' },
  obsidian_knife: { bg: 'bg-stone-900', text: 'text-stone-300', border: 'border-stone-600', label: 'Obsidian Knife' },
  copper_dagger: { bg: 'bg-orange-950/80', text: 'text-orange-300', border: 'border-orange-600/70', label: 'Copper Dagger' },
  steel_blade: { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-500/70', label: 'Steel Blade' },
  muramasa_blade: { bg: 'bg-rose-950/90', text: 'text-rose-300', border: 'border-rose-500/80', label: 'Muramasa Blade' },
  scrap: { bg: 'bg-zinc-900', text: 'text-zinc-400', border: 'border-zinc-700', label: 'Scrap' },
  rust: { bg: 'bg-amber-950/90', text: 'text-amber-600', border: 'border-amber-800/60', label: 'Rust' },
  ash: { bg: 'bg-neutral-900', text: 'text-neutral-400', border: 'border-neutral-700', label: 'Ash' },
  disaster: { bg: 'bg-red-950/90', text: 'text-red-400', border: 'border-red-800/80', label: 'Disaster' },
};

export const CardCollectionModal: React.FC<CardCollectionModalProps> = ({
  isOpen,
  onClose,
  showToast,
  onOpenStore,
  t = (s) => s,
}) => {
  const [collection, setCollection] = useState<StoreCollection>(getStoreCollection());
  const [newCardQueues, setNewCardQueues] = useState<NewCardQueues>(getNewCardQueues());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInspectCard, setSelectedInspectCard] = useState<CustomCard | null>(null);
  const [showActiveDeckRules, setShowActiveDeckRules] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    setCollection(getStoreCollection());
    setNewCardQueues(getNewCardQueues());

    const unsubCol = subscribeToStoreCollection((col) => setCollection(col));
    const unsubQueues = subscribeToNewCardQueues((q) => setNewCardQueues(q));

    return () => {
      unsubCol();
      unsubQueues();
    };
  }, [isOpen]);

  const allCanonicalCards = useMemo(() => getAllDefaultCustomCards(), []);

  // Stats calculation
  const collectionStats = useMemo(() => {
    let ownedUniqueCount = 0;
    let totalCopiesCount = 0;

    allCanonicalCards.forEach((card) => {
      const count = collection[card.id] || 0;
      if (count > 0) {
        ownedUniqueCount++;
        totalCopiesCount += count;
      }
    });

    return {
      ownedUniqueCount,
      totalPossibleCount: allCanonicalCards.length,
      totalCopiesCount,
    };
  }, [allCanonicalCards, collection]);

  const totalPendingGuarantees = useMemo(() => {
    return Object.values(newCardQueues).reduce((acc, q) => acc + (q?.length || 0), 0);
  }, [newCardQueues]);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return allCanonicalCards.filter((card) => {
      if (selectedCategoryFilter !== 'all') {
        const matches =
          selectedCategoryFilter === 'life'
            ? card.category === 'life'
            : selectedCategoryFilter === 'agent'
            ? card.category === 'agent'
            : card.category.includes(selectedCategoryFilter as any);
        if (!matches) return false;
      }

      if (selectedTierFilter !== 'all') {
        if (selectedTierFilter === 'double_edged') {
          const isDouble =
            card.tier === 'obsidian_knife' ||
            card.tier === 'copper_dagger' ||
            card.tier === 'steel_blade' ||
            card.tier === 'muramasa_blade';
          if (!isDouble) return false;
        } else if (selectedTierFilter === 'negative') {
          const isNeg =
            card.effectCategory === 'negative' ||
            card.tier === 'scrap' ||
            card.tier === 'rust' ||
            card.tier === 'ash' ||
            card.tier === 'disaster';
          if (!isNeg) return false;
        } else if (card.tier !== selectedTierFilter) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = card.name.toLowerCase().includes(query);
        const matchesDesc = (card.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [allCanonicalCards, selectedCategoryFilter, selectedTierFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      id="card-collection-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="card-collection-modal-window"
        className="pixel-bevel-raised bg-[#080d1a] border-0 sm:border-2 border-blue-500/80 w-full max-w-6xl h-full sm:h-[92vh] sm:max-h-[860px] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= 32-BIT MODAL HEADER ================= */}
        <header className="p-4 sm:p-5 border-b-2 border-blue-500/50 bg-[#050914] shrink-0 flex flex-wrap items-center justify-between gap-3 relative">
          {/* Header Left: Icon & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600/30 border-2 border-blue-400 text-blue-300 flex items-center justify-center shadow-md shrink-0">
              <PixelCardsIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-arcade tracking-wide text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {t('CARD COLLECTION')}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase bg-blue-950 text-blue-300 border border-blue-400">
                  {t('ALBUM & DECK')}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                {t('View canonical cards unlocked across your saves. Active deck draws adapt as your collection expands.')}
              </p>
            </div>
          </div>

          {/* Header Right: Stats Badges & Close */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Owned Unique Cards Badge */}
            <div className="px-3 py-1.5 bg-[#0b1329] border border-blue-400/60 flex items-center gap-2 shadow-inner">
              <span className="text-[10px] uppercase font-mono font-black text-blue-300">
                {t('UNLOCKED:')}
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-white">
                {collectionStats.ownedUniqueCount} / {collectionStats.totalPossibleCount}
              </span>
            </div>

            {/* Total Copies */}
            <div className="hidden sm:flex px-3 py-1.5 bg-[#0b1329] border border-amber-500/60 items-center gap-1.5 shadow-inner text-amber-300">
              <span className="text-[10px] uppercase font-mono font-black">{t('COPIES:')}</span>
              <span className="text-sm font-black font-mono text-yellow-300">
                x{collectionStats.totalCopiesCount}
              </span>
            </div>

            {/* Guaranteed New Card Draws badge */}
            {totalPendingGuarantees > 0 && (
              <div
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-yellow-950/80 border border-yellow-400 text-yellow-300 text-xs font-mono font-bold shadow-sm"
                title={`${totalPendingGuarantees} card copies guaranteed to appear on next matching Unique Career draw.`}
              >
                <PixelSparklesIcon size={14} color="#facc15" />
                <span>
                  {totalPendingGuarantees} {t('Draw Guarantee')}{totalPendingGuarantees > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Deck Synergies / Rules Toggle */}
            <button
              type="button"
              onClick={() => setShowActiveDeckRules(!showActiveDeckRules)}
              className={`px-3 py-1.5 border text-xs font-arcade uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                showActiveDeckRules
                  ? 'bg-emerald-600 text-slate-950 border-emerald-400 font-black'
                  : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-500/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{t('DECK RULES')}</span>
            </button>

            {/* Quick Link to Store */}
            {onOpenStore && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStore();
                }}
                className="hidden lg:flex px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-400 text-xs font-arcade font-black uppercase tracking-wider items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <PixelCoinIcon size={14} />
                <span>{t('BUY PACKS')}</span>
              </button>
            )}

            {/* Close Button */}
            <button
              id="card-collection-modal-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-900 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-500 transition-colors cursor-pointer"
              aria-label="Close Card Collection"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ================= ACTIVE DECK RULES EXPANDABLE ACCORDION ================= */}
        {showActiveDeckRules && (
          <div className="p-4 bg-[#0a1124] border-b-2 border-emerald-500/50 space-y-3 shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-arcade font-black text-sm uppercase">
                <Zap className="w-4 h-4" />
                <span>{t('UNIQUE CAREER ACTIVE DECK RULES')}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowActiveDeckRules(false)}
                className="text-xs text-slate-400 hover:text-white font-mono"
              >
                [{t('CLOSE RULES')}]
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-black/50 border border-emerald-500/30 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <span>1. {t('Universal Baseline')}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {t('All 15 standard Bronze cards are active by default across all career playthroughs with equal draw weight.')}
                </p>
              </div>
              <div className="p-3 bg-black/50 border border-emerald-500/30 space-y-1">
                <div className="font-bold text-yellow-300 flex items-center gap-1">
                  <span>2. {t('Permanent Unlocks')}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {t('Silver, Gold, Legendary and Iconic cards unlocked via Card Store packs are added permanently into your career draw pool.')}
                </p>
              </div>
              <div className="p-3 bg-black/50 border border-emerald-500/30 space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1">
                  <span>3. {t('Double-Edged Blades')}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {t('Copper Daggers, Steel Blades and Muramasa Blades grant massive stat gains at the cost of injury, stamina or discipline risk.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= 32-BIT FILTER & SEARCH TOOLBAR ================= */}
        <div className="p-3 sm:p-4 bg-[#050814] border-b border-blue-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search cards by name or effect...')}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-sans focus:outline-none focus:border-blue-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              aria-label="Filter cards by category"
              className="px-3 py-2 bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="all">{t('All Categories')}</option>
              <option value="parents">{t('Parent Cards')}</option>
              <option value="youth">{t('Youth Cards')}</option>
              <option value="career">{t('Career Cards')}</option>
              <option value="sponsor">{t('Sponsor Cards')}</option>
              <option value="life">{t('Lifestyle Cards')}</option>
              <option value="agent">{t('Agent Cards')}</option>
              <option value="street">{t('Street Cards')}</option>
            </select>

            {/* Tier Filter */}
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              aria-label="Filter cards by tier"
              className="px-3 py-2 bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-200 focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="all">{t('All Tiers')}</option>
              <option value="bronze">{t('Bronze (Default)')}</option>
              <option value="silver">{t('Silver')}</option>
              <option value="gold">{t('Gold')}</option>
              <option value="legendary">{t('Legendary')}</option>
              <option value="iconic">{t('Iconic')}</option>
              <option value="double_edged">{t('Double-Edged Blades')}</option>
              <option value="negative">{t('Negative / Hazard')}</option>
            </select>
          </div>
        </div>

        {/* ================= CARDS GRID VIEW ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-[#070b17]">
          {filteredCards.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">
                <PixelCardsIcon size={24} />
              </div>
              <p className="text-sm font-arcade uppercase text-slate-400">
                {t('No cards matching current filters')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryFilter('all');
                  setSelectedTierFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono uppercase text-blue-300 border border-slate-600 cursor-pointer"
              >
                {t('Reset Filters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredCards.map((card) => {
                const ownedCount = collection[card.id] || 0;
                const newCopiesCount = getNewCardCount(card.id);
                const tierStyle = TIER_COLORS[card.tier] || {
                  bg: 'bg-slate-900',
                  text: 'text-slate-300',
                  border: 'border-slate-700',
                  label: card.tier,
                };
                const isOwned = ownedCount > 0;

                return (
                  <div
                    key={card.id}
                    id={`collection-card-${card.id}`}
                    onClick={() => {
                      audioManager.playCardFlipSound();
                      haptics.lightTap();
                      setSelectedInspectCard(card);
                    }}
                    className={`p-4 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden text-left ${
                      newCopiesCount > 0
                        ? 'pixel-bevel-gold bg-[#0d1627] border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.25)] hover:-translate-y-1'
                        : isOwned
                        ? 'pixel-bevel-raised bg-[#0a1020] border-blue-500/70 hover:border-blue-400 hover:-translate-y-1'
                        : 'bg-[#050810]/70 border-slate-800 opacity-60 hover:opacity-90 hover:border-slate-600'
                    }`}
                  >
                    {/* Holographic foil shimmer in High Quality mode */}
                    {isHighQualityModeActive() &&
                      ['silver', 'gold', 'legendary', 'iconic'].includes(card.tier.toLowerCase()) && (
                        <div className="holo-foil-shimmer" />
                      )}

                    {/* Top Row: Rarity Badge & Count */}
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2.5">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-mono font-black uppercase border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                        >
                          {tierStyle.label}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {newCopiesCount > 0 && (
                            <span
                              className="px-1.5 py-0.5 text-[8px] font-mono font-black uppercase bg-yellow-400 text-slate-950 animate-pulse shadow-sm"
                              title={`${newCopiesCount} guaranteed new card copy in next draw`}
                            >
                              ✨ NEW
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 font-mono text-[10px] font-black border ${
                              isOwned
                                ? 'bg-amber-950/90 text-amber-300 border-amber-500/60'
                                : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}
                          >
                            x{ownedCount}
                          </span>
                        </div>
                      </div>

                      {/* Card Title */}
                      <h4 className="text-sm font-black font-arcade text-white leading-tight mb-1">
                        {card.name}
                      </h4>

                      {/* Card Category */}
                      <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">
                        {CATEGORY_NAMES[card.category] || card.category}
                      </span>

                      {/* Short Description */}
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {card.description || 'Custom canonical career effect card.'}
                      </p>
                    </div>

                    {/* Bottom Status Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className={isOwned ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {isOwned ? t('✓ UNLOCKED') : t('🔒 LOCKED')}
                      </span>
                      <span className="text-blue-400 hover:text-blue-300 font-bold">
                        {t('INSPECT ▶')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= 32-BIT CARD INSPECTION MODAL ================= */}
        {selectedInspectCard && (
          <div
            className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150"
            onClick={() => setSelectedInspectCard(null)}
          >
            <div
              className="pixel-bevel-gold bg-[#080d1a] border-2 border-yellow-400/90 p-5 sm:p-7 max-w-lg w-full text-left relative shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-yellow-300">
                    <PixelCardsIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-arcade text-white uppercase">
                      {selectedInspectCard.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {CATEGORY_NAMES[selectedInspectCard.category] || selectedInspectCard.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInspectCard(null)}
                  className="p-1.5 bg-slate-900 text-slate-300 hover:text-white border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rarity & Ownership */}
              <div className="flex items-center justify-between gap-2 p-3 bg-black/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-slate-400">{t('TIER:')}</span>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-mono font-black uppercase ${
                      TIER_COLORS[selectedInspectCard.tier]?.text || 'text-white'
                    }`}
                  >
                    {TIER_COLORS[selectedInspectCard.tier]?.label || selectedInspectCard.tier}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-slate-400">{t('OWNED:')}</span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    x{collection[selectedInspectCard.id] || 0}
                  </span>
                </div>
              </div>

              {/* Description & Effects */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-black uppercase text-amber-300">
                  {t('EFFECT & ATTRIBUTES')}
                </h4>
                <div className="p-3.5 bg-[#0a1122] border border-blue-500/40 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedInspectCard.description}
                </div>
              </div>

              {/* Active Deck Eligibility */}
              <div className="p-3 bg-black/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 uppercase">{t('UNIQUE CAREER DECK:')}</span>
                <span
                  className={
                    isCardEligibleForUniqueCareerActiveDeck(selectedInspectCard, collection)
                      ? 'text-emerald-400 font-bold flex items-center gap-1'
                      : 'text-amber-400 font-bold flex items-center gap-1'
                  }
                >
                  {isCardEligibleForUniqueCareerActiveDeck(selectedInspectCard, collection)
                    ? `✓ ${t('ACTIVE IN DRAW POOL')}`
                    : `🔒 ${t('UNLOCK VIA PACKS')}`}
                </span>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedInspectCard(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-slate-950 font-arcade font-black text-xs uppercase pixel-bevel-raised cursor-pointer"
                >
                  {t('CLOSE')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
