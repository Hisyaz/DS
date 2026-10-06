import React from 'react';
import { Skull, AlertTriangle, ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { BadRepTierUpEvent, getRomanReputationTier } from '../utils/badReputationSystem';
import { useLanguage } from '../context/LanguageContext';

interface BadReputationTierModalProps {
  isOpen: boolean;
  event: BadRepTierUpEvent | null;
  onAcknowledge: () => void;
}

export const BadReputationTierModal: React.FC<BadReputationTierModalProps> = ({
  isOpen,
  event,
  onAcknowledge,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !event) return null;

  const roman = getRomanReputationTier(event.newTier);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-950 border-4 border-rose-600 pixel-corners pixel-bevel-raised shadow-[0_0_40px_rgba(225,29,72,0.6)] p-5 sm:p-6 overflow-hidden">
        {/* Retro scanline & header glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 via-transparent to-black pointer-events-none" />

        {/* Header with 32-bit icon & Roman tier */}
        <div className="relative z-10 flex items-center gap-3.5 border-b-2 border-rose-700/60 pb-3 mb-4">
          <div className="w-12 h-12 bg-rose-900 border-2 border-rose-500 pixel-corners flex items-center justify-center shrink-0 pixel-bevel-raised shadow-[0_0_15px_rgba(244,63,94,0.5)]">
            <Skull className="w-6 h-6 text-rose-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-pixel px-2 py-0.5 bg-rose-950 text-rose-400 border border-rose-600 pixel-corners uppercase tracking-wider">
                {t('BAD_REP_TIER_LABEL') || 'REPUTATION TIER'} {roman}
              </span>
              {event.newTier === 3 && (
                <span className="text-[10px] font-pixel px-2 py-0.5 bg-slate-900 text-amber-300 border border-amber-500 pixel-corners flex items-center gap-1 uppercase">
                  <Lock className="w-3 h-3 text-amber-400" /> {t('LOCKED') || 'LOCKED'}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-black font-arcade text-white text-rose-200 tracking-wide mt-1 uppercase">
              {t(event.title) || event.title}
            </h2>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="relative z-10 mb-4 bg-slate-900/90 border border-rose-900/80 p-3.5 pixel-corners pixel-bevel-sunken">
          <p className="text-xs sm:text-sm font-retro text-rose-100 leading-relaxed">
            {t(event.description) || event.description}
          </p>
        </div>

        {/* Active Penalties */}
        <div className="relative z-10 space-y-2 mb-5">
          <span className="text-[10px] font-arcade font-black text-rose-400 uppercase tracking-wider block">
            ⚠ {t('ACTIVE_PROBLEM_PLAYER_PENALTIES') || 'ACTIVE PROBLEM-PLAYER PENALTIES:'}
          </span>
          <div className="space-y-1.5">
            {event.consequences.map((consequence, idx) => (
              <div
                key={idx}
                className="bg-black/60 border border-rose-950 px-3 py-2 pixel-corners flex items-start gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="text-[11px] font-retro text-slate-200 leading-snug">
                  {t(consequence) || consequence}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acknowledge Button */}
        <div className="relative z-10 flex justify-end">
          <button
            onClick={onAcknowledge}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-arcade text-xs uppercase tracking-wider pixel-corners pixel-bevel-gold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)] cursor-pointer active:translate-y-0.5 transition-all"
          >
            <span>{t('ACKNOWLEDGE_CONSEQUENCES') || 'ACKNOWLEDGE CONSEQUENCES'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
