import React, { useState } from 'react';
import {
  ManagerTacticConfig,
  TacticalPositionSetup,
  PlayerRolePosition,
  PlaystyleAssignment,
  FormationType,
  TacticalStyle,
} from '../types/leagueEditor';
import {
  TACTICAL_STYLES,
  FORMATION_LIST,
  TACTICAL_PRESETS,
  TacticalPreset,
  getDefaultTacticalPositions,
  getPlaystylesForRole,
  validateRolePlaystyle,
} from '../utils/tacticalSystem';
import { getPlayStyleDetail } from '../utils/statCalculations';
import { Sliders, Shield, Zap, Target, Users, ChevronUp, ChevronDown, Check, Sparkles } from 'lucide-react';

interface TacticalPitchEditorProps {
  tactic: ManagerTacticConfig;
  title: string;
  onChange: (updatedTactic: ManagerTacticConfig) => void;
}

const ROLES: PlayerRolePosition[] = ['GK', 'LB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

export const TacticalPitchEditor: React.FC<TacticalPitchEditorProps> = ({ tactic, title, onChange }) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(tactic.positions[0]?.slotId || null);

  const handleApplyPreset = (preset: TacticalPreset) => {
    onChange({
      ...tactic,
      formation: preset.formation,
      style: preset.style,
      positions: preset.positions.map((p) => ({ ...p })),
    });
    setSelectedSlotId(preset.positions[0]?.slotId || null);
  };

  const handleFormationChange = (newFormation: FormationType) => {
    const newPositions = getDefaultTacticalPositions(newFormation, tactic.style);
    onChange({
      ...tactic,
      formation: newFormation,
      positions: newPositions,
    });
    setSelectedSlotId(newPositions[0]?.slotId || null);
  };

  const handleStyleChange = (newStyle: TacticalStyle) => {
    const updatedPositions = getDefaultTacticalPositions(tactic.formation, newStyle);
    onChange({
      ...tactic,
      style: newStyle,
      positions: updatedPositions,
    });
  };

  const selectedPosition = tactic.positions.find((p) => p.slotId === selectedSlotId);

  const updateSelectedPosition = (updates: Partial<TacticalPositionSetup>) => {
    if (!selectedSlotId) return;
    const updatedPositions = tactic.positions.map((p) => {
      if (p.slotId === selectedSlotId) {
        return { ...p, ...updates };
      }
      return p;
    });
    onChange({
      ...tactic,
      positions: updatedPositions,
    });
  };

  const handleZoneClick = (row: number, col: number) => {
    if (!selectedSlotId) return;
    updateSelectedPosition({ zoneRow: row, zoneCol: col });
  };

  const activeStyleInfo = TACTICAL_STYLES.find((s) => s.id === tactic.style) || TACTICAL_STYLES[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-xl">
      {/* HEADER & TACTICAL PRESETS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-emerald-400" />
            {title}
          </h4>
          <p className="text-xs text-slate-400">Configure formation layout, style behavior & 10-zone pitch roles.</p>
        </div>

        {/* Formation Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Formation:</span>
          <select
            value={tactic.formation}
            onChange={(e) => handleFormationChange(e.target.value as FormationType)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold font-mono text-emerald-400 focus:border-emerald-500"
          >
            {FORMATION_LIST.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* QUICK PRESET TEMPLATES */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Tactical Blueprints & Presets
          </label>
          <span className="text-[10px] text-slate-400 font-mono">1-Click Tactical Masterplans</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {TACTICAL_PRESETS.map((preset) => {
            const isMatch = tactic.formation === preset.formation && tactic.style === preset.style;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isMatch
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={preset.description}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black truncate">{preset.name}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{preset.formation}</span>
                  <span className="capitalize">{preset.style.replace('_', ' ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TACTICAL STYLE CARDS */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300">Tactical Playstyle Philosophy</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {TACTICAL_STYLES.map((st) => {
            const isSelected = tactic.style === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStyleChange(st.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black truncate">{st.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{st.desc}</p>
              </button>
            );
          })}
        </div>
        <div className="bg-slate-950/80 border border-emerald-500/30 p-2.5 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
          <Shield className="w-4 h-4 shrink-0" />
          <span>
            <strong>AI Match Behavior:</strong> {activeStyleInfo.aiBehavior}
          </span>
        </div>
      </div>

      {/* PITCH EDITOR & PLAYER DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INTERACTIVE 10-ZONE PITCH CANVAS (8 COLS) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center space-y-3">
          <div className="flex items-center justify-between w-full border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h5 className="text-xs font-black uppercase tracking-widest text-emerald-400 font-mono">
                LINEUP VIEW
              </h5>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              10-ZONE FORMATION PITCH
            </span>
          </div>

          <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400 px-1">
            <span>OPPONENT GOAL (TOP)</span>
            <span>OWN GOAL (BOTTOM)</span>
          </div>

          {/* THE SOCCER PITCH */}
          <div className="w-full max-w-sm aspect-[3/4] bg-emerald-950/60 border-2 border-emerald-500/40 rounded-2xl relative p-2 overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Pitch Grass Texture & Lines */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-emerald-950/80 to-emerald-900/40 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500/30 border-t border-dashed border-emerald-500/50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-emerald-500/30 rounded-full pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-12 border-b border-x border-emerald-500/40 rounded-b-xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-14 border-t border-x border-emerald-500/40 rounded-t-xl pointer-events-none" />

            {/* 10 HORIZONTAL ZONE ROWS (Rows 0 to 9) */}
            <div className="relative z-10 w-full h-full grid grid-rows-10 gap-0.5">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((row) => (
                <div key={row} className="grid grid-cols-3 gap-1 relative border-b border-emerald-500/10">
                  {/* Row Zone Indicator */}
                  <span className="absolute left-1 top-0.5 text-[8px] font-mono text-emerald-500/40 pointer-events-none">
                    {row === 9 ? 'GK Zone' : `Zone ${row}`}
                  </span>

                  {[0, 1, 2].map((col) => {
                    {/* Find all players assigned to this zone */}
                    const playersInZone = tactic.positions.filter((p) => p.zoneRow === row && p.zoneCol === col);

                    return (
                      <div
                        key={`${row}-${col}`}
                        onClick={() => handleZoneClick(row, col)}
                        className={`relative rounded flex flex-row items-center justify-center gap-1 p-0.5 transition-colors cursor-pointer border ${
                          selectedPosition?.zoneRow === row && selectedPosition?.zoneCol === col
                            ? 'bg-emerald-500/20 border-emerald-400'
                            : 'border-emerald-500/10 hover:bg-emerald-500/10'
                        }`}
                      >
                        {playersInZone.map((pos) => {
                          const isSelected = selectedSlotId === pos.slotId;
                          const heightShift = (pos.heightOffset || 0) * -3; // offset bias visual shift

                          return (
                            <button
                              key={pos.slotId}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSlotId(pos.slotId);
                              }}
                              style={{ transform: `translateY(${heightShift}px)` }}
                              className={`px-1.5 py-0.5 rounded-full border text-[10px] font-black transition-all flex items-center gap-1 shadow-md shrink-0 ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 border-white scale-110 z-20 shadow-amber-500/50'
                                  : 'bg-slate-900/90 text-emerald-300 border-emerald-500/60 hover:scale-105'
                              }`}
                            >
                              <span className="font-mono">{pos.role}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center italic">
            LINEUP VIEW — Click any zone on the pitch grid to reposition the selected player badge!
          </p>
        </div>

        {/* SELECTED PLAYER SLOT CUSTOMIZER (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
          <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Target className="w-4 h-4 text-amber-400" />
            Player Slot Configuration
          </h5>

          {/* SQUAD LIST QUICK SELECTOR */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Select Slot to Edit</label>
            <div className="grid grid-cols-4 gap-1.5">
              {tactic.positions.map((pos) => {
                const isSel = pos.slotId === selectedSlotId;
                return (
                  <button
                    key={pos.slotId}
                    type="button"
                    onClick={() => setSelectedSlotId(pos.slotId)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      isSel
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black scale-105'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {pos.role}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedPosition ? (
            <div className="space-y-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-amber-400">Slot ID: {selectedPosition.slotId}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  Zone Row {selectedPosition.zoneRow}, Col {selectedPosition.zoneCol}
                </span>
              </div>

              {/* ROLE PICKER */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">Position Role</label>
                <select
                  value={selectedPosition.role}
                  onChange={(e) => {
                    const newRole = e.target.value as PlayerRolePosition;
                    const nextPlaystyle = validateRolePlaystyle(newRole, selectedPosition.playstyle);
                    updateSelectedPosition({ role: newRole, playstyle: nextPlaystyle as PlaystyleAssignment });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:border-amber-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r} Role
                    </option>
                  ))}
                </select>
              </div>

              {/* PLAYSTYLE ASSIGNMENT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-slate-300">Playstyle Instruction</label>
                  <span className="text-[9px] text-amber-400 font-mono">
                    Filtered by {selectedPosition.role}
                  </span>
                </div>
                {(() => {
                  const rolePlaystyles = getPlaystylesForRole(selectedPosition.role);
                  const currentPlaystyle = validateRolePlaystyle(selectedPosition.role, selectedPosition.playstyle);
                  const psDetail = getPlayStyleDetail(selectedPosition.role, currentPlaystyle);

                  return (
                    <div className="space-y-2">
                      <select
                        value={currentPlaystyle}
                        onChange={(e) => updateSelectedPosition({ playstyle: e.target.value as PlaystyleAssignment })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-400 focus:border-amber-500"
                      >
                        {rolePlaystyles.map((ps) => (
                          <option key={ps} value={ps}>
                            {ps}
                          </option>
                        ))}
                      </select>

                      {psDetail && (
                        <div className="p-2.5 bg-slate-950/80 border border-emerald-500/30 rounded-lg text-[10px] space-y-1">
                          <div className="text-emerald-300 font-bold flex items-center justify-between">
                            <span>{psDetail.name}</span>
                            <span className="text-slate-400 font-normal">Compatible with {selectedPosition.role}</span>
                          </div>
                          <p className="text-slate-300 leading-snug">{psDetail.description}</p>
                          <div className="pt-1 flex flex-wrap gap-2 text-slate-400 border-t border-slate-800 text-[9px]">
                            <span>⭐ <strong className="text-slate-200">Modern:</strong> {psDetail.modernExample}</span>
                            <span>🏆 <strong className="text-amber-300">Legend:</strong> {psDetail.legendExample}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* HEIGHT OFFSET BIAS */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  In-Zone Positional Bias (High / Low Line)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedPosition({
                        heightOffset: Math.max(-2, (selectedPosition.heightOffset || 0) - 1),
                      })
                    }
                    className="p-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-emerald-400 font-bold px-2">
                    {selectedPosition.heightOffset === 1
                      ? 'High Advanced (+1)'
                      : selectedPosition.heightOffset === -1
                      ? 'Deep Dropping (-1)'
                      : 'Centered Neutral (0)'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelectedPosition({
                        heightOffset: Math.min(2, (selectedPosition.heightOffset || 0) + 1),
                      })
                    }
                    className="p-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic text-center py-4">No player slot selected.</p>
          )}
        </div>
      </div>
    </div>
  );
};
