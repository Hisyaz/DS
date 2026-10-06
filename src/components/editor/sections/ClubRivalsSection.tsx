import React, { useState } from 'react';
import { EditorTeamData, LeagueDatabase } from '../../../types/leagueEditor';
import { Swords, Flame, Plus, Trash2, Shield, AlertTriangle } from 'lucide-react';

interface ClubRivalsSectionProps {
  team: EditorTeamData;
  leagueDb: LeagueDatabase;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubRivalsSection: React.FC<ClubRivalsSectionProps> = ({
  team,
  leagueDb,
  onUpdate,
  showToast = () => {},
}) => {
  const [selectedRivalId, setSelectedRivalId] = useState<string>('');
  const currentRivals: string[] = team.rivals || [];

  const otherTeamsInDb = Object.values(leagueDb.teams).filter(
    (t) => t.id !== team.id
  );

  const handleAddRival = () => {
    if (!selectedRivalId) return;
    if (currentRivals.includes(selectedRivalId)) {
      showToast('Team is already registered as a rival!');
      return;
    }
    if (currentRivals.length >= 5) {
      showToast('Maximum of 5 fierce rivals allowed.');
      return;
    }

    const rivalTeam = leagueDb.teams[selectedRivalId];
    const updated = [...currentRivals, selectedRivalId];

    onUpdate((prev) => ({
      ...prev,
      rivals: updated,
    }));

    showToast(`Added ${rivalTeam?.name || selectedRivalId} to rivalries list!`);
    setSelectedRivalId('');
  };

  const handleRemoveRival = (rivalId: string) => {
    const rivalTeam = leagueDb.teams[rivalId];
    const updated = currentRivals.filter((id) => id !== rivalId);

    onUpdate((prev) => ({
      ...prev,
      rivals: updated,
    }));

    showToast(`Removed ${rivalTeam?.name || rivalId} from rivals.`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 12
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Swords className="w-7 h-7 text-red-500" />
            DERBY RIVALS & FEUDS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Designate up to 5 intense local derby foes and historic continental adversaries for dynamic derby atmospheric boosts and heated match commentary.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 border border-red-900/60 px-3 py-1.5 rounded-xl">
          {currentRivals.length}/5 Rivals Configured
        </span>
      </div>

      {/* ADD RIVAL SELECTOR */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Add Rival Team
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedRivalId}
            onChange={(e) => setSelectedRivalId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-red-500 cursor-pointer"
          >
            <option value="">-- Choose Rival Club --</option>
            {otherTeamsInDb.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.countryCode}) • {t.city || 'Club'}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!selectedRivalId || currentRivals.length >= 5}
            onClick={handleAddRival}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition cursor-pointer shadow-lg ${
              !selectedRivalId || currentRivals.length >= 5
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 active:scale-95'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Rival
          </button>
        </div>
      </div>

      {/* CURRENT RIVALS LIST */}
      <div className="space-y-3">
        {currentRivals.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-2">
            <Flame className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-400">No Derbies or Rivals Registered</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add fierce rival clubs above to ignite intense matchday crowds, fiery press conferences, and heightened derby tension.
            </p>
          </div>
        ) : (
          currentRivals.map((rivalId) => {
            const rival = leagueDb.teams[rivalId];
            return (
              <div
                key={rivalId}
                className="bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-2xl p-4 flex items-center justify-between transition-all shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 bg-red-950/80 border border-red-500/30 rounded-xl text-red-400 shrink-0">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <span>{rival ? rival.name : rivalId}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                        DERBY
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {rival?.city || 'Local Adversary'} • {rival?.countryCode || team.countryCode}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveRival(rivalId)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
