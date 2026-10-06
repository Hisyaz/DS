import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PlayerConfig, AccountingState, ManagerState, Nationality, PlayerCardData } from '../types';
import { ChampionTitleData } from './ChampionsCelebrationModal';
import {
  YouthSeasonStats,
  YouthSeasonAwards,
  NewspaperArticles,
  InternationalTournamentResult,
  TournamentMatch,
  TrainingGroup,
  YouthLeagueStanding,
  InternationalYouthClub,
} from '../types/youthLeague';
import { KeyMatchFinalSummary } from '../types/keyMatch';
import { KeyMatchModal } from './KeyMatchModal';
import {
  CompetitionStartModal,
  CompetitionStartData,
  detectCompetitionType,
  calculateTeamExpectation,
} from './CompetitionStartModal';
import { YouthCardModal } from './YouthCardModal';
import { CareerStageCardModal } from './CareerStageCardModal';
import { NicknameEventModal } from './NicknameEventModal';
import { ManagerRecruitmentOfferModal } from './ManagerRecruitmentOfferModal';
import {
  calculatePreseasonManagerOfferRate,
  generateSinglePreseasonManagerOffer,
  generatePreseasonManagerOffers,
  hasActiveAgent,
} from '../utils/managerInteractionSystem';
import {
  rollStandardNicknameEvent,
  FEAT_NICKNAMES,
  FeatNicknameConfig,
  checkGoldenBoyFeat,
} from '../utils/nicknameSystem';
import { drawThreeYouthCards, applyYouthCardToPlayer } from '../utils/youthLeagueCardSystem';
import { calculateFameGainWithPerks, applyFameToPlayer } from '../utils/parentCardSystem';
import { YouthCardInstance } from '../types/youthLeagueCards';
import { sanitizeAndRepairPlayerIdentity, isProfessionalPlayer } from '../utils/playerIdentitySystem';
import {
  calculateAnnualDevelopmentPoints,
  getProCareerSeasonDevelopmentPoints,
  applyAcademySeasonDevelopmentPoints,
} from '../utils/developmentSystem';
import { AcademyDevelopmentModal } from './AcademyDevelopmentModal';
import { CareerHub } from './CareerHub';
import { AcademySeasonApplicationResult } from '../types/youthFootballSchools';
import {
  TRAINING_GROUPS,
  getCategoryByAge,
  simulateYouthBlock,
  calculateSeasonAwards,
  generateNewspaperArticles,
  simulateTournamentEarlyStages,
  isTrainingGroupCompleted,
  areAllTrainingGroupsCompleted,
  getFirstAvailableTrainingGroup,
  previewPreseasonTrainingAllocations,
  applyPreseasonTrainingToPlayer,
} from '../utils/youthLeagueSystem';
import { generateYouthBlockMatches } from '../utils/youthMatchSimulator';
import { getFitnessPercentage, resetFitnessForNewSeason, processInjuryForPlayer, useRecoveryPoint } from '../utils/staminaInjurySystem';
import { checkAndGrantIronBodyPerk, checkCareerPerkMilestones, CareerPerk, CAREER_PERKS_REGISTRY } from '../utils/perksSystem';
import { SuggestedActions, SuggestedActionCallbacks } from './SuggestedActions';
import { rebuildPlayerCompetitiveContextOnTransfer, resolveAuthoritativeClubContext } from '../utils/clubContextRebuilder';
import { getActiveChemistryCap, discountChemistryPenaltyMonths, getChemistryInfo } from '../utils/chemistrySystem';
import { audioManager } from '../utils/audioSystem';
import { YouthMatchCard } from './YouthMatchCard';
import { LiveTournamentSimulator } from './LiveTournamentSimulator';
import { CareerModeSelectorModal } from './CareerModeSelectorModal';
import { ContinentalDashboardModal } from './ContinentalDashboardModal';
import { ContinentalDrawModal } from './ContinentalDrawModal';
import { ContinentalDrawsSummaryModal } from './ContinentalDrawsSummaryModal';
import { getSeasonFlowConfiguration, isSouthAmericanContext, isEuropeanContext } from '../utils/seasonCalendarManager';
import { WorldResultsModal } from './WorldResultsModal';
import {
  advanceWorldSimulationToMatchday,
  simulateWorldCalendarWeek,
  getCalendarDateForMatchday,
  isPlayerInProClub,
  syncCareerBlockMatchesToWorldSimulation,
} from '../utils/worldSimulationEngine';
import {
  getOrInitContinentalStateForSeason,
  syncContinentalSimulationAfterMatch,
} from '../utils/continentalScheduleIntegration';
import { ContinentalTournamentSeasonState } from '../types/continentalCompetitions';
import { CAREER_PLAY_MODES, KeyMatchPlayMode, classifyMatchImportance, isKeyMatchForPlayer } from '../utils/matchImportanceSystem';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { simulateFullYouthLeagueStandings } from '../utils/youthLeagueSimulation';
import {
  buildInternationalYouthCup32,
  generate32ClubsForCup,
  simulateGroupStageMatches,
  generateNonQualifiedCupChampion,
  NonQualifiedCupSummary,
  FullInternationalYouthCupData,
} from '../utils/internationalYouthCupEngine';
import { GroupDrawSimulator } from './GroupDrawSimulator';
import { GroupStageGroup } from '../types/youthLeague';
import { NationalTeamDrawModal } from './NationalTeamDrawModal';
import { DrawNewsSection } from './DrawNewsSection';
import { generateDrawNewsPieces, DrawNewsItem } from '../utils/drawNewsSystem';
import {
  getScheduledInternationalCompetition,
  getScheduledInternationalCompetitions,
  evaluateNationalTeamCallUp,
  simulateBackgroundNationalTournament,
  createNationalTournamentResultNews,
  BackgroundTournamentResult,
  NationalTeamTier,
} from '../utils/nationalCallUpEngine';
import {
  checkSeasonInternationalDuty,
  applyInternationalMatchStatsToPlayer,
  injectNationalTeamMatchesIntoBlock,
} from '../utils/internationalScheduleIntegration';
import { evaluateSeasonSummaryGrade } from '../utils/tournamentGradingSystem';
import {
  InternationalDrawState,
  saveDrawState,
  isNationQualifiedForTournament,
} from '../utils/internationalDrawEngine';
import { InternationalTeamInfoModal } from './InternationalTeamInfoModal';
import { InternationalCallUpModal } from './InternationalCallUpModal';
import { InternationalTournamentModal } from './InternationalTournamentModal';
import { InternationalLiveHubModal } from './InternationalLiveHubModal';
import {
  InternationalTournamentHubState,
  InternationalFixture,
} from '../types/internationalFootball';
import {
  initializeInternationalHubState,
  simulateInternationalFixture,
  finalizeInternationalDuty,
  isInternationalEventCompleted,
  markInternationalEventCompleted,
} from '../utils/internationalFootballSystem';
import { InternationalCallUp } from '../types/nationalTeam';
import {
  getInternationalCycleForSeason,
  evaluatePlayerInternationalSelection,
  simulateBackgroundQualifiers,
  simulateWorldCupTournament,
  runQualifiersSimulation,
  createSeniorTournamentSummary,
  QualifierSummary,
  WorldCupSummary,
} from '../utils/internationalCareerCycleEngine';
import {
  acceptInternationalCallUp,
  declineInternationalCallUp,
  chooseAnotherNationForCallUp,
  getEligibleNationalities,
} from '../utils/nationalTeamSystem';
import {
  checkU17QualifiersEligibility,
  checkU17WorldCupEligibility,
  runCompleteU17Qualifiers,
  runCompleteU17WorldCup,
} from '../utils/u17NationalTeamEngine';
import {
  checkU20QualifiersEligibility,
  checkU20WorldCupEligibility,
  runCompleteU20Qualifiers,
  runCompleteU20WorldCup,
  getU20EligibleCallUpQueue,
} from '../utils/u20NationalTeamEngine';
import { calculateTryoutSuccessRate, generateFirstContractOffers, runProfessionalRecruitmentScan } from '../utils/earlyCareerSystem';
import { calculateAnnualPhysicalGrowth, AnnualGrowthResult } from '../utils/playerGrowthSystem';
import { GrowthSpurtModal } from './GrowthSpurtModal';
import { drawThreeStreetCards, drawFourStreetCards, applyStreetCardToPlayer } from '../utils/streetCardSystem';
import { awardTrophiesToPlayer } from '../utils/trophySystem';
import { StreetCardInstance, ProContractOffer } from '../types/streetCards';
import { FreeAgentHubModal } from './FreeAgentHubModal';
import { NationalTournamentDraw } from './NationalTournamentDraw';
import { NationalTournamentHub } from './NationalTournamentHub';
import {
  generateNationalTournamentDraw,
  initializeNationalTournamentState,
  NationalTournamentDrawState,
  NationalTournamentState,
  simulateRemainingTournamentMatches,
  finalizeNationalTournament,
} from '../utils/nationalTournamentManager';
import { UnifiedClubOfferModal } from './UnifiedClubOfferModal';
import { AwardsCeremonyModal } from './AwardsCeremonyModal';
import { SeasonSummaryModal } from './SeasonSummaryModal';
import { WorldAwardsSummaryPanel } from './WorldAwardsSummaryPanel';
import {
  calculateWorldIndividualAwards,
  isWorldAwardsRevealed,
  markWorldAwardsRevealed,
} from '../utils/individualAwardsEngine';
import { WorldAwardsSeasonResults } from '../types/individualAwards';
import {
  recordMatchToYearlyDatabase,
  recordInternationalDutyToYearlyDatabase,
  savePermanentPlayerCareerRecord,
  getBallonDorHistoricalRecords,
} from '../utils/yearlyStatisticsDatabase';
import { StreetCardModal } from './StreetCardModal';
import { PreseasonFriendlyCupModal } from './PreseasonFriendlyCupModal';
import { getClubPreseasonTrophyConfig } from '../utils/preseasonFriendlyEngine';
import {
  UnifiedClubOffer,
  runLeagueTryoutEvaluation,
  generateCuratedClubOffers,
  generateProactiveSeasonOffers,
  generateClubRenewalOffer,
  getAvailableTryoutLeagues,
  TryoutLeagueOption,
  AgentSearchDirective,
} from '../utils/clubOfferSystem';
import { findClubInLeagueDatabase } from '../utils/kitResolutionSystem';
import {
  calculateWeightedOvr,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
} from '../utils/statCalculations';
import { getActiveCompetitionThemeForPlayer } from '../utils/leagueThemeHelper';
import { getLeagueDatabase } from '../utils/leagueDatabaseSystem';
import { getCareerLeagueDatabase } from '../utils/careerSaveSystem';
import {
  simulateFullProfessionalLeague,
  getLeagueIdsForCountry,
  executePromotionRelegationRosterSwap,
} from '../utils/professionalLeagueEngine';
import {
  canUseTrainButton,
  applyTrainingProgressIncrement,
  resetAnnualTrainButtonLimits,
  calculateWeeklyTrainingProgressIncrement,
  getTrainingTransitionAge,
  getMonthsRequiredForTrainingLevel,
  applyAgePhysicalRegression,
} from '../utils/developmentSystem';
import { StoreUpgradeItem, applyPreseasonUpgrades, generatePreSeasonStoreReplenishment } from '../data/storeItems';
import { applyYearlyArchetypeBonus } from '../data/playerTypes';
import { CareerLifecycleMilestoneModal, LifecycleMilestoneData } from './CareerLifecycleMilestoneModal';
import { TransferOfferInterruptionModal } from './TransferOfferInterruptionModal';
import { SpecialSignInEventModal } from './SpecialSignInEventModal';
import {
  scanActiveSpecialClubInterests,
  convertSpecialEvaluationToUnifiedOffer,
  recordSpecialClubExplicitRejection,
} from '../utils/specialClubInterestSystem';
import { SpecialClubEvaluation } from '../types/specialClubInterest';
import {
  Trophy,
  Calendar,
  Newspaper,
  Globe,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Flame,
  Shield,
  Brain,
  Target,
  BatteryCharging,
  AlertOctagon,
  RefreshCw,
  Star,
  Play,
  Pause,
  Crosshair,
  ListOrdered,
  Eye,
  Lock,
  ArrowUp,
  ArrowDown,
  History,
  Clock,
  BarChart3,
  Medal,
  Briefcase,
  DollarSign,
  Dumbbell,
  Sun,
  X,
  FastForward,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { useTestMode } from '../utils/testModeSystem';
import { CareerSeasonHistoryView } from './CareerSeasonHistoryView';
import { CareerSeasonRecord, FullCareerHistory } from '../types/careerConclusion';
import { compileFullCareerHistory } from '../utils/careerConclusionSystem';
import { executeSeasonTransitionAndCleanup } from '../utils/seasonDataCleanup';
import {
  calculateGoalAndAssistLeaderboards,
  calculateSquadLeagueAwards,
  buildSeasonCompetitionBreakdown,
  buildSeasonTeamStandingsSummary,
  calculateIndividualAwardsWon,
  IndividualAwardItem,
  SeasonLeaderboards,
} from '../utils/seasonStatisticsTracker';
import {
  translateTrainingGroupName,
  translateTrainingGroupDesc,
  translateTrainingGroupStats,
  translateAttributeName,
  translateAttributeAbbreviation,
  translateQualificationBadge,
  translateStageReached,
  translateCompetitionType,
} from '../utils/localizationSystem';
import { YouthAcademyFarewellModal } from './YouthAcademyFarewellModal';
import { Age16TransferOffersModal } from './Age16TransferOffersModal';
import { YouthGraduationModal } from './YouthGraduationModal';
import { generateAge16TransferOffers, Age16TransferOffer } from '../utils/age16TransferSystem';
import { PremierLeagueEventModal, PremierLeagueClubOffer } from './PremierLeagueEventModal';
import { HotProspectEventModal, HotProspectClubPitch } from './HotProspectEventModal';
import {
  shouldTriggerPremierLeagueEvent,
  shouldTriggerHotProspectEvent,
} from '../utils/professionalOfferEligibility';
import { checkAndGrantYouthEarnedNationalities } from '../utils/transferRequestSystem';
import { YouthClubAdaptationModal } from './YouthClubAdaptationModal';
import {
  getPendingAdaptationEvent,
  advanceBiggerYouthClubAdaptation,
  cleanseBiggerYouthClubPenalties,
  isBiggerYouthClubActive,
} from '../utils/youthAdaptationSystem';

interface YouthSeasonDashboardModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  accounting?: AccountingState;
  manager?: ManagerState;
  storeItems?: StoreUpgradeItem[];
  showToast?: (msg: string) => void;
  onUpdatePlayer: (updated: PlayerConfig) => void;
  onUpdateAccounting?: (updated: AccountingState) => void;
  onUpdateManager?: (updated: ManagerState) => void;
  onUpdateStoreItems?: (items: StoreUpgradeItem[]) => void;
  onSeasonCompleted?: (updatedPlayer: PlayerConfig, updatedAccounting?: AccountingState) => void;
  onTriggerFirstContract: (offers: ProContractOffer[]) => void;
  onTriggerYouthLeagueExit?: () => void;
  onTriggerChampionModal?: (data: ChampionTitleData) => void;
  onTriggerCallUpModal?: (callUp: InternationalCallUp) => void;
  onTriggerPerkUnlock?: (perk: CareerPerk) => void;
  onClose: () => void;
  onOpenDevelopment?: () => void;
  onOpenCustomization?: () => void;
  onOpenStore?: () => void;
  onOpenCard?: () => void;
  onOpenMenu?: () => void;
  onOpenTransfer?: () => void;
  embedded?: boolean;
}

export const YouthSeasonDashboardModal: React.FC<YouthSeasonDashboardModalProps> = ({
  isOpen,
  player,
  accounting,
  manager,
  storeItems,
  showToast,
  onUpdatePlayer,
  onUpdateAccounting,
  onUpdateManager,
  onUpdateStoreItems,
  onSeasonCompleted,
  onTriggerFirstContract,
  onTriggerYouthLeagueExit,
  onTriggerChampionModal,
  onTriggerCallUpModal,
  onTriggerPerkUnlock,
  onClose,
  onOpenDevelopment,
  onOpenCustomization,
  onOpenStore,
  onOpenCard,
  onOpenMenu,
  onOpenTransfer,
  embedded = false,
}) => {
  const { isTestMode } = useTestMode();
  const { t, currentLanguage } = useLanguage();
  const age = player.age || 10;
  const seasonYear = `${2026 + (age - 10)}/${2027 + (age - 10)}`;

  const [currentStage, setCurrentStage] = useState<
    'hub' | 'block1' | 'mid_cards' | 'block2' | 'summary' | 'draw' | 'tournament' | 'training' | 'game_over' | 'national_draw' | 'national_tournament'
  >('hub');
  const [nationalDrawState, setNationalDrawState] = useState<NationalTournamentDrawState | null>(null);
  const [nationalTournamentState, setNationalTournamentState] = useState<NationalTournamentState | null>(null);
  const [pendingPostNationalStage, setPendingPostNationalStage] = useState<
    'hub' | 'block1' | 'mid_cards' | 'block2' | 'summary' | 'draw' | 'tournament' | 'training' | 'game_over' | 'mid_season_post_tournament' | 'end_season_post_tournament' | null
  >('summary');
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'history'>('dashboard');
  const [isWorldResultsOpen, setIsWorldResultsOpen] = useState<boolean>(false);

  const [isCareerCardModalOpen, setIsCareerCardModalOpen] = useState<boolean>(false);
  const [careerCardDrawType, setCareerCardDrawType] = useState<'mid_season' | 'pre_season'>('mid_season');

  const [block1Stats, setBlock1Stats] = useState<YouthSeasonStats | null>(null);
  const [block2Stats, setBlock2Stats] = useState<YouthSeasonStats | null>(null);
  const [drawnCards, setDrawnCards] = useState<StreetCardInstance[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [seasonAwards, setSeasonAwards] = useState<YouthSeasonAwards | null>(null);
  const [newspaper, setNewspaper] = useState<NewspaperArticles | null>(null);
  const [tournamentResult, setTournamentResult] = useState<InternationalTournamentResult | null>(null);
  const [selectedTrainingGroup, setSelectedTrainingGroup] = useState<TrainingGroup>(
    (player.selectedTrainingGroup as TrainingGroup) || 'PHY'
  );

  // Youth & Pro League Standings & Qualification State
  const [youthStandings, setYouthStandings] = useState<YouthLeagueStanding[] | null>(null);
  const [sisterDivisionStandings, setSisterDivisionStandings] = useState<YouthLeagueStanding[] | null>(null);
  const [sisterDivisionName, setSisterDivisionName] = useState<string | null>(null);
  const [firstTeamStandings, setFirstTeamStandings] = useState<YouthLeagueStanding[] | null>(null);
  const [firstTeamLeagueName, setFirstTeamLeagueName] = useState<string | null>(null);
  const [playoffPressureNote, setPlayoffPressureNote] = useState<string | null>(null);
  const [selectedDivisionView, setSelectedDivisionView] = useState<'primary' | 'sister' | 'first_team'>('primary');
  const [playerStanding, setPlayerStanding] = useState<YouthLeagueStanding | null>(null);
  const [isQualifiedForIntCup, setIsQualifiedForIntCup] = useState<boolean>(false);
  const [youthLeagueName, setYouthLeagueName] = useState<string>(() => {
    const isPro = isProfessionalPlayer(player) || (player.age || 10) >= 16;
    if (isPro) {
      const auth = resolveAuthoritativeClubContext(player.club || '', getCareerLeagueDatabase());
      const squadDest = player.squadDestination || ((player.age || 16) <= 16 ? 'U17' : (player.age || 16) <= 18 ? 'U20' : 'First Team');
      if (squadDest === 'U17') return `${auth.league} U17`;
      if (squadDest === 'U20') return `${auth.league} U20`;
      if (squadDest === 'Reserves') return `${auth.league} Reserves`;
      return auth.league;
    }
    return 'Youth League';
  });
  const [nonQualifiedCupSummary, setNonQualifiedCupSummary] = useState<NonQualifiedCupSummary | null>(null);
  const [cupClubsForDraw, setCupClubsForDraw] = useState<InternationalYouthClub[]>([]);

  // 32-Team International Youth Cup State
  const [intCupData, setIntCupData] = useState<FullInternationalYouthCupData | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);
  const [showPreseasonCrossroadsModal, setShowPreseasonCrossroadsModal] = useState<boolean>(false);
  const [featNicknameForModal, setFeatNicknameForModal] = useState<FeatNicknameConfig | null>(null);
  const [isPreseasonDrawPending, setIsPreseasonDrawPending] = useState<boolean>(false);
  const [preseasonAgentOffer, setPreseasonAgentOffer] = useState<ManagerState | null>(null);
  const [preseasonAgentOffers, setPreseasonAgentOffers] = useState<ManagerState[]>([]);
  const [showAgentOfferModal, setShowAgentOfferModal] = useState<boolean>(false);
  const [activeTournamentTab, setActiveTournamentTab] = useState<'matches' | 'groups' | 'pool'>('matches');
  const [inspectingClub, setInspectingClub] = useState<InternationalYouthClub | null>(null);

  // Key Match Tournament State
  const [activeKeyMatchStep, setActiveKeyMatchStep] = useState<
    'none' | 'quarter_final' | 'semi_final' | 'final' | 'third_place' | 'finished'
  >('none');
  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>([]);
  const [quarterOpponent, setQuarterOpponent] = useState<{ name: string; ovr: number }>({ name: 'Paris Saint-Germain U11', ovr: 65 });
  const [semiOpponent, setSemiOpponent] = useState<{ name: string; ovr: number }>({ name: 'Manchester City U11', ovr: 68 });
  const [finalOpponent, setFinalOpponent] = useState<{ name: string; ovr: number }>({ name: 'FC Barcelona U11', ovr: 70 });
  const [thirdPlaceOpponent, setThirdPlaceOpponent] = useState<{ name: string; ovr: number }>({ name: 'River Plate U11', ovr: 66 });
  const [keyMatchModalConfig, setKeyMatchModalConfig] = useState<{
    isOpen: boolean;
    stageTitle: string;
    opponentName: string;
    opponentOvr: number;
    step: 'quarter_final' | 'semi_final' | 'final' | 'third_place';
  } | null>(null);

  // Youth League Card Modal State
  const [youthCardModalConfig, setYouthCardModalConfig] = useState<{
    isOpen: boolean;
    seasonLabel: string;
    cards: YouthCardInstance[];
    drawType: 'mid_season' | 'pre_season';
  } | null>(null);

  // Growth Spurt Modal State
  const [growthSpurtModalData, setGrowthSpurtModalData] = useState<AnnualGrowthResult | null>(null);

  // Academy Development Report Modal State
  const [academyDevReport, setAcademyDevReport] = useState<AcademySeasonApplicationResult | null>(null);

  // Career Lifecycle Milestone Modal State (Age 10, 20, 28, 33)
  const [lifecycleMilestoneData, setLifecycleMilestoneData] = useState<LifecycleMilestoneData | null>(null);

  // Pre-Season Friendly Cup Modal State
  const [showPreseasonFriendlyModal, setShowPreseasonFriendlyModal] = useState<boolean>(false);
  const [hasPlayedPreseasonFriendlyCup, setHasPlayedPreseasonFriendlyCup] = useState<boolean>(false);

  // International Cycle State (U17, U20, Senior)
  const [activeIntCallUp, setActiveIntCallUp] = useState<InternationalCallUp | null>(null);
  const [intQualifierSummary, setIntQualifierSummary] = useState<QualifierSummary | null>(null);
  const [intWorldCupSummary, setIntWorldCupSummary] = useState<WorldCupSummary | null>(null);
  const [showIntTournamentModal, setShowIntTournamentModal] = useState<boolean>(false);
  const [youthIntHubState, setYouthIntHubState] = useState<InternationalTournamentHubState | null>(null);
  const [showYouthIntLiveHub, setShowYouthIntLiveHub] = useState<boolean>(false);
  const [youthIntKeyMatchConfig, setYouthIntKeyMatchConfig] = useState<{
    isOpen: boolean;
    stageTitle: string;
    opponentName: string;
    opponentOvr: number;
  } | null>(null);

  // Competition Start Modal State
  const [compStartModalConfig, setCompStartModalConfig] = useState<CompetitionStartData | null>(null);
  const [pendingBlockStartType, setPendingBlockStartType] = useState<'block1' | 'block2' | 'youth_cup' | 'int_cycle' | null>(null);

  // Relegation / Promotion Playoff Key Match State
  const [relegationSimData, setRelegationSimData] = useState<{
    promotedTeamIds: string[];
    relegatedTeamIds: string[];
  } | null>(null);
  const [playoffKeyMatchConfig, setPlayoffKeyMatchConfig] = useState<{
    isOpen: boolean;
    stageTitle: string;
    opponentName: string;
    opponentOvr: number;
    isTier1: boolean;
  } | null>(null);

  // Career Key Match Mode Selector Modal State
  const [showCareerModeModal, setShowCareerModeModal] = useState<boolean>(false);
  const [showContinentalModal, setShowContinentalModal] = useState<boolean>(false);
  const [showContinentalDrawModal, setShowContinentalDrawModal] = useState<boolean>(false);
  const [showContinentalDrawsSummaryModal, setShowContinentalDrawsSummaryModal] = useState<boolean>(false);
  const [pendingBlockAfterDraw, setPendingBlockAfterDraw] = useState<'block1' | 'block2' | null>(null);
  const [intDestinationStage, setIntDestinationStage] = useState<'block1' | 'block2' | 'summary' | null>(null);
  const [pendingContinentalDraw, setPendingContinentalDraw] = useState<ContinentalTournamentSeasonState | null>(null);
  const [pendingNationalTeamDraw, setPendingNationalTeamDraw] = useState<InternationalDrawState | null>(null);
  const [showNationalTeamDrawModal, setShowNationalTeamDrawModal] = useState<boolean>(false);
  const [seenContinentalDrawYears, setSeenContinentalDrawYears] = useState<number[]>([]);
  const [showAwardsCeremonyModal, setShowAwardsCeremonyModal] = useState<boolean>(false);
  const [showSeasonSummaryModal, setShowSeasonSummaryModal] = useState<boolean>(false);
  const [worldAwardsRevealed, setWorldAwardsRevealed] = useState<boolean>(() => isWorldAwardsRevealed(seasonYear));

  const flowConfig = useMemo(() => {
    return getSeasonFlowConfiguration(player, seasonYear, getCareerLeagueDatabase());
  }, [player.club, (player as any).clubCountry, (player as any).league, seasonYear]);

  const currentSeasonNumericYear = useMemo(() => {
    return parseInt(seasonYear.split('/')[0]) || 2026;
  }, [seasonYear]);

  const simChemInfo = useMemo(() => {
    return getChemistryInfo(
      player.chemistry,
      player.chemistryCeiling,
      player.chemistryCeilingMonthsRemaining,
      player.chemistryCeilingReason,
      player.chemistryGainHalvedMonthsRemaining,
      player.chemistryCaps
    );
  }, [
    player.chemistry,
    player.chemistryCeiling,
    player.chemistryCeilingMonthsRemaining,
    player.chemistryCeilingReason,
    player.chemistryGainHalvedMonthsRemaining,
    player.chemistryCaps,
  ]);

  const [customDrawNewsItems, setCustomDrawNewsItems] = useState<DrawNewsItem[]>([]);
  const [latestIntTournamentResult, setLatestIntTournamentResult] = useState<BackgroundTournamentResult | null>(null);

  const drawNewsItems = useMemo(() => {
    const base = generateDrawNewsPieces(player, currentSeasonNumericYear, getCareerLeagueDatabase());
    return [...customDrawNewsItems, ...base];
  }, [
    player?.club,
    player?.league,
    player?.startingCity,
    player?.age,
    player?.isProfessional,
    currentSeasonNumericYear,
    customDrawNewsItems,
  ]);

  useEffect(() => {
    setWorldAwardsRevealed(isWorldAwardsRevealed(seasonYear));
  }, [seasonYear]);

  const [pendingBlockKeyMatch, setPendingBlockKeyMatch] = useState<SimulatedMatchResult | null>(null);
  const [blockKeyMatchModalConfig, setBlockKeyMatchModalConfig] = useState<{
    isOpen: boolean;
    match: SimulatedMatchResult;
  } | null>(null);

  // Auto-redirect disabled to ensure Youth Club Protection (development continues until pro contract is signed)

  // Match-by-Match Visual Simulation State
  const [block1MatchList, setBlock1MatchList] = useState<SimulatedMatchResult[]>([]);
  const [block2MatchList, setBlock2MatchList] = useState<SimulatedMatchResult[]>([]);
  const [pendingBlockMatches, setPendingBlockMatches] = useState<SimulatedMatchResult[]>([]);
  const [displayedBlockMatches, setDisplayedBlockMatches] = useState<SimulatedMatchResult[]>([]);
  const [isSimulatingMatches, setIsSimulatingMatches] = useState<boolean>(false);
  const [activeSimulatingBlock, setActiveSimulatingBlock] = useState<1 | 2 | null>(null);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);
  const [simulatedBlockMonthsPassed, setSimulatedBlockMonthsPassed] = useState<number>(0);

  // Real-time synchronized season matches (for CareerHub and match scoreboard)
  // Preserves accurate chronological order:
  // - 0 matches before any block simulation (empty spot, no placeholders)
  // - During Block 1 simulation: displayedBlockMatches (Match 1 -> 1 match, Match 2 -> 2 matches, etc.)
  // - After Block 1 simulation: block1MatchList
  // - During Block 2 simulation: [...block1MatchList, ...displayedBlockMatches]
  // - After Block 2 simulation: [...block1MatchList, ...block2MatchList]
  const currentSeasonMatches = useMemo<SimulatedMatchResult[]>(() => {
    if (activeSimulatingBlock === 1) {
      return displayedBlockMatches;
    }
    if (activeSimulatingBlock === 2) {
      return [...block1MatchList, ...displayedBlockMatches];
    }
    if (block2MatchList.length > 0) {
      return [...block1MatchList, ...block2MatchList];
    }
    if (block1MatchList.length > 0) {
      return block1MatchList;
    }
    return [];
  }, [activeSimulatingBlock, displayedBlockMatches, block1MatchList, block2MatchList]);

  // Synchronize audio engine with match simulation load to eliminate music stuttering
  useEffect(() => {
    audioManager.setSimulationMode(isSimulatingMatches);
    return () => {
      audioManager.setSimulationMode(false);
    };
  }, [isSimulatingMatches]);

  // Free Agent Hub & Unified Club Offer System
  // Restricted until player is at least 17 years old and contract expired or explicitly unassigned
  const playerAge = player.age || 10;
  const isYouthPlayer = playerAge < 17;
  const isFreeAgent = !isYouthPlayer && Boolean(
    (player as any).isFreeAgent ||
    player.club === 'Free Agent' ||
    player.club === 'Unassigned' ||
    (!player.club && playerAge >= 17) ||
    ((player as any).contractYearsRemaining <= 0 && (accounting?.contractYears || 0) <= 0)
  );
  const [freeAgentPeriod, setFreeAgentPeriod] = useState<'pre_season' | 'mid_season'>('pre_season');
  const [showFreeAgentHubModal, setShowFreeAgentHubModal] = useState<boolean>(false);
  const [showFreeAgentStreetCards, setShowFreeAgentStreetCards] = useState<boolean>(false);

  // Age 16 Youth Academy Farewell & Transfer Offer System State
  const [showAge16FarewellModal, setShowAge16FarewellModal] = useState<boolean>(false);
  const [showAge16OffersModal, setShowAge16OffersModal] = useState<boolean>(false);
  const [showYouthGraduationModal, setShowYouthGraduationModal] = useState<boolean>(false);
  const [age16Offers, setAge16Offers] = useState<Age16TransferOffer[]>([]);
  const [showPremierLeagueModal, setShowPremierLeagueModal] = useState<boolean>(false);
  const [showHotProspectModal, setShowHotProspectModal] = useState<boolean>(false);

  // Bigger Youth Club Adaptation System State
  const [adaptationEventSeason, setAdaptationEventSeason] = useState<1 | 2 | null>(null);
  const [showAdaptationModal, setShowAdaptationModal] = useState<boolean>(false);
  const checkedAdaptationSeasonRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentStage === 'summary' && checkedAdaptationSeasonRef.current !== seasonYear) {
      const pendingSeason = getPendingAdaptationEvent(player, seasonYear);
      if (pendingSeason) {
        checkedAdaptationSeasonRef.current = seasonYear;
        setAdaptationEventSeason(pendingSeason);
        setShowAdaptationModal(true);
      }
    }
  }, [currentStage, player, seasonYear]);

  // Hardcoded authoritative youth academy cutoff: ends automatically once player turns 17 years old
  useEffect(() => {
    if ((player.age || 15) >= 17 && !isProfessionalPlayer(player) && !isFreeAgent) {
      setShowAge16FarewellModal(true);
    }
  }, [player.age, isFreeAgent]);

  const handleConfirmYouthAdaptation = () => {
    setShowAdaptationModal(false);
    const { updatedPlayer, eventSeason } = advanceBiggerYouthClubAdaptation(player, seasonYear);
    onUpdatePlayer(updatedPlayer);
    setAdaptationEventSeason(null);
    if (showToast) {
      if (eventSeason === 1) {
        showToast(
          t('YOUTH_ADAPTATION_STATUS_YEAR_2') ||
            '📈 Adaptation Progress: Stamina penalty reduced to -10, Chemistry cap expanded to 90%!'
        );
      } else {
        showToast(
          t('YOUTH_ADAPTATION_STATUS_ADAPTED') ||
            '✨ Fully Adapted! All Bigger Youth Club penalties removed. Chemistry and Stamina restored to normal!'
        );
      }
    }
  };

  const handleProceedToAge16Offers = () => {
    setShowAge16FarewellModal(false);

    // 1. Hot Prospect Event Check (OVR >= 85, Effective Fame > 200, Age >= 16)
    if (shouldTriggerHotProspectEvent(player, manager)) {
      setShowHotProspectModal(true);
      return;
    }

    // 2. Premier League Wants You Check (OVR 76-84, Effective Fame > 200, Age >= 16)
    if (shouldTriggerPremierLeagueEvent(player, manager)) {
      setShowPremierLeagueModal(true);
      return;
    }

    // 3. Professional Offers (authoritative rules filter applied)
    const offers = generateAge16TransferOffers(player, manager);
    if (offers.length > 0) {
      setAge16Offers(offers);
      setShowAge16OffersModal(true);
    } else {
      // If no direct offers are generated upon graduation at age 17, transition to senior football
      if ((player.age || 16) >= 17) {
        const cleansed = cleanseBiggerYouthClubPenalties(player);
        if (onTriggerYouthLeagueExit) {
          onUpdatePlayer(cleansed);
          onTriggerYouthLeagueExit();
        } else {
          const proFreeAgentPlayer: PlayerConfig = {
            ...cleansed,
            isFreeAgent: true,
            isProfessional: true,
            careerStage: 'FREE_AGENT',
            isYouthCareerActive: false,
            isCareerModeActive: true,
            club: 'Free Agent',
            league: 'Free Agent Hub',
            squadDestination: 'First Team',
            contractYearsRemaining: 0,
          };
          onUpdatePlayer(proFreeAgentPlayer);
          setShowFreeAgentHubModal(true);
        }
      } else {
        setShowAge16OffersModal(true);
      }
    }
  };

  const handleDeclineAge16Offers = () => {
    setShowAge16OffersModal(false);
    setShowPremierLeagueModal(false);
    setShowHotProspectModal(false);

    if ((player.age || 16) >= 17) {
      // Age 17+: Graduated from Youth League. Transition out of Youth League into senior football.
      const cleansed = cleanseBiggerYouthClubPenalties(player);
      if (onTriggerYouthLeagueExit) {
        onUpdatePlayer(cleansed);
        onTriggerYouthLeagueExit();
      } else {
        const proFreeAgentPlayer: PlayerConfig = {
          ...cleansed,
          isFreeAgent: true,
          isProfessional: true,
          careerStage: 'FREE_AGENT',
          isYouthCareerActive: false,
          isCareerModeActive: true,
          club: 'Free Agent',
          league: 'Free Agent Hub',
          squadDestination: 'First Team',
          contractYearsRemaining: 0,
        };
        onUpdatePlayer(proFreeAgentPlayer);
        setShowFreeAgentHubModal(true);
      }
      if (showToast) {
        showToast(
          `🎓 Graduated from Youth League: You declined the initial offers and entered senior free agency to seek open trials.`
        );
      }
    } else {
      // Age 16: Player remains registered with their Youth League club until age 17!
      if (showToast) {
        showToast(
          t('AGE16_OFFERS_STAY_CONFIRM', { club: player.club || 'Youth Club' })
        );
      }
    }
  };

  const handleCompletePremierLeagueTransfer = (offer: PremierLeagueClubOffer) => {
    const youthCountries = [...(player.youthTrainedCountries || [])];
    if (player.clubCountry && !youthCountries.includes(player.clubCountry)) {
      youthCountries.push(player.clubCountry);
    }
    if (offer.club.countryName && !youthCountries.includes(offer.club.countryName)) {
      youthCountries.push(offer.club.countryName);
    }

    const updatedPlayer: PlayerConfig = cleanseBiggerYouthClubPenalties({
      ...player,
      club: offer.club.clubName,
      clubId: offer.club.id,
      league: offer.club.leagueName,
      leagueTier: offer.club.leagueTier,
      clubCountry: offer.club.countryName,
      isProfessional: true,
      isYouthCareerActive: false,
      isCareerModeActive: true,
      squadDestination: 'First Team',
      squadRole: offer.startingRole as any,
      contractYearsRemaining: offer.contractYears,
      isFreeAgent: false,
      youthTrainedCountries: youthCountries,
      eplSigningEventUnlocked: true,
    });

    let updatedAcc = accounting;
    if (accounting && onUpdateAccounting) {
      updatedAcc = {
        ...accounting,
        yearlySalary: offer.yearlySalary,
        contractYears: offer.contractYears,
        totalSavings: (accounting.totalSavings || 0) + offer.signingBonus,
        transferStatus: 'not_listed',
        releaseClause: offer.releaseClause,
      };
      onUpdateAccounting(updatedAcc);
    }

    onUpdatePlayer(updatedPlayer);
    setShowPremierLeagueModal(false);
    setShowYouthGraduationModal(true);
    if (showToast) {
      showToast(
        `🦁 PREMIER LEAGUE BLOCKBUSTER! Welcome to ${offer.club.clubName}! You have stepped onto the English stage!`
      );
    }
  };

  const handleCompleteHotProspectTransfer = (selectedPitch: HotProspectClubPitch) => {
    const youthCountries = [...(player.youthTrainedCountries || [])];
    if (player.clubCountry && !youthCountries.includes(player.clubCountry)) {
      youthCountries.push(player.clubCountry);
    }
    if (selectedPitch.countryName && !youthCountries.includes(selectedPitch.countryName)) {
      youthCountries.push(selectedPitch.countryName);
    }

    const updatedPlayer: PlayerConfig = cleanseBiggerYouthClubPenalties({
      ...player,
      club: selectedPitch.clubName,
      clubId: selectedPitch.id,
      league: selectedPitch.leagueName,
      leagueTier: 1,
      clubCountry: selectedPitch.countryName,
      isProfessional: true,
      isYouthCareerActive: false,
      isCareerModeActive: true,
      squadDestination: 'First Team',
      squadRole: selectedPitch.startingRole as any,
      contractYearsRemaining: selectedPitch.contractYears,
      isFreeAgent: false,
      youthTrainedCountries: youthCountries,
    });

    let updatedAcc = accounting;
    if (accounting && onUpdateAccounting) {
      updatedAcc = {
        ...accounting,
        yearlySalary: selectedPitch.yearlySalary,
        contractYears: selectedPitch.contractYears,
        totalSavings: (accounting.totalSavings || 0) + selectedPitch.signingBonus,
        transferStatus: 'not_listed',
        releaseClause: selectedPitch.releaseClause,
      };
      onUpdateAccounting(updatedAcc);
    }

    onUpdatePlayer(updatedPlayer);
    setShowHotProspectModal(false);
    setShowYouthGraduationModal(true);
    if (showToast) {
      showToast(
        `🌟 CONTINENTAL SUPERSTAR SIGNING! Welcome to ${selectedPitch.clubName}!`
      );
    }
  };

  const handleClosePremierLeagueModal = () => {
    setShowPremierLeagueModal(false);
    onUpdatePlayer({ ...player, eplSigningEventDismissed: true });
    const offers = generateAge16TransferOffers(player, manager);
    setAge16Offers(offers);
    setShowAge16OffersModal(true);
  };

  const handleCloseHotProspectModal = () => {
    setShowHotProspectModal(false);
    const offers = generateAge16TransferOffers(player, manager);
    setAge16Offers(offers);
    setShowAge16OffersModal(true);
  };

  const handleAcceptAge16Offer = (offer: Age16TransferOffer) => {
    const youthCountries = [...(player.youthTrainedCountries || [])];
    if (player.clubCountry && !youthCountries.includes(player.clubCountry)) {
      youthCountries.push(player.clubCountry);
    }
    if (offer.countryName && !youthCountries.includes(offer.countryName)) {
      youthCountries.push(offer.countryName);
    }

    const updatedPlayer: PlayerConfig = cleanseBiggerYouthClubPenalties({
      ...player,
      club: offer.clubName,
      clubId: offer.club.id,
      league: offer.leagueName,
      leagueTier: offer.leagueTier,
      clubCountry: offer.countryName,
      isProfessional: true,
      isYouthCareerActive: false,
      isCareerModeActive: true,
      squadDestination: offer.squadPlacement.initialSquadDestination,
      squadRole: offer.squadPlacement.squadRole,
      contractYearsRemaining: 3,
      isFreeAgent: false,
      youthTrainedCountries: youthCountries,
    });

    let updatedAcc = accounting;
    if (accounting && onUpdateAccounting) {
      updatedAcc = {
        ...accounting,
        yearlySalary: offer.yearlySalary,
        contractYears: 3,
        totalSavings: (accounting.totalSavings || 0) + offer.signingBonus,
        transferStatus: 'not_listed',
        releaseClause: offer.releaseClause,
      };
      onUpdateAccounting(updatedAcc);
    }

    onUpdatePlayer(updatedPlayer);
    setShowAge16OffersModal(false);
    setShowYouthGraduationModal(true);
    if (showToast) {
      showToast(
        `✍️ PROFESSIONAL CONTRACT SIGNED! Welcome to ${offer.clubName}! Placement: ${offer.squadPlacement.squadName} (${offer.squadPlacement.initialSquadDestination})`
      );
    }
  };
  const [freeAgentStreetCards, setFreeAgentStreetCards] = useState<StreetCardInstance[]>([]);
  const [unifiedOffers, setUnifiedOffers] = useState<UnifiedClubOffer[]>([]);
  const [specialOpportunityOffer, setSpecialOpportunityOffer] = useState<UnifiedClubOffer | null>(null);
  const [interruptedRegularOffer, setInterruptedRegularOffer] = useState<UnifiedClubOffer | null>(null);
  const [interruptedSpecialEvent, setInterruptedSpecialEvent] = useState<SpecialClubEvaluation | null>(null);
  const [hasScannedSpecialInterestWindow, setHasScannedSpecialInterestWindow] = useState<string>('');
  const [showUnifiedOffersModal, setShowUnifiedOffersModal] = useState<boolean>(false);
  const [freeAgentTryoutLeaguePicker, setFreeAgentTryoutLeaguePicker] = useState<boolean>(false);
  const [freeAgentDirectivePicker, setFreeAgentDirectivePicker] = useState<boolean>(false);

  // Speed & Pause Control States (DEFAULT = SLOW or Player preference)
  const [simulationSpeed, setSimulationSpeed] = useState<'slow' | 'normal' | 'fast'>(
    (player.simulationSpeed as 'slow' | 'normal' | 'fast') || 'slow'
  );
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const handleUpdateSpeed = (speed: 'slow' | 'normal' | 'fast') => {
    setSimulationSpeed(speed);
    onUpdatePlayer({ ...player, simulationSpeed: speed });
  };

  // Transfer Interruption Handlers (Pauses and resumes simulation automatically)
  const handleAcceptInterruptedRegularOffer = (offer: UnifiedClubOffer) => {
    setInterruptedRegularOffer(null);
    handleAcceptUnifiedOffer(offer);
    setIsPaused(false);
  };

  const handleWaitInterruptedRegularOffer = (offer: UnifiedClubOffer) => {
    setInterruptedRegularOffer(null);
    setUnifiedOffers((prev) => {
      if (prev.some((o) => o.id === offer.id)) return prev;
      return [offer, ...prev].slice(0, 4);
    });
    if (showToast) {
      showToast(`Transfer offer from ${offer.buyerClub.clubName} kept on the table in your Transfer Hub.`);
    }
    setIsPaused(false);
  };

  const handleDeclineInterruptedRegularOffer = (offer: UnifiedClubOffer) => {
    setInterruptedRegularOffer(null);
    setUnifiedOffers((prev) => prev.filter((o) => o.id !== offer.id));
    if (showToast) {
      showToast(`Declined bid from ${offer.buyerClub.clubName}.`);
    }
    setIsPaused(false);
  };

  // Special Sign-In Event Handlers (Pauses and resumes simulation automatically)
  const handleReceiveSpecialProposal = (evaluation: SpecialClubEvaluation) => {
    const converted = convertSpecialEvaluationToUnifiedOffer(evaluation, player as PlayerCardData, accounting, manager);
    setSpecialOpportunityOffer(converted);
    setInterruptedSpecialEvent(null);
    if (showToast) {
      showToast(`🌟 ${evaluation.config.name} contract opportunity registered under SPECIAL OPPORTUNITY in Transfer Hub!`);
    }
    setIsPaused(false);
  };

  const handleWaitSpecialProposal = (evaluation: SpecialClubEvaluation) => {
    const converted = convertSpecialEvaluationToUnifiedOffer(evaluation, player as PlayerCardData, accounting, manager);
    setSpecialOpportunityOffer(converted);
    setInterruptedSpecialEvent(null);
    if (showToast) {
      showToast(`🌟 ${evaluation.config.name} opportunity kept active in Transfer Hub.`);
    }
    setIsPaused(false);
  };

  const handleDeclineSpecialProposal = (evaluation: SpecialClubEvaluation) => {
    setInterruptedSpecialEvent(null);
    recordSpecialClubExplicitRejection(player as PlayerCardData, evaluation.config.id);
    if (showToast) {
      showToast(`Declined special approach from ${evaluation.config.name}.`);
    }
    setIsPaused(false);
  };

  const currentSeasonWorldAwards = useMemo(() => {
    const b1Rating = typeof block1Stats?.avgRating === 'number' && !isNaN(block1Stats.avgRating) ? block1Stats.avgRating : 6.5;
    const b2Rating = typeof block2Stats?.avgRating === 'number' && !isNaN(block2Stats.avgRating) ? block2Stats.avgRating : 6.5;
    const gPlayed = (block1Stats?.gamesPlayed || 0) + (block2Stats?.gamesPlayed || 0);
    const goals = (block1Stats?.goals || 0) + (block2Stats?.goals || 0);
    const assists = (block1Stats?.assists || 0) + (block2Stats?.assists || 0);
    const avgR = parseFloat(((b1Rating + b2Rating) / 2).toFixed(1)) || 6.5;

    return calculateWorldIndividualAwards(
      player,
      {
        goals,
        assists,
        matches: gPlayed,
        avgRating: avgR,
      },
      seasonYear
    );
  }, [player, block1Stats, block2Stats, seasonYear]);

  // Stateful Simulation Stepper Hook
  React.useEffect(() => {
    // If waiting for injury acknowledgement, we pause advancing match steps until modal is acknowledged
    const isWaitingForInjuryModal = Boolean(player.isInjured && player.hasSeenInjuryModal === false);
    if (!isSimulatingMatches || isPaused || activeSimulatingBlock === null || isWaitingForInjuryModal) return;

    if (displayedBlockMatches.length >= pendingBlockMatches.length) {
      if (pendingBlockMatches.length > 0) {
        setIsSimulatingMatches(false);
        setSimulationComplete(true);

        if (activeSimulatingBlock === 2) {
          // Calculate final totals and standings for Block 2
          const b1Rating = typeof block1Stats?.avgRating === 'number' && !isNaN(block1Stats.avgRating) ? block1Stats.avgRating : 6.5;
          const b2Rating = typeof block2Stats?.avgRating === 'number' && !isNaN(block2Stats.avgRating) ? block2Stats.avgRating : 6.5;
          const totalStats: YouthSeasonStats = {
            gamesPlayed: (block1Stats?.gamesPlayed || 0) + (block2Stats?.gamesPlayed || 0),
            goals: (block1Stats?.goals || 0) + (block2Stats?.goals || 0),
            assists: (block1Stats?.assists || 0) + (block2Stats?.assists || 0),
            avgRating: parseFloat(((b1Rating + b2Rating) / 2).toFixed(1)) || 6.5,
            cleanSheets: (block1Stats?.cleanSheets || 0) + (block2Stats?.cleanSheets || 0),
            yellowCards: (block1Stats?.yellowCards || 0) + (block2Stats?.yellowCards || 0),
            redCards: (block1Stats?.redCards || 0) + (block2Stats?.redCards || 0),
            injuryMatchesMissed: (block1Stats?.injuryMatchesMissed || 0) + (block2Stats?.injuryMatchesMissed || 0),
          };

          const awards = calculateSeasonAwards(totalStats);
          setSeasonAwards(awards);

          const news = generateNewspaperArticles(player, totalStats, awards, category);
          setNewspaper(news);

          if (isProfessionalPlayer(player)) {
            const proSim = simulateFullProfessionalLeague(player, totalStats, getCareerLeagueDatabase());
            setYouthStandings(proSim.standings);
            setPlayerStanding(proSim.playerTeamStanding);
            setIsQualifiedForIntCup(false);
            setYouthLeagueName(proSim.leagueName);
            setNonQualifiedCupSummary(null);
            setSisterDivisionStandings(proSim.sisterDivisionStandings || null);
            setSisterDivisionName(proSim.sisterDivisionName || null);
            setFirstTeamStandings(proSim.firstTeamStandings || null);
            setFirstTeamLeagueName(proSim.firstTeamLeagueName || null);
            setPlayoffPressureNote(proSim.playoffPressureNote || null);
            setRelegationSimData({
              promotedTeamIds: proSim.promotedTeamIds || [],
              relegatedTeamIds: proSim.relegatedTeamIds || [],
            });
          } else {
            const simulatedStandings = simulateFullYouthLeagueStandings(player, totalStats);
            setYouthStandings(simulatedStandings.standings);
            setPlayerStanding(simulatedStandings.playerTeamStanding);
            setIsQualifiedForIntCup(simulatedStandings.playerTeamQualified);
            setYouthLeagueName(simulatedStandings.leagueName);
            setSisterDivisionStandings(null);
            setSisterDivisionName(null);
            setFirstTeamStandings(null);
            setFirstTeamLeagueName(null);
            setPlayoffPressureNote(null);

            if (!simulatedStandings.playerTeamQualified) {
              const summary = generateNonQualifiedCupChampion(player);
              setNonQualifiedCupSummary(summary);
            } else {
              setNonQualifiedCupSummary(null);
            }
          }

          if (awards.totalFameGained > 0) {
            const effFame = calculateFameGainWithPerks(awards.totalFameGained, player);
            onUpdatePlayer({
              ...player,
              fame: (player.fame || 0) + effFame,
            });
          }
        }
      }
      return;
    }

    const delayMs = simulationSpeed === 'slow' ? 600 : simulationSpeed === 'normal' ? 300 : 100;

    const timer = setTimeout(() => {
      const nextMatch = pendingBlockMatches[displayedBlockMatches.length];
      if (nextMatch) {
        // ACTIVE KEY MATCH SYSTEM: Check if this match qualifies as an interactive Key Match
        const playMode = player.keyMatchPlayMode || 'decisive';
        const isModeKeyMatch = isKeyMatchForPlayer(
          nextMatch.importanceCategory || 'REGULAR',
          playMode
        );

        const playerStatus = nextMatch.playerStatus;
        const playerDoesNotPlay =
          player.isInjured ||
          nextMatch.isInjured ||
          nextMatch.isSuspended ||
          playerStatus === 'suspended' ||
          playerStatus === 'benched' ||
          playerStatus === 'bench' ||
          playerStatus === 'not_called' ||
          (playerStatus as string) === 'sub_did_not_enter' ||
          (nextMatch.minutesPlayed !== undefined && nextMatch.minutesPlayed <= 0);

        const isEligible = isModeKeyMatch && !playerDoesNotPlay;

        if (isEligible && !blockKeyMatchModalConfig) {
          // PAUSE THE SIMULATION BEFORE PLAYING THE KEY MATCH
          setIsPaused(true);
          setPendingBlockKeyMatch(nextMatch);
          setBlockKeyMatchModalConfig({
            isOpen: true,
            match: nextMatch,
          });
          return;
        }

        setDisplayedBlockMatches((prev) => [...prev, nextMatch]);

        // Authoritative progressive penalty months discounting and chemistry updates
        const totalMatchesInBlock = pendingBlockMatches.length || 9;
        const completedMatchCount = displayedBlockMatches.length + 1;

        // Progressive penalty months discounting across the 6-month block
        const targetMonthsElapsed = Math.min(6, Math.floor((completedMatchCount / totalMatchesInBlock) * 6));
        const newMonthsToDiscount = Math.max(0, targetMonthsElapsed - simulatedBlockMonthsPassed);

        let activePlayerBase: PlayerConfig = player;
        if (newMonthsToDiscount > 0) {
          activePlayerBase = discountChemistryPenaltyMonths(activePlayerBase, newMonthsToDiscount) as PlayerConfig;
          setSimulatedBlockMonthsPassed(targetMonthsElapsed);
        }

        const currentChem = activePlayerBase.chemistry ?? 50;
        const perMatchChemGain = 50 / totalMatchesInBlock;
        const activeCap = getActiveChemistryCap(
          activePlayerBase.chemistryCeiling,
          activePlayerBase.chemistryCeilingMonthsRemaining,
          activePlayerBase.chemistryCaps
        );
        const maxAllowedChem = activeCap ?? 100;
        const newChem = Math.min(maxAllowedChem, Math.round((currentChem + perMatchChemGain) * 10) / 10);

        const currentTargetMatchday = activeSimulatingBlock === 1
          ? Math.min(19, Math.max(1, Math.round(completedMatchCount * 2)))
          : Math.min(38, Math.max(20, 18 + Math.round(completedMatchCount * 2)));
        const calDate = getCalendarDateForMatchday(currentTargetMatchday, seasonYear);

        // Authoritative National Team updates for this match fixture
        const isNat = Boolean(nextMatch.competitionType === 'national' || nextMatch.isNationalTeamMatch);
        let nationalTeamUpdates: Partial<PlayerConfig> = {};
        if (isNat) {
          const updatedWithNatStats = applyInternationalMatchStatsToPlayer(activePlayerBase as any, nextMatch);
          nationalTeamUpdates = {
            ...updatedWithNatStats,
            isRepresentingNationalTeam: true,
          };
        } else if ((activePlayerBase as any).isRepresentingNationalTeam) {
          nationalTeamUpdates = {
            isRepresentingNationalTeam: false,
          };
        }

        if (nextMatch.isInjured && !player.isInjured) {
          // Player suffered a new injury during this match
          const { updatedPlayer } = processInjuryForPlayer(activePlayerBase);
          // Recalculate remaining matches in block with player marked injured
          const numDisplayedNow = displayedBlockMatches.length + 1;
          const remainingOutput = generateYouthBlockMatches(
            { ...updatedPlayer, fitness: nextMatch.playerFitness ?? updatedPlayer.fitness },
            activeSimulatingBlock,
            true
          );
          const adjustedPending = [
            ...pendingBlockMatches.slice(0, numDisplayedNow),
            ...remainingOutput.matches.slice(numDisplayedNow),
          ];
          setPendingBlockMatches(adjustedPending);

          onUpdatePlayer({
            ...updatedPlayer,
            ...nationalTeamUpdates,
            fitness: nextMatch.playerFitness ?? updatedPlayer.fitness,
            staminaCurrent: nextMatch.playerFitness ?? updatedPlayer.fitness,
            chemistry: newChem,
            calendarDate: calDate,
            hasSeenInjuryModal: false,
          });
        } else if (player.isInjured) {
          // Player was already injured - each matchday advances ~2 weeks of rehab
          const currentWeeks = player.injuryWeeksRemaining ?? 2;
          const newWeeks = Math.max(0, currentWeeks - 2);

          if (newWeeks === 0) {
            // Player automatically recovers!
            const recoveredPlayer: PlayerConfig = {
              ...activePlayerBase,
              ...nationalTeamUpdates,
              isInjured: false,
              healthStatus: 'healthy',
              injuryName: undefined,
              injuryWeeksRemaining: 0,
              fitness: 50,
              staminaCurrent: 50,
              justRecoveredFromInjury: true,
              hasSeenFitToPlayModal: false,
              isPostInjuryProtected: true,
              postInjuryProtectionMonthsRemaining: 1,
              postInjuryProtectionUntilTimestamp: Date.now() + 30 * 24 * 60 * 60 * 1000,
              chemistry: newChem,
              calendarDate: calDate,
            };
            // Pause simulation so player can acknowledge the recovery modal cleanly without spam
            setIsPaused(true);
            // Recalculate remaining matches now that player is recovered
            const numDisplayedNow = displayedBlockMatches.length + 1;
            const remainingOutput = generateYouthBlockMatches(
              recoveredPlayer,
              activeSimulatingBlock,
              true
            );
            const adjustedPending = [
              ...pendingBlockMatches.slice(0, numDisplayedNow),
              ...remainingOutput.matches.slice(numDisplayedNow),
            ];
            setPendingBlockMatches(adjustedPending);
            onUpdatePlayer(recoveredPlayer);
          } else {
            // Still recovering
            const updatedFit = Math.min(100, (player.fitness || 50) + 10);
            onUpdatePlayer({
              ...activePlayerBase,
              ...nationalTeamUpdates,
              injuryWeeksRemaining: newWeeks,
              fitness: updatedFit,
              staminaCurrent: updatedFit,
              chemistry: newChem,
              calendarDate: calDate,
            });
          }
        } else if (nextMatch.playerFitness !== undefined) {
          onUpdatePlayer({
            ...activePlayerBase,
            ...nationalTeamUpdates,
            fitness: nextMatch.playerFitness,
            staminaCurrent: nextMatch.playerFitness,
            chemistry: newChem,
            calendarDate: calDate,
            justRecoveredFromInjury: false,
            hasSeenFitToPlayModal: true,
          });
        } else {
          onUpdatePlayer({
            ...activePlayerBase,
            ...nationalTeamUpdates,
            chemistry: newChem,
            calendarDate: calDate,
          });
        }

        if (nextMatch.competitionType === 'continental' || nextMatch.continentalCompId) {
          const cYear = parseInt(seasonYear.split('/')[0]) || 2026;
          syncContinentalSimulationAfterMatch(activePlayerBase, nextMatch, cYear, onUpdatePlayer);
        }

        // Check for Transfer Window events during active simulation
        const completedCount = displayedBlockMatches.length + 1;
        const isTransferWindowMoment =
          (activeSimulatingBlock === 1 && completedCount <= 4) ||
          (activeSimulatingBlock === 2 && completedCount <= 4);

        if (isTransferWindowMoment && isProfessionalPlayer(activePlayerBase)) {
          // 1. Check for Special Club Interest Event (Arabia, Big 3, Bayern, PSG, Big 6, Hot Prospect, etc.)
          const windowScanKey = `${seasonYear}_B${activeSimulatingBlock}_M${completedCount}`;
          if (
            hasScannedSpecialInterestWindow !== windowScanKey &&
            !specialOpportunityOffer &&
            !interruptedSpecialEvent
          ) {
            setHasScannedSpecialInterestWindow(windowScanKey);
            const activeSpecialInterests = scanActiveSpecialClubInterests(
              activePlayerBase as PlayerCardData
            );
            if (activeSpecialInterests && activeSpecialInterests.length > 0) {
              setIsPaused(true);
              setInterruptedSpecialEvent(activeSpecialInterests[0]);
              return;
            }
          }

          // 2. Check for Proactive Regular Transfer Offer Interruption during transfer window
          if (completedCount === 2 && unifiedOffers.length === 0 && !interruptedRegularOffer) {
            const proactiveOffers = generateProactiveSeasonOffers(
              activePlayerBase,
              accounting,
              manager
            );
            if (proactiveOffers && proactiveOffers.length > 0) {
              const incoming = proactiveOffers[0];
              const rest = proactiveOffers.slice(1, 4);
              setUnifiedOffers(rest);
              setIsPaused(true);
              setInterruptedRegularOffer(incoming);
              return;
            }
          }
        }
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [
    isSimulatingMatches,
    isPaused,
    simulationSpeed,
    displayedBlockMatches,
    pendingBlockMatches,
    activeSimulatingBlock,
    player.isInjured,
    player.hasSeenInjuryModal,
    player.injuryWeeksRemaining,
  ]);

  const recalculatePendingSimulation = (updatedPlayer: PlayerConfig) => {
    if (!activeSimulatingBlock || pendingBlockMatches.length === 0) return;
    const output = generateYouthBlockMatches(updatedPlayer, activeSimulatingBlock, true);
    const numDisplayed = displayedBlockMatches.length;
    const updatedPending = [
      ...pendingBlockMatches.slice(0, numDisplayed),
      ...output.matches.slice(numDisplayed),
    ];
    setPendingBlockMatches(updatedPending);
  };

  const handleRecoverFitnessInYouth = () => {
    const points = player.recoveryPoints || 0;
    if (points <= 0) {
      if (showToast) showToast('❌ No Recovery Points available! Purchase more in the Career Store.');
      return;
    }
    if (player.isInjured) {
      const res = useRecoveryPoint(player);
      if (res.success) {
        onUpdatePlayer(res.updatedPlayer);
        recalculatePendingSimulation(res.updatedPlayer);
        if (showToast) showToast(`🩹 Used 1 Recovery Point to treat injury! (${res.updatedPlayer.injuryWeeksRemaining}w left)`);
      }
      return;
    }
    const currentFit = getFitnessPercentage(player);
    const newFitness = Math.min(100, currentFit + 20);
    const newPoints = points - 1;
    let nextPlayer: PlayerConfig = {
      ...player,
      fitness: newFitness,
      staminaCurrent: newFitness,
      recoveryPoints: newPoints,
    };
    onUpdatePlayer(nextPlayer);
    recalculatePendingSimulation(nextPlayer);
    if (showToast) {
      showToast(`⚡ Restored +20% Fitness! (${newFitness}% • ${newPoints} RP left)`);
    }
  };

  const handleUseSupplementInYouth = () => {
    const supp = player.recoverySupplements || 0;
    if (supp <= 0) return;
    let nextPlayer: PlayerConfig = {
      ...player,
      fitness: 100,
      staminaCurrent: 100,
      recoverySupplements: supp - 1,
    };
    onUpdatePlayer(nextPlayer);
    recalculatePendingSimulation(nextPlayer);
  };

  const handleRestRehabInYouth = () => {
    const currentFit = getFitnessPercentage(player);
    const newFitness = Math.min(100, currentFit + 30);
    let nextPlayer: PlayerConfig = {
      ...player,
      fitness: newFitness,
      staminaCurrent: newFitness,
    };
    onUpdatePlayer(nextPlayer);
    recalculatePendingSimulation(nextPlayer);
  };

  const youthSuggestedCallbacks: SuggestedActionCallbacks = {
    onRecoverFitness: handleRecoverFitnessInYouth,
    onUseRecoverySupplement: handleUseSupplementInYouth,
    onRestRehab: handleRestRehabInYouth,
    onAssignStatPoints: () => {
      if (onOpenDevelopment) onOpenDevelopment();
    },
    onTrain: () => {
      if (onOpenDevelopment) onOpenDevelopment();
    },
  };

  if (!isOpen) return null;

  const category = getCategoryByAge(age);
  const ovr = player.ovr || 60;
  const fame = player.fame || 0;
  const staminaValue = player.stats?.detailed?.stamina || player.stats?.phy || 70;

  // Total season stats combining Block 1 and Block 2
  const cB1Rating = typeof block1Stats?.avgRating === 'number' && !isNaN(block1Stats.avgRating) ? block1Stats.avgRating : 6.5;
  const cB2Rating = typeof block2Stats?.avgRating === 'number' && !isNaN(block2Stats.avgRating) ? block2Stats.avgRating : 6.5;
  const combinedStats: YouthSeasonStats = {
    gamesPlayed: (block1Stats?.gamesPlayed || 0) + (block2Stats?.gamesPlayed || 0),
    minutesPlayed: (block1Stats?.minutesPlayed || 0) + (block2Stats?.minutesPlayed || 0),
    goals: (block1Stats?.goals || 0) + (block2Stats?.goals || 0),
    assists: (block1Stats?.assists || 0) + (block2Stats?.assists || 0),
    avgRating: parseFloat(((cB1Rating + cB2Rating) / 2).toFixed(1)) || 6.5,
    cleanSheets: (block1Stats?.cleanSheets || 0) + (block2Stats?.cleanSheets || 0),
    yellowCards: (block1Stats?.yellowCards || 0) + (block2Stats?.yellowCards || 0),
    redCards: (block1Stats?.redCards || 0) + (block2Stats?.redCards || 0),
    injuryMatchesMissed: (block1Stats?.injuryMatchesMissed || 0) + (block2Stats?.injuryMatchesMissed || 0),
    mvps: (block1Stats?.mvps || 0) + (block2Stats?.mvps || 0),
  };

  const executeBlockStart = (blockType: 'block1' | 'block2', overrideMatches?: SimulatedMatchResult[]) => {
    const isPro = isProfessionalPlayer(player);
    const matchesList = overrideMatches || (blockType === 'block1' ? block1MatchList : block2MatchList);
    const firstMatch = matchesList && matchesList.length > 0 ? matchesList[0] : null;
    const auth = isPro ? resolveAuthoritativeClubContext(player.club || '', getCareerLeagueDatabase()) : null;
    const squadDest = player.squadDestination || ((player.age || 16) <= 16 ? 'U17' : (player.age || 16) <= 18 ? 'U20' : 'First Team');
    const squadSuffix = squadDest === 'First Team' || !isPro ? '' : ` ${squadDest}`;
    const blockMeta = blockType === 'block1' ? flowConfig.firstBlock : flowConfig.secondBlock;

    const compName = isPro
      ? `${auth?.league || player.league || 'First Division'}${squadSuffix} • ${blockMeta.title}`
      : `${youthLeagueName || 'Youth Academy League'} • ${blockMeta.title}`;

    const firstMatchRival = firstMatch
      ? firstMatch.isPlayerHome
        ? firstMatch.awayTeamName
        : firstMatch.homeTeamName
      : 'Opening Opponent';
    const firstMatchRivalOvr = (player.ovr || 65) + 3;

    const compType = detectCompetitionType(compName, isPro ? 'national' : 'youth');
    const effectiveTeamName = isPro
      ? `${player.club || 'Pro Club'}${squadSuffix}`
      : (manager as any)?.clubName || player.club || 'Youth Academy';

    setCompStartModalConfig({
      competitionName: compName,
      category: isPro ? 'national' : 'youth',
      teamName: effectiveTeamName,
      teamOvr: player.ovr || 65,
      firstRivalName: firstMatchRival,
      firstRivalOvr: firstMatchRivalOvr,
      venue: firstMatch?.isPlayerHome ? 'Home Match' : 'Away Match',
      competitionType: compType,
      isPro,
      expectation: calculateTeamExpectation(player.ovr || 65, firstMatchRivalOvr, compType, isPro ? 'national' : 'youth', isPro),
    });
    setPendingBlockStartType(blockType);
  };

  // Stage 1: Play Block 1 with match-by-match visual simulation
  // Europe: Summer Block (August → January)
  // South America: Winter Block (February → June)
  const handleSimulateBlock1 = () => {
    if (isSimulatingMatches) return;
    const output = generateYouthBlockMatches(player, 1, true);
    setBlock1Stats(output.aggregatedStats);
    setBlock1MatchList([]);
    setPendingBlockMatches(output.matches);
    setDisplayedBlockMatches([]);

    const isPro = isProfessionalPlayer(player);
    const cYear = parseInt(seasonYear.split('/')[0]) || 2026;

    // --- INTERNATIONAL QUALIFIERS CALL-UP CHECK (U17, U20, Senior) ---
    const prefConfed: 'UEFA' | 'CONMEBOL' = isSouthAmericanContext(player, getCareerLeagueDatabase()) ? 'CONMEBOL' : 'UEFA';
    const scheduledPreComp = getScheduledInternationalCompetition(
      cYear,
      player.age || 16,
      isPro,
      'pre_season',
      prefConfed
    );

    if (scheduledPreComp && !isInternationalEventCompleted(player, scheduledPreComp.tier, scheduledPreComp.type, cYear)) {
      const evalRes = evaluateNationalTeamCallUp(player as PlayerCardData, scheduledPreComp);
      if (evalRes.isEligible && evalRes.callUp) {
        setIntDestinationStage('block1');
        setActiveIntCallUp(evalRes.callUp);
        return;
      } else {
        // Player NOT called up: skip draw, run complete background qualifiers, and post result to news!
        let qualOutcome = { playerNationQualified: false };
        if (scheduledPreComp.tier === 'U17') {
          qualOutcome = runCompleteU17Qualifiers(cYear, player.nationality);
        } else if (scheduledPreComp.tier === 'U20') {
          qualOutcome = runCompleteU20Qualifiers(cYear, player.nationality);
        }
        let nextPlayer = markInternationalEventCompleted(player, scheduledPreComp.tier, 'qualifier', cYear);
        if (scheduledPreComp.tier === 'U17') nextPlayer.u17Qualified = qualOutcome.playerNationQualified;
        if (scheduledPreComp.tier === 'U20') nextPlayer.u20Qualified = qualOutcome.playerNationQualified;
        onUpdatePlayer(nextPlayer);

        const qualNews: DrawNewsItem = {
          id: `news-qual-${scheduledPreComp.tier}-${cYear}-${Date.now()}`,
          category: 'national',
          competitionId: scheduledPreComp.shortName.toUpperCase(),
          competitionName: scheduledPreComp.competitionName,
          shortName: scheduledPreComp.shortName,
          icon: '🌍',
          badgeText: `${scheduledPreComp.shortName.toUpperCase()} QUALIFIERS`,
          isPlayerInvolved: false,
          headline: `${scheduledPreComp.competitionName} Concluded`,
          description: `${player.nationality?.name || 'National team'} qualifying stage has concluded. Selection update: ${evalRes.reason || 'Player was not included in the final squad roster'}.`,
          flagOrEmblem: `https://flagcdn.com/w80/${(player.nationality?.iso || 'gb-eng').toLowerCase()}.png`,
        };
        setCustomDrawNewsItems((prev) => [qualNews, ...prev]);
      }
    }

    // European flow: European competition draws (UCL, UEL, Conference League) occur before Summer Block
    if (isPro && flowConfig.hasPreseasonDraw && !seenContinentalDrawYears.includes(cYear)) {
      setSeenContinentalDrawYears((prev) => [...prev, cYear]);
      const { tournamentState, playerClubInTournament } = getOrInitContinentalStateForSeason(player, cYear);
      if (tournamentState && playerClubInTournament) {
        setPendingContinentalDraw(tournamentState);
        setShowContinentalDrawModal(true);
        setPendingBlockAfterDraw('block1');
        return;
      }
      // If player's club is not qualified: do NOT force into modal! They see the news piece on the dashboard, and can click it anytime.
    }

    // National Team flow: Qualifiers or Tournament draw ceremony if player was called up & accepted
    if ((player as any).activeInternationalDuty) {
      const natDuty = checkSeasonInternationalDuty(player, 1, cYear);
      if (natDuty.hasDuty && natDuty.isDrawRequired && natDuty.drawState) {
        setPendingNationalTeamDraw(natDuty.drawState);
        setShowNationalTeamDrawModal(true);
        setPendingBlockAfterDraw('block1');
        return;
      }
    }

    let finalBlock1Matches = output.matches;
    const duty1 = checkSeasonInternationalDuty(player, 1, cYear);
    if (duty1.hasDuty && !player.declinedInternationalCallUps?.[duty1.tier]?.includes((player.nationality?.code || '').toUpperCase())) {
      const merged = injectNationalTeamMatchesIntoBlock(output.matches, player, 1, cYear);
      finalBlock1Matches = merged.unifiedMatches;
    }
    setPendingBlockMatches(finalBlock1Matches);
    executeBlockStart('block1', finalBlock1Matches);
  };

  const handleFinishBlock1Simulation = () => {
    const isPro = isProfessionalPlayer(player);
    const cYear = parseInt(seasonYear.split('/')[0]) || 2026;

    // --- INTERNATIONAL TOURNAMENT MID-SEASON CALL-UP CHECK (U17, U20, Senior) ---
    const prefConfed: 'UEFA' | 'CONMEBOL' = isSouthAmericanContext(player, getCareerLeagueDatabase()) ? 'CONMEBOL' : 'UEFA';
    const scheduledMidComp = getScheduledInternationalCompetition(
      cYear,
      player.age || 16,
      isPro,
      'mid_season',
      prefConfed
    );

    if (scheduledMidComp && !isInternationalEventCompleted(player, scheduledMidComp.tier, scheduledMidComp.type, cYear)) {
      const evalRes = evaluateNationalTeamCallUp(player as PlayerCardData, scheduledMidComp);
      if (evalRes.isEligible && evalRes.callUp) {
        setIntDestinationStage('block2');
        setActiveIntCallUp(evalRes.callUp);
        return;
      } else {
        // Player NOT called up: skip draw & tournament simulation, run background simulation, post result in news & season summary!
        const bgResult = simulateBackgroundNationalTournament(
          scheduledMidComp.competitionName,
          cYear,
          player.nationality?.code || 'ENG'
        );
        setLatestIntTournamentResult(bgResult);
        const newsItem = createNationalTournamentResultNews(bgResult);
        setCustomDrawNewsItems((prev) => [newsItem, ...prev]);

        let nextPlayer = markInternationalEventCompleted(player, scheduledMidComp.tier, 'tournament', cYear);
        const historyItem = {
          seasonYear: cYear,
          competitionName: scheduledMidComp.competitionName,
          shortName: scheduledMidComp.shortName,
          tier: scheduledMidComp.tier,
          nationName: player.nationality?.name || 'Unknown',
          nationCode: player.nationality?.code || 'UNK',
          playerFinishStage: 'Not Called Up (Did Not Participate)',
          championNation: bgResult.champion.name,
          runnerUpNation: bgResult.runnerUp.name,
          thirdPlaceNation: bgResult.thirdPlace.name,
          playerGoals: 0,
          playerAssists: 0,
          playerCaps: 0,
          avgRating: 0,
        };
        if (scheduledMidComp.tier === 'U17') {
          nextPlayer.u17TournamentHistory = [...(nextPlayer.u17TournamentHistory || []), historyItem];
        } else if (scheduledMidComp.tier === 'U20') {
          nextPlayer.u20TournamentHistory = [...(nextPlayer.u20TournamentHistory || []), historyItem];
        } else {
          nextPlayer.seniorTournamentHistory = [...(nextPlayer.seniorTournamentHistory || []), historyItem];
        }
        onUpdatePlayer(nextPlayer);
      }
    }

    if (isPro) {
      setCareerCardDrawType('mid_season');
      setIsCareerCardModalOpen(true);

      // Generate proactive mid-season club offers and renewal possibilities
      const midSeasonOffers = generateProactiveSeasonOffers(player, accounting, manager);
      if (midSeasonOffers.length > 0) {
        setUnifiedOffers(midSeasonOffers);
        const hasSpecialMidOffer = midSeasonOffers.some((o) => o.isSaudiMegaOffer || o.id.startsWith('special_offer_'));
        if (hasSpecialMidOffer) {
          setShowUnifiedOffersModal(true);
          if (showToast) {
            showToast('👑 ELITE TRANSFER BID: Superpower clubs (Big 3, PSG, Big 6, or Saudi) have presented official bids! Check Transfer Offers.');
          }
        }
      }

      // South American flow: Continental draws (Libertadores / Sudamericana) occur at the July mid-season stop
      if (flowConfig.hasMidseasonDraw && !seenContinentalDrawYears.includes(cYear)) {
        setSeenContinentalDrawYears((prev) => [...prev, cYear]);
        const { tournamentState, playerClubInTournament } = getOrInitContinentalStateForSeason(player, cYear);
        if (tournamentState && playerClubInTournament) {
          setPendingContinentalDraw(tournamentState);
          setShowContinentalDrawModal(true);
        } else {
          setShowContinentalDrawsSummaryModal(true);
        }
      }
    } else {
      const hasManager = Boolean(manager?.name || (player as any).managerState?.name || (player as any).managerName);
      const cards = drawThreeYouthCards(hasManager);
      setYouthCardModalConfig({
        isOpen: true,
        seasonLabel: flowConfig.region === 'south_america' ? 'Mid-Season Stop (July)' : 'Mid-Season Draw (Dec-Jan)',
        cards,
        drawType: 'mid_season',
      });
    }

    const finishedB1 = displayedBlockMatches.length > 0 ? displayedBlockMatches : pendingBlockMatches;
    setBlock1MatchList(finishedB1);
    const lastMatch = finishedB1[finishedB1.length - 1];
    // Complete remaining months discounting for the 6-month block
    const remainingMonthsB1 = Math.max(0, 6 - simulatedBlockMonthsPassed);
    let playerAfterDiscountB1 = player;
    if (remainingMonthsB1 > 0) {
      playerAfterDiscountB1 = discountChemistryPenaltyMonths(playerAfterDiscountB1, remainingMonthsB1) as PlayerConfig;
    }
    // Passive chemistry +10/month = +50 points over block (max 100 or active cap)
    const currentChem = typeof playerAfterDiscountB1.chemistry === 'number' && !isNaN(playerAfterDiscountB1.chemistry) ? playerAfterDiscountB1.chemistry : 50;
    const activeCap = getActiveChemistryCap(playerAfterDiscountB1.chemistryCeiling, playerAfterDiscountB1.chemistryCeilingMonthsRemaining, playerAfterDiscountB1.chemistryCaps);
    const newChem = Math.min(activeCap ?? 100, currentChem + 50);

    onUpdatePlayer({
      ...playerAfterDiscountB1,
      chemistry: newChem,
      lastSimulatedMatches: finishedB1.slice(-5),
      ...(lastMatch?.playerFitness !== undefined
        ? { fitness: lastMatch.playerFitness, staminaCurrent: lastMatch.playerFitness }
        : {}),
    });

    // Advance authoritative world simulation to Matchday 19 (Mid-season) with all Block 1 matches synced
    syncCareerBlockMatchesToWorldSimulation(player, finishedB1, 19, seasonYear);

    // Record block 1 matches to persistent yearly statistics database
    finishedB1.forEach((m) => {
      recordMatchToYearlyDatabase(seasonYear, player, m);
    });

    setActiveSimulatingBlock(null);
    setCurrentStage('block2');
  };

  // Youth League Card Selection Handler (1 selected, 2 discarded)
  const handleSelectYouthCard = (card: YouthCardInstance) => {
    if (!youthCardModalConfig) return;
    const isPreSeason = youthCardModalConfig.drawType === 'pre_season';
    const label = isPreSeason ? 'Pre-Season Draw (Jul-Aug)' : 'Mid-Season Draw (Dec-Jan)';

    setYouthCardModalConfig(null);

    const applied = applyYouthCardToPlayer(player, card, label);
    onUpdatePlayer(applied.updatedPlayer);

    if (isPreSeason) {
      // Proceed to Preseason Training
      setCurrentStage('training');
    } else {
      // Proceed to Block 2
      setCurrentStage('block2');
    }
  };

  // Helper to execute pre-season draw flow
  const executePreseasonDraw = (activePlayer: PlayerConfig = player) => {
    const isPro = isProfessionalPlayer(activePlayer);
    if (isPro) {
      setCareerCardDrawType('pre_season');
      setIsCareerCardModalOpen(true);
    } else {
      const hasManager = Boolean(manager?.name || (activePlayer as any).managerState?.name || (activePlayer as any).managerName);
      const cards = drawThreeYouthCards(hasManager);
      setYouthCardModalConfig({
        isOpen: true,
        seasonLabel: 'Pre-Season Draw (Jul-Aug)',
        cards,
        drawType: 'pre_season',
      });
    }
  };

  // Helper to handle Pre-Season Agent roll if player has no agent
  const evaluatePreseasonAgentRoll = (activePlayer: PlayerConfig = player): boolean => {
    const isRepresented = hasActiveAgent(activePlayer, manager);

    if (!isRepresented) {
      const offerRate = calculatePreseasonManagerOfferRate(activePlayer);
      if (offerRate.rollSuccess) {
        // Exactly ONE Agent Card drawn for Pre-Season recruitment
        const singleOffer = generateSinglePreseasonManagerOffer(activePlayer);
        setPreseasonAgentOffers([singleOffer]);
        setPreseasonAgentOffer(singleOffer);
        setShowAgentOfferModal(true);
        return true;
      }
    }
    return false;
  };

  // FREE AGENT INTERACTIVE HANDLERS (Time passes in 6-month steps without fixtures)
  const handleFreeAgentPlayStreets = () => {
    const cards = drawThreeStreetCards(player.age || 18, Boolean(manager?.name));
    setFreeAgentStreetCards(cards);
    setShowFreeAgentStreetCards(true);
  };

  const handleSelectFreeAgentStreetCard = (card: StreetCardInstance) => {
    setShowFreeAgentStreetCards(false);
    const applied = applyStreetCardToPlayer(player, card);
    
    if (freeAgentPeriod === 'pre_season') {
      setFreeAgentPeriod('mid_season');
      onUpdatePlayer({
        ...applied.updatedPlayer,
        fitness: Math.min(100, (applied.updatedPlayer.fitness || 80) + 10),
      });
      if (showToast) {
        showToast('⚽ Street Session Completed! 6 months passed: Advanced from July to Mid-Season (January).');
      }
    } else {
      setFreeAgentPeriod('pre_season');
      const newAge = (player.age || 18) + 1;
      const growth = calculateAnnualPhysicalGrowth(applied.updatedPlayer);
      const updated = {
        ...applied.updatedPlayer,
        age: newAge,
        heightCm: growth.newHeight,
        weightKg: growth.newWeight,
        fitness: 100,
      };
      onUpdatePlayer(updated);
      if (showToast) {
        showToast(`⚽ Street Session Completed! 6 months passed: Advanced from January to July (Age ${newAge}).`);
      }
    }
  };

  const handleFreeAgentRunTryout = (league: TryoutLeagueOption) => {
    setFreeAgentTryoutLeaguePicker(false);
    const evalResult = runLeagueTryoutEvaluation(player, league.leagueName, manager);
    if (evalResult.isSuccess && evalResult.offers.length > 0) {
      setUnifiedOffers(evalResult.offers);
      setShowUnifiedOffersModal(true);
      if (showToast) {
        showToast(`🎯 Tryout Success in ${league.leagueName}! Received ${evalResult.offers.length} contract offer(s)!`);
      }
    } else {
      if (freeAgentPeriod === 'pre_season') {
        setFreeAgentPeriod('mid_season');
      } else {
        setFreeAgentPeriod('pre_season');
        const newAge = (player.age || 18) + 1;
        onUpdatePlayer({ ...player, age: newAge });
      }
      if (showToast) {
        showToast(evalResult.message || 'Tryout unsuccessful this session. 6 months passed while training.');
      }
    }
  };

  const handleFreeAgentDirective = (directive: AgentSearchDirective) => {
    setFreeAgentDirectivePicker(false);
    const offers = generateCuratedClubOffers(player, directive, manager, accounting, 5);
    if (offers.length > 0) {
      setUnifiedOffers(offers);
      setShowUnifiedOffersModal(true);
    } else {
      if (showToast) {
        showToast('❌ Agent could not locate matching offers currently. Try another directive or league tryout.');
      }
    }
  };

  const handleAcceptUnifiedOffer = (offer: UnifiedClubOffer) => {
    setShowUnifiedOffersModal(false);
    setShowFreeAgentHubModal(false);

    const bonus = offer.signingBonus || 0;
    const playerCut = offer.playerTransferFeeCutAmount || 0;
    const totalFinancialBonus = bonus + playerCut;
    const isRenewal = offer.isRenewalOffer || offer.transferType === 'club_renewal' || offer.buyerClub.clubName === player.club;

    const updatedPlayer: PlayerConfig = isRenewal
      ? {
          ...player,
          contractYearsRemaining: offer.contractYears,
          squadDestination: offer.proposedSquad || player.squadDestination || 'First Team',
          squadRole: offer.expectedRole || player.squadRole || 'Key Player',
          releaseClause: offer.releaseClause,
          isFreeAgent: false,
          chemistry: Math.min(
            getActiveChemistryCap(player.chemistryCeiling, player.chemistryCeilingMonthsRemaining, player.chemistryCaps) ?? 100,
            (player.chemistry || 50) + 15
          ),
          requestedTransfer: false,
        }
      : rebuildPlayerCompetitiveContextOnTransfer(
          player,
          offer.buyerClub.clubName,
          {
            contractYearsRemaining: offer.contractYears,
            squadDestination: offer.proposedSquad,
            squadRole: offer.expectedRole,
            releaseClause: offer.releaseClause,
            isFreeAgent: false,
            chemistry: 50,
            requestedTransfer: false,
          } as any
        );

    if (accounting && onUpdateAccounting) {
      const updatedAccounting: AccountingState = {
        ...accounting,
        contractYears: offer.contractYears,
        yearlySalary: offer.yearlySalary,
        releaseClause: offer.releaseClause,
        transferStatus: 'not_listed',
        totalSavings: (accounting.totalSavings || 0) + totalFinancialBonus,
      };
      onUpdateAccounting(updatedAccounting);
    }

    onUpdatePlayer(updatedPlayer);

    if (showToast) {
      if (isRenewal) {
        showToast(
          `✍️ CONTRACT RENEWED with ${player.club}! Extended for ${offer.contractYears} years at €${offer.yearlySalary.toLocaleString()}/yr (+€${totalFinancialBonus.toLocaleString()} Loyalty Bonus).`
        );
      } else {
        showToast(
          `✍️ CONTRACT SIGNED with ${offer.buyerClub.clubName}! +€${totalFinancialBonus.toLocaleString()} Signing Bonus credited to savings!`
        );
      }
    }

    if (freeAgentPeriod === 'mid_season') {
      setCurrentStage('block2');
    } else {
      setCurrentStage('hub');
    }
  };

  const handleAcceptAgentRecruitmentOffer = (selectedAgent: ManagerState) => {
    setShowAgentOfferModal(false);
    setPreseasonAgentOffer(null);
    setPreseasonAgentOffers([]);
    if (onUpdateManager) onUpdateManager(selectedAgent);
    const updatedPlayer: PlayerConfig = {
      ...player,
      managerState: selectedAgent,
      managerName: selectedAgent.name,
    };
    onUpdatePlayer(updatedPlayer);
    if (showToast) {
      showToast(t("🤝 Signed with {agentName} ({agency})!", {
        agentName: selectedAgent.name,
        agency: selectedAgent.agencyName || t("Agency"),
      }));
    }
    executePreseasonDraw(updatedPlayer);
  };

  const handleDeclineAgentRecruitmentOffer = () => {
    setShowAgentOfferModal(false);
    setPreseasonAgentOffer(null);
    setPreseasonAgentOffers([]);
    if (showToast) {
      showToast(t("Agent pitch declined. Continuing as Self-Managed."));
    }
    executePreseasonDraw(player);
  };

  // Helper to roll the once-per-career 25% Pre-Season Crossroads event
  const evaluatePreseasonCrossroadsRoll = (activePlayer: PlayerConfig = player): boolean => {
    const isCompleted = Boolean(
      (activePlayer as any).preseasonEventCompleted ||
      (activePlayer as any).extendedPreseasonEventDone ||
      (activePlayer as any).preseasonCrossroadsCompleted
    );
    if (!isCompleted) {
      const roll = Math.random();
      if (roll < 0.25) {
        setShowPreseasonCrossroadsModal(true);
        return true;
      }
    }
    return false;
  };

  const handlePreseasonCrossroadsChoice = (choice: 'sponsorship' | 'early_training' | 'vacation') => {
    setShowPreseasonCrossroadsModal(false);
    let updatedPlayer: PlayerConfig = {
      ...player,
      preseasonEventCompleted: true,
      extendedPreseasonEventDone: true,
    };
    const isPro = isProfessionalPlayer(player);
    const annualSalary = accounting?.yearlySalary || (isPro ? 45000 : 15000);
    const sponsorshipAmount = Math.max(10000, Math.round(annualSalary * 0.20));

    if (choice === 'sponsorship') {
      if (accounting && onUpdateAccounting) {
        onUpdateAccounting({
          ...accounting,
          totalSavings: (accounting.totalSavings || 0) + sponsorshipAmount,
        });
      }
      if (showToast) {
        showToast(t("💰 Summer Sponsorship Signed! +€{amount} added to your career savings!", {
          amount: sponsorshipAmount.toLocaleString(),
        }));
      }
    } else if (choice === 'early_training') {
      const updatedPerkIds = Array.from(new Set([...(updatedPlayer.activePerkIds || []), 'extended_pre_season']));
      const updatedPerks = [...(updatedPlayer.perks || [])];
      const perkDef = CAREER_PERKS_REGISTRY.find((p) => p.id === 'extended_pre_season');
      if (perkDef && !updatedPerks.some((p: any) => (typeof p === 'string' ? p : p.id) === 'extended_pre_season')) {
        updatedPerks.push(perkDef);
      }
      updatedPlayer = {
        ...updatedPlayer,
        activePerkIds: updatedPerkIds,
        perks: updatedPerks,
      };
      if (showToast) {
        showToast(t("⚡ Arrived early to camp! 'Extended Pre-Season' perk unlocked (+5 points per focus)!"));
      }
    } else if (choice === 'vacation') {
      const updatedPerkIds = Array.from(new Set([...(updatedPlayer.activePerkIds || []), 'relaxing_vacations', 'vacation_rested']));
      const updatedPerks = [...(updatedPlayer.perks || [])];
      const perkDef = CAREER_PERKS_REGISTRY.find((p) => p.id === 'relaxing_vacations') || CAREER_PERKS_REGISTRY.find((p) => p.id === 'vacation_rested');
      if (perkDef && !updatedPerks.some((p: any) => (typeof p === 'string' ? p : p.id) === 'relaxing_vacations')) {
        updatedPerks.push(perkDef);
      }
      // Apply initial 10 less stamina during first 2 months of the season
      const currentStamina = updatedPlayer.fitness ?? 100;
      const initialSeasonStamina = Math.max(30, currentStamina - 10);

      updatedPlayer = {
        ...updatedPlayer,
        activePerkIds: updatedPerkIds,
        perks: updatedPerks,
        fitness: initialSeasonStamina,
        relaxingVacationActive: true,
      };
      if (showToast) {
        showToast(t("🏖️ Relaxed & Rested! 'Relaxing Vacations' perk unlocked (-10% injury risk, -10 stamina during the first 2 months)!"));
      }
    }

    onUpdatePlayer(updatedPlayer);

    // Continue pre-season sequence (Agent Pitch -> Card Draw)
    const triggered = evaluatePreseasonAgentRoll(updatedPlayer);
    if (!triggered) {
      executePreseasonDraw(updatedPlayer);
    }
  };

  const continuePreseasonDrawSequence = (p: PlayerConfig) => {
    // 1. 10% Chance for Standard Player Nickname Event if Fame >= 10 (once per career)
    if (rollStandardNicknameEvent(p)) {
      setFeatNicknameForModal(null);
      setIsPreseasonDrawPending(true);
      setShowNicknameModal(true);
      return;
    }

    // 2. 25% Chance for Pre-Season Crossroads Event (once per career)
    if (evaluatePreseasonCrossroadsRoll(p)) {
      return;
    }

    // 3. Roll Pre-Season Agent recruitment if player has no agent
    const triggeredAgentOffer = evaluatePreseasonAgentRoll(p);
    if (triggeredAgentOffer) return;

    // 4. Execute standard card draw
    executePreseasonDraw(p);
  };

  // Pre-Season Youth / Pro League Card Draw Trigger (Jul–Aug)
  const handleStartPreseasonDraw = () => {
    const isPro = isProfessionalPlayer(player) || (player.age || 10) >= 16;
    const squadDest = player.squadDestination || (isPro ? ((player.age || 16) <= 16 ? 'U17' : (player.age || 16) <= 18 ? 'U20' : 'First Team') : 'Youth');

    const auth = isPro ? resolveAuthoritativeClubContext(player.club || '', getCareerLeagueDatabase()) : null;
    const isBrazilianClub =
      auth?.countryCode === 'BRA' ||
      player.clubCountry === 'BRA' ||
      player.countryCode === 'BRA' ||
      auth?.leagueId?.includes('brazil') ||
      (auth?.league && auth.league.toLowerCase().includes('brazil'));

    // Brazilian clubs do NOT play preseason friendlies. Their State Championship matches function as the opening competitive phase of the season.
    if (isPro && squadDest === 'First Team' && !hasPlayedPreseasonFriendlyCup && !isBrazilianClub) {
      setShowPreseasonFriendlyModal(true);
      return;
    }

    continuePreseasonDrawSequence(player);
  };

  // Stage 3: Play Block 2 with match-by-match visual simulation
  // Europe: Winter Block (February → June)
  // South America: Summer Block (August → December)
  const handleSimulateBlock2 = () => {
    if (isSimulatingMatches) return;
    const output = generateYouthBlockMatches(player, 2, true);
    setBlock2Stats(output.aggregatedStats);
    setBlock2MatchList([]);
    setPendingBlockMatches(output.matches);
    setDisplayedBlockMatches([]);

    const cYear = parseInt(seasonYear.split('/')[0]) || 2026;
    if ((player as any).activeInternationalDuty) {
      const natDuty = checkSeasonInternationalDuty(player, 2, cYear);
      if (natDuty.hasDuty && natDuty.isDrawRequired && natDuty.drawState) {
        setPendingNationalTeamDraw(natDuty.drawState);
        setShowNationalTeamDrawModal(true);
        setPendingBlockAfterDraw('block2');
        return;
      }
    }

    let finalBlock2Matches = output.matches;
    const duty2 = checkSeasonInternationalDuty(player, 2, cYear);
    if (duty2.hasDuty && !player.declinedInternationalCallUps?.[duty2.tier]?.includes((player.nationality?.code || '').toUpperCase())) {
      const merged = injectNationalTeamMatchesIntoBlock(output.matches, player, 2, cYear);
      finalBlock2Matches = merged.unifiedMatches;
    }
    setPendingBlockMatches(finalBlock2Matches);
    executeBlockStart('block2', finalBlock2Matches);
  };

  // Test Mode Action: Instantly skip season and generate all match results to reach Season Summary
  const handleSkipSeason = () => {
    // 1. Generate or retrieve Block 1 matches and stats
    let b1Matches = block1MatchList;
    let b1Stats = block1Stats;
    if (!b1Stats || b1Matches.length === 0) {
      const b1Output = generateYouthBlockMatches(player, 1, true);
      b1Stats = b1Output.aggregatedStats;
      b1Matches = b1Output.matches;
    }

    // 2. Generate or retrieve Block 2 matches and stats
    let b2Matches = block2MatchList;
    let b2Stats = block2Stats;
    if (!b2Stats || b2Matches.length === 0) {
      const b2Output = generateYouthBlockMatches(player, 2, true);
      b2Stats = b2Output.aggregatedStats;
      b2Matches = b2Output.matches;
    }

    // 3. Compute combined total season stats
    const b1Rating = typeof b1Stats.avgRating === 'number' && !isNaN(b1Stats.avgRating) ? b1Stats.avgRating : 6.5;
    const b2Rating = typeof b2Stats.avgRating === 'number' && !isNaN(b2Stats.avgRating) ? b2Stats.avgRating : 6.5;
    const totalStats: YouthSeasonStats = {
      gamesPlayed: (b1Stats.gamesPlayed || 0) + (b2Stats.gamesPlayed || 0),
      minutesPlayed: (b1Stats.minutesPlayed || 0) + (b2Stats.minutesPlayed || 0),
      goals: (b1Stats.goals || 0) + (b2Stats.goals || 0),
      assists: (b1Stats.assists || 0) + (b2Stats.assists || 0),
      avgRating: parseFloat(((b1Rating + b2Rating) / 2).toFixed(1)) || 6.5,
      cleanSheets: (b1Stats.cleanSheets || 0) + (b2Stats.cleanSheets || 0),
      yellowCards: (b1Stats.yellowCards || 0) + (b2Stats.yellowCards || 0),
      redCards: (b1Stats.redCards || 0) + (b2Stats.redCards || 0),
      injuryMatchesMissed: (b1Stats.injuryMatchesMissed || 0) + (b2Stats.injuryMatchesMissed || 0),
      mvps: (b1Stats.mvps || 0) + (b2Stats.mvps || 0),
    };

    // 4. Calculate awards and newspaper articles
    const awards = calculateSeasonAwards(totalStats);
    setSeasonAwards(awards);

    const news = generateNewspaperArticles(player, totalStats, awards, category);
    setNewspaper(news);

    // 5. Simulate league standings & qualification
    const isPro = isPlayerInProClub(player) || isProfessionalPlayer(player) || (player.age || 10) >= 16;
    if (isPro) {
      const proSim = simulateFullProfessionalLeague(player, totalStats, getCareerLeagueDatabase());
      setYouthStandings(proSim.standings);
      setPlayerStanding(proSim.playerTeamStanding);
      setIsQualifiedForIntCup(false);
      setYouthLeagueName(proSim.leagueName);
      setNonQualifiedCupSummary(null);
      setSisterDivisionStandings(proSim.sisterDivisionStandings || null);
      setSisterDivisionName(proSim.sisterDivisionName || null);
      setFirstTeamStandings(proSim.firstTeamStandings || null);
      setFirstTeamLeagueName(proSim.firstTeamLeagueName || null);
      setPlayoffPressureNote(proSim.playoffPressureNote || null);
      setRelegationSimData({
        promotedTeamIds: proSim.promotedTeamIds || [],
        relegatedTeamIds: proSim.relegatedTeamIds || [],
      });
    } else {
      const simulatedStandings = simulateFullYouthLeagueStandings(player, totalStats);
      setYouthStandings(simulatedStandings.standings);
      setPlayerStanding(simulatedStandings.playerTeamStanding);
      setIsQualifiedForIntCup(simulatedStandings.playerTeamQualified);
      setYouthLeagueName(simulatedStandings.leagueName);
      setSisterDivisionStandings(null);
      setSisterDivisionName(null);
      setFirstTeamStandings(null);
      setFirstTeamLeagueName(null);
      setPlayoffPressureNote(null);

      if (!simulatedStandings.playerTeamQualified) {
        const summary = generateNonQualifiedCupChampion(player);
        setNonQualifiedCupSummary(summary);
      } else {
        setNonQualifiedCupSummary(null);
      }
    }

    // 6. Update player chemistry, fame, fitness & stamina
    const lastMatch = b2Matches[b2Matches.length - 1];
    const playerAfterDiscount = discountChemistryPenaltyMonths(player, 12) as PlayerConfig;
    const activeCap = getActiveChemistryCap(playerAfterDiscount.chemistryCeiling, playerAfterDiscount.chemistryCeilingMonthsRemaining, playerAfterDiscount.chemistryCaps);
    const newChem = Math.min(activeCap ?? 100, (playerAfterDiscount.chemistry ?? 50) + 100);
    const effFame = awards.totalFameGained > 0 ? calculateFameGainWithPerks(awards.totalFameGained, playerAfterDiscount) : 0;

    const updatedPlayer: PlayerConfig = {
      ...playerAfterDiscount,
      chemistry: newChem,
      fame: (playerAfterDiscount.fame || 0) + effFame,
      ...(lastMatch?.playerFitness !== undefined
        ? { fitness: lastMatch.playerFitness, staminaCurrent: lastMatch.playerFitness }
        : {}),
    };

    onUpdatePlayer(updatedPlayer);

    // 7. Advance authoritative world simulation to Matchday 38 with all matches synced
    syncCareerBlockMatchesToWorldSimulation(updatedPlayer, [...b1Matches, ...b2Matches], 38, seasonYear);

    // 8. If an active National Tournament was in progress, simulate and finalize it
    if (nationalTournamentState) {
      const res = simulateRemainingTournamentMatches(nationalTournamentState, updatedPlayer as PlayerCardData);
      const finalized = finalizeNationalTournament(res.updatedState, res.updatedPlayer);
      onUpdatePlayer(finalized);
      setNationalTournamentState(null);
      setNationalDrawState(null);
      setActiveIntCallUp(null);
    } else {
      setActiveIntCallUp(null);
    }

    // 9. If qualified for International Youth Cup or in tournament stage, simulate matches
    if (tournamentMatches.length === 0 && (currentStage === 'tournament' || isQualifiedForIntCup)) {
      const generatedMatches: TournamentMatch[] = [
        {
          matchId: 'tourn-skip-1',
          stageName: 'Group Stage — Match 1',
          opponentName: 'FC Porto U17',
          opponentOvr: 66,
          teamScore: 2,
          opponentScore: 1,
          playerGoals: 1,
          playerAssists: 1,
          playerRating: 7.9,
          isWinner: true,
        },
        {
          matchId: 'tourn-skip-2',
          stageName: 'Group Stage — Match 2',
          opponentName: 'Ajax Academy U17',
          opponentOvr: 69,
          teamScore: 1,
          opponentScore: 1,
          playerGoals: 1,
          playerAssists: 0,
          playerRating: 7.4,
          isWinner: false,
        },
        {
          matchId: 'tourn-skip-3',
          stageName: 'Group Stage — Match 3',
          opponentName: 'Santos FC U17',
          opponentOvr: 67,
          teamScore: 3,
          opponentScore: 0,
          playerGoals: 2,
          playerAssists: 1,
          playerRating: 8.6,
          isWinner: true,
        },
        {
          matchId: 'tourn-skip-4',
          stageName: 'Quarter-Final',
          opponentName: 'Bayern Munich U17',
          opponentOvr: 70,
          teamScore: 2,
          opponentScore: 1,
          playerGoals: 1,
          playerAssists: 1,
          playerRating: 8.1,
          isWinner: true,
        },
        {
          matchId: 'tourn-skip-5',
          stageName: 'Semi-Final',
          opponentName: 'Real Madrid U17',
          opponentOvr: 72,
          teamScore: 1,
          opponentScore: 2,
          playerGoals: 1,
          playerAssists: 0,
          playerRating: 7.5,
          isWinner: false,
        },
        {
          matchId: 'tourn-skip-6',
          stageName: 'Third-Place Match',
          opponentName: 'Chelsea FC Academy U17',
          opponentOvr: 70,
          teamScore: 2,
          opponentScore: 1,
          playerGoals: 1,
          playerAssists: 1,
          playerRating: 8.0,
          isWinner: true,
        },
      ];
      setTournamentMatches(generatedMatches);
      setActiveKeyMatchStep('finished');
      finalizeTournamentResults(generatedMatches, false);
    }

    // 10. Update all local simulation states and jump straight to 'summary'
    setBlock1Stats(b1Stats);
    setBlock1MatchList(b1Matches);
    setBlock2Stats(b2Stats);
    setBlock2MatchList(b2Matches);
    setDisplayedBlockMatches(b2Matches);
    setPendingBlockMatches([]);
    setIsSimulatingMatches(false);
    setActiveSimulatingBlock(null);
    setSimulationComplete(true);
    setIsPaused(false);
    setCompStartModalConfig(null);
    setBlockKeyMatchModalConfig(null);
    setShowNationalTeamDrawModal(false);
    setPendingPostNationalStage(null);

    setCurrentStage('summary');
    if (isProfessionalPlayer(player) || isPro) {
      setShowSeasonSummaryModal(true);
    }
    if (showToast) {
      showToast(t('SEASON_SKIPPED_SUCCESS') || '⏩ [Test Mode] Season skipped to Season Summary (all matches & tournaments generated)!');
    }
  };

  const handleFinishBlock2Simulation = () => {
    const finishedB2 = displayedBlockMatches.length > 0 ? displayedBlockMatches : pendingBlockMatches;
    setBlock2MatchList(finishedB2);
    const lastMatch = finishedB2[finishedB2.length - 1];
    // Complete remaining months discounting for the 6-month block
    const remainingMonthsB2 = Math.max(0, 6 - simulatedBlockMonthsPassed);
    let playerAfterDiscountB2 = player;
    if (remainingMonthsB2 > 0) {
      playerAfterDiscountB2 = discountChemistryPenaltyMonths(playerAfterDiscountB2, remainingMonthsB2) as PlayerConfig;
    }
    // Block 2 spans 6 months. Ensure +50 chemistry gain (+10/month) up to cap max
    const activeCap = getActiveChemistryCap(playerAfterDiscountB2.chemistryCeiling, playerAfterDiscountB2.chemistryCeilingMonthsRemaining, playerAfterDiscountB2.chemistryCaps);
    const newChem = Math.min(activeCap ?? 100, (playerAfterDiscountB2.chemistry ?? 50) + 50);
    const updatedPlayer: PlayerConfig = {
      ...playerAfterDiscountB2,
      chemistry: newChem,
      lastSimulatedMatches: finishedB2.slice(-5),
      ...(lastMatch?.playerFitness !== undefined
        ? { fitness: lastMatch.playerFitness, staminaCurrent: lastMatch.playerFitness }
        : {}),
    };
    onUpdatePlayer(updatedPlayer);
    
    // Advance authoritative world simulation to Matchday 38 with all matches synced
    syncCareerBlockMatchesToWorldSimulation(updatedPlayer, [...(block1MatchList || []), ...finishedB2], 38, seasonYear);

    // Record block 2 matches to persistent yearly statistics database
    finishedB2.forEach((m) => {
      recordMatchToYearlyDatabase(seasonYear, updatedPlayer, m);
    });

    setActiveSimulatingBlock(null);

    // --- INTERNATIONAL COMPETITIONS CALL-UP CHECK (End of Season / July Window) ---
    const isPro = isProfessionalPlayer(updatedPlayer);
    const startYear = parseInt(seasonYear.split('/')[0]) || (2026 + ((updatedPlayer.age || 10) - 10));
    const prefConfed: 'UEFA' | 'CONMEBOL' = isSouthAmericanContext(updatedPlayer, getCareerLeagueDatabase()) ? 'CONMEBOL' : 'UEFA';

    const scheduledEndComps = getScheduledInternationalCompetitions(
      startYear,
      updatedPlayer.age || 18,
      isPro,
      'end_season',
      prefConfed
    );

    let nextP = updatedPlayer;
    for (const scheduledEndComp of scheduledEndComps) {
      if (!isInternationalEventCompleted(nextP, scheduledEndComp.tier, scheduledEndComp.type, startYear)) {
        const evalRes = evaluateNationalTeamCallUp(nextP as PlayerCardData, scheduledEndComp);
        if (evalRes.isEligible && evalRes.callUp) {
          setIntDestinationStage('summary');
          setActiveIntCallUp(evalRes.callUp);
          return;
        } else {
          // Player NOT called up for this tournament / qualifiers:
          // Skip the draw, simulate in background, show in news & career records
          nextP = markInternationalEventCompleted(nextP, scheduledEndComp.tier, scheduledEndComp.type, startYear);

          if (scheduledEndComp.type === 'tournament') {
            const pNationCode = nextP.nationality?.code || nextP.countryCode || 'ENG';
            const bgResult = simulateBackgroundNationalTournament(scheduledEndComp.competitionName, startYear, pNationCode);
            setLatestIntTournamentResult(bgResult);
            const newsItem = createNationalTournamentResultNews(bgResult);
            setCustomDrawNewsItems((prev) => [newsItem, ...prev]);

            const historyItem = {
              seasonYear: startYear,
              competitionName: scheduledEndComp.competitionName,
              shortName: scheduledEndComp.shortName,
              tier: scheduledEndComp.tier,
              nationName: nextP.nationality?.name || 'Unknown',
              nationCode: pNationCode,
              playerFinishStage: 'Not Called Up (Did Not Participate)',
              championNation: bgResult.champion.name,
              runnerUpNation: bgResult.runnerUp.name,
              thirdPlaceNation: bgResult.thirdPlace.name,
              playerGoals: 0,
              playerAssists: 0,
              playerCaps: 0,
              avgRating: 0,
            };

            if (scheduledEndComp.tier === 'Senior') {
              nextP.seniorTournamentHistory = [...(nextP.seniorTournamentHistory || []), historyItem];
            } else if (scheduledEndComp.tier === 'U20') {
              nextP.u20TournamentHistory = [...(nextP.u20TournamentHistory || []), historyItem];
            } else {
              nextP.u17TournamentHistory = [...(nextP.u17TournamentHistory || []), historyItem];
            }
          } else {
            // Qualifiers
            let qualOutcome = { playerNationQualified: false };
            if (scheduledEndComp.tier === 'U20') {
              qualOutcome = runCompleteU20Qualifiers(startYear, nextP.nationality);
              nextP.u20Qualified = qualOutcome.playerNationQualified;
            } else if (scheduledEndComp.tier === 'U17') {
              qualOutcome = runCompleteU17Qualifiers(startYear, nextP.nationality);
              nextP.u17Qualified = qualOutcome.playerNationQualified;
            }
            const qualNews: DrawNewsItem = {
              id: `news-qual-${scheduledEndComp.tier}-${startYear}-${Date.now()}`,
              category: 'national',
              competitionId: scheduledEndComp.shortName.toUpperCase(),
              competitionName: scheduledEndComp.competitionName,
              shortName: scheduledEndComp.shortName,
              icon: '🌍',
              badgeText: `${scheduledEndComp.shortName.toUpperCase()} QUALIFIERS`,
              isPlayerInvolved: false,
              headline: `${scheduledEndComp.competitionName} Concluded`,
              description: `${nextP.nationality?.name || 'National team'} qualifying phase has completed. Squad selection notice: ${evalRes.reason || 'Player was not called up'}.`,
              flagOrEmblem: `https://flagcdn.com/w80/${(nextP.nationality?.iso || 'gb-eng').toLowerCase()}.png`,
            };
            setCustomDrawNewsItems((prev) => [qualNews, ...prev]);
          }
        }
      }
    }
    if (nextP !== updatedPlayer) {
      onUpdatePlayer(nextP);
    }

    if (!isPro && isQualifiedForIntCup) {
      setCurrentStage('hub');
    } else {
      setCurrentStage('hub');
    }
  };

  const handleAcceptIntCallUp = (callUp: InternationalCallUp) => {
    const res = acceptInternationalCallUp(player, callUp);
    const updatedPlayer = res.updatedPlayer;
    const startYear = parseInt(seasonYear.split('/')[0]) || (2026 + ((player.age || 10) - 10));
    const isQual = callUp.competitionName.toLowerCase().includes('qualifier');
    const compType: 'qualifier' | 'tournament' = isQual ? 'qualifier' : 'tournament';
    onUpdatePlayer(updatedPlayer);
    setActiveIntCallUp(null);

    const dest = intDestinationStage || 'block1';
    setIntDestinationStage(null);

    // If it's a major tournament (Continental Cup, World Cup, U17/U20 World Cup):
    // Launch the official National Tournament framework with Draw -> Matches -> Concurrent outside menu access!
    if (compType === 'tournament') {
      const draw = generateNationalTournamentDraw(
        callUp.competitionName,
        callUp.nation.code,
        startYear,
        callUp.tier
      );
      setNationalDrawState(draw);
      setPendingPostNationalStage(dest === 'block2' ? 'mid_season_post_tournament' : dest === 'block1' ? 'block1' : 'end_season_post_tournament');
      setActiveSimulatingBlock(null);
      setCurrentStage('national_draw');
      return;
    }

    // Check if Draw is needed before simulating matches
    const duty = checkSeasonInternationalDuty(updatedPlayer, dest === 'block1' ? 1 : 2, startYear);
    if (duty.hasDuty && duty.isDrawRequired && duty.drawState) {
      setPendingNationalTeamDraw(duty.drawState);
      setShowNationalTeamDrawModal(true);
      setPendingBlockAfterDraw(dest === 'block1' ? 'block1' : 'block2');
      return;
    }

    if (dest === 'block1') {
      const output = generateYouthBlockMatches(updatedPlayer, 1, true);
      const merged = injectNationalTeamMatchesIntoBlock(output.matches, updatedPlayer, 1, startYear);
      const finalMatches = merged.unifiedMatches;
      setBlock1Stats(output.aggregatedStats);
      setBlock1MatchList([]);
      setPendingBlockMatches(finalMatches);
      setDisplayedBlockMatches([]);
      executeBlockStart('block1', finalMatches);
    } else if (dest === 'block2') {
      const output = generateYouthBlockMatches(updatedPlayer, 2, true);
      const merged = injectNationalTeamMatchesIntoBlock(output.matches, updatedPlayer, 2, startYear);
      const finalMatches = merged.unifiedMatches;
      setBlock2Stats(output.aggregatedStats);
      setBlock2MatchList([]);
      setPendingBlockMatches(finalMatches);
      setDisplayedBlockMatches([]);
      executeBlockStart('block2', finalMatches);
    } else {
      setCurrentStage(dest);
    }
  };

  const handleCompleteNationalDraw = (completedDraw: NationalTournamentDrawState) => {
    const role = (activeIntCallUp?.role as any) || 'Key Starter';
    const initialTournamentState = initializeNationalTournamentState(
      player as PlayerCardData,
      completedDraw.playerNation,
      completedDraw,
      role
    );
    setNationalTournamentState(initialTournamentState);
    setCurrentStage('national_tournament');
  };

  const handleFinishNationalTournament = (finalPlayer: PlayerCardData) => {
    onUpdatePlayer(finalPlayer);
    setNationalTournamentState(null);
    setNationalDrawState(null);
    setActiveIntCallUp(null);
    setActiveSimulatingBlock(null);

    const postStage = pendingPostNationalStage;
    setPendingPostNationalStage(null);

    if (postStage === 'mid_season_post_tournament') {
      const isPro = isProfessionalPlayer(finalPlayer);
      const cYear = parseInt(seasonYear.split('/')[0]) || 2026;

      if (isPro) {
        setCareerCardDrawType('mid_season');
        setIsCareerCardModalOpen(true);

        // Generate proactive mid-season club offers and renewal possibilities
        const midSeasonOffers = generateProactiveSeasonOffers(finalPlayer, accounting, manager);
        if (midSeasonOffers.length > 0) {
          setUnifiedOffers(midSeasonOffers);
          const hasSpecialMidOffer = midSeasonOffers.some((o) => o.isSaudiMegaOffer || o.id.startsWith('special_offer_'));
          if (hasSpecialMidOffer) {
            setShowUnifiedOffersModal(true);
            if (showToast) {
              showToast('👑 ELITE TRANSFER BID: Superpower clubs (Big 3, PSG, Big 6, or Saudi) have presented official bids! Check Transfer Offers.');
            }
          }
        }

        // South American flow: Continental draws (Libertadores / Sudamericana)
        if (flowConfig.hasMidseasonDraw && !seenContinentalDrawYears.includes(cYear)) {
          setSeenContinentalDrawYears((prev) => [...prev, cYear]);
          const { tournamentState: contState, playerClubInTournament } = getOrInitContinentalStateForSeason(finalPlayer, cYear);
          if (contState && playerClubInTournament) {
            setPendingContinentalDraw(contState);
            setShowContinentalDrawModal(true);
          } else {
            setShowContinentalDrawsSummaryModal(true);
          }
        }
      } else {
        const hasManager = Boolean(manager?.name || (finalPlayer as any).managerState?.name || (finalPlayer as any).managerName);
        const cards = drawThreeYouthCards(hasManager);
        setYouthCardModalConfig({
          isOpen: true,
          seasonLabel: flowConfig.region === 'south_america' ? 'Mid-Season Stop (July)' : 'Mid-Season Draw (Dec-Jan)',
          cards,
          drawType: 'mid_season',
        });
      }

      setCurrentStage('block2');
      if (showToast) {
        showToast('🏆 Official World Cup campaign concluded! Welcome to Mid-Season.');
      }
      return;
    }

    if (postStage === 'end_season_post_tournament') {
      const isPro = isProfessionalPlayer(finalPlayer);
      if (isPro) {
        setShowSeasonSummaryModal(true);
      }
      setCurrentStage('summary');
      if (showToast) {
        showToast('🏆 Official National Tournament campaign concluded! Proceeding to Season Summary.');
      }
      return;
    }

    setCurrentStage(postStage || 'summary');
    if (showToast) {
      showToast('🏆 Official National Tournament campaign concluded! Career records updated.');
    }
  };

  const handleStartScheduledTournament = (callUp: InternationalCallUp) => {
    const cYear = parseInt(seasonYear.split('/')[0]) || 2026;
    if (activeSimulatingBlock === 1) {
      const finishedB1 = displayedBlockMatches.length > 0 ? displayedBlockMatches : (block1MatchList.length > 0 ? block1MatchList : pendingBlockMatches);
      setBlock1MatchList(finishedB1);
      const lastMatch = finishedB1[finishedB1.length - 1];
      const remainingMonthsB1 = Math.max(0, 6 - simulatedBlockMonthsPassed);
      let playerAfterDiscountB1 = player;
      if (remainingMonthsB1 > 0) {
        playerAfterDiscountB1 = discountChemistryPenaltyMonths(playerAfterDiscountB1, remainingMonthsB1) as PlayerConfig;
      }
      const currentChem = typeof playerAfterDiscountB1.chemistry === 'number' && !isNaN(playerAfterDiscountB1.chemistry) ? playerAfterDiscountB1.chemistry : 50;
      const activeCap = getActiveChemistryCap(playerAfterDiscountB1.chemistryCeiling, playerAfterDiscountB1.chemistryCeilingMonthsRemaining, playerAfterDiscountB1.chemistryCaps);
      const newChem = Math.min(activeCap ?? 100, currentChem + 50);

      onUpdatePlayer({
        ...playerAfterDiscountB1,
        chemistry: newChem,
        lastSimulatedMatches: finishedB1.slice(-5),
        ...(lastMatch?.playerFitness !== undefined
          ? { fitness: lastMatch.playerFitness, staminaCurrent: lastMatch.playerFitness }
          : {}),
      });

      syncCareerBlockMatchesToWorldSimulation(player, finishedB1, 19, seasonYear);
      finishedB1.forEach((m) => {
        recordMatchToYearlyDatabase(seasonYear, player, m);
      });

      setPendingPostNationalStage('mid_season_post_tournament');
    } else {
      const finishedB2 = displayedBlockMatches.length > 0 ? displayedBlockMatches : (block2MatchList.length > 0 ? block2MatchList : pendingBlockMatches);
      setBlock2MatchList(finishedB2);
      const lastMatch = finishedB2[finishedB2.length - 1];
      const remainingMonthsB2 = Math.max(0, 6 - simulatedBlockMonthsPassed);
      let playerAfterDiscountB2 = player;
      if (remainingMonthsB2 > 0) {
        playerAfterDiscountB2 = discountChemistryPenaltyMonths(playerAfterDiscountB2, remainingMonthsB2) as PlayerConfig;
      }
      const activeCap = getActiveChemistryCap(playerAfterDiscountB2.chemistryCeiling, playerAfterDiscountB2.chemistryCeilingMonthsRemaining, playerAfterDiscountB2.chemistryCaps);
      const newChem = Math.min(activeCap ?? 100, (playerAfterDiscountB2.chemistry ?? 50) + 50);
      const updatedPlayer: PlayerConfig = {
        ...playerAfterDiscountB2,
        chemistry: newChem,
        lastSimulatedMatches: finishedB2.slice(-5),
        ...(lastMatch?.playerFitness !== undefined
          ? { fitness: lastMatch.playerFitness, staminaCurrent: lastMatch.playerFitness }
          : {}),
      };
      onUpdatePlayer(updatedPlayer);

      syncCareerBlockMatchesToWorldSimulation(updatedPlayer, [...(block1MatchList || []), ...finishedB2], 38, seasonYear);
      finishedB2.forEach((m) => {
        recordMatchToYearlyDatabase(seasonYear, updatedPlayer, m);
      });

      setPendingPostNationalStage('end_season_post_tournament');
    }

    setActiveSimulatingBlock(null);
    setActiveIntCallUp(null);
    const startYear = cYear;
    const draw = generateNationalTournamentDraw(
      callUp.competitionName,
      callUp.nation.code,
      startYear,
      callUp.tier
    );
    setNationalDrawState(draw);
    setCurrentStage('national_draw');
  };

  const handleSkipScheduledTournament = (callUp: InternationalCallUp) => {
    const cYear = parseInt(seasonYear.split('/')[0]) || 2026;
    const bgResult = simulateBackgroundNationalTournament(
      callUp.competitionName,
      cYear,
      callUp.nation.code
    );
    setLatestIntTournamentResult(bgResult);
    const newsItem = createNationalTournamentResultNews(bgResult);
    setCustomDrawNewsItems((prev) => [newsItem, ...prev]);

    let nextPlayer = markInternationalEventCompleted(player, callUp.tier, 'tournament', cYear);
    const historyItem = {
      seasonYear: cYear,
      competitionName: callUp.competitionName,
      shortName: callUp.competitionName,
      tier: callUp.tier,
      nationName: callUp.nation.name,
      nationCode: callUp.nation.code,
      playerFinishStage: 'Skipped Tournament (Simulated in Background)',
      championNation: bgResult.champion.name,
      runnerUpNation: bgResult.runnerUp.name,
      thirdPlaceNation: bgResult.thirdPlace.name,
      playerGoals: 0,
      playerAssists: 0,
      playerCaps: 0,
      avgRating: 0,
    };
    if (callUp.tier === 'U17') {
      nextPlayer.u17TournamentHistory = [...(nextPlayer.u17TournamentHistory || []), historyItem];
    } else if (callUp.tier === 'U20') {
      nextPlayer.u20TournamentHistory = [...(nextPlayer.u20TournamentHistory || []), historyItem];
    } else {
      nextPlayer.seniorTournamentHistory = [...(nextPlayer.seniorTournamentHistory || []), historyItem];
    }
    onUpdatePlayer(nextPlayer);
    setActiveIntCallUp(null);

    if (activeSimulatingBlock === 1) {
      handleFinishBlock1Simulation();
    } else {
      handleFinishBlock2Simulation();
    }
  };

  const handleTestLaunchNationalTournament = (compType: 'euro' | 'copa' | 'caf' | 'afc' | 'world_cup') => {
    const cYear = parseInt(seasonYear.split('/')[0]) || 2026;
    const pCode = player.nationality?.code || player.countryCode || 'ENG';
    let compName = 'UEFA Eurocup';
    if (compType === 'copa') compName = 'CONMEBOL Copa América';
    else if (compType === 'caf') compName = 'CAF Copa África';
    else if (compType === 'afc') compName = 'AFC Asian Cup';
    else if (compType === 'world_cup') compName = 'FIFA World Cup Final Stage';

    const draw = generateNationalTournamentDraw(compName, pCode, cYear, 'Senior');
    setNationalDrawState(draw);
    setPendingPostNationalStage(currentStage === 'national_tournament' || currentStage === 'national_draw' ? 'hub' : currentStage);
    setCurrentStage('national_draw');
  };

  const handleTestTriggerCallUp = (tier: 'U17' | 'U20' | 'Senior', compType: 'qualifier' | 'tournament' = 'tournament') => {
    const cYear = currentSeasonNumericYear;
    const pNation = player.nationality || { code: 'ENG', name: 'England', iso: 'gb-eng' };
    let compName = 'FIFA World Cup Final Stage';
    if (tier === 'U17') compName = compType === 'qualifier' ? 'UEFA Under-17 Championship Qualifiers' : 'FIFA U-17 World Cup (48 Nations)';
    else if (tier === 'U20') compName = compType === 'qualifier' ? 'FIFA U-20 World Cup Continental Qualifiers' : 'FIFA U-20 World Cup Final Stage';
    else compName = 'FIFA World Cup Final Stage';

    const testCallUp: InternationalCallUp = {
      id: `test-callup-${tier.toLowerCase()}-${Date.now()}`,
      nation: pNation,
      tier,
      competitionName: compName,
      managerName: `${pNation.name} ${tier} Head Coach`,
      role: 'Key Starter',
      bonusFame: tier === 'Senior' ? 300 : tier === 'U20' ? 100 : 50,
      date: `June ${cYear}`,
      isSeniorLockWarning: tier === 'Senior' && !player.isSeniorLocked,
    };
    setIntDestinationStage(currentStage === 'block1' ? 'block1' : 'summary');
    setActiveIntCallUp(testCallUp);
    if (showToast) showToast(`⚡ [Test Mode] Triggered official ${tier} call-up offer for ${pNation.name}!`);
  };

  const handleTestSimulateBackgroundTournament = () => {
    const cYear = currentSeasonNumericYear;
    const pCode = player.nationality?.code || player.countryCode || 'ENG';
    const bgResult = simulateBackgroundNationalTournament('FIFA World Cup Final Stage', cYear, pCode);
    setLatestIntTournamentResult(bgResult);
    const news = createNationalTournamentResultNews(bgResult);
    setCustomDrawNewsItems((prev) => [news, ...prev]);
    if (showToast) {
      showToast(`🏆 [Test Mode] Background tournament completed: ${bgResult.champion.name} are Champions! Results posted to news and summary.`);
    }
  };

  const handlePlayYouthIntKeyMatch = (fixture: InternationalFixture) => {
    const isPlayerHome = fixture.homeNation.code === youthIntHubState?.callingNation.code;
    const opp = isPlayerHome ? fixture.awayNation : fixture.homeNation;

    setYouthIntKeyMatchConfig({
      isOpen: true,
      stageTitle: `${fixture.stageName} - ${fixture.competitionName}`,
      opponentName: opp.name,
      opponentOvr: opp.ovr,
    });
  };

  const handleYouthIntKeyMatchCompleted = (result: KeyMatchFinalSummary) => {
    setYouthIntKeyMatchConfig(null);
    if (result.updatedPlayer) {
      onUpdatePlayer(result.updatedPlayer);
    }
    if (!youthIntHubState) return;

    const updatedHub = simulateInternationalFixture(youthIntHubState, result.updatedPlayer || player, true, {
      playerScore: result.playerTeamScore,
      opponentScore: result.opponentTeamScore,
      playerGoals: result.playerStats.goals,
      playerAssists: result.playerStats.assists,
      isWin: result.isWinner,
    });

    setYouthIntHubState(updatedHub);
  };

  const handleSimulateYouthIntMatch = () => {
    if (!youthIntHubState) return;
    const updatedHub = simulateInternationalFixture(youthIntHubState, player, false);
    setYouthIntHubState(updatedHub);
  };

  const handleConcludeYouthIntDuty = () => {
    if (!youthIntHubState) return;
    const { updatedPlayer } = finalizeInternationalDuty(player, youthIntHubState);
    onUpdatePlayer(updatedPlayer);
    setShowYouthIntLiveHub(false);
    setYouthIntHubState(null);
    const dest = intDestinationStage || 'summary';
    setIntDestinationStage(null);

    if (dest === 'block1') {
      const output = generateYouthBlockMatches(updatedPlayer, 1, true);
      setBlock1Stats(output.aggregatedStats);
      setBlock1MatchList(output.matches);
      setPendingBlockMatches(output.matches);
      executeBlockStart('block1', output.matches);
      return;
    } else if (dest === 'block2') {
      setCurrentStage('block2');
      return;
    }
    setCurrentStage(dest);
  };

  const handleChooseOtherNation = (callUp: InternationalCallUp) => {
    const res = chooseAnotherNationForCallUp(player, callUp);
    let updatedPlayer = res.updatedPlayer;
    const startYear = parseInt(seasonYear.split('/')[0]) || (2026 + ((player.age || 10) - 10));
    const isWc = !callUp.competitionName.toLowerCase().includes('qualifier');

    if (callUp.tier === 'U20') {
      const remainingQueue = getU20EligibleCallUpQueue(
        updatedPlayer,
        isWc,
        (code) => Boolean(updatedPlayer.u20Qualified),
        updatedPlayer.declinedInternationalCallUps?.['U20'] || []
      );

      if (remainingQueue.length > 0) {
        const nextCand = remainingQueue[0];
        const nextCallUp: InternationalCallUp = {
          id: `u20-callup-${nextCand.nation.code}-${startYear}-${Date.now()}`,
          nation: nextCand.nation,
          tier: 'U20',
          competitionName: callUp.competitionName,
          managerName: `${nextCand.nation.name} U20 Head Coach`,
          role: nextCand.role,
          bonusFame: isWc ? 100 : 60,
          date: callUp.date,
          isSeniorLockWarning: false,
        };
        onUpdatePlayer(updatedPlayer);
        setActiveIntCallUp(nextCallUp);
        if (showToast) showToast(`Exploring call-up from ${nextCand.nation.name}...`);
        return;
      }
    }

    if (showToast) showToast('No other eligible nations available for this tournament.');
    handleDeclineIntCallUp(callUp);
  };

  const handleDeclineIntCallUp = (callUp: InternationalCallUp) => {
    const res = declineInternationalCallUp(player, callUp);
    let updatedPlayer = res.updatedPlayer;
    const startYear = parseInt(seasonYear.split('/')[0]) || (2026 + ((player.age || 10) - 10));
    const isWc = !callUp.competitionName.toLowerCase().includes('qualifier');
    const compType: 'qualifier' | 'tournament' = isWc ? 'tournament' : 'qualifier';

    if (callUp.tier === 'U20') {
      const remainingQueue = getU20EligibleCallUpQueue(
        updatedPlayer,
        isWc,
        (code) => Boolean(updatedPlayer.u20Qualified),
        updatedPlayer.declinedInternationalCallUps?.['U20'] || []
      );

      if (remainingQueue.length > 0) {
        const nextCand = remainingQueue[0];
        const nextCallUp: InternationalCallUp = {
          id: `u20-callup-${nextCand.nation.code}-${startYear}-${Date.now()}`,
          nation: nextCand.nation,
          tier: 'U20',
          competitionName: callUp.competitionName,
          managerName: `${nextCand.nation.name} U20 Head Coach`,
          role: nextCand.role,
          bonusFame: isWc ? 100 : 60,
          date: callUp.date,
          isSeniorLockWarning: false,
        };
        onUpdatePlayer(updatedPlayer);
        setActiveIntCallUp(nextCallUp);
        return;
      }

      // All eligible nations in U20 queue declined: simulate tournament/qualifiers without player
      updatedPlayer = markInternationalEventCompleted(updatedPlayer, 'U20', compType, startYear);

      if (isWc) {
        const wcOutcome = runCompleteU20WorldCup(startYear, [], updatedPlayer, false, callUp.nation);
        const historyItem = {
          seasonYear: startYear,
          playerAge: updatedPlayer.age || 19,
          nationName: callUp.nation.name,
          nationCode: callUp.nation.code,
          playerFinishStage: 'Did not participate',
          championNation: wcOutcome.champion.name,
          runnerUpNation: wcOutcome.runnerUp.name,
          thirdPlaceNation: wcOutcome.thirdPlace.name,
          playerGoals: 0,
          playerAssists: 0,
          playerCaps: 0,
        };
        updatedPlayer.u20TournamentHistory = [...(updatedPlayer.u20TournamentHistory || []), historyItem];
      } else {
        const qualOutcome = runCompleteU20Qualifiers(startYear, callUp.nation);
        updatedPlayer.u20Qualified = qualOutcome.playerNationQualified;
      }
    } else if (callUp.tier === 'U17') {
      updatedPlayer = markInternationalEventCompleted(updatedPlayer, 'U17', compType, startYear);

      if (isWc) {
        const wcOutcome = runCompleteU17WorldCup(startYear, [], updatedPlayer, false, callUp.nation);
        const historyItem = {
          seasonYear: startYear,
          playerAge: updatedPlayer.age || 16,
          nationName: callUp.nation.name,
          nationCode: callUp.nation.code,
          playerFinishStage: 'Declined Call-Up',
          championNation: wcOutcome.champion.name,
          runnerUpNation: wcOutcome.runnerUp.name,
          thirdPlaceNation: wcOutcome.thirdPlace.name,
          playerGoals: 0,
          playerAssists: 0,
          playerCaps: 0,
        };
        updatedPlayer.u17TournamentHistory = [...(updatedPlayer.u17TournamentHistory || []), historyItem];
      } else {
        const qualOutcome = runCompleteU17Qualifiers(startYear, callUp.nation);
        updatedPlayer.u17Qualified = qualOutcome.playerNationQualified;
      }
    } else {
      updatedPlayer = markInternationalEventCompleted(updatedPlayer, callUp.tier, compType, startYear);
      if (compType === 'tournament') {
        const bgResult = simulateBackgroundNationalTournament(callUp.competitionName, startYear, callUp.nation.code);
        setLatestIntTournamentResult(bgResult);
        const newsItem = createNationalTournamentResultNews(bgResult);
        setCustomDrawNewsItems((prev) => [newsItem, ...prev]);

        const historyItem = {
          seasonYear: startYear,
          competitionName: callUp.competitionName,
          shortName: callUp.competitionName,
          tier: 'Senior' as NationalTeamTier,
          nationName: callUp.nation.name,
          nationCode: callUp.nation.code,
          playerFinishStage: 'Declined Call-Up',
          championNation: bgResult.champion.name,
          runnerUpNation: bgResult.runnerUp.name,
          thirdPlaceNation: bgResult.thirdPlace.name,
          playerGoals: 0,
          playerAssists: 0,
          playerCaps: 0,
          avgRating: 0,
        };
        updatedPlayer.seniorTournamentHistory = [...(updatedPlayer.seniorTournamentHistory || []), historyItem];
      }
    }

    onUpdatePlayer(updatedPlayer);
    setActiveIntCallUp(null);
    const dest = intDestinationStage || 'summary';
    setIntDestinationStage(null);

    if (dest === 'block1') {
      const output = generateYouthBlockMatches(updatedPlayer, 1, true);
      setBlock1Stats(output.aggregatedStats);
      setBlock1MatchList(output.matches);
      setPendingBlockMatches(output.matches);
      executeBlockStart('block1', output.matches);
      return;
    } else if (dest === 'block2') {
      setCurrentStage('block2');
      return;
    }
    setCurrentStage(dest);
  };

  const hasAlternativeNationalities = useMemo(() => {
    if (!activeIntCallUp) return false;
    if (activeIntCallUp.tier === 'U20') {
      const isWc = activeIntCallUp.competitionName.toLowerCase().includes('world cup');
      const declined = [
        ...(player.declinedInternationalCallUps?.['U20'] || []),
        activeIntCallUp.nation.code.toUpperCase(),
      ];
      const remaining = getU20EligibleCallUpQueue(
        player,
        isWc,
        (code) => Boolean(player.u20Qualified),
        declined
      );
      return remaining.length > 0;
    }
    const eligibleNats = getEligibleNationalities(player);
    return eligibleNats.length > 1;
  }, [player, activeIntCallUp]);

  const handleCloseIntTournamentModal = () => {
    setShowIntTournamentModal(false);
    const startYear = 2026 + ((player.age || 10) - 10);
    const cycle = getInternationalCycleForSeason(startYear);
    if (cycle) {
      const eventId = `int-cycle-${cycle.tier}-${cycle.type}-${startYear}`;
      const updatedEvents = Array.from(new Set([...(player.completedInternationalEvents || []), eventId]));
      const updatedSeasons = Array.from(new Set([...(player.resolvedInternationalSeasons || []), startYear]));
      onUpdatePlayer({
        ...player,
        completedInternationalEvents: updatedEvents,
        resolvedInternationalSeasons: updatedSeasons,
      });
    }
    const dest = intDestinationStage || 'summary';
    setIntDestinationStage(null);
    setCurrentStage(dest);
  };

  // Stage 4: Enter 32-Team International Youth Tournament (starts with Group Stage Draw)
  const handlePlayTournament = () => {
    const clubs = generate32ClubsForCup(player, youthStandings || undefined);
    setCupClubsForDraw(clubs);
    setCurrentStage('draw');
  };

  const handleFinishDraw = (drawnGroups: GroupStageGroup[]) => {
    const fullIntData = simulateGroupStageMatches(player, drawnGroups, cupClubsForDraw);
    setIntCupData(fullIntData);

    setTournamentMatches([]);
    setQuarterOpponent({ name: fullIntData.quarterOpponent.name, ovr: fullIntData.quarterOpponent.teamOvr });
    setSemiOpponent({ name: fullIntData.semiOpponent.name, ovr: fullIntData.semiOpponent.teamOvr });
    setFinalOpponent({ name: fullIntData.finalOpponent.name, ovr: fullIntData.finalOpponent.teamOvr });
    setThirdPlaceOpponent({ name: fullIntData.thirdPlaceOpponent.name, ovr: fullIntData.thirdPlaceOpponent.teamOvr });

    setCompStartModalConfig({
      competitionName: '32-Team International Youth Cup',
      category: 'youth',
      competitionType: 'youth_cup',
      teamName: (manager as any)?.clubName || player.club || 'Youth Academy',
      teamOvr: player.ovr || 68,
      firstRivalName: fullIntData.quarterOpponent.name || 'FC Barcelona U11',
      firstRivalOvr: fullIntData.quarterOpponent.teamOvr || 70,
      venue: 'Neutral Stadium',
      isPro: false,
      expectation: calculateTeamExpectation(player.ovr || 68, fullIntData.quarterOpponent.teamOvr || 70, 'youth_cup', 'youth', false),
    });
    setPendingBlockStartType('youth_cup');
  };

  const handleConfirmStartCompetition = () => {
    setCompStartModalConfig(null);

    if (pendingBlockStartType === 'block1') {
      setIsSimulatingMatches(true);
      setActiveSimulatingBlock(1);
      setDisplayedBlockMatches([]);
      setSimulatedBlockMonthsPassed(0);
      setSimulationComplete(false);
      setIsPaused(false);
      setSimulationSpeed('slow');
    } else if (pendingBlockStartType === 'block2') {
      setIsSimulatingMatches(true);
      setActiveSimulatingBlock(2);
      setDisplayedBlockMatches([]);
      setSimulatedBlockMonthsPassed(0);
      setSimulationComplete(false);
      setIsPaused(false);
      setSimulationSpeed('slow');
    } else if (pendingBlockStartType === 'youth_cup') {
      setActiveKeyMatchStep(null);
      setCurrentStage('tournament');
    }

    setPendingBlockStartType(null);
  };

  const handleLaunchKeyMatchModal = (
    step: 'quarter_final' | 'semi_final' | 'final' | 'third_place',
    overrideOpponent?: { name: string; ovr: number }
  ) => {
    let stageTitle = 'International Youth Tournament Quarter-Final ⚡';
    let opp = overrideOpponent || quarterOpponent;

    if (step === 'semi_final') {
      stageTitle = 'International Youth Tournament Semi-Final ⚡';
      if (!overrideOpponent) opp = semiOpponent;
    } else if (step === 'final') {
      stageTitle = 'International Youth Tournament Final 🏆';
      if (!overrideOpponent) opp = finalOpponent;
    } else if (step === 'third_place') {
      stageTitle = 'International Youth Tournament Third-Place Match 🥉';
      if (!overrideOpponent) opp = thirdPlaceOpponent;
    }

    setKeyMatchModalConfig({
      isOpen: true,
      stageTitle,
      opponentName: opp?.name || 'FC Barcelona Youth',
      opponentOvr: opp?.ovr || 70,
      step,
    });
  };

  const handleKeyMatchCompleted = (summary: KeyMatchFinalSummary) => {
    if (!keyMatchModalConfig) return;

    const currentStep = keyMatchModalConfig.step;
    setKeyMatchModalConfig(null);

    const basePlayer = summary.updatedPlayer || player;
    // Deduct fitness based on Key Match participation
    const staminaAttr = basePlayer.stats?.detailed?.stamina || basePlayer.stats?.phy || 70;
    const fitLoss = Math.max(6, Math.min(18, Math.round(18 - (staminaAttr * 0.12))));
    const currentFit = getFitnessPercentage(basePlayer);
    const newFitness = Math.max(0, currentFit - fitLoss);

    onUpdatePlayer({
      ...basePlayer,
      fitness: newFitness,
      staminaCurrent: newFitness,
    });

    let stageName = 'Quarter Final';
    if (currentStep === 'semi_final') stageName = 'Semi Final';
    if (currentStep === 'final') stageName = 'Final';
    if (currentStep === 'third_place') stageName = 'Third-Place Match';

    const newMatch: TournamentMatch = {
      matchId: `int-km-${Date.now()}`,
      stageName,
      opponentName: summary.opponentTeamName,
      opponentOvr: keyMatchModalConfig.opponentOvr,
      teamScore: summary.playerTeamScore,
      opponentScore: summary.opponentTeamScore,
      playerGoals: summary.playerStats.goals,
      playerAssists: summary.playerStats.assists,
      playerRating: summary.playerStats.rating,
      isWinner: summary.isWinner,
    };

    const updatedMatches = [...tournamentMatches, newMatch];
    setTournamentMatches(updatedMatches);

    if (currentStep === 'quarter_final') {
      if (summary.isWinner) {
        setActiveKeyMatchStep('semi_final');
      } else {
        setActiveKeyMatchStep('finished');
        finalizeTournamentResults(updatedMatches, false);
      }
    } else if (currentStep === 'semi_final') {
      if (summary.isWinner) {
        setActiveKeyMatchStep('final');
      } else {
        setActiveKeyMatchStep('third_place');
      }
    } else {
      setActiveKeyMatchStep('finished');
      finalizeTournamentResults(updatedMatches, summary.isWinner && currentStep === 'final');
    }
  };

  const finalizeTournamentResults = (matches: TournamentMatch[], isChampion: boolean) => {
    let totalG = 0;
    let totalA = 0;
    let sumRating = 0;

    matches.forEach((m) => {
      totalG += m.playerGoals;
      totalA += m.playerAssists;
      sumRating += m.playerRating;
    });

    const topScorer = totalG >= 4;
    const topAssist = totalA >= 3;
    const bestPlayer = sumRating / Math.max(1, matches.length) >= 7.8;

    let fameGained = 0;
    if (topScorer) fameGained += 5;
    if (topAssist) fameGained += 5;
    if (bestPlayer) fameGained += 5;
    if (isChampion) fameGained += 10;

    const teamFinish = isChampion
      ? 'Tournament Champions 🏆'
      : matches.some((m) => m.stageName === 'Third-Place Match' && m.isWinner)
      ? 'Third-Place Winners 🥉'
      : 'Tournament Runners-Up 🥈';

    const result: InternationalTournamentResult = {
      qualified: true,
      teamFinish,
      matches,
      awards: {
        topScorer,
        topAssist,
        bestPlayer,
        winner: isChampion,
        fameGained,
      },
    };

    setTournamentResult(result);

    if (isChampion && onTriggerChampionModal) {
      const isDouble = playerStanding?.rank === 1;
      const trophiesList = isDouble
        ? [`Youth League U${player.age || 16}`, 'International Youth Cup']
        : ['International Youth Cup'];

      onTriggerChampionModal({
        titleName: 'International Youth Cup',
        trophyType: 'youth',
        seasonYear,
        clubName: player.club,
        isYouth: true,
        isDouble,
        seasonTrophiesList: trophiesList,
        finalScore: '3 - 1',
        playerPerformance: {
          name: player.name || 'Player',
          position: player.position || 'ST',
          ovr: player.ovr || 70,
          matchesPlayed: matches.length,
          goals: totalG,
          assists: totalA,
          avgRating: (sumRating / Math.max(1, matches.length)).toFixed(1),
          keyContributionText: `A triumphant international tournament run where ${player.name} led ${player.club} to conquer the 32-team International Youth Cup!`,
        },
      });
    }

    if (bestPlayer && checkGoldenBoyFeat(player, true)) {
      setFeatNicknameForModal(FEAT_NICKNAMES.golden_boy);
      setShowNicknameModal(true);
    }

    if (fameGained > 0) {
      const effFame = calculateFameGainWithPerks(fameGained, player);
      onUpdatePlayer({
        ...player,
        fame: (player.fame || 0) + effFame,
      });
    }
  };

  const handleStartPlayoffKeyMatch = () => {
    if (!playerStanding) return;
    const isTier1 = (player.leagueTier || 1) === 1;
    const oppName = sisterDivisionStandings?.[0]?.teamName || (isTier1 ? '2nd Division Playoff Winner' : '1st Division 17th Place');
    const oppOvr = isTier1 ? 71 : 76;

    setPlayoffKeyMatchConfig({
      isOpen: true,
      stageTitle: isTier1
        ? '⚡ HIGH-PRESSURE RELEGATION PLAYOFF FINAL ⚠️ (FIGHT TO SURVIVE)'
        : '🔥 HIGH-STAKES PROMOTION PLAYOFF FINAL 🚀 (FIGHT FOR GLORY)',
      opponentName: oppName,
      opponentOvr: oppOvr,
      isTier1,
    });
  };

  const handlePlayoffKeyMatchCompleted = (summary: KeyMatchFinalSummary) => {
    if (!playoffKeyMatchConfig) return;
    const { isTier1 } = playoffKeyMatchConfig;
    setPlayoffKeyMatchConfig(null);

    if (summary.updatedPlayer) {
      onUpdatePlayer(summary.updatedPlayer);
    }

    const won = summary.isWinner;
    if (isTier1) {
      if (won) {
        setPlayerStanding((prev) =>
          prev
            ? {
                ...prev,
                inPlayoff: false,
                relegated: false,
                qualificationBadge: {
                  label: 'Relegation Playoff Winner (Safe)',
                  color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
                },
              }
            : null
        );
        setPlayoffPressureNote(
          `🎉 GLORIOUS SURVIVAL! ${player.club} won the Relegation Playoff (${summary.playerTeamScore}-${summary.opponentTeamScore}) and will remain in 1st Division next season!`
        );
      } else {
        setPlayerStanding((prev) =>
          prev
            ? {
                ...prev,
                inPlayoff: false,
                relegated: true,
                qualificationBadge: {
                  label: 'Relegated to 2nd Division',
                  color: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
                },
              }
            : null
        );
        setPlayoffPressureNote(
          `💔 HEARTBREAKING PLAYOFF LOSS! ${player.club} lost the Relegation Playoff (${summary.playerTeamScore}-${summary.opponentTeamScore}) and is relegated to 2nd Division.`
        );
      }
    } else {
      if (won) {
        setPlayerStanding((prev) =>
          prev
            ? {
                ...prev,
                inPlayoff: false,
                promoted: true,
                qualificationBadge: {
                  label: 'Promotion Playoff Winner (Promoted)',
                  color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
                },
              }
            : null
        );
        setPlayoffPressureNote(
          `🚀 PROMOTION ACHIEVED! ${player.club} won the Promotion Playoff (${summary.playerTeamScore}-${summary.opponentTeamScore}) and is promoted to 1st Division!`
        );
      } else {
        setPlayerStanding((prev) =>
          prev
            ? {
                ...prev,
                inPlayoff: false,
                promoted: false,
                qualificationBadge: {
                  label: 'Remains in 2nd Division',
                  color: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
                },
              }
            : null
        );
        setPlayoffPressureNote(
          `⚠️ PLAYOFF DEFEAT! ${player.club} fell short in the Promotion Playoff (${summary.playerTeamScore}-${summary.opponentTeamScore}) and will remain in 2nd Division.`
        );
      }
    }
  };

  // Stage 5: Preseason Training & Free Stat Points -> Age Advancement
  const handleFinishTraining = () => {
    // Apply 99-cap Preseason Training (handles group cap, redirection, Extended Pre-Season +5 perk, and all-groups-maxed conversion)
    const { updatedPlayer: playerAfterTraining } = applyPreseasonTrainingToPlayer(
      player,
      selectedTrainingGroup
    );

    const newAge = age + 1;

    // Apply Yearly Archetype Bonus (+1 to 3 primary strengths per year from Age 10 to Age 20)
    let playerWithBonuses = playerAfterTraining;
    if (playerAfterTraining.playerTypeId && playerAfterTraining.stats?.detailed) {
      const { updatedDetailed, boostedStatKeys } = applyYearlyArchetypeBonus(
        playerAfterTraining.playerTypeId,
        playerAfterTraining.stats.detailed,
        newAge
      );
      if (boostedStatKeys.length > 0) {
        const statsWithBonus = syncCategoryStatsFromDetailed(playerAfterTraining.stats, updatedDetailed);
        playerWithBonuses = {
          ...playerAfterTraining,
          stats: statsWithBonus,
        };
      }
    }

    const devResult = calculateAnnualDevelopmentPoints(playerWithBonuses, newAge);
    const currentPoints = playerWithBonuses.freeStatPoints || playerWithBonuses.unassignedPoints || 0;

    // Iconic Parent 5-Year Milestone Perk: +10 Stat Points every 5 years
    const careerYearsElapsed = newAge - 10;
    const isIconicPerkActive =
      playerWithBonuses.equippedParentCard?.typeId === 'iconic_parent' ||
      playerWithBonuses.activePerkIds?.includes('built_for_greatness') ||
      playerWithBonuses.activePerkIds?.includes('iconic_parent');

    const iconic5YearBonus = isIconicPerkActive && careerYearsElapsed > 0 && careerYearsElapsed % 5 === 0 ? 10 : 0;
    const newPoints = currentPoints + devResult.points + iconic5YearBonus;

    const physicalGrowth = calculateAnnualPhysicalGrowth(playerWithBonuses);

    const nextPlayer: PlayerConfig = resetAnnualTrainButtonLimits(
      sanitizeAndRepairPlayerIdentity({
        ...playerWithBonuses,
        age: newAge,
        heightCm: physicalGrowth.newHeight,
        weightKg: physicalGrowth.newWeight,
        hasHadGrowthSpurt: physicalGrowth.hasHadGrowthSpurt,
        lastYearGrowthCm: physicalGrowth.growthCm,
        lastYearWasGrowthSpurt: physicalGrowth.isGrowthSpurt,
        freeStatPoints: newPoints,
        unassignedPoints: newPoints,
        fitness: 100,
        staminaCurrent: 100,
      })
    );

    if (physicalGrowth.isGrowthSpurt) {
      setGrowthSpurtModalData(physicalGrowth);
    }

    const isPro = isProfessionalPlayer(nextPlayer);

    // Club Development points apply each year when player has a club or youth team affiliation
    let candidateWithAcademy = nextPlayer;
    const hasClubAffiliation = Boolean(
      (nextPlayer.club && nextPlayer.club !== 'Free Agent' && nextPlayer.league !== 'Street Football') ||
      !isPro ||
      nextPlayer.youthLeagueTeam
    );

    if (hasClubAffiliation) {
      const academyDev = applyAcademySeasonDevelopmentPoints(nextPlayer);
      if (academyDev.result.applied && academyDev.result.totalPoints > 0) {
        candidateWithAcademy = academyDev.updatedPlayer as PlayerConfig;
        setAcademyDevReport(academyDev.result);
      } else {
        setAcademyDevReport(null);
      }
    } else {
      setAcademyDevReport(null);
    }

    let nextLeague = candidateWithAcademy.league;
    let nextLeagueTier = candidateWithAcademy.leagueTier;

    if (isPro && playerStanding) {
      const careerDb = getCareerLeagueDatabase();
      const countryCode = (player.countryCode || player.clubCountry || '').toUpperCase();
      const leagueIds = getLeagueIdsForCountry(countryCode, player.clubCountry, player.league);
      const d1League = careerDb.leagues?.[leagueIds.d1Id];
      const d2League = careerDb.leagues?.[leagueIds.d2Id];

      if (playerStanding.promoted) {
        if (d1League) {
          nextLeague = d1League.name;
          nextLeagueTier = 1;
        }
      } else if (playerStanding.relegated) {
        if (d2League) {
          nextLeague = d2League.name;
          nextLeagueTier = 2;
        }
      }

      // Execute authoritative promotion/relegation roster swap in the isolated career db
      if (relegationSimData?.promotedTeamIds?.length || relegationSimData?.relegatedTeamIds?.length) {
        executePromotionRelegationRosterSwap(
          countryCode,
          relegationSimData.promotedTeamIds || [],
          relegationSimData.relegatedTeamIds || [],
          player.league,
          careerDb
        );
      }
    }

    // Record completed season into Career History
    const matchesCount = (block1Stats?.matches || 9) + (block2Stats?.matches || 9);
    const goalsCount = (block1Stats?.goals || 0) + (block2Stats?.goals || 0);
    const assistsCount = (block1Stats?.assists || 0) + (block2Stats?.assists || 0);
    const combinedAvgRating = Number(
      (((block1Stats?.avgRating || 7.2) + (block2Stats?.avgRating || 7.2)) / 2).toFixed(2)
    );

    const trophiesWonThisSeason: string[] = [];
    const trophyItemsToAward: {
      name: string;
      category: 'national' | 'continental' | 'international' | 'youth' | 'individual' | 'friendly';
      year: number | string;
      prestige: number;
      iconType: 'world-cup' | 'champions-league' | 'league' | 'cup' | 'ballon-dor' | 'golden-boot' | 'best-player' | 'youth-trophy' | 'super-cup' | 'olympic-gold' | 'friendly';
    }[] = [];

    const squadDest = player.squadDestination || (isPro ? (age <= 16 ? 'U17' : age <= 18 ? 'U20' : 'First Team') : 'Youth');
    const isSquadTier = squadDest === 'U17' || squadDest === 'U20' || squadDest === 'Reserves';

    if (playerStanding?.rank === 1) {
      const leagueTitle = isPro ? `${youthLeagueName} Champion` : `Youth League U${age} Champion`;
      trophiesWonThisSeason.push(leagueTitle);
      trophyItemsToAward.push({
        name: leagueTitle,
        category: isSquadTier ? 'friendly' : (isPro ? 'national' : 'youth'),
        year: seasonYear,
        prestige: isSquadTier ? 65 : (isPro ? 85 : 60),
        iconType: isSquadTier ? 'friendly' : (isPro ? 'league' : 'youth-trophy'),
      });
    }

    // Squad Knockout Cup Title for U17, U20, Reserves
    if (isSquadTier) {
      const auth = resolveAuthoritativeClubContext(player.club || '', getCareerLeagueDatabase());
      const wonSquadCup = (playerStanding?.rank || 5) <= 2;
      if (wonSquadCup) {
        const squadCupTitle = `${auth.league} ${squadDest} Cup Champion`;
        trophiesWonThisSeason.push(squadCupTitle);
        trophyItemsToAward.push({
          name: squadCupTitle,
          category: 'friendly',
          year: seasonYear,
          prestige: 60,
          iconType: 'friendly',
        });
      }
    }
    if (tournamentResult?.awards?.winner) {
      trophiesWonThisSeason.push("International Youth Cup");
      trophyItemsToAward.push({
        name: "32-Team International Youth Cup",
        category: 'youth',
        year: seasonYear,
        prestige: 75,
        iconType: 'youth-trophy',
      });
    }

    const awardsWonThisSeason: string[] = [];

    // Check World Results Individual Awards for Professional Players
    if (isPro && (player.age || 16) >= 17) {
      const worldAwardsData = calculateWorldIndividualAwards(
        player,
        {
          goals: goalsCount,
          assists: assistsCount,
          matches: matchesCount,
          avgRating: combinedAvgRating,
        },
        seasonYear,
        true
      );

      // 1. European Golden Boot
      if (worldAwardsData.europeanGoldenBoot?.[0]?.isUserPlayer || worldAwardsData.europeanGoldenBoot?.[0]?.name === player.name) {
        awardsWonThisSeason.push('European Golden Boot');
        trophyItemsToAward.push({
          name: 'European Golden Boot',
          category: 'individual',
          year: seasonYear,
          prestige: 95,
          iconType: 'golden-boot',
        });
      }

      // 2. Ballon d'Or
      if (worldAwardsData.ballonDor?.[0]?.isUserPlayer || worldAwardsData.ballonDor?.[0]?.name === player.name) {
        awardsWonThisSeason.push("Ballon d'Or");
        trophyItemsToAward.push({
          name: "Ballon d'Or",
          category: 'individual',
          year: seasonYear,
          prestige: 100,
          iconType: 'ballon-dor',
        });
      }

      // 3. Golden Boy
      if (worldAwardsData.goldenBoy?.[0]?.isUserPlayer || worldAwardsData.goldenBoy?.[0]?.name === player.name) {
        awardsWonThisSeason.push('Golden Boy Award');
        trophyItemsToAward.push({
          name: 'Golden Boy Award',
          category: 'individual',
          year: seasonYear,
          prestige: 85,
          iconType: 'best-player',
        });
      }

      // 4. Domestic Golden Boot / Pichichi / Capocannoniere
      if (worldAwardsData.domesticAwards?.topScorerWinner?.isPlayer || worldAwardsData.domesticAwards?.topScorerWinner?.playerName === player.name) {
        awardsWonThisSeason.push(worldAwardsData.domesticAwards.domesticTopScorerTrophyName);
        trophyItemsToAward.push({
          name: worldAwardsData.domesticAwards.domesticTopScorerTrophyName,
          category: 'individual',
          year: seasonYear,
          prestige: 85,
          iconType: 'golden-boot',
        });
      }

      // 5. Domestic Playmaker
      if (worldAwardsData.domesticAwards?.topAssistsWinner?.isPlayer || worldAwardsData.domesticAwards?.topAssistsWinner?.playerName === player.name) {
        awardsWonThisSeason.push(`${youthLeagueName} Top Playmaker`);
        trophyItemsToAward.push({
          name: `${youthLeagueName} Top Playmaker`,
          category: 'individual',
          year: seasonYear,
          prestige: 80,
          iconType: 'best-player',
        });
      }

      // 6. Domestic MVP / Player of the Season
      if (worldAwardsData.domesticAwards?.bestPlayerWinner?.isPlayer || worldAwardsData.domesticAwards?.bestPlayerWinner?.playerName === player.name) {
        awardsWonThisSeason.push(`${youthLeagueName} Player of the Season (MVP)`);
        trophyItemsToAward.push({
          name: `${youthLeagueName} Player of the Season (MVP)`,
          category: 'individual',
          year: seasonYear,
          prestige: 90,
          iconType: 'best-player',
        });
      }

      // 7. Domestic Best Young Player (U21)
      if (worldAwardsData.domesticAwards?.bestYoungPlayerWinner?.isPlayer || worldAwardsData.domesticAwards?.bestYoungPlayerWinner?.playerName === player.name) {
        awardsWonThisSeason.push(`${youthLeagueName} Young Player of the Year`);
        trophyItemsToAward.push({
          name: `${youthLeagueName} Young Player of the Year`,
          category: 'individual',
          year: seasonYear,
          prestige: 85,
          iconType: 'best-player',
        });
      }

      // 8. League Best XI Selection
      const inLeagueBestXI = worldAwardsData.domesticAwards?.leagueBestXI?.allEleven?.some((cand) => cand.isUserPlayer || cand.name === player.name);
      if (inLeagueBestXI) {
        awardsWonThisSeason.push(`${youthLeagueName} Team of the Season (Best XI)`);
        trophyItemsToAward.push({
          name: `${youthLeagueName} Team of the Season (Best XI)`,
          category: 'individual',
          year: seasonYear,
          prestige: 85,
          iconType: 'best-player',
        });
      }

      // 9. FIFPRO World XI Selection
      const inWorldXI = worldAwardsData.worldXI?.allEleven?.some((cand) => cand.isUserPlayer || cand.name === player.name);
      if (inWorldXI) {
        awardsWonThisSeason.push('FIFPRO World XI');
        trophyItemsToAward.push({
          name: 'FIFPRO World XI Selection',
          category: 'individual',
          year: seasonYear,
          prestige: 95,
          iconType: 'best-player',
        });
      }
    } else {
      // Youth League Awards - Simple Qualification Checks (15+ Goals, 15+ Assists, 7.5+ Avg Rating)
      const qualifiedTopScorer = goalsCount >= 15 || Boolean(seasonAwards?.topScorer);
      const qualifiedTopAssist = assistsCount >= 15 || Boolean(seasonAwards?.topAssist);
      const qualifiedMvp = combinedAvgRating >= 7.5 || Boolean(seasonAwards?.bestPlayer);

      if (qualifiedTopScorer) {
        awardsWonThisSeason.push('Top Goalscorer');
        trophyItemsToAward.push({
          name: `${youthLeagueName} Top Goalscorer`,
          category: 'individual',
          year: seasonYear,
          prestige: 80,
          iconType: 'golden-boot',
        });
      }
      if (qualifiedTopAssist) {
        awardsWonThisSeason.push('Top Assist Provider');
        trophyItemsToAward.push({
          name: `${youthLeagueName} Top Assist Provider`,
          category: 'individual',
          year: seasonYear,
          prestige: 75,
          iconType: 'best-player',
        });
      }
      if (qualifiedMvp) {
        awardsWonThisSeason.push('Player of the Season (MVP)');
        trophyItemsToAward.push({
          name: `${youthLeagueName} Player of the Season (MVP)`,
          category: 'individual',
          year: seasonYear,
          prestige: 85,
          iconType: 'best-player',
        });
      }

      // Feat Nickname: Wonderkid (Awarded for being International Youth Cup MVP)
      if (tournamentResult?.awards?.bestPlayer && checkGoldenBoyFeat(candidateWithAcademy, true)) {
        setFeatNicknameForModal(FEAT_NICKNAMES.golden_boy);
        setShowNicknameModal(true);
      }
    }

    if (trophyItemsToAward.length > 0) {
      candidateWithAcademy = awardTrophiesToPlayer(candidateWithAcademy, trophyItemsToAward);
    }

    const totalMinutesPlayed = (block1Stats?.minutesPlayed || 0) + (block2Stats?.minutesPlayed || 0);
    const totalMvpsCount = (block1Stats?.mvps || 0) + (block2Stats?.mvps || 0);
    const allMatchesList = [...(block1MatchList || []), ...(block2MatchList || [])];

    const leaderboards = calculateGoalAndAssistLeaderboards(
      player,
      goalsCount,
      assistsCount,
      isPro,
      youthLeagueName,
      seasonYear
    );

    const competitionsBreakdown = buildSeasonCompetitionBreakdown(
      player,
      allMatchesList,
      tournamentMatches,
      playerStanding,
      youthLeagueName,
      seasonAwards,
      Boolean(tournamentResult?.awards?.winner)
    );

    const standingsSummary = buildSeasonTeamStandingsSummary(
      player,
      playerStanding as any,
      youthLeagueName,
      tournamentResult?.awards?.winner ? 'Champions 🏆' : tournamentResult ? 'Knockout Round' : null,
      trophiesWonThisSeason.some((t) => t.includes('Cup'))
    );

    const newSeasonRecord: CareerSeasonRecord = {
      seasonYear,
      age,
      teamName: player.club || 'Youth Academy',
      squadLevel: isPro ? (player.squadDestination || 'First Team') : (age <= 14 ? 'Youth' : 'U17'),
      competitionName: youthLeagueName,
      isYouth: !isPro,
      matches: matchesCount,
      minutesPlayed: totalMinutesPlayed,
      goals: goalsCount,
      assists: assistsCount,
      mvps: totalMvpsCount,
      avgRating: combinedAvgRating,
      topScorerRank: leaderboards.playerGoalRank,
      topAssistRank: leaderboards.playerAssistRank,
      competitions: competitionsBreakdown,
      standingsSummary: standingsSummary,
      trophiesWon: trophiesWonThisSeason,
      awardsWon: awardsWonThisSeason,
      salaryAnnual: accounting?.yearlySalary || (isPro ? 45000 : 1200),
      sponsorsIncome: (accounting?.sponsors || [])
        .filter((s) => s.active !== false)
        .reduce((sum, s) => sum + (s.yearlyPayment || 0), 0),
      ovrStart: player.ovr || 70,
      ovrEnd: nextPlayer.ovr || player.ovr || 70,
      standingRank: playerStanding?.rank || 1,
      promoted: Boolean(playerStanding?.promoted),
      relegated: Boolean(playerStanding?.relegated),
      qualificationOutcome: playerStanding?.qualificationBadge?.label || (playerStanding?.rank === 1 ? 'Champion' : 'Mid-Table'),
      statsGained: [
        `+${TRAINING_GROUPS.find((g) => g.id === selectedTrainingGroup)?.name || 'Preseason Training'}`,
        `+${devResult.points} Dev PTS`,
      ],
      keyHighlight: playerStanding?.rank === 1
        ? `Crowned Champion of ${youthLeagueName}!`
        : `Completed competitive campaign with ${player.club}.`,
    };

    const existingSeasons = candidateWithAcademy.careerHistory?.seasonsPlayed || [];
    const updatedSeasons = [
      ...existingSeasons.filter((s) => s.age !== age),
      newSeasonRecord,
    ].sort((a, b) => a.age - b.age);

    const updatedCareerHistory: FullCareerHistory = {
      ...(candidateWithAcademy.careerHistory || compileFullCareerHistory(candidateWithAcademy)),
      seasonsPlayed: updatedSeasons,
    };

    // Evaluate "Iron Body" perk: Played every match of the season without missing a game
    const ironBodyCheck = checkAndGrantIronBodyPerk(
      candidateWithAcademy,
      block1MatchList || [],
      block2MatchList || []
    );
    const candidatePlayer = ironBodyCheck.granted ? (ironBodyCheck.updatedPlayer as PlayerConfig) : candidateWithAcademy;

    if (ironBodyCheck.granted && ironBodyCheck.perk) {
      if (onTriggerPerkUnlock) {
        onTriggerPerkUnlock(ironBodyCheck.perk);
      }
    } else {
      const milestonePerk = checkCareerPerkMilestones(candidatePlayer, {
        goalsThisSeason: (block1Stats?.goals || 0) + (block2Stats?.goals || 0),
        assistsThisSeason: (block1Stats?.assists || 0) + (block2Stats?.assists || 0),
        avgRating: (block1Stats && block2Stats) ? ((block1Stats.matchRatingAvg + block2Stats.matchRatingAvg) / 2) : 7.0,
        matchesPlayed: (block1MatchList?.length || 0) + (block2MatchList?.length || 0),
        netWorth: accounting?.totalSavings,
        liquidSavings: accounting?.totalSavings,
        agentNetwork: manager?.network,
      });
      if (milestonePerk && onTriggerPerkUnlock) {
        onTriggerPerkUnlock(milestonePerk);
      }
    }

    // 1. Preseason Upgrades (e.g. Complete Football Performance Complex +5 Free Stat Points, Home Gym, Pro Kitchen)
    const upgResult = applyPreseasonUpgrades(candidatePlayer, storeItems || []);
    let postUpgradePlayer = upgResult.updatedPlayer as PlayerConfig;

    // 2. Physical Regression for Age 33+ (-3 Pace, Stamina, Strength per year)
    const hasPerfCenter = Boolean(
      postUpgradePlayer.bonusRetirementYears ||
      storeItems?.some((i) => i.id === 'upg_perf_center' && i.unlocked)
    );
    const regressionResult = applyAgePhysicalRegression(postUpgradePlayer, newAge, hasPerfCenter);
    postUpgradePlayer = regressionResult.updatedPlayer as PlayerConfig;

    // 3. Career Lifecycle Milestones (Ages 20, 28, 33)
    if (newAge === 20) {
      setLifecycleMilestoneData({ type: 'age_20', age: 20 });
    } else if (newAge === 28) {
      setLifecycleMilestoneData({ type: 'age_28', age: 28 });
    } else if (newAge === 33) {
      setLifecycleMilestoneData({ type: 'age_33', age: 33 });
    }

    // 4. Financial Preseason Settlement & Contract Expiration Progression
    const isProPlayer = isProfessionalPlayer(candidatePlayer);
    const prevContractYears = isProPlayer ? (accounting?.contractYears ?? 3) : (accounting?.contractYears ?? 3);
    const remainingYears = isProPlayer ? Math.max(0, prevContractYears - 1) : prevContractYears;
    const isNowFreeAgent = isProPlayer && remainingYears === 0;

    // Check proactive season offers (renewal + transfer market offers)
    let proactiveOffers: UnifiedClubOffer[] = [];
    if (isProPlayer) {
      proactiveOffers = generateProactiveSeasonOffers(candidatePlayer, accounting, manager);
      if (proactiveOffers.length > 0) {
        setUnifiedOffers(proactiveOffers);
      }
    }

    let finalNextPlayer: PlayerConfig = {
      ...postUpgradePlayer,
      league: isNowFreeAgent ? 'Free Agent Pool' : nextLeague,
      leagueTier: isNowFreeAgent ? 1 : nextLeagueTier,
      club: isNowFreeAgent ? 'Free Agent' : postUpgradePlayer.club,
      isFreeAgent: isNowFreeAgent,
      contractYearsRemaining: remainingYears,
      careerHistory: updatedCareerHistory,
      lastSimulatedMatches: [],
    };

    let updatedAccountingState: AccountingState | undefined = undefined;

    if (accounting && onUpdateAccounting) {
      const yearlySalary = isNowFreeAgent ? 0 : (accounting.yearlySalary || (isProPlayer ? 45000 : 0));
      const sponsorsIncome = (accounting.sponsors || [])
        .filter((s) => s.active !== false)
        .reduce((sum, s) => sum + (s.yearlyPayment || 0), 0);
      const businessesProfit = (accounting.businesses || [])
        .reduce((sum, b) => sum + (b.netProfit || 0), 0);
      const totalPreseasonEarnings = yearlySalary + sponsorsIncome + businessesProfit;
      const currentSavings = accounting.totalSavings ?? 0;
      const newSavings = currentSavings + totalPreseasonEarnings;

      updatedAccountingState = {
        ...accounting,
        totalSavings: newSavings,
        contractYears: remainingYears,
        transferStatus: isNowFreeAgent ? 'free_agent' : (remainingYears === 1 ? 'approached' : 'not_listed'),
        yearlySalary: isNowFreeAgent ? 0 : (accounting.yearlySalary || (isProPlayer ? 45000 : 0)),
      };

      if (showToast) {
        if (isNowFreeAgent) {
          if (proactiveOffers.length > 0) {
            showToast(
              `⚠️ CONTRACT EXPIRED! Your club or market suitors have presented contract offers. Review your options before entering Free Agency!`
            );
          } else {
            showToast(
              `⚠️ CONTRACT EXPIRED! Your contract has expired and you are now a Free Agent! Check the Agent Menu to sign with a new club.`
            );
          }
        } else if (remainingYears === 1 && isProPlayer) {
          showToast(
            `⚠️ FINAL CONTRACT YEAR! 1 year remaining on your deal. Renewal offer and transfer approaches are available for review!`
          );
        } else if (totalPreseasonEarnings > 0) {
          showToast(
            `💰 Pre-Season Payout: +€${totalPreseasonEarnings.toLocaleString()} (Salary: €${yearlySalary.toLocaleString()}) added to your savings!`
          );
        }
      }
    }

    // 5. SEASON RESET & MEMORY OPTIMIZATION PIPELINE
    // Save permanent history -> Purge temporary match data -> Clear engine caches -> Reinitialize authoritative squads -> Start clean new season
    savePermanentPlayerCareerRecord(finalNextPlayer.id || 'user_player', newSeasonRecord);
    const nextSeasonYear = `${2026 + (newAge - 10)}/${2027 + (newAge - 10)}`;
    const transitionResult = executeSeasonTransitionAndCleanup({
      completedSeasonYear: seasonYear,
      newSeasonYear: nextSeasonYear,
      player: finalNextPlayer,
      accounting: updatedAccountingState || accounting,
      seasonRecord: newSeasonRecord,
    });

    finalNextPlayer = transitionResult.updatedPlayer;

    // 6. Award Champion Coins for Season Summary Performance Grade
    const seasonGrade = evaluateSeasonSummaryGrade(finalNextPlayer);
    const coinsAwarded = seasonGrade.championCoins || 1;
    finalNextPlayer = {
      ...finalNextPlayer,
      championCoins: (finalNextPlayer.championCoins || 10) + coinsAwarded,
    };
    if (showToast) {
      showToast(`🌟 Draw Star Season Grade: ${seasonGrade.grade}! Awarded +${coinsAwarded} Champion Coins 🪙`);
    }

    onUpdatePlayer(finalNextPlayer);
    if (updatedAccountingState && onUpdateAccounting) {
      onUpdateAccounting(updatedAccountingState);
    }

    // Automatically present offers modal if contract is expiring or in final year, or if marquee special club offers exist
    const hasSpecialProactiveOffers = proactiveOffers.some((o) => o.isSaudiMegaOffer || o.id.startsWith('special_offer_'));
    if (isProPlayer && proactiveOffers.length > 0 && (remainingYears <= 1 || hasSpecialProactiveOffers)) {
      setShowUnifiedOffersModal(true);
      if (hasSpecialProactiveOffers && showToast) {
        showToast('👑 ELITE SIGNING SUMMIT: Superpower clubs (Big 3, PSG, Big 6, or Saudi) have placed bids for your signature!');
      }
    }

    // Automatically replenish store inventory at preseason
    if (onUpdateStoreItems) {
      const replenished = generatePreSeasonStoreReplenishment(storeItems);
      onUpdateStoreItems(replenished);
    }

    // Automatically persist full season completion state once
    if (onSeasonCompleted) {
      onSeasonCompleted(finalNextPlayer, updatedAccountingState || accounting);
    }

    // Reset local season state & temporary simulation objects
    setBlock1Stats(null);
    setBlock2Stats(null);
    setBlock1MatchList([]);
    setBlock2MatchList([]);
    setPendingBlockMatches([]);
    setDisplayedBlockMatches([]);
    setTournamentMatches([]);
    setDrawnCards([]);
    setSelectedCardId(null);
    setSeasonAwards(null);
    setNewspaper(null);
    setTournamentResult(null);
    setYouthStandings(null);
    setSisterDivisionStandings(null);
    setPlayerStanding(null);
    setIsQualifiedForIntCup(false);
    setIntCupData(null);
    setCupClubsForDraw([]);
    setActiveIntCallUp(null);
    setIntQualifierSummary(null);
    setIntWorldCupSummary(null);
    setPendingContinentalDraw(null);
    setCurrentStage('hub');

    if (isPro) {
      return;
    }

    // Record youth training foreign countries for earned dual nationality at age 18
    const currentClubCountry = finalNextPlayer.clubCountry || finalNextPlayer.nationality?.name || finalNextPlayer.country || '';
    let youthCountries = [...(finalNextPlayer.youthTrainedCountries || [])];
    if (currentClubCountry && !youthCountries.includes(currentClubCountry)) {
      youthCountries.push(currentClubCountry);
    }
    finalNextPlayer = {
      ...finalNextPlayer,
      youthTrainedCountries: youthCountries,
    };

    // Age 18 check: grant earned nationalities for foreign youth development
    if (newAge >= 18) {
      const natCheck = checkAndGrantYouthEarnedNationalities(finalNextPlayer as any);
      if (natCheck.newlyEarned.length > 0) {
        finalNextPlayer = natCheck.updatedPlayer as PlayerConfig;
        onUpdatePlayer(finalNextPlayer);
        natCheck.messages.forEach((msg) => {
          if (showToast) showToast(msg);
        });
      }
    }

    // 1. AGE 17: YOUTH LEAGUE GRADUATION EVENT (Mandatory & Authoritative)
    // Turning 17 concludes the Youth League. Triggers comprehensive career summary and transition out of youth.
    if (newAge >= 17) {
      finalNextPlayer = cleanseBiggerYouthClubPenalties(finalNextPlayer);
      onUpdatePlayer(finalNextPlayer);
      setShowAge16FarewellModal(true);
      return;
    }

    // 2. AGE 16: FIRST PROFESSIONAL CONTRACT OFFERS & INTEREST
    // Turning 16 does NOT automatically remove the player from the Youth League.
    // The player may receive professional offers. They can review, accept, or reject them.
    // If rejected, they remain registered with their Youth League club until turning 17!
    if (newAge === 16) {
      // 2a. Hot Prospect Check (OVR >= 85, Effective Fame > 200)
      if (shouldTriggerHotProspectEvent(finalNextPlayer, manager)) {
        setShowHotProspectModal(true);
        return;
      }

      // 2b. Premier League Special Interest Check (OVR 76-84, Effective Fame > 200)
      if (shouldTriggerPremierLeagueEvent(finalNextPlayer, manager)) {
        setShowPremierLeagueModal(true);
        return;
      }

      // 2c. Authoritative Age 16 Categorized Professional Transfer Offers (Local, Money, Dev, Glory)
      const offers = generateAge16TransferOffers(finalNextPlayer, manager);
      if (offers.length > 0) {
        setAge16Offers(offers);
        setShowAge16OffersModal(true);
        return;
      }

      // If player has Effective Fame <= 100 or no offers generated, they remain in their Youth League club!
      return;
    }

    // 3. UNDER AGE 16:
    // Youth League recruitment scan for early exceptional interest
    const scanOffers = runProfessionalRecruitmentScan(finalNextPlayer);
    if (scanOffers.length > 0) {
      onTriggerFirstContract(scanOffers);
    }
  };

  const compTheme = useMemo(() => {
    return getActiveCompetitionThemeForPlayer(
      player,
      getCareerLeagueDatabase(),
      'Youth League'
    );
  }, [
    player?.league,
    player?.club,
    player?.startingCity,
    player?.countryCode,
    player?.clubCountry,
    player?.nationality,
    player?.isProfessional
  ]);

  // Check if all competitions for this season are complete (both blocks simulated, no pending active tournament)
  const isSeasonComplete = Boolean(
    block1Stats &&
    block2Stats &&
    !activeIntCallUp &&
    !nationalTournamentState &&
    activeSimulatingBlock === null &&
    (currentStage === 'hub' || currentStage === 'summary')
  );

  // International tournament call-up that replaces the Proceed to Mid-Season / Season Conclusion button
  // U17 World Cup plays in December (mid_season, replacing Proceed to Mid-Season Stop)
  // U20 and Senior World Cups play in July (end_season, replacing Proceed to Season Conclusion after winter block)
  const scheduledTournamentCallUp = useMemo(() => {
    if (!simulationComplete || activeSimulatingBlock === null) return null;
    const cYear = parseInt(seasonYear.split('/')[0]) || 2026;
    const isPro = isProfessionalPlayer(player);
    const prefConfed: 'UEFA' | 'CONMEBOL' = isSouthAmericanContext(player, getCareerLeagueDatabase()) ? 'CONMEBOL' : 'UEFA';
    const timing = activeSimulatingBlock === 1 ? 'mid_season' : 'end_season';
    const scheduledComps = getScheduledInternationalCompetitions(
      cYear,
      player.age || 16,
      isPro,
      timing,
      prefConfed
    );
    for (const scheduledComp of scheduledComps) {
      if (!isInternationalEventCompleted(player, scheduledComp.tier, scheduledComp.type, cYear)) {
        const evalRes = evaluateNationalTeamCallUp(player as PlayerCardData, scheduledComp);
        if (evalRes.isEligible && evalRes.callUp) {
          return evalRes.callUp;
        }
      }
    }
    return null;
  }, [simulationComplete, activeSimulatingBlock, seasonYear, player]);

  // Memoized available draw for CareerHub with strict safety qualification logic
  const hubAvailableDraw = useMemo(() => {
    const cYear = parseInt(seasonYear.split('/')[0]) || 2026;
    const isPro = isProfessionalPlayer(player);

    // 1. Continental Draw (e.g. Champions League / Libertadores / International Youth League)
    // Only if taking place in current calendar phase AND player's club is actually participating!
    if (isPro) {
      const { tournamentState, playerClubInTournament } = getOrInitContinentalStateForSeason(player, cYear);
      if (tournamentState && playerClubInTournament && !tournamentState.isDrawCompleted) {
        const compNames: Record<string, string> = {
          uefa_champions_league: 'Champions League',
          uefa_europa_league: 'Europa League',
          uefa_conference_league: 'Conference League',
          copa_libertadores: 'Copa Libertadores',
          copa_sudamericana: 'Copa Sudamericana',
        };
        const compName = compNames[tournamentState.competitionId] || 'Continental Cup';
        return {
          competitionName: compName,
          shortName: compName.replace(/Tournament|Championship|Cup/gi, '').trim(),
          isImportant: false,
          onOpenDraw: () => {
            setPendingContinentalDraw(tournamentState);
            setShowContinentalDrawModal(true);
          },
        };
      }
    } else {
      // Youth Career: International Youth League / Youth Cup Draw
      if (isQualifiedForIntCup && cupClubsForDraw && cupClubsForDraw.length > 0) {
        return {
          competitionName: 'International Youth League',
          shortName: 'Youth League',
          isImportant: false,
          onOpenDraw: () => {
            handlePlayTournament();
          },
        };
      }
    }

    // 2. National Team Tournament / Qualifiers Draw
    // A draw action button may ONLY appear if:
    // - The competition is actually taking place in the current calendar phase, AND
    // - The player, their club, or their national team is genuinely qualified to participate.
    const blockIndex = currentStage === 'block2' ? 2 : 1;
    const prefConfed: 'UEFA' | 'CONMEBOL' = isSouthAmericanContext(player, getCareerLeagueDatabase()) ? 'CONMEBOL' : 'UEFA';
    const scheduledComp = getScheduledInternationalCompetition(
      cYear,
      player.age || 16,
      isPro,
      currentStage === 'block2' ? 'end_season' : 'mid_season',
      prefConfed
    );

    if (scheduledComp && !isInternationalEventCompleted(player, scheduledComp.tier, scheduledComp.type, cYear)) {
      // Safety check: Is this U17 World Trophy?
      if (scheduledComp.tier === 'U17') {
        // "U17 World Trophy draw if the player has been called up."
        const hasU17CallUp = Boolean(
          activeIntCallUp?.competitionName?.includes('U17') ||
          (player as any).u17CallUpAccepted
        );
        if (hasU17CallUp) {
          const duty = checkSeasonInternationalDuty(player, blockIndex, cYear);
          if (duty.drawState) {
            return {
              competitionName: scheduledComp.competitionName,
              shortName: scheduledComp.shortName,
              isImportant: true,
              onOpenDraw: () => {
                setPendingNationalTeamDraw(duty.drawState);
                setShowNationalTeamDrawModal(true);
              },
            };
          }
        }
      } else if (scheduledComp.tier === 'Senior') {
        // "World Trophy draw if the player's national team is qualified."
        // STRICT SAFETY LOGIC: Check isNationQualifiedForTournament!
        const playerNationCode = player.nationality?.code || player.countryCode || 'ENG';
        const isQualified = isNationQualifiedForTournament(playerNationCode, scheduledComp.competitionName, scheduledComp.tier);

        if (isQualified) {
          const duty = checkSeasonInternationalDuty(player, blockIndex, cYear);
          if (duty.drawState) {
            return {
              competitionName: scheduledComp.competitionName,
              shortName: scheduledComp.shortName,
              isImportant: true,
              onOpenDraw: () => {
                setPendingNationalTeamDraw(duty.drawState);
                setShowNationalTeamDrawModal(true);
              },
            };
          }
        }
        // If NOT qualified: DO NOT SHOW DRAW BUTTON!
      } else if (scheduledComp.tier === 'U20') {
        // U20 tournament / qualifiers: only if called up or nation qualified
        const playerNationCode = player.nationality?.code || player.countryCode || 'ENG';
        const isQualified = isNationQualifiedForTournament(playerNationCode, scheduledComp.competitionName, scheduledComp.tier);
        const isCalledUp = Boolean(activeIntCallUp?.competitionName?.includes('U20'));
        if (isCalledUp || isQualified) {
          const duty = checkSeasonInternationalDuty(player, blockIndex, cYear);
          if (duty.drawState) {
            return {
              competitionName: scheduledComp.competitionName,
              shortName: scheduledComp.shortName,
              isImportant: false,
              onOpenDraw: () => {
                setPendingNationalTeamDraw(duty.drawState);
                setShowNationalTeamDrawModal(true);
              },
            };
          }
        }
      }
    }

    // Fallback: if pendingNationalTeamDraw is already set and validated
    if (pendingNationalTeamDraw) {
      const isSenior = pendingNationalTeamDraw.tier === 'Senior' || /world trophy|euro|copa am/i.test(pendingNationalTeamDraw.competitionName);
      const playerNationCode = player.nationality?.code || player.countryCode || 'ENG';
      const isQualified = !isSenior || isNationQualifiedForTournament(playerNationCode, pendingNationalTeamDraw.competitionName, 'Senior');

      if (isQualified) {
        return {
          competitionName: pendingNationalTeamDraw.competitionName,
          shortName: pendingNationalTeamDraw.competitionName.replace(/Tournament|Cup|Trophy/gi, '').trim(),
          isImportant: true,
          onOpenDraw: () => {
            setShowNationalTeamDrawModal(true);
          },
        };
      }
    }

    // Fallback: if pendingContinentalDraw is already set and validated
    if (pendingContinentalDraw) {
      const playerClubInDraw =
        (pendingContinentalDraw.qualifiers || []).some((q: any) => q.teamId === player.clubId) ||
        (pendingContinentalDraw.groups || []).some((g: any) => g.teams?.some((t: any) => t.teamId === player.clubId));

      if (playerClubInDraw) {
        const compNames: Record<string, string> = {
          uefa_champions_league: 'Champions League',
          uefa_europa_league: 'Europa League',
          uefa_conference_league: 'Conference League',
          copa_libertadores: 'Copa Libertadores',
          copa_sudamericana: 'Copa Sudamericana',
        };
        const compName = compNames[pendingContinentalDraw.competitionId] || 'Continental Cup';
        return {
          competitionName: compName,
          shortName: compName.replace(/Tournament|Cup|Trophy/gi, '').trim(),
          isImportant: false,
          onOpenDraw: () => {
            setShowContinentalDrawModal(true);
          },
        };
      }
    }

    return null;
  }, [
    seasonYear,
    player?.club,
    player?.league,
    player?.isProfessional,
    player?.age,
    player?.nationality?.code,
    player?.countryCode,
    currentStage,
    isQualifiedForIntCup,
    cupClubsForDraw,
    activeIntCallUp,
    pendingNationalTeamDraw,
    pendingContinentalDraw,
  ]);

  const contentJSX = (
    <div
      className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-7xl w-full shadow-2xl space-y-6 my-auto text-left relative overflow-hidden transition-all duration-300 ${
        embedded ? '' : 'max-h-[96vh] overflow-y-auto pb-24 sm:pb-8'
      }`}
      style={{
        backgroundImage: compTheme.theme.backgroundCss,
        borderColor: `${compTheme.branding.primaryHex}60`,
        boxShadow: `0 0 35px ${compTheme.branding.primaryHex}25`,
      }}
    >
      {/* Ambient Glows */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ backgroundColor: compTheme.branding.primaryHex }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ backgroundColor: compTheme.branding.accentHex }}
      />

      {currentStage !== 'summary' && (currentStage === 'hub' || currentStage === 'block2' || isSeasonComplete || activeSimulatingBlock !== null) ? (
        <CareerHub
          player={player as PlayerCardData}
          accounting={accounting}
          storeItems={storeItems}
          manager={manager}
          seasonYear={seasonYear}
          currentStage={currentStage}
          isSimulatingMatches={isSimulatingMatches}
          isSeasonComplete={isSeasonComplete}
          activeSimulatingBlock={activeSimulatingBlock}
          simulationSpeed={simulationSpeed}
          isPaused={isPaused}
          simulationComplete={simulationComplete}
          displayedMatchesCount={displayedBlockMatches.length}
          totalBlockMatchesCount={pendingBlockMatches.length || 9}
          onTogglePauseSimulation={() => setIsPaused((prev) => !prev)}
          onChangeSimulationSpeed={handleUpdateSpeed}
          onInstantSimulateAll={() => {
            setDisplayedBlockMatches(pendingBlockMatches);
            setSimulationComplete(true);
            setIsSimulatingMatches(false);
          }}
          onFinishBlockSimulation={activeSimulatingBlock === 1 ? handleFinishBlock1Simulation : handleFinishBlock2Simulation}
          scheduledTournamentCallUp={scheduledTournamentCallUp}
          onStartScheduledTournament={() => scheduledTournamentCallUp && handleStartScheduledTournament(scheduledTournamentCallUp)}
          onSkipScheduledTournament={() => scheduledTournamentCallUp && handleSkipScheduledTournament(scheduledTournamentCallUp)}
          onOpenAgent={() => setShowAgentOfferModal(true)}
          onMainSimulationAction={() => {
            if (isSeasonComplete) {
              setCurrentStage('summary');
              if (isProfessionalPlayer(player)) {
                setShowSeasonSummaryModal(true);
              }
            } else if (nationalTournamentState || activeIntCallUp) {
              setCurrentStage('national_tournament');
            } else if (!isProfessionalPlayer(player) && isQualifiedForIntCup && block2Stats) {
              handlePlayTournament();
            } else if (currentStage === 'block2') {
              handleSimulateBlock2();
            } else {
              handleSimulateBlock1();
            }
          }}
          mainActionOverrideTitle={
            isSeasonComplete
              ? 'PROCEED TO SEASON SUMMARY'
              : (nationalTournamentState || activeIntCallUp)
              ? `PROCEED TO ${(nationalTournamentState?.config.competitionName || activeIntCallUp?.competitionName || 'INTERNATIONAL TOURNAMENT').toUpperCase()}`
              : (!isProfessionalPlayer(player) && isQualifiedForIntCup && block2Stats)
              ? 'PROCEED TO INTERNATIONAL YOUTH CUP'
              : undefined
          }
          mainActionOverrideSubtitle={
            isSeasonComplete
              ? 'FINAL STANDINGS, COMPILATION & AWARDS • SEASON COMPLETE'
              : (nationalTournamentState || activeIntCallUp)
              ? 'INTERNATIONAL CALL-UP ACTIVE • TOURNAMENT FIXTURES'
              : (!isProfessionalPlayer(player) && isQualifiedForIntCup && block2Stats)
              ? '32-TEAM ELITE ACADEMY TOURNAMENT'
              : undefined
          }
          availableDraw={hubAvailableDraw}
          hasYearlyAwardsAvailable={Boolean(isProfessionalPlayer(player) && currentStage === 'block2' && !worldAwardsRevealed)}
          onOpenYearlyAwards={() => setShowAwardsCeremonyModal(true)}
          onOpenWorldResults={() => setIsWorldResultsOpen(true)}
          onOpenSaveSlots={() => {
            if (onOpenMenu) onOpenMenu();
          }}
          onExitToMainMenu={() => onClose()}
          onSkipSeason={handleSkipSeason}
          onOpenStore={() => {
            if (onOpenStore) onOpenStore();
          }}
          onOpenCard={() => {
            if (onOpenCard) onOpenCard();
          }}
          onOpenDevelopment={() => {
            if (onOpenDevelopment) onOpenDevelopment();
          }}
          onOpenCustomization={() => {
            if (onOpenCustomization) onOpenCustomization();
          }}
          onOpenMenu={() => {
            if (onOpenMenu) onOpenMenu();
          }}
          onOpenTransfer={() => {
            if (onOpenTransfer) {
              onOpenTransfer();
            } else {
              let offers = unifiedOffers;
              if (offers.length === 0 && !specialOpportunityOffer) {
                offers = generateProactiveSeasonOffers(player, accounting, manager);
                setUnifiedOffers(offers);
              }
              setShowUnifiedOffersModal(true);
            }
          }}
          onRecoverFitness={() => {
            const currRecovPoints = player.recoveryPoints || 0;
            const currSupplements = player.recoverySupplements || 0;
            if (currRecovPoints > 0) {
              const updated = {
                ...player,
                recoveryPoints: currRecovPoints - 1,
                fitness: Math.min(100, (player.fitness || 80) + 15),
                staminaCurrent: Math.min(100, (player.staminaCurrent || 80) + 15),
              };
              onUpdatePlayer(updated as PlayerConfig);
              if (showToast) showToast('Applied 1 Physical Recovery Point! (+15 Fitness)');
            } else if (currSupplements > 0) {
              const updated = {
                ...player,
                recoverySupplements: currSupplements - 1,
                fitness: Math.min(100, (player.fitness || 80) + 20),
                staminaCurrent: Math.min(100, (player.staminaCurrent || 80) + 20),
              };
              onUpdatePlayer(updated as PlayerConfig);
              if (showToast) showToast('Applied 1 Recovery Supplement! (+20 Fitness)');
            }
          }}
          onAssignStatPoints={() => {
            if (onOpenDevelopment) onOpenDevelopment();
          }}
          onResumeTournament={() => setCurrentStage('national_tournament')}
          recentMatches={currentSeasonMatches}
          regularOffersCount={Math.min(4, unifiedOffers.length)}
          hasSpecialContractNotification={Boolean(specialOpportunityOffer)}
          specialContractLabel={specialOpportunityOffer ? (specialOpportunityOffer.buyerClub?.clubName || 'SPECIAL BID') : undefined}
          isTestMode={isTestMode}
          hasActiveTournament={Boolean(nationalTournamentState)}
          activeTournamentName={nationalTournamentState?.config.competitionName}
          onUpdatePlayer={(p) => onUpdatePlayer(p as PlayerConfig)}
          onUpdateAccounting={onUpdateAccounting}
          onUpdateStoreItems={onUpdateStoreItems}
          showToast={showToast}
        />
      ) : (
        <>
          {/* Modal Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 relative z-10">
          <div className="space-y-1">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md"
              style={{
                backgroundColor: `${compTheme.branding.primaryHex}30`,
                color: compTheme.branding.accentHex,
                borderColor: `${compTheme.branding.primaryHex}60`,
              }}
            >
              {compTheme.emblem?.url ? (
                <img src={compTheme.emblem.url} alt={compTheme.competitionName} className="w-4 h-4 object-contain" />
              ) : (
                <Trophy className="w-3.5 h-3.5" style={{ color: compTheme.branding.accentHex }} />
              )}
              {isProfessionalPlayer(player)
                ? `PRO CAREER • ${compTheme.competitionName} (AGE ${age})`
                : `YOUTH LEAGUE • ${compTheme.competitionName} (AGE ${age})`}
            </div>

            {/* Prominent Squad Level Badge */}
            {isProfessionalPlayer(player) && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-md ${
                (player.squadDestination || 'First Team') === 'U17'
                  ? 'bg-teal-500/20 text-teal-300 border-teal-400/50'
                  : (player.squadDestination || 'First Team') === 'U20'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                  : (player.squadDestination || 'First Team') === 'Reserves'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
              }`}>
                <Shield className="w-3.5 h-3.5" />
                <span>
                  {(player.squadDestination || 'First Team') === 'First Team'
                    ? '🛡️ FIRST TEAM SQUAD'
                    : (player.squadDestination || 'First Team') === 'Reserves'
                    ? '⭐ RESERVES (B-TEAM)'
                    : (player.squadDestination || 'First Team') === 'U20'
                    ? '🔥 U20 YOUTH SQUAD'
                    : '⚡ U17 ACADEMY SQUAD'}
                </span>
              </span>
            )}

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              {player.club || 'Youth Academy'} • {seasonYear}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {isProfessionalPlayer(player) ? (
                <>
                  League: <strong>{player.league || 'First Division'}</strong> ({player.clubCountry || player.countryCode || 'Domestic'}) | Squad: <strong className="text-amber-300">{player.squadDestination || 'First Team'}</strong> | Role: <strong>{player.squadRole || player.playingTimeExpectation || 'STARTER'}</strong>
                </>
              ) : (
                <>
                  City: <strong>{player.city || 'Metropolis'}</strong> | Position: <strong>{player.position}</strong> | Sub-Position: <strong>{player.subPosition}</strong> | Playstyle: <strong>{player.playStyle || 'Balanced'}</strong>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shrink-0 text-xs">
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black">
              {ovr} OVR
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-black">
              {player.potentialOvr || 78} POT
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 font-black flex items-center gap-1">
              <Star className="w-3 h-3 fill-purple-400" />
              {fame} Fame
            </div>
          </div>
        </div>

        {/* ================= NAVIGATION TABS: CURRENT SEASON VS CAREER SEASON HISTORY ================= */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMainTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeMainTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Current Season ({seasonYear})</span>
            </button>

            <button
              onClick={() => setActiveMainTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeMainTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Career Season History</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-300 border border-slate-700 font-bold">
                {Math.max(1, (player.age || 16) - 9)}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCareerModeModal(true)}
              className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1.5 cursor-pointer transition-colors px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 hover:border-amber-400/50 shadow-sm"
              title={t('Click to configure Key Match Frequency Mode (Slow, Decisive, Finals Only)')}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Mode:')} {t(CAREER_PLAY_MODES[player.keyMatchPlayMode || 'decisive'].name)}</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/30 font-semibold">{t('Change')}</span>
            </button>

            {activeMainTab === 'dashboard' && (
              <button
                onClick={() => setActiveMainTab('history')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('View History')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {activeMainTab === 'history' ? (
          <CareerSeasonHistoryView
            player={player}
            accounting={accounting}
            onBackToDashboard={() => setActiveMainTab('dashboard')}
          />
        ) : (
          <>
        {/* ================= MATCH-BY-MATCH VISUAL SIMULATION VIEW ================= */}
        {activeSimulatingBlock !== null ? (() => {
          const latestMatch = displayedBlockMatches[displayedBlockMatches.length - 1] || pendingBlockMatches[0];
          const isNatMatch = Boolean(latestMatch?.isNationalTeamMatch || latestMatch?.competitionType === 'national');
          const totalMatchesCount = pendingBlockMatches.length || 9;

          return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`border-2 pixel-corners p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
              isNatMatch
                ? 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-amber-500 pixel-bevel-gold shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 border-amber-500/60 pixel-bevel-raised'
            }`}>
              <div className="flex items-center gap-3">
                {isNatMatch && (latestMatch?.homeNationIso || latestMatch?.awayNationIso) && (
                  <img
                    src={`https://flagcdn.com/w80/${(latestMatch.isPlayerHome ? latestMatch.homeNationIso : (latestMatch.awayNationIso || 'gb-eng')).toLowerCase()}.png`}
                    alt="National Flag"
                    className="w-12 h-8 object-cover pixel-corners shadow-md border-2 border-amber-400 shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isNatMatch ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                    <h3 className={`text-base sm:text-lg font-black uppercase tracking-tight font-pixel ${isNatMatch ? 'text-amber-300 pixel-text-shadow' : 'text-white'}`}>
                      {isNatMatch
                        ? `${latestMatch.nationalCompName || 'INTERNATIONAL FIXTURE'} • ${latestMatch.nationalWindow || 'FIFA WINDOW'}`
                        : (activeSimulatingBlock === 1
                            ? `${flowConfig.firstBlock.title.toUpperCase()} (${flowConfig.firstBlock.monthsLabel.toUpperCase()})`
                            : `${flowConfig.secondBlock.title.toUpperCase()} (${flowConfig.secondBlock.monthsLabel.toUpperCase()})`)}
                    </h3>
                    <span className="px-2.5 py-0.5 pixel-corners text-[10px] font-arcade bg-amber-500/20 text-amber-300 border border-amber-500/40 pixel-bevel-sunken">
                      📅 {latestMatch?.calendarDate || getCalendarDateForMatchday(
                        activeSimulatingBlock === 1
                          ? Math.max(1, displayedBlockMatches.length * 2)
                          : Math.min(38, 18 + Math.max(1, displayedBlockMatches.length * 2)),
                        seasonYear,
                        flowConfig.region === 'south_america'
                      )}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 font-retro ${isNatMatch ? 'text-amber-200/90' : 'text-slate-300'}`}>
                    {isNatMatch ? (
                      <span>
                        Representing <strong>{player.nationality?.name || 'National Team'} ({latestMatch.nationalTier || 'Senior'})</strong> • Fixture {displayedBlockMatches.length} of {totalMatchesCount}
                      </span>
                    ) : (
                      isSimulatingMatches
                        ? `Simulating match ${displayedBlockMatches.length} of ${totalMatchesCount} (Week ${activeSimulatingBlock === 1 ? Math.max(1, displayedBlockMatches.length * 2) : 18 + Math.max(1, displayedBlockMatches.length * 2)})...`
                        : 'All matches in this segment complete!'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {isTestMode && (
                  <button
                    onClick={handleSkipSeason}
                    className="px-4 py-2.5 pixel-corners text-xs font-black text-white bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-xl shadow-red-600/40 border border-red-400 cursor-pointer flex items-center gap-1.5 uppercase tracking-wider shrink-0 transition-all font-pixel pixel-bevel-raised"
                    title="[Test Mode] Skip Season directly to Season Summary"
                  >
                    <FastForward className="w-4 h-4 fill-white" />
                    <span>SKIP SEASON</span>
                  </button>
                )}

                {simulationComplete && (
                  scheduledTournamentCallUp ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleStartScheduledTournament(scheduledTournamentCallUp)}
                        className="px-5 py-3 pixel-corners bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm pixel-bevel-gold font-pixel uppercase cursor-pointer flex items-center gap-2 shadow-xl shadow-amber-400/30 active:scale-95 transition-all"
                      >
                        <Trophy className="w-4 h-4 fill-current animate-bounce" />
                        <span>START {scheduledTournamentCallUp.competitionName.toUpperCase()} DRAW →</span>
                      </button>
                      <button
                        onClick={() => handleSkipScheduledTournament(scheduledTournamentCallUp)}
                        className="px-3.5 py-3 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs pixel-bevel-raised font-pixel uppercase cursor-pointer flex items-center gap-1.5 transition-all"
                        title="Skip and simulate tournament in background"
                      >
                        <FastForward className="w-3.5 h-3.5" />
                        <span>SKIP / SIMULATE</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={activeSimulatingBlock === 1 ? handleFinishBlock1Simulation : handleFinishBlock2Simulation}
                      className="px-6 py-3 pixel-corners text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 border-2 border-emerald-200 pixel-bevel-raised cursor-pointer flex items-center gap-2 uppercase tracking-wider shrink-0 transition-all font-pixel shadow-lg shadow-emerald-500/20"
                    >
                      <span>
                        {activeSimulatingBlock === 1
                          ? (flowConfig.region === 'south_america' ? 'PROCEED TO MID-SEASON STOP (JULY) →' : 'PROCEED TO MID-SEASON STOP (JAN) →')
                          : 'PROCEED TO SEASON CONCLUSION →'}
                      </span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* SIMULATION SPEED, PAUSE CONTROLS & CONTINUOUS FITNESS BAR */}
            <div className="bg-slate-900 border-2 border-slate-800 p-3 pixel-corners pixel-bevel-raised flex flex-wrap items-center justify-between gap-3 shadow-xl">
              {/* CURRENT FITNESS CONDITION BAR, RECOVERY & CHEMISTRY TRACKER */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* FITNESS CONDITION BAR */}
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 pixel-corners border border-slate-800 pixel-bevel-sunken shrink-0">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-black text-slate-200 font-pixel">
                    FITNESS:{' '}
                    <strong className="text-cyan-300 font-arcade text-xs sm:text-sm">
                      {getFitnessPercentage(player)}%
                    </strong>
                  </span>
                  <div className="w-14 sm:w-16 h-2.5 bg-slate-900 pixel-corners overflow-hidden border border-cyan-500/30 p-0.5">
                    <div
                      className={`h-full pixel-corners transition-all duration-300 ${
                        getFitnessPercentage(player) >= 70
                          ? 'bg-emerald-400'
                          : getFitnessPercentage(player) >= 50
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${getFitnessPercentage(player)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* SMALL RECOVERY BUTTON WHEN FITNESS < 100% */}
                {getFitnessPercentage(player) < 100 && (
                  <button
                    onClick={handleRecoverFitnessInYouth}
                    disabled={(player.recoveryPoints || 0) <= 0}
                    className={`px-2 py-1 pixel-corners text-[10px] font-black flex items-center gap-1 transition-all shrink-0 font-arcade ${
                      (player.recoveryPoints || 0) > 0
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 cursor-pointer pixel-bevel-raised active:scale-95 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-950/60 text-slate-500 border border-slate-800 cursor-not-allowed pixel-bevel-sunken opacity-60'
                    }`}
                    title={
                      (player.recoveryPoints || 0) > 0
                        ? `Use 1 Recovery Point to restore +20% Fitness (${player.recoveryPoints} available)`
                        : '0 Recovery Points remaining (Purchase more in Career Store)'
                    }
                  >
                    <Zap className={`w-3 h-3 ${(player.recoveryPoints || 0) > 0 ? 'text-cyan-400 fill-cyan-400/40 animate-pulse' : 'text-slate-500'}`} />
                    <span>+20% ({(player.recoveryPoints || 0)} RP)</span>
                  </button>
                )}

                {/* CHEMISTRY TRACKER */}
                <div
                  className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 pixel-corners border border-slate-800 pixel-bevel-sunken shrink-0"
                  title={`Team Chemistry: ${simChemInfo.chemistry}% • ${simChemInfo.statusLabel} (${simChemInfo.description})`}
                >
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-xs font-black text-slate-200 font-pixel flex items-center gap-1">
                    CHEMISTRY:{' '}
                    <strong className="text-teal-300 font-arcade text-xs sm:text-sm">
                      {simChemInfo.chemistry}%
                    </strong>
                    {simChemInfo.hasCeiling && typeof simChemInfo.ceilingPercent === 'number' && (
                      <span className="text-[9px] px-1 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded uppercase font-bold tracking-tight">
                        CAP {simChemInfo.ceilingPercent}%
                      </span>
                    )}
                  </span>
                  <div className="w-14 sm:w-16 h-2.5 bg-slate-900 pixel-corners overflow-hidden border border-teal-500/30 p-0.5 relative">
                    <div
                      className={`h-full pixel-corners transition-all duration-300 ${
                        simChemInfo.isOverflow
                          ? 'bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                          : simChemInfo.chemistry >= 80
                          ? 'bg-teal-400'
                          : simChemInfo.chemistry >= 60
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(100, simChemInfo.chemistry)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SIMULATION SPEED, PAUSE & TEST MODE SKIP CONTROLS */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* TEST MODE: SKIP SEASON BUTTON IN BRIGHT RED */}
                {isTestMode && (
                  <button
                    onClick={handleSkipSeason}
                    className="px-3.5 py-2 pixel-corners text-xs font-black bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-lg shadow-red-600/40 border border-red-400 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all shrink-0 font-pixel pixel-bevel-raised"
                    title="[Test Mode] Skip entire season directly to Season Summary"
                  >
                    <FastForward className="w-4 h-4 fill-white" />
                    <span>SKIP SEASON</span>
                  </button>
                )}

                {/* PAUSE / RESUME BUTTON */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  disabled={!isSimulatingMatches && simulationComplete}
                  className={`px-3.5 py-2 pixel-corners text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border shrink-0 font-pixel uppercase pixel-bevel-raised ${
                    isPaused
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  } disabled:opacity-50`}
                  title={isPaused ? 'Resume match simulation' : 'Pause match simulation'}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>RESUME</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 fill-slate-200" />
                      <span>PAUSE</span>
                    </>
                  )}
                </button>

                {/* SPEED SELECTION BUTTONS */}
                <div className="flex items-center bg-slate-950 p-1 pixel-corners border border-slate-800 pixel-bevel-sunken">
                  <button
                    onClick={() => handleUpdateSpeed('slow')}
                    className={`px-3 py-1.5 pixel-corners text-xs font-black flex items-center gap-1 transition-all cursor-pointer font-arcade ${
                      simulationSpeed === 'slow'
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold pixel-bevel-raised'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Slow speed (Default)"
                  >
                    <span>🐢</span>
                    <span>SLOW</span>
                  </button>

                  <button
                    onClick={() => handleUpdateSpeed('normal')}
                    className={`px-3 py-1.5 pixel-corners text-xs font-black flex items-center gap-1 transition-all cursor-pointer font-arcade ${
                      simulationSpeed === 'normal'
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold pixel-bevel-raised'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Normal speed"
                  >
                    <span>▶</span>
                    <span>NORMAL</span>
                  </button>

                  <button
                    onClick={() => handleUpdateSpeed('fast')}
                    className={`px-3 py-1.5 pixel-corners text-xs font-black flex items-center gap-1 transition-all cursor-pointer font-arcade ${
                      simulationSpeed === 'fast'
                        ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold pixel-bevel-gold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Fast speed"
                  >
                    <span>⏩</span>
                    <span>FAST</span>
                  </button>
                </div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-950 pixel-corners h-3 overflow-hidden border border-slate-800 pixel-bevel-sunken p-0.5">
              <div
                className="bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 h-full pixel-corners transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, (displayedBlockMatches.length / totalMatchesCount) * 100)}%` }}
              ></div>
            </div>

            {/* STREAM OF COMPACT MATCH RESULT CARDS - Newest games always appear at top */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {[...displayedBlockMatches].reverse().map((m) => (
                <YouthMatchCard key={m.matchId} match={m} animateIn={true} />
              ))}
            </div>
          </div>
          );
        })() : (
          <>
            {/* ================= STAGE 0: HUB ================= */}
            {(currentStage as any) === 'hub' && (
          <div className="space-y-6">
            {((player.freeStatPoints || player.unassignedPoints || 0) > 0) && (
              <div className="bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90 border-2 border-rose-500/70 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl shadow-rose-950/50 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600/40 border border-rose-300 flex items-center justify-center text-rose-200 font-black text-xl shrink-0">
                    🔴 !
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      {player.freeStatPoints || player.unassignedPoints} UNSPENT STAT POINTS
                    </h4>
                    <p className="text-xs text-rose-200/90">
                      You have unassigned stat points available. Open Development to assign them before starting the new Youth League season!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onOpenDevelopment) {
                      onOpenDevelopment();
                    } else {
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg border border-rose-300 shrink-0 cursor-pointer transition-all hover:scale-105"
                >
                  Open Development
                </button>
              </div>
            )}

            {/* ACTIVE NATIONAL TOURNAMENT IN-PROGRESS BANNER */}
            {nationalTournamentState && (
              <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl border border-amber-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950/20 border border-slate-950/30 flex items-center justify-center text-slate-950 shrink-0">
                    <Trophy className="w-6 h-6 fill-current animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      {nationalTournamentState.config.competitionName} ACTIVE
                    </h4>
                    <p className="text-xs text-slate-950/90 font-medium">
                      {nationalTournamentState.currentPhase === 'group_stage'
                        ? `Group Matchday ${nationalTournamentState.currentGroupMatchday} of ${nationalTournamentState.totalGroupMatchdays}`
                        : nationalTournamentState.knockoutRounds[nationalTournamentState.currentKnockoutRoundIndex]} • Browse your menus freely and return when ready to play!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentStage('national_tournament')}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-xl shadow-lg border border-amber-400/40 shrink-0 cursor-pointer transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span>Resume Tournament</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1.5">
                <div className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> {isProfessionalPlayer(player) ? 'Squad & League' : 'Category & Age'}
                </div>
                <div className="text-xl font-black text-white">
                  {isProfessionalPlayer(player) ? `${player.club || 'Pro Club'}` : `${category} League`}
                </div>
                <p className="text-xs text-slate-400">
                  {isProfessionalPlayer(player)
                    ? `Squad: ${player.squadDestination || 'First Team'} | ${player.league || 'First Division'}`
                    : 'Progression from Age 10 to 20.'}
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1.5">
                <div className="text-xs font-bold text-sky-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" /> Height & Weight
                </div>
                <div className="text-xl font-black text-sky-300">
                  {player.heightCm || 145} CM / {player.weightKg || 45} KG
                </div>
                <p className="text-xs text-slate-400">
                  Growth this year: <strong className="text-emerald-400">+{player.lastYearGrowthCm || 0} CM</strong> {player.lastYearWasGrowthSpurt ? '⚡ Growth Spurt' : age >= 18 ? '(Growth Ended)' : ''}
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1.5">
                <div className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4" /> Fitness & Stamina
                </div>
                <div className="text-xl font-black text-cyan-300">
                  {getFitnessPercentage(player)}% FITNESS
                </div>
                <p className="text-xs text-slate-400">
                  Stamina Attribute: <strong className="text-amber-300">{staminaValue} STA</strong>
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-1.5">
                <div className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Milestones
                </div>
                <div className="text-xl font-black text-purple-300">
                  {isProfessionalPlayer(player) ? 'Pro Season' : '2 Blocks + Cards'}
                </div>
                <p className="text-xs text-slate-400">
                  {isProfessionalPlayer(player) ? 'Block 1 → Cards → Block 2' : 'Block 1 → Cards → Block 2.'}
                </p>
              </div>
            </div>

            {isFreeAgent ? (
              <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-amber-500/40 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/30">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      {freeAgentPeriod === 'pre_season' ? 'JULY WINDOW • PRE-SEASON FREE AGENT' : 'JANUARY WINDOW • MID-SEASON FREE AGENT'}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Free Agent Career Decision Hub
                    </h3>
                    <p className="text-xs text-slate-300">
                      You are currently without a club. Match fixtures are not simulated for free agents. Instead, time passes in 6-month steps through your 3 career choices.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFreeAgentHubModal(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                  >
                    <span>Full Hub View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3 Choices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                  {/* Choice 1: Streets */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 flex flex-col justify-between space-y-3 transition">
                    <div className="space-y-1.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-black">
                        <Flame className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase">1. Play on the Streets</h4>
                      <p className="text-xs text-slate-400">
                        Play informal street games, maintain conditioning, and draw 4 Street Development cards. Advances 6 months.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleFreeAgentPlayStreets}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                    >
                      <span>Play on the Streets</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Choice 2: Tryouts */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-500/30 hover:border-blue-400 flex flex-col justify-between space-y-3 transition">
                    <div className="space-y-1.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center font-black">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase">2. League Tryouts</h4>
                      <p className="text-xs text-slate-400">
                        Pick any domestic or international league, run scout tryout evaluations, and earn official contract offers. Advances 6 months.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFreeAgentTryoutLeaguePicker(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                    >
                      <span>Choose League Tryout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Choice 3: Agent representation */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 hover:border-purple-400 flex flex-col justify-between space-y-3 transition">
                    <div className="space-y-1.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-400 flex items-center justify-center font-black">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase">
                        {Boolean(manager?.name) ? '3. Ask Agent to Find Club' : '3. Find an Agent'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {Boolean(manager?.name)
                          ? `Instruct ${manager?.name} to bring up to 5 curated offers tailored to your directive (Glory, Potential, Money).`
                          : 'Meet candidate sports agents across different tiers with unique specialties to represent you and negotiate club contracts.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (Boolean(manager?.name)) {
                          setFreeAgentDirectivePicker(true);
                        } else {
                          const candidateOffers = generatePreseasonManagerOffers(player);
                          setPreseasonAgentOffers(candidateOffers);
                          setPreseasonAgentOffer(candidateOffers[0] || null);
                          setShowAgentOfferModal(true);
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition"
                    >
                      <span>{Boolean(manager?.name) ? 'Give Agent Directive' : 'Find an Agent & Draw Cards'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {isProfessionalPlayer(player) && (
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-black shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{player.club} Contract</h4>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              ((player as any).contractYearsRemaining ?? (accounting?.contractYears || 3)) <= 1
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {((player as any).contractYearsRemaining ?? (accounting?.contractYears || 3))} Year(s) Remaining
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Wage: <strong className="text-emerald-400">€{((accounting?.yearlySalary || 45000) / 52).toFixed(0)}/wk</strong> (€{(accounting?.yearlySalary || 45000).toLocaleString()}/yr) • Squad Role: <strong className="text-slate-200">{player.squadRole || 'Key Player'}</strong>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const offers = unifiedOffers.length > 0 ? unifiedOffers : generateProactiveSeasonOffers(player, accounting, manager);
                        setUnifiedOffers(offers);
                        setShowUnifiedOffersModal(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Review Club & Renewal Offers</span>
                      {unifiedOffers.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full font-black text-[10px]">
                          {unifiedOffers.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* OFFICIAL COMPETITION DRAW HEADLINES */}
                {drawNewsItems.length > 0 && (
                  <DrawNewsSection
                    newsItems={drawNewsItems}
                    onOpenContinentalDraw={(item) => {
                      if (item.continentalTournamentState) {
                        setPendingContinentalDraw(item.continentalTournamentState);
                        setShowContinentalDrawModal(true);
                      }
                    }}
                    onOpenNationalDraw={(item) => {
                      if (item.nationalDrawState) {
                        setPendingNationalTeamDraw(item.nationalDrawState);
                        setShowNationalTeamDrawModal(true);
                      }
                    }}
                    onOpenAllContinentalSummary={() => setShowContinentalDrawsSummaryModal(true)}
                    seasonYear={seasonYear}
                  />
                )}

                <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 p-6 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-white">{t('BTN_START_SEASON')} ({seasonYear})</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {isProfessionalPlayer(player)
                        ? `Professional Season Fixtures (Aug–Dec) • ${player.club} ${player.squadDestination || 'First Team'}`
                        : `${t('BLOCK_1_SUBTITLE')} (${category})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-end">
                    {isTestMode && (
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <button
                          onClick={handleSkipSeason}
                          className="px-4 py-3 rounded-2xl text-xs font-black text-white bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-xl shadow-red-600/30 border border-red-400 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition-all hover:scale-105"
                          title="[Test Mode] Skip Season directly to Season Summary"
                        >
                          <FastForward className="w-4 h-4 fill-white" />
                          <span>SKIP SEASON</span>
                        </button>
                        <button
                          onClick={() => handleTestLaunchNationalTournament('euro')}
                          className="px-3 py-3 rounded-2xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 border border-blue-400 cursor-pointer flex items-center justify-center gap-1 shrink-0 transition-all hover:scale-105"
                          title="[Test Mode] Launch UEFA Eurocup Draw & Tournament"
                        >
                          <Trophy className="w-4 h-4 text-amber-300" />
                          <span>TEST EURO</span>
                        </button>
                        <button
                          onClick={() => handleTestLaunchNationalTournament('copa')}
                          className="px-3 py-3 rounded-2xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/30 border border-emerald-400 cursor-pointer flex items-center justify-center gap-1 shrink-0 transition-all hover:scale-105"
                          title="[Test Mode] Launch CONMEBOL Copa América Draw & Tournament"
                        >
                          <Trophy className="w-4 h-4 text-amber-300" />
                          <span>TEST COPA</span>
                        </button>
                        <button
                          onClick={() => handleTestLaunchNationalTournament('world_cup')}
                          className="px-3 py-3 rounded-2xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl shadow-amber-400/30 border border-amber-300 cursor-pointer flex items-center justify-center gap-1 shrink-0 transition-all hover:scale-105"
                          title="[Test Mode] Launch FIFA World Cup Draw & Tournament"
                        >
                          <Trophy className="w-4 h-4 text-slate-950 fill-current" />
                          <span>TEST WORLD CUP</span>
                        </button>
                        <button
                          onClick={() => handleTestTriggerCallUp('U17')}
                          className="px-3 py-3 rounded-2xl text-xs font-black text-white bg-cyan-600 hover:bg-cyan-500 shadow-xl shadow-cyan-600/30 border border-cyan-400 cursor-pointer flex items-center justify-center gap-1 shrink-0 transition-all hover:scale-105"
                          title="[Test Mode] Trigger U-17 National Team Call-Up Offer"
                        >
                          <Award className="w-4 h-4 text-cyan-200" />
                          <span>TEST U17 CALL-UP</span>
                        </button>
                        <button
                          onClick={() => handleTestTriggerCallUp('U20')}
                          className="px-3 py-3 rounded-2xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 border border-indigo-400 cursor-pointer flex items-center justify-center gap-1 shrink-0 transition-all hover:scale-105"
                          title="[Test Mode] Trigger U-20 National Team Call-Up Offer"
                        >
                          <Award className="w-4 h-4 text-indigo-200" />
                          <span>TEST U20 CALL-UP</span>
                        </button>
                        <button
                          onClick={() => handleTestTriggerCallUp('Senior')}
                          className="px-3 py-3 rounded-2xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-600/30 border border-rose-400 cursor-pointer flex items-center justify-center gap-1 shrink-0 transition-all hover:scale-105"
                          title="[Test Mode] Trigger Senior National Team Call-Up Offer"
                        >
                          <Award className="w-4 h-4 text-rose-200" />
                          <span>TEST SENIOR CALL-UP</span>
                        </button>
                        <button
                          onClick={handleTestSimulateBackgroundTournament}
                          className="px-3 py-3 rounded-2xl text-xs font-black text-white bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-600/30 border border-purple-400 cursor-pointer flex items-center justify-center gap-1 shrink-0 transition-all hover:scale-105"
                          title="[Test Mode] Simulate background tournament without player (posts to news and summary)"
                        >
                          <Globe className="w-4 h-4 text-purple-200" />
                          <span>TEST BG TOURNAMENT</span>
                        </button>
                      </div>
                    )}
                    <button
                      onClick={handleSimulateBlock1}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{t('BTN_SIMULATE_BLOCK1')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STAGE 2: BLOCK 2 SIMULATION ================= */}
        {(currentStage as any) === 'block2' && (
          <div className="space-y-6 text-center py-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-xs font-black uppercase">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> MID-SEASON TO END OF SEASON
            </div>
            <h3 className="text-2xl font-black text-white">{t('BLOCK_2_TITLE')}</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {isProfessionalPlayer(player)
                ? `Professional Season Fixtures (Jan–May) • ${player.club} ${player.squadDestination || 'First Team'}`
                : `${t('BLOCK_2_SUBTITLE')} (${category})`}
            </p>

            {/* MID-SEASON DECEMBER WORLD FOOTBALL GALA CARD (PRO ONLY) */}
            {isProfessionalPlayer(player) && (
              <div className="max-w-3xl mx-auto my-6 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      {t('DECEMBER_GALA_SUBTITLE')}
                    </div>
                    <h4 className="text-lg font-black text-amber-200 tracking-tight flex items-center gap-2">
                      {t('DECEMBER_GALA_TITLE')}
                    </h4>
                    <p className="text-xs text-slate-300">
                      The mid-season winter pause has arrived. Global football gathers to crown the Ballon d'Or winner, FIFPRO World XI, and Golden Boy recipient!
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setShowAwardsCeremonyModal(true)}
                      className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <Trophy className="w-4 h-4 fill-slate-950" />
                      <span>Watch Ceremony</span>
                    </button>
                  </div>
                </div>

                {worldAwardsRevealed && (
                  <div className="mt-6 pt-5 border-t border-amber-500/20">
                    <WorldAwardsSummaryPanel
                      awardsData={currentSeasonWorldAwards}
                      isRevealed={true}
                      mode="world_only"
                      onWatchCeremony={() => setShowAwardsCeremonyModal(true)}
                      onSkipCeremony={() => {}}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {isTestMode && (
                <button
                  onClick={handleSkipSeason}
                  className="px-6 py-3.5 rounded-2xl text-xs font-black text-white bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-xl shadow-red-600/30 border border-red-400 cursor-pointer inline-flex items-center gap-2 transition-all hover:scale-105"
                  title="[Test Mode] Skip Season directly to Season Summary"
                >
                  <FastForward className="w-4 h-4 fill-white" />
                  <span>SKIP SEASON</span>
                </button>
              )}
              <button
                onClick={handleSimulateBlock2}
                className="px-8 py-3.5 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{t('BTN_SIMULATE_BLOCK2')}</span>
              </button>
            </div>
          </div>
        )}
        </>
      )}

        {/* ================= STAGE 3: SEASON SUMMARY & YOUTH LEAGUE STANDINGS ================= */}
        {currentStage === 'summary' && (() => {
          const isPro = isPlayerInProClub(player) || isProfessionalPlayer(player) || (player.age || 10) >= 16;
          const isProAdult = isPro;
          const allMatchesList = [...(block1MatchList || []), ...(block2MatchList || [])];
          const leaderboards = calculateGoalAndAssistLeaderboards(
            player,
            combinedStats.goals,
            combinedStats.assists,
            isProAdult,
            youthLeagueName,
            seasonYear
          );
          const competitionsBreakdown = buildSeasonCompetitionBreakdown(
            player,
            allMatchesList,
            tournamentMatches,
            playerStanding,
            youthLeagueName,
            seasonAwards,
            Boolean(tournamentResult?.awards?.winner)
          );
          const standingsSummary = buildSeasonTeamStandingsSummary(
            player,
            playerStanding as any,
            youthLeagueName,
            tournamentResult?.awards?.winner ? 'Champions 🏆' : tournamentResult ? 'Knockout Round' : null,
            Boolean(seasonAwards?.leagueWinner || playerStanding?.rank === 1)
          );
          const individualAwards = calculateIndividualAwardsWon(
            player,
            seasonAwards,
            leaderboards,
            combinedStats.avgRating,
            playerStanding?.rank === 1,
            youthLeagueName,
            combinedStats.goals,
            combinedStats.assists,
            isProAdult
          );

          const worldAwardsData = calculateWorldIndividualAwards(
            player,
            {
              goals: combinedStats.goals || 0,
              assists: combinedStats.assists || 0,
              matches: combinedStats.gamesPlayed || 0,
              avgRating: combinedStats.avgRating || 6.5,
            },
            seasonYear
          );

          const totalMinutes = combinedStats.minutesPlayed || (combinedStats.gamesPlayed * 78);

          return (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black text-white">{t('SEASON_SUMMARY_TITLE', { year: seasonYear })}</h3>
                  <p className="text-xs text-slate-400">
                    {isPro
                      ? `${player.club} (${player.squadDestination || 'First Team'}) • ${youthLeagueName}`
                      : `${player.club} • ${category} Category (${youthLeagueName})`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-pixel">
                  <button
                    type="button"
                    onClick={() => setCurrentStage('hub')}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 pixel-corners pixel-bevel-raised border border-slate-700 hover:border-emerald-400/50 transition-all cursor-pointer shadow-md"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CAREER HUB</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMainTab('history')}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 pixel-corners pixel-bevel-raised border border-slate-700 hover:border-amber-400/50 transition-all cursor-pointer shadow-md"
                  >
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('CAREER_HISTORY_TAB')}</span>
                  </button>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/15 px-3 py-1.5 pixel-corners border border-amber-500/40 font-arcade">
                    <Trophy className="w-4 h-4" /> {t('FAME_GAINED', { fame: seasonAwards?.totalFameGained || 0 })}
                  </div>
                </div>
              </div>

              {/* Draw Star Season Performance Grade & Champion Coins Banner */}
              {(() => {
                const sGrade = evaluateSeasonSummaryGrade(player);
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-950/30 border-2 border-amber-400/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-2xl font-black shadow-md border-2 border-white shrink-0">
                        {sGrade.grade}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                          DRAW STAR SEASON EVALUATION
                        </div>
                        <div className="text-sm font-black text-white">{sGrade.title}</div>
                        <div className="text-xs text-slate-400">Award modifier based on trophies and season ratings</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-md shrink-0">
                      <span>+{sGrade.championCoins} Champion Coins 🪙</span>
                    </div>
                  </div>
                );
              })()}

              {/* Professional Career DrawStar Season Summary Screen Launcher */}
              {isPro && (
                <div className="p-4 pixel-corners bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-950/40 border-2 border-amber-400 pixel-bevel-gold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl shadow-amber-500/10 font-pixel">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] font-pixel text-amber-400 uppercase">DRAWSTAR FULL-SCREEN PRESENTATION</div>
                      <div className="text-sm font-black text-white uppercase">Official Season Summary Ready</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSeasonSummaryModal(true)}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-pixel text-xs font-black uppercase tracking-wider pixel-corners pixel-bevel-gold cursor-pointer shrink-0 shadow-md active:scale-95"
                  >
                    OPEN SEASON SUMMARY
                  </button>
                </div>
              )}

              {/* Enhanced Stats Summary Grid (Including Total Minutes & MVPs) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-900/90 p-4 pixel-corners pixel-bevel-sunken border-2 border-slate-800 text-center font-pixel">
                <div className="p-2 pixel-corners bg-slate-950/80 border border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t('STATS_MATCHES')}</div>
                  <div className="text-xl font-black text-white font-arcade">{combinedStats.gamesPlayed}</div>
                </div>
                <div className="p-2 pixel-corners bg-slate-950/80 border border-blue-500/30">
                  <div className="text-[10px] font-bold text-blue-400 uppercase flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" /> {t('STATS_MINUTES')}
                  </div>
                  <div className="text-xl font-black text-blue-300 font-arcade">{totalMinutes.toLocaleString()}′</div>
                </div>
                <div className="p-2 pixel-corners bg-slate-950/80 border border-emerald-500/30">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase">{t('STATS_GOALS')}</div>
                  <div className="text-xl font-black text-emerald-400 font-arcade">{combinedStats.goals}</div>
                </div>
                <div className="p-2 pixel-corners bg-slate-950/80 border border-sky-500/30">
                  <div className="text-[10px] font-bold text-sky-400 uppercase">{t('STATS_ASSISTS')}</div>
                  <div className="text-xl font-black text-sky-400 font-arcade">{combinedStats.assists}</div>
                </div>
                <div className="p-2 pixel-corners bg-slate-950/80 border border-amber-500/30">
                  <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center justify-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" /> {t('STATS_MVPS')}
                  </div>
                  <div className="text-xl font-black text-amber-400 font-arcade">{combinedStats.mvps || 0}</div>
                </div>
                <div className="p-2 pixel-corners bg-slate-950/80 border border-yellow-500/30">
                  <div className="text-[10px] font-bold text-yellow-400 uppercase">{t('STATS_AVG_RATING')}</div>
                  <div className="text-xl font-black text-yellow-300 font-arcade">{combinedStats.avgRating}</div>
                </div>
              </div>

              {/* OFFICIAL INTERNATIONAL TOURNAMENT SEASON RECAP */}
              {latestIntTournamentResult && (
                <div className="bg-slate-900 border-2 border-indigo-500/50 p-4 sm:p-5 shadow-xl space-y-4 pixel-corners pixel-bevel-raised font-pixel">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-indigo-500/30 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 pixel-corners bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white font-black text-base shadow-md">
                        🌍
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2 uppercase">
                          <span>{latestIntTournamentResult.competitionName}</span>
                          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 pixel-corners bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold font-arcade">
                            {latestIntTournamentResult.tier} Championship
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 font-retro">
                          Official Tournament Results & Final Accolades • Season {latestIntTournamentResult.seasonYear}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right bg-slate-950/80 sm:bg-transparent p-2 sm:p-0 pixel-corners sm:rounded-none border sm:border-0 border-slate-800">
                      <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider font-pixel">Final Match Result</span>
                      <div className="text-xs font-bold text-slate-200 font-arcade">{latestIntTournamentResult.finalScore}</div>
                    </div>
                  </div>

                  {/* Podium: Champion, Runner-up, 3rd Place */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-pixel">
                    <div className="bg-amber-500/10 border-2 border-amber-500/40 pixel-corners pixel-bevel-gold p-3 flex items-center gap-3">
                      <div className="text-2xl shrink-0">🥇</div>
                      <div>
                        <div className="text-[9px] font-black uppercase text-amber-400 tracking-wider">CHAMPION</div>
                        <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 mt-0.5 uppercase">
                          <img
                            src={`https://flagcdn.com/w40/${latestIntTournamentResult.champion.iso.toLowerCase()}.png`}
                            alt={latestIntTournamentResult.champion.code}
                            className="w-4 h-3 object-cover pixel-corners shadow-sm"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30"><rect width="40" height="30" fill="%23334155"/></svg>';
                            }}
                          />
                          <span>{latestIntTournamentResult.champion.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-3 flex items-center gap-3">
                      <div className="text-2xl shrink-0">🥈</div>
                      <div>
                        <div className="text-[9px] font-black uppercase text-slate-300 tracking-wider">RUNNER-UP (SUB-CHAMPION)</div>
                        <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 mt-0.5 uppercase">
                          <img
                            src={`https://flagcdn.com/w40/${latestIntTournamentResult.runnerUp.iso.toLowerCase()}.png`}
                            alt={latestIntTournamentResult.runnerUp.code}
                            className="w-4 h-3 object-cover pixel-corners shadow-sm"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30"><rect width="40" height="30" fill="%23334155"/></svg>';
                            }}
                          />
                          <span>{latestIntTournamentResult.runnerUp.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-950/40 border-2 border-amber-800/50 pixel-corners pixel-bevel-raised p-3 flex items-center gap-3">
                      <div className="text-2xl shrink-0">🥉</div>
                      <div>
                        <div className="text-[9px] font-black uppercase text-amber-500 tracking-wider">3RD PLACE</div>
                        <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 mt-0.5 uppercase">
                          <img
                            src={`https://flagcdn.com/w40/${latestIntTournamentResult.thirdPlace.iso.toLowerCase()}.png`}
                            alt={latestIntTournamentResult.thirdPlace.code}
                            className="w-4 h-3 object-cover pixel-corners shadow-sm"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30" viewBox="0 0 40 30"><rect width="40" height="30" fill="%23334155"/></svg>';
                            }}
                          />
                          <span>{latestIntTournamentResult.thirdPlace.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Honors Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-pixel">
                    <div className="p-3 pixel-corners bg-slate-950/80 border border-amber-500/30">
                      <div className="text-[9px] font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                        <Award className="w-3 h-3 text-amber-400" /> Golden Ball (MVP)
                      </div>
                      <div className="text-xs font-black text-white mt-1 truncate">{latestIntTournamentResult.mvp.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-retro">{latestIntTournamentResult.mvp.nation} • {latestIntTournamentResult.mvp.rating} Rating</div>
                    </div>

                    <div className="p-3 pixel-corners bg-slate-950/80 border border-emerald-500/30">
                      <div className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                        ⚽ Golden Boot (Top Scorer)
                      </div>
                      <div className="text-xs font-black text-white mt-1 truncate">{latestIntTournamentResult.topScorer.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-retro">{latestIntTournamentResult.topScorer.nation} • {latestIntTournamentResult.topScorer.goals} Goals</div>
                    </div>

                    <div className="p-3 pixel-corners bg-slate-950/80 border border-sky-500/30">
                      <div className="text-[9px] font-bold text-sky-400 flex items-center gap-1 uppercase tracking-wider">
                        🎯 Best Playmaker (Assists)
                      </div>
                      <div className="text-xs font-black text-white mt-1 truncate">{latestIntTournamentResult.bestAssister.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-retro">{latestIntTournamentResult.bestAssister.nation} • {latestIntTournamentResult.bestAssister.assists} Assists</div>
                    </div>

                    <div className="p-3 pixel-corners bg-slate-950/80 border border-indigo-500/30">
                      <div className="text-[9px] font-bold text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
                        🧤 Golden Glove (Keeper)
                      </div>
                      <div className="text-xs font-black text-white mt-1 truncate">{latestIntTournamentResult.goldenGlove.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-retro">{latestIntTournamentResult.goldenGlove.nation} • {latestIntTournamentResult.goldenGlove.cleanSheets} Clean Sheets</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 pixel-corners border border-slate-800/80 font-retro">
                    {latestIntTournamentResult.summaryArticle}
                  </p>
                </div>
              )}

              {/* YOUTH LEAGUE SEASON AWARDS (PERSONAL QUALIFICATION ONLY) */}
              {!isProAdult && (() => {
                const wonTopScorer = combinedStats.goals >= 15 || Boolean(seasonAwards?.topScorer);
                const wonTopAssist = combinedStats.assists >= 15 || Boolean(seasonAwards?.topAssist);
                const wonMvp = combinedStats.avgRating >= 7.5 || Boolean(seasonAwards?.bestPlayer);

                return (
                  <div className="bg-slate-900 border-2 border-amber-500/50 p-4 sm:p-5 shadow-xl space-y-4 pixel-corners pixel-bevel-raised font-pixel">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-amber-500/30 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 pixel-corners bg-amber-500 border border-amber-300 flex items-center justify-center text-slate-950 font-black text-base shadow-md">
                          🏆
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-amber-200 flex items-center gap-2 uppercase">
                            {t('YOUTH LEAGUE SEASON AWARDS') || t('Youth League Season Awards')}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-retro">
                            {t('Personal award qualification results for your youth campaign')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 bg-amber-500/15 px-3 py-1 pixel-corners border border-amber-500/30 font-arcade">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>{Number(wonTopScorer) + Number(wonTopAssist) + Number(wonMvp)} / 3 {t('Won')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-pixel">
                      {/* 1. Top Goalscorer */}
                      <div
                        className={`p-4 border-2 pixel-corners transition-all ${
                          wonTopScorer
                            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-950 to-slate-950 border-emerald-400 pixel-bevel-green shadow-lg'
                            : 'bg-slate-950 border-slate-700 pixel-bevel-raised'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⚽</span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">
                              {t('TOP GOALSCORER') || t('Top Goalscorer')}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 pixel-corners text-[9px] font-black uppercase tracking-wider font-arcade ${
                              wonTopScorer
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                                : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {wonTopScorer ? t('WON') : t('NOT WON')}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-base sm:text-lg font-black text-white">
                            {wonTopScorer ? (
                              <span className="text-emerald-400">{t('WON')} — {combinedStats.goals} {t('Goals')}</span>
                            ) : (
                              <span className="text-slate-300 font-retro">{t('Winner')}: Mateo Silva (16 {t('Goals')})</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-retro">
                            <span>{wonTopScorer ? `${t('Top Scorer')}: ${player.name}` : `${t('Your Total')}: ${combinedStats.goals} ${t('Goals')}`}</span>
                            {wonTopScorer ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1 font-pixel text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {t('Awarded')}
                              </span>
                            ) : (
                              <span className="text-slate-500">2nd in division</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 2. Top Assist Provider */}
                      <div
                        className={`p-4 border-2 pixel-corners transition-all ${
                          wonTopAssist
                            ? 'bg-gradient-to-br from-emerald-950/80 via-slate-950 to-slate-950 border-emerald-400 pixel-bevel-green shadow-lg'
                            : 'bg-slate-950 border-slate-700 pixel-bevel-raised'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">
                              {t('TOP ASSIST PROVIDER') || t('Top Assist Provider')}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 pixel-corners text-[9px] font-black uppercase tracking-wider font-arcade ${
                              wonTopAssist
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                                : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {wonTopAssist ? t('WON') : t('NOT WON')}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-base sm:text-lg font-black text-white">
                            {wonTopAssist ? (
                              <span className="text-emerald-400">{t('WON')} — {combinedStats.assists} {t('Assists')}</span>
                            ) : (
                              <span className="text-slate-300 font-retro">{t('Winner')}: Lucas Romero (14 {t('Assists')})</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-retro">
                            <span>{wonTopAssist ? `${t('Top Playmaker')}: ${player.name}` : `${t('Your Total')}: ${combinedStats.assists} ${t('Assists')}`}</span>
                            {wonTopAssist ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1 font-pixel text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {t('Awarded')}
                              </span>
                            ) : (
                              <span className="text-slate-500">Top 3 in division</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3. Player of the Season (MVP) */}
                      <div
                        className={`p-4 border-2 pixel-corners transition-all ${
                          wonMvp
                            ? 'bg-gradient-to-br from-amber-950/80 via-slate-950 to-slate-950 border-amber-400 pixel-bevel-gold shadow-lg'
                            : 'bg-slate-950 border-slate-700 pixel-bevel-raised'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">⭐</span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">
                              {t('PLAYER OF THE SEASON (MVP)') || t('Player of the Season (MVP)')}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 pixel-corners text-[9px] font-black uppercase tracking-wider font-arcade ${
                              wonMvp
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                                : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {wonMvp ? t('WON') : t('NOT WON')}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-base sm:text-lg font-black text-white">
                            {wonMvp ? (
                              <span className="text-amber-300">WON — {combinedStats.avgRating} Rating</span>
                            ) : (
                              <span className="text-slate-300 font-retro">Winner: Alex Costa (7.8 Rating)</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 font-retro">
                            <span>{wonMvp ? `Season MVP: ${player.name}` : `Your Avg Rating: ${combinedStats.avgRating}`}</span>
                            {wonMvp ? (
                              <span className="text-amber-400 font-bold flex items-center gap-1 font-pixel text-[10px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Awarded
                              </span>
                            ) : (
                              <span className="text-slate-500">Runner-Up in MVP votes</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SQUAD DIVISION INDIVIDUAL HONORS & TOURNAMENT AWARDS (U17 / U20 / RESERVES) */}
              {isProAdult && (player.squadDestination || 'First Team') !== 'First Team' && (() => {
                const squadLevel = player.squadDestination || 'Reserves';
                const squadAwards = calculateSquadLeagueAwards(
                  player,
                  combinedStats.goals,
                  combinedStats.assists,
                  combinedStats.avgRating,
                  combinedStats.cleanSheets || 0,
                  squadLevel,
                  youthStandings || [],
                  youthLeagueName
                );

                return (
                  <div className="bg-slate-900 border-2 border-teal-500/50 p-4 sm:p-5 shadow-xl space-y-4 pixel-corners pixel-bevel-raised font-pixel">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-teal-500/30 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 pixel-corners bg-teal-500 border border-teal-300 flex items-center justify-center text-slate-950 font-black text-base shadow-md">
                          🏅
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-teal-200 flex items-center gap-2 uppercase">
                            {squadLevel} Division Official Honors & Awards
                          </h4>
                          <p className="text-[11px] text-slate-400 font-retro">
                            Tournament leaderboards and individual awards for {youthLeagueName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-teal-300 bg-teal-500/15 px-3 py-1 pixel-corners border border-teal-500/30 font-arcade">
                        <Shield className="w-3.5 h-3.5 text-teal-400" />
                        <span>{squadLevel} Squad</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 font-pixel">
                      {/* 1. Top Goalscorer */}
                      <div className={`p-3.5 border-2 pixel-corners transition-all ${
                        squadAwards.topScorerWinner.isPlayer
                          ? 'bg-gradient-to-br from-emerald-950/80 via-slate-950 to-slate-950 border-emerald-400 pixel-bevel-green shadow-md'
                          : 'bg-slate-950 border-slate-700 pixel-bevel-raised'
                      }`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">⚽</span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">Top Goalscorer</span>
                          </div>
                          {squadAwards.topScorerWinner.isPlayer && (
                            <span className="px-1.5 py-0.5 pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black uppercase font-arcade">
                              WON
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-black text-white truncate uppercase">
                          {squadAwards.topScorerWinner.playerName}
                        </div>
                        <div className="text-xs text-slate-400 truncate font-retro">
                          {squadAwards.topScorerWinner.clubName}
                        </div>
                        <div className="text-xs font-arcade font-black text-emerald-400 pt-1 mt-1 border-t border-slate-800/80">
                          {squadAwards.topScorerWinner.value} Goals
                        </div>
                      </div>

                      {/* 2. Top Assist Provider */}
                      <div className={`p-3.5 border-2 pixel-corners transition-all ${
                        squadAwards.topAssistsWinner.isPlayer
                          ? 'bg-gradient-to-br from-emerald-950/80 via-slate-950 to-slate-950 border-emerald-400 pixel-bevel-green shadow-md'
                          : 'bg-slate-950 border-slate-700 pixel-bevel-raised'
                      }`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🎯</span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">Top Assists</span>
                          </div>
                          {squadAwards.topAssistsWinner.isPlayer && (
                            <span className="px-1.5 py-0.5 pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black uppercase font-arcade">
                              WON
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-black text-white truncate uppercase">
                          {squadAwards.topAssistsWinner.playerName}
                        </div>
                        <div className="text-xs text-slate-400 truncate font-retro">
                          {squadAwards.topAssistsWinner.clubName}
                        </div>
                        <div className="text-xs font-arcade font-black text-sky-400 pt-1 mt-1 border-t border-slate-800/80">
                          {squadAwards.topAssistsWinner.value} Assists
                        </div>
                      </div>

                      {/* 3. Best Goalkeeper */}
                      <div className={`p-3.5 border-2 pixel-corners transition-all ${
                        squadAwards.bestGoalkeeperWinner.isPlayer
                          ? 'bg-gradient-to-br from-emerald-950/80 via-slate-950 to-slate-950 border-emerald-400 pixel-bevel-green shadow-md'
                          : 'bg-slate-950 border-slate-700 pixel-bevel-raised'
                      }`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">🧤</span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">Best Goalkeeper</span>
                          </div>
                          {squadAwards.bestGoalkeeperWinner.isPlayer && (
                            <span className="px-1.5 py-0.5 pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black uppercase font-arcade">
                              WON
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-black text-white truncate uppercase">
                          {squadAwards.bestGoalkeeperWinner.playerName}
                        </div>
                        <div className="text-xs text-slate-400 truncate font-retro">
                          {squadAwards.bestGoalkeeperWinner.clubName}
                        </div>
                        <div className="text-xs font-arcade font-black text-amber-300 pt-1 mt-1 border-t border-slate-800/80 flex items-center justify-between">
                          <span>{squadAwards.bestGoalkeeperWinner.cleanSheets} Clean Sheets</span>
                          <span className="text-slate-400 text-[10px]">({squadAwards.bestGoalkeeperWinner.goalsConceded} GA)</span>
                        </div>
                      </div>

                      {/* 4. Tournament MVP */}
                      <div className={`p-3.5 border-2 pixel-corners transition-all ${
                        squadAwards.bestPlayerWinner.isPlayer
                          ? 'bg-gradient-to-br from-amber-950/80 via-slate-950 to-slate-950 border-amber-400 pixel-bevel-gold shadow-md'
                          : 'bg-slate-950 border-slate-700 pixel-bevel-raised'
                      }`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">⭐</span>
                            <span className="text-xs font-black text-white uppercase tracking-wider">Tournament MVP</span>
                          </div>
                          {squadAwards.bestPlayerWinner.isPlayer && (
                            <span className="px-1.5 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase font-arcade">
                              WON
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-black text-white truncate uppercase">
                          {squadAwards.bestPlayerWinner.playerName}
                        </div>
                        <div className="text-xs text-slate-400 truncate font-retro">
                          {squadAwards.bestPlayerWinner.clubName}
                        </div>
                        <div className="text-xs font-arcade font-black text-yellow-300 pt-1 mt-1 border-t border-slate-800/80">
                          {squadAwards.bestPlayerWinner.value} Avg Rating
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* END SEASON WORLD & DOMESTIC INDIVIDUAL AWARDS PANEL (PRO ONLY) */}
              {isProAdult && (
                <WorldAwardsSummaryPanel
                  awardsData={worldAwardsData}
                  isRevealed={worldAwardsRevealed}
                  mode="domestic_only"
                  onWatchCeremony={() => setShowAwardsCeremonyModal(true)}
                  onSkipCeremony={() => {
                    markWorldAwardsRevealed(seasonYear);
                    setWorldAwardsRevealed(true);
                  }}
                />
              )}

              {/* INDIVIDUAL AWARDS & TROPHIES EARNED THIS SEASON */}
              {individualAwards.length > 0 && (
                <div className="bg-slate-900 p-4 pixel-corners border-2 border-amber-500/50 pixel-bevel-gold shadow-xl space-y-3 font-pixel">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">
                      {t('INDIVIDUAL_HONORS_TITLE')}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {individualAwards.map((aw) => (
                      <div
                        key={aw.id}
                        className="bg-slate-950 p-3 pixel-corners border border-amber-500/40 flex items-start gap-3 shadow-md"
                      >
                        <div className="w-9 h-9 pixel-corners bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-lg shrink-0">
                          {aw.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-black text-amber-200 truncate uppercase">{aw.name}</div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug font-retro">{aw.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEAM COMPETITIONS & STANDINGS SUMMARY */}
              <div className="space-y-3 font-pixel">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">
                    {t('TEAM_STANDINGS_TITLE')}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. League */}
                  <div className="bg-slate-900 p-3.5 pixel-corners border-2 border-slate-700 pixel-bevel-raised space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{t('LEAGUE_STANDINGS')}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 pixel-corners border font-arcade ${
                        standingsSummary.league.rank === 1
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {translateQualificationBadge(standingsSummary.league.status, undefined, currentLanguage)}
                      </span>
                    </div>
                    <div className="text-sm font-black text-white uppercase">{standingsSummary.league.name}</div>
                    <div className="flex items-center justify-between text-xs font-arcade pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Rank <strong className="text-amber-300">#{standingsSummary.league.rank}</strong></span>
                      <span className="text-slate-300 font-bold">{standingsSummary.league.points} PTS</span>
                    </div>
                  </div>

                  {/* 2. Domestic Cup */}
                  {standingsSummary.domesticCup && (
                    <div className="bg-slate-900 p-3.5 pixel-corners border-2 border-slate-700 pixel-bevel-raised space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{t('DOMESTIC_CUP')}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 pixel-corners border font-arcade ${
                          standingsSummary.domesticCup.isWinner
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {translateStageReached(standingsSummary.domesticCup.roundReached, currentLanguage)}
                        </span>
                      </div>
                      <div className="text-sm font-black text-white uppercase">{standingsSummary.domesticCup.name}</div>
                      <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 font-retro">
                        {standingsSummary.domesticCup.isWinner ? '🏆 Cup Winner' : 'Knockout Cup Campaign'}
                      </div>
                    </div>
                  )}

                  {/* 3. Continental / International Cup */}
                  {standingsSummary.continentalCup && (
                    <div
                      onClick={() => setShowContinentalModal(true)}
                      className="bg-slate-900 p-3.5 pixel-corners border-2 border-slate-700 pixel-bevel-raised space-y-2 hover:border-indigo-500 cursor-pointer transition-all hover:bg-slate-850 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <span>{t('CONTINENTAL_CUP')}</span>
                          <span className="text-[9px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-arcade">
                            (Open Hub)
                          </span>
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 pixel-corners border font-arcade ${
                          standingsSummary.continentalCup.isWinner
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {translateStageReached(standingsSummary.continentalCup.roundReached, currentLanguage)}
                        </span>
                      </div>
                      <div className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors uppercase">
                        {standingsSummary.continentalCup.name}
                      </div>
                      <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="font-retro">{standingsSummary.continentalCup.isWinner ? '⭐ Continental Champion' : 'Top Tier Stage'}</span>
                        <span className="text-[10px] text-indigo-400 font-bold font-arcade">View Hub ➔</span>
                      </div>
                    </div>
                  )}

                  {/* 4. National Team */}
                  {standingsSummary.nationalTeam ? (
                    <div className="bg-slate-900 p-3.5 pixel-corners border-2 border-slate-700 pixel-bevel-raised space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{t('NATIONAL_TEAM')}</span>
                        <span className="text-[9px] font-black px-2 py-0.5 pixel-corners bg-blue-500/20 text-blue-300 border border-blue-400/40 font-arcade">
                          {translateStageReached(standingsSummary.nationalTeam.roundOrStatus, currentLanguage)}
                        </span>
                      </div>
                      <div className="text-sm font-black text-white uppercase">{standingsSummary.nationalTeam.teamName}</div>
                      <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/80 font-retro">
                        {standingsSummary.nationalTeam.competitionName} • {standingsSummary.nationalTeam.goals}G {standingsSummary.nationalTeam.assists}A
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-3.5 pixel-corners border-2 border-slate-800 space-y-2 opacity-70">
                      <div className="text-[9px] font-bold text-slate-500 uppercase">{t('NATIONAL_TEAM')}</div>
                      <div className="text-sm font-black text-slate-400 uppercase">{t('NOT_CALLED_UP')}</div>
                      <div className="text-xs text-slate-500 pt-1 border-t border-slate-800/50 font-retro">
                        {t('NOT_CALLED_UP_DESC')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* TOP 5 GOALSCORING & ASSIST LEADERBOARDS (PRO COMPETITIONS ONLY) */}
              {isProAdult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-pixel">
                  {/* Top Goalscorers Table */}
                  <div className="bg-slate-900 p-4 pixel-corners border-2 border-slate-700 pixel-bevel-raised space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-400" /> {t('TOP_SCORERS_TITLE')}
                      </h4>
                      {leaderboards.isPlayerTop5Goals && (
                        <span className="px-2 py-0.5 pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-black font-arcade">
                          Rank #{leaderboards.playerGoalRank} ⚽
                        </span>
                      )}
                    </div>
                    <div className="overflow-x-auto pixel-corners border border-slate-800">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] font-bold">
                          <tr>
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">Player</th>
                            <th className="py-2 px-3">Club</th>
                            <th className="py-2 px-3 text-right">Goals</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium font-retro">
                          {leaderboards.topScorers.map((entry) => (
                            <tr
                              key={`scorer-${entry.rank}-${entry.playerName}`}
                              className={entry.isPlayer ? 'bg-emerald-500/20 font-black text-white' : 'text-slate-300'}
                            >
                              <td className="py-2 px-3 font-arcade font-bold">
                                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                              </td>
                              <td className="py-2 px-3 font-bold flex items-center gap-1.5 font-pixel">
                                <span>{entry.playerName}</span>
                                {entry.isPlayer && (
                                  <span className="px-1.5 py-0.5 pixel-corners bg-amber-400 text-slate-950 text-[8px] font-black uppercase font-arcade">
                                    {t('TABLE_YOU_BADGE')}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-slate-400">{entry.clubName}</td>
                              <td className="py-2 px-3 text-right font-arcade font-black text-emerald-400">{entry.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Assists Table */}
                  <div className="bg-slate-900 p-4 pixel-corners border-2 border-slate-700 pixel-bevel-raised space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-sky-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-sky-400" /> {t('TOP_ASSISTS_TITLE')}
                      </h4>
                      {leaderboards.isPlayerTop5Assists && (
                        <span className="px-2 py-0.5 pixel-corners bg-sky-500/20 text-sky-300 border border-sky-400/40 text-[9px] font-black font-arcade">
                          Rank #{leaderboards.playerAssistRank} 🎯
                        </span>
                      )}
                    </div>
                    <div className="overflow-x-auto pixel-corners border border-slate-800">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] font-bold">
                          <tr>
                            <th className="py-2 px-3">#</th>
                            <th className="py-2 px-3">Player</th>
                            <th className="py-2 px-3">Club</th>
                            <th className="py-2 px-3 text-right">Assists</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-medium font-retro">
                          {leaderboards.topAssists.map((entry) => (
                            <tr
                              key={`assist-${entry.rank}-${entry.playerName}`}
                              className={entry.isPlayer ? 'bg-sky-500/20 font-black text-white' : 'text-slate-300'}
                            >
                              <td className="py-2 px-3 font-arcade font-bold">
                                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                              </td>
                              <td className="py-2 px-3 font-bold flex items-center gap-1.5 font-pixel">
                                <span>{entry.playerName}</span>
                                {entry.isPlayer && (
                                  <span className="px-1.5 py-0.5 pixel-corners bg-amber-400 text-slate-950 text-[8px] font-black uppercase font-arcade">
                                    {t('TABLE_YOU_BADGE')}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-slate-400">{entry.clubName}</td>
                              <td className="py-2 px-3 text-right font-arcade font-black text-sky-400">{entry.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* COMPETITION-BY-COMPETITION PERFORMANCE BREAKDOWN */}
              <div className="bg-slate-900 p-4 pixel-corners border-2 border-slate-700 pixel-bevel-raised space-y-3 font-pixel">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">
                    {t('COMPETITION_BREAKDOWN_TITLE')}
                  </h4>
                </div>
                <div className="overflow-x-auto pixel-corners border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3">{t('TABLE_COL_COMPETITION')}</th>
                        <th className="py-2.5 px-2 text-center">{t('TABLE_COL_TYPE')}</th>
                        <th className="py-2.5 px-2 text-center">{t('TABLE_COL_APPS')}</th>
                        <th className="py-2.5 px-2 text-center">{t('TABLE_COL_MINS')}</th>
                        <th className="py-2.5 px-2 text-center">{t('TABLE_COL_GOALS')}</th>
                        <th className="py-2.5 px-2 text-center">{t('TABLE_COL_ASSISTS')}</th>
                        <th className="py-2.5 px-2 text-center">{t('TABLE_COL_MVPS')}</th>
                        <th className="py-2.5 px-2 text-center font-black text-amber-300">{t('TABLE_COL_AVG_RATING')}</th>
                        <th className="py-2.5 px-3 text-right">{t('TABLE_COL_STAGE_FINISH')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium font-retro">
                      {competitionsBreakdown.map((comp) => (
                        <tr key={comp.competitionName} className="hover:bg-slate-800/40 text-slate-300">
                          <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5 font-pixel uppercase">
                            {comp.competitionType === 'continental' && <Star className="w-3.5 h-3.5 text-indigo-400" />}
                            {comp.competitionType === 'cup' && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                            {comp.competitionType === 'league' && <Award className="w-3.5 h-3.5 text-emerald-400" />}
                            {comp.competitionType === 'national_team' && <Globe className="w-3.5 h-3.5 text-blue-400" />}
                            {comp.competitionType === 'youth_cup' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{comp.competitionName}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center text-[9px] font-bold uppercase text-slate-400 font-arcade">
                            {translateCompetitionType(comp.competitionType, currentLanguage)}
                          </td>
                          <td className="py-2.5 px-2 text-center font-arcade">{comp.matches}</td>
                          <td className="py-2.5 px-2 text-center font-arcade text-blue-300">{comp.minutes}′</td>
                          <td className="py-2.5 px-2 text-center font-arcade text-emerald-400">{comp.goals}</td>
                          <td className="py-2.5 px-2 text-center font-arcade text-sky-400">{comp.assists}</td>
                          <td className="py-2.5 px-2 text-center font-arcade text-amber-400">{comp.mvps || 0}</td>
                          <td className="py-2.5 px-2 text-center font-arcade font-black text-amber-300">{comp.avgRating}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 pixel-corners text-[9px] font-bold border font-arcade ${
                              comp.wonTrophy
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                                : 'bg-slate-950 text-slate-300 border-slate-800'
                            }`}>
                              {translateStageReached(comp.stageReached, currentLanguage) || 'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Playoff Notice Banner */}
              {playoffPressureNote && (
                <div className="bg-slate-900 p-4 pixel-corners border-2 border-orange-500 pixel-bevel-red shadow-xl flex items-center gap-3 animate-pulse font-pixel">
                  <AlertOctagon className="w-6 h-6 text-orange-400 shrink-0" />
                  <div>
                    <div className="text-[9px] font-black uppercase text-orange-400 tracking-wider font-arcade">
                      {t('PLAYOFF_HIGH_PRESSURE')}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white">{playoffPressureNote}</div>
                  </div>
                </div>
              )}

            {/* Standings Table & Division Selector */}
            {youthStandings && youthStandings.length > 0 && (() => {
              const currentTableData =
                selectedDivisionView === 'first_team' && firstTeamStandings && firstTeamStandings.length > 0
                  ? firstTeamStandings
                  : selectedDivisionView === 'sister' && sisterDivisionStandings && sisterDivisionStandings.length > 0
                  ? sisterDivisionStandings
                  : youthStandings;

              const currentTableTitle =
                selectedDivisionView === 'first_team'
                  ? `${firstTeamLeagueName || 'First Team League'} Final Standings`
                  : selectedDivisionView === 'sister'
                  ? `${sisterDivisionName || 'Sister Division'} Final Standings`
                  : `${youthLeagueName} Final Standings`;

              return (
                <div className="space-y-3 font-pixel">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                        <ListOrdered className="w-4 h-4" />{' '}
                        {currentTableTitle}
                      </h4>
                    </div>

                    {/* Table View Tabs (Squad / First Team / Sister Division) */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 pixel-corners border-2 border-slate-700 text-[9px] font-black font-arcade">
                      <button
                        type="button"
                        onClick={() => setSelectedDivisionView('primary')}
                        className={`px-3 py-1 pixel-corners transition-all cursor-pointer flex items-center gap-1 uppercase ${
                          selectedDivisionView === 'primary'
                            ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-raised'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        <span>{player.squadDestination || 'Current Squad'}</span>
                      </button>

                      {firstTeamStandings && firstTeamStandings.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDivisionView('first_team')}
                          className={`px-3 py-1 pixel-corners transition-all cursor-pointer flex items-center gap-1 uppercase ${
                            selectedDivisionView === 'first_team'
                              ? 'bg-blue-600 text-white font-black pixel-bevel-raised'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Trophy className="w-3 h-3" />
                          <span>{firstTeamLeagueName || 'First Team'}</span>
                        </button>
                      )}

                      {sisterDivisionStandings && sisterDivisionStandings.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDivisionView('sister')}
                          className={`px-3 py-1 pixel-corners transition-all cursor-pointer flex items-center gap-1 uppercase ${
                            selectedDivisionView === 'sister'
                              ? 'bg-amber-500 text-slate-950 font-black pixel-bevel-raised'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{sisterDivisionName || '2nd Div'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto pixel-corners border-2 border-slate-700 bg-slate-950 pixel-bevel-raised">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px] border-b-2 border-slate-800 font-arcade">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Club</th>
                          <th className="py-2.5 px-2 text-center">P</th>
                          <th className="py-2.5 px-2 text-center">W</th>
                          <th className="py-2.5 px-2 text-center">D</th>
                          <th className="py-2.5 px-2 text-center">L</th>
                          <th className="py-2.5 px-2 text-center">GD</th>
                          <th className="py-2.5 px-3 text-center font-black text-white">PTS</th>
                          <th className="py-2.5 px-3 text-right">Qualification / Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-medium font-retro">
                        {currentTableData.map((row) => {
                          const isPlayerTeamInSquad = row.isPlayerTeam;
                          const isPlayerClubInFirstTeam =
                            selectedDivisionView === 'first_team' &&
                            (row.teamName.toLowerCase().includes((player.club || '').toLowerCase()) ||
                              (player.club || '').toLowerCase().includes(row.teamName.toLowerCase()));
                          const badge = row.qualificationBadge;

                          return (
                            <tr
                              key={row.teamId || `${row.rank}-${row.teamName}`}
                              className={`transition-all ${
                                isPlayerTeamInSquad
                                  ? 'bg-amber-500/20 font-black text-white border-l-4 border-amber-400'
                                  : isPlayerClubInFirstTeam
                                  ? 'bg-blue-500/15 font-black text-white border-l-4 border-blue-400'
                                  : 'hover:bg-slate-900/50 text-slate-300'
                              }`}
                            >
                              <td className="py-2.5 px-3 font-arcade font-bold">{row.rank}</td>
                              <td className="py-2.5 px-3 font-bold flex items-center gap-2 font-pixel uppercase">
                                <span>{row.teamName}</span>
                                {isPlayerTeamInSquad && (
                                  <span className="px-1.5 py-0.5 pixel-corners text-[8px] font-black uppercase bg-amber-400 text-slate-950 font-arcade">
                                    YOU
                                  </span>
                                )}
                                {isPlayerClubInFirstTeam && !isPlayerTeamInSquad && (
                                  <span className="px-1.5 py-0.5 pixel-corners text-[8px] font-black uppercase bg-blue-500/80 text-white font-arcade">
                                    YOUR CLUB
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-2 text-center font-arcade">{row.played}</td>
                              <td className="py-2.5 px-2 text-center font-arcade text-emerald-400">{row.won}</td>
                              <td className="py-2.5 px-2 text-center font-arcade text-slate-400">{row.drawn}</td>
                              <td className="py-2.5 px-2 text-center font-arcade text-rose-400">{row.lost}</td>
                              <td className="py-2.5 px-2 text-center font-arcade">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                              <td className="py-2.5 px-3 text-center font-arcade font-black text-amber-300 text-sm">
                                {row.points}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {badge ? (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 pixel-corners border text-[9px] font-bold font-arcade uppercase ${badge.badgeClass}`}>
                                    {badge.type === 'ucl' && <Star className="w-3 h-3 text-indigo-400" />}
                                    {badge.type === 'uel' && <Trophy className="w-3 h-3 text-amber-400" />}
                                    {badge.type === 'uecl' && <Shield className="w-3 h-3 text-emerald-400" />}
                                    {badge.type === 'libertadores' && <Trophy className="w-3 h-3 text-amber-400" />}
                                    {badge.type === 'sudamericana' && <Globe className="w-3 h-3 text-sky-400" />}
                                    {badge.type === 'promotion_auto' && <ArrowUp className="w-3 h-3 text-emerald-400" />}
                                    {badge.type === 'promotion_playoff' && <Sparkles className="w-3 h-3 text-sky-400" />}
                                    {badge.type === 'relegation_playoff' && <AlertOctagon className="w-3 h-3 text-orange-400" />}
                                    {badge.type === 'relegation_direct' && <ArrowDown className="w-3 h-3 text-rose-400" />}
                                    {badge.type === 'youth_intl_cup' && <Trophy className="w-3 h-3 text-emerald-400" />}
                                    {badge.type === 'none' && <Shield className="w-3 h-3 text-slate-500" />}
                                    <span>{translateQualificationBadge(badge.shortLabel || badge.label, badge.type, currentLanguage)}</span>
                                  </span>
                                ) : row.qualifiedForIntCup ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold font-arcade uppercase">
                                    <Trophy className="w-3 h-3 text-emerald-400" /> {translateQualificationBadge("Int'l Youth Cup", 'youth_intl_cup', currentLanguage)}
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-slate-500 font-arcade uppercase">
                                    {translateQualificationBadge(isProfessionalPlayer(player) ? 'Mid-Table' : 'Youth League', 'none', currentLanguage)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Champion Celebration Trigger Banner if Rank #1 */}
            {playerStanding?.rank === 1 && onTriggerChampionModal && (
              <div className="bg-slate-900 p-4 pixel-corners border-2 border-amber-400 pixel-bevel-gold shadow-[0_0_25px_rgba(245,158,11,0.4)] flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-12 h-12 pixel-corners bg-amber-500 border border-amber-300 flex items-center justify-center text-slate-950 shrink-0 shadow-lg font-black text-2xl pixel-bevel-raised">
                    🏆
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider font-arcade">
                      <Sparkles className="w-3 h-3" /> {isProfessionalPlayer(player) ? 'LEAGUE CHAMPIONS' : 'YOUTH LEAGUE CHAMPIONS'} 🥇
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-white mt-1 uppercase">
                      {player.club} finished 1st in {youthLeagueName}!
                    </h4>
                    <p className="text-xs text-amber-200/90 font-retro">
                      View full-screen press celebration, MVP awards, and media coverage!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const isPro = isProfessionalPlayer(player);
                    onTriggerChampionModal({
                      titleName: isPro ? `${youthLeagueName} Title` : `Youth League U${player.age || 16}`,
                      trophyType: isPro ? 'league' : 'youth',
                      seasonYear,
                      clubName: player.club,
                      isYouth: !isPro,
                      isDouble: Boolean(tournamentResult?.awards?.winner),
                      seasonTrophiesList: isPro
                        ? [`${youthLeagueName} Champion`]
                        : tournamentResult?.awards?.winner
                        ? [`Youth League U${player.age || 16}`, 'International Youth Cup']
                        : [`Youth League U${player.age || 16}`],
                      playerPerformance: {
                        name: player.name || 'Player',
                        position: player.position || 'ST',
                        ovr: player.ovr || 70,
                        matchesPlayed: combinedStats.gamesPlayed || 18,
                        goals: combinedStats.goals || 12,
                        assists: combinedStats.assists || 6,
                        avgRating: combinedStats.avgRating || 8.1,
                        keyContributionText: `Dominating the table to conquer 1st place and secure the title!`,
                      },
                    });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 pixel-bevel-raised shadow-xl shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5 uppercase tracking-wide"
                >
                  <Trophy className="w-4 h-4" />
                  <span>VIEW CHAMPIONS CELEBRATION 🏆</span>
                </button>
              </div>
            )}

            {/* Outcome Announcement Banners */}
            {isProfessionalPlayer(player) ? (
              playerStanding?.inPlayoff ? (
                <div className="bg-slate-900 p-5 pixel-corners border-2 border-amber-400 pixel-bevel-gold shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel">
                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wide font-arcade">
                      <Flame className="w-3.5 h-3.5 fill-slate-950" /> {(player.leagueTier || 1) === 1 ? t('RELEGATION_PLAYOFF_BANNER') : t('PROMOTION_PLAYOFF_BANNER')}
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white uppercase">
                      {(player.leagueTier || 1) === 1
                        ? t('RELEGATION_PLAYOFF_TITLE', { club: player.club })
                        : t('PROMOTION_PLAYOFF_TITLE', { club: player.club })}
                    </h4>
                    <p className="text-xs text-slate-300 font-retro">
                      {(player.leagueTier || 1) === 1
                        ? t('RELEGATION_PLAYOFF_DESC', { rank: playerStanding.rank })
                        : t('PROMOTION_PLAYOFF_DESC', { rank: playerStanding.rank })}
                    </p>
                  </div>

                  <button
                    onClick={handleStartPlayoffKeyMatch}
                    className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 pixel-bevel-raised shadow-xl shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5 uppercase tracking-wide font-arcade"
                  >
                    <Flame className="w-4 h-4 fill-slate-950" />
                    <span>{(player.leagueTier || 1) === 1 ? t('PLAY_RELEGATION_PLAYOFF_BTN') : t('PLAY_PROMOTION_PLAYOFF_BTN')}</span>
                  </button>
                </div>
              ) : playerStanding?.promoted ? (
                <div className="bg-slate-900 p-5 pixel-corners border-2 border-emerald-400 pixel-bevel-green shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-emerald-500 text-slate-950 text-[9px] font-black uppercase font-arcade">
                      <ArrowUp className="w-3.5 h-3.5" /> {t('PROMOTION_ACHIEVED_BANNER')}
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white uppercase">
                      {t('PROMOTION_ACHIEVED_TITLE', { club: player.club })}
                    </h4>
                    <p className="text-xs text-slate-300 font-retro">
                      {t('PROMOTION_ACHIEVED_DESC', { rank: playerStanding.rank, league: youthLeagueName })}
                    </p>
                  </div>

                  <button
                    onClick={handleStartPreseasonDraw}
                    className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 pixel-bevel-raised shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5 uppercase tracking-wide font-arcade"
                  >
                    <span>{t('BTN_PROCEED_PRESEASON')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : playerStanding?.qualifiedContinental ? (
                <div className="bg-slate-900 p-5 pixel-corners border-2 border-indigo-400 pixel-bevel-raised shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-indigo-500 text-white text-[9px] font-black uppercase font-arcade">
                      <Star className="w-3.5 h-3.5" /> {t('CONTINENTAL_QUALIFIED_BANNER')}
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white uppercase">
                      {t('CONTINENTAL_QUALIFIED_TITLE', {
                        tournament: translateQualificationBadge(playerStanding.qualificationBadge?.label || 'Continental Tournament', 'continental', currentLanguage),
                      })}
                    </h4>
                    <p className="text-xs text-slate-300 font-retro">
                      {t('CONTINENTAL_QUALIFIED_DESC', { rank: playerStanding.rank, league: youthLeagueName, club: player.club })}
                    </p>
                  </div>

                  <button
                    onClick={handleStartPreseasonDraw}
                    className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 pixel-bevel-raised shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5 uppercase tracking-wide font-arcade"
                  >
                    <span>{t('BTN_PROCEED_PRESEASON')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : playerStanding?.relegated ? (
                <div className="bg-slate-900 p-5 pixel-corners border-2 border-rose-500 pixel-bevel-red shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-rose-600 text-white text-[9px] font-black uppercase font-arcade">
                      <ArrowDown className="w-3.5 h-3.5" /> {t('RELEGATION_BANNER')}
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white uppercase">
                      {t('RELEGATED_TITLE', { club: player.club })}
                    </h4>
                    <p className="text-xs text-slate-300 font-retro">
                      {t('RELEGATION_DESC', { rank: playerStanding.rank, league: youthLeagueName })}
                    </p>
                  </div>

                  <button
                    onClick={handleStartPreseasonDraw}
                    className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 pixel-bevel-raised shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5 uppercase tracking-wide font-arcade"
                  >
                    <span>{t('BTN_PROCEED_PRESEASON')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900 p-5 pixel-corners border-2 border-amber-400/80 pixel-bevel-raised shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-amber-500 text-slate-950 text-[9px] font-black uppercase font-arcade">
                      <Trophy className="w-3.5 h-3.5" /> {t('PRO_SEASON_COMPLETE_TITLE', { year: seasonYear })}
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-white uppercase">
                      {t('PRO_SEASON_COMPLETE_HEADING', { rank: playerStanding?.rank || 1, club: player.club, squad: player.squadDestination || 'First Team' })}
                    </h4>
                    <p className="text-xs text-slate-300 font-retro">
                      {t('PRO_SEASON_COMPLETE_DESC')}
                    </p>
                    {isPro && (player.squadDestination === 'First Team' || (player.age || 16) >= 16) && (
                      <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-rose-300 font-retro">
                        <span className="px-2 py-0.5 pixel-corners bg-rose-500/20 border border-rose-500/40 font-bold font-arcade">
                          🏆 Next: {getClubPreseasonTrophyConfig(player.club || '', player.league).trophyName}
                        </span>
                        <span className="text-slate-400">
                          (7 Half-Time Substitutions • +20% Fitness Boost)
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleStartPreseasonDraw}
                    className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 pixel-bevel-raised shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5 uppercase tracking-wide font-arcade"
                  >
                    <span>{t('BTN_PROCEED_PRESEASON')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              )
            ) : tournamentResult ? (
              <div className="bg-slate-900 p-5 pixel-corners border-2 border-emerald-400 pixel-bevel-green shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-emerald-500 text-slate-950 text-[9px] font-black uppercase font-arcade">
                    <Trophy className="w-3.5 h-3.5" /> {t('INT_YOUTH_CUP_COMPLETED_BANNER')}
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white uppercase">
                    {t('FINISHED_RANK_TITLE', { rank: playerStanding?.rank || 1, league: youthLeagueName })}
                  </h4>
                  <p className="text-xs text-slate-300 font-retro">
                    {t('INT_YOUTH_CUP_COMPLETED_DESC')}
                  </p>
                </div>

                <button
                  onClick={handleStartPreseasonDraw}
                  className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 pixel-bevel-raised shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5 uppercase tracking-wide font-arcade"
                >
                  <span>{t('BTN_PROCEED_PRESEASON')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            ) : isQualifiedForIntCup ? (
              <div className="bg-slate-900 p-5 pixel-corners border-2 border-emerald-400 pixel-bevel-green shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-emerald-500 text-slate-950 text-[9px] font-black uppercase font-arcade">
                    <Trophy className="w-3.5 h-3.5" /> {t('INT_YOUTH_CUP_QUALIFIED_TITLE')}
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white uppercase">
                    {t('FINISHED_RANK_TITLE', { rank: playerStanding?.rank || 1, league: youthLeagueName })}
                  </h4>
                  <p className="text-xs text-slate-300 font-retro">
                    {t('INT_YOUTH_CUP_QUALIFIED_DESC')}
                  </p>
                </div>

                <button
                  onClick={handlePlayTournament}
                  className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 pixel-bevel-raised shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:translate-y-0.5 uppercase tracking-wide font-arcade"
                >
                  <Globe className="w-4 h-4" />
                  <span>{t('ENTER_INT_YOUTH_CUP_BTN')}</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border-2 border-slate-700 p-5 pixel-corners pixel-bevel-raised space-y-4 font-pixel">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-slate-800 pb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-bold uppercase font-arcade">
                    {t('INT_YOUTH_CUP_SUMMARY_BANNER', { year: `${seasonYear}/${(parseInt(seasonYear) + 1).toString().slice(-2)}` })}
                  </div>
                  <span className="text-[10px] font-arcade text-amber-400 font-bold uppercase">
                    {t('FINISHED_RANK_TITLE', { rank: playerStanding?.rank || 5, league: youthLeagueName })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-retro">
                  {t('INT_YOUTH_CUP_NON_QUALIFIED_DESC')}
                </p>

                {nonQualifiedCupSummary && (
                  <div className="bg-slate-950 border-2 border-amber-500/50 p-4 pixel-corners pixel-bevel-gold flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{nonQualifiedCupSummary.champion.flag}</div>
                      <div>
                        <div className="text-[9px] text-amber-400 font-black uppercase tracking-wide font-arcade">
                          {t('INT_CUP_CHAMPION_LABEL')}
                        </div>
                        <div className="text-sm font-black text-white uppercase">{nonQualifiedCupSummary.champion.name}</div>
                        <div className="text-[9px] text-slate-400 font-arcade">
                          {nonQualifiedCupSummary.champion.federation} • {nonQualifiedCupSummary.champion.country} • {nonQualifiedCupSummary.champion.teamOvr} OVR
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-300 border-t-2 sm:border-t-0 border-slate-800 pt-2 sm:pt-0 w-full sm:w-auto font-retro">
                      <div className="text-[9px] text-slate-400 uppercase font-arcade">{t('GRAND_FINAL_RESULT_LABEL')}</div>
                      <div>
                        {t('DEFEATED_LABEL', { team: `${nonQualifiedCupSummary.runnerUp.flag} ${nonQualifiedCupSummary.runnerUp.name}` })}
                      </div>
                      <div className="font-arcade font-black text-amber-300 text-sm">{nonQualifiedCupSummary.score}</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleStartPreseasonDraw}
                    className="w-full sm:w-auto px-6 py-3 pixel-corners text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 pixel-bevel-raised shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5 uppercase tracking-wide font-arcade"
                  >
                    <span>{t('BTN_PROCEED_PRESEASON')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* Newspaper Spotlight Box */}
            {newspaper && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-pixel">
                <div className="bg-slate-900 border-2 border-slate-700 p-4 pixel-corners pixel-bevel-raised space-y-2">
                  <div className="text-[9px] font-black uppercase text-amber-400 flex items-center gap-1 font-arcade">
                    <Newspaper className="w-3.5 h-3.5" /> {t('TEAM_PRESS_COVERAGE')}
                  </div>
                  <h4 className="text-sm font-black text-white uppercase">{t(newspaper.teamArticle.headline) || newspaper.teamArticle.headline}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-retro">{t(newspaper.teamArticle.content) || newspaper.teamArticle.content}</p>
                </div>

                {newspaper.playerArticle && (
                  <div className="bg-slate-900 border-2 border-slate-700 p-4 pixel-corners pixel-bevel-raised space-y-2">
                    <div className="text-[9px] font-black uppercase text-amber-400 flex items-center gap-1 font-arcade">
                      <Newspaper className="w-3.5 h-3.5" /> {t('PLAYER_SPOTLIGHT_ARTICLE')}
                    </div>
                    <h4 className="text-sm font-black text-amber-300 uppercase">{t(newspaper.playerArticle.headline) || newspaper.playerArticle.headline}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-retro">{t(newspaper.playerArticle.content) || newspaper.playerArticle.content}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

        {/* ================= STAGE 3.5: GROUP STAGE DRAW SIMULATION ================= */}
        {currentStage === 'draw' && cupClubsForDraw.length > 0 && (
          <GroupDrawSimulator
            all32Clubs={cupClubsForDraw}
            player={player}
            onCompleteDraw={handleFinishDraw}
          />
        )}

        {/* ================= STAGE 4: 32-TEAM INTERNATIONAL YOUTH TOURNAMENT ================= */}
        {currentStage === 'tournament' && (
          <div className="space-y-6 font-pixel">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 pixel-corners bg-sky-500/20 text-sky-300 border border-sky-400/40 text-xs font-black uppercase font-arcade">
                <Globe className="w-3.5 h-3.5 text-sky-400" /> {translateQualificationBadge("Int'l Youth Cup", 'youth_intl_cup', currentLanguage)} (32)
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase">
                {tournamentResult ? translateStageReached(tournamentResult.teamFinish, currentLanguage) : t('INT_TOURNAMENT_IN_PROGRESS')}
              </h3>
            </div>

            {/* Navigation Tabs for 32-Team Tournament */}
            <div className="flex border-b-2 border-slate-800 gap-2 font-arcade justify-between items-center flex-wrap pb-1">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTournamentTab('matches')}
                  className={`px-4 py-2 text-xs font-black pixel-corners transition-all cursor-pointer uppercase ${
                    activeTournamentTab === 'matches'
                      ? 'bg-slate-800 text-amber-400 border-2 border-b-0 border-amber-400 pixel-bevel-raised'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('TAB_TOURNAMENT_MATCHES')}
                </button>
                <button
                  onClick={() => setActiveTournamentTab('groups')}
                  className={`px-4 py-2 text-xs font-black pixel-corners transition-all cursor-pointer uppercase ${
                    activeTournamentTab === 'groups'
                      ? 'bg-slate-800 text-amber-400 border-2 border-b-0 border-amber-400 pixel-bevel-raised'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('TAB_GROUP_STANDINGS')}
                </button>
                <button
                  onClick={() => setActiveTournamentTab('pool')}
                  className={`px-4 py-2 text-xs font-black pixel-corners transition-all cursor-pointer uppercase ${
                    activeTournamentTab === 'pool'
                      ? 'bg-slate-800 text-amber-400 border-2 border-b-0 border-amber-400 pixel-bevel-raised'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('TAB_INTERNATIONAL_POOL')}
                </button>
              </div>

              {activeKeyMatchStep !== 'finished' && (
                <button
                  type="button"
                  onClick={() => {
                    const simMatches: TournamentMatch[] = [
                      {
                        matchId: 'tourn-skip-1',
                        stageName: 'Group Stage — Match 1',
                        opponentName: 'FC Porto U17',
                        opponentOvr: 66,
                        teamScore: 2,
                        opponentScore: 1,
                        playerGoals: 1,
                        playerAssists: 1,
                        playerRating: 7.9,
                        isWinner: true,
                      },
                      {
                        matchId: 'tourn-skip-2',
                        stageName: 'Group Stage — Match 2',
                        opponentName: 'Ajax Academy U17',
                        opponentOvr: 69,
                        teamScore: 1,
                        opponentScore: 1,
                        playerGoals: 1,
                        playerAssists: 0,
                        playerRating: 7.4,
                        isWinner: false,
                      },
                      {
                        matchId: 'tourn-skip-3',
                        stageName: 'Group Stage — Match 3',
                        opponentName: 'Santos FC U17',
                        opponentOvr: 67,
                        teamScore: 3,
                        opponentScore: 0,
                        playerGoals: 2,
                        playerAssists: 1,
                        playerRating: 8.6,
                        isWinner: true,
                      },
                      {
                        matchId: 'tourn-skip-4',
                        stageName: 'Quarter-Final',
                        opponentName: 'Bayern Munich U17',
                        opponentOvr: 70,
                        teamScore: 2,
                        opponentScore: 1,
                        playerGoals: 1,
                        playerAssists: 1,
                        playerRating: 8.1,
                        isWinner: true,
                      },
                      {
                        matchId: 'tourn-skip-5',
                        stageName: 'Semi-Final',
                        opponentName: 'Real Madrid U17',
                        opponentOvr: 72,
                        teamScore: 1,
                        opponentScore: 2,
                        playerGoals: 1,
                        playerAssists: 0,
                        playerRating: 7.5,
                        isWinner: false,
                      },
                      {
                        matchId: 'tourn-skip-6',
                        stageName: 'Third-Place Match',
                        opponentName: 'Chelsea FC Academy U17',
                        opponentOvr: 70,
                        teamScore: 2,
                        opponentScore: 1,
                        playerGoals: 1,
                        playerAssists: 1,
                        playerRating: 8.0,
                        isWinner: true,
                      },
                    ];
                    setTournamentMatches(simMatches);
                    setActiveKeyMatchStep('finished');
                    finalizeTournamentResults(simMatches, false);
                    if (showToast) showToast(t('TOURNAMENT_SKIPPED_SUCCESS') || '🏆 Torneo simulado completamente hasta el resumen final!');
                  }}
                  className="px-3.5 py-1.5 pixel-corners bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-black uppercase flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{t('SKIP_TOURNAMENT') || 'SKIP TOURNAMENT ⏩'}</span>
                </button>
              )}
            </div>

            {/* TAB 1: TOURNAMENT MATCHES & LIVE TOURNAMENT SIMULATOR */}
            {activeTournamentTab === 'matches' && (
              <div className="space-y-6">
                {intCupData && (
                  <LiveTournamentSimulator
                    intCupData={intCupData}
                    cupData={intCupData}
                    player={player}
                    onUpdatePlayer={onUpdatePlayer}
                    activeKeyMatchStep={(activeKeyMatchStep === 'none' ? undefined : activeKeyMatchStep) as any}
                    tournamentTitle={`International Youth Cup U${player.age || 10} (32 Clubs)`}
                    onTriggerKeyMatch={(step, oppName, oppOvr) => {
                      const oppObj = { name: oppName, ovr: oppOvr };
                      if (step === 'quarter_final') {
                        setQuarterOpponent(oppObj);
                        setActiveKeyMatchStep('quarter_final');
                      } else if (step === 'semi_final') {
                        setSemiOpponent(oppObj);
                        setActiveKeyMatchStep('semi_final');
                      } else if (step === 'final') {
                        setFinalOpponent(oppObj);
                        setActiveKeyMatchStep('final');
                      } else if (step === 'third_place') {
                        setThirdPlaceOpponent(oppObj);
                        setActiveKeyMatchStep('third_place');
                      }
                      handleLaunchKeyMatchModal(step, oppObj);
                    }}
                    onFinishTournament={(matches: any, finishTitle) => {
                      setTournamentMatches(matches);
                      setActiveKeyMatchStep('finished');
                      finalizeTournamentResults(matches, false);
                    }}
                  />
                )}

                {/* Tournament Matches Breakdown List */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('TOURNAMENT_RESULTS_HEADER', { count: tournamentMatches.length })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {[...tournamentMatches].reverse().map((m) => (
                      <div
                        key={m.matchId}
                        className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            {m.stageName.includes('Semi') || m.stageName.includes('Final') ? (
                              <span className="text-amber-400 font-black">⚡ KEY MATCH</span>
                            ) : null}
                            <span>{translateStageReached(m.stageName, currentLanguage)}</span>
                          </div>
                          <div className="font-bold text-white">vs {m.opponentName} ({m.opponentOvr} OVR)</div>
                          <div className="text-[10px] text-emerald-400">
                            {m.playerGoals} {t('STAT_GOALS') || 'Goals'}, {m.playerAssists} {t('STAT_ASSISTS') || 'Assists'} (Rating: {m.playerRating})
                          </div>
                        </div>
                        <div
                          className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                            m.isWinner
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                          }`}
                        >
                          {m.teamScore} - {m.opponentScore}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advance Button when Tournament Complete -> Proceeds to Youth League & Cup Season Summary */}
                {activeKeyMatchStep === 'finished' && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setCurrentStage('summary')}
                      className="px-8 py-3.5 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>{t('VIEW_SEASON_SUMMARY') || 'View Season Summary'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: 32-TEAM GROUP STAGE STANDINGS */}
            {activeTournamentTab === 'groups' && intCupData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                {intCupData.groups.map((group) => (
                  <div key={group.groupName} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-black text-amber-400 uppercase">{group.groupName}</span>
                      <span className="text-[10px] text-slate-400">Top 2 Advance</span>
                    </div>

                    <table className="w-full text-left text-[11px]">
                      <thead className="text-[9px] text-slate-400 uppercase font-bold">
                        <tr>
                          <th className="py-1">Club</th>
                          <th className="py-1 text-center">P</th>
                          <th className="py-1 text-center">GD</th>
                          <th className="py-1 text-center font-bold text-white">PTS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {group.standings.map((st, idx) => {
                          const clubObj = group.teams.find((t) => t.id === st.clubId);
                          const isPlayerClub = clubObj?.name.toLowerCase() === player.club?.toLowerCase();

                          return (
                            <tr
                              key={st.clubId}
                              className={`cursor-pointer hover:bg-slate-800/50 ${
                                isPlayerClub ? 'bg-amber-500/20 font-black text-white' : 'text-slate-300'
                              }`}
                              onClick={() => clubObj && setInspectingClub(clubObj)}
                            >
                              <td className="py-1.5 font-medium flex items-center gap-1.5">
                                <span>{idx + 1}.</span>
                                <span>{clubObj?.flag}</span>
                                <span className="truncate max-w-[110px]">{st.clubName}</span>
                              </td>
                              <td className="py-1.5 text-center font-mono">{st.played}</td>
                              <td className="py-1.5 text-center font-mono">{st.gd > 0 ? `+${st.gd}` : st.gd}</td>
                              <td className="py-1.5 text-center font-mono font-black text-amber-300">{st.points}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: INTERNATIONAL TEAM POOL (32 CLUBS) */}
            {activeTournamentTab === 'pool' && intCupData && (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> {t('QUALIFIED_POOL_HEADER')}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">32 Clubs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {intCupData.all32Clubs.map((club) => {
                    const isPlayer = club.name.toLowerCase() === player.club?.toLowerCase();

                    return (
                      <div
                        key={club.id}
                        onClick={() => setInspectingClub(club)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isPlayer
                            ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900 border-slate-800 hover:border-amber-400/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{club.flag}</span>
                          <div>
                            <div className="text-xs font-black text-white truncate max-w-[130px]">{club.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {club.federation} • {club.country}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-black text-amber-300">{club.teamOvr} OVR</div>
                          <div className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5 justify-end">
                            <Eye className="w-3 h-3" /> {t('VIEW_LABEL') || 'View'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= CONTINENTAL & WORLD CUP NATIONAL TOURNAMENT DRAW ================= */}
        {currentStage === 'national_draw' && nationalDrawState && (
          <NationalTournamentDraw
            drawState={nationalDrawState}
            onCompleteDraw={handleCompleteNationalDraw}
            onClose={() => {
              if (pendingPostNationalStage === 'mid_season_post_tournament') {
                setCurrentStage('block2');
              } else if (pendingPostNationalStage === 'end_season_post_tournament') {
                setCurrentStage('summary');
              } else {
                setCurrentStage(pendingPostNationalStage || 'hub');
              }
            }}
          />
        )}

        {/* ================= CONTINENTAL & WORLD CUP NATIONAL TOURNAMENT HUB ================= */}
        {currentStage === 'national_tournament' && nationalTournamentState && (
          <NationalTournamentHub
            tournamentState={nationalTournamentState}
            player={player as PlayerCardData}
            onUpdateState={(st) => setNationalTournamentState(st)}
            onUpdatePlayer={(p) => onUpdatePlayer(p)}
            onFinishTournament={handleFinishNationalTournament}
            onOpenOutsideMenu={(menu) => {
              if (menu === 'dashboard') {
                setCurrentStage('hub');
              } else if (menu === 'profile') {
                if (onOpenDevelopment) onOpenDevelopment();
                else setCurrentStage('hub');
              } else {
                setCurrentStage('hub');
              }
            }}
          />
        )}

        {/* ================= STAGE 5: PRESEASON TRAINING & FREE STAT POINTS ================= */}
        {currentStage === 'training' && (() => {
          const allGroupsCompleted = areAllTrainingGroupsCompleted(player);
          const hasExtendedPreseason =
            (player.activePerkIds || []).includes('extended_pre_season') ||
            (player as any)?.perks?.some?.((p: any) => (typeof p === 'string' ? p : p?.id) === 'extended_pre_season');
          const totalPointsForFocus = hasExtendedPreseason ? 5 : 3;

          // If current group is completed but others are not, auto-fallback to available group
          const effectiveGroup = (!allGroupsCompleted && isTrainingGroupCompleted(player, selectedTrainingGroup))
            ? (getFirstAvailableTrainingGroup(player) || selectedTrainingGroup)
            : selectedTrainingGroup;

          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xl font-black text-white">{t('PRESEASON_TRAINING_TITLE')}</h3>
                  {hasExtendedPreseason && (
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/10">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('EXTENDED_PRESEASON_PERK_BADGE')}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  {isProfessionalPlayer(player) ? (
                    <>
                      {t('PRESEASON_PRO_DESC', {
                        points: getProCareerSeasonDevelopmentPoints(age + 1).points,
                        age: age + 1,
                      })}
                    </>
                  ) : (
                    <>
                      {t('PRESEASON_YOUTH_DESC', {
                        age: age + 1,
                      })}
                    </>
                  )}
                </p>
                {hasExtendedPreseason && (
                  <p className="text-xs text-amber-400/90 font-medium">
                    ⚡ {t('EXTENDED_PRESEASON_PERK_DESC')}
                  </p>
                )}
              </div>

              {/* All Groups Completed Celebration Banner */}
              {allGroupsCompleted && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 border-2 border-amber-400/50 shadow-2xl space-y-2">
                  <div className="flex items-center gap-2.5 text-amber-400 font-black text-sm">
                    <Award className="w-5 h-5 text-amber-300" />
                    <span>{t('ALL_GROUPS_COMPLETED_TITLE')}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t('ALL_GROUPS_COMPLETED_DESC', { points: totalPointsForFocus })}
                  </p>
                  <div className="inline-block px-3 py-1 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black font-mono">
                    {t('PRESEASON_ALL_POINTS_DIRECT', { points: totalPointsForFocus })}
                  </div>
                </div>
              )}

              {/* Training Group Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {TRAINING_GROUPS.map((group) => {
                  const isCompleted = isTrainingGroupCompleted(player, group.id);
                  const isSelected = effectiveGroup === group.id && !allGroupsCompleted;
                  const preview = previewPreseasonTrainingAllocations(player, group.id);
                  const groupName = translateTrainingGroupName(group.id, currentLanguage);
                  const groupDesc = translateTrainingGroupDesc(group.id, currentLanguage);

                  return (
                    <div
                      key={group.id}
                      onClick={() => {
                        if (isCompleted || allGroupsCompleted) return;
                        setSelectedTrainingGroup(group.id);
                        onUpdatePlayer({ ...player, selectedTrainingGroup: group.id });
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                        isCompleted || allGroupsCompleted
                          ? 'border-slate-800/80 bg-slate-950/60 opacity-50 grayscale cursor-not-allowed'
                          : isSelected
                          ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/30 cursor-pointer shadow-lg shadow-amber-500/10'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/90 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          {group.code}
                        </span>
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-400/30 tracking-tight">
                            {t('STAT_GROUP_COMPLETED')}
                          </span>
                        ) : isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        ) : null}
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-white">{groupName}</h4>
                        <p className="text-xs text-slate-400 leading-snug">{groupDesc}</p>
                      </div>

                      {/* Stat Breakdown with overflow redirection / max preview */}
                      <div className="space-y-1 pt-1 border-t border-slate-800/80">
                        {preview.allocations.map((alloc) => {
                          const attrName = translateAttributeName(alloc.statKey, currentLanguage);
                          const isMax = alloc.finalValue >= 99;
                          const hasGain = alloc.pointsAdded > 0;

                          return (
                            <div key={alloc.statKey} className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-slate-300">{attrName}</span>
                              <span className="flex items-center gap-1">
                                <span className={isMax ? 'text-amber-400 font-bold' : 'text-white'}>
                                  {alloc.originalValue}
                                </span>
                                {hasGain && (
                                  <span className="text-emerald-400 font-black">
                                    +{alloc.pointsAdded} → {alloc.finalValue}
                                  </span>
                                )}
                                {isMax && alloc.originalValue >= 99 && (
                                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black">
                                    MAX
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                        {preview.directStatPointsAdded > 0 && !allGroupsCompleted && (
                          <div className="text-[10px] text-amber-400 font-mono pt-1">
                            +{preview.directStatPointsAdded} {t('PRESEASON_ALL_POINTS_DIRECT', { points: preview.directStatPointsAdded })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  onClick={handleFinishTraining}
                  className="px-8 py-3.5 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>{t('PRESEASON_COMPLETE_BTN')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* ================= STAGE 6: GAME OVER SCREEN ================= */}
        {currentStage === 'game_over' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">{t('GAME_OVER_TITLE')}</h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                {t('GAME_OVER_SUB')}
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3.5 rounded-2xl text-xs font-black text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('GAME_OVER_RETURN_BTN')}</span>
            </button>
          </div>
        )}
        </>
        )}
        </>
        )}

        {/* ================= KEY MATCH MODAL INSTANCE ================= */}
        {keyMatchModalConfig?.isOpen && (
          <KeyMatchModal
            isOpen={keyMatchModalConfig.isOpen}
            player={player}
            stageTitle={keyMatchModalConfig.stageTitle}
            opponentName={keyMatchModalConfig.opponentName}
            opponentOvr={keyMatchModalConfig.opponentOvr}
            onMatchComplete={handleKeyMatchCompleted}
          />
        )}

        {/* ================= CAREER KEY MATCH MODE SELECTOR MODAL ================= */}
        {showCareerModeModal && (
          <CareerModeSelectorModal
            isOpen={showCareerModeModal}
            currentMode={player.keyMatchPlayMode || 'decisive'}
            onSelectMode={(mode) => {
              onUpdatePlayer({
                ...player,
                keyMatchPlayMode: mode,
              });
              setShowCareerModeModal(false);
            }}
            isInitialSetup={false}
            onClose={() => setShowCareerModeModal(false)}
          />
        )}

        {/* ================= BLOCK KEY MATCH MODAL INSTANCE ================= */}
        {blockKeyMatchModalConfig?.isOpen && (
          <KeyMatchModal
            isOpen={blockKeyMatchModalConfig.isOpen}
            player={player}
            stageTitle={
              blockKeyMatchModalConfig.match.importanceReason ||
              blockKeyMatchModalConfig.match.stageName ||
              'Key Match'
            }
            opponentName={
              blockKeyMatchModalConfig.match.isPlayerHome
                ? blockKeyMatchModalConfig.match.awayTeamName
                : blockKeyMatchModalConfig.match.homeTeamName
            }
            opponentOvr={
              (blockKeyMatchModalConfig.match as any).opponentOvr ||
              (blockKeyMatchModalConfig.match.importanceCategory === 'DEFINITIVE' ? 78 : 70)
            }
            playerMatchStatus={blockKeyMatchModalConfig.match.playerStatus as any}
            subEntryMinute={
              (blockKeyMatchModalConfig.match as any).subEntryMinute ||
              (blockKeyMatchModalConfig.match.playerStatus === 'sub_in' ? 60 : undefined)
            }
            subExitMinute={
              (blockKeyMatchModalConfig.match as any).subExitMinute ||
              (blockKeyMatchModalConfig.match.playerStatus === 'sub_out' ? 65 : undefined)
            }
            onMatchComplete={(summary) => {
              const match = blockKeyMatchModalConfig.match;
              setBlockKeyMatchModalConfig(null);
              setPendingBlockKeyMatch(null);

              // Update the match result with real player performance from the Key Match QTE
              const playerHome = match.isPlayerHome;
              const updatedMatch: SimulatedMatchResult = {
                ...match,
                isKeyMatch: true,
                importanceCategory: match.importanceCategory || 'IMPORTANT',
                playerStatus: (match.playerStatus as any) || 'starter',
                minutesPlayed: match.playerStatus === 'sub_in' ? 30 : 90,
                playerTeamScore: summary.playerTeamScore,
                opponentScore: summary.opponentTeamScore,
                homeScore: playerHome ? summary.playerTeamScore : summary.opponentTeamScore,
                awayScore: playerHome ? summary.opponentTeamScore : summary.playerTeamScore,
                playerGoals: summary.playerStats.goals,
                playerAssists: summary.playerStats.assists,
                playerRating: summary.playerStats.rating,
                isMvp: summary.mvpStatus === 'MVP 🏆' || summary.mvpStatus === 'Top Performer ⭐',
                playerFitness: Math.max(20, (match.playerFitness ?? player.fitness ?? 75) - 8),
              };

              const totalMatchesInBlock = pendingBlockMatches.length || 9;
              const currentChem = player.chemistry ?? 50;
              const perMatchChemGain = 50 / totalMatchesInBlock;
              const activeCap = getActiveChemistryCap(player.chemistryCeiling, player.chemistryCeilingMonthsRemaining, player.chemistryCaps);
              const maxAllowedChem = activeCap ?? 100;
              const newChem = Math.min(maxAllowedChem, Math.round((currentChem + perMatchChemGain) * 10) / 10);

              const basePlayer = summary.updatedPlayer || player;
              const updatedPlayerWithStats: PlayerConfig = {
                ...basePlayer,
                fitness: updatedMatch.playerFitness,
                staminaCurrent: updatedMatch.playerFitness,
                chemistry: newChem,
                totalMatchesPlayed: (basePlayer.totalMatchesPlayed || 0) + 1,
                totalGoalsScored: (basePlayer.totalGoalsScored || 0) + (summary.playerStats.goals || 0),
                totalAssistsProvided: (basePlayer.totalAssistsProvided || 0) + (summary.playerStats.assists || 0),
              };

              onUpdatePlayer(updatedPlayerWithStats);

              // Update pending matches list so displayed matches and pending queue match precisely
              const currentDisplayedCount = displayedBlockMatches.length;
              const updatedPending = [...pendingBlockMatches];
              updatedPending[currentDisplayedCount] = updatedMatch;
              setPendingBlockMatches(updatedPending);

              setDisplayedBlockMatches((prev) => [...prev, updatedMatch]);

              if (updatedMatch.competitionType === 'continental' || updatedMatch.continentalCompId) {
                const cYear = parseInt(seasonYear.split('/')[0]) || 2026;
                syncContinentalSimulationAfterMatch(updatedPlayerWithStats, updatedMatch, cYear, onUpdatePlayer);
              }

              // Resume simulation smoothly
              setIsPaused(false);
            }}
          />
        )}

        {/* ================= RELEGATION / PROMOTION PLAYOFF KEY MATCH MODAL ================= */}
        {playoffKeyMatchConfig?.isOpen && (
          <KeyMatchModal
            isOpen={playoffKeyMatchConfig.isOpen}
            player={player}
            stageTitle={playoffKeyMatchConfig.stageTitle}
            opponentName={playoffKeyMatchConfig.opponentName}
            opponentOvr={playoffKeyMatchConfig.opponentOvr}
            onMatchComplete={handlePlayoffKeyMatchCompleted}
          />
        )}

        {/* ================= YOUTH LEAGUE CARD MODAL INSTANCE ================= */}
        {youthCardModalConfig?.isOpen && (
          <YouthCardModal
            isOpen={youthCardModalConfig.isOpen}
            player={player}
            seasonLabel={youthCardModalConfig.seasonLabel}
            drawnCards={youthCardModalConfig.cards}
            onSelectCard={handleSelectYouthCard}
          />
        )}

        {/* ================= CAREER STAGE CARD MODAL INSTANCE (SPONSOR/LIFESTYLE/CAREER CARDS) ================= */}
        {isCareerCardModalOpen && (
          <CareerStageCardModal
            isOpen={isCareerCardModalOpen}
            player={player}
            accounting={accounting}
            manager={manager}
            seasonLabel={careerCardDrawType === 'mid_season' ? 'Mid-Season Draw (Dec-Jan)' : 'Pre-Season Draw (Jul-Aug)'}
            onSelectCard={(updatedPlayer, updatedAccounting, updatedManager) => {
              setIsCareerCardModalOpen(false);
              onUpdatePlayer(updatedPlayer);
              if (updatedAccounting && onUpdateAccounting) onUpdateAccounting(updatedAccounting);
              if (updatedManager && onUpdateManager) onUpdateManager(updatedManager);
              if (
                careerCardDrawType === 'pre_season' ||
                currentStage === 'summary' ||
                currentStage === 'tournament' ||
                (currentStage as string) === 'hub' ||
                (currentStage as string) === 'preseason_draw'
              ) {
                setCurrentStage('training');
              } else {
                setCurrentStage('block2');
              }
            }}
            onClose={() => {
              setIsCareerCardModalOpen(false);
              if (
                careerCardDrawType === 'pre_season' ||
                currentStage === 'summary' ||
                currentStage === 'tournament'
              ) {
                setCurrentStage('training');
              }
            }}
          />
        )}

        {/* ================= GROWTH SPURT MODAL INSTANCE ================= */}
        {growthSpurtModalData && (
          <GrowthSpurtModal
            isOpen={!!growthSpurtModalData}
            growthCm={growthSpurtModalData.growthCm}
            oldHeight={growthSpurtModalData.oldHeight}
            newHeight={growthSpurtModalData.newHeight}
            oldWeight={growthSpurtModalData.oldWeight}
            newWeight={growthSpurtModalData.newWeight}
            onClose={() => setGrowthSpurtModalData(null)}
          />
        )}

        {/* ================= CAREER LIFECYCLE MILESTONE MODAL ================= */}
        {lifecycleMilestoneData && (
          <CareerLifecycleMilestoneModal
            isOpen={!!lifecycleMilestoneData}
            data={lifecycleMilestoneData}
            onClose={() => setLifecycleMilestoneData(null)}
          />
        )}

        {/* ================= COMPETITION START MODAL ================= */}
        {compStartModalConfig && (
          <CompetitionStartModal
            isOpen={!!compStartModalConfig}
            data={compStartModalConfig}
            onStart={handleConfirmStartCompetition}
          />
        )}

        {/* ================= INTERNATIONAL TEAM INSPECTION MODAL ================= */}
        {inspectingClub && (
          <InternationalTeamInfoModal
            isOpen={!!inspectingClub}
            club={inspectingClub}
            onClose={() => setInspectingClub(null)}
          />
        )}

        {/* ================= PRE-SEASON CROSSROADS EVENT MODAL ================= */}
        {showPreseasonCrossroadsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-amber-950/40 relative overflow-hidden">
              {/* Header background accents */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
                    <Sun className="w-3.5 h-3.5" />
                    <span>{t("Pre-Season Crossroads Event")}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {t("Summer Preparations")}
                  </h2>
                  <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                    {t("You're in the midst of pre-season! Before the grueling competitive fixtures begin, you face a pivotal fork in the road. How do you intend to allocate your summer preparation window?")}
                  </p>
                </div>

                {/* Choices */}
                <div className="grid grid-cols-1 gap-3.5">
                  {/* Choice 1: Sponsorship */}
                  {(() => {
                    const isPro = isProfessionalPlayer(player);
                    const annualSalary = accounting?.yearlySalary || (isPro ? 45000 : 15000);
                    const sponsorshipAmount = Math.max(10000, Math.round(annualSalary * 0.20));
                    return (
                      <button
                        type="button"
                        onClick={() => handlePreseasonCrossroadsChoice('sponsorship')}
                        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/60 hover:bg-amber-950/30 border border-slate-700/80 hover:border-amber-500/50 transition-all text-left space-y-2 sm:space-y-0"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                              <span>1. {t("Commercial Endorsement Campaign")}</span>
                              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold">
                                +20% {t("Salary")}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {t("Sign a lucrative pre-season commercial endorsement campaign.")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right sm:text-right shrink-0">
                          <span className="text-sm font-black text-amber-400">
                            +€{sponsorshipAmount.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    );
                  })()}

                  {/* Choice 2: Early Training -> Extended Pre-Season perk */}
                  <button
                    type="button"
                    onClick={() => handlePreseasonCrossroadsChoice('early_training')}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/60 hover:bg-orange-950/30 border border-slate-700/80 hover:border-orange-500/50 transition-all text-left space-y-2 sm:space-y-0"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-orange-300 transition-colors flex items-center gap-2">
                          <span>2. {t("Report Early to Training Camp")}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 font-semibold">
                            {t("+5 to All 3 Group Stats")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t("Arrive early to master tactical regimes. Unlocks Extended Pre-Season (+5 to all 3 stats in your chosen training group; redistributes if near 99, or grants free stat points).")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-orange-400 px-2 py-1 bg-orange-500/10 rounded border border-orange-500/20">
                        {t("Extended Pre-Season")}
                      </span>
                    </div>
                  </button>

                  {/* Choice 3: Rest & Vacation -> Relaxing Vacations perk */}
                  <button
                    type="button"
                    onClick={() => handlePreseasonCrossroadsChoice('vacation')}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/60 hover:bg-teal-950/30 border border-slate-700/80 hover:border-teal-500/50 transition-all text-left space-y-2 sm:space-y-0"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-teal-300 transition-colors flex items-center gap-2">
                          <span>3. {t("Dedicated Rest & Wellness Vacation")}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-semibold">
                            -10% {t("Injury Risk")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t("You rest well during your vacation. You return with 10 less stamina during the first 2 months of the season until you recover your form, but you have 10% less injury chance.")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-teal-400 px-2 py-1 bg-teal-500/10 rounded border border-teal-500/20">
                        {t("Relaxing Vacations")}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= NICKNAME EVENT MODAL ================= */}
        {showNicknameModal && (
          <NicknameEventModal
            isOpen={showNicknameModal}
            player={player}
            featConfig={featNicknameForModal}
            onAcceptNickname={(updatedPlayer) => {
              setShowNicknameModal(false);
              const wasPreseason = isPreseasonDrawPending;
              setIsPreseasonDrawPending(false);
              setFeatNicknameForModal(null);
              onUpdatePlayer(updatedPlayer);
              if (wasPreseason) {
                if (evaluatePreseasonCrossroadsRoll(updatedPlayer)) {
                  return;
                }
                const triggered = evaluatePreseasonAgentRoll(updatedPlayer);
                if (!triggered) {
                  executePreseasonDraw(updatedPlayer);
                }
              }
            }}
            onDeclineNickname={(updatedPlayer) => {
              setShowNicknameModal(false);
              const wasPreseason = isPreseasonDrawPending;
              setIsPreseasonDrawPending(false);
              setFeatNicknameForModal(null);
              onUpdatePlayer(updatedPlayer);
              if (wasPreseason) {
                if (evaluatePreseasonCrossroadsRoll(updatedPlayer)) {
                  return;
                }
                const triggered = evaluatePreseasonAgentRoll(updatedPlayer);
                if (!triggered) {
                  executePreseasonDraw(updatedPlayer);
                }
              }
            }}
          />
        )}

        {/* ================= PRE-SEASON AGENT RECRUITMENT OFFER MODAL ================= */}
        {showAgentOfferModal && (preseasonAgentOffers.length > 0 || preseasonAgentOffer) && (
          <ManagerRecruitmentOfferModal
            isOpen={showAgentOfferModal}
            offers={preseasonAgentOffers.length > 0 ? preseasonAgentOffers : (preseasonAgentOffer ? [preseasonAgentOffer] : [])}
            player={player}
            onSelectManager={handleAcceptAgentRecruitmentOffer}
            onDeclineAll={handleDeclineAgentRecruitmentOffer}
          />
        )}

        {/* ================= INTERNATIONAL CALL-UP MODAL ================= */}
        {activeIntCallUp && (
          <InternationalCallUpModal
            isOpen={Boolean(activeIntCallUp)}
            callUp={activeIntCallUp}
            player={player}
            onAccept={handleAcceptIntCallUp}
            onDecline={handleDeclineIntCallUp}
            onChooseOtherNation={handleChooseOtherNation}
            hasAlternativeNationalities={hasAlternativeNationalities}
            onClose={() => {
              handleDeclineIntCallUp(activeIntCallUp);
            }}
          />
        )}

        {/* ================= UNIFIED INTERNATIONAL FOOTBALL SYSTEM LIVE HUB ================= */}
        <InternationalLiveHubModal
          isOpen={showYouthIntLiveHub}
          hubState={youthIntHubState}
          player={player}
          onClose={() => setShowYouthIntLiveHub(false)}
          onPlayKeyMatch={handlePlayYouthIntKeyMatch}
          onSimulateMatch={handleSimulateYouthIntMatch}
          onAdvanceToNextMatch={() => {}}
          onConcludeInternationalDuty={handleConcludeYouthIntDuty}
        />

        {/* ================= YOUTH INTERNATIONAL KEY MATCH MODAL ================= */}
        {youthIntKeyMatchConfig && (
          <KeyMatchModal
            isOpen={youthIntKeyMatchConfig.isOpen}
            player={player}
            playerTeamName={
              youthIntHubState
                ? `${youthIntHubState.callingNation.name}${youthIntHubState.tier === 'Senior' ? '' : ` ${youthIntHubState.tier}`}`
                : undefined
            }
            stageTitle={youthIntKeyMatchConfig.stageTitle}
            opponentName={youthIntKeyMatchConfig.opponentName}
            opponentOvr={youthIntKeyMatchConfig.opponentOvr}
            onMatchComplete={handleYouthIntKeyMatchCompleted}
          />
        )}

        {/* ================= CONTINENTAL DRAW PRESENTATION MODAL ================= */}
        {showContinentalDrawModal && pendingContinentalDraw && (
          <ContinentalDrawModal
            isOpen={showContinentalDrawModal}
            onClose={() => {
              setShowContinentalDrawModal(false);
              if (pendingBlockAfterDraw) {
                const target = pendingBlockAfterDraw;
                setPendingBlockAfterDraw(null);
                executeBlockStart(target);
              }
            }}
            tournamentState={pendingContinentalDraw}
            playerClubId={player.clubId}
            playerClubName={player.club}
          />
        )}

        {/* ================= NATIONAL TEAM DRAW CEREMONY MODAL ================= */}
        {showNationalTeamDrawModal && pendingNationalTeamDraw && (
          <NationalTeamDrawModal
            isOpen={showNationalTeamDrawModal}
            drawState={pendingNationalTeamDraw}
            onClose={() => {
              setShowNationalTeamDrawModal(false);
              setPendingNationalTeamDraw(null);
            }}
            onDrawCompleted={(completedState) => {
              saveDrawState(completedState);
              setShowNationalTeamDrawModal(false);
              setPendingNationalTeamDraw(null);
              if (pendingBlockAfterDraw) {
                const target = pendingBlockAfterDraw;
                setPendingBlockAfterDraw(null);
                const output = generateYouthBlockMatches(player, target === 'block1' ? 1 : 2, true);
                if (target === 'block1') {
                  setBlock1Stats(output.aggregatedStats);
                  setBlock1MatchList(output.matches);
                  setPendingBlockMatches(output.matches);
                } else {
                  setBlock2Stats(output.aggregatedStats);
                  setBlock2MatchList(output.matches);
                  setPendingBlockMatches(output.matches);
                }
                executeBlockStart(target, output.matches);
              }
            }}
          />
        )}

        {/* ================= CONTINENTAL DRAWS SUMMARY MODAL (WHEN PLAYER CLUB NOT PARTICIPATING) ================= */}
        {showContinentalDrawsSummaryModal && (
          <ContinentalDrawsSummaryModal
            isOpen={showContinentalDrawsSummaryModal}
            onClose={() => {
              setShowContinentalDrawsSummaryModal(false);
              if (pendingBlockAfterDraw) {
                const target = pendingBlockAfterDraw;
                setPendingBlockAfterDraw(null);
                executeBlockStart(target);
              }
            }}
            region={flowConfig.region}
            seasonYear={seasonYear}
            player={player}
          />
        )}

        {/* ================= CONTINENTAL DASHBOARD MODAL ================= */}
        {showContinentalModal && (
          <ContinentalDashboardModal
            isOpen={showContinentalModal}
            onClose={() => setShowContinentalModal(false)}
            player={player}
            leagueDb={getCareerLeagueDatabase()}
            currentSeasonYear={parseInt(seasonYear.split('/')[0]) || 2026}
            onPlayerUpdate={onUpdatePlayer}
          />
        )}

        {/* ================= INTERNATIONAL TOURNAMENT & QUALIFIER MODAL (LEGACY) ================= */}
        {showIntTournamentModal && (
          <InternationalTournamentModal
            isOpen={showIntTournamentModal}
            qualifierSummary={intQualifierSummary}
            worldCupSummary={intWorldCupSummary}
            onClose={handleCloseIntTournamentModal}
          />
        )}

        {/* ================= ACADEMY DEVELOPMENT MODAL ================= */}
        {academyDevReport && (
          <AcademyDevelopmentModal
            report={academyDevReport}
            onClose={() => setAcademyDevReport(null)}
          />
        )}

        {/* ================= FREE AGENT 3-CHOICE HUB MODAL ================= */}
        {showFreeAgentHubModal && (
          <FreeAgentHubModal
            isOpen={showFreeAgentHubModal}
            player={player}
            manager={manager}
            accounting={accounting}
            period={freeAgentPeriod}
            onClose={() => setShowFreeAgentHubModal(false)}
            onPlayStreets={handleFreeAgentPlayStreets}
            onRunTryoutSuccess={(offers) => {
              setUnifiedOffers(offers);
              setShowUnifiedOffersModal(true);
            }}
            onRunTryoutFail={(feedback) => {
              if (freeAgentPeriod === 'pre_season') {
                setFreeAgentPeriod('mid_season');
              } else {
                setFreeAgentPeriod('pre_season');
                onUpdatePlayer({ ...player, age: (player.age || 18) + 1 });
              }
              if (showToast) showToast(feedback);
            }}
            onAgentFindClubs={(offers) => {
              setUnifiedOffers(offers);
              setShowUnifiedOffersModal(true);
            }}
            onGetAgentSuccess={() => {
              const candidateOffers = generatePreseasonManagerOffers(player);
              setPreseasonAgentOffers(candidateOffers);
              setPreseasonAgentOffer(candidateOffers[0] || null);
              setShowAgentOfferModal(true);
              if (showToast) showToast('🤝 Agency pitches received! Choose your agent.');
            }}
            onGetAgentFail={(feedback) => {
              if (showToast) showToast(feedback);
            }}
            onAdvanceSixMonths={(reason) => {
              if (freeAgentPeriod === 'pre_season') {
                setFreeAgentPeriod('mid_season');
              } else {
                setFreeAgentPeriod('pre_season');
                onUpdatePlayer({ ...player, age: (player.age || 18) + 1 });
              }
              if (showToast) showToast(reason);
            }}
          />
        )}

        {/* ================= FREE AGENT STREET CARD DRAW MODAL ================= */}
        {showFreeAgentStreetCards && freeAgentStreetCards.length > 0 && (
          <StreetCardModal
            isOpen={showFreeAgentStreetCards}
            cards={freeAgentStreetCards}
            title="Free Agent Street Session (4 Cards)"
            subtitle="Pick 1 street session card to develop your raw attributes during your 6 months without a club."
            onSelectStreetCard={handleSelectFreeAgentStreetCard}
            onClose={() => setShowFreeAgentStreetCards(false)}
          />
        )}

        {/* ================= UNIFIED CLUB OFFER MODAL ================= */}
        {showUnifiedOffersModal && (unifiedOffers.length > 0 || !!specialOpportunityOffer) && (
          <UnifiedClubOfferModal
            isOpen={showUnifiedOffersModal}
            offers={unifiedOffers.slice(0, 4)}
            specialOpportunity={specialOpportunityOffer}
            player={player}
            manager={manager}
            accounting={accounting}
            onAcceptOffer={handleAcceptUnifiedOffer}
            onAcceptSpecialOpportunity={(offer) => {
              handleAcceptUnifiedOffer(offer);
              setSpecialOpportunityOffer(null);
            }}
            onDeclineSpecialOpportunity={() => {
              setSpecialOpportunityOffer(null);
              if (showToast) showToast('Special Opportunity declined.');
            }}
            onDeclineAll={() => {
              setShowUnifiedOffersModal(false);
              setUnifiedOffers([]);
              if (showToast) showToast('Declined current club offers.');
            }}
            onWait={() => setShowUnifiedOffersModal(false)}
            onClose={() => setShowUnifiedOffersModal(false)}
          />
        )}

        {/* ================= TRANSFER OFFER INTERRUPTION MODAL ================= */}
        {interruptedRegularOffer && (
          <TransferOfferInterruptionModal
            isOpen={Boolean(interruptedRegularOffer)}
            offer={interruptedRegularOffer}
            player={player}
            onAccept={() => handleAcceptInterruptedRegularOffer(interruptedRegularOffer)}
            onWait={() => handleWaitInterruptedRegularOffer(interruptedRegularOffer)}
            onDecline={() => handleDeclineInterruptedRegularOffer(interruptedRegularOffer)}
          />
        )}

        {/* ================= SPECIAL SIGN-IN EVENT MODAL ================= */}
        {interruptedSpecialEvent && (
          <SpecialSignInEventModal
            isOpen={Boolean(interruptedSpecialEvent)}
            evaluation={interruptedSpecialEvent}
            player={player}
            onReceiveProposal={() => handleReceiveSpecialProposal(interruptedSpecialEvent)}
            onWait={() => handleWaitSpecialProposal(interruptedSpecialEvent)}
            onDecline={() => handleDeclineSpecialProposal(interruptedSpecialEvent)}
          />
        )}

        {/* ================= FREE AGENT LEAGUE TRYOUT PICKER MODAL ================= */}
        {freeAgentTryoutLeaguePicker && (
          <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-400 flex items-center justify-center font-black">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Select League for Open Tryouts</h3>
                    <p className="text-xs text-slate-400">Choose where to showcase your talent. 6 months will elapse during trials.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFreeAgentTryoutLeaguePicker(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
                {getAvailableTryoutLeagues().map((lg) => {
                  const chanceRate = Math.min(95, Math.max(5, 50 + ((player.ovr || 65) - lg.averageStarterOvr) * 5));
                  return (
                    <div
                      key={lg.leagueId}
                      onClick={() => handleFreeAgentRunTryout(lg)}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white group-hover:text-blue-300 transition">
                            {lg.flagEmoji} {lg.leagueName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {lg.countryName}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {lg.prestigeLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Avg Starter: <strong className="text-slate-200">{lg.averageStarterOvr} OVR</strong> • Est. Success Chance:{' '}
                          <strong className={chanceRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}>{chanceRate}%</strong>
                        </p>
                      </div>

                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white font-black text-xs shrink-0 flex items-center gap-1.5 shadow-md"
                      >
                        <span>Attend Trial</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= FREE AGENT DIRECTIVE PICKER MODAL ================= */}
        {freeAgentDirectivePicker && (
          <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 text-purple-400 flex items-center justify-center font-black">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Agent Directive: What do you want?</h3>
                    <p className="text-xs text-slate-400">{manager?.name || 'Agent'} will filter clubs based on your goal.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFreeAgentDirectivePicker(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* 1. Glory */}
                <button
                  type="button"
                  onClick={() => handleFreeAgentDirective('glory')}
                  className="w-full p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800/70 text-left transition flex items-start gap-3.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-amber-300 uppercase">1. "I want glory"</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Target elite prestige clubs competing for domestic league titles and Champions League trophies.
                    </p>
                  </div>
                </button>

                {/* 2. Potential (< 28) */}
                {(player.age || 18) < 28 && (
                  <button
                    type="button"
                    onClick={() => handleFreeAgentDirective('potential')}
                    className="w-full p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-800/70 text-left transition flex items-start gap-3.5 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">
                      📈
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-emerald-300 uppercase">2. "I want to reach my potential"</h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Target clubs with high development tiers & guaranteed starter minutes (Available under age 28).
                      </p>
                    </div>
                  </button>
                )}

                {/* 3. Money */}
                <button
                  type="button"
                  onClick={() => handleFreeAgentDirective('money')}
                  className="w-full p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800/70 text-left transition flex items-start gap-3.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black shrink-0">
                    💰
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-cyan-300 uppercase">3. "I want money"</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Target maximum weekly wages, highest signing bonuses, and lucrative opportunities in Saudi Pro League.
                    </p>
                  </div>
                </button>

                {/* 4. Find me a team */}
                <button
                  type="button"
                  onClick={() => handleFreeAgentDirective('any')}
                  className="w-full p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 hover:border-purple-400 hover:bg-slate-800/70 text-left transition flex items-start gap-3.5 cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-black shrink-0">
                    🌐
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-purple-300 uppercase">4. "Just find me a team"</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Broad search across all domestic and international clubs willing to sign you immediately.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ================= AUTHORITATIVE WORLD SIMULATION RESULTS MODAL ================= */}
        <WorldResultsModal
          isOpen={isWorldResultsOpen}
          onClose={() => setIsWorldResultsOpen(false)}
          player={player}
          seasonYear={seasonYear}
          currentStage={currentStage}
          block1Count={block1MatchList.length}
          block2Count={block2MatchList.length}
          activeBlock={activeSimulatingBlock}
        />

        {/* ================= WORLD INDIVIDUAL AWARDS CEREMONY MODAL ================= */}
        <AwardsCeremonyModal
          isOpen={showAwardsCeremonyModal}
          onClose={() => {
            markWorldAwardsRevealed(seasonYear);
            setWorldAwardsRevealed(true);
            setShowAwardsCeremonyModal(false);
          }}
          awardsData={currentSeasonWorldAwards}
          player={player}
          seasonYear={seasonYear}
        />

        {/* ================= DRAWSTAR DEDICATED SEASON SUMMARY FULL-SCREEN MODAL ================= */}
        {showSeasonSummaryModal && isProfessionalPlayer(player) && (
          <SeasonSummaryModal
            isOpen={showSeasonSummaryModal}
            player={player as PlayerCardData}
            seasonYear={seasonYear}
            onProceedToPreseason={() => {
              setShowSeasonSummaryModal(false);
              handleStartPreseasonDraw();
            }}
            onClose={() => setShowSeasonSummaryModal(false)}
            worldAwardsData={currentSeasonWorldAwards}
            playerStanding={playerStanding as any}
            nationalTournamentState={nationalTournamentState}
            latestIntTournamentResult={latestIntTournamentResult}
            block1Stats={block1Stats}
            block2Stats={block2Stats}
          />
        )}

        {/* ================= FIRST TEAM PRE-SEASON FRIENDLY CUP MODAL ================= */}
        <PreseasonFriendlyCupModal
          isOpen={showPreseasonFriendlyModal}
          onClose={() => {
            setShowPreseasonFriendlyModal(false);
            setHasPlayedPreseasonFriendlyCup(true);
            continuePreseasonDrawSequence(player);
          }}
          player={player}
          seasonYear={seasonYear}
          onUpdatePlayer={onUpdatePlayer}
          onCompletedTournament={(res) => {
            setHasPlayedPreseasonFriendlyCup(true);
          }}
        />

        {/* ================= AGE 16 YOUTH ACADEMY FAREWELL MODAL ================= */}
        <YouthAcademyFarewellModal
          player={player}
          isOpen={showAge16FarewellModal}
          onProceedToOffers={handleProceedToAge16Offers}
          onClose={() => setShowAge16FarewellModal(false)}
        />

        {/* ================= AGE 16 PROFESSIONAL TRANSFER OFFERS MODAL ================= */}
        <Age16TransferOffersModal
          player={player}
          offers={age16Offers}
          isOpen={showAge16OffersModal}
          manager={manager}
          onAcceptOffer={handleAcceptAge16Offer}
          onDeclineAllOffers={handleDeclineAge16Offers}
          onClose={handleDeclineAge16Offers}
          onLaunchTryouts={() => {
            setShowAge16OffersModal(false);
            setFreeAgentTryoutLeaguePicker(true);
          }}
          onSpeakWithAgent={() => {
            setShowAge16OffersModal(false);
            if (manager) {
              if (showToast) showToast(`🤝 Consulting ${manager.name || 'Agent'} for club placement opportunities...`);
            } else {
              setShowAgentOfferModal(true);
            }
          }}
        />

        {/* ================= PREMIER LEAGUE WANTS YOU EVENT MODAL ================= */}
        {showPremierLeagueModal && (
          <PremierLeagueEventModal
            isOpen={showPremierLeagueModal}
            player={player}
            manager={manager}
            accounting={accounting}
            onCompleteTransfer={handleCompletePremierLeagueTransfer}
            onClose={handleClosePremierLeagueModal}
          />
        )}

        {/* ================= HOT PROSPECT CONTINENTAL EVENT MODAL ================= */}
        {showHotProspectModal && (
          <HotProspectEventModal
            isOpen={showHotProspectModal}
            player={player}
            manager={manager}
            accounting={accounting}
            onCompleteTransfer={handleCompleteHotProspectTransfer}
            onClose={handleCloseHotProspectModal}
          />
        )}

        {/* ================= BIGGER YOUTH CLUB ADAPTATION MODAL ================= */}
        {showAdaptationModal && adaptationEventSeason && (
          <YouthClubAdaptationModal
            isOpen={showAdaptationModal}
            season={adaptationEventSeason}
            clubName={player.biggerYouthClubName || player.club || 'Youth Club'}
            onConfirm={handleConfirmYouthAdaptation}
          />
        )}

        {/* ================= YOUTH ACADEMY COMMENCEMENT & GRADUATION MODAL ================= */}
        <YouthGraduationModal
          isOpen={showYouthGraduationModal}
          player={player}
          managerName={manager?.name || player.youthCoachName}
          onComplete={() => setShowYouthGraduationModal(false)}
        />
      </div>
  );

  if (embedded) {
    return contentJSX;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
      {contentJSX}
    </div>
  );
};
