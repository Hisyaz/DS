import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PlayerCardData } from '../types';
import {
  ContactQuality,
  PenaltyShotTarget,
  GoalkeeperAction,
  PenaltyQteOutcome,
} from '../types/penaltyQte';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import { Target, Zap, Trophy, Shield, Play, CheckCircle2, X } from 'lucide-react';

interface PenaltyQteModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  goalkeeperOvr?: number;
  goalkeeperName?: string;
  opponentName?: string;
  stageTitle?: string;
  matchMinute?: number;
  isShootout?: boolean;
  penaltyRoundIndex?: number;
  onComplete: (outcome: PenaltyQteOutcome) => void;
  onClose?: () => void;
}

type StreamlinedPenaltyPhase = 'AIM' | 'POWER' | 'STRIKE' | 'RESULT';

interface TargetZoneDef {
  id: PenaltyShotTarget;
  label: string;
  sublabel: string;
  leftPercent: number; // percentage inside goal frame
  topPercent: number;
  gkAction: GoalkeeperAction;
}

const TARGET_ZONES: TargetZoneDef[] = [
  { id: 'TOP_LEFT', label: 'TOP LEFT', sublabel: 'TOP BIN', leftPercent: 16, topPercent: 20, gkAction: 'TOP_LEFT' },
  { id: 'BOTTOM_LEFT', label: 'BOTTOM LEFT', sublabel: 'LOW CORNER', leftPercent: 18, topPercent: 74, gkAction: 'BOTTOM_LEFT' },
  { id: 'CENTER', label: 'CENTER', sublabel: 'PANENKA / HARD', leftPercent: 50, topPercent: 48, gkAction: 'CENTER' },
  { id: 'TOP_RIGHT', label: 'TOP RIGHT', sublabel: 'TOP BIN', leftPercent: 84, topPercent: 20, gkAction: 'TOP_RIGHT' },
  { id: 'BOTTOM_RIGHT', label: 'BOTTOM RIGHT', sublabel: 'LOW CORNER', leftPercent: 82, topPercent: 74, gkAction: 'BOTTOM_RIGHT' },
];

export const PenaltyQteModal: React.FC<PenaltyQteModalProps> = ({
  isOpen,
  player,
  goalkeeperOvr = 78,
  goalkeeperName = 'Opponent Goalkeeper',
  opponentName = 'Opponents',
  stageTitle = 'Key Match Penalty',
  matchMinute = 78,
  isShootout = false,
  penaltyRoundIndex,
  onComplete,
  onClose,
}) => {
  const { t } = useLanguage();

  // Phase State: AIM -> POWER -> STRIKE -> RESULT
  const [phase, setPhase] = useState<StreamlinedPenaltyPhase>('AIM');

  // Aiming State
  const [activeZoneIndex, setActiveZoneIndex] = useState<number>(2); // Center default
  const [lockedTarget, setLockedTarget] = useState<PenaltyShotTarget | null>(null);

  // Power State
  const [powerPos, setPowerPos] = useState<number>(10);
  const [lockedPower, setLockedPower] = useState<number>(75);
  const [isGoldSweetSpot, setIsGoldSweetSpot] = useState<boolean>(false);

  // Animation & Flight State
  const [strikerRunPos, setStrikerRunPos] = useState<number>(0); // 0 to 1
  const [ballFlightStep, setBallFlightStep] = useState<number>(0); // 0: spot, 1: flying, 2: landed
  const [gkDiveAction, setGkDiveAction] = useState<GoalkeeperAction>('CENTER');
  const [finalOutcome, setFinalOutcome] = useState<PenaltyQteOutcome | null>(null);

  // Animation Loop Refs
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const powerDirRef = useRef<'UP' | 'DOWN'>('UP');
  const sweepAngleRef = useRef<number>(0);
  const powerPosRef = useRef<number>(10);

  // Player Stats Extraction
  const playerShooting = Math.min(
    99,
    Math.max(
      30,
      player.stats?.detailed?.shooting ||
        player.stats?.detailed?.longShots ||
        player.stats?.goa ||
        player.ovr ||
        72
    )
  );

  const playerComposure = Math.min(
    99,
    Math.max(
      30,
      player.stats?.detailed?.composure ||
        player.stats?.detailed?.reactions ||
        player.stats?.men ||
        player.ovr ||
        70
    )
  );

  // Reset state when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setPhase('AIM');
    setActiveZoneIndex(0);
    setLockedTarget(null);
    setPowerPos(15);
    powerPosRef.current = 15;
    setLockedPower(75);
    setIsGoldSweetSpot(false);
    setStrikerRunPos(0);
    setBallFlightStep(0);
    setGkDiveAction('CENTER');
    setFinalOutcome(null);
    powerDirRef.current = 'UP';
    sweepAngleRef.current = 0;
  }, [isOpen]);

  // Phase 1: Aiming Sweeping Crosshair Loop
  useEffect(() => {
    if (!isOpen || phase !== 'AIM') return;

    let localAngle = sweepAngleRef.current;
    let lastTs = performance.now();

    const loop = (ts: number) => {
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      // Rotate smoothly across target zones every ~0.65s per zone
      localAngle += dt * 2.8;
      sweepAngleRef.current = localAngle;

      const zoneCount = TARGET_ZONES.length;
      // Cycle through 0 -> 1 -> 2 -> 3 -> 4 -> 3 -> 2 -> 1 ...
      const pingPong = Math.floor(Math.abs(Math.sin(localAngle * 0.8) * zoneCount * 0.999));
      const clampedIndex = Math.max(0, Math.min(zoneCount - 1, pingPong));
      setActiveZoneIndex(clampedIndex);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, phase]);

  // Phase 2: Power Meter Oscillation Loop
  useEffect(() => {
    if (!isOpen || phase !== 'POWER') return;

    // Higher stat = more controlled, easier to hit sweet spot
    const composureFactor = (playerComposure * 0.6 + playerShooting * 0.4) / 99;
    const speed = Math.max(85, 175 - composureFactor * 75); // % per second

    let currentVal = powerPosRef.current;
    let direction = powerDirRef.current;
    let lastTs = performance.now();

    const loop = (ts: number) => {
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      if (direction === 'UP') {
        currentVal += speed * dt;
        if (currentVal >= 100) {
          currentVal = 100;
          direction = 'DOWN';
        }
      } else {
        currentVal -= speed * dt;
        if (currentVal <= 0) {
          currentVal = 0;
          direction = 'UP';
        }
      }

      powerDirRef.current = direction;
      powerPosRef.current = currentVal;
      setPowerPos(currentVal);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, phase, playerShooting, playerComposure]);

  // Resolve Penalty Physics & Outcome Calculation
  const resolvePenalty = useCallback(
    (target: PenaltyShotTarget, power: number) => {
      setPhase('STRIKE');
      setBallFlightStep(1);
      audioManager.playKickSound();
      haptics.firmImpact();

      // Striker run-up animation
      setStrikerRunPos(1);

      // Gold Sweet Spot is 75% - 90%
      const isSweetSpot = power >= 75 && power <= 90;
      const isOverhit = power > 92;
      const isWeak = power < 45;

      // Contact Tier
      let contactTier: ContactQuality = 'NORMAL';
      if (isSweetSpot) contactTier = 'PERFECT';
      else if (power < 25) contactTier = 'EARLY_MISS';
      else if (power > 96) contactTier = 'LATE_WHIFF';

      // Goalkeeper Decision Logic:
      // The keeper guesses one of 5 zones (weighted by their OVR)
      const zoneIds: GoalkeeperAction[] = ['TOP_LEFT', 'BOTTOM_LEFT', 'CENTER', 'TOP_RIGHT', 'BOTTOM_RIGHT'];
      // Chance of guessing correctly based on Goalkeeper OVR vs Player Composure
      const keeperIntelChance = Math.max(0.20, Math.min(0.55, 0.28 + (goalkeeperOvr - playerComposure) * 0.005));
      const targetDef = TARGET_ZONES.find((z) => z.id === target) || TARGET_ZONES[2];

      let keeperDivesTo: GoalkeeperAction;
      const keeperGuessedCorrect = Math.random() < keeperIntelChance;

      if (keeperGuessedCorrect) {
        keeperDivesTo = targetDef.gkAction;
      } else {
        const otherZones = zoneIds.filter((z) => z !== targetDef.gkAction);
        keeperDivesTo = otherZones[Math.floor(Math.random() * otherZones.length)];
      }

      setGkDiveAction(keeperDivesTo);

      // Calculate Scoring Chance %
      let scoringChance = 75;
      let isGoal = false;
      let isSaved = false;
      let isMissed = false;
      let missReason: PenaltyQteOutcome['missReason'];

      if (isOverhit && Math.random() < 0.65) {
        // Blasted over the crossbar
        isMissed = true;
        isGoal = false;
        missReason = 'OVERHIT';
        scoringChance = 10;
      } else if (isWeak && Math.random() < 0.55) {
        // Weak roll, keeper gathers easily
        isSaved = true;
        isGoal = false;
        missReason = 'WEAK_POTENCY';
        scoringChance = 30;
      } else if (isSweetSpot) {
        // 75% - 90% UNSTOPPABLE LASER STRIKE
        // Even if keeper dived to the right corner, high velocity beats them 92% of the time!
        scoringChance = keeperGuessedCorrect ? 88 : 98;
        isGoal = Math.random() * 100 < scoringChance;
        isSaved = !isGoal;
        if (isSaved) missReason = 'SAVED';
      } else {
        // Standard power (50% - 74% or 91% - 92%)
        scoringChance = keeperGuessedCorrect ? 42 : 90;
        isGoal = Math.random() * 100 < scoringChance;
        isSaved = !isGoal;
        if (isSaved) missReason = 'SAVED';
      }

      // Ball Lands after 600ms flight
      setTimeout(() => {
        setBallFlightStep(2);
        if (isGoal) {
          audioManager.playGoalNetSound();
          audioManager.playGoalCelebrationChant();
          audioManager.playGoalExplosion();
          haptics.success();
          try {
            confetti({
              particleCount: 70,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#22c55e', '#38bdf8', '#facc15', '#ffffff'],
            });
          } catch {}
        } else {
          audioManager.playFailBuzz();
          haptics.heavyRumble();
        }

        const targetLabel = t(targetDef.label);
        const outcome: PenaltyQteOutcome = {
          success: isGoal,
          isGoal,
          isSaved,
          isMissed,
          missReason,
          contactTier,
          contactBonus: isSweetSpot ? 40 : 0,
          verticalContact: targetDef.topPercent > 50 ? -0.8 : 0.8,
          horizontalContact: targetDef.leftPercent < 40 ? -0.8 : targetDef.leftPercent > 60 ? 0.8 : 0,
          shotTarget: target,
          gkAction: keeperDivesTo,
          gkGuessedCorrect: keeperGuessedCorrect,
          potencyValue: Math.round(power),
          potencyQuality: isSweetSpot ? 'PERFECT' : isOverhit ? 'OVERHIT' : isWeak ? 'WEAK' : 'GOOD',
          playerShooting,
          playerComposure,
          goalkeeperOvr,
          calculatedScoringChance: scoringChance,
          headline: isGoal
            ? isSweetSpot
              ? t('UNSTOPPABLE GOLD STRIKE! ⚽')
              : t('GOAL! PENALTY SCORED! ⚽')
            : isSaved
            ? t('SAVED BY GOALKEEPER! 🧤')
            : t('MISSED OVER CROSSBAR! ❌'),
          commentary: isGoal
            ? isSweetSpot
              ? t('{name} unleashes a devastating 90% power rocket into the {corner}! The keeper had no chance!', {
                  name: player.name,
                  corner: targetLabel,
                })
              : t('{name} sends the goalkeeper the wrong way and buries the penalty into the {corner}!', {
                  name: player.name,
                  corner: targetLabel,
                })
            : isSaved
            ? t('{gk} anticipates the strike into the {corner} and makes a heroic diving block!', {
                gk: goalkeeperName,
                corner: targetLabel,
              })
            : t('{name} struck the penalty with too much elevation, rocketing it high into the crowd!', {
                name: player.name,
              }),
        };

        setFinalOutcome(outcome);
        // Show result banner after short delay
        setTimeout(() => setPhase('RESULT'), 650);
      }, 600);
    },
    [player, playerShooting, playerComposure, goalkeeperOvr, goalkeeperName, t]
  );

  // Action Button Handler (Aim -> Power -> Strike -> Complete)
  const handlePrimaryAction = useCallback(() => {
    if (phase === 'AIM') {
      const chosenTarget = TARGET_ZONES[activeZoneIndex]?.id || 'CENTER';
      setLockedTarget(chosenTarget);
      audioManager.playKickSound();
      haptics.mediumTap();
      setPhase('POWER');
      return;
    }

    if (phase === 'POWER') {
      const finalPower = powerPos;
      setLockedPower(finalPower);
      setIsGoldSweetSpot(finalPower >= 75 && finalPower <= 90);
      resolvePenalty(lockedTarget || 'CENTER', finalPower);
      return;
    }

    if (phase === 'RESULT') {
      if (finalOutcome) {
        onComplete(finalOutcome);
        if (onClose) onClose();
      }
    }
  }, [phase, activeZoneIndex, powerPos, lockedTarget, resolvePenalty, finalOutcome, onComplete, onClose]);

  // Direct Zone Click Handler (Touch / Click directly on Goal)
  const handleSelectZoneDirectly = useCallback(
    (targetId: PenaltyShotTarget) => {
      if (phase !== 'AIM') return;
      setLockedTarget(targetId);
      audioManager.playKickSound();
      haptics.mediumTap();
      setPhase('POWER');
    },
    [phase]
  );

  // Global Keyboard Listener (Spacebar / Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handlePrimaryAction();
      } else if (e.code === 'ArrowLeft' && phase === 'AIM') {
        e.preventDefault();
        setActiveZoneIndex((prev) => Math.max(0, prev - 1));
      } else if (e.code === 'ArrowRight' && phase === 'AIM') {
        e.preventDefault();
        setActiveZoneIndex((prev) => Math.min(TARGET_ZONES.length - 1, prev + 1));
      } else if (e.code === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, phase, handlePrimaryAction, onClose]);

  if (!isOpen) return null;

  const currentZoneDef = TARGET_ZONES[activeZoneIndex] || TARGET_ZONES[2];
  const activeLockedDef = TARGET_ZONES.find((z) => z.id === lockedTarget) || currentZoneDef;

  return createPortal(
    <div
      id="penalty-qte-fullscreen-arena"
      className="fixed inset-0 z-[9999999] w-screen h-screen bg-[#030712] flex flex-col justify-between overflow-hidden select-none font-pixel text-white animate-in fade-in duration-200"
    >
      {/* Retro Arcade Scanline Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none z-30 opacity-25" />

      {/* ========================================================================= */}
      {/* 1. TOP BROADCAST SCOREBOARD BAR (Single Sleek 32-Bit Header) */}
      {/* ========================================================================= */}
      <header className="w-full bg-slate-950/95 border-b-2 sm:border-b-4 border-amber-400 pixel-bevel-gold px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 z-40 shadow-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-400 text-slate-950 pixel-bevel-gold flex items-center justify-center text-sm sm:text-base font-black shrink-0 shadow-md">
            ⚽
          </div>
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-amber-300 uppercase tracking-widest font-black font-arcade truncate flex items-center gap-1.5">
              <span>
                {isShootout
                  ? `★ ${t('PENALTY SHOOTOUT • ROUND {round} OF 5', { round: `${penaltyRoundIndex ?? 1}` })} ★`
                  : `★ ${t('MATCH PENALTY • {min}\' MINUTE', { min: `${matchMinute}` })} ★`}
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-black tracking-wide uppercase text-white truncate pixel-text-shadow">
              {t(stageTitle)}
            </h1>
          </div>
        </div>

        {/* Striker vs Goalkeeper Stats HUD */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <div className="hidden xs:flex items-center gap-3 text-right text-[10px] sm:text-xs">
            <div className="bg-slate-900/90 border border-slate-700 px-2.5 py-1 pixel-corners">
              <span className="text-slate-400">{t('STRIKER')}: </span>
              <strong className="text-emerald-400 font-arcade">{player.name}</strong>
              <span className="text-amber-300 ml-1 font-arcade">({playerShooting} SHO)</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-700 px-2.5 py-1 pixel-corners">
              <span className="text-slate-400">{t('GK')}: </span>
              <strong className="text-amber-400 font-arcade">{goalkeeperName}</strong>
              <span className="text-cyan-300 ml-1 font-arcade">({goalkeeperOvr} OVR)</span>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-2 border-slate-700 pixel-bevel-raised cursor-pointer text-xs"
              title={t('Close')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN FULL-SCREEN STADIUM ARENA (Goal, Pitch, Goalkeeper, Ball, Striker) */}
      {/* ========================================================================= */}
      <main className="relative flex-1 w-full bg-slate-950 flex flex-col items-center justify-between overflow-hidden z-10">
        {/* UPPER 52%: Stadium Sky, Floodlights, Animated Grandstands & GOAL */}
        <div className="relative w-full h-[54%] bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] flex flex-col items-center justify-end overflow-hidden border-b-4 border-white/80 shadow-2xl">
          
          {/* Stadium Floodlights Beams */}
          <div className="absolute -top-10 left-10 w-72 h-96 bg-gradient-to-b from-amber-200/20 via-white/10 to-transparent blur-2xl pointer-events-none -rotate-12" />
          <div className="absolute -top-10 right-10 w-72 h-96 bg-gradient-to-b from-cyan-200/20 via-white/10 to-transparent blur-2xl pointer-events-none rotate-12" />

          {/* Animated Stadium Crowd Grandstands in Background */}
          <div className="absolute inset-x-0 top-0 h-32 opacity-35 pointer-events-none flex flex-col justify-start">
            <div className="w-full h-8 bg-[repeating-linear-gradient(to_right,#334155_0px,#334155_8px,#475569_8px,#475569_16px,#0284c7_16px,#0284c7_24px,#ef4444_24px,#ef4444_32px)]" />
            <div className="w-full h-8 bg-[repeating-linear-gradient(to_right,#1e293b_0px,#1e293b_10px,#334155_10px,#334155_20px,#eab308_20px,#eab308_30px)]" />
            <div className="w-full h-8 bg-[repeating-linear-gradient(to_right,#0f172a_0px,#0f172a_12px,#1e293b_12px,#1e293b_24px,#10b981_24px,#10b981_36px)]" />
          </div>

          {/* Atmospheric Match Context Banner (Floating at top of stadium) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="px-3 py-1 bg-slate-950/85 border border-amber-400/60 pixel-corners pixel-bevel-gold text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {phase === 'AIM'
                  ? t('STEP 1: SELECT YOUR TARGET CORNER (TAP GOAL OR PRESS SPACEBAR)')
                  : phase === 'POWER'
                  ? t('STEP 2: LOCK SHOT POWER (75%-90% GOLD ZONE = UNSTOPPABLE!)')
                  : phase === 'STRIKE'
                  ? t('THE STRIKE IS UNLEASHED!')
                  : t('PENALTY RESOLUTION COMPLETE')}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE MASSIVE FULL-SIZE ARCADE GOAL FRAME */}
          {/* ========================================================================= */}
          <div
            id="penalty-goal-target-arena"
            className="relative w-[92vw] max-w-4xl h-[78%] border-t-[6px] sm:border-t-8 border-x-[6px] sm:border-x-8 border-white shadow-[0_12px_40px_rgba(0,0,0,0.9)] bg-slate-950/70 z-10 overflow-hidden flex flex-col justify-between"
          >
            {/* Hexagonal / Diamond Goal Net Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[size:14px_14px]" />

            {/* Net Ripple Neon Wave on Goal */}
            {phase === 'RESULT' && finalOutcome?.isGoal && (
              <div className="absolute inset-0 bg-emerald-500/20 animate-pulse pointer-events-none shadow-[inset_0_0_50px_rgba(34,197,94,0.6)]" />
            )}

            {/* ================= GOALKEEPER SPRITE ================= */}
            <div
              className={`absolute transition-all duration-300 origin-bottom z-15 ${
                phase === 'STRIKE' || phase === 'RESULT'
                  ? gkDiveAction === 'TOP_LEFT'
                    ? 'left-8 top-3 rotate-[-35deg] scale-125 sm:scale-140'
                    : gkDiveAction === 'BOTTOM_LEFT'
                    ? 'left-10 bottom-0 rotate-[-22deg] scale-125 sm:scale-140'
                    : gkDiveAction === 'TOP_RIGHT'
                    ? 'right-8 top-3 rotate-[35deg] scale-125 sm:scale-140'
                    : gkDiveAction === 'BOTTOM_RIGHT'
                    ? 'right-10 bottom-0 rotate-[22deg] scale-125 sm:scale-140'
                    : 'left-1/2 -translate-x-1/2 bottom-0 scale-125 sm:scale-140'
                  : 'left-1/2 -translate-x-1/2 bottom-0 scale-110 sm:scale-130'
              }`}
            >
              <div className="w-16 h-24 flex flex-col items-center justify-start relative">
                {/* GK Gloves */}
                <div className="absolute -left-3.5 top-6 w-4 h-4 bg-amber-400 border border-slate-900 rounded-sm shadow-md" />
                <div className="absolute -right-3.5 top-6 w-4 h-4 bg-amber-400 border border-slate-900 rounded-sm shadow-md" />
                {/* GK Head */}
                <div className="w-7 h-7 bg-amber-200 border-2 border-slate-900 rounded-sm flex items-center justify-center text-xs">
                  🧤
                </div>
                {/* GK Jersey */}
                <div className="w-12 h-10 bg-yellow-400 border-2 border-slate-900 mt-0.5 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[9px] font-black text-slate-950 tracking-tighter">GK 1</span>
                </div>
                {/* GK Shorts & Legs */}
                <div className="w-10 h-5 bg-slate-950 flex justify-between px-1.5">
                  <div className="w-3.5 h-5 bg-amber-200 border-x border-slate-900" />
                  <div className="w-3.5 h-5 bg-amber-200 border-x border-slate-900" />
                </div>
              </div>
            </div>

            {/* Goalkeeper Glove Save Impact Starburst */}
            {(phase === 'STRIKE' || phase === 'RESULT') && finalOutcome?.isSaved && (
              <div className="absolute top-[28%] left-1/2 -translate-x-1/2 z-25 flex flex-col items-center pointer-events-none animate-bounce">
                <div className="text-3xl">🧤💥</div>
                <div className="text-xs font-black text-amber-300 bg-slate-950/95 px-3 py-1 pixel-corners border border-amber-400 shadow-xl">
                  {t('PARRIED BY KEEPER!')}
                </div>
              </div>
            )}

            {/* ================= 5 INTERACTIVE TARGET ZONES ON GOAL ================= */}
            {TARGET_ZONES.map((zone, idx) => {
              const isHighlighted = phase === 'AIM' && activeZoneIndex === idx;
              const isLocked = (phase === 'POWER' || phase === 'STRIKE' || phase === 'RESULT') && lockedTarget === zone.id;

              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleSelectZoneDirectly(zone.id)}
                  disabled={phase !== 'AIM'}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 h-20 sm:h-24 pixel-corners border-2 transition-all flex flex-col items-center justify-center z-20 cursor-pointer ${
                    isLocked
                      ? 'border-amber-400 bg-amber-400/30 ring-4 ring-amber-300 shadow-[0_0_25px_#f59e0b] scale-105'
                      : isHighlighted
                      ? 'border-cyan-400 bg-cyan-400/25 ring-2 ring-cyan-300 shadow-[0_0_20px_#22d3ee] scale-105 animate-pulse'
                      : phase === 'AIM'
                      ? 'border-white/30 bg-slate-900/40 hover:border-cyan-300 hover:bg-cyan-500/20'
                      : 'border-transparent opacity-0 pointer-events-none'
                  }`}
                  style={{
                    left: `${zone.leftPercent}%`,
                    top: `${zone.topPercent}%`,
                  }}
                  title={t('Select {label}', { label: zone.label })}
                >
                  <Target
                    className={`w-6 h-6 mb-1 ${
                      isLocked ? 'text-amber-300 animate-spin' : isHighlighted ? 'text-cyan-300' : 'text-white/60'
                    }`}
                  />
                  <span className="text-[9px] sm:text-[10px] font-black tracking-wider uppercase text-white font-arcade">
                    {t(zone.label)}
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-bold text-amber-300 font-retro">
                    {t(zone.sublabel)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Goal Line Horizon Marker on the Pitch */}
          <div className="w-full h-2 bg-white shadow-md z-10" />
        </div>

        {/* LOWER 48%: Lush Green Pitch, Penalty Spot, Ball, Power Gauge & Striker */}
        <div className="relative w-full h-[46%] bg-gradient-to-b from-[#15803d] via-[#16a34a] to-[#14532d] flex flex-col items-center justify-between p-3 sm:p-5 overflow-hidden">
          
          {/* Alternating Retro Pitch Cut Stripes */}
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(to_bottom,#15803d_0px,#15803d_18px,#16a34a_18px,#16a34a_36px)] pointer-events-none" />

          {/* 18-Yard Box Lines & Penalty Arc */}
          <div className="absolute inset-x-8 top-0 h-32 border-x-4 border-b-4 border-white/60 bg-white/5 pointer-events-none" />
          <div className="absolute left-1/2 -translate-x-1/2 top-32 w-36 h-14 border-b-4 border-white/50 rounded-b-full pointer-events-none" />

          {/* ========================================================================= */}
          {/* DYNAMIC POWER GAUGE HUD (Prominent Arcade Power Meter) */}
          {/* ========================================================================= */}
          {phase === 'POWER' && (
            <div className="w-full max-w-xl bg-slate-950/95 border-2 sm:border-4 border-amber-400 pixel-corners pixel-bevel-gold p-3 space-y-2 z-25 shadow-2xl animate-in zoom-in-95 duration-150 backdrop-blur-md">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-black uppercase font-arcade">
                <span className="text-rose-400">⚠️ {t('LOW')}</span>
                <span className="text-cyan-300">{t('PLACED FINISH (50%-74%)')}</span>
                <span className="text-amber-300 bg-amber-950/90 px-2 py-0.5 pixel-corners border border-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse">
                  ★ {t('75%-90% GOLD LASER (UNSTOPPABLE)')} ★
                </span>
                <span className="text-rose-400">⚠️ {t('OVERHIT (>92%)')}</span>
              </div>

              {/* The Actual Oscillating Meter Bar */}
              <div className="relative h-10 sm:h-12 bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-sunken overflow-hidden flex items-center shadow-inner">
                {/* Bar Gradient Fill */}
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-emerald-500 via-amber-400 to-rose-600 transition-none"
                  style={{ width: `${powerPos}%` }}
                />

                {/* 75% - 90% GOLD SWEET SPOT ZONE OVERLAY */}
                <div
                  className="absolute top-0 bottom-0 bg-amber-400/40 border-x-2 border-amber-200 z-10 flex items-center justify-center shadow-[0_0_20px_#f59e0b]"
                  style={{ left: '75%', width: '15%' }}
                >
                  <span className="text-[8px] font-black text-slate-950 bg-amber-300 px-1 pixel-corners shadow font-arcade uppercase">
                    ★ SWEET SPOT ★
                  </span>
                </div>

                {/* Active Indicator Needle */}
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-white border-2 border-slate-950 shadow-[0_0_12px_#ffffff] z-20 transition-none"
                  style={{ left: `calc(${powerPos}% - 5px)` }}
                />
              </div>

              <div className="text-center text-xs font-black font-arcade">
                {powerPos >= 75 && powerPos <= 90 ? (
                  <span className="text-amber-300 animate-bounce">
                    🔥 {t('GOLD SWEET SPOT! ({power}%) — UNSTOPPABLE CORNER LASER!', { power: `${Math.round(powerPos)}` })}
                  </span>
                ) : powerPos > 92 ? (
                  <span className="text-rose-400 animate-pulse">
                    ⚠️ {t('OVERHIT! ({power}%) — DANGER OF BLASTING OVER THE BAR!', { power: `${Math.round(powerPos)}` })}
                  </span>
                ) : (
                  <span className="text-slate-200">
                    {t('SHOT POWER')}: <strong className="text-cyan-300 font-arcade">{Math.round(powerPos)}%</strong>{' '}
                    <span className="text-[10px] text-slate-400 font-retro">
                      ({t('TAP SCREEN OR PRESS SPACEBAR TO STRIKE!')})
                    </span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* THE SOCCER BALL WITH PERSPECTIVE FLIGHT PHYSICS */}
          {/* ========================================================================= */}
          <div
            className={`absolute z-20 transition-all ${
              ballFlightStep === 0
                ? 'bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2'
                : ballFlightStep === 1
                ? finalOutcome?.missReason === 'OVERHIT'
                  ? 'bottom-[92%] left-1/2 -translate-x-1/2 scale-40 duration-500 ease-out'
                  : activeLockedDef.id === 'TOP_LEFT'
                  ? 'bottom-[65%] left-[18%] -translate-x-1/2 scale-60 duration-500 ease-out'
                  : activeLockedDef.id === 'BOTTOM_LEFT'
                  ? 'bottom-[48%] left-[20%] -translate-x-1/2 scale-65 duration-500 ease-out'
                  : activeLockedDef.id === 'TOP_RIGHT'
                  ? 'bottom-[65%] left-[82%] -translate-x-1/2 scale-60 duration-500 ease-out'
                  : activeLockedDef.id === 'BOTTOM_RIGHT'
                  ? 'bottom-[48%] left-[80%] -translate-x-1/2 scale-65 duration-500 ease-out'
                  : 'bottom-[56%] left-1/2 -translate-x-1/2 scale-60 duration-500 ease-out'
                : finalOutcome?.missReason === 'OVERHIT'
                ? '-top-20 left-1/2 -translate-x-1/2 scale-25 duration-300'
                : activeLockedDef.id === 'TOP_LEFT'
                ? 'bottom-[72%] left-[16%] -translate-x-1/2 scale-50 duration-200'
                : activeLockedDef.id === 'BOTTOM_LEFT'
                ? 'bottom-[48%] left-[18%] -translate-x-1/2 scale-55 duration-200'
                : activeLockedDef.id === 'TOP_RIGHT'
                ? 'bottom-[72%] left-[84%] -translate-x-1/2 scale-50 duration-200'
                : activeLockedDef.id === 'BOTTOM_RIGHT'
                ? 'bottom-[48%] left-[82%] -translate-x-1/2 scale-55 duration-200'
                : 'bottom-[58%] left-1/2 -translate-x-1/2 scale-50 duration-200'
            }`}
          >
            {/* Penalty Spot Turf Marker */}
            {ballFlightStep === 0 && (
              <>
                <div className="absolute -bottom-1 w-6 h-2 bg-black/60 rounded-full blur-[1px]" />
                <div className="absolute -bottom-0.5 w-4 h-1.5 bg-white/90 rounded-full" />
              </>
            )}

            {/* 3D Soccer Ball Graphic */}
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-400 border-2 border-slate-800 flex items-center justify-center font-black text-slate-900 text-sm shadow-2xl transition-all ${
                isGoldSweetSpot && ballFlightStep > 0
                  ? 'ring-4 ring-amber-300 shadow-[0_0_35px_#f59e0b] scale-125'
                  : ''
              }`}
            >
              ⚽
            </div>
          </div>

          {/* ================= STRIKER FIGURE ON TURF ================= */}
          <div
            className={`absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-15 flex flex-col items-center pointer-events-none transition-transform duration-200 ${
              strikerRunPos === 1 ? 'translate-y-[-14px] scale-105' : ''
            }`}
          >
            {/* Striker Head */}
            <div className="w-6 h-6 pixel-corners bg-slate-900 border border-slate-700 flex items-center justify-center text-xs">
              👤
            </div>
            {/* Striker Team Jersey */}
            <div className="w-11 h-9 bg-gradient-to-b from-blue-600 to-blue-800 border-2 border-slate-900 pixel-corners flex flex-col items-center justify-center shadow-md">
              <span className="text-[7px] font-black text-white leading-none">
                {player.name.slice(0, 5).toUpperCase()}
              </span>
              <span className="text-[10px] font-black text-amber-300 leading-none">
                {player.shirtNumber || 10}
              </span>
            </div>
            {/* Shorts & Running Legs */}
            <div className="w-10 h-3.5 bg-white border-x border-b border-slate-900 flex justify-between px-1" />
            <div className="flex gap-1 mt-0.5">
              <div className="w-3 h-4 bg-amber-200 border-x border-slate-800" />
              <div className="w-3 h-4 bg-amber-200 border-x border-slate-800" />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RESULT OVERLAY BANNER (When Strike has Concluded) */}
          {/* ========================================================================= */}
          {phase === 'RESULT' && finalOutcome && (
            <div className="w-full max-w-xl bg-slate-950/98 border-2 sm:border-4 border-amber-400 pixel-corners pixel-bevel-gold p-4 space-y-3 z-30 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div
                className={`py-2 px-4 pixel-corners text-sm sm:text-base font-black uppercase tracking-wider font-pixel shadow-xl ${
                  finalOutcome.isGoal
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 text-white border-2 border-emerald-300 animate-pulse'
                    : finalOutcome.isSaved
                    ? 'bg-rose-950 text-rose-300 border-2 border-rose-500'
                    : 'bg-slate-900 text-amber-300 border-2 border-amber-400'
                }`}
              >
                {finalOutcome.headline}
              </div>

              <p className="text-xs text-slate-200 font-retro leading-relaxed">
                {finalOutcome.commentary}
              </p>

              {/* Match Stats Summary Pill */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-900 border border-slate-700 p-2 text-slate-300 font-arcade">
                <div>
                  {t('TARGET')}: <strong className="text-white">{t(activeLockedDef.label)}</strong>
                </div>
                <div>
                  {t('POWER')}: <strong className="text-amber-300">{finalOutcome.potencyValue}%</strong>
                </div>
                <div>
                  {t('GK DIVE')}: <strong className="text-cyan-300">{t(finalOutcome.gkAction)}</strong>
                </div>
                <div>
                  {t('SCORING CHANCE')}: <strong className="text-emerald-400">{finalOutcome.calculatedScoringChance}%</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM FULL-WIDTH ARCADE MASTER ACTION BUTTON */}
      {/* ========================================================================= */}
      <footer className="w-full bg-slate-950/95 border-t-2 sm:border-t-4 border-amber-400 pixel-bevel-gold p-3 sm:p-4 shrink-0 z-40 shadow-2xl">
        <button
          id="penalty-qte-master-action-button"
          type="button"
          onClick={handlePrimaryAction}
          className="w-full max-w-2xl mx-auto py-3.5 sm:py-4 px-6 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-xs sm:text-base uppercase tracking-wider border-2 border-yellow-200 pixel-corners pixel-bevel-gold shadow-2xl cursor-pointer transition-all flex items-center justify-center gap-2 font-pixel"
        >
          <span className="font-arcade">[{t('SPACEBAR / CLICK')}]</span>
          <span className="pixel-text-shadow">
            {phase === 'AIM'
              ? `★ ${t('LOCK TARGET')} (${t(currentZoneDef.label)}) ★`
              : phase === 'POWER'
              ? `★ ${t('RELEASE POWER & STRIKE')} ★`
              : phase === 'STRIKE'
              ? `★ ${t('IN FLIGHT...')} ★`
              : `★ ${t('CONTINUE MATCH')} ★`}
          </span>
        </button>
      </footer>
    </div>,
    document.body
  );
};
