import React, { useState } from 'react';
import { PlayerCardData, ManagerState, AccountingState } from '../types';
import { isProfessionalPlayer } from '../utils/playerIdentitySystem';
import {
  Briefcase,
  Trophy,
  Users,
  Award,
  DollarSign,
  Building2,
  TrendingUp,
  Flame,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Zap,
  X,
  UserX,
  School,
} from 'lucide-react';

interface AgentModal32BitProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerCardData;
  manager?: ManagerState;
  accounting?: AccountingState;
  onSwitchAcademy?: () => void;
  onTriggerDirective?: (directive: 'pro_contract_renewal' | 'pro_request_transfer' | 'pro_playing_time' | 'tactical_meeting') => void;
  onFireAgent?: () => void;
  primaryHex?: string;
  accentHex?: string;
}

export const AgentModal32Bit: React.FC<AgentModal32BitProps> = ({
  isOpen,
  onClose,
  player,
  manager,
  accounting,
  onSwitchAcademy,
  onTriggerDirective,
  onFireAgent,
  primaryHex = '#F59E0B',
  accentHex = '#38BDF8',
}) => {
  const [confirmFire, setConfirmFire] = useState<boolean>(false);

  if (!isOpen) return null;

  const isPro = isProfessionalPlayer(player);
  const effectiveManagerName = manager?.name || (player as any).managerName || 'Family Representative';
  const effectiveAgency = manager?.agencyName || (manager as any)?.agency || (player as any).agencyName || 'Independent Management';
  const agentArchetype = manager?.agentType || manager?.managerType || (manager as any)?.archetype || 'professional';
  const isParentAgent = agentArchetype === 'family' || (player as any).hasParentAgent;

  return (
    <div
      id="agent-modal-32bit-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-pixel select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="agent-modal-32bit-container"
        className="w-full max-w-2xl bg-slate-950 border-2 pixel-corners pixel-bevel-gold p-4 sm:p-5 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative space-y-4 my-auto"
        style={{ borderColor: primaryHex }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Scanlines */}
        <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

        {/* Header Strip */}
        <div className="relative z-10 flex items-center justify-between pb-3 border-b-2 border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 pixel-corners flex items-center justify-center border-2 pixel-bevel-raised"
              style={{ backgroundColor: `${primaryHex}20`, borderColor: primaryHex }}
            >
              <Briefcase className="w-5 h-5" style={{ color: primaryHex }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  {isPro ? 'AGENT HEADQUARTERS' : 'YOUTH AGENT & LIAISON'}
                </span>
                <span
                  className="px-2 py-0.2 text-[9px] font-arcade font-black uppercase pixel-corners border"
                  style={{
                    backgroundColor: `${primaryHex}20`,
                    borderColor: `${primaryHex}60`,
                    color: primaryHex,
                  }}
                >
                  {isPro ? '32-BIT PRO DESK' : 'ACADEMY LIAISON'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-retro">
                Representative: <strong className="text-slate-200">{effectiveManagerName}</strong> • {effectiveAgency}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 pixel-corners bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-black cursor-pointer pixel-bevel-raised"
          >
            ✕ [ESC]
          </button>
        </div>

        {/* CONTENT FOR YOUTH CAREER: STRICTLY SWITCH ACADEMY OPTION */}
        {!isPro ? (
          <div className="relative z-10 space-y-4">
            {/* Youth Agent Status Card */}
            <div className="bg-slate-900/90 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-300 font-pixel flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  CURRENT YOUTH CLUB
                </span>
                <span className="text-[10px] font-arcade text-emerald-400 font-black">
                  AGE {player.age || 10} PROSPECT
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-retro">
                <span className="text-slate-300">
                  Enrolled at: <strong className="text-white">{player.youthLeagueTeam || player.club || 'Youth Academy'}</strong>
                </span>
                <span className="text-amber-400 font-arcade font-bold">
                  {player.fame || 0} FAME
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-retro leading-relaxed">
                As a youth prospect, your agent handles school and academy representation. You can request your agent to find and initiate a transfer to another youth academy in your country or abroad.
              </p>
            </div>

            {/* SWITCH ACADEMY ACTION */}
            <div className="bg-slate-900 border-2 border-emerald-500/70 pixel-corners pixel-bevel-emerald p-4 space-y-3">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">
                    SWITCH YOUTH ACADEMY
                  </h4>
                  <p className="text-[10px] text-slate-300 font-retro">
                    Move to a higher-tier or international academy (requires 50+ Fame for domestic, 100+ Fame for abroad).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSwitchAcademy) onSwitchAcademy();
                }}
                className="w-full py-3 px-4 pixel-corners bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider pixel-bevel-emerald shadow-[0_4px_0_0_#022c22] active:translate-y-1 active:shadow-none border-2 border-emerald-300 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <School className="w-4 h-4" />
                <span>[SWITCH ACADEMY] DISCUSS TRANSFER OPTIONS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* CONTENT FOR PRO CAREER: FULL PRO AGENT DESK */
          <div className="relative z-10 space-y-3.5">
            {/* 1. CONTRACT STATUS BANNER */}
            <div className="bg-slate-900/90 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[11px] font-black uppercase text-amber-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  {player.club || 'Pro Club'} • CONTRACT TERMS
                </span>
                <span className="text-[10px] font-arcade text-sky-300 font-bold">
                  {player.contractYearsRemaining || 2} YEARS LEFT
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-arcade">
                <div className="p-1.5 bg-slate-950 pixel-corners border border-slate-800">
                  <span className="text-slate-400 block">ROLE</span>
                  <span className="font-black text-white">{player.squadRole || player.playingTimeExpectation || 'STARTER'}</span>
                </div>
                <div className="p-1.5 bg-slate-950 pixel-corners border border-slate-800">
                  <span className="text-slate-400 block">SQUAD LEVEL</span>
                  <span className="font-black text-emerald-400">{player.squadDestination || 'First Team'}</span>
                </div>
                <div className="p-1.5 bg-slate-950 pixel-corners border border-slate-800">
                  <span className="text-slate-400 block">ANNUAL WAGE</span>
                  <span className="font-black text-amber-300">
                    €{(accounting?.yearlySalary || ((player as any).wage ? (player as any).wage * 52 : ((player as any).salaryAnnual || 50000))).toLocaleString()}/yr
                  </span>
                </div>
                <div className="p-1.5 bg-slate-950 pixel-corners border border-slate-800">
                  <span className="text-slate-400 block">RELEASE CLAUSE</span>
                  <span className="font-black text-purple-300">
                    {player.releaseClause ? `€${player.releaseClause.toLocaleString()}` : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. AGENT ATTRIBUTES & ARCHETYPE */}
            {manager && (
              <div className="bg-slate-900 border border-slate-800 pixel-corners p-2.5 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-slate-200 uppercase">{manager.name}</span>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-arcade font-bold pixel-corners uppercase">
                    {agentArchetype}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-arcade">
                  <span className="text-slate-300">
                    NEG: <strong className="text-amber-400">{manager.negotiation ?? (manager as any).stats?.negotiation ?? 70}</strong>
                  </span>
                  <span className="text-slate-300">
                    NET: <strong className="text-sky-400">{manager.network ?? (manager as any).stats?.network ?? 70}</strong>
                  </span>
                  <span className="text-slate-300">
                    MKT: <strong className="text-emerald-400">{manager.marketing ?? (manager as any).stats?.marketing ?? 70}</strong>
                  </span>
                </div>
              </div>
            )}

            {/* 3. PRO DIRECTIVES */}
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-arcade">
                AGENT DIRECTIVES & ACTIONS
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. CONTRACT RENEWAL */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onTriggerDirective) onTriggerDirective('pro_contract_renewal');
                  }}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-amber-500/70 hover:border-amber-400 pixel-corners pixel-bevel-raised text-left cursor-pointer transition-all active:translate-y-0.5 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>1. "I WANT A NEW CONTRACT"</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-retro leading-tight">
                    Instruct agent to open salary renegotiations and demand improved contract terms.
                  </p>
                </button>

                {/* 2. TRANSFER REQUEST */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onTriggerDirective) onTriggerDirective('pro_request_transfer');
                  }}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-sky-500/70 hover:border-sky-400 pixel-corners pixel-bevel-raised text-left cursor-pointer transition-all active:translate-y-0.5 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-sky-300">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>2. "I WANT A NEW CLUB"</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-retro leading-tight">
                    Demand a formal transfer listing and have your representative seek outside offers.
                  </p>
                </button>

                {/* 3. PLAYING TIME INTERVENTION */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onTriggerDirective) onTriggerDirective('pro_playing_time');
                  }}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-emerald-500/70 hover:border-emerald-400 pixel-corners pixel-bevel-raised text-left cursor-pointer transition-all active:translate-y-0.5 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-300">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>3. "I WANT MORE MINUTES"</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-retro leading-tight">
                    Request agent intervention with the head coach to guarantee starter playing minutes.
                  </p>
                </button>

                {/* 4. TACTICAL SQUAD MEETING */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onTriggerDirective) onTriggerDirective('tactical_meeting');
                  }}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-purple-500/70 hover:border-purple-400 pixel-corners pixel-bevel-raised text-left cursor-pointer transition-all active:translate-y-0.5 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-300">
                    <Compass className="w-3.5 h-3.5 text-purple-400" />
                    <span>4. "TACTICAL SQUAD MEETING"</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-retro leading-tight">
                    Discuss position adaptation and tactical versatility with team staff.
                  </p>
                </button>
              </div>
            </div>

            {/* FIRE AGENT SECTION */}
            {!isParentAgent && onFireAgent && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-retro">
                  Unhappy with agency results? You can terminate representation.
                </span>
                {!confirmFire ? (
                  <button
                    type="button"
                    onClick={() => setConfirmFire(true)}
                    className="px-2.5 py-1 pixel-corners bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-600/60 text-[10px] font-black uppercase cursor-pointer pixel-bevel-crimson"
                  >
                    FIRE AGENT
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onFireAgent();
                        onClose();
                      }}
                      className="px-2.5 py-1 pixel-corners bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase cursor-pointer pixel-bevel-crimson"
                    >
                      CONFIRM TERMINATION
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmFire(false)}
                      className="px-2 py-1 pixel-corners bg-slate-800 text-slate-300 text-[10px] font-bold cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
