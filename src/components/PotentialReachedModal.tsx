import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Zap, AlertTriangle, TrendingUp, TrendingDown, Check, Lock, ShieldAlert, Dice5, HelpCircle, RefreshCw } from 'lucide-react';
import { PlayerCardData } from '../types';

interface PotentialReachedModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onApplyOutcome: (updatedPlayer: PlayerCardData) => void;
  onClose: () => void;
}

export type EarlyPotentialFateOption = 'unfulfilled_genius' | 'ahead_of_schedule' | 'overconfidence_trap';

export const PotentialReachedModal: React.FC<PotentialReachedModalProps> = ({
  isOpen,
  player,
  onApplyOutcome,
  onClose,
}) => {
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [rolledOption, setRolledOption] = useState<EarlyPotentialFateOption | null>(null);

  const age = player.age || 20;
  const isEarly = age < 27;
  const isPeak = age >= 27 && age <= 29;
  const isLate = age >= 30;

  const currentPot = player.potentialOvr || Math.max((player.ovr || 50) + 5, 80);
  const currentOvr = player.ovr || 50;

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsRolling(false);
      setRolledOption(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRollFate = () => {
    if (isRolling || rolledOption) return;
    setIsRolling(true);

    setTimeout(() => {
      let option: EarlyPotentialFateOption;
      const roll = Math.random();

      if (player.hasUsedEarlyPotentialBoost) {
        // Option 1 (+2 POT) can ONLY appear ONCE per player career!
        // 50% Option 2, 50% Option 3
        option = roll < 0.5 ? 'ahead_of_schedule' : 'overconfidence_trap';
      } else {
        // 33.3% chance each for the 3 options
        if (roll < 0.3333) {
          option = 'unfulfilled_genius';
        } else if (roll < 0.6666) {
          option = 'ahead_of_schedule';
        } else {
          option = 'overconfidence_trap';
        }
      }

      setRolledOption(option);
      setIsRolling(false);
    }, 1200);
  };

  const handleConfirmAndClose = () => {
    const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
    let newPot = currentPot;

    if (isEarly && rolledOption) {
      if (rolledOption === 'unfulfilled_genius') {
        newPot = Math.min(99, currentPot + 2);
        copy.hasUsedEarlyPotentialBoost = true;
      } else if (rolledOption === 'ahead_of_schedule') {
        newPot = currentPot;
      } else if (rolledOption === 'overconfidence_trap') {
        newPot = Math.max(50, currentPot - 1);
        copy.overconfidenceDropPending = true;
        // OVR stays at currentOvr for this season (higher than newPot)
      }
    }

    copy.potentialOvr = newPot;
    copy.lastReachedPotentialOvr = newPot;

    onApplyOutcome(copy);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-white my-auto max-h-[92vh] flex flex-col text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 bg-amber-400" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15 bg-purple-500" />

        {/* Modal Header & Theme Badge (Fixed Header) */}
        <div className="border-b border-slate-800 pb-3.5 shrink-0 space-y-2 relative z-10">
          {isEarly && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '5s' }} />
              EARLY POTENTIAL REACHED
            </div>
          )}

          {isPeak && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/30 to-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              PEAK POTENTIAL REACHED
            </div>
          )}

          {isLate && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 via-fuchsia-500/30 to-purple-500/20 border border-purple-400/60 text-purple-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/10">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              LATE PEAK ACHIEVED
            </div>
          )}

          {/* Title & OVR/POT Status */}
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight">
              {isEarly && '🌟 Early Peak Milestone'}
              {isPeak && '🏆 Peak Prime Milestone'}
              {isLate && '⚡ Late Bloom Milestone'}
            </h2>
            <p className="text-xs text-slate-300 font-medium px-2">
              At age <span className="text-amber-300 font-bold">{age}</span>, your overall rating (<strong>{currentOvr} OVR</strong>) has matched your Potential ceiling (<strong>{currentPot} POT</strong>)!
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-3.5 custom-scrollbar relative z-10 text-left">

          {/* EARLY POTENTIAL FATE ROLL SECTION */}
          {isEarly && (
            <div className="bg-gradient-to-b from-slate-950 via-slate-950/90 to-amber-950/30 border border-amber-500/40 rounded-xl p-3.5 text-left space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                  <Dice5 className="w-4 h-4 text-amber-400" /> Early Potential Fate Roll
                </div>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 font-bold">
                  {player.hasUsedEarlyPotentialBoost ? '50% / 50% Odds' : '33.3% Odds Each'}
                </span>
              </div>

              {!rolledOption && !isRolling && (
                <div className="text-center py-3 space-y-2.5">
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    Reaching your potential before age 27 triggers a career fate roll. Roll to discover how your early peak shapes your ceiling!
                  </p>
                  {player.hasUsedEarlyPotentialBoost && (
                    <p className="text-[11px] text-amber-400/90 bg-amber-950/60 border border-amber-500/30 rounded-lg p-2 font-semibold">
                      ℹ️ You already unlocked the +2 Potential boost earlier in your career. That bonus cannot be rolled again.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleRollFate}
                    className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    <Dice5 className="w-4 h-4" /> Roll Potential Fate
                  </button>
                </div>
              )}

              {isRolling && (
                <div className="text-center py-5 space-y-2">
                  <RefreshCw className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-widest animate-pulse">
                    Determining Career Fate...
                  </p>
                </div>
              )}

              {rolledOption && !isRolling && (
                <div className="space-y-2.5 animate-in fade-in zoom-in-95 duration-300">
                  {rolledOption === 'unfulfilled_genius' && (
                    <div className="bg-amber-950/50 border border-amber-400/80 rounded-xl p-3 space-y-1.5">
                      <div className="text-xs font-black text-amber-300 flex items-center gap-2 uppercase tracking-wide">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Option 1: Unfulfilled Genius (+2 Potential)
                      </div>
                      <p className="text-xs text-amber-100/90 leading-relaxed">
                        "Your potential was not enough! Hard work and relentless drive open up new horizons."
                      </p>
                      <div className="bg-slate-950/80 border border-amber-500/40 rounded-lg p-2 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">New Potential Ceiling:</span>
                        <span className="text-emerald-400 text-sm font-black flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> {currentPot} → {currentPot + 2} POT
                        </span>
                      </div>
                    </div>
                  )}

                  {rolledOption === 'ahead_of_schedule' && (
                    <div className="bg-slate-900/90 border border-sky-400/80 rounded-xl p-3 space-y-1.5">
                      <div className="text-xs font-black text-sky-300 flex items-center gap-2 uppercase tracking-wide">
                        <Zap className="w-4 h-4 text-sky-400" />
                        Option 2: Ahead of Schedule (Potential Unchanged)
                      </div>
                      <p className="text-xs text-sky-100/90 leading-relaxed">
                        "Faster than expected! You mastered your skillset early, but your potential ceiling remains firmly at {currentPot}."
                      </p>
                      <div className="bg-slate-950/80 border border-sky-500/40 rounded-lg p-2 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">Potential Ceiling:</span>
                        <span className="text-sky-300 text-sm font-black">{currentPot} POT (Unchanged)</span>
                      </div>
                    </div>
                  )}

                  {rolledOption === 'overconfidence_trap' && (
                    <div className="bg-rose-950/50 border border-rose-500/80 rounded-xl p-3 space-y-1.5">
                      <div className="text-xs font-black text-rose-300 flex items-center gap-2 uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        Option 3: Overconfidence Trap (-1 Potential, Temp Higher OVR)
                      </div>
                      <p className="text-xs text-rose-100/90 leading-relaxed">
                        "This made you overconfident! Complacency sets in, causing your potential ceiling to drop by -1. For this season, your OVR ({currentOvr}) will be higher than your POT ({currentPot - 1}), but it will drop next season."
                      </p>
                      <div className="bg-slate-950/80 border border-rose-500/40 rounded-lg p-2 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">New Potential Ceiling:</span>
                        <span className="text-rose-400 text-sm font-black flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" /> {currentPot} → {currentPot - 1} POT (OVR drops next season)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PEAK POTENTIAL (AGE 27-29) BODY */}
          {isPeak && (
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3.5 text-left space-y-2">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Congratulations! You have reached your prime athletic and technical potential. You are currently operating at the absolute peak of your capabilities.
              </p>
            </div>
          )}

          {/* LATE PEAK (AGE 30+) BODY */}
          {isLate && (
            <div className="bg-slate-950/80 border border-purple-500/40 rounded-xl p-3.5 text-left space-y-2">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Veteran excellence! Through experience, tactical intelligence, and physical maintenance, you have achieved a late career peak and matched your full potential.
              </p>
            </div>
          )}

          {/* MANDATORY RULES & CONSTRAINTS SECTION (ALL POPUP TYPES) */}
          <div className="bg-slate-950/90 border border-amber-500/50 rounded-xl p-3.5 text-left space-y-2 shadow-lg">
            <div className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5 tracking-wider">
              <Lock className="w-4 h-4 text-amber-400" /> Important Potential Ceiling Rules
            </div>
            <ul className="text-[11px] sm:text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Stat Point Distribution Locked:</strong> From now on, you can no longer distribute stat points (unassigned points) while your OVR is at or above your POT.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Cards & Event Stat Boosts Ineffective:</strong> Any cards, perks, training levels, or events that grant stat increases will NOT add anything while your OVR matches your POT.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Re-Enabling Upgrades:</strong> If your OVR drops below your POT (due to age decline or injury), stat point distribution and event stat boosts will reactivate until you reach your POT again.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Hard Ceiling:</strong> Your OVR can never exceed your POT (except for the temporary Overconfidence Trap).
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ACTION BUTTON (Fixed Footer) */}
        <div className="pt-3 mt-1 border-t border-slate-800 bg-slate-900 shrink-0 relative z-10">
          <button
            type="button"
            onClick={handleConfirmAndClose}
            disabled={isEarly && !rolledOption}
            className={`w-full font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 ${
              isEarly && !rolledOption
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            {isEarly && !rolledOption ? 'Roll Fate Above To Continue' : 'Acknowledge & Continue Career'}
          </button>
        </div>
      </div>
    </div>
  );
};
