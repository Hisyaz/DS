import React from 'react';
import { EditorTeamData } from '../../../types/leagueEditor';
import { StartingXITacticalEditor } from '../../StartingXITacticalEditor';
import { Users } from 'lucide-react';

interface ClubStartingXISectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubStartingXISection: React.FC<ClubStartingXISectionProps> = ({
  team,
  onUpdate,
  showToast = () => {},
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 03
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Users className="w-7 h-7 text-emerald-400" />
            STARTING XI & TACTICAL LINEUP
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure match formation, 11 starting pitch slots, 7 bench substitutes, player role taxonomy, and auto-optimization.
          </p>
        </div>
      </div>

      {/* STARTING XI TACTICAL PITCH COMPONENT */}
      <StartingXITacticalEditor
        team={team}
        onUpdateTeam={(updated) => onUpdate(updated)}
        showToast={showToast}
      />
    </div>
  );
};
