import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ParentCardInstance } from '../types/parentCards';
import { CardVisualRenderer, UniversalCardCategory } from './CardVisualRenderer';
import { Zap, Check, Sparkles, ArrowRight, ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isTestModeEnabled } from '../utils/testModeSystem';
import { drawFourParentCards, drawThreeParentCards, getAllAvailableParentCards } from '../utils/parentCardSystem';
import { TestCardPickerModal } from './TestCardPickerModal';
import { ChoiceSystem } from './ChoiceSystem';
import { getChampionCredits, deductChampionCredits } from '../utils/storeCollectionSystem';
import { getStoredChampionPoints, modifyStoredChampionPoints } from '../utils/legendCareerSystem';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';

interface ParentCardModalProps {
  isOpen: boolean;
  cards: ParentCardInstance[];
  onSelectParentCard: (card: ParentCardInstance) => void;
  onRedrawCards?: (newCards?: ParentCardInstance[]) => void;
  startingCityOrCountry?: string;
  playerNationalityCode?: string;
  showToast?: (msg: string) => void;
}

export const ParentCardModal: React.FC<ParentCardModalProps> = ({
  isOpen,
  cards: initialCards,
  onSelectParentCard,
  onRedrawCards,
  startingCityOrCountry,
  playerNationalityCode,
  showToast,
}) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'pack_intro' | 'selection'>('pack_intro');
  const [internalCards, setInternalCards] = useState<ParentCardInstance[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showCardPicker, setShowCardPicker] = useState<boolean>(false);
  const [pointsBalance, setPointsBalance] = useState<number>(() =>
    Math.max(getChampionCredits(), getStoredChampionPoints())
  );

  const isTestMode = isTestModeEnabled();
  const currentCards = internalCards && internalCards.length > 0 ? internalCards : initialCards;

  const allAvailableParentCards = useMemo(() => {
    return getAllAvailableParentCards(startingCityOrCountry, playerNationalityCode);
  }, [startingCityOrCountry, playerNationalityCode]);

  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      if (initialCards && initialCards.length > 0) {
        setInternalCards(initialCards);
      }
      setCurrentIndex(0);
      setPhase('pack_intro');
      setPointsBalance(Math.max(getChampionCredits(), getStoredChampionPoints()));
    } else if (isOpen && initialCards && initialCards.length > 0) {
      setInternalCards((prev) => (prev && prev.length > 0 ? prev : initialCards));
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialCards]);

  if (!isOpen || !currentCards || currentCards.length === 0) return null;

  const selectedCard = currentCards[currentIndex] || currentCards[0];

  const getUniversalCategory = (card: ParentCardInstance): UniversalCardCategory => {
    if (card.rarity === 'iconic') return 'iconic';
    return 'positive';
  };

  const handleOpenPack = () => {
    setPhase('selection');
  };

  const handleRerollWithCost = (e?: React.MouseEvent, isFreeTest: boolean = false) => {
    if (e) e.stopPropagation();

    if (!isFreeTest && !isTestMode) {
      const current = Math.max(getChampionCredits(), getStoredChampionPoints());
      if (current < 5) {
        haptics.errorBuzz();
        if (showToast) {
          showToast(`⚠️ Insufficient Champion Points! Re-rolling parent cards requires 5 points (Current: ${current}).`);
        }
        return;
      }

      // Deduct 5 Champion Points from persistent state
      deductChampionCredits(5);
      modifyStoredChampionPoints(-5);
      const nextBal = Math.max(0, current - 5);
      setPointsBalance(nextBal);
      if (showToast) {
        showToast(`🎲 Parent cards re-rolled! (-5 Champion Points • Remaining: ${nextBal})`);
      }
    } else {
      if (showToast) {
        showToast('🎲 Parent cards re-rolled with fresh potential! (Test Mode • Free)');
      }
    }

    audioManager.playRerollDiceSound();
    haptics.mediumTap();

    // Re-roll 4 parent cards with the EXACT same starting city and nationality parameters
    const freshCards = drawFourParentCards(startingCityOrCountry, playerNationalityCode);
    setInternalCards(freshCards);
    setCurrentIndex(0);

    if (onRedrawCards) {
      onRedrawCards(freshCards);
    }
  };

  const handleSelectFromPicker = (pickedCard: ParentCardInstance) => {
    if (!currentCards.some((c) => c.id === pickedCard.id)) {
      const updated = [pickedCard, ...currentCards.slice(0, 2)];
      setInternalCards(updated);
      if (onRedrawCards) onRedrawCards(updated);
    }
    setCurrentIndex(0);
    setPhase('selection');
    setShowCardPicker(false);
  };

  const allEffects = [
    ...(selectedCard.perkEffects || []),
    `Perk: ${selectedCard.perkTitle} - ${selectedCard.perkDescription}`,
  ];

  return (
    <>
      {/* Test Mode Card Picker Modal */}
      {showCardPicker && (
        <TestCardPickerModal
          isOpen={showCardPicker}
          title="Parent Heritage Cards • Test Mode Picker"
          subtitle="All Heritage cards sorted from Highest to Lowest Tier (Iconic → Legendary → Gold → Silver → Bronze)"
          cards={allAvailableParentCards}
          onSelectCard={handleSelectFromPicker}
          onClose={() => setShowCardPicker(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: 32-BIT RETRO PACK INTRO */}
      {/* ========================================================================= */}
      {phase === 'pack_intro' && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-150 select-none font-mono">
          <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40" />

          <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold p-5 sm:p-7 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex flex-col items-center text-center space-y-4 text-white relative overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Step Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950 border border-amber-400 pixel-bevel-gold text-amber-300 text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>{t('PARENT_MODAL_BADGE')}</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider pixel-text-shadow">
                {t('PARENT_MODAL_TITLE')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
                {t('PARENT_MODAL_SUBTITLE')}
              </p>
            </div>

            {/* Key Info Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{t('FAMILY BACKGROUND') || 'FAMILY BACKGROUND'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {t('Childhood upbringing, household stability, surname origin, and early habits.') || 'Childhood upbringing, household stability, surname origin, and early habits.'}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t('PARENT_MODAL_PERMANENT')}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Permanent traits, stat multipliers, and special childhood perks unlocked at age 10.
                </p>
              </div>
            </div>

            {/* 4 Cards Mystery Pack Graphic Banner */}
            <div className="w-full bg-slate-950 border border-amber-600/50 pixel-bevel-gold p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-amber-900 border border-amber-500 text-amber-300 flex items-center justify-center font-black text-sm shrink-0">
                  🎴
                </div>
                <div className="text-left">
                  <div className="font-black text-white text-xs">{t(`${currentCards.length} HERITAGE CARDS DRAWN`) || t('HERITAGE_CARDS_DRAWN', { count: currentCards.length }) || `${currentCards.length} HERITAGE CARDS DRAWN`}</div>
                  <div className="text-[10px] text-slate-400">Presented one at a time with full details</div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 font-black text-[10px]">
                32-BIT DRAW
              </span>
            </div>

            {/* Action Bar: Reroll & Card Picker */}
            <div className="w-full flex flex-col gap-2 pt-1">
              {isTestMode ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleRerollWithCost(e, true)}
                    className="py-2 px-3 bg-amber-950 hover:bg-amber-900 border border-amber-400 pixel-bevel-gold text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>🎲 RE-ROLL (FREE)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardPicker(true)}
                    className="py-2 px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-400 pixel-bevel-emerald text-emerald-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>🎴 PICK CARD</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleRerollWithCost(e, false)}
                  className="w-full py-2 px-3 bg-amber-950 hover:bg-amber-900 border border-amber-400 pixel-bevel-gold text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-between transition cursor-pointer active:scale-95 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('🎲 RE-ROLL PARENT CARDS') || t('PARENT_MODAL_REROLL_BTN') || '🎲 RE-ROLL PARENT CARDS'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-amber-900 text-amber-200 text-[10px] border border-amber-500">
                      🪙 5 PTS
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Balance: {pointsBalance.toLocaleString()}
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Big Open Pack Button */}
            <button
              type="button"
              onClick={handleOpenPack}
              className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-amber-300 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <span>{t('REVEAL & CHOOSE HERITAGE CARD') || t('PARENT_MODAL_REVEAL_BTN') || 'REVEAL & CHOOSE HERITAGE CARD'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: 32-BIT SELECTION SYSTEM */}
      {/* ========================================================================= */}
      {phase === 'selection' && (
        <ChoiceSystem
          isOpen={isOpen}
          totalChoices={currentCards.length}
          currentIndex={currentIndex}
          onNavigate={setCurrentIndex}
          onConfirm={() => onSelectParentCard(selectedCard)}
          title={selectedCard.name}
          subtitle={`${selectedCard.familyDisplay} • ${selectedCard.rarity.toUpperCase()}`}
          selectorLabel={`CHOICE ${currentIndex + 1} OF ${currentCards.length}`}
          isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
          categoryBadge={
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold">
                {selectedCard.badgeText || t('CARD_BADGE_PARENT')}
              </span>
              {selectedCard.isNewCardGuaranteed && (
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 border border-yellow-200 pixel-bevel-gold animate-pixel-blink">
                  ★ NEW CARD
                </span>
              )}
            </div>
          }
          topActions={
            <div className="flex items-center gap-1.5 font-mono">
              {isTestMode ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleRerollWithCost(e, true)}
                    className="text-[10px] sm:text-xs text-amber-300 hover:bg-amber-900 font-bold px-2 py-1 bg-slate-950 border border-amber-500 pixel-bevel-gold shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Re-roll parent cards with fresh potential (Test Mode • Free)"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-Roll</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardPicker(true)}
                    className="text-[10px] sm:text-xs text-emerald-300 hover:bg-emerald-900 font-bold px-2 py-1 bg-slate-950 border border-emerald-500 pixel-bevel-emerald shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Browse all available parent cards (Test Mode)"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Pick</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleRerollWithCost(e, false)}
                  className="text-[10px] sm:text-xs text-amber-300 hover:bg-amber-900 font-bold px-2 py-1 bg-slate-950 border border-amber-500 pixel-bevel-gold shrink-0 cursor-pointer flex items-center gap-1 shadow-sm transition active:scale-95"
                  title="Re-roll 4 parent cards with fresh potential (Costs 5 Champion Points)"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>Re-Roll (5p)</span>
                </button>
              )}
              <div className="hidden sm:flex items-center text-[10px] font-bold text-slate-300 bg-slate-950 border border-slate-700 px-2 py-1 pixel-bevel-raised">
                🪙 {pointsBalance.toLocaleString()}
              </div>
              <button
                type="button"
                onClick={() => setPhase('pack_intro')}
                className="text-[10px] sm:text-xs text-slate-300 hover:text-white font-bold px-2 py-1 bg-slate-950 border border-slate-700 pixel-bevel-raised shrink-0 cursor-pointer active:scale-95"
              >
                Info
              </button>
            </div>
          }
          confirmLabel={`CONFIRM: ${selectedCard.name.toUpperCase()}`}
          confirmIcon={<Check className="w-5 h-5 stroke-[3]" />}
        >
          {/* Centered Large Card Visual Display */}
          <div className="w-full max-w-md mx-auto flex flex-col items-center">
            <CardVisualRenderer
              card={selectedCard}
              cardId={selectedCard.id}
              name={selectedCard.name}
              subTitle={selectedCard.familyDisplay}
              categoryType={getUniversalCategory(selectedCard)}
              categoryLabel={selectedCard.badgeText || t('CARD_BADGE_PARENT')}
              rarity={selectedCard.rarity}
              description={selectedCard.description}
              effectDescriptions={allEffects}
              iconName={selectedCard.iconName}
              isSelected={true}
              selectButtonText="CURRENT CHOICE"
              index={currentIndex}
              parentPotentialBonus={selectedCard.potentialBonus}
              isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
              className="w-full shadow-2xl"
            />
          </div>
        </ChoiceSystem>
      )}
    </>
  );
};
