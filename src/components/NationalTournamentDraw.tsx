import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Play,
  FastForward,
  CheckCircle,
  Globe,
  Shield,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Flame,
  Star,
  Users,
  Calendar,
  X,
} from 'lucide-react';
import {
  NationalTournamentDrawState,
  TournamentNation,
  getNationalTournamentConfig,
} from '../utils/nationalTournamentManager';

interface NationalTournamentDrawProps {
  drawState: NationalTournamentDrawState;
  onCompleteDraw: (completedDrawState: NationalTournamentDrawState) => void;
  onClose?: () => void;
}

export type NationalDrawStep = 1 | 2 | 3; // 1: Pot Reveal, 2: Group Draw, 3: Fixture Schedule

export const NationalTournamentDraw: React.FC<NationalTournamentDrawProps> = ({
  drawState,
  onCompleteDraw,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<NationalDrawStep>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [revealedTeams, setRevealedTeams] = useState<Set<string>>(new Set());
  const [activeDrawnTeam, setActiveDrawnTeam] = useState<TournamentNation | null>(null);
  const [activeLog, setActiveLog] = useState<string>('Press "Draw Next Nation" to commence the official draw ceremony.');
  const [isDrawFinished, setIsDrawFinished] = useState<boolean>(false);

  // Group carousel index for mobile (0 to groups.length - 1)
  const [focusedGroupIndex, setFocusedGroupIndex] = useState<number>(0);

  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const config = getNationalTournamentConfig(
    drawState.competitionName,
    drawState.playerNation.code,
    drawState.tier
  );

  const theme = config.theme;
  const totalSteps = drawState.animationSteps.length;

  // Find player's group
  const playerGroupIndex = drawState.groups.findIndex((g) =>
    g.teams.some((t) => t.code.toUpperCase() === drawState.playerNation.code.toUpperCase())
  );

  // Focus on player's group initially
  useEffect(() => {
    if (playerGroupIndex >= 0) {
      setFocusedGroupIndex(playerGroupIndex);
    }
  }, [playerGroupIndex]);

  // Step Draw Forward
  const handleNextStep = () => {
    if (currentStepIndex >= totalSteps) {
      finishDraw();
      return;
    }

    const step = drawState.animationSteps[currentStepIndex];
    if (!step) return;

    setActiveDrawnTeam(step.team);
    setActiveLog(step.logText);
    setRevealedTeams((prev) => new Set([...prev, step.team.code]));
    setCurrentStepIndex((prev) => prev + 1);

    if (currentStepIndex + 1 >= totalSteps) {
      finishDraw();
    }
  };

  // Instant Draw
  const handleInstantDraw = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setIsAutoPlaying(false);

    const allCodes = new Set<string>();
    drawState.groups.forEach((g) => {
      g.teams.forEach((t) => allCodes.add(t.code));
    });

    setRevealedTeams(allCodes);
    setCurrentStepIndex(totalSteps);
    setActiveDrawnTeam(drawState.playerNation);
    setActiveLog(`All ${drawState.groups.length} groups have been officially finalized!`);
    finishDraw();
  };

  // Auto-play Toggle
  const toggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (isAutoPlaying && !isDrawFinished) {
      autoPlayRef.current = setInterval(() => {
        handleNextStep();
      }, 500);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, currentStepIndex, isDrawFinished]);

  const finishDraw = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setIsAutoPlaying(false);
    setIsDrawFinished(true);
  };

  // Render Flag Helper
  const renderFlag = (iso: string, name: string) => {
    const cleanIso = (iso || 'un').toLowerCase().replace('gb-', '');
    return (
      <img
        src={`https://flagcdn.com/w40/${cleanIso}.png`}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-5 h-3.5 object-cover rounded shadow-sm border border-slate-700/50"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  };

  const isPlayerNation = (code: string) => {
    return code.toUpperCase() === drawState.playerNation.code.toUpperCase();
  };

  const groupsList = drawState.groups;
  const currentFocusedGroup = groupsList[focusedGroupIndex] || groupsList[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden animate-in fade-in duration-200">
      {/* Dynamic Background Atmosphere */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-90 pointer-events-none`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* ========================================================================= */}
      {/* TOP BAR: BACK BUTTON + TITLE + 3-STEP TABS */}
      {/* ========================================================================= */}
      <header className="relative z-10 w-full px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onClose && (
            <button
              id="national-draw-back-btn"
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-arcade font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>RETURN</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center p-1.5 shadow">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-arcade font-black text-white uppercase tracking-tight">
                {drawState.competitionName}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="text-amber-400 font-bold">{drawState.playerNation.name}</span>
                <span>• Edition {drawState.seasonYear}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stepped Progress Pips */}
        <div className="flex items-center bg-black/50 border border-slate-700/80 rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-arcade font-bold transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Pots
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-arcade font-bold transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Draw
          </button>
          <button
            type="button"
            onClick={() => {
              handleInstantDraw();
              setCurrentStep(3);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-arcade font-bold transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-amber-400 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Schedule
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN STAGE CONTENT */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 flex-1 flex flex-col justify-start overflow-y-auto space-y-4">
        {/* --------------------------------------------------------------------- */}
        {/* STEP 1: POTS REVEAL */}
        {/* --------------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-arcade">
              <span className="text-slate-300 uppercase tracking-wider">
                Official Seeding Pots (4 Pots of Qualified Nations)
              </span>
              <span className="text-amber-400">
                Your Seed: Pot {drawState.playerNation.rank ? Math.min(4, Math.ceil(drawState.playerNation.rank / 8)) : 1}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {drawState.pots.map((pot) => (
                <div key={pot.potNumber} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-md">
                  <div className="text-xs font-arcade font-bold text-amber-300 uppercase tracking-wide mb-2.5 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                    <span>{pot.potLabel}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{pot.teams.length} teams</span>
                  </div>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {pot.teams.map((team) => {
                      const isPlayer = isPlayerNation(team.code);
                      return (
                        <div
                          key={team.code}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isPlayer
                              ? 'bg-amber-500/25 border border-amber-400 text-amber-200 font-bold'
                              : 'bg-slate-950/60 text-slate-200 border border-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {renderFlag(team.iso, team.name)}
                            <span className="truncate">{team.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">OVR {team.ovr}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* STEP 2: ANIMATED GROUP DRAW (SINGLE-GROUP MOBILE FOCUS + CONTROLS) */}
        {/* --------------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Draw Ticker & Control Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                  {activeLog}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                {!isDrawFinished ? (
                  <>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-black text-xs uppercase flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Draw Next</span>
                    </button>
                    <button
                      type="button"
                      onClick={toggleAutoPlay}
                      className={`min-h-[44px] px-3 py-2 rounded-xl font-arcade font-bold text-xs uppercase flex items-center gap-1.5 border transition cursor-pointer ${
                        isAutoPlaying
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>{isAutoPlaying ? 'Pause' : 'Auto'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleInstantDraw}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-arcade text-xs font-bold transition active:scale-95 cursor-pointer"
                    >
                      Instant
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-arcade font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Draw Concluded
                  </span>
                )}
              </div>
            </div>

            {/* Group Navigation Bar */}
            <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
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
                  const isUserGroup = idx === playerGroupIndex;
                  return (
                    <button
                      key={g.letter}
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
                      Grp {g.letter}
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
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-arcade font-black text-sm flex items-center justify-center">
                      {currentFocusedGroup.letter}
                    </span>
                    <div>
                      <h2 className="text-base font-arcade font-black text-white uppercase">
                        {currentFocusedGroup.name}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-retro">Official Group Standings</p>
                    </div>
                  </div>

                  {focusedGroupIndex === playerGroupIndex && (
                    <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-arcade font-black text-[10px] uppercase shadow">
                      ★ YOUR COUNTRY
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {currentFocusedGroup.teams.map((team, idx) => {
                    const isRevealed = revealedTeams.has(team.code);
                    const isPlayer = isPlayerNation(team.code);
                    const isJustDrawn = activeDrawnTeam?.code === team.code;

                    return (
                      <div
                        key={team.code || idx}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          !isRevealed
                            ? 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                            : isPlayer
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow'
                            : isJustDrawn
                            ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                            : 'bg-slate-950/70 border-slate-800 text-slate-200'
                        }`}
                      >
                        {isRevealed ? (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-arcade text-[10px] flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              {renderFlag(team.iso, team.name)}
                              <span className="font-arcade font-bold truncate text-sm">
                                {team.name}
                              </span>
                              {isPlayer && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              OVR {team.ovr}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-600 font-mono text-xs">
                            <span>{idx + 1}.</span>
                            <span>Waiting for draw...</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* STEP 3: SCHEDULE CONFIRMATION */}
        {/* --------------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-arcade font-black text-amber-300 uppercase">
                  Tournament Group Matchdays Confirmed
                </h3>
                <p className="text-xs text-slate-300 font-retro mt-0.5">
                  Your national squad is drawn into Group {drawState.playerGroupLetter}. Fixture dates locked into career calendar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((md) => (
                <div key={md} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-arcade font-bold text-amber-300">
                      Matchday {md}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      SCHEDULED
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-retro">
                    Group Stage Fixture #{md}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* BOTTOM ACTION BAR */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full px-3 sm:px-6 py-3 bg-slate-950 border-t-2 border-slate-800 flex items-center justify-between gap-3 shrink-0">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => (prev - 1) as NationalDrawStep)}
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
              if (currentStep === 1) {
                setCurrentStep(2);
              } else {
                handleInstantDraw();
                setCurrentStep(3);
              }
            }}
            className="min-h-[48px] min-w-[200px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-95 pixel-bevel-gold"
          >
            <span>{currentStep === 1 ? 'PROCEED TO GROUP DRAW' : 'VIEW MATCHDAY SCHEDULE'}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        ) : (
          <button
            id="national-draw-confirm-btn"
            type="button"
            onClick={() => onCompleteDraw({ ...drawState, isCompleted: true })}
            className="min-h-[48px] min-w-[220px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition cursor-pointer active:scale-95 pixel-bevel-emerald animate-pulse"
          >
            <CheckCircle className="w-4 h-4 stroke-[3]" />
            <span>CONFIRM GROUPS & ENTER TOURNAMENT</span>
          </button>
        )}
      </footer>
    </div>
  );
};
