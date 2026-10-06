import React, { useState } from 'react';
import { EditorTeamData } from '../../../types/leagueEditor';
import { KitConfig, KitPattern, KitCollar, SponsorDesignConfig, SponsorWritingStyle, SponsorBorderStyle } from '../../../types';
import { KitRenderer } from '../../KitRenderer';
import { PlayerKitPreview } from '../../PlayerKitPreview';
import { resolveEffectiveSponsor } from '../../../utils/uniformSponsorSystem';
import { Shirt, Palette, Sparkles, Type, Check, RefreshCw } from 'lucide-react';

interface ClubKitSectionProps {
  team: EditorTeamData;
  onUpdate: (updater: EditorTeamData | ((prev: EditorTeamData) => EditorTeamData)) => void;
  showToast?: (msg: string) => void;
}

const KIT_PATTERNS: { id: KitPattern; label: string }[] = [
  { id: 'solid', label: 'Solid Classic' },
  { id: 'stripes', label: 'Vertical Stripes' },
  { id: 'hoops', label: 'Horizontal Hoops' },
  { id: 'halves', label: 'Half & Half' },
  { id: 'sash', label: 'Diagonal Sash' },
  { id: 'raglan-shoulders', label: 'Raglan Sleeves' },
  { id: 'gradient', label: 'Smooth Gradient' },
  { id: 'checkered', label: 'Checkered Squares' },
  { id: 'diagonal', label: 'Diagonal Split' },
  { id: 'solid-line', label: 'Solid Chest Line' },
  { id: 'two-colors', label: 'Two Colors' },
  { id: 'horizontal-middle-strip', label: 'Middle Stripe' },
];

const KIT_COLLARS: { id: KitCollar; label: string }[] = [
  { id: 'crew', label: 'Crew Neck' },
  { id: 'v-neck', label: 'V-Neck' },
  { id: 'polo', label: 'Polo Buttoned' },
];

const PRESET_COLORS = [
  '#ffffff', '#0f172a', '#1e3a8a', '#2563eb', '#0284c7',
  '#0d9488', '#16a34a', '#eab308', '#d97706', '#dc2626',
  '#b91c1c', '#7c3aed', '#9333ea', '#db2777', '#334155',
];

export const ClubKitSection: React.FC<ClubKitSectionProps> = ({ team, onUpdate }) => {
  const [selectedSlot, setSelectedSlot] = useState<'home' | 'away' | 'third'>('home');
  const [previewTab, setPreviewTab] = useState<'jersey' | 'on_player'>('jersey');

  const activeKit: KitConfig = (() => {
    if (selectedSlot === 'away') {
      return (
        team.awayKit || {
          color1: '#ffffff',
          color2: team.kit?.color1 || '#1e3a8a',
          pattern: 'solid',
          collar: 'crew',
          style: 'normal',
        }
      );
    }
    if (selectedSlot === 'third') {
      return (
        team.thirdKit || {
          color1: '#0f172a',
          color2: '#f59e0b',
          pattern: 'raglan-shoulders',
          collar: 'v-neck',
          style: 'normal',
        }
      );
    }
    return (
      team.kit || {
        color1: '#1e3a8a',
        color2: '#f59e0b',
        pattern: 'solid',
        collar: 'crew',
        style: 'normal',
      }
    );
  })();

  const updateActiveKit = (updates: Partial<KitConfig>) => {
    onUpdate((prev) => {
      if (selectedSlot === 'away') {
        const current = prev.awayKit || {
          color1: '#ffffff',
          color2: prev.kit?.color1 || '#1e3a8a',
          pattern: 'solid',
          collar: 'crew',
          style: 'normal',
        };
        return { ...prev, awayKit: { ...current, ...updates } };
      }
      if (selectedSlot === 'third') {
        const current = prev.thirdKit || {
          color1: '#0f172a',
          color2: '#f59e0b',
          pattern: 'raglan-shoulders',
          collar: 'v-neck',
          style: 'normal',
        };
        return { ...prev, thirdKit: { ...current, ...updates } };
      }
      const current = prev.kit || {
        color1: '#1e3a8a',
        color2: '#f59e0b',
        pattern: 'solid',
        collar: 'crew',
        style: 'normal',
      };
      return { ...prev, kit: { ...current, ...updates } };
    });
  };

  const activeSponsor: SponsorDesignConfig = resolveEffectiveSponsor(activeKit, team) || {
    name: team.name,
    writingStyle: 'bold',
    letterColor: '#ffffff',
    borderStyle: 'none',
    borderColor: '#000000',
    enabled: true,
  };

  const updateSponsor = (updates: Partial<SponsorDesignConfig>) => {
    const updatedSponsor: SponsorDesignConfig = {
      ...activeSponsor,
      ...updates,
    };
    updateActiveKit({ sponsor: updatedSponsor });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-4">
      {/* SECTION BANNER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-mono">
            SECTION 02
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 mt-1">
            <Shirt className="w-7 h-7 text-pink-400" />
            KIT & UNIFORM STUDIO
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Design home, away, and third kit configurations, collar silhouettes, shirt patterns, official chest sponsors, and live kit previews.
          </p>
        </div>

        {/* Home / Away / Third Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-lg">
          {(['home', 'away', 'third'] as const).map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                selectedSlot === slot
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {slot} Kit
            </button>
          ))}
        </div>
      </div>

      {/* TWO-COLUMN STUDIO LAYOUT: VISUAL PREVIEW ON LEFT, CONTROLS ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PREVIEW COLUMN */}
        <div className="lg:col-span-5 flex flex-col items-center bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          {/* Toggle between 2D Jersey vs On-Player */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setPreviewTab('jersey')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                previewTab === 'jersey'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Jersey Flat
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('on_player')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                previewTab === 'on_player'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              On-Player Card
            </button>
          </div>

          {previewTab === 'jersey' ? (
            <div className="py-6 flex flex-col items-center justify-center">
              <KitRenderer
                kit={activeKit}
                emblem={team.emblem}
                team={team}
                size="xl"
                showSponsor={activeSponsor.enabled}
              />
              <div className="mt-4 text-center">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  {selectedSlot.toUpperCase()} KIT — {activeKit.collar} • {activeKit.pattern}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-2 flex justify-center w-full">
              <PlayerKitPreview
                kit={activeKit}
                emblem={team.emblem || { shape: 'crown-shield', color1: '#1e3a8a', color2: '#f59e0b', mode: '1' }}
                teamName={team.name}
                shortName={team.shortName}
                team={team}
              />
            </div>
          )}
        </div>

        {/* CONTROLS COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          {/* Collar & Pattern */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              Pattern & Collar Architecture
            </h3>

            {/* Collar style */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">Collar Type</label>
              <div className="grid grid-cols-3 gap-2">
                {KIT_COLLARS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => updateActiveKit({ collar: col.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      activeKit.collar === col.id
                        ? 'bg-cyan-600/20 border-cyan-400 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase">Shirt Pattern</label>
              <div className="grid grid-cols-3 gap-2">
                {KIT_PATTERNS.map((pat) => (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => updateActiveKit({ pattern: pat.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      activeKit.pattern === pat.id
                        ? 'bg-cyan-600/20 border-cyan-400 text-white shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color 1 & 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Kit Color 1</span>
                  <span className="text-xs font-mono text-slate-300">{activeKit.color1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeKit.color1}
                    onChange={(e) => updateActiveKit({ color1: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-1"
                  />
                  <div className="flex flex-wrap gap-1">
                    {PRESET_COLORS.slice(0, 6).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateActiveKit({ color1: c })}
                        className="w-5 h-5 rounded border border-slate-700 hover:scale-110 transition"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase">Kit Color 2</span>
                  <span className="text-xs font-mono text-slate-300">{activeKit.color2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeKit.color2}
                    onChange={(e) => updateActiveKit({ color2: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-1"
                  />
                  <div className="flex flex-wrap gap-1">
                    {PRESET_COLORS.slice(6, 12).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateActiveKit({ color2: c })}
                        className="w-5 h-5 rounded border border-slate-700 hover:scale-110 transition"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SPONSOR DESIGN STUDIO */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-400" />
                Chest Sponsor Design
              </h3>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSponsor.enabled}
                  onChange={(e) => updateSponsor({ enabled: e.target.checked })}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                Display Sponsor
              </label>
            </div>

            {activeSponsor.enabled && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Sponsor Text / Brand
                  </label>
                  <input
                    type="text"
                    value={activeSponsor.name || ''}
                    onChange={(e) => updateSponsor({ name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-black text-white uppercase focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. EMIRATES, SPOTIFY, JEEP"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      Writing Typography
                    </label>
                    <select
                      value={activeSponsor.writingStyle || 'bold'}
                      onChange={(e) =>
                        updateSponsor({ writingStyle: e.target.value as SponsorWritingStyle })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-emerald-500"
                    >
                      <option value="bold">Bold Impact</option>
                      <option value="modern">Modern Sans</option>
                      <option value="classic">Classic Serif</option>
                      <option value="script">Calligraphic Script</option>
                      <option value="condensed">Condensed Tracked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      Text Letter Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeSponsor.letterColor || '#ffffff'}
                        onChange={(e) => updateSponsor({ letterColor: e.target.value })}
                        className="w-8 h-8 rounded-lg bg-transparent border border-slate-700 cursor-pointer p-0.5"
                      />
                      <span className="text-xs font-mono text-slate-300">
                        {activeSponsor.letterColor || '#ffffff'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
