import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PlayerConfig } from '../types';
import {
  KeyMomentEvent,
  QTEResultQuality,
  QTEResultOutcome,
  MatchCommentaryLog,
  KeyMatchFinalSummary,
} from '../types/keyMatch';
import {
  generateKeyMomentsForMatch,
  generateExtraTimeMoments,
  generateClutchTimeMoments,
  generateExtraTimeHalfMoments,
  evaluateQTEOutcome,
  calculateMatchMvpStatus,
  getMatchImportanceConfig,
  matchAudio,
} from '../utils/keyMatchEngine';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';
import {
  checkManagerSelection,
  MatchParticipationStatus,
} from '../utils/staminaInjurySystem';
import { PenaltyQteModal } from './PenaltyQteModal';
import { PenaltyQteOutcome } from '../types/penaltyQte';
import {
  Trophy,
  Play,
  Pause,
  FastForward,
  Sparkles,
  Shield,
  Target,
  Flame,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Zap,
  Crosshair,
  Volume2,
  VolumeX,
  ArrowRight,
  Activity,
  GraduationCap,
  HelpCircle,
  UserCheck,
  UserX,
  Swords,
  Brain,
  Wand2,
  Mic,
  Newspaper,
  Skull,
} from 'lucide-react';
import { DuelCalculationResult } from '../utils/duelSystem';
import { classifyMatchImportance } from '../utils/matchImportanceSystem';
import { PostMatchInterviewModal } from './PostMatchInterviewModal';
import { InterviewQuestionContext, InterviewOutcomeResult } from '../types/interviewCards';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/localizationSystem';
import { getContinentalVisualTheme } from '../utils/continentalVisualThemeSystem';
import { isClubLegendAt, getClubStatusFromPoints } from '../utils/clubIconPointsSystem';

interface KeyMatchModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  playerTeamName?: string;
  stageTitle: string; // e.g., "International Youth Tournament Semi-Final"
  opponentName: string;
  opponentOvr: number;
  playerMatchStatus?: MatchParticipationStatus;
  subEntryMinute?: number;
  subExitMinute?: number;
  onMatchComplete: (result: KeyMatchFinalSummary) => void;
}

/**
 * Reusable Duel Matchup HUD Banner displaying User vs Key Player / Squad OVR matchup
 */
const DuelMatchupBanner: React.FC<{
  matchup: DuelCalculationResult;
  playerName: string;
  playerPosition: string;
}> = ({ matchup, playerName, playerPosition }) => {
  const { duelDef, userStatValue, userComposure, userEffectiveScore, oppEffectiveScore, opponent, advantageLabel } = matchup;

  const categoryColor =
    duelDef.category === 'DEFENDING'
      ? 'from-blue-950/90 via-slate-900 to-slate-950 border-blue-500/70 text-blue-300'
      : duelDef.category === 'CREATION'
      ? 'from-purple-950/90 via-slate-900 to-slate-950 border-purple-500/70 text-purple-300'
      : 'from-amber-950/90 via-slate-900 to-slate-950 border-amber-500/70 text-amber-300';

  const categoryBadge =
    duelDef.category === 'DEFENDING' ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-blue-500/20 text-blue-300 border border-blue-400/50 text-[9px] font-black uppercase font-pixel">
        <Shield className="w-3 h-3 text-blue-400" /> {t('DEFENDING DUEL')}
      </span>
    ) : duelDef.category === 'CREATION' ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-purple-500/20 text-purple-300 border border-purple-400/50 text-[9px] font-black uppercase font-pixel">
        <Wand2 className="w-3 h-3 text-purple-400" /> {t('CREATION DUEL')}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[9px] font-black uppercase font-pixel">
        <Target className="w-3 h-3 text-amber-400" /> {t('GOALSCORING DUEL')}
      </span>
    );

  return (
    <div className={`p-3 pixel-corners bg-gradient-to-b ${categoryColor} border-2 pixel-bevel-raised shadow-lg space-y-2 text-left select-none font-pixel`}>
      <div className="flex items-center justify-between">
        {categoryBadge}
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider font-pixel">
          {t(advantageLabel)}
        </span>
      </div>

      {/* Versus Grid */}
      <div className="grid grid-cols-11 items-center gap-1.5">
        {/* User Card */}
        <div className="col-span-5 bg-slate-950/90 border-2 border-emerald-500/60 pixel-corners pixel-bevel-sunken p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-400 truncate max-w-[100px] uppercase">{playerName}</span>
            <span className="text-[8px] font-arcade px-1 pixel-corners bg-emerald-500/20 text-emerald-300">{playerPosition}</span>
          </div>
          <div className="text-[9px] text-slate-300 flex items-center justify-between">
            <span>{t(duelDef.userStatLabel)} (60%):</span>
            <strong className="text-white font-arcade">{userStatValue}</strong>
          </div>
          <div className="text-[9px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1"><Brain className="w-2.5 h-2.5 text-indigo-400" /> {t('Composure')} (40%):</span>
            <strong className="text-indigo-300 font-arcade">{userComposure}</strong>
          </div>
          <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-bold">{t('Effective Power')}:</span>
            <strong className="text-emerald-300 font-black text-xs font-arcade">{userEffectiveScore}</strong>
          </div>
        </div>

        {/* Center VS */}
        <div className="col-span-1 flex flex-col items-center justify-center text-center">
          <div className="w-7 h-7 pixel-corners bg-slate-900 border-2 border-amber-400/80 pixel-bevel-raised flex items-center justify-center shadow-md">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-[8px] font-black text-amber-400 mt-0.5 font-arcade">VS</span>
        </div>

        {/* Opponent Card */}
        <div className="col-span-5 bg-slate-950/90 border-2 border-rose-500/60 pixel-corners pixel-bevel-sunken p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-rose-300 truncate max-w-[100px] uppercase">{opponent.name}</span>
            <span className="text-[8px] font-arcade px-1 pixel-corners bg-rose-500/20 text-rose-300 truncate max-w-[60px]">{t(opponent.roleLabel)}</span>
          </div>
          <div className="text-[9px] text-slate-300 flex items-center justify-between">
            <span>{t(duelDef.oppStatLabel)} (60%):</span>
            <strong className="text-white font-arcade">{opponent.statValue}</strong>
          </div>
          <div className="text-[9px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1"><Brain className="w-2.5 h-2.5 text-indigo-400" /> {t('Composure')} (40%):</span>
            <strong className="text-indigo-300 font-arcade">{opponent.composure}</strong>
          </div>
          <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-rose-400 font-bold">{t('Effective Power')}:</span>
            <strong className="text-rose-300 font-black text-xs font-arcade">{oppEffectiveScore}</strong>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[10px] text-slate-300 leading-snug italic pt-0.5 bg-slate-950/60 px-2 py-1 pixel-corners border border-slate-800">
        "{t(duelDef.description)}"
      </p>
    </div>
  );
};

/**
 * Reusable 3-Zone Timing Bar Gauge (Blue 100%, Green 80%, Orange 60%, Miss 0%)
 * 32-Bit Pixel-Art Arcade Precision Gauge
 */
const QTETimingBarGauge: React.FC<{
  qteGaugePos?: number;
  cursorRef?: React.RefObject<HTMLDivElement | null>;
  blueWidth: number;
  greenWidth: number;
  orangeWidth: number;
  label?: string;
}> = ({ qteGaugePos = 0, cursorRef, blueWidth, greenWidth, orangeWidth, label }) => {
  return (
    <div className="space-y-1.5 text-left select-none font-pixel">
      {label && (
        <div className="text-[9px] font-black text-amber-400 uppercase tracking-wider flex justify-between select-none">
          <span className="pixel-text-shadow">{label}</span>
          <span className="text-slate-300 text-[8px] font-arcade">{t('🔵 BLUE 100% | 🟢 GREEN 80% | 🟠 ORANGE 60%')}</span>
        </div>
      )}

      {/* Retro 32-bit Meter Track */}
      <div className="h-10 w-full bg-slate-950 pixel-corners border-2 border-slate-700 pixel-bevel-sunken relative overflow-hidden flex items-center shadow-inner select-none">
        {/* Pixel Tick Markings top & bottom */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,#334155_0px,#334155_2px,transparent_2px,transparent_8px)] opacity-60 pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,#334155_0px,#334155_2px,transparent_2px,transparent_8px)] opacity-60 pointer-events-none z-20" />

        {/* ❌ Too Early Zone (Left) */}
        <div className="absolute left-0 top-0 bottom-0 bg-rose-950/70 border-r-2 border-rose-500/40 flex items-center justify-start pl-2 text-[8px] font-black text-rose-400/80 uppercase select-none font-arcade">
          {t('Early')}
        </div>

        {/* 🟠 Orange Zone (60% Success) */}
        <div
          className="absolute top-0 bottom-0 bg-amber-500/40 border-x-2 border-amber-400/70 flex items-center justify-center text-[8px] font-black text-amber-200 uppercase tracking-tighter select-none font-arcade"
          style={{
            left: `${50 - orangeWidth / 2}%`,
            width: `${orangeWidth}%`,
          }}
        >
          <span className="hidden sm:inline text-[7px]">{t('ORANGE 60%')}</span>
        </div>

        {/* 🟢 Green Zone (80% Success) */}
        <div
          className="absolute top-0 bottom-0 bg-emerald-500/70 border-x-2 border-emerald-300 flex items-center justify-center text-[9px] font-black text-emerald-100 uppercase tracking-wider shadow-[0_0_8px_rgba(16,185,129,0.5)] select-none font-arcade"
          style={{
            left: `${50 - greenWidth / 2}%`,
            width: `${greenWidth}%`,
          }}
        >
          <span className="hidden sm:inline text-[8px]">{t('GREEN 80%')}</span>
        </div>

        {/* 🔵 Blue Center Line (100% Success) */}
        <div
          className="absolute top-0 bottom-0 bg-cyan-400 border-x-2 border-white shadow-[0_0_12px_rgba(34,211,238,1)] animate-pulse z-10 flex items-center justify-center"
          style={{
            left: `${50 - blueWidth / 2}%`,
            width: `${blueWidth}%`,
          }}
        >
          <div className="w-full h-full bg-cyan-300" />
        </div>

        {/* ❌ Too Late Zone (Right) */}
        <div className="absolute right-0 top-0 bottom-0 bg-rose-950/70 border-l-2 border-rose-500/40 flex items-center justify-end pr-2 text-[8px] font-black text-rose-400/80 uppercase select-none font-arcade">
          {t('Late')}
        </div>

        {/* 🎯 Moving Retro Needle Cursor */}
        <div
          ref={cursorRef}
          className="absolute top-0 bottom-0 w-3.5 bg-amber-300 border-2 border-slate-950 pixel-corners shadow-[0_0_10px_#f59e0b] z-30 flex flex-col items-center justify-between -translate-x-1/2 transition-none will-change-[left]"
          style={{ left: `${qteGaugePos}%` }}
        >
          <div className="w-1.5 h-1.5 bg-amber-500 pixel-corners" />
          <div className="w-1 h-3.5 bg-slate-950" />
          <div className="w-1.5 h-1.5 bg-amber-500 pixel-corners" />
        </div>
      </div>
    </div>
  );
};

export const KeyMatchModal: React.FC<KeyMatchModalProps> = ({
  isOpen,
  player,
  playerTeamName: customPlayerTeamName,
  stageTitle,
  opponentName,
  opponentOvr,
  playerMatchStatus,
  subEntryMinute,
  subExitMinute,
  onMatchComplete,
}) => {
  const { t } = useLanguage();
  // Determine actual player participation status
  const managerDecision = checkManagerSelection(player);
  let defaultStatus: MatchParticipationStatus = 'starter';
  if (player.isInjured) {
    defaultStatus = 'not_called';
  } else if (managerDecision.willBeSelected) {
    defaultStatus = 'starter';
  } else {
    defaultStatus = Math.random() < 0.6 ? 'sub_entered' : 'sub_did_not_enter';
  }

  const effectiveStatus = playerMatchStatus || defaultStatus;
  const effectiveSubMin = subEntryMinute || 60;
  const effectiveSubExitMin = subExitMinute || 65;

  const [hasTriggeredClutchTime, setHasTriggeredClutchTime] = useState<boolean>(false);
  const [hasEnteredExtraTimeHalf2, setHasEnteredExtraTimeHalf2] = useState<boolean>(false);
  const [isSubbedOutCompleted, setIsSubbedOutCompleted] = useState<boolean>(false);
  // Match Clock & Simulation State
  const [matchMinute, setMatchMinute] = useState<number>(0);
  const [secondInMinute, setSecondInMinute] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.getIsMuted());

  // Activate competition music transition & stadium acoustics for the duration of Key Match, returning to domestic playlist upon exit
  useEffect(() => {
    if (isOpen) {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.enterMatchContextFromStage(
        stageTitle,
        player as any,
        opponentName,
        customPlayerTeamName,
        clubCountry
      );
    }
    return () => {
      const clubCountry = (player as any)?.clubCountry || player.country;
      audioManager.exitMatchMode(clubCountry);
    };
  }, [isOpen, stageTitle, player, opponentName, customPlayerTeamName]);

  useEffect(() => {
    const unsub = audioManager.subscribe(() => {
      setIsMuted(audioManager.getIsMuted());
    });
    return unsub;
  }, []);

  // Scores & Stats
  const [playerTeamScore, setPlayerTeamScore] = useState<number>(0);
  const [opponentTeamScore, setOpponentTeamScore] = useState<number>(0);
  const [playerGoals, setPlayerGoals] = useState<number>(0);
  const [playerAssists, setPlayerAssists] = useState<number>(0);
  const [playerSaves, setPlayerSaves] = useState<number>(0);
  const [playerTackles, setPlayerTackles] = useState<number>(0);
  const [playerRating, setPlayerRating] = useState<number>(6.5);
  const [matchFameDelta, setMatchFameDelta] = useState<number>(0);
  const [qteSuccessCount, setQteSuccessCount] = useState<number>(0);
  const [qteTotalCount, setQteTotalCount] = useState<number>(0);

  // QTE Quality Performance Breakdown
  const [qtePerfectCount, setQtePerfectCount] = useState<number>(0);
  const [qteGoodCount, setQteGoodCount] = useState<number>(0);
  const [qteFailedCount, setQteFailedCount] = useState<number>(0);

  // Post-Match Interview System State
  const [showInterviewModal, setShowInterviewModal] = useState<boolean>(false);
  const [interviewOutcome, setInterviewOutcome] = useState<InterviewOutcomeResult | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerCardData>(player as PlayerCardData);

  // QTE Tutorial State
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialResult, setTutorialResult] = useState<QTEResultOutcome | null>(null);

  // Commentary Log
  const [commentaryLogs, setCommentaryLogs] = useState<MatchCommentaryLog[]>([]);

  // Key Moments Queue & Current Active QTE
  const [keyMoments, setKeyMoments] = useState<KeyMomentEvent[]>([]);
  const [activeMoment, setActiveMoment] = useState<KeyMomentEvent | null>(null);
  const [lastQteOutcome, setLastQteOutcome] = useState<QTEResultOutcome | null>(null);

  // High-performance QTE Animation Refs (eliminates 60fps React re-renders)
  const qteGaugePosRef = useRef<number>(0);
  const gaugeDirectionRef = useRef<'UP' | 'DOWN'>('UP');
  const mainGaugeCursorRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tutorialPracticePosRef = useRef<number>(0);
  const tutorialGaugeDirRef = useRef<'UP' | 'DOWN'>('UP');
  const tutorialGaugeCursorRef = useRef<HTMLDivElement | null>(null);
  const tutAnimFrameRef = useRef<number | null>(null);
  const tutLastTimeRef = useRef<number | null>(null);

  // Extra Time & Penalty Shootout State
  const [isExtraTime, setIsExtraTime] = useState<boolean>(false);
  const [isPenaltyShootout, setIsPenaltyShootout] = useState<boolean>(false);
  const [penaltyRound, setPenaltyRound] = useState<number>(1);
  const [penaltyPlayerScore, setPenaltyPlayerScore] = useState<number>(0);
  const [penaltyOpponentScore, setPenaltyOpponentScore] = useState<number>(0);
  const [penaltyResultText, setPenaltyResultText] = useState<string>('');

  // Final Match Summary State
  const [matchPhase, setMatchPhase] = useState<'CINEMATIC_INTRO' | 'LIVE_MATCH' | 'PENALTY_SHOOTOUT' | 'MATCH_SUMMARY'>('CINEMATIC_INTRO');
  const [lineupInfo, setLineupInfo] = useState({
    stadiumName: 'National Youth Arena',
    capacity: '18,500',
    weather: 'Clear Skies (21°C)',
    atmosphere: 'Sellout Crowd',
    playerTeamFormation: '4-3-3 Attacking',
    opponentTeamFormation: '4-2-3-1 Compact',
    opponentStarPlayer: `${opponentName} Captain`,
  });
  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(false);
  const [finalSummary, setFinalSummary] = useState<KeyMatchFinalSummary | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const qteDismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playerTeamName = customPlayerTeamName || player.club || 'Youth Academy';
  const importanceEval = classifyMatchImportance({
    stageTitle,
    teamAName: playerTeamName,
    teamBName: opponentName,
    betrayedClubs: (player as any).betrayedClubs,
    playerPlayMode: player.keyMatchPlayMode || 'decisive',
  });
  const impConfig = getMatchImportanceConfig(stageTitle, activeMoment || undefined);

  // Continental Visual Identity Theme
  const contTheme = getContinentalVisualTheme(stageTitle || importanceEval.stageTitleDisplay || (player as any).league);
  const isClubLegendHere = isClubLegendAt(player, playerTeamName);
  const clubStatusInfo = getClubStatusFromPoints((player.clubIconPoints || {})[playerTeamName] || 0);

  // Add a commentary log item
  const addCommentary = useCallback((text: string, type: MatchCommentaryLog['type'] = 'general') => {
    setCommentaryLogs((prev) => [
      { id: `c-${Date.now()}-${Math.random()}`, minute: matchMinute, text, type },
      ...prev,
    ]);
  }, [matchMinute]);

  // Handle Match Kickoff / Tutorial check
  const handleKickoffMatch = () => {
    let tutorialDone = false;
    if (player.tutorialEnabled === false) {
      tutorialDone = true;
    } else {
      try {
        if (typeof window !== 'undefined') {
          tutorialDone = localStorage.getItem('key_match_qte_tutorial_done_v1') === 'true';
        }
      } catch (e) {
        console.warn('Storage access blocked:', e);
      }
    }
    if (!tutorialDone) {
      setShowTutorial(true);
      tutorialPracticePosRef.current = 0;
      tutorialGaugeDirRef.current = 'UP';
      setTutorialResult(null);
    } else {
      setMatchPhase('LIVE_MATCH');
      if (!isMuted) matchAudio.playWhistle();
      if (effectiveStatus === 'sub_entered' || effectiveStatus === 'sub_in') {
        const startMin = Math.max(45, effectiveSubMin);
        setMatchMinute(startMin);
        addCommentary(
          `⏱️ (0'-${startMin - 1}'): Early match action simulated. ${player.name} starts on the bench. Current score: ${playerTeamName} ${playerTeamScore} - ${opponentName} ${opponentTeamScore}.`,
          'general'
        );
        addCommentary(
          `🔁 SUBSTITUTION (${startMin}'): ${player.name} is subbed into the match off the bench! Key Match QTEs activated!`,
          'moment'
        );
      } else {
        setMatchMinute(0);
      }
      if (importanceEval.isBetrayedClubMatch) {
        addCommentary(
          `💀 [HOSTILE INFERNO] Deafening whistles erupt as ${player.name} steps onto the pitch! ${opponentName} ultras hold up 'JUDAS' banners and venomous betrayer signs!`,
          'card'
        );
      }
    }
  };

  const handleOpenTutorialManually = () => {
    setShowTutorial(true);
    tutorialPracticePosRef.current = 0;
    tutorialGaugeDirRef.current = 'UP';
    setTutorialResult(null);
  };

  // Practice Tutorial RAF Loop (hardware-accelerated, zero React re-render lag)
  useEffect(() => {
    if (!showTutorial || tutorialResult) {
      if (tutAnimFrameRef.current) {
        cancelAnimationFrame(tutAnimFrameRef.current);
        tutAnimFrameRef.current = null;
      }
      return;
    }

    tutorialPracticePosRef.current = 0;
    tutorialGaugeDirRef.current = 'UP';
    tutLastTimeRef.current = performance.now();

    if (tutorialGaugeCursorRef.current) {
      tutorialGaugeCursorRef.current.style.left = '0%';
    }

    // 156.25% per second = 100% traversal in ~0.64s constant speed across all displays
    const SWEEP_SPEED = 156.25;

    const animateTut = (now: number) => {
      if (!tutLastTimeRef.current) tutLastTimeRef.current = now;
      const deltaSec = Math.min((now - tutLastTimeRef.current) / 1000, 0.05);
      tutLastTimeRef.current = now;

      let current = tutorialPracticePosRef.current;
      let dir = tutorialGaugeDirRef.current;
      const step = deltaSec * SWEEP_SPEED;

      if (dir === 'UP') {
        current += step;
        if (current >= 100) {
          current = 100 - (current - 100);
          tutorialGaugeDirRef.current = 'DOWN';
        }
      } else {
        current -= step;
        if (current <= 0) {
          current = Math.abs(current);
          tutorialGaugeDirRef.current = 'UP';
        }
      }

      const clamped = Math.max(0, Math.min(100, current));
      tutorialPracticePosRef.current = clamped;

      if (tutorialGaugeCursorRef.current) {
        tutorialGaugeCursorRef.current.style.left = `${clamped.toFixed(2)}%`;
      }

      tutAnimFrameRef.current = requestAnimationFrame(animateTut);
    };

    tutAnimFrameRef.current = requestAnimationFrame(animateTut);

    return () => {
      if (tutAnimFrameRef.current) {
        cancelAnimationFrame(tutAnimFrameRef.current);
        tutAnimFrameRef.current = null;
      }
    };
  }, [showTutorial, tutorialResult]);

  const handlePracticeExecute = useCallback(() => {
    if (tutorialResult) return;
    const dummyMoment: KeyMomentEvent = {
      id: 'tut-1',
      minute: 1,
      title: 'Training Practice Moment',
      description: 'Practice timing in the GREEN zone!',
      actionType: 'SHOOT',
      momentType: 'BOX_FINISHING',
      relevantAttribute: 'shooting',
      difficulty: 'EASY',
    };

    const outcome = evaluateQTEOutcome(player, dummyMoment, tutorialPracticePosRef.current, 'Practice Training');
    setTutorialResult(outcome);
  }, [player, tutorialResult]);

  const handleCompleteTutorial = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('key_match_qte_tutorial_done_v1', 'true');
      }
    } catch (e) {
      console.warn('Storage access blocked:', e);
    }
    setShowTutorial(false);
    setMatchPhase('LIVE_MATCH');
    if (!isMuted) matchAudio.playWhistle();
    if (effectiveStatus === 'sub_entered' || effectiveStatus === 'sub_in') {
      const startMin = Math.max(45, effectiveSubMin);
      setMatchMinute(startMin);
      addCommentary(
        `⏱️ (0'-${startMin - 1}'): Early match action simulated. ${player.name} starts on the bench. Current score: ${playerTeamName} ${playerTeamScore} - ${opponentName} ${opponentTeamScore}.`,
        'general'
      );
      addCommentary(
        `🔁 SUBSTITUTION (${startMin}'): ${player.name} is subbed into the match off the bench! Key Match QTEs activated!`,
        'moment'
      );
    } else {
      setMatchMinute(0);
    }
  };

  // Initialize Match State
  useEffect(() => {
    if (!isOpen) return;

    if (qteDismissTimeoutRef.current) {
      clearTimeout(qteDismissTimeoutRef.current);
      qteDismissTimeoutRef.current = null;
    }

    setMatchPhase('CINEMATIC_INTRO');
    setShowTutorial(false);
    setMatchMinute(0);
    setSecondInMinute(0);
    setIsPaused(false);
    setPlayerTeamScore(0);
    setOpponentTeamScore(0);
    setPlayerGoals(0);
    setPlayerAssists(0);
    setPlayerSaves(0);
    setPlayerTackles(0);
    setPlayerRating(6.5);
    setQteSuccessCount(0);
    setQteTotalCount(0);
    setQtePerfectCount(0);
    setQteGoodCount(0);
    setQteFailedCount(0);
    setCommentaryLogs([]);
    setActiveMoment(null);
    setLastQteOutcome(null);
    setIsExtraTime(false);
    setIsPenaltyShootout(false);
    setIsMatchFinished(false);
    setFinalSummary(null);
    setHasTriggeredClutchTime(false);
    setHasEnteredExtraTimeHalf2(false);
    setIsSubbedOutCompleted(false);

    qteGaugePosRef.current = 0;
    gaugeDirectionRef.current = 'UP';

    let generatedMoments = generateKeyMomentsForMatch(player, stageTitle, opponentName, opponentOvr);
    if (effectiveStatus === 'sub_entered' || effectiveStatus === 'sub_in') {
      const postSub = generatedMoments.filter((m) => m.minute >= effectiveSubMin);
      generatedMoments =
        postSub.length > 0
          ? postSub
          : generatedMoments.slice(0, 3).map((m, idx) => ({
              ...m,
              minute: Math.min(88, effectiveSubMin + 6 + idx * 9),
            }));
    } else if (effectiveStatus === 'sub_out') {
      const preSub = generatedMoments.filter((m) => m.minute < effectiveSubExitMin);
      generatedMoments =
        preSub.length > 0
          ? preSub
          : generatedMoments.slice(0, 2).map((m, idx) => ({
              ...m,
              minute: 15 + idx * 20,
            }));
    }
    setKeyMoments(generatedMoments.slice(0, 5));

    if (!isMuted) matchAudio.playWhistle();

    setCommentaryLogs([
      {
        id: 'init-1',
        minute: 0,
        text: `KICK OFF! ${stageTitle} is underway at the stadium between ${playerTeamName} and ${opponentName}!`,
        type: 'whistle',
      },
    ]);
  }, [isOpen, player, stageTitle, opponentName, playerTeamName, isMuted, effectiveStatus, effectiveSubMin, effectiveSubExitMin]);

  // QTE Meter Movement RAF Loop when QTE is active or in Penalty Shootout
  useEffect(() => {
    const isQTEActive = !!(activeMoment || (isPenaltyShootout && !isMatchFinished));
    if (!isQTEActive) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    qteGaugePosRef.current = 0;
    gaugeDirectionRef.current = 'UP';
    lastTimeRef.current = performance.now();

    if (mainGaugeCursorRef.current) {
      mainGaugeCursorRef.current.style.left = '0%';
    }

    const SWEEP_SPEED = 156.25;

    const animate = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const deltaSec = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      let current = qteGaugePosRef.current;
      let dir = gaugeDirectionRef.current;
      const step = deltaSec * SWEEP_SPEED;

      if (dir === 'UP') {
        current += step;
        if (current >= 100) {
          current = 100 - (current - 100);
          gaugeDirectionRef.current = 'DOWN';
        }
      } else {
        current -= step;
        if (current <= 0) {
          current = Math.abs(current);
          gaugeDirectionRef.current = 'UP';
        }
      }

      const clamped = Math.max(0, Math.min(100, current));
      qteGaugePosRef.current = clamped;

      if (mainGaugeCursorRef.current) {
        mainGaugeCursorRef.current.style.left = `${clamped.toFixed(2)}%`;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [activeMoment, isPenaltyShootout, isMatchFinished]);

  // Dismiss QTE outcome immediately and continue fast match simulation
  const handleDismissQteOutcomeImmediately = useCallback(() => {
    if (qteDismissTimeoutRef.current) {
      clearTimeout(qteDismissTimeoutRef.current);
      qteDismissTimeoutRef.current = null;
    }
    setActiveMoment(null);
    setLastQteOutcome(null);
    setIsPaused(false);
  }, []);

  // Handle QTE Trigger Button Action
  const handleExecuteQTE = useCallback(() => {
    if (!activeMoment || lastQteOutcome) return;

    const currentPos = qteGaugePosRef.current;
    const outcome = evaluateQTEOutcome(player, activeMoment, currentPos, stageTitle);
    setLastQteOutcome(outcome);
    setQteTotalCount((prev) => prev + 1);

    if (outcome.quality === 'PERFECT') {
      setQtePerfectCount((p) => p + 1);
      haptics.success();
    } else if (outcome.quality === 'GOOD') {
      setQteGoodCount((g) => g + 1);
      haptics.mediumTap();
    } else {
      setQteFailedCount((f) => f + 1);
      haptics.heavyRumble();
    }

    if (outcome.success) {
      setQteSuccessCount((prev) => prev + 1);
      if (outcome.statBonus.goal) {
        setPlayerGoals((g) => g + 1);
        setPlayerTeamScore((s) => s + 1);
        audioManager.playGoalExplosion();
      }
      if (outcome.statBonus.assist) {
        setPlayerAssists((a) => a + 1);
        setPlayerTeamScore((s) => s + 1);
        audioManager.playGoalExplosion();
      }
      if (outcome.statBonus.save) setPlayerSaves((s) => s + 1);
      if (outcome.statBonus.tackle) setPlayerTackles((t) => t + 1);
    } else {
      // If a defensive QTE action is failed and resulted in a conceded goal
      if (outcome.statBonus.concededGoal) {
        setOpponentTeamScore((s) => s + 1);
        if (!isMuted) matchAudio.playWhistle();
      }
    }

    if (outcome.statBonus.fameDelta) {
      setMatchFameDelta((prev) => prev + outcome.statBonus.fameDelta!);
      setCurrentPlayer((prev) => ({
        ...prev,
        fame: Math.max(0, (prev.fame || 0) + outcome.statBonus.fameDelta!),
      }));
    }

    setPlayerRating((prev) => parseFloat(Math.min(10.0, Math.max(3.0, prev + outcome.statBonus.ratingDelta)).toFixed(2)));
    addCommentary(`[KEY MOMENT - ${outcome.timingFeedback}] ${outcome.commentary}`, outcome.success ? 'goal' : 'card');

    // Clear active QTE after punchy display delay and resume fast simulation
    if (qteDismissTimeoutRef.current) {
      clearTimeout(qteDismissTimeoutRef.current);
    }
    const autoAdvanceMs = Math.max(650, Math.round(1100 / simSpeed));
    qteDismissTimeoutRef.current = setTimeout(() => {
      handleDismissQteOutcomeImmediately();
    }, autoAdvanceMs);
  }, [activeMoment, lastQteOutcome, player, stageTitle, simSpeed, addCommentary, handleDismissQteOutcomeImmediately]);

  // Handle In-Match Awarded Penalty QTE Outcome
  const handlePenaltyMomentOutcome = useCallback(
    (outcome: PenaltyQteOutcome) => {
      setQteTotalCount((prev) => prev + 1);
      if (outcome.contactTier === 'PERFECT' && outcome.potencyQuality === 'PERFECT') {
        setQtePerfectCount((p) => p + 1);
      } else if (outcome.success) {
        setQteGoodCount((g) => g + 1);
      } else {
        setQteFailedCount((f) => f + 1);
      }

      if (outcome.success) {
        setQteSuccessCount((prev) => prev + 1);
        setPlayerGoals((g) => g + 1);
        setPlayerTeamScore((s) => s + 1);
        setPlayerRating((prev) =>
          parseFloat(Math.min(10.0, Math.max(4.0, prev + 0.8)).toFixed(1))
        );
        addCommentary(`⚽ GOAL! ${outcome.headline} ${outcome.commentary}`, 'goal');
      } else {
        setPlayerRating((prev) =>
          parseFloat(Math.min(10.0, Math.max(4.0, prev - 0.3)).toFixed(1))
        );
        addCommentary(
          `❌ PENALTY MISSED! ${outcome.headline} ${outcome.commentary}`,
          'card'
        );
      }

      handleDismissQteOutcomeImmediately();
    },
    [addCommentary, handleDismissQteOutcomeImmediately]
  );

  // Wrap up match & compute summary
  const finishMatch = useCallback((
    finalPScore: number,
    finalOppScore: number,
    wentET: boolean,
    wentPens: boolean,
    penPScore?: number,
    penOppScore?: number
  ) => {
    if (qteDismissTimeoutRef.current) {
      clearTimeout(qteDismissTimeoutRef.current);
      qteDismissTimeoutRef.current = null;
    }
    setMatchPhase('MATCH_SUMMARY');
    setIsMatchFinished(true);
    if (!isMuted) matchAudio.playWhistle();

    const isWinner = finalPScore > finalOppScore;
    const isDraw = finalPScore === finalOppScore;
    const mvpStatus = calculateMatchMvpStatus(
      playerGoals,
      playerAssists,
      playerSaves,
      playerTackles,
      playerRating,
      isWinner
    );

    let qteImpactText = 'Average Performance';
    if (qtePerfectCount >= 3 || (playerGoals >= 2 && isWinner)) {
      qteImpactText = '⭐ Match Winner';
    } else if (qtePerfectCount + qteGoodCount >= 3 || playerRating >= 7.5) {
      qteImpactText = 'Top Performer';
    } else if (qteFailedCount <= 1) {
      qteImpactText = 'Solid Performance';
    } else {
      qteImpactText = 'Average Performance';
    }

    const baseFame = isWinner ? 5 : isDraw ? 3 : 2;
    const fameEarned = baseFame + matchFameDelta;

    const summary: KeyMatchFinalSummary = {
      matchTitle: stageTitle,
      playerTeamName,
      opponentTeamName: opponentName,
      playerTeamScore: finalPScore,
      opponentTeamScore: finalOppScore,
      wentToExtraTime: wentET,
      wentToPenalties: wentPens,
      penaltyPlayerTeamScore: penPScore,
      penaltyOpponentTeamScore: penOppScore,
      isWinner,
      playerStats: {
        goals: playerGoals,
        assists: playerAssists,
        saves: playerSaves,
        tackles: playerTackles,
        interceptions: 2,
        rating: playerRating,
        qteSuccessCount,
        qteTotalCount,
        qtePerfectCount,
        qteGoodCount,
        qteFailedCount,
      },
      mvpStatus,
      qteImpactText,
      fameEarned,
    };

    setFinalSummary(summary);
  }, [
    isMuted,
    playerGoals,
    playerAssists,
    playerSaves,
    playerTackles,
    playerRating,
    matchFameDelta,
    qtePerfectCount,
    qteGoodCount,
    qteFailedCount,
    qteSuccessCount,
    qteTotalCount,
    stageTitle,
    playerTeamName,
    opponentName,
  ]);

  // Handle Penalty Shootout QTE Outcome
  // Requirement: The entire match is defined on the outcome of our penalty!
  const handleShootoutPenaltyOutcome = useCallback(
    (outcome: PenaltyQteOutcome) => {
      const success = outcome.success;
      setQteTotalCount((prev) => prev + 1);
      if (outcome.contactTier === 'PERFECT' && outcome.potencyQuality === 'PERFECT') {
        setQtePerfectCount((p) => p + 1);
      } else if (success) {
        setQteGoodCount((g) => g + 1);
      } else {
        setQteFailedCount((f) => f + 1);
      }

      if (success) {
        setPenaltyPlayerScore(5);
        setPenaltyOpponentScore(4);
        setQteSuccessCount((s) => s + 1);
        setPlayerGoals((g) => g + 1);
        setPlayerRating((prev) => parseFloat(Math.min(10.0, prev + 1.2).toFixed(1)));
        addCommentary(
          `⚽ GOAL! DECISIVE PENALTY SCORED! ${player.name} buries the decisive kick to WIN THE PENALTY SHOOTOUT AND THE MATCH! 🏆`,
          'goal'
        );
        setTimeout(() => {
          finishMatch(
            playerTeamScore + 1,
            opponentTeamScore,
            true,
            true,
            5,
            4
          );
        }, 1200);
      } else {
        setPenaltyPlayerScore(4);
        setPenaltyOpponentScore(5);
        setPlayerRating((prev) => parseFloat(Math.max(4.0, prev - 0.7).toFixed(1)));
        addCommentary(
          `❌ MISSED! DECISIVE PENALTY MISSED/SAVED! ${player.name}'s penalty fails to find the net, giving the shootout victory to ${opponentName}!`,
          'card'
        );
        setTimeout(() => {
          finishMatch(
            playerTeamScore,
            opponentTeamScore + 1,
            true,
            true,
            4,
            5
          );
        }, 1200);
      }
    },
    [
      player,
      playerTeamScore,
      opponentTeamScore,
      opponentName,
      finishMatch,
      addCommentary,
    ]
  );

  // Helper to generate context-rich build-up commentary for upcoming QTE actions
  const getBuildUpCommentary = useCallback(
    (moment: KeyMomentEvent, min: number, pTeam: string, oTeam: string): string => {
      switch (moment.actionType) {
        case 'SHOOT':
          return `⚡ [${min}'] ATTACKING SURGE! ${pTeam} pushes numbers forward into the final third — shooting lane opening up!`;
        case 'HEADER':
          return `⚡ [${min}'] DANGEROUS DELIVERY! Winger breaks down the flank and floats a searching cross into the penalty area!`;
        case 'PASS':
          return `⚡ [${min}'] TACTICAL POSSESSION! ${pTeam} patiently circulates the ball looking to unlock the defensive block!`;
        case 'DRIBBLE':
          return `⚡ [${min}'] 1v1 SCENARIO! Finding space out wide — driving forward with pace to take on the defender!`;
        case 'TACKLE':
          return `⚡ [${min}'] COUNTER-ATTACK ALERT! ${oTeam} counters at speed — tracking back to break up the attack!`;
        case 'SAVE':
          return `⚡ [${min}'] OPPOSITION DANGER! ${oTeam} works a shot inside the box — alert and positioned on the goal line!`;
        case 'PENALTY':
          return `⚡ [${min}'] DRAMA IN THE BOX! Whistle blows inside the penalty area — referee points to the spot!`;
        default:
          return `⚡ [${min}'] FAST BREAK! High-stakes phase of play unfolding on the pitch!`;
      }
    },
    []
  );

  // Main Match Time Loop - Action-Skipping Simulation with 2-3 Min Pacing Buffer (Max 5 QTEs)
  useEffect(() => {
    if (!isOpen || isPaused || activeMoment || isPenaltyShootout || isMatchFinished) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Fast simulation tick speed: ~380ms per step at 1x speed, ~190ms at 2x, ~95ms at 4x
    const tickSpeedMs = Math.max(60, Math.round(380 / simSpeed));

    timerRef.current = setInterval(() => {
      setMatchMinute((prevMinute) => {
        // 1. Check if player was subbed out of the game: terminate QTEs and fast simulate to full time
        if (effectiveStatus === 'sub_out' && prevMinute >= effectiveSubExitMin && !isSubbedOutCompleted) {
          setIsSubbedOutCompleted(true);
          addCommentary(
            `🔁 SUBSTITUTION (${effectiveSubExitMin}'): ${player.name} is subbed off by the manager! Fast-simulating remaining match minutes to final whistle...`,
            'whistle'
          );
          setKeyMoments([]);
          setActiveMoment(null);
          setTimeout(() => {
            let finalP = playerTeamScore;
            let finalOpp = opponentTeamScore;
            if (Math.random() < 0.25) finalP += 1;
            if (Math.random() < 0.25) finalOpp += 1;
            addCommentary(
              `⏱️ FULL TIME (90'): Final simulated score: ${playerTeamName} ${finalP} - ${opponentName} ${finalOpp}!`,
              'whistle'
            );
            finishMatch(finalP, finalOpp, false, false);
          }, 1200);
          return 90;
        }

        // 2. Check Clutch Time: When tied and at or past 85'
        if (
          !isExtraTime &&
          prevMinute >= 85 &&
          playerTeamScore === opponentTeamScore &&
          !hasTriggeredClutchTime
        ) {
          setHasTriggeredClutchTime(true);
          const clutchCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 QTE events past 85'
          const clutchMoments = generateClutchTimeMoments(
            player,
            stageTitle,
            opponentName,
            opponentOvr,
            clutchCount
          );
          setKeyMoments((prev) => [...prev, ...clutchMoments]);
          addCommentary(
            `🔥 [CLUTCH TIME ACTIVATED]: Scores are tied at ${playerTeamScore}-${opponentTeamScore}! ${clutchCount} decisive late-game moment${clutchCount > 1 ? 's' : ''} unlocked (+25% Rating Boost)!`,
            'moment'
          );
        }

        // 3. Upcoming moments: Allow moments past regulation limit if they are Clutch Time or Extra Time
        const upcomingMoments = keyMoments.filter(
          (m) => m.minute > prevMinute && (qteTotalCount < 5 || m.isClutchTime || m.isExtraTimeMoment)
        );
        const nextMoment = upcomingMoments.length > 0 ? upcomingMoments[0] : null;

        let targetMin = prevMinute;

        if (nextMoment) {
          // Pacing buffer: 2 to 3 minutes before the QTE moment
          const pacingLead = nextMoment.minute - prevMinute > 3 ? 3 : 2;
          const pacingMinute = Math.max(prevMinute, nextMoment.minute - pacingLead);

          if (prevMinute < pacingMinute) {
            // Milestone 1: Halftime (45') check between prevMinute and pacingMinute
            if (!isExtraTime && prevMinute < 45 && pacingMinute > 45) {
              targetMin = 45;
            }
            // Milestone 2: Substitution entry check between prevMinute and pacingMinute
            else if (
              (effectiveStatus === 'sub_entered' || effectiveStatus === 'sub_in') &&
              prevMinute < effectiveSubMin &&
              pacingMinute > effectiveSubMin
            ) {
              targetMin = effectiveSubMin;
            } else {
              // Direct skip to the pacing minute (2-3 mins before the QTE action)!
              targetMin = pacingMinute;
              const buildUpCommentary = getBuildUpCommentary(
                nextMoment,
                targetMin,
                playerTeamName,
                opponentName
              );
              addCommentary(buildUpCommentary, 'moment');
            }
          } else {
            // Pacing minute already shown: advance directly to the exact moment minute to trigger QTE!
            targetMin = nextMoment.minute;
          }
        } else {
          // No more upcoming QTE moments or limit reached -> advance towards half/match conclusion
          if (!isExtraTime) {
            if (prevMinute < 45) {
              targetMin = 45;
            } else {
              targetMin = 90;
            }
          } else {
            if (prevMinute < 105) {
              targetMin = 105;
            } else {
              targetMin = 120;
            }
          }
        }

        const nextMin = targetMin;

        // Check if player enters off the bench as substitute
        if ((effectiveStatus === 'sub_entered' || effectiveStatus === 'sub_in') && prevMinute < effectiveSubMin && nextMin >= effectiveSubMin) {
          addCommentary(
            `🔁 SUBSTITUTION (${nextMin}'): ${player.name} enters the pitch off the bench! Key Match QTEs activated!`,
            'moment'
          );
        }

        // Check if player gets subbed out
        if (effectiveStatus === 'sub_out' && prevMinute < effectiveSubExitMin && nextMin >= effectiveSubExitMin && !isSubbedOutCompleted) {
          setIsSubbedOutCompleted(true);
          addCommentary(
            `🔁 SUBSTITUTION (${effectiveSubExitMin}'): ${player.name} is subbed off by the manager! Fast-simulating remaining match minutes to final whistle...`,
            'whistle'
          );
          setKeyMoments([]);
          setActiveMoment(null);
          setTimeout(() => {
            let finalP = playerTeamScore;
            let finalOpp = opponentTeamScore;
            if (Math.random() < 0.25) finalP += 1;
            if (Math.random() < 0.25) finalOpp += 1;
            addCommentary(
              `⏱️ FULL TIME (90'): Final simulated score: ${playerTeamName} ${finalP} - ${opponentName} ${finalOpp}!`,
              'whistle'
            );
            finishMatch(finalP, finalOpp, false, false);
          }, 1200);
          return 90;
        }

        // Check if any Key Moment triggers at this minute (regulation <= 5 QTE or Clutch / Extra Time)
        const momentToTrigger = keyMoments.find(
          (m) => m.minute === nextMin && (qteTotalCount < 5 || m.isClutchTime || m.isExtraTimeMoment)
        );
        if (momentToTrigger) {
          const isOnPitch =
            effectiveStatus === 'starter' ||
            ((effectiveStatus === 'sub_entered' || effectiveStatus === 'sub_in') && nextMin >= effectiveSubMin);

          if (isOnPitch) {
            setIsPaused(true);
            setActiveMoment(momentToTrigger);
            qteGaugePosRef.current = 0;
            gaugeDirectionRef.current = 'UP';
            if (!isMuted) {
              matchAudio.playWhistle();
              matchAudio.playCrowdRoar();
            }
            addCommentary(`⚡ KEY MOMENT (${nextMin}'): ${momentToTrigger.title}`, 'moment');
            return nextMin;
          } else {
            // Player is on bench -> simulate moment cleanly without QTE
            addCommentary(
              `⚡ SIMULATED MOMENT (${nextMin}'): ${momentToTrigger.title} (${player.name} sitting on bench)`,
              'general'
            );
          }
        }

        // Halftime broadcast event
        if (!isExtraTime && nextMin === 45 && prevMinute < 45) {
          addCommentary(
            `⏸️ HALFTIME (45'): Score stands ${playerTeamScore}-${opponentTeamScore}! Both managers prepare second-half tactical changes.`,
            'whistle'
          );
        }

        // Extra time halftime event & generate 2nd half moments
        if (isExtraTime && nextMin >= 105 && prevMinute < 105 && !hasEnteredExtraTimeHalf2) {
          setHasEnteredExtraTimeHalf2(true);
          const et2Count = Math.floor(Math.random() * 3) + 1; // 1 to 3 QTE events for 2nd half
          const et2Moments = generateExtraTimeHalfMoments(
            player,
            2,
            stageTitle,
            opponentName,
            opponentOvr,
            et2Count
          );
          setKeyMoments((prev) => [...prev, ...et2Moments]);
          addCommentary(
            `⏱️ EXTRA TIME HALFTIME (105'): Score remains ${playerTeamScore}-${opponentTeamScore}! EXTRA TIME 2ND HALF (+${et2Count} Moments)!`,
            'whistle'
          );
        }

        // Hostile Betrayed Club Atmosphere Events
        if (importanceEval.isBetrayedClubMatch) {
          if (prevMinute < 25 && nextMin >= 25) {
            addCommentary(
              `💀 [HOSTILE CHANTS] 'TRAITOR! NEVER FORGIVEN!' rings out across the terraces as the entire stadium jeers ${player.name}!`,
              'card'
            );
          } else if (prevMinute < 60 && nextMin >= 60) {
            addCommentary(
              `💀 [VENOMOUS PRESSURE] Hostile whistling and effigies shower down from the stands targeting ${player.name} on every touch!`,
              'card'
            );
          } else if (prevMinute < 80 && nextMin >= 80) {
            addCommentary(
              `💀 [HOSTILE CAULDRON] The ${opponentName} crowd unleashes a ferocious wave of boos as ${player.name} steps up!`,
              'card'
            );
          }
        }

        // Check Regulation 90' finish
        if (nextMin >= 90 && !isExtraTime) {
          if (playerTeamScore !== opponentTeamScore) {
            finishMatch(playerTeamScore, opponentTeamScore, false, false);
            return 90;
          } else {
            // Check if this match is a knockout tie that requires extra time / penalties
            const sLower = stageTitle.toLowerCase();
            const compLower = (importanceEval.stageTitleDisplay || '').toLowerCase();
            const isLeagueOrGroup =
              sLower.includes('league') ||
              sLower.includes('group') ||
              sLower.includes('matchday') ||
              /\bmatch \d+\b/i.test(sLower) ||
              compLower.includes('league') ||
              compLower.includes('group');

            const isKnockoutMatch =
              !isLeagueOrGroup &&
              (importanceEval.isKnockoutFinal ||
                importanceEval.isKnockoutSemi ||
                importanceEval.isPlayoff ||
                sLower.includes('quarter') ||
                sLower.includes('semi') ||
                sLower.includes('final') ||
                sLower.includes('knockout') ||
                sLower.includes('round of') ||
                sLower.includes('playoff') ||
                sLower.includes('third'));

            if (isKnockoutMatch) {
              // Knockout Tie -> Enter Extra Time with 1 to 3 moments for Half 1
              setIsExtraTime(true);
              const et1Count = Math.floor(Math.random() * 3) + 1; // 1 to 3 QTE events
              const etMoments = generateExtraTimeHalfMoments(
                player,
                1,
                stageTitle,
                opponentName,
                opponentOvr,
                et1Count
              );
              setKeyMoments((prev) => [...prev, ...etMoments]);
              addCommentary(
                `⏱️ FULL TIME (90'): Score tied ${playerTeamScore}-${opponentTeamScore}! Heading to EXTRA TIME FIRST HALF (+${et1Count} Moments)!`,
                'whistle'
              );
              return 91;
            } else {
              // Standard League / Group match -> Ends as a Draw!
              addCommentary(`⏱️ FULL TIME (90'): Match ends in a DRAW (${playerTeamScore}-${opponentTeamScore})! Points shared!`, 'whistle');
              finishMatch(playerTeamScore, opponentTeamScore, false, false);
              return 90;
            }
          }
        }

        // Check Extra Time 120' finish
        if (nextMin >= 120 && isExtraTime) {
          if (playerTeamScore !== opponentTeamScore) {
            finishMatch(playerTeamScore, opponentTeamScore, true, false);
            return 120;
          } else {
            // Tied after Extra Time -> Trigger Penalty Shootout!
            setMatchPhase('PENALTY_SHOOTOUT');
            setIsPenaltyShootout(true);
            addCommentary(`🥅 EXTRA TIME ENDS (${playerTeamScore}-${opponentTeamScore})! Heading to DECISIVE PENALTY SHOOTOUT!`, 'whistle');
            return 120;
          }
        }

        return nextMin;
      });
    }, tickSpeedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isOpen,
    isPaused,
    activeMoment,
    isPenaltyShootout,
    isMatchFinished,
    simSpeed,
    keyMoments,
    player,
    opponentOvr,
    isMuted,
    playerTeamName,
    opponentName,
    isExtraTime,
    playerTeamScore,
    opponentTeamScore,
    qteTotalCount,
    stageTitle,
    effectiveStatus,
    effectiveSubMin,
    effectiveSubExitMin,
    hasTriggeredClutchTime,
    hasEnteredExtraTimeHalf2,
    isSubbedOutCompleted,
    importanceEval,
    finishMatch,
    addCommentary,
    getBuildUpCommentary,
  ]);

  // Execute Penalty Shootout (Decisive Sudden-Death Kick defining the entire match)
  const handlePenaltyShoot = useCallback(() => {
    const isPlayerShooter = player.position !== 'GK';
    const dummyPenaltyMoment: KeyMomentEvent = {
      id: `pen-${penaltyRound}`,
      minute: 120,
      title: 'Decisive Penalty Kick',
      description: 'The entire match outcome is defined on this penalty!',
      actionType: isPlayerShooter ? 'PENALTY' : 'SAVE',
      momentType: isPlayerShooter ? 'PENALTY_KICK' : 'PENALTY_SAVE',
      relevantAttribute: isPlayerShooter ? 'shooting' : 'defending',
      difficulty: 'CLUTCH',
    };

    const outcome = evaluateQTEOutcome(player, dummyPenaltyMoment, qteGaugePosRef.current, stageTitle);
    const success = outcome.success;

    setQteTotalCount((prev) => prev + 1);
    if (outcome.quality === 'PERFECT') setQtePerfectCount((p) => p + 1);
    else if (outcome.quality === 'GOOD') setQteGoodCount((g) => g + 1);
    else setQteFailedCount((f) => f + 1);

    if (success) {
      setPenaltyPlayerScore(5);
      setPenaltyOpponentScore(4);
      setQteSuccessCount((s) => s + 1);
      setPlayerGoals((g) => g + 1);
      setPlayerRating((prev) => parseFloat(Math.min(10.0, prev + 1.2).toFixed(1)));
      setPenaltyResultText(`SCORED! You buried the decisive penalty!`);
      addCommentary(
        `⚽ GOAL! ${player.name} SCORED THE DECISIVE PENALTY! Shootout victory claimed! 🏆`,
        'goal'
      );
      setTimeout(() => {
        finishMatch(
          playerTeamScore + 1,
          opponentTeamScore,
          true,
          true,
          5,
          4
        );
      }, 1200);
    } else {
      setPenaltyPlayerScore(4);
      setPenaltyOpponentScore(5);
      setPlayerRating((prev) => parseFloat(Math.max(4.0, prev - 0.7).toFixed(1)));
      setPenaltyResultText(`MISSED! Decisive penalty failed.`);
      addCommentary(
        `❌ MISSED! ${player.name}'S DECISIVE PENALTY WAS STOPPED! ${opponentName} wins the shootout!`,
        'card'
      );
      setTimeout(() => {
        finishMatch(
          playerTeamScore,
          opponentTeamScore + 1,
          true,
          true,
          4,
          5
        );
      }, 1200);
    }
  }, [
    player,
    penaltyRound,
    stageTitle,
    playerTeamScore,
    opponentTeamScore,
    opponentName,
    finishMatch,
    addCommentary,
  ]);

  // Global Keyboard (Spacebar / Enter) listener for instant QTE reaction
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Space / Enter -> QTE action or toggle match pause
      if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
        const isPenaltyActive =
          Boolean(activeMoment && (activeMoment.actionType === 'PENALTY' || activeMoment.momentType === 'PENALTY_KICK')) ||
          Boolean(isPenaltyShootout && !isMatchFinished);
        if (isPenaltyActive) {
          // PenaltyQteModal has exclusive ownership of Spacebar, Enter, and controls
          return;
        }

        if (showTutorial && !tutorialResult) {
          e.preventDefault();
          handlePracticeExecute();
        } else if (activeMoment && !lastQteOutcome) {
          e.preventDefault();
          handleExecuteQTE();
        } else if (activeMoment && lastQteOutcome) {
          e.preventDefault();
          handleDismissQteOutcomeImmediately();
        } else if (!isMatchFinished) {
          e.preventDefault();
          setIsPaused((p) => !p);
        }
      }

      // 'P' key -> Toggle Pause
      if (e.code === 'KeyP' && !activeMoment && !isPenaltyShootout && !isMatchFinished) {
        e.preventDefault();
        setIsPaused((p) => !p);
      }

      // 'M' key -> Toggle Mute
      if (e.code === 'KeyM') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }

      // 'Escape' -> Pause match
      if (e.code === 'Escape' && !isMatchFinished) {
        e.preventDefault();
        setIsPaused(true);
      }

      // Number keys 1-4 -> Change simulation speed
      if (e.code === 'Digit1') setSimSpeed(1);
      if (e.code === 'Digit2') setSimSpeed(2);
      if (e.code === 'Digit3') setSimSpeed(4);
      if (e.code === 'Digit4') setSimSpeed(8);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    showTutorial,
    tutorialResult,
    activeMoment,
    lastQteOutcome,
    isPenaltyShootout,
    isMatchFinished,
    handlePracticeExecute,
    handleExecuteQTE,
    handleDismissQteOutcomeImmediately,
    handlePenaltyShoot,
  ]);

  // Mobile / Web Lifecycle Optimization: Pause simulation when app is sent to background or tab switched
  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isMatchFinished) {
        setIsPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [isOpen, isMatchFinished]);

  // Standalone Steam / Gamepad Controller Support (Xbox, PlayStation, Steam Deck, Switch Pro)
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    let prevBtnA = false;
    let prevBtnStart = false;

    const pollGamepad = () => {
      try {
        const gamepads = typeof navigator.getGamepads === 'function' ? navigator.getGamepads() : [];
        const gp = Array.from(gamepads).find((g) => g !== null && g.connected);

        if (gp && gp.buttons) {
          // Button 0 = A / Cross (South face button)
          const btnA = gp.buttons[0]?.pressed || false;
          if (btnA && !prevBtnA) {
            const isPenaltyActive =
              Boolean(activeMoment && (activeMoment.actionType === 'PENALTY' || activeMoment.momentType === 'PENALTY_KICK')) ||
              Boolean(isPenaltyShootout && !isMatchFinished);

            if (!isPenaltyActive) {
              if (showTutorial && !tutorialResult) {
                handlePracticeExecute();
              } else if (activeMoment && !lastQteOutcome) {
                handleExecuteQTE();
              } else if (!isMatchFinished) {
                setIsPaused((p) => !p);
              }
            }
          }
          prevBtnA = btnA;

          // Button 9 = Start / Options
          const btnStart = gp.buttons[9]?.pressed || false;
          if (btnStart && !prevBtnStart) {
            if (!activeMoment && !isPenaltyShootout && !isMatchFinished) {
              setIsPaused((p) => !p);
            }
          }
          prevBtnStart = btnStart;
        }
      } catch {}

      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animId);
  }, [
    isOpen,
    showTutorial,
    tutorialResult,
    activeMoment,
    lastQteOutcome,
    isPenaltyShootout,
    isMatchFinished,
    handlePracticeExecute,
    handleExecuteQTE,
    handlePenaltyShoot,
  ]);

  if (!isOpen) return null;

  return createPortal(
    <div
      id="key-match-fullscreen-arena"
      className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl overflow-y-auto overscroll-contain flex flex-col items-center justify-start p-2.5 sm:p-4 md:p-6 text-left select-none custom-scrollbar font-pixel"
    >
      <div className="w-full max-w-4xl my-auto flex flex-col gap-3 sm:gap-4 relative pb-28 sm:pb-8">
        {/* Ambient Stadium Lighting */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 bg-emerald-500" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 bg-amber-500" />

        {/* Top Header & Stage Title (32-Bit Broadcast Header) */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-2 pb-2 shrink-0 relative z-10 p-3 pixel-corners pixel-bevel-raised ${
            contTheme
              ? `bg-gradient-to-r ${contTheme.headerGradient} ${contTheme.borderColor} ${contTheme.glowEffect}`
              : 'border-slate-700 bg-slate-900/95'
          }`}
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {contTheme ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners text-[9px] font-black uppercase tracking-wider border ${contTheme.badgeBg} ${contTheme.badgeText} ${contTheme.badgeBorder}`}
                >
                  <Trophy className="w-3.5 h-3.5 text-current" />
                  {contTheme.name}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 pixel-corners text-[9px] font-black uppercase tracking-wider border ${
                    importanceEval.category === 'DEFINITIVE'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-400/60'
                      : importanceEval.category === 'IMPORTANT' || importanceEval.isDerby
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/60'
                      : 'bg-blue-500/20 text-blue-300 border-blue-400/60'
                  }`}
                >
                  {importanceEval.isBetrayedClubMatch ? (
                    <Skull className="w-3 h-3 text-rose-400 animate-pulse" />
                  ) : importanceEval.category === 'DEFINITIVE' ? (
                    <Trophy className="w-3 h-3 text-rose-400" />
                  ) : (
                    <Flame className="w-3 h-3 text-amber-400" />
                  )}
                  {t(importanceEval.badgeLabel)}
                </span>
              )}

              {importanceEval.isBetrayedClubMatch && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-rose-950/90 border border-rose-500/80 text-rose-300 text-[9px] font-black uppercase shadow-lg shadow-rose-950/50">
                  <Skull className="w-3 h-3 text-rose-400" />
                  {t('BETRAYED CLUB')}
                </span>
              )}

              {importanceEval.derbyName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-amber-950/80 border border-amber-500/60 text-amber-300 text-[9px] font-black uppercase">
                  <Flame className="w-3 h-3 text-amber-400" />
                  {t(importanceEval.derbyName)}
                </span>
              )}

              <span className={`text-[10px] font-retro ${contTheme ? contTheme.subTextColor : 'text-slate-400'}`}>
                {stageTitle}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2 truncate pixel-text-shadow uppercase">
              <span>{playerTeamName}</span>
              <span className="text-amber-400 text-xs font-arcade">{t('vs')}</span>
              <span>{opponentName}</span>
            </h2>
            <p className={`text-[10px] line-clamp-1 font-retro ${contTheme ? contTheme.subTextColor : 'text-slate-300'}`}>
              {t(importanceEval.reasonDescription)}
            </p>
          </div>

          {/* Sound & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => audioManager.toggleMute()}
              className="p-2 pixel-corners bg-slate-900 border-2 border-slate-700 pixel-bevel-raised text-slate-300 hover:text-white cursor-pointer transition-all"
              title={isMuted ? t('Unmute Audio') : t('Mute Audio')}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {!isMatchFinished && !activeMoment && !isPenaltyShootout && (
              <div className="flex items-center gap-1 bg-slate-950 border-2 border-slate-700 p-1 pixel-corners">
                <button
                  onClick={() => setSimSpeed(1)}
                  className={`px-2 py-0.5 pixel-corners text-[10px] font-black font-arcade cursor-pointer transition-all ${
                    simSpeed === 1 ? 'bg-amber-500 text-slate-950 pixel-bevel-raised' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSimSpeed(2)}
                  className={`px-2 py-0.5 pixel-corners text-[10px] font-black font-arcade cursor-pointer transition-all ${
                    simSpeed === 2 ? 'bg-amber-500 text-slate-950 pixel-bevel-raised' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2x
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= CLUB LEGEND RECEPTION BANNER ================= */}
        {isClubLegendHere && (
          <div className="p-3 pixel-corners bg-gradient-to-r from-amber-950/95 via-yellow-950/90 to-amber-950/95 border-2 border-yellow-400 pixel-bevel-gold text-yellow-200 text-xs font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(250,204,21,0.35)] relative z-10">
            <div className="w-9 h-9 pixel-corners bg-yellow-400/20 border-2 border-yellow-300 flex items-center justify-center text-lg shrink-0">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-300 uppercase tracking-widest text-[10px] pixel-text-shadow">
                  {t('CLUB LEGEND RECEPTION')}
                </span>
                <span className="text-[9px] font-arcade px-1.5 py-0.5 pixel-corners bg-yellow-400/20 text-yellow-300 border border-yellow-400/50">
                  {clubStatusInfo.title}
                </span>
              </div>
              <p className="text-[10px] text-yellow-100/90 mt-0.5 font-retro">
                {t(clubStatusInfo.specialReceptionMessage || 'The entire stadium rises in a thunderous standing ovation as the immortal hero steps back onto familiar turf!')}
              </p>
            </div>
          </div>
        )}

        {/* MAIN INTERACTIVE CONTENT AREA */}
        <div className="flex flex-col space-y-3 relative z-10">
        {/* ================= FIRST QTE TUTORIAL OVERLAY ================= */}
        {showTutorial && (
          <div className="bg-slate-950 border-2 border-amber-400 pixel-corners pixel-bevel-raised p-5 sm:p-7 space-y-5 text-center relative overflow-hidden shadow-2xl z-30 font-pixel">
            <div className="inline-flex items-center gap-2 px-3 py-1 pixel-corners bg-amber-500/20 text-amber-300 border-2 border-amber-400/50 text-[10px] font-black uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              {t('KEY MOMENT TRAINING')}
            </div>

            <div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase pixel-text-shadow">{t('KEY MOMENT TRAINING')}</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto font-retro">
                "{t('Press the button when the marker reaches the GREEN zone.')}"
              </p>
            </div>

            {/* Visual Timing Zones Explanation */}
            <div className="bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-sunken p-4 sm:p-5 max-w-xl mx-auto space-y-3 text-left">
              <div className="text-[9px] font-black text-amber-400 uppercase tracking-wider">{t('TIMING ZONE MAP (3 SUCCESS ZONES)')}</div>
              
              <div className="h-10 w-full bg-slate-950 pixel-corners border-2 border-slate-700 relative flex items-center overflow-hidden font-black text-[9px] uppercase font-arcade">
                <div className="w-[28%] h-full bg-rose-950/70 border-r-2 border-rose-500/40 flex items-center justify-center text-rose-400">
                  {t('Early')}
                </div>
                <div className="w-[18%] h-full bg-amber-500/40 border-r-2 border-amber-400/60 flex items-center justify-center text-amber-300 text-[8px]">
                  {t('Orange (60%)')}
                </div>
                <div className="w-[7%] h-full bg-emerald-500/70 border-r-2 border-emerald-400 flex items-center justify-center text-emerald-200 text-[8px]">
                  {t('Green (80%)')}
                </div>
                <div className="w-[4%] h-full bg-cyan-400 border-x-2 border-white flex items-center justify-center text-cyan-950 text-[7px] font-black shadow-[0_0_10px_rgba(34,211,238,1)]">
                  {t('BLUE 100%')}
                </div>
                <div className="w-[7%] h-full bg-emerald-500/70 border-l-2 border-emerald-400 flex items-center justify-center text-emerald-200 text-[8px]">
                  {t('Green (80%)')}
                </div>
                <div className="w-[18%] h-full bg-amber-500/40 border-l-2 border-amber-400/60 flex items-center justify-center text-amber-300 text-[8px]">
                  {t('Orange (60%)')}
                </div>
                <div className="w-[28%] h-full bg-rose-950/70 border-l-2 border-rose-500/40 flex items-center justify-center text-rose-400">
                  {t('Late')}
                </div>
              </div>

              <ul className="text-[11px] space-y-1.5 text-slate-300 font-retro pt-1">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 pixel-corners bg-cyan-400 shrink-0" />
                  <strong className="text-cyan-300 font-pixel text-[10px]">{t('BLUE ZONE')}</strong> = {t('100% Precision (+0.25 rating or +0.50 defensive bonus)')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 pixel-corners bg-emerald-400 shrink-0" />
                  <strong className="text-emerald-300 font-pixel text-[10px]">{t('GREEN ZONE')}</strong> = {t('84% Success (+0.15 rating or +0.25 defensive bonus; 0.00 on near-miss)')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 pixel-corners bg-amber-400 shrink-0" />
                  <strong className="text-amber-300 font-pixel text-[10px]">{t('ORANGE ZONE')}</strong> = {t('60% Scrappy (No timing bonus; -0.25 penalty on block)')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 pixel-corners bg-slate-400 shrink-0" />
                  <strong className="text-slate-400 font-pixel text-[10px]">{t('NORMAL FAIL')}</strong> = {t('-0.25 Rating Penalty (Ordinary mistimed action)')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 pixel-corners bg-rose-500 shrink-0" />
                  <strong className="text-rose-400 font-pixel text-[10px]">{t('RED ZONE')}</strong> = {t('Critical Failure (-0.50 Rating & -10 Fame blunder!)')}
                </li>
              </ul>
            </div>

            {/* Practice Meter Attempt */}
            <div className="bg-slate-900 border-2 border-amber-500/40 pixel-corners pixel-bevel-raised p-4 sm:p-5 max-w-xl mx-auto space-y-3">
              <QTETimingBarGauge
                cursorRef={tutorialGaugeCursorRef}
                blueWidth={3.0}
                greenWidth={14.0}
                orangeWidth={32.0}
                label={t('PRACTICE TIMING ATTEMPT')}
              />

              {tutorialResult && (
                <div className="p-3 pixel-corners bg-slate-950 border-2 border-amber-400 pixel-bevel-sunken text-xs text-amber-200 font-bold space-y-1 text-left">
                  <div className="flex items-center justify-between text-xs font-black text-white">
                    <span className="font-pixel">{t(tutorialResult.timingFeedback)}</span>
                    <span className="text-[10px] font-arcade bg-amber-500/20 text-amber-300 px-2 py-0.5 pixel-corners border border-amber-400/50">
                      {tutorialResult.precisionPercent}% {t('Precision')}
                    </span>
                  </div>
                  <div className="text-emerald-300 font-black font-pixel text-[11px]">{t(tutorialResult.actionQualityTitle)}</div>
                  <p className="text-slate-300 text-[10px] font-retro">{t(tutorialResult.commentary)}</p>
                  <p className="text-amber-400 pt-1 font-bold font-retro">"{t('Good! You are ready for key moments.')}"</p>
                </div>
              )}

              {!tutorialResult ? (
                <button
                  onClick={handlePracticeExecute}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handlePracticeExecute();
                  }}
                  className="w-full py-3.5 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-yellow-300 border-2 border-yellow-200 pixel-bevel-gold cursor-pointer shadow-xl transition-all touch-manipulation select-none active:scale-95 uppercase font-pixel"
                >
                  {t('PRESS TO PRACTICE TIMING 🎯 [SPACEBAR]')}
                </button>
              ) : (
                <button
                  onClick={handleCompleteTutorial}
                  className="w-full py-3.5 pixel-corners text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 border-2 border-emerald-200 pixel-bevel-raised cursor-pointer shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 touch-manipulation select-none uppercase font-pixel"
                >
                  <span>{t('START MATCH & PROCEED ⚽')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= OPENING CINEMATIC INTRO VIEW ================= */}
        {!showTutorial && matchPhase === 'CINEMATIC_INTRO' && (
          <div
            className={`p-4 sm:p-6 space-y-3 sm:space-y-4 text-center relative overflow-hidden shadow-2xl pixel-corners pixel-bevel-raised ${
              contTheme
                ? `bg-gradient-to-b ${contTheme.bgGradient} border-2 ${contTheme.borderColor} ${contTheme.glowEffect}`
                : 'bg-slate-900 border-2 border-amber-500/60'
            }`}
          >
            <div className="space-y-1">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 pixel-corners text-[10px] font-black uppercase tracking-widest ${
                  contTheme
                    ? `${contTheme.badgeBg} ${contTheme.badgeText} border ${contTheme.badgeBorder}`
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-current" />
                {contTheme ? `${contTheme.name} MATCHDAY` : t('KEY MATCH OPENING CINEMATIC')}
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight uppercase pixel-text-shadow">
                {stageTitle}
              </h2>
              <p className={`text-xs max-w-xl mx-auto line-clamp-2 font-retro ${contTheme ? contTheme.subTextColor : 'text-slate-300'}`}>
                {t('High stakes, electric atmosphere, and scouts watching from the stands!')}
              </p>
            </div>

            {/* Stadium & Environment Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 border-2 border-slate-700 pixel-corners pixel-bevel-sunken p-2.5 sm:p-3 text-xs text-left font-pixel">
              <div>
                <div className="text-slate-500 font-black uppercase text-[8px]">{t('Stadium')}</div>
                <div className="font-black text-white truncate text-[10px]">{lineupInfo.stadiumName}</div>
              </div>
              <div>
                <div className="text-slate-500 font-black uppercase text-[8px]">{t('Capacity')}</div>
                <div className="font-black text-amber-300 font-arcade text-[10px]">{lineupInfo.capacity} {t('Spectators')}</div>
              </div>
              <div>
                <div className="text-slate-500 font-black uppercase text-[8px]">{t('Weather')}</div>
                <div className="font-black text-emerald-400 truncate text-[10px]">{t(lineupInfo.weather)}</div>
              </div>
              <div>
                <div className="text-slate-500 font-black uppercase text-[8px]">{t('Atmosphere')}</div>
                <div className="font-black text-purple-400 truncate text-[10px]">{t(lineupInfo.atmosphere)}</div>
              </div>
            </div>

            {/* Tactical Matchup Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 font-pixel">
              {/* Player Team Card */}
              <div
                className={`p-3 sm:p-3.5 pixel-corners pixel-bevel-raised text-left space-y-1 ${
                  contTheme
                    ? `border-2 ${contTheme.borderColor} bg-gradient-to-r ${contTheme.cardBg}`
                    : 'bg-slate-900 border-2 border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className={`text-[10px] font-black uppercase ${contTheme ? contTheme.accentTextColor : 'text-emerald-400'}`}>
                    {t('YOUR CLUB')}
                  </span>
                  <span className="text-[9px] font-arcade px-2 py-0.5 pixel-corners bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    {lineupInfo.playerTeamFormation}
                  </span>
                </div>
                <h3 className="text-sm font-black text-white truncate uppercase">{playerTeamName}</h3>
                <div className="text-[11px] text-slate-300 truncate font-retro">
                  {t('Key Player')}: <strong className="text-amber-300 font-pixel">{player.name}</strong> ({player.position} • {player.ovr || 65} {t('OVR')})
                </div>
              </div>

              {/* Opponent Team Card */}
              <div
                className={`p-3 sm:p-3.5 pixel-corners pixel-bevel-raised text-left space-y-1 ${
                  contTheme
                    ? `border-2 ${contTheme.borderColor} bg-gradient-to-r ${contTheme.cardBg}`
                    : 'bg-slate-900 border-2 border-blue-500/50'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className={`text-[10px] font-black uppercase ${contTheme ? contTheme.accentTextColor : 'text-blue-400'}`}>
                    {t('OPPONENT CLUB')}
                  </span>
                  <span className="text-[9px] font-arcade px-2 py-0.5 pixel-corners bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
                    {lineupInfo.opponentTeamFormation}
                  </span>
                </div>
                <h3 className="text-sm font-black text-white truncate uppercase">{opponentName}</h3>
                <div className="text-[11px] text-slate-300 truncate font-retro">
                  {t('Star Danger')}: <strong className="text-rose-400 font-pixel">{lineupInfo.opponentStarPlayer}</strong> ({opponentOvr} {t('OVR')})
                </div>
              </div>
            </div>

            {/* Start Kickoff Action & Optional Practice Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-1">
              <button
                onClick={handleKickoffMatch}
                className={`w-full sm:w-auto min-h-[46px] px-8 py-3 pixel-corners text-xs font-black transition-all cursor-pointer inline-flex items-center justify-center gap-2 uppercase tracking-wide active:scale-98 shadow-xl font-pixel ${
                  contTheme
                    ? `bg-gradient-to-r ${contTheme.buttonGradient} ${contTheme.buttonTextColor} ${contTheme.glowEffect}`
                    : 'text-slate-950 bg-amber-400 hover:bg-yellow-300 border-2 border-yellow-200 pixel-bevel-gold'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{t('KICK OFF MATCH ⚽')}</span>
              </button>

              <button
                onClick={handleOpenTutorialManually}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 pixel-corners text-[11px] font-bold text-slate-300 bg-slate-900 border-2 border-slate-700 hover:bg-slate-800 hover:text-white pixel-bevel-raised transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 font-pixel"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>{t('PRACTICE QTE TUTORIAL')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= 32-BIT RETRO SCOREBOARD BANNER ================= */}
        {!showTutorial && matchPhase !== 'CINEMATIC_INTRO' && (
          <div className="bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 relative select-none font-pixel">
            {/* Player Team */}
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 pixel-corners bg-emerald-600 border-2 border-emerald-300 pixel-bevel-green flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0 font-arcade">
                {playerTeamName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-black text-white uppercase pixel-text-shadow">{playerTeamName}</div>
                <p className="text-[10px] text-emerald-400 font-retro">
                  {player.age && player.age < 18 ? t('YOUR YOUTH CLUB') : t('YOUR CLUB')}
                </p>
              </div>
            </div>

            {/* Live Score Display */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-slate-950 border border-slate-700 text-amber-300 font-arcade text-[10px] font-bold">
                <Clock className="w-3 h-3 text-amber-400" />
                {matchMinute}' {isExtraTime && '(ET)'}
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-widest text-amber-300 font-arcade pixel-text-shadow">
                {playerTeamScore} - {opponentTeamScore}
              </div>
            </div>

            {/* Opponent Team */}
            <div className="flex items-center gap-3 text-center sm:text-right flex-row-reverse sm:flex-row">
              <div>
                <div className="text-sm font-black text-white uppercase pixel-text-shadow">{opponentName}</div>
                <p className="text-[10px] text-slate-400 font-retro">{opponentOvr} {t('OVR')}</p>
              </div>
              <div className="w-12 h-12 pixel-corners bg-blue-600 border-2 border-blue-300 pixel-bevel-cyan flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0 font-arcade">
                {opponentName.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* ================= INTERACTIVE PITCH & MATCH CANVAS (32-BIT RETRO TURF) ================= */}
        {!showTutorial && matchPhase === 'LIVE_MATCH' && (
          <div className="bg-emerald-950/90 border-2 border-emerald-500/50 pixel-corners pixel-bevel-sunken p-4 sm:p-6 relative overflow-hidden min-h-[220px] flex flex-col justify-between shadow-2xl font-pixel">
            {/* Pitch Markings */}
            <div className="absolute inset-0 border-2 border-emerald-400/25 pixel-corners pointer-events-none m-2" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/25 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-emerald-400/25 pointer-events-none" />

            {/* Live Atmosphere Indicator */}
            <div className="flex items-center justify-between text-[10px] text-emerald-300 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 pixel-corners bg-emerald-400 animate-ping" />
                <span className="uppercase">{t('STADIUM CROWD: ROARING')}</span>
              </div>
              <div>{t('PLAYER RATING')}: <strong className="text-amber-300 font-arcade text-xs">{playerRating.toFixed(2)}</strong></div>
            </div>

            {/* Center Dynamic Moment Banner */}
            {!activeMoment ? (
              <div className="text-center py-6 space-y-2 z-10">
                <p className="text-xs text-slate-200 italic font-retro">
                  {t('Match in progress... Stay focused for your next Key Moment opportunity!')}
                </p>
              </div>
            ) : (activeMoment.actionType === 'PENALTY' || activeMoment.momentType === 'PENALTY_KICK') ? (
              <PenaltyQteModal
                isOpen={true}
                player={player}
                goalkeeperOvr={opponentOvr}
                goalkeeperName={`${opponentName} ${t('Goalkeeper')}`}
                opponentName={opponentName}
                stageTitle={`${stageTitle} • ${t('Penalty Kick')}`}
                matchMinute={activeMoment.minute || matchMinute || 78}
                isShootout={false}
                onComplete={handlePenaltyMomentOutcome}
              />
            ) : (
              /* ================= QTE OVERLAY (32-BIT RETRO ARCADE HUD) ================= */
              <div className="z-20 bg-slate-950/95 border-2 border-amber-400 pixel-corners pixel-bevel-gold p-4 sm:p-5 shadow-2xl space-y-3.5 max-w-xl w-full mx-auto text-center font-pixel">
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[9px] font-black uppercase">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> {t('KEY MOMENT')}: {t(activeMoment.actionType)}
                  </div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-pixel">
                    {t(impConfig.importanceName)}
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase pixel-text-shadow">{t(activeMoment.title)}</h3>
                  <p className="text-[11px] text-slate-300 mt-0.5 font-retro">{t(activeMoment.description)}</p>
                </div>

                {/* Duel System Matchup HUD */}
                {activeMoment.duelMatchup && (
                  <DuelMatchupBanner
                    matchup={activeMoment.duelMatchup}
                    playerName={player.name}
                    playerPosition={player.position}
                  />
                )}

                {/* QTE Timing Meter Gauge */}
                <QTETimingBarGauge
                  cursorRef={mainGaugeCursorRef}
                  blueWidth={impConfig.blueWidth}
                  greenWidth={impConfig.greenWidth}
                  orangeWidth={impConfig.orangeWidth}
                  label={`${t('TIMING METER')} (${t(impConfig.description)})`}
                />

                {/* Outcome feedback if just pressed */}
                {lastQteOutcome && (
                  <div
                    className={`p-3 pixel-corners border-2 text-left space-y-1 font-pixel ${
                      lastQteOutcome.zoneHit === 'BLUE'
                        ? 'bg-cyan-950/95 border-cyan-400 text-cyan-200 pixel-bevel-cyan'
                        : lastQteOutcome.zoneHit === 'GREEN' && lastQteOutcome.success
                        ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200 pixel-bevel-green'
                        : lastQteOutcome.zoneHit === 'GREEN' && !lastQteOutcome.success
                        ? 'bg-teal-950/95 border-teal-400 text-teal-200'
                        : lastQteOutcome.zoneHit === 'ORANGE' && lastQteOutcome.success
                        ? 'bg-amber-950/95 border-amber-400 text-amber-200 pixel-bevel-gold'
                        : lastQteOutcome.zoneHit === 'ORANGE' && !lastQteOutcome.success
                        ? 'bg-orange-950/95 border-orange-500 text-orange-200'
                        : lastQteOutcome.zoneHit === 'CRITICAL_FAIL'
                        ? 'bg-rose-950/95 border-rose-500 text-rose-200 animate-pulse'
                        : 'bg-slate-900/95 border-slate-600 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black flex items-center gap-1.5 uppercase">
                        {lastQteOutcome.zoneHit === 'BLUE' && <Sparkles className="w-4 h-4 text-cyan-300" />}
                        {lastQteOutcome.zoneHit === 'GREEN' && lastQteOutcome.success && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                        {lastQteOutcome.zoneHit === 'GREEN' && !lastQteOutcome.success && <Sparkles className="w-4 h-4 text-teal-300" />}
                        {lastQteOutcome.zoneHit === 'ORANGE' && lastQteOutcome.success && <CheckCircle2 className="w-4 h-4 text-amber-300" />}
                        {lastQteOutcome.zoneHit === 'ORANGE' && !lastQteOutcome.success && <ShieldAlert className="w-4 h-4 text-orange-400" />}
                        {lastQteOutcome.zoneHit === 'NORMAL_FAIL' && <AlertCircle className="w-4 h-4 text-slate-400" />}
                        {lastQteOutcome.zoneHit === 'CRITICAL_FAIL' && <XCircle className="w-4 h-4 text-rose-400" />}
                        {t(lastQteOutcome.timingFeedback) || lastQteOutcome.timingFeedback}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-arcade font-black px-1.5 py-0.5 pixel-corners border ${
                          lastQteOutcome.statBonus.ratingDelta > 0
                            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                            : lastQteOutcome.statBonus.ratingDelta === 0
                            ? 'bg-slate-700/40 border-slate-500/40 text-slate-300'
                            : 'bg-rose-500/20 border-rose-400/40 text-rose-300'
                        }`}>
                          {lastQteOutcome.statBonus.ratingDelta > 0
                            ? `+${lastQteOutcome.statBonus.ratingDelta.toFixed(2)}`
                            : lastQteOutcome.statBonus.ratingDelta === 0
                            ? `0.00`
                            : `${lastQteOutcome.statBonus.ratingDelta.toFixed(2)}`} {t('Rating')}
                        </span>
                        {lastQteOutcome.statBonus.fameDelta ? (
                          <span className="text-[10px] font-arcade font-black px-1.5 py-0.5 pixel-corners border bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse">
                            {lastQteOutcome.statBonus.fameDelta} {t('Fame')}
                          </span>
                        ) : null}
                        <span className="text-[10px] font-arcade font-bold px-1.5 py-0.5 pixel-corners bg-black/40 border border-white/10">
                          {lastQteOutcome.precisionPercent}% {t('Precision')}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-white flex items-center justify-between">
                      <span>{t(lastQteOutcome.actionQualityTitle) || lastQteOutcome.actionQualityTitle}</span>
                      {lastQteOutcome.statBonus.timingBonus !== undefined && lastQteOutcome.statBonus.timingBonus > 0 && (
                        <span className="text-[9px] font-bold text-cyan-300 font-arcade">
                          +{lastQteOutcome.statBonus.timingBonus.toFixed(2)} {t('Timing Bonus')}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] opacity-90 font-retro">{t(lastQteOutcome.commentary) || lastQteOutcome.commentary}</p>
                  </div>
                )}

                {/* Execution Button or Instant Continue Button */}
                {!lastQteOutcome ? (
                  <button
                    onClick={handleExecuteQTE}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleExecuteQTE();
                    }}
                    className="w-full py-3.5 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-yellow-300 border-2 border-yellow-200 pixel-bevel-gold shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-95 touch-manipulation select-none uppercase font-pixel"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>{t('PRESS TO EXECUTE')} ({t(activeMoment.actionType)}) [SPACEBAR]</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDismissQteOutcomeImmediately}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleDismissQteOutcomeImmediately();
                    }}
                    className="w-full py-3.5 pixel-corners text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 border-2 border-emerald-200 pixel-bevel-raised shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 transform active:scale-95 touch-manipulation select-none uppercase font-pixel"
                  >
                    <span>{t('CONTINUE TO NEXT ACTION ⏩')} [SPACEBAR]</span>
                  </button>
                )}
              </div>
            )}

            {/* Bottom In-Match Player Stats Strip */}
            <div className="flex items-center justify-around border-t-2 border-emerald-500/30 pt-3 text-[11px] text-emerald-200 font-arcade z-10">
              <div>{t('Goals')}: <strong className="text-white">{playerGoals}</strong></div>
              <div>{t('Assists')}: <strong className="text-white">{playerAssists}</strong></div>
              <div>{t('Saves/Tackles')}: <strong className="text-white">{playerSaves + playerTackles}</strong></div>
            </div>
          </div>
        )}

        {/* ================= PENALTY SHOOTOUT VIEW ================= */}
        {!showTutorial && isPenaltyShootout && !isMatchFinished && (
          <PenaltyQteModal
            isOpen={true}
            player={player}
            goalkeeperOvr={opponentOvr}
            goalkeeperName={`${opponentName} ${t('Goalkeeper')}`}
            opponentName={opponentName}
            stageTitle={`${stageTitle} • ${t('Shootout Round {round} of 5', { round: `${penaltyRound}` })}`}
            isShootout={true}
            penaltyRoundIndex={penaltyRound}
            onComplete={handleShootoutPenaltyOutcome}
          />
        )}

        {/* ================= MATCH COMMENTARY FEED (32-BIT RETRO TICKER) ================= */}
        {!showTutorial && matchPhase === 'LIVE_MATCH' && (
          <div className="bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-sunken p-3.5 space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar text-xs font-pixel">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" /> {t('LIVE MATCH COMMENTARY FEED')}
            </div>
            {commentaryLogs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-2 ${
                  log.type === 'goal'
                    ? 'text-emerald-300 font-black'
                    : log.type === 'moment'
                    ? 'text-amber-300 font-black'
                    : 'text-slate-300 font-retro'
                }`}
              >
                <span className="font-arcade text-slate-500 shrink-0 text-[10px]">{log.minute}'</span>
                <span className="text-[11px]">{t(log.text)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ================= FINAL MATCH CEREMONY & SUMMARY (32-BIT RETRO CHAMPIONSHIP) ================= */}
        {!showTutorial && isMatchFinished && finalSummary && (
          <div className="space-y-5 text-center py-4 font-pixel">
            <div className="w-16 h-16 pixel-corners bg-amber-500/20 border-2 border-amber-400 pixel-bevel-gold text-amber-400 flex items-center justify-center mx-auto shadow-xl">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-black uppercase">
                {t(finalSummary.mvpStatus)}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase pixel-text-shadow">
                {finalSummary.playerTeamScore === finalSummary.opponentTeamScore
                  ? t('MATCH DRAW')
                  : finalSummary.isWinner
                  ? t('MATCH VICTORY!')
                  : t('MATCH DEFEAT')}
              </h2>
              <p className="text-xs text-slate-300 font-arcade">
                {t('Final Score')}: <strong className="text-amber-300">{finalSummary.playerTeamScore} - {finalSummary.opponentTeamScore}</strong>
              </p>
            </div>

            {/* Standard Match Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900 p-3.5 pixel-corners border-2 border-slate-700 pixel-bevel-raised text-xs">
              <div>
                <div className="text-slate-400 font-black uppercase text-[9px]">{t('Goals')}</div>
                <div className="text-base font-black text-emerald-400 font-arcade">{finalSummary.playerStats.goals}</div>
              </div>
              <div>
                <div className="text-slate-400 font-black uppercase text-[9px]">{t('Assists')}</div>
                <div className="text-base font-black text-sky-400 font-arcade">{finalSummary.playerStats.assists}</div>
              </div>
              <div>
                <div className="text-slate-400 font-black uppercase text-[9px]">{t('Match Rating')}</div>
                <div className="text-base font-black text-amber-300 font-arcade">{finalSummary.playerStats.rating.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-slate-400 font-black uppercase text-[9px]">{t('Fame Earned')}</div>
                <div className={`text-base font-black font-arcade ${finalSummary.fameEarned >= 0 ? 'text-purple-400' : 'text-rose-400'}`}>
                  {finalSummary.fameEarned >= 0 ? `+${finalSummary.fameEarned}` : finalSummary.fameEarned}
                </div>
              </div>
            </div>

            {/* KEY MOMENT PERFORMANCE SUMMARY */}
            <div className="bg-slate-900 border-2 border-amber-500/40 pixel-corners pixel-bevel-raised p-4 text-left space-y-3">
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b-2 border-slate-800 pb-2">
                <Award className="w-4 h-4 text-amber-400" />
                {t('KEY MOMENT PERFORMANCE SUMMARY')}
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center font-pixel">
                <div className="p-2.5 pixel-corners bg-emerald-950/80 border-2 border-emerald-500/50 pixel-bevel-raised">
                  <div className="text-[8px] font-black text-emerald-400 uppercase">{t('Perfect Actions')}</div>
                  <div className="text-xl font-black text-emerald-200 font-arcade">{finalSummary.playerStats.qtePerfectCount || 0}</div>
                </div>
                <div className="p-2.5 pixel-corners bg-amber-950/80 border-2 border-amber-500/50 pixel-bevel-raised">
                  <div className="text-[8px] font-black text-amber-400 uppercase">{t('Good Actions')}</div>
                  <div className="text-xl font-black text-amber-200 font-arcade">{finalSummary.playerStats.qteGoodCount || 0}</div>
                </div>
                <div className="p-2.5 pixel-corners bg-rose-950/80 border-2 border-rose-500/50 pixel-bevel-raised">
                  <div className="text-[8px] font-black text-rose-400 uppercase">{t('Failed Actions')}</div>
                  <div className="text-xl font-black text-rose-200 font-arcade">{finalSummary.playerStats.qteFailedCount || 0}</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-[10px]">
                <span className="text-slate-400 font-black uppercase">{t('Overall Match Impact')}:</span>
                <span className="font-black text-amber-300 text-xs">{t(finalSummary.qteImpactText || 'Solid Performance')}</span>
              </div>
            </div>

            {/* POST-MATCH PRESS CONFERENCE DECISION & SUMMARY */}
            {interviewOutcome ? (
              <div className="bg-slate-950 border-2 border-violet-500/50 pixel-corners pixel-bevel-raised p-3.5 text-left space-y-2 font-pixel">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-violet-300 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                    <Newspaper className="w-3.5 h-3.5 text-violet-400" />
                    {t('MEDIA HEADLINE AFTERMATH')}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 pixel-corners bg-violet-500/20 text-violet-300 font-black">
                    {interviewOutcome.declined ? t('Interview Declined') : t('Statement Delivered')}
                  </span>
                </div>
                <p className="text-xs font-black text-white italic font-retro">
                  "{t(interviewOutcome.headline)}"
                </p>
                <div className="flex items-center gap-3 text-[10px] pt-1 border-t border-slate-900">
                  <span className="text-slate-400">
                    {t('Fame')}: <strong className={`font-arcade ${interviewOutcome.fameDelta >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                      {interviewOutcome.fameDelta >= 0 ? `+${interviewOutcome.fameDelta}` : interviewOutcome.fameDelta}
                    </strong>
                  </span>
                  {interviewOutcome.appliedChemistryCeiling && (
                    <span className="text-red-400 font-bold">
                      ⚠️ {t('Chemistry Cap')}: {interviewOutcome.appliedChemistryCeiling.capPercent}% ({interviewOutcome.appliedChemistryCeiling.durationMonths}m)
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center items-center pt-2">
              {!interviewOutcome ? (
                <>
                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs font-black text-white bg-violet-600 hover:bg-violet-500 border-2 border-violet-300 pixel-bevel-raised shadow-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-98 uppercase font-pixel"
                  >
                    <Mic className="w-4 h-4" />
                    <span>{t('POST-MATCH PRESS CONFERENCE (Draw 3 Cards)')}</span>
                  </button>

                  <button
                    onClick={() => {
                      onMatchComplete({
                        ...finalSummary,
                        updatedPlayer: currentPlayer,
                        interviewOutcome,
                      });
                    }}
                    className="w-full sm:w-auto px-5 py-3 pixel-corners text-xs font-black text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 pixel-bevel-raised transition-all cursor-pointer inline-flex items-center justify-center gap-2 uppercase font-pixel"
                  >
                    <span>{t('Skip to Tournament Flow')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2]" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onMatchComplete({
                      ...finalSummary,
                      updatedPlayer: currentPlayer,
                      interviewOutcome,
                    });
                  }}
                  className="px-8 py-3.5 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-yellow-300 border-2 border-yellow-200 pixel-bevel-gold shadow-xl transition-all cursor-pointer inline-flex items-center gap-2 uppercase font-pixel"
                >
                  <span>{t('RETURN TO TOURNAMENT FLOW')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= POST-MATCH INTERVIEW MODAL INSTANCE ================= */}
        {showInterviewModal && finalSummary && (
          <PostMatchInterviewModal
            isOpen={showInterviewModal}
            player={currentPlayer}
            context={{
              matchImportance: classifyMatchImportance({
                stageTitle,
                teamAName: customPlayerTeamName || (currentPlayer.club as string) || 'My Team',
                teamBName: opponentName,
              }).category,
              matchTitle: stageTitle,
              playerTeamName: customPlayerTeamName || (currentPlayer.club as string) || 'My Team',
              opponentTeamName: opponentName,
              playerScore: finalSummary.playerTeamScore,
              opponentScore: finalSummary.opponentTeamScore,
              isWinner: finalSummary.isWinner,
              isDraw: finalSummary.playerTeamScore === finalSummary.opponentTeamScore,
              isFinal:
                stageTitle.toLowerCase().includes('final') &&
                !stageTitle.toLowerCase().includes('semi') &&
                !stageTitle.toLowerCase().includes('quarter'),
              isSemi: stageTitle.toLowerCase().includes('semi'),
              isDerby: stageTitle.toLowerCase().includes('derby') || opponentName.toLowerCase().includes('rival'),
              isTitleDecider:
                stageTitle.toLowerCase().includes('title') ||
                stageTitle.toLowerCase().includes('decider') ||
                stageTitle.toLowerCase().includes('championship'),
              isRelegationDecider:
                stageTitle.toLowerCase().includes('relegation') ||
                stageTitle.toLowerCase().includes('playoff'),
              playerGoals: finalSummary.playerStats.goals,
              playerAssists: finalSummary.playerStats.assists,
              playerRating: finalSummary.playerStats.rating,
              playerSaves: finalSummary.playerStats.saves,
              playerTackles: finalSummary.playerStats.tackles,
              mvpStatus: finalSummary.mvpStatus,
              wentToPenalties: finalSummary.wentToPenalties,
              qtePerfectCount: finalSummary.playerStats.qtePerfectCount,
              qteFailedCount: finalSummary.playerStats.qteFailedCount,
            }}
            onComplete={(updatedPlayer, outcome) => {
              setCurrentPlayer(updatedPlayer);
              setInterviewOutcome(outcome);
              setShowInterviewModal(false);
            }}
          />
        )}
        </div>
      </div>
    </div>,
    document.body
  );
};
