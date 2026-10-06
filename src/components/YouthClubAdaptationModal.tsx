import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, BatteryCharging, Users, CheckCircle2, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

interface YouthClubAdaptationModalProps {
  isOpen: boolean;
  season: 1 | 2;
  clubName: string;
  onConfirm: () => void;
}

export const YouthClubAdaptationModal: React.FC<YouthClubAdaptationModalProps> = ({
  isOpen,
  season,
  clubName,
  onConfirm,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const isSeason1 = season === 1;

  return (
    <div
      id="youth-adaptation-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-pixel select-none"
    >
      <div
        id="youth-adaptation-modal-card"
        className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400 pixel-corners pixel-bevel-gold shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in zoom-in-95 duration-200"
      >
        {/* TOP ACCENT HEADER */}
        <div
          id="youth-adaptation-modal-header"
          className={`px-5 py-4 flex items-center gap-3 border-b-2 border-amber-500/50 ${
            isSeason1
              ? 'bg-amber-700'
              : 'bg-emerald-700'
          }`}
        >
          <div className="w-10 h-10 pixel-corners bg-black/30 border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
            {isSeason1 ? (
              <BatteryCharging className="w-5 h-5 text-amber-200" />
            ) : (
              <Sparkles className="w-5 h-5 text-emerald-200" />
            )}
          </div>
          <div>
            <span className="text-[9px] font-bold tracking-wider uppercase text-white/80 font-arcade">
              {isSeason1
                ? t('YOUTH_ADAPTATION_EVENT_1_BADGE')
                : t('YOUTH_ADAPTATION_EVENT_2_BADGE')}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide leading-tight pixel-text-shadow">
              {isSeason1
                ? t('YOUTH_ADAPTATION_EVENT_1_TITLE')
                : t('YOUTH_ADAPTATION_EVENT_2_TITLE')}
            </h2>
          </div>
        </div>

        {/* MODAL BODY */}
        <div id="youth-adaptation-modal-body" className="p-4 sm:p-5 space-y-4">
          {/* CLUB BADGE & NARRATIVE */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-slate-800 border border-slate-700 text-amber-400 text-[10px] font-bold font-arcade">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{clubName}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-retro">
              {isSeason1
                ? t('YOUTH_ADAPTATION_EVENT_1_DESC', { club: clubName })
                : t('YOUTH_ADAPTATION_EVENT_2_DESC', { club: clubName })}
            </p>
          </div>

          {/* STAT PENALTY ADJUSTMENTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* STAMINA CARD */}
            <div
              id="adaptation-stamina-change-card"
              className="p-3 pixel-corners bg-slate-950 border border-slate-700 pixel-bevel-sunken flex flex-col justify-between space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 font-pixel">
                <span className="flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  {t('STAT_STAMINA')}
                </span>
                <span className="px-1.5 py-0.5 pixel-corners text-[9px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-arcade">
                  {isSeason1 ? '+10 STA' : t('STATUS_NORMAL')}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-400 line-through font-arcade">
                  {isSeason1 ? '-20' : '-10'}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span
                  className={`text-base font-black font-arcade ${
                    isSeason1 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {isSeason1 ? '-10' : '0 (No Penalty)'}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 font-retro">
                {isSeason1
                  ? t('YOUTH_ADAPTATION_EVENT_1_STAMINA_LABEL')
                  : t('YOUTH_ADAPTATION_EVENT_2_STAMINA_LABEL')}
              </p>
            </div>

            {/* CHEMISTRY CEILING CARD */}
            <div
              id="adaptation-chemistry-change-card"
              className="p-3 pixel-corners bg-slate-950 border border-slate-700 pixel-bevel-sunken flex flex-col justify-between space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 font-pixel">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  {t('CHEMISTRY')}
                </span>
                <span className="px-1.5 py-0.5 pixel-corners text-[9px] font-black bg-sky-950 text-sky-300 border border-sky-500/40 font-arcade">
                  {isSeason1 ? '+10% Cap' : t('STATUS_NORMAL')}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xs text-slate-400 line-through font-arcade">
                  {isSeason1 ? '80%' : '90%'}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span
                  className={`text-base font-black font-arcade ${
                    isSeason1 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {isSeason1 ? '90% Max' : '100% (No Cap)'}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 font-retro">
                {isSeason1
                  ? t('YOUTH_ADAPTATION_EVENT_1_CHEMISTRY_LABEL')
                  : t('YOUTH_ADAPTATION_EVENT_2_CHEMISTRY_LABEL')}
              </p>
            </div>
          </div>

          {/* STATUS FOOTER NOTICE */}
          <div className="p-2.5 pixel-corners bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2 font-retro">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {t('BIGGER_YOUTH_CLUB_ADAPTATION_NOTE')}
            </span>
          </div>

          {/* ACTION BUTTON */}
          <div className="pt-2">
            <button
              id="youth-adaptation-confirm-btn"
              onClick={onConfirm}
              className={`w-full py-3 px-5 pixel-corners font-black text-xs text-slate-950 transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 uppercase font-pixel ${
                isSeason1
                  ? 'bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 pixel-bevel-gold shadow-amber-500/20'
                  : 'bg-emerald-400 hover:bg-emerald-300 border-2 border-emerald-200 pixel-bevel-raised shadow-emerald-500/20'
              }`}
            >
              <span>{t('YOUTH_ADAPTATION_BTN_ACKNOWLEDGE')}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
