export type InterviewCardCategory = 'good' | 'bad' | 'double_edged' | 'iconic';

export type InterviewGoodTier = 'bronze' | 'silver' | 'gold' | 'legendary';
export type InterviewBadTier = 'scrap' | 'rust' | 'ash' | 'disaster';
export type InterviewDoubleEdgedTier =
  | 'obsidian_knife'
  | 'copper_dagger'
  | 'steel_blade'
  | 'muramasa_blade'
  | 'stone_dagger'
  | 'copper_knife';
export type InterviewIconicTier = 'iconic';

export type InterviewCardTier =
  | InterviewGoodTier
  | InterviewBadTier
  | InterviewDoubleEdgedTier
  | InterviewIconicTier;

export interface ChemistryCeilingPenalty {
  capPercent: number; // e.g. 90, 85, 80, 70
  durationMonths: number; // e.g. 12
  reason: string;
}

export interface InterviewCardEffects {
  fameDelta: number; // e.g. +30, -10
  badReputationDelta?: number; // e.g. +15, -5
  chemistryDelta?: number; // immediate chemistry shift
  chemistryCeiling?: ChemistryCeilingPenalty; // Team Chemistry ceiling (e.g. 80% for 1 year)
  managerRelationshipDelta?: number; // -30 to +30
  fanReaction: 'adoration' | 'applause' | 'mixed' | 'outrage' | 'furious' | 'viral_icon';
  mediaHeadline: string;
  sponsorPerceptionDelta?: number; // -20 to +20
  bonusStatPoint?: number;
  statTarget?: string;
  specialPerkGranted?: string;
}

export interface InterviewCard {
  id: string;
  name: string;
  category: InterviewCardCategory;
  tier: InterviewCardTier;
  quote: string; // The spoken quote in press conference
  description: string;
  effects: InterviewCardEffects;
  isIconicSpecial?: boolean;
}

export interface InterviewQuestionContext {
  matchImportance: 'DEFINITIVE' | 'IMPORTANT' | 'REGULAR';
  matchTitle: string;
  playerTeamName: string;
  opponentTeamName: string;
  playerScore: number;
  opponentScore: number;
  isWinner: boolean;
  isDraw: boolean;
  isDerby?: boolean;
  derbyName?: string;
  isFinal?: boolean;
  isSemi?: boolean;
  isTitleDecider?: boolean;
  isRelegationDecider?: boolean;
  playerGoals: number;
  playerAssists: number;
  playerRating: number;
  playerSaves?: number;
  playerTackles?: number;
  mvpStatus: string;
  wentToPenalties?: boolean;
  penaltyShootoutScore?: string;
  penaltyMissed?: boolean;
  redCardOccurred?: boolean;
  qtePerfectCount?: number;
  qteFailedCount?: number;
}

export interface InterviewQuestion {
  id: string;
  outletName: string; // e.g., "Sky Sports", "Marca", "L'Équipe", "BBC Sport", "TNT Sports"
  outletBadge: string;
  journalistName: string;
  questionText: string;
  contextHeader: string;
  tone: 'investigative' | 'praising' | 'provocative' | 'celebratory' | 'critical';
}

export interface InterviewOutcomeResult {
  declined: boolean;
  chosenCard?: InterviewCard;
  fameDelta: number;
  badRepDelta: number;
  chemistryDelta: number;
  appliedChemistryCeiling?: ChemistryCeilingPenalty;
  headline: string;
  pressSummary: string;
  fanReaction: 'adoration' | 'applause' | 'mixed' | 'outrage' | 'furious' | 'viral_icon';
}
