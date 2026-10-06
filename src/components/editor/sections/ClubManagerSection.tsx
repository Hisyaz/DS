import React, { useState } from 'react';
import { EditorTeamData, ManagerData, ManagerTacticConfig } from '../../../types/leagueEditor';
import { createDefaultManager } from '../../../utils/tacticalSystem';
import { TacticalPitchEditor } from '../../TacticalPitchEditor';
import { Briefcase, Sliders, Activity, Shield, Flame, Compass } from 'lucide-react';

interface ClubManagerSectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubManagerSection: React.FC<ClubManagerSectionProps> = ({
  team,
  onUpdate,
  showToast = () => {},
}) => {
  const [activeTacticTab, setActiveTacticTab] = useState<'primary' | 'secondary'>('primary');

  const manager: ManagerData =
    team.manager || createDefaultManager(team.name, team.countryCode);

  const updateManager = (updates: Partial<ManagerData>) => {
    onUpdate((prev) => ({
      ...prev,
      manager: { ...manager, ...updates },
    }));
  };

  const activeTactic: ManagerTacticConfig =
    activeTacticTab === 'primary'
      ? manager.primaryTactic
      : manager.secondaryTactic || manager.primaryTactic;

  const handleTacticUpdate = (updatedTactic: ManagerTacticConfig) => {
    if (activeTacticTab === 'primary') {
      updateManager({ primaryTactic: updatedTactic });
    } else {
      updateManager({ secondaryTactic: updatedTactic });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 06
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Briefcase className="w-7 h-7 text-purple-400" />
            MANAGER PROFILE & TACTICAL PHILOSOPHY
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure head coach biometrics, primary playstyle, tactical philosophy sliders, and interactive 10-zone field tactics.
          </p>
        </div>

        {/* Tactic Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTacticTab('primary')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTacticTab === 'primary'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Primary Tactic
          </button>
          <button
            type="button"
            onClick={() => setActiveTacticTab('secondary')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTacticTab === 'secondary'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Secondary Tactic
          </button>
        </div>
      </div>

      {/* MANAGER BIOMETRICS & PLAYSTYLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Head Coach Name
          </label>
          <input
            type="text"
            value={manager.name}
            onChange={(e) => updateManager({ name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-white focus:border-purple-500 focus:outline-none"
            placeholder="e.g. Pep Guardiola, Carlo Ancelotti"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Age & Experience
          </label>
          <input
            type="number"
            min={30}
            max={85}
            value={manager.age ?? 45}
            onChange={(e) => updateManager({ age: parseInt(e.target.value) || 45 })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-white focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Nationality
          </label>
          <input
            type="text"
            value={manager.nationality}
            onChange={(e) => updateManager({ nationality: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-purple-500 focus:outline-none"
            placeholder="e.g. Spain, Italy, Germany"
          />
        </div>
      </div>

      {/* TACTICAL PITCH & ZONE EDITOR */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-5 h-5 text-purple-400" />
          {activeTacticTab === 'primary' ? 'Primary' : 'Secondary'} Tactical System
        </h3>

        <TacticalPitchEditor
          tactic={activeTactic}
          title={activeTacticTab === 'primary' ? 'Primary Formation & Roles' : 'Secondary Formation & Roles'}
          onChange={handleTacticUpdate}
        />
      </div>
    </div>
  );
};
