import React from 'react';
import { EditorTeamData } from '../../../types/leagueEditor';
import { TeamFinancesEditor } from '../../TeamFinancesEditor';
import { DollarSign } from 'lucide-react';

interface ClubEconomySectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubEconomySection: React.FC<ClubEconomySectionProps> = ({
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
            SECTION 07
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <DollarSign className="w-7 h-7 text-emerald-400" />
            CLUB ECONOMY & FINANCES
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure club transfer warchest, wage budget limits, commercial sponsors, stadium gate revenues, and ownership stability models.
          </p>
        </div>
      </div>

      {/* TEAM FINANCES COMPONENT */}
      <TeamFinancesEditor
        team={team}
        onUpdateTeam={(updater) => {
          onUpdate((prev) => updater(prev));
        }}
        showToast={showToast}
      />
    </div>
  );
};
