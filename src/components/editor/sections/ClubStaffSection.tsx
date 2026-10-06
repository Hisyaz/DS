import React from 'react';
import { EditorTeamData } from '../../../types/leagueEditor';
import { UserCheck, Activity, Compass, HeartPulse, Sparkles } from 'lucide-react';

interface ClubStaffSectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubStaffSection: React.FC<ClubStaffSectionProps> = ({
  team,
  onUpdate,
  showToast = () => {},
}) => {
  const staff = team.staff || {
    assistantManager: {
      name: `${team.name} Assistant Coach`,
      nationality: team.countryName || 'Europe',
      rating: 78,
    },
    fitnessCoach: {
      name: 'Head Performance Coach',
      rating: 80,
    },
    chiefScout: {
      name: 'Director of Global Scouting',
      rating: 82,
    },
    headPhysio: {
      name: 'Chief Medical Officer',
      rating: 79,
    },
  };

  const updateStaff = (updates: Partial<typeof staff>) => {
    onUpdate((prev) => ({
      ...prev,
      staff: {
        ...staff,
        ...updates,
      },
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 09
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <UserCheck className="w-7 h-7 text-indigo-400" />
            COACHING & MEDICAL STAFF
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure technical assistants, physical performance trainers, global recruitment scouts, and medical rehabilitation experts.
          </p>
        </div>
      </div>

      {/* STAFF CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assistant Manager */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Assistant Manager
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Tactics & Team Briefings
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
              {staff.assistantManager?.rating || 75} OVR
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name</label>
              <input
                type="text"
                value={staff.assistantManager?.name || ''}
                onChange={(e) =>
                  updateStaff({
                    assistantManager: {
                      ...staff.assistantManager,
                      name: e.target.value,
                      nationality: staff.assistantManager?.nationality || 'Europe',
                      rating: staff.assistantManager?.rating || 75,
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Tactical Rating</span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {staff.assistantManager?.rating || 75}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={staff.assistantManager?.rating || 75}
                onChange={(e) =>
                  updateStaff({
                    assistantManager: {
                      ...staff.assistantManager,
                      name: staff.assistantManager?.name || '',
                      nationality: staff.assistantManager?.nationality || 'Europe',
                      rating: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Head Fitness Coach */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Head Fitness Coach
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Conditioning & Stamina
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              {staff.fitnessCoach?.rating || 75} OVR
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name</label>
              <input
                type="text"
                value={staff.fitnessCoach?.name || ''}
                onChange={(e) =>
                  updateStaff({
                    fitnessCoach: {
                      ...staff.fitnessCoach,
                      name: e.target.value,
                      rating: staff.fitnessCoach?.rating || 75,
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Conditioning Skill</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {staff.fitnessCoach?.rating || 75}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={staff.fitnessCoach?.rating || 75}
                onChange={(e) =>
                  updateStaff({
                    fitnessCoach: {
                      ...staff.fitnessCoach,
                      name: staff.fitnessCoach?.name || '',
                      rating: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Chief Scout */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Chief Recruitment Scout
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Talent Discovery & Analysis
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              {staff.chiefScout?.rating || 75} OVR
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name</label>
              <input
                type="text"
                value={staff.chiefScout?.name || ''}
                onChange={(e) =>
                  updateStaff({
                    chiefScout: {
                      ...staff.chiefScout,
                      name: e.target.value,
                      rating: staff.chiefScout?.rating || 75,
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Scouting Network</span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {staff.chiefScout?.rating || 75}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={staff.chiefScout?.rating || 75}
                onChange={(e) =>
                  updateStaff({
                    chiefScout: {
                      ...staff.chiefScout,
                      name: staff.chiefScout?.name || '',
                      rating: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Head Physiotherapist */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-400">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Head Physiotherapist
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Injury Prevention & Rehab
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
              {staff.headPhysio?.rating || 75} OVR
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name</label>
              <input
                type="text"
                value={staff.headPhysio?.name || ''}
                onChange={(e) =>
                  updateStaff({
                    headPhysio: {
                      ...staff.headPhysio,
                      name: e.target.value,
                      rating: staff.headPhysio?.rating || 75,
                    },
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-rose-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Rehab Skill</span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  {staff.headPhysio?.rating || 75}
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={staff.headPhysio?.rating || 75}
                onChange={(e) =>
                  updateStaff({
                    headPhysio: {
                      ...staff.headPhysio,
                      name: staff.headPhysio?.name || '',
                      rating: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
