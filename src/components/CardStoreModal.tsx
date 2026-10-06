import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Package,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Layers,
  Lock,
  Unlock,
  HeartHandshake,
  Award,
  Shield,
  Briefcase,
  UserCheck,
  Flame,
  Info,
  ChevronRight,
  Zap,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isTutorialEnabled, hasSeenTutorial, markTutorialSeen } from '../utils/tutorialSystem';
import { CustomCard, CustomCardCategory, CustomCardTier } from '../types';
import {
  STORE_PACKS,
  STARTER_PACKS,
  EPIC_UPGRADE_PACK,
  ALL_STORE_PACKS,
  StorePackDefinition,
  StoreCategory,
  getChampionCredits,
  getStoreCollection,
  purchaseAndOpenPack,
  isCardEligibleForUniqueCareerActiveDeck,
  getCardOwnedCount,
  subscribeToChampionCredits,
  subscribeToStoreCollection,
  StoreCollection,
  PackOpenResult,
  BASIC_PACK_PRICE_CREDITS,
  getNewCardQueues,
  subscribeToNewCardQueues,
  getNewCardCount,
  getPendingNewCardsCountForCategory,
  NewCardQueues,
  isOneTimePackPurchased,
  getPurchasedOneTimePacks,
  isStoreTutorialCompleted,
  markStoreTutorialCompleted,
} from '../utils/storeCollectionSystem';
import { getAllDefaultCustomCards } from '../utils/cardDatabaseSystem';
import { CardVisualRenderer } from './CardVisualRenderer';
import { PixelPackOpeningExperience } from './PixelPackOpeningExperience';
import { BigPackOpeningExperience } from './BigPackOpeningExperience';
import { TutorialCalloutArrow } from './TutorialCalloutArrow';
import confetti from 'canvas-confetti';
import {
  shouldDisableParticles,
  triggerAppCelebration,
  isHighQualityModeActive,
} from '../utils/graphicSettingsSystem';

const triggerHaptic = (duration: number = 20) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {}
  }
};

const triggerConfetti = (opts?: any) => {
  triggerAppCelebration(opts);
};

interface CardStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  initialTab?: 'packs';
  onOpenCollection?: () => void;
}

const CATEGORY_ICONS: Record<StoreCategory, React.ComponentType<{ className?: string }>> = {
  parents: HeartHandshake,
  youth: Award,
  career: Shield,
  sponsor: Briefcase,
  life: Sparkles,
  agent: UserCheck,
  street: Flame,
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  bronze: { bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-700/50', label: 'Bronze' },
  silver: { bg: 'bg-slate-400/30', text: 'text-slate-200', border: 'border-slate-400/50', label: 'Silver' },
  gold: { bg: 'bg-yellow-500/30', text: 'text-yellow-300', border: 'border-yellow-500/60', label: 'Gold' },
  legendary: { bg: 'bg-purple-500/30', text: 'text-purple-300', border: 'border-purple-500/60', label: 'Legendary' },
  iconic: { bg: 'bg-amber-400/30', text: 'text-amber-200', border: 'border-amber-400/70', label: 'Iconic' },
  obsidian_knife: { bg: 'bg-stone-800/60', text: 'text-stone-300', border: 'border-stone-600', label: 'Obsidian Knife' },
  copper_dagger: { bg: 'bg-orange-800/40', text: 'text-orange-300', border: 'border-orange-600/60', label: 'Copper Dagger' },
  steel_blade: { bg: 'bg-blue-800/40', text: 'text-blue-300', border: 'border-blue-500/60', label: 'Steel Blade' },
  muramasa_blade: { bg: 'bg-rose-900/50', text: 'text-rose-300', border: 'border-rose-500/70', label: 'Muramasa Blade' },
  scrap: { bg: 'bg-zinc-800/40', text: 'text-zinc-400', border: 'border-zinc-700', label: 'Scrap' },
  rust: { bg: 'bg-amber-950/40', text: 'text-amber-600', border: 'border-amber-800/50', label: 'Rust' },
  ash: { bg: 'bg-neutral-800/40', text: 'text-neutral-400', border: 'border-neutral-700', label: 'Ash' },
  disaster: { bg: 'bg-red-950/50', text: 'text-red-400', border: 'border-red-800/60', label: 'Disaster' },
};

export const CardStoreModal: React.FC<CardStoreModalProps> = ({
  isOpen,
  onClose,
  showToast,
  onOpenCollection,
}) => {
  const { t } = useLanguage();
  const [credits, setCredits] = useState<number>(getChampionCredits());
  const [collection, setCollection] = useState<StoreCollection>(getStoreCollection());
  const [newCardQueues, setNewCardQueues] = useState<NewCardQueues>(getNewCardQueues());
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>(() => getPurchasedOneTimePacks());
  const [storeFilter, setStoreFilter] = useState<'all' | 'starter' | 'standard' | 'epic'>('all');

  // Pack opening states
  const [isOpeningPack, setIsOpeningPack] = useState<boolean>(false);
  const [activePackResult, setActivePackResult] = useState<PackOpenResult | null>(null);
  const [revealedCardIndices, setRevealedCardIndices] = useState<Set<number>>(new Set());
  const [isTearingAnimation, setIsTearingAnimation] = useState<boolean>(false);
  const [packSessionKey, setPackSessionKey] = useState<number>(0);
  const [isOpeningAnother, setIsOpeningAnother] = useState<boolean>(false);
  const [selectedInspectCard, setSelectedInspectCard] = useState<CustomCard | null>(null);
  const [isTutorialPackOpening, setIsTutorialPackOpening] = useState<boolean>(false);

  // Active tutorial state: tutorial enabled AND bronze starter pack not yet bought
  const isTutorialActive = useMemo(() => {
    return isTutorialEnabled() && !isStoreTutorialCompleted() && !purchasedPacks.includes('pack-starter-bronze');
  }, [purchasedPacks]);

  // Sync credits, collection and new card queues in real-time
  useEffect(() => {
    if (!isOpen) return;

    setCredits(getChampionCredits());
    setCollection(getStoreCollection());
    setNewCardQueues(getNewCardQueues());
    setPurchasedPacks(getPurchasedOneTimePacks());

    const unsubCredits = subscribeToChampionCredits((c) => setCredits(c));
    const unsubCol = subscribeToStoreCollection((col) => setCollection(col));
    const unsubQueues = subscribeToNewCardQueues((q) => setNewCardQueues(q));

    return () => {
      unsubCredits();
      unsubCol();
      unsubQueues();
    };
  }, [isOpen]);

  const totalPendingGuarantees = useMemo(() => {
    return Object.values(newCardQueues).reduce((acc, q) => acc + (q?.length || 0), 0);
  }, [newCardQueues]);

  // Backward compatibility alias
  const isFirstVisitTutorial = isTutorialActive;

  // Handle purchasing a pack
  const handlePurchasePack = (pack: StorePackDefinition, fromOpenAnother = false) => {
    // First store visit constraint: force Bronze Starting Pack if tutorial is ON
    if (isTutorialActive && pack.id !== 'pack-starter-bronze') {
      triggerHaptic(40);
      showToast(t('STORE_TUTORIAL_FORCE_BRONZE_TOAST') || '⚠️ First Store Visit: You must purchase the Bronze Starting Pack (5 Credits) first!');
      return;
    }

    // Check one-time limit
    if (pack.isOneTime && purchasedPacks.includes(pack.id)) {
      triggerHaptic(30);
      showToast(t('STORE_PACK_ONE_TIME_LIMIT') || '⚠️ This pack has already been purchased (Limit 1 per career).');
      return;
    }

    if (credits < pack.priceCredits) {
      triggerHaptic(40);
      showToast(
        `⚠️ ${t('INSUFFICIENT_FUNDS') || 'Insufficient Champion Credits!'} ${pack.name} (${pack.priceCredits} Credits). ${t('STORE_BALANCE_LABEL', { credits: credits.toString() }) || `You currently have ${credits}.`}`
      );
      return;
    }

    triggerHaptic(30);
    const result = purchaseAndOpenPack(pack.id);
    if (!result.success) {
      showToast(result.errorMessage || 'Failed to open pack.');
      return;
    }

    // If purchasing the Bronze Starting Pack during tutorial, track tutorial pack opening
    if (pack.id === 'pack-starter-bronze' && isTutorialActive) {
      setIsTutorialPackOpening(true);
    }

    setPurchasedPacks(getPurchasedOneTimePacks());
    setPackSessionKey((prev) => prev + 1);
    setIsOpeningAnother(fromOpenAnother);
    setActivePackResult(result);
    setRevealedCardIndices(new Set());
    setIsOpeningPack(true);
    setIsTearingAnimation(false);
    showToast(`✨ Opened ${pack.name}! ${result.cards.length} Cards added to your persistent Store Collection.`);
  };

  const handleRevealCard = (index: number) => {
    triggerHaptic(15);
    setRevealedCardIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const handleRevealAll = () => {
    triggerHaptic(30);
    if (activePackResult) {
      setRevealedCardIndices(new Set([0, 1, 2, 3, 4]));
    }
  };

  const handleClosePackReveal = () => {
    setIsOpeningPack(false);
    setActivePackResult(null);
    setRevealedCardIndices(new Set());
    setIsTearingAnimation(false);
    setIsOpeningAnother(false);
    setIsTutorialPackOpening(false);
  };

  // Filter packs for active tab
  const displayedPacks = useMemo(() => {
    if (storeFilter === 'starter') return STARTER_PACKS;
    if (storeFilter === 'epic') return [EPIC_UPGRADE_PACK];
    if (storeFilter === 'standard') return STORE_PACKS;
    return ALL_STORE_PACKS;
  }, [storeFilter]);

  const renderInspectCardModal = () => {
    if (!selectedInspectCard) return null;
    return (
      <div
        id="card-inspect-overlay"
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150"
        onClick={() => setSelectedInspectCard(null)}
      >
        <div
          id="card-inspect-modal"
          className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-left relative space-y-4 overflow-hidden card-3d-tilt"
          data-glow={selectedInspectCard.tier === 'legendary' || selectedInspectCard.tier === 'iconic' ? 'gold' : selectedInspectCard.tier === 'gold' ? 'cyan' : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {isHighQualityModeActive() && ['gold', 'legendary', 'iconic', 'silver', 'steel_blade', 'muramasa_blade', 'disaster'].includes(selectedInspectCard.tier) && (
            <div className="holo-foil-shimmer" style={{ zIndex: 10, opacity: 0.5 }} />
          )}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                {selectedInspectCard.category} Card Definition
              </span>
              <h3 className="text-xl font-black text-white">
                {selectedInspectCard.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedInspectCard(null)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Tier:</span>
              <span className="font-bold text-amber-300 uppercase">
                {selectedInspectCard.tier}
              </span>
            </div>

            {(() => {
              const inspectOwned = getCardOwnedCount(selectedInspectCard.id, collection);
              const inspectNew = getNewCardCount(selectedInspectCard.id);
              const inspectNormal = Math.max(0, inspectOwned - inspectNew);

              return (
                <>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Owned Copies:</span>
                    <div className="text-right">
                      <span className="font-mono font-black text-white">
                        x{inspectOwned}
                      </span>
                      {inspectNew > 0 && (
                        <div className="text-[10px] text-yellow-300 font-bold">
                          {inspectNew} NEW Guaranteed • {inspectNormal} Normal
                        </div>
                      )}
                    </div>
                  </div>

                  {inspectNew > 0 && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-400/20 to-amber-500/15 border border-yellow-400/60 text-xs shadow-md">
                      <div className="flex items-center gap-1.5 font-bold text-yellow-300 mb-1">
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                        <span>NEW CARD STATUS ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-yellow-100/90 leading-relaxed">
                        This card has <strong>{inspectNew} NEW</strong> copy queued. It is guaranteed to appear the next time Unique Career draws from the <strong>{selectedInspectCard.category.toUpperCase()}</strong> category. Other copies remain standard.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Active Deck Status:</span>
              <span
                className={`font-bold ${
                  isCardEligibleForUniqueCareerActiveDeck(selectedInspectCard, collection)
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {isCardEligibleForUniqueCareerActiveDeck(selectedInspectCard, collection)
                  ? 'Eligible (Unlocked)'
                  : 'Locked (Requires Store Copy)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1 font-bold">Description:</div>
              <p className="text-white text-xs leading-relaxed">
                {selectedInspectCard.description}
              </p>
            </div>

            {selectedInspectCard.modifiers && selectedInspectCard.modifiers.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[11px] font-bold mb-1">Modifiers / Effects:</div>
                {selectedInspectCard.modifiers.map((m, idx) => (
                  <div key={idx} className="font-mono text-emerald-400 text-[11px]">
                    {m.operation.toUpperCase()} {m.value} {m.target}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSelectedInspectCard(null)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  // ================= STANDALONE PACK OPENING FULL-SCREEN VIEW =================
  // When opening a pack, replace the store modal entirely with the dedicated Pack Opening screen.
  // Once the user confirms, they return seamlessly right back to the store.
  if (isOpeningPack && activePackResult) {
    return (
      <div
        id="drawstar-standalone-pack-opening-root"
        className="fixed inset-0 z-50 bg-slate-950 text-white font-pixel select-none"
      >
        {activePackResult.pack.isBigPack || activePackResult.cards.length > 5 ? (
          <BigPackOpeningExperience
            key={`big-pack-opening-${packSessionKey}`}
            pack={activePackResult.pack}
            cards={activePackResult.cards}
            onDone={() => {
              if (isTutorialPackOpening) {
                markStoreTutorialCompleted();
                markTutorialSeen('card_store');
                markTutorialSeen('store_entry_explanation');
                showToast(t('STORE_TUTORIAL_COMPLETED_TOAST') || '🎉 Starter Pack unlocked! 50 Cards added to your persistent Store Collection.');
              }
              handleClosePackReveal();
            }}
            onInspectCard={(card) => setSelectedInspectCard(card)}
            credits={credits}
            collection={collection}
            isTutorialFlow={isTutorialPackOpening}
          />
        ) : (
          <PixelPackOpeningExperience
            key={`pack-opening-session-${packSessionKey}`}
            pack={activePackResult.pack}
            cards={activePackResult.cards}
            revealedCardIndices={revealedCardIndices}
            onRevealCard={handleRevealCard}
            onRevealAll={handleRevealAll}
            onOpenAnother={() => {
              const currentPack = activePackResult.pack;
              handlePurchasePack(currentPack, true);
            }}
            onViewCollection={() => {
              handleClosePackReveal();
              if (onOpenCollection) {
                onClose();
                onOpenCollection();
              }
            }}
            onDone={handleClosePackReveal}
            onInspectCard={(card) => setSelectedInspectCard(card)}
            credits={credits}
            collection={collection}
            isOpeningAnother={isOpeningAnother}
          />
        )}

        {/* Selected inspect card overlay */}
        {renderInspectCardModal()}
      </div>
    );
  }

  return (
    <div
      id="drawstar-card-store-overlay"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="drawstar-card-store-modal"
        className="bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold pixel-corners w-full max-w-5xl h-[92vh] max-h-[850px] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-white relative font-pixel"
      >
        {/* Retro Scanline Overlay */}
        <div className="absolute inset-0 pixel-scanlines opacity-30 pointer-events-none z-0" />

        {/* ================= MODAL HEADER ================= */}
        <header className="p-3 sm:p-4 border-b-2 border-amber-500/60 bg-slate-950 shrink-0 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-950 border border-amber-400 pixel-bevel-gold text-amber-300 flex items-center justify-center shadow-md font-black shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black font-arcade tracking-wide text-white uppercase">
                  {t('STORE_MODAL_TITLE') || 'CARD STORE'}
                </h2>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-black uppercase bg-amber-950 text-amber-300 border border-amber-400 pixel-bevel-gold">
                  {t('STORE_BADGE_PACK_SHOP') || 'PACK SHOP'}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-retro">
                {t('STORE_MODAL_SUBTITLE') || 'Purchase and rip packs to unlock canonical cards for your collection and career runs.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {/* Quick button to open Card Collection directly from Store */}
            {onOpenCollection && (
              <button
                type="button"
                disabled={isFirstVisitTutorial}
                onClick={() => {
                  if (isFirstVisitTutorial) return;
                  onClose();
                  onOpenCollection();
                }}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-arcade uppercase font-black transition-colors ${
                  isFirstVisitTutorial
                    ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed pointer-events-none'
                    : 'bg-blue-950 border-blue-400 text-blue-300 pixel-bevel-raised cursor-pointer'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('STORE_BTN_COLLECTION') || 'Card Collection'}</span>
              </button>
            )}

            {totalPendingGuarantees > 0 && (
              <div
                id="store-pending-guarantees-badge"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-950/80 border border-yellow-400 text-yellow-300 text-[10px] font-mono font-bold shadow-sm"
                title={`${totalPendingGuarantees} card copy guaranteed to appear on next matching Unique Career draw.`}
              >
                <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                <span>
                  {totalPendingGuarantees === 1
                    ? t('STORE_BADGE_PENDING_GUARANTEE', { count: totalPendingGuarantees.toString() })
                    : t('STORE_BADGE_PENDING_GUARANTEES', { count: totalPendingGuarantees.toString() })}
                </span>
              </div>
            )}

            {/* CHAMPION CREDITS BALANCE BADGE */}
            <div
              id="store-champion-credits-badge"
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-amber-500/60 pixel-bevel-gold shadow-inner"
            >
              <div className="w-4 h-4 bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                🪙
              </div>
              <div className="flex flex-col text-right leading-none">
                <span className="text-[8px] uppercase font-mono font-bold text-amber-400 tracking-wider">
                  {t('STORE_CREDITS_LABEL') || 'Credits'}
                </span>
                <span className="text-xs sm:text-sm font-black font-mono text-white">
                  {credits.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              id="store-modal-close-btn"
              type="button"
              disabled={isFirstVisitTutorial}
              onClick={onClose}
              className={`p-1.5 transition-colors border pixel-bevel-raised ${
                isFirstVisitTutorial
                  ? 'bg-slate-900 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed pointer-events-none'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer border-slate-600'
              }`}
              aria-label="Close Store"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ================= SUB-HEADER STATUS BAR & FILTER TABS ================= */}
        <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-2 shrink-0 relative z-10">
          {/* Store Filter Tabs */}
          <div className={`flex items-center gap-1.5 overflow-x-auto ${isFirstVisitTutorial ? 'pointer-events-none opacity-40' : ''}`}>
            <button
              type="button"
              onClick={() => setStoreFilter('all')}
              className={`px-2.5 py-1 text-[10px] font-arcade uppercase cursor-pointer border ${
                storeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black pixel-bevel-gold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t('STORE_TAB_ALL_PACKS') || 'All Packs'} ({ALL_STORE_PACKS.length})
            </button>
            <button
              type="button"
              onClick={() => setStoreFilter('starter')}
              className={`px-2.5 py-1 text-[10px] font-arcade uppercase cursor-pointer border ${
                storeFilter === 'starter'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black pixel-bevel-gold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t('STORE_TAB_STARTER_PACKS') || 'Starter Packs'} (4)
            </button>
            <button
              type="button"
              onClick={() => setStoreFilter('epic')}
              className={`px-2.5 py-1 text-[10px] font-arcade uppercase cursor-pointer border ${
                storeFilter === 'epic'
                  ? 'bg-purple-500 text-white border-purple-400 font-black pixel-bevel-raised'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t('STORE_TAB_EPIC_UPGRADE') || 'Epic Upgrade'} (1)
            </button>
            <button
              type="button"
              onClick={() => setStoreFilter('standard')}
              className={`px-2.5 py-1 text-[10px] font-arcade uppercase cursor-pointer border ${
                storeFilter === 'standard'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black pixel-bevel-gold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t('STORE_TAB_CATEGORY_PACKS') || 'Category Packs'} (7)
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            {t('STORE_BALANCE_LABEL', { credits: credits.toLocaleString() }) || `Balance: ${credits.toLocaleString()} Credits`}
          </div>
        </div>

        {/* ================= TAB CONTENT (PACKS STORE) ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar relative z-10">
          <div className="space-y-4">
            {/* FIRST STORE VISIT TUTORIAL BANNER (Req 8) */}
            {isFirstVisitTutorial && (
              <div
                id="store-first-visit-tutorial-banner"
                className="p-3.5 bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/90 border-2 border-amber-400 pixel-bevel-gold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-500 text-slate-950 border border-amber-300 flex items-center justify-center shrink-0 font-arcade font-black text-sm">
                    ★
                  </div>
                  <div>
                    <h4 className="text-xs font-arcade font-black uppercase text-amber-300 tracking-wide">
                      {t('STORE_TUTORIAL_BANNER_TITLE') || 'FIRST STORE VISIT: FOUNDATIONAL STARTER PACK'}
                    </h4>
                    <p className="text-[10px] text-slate-300 font-retro leading-relaxed">
                      {t('STORE_TUTORIAL_BANNER_DESC') || 'To begin your collection, purchase the Bronze Starting Pack (50 Cards) for only 5 Champion Credits!'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 px-3 py-1 bg-amber-500 text-slate-950 font-arcade font-black text-[10px] uppercase border border-amber-300">
                  {t('STORE_TUTORIAL_BANNER_RATE') || 'SPECIAL INTRO RATE: 5 CREDITS'}
                </div>
              </div>
            )}

            {/* STORE PACKS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {displayedPacks.map((pack) => {
                const IconComp = pack.category !== 'all' ? (CATEGORY_ICONS[pack.category] || Package) : Package;
                const isSoldOut = pack.isOneTime && purchasedPacks.includes(pack.id);
                const isTutorialTarget = isFirstVisitTutorial && pack.id === 'pack-starter-bronze';
                const isTutorialLocked = isFirstVisitTutorial && pack.id !== 'pack-starter-bronze';
                const canAfford = credits >= pack.priceCredits && !isSoldOut && !isTutorialLocked;

                return (
                  <div
                    key={pack.id}
                    id={`store-pack-card-${pack.id}`}
                    className={`group relative pixel-corners border-2 ${
                      isTutorialTarget
                        ? 'border-amber-400 ring-2 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] bg-slate-950'
                        : isSoldOut
                        ? 'border-slate-800 bg-slate-950/60 opacity-60'
                        : isTutorialLocked
                        ? 'border-slate-800 bg-slate-950/60 opacity-40 pointer-events-none'
                        : `${pack.accentBorder} bg-slate-950 hover:border-amber-400`
                    } p-3.5 shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-0.5 pixel-bevel-raised card-3d-tilt`}
                    data-glow={pack.id === 'pack-epic-upgrade' ? 'cyan' : isTutorialTarget ? 'gold' : undefined}
                  >
                    {/* High Quality Holographic Foil Shimmer for Epic & Premium Packs */}
                    {isHighQualityModeActive() && (pack.id === 'pack-epic-upgrade' || pack.category === 'all') && (
                      <div className="holo-foil-shimmer" style={{ zIndex: 5, opacity: 0.65 }} />
                    )}

                    {/* Ambient pack gradient */}
                    <div
                      className={`absolute -right-12 -top-12 w-48 h-48 rounded-full bg-gradient-to-br ${pack.gradient} opacity-20 blur-2xl group-hover:opacity-35 transition-opacity pointer-events-none`}
                    />

                    <div>
                      {/* Pack Top Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black uppercase border ${pack.badgeColor} flex items-center gap-1.5`}
                        >
                          <IconComp className="w-3 h-3" />
                          {pack.categoryLabel}
                        </span>

                        <div className="flex items-center gap-1">
                          {pack.isOneTime && (
                            <span className="text-[9px] font-mono text-cyan-300 font-bold bg-cyan-950 px-1.5 py-0.5 border border-cyan-800">
                              1-TIME
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-300 font-bold bg-slate-900 px-1.5 py-0.5 border border-slate-800">
                            {t('STORE_PACK_CARDS_COUNT', { count: pack.cardCount.toString() }) || `${pack.cardCount} CARDS`}
                          </span>
                        </div>
                      </div>

                      {/* Pack Title */}
                      <h3 className="text-sm sm:text-base font-black font-arcade text-white group-hover:text-amber-300 transition-colors uppercase tracking-wide">
                        {pack.name}
                      </h3>

                      {/* Pack Description */}
                      <p className="text-[10px] text-slate-400 font-retro mt-1.5 leading-relaxed min-h-[32px]">
                        {pack.description}
                      </p>

                      {/* Pack Info Preview */}
                      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-300 space-y-1 font-mono">
                        {pack.id === 'pack-epic-upgrade' ? (
                          <>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Special Odds:</span>
                              <span className="text-cyan-300 font-bold">20% Iconic Chance / Slot</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Remaining Drop:</span>
                              <span className="text-purple-300 font-bold">80% Legendary</span>
                            </div>
                          </>
                        ) : pack.category === 'all' ? (
                          <>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Pool Scope:</span>
                              <span className="text-amber-300 font-bold">All Disciplines & Categories</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Bulk Delivery:</span>
                              <span className="text-slate-300 font-bold">{pack.cardCount} Cards Instantly</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Drop Tiers:</span>
                              <span className="text-amber-300 font-bold">Bronze → Iconic</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-400">
                              <span>Double-Edged:</span>
                              <span className="text-orange-300 font-bold">Obsidian → Muramasa</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-2.5 border-t border-slate-800">
                      {isSoldOut ? (
                        <div className="w-full py-2 px-3 bg-slate-900 border border-slate-800 text-slate-500 text-center text-xs font-arcade uppercase font-black">
                          {t('STORE_PACK_SOLD_OUT') || 'SOLD OUT (1/1 CLAIMED)'}
                        </div>
                      ) : isTutorialLocked ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 px-3 bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800 text-xs font-arcade uppercase font-black"
                        >
                          {t('STORE_PACK_TUTORIAL_LOCKED') || 'TUTORIAL: BUY BRONZE PACK FIRST'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          id={`store-buy-${pack.id}`}
                          disabled={!canAfford}
                          onClick={() => handlePurchasePack(pack)}
                          className={`w-full py-2.5 px-3 font-arcade font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border-2 ${
                            isTutorialTarget
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-200 pixel-bevel-gold shadow-lg animate-pulse'
                              : canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 pixel-bevel-gold shadow-md'
                              : 'bg-slate-900 text-slate-500 cursor-not-allowed border-slate-700 pixel-bevel-raised'
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>
                            {canAfford
                              ? t('STORE_PACK_BUY_BTN', { price: pack.priceCredits.toString() }) || `BUY & OPEN (${pack.priceCredits} CREDITS)`
                              : `${pack.priceCredits} CREDITS REQUIRED`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {isFirstVisitTutorial && (
              <TutorialCalloutArrow
                targetId="store-buy-pack-starter-bronze"
                message="Click here to purchase the Bronze Starting Pack!"
                preferredSide="top"
              />
            )}
          </div>
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <footer className="p-2.5 sm:p-3 border-t border-slate-800 bg-slate-950 shrink-0 flex items-center justify-between text-[10px] text-slate-400 font-mono relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
            <span>DrawStar Store System • Canonical DB Connected</span>
          </div>
          <button
            type="button"
            disabled={isFirstVisitTutorial}
            onClick={onClose}
            className={`px-3 py-1 font-arcade uppercase font-black transition-colors border pixel-bevel-raised ${
              isFirstVisitTutorial
                ? 'bg-slate-900 text-slate-600 border-slate-800 opacity-40 cursor-not-allowed pointer-events-none'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer border-slate-700'
            }`}
          >
            Close
          </button>
        </footer>
      </div>

      {/* ================= INSPECT CARD MODAL ================= */}
      {renderInspectCardModal()}
    </div>
  );
};
