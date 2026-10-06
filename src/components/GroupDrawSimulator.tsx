import React, { useState, useEffect, useRef } from 'react';
import { InternationalYouthClub, GroupStageGroup } from '../types/youthLeague';
import { PlayerConfig } from '../types';
import { Globe, Trophy, Play, FastForward, CheckCircle, Shield, Sparkles } from 'lucide-react';

interface GroupDrawSimulatorProps {
  all32Clubs: InternationalYouthClub[];
  player: PlayerConfig;
  onCompleteDraw: (groups: GroupStageGroup[]) => void;
}

export const GroupDrawSimulator: React.FC<GroupDrawSimulatorProps> = ({
  all32Clubs,
  player,
  onCompleteDraw,
}) => {
  const [unassignedClubs, setUnassignedClubs] = useState<InternationalYouthClub[]>(() => {
    // Shuffle initial 32 clubs
    const shuffled = [...all32Clubs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const [groups, setGroups] = useState<{ groupName: string; teams: InternationalYouthClub[] }[]>(() => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return letters.map((l) => ({
      groupName: `Group ${l}`,
      teams: [],
    }));
  });

  const [currentDrawnClub, setCurrentDrawnClub] = useState<InternationalYouthClub | null>(null);
  const [targetGroupLetter, setTargetGroupLetter] = useState<string | null>(null);
  const [isAutoDrawing, setIsAutoDrawing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [drawLogs, setDrawLogs] = useState<string[]>([]);
  const autoDrawRef = useRef<boolean>(false);

  autoDrawRef.current = isAutoDrawing;

  const playerClubName = player.club?.toLowerCase() || 'kensington united';

  // Helper to validate candidate groups for a club according to draw rules
  const getValidGroupIndices = (
    club: InternationalYouthClub,
    currentGroups: { groupName: string; teams: InternationalYouthClub[] }[]
  ): number[] => {
    const valid: number[] = [];
    currentGroups.forEach((g, idx) => {
      if (g.teams.length >= 4) return;

      if (club.federation === 'UEFA') {
        const uefaCount = g.teams.filter((t) => t.federation === 'UEFA').length;
        if (uefaCount >= 2) return; // Max 2 UEFA
      } else {
        const sameFedCount = g.teams.filter((t) => t.federation === club.federation).length;
        if (sameFedCount >= 1) return; // Max 1 for non-UEFA
      }

      valid.push(idx);
    });
    return valid;
  };

  // Draw 1 team
  const drawSingleTeam = (
    remaining: InternationalYouthClub[],
    currGroups: { groupName: string; teams: InternationalYouthClub[] }[]
  ): {
    nextRemaining: InternationalYouthClub[];
    nextGroups: { groupName: string; teams: InternationalYouthClub[] }[];
    drawnClub: InternationalYouthClub | null;
    groupName: string | null;
  } => {
    if (remaining.length === 0) {
      return { nextRemaining: [], nextGroups: currGroups, drawnClub: null, groupName: null };
    }

    const club = remaining[0];
    const validIndices = getValidGroupIndices(club, currGroups);

    let chosenGroupIdx: number;
    if (validIndices.length > 0) {
      chosenGroupIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
    } else {
      // Fallback if strict shuffle got blocked (rare)
      const openIndices = currGroups
        .map((g, idx) => (g.teams.length < 4 ? idx : -1))
        .filter((i) => i !== -1);
      chosenGroupIdx = openIndices[0] ?? 0;
    }

    const updatedGroups = currGroups.map((g, idx) => {
      if (idx === chosenGroupIdx) {
        return { ...g, teams: [...g.teams, club] };
      }
      return g;
    });

    const nextRemaining = remaining.slice(1);

    return {
      nextRemaining,
      nextGroups: updatedGroups,
      drawnClub: club,
      groupName: currGroups[chosenGroupIdx].groupName,
    };
  };

  const handleStepDraw = () => {
    if (unassignedClubs.length === 0) return;

    const res = drawSingleTeam(unassignedClubs, groups);
    if (!res.drawnClub) return;

    setUnassignedClubs(res.nextRemaining);
    setGroups(res.nextGroups);
    setCurrentDrawnClub(res.drawnClub);
    setTargetGroupLetter(res.groupName);

    const isPlayerClub = res.drawnClub.name.toLowerCase() === playerClubName;
    const logMsg = `${res.drawnClub.flag} ${res.drawnClub.name} (${res.drawnClub.federation}) ➔ ${res.groupName}${
      isPlayerClub ? ' ⭐ [PLAYER CLUB]' : ''
    }`;
    setDrawLogs((prev) => [logMsg, ...prev]);

    if (res.nextRemaining.length === 0) {
      setIsComplete(true);
      setIsAutoDrawing(false);
    }
  };

  // Auto-draw loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isAutoDrawing && !isComplete && unassignedClubs.length > 0) {
      timer = setTimeout(() => {
        handleStepDraw();
      }, 180);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAutoDrawing, isComplete, unassignedClubs, groups]);

  // Instant finish draw
  const handleInstantComplete = () => {
    setIsAutoDrawing(false);
    let rem = [...unassignedClubs];
    let gList = [...groups];
    const newLogs: string[] = [];

    while (rem.length > 0) {
      const res = drawSingleTeam(rem, gList);
      if (!res.drawnClub) break;
      rem = res.nextRemaining;
      gList = res.nextGroups;

      const isPlayer = res.drawnClub.name.toLowerCase() === playerClubName;
      newLogs.unshift(
        `${res.drawnClub.flag} ${res.drawnClub.name} (${res.drawnClub.federation}) ➔ ${res.groupName}${
          isPlayer ? ' ⭐ [PLAYER CLUB]' : ''
        }`
      );
    }

    setUnassignedClubs([]);
    setGroups(gList);
    setCurrentDrawnClub(null);
    setTargetGroupLetter(null);
    setDrawLogs((prev) => [...newLogs, ...prev]);
    setIsComplete(true);
  };

  const handleProceed = () => {
    // Format groups into GroupStageGroup type with empty initial standings
    const formattedGroups: GroupStageGroup[] = groups.map((g) => ({
      groupName: g.groupName,
      teams: g.teams,
      standings: [],
    }));

    onCompleteDraw(formattedGroups);
  };

  const drawnCount = 32 - unassignedClubs.length;

  return (
    <div className="bg-slate-950 border border-sky-500/30 rounded-3xl p-5 sm:p-8 max-w-6xl w-full shadow-2xl space-y-6 text-left relative overflow-hidden animate-in fade-in duration-300">
      {/* Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 bg-sky-500" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 bg-amber-500" />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 text-xs font-black uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-sky-400" /> OFFICIAL GROUP STAGE DRAW 🏆
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            2026/27 International Youth Cup U{player.age || 10}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Assigning 32 qualified global clubs into Groups A–H under official youth draw constraints.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shrink-0">
          <div className="text-right">
            <div className="text-xs font-black text-amber-400 font-mono">{drawnCount} / 32 CLUBS DRAWN</div>
            <div className="text-[10px] text-slate-400">8 Groups • 4 Teams Each</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-black text-amber-300 text-sm">
            {Math.round((drawnCount / 32) * 100)}%
          </div>
        </div>
      </div>

      {/* Rules Indicator Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Shield className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <strong>Draw Constraints:</strong> Max 2 UEFA teams per group • Max 1 team from any non-UEFA association
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
          <Sparkles className="w-3 h-3" /> Player Club: {player.club || 'Kensington United'}
        </div>
      </div>

      {/* Controls & Active Ball Animation Stage */}
      <div className="bg-slate-900 border-2 border-sky-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Active Drawn Club Display */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-sky-400/60 flex items-center justify-center shadow-lg shrink-0">
              {currentDrawnClub ? (
                <span className="text-3xl animate-bounce">{currentDrawnClub.flag}</span>
              ) : (
                <Trophy className="w-8 h-8 text-amber-400/40" />
              )}
            </div>

            <div>
              {currentDrawnClub ? (
                <div>
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    <span>DRAWN INTO {targetGroupLetter}</span>
                    {currentDrawnClub.name.toLowerCase() === playerClubName && (
                      <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black">
                        YOUR CLUB!
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white">{currentDrawnClub.name}</h3>
                  <p className="text-xs text-slate-300 font-mono">
                    {currentDrawnClub.federation} • {currentDrawnClub.country} • {currentDrawnClub.teamOvr} OVR
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-black text-white">Press "DRAW NEXT CLUB" to begin</h3>
                  <p className="text-xs text-slate-400">
                    {unassignedClubs.length} teams remaining in the draw bowl.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Draw Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {!isComplete ? (
              <>
                <button
                  onClick={handleStepDraw}
                  disabled={isAutoDrawing || unassignedClubs.length === 0}
                  className="px-5 py-3 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-sky-400 via-teal-300 to-sky-500 hover:from-sky-300 hover:to-teal-200 disabled:opacity-50 shadow-lg shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>DRAW NEXT CLUB</span>
                </button>

                <button
                  onClick={() => setIsAutoDrawing(!isAutoDrawing)}
                  disabled={unassignedClubs.length === 0}
                  className={`px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                    isAutoDrawing
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>{isAutoDrawing ? 'PAUSE AUTO DRAW' : 'AUTO DRAW ALL'}</span>
                </button>

                <button
                  onClick={handleInstantComplete}
                  className="px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FastForward className="w-4 h-4" />
                  <span>SKIP DRAW</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleProceed}
                className="px-8 py-4 rounded-2xl text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 hover:from-emerald-300 hover:to-teal-200 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 animate-pulse"
              >
                <CheckCircle className="w-5 h-5" />
                <span>DRAW COMPLETE — PROCEED TO MATCH SIMULATION ⚽</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 8 Group Tables Grid (A - H) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
        {groups.map((group) => {
          const hasPlayerClub = group.teams.some((t) => t.name.toLowerCase() === playerClubName);

          return (
            <div
              key={group.groupName}
              className={`p-3 rounded-2xl border transition-all ${
                hasPlayerClub
                  ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                <span className="text-xs font-black text-amber-400 uppercase flex items-center gap-1">
                  {group.groupName}
                  {hasPlayerClub && <span className="text-[10px] text-amber-300">⭐</span>}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{group.teams.length} / 4 Teams</span>
              </div>

              <div className="space-y-1.5 min-h-[120px]">
                {group.teams.map((team, idx) => {
                  const isPlayer = team.name.toLowerCase() === playerClubName;

                  return (
                    <div
                      key={team.id}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center justify-between ${
                        isPlayer
                          ? 'bg-amber-500/25 border-amber-400 font-black text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <span className="text-[10px] text-slate-500 font-mono">{idx + 1}.</span>
                        <span>{team.flag}</span>
                        <span className="truncate">{team.name}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        {team.federation}
                      </span>
                    </div>
                  );
                })}

                {/* Empty Placeholders */}
                {Array.from({ length: 4 - group.teams.length }).map((_, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1.5 rounded-xl border border-dashed border-slate-800/80 text-[10px] text-slate-600 flex items-center justify-center font-mono"
                  >
                    Slot #{group.teams.length + i + 1}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Draw Feed Logs */}
      {drawLogs.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl max-h-24 overflow-y-auto custom-scrollbar space-y-1">
          <div className="text-[10px] font-black uppercase text-slate-400">Live Draw Feed</div>
          <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
            {drawLogs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="truncate">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
