import React, { useState } from 'react';
import { PlayerCardData, AccountingState, StoreUpgradeItem } from '../types';
import {
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
} from '../utils/statCalculations';
import {
  Dna,
  AlertTriangle,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Flame,
  ShieldAlert,
  HelpCircle,
  Activity,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';

export type GeneticOutcomeTier =
  | 'critical_failure'
  | 'failure'
  | 'small_success'
  | 'moderate_success'
  | 'total_success'
  | 'huge_success';

export interface GeneticOutcomeDetail {
  tier: GeneticOutcomeTier;
  label: string;
  chance: number;
  potentialChange: number;
  statPointsBonus: number;
  allStatsPenalty?: number;
  headline: string;
  description: string;
  badgeStyle: string;
  glowStyle: string;
}

export type GeneticActivationOutcome = GeneticOutcomeDetail;

export const GENETIC_PROCEDURE_ODDS: GeneticOutcomeDetail[] = [
  {
    tier: 'critical_failure',
    label: 'Critical Failure',
    chance: 5,
    potentialChange: -5,
    statPointsBonus: 0,
    allStatsPenalty: 10,
    headline: 'CELLULAR CYTOTOXICITY REJECTION',
    description: 'Catastrophic genomic instability! The synthetic vector triggered acute rejection: -10 points on EVERY stat, and -5 Potential.',
    badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    glowStyle: 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)]',
  },
  {
    tier: 'failure',
    label: 'Failure',
    chance: 15,
    potentialChange: 0,
    statPointsBonus: 0,
    headline: 'INERT GENE EXPRESSION',
    description: 'The biochemical vector failed to bind to target telomeres. Nothing happened. No physiological changes detected.',
    badgeStyle: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
    glowStyle: 'border-slate-600 shadow-[0_0_15px_rgba(100,116,139,0.3)]',
  },
  {
    tier: 'small_success',
    label: 'Small Success',
    chance: 50,
    potentialChange: 1,
    statPointsBonus: 10,
    headline: 'MINOR EPIGENETIC ACTIVATION',
    description: 'Subtle methylation occurred across athletic muscle markers: +1 Potential ceiling and +10 Free Stat Points!',
    badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    glowStyle: 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]',
  },
  {
    tier: 'moderate_success',
    label: 'Moderate Success',
    chance: 15,
    potentialChange: 3,
    statPointsBonus: 20,
    headline: 'MARKED BIOCHEMICAL ADVANCEMENT',
    description: 'Mitochondrial and neuromuscular gene pathways successfully synthesized: +3 Potential ceiling and +20 Free Stat Points!',
    badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
    glowStyle: 'border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.35)]',
  },
  {
    tier: 'total_success',
    label: 'Total Success',
    chance: 10,
    potentialChange: 5,
    statPointsBonus: 30,
    headline: 'DEEP METABOLIC BREAKTHROUGH',
    description: 'Outstanding genetic transcription unlocked dormant physiological capabilities: +5 Potential ceiling and +30 Free Stat Points!',
    badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    glowStyle: 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]',
  },
  {
    tier: 'huge_success',
    label: 'Huge Success',
    chance: 5,
    potentialChange: 10,
    statPointsBonus: 50,
    headline: 'SUPERHUMAN PHENOTYPIC EVOLUTION',
    description: 'MIRACULOUS CELLULAR TRANSCENDENCE! Peak genetic activation unlocked: +10 Potential ceiling and +50 Free Stat Points!',
    badgeStyle: 'bg-purple-500/25 text-purple-200 border-purple-400/80',
    glowStyle: 'border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.5)]',
  },
];

export function rollGeneticOutcome(): GeneticOutcomeDetail {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const outcome of GENETIC_PROCEDURE_ODDS) {
    cumulative += outcome.chance;
    if (roll < cumulative) {
      return outcome;
    }
  }
  return GENETIC_PROCEDURE_ODDS[2]; // Fallback to small success
}

interface GeneticActivationModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  accounting?: AccountingState;
  onClose: () => void;
  onApplyOutcome: (
    updatedPlayer: PlayerCardData,
    updatedAccounting: AccountingState,
    outcome: GeneticOutcomeDetail
  ) => void;
  showToast: (msg: string) => void;
}

export const GeneticActivationModal: React.FC<GeneticActivationModalProps> = ({
  isOpen,
  player,
  accounting,
  onClose,
  onApplyOutcome,
  showToast,
}) => {
  const [stage, setStage] = useState<'prompt' | 'sequencing' | 'result'>('prompt');
  const [outcome, setOutcome] = useState<GeneticOutcomeDetail | null>(null);
  const [resolvedPlayer, setResolvedPlayer] = useState<PlayerCardData | null>(null);

  if (!isOpen) return null;

  const cost = 100000000; // 100 Million Euros
  const currentCash = accounting?.totalSavings ?? 0;
  const canAfford = currentCash >= cost;

  const handleStartProcedure = () => {
    if (!canAfford) {
      showToast(`❌ Insufficient funds! Requires €${cost.toLocaleString()} (Available: €${currentCash.toLocaleString()})`);
      return;
    }

    setStage('sequencing');

    setTimeout(() => {
      const rolled = rollGeneticOutcome();
      setOutcome(rolled);

      // Execute mechanical updates on player
      let updated: PlayerCardData = JSON.parse(JSON.stringify(player));
      if (!updated.stats) {
        updated.stats = { pro: 50, def: 50, cre: 50, men: 50, goa: 10, phy: 50 };
      }

      const isGk = (updated.subPosition || updated.position || '').toUpperCase() === 'GK';

      if (rolled.tier === 'critical_failure') {
        // -10 to EVERY stat, -5 potential
        const potDrop = 5;
        updated.potentialOvr = Math.max(40, (updated.potentialOvr || 70) - potDrop);
        updated.internalPotentialOvr = Math.max(40, (updated.internalPotentialOvr || 70) - potDrop);

        if (!isGk) {
          const d = getOrCreateOutfieldDetailed(updated.stats);
          (Object.keys(d) as Array<keyof typeof d>).forEach((key) => {
            if (typeof d[key] === 'number') {
              (d as any)[key] = Math.max(20, (d[key] || 50) - 10);
            }
          });
          updated.stats = syncCategoryStatsFromDetailed(updated.stats, d);
          updated.ovr = calculateWeightedOvr(updated.position || 'ST', updated.subPosition || updated.position || 'ST', updated.stats, updated.playStyle);
        } else {
          const gk = getOrCreateGkDetailed(updated.stats);
          (Object.keys(gk) as Array<keyof typeof gk>).forEach((key) => {
            if (typeof gk[key] === 'number') {
              (gk as any)[key] = Math.max(20, (gk[key] || 50) - 10);
            }
          });
          updated.stats = syncCategoryStatsFromGkDetailed(updated.stats, gk);
          updated.ovr = calculateWeightedOvr('GK', 'GK', updated.stats, updated.playStyle);
        }
      } else if (rolled.tier === 'failure') {
        // Nothing happens
      } else {
        // Success tiers: Add potential and free stat points
        const potGain = rolled.potentialChange;
        const ptsGain = rolled.statPointsBonus;
        updated.potentialOvr = Math.min(99, (updated.potentialOvr || updated.ovr) + potGain);
        updated.internalPotentialOvr = Math.min(99, (updated.internalPotentialOvr || updated.ovr) + potGain);
        updated.freeStatPoints = (updated.freeStatPoints || 0) + ptsGain;
        updated.unassignedPoints = (updated.unassignedPoints || 0) + ptsGain;

        if ((rolled.tier === 'total_success' || rolled.tier === 'huge_success') && !shouldDisableParticles()) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
          });
        }
      }

      setResolvedPlayer(updated);
      setStage('result');
    }, 2400);
  };

  const handleFinalize = () => {
    if (!outcome || !resolvedPlayer) {
      onClose();
      return;
    }

    const updatedAccounting: AccountingState = {
      ...(accounting || {
        contractYears: 0,
        yearlySalary: 0,
        sponsors: [],
        sanctions: [],
        businesses: [],
      }),
      totalSavings: Math.max(0, (accounting?.totalSavings ?? 0) - cost),
    };

    onApplyOutcome(resolvedPlayer, updatedAccounting, outcome);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#11121d] border border-purple-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.25)] text-white overflow-hidden">
        {/* Glowing Background Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* CLOSE BUTTON (Only during prompt stage) */}
        {stage === 'prompt' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* 1. PROMPT STAGE */}
        {stage === 'prompt' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-lg shadow-purple-900/40 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#11121d] rounded-[14px] flex items-center justify-center">
                  <Dna className="w-6 h-6 text-purple-300 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-purple-400/80 text-purple-200 bg-purple-950/60 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                    Tier 6 • Permanent Upgrade
                  </span>
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> High-Risk Procedure
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-wide">
                  GENETIC POTENTIAL ACTIVATION
                </h2>
              </div>
            </div>

            {/* WARNING BANNER */}
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3.5 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-black text-amber-300">CAUTION:</span> This is a one-time irreversible, high-risk biological procedure. Cellular modification involves profound physical risks alongside generational athletic rewards.
              </div>
            </div>

            {/* ODDS BREAKDOWN TABLE */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-400" />
                Experimental Probability Matrix
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GENETIC_PROCEDURE_ODDS.map((item) => (
                  <div
                    key={item.tier}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${item.badgeStyle}`}>
                          {item.chance}%
                        </span>
                        <span className="text-xs font-black text-white">{item.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {item.tier === 'critical_failure' && 'Lose 10 on every stat & -5 Potential'}
                        {item.tier === 'failure' && 'Nothing happens (no change)'}
                        {item.tier === 'small_success' && '+1 Potential, +10 Stat Points'}
                        {item.tier === 'moderate_success' && '+3 Potential, +20 Stat Points'}
                        {item.tier === 'total_success' && '+5 Potential, +30 Stat Points'}
                        {item.tier === 'huge_success' && '+10 Potential, +50 Stat Points'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COST & CASH BAR */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Procedure Cost</span>
                <span className="text-lg font-black text-purple-300">
                  €{cost.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Your Available Cash: <strong className={canAfford ? 'text-emerald-400' : 'text-rose-400'}>€{currentCash.toLocaleString()}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                {canAfford ? (
                  <button
                    onClick={handleStartProcedure}
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-900/50 transition-all transform active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Dna className="w-4 h-4" />
                    UNDERGO PROCEDURE
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-slate-500 bg-slate-800 border border-slate-700/60 cursor-not-allowed opacity-70"
                  >
                    NEED €{cost.toLocaleString()}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. SEQUENCING ANIMATION STAGE */}
        {stage === 'sequencing' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin flex items-center justify-center" />
              <Dna className="w-10 h-10 text-purple-400 absolute inset-0 m-auto animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-black text-purple-200 tracking-wide">
                SYNTHESIZING EXPERIMENTAL TELOMERES
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Administering biological activation sequence. Rewriting cellular athletic markers and checking somatic cellular tolerance...
              </p>
            </div>

            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 animate-[pulse_1s_infinite]" />
            </div>
          </div>
        )}

        {/* 3. RESULT REVEAL STAGE */}
        {stage === 'result' && outcome && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <span className={`inline-block text-[11px] font-black uppercase px-3 py-1 rounded-full border ${outcome.badgeStyle}`}>
                Outcome: {outcome.label} ({outcome.chance}% Chance)
              </span>
              <h2 className="text-2xl font-black text-white tracking-wide">
                {outcome.headline}
              </h2>
            </div>

            <div className={`p-5 rounded-2xl bg-slate-900/80 border ${outcome.glowStyle} space-y-3`}>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {outcome.description}
              </p>

              {/* OUTCOME STATS SUMMARY */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Potential OVR</span>
                  <span className={`text-base font-black ${outcome.potentialChange > 0 ? 'text-emerald-400' : outcome.potentialChange < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {outcome.potentialChange > 0 ? `+${outcome.potentialChange}` : outcome.potentialChange < 0 ? `${outcome.potentialChange}` : 'Unchanged'}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {outcome.tier === 'critical_failure' ? 'Stat Penalty' : 'Free Stat Points'}
                  </span>
                  <span className={`text-base font-black ${outcome.statPointsBonus > 0 ? 'text-purple-400' : outcome.allStatsPenalty ? 'text-rose-400' : 'text-slate-300'}`}>
                    {outcome.statPointsBonus > 0 ? `+${outcome.statPointsBonus} Points` : outcome.allStatsPenalty ? `-10 On Every Stat` : '0 Points'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={handleFinalize}
                className="px-8 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-900/40 transition-all transform active:scale-95 cursor-pointer"
              >
                ACCEPT & RECORD RESULT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
