import React from 'react';
import { EditorTeamData } from '../../../types/leagueEditor';
import {
  autoAssignTeamKeyRoles,
  isGoalkeeperPosition,
  isDefenderPosition,
  isCreatorPosition,
  isGoalscorerPosition,
} from '../../../utils/stadiumAndKeyRoleSystem';
import {
  Crown,
  Lock,
  ShieldAlert,
  Sparkles,
  Flame,
  Zap,
  Crosshair,
  Flag,
} from 'lucide-react';

interface ClubKeyRolesSectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubKeyRolesSection: React.FC<ClubKeyRolesSectionProps> = ({
  team,
  onUpdate,
  showToast = () => {},
}) => {
  const activeSquadSlots = team.squadSaveFile?.squad || [];
  const firstTeamPlayers = activeSquadSlots
    .filter((s) => s.player !== null && s.player !== undefined)
    .map((s) => ({
      id: s.player!.id,
      name: s.player!.name,
      position: s.player!.position || 'ATT',
      ovr: s.player!.ovr || 50,
      number: s.player!.number ?? s.player!.shirtNumber ?? s.slotNumber,
    }));

  const KEY_ROLES_CONFIG = [
    {
      key: 'captainPlayerId' as const,
      roleName: 'Club Captain',
      positionLabel: 'ANY FIRST TEAM PLAYER',
      icon: Crown,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-950/20 border-amber-500/30',
      desc: 'On-pitch leader, squad spokesperson & motivational anchor',
      filterFn: () => true,
    },
    {
      key: 'goalkeeperPlayerId' as const,
      roleName: 'Starting Goalkeeper',
      positionLabel: 'GK ONLY',
      icon: Lock,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/20 border-emerald-500/30',
      desc: 'First-choice shot stopper & penalty area commander',
      filterFn: isGoalkeeperPosition,
    },
    {
      key: 'defenderPlayerId' as const,
      roleName: 'Defensive Anchor',
      positionLabel: 'DEFENDERS ONLY (CB/LB/RB)',
      icon: ShieldAlert,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-950/20 border-blue-500/30',
      desc: 'Backline leader & aerial duel enforcer',
      filterFn: isDefenderPosition,
    },
    {
      key: 'creatorPlayerId' as const,
      roleName: 'Primary Playmaker',
      positionLabel: 'MIDFIELDERS ONLY (CM/CAM/CDM)',
      icon: Sparkles,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-950/20 border-indigo-500/30',
      desc: 'Chief chance creator, transition conductor & tempo setter',
      filterFn: isCreatorPosition,
    },
    {
      key: 'goalscorerPlayerId' as const,
      roleName: 'Primary Goalscorer',
      positionLabel: 'ATTACKERS ONLY (ST/CF/LW/RW)',
      icon: Flame,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-950/20 border-red-500/30',
      desc: 'Clinical finisher & offensive focal point',
      filterFn: isGoalscorerPosition,
    },
    {
      key: 'penaltyTakerPlayerId' as const,
      roleName: '1st Penalty Specialist',
      positionLabel: 'ANY FIRST TEAM PLAYER',
      icon: Crosshair,
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-950/20 border-rose-500/30',
      desc: 'Spot kick executioner with highest composure',
      filterFn: () => true,
    },
    {
      key: 'freeKickPlayerId' as const,
      roleName: 'Direct Free Kick Specialist',
      positionLabel: 'ANY FIRST TEAM PLAYER',
      icon: Zap,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-950/20 border-yellow-500/30',
      desc: 'Long-range curve and direct set-piece shooter',
      filterFn: () => true,
    },
    {
      key: 'cornerTakerPlayerId' as const,
      roleName: 'Corner Kick Taker',
      positionLabel: 'ANY FIRST TEAM PLAYER',
      icon: Flag,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-950/20 border-cyan-500/30',
      desc: 'Inswinging delivery and set piece crosser',
      filterFn: () => true,
    },
  ];

  const handleRoleAssignment = (targetKey: string, selectedPlayerId: string) => {
    onUpdate((prev) => {
      const updated = { ...prev };
      const keyRolesObj = { ...(prev.keyRoles || {}) };

      if (!selectedPlayerId) {
        (updated as any)[targetKey] = undefined;
        (keyRolesObj as any)[targetKey] = undefined;
        updated.keyRoles = keyRolesObj;
        showToast(`Role cleared for ${prev.name}`);
        return updated;
      }

      (updated as any)[targetKey] = selectedPlayerId;
      (keyRolesObj as any)[targetKey] = selectedPlayerId;
      updated.keyRoles = keyRolesObj;

      const playerObj = firstTeamPlayers.find((p) => p.id === selectedPlayerId);
      const pName = playerObj ? playerObj.name : selectedPlayerId;
      showToast(`Assigned ${pName} to ${targetKey}`);

      return updated;
    });
  };

  const handleAutoAssign = () => {
    const autoAssigned = autoAssignTeamKeyRoles(team);
    onUpdate(autoAssigned);
    showToast(`Auto-assigned highest rated options for all key roles on ${team.name}!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 05
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Crown className="w-7 h-7 text-amber-400" />
            KEY ROLES & SET-PIECE SPECIALISTS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Designate team captaincy, primary set-piece takers, playmakers, and position-locked tactical anchors.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoAssign}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95 shrink-0"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          Auto-Assign by OVR
        </button>
      </div>

      {/* ROLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {KEY_ROLES_CONFIG.map((roleDef) => {
          const IconComp = roleDef.icon;
          const currentAssignedId =
            (team as any)[roleDef.key] || (team.keyRoles as any)?.[roleDef.key] || '';
          const validCandidates = firstTeamPlayers.filter((p) => roleDef.filterFn(p.position));
          const assignedPlayer = firstTeamPlayers.find((p) => p.id === currentAssignedId);

          return (
            <div
              key={roleDef.key}
              className={`p-5 rounded-2xl border ${roleDef.bgColor} bg-slate-900/90 shadow-lg space-y-3 flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComp className={`w-4 h-4 ${roleDef.iconColor}`} />
                    <span className="text-xs font-black uppercase text-white tracking-wide">
                      {roleDef.roleName}
                    </span>
                  </div>
                  {currentAssignedId ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ASSIGNED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">UNASSIGNED</span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">{roleDef.desc}</p>

                <div className="text-[10px] font-mono font-bold text-amber-300/90 uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  🔒 {roleDef.positionLabel}
                </div>
              </div>

              {/* Selector */}
              <div className="pt-2">
                <select
                  value={currentAssignedId}
                  onChange={(e) => handleRoleAssignment(roleDef.key, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:border-cyan-500 cursor-pointer shadow-inner"
                >
                  <option value="">-- Choose Candidate --</option>
                  {validCandidates.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.number} {p.name} • {p.position} ({p.ovr} OVR)
                    </option>
                  ))}
                </select>

                {assignedPlayer && (
                  <div className="mt-2 text-[11px] font-mono text-cyan-300 flex items-center justify-between bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                    <span>Active: #{assignedPlayer.number} {assignedPlayer.name}</span>
                    <span className="font-black text-amber-400">{assignedPlayer.ovr} OVR</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
