export type PenaltyScenePhase =
  | 'SCENE_0_INTRO'
  | 'SCENE_1_RUN_UP'
  | 'SCENE_2_AIM_VERTICAL'
  | 'SCENE_2_AIM_HORIZONTAL'
  | 'SCENE_3_POTENCY'
  | 'SCENE_4_RESOLUTION';

export type ContactQuality = 'EARLY_MISS' | 'NORMAL' | 'PERFECT' | 'LATE_WHIFF';

export type PenaltyShotTarget =
  | 'TOP_LEFT'
  | 'BOTTOM_LEFT'
  | 'CENTER'
  | 'TOP_RIGHT'
  | 'BOTTOM_RIGHT'
  | 'OUTSIDE_STANDS';

export type GoalkeeperAction =
  | 'CENTER'
  | 'TOP_LEFT'
  | 'BOTTOM_LEFT'
  | 'TOP_RIGHT'
  | 'BOTTOM_RIGHT';

export interface PenaltyQteOutcome {
  success: boolean;
  isGoal: boolean;
  isSaved: boolean;
  isMissed: boolean;
  isPathetic?: boolean;
  missReason?: 'TIMING_EARLY' | 'TIMING_LATE' | 'AIM_OUTSIDE' | 'OVERHIT' | 'SAVED' | 'MISSED_BALL' | 'WEAK_POTENCY';
  contactTier: ContactQuality;
  contactBonus: number; // 0 or +40%
  verticalContact: number; // -1 (bottom) to +1 (top)
  horizontalContact: number; // -1 (left) to +1 (right)
  shotTarget: PenaltyShotTarget;
  gkAction: GoalkeeperAction;
  gkGuessedCorrect: boolean;
  potencyValue: number; // 0 - 100
  potencyQuality: 'WEAK' | 'GOOD' | 'PERFECT' | 'OVERHIT';
  playerShooting: number;
  playerComposure: number;
  goalkeeperOvr: number;
  calculatedScoringChance: number; // 0 - 100%
  headline: string;
  commentary: string;
}
