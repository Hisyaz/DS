import React, { useState, useMemo } from 'react';
import {
  EditorTeamData,
  FormationType,
  PlayerRolePosition,
  SquadSlot,
  StartingXIPositionSlot,
  SubstitutePositionSlot,
} from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import {
  FORMATION_STARTING_XI_SLOTS,
  BENCH_SUBSTITUTE_SLOTS,
  getStartingXIAndSubs,
  autoPickBestStartingXIAndSubs,
  swapSquadSlots,
  getPlayerBroadCategory,
} from '../utils/startingXISystem';
import { getDefaultTacticalPositions } from '../utils/tacticalSystem';
import { getFitnessPercentage } from '../utils/staminaInjurySystem';
import { normalizePositionTaxonomy } from '../utils/goalAssistSimulationModifiers';
import {
  Wand2,
  Users,
  Shield,
  ArrowRightLeft,
  Activity,
  HeartPulse,
  Award,
  Sparkles,
  Info,
  CheckCircle2,
  Flame,
  ChevronDown,
} from 'lucide-react';

interface StartingXITacticalEditorProps {
  team: EditorTeamData;
  onUpdateTeam: (updatedTeam: EditorTeamData) => void;
  showToast: (msg: string) => void;
}

const FORMATION_OPTIONS: { id: FormationType; label: string; desc: string }[] = [
  { id: '4-3-3', label: '4-3-3', desc: 'Balanced & Dynamic Attack' },
  { id: '4-2-3-1', label: '4-2-3-1', desc: 'Double Pivot & Playmaker' },
  { id: '4-4-2', label: '4-4-2', desc: 'Classic Dual Strikers' },
  { id: '3-5-2', label: '3-5-2', desc: 'Midfield Overload & Wing Backs' },
  { id: '3-4-3', label: '3-4-3', desc: 'High Pressing & Wide Attack' },
  { id: '3-4-1-2', label: '3-4-1-2', desc: 'Narrow Diamond Playmaker' },
  { id: '3-4-2-1', label: '3-4-2-1', desc: 'Dual Number 10s' },
  { id: '5-3-2', label: '5-3-2', desc: 'Solid Back 5 & Fast Counter' },
  { id: '5-4-1', label: '5-4-1', desc: 'Defensive Fortress' },
];

export const StartingXITacticalEditor: React.FC<StartingXITacticalEditorProps> = ({
  team,
  onUpdateTeam,
  showToast,
}) => {
  const currentFormation: FormationType = team.manager?.primaryTactic?.formation || '4-3-3';
  const formationSlots: StartingXIPositionSlot[] =
    FORMATION_STARTING_XI_SLOTS[currentFormation] || FORMATION_STARTING_XI_SLOTS['4-3-3'];

  // Retrieve categorized slots
  const { starters, substitutes, reserves, allActivePlayers } = useMemo(() => {
    return getStartingXIAndSubs(team);
  }, [team]);

  // Selected player for swapping modal / drawer
  const [selectedSlotToSwap, setSelectedSlotToSwap] = useState<SquadSlot | null>(null);

  // Calculate Starting XI Average OVR and Bench Average OVR
  const starterOvrAvg = useMemo(() => {
    const valid = starters.filter((s) => s.player);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, s) => acc + (s.player?.ovr || s.player?.overallRating || 70), 0);
    return Math.round((sum / valid.length) * 10) / 10;
  }, [starters]);

  const benchOvrAvg = useMemo(() => {
    const valid = substitutes.filter((s) => s.player);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, s) => acc + (s.player?.ovr || s.player?.overallRating || 70), 0);
    return Math.round((sum / valid.length) * 10) / 10;
  }, [substitutes]);

  // Change formation
  const handleFormationChange = (newFormation: FormationType) => {
    const tacticStyle = team.manager?.primaryTactic?.style || 'possession';
    const updated: EditorTeamData = {
      ...team,
      manager: {
        ...(team.manager || {
          name: 'Manager',
          nationality: team.countryCode || 'ENG',
          age: 45,
          hasSecondaryTactic: false,
          primaryTactic: {
            formation: newFormation,
            style: 'possession',
            positions: getDefaultTacticalPositions(newFormation, 'possession'),
          },
        }),
        primaryTactic: {
          formation: newFormation,
          style: tacticStyle,
          positions: getDefaultTacticalPositions(newFormation, tacticStyle),
        },
      },
    };
    onUpdateTeam(updated);
    showToast(`Formation updated to ${newFormation}`);
  };

  // Run Auto-Pick Best Starting XI & 7 Bench Subs
  const handleAutoPick = () => {
    const optimizedTeam = autoPickBestStartingXIAndSubs(team);
    onUpdateTeam(optimizedTeam);
    showToast(`✨ Auto-selected best Starting XI and 7 Substitutes for ${currentFormation}!`);
  };

  // Swap handler
  const handleExecuteSwap = (targetSlotNumber: number) => {
    if (!selectedSlotToSwap) return;
    const updated = swapSquadSlots(team, selectedSlotToSwap.slotNumber, targetSlotNumber, 'squad');
    onUpdateTeam(updated);
    setSelectedSlotToSwap(null);
    showToast(`Swapped slot #${selectedSlotToSwap.slotNumber} with slot #${targetSlotNumber}`);
  };

  // Helper for category color badge
  const getCategoryColor = (category: 'GK' | 'DEF' | 'MID' | 'ATT') => {
    switch (category) {
      case 'GK':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'DEF':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'MID':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'ATT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  // Helper for OVR color pill
  const getOvrColor = (ovr: number) => {
    if (ovr >= 86) return 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/30';
    if (ovr >= 80) return 'bg-emerald-500 text-white font-bold';
    if (ovr >= 74) return 'bg-blue-600 text-white font-semibold';
    return 'bg-slate-700 text-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  Starting XI & Matchday Squad
                </h3>
                <p className="text-xs text-slate-400">
                  Configure the 11 starting players and 7 matchday bench substitutes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Formation Selector */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-xs font-semibold text-slate-400">Formation:</span>
              <select
                value={currentFormation}
                onChange={(e) => handleFormationChange(e.target.value as FormationType)}
                className="bg-slate-900 text-white text-sm font-bold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {FORMATION_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label} ({f.desc})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-Pick Best XI & Subs Button */}
            <button
              type="button"
              onClick={handleAutoPick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>Auto-Pick Best Starting XI & 7 Subs</span>
            </button>
          </div>
        </div>

        {/* Squad Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Starting XI Avg
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">{starterOvrAvg || '--'}</span>
              <span className="text-xs text-slate-400">OVR</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              7 Subs Avg (Bench)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-blue-400">{benchOvrAvg || '--'}</span>
              <span className="text-xs text-slate-400">OVR</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Tactical Formation
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-white">{currentFormation}</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Total Squad Roster
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-purple-400">
                {allActivePlayers.length} / 35
              </span>
              <span className="text-xs text-slate-400">Players</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Pitch & Bench Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Pitch Container (Tactical Formation Visualization) */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Pitch Lineup — {currentFormation}
              </h4>
            </div>
            <span className="text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-full px-3 py-1">
              Click any starter to swap position
            </span>
          </div>

          {/* Realistic Pitch Layout with High-Contrast Graphics */}
          <div className="relative w-full aspect-[3/4] max-h-[620px] rounded-2xl overflow-hidden border-2 border-emerald-700/60 shadow-inner bg-gradient-to-b from-emerald-900 via-emerald-950 to-emerald-900 select-none">
            {/* Field Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              {/* Outer Border */}
              <div className="absolute inset-3 border-2 border-white/60 rounded-lg" />
              {/* Halfway Line */}
              <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-white/60 -translate-y-1/2" />
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 w-28 h-28 -translate-x-1/2 -translate-y-1/2 border-2 border-white/60 rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full" />
              {/* Penalty Area Top */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-x-2 border-white/60" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-8 border-b-2 border-x-2 border-white/60" />
              {/* Penalty Area Bottom */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-x-2 border-white/60" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-8 border-t-2 border-x-2 border-white/60" />
              {/* Goal Area Arc Bottom */}
              <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2 w-24 h-10 border-t-2 border-white/60 rounded-t-full" />
            </div>

            {/* 11 Starting XI Player Nodes on Pitch */}
            {formationSlots.map((slotDef) => {
              const starterSlot = starters.find((s) => s.slotNumber === slotDef.slotIndex);
              const player = starterSlot?.player;
              const fitness = player ? getFitnessPercentage(player) : 100;
              const isInjured =
                player &&
                (player.isInjured ||
                  player.healthStatus === 'injured' ||
                  (player.injuryWeeksRemaining !== undefined && player.injuryWeeksRemaining > 0));

              return (
                <div
                  key={`pitch_slot_${slotDef.slotIndex}`}
                  style={{
                    position: 'absolute',
                    left: `${slotDef.xPercent}%`,
                    top: `${slotDef.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="z-10"
                >
                  <button
                    type="button"
                    onClick={() => starterSlot && setSelectedSlotToSwap(starterSlot)}
                    className="group relative flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
                  >
                    {/* Position & OVR Badges */}
                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border shadow-sm ${getCategoryColor(
                          slotDef.category
                        )}`}
                      >
                        {slotDef.role}
                      </span>
                      {player && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${getOvrColor(
                            player.ovr || 70
                          )}`}
                        >
                          {player.ovr || 70}
                        </span>
                      )}
                    </div>

                    {/* Circular Player Avatar / Shirt Node */}
                    <div
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-xl transition-all ${
                        player
                          ? isInjured
                            ? 'bg-red-950/90 border-red-500 shadow-red-900/50'
                            : fitness < 70
                            ? 'bg-amber-950/90 border-amber-500 shadow-amber-900/50'
                            : 'bg-slate-900/90 border-emerald-400 group-hover:border-white shadow-emerald-950/60'
                          : 'bg-slate-900/80 border-dashed border-slate-500 text-slate-500'
                      }`}
                    >
                      {player ? (
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="text-sm font-black text-white leading-none">
                            {player.number ?? player.shirtNumber ?? slotDef.slotIndex}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Empty</span>
                      )}

                      {/* Status indicator badge (Fitness / Injury) */}
                      {player && (
                        <div className="absolute -bottom-1 -right-1">
                          {isInjured ? (
                            <span className="w-4 h-4 rounded-full bg-red-600 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                              +
                            </span>
                          ) : fitness < 70 ? (
                            <span className="w-4 h-4 rounded-full bg-amber-500 border border-slate-900 flex items-center justify-center text-[7px] font-bold text-black">
                              ⚡
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-slate-900" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Player Name Pill */}
                    <div className="mt-1 max-w-[84px] truncate bg-slate-950/90 border border-slate-700/80 rounded-md px-1.5 py-0.5 text-center shadow-lg group-hover:border-emerald-400">
                      <span className="text-[10px] font-bold text-white truncate block">
                        {player ? player.name.split(' ').pop() : 'Unassigned'}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Substitutes Bench & Squad Pool */}
        <div className="xl:col-span-5 space-y-6">
          {/* 7 Substitutes (Bench) Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  7
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Matchday Substitutes Bench
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    7 subs available for in-game substitutions & rotation
                  </p>
                </div>
              </div>
            </div>

            {/* List of 7 Bench Subs */}
            <div className="space-y-2.5 mt-3">
              {BENCH_SUBSTITUTE_SLOTS.map((subDef) => {
                const subSlot = substitutes.find((s) => s.slotNumber === subDef.slotNumber);
                const player = subSlot?.player;
                const fitness = player ? getFitnessPercentage(player) : 100;
                const isInjured =
                  player &&
                  (player.isInjured ||
                    player.healthStatus === 'injured' ||
                    (player.injuryWeeksRemaining !== undefined && player.injuryWeeksRemaining > 0));

                return (
                  <div
                    key={`bench_slot_${subDef.slotNumber}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      player
                        ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-dashed border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400">
                          SUB {subDef.subIndex}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1 py-0.2 rounded border ${getCategoryColor(
                            subDef.suggestedCategory
                          )}`}
                        >
                          {subDef.suggestedCategory}
                        </span>
                      </div>

                      {player ? (
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">
                              {player.name}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full ${getOvrColor(
                                player.ovr || 70
                              )}`}
                            >
                              {player.ovr || 70}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>#{player.number ?? player.shirtNumber ?? subDef.slotNumber}</span>
                            <span>•</span>
                            <span className="text-emerald-400">{player.subPosition || player.position}</span>
                            <span>•</span>
                            <span className="truncate">{player.playStyle || 'Balanced'}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-500 italic">
                          Empty Sub Slot
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => subSlot && setSelectedSlotToSwap(subSlot)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-blue-400" />
                      <span>Swap</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reserves & Additional Squad Members */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Reserves Pool ({reserves.filter((r) => r.player).length} Players)
                </h4>
              </div>
              <span className="text-xs text-slate-400">Slots 19–35</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 mt-3 pr-1">
              {reserves
                .filter((r) => r.player)
                .map((rSlot) => {
                  const player = rSlot.player!;
                  return (
                    <div
                      key={`reserve_slot_${rSlot.slotNumber}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-black text-slate-400">
                          #{rSlot.slotNumber}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-white truncate">
                              {player.name}
                            </span>
                            <span
                              className={`text-[9px] px-1 rounded-full ${getOvrColor(
                                player.ovr || 70
                              )}`}
                            >
                              {player.ovr || 70}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {player.subPosition || player.position} • {player.playStyle || 'Balanced'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedSlotToSwap(rSlot)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium rounded flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-purple-400" />
                        <span>Swap</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* SWAP PLAYER MODAL */}
      {selectedSlotToSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Swap Squad Player</h3>
                  <p className="text-xs text-slate-400">
                    Select any player or spot below to swap with{' '}
                    <span className="text-white font-bold">
                      Slot #{selectedSlotToSwap.slotNumber}{' '}
                      {selectedSlotToSwap.player ? `(${selectedSlotToSwap.player.name})` : '(Empty Spot)'}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlotToSwap(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* List of candidate target slots */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Choose Target Player:
              </div>

              {(team.squadSaveFile?.squad || [])
                .filter((s) => s.slotNumber !== selectedSlotToSwap.slotNumber)
                .map((targetSlot) => {
                  const p = targetSlot.player;
                  const isStarter = targetSlot.slotNumber <= 11;
                  const isSub = targetSlot.slotNumber >= 12 && targetSlot.slotNumber <= 18;

                  return (
                    <button
                      key={`swap_target_${targetSlot.slotNumber}`}
                      type="button"
                      onClick={() => handleExecuteSwap(targetSlot.slotNumber)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-emerald-500 hover:bg-slate-900 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex flex-col items-center w-14">
                          <span className="text-[10px] font-black text-slate-400">
                            #{targetSlot.slotNumber}
                          </span>
                          <span
                            className={`text-[9px] font-black px-1 py-0.2 rounded border ${
                              isStarter
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isSub
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {isStarter ? 'STARTER' : isSub ? 'BENCH' : 'RESERVE'}
                          </span>
                        </div>

                        {p ? (
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                                {p.name}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full ${getOvrColor(
                                  p.ovr || 70
                                )}`}
                              >
                                {p.ovr || 70}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 block mt-0.5">
                              {p.subPosition || p.position} • {p.playStyle || 'Balanced'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 italic">
                            Empty Slot #{targetSlot.slotNumber}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Swap here</span>
                        <span>→</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
