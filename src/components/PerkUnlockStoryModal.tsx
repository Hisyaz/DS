import React, { useState, useEffect } from 'react';
import { CareerPerk, getLocalizedPerk } from '../utils/perksSystem';
import { PlayerCardData } from '../types';
import { PerkIcon } from './PerkIcon';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Award,
  Flame,
  Zap,
  Info,
} from 'lucide-react';

interface PerkUnlockStoryModalProps {
  isOpen: boolean;
  perk: CareerPerk | null;
  player: PlayerCardData;
  onAccept: (perk: CareerPerk) => void;
  onClose?: () => void;
}

export const PerkUnlockStoryModal: React.FC<PerkUnlockStoryModalProps> = ({
  isOpen,
  perk,
  player,
  onAccept,
  onClose,
}) => {
  const [page, setPage] = useState<'story' | 'perk'>('story');

  // Reset page to story whenever a new perk is opened
  useEffect(() => {
    if (isOpen && perk) {
      setPage('story');
    }
  }, [isOpen, perk?.id]);

  if (!isOpen || !perk) return null;

  const localizedPerk = getLocalizedPerk(perk);
  const activeCount = player.activePerkIds?.length || 0;
  const isFull = activeCount >= 5;

  const defaultTitle = localizedPerk.storyTitle || `Moment of Realization: ${localizedPerk.name}`;
  const defaultNarrative =
    localizedPerk.storyNarrative ||
    `Through relentless dedication, grueling battles on the pitch, and the unpredictable twists of your professional journey, you have forged a defining personal philosophy. You realize that your unique path has shaped who you are as a player and as a person.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-white my-auto flex flex-col justify-between overflow-hidden max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* ========================================================================= */}
        {/* SCREEN 1: STORY NARRATIVE & CONTEXT */}
        {/* ========================================================================= */}
        {page === 'story' && (
          <div className="flex flex-col space-y-3 sm:space-y-4 flex-1">
            {/* Top Header Badge */}
            <div className="text-center space-y-1.5 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>STEP 1/2 • {perk.category.toUpperCase()} MOMENT</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white line-clamp-2">
                {defaultTitle}
              </h2>
            </div>

            {/* Narrative Box */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-inner space-y-2.5 flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar max-h-[48vh]">
              <div className="flex items-start gap-2">
                <span className="text-2xl text-amber-400/60 font-serif leading-none select-none">“</span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic font-serif flex-1">
                  {defaultNarrative}
                </p>
                <span className="text-2xl text-amber-400/60 font-serif leading-none select-none self-end">”</span>
              </div>

              {/* Context / Path Box */}
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-0.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1 font-bold text-amber-400 text-[10px] uppercase">
                  <Info className="w-3 h-3" />
                  <span>How You Earned This:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">
                  {localizedPerk.howToObtain}
                </p>
              </div>
            </div>

            {/* Bottom Navigation Button */}
            <div className="pt-1 shrink-0">
              <button
                onClick={() => setPage('perk')}
                className="w-full min-h-[48px] sm:min-h-[52px] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
              >
                <span>NEXT: REVEAL PERK DETAILS</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: PERK DETAILS & ACCEPT OPTION */}
        {/* ========================================================================= */}
        {page === 'perk' && (
          <div className="flex flex-col space-y-3 sm:space-y-4 flex-1">
            {/* Top Mini Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5 shrink-0">
              <button
                onClick={() => setPage('story')}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-400 hover:text-amber-300 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Story</span>
              </button>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] sm:text-xs font-black uppercase">
                <Award className="w-3 h-3 text-emerald-400" />
                <span>STEP 2/2 • UNLOCKED TRAIT</span>
              </div>
            </div>

            {/* Perk Showcase Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border-2 border-amber-500/50 shadow-xl space-y-3 overflow-y-auto custom-scrollbar max-h-[50vh]">
              <div className="flex items-center gap-3">
                {/* Perk Icon */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <PerkIcon iconName={localizedPerk.iconName} className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {localizedPerk.category} Perk
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight truncate">
                    {localizedPerk.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-snug">
                {localizedPerk.shortDescription}
              </p>

              {/* What It Does Box */}
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>WHAT IT DOES:</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-emerald-200 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/30 leading-snug">
                  {localizedPerk.effect}
                </div>
              </div>

              {/* Active Slots Capacity Notice */}
              <div className="pt-0.5">
                {isFull ? (
                  <div className="text-[11px] text-amber-300 font-bold bg-amber-950/40 border border-amber-500/30 p-2 rounded-xl text-center leading-tight">
                    ⚠️ Active Perk Slots Full (5/5). Accepting will let you swap or discard.
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-300 font-bold bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-xl text-center leading-tight">
                    ✨ Open perk slots ({activeCount}/5 active). Will be added directly to traits!
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Accept Button */}
            <div className="pt-1 shrink-0">
              <button
                onClick={() => onAccept(perk)}
                className="w-full min-h-[48px] sm:min-h-[52px] py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                <span>ACCEPT PERK ({perk.name.toUpperCase()})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
