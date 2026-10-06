import React, { useEffect } from 'react';
import { SpecialClubEvaluation, SpecialClubConfig } from '../types/specialClubInterest';
import { PlayerConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Trophy,
  Crown,
  Building,
  DollarSign,
  Award,
  Globe,
  Check,
  Clock,
  X,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';

interface SpecialSignInEventModalProps {
  isOpen: boolean;
  evaluation: SpecialClubEvaluation | null;
  player: PlayerConfig;
  onReceiveContractProposal?: (evaluation: SpecialClubEvaluation) => void;
  onReceiveProposal?: (evaluation: SpecialClubEvaluation) => void;
  onWaitAndKeepProposal?: (evaluation: SpecialClubEvaluation) => void;
  onWait?: (evaluation: SpecialClubEvaluation) => void;
  onDeclineSpecialInterest?: (evaluation: SpecialClubEvaluation) => void;
  onDecline?: (evaluation: SpecialClubEvaluation) => void;
}

export const SpecialSignInEventModal: React.FC<SpecialSignInEventModalProps> = ({
  isOpen,
  evaluation,
  player,
  onReceiveContractProposal,
  onReceiveProposal,
  onWaitAndKeepProposal,
  onWait,
  onDeclineSpecialInterest,
  onDecline,
}) => {
  const { t } = useLanguage();

  const handleReceive = (ev: SpecialClubEvaluation) => {
    if (onReceiveContractProposal) onReceiveContractProposal(ev);
    else if (onReceiveProposal) onReceiveProposal(ev);
  };

  const handleWait = (ev: SpecialClubEvaluation) => {
    if (onWaitAndKeepProposal) onWaitAndKeepProposal(ev);
    else if (onWait) onWait(ev);
  };

  const handleDecline = (ev: SpecialClubEvaluation) => {
    if (onDeclineSpecialInterest) onDeclineSpecialInterest(ev);
    else if (onDecline) onDecline(ev);
  };

  useEffect(() => {
    if (isOpen) {
      if (typeof audioManager.playLegendaryFlashSound === 'function') {
        audioManager.playLegendaryFlashSound();
      }
      haptics.success();
    }
  }, [isOpen]);

  // Keyboard navigation support:
  // Key 1 / Enter = Receive Formal Contract Proposal (adds to SPECIAL OPPORTUNITY)
  // Key 2 / W = Keep as Special Opportunity (decide later in Transfer Hub)
  // Key 3 / Esc = Decline Special Event
  useEffect(() => {
    if (!isOpen || !evaluation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === 'Enter') {
        e.preventDefault();
        handleReceive(evaluation);
      } else if (e.key === '2' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleWait(evaluation);
      } else if (e.key === '3' || e.key === 'Escape') {
        e.preventDefault();
        handleDecline(evaluation);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, evaluation]);

  if (!isOpen || !evaluation) return null;

  const config = evaluation.config;
  const isSaudi = config.category === 'saudi';
  const yearly = evaluation.salary || 30000000;
  const weekly = evaluation.weeklyWage || Math.round(yearly / 52);
  const signingBonus = evaluation.signingBonus || Math.round(yearly * 0.2);

  return (
    <div
      id="special-sign-in-event-modal"
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-between p-3 sm:p-6 lg:p-8 select-none animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* 32-bit CRT / Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Frame Container */}
      <div className="relative w-full max-w-5xl mx-auto my-auto bg-gradient-to-b from-[#0b1329] via-[#050b18] to-[#02050e] border-4 border-sky-400 pixel-bevel-gold p-4 sm:p-7 text-white shadow-[0_0_80px_rgba(56,189,248,0.4)] flex flex-col justify-between">
        {/* Decorative 32-Bit Brackets */}
        <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-300 pointer-events-none" />
        <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-300 pointer-events-none" />
        <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-300 pointer-events-none" />
        <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-300 pointer-events-none" />

        {/* Top Header Marquee */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-sky-400/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-sky-300 shadow-md shrink-0">
              <Crown className="w-7 h-7 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-sky-600 border border-sky-300 font-pixel text-[10px] font-black uppercase text-white tracking-widest animate-pulse">
                  🌟 SPECIAL SIGN-IN EVENT
                </span>
                <span className="text-[11px] font-mono text-sky-300 font-bold hidden sm:inline">
                  TRANSFER WINDOW SPECIAL
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-arcade font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-sky-300 to-indigo-200 uppercase tracking-tight mt-1">
                {config.name}
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              PRESTIGE TIER
            </span>
            <span className="text-sm font-arcade font-black text-amber-300 flex items-center sm:justify-end gap-1">
              <Sparkles className="w-4 h-4 text-sky-400" />
              {config.financialTier || 'Global Elite'}
            </span>
          </div>
        </div>

        {/* Main Pitch Body */}
        <div className="my-5 space-y-4 text-left">
          {/* Legacy Pitch Banner */}
          <div className="p-4 bg-slate-900/90 border-2 border-sky-500/40 relative">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">
              {config.leaderTitle} • {config.keyLeaders}
            </span>
            <blockquote className="text-xs sm:text-sm text-slate-200 font-mono italic leading-relaxed">
              "{config.presidentialQuote || config.legacyPitch}"
            </blockquote>
          </div>

          {/* Club Info & Financials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Left: Sporting & Manager Vision */}
            <div className="p-3.5 bg-black/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-arcade text-sky-300 uppercase">
                  SPORTING PROJECT
                </span>
                <span className="text-[11px] font-mono text-slate-300 font-bold">
                  {config.leagueName} ({config.country})
                </span>
              </div>
              <div className="text-xs font-mono space-y-1.5 text-slate-300">
                <p>
                  Manager:{' '}
                  <strong className="text-white">
                    {config.managerName} ({config.managerNationality})
                  </strong>
                </p>
                <p>
                  Tactical System:{' '}
                  <span className="text-sky-300">{config.formation} • {config.tacticalStyle}</span>
                </p>
                <p>
                  Guaranteed Role:{' '}
                  <span className="text-emerald-400 font-bold">
                    {evaluation.squadRole || 'First-Team Starter & Marquee Star'}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Generational Financial Terms */}
            <div className="p-3.5 bg-black/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-arcade text-amber-300 uppercase flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  CONTRACT OPPORTUNITY
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {evaluation.contractYears || 4} YEARS
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">YEARLY SALARY</span>
                  <span className="text-base font-arcade font-black text-emerald-400">
                    €{yearly.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    (€{weekly.toLocaleString()}/wk)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">SIGNING BONUS</span>
                  <span className="text-base font-arcade font-black text-amber-300">
                    +€{signingBonus.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Direct Savings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee / Flow Notice */}
          <div className="p-2.5 bg-sky-950/50 border border-sky-500/30 text-xs font-mono text-sky-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              {t(
                'Accepting this special event adds the contract to SPECIAL OPPORTUNITY in your Transfer Hub with a [BLUE !] notification. You can inspect the contract and sign whenever ready.'
              )}
            </span>
          </div>
        </div>

        {/* 3 Large, Highly Readable 32-Bit Choices */}
        <div className="pt-4 border-t-2 border-sky-400/60 space-y-2.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase text-center">
            {t('SELECT RESPONSE • KEYBOARD [1 / 2 / 3] • TOUCH / CONTROLLER SUPPORTED')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* OPTION 1: RECEIVE CONTRACT PROPOSAL */}
            <button
              id="special-event-receive-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => handleReceive(evaluation)}
              className="py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-slate-950 border-2 border-sky-200 pixel-bevel-raised font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>EXPLORE / RECEIVE PROPOSAL</span>
              <span className="text-[10px] font-mono opacity-80 hidden sm:inline">[1]</span>
            </button>

            {/* OPTION 2: WAIT (KEEP PROPOSAL ACTIVE) */}
            <button
              id="special-event-wait-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => handleWait(evaluation)}
              className="py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-slate-950 border-2 border-amber-200 pixel-bevel-raised font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
              title="Add proposal to Special Opportunity in Transfer and decide later"
            >
              <Clock className="w-4 h-4" />
              <span>DECIDE LATER (WAIT)</span>
              <span className="text-[10px] font-mono opacity-80 hidden sm:inline">[2]</span>
            </button>

            {/* OPTION 3: DECLINE */}
            <button
              id="special-event-decline-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => handleDecline(evaluation)}
              className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-2 border-slate-600 pixel-bevel-raised font-arcade font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>DECLINE SPECIAL EVENT</span>
              <span className="text-[10px] font-mono opacity-80 hidden sm:inline">[3]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
