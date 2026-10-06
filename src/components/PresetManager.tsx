import React from 'react';
import { PlayerCardData } from '../types';
import { PRESET_PLAYERS, getCardTier } from '../constants';
import { Download, Upload, Trophy, Sparkles, Lock } from 'lucide-react';

interface PresetManagerProps {
  onSelectPreset: (player: PlayerCardData) => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activePlayerId?: string;
  isExporting?: boolean;
  careerMode?: 'unique_career' | 'play_as_legend' | 'editor';
  legendsList?: PlayerCardData[];
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  onSelectPreset,
  onExportPng,
  onExportJson,
  onImportJson,
  activePlayerId,
  isExporting = false,
  careerMode = 'unique_career',
  legendsList,
}) => {
  const prodigyPreset = PRESET_PLAYERS.find((p) => p.id === 'prodigy') || PRESET_PLAYERS[0];
  const legendaryPresets = legendsList || PRESET_PLAYERS.filter((p) => p.id !== 'prodigy');

  const isProdigyActive = activePlayerId === 'prodigy' || activePlayerId?.startsWith('prospect');

  const showProdigySection = careerMode === 'unique_career' || careerMode === 'editor';
  const showLegendarySection = careerMode === 'play_as_legend' || careerMode === 'editor';

  return (
    <div className="w-full space-y-4 pt-2">
      {/* Quick Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          Presets & Export
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportPng}
            disabled={isExporting}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-900" />
            {isExporting ? 'Exporting...' : 'PNG'}
          </button>
          <button
            type="button"
            onClick={onExportJson}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Download JSON card configuration"
          >
            Save JSON
          </button>
          <label className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" />
            Load
            <input
              type="file"
              accept=".json"
              onChange={onImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* UNIQUE CAREER (NEW PRODIGY) SEPARATE OPTION */}
      {showProdigySection && (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => onSelectPreset(prodigyPreset)}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
              isProdigyActive
                ? 'bg-slate-800 border-white text-white shadow-sm'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-white text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                40
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  NEW PRODIGY (Unique Career)
                  <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 border border-slate-700 text-[9px] rounded font-semibold">
                    Custom Starter
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  40 OVR White Card • Dynamic Development
                </p>
              </div>
            </div>
            <div className="text-[11px] font-bold text-slate-300 whitespace-nowrap pl-2">
              {isProdigyActive ? 'Active' : 'Select'}
            </div>
          </button>
        </div>
      )}

      {/* LEGENDARY PRESETS SEPARATE SECTION */}
      {showLegendarySection && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-slate-400" />
              Legendary Stars
            </span>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" /> Fixed Potential
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {legendaryPresets.map((preset) => {
              const isActive = activePlayerId === preset.id;
              const tier = getCardTier(preset.ovr);
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition border cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 border-white text-white shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded font-black text-xs flex items-center justify-center shrink-0 ${
                      tier === 'goat'
                        ? 'bg-white text-slate-950'
                        : tier === 'legendary'
                        ? 'bg-amber-400 text-slate-950'
                        : tier === 'gold'
                        ? 'bg-yellow-400 text-slate-950'
                        : tier === 'silver'
                        ? 'bg-slate-300 text-slate-950'
                        : tier === 'bronze'
                        ? 'bg-amber-800 text-white'
                        : 'bg-slate-200 text-slate-950'
                    }`}
                  >
                    {preset.ovr}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate flex items-center justify-between gap-1">
                      <span className="truncate">{preset.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {preset.nationality?.code || 'NAT'} • {preset.club}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
