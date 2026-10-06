import React, { useState } from 'react';
import { PlayerConfig } from '../types';
import { YouthCardInstance } from '../types/youthLeagueCards';
import { CardVisualRenderer, UniversalCardCategory } from './CardVisualRenderer';
import { Award, Lock, Sparkles, ArrowRight, Check, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isTestModeEnabled } from '../utils/testModeSystem';
import { drawThreeYouthCards, getAllAvailableYouthCards } from '../utils/youthLeagueCardSystem';
import { TestCardPickerModal } from './TestCardPickerModal';
import { ChoiceSystem } from './ChoiceSystem';
import { isDisasterCard } from '../utils/storeCollectionSystem';
import { DisasterDestructionSequence } from './DisasterDestructionSequence';

interface YouthCardModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  seasonLabel: string; // e.g. "Mid-Season Draw (Dec-Jan)" or "Pre-Season Draw (Jul-Aug)"
  drawnCards: YouthCardInstance[];
  onSelectCard: (selectedCard: YouthCardInstance) => void;
  onRedrawCards?: () => void;
}

export const YouthCardModal: React.FC<YouthCardModalProps> = ({
  isOpen,
  player,
  seasonLabel,
  drawnCards: initialDrawnCards,
  onSelectCard,
  onRedrawCards,
}) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'pack_intro' | 'disaster_resolution' | 'selection'>('pack_intro');
  const [internalCards, setInternalCards] = useState<YouthCardInstance[]>(initialDrawnCards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showCardPicker, setShowCardPicker] = useState<boolean>(false);

  const isTestMode = isTestModeEnabled();
  const currentCards = internalCards && internalCards.length > 0 ? internalCards : initialDrawnCards;

  React.useEffect(() => {
    if (isOpen) {
      if (initialDrawnCards && initialDrawnCards.length > 0) {
        setInternalCards(initialDrawnCards);
      }
      setCurrentIndex(0);
      setPhase('pack_intro');
    }
  }, [isOpen, initialDrawnCards]);

  if (!isOpen || !currentCards || currentCards.length === 0) return null;

  const selectedCard = currentCards[currentIndex] || currentCards[0];

  const handleOpenPack = () => {
    if (currentCards.some(isDisasterCard)) {
      setPhase('disaster_resolution');
    } else {
      setPhase('selection');
    }
  };

  const handleConfirmSelection = (card: YouthCardInstance) => {
    onSelectCard(card);
  };

  const getUniversalCategory = (card: YouthCardInstance): UniversalCardCategory => {
    if (card.category === 'negative_youth') return 'negative';
    if (card.category === 'double_edged') return 'double_edged';
    if (card.category === 'iconic_youth' || card.rarity === 'Iconic') return 'iconic';
    return 'positive';
  };

  const handleRedraw = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onRedrawCards) {
      onRedrawCards();
    } else {
      const hasMgr = Boolean((player as any).managerState || player.managerName);
      const newDrawn = drawThreeYouthCards(hasMgr);
      setInternalCards(newDrawn);
      setCurrentIndex(0);
    }
  };

  const allAvailableYouthCards = React.useMemo(() => {
    return getAllAvailableYouthCards();
  }, []);

  const handleSelectFromPicker = (pickedCard: YouthCardInstance) => {
    if (!currentCards.some((c) => c.instanceId === pickedCard.instanceId)) {
      setInternalCards([pickedCard, ...currentCards.slice(0, 2)]);
    }
    setCurrentIndex(0);
    setPhase('selection');
    setShowCardPicker(false);
  };

  const subclass =
    selectedCard.category === 'negative_youth'
      ? 'setback'
      : selectedCard.category === 'double_edged'
      ? 'double_edged'
      : 'development';

  return (
    <>
      {/* Test Mode Card Picker Modal */}
      {showCardPicker && (
        <TestCardPickerModal
          isOpen={showCardPicker}
          title="Youth Academy Cards • Test Mode Picker"
          subtitle="All Youth Academy cards sorted from Highest to Lowest Tier (Iconic → Legendary → Gold → Silver → Bronze)"
          cards={allAvailableYouthCards}
          onSelectCard={handleSelectFromPicker}
          onClose={() => setShowCardPicker(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: 32-BIT RETRO INTRO */}
      {/* ========================================================================= */}
      {phase === 'pack_intro' && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-150 select-none font-pixel">
          <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40" />

          <div className="w-full max-w-xl bg-slate-900 border-2 border-sky-500 pixel-corners pixel-bevel-cyan p-5 sm:p-7 shadow-[0_0_30px_rgba(14,165,233,0.35)] flex flex-col items-center text-center space-y-4 text-white relative overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-950 border border-sky-400 pixel-corners pixel-bevel-cyan text-sky-300 text-[10px] font-black uppercase tracking-wider font-arcade">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span>{t('YOUTH_MODAL_BADGE')} • {seasonLabel.toUpperCase()}</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider pixel-text-shadow">
                {t('YOUTH_MODAL_TITLE')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-retro leading-relaxed max-w-md mx-auto">
                {t('YOUTH_MODAL_SUBTITLE')}
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-raised p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-sky-400 uppercase font-arcade">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>ACADEMY GROWTH</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-retro">
                  Development drills, breakthrough matches, coaching feedback, or physical milestones.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-raised p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase font-arcade">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>YOUTH PROGRESSION</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-retro">
                  Carefully select the best trajectory for your youth league development season.
                </p>
              </div>
            </div>

            {/* Cards Count Banner */}
            <div className="w-full bg-slate-950 border border-sky-500/50 pixel-corners pixel-bevel-cyan p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-sky-900 border border-sky-500 pixel-corners text-sky-300 flex items-center justify-center font-black text-sm shrink-0 font-arcade">
                  🏅
                </div>
                <div className="text-left">
                  <div className="font-black text-white text-xs">{currentCards.length} YOUTH CARDS DRAWN</div>
                  <div className="text-[10px] text-slate-400 font-retro">Presented one card at a time in full focus</div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-sky-950 border border-sky-500 pixel-corners text-sky-300 font-black text-[9px] font-arcade">
                32-BIT YOUTH
              </span>
            </div>

            {/* Test Mode Action Buttons */}
            {isTestMode && (
              <div className="w-full grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRedraw}
                  className="py-2 px-3 bg-sky-950 hover:bg-sky-900 border border-sky-400 pixel-corners pixel-bevel-cyan text-sky-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 font-pixel"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>🎲 RE-DRAW (TEST)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCardPicker(true)}
                  className="py-2 px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-400 pixel-corners pixel-bevel-emerald text-emerald-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 font-pixel"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>🎴 PICK CARD</span>
                </button>
              </div>
            )}

            {/* Open Pack Action */}
            <button
              type="button"
              onClick={handleOpenPack}
              className="w-full min-h-[44px] bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-sky-300 pixel-corners pixel-bevel-cyan shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all cursor-pointer active:scale-95 font-pixel"
            >
              <span>REVEAL & SELECT YOUTH CARD</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1.5: 32-BIT RETRO DISASTER DESTRUCTION SEQUENCE */}
      {/* ========================================================================= */}
      {phase === 'disaster_resolution' && (
        <DisasterDestructionSequence
          cards={currentCards}
          onComplete={(surviving) => {
            const nextCards = surviving && surviving.length > 0 ? surviving : currentCards;
            setInternalCards(nextCards);
            setCurrentIndex(0);
            setPhase('selection');
          }}
        />
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
          onConfirm={() => handleConfirmSelection(selectedCard)}
          title={selectedCard.name}
          subtitle={`${seasonLabel} • ${selectedCard.rarity.toUpperCase()}`}
          selectorLabel={`CHOICE ${currentIndex + 1} OF ${currentCards.length}`}
          isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
          themeColor="#0284c7"
          accentGradient="from-sky-400 via-cyan-300 to-sky-500"
          categoryBadge={
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-500 pixel-bevel-cyan">
                {selectedCard.categoryLabel || 'Youth Academy'}
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
              {isTestMode && (
                <>
                  <button
                    type="button"
                    onClick={handleRedraw}
                    className="text-[10px] sm:text-xs text-sky-300 hover:bg-sky-900 font-bold px-2 py-1 bg-slate-950 border border-sky-500 pixel-bevel-cyan shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Re-draw random youth cards (Test Mode)"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-Draw</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardPicker(true)}
                    className="text-[10px] sm:text-xs text-emerald-300 hover:bg-emerald-900 font-bold px-2 py-1 bg-slate-950 border border-emerald-500 pixel-bevel-emerald shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Browse all available youth cards (Test Mode)"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Pick</span>
                  </button>
                </>
              )}
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
              cardFamily="youth"
              name={selectedCard.name}
              categoryType={getUniversalCategory(selectedCard)}
              subclass={subclass}
              categoryLabel={selectedCard.categoryLabel}
              rarity={selectedCard.rarity}
              description={selectedCard.description}
              effectDescriptions={selectedCard.effectDescriptions || []}
              iconName={selectedCard.iconName}
              isSelected={true}
              selectButtonText="CURRENT CHOICE"
              index={currentIndex}
              isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
              className="w-full shadow-2xl"
            />
          </div>
        </ChoiceSystem>
      )}
    </>
  );
};
