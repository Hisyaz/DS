import React, { useState, useEffect, useRef } from 'react';
import { PlayerCardData } from '../types';
import {
  InterviewCard,
  InterviewQuestion,
  InterviewQuestionContext,
  InterviewOutcomeResult,
} from '../types/interviewCards';
import {
  generateInterviewQuestion,
  drawThreeInterviewCards,
  applyInterviewCardToPlayer,
  handleDeclineInterview,
} from '../utils/interviewSystem';
import {
  Mic,
  Camera,
  MessageSquare,
  Sparkles,
  Award,
  AlertTriangle,
  Flame,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Newspaper,
  Volume2,
  RotateCw,
  Dices,
  Radio,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTestMode } from '../utils/testModeSystem';

interface PostMatchInterviewModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  context: InterviewQuestionContext;
  onComplete: (updatedPlayer: PlayerCardData, outcome: InterviewOutcomeResult) => void;
}

export const PostMatchInterviewModal: React.FC<PostMatchInterviewModalProps> = ({
  isOpen,
  player,
  context,
  onComplete,
}) => {
  const { t } = useLanguage();
  const { isTestMode } = useTestMode();
  const [phase, setPhase] = useState<'press_room' | 'headline_aftermath'>('press_room');
  const [question, setQuestion] = useState<InterviewQuestion>(() => generateInterviewQuestion(context));
  const [cards, setCards] = useState<InterviewCard[]>(() => drawThreeInterviewCards(context));
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<InterviewOutcomeResult | null>(null);
  const [resolvedPlayer, setResolvedPlayer] = useState<PlayerCardData | null>(null);
  const [flashEffect, setFlashEffect] = useState<boolean>(false);

  // Stable initialization ref to re-roll context if a new match opens
  const initializedMatchRef = useRef<string | null>(null);
  const matchIdentifier = `${context.playerTeamName}_${context.opponentTeamName}_${context.playerScore}_${context.opponentScore}_${context.matchTitle}`;

  useEffect(() => {
    if (isOpen) {
      if (initializedMatchRef.current !== matchIdentifier) {
        initializedMatchRef.current = matchIdentifier;
        setPhase('press_room');
        setSelectedCardId(null);
        setOutcome(null);
        setResolvedPlayer(null);

        // Generate context-aware question and 3 cards
        const q = generateInterviewQuestion(context);
        const drawn = drawThreeInterviewCards(context);
        setQuestion(q);
        setCards(drawn);
      }
    } else {
      initializedMatchRef.current = null;
    }
  }, [isOpen, matchIdentifier, context]);

  // Flash animation trigger
  const triggerCameraFlash = () => {
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);
  };

  // Re-roll / Draw 3 new random cards
  const handleDrawCards = () => {
    triggerCameraFlash();
    setIsDrawing(true);
    setSelectedCardId(null);

    // Immediate draw calculation
    const drawn = drawThreeInterviewCards(context);
    setCards(drawn);

    setTimeout(() => {
      setIsDrawing(false);
    }, 180);
  };

  if (!isOpen) return null;

  // Fallback if question not yet generated
  const activeQuestion = question || generateInterviewQuestion(context);

  // 1. Confirm Selected Card & Deliver Statement
  const handleConfirmCard = () => {
    if (!selectedCardId) return;
    const chosen = cards.find((c) => c.id === selectedCardId);
    if (!chosen) return;

    triggerCameraFlash();
    const { updatedPlayer, outcome: interviewOutcome } = applyInterviewCardToPlayer(player, chosen, context);
    setResolvedPlayer(updatedPlayer);
    setOutcome(interviewOutcome);
    setPhase('headline_aftermath');
  };

  // 2. Decline Interview (-10 Fame Penalty)
  const handleDecline = () => {
    triggerCameraFlash();
    const { updatedPlayer, outcome: declineOutcome } = handleDeclineInterview(player);
    setResolvedPlayer(updatedPlayer);
    setOutcome(declineOutcome);
    setPhase('headline_aftermath');
  };

  // 3. Finish and return to career flow
  const handleFinish = () => {
    if (resolvedPlayer && outcome) {
      onComplete(resolvedPlayer, outcome);
    } else {
      // Fallback
      const { updatedPlayer, outcome: declineOutcome } = handleDeclineInterview(player);
      onComplete(updatedPlayer, declineOutcome);
    }
  };

  // Card visual theme helper
  const getCardAesthetic = (card: InterviewCard) => {
    switch (card.category) {
      case 'good':
        return {
          bg: 'bg-gradient-to-b from-emerald-950/95 via-slate-900 to-slate-950',
          border: 'border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.35)]',
          badge: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50',
          headerIcon: '🟢',
          titleColor: 'text-emerald-300',
          tag: t('GOOD • PRO-CLUB & FANS'),
        };
      case 'bad':
        return {
          bg: 'bg-gradient-to-b from-red-950/95 via-slate-900 to-slate-950',
          border: 'border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.35)]',
          badge: 'bg-red-500/25 text-red-300 border-red-400/50',
          headerIcon: '🔴',
          titleColor: 'text-red-300',
          tag: t('BAD • CONTROVERSY & FALLOUT'),
        };
      case 'double_edged':
        return {
          bg: 'bg-gradient-to-b from-purple-950/95 via-slate-900 to-slate-950',
          border: 'border-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.35)]',
          badge: 'bg-purple-500/25 text-purple-300 border-purple-400/50',
          headerIcon: '⚔️',
          titleColor: 'text-purple-300',
          tag: t('DOUBLE-EDGED • HIGH RISK / REWARD'),
        };
      case 'iconic':
        return {
          bg: 'bg-gradient-to-b from-black via-amber-950/95 to-slate-950',
          border: 'border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.6)] ring-2 ring-amber-400/50',
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 font-black',
          headerIcon: '⭐',
          titleColor: 'text-amber-300',
          tag: t('ICONIC • IMMORTAL DECLARATION'),
        };
    }
  };

  const getTierLabel = (tier: string) => {
    return t(
      tier
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-slate-950 text-white overflow-hidden animate-fade-in text-left">
      {/* Visual Camera Flash Overlay */}
      {flashEffect && (
        <div className="fixed inset-0 bg-white/40 z-[80] pointer-events-none transition-opacity duration-200" />
      )}

      {/* Header Bar */}
      <header className="shrink-0 p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 shrink-0">
            <Mic className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-400/40">
                {t(activeQuestion.outletBadge)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">• {activeQuestion.journalistName}</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight mt-0.5">
              {t('POST-MATCH PRESS CONFERENCE')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-bold">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span>{t('LIVE MEDIA')}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6 custom-scrollbar">
        {/* ================= MAIN PHASE 1: PRESS ROOM QUESTION & CARDS SELECTION ================= */}
        {phase === 'press_room' && (
          <div className="space-y-6">
            {/* The Contextual Journalist Question */}
            <div className="bg-slate-900 border-2 border-violet-500/40 p-5 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-black text-violet-300 uppercase tracking-wider">
                    {t(activeQuestion.outletName)} • {t(activeQuestion.contextHeader)}
                  </span>
                </div>
                <div className="text-slate-300 font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  {context.playerTeamName} <strong className="text-amber-400 font-black">{context.playerScore} - {context.opponentScore}</strong> {context.opponentTeamName}
                </div>
              </div>

              <p className="text-base sm:text-lg font-semibold text-slate-100 italic leading-relaxed pl-4 border-l-4 border-violet-500">
                "{t(activeQuestion.questionText)}"
              </p>
            </div>

            {/* Instruction Banner & Draw Trigger */}
            <div className="flex items-center justify-between text-xs px-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {t('DRAW 3 CARDS • CHOOSE 1 REACTION')}:
                </span>
                <span className="hidden sm:inline text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  60% {t('Bad')} • 30% {t('Double-Edged')} • 10% {t('Good')}
                </span>
              </div>

              {/* Draw / Re-Draw Button (Only visible if Test Mode is enabled) */}
              {isTestMode && (
                <button
                  type="button"
                  onClick={handleDrawCards}
                  disabled={isDrawing}
                  className="px-4 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 hover:text-white border border-amber-500/50 hover:border-amber-400 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                  title="Test Mode: Re-roll 3 random interview cards"
                >
                  <Dices className={`w-4 h-4 text-amber-400 ${isDrawing ? 'animate-spin' : ''}`} />
                  <span>{cards.length === 0 ? t('DRAW 3 CARDS') : t('RE-DRAW CARDS (Test Mode)')}</span>
                </button>
              )}
            </div>

            {/* 3 Drawn Cards Grid */}
            {cards.length === 0 ? (
              <div className="p-10 text-center bg-slate-900 rounded-3xl border border-dashed border-slate-800 space-y-4">
                <Camera className="w-12 h-12 text-violet-400 mx-auto animate-pulse" />
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  {t('The microphones are hot. Press Draw to pull 3 randomized press reaction cards.')}
                </p>
                <button
                  type="button"
                  onClick={handleDrawCards}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 text-white font-black text-sm shadow-xl shadow-violet-600/30 cursor-pointer"
                >
                  {t('DRAW 3 PRESS CARDS')}
                </button>
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-200 ${isDrawing ? 'opacity-40 scale-98 pointer-events-none' : 'opacity-100'}`}>
                {cards.map((card) => {
                  const isSelected = selectedCardId === card.id;
                  const style = getCardAesthetic(card);

                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`rounded-3xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 text-left relative ${style.bg} ${
                        isSelected
                          ? `${style.border} ring-4 ring-violet-400 scale-[1.02] shadow-2xl z-10`
                          : 'border-slate-800 opacity-90 hover:opacity-100 hover:border-slate-600'
                      }`}
                    >
                      {/* Top Tier & Classification Pill */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-lg border ${style.badge}`}>
                            {getTierLabel(card.tier)}
                          </span>
                          {isSelected ? (
                            <span className="flex items-center gap-1 text-xs font-black text-violet-200 bg-violet-950 px-2.5 py-0.5 rounded-lg border border-violet-400 shadow-md">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t('SELECTED')}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">{style.headerIcon}</span>
                          )}
                        </div>

                        <div className="text-xs font-black text-slate-400 tracking-wider">
                          {style.tag}
                        </div>

                        <h4 className={`text-base font-black ${style.titleColor}`}>
                          {t(card.name)}
                        </h4>
                      </div>

                      {/* Spoken Quote in Speech Bubble */}
                      <div className="bg-black/60 border border-white/10 p-3 rounded-2xl text-xs sm:text-sm text-slate-100 italic leading-relaxed shadow-inner">
                        "{t(card.quote)}"
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {t(card.description)}
                      </p>

                      {/* Modifiers & Consequences Preview */}
                      <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                        {/* Fame Impact */}
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-400">{t('Fame Impact')}:</span>
                          <span className={card.effects.fameDelta >= 0 ? 'text-purple-300 font-black' : 'text-rose-400 font-black'}>
                            {card.effects.fameDelta >= 0 ? `+${card.effects.fameDelta}` : card.effects.fameDelta}
                          </span>
                        </div>

                        {/* Bad Reputation */}
                        {card.effects.badReputationDelta ? (
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-400">{t('Bad Reputation')}:</span>
                            <span className={card.effects.badReputationDelta > 0 ? 'text-red-400' : 'text-emerald-400'}>
                              {card.effects.badReputationDelta > 0 ? `+${card.effects.badReputationDelta}` : card.effects.badReputationDelta}
                            </span>
                          </div>
                        ) : null}

                        {/* Team Chemistry */}
                        {card.effects.chemistryDelta !== undefined && (
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-400">{t('Locker Room')}:</span>
                            <span className={card.effects.chemistryDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {card.effects.chemistryDelta >= 0 ? `+${card.effects.chemistryDelta}% ${t('Chem')}` : `${card.effects.chemistryDelta}% ${t('Chem')}`}
                            </span>
                          </div>
                        )}

                        {/* Chemistry Ceiling Warning */}
                        {card.effects.chemistryCeiling && (
                          <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 flex items-start gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <span>
                              <strong>{t('Chemistry Ceiling')}:</strong> {t('Capped at {cap}% for {months}m', {
                                cap: card.effects.chemistryCeiling.capPercent,
                                months: card.effects.chemistryCeiling.durationMonths,
                              })}
                            </span>
                          </div>
                        )}

                        {/* Bonus Stat / Perk */}
                        {card.effects.bonusStatPoint && (
                          <div className="flex items-center justify-between font-bold text-amber-300">
                            <span>{t('Bonus Attribute')}:</span>
                            <span>+{card.effects.bonusStatPoint} {t(card.effects.statTarget || 'Points')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= MAIN PHASE 2: RESOLUTION & BREAKING MEDIA HEADLINE ================= */}
        {phase === 'headline_aftermath' && outcome && (
          <div className="space-y-8 text-center py-6 animate-in fade-in duration-300">
            {/* Breaking News Header */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black uppercase tracking-wider">
                <Newspaper className="w-4 h-4 text-red-400" />
                {t('BREAKING MEDIA HEADLINE')}
              </div>

              {/* Newspaper Headline Box */}
              <div className="bg-slate-900 border-2 border-slate-700 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  "{t(outcome.headline)}"
                </h3>
                <p className="text-sm sm:text-base text-slate-300 italic leading-relaxed">
                  {t(outcome.pressSummary)}
                </p>
              </div>
            </div>

            {/* Applied Consequences Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto text-xs">
              {/* Fame Delta */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">{t('Fame')}</div>
                <div className={`text-xl font-black ${outcome.fameDelta >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                  {outcome.fameDelta >= 0 ? `+${outcome.fameDelta}` : outcome.fameDelta}
                </div>
              </div>

              {/* Bad Rep Delta */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">{t('Bad Rep')}</div>
                <div className={`text-xl font-black ${outcome.badRepDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {outcome.badRepDelta > 0 ? `+${outcome.badRepDelta}` : `${outcome.badRepDelta}`}
                </div>
              </div>

              {/* Chemistry Delta */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">{t('Team Chem')}</div>
                <div className={`text-xl font-black ${outcome.chemistryDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {outcome.chemistryDelta >= 0 ? `+${outcome.chemistryDelta}%` : `${outcome.chemistryDelta}%`}
                </div>
              </div>

              {/* Fan Reaction */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">{t('Public Reaction')}</div>
                <div className="text-sm font-black text-amber-300 capitalize">
                  {t(outcome.fanReaction.replace('_', ' '))}
                </div>
              </div>
            </div>

            {/* Active Chemistry Ceiling Warning if applied */}
            {outcome.appliedChemistryCeiling && (
              <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-red-950/80 border border-red-500/60 text-xs sm:text-sm text-red-200 text-left flex items-start gap-3 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black text-red-300">
                    {t('CHEMISTRY CEILING ACTIVE: CAPPED AT {cap}%', {
                      cap: outcome.appliedChemistryCeiling.capPercent,
                    })}
                  </div>
                  <div className="text-xs text-red-300/80 mt-1 leading-relaxed">
                    {t(outcome.appliedChemistryCeiling.reason)}. {t('Monthly growth will not exceed this limit for the next {months} months.', {
                      months: outcome.appliedChemistryCeiling.durationMonths,
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky Action Footer */}
      <footer className="shrink-0 p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 shadow-lg">
        {phase === 'press_room' ? (
          <>
            <button
              type="button"
              onClick={handleDecline}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-700/60 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              title={t('Declining causes a -10 Fame penalty')}
            >
              <span>{t('Decline Interview / Walk Away')}</span>
              <span className="text-xs text-red-400 font-mono font-black">(-10 {t('Fame')})</span>
            </button>

            <button
              type="button"
              disabled={!selectedCardId}
              onClick={handleConfirmCard}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-xl ${
                selectedCardId
                  ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-700 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-violet-600/40 cursor-pointer active:scale-98'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Mic className="w-5 h-5" />
              <span>{t('DELIVER PRESS STATEMENT')}</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </>
        ) : (
          <div className="w-full flex justify-end">
            <button
              type="button"
              onClick={handleFinish}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/25 transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{t('CONTINUE CAREER FLOW')}</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
