import React, { useState, useEffect } from 'react';
import { PlayerConfig } from '../types';
import {
  HeartPulse,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FitToPlayModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  onAcknowledge: () => void;
}

export const FitToPlayModal: React.FC<FitToPlayModalProps> = ({
  isOpen,
  player,
  onAcknowledge,
}) => {
  const { t } = useLanguage();
  const [hasDismissed, setHasDismissed] = useState(false);
  const recoverySessionKey = `${player.id || 'p'}_${(player as any).lastInjuryTimestamp || 'noinj'}_${player.currentSeason || 1}_${player.careerStage || 'youth'}`;
  const [lastDismissedKey, setLastDismissedKey] = useState<string | null>(null);

  // Reset local dismissal state ONLY when a truly new recovery session key occurs
  useEffect(() => {
    if (isOpen && lastDismissedKey !== recoverySessionKey) {
      setHasDismissed(false);
    }
  }, [isOpen, recoverySessionKey, lastDismissedKey]);

  if (!isOpen || hasDismissed || lastDismissedKey === recoverySessionKey) return null;

  const handleDismiss = () => {
    setHasDismissed(true);
    setLastDismissedKey(recoverySessionKey);
    onAcknowledge();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/80 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] p-4 sm:p-6 text-white my-auto max-h-[92vh] flex flex-col text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="border-b border-slate-800 pb-3.5 shrink-0 relative z-10 space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950/60 animate-bounce">
            <HeartPulse className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {t('MEDICAL CLEARANCE • STATUS: HEALTHY')}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {t("You're Fit to Play Again!")}
          </h2>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-3.5 custom-scrollbar relative z-10 text-left">
          {/* Medical Report Card */}
          <div className="bg-slate-950/90 border border-emerald-500/40 p-3.5 sm:p-4 rounded-xl space-y-3 relative shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-400/90 uppercase tracking-widest block">
                  {t('Official Status')}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  {t('Fully Recovered')}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {t('HEALTHY')}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                {t('Rehabilitation is 100% complete! Medical staff have declared {name} fully fit and cleared for match participation.', {
                  name: player.name,
                })}
              </p>
            </div>

            {/* Post-Injury Rehab Shield - 80% Reduced Injury Risk */}
            <div className="bg-emerald-950/40 border border-emerald-500/60 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-black text-xs">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  {t('Post-Injury Rehab Shield Active')}
                </span>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/40">
                  {t('-80% INJURY RISK (1 MONTH)')}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                {t('To guarantee a safe return to competition, your probability of suffering an injury is reduced by 80% for the following month.')}
              </p>
            </div>

            {/* Fitness Starts at 50% Warning */}
            <div className="bg-amber-950/40 border border-amber-500/50 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-black text-xs">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {t('Fitness Bar Reset to 50%')}
                </span>
                <span className="text-amber-400 font-extrabold">{t('50% FITNESS')}</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                {t('Upon recovery, your fitness bar starts at 50%. While you are cleared to play, returning directly to 90-minute high-intensity matches carries fatigue. Build up your condition with rest or recovery items!')}
              </p>
            </div>
          </div>
        </div>

        {/* STICKY FOOTER ACTION BUTTON */}
        <div className="pt-3 mt-1 border-t border-slate-800 bg-slate-900 shrink-0 relative z-10">
          <button
            onClick={handleDismiss}
            className="w-full py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{t('RETURN TO SQUAD & START MATCHES')} →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
