import React, { useState } from 'react';
import { PlayerCardData, AccountingState, ManagerState } from '../types';
import {
  CareerStageCardInstance,
  drawThreeCareerStageCards,
  drawFourCareerStageCards,
  applyCareerStageCard,
  hasInTheShadowOfPerk,
  getAllAvailableCareerStageCards,
} from '../utils/careerCardSystem';
import { CardVisualRenderer, UniversalCardCategory, CardSubclass } from './CardVisualRenderer';
import { Sparkles, DollarSign, ShieldAlert, Award, ArrowRight, Check, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isTestModeEnabled } from '../utils/testModeSystem';
import { TestCardPickerModal } from './TestCardPickerModal';
import { ChoiceSystem } from './ChoiceSystem';
import { isDisasterCard } from '../utils/storeCollectionSystem';
import { DisasterDestructionSequence } from './DisasterDestructionSequence';

export interface CareerStageCardModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  accounting?: AccountingState;
  manager?: ManagerState;
  seasonLabel?: string;
  drawnCards?: CareerStageCardInstance[];
  onSelectCard: (
    updatedPlayer: PlayerCardData,
    updatedAccounting?: AccountingState,
    updatedManager?: ManagerState,
    message?: string
  ) => void;
  onRedrawCards?: () => void;
  onClose?: () => void;
}

export const CareerStageCardModal: React.FC<CareerStageCardModalProps> = ({
  isOpen,
  player,
  accounting,
  manager,
  seasonLabel = '3-CARD DRAW',
  drawnCards: initialDrawnCards,
  onSelectCard,
  onRedrawCards,
  onClose,
}) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'pack_intro' | 'disaster_resolution' | 'selection'>('pack_intro');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cards, setCards] = useState<CareerStageCardInstance[]>(() =>
    initialDrawnCards && initialDrawnCards.length > 0 ? initialDrawnCards : drawThreeCareerStageCards(player, manager)
  );
  const [showCardPicker, setShowCardPicker] = useState<boolean>(false);

  const isTestMode = isTestModeEnabled();

  React.useEffect(() => {
    if (initialDrawnCards && initialDrawnCards.length > 0) {
      setCards(initialDrawnCards);
      setCurrentIndex(0);
    }
  }, [initialDrawnCards]);

  if (!isOpen || !cards || cards.length === 0) return null;

  const inShadowOf = hasInTheShadowOfPerk(player);
  const validIndex = Math.max(0, Math.min(currentIndex, cards.length - 1));
  const selectedCard = cards[validIndex] || cards[0];

  const handleProceedFromPackIntro = () => {
    if (cards.some(isDisasterCard)) {
      setPhase('disaster_resolution');
    } else {
      setPhase('selection');
    }
  };

  const handleConfirmSelection = (card: CareerStageCardInstance) => {
    const result = applyCareerStageCard(card, player, accounting, manager);
    onSelectCard(result.updatedPlayer, result.updatedAccounting, result.updatedManager, result.message);
    if (onClose) onClose();
  };

  const handleRedraw = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onRedrawCards) {
      onRedrawCards();
    } else {
      const newDrawn = drawThreeCareerStageCards(player, manager);
      setCards(newDrawn);
      setCurrentIndex(0);
    }
  };

  const allAvailableCards = React.useMemo(() => {
    return getAllAvailableCareerStageCards();
  }, []);

  const handleSelectFromPicker = (pickedCard: CareerStageCardInstance) => {
    const existingIndex = cards.findIndex((c) => c.id === pickedCard.id);
    if (existingIndex >= 0) {
      setCurrentIndex(existingIndex);
    } else {
      setCards([pickedCard, ...cards.slice(0, 2)]);
      setCurrentIndex(0);
    }
    setPhase('selection');
    setShowCardPicker(false);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-150 select-none font-mono"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40" />

      {/* Test Mode Card Picker Modal */}
      {showCardPicker && (
        <TestCardPickerModal
          isOpen={showCardPicker}
          title="Career Stage Cards • Test Mode Picker"
          subtitle="All Career, Lifestyle, & Sponsor cards sorted from Highest to Lowest Tier (Legendary → Gold/Epic → Silver/Rare → Bronze/Common)"
          cards={allAvailableCards}
          onSelectCard={handleSelectFromPicker}
          onClose={() => setShowCardPicker(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: 32-BIT RETRO PACK INTRO */}
      {/* ========================================================================= */}
      {phase === 'pack_intro' && (
        <div
          className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold p-5 sm:p-7 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex flex-col items-center text-center space-y-4 text-white relative overflow-hidden my-auto animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Badge & Active Perks */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950 border border-amber-400 pixel-bevel-gold text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('CAREER STAGE DECK • {season}', { season: seasonLabel.toUpperCase() })}</span>
            </div>
            {inShadowOf && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-950 border border-purple-400 pixel-bevel-raised text-purple-300 text-[11px] font-black uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>{t('In The Shadow Of (+50% Sponsor, 2x Negative)')}</span>
              </div>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider pixel-text-shadow">
              {t('Preseason & Mid-Season Career Cards')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
              {t('Select 1 card from your 3 drawn cards (Career, Lifestyle, or Sponsor). Accepted Sponsor cards are recorded directly into Accounting.')}
            </p>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
            <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t('FINANCIAL & SPONSOR')}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {t('Brand deals, endorsements, upfront bonuses, and commercial perks.')}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{t('CAREER MILESTONES')}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {t('Tactical training, fame surges, media influence, and lifestyle perks.')}
              </p>
            </div>
          </div>

          {/* Pack Banner */}
          <div className="w-full bg-slate-950 border border-amber-500/50 pixel-bevel-gold p-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-amber-900 border border-amber-500 text-amber-300 flex items-center justify-center font-black text-sm shrink-0">
                🃏
              </div>
              <div className="text-left">
                <div className="font-black text-white text-xs">{cards.length} CAREER CARDS DRAWN</div>
                <div className="text-[10px] text-slate-400">
                  {t('Fame: {fame}/1000 • Agent Marketing: {marketing}', { fame: player.fame || 0, marketing: manager?.marketing || 20 })}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 font-black text-[10px]">
              {t('PICK 1')}
            </span>
          </div>

          {/* Test Mode Action Buttons */}
          {isTestMode && (
            <div className="w-full grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleRedraw}
                className="py-2 px-3 bg-amber-950 hover:bg-amber-900 border border-amber-400 pixel-bevel-gold text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>🎲 RE-DRAW (TEST)</span>
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
          )}

          {/* Open Pack Action */}
          <button
            type="button"
            onClick={handleProceedFromPackIntro}
            className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-amber-300 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <span>{t('REVEAL & SELECT CAREER CARD')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1.5: 32-BIT RETRO DISASTER DESTRUCTION SEQUENCE */}
      {/* ========================================================================= */}
      {phase === 'disaster_resolution' && (
        <DisasterDestructionSequence
          cards={cards}
          onComplete={(surviving) => {
            const nextCards = surviving && surviving.length > 0 ? surviving : cards;
            setCards(nextCards);
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
          totalChoices={cards.length}
          currentIndex={currentIndex}
          onNavigate={setCurrentIndex}
          onConfirm={() => handleConfirmSelection(selectedCard)}
          title={selectedCard.name}
          subtitle={`${seasonLabel} • ${(selectedCard.tier || selectedCard.rarity || 'Bronze').toUpperCase()}`}
          selectorLabel={`CHOICE ${currentIndex + 1} OF ${cards.length}`}
          isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
          themeColor="#f59e0b"
          accentGradient="from-amber-400 via-yellow-300 to-amber-500"
          categoryBadge={
            <div className="flex items-center gap-1.5 font-mono">
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-500 pixel-bevel-gold">
                {selectedCard.category === 'sponsor'
                  ? `SPONSOR (${(selectedCard.tier || selectedCard.rarity || 'Bronze').toUpperCase()})`
                  : selectedCard.category === 'lifestyle'
                  ? 'LIFESTYLE'
                  : 'CAREER STAGE'}
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
                    className="text-[10px] sm:text-xs text-amber-300 hover:bg-amber-900 font-bold px-2 py-1 bg-slate-950 border border-amber-500 pixel-bevel-gold shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Re-draw random career stage cards (Test Mode)"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-Draw</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardPicker(true)}
                    className="text-[10px] sm:text-xs text-emerald-300 hover:bg-emerald-900 font-bold px-2 py-1 bg-slate-950 border border-emerald-500 pixel-bevel-emerald shrink-0 cursor-pointer flex items-center gap-1 transition active:scale-95"
                    title="Browse all available career stage cards (Test Mode)"
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
            {(() => {
              const isSponsor = selectedCard.category === 'sponsor';
              const tier = selectedCard.tier || selectedCard.rarity || 'Bronze';
              const type = selectedCard.type;

              let categoryType: UniversalCardCategory = 'positive';
              let subclass: CardSubclass = 'development';

              if (type === 'negative') {
                categoryType = 'negative';
                subclass = 'setback';
              } else if (type === 'double_edged') {
                categoryType = 'double_edged';
                subclass = 'double_edged';
              }

              const categoryLabel = isSponsor
                ? t('SPONSOR ({tier})', { tier: tier.toUpperCase() })
                : selectedCard.category === 'lifestyle'
                ? t('LIFESTYLE')
                : t('CAREER STAGE');

              const iconName =
                selectedCard.iconName || (isSponsor ? 'Trophy' : selectedCard.category === 'lifestyle' ? 'Smile' : 'Zap');

              return (
                <CardVisualRenderer
                  cardFamily="career"
                  name={selectedCard.name}
                  categoryType={categoryType}
                  subclass={subclass}
                  categoryLabel={categoryLabel}
                  rarity={tier}
                  tier={tier}
                  description={selectedCard.description}
                  effectDescriptions={selectedCard.effects || []}
                  iconName={iconName}
                  isSelected={true}
                  selectButtonText={t('CONFIRM THIS CARD')}
                  index={currentIndex}
                  isNewCardGuaranteed={selectedCard.isNewCardGuaranteed}
                  className="w-full shadow-2xl"
                />
              );
            })()}
          </div>
        </ChoiceSystem>
      )}
    </div>
  );
};
