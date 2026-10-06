import React from 'react';
import { PlayerCardData } from '../types';
import { Sparkles, Crown, Zap, AlertCircle, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface IconicPlayerEventModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onAcceptBreakthrough: () => void;
  onDismiss: () => void;
}

export const IconicPlayerEventModal: React.FC<IconicPlayerEventModalProps> = ({
  isOpen,
  player,
  onAcceptBreakthrough,
  onDismiss,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const currentPoints = player.freeStatPoints ?? player.unassignedPoints ?? 0;
  const hasEnoughPoints = currentPoints >= 10;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#181a2e] to-[#0f101c] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(251,191,36,0.35)] relative overflow-hidden text-left text-white space-y-6">
        {/* Glow ambient effects */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{t('SPECIAL_ENDGAME_MILESTONE') || 'SPECIAL ENDGAME MILESTONE'}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 font-mono text-xs font-bold">
            99 {t('POTENTIAL') || 'POTENTIAL'}
          </span>
        </div>

        {hasEnoughPoints ? (
          /* ========================================================================= */
          /* STATE A: HAS 10+ STAT POINTS -> ICONIC PLAYER BREAKTHROUGH */
          /* ========================================================================= */
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
                {t('ICONIC_PLAYER') || 'ICONIC PLAYER'}
              </h2>
              <p className="text-base text-amber-200 font-medium italic">
                &ldquo;{t('TAPPED_UNKNOWN_POTENTIAL') || "You've tapped into unknown potential."}&rdquo;
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('ICONIC_BREAKTHROUGH_DESC') ||
                'You have achieved the maximum natural development ceiling of 99 Potential. You now have a rare, one-time opportunity to transcend this limit with an iconic breakthrough.'}
            </p>

            <div className="bg-[#121324] border border-amber-500/40 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-black text-amber-300 uppercase">
                <span>{t('BREAKTHROUGH_COST') || 'Breakthrough Cost'}</span>
                <span className="font-mono text-emerald-400">{t('AVAILABLE') || 'Available'}: {currentPoints} PTS</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-300">{t('STAT_POINT_INVESTMENT') || 'Stat Point Investment'}</span>
                <span className="font-mono font-bold text-amber-400">-10 {t('STAT_POINTS') || 'Stat Points'}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-300">{t('INTERNAL_POTENTIAL_GAIN') || 'Internal Potential Gain'}</span>
                <span className="font-mono font-bold text-emerald-400">+1 {t('POTENTIAL_BREAKTHROUGH') || 'Potential Breakthrough'}</span>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                * {t('ICONIC_NOTE') || 'Note: Displayed Potential is strictly capped at 99, but the internal Iconic Breakthrough flag is permanently unlocked for your career.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={onAcceptBreakthrough}
                className="flex-1 min-h-[48px] bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md border border-slate-200 cursor-pointer active:scale-98 transition-all"
              >
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>{t('SPEND_10_PTS_ACTIVATE') || 'SPEND 10 PTS (ACTIVATE)'}</span>
              </button>
              <button
                onClick={onDismiss}
                className="min-h-[48px] px-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs uppercase rounded-xl border border-slate-800 cursor-pointer transition-all"
              >
                {t('PASS_KEEP_POINTS') || 'Pass (Keep Points)'}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* STATE B: UNDER 10 STAT POINTS -> I WASN'T READY FOR THIS */
          /* ========================================================================= */
          <div className="space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-200 tracking-tight flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-400 shrink-0" />
                {t('NOT_READY_FOR_THIS') || "I WASN'T READY FOR THIS"}
              </h2>
              <p className="text-base text-orange-300 font-medium italic">
                &ldquo;{t('NOT_READY_SUBTITLE') || "You weren't ready for this."}&rdquo;
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('NOT_ENOUGH_POINTS_DESC') ||
                'You reached 99 Potential, but you do not currently hold the 10 unspent Stat Points needed to activate the Iconic Player breakthrough.'}
            </p>

            <div className="bg-[#121324] border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{t('AVAILABLE_STAT_POINTS') || 'Available Stat Points:'}</span>
                <span className="font-mono font-black text-rose-400">{currentPoints} / 10 {t('REQUIRED') || 'Required'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                {t('POTENTIAL_REMAINS_99') || 'Your potential remains firmly established at 99 Potential. No points or attributes are lost.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onDismiss}
                className="w-full min-h-[48px] bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md border border-slate-200 cursor-pointer active:scale-98 transition-all"
              >
                <span>{t('CONTINUE_CAREER_99') || 'CONTINUE CAREER (REMAIN AT 99 POTENTIAL)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="text-[10px] text-slate-500 text-center font-medium">
          * {t('MILESTONE_ONCE_PER_CAREER') || 'This milestone event occurs only once per career run.'}
        </div>
      </div>
    </div>
  );
};
