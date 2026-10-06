import React from 'react';
import { SpecialClubEvaluation, SpecialClubId } from '../types/specialClubInterest';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Crown,
  Sparkles,
  Trophy,
  Coins,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Briefcase,
} from 'lucide-react';

interface SpecialClubRetryModalProps {
  isOpen: boolean;
  evaluation: SpecialClubEvaluation | null;
  player: PlayerCardData;
  onAcceptTerms: (evaluation: SpecialClubEvaluation) => void;
  onExplicitRejectBigThree: (clubId: SpecialClubId) => void;
  onRejectPsg: () => void;
  onClose: () => void;
}

export const SpecialClubRetryModal: React.FC<SpecialClubRetryModalProps> = ({
  isOpen,
  evaluation,
  player,
  onAcceptTerms,
  onExplicitRejectBigThree,
  onRejectPsg,
  onClose,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !evaluation) return null;

  const { config, salary, weeklyWage, signingBonus } = evaluation;
  const isBigThree = config.category === 'big_three';

  return (
    <div
      id="special-club-retry-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl text-white overflow-hidden animate-fadeIn"
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-6 shadow-2xl text-left">
        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.badgeBg} flex items-center justify-center text-3xl shadow-lg shrink-0 border border-white/20`}
          >
            {config.flag}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                {t('TRANSFER WINDOW FOLLOW-UP')}
              </span>
              {evaluation.decayYear && (
                <span className="text-[10px] text-slate-400 font-bold">
                  {t('YEAR {year}', { year: evaluation.decayYear })}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5 uppercase">
              {t('THEY’RE STILL INTERESTED')}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {t(
              '“{club} is still interested in signing you. Their sporting directors have reached out to your representative and they’re ready to negotiate again.”',
              { club: config.name }
            )}
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">{t('Salary Package')}</div>
              <div className="text-lg font-black text-amber-300 font-mono">
                €{(salary / 1000000).toFixed(1)}M/yr
              </div>
              <div className="text-[10px] text-slate-500 font-mono">€{Math.round(weeklyWage / 1000)}k/wk</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">{t('Signing Bonus')}</div>
              <div className="text-lg font-black text-emerald-400 font-mono">
                €{(signingBonus / 1000000).toFixed(1)}M
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">{t('Liquid cash')}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {config.managerName} ({config.formation}) • {t('Guaranteed Starter')}
            </span>
          </div>

          {isBigThree && (
            <div className="text-[11px] text-rose-300 flex items-start gap-1.5 p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                {t('Warning: Explicitly rejecting {club} will permanently banish them from future interest.', {
                  club: config.shortName,
                })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (isBigThree) {
                onExplicitRejectBigThree(config.id);
              } else {
                onRejectPsg();
              }
              onClose();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition cursor-pointer"
          >
            {t('Reject {club}', { club: config.shortName })}
          </button>

          <button
            type="button"
            onClick={() => {
              onAcceptTerms(evaluation);
              onClose();
            }}
            className="w-full sm:w-1/2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <span>{t('Accept Terms & Begin Transfer')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
