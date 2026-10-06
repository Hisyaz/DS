import React from 'react';
import { PlayerCardData, PlayerPositionSlot } from '../types';
import {
  ManagerPositionProposal,
  addPlayerNewPosition,
  calculatePositionSlotOvr,
  POSITION_MASTERY_CONFIG,
} from '../utils/positionMasterySystem';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Check,
  X,
  TrendingDown,
  Info,
  Award,
  ChevronRight,
} from 'lucide-react';

interface ManagerPositionChangeModalProps {
  player: PlayerCardData;
  proposal: ManagerPositionProposal;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (updatedPlayer: PlayerCardData) => void;
}

export const ManagerPositionChangeModal: React.FC<ManagerPositionChangeModalProps> = ({
  player,
  proposal,
  isOpen,
  onClose,
  onAccept,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Compute hypothetical Tier I slot and its projected OVR
  const hypotheticalSlot: PlayerPositionSlot = {
    id: 'hypothetical_new_pos',
    slotIndex: (player.positions?.length || 1) + 1,
    position: proposal.position,
    subPosition: proposal.subPosition,
    playStyle: proposal.playStyle,
    tier: 'I',
    isMain: false,
  };

  const projectedTierIOvr = calculatePositionSlotOvr(player, hypotheticalSlot);
  const hypotheticalTierIVOvr = calculatePositionSlotOvr(player, {
    ...hypotheticalSlot,
    tier: 'IV',
  });

  const handleAccept = () => {
    const updated = addPlayerNewPosition(player, {
      position: proposal.position,
      subPosition: proposal.subPosition,
      playStyle: proposal.playStyle,
    });
    onAccept(updated);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-5 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-black/30 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase bg-black/30 px-2 py-0.5 rounded-full border border-white/20 text-amber-200">
                {t('TACTICAL_MEETING') || 'Tactical Meeting • Manager Directive'}
              </span>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                {t('MANAGER_REQUESTS_ROLE_CHANGE') || 'Manager Requests New Tactical Position'}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar text-slate-200 text-sm">
          {/* Manager Explanation Quote */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 relative">
            <div className="text-xs uppercase font-extrabold text-amber-400 mb-1 flex items-center gap-1.5">
              <span>{t('HEAD_COACH_DILEMMA') || 'Head Coach Tactical Dilemma'}</span>
            </div>
            <p className="text-slate-300 italic leading-relaxed text-sm">
              "{proposal.explanation}"
            </p>
          </div>

          {/* Tactical Context Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                {t('CURRENT_POSITION_RIVAL') || 'Squad Stalwart at your position'}
              </span>
              <div className="text-base font-black text-white">{proposal.rivalStarName}</div>
              <div className="text-xs text-amber-400 font-bold">
                {proposal.rivalStarOvr} OVR • {player.subPosition || player.position}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                {t('SQUAD_TACTICAL_WEAKNESS') || 'Squad Vulnerability'}
              </span>
              <div className="text-base font-black text-white">{proposal.weakStarterName}</div>
              <div className="text-xs text-rose-400 font-bold">
                {proposal.weakStarterOvr} OVR • {proposal.subPosition}
              </div>
            </div>
          </div>

          {/* The Proposed Role Card */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {t('PROPOSED_POSITION') || 'Proposed Position & Role'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
                {proposal.position} • {proposal.subPosition}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-black text-white">
                  {proposal.subPosition} ({proposal.playStyle})
                </div>
                <div className="text-xs text-slate-400">
                  Starts at <strong className="text-amber-300">Tier I Mastery</strong> (-40% penalty on non-physical stats)
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-amber-400">
                  {projectedTierIOvr} <span className="text-xs text-slate-400 font-medium">OVR (Tier I)</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-bold">
                  {projectedTierIOvr} → {hypotheticalTierIVOvr} OVR at Tier IV
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-lg p-2.5 text-xs text-slate-400 border border-slate-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                {t('POSITION_DEVELOPMENT_EXPLAINER') ||
                  'You can develop this position up to Tier IV (0% penalty) in your Development tab by spending 10 stat points per tier. If you play 80%+ of a season at Tier IV, you can make it your permanent Main Position!'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            {t('DECLINE_REQUEST') || 'Decline Proposal'}
          </button>

          <button
            onClick={handleAccept}
            className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4" />
            {t('ACCEPT_NEW_POSITION') || 'Accept & Learn Position'}
          </button>
        </div>
      </div>
    </div>
  );
};
