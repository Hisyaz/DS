import React from 'react';
import { Sparkles, Dumbbell, ArrowUpRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface GrowthSpurtModalProps {
  isOpen: boolean;
  growthCm: number;
  oldHeight: number;
  newHeight: number;
  oldWeight: number;
  newWeight: number;
  onClose: () => void;
}

export const GrowthSpurtModal: React.FC<GrowthSpurtModalProps> = ({
  isOpen,
  growthCm,
  oldHeight,
  newHeight,
  oldWeight,
  newWeight,
  onClose,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      <div className="bg-slate-950 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl shadow-amber-500/20 text-center relative overflow-hidden space-y-4 sm:space-y-6 max-h-[90vh] flex flex-col my-auto">
        {/* Animated Background Rays & Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30 bg-amber-400 animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-25 bg-emerald-500 animate-pulse" />

        {/* Milestone Header & Title */}
        <div className="space-y-3 shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/10">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            {t('SPECIAL_DEVELOPMENT_MILESTONE') || 'SPECIAL DEVELOPMENTAL MILESTONE'}
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight">
              {t('GROWTH_SPURT') || 'GROWTH SPURT'} ⚡
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed italic px-2 pt-1">
              &ldquo;{t('GROWTH_SPURT_FLAVOR') || 'You wake up feeling different. Your clothes feel tighter, your legs feel longer, and something about you has changed.'}&rdquo;
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4 text-left">
          {/* Highlight Card */}
          <div className="bg-gradient-to-b from-amber-500/15 to-slate-900/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3 text-center">
            <div className="text-xl sm:text-3xl font-black text-amber-300 flex items-center justify-center gap-2">
              <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 stroke-[3]" />
              <span>{t('GREW_PLUS_CM', { cm: growthCm }) || `You grew +${growthCm} CM this year!`}</span>
            </div>
            <p className="text-xs text-slate-300">
              {t('PHYSICAL_DEVELOPMENT_ACCELERATED') || 'Physical development accelerated dramatically. Your height and weight have surged simultaneously!'}
            </p>
          </div>

          {/* Stat Changes Breakdown */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-amber-400" /> {t('HEIGHT_PROGRESS') || 'Height Progress'}
              </div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span className="text-slate-400 line-through">{oldHeight} CM</span>
                <span className="text-emerald-400">→ {newHeight} CM</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-sky-400" /> {t('WEIGHT_PROGRESS') || 'Weight Progress'}
              </div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span className="text-slate-400 line-through">{oldWeight} KG</span>
                <span className="text-emerald-400">→ {newWeight} KG</span>
              </div>
            </div>
          </div>

          {/* Temporary Adjustment Penalty Banner */}
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 text-left space-y-1">
            <div className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase">
              <span>⚠️ {t('TEMP_BODY_ADJUSTMENT') || 'Temporary Body Adjustment (1 Month)'}</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              {t('GROWTH_PENALTY_NOTICE') ||
                'Due to your sudden change in height and body proportions, you will experience -10 Dribbling and -10 Ball Control during the following in-game month as your coordination adapts. After 1 month, your attributes will fully restore!'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 pb-16 sm:pb-0">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            {t('EMBRACE_NEW_HEIGHT') || 'Embrace Your New Height'}
          </button>
        </div>
      </div>
    </div>
  );
};
