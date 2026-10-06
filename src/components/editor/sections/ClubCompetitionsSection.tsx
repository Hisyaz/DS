import React from 'react';
import { EditorTeamData, LeagueDatabase, LeagueData } from '../../../types/leagueEditor';
import { CONTINENTAL_COMPETITIONS_CATALOG } from '../../../utils/continentalDatabaseSystem';
import { Trophy, Globe, Award, Shield, Check } from 'lucide-react';

interface ClubCompetitionsSectionProps {
  team: EditorTeamData;
  leagueDb: LeagueDatabase;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubCompetitionsSection: React.FC<ClubCompetitionsSectionProps> = ({
  team,
  leagueDb,
  onUpdate,
  showToast = () => {},
}) => {
  const currentLeague: LeagueData | undefined = team.leagueId
    ? leagueDb.leagues[team.leagueId]
    : undefined;
  const allLeagues = Object.values(leagueDb.leagues) as LeagueData[];

  const continentalList = Object.values(CONTINENTAL_COMPETITIONS_CATALOG);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 11
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Trophy className="w-7 h-7 text-sky-400" />
            COMPETITIONS & TOURNAMENT ASSIGNMENTS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Manage domestic championship division, domestic cups, and continental tournament qualification (UCL, UEL, Libertadores, etc.).
          </p>
        </div>
      </div>

      {/* DOMESTIC LEAGUE CARD */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Domestic League Affiliation
              </h3>
              <p className="text-[11px] text-slate-400">
                Primary league structure where this team competes weekly for domestic titles.
              </p>
            </div>
          </div>
          {currentLeague && (
            <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              {currentLeague.divisionTier.toUpperCase()} DIVISION
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Select Primary League
            </label>
            <select
              value={team.leagueId || ''}
              onChange={(e) => {
                const newLid = e.target.value;
                onUpdate((prev) => ({
                  ...prev,
                  leagueId: newLid,
                }));
                showToast(`Transferred club to ${leagueDb.leagues[newLid]?.name || newLid}`);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 cursor-pointer"
            >
              {allLeagues.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.countryName || l.countryCode}) • {l.divisionTier}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white">Domestic Cup Eligible</div>
              <div className="text-[11px] text-slate-400">
                Automatically enrolled in national knockout cup
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              ENROLLED
            </span>
          </div>
        </div>
      </div>

      {/* CONTINENTAL TOURNAMENT ASSIGNMENT */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Continental Tournament Qualification
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct qualification or seed assignment in premier continental championships.
              </p>
            </div>
          </div>
          {team.continentalCompetitionId ? (
            <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-800">
              QUALIFIED: {team.continentalCompetitionId}
            </span>
          ) : (
            <span className="text-xs font-mono text-slate-500">NO CONTINENTAL SLOT</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <div
            onClick={() => {
              onUpdate((prev) => ({ ...prev, continentalCompetitionId: undefined }));
              showToast(`Cleared continental qualification for ${team.name}`);
            }}
            className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
              !team.continentalCompetitionId
                ? 'bg-slate-950 border-cyan-400 text-white shadow'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div>
              <div className="text-xs font-black">None / Domestic Only</div>
              <div className="text-[10px] text-slate-500">No international fixture load</div>
            </div>
            {!team.continentalCompetitionId && <Check className="w-4 h-4 text-cyan-400 stroke-[3]" />}
          </div>

          {continentalList.map((comp) => {
            const isSelected = team.continentalCompetitionId === comp.id;
            return (
              <div
                key={comp.id}
                onClick={() => {
                  onUpdate((prev) => ({ ...prev, continentalCompetitionId: comp.id }));
                  showToast(`Assigned ${team.name} to ${comp.name}!`);
                }}
                className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-950 border-indigo-500 text-white shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-xs font-black text-white">{comp.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {comp.federation} • Tier {comp.tier} ({comp.shortName})
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-400 stroke-[3]" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
