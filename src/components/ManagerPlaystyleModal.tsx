import React, { useState, useMemo } from 'react';
import { ProContractOffer } from '../types/streetCards';
import { PlayerConfig } from '../types';
import { getPlayStyleDetail } from '../utils/statCalculations';
import { getValidPlayStylesForSubPosition } from '../utils/playerIdentitySystem';
import { t } from '../utils/localizationSystem';
import { UserCheck, Target, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface ManagerPlaystyleModalProps {
  isOpen: boolean;
  offer: ProContractOffer | null;
  player: PlayerConfig;
  onConfirmPlaystyle: (chosenPlaystyle: string, acceptedManagerStyle: boolean) => void;
}

export const ManagerPlaystyleModal: React.FC<ManagerPlaystyleModalProps> = ({
  isOpen,
  offer,
  player,
  onConfirmPlaystyle,
}) => {
  if (!isOpen || !offer) return null;

  const managerStyle = offer.expectedPlaystyle || 'Complete Forward';
  const subPos = offer.expectedSubPosition || player.subPosition || player.position || 'ST';

  // Valid tactical playstyles for this sub-position (strictly excluding Basic)
  const validTacticalStyles = useMemo(() => {
    return getValidPlayStylesForSubPosition(subPos).filter(
      (s) => s.toLowerCase() !== 'basic'
    );
  }, [subPos]);

  const alternateStyles = useMemo(() => {
    return validTacticalStyles.filter((s) => s.toLowerCase() !== managerStyle.toLowerCase());
  }, [validTacticalStyles, managerStyle]);

  const [selectedChoice, setSelectedChoice] = useState<'accept' | 'custom'>('accept');
  const [customStyle, setCustomStyle] = useState<string>(() => {
    if (player.playStyle && player.playStyle.toLowerCase() !== 'basic' && player.playStyle.toLowerCase() !== managerStyle.toLowerCase() && validTacticalStyles.includes(player.playStyle)) {
      return player.playStyle;
    }
    return alternateStyles[0] || validTacticalStyles[0] || 'Balanced';
  });

  const handleConfirm = () => {
    if (selectedChoice === 'accept') {
      onConfirmPlaystyle(managerStyle, true);
    } else {
      onConfirmPlaystyle(customStyle, false);
    }
  };

  const managerStyleDetail = getPlayStyleDetail(subPos, managerStyle);
  const chosenCustomDetail = getPlayStyleDetail(subPos, customStyle);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-300">
      <div className="bg-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl shadow-amber-500/10 space-y-4 sm:space-y-6 my-auto text-left relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-25 bg-amber-500" />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 shrink-0">
          <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-2xl text-amber-300">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" /> {t('MGR_PLAYSTYLE_HEADER', { clubName: offer.clubName }) || `FIRST PRO MANAGER MEETING • ${offer.clubName}`}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {t('MGR_PLAYSTYLE_REQ_TITLE', { managerName: offer.managerName }) || `Manager ${offer.managerName}'s Playstyle Request`}
            </h2>
            <p className="text-xs text-slate-300">
              {t('MGR_PLAYSTYLE_SYSTEM_ROLE', {
                formation: offer.managerFormation || '4-3-3',
                tacticalStyle: offer.managerTacticalStyle,
                subPos,
              }) || `System: ${offer.managerFormation || '4-3-3'} (${offer.managerTacticalStyle}) • Role: ${subPos}`}
            </p>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
          {/* Manager Pitch */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2">
            <p className="text-xs text-slate-200 italic leading-relaxed">
              {t('MGR_PLAYSTYLE_PITCH', {
                name: player.name || 'Son',
                style: managerStyle,
                subPos,
              }) || `"${player.name || 'Son'}, in our professional setup I need you to adopt the ${managerStyle} playstyle. It is central to our tactical setup for your ${subPos} role."`}
            </p>
            {managerStyleDetail && (
              <p className="text-[11px] text-slate-400">
                {managerStyleDetail.description}
                {managerStyleDetail.modernExample && (
                  <span className="block text-slate-500 mt-0.5">
                    {t('MGR_PLAYSTYLE_EXAMPLE', { example: managerStyleDetail.modernExample }) || `Example: ${managerStyleDetail.modernExample}`}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Choice Cards */}
          <div className="space-y-3">
            {/* OPTION 1: ACCEPT MANAGER PLAYSTYLE */}
            <div
              onClick={() => setSelectedChoice('accept')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 bg-slate-900 ${
                selectedChoice === 'accept'
                  ? 'border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <CheckCircle2
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  selectedChoice === 'accept' ? 'text-emerald-400' : 'text-slate-600'
                }`}
              />
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white">
                  {t('MGR_PLAYSTYLE_OPT1_TITLE', { style: managerStyle })}
                </h3>
                <p className="text-xs text-slate-300">
                  {t('MGR_PLAYSTYLE_OPT1_DESC', { managerName: offer.managerName })}
                </p>
              </div>
            </div>

            {/* OPTION 2: REBUT & CHOOSE ANOTHER PLAYSTYLE */}
            <div
              onClick={() => setSelectedChoice('custom')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 bg-slate-900 ${
                selectedChoice === 'custom'
                  ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <ShieldAlert
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  selectedChoice === 'custom' ? 'text-amber-400' : 'text-slate-600'
                }`}
              />
              <div className="space-y-2 w-full">
                <h3 className="text-sm font-black text-white">
                  {t('MGR_PLAYSTYLE_OPT2_TITLE')}
                </h3>
                <p className="text-xs text-slate-300">
                  {t('MGR_PLAYSTYLE_OPT2_DESC', { subPos })}
                </p>

                {selectedChoice === 'custom' && (
                  <div className="pt-2 space-y-2.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t('CHOOSE_PLAYSTYLE_FOR_POS', { subPos }) || `Choose Valid Playstyle for ${subPos}:`}
                    </label>
                    <select
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400 outline-none"
                    >
                      {alternateStyles.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    {chosenCustomDetail && (
                      <p className="text-[11px] text-indigo-300">
                        {chosenCustomDetail.description}
                        {chosenCustomDetail.modernExample && (
                          <span className="block text-indigo-400/80 mt-0.5">
                            {t('MGR_PLAYSTYLE_EXAMPLE', { example: chosenCustomDetail.modernExample }) || `Example: ${chosenCustomDetail.modernExample}`}
                          </span>
                        )}
                      </p>
                    )}

                    <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{t('MGR_PLAYSTYLE_WARN_TITLE')}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-200/90">
                        {t('MGR_PLAYSTYLE_WARN_DESC')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0 pb-16 sm:pb-0">
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{t('MGR_PLAYSTYLE_CONFIRM_BTN')}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
