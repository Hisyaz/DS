import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy,
  Globe,
  Shield,
  Medal,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Star,
  Flame,
  Award,
  Zap,
  CheckCircle2,
  X,
  TrendingUp,
  Activity,
  Layers,
  Terminal,
  Play,
  RotateCcw,
  RefreshCw,
  Sliders,
  Check,
  Users,
  Search,
  Shirt,
  Info,
  Swords,
} from 'lucide-react';
import {
  getWorldSimulationState,
  syncWorldSimulationToCareerTimeline,
  isPlayerInProClub,
  getWorldSimulationDebugMetrics,
  resetWorldSimulationState,
  resolveAuthoritativeSeasonYear,
  WorldSimulationState,
  WorldLeagueState,
  WorldLeagueStandingRow,
  WorldLeaderboardEntry,
  getCalendarDateForMatchday,
  WorldSimulationDebugMetrics,
} from '../utils/worldSimulationEngine';
import { SimulatedDatabaseMatchResult } from '../utils/databaseMatchSimulationEngine';
import { PlayerCardData, PlayerConfig } from '../types';
import { cleanLeagueName } from '../utils/leagueSanitizer';
import { CONTINENTAL_COMPETITIONS_CATALOG } from '../utils/continentalDatabaseSystem';
import {
  determineContinentalQualifiers,
} from '../utils/continentalQualificationSystem';
import {
  getContinentalTournamentState,
  generateContinentalTournamentDraw,
} from '../utils/continentalTournamentEngine';
import { ContinentalTournamentSeasonState, ContinentalGroup } from '../types/continentalCompetitions';
import { getCareerLeagueDatabase } from '../utils/careerSaveSystem';
import { getEligibleClubsForFederation } from '../utils/continentalDatabaseSystem';
import { ensureTeamSquadSaveFile } from '../utils/squadSaveFileSystem';
import { EditorTeamData } from '../types/leagueEditor';
import {
  getPowerscaleState,
  getClubPowerscaleImpact,
  getNationalTeamPowerscaleImpact,
} from '../utils/powerscaleSystem';
import { ClubPowerscaleProfile } from '../types/powerscale';
import { PowerscaleFavoritesView } from './PowerscaleFavoritesView';
import { WorldResultsDrawsView } from './WorldResultsDrawsView';

interface WorldResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player?: PlayerCardData | PlayerConfig;
  seasonYear?: string;
  currentStage?: string;
  block1Count?: number;
  block2Count?: number;
  activeBlock?: number | null;
}

export const WorldResultsModal: React.FC<WorldResultsModalProps> = ({
  isOpen,
  onClose,
  player,
  seasonYear = '2026/27',
  currentStage,
  block1Count,
  block2Count,
  activeBlock,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'domestic' | 'continental' | 'international' | 'draws' | 'powerscale'>('domestic');

  // Domestic filters
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    if (player?.leagueId) {
      const code = player.leagueId.split('_')[0]?.toUpperCase();
      if (code) return code;
    }
    return 'ENG';
  });
  const [selectedTier, setSelectedTier] = useState<'1st' | '2nd'>(() => {
    if (player?.leagueId?.includes('_d2')) return '2nd';
    return '1st';
  });

  useEffect(() => {
    if (player?.leagueId) {
      const code = player.leagueId.split('_')[0]?.toUpperCase();
      if (code) setSelectedCountry(code);
      if (player.leagueId.includes('_d2')) setSelectedTier('2nd');
      else setSelectedTier('1st');
    }
  }, [player?.leagueId, isOpen]);
  const [domesticSubTab, setDomesticSubTab] = useState<'table' | 'fixtures' | 'leaders' | 'teams'>('table');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedMatchday, setSelectedMatchday] = useState<number>(1);
  const [simulationTick, setSimulationTick] = useState<number>(0);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [inspectingFixture, setInspectingFixture] = useState<SimulatedDatabaseMatchResult | null>(null);
  const [fixtureDetailTeamTab, setFixtureDetailTeamTab] = useState<'home' | 'away'>('home');

  // Continental filters
  const [selectedFederation, setSelectedFederation] = useState<string>('UEFA');
  const [selectedContinentalComp, setSelectedContinentalComp] = useState<string>('UEFA_CL');
  const [continentalSubTab, setContinentalSubTab] = useState<'groups' | 'knockout' | 'fixtures'>('groups');
  const [selectedGroupLetter, setSelectedGroupLetter] = useState<string>('A');
  const [selectedLeagueMatchday, setSelectedLeagueMatchday] = useState<number>(1);

  // International filters
  const [selectedInternationalTier, setSelectedInternationalTier] = useState<'Senior' | 'U20' | 'U17'>('Senior');

  const effectiveSeasonYear = resolveAuthoritativeSeasonYear(player, seasonYear);

  // Synchronize world simulation state to authoritative career timeline
  const worldState: WorldSimulationState = useMemo(() => {
    return syncWorldSimulationToCareerTimeline(
      player,
      effectiveSeasonYear,
      currentStage,
      block1Count,
      block2Count
    );
  }, [effectiveSeasonYear, player, isOpen, currentStage, block1Count, block2Count, simulationTick]);

  // Set default matchday to current simulated matchday on open
  useEffect(() => {
    if (isOpen && worldState.currentCalendarMatchday > 0) {
      setSelectedMatchday(worldState.currentCalendarMatchday);
    }
  }, [isOpen, worldState.currentCalendarMatchday]);

  // Fetch debug metrics
  const debugMetrics: WorldSimulationDebugMetrics = useMemo(() => {
    return getWorldSimulationDebugMetrics(player, effectiveSeasonYear);
  }, [worldState, player, effectiveSeasonYear, simulationTick]);

  const numericYear = useMemo(() => {
    return parseInt(effectiveSeasonYear.split('/')[0], 10) || 2026;
  }, [effectiveSeasonYear]);

  // Load continental tournament state for selected competition
  const continentalState: ContinentalTournamentSeasonState | null = useMemo(() => {
    let state = getContinentalTournamentState(selectedContinentalComp as any, numericYear);
    if (!state && isOpen) {
      // Auto-initialize if not yet drawn using real qualification logic
      const db = getCareerLeagueDatabase();
      const qualifiers = determineContinentalQualifiers(
        selectedContinentalComp as any,
        db,
        [],
        player,
        numericYear
      );
      state = generateContinentalTournamentDraw(selectedContinentalComp as any, numericYear, qualifiers, player?.clubId);
    }
    return state;
  }, [selectedContinentalComp, numericYear, isOpen, player?.clubId, player]);

  const countryList = [
    { code: 'ENG', name: 'England', flag: '🇬🇧', d1Id: 'england_d1', d2Id: 'england_d2' },
    { code: 'ESP', name: 'Spain', flag: '🇪🇸', d1Id: 'spain_d1', d2Id: 'spain_d2' },
    { code: 'ITA', name: 'Italy', flag: '🇮🇹', d1Id: 'italy_d1', d2Id: 'italy_d2' },
    { code: 'GER', name: 'Germany', flag: '🇩🇪', d1Id: 'germany_d1', d2Id: 'germany_d2' },
    { code: 'FR', name: 'France', flag: '🇫🇷', d1Id: 'france_d1', d2Id: 'france_d2' },
    { code: 'POR', name: 'Portugal', flag: '🇵🇹', d1Id: 'portugal_d1', d2Id: 'portugal_d2' },
    { code: 'ARG', name: 'Argentina', flag: '🇦🇷', d1Id: 'argentina_d1', d2Id: 'argentina_d2' },
    { code: 'BRA', name: 'Brazil', flag: '🇧🇷', d1Id: 'brazil_d1', d2Id: 'brazil_d2' },
    { code: 'KSA', name: 'Saudi Arabia', flag: '🇸🇦', d1Id: 'saudi_d1', d2Id: 'saudi_d2' },
  ];

  // Resolve current domestic league
  const activeLeagueId = useMemo(() => {
    const matched = countryList.find((c) => c.code === selectedCountry);
    if (!matched) return 'england_d1';
    return selectedTier === '2nd' ? matched.d2Id : matched.d1Id;
  }, [selectedCountry, selectedTier]);

  const activeLeague: WorldLeagueState | undefined = worldState.leagues[activeLeagueId];

  // Effective matchday view
  const currentSimulatedMd = activeLeague?.currentMatchday || 0;
  const maxMd = activeLeague?.totalMatchdays || 38;
  const viewingMatchday = Math.min(Math.max(1, selectedMatchday), maxMd);

  const matchdayFixtures = useMemo(() => {
    if (!activeLeague) return [];
    return activeLeague.matchdays[viewingMatchday] || [];
  }, [activeLeague, viewingMatchday]);

  // Continental competitions available for chosen federation
  const federationComps = useMemo(() => {
    return Object.values(CONTINENTAL_COMPETITIONS_CATALOG).filter(
      (c) => c.federation === selectedFederation && !c.isSuperCup
    );
  }, [selectedFederation]);

  const selectedGroup = useMemo(() => {
    if (!continentalState?.groups) return null;
    return continentalState.groups.find((g) => g.groupLetter === selectedGroupLetter) || continentalState.groups[0];
  }, [continentalState, selectedGroupLetter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-6xl bg-gradient-to-b from-[#0b1329] via-[#050b18] to-[#02050e] border-4 border-amber-500/80 pixel-bevel-gold rounded-2xl shadow-[0_0_80px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* 32-Bit Arcade Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900/90 border-b-2 border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/60 pixel-bevel-gold flex items-center justify-center text-amber-300 shadow-md">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-arcade font-black text-amber-300 uppercase tracking-wide">
                  WORLD RESULTS & COMPETITIONS
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/60 text-[10px] font-arcade uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Sim: MD {worldState.currentCalendarMatchday || 0}/38 • {worldState.currentCalendarDate || getCalendarDateForMatchday(worldState.currentCalendarMatchday, effectiveSeasonYear)}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Season {effectiveSeasonYear} • Standings, fixtures, scorers, and tournament draws live in sync with your career.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-[11px] font-mono font-semibold text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Career-Synced</span>
            </div>

            <button
              id="btn_close_world_results"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-600 transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 32-Bit Primary Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-2.5 pb-2 bg-slate-950/90 border-b-2 border-slate-800 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="tab-domestic-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => setActiveMainTab('domestic')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-arcade font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'domestic'
                  ? 'bg-amber-500 text-slate-950 border-2 border-amber-300 pixel-bevel-raised shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              DOMESTIC
            </button>
            <button
              id="tab-continental-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => setActiveMainTab('continental')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-arcade font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'continental'
                  ? 'bg-indigo-500 text-slate-950 border-2 border-indigo-200 pixel-bevel-raised shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              CONTINENTAL
            </button>
            <button
              id="tab-international-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => setActiveMainTab('international')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-arcade font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'international'
                  ? 'bg-sky-500 text-slate-950 border-2 border-sky-200 pixel-bevel-raised shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              INTERNATIONAL
            </button>
            <button
              id="tab-draws-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => setActiveMainTab('draws')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-arcade font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'draws'
                  ? 'bg-amber-500 text-slate-950 border-2 border-amber-300 pixel-bevel-raised shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              DRAWS
            </button>
            <button
              id="tab-powerscale-btn"
              type="button"
              data-nav-item
              tabIndex={0}
              onClick={() => setActiveMainTab('powerscale')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-arcade font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'powerscale'
                  ? 'bg-purple-500 text-slate-950 border-2 border-purple-200 pixel-bevel-raised shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              POWERSCALE
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDebugPanel((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                showDebugPanel
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>World Simulation Debug</span>
            </button>
            <div className="text-xs text-slate-400 font-medium hidden md:block">
              Database Players Only • Non-Zero Probability Engine
            </div>
          </div>
        </div>

        {/* ================= WORLD SIMULATION DEBUG PANEL ================= */}
        {showDebugPanel && (
          <div className="mx-6 mt-4 p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 text-slate-200 space-y-4 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>World Simulation Live Telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSimulationTick((t) => t + 1);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh Telemetry
                </button>
                <button
                  onClick={() => {
                    resetWorldSimulationState(seasonYear, undefined, player as any);
                    setSimulationTick((t) => t + 1);
                  }}
                  className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Sim State
                </button>
              </div>
            </div>

            {/* 10 Required World Simulation Telemetry Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Current World Date</span>
                <span className="font-semibold text-emerald-400 truncate block">{debugMetrics.currentWorldDate}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Current Career Date</span>
                <span className="font-semibold text-amber-400 truncate block">{debugMetrics.currentCareerDate}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Season / Matchday</span>
                <span className="font-bold text-slate-100">{debugMetrics.currentSeason} • MD {debugMetrics.currentMatchday}/38</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Simulated Last Advance</span>
                <span className="font-bold text-indigo-400">{debugMetrics.matchesSimulatedThisAdvance} matches</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Total Matches Sim</span>
                <span className="font-bold text-cyan-400">{debugMetrics.totalMatchesSimulated}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Goals Simulated</span>
                <span className="font-bold text-emerald-400">{debugMetrics.totalGoalsSimulated} ⚽</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Assists Simulated</span>
                <span className="font-bold text-sky-400">{debugMetrics.totalAssistsSimulated} 👟</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Ratings Generated</span>
                <span className="font-bold text-purple-400">{debugMetrics.totalRatingsGenerated}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Competitions Updated</span>
                <span className="font-bold text-amber-300">{debugMetrics.competitionsUpdated} leagues</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Sync Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  100% Synchronized
                </span>
              </div>
            </div>

            {/* LAST SIMULATED MATCH BREAKDOWN */}
            {debugMetrics.lastSimulatedMatch && (
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
                  <span className="font-semibold uppercase text-indigo-400">
                    LAST SIMULATED MATCH • {debugMetrics.lastSimulatedMatch.competitionName} (MD {debugMetrics.lastSimulatedMatch.matchday})
                  </span>
                  <span className="font-bold text-amber-400 text-sm">
                    {debugMetrics.lastSimulatedMatch.homeTeam} {debugMetrics.lastSimulatedMatch.score} {debugMetrics.lastSimulatedMatch.awayTeam}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-1">Goals & Assists</span>
                    {debugMetrics.lastSimulatedMatch.goals.length > 0 ? (
                      <div className="space-y-0.5">
                        {debugMetrics.lastSimulatedMatch.goals.map((g, idx) => (
                          <div key={idx} className="text-slate-300 text-[11px] flex items-center gap-1">
                            <span className="text-emerald-400 font-bold">⚽ {g.minute}&apos;</span>
                            <span className="font-medium text-slate-200">{g.scorer}</span>
                            {g.assist && <span className="text-slate-500">(ast. {g.assist})</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">No goals in this fixture (0 - 0)</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase mb-1">Top Performers & Ratings</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {debugMetrics.lastSimulatedMatch.topPerformers.map((p, idx) => (
                        <div key={idx} className="p-1 rounded bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-[10px]">
                          <span className="truncate text-slate-300">{p.name}</span>
                          <span className="font-bold text-amber-400 ml-1">{p.rating}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. DOMESTIC TAB */}
          {activeMainTab === 'domestic' && (
            <div className="space-y-6">
              {/* Country Selection Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {countryList.map((country) => {
                  const isSelected = selectedCountry === country.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country.code);
                        setSelectedMatchday(1);
                      }}
                      className={`px-3 py-1.5 pixel-corners text-xs font-arcade font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black border-2 border-amber-300 pixel-bevel-raised shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-2 border-slate-700'
                      }`}
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* League Tier & View Sub-Toggles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-3 pixel-corners border-2 border-slate-700/80 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400/90 font-arcade uppercase tracking-wider">Division:</span>
                  <div className="inline-flex pixel-corners bg-slate-950 p-1 border-2 border-slate-800">
                    <button
                      onClick={() => setSelectedTier('1st')}
                      className={`px-3 py-1 pixel-corners text-xs font-arcade font-bold transition-all cursor-pointer ${
                        selectedTier === '1st' ? 'bg-amber-500 text-slate-950 pixel-bevel-raised shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      1st Division
                    </button>
                    <button
                      onClick={() => setSelectedTier('2nd')}
                      className={`px-3 py-1 pixel-corners text-xs font-arcade font-bold transition-all cursor-pointer ${
                        selectedTier === '2nd' ? 'bg-amber-500 text-slate-950 pixel-bevel-raised shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      2nd Division
                    </button>
                  </div>
                  {activeLeague && (
                    <span className="text-sm font-arcade font-bold text-amber-300 ml-2 tracking-wide">
                      {activeLeague.name}
                    </span>
                  )}
                </div>

                <div className="inline-flex pixel-corners bg-slate-950 p-1 border-2 border-slate-800 self-end sm:self-auto overflow-x-auto">
                  <button
                    onClick={() => setDomesticSubTab('table')}
                    className={`px-3 py-1 pixel-corners text-xs font-arcade font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      domesticSubTab === 'table' ? 'bg-slate-700 text-amber-300 pixel-bevel-raised shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    STANDINGS TABLE
                  </button>
                  <button
                    onClick={() => setDomesticSubTab('fixtures')}
                    className={`px-3 py-1 pixel-corners text-xs font-arcade font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      domesticSubTab === 'fixtures' ? 'bg-slate-700 text-amber-300 pixel-bevel-raised shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    FIXTURES & RESULTS
                  </button>
                  <button
                    onClick={() => setDomesticSubTab('leaders')}
                    className={`px-3 py-1 pixel-corners text-xs font-arcade font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      domesticSubTab === 'leaders' ? 'bg-slate-700 text-amber-300 pixel-bevel-raised shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    LEADERBOARDS
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedTeamId && activeLeague?.standings[0]?.teamId) {
                        setSelectedTeamId(activeLeague.standings[0].teamId);
                      }
                      setDomesticSubTab('teams');
                    }}
                    className={`px-3 py-1 pixel-corners text-xs font-arcade font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      domesticSubTab === 'teams' ? 'bg-amber-500 text-slate-950 pixel-bevel-raised shadow-sm font-black' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    TEAM INSPECTOR
                  </button>
                </div>
              </div>

              {/* SubTab 1: STANDINGS TABLE */}
              {domesticSubTab === 'table' && (
                <div className="bg-slate-900/80 border-2 border-slate-700/80 pixel-corners overflow-hidden shadow-md">
                  <div className="p-3 bg-slate-950/90 border-b-2 border-slate-800 flex items-center justify-between text-xs text-slate-400 font-arcade">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      Click on any club row to inspect full squad, starting XI, tactics, and form.
                    </span>
                    <span className="font-bold text-amber-300 tracking-wider">
                      {activeLeague?.standings.length || 0} CLUBS COMPETING
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse font-arcade">
                      <thead>
                        <tr className="bg-slate-950 text-amber-400 border-b-2 border-slate-800 font-bold uppercase tracking-wider">
                          <th className="py-3 px-3 text-center w-12">#</th>
                          <th className="py-3 px-4">Club</th>
                          <th className="py-3 px-2 text-center">PL</th>
                          <th className="py-3 px-2 text-center">W</th>
                          <th className="py-3 px-2 text-center">D</th>
                          <th className="py-3 px-2 text-center">L</th>
                          <th className="py-3 px-2 text-center">GF</th>
                          <th className="py-3 px-2 text-center">GA</th>
                          <th className="py-3 px-2 text-center font-bold">GD</th>
                          <th className="py-3 px-3 text-center font-black text-amber-300">PTS</th>
                          <th className="py-3 px-3 text-center">Form</th>
                          <th className="py-3 px-4">Status / Qualification</th>
                          <th className="py-3 px-2 text-center w-16">Inspect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {activeLeague?.standings.map((row) => {
                          const isUserClub = row.isPlayerTeam;
                          return (
                            <tr
                              key={row.teamId}
                              onClick={() => {
                                setSelectedTeamId(row.teamId);
                                setDomesticSubTab('teams');
                              }}
                              className={`transition-colors cursor-pointer group ${
                                isUserClub
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 font-semibold text-amber-200'
                                  : 'hover:bg-slate-800/80 hover:text-slate-100'
                              }`}
                              title={`Click to inspect ${row.teamName}`}
                            >
                              <td className="py-2.5 px-3 text-center font-bold text-slate-400 group-hover:text-amber-400">
                                {row.rank}
                              </td>
                              <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                                <span className="group-hover:text-amber-300 transition-colors">{row.teamName}</span>
                                {isUserClub && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                                    YOU
                                  </span>
                                )}
                                {(() => {
                                  const impact = getClubPowerscaleImpact(row.teamId, row.teamName, activeLeague?.leagueId, seasonYear);
                                  if (impact.tier === 'heavyweight_favorite') {
                                    return (
                                      <span
                                        className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap"
                                        title={`Powerscale Favorite: +${((impact.effectiveModifier - 1) * 100).toFixed(1)}% modifier`}
                                      >
                                        👑 Favorite
                                      </span>
                                    );
                                  } else if (impact.tier === 'title_contender') {
                                    return (
                                      <span
                                        className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap"
                                        title={`Powerscale Contender: +${((impact.effectiveModifier - 1) * 100).toFixed(1)}% modifier`}
                                      >
                                        ⚔️ Contender
                                      </span>
                                    );
                                  } else if (impact.tier === 'promoted_underdog') {
                                    return (
                                      <span
                                        className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap"
                                        title="Powerscale Promoted: -8% First-Season Survival Penalty"
                                      >
                                        🛡️ Promoted (-8%)
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </td>
                              <td className="py-2.5 px-2 text-center">{row.played}</td>
                              <td className="py-2.5 px-2 text-center text-emerald-400">{row.won}</td>
                              <td className="py-2.5 px-2 text-center text-slate-400">{row.drawn}</td>
                              <td className="py-2.5 px-2 text-center text-rose-400">{row.lost}</td>
                              <td className="py-2.5 px-2 text-center">{row.goalsFor}</td>
                              <td className="py-2.5 px-2 text-center">{row.goalsAgainst}</td>
                              <td className="py-2.5 px-2 text-center font-bold">
                                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                              </td>
                              <td className="py-2.5 px-3 text-center font-extrabold text-amber-400 text-sm">
                                {row.points}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="inline-flex items-center gap-1">
                                  {row.form.map((f, i) => (
                                    <span
                                      key={i}
                                      className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center text-slate-950 ${
                                        f === 'W'
                                          ? 'bg-emerald-400'
                                          : f === 'D'
                                          ? 'bg-slate-400'
                                          : 'bg-rose-400'
                                      }`}
                                    >
                                      {f}
                                    </span>
                                  ))}
                                  {row.form.length === 0 && <span className="text-slate-600">-</span>}
                                </div>
                              </td>
                              <td className="py-2.5 px-4">
                                {row.qualificationBadge && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${row.qualificationBadge.badgeClass}`}
                                  >
                                    {row.qualificationBadge.shortLabel}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <span className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-amber-300 group-hover:border-amber-500/50 inline-flex items-center justify-center">
                                  <Search className="w-3 h-3" />
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SubTab 2: FIXTURES & RESULTS */}
              {domesticSubTab === 'fixtures' && (
                <div className="space-y-4">
                  {/* Matchday Selector Toolbar */}
                  <div className="flex items-center justify-between bg-slate-900/90 p-3 pixel-corners border-2 border-slate-700/80">
                    <button
                      disabled={viewingMatchday <= 1}
                      onClick={() => setSelectedMatchday((prev) => Math.max(1, prev - 1))}
                      className="p-2 pixel-corners bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 border border-slate-600 pixel-bevel-raised transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 font-arcade">
                      <span className="text-sm font-bold text-amber-300 tracking-wide uppercase">
                        Matchday {viewingMatchday} of {maxMd}
                      </span>
                      {viewingMatchday <= currentSimulatedMd ? (
                        <span className="px-2 py-0.5 pixel-corners text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/60 uppercase">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 pixel-corners text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <button
                      disabled={viewingMatchday >= maxMd}
                      onClick={() => setSelectedMatchday((prev) => Math.min(maxMd, prev + 1))}
                      className="p-2 pixel-corners bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 border border-slate-600 pixel-bevel-raised transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Matches Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchdayFixtures.map((fix) => {
                      return (
                        <div
                          key={fix.id}
                          onClick={() => {
                            if (fix.isCompleted) setInspectingFixture(fix);
                          }}
                          className={`p-4 pixel-corners border-2 transition-all ${
                            fix.isCompleted ? 'cursor-pointer hover:scale-[1.01]' : ''
                          } ${
                            fix.isPlayerMatch
                              ? 'bg-amber-950/20 border-amber-500/60 pixel-bevel-gold shadow-md'
                              : 'bg-slate-900/80 border-slate-700/70 hover:border-slate-500'
                          }`}
                        >
                          {fix.isPlayerMatch && (
                            <div className="mb-2 flex items-center justify-between font-arcade">
                              <span className="px-2 py-0.5 pixel-corners text-[10px] font-black bg-amber-500 text-slate-950 border border-amber-300">
                                ⭐ YOUR MATCH
                              </span>
                              <span className="text-[10px] text-amber-300">Inspect Stats →</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-3 text-sm font-arcade">
                            <div className="flex-1 text-right font-bold text-slate-200 truncate">
                              {fix.homeTeamName}
                            </div>

                            <div className="px-3 py-1 pixel-corners bg-slate-950 border-2 border-slate-700 font-mono font-black text-amber-300 min-w-[56px] text-center">
                              {fix.isCompleted ? `${fix.homeScore} - ${fix.awayScore}` : 'VS'}
                            </div>

                            <div className="flex-1 text-left font-bold text-slate-200 truncate">
                              {fix.awayTeamName}
                            </div>
                          </div>

                          {/* Scorers / Events Breakdown */}
                          {fix.isCompleted && (fix.homeScorers.length > 0 || fix.awayScorers.length > 0) && (
                            <div className="mt-3 pt-2.5 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                              {fix.homeScorers.map((s, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <span className="text-emerald-400 font-arcade">⚽ {s.minute}&apos;</span>
                                  <span className="text-slate-300 font-medium">{s.name}</span>
                                  {s.assistPlayerName && (
                                    <span className="text-slate-500 text-[11px]">(ast. {s.assistPlayerName})</span>
                                  )}
                                </div>
                              ))}
                              {fix.awayScorers.map((s, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <span className="text-emerald-400 font-arcade">⚽ {s.minute}&apos;</span>
                                  <span className="text-slate-300 font-medium">{s.name}</span>
                                  {s.assistPlayerName && (
                                    <span className="text-slate-500 text-[11px]">(ast. {s.assistPlayerName})</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-2.5 flex items-center justify-between text-[11px] font-arcade">
                            {fix.mvpPlayer ? (
                              <div className="text-amber-400/90 font-medium flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>MVP: {fix.mvpPlayer.name} ({fix.mvpPlayer.rating})</span>
                              </div>
                            ) : <div />}
                            {fix.isCompleted && (
                              <span className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1">
                                Lineups & Stats →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SubTab 3: LEADERBOARDS */}
              {domesticSubTab === 'leaders' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-arcade">
                  {/* Top Scorers */}
                  <div className="bg-slate-900/80 border-2 border-slate-700/80 pixel-corners p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span className="uppercase tracking-wide">Top Goalscorers</span>
                    </div>
                    <div className="space-y-2">
                      {activeLeague?.topScorers.slice(0, 8).map((p) => (
                        <div
                          key={p.playerId}
                          className={`flex items-center justify-between p-2 pixel-corners text-xs border ${
                            p.isUserPlayer ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold' : 'bg-slate-950/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 font-bold text-slate-500">#{p.rank}</span>
                            <div className="truncate font-sans">
                              <div className="font-bold text-slate-100 truncate">{p.playerName}</div>
                              <div className="text-[10px] text-slate-400 truncate">{p.teamName} • {p.subPosition}</div>
                            </div>
                          </div>
                          <span className="font-black text-amber-400 text-sm ml-2">{p.value} ⚽</span>
                        </div>
                      ))}
                      {(!activeLeague || activeLeague.topScorers.length === 0) && (
                        <div className="text-xs text-slate-500 italic text-center py-6">No goals scored yet</div>
                      )}
                    </div>
                  </div>

                  {/* Top Assists */}
                  <div className="bg-slate-900/80 border-2 border-slate-700/80 pixel-corners p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-3">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span className="uppercase tracking-wide">Top Playmakers</span>
                    </div>
                    <div className="space-y-2">
                      {activeLeague?.topAssists.slice(0, 8).map((p) => (
                        <div
                          key={p.playerId}
                          className={`flex items-center justify-between p-2 pixel-corners text-xs border ${
                            p.isUserPlayer ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200 font-bold' : 'bg-slate-950/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 font-bold text-slate-500">#{p.rank}</span>
                            <div className="truncate font-sans">
                              <div className="font-bold text-slate-100 truncate">{p.playerName}</div>
                              <div className="text-[10px] text-slate-400 truncate">{p.teamName} • {p.subPosition}</div>
                            </div>
                          </div>
                          <span className="font-black text-indigo-400 text-sm ml-2">{p.value} 🎯</span>
                        </div>
                      ))}
                      {(!activeLeague || activeLeague.topAssists.length === 0) && (
                        <div className="text-xs text-slate-500 italic text-center py-6">No assists recorded yet</div>
                      )}
                    </div>
                  </div>

                  {/* Top Rated */}
                  <div className="bg-slate-900/80 border-2 border-slate-700/80 pixel-corners p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                      <Star className="w-4 h-4 text-emerald-400" />
                      <span className="uppercase tracking-wide">Top Avg Ratings</span>
                    </div>
                    <div className="space-y-2">
                      {activeLeague?.topRatings.slice(0, 5).map((p) => (
                        <div
                          key={p.playerId}
                          className={`flex items-center justify-between p-2 pixel-corners text-xs border ${
                            p.isUserPlayer ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-bold' : 'bg-slate-950/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 font-bold text-slate-500">#{p.rank}</span>
                            <div className="truncate font-sans">
                              <div className="font-bold text-slate-100 truncate">{p.playerName}</div>
                              <div className="text-[10px] text-slate-400 truncate">{p.teamName} • {p.subPosition} ({p.ovr} OVR)</div>
                            </div>
                          </div>
                          <span className="font-black text-emerald-400 text-sm ml-2">{p.value.toFixed(1)} ⭐</span>
                        </div>
                      ))}
                      {(!activeLeague || activeLeague.topRatings.length === 0) && (
                        <div className="text-xs text-slate-500 italic text-center py-6">Minimum 2 matches required</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SubTab 4: TEAMS & SQUADS INSPECTOR */}
              {domesticSubTab === 'teams' && (() => {
                const db = getCareerLeagueDatabase();
                const leagueTeamList = activeLeague?.standings || [];
                const effectiveTeamId = selectedTeamId || leagueTeamList[0]?.teamId || '';
                const rawTeamData = db.teams ? db.teams[effectiveTeamId] : null;
                const teamData = rawTeamData ? ensureTeamSquadSaveFile(rawTeamData) : null;
                const standingRow = leagueTeamList.find((s) => s.teamId === effectiveTeamId);

                // Collect team's played fixtures this season
                const teamSeasonMatches: SimulatedDatabaseMatchResult[] = [];
                if (activeLeague?.matchdays) {
                  Object.values(activeLeague.matchdays).forEach((mdList) => {
                    mdList.forEach((fix) => {
                      if ((fix.homeTeamId === effectiveTeamId || fix.awayTeamId === effectiveTeamId) && fix.isCompleted) {
                        teamSeasonMatches.push(fix);
                      }
                    });
                  });
                }

                // Squad players
                const allSlots = teamData?.squadSaveFile?.squad || [];
                const startingXI = allSlots.filter((s) => s.slotNumber >= 1 && s.slotNumber <= 11 && s.player);
                const benchSubs = allSlots.filter((s) => s.slotNumber >= 12 && s.slotNumber <= 18 && s.player);
                const reservePlayers = allSlots.filter((s) => s.slotNumber >= 19 && s.player);

                // Team Tactical Profile
                const managerName = teamData?.manager?.name || 'Head Coach';
                const managerNationality = teamData?.manager?.nationality || teamData?.countryName || teamData?.countryCode || 'International';
                const formation = teamData?.manager?.primaryTactic?.formation || '4-3-3';
                const tacticalStyle = teamData?.manager?.primaryTactic?.style || 'gegenpressing';
                const stadiumName = teamData?.stadium?.name || `${teamData?.name || 'Club'} Arena`;
                const stadiumCapacity = teamData?.stadium?.capacity || 45000;

                const primaryCol = (teamData?.kit as any)?.primaryColor || (teamData?.emblem as any)?.primaryColor || '#1e293b';
                const secondaryCol = (teamData?.kit as any)?.secondaryColor || (teamData?.emblem as any)?.secondaryColor || '#fbbf24';

                const getNatDisplay = (nat: any): string => {
                  if (!nat) return '';
                  if (typeof nat === 'string') return nat;
                  if (typeof nat === 'object' && nat.name) return nat.name;
                  return String(nat);
                };

                return (
                  <div className="space-y-6">
                    {/* Club Selector Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
                        Select Club:
                      </span>
                      {leagueTeamList.map((st) => {
                        const isSelected = st.teamId === effectiveTeamId;
                        return (
                          <button
                            key={st.teamId}
                            onClick={() => setSelectedTeamId(st.teamId)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                            }`}
                          >
                            <span className="text-slate-400 font-normal">#{st.rank}</span>
                            <span>{st.teamName}</span>
                            {st.isPlayerTeam && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {teamData ? (
                      <div className="space-y-6">
                        {/* Club Overview Card */}
                        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg border-2"
                                style={{
                                  backgroundColor: primaryCol,
                                  color: secondaryCol,
                                  borderColor: secondaryCol,
                                }}
                              >
                                <Shield className="w-7 h-7" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-extrabold text-slate-100">{teamData.name}</h3>
                                  {standingRow?.isPlayerTeam && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950">
                                      YOUR CURRENT CLUB
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                  <span>{teamData.city || teamData.countryName || teamData.countryCode}, {teamData.countryName || teamData.countryCode}</span>
                                  <span>•</span>
                                  <span>🏟 {stadiumName} ({stadiumCapacity.toLocaleString()} cap.)</span>
                                </p>
                              </div>
                            </div>

                            {/* Ratings & Standings Badges */}
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 text-center">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">League Pos</span>
                                <span className="text-base font-black text-amber-400">
                                  #{standingRow?.rank || '-'} <span className="text-xs text-slate-400 font-normal">({standingRow?.points || 0} pts)</span>
                                </span>
                              </div>

                              <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 text-center">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Club OVR</span>
                                <span className="text-base font-black text-emerald-400">
                                  {teamData.overallRating || teamData.ovr || 78}
                                </span>
                              </div>

                              <div className="bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 text-center">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">ATT / MID / DEF</span>
                                <span className="text-xs font-bold text-slate-200">
                                  <span className="text-rose-400">{teamData.attackRating || teamData.ovr || 80}</span> /{' '}
                                  <span className="text-amber-400">{teamData.midfieldRating || teamData.ovr || 78}</span> /{' '}
                                  <span className="text-cyan-400">{teamData.defenseRating || teamData.ovr || 77}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Tactical & Manager Bar */}
                          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">Manager:</span>
                              <span className="font-bold text-slate-200">{managerName} ({managerNationality})</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">Tactical Formation:</span>
                              <span className="font-bold text-amber-300">{formation}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-400">Tactical Style:</span>
                              <span className="font-bold text-indigo-300 capitalize">{tacticalStyle}</span>
                            </div>
                          </div>
                        </div>

                        {/* Starting XI Section */}
                        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden shadow-md">
                          <div className="p-3 bg-slate-800/80 border-b border-slate-700/70 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Shirt className="w-4 h-4 text-emerald-400" />
                              <h4 className="text-sm font-bold text-slate-100">Starting XI (1–11)</h4>
                            </div>
                            <span className="text-xs text-slate-400">
                              Formation: <strong className="text-amber-300">{formation}</strong>
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-700 font-semibold uppercase tracking-wider">
                                  <th className="py-2.5 px-3 text-center w-12">Slot</th>
                                  <th className="py-2.5 px-3 text-center w-16">Pos</th>
                                  <th className="py-2.5 px-4">Player</th>
                                  <th className="py-2.5 px-2 text-center">OVR</th>
                                  <th className="py-2.5 px-2 text-center">Age</th>
                                  <th className="py-2.5 px-3">Nat</th>
                                  <th className="py-2.5 px-2 text-center">Apps</th>
                                  <th className="py-2.5 px-2 text-center">Goals</th>
                                  <th className="py-2.5 px-2 text-center">Ast</th>
                                  <th className="py-2.5 px-2 text-center">CS</th>
                                  <th className="py-2.5 px-3 text-center text-amber-400 font-bold">Avg Rating</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800 text-slate-300">
                                {startingXI.map((slot) => {
                                  const p = slot.player!;
                                  const isUser = p.id === player?.id;
                                  const pStats = activeLeague?.playerStatsMap[p.id];
                                  const ratingDisplay = pStats?.avgRating ? pStats.avgRating.toFixed(2) : '-';

                                  return (
                                    <tr
                                      key={slot.slotNumber}
                                      className={`transition-colors ${
                                        isUser
                                          ? 'bg-amber-500/15 font-semibold text-amber-200'
                                          : 'hover:bg-slate-800/50'
                                      }`}
                                    >
                                      <td className="py-2 px-3 text-center font-bold text-slate-500">
                                        #{slot.slotNumber}
                                      </td>
                                      <td className="py-2 px-3 text-center">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-200">
                                          {p.subPosition || p.position || 'CM'}
                                        </span>
                                      </td>
                                      <td className="py-2 px-4 font-medium flex items-center gap-2">
                                        <span>{p.name}</span>
                                        {isUser && (
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950">
                                            YOU
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 px-2 text-center font-bold text-slate-100">
                                        {p.ovr || 75}
                                      </td>
                                      <td className="py-2 px-2 text-center text-slate-400">
                                        {p.age || 24}
                                      </td>
                                      <td className="py-2 px-3 text-slate-400 truncate max-w-[100px]">
                                        {getNatDisplay(p.nationality || teamData.countryName || teamData.countryCode)}
                                      </td>
                                      <td className="py-2 px-2 text-center text-slate-300">
                                        {pStats?.matchesPlayed || 0}
                                      </td>
                                      <td className="py-2 px-2 text-center font-semibold text-emerald-400">
                                        {pStats?.goals || 0}
                                      </td>
                                      <td className="py-2 px-2 text-center font-semibold text-indigo-400">
                                        {pStats?.assists || 0}
                                      </td>
                                      <td className="py-2 px-2 text-center text-slate-400">
                                        {pStats?.cleanSheets || 0}
                                      </td>
                                      <td className="py-2 px-3 text-center font-extrabold text-amber-400">
                                        {ratingDisplay} ⭐
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Substitutes Section */}
                        {benchSubs.length > 0 && (
                          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden shadow-md">
                            <div className="p-3 bg-slate-800/80 border-b border-slate-700/70 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-cyan-400" />
                                <h4 className="text-sm font-bold text-slate-100">Substitutes Bench (12–18)</h4>
                              </div>
                              <span className="text-xs text-slate-400">{benchSubs.length} Available Subs</span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-700 font-semibold uppercase tracking-wider">
                                    <th className="py-2.5 px-3 text-center w-12">Slot</th>
                                    <th className="py-2.5 px-3 text-center w-16">Pos</th>
                                    <th className="py-2.5 px-4">Player</th>
                                    <th className="py-2.5 px-2 text-center">OVR</th>
                                    <th className="py-2.5 px-2 text-center">Age</th>
                                    <th className="py-2.5 px-3">Nat</th>
                                    <th className="py-2.5 px-2 text-center">Apps</th>
                                    <th className="py-2.5 px-2 text-center">Goals</th>
                                    <th className="py-2.5 px-2 text-center">Ast</th>
                                    <th className="py-2.5 px-3 text-center text-amber-400 font-bold">Avg Rating</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800 text-slate-300">
                                  {benchSubs.map((slot) => {
                                    const p = slot.player!;
                                    const isUser = p.id === player?.id;
                                    const pStats = activeLeague?.playerStatsMap[p.id];
                                    const ratingDisplay = pStats?.avgRating ? pStats.avgRating.toFixed(2) : '-';

                                    return (
                                      <tr
                                        key={slot.slotNumber}
                                        className={`transition-colors ${
                                          isUser
                                            ? 'bg-amber-500/15 font-semibold text-amber-200'
                                            : 'hover:bg-slate-800/50'
                                        }`}
                                      >
                                        <td className="py-2 px-3 text-center font-bold text-slate-500">
                                          #{slot.slotNumber}
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                                            {p.subPosition || p.position || 'SUB'}
                                          </span>
                                        </td>
                                        <td className="py-2 px-4 font-medium flex items-center gap-2">
                                          <span>{p.name}</span>
                                          {isUser && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950">
                                              YOU
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-2 text-center font-bold text-slate-100">
                                          {p.ovr || 72}
                                        </td>
                                        <td className="py-2 px-2 text-center text-slate-400">
                                          {p.age || 22}
                                        </td>
                                        <td className="py-2 px-3 text-slate-400 truncate max-w-[100px]">
                                          {getNatDisplay(p.nationality || teamData.countryName || teamData.countryCode)}
                                        </td>
                                        <td className="py-2 px-2 text-center text-slate-300">
                                          {pStats?.matchesPlayed || 0}
                                        </td>
                                        <td className="py-2 px-2 text-center text-emerald-400">
                                          {pStats?.goals || 0}
                                        </td>
                                        <td className="py-2 px-2 text-center text-indigo-400">
                                          {pStats?.assists || 0}
                                        </td>
                                        <td className="py-2 px-3 text-center font-bold text-amber-400">
                                          {ratingDisplay} ⭐
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Recent Season Results for this Team */}
                        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 shadow-md">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-amber-400" />
                            <h4 className="text-sm font-bold text-slate-100">Current Season Results ({teamData.name})</h4>
                          </div>

                          {teamSeasonMatches.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {teamSeasonMatches.map((fix) => {
                                const isHome = fix.homeTeamId === effectiveTeamId;
                                const teamScore = isHome ? fix.homeScore : fix.awayScore;
                                const oppScore = isHome ? fix.awayScore : fix.homeScore;
                                const opponentName = isHome ? fix.awayTeamName : fix.homeTeamName;
                                const isWin = teamScore > oppScore;
                                const isDraw = teamScore === oppScore;
                                const resultBadgeClass = isWin
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : isDraw
                                  ? 'bg-slate-700 text-slate-300 border-slate-600'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

                                return (
                                  <div
                                    key={fix.id}
                                    className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[10px] text-slate-500 block uppercase font-bold">
                                        MD {fix.matchdayIndex || 1} • {isHome ? 'Home' : 'Away'} vs {opponentName}
                                      </span>
                                      <span className="font-semibold text-slate-200 truncate block">
                                        {fix.homeTeamName} {fix.homeScore} - {fix.awayScore} {fix.awayTeamName}
                                      </span>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-black border ml-2 ${resultBadgeClass}`}
                                    >
                                      {isWin ? 'W' : isDraw ? 'D' : 'L'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 italic py-4 text-center">
                              No matches played yet this season.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        Select a club above to inspect squad details.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* 2. CONTINENTAL TAB */}
          {activeMainTab === 'continental' && (
            <div className="space-y-6">
              {/* Federation & Competition Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-3 pixel-corners border-2 border-slate-700 pixel-bevel-raised">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs text-amber-400 font-arcade uppercase tracking-wider">FEDERATION:</span>
                  <div className="inline-flex pixel-corners bg-slate-950 p-1 border border-slate-800">
                    {['UEFA', 'CONMEBOL', 'AFC', 'CAF', 'CONCACAF'].map((fed) => (
                      <button
                        key={fed}
                        onClick={() => {
                          setSelectedFederation(fed);
                          const comps = Object.values(CONTINENTAL_COMPETITIONS_CATALOG).filter(
                            (c) => c.federation === fed && !c.isSuperCup
                          );
                          if (comps.length > 0) {
                            setSelectedContinentalComp(comps[0].id);
                          }
                        }}
                        className={`px-2.5 py-1 pixel-corners text-xs font-arcade uppercase transition-all cursor-pointer ${
                          selectedFederation === fed
                            ? 'bg-sky-500 text-slate-950 font-black pixel-bevel-cyan shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {fed}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="inline-flex pixel-corners bg-slate-950 p-1 border border-slate-800">
                  <button
                    onClick={() => setContinentalSubTab('groups')}
                    className={`px-3 py-1 pixel-corners text-xs font-arcade uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      continentalSubTab === 'groups'
                        ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {continentalState?.isLeaguePhaseFormat ? 'LEAGUE TABLE' : 'GROUP TABLES'}
                  </button>
                  <button
                    onClick={() => setContinentalSubTab('fixtures')}
                    className={`px-3 py-1 pixel-corners text-xs font-arcade uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      continentalSubTab === 'fixtures'
                        ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    FIXTURES
                  </button>
                  <button
                    onClick={() => setContinentalSubTab('knockout')}
                    className={`px-3 py-1 pixel-corners text-xs font-arcade uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                      continentalSubTab === 'knockout'
                        ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    KNOCKOUT
                  </button>
                </div>
              </div>

              {/* Specific Tournament Selection Pills */}
              {federationComps.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {federationComps.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedContinentalComp(comp.id)}
                      className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedContinentalComp === comp.id
                          ? 'bg-sky-500 text-slate-950 font-black pixel-bevel-cyan shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-700 pixel-bevel-raised'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{comp.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Tournament Stage / Venue Header */}
              {continentalState && (
                <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border-2 border-sky-500/40 p-4 pixel-corners pixel-bevel-raised flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
                  <div>
                    <h3 className="text-sm sm:text-base font-arcade font-black text-white uppercase flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      {CONTINENTAL_COMPETITIONS_CATALOG[selectedContinentalComp]?.name || selectedContinentalComp}
                    </h3>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      STAGE: <span className="font-bold text-sky-400 uppercase">{continentalState.currentStage.replace('_', ' ')}</span>
                      {continentalState.finalVenue && (
                        <span> • FINAL VENUE: <span className="text-amber-300">{continentalState.finalVenue.stadium}, {continentalState.finalVenue.city}</span></span>
                      )}
                    </p>
                  </div>
                  {continentalState.isPlayerClubParticipant && (
                    <span className="px-2.5 py-1 pixel-corners text-xs font-arcade uppercase font-black bg-amber-500 text-slate-950 border border-amber-300 pixel-bevel-gold">
                      YOUR CLUB ACTIVE ({continentalState.playerClubStageReached || 'GROUP STAGE'})
                    </span>
                  )}
                </div>
              )}

              {/* SubTab 1: LEAGUE TABLE / GROUP TABLES */}
              {continentalSubTab === 'groups' && continentalState && (
                <div className="space-y-4">
                  {continentalState.isLeaguePhaseFormat && continentalState.leaguePhaseStandings ? (
                    /* 36-Team League Phase Table */
                    <div className="bg-slate-950/90 border-2 border-slate-700 pixel-corners pixel-bevel-raised overflow-hidden shadow-xl">
                      <div className="px-4 py-3 bg-slate-900 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-arcade font-bold text-amber-300 text-xs uppercase">
                            36-CLUB LEAGUE PHASE TABLE
                          </span>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            UNIFIED STANDINGS • MATCHDAY {continentalState.leaguePhaseCurrentMatchday || 1} OF {continentalState.leaguePhaseTotalMatchdays || 8}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-arcade uppercase">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-2 h-2 pixel-corners bg-emerald-400" />
                            1-8: R16 DIRECT
                          </span>
                          <span className="flex items-center gap-1 text-amber-400">
                            <span className="w-2 h-2 pixel-corners bg-amber-400" />
                            9-24: PLAY-OFFS
                          </span>
                          <span className="flex items-center gap-1 text-rose-400">
                            <span className="w-2 h-2 pixel-corners bg-rose-400" />
                            25-36: ELIMINATED
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="sticky top-0 bg-slate-900 z-10 border-b-2 border-slate-700">
                            <tr className="text-slate-400 font-arcade uppercase tracking-wider">
                              <th className="py-2.5 px-3 text-center w-10">#</th>
                              <th className="py-2.5 px-4">Club</th>
                              <th className="py-2.5 px-2 text-center">PL</th>
                              <th className="py-2.5 px-2 text-center">W</th>
                              <th className="py-2.5 px-2 text-center">D</th>
                              <th className="py-2.5 px-2 text-center">L</th>
                              <th className="py-2.5 px-2 text-center">GF</th>
                              <th className="py-2.5 px-2 text-center">GA</th>
                              <th className="py-2.5 px-2 text-center font-bold">GD</th>
                              <th className="py-2.5 px-3 text-center font-bold text-amber-400">PTS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-300">
                            {continentalState.leaguePhaseStandings.map((row, idx) => {
                              const rank = idx + 1;
                              const isR16 = rank <= 8;
                              const isPlayoffs = rank > 8 && rank <= 24;
                              const isEliminated = rank > 24;
                              return (
                                <tr
                                  key={row.teamId}
                                  className={`transition-colors ${
                                    row.isPlayerTeam
                                      ? 'bg-amber-500/10 hover:bg-amber-500/15 font-semibold text-amber-200'
                                      : isR16
                                      ? 'bg-emerald-950/20 hover:bg-slate-800/50'
                                      : isPlayoffs
                                      ? 'bg-amber-950/10 hover:bg-slate-800/50'
                                      : 'hover:bg-slate-800/50'
                                  }`}
                                >
                                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                                    {rank}
                                  </td>
                                  <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                                    <span className="truncate">{row.teamName}</span>
                                    {row.isPlayerTeam && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                                        YOU
                                      </span>
                                    )}
                                    {isR16 && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        R16
                                      </span>
                                    )}
                                    {isPlayoffs && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Play-offs
                                      </span>
                                    )}
                                    {isEliminated && (
                                      <span className="px-1 py-0.2 rounded text-[9px] font-medium text-slate-500">
                                        Out
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-2 text-center">{row.played}</td>
                                  <td className="py-2.5 px-2 text-center text-emerald-400">{row.won}</td>
                                  <td className="py-2.5 px-2 text-center text-slate-400">{row.drawn}</td>
                                  <td className="py-2.5 px-2 text-center text-rose-400">{row.lost}</td>
                                  <td className="py-2.5 px-2 text-center">{row.goalsFor}</td>
                                  <td className="py-2.5 px-2 text-center">{row.goalsAgainst}</td>
                                  <td className="py-2.5 px-2 text-center font-bold">
                                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-extrabold text-amber-400 text-sm">
                                    {row.points}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : continentalState.groups && continentalState.groups.length > 0 ? (
                    /* Traditional Group Tables */
                    <div>
                      {/* Group Letters Selector */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
                        {continentalState.groups.map((g) => (
                          <button
                            key={g.groupLetter}
                            onClick={() => setSelectedGroupLetter(g.groupLetter)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              selectedGroupLetter === g.groupLetter
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                            }`}
                          >
                            Group {g.groupLetter}
                          </button>
                        ))}
                      </div>

                      {selectedGroup && (
                        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden shadow-md">
                          <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                            <span className="font-bold text-slate-200 text-xs">
                              Group {selectedGroup.groupLetter} Standings
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Top 2 Qualify for Round of 16
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-850 text-slate-400 border-b border-slate-750 font-semibold uppercase tracking-wider">
                                  <th className="py-2.5 px-3 text-center w-10">#</th>
                                  <th className="py-2.5 px-4">Club</th>
                                  <th className="py-2.5 px-2 text-center">PL</th>
                                  <th className="py-2.5 px-2 text-center">W</th>
                                  <th className="py-2.5 px-2 text-center">D</th>
                                  <th className="py-2.5 px-2 text-center">L</th>
                                  <th className="py-2.5 px-2 text-center">GF</th>
                                  <th className="py-2.5 px-2 text-center">GA</th>
                                  <th className="py-2.5 px-2 text-center font-bold">GD</th>
                                  <th className="py-2.5 px-3 text-center font-bold text-amber-400">PTS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800 text-slate-300">
                                {selectedGroup.standings.map((row, idx) => (
                                  <tr
                                    key={row.teamId}
                                    className={`transition-colors ${
                                      row.isPlayerTeam
                                        ? 'bg-amber-500/10 hover:bg-amber-500/15 font-semibold text-amber-200'
                                        : idx < 2
                                        ? 'bg-indigo-950/20 hover:bg-slate-800/50'
                                        : 'hover:bg-slate-800/50'
                                    }`}
                                  >
                                    <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                                      {idx + 1}
                                    </td>
                                    <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                                      <span>{row.teamName}</span>
                                      {row.isPlayerTeam && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                                          YOU
                                        </span>
                                      )}
                                      {idx < 2 && (
                                        <span className="text-[10px] text-emerald-400 font-semibold">
                                          (Q)
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-2 text-center">{row.played}</td>
                                    <td className="py-2.5 px-2 text-center text-emerald-400">{row.won}</td>
                                    <td className="py-2.5 px-2 text-center text-slate-400">{row.drawn}</td>
                                    <td className="py-2.5 px-2 text-center text-rose-400">{row.lost}</td>
                                    <td className="py-2.5 px-2 text-center">{row.goalsFor}</td>
                                    <td className="py-2.5 px-2 text-center">{row.goalsAgainst}</td>
                                    <td className="py-2.5 px-2 text-center font-bold">
                                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-extrabold text-amber-400 text-sm">
                                      {row.points}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* SubTab 2: FIXTURES */}
              {continentalSubTab === 'fixtures' && continentalState && (
                <div className="space-y-4">
                  {continentalState.isLeaguePhaseFormat && continentalState.leaguePhaseFixtures ? (
                    <div>
                      {/* Matchday Selector */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
                        {Array.from({ length: continentalState.leaguePhaseTotalMatchdays || 8 }).map((_, i) => {
                          const mdNum = i + 1;
                          return (
                            <button
                              key={mdNum}
                              onClick={() => setSelectedLeagueMatchday(mdNum)}
                              className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase transition-all whitespace-nowrap cursor-pointer ${
                                selectedLeagueMatchday === mdNum
                                  ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-gold shadow-sm'
                                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-700 pixel-bevel-raised'
                              }`}
                            >
                              Matchday {mdNum}
                            </button>
                          );
                        })}
                      </div>

                      {/* Fixtures for Selected Matchday */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {continentalState.leaguePhaseFixtures
                          .filter((fix) => fix.matchdayIndex === selectedLeagueMatchday)
                          .map((fix) => (
                            <div
                              key={fix.id}
                              className={`p-3.5 pixel-corners border-2 transition-all ${
                                fix.isPlayerMatch
                                  ? 'bg-amber-500/15 border-amber-400 pixel-bevel-gold shadow-md'
                                  : 'bg-slate-900/80 border-slate-700/80 pixel-bevel-raised'
                              }`}
                            >
                              <div className="text-[11px] text-amber-300 font-arcade uppercase mb-2 flex items-center justify-between">
                                <span>{fix.stageName}</span>
                                {fix.dateStr && <span className="text-slate-400 text-[10px] font-mono">{fix.dateStr}</span>}
                              </div>
                              <div className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex-1 text-right font-bold text-slate-200 truncate">
                                  {fix.homeTeamName}
                                </div>
                                <div className="px-2.5 py-1 pixel-corners bg-slate-950 border border-slate-700 font-mono font-bold text-slate-100 min-w-[50px] text-center">
                                  {fix.isCompleted ? `${fix.homeScore} - ${fix.awayScore}` : 'VS'}
                                </div>
                                <div className="flex-1 text-left font-bold text-slate-200 truncate">
                                  {fix.awayTeamName}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : selectedGroup ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedGroup.fixtures.map((fix) => (
                        <div
                          key={fix.id}
                          className={`p-3.5 pixel-corners border-2 transition-all ${
                            fix.isPlayerMatch
                              ? 'bg-amber-500/15 border-amber-400 pixel-bevel-gold shadow-md'
                              : 'bg-slate-900/80 border-slate-700/80 pixel-bevel-raised'
                          }`}
                        >
                          <div className="text-[11px] text-amber-300 font-arcade uppercase mb-2">
                            {fix.stageName}
                          </div>
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex-1 text-right font-bold text-slate-200 truncate">
                              {fix.homeTeamName}
                            </div>
                            <div className="px-2.5 py-1 pixel-corners bg-slate-950 border border-slate-700 font-mono font-bold text-slate-100 min-w-[50px] text-center">
                              {fix.isCompleted ? `${fix.homeScore} - ${fix.awayScore}` : 'VS'}
                            </div>
                            <div className="flex-1 text-left font-bold text-slate-200 truncate">
                              {fix.awayTeamName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {/* SubTab 3: KNOCKOUT BRACKET */}
              {continentalSubTab === 'knockout' && continentalState && (
                <div className="space-y-6">
                  {/* 1. Champion Banner */}
                  {(continentalState.championTeamName || continentalState.finalTie?.winnerTeamName) && (
                    <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-yellow-500/20 border-2 border-amber-400/80 pixel-corners pixel-bevel-gold p-5 text-center shadow-xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 pixel-corners bg-amber-500 text-slate-950 border border-amber-300 font-arcade text-xs font-black uppercase tracking-widest mb-2">
                        <Trophy className="w-4 h-4 text-slate-950 animate-bounce" />
                        <span>CONTINENTAL CHAMPION CROWNED</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black font-arcade text-amber-300 uppercase tracking-tight">
                        {continentalState.championTeamName || continentalState.finalTie?.winnerTeamName}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 font-mono">
                        Winners of {CONTINENTAL_COMPETITIONS_CATALOG[selectedContinentalComp]?.name || selectedContinentalComp} ({seasonYear})
                      </p>
                    </div>
                  )}

                  {/* 2. The Grand Final */}
                  {continentalState.finalTie && (
                    <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-sky-500/10 border-2 border-amber-400/60 pixel-corners pixel-bevel-gold p-4 text-center shadow-lg">
                      <div className="flex items-center justify-center gap-2 text-xs font-arcade font-bold text-amber-400 uppercase tracking-wider mb-1">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>THE GRAND FINAL</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mb-3">
                        {continentalState.finalVenue?.stadium ? `${continentalState.finalVenue.stadium} • ${continentalState.finalVenue.city}` : 'Neutral Championship Arena'}
                      </div>
                      <div className="flex items-center justify-center gap-4 text-sm font-bold">
                        <span className={`flex-1 text-right truncate ${continentalState.finalTie.winnerTeamId === continentalState.finalTie.teamA.id ? 'text-amber-300 font-extrabold text-base' : 'text-slate-100'}`}>
                          {continentalState.finalTie.teamA.name}
                        </span>
                        <div className="px-4 py-1.5 pixel-corners bg-slate-950 border border-slate-700 text-amber-400 font-mono font-black text-base min-w-[70px]">
                          {continentalState.finalTie.leg1?.isCompleted
                            ? `${continentalState.finalTie.leg1.homeScore} - ${continentalState.finalTie.leg1.awayScore}`
                            : 'VS'}
                        </div>
                        <span className={`flex-1 text-left truncate ${continentalState.finalTie.winnerTeamId === continentalState.finalTie.teamB.id ? 'text-amber-300 font-extrabold text-base' : 'text-slate-100'}`}>
                          {continentalState.finalTie.teamB.name}
                        </span>
                      </div>
                      {continentalState.finalTie.leg1?.isCompleted && continentalState.finalTie.winnerTeamName && (
                        <div className="mt-2 text-xs font-arcade uppercase font-bold text-emerald-400">
                          Winner: {continentalState.finalTie.winnerTeamName}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Semi-Finals */}
                  {continentalState.sfTies && continentalState.sfTies.length > 0 && (
                    <div className="bg-slate-900/80 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-4">
                      <h4 className="text-xs font-arcade font-bold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-sky-400" />
                        <span>SEMI-FINALS (AGGREGATE TIES)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {continentalState.sfTies.map((tie) => {
                          const leg1Done = tie.leg1?.isCompleted;
                          const leg2Done = tie.leg2?.isCompleted;
                          const aggA = (tie.leg1?.homeScore || 0) + (tie.leg2?.awayScore || 0);
                          const aggB = (tie.leg1?.awayScore || 0) + (tie.leg2?.homeScore || 0);
                          return (
                            <div key={tie.id} className="p-3 pixel-corners bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-2">
                              <span className={`font-semibold truncate flex-1 text-left ${tie.winnerTeamId === tie.teamA.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                                {tie.teamA.name}
                              </span>
                              <div className="flex flex-col items-center">
                                <span className="px-2.5 py-1 pixel-corners bg-slate-900 border border-slate-700 font-mono font-bold text-slate-100 min-w-[56px] text-center">
                                  {leg1Done && leg2Done ? `${aggA} - ${aggB}` : leg1Done ? `(L1) ${tie.leg1?.homeScore}-${tie.leg1?.awayScore}` : 'TBD'}
                                </span>
                                {leg1Done && leg2Done && (
                                  <span className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Agg</span>
                                )}
                              </div>
                              <span className={`font-semibold truncate flex-1 text-right ${tie.winnerTeamId === tie.teamB.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                                {tie.teamB.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. Quarter-Finals */}
                  {continentalState.qfTies && continentalState.qfTies.length > 0 && (
                    <div className="bg-slate-900/80 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-4">
                      <h4 className="text-xs font-arcade font-bold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-sky-400" />
                        <span>QUARTER-FINALS (AGGREGATE TIES)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {continentalState.qfTies.map((tie) => {
                          const leg1Done = tie.leg1?.isCompleted;
                          const leg2Done = tie.leg2?.isCompleted;
                          const aggA = (tie.leg1?.homeScore || 0) + (tie.leg2?.awayScore || 0);
                          const aggB = (tie.leg1?.awayScore || 0) + (tie.leg2?.homeScore || 0);
                          return (
                            <div key={tie.id} className="p-3 pixel-corners bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-2">
                              <span className={`font-semibold truncate flex-1 text-left ${tie.winnerTeamId === tie.teamA.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                                {tie.teamA.name}
                              </span>
                              <div className="flex flex-col items-center">
                                <span className="px-2.5 py-1 pixel-corners bg-slate-900 border border-slate-700 font-mono font-bold text-slate-100 min-w-[56px] text-center">
                                  {leg1Done && leg2Done ? `${aggA} - ${aggB}` : leg1Done ? `(L1) ${tie.leg1?.homeScore}-${tie.leg1?.awayScore}` : 'TBD'}
                                </span>
                                {leg1Done && leg2Done && (
                                  <span className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Agg</span>
                                )}
                              </div>
                              <span className={`font-semibold truncate flex-1 text-right ${tie.winnerTeamId === tie.teamB.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                                {tie.teamB.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 5. Round of 16 */}
                  {continentalState.r16Ties && continentalState.r16Ties.length > 0 && (
                    <div className="bg-slate-900/80 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-4">
                      <h4 className="text-xs font-arcade font-bold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-sky-400" />
                        <span>ROUND OF 16 (AGGREGATE TIES)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {continentalState.r16Ties.map((tie) => {
                          const leg1Done = tie.leg1?.isCompleted;
                          const leg2Done = tie.leg2?.isCompleted;
                          const aggA = (tie.leg1?.homeScore || 0) + (tie.leg2?.awayScore || 0);
                          const aggB = (tie.leg1?.awayScore || 0) + (tie.leg2?.homeScore || 0);
                          return (
                            <div key={tie.id} className="p-3 pixel-corners bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-2">
                              <span className={`font-semibold truncate flex-1 text-left ${tie.winnerTeamId === tie.teamA.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                                {tie.teamA.name}
                              </span>
                              <div className="flex flex-col items-center">
                                <span className="px-2.5 py-1 pixel-corners bg-slate-900 border border-slate-700 font-mono font-bold text-slate-100 min-w-[56px] text-center">
                                  {leg1Done && leg2Done ? `${aggA} - ${aggB}` : leg1Done ? `(L1) ${tie.leg1?.homeScore}-${tie.leg1?.awayScore}` : 'TBD'}
                                </span>
                                {leg1Done && leg2Done && (
                                  <span className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Agg</span>
                                )}
                              </div>
                              <span className={`font-semibold truncate flex-1 text-right ${tie.winnerTeamId === tie.teamB.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                                {tie.teamB.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 6. Knockout Play-offs (Elimination Round) */}
                  {continentalState.knockoutPlayoffTies && continentalState.knockoutPlayoffTies.length > 0 && (
                    <div className="bg-slate-900/80 border-2 border-amber-500/60 pixel-corners pixel-bevel-gold p-4">
                      <h4 className="text-xs font-arcade font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>KNOCKOUT PLAY-OFFS (9TH–24TH ELIMINATION TIES)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {continentalState.knockoutPlayoffTies.map((tie) => {
                          const leg1Done = tie.leg1?.isCompleted;
                          const leg2Done = tie.leg2?.isCompleted;
                          const aggA = (tie.leg1?.homeScore || 0) + (tie.leg2?.awayScore || 0);
                          const aggB = (tie.leg1?.awayScore || 0) + (tie.leg2?.homeScore || 0);
                          return (
                            <div key={tie.id} className="p-3 pixel-corners bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-2">
                              <span className={`font-semibold truncate flex-1 text-left ${tie.winnerTeamId === tie.teamA.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                                {tie.teamA.name}
                              </span>
                              <div className="flex flex-col items-center">
                                <span className="px-2.5 py-1 pixel-corners bg-slate-900 border border-slate-700 font-mono font-bold text-slate-100 min-w-[56px] text-center">
                                  {leg1Done && leg2Done ? `${aggA} - ${aggB}` : leg1Done ? `(L1) ${tie.leg1?.homeScore}-${tie.leg1?.awayScore}` : 'TBD'}
                                </span>
                                {leg1Done && leg2Done && (
                                  <span className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Agg</span>
                                )}
                              </div>
                              <span className={`font-semibold truncate flex-1 text-right ${tie.winnerTeamId === tie.teamB.id ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                                {tie.teamB.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(!continentalState.r16Ties || continentalState.r16Ties.length === 0) &&
                    (!continentalState.knockoutPlayoffTies || continentalState.knockoutPlayoffTies.length === 0) &&
                    !continentalState.finalTie && (
                    <div className="p-8 text-center bg-slate-900/60 pixel-corners border-2 border-slate-800 pixel-bevel-raised text-slate-400 text-xs space-y-2">
                      <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-arcade font-bold text-slate-300 uppercase">Knockout Stage Pending</p>
                      <p className="font-mono text-[11px]">
                        The knockout bracket will generate automatically as the league phase concludes and teams qualify for the Round of 16 and Knockout Play-offs.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. INTERNATIONAL TAB */}
          {activeMainTab === 'international' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900/90 p-3 pixel-corners border-2 border-slate-700 pixel-bevel-raised">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 font-arcade uppercase tracking-wider">LEVEL:</span>
                  <div className="inline-flex pixel-corners bg-slate-950 p-1 border border-slate-800">
                    <span className="px-3 py-1 pixel-corners text-xs font-arcade font-bold uppercase bg-sky-500 text-slate-950 pixel-bevel-cyan shadow-sm">
                      SENIOR NATIONAL TEAM
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  4-Year Authentic FIFA & Confederation Cycle
                </div>
              </div>

              <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border-2 border-sky-500/40 p-5 pixel-corners pixel-bevel-raised flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="text-xs text-sky-400 font-arcade uppercase tracking-wider">
                    {selectedInternationalTier} GLOBAL SHOWCASE
                  </div>
                  <h3 className="text-lg font-arcade font-black text-white uppercase mt-0.5">
                    {selectedInternationalTier === 'Senior'
                      ? 'FIFA World Cup & Continental Championships'
                      : selectedInternationalTier === 'U20'
                      ? 'FIFA U-20 World Cup & Youth Continental Tournaments'
                      : 'FIFA U-17 World Cup & Global Youth Cup'}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    Live national team call-ups, group brackets, and knockout matches simulated based on player nationality and form.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 pixel-corners text-xs font-arcade uppercase font-bold bg-sky-500 text-slate-950 border border-sky-300 pixel-bevel-cyan flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {selectedInternationalTier} INTERNATIONAL
                  </span>
                </div>
              </div>

              {/* International Matches Grid / Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-4">
                  <h4 className="text-xs font-arcade font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    NATIONAL TEAM ELIGIBILITY & CALL-UP
                  </h4>
                  <div className="text-xs text-slate-300 space-y-2 font-mono">
                    <div>
                      NATION:{' '}
                      <span className="font-bold text-slate-100 font-arcade text-sm">
                        {typeof player?.nationality === 'string'
                          ? player.nationality
                          : (player?.nationality as any)?.name || player?.country || 'England'}
                      </span>
                    </div>
                    <div>
                      OVERALL RATING: <span className="font-bold text-amber-400">{player?.ovr || 72} OVR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>STATUS:</span>
                      <span className="px-2 py-0.5 pixel-corners text-[11px] font-arcade uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 pixel-bevel-emerald">
                        {(player?.ovr || 70) >= 78 ? 'Senior Squad Contender' : 'Youth / Scouting Radar'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-4">
                  <h4 className="text-xs font-arcade font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5" />
                    MAJOR TOURNAMENT CALENDAR
                  </h4>
                  <div className="text-xs text-slate-300 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between">
                      <span>FIFA World Cup 2026:</span>
                      <span className="font-bold text-amber-300">Active Qualifying</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>UEFA Euro / Copa America:</span>
                      <span className="font-bold text-slate-200">Summer 2028</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>FIFA U-20 World Cup:</span>
                      <span className="font-bold text-slate-200">Biennial Cycle</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= DRAWS TAB ================= */}
          {activeMainTab === 'draws' && (
            <WorldResultsDrawsView
              player={player}
              seasonYear={effectiveSeasonYear}
            />
          )}

          {/* ================= POWERSCALE FAVORITES TAB ================= */}
          {activeMainTab === 'powerscale' && (
            <PowerscaleFavoritesView seasonYear={seasonYear} userClubId={player?.clubId} />
          )}
        </div>

        {/* 32-Bit Arcade Footer */}
        <div className="px-5 sm:px-6 py-3 bg-slate-900/95 border-t-2 border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span>Simulation Universe:</span>
            <span className="font-bold text-amber-300 uppercase">{seasonYear}</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">World Standings, Continental & Tournament Draws Synchronized</span>
          </div>
          <button
            type="button"
            data-nav-item
            tabIndex={0}
            onClick={onClose}
            className="px-5 py-2 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-arcade font-bold text-xs uppercase tracking-wider border-2 border-slate-600 pixel-bevel-raised transition-all cursor-pointer active:scale-95"
          >
            CLOSE
          </button>
        </div>

        {/* Match Details & Lineup Inspector Dialog */}
        {inspectingFixture && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-950 border-2 border-amber-500/80 pixel-corners pixel-bevel-gold w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 bg-slate-900 border-b-2 border-slate-700 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-arcade font-bold text-sky-400 uppercase tracking-wider">
                      {inspectingFixture.competitionName || 'Match Report'}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-300 font-mono">
                      {inspectingFixture.stageName || `Matchday ${inspectingFixture.matchdayIndex || 1}`}
                    </span>
                    {inspectingFixture.isPlayerMatch && (
                      <span className="px-2 py-0.5 pixel-corners text-[10px] font-arcade font-bold uppercase bg-amber-500 text-slate-950 border border-amber-300 pixel-bevel-gold">
                        CAREER PLAYER MATCH
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-arcade font-black text-slate-100 mt-1 flex items-center gap-3 uppercase">
                    <span>{inspectingFixture.homeTeamName}</span>
                    <span className="px-2.5 py-0.5 pixel-corners bg-slate-900 text-amber-400 font-mono text-base border-2 border-slate-700 font-bold pixel-bevel-sunken">
                      {inspectingFixture.homeScore} - {inspectingFixture.awayScore}
                    </span>
                    <span>{inspectingFixture.awayTeamName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingFixture(null)}
                  className="p-1.5 pixel-corners bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 border border-slate-600 pixel-bevel-raised transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Man of the Match Card */}
                {inspectingFixture.mvpPlayer && (
                  <div className="p-3 pixel-corners bg-amber-500/10 border-2 border-amber-500/40 pixel-bevel-gold flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-300">
                        Man of the Match: <strong className="text-amber-300 font-bold font-arcade uppercase">{inspectingFixture.mvpPlayer.name}</strong> ({inspectingFixture.mvpPlayer.teamId === inspectingFixture.homeTeamId ? inspectingFixture.homeTeamName : inspectingFixture.awayTeamName})
                      </span>
                    </div>
                    <span className="text-xs font-arcade font-bold uppercase text-amber-400 bg-amber-500/20 px-2 py-0.5 pixel-corners border border-amber-500/30">
                      RATING {inspectingFixture.mvpPlayer.rating.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Match Events Timeline */}
                {inspectingFixture.events && inspectingFixture.events.length > 0 && (
                  <div className="p-3.5 pixel-corners bg-slate-900/90 border-2 border-slate-700/80 pixel-bevel-raised space-y-2">
                    <h4 className="text-xs font-arcade font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      MATCH EVENTS TIMELINE
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {inspectingFixture.events.map((ev, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 pixel-corners bg-slate-950 border border-slate-800">
                          <span className="font-mono text-slate-400 w-7 text-right font-bold">{ev.minute}&apos;</span>
                          <span className="w-5 text-center">
                            {ev.type === 'goal' ? '⚽' : ev.type === 'yellow' ? '🟨' : ev.type === 'red' ? '🟥' : ev.type === 'sub' ? '🔄' : '🎯'}
                          </span>
                          <div className="flex-1 truncate">
                            <span className="text-slate-200 font-medium">{ev.playerName}</span>
                            {ev.detail && <span className="text-[10px] text-slate-400 ml-1.5">({ev.detail})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Squad Lineups Tabs */}
                <div>
                  <div className="flex items-center justify-between border-b-2 border-slate-750 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFixtureDetailTeamTab('home')}
                        className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase font-bold transition-all cursor-pointer ${
                          fixtureDetailTeamTab === 'home'
                            ? 'bg-sky-500 text-slate-950 pixel-bevel-cyan shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                        }`}
                      >
                        {inspectingFixture.homeTeamName} Squad
                      </button>
                      <button
                        onClick={() => setFixtureDetailTeamTab('away')}
                        className={`px-3 py-1.5 pixel-corners text-xs font-arcade uppercase font-bold transition-all cursor-pointer ${
                          fixtureDetailTeamTab === 'away'
                            ? 'bg-sky-500 text-slate-950 pixel-bevel-cyan shadow-sm'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                        }`}
                      >
                        {inspectingFixture.awayTeamName} Squad
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      TEAM OVR: <strong className="text-amber-300 font-bold">{fixtureDetailTeamTab === 'home' ? inspectingFixture.homeTeamOvr : inspectingFixture.awayTeamOvr}</strong>
                    </span>
                  </div>

                  {/* Starting XI (1-11) */}
                  <div className="space-y-3">
                    <div className="text-xs font-arcade font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-emerald-400" />
                      STARTING XI (1–11)
                    </div>
                    <div className="overflow-x-auto pixel-corners border-2 border-slate-800 bg-slate-950">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-arcade uppercase">
                            <th className="py-2 px-3 text-center w-10">#</th>
                            <th className="py-2 px-3 text-center w-14">Pos</th>
                            <th className="py-2 px-3">Player</th>
                            <th className="py-2 px-2 text-center">OVR</th>
                            <th className="py-2 px-2 text-center">Mins</th>
                            <th className="py-2 px-2 text-center">Goals</th>
                            <th className="py-2 px-2 text-center">Ast</th>
                            <th className="py-2 px-2 text-center">Cards</th>
                            <th className="py-2 px-3 text-center text-amber-400 font-bold">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-slate-300">
                          {((fixtureDetailTeamTab === 'home' ? inspectingFixture.homePlayers : inspectingFixture.awayPlayers) || []).map((p, idx) => (
                            <tr
                              key={p.id || idx}
                              className={p.isUserPlayer ? 'bg-amber-500/15 font-semibold text-amber-200' : 'hover:bg-slate-900/60'}
                            >
                              <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-2 px-3 text-center font-bold text-slate-300 font-mono">{p.position}</td>
                              <td className="py-2 px-3">
                                <span className="flex items-center gap-1.5">
                                  {p.name}
                                  {p.isUserPlayer && (
                                    <span className="px-1.5 py-0.2 pixel-corners text-[9px] font-arcade font-black bg-amber-400 text-slate-950 uppercase">
                                      YOU
                                    </span>
                                  )}
                                  {p.isMvp && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-center text-slate-400 font-mono">{p.ovr}</td>
                              <td className="py-2 px-2 text-center text-slate-300 font-mono">{p.minutesPlayed}&apos;</td>
                              <td className="py-2 px-2 text-center text-emerald-400 font-semibold font-mono">{p.goals > 0 ? p.goals : '-'}</td>
                              <td className="py-2 px-2 text-center text-sky-400 font-semibold font-mono">{p.assists > 0 ? p.assists : '-'}</td>
                              <td className="py-2 px-2 text-center">
                                {p.redCards > 0 ? '🟥' : p.yellowCards > 0 ? '🟨' : '-'}
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-amber-400 font-mono">
                                {p.rating ? p.rating.toFixed(1) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Substitutes / Bench (12-18) */}
                    {((fixtureDetailTeamTab === 'home' ? inspectingFixture.homeBench : inspectingFixture.awayBench) || []).length > 0 && (
                      <div className="space-y-2 mt-4">
                        <div className="text-xs font-arcade font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-sky-400" />
                          SUBSTITUTES (12–18)
                        </div>
                        <div className="overflow-x-auto pixel-corners border-2 border-slate-800 bg-slate-950/60">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-arcade uppercase">
                                <th className="py-2 px-3 text-center w-10">#</th>
                                <th className="py-2 px-3 text-center w-14">Pos</th>
                                <th className="py-2 px-3">Player</th>
                                <th className="py-2 px-2 text-center">OVR</th>
                                <th className="py-2 px-2 text-center">Status</th>
                                <th className="py-2 px-2 text-center">Mins</th>
                                <th className="py-2 px-3 text-center text-amber-400 font-bold">Rating</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80 text-slate-300">
                              {((fixtureDetailTeamTab === 'home' ? inspectingFixture.homeBench : inspectingFixture.awayBench) || []).map((p, idx) => (
                                <tr
                                  key={p.id || idx}
                                  className={p.isUserPlayer ? 'bg-amber-500/15 font-semibold text-amber-200' : 'hover:bg-slate-900/40'}
                                >
                                  <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 12}</td>
                                  <td className="py-2 px-3 text-center font-bold text-slate-300 font-mono">{p.position}</td>
                                  <td className="py-2 px-3">
                                    <span className="flex items-center gap-1.5">
                                      {p.name}
                                      {p.isUserPlayer && (
                                        <span className="px-1.5 py-0.2 pixel-corners text-[9px] font-arcade font-black bg-amber-400 text-slate-950 uppercase">
                                          YOU
                                        </span>
                                      )}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-center text-slate-400 font-mono">{p.ovr}</td>
                                  <td className="py-2 px-2 text-center text-[11px] text-slate-400 font-mono">
                                    {p.minutesPlayed > 0 ? `Sub In (${p.minutesPlayed}')` : 'Unused Sub'}
                                  </td>
                                  <td className="py-2 px-2 text-center text-slate-300 font-mono">{p.minutesPlayed > 0 ? `${p.minutesPlayed}'` : '-'}</td>
                                  <td className="py-2 px-3 text-center font-bold text-amber-400 font-mono">
                                    {p.minutesPlayed > 0 && p.rating ? p.rating.toFixed(1) : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-900 border-t-2 border-slate-700 flex justify-end">
                <button
                  onClick={() => setInspectingFixture(null)}
                  className="px-4 py-1.5 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-arcade font-bold uppercase border border-slate-600 pixel-bevel-raised cursor-pointer"
                >
                  CLOSE MATCH REPORT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
