import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Layers,
  Check,
  CheckCircle2,
  X,
  Eye,
  Zap,
  Award,
  Shield,
  HeartHandshake,
  Briefcase,
  UserCheck,
  Crown,
  Search,
  Info,
} from 'lucide-react';
import { CustomCard } from '../types';
import {
  StorePackDefinition,
  StoreCollection,
  getCardOwnedCount,
  getNewCardCount,
  isCardEligibleForUniqueCareerActiveDeck,
  BASIC_PACK_PRICE_CREDITS,
} from '../utils/storeCollectionSystem';
import { audioManager } from '../utils/audioSystem';
import {
  normalizeTierKey,
  getPixelTierTheme,
  TierPixelTheme,
} from './PixelPackOpeningExperience';

const triggerHaptic = (duration: number = 20) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {}
  }
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  parents: HeartHandshake,
  youth: Award,
  career: Shield,
  sponsor: Briefcase,
  life: Sparkles,
  agent: UserCheck,
  street: Zap,
};

export interface PixelFinalCardCarouselProps {
  pack: StorePackDefinition;
  cards: CustomCard[];
  collection: StoreCollection;
  credits: number;
  onConfirm: () => void;
  onOpenAnother: () => void;
  onViewCollection: () => void;
  onInspectCardExternal?: (card: CustomCard) => void;
}

export const PixelFinalCardCarousel: React.FC<PixelFinalCardCarouselProps> = ({
  pack,
  cards,
  collection,
  credits,
  onConfirm,
  onOpenAnother,
  onViewCollection,
  onInspectCardExternal,
}) => {
  // Requirement 2: Ordering Logic
  // If there is no Iconic:
  //   * Begin with the first card in normal pack order.
  // If there is an Iconic:
  //   * Begin with the Iconic card.
  //   * Remaining cards follow afterward.
  // If there are multiple Iconics:
  //   * All Iconics appear first.
  //   * Preserve their relative acquisition/reveal order.
  //   * Then show all remaining cards in their normal pack order.
  const carouselCards = useMemo(() => {
    const iconics: { card: CustomCard; originalIndex: number; isIconic: boolean }[] = [];
    const nonIconics: { card: CustomCard; originalIndex: number; isIconic: boolean }[] = [];

    cards.forEach((c, idx) => {
      const isIconic = normalizeTierKey(c.tier) === 'iconic';
      const item = { card: c, originalIndex: idx, isIconic };
      if (isIconic) {
        iconics.push(item);
      } else {
        nonIconics.push(item);
      }
    });

    return [...iconics, ...nonIconics];
  }, [cards]);

  // Carousel index: 0 is always the initial card (first Iconic if any, else first normal card)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [inspectingCard, setInspectingCard] = useState<CustomCard | null>(null);

  const totalCards = carouselCards.length;
  const currentItem = carouselCards[currentIndex] || carouselCards[0];
  const activeCard = currentItem?.card;
  const activeTheme = activeCard ? getPixelTierTheme(activeCard.tier) : null;
  const activeOwnedCount = activeCard ? getCardOwnedCount(activeCard.id, collection) : 0;
  const activeNewCopies = activeCard ? getNewCardCount(activeCard.id) : 0;
  const ActiveIconComp = activeCard ? (CATEGORY_ICONS[activeCard.category] || Sparkles) : Sparkles;

  // Continuous looping:
  // Left: (index - 1 + N) % N
  // Right: (index + 1) % N
  const handlePrev = () => {
    audioManager.playCardFlipSound();
    triggerHaptic(15);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const handleNext = () => {
    audioManager.playCardFlipSound();
    triggerHaptic(15);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const handleSelectIndex = (idx: number) => {
    if (idx === currentIndex) return;
    audioManager.playCardFlipSound();
    triggerHaptic(15);
    setCurrentIndex(idx);
  };

  const handleOpenInspection = (card: CustomCard) => {
    audioManager.playCardFlipSound();
    triggerHaptic(20);
    setInspectingCard(card);
    if (onInspectCardExternal) {
      onInspectCardExternal(card);
    }
  };

  const handleCloseInspection = () => {
    audioManager.playCardFlipSound();
    setInspectingCard(null);
  };

  // Touch swipe support for mobile
  const touchStartXRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (deltaX > 40) {
      handlePrev();
    } else if (deltaX < -40) {
      handleNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inspectingCard) {
        if (e.key === 'Escape') {
          handleCloseInspection();
        }
        return;
      }
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingCard, totalCards, onConfirm]);

  return (
    <div
      id="drawstar-final-carousel-container"
      className="w-full flex flex-col items-center justify-between min-h-full max-w-5xl mx-auto px-2 sm:px-4 py-1 select-none"
    >
      {/* ================= CAROUSEL HEADER ================= */}
      <div className="w-full flex items-center justify-between gap-2 px-1 sm:px-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] sm:text-[11px] font-bold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PACK COMPLETE: {totalCards} CARDS</span>
          </div>
        </div>

        {/* Carousel Progress Pip & Mobile Quick Confirm */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded bg-slate-900/90 border border-amber-400/50 font-mono text-xs font-black text-amber-300">
            <span>CARD</span>
            <span className="text-white text-xs sm:text-sm">{currentIndex + 1}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{totalCards}</span>
          </div>

          <button
            type="button"
            id="carousel-header-confirm-btn"
            onClick={() => {
              audioManager.playSuccessChime();
              triggerHaptic(30);
              onConfirm();
            }}
            className="sm:hidden px-2.5 py-1 rounded bg-gradient-to-r from-amber-400 to-yellow-400 active:from-amber-300 active:to-yellow-300 text-slate-950 font-mono text-xs font-black uppercase pixel-bevel-gold flex items-center gap-1 shadow-md cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>DONE</span>
          </button>
        </div>
      </div>

      {/* ================= MAIN HORIZONTAL CAROUSEL ================= */}
      <div
        className="w-full flex-1 flex flex-col items-center justify-center my-auto py-1 sm:py-2 relative touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full flex items-center justify-center gap-2 sm:gap-4 md:gap-8 relative max-w-4xl">
          {/* LEFT NAV BUTTON */}
          <button
            type="button"
            id="carousel-prev-btn"
            onClick={handlePrev}
            aria-label="Previous Card"
            className="w-10 sm:w-14 h-12 sm:h-16 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-white border-2 border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.2)] flex items-center justify-center cursor-pointer transition-all active:scale-95 z-20 shrink-0"
          >
            <ChevronLeft className="w-5 sm:w-8 h-5 sm:h-8" />
          </button>

          {/* PREVIOUS CARD PREVIEW (Desktop / Tablet) */}
          {(() => {
            const prevIndex = (currentIndex - 1 + totalCards) % totalCards;
            const prevItem = carouselCards[prevIndex];
            const prevTheme = getPixelTierTheme(prevItem.card.tier);

            return (
              <div
                onClick={handlePrev}
                className="hidden md:flex flex-col items-center justify-center w-36 h-64 rounded-2xl p-2.5 opacity-40 hover:opacity-75 transition-all cursor-pointer transform -rotate-3 scale-90 border-2 overflow-hidden shrink-0 shadow-lg"
                style={{
                  background: prevTheme.frontCardBg,
                  borderColor: prevTheme.frontBorder,
                }}
              >
                <span className="font-mono text-[9px] font-black uppercase text-slate-300">
                  {prevTheme.label}
                </span>
                <span className="font-mono text-xs font-bold text-white line-clamp-2 text-center mt-2">
                  {prevItem.card.name}
                </span>
                <span className="mt-auto font-mono text-[9px] text-slate-400">◄ Click</span>
              </div>
            );
          })()}

          {/* ACTIVE CENTER CARD */}
          {activeCard && activeTheme && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`carousel-active-${activeCard.id}-${currentIndex}`}
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                onClick={() => handleOpenInspection(activeCard)}
                className="w-full max-w-[280px] xs:max-w-[310px] sm:max-w-sm sm:w-76 md:w-84 min-h-[300px] sm:min-h-[380px] max-h-[440px] rounded-2xl p-3 sm:p-4 flex flex-col justify-between relative cursor-pointer select-none transition-all duration-200 border-3 shadow-2xl overflow-hidden group hover:scale-[1.01]"
                style={{
                  background: activeTheme.frontCardBg,
                  borderColor: activeTheme.frontBorder,
                  boxShadow: activeTheme.frontGlow,
                }}
              >
                {/* 4 Stepped Pixel Corner Accents */}
                <div
                  className="absolute -top-1 -left-1 w-2.5 h-2.5 pointer-events-none"
                  style={{ backgroundColor: activeTheme.frontCornerAccent }}
                />
                <div
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 pointer-events-none"
                  style={{ backgroundColor: activeTheme.frontCornerAccent }}
                />
                <div
                  className="absolute -bottom-1 -left-1 w-2.5 h-2.5 pointer-events-none"
                  style={{ backgroundColor: activeTheme.frontCornerAccent }}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-2.5 h-2.5 pointer-events-none"
                  style={{ backgroundColor: activeTheme.frontCornerAccent }}
                />

                {/* Sweeping Diagonal Subtle Pixel Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity" />

                {/* CARD BODY CONTENT */}
                <div className="relative z-10 flex flex-col justify-between h-full space-y-2.5">
                  <div>
                    {/* Top Row: Rarity Badge & NEW Pill */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className="px-2.5 py-1 rounded font-mono text-[10px] sm:text-xs font-black uppercase border shadow-sm flex items-center gap-1.5"
                        style={{
                          backgroundColor: activeTheme.frontHeaderBadgeBg,
                          borderColor: activeTheme.frontHeaderBadgeBorder,
                          color: activeTheme.frontHeaderBadgeText,
                        }}
                      >
                        <span>{activeTheme.backIcon}</span>
                        <span>{activeTheme.label}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {currentItem.isIconic && (
                          <span className="px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase bg-cyan-950/80 border border-cyan-400 text-cyan-300 animate-pulse">
                            ⭐ ICONIC
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase border shadow-sm animate-pulse"
                          style={{
                            backgroundColor: activeTheme.frontHeaderBadgeBorder,
                            color: activeTheme.bgDark === '#09090b' ? '#000000' : '#ffffff',
                            borderColor: activeTheme.accent,
                          }}
                        >
                          ✨ NEW
                        </span>
                      </div>
                    </div>

                    {/* Category & Icon */}
                    <div
                      className="flex items-center gap-1.5 text-[10.5px] font-mono uppercase font-bold"
                      style={{ color: activeTheme.frontCategoryColor }}
                    >
                      <ActiveIconComp className="w-3.5 h-3.5 shrink-0" />
                      <span>{activeCard.category}</span>
                    </div>

                    {/* Card Name */}
                    <h3
                      className="text-base sm:text-lg font-black leading-snug mt-1 font-mono uppercase tracking-tight"
                      style={{
                        color: activeTheme.frontNameColor,
                        textShadow: '0 2px 4px rgba(0,0,0,0.85)',
                      }}
                    >
                      {activeCard.name}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-xs sm:text-[12.5px] mt-2 leading-relaxed font-mono line-clamp-3"
                      style={{ color: activeTheme.frontDescriptionColor }}
                    >
                      {activeCard.description}
                    </p>

                    {/* Modifiers List */}
                    {activeCard.modifiers && activeCard.modifiers.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {activeCard.modifiers.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="text-[10px] font-mono flex items-center gap-1 font-bold px-2 py-0.5 rounded border"
                            style={{
                              backgroundColor: activeTheme.frontModifiersBg,
                              borderColor: activeTheme.frontModifiersBorder,
                              color: activeTheme.frontModifiersText,
                            }}
                          >
                            <span>+</span>
                            <span>
                              {m.target.replace('stat_', '')}: {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* BOTTOM ACTION & OWNED STATS */}
                  <div className="pt-2 border-t space-y-2" style={{ borderColor: activeTheme.frontFooterBorder }}>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: activeTheme.frontCategoryColor, opacity: 0.9 }}>
                          OWNED:
                        </span>
                        <span
                          className="font-black"
                          style={{ color: activeTheme.frontOwnedCountColor }}
                        >
                          x{activeOwnedCount}
                        </span>
                        {activeNewCopies > 0 && (
                          <span
                            className="text-[9.5px] font-bold"
                            style={{ color: activeTheme.frontHeaderBadgeBorder }}
                          >
                            (+{activeNewCopies} NEW)
                          </span>
                        )}
                      </div>

                      {/* Quick Inspect Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInspection(activeCard);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-white font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Search className="w-3 h-3" />
                        <span>INSPECT ➔</span>
                      </button>
                    </div>

                    {/* Click To Inspect Hint */}
                    <div className="text-center text-[9.5px] font-mono text-slate-400">
                      [ TAP CARD TO INSPECT FULL DETAILS ]
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* NEXT CARD PREVIEW (Desktop / Tablet) */}
          {(() => {
            const nextIndex = (currentIndex + 1) % totalCards;
            const nextItem = carouselCards[nextIndex];
            const nextTheme = getPixelTierTheme(nextItem.card.tier);

            return (
              <div
                onClick={handleNext}
                className="hidden md:flex flex-col items-center justify-center w-36 h-64 rounded-2xl p-2.5 opacity-40 hover:opacity-75 transition-all cursor-pointer transform rotate-3 scale-90 border-2 overflow-hidden shrink-0 shadow-lg"
                style={{
                  background: nextTheme.frontCardBg,
                  borderColor: nextTheme.frontBorder,
                }}
              >
                <span className="font-mono text-[9px] font-black uppercase text-slate-300">
                  {nextTheme.label}
                </span>
                <span className="font-mono text-xs font-bold text-white line-clamp-2 text-center mt-2">
                  {nextItem.card.name}
                </span>
                <span className="mt-auto font-mono text-[9px] text-slate-400">Click ►</span>
              </div>
            );
          })()}

          {/* RIGHT NAV BUTTON */}
          <button
            type="button"
            id="carousel-next-btn"
            onClick={handleNext}
            aria-label="Next Card"
            className="w-10 sm:w-14 h-12 sm:h-16 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-white border-2 border-amber-400/60 shadow-[0_0_12px_rgba(251,191,36,0.2)] flex items-center justify-center cursor-pointer transition-all active:scale-95 z-20 shrink-0"
          >
            <ChevronRight className="w-5 sm:w-8 h-5 sm:h-8" />
          </button>
        </div>

        {/* ================= 5-CARD MINI SELECTION STRIP ================= */}
        <div className="mt-3 flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 px-2 py-2 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-sm shadow-xl z-20 overflow-x-auto max-w-full smooth-scroll">
          {carouselCards.map((item, idx) => {
            const isSelected = idx === currentIndex;
            const theme = getPixelTierTheme(item.card.tier);

            return (
              <button
                key={`thumb-${item.card.id}-${idx}`}
                type="button"
                onClick={() => handleSelectIndex(idx)}
                className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer flex flex-col items-center gap-0.5 border shrink-0 ${
                  isSelected
                    ? 'bg-slate-800 scale-105 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    : 'bg-slate-900/70 border-slate-700/60 opacity-65 hover:opacity-100 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs">{theme.backIcon}</span>
                  <span
                    className="font-black text-[10px] sm:text-xs"
                    style={{ color: isSelected ? '#fbbf24' : theme.primary }}
                  >
                    CARD {idx + 1}
                  </span>
                </div>

                <span className="text-[9px] text-slate-300 font-bold truncate max-w-[55px] sm:max-w-[75px]">
                  {item.card.name}
                </span>

                {isSelected && (
                  <motion.div
                    layoutId="carousel-active-pill"
                    className="absolute -bottom-1.5 w-2 h-1 rounded-full bg-amber-400"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= BOTTOM ACTION CONTROLS (CONFIRMATION & PERSISTENCE) ================= */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 pt-3 pb-3 sm:pb-2 shrink-0 z-30 sticky bottom-0 bg-slate-950/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-slate-800/80 sm:border-0 px-2">
        {/* Requirement 4: CLEAR FINAL "CONFIRM" ACTION */}
        <button
          type="button"
          id="pack-opening-confirm-btn"
          onClick={() => {
            audioManager.playSuccessChime();
            triggerHaptic(30);
            onConfirm();
          }}
          className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black font-mono text-sm sm:text-base uppercase tracking-wider shadow-[0_0_0_2px_#020617,0_0_0_4px_#fbbf24,0_0_20px_rgba(251,191,36,0.6)] cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>CONFIRM & RETURN TO STORE</span>
        </button>

        {/* Action Group for secondary actions on mobile */}
        <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
          {/* OPEN ANOTHER (10 CREDITS) */}
          <button
            type="button"
            id="pack-opening-open-another-btn"
            disabled={credits < BASIC_PACK_PRICE_CREDITS}
            onClick={() => {
              triggerHaptic(20);
              onOpenAnother();
            }}
            className={`flex-1 sm:flex-initial px-3 sm:px-5 py-2.5 rounded-xl font-bold font-mono text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 border shadow-sm transition-all cursor-pointer active:scale-95 ${
              credits >= BASIC_PACK_PRICE_CREDITS
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-400/50 hover:border-amber-300'
                : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>OPEN ANOTHER</span>
          </button>

          {/* VIEW COLLECTION */}
          <button
            type="button"
            id="pack-opening-view-collection-btn"
            onClick={() => {
              audioManager.playCardFlipSound();
              triggerHaptic(15);
              onViewCollection();
            }}
            className="flex-1 sm:flex-initial px-3 sm:px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold font-mono text-xs sm:text-sm uppercase tracking-wider border border-slate-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>COLLECTION</span>
          </button>
        </div>
      </div>

      {/* ================= 32-BIT FULL CARD INSPECTION MODAL (Requirement 3) ================= */}
      <AnimatePresence>
        {inspectingCard && (
          <div
            id="carousel-card-inspect-backdrop"
            className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-150"
            onClick={handleCloseInspection}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border-2 border-amber-400/70 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl text-left relative space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Stepped Corner Pixel Brackets */}
              <div className="absolute top-2 left-2 w-2 h-2 bg-amber-400" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400" />
              <div className="absolute bottom-2 left-2 w-2 h-2 bg-amber-400" />
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-amber-400" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-lg">
                    {getPixelTierTheme(inspectingCard.tier).backIcon}
                  </div>
                  <div>
                    <span className="text-[10.5px] font-mono uppercase font-bold text-slate-400">
                      {inspectingCard.category} CARD CANONICAL DEFINITION
                    </span>
                    <h3 className="text-xl font-black text-white font-mono uppercase tracking-tight">
                      {inspectingCard.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseInspection}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card Canonical Information Breakdown */}
              <div className="space-y-3 text-xs text-slate-300 font-mono">
                {/* Tier & Category Row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">TIER:</span>
                    <span className="font-bold text-amber-300 uppercase">
                      {inspectingCard.tier.toUpperCase()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">CATEGORY:</span>
                    <span className="font-bold text-cyan-300 uppercase">
                      {inspectingCard.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Ownership Breakdown */}
                {(() => {
                  const owned = getCardOwnedCount(inspectingCard.id, collection);
                  const newCount = getNewCardCount(inspectingCard.id);
                  const standard = Math.max(0, owned - newCount);

                  return (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">STORE COLLECTION OWNERSHIP:</span>
                        <span className="text-base font-black text-white font-mono">
                          x{owned} Copies
                        </span>
                      </div>

                      {newCount > 0 && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-400/50 text-[11px] text-amber-200 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-300">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            <span>{newCount} NEW CARD GUARANTEE ACTIVE</span>
                          </div>
                          <p className="text-amber-100/80 leading-relaxed text-[10.5px]">
                            Guaranteed to appear on your next Unique Career draw in{' '}
                            <strong>{inspectingCard.category.toUpperCase()}</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Unique Career Active Deck Status */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">ACTIVE DECK ELIGIBILITY:</span>
                  <div className="flex items-center gap-1.5">
                    {isCardEligibleForUniqueCareerActiveDeck(inspectingCard, collection) ? (
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ELIGIBLE (UNLOCKED)</span>
                      </span>
                    ) : (
                      <span className="font-bold text-rose-400">
                        LOCKED (REQUIRES STORE COPY)
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[11px] font-bold">CANONICAL DESCRIPTION:</div>
                  <p className="text-white text-xs leading-relaxed">
                    {inspectingCard.description}
                  </p>
                </div>

                {/* Canonical Modifiers & Effects */}
                {inspectingCard.modifiers && inspectingCard.modifiers.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-slate-400 text-[11px] font-bold">STAT MODIFIERS / EFFECTS:</div>
                    <div className="space-y-1.5">
                      {inspectingCard.modifiers.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/70 text-xs"
                        >
                          <span className="text-slate-300 uppercase">
                            {m.target.replace('stat_', '')}
                          </span>
                          <span className="font-bold text-emerald-400">
                            {m.operation.toUpperCase()} +{m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Back to Carousel Close Button */}
              <button
                type="button"
                onClick={handleCloseInspection}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold font-mono text-xs uppercase tracking-wider border border-slate-600 transition-colors cursor-pointer"
              >
                RETURN TO CAROUSEL [ ✕ ]
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
