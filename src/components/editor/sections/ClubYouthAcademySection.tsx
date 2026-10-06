import React, { useState } from 'react';
import { EditorTeamData } from '../../../types/leagueEditor';
import { PlayerCardData } from '../../../types';
import { addPlayerToSquadGroup } from '../../../utils/squadSaveFileSystem';
import { Sparkles, Trophy, Compass, Star, UserPlus, Check } from 'lucide-react';

interface ClubYouthAcademySectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

const ACADEMY_TIERS: { tier: 1 | 2 | 3 | 4 | 5; label: string; desc: string; badge: string }[] = [
  { tier: 1, label: 'Grassroots Pitch', desc: 'Basic regional training park with local community volunteers.', badge: 'bg-slate-800 text-slate-300' },
  { tier: 2, label: 'Regional Training Center', desc: 'Dedicated youth development facilities and licensed instructors.', badge: 'bg-blue-950 text-blue-300 border-blue-800' },
  { tier: 3, label: 'Advanced Academy Ground', desc: 'High-standard gym, video analysis room, and scout network.', badge: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  { tier: 4, label: 'Elite Youth Center', desc: 'State-of-the-art campus, modern dorms, and biomechanics lab.', badge: 'bg-purple-950 text-purple-300 border-purple-800' },
  { tier: 5, label: 'World-Class (La Masia Tier)', desc: 'Legendary talent incubator producing generational Ballon d’Or prodigies.', badge: 'bg-amber-950 text-amber-300 border-amber-800' },
];

export const ClubYouthAcademySection: React.FC<ClubYouthAcademySectionProps> = ({
  team,
  onUpdate,
  showToast = () => {},
}) => {
  const academy = team.youthAcademy || {
    tier: 3,
    developmentFocus: 'balanced',
    scoutingRegion: team.countryName || 'Domestic',
    facilitiesRating: 75,
  };

  const updateAcademy = (updates: Partial<typeof academy>) => {
    onUpdate((prev) => ({
      ...prev,
      youthAcademy: {
        ...academy,
        ...updates,
      },
    }));
  };

  const handleGenerateTrialist = () => {
    const res = addPlayerToSquadGroup(team, 'u17');
    if (res.error) {
      showToast(res.error);
    } else if (res.updatedTeam) {
      onUpdate(res.updatedTeam);
      showToast(`Scouted and promoted a new youth academy trialist into the U17 squad!`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 10
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Sparkles className="w-7 h-7 text-amber-400" />
            YOUTH ACADEMY & TALENT INCUBATOR
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure youth training complex tiers, tactical coaching focus, regional scouting networks, and recruit youth trialists.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateTrialist}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4 fill-slate-950" />
          Scout Youth Trialist
        </button>
      </div>

      {/* ACADEMY TIER LEVEL SELECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Academy Infrastructure Tier (1 to 5)
          </h3>
          <span className="text-xs font-mono font-bold text-amber-400">
            Tier {academy.tier} Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ACADEMY_TIERS.map((t) => {
            const isSelected = academy.tier === t.tier;
            return (
              <div
                key={t.tier}
                onClick={() => {
                  updateAcademy({ tier: t.tier });
                  showToast(`Youth Academy upgraded to ${t.label}!`);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 shadow-xl ring-1 ring-amber-500/50'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${t.badge}`}>
                      TIER {t.tier}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                  </div>
                  <h4 className="text-sm font-black text-white">{t.label}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DEVELOPMENT FOCUS & SCOUTING REGIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Star className="w-4 h-4 text-cyan-400" />
            Curriculum Focus
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['technical', 'physical', 'tactical', 'balanced'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => updateAcademy({ developmentFocus: f })}
                className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                  academy.developmentFocus === f
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f} Focus
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            Primary Scouting Pipeline
          </label>
          <input
            type="text"
            value={academy.scoutingRegion || ''}
            onChange={(e) => updateAcademy({ scoutingRegion: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none"
            placeholder="e.g. Domestic, South America, West Africa, Global"
          />
        </div>
      </div>
    </div>
  );
};
