import React, { useState } from 'react';
import { LeagueDesignConfig, CompetitionTrophyConfig } from '../types/leagueEditor';
import { EmblemConfig } from '../types';
import { Trophy, Shield, Swords, LayoutGrid, Award, ShieldAlert, ListOrdered, Sparkles, Check, ChevronRight, Info } from 'lucide-react';
import { getLeagueThemeStyles, getLeagueTextStyles, LEAGUE_COLOR_MAP } from '../utils/leagueThemeHelper';
import { CustomEmblem } from './CustomEmblem';
import { useLanguage } from '../context/LanguageContext';

interface LeagueUiPreviewProps {
  leagueName: string;
  design: LeagueDesignConfig;
  trophy?: CompetitionTrophyConfig;
  emblem?: EmblemConfig;
  activePreviewMode?: 'all' | 'ui_design' | 'scoreboard' | 'competition' | 'trophy' | 'emblem';
}

export const LeagueUiPreview: React.FC<LeagueUiPreviewProps> = ({
  leagueName,
  design,
  trophy,
  emblem,
  activePreviewMode = 'all',
}) => {
  const { t } = useLanguage();
  const [selectedSubTab, setSelectedSubTab] = useState<'ui_showcase' | 'scoreboard' | 'competition' | 'trophy' | 'emblem'>(
    activePreviewMode === 'ui_design' ? 'ui_showcase' : 'scoreboard'
  );

  const theme = getLeagueThemeStyles(design);
  const textStyles = getLeagueTextStyles(design);

  const currentMode = activePreviewMode !== 'all' && activePreviewMode !== 'ui_design' ? activePreviewMode : selectedSubTab;

  return (
    <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 shadow-2xl">
      {/* Contextual Header & Sub-tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-1.5 text-sky-400 font-bold tracking-wider">
          <Swords className="w-4 h-4 text-sky-400" />
          LIVE LEAGUE UI PREVIEW
        </span>

        {activePreviewMode === 'all' || activePreviewMode === 'ui_design' ? (
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setSelectedSubTab('ui_showcase')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 ${
                currentMode === 'ui_showcase' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              UI Elements
            </button>
            <button
              onClick={() => setSelectedSubTab('scoreboard')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                currentMode === 'scoreboard' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Scoreboard
            </button>
            <button
              onClick={() => setSelectedSubTab('competition')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                currentMode === 'competition' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Standings
            </button>
            {trophy && (
              <button
                onClick={() => setSelectedSubTab('trophy')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  currentMode === 'trophy' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Trophy
              </button>
            )}
            {emblem && (
              <button
                onClick={() => setSelectedSubTab('emblem')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  currentMode === 'emblem' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Emblem
              </button>
            )}
          </div>
        ) : (
          <span className="text-[10px] bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
            Viewing: {activePreviewMode}
          </span>
        )}
      </div>

      {/* Mode 0: COMPLETE UI DESIGN SHOWCASE (Section 9 Requirements) */}
      {currentMode === 'ui_showcase' && (
        <div
          className="p-5 rounded-2xl border transition-all duration-300 space-y-5"
          style={{
            backgroundImage: theme.backgroundCss,
            borderColor: theme.panelBorderColor,
            boxShadow: theme.panelShadow,
          }}
        >
          {/* 1. Header Component */}
          <div
            className={`p-3 border flex items-center justify-between ${theme.panelRadiusClass}`}
            style={{
              backgroundColor: `${theme.primaryHex}25`,
              borderColor: theme.panelBorderColor,
            }}
          >
            <div className="flex items-center gap-2.5">
              {emblem ? (
                <CustomEmblem config={emblem} size="sm" />
              ) : (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                  style={{ backgroundColor: theme.primaryHex, color: '#ffffff' }}
                >
                  <Trophy className="w-4 h-4" />
                </div>
              )}
              <div>
                <h3 className={`text-sm font-black ${theme.fontStyleClass}`} style={getLeagueTextStyles(design, 14)}>
                  {leagueName || 'League Name'}
                </h3>
                <p className="text-[10px] opacity-80" style={{ color: textStyles.textColorHex }}>
                  Official League UI Header
                </p>
              </div>
            </div>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: theme.accentHex,
                color: '#000000',
                borderColor: '#ffffff50',
              }}
            >
              ACTIVE LEAGUE UI
            </span>
          </div>

          {/* 2. Menu Panel & Information Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Menu Panel */}
            <div
              className={`p-4 border space-y-3 ${theme.panelRadiusClass}`}
              style={{
                backgroundColor: theme.panelBgTint,
                borderColor: theme.panelBorderColor,
                boxShadow: theme.panelShadow,
              }}
            >
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${theme.primaryHex}30` }}>
                <span className={`text-xs font-bold ${theme.fontStyleClass}`} style={getLeagueTextStyles(design, 12)}>
                  MENU PANEL
                </span>
                <span className="text-[10px] font-mono text-slate-400">Panel Style: {theme.panelStyle}</span>
              </div>

              {/* Buttons: Normal & Selected State */}
              <div className="space-y-2">
                {/* Normal Button */}
                <button
                  type="button"
                  className={`w-full px-3.5 py-2 border text-xs font-bold flex items-center justify-between transition-all ${theme.buttonRadiusClass}`}
                  style={{
                    backgroundColor: `${theme.primaryHex}30`,
                    borderColor: `${theme.primaryHex}60`,
                    color: textStyles.textColorHex,
                  }}
                >
                  <span>Standard Button</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                {/* Selected Button */}
                <button
                  type="button"
                  className={`w-full px-3.5 py-2 border text-xs font-black flex items-center justify-between transition-all ${theme.buttonRadiusClass}`}
                  style={{
                    backgroundColor: theme.accentHex,
                    borderColor: '#ffffff',
                    color: '#000000',
                    boxShadow: theme.buttonGlowStyle,
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Selected Button (Active State)
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded">ACTIVE</span>
                </button>
              </div>
            </div>

            {/* Information Panel */}
            <div
              className={`p-4 border space-y-3 ${theme.panelRadiusClass}`}
              style={{
                backgroundColor: theme.panelBgTint,
                borderColor: theme.panelBorderColor,
                boxShadow: theme.panelShadow,
              }}
            >
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${theme.primaryHex}30` }}>
                <span className={`text-xs font-bold ${theme.fontStyleClass} flex items-center gap-1.5`} style={getLeagueTextStyles(design, 12)}>
                  <Info className="w-3.5 h-3.5" style={{ color: theme.accentHex }} />
                  INFORMATION PANEL
                </span>
                <span className="text-[10px] font-mono text-slate-400">Outline: {textStyles.style}</span>
              </div>

              {/* Text & Outlined Text Demonstration */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Standard Text:</span>
                  <p className={`${theme.fontStyleClass}`} style={{ color: textStyles.textColorHex }}>
                    Welcome to the official matchday hub for {leagueName}.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">
                    Outlined Text (Style: <strong className="text-sky-300 capitalize">{textStyles.style}</strong> • Strength: <strong className="text-amber-300">{textStyles.strength}%</strong>):
                  </span>
                  <p className={`text-sm font-black ${theme.fontStyleClass}`} style={getLeagueTextStyles(design, 14)}>
                    {leagueName.toUpperCase()} CHAMPIONSHIP 2026
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. League Table Showcase */}
          <div
            className={`p-4 border space-y-2 ${theme.panelRadiusClass}`}
            style={{
              backgroundColor: theme.panelBgTint,
              borderColor: theme.panelBorderColor,
            }}
          >
            <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: `${theme.primaryHex}30` }}>
              <span className={`text-xs font-bold ${theme.fontStyleClass}`} style={getLeagueTextStyles(design, 12)}>
                LEAGUE TABLE PANEL
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Matchday 10</span>
            </div>

            <div className="grid grid-cols-12 text-[11px] font-bold p-2 rounded bg-black/40 text-slate-300">
              <span className="col-span-1">#</span>
              <span className="col-span-6">CLUB</span>
              <span className="col-span-2 text-center">P</span>
              <span className="col-span-3 text-right">PTS</span>
            </div>

            <div className="grid grid-cols-12 text-[11px] p-2 rounded items-center" style={{ backgroundColor: `${theme.primaryHex}25`, borderLeft: `3px solid ${theme.accentHex}` }}>
              <span className="col-span-1 font-black text-amber-400">1</span>
              <span className={`col-span-6 font-bold ${theme.fontStyleClass}`} style={getLeagueTextStyles(design, 11)}>
                Current Team (Leader)
              </span>
              <span className="col-span-2 text-center text-slate-300">10</span>
              <span className="col-span-3 text-right font-black text-white">25</span>
            </div>

            <div className="grid grid-cols-12 text-[11px] p-2 rounded items-center bg-black/20 text-slate-300">
              <span className="col-span-1 font-bold">2</span>
              <span className={`col-span-6 font-medium ${theme.fontStyleClass}`} style={{ color: textStyles.textColorHex }}>
                Challenger FC
              </span>
              <span className="col-span-2 text-center text-slate-400">10</span>
              <span className="col-span-3 text-right font-bold text-slate-200">22</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 1: SCOREBOARD PREVIEW */}
      {currentMode === 'scoreboard' && (
        <div
          className={`p-4 transition-all duration-300 relative overflow-hidden ${theme.panelStyleClass} ${theme.shapeRadiusClass}`}
          style={{
            backgroundColor: theme.secondaryHex,
            borderColor: theme.primaryHex,
          }}
        >
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: theme.accentHex }} />

          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 mt-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: theme.accentHex }} />
              <span className={`text-xs ${theme.fontStyleClass}`} style={getLeagueTextStyles(design, 12)}>
                {leagueName || 'League Competition'}
              </span>
            </div>
            <span
              className={`text-[9px] px-2.5 py-0.5 border ${theme.shapeRadiusClass} font-bold`}
              style={{
                backgroundColor: theme.primaryHex,
                borderColor: theme.accentHex,
                color: theme.primary.contrastText,
              }}
            >
              MATCHDAY 12
            </span>
          </div>

          {/* Teams & Live Score Display */}
          <div className="flex items-center justify-between gap-2 py-2">
            {/* Home Team */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className={`text-xs ${theme.fontStyleClass} text-right`} style={getLeagueTextStyles(design, 12)}>
                MANCHESTER FC
              </span>
              <div
                className={`w-8 h-8 ${theme.shapeRadiusClass} flex items-center justify-center shadow-lg border border-white/20`}
                style={{ backgroundColor: theme.primaryHex }}
              >
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Score Box */}
            <div
              className={`px-3.5 py-1.5 border text-center shadow-inner flex items-center gap-2 ${theme.shapeRadiusClass}`}
              style={{
                backgroundColor: '#020617',
                borderColor: theme.accentHex,
              }}
            >
              <span className="text-base font-black font-mono text-white">2</span>
              <span className="text-xs text-slate-500 font-mono">:</span>
              <span className="text-base font-black font-mono text-white">1</span>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-2 flex-1 justify-start">
              <div
                className={`w-8 h-8 ${theme.shapeRadiusClass} flex items-center justify-center shadow-lg border border-white/20`}
                style={{ backgroundColor: theme.accentHex }}
              >
                <Shield className="w-4 h-4 text-slate-900" />
              </div>
              <span className={`text-xs ${theme.fontStyleClass} text-left`} style={getLeagueTextStyles(design, 12)}>
                MADRID ATHLETIC
              </span>
            </div>
          </div>

          {/* Text Contrast Notice */}
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Shape: <strong className="text-slate-200 capitalize">{design.shape.replace('_', ' ')}</strong></span>
            <span className="flex items-center gap-1 font-mono">
              Text Contrast: <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: textStyles.textColorHex, color: textStyles.textOutlineHex }}>AAA Standard</span>
            </span>
          </div>
        </div>
      )}

      {/* Mode 2: COMPETITION SCREEN PREVIEW */}
      {currentMode === 'competition' && (
        <div
          className={`p-4 transition-all duration-300 relative ${theme.panelStyleClass} ${theme.shapeRadiusClass}`}
          style={{
            backgroundColor: theme.secondaryHex,
            borderColor: theme.primaryHex,
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" style={{ color: theme.accentHex }} />
              <span className={`text-xs ${theme.fontStyleClass}`} style={getLeagueTextStyles(design, 12)}>
                {leagueName || 'League'} Standings Screen
              </span>
            </div>
            <span className="text-[10px] font-mono opacity-80" style={{ color: theme.primary.contrastText }}>
              2026 / 2027
            </span>
          </div>

          {/* Standings Table Rows */}
          <div className="space-y-1.5 text-xs font-mono">
            {[
              { pos: 1, name: 'Manchester City', p: 12, w: 9, d: 2, l: 1, pts: 29 },
              { pos: 2, name: 'Arsenal FC', p: 12, w: 8, d: 3, l: 1, pts: 27 },
              { pos: 3, name: 'Liverpool FC', p: 12, w: 7, d: 4, l: 1, pts: 25 },
              { pos: 4, name: 'Chelsea FC', p: 12, w: 6, d: 3, l: 3, pts: 21 },
            ].map((row) => (
              <div
                key={row.pos}
                className={`flex items-center justify-between p-2 ${theme.shapeRadiusClass} transition-all`}
                style={{
                  backgroundColor: row.pos === 1 ? theme.primaryHex + '33' : 'rgba(15, 23, 42, 0.6)',
                  borderLeft: row.pos <= 3 ? `3px solid ${theme.accentHex}` : '3px solid transparent',
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 ${theme.shapeRadiusClass} text-[10px] flex items-center justify-center font-bold`}
                    style={{
                      backgroundColor: row.pos === 1 ? theme.accentHex : '#1e293b',
                      color: row.pos === 1 ? '#000000' : '#ffffff',
                    }}
                  >
                    {row.pos}
                  </span>
                  <span className={`font-medium ${theme.fontStyleClass}`} style={getLeagueTextStyles(design, 12)}>
                    {row.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-slate-400">{row.p}P</span>
                  <span className="font-bold text-white">{row.pts} PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: TROPHY PREVIEW */}
      {currentMode === 'trophy' && trophy && (
        <div
          className={`p-4 transition-all duration-300 relative text-center flex flex-col items-center justify-center ${theme.panelStyleClass} ${theme.shapeRadiusClass}`}
          style={{
            backgroundColor: theme.secondaryHex,
            borderColor: theme.primaryHex,
          }}
        >
          <div className="relative mb-2 p-4 bg-slate-900/80 rounded-full border border-amber-500/30 shadow-xl">
            <Trophy className="w-12 h-12 text-amber-400 animate-pulse" style={{ color: trophy.ribbonColor || theme.accentHex }} />
            <Award className="w-5 h-5 text-amber-300 absolute -top-1 -right-1" />
          </div>
          <h4 className={`text-sm ${theme.fontStyleClass} font-bold mb-1`} style={getLeagueTextStyles(design, 14)}>
            {trophy.name || 'Official League Trophy'}
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>Metal: <strong className="text-amber-300 capitalize">{trophy.metalTone}</strong></span>
            <span>•</span>
            <span>Type: <strong className="text-slate-200 capitalize">{trophy.iconType}</strong></span>
          </div>
        </div>
      )}

      {/* Mode 4: EMBLEM PREVIEW */}
      {currentMode === 'emblem' && emblem && (
        <div
          className={`p-4 transition-all duration-300 relative text-center flex flex-col items-center justify-center ${theme.panelStyleClass} ${theme.shapeRadiusClass}`}
          style={{
            backgroundColor: theme.secondaryHex,
            borderColor: theme.primaryHex,
          }}
        >
          <div className="mb-2 p-2 bg-slate-900/80 rounded-2xl border border-slate-700 shadow-xl">
            <CustomEmblem config={emblem} size="lg" />
          </div>
          <h4 className={`text-xs ${theme.fontStyleClass} font-bold`} style={getLeagueTextStyles(design, 12)}>
            {leagueName || 'League Emblem'}
          </h4>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            Shape: {emblem.shape} | Primary: {emblem.color1}
          </span>
        </div>
      )}

      {/* Color Scheme Palette Toolbar Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
          Palette:
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryHex }} />
            <span className="text-[10px] text-slate-300">Main</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.secondaryHex }} />
            <span className="text-[10px] text-slate-300">Secondary</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accentHex }} />
            <span className="text-[10px] text-slate-300">Accent</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: textStyles.textColorHex }} />
            <span className="text-[10px] text-slate-300">Text</span>
          </div>
        </div>
      </div>
    </div>
  );
};
