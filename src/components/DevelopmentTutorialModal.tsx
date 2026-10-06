import React from 'react';
import { Award, Zap, Sparkles, CheckCircle2, X, GraduationCap, BarChart2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DevelopmentTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevelopmentTutorialModal: React.FC<DevelopmentTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const tiers = [
    { range: '0–20', rate: '+5.0', desc: t('DEV_TUTORIAL_TIER_1') || '0–20: +5 Levels per point (1 pt gives 5 levels)', highlight: 'emerald' },
    { range: '20–30', rate: '+3.0', desc: t('DEV_TUTORIAL_TIER_2') || '20–30: +3 Levels per point', highlight: 'emerald' },
    { range: '30–40', rate: '+2.0', desc: t('DEV_TUTORIAL_TIER_3') || '30–40: +2 Levels per point', highlight: 'emerald' },
    { range: '40–50', rate: '+1.5', desc: t('DEV_TUTORIAL_TIER_4') || '40–50: +1.5 Levels per point', highlight: 'cyan' },
    { range: '50–60', rate: '+1.25', desc: t('DEV_TUTORIAL_TIER_5') || '50–60: +1.25 Levels per point', highlight: 'cyan' },
    { range: '60–70', rate: '+1.0', desc: t('DEV_TUTORIAL_TIER_6') || '60–70: +1 Level per point', highlight: 'blue' },
    { range: '70–80', rate: '+0.5', desc: t('DEV_TUTORIAL_TIER_7') || '70–80: 0.5 Levels per point (2 points needed per level)', highlight: 'amber' },
    { range: '80–85', rate: '+0.25', desc: t('DEV_TUTORIAL_TIER_8') || '80–85: 0.25 Levels per point (4 points needed per level)', highlight: 'amber' },
    { range: '85–90', rate: '+0.15', desc: t('DEV_TUTORIAL_TIER_9') || '85–90: 0.15 Levels per point (~7 points per level)', highlight: 'orange' },
    { range: '90–95', rate: '+0.10', desc: t('DEV_TUTORIAL_TIER_10') || '90–95: 0.1 Levels per point (10 points needed per level)', highlight: 'rose' },
    { range: '95–99', rate: '+0.05', desc: t('DEV_TUTORIAL_TIER_11') || '95–99: 0.05 Levels per point (20 points needed per level)', highlight: 'rose' },
  ];

  return (
    <div
      id="dev-tutorial-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="dev-tutorial-modal-content"
        className="relative w-full max-w-2xl bg-slate-950 border-2 border-amber-400/90 pixel-corners pixel-bevel-gold shadow-[0_0_35px_rgba(251,191,36,0.35)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* RETRO SCANLINE & HEADER OVERLAY */}
        <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-indigo-950/70 p-4 sm:p-5 border-b-2 border-amber-400/50 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 pixel-corners bg-amber-400 text-slate-950 flex items-center justify-center pixel-bevel-raised shadow-md shrink-0">
              <GraduationCap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 pixel-corners bg-amber-400/20 text-amber-300 font-pixel text-[10px] font-black border border-amber-400/50 uppercase tracking-widest">
                  Tutorial
                </span>
                <span className="text-emerald-400 font-pixel text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> System Guide
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-arcade font-black text-white tracking-wide uppercase mt-0.5">
                {t('DEV_TUTORIAL_TITLE') || 'Attribute Development & Training Levels'}
              </h2>
              <p className="text-[11px] text-amber-200/80 font-retro">
                {t('DEV_TUTORIAL_SUBTITLE') || 'Tiered growth curves, progress bars & the 100 Stat Break'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 font-pixel text-slate-200 text-xs">
          {/* INTRO CALLOUT */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 pixel-corners pixel-bevel-sunken leading-relaxed font-retro text-slate-300 text-xs sm:text-sm">
            {t('DEV_TUTORIAL_INTRO') ||
              "Each stat point invested now adds to your attribute's Training Level. Early attributes surge quickly, while elite levels require focused dedication."}
          </div>

          {/* PROGRESS BARS FEATURE CARD */}
          <div className="p-3 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/40 pixel-corners flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-300 pixel-corners shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-arcade font-bold text-cyan-300 uppercase text-xs">
                {t('DEV_TUTORIAL_PROGRESS_BAR_TITLE') || 'Under-Stat Training Bar'}
              </h3>
              <p className="text-[11px] text-slate-300 font-retro mt-0.5">
                {t('DEV_TUTORIAL_PROGRESS_BAR_DESC') ||
                  'Each stat features a dedicated progress bar displaying the exact points invested and remaining to advance to the next level.'}
              </p>
            </div>
          </div>

          {/* TIERS BREAKDOWN TABLE */}
          <div className="space-y-2">
            <h3 className="font-arcade font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('DEV_TUTORIAL_TIER_TITLE') || 'Training Efficiency Tiers'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tiers.map((tItem) => (
                <div
                  key={tItem.range}
                  className="bg-slate-900/80 border border-slate-800 p-2.5 pixel-corners flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-white font-mono text-xs">{tItem.range}</span>
                    <p className="text-[10px] text-slate-400 font-retro leading-tight">{tItem.desc}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-black font-mono shrink-0 ${
                      tItem.highlight === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : tItem.highlight === 'cyan'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : tItem.highlight === 'blue'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : tItem.highlight === 'amber'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : tItem.highlight === 'orange'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {tItem.rate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* STAT BREAK FEATURE HIGHLIGHT */}
          <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-slate-900 border-2 border-amber-400/80 pixel-corners pixel-bevel-gold shadow-[0_0_15px_rgba(251,191,36,0.25)] flex items-start gap-3">
            <div className="p-2 bg-amber-400 text-slate-950 pixel-corners shrink-0 font-black">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-arcade font-black text-amber-300 uppercase tracking-wide text-xs flex items-center gap-1.5">
                <span>{t('DEV_TUTORIAL_STAT_BREAK_TITLE') || '⭐ Stat Break via Development'}</span>
              </h3>
              <p className="text-[11px] text-amber-100/90 font-retro leading-relaxed">
                {t('DEV_TUTORIAL_STAT_BREAK_DESC') ||
                  'At 99, invest exactly 100 stat points to break through to 100 and achieve permanent Stat Break Immortality!'}
              </p>
            </div>
          </div>

          {/* TRAINING PROGRESSION & ARCHETYPE BONUSES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border border-emerald-500/40 pixel-corners">
              <h4 className="font-arcade font-bold text-emerald-400 uppercase text-xs flex items-center gap-1.5">
                <span>🏋️ 100% Training Bar</span>
              </h4>
              <p className="text-[11px] text-slate-300 font-retro mt-1 leading-relaxed">
                {t('DEV_TUTORIAL_TRAINING_REWARD_DESC') ||
                  'Hitting 100% on your training bar allocates +1 stat point of tiered progression into every attribute!'}
              </p>
            </div>

            <div className="p-3 bg-gradient-to-r from-rose-950/50 via-slate-900 to-pink-950/40 border border-rose-500/40 pixel-corners">
              <h4 className="font-arcade font-bold text-rose-300 uppercase text-xs flex items-center gap-1.5">
                <span>⚠️ Archetype Modifiers</span>
              </h4>
              <p className="text-[11px] text-slate-300 font-retro mt-1 leading-relaxed">
                {t('DEV_TUTORIAL_ARCHETYPE_BONUS_DESC') ||
                  'Main strengths receive +2/yr and secondaries +1/yr. Archetype weakness attributes require +10% more points to advance.'}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTION */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t-2 border-slate-800 flex justify-end shrink-0">
          <button
            id="dev-tutorial-confirm-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-arcade font-black uppercase text-xs pixel-corners pixel-bevel-gold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>{t('DEV_TUTORIAL_GOT_IT') || "Got It, Let's Train!"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
