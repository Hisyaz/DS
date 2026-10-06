import React from 'react';
import {
  Trophy,
  Award,
  Star,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Scroll,
  Activity,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { PlayerConfig } from '../types';
import { compileYouthCareerSummary, YouthCareerSummary } from '../utils/age16TransferSystem';
import { t } from '../utils/localizationSystem';

interface YouthAcademyFarewellModalProps {
  player: PlayerConfig;
  isOpen: boolean;
  onProceedToOffers: () => void;
  onClose?: () => void;
}

export const YouthAcademyFarewellModal: React.FC<YouthAcademyFarewellModalProps> = ({
  player,
  isOpen,
  onProceedToOffers,
  onClose,
}) => {
  if (!isOpen) return null;

  const summary: YouthCareerSummary = compileYouthCareerSummary(player);

  return (
    <div
      id="youth-academy-farewell-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-pixel select-none"
    >
      <div
        id="youth-academy-farewell-modal"
        className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500 pixel-corners pixel-bevel-gold shadow-2xl shadow-amber-500/10 overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Ribbon */}
        <div className="bg-amber-400 px-5 py-4 text-slate-950 flex items-center justify-between border-b-2 border-amber-500/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-950/20 pixel-corners border-2 border-slate-950/30 pixel-bevel-raised">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="text-[9px] font-black tracking-widest uppercase text-slate-950/80 font-arcade">
                {t('YOUTH_GRADUATION_OFFICIAL_MILESTONE')}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 pixel-text-shadow">
                {t('YOUTH_GRADUATION_TITLE')}
              </h2>
            </div>
          </div>
          <div className="px-3 py-1 bg-slate-950 text-amber-400 text-xs font-black pixel-corners uppercase tracking-wider font-arcade border border-amber-500/30">
            {t('YOUTH_GRADUATION_AGE17_TAG')}
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Academy Overview Banner */}
          <div className="bg-slate-950 border-2 border-slate-700 pixel-corners pixel-bevel-sunken p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 pixel-corners bg-amber-400 border-2 border-amber-200 pixel-bevel-gold flex items-center justify-center text-slate-950 font-black text-lg shadow-lg font-arcade">
                {summary.graduatingAge || 17}
              </div>
              <div>
                <div className="text-[10px] text-amber-400 font-bold tracking-wide uppercase font-pixel">
                  {t('YOUTH_GRADUATION_ACADEMY_PRODIGY')}
                </div>
                <div className="text-lg font-black text-white pixel-text-shadow">{summary.playerName}</div>
                <div className="text-xs text-slate-400 font-retro">
                  {summary.academyName} • Ages {summary.startAge} ➔ {summary.graduatingAge}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="px-3 py-1.5 bg-amber-950/80 border border-amber-500/50 pixel-corners text-amber-300 text-[10px] font-bold text-center uppercase font-arcade">
                {t('YOUTH_GRADUATION_CHAPTER_COMPLETE')}
              </div>
              <div className="text-[11px] font-semibold text-emerald-400 font-retro">
                {t('YOUTH_GRADUATION_FINAL_STATUS')}: <span className="text-white font-bold font-arcade">{summary.finalYouthStatus}</span>
              </div>
            </div>
          </div>

          {/* Youth Career Stats Breakdown */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300">
                {t('YOUTH_GRADUATION_STATS_TITLE')}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-retro">{t('YOUTH_GRADUATION_MATCHES')}</div>
                <div className="text-xl font-black text-white mt-0.5 font-arcade">{summary.totalMatches}</div>
              </div>
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-retro">{t('YOUTH_GRADUATION_GOALS')}</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5 font-arcade">{summary.totalGoals}</div>
              </div>
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-retro">{t('YOUTH_GRADUATION_ASSISTS')}</div>
                <div className="text-xl font-black text-cyan-400 mt-0.5 font-arcade">{summary.totalAssists}</div>
              </div>
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-retro">{t('YOUTH_GRADUATION_MVPS')}</div>
                <div className="text-xl font-black text-amber-400 mt-0.5 font-arcade">{summary.totalMvps}</div>
              </div>
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 text-center col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-retro">{t('YOUTH_GRADUATION_AVG_RATING')}</div>
                <div className="text-xl font-black text-purple-300 mt-0.5 font-arcade">{summary.avgRating}</div>
              </div>
            </div>
          </div>

          {/* Development & Athletic Growth Progression */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300">
                {t('YOUTH_GRADUATION_DEV_TITLE')}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-retro">{t('YOUTH_GRADUATION_START_OVR')}</div>
                <div className="text-xl font-black text-slate-300 mt-0.5 font-arcade">{summary.startOvr}</div>
              </div>
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-retro">{t('YOUTH_GRADUATION_FINAL_OVR')}</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5 font-arcade">{summary.finalOvr}</div>
              </div>
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-retro">{t('YOUTH_GRADUATION_OVR_GAIN')}</div>
                <div className="text-xl font-black text-amber-400 mt-0.5 font-arcade">+{summary.ovrGrowth}</div>
              </div>
              <div className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase font-retro">{t('YOUTH_GRADUATION_FAME_GAINED')}</div>
                <div className="text-xl font-black text-cyan-400 mt-0.5 font-arcade">+{summary.fameGained}</div>
              </div>
            </div>
          </div>

          {/* Trophies & Honors */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300">
                {t('YOUTH_GRADUATION_HONORS_TITLE')}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {summary.trophies.map((trophy) => (
                <div
                  key={trophy.id}
                  className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-3 flex items-start space-x-3"
                >
                  <div className="p-2 pixel-corners bg-amber-500/20 border border-amber-400/40 text-amber-400 mt-0.5 pixel-bevel-raised">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase font-arcade">{trophy.category}</div>
                    <div className="text-xs font-bold text-white">{trophy.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-retro">{trophy.description}</div>
                  </div>
                </div>
              ))}
              {summary.awards.map((award) => (
                <div
                  key={award.id}
                  className="bg-slate-950 border border-slate-700 pixel-corners pixel-bevel-sunken p-3 flex items-start space-x-3"
                >
                  <div className="p-2 pixel-corners bg-blue-500/20 border border-blue-400/40 text-blue-400 mt-0.5 pixel-bevel-raised">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-400 font-bold uppercase font-arcade">{t('YOUTH_GRADUATION_INDIVIDUAL_AWARD')}</div>
                    <div className="text-xs font-bold text-white">{award.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-retro">{award.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farewell Letter from Academy Director */}
          <div className="bg-slate-950 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-4 relative overflow-hidden">
            <div className="flex items-center space-x-2 text-amber-400 mb-1.5">
              <Scroll className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-arcade">
                {t('YOUTH_GRADUATION_LETTER_TITLE')}
              </span>
            </div>
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed italic font-retro">
              "{summary.directorFarewellLetter}"
            </p>
          </div>

          {/* Next Phase Notice */}
          <div className="p-3 pixel-corners bg-amber-950/50 border border-amber-500/40 flex items-center space-x-3 text-amber-300 text-xs">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <div className="font-retro">
              <span className="font-bold text-amber-200">{t('YOUTH_GRADUATION_NEXT_STAGE')}:</span>{' '}
              {t('YOUTH_GRADUATION_NEXT_STAGE_DESC')}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t-2 border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-retro">
            Player: <span className="text-slate-200 font-semibold">{player.name}</span> | OVR: <span className="text-amber-400 font-semibold font-arcade">{player.ovr}</span> | Fame: <span className="text-amber-400 font-semibold font-arcade">{player.fame || 0}</span>
          </div>
          <button
            id="proceed-to-pro-career-btn"
            onClick={onProceedToOffers}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs pixel-corners border-2 border-amber-200 pixel-bevel-gold flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer uppercase font-pixel"
          >
            <span>{t('YOUTH_GRADUATION_PROCEED_BTN')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
