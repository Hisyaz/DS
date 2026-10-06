import React from 'react';
import { AcademySeasonApplicationResult } from '../types/youthFootballSchools';
import { Shield, Sparkles, Award, ArrowUpRight, Check, Building } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AcademyDevelopmentModalProps {
  report: AcademySeasonApplicationResult;
  onClose: () => void;
}

export const AcademyDevelopmentModal: React.FC<AcademyDevelopmentModalProps> = ({
  report,
  onClose,
}) => {
  const { t } = useLanguage();
  const { school, positionCategory, allocatedStats, totalPoints } = report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn text-left font-pixel select-none">
      <div className="bg-slate-900 border-2 border-emerald-500/80 pixel-corners pixel-bevel-emerald max-w-lg w-full overflow-hidden shadow-2xl space-y-0 text-white">
        {/* Header */}
        <div className="p-4 bg-emerald-950/50 border-b-2 border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 pixel-corners bg-emerald-500/20 border-2 border-emerald-400/40 pixel-bevel-raised text-emerald-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">{school.flag}</span>
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider pixel-text-shadow">
                  {t('Club Development Complete')}
                </h3>
              </div>
              <p className="text-[10px] text-emerald-300 font-retro">
                {school.name} ({t('Style #{num}', { num: `${school.styleNumber}` })}) • {t('Club Training System')}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 pixel-corners text-xs font-black bg-emerald-400 text-slate-950 border-2 border-emerald-200 pixel-bevel-emerald font-arcade shadow-md">
            +{totalPoints} {t('STAT PTS')}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="bg-slate-950 p-3 pixel-corners border-2 border-slate-800 pixel-bevel-sunken space-y-1.5">
            <div className="text-[11px] text-slate-300">
              <span className="text-slate-400 font-bold">{t('Philosophy Ethos')}: </span>
              <span className="italic text-emerald-200/90 font-retro">&ldquo;{t(school.corePhilosophy)}&rdquo;</span>
            </div>
            <p className="text-[10px] text-slate-400 font-retro leading-relaxed">
              {t('Your club drilled your positional foundations ({category}) into their tactical DNA. Development points are invested directly as stat points advancing your attribute progress towards level ups and stat breaks.', { category: t(positionCategory) })}
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('Attributes Enhanced (+{pts} Stat Points Total)', { pts: `${totalPoints}` })}
            </h4>
            <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {allocatedStats.map((stat) => {
                const pts = stat.statPointsInvested ?? stat.gain;
                const hasLevelUp = stat.gain > 0;
                const progPct = Math.round((stat.newProgress ?? 0) * 100);

                return (
                  <div
                    key={stat.key}
                    className="bg-slate-950 p-2.5 pixel-corners border border-slate-700 pixel-bevel-sunken flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[11px] font-bold text-slate-200 uppercase">{t(stat.label)}</div>
                      <div className="text-[10px] text-slate-400 font-arcade">
                        {hasLevelUp ? (
                          <>
                            {stat.oldVal} → <strong className="text-white">{stat.newVal}</strong> (+{stat.gain})
                          </>
                        ) : (
                          <>
                            Lvl <strong className="text-white">{stat.newVal}</strong> ({progPct}%)
                          </>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 pixel-corners text-[11px] font-arcade font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      +{pts} PTS
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t-2 border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black px-5 py-2.5 pixel-corners border-2 border-emerald-200 pixel-bevel-emerald shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 uppercase font-pixel"
          >
            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>{t('Continue Career')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

