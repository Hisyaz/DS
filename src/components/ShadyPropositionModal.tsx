import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Flame,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  Skull,
} from 'lucide-react';
import { ShadyProposition, PlayerCardData, AccountingState, ManagerState } from '../types';
import { resolveShadyProposition } from '../utils/managerInteractionSystem';
import { useLanguage } from '../context/LanguageContext';

interface ShadyPropositionModalProps {
  isOpen: boolean;
  proposition: ShadyProposition | null;
  player: PlayerCardData;
  accounting?: AccountingState;
  manager?: ManagerState;
  onDecisionResolved: (
    updatedPlayer: PlayerCardData,
    updatedAccounting: AccountingState,
    headline: string,
    narrative: string,
    sanctioned: boolean
  ) => void;
  onClose: () => void;
}

export const ShadyPropositionModal: React.FC<ShadyPropositionModalProps> = ({
  isOpen,
  proposition,
  player,
  accounting,
  manager,
  onDecisionResolved,
  onClose,
}) => {
  const { t } = useLanguage();
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionOutcome, setResolutionOutcome] = useState<{
    headline: string;
    narrative: string;
    sanctioned: boolean;
    cashReward: number;
    fine: number;
  } | null>(null);

  if (!isOpen || !proposition) return null;

  const handleDecision = (accepted: boolean) => {
    setIsResolving(true);
    const result = resolveShadyProposition(proposition, accepted, player, accounting);

    setResolutionOutcome({
      headline: result.resultHeadline,
      narrative: result.resultNarrative,
      sanctioned: result.sanctioned,
      cashReward: result.cashRewardEarned,
      fine: result.fineIncurred,
    });

    onDecisionResolved(
      result.updatedPlayer,
      result.updatedAccounting,
      result.resultHeadline,
      result.resultNarrative,
      result.sanctioned
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0f0d14] border-2 border-rose-600/60 rounded-3xl shadow-2xl shadow-rose-950/70 p-5 sm:p-7 flex flex-col gap-5 text-white">
        {/* HEADER */}
        <div className="flex items-center gap-3.5 border-b border-rose-900/40 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-rose-400 uppercase bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md">
                {t('Confidential Agent Proposition')}
              </span>
              <span className="text-xs text-rose-300/80 font-bold">
                {t('Representative')}: {manager?.name || t('Shady Agent')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {t(proposition.title)}
            </h2>
          </div>
        </div>

        {/* BODY CONTENT */}
        {!resolutionOutcome ? (
          <div className="space-y-4">
            {/* Agent's Secret Pitch */}
            <div className="bg-[#181320] border border-rose-800/40 rounded-2xl p-4 sm:p-5 space-y-2.5">
              <div className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <Skull className="w-4 h-4 text-rose-400" />
                {t('The Underground Deal')}: {t(proposition.scenario)}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed italic">
                "{t(proposition.description)}"
              </p>
              <div className="p-3 bg-rose-950/60 border border-rose-700/40 rounded-xl text-xs text-rose-200">
                <strong>{t('Specific Directive')}:</strong> {t(proposition.actionInstruction)}
              </div>
            </div>

            {/* REWARDS VS RISKS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* REWARDS */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                <div className="font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  {t('Underground Compensation')}
                </div>
                <div className="space-y-1 text-slate-200">
                  <div className="text-lg font-black text-emerald-300">
                    +€{proposition.cashReward.toLocaleString()} {t('Instant Cash')}
                  </div>
                  <div className="text-emerald-400 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {t(proposition.promisedClubBonus)}
                  </div>
                </div>
              </div>

              {/* RISKS */}
              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 space-y-2">
                <div className="font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  {t('FA Integrity Risk')} ({proposition.investigationRiskPct}%)
                </div>
                <div className="space-y-1 text-slate-300">
                  <div>
                    {t('Fine')}: <strong className="text-rose-400">€{proposition.sanctionFine.toLocaleString()}</strong>
                  </div>
                  <div>
                    {t('Suspension')}: <strong className="text-rose-400">{proposition.matchBanWeeks} {t('Match Weeks Ban')}</strong>
                  </div>
                  <div>
                    {t('Infamy')}: <strong className="text-rose-400">+{proposition.reputationPenalty} {t('Bad Reputation')}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* DECISION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isResolving}
                onClick={() => handleDecision(false)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t('Refuse Proposition (Play With Honor)')}</span>
              </button>

              <button
                type="button"
                disabled={isResolving}
                onClick={() => handleDecision(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer transition shadow-lg shadow-rose-900/50 flex items-center justify-center gap-2 hover:scale-102"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>{t('Accept Deal (€{reward})', { reward: proposition.cashReward.toLocaleString() })}</span>
              </button>
            </div>
          </div>
        ) : (
          /* RESOLUTION SCREEN */
          <div className="space-y-4 animate-fadeIn">
            <div
              className={`p-5 rounded-2xl border space-y-3 ${
                resolutionOutcome.sanctioned
                  ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-950/80 text-rose-100'
                  : resolutionOutcome.cashReward > 0
                  ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-950/80 text-emerald-100'
                  : 'bg-slate-900/80 border-slate-700 text-slate-200'
              }`}
            >
              <div className="text-lg font-black tracking-tight">
                {t(resolutionOutcome.headline)}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">
                {t(resolutionOutcome.narrative)}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer transition"
              >
                {t('Continue Career')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
