import React from 'react';
import { EditorTeamData, StadiumTier } from '../../../types/leagueEditor';
import { STADIUM_TIERS, ensureTeamStadium } from '../../../utils/stadiumAndKeyRoleSystem';
import { Building2, Check, TrendingUp, Sparkles, MapPin } from 'lucide-react';

interface ClubStadiumSectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

export const ClubStadiumSection: React.FC<ClubStadiumSectionProps> = ({
  team,
  onUpdate,
  showToast = () => {},
}) => {
  const stadium = ensureTeamStadium(team);

  const updateStadium = (updates: Partial<typeof stadium>) => {
    onUpdate((prev) => ({
      ...prev,
      stadium: {
        ...stadium,
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
            SECTION 08
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Building2 className="w-7 h-7 text-emerald-400" />
            STADIUM & HOME GROUND
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure home venue name, tier development scale (Tier 1 Grassroots to Tier 5 Cathedral), seating capacity, and pitch conditions.
          </p>
        </div>

        {/* Live Stadium Badge */}
        <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400">ACTIVE HOME GROUND</div>
            <div className="text-sm font-black text-white">{stadium.name}</div>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {stadium.capacity.toLocaleString()} Seats • Tier {stadium.tier}
            </div>
          </div>
        </div>
      </div>

      {/* STADIUM DETAILS INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Stadium Official Name
          </label>
          <input
            type="text"
            value={stadium.name}
            onChange={(e) => updateStadium({ name: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-white focus:border-emerald-500 focus:outline-none"
            placeholder="e.g. Santiago Bernabéu, Anfield, San Siro"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Seating Capacity
            </label>
            <span className="font-mono text-sm font-black text-emerald-400">
              {stadium.capacity.toLocaleString()} Seats
            </span>
          </div>
          <input
            type="range"
            min={1000}
            max={105000}
            step={500}
            value={stadium.capacity}
            onChange={(e) => updateStadium({ capacity: parseInt(e.target.value) || 1000 })}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex items-center gap-1.5 pt-1">
            {[5000, 20000, 45000, 65000, 85000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateStadium({ capacity: preset })}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 transition cursor-pointer"
              >
                {preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STADIUM TIER DEVELOPMENT SELECTOR (1 to 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Infrastructure & Atmosphere Tier (1 to 5)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Tier 1 = Grassroots • Tier 3 = Iconic Regional • Tier 5 = World Cathedral
          </span>
        </div>

        <div className="space-y-3">
          {([1, 2, 3, 4, 5] as StadiumTier[]).map((tNum) => {
            const info = STADIUM_TIERS[tNum];
            const isSelected = stadium.tier === tNum;

            return (
              <div
                key={tNum}
                onClick={() => {
                  updateStadium({
                    tier: tNum,
                    capacity: info.defaultCapacity,
                  });
                  showToast(`Stadium upgraded to ${info.title} (${info.defaultCapacity.toLocaleString()} seats)`);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500 shadow-xl ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black font-mono px-3 py-1 rounded-lg ${info.badgeColor}`}>
                      TIER {tNum}
                    </span>
                    <h4 className="text-base font-black text-white">{info.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      Range: {info.capacityRange[0].toLocaleString()} - {info.capacityRange[1].toLocaleString()}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-black bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> ACTIVE TIER
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {info.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 border-t border-slate-800">
                  {info.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
