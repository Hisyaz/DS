import React from 'react';
import { Skull, AlertTriangle, ShieldAlert, ArrowRight, Flame, Scale, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BadReputationTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadReputationTutorialModal: React.FC<BadReputationTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      id="bad-rep-tutorial-backdrop"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="bad-rep-tutorial-modal"
        className="relative w-full max-w-2xl bg-slate-950 border-4 border-rose-600 pixel-corners pixel-bevel-raised shadow-[0_0_50px_rgba(225,29,72,0.55)] p-5 sm:p-7 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/40 via-transparent to-black pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center gap-3.5 border-b-2 border-rose-700/60 pb-3 mb-4 shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-900 border-2 border-rose-500 pixel-corners flex items-center justify-center shrink-0 pixel-bevel-raised shadow-[0_0_15px_rgba(244,63,94,0.6)]">
            <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-rose-300 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-pixel px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-600 pixel-corners uppercase tracking-wider">
              {t('CAREER_TUTORIAL_BADGE') || 'TUTORIAL GUIDE'}
            </span>
            <h2 className="text-lg sm:text-2xl font-black font-arcade text-white tracking-wide mt-1 uppercase text-rose-100">
              {t('BAD_REP_TUTORIAL_TITLE') || 'BAD REPUTATION & CONDUCT SYSTEM'}
            </h2>
            <p className="text-xs sm:text-sm font-retro text-rose-300">
              {t('BAD_REP_TUTORIAL_SUBTITLE') || 'How Controversial Infamy Affects Your Football Career'}
            </p>
          </div>
        </div>

        {/* Scrollable Explanations Area */}
        <div className="relative z-10 overflow-y-auto space-y-4 pr-1 text-slate-200">
          {/* Main Narrative Explanation - Big Readable Text */}
          <div className="bg-slate-900/95 border-2 border-rose-900/80 p-4 sm:p-5 pixel-corners pixel-bevel-sunken space-y-2">
            <p className="text-sm sm:text-base md:text-lg font-retro text-rose-100 leading-relaxed font-bold">
              {t('BAD_REP_TUTORIAL_INTRO') ||
                'Bad reputation reflects your controversial off-pitch and on-pitch conduct. A straight red card immediately awards +10 Bad Fame. Reckless nightlife, training ground brawls, and media outbursts also fuel your infamy meter.'}
            </p>
          </div>

          {/* Section: 3 Infamy Tiers & Exact Modifiers */}
          <div className="space-y-3">
            <span className="text-xs sm:text-sm md:text-base font-arcade font-black text-rose-400 uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
              {t('BAD_REP_TUTORIAL_MODIFIERS_HEADER') || 'CONDUCT TIERS & PENALTIES:'}
            </span>

            {/* Tier 1: Bad Boy */}
            <div className="bg-black/75 border-2 border-rose-900/70 p-3.5 sm:p-4 pixel-corners space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-pixel px-2 py-0.5 bg-rose-950 border border-rose-600 text-rose-300 font-bold">
                  I
                </span>
                <span className="text-sm sm:text-base md:text-lg font-black font-arcade text-rose-300 uppercase">
                  {t('BAD_REP_TIER_1_TITLE') || 'I "Bad Boy"'}
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base font-retro text-slate-200 leading-relaxed whitespace-pre-line pl-1 font-medium">
                {t('BAD_REP_TIER_1_DESC') ||
                  '• Red Card Risk: +20% higher chance of receiving a red card during matches.\n• Transfer Drop: 25% chance interested clubs drop transfer offers.\n• Starting Chemistry: Reduced to 40% (-10%) on newly signed clubs.\n• Lifestyle Drama: 10% mid-season chance of negative lifestyle events.'}
              </p>
            </div>

            {/* Tier 2: Menace */}
            <div className="bg-black/75 border-2 border-rose-900/70 p-3.5 sm:p-4 pixel-corners space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-pixel px-2 py-0.5 bg-rose-950 border border-rose-600 text-rose-300 font-bold">
                  II
                </span>
                <span className="text-sm sm:text-base md:text-lg font-black font-arcade text-amber-300 uppercase">
                  {t('BAD_REP_TIER_2_TITLE') || 'II "Menace"'}
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base font-retro text-slate-200 leading-relaxed whitespace-pre-line pl-1 font-medium">
                {t('BAD_REP_TIER_2_DESC') ||
                  '• Red Card Risk: +40% higher chance of receiving a red card during matches.\n• Transfer Drop: 50% chance clubs cancel contract bids.\n• Starting Chemistry: Reduced to 30% (-20%) on newly signed clubs.\n• Lifestyle Drama: 20% mid-season chance of negative lifestyle events.'}
              </p>
            </div>

            {/* Tier 3: Psycho */}
            <div className="bg-black/75 border-2 border-red-700/80 p-3.5 sm:p-4 pixel-corners space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-pixel px-2 py-0.5 bg-red-950 border border-red-500 text-red-300 font-bold">
                  III
                </span>
                <span className="text-sm sm:text-base md:text-lg font-black font-arcade text-red-400 uppercase">
                  {t('BAD_REP_TIER_3_TITLE') || 'III "Psycho" (LOCKED FLOOR)'}
                </span>
              </div>
              <p className="text-xs sm:text-sm md:text-base font-retro text-slate-200 leading-relaxed whitespace-pre-line pl-1 font-medium">
                {t('BAD_REP_TIER_3_DESC') ||
                  '• Red Card Risk: +60% higher chance of receiving a red card during matches.\n• Transfer Drop: 75% chance of prospective buyers boycotting your transfer.\n• Starting Chemistry: Reduced to 20% (-30%) on newly signed clubs.\n• Lifestyle Drama: 30% mid-season chance of negative lifestyle events.\n• Permanent Lock: Reputation can NEVER drop below Tier III once reached.'}
              </p>
            </div>
          </div>

          {/* Section: Competition Disciplinary Rules */}
          <div className="bg-slate-900/90 border border-slate-700 p-3.5 sm:p-4 pixel-corners space-y-2">
            <span className="text-xs sm:text-sm md:text-base font-arcade font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-5 h-5 text-amber-400 shrink-0" />
              {t('BAD_REP_TUTORIAL_RULES_HEADER') || 'COMPETITION SUSPENSION REGULATIONS:'}
            </span>
            <p className="text-xs sm:text-sm md:text-base font-retro text-slate-300 leading-relaxed whitespace-pre-line font-medium">
              {t('BAD_REP_TUTORIAL_DISCIPLINARY_RULES') ||
                '• Red Cards: A straight red card bars you from playing the NEXT match of that competition.\n• World Cup & International: 2 yellow cards trigger a 1-match suspension. Yellow card counts CLEAR after the Group Stage and CLEAR again after the Quarter-Finals.\n• Champions / Continental: 2 yellow cards trigger a 1-match suspension. Yellows CLEAR after the League Phase and CLEAR again after the Quarter-Finals.\n• Domestic Leagues: 4 yellow cards trigger a 1-match suspension (no midway clears).'}
            </p>
          </div>
        </div>

        {/* Modal Action Button */}
        <div className="relative z-10 pt-4 mt-3 border-t-2 border-rose-900/60 flex justify-end shrink-0">
          <button
            id="bad-rep-tutorial-close-btn"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-7 py-2.5 sm:py-3 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-arcade text-xs sm:text-sm uppercase tracking-wider pixel-corners pixel-bevel-gold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)] cursor-pointer active:translate-y-0.5 transition-all"
          >
            <span>{t('BAD_REP_TUTORIAL_ACKNOWLEDGE') || 'UNDERSTOOD / ACKNOWLEDGE'}</span>
            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
