import React, { useState, useMemo } from 'react';
import { PlayerCardData, AccountingState, ManagerState, StoreUpgradeItem, FontSizeOption, BusinessItem, TrophyItem } from '../types';
import { PlayerCard } from './PlayerCard';
import type { ChampionTitleData } from './ChampionsCelebrationModal';
import { PlayerDevelopmentPanel } from './PlayerDevelopmentPanel';
import { DevelopmentStagePanel } from './DevelopmentStagePanel';

const TrophyCabinet = React.lazy(() => import('./TrophyCabinet').then(m => ({ default: m.TrophyCabinet })));
const CardsCollectionPanel = React.lazy(() => import('./CardsCollectionPanel').then(m => ({ default: m.CardsCollectionPanel })));
const BuyBusinessModal = React.lazy(() => import('./BuyBusinessModal').then(m => ({ default: m.BuyBusinessModal })));
const ParentAdviceModal = React.lazy(() => import('./ParentAdviceModal').then(m => ({ default: m.ParentAdviceModal })));
const CustomizationModal = React.lazy(() => import('./CustomizationModal').then(m => ({ default: m.CustomizationModal })));
const CareerStageCardModal = React.lazy(() => import('./CareerStageCardModal').then(m => ({ default: m.CareerStageCardModal })));
const CareerEndingInjuryModal = React.lazy(() => import('./CareerEndingInjuryModal').then(m => ({ default: m.CareerEndingInjuryModal })));
const CareerStatisticsPanel = React.lazy(() => import('./CareerStatisticsPanel').then(m => ({ default: m.CareerStatisticsPanel })));
const PerksPanel = React.lazy(() => import('./PerksPanel').then(m => ({ default: m.PerksPanel })));
const NationalTeamPanel = React.lazy(() => import('./NationalTeamPanel').then(m => ({ default: m.NationalTeamPanel })));
const KeyMatchModal = React.lazy(() => import('./KeyMatchModal').then(m => ({ default: m.KeyMatchModal })));
const InjuryNotificationModal = React.lazy(() => import('./InjuryNotificationModal').then(m => ({ default: m.InjuryNotificationModal })));
const DeveloperTestDashboard = React.lazy(() => import('./DeveloperTestDashboard').then(m => ({ default: m.DeveloperTestDashboard })));
const CompetitionStartModal = React.lazy(() => import('./CompetitionStartModal').then(m => ({ default: m.CompetitionStartModal })));
import { ParentAdviceEffect } from '../types/parentCards';
import { BUSINESS_TEMPLATES, formatEuros, calculateSeasonFinancials, BusinessTemplate } from '../data/businesses';
import { getInfamyTierInfo, getBadFameDrawChancePercent } from '../utils/cardsCollectionSystem';
import { getFitnessPercentage, useRecoveryPoint as processUseRecoveryPoint } from '../utils/staminaInjurySystem';
import { getChemistryInfo, applyTransferRequestPenalty, applyMonthlyChemistryGrowth, getActiveChemistryCap } from '../utils/chemistrySystem';
import {
  type CompetitionStartData,
  detectCompetitionType,
  calculateTeamExpectation,
} from './CompetitionStartModal';
import { KeyMatchFinalSummary } from '../types/keyMatch';
import { InternationalCallUpModal } from './InternationalCallUpModal';
import { InternationalTournamentModal } from './InternationalTournamentModal';
import { InternationalLiveHubModal } from './InternationalLiveHubModal';
import { NationalTeamDrawModal } from './NationalTeamDrawModal';
import {
  getOrCreateAuthoritativeDraw,
  saveDrawState,
  InternationalDrawState,
} from '../utils/internationalDrawEngine';
import {
  InternationalTournamentHubState,
  InternationalFixture,
} from '../types/internationalFootball';
import {
  initializeInternationalHubState,
  simulateInternationalFixture,
  finalizeInternationalDuty,
  markInternationalEventCompleted,
} from '../utils/internationalFootballSystem';
import { CareerPerk, checkCareerPerkMilestones } from '../utils/perksSystem';
import { InternationalCallUp } from '../types/nationalTeam';
import { ActiveCompetitionTheme, getActiveCompetitionThemeForPlayer } from '../utils/leagueThemeHelper';
import { getLeagueDatabase } from '../utils/leagueDatabaseSystem';
import { acceptInternationalCallUp, declineInternationalCallUp } from '../utils/nationalTeamSystem';
import {
  getInternationalCycleForSeason,
  runQualifiersSimulation,
  simulateBackgroundQualifiers,
  simulateWorldCupTournament,
  createSeniorTournamentSummary,
  advanceSeniorTournamentKnockout,
  QualifierSummary,
  WorldCupSummary,
} from '../utils/internationalCareerCycleEngine';
import { useLanguage } from '../context/LanguageContext';
import { useTestMode, useMagicTool } from '../utils/testModeSystem';
import { isProfessionalPlayer } from '../utils/playerIdentitySystem';
import { isPlayerInProClub, advanceWorldSimulationToDate } from '../utils/worldSimulationEngine';
import {
  executeTransferRequestPipeline,
  canPlayerRequestTransfer,
  executeCanonicalTransfer,
  getTransferWindowStatus,
  YouthTransferOffer,
  checkAndGrantYouthEarnedNationalities,
} from '../utils/transferRequestSystem';
import { YouthTransferOfferModal } from './YouthTransferOfferModal';
import { TransferFrequencySetting } from '../types';
import { ManagerActionsModal, ManagerActiveAction } from './ManagerActionsModal';
import { OverflowChemistryExplainerModal } from './OverflowChemistryExplainerModal';
import { GeneticActivationModal, GeneticOutcomeDetail } from './GeneticActivationModal';
import { StoreItemIcon } from './StoreItemIcon';
import { STORE_TIER_NAMES, STORE_CATEGORY_THEMES } from '../data/storeItems';
import {
  AGENT_TYPE_PROFILES,
  MANAGER_TYPE_PROFILES,
  calculatePreseasonManagerOfferRate,
  generatePreseasonManagerOffers,
  hasActiveAgent,
} from '../utils/managerInteractionSystem';
import {
  canUseTrainButton,
  applyTrainingProgressIncrement,
  calculateWeeklyTrainingProgressIncrement,
  getTrainingTransitionAge,
  getMonthsRequiredForTrainingLevel,
} from '../utils/developmentSystem';
import {
  calculateWeightedOvr,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
} from '../utils/statCalculations';
import {
  Coins,
  Sparkles,
  ShieldAlert,
  Briefcase,
  UserCheck,
  ShoppingBag,
  Settings,
  TrendingUp,
  DollarSign,
  FileText,
  Clock,
  RefreshCw,
  Send,
  Plus,
  Lock,
  EyeOff,
  Eye,
  Type,
  Award,
  Zap,
  Tag,
  Gift,
  ChevronDown,
  ChevronRight,
  Shirt,
  Dumbbell,
  Utensils,
  Building2,
  ArrowUpCircle,
  RotateCw,
  PlusCircle,
  Trash2,
  CheckCircle2,
  FolderHeart,
  Globe,
  Star,
  Flame,
  Heart,
  X,
  Scissors,
  Calendar as CalendarIcon,
  Activity,
  Battery,
  Layers,
  HelpCircle,
  BarChart3,
  Save,
  FileCheck,
  ShieldCheck,
  Users,
  Compass,
  Wand2,
} from 'lucide-react';

interface PersistentUiPanelProps {
  player: PlayerCardData;
  onUpdatePlayer?: (updated: PlayerCardData) => void;
  isFlipped: boolean;
  onFlip: () => void;
  onTrophiesChange: (trophies: any[]) => void;
  championCoins?: number;
  iconicCoins?: number;
  setChampionCoins?: React.Dispatch<React.SetStateAction<number>>;
  setIconicCoins?: React.Dispatch<React.SetStateAction<number>>;
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  onSelectSpecialHair?: (hairType: any) => void;
  showToast: (msg: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  isEditorMode?: boolean;
  storeItems: StoreUpgradeItem[];
  setStoreItems: React.Dispatch<React.SetStateAction<StoreUpgradeItem[]>>;
  accounting?: AccountingState;
  setAccounting?: React.Dispatch<React.SetStateAction<AccountingState>>;
  manager?: ManagerState;
  setManager?: React.Dispatch<React.SetStateAction<ManagerState>>;
  onDrawStreetCards?: () => void;
  activeOverlayPanel?: 'store' | 'cards_collection' | 'development' | 'accounting' | 'manager' | 'settings' | 'trophies' | 'perks' | 'national_team' | 'statistics' | 'test_mode' | null;
  setActiveOverlayPanel?: (panel: 'store' | 'cards_collection' | 'development' | 'accounting' | 'manager' | 'settings' | 'trophies' | 'perks' | 'national_team' | 'statistics' | 'test_mode' | null) => void;
  onReturnToYouthAcademy?: () => void;
  onTriggerManagerPositionProposal?: () => void;
  onTriggerRetirement?: () => void;
  onOpenCareerSummary?: () => void;
  onOpenChampionCelebration?: (data: ChampionTitleData) => void;
  onTriggerPerkUnlock?: (perk: CareerPerk | string) => void;
  externalCallUp?: InternationalCallUp | null;
  setExternalCallUp?: (callUp: InternationalCallUp | null) => void;
  activeCompTheme?: ActiveCompetitionTheme;
  onOpenSaudiOffer?: () => void;
  onOpenTransferOffer?: () => void;
  onOpenSpecialChoiceModal?: (clubIds?: string[]) => void;
  onOpenSpecialSigningChain?: (clubId: string) => void;
  onOpenSpecialRetryModal?: (clubId: string) => void;
  onOpenCallUp?: () => void;
  onOpenCardEditor?: () => void;
  activeSaveSlotId?: number;
  onSaveCareer?: () => void;
  onOpenSaveManager?: () => void;
  onOpenWorldResults?: () => void;
}

export const PersistentUiPanel: React.FC<PersistentUiPanelProps> = ({
  player,
  onUpdatePlayer,
  isFlipped,
  onFlip,
  onTrophiesChange,
  championCoins = 0,
  iconicCoins = 0,
  fontSize,
  setFontSize,
  onSelectSpecialHair,
  showToast,
  isVisible,
  onToggleVisibility,
  isEditorMode = false,
  storeItems,
  setStoreItems,
  accounting: propAccounting,
  setAccounting: propSetAccounting,
  manager: propManager,
  setManager: propSetManager,
  onDrawStreetCards,
  activeOverlayPanel: propActiveOverlayPanel,
  setActiveOverlayPanel: propSetActiveOverlayPanel,
  onReturnToYouthAcademy,
  onTriggerManagerPositionProposal,
  onTriggerRetirement,
  onOpenCareerSummary,
  onOpenChampionCelebration,
  onTriggerPerkUnlock,
  externalCallUp: propExternalCallUp,
  setExternalCallUp: propSetExternalCallUp,
  activeCompTheme: propActiveCompTheme,
  onOpenSaudiOffer,
  onOpenTransferOffer,
  onOpenSpecialChoiceModal,
  onOpenSpecialSigningChain,
  onOpenSpecialRetryModal,
  onOpenCallUp,
  onOpenCardEditor,
  activeSaveSlotId = 1,
  onSaveCareer,
  onOpenSaveManager,
  onOpenWorldResults,
}) => {
  const { t, currentLanguage, setLanguage, languagesList } = useLanguage();
  const { isTestMode, setTestMode } = useTestMode();
  const { isMagicTool, setMagicTool } = useMagicTool();
  const activeCompTheme = useMemo(() => {
    return propActiveCompTheme || getActiveCompetitionThemeForPlayer(player, getLeagueDatabase());
  }, [
    propActiveCompTheme,
    player?.league,
    player?.club,
    player?.startingCity,
    player?.countryCode,
    player?.clubCountry,
    player?.nationality,
    player?.isProfessional
  ]);
  // Overlay Panels: 'store' | 'cards_collection' | 'development' | 'accounting' | 'manager' | 'settings' | 'trophies' | 'perks' | 'national_team' | 'statistics' | 'test_mode' | null
  const [internalOverlayPanel, setInternalOverlayPanel] = useState<
    'store' | 'cards_collection' | 'development' | 'accounting' | 'manager' | 'settings' | 'trophies' | 'perks' | 'national_team' | 'statistics' | 'test_mode' | null
  >(null);

  const activeOverlayPanel = propActiveOverlayPanel !== undefined ? propActiveOverlayPanel : internalOverlayPanel;
  const setActiveOverlayPanel = propSetActiveOverlayPanel || setInternalOverlayPanel;

  const [menuFilter, setMenuFilter] = useState<'all' | 'player' | 'club_life' | 'world_legacy'>('all');
  const [showCustomizationModal, setShowCustomizationModal] = useState<boolean>(false);
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [showAdviceModal, setShowAdviceModal] = useState<boolean>(false);
  const [isCareerStageCardModalOpen, setIsCareerStageCardModalOpen] = useState<boolean>(false);
  const [internalCallUp, setInternalCallUp] = useState<InternationalCallUp | null>(null);
  const activeCallUp = propExternalCallUp !== undefined ? propExternalCallUp : internalCallUp;
  const setActiveCallUp = propSetExternalCallUp || setInternalCallUp;
  const [activeQualifierSummary, setActiveQualifierSummary] = useState<QualifierSummary | null>(null);
  const [activeWorldCupSummary, setActiveWorldCupSummary] = useState<WorldCupSummary | null>(null);
  const [showTournamentModal, setShowTournamentModal] = useState<boolean>(false);
  const [internationalHubState, setInternationalHubState] = useState<InternationalTournamentHubState | null>(null);
  const [showInternationalLiveHub, setShowInternationalLiveHub] = useState<boolean>(false);
  const [showDrawModal, setShowDrawModal] = useState<boolean>(false);
  const [pendingDrawState, setPendingDrawState] = useState<InternationalDrawState | null>(null);
  const [pendingCallUpData, setPendingCallUpData] = useState<{
    callUp: InternationalCallUp;
    updatedPlayer: PlayerCardData;
    startYear: number;
    compType: 'qualifier' | 'tournament';
  } | null>(null);
  const [drawNewsPiece, setDrawNewsPiece] = useState<{
    competitionName: string;
    drawState: InternationalDrawState;
  } | null>(null);
  const [tournamentKeyMatchConfig, setTournamentKeyMatchConfig] = useState<{
    isOpen: boolean;
    stageTitle: string;
    opponentName: string;
    opponentOvr: number;
    fixtureId?: string;
  } | null>(null);

  // Competition Start Popup state
  const [compStartModalConfig, setCompStartModalConfig] = useState<CompetitionStartData | null>(null);
  const [pendingCallUpUpdatedPlayer, setPendingCallUpUpdatedPlayer] = useState<PlayerCardData | null>(null);
  const [confirmFireAgent, setConfirmFireAgent] = useState<boolean>(false);
  const [managerActiveAction, setManagerActiveAction] = useState<ManagerActiveAction>('none');
  const [testInjuryModalConfig, setTestInjuryModalConfig] = useState<{
    isOpen: boolean;
    name: string;
    weeks: number;
  } | null>(null);

  // Overflow Chemistry first-time explainer popup state
  const [showOverflowExplainerModal, setShowOverflowExplainerModal] = useState<boolean>(false);
  const [isGeneticActivationModalOpen, setIsGeneticActivationModalOpen] = useState<boolean>(false);

  // Youth League Transfer Request Opportunity State
  const [showYouthTransferModal, setShowYouthTransferModal] = useState<boolean>(false);
  const [youthTransferOffers, setYouthTransferOffers] = useState<YouthTransferOffer[]>([]);

  // Automatically trigger first-time explainer popup when player receives overflow chemistry
  React.useEffect(() => {
    const rawChem = typeof player.chemistry === 'number' ? player.chemistry : 50;
    if (rawChem > 100 && !player.hasSeenOverflowChemistryExplainer) {
      setShowOverflowExplainerModal(true);
    }
  }, [player.chemistry, player.hasSeenOverflowChemistryExplainer]);

  const handleCloseOverflowExplainer = () => {
    setShowOverflowExplainerModal(false);
    if (!player.hasSeenOverflowChemistryExplainer && onUpdatePlayer) {
      onUpdatePlayer({
        ...player,
        hasSeenOverflowChemistryExplainer: true,
      });
    }
  };

  const handleTournamentKeyMatchCompleted = (result: KeyMatchFinalSummary) => {
    const activeConfig = tournamentKeyMatchConfig;
    setTournamentKeyMatchConfig(null);

    if (result.updatedPlayer) {
      onUpdatePlayer(result.updatedPlayer);
    }

    // If active in International Football System Live Hub:
    if (internationalHubState) {
      const isWin = result.isWinner;
      const updatedHub = simulateInternationalFixture(internationalHubState, player, true, {
        playerScore: result.playerTeamScore,
        opponentScore: result.opponentTeamScore,
        playerGoals: result.playerStats.goals,
        playerAssists: result.playerStats.assists,
        isWin,
      });

      setInternationalHubState(updatedHub);
      showToast(`🏆 International Match Finished! Final: ${result.playerTeamScore} - ${result.opponentTeamScore}`);
      return;
    }

    if (!activeWorldCupSummary) return;

    const updatedSummary = advanceSeniorTournamentKnockout(activeWorldCupSummary, {
      playerScore: result.playerTeamScore,
      opponentScore: result.opponentTeamScore,
      isWin: result.isWinner,
      playerGoals: result.playerStats.goals,
      playerAssists: result.playerStats.assists,
    });

    setActiveWorldCupSummary(updatedSummary);

    let updatedPlayer = { ...player };
    if (result.playerStats.goals > 0 || result.playerStats.assists > 0) {
      updatedPlayer.seniorGoals = (updatedPlayer.seniorGoals || 0) + result.playerStats.goals;
    }
    updatedPlayer.seniorCaps = (updatedPlayer.seniorCaps || 0) + 1;

    if (updatedSummary.playerFinishStage === 'CHAMPIONS 🏆') {
      const trophyTitle = updatedSummary.competitionName || 'International Champion';
      const existingTrophies = updatedPlayer.trophies || [];
      if (!existingTrophies.some((t) => t.name === trophyTitle)) {
        const newTrophy: TrophyItem = {
          id: `trophy-int-${Date.now()}`,
          name: trophyTitle,
          category: 'international',
          year: `${2026 + ((updatedPlayer.age || 10) - 10)}`,
          prestige: 100,
          iconType: 'world-cup',
        };
        updatedPlayer.trophies = [...existingTrophies, newTrophy];
      }
    }

    if (onUpdatePlayer) {
      onUpdatePlayer(updatedPlayer);
    }
  };

  const handlePlayInternationalKeyMatch = (fixture: InternationalFixture) => {
    const isPlayerHome = fixture.homeNation.code === internationalHubState?.callingNation.code;
    const opp = isPlayerHome ? fixture.awayNation : fixture.homeNation;

    setTournamentKeyMatchConfig({
      isOpen: true,
      stageTitle: `${fixture.stageName} - ${fixture.competitionName}`,
      opponentName: opp.name,
      opponentOvr: opp.ovr,
      fixtureId: fixture.id,
    });
  };

  const handleSimulateInternationalMatch = () => {
    if (!internationalHubState) return;
    const updatedHub = simulateInternationalFixture(internationalHubState, player, false);
    setInternationalHubState(updatedHub);
    const lastFix = updatedHub.fixtures[updatedHub.currentFixtureIndex - 1];
    if (lastFix) {
      showToast(`⚽ Match Simulated: ${lastFix.homeNation.name} ${lastFix.homeScore} - ${lastFix.awayScore} ${lastFix.awayNation.name}`);
    }
  };

  const handleConcludeInternationalDuty = () => {
    if (!internationalHubState) return;
    const { updatedPlayer, message } = finalizeInternationalDuty(player, internationalHubState);
    if (onUpdatePlayer) {
      onUpdatePlayer(updatedPlayer);
    }
    setShowInternationalLiveHub(false);
    setInternationalHubState(null);
    showToast(message);
  };

  const handleAcceptCallUp = (callUp: InternationalCallUp) => {
    const res = acceptInternationalCallUp(player, callUp);
    let updatedPlayer = res.updatedPlayer;

    const startYear = 2026 + ((player.age || 10) - 10);
    const isQual = callUp.competitionName.toLowerCase().includes('qualifier');
    const compType: 'qualifier' | 'tournament' = isQual ? 'qualifier' : 'tournament';

    // The user got called up by a participating national team!
    // Get or create authoritative draw according to competition rules
    const draw = getOrCreateAuthoritativeDraw(
      callUp.nation.code,
      callUp.competitionName,
      startYear,
      callUp.tier,
      compType
    );

    setActiveCallUp(null);
    if (onUpdatePlayer) {
      onUpdatePlayer(updatedPlayer);
    }
    showToast(res.message);

    // If the draw ceremony is not completed yet, the user is forced to see the draw (can skip to results)
    if (!draw.isCompleted) {
      setPendingCallUpData({
        callUp,
        updatedPlayer,
        startYear,
        compType,
      });
      setPendingDrawState(draw);
      setShowDrawModal(true);
    } else {
      const hub = initializeInternationalHubState(
        updatedPlayer,
        callUp.nation,
        callUp.tier,
        startYear,
        compType,
        callUp.competitionName,
        draw
      );
      setInternationalHubState(hub);
      setShowInternationalLiveHub(true);
    }
  };

  const handleDrawModalComplete = (completedDraw: InternationalDrawState) => {
    saveDrawState(completedDraw);
    setShowDrawModal(false);
    if (pendingCallUpData) {
      const { callUp, updatedPlayer, startYear, compType } = pendingCallUpData;
      const hub = initializeInternationalHubState(
        updatedPlayer,
        callUp.nation,
        callUp.tier,
        startYear,
        compType,
        callUp.competitionName,
        completedDraw
      );
      setInternationalHubState(hub);
      setPendingCallUpData(null);
      setPendingDrawState(null);
      setShowInternationalLiveHub(true);
    } else {
      setPendingDrawState(null);
    }
  };

  const handleDeclineCallUp = (callUp: InternationalCallUp) => {
    const res = declineInternationalCallUp(player, callUp);
    let updatedPlayer = res.updatedPlayer;

    const startYear = 2026 + ((player.age || 10) - 10);
    const isQual = callUp.competitionName.toLowerCase().includes('qualifier');
    const compType: 'qualifier' | 'tournament' = isQual ? 'qualifier' : 'tournament';

    updatedPlayer = markInternationalEventCompleted(updatedPlayer, callUp.tier, compType, startYear);

    // If user declined or is not playing, the draw is completed in the background
    const draw = getOrCreateAuthoritativeDraw(
      callUp.nation.code,
      callUp.competitionName,
      startYear,
      callUp.tier,
      compType
    );
    if (!draw.isCompleted) {
      draw.isCompleted = true;
      saveDrawState(draw);
    }

    // Set draw newspiece so the user can optionally click and inspect the draw results
    setDrawNewsPiece({
      competitionName: callUp.competitionName,
      drawState: draw,
    });

    if (isQual) {
      const summary = simulateBackgroundQualifiers(callUp.nation, callUp.tier);
      if (callUp.tier === 'U17') updatedPlayer.u17Qualified = summary.playerQualified;
      if (callUp.tier === 'U20') updatedPlayer.u20Qualified = summary.playerQualified;
      if (callUp.tier === 'Senior') updatedPlayer.seniorQualified = summary.playerQualified;

      showToast(`📣 ${summary.newsHeadline}`);
    }

    if (onUpdatePlayer) {
      onUpdatePlayer(updatedPlayer);
    }
    setActiveCallUp(null);
    showToast(res.message);
  };

  // Check Parent Advice Perk
  const hasAdvicePerk =
    player.equippedParentCard?.typeId === 'average_family' ||
    player.equippedParentCard?.typeId === 'iconic_parent';

  const handleApplyParentAdvice = (effect: ParentAdviceEffect) => {
    let updated = {
      ...player,
      parentAdviceUsedThisSeason: true,
    };

    if (effect.type === 'composure') {
      if (updated.stats) {
        const isGk = (updated.subPosition || updated.position || '').toUpperCase() === 'GK';
        if (isGk) {
          const gk = getOrCreateGkDetailed(updated.stats);
          updated.stats = syncCategoryStatsFromGkDetailed(updated.stats, gk);
          updated.ovr = calculateWeightedOvr('GK', 'GK', updated.stats, updated.playStyle);
        } else {
          const d = getOrCreateOutfieldDetailed(updated.stats);
          d.composure = Math.min(99, (d.composure || 50) + 10);
          updated.stats = syncCategoryStatsFromDetailed(updated.stats, d);
          updated.ovr = calculateWeightedOvr(
            updated.position || 'ST',
            updated.subPosition || updated.position || 'ST',
            updated.stats,
            updated.playStyle
          );
        }
      }
    } else if (effect.type === 'chemistry') {
      const activeCap = getActiveChemistryCap(updated.chemistryCeiling, updated.chemistryCeilingMonthsRemaining, updated.chemistryCaps);
      const maxAllowed = activeCap ?? 100;
      updated.chemistry = Math.min(maxAllowed, (updated.chemistry || 50) + 10);
    } else if (effect.type === 'bad_rep') {
      updated.badReputation = Math.max(0, (updated.badReputation || 0) - 10);
    } else if (effect.type === 'injury_recovery') {
      updated.recoveryPoints = (updated.recoveryPoints || 0) + 10;
    }

    if (onUpdatePlayer) {
      onUpdatePlayer(updated);
    }
    showToast(`❤️ Parent Advice Applied: ${effect.title}! (${effect.description})`);
  };

  // Live Career Values
  const playerFame = typeof player.fame === 'number' ? player.fame : 500;
  const playerBadRep = typeof player.badReputation === 'number' ? player.badReputation : 100;
  const currentFitness = getFitnessPercentage(player);
  const playerChem = Math.max(0, Math.min(200, typeof player.chemistry === 'number' ? player.chemistry : 50));
  const chemInfo = getChemistryInfo(
    playerChem,
    player.chemistryCeiling,
    player.chemistryCeilingMonthsRemaining,
    player.chemistryCeilingReason,
    player.chemistryGainHalvedMonthsRemaining,
    player.chemistryCaps
  );
  const recoveryPoints = typeof player.recoveryPoints === 'number' ? player.recoveryPoints : 12;
  const trainingProgress = typeof player.trainingProgress === 'number' ? player.trainingProgress : 60;
  const currentDateStr = player.calendarDate || '14 December 2028';

  const trainInfo = canUseTrainButton(player);
  const transitionAge = getTrainingTransitionAge(player);
  const monthsReq = getMonthsRequiredForTrainingLevel(player);

  const infamyInfo = getInfamyTierInfo(playerBadRep);
  const badFameChance = getBadFameDrawChancePercent(playerBadRep);

  // Fitness & Injury Recovery Handler
  const handleUseRecoveryPoint = () => {
    if (recoveryPoints <= 0) {
      showToast('❌ No Injury Recovery Points available!');
      return;
    }

    if (player.isInjured) {
      const res = processUseRecoveryPoint(player);
      if (res.success && onUpdatePlayer) {
        onUpdatePlayer(res.updatedPlayer);
      }
      showToast(res.message);
      return;
    }

    if (currentFitness >= 100) {
      showToast('⚡ Fitness is already at maximum (100%)!');
      return;
    }

    const newFitness = Math.min(100, currentFitness + 20);
    const newPoints = Math.max(0, recoveryPoints - 1);

    if (onUpdatePlayer) {
      onUpdatePlayer({
        ...player,
        fitness: newFitness,
        staminaCurrent: newFitness,
        recoveryPoints: newPoints,
      });
    }
    showToast(`⚡ Restored +20% Fitness! (${newFitness}%, Remaining Recovery Points: ${newPoints})`);
  };

  // Training Progress Handler
  const handleAdvanceTraining = () => {
    const trainInfo = canUseTrainButton(player);
    if (!trainInfo.canTrain) {
      showToast(`❌ ${trainInfo.reason}`);
      return;
    }

    const result = applyTrainingProgressIncrement(player, 10);
    const updated = result.updatedPlayer;

    if (trainInfo.windowLabel === 'preseason') {
      updated.usedPreseasonTrain = true;
    } else if (trainInfo.windowLabel === 'midseason') {
      updated.usedMidseasonTrain = true;
    }

    if (onUpdatePlayer) {
      onUpdatePlayer(updated);
    }
    showToast(result.message);
  };

  const handleCloseTournamentModal = () => {
    setShowTournamentModal(false);
    const startYear = 2026 + ((player.age || 10) - 10);
    const cycle = getInternationalCycleForSeason(startYear);
    if (cycle) {
      const eventId = `int-cycle-${cycle.tier}-${cycle.type}-${startYear}`;
      const updatedEvents = Array.from(new Set([...(player.completedInternationalEvents || []), eventId]));
      const updatedSeasons = Array.from(new Set([...(player.resolvedInternationalSeasons || []), startYear]));
      if (onUpdatePlayer) {
        onUpdatePlayer({
          ...player,
          completedInternationalEvents: updatedEvents,
          resolvedInternationalSeasons: updatedSeasons,
        });
      }
    }
  };

  // Transfer Request Handler (Requirement 1 & 2 & 3 & 4)
  const handleRequestTransfer = () => {
    const check = canPlayerRequestTransfer(player);
    if (!check.canRequest) {
      showToast(`❌ ${check.reason}`);
      return;
    }

    const result = executeTransferRequestPipeline(
      player,
      accounting,
      manager,
      currentDateStr
    );

    if (!result.success) {
      showToast(`❌ ${result.message}`);
      return;
    }

    if (onUpdatePlayer) {
      onUpdatePlayer(result.updatedPlayer);
    }

    if (result.readyImmediate) {
      if (result.youthOffers && result.youthOffers.length > 0) {
        setYouthTransferOffers(result.youthOffers);
        setShowYouthTransferModal(true);
      } else if (onOpenTransferOffer) {
        onOpenTransferOffer();
      }
    }

    showToast(result.message);
  };

  const handleAcceptYouthOffer = (offer: YouthTransferOffer) => {
    setShowYouthTransferModal(false);
    const result = executeCanonicalTransfer(player, offer, accounting);
    if (onUpdatePlayer) {
      onUpdatePlayer(result.updatedPlayer);
    }
    if (propSetAccounting) {
      propSetAccounting(result.updatedAccounting);
    }
    showToast(result.message);
  };

  // Calendar Advancement Handler
  const handleAdvanceCalendar = () => {
    // Parse current date string
    const parts = currentDateStr.split(' ');
    let day = parseInt(parts[0]) || 14;
    let month = parts[1] || 'December';
    let year = parseInt(parts[2]) || 2028;

    let isNewMonth = false;
    day += 7;
    if (day > 28) {
      day = 1;
      isNewMonth = true;
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      let idx = months.indexOf(month);
      idx = (idx + 1) % 12;
      month = months[idx];
      if (idx === 0) year += 1;
    }

    const nextDate = `${day} ${month} ${year}`;
    const weeklyInc = calculateWeeklyTrainingProgressIncrement(player);
    const result = applyTrainingProgressIncrement(player, weeklyInc);
    const updated = result.updatedPlayer;
    const nextFitness = Math.min(100, currentFitness + 5);

    updated.calendarDate = nextDate;
    updated.fitness = nextFitness;
    updated.staminaCurrent = nextFitness;

    let extraToastMsg = '';

    // If completed an in-game month:
    if (isNewMonth) {
      // 1. Chemistry Growth (+10% per completed month, or +5% if halved, max 100% or active ceiling)
      const chemRes = applyMonthlyChemistryGrowth(
        updated.chemistry,
        updated.chemistryCeiling,
        updated.chemistryCeilingMonthsRemaining,
        updated.chemistryGainHalvedMonthsRemaining,
        updated.chemistryCaps
      );
      updated.chemistry = chemRes.newChemistry;
      updated.chemistryCeiling = chemRes.activeCeiling;
      updated.chemistryCeilingMonthsRemaining = chemRes.newCeilingMonths;
      updated.chemistryCaps = chemRes.newChemistryCaps;
      updated.chemistryGainHalvedMonthsRemaining = chemRes.newHalvedGainMonths;
      if (!chemRes.activeCeiling) {
        updated.chemistryCeilingReason = undefined;
      }
      if (chemRes.gained > 0) {
        extraToastMsg += ` | 🧪 Chemistry +${chemRes.gained}% (${updated.chemistry}%)`;
      }

      // 2. Growth Spurt Penalty Month Progression
      if (updated.growthSpurtPenaltyMonthsRemaining && updated.growthSpurtPenaltyMonthsRemaining > 0) {
        updated.growthSpurtPenaltyMonthsRemaining -= 1;
        if (updated.growthSpurtPenaltyMonthsRemaining <= 0) {
          updated.growthSpurtPenaltyActive = false;
          extraToastMsg += ` | 🌱 Growth Spurt Adjustment Month Complete (+10 Dribbling, +10 Ball Control restored)!`;
        }
      }
    }

    // Deliver pending transfer request if transfer window opens (Requirement 5 & 6)
    if (updated.pendingTransferRequest) {
      const windowCheck = getTransferWindowStatus(updated, nextDate);
      if (windowCheck.isOpen) {
        if (updated.pendingTransferRequest.type === 'youth' && updated.pendingTransferRequest.offers) {
          setYouthTransferOffers(updated.pendingTransferRequest.offers);
          setShowYouthTransferModal(true);
          extraToastMsg += ` | 🔔 ${windowCheck.windowName} OPEN! Youth academy transfer offers ready.`;
        } else if (updated.pendingTransferRequest.type === 'pro') {
          if (onOpenTransferOffer) {
            onOpenTransferOffer();
          }
          extraToastMsg += ` | 🔔 ${windowCheck.windowName} OPEN! Professional transfer bid ready.`;
        }
      }
    }

    // ONE GLOBAL CLOCK & PRO GATE:
    // If the player is in a professional club, advance the world simulation exactly to this calendar date
    if (isPlayerInProClub(updated)) {
      advanceWorldSimulationToDate(nextDate, updated);
    }

    if (onUpdatePlayer) {
      onUpdatePlayer(updated);
    }
    showToast(`📅 Calendar Advanced to ${nextDate}${extraToastMsg}`);
  };

  // Accounting State
  const [localAccounting, setLocalAccounting] = useState<AccountingState>({
    contractYears: 3,
    yearlySalary: 3500000,
    sponsors: [
      { id: '1', name: 'Nike Elite Athletics', yearlyPayment: 1200000, logoColor: '#3b82f6' },
      { id: '2', name: 'Red Bull Hydration', yearlyPayment: 450000, logoColor: '#ef4444' },
      { id: '3', name: 'EA Sports Cover Star', yearlyPayment: 850000, logoColor: '#10b981' },
    ],
    sanctions: [
      { id: 's1', reason: 'Tactical Foul Yellow Card Fine', amount: 1500, category: 'card_fine', date: '2026-03-12' },
      { id: 's2', reason: 'Late Team Bus Arrival Fine', amount: 3000, category: 'discipline', date: '2026-02-28' },
    ],
    businesses: [
      { id: 'b1', templateId: 'esports', name: 'E-Sports Gaming Academy', tier: 1, revenue: 140000, expenses: 55000, netProfit: 85000 },
      { id: 'b2', templateId: 'apparel', name: 'Luxury Urban Apparel', tier: 1, revenue: 260000, expenses: 180000, netProfit: 80000 },
    ],
  });

  // Manager State
  const [localManager, setLocalManager] = useState<ManagerState>({
    name: null,
    negotiation: 0,
    network: 0,
    marketing: 0,
  });

  const accounting = propAccounting || localAccounting;
  const setAccounting = propSetAccounting || setLocalAccounting;

  const manager = propManager || localManager;
  const setManager = propSetManager || setLocalManager;

  // Store Category Filter State
  const [storeCategory, setStoreCategory] = useState<'all' | 'consumables' | 'upgrade' | 'season_boost' | 'pro_equipment' | 'special_hair'>('all');

  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorPay, setNewSponsorPay] = useState('500000');
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [isBuyBusinessModalOpen, setIsBuyBusinessModalOpen] = useState(false);

  // Financial Totals
  const totalSponsorIncome = (accounting?.sponsors || []).reduce((sum, s) => sum + s.yearlyPayment, 0);
  const totalSanctionsCost = (accounting?.sanctions || []).reduce((sum, s) => sum + s.amount, 0);
  const totalBusinessProfit = (accounting?.businesses || []).reduce((sum, b) => sum + (b.revenue - b.expenses), 0);
  const netYearlyIncome = (accounting?.yearlySalary || 0) + totalSponsorIncome + totalBusinessProfit - totalSanctionsCost;
  const availableCash = accounting?.totalSavings !== undefined ? Math.max(0, accounting.totalSavings) : 0;

  // Business Handlers
  const handlePurchaseBusiness = (newBiz: BusinessItem, cost?: number) => {
    const template = BUSINESS_TEMPLATES.find((t) => t.id === newBiz.templateId) || BUSINESS_TEMPLATES.find((t) => t.name === newBiz.name);
    const purchaseCost = cost ?? (template?.tiers?.[1]?.cost ?? 0);

    const bizList = accounting?.businesses || [];
    const alreadyOwned = bizList.some(
      (b) => b && (b.templateId === (template?.id || newBiz.templateId) || b.name === (template?.name || newBiz.name))
    );
    if (alreadyOwned) {
      showToast(`❌ You already own ${newBiz.name}! You can only own one of each business type. Upgrade it up to Tier 5 in your portfolio.`);
      return;
    }

    if (availableCash < purchaseCost) {
      showToast(`❌ Not enough funds to purchase ${newBiz.name}! Requires ${formatEuros(purchaseCost)} (Available: ${formatEuros(availableCash)}).`);
      return;
    }

    setAccounting((prev) => {
      const currentSavings = prev.totalSavings !== undefined ? prev.totalSavings : 0;
      const updatedSavings = Math.max(0, currentSavings - purchaseCost);
      const newBusinesses = [...(prev.businesses || []), newBiz];

      if (onTriggerPerkUnlock && player) {
        const milestonePerk = checkCareerPerkMilestones(player, {
          businessCount: newBusinesses.length,
          liquidSavings: updatedSavings,
          netWorth: updatedSavings + 200000,
        });
        if (milestonePerk) {
          onTriggerPerkUnlock(milestonePerk);
        }
      }

      return {
        ...prev,
        totalSavings: updatedSavings,
        businesses: newBusinesses,
      };
    });
  };

  const handleUpgradeBusiness = (bizId: string) => {
    const bizList = accounting?.businesses || [];
    const biz = bizList.find((b) => b.id === bizId);
    if (!biz) return;

    const currTier = biz.tier || 1;
    if (currTier >= 5) {
      showToast(`🏆 ${biz.name} is at Max Tier 5!`);
      return;
    }

    const template =
      BUSINESS_TEMPLATES.find((t) => t.id === biz.templateId) ||
      BUSINESS_TEMPLATES.find((t) => t.name === biz.name) ||
      BUSINESS_TEMPLATES[0];

    const nextTier = currTier + 1;
    const upgradeCost = template.tiers[nextTier]?.cost || 0;

    if (availableCash < upgradeCost) {
      showToast(`❌ Not enough funds to upgrade ${biz.name}! Requires ${formatEuros(upgradeCost)} (Available: ${formatEuros(availableCash)}).`);
      return;
    }

    const newFinancials = calculateSeasonFinancials(template, nextTier);

    setAccounting((prev) => {
      const currentSavings = prev.totalSavings !== undefined ? prev.totalSavings : 0;
      return {
        ...prev,
        totalSavings: Math.max(0, currentSavings - upgradeCost),
        businesses: (prev.businesses || []).map((b) =>
          b.id === bizId
            ? {
                ...b,
                tier: nextTier,
                revenue: newFinancials.revenue,
                expenses: newFinancials.expenses,
                netProfit: newFinancials.netProfit,
              }
            : b
        ),
      };
    });

    showToast(`🚀 Upgraded ${biz.name} to Tier ${nextTier} for ${formatEuros(upgradeCost)}!`);
  };

  const handleSellBusiness = (bizId: string) => {
    const bizList = accounting?.businesses || [];
    const biz = bizList.find((b) => b.id === bizId);
    if (!biz) return;

    const template =
      BUSINESS_TEMPLATES.find((t) => t.id === biz.templateId) ||
      BUSINESS_TEMPLATES.find((t) => t.name === biz.name) ||
      BUSINESS_TEMPLATES[0];
    const tierCost = template?.tiers?.[biz.tier || 1]?.cost || 100000;
    const liquidationRefund = Math.round(tierCost * 0.6);

    setAccounting((prev) => {
      const currentSavings = prev.totalSavings !== undefined ? prev.totalSavings : 0;
      return {
        ...prev,
        totalSavings: currentSavings + liquidationRefund,
        businesses: (prev.businesses || []).filter((b) => b.id !== bizId),
      };
    });

    showToast(`💼 Liquidated ${biz.name} for +${formatEuros(liquidationRefund)}.`);
  };

  // Direct Purchase Store Handler
  const handleBuyStoreItem = (item: StoreUpgradeItem) => {
    // 0. SPECIAL: GENETIC POTENTIAL ACTIVATION (RISKY EXPERIMENTAL PROCEDURE MODAL)
    if (item.id === 'upg_genetic_activation') {
      if (item.unlocked || (player as any)?.geneticActivationCompleted) {
        showToast('⚠️ Genetic Potential Activation can only be undergone ONCE per career!');
        return;
      }
      const cost = item.costEuros || 100000000;
      const currentSavings = accounting.totalSavings ?? 0;
      if (currentSavings < cost) {
        showToast(`❌ Not enough funds! Genetic Activation requires €${cost.toLocaleString()} (Available: €${currentSavings.toLocaleString()}).`);
        return;
      }
      setIsGeneticActivationModalOpen(true);
      return;
    }

    // Check Stock for Consumables & Pro Equipment
    if ((item.category === 'consumables' || item.category === 'pro_equipment') && item.availableStock !== undefined && item.availableStock <= 0) {
      showToast(`❌ ${item.name} is out of stock! Stock replenishes every Preseason.`);
      return;
    }

    if (item.unlocked && (item.category === 'upgrade' || item.category === 'season_boost')) {
      showToast(`${item.name} is already active!`);
      return;
    }

    const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
    const availableCash = accounting.totalSavings ?? 0;
    if (availableCash < cost) {
      showToast(`❌ Not enough funds! Requires €${cost.toLocaleString()} (Available: €${availableCash.toLocaleString()}).`);
      return;
    }

    // Deduct Cash
    setAccounting((prev) => ({
      ...prev,
      totalSavings: Math.max(0, (prev.totalSavings ?? 0) - cost),
    }));

    // Update Store State
    setStoreItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          if (item.category === 'consumables' || item.category === 'pro_equipment') {
            const newStock = Math.max(0, (i.availableStock ?? 1) - 1);
            return { ...i, availableStock: newStock };
          }
          return { ...i, unlocked: true };
        }
        return i;
      })
    );

    let updatedPlayer: PlayerCardData = player ? JSON.parse(JSON.stringify(player)) : null;

    if (updatedPlayer) {
      if (!updatedPlayer.stats) {
        updatedPlayer.stats = { pro: 50, def: 50, cre: 50, men: 50, goa: 10, phy: 50 };
      }
      if (!updatedPlayer.stats.detailed) {
        updatedPlayer.stats.detailed = {
          pace: 50, shooting: 50, shortPass: 50, longPass: 50, crossing: 50,
          dribbling: 50, ballControl: 50, retention: 50, positioning: 50,
          tackling: 50, interceptions: 50, marking: 50, heading: 50,
          stamina: 50, strength: 50, reactions: 50, composure: 50,
          longShots: 50,
        };
      }

      // 1. CONSUMABLES HANDLER
      if (item.category === 'consumables') {
        if (item.id === 'con_ankle_taping') {
          updatedPlayer.activeTapingMonths = 6;
          showToast(`🩹 Used Ankle Taping! -15% injury chance for 6 months (-€${cost.toLocaleString()})`);
        } else if (item.id === 'con_hydrating_drink') {
          if (updatedPlayer.stats.detailed) {
            updatedPlayer.stats.detailed.stamina = Math.min(99, (updatedPlayer.stats.detailed.stamina || 50) + 5);
          }
          updatedPlayer.fitness = Math.min(100, (updatedPlayer.fitness || 100) + 5);
          updatedPlayer.staminaCurrent = updatedPlayer.fitness;
          showToast(`🥤 Drank Hydrating Drink! +5 Stamina, +5% Fitness (-€${cost.toLocaleString()})`);
        } else if (item.id === 'con_recovery_supplement') {
          updatedPlayer.recoveryPoints = (updatedPlayer.recoveryPoints || 0) + 1;
          showToast(`💊 Ingested Recovery Supplement! +1 Recovery Point (-€${cost.toLocaleString()})`);
        } else if (item.id === 'con_performance_taping') {
          if (updatedPlayer.stats.detailed) {
            updatedPlayer.stats.detailed.strength = Math.min(99, (updatedPlayer.stats.detailed.strength || 50) + 5);
            updatedPlayer.stats.detailed.stamina = Math.min(99, (updatedPlayer.stats.detailed.stamina || 50) + 5);
          }
          updatedPlayer.activeTapingMonths = 6;
          showToast(`⚡ Applied Performance Taping! +5 Strength, +5 Stamina, -50% injury chance for 6 months (-€${cost.toLocaleString()})`);
        } else if (item.id === 'con_experimental_supplement') {
          updatedPlayer.recoveryPoints = (updatedPlayer.recoveryPoints || 0) + 5;
          showToast(`🧪 Consumed Experimental Supplement! +5 Recovery Points (-€${cost.toLocaleString()})`);
        } else {
          // Generic Consumable bonuses
          if (item.statBonuses && updatedPlayer.stats?.detailed) {
            Object.entries(item.statBonuses).forEach(([stat, val]) => {
              if (stat in updatedPlayer.stats!.detailed!) {
                (updatedPlayer.stats!.detailed as any)[stat] = Math.min(99, ((updatedPlayer.stats!.detailed as any)[stat] || 50) + (val || 0));
              }
            });
          }
          if (item.recoveryPoints) {
            updatedPlayer.recoveryPoints = (updatedPlayer.recoveryPoints || 0) + item.recoveryPoints;
          }
          if (item.fitnessBoost) {
            updatedPlayer.fitness = Math.min(100, (updatedPlayer.fitness || 100) + item.fitnessBoost);
            updatedPlayer.staminaCurrent = updatedPlayer.fitness;
          }
          showToast(`✨ Consumed ${item.name}! (${item.effectSummary || item.effect}) (-€${cost.toLocaleString()})`);
        }
      }

      // 2. UPGRADES HANDLER
      else if (item.category === 'upgrade') {
        if (item.id === 'upg_pro_kitchen') {
          if (updatedPlayer.stats.detailed) {
            updatedPlayer.stats.detailed.stamina = Math.min(99, (updatedPlayer.stats.detailed.stamina || 50) + 1);
          }
        } else if (item.id === 'upg_perf_center') {
          updatedPlayer.bonusRetirementYears = 5;
        }
        showToast(`🏗️ Purchased ${item.name}! Permanent Preseason effects activated. (-€${cost.toLocaleString()})`);
      }

      // 3. SEASON BOOSTS HANDLER
      else if (item.category === 'season_boost') {
        updatedPlayer.activeSeasonBoosts = [...(updatedPlayer.activeSeasonBoosts || []), item];
        if (item.id === 'sbt_extra_training') {
          const statsKeys: Array<keyof typeof updatedPlayer.stats.detailed> = [
            'pace', 'shooting', 'shortPass', 'longPass', 'crossing', 'dribbling', 'ballControl',
            'retention', 'positioning', 'tackling', 'interceptions', 'marking', 'heading',
            'stamina', 'strength', 'reactions', 'composure', 'longShots',
          ];
          const chosenKey = statsKeys[Math.floor(Math.random() * statsKeys.length)];
          (updatedPlayer.stats.detailed as any)[chosenKey] = Math.min(99, ((updatedPlayer.stats.detailed as any)[chosenKey] || 50) + 1);
          showToast(`⚡ Extra Training activated! +1 ${String(chosenKey).toUpperCase()} for current season.`);
        } else if (item.id === 'sbt_pro_nutrition') {
          if (updatedPlayer.stats.detailed) {
            updatedPlayer.stats.detailed.stamina = Math.min(99, (updatedPlayer.stats.detailed.stamina || 50) + 5);
          }
          showToast(`🥗 Nutrition Program active: +5 Stamina for current season.`);
        } else if (item.id === 'sbt_kinesiologist') {
          showToast(`🩺 Personal Kinesiologist hired: -30% injury risk for current season.`);
        } else if (item.id === 'sbt_david_goggins') {
          if (updatedPlayer.stats.detailed) {
            updatedPlayer.stats.detailed.composure = Math.min(99, (updatedPlayer.stats.detailed.composure || 50) + 10);
            updatedPlayer.stats.detailed.stamina = Math.min(99, (updatedPlayer.stats.detailed.stamina || 50) + 10);
            updatedPlayer.stats.detailed.strength = Math.min(99, (updatedPlayer.stats.detailed.strength || 50) + 10);
            updatedPlayer.stats.detailed.pace = Math.min(99, (updatedPlayer.stats.detailed.pace || 50) + 5);
          }
          showToast(`🔥 David Goggins Hired! +10 Composure, +10 Stamina, +10 Strength, +5 Pace for current season.`);
        } else if (item.id === 'sbt_genetic_activation') {
          updatedPlayer.potentialOvr = (updatedPlayer.potentialOvr || updatedPlayer.ovr + 5) + 5;
          updatedPlayer.freeStatPoints = (updatedPlayer.freeStatPoints || 0) + 10;
          showToast(`🧬 Genetic Potential Activated! +5 Potential & +10 temporary Stat Points for current season.`);
        } else if (item.id === 'sbt_experimental_chemical') {
          if (updatedPlayer.stats.detailed) {
            Object.keys(updatedPlayer.stats.detailed).forEach((k) => {
              const key = k as keyof typeof updatedPlayer.stats.detailed;
              (updatedPlayer.stats.detailed as any)[key] = Math.min(99, ((updatedPlayer.stats.detailed as any)[key] || 50) + 10);
            });
          }
          updatedPlayer.activeChemicalEnhancementSeason = true;
          showToast(`🧪 Experimental Chemical Enhancement activated! +10 to ALL stats for 12 months (-€${cost.toLocaleString()})`);
        } else if (item.id === 'sbt_luxury_car_bonus') {
          updatedPlayer.chemistry = 200;
          showToast(`🏎️ Luxury Car Team Bonus purchased! Team chemistry set to 200%! (-€${cost.toLocaleString()})`);
        }
      }

      // 4. PRO EQUIPMENT HANDLER
      else if (item.category === 'pro_equipment') {
        const matches = item.matchDuration || item.durability?.current || 15;
        const newEquip: StoreUpgradeItem = {
          ...item,
          matchDuration: matches,
          durability: { current: matches, max: matches },
        };
        updatedPlayer.activeEquipment = [...(updatedPlayer.activeEquipment || []), newEquip];

        // Apply equipment stat bonuses if applicable
        if (item.statBonuses) {
          Object.entries(item.statBonuses).forEach(([stat, val]) => {
            if (stat in updatedPlayer.stats!.detailed!) {
              const key = stat as keyof typeof updatedPlayer.stats.detailed;
              (updatedPlayer.stats!.detailed as any)[key] = Math.min(99, ((updatedPlayer.stats!.detailed as any)[key] || 50) + (val || 0));
            }
          });
        }
        showToast(`👟 Equipped ${item.name}! (${matches} Matches Duration • ${item.effectSummary || item.effect})`);
      }

      // 5. COSMETICS / SPECIAL HAIR HANDLER
      else if (item.category === 'special_hair' || item.category === 'cosmetics') {
        if (item.specialHairType && onSelectSpecialHair) {
          onSelectSpecialHair(item.specialHairType);
        }
        if (item.statBonuses) {
          Object.entries(item.statBonuses).forEach(([stat, val]) => {
            if (stat in updatedPlayer.stats!.detailed!) {
              const key = stat as keyof typeof updatedPlayer.stats.detailed;
              (updatedPlayer.stats!.detailed as any)[key] = Math.min(99, ((updatedPlayer.stats!.detailed as any)[key] || 50) + (val || 0));
            }
          });
        }
        showToast(`🏆 Purchased & Equipped ${item.name}! (-€${cost.toLocaleString()} • ${item.effectSummary || item.effect || 'Bonus Applied'})`);
      }

      if (updatedPlayer.stats) {
        const isGk = (updatedPlayer.subPosition || updatedPlayer.position || '').toUpperCase() === 'GK';
        if (isGk) {
          const gk = getOrCreateGkDetailed(updatedPlayer.stats);
          updatedPlayer.stats = syncCategoryStatsFromGkDetailed(updatedPlayer.stats, gk);
          updatedPlayer.ovr = calculateWeightedOvr('GK', 'GK', updatedPlayer.stats, updatedPlayer.playStyle);
        } else {
          const d = getOrCreateOutfieldDetailed(updatedPlayer.stats);
          updatedPlayer.stats = syncCategoryStatsFromDetailed(updatedPlayer.stats, d);
          updatedPlayer.ovr = calculateWeightedOvr(
            updatedPlayer.position || 'ST',
            updatedPlayer.subPosition || updatedPlayer.position || 'ST',
            updatedPlayer.stats,
            updatedPlayer.playStyle
          );
        }
      }

      if (onUpdatePlayer) {
        onUpdatePlayer(updatedPlayer);
      }

      if (onTriggerPerkUnlock && (item.category === 'upgrade' || item.category === 'season_boost')) {
        const wellnessCount = (storeItems?.filter((s) => (s.category === 'upgrade' || s.category === 'season_boost') && s.unlocked).length || 0) + 1;
        const milestonePerk = checkCareerPerkMilestones(updatedPlayer, {
          wellnessUpgradesCount: wellnessCount,
        });
        if (milestonePerk) {
          onTriggerPerkUnlock(milestonePerk);
        }
      }
    }
  };

  // Genetic Potential Activation Procedure Outcome Handler
  const handleApplyGeneticOutcome = (
    updatedPlayer: PlayerCardData,
    updatedAccounting: AccountingState,
    outcome: GeneticOutcomeDetail
  ) => {
    (updatedPlayer as any).geneticActivationCompleted = true;
    setAccounting(updatedAccounting);

    if (onUpdatePlayer) {
      onUpdatePlayer(updatedPlayer);
    }

    // Unlock upg_genetic_activation permanently
    setStoreItems((prev) =>
      prev.map((i) => (i.id === 'upg_genetic_activation' ? { ...i, unlocked: true } : i))
    );

    if (outcome.tier === 'critical_failure') {
      showToast('💥 CRITICAL FAILURE: Severe cellular rejection! -10 on all stats, -5 Potential.');
    } else if (outcome.tier === 'failure') {
      showToast('⚠️ PROCEDURE INERT: No physiological alteration occurred.');
    } else {
      showToast(`🧬 ${outcome.label.toUpperCase()}! +${outcome.potentialChange} Potential & +${outcome.statPointsBonus} Stat Points.`);
    }
  };

  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsorName.trim()) return;
    const pay = parseInt(newSponsorPay) || 100000;

    setAccounting((prev) => ({
      ...prev,
      sponsors: [
        ...prev.sponsors,
        { id: `sp-${Date.now()}`, name: newSponsorName.trim(), yearlyPayment: pay, logoColor: '#3b82f6' },
      ],
    }));
    setNewSponsorName('');
    setShowAddSponsor(false);
    showToast(`🤝 Signed new sponsor deal with ${newSponsorName}!`);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={onToggleVisibility}
          className="bg-white hover:bg-slate-100 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-2.5 text-sm font-black tracking-wider uppercase transition-all cursor-pointer active:scale-95"
        >
          <Eye className="w-5 h-5 text-slate-900" />
          <span>{t('SHOW') || 'SHOW'}</span>
        </button>
      </div>
    );
  }

  const isPro = isProfessionalPlayer(player);
  const contractDuration = isPro ? (accounting?.contractYears ?? 0) : 0;
  const isFreeAgent = Boolean(player.isFreeAgent || (isPro && contractDuration <= 0));
  const currentClubDisplay = !isPro
    ? (player.club ? `${player.club} Youth Academy` : t('Youth Academy'))
    : isFreeAgent
    ? t('Free Agent (Unattached)')
    : (player.club || t('Unassigned Club'));
  
  const leagueDisplay = !isPro
    ? (player.youthLeagueName || `${player.city || 'Regional'} Youth League`)
    : `${player.league || 'First Division'} • ${player.clubCountry || player.countryCode || 'Domestic'}`;

  const contractStatusLabel = !isPro
    ? t('Youth Registration (Amateur)')
    : isFreeAgent
    ? t('Contract Expired • Free Agent')
    : contractDuration === 1
    ? t('Expiring Contract (Final Year)')
    : t('Professional Contract');

  const yearsRemainingText = !isPro
    ? t('Youth Registration')
    : isFreeAgent
    ? t('0 YEARS REMAINING (FREE AGENT)')
    : contractDuration === 1
    ? t('1 YEAR REMAINING (FINAL YEAR)')
    : `${contractDuration} ${t('YEARS REMAINING')}`;

  const salaryText = !isPro
    ? t('No Professional Salary (€0/year)')
    : isFreeAgent
    ? t('€0/year (Free Agent)')
    : `€${(accounting?.yearlySalary || 150000).toLocaleString()}/${t('year')} (€${Math.round((accounting?.yearlySalary || 150000) / 52).toLocaleString()}/${t('wk')})`;

  const squadText = !isPro ? t('Youth Academy') : (player.squadDestination || 'First Team');
  const roleText = !isPro ? t('Youth Scholar') : (player.squadRole || player.playingTimeExpectation || 'Starter');

  const transferStatusText = !isPro
    ? t('Youth Academy Scholar')
    : isFreeAgent
    ? t('Free Agent — Direct Signings (€0 Transfer Fee)')
    : player.requestedTransfer || accounting?.transferStatus === 'transfer_listed'
    ? t('Transfer Listed (Seeking Move)')
    : contractDuration === 1
    ? t('Expiring — Pre-Contract Eligible & Inquiries Open')
    : (accounting?.transferStatus === 'approached' ? t('Approached by Clubs') : t('Not Listed'));

  const transferWindowInfo = useMemo(() => {
    return getTransferWindowStatus(player, currentDateStr);
  }, [player, currentDateStr]);

  return (
    <React.Suspense fallback={null}>
      <div className="flex flex-col w-full h-full bg-[#121319] text-white border-r border-slate-800 shadow-2xl relative overflow-hidden">
      {/* --- PERSISTENT UI TOP HEADER --- */}
      <div className="bg-[#181a24] p-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 z-10">
        {/* Bank Savings & Market Value Display */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-black text-emerald-400 shadow cursor-pointer hover:bg-slate-800 transition-all"
            title="Player Bank Savings"
            onClick={() => setActiveOverlayPanel('accounting')}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>€{(accounting.totalSavings ?? 0).toLocaleString()} {t('CASH') || 'Cash'}</span>
          </div>

          <div
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-black text-amber-400 shadow"
            title="Estimated Player Market Value"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>
              {player.marketValue
                ? player.marketValue >= 1000000
                  ? `€${(player.marketValue / 1000000).toFixed(1)}M Val`
                  : `€${(player.marketValue / 1000).toFixed(0)}K Val`
                : '€500K Val'}
            </span>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2">
          {hasAdvicePerk && (
            <button
              onClick={() => {
                if (player.parentAdviceUsedThisSeason) {
                  showToast('❤️ Parents already gave advice this season.');
                  return;
                }
                setShowAdviceModal(true);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow transition-all cursor-pointer ${
                player.parentAdviceUsedThisSeason
                  ? 'bg-slate-800 text-slate-500 border border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-950 border border-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{t('PARENTS_ADVICE') || "PARENTS' ADVICE"}</span>
            </button>
          )}

          <button
            onClick={onToggleVisibility}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded-xl text-xs border border-slate-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={t('HIDE') || 'Hide Persistent UI'}
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --- MAIN PERSISTENT UI CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* TOURNAMENT DRAW NEWS PIECE (OPTIONAL INSPECTION) */}
        {drawNewsPiece && (
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/50 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30">
                    {t('DRAW_NEWS_TITLE') || 'Tournament Draw Concluded'}
                  </span>
                </div>
                <p className="text-xs font-bold text-white truncate mt-0.5">
                  {drawNewsPiece.competitionName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {t('DRAW_NEWS_DESC', { competitionName: drawNewsPiece.competitionName }) || 'The official group-stage draw has completed.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPendingDrawState(drawNewsPiece.drawState);
                  setShowDrawModal(true);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition shadow-md cursor-pointer flex items-center gap-1"
              >
                <span>{t('DRAW_VIEW_RESULTS') || 'View Draw'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawNewsPiece(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PERMANENTLY VISIBLE METERS & STATUS SECTION */}
        <div className="bg-[#161722] p-3.5 rounded-2xl border border-slate-800 shadow-inner space-y-3">
          {/* PHYSICAL CONDITION & TEAM INTEGRATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. CHEMISTRY (0-200%) - Placed ABOVE FITNESS */}
            <div className="bg-[#10111a] p-3 rounded-xl border border-blue-900/50 flex flex-col justify-between space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-blue-300">
                <span className="flex items-center gap-1">
                  <Sparkles className={`w-3.5 h-3.5 ${chemInfo.isOverflow ? 'text-cyan-400 animate-pulse' : 'text-blue-400'}`} />
                  {t('PANEL_CHEMISTRY') || 'CHEMISTRY'}
                  {chemInfo.isOverflow && (
                    <span className="ml-1 px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded text-[9px] font-black animate-pulse">
                      OVERFLOW
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowOverflowExplainerModal(true)}
                    className="ml-1 text-slate-400 hover:text-cyan-300 cursor-pointer p-0.5 rounded transition-colors"
                    title="Overflow Chemistry Information"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </span>
                <span className="font-mono">
                  {chemInfo.isOverflow ? (
                    <span className="text-cyan-300 font-black">
                      100% <span className="text-slate-400 font-normal">+</span> <span className="text-cyan-400 font-black">{chemInfo.overflowChemistry}%</span>
                    </span>
                  ) : chemInfo.hasCeiling && typeof chemInfo.ceilingPercent === 'number' ? (
                    <span className="text-white font-black">
                      <span className="text-amber-400">{Math.min(chemInfo.ceilingPercent, chemInfo.chemistry)}%</span>
                      <span className="text-slate-400 font-normal"> / </span>
                      <span className="text-rose-400 font-bold">{chemInfo.ceilingPercent}%</span>
                      <span className="ml-1 text-[9px] px-1 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded uppercase font-bold tracking-tight">
                        {t('CAPPED') || 'Capped'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-white font-black">{chemInfo.chemistry}%</span>
                  )}
                </span>
              </div>
              {/* Visual Bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-blue-500/30 relative">
                {/* Base Chemistry Bar (0-100%) - strictly clamped so it never fills past ceilingPercent when capped */}
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    chemInfo.hasCeiling
                      ? 'bg-gradient-to-r from-blue-600 via-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400'
                  }`}
                  style={{
                    width: `${
                      chemInfo.hasCeiling && typeof chemInfo.ceilingPercent === 'number'
                        ? Math.max(0, Math.min(chemInfo.ceilingPercent, chemInfo.chemistry))
                        : Math.max(0, Math.min(100, chemInfo.chemistry))
                    }%`
                  }}
                />
                {/* Overflow Blue Bar filling across after 100% */}
                {chemInfo.isOverflow && (
                  <div
                    className="absolute inset-0 h-full rounded-full transition-all duration-500 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.95)] border border-cyan-200/60 z-10"
                    style={{ width: `${chemInfo.overflowChemistry}%` }}
                    title={`Overflow Chemistry: +${chemInfo.overflowChemistry}% (+${chemInfo.overflowChemistry} to each stat)`}
                  />
                )}
                {/* Visual Cap Wall: prevents visual filling past current cap value and shades out the locked range */}
                {chemInfo.hasCeiling && typeof chemInfo.ceilingPercent === 'number' && !chemInfo.isOverflow && (
                  <div
                    className="absolute top-0 bottom-0 right-0 bg-slate-950/80 border-l-2 border-rose-500 z-10 pointer-events-none"
                    style={{ left: `${chemInfo.ceilingPercent}%` }}
                    title={`Chemistry Capped @ ${chemInfo.ceilingPercent}% - Cannot exceed cap value`}
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                <span className={chemInfo.isOverflow ? "text-cyan-300 font-bold" : "text-blue-300 font-bold"}>
                  {chemInfo.statusLabel}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {chemInfo.isOverflow
                    ? `+${chemInfo.overflowChemistry} Stat Bonus (-5%/mo)`
                    : chemInfo.penaltyPercent > 0
                    ? `-${chemInfo.penaltyPercent}% Attribute Penalty`
                    : 'Optimal Synergy'}
                </span>
              </div>

              {/* ACTIVE CHEMISTRY CEILING BADGE */}
              {chemInfo.hasCeiling && (
                <div className="bg-rose-950/60 border border-rose-500/50 px-2 py-1 rounded-lg flex items-center justify-between text-[10px] text-rose-200">
                  <span className="font-bold flex items-center gap-1 truncate max-w-[160px]" title={chemInfo.ceilingReason}>
                    ⚠️ Cap: {chemInfo.ceilingPercent}% ({chemInfo.ceilingReason || 'Penalty'})
                  </span>
                  <span className="font-mono text-rose-300 font-bold shrink-0">
                    {chemInfo.ceilingMonthsRemaining} {chemInfo.ceilingMonthsRemaining === 1 ? 'mo' : 'mos'} rem
                  </span>
                </div>
              )}

              {/* Chemistry Monthly Progression Status */}
              <div className="pt-1 flex items-center justify-between text-[9px] border-t border-slate-800/80">
                <span className="text-slate-400 italic">
                  {chemInfo.hasCeiling
                    ? `Capped @ ${chemInfo.ceilingPercent}%`
                    : '+10% Chem / Month'}
                </span>
                <span className="text-[10px] font-bold text-blue-300">
                  {chemInfo.statusLabel}
                </span>
              </div>
            </div>

            {/* 2. FITNESS (0-100%) or INJURY RECOVERY BAR (When Injured) */}
            {player.isInjured ? (
              <div className="bg-[#10111a] p-3 rounded-xl border border-rose-900/80 flex flex-col justify-between space-y-1.5 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse-subtle">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-rose-300">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    RECOVERY PROGRESS
                  </span>
                  <span className="text-emerald-400 font-black">{(() => {
                    const rem = player.injuryWeeksRemaining || 0;
                    const tot = player.injuryTotalWeeks && player.injuryTotalWeeks > 0 ? player.injuryTotalWeeks : Math.max(rem, 1);
                    const passed = Math.max(0, tot - rem);
                    return Math.min(100, Math.round((passed / tot) * 100));
                  })()}%</span>
                </div>
                {/* Visual Injury Bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-rose-500/50 p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    style={{
                      width: `${(() => {
                        const rem = player.injuryWeeksRemaining || 0;
                        const tot = player.injuryTotalWeeks && player.injuryTotalWeeks > 0 ? player.injuryTotalWeeks : Math.max(rem, 1);
                        const passed = Math.max(0, tot - rem);
                        return Math.min(100, Math.round((passed / tot) * 100));
                      })()}%`
                    }}
                  />
                </div>
                {/* Underneath: Injury Name + Remaining Weeks */}
                <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                  <span className="text-rose-200 font-bold truncate max-w-[120px]" title={player.injuryName || 'Injured'}>
                    🚨 {player.injuryName || 'Injured'}
                  </span>
                  <span className="text-amber-300 font-bold font-mono">
                    {player.injuryWeeksRemaining || 0} {(player.injuryWeeksRemaining || 0) === 1 ? 'Wk' : 'Wks'} Out
                  </span>
                </div>
                {/* Heal button */}
                <div className="pt-1 flex items-center justify-between text-[9px] border-t border-slate-800">
                  <span className="text-slate-400">
                    Points: <strong className="text-amber-300">{recoveryPoints}</strong>
                  </span>
                  <button
                    onClick={handleUseRecoveryPoint}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2 py-0.5 rounded text-[9px] shadow transition-all cursor-pointer"
                  >
                    HEAL (-1 WK)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#10111a] p-3 rounded-xl border border-cyan-900/50 flex flex-col justify-between space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-cyan-300">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    {t('PANEL_FITNESS') || 'FITNESS'}
                  </span>
                  <span className="text-white font-black">{currentFitness}%</span>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
                  <div
                    className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${
                      currentFitness >= 70
                        ? 'from-emerald-500 to-teal-400'
                        : currentFitness >= 50
                        ? 'from-amber-500 to-yellow-400'
                        : 'from-rose-600 to-red-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, currentFitness))}%` }}
                  />
                </div>
                {/* Underneath: Injury Recovery Points + USE button */}
                <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                  <span>
                    Recovery Points: <strong className="text-amber-300">{recoveryPoints}</strong>
                  </span>
                  <button
                    onClick={handleUseRecoveryPoint}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2 py-0.5 rounded text-[9px] shadow transition-all cursor-pointer"
                  >
                    {t('HEAL') || 'HEAL'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* FINANCIALS, FAME & INFAMY ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-slate-800/60">
            {/* AVAILABLE CASH */}
            <div className="bg-[#10111a] p-2.5 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                <span>{t('AVAILABLE_CASH') || 'Available Cash'}</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </span>
              <div className="text-sm font-black text-emerald-400">
                €{(accounting?.totalSavings || 0).toLocaleString()}
              </div>
              <span className="text-[9px] text-slate-400">
                €{(netYearlyIncome / 1000000).toFixed(2)}M/yr Net Income
              </span>
            </div>

            {/* FAME */}
            <div className="bg-[#10111a] p-2.5 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-300">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {t('FAME') || 'FAME'}
                </span>
                <span>{playerFame} / 1000</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-amber-500/30">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, (playerFame / 1000) * 100))}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400">
                Sponsor Appeal
              </span>
            </div>

            {/* BAD REPUTATION & INFAMY */}
            <div className="bg-[#10111a] p-2.5 rounded-xl border border-rose-950/60 flex flex-col justify-between space-y-1">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-rose-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  {t('BAD_REP') || 'BAD REPUTATION'}
                </span>
                <span>{playerBadRep} / 100</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-rose-500/30">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, (playerBadRep / 100) * 100))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] text-rose-300">
                <span>Infamy: <strong>{infamyInfo.name}</strong></span>
                <span className="text-slate-400 font-mono">({infamyInfo.tierRoman})</span>
              </div>
            </div>
          </div>

          {/* 5. CONTRACT & REQUEST TRANSFER SECTION */}
          <div className="bg-[#10111a] p-3 rounded-xl border border-indigo-900/40 flex flex-col justify-between space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {t('CONTRACT') || 'CONTRACT'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {contractStatusLabel}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-300">
                {yearsRemainingText}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">{t('Club')}</span>
                <span className="font-black text-white truncate block">{currentClubDisplay}</span>
                <span className="text-[10px] text-slate-400 truncate block">{leagueDisplay}</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">{t('Squad & Role')}</span>
                <span className="font-bold text-cyan-300 truncate block">{squadText}</span>
                <span className="text-[10px] text-slate-400 truncate block">{roleText}</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">{t('Salary')}</span>
                <span className="font-black text-emerald-400 truncate block">{salaryText}</span>
                <span className="text-[10px] text-slate-400 truncate block">Weekly: €{Math.round((accounting?.yearlySalary || 150000) / 52).toLocaleString()}</span>
              </div>
              <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">{t('Transfer Status')}</span>
                <span className="font-bold text-amber-300 truncate block">{transferStatusText}</span>
                <span className="text-[10px] text-slate-400 truncate block">{transferWindowInfo.windowName} ({transferWindowInfo.isOpen ? 'OPEN' : 'CLOSED'})</span>
              </div>
            </div>

            {/* REQUEST TRANSFER BUTTON (Positioned directly under Contract section) */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">
                  {player.transferRequestUsedThisSeason
                    ? '🔒 1/Season Used • Recharges at next Preseason'
                    : player.requestedTransfer
                    ? '⏳ Transfer Request Active: Opportunity queued for next window'
                    : '⚡ 1 Request per Season • Penalizes Chemistry by -30%'}
                </span>
                {player.pendingTransferRequest && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold text-[9px]">
                    Pending {player.pendingTransferRequest.targetWindow === 'winter' ? 'Winter' : 'Summer'} Window
                  </span>
                )}
              </div>
              <button
                onClick={handleRequestTransfer}
                disabled={player.transferRequestUsedThisSeason || playerChem <= 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  player.transferRequestUsedThisSeason
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : playerChem <= 0
                    ? 'bg-rose-950/40 text-rose-500 border border-rose-900/40 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white border border-rose-500/50 shadow-rose-900/30'
                }`}
                title={
                  player.transferRequestUsedThisSeason
                    ? 'Transfer request limit used this season. Recharges automatically at Preseason.'
                    : 'Request transfer to an eligible club outside your current league (-30% Chemistry)'
                }
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {player.transferRequestUsedThisSeason
                    ? t('REQUEST TRANSFER (1/SEASON - USED)') || 'REQUEST TRANSFER (1/SEASON - USED)'
                    : t('REQUEST TRANSFER (-30%)') || 'REQUEST TRANSFER (-30%)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* SECOND ROW: TRAINING PROGRESS & CALENDAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* TRAINING PROGRESS */}
          <div className="bg-[#161722] p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-200">
              <span className="flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                {t('TRAINING_PROGRESS') || 'TRAINING PROGRESS'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-mono">{Math.round(trainingProgress)}% / 100%</span>
                <button
                  onClick={handleAdvanceTraining}
                  disabled={!trainInfo.canTrain}
                  className={`text-xs font-black px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer min-h-[32px] ${
                    trainInfo.canTrain
                      ? 'bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                  }`}
                  title={trainInfo.reason}
                >
                  {trainInfo.buttonText}
                </button>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, trainingProgress))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>
                {player.age && player.age >= transitionAge
                  ? `Protects stats against decline (${monthsReq} mo/lvl)`
                  : `Fills over year (+1 all stats at 100%)`}
              </span>
              <span>
                Transition Age: <strong className="text-slate-200">{transitionAge} yrs</strong> ({player.position === 'GK' ? 'GK' : 'Outfield'})
              </span>
            </div>
          </div>

          {/* CALENDAR */}
          <div className="bg-[#161722] p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-200">
              <span className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-blue-400" />
                {t('CAREER_CALENDAR') || 'CAREER CALENDAR'}
              </span>
              <button
                onClick={handleAdvanceCalendar}
                className="bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 text-xs font-black px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 min-h-[32px]"
              >
                +7 Days
              </button>
            </div>
            <div className="text-sm font-black text-white font-mono bg-[#10111a] p-2 rounded-xl border border-slate-800 text-center">
              {currentDateStr}
            </div>
          </div>
        </div>

        {/* DEVELOPMENT STAGE & ACADEMY FOOTBALL SCHOOL SECTION */}
        <DevelopmentStagePanel player={player} />

        {/* PLAYER CARD OVERVIEW WITH CUSTOMIZATION BUTTON */}
        <div className="bg-[#161722] p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col items-center relative">
          <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              {t('PLAYER_CARD_OVERVIEW') || 'PLAYER CARD OVERVIEW'}
            </h3>

            <div className="flex items-center gap-2">
              {onSaveCareer && (
                <button
                  onClick={onSaveCareer}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  title={`Quick Save Career to Slot ${activeSaveSlotId}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>SAVE (SLOT {activeSaveSlotId})</span>
                </button>
              )}

              {onOpenSaveManager && (
                <button
                  onClick={onOpenSaveManager}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  title="Manage Save Slots"
                >
                  <FolderHeart className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">SLOTS</span>
                </button>
              )}

              {/* CUSTOMIZATION ICON BUTTON - SOLID WHITE & MINIMAL */}
              <button
                onClick={() => setShowCustomizationModal(true)}
                className="bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                title="Open Customization"
              >
                <Scissors className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('CUSTOMIZATION') || 'CUSTOMIZATION'}</span>
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center py-2">
            <PlayerCard
              id="player-card-render"
              player={player}
              isFlipped={isFlipped}
              onFlip={onFlip}
              onUpdatePlayer={onUpdatePlayer}
            />
          </div>
        </div>

        {/* --- CAREER ACTION MODULES WITH CATEGORY HUB SWITCHER --- */}
        <div className="space-y-3 pt-2">
          {((player.freeStatPoints || player.unassignedPoints || 0) > 0) && (
            <div className="bg-slate-900 border border-rose-500/80 p-3 rounded-2xl flex items-center justify-between text-xs text-white shadow-lg mb-1">
              <div className="flex items-center gap-2.5 font-black text-rose-300">
                <span className="text-base animate-pulse">🔴</span>
                <span>{player.freeStatPoints || player.unassignedPoints} UNSPENT STAT POINTS</span>
              </div>
              <button
                onClick={() => setActiveOverlayPanel('development')}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all active:scale-95 min-h-[36px]"
              >
                Open Development
              </button>
            </div>
          )}

          {/* CATEGORY SELECTOR PILLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                {t('PANEL_CAREER_PANELS') || 'CAREER PANELS'}
              </span>
              {((player.freeStatPoints || player.unassignedPoints || 0) > 0) && (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md font-black animate-pulse">
                  ! {player.freeStatPoints || player.unassignedPoints} pts
                </span>
              )}
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'All', count: isTestMode ? 13 : 12 },
                { id: 'player', label: 'Player Hub', count: 3, alert: ((player.freeStatPoints || player.unassignedPoints || 0) > 0) },
                { id: 'club_life', label: 'Club & Life', count: 3 },
                { id: 'world_legacy', label: 'World & Legacy', count: isTestMode ? 7 : 6 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMenuFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    menuFilter === tab.id
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.alert && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  )}
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    menuFilter === tab.id ? 'bg-slate-200 text-slate-900' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {/* 1. STORE */}
            {(menuFilter === 'all' || menuFilter === 'club_life') && (
              <button
                onClick={() => setActiveOverlayPanel('store')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('STORE')}</span>
              </button>
            )}

            {/* 2. CARD COLLECTION */}
            {(menuFilter === 'all' || menuFilter === 'world_legacy') && (
              <button
                onClick={() => setActiveOverlayPanel('cards_collection')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <FolderHeart className="w-4 h-4" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('CARDS')}</span>
              </button>
            )}

            {/* 3. DEVELOPMENT */}
            {(menuFilter === 'all' || menuFilter === 'player') && (
              <button
                onClick={() => setActiveOverlayPanel('development')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group relative min-h-[72px] sm:min-h-[80px] ${
                  (player.freeStatPoints || player.unassignedPoints || 0) > 0
                    ? 'border-rose-500 ring-2 ring-rose-500/50'
                    : 'border-slate-200'
                } ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                {((player.freeStatPoints || player.unassignedPoints || 0) > 0) && (
                  <span className="absolute -top-2 -right-1.5 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-300 shadow-md animate-pulse flex items-center gap-0.5 z-20">
                    🔴 !
                  </span>
                )}
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('DEVELOPMENT')}</span>
              </button>
            )}

            {/* 4. ACCOUNTING */}
            {(menuFilter === 'all' || menuFilter === 'club_life') && (
              <button
                onClick={() => setActiveOverlayPanel('accounting')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('FINANCES')}</span>
              </button>
            )}

            {/* 5. MANAGER */}
            {(menuFilter === 'all' || menuFilter === 'club_life') && (
              <button
                onClick={() => setActiveOverlayPanel('manager')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('MANAGER')}</span>
              </button>
            )}

            {/* 6. STATISTICS */}
            {(menuFilter === 'all' || menuFilter === 'player') && (
              <button
                onClick={() => setActiveOverlayPanel('statistics')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('STATISTICS') || 'STATISTICS'}</span>
              </button>
            )}

            {/* 7. SETTINGS */}
            {(menuFilter === 'all' || menuFilter === 'world_legacy') && (
              <button
                onClick={() => setActiveOverlayPanel('settings')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('SETTINGS')}</span>
              </button>
            )}

            {/* 8. TROPHIES */}
            {(menuFilter === 'all' || menuFilter === 'world_legacy') && (
              <button
                onClick={() => setActiveOverlayPanel('trophies')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('TROPHIES')}</span>
              </button>
            )}

            {/* 9. PERKS */}
            {(menuFilter === 'all' || menuFilter === 'player') && (
              <button
                onClick={() => setActiveOverlayPanel('perks')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('PERKS')}</span>
              </button>
            )}

            {/* 10. NATIONAL TEAM */}
            {(menuFilter === 'all' || menuFilter === 'world_legacy') && (
              <button
                onClick={() => setActiveOverlayPanel('national_team')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">{t('NATIONAL_TEAM')}</span>
              </button>
            )}

            {/* 11. WORLD RESULTS */}
            {(menuFilter === 'all' || menuFilter === 'world_legacy') && (
              <button
                onClick={() => {
                  if (onOpenWorldResults) onOpenWorldResults();
                }}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">WORLD RESULTS</span>
              </button>
            )}

            {/* 12. RETIREMENT / CAREER SUMMARY */}
            {(menuFilter === 'all' || menuFilter === 'world_legacy') && (
              <button
                onClick={() => {
                  if (player.isRetired || player.careerConcluded) {
                    if (onOpenCareerSummary) onOpenCareerSummary();
                  } else {
                    if (onTriggerRetirement) onTriggerRetirement();
                  }
                }}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">
                  {player.isRetired || player.careerConcluded ? (t('PANEL_CAREER_SUMMARY') || 'CAREER SUMMARY') : (t('PANEL_RETIREMENT') || 'RETIREMENT')}
                </span>
              </button>
            )}

            {/* 12. TEST MODE (VISIBLE WHEN TEST MODE IS ACTIVE) */}
            {isTestMode && (menuFilter === 'all' || menuFilter === 'world_legacy') && (
              <button
                onClick={() => setActiveOverlayPanel('test_mode')}
                className={`p-3 sm:p-4 bg-white hover:bg-slate-100 text-slate-950 border-2 border-amber-400 flex flex-col items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer group min-h-[72px] sm:min-h-[80px] ${activeCompTheme.theme.panelRadiusClass || 'rounded-2xl'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-black tracking-wide uppercase truncate w-full text-center">
                  {t('SETTINGS_TEST_MODE') || 'TEST MODE 🧪'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- FULL-SCREEN OVERLAY PANELS WITH TOP-RIGHT 'X' CLOSE BUTTON --- */}
      {activeOverlayPanel && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex flex-col animate-in fade-in duration-150 bg-slate-950"
        >
          {/* OVERLAY PANEL TOP BAR */}
          <div
            className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-md"
          >
            <div className="flex items-center gap-3">
              {activeCompTheme.emblem?.url && (
                <img src={activeCompTheme.emblem.url} alt={activeCompTheme.competitionName} className="w-6 h-6 object-contain" />
              )}
              <h2 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                {activeOverlayPanel === 'store' && <ShoppingBag className="w-5 h-5 text-blue-400" />}
                {activeOverlayPanel === 'cards_collection' && <FolderHeart className="w-5 h-5 text-purple-400" />}
                {activeOverlayPanel === 'development' && <TrendingUp className="w-5 h-5 text-emerald-400" />}
                {activeOverlayPanel === 'accounting' && <DollarSign className="w-5 h-5 text-amber-400" />}
                {activeOverlayPanel === 'manager' && <UserCheck className="w-5 h-5 text-slate-300" />}
                {activeOverlayPanel === 'statistics' && <BarChart3 className="w-5 h-5 text-indigo-400" />}
                {activeOverlayPanel === 'settings' && <Settings className="w-5 h-5 text-gray-300" />}
                {activeOverlayPanel === 'trophies' && <Award className="w-5 h-5 text-amber-400" />}
                {activeOverlayPanel === 'perks' && <Sparkles className="w-5 h-5 text-amber-400" />}
                {activeOverlayPanel === 'national_team' && <Globe className="w-5 h-5 text-amber-400" />}
                {activeOverlayPanel === 'test_mode' && <Zap className="w-5 h-5 text-amber-400 animate-bounce" />}
                <span>
                  {activeOverlayPanel === 'store' && t('STORE')}
                  {activeOverlayPanel === 'cards_collection' && t('CARDS')}
                  {activeOverlayPanel === 'development' && t('DEVELOPMENT')}
                  {activeOverlayPanel === 'accounting' && t('FINANCES')}
                  {activeOverlayPanel === 'manager' && t('MANAGER')}
                  {activeOverlayPanel === 'statistics' && (t('STATISTICS') || 'STATISTICS')}
                  {activeOverlayPanel === 'settings' && t('SETTINGS')}
                  {activeOverlayPanel === 'trophies' && t('TROPHIES')}
                  {activeOverlayPanel === 'perks' && t('PERKS')}
                  {activeOverlayPanel === 'national_team' && t('NATIONAL_TEAM')}
                  {activeOverlayPanel === 'test_mode' && (t('SETTINGS_TEST_MODE') || 'DEVELOPER TEST LAB 🧪')}
                </span>
              </h2>
            </div>

            {/* PROMINENT CLOSE / RETURN TO SIMULATION BUTTON - SOLID WHITE & MINIMAL */}
            <button
              onClick={() => {
                setActiveOverlayPanel(null);
                if (onReturnToYouthAcademy) {
                  onReturnToYouthAcademy();
                }
              }}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl flex items-center gap-2 font-black text-xs cursor-pointer shadow-md active:scale-95 border border-slate-200 transition-all shrink-0 min-h-[38px]"
              title={t('BTN_RETURN_TO_SIMULATION')}
            >
              <X className="w-4 h-4 stroke-[2.5]" />
              <span>{t('BTN_RETURN_TO_SIMULATION')}</span>
            </button>
          </div>

          {/* OVERLAY PANEL BODY CONTENT */}
          <div className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6 custom-scrollbar">
            {/* 1. STORE OVERLAY PANEL */}
            {activeOverlayPanel === 'store' && (
              <div className="space-y-5">
                <div className="bg-[#161722] p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Career Store & Upgrades</h3>
                    <p className="text-xs text-slate-400">
                      Items organized across 5 Tier Levels. Press BUY to unlock items using Euro funds (€).
                    </p>
                  </div>
                  <div className="bg-emerald-950 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl text-xs font-black text-emerald-300">
                    💰 Available Cash: €{(accounting.totalSavings ?? 0).toLocaleString()}
                  </div>
                </div>

                {/* STORE HEADER & INVENTORY STATUS */}
                <div className="bg-[#161722] p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">Career Store & Upgrades</h3>
                      <p className="text-xs text-slate-400">
                        Consumables, Upgrades, Season Boosts, Pro Equipment & Cosmetics across 5 Tier Levels.
                      </p>
                    </div>
                    <div className="bg-emerald-950 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl text-xs font-black text-emerald-300">
                      💰 Available Cash: €{(accounting.totalSavings ?? 0).toLocaleString()}
                    </div>
                  </div>

                  {/* ACTIVE EQUIPMENT & BOOSTS STATUS BAR */}
                  {(player?.activeEquipment?.length || player?.activeSeasonBoosts?.length || player?.activeTapingMonths) ? (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-[11px] font-black uppercase text-slate-400">Active Loadout:</span>
                      {player?.activeTapingMonths ? (
                        <span className="bg-amber-950/60 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-lg font-extrabold text-[11px]">
                          🩹 Taping Active ({player.activeTapingMonths} mos)
                        </span>
                      ) : null}
                      {player?.activeEquipment?.map((eq, idx) => (
                        <span key={idx} className="bg-blue-950/60 border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded-lg font-extrabold text-[11px] flex items-center gap-1">
                          <span>👟 {eq.name}</span>
                          <span className="text-blue-400 bg-blue-900/50 px-1 rounded text-[10px]">
                            {eq.durability?.current ?? eq.matchDuration ?? 1} matches
                          </span>
                        </span>
                      ))}
                      {player?.activeSeasonBoosts?.map((sb, idx) => (
                        <span key={idx} className="bg-purple-950/60 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-lg font-extrabold text-[11px]">
                          ⚡ {sb.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* STORE CATEGORY FILTERS */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'All Store', activeClass: 'bg-slate-200 text-slate-900 shadow-md font-black' },
                    { id: 'consumables', label: 'Consumables', activeClass: STORE_CATEGORY_THEMES.consumables.activeTab },
                    { id: 'upgrade', label: 'Upgrades', activeClass: STORE_CATEGORY_THEMES.upgrade.activeTab },
                    { id: 'season_boost', label: 'Season Boosts', activeClass: STORE_CATEGORY_THEMES.season_boost.activeTab },
                    { id: 'pro_equipment', label: 'Pro Equipment', activeClass: STORE_CATEGORY_THEMES.pro_equipment.activeTab },
                    { id: 'special_hair', label: 'Cosmetics', activeClass: STORE_CATEGORY_THEMES.special_hair.activeTab },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setStoreCategory(cat.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                        storeCategory === cat.id
                          ? cat.activeClass
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* STORE ITEMS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {[...storeItems]
                    .sort((a, b) => a.tier - b.tier)
                    .filter((item) => {
                      if (storeCategory === 'all') return true;
                      if (storeCategory === 'pro_equipment') return item.category === 'pro_equipment' || item.category === 'equipment';
                      if (storeCategory === 'special_hair') return item.category === 'special_hair' || item.category === 'cosmetics';
                      return item.category === storeCategory;
                    })
                    .map((item) => {
                      const isOutOfStock = (item.category === 'consumables' || item.category === 'pro_equipment') && (item.availableStock !== undefined && item.availableStock <= 0);
                      const isUnlocked = item.unlocked && (item.category === 'upgrade' || item.category === 'season_boost' || item.category === 'special_hair');
                      const tierInfo = STORE_TIER_NAMES[item.tier || 1] || STORE_TIER_NAMES[1];
                      const categoryTheme = STORE_CATEGORY_THEMES[item.category] || STORE_CATEGORY_THEMES.upgrade;
                      const isGeneticActivation = item.id === 'upg_genetic_activation';

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 relative overflow-hidden ${
                            isGeneticActivation
                              ? 'bg-gradient-to-b from-purple-950/40 to-[#161722] border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                              : isUnlocked
                              ? 'bg-emerald-950/20 border-emerald-500/40'
                              : isOutOfStock
                              ? 'bg-slate-900/40 border-slate-800 opacity-60'
                              : `bg-[#161722] border-slate-800 ${categoryTheme.accentBorder}`
                          }`}
                        >
                          <div>
                            {/* TOP HEADER: ICON + NAME + BADGES */}
                            <div className="flex items-start gap-2.5">
                              <div className="flex-shrink-0 mt-0.5">
                                <StoreItemIcon item={item} size="md" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-white truncate">
                                    {t(`${item.id}:name`) || t(`STORE_ITEM_${item.id}_NAME`) || t(item.name)}
                                  </span>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${tierInfo.color}`}>
                                      {t(`STORE_TIER_${item.tier}`) || t(tierInfo.name)}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${categoryTheme.badge}`}>
                                    {t(`STORE_CAT_${item.category}`) || t(categoryTheme.name)}
                                  </span>
                                  {isGeneticActivation && (
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded border border-rose-500/50 bg-rose-950/40 text-rose-300 animate-pulse">
                                      {t('STORE_RISKY_PROCEDURE')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                              {t(`${item.id}:desc`) || t(`STORE_ITEM_${item.id}_DESC`) || t(item.description)}
                            </p>

                            <div className="text-xs font-extrabold text-blue-400 mt-2 flex items-center gap-1">
                              <span>✨</span>
                              <span>
                                {t(`${item.id}:effect`) || t(`STORE_ITEM_${item.id}_EFFECT`) || t(item.effectSummary || item.effect || '')}
                              </span>
                            </div>

                            {/* ITEM META / STOCK / DURATION */}
                            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                              {item.category === 'consumables' && (
                                <span className={item.availableStock && item.availableStock > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                  📦 Stock: {item.availableStock ?? 0}/{item.maxStock ?? 1} (Preseason Refill)
                                </span>
                              )}
                              {item.category === 'pro_equipment' && (
                                <>
                                  <span className="text-amber-400 font-bold">
                                    ⏱️ {item.matchDuration || item.durability?.max || 10} Matches Duration
                                  </span>
                                  <span className={item.availableStock && item.availableStock > 0 ? 'text-slate-300' : 'text-rose-400'}>
                                    Stock: {item.availableStock ?? 0}
                                  </span>
                                </>
                              )}
                              {item.category === 'upgrade' && (
                                <span className={isGeneticActivation ? 'text-purple-300 font-bold' : 'text-amber-400'}>
                                  {isGeneticActivation ? '🧬 1-Time Experimental Surgery' : '🏗️ Permanent Facility Upgrade'}
                                </span>
                              )}
                              {item.category === 'season_boost' && (
                                <span className="text-purple-400">
                                  ⏳ Active For Current Season
                                </span>
                              )}
                              {item.category === 'special_hair' && (
                                <span className="text-pink-400">
                                  💈 Hairstyle Cosmetic
                                </span>
                              )}
                            </div>
                          </div>

                          {/* DIRECT BUY BUTTON */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-amber-300">
                                €{(item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000)).toLocaleString()}
                              </span>
                              <span className="text-[10px] font-bold text-amber-500/80">
                                {item.coinPrice || (item.tier === 2 ? 150 : item.tier === 3 ? 400 : item.tier === 4 ? 1000 : item.tier === 5 ? 2500 : item.tier === 6 ? 5000 : 50)} Coins
                              </span>
                            </div>

                            {isUnlocked ? (
                              <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> {isGeneticActivation ? 'ACTIVATED' : 'ACTIVE'}
                              </span>
                            ) : isOutOfStock ? (
                              <span className="text-xs font-black text-rose-400 px-3 py-1 bg-rose-950/40 border border-rose-800/40 rounded-xl">
                                OUT OF STOCK
                              </span>
                            ) : (() => {
                              const itemCost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
                              const canAfford = availableCash >= itemCost;

                              if (!canAfford) {
                                return (
                                  <button
                                    disabled
                                    className="bg-slate-800/80 border border-slate-700 text-slate-500 font-bold px-3 py-1.5 rounded-xl text-xs cursor-not-allowed opacity-70"
                                    title={`Insufficient funds! Requires €${itemCost.toLocaleString()} (Available: €${availableCash.toLocaleString()})`}
                                  >
                                    NEED €{itemCost >= 1000000 ? `${(itemCost / 1000000).toFixed(0)}M` : itemCost.toLocaleString()}
                                  </button>
                                );
                              }

                              if (isGeneticActivation) {
                                return (
                                  <button
                                    onClick={() => handleBuyStoreItem(item)}
                                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-3.5 py-1.5 rounded-xl text-xs shadow-lg shadow-purple-950/60 ring-1 ring-purple-400/50 transition-all cursor-pointer active:scale-95 animate-pulse"
                                  >
                                    🧬 UNDERGO PROCEDURE
                                  </button>
                                );
                              }

                              return (
                                <button
                                  onClick={() => handleBuyStoreItem(item)}
                                  className={`${categoryTheme.buttonClass} font-black px-4 py-1.5 rounded-xl text-xs shadow-md transition-all cursor-pointer active:scale-95`}
                                >
                                  {item.category === 'consumables' ? 'USE' : item.category === 'pro_equipment' ? 'EQUIP' : 'BUY'}
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 2. TROPHIES OVERLAY PANEL */}
            {activeOverlayPanel === 'trophies' && (
              <div className="space-y-4">
                <div className="bg-[#161722] p-4 rounded-2xl border border-amber-500/40">
                  <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    CAREER TROPHY CABINET & MILESTONES
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your full legacy of earned cups, league titles, individual honors, and milestone trophies.
                  </p>
                </div>
                <TrophyCabinet
                  trophies={player.trophies || []}
                  onChangeTrophies={onTrophiesChange}
                  player={player}
                  onOpenChampionCelebration={onOpenChampionCelebration}
                />
              </div>
            )}

            {/* PERKS OVERLAY PANEL */}
            {activeOverlayPanel === 'perks' && (
              <PerksPanel player={player} onUpdatePlayer={onUpdatePlayer} />
            )}

            {/* NATIONAL TEAM OVERLAY PANEL */}
            {activeOverlayPanel === 'national_team' && (
              <NationalTeamPanel
                player={player}
                onUpdatePlayer={onUpdatePlayer}
                onTriggerCallUpModal={(callUp) => setActiveCallUp(callUp)}
              />
            )}

            {/* 2. CARD COLLECTION OVERLAY PANEL */}
            {activeOverlayPanel === 'cards_collection' && (
              <CardsCollectionPanel
                collectedCards={player.collectedCards}
                fame={playerFame}
                badReputation={playerBadRep}
                equippedParentCard={player.equippedParentCard}
              />
            )}

            {/* 3. DEVELOPMENT OVERLAY PANEL (FULL SCREEN ON MOBILE & DESKTOP) */}
            {activeOverlayPanel === 'development' && (
              <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col w-full h-full overflow-hidden">
                <PlayerDevelopmentPanel
                  player={player}
                  onUpdatePlayer={(updated) => {
                    if (onUpdatePlayer) {
                      onUpdatePlayer(updated);
                    }
                  }}
                  showToast={showToast}
                  onTriggerPerkUnlock={onTriggerPerkUnlock}
                  onClose={() => setActiveOverlayPanel(null)}
                  onReturnToYouthAcademy={() => {
                    setActiveOverlayPanel(null);
                    if (onReturnToYouthAcademy) {
                      onReturnToYouthAcademy();
                    }
                  }}
                />
              </div>
            )}

            {/* 4. ACCOUNTING OVERLAY PANEL */}
            {activeOverlayPanel === 'accounting' && (
              <div className="space-y-4">
                {/* SUMMARY STATS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#161722] p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">Total Cash Savings</span>
                    <span className="text-base font-black text-amber-400">
                      €{(accounting.totalSavings ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-[#161722] p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">Yearly Salary</span>
                    <span className="text-base font-black text-emerald-400">
                      €{(accounting.yearlySalary / 1000000).toFixed(2)}M / yr
                    </span>
                  </div>
                  <div className="bg-[#161722] p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">Sponsorship Income</span>
                    <span className="text-base font-black text-emerald-300">
                      €{(totalSponsorIncome / 1000000).toFixed(2)}M / yr
                    </span>
                  </div>
                  <div className="bg-[#161722] p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">Net Total Cash</span>
                    <span className="text-base font-black text-amber-300">
                      €{(netYearlyIncome / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>

                {/* SPONSORSHIP INFO BANNER */}
                <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 p-4 rounded-2xl border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Sponsorship & Commercial Deals Overview
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Active sponsorships, endorsements, and obligations collected from Preseason & Mid-Season Career Card events are recorded and managed here.
                    </p>
                  </div>
                </div>

                {/* ACTIVE SPONSOR CONTRACTS & DEBT OBLIGATIONS */}
                <div className="bg-[#161722] p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      Commercial Endorsements & Liabilities
                    </h3>
                    <span className="text-xs font-bold text-slate-400">
                      {(accounting.sponsors || []).length} Contracts Recorded
                    </span>
                  </div>

                  {(accounting.sponsors || []).length === 0 ? (
                    <div className="text-center py-6 bg-[#10111a] rounded-xl border border-slate-800/80 space-y-1.5">
                      <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs font-semibold text-slate-300">No active sponsor contracts recorded yet.</p>
                      <p className="text-[11px] text-slate-400 italic">
                        Sponsor deals appear during Preseason & Mid-Season Career Card events (15% base chance in 4-card draws).
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(accounting.sponsors || []).map((sp) => (
                        <div
                          key={sp.id}
                          className={`bg-[#10111a] p-3.5 rounded-xl border space-y-2 relative overflow-hidden ${
                            sp.category === 'negative'
                              ? 'border-rose-900/60'
                              : sp.category === 'double_edged'
                              ? 'border-purple-900/60'
                              : 'border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-white">{sp.name}</span>
                            <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase">
                              {sp.tier && (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                                  {sp.tier}
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded border ${
                                  sp.category === 'negative'
                                    ? 'bg-rose-950 text-rose-300 border-rose-600/40'
                                    : sp.category === 'double_edged'
                                    ? 'bg-purple-950 text-purple-300 border-purple-600/40'
                                    : 'bg-emerald-950 text-emerald-300 border-emerald-600/40'
                                }`}
                              >
                                {sp.category || 'Good'}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs space-y-1 text-slate-300 font-semibold">
                            {sp.initialPayment > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Upfront Cash:</span>
                                <span className="text-emerald-400 font-bold">+€{sp.initialPayment.toLocaleString()}</span>
                              </div>
                            )}
                            {sp.yearlyPayment > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Yearly Salary:</span>
                                <span className="text-emerald-300 font-bold">+€{sp.yearlyPayment.toLocaleString()} / yr</span>
                              </div>
                            )}
                            {sp.durationYears && (
                              <div className="flex justify-between">
                                <span className="text-slate-400">Contract Length:</span>
                                <span className="text-slate-200">{sp.durationYears} Year(s)</span>
                              </div>
                            )}
                            {sp.bonusTerms && (
                              <div className="text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-500/20">
                                Bonus: {sp.bonusTerms}
                              </div>
                            )}
                            {sp.debtObligation && (
                              <div className="text-[11px] text-rose-300 bg-rose-950/50 p-2 rounded border border-rose-500/40 font-bold space-y-1">
                                <div className="flex items-center gap-1 text-rose-400">
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span>DEBT OBLIGATION ACTIVE</span>
                                </div>
                                <div>Repayment Due: €{sp.debtObligation.repaymentAmount.toLocaleString()}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Businesses & Franchise Management */}
                <div className="bg-[#161722] p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white">Business Franchise Portfolio</h3>
                    <button
                      onClick={() => setIsBuyBusinessModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Buy Business
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(accounting?.businesses || []).map((biz) => {
                      const currTier = biz.tier || 1;
                      const isMaxTier = currTier >= 5;
                      const template =
                        BUSINESS_TEMPLATES.find((t) => t.id === biz.templateId) ||
                        BUSINESS_TEMPLATES.find((t) => t.name === biz.name) ||
                        BUSINESS_TEMPLATES[0];
                      const nextTier = currTier + 1;
                      const upgradeCost = template.tiers[nextTier]?.cost || 0;
                      const canAffordUpgrade = availableCash >= upgradeCost;

                      return (
                        <div key={biz.id} className="bg-[#10111a] p-3.5 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-white">{biz.name}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                              Tier {biz.tier || 1}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-300">
                            <span>Revenue: €{biz.revenue.toLocaleString()}</span>
                            <span className="text-emerald-400 font-bold">
                              Profit: +€{(biz.revenue - biz.expenses).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-1">
                            {isMaxTier ? (
                              <button
                                disabled
                                className="flex-1 bg-slate-800/60 text-slate-500 text-[10px] font-bold py-1.5 rounded-lg cursor-not-allowed border border-slate-700/50"
                              >
                                Max Tier 5
                              </button>
                            ) : !canAffordUpgrade ? (
                              <button
                                disabled
                                title={`Insufficient funds! Requires ${formatEuros(upgradeCost)} (Available: ${formatEuros(availableCash)})`}
                                className="flex-1 bg-slate-800/80 text-slate-500 border border-slate-700 text-[10px] font-bold py-1.5 rounded-lg cursor-not-allowed opacity-70"
                              >
                                Upgrade (Need {formatEuros(upgradeCost)})
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpgradeBusiness(biz.id)}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-1.5 rounded-lg transition-all cursor-pointer shadow"
                              >
                                Upgrade ({formatEuros(upgradeCost)})
                              </button>
                            )}
                            <button
                              onClick={() => handleSellBusiness(biz.id)}
                              className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/50 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 5. AGENT OVERLAY PANEL */}
            {activeOverlayPanel === 'manager' && (() => {
              const isPro = isProfessionalPlayer(player);
              const hasAgent = hasActiveAgent(player, manager);
              const effectiveNegotiation = hasAgent ? (manager.negotiation ?? 50) : 0;
              const effectiveNetwork = hasAgent ? (manager.network ?? 50) : 0;
              const effectiveMarketing = hasAgent ? (manager.marketing ?? 50) : 0;

              const agentTypeKey = manager.managerType || 'professional';
              const currentProfile = AGENT_TYPE_PROFILES[agentTypeKey] || AGENT_TYPE_PROFILES.professional;
              const isParentAgent = Boolean(
                currentProfile.isParentCardExclusive ||
                agentTypeKey === 'parent_ex_pro' ||
                agentTypeKey === 'parent_helicopter' ||
                agentTypeKey === 'ex_pro_parents' ||
                agentTypeKey === 'helicopter_parents'
              );

              const offerRateInfo = calculatePreseasonManagerOfferRate(player);

              const handleFireAgent = () => {
                if (isParentAgent) return;
                setManager({
                  name: '',
                  managerType: 'unassigned' as any,
                  tier: 'bronze',
                  negotiation: 0,
                  network: 0,
                  marketing: 0,
                  specialTrait: '',
                  agencyName: '',
                  bio: '',
                });
                setConfirmFireAgent(false);
                if (showToast) {
                  showToast('👋 You have parted ways with your agent. You are now self-managed.');
                }
              };

              return (
                <div className="bg-[#161722] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                  {/* Header & Agent Profile */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                        hasAgent ? `bg-gradient-to-br ${currentProfile.badgeColor}` : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">
                            {t('Player Agent Representation')}
                          </span>
                          {hasAgent && (
                            <>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${currentProfile.badgeColor} uppercase`}>
                                {t(currentProfile.title)}
                              </span>
                              {manager.tier && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-amber-300 bg-amber-950/80 border border-amber-600/50 uppercase">
                                  {manager.tier} {t('Tier')}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <div className="text-base font-black text-white">
                          {hasAgent ? manager.name : t('Self-Managed Athlete (No Agent)')}
                        </div>
                        {hasAgent && manager.agencyName && (
                          <div className="text-xs text-slate-400 font-semibold">
                            {t('Agency')}: <span className="text-slate-200">{manager.agencyName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {manager.associatedClubName && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-extrabold text-amber-300">
                          🏛️ {manager.associatedClubName}
                        </span>
                      )}
                      <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-slate-300">
                        {isPro ? t('⭐ Professional Footballer') : t('🌱 Youth Development')}
                      </div>
                    </div>
                  </div>

                  {/* PERMANENT CURRENT CONTRACT SECTION */}
                  {(() => {
                    const isPro = isProfessionalPlayer(player);
                    const contractDuration = isPro ? (accounting?.contractYears ?? 0) : 0;
                    const isFreeAgent = Boolean(player.isFreeAgent || (isPro && contractDuration <= 0));
                    const currentClub = !isPro
                      ? (player.club ? `${player.club} Youth Academy` : t('Youth Academy'))
                      : isFreeAgent
                      ? t('Free Agent (Unattached)')
                      : (player.club || t('Unassigned Club'));
                    
                    const leagueDisplay = !isPro
                      ? (player.youthLeagueName || `${player.city || 'Regional'} Youth League`)
                      : `${player.league || 'First Division'} • ${player.clubCountry || player.countryCode || 'Domestic'}`;

                    const baseAge = 10;
                    const currentYear = 2026 + Math.max(0, (player.age || 16) - baseAge);
                    const startSeason = `${currentYear}/${(currentYear + 1).toString().slice(-2)}`;
                    const endYear = currentYear + Math.max(1, contractDuration);
                    const endSeason = `${endYear - 1}/${endYear.toString().slice(-2)}`;
                    const seasonSpan = !isPro
                      ? t('Youth Registration')
                      : isFreeAgent
                      ? t('No Active Registration')
                      : `${startSeason}–${endSeason}`;

                    const contractStatusLabel = !isPro
                      ? t('Youth Registration (Amateur)')
                      : isFreeAgent
                      ? t('Contract Expired • Free Agent')
                      : contractDuration === 1
                      ? t('Expiring Contract (Final Year)')
                      : t('Professional Contract');

                    const yearsRemainingText = !isPro
                      ? t('No Professional Contract Duration')
                      : isFreeAgent
                      ? t('0 YEARS REMAINING (FREE AGENT)')
                      : contractDuration === 1
                      ? t('1 YEAR REMAINING (FINAL YEAR)')
                      : `${contractDuration} ${t('YEARS REMAINING')}`;

                    const salaryText = !isPro
                      ? t('No Professional Salary (€0/year)')
                      : isFreeAgent
                      ? t('€0/year (Free Agent)')
                      : `€${(accounting?.yearlySalary || 150000).toLocaleString()}/${t('year')} (€${Math.round((accounting?.yearlySalary || 150000) / 52).toLocaleString()}/${t('wk')})`;

                    const squadText = !isPro ? t('Youth Academy') : (player.squadDestination || 'First Team');
                    const roleText = !isPro ? t('Youth Scholar') : (player.squadRole || player.playingTimeExpectation || 'Starter');

                    const bonusesText = !isPro
                      ? t('Youth Academy Development Program')
                      : accounting?.signingBonus
                      ? `€${accounting.signingBonus.toLocaleString()} ${t('Signing Bonus')}`
                      : accounting?.contractBonusTerms || t('Performance & Goal Clauses Active');

                    const transferStatusText = !isPro
                      ? t('Youth Academy Scholar')
                      : isFreeAgent
                      ? t('Free Agent — Direct Signings (€0 Transfer Fee)')
                      : player.requestedTransfer || accounting?.transferStatus === 'transfer_listed'
                      ? t('Transfer Listed (Seeking Move)')
                      : contractDuration === 1
                      ? t('Expiring — Pre-Contract Eligible & Inquiries Open')
                      : (accounting?.transferStatus === 'approached' ? t('Approached by Clubs') : t('Not Listed'));

                    const releaseClauseText = isPro && accounting?.releaseClause && accounting.releaseClause > 0
                      ? `€${(accounting.releaseClause / 1000000).toFixed(1)}M (${accounting.releaseClause.toLocaleString()} EUR)`
                      : t('None');

                    return (
                      <div className="bg-gradient-to-br from-[#12131f] via-[#151628] to-[#10111a] border border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-3.5">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                        
                        {/* Title Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase block">
                                {t('Official Registry')}
                              </span>
                              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                {t('CURRENT CONTRACT')}
                                {contractDuration === 1 && isPro && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                                    {t('Final Year')}
                                  </span>
                                )}
                                {isFreeAgent && isPro && (
                                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-black uppercase">
                                    {t('Free Agent')}
                                  </span>
                                )}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-200">
                              {currentClub}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-800">
                              {seasonSpan}
                            </span>
                          </div>
                        </div>

                        {/* Highlight Banner: Years Remaining & Contract Status */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                          !isPro
                            ? 'bg-slate-900/60 border-slate-700/60 text-slate-200'
                            : isFreeAgent
                            ? 'bg-red-950/30 border-red-800/60 text-red-200'
                            : contractDuration === 1
                            ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                            : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <Clock className={`w-4 h-4 ${
                              !isPro ? 'text-slate-400' : isFreeAgent ? 'text-red-400' : contractDuration === 1 ? 'text-amber-400' : 'text-blue-400'
                            }`} />
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                {t('Duration Remaining')}
                              </span>
                              <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
                                {yearsRemainingText}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('Contract Status')}</span>
                            <span className="text-[11px] font-extrabold text-slate-200">
                              {contractStatusLabel}
                            </span>
                          </div>
                        </div>

                        {/* Detailed Grid: Club, League, Salary, Squad, Release Clause, Bonuses, Transfer Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                          {/* Club & League */}
                          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('Club & Competition')}</span>
                            <span className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {currentClub}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 block truncate">
                              {leagueDisplay}
                            </span>
                          </div>

                          {/* Squad & Role */}
                          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('Squad & Role')}</span>
                            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5 truncate">
                              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              {squadText}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 block truncate">
                              {roleText}
                            </span>
                          </div>

                          {/* Salary */}
                          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('Salary')}</span>
                            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 truncate">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              {salaryText}
                            </span>
                          </div>

                          {/* Release Clause */}
                          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('Release Clause')}</span>
                            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 truncate">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              {releaseClauseText}
                            </span>
                          </div>

                          {/* Bonuses */}
                          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('Bonuses / Program')}</span>
                            <span className="text-xs font-semibold text-slate-200 truncate block">
                              {bonusesText}
                            </span>
                          </div>

                          {/* Transfer Status */}
                          <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">{t('Transfer Status')}</span>
                            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5 truncate">
                              <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              {transferStatusText}
                            </span>
                          </div>
                        </div>

                        {/* REQUEST TRANSFER ACTION (Under Contract) */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-300">
                              {player.transferRequestUsedThisSeason
                                ? '🔒 1/Season Used • Recharges at Preseason'
                                : player.requestedTransfer
                                ? '⏳ Transfer Request Active: Move queued for next window'
                                : '⚡ 1 Request per Season • Penalizes Chemistry by -30%'}
                            </span>
                            {player.pendingTransferRequest && (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-bold text-[9px]">
                                Pending {player.pendingTransferRequest.targetWindow === 'winter' ? 'Winter' : 'Summer'} Window
                              </span>
                            )}
                          </div>
                          <button
                            onClick={handleRequestTransfer}
                            disabled={player.transferRequestUsedThisSeason || playerChem <= 0}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black shadow transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              player.transferRequestUsedThisSeason
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : playerChem <= 0
                                ? 'bg-rose-950/40 text-rose-500 border border-rose-900/40 cursor-not-allowed'
                                : 'bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white border border-rose-500/50 shadow-rose-900/30'
                            }`}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>
                              {player.transferRequestUsedThisSeason
                                ? t('REQUEST TRANSFER (1/SEASON - USED)') || 'REQUEST TRANSFER (1/SEASON - USED)'
                                : t('REQUEST TRANSFER (-30%)') || 'REQUEST TRANSFER (-30%)'}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* AGENT STATS (NEGOTIATION, NETWORK, MARKETING) */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                      <div className="bg-[#10111a] p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>{t('Negotiation')}</span>
                          <span className="text-blue-400 font-black">{effectiveNegotiation} / 100</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, effectiveNegotiation))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-tight">{t('Contract raises, signing bonuses & perks')}</span>
                      </div>

                      <div className="bg-[#10111a] p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>{t('Network')}</span>
                          <span className="text-amber-400 font-black">{effectiveNetwork} / 100</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, effectiveNetwork))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-tight">{t('Club discovery, trial invites & transfers')}</span>
                      </div>

                      <div className="bg-[#10111a] p-3 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>{t('Marketing')}</span>
                          <span className="text-emerald-400 font-black">{effectiveMarketing} / 100</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, effectiveMarketing))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-tight">{t('Sponsor contracts & commercial deals')}</span>
                      </div>
                    </div>
                  </div>

                  {/* IF NO AGENT: SHOW RED WARNING BANNER & PRE-SEASON SCOUTING RATE CARD */}
                  {!hasAgent && (
                    <div className="space-y-4">
                      {/* RED WARNING MESSAGE MANDATED BY USER */}
                      <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-2xl flex items-center gap-3 text-red-200">
                        <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                        <div>
                          <div className="text-sm font-black text-red-300">
                            {t("You don't have an agent, your opportunities are reduced.")}
                          </div>
                          <p className="text-xs text-red-300/80 mt-0.5 leading-relaxed">
                            {t('Without licensed representation, contract negotiations have minimal leverage, transfer inquiries from top European clubs are limited, and commercial sponsors will rarely submit offers.')}
                          </p>
                        </div>
                      </div>

                      {/* PRE-SEASON SCOUTING RATE CARD */}
                      <div className="bg-[#10111a] p-4 rounded-2xl border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                              {t('Pre-Season Agent Recruitment Chance')}
                            </span>
                          </div>
                          <span className="text-sm font-black text-amber-400 font-mono">
                            {offerRateInfo.formattedRate}
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-amber-500/30">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(2, offerRateInfo.chancePercent))}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {t('Top agencies scout unrepresented athletes every pre-season (scales with your Fame & OVR). If triggered, licensed agents will submit representation pitches.')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* IF HAS AGENT: SHOW SPECIAL TRAIT / PERKS BANNER & SHADY SCHEME TRACKER */}
                  {hasAgent && (
                    <>
                      {/* SPECIAL TRAIT / PERKS BANNER */}
                      {(manager.specialTrait || currentProfile.tagline) && (
                        <div className="p-3.5 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-slate-700/60 rounded-xl flex items-center justify-between gap-3 text-xs text-slate-200">
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                            <div>
                              <span className="font-extrabold text-amber-300">{t(currentProfile.tagline)}</span>
                              <span className="block text-[11px] text-slate-300 mt-0.5">
                                {t('Archetype Benefit')}: <strong>{t(currentProfile.developmentBonus)}</strong>
                              </span>
                              {manager.specialTrait && (
                                <span className="block text-[11px] text-emerald-400 mt-0.5">
                                  {t('Special Perk')}: <strong>{t(manager.specialTrait)}</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* FIRE AGENT BUTTON */}
                          <div>
                            {isParentAgent ? (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 whitespace-nowrap">
                                🛡️ {t('Family (Cannot Fire)')}
                              </span>
                            ) : confirmFireAgent ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={handleFireAgent}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] rounded-lg transition uppercase tracking-wider"
                                >
                                  {t('Confirm Fire')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmFireAgent(false)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-lg transition"
                                >
                                  {t('Cancel')}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmFireAgent(true)}
                                className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 font-bold text-[10px] rounded-lg transition uppercase tracking-wider"
                              >
                                {t('Fire Agent')}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SHADY AGENT SCHEME TRACKER */}
                      {agentTypeKey === 'shady' && (
                        <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl space-y-1.5 text-xs text-red-200">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-red-300 uppercase tracking-wide flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                              {t('Underground Syndicate Representation')}
                            </span>
                            <span className="text-[10px] font-mono bg-red-900/60 px-2 py-0.5 rounded text-red-100 border border-red-700">
                              +25% {t('Extra Earnings')} • +20% {t('Transfer Value')}
                            </span>
                          </div>
                          <p className="text-[11px] text-red-300/80 leading-relaxed">
                            {t('Your agent operates outside regulatory scrutiny. While contract compensation and transfer opportunities are substantially higher, syndicate schemes may occasionally demand questionable match decisions.')}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* DIRECTIVE OPTIONS SECTION (ALWAYS DISPLAYED FOR BOTH AGENT & SELF-MANAGED) */}
                  <div className="space-y-3 pt-1">
                    <div className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                      {isPro ? t('Career Directives & Agent Requests') : t('Youth Directives & Agent Requests')}
                    </div>

                    {isPro ? (
                      /* PRO CAREER: 3 OPTIONS */
                      <div className="space-y-2.5">
                        {/* 1. NEW CONTRACT */}
                        <div className="p-3.5 bg-[#10111a] hover:bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-sm font-black text-white">1. {t('"I WANT A NEW CONTRACT"')}</span>
                              {(accounting.contractYears || 3) <= 1 && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase">
                                  {t('High Leverage')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {t('Task your agent to negotiate a contract renewal, wage increase, and multi-year extension.')}
                            </p>
                            <div className="text-[11px] text-slate-300 font-semibold">
                              {t('Contract Status')}: <span className="text-amber-400 font-bold">{accounting.contractYears || 3} {t('Year(s) Left')}</span> • {t('Current')}: <span className="text-emerald-400 font-bold">€{Math.round((accounting.yearlySalary || 150000) / 52).toLocaleString()}/{t('wk')}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setManagerActiveAction('pro_contract_renewal')}
                            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-emerald-950/50 shrink-0"
                          >
                            {t('I WANT A NEW CONTRACT')} <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* 2. NEW TEAM */}
                        <div className="p-3.5 bg-[#10111a] hover:bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                              <span className="text-sm font-black text-white">2. {t('"I WANT A NEW CLUB"')}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {t('Your agent leverages their club network to solicit formal transfer offers and negotiate top terms.')}
                            </p>
                            <div className="text-[11px] text-slate-300 font-semibold">
                              {t('Current Club')}: <span className="text-white font-bold">{player.club || t('Pro Club')}</span> • {t('Valuation')}: <span className="text-blue-400 font-bold">{player.marketValue ? `€${(player.marketValue / 1000000).toFixed(1)}M` : '€1.5M'}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setManagerActiveAction('pro_request_transfer')}
                            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-blue-950/50 shrink-0"
                          >
                            {t('I WANT A NEW CLUB')} <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* 3. MORE PLAYING TIME */}
                        <div className="p-3.5 bg-[#10111a] hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-sm font-black text-white">3. {t('"I WANT MORE MINUTES"')}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {t('Intervene with coaching staff to demand First Team promotion, starting XI role, or arrange a loan.')}
                            </p>
                            <div className="text-[11px] text-slate-300 font-semibold">
                              {t('Squad Destination')}: <span className="text-amber-400 font-bold">{player.squadDestination || t('First Team')}</span> • {t('Role')}: <span className="text-white font-bold">{player.squadRole || t('Squad Member')}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setManagerActiveAction('pro_playing_time')}
                            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-amber-950/50 shrink-0"
                          >
                            {t('I WANT MORE MINUTES')} <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* 4. TACTICAL POSITION MEETING */}
                        {onTriggerManagerPositionProposal && (
                          <div className="p-3.5 bg-[#10111a] hover:bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Compass className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="text-sm font-black text-white">4. {t('TACTICAL_MEETING_ROLE') || '4. "TACTICAL SQUAD MEETING"'}</span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase">
                                  {t('Position Shift') || 'Position Shift'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                {t('DISCUSS_POSITION_PROPOSAL_DESC') || 'Discuss tactical alignment with your manager. If there is same-position competition and the squad needs strengthening elsewhere, your manager can propose adding a new position.'}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={onTriggerManagerPositionProposal}
                              className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-purple-950/50 shrink-0"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>{t('DISCUSS POSITION') || 'DISCUSS POSITION'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* YOUTH ACADEMY: 2 OPTIONS */
                      <div className="space-y-2.5">
                        {/* 1. GET ME A PRO TEAM */}
                        <div className="p-3.5 bg-[#10111a] hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                              <span className="text-sm font-black text-white">1. {t('"I WANT A PRO CONTRACT"')}</span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                                {t('Pro Gateway')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {t('Instruct your agent to market your youth tape to pro clubs and fast-track your first professional contract.')}
                            </p>
                            <div className="text-[11px] text-slate-300 font-semibold">
                              {t('Youth Profile')}: <span className="text-amber-400 font-bold">{player.ovr || 50} {t('OVR')}</span> • {t('Potential')}: <span className="text-purple-400 font-bold">{player.potentialOvr || 78} {t('POT')}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setManagerActiveAction('youth_get_pro_team')}
                            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-amber-950/50 shrink-0"
                          >
                            {t('I WANT A PRO CONTRACT')} <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* 2. GET ME A NEW YOUTH TEAM */}
                        <div className="p-3.5 bg-[#10111a] hover:bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-purple-400 shrink-0" />
                              <span className="text-sm font-black text-white">2. {t('"I WANT A NEW YOUTH ACADEMY"')}</span>
                              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase">
                                {t('Top 2 Academies')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {t('Move to a championship-caliber youth powerhouse in the Top 2 of a domestic or international youth league.')}
                            </p>
                            <div className="text-[11px] text-slate-300 font-semibold">
                              {t('Current Academy')}: <span className="text-white font-bold">{player.youthLeagueTeam || player.club || t('Youth Team')}</span> ({player.city || t('Local')})
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setManagerActiveAction('youth_get_new_youth_team')}
                            className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-purple-950/50 shrink-0"
                          >
                            {t('I WANT A NEW ACADEMY')} <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* IF NO AGENT: AGENT ARCHETYPES DIRECTORY */}
                  {!hasAgent && (
                    <div className="space-y-2.5 pt-2">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-400" />
                        {t('Agent Archetypes in World Football')}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {Object.values(AGENT_TYPE_PROFILES).map((prof) => (
                          <div
                            key={prof.type}
                            className="bg-[#10111a] p-3 rounded-xl border border-slate-800 space-y-1.5 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${prof.badgeColor} uppercase`}>
                                {t(prof.title)}
                              </span>
                              {prof.isParentCardExclusive && (
                                <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  {t('Parent Card Only')}
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-bold text-white">
                              {t(prof.tagline)}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {t(prof.description)}
                            </p>
                            <div className="text-[10px] text-emerald-400 font-semibold pt-1 border-t border-slate-800/80">
                              {t('Perk')}: {t(prof.developmentBonus)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 6. SETTINGS OVERLAY PANEL */}
            {activeOverlayPanel === 'settings' && (
              <div className="space-y-4">
                {/* TEST MODE SECTION */}
                <div className="bg-[#161722] p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        {t('SETTINGS_TEST_MODE')}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t('SETTINGS_TEST_MODE_DESC')}
                      </p>
                    </div>
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                      <button
                        type="button"
                        onClick={() => setTestMode(false)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                          !isTestMode
                            ? 'bg-slate-700 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t('OPTION_OFF')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTestMode(true)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                          isTestMode
                            ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t('OPTION_ON')}
                      </button>
                    </div>
                  </div>

                  {/* MAGIC TOOL TOGGLE (UNDER TEST MODE) */}
                  <div
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isTestMode
                        ? isMagicTool
                          ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-900 border-slate-800'
                        : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isMagicTool
                            ? 'bg-amber-500 text-slate-950 border-amber-300 shadow'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Wand2 className={`w-4 h-4 ${isMagicTool ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            {t('Magic Tool (Translation & UI Inspector)')}
                          </h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-black uppercase border ${
                              isMagicTool
                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {isMagicTool ? 'ACTIVE' : 'DISABLED BY DEFAULT'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {!isTestMode
                            ? t('Turn on Developer Test Mode above to unlock the Magic Tool')
                            : isMagicTool
                            ? t('Magic Tool is ACTIVE: Floating inspector is visible on Main Menu & in-game screens')
                            : t('Magic Tool is DISABLED: Toggle ON to show the floating inspector button on-screen')}
                        </p>
                      </div>
                    </div>
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                      <button
                        type="button"
                        disabled={!isTestMode}
                        onClick={() => setMagicTool(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                          !isMagicTool
                            ? 'bg-slate-700 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t('OPTION_OFF')}
                      </button>
                      <button
                        type="button"
                        disabled={!isTestMode}
                        onClick={() => setMagicTool(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${
                          isMagicTool
                            ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t('OPTION_ON')}
                      </button>
                    </div>
                  </div>

                  {/* DEVELOPER TEST DASHBOARD (WHEN TEST MODE IS ACTIVE) */}
                  {isTestMode && (
                    <div className="pt-3 border-t border-slate-800">
                      <DeveloperTestDashboard
                        player={player}
                        onUpdatePlayer={(upd) => {
                          if (onUpdatePlayer) onUpdatePlayer(upd);
                        }}
                        accounting={accounting}
                        setAccounting={(upd) => {
                          if (setAccounting) setAccounting(upd);
                        }}
                        manager={manager}
                        setManager={(upd) => {
                          if (setManager) setManager(upd);
                        }}
                        onTriggerKeyMatch={(stageTitle, opponentName, opponentOvr) => {
                          setTournamentKeyMatchConfig({
                            isOpen: true,
                            stageTitle,
                            opponentName,
                            opponentOvr,
                          });
                        }}
                        onTriggerPerkUnlock={(perk) => {
                          if (onTriggerPerkUnlock) onTriggerPerkUnlock(perk);
                        }}
                        onTriggerInjuryModal={(injuryName, weeks) => {
                          setTestInjuryModalConfig({
                            isOpen: true,
                            name: injuryName,
                            weeks,
                          });
                        }}
                        onOpenChampionCelebration={(data) => {
                          if (onOpenChampionCelebration) onOpenChampionCelebration(data);
                        }}
                        onTriggerRetirement={() => {
                          if (onTriggerRetirement) onTriggerRetirement();
                        }}
                        onOpenCareerSummary={() => {
                          if (onOpenCareerSummary) onOpenCareerSummary();
                        }}
                        onOpenSaudiOffer={onOpenSaudiOffer}
                        onOpenTransferOffer={onOpenTransferOffer}
                        onOpenCallUp={onOpenCallUp}
                        onOpenCardEditor={onOpenCardEditor}
                        showToast={showToast}
                      />
                    </div>
                  )}
                </div>

                {/* LANGUAGE SELECTION */}
                <div className="bg-[#161722] p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    {t('NAV_SELECT_LANGUAGE')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {languagesList.map((langInfo) => (
                      <button
                        key={langInfo.code}
                        type="button"
                        onClick={() => setLanguage(langInfo.code)}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                          currentLanguage === langInfo.code
                            ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{langInfo.flag}</span>
                          <div>
                            <span className="text-xs font-black block">{langInfo.nativeName}</span>
                            <span className="text-[10px] text-slate-400 block">{langInfo.name}</span>
                          </div>
                        </div>
                        {currentLanguage === langInfo.code && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TYPOGRAPHY & FONT SIZE */}
                <div className="bg-[#161722] p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-300" />
                    {t('SETTINGS_APP_PREFERENCES')}
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-300 block">{t('SETTINGS_FONT_SIZE')}</label>
                    <div className="flex gap-2">
                      {(['sm', 'md', 'lg'] as FontSizeOption[]).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setFontSize(sz)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-all cursor-pointer ${
                            fontSize === sz
                              ? 'bg-blue-600 text-white border-blue-400 shadow'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {sz === 'sm' ? t('FONT_SIZE_SM') : sz === 'md' ? t('FONT_SIZE_MD') : t('FONT_SIZE_LG')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI TRANSFERS SIMULATION SETTING */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-slate-300 block">
                        AI Transfers Frequency
                      </label>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                        Database Stability Lock
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'no_transfers', label: 'No Transfers (Default)' },
                        { id: 'less', label: 'Less' },
                        { id: 'normal', label: 'Normal' },
                        { id: 'more', label: 'More' },
                      ].map((opt) => {
                        const isSelected = (player.transferFrequency || 'no_transfers') === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              const updated = {
                                ...player,
                                transferFrequency: opt.id as TransferFrequencySetting,
                              };
                              if (onUpdatePlayer) {
                                onUpdatePlayer(updated);
                              }
                              showToast(`⚙️ AI Transfers set to: ${opt.label}`);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {(player.transferFrequency || 'no_transfers') === 'no_transfers'
                        ? 'No AI-to-AI background transfers occur. All clubs keep their authentic database players permanently without cloning or random relocations.'
                        : 'Simulates transfer movements according to the selected frequency setting.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STATISTICS OVERLAY PANEL */}
            {activeOverlayPanel === 'statistics' && (
              <CareerStatisticsPanel
                player={player}
                accounting={accounting}
                onClose={() => {
                  setActiveOverlayPanel(null);
                  if (onReturnToYouthAcademy) {
                    onReturnToYouthAcademy();
                  }
                }}
              />
            )}

            {/* TEST MODE DEVELOPER LAB OVERLAY PANEL */}
            {activeOverlayPanel === 'test_mode' && (
              <div className="space-y-4">
                <DeveloperTestDashboard
                  player={player}
                  onUpdatePlayer={(upd) => {
                    if (onUpdatePlayer) onUpdatePlayer(upd);
                  }}
                  accounting={accounting}
                  setAccounting={setAccounting}
                  manager={manager}
                  setManager={setManager}
                  onTriggerKeyMatch={(stageTitle, opponentName, opponentOvr) => {
                    setTournamentKeyMatchConfig({
                      isOpen: true,
                      stageTitle,
                      opponentName,
                      opponentOvr,
                    });
                  }}
                  onTriggerPerkUnlock={(perk) => {
                    if (onTriggerPerkUnlock) onTriggerPerkUnlock(perk);
                  }}
                  onTriggerInjuryModal={(injuryName, weeks) => {
                    setTestInjuryModalConfig({
                      isOpen: true,
                      name: injuryName,
                      weeks,
                    });
                  }}
                  onOpenChampionCelebration={onOpenChampionCelebration}
                  onTriggerRetirement={onTriggerRetirement}
                  onOpenCareerSummary={onOpenCareerSummary}
                  onOpenSaudiOffer={onOpenSaudiOffer}
                  onOpenTransferOffer={onOpenTransferOffer}
                  onOpenSpecialChoiceModal={onOpenSpecialChoiceModal}
                  onOpenSpecialSigningChain={onOpenSpecialSigningChain}
                  onOpenSpecialRetryModal={onOpenSpecialRetryModal}
                  onOpenCallUp={onOpenCallUp}
                  onOpenCardEditor={onOpenCardEditor}
                  showToast={showToast}
                  onClose={() => {
                    setActiveOverlayPanel(null);
                    if (onReturnToYouthAcademy) {
                      onReturnToYouthAcademy();
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CUSTOMIZATION MODAL --- */}
      <CustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        player={player}
        onUpdatePlayer={(updated) => {
          if (onUpdatePlayer) {
            onUpdatePlayer(updated);
          }
        }}
        accounting={accounting}
        setAccounting={setAccounting}
        storeItems={storeItems}
        setStoreItems={setStoreItems}
        showToast={showToast}
      />

      {/* BUY BUSINESS MODAL */}
      <BuyBusinessModal
        isOpen={isBuyBusinessModalOpen}
        onClose={() => setIsBuyBusinessModalOpen(false)}
        availableCash={availableCash}
        ownedBusinesses={accounting?.businesses || []}
        onPurchaseBusiness={handlePurchaseBusiness}
        showToast={showToast}
      />

      {/* PARENT ADVICE MODAL */}
      <ParentAdviceModal
        isOpen={showAdviceModal}
        onClose={() => setShowAdviceModal(false)}
        isIconicUpgraded={Boolean(player.equippedParentCard?.tier === 'iconic')}
        onApplyAdvice={handleApplyParentAdvice}
      />

      {/* CAREER ENDING INJURY DECISION MODAL */}
      <CareerEndingInjuryModal
        isOpen={Boolean(player.isCareerEndingRisk)}
        player={player}
        onUpdatePlayer={(updated) => {
          if (onUpdatePlayer) {
            onUpdatePlayer(updated);
          }
        }}
        showToast={showToast}
      />

      {/* CAREER STAGE CARD MODAL (SPONSORS & COMMERCIAL DEALS) */}
      <CareerStageCardModal
        isOpen={isCareerStageCardModalOpen}
        player={player}
        accounting={accounting}
        manager={manager}
        onSelectCard={(updatedPlayer, updatedAcc, updatedM, msg) => {
          if (onUpdatePlayer) onUpdatePlayer(updatedPlayer);
          if (updatedAcc && setAccounting) setAccounting(updatedAcc);
          if (updatedM && setManager) setManager(updatedM);
          if (msg) showToast(msg);
        }}
        onClose={() => setIsCareerStageCardModalOpen(false)}
      />

      {/* INTERNATIONAL CALL-UP MODAL */}
      <InternationalCallUpModal
        isOpen={Boolean(activeCallUp)}
        callUp={activeCallUp}
        player={player}
        onAccept={handleAcceptCallUp}
        onDecline={handleDeclineCallUp}
        onClose={() => setActiveCallUp(null)}
      />

      {/* NATIONAL TEAM DRAW CEREMONY MODAL */}
      {showDrawModal && pendingDrawState && (
        <NationalTeamDrawModal
          isOpen={showDrawModal}
          drawState={pendingDrawState}
          onComplete={handleDrawModalComplete}
          onDrawCompleted={handleDrawModalComplete}
          onClose={() => {
            setShowDrawModal(false);
            if (pendingCallUpData) {
              handleDrawModalComplete(pendingDrawState);
            }
          }}
        />
      )}

      {/* UNIFIED INTERNATIONAL FOOTBALL SYSTEM LIVE HUB MODAL */}
      <InternationalLiveHubModal
        isOpen={showInternationalLiveHub}
        hubState={internationalHubState}
        player={player}
        onClose={() => setShowInternationalLiveHub(false)}
        onPlayKeyMatch={handlePlayInternationalKeyMatch}
        onSimulateMatch={handleSimulateInternationalMatch}
        onAdvanceToNextMatch={() => {}}
        onConcludeInternationalDuty={handleConcludeInternationalDuty}
      />

      {/* INTERNATIONAL TOURNAMENT & QUALIFIERS SUMMARY MODAL (LEGACY FALLBACK) */}
      <InternationalTournamentModal
        isOpen={showTournamentModal}
        qualifierSummary={activeQualifierSummary}
        worldCupSummary={activeWorldCupSummary}
        onClose={handleCloseTournamentModal}
        onTriggerKeyMatch={(stageTitle, opponentName, opponentOvr) => {
          setTournamentKeyMatchConfig({
            isOpen: true,
            stageTitle,
            opponentName,
            opponentOvr,
          });
        }}
      />

      {/* INTERNATIONAL TOURNAMENT KEY MATCH MODAL */}
      {tournamentKeyMatchConfig && (
        <KeyMatchModal
          isOpen={tournamentKeyMatchConfig.isOpen}
          player={player}
          stageTitle={tournamentKeyMatchConfig.stageTitle}
          opponentName={tournamentKeyMatchConfig.opponentName}
          opponentOvr={tournamentKeyMatchConfig.opponentOvr}
          onMatchComplete={handleTournamentKeyMatchCompleted}
        />
      )}

      {/* MANAGER & AGENT DIRECTIVE ACTIONS MODAL */}
      <ManagerActionsModal
        isOpen={managerActiveAction !== 'none'}
        action={managerActiveAction}
        onClose={() => setManagerActiveAction('none')}
        player={player}
        accounting={accounting}
        manager={manager}
        onUpdatePlayer={(upd) => {
          if (onUpdatePlayer) onUpdatePlayer(upd);
        }}
        onUpdateAccounting={(upd) => {
          if (setAccounting) setAccounting(upd);
        }}
        onUpdateManager={(upd) => {
          if (setManager) setManager(upd);
        }}
        onTriggerPerkUnlock={(perk) => {
          if (onTriggerPerkUnlock) onTriggerPerkUnlock(perk);
        }}
        showToast={showToast}
      />

      {/* TEST INJURY NOTIFICATION MODAL */}
      {testInjuryModalConfig && (
        <InjuryNotificationModal
          isOpen={testInjuryModalConfig.isOpen}
          player={player}
          injuryName={testInjuryModalConfig.name}
          weeksRemaining={testInjuryModalConfig.weeks}
          totalWeeks={testInjuryModalConfig.weeks}
          onAcknowledge={() => setTestInjuryModalConfig(null)}
        />
      )}

      {/* OVERFLOW CHEMISTRY EXPLAINER MODAL */}
      <OverflowChemistryExplainerModal
        isOpen={showOverflowExplainerModal}
        onClose={handleCloseOverflowExplainer}
        currentChemistry={playerChem}
      />

      {/* RISKY GENETIC ACTIVATION EXPERIMENTAL MODAL */}
      <GeneticActivationModal
        isOpen={isGeneticActivationModalOpen}
        onClose={() => setIsGeneticActivationModalOpen(false)}
        player={player}
        accounting={accounting}
        onApplyOutcome={handleApplyGeneticOutcome}
        showToast={showToast}
      />

      {/* YOUTH LEAGUE TRANSFER REQUEST OPPORTUNITIES MODAL */}
      {showYouthTransferModal && youthTransferOffers.length > 0 && (
        <YouthTransferOfferModal
          isOpen={showYouthTransferModal}
          player={player}
          offers={youthTransferOffers}
          onAcceptOffer={handleAcceptYouthOffer}
          onClose={() => setShowYouthTransferModal(false)}
        />
      )}
    </div>
    </React.Suspense>
  );
};
