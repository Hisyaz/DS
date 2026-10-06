import React from 'react';
import { StageConfig, StageType } from '../../types/competitionEditor';
import { Plus, Trash2, ArrowUp, ArrowDown, Settings2, Layers } from 'lucide-react';

interface StageFormatEditorProps {
  stages: StageConfig[];
  onChangeStages: (stages: StageConfig[]) => void;
}

export const StageFormatEditor: React.FC<StageFormatEditorProps> = ({
  stages,
  onChangeStages,
}) => {
  const handleAddStage = () => {
    const newStage: StageConfig = {
      id: `stg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: 'Group Stage',
      stageType: 'group_stage',
      order: stages.length + 1,
      numGroups: 4,
      teamsPerGroup: 4,
      advancePerGroup: 2,
    };
    onChangeStages([...stages, newStage]);
  };

  const handleUpdateStage = (index: number, updated: StageConfig) => {
    const newStages = [...stages];
    newStages[index] = updated;
    onChangeStages(newStages);
  };

  const handleRemoveStage = (index: number) => {
    const newStages = stages
      .filter((_, i) => i !== index)
      .map((stg, i) => ({ ...stg, order: i + 1 }));
    onChangeStages(newStages);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stages.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newStages = [...stages];
    const temp = newStages[index];
    newStages[index] = newStages[targetIndex];
    newStages[targetIndex] = temp;

    // Recalculate order numbers
    const reordered = newStages.map((stg, i) => ({ ...stg, order: i + 1 }));
    onChangeStages(reordered);
  };

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>COMPETITION FORMAT & STAGES</span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-mono">
              {stages.length} Stages Configured
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            Construct custom tournament structures (Group Stage, Round of 16, Two-legged Knockouts, Finals, etc.).
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddStage}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD STAGE</span>
        </button>
      </div>

      {stages.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-2">
          <Settings2 className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400">No competition stages defined.</p>
          <p className="text-[11px] text-slate-500">
            Add stages like Group Stage, Quarter-Finals, and Final to define how matches progress during simulation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((stg, idx) => (
            <div
              key={stg.id || idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-3 transition-all"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-black text-xs flex items-center justify-center">
                    {stg.order || idx + 1}
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    STAGE #{idx + 1}: {stg.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveStage(idx, 'up')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors"
                    title="Move Stage Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === stages.length - 1}
                    onClick={() => handleMoveStage(idx, 'down')}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors"
                    title="Move Stage Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveStage(idx)}
                    className="p-1 rounded bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/60 transition-colors ml-1"
                    title="Remove Stage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stage Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    STAGE DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    value={stg.name}
                    onChange={(e) => handleUpdateStage(idx, { ...stg, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500"
                    placeholder="e.g. Group Stage, Quarter-Finals, Final"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    STAGE STRUCTURE TYPE
                  </label>
                  <select
                    value={stg.stageType}
                    onChange={(e) => {
                      const st = e.target.value as StageType;
                      handleUpdateStage(idx, { ...stg, stageType: st });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500"
                  >
                    <option value="group_stage">Group Stage (Groups of N)</option>
                    <option value="round_of_32">Round of 32</option>
                    <option value="round_of_16">Round of 16</option>
                    <option value="quarter_finals">Quarter-Finals</option>
                    <option value="semi_finals">Semi-Finals</option>
                    <option value="third_place">Third Place Match</option>
                    <option value="final">Grand Final</option>
                    <option value="preliminary_round">Preliminary / Qualification Round</option>
                    <option value="league_table">League Table (Points Standings)</option>
                    <option value="single_round_robin">Single Round Robin</option>
                    <option value="double_round_robin">Double Round Robin (Home & Away)</option>
                    <option value="knockout_single">Knockout Single Match</option>
                    <option value="knockout_two_legged">Knockout Two-Legged (Home & Away)</option>
                  </select>
                </div>
              </div>

              {/* Specific Stage Options based on Stage Type */}
              {stg.stageType === 'group_stage' && (
                <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">NUMBER OF GROUPS</label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={stg.numGroups || 4}
                      onChange={(e) =>
                        handleUpdateStage(idx, { ...stg, numGroups: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">TEAMS PER GROUP</label>
                    <input
                      type="number"
                      min={2}
                      max={8}
                      value={stg.teamsPerGroup || 4}
                      onChange={(e) =>
                        handleUpdateStage(idx, { ...stg, teamsPerGroup: parseInt(e.target.value) || 2 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">ADVANCE PER GROUP</label>
                    <input
                      type="number"
                      min={1}
                      max={4}
                      value={stg.advancePerGroup || 2}
                      onChange={(e) =>
                        handleUpdateStage(idx, { ...stg, advancePerGroup: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Stage Toggles */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={stg.isHomeAndAway || false}
                    onChange={(e) => handleUpdateStage(idx, { ...stg, isHomeAndAway: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Home & Away Legs</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={stg.hasExtraTime ?? true}
                    onChange={(e) => handleUpdateStage(idx, { ...stg, hasExtraTime: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Extra Time Allowed</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={stg.hasPenaltyShootout ?? true}
                    onChange={(e) => handleUpdateStage(idx, { ...stg, hasPenaltyShootout: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>Penalty Shootout</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
