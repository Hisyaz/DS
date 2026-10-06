import { DuelCalculationResult } from '../utils/duelSystem';
import { InterviewOutcomeResult } from './interviewCards';

export type MatchImportanceCategory = 'DEFINITIVE' | 'IMPORTANT' | 'REGULAR';
export type KeyMatchPlayMode = 'slow' | 'decisive' | 'finals_only';

export type QTEActionType =
  | 'PASS'
  | 'DRIBBLE'
  | 'SHOOT'
  | 'HEADER'
  | 'TACKLE'
  | 'INTERCEPTION'
  | 'CLEARANCE'
  | 'SAVE'
  | 'PENALTY'
  | 'DUEL';

export type QTEZoneHit = 'BLUE' | 'GREEN' | 'ORANGE' | 'NORMAL_FAIL' | 'CRITICAL_FAIL' | 'MISS';

export type QTEResultQuality =
  | 'PERFECT'
  | 'GOOD'
  | 'WEAK'
  | 'TOO_EARLY'
  | 'TOO_LATE'
  | 'MISS'
  | 'CRITICAL_FAIL'
  | 'NORMAL_FAIL';

export type QTETimingFeedback =
  | '🔵 BLUE HIT — 100% PERFECT!'
  | '🔵 BLUE HIT — 100% SUCCESS!'
  | '🟢 GREEN HIT — EXCELLENT!'
  | '🟢 GREEN HIT — NEARLY BRILLIANT!'
  | '🟢 GREEN HIT — 80% SUCCESS!'
  | '🟠 ORANGE HIT — SCRAPPY SUCCESS!'
  | '🟠 ORANGE HIT — OPPONENT BLOCKED!'
  | '🟠 ORANGE HIT — 60% SUCCESS!'
  | '⚠️ NORMAL FAILURE — MISTIMED ACTION'
  | '💀 CRITICAL FAILURE — CATASTROPHIC ERROR!'
  | '❌ MISS — TOO EARLY!'
  | '❌ MISS — TOO LATE!'
  | 'Perfect Timing!'
  | 'Good Timing!'
  | 'Too Early!'
  | 'Too Late!';

export type QTEPerformanceTier = 'PERFECT' | 'GOOD' | 'WEAK' | 'FAILED';

export type FootballSpecificOutcome =
  | 'GOAL'
  | 'SAVE'
  | 'REBOUND'
  | 'MISS'
  | 'BLOCK'
  | 'WOODWORK'
  | 'BEAT_DEFENDER'
  | 'RETAIN_POSSESSION'
  | 'LOSE_BALL'
  | 'CHANCE_CREATED'
  | 'DRAW_FOUL'
  | 'COMPLETE'
  | 'INTERCEPTED'
  | 'DEFLECTION'
  | 'CLEAN_POSSESSION'
  | 'FOUL_COMMITTED'
  | 'CLEARANCE';

export type KeyMomentType =
  | 'THROUGH_BALL_PASS'
  | 'ONE_ON_ONE_DRIBBLE'
  | 'LONG_SHOT'
  | 'BOX_FINISHING'
  | 'CROSS_HEADER'
  | 'LATE_DECISIVE_STRIKE'
  | 'PENALTY_KICK'
  | 'LAST_MAN_TACKLE'
  | 'KEY_INTERCEPTION'
  | 'CRUCIAL_CLEARANCE'
  | 'BOX_PRESSING'
  | 'ONE_ON_ONE_SAVE'
  | 'LONG_RANGE_PARRY'
  | 'CLOSE_REFLEX_SAVE'
  | 'PENALTY_SAVE'
  | 'DEFENDING_DUEL'
  | 'CREATION_DUEL'
  | 'GOALSCORING_DUEL';

export interface KeyMomentEvent {
  id: string;
  minute: number;
  title: string;
  description: string;
  actionType: QTEActionType;
  momentType: KeyMomentType;
  relevantAttribute: string; // e.g., 'shooting', 'passing', 'dribbling', 'defending', 'stamina', 'reflexes'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CLUTCH';
  duelId?: string;
  duelMatchup?: DuelCalculationResult;
  stageTwoDuelId?: string;
  isStageTwoActive?: boolean;
  isClutchTime?: boolean;
  isExtraTimeMoment?: boolean;
}

export interface QTEResultOutcome {
  quality: QTEResultQuality;
  zoneHit: QTEZoneHit;
  performanceTier: QTEPerformanceTier;
  timingFeedback: QTETimingFeedback;
  precisionPercent: number; // 0 - 100% (proximity to center)
  successPercent: number; // 100%, 80%, 60%, 0%
  actionQualityTitle: string; // e.g. "Clinical Finish", "Forced Save", "Shot Lacks Power"
  success: boolean;
  commentary: string;
  duelOutcomeText?: string;
  footballOutcome?: FootballSpecificOutcome;
  statBonus: {
    goal?: boolean;
    assist?: boolean;
    save?: boolean;
    tackle?: boolean;
    concededGoal?: boolean;
    ratingDelta: number;
    timingBonus?: number;
    fameDelta?: number;
  };
}

export interface MatchCommentaryLog {
  id: string;
  minute: number;
  text: string;
  type: 'general' | 'moment' | 'goal' | 'whistle' | 'card';
}

export type MatchMvpStatus =
  | 'MVP 🏆'
  | 'Top Performer ⭐'
  | 'Solid Performance 👍'
  | 'Average Performance ⚽'
  | 'Poor Performance ⚠️'
  | 'Match Villain 💔';

export interface KeyMatchFinalSummary {
  matchTitle: string; // e.g. "International Youth Tournament Semi-Final"
  playerTeamName: string;
  opponentTeamName: string;
  playerTeamScore: number;
  opponentTeamScore: number;
  wentToExtraTime: boolean;
  wentToPenalties: boolean;
  penaltyPlayerTeamScore?: number;
  penaltyOpponentTeamScore?: number;
  isWinner: boolean;
  playerStats: {
    goals: number;
    assists: number;
    saves: number;
    tackles: number;
    interceptions: number;
    rating: number;
    qteSuccessCount: number;
    qteTotalCount: number;
    qtePerfectCount: number;
    qteGoodCount: number;
    qteFailedCount: number;
  };
  mvpStatus: MatchMvpStatus;
  qteImpactText: string;
  fameEarned: number;
  interviewOutcome?: InterviewOutcomeResult;
  updatedPlayer?: any;
}
