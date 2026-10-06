import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Globe,
  Shield,
  Sparkles,
  FastForward,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Star,
  Swords,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  ContinentalCompetitionId,
  ContinentalTournamentSeasonState,
  ContinentalGroup,
} from '../types/continentalCompetitions';
import { CONTINENTAL_COMPETITIONS_CATALOG } from '../utils/continentalDatabaseSystem';

interface ContinentalDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentState: ContinentalTournamentSeasonState;
  playerClubId?: string;
  playerClubName?: string;
}

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  bgGradient: string;
  headerGradient: string;
  border: string;
  cardBg: string;
  potBadge: string;
  highlightRing: string;
  icon: string;
}

export type DrawStageStep = 1 | 2 | 3; // 1: Pot Reveal, 2: Group Draw, 3: Fixture Schedule

export const ContinentalDrawModal: React.FC<ContinentalDrawModalProps> = ({
  isOpen,
  onClose,
  tournamentState,
  playerClubId,
  playerClubName,
}) => {
  const compId = tournamentState.competitionId;
  const meta = CONTINENTAL_COMPETITIONS_CATALOG[compId];
  const isLeaguePhase = !!tournamentState.isLeaguePhaseFormat;

  // Visual Theme configuration
  const theme: ThemeConfig = useMemo(() => {
    switch (compId) {
      case 'UEFA_CL':
        return {
          primary: '#001C58',
          secondary: '#FFFFFF',
          accent: '#3B82F6',
          bgGradient: 'from-slate-950 via-blue-950 to-slate-900',
          headerGradient: 'from-blue-900 via-blue-950 to-slate-950',
          border: 'border-blue-500/50',
          cardBg: 'bg-blue-950/40 border-blue-500/30',
          potBadge: 'bg-blue-600/30 text-blue-300 border-blue-400/40',
          highlightRing: 'ring-2 ring-blue-400 bg-blue-500/20',
          icon: '⭐',
        };
      case 'UEFA_EL':
        return {
          primary: '#FF6B00',
          secondary: '#1A1A1A',
          accent: '#F97316',
          bgGradient: 'from-zinc-950 via-stone-900 to-amber-950',
          headerGradient: 'from-orange-950 via-zinc-900 to-black',
          border: 'border-orange-500/50',
          cardBg: 'bg-orange-950/30 border-orange-500/30',
          potBadge: 'bg-orange-600/30 text-orange-300 border-orange-400/40',
          highlightRing: 'ring-2 ring-orange-400 bg-orange-500/20',
          icon: '🛡️',
        };
      case 'UEFA_ECL':
        return {
          primary: '#00D26A',
          secondary: '#111827',
          accent: '#10B981',
          bgGradient: 'from-gray-950 via-emerald-950 to-slate-950',
          headerGradient: 'from-emerald-950 via-teal-950 to-gray-950',
          border: 'border-emerald-500/50',
          cardBg: 'bg-emerald-950/30 border-emerald-500/30',
          potBadge: 'bg-emerald-600/30 text-emerald-300 border-emerald-400/40',
          highlightRing: 'ring-2 ring-emerald-400 bg-emerald-500/20',
          icon: '🏆',
        };
      case 'CONMEBOL_LIB':
        return {
          primary: '#E5A93C',
          secondary: '#18181B',
          accent: '#F59E0B',
          bgGradient: 'from-zinc-950 via-amber-950 to-stone-900',
          headerGradient: 'from-amber-950 via-yellow-950 to-black',
          border: 'border-amber-500/50',
          cardBg: 'bg-amber-950/30 border-amber-500/30',
          potBadge: 'bg-amber-600/30 text-amber-300 border-amber-400/40',
          highlightRing: 'ring-2 ring-amber-400 bg-amber-500/20',
          icon: '👑',
        };
      case 'CONMEBOL_SUD':
        return {
          primary: '#3B82F6',
          secondary: '#94A3B8',
          accent: '#64748B',
          bgGradient: 'from-slate-950 via-slate-900 to-sky-950',
          headerGradient: 'from-slate-900 via-sky-950 to-slate-950',
          border: 'border-sky-500/50',
          cardBg: 'bg-slate-900/50 border-sky-500/30',
          potBadge: 'bg-sky-600/30 text-sky-300 border-sky-400/40',
          highlightRing: 'ring-2 ring-sky-400 bg-sky-500/20',
          icon: '🌐',
        };
      default:
        return {
          primary: '#001C58',
          secondary: '#FFFFFF',
          accent: '#3B82F6',
          bgGradient: 'from-slate-950 via-blue-950 to-slate-900',
          headerGradient: 'from-blue-900 via-blue-950 to-slate-950',
          border: 'border-blue-500/50',
          cardBg: 'bg-blue-950/40 border-blue-500/30',
          potBadge: 'bg-blue-600/30 text-blue-300 border-blue-400/40',
          highlightRing: 'ring-2 ring-blue-400 bg-blue-500/20',
          icon: '⭐',
        };
    }
  }, [compId]);

  const maxPots = isLeaguePhase && compId === 'UEFA_ECL' ? 6 : 4;

  // 3-Step Navigation State
  const [currentStep, setCurrentStep] = useState<DrawStageStep>(1);
  const [revealedPotsCount, setRevealedPotsCount] = useState<number>(1);
  const [isAnimationFinished, setIsAnimationFinished] = useState<boolean>(false);

  // Group carousel index for traditional format (0 to groups.length - 1)
  const [focusedGroupIndex, setFocusedGroupIndex] = useState<number>(0);

  // Selected club to inspect in League Phase
  const [inspectedClubId, setInspectedClubId] = useState<string>(
    playerClubId || (tournamentState.qualifiers && tournamentState.qualifiers[0]?.teamId) || ''
  );

  useEffect(() => {
    if (playerClubId) {
      setInspectedClubId(playerClubId);
    } else if (tournamentState.qualifiers && tournamentState.qualifiers.length > 0) {
      setInspectedClubId((prev) => prev || tournamentState.qualifiers[0].teamId);
    }
  }, [playerClubId, tournamentState.qualifiers]);

  // Find player's group (traditional format)
  const playerGroup = useMemo(() => {
    if (isLeaguePhase) return undefined;
    return tournamentState.groups?.find((g) =>
      g.teams.some(
        (t) =>
          (playerClubId && t.id === playerClubId) ||
          (playerClubName && t.name.toLowerCase() === playerClubName.toLowerCase()) ||
          t.isPlayer
      )
    );
  }, [isLeaguePhase, tournamentState.groups, playerClubId, playerClubName]);

  // Focus on player's group by default
  useEffect(() => {
    if (playerGroup && tournamentState.groups) {
      const idx = tournamentState.groups.findIndex((g) => g.id === playerGroup.id);
      if (idx >= 0) setFocusedGroupIndex(idx);
    }
  }, [playerGroup, tournamentState.groups]);

  // Player qualification entry in League Phase
  const playerLeagueEntry = useMemo(() => {
    if (!isLeaguePhase) return undefined;
    return tournamentState.qualifiers?.find(
      (q) =>
        (playerClubId && q.teamId === playerClubId) ||
        (playerClubName && q.teamName.toLowerCase() === playerClubName.toLowerCase())
    );
  }, [isLeaguePhase, tournamentState.qualifiers, playerClubId, playerClubName]);

  // Handle Skip — reveals all pots and finishes animation immediately
  const handleSkip = () => {
    setRevealedPotsCount(maxPots);
    setIsAnimationFinished(true);
  };

  // Automated gentle reveal for Pot Stage
  useEffect(() => {
    if (!isOpen || isAnimationFinished) return;

    const timer = setInterval(() => {
      setRevealedPotsCount((prev) => {
        if (prev >= maxPots) {
          setIsAnimationFinished(true);
          clearInterval(timer);
          return maxPots;
        }
        return prev + 1;
      });
    }, 1100);

    return () => clearInterval(timer);
  }, [isOpen, isAnimationFinished, maxPots]);

  if (!isOpen) return null;

  const inspectedTeam = tournamentState.qualifiers?.find((q) => q.teamId === inspectedClubId);
  const inspectedRivals = inspectedClubId && tournamentState.teamRivals
    ? tournamentState.teamRivals[inspectedClubId] || []
    : [];

  const groupsList = tournamentState.groups || [];
  const currentFocusedGroup = groupsList[focusedGroupIndex] || groupsList[0];

  return (
    <div
      id="continental-draw-modal-container"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden animate-in fade-in duration-200"
    >
      <div className={`w-full h-full flex flex-col bg-gradient-to-b ${theme.bgGradient} overflow-hidden`}>
        {/* ========================================================================= */}
        {/* TOP CONSOLE APP BAR: BACK BUTTON + TITLE + 3-STEP PROGRESS TABS */}
        {/* ========================================================================= */}
        <header
          id="continental-draw-modal-header"
          className={`px-3 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r ${theme.headerGradient} border-b ${theme.border} flex items-center justify-between shrink-0 shadow-xl z-20`}
        >
          {/* Left Zone: Back Button & Wordmark */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              id="continental-draw-back-btn"
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer font-arcade font-bold text-xs flex items-center gap-1.5 shadow active:scale-95"
              title="Return to Career"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>RETURN</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg shadow-inner border border-white/20">
                {theme.icon}
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-arcade font-black text-white uppercase tracking-tight truncate">
                  {meta?.name || 'Continental Cup'}
                </h1>
                <p className="text-[10px] text-white/70 font-mono hidden sm:block">
                  Season {tournamentState.seasonYear}/{tournamentState.seasonYear + 1} • {isLeaguePhase ? '36-Team League Phase' : 'Group Stage Draw'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Zone: Skip Draw & Step Pips */}
          <div className="flex items-center gap-2">
            {!isAnimationFinished && currentStep === 1 && (
              <button
                id="continental-draw-skip-btn"
                type="button"
                onClick={handleSkip}
                className="min-h-[44px] px-3 py-1.5 text-[11px] font-arcade font-bold rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
            )}

            {/* Stepped Progress Pips */}
            <div className="flex items-center bg-black/40 border border-white/15 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-arcade font-bold transition-all cursor-pointer ${
                  currentStep === 1
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                1. Pots
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSkip();
                  setCurrentStep(2);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-arcade font-bold transition-all cursor-pointer ${
                  currentStep === 2
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                2. Draw
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSkip();
                  setCurrentStep(3);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-arcade font-bold transition-all cursor-pointer ${
                  currentStep === 3
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                3. Fixtures
              </button>
            </div>
          </div>
        </header>

        {/* Player Club Status Headline */}
        <div
          id="continental-draw-player-banner"
          className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs font-retro shrink-0"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            {isLeaguePhase ? (
              <span>
                {playerLeagueEntry ? (
                  <>
                    Your club <strong className="text-amber-300 font-bold">{playerLeagueEntry.teamName}</strong> is seeded in{' '}
                    <strong className="text-white underline">Pot {playerLeagueEntry.seedingPot}</strong>
                  </>
                ) : (
                  <span>36 Elite Clubs • 8 opponents drawn per club (4 Home, 4 Away)</span>
                )}
              </span>
            ) : (
              <span>
                {playerGroup ? (
                  <>
                    Your club <strong className="text-amber-300 font-bold">{playerClubName || 'Your Club'}</strong> is placed in{' '}
                    <strong className="text-white underline">Group {playerGroup.groupLetter}</strong>
                  </>
                ) : (
                  <span>32 Qualified Teams seeded into Groups A through H</span>
                )}
              </span>
            )}
          </div>
          <span className="text-[10px] text-white/60 font-mono hidden sm:inline">
            Step {currentStep} of 3
          </span>
        </div>

        {/* ========================================================================= */}
        {/* STEP CONTENT CONTAINER */}
        {/* ========================================================================= */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* --------------------------------------------------------------------- */}
          {/* STEP 1: POT REVEAL */}
          {/* --------------------------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between text-xs font-arcade">
                <span className="text-slate-300 uppercase tracking-wider">
                  Official Seeding Pots (Revealing Pot {revealedPotsCount} of {maxPots})
                </span>
                <span className="text-amber-400">
                  {isAnimationFinished ? 'All Pots Revealed' : 'Revealing Seeds...'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4, ...(maxPots > 4 ? [5, 6] : [])].map((potNum) => {
                  const potKey = `pot${potNum}` as 'pot1' | 'pot2' | 'pot3' | 'pot4' | 'pot5' | 'pot6';
                  const potTeams = tournamentState.pots ? tournamentState.pots[potKey] || [] : [];
                  const isDrawn = potNum <= revealedPotsCount;

                  return (
                    <div
                      key={potNum}
                      className={`rounded-xl p-3.5 border transition-all ${
                        isDrawn ? 'bg-slate-900/80 border-white/20 shadow-md' : 'bg-slate-950/40 border-white/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                        <span className="font-arcade font-bold text-xs text-white flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${theme.potBadge}`}>
                            P{potNum}
                          </span>
                          Pot {potNum}
                        </span>
                        <span className="text-[10px] text-white/50 font-mono">{potTeams.length} Clubs</span>
                      </div>

                      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {potTeams.map((entry) => {
                          const isPlayer =
                            (playerClubId && entry.teamId === playerClubId) ||
                            (playerClubName && entry.teamName.toLowerCase() === playerClubName.toLowerCase());

                          return (
                            <div
                              key={entry.teamId}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                isPlayer
                                  ? 'bg-amber-500/25 border border-amber-400 text-amber-200 font-bold'
                                  : 'bg-white/5 text-white/85'
                              }`}
                            >
                              <span className="truncate">{entry.teamName}</span>
                              <span className="text-[10px] text-white/50 font-mono ml-1">
                                {entry.countryCode}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 2: ANIMATED GROUP DRAW / RIVALS CAROUSEL */}
          {/* --------------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-4 max-w-5xl mx-auto">
              {isLeaguePhase ? (
                /* SWISS LEAGUE: RIVALS DRAWN */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/90 p-3 rounded-xl border border-white/10">
                    <span className="text-xs font-arcade font-bold text-amber-300">
                      36-TEAM SINGLE LEAGUE DRAWN RIVALS
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-white/60">Inspect:</span>
                      <select
                        value={inspectedClubId}
                        onChange={(e) => setInspectedClubId(e.target.value)}
                        className="bg-slate-950 border border-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-lg"
                      >
                        {(tournamentState.qualifiers || []).map((q) => (
                          <option key={q.teamId} value={q.teamId}>
                            {q.teamName} (Pot {q.seedingPot}) {q.teamId === playerClubId ? '★ YOU' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {inspectedTeam && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((potNum) => {
                        const potRivals = inspectedRivals.filter((r) => r.rivalPot === potNum);
                        return (
                          <div key={potNum} className="rounded-xl p-3 bg-slate-900/80 border border-white/15">
                            <div className="text-xs font-arcade font-bold text-white/90 mb-2 pb-1.5 border-b border-white/10 flex items-center justify-between">
                              <span>Pot {potNum} Matchups</span>
                              <span className="text-[10px] text-white/50">2 Matches</span>
                            </div>
                            <div className="space-y-2">
                              {potRivals.map((rival, idx) => {
                                const isHome = rival.venue === 'HOME' || (rival as any).isHome;
                                return (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-1.5 ${
                                      isHome
                                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                                        : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                                    }`}
                                  >
                                    <span className="truncate font-bold">{rival.rivalTeamName}</span>
                                    <span className="text-[9px] font-arcade font-black px-1.5 py-0.5 rounded bg-black/40">
                                      {isHome ? 'HOME' : 'AWAY'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* TRADITIONAL GROUPS: SINGLE-GROUP FOCUS ON MOBILE WITH SWIPE SELECTOR */
                <div className="space-y-4">
                  {/* Group Selector Bar */}
                  <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-white/15">
                    <button
                      type="button"
                      onClick={() => setFocusedGroupIndex((prev) => (prev - 1 + groupsList.length) % groupsList.length)}
                      className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[3]" />
                    </button>

                    <div className="flex items-center gap-1.5 overflow-x-auto px-2 max-w-[70vw]">
                      {groupsList.map((g, idx) => {
                        const isSelected = idx === focusedGroupIndex;
                        const isUserGroup = g.id === playerGroup?.id;
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setFocusedGroupIndex(idx)}
                            className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-arcade font-black transition-all cursor-pointer shrink-0 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 shadow-md'
                                : isUserGroup
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                                : 'bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            Grp {g.groupLetter}
                            {isUserGroup && ' ★'}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setFocusedGroupIndex((prev) => (prev + 1) % groupsList.length)}
                      className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>

                  {/* Focused Group Hero Card */}
                  {currentFocusedGroup && (
                    <div className="max-w-xl mx-auto p-5 rounded-2xl bg-slate-900 border-2 border-amber-400/80 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-arcade font-black text-sm flex items-center justify-center">
                            {currentFocusedGroup.groupLetter}
                          </span>
                          <div>
                            <h2 className="text-base font-arcade font-black text-white uppercase">
                              Group {currentFocusedGroup.groupLetter}
                            </h2>
                            <p className="text-[11px] text-slate-400 font-retro">4 Seeded Clubs</p>
                          </div>
                        </div>

                        {currentFocusedGroup.id === playerGroup?.id && (
                          <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-arcade font-black text-[10px] uppercase shadow">
                            ★ YOUR GROUP
                          </span>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {currentFocusedGroup.teams.map((team, idx) => {
                          const isPlayer =
                            (playerClubId && team.id === playerClubId) ||
                            (playerClubName && team.name.toLowerCase() === playerClubName.toLowerCase()) ||
                            team.isPlayer;

                          return (
                            <div
                              key={team.id || idx}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                                isPlayer
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow'
                                  : 'bg-slate-950/70 border-white/10 text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-arcade text-[10px] flex items-center justify-center font-bold">
                                  P{team.seedingPot || idx + 1}
                                </span>
                                <span className="font-arcade font-bold truncate text-sm">
                                  {team.name}
                                </span>
                                {isPlayer && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-white/60">
                                {team.countryCode || 'INT'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 3: FIXTURE SCHEDULE CONFIRMATION */}
          {/* --------------------------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/15 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-arcade font-black text-amber-300 uppercase">
                    Tournament Fixture Calendar Confirmed
                  </h3>
                  <p className="text-xs text-slate-300 font-retro mt-0.5">
                    Matchday dates and opponent tactical scouting ready for the upcoming campaign.
                  </p>
                </div>
                {tournamentState.finalVenue && (
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-white/50 uppercase block font-arcade">Grand Final Venue</span>
                    <span className="text-xs font-bold text-white">
                      {tournamentState.finalVenue.stadium}, {tournamentState.finalVenue.city}
                    </span>
                  </div>
                )}
              </div>

              {/* Matchdays Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: isLeaguePhase ? 8 : 6 }).map((_, idx) => {
                  const md = idx + 1;
                  return (
                    <div key={md} className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-400/40 font-arcade text-xs font-black flex items-center justify-center">
                          {md}
                        </span>
                        <div>
                          <div className="text-xs font-arcade font-bold text-white">
                            Matchday {md}
                          </div>
                          <div className="text-[11px] text-slate-400 font-retro">
                            {isLeaguePhase ? 'Swiss League Round' : 'Group Stage Fixture'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-arcade font-bold px-2 py-0.5 rounded bg-white/10 text-white/80">
                        LOCKED
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION STRIP: PREV STEP / NEXT STEP / CONFIRM BUTTON */}
        {/* ========================================================================= */}
        <footer
          id="continental-draw-modal-footer"
          className="px-3 sm:px-6 py-3 bg-slate-950 border-t-2 border-white/15 flex items-center justify-between gap-3 shrink-0"
        >
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as DrawStageStep)}
              className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-arcade font-bold text-xs uppercase flex items-center gap-1.5 border border-slate-600 transition cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>PREV STEP</span>
            </button>
          ) : (
            <div className="w-24" />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                handleSkip();
                setCurrentStep((prev) => (prev + 1) as DrawStageStep);
              }}
              className="min-h-[48px] min-w-[200px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-95 pixel-bevel-gold"
            >
              <span>{currentStep === 1 ? 'PROCEED TO GROUP DRAW' : 'VIEW FIXTURE SCHEDULE'}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <button
              id="continental-draw-confirm-btn"
              type="button"
              onClick={onClose}
              className="min-h-[48px] min-w-[220px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition cursor-pointer active:scale-95 pixel-bevel-emerald"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>CONFIRM & ENTER TOURNAMENT</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
