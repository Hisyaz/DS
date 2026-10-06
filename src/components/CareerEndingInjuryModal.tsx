import React from 'react';
import { PlayerCardData } from '../types';
import { handleCareerEndingChoice } from '../utils/staminaInjurySystem';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, AlertTriangle, Activity, Heart } from 'lucide-react';

interface CareerEndingInjuryModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  showToast: (msg: string) => void;
}

export const CareerEndingInjuryModal: React.FC<CareerEndingInjuryModalProps> = ({
  isOpen,
  player,
  onUpdatePlayer,
  showToast,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !player.isCareerEndingRisk) return null;

  const currentPotential = player.potentialOvr || (player.ovr ? player.ovr + 10 : 80);
  const reducedPotential = Math.max(30, currentPotential - 10);
  const injuryWeeks = player.injuryWeeksRemaining || 52;

  const handleRetire = () => {
    const res = handleCareerEndingChoice(player, 'retire');
    onUpdatePlayer(res.updatedPlayer);
    showToast(t(res.message));
  };

  const handleFocusOnRecovery = () => {
    const res = handleCareerEndingChoice(player, 'recover');
    onUpdatePlayer(res.updatedPlayer);
    showToast(t(res.message));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border-2 border-rose-600/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-white my-auto max-h-[92vh] flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header (Fixed) */}
        <div className="flex items-center gap-3 border-b border-rose-900/60 pb-3.5 shrink-0">
          <div className="p-2.5 bg-rose-950 text-rose-400 border border-rose-600/60 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded bg-rose-600/30 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/40">
              {t('CRITICAL MEDICAL DIAGNOSIS')}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
              {t('Potentially Career-Ending Injury')}
            </h2>
            <p className="text-xs text-rose-300 font-medium">
              {t(player.injuryName || 'Catastrophic Joint Reconstruction')} ({t('{weeks} Weeks Out', { weeks: injuryWeeks })})
            </p>
          </div>
        </div>

        {/* Scrollable Body & Choices */}
        <div className="overflow-y-auto flex-1 pr-1 py-3 space-y-3.5 custom-scrollbar">
          {/* Diagnosis Body */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs leading-relaxed text-slate-300">
            <p>
              {t('Specialists have concluded their examination of {name}.', { name: player.name })}{' '}
              {t('The severity of this injury ({injury}) threatens your ability to continue competing at the highest level.', { injury: t(player.injuryName || 'Severe Trauma') })}
            </p>
            <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-start gap-2 text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                {t('Continuing your career after this type of damage carries severe physical consequences and permanent loss of potential athletic peak.')}
              </span>
            </div>
          </div>

          {/* Decision Choices */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              {t('Choose Your Career Path:')}
            </h3>

            {/* CHOICE 1: FOCUS ON RECOVERY */}
            <button
              type="button"
              onClick={handleFocusOnRecovery}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-blue-900/80 to-indigo-900/80 hover:from-blue-800 hover:to-indigo-800 border border-blue-500/50 text-left transition-all cursor-pointer shadow-lg space-y-1 active:scale-95"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-blue-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  {t('FOCUS ON RECOVERY')}
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                  {t('Potential Penalty: -10 PTS')}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {t('Fight through surgery and grueling rehab. You will remain in the game, but your Potential OVR permanently drops from {current} to {reduced}.', { current: currentPotential, reduced: reducedPotential })}
              </p>
            </button>

            {/* CHOICE 2: RETIRE */}
            <button
              type="button"
              onClick={handleRetire}
              className="w-full p-3.5 rounded-xl bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 border border-rose-800/80 text-left transition-all cursor-pointer shadow-lg space-y-1 active:scale-95"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-rose-200 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  {t('ANNOUNCE RETIREMENT')}
                </span>
                <span className="text-[10px] font-bold text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded border border-rose-500/40">
                  {t('End Career')}
                </span>
              </div>
              <p className="text-[11px] text-rose-200/80 leading-snug">
                {t('Hang up your boots immediately to preserve your long-term health and conclude your football career.')}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
