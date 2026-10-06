import React from 'react';
import { EditorTeamData, LeagueDatabase, LeagueData } from '../../../types/leagueEditor';
import { CustomEmblem } from '../../CustomEmblem';
import { EmblemShape, EmblemMode } from '../../../types';
import { Shield, Palette, MapPin, Swords, Trophy, Sparkles, Hash } from 'lucide-react';

interface ClubIdentitySectionProps {
  team: EditorTeamData;
  leagueDb?: LeagueDatabase;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

const EMBLEM_SHAPES: { id: EmblemShape; label: string }[] = [
  { id: 'crested-shield', label: 'Crested Shield' },
  { id: 'crown-shield', label: 'Royal Crown' },
  { id: 'flame-shield', label: 'Flame Shield' },
  { id: 'star-shield', label: 'Star Shield' },
  { id: 'circle', label: 'Circle Crest' },
  { id: 'diamond', label: 'Diamond Badge' },
  { id: 'barcelona', label: 'Classic Shield' },
  { id: 'real-madrid', label: 'Crown Crest' },
  { id: 'liverpool', label: 'Heritage Crest' },
  { id: 'arrow', label: 'Arrow Badge' },
  { id: 'square', label: 'Modern Square' },
];

const PRESET_COLORS = [
  '#dc2626', '#b91c1c', '#ea580c', '#d97706', '#eab308',
  '#16a34a', '#059669', '#0d9488', '#0284c7', '#2563eb',
  '#1d4ed8', '#4f46e5', '#7c3aed', '#9333ea', '#c026d3',
  '#db2777', '#e11d48', '#0f172a', '#334155', '#ffffff',
];

export const ClubIdentitySection: React.FC<ClubIdentitySectionProps> = ({
  team,
  leagueDb,
  onUpdate,
}) => {
  const currentLeague = team.leagueId && leagueDb?.leagues ? leagueDb.leagues[team.leagueId] : null;
  const allLeagues = leagueDb?.leagues ? (Object.values(leagueDb.leagues) as LeagueData[]) : [];

  // Candidate rival clubs in the same league
  const rivalOptions = currentLeague && leagueDb?.teams
    ? (currentLeague.teamIds || [])
        .filter((tid) => tid !== team.id)
        .map((tid) => leagueDb.teams[tid])
        .filter(Boolean)
    : [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 01
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Shield className="w-7 h-7 text-indigo-400" />
            CLUB IDENTITY & EMBLEM
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure primary club name, abbreviation, city, badge architecture, primary rivalries, and official club colors.
          </p>
        </div>

        {/* Live Crest Showcase Card */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-5 py-3.5 rounded-2xl shadow-xl">
          <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center p-1.5 shadow-inner">
            <CustomEmblem emblem={team.emblem} size="lg" />
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400">ACTIVE CREST</div>
            <div className="text-base font-black text-white">{team.name}</div>
            <div className="text-xs font-mono font-bold text-cyan-400">
              {team.shortName || '---'} • {team.city || 'City Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* CORE IDENTITY INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Club Name */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Full Club Name
          </label>
          <input
            type="text"
            value={team.name}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-white focus:border-cyan-500 focus:outline-none transition shadow-inner"
            placeholder="e.g. Manchester United, FC Barcelona"
          />
        </div>

        {/* Short Code */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            Short Code (3-4 Letters)
          </label>
          <input
            type="text"
            maxLength={4}
            value={team.shortName || ''}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                shortName: e.target.value.toUpperCase(),
              }))
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-black text-white uppercase font-mono focus:border-cyan-500 focus:outline-none transition shadow-inner"
            placeholder="e.g. ARS, RMA, PSG"
          />
        </div>

        {/* Home City */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            Home City / Region
          </label>
          <input
            type="text"
            value={team.city || ''}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                city: e.target.value,
              }))
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none transition shadow-inner"
            placeholder="e.g. Madrid, London, Buenos Aires"
          />
        </div>

        {/* League Assignment */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            League Assignment
          </label>
          <select
            value={team.leagueId || ''}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                leagueId: e.target.value,
              }))
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none transition shadow-inner cursor-pointer"
          >
            {allLeagues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.countryName || l.countryCode})
              </option>
            ))}
          </select>
        </div>

        {/* Primary Rival */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-red-400" />
            Primary Rival Club
          </label>
          <select
            value={(team.rivals && team.rivals[0]) || ''}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                rivals: e.target.value ? [e.target.value] : [],
              }))
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-cyan-500 focus:outline-none transition shadow-inner cursor-pointer"
          >
            <option value="">-- None Assigned --</option>
            {rivalOptions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.city || 'Club'})
              </option>
            ))}
          </select>
        </div>

        {/* Overall Rating Calibration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Club Overall Rating (OVR)
            </label>
            <span className="text-sm font-black font-mono text-cyan-300">
              {team.overallRating || team.ovr || 75} OVR
            </span>
          </div>
          <input
            type="range"
            min={45}
            max={99}
            value={team.overallRating || team.ovr || 75}
            onChange={(e) => {
              const val = Number(e.target.value);
              onUpdate((prev) => ({
                ...prev,
                overallRating: val,
                ovr: val,
              }));
            }}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* EMBLEM CREST STUDIO */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-black text-white uppercase tracking-wide">
            Emblem Badge & Color Palette
          </h3>
        </div>

        {/* Badge Shapes Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Badge Geometry & Frame
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {EMBLEM_SHAPES.map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() =>
                  onUpdate((prev) => ({
                    ...prev,
                    emblem: {
                      shape: shape.id,
                      color1: prev.emblem?.color1 || '#1e3a8a',
                      color2: prev.emblem?.color2 || '#f59e0b',
                      mode: prev.emblem?.mode || '1',
                    },
                  }))
                }
                className={`px-3 py-2.5 rounded-xl text-xs font-bold text-center border transition-all active:scale-95 cursor-pointer ${
                  team.emblem?.shape === shape.id
                    ? 'bg-cyan-600/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color 1 & Color 2 Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          {/* Color 1 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Primary Club Color (Color 1)
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {team.emblem?.color1 || '#1e3a8a'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={team.emblem?.color1 || '#1e3a8a'}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    emblem: {
                      shape: prev.emblem?.shape || 'crown-shield',
                      color1: e.target.value,
                      color2: prev.emblem?.color2 || '#f59e0b',
                      mode: prev.emblem?.mode || '1',
                    },
                  }))
                }
                className="w-12 h-12 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-1"
              />
              <div className="flex-1 flex flex-wrap gap-1.5">
                {PRESET_COLORS.slice(0, 10).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        emblem: {
                          shape: prev.emblem?.shape || 'crown-shield',
                          color1: c,
                          color2: prev.emblem?.color2 || '#f59e0b',
                          mode: prev.emblem?.mode || '1',
                        },
                      }))
                    }
                    className="w-6 h-6 rounded-lg border border-slate-700 hover:scale-110 transition cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Color 2 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Secondary Accent Color (Color 2)
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {team.emblem?.color2 || '#f59e0b'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={team.emblem?.color2 || '#f59e0b'}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    emblem: {
                      shape: prev.emblem?.shape || 'crown-shield',
                      color1: prev.emblem?.color1 || '#1e3a8a',
                      color2: e.target.value,
                      mode: prev.emblem?.mode || '1',
                    },
                  }))
                }
                className="w-12 h-12 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-1"
              />
              <div className="flex-1 flex flex-wrap gap-1.5">
                {PRESET_COLORS.slice(10, 20).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        emblem: {
                          shape: prev.emblem?.shape || 'crown-shield',
                          color1: prev.emblem?.color1 || '#1e3a8a',
                          color2: c,
                          mode: prev.emblem?.mode || '1',
                        },
                      }))
                    }
                    className="w-6 h-6 rounded-lg border border-slate-700 hover:scale-110 transition cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
