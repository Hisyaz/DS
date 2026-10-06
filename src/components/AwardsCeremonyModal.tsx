import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Award,
  Sparkles,
  Crown,
  Shield,
  Star,
  Zap,
  ChevronRight,
  ChevronLeft,
  FastForward,
  CheckCircle2,
  Globe,
  Medal,
  Flame,
  X,
  Layers,
  ArrowRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  WorldAwardsSeasonResults,
  EuropeanGoldenBootEntry,
  GoldenCreatorEntry,
  GoldenBoyNominee,
  YashinNominee,
  BallonDorNominee,
  WorldXICandidate,
  WorldXISelection,
} from '../types/individualAwards';
import { PlayerCardData } from '../types';
import { FlagVector } from './FlagVectors';

export interface AwardsCeremonyModalProps {
  isOpen: boolean;
  awardsData: WorldAwardsSeasonResults;
  onClose: () => void;
  onCeremonyComplete?: () => void;
  player?: PlayerCardData;
  seasonYear?: string;
}

type CeremonyStage =
  | 'intro'
  | 'golden_boot'
  | 'golden_creator'
  | 'golden_boy'
  | 'yashin'
  | 'world_xi'
  | 'ballon_dor'
  | 'grand_finale';

const CEREMONY_STAGES: CeremonyStage[] = [
  'intro',
  'golden_boot',
  'golden_creator',
  'golden_boy',
  'yashin',
  'world_xi',
  'ballon_dor',
  'grand_finale',
];

export const AwardsCeremonyModal: React.FC<AwardsCeremonyModalProps> = ({
  isOpen,
  awardsData,
  onClose,
  onCeremonyComplete,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStage = CEREMONY_STAGES[currentStageIdx];

  const triggerGoldConfetti = () => {
    if (shouldDisableParticles()) return;
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff', '#eab308'],
      });
    } catch (e) {
      // safe fallback
    }
  };

  // Reset revealed count when stage changes
  useEffect(() => {
    setRevealedCount(0);
  }, [currentStageIdx]);

  // Determine items list and length for the current stage
  const getStageItemsInfo = () => {
    switch (currentStage) {
      case 'golden_boot':
        return {
          title: 'BEST STRIKER OF THE YEAR',
          subtitle:
            "Awarded to world football's supreme striker for overall attacking performance, clinical scoring, and decisive impact in the calendar year",
          icon: '⚡',
          type: 'list_5',
          items: awardsData.bestStriker ? [...awardsData.bestStriker].reverse() : [...awardsData.europeanGoldenBoot].reverse(),
          total: awardsData.bestStriker ? awardsData.bestStriker.length : awardsData.europeanGoldenBoot.length,
        };
      case 'golden_creator':
        return {
          title: 'GOLDEN CREATOR',
          subtitle: 'Awarded to the highest playmaker in European league football with tier-weighted assists',
          icon: '🎯',
          type: 'list_5',
          items: [...awardsData.goldenCreator].reverse(),
          total: awardsData.goldenCreator.length,
        };
      case 'golden_boy':
        return {
          title: 'GOLDEN BOY TROPHY',
          subtitle: 'Awarded to the most outstanding U21 football prodigy in world football',
          icon: '🌟',
          type: 'list_5',
          items: [...awardsData.goldenBoy].reverse(),
          total: awardsData.goldenBoy.length,
        };
      case 'yashin':
        return {
          title: 'YASHIN TROPHY',
          subtitle: 'Awarded to the best goalkeeper in world football and designated World XI starter',
          icon: '🧤',
          type: 'list_5',
          items: [...awardsData.yashinTrophy].reverse(),
          total: awardsData.yashinTrophy.length,
        };
      case 'world_xi':
        return {
          title: 'FIFPRO WORLD XI',
          subtitle: `The ultimate global 11 chosen through authentic voting and tactical formation ${awardsData.worldXI.formation}`,
          icon: '🌐',
          type: 'world_xi',
          items: awardsData.worldXI.allEleven,
          total: 11,
        };
      case 'ballon_dor':
        return {
          title: "BALLON D'OR",
          subtitle: 'The supreme individual honor in world football awarded to the ultimate champion of the year',
          icon: '🏆',
          type: 'ballon_dor',
          items: [...awardsData.ballonDor].reverse(), // 15th down to 1st
          total: awardsData.ballonDor.length,
        };
      default:
        return {
          title: 'WORLD INDIVIDUAL AWARDS GALA',
          subtitle: 'Celebrating world football excellence',
          icon: '🏆',
          type: 'intro',
          items: [],
          total: 0,
        };
    }
  };

  const stageInfo = getStageItemsInfo();

  // Auto-reveal interval timer (~1.2 seconds per entry)
  useEffect(() => {
    if (!isOpen) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (isAutoPlaying && currentStage !== 'intro' && currentStage !== 'grand_finale') {
      timerRef.current = setInterval(() => {
        setRevealedCount((prev) => {
          if (prev < stageInfo.total) {
            const next = prev + 1;
            if (next === stageInfo.total) {
              triggerGoldConfetti();
            }
            return next;
          }
          return prev;
        });
      }, 1200);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isAutoPlaying, currentStage, stageInfo.total]);

  if (!isOpen) return null;

  const handleNextStage = () => {
    if (currentStageIdx < CEREMONY_STAGES.length - 1) {
      setCurrentStageIdx((prev) => prev + 1);
    } else {
      onCeremonyComplete();
    }
  };

  const handleSkipCurrentCategory = () => {
    setRevealedCount(stageInfo.total);
    triggerGoldConfetti();
  };

  const handleSkipEntireCeremony = () => {
    onCeremonyComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-6 select-none overflow-y-auto">
      {/* Dynamic Gold & Obsidian Ambient Background Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-gradient-to-b from-amber-600/5 via-amber-400/5 to-transparent blur-2xl pointer-events-none" />

      {/* Main Ceremony Frame */}
      <div className="relative w-full max-w-4xl bg-neutral-950/90 border-2 border-amber-400/60 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden my-auto max-h-[92vh]">
        {/* Top Metallic Gold Header Bar */}
        <div className="bg-gradient-to-r from-neutral-950 via-amber-950/40 to-neutral-950 border-b border-amber-400/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="ceremony-top-back-btn"
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-200 border border-amber-500/40 text-xs font-arcade font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow"
            >
              <ChevronLeft className="w-4 h-4 stroke-[3]" />
              <span>RETURN</span>
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30 text-black font-black text-xl shrink-0">
              🏆
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-black text-amber-400/90 flex items-center gap-2">
                <span>World Football Gala</span>
                <span className="text-amber-400/50">•</span>
                <span className="text-amber-200">{awardsData.seasonYear}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-amber-50 tracking-tight">
                {stageInfo.title}
              </h2>
            </div>
          </div>

          {/* Skip / Close Controls */}
          <div className="flex items-center gap-2">
            <button
              id="ceremony-skip-all-btn"
              onClick={handleSkipEntireCeremony}
              className="px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-amber-300/80 hover:text-amber-200 text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip Ceremony</span>
            </button>
            <button
              id="ceremony-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-amber-400 flex items-center justify-center border border-amber-500/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ceremony Stage Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-[420px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* 1. INTRO STAGE */}
            {currentStage === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8 px-4 flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-800 p-1 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                    <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center text-4xl sm:text-5xl">
                      🏆
                    </div>
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-300 animate-pulse" />
                </div>

                <div className="max-w-xl space-y-2">
                  <div className="text-amber-400 font-extrabold tracking-widest text-xs uppercase">
                    Annual Honors & Global Recognition
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500">
                    WORLD INDIVIDUAL AWARDS
                  </h1>
                  <p className="text-amber-200/70 text-sm sm:text-base">
                    Derived entirely from real simulated matchdays, official league goals, continental clashes, and international tournaments across the entire football ecosystem.
                  </p>
                </div>

                {/* Category Flow Icons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full max-w-2xl pt-2">
                  {[
                    { label: 'Golden Boot', icon: '⚽' },
                    { label: 'Golden Creator', icon: '🎯' },
                    { label: 'Golden Boy', icon: '🌟' },
                    { label: 'Yashin Trophy', icon: '🧤' },
                    { label: 'World XI', icon: '🌐' },
                    { label: "Ballon d'Or", icon: '🏆' },
                  ].map((c, i) => (
                    <div key={i} className="bg-neutral-900/60 border border-amber-400/20 rounded-xl p-2.5 text-center flex flex-col items-center">
                      <span className="text-2xl mb-1">{c.icon}</span>
                      <span className="text-[11px] font-bold text-amber-200/80 leading-tight">{c.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  id="ceremony-begin-btn"
                  onClick={handleNextStage}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-neutral-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Begin Ceremony Presentation</span>
                </button>
              </motion.div>
            )}

            {/* 2. TOP 5 LIST AWARDS (Golden Boot, Golden Creator, Golden Boy, Yashin) */}
            {(currentStage === 'golden_boot' ||
              currentStage === 'golden_creator' ||
              currentStage === 'golden_boy' ||
              currentStage === 'yashin') && (
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="text-center pb-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
                    Category {currentStageIdx} of {CEREMONY_STAGES.length - 2}
                  </span>
                  <p className="text-amber-200/70 text-xs sm:text-sm max-w-lg mx-auto">
                    {stageInfo.subtitle}
                  </p>
                </div>

                {/* Nominees revealed bottom -> top */}
                <div className="space-y-2.5 max-w-2xl mx-auto">
                  {stageInfo.items.map((rawItem: any, idx: number) => {
                    const isRevealed = idx < revealedCount;
                    const isWinner = rawItem.rank === 1 || rawItem.isWinner;

                    if (!isRevealed) {
                      return (
                        <div
                          key={rawItem.id || idx}
                          className="h-14 rounded-2xl bg-neutral-950/40 border border-amber-500/10 flex items-center justify-between px-5 opacity-40"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-amber-500/50">#{rawItem.rank}</span>
                            <span className="text-xs font-mono tracking-widest text-amber-400/40">••••••••••••••••</span>
                          </div>
                          <span className="text-xs text-amber-500/30 font-bold">Unrevealed</span>
                        </div>
                      );
                    }

                    return (
                      <motion.div
                        key={rawItem.id || idx}
                        initial={{ opacity: 0, x: -20, scale: 0.96 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className={`rounded-2xl p-3 sm:p-4 border transition-all flex items-center justify-between gap-3 ${
                          isWinner
                            ? 'bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/60'
                            : 'bg-neutral-900/70 border-amber-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          {/* Rank Badge */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow ${
                              rawItem.rank === 1
                                ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-black shadow-amber-500/40'
                                : rawItem.rank === 2
                                ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black'
                                : rawItem.rank === 3
                                ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                                : 'bg-neutral-800 text-amber-300/70'
                            }`}
                          >
                            {rawItem.rank === 1 ? '🥇' : `#${rawItem.rank}`}
                          </div>

                          {/* Country Flag & Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base font-black text-amber-50 truncate">
                                {rawItem.name}
                              </span>
                              {rawItem.isUserPlayer && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black uppercase">
                                  YOU
                                </span>
                              )}
                              {isWinner && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
                                  WINNER
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-amber-200/70 truncate">
                              <FlagVector countryCode={rawItem.countryCode} className="w-4 h-3 rounded-sm shrink-0" />
                              <span>{rawItem.club}</span>
                              {rawItem.leagueName && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400/80">{rawItem.leagueName}</span>
                                </>
                              )}
                              {rawItem.age && (
                                <>
                                  <span>•</span>
                                  <span>Age {rawItem.age}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Metric Highlights */}
                        <div className="text-right shrink-0">
                          {currentStage === 'golden_boot' && (
                            <div>
                              <div className="text-base sm:text-lg font-black text-amber-300">
                                {rawItem.attackingScore ?? rawItem.weightedPoints} <span className="text-xs font-normal text-amber-400/70">pts</span>
                              </div>
                              <div className="text-[11px] text-amber-200/60 font-mono">
                                {rawItem.goals} goals{rawItem.assists ? ` • ${rawItem.assists} ast` : ''}{rawItem.avgRating ? ` • ${rawItem.avgRating.toFixed(1)}★` : ''}
                              </div>
                            </div>
                          )}
                          {currentStage === 'golden_creator' && (
                            <div>
                              <div className="text-base sm:text-lg font-black text-amber-300">
                                {rawItem.weightedPoints} <span className="text-xs font-normal text-amber-400/70">pts</span>
                              </div>
                              <div className="text-[11px] text-amber-200/60 font-mono">
                                {rawItem.assists} assists × {rawItem.leagueFactor.toFixed(1)}
                              </div>
                            </div>
                          )}
                          {currentStage === 'golden_boy' && (
                            <div>
                              <div className="text-base sm:text-lg font-black text-amber-300">
                                {rawItem.ovr} <span className="text-xs font-normal text-amber-400/70">OVR</span>
                              </div>
                              <div className="text-[11px] font-bold text-amber-400/80">
                                {rawItem.tier}
                              </div>
                            </div>
                          )}
                          {currentStage === 'yashin' && (
                            <div>
                              <div className="text-base sm:text-lg font-black text-amber-300">
                                {rawItem.points} <span className="text-xs font-normal text-amber-400/70">pts</span>
                              </div>
                              <div className="text-[11px] font-mono text-amber-200/60">
                                {rawItem.ovr} OVR
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 5. WORLD XI TACTICAL FORMATION CEREMONY */}
            {currentStage === 'world_xi' && (
              <motion.div
                key="world_xi"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="text-center pb-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Official Formation: {awardsData.worldXI.formation}</span>
                  </div>
                  <p className="text-amber-200/70 text-xs">
                    Featuring Yashin Winner in goal + Top Worldwide Performers strictly by Main Position
                  </p>
                </div>

                {/* Tactical Board Pitch Presentation */}
                <div className="relative rounded-2xl bg-neutral-950 border border-amber-500/40 p-4 overflow-hidden shadow-inner min-h-[300px]">
                  {/* Pitch markings in delicate gold */}
                  <div className="absolute inset-2 border border-amber-500/20 rounded-xl pointer-events-none" />
                  <div className="absolute top-1/2 left-2 right-2 h-px bg-amber-500/20 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-amber-500/20 pointer-events-none" />

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                    {/* Attackers Line */}
                    <div className="flex justify-around items-center">
                      {awardsData.worldXI.attackers.map((p, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30">
                            <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-black text-rose-400">ATT</span>
                              <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-amber-100 mt-1 max-w-[90px] truncate">{p.name}</span>
                          <span className="text-[9px] text-amber-300/70 truncate max-w-[80px]">{p.club}</span>
                        </div>
                      ))}
                    </div>

                    {/* Midfielders Line */}
                    <div className="flex justify-around items-center">
                      {awardsData.worldXI.midfielders.map((p, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30">
                            <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-black text-amber-400">MID</span>
                              <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-amber-100 mt-1 max-w-[90px] truncate">{p.name}</span>
                          <span className="text-[9px] text-amber-300/70 truncate max-w-[80px]">{p.club}</span>
                        </div>
                      ))}
                    </div>

                    {/* Defenders Line */}
                    <div className="flex justify-around items-center">
                      {awardsData.worldXI.defenders.map((p, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30">
                            <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-black text-blue-400">DEF</span>
                              <span className="text-xs font-black text-amber-200">{p.ovr}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-amber-100 mt-1 max-w-[90px] truncate">{p.name}</span>
                          <span className="text-[9px] text-amber-300/70 truncate max-w-[80px]">{p.club}</span>
                        </div>
                      ))}
                    </div>

                    {/* Goalkeeper (Yashin Trophy Winner) */}
                    <div className="flex justify-center items-center">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-700 p-0.5 shadow-xl shadow-yellow-500/40">
                          <div className="w-full h-full rounded-xl bg-neutral-950 flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-emerald-400">GK</span>
                            <span className="text-xs font-black text-amber-200">{awardsData.worldXI.goalkeeper.ovr}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span className="text-[11px] font-black text-amber-100 max-w-[100px] truncate">
                            {awardsData.worldXI.goalkeeper.name}
                          </span>
                        </div>
                        <span className="text-[9px] text-amber-300/70 truncate max-w-[90px]">
                          {awardsData.worldXI.goalkeeper.club}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. BALLON D'OR CEREMONY (15 Nominees revealed bottom -> top) */}
            {currentStage === 'ballon_dor' && (
              <motion.div
                key="ballon_dor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="text-center pb-2">
                  <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 text-xs font-black uppercase tracking-widest mb-1 shadow-md shadow-amber-500/20">
                    👑 THE PINNACLE AWARD
                  </span>
                  <p className="text-amber-200/80 text-xs sm:text-sm">
                    Evaluated by Worldwide Trophy Points & Ultimate Matchday Dominance
                  </p>
                </div>

                <div className="space-y-2 max-w-2xl mx-auto max-h-[340px] overflow-y-auto pr-1">
                  {stageInfo.items.map((rawItem: any, idx: number) => {
                    const isRevealed = idx < revealedCount;
                    const isWinner = rawItem.rank === 1 || rawItem.isWinner;

                    if (!isRevealed) {
                      return (
                        <div
                          key={rawItem.id || idx}
                          className="h-12 rounded-xl bg-neutral-950/40 border border-amber-500/10 flex items-center justify-between px-4 opacity-30"
                        >
                          <span className="text-xs font-bold text-amber-500/40">#{rawItem.rank}</span>
                          <span className="text-xs font-mono tracking-widest text-amber-400/30">••••••••••••••</span>
                          <span className="text-[10px] text-amber-500/30">Classified</span>
                        </div>
                      );
                    }

                    return (
                      <motion.div
                        key={rawItem.id || idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`rounded-2xl p-3 border transition-all flex items-center justify-between gap-3 ${
                          isWinner
                            ? 'bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.5)] ring-2 ring-amber-400'
                            : 'bg-neutral-900/60 border-amber-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                              rawItem.rank === 1
                                ? 'bg-gradient-to-br from-amber-300 to-yellow-500 text-black shadow-lg shadow-amber-500/40'
                                : 'bg-neutral-800 text-amber-300/80'
                            }`}
                          >
                            {rawItem.rank === 1 ? '👑' : `#${rawItem.rank}`}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-amber-50 truncate">
                                {rawItem.name}
                              </span>
                              {rawItem.isUserPlayer && (
                                <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black">
                                  YOU
                                </span>
                              )}
                              {isWinner && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider animate-pulse">
                                  BALLON D'OR WINNER
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-amber-200/60 truncate">
                              <FlagVector countryCode={rawItem.countryCode} className="w-3.5 h-2.5 rounded-sm shrink-0" />
                              <span>{rawItem.club}</span>
                              <span>•</span>
                              <span>{rawItem.ovr} OVR</span>
                              {rawItem.pointsBreakdown?.[0] && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400/90 text-[11px] truncate">{rawItem.pointsBreakdown[0]}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm sm:text-base font-black text-amber-300">
                            {rawItem.points} <span className="text-[10px] font-normal text-amber-400/70">pts</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 7. GRAND FINALE */}
            {currentStage === 'grand_finale' && (
              <motion.div
                key="grand_finale"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6 px-4 space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-1 mx-auto shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                  <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center text-3xl">
                    🌟
                  </div>
                </div>

                <div className="max-w-lg mx-auto space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-amber-100">
                    AWARDS GALA COMPLETE
                  </h2>
                  <p className="text-amber-200/70 text-sm">
                    All individual honors and global rankings have been recorded into the permanent season history archives.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto text-left">
                  <div className="bg-neutral-900/80 border border-amber-500/20 rounded-xl p-3">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold block">Golden Boot</span>
                    <span className="text-xs font-black text-amber-100 truncate block mt-0.5">{awardsData.europeanGoldenBoot[0]?.name}</span>
                    <span className="text-[10px] text-amber-300/60 font-mono">{awardsData.europeanGoldenBoot[0]?.weightedPoints} pts</span>
                  </div>

                  <div className="bg-neutral-900/80 border border-amber-500/20 rounded-xl p-3">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold block">Golden Creator</span>
                    <span className="text-xs font-black text-amber-100 truncate block mt-0.5">{awardsData.goldenCreator[0]?.name}</span>
                    <span className="text-[10px] text-amber-300/60 font-mono">{awardsData.goldenCreator[0]?.weightedPoints} pts</span>
                  </div>

                  <div className="bg-neutral-900/80 border border-amber-500/20 rounded-xl p-3">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold block">Golden Boy</span>
                    <span className="text-xs font-black text-amber-100 truncate block mt-0.5">{awardsData.goldenBoy[0]?.name}</span>
                    <span className="text-[10px] text-amber-300/60 font-mono">{awardsData.goldenBoy[0]?.ovr} OVR</span>
                  </div>

                  <div className="bg-neutral-900/80 border border-amber-500/20 rounded-xl p-3">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold block">Ballon d'Or</span>
                    <span className="text-xs font-black text-amber-100 truncate block mt-0.5">{awardsData.ballonDor[0]?.name}</span>
                    <span className="text-[10px] text-amber-300/60 font-mono">{awardsData.ballonDor[0]?.points} pts</span>
                  </div>
                </div>

                <button
                  id="ceremony-return-summary-btn"
                  onClick={onCeremonyComplete}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-neutral-950 font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Return to Season Summary</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Ceremony Controls Bar */}
        {currentStage !== 'intro' && currentStage !== 'grand_finale' && (
          <div className="bg-neutral-950 border-t border-amber-400/20 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
            <button
              id="ceremony-prev-category-btn"
              type="button"
              disabled={currentStageIdx <= 1}
              onClick={() => setCurrentStageIdx((prev) => Math.max(1, prev - 1))}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-amber-200 text-xs font-bold border border-amber-500/30 transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
              <span>PREVIOUS</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                isAutoPlaying
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
            >
              <span>{isAutoPlaying ? 'PAUSE' : 'AUTO-PLAY'}</span>
            </button>

            <div className="flex items-center gap-2">
              {revealedCount < stageInfo.total ? (
                <button
                  id="ceremony-skip-category-btn"
                  type="button"
                  onClick={handleSkipCurrentCategory}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 text-xs font-bold border border-amber-500/30 transition flex items-center gap-1"
                >
                  <span>REVEAL ALL</span>
                </button>
              ) : (
                <button
                  id="ceremony-next-category-btn"
                  type="button"
                  onClick={handleNextStage}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentStageIdx === CEREMONY_STAGES.length - 2 ? 'FINISH' : 'NEXT AWARD'}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
