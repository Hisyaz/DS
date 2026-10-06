import React from 'react';
import { PlayerCardData, PlayerPositionSlot } from '../types';
import { switchMainPosition } from '../utils/positionMasterySystem';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Check, X, Compass, ArrowRightLeft } from 'lucide-react';

interface NaturalPositionSwitchModalProps {
  player: PlayerCardData;
  eligibleSlot: PlayerPositionSlot;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSwitch: (updatedPlayer: PlayerCardData) => void;
}

export const NaturalPositionSwitchModal: React.FC<NaturalPositionSwitchModalProps> = ({
  player,
  eligibleSlot,
  isOpen,
  onClose,
  onConfirmSwitch,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const currentMainSub = player.subPosition || player.position || 'ST';
  const currentMainPlayStyle = (player as any).playStyle || 'Balanced';

  const handleConfirm = () => {
    const updated = switchMainPosition(player, eligibleSlot.id);
    onConfirmSwitch(updated);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-5 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Compass className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase bg-black/30 px-2 py-0.5 rounded-full border border-white/20 text-emerald-200">
                {t('SEASON_MILESTONE') || 'Season Milestone • Tactical Natural'}
              </span>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                {t('FEEL_NATURAL_EVENT') || 'You feel a natural at a new position!'}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-slate-200 text-sm">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center space-y-2">
            <p className="text-base text-slate-100 font-semibold leading-relaxed">
              "You feel a natural at{' '}
              <span className="text-emerald-400 font-extrabold">
                {eligibleSlot.position}: {eligibleSlot.subPosition} ({eligibleSlot.playStyle})
              </span>
              ! Having played over 80% of your fixtures this season with Tier IV mastery, do you want to make it your new official Main Position?"
            </p>
          </div>

          {/* Transformation preview card */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
              <span>{t('CURRENT_MAIN') || 'Current Main'}</span>
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">{t('NEW_MAIN_PROPOSED') || 'New Main'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div className="text-xs text-slate-400">Current Main (Tier V)</div>
                <div className="text-base font-black text-white">{currentMainSub}</div>
                <div className="text-[11px] text-slate-400">{currentMainPlayStyle}</div>
                <div className="text-[10px] text-amber-400 mt-1 font-bold">
                  → Will become Secondary (Tier IV)
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-lg p-3">
                <div className="text-xs text-emerald-400 font-bold">New Main (Tier V)</div>
                <div className="text-base font-black text-white">{eligibleSlot.subPosition}</div>
                <div className="text-[11px] text-slate-300">{eligibleSlot.playStyle}</div>
                <div className="text-[10px] text-emerald-400 mt-1 font-bold">
                  ★ 100% Native Proficiency
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            {t('MAIN_POSITION_NOTE') ||
              'If you choose NO, your current main position remains unchanged, and this position remains a secondary Tier IV position.'}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            {t('NO_KEEP_MAIN') || 'No, Keep Current Main'}
          </button>

          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4" />
            {t('YES_MAKE_MAIN') || 'Yes, Make it Main Position!'}
          </button>
        </div>
      </div>
    </div>
  );
};
