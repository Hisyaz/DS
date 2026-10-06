import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  Sparkles,
  Eye,
  ChevronRight,
  Check,
  Search,
  Filter,
  Layers,
  ArrowRight,
  X,
  Flame,
  Award,
  Crown,
} from 'lucide-react';
import { CustomCard } from '../types';
import {
  StorePackDefinition,
  StoreCollection,
  isIconicCard,
} from '../utils/storeCollectionSystem';
import { triggerHaptic } from '../utils/haptics';
import {
  PixelIconicSuspenseAndReveal,
  PixelIconicHeroCard,
} from './PixelIconicHeroSequence';
import { CardVisualRenderer } from './CardVisualRenderer';
import { TutorialCalloutArrow } from './TutorialCalloutArrow';

interface BigPackOpeningExperienceProps {
  pack: StorePackDefinition;
  cards: CustomCard[];
  onDone: () => void;
  onInspectCard?: (card: CustomCard) => void;
  collection: StoreCollection;
  credits: number;
  isTutorialFlow?: boolean;
}

// 32-Bit tier color badge mappings
const TIER_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  iconic: { bg: 'bg-cyan-950', text: 'text-cyan-300', border: 'border-cyan-400', label: 'Iconic' },
  legendary: { bg: 'bg-purple-950', text: 'text-purple-300', border: 'border-purple-400', label: 'Legendary' },
  gold: { bg: 'bg-yellow-950', text: 'text-yellow-300', border: 'border-yellow-400', label: 'Gold' },
  silver: { bg: 'bg-slate-900', text: 'text-slate-200', border: 'border-slate-400', label: 'Silver' },
  bronze: { bg: 'bg-amber-950', text: 'text-amber-400', border: 'border-amber-600', label: 'Bronze' },
  muramasa_blade: { bg: 'bg-red-950', text: 'text-red-400', border: 'border-red-500', label: 'Muramasa Blade' },
  steel_blade: { bg: 'bg-zinc-900', text: 'text-zinc-200', border: 'border-zinc-400', label: 'Steel Blade' },
  copper_dagger: { bg: 'bg-orange-950', text: 'text-orange-400', border: 'border-orange-600', label: 'Copper Dagger' },
  obsidian_knife: { bg: 'bg-stone-950', text: 'text-purple-300', border: 'border-purple-600', label: 'Obsidian Knife' },
  ash: { bg: 'bg-stone-950', text: 'text-stone-400', border: 'border-stone-600', label: 'Ash' },
  rust: { bg: 'bg-orange-950', text: 'text-orange-500', border: 'border-orange-800', label: 'Rust' },
  scrap: { bg: 'bg-zinc-950', text: 'text-zinc-400', border: 'border-zinc-700', label: 'Scrap' },
  disaster: { bg: 'bg-red-950', text: 'text-red-400', border: 'border-red-700', label: 'Disaster' },
};

function getTierStyle(tier?: string) {
  if (!tier) return TIER_STYLES.bronze;
  const key = tier.toLowerCase();
  return TIER_STYLES[key] || {
    bg: 'bg-slate-900',
    text: 'text-slate-300',
    border: 'border-slate-600',
    label: tier.toUpperCase(),
  };
}

export const BigPackOpeningExperience: React.FC<BigPackOpeningExperienceProps> = ({
  pack,
  cards,
  onDone,
  collection,
  credits,
  isTutorialFlow = false,
}) => {
  const [stage, setStage] = useState<'pack_burst' | 'summary_grid' | 'iconic_moment' | 'card_list'>('pack_burst');
  const [inspectedCard, setInspectedCard] = useState<CustomCard | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [hasInspectedFirstCard, setHasInspectedFirstCard] = useState<boolean>(false);

  // Track Iconic cards for special reveals
  const iconicCards = useMemo(() => cards.filter(isIconicCard), [cards]);
  const [currentIconicIdx, setCurrentIconicIdx] = useState<number>(0);
  const [iconicRevealStep, setIconicRevealStep] = useState<'suspense' | 'hero'>('suspense');

  // Auto-progress from pack_burst: if Iconic cards exist, trigger iconic suspense reveal first!
  useEffect(() => {
    triggerHaptic(50);
    const timer = setTimeout(() => {
      if (iconicCards.length > 0) {
        setCurrentIconicIdx(0);
        setIconicRevealStep('suspense');
        setStage('iconic_moment');
      } else {
        setStage('summary_grid');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [iconicCards.length]);

  // Breakdown by tier
  const tierCounts = useMemo(() => {
    const map: Record<string, number> = {};
    cards.forEach((c) => {
      const t = (c.tier || 'bronze').toLowerCase();
      map[t] = (map[t] || 0) + 1;
    });
    return map;
  }, [cards]);

  // Filtered card list
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        !searchQuery ||
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier =
        tierFilter === 'all' || (card.tier || '').toLowerCase() === tierFilter.toLowerCase();
      return matchesSearch && matchesTier;
    });
  }, [cards, searchQuery, tierFilter]);

  const handleStartIconicSequence = () => {
    setCurrentIconicIdx(0);
    setIconicRevealStep('suspense');
    setStage('iconic_moment');
  };

  const handleNextIconicOrFinish = () => {
    if (currentIconicIdx + 1 < iconicCards.length) {
      setCurrentIconicIdx((prev) => prev + 1);
      setIconicRevealStep('suspense');
    } else {
      // Finished all iconic reveals -> go to summary grid
      setStage('summary_grid');
    }
  };

  return (
    <div
      id="big-pack-opening-overlay"
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between select-none overflow-y-auto overscroll-contain safe-top safe-bottom safe-px font-pixel text-white"
    >
      {/* 32-Bit Retro Scanlines */}
      <div className="absolute inset-0 pixel-scanlines opacity-30 pointer-events-none z-10" />

      {/* ================= STAGE 1: PACK BURST ================= */}
      {stage === 'pack_burst' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 relative z-20">
          <motion.div
            id="big-pack-opening-box"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => {
              if (iconicCards.length > 0) {
                handleStartIconicSequence();
              } else {
                setStage('summary_grid');
              }
            }}
          >
            <div className="w-48 sm:w-60 h-64 sm:h-80 bg-slate-900 border-4 border-amber-400 pixel-bevel-gold p-4 flex flex-col justify-between shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-pulse">
              <div className="flex items-center justify-between border-b border-amber-500 pb-2">
                <span className="text-[10px] font-mono text-amber-300 uppercase font-black">
                  BIG PACK
                </span>
                <span className="text-xs font-mono font-bold text-white">{cards.length} CARDS</span>
              </div>
              <div className="my-auto text-center">
                <Package className="w-16 h-16 text-amber-400 mx-auto mb-2 animate-bounce" />
                <h3 className="text-base sm:text-lg font-black font-arcade text-white uppercase">
                  {pack.name}
                </h3>
                <p className="text-[10px] text-amber-300 font-retro mt-1">OPENING BIG PACK...</p>
              </div>
              <div className="text-[9px] font-mono text-center text-slate-400 uppercase py-1 border-t border-slate-800">
                Click to fast-forward
              </div>
            </div>
          </motion.div>
          {isTutorialFlow && (
            <TutorialCalloutArrow
              targetId="big-pack-opening-box"
              message="Click on the pack to open it!"
              preferredSide="right"
            />
          )}
        </div>
      )}

      {/* ================= STAGE 2: COMPACT SUMMARY GRID ================= */}
      {stage === 'summary_grid' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 relative z-20 max-w-5xl">
          {/* Header */}
          <div className="w-full text-center py-2 shrink-0 border-b border-slate-800">
            <span className="text-[10px] font-mono uppercase font-black text-amber-400 tracking-wider">
              BIG PACK OPENED
            </span>
            <h2 className="text-lg sm:text-2xl font-black font-arcade text-white uppercase">
              YOU RECEIVED {cards.length} CARDS!
            </h2>

            {/* Tier breakdown badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {Object.entries(tierCounts).map(([tierKey, count]) => {
                const style = getTierStyle(tierKey);
                return (
                  <span
                    key={tierKey}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${style.bg} ${style.text} ${style.border}`}
                  >
                    {count}x {style.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Compact visual representation of all cards (up to 100) */}
          <div className="w-full flex-1 overflow-y-auto my-3 p-2 bg-slate-900/60 border border-slate-800 pixel-bevel-raised custom-scrollbar">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
              {cards.map((card, idx) => {
                const style = getTierStyle(card.tier);
                const isIconic = isIconicCard(card);
                const isFirstCardInTutorial = isTutorialFlow && !hasInspectedFirstCard && idx === 0;
                const isBlockedInTutorial = isTutorialFlow && !hasInspectedFirstCard && idx > 0;

                return (
                  <motion.div
                    key={`${card.id}-${idx}`}
                    id={`big-pack-card-${idx}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: Math.min(idx * 0.015, 0.6) }}
                    onClick={() => {
                      if (isBlockedInTutorial) return;
                      setInspectedCard(card);
                    }}
                    className={`group relative h-16 sm:h-20 border ${style.border} ${style.bg} p-1 flex flex-col justify-between transition-transform ${
                      isBlockedInTutorial
                        ? 'opacity-30 pointer-events-none'
                        : 'cursor-pointer hover:scale-105'
                    } ${
                      isFirstCardInTutorial
                        ? 'ring-4 ring-amber-400 z-30 shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-105'
                        : ''
                    } ${
                      isIconic ? 'shadow-[0_0_12px_rgba(34,211,238,0.8)] border-cyan-300' : ''
                    }`}
                    title={`${card.name} (${style.label}) - Click to inspect`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] font-mono font-bold truncate opacity-80">
                        #{idx + 1}
                      </span>
                      {isIconic && <Sparkles className="w-2.5 h-2.5 text-cyan-300 animate-pulse" />}
                    </div>

                    <p className="text-[8px] font-black font-arcade line-clamp-2 leading-tight text-white group-hover:text-amber-300">
                      {card.name}
                    </p>

                    <div className={`text-[6px] font-mono font-bold truncate ${style.text}`}>
                      {style.label}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="w-full shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">
              Showing compact sprites • Click any card to inspect full details
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                id="big-pack-confirm-btn"
                type="button"
                disabled={isTutorialFlow && !hasInspectedFirstCard}
                onClick={() => {
                  triggerHaptic(30);
                  onDone();
                }}
                className={`px-4 py-2 font-arcade font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                  isTutorialFlow && !hasInspectedFirstCard
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-40'
                    : isTutorialFlow && hasInspectedFirstCard
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 pixel-bevel-emerald ring-4 ring-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.8)] animate-pulse cursor-pointer'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 pixel-bevel-gold cursor-pointer shadow-lg active:scale-95'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>CONFIRM & RETURN</span>
              </button>

              {iconicCards.length > 0 && !isTutorialFlow && (
                <button
                  type="button"
                  onClick={handleStartIconicSequence}
                  className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-arcade font-black text-xs uppercase pixel-bevel-raised flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.5)] active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>VIEW ICONIC ({iconicCards.length})</span>
                </button>
              )}

              {!isTutorialFlow && (
                <button
                  type="button"
                  onClick={() => setStage('card_list')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-arcade font-black text-xs uppercase pixel-bevel-raised flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                >
                  <span>CARD LIST</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {isTutorialFlow && !hasInspectedFirstCard && !inspectedCard && (
            <TutorialCalloutArrow
              targetId="big-pack-card-0"
              message="Click on your first card to inspect it!"
              preferredSide="bottom"
            />
          )}
          {isTutorialFlow && hasInspectedFirstCard && !inspectedCard && (
            <TutorialCalloutArrow
              targetId="big-pack-confirm-btn"
              message="Click here to collect your cards and finish!"
              preferredSide="top"
            />
          )}
        </div>
      )}

      {/* ================= STAGE 3: ICONIC HERO REVEAL ================= */}
      {stage === 'iconic_moment' && iconicCards[currentIconicIdx] && (
        <div className="w-full h-full relative z-40">
          {iconicRevealStep === 'suspense' ? (
            <PixelIconicSuspenseAndReveal
              card={iconicCards[currentIconicIdx]}
              onRevealComplete={() => setIconicRevealStep('hero')}
              isFirst={currentIconicIdx === 0}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black/90">
              <PixelIconicHeroCard
                card={iconicCards[currentIconicIdx]}
                onProceed={handleNextIconicOrFinish}
                remainingCount={iconicCards.length - currentIconicIdx - 1}
                collection={collection}
              />
              <button
                type="button"
                onClick={handleNextIconicOrFinish}
                className="mt-6 px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-arcade font-black text-xs uppercase pixel-bevel-raised cursor-pointer shadow-lg active:scale-95"
              >
                {currentIconicIdx + 1 < iconicCards.length
                  ? `NEXT ICONIC (${currentIconicIdx + 2}/${iconicCards.length})`
                  : 'RETURN TO BIG PACK RESULTS'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 4: BIG PACK CARD LIST ================= */}
      {stage === 'card_list' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 relative z-20 max-w-4xl">
          {/* Header */}
          <div className="w-full shrink-0 flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base sm:text-xl font-black font-arcade text-white uppercase">
                RECEIVED CARDS ({cards.length})
              </h2>
              <p className="text-[10px] text-slate-400 font-retro">
                Select any card to view complete artwork, statistics, and effects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStage('summary_grid')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-arcade uppercase pixel-bevel-raised cursor-pointer"
            >
              Grid View
            </button>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="w-full shrink-0 flex flex-wrap items-center gap-2 py-2 border-b border-slate-800 text-[11px]">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search received cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 pixel-bevel-raised"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => setTierFilter('all')}
                className={`px-2 py-1 text-[9px] font-arcade uppercase cursor-pointer border ${
                  tierFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                All ({cards.length})
              </button>

              {Object.keys(tierCounts).map((t) => {
                const style = getTierStyle(t);
                const isSelected = tierFilter.toLowerCase() === t.toLowerCase();
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTierFilter(t)}
                    className={`px-2 py-1 text-[9px] font-arcade uppercase cursor-pointer border ${
                      isSelected
                        ? `${style.bg} ${style.text} ${style.border} font-black`
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {style.label} ({tierCounts[t]})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card List Table */}
          <div className="w-full flex-1 overflow-y-auto my-2 border border-slate-800 bg-slate-900/70 pixel-bevel-raised custom-scrollbar">
            <div className="divide-y divide-slate-800">
              {filteredCards.map((card, idx) => {
                const style = getTierStyle(card.tier);
                const isIconic = isIconicCard(card);

                return (
                  <div
                    key={`${card.id}-${idx}`}
                    onClick={() => {
                      triggerHaptic(15);
                      setInspectedCard(card);
                    }}
                    className="flex items-center justify-between p-2.5 sm:px-4 hover:bg-slate-800/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10px] font-mono text-slate-500 w-6 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black font-arcade text-white group-hover:text-amber-300 truncate">
                            {card.name}
                          </span>
                          {isIconic && (
                            <span className="px-1.5 py-0.2 text-[8px] font-mono font-black uppercase bg-cyan-950 text-cyan-300 border border-cyan-400">
                              ICONIC
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-retro truncate mt-0.5">
                          {card.description || 'Tap to inspect card traits'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 ml-2">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {style.label}
                      </span>
                      <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300" />
                    </div>
                  </div>
                );
              })}

              {filteredCards.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-retro text-xs">
                  No cards found matching current filter.
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="w-full shrink-0 flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-400">
              All {cards.length} cards saved to persistent collection
            </span>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(30);
                onDone();
              }}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-black text-xs uppercase pixel-bevel-gold flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>COLLECT ALL & CONTINUE</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= BIG PACK CARD INSPECTION MODAL ================= */}
      {inspectedCard && (
        <div
          id="big-pack-card-inspect-overlay"
          className="fixed inset-0 z-70 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setInspectedCard(null)}
        >
          <div
            id="big-pack-card-inspect-modal"
            className="bg-slate-900 border-2 border-amber-400 pixel-bevel-gold max-w-sm sm:max-w-md w-full p-4 flex flex-col items-center gap-3 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInspectedCard(null)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-xs font-arcade font-black uppercase tracking-wider text-amber-300">
              CARD INSPECTION
            </h4>

            {/* Card renderer */}
            <div className="w-full flex justify-center py-1">
              <CardVisualRenderer
                name={inspectedCard.name}
                tier={inspectedCard.tier}
                rarity={inspectedCard.tier}
                categoryLabel={(inspectedCard.category || 'CARD').toUpperCase()}
                description={inspectedCard.description}
                disableRevealAnimation
              />
            </div>

            {/* Prominent Continue Button (Req 12) */}
            <button
              id="big-pack-inspect-continue-btn"
              type="button"
              onClick={() => {
                triggerHaptic(20);
                if (isTutorialFlow) {
                  setHasInspectedFirstCard(true);
                }
                setInspectedCard(null);
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-black text-xs uppercase tracking-wider pixel-bevel-gold cursor-pointer transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
            >
              <span>CONTINUE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {isTutorialFlow && !hasInspectedFirstCard && (
              <TutorialCalloutArrow
                targetId="big-pack-inspect-continue-btn"
                message="Close card details to continue."
                preferredSide="top"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
