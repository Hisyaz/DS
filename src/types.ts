import { SimulatedMatchResult } from './types/matchSimulation';

export type Nationality = {
  code: string;
  iso: string;
  name: string;
};

export type SkinColor = {
  name: string;
  hex: string;
};

export type HairStyle = 'straight' | 'wavy' | 'curly' | 'braided' | 'dreads' | 'special';
export type SpecialHairType =
  | 'r9-2002'
  | 'cornrows'
  | 'locs'
  | 'braid-top'
  | 'valderrama-afro'
  | 'vidal-crest'
  | 'zidane-bald-ring'
  | 'ronaldo-noodle'
  | 'taribo-west'
  | 'neymar-mohawk'
  | 'beckham-fauxhawk'
  | 'pogba-razor'
  | 'el-shaarawy-spikes'
  | 'cucurella-afro'
  | 'puyol-curly'
  | 'davids-goggles'
  | 'beckham-mohawk';
export type HairLength = 'shaved' | 'fade' | 'short' | 'medium' | 'long' | 'special';
export type FacialHairStyle =
  | 'none'
  | 'pubescent-moustache'
  | '3-day-beard'
  | 'well-kept'
  | 'chin-strap'
  | 'goatee'
  | 'mutton-chops'
  | 'wild-beard'
  | 'full-beard'
  | 'royal-beard'
  | 'moustache'
  | 'pointy-moustache'
  | 'classic-moustache';
export type KitStyle = 'tight' | 'normal' | 'loose';
export type KitPattern =
  | 'solid'
  | 'stripes'
  | 'sash'
  | 'checkered'
  | 'raglan-shoulders'
  | 'gradient'
  | 'halves'
  | 'hoops'
  | 'diagonal'
  | 'solid-line'
  | 'two-colors'
  | 'horizontal-middle-strip';
export type KitCollar = 'crew' | 'v-neck' | 'polo' | 'round' | 'sharp-v' | 'grandad' | 'black';

export type SponsorWritingStyle =
  | 'classic'
  | 'modern'
  | 'bold'
  | 'condensed'
  | 'elegant'
  | 'athletic';

export type SponsorBorderStyle =
  | 'none'
  | 'thin'
  | 'medium'
  | 'thick'
  | 'outline';

export interface SponsorDesignConfig {
  name: string;
  writingStyle?: SponsorWritingStyle;
  letterColor?: string;
  borderStyle?: SponsorBorderStyle;
  borderColor?: string;
  enabled?: boolean;
}
export type AccessoryType = 'none' | 'headband' | 'performance-band' | 'protective-mask' | 'sports-glasses' | 'classic-glasses';
export type HeadwearType = 'none' | 'headband' | 'performance-band';
export type EyewearType = 'none' | 'sports-glasses' | 'classic-glasses' | 'protective-mask';
export type NeckTattooType = 'none' | 'script' | 'rose' | 'wings' | 'tribal' | 'blackout';
export type ArmTattooType = 'none' | 'double-stripe' | 'two-lines' | 'script-sleeve' | 'text-script' | 'tribal' | 'mandala-sleeve' | 'full-sleeve-flowery' | 'blackout-sleeve';
export type FaceTattooType = 'none' | 'star' | 'under-eye-cross' | 'script-cheek' | 'crown-temple' | 'heart';

export type EarringType = 'none' | 'small-barbell' | 'large-barbell' | 'gem' | 'silver' | 'gold' | 'steel';
export type EarringMaterial = 'silver' | 'gold' | 'bronze' | 'black' | 'steel';
export type EarringGemColor = 'diamond' | 'white' | 'emerald' | 'sapphire' | 'amethyst';

export type NecklaceType = 'none' | 'gold-chain' | 'silver-chain' | 'dog-tags' | 'diamonds-incrusted' | 'diamond-chain';
export type EmblemShape =
  | 'square'
  | 'circle'
  | 'diamond'
  | 'arrow'
  | 'crested-shield'
  | 'crown-shield'
  | 'flame-shield'
  | 'star-shield'
  | 'barcelona'
  | 'real-madrid'
  | 'liverpool';
export type EmblemMode = '1' | '2' | '3';

export interface OutfieldDetailedStats {
  // PHY (Physical)
  pace: number;
  stamina: number;
  strength: number;
  // PRO (Progression)
  ballControl: number;
  retention: number;
  dribbling: number;
  // CRE (Creation)
  shortPass: number;
  longPass: number;
  crossing: number;
  // SCO (Goalscoring)
  shooting: number;
  heading: number;
  longShots: number;
  // DEF (Defensive)
  tackling: number;
  marking: number;
  interceptions: number;
  // MEN (Mental)
  positioning: number;
  composure: number;
  reactions: number;
}

export interface GkDetailedStats {
  saving: number;
  reflexes: number;
  handling: number;
  positioning: number;
  aerialReach: number;
  oneOnOne: number;
  distribution: number;
}

export interface PlayerStats {
  pro: number; // Progression
  def: number; // Defense
  cre: number; // Creativity
  men: number; // Mentality
  goa: number; // Goalscoring
  phy: number; // Physicality
  detailed?: OutfieldDetailedStats;
  gkDetailed?: GkDetailedStats;
}

export interface PlayerBiometrics {
  strength: number; // 40 - 99
  skinColor: string;
  hairStyle: HairStyle;
  hairLength: HairLength;
  specialHair?: SpecialHairType;
  hairRoot: string;
  hairDye: string;
  facialHairStyle?: FacialHairStyle;
  facialHair?: FacialHairStyle;
  facialHairColor?: string;
}

export interface PlayerAccessories {
  accessory: AccessoryType;
  headwear?: HeadwearType;
  eyewear?: EyewearType;
  headbandColor: string;
  glassesColor?: string;
  sportsGlassesColor?: string;
  tattooNeck?: NeckTattooType | boolean;
  tattooArmL?: ArmTattooType | boolean;
  tattooArmR?: ArmTattooType | boolean;
  tattooFace?: FaceTattooType;
  earring?: EarringType;
  earringL?: EarringType;
  earringR?: EarringType;
  earringMaterial?: EarringMaterial;
  earringGemColor?: EarringGemColor;
  necklace?: NecklaceType;
}

export interface KitConfig {
  style?: KitStyle;
  color1: string;
  color2: string;
  pattern: KitPattern;
  collar?: KitCollar;
  sponsor?: SponsorDesignConfig;
}

export interface EmblemConfig {
  shape: EmblemShape;
  mode: EmblemMode; // '1', '2', or '3'
  color1: string;
  color2: string;
  color3?: string;
  url?: string;
}

export interface TrophyItem {
  id: string;
  name: string;
  category: 'national' | 'continental' | 'international' | 'youth' | 'individual' | 'friendly';
  year: string; // e.g., "2022" or "2009, 2011, 2015"
  count?: number; // e.g. 8 for 8x Ballon d'Or
  prestige: number; // For sorting left to right (e.g. 100 max)
  iconType: 'world-cup' | 'champions-league' | 'league' | 'cup' | 'ballon-dor' | 'golden-boot' | 'best-player' | 'youth-trophy' | 'super-cup' | 'olympic-gold' | 'europa-league' | 'libertadores' | 'club-world-cup' | 'continental' | 'friendly';
  clubWonWith?: string;
  countryWonWith?: string;
  teamWonWith?: string;
  isNationalTeam?: boolean;
}

export interface LegendObjective {
  id: string;
  text: string;
  target: number;
  current: number;
}

export interface LegendChallengeSet {
  title: string;
  description?: string;
  objectives: LegendObjective[];
}

export interface LegendPerk {
  name: string;
  description: string;
}

import { FullCareerHistory, FarewellMatchResult } from './types/careerConclusion';

export type PositionMasteryTier = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface PlayerPositionSlot {
  id: string;
  slotIndex: number; // 1 to 5 (1 = Main, 2-5 = Additional)
  position: 'ATT' | 'MID' | 'DEF' | 'GK' | string;
  subPosition: string; // e.g. 'ST', 'CM', 'LM', 'RM', 'SS', 'LWB', 'RWB', etc.
  playStyle: string; // e.g. 'Poacher', 'Traditional', 'Creator', etc.
  tier: PositionMasteryTier; // 'I', 'II', 'III', 'IV', or 'V' for main
  isMain?: boolean;
}

export type PlayerConfig = PlayerCardData;

export type CareerStage = 'YOUTH_ACADEMY' | 'PROFESSIONAL' | 'FREE_AGENT' | 'youth' | 'pro' | 'free_agent' | string;

export interface ActiveChemistryCap {
  id: string;
  capPercent: number; // e.g. 80
  penaltyReduction: number; // e.g. 20 (from 100 - capPercent)
  monthsRemaining: number;
  originalDurationMonths: number;
  reason: string;
  appliedDate?: string;
}

export interface PlayerCardData {
  id: string;
  name: string;
  number?: number;
  shirtNumber?: number;
  country?: string;
  ovr: number;
  overallRating?: number;
  potentialOvr?: number;
  internalPotentialOvr?: number;
  hasIconicPotentialBreakthrough?: boolean;
  iconicPlayerEventCompleted?: boolean;
  age: number;
  club: string;
  clubId?: string;
  clubCountry?: string;
  league?: string;
  leagueId?: string;
  leagueTier?: number | string;
  startingCity?: string;
  city?: string;
  tutorialEnabled?: boolean;
  unassignedPoints?: number;
  nationality?: Nationality;
  otherNationalities?: Nationality[];
  stats: PlayerStats;
  biometrics: PlayerBiometrics;
  accessories: PlayerAccessories;
  kit: KitConfig;
  emblem: EmblemConfig;
  customBio?: string;
  position?: string;
  subPosition?: string;
  playStyle?: string;
  positions?: PlayerPositionSlot[];
  seasonMatchesByPosition?: Record<string, number>;
  totalSeasonMatchesPlayed?: number;
  playerTypeId?: string;
  preferredFoot?: 'Left' | 'Right';
  weakFootStars?: number;
  heightCm?: number;
  weightKg?: number;
  hasHadGrowthSpurt?: boolean;
  lastYearGrowthCm?: number;
  lastYearWasGrowthSpurt?: boolean;
  inheritedHeightCmApplied?: boolean;
  inheritedHeightCm?: number;
  isUniqueElite?: boolean;
  championCoins?: number;
  trophies?: TrophyItem[];
  declinedInternationalCallUps?: any;
  resolvedInternationalSeasons?: number[];
  completedInternationalEvents?: string[];
  activeInternationalDuty?: any;
  isRepresentingNationalTeam?: boolean; // Whether the player is currently on international duty or representing their national team
  // Stamina & Injury / Fitness System
  fitness?: number; // Current physical condition (0 to 100%)
  staminaCurrent?: number; // Legacy alias for fitness
  isInjured?: boolean; // Whether the player is currently injured
  healthStatus?: 'healthy' | 'injured'; // Explicit health status ('healthy' | 'injured')
  injuryWeeksRemaining?: number; // Weeks remaining for injury recovery
  injuryTotalWeeks?: number; // Original total duration of injury in weeks
  hasSeenInjuryModal?: boolean; // Whether the user acknowledged the injury popup
  justRecoveredFromInjury?: boolean; // True when player just finished injury recovery
  hasSeenFitToPlayModal?: boolean; // Whether user acknowledged the fit-to-play modal
  injuryName?: string; // Name of current injury (e.g., "Hamstring Tear")
  lastInjuryTimestamp?: number; // Timestamp of the last injury suffered
  injuryDetails?: any; // Detailed Injury object (type, grade, monthsText, description)
  postInjuryProtectionUntilTimestamp?: number; // Timestamp until which 80% post-injury risk reduction applies
  postInjuryProtectionMonthsRemaining?: number; // Number of in-game calendar months remaining for 80% protection
  isPostInjuryProtected?: boolean; // Flag indicating 80% post-injury risk reduction is currently active
  justEarnedInjuryPronePerk?: boolean; // True if player just unlocked the Injury Prone perk
  hasHadInjuryPronePerk?: boolean; // True if player has ever received the Injury Prone perk in this career run
  recoveryPoints?: number; // Injury Recovery Points stored
  recoverySupplements?: number; // Recovery Supplements stored (restores physical condition)
  isCareerEndingRisk?: boolean; // Whether player suffered a 52+ week injury requiring a retirement decision
  isRetired?: boolean; // Whether player chose retirement after career-ending injury
  isProPlayer?: boolean; // Whether player signed a professional contract
  isYouthCareerActive?: boolean; // Whether player is currently in youth academy stage
  isCareerModeActive?: boolean; // Whether player is currently in pro career mode
  careerStage?: string; // e.g. 'youth' | 'pro'
  squadDestination?: 'First Team' | 'Reserves' | 'U20' | 'U17' | string;
  squadRole?: string; // e.g. 'First Team Regular' | 'Starter' | 'Rotation Player'
  playingTimeExpectation?: string;
  divisionTier?: string | number;
  youthLeagueTeam?: any;
  youthTeamName?: string;
  youthLeagueName?: string;
  youthLeagueStaminaPenalty?: number;
  youthLeagueChemistryCap?: number;
  biggerYouthClubName?: string;
  biggerYouthClubSeasonsCompleted?: number;
  lastAdaptationSeasonYear?: string;
  youthAcademyTier?: 'Youth Academy Top Tier' | 'Average Youth Academy Tier' | string;
  youthClubChoice?: 'big_club' | 'local_club' | string;
  youthStartingStatus?: 'starter' | 'substitute';
  youthCoachName?: string;
  youthDevelopmentPoints?: number;
  clubDevelopmentPoints?: number;
  isBigClubYouth?: boolean;
  isProfessional?: boolean;
  countryCode?: string;
  // Training Progress & In-Game Calendar
  trainingProgress?: number; // 0 to 100%
  selectedTrainingGroup?: string; // Persistent training selection across seasons
  simulationSpeed?: 'slow' | 'normal' | 'fast' | 'instant'; // Global persistent simulation speed
  calendarDate?: string; // e.g. "14 December 2028"
  marketValue?: number; // Estimated player market value in Euros
  currentWeek?: number; // 1 to 52
  currentMonth?: number; // 1 to 12
  currentSeason?: number; // 1, 2, 3...
  seasonPhase?: 'preseason' | 'first_half' | 'midseason' | 'second_half' | 'offseason';
  lastProcessedMonthYear?: string; // e.g. "2029-01" to avoid duplicate monthly chemistry
  processedHalfSeasons?: string[]; // e.g. ["S1-H1", "S1-H2"] to avoid duplicate recovery point awards
  usedPreseasonTrain?: boolean; // Max 1 manual train per preseason
  usedMidseasonTrain?: boolean; // Max 1 manual train per mid-season
  // Career Fame, Bad Reputation, Chemistry & Cards Collection
  fame?: number; // 0 to 1000
  badReputation?: number; // 0 to 100 within current tier
  badReputationTier?: number; // 0, 1, 2, or 3 (Roman numerals: '', 'I', 'II', 'III')
  chemistry?: number; // 0 to 200 (Default starting 50; 0-100 base, 101-200 overflow)
  hasSeenOverflowChemistryExplainer?: boolean; // Tracks if player has seen the Overflow Chemistry explanation popup
  chemistryCeiling?: number; // Temporary Chemistry Ceiling (e.g. 80%)
  chemistryCeilingMonthsRemaining?: number; // In-game months until Chemistry Ceiling expires
  chemistryCeilingReason?: string; // Reason for Chemistry Ceiling
  chemistryCaps?: ActiveChemistryCap[]; // Stack of active chemistry caps that stack debuffs
  pendingBlockedChemistry?: { amount: number; source?: string }[]; // Chemistry stored while blocked by ceiling
  chemistryGainHalvedMonthsRemaining?: number; // In-game months where monthly chemistry gain is halved (50%)
  keyMatchPlayMode?: 'slow' | 'decisive' | 'finals_only'; // Career Key Match Frequency Mode
  transferFrequency?: TransferFrequencySetting; // AI Transfer Activity Setting (Default: 'no_transfers')
  requestedTransfer?: boolean;
  transferRequestUsedThisSeason?: boolean; // Limits transfer requests to once per season (recharged at preseason)
  pendingTransferRequest?: any; // Queued transfer offer/opportunity to deliver at the next transfer window
  youthTrainedCountries?: string[]; // Countries where player developed in youth academies
  earnedNationalities?: string[]; // Nationalities earned through foreign youth development
  hasSeenSaudiOfferEvent?: boolean; // True once player has experienced the Arabian Mega-Offer event
  growthSpurtPenaltyMonthsRemaining?: number; // 1 during the month following growth spurt
  growthSpurtPenaltyActive?: boolean;
  relaxingVacationActive?: boolean; // True when Relaxing Vacations perk is active during the first 2 months (-10 stamina until form recovered)
  relaxingVacationMatchesRemaining?: number; // Matches remaining until form is recovered
  // Stat Break System (Ultra-rare 99 -> 100+ Historic Mastery Mechanic)
  statBreakActive?: boolean;
  statBreakStats?: Record<string, number>; // e.g. { dribbling: 100, shooting: 100 }
  statBreakHistory?: { statKey: string; previousValue: number; newValue: number; cardName: string; timestamp?: string }[];
  // Development Training Level System (Tiered growth curves & fractional progress)
  statTrainingProgress?: Record<string, number>; // e.g. { dribbling: 0.5 } (0 to < 1 progress towards next level)
  hasSeenDevProgressionTutorial?: boolean; // Tracks whether player has viewed the Development progression tutorial
  collectedCards?: CareerCollectedCard[];
  // Parent Card System & Family Identity
  equippedParentCard?: any; // ParentCardInstance
  perks?: any[];
  preseasonEventCompleted?: boolean;
  extendedPreseasonEventDone?: boolean;
  preseasonCrossroadsCompleted?: boolean;
  firstName?: string;
  originalFirstName?: string;
  birthFirstName?: string;
  birthLastName?: string;
  birthFullName?: string;
  lastSimulatedMonthYear?: string;
  lastName?: string;
  originalLastName?: string;
  originLastName?: string;
  selectedLastNameType?: 'original' | 'origin';
  familyName?: string;
  familyIdentity?: string;
  nickname?: string;
  hasHadNicknameEvent?: boolean;
  nicknameAccepted?: boolean;
  obtainedNicknames?: string[];
  hasHadPreseasonEvent?: boolean;
  unlockedFeatNicknames?: string[];
  consecutiveUclTitlesWithTopScorer?: number;
  startingWorldCupWins?: number;
  isBrazilHeritage?: boolean;
  nameSuffix?: string;
  extraNationalities?: Nationality[];
  seniorNationalTeamLocked?: boolean;
  isSeniorLocked?: boolean;
  u17Qualified?: boolean;
  u20Qualified?: boolean;
  seniorQualified?: boolean;
  u17Nation?: string;
  u20Nation?: string;
  seniorNation?: string;
  internationalCaps?: number;
  internationalGoals?: number;
  u17Caps?: number;
  u17Goals?: number;
  u20Caps?: number;
  u20Goals?: number;
  seniorCaps?: number;
  seniorGoals?: number;
  internationalTrophies?: TrophyItem[];
  u17TournamentHistory?: any[];
  u20TournamentHistory?: any[];
  seniorTournamentHistory?: any[];
  freeStatPoints?: number;
  activeBonusStats?: Record<string, number>; // Temporary flat attribute modifiers
  activeConsumables?: { id: string; name: string; statBonuses?: Record<string, number>; matchesRemaining?: number; matchDuration?: number }[];
  activeEquipment?: StoreUpgradeItem[];
  activeSeasonBoosts?: StoreUpgradeItem[];
  activeChemicalEnhancementSeason?: boolean;
  activeTapingMonths?: number;
  bonusRetirementYears?: number;
  parentAdviceUsedThisSeason?: boolean;
  outsiderAdaptabilityPotentialGained?: number;
  builtForGreatnessPotentialGained?: number;
  managerState?: ManagerState;
  managerName?: string;
  // Potential Reached Tracking
  hasUsedEarlyPotentialBoost?: boolean;
  lastReachedPotentialOvr?: number;
  overconfidenceDropPending?: boolean;
  // Career Perks System
  activePerkIds?: string[]; // Max 5 active perk IDs
  retiredPerkIds?: string[]; // Replaced/deactivated perk IDs (cannot be reactivated)
  hasOutsideFootPerk?: boolean; // True if player unlocked the Outside Foot perk via Iconic Trivela Street Card
  hasSnakePerk?: boolean; // True if player earned the Snake / Traidor / Judas perk
  hasStepOnPerk?: boolean; // True if player unlocked Step On (Pisarla) perk via Iconic Youth Card
  betrayedClubs?: string[]; // List of clubs the player betrayed by transferring directly to a rival (never signable again)
  statBreakPerkRolled?: Record<string, boolean>; // Tracks if 5% roll has been executed for stat break perks
  spentMoneyOnBusinessFirst?: boolean; // True if first expense in career was a business purchase
  hasSpentAnyMoney?: boolean; // Tracks if user has ever spent money in career
  hasHadPositiveBankBalance?: boolean; // True if bank balance ever exceeded 0
  hasNeverHitZeroBalanceSinceFirstDeposit?: boolean; // True if bank never hit 0 after first deposit
  // Club Icon & Career Legend Progression
  clubIconPoints?: Record<string, number>; // Club-specific icon points (Season + Trophy points)
  globalIconPoints?: number; // Career-accumulated global icon points for unlocking Play as a Legend content
  // Legend & Retirement / Conclusion System
  isLegend?: boolean;
  legendPerk?: LegendPerk;
  legendChallenge?: LegendChallengeSet;
  retirementAge?: number;
  expectedPeak?: number;
  careerConcluded?: boolean;
  farewellResult?: FarewellMatchResult;
  careerHistory?: FullCareerHistory;
  historyLog?: string[];
  isFreeAgent?: boolean;
  releaseClause?: number;
  contractYearsRemaining?: number;
  transferStatus?: string;
  // Special Club Interest & Hostage Tracking
  permanentlyRejectedClubs?: string[]; // Permanently rejected Big Three clubs
  permanentlyRejectedSaudi?: boolean; // Permanently rejected Saudi Pro League offers
  specialClubInterestDecay?: Record<string, { status: 'pending_retry' | 'dropped' | 'final_dropped'; yearCount: number; lastAttemptYear?: number }>;
  hasBeenHostageBefore?: boolean;
  isCurrentlyHostage?: boolean;
  hostageMonthsRemaining?: number;
  eplSigningEventUnlocked?: boolean; // True if player completed/unlocked the EPL Signing Event
  eplSigningEventDismissed?: boolean;
  // Active Temporal Cards Tracking
  activeTemporalCards?: ActiveTemporalCard[];
  // Match Simulation History
  lastSimulatedMatches?: SimulatedMatchResult[];
}

export type OfficialCardType =
  | 'youth'
  | 'street'
  | 'career'
  | 'lifestyle'
  | 'sponsor'
  | 'manager'
  | 'parent';

export type OfficialEffectCategory =
  | 'positive'
  | 'negative'
  | 'double_edged'
  | 'temporal';

export type TemporalSubtype =
  | 'temporal_positive'
  | 'temporal_negative'
  | 'temporal_double_edged';

export type CardDuration = 'none' | '6_months' | '1_year';

export interface ActiveTemporalCard {
  id: string;
  cardId: string;
  name: string;
  cardType: string;
  effectCategory: 'positive' | 'negative' | 'double_edged';
  tier: string;
  duration: '6_months' | '1_year';
  remainingMonths: number;
  appliedDate: string;
  appliedSeason: number;
  statDeltas?: Record<string, number>;
  fameDelta?: number;
  badRepDelta?: number;
  chemistryDelta?: number;
  description?: string;
}

export type CollectedCardCategory = 'parent' | 'bad_fame' | 'street' | 'youth_league' | 'other_career';

export interface CareerCollectedCard {
  id: string;
  name: string;
  category: CollectedCardCategory;
  description?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'GOAT' | 'Bronze' | 'Silver' | 'Gold' | 'Iconic';
  effects: string[];
  obtainedAt: string;
  designColor?: string;
  iconName?: string;
}

export type CardTier = 'white' | 'bronze' | 'silver' | 'gold' | 'legendary' | 'goat';

// --- PERSISTENT CAREER & UI TYPES ---

export interface SponsorItem {
  id: string;
  name: string;
  category?: 'good' | 'negative' | 'double_edged' | string;
  brand?: string;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Legendary' | string;
  yearlyPayment?: number;
  yearlyValue?: number;
  weeklyPay?: number;
  initialPayment?: number;
  durationYears?: number;
  remainingYears?: number;
  logoColor?: string;
  bonusTerms?: string;
  fameBonus?: number;
  isCustom?: boolean;
  debtObligation?: {
    repaymentAmount: number;
    dueWeeksRemaining?: number;
    repaid?: boolean;
  };
  fameDelta?: number;
  badRepDelta?: number;
  managerMarketingDelta?: number;
  active?: boolean;
  obtainedDate?: string;
}

export interface SanctionItem {
  id: string;
  reason: string;
  amount: number;
  category: 'card_fine' | 'tax_fine' | 'suspension' | 'substance_fine' | 'discipline';
  date: string;
}

export interface BusinessItem {
  id: string;
  templateId: string;
  name: string;
  tier: number; // 1 to 5
  revenue: number; // Annual Revenue
  expenses: number; // Operating Costs
  netProfit: number; // Net Profit
}

export interface AccountingState {
  contractYears: number;
  yearlySalary: number;
  sponsors: SponsorItem[];
  sanctions: SanctionItem[];
  businesses: BusinessItem[];
  totalSavings?: number;
  signingBonus?: number;
  performanceBonus?: number;
  contractBonusTerms?: string;
  releaseClause?: number;
  contractStartYear?: number;
  contractEndYear?: number;
  transferStatus?: 'not_listed' | 'transfer_listed' | 'free_agent' | 'negotiating' | 'approached';
}

export type AgentType =
  | 'ex_pro_parents'
  | 'helicopter_parents'
  | 'parent_ex_pro'
  | 'parent_helicopter'
  | 'professional'
  | 'shady'
  | 'famous'
  | 'club_legend'
  | 'unassigned';

export type ManagerType = AgentType;

export type AgentTier = 'bronze' | 'silver' | 'gold' | 'legendary' | 'iconic';
export type ManagerTier = AgentTier;

export interface ShadyDealObjective {
  id: string;
  title: string;
  type?: string;
  conditionType?: 'red_card' | 'yellow_card' | 'no_goal_final' | 'lose_duel' | 'no_motm_final' | string;
  description: string;
  targetMatchNumber?: number;
  isFinalMatch?: boolean;
  cashReward?: number;
  rewardCash?: number;
  rewardDescription?: string;
  promisedPerk?: string;
  status?: 'pending' | 'completed' | 'failed';
  accepted?: boolean;
  isAccepted?: boolean;
  isCompleted?: boolean;
  isFailed?: boolean;
}

export interface ShadyProposition {
  id: string;
  title: string;
  scenario: string;
  requestType: 'yellow_card' | 'miss_game' | 'early_sub' | 'penalty_scuff';
  description: string;
  actionInstruction: string;
  cashReward: number; // e.g. €1,000,000
  promisedClubBonus?: string;
  investigationRiskPct: number; // e.g. 25%
  sanctionFine: number; // e.g. €250,000
  matchBanWeeks: number; // e.g. 4
  reputationPenalty: number; // e.g. 25
}

export interface AgentState {
  name: string | null; // null or "No current agent"
  agentType?: AgentType;
  managerType?: AgentType;
  tier?: AgentTier;
  negotiation: number; // 0..100
  network: number; // 0..100
  marketing: number; // 0..100
  bio?: string;
  agencyName?: string;
  associatedClubName?: string;
  associatedClubLeague?: string;
  associatedClubCountry?: string;
  associatedClubTier?: 1 | 2;
  clubPrestigeStars?: number;
  specialTrait?: string;
  isParentAgent?: boolean;
  isNewCardGuaranteed?: boolean;
  pendingShadyProposition?: ShadyProposition | null;
  pendingShadyDeal?: ShadyDealObjective | null;
  historyLog?: string[];
}

export type ManagerState = AgentState;

export interface StoreUpgradeItem {
  id: string;
  name: string;
  category: 'upgrade' | 'season_boost' | 'equipment' | 'special_hair' | 'consumable' | 'consumables' | 'pro_equipment' | 'cosmetics';
  description: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  costEuros?: number;
  coinPrice?: number;
  effect?: string;
  effectSummary?: string;
  iconKey?: string;
  durability?: { current: number; max: number };
  matchDuration?: number;
  availableStock?: number;
  maxStock?: number;
  statBonuses?: Partial<Record<string, number>>;
  injuryRiskReduction?: number;
  recoveryPoints?: number;
  fitnessBoost?: number;
  unlocked?: boolean;
  specialHairType?: SpecialHairType;
  cosmeticType?: 'hair_dye' | 'facial_hair' | 'headwear' | 'necklace' | 'earring' | 'tattoo' | 'special_hair';
  cosmeticValue?: string;
  minAge?: number;
  badFameBonus?: number;
  fameBonus?: number;
  equipmentVariant?: 'defensive' | 'creative' | 'offensive';
  isChampionsLeagueOnly?: boolean;
}

export type TransferFrequencySetting = 'no_transfers' | 'less' | 'normal' | 'more';

export type FontSizeOption = 'sm' | 'md' | 'lg';

// --- CUSTOM CARD DECK EDITOR TYPES ---

export type CustomCardCategory =
  | 'parents'
  | 'street'
  | 'youth'
  | 'career'
  | 'life'
  | 'sponsor'
  | 'match_day'
  | 'agent'
  | 'interview';

export type CustomCardTier =
  | 'white'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'legendary'
  | 'iconic'
  | 'epic_goat'
  | 'scrap'
  | 'rust'
  | 'ash'
  | 'disaster'
  | 'obsidian_knife'
  | 'stone_dagger'
  | 'copper_dagger'
  | 'copper_knife'
  | 'steel_blade'
  | 'muramasa_blade';

export type ModifierTarget =
  | 'stat_weak_foot'
  | 'stat_free_points'
  | 'stat_potential'
  | 'stat_composure'
  | 'stat_stamina'
  | 'stat_strength'
  | 'stat_dribbling'
  | 'stat_reaction'
  | 'stat_position'
  | 'stat_fame'
  | 'bad_reputation'
  | 'team_chemistry'
  | 'chemistry_ceiling'
  | 'extra_nationalities'
  | 'starting_cash'
  | 'starting_business'
  | 'manager_quality'
  | 'agent_negotiation'
  | 'agent_network'
  | 'agent_marketing'
  | 'stat_pro'
  | 'stat_def'
  | 'stat_cre'
  | 'stat_men'
  | 'stat_goa'
  | 'stat_phy'
  | 'money'
  | 'retirement_age'
  | 'injury_chance'
  | 'injury_recovery'
  | 'stat_point_investment'
  | 'perk';

export interface CardModifier {
  id: string;
  target: ModifierTarget;
  operation: 'add' | 'subtract';
  valueType: 'flat' | 'percentage';
  value: number;
  statKey?: string;
  isStatPointProgression?: boolean;
  perkName?: string;
  perkAction?: 'add' | 'remove';
}

export interface CustomCard {
  id: string;
  name: string;
  category: CustomCardCategory;
  tier: CustomCardTier;
  effectCategory?: OfficialEffectCategory;
  temporalSubtype?: TemporalSubtype;
  duration?: CardDuration;
  description?: string;
  iconName?: string;
  modifiers: CardModifier[];
  statPointsBonus?: {
    statKey: string;
    statLabel: string;
    points: number;
  };
  translations?: Record<string, { name: string; description: string }>;
  isNewCardGuaranteed?: boolean;
  createdAt: string;
}

