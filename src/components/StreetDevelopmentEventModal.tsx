import React, { useEffect } from 'react';
import {
  Flame,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Dices,
  Award,
  Zap,
  CheckCircle2,
  Footprints,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';

const triggerConfetti = (opts?: any) => {
  if (shouldDisableParticles()) return;
  try {
    if (typeof confetti === 'function') {
      confetti(opts);
    } else if ((confetti as any)?.default && typeof (confetti as any).default === 'function') {
      (confetti as any).default(opts);
    }
  } catch (e) {
    console.warn('Confetti notification suppressed:', e);
  }
};

export interface StreetDevelopmentEventModalProps {
  isOpen: boolean;
  pointsRolled: number;
  message: 'YOU LEARNED NOTHING' | 'YOU LEARNED A FEW THINGS' | 'YOU LEARNED A LOT' | string;
  tier: 'low' | 'medium' | 'high';
  age: number;
  totalAvailablePoints: number;
  onContinue: () => void;
}

export const StreetDevelopmentEventModal: React.FC<StreetDevelopmentEventModalProps> = ({
  isOpen,
  pointsRolled,
  message,
  tier,
  age,
  totalAvailablePoints,
  onContinue,
}) => {
  useEffect(() => {
    if (isOpen && (tier === 'high' || pointsRolled >= 31)) {
      triggerConfetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    }
  }, [isOpen, tier, pointsRolled]);

  // Controller & Keyboard listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onContinue]);

  if (!isOpen) return null;

  const isLow = tier === 'low' || pointsRolled <= 14;
  const isMed = tier === 'medium' || (pointsRolled >= 15 && pointsRolled <= 30);
  const isHigh = tier === 'high' || pointsRolled >= 31;

  const tierConfig = isHigh
    ? {
        badgeBg: 'bg-emerald-950',
        badgeBorder: 'border-emerald-400',
        badgeText: 'text-emerald-300',
        pointsColor: 'text-emerald-300',
        tierLabel: 'EXCEPTIONAL DEVELOPMENT (31–90 PTS)',
        tierSub: 'The player experienced exceptional development during their time playing on the streets.',
        icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      }
    : isMed
    ? {
        badgeBg: 'bg-amber-950',
        badgeBorder: 'border-amber-400',
        badgeText: 'text-amber-300',
        pointsColor: 'text-amber-300',
        tierLabel: 'MODERATE DEVELOPMENT (15–30 PTS)',
        tierSub: 'The player made some progress but did not experience major development.',
        icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
      }
    : {
        badgeBg: 'bg-slate-900',
        badgeBorder: 'border-slate-700',
        badgeText: 'text-slate-300',
        pointsColor: 'text-slate-300',
        tierLabel: 'MINIMAL DEVELOPMENT (1–14 PTS)',
        tierSub: 'The player had a poor year on the streets and gained very little development.',
        icon: <Flame className="w-4 h-4 text-slate-400" />,
      };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-mono select-none"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40" />

      <div
        className="w-full max-w-3xl bg-slate-900 border-2 border-orange-500/80 pixel-bevel-gold shadow-2xl max-h-[92vh] flex flex-col text-left relative overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-slate-700 p-3 sm:p-5 shrink-0 bg-slate-950 pixel-bevel-raised relative z-10">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-950 border border-orange-500 text-orange-300 text-[10px] font-black uppercase tracking-wider pixel-bevel-gold">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              ANNUAL STREET DEVELOPMENT • AGE {age}
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-wider pixel-text-shadow">
              Annual Street Development
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              You spent another year playing football on the streets.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 pixel-bevel-raised text-xs shrink-0">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-400">Total Unassigned: </span>
            <strong className="text-amber-300 font-black text-xs sm:text-sm">+{totalAvailablePoints} PTS</strong>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-3 sm:p-5 flex-1 overflow-y-auto custom-scrollbar space-y-3 sm:space-y-4 relative z-10">
          {/* Main Roll Showcase Box */}
          <div className="bg-slate-950 border-2 border-slate-700 pixel-bevel-raised p-4 sm:p-5 text-center space-y-3 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-center gap-2">
              <div className={`px-2.5 py-0.5 border ${tierConfig.badgeBg} ${tierConfig.badgeBorder} text-[10px] font-black uppercase tracking-wider ${tierConfig.badgeText} flex items-center gap-1.5`}>
                <Dices className="w-3.5 h-3.5" />
                <span>STREET ROLL RESULT (1–90 STAT POINTS)</span>
              </div>
            </div>

            {/* Outcome Headline */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                DEVELOPMENT OUTCOME
              </div>
              <div className="text-xl sm:text-3xl font-black text-white uppercase pixel-text-shadow">
                {message}
              </div>
              <p className="text-[11px] text-slate-300 max-w-md mx-auto">{tierConfig.tierSub}</p>
            </div>

            {/* Giant 32-Bit Stat Points Display */}
            <div className="flex items-baseline justify-center gap-2 pt-1">
              <span className={`text-5xl sm:text-6xl font-black tracking-tight ${tierConfig.pointsColor} pixel-text-shadow`}>
                +{pointsRolled}
              </span>
              <span className="text-sm sm:text-base font-black text-slate-200 uppercase tracking-wider">
                Stat Points
              </span>
            </div>

            {/* 32-Bit Stepped Progress Bar Display */}
            <div className="space-y-1 max-w-md mx-auto">
              <div className="w-full bg-slate-900 h-3 overflow-hidden border border-slate-700 p-0.5">
                <div
                  className={`h-full transition-all duration-700 ${isHigh ? 'bg-emerald-400' : isMed ? 'bg-amber-400' : 'bg-slate-500'}`}
                  style={{ width: `${Math.min(100, Math.max(4, (pointsRolled / 90) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                <span>1 pt</span>
                <span className="text-amber-300 font-bold">{pointsRolled} / 90 pts</span>
                <span>90 pts</span>
              </div>
            </div>
          </div>

          {/* Breakdown Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Probability Distribution */}
            <div className="bg-slate-950 border border-slate-800 pixel-bevel-raised p-3 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-1.5">
                <Footprints className="w-3.5 h-3.5 text-amber-400" />
                <span>STREET PROBABILITY</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {/* 1 - 14 PTS (40%) */}
                <div
                  className={`p-2 border flex items-center justify-between ${
                    isLow
                      ? 'bg-slate-900 border-slate-600 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-black flex items-center gap-1">
                      <span>40% — MINIMAL (1–14 PTS)</span>
                      {isLow && <CheckCircle2 className="w-3 h-3 text-slate-300" />}
                    </div>
                    <div className="text-[10px] text-slate-400">Poor year with very little development.</div>
                  </div>
                  <span className="font-bold text-slate-300 shrink-0 ml-1">40%</span>
                </div>

                {/* 15 - 30 PTS (30%) */}
                <div
                  className={`p-2 border flex items-center justify-between ${
                    isMed
                      ? 'bg-amber-950 border-amber-500 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-black flex items-center gap-1">
                      <span>30% — MODERATE (15–30 PTS)</span>
                      {isMed && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400">Moderate progress across street games.</div>
                  </div>
                  <span className="font-bold text-amber-400 shrink-0 ml-1">30%</span>
                </div>

                {/* 31 - 90 PTS (30%) */}
                <div
                  className={`p-2 border flex items-center justify-between ${
                    isHigh
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-black flex items-center gap-1">
                      <span>30% — EXCEPTIONAL (31–90 PTS)</span>
                      {isHigh && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400">Breakthrough on the asphalt!</div>
                  </div>
                  <span className="font-bold text-emerald-400 shrink-0 ml-1">30%</span>
                </div>
              </div>
            </div>

            {/* Stat Bank & Next Action */}
            <div className="bg-slate-950 border border-slate-800 pixel-bevel-raised p-3 flex flex-col justify-between space-y-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>NEXT SEQUENCE</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-slate-900 border border-slate-700 flex items-center justify-between">
                    <span className="text-slate-400">Points Gained This Year</span>
                    <span className="font-black text-amber-400">+{pointsRolled} PTS</span>
                  </div>

                  <div className="p-2 bg-slate-900 border border-slate-700 flex items-center justify-between">
                    <span className="text-slate-400">Total Unassigned Points</span>
                    <span className="font-black text-white">+{totalAvailablePoints} PTS</span>
                  </div>

                  <div className="p-2.5 bg-orange-950/60 border border-orange-500/60 pixel-bevel-gold text-orange-300 space-y-0.5">
                    <div className="font-black text-[10px] uppercase flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-orange-400" />
                      <span>NEXT: STREET CARD DRAW</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      Draw 3 Street Cards to unlock traits, perks, or early scout opportunities!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 border-t-2 border-slate-700 pixel-bevel-raised p-3 sm:p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5 relative z-10">
          <div className="space-y-0.5 text-center sm:text-left w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Street Progression Recorded
            </span>
            <div className="text-xs sm:text-sm font-black text-white flex items-center justify-center sm:justify-start gap-1.5">
              <span>Age {age} Advancement</span>
              <span className="text-amber-400 font-bold">(+{pointsRolled} PTS)</span>
            </div>
          </div>

          <button
            id="street-progression-continue-btn"
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto min-h-[44px] px-8 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-amber-300 pixel-bevel-gold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <span>CONTINUE</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
