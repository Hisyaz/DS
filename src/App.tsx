import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { PlayerCardData, FontSizeOption, StoreUpgradeItem, AccessoryType, AccountingState, ManagerState } from './types';
import { PRESET_PLAYERS, getCardTier, NATIONALITIES, SKIN_COLORS, PALETTE_COLORS, HAIR_ROOT_COLORS, HAIR_DYE_COLORS, STARTING_CITIES, StartingCityOption } from './constants';
import { INITIAL_STORE_ITEMS } from './data/storeItems';
import { INITIAL_CAREER_BUSINESSES, BUSINESS_TEMPLATES, calculateSeasonFinancials } from './data/businesses';
const CardControls = React.lazy(() => import('./components/CardControls').then(m => ({ default: m.CardControls })));
import { PlayerCard } from './components/PlayerCard';
import { WonderkidInitScreen } from './components/WonderkidInitScreen';
import { setupGameNavigation } from './utils/gameNavigation';
import { PresetManager } from './components/PresetManager';
import { PersistentUiPanel } from './components/PersistentUiPanel';
import { ProfileTopRightBadge } from './components/ProfileTopRightBadge';
import { MainMenu } from './components/MainMenu';
import { awardTrophiesToPlayer } from './utils/trophySystem';
import { KeyMatchPlayMode } from './utils/matchImportanceSystem';
import { PLAYER_TYPES, PlayerTypeDefinition, calculateSixCategoryStats } from './data/playerTypes';
import type { ChampionTitleData } from './components/ChampionsCelebrationModal';

const CardDeckEditor = React.lazy(() => import('./components/CardDeckEditor').then(m => ({ default: m.CardDeckEditor })));
const TeamEditor = React.lazy(() => import('./components/TeamEditor').then(m => ({ default: m.TeamEditor })));
const NationalTeamEditor = React.lazy(() => import('./components/NationalTeamEditor').then(m => ({ default: m.NationalTeamEditor })));
const CompetitionsEditor = React.lazy(() => import('./components/CompetitionsEditor').then(m => ({ default: m.CompetitionsEditor })));
const TrophyCabinet = React.lazy(() => import('./components/TrophyCabinet').then(m => ({ default: m.TrophyCabinet })));
const CardsCollectionPanel = React.lazy(() => import('./components/CardsCollectionPanel').then(m => ({ default: m.CardsCollectionPanel })));
const StartingCityModal = React.lazy(() => import('./components/StartingCityModal').then(m => ({ default: m.StartingCityModal })));
const CareerModeSelectorModal = React.lazy(() => import('./components/CareerModeSelectorModal').then(m => ({ default: m.CareerModeSelectorModal })));
const ParentCardModal = React.lazy(() => import('./components/ParentCardModal').then(m => ({ default: m.ParentCardModal })));
const ParentCardIntroModal = React.lazy(() => import('./components/ParentCardIntroModal').then(m => ({ default: m.ParentCardIntroModal })));
const PlayerTypeSelectionModal = React.lazy(() => import('./components/PlayerTypeSelectionModal').then(m => ({ default: m.PlayerTypeSelectionModal })));
const PositionSelectionModal = React.lazy(() => import('./components/PositionSelectionModal').then(m => ({ default: m.PositionSelectionModal })));
const FinalCareerConfirmationModal = React.lazy(() => import('./components/FinalCareerConfirmationModal').then(m => ({ default: m.FinalCareerConfirmationModal })));
const StreetCardModal = React.lazy(() => import('./components/StreetCardModal').then(m => ({ default: m.StreetCardModal })));
const StreetDevelopmentEventModal = React.lazy(() => import('./components/StreetDevelopmentEventModal').then(m => ({ default: m.StreetDevelopmentEventModal })));
const FirstContractModal = React.lazy(() => import('./components/FirstContractModal').then(m => ({ default: m.FirstContractModal })));
const FirstContractIntroModal = React.lazy(() => import('./components/FirstContractIntroModal').then(m => ({ default: m.FirstContractIntroModal })));
const YouthGraduationModal = React.lazy(() => import('./components/YouthGraduationModal').then(m => ({ default: m.YouthGraduationModal })));
const TransferInterestModal = React.lazy(() => import('./components/TransferInterestModal').then(m => ({ default: m.TransferInterestModal })));
const ArabianMegaOfferModal = React.lazy(() => import('./components/ArabianMegaOfferModal').then(m => ({ default: m.ArabianMegaOfferModal })));
const ManagerPlaystyleModal = React.lazy(() => import('./components/ManagerPlaystyleModal').then(m => ({ default: m.ManagerPlaystyleModal })));
const EarlyCareerDecisionModal = React.lazy(() => import('./components/EarlyCareerDecisionModal').then(m => ({ default: m.EarlyCareerDecisionModal })));
const YouthClubCinematicModal = React.lazy(() => import('./components/YouthClubCinematicModal').then(m => ({ default: m.YouthClubCinematicModal })));
const YouthManagerMeetingModal = React.lazy(() => import('./components/YouthManagerMeetingModal').then(m => ({ default: m.YouthManagerMeetingModal })));
const YouthSeasonDashboardModal = React.lazy(() => import('./components/YouthSeasonDashboardModal').then(m => ({ default: m.YouthSeasonDashboardModal })));
const WorldResultsModal = React.lazy(() => import('./components/WorldResultsModal').then(m => ({ default: m.WorldResultsModal })));
const ContinentalDashboardModal = React.lazy(() => import('./components/ContinentalDashboardModal').then(m => ({ default: m.ContinentalDashboardModal })));
const ChampionsCelebrationModal = React.lazy(() => import('./components/ChampionsCelebrationModal').then(m => ({ default: m.ChampionsCelebrationModal })));
const LeaveUniqueCareerModal = React.lazy(() => import('./components/LeaveUniqueCareerModal').then(m => ({ default: m.LeaveUniqueCareerModal })));
const PerkReplacementModal = React.lazy(() => import('./components/PerkReplacementModal').then(m => ({ default: m.PerkReplacementModal })));
const PerkUnlockStoryModal = React.lazy(() => import('./components/PerkUnlockStoryModal').then(m => ({ default: m.PerkUnlockStoryModal })));
const FarewellMatchModal = React.lazy(() => import('./components/FarewellMatchModal').then(m => ({ default: m.FarewellMatchModal })));
const CareerSummaryModal = React.lazy(() => import('./components/CareerSummaryModal').then(m => ({ default: m.CareerSummaryModal })));
const FreeAgentHubModal = React.lazy(() => import('./components/FreeAgentHubModal').then(m => ({ default: m.FreeAgentHubModal })));
const FigoBetrayalNewsModal = React.lazy(() => import('./components/FigoBetrayalNewsModal').then(m => ({ default: m.FigoBetrayalNewsModal })));
const JudasBetrayalEventModal = React.lazy(() => import('./components/JudasBetrayalEventModal').then(m => ({ default: m.JudasBetrayalEventModal })));
const UnifiedClubOfferModal = React.lazy(() => import('./components/UnifiedClubOfferModal').then(m => ({ default: m.UnifiedClubOfferModal })));
const SpecialClubChoiceModal = React.lazy(() => import('./components/SpecialClubChoiceModal').then(m => ({ default: m.SpecialClubChoiceModal })));
const SpecialClubSigningChainModal = React.lazy(() => import('./components/SpecialClubSigningChainModal').then(m => ({ default: m.SpecialClubSigningChainModal })));
const SpecialClubRetryModal = React.lazy(() => import('./components/SpecialClubRetryModal').then(m => ({ default: m.SpecialClubRetryModal })));
const BadReputationTutorialModal = React.lazy(() => import('./components/BadReputationTutorialModal').then(m => ({ default: m.BadReputationTutorialModal })));
const BadReputationTierModal = React.lazy(() => import('./components/BadReputationTierModal').then(m => ({ default: m.BadReputationTierModal })));
const GraphicSettingsModal = React.lazy(() => import('./components/GraphicSettingsModal').then(m => ({ default: m.GraphicSettingsModal })));
import {
  SpecialClubId,
  SpecialClubEvaluation,
  SpecialClubChoiceEventData,
} from './types/specialClubInterest';
import {
  scanActiveSpecialClubInterests,
  categorizeSpecialChoiceDilemma,
  evaluateSpecialClubInterest,
  recordSpecialClubExplicitRejection,
  recordSpecialClubFailedTransfer,
  applyHostagePenalty,
  processSpecialClubDecayRolls,
  convertSpecialEvaluationToUnifiedOffer,
} from './utils/specialClubInterestSystem';
import {
  UnifiedClubOffer,
  generateCuratedClubOffers,
  generateFirstContractUnifiedOffers,
  generateProactiveSeasonOffers,
} from './utils/clubOfferSystem';
import type { LifecycleMilestoneData } from './components/CareerLifecycleMilestoneModal';

const InjuryNotificationModal = React.lazy(() => import('./components/InjuryNotificationModal').then(m => ({ default: m.InjuryNotificationModal })));
const LegendObjectiveTrackerModal = React.lazy(() => import('./components/LegendObjectiveTrackerModal').then(m => ({ default: m.LegendObjectiveTrackerModal })));
const FitToPlayModal = React.lazy(() => import('./components/FitToPlayModal').then(m => ({ default: m.FitToPlayModal })));
const PotentialReachedModal = React.lazy(() => import('./components/PotentialReachedModal').then(m => ({ default: m.PotentialReachedModal })));
const NicknameEventModal = React.lazy(() => import('./components/NicknameEventModal').then(m => ({ default: m.NicknameEventModal })));
const CareerLifecycleMilestoneModal = React.lazy(() => import('./components/CareerLifecycleMilestoneModal').then(m => ({ default: m.CareerLifecycleMilestoneModal })));
const ManagerPositionChangeModal = React.lazy(() => import('./components/ManagerPositionChangeModal').then(m => ({ default: m.ManagerPositionChangeModal })));
const NaturalPositionSwitchModal = React.lazy(() => import('./components/NaturalPositionSwitchModal').then(m => ({ default: m.NaturalPositionSwitchModal })));
import {
  evaluateManagerPositionChangeForPlayer,
  checkNaturalPositionSwitchEligibility,
  ManagerPositionProposal,
} from './utils/positionMasterySystem';
import { PlayerPositionSlot } from './types';
import {
  shouldCheckExProNicknameEvent,
  FEAT_NICKNAMES,
  FeatNicknameConfig,
  processUclSeasonFeat,
  processWorldCupFeat,
  getStartingTypeNickname,
} from './utils/nicknameSystem';
import { InternationalCallUp } from './types/nationalTeam';
import { FarewellMatchResult } from './types/careerConclusion';
import { compileFullCareerHistory } from './utils/careerConclusionSystem';
import { BadRepTierUpEvent } from './utils/badReputationSystem';
import { isTutorialEnabled, hasSeenTutorial, markTutorialSeen } from './utils/tutorialSystem';
import { earnPerk, replacePerk, discardPerk, getPerkById, hasPerk, isPerkRetired, CareerPerk, ensurePlayerPerksSync, checkRivalBetrayalTransfer, RivalBetrayalCheckResult } from './utils/perksSystem';
import { findClubInLeagueDatabase } from './utils/kitResolutionSystem';
import {
  saveCareerToContinueSlot,
  saveCareerToAutosaveSlot,
  getLatestCareerSave,
  hasAnyCareerSave,
  getCareerSaveSummary,
  getActiveSaveSlotId,
  setActiveSaveSlotId,
  getSaveSlot,
  saveToSlot,
  deleteSaveSlot,
  saveActiveCareer,
  autoSaveActiveCareer,
  TOTAL_SAVE_SLOTS,
} from './utils/careerSaveSystem';
import { safeDownloadBlob } from './utils/storageCleaner';
import type { SaveSlotModalMode } from './components/SaveSlotSelectionModal';
const SaveSlotSelectionModal = React.lazy(() => import('./components/SaveSlotSelectionModal').then(m => ({ default: m.SaveSlotSelectionModal })));
const CompactHeaderMenuModal = React.lazy(() => import('./components/CompactHeaderMenuModal').then(m => ({ default: m.CompactHeaderMenuModal })));
import { applyParentCardInheritedHeight, calculateAnnualPhysicalGrowth } from './utils/playerGrowthSystem';
import { drawFourParentCards, buildPlayerFullName } from './utils/parentCardSystem';
import { formatPersonName, getOriginLastNameForCity } from './utils/originLastNameSystem';
import { drawFourStreetCards, drawThreeStreetCards, applyStreetCardToPlayer } from './utils/streetCardSystem';
import { sanitizeAndRepairPlayerIdentity, getValidSubPositionsForCategory, validateAndRepairPlaystyle, ensureProgressionIntegrityOnProTransition, verifyProgressionIntegrity } from './utils/playerIdentitySystem';
import { rebuildPlayerCompetitiveContextOnTransfer } from './utils/clubContextRebuilder';
import { calculateTryoutSuccessRate, getRandomBiggerYouthClub, getRandomLocalYouthClub, generateFirstContractOffers, generateTryoutContractOffer, runProfessionalRecruitmentScan, isProfessionalPlayer } from './utils/earlyCareerSystem';
import { calculatePlayerMarketValue, scanCareerTransferMarket, ClubTransferOffer, isSaudiClubOffer } from './utils/transferMarketSystem';
import { EarlyCareerChoiceType } from './types/earlyCareer';
import { ParentCardInstance } from './types/parentCards';
import { StreetCardInstance, ProContractOffer } from './types/streetCards';
import { CareerCollectedCard } from './types';
import { CareerSeasonRecord, FullCareerHistory } from './types/careerConclusion';
import { SuggestedActions, SuggestedActionCallbacks } from './components/SuggestedActions';
import { getFitnessPercentage, useRecoveryPoint } from './utils/staminaInjurySystem';
import { canUseTrainButton, applyTrainingProgressIncrement, rollStreetFootballDevelopment, calculateAnnualDevelopmentPoints, applyAgePhysicalRegression } from './utils/developmentSystem';
import { applyPreseasonUpgrades, generatePreSeasonStoreReplenishment } from './data/storeItems';
import { applyDefiancePenalty } from './utils/chemistrySystem';
import { applyBiggerYouthClubInitialState, cleanseBiggerYouthClubPenalties } from './utils/youthAdaptationSystem';
import { getSubPositionInfo, calculateWeightedOvr, getOrCreateOutfieldDetailed, getOrCreateGkDetailed, syncCategoryStatsFromDetailed } from './utils/statCalculations';
import { LeagueDatabase } from './types/leagueEditor';
import { getLeagueDatabase } from './utils/leagueDatabaseSystem';
import { getActiveCompetitionThemeForPlayer, getPlayerClubCountry } from './utils/leagueThemeHelper';
import { LanguagePickerButton, LanguagePacketButton, LanguagePickerModal } from './components/LanguagePickerModal';
const LanguagePacketModal = React.lazy(() => import('./components/LanguagePacketModal').then(m => ({ default: m.LanguagePacketModal })));
const ProfileModal = React.lazy(() => import('./components/ProfileModal').then(m => ({ default: m.ProfileModal })));
import { useLanguage } from './context/LanguageContext';
import { translateNationality } from './utils/localizationSystem';
import { getLocalizedCityOption, getOfficialPlayerTypeName } from './utils/gameVocabulary';
import { SoundtrackControlWidget } from './components/SoundtrackControlWidget';
import { CompactMusicPlayerButton } from './components/CompactMusicPlayerButton';
import {
  PixelTrophyIcon,
  PixelCoinIcon,
  PixelCardsIcon,
  PixelShopIcon,
  PixelCrownIcon,
  PixelGearIcon,
} from './components/pixel/PixelIcons';
import { useAudio } from './context/AudioContext';
import { audioManager } from './utils/audioSystem';
import { CrashReportButton } from './components/CrashReportButton';
import { setupGlobalErrorListeners, setCrashContext } from './utils/crashReportSystem';
import { StartupIntroFlow } from './components/StartupIntroFlow';
import { getParentCardIntroStory } from './utils/parentCardIntroSystem';
const IconicPlayerEventModal = React.lazy(() => import('./components/IconicPlayerEventModal').then(m => ({ default: m.IconicPlayerEventModal })));
import { clampDisplayedPotential, shouldTriggerIconicPlayerEvent, BASE_PLAYER_POTENTIAL } from './utils/potentialSystem';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { Trophy, Download, CheckCircle2, Sliders, Film, PlayCircle, Eye, Home, Check, UserCheck, Shield, CreditCard, AlertTriangle, MapPin, Award, Sparkles, Globe, Save, FolderHeart, Crown, Database, ShoppingBag, Menu, Music, ArrowLeft, Wand2 } from 'lucide-react';
const OptionFileModal = React.lazy(() => import('./components/OptionFileModal').then(m => ({ default: m.OptionFileModal })));
const CardStoreModal = React.lazy(() => import('./components/CardStoreModal').then(m => ({ default: m.CardStoreModal })));
const CardCollectionModal = React.lazy(() => import('./components/CardCollectionModal').then(m => ({ default: m.CardCollectionModal })));
import { DrawStarMarkIcon } from './components/DrawStarMarkIcon';
import { TranslationInspector } from './components/TranslationInspector';
const TranslationInspectorModal = React.lazy(() => import('./components/TranslationInspectorModal').then(m => ({ default: m.TranslationInspectorModal })));
import { recordInspectedText } from './utils/translationInspectorSystem';
import { PixelFocusOverlay } from './components/pixel/PixelFocusOverlay';
import {
  getChampionCredits,
  subscribeToChampionCredits,
  checkUniqueCareerStartEligibility,
  chargeUniqueCareerStartCost,
  addChampionCredits,
} from './utils/storeCollectionSystem';
import { useTestMode } from './utils/testModeSystem';
import { shouldDisableParticles, triggerAppCelebration } from './utils/graphicSettingsSystem';

const triggerConfetti = (opts?: any) => {
  triggerAppCelebration(opts);
};

export default function App() {
  const { t, language } = useLanguage();
  const { isTestMode } = useTestMode();
  const [player, setPlayer] = useState<PlayerCardData>(PRESET_PLAYERS[0]); // Default New Prodigy
  const [legendsList, setLegendsList] = useState<PlayerCardData[]>(() =>
    PRESET_PLAYERS.filter((p) => p.id !== 'prodigy')
  );
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // App Navigation & View Modes
  const [hasCompletedStartupFlow, setHasCompletedStartupFlow] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'main_menu' | 'character_creation' | 'editor'>('main_menu');
  const [careerMode, setCareerMode] = useState<'unique_career' | 'play_as_legend' | 'editor'>('unique_career');
  const [isEditorMode, setIsEditorMode] = useState<boolean>(false);
  const [isCharacterConfirmed, setIsCharacterConfirmed] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showCareerModeModal, setShowCareerModeModal] = useState<boolean>(false);
  const [showStartingCityModal, setShowStartingCityModal] = useState<boolean>(false);
  const [showParentCardModal, setShowParentCardModal] = useState<boolean>(false);
  const [showPlayerTypeModal, setShowPlayerTypeModal] = useState<boolean>(false);
  const [showBadRepTutorialModal, setShowBadRepTutorialModal] = useState<boolean>(false);
  const [badRepTierUpEvent, setBadRepTierUpEvent] = useState<BadRepTierUpEvent | null>(null);
  const [showPositionModal, setShowPositionModal] = useState<boolean>(false);
  const [showFinalConfirmationModal, setShowFinalConfirmationModal] = useState<boolean>(false);
  const [selectedPlayerTypeForCreation, setSelectedPlayerTypeForCreation] = useState<PlayerTypeDefinition>(PLAYER_TYPES.speedster);
  const [showIconicPlayerModal, setShowIconicPlayerModal] = useState<boolean>(false);
  const [drawnParentCards, setDrawnParentCards] = useState<ParentCardInstance[]>([]);
  const [selectedParentForIntro, setSelectedParentForIntro] = useState<ParentCardInstance | null>(null);
  const [showParentIntroModal, setShowParentIntroModal] = useState<boolean>(false);
  const [unassignedWarningModal, setUnassignedWarningModal] = useState<boolean>(false);
  const [uniqueCareerPaidForNewRun, setUniqueCareerPaidForNewRun] = useState<boolean>(false);

  // Street Cards, Early Career & Youth League System States
  const [showStreetCardModal, setShowStreetCardModal] = useState<boolean>(false);
  const [showStreetDevEventModal, setShowStreetDevEventModal] = useState<boolean>(false);
  const [streetDevEventData, setStreetDevEventData] = useState<{
    points: number;
    message: string;
    tier: 'low' | 'medium' | 'high';
    age: number;
    totalPoints: number;
  } | null>(null);
  const [drawnStreetCards, setDrawnStreetCards] = useState<StreetCardInstance[]>([]);
  const [showFirstContractModal, setShowFirstContractModal] = useState<boolean>(false);
  const [firstContractOffers, setFirstContractOffers] = useState<ProContractOffer[]>([]);
  const [showManagerPlaystyleModal, setShowManagerPlaystyleModal] = useState<boolean>(false);
  const [pendingProContractOffer, setPendingProContractOffer] = useState<ProContractOffer | null>(null);
  const [showParentCardIntroModal, setShowParentCardIntroModal] = useState<boolean>(false);
  const [showEarlyCareerDecisionModal, setShowEarlyCareerDecisionModal] = useState<boolean>(false);
  const [showFreeAgentHubModal, setShowFreeAgentHubModal] = useState<boolean>(false);
  const [showYouthCinematicModal, setShowYouthCinematicModal] = useState<boolean>(false);
  const [showYouthManagerMeetingModal, setShowYouthManagerMeetingModal] = useState<boolean>(false);
  const [showYouthSeasonDashboardModal, setShowYouthSeasonDashboardModal] = useState<boolean>(false);
  const [isBigClubYouth, setIsBigClubYouth] = useState<boolean>(false);
  const [showFirstContractIntroModal, setShowFirstContractIntroModal] = useState<boolean>(false);
  const [firstContractIntroOffer, setFirstContractIntroOffer] = useState<ProContractOffer | null>(null);
  const [showYouthGraduationModal, setShowYouthGraduationModal] = useState<boolean>(false);
  const [showTransferInterestModal, setShowTransferInterestModal] = useState<boolean>(false);
  const [showArabianMegaOfferModal, setShowArabianMegaOfferModal] = useState<boolean>(false);
  const [pendingSaudiOffer, setPendingSaudiOffer] = useState<ClubTransferOffer | null>(null);
  const [activeTransferOffers, setActiveTransferOffers] = useState<ClubTransferOffer[]>([]);
  const [activeCallUp, setActiveCallUp] = useState<InternationalCallUp | null>(null);

  // Persistent UI States & Career Store Items
  const [isPersistentUiVisible, setIsPersistentUiVisible] = useState<boolean>(true);
  const [activeOverlayPanel, setActiveOverlayPanel] = useState<'store' | 'cards_collection' | 'development' | 'accounting' | 'manager' | 'settings' | 'trophies' | 'perks' | 'national_team' | 'statistics' | 'test_mode' | null>(null);
  const [championCoins, setChampionCoins] = useState<number>(10); // $10 default value
  const [iconicCoins, setIconicCoins] = useState<number>(0);
  const [fontSize, setFontSize] = useState<FontSizeOption>('md');
  const [storeItems, setStoreItems] = useState<StoreUpgradeItem[]>(INITIAL_STORE_ITEMS);

  // DrawStar Card Store & Champion Credits State
  const [showStoreModal, setShowStoreModal] = useState<boolean>(false);
  const [showCardCollectionModal, setShowCardCollectionModal] = useState<boolean>(false);
  const [showGraphicSettingsModal, setShowGraphicSettingsModal] = useState<boolean>(false);
  const [showCompactHeaderMenu, setShowCompactHeaderMenu] = useState<boolean>(false);
  const [showSoundtrackModal, setShowSoundtrackModal] = useState<boolean>(false);
  const [showLanguagePickerModal, setShowLanguagePickerModal] = useState<boolean>(false);
  const [showLanguagePacketModal, setShowLanguagePacketModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showTranslationInspectorModal, setShowTranslationInspectorModal] = useState<boolean>(false);
  const [isInspectModeActive, setIsInspectModeActive] = useState<boolean>(false);
  const [championCredits, setChampionCredits] = useState<number>(() => getChampionCredits());

  useEffect(() => {
    setChampionCredits(getChampionCredits());
    const unsubscribe = subscribeToChampionCredits((credits) => {
      setChampionCredits(credits);
    });
    return () => unsubscribe();
  }, []);

  // Global Magic Inspector Click Listener when isInspectModeActive is active
  useEffect(() => {
    if (!isInspectModeActive) return;

    const handleInspectClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (
        target.closest('#top-bar-inspector-btn') ||
        target.closest('#drawstar-translation-inspector-ui') ||
        target.closest('[id*="translation-inspector"]')
      ) {
        return;
      }

      const text = target.innerText?.trim() || target.textContent?.trim() || '';
      if (!text || text.length > 500) return;

      e.preventDefault();
      e.stopPropagation();

      let screen = 'Career Simulation';
      if (viewMode === 'main_menu') screen = 'Main Menu';
      else if (viewMode === 'character_creation') screen = 'Wonderkid Profile Creator';
      else if (isEditorMode) screen = 'Option File & Database Editor';
      else if (careerMode === 'unique_career') screen = 'Career Hub Dashboard';

      recordInspectedText(text, screen, language, 'Captured via Magic Inspector');
      showToast(`🪄 Logged for audit: "${text.slice(0, 26)}${text.length > 26 ? '...' : ''}"`);
    };

    document.addEventListener('click', handleInspectClick, true);
    return () => {
      document.removeEventListener('click', handleInspectClick, true);
    };
  }, [isInspectModeActive, viewMode, isEditorMode, careerMode, language, showToast]);

  // 5-Slot Save System States
  const [activeSaveSlotId, setActiveSaveSlotIdState] = useState<number>(() => getActiveSaveSlotId());
  const [saveSlotModalMode, setSaveSlotModalMode] = useState<SaveSlotModalMode | null>(null);

  // Main scroll container reference
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Farewell Match & Career Conclusion States
  const [showFarewellMatchModal, setShowFarewellMatchModal] = useState<boolean>(false);
  const [showCareerSummaryModal, setShowCareerSummaryModal] = useState<boolean>(false);
  const [showPotentialReachedModal, setShowPotentialReachedModal] = useState<boolean>(false);

  // Multi-Position Mastery & Manager Position Challenge States
  const [managerPositionProposal, setManagerPositionProposal] = useState<ManagerPositionProposal | null>(null);
  const [showManagerPositionModal, setShowManagerPositionModal] = useState<boolean>(false);
  const [naturalSwitchSlot, setNaturalSwitchSlot] = useState<PlayerPositionSlot | null>(null);
  const [showNaturalSwitchModal, setShowNaturalSwitchModal] = useState<boolean>(false);

  // Career Lifecycle Milestone Modal State (Age 10, 20, 28, 33)
  const [careerLifecycleModalData, setCareerLifecycleModalData] = useState<LifecycleMilestoneData | null>(null);
  const [pendingAfterMilestoneFlow, setPendingAfterMilestoneFlow] = useState<'early_career' | 'ex_pro_nickname' | null>(null);

  // Accounting State
  const [accounting, setAccounting] = useState<AccountingState>({
    contractYears: 0,
    yearlySalary: 0,
    sponsors: [],
    sanctions: [],
    businesses: [],
    totalSavings: 0,
  });

  // Manager State
  const [manager, setManager] = useState<ManagerState>({
    name: null,
    negotiation: 0,
    network: 0,
    marketing: 0,
  });

  // Live UI Active Tab & League Database State
  const [liveUiTab, setLiveUiTab] = useState<'character' | 'card_editor' | 'team_editor' | 'national_team_editor' | 'competitions_editor' | 'simulation' | 'cinematics'>('character');
  const [leagueDb, setLeagueDb] = useState<LeagueDatabase>(() => getLeagueDatabase());
  const [showOptionFileModal, setShowOptionFileModal] = useState<boolean>(false);
  const [showLeaveCareerModal, setShowLeaveCareerModal] = useState<boolean>(false);
  const [showContinentalModal, setShowContinentalModal] = useState<boolean>(false);
  const [showPerkReplacementModal, setShowPerkReplacementModal] = useState<boolean>(false);
  const [pendingNewPerk, setPendingNewPerk] = useState<CareerPerk | null>(null);
  const [showPerkStoryModal, setShowPerkStoryModal] = useState<boolean>(false);
  const [unlockedPerkForStory, setUnlockedPerkForStory] = useState<CareerPerk | null>(null);
  const [championModalData, setChampionModalData] = useState<ChampionTitleData | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);
  const [showLegendObjectivesModal, setShowLegendObjectivesModal] = useState<boolean>(false);
  const [showWorldResultsAppModal, setShowWorldResultsAppModal] = useState<boolean>(false);
  const [pendingFeatNickname, setPendingFeatNickname] = useState<FeatNicknameConfig | null>(null);
  const [isExProNicknameTrigger, setIsExProNicknameTrigger] = useState<boolean>(false);
  const [pendingStartingNickname, setPendingStartingNickname] = useState<string | null>(null);
  const [isStartingTypeNicknameTrigger, setIsStartingTypeNicknameTrigger] = useState<boolean>(false);
  const [showUnifiedClubOfferModal, setShowUnifiedClubOfferModal] = useState<boolean>(false);
  const [unifiedClubOffers, setUnifiedClubOffers] = useState<UnifiedClubOffer[]>([]);

  // SPECIAL CLUB TRANSFER EVENT & CHOICE STATES
  const [showSpecialClubChoiceModal, setShowSpecialClubChoiceModal] = useState<boolean>(false);
  const [specialChoiceData, setSpecialChoiceData] = useState<SpecialClubChoiceEventData | null>(null);
  const [showSpecialSigningChainModal, setShowSpecialSigningChainModal] = useState<boolean>(false);
  const [activeSpecialSigningEvaluation, setActiveSpecialSigningEvaluation] = useState<SpecialClubEvaluation | null>(null);
  const [showSpecialRetryModal, setShowSpecialRetryModal] = useState<boolean>(false);
  const [activeSpecialRetryEvaluation, setActiveSpecialRetryEvaluation] = useState<SpecialClubEvaluation | null>(null);

  const [pendingJudasBetrayalData, setPendingJudasBetrayalData] = useState<{
    betrayalData: RivalBetrayalCheckResult;
    offer: UnifiedClubOffer | ClubTransferOffer;
    isUnified: boolean;
    transferFeeFormatted?: string;
    weeklyWageFormatted?: string;
  } | null>(null);

  const [figoBetrayalModalData, setFigoBetrayalModalData] = useState<{
    isOpen: boolean;
    betrayedClub: string;
    destinationClub: string;
    rivalryName?: string;
  } | null>(null);
  const prevTierRef = useRef(getCardTier(player.ovr));

  const handleOpenChampionCelebration = useCallback((data: ChampionTitleData) => {
    setChampionModalData(data);
  }, []);

  const handleClaimTrophyFromModal = useCallback((trophyItem: any) => {
    setPlayer((prev) => {
      let updated = awardTrophiesToPlayer(prev, [trophyItem]);

      // Check for Mr. Champions Feat: 3 consecutive UCL titles + Top Goalscorer in all 3
      const nameLow = (trophyItem.name || '').toLowerCase();
      const isUcl = nameLow.includes('champions league') || trophyItem.iconType === 'champions-league';
      if (isUcl) {
        // Player won UCL; check if player was top goalscorer
        const isTopScorer = Boolean(
          trophyItem.topScorer ||
          (trophyItem as any).isTopScorer ||
          championModalData?.topGoalscorer?.isPlayer ||
          championModalData?.topGoalscorer?.name?.includes(prev.name)
        );
        const uclFeat = processUclSeasonFeat(updated, true, isTopScorer);
        updated = uclFeat.player;
        if (uclFeat.unlocked) {
          setPendingFeatNickname(FEAT_NICKNAMES.mr_champions);
          setShowNicknameModal(true);
        }
      }

      // Check for O Rei Feat: 3 FIFA World Cups as a Starter
      const isWorldCup = nameLow.includes('world cup') || trophyItem.iconType === 'world-cup';
      if (isWorldCup) {
        const isStarter = true; // Starter in World Cup victory
        const wcFeat = processWorldCupFeat(updated, true, isStarter);
        updated = wcFeat.player;
        if (wcFeat.unlocked) {
          setPendingFeatNickname(FEAT_NICKNAMES.o_rei);
          setShowNicknameModal(true);
        }
      }

      return updated;
    });
    if (showToast) {
      showToast(`🏆 Trophy Added to Cabinet: ${trophyItem.name}! (+${trophyItem.prestige || 50} Fame)`);
    }
  }, [showToast, championModalData]);

  useEffect(() => {
    setupGlobalErrorListeners();
    return setupGameNavigation();
  }, []);

  useEffect(() => {
    setCrashContext({
      currentScreen: viewMode,
      gameMode: careerMode,
      careerState: {
        playerName: player?.name,
        club: player?.club,
        position: player?.position,
        ovr: player?.overallRating,
        age: player?.age,
        marketValue: player?.marketValue,
        isRetired: player?.isRetired,
      },
    });
  }, [viewMode, careerMode, player]);

  // Synchronize 8-Bit Soundtrack with Active Competition / Region (Country where player's club/league is located)
  useEffect(() => {
    if (!hasCompletedStartupFlow) {
      return;
    }
    if (viewMode === 'main_menu') {
      audioManager.startMenuMusic();
    } else {
      const isPro = isProfessionalPlayer(player);
      const clubCountry = getPlayerClubCountry(player, leagueDb);
      audioManager.setCompetitionContext(
        player?.league,
        clubCountry,
        player?.divisionTier ? String(player.divisionTier) : undefined,
        isPro
      );
    }
  }, [
    hasCompletedStartupFlow,
    viewMode,
    player?.league,
    player?.club,
    player?.clubCountry,
    player?.country,
    player?.nationality,
    player?.startingCity,
    player?.divisionTier,
    player?.age,
    player?.isProfessional,
    leagueDb,
  ]);

  const handleConfirmPerkReplacement = useCallback((oldPerkId: string, newPerkId: string) => {
    setPlayer((prev) => {
      const updated = replacePerk(prev, oldPerkId, newPerkId);
      const oldP = getPerkById(oldPerkId);
      const newP = getPerkById(newPerkId);
      if (showToast) {
        showToast(`Perk Replaced: ${oldP?.name || oldPerkId} ➔ ${newP?.name || newPerkId}`);
      }
      return updated;
    });
    setShowPerkReplacementModal(false);
    setPendingNewPerk(null);
  }, [showToast]);

  const handleDiscardNewPerk = useCallback((discardedPerkId: string) => {
    setPlayer((prev) => {
      const updated = discardPerk(prev, discardedPerkId);
      const discardedP = getPerkById(discardedPerkId);
      if (showToast) {
        showToast(`Perk Discarded: ${discardedP?.name || discardedPerkId}. Retained all 5 active perks.`);
      }
      return updated;
    });
    setShowPerkReplacementModal(false);
    setPendingNewPerk(null);
  }, [showToast]);

  const handleTriggerPerkUnlock = useCallback((perkOrId: CareerPerk | string) => {
    const perkObj = typeof perkOrId === 'string' ? getPerkById(perkOrId) : perkOrId;
    if (!perkObj) return;

    // Exclude parent card perks from this event (handled in parent card selection)
    if (perkObj.category === 'Parent Card' || perkObj.parentCardTypeId) {
      return;
    }

    setPlayer((currentPlayer) => {
      // Check if already active or already retired
      if (hasPerk(currentPlayer, perkObj.id) || isPerkRetired(currentPlayer, perkObj.id)) {
        return currentPlayer;
      }
      setUnlockedPerkForStory(perkObj);
      setShowPerkStoryModal(true);
      return currentPlayer;
    });
  }, []);

  const handleAcceptPerkFromStory = useCallback((perk: CareerPerk) => {
    setShowPerkStoryModal(false);
    setUnlockedPerkForStory(null);

    setPlayer((prev) => {
      const earnRes = earnPerk(prev, perk.id);
      if (earnRes.requiresReplacement) {
        setPendingNewPerk(perk);
        setShowPerkReplacementModal(true);
        return prev;
      } else {
        triggerConfetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        audioManager.playSuccessChime();
        if (showToast) {
          showToast(`✨ Perk Activated: ${perk.name}!`);
        }
        return earnRes.updatedPlayer;
      }
    });
  }, [showToast]);

  const getCurrentCareerSaveState = useCallback(() => {
    return {
      player,
      accounting,
      manager,
      championCoins,
      iconicCoins,
      storeItems,
      isCharacterConfirmed,
      showStartingCityModal,
      showParentCardModal,
      drawnParentCards,
      selectedParentForIntro,
      showParentIntroModal,
      showStreetCardModal,
      drawnStreetCards,
      showFirstContractModal,
      firstContractOffers,
      showManagerPlaystyleModal,
      pendingProContractOffer,
      showEarlyCareerDecisionModal,
      showYouthCinematicModal,
      showYouthManagerMeetingModal,
      showYouthSeasonDashboardModal,
      isBigClubYouth,
      liveUiTab,
      isPersistentUiVisible,
    };
  }, [
    player,
    accounting,
    manager,
    championCoins,
    iconicCoins,
    storeItems,
    isCharacterConfirmed,
    showStartingCityModal,
    showParentCardModal,
    drawnParentCards,
    selectedParentForIntro,
    showParentIntroModal,
    showStreetCardModal,
    drawnStreetCards,
    showFirstContractModal,
    firstContractOffers,
    showManagerPlaystyleModal,
    pendingProContractOffer,
    showEarlyCareerDecisionModal,
    showYouthCinematicModal,
    showYouthManagerMeetingModal,
    showYouthSeasonDashboardModal,
    isBigClubYouth,
    liveUiTab,
    isPersistentUiVisible,
  ]);

  // Automatic Retirement Check Effect
  useEffect(() => {
    if (player.isRetired && !player.careerConcluded) {
      setShowFarewellMatchModal((prev) => (!prev && !showCareerSummaryModal ? true : prev));
    }
  }, [player.isRetired, player.careerConcluded, showCareerSummaryModal]);

  // Bad Reputation Tutorial & Tier Up Event Listeners
  useEffect(() => {
    const handleBadRepGained = () => {
      if (isTutorialEnabled() && !hasSeenTutorial('bad_reputation_tutorial')) {
        setShowBadRepTutorialModal(true);
      }
    };

    const handleBadRepTierUp = (e: any) => {
      if (e?.detail?.tierUpEvent) {
        setBadRepTierUpEvent(e.detail.tierUpEvent);
      }
    };

    window.addEventListener('drawstar_bad_rep_gained', handleBadRepGained);
    window.addEventListener('drawstar_bad_rep_tier_up', handleBadRepTierUp);
    return () => {
      window.removeEventListener('drawstar_bad_rep_gained', handleBadRepGained);
      window.removeEventListener('drawstar_bad_rep_tier_up', handleBadRepTierUp);
    };
  }, []);

  // Potential Reached Milestone Check Effect (Unique Career Mode)
  useEffect(() => {
    if (
      careerMode === 'unique_career' &&
      viewMode !== 'main_menu' &&
      !player.isRetired
    ) {
      const pot = player.potentialOvr || Math.max((player.ovr || 50) + 5, 80);
      const ovr = player.ovr || 50;
      if (ovr >= pot && player.lastReachedPotentialOvr !== pot) {
        setShowPotentialReachedModal((prev) => (!prev ? true : prev));
      }
    }
  }, [
    careerMode,
    viewMode,
    player.ovr,
    player.potentialOvr,
    player.lastReachedPotentialOvr,
    player.isRetired,
  ]);

  const handleTriggerRetirement = useCallback(() => {
    setShowFarewellMatchModal(true);
  }, []);

  const handleCompleteFarewell = useCallback(
    (updatedPlayer: PlayerCardData, _result: FarewellMatchResult) => {
      setPlayer(updatedPlayer);
      setShowFarewellMatchModal(false);
      setShowCareerSummaryModal(true);
      triggerConfetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      showToast(`🏆 FAREWELL MATCH COMPLETE! Legend ${updatedPlayer.name} has officially retired.`);
    },
    [showToast]
  );

  const handleOpenCareerSummary = useCallback(() => {
    if (!player.careerHistory) {
      const compiled = compileFullCareerHistory(player);
      setPlayer((prev) => ({ ...prev, careerHistory: compiled }));
    }
    setShowCareerSummaryModal(true);
  }, [player]);

  const handleRequestMainMenu = useCallback(() => {
    if (careerMode === 'unique_career' && viewMode !== 'main_menu') {
      setShowLeaveCareerModal(true);
    } else {
      setShowYouthSeasonDashboardModal(false);
      setShowStartingCityModal(false);
      setShowParentCardModal(false);
      setShowParentIntroModal(false);
      setShowStreetCardModal(false);
      setShowStreetDevEventModal(false);
      setShowFirstContractModal(false);
      setShowManagerPlaystyleModal(false);
      setShowEarlyCareerDecisionModal(false);
      setShowYouthCinematicModal(false);
      setShowYouthManagerMeetingModal(false);
      setShowFirstContractIntroModal(false);
      setShowTransferInterestModal(false);
      setShowArabianMegaOfferModal(false);
      setShowFarewellMatchModal(false);
      setShowCareerSummaryModal(false);
      setShowPotentialReachedModal(false);
      setShowNicknameModal(false);
      setShowLeaveCareerModal(false);
      setShowConfirmModal(false);
      setUnassignedWarningModal(false);
      setIsPersistentUiVisible(false);
      setActiveOverlayPanel(null);
      setViewMode('main_menu');
      setCareerMode('editor');
      setIsEditorMode(false);
    }
  }, [careerMode, viewMode]);

  const handleTopBarBack = useCallback(() => {
    // 1. If any overlay panel in PersistentUi is open, close it first
    if (activeOverlayPanel) {
      setActiveOverlayPanel(null);
      return;
    }
    // 2. Unwind top-level modals in reverse hierarchy
    if (showStoreModal) { setShowStoreModal(false); return; }
    if (showCardCollectionModal) { setShowCardCollectionModal(false); return; }
    if (showGraphicSettingsModal) { setShowGraphicSettingsModal(false); return; }
    if (showSoundtrackModal) { setShowSoundtrackModal(false); return; }
    if (showLanguagePickerModal) { setShowLanguagePickerModal(false); return; }
    if (showProfileModal) { setShowProfileModal(false); return; }
    if (showTranslationInspectorModal) { setShowTranslationInspectorModal(false); return; }
    if (showCompactHeaderMenu) { setShowCompactHeaderMenu(false); return; }
    if (showBadRepTutorialModal) { setShowBadRepTutorialModal(false); return; }
    if (showParentCardModal) { setShowParentCardModal(false); return; }
    if (showParentCardIntroModal) { setShowParentCardIntroModal(false); return; }
    if (showStartingCityModal) { setShowStartingCityModal(false); return; }
    if (showPositionModal) { setShowPositionModal(false); return; }
    if (showPlayerTypeModal) { setShowPlayerTypeModal(false); return; }
    if (showCareerModeModal) { setShowCareerModeModal(false); return; }
    if (showFinalConfirmationModal) { setShowFinalConfirmationModal(false); return; }

    // If in character creation but no modal, ask or return
    if (!isCharacterConfirmed) {
      handleRequestMainMenu();
      return;
    }

    // Default: return to Main Menu via confirmation
    handleRequestMainMenu();
  }, [
    activeOverlayPanel,
    showStoreModal,
    showCardCollectionModal,
    showGraphicSettingsModal,
    showSoundtrackModal,
    showLanguagePickerModal,
    showProfileModal,
    showTranslationInspectorModal,
    showCompactHeaderMenu,
    showBadRepTutorialModal,
    showParentCardModal,
    showParentCardIntroModal,
    showStartingCityModal,
    showPositionModal,
    showPlayerTypeModal,
    showCareerModeModal,
    showFinalConfirmationModal,
    isCharacterConfirmed,
    handleRequestMainMenu,
  ]);

  const handleTopBarHome = useCallback(() => {
    // Closes any open modals / sub-menus and returns straight to the 32-bit Career Hub dashboard
    setActiveOverlayPanel(null);
    setShowStoreModal(false);
    setShowCardCollectionModal(false);
    setShowGraphicSettingsModal(false);
    setShowSoundtrackModal(false);
    setShowLanguagePickerModal(false);
    setShowProfileModal(false);
    setShowTranslationInspectorModal(false);
    setShowCompactHeaderMenu(false);
    setShowBadRepTutorialModal(false);

    if (!isCharacterConfirmed) {
      handleRequestMainMenu();
    }
  }, [isCharacterConfirmed, handleRequestMainMenu]);

  const handleSaveAndReturnFromModal = useCallback(() => {
    const currentSave = getCurrentCareerSaveState();
    saveToSlot(activeSaveSlotId, currentSave);
    setShowLeaveCareerModal(false);
    setShowYouthSeasonDashboardModal(false);
    setShowStartingCityModal(false);
    setShowParentCardModal(false);
    setShowParentIntroModal(false);
    setShowStreetCardModal(false);
    setShowStreetDevEventModal(false);
    setShowFirstContractModal(false);
    setShowManagerPlaystyleModal(false);
    setShowEarlyCareerDecisionModal(false);
    setShowYouthCinematicModal(false);
    setShowYouthManagerMeetingModal(false);
    setShowFirstContractIntroModal(false);
    setShowTransferInterestModal(false);
    setShowArabianMegaOfferModal(false);
    setShowFarewellMatchModal(false);
    setShowCareerSummaryModal(false);
    setShowPotentialReachedModal(false);
    setShowNicknameModal(false);
    setShowConfirmModal(false);
    setUnassignedWarningModal(false);
    setIsPersistentUiVisible(false);
    setActiveOverlayPanel(null);
    setViewMode('main_menu');
    showToast(`💾 Career progress saved to Slot ${activeSaveSlotId}! Returned to Main Menu.`);
  }, [getCurrentCareerSaveState, activeSaveSlotId, showToast]);

  const handleReturnWithoutSavingFromModal = useCallback(() => {
    setShowLeaveCareerModal(false);
    setShowYouthSeasonDashboardModal(false);
    setShowStartingCityModal(false);
    setShowParentCardModal(false);
    setShowParentIntroModal(false);
    setShowStreetCardModal(false);
    setShowStreetDevEventModal(false);
    setShowFirstContractModal(false);
    setShowManagerPlaystyleModal(false);
    setShowEarlyCareerDecisionModal(false);
    setShowYouthCinematicModal(false);
    setShowYouthManagerMeetingModal(false);
    setShowFirstContractIntroModal(false);
    setShowTransferInterestModal(false);
    setShowArabianMegaOfferModal(false);
    setShowFarewellMatchModal(false);
    setShowCareerSummaryModal(false);
    setShowPotentialReachedModal(false);
    setShowNicknameModal(false);
    setShowConfirmModal(false);
    setUnassignedWarningModal(false);
    setIsPersistentUiVisible(false);
    setActiveOverlayPanel(null);
    setViewMode('main_menu');
    showToast('Returned to Main Menu without saving.');
  }, [showToast]);

  const handleCancelLeaveCareer = useCallback(() => {
    setShowLeaveCareerModal(false);
  }, []);

  const handleManualSaveActiveCareer = useCallback(() => {
    const currentSave = getCurrentCareerSaveState();
    saveToSlot(activeSaveSlotId, currentSave);
    showToast(`💾 Career successfully saved to Slot ${activeSaveSlotId}!`);
  }, [getCurrentCareerSaveState, activeSaveSlotId, showToast]);

  // Season-End Save Handler: Persists state only once when a full season has finished
  const handleSeasonCompleted = useCallback(
    (updatedPlayer: PlayerCardData, updatedAccounting?: AccountingState) => {
      const replenishedStore = generatePreSeasonStoreReplenishment(storeItems);
      setStoreItems(replenishedStore);

      const currentState = getCurrentCareerSaveState();
      const seasonEndState = {
        ...currentState,
        player: updatedPlayer,
        accounting: updatedAccounting || currentState.accounting,
        storeItems: replenishedStore,
      };
      saveToSlot(activeSaveSlotId, seasonEndState);
      if (showToast) {
        showToast(`💾 Season complete! Preseason store restocked & progress saved to Slot ${activeSaveSlotId}.`);
      }

      // Check if player has played more matches at a secondary position with Tier IV mastery
      const eligibleSlot = checkNaturalPositionSwitchEligibility(updatedPlayer);
      if (eligibleSlot) {
        setNaturalSwitchSlot(eligibleSlot);
        setShowNaturalSwitchModal(true);
      }
    },
    [getCurrentCareerSaveState, activeSaveSlotId, showToast, storeItems]
  );

  const handleTriggerManagerPositionProposal = useCallback(() => {
    const proposal = evaluateManagerPositionChangeForPlayer(player);
    if (proposal) {
      setManagerPositionProposal(proposal);
      setShowManagerPositionModal(true);
    } else {
      if (showToast) {
        showToast('Tactical meeting: Squad depth is currently balanced or maximum positions (4) reached.');
      }
    }
  }, [player, showToast]);

  const handleSelectSlotForNewCareer = useCallback((slotId: number) => {
    // Unique Career start costs exactly 1 Champion Credit (may already be paid via Slot Machine animation)
    if (!uniqueCareerPaidForNewRun) {
      const eligibility = checkUniqueCareerStartEligibility();
      if (!eligibility.canStart) {
        showToast(
          eligibility.message ||
            '⚠️ Insufficient Champion Credits! Starting a Unique Career requires 1 Champion Credit. Visit the Store to view your balance.'
        );
        return;
      }

      const charged = chargeUniqueCareerStartCost();
      if (!charged) {
        showToast('⚠️ Failed to deduct 1 Champion Credit. Please try again.');
        return;
      }
    }

    setUniqueCareerPaidForNewRun(false);

    setActiveSaveSlotId(slotId);
    setActiveSaveSlotIdState(slotId);
    deleteSaveSlot(slotId);

    setCareerMode('unique_career');
    setViewMode('character_creation');
    setIsEditorMode(false);
    setIsCharacterConfirmed(false);
    setChampionCoins(10);
    setIconicCoins(0);
    setStoreItems(INITIAL_STORE_ITEMS.map((item) => ({ ...item, unlocked: false })));
    setLiveUiTab('character');

    // Close any previous open modals and reset transient career states
    setShowYouthSeasonDashboardModal(false);
    setShowStartingCityModal(false);
    setShowParentCardModal(false);
    setDrawnParentCards([]);
    setSelectedParentForIntro(null);
    setShowParentIntroModal(false);
    setShowStreetCardModal(false);
    setShowStreetDevEventModal(false);
    setStreetDevEventData(null);
    setDrawnStreetCards([]);
    setShowFirstContractModal(false);
    setFirstContractOffers([]);
    setShowManagerPlaystyleModal(false);
    setPendingProContractOffer(null);
    setShowEarlyCareerDecisionModal(false);
    setShowYouthCinematicModal(false);
    setShowYouthManagerMeetingModal(false);
    setIsBigClubYouth(false);
    setShowFirstContractIntroModal(false);
    setFirstContractIntroOffer(null);
    setShowTransferInterestModal(false);
    setShowArabianMegaOfferModal(false);
    setPendingSaudiOffer(null);
    setActiveTransferOffers([]);
    setActiveCallUp(null);
    setIsPersistentUiVisible(true);
    setActiveOverlayPanel(null);
    setShowFarewellMatchModal(false);
    setShowCareerSummaryModal(false);
    setShowPotentialReachedModal(false);
    setShowNicknameModal(false);
    setIsExProNicknameTrigger(false);
    setChampionModalData(null);
    setShowConfirmModal(false);
    setShowLeaveCareerModal(false);
    setUnassignedWarningModal(false);

    setAccounting({
      contractYears: 0,
      yearlySalary: 0,
      sponsors: [],
      sanctions: [],
      businesses: [],
      totalSavings: 0,
    });

    setManager({
      name: null,
      negotiation: 0,
      network: 0,
      marketing: 0,
    });

    const freshProdigy: PlayerCardData = {
      id: 'prodigy',
      name: 'New Prodigy',
      firstName: '',
      lastName: '',
      ovr: 40,
      potentialOvr: BASE_PLAYER_POTENTIAL,
      internalPotentialOvr: BASE_PLAYER_POTENTIAL,
      age: 10,
      heightCm: 145,
      weightKg: 45,
      club: 'Youth Prospect',
      clubCountry: 'Unassigned',
      league: 'Youth Division',
      position: 'CAM',
      subPosition: 'CAM',
      playStyle: 'Creator',
      fame: 0,
      badReputation: 0,
      retirementAge: 35,
      expectedPeak: 28,
      collectedCards: [],
      trophies: [],
      activePerkIds: [],
      retiredPerkIds: [],
      hasHadNicknameEvent: false,
      nicknameAccepted: false,
      stats: {
        pro: 40,
        def: 40,
        cre: 40,
        men: 40,
        goa: 40,
        phy: 40,
        detailed: {
          pace: 40,
          shooting: 40,
          shortPass: 40,
          dribbling: 40,
          tackling: 40,
          positioning: 40,
          stamina: 40,
          longShots: 40,
          longPass: 40,
          ballControl: 40,
          marking: 40,
          composure: 40,
          strength: 40,
          heading: 40,
          crossing: 40,
          retention: 40,
          interceptions: 40,
          reactions: 40,
        },
        gkDetailed: {
          reflexes: 40,
          saving: 40,
          distribution: 40,
          handling: 40,
          positioning: 40,
          aerialReach: 40,
          oneOnOne: 40,
        },
      },
      biometrics: {
        strength: 40,
        skinColor: '#f5d0b1',
        hairStyle: 'straight',
        hairLength: 'short',
        hairRoot: '#111111',
        hairDye: 'none',
      },
      accessories: {
        accessory: 'none',
        headbandColor: '#000000',
        tattooNeck: 'none',
        tattooArmL: 'none',
        tattooArmR: 'none',
        tattooFace: 'none',
        earring: 'none',
        earringL: 'none',
        earringR: 'none',
        necklace: 'none',
      },
      kit: {
        style: 'normal',
        color1: '#2563eb',
        color2: '#ffffff',
        pattern: 'solid',
        collar: 'crew',
      },
      emblem: {
        shape: 'arrow',
        mode: '1',
        color1: '#2563eb',
        color2: '#ffffff',
      },
      weakFootStars: 0,
      chemistry: 50,
    };
    setPlayer(freshProdigy);
    setSaveSlotModalMode(null);
    showToast(`🌟 New Career Initialized in Slot ${slotId}! 1 Champion Credit deducted. Welcome to Character Creation.`);
  }, [showToast]);

  const handleSelectSlotForLoad = useCallback((slotId: number) => {
    const savedState = getSaveSlot(slotId);
    if (!savedState) {
      showToast(`🔒 Slot ${slotId} is empty! Please start a New Career in this slot.`);
      return;
    }

    setActiveSaveSlotId(slotId);
    setActiveSaveSlotIdState(slotId);

    setPlayer(savedState.player);
    setAccounting(savedState.accounting);
    setManager(savedState.manager);
    setChampionCoins(savedState.championCoins ?? 10);
    setIconicCoins(savedState.iconicCoins ?? 0);
    setStoreItems(savedState.storeItems || INITIAL_STORE_ITEMS);
    setIsCharacterConfirmed(savedState.isCharacterConfirmed ?? true);
    setShowStartingCityModal(savedState.showStartingCityModal ?? false);
    setShowParentCardModal(savedState.showParentCardModal ?? false);
    setDrawnParentCards(savedState.drawnParentCards || []);
    setSelectedParentForIntro(savedState.selectedParentForIntro || null);
    setShowParentIntroModal(savedState.showParentIntroModal ?? false);
    setShowStreetCardModal(savedState.showStreetCardModal ?? false);
    setDrawnStreetCards(savedState.drawnStreetCards || []);
    setShowFirstContractModal(savedState.showFirstContractModal ?? false);
    setFirstContractOffers(savedState.firstContractOffers || []);
    setShowManagerPlaystyleModal(savedState.showManagerPlaystyleModal ?? false);
    setPendingProContractOffer(savedState.pendingProContractOffer || null);
    setShowEarlyCareerDecisionModal(savedState.showEarlyCareerDecisionModal ?? false);
    setShowYouthCinematicModal(savedState.showYouthCinematicModal ?? false);
    setShowYouthManagerMeetingModal(savedState.showYouthManagerMeetingModal ?? false);
    setShowYouthSeasonDashboardModal(savedState.showYouthSeasonDashboardModal ?? false);
    setIsBigClubYouth(savedState.isBigClubYouth ?? false);
    setLiveUiTab((savedState.liveUiTab as any) || 'character');
    setIsPersistentUiVisible(savedState.isPersistentUiVisible ?? true);

    setCareerMode('unique_career');
    setViewMode('character_creation');
    setIsEditorMode(false);
    setSaveSlotModalMode(null);
    showToast(`🎮 Unique Career Restored from Slot ${slotId}! (${savedState.player.name} • ${savedState.player.club})`);
  }, [showToast]);

  const handleSelectSlotForSave = useCallback((slotId: number) => {
    const currentSave = getCurrentCareerSaveState();
    saveToSlot(slotId, currentSave);
    setActiveSaveSlotId(slotId);
    setActiveSaveSlotIdState(slotId);
    setSaveSlotModalMode(null);
    showToast(`💾 Career successfully saved into Slot ${slotId}!`);
  }, [getCurrentCareerSaveState, showToast]);

  const handleContinueCareer = useCallback(() => {
    setSaveSlotModalMode('continue_career');
  }, []);

  const handleFlipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleStartNewGame = useCallback((alreadyPaid: boolean = false) => {
    if (alreadyPaid) {
      setUniqueCareerPaidForNewRun(true);
    }
    setSaveSlotModalMode('new_career');
  }, []);

  const handleSelectLegendPreset = useCallback((preset: PlayerCardData) => {
    setPlayer(preset);
    setCareerMode('play_as_legend');
    setViewMode('character_creation');
    setIsEditorMode(false);
    setIsCharacterConfirmed(true);
    setChampionCoins(10);
    setIconicCoins(0);
    setLiveUiTab('character');
    showToast(`⭐ Play as a Legend Mode: ${preset.name} Initialized!`);
  }, [showToast]);

  const handleStartEditor = useCallback((editorTab?: 'character' | 'team' | 'card' | 'competitions') => {
    setCareerMode('editor');
    setViewMode('editor');
    setIsEditorMode(true);
    setIsCharacterConfirmed(false);
    setChampionCoins(99);
    setIconicCoins(99);
    if (editorTab === 'competitions') {
      setLiveUiTab('competitions_editor');
      showToast('🏆 Competitions Editor Opened! Customize leagues, tournaments, UI designs & qualification rules.');
    } else if (editorTab === 'team') {
      setLiveUiTab('team_editor');
      showToast('🛡️ Team Editor Opened! Customize club names, emblems & shirt designs.');
    } else if (editorTab === 'card') {
      setLiveUiTab('card_editor');
      showToast('🃏 Card Deck Editor Opened! Create, save & import custom card decks.');
    } else {
      setLiveUiTab('character');
      showToast('⚡ Editor Mode Activated! Infinite 99/99 Cash Unlocked.');
    }
  }, [showToast]);

  const handleConfirmCharacter = useCallback(() => {
    setIsCharacterConfirmed(true);

    if (careerMode === 'unique_career' && !isEditorMode) {
      // In Unique Career, choose Match Mode (Slow, Decisive, Finals Only) then Starting City!
      setShowCareerModeModal(true);
      return;
    }

    // Direct confirmation for Editor / Legend mode
    triggerConfetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    setShowConfirmModal(true);
    showToast('🎉 Character Confirmed & Saved!');
  }, [isEditorMode, careerMode, showToast]);

  const handleConfirmCareerMatchMode = useCallback(
    (mode: KeyMatchPlayMode) => {
      setPlayer((prev) => ({
        ...prev,
        keyMatchPlayMode: mode,
      }));
      setShowCareerModeModal(false);
      setShowStartingCityModal(true);
      showToast(
        `🎮 Match Mode Configured: ${
          mode === 'slow'
            ? 'Slow Mode (Every Match is Key Match)'
            : mode === 'finals_only'
            ? 'Finals Only (Definitive Matches Only)'
            : 'Decisive Mode (Finals, Semis & Derbies)'
        }!`
      );
    },
    [showToast]
  );

  const handleSaveAsLegend = useCallback(
    (legendPlayer: PlayerCardData) => {
      let legendId = legendPlayer.id;
      if (!legendId || legendId === 'prodigy' || legendId.startsWith('prospect-')) {
        legendId = `legend-${Date.now()}`;
      }

      const updatedLegend: PlayerCardData = {
        ...legendPlayer,
        id: legendId,
        isLegend: true,
      };

      setLegendsList((prev) => {
        const exists = prev.some((l) => l.id === legendId);
        if (exists) {
          return prev.map((l) => (l.id === legendId ? updatedLegend : l));
        } else {
          return [...prev, updatedLegend];
        }
      });

      setPlayer(updatedLegend);
      triggerConfetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      showToast(`⭐ Saved "${updatedLegend.name}" as a Legend! Available in Play as a Legend & Editor Mode.`);
    },
    [showToast]
  );

  const handleConfirmStartingCity = useCallback(
    (cityOption: StartingCityOption) => {
      setPlayer((prev) => {
        const baseDetailed = getOrCreateOutfieldDetailed(prev.stats);
        if (cityOption.statModifier) {
          baseDetailed[cityOption.statModifier.statKey] = (baseDetailed[cityOption.statModifier.statKey] || 40) + cityOption.statModifier.value;
        }
        const updatedStats = syncCategoryStatsFromDetailed(prev.stats, baseDetailed);

        return {
          ...prev,
          startingCity: cityOption.fullName,
          city: cityOption.cityName,
          nationality: cityOption.nationality,
          age: 10,
          weightKg: 45,
          heightCm: 145,
          hasHadGrowthSpurt: false,
          inheritedHeightCmApplied: false,
          weakFootStars: 0,
          ovr: 40,
          potentialOvr: BASE_PLAYER_POTENTIAL,
          internalPotentialOvr: BASE_PLAYER_POTENTIAL,
          fame: 0,
          badReputation: 0,
          retirementAge: 35,
          expectedPeak: 28,
          collectedCards: [],
          position: 'UNSELECTED',
          subPosition: 'UNSELECTED',
          playStyle: 'UNSELECTED',
          chemistry: 50,
          trophies: [],
          stats: updatedStats,
        };
      });

      setAccounting({
        contractYears: 0,
        yearlySalary: 0,
        sponsors: [],
        sanctions: [],
        businesses: [],
        totalSavings: 0,
      });

      setManager({
        name: 'Unassigned',
        negotiation: 0,
        network: 0,
        marketing: 0,
      });

      setShowStartingCityModal(false);

      // Immediately draw 3 Parent Cards upon Starting City selection
      const drawn = drawFourParentCards(cityOption.id, cityOption.nationality.code);
      setDrawnParentCards(drawn);
      setShowParentCardModal(true);

      const modLabel = cityOption.statModifier ? ` (${cityOption.statModifier.label})` : '';
      showToast(`📍 Origin City: ${cityOption.fullName}${modLabel} Selected! Draw 3 Parent Cards to define your origin story.`);
    },
    [showToast]
  );

  const handleConfirmParentCard = useCallback(
    (card: ParentCardInstance) => {
      setPlayer((prev) => {
        const withHeight = applyParentCardInheritedHeight(prev, card);
        const updatedWeakFoot = Math.min(5, (withHeight.weakFootStars || 0) + (card.weakFootBonus || 0));
        const bonusPoints = card.freeStatPointsBonus || card.freeStatPoints || 0;
        const currentFree = withHeight.freeStatPoints !== undefined ? withHeight.freeStatPoints : (withHeight.unassignedPoints !== undefined ? withHeight.unassignedPoints : 5);
        const updatedFreePoints = currentFree + bonusPoints;
        const updatedFame = (withHeight.fame || 0) + (card.fameBonus || 0);
        const basePot = BASE_PLAYER_POTENTIAL;
        const potBonus = card.potentialBonus || 0;
        const rawPotential = basePot + potBonus;
        const updatedPotential = clampDisplayedPotential(rawPotential);

        // Generate Permanent Full Name with Family Name from selected Parent Card
        const rawFirst = formatPersonName((withHeight.firstName || withHeight.name || 'Mateo').trim());
        const fullPlayerName = buildPlayerFullName(rawFirst, card);
        const originLast = getOriginLastNameForCity(withHeight.startingCity || withHeight.city);
        const formattedFamily = formatPersonName(card.familyName);

        let updatedStats = { ...withHeight.stats };
        if (updatedStats.detailed) {
          if (card.composureBonus) updatedStats.detailed.composure = Math.min(99, updatedStats.detailed.composure + card.composureBonus);
          if (card.staminaBonus) updatedStats.detailed.stamina = Math.min(99, updatedStats.detailed.stamina + card.staminaBonus);
          if (card.strengthBonus) updatedStats.detailed.strength = Math.min(99, updatedStats.detailed.strength + card.strengthBonus);
          if (card.dribblingBonus) updatedStats.detailed.dribbling = Math.min(99, updatedStats.detailed.dribbling + card.dribblingBonus);
          if (card.reactionsBonus) updatedStats.detailed.reactions = Math.min(99, updatedStats.detailed.reactions + card.reactionsBonus);
          if (card.positioningBonus) updatedStats.detailed.positioning = Math.min(99, updatedStats.detailed.positioning + card.positioningBonus);
        }

        const newCollectedCard: CareerCollectedCard = {
          id: card.id,
          name: `${card.name} (${card.rarity.toUpperCase()})`,
          category: 'parent',
          rarity: card.rarity === 'iconic' ? 'GOAT' : card.rarity === 'legendary' ? 'Legendary' : card.rarity === 'gold' ? 'Epic' : card.rarity === 'silver' ? 'Rare' : 'Common',
          effects: card.perkEffects,
          obtainedAt: new Date().toISOString().split('T')[0],
        };

        const existingCollected = withHeight.collectedCards || [];
        const parentCardBio = getParentCardIntroStory(card.typeId, card.rarity);

        return sanitizeAndRepairPlayerIdentity({
          ...withHeight,
          name: fullPlayerName,
          firstName: rawFirst,
          originalFirstName: rawFirst,
          birthFirstName: rawFirst,
          familyName: formattedFamily,
          lastName: formattedFamily,
          originalLastName: formattedFamily,
          originLastName: originLast,
          selectedLastNameType: 'original',
          familyIdentity: card.familyDisplay,
          isBrazilHeritage: card.isBrazilHeritage,
          nameSuffix: card.nameSuffix,
          customBio: parentCardBio,
          stats: updatedStats,
          weakFootStars: updatedWeakFoot,
          freeStatPoints: updatedFreePoints,
          unassignedPoints: updatedFreePoints,
          fame: updatedFame,
          potentialOvr: updatedPotential,
          internalPotentialOvr: rawPotential,
          equippedParentCard: card,
          extraNationalities: card.extraNationalities ? [...(withHeight.extraNationalities || []), ...card.extraNationalities] : withHeight.extraNationalities,
          collectedCards: [newCollectedCard, ...existingCollected],
        });
      });

      if (card.managerName) {
        const isHelicopter = card.typeId === 'helicopter_parents' || card.name.toLowerCase().includes('helicopter');
        setManager({
          name: card.managerName,
          managerType: isHelicopter ? 'parent_helicopter' : 'parent_ex_pro',
          tier: (card.rarity as any) || 'gold',
          negotiation: card.managerRating || 75,
          network: card.managerRating || 75,
          marketing: card.managerRating || 75,
          specialTrait: isHelicopter ? 'Aggressive Family Lobbying' : 'Former International Connections',
          agencyName: 'Family Representation',
          bio: `${card.managerName} serves as your dedicated family agent and legal representative.`,
        });
      }

      if (card.startingCashBonus) {
        setAccounting((prev) => ({
          ...prev,
          totalSavings: (prev.totalSavings ?? 0) + card.startingCashBonus!,
        }));
        setChampionCoins((prev) => prev + Math.floor(card.startingCashBonus! / 100000));
        showToast(`💰 Starting Wealth: +€${card.startingCashBonus.toLocaleString()} added to your personal bank savings!`);
      }

      if (card.startingBusinessName) {
        const tmpl =
          BUSINESS_TEMPLATES.find((t) => t.name === card.startingBusinessName) ||
          BUSINESS_TEMPLATES.find((t) => t.id === 'sportswear') ||
          BUSINESS_TEMPLATES[0];
        const startingTier = card.startingBusinessTier || 1;
        const financials = calculateSeasonFinancials(tmpl, startingTier);

        setAccounting((prev) => {
          const existingWithoutSameType = prev.businesses.filter(
            (b) => b.templateId !== tmpl.id && b.name !== tmpl.name
          );
          return {
            ...prev,
            businesses: [
              ...existingWithoutSameType,
              {
                id: `biz-${tmpl.id}-${Date.now()}`,
                templateId: tmpl.id,
                name: tmpl.name,
                tier: startingTier,
                revenue: financials.revenue,
                expenses: financials.expenses,
                netProfit: financials.netProfit,
              },
            ],
          };
        });
      }

      setShowParentCardModal(false);
      setSelectedParentForIntro(card);
      setShowPlayerTypeModal(true);
      showToast(`📖 Parent Card Selected: ${card.name} (${card.rarity.toUpperCase()}). Next: Choose your Player Type Archetype.`);
    },
    [showToast]
  );

  const handleConfirmPlayerType = useCallback(
    (selectedType: PlayerTypeDefinition) => {
      setSelectedPlayerTypeForCreation(selectedType);

      setPlayer((prev) => {
        // Base 725 detailed stats from archetype
        const detailedStats = { ...selectedType.detailedStats };

        // Apply starting city bonus if present
        if (prev.startingCity) {
          const cityOpt = STARTING_CITIES.find((c) => c.fullName === prev.startingCity || c.cityName === prev.city);
          if (cityOpt?.statModifier) {
            detailedStats[cityOpt.statModifier.statKey] = Math.min(
              99,
              (detailedStats[cityOpt.statModifier.statKey] || 0) + cityOpt.statModifier.value
            );
          }
        }

        // Apply Parent Card stat bonuses if equipped
        const card = prev.equippedParentCard;
        if (card) {
          if (card.composureBonus) detailedStats.composure = Math.min(99, detailedStats.composure + card.composureBonus);
          if (card.staminaBonus) detailedStats.stamina = Math.min(99, detailedStats.stamina + card.staminaBonus);
          if (card.strengthBonus) detailedStats.strength = Math.min(99, detailedStats.strength + card.strengthBonus);
          if (card.dribblingBonus) detailedStats.dribbling = Math.min(99, detailedStats.dribbling + card.dribblingBonus);
          if (card.reactionsBonus) detailedStats.reactions = Math.min(99, detailedStats.reactions + card.reactionsBonus);
          if (card.positioningBonus) detailedStats.positioning = Math.min(99, detailedStats.positioning + card.positioningBonus);
        }

        const categoryStats = calculateSixCategoryStats(detailedStats);
        const updatedStats = {
          ...prev.stats,
          ...categoryStats,
          detailed: detailedStats,
        };

        const currentSubPos = prev.subPosition && prev.subPosition !== 'UNSELECTED' ? prev.subPosition : 'ST';
        const calcOvr = calculateWeightedOvr(prev.position || 'ATT', currentSubPos, updatedStats, prev.playStyle);

        const isWastedTalent = selectedType.id === 'wasted_talent';
        if (isWastedTalent) {
          // Ignore bad rep tutorial popup and mark it as seen since explained in card
          markTutorialSeen('bad_reputation_tutorial');
          setShowBadRepTutorialModal(false);
        }

        const activeParentCard = prev.equippedParentCard || selectedParentForIntro;
        const updatedBio = activeParentCard
          ? getParentCardIntroStory(activeParentCard.typeId, activeParentCard.rarity, selectedType.id)
          : prev.customBio;

        return sanitizeAndRepairPlayerIdentity({
          ...prev,
          playerTypeId: selectedType.id,
          stats: updatedStats,
          ovr: calcOvr,
          customBio: updatedBio,
          ...(isWastedTalent
            ? {
                badReputationTier: 1,
                badReputation: 0,
              }
            : {}),
        });
      });

      // Starting nickname determined by chosen type and starting city
      const targetCity = player.startingCity || player.city;
      const startingNick = getStartingTypeNickname(selectedType.id, targetCity);

      setShowPlayerTypeModal(false);
      setPendingStartingNickname(startingNick);
      setIsStartingTypeNicknameTrigger(true);
      setShowNicknameModal(true);
      showToast(`🔥 Archetype Selected: ${selectedType.name}! Nickname event unlocked.`);
    },
    [player.startingCity, player.city, showToast]
  );

  const handleConfirmPosition = useCallback(
    (position: 'ATT' | 'MID' | 'DEF' | 'GK', subPosition: string) => {
      setPlayer((prev) => {
        const defaultPlaystyle = validateAndRepairPlaystyle(subPosition, prev.playStyle);
        const calculatedOvr = calculateWeightedOvr(position, subPosition, prev.stats, defaultPlaystyle);

        return sanitizeAndRepairPlayerIdentity({
          ...prev,
          position,
          subPosition,
          playStyle: defaultPlaystyle,
          ovr: calculatedOvr,
          age: 10,
        });
      });

      setShowPositionModal(false);
      setShowFinalConfirmationModal(true);
      showToast(`✨ Position Selected: ${position} (${subPosition}). Final Career Confirmation.`);
    },
    [showToast]
  );

  const handleConfirmParentCardIntro = useCallback(() => {
    setShowParentCardIntroModal(false);

    // Check Ex-Pro Footballer Parent Card: 10% chance for early nickname event immediately after career initialization
    const isExPro =
      selectedParentForIntro?.typeId === 'ex_pro_player' ||
      player.equippedParentCard?.typeId === 'ex_pro_player';

    if (isExPro && !player.hasHadNicknameEvent && Math.random() < 0.10) {
      setIsExProNicknameTrigger(true);
      setShowNicknameModal(true);
    } else {
      setShowEarlyCareerDecisionModal(true);
    }
  }, [selectedParentForIntro, player]);

  const handleFinalStartCareer = useCallback(() => {
    setShowFinalConfirmationModal(false);
    triggerConfetti({ particleCount: 180, spread: 100, origin: { y: 0.5 } });

    const parentCard = player.equippedParentCard || selectedParentForIntro;
    if (parentCard) {
      // Play introduction story for this unique parent card before early career choices!
      setShowParentCardIntroModal(true);
    } else {
      setShowEarlyCareerDecisionModal(true);
    }

    showToast(`🌟 UNIQUE CAREER INITIALIZED! Age 10 Prospect ready to conquer the football world.`);
  }, [showToast, selectedParentForIntro, player]);

  const handleAcceptIconicBreakthrough = useCallback(() => {
    setPlayer((prev) => {
      const currentPoints = prev.freeStatPoints ?? prev.unassignedPoints ?? 0;
      const remainingPoints = Math.max(0, currentPoints - 10);
      const newInternal = (prev.internalPotentialOvr ?? prev.potentialOvr ?? 99) + 1;
      return {
        ...prev,
        freeStatPoints: remainingPoints,
        unassignedPoints: remainingPoints,
        hasIconicPotentialBreakthrough: true,
        iconicPlayerEventCompleted: true,
        internalPotentialOvr: newInternal,
        potentialOvr: 99,
      };
    });
    setShowIconicPlayerModal(false);
    triggerConfetti();
    showToast('🌟 ICONIC BREAKTHROUGH ACTIVATED! -10 Stat Points spent. Tapped into unknown potential (+1 Internal Potential)!');
  }, [showToast]);

  const handleDismissIconicModal = useCallback(() => {
    setPlayer((prev) => ({
      ...prev,
      iconicPlayerEventCompleted: true,
      potentialOvr: 99,
    }));
    setShowIconicPlayerModal(false);
    showToast('Iconic Player milestone concluded (Remained at 99 Potential).');
  }, [showToast]);


  const handleCloseCareerLifecycleModal = useCallback(() => {
    setCareerLifecycleModalData(null);
    if (pendingAfterMilestoneFlow === 'ex_pro_nickname') {
      setPendingAfterMilestoneFlow(null);
      setShowNicknameModal(true);
    } else if (pendingAfterMilestoneFlow === 'early_career') {
      setPendingAfterMilestoneFlow(null);
      setShowEarlyCareerDecisionModal(true);
    }
  }, [pendingAfterMilestoneFlow]);

  const handleAcceptNicknameFromApp = useCallback(
    (updatedPlayer: PlayerCardData) => {
      setPlayer(updatedPlayer);
      setShowNicknameModal(false);
      setPendingFeatNickname(null);
      triggerConfetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

      if (isStartingTypeNicknameTrigger) {
        setIsStartingTypeNicknameTrigger(false);
        setPendingStartingNickname(null);
        showToast(`🎭 Starting Nickname Embraced: "${updatedPlayer.nickname}"! Matchday name is now "${updatedPlayer.name}".`);
        setShowPositionModal(true);
        return;
      }

      showToast(`🎭 Nickname Embraced! Matchday name is now "${updatedPlayer.name}".`);

      if (isExProNicknameTrigger) {
        setIsExProNicknameTrigger(false);
        setShowEarlyCareerDecisionModal(true);
      }
    },
    [isStartingTypeNicknameTrigger, isExProNicknameTrigger, showToast]
  );

  const handleDeclineNicknameFromApp = useCallback(
    (updatedPlayer: PlayerCardData) => {
      setPlayer(updatedPlayer);
      setShowNicknameModal(false);
      setPendingFeatNickname(null);

      if (isStartingTypeNicknameTrigger) {
        const discardedNick = pendingStartingNickname || updatedPlayer.nickname || 'Nickname';
        setIsStartingTypeNicknameTrigger(false);
        setPendingStartingNickname(null);
        showToast(`✨ Nickname "${discardedNick}" discarded. Retained birth name: "${updatedPlayer.name}". Saved to Customization!`);
        setShowPositionModal(true);
        return;
      }

      showToast(`✨ Nickname ignored. Retained real name: "${updatedPlayer.name}".`);

      if (isExProNicknameTrigger) {
        setIsExProNicknameTrigger(false);
        setShowEarlyCareerDecisionModal(true);
      }
    },
    [isStartingTypeNicknameTrigger, pendingStartingNickname, isExProNicknameTrigger, showToast]
  );

  const handleSelectEarlyCareerChoice = useCallback(
    (choice: EarlyCareerChoiceType) => {
      const targetCity = player.city || player.startingCity;

      if (choice === 'travel_big_club') {
        setShowStreetDevEventModal(false);
        setStreetDevEventData(null);
        setShowStreetCardModal(false);
        const youthTeam = getRandomBiggerYouthClub(targetCity);
        if (!youthTeam) {
          showToast('❌ DATABASE ERROR: No official Youth League team found for this city.');
          setShowEarlyCareerDecisionModal(true);
          return;
        }
        setShowEarlyCareerDecisionModal(false);
        setPlayer((prev) => {
          const base = applyBiggerYouthClubInitialState(prev, youthTeam.name);
          const updated: PlayerCardData = {
            ...base,
            league: youthTeam.divisionName,
            fame: (prev.fame || 0) + 5,
            youthLeagueTeam: youthTeam.name,
            youthAcademyTier: 'Youth Academy Top Tier',
            youthDevelopmentPoints: 20,
            youthStartingStatus: 'substitute',
            chemistry: Math.min(50, 80),
            playStyle: 'Basic',
            requestedTransfer: false,
          };
          const isGk = (updated.subPosition || updated.position || '').toUpperCase() === 'GK';
          const newOvr = isGk
            ? calculateWeightedOvr('GK', 'GK', updated.stats, 'Basic')
            : calculateWeightedOvr(updated.position || 'ST', updated.subPosition || updated.position || 'ST', updated.stats, 'Basic');
          return {
            ...updated,
            ovr: newOvr,
            overallRating: newOvr,
          };
        });
        setIsBigClubYouth(true);
        setShowYouthCinematicModal(true);
        triggerConfetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
        showToast(`✈️ Joined ${youthTeam.name}! Youth Academy Top Tier (20 Dev Points), -20 Stamina penalty, 80% Chemistry cap & starts as Substitute.`);
      } else if (choice === 'join_local') {
        setShowStreetDevEventModal(false);
        setStreetDevEventData(null);
        setShowStreetCardModal(false);
        const localTeam = getRandomLocalYouthClub(targetCity);
        if (!localTeam) {
          showToast('❌ DATABASE ERROR: No official Youth League team found for this city.');
          setShowEarlyCareerDecisionModal(true);
          return;
        }
        setShowEarlyCareerDecisionModal(false);
        setPlayer((prev) => {
          const cleansed = cleanseBiggerYouthClubPenalties(prev);
          const updated: PlayerCardData = {
            ...cleansed,
            club: localTeam.name,
            league: localTeam.divisionName,
            youthLeagueTeam: localTeam.name,
            youthLeagueStaminaPenalty: 0,
            youthAcademyTier: 'Average Youth Academy Tier',
            youthClubChoice: 'local_club',
            isBigClubYouth: false,
            youthDevelopmentPoints: 15,
            youthStartingStatus: 'starter',
            chemistry: 50,
            playStyle: 'Basic',
            requestedTransfer: false,
          };
          const isGk = (updated.subPosition || updated.position || '').toUpperCase() === 'GK';
          const newOvr = isGk
            ? calculateWeightedOvr('GK', 'GK', updated.stats, 'Basic')
            : calculateWeightedOvr(updated.position || 'ST', updated.subPosition || updated.position || 'ST', updated.stats, 'Basic');
          return {
            ...updated,
            ovr: newOvr,
            overallRating: newOvr,
          };
        });
        setIsBigClubYouth(false);
        setShowYouthCinematicModal(true);
        showToast(`🏠 Joined Local Club ${localTeam.name}! Basic development playstyle active.`);
      } else if (choice === 'play_streets') {
        setShowEarlyCareerDecisionModal(false);
        const oldAge = player.age || 10;
        const newAge = oldAge + 1;
        const streetResult = rollStreetFootballDevelopment(newAge);
        const currentPoints = player.freeStatPoints || player.unassignedPoints || 0;
        const totalPoints = currentPoints + streetResult.points;

        const physicalGrowth = calculateAnnualPhysicalGrowth(player);

        const startYear = 2026 + (oldAge - 10);
        const seasonYear = `${startYear}/${(startYear + 1).toString().slice(-2)}`;

        const newSeasonRecord: CareerSeasonRecord = {
          seasonYear,
          age: oldAge,
          teamName: 'Street Football',
          squadLevel: 'Street',
          competitionName: 'Street Football Pitches',
          isYouth: true,
          matches: 24,
          goals: Math.floor(Math.random() * 15) + 5,
          assists: Math.floor(Math.random() * 10) + 3,
          avgRating: Number((7.0 + Math.random() * 1.5).toFixed(2)),
          trophiesWon: [],
          awardsWon: [],
          salaryAnnual: 0,
          sponsorsIncome: 0,
          ovrStart: player.ovr || 50,
          ovrEnd: player.ovr || 50,
          standingRank: 1,
          promoted: false,
          relegated: false,
          qualificationOutcome: 'Street Respect',
          statsGained: [`+${streetResult.points} Stat PTS (${streetResult.message})`],
          keyHighlight: `Competed in street cages and asphalt pitches across local boroughs.`,
        };

        const existingSeasons = player.careerHistory?.seasonsPlayed || [];
        const updatedSeasons = [
          ...existingSeasons.filter((s) => s.age !== oldAge),
          newSeasonRecord,
        ].sort((a, b) => a.age - b.age);

        const updatedCareerHistory: FullCareerHistory = {
          ...(player.careerHistory || compileFullCareerHistory(player)),
          seasonsPlayed: updatedSeasons,
        };

        // Apply Preseason Upgrades (e.g. Complete Performance Complex +5 PTS, Home Gym, Pro Kitchen)
        let candidatePlayer: PlayerCardData = {
          ...player,
          age: newAge,
          heightCm: physicalGrowth.newHeight,
          weightKg: physicalGrowth.newWeight,
          hasHadGrowthSpurt: physicalGrowth.hasHadGrowthSpurt,
          lastYearGrowthCm: physicalGrowth.growthCm,
          lastYearWasGrowthSpurt: physicalGrowth.isGrowthSpurt,
          club: 'Free Agent',
          league: 'Street Football',
          youthLeagueTeam: undefined,
          youthTeamName: undefined,
          youthLeagueName: undefined,
          freeStatPoints: totalPoints,
          unassignedPoints: totalPoints,
          careerHistory: updatedCareerHistory,
        };
        candidatePlayer = cleanseBiggerYouthClubPenalties(candidatePlayer);

        const upgResult = applyPreseasonUpgrades(candidatePlayer, storeItems);
        candidatePlayer = upgResult.updatedPlayer;

        // Apply Age 33+ physical regression
        const hasPerfCenter = Boolean(
          candidatePlayer.bonusRetirementYears ||
          storeItems.some((i) => i.id === 'upg_perf_center' && i.unlocked)
        );
        const regressionResult = applyAgePhysicalRegression(candidatePlayer, newAge, hasPerfCenter);
        candidatePlayer = regressionResult.updatedPlayer;

        setPlayer(candidatePlayer);

        // Preseason financial payout
        if (accounting) {
          const yearlySalary = accounting.yearlySalary || 0;
          const sponsorsIncome = (accounting.sponsors || [])
            .filter((s) => s.active !== false)
            .reduce((sum, s) => sum + (s.yearlyPayment || 0), 0);
          const businessesProfit = (accounting.businesses || [])
            .reduce((sum, b) => sum + (b.netProfit || 0), 0);
          const totalPreseasonEarnings = yearlySalary + sponsorsIncome + businessesProfit;
          if (totalPreseasonEarnings > 0) {
            setAccounting((prev) => ({
              ...prev,
              totalSavings: (prev.totalSavings || 0) + totalPreseasonEarnings,
            }));
            showToast(`💰 Pre-Season Bank Deposit: +€${totalPreseasonEarnings.toLocaleString()} added to savings!`);
          }
        }

        // Check Career Lifecycle Milestones (Age 20, 28, 33)
        if (newAge === 20 || newAge === 28 || newAge === 33) {
          setCareerLifecycleModalData({ type: `age_${newAge}` as any, age: newAge });
        }

        setStreetDevEventData({
          points: streetResult.points,
          message: streetResult.message,
          tier: streetResult.tier,
          age: newAge,
          totalPoints: candidatePlayer.freeStatPoints || totalPoints,
        });
        setShowStreetDevEventModal(true);

        const hasManager = Boolean(manager?.name || (player as any).managerState?.name || (player as any).managerName);
        const drawn = drawThreeStreetCards(newAge, hasManager);
        setDrawnStreetCards(drawn);
        showToast(`🔥 Playing on the Streets! Advanced 1 Year (Now Age ${newAge}). +${streetResult.points} Stat Points! "${streetResult.message}"`);
      } else if (choice === 'tryout_pro') {
        setShowEarlyCareerDecisionModal(false);
        const tryout = calculateTryoutSuccessRate(player);
        const roll = Math.random() * 100;

        if (roll <= tryout.successRate || tryout.isGuaranteedFame) {
          // SUCCESS! Generates contract offer using Universal Club Proposal System
          const offers = generateFirstContractUnifiedOffers(player, manager, 1);
          setUnifiedClubOffers(offers);
          setShowUnifiedClubOfferModal(true);
          triggerConfetti({ particleCount: 200, spread: 100, origin: { y: 0.4 } });
          showToast(`🎉 PRO TRYOUT SUCCESS! Professional contract offered by ${offers[0]?.buyerClub?.clubName || 'a professional club'}!`);
        } else {
          // FAILURE! Advance 1 year with no special cards or modifiers
          const newAge = (player.age || 10) + 1;
          setPlayer((prev) => ({
            ...prev,
            age: newAge,
          }));
          showToast(`❌ PRO TRYOUT FAILED! No professional contract offered. 1 Year Wasted (Now Age ${newAge}). Choose another path.`);
          setShowEarlyCareerDecisionModal(true);
        }
      } else if (choice === 'look_agent' || choice === 'speak_agent') {
        setShowEarlyCareerDecisionModal(false);
        setShowFreeAgentHubModal(true);
      }
    },
    [player, manager, showToast]
  );

  const handleProceedFromYouthCinematic = useCallback(() => {
    setShowYouthCinematicModal(false);
    setShowYouthManagerMeetingModal(true);
  }, []);

  const handleConfirmYouthManagerRole = useCallback(
    (chosenSubPosition: string, acceptedProposal: boolean) => {
      setPlayer((prev) => {
        const sanitized = sanitizeAndRepairPlayerIdentity(prev);
        const validSubs = getValidSubPositionsForCategory(sanitized.position as string);
        const finalSub = validSubs.includes(chosenSubPosition) ? chosenSubPosition : sanitized.subPosition;
        
        let updated: PlayerCardData = sanitizeAndRepairPlayerIdentity({
          ...sanitized,
          subPosition: finalSub,
          playStyle: 'Basic',
        });

        const isGk = (updated.subPosition || updated.position || '').toUpperCase() === 'GK';
        const newOvr = isGk
          ? calculateWeightedOvr('GK', 'GK', updated.stats, 'Basic')
          : calculateWeightedOvr(updated.position || 'ST', updated.subPosition || updated.position || 'ST', updated.stats, 'Basic');
        updated.ovr = newOvr;
        updated.overallRating = newOvr;

        if (!acceptedProposal) {
          updated = applyDefiancePenalty(
            updated,
            "Defied Youth Coach's Tactical Sub-Position Proposal",
            12
          );
        }

        return updated;
      });
      setShowYouthManagerMeetingModal(false);
      setCareerLifecycleModalData({ type: 'age_10', age: player.age || 10 });
      setShowYouthSeasonDashboardModal(true);
      showToast(
        acceptedProposal
          ? (t('TOAST_YOUTH_ROLE_ACCEPTED', { role: chosenSubPosition }) || `✅ Tactical Role Accepted: ${chosenSubPosition}. Youth Season Hub Unlocked!`)
          : (t('TOAST_YOUTH_ROLE_DEFIDED', { role: chosenSubPosition }) || `⚠️ Role Changed to ${chosenSubPosition}. Defied Coach: This will affect your integration into the team and how fast you adapt.`)
      );
    },
    [showToast, player.age, t]
  );

  const handleTriggerFirstContractFromYouth = useCallback((_offers?: ProContractOffer[]) => {
    setPlayer((prev) => cleanseBiggerYouthClubPenalties(prev));
    const offers = generateFirstContractUnifiedOffers(player, manager, 3);
    setUnifiedClubOffers(offers);
    setShowYouthSeasonDashboardModal(false);
    setShowUnifiedClubOfferModal(true);
  }, [player, manager]);

  const handleTriggerYouthLeagueExit = useCallback(() => {
    setPlayer((prev) => cleanseBiggerYouthClubPenalties(prev));
    setShowYouthSeasonDashboardModal(false);
    setShowEarlyCareerDecisionModal(true);
  }, []);

  const handleTriggerStreetCards = useCallback(() => {
    const hasManager = Boolean(manager?.name || (player as any).managerState?.name || (player as any).managerName);
    const drawn = drawThreeStreetCards(player.age || 16, hasManager);
    setDrawnStreetCards(drawn);
    setShowStreetCardModal(true);
  }, [player.age, (player as any).managerState, manager]);

  const handleContinueFromStreetDevEvent = useCallback(() => {
    setShowStreetDevEventModal(false);
    setShowStreetCardModal(true);
  }, []);

  const handleSelectStreetCard = useCallback(
    (card: StreetCardInstance) => {
      setShowStreetCardModal(false);
      const { updatedPlayer, triggersFirstContract } = applyStreetCardToPlayer(player, card);
      setPlayer(updatedPlayer);

      showToast(`⚽ Street Card Choice: ${card.name} (${card.rarity.toUpperCase()}) Obtained! Permanent career effects applied.`);

      if (triggersFirstContract) {
        const offers = generateFirstContractUnifiedOffers(updatedPlayer, manager, 3);
        setUnifiedClubOffers(offers);
        setShowUnifiedClubOfferModal(true);
        triggerConfetti({ particleCount: 200, spread: 100, origin: { y: 0.4 } });
        showToast(`⭐ ICONIC STREET SCOUT DISCOVERED YOU! First Contract Opportunity unlocked!`);
      } else {
        // Return to the FOUR CAREER CHOICES loop
        setShowEarlyCareerDecisionModal(true);
      }
    },
    [player, manager, showToast]
  );

  const handleAcceptFirstContract = useCallback(
    (offer: ProContractOffer) => {
      setShowFirstContractModal(false);
      setPendingProContractOffer(offer);
      setShowManagerPlaystyleModal(true);
    },
    []
  );

  // SUGGESTED ACTIONS QUICK-ACTION HANDLERS
  const handleSuggestedRecoverFitness = useCallback(() => {
    const points = player.recoveryPoints || 0;
    if (points <= 0) {
      showToast('❌ No Injury Recovery Points available!');
      return;
    }
    if (player.isInjured) {
      const res = useRecoveryPoint(player);
      if (res.success) {
        setPlayer(res.updatedPlayer);
      }
      showToast(res.message);
    } else {
      const currentFitness = getFitnessPercentage(player);
      const newFitness = Math.min(100, currentFitness + 20);
      const newPoints = points - 1;
      setPlayer((prev) => ({
        ...prev,
        fitness: newFitness,
        staminaCurrent: newFitness,
        recoveryPoints: newPoints,
      }));
      showToast(`⚡ Physical condition restored +20%! (${newFitness}%, ${newPoints} Points Left)`);
    }
  }, [player, showToast]);

  const handleSuggestedUseSupplement = useCallback(() => {
    const supplements = player.recoverySupplements || 0;
    if (supplements <= 0) {
      showToast('❌ No Recovery Supplements in inventory!');
      return;
    }
    setPlayer((prev) => ({
      ...prev,
      fitness: 100,
      staminaCurrent: 100,
      recoverySupplements: supplements - 1,
    }));
    showToast(`⚡ Recovery Supplement Used! Physical condition restored to 100% (${supplements - 1} left).`);
  }, [player, showToast]);

  const handleSuggestedBuySupplement = useCallback(() => {
    setIsPersistentUiVisible(true);
    setActiveOverlayPanel('store');
    showToast('🛒 Navigated to Store: Purchase a Recovery Supplement (€10,000).');
  }, [showToast]);

  const handleSuggestedRestRehab = useCallback(() => {
    const currentFitness = getFitnessPercentage(player);
    const newFitness = Math.min(100, currentFitness + 30);
    setPlayer((prev) => ({
      ...prev,
      fitness: newFitness,
      staminaCurrent: newFitness,
    }));
    showToast(`😴 Rest & Rehabilitation completed! Fitness restored to ${newFitness}%.`);
  }, [player, showToast]);

  const handleSuggestedAssignStatPoints = useCallback(() => {
    setIsPersistentUiVisible(true);
    setActiveOverlayPanel('development');
    showToast('📈 Navigated to Development: Assign your unassigned attribute points!');
  }, [showToast]);

  const handleSuggestedTrain = useCallback(() => {
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
    setPlayer(updated);
    showToast(result.message);
  }, [player, showToast]);

  const handleSuggestedBuyProEquipment = useCallback(() => {
    setIsPersistentUiVisible(true);
    setActiveOverlayPanel('store');
    showToast('🛒 Navigated to Store: Buy Pro Equipment for performance benefits!');
  }, [showToast]);

  const handleSuggestedBuySeasonBoost = useCallback(() => {
    setIsPersistentUiVisible(true);
    setActiveOverlayPanel('store');
    showToast('🛒 Navigated to Store: Buy Season Boost for development acceleration!');
  }, [showToast]);

  const handleSuggestedBuyProperty = useCallback(() => {
    setIsPersistentUiVisible(true);
    setActiveOverlayPanel('accounting');
    showToast('🏢 Navigated to Accounting: Purchase new property/business investments!');
  }, [showToast]);

  const handleSuggestedUpgradeProperty = useCallback(() => {
    setIsPersistentUiVisible(true);
    setActiveOverlayPanel('accounting');
    showToast('📈 Navigated to Accounting: Upgrade your property tier!');
  }, [showToast]);

  const handleSuggestedImproveChemistry = useCallback(() => {
    setIsPersistentUiVisible(true);
    setActiveOverlayPanel('development');
    showToast('🧪 Navigated to Team Synergy: Improve team chemistry!');
  }, [showToast]);

  const suggestedActionCallbacks: SuggestedActionCallbacks = {
    onRecoverFitness: handleSuggestedRecoverFitness,
    onUseRecoverySupplement: handleSuggestedUseSupplement,
    onBuyRecoverySupplement: handleSuggestedBuySupplement,
    onRestRehab: handleSuggestedRestRehab,
    onAssignStatPoints: handleSuggestedAssignStatPoints,
    onTrain: handleSuggestedTrain,
    onBuyProEquipment: handleSuggestedBuyProEquipment,
    onBuySeasonBoost: handleSuggestedBuySeasonBoost,
    onBuyProperty: handleSuggestedBuyProperty,
    onUpgradeProperty: handleSuggestedUpgradeProperty,
    onImproveChemistry: handleSuggestedImproveChemistry,
  };

  const handleConfirmManagerPlaystyle = useCallback(
    (chosenPlaystyle: string, acceptedManagerStyle: boolean) => {
      if (!pendingProContractOffer) return;

      const offer = pendingProContractOffer;
      setShowManagerPlaystyleModal(false);
      setShowYouthSeasonDashboardModal(false);
      setShowStreetDevEventModal(false);
      setStreetDevEventData(null);
      setShowStreetCardModal(false);

      setPlayer((prev) => {
        let updated = ensureProgressionIntegrityOnProTransition(prev, {
          clubName: offer.clubName,
          leagueName: offer.leagueName,
          countryName: offer.countryName,
          countryCode: offer.countryCode,
          squadDestination: offer.initialSquadDestination || 'First Team',
          playingTimeExpectation: offer.playingTimeExpectation,
          chosenPlaystyle: chosenPlaystyle,
          fameBonus: 10,
          chemistryBonus: 50,
          recoverySupplementsBonus: 1,
        });

        // Verification check
        const verification = verifyProgressionIntegrity(prev, updated);
        console.log('[PRO TRANSITION CHECK]', verification.details);

        updated.isFreeAgent = false;
        updated.contractYearsRemaining = offer.contractYears;
        const mv = calculatePlayerMarketValue(updated).marketValue;
        updated.marketValue = mv;

        if (!acceptedManagerStyle) {
          updated = applyDefiancePenalty(
            updated,
            `Defied Manager's Tactical Playstyle (${chosenPlaystyle} vs ${offer.expectedPlaystyle})`,
            12
          );
        }

        return updated;
      });

      setAccounting((prev) => ({
        ...prev,
        contractYears: offer.contractYears,
        yearlySalary: offer.yearlySalary || offer.weeklyWage * 52,
        transferStatus: 'not_listed',
      }));

      triggerConfetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });

      setFirstContractIntroOffer(offer);
      setShowFirstContractIntroModal(true);

      if (acceptedManagerStyle) {
        showToast(
          t('TOAST_PRO_OFFER_ACCEPTED', { style: chosenPlaystyle }) ||
            `✅ Tactical Playstyle Accepted: ${chosenPlaystyle}! Optimal team cohesion established.`
        );
      } else {
        showToast(
          t('TOAST_PRO_OFFER_DEFIDED', { style: chosenPlaystyle }) ||
            `⚠️ Custom Playstyle Chosen: ${chosenPlaystyle}. Defied Manager: This will affect your integration into the team and how fast you adapt.`
        );
      }
    },
    [pendingProContractOffer, showToast, t]
  );

  const handleProceedFromFirstContractIntro = useCallback(() => {
    setShowFirstContractIntroModal(false);
    setShowYouthGraduationModal(true);
  }, []);

  const handleCompleteYouthGraduation = useCallback(() => {
    setShowYouthGraduationModal(false);
    setIsPersistentUiVisible(true);
    setShowYouthSeasonDashboardModal(true); // Open Pro Career Season Hub!
    showToast(`⭐ Professional Career Stage Started with ${firstContractIntroOffer?.clubName || 'your new club'}!`);
  }, [firstContractIntroOffer, showToast]);

  const handleOpenArabianMegaOffer = useCallback((offer: ClubTransferOffer) => {
    setShowTransferInterestModal(false);
    setPendingSaudiOffer(offer);
    setShowArabianMegaOfferModal(true);
  }, []);

  const handleAcceptArabianMegaOffer = useCallback(
    (offer: ClubTransferOffer) => {
      setShowArabianMegaOfferModal(false);
      setPendingSaudiOffer(null);

      setPlayer((prev) => {
        const updated: PlayerCardData = rebuildPlayerCompetitiveContextOnTransfer(
          prev,
          offer.buyerClub.clubName,
          {
            isFreeAgent: false,
            contractYearsRemaining: offer.contractYears || 3,
            hasSeenSaudiOfferEvent: true,
          } as any
        );
        return updated;
      });

      const bonus = offer.signingBonus || Math.round((offer.yearlySalary || 45000000) * 0.20);
      setAccounting((prev) => ({
        ...prev,
        contractYears: offer.contractYears || 3,
        yearlySalary: offer.yearlySalary || offer.weeklyWage * 52,
        transferStatus: 'not_listed',
        totalSavings: (prev.totalSavings || 0) + bonus,
      }));

      triggerConfetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      showToast(`💰 MEGA CONTRACT SIGNED WITH ${offer.buyerClub.clubName}!`);

      // Trigger the story event for the Mercenary perk
      handleTriggerPerkUnlock('mercenary');
    },
    [showToast, handleTriggerPerkUnlock]
  );

  const handleDeclineArabianMegaOffer = useCallback(
    (offerId?: string) => {
      setShowArabianMegaOfferModal(false);
      setPendingSaudiOffer(null);
      setPlayer((prev) => ({
        ...prev,
        hasSeenSaudiOfferEvent: true,
      }));
      if (offerId) {
        setActiveTransferOffers((prev) => prev.filter((o) => o.id !== offerId));
      }
      showToast('❌ Arabian mega offer declined. Committed to European sporting glory!');
    },
    [showToast]
  );

  const executeTransferAfterBetrayalCheck = useCallback(
    (
      offer: ClubTransferOffer | UnifiedClubOffer,
      isUnified: boolean,
      isBetrayalConfirmed: boolean,
      betrayalData?: RivalBetrayalCheckResult
    ) => {
      const isSaudi = isUnified
        ? !(offer as UnifiedClubOffer).isRenewalOffer && ((offer as UnifiedClubOffer).isSaudiMegaOffer || (offer as UnifiedClubOffer).buyerClub.leagueName?.includes('Saudi'))
        : isSaudiClubOffer(offer as ClubTransferOffer);

      const buyerClubName = offer.buyerClub.clubName;
      const contractYears = offer.contractYears;
      const yearlySalary = isUnified
        ? (offer as UnifiedClubOffer).yearlySalary
        : (offer as ClubTransferOffer).yearlySalary || (offer as ClubTransferOffer).weeklyWage * 52;
      const releaseClause = isUnified ? (offer as UnifiedClubOffer).releaseClause : undefined;
      const proposedSquad = isUnified ? (offer as UnifiedClubOffer).proposedSquad : undefined;
      const expectedRole = isUnified ? (offer as UnifiedClubOffer).expectedRole : undefined;

      const bonus = isUnified
        ? ((offer as UnifiedClubOffer).signingBonus || 0) + ((offer as UnifiedClubOffer).playerTransferFeeCutAmount || 0)
        : ((offer as ClubTransferOffer).signingBonus || Math.round((yearlySalary || 5000000) * (isSaudi ? 0.20 : 0.12))) +
          Math.round(((offer as ClubTransferOffer).offeredFee || 0) * (((offer as ClubTransferOffer).playerTransferFeeCutPercent || 7) / 100));

      let updatedPlayerState: PlayerCardData | null = null;

      setPlayer((prev) => {
        const existingBetrayed = prev.betrayedClubs || [];
        const updatedBetrayed = isBetrayalConfirmed && betrayalData
          ? Array.from(new Set([...existingBetrayed, betrayalData.betrayedClub]))
          : existingBetrayed;

        const updated: PlayerCardData = rebuildPlayerCompetitiveContextOnTransfer(
          prev,
          buyerClubName,
          {
            isFreeAgent: false,
            contractYearsRemaining: contractYears,
            squadDestination: proposedSquad || prev.squadDestination || 'First Team',
            squadRole: expectedRole || prev.squadRole || 'Key Player',
            releaseClause,
            hasSeenSaudiOfferEvent: isSaudi ? true : prev.hasSeenSaudiOfferEvent,
            hasSnakePerk: isBetrayalConfirmed ? true : prev.hasSnakePerk,
            betrayedClubs: updatedBetrayed,
          } as any
        );

        if (isBetrayalConfirmed) {
          const earnRes = earnPerk(updated, 'snake');
          if (earnRes.requiresReplacement) {
            setPendingNewPerk(getPerkById('snake') || null);
            setShowPerkReplacementModal(true);
            updatedPlayerState = updated;
            return updated;
          } else {
            updatedPlayerState = earnRes.updatedPlayer;
            return earnRes.updatedPlayer;
          }
        }

        updatedPlayerState = updated;
        return updated;
      });

      setAccounting((prev) => ({
        ...prev,
        contractYears,
        yearlySalary,
        releaseClause,
        transferStatus: 'not_listed',
        totalSavings: (prev.totalSavings || 0) + bonus,
      }));

      triggerConfetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      if (isSaudi) {
        showToast(`💰 MEGA TRANSFER COMPLETE! Joined ${buyerClubName}! Bonus: +€${bonus.toLocaleString()}`);
        handleTriggerPerkUnlock('mercenary');
      } else {
        showToast(`✍️ CONTRACT SIGNED with ${buyerClubName}! Bonus: +€${bonus.toLocaleString()}`);
      }

      if (isBetrayalConfirmed && betrayalData) {
        setFigoBetrayalModalData({
          isOpen: true,
          betrayedClub: betrayalData.betrayedClub,
          destinationClub: buyerClubName,
          rivalryName: betrayalData.rivalryName,
        });
      }
    },
    [showToast, handleTriggerPerkUnlock]
  );

  const handleAcceptTransferOffer = useCallback(
    (offer: ClubTransferOffer) => {
      setShowTransferInterestModal(false);

      // Check if this transfer constitutes a direct betrayal to an arch-rival
      const betrayalCheck = checkRivalBetrayalTransfer(player, offer.buyerClub.clubName);

      if (betrayalCheck.isBetrayal && !player.hasSnakePerk && !hasPerk(player, 'snake')) {
        setPendingJudasBetrayalData({
          betrayalData: betrayalCheck,
          offer,
          isUnified: false,
          transferFeeFormatted: offer.formattedFee,
          weeklyWageFormatted: `€${offer.weeklyWage?.toLocaleString() || '150,000'}/wk`,
        });
        return;
      }

      executeTransferAfterBetrayalCheck(offer, false, false);
    },
    [player, executeTransferAfterBetrayalCheck]
  );

  const handleAcceptUnifiedClubOffer = useCallback(
    (offer: UnifiedClubOffer) => {
      setShowUnifiedClubOfferModal(false);
      const isRenewal = offer.isRenewalOffer || offer.transferType === 'club_renewal' || offer.buyerClub.clubName === player.club;
      const totalBonus = (offer.signingBonus || 0) + (offer.playerTransferFeeCutAmount || 0);

      if (isRenewal) {
        setPlayer((prev) => ({
          ...prev,
          isFreeAgent: false,
          contractYearsRemaining: offer.contractYears,
          squadDestination: offer.proposedSquad || prev.squadDestination || 'First Team',
          squadRole: offer.expectedRole || prev.squadRole || 'Key Player',
          releaseClause: offer.releaseClause,
          chemistry: Math.min(100, (prev.chemistry || 50) + 15),
          requestedTransfer: false,
        }));

        setAccounting((prev) => ({
          ...prev,
          contractYears: offer.contractYears,
          yearlySalary: offer.yearlySalary,
          releaseClause: offer.releaseClause,
          transferStatus: 'not_listed',
          totalSavings: (prev.totalSavings || 0) + totalBonus,
        }));

        triggerConfetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
        showToast(
          `✍️ CONTRACT RENEWED with ${player.club}! Extended for ${offer.contractYears} years at €${offer.yearlySalary.toLocaleString()}/yr (+€${totalBonus.toLocaleString()} Loyalty Bonus).`
        );
        return;
      }

      // If this is a first professional contract (transitioning from youth academy, street scout, or pro tryout),
      // launch the Manager Playstyle Meeting so the coach can assign tactical playstyle or handle rebuttal
      const isFirstProContract =
        offer.transferType === 'first_contract' ||
        offer.transferType === 'tryout_contract' ||
        player.careerStage === 'YOUTH' ||
        !player.isProPlayer;

      if (isFirstProContract) {
        const proOffer: ProContractOffer = {
          id: offer.id,
          clubName: offer.buyerClub.clubName,
          clubBadgeBg: offer.clubBadgeBg,
          countryName: offer.countryName,
          countryCode: offer.countryCode,
          leagueName: offer.leagueName,
          leagueTier: offer.leagueTier,
          isEuropean: offer.isEuropean,
          squadRole: (offer.squadRole as any) || 'First Team Regular',
          expectedRole: (offer.expectedRole as any) || 'Starter',
          playingTimeExpectation: offer.playingTimeExpectation,
          initialSquadDestination: (offer.initialSquadDestination as any) || offer.proposedSquad || 'First Team',
          roleDescription: offer.roleDescription,
          managerName: offer.managerName,
          managerNationality: offer.managerNationality,
          managerTacticalStyle: offer.managerTacticalStyle,
          managerFormation: offer.managerFormation,
          expectedPosition: offer.expectedPosition,
          expectedSubPosition: offer.expectedSubPosition,
          tacticalRole: offer.tacticalRole,
          expectedPlaystyle: offer.expectedPlaystyle,
          yearlySalary: offer.yearlySalary,
          weeklyWage: offer.weeklyWage,
          contractYears: offer.contractYears,
          signingBonus: totalBonus,
          minOvrRequired: 40,
          matchesProfile: true,
          prestigeStars: offer.prestigeStars,
          clubFame: offer.clubFame,
          developmentTier: offer.developmentTier,
          developmentTierName: offer.developmentTierName,
          developmentPhilosophy: offer.developmentPhilosophy,
          youthDevelopmentPoints: offer.youthDevelopmentPoints,
        };
        setPendingProContractOffer(proOffer);
        setShowManagerPlaystyleModal(true);
        return;
      }

      // Check if this transfer constitutes a direct betrayal to an arch-rival
      const betrayalCheck = checkRivalBetrayalTransfer(player, offer.buyerClub.clubName);

      if (betrayalCheck.isBetrayal && !player.hasSnakePerk && !hasPerk(player, 'snake')) {
        setPendingJudasBetrayalData({
          betrayalData: betrayalCheck,
          offer,
          isUnified: true,
          transferFeeFormatted: offer.formattedFee,
          weeklyWageFormatted: `€${offer.weeklyWage?.toLocaleString() || '150,000'}/wk`,
        });
        return;
      }

      executeTransferAfterBetrayalCheck(offer, true, false);
    },
    [player, showToast, executeTransferAfterBetrayalCheck]
  );

  const handleConfirmJudasBetrayal = useCallback(() => {
    if (!pendingJudasBetrayalData) return;
    const { offer, isUnified, betrayalData } = pendingJudasBetrayalData;
    setPendingJudasBetrayalData(null);
    executeTransferAfterBetrayalCheck(offer, isUnified, true, betrayalData);
  }, [pendingJudasBetrayalData, executeTransferAfterBetrayalCheck]);

  const handleRejectJudasBetrayal = useCallback(() => {
    if (pendingJudasBetrayalData) {
      showToast(`🛡️ ${t('Treachery Rejected! You chose club loyalty over crossing to')} ${pendingJudasBetrayalData.betrayalData.destinationClub}.`);
      setPendingJudasBetrayalData(null);
    }
  }, [pendingJudasBetrayalData, showToast, t]);

  const handleRejectTransferOffer = useCallback(
    (offerId: string) => {
      setActiveTransferOffers((prev) => prev.filter((o) => o.id !== offerId));
      showToast('❌ Transfer offer declined.');
    },
    [showToast]
  );

  // ==========================================
  // SPECIAL CLUB TRANSFER & SIGNING HANDLERS
  // ==========================================
  const handleSelectSpecialClubFromChoice = useCallback(
    (selectedEvaluation: SpecialClubEvaluation) => {
      setShowSpecialClubChoiceModal(false);
      setActiveSpecialSigningEvaluation(selectedEvaluation);
      setShowSpecialSigningChainModal(true);
    },
    []
  );

  const handleCompleteSpecialTransferToUniversalOffer = useCallback(
    (evaluation: SpecialClubEvaluation) => {
      setShowSpecialSigningChainModal(false);
      const unifiedOffer = convertSpecialEvaluationToUnifiedOffer(
        evaluation,
        player,
        accounting,
        manager
      );
      setUnifiedClubOffers([unifiedOffer]);
      setShowUnifiedClubOfferModal(true);
      showToast(`⭐ Transfer agreed! Review and ratify your contract with ${evaluation.config.name}.`);
    },
    [player, accounting, manager, showToast]
  );

  const handleExplicitRejectBigThree = useCallback(
    (clubId: SpecialClubId) => {
      setPlayer((prev) => recordSpecialClubExplicitRejection(prev, clubId));
      showToast(`🚫 Explicit Rejection: ${clubId.replace('_', ' ').toUpperCase()} permanently removed from future interest.`);
    },
    [showToast]
  );

  const handleRejectPsg = useCallback(() => {
    setPlayer((prev) => recordSpecialClubExplicitRejection(prev, 'psg'));
    showToast(`ℹ️ PSG proposal declined. Future interest will decay over upcoming windows.`);
  }, [showToast]);

  const handleRejectSaudiTemporary = useCallback(() => {
    setPlayer((prev) => recordSpecialClubExplicitRejection(prev, 'saudi_pro_league', false));
    showToast(`ℹ️ Saudi Pro League proposal dismissed. They may return in future transfer windows.`);
  }, [showToast]);

  const handleRejectSaudiPermanent = useCallback(() => {
    setPlayer((prev) => recordSpecialClubExplicitRejection(prev, 'saudi_pro_league', true));
    showToast(`🚫 Permanent Dismissal: Saudi Pro League will never submit transfer proposals again.`);
  }, [showToast]);

  const handleSpecialFailedTransferToDecay = useCallback(
    (clubId: SpecialClubId) => {
      setPlayer((prev) => recordSpecialClubFailedTransfer(prev, clubId));
      showToast(`⏳ Failed Transfer: ${clubId.replace('_', ' ').toUpperCase()} transfer collapsed. They will monitor you for future retry windows.`);
    },
    [showToast]
  );

  const handleSpecialHostagePenalty = useCallback(() => {
    setPlayer((prev) => applyHostagePenalty(prev));
    showToast(`🔒 HOSTAGE SANCTION: Banished to the Reserves for 6 months! Matchday appearances blocked.`);
  }, [showToast]);

  const handleOpenSpecialChoiceModalDirect = useCallback(
    (customClubIds?: string[]) => {
      const activeIds: SpecialClubId[] = (customClubIds as SpecialClubId[]) || [
        'real_madrid',
        'psg',
        'saudi_pro_league',
      ];
      const evals = activeIds.map((id) => evaluateSpecialClubInterest(player, id, false));
      const dilemma = categorizeSpecialChoiceDilemma(evals);
      setSpecialChoiceData(dilemma);
      setShowSpecialClubChoiceModal(true);
    },
    [player]
  );

  const handleOpenSpecialSigningChainDirect = useCallback(
    (clubId: string) => {
      const evalObj = evaluateSpecialClubInterest(player, clubId as SpecialClubId, false);
      setActiveSpecialSigningEvaluation(evalObj);
      setShowSpecialSigningChainModal(true);
    },
    [player]
  );

  const handleOpenSpecialRetryModalDirect = useCallback(
    (clubId: string) => {
      const evalObj = evaluateSpecialClubInterest(player, clubId as SpecialClubId, true, 1);
      setActiveSpecialRetryEvaluation(evalObj);
      setShowSpecialRetryModal(true);
    },
    [player]
  );

  const handleDeclineFirstContractAll = useCallback(() => {
    setShowFirstContractModal(false);
    if (!isProfessionalPlayer(player) && ((player.age || 10) >= 17 || player.league === 'Street Football' || player.club === 'Free Agent' || !player.youthLeagueTeam)) {
      setShowEarlyCareerDecisionModal(true);
    } else {
      setShowYouthSeasonDashboardModal(true);
    }
  }, [player]);

  const handlePlayerChange = useCallback((updated: PlayerCardData) => {
    const newTier = getCardTier(updated.ovr);
    if (newTier === 'goat' && prevTierRef.current !== 'goat') {
      triggerConfetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
      showToast('⚡ UNLOCKED GOAT TIER!');
    }
    prevTierRef.current = newTier;
    setPlayer(updated);
  }, [showToast]);

  const handleTrophiesChange = useCallback((updatedTrophies: any[]) => {
    setPlayer((prev) => ({
      ...prev,
      trophies: updatedTrophies,
    }));
  }, []);

  const handleSelectSpecialHair = useCallback((specialHairType: any) => {
    setPlayer((prev) => ({
      ...prev,
      biometrics: {
        ...prev.biometrics,
        hairStyle: 'special',
        specialHair: specialHairType,
      },
    }));
  }, []);

  const handleRandomize = useCallback(() => {
    const randomNat = NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)];
    const randomSkin = SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)].hex;
    const hairStyles = ['straight', 'wavy', 'curly', 'braided', 'dreads'] as const;
    const hairLengths = ['shaved', 'fade', 'short', 'medium', 'long'] as const;
    const randomStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    const randomLength = hairLengths[Math.floor(Math.random() * hairLengths.length)];
    const randomRoot = HAIR_ROOT_COLORS[Math.floor(Math.random() * HAIR_ROOT_COLORS.length)].hex;

    const firstNames = [
      'Lucas', 'Mateo', 'Enzo', 'Julian', 'Gabriel', 'Kylian', 'Pedri', 'Luka',
      'Sandro', 'Viktor', 'Leo', 'Nico', 'Hugo', 'Diego', 'Tiago', 'Thiago',
      'Noah', 'Liam', 'Oliver', 'Ethan', 'Carlos', 'Bruno', 'Marco', 'Oscar',
      'Felix', 'Kai', 'Max', 'Paul', 'Ray', 'Theo', 'Milan', 'Santi', 'Elias'
    ];
    const randomFirstName = formatPersonName(firstNames[Math.floor(Math.random() * firstNames.length)]);
    const randomPreferredFoot: 'Left' | 'Right' = Math.random() > 0.5 ? 'Left' : 'Right';

    const rawStats = {
      pro: 40,
      def: 40,
      cre: 40,
      men: 40,
      goa: 40,
      phy: 40,
    };

    // Keep existing kit and team assignments unchanged during random character creation, with standard clean crew collar
    const currentKit = player?.kit || PRESET_PLAYERS[0].kit;
    const currentEmblem = player?.emblem || PRESET_PLAYERS[0].emblem;
    const currentClub = player?.club || 'Youth Prospect';
    const currentClubId = player?.clubId;
    const currentClubCountry = player?.clubCountry;
    const currentLeague = player?.league || 'Youth Division';
    const currentLeagueTier = player?.leagueTier;

    const randomizedPlayer: PlayerCardData = sanitizeAndRepairPlayerIdentity({
      id: `prospect-${Date.now()}`,
      name: randomFirstName,
      firstName: randomFirstName,
      originalFirstName: randomFirstName,
      birthFirstName: randomFirstName,
      ovr: 40,
      potentialOvr: BASE_PLAYER_POTENTIAL,
      internalPotentialOvr: BASE_PLAYER_POTENTIAL,
      age: 10,
      club: currentClub,
      clubId: currentClubId,
      clubCountry: currentClubCountry,
      league: currentLeague,
      leagueTier: currentLeagueTier,
      position: 'CAM',
      subPosition: 'CAM',
      playStyle: 'Creator',
      preferredFoot: randomPreferredFoot,
      nationality: randomNat,
      stats: rawStats,
      biometrics: {
        strength: 40,
        skinColor: randomSkin,
        hairStyle: randomStyle,
        hairLength: randomLength,
        hairRoot: randomRoot,
        hairDye: 'none',
        facialHairStyle: 'none',
        facialHair: 'none',
      },
      accessories: {
        accessory: 'none',
        headbandColor: '#000000',
        tattooNeck: 'none',
        tattooArmL: 'none',
        tattooArmR: 'none',
        tattooFace: 'none',
        earring: 'none',
        earringL: 'none',
        earringR: 'none',
        necklace: 'none',
      },
      kit: {
        ...currentKit,
        collar: 'crew',
      },
      emblem: currentEmblem,
      customBio: 'A promising young prospect taking their first steps in professional football. High growth potential!',
    });

    if (careerMode === 'unique_career' && !isEditorMode) {
      delete randomizedPlayer.nationality;
      randomizedPlayer.potentialOvr = BASE_PLAYER_POTENTIAL;
      randomizedPlayer.internalPotentialOvr = BASE_PLAYER_POTENTIAL;
      randomizedPlayer.fame = 0;
      randomizedPlayer.badReputation = 0;
    }

    setPlayer(randomizedPlayer);
    showToast(`🎲 Random Prospect "${randomFirstName}" Scouted! (Foot: ${randomPreferredFoot})`);
  }, [showToast, isEditorMode, careerMode, player]);

  const handleReset = useCallback(() => {
    const defaultProdigy: PlayerCardData = {
      ...PRESET_PLAYERS[0],
      potentialOvr: BASE_PLAYER_POTENTIAL,
      internalPotentialOvr: BASE_PLAYER_POTENTIAL,
      fame: 0,
      badReputation: 0,
    };
    if (careerMode === 'unique_career' && !isEditorMode) {
      delete defaultProdigy.nationality;
    }
    setPlayer(defaultProdigy);
    showToast('Reset to default New Prodigy card');
  }, [showToast, careerMode, isEditorMode]);

  const handleSelectPreset = useCallback((preset: PlayerCardData) => {
    setPlayer(preset);
  }, []);

  const handleExportPng = useCallback(async () => {
    const node = document.getElementById('player-card-render');
    if (!node) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${player.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_card.png`;
      link.href = dataUrl;
      link.click();
      showToast('Card PNG exported successfully!');
    } catch (err) {
      console.error('Failed to export image', err);
      showToast('Error exporting card image');
    } finally {
      setIsExporting(false);
    }
  }, [player.name, showToast]);

  const handleExportJson = useCallback(() => {
    const jsonStr = JSON.stringify(player, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const fileName = `${player.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_config.json`;
    safeDownloadBlob(blob, fileName, {
      shareTitle: `Player Card - ${player.name}`,
      shareText: `Player Card configuration for ${player.name}`,
    }).catch(() => {});
    showToast('Card JSON configuration saved!');
  }, [player, showToast]);

  const handleImportJson = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.name && parsed.ovr && parsed.stats) {
          setPlayer(parsed);
          showToast('Card loaded from JSON!');
        } else {
          showToast('Invalid card JSON format');
        }
      } catch (err) {
        showToast('Error parsing JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [showToast]);

  const activeTier = getCardTier(player.ovr);

  // FontSize CSS multiplier
  const fontSizeClass =
    fontSize === 'sm' ? 'text-[92%]' : fontSize === 'lg' ? 'text-[108%]' : 'text-[100%]';

  // Resolve active competition UI theme (EPL, UCL, World Cup, Youth, Libertadores, custom league editor design, etc.)
  const activeCompTheme = useMemo(() => {
    return getActiveCompetitionThemeForPlayer(player, leagueDb);
  }, [
    player?.league,
    player?.club,
    player?.startingCity,
    player?.countryCode,
    player?.clubCountry,
    player?.nationality,
    player?.isProfessional,
    leagueDb
  ]);

  if (!hasCompletedStartupFlow) {
    return <StartupIntroFlow onComplete={() => setHasCompletedStartupFlow(true)} />;
  }

  if (viewMode === 'main_menu') {
    return (
      <React.Suspense fallback={null}>
        <MainMenu
          onStartNewGame={handleStartNewGame}
          onSelectLegendPreset={handleSelectLegendPreset}
          onStartEditor={handleStartEditor}
          onOpenOptionFile={() => setShowOptionFileModal(true)}
          onOpenStore={() => setShowStoreModal(true)}
          onOpenCardCollection={() => setShowCardCollectionModal(true)}
          showToast={showToast}
          legendsList={legendsList}
          hasSavedCareer={hasAnyCareerSave()}
          savedCareerInfo={getCareerSaveSummary()}
          onContinueCareer={handleContinueCareer}
        />

        <SaveSlotSelectionModal
          isOpen={saveSlotModalMode !== null}
          mode={saveSlotModalMode || 'continue_career'}
          activeSlotId={activeSaveSlotId}
          isAlreadyPaid={uniqueCareerPaidForNewRun}
          onSelectSlotForNewCareer={handleSelectSlotForNewCareer}
          onSelectSlotForLoad={handleSelectSlotForLoad}
          onSelectSlotForSave={handleSelectSlotForSave}
          onClose={() => {
            if (uniqueCareerPaidForNewRun) {
              addChampionCredits(1);
              setUniqueCareerPaidForNewRun(false);
              showToast('🪙 1 Champion Credit refunded.');
            }
            setSaveSlotModalMode(null);
          }}
          showToast={showToast}
        />

        <OptionFileModal
          isOpen={showOptionFileModal}
          onClose={() => setShowOptionFileModal(false)}
          showToast={showToast}
        />

        <CardStoreModal
          isOpen={showStoreModal}
          onClose={() => setShowStoreModal(false)}
          showToast={showToast}
          onOpenCollection={() => setShowCardCollectionModal(true)}
        />

        <CardCollectionModal
          isOpen={showCardCollectionModal}
          onClose={() => setShowCardCollectionModal(false)}
          showToast={showToast}
          onOpenStore={() => setShowStoreModal(true)}
        />

        {/* IN-GAME TRANSLATION INSPECTOR & AUDIT MODAL */}
        <TranslationInspectorModal
          isOpen={showTranslationInspectorModal}
          onClose={() => setShowTranslationInspectorModal(false)}
          isInspectModeActive={isInspectModeActive}
          onToggleInspectMode={() => setIsInspectModeActive((prev) => !prev)}
          showToast={showToast}
        />

        {/* FLOATING TRANSLATION INSPECTOR HUD & AUDIT TOOL */}
        <TranslationInspector
          onToast={showToast}
          externalOpenReport={false}
        />

        {/* TOAST NOTIFICATION FLOATING BANNER */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-blue-400">
            <CheckCircle2 className="w-4 h-4 text-white" />
            {toastMessage}
          </div>
        )}

        {/* ALWAYS-VISIBLE CRASH & BUG REPORT BUTTON */}
        <CrashReportButton />

        {/* 32-BIT ARCADE RETRO SELECTION FOCUS OVERLAY */}
        <PixelFocusOverlay />
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={null}>
      <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${fontSizeClass}`}>
      {/* 32-BIT APP TOP HEADER BAR */}
      <header
        className="border-b-2 sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md transition-all duration-300 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.6)] shrink-0"
        style={{
          borderBottomColor: `${activeCompTheme.branding.primaryHex}60`,
          boxShadow: `0 4px 20px ${activeCompTheme.branding.primaryHex}20`,
        }}
      >
        <div className="max-w-[1700px] mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3 flex-nowrap min-h-[46px] sm:min-h-[54px]">
          {/* LEFT: 32-Bit Logo Button (Main Menu) + Back + Home + Inspector + Mode Info */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink">
            {/* 1. Large 32-Bit DrawStar Logo Mark as Return to Main Menu button (No redundant text) */}
            <button
              type="button"
              id="top-bar-drawstar-logo-btn"
              onClick={handleRequestMainMenu}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-950 border-2 border-amber-400 pixel-bevel-gold flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0 overflow-hidden group"
              title={t('RETURN_TO_MAIN_MENU') || 'Return to Main Menu'}
            >
              <DrawStarMarkIcon size={38} className="group-hover:scale-110 transition-transform duration-200" />
            </button>

            {/* 2. Global Back Button (Unwinds current sub-menu / modal) */}
            <button
              type="button"
              id="top-bar-back-btn"
              onClick={handleTopBarBack}
              className="h-8 sm:h-9 px-2 sm:px-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700/80 hover:border-amber-400 pixel-bevel-raised font-pixel text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition shadow-md active:translate-y-0.5 cursor-pointer shrink-0"
              title={t('NAV_BACK') || 'Back'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-arcade uppercase tracking-wide hidden xs:inline">{t('NAV_BACK') || 'BACK'}</span>
            </button>

            {/* 3. Global Home Button (Returns to 32-bit Career Hub) */}
            <button
              type="button"
              id="top-bar-home-btn"
              onClick={handleTopBarHome}
              className="h-8 sm:h-9 px-2 sm:px-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-2 border-slate-700/80 hover:border-emerald-400 pixel-bevel-raised font-pixel text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition shadow-md active:translate-y-0.5 cursor-pointer shrink-0"
              title={t('NAV_CAREER_HUB') || 'Career Hub'}
            >
              <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-arcade uppercase tracking-wide hidden sm:inline">{t('NAV_HOME') || 'HOME'}</span>
            </button>

            {/* 4. Magic Translation Inspector Quick Access */}
            <button
              type="button"
              id="top-bar-inspector-btn"
              onClick={() => setShowTranslationInspectorModal(true)}
              className="h-8 sm:h-9 px-2 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-2 border-amber-400/60 pixel-bevel-raised font-pixel text-[10px] sm:text-xs flex items-center gap-1 transition shadow cursor-pointer active:translate-y-0.5 shrink-0"
              title="Translation Inspector & Audit List"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-800 pl-1.5 sm:pl-2 min-w-0">
              <div
                className="w-7 h-7 sm:w-9 sm:h-9 border-2 pixel-bevel-raised flex items-center justify-center shadow-md transition-all shrink-0"
                style={{
                  backgroundColor: activeCompTheme.branding.primaryHex,
                  borderColor: activeCompTheme.branding.accentHex || '#f59e0b',
                  boxShadow: `0 0 10px ${activeCompTheme.branding.primaryHex}50`,
                }}
              >
                {activeCompTheme.emblem?.url ? (
                  <img src={activeCompTheme.emblem.url} alt={activeCompTheme.competitionName} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                ) : (
                  <PixelTrophyIcon size={14} />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <h1 className="font-arcade font-black text-[11px] sm:text-xs md:text-sm tracking-wide text-amber-300 uppercase leading-none truncate max-w-[95px] xs:max-w-[130px] sm:max-w-none">
                    {careerMode === 'editor'
                      ? t('NAV_PLAYER_EDITOR')
                      : careerMode === 'play_as_legend'
                      ? `Legend: ${player.name}`
                      : isCharacterConfirmed
                      ? 'Youth Career'
                      : 'Character Creation'}
                  </h1>
                  <span className="hidden md:inline-block px-1 py-0.2 text-[7px] font-pixel bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    32-BIT
                  </span>
                </div>
                {isCharacterConfirmed && (
                  <span
                    className="text-[8px] sm:text-[9px] font-pixel uppercase tracking-wide truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[220px] hidden xs:block"
                    style={{ color: activeCompTheme.branding.accentHex || '#38bdf8' }}
                  >
                    🏆 {activeCompTheme.competitionName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Responsive Icon Bar (Compact single menu on mobile, full grid on desktop) */}
          <div className="flex items-center gap-1 sm:gap-2 justify-end shrink-0">
            {/* MOBILE ONLY: Single Compact Menu Button (< sm screens) */}
            <div className="flex sm:hidden items-center gap-1">
              {/* Quick Save direct action */}
              {careerMode === 'unique_career' && !isEditorMode && (
                <button
                  type="button"
                  onClick={handleManualSaveActiveCareer}
                  className="h-8 px-1.5 bg-emerald-950/90 border-2 border-emerald-500/80 text-emerald-300 font-pixel text-[9px] pixel-bevel-emerald flex items-center gap-1 active:scale-95 shrink-0"
                  title={`Quick Save #${activeSaveSlotId}`}
                >
                  <Save className="w-3 h-3 text-emerald-400" />
                  <span>#{activeSaveSlotId}</span>
                </button>
              )}

              {/* Direct Store Button with Credits counter */}
              <button
                type="button"
                onClick={() => setShowStoreModal(true)}
                className="h-8 px-1.5 bg-amber-950/90 border-2 border-amber-500/80 text-amber-300 pixel-bevel-gold flex items-center gap-1 active:scale-95 shrink-0"
                title="Store"
              >
                <PixelShopIcon size={12} className="text-amber-400" />
                <span className="font-arcade text-[10px] font-bold text-white">{championCredits}</span>
              </button>

              {/* Master Header Menu Trigger */}
              <button
                id="header-btn-mobile-menu"
                type="button"
                onClick={() => setShowCompactHeaderMenu(true)}
                className="h-8 px-2 bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold text-amber-300 font-arcade text-xs font-black flex items-center gap-1 active:scale-95 shadow shrink-0"
                title="Open Quick Access Menu"
              >
                <Menu className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                <span className="text-[11px]">MENU</span>
              </button>
            </div>

            {/* DESKTOP / TABLET: Full Icon Bar (hidden on mobile, flex on sm+) */}
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-end">
              {/* ACTIVE COMPETITION BADGE PILL (32-BIT) */}
              {isCharacterConfirmed && (
                <div
                  className="hidden xl:flex items-center gap-2 h-9 px-2.5 border-2 pixel-bevel-raised bg-slate-900/90 shadow-md shrink-0"
                  style={{
                    borderColor: `${activeCompTheme.branding.primaryHex}80`,
                  }}
                >
                  {activeCompTheme.emblem?.url ? (
                    <img src={activeCompTheme.emblem.url} alt={activeCompTheme.competitionName} className="w-4 h-4 object-contain" />
                  ) : (
                    <PixelTrophyIcon size={16} />
                  )}
                  <span className="font-arcade text-[11px] font-bold text-white uppercase">{activeCompTheme.competitionName}</span>
                </div>
              )}

              {/* TEST MODE PERMANENT POINTS DISPLAY */}
              {isTestMode && (
                <div
                  className="h-9 px-2.5 bg-amber-950/90 border-2 border-amber-500/80 pixel-bevel-gold flex items-center gap-2 text-amber-300 font-pixel text-[10px] shadow-md shrink-0 animate-pulse"
                  title="Test Mode Active"
                >
                  <span className="flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline">ICON: 9,999</span>
                  </span>
                  <span className="text-amber-700">|</span>
                  <span className="text-yellow-300 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="hidden md:inline">CHAMP: 9,999</span>
                  </span>
                </div>
              )}

              {/* OPTION FILE DATABASE BUTTON (32-BIT) */}
              <button
                id="header-btn-option-file"
                type="button"
                onClick={() => setShowOptionFileModal(true)}
                className="h-9 px-2 sm:px-2.5 bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-blue-400 pixel-bevel-raised text-slate-200 font-pixel text-[9px] sm:text-[10px] flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                title="Option File Database (Single Source of Truth)"
              >
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline font-arcade">OPTION FILE</span>
              </button>

              {/* REAL-TIME CHAMPION CREDITS / STORE BUTTON (32-BIT) */}
              <button
                id="header-btn-card-store"
                type="button"
                onClick={() => setShowStoreModal(true)}
                className="h-9 px-2.5 sm:px-3 bg-amber-950/90 hover:bg-amber-900 text-amber-300 border-2 border-amber-500/80 hover:border-amber-400 pixel-bevel-gold flex items-center gap-1.5 cursor-pointer transition shadow-md active:scale-95 shrink-0"
                title="DrawStar Card Store (10 Credits per Pack)"
              >
                <PixelShopIcon size={16} className="text-amber-400" />
                <span className="font-arcade font-bold tracking-tight text-white">{championCredits.toLocaleString()}</span>
                <span className="font-arcade text-[10px] text-amber-300 hidden md:inline uppercase font-bold">STORE</span>
              </button>

              {/* CARD COLLECTION BUTTON (32-BIT) */}
              <button
                id="header-btn-card-collection"
                type="button"
                onClick={() => setShowCardCollectionModal(true)}
                className="h-9 px-2 sm:px-2.5 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border-2 border-cyan-500/80 hover:border-cyan-400 pixel-bevel-cyan flex items-center gap-1.5 cursor-pointer transition shadow-md active:scale-95 shrink-0"
                title="DrawStar Card Collection (Deck, Queues & Archive)"
              >
                <PixelCardsIcon size={16} className="text-cyan-400" />
                <span className="font-arcade text-[10px] text-cyan-200 hidden md:inline uppercase font-bold">COLLECTION</span>
              </button>

              {/* PLAY AS A LEGEND OBJECTIVES MODAL BUTTON (32-BIT) */}
              {Boolean(player.isLegend || careerMode === 'play_as_legend') && (
                <button
                  type="button"
                  onClick={() => setShowLegendObjectivesModal(true)}
                  className="h-9 px-2.5 sm:px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-pixel text-[9px] sm:text-[10px] border-2 border-amber-300 pixel-bevel-gold flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                  title="View Legend Benchmarks & Objectives"
                >
                  <PixelCrownIcon size={16} color="#020617" />
                  <span className="hidden sm:inline font-arcade font-black uppercase">LEGEND OBJECTIVES</span>
                  <span className="sm:hidden font-arcade font-black uppercase">OBJECTIVES</span>
                </button>
              )}

              {/* CONFIRM / SAVE AS LEGEND BUTTON AT TOP (32-BIT) */}
              {careerMode === 'editor' || isEditorMode ? (
                <button
                  type="button"
                  onClick={() => handleSaveAsLegend(player)}
                  className="h-9 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-pixel text-[10px] border-2 border-amber-300 pixel-bevel-gold flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Award className="w-4 h-4 text-slate-950" />
                  <span className="font-arcade font-black">{t('NAV_SAVE_AS_LEGEND')}</span>
                </button>
              ) : !isCharacterConfirmed ? (
                <button
                  type="button"
                  onClick={handleConfirmCharacter}
                  className="h-9 px-3 bg-emerald-500 hover:bg-emerald-400 text-white font-pixel text-[10px] border-2 border-emerald-300 pixel-bevel-emerald flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer shrink-0"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span className="font-arcade font-black">{t('NAV_CONFIRM_CHARACTER')}</span>
                </button>
              ) : null}

              {/* UNIQUE CAREER DEDICATED SAVE AND SLOT BUTTONS (32-BIT) */}
              {careerMode === 'unique_career' && !isEditorMode && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleManualSaveActiveCareer}
                    className="h-9 px-2.5 bg-emerald-950/90 hover:bg-emerald-900 border-2 border-emerald-500/80 text-emerald-300 font-pixel text-[10px] pixel-bevel-emerald flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                    title={`Quick Save to Slot ${activeSaveSlotId}`}
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline font-arcade">SAVE</span>
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-900 border border-emerald-400 text-emerald-200 font-arcade">
                      #{activeSaveSlotId}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSaveSlotModalMode('save_manager')}
                    className="h-9 px-2 sm:px-2.5 bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-slate-500 text-slate-300 font-pixel text-[10px] pixel-bevel-raised flex items-center gap-1 shadow-md transition active:scale-95 cursor-pointer"
                    title="Manage 5 Save Slots"
                  >
                    <FolderHeart className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline font-arcade">SLOTS</span>
                  </button>
                </div>
              )}

              {!isPersistentUiVisible && !isEditorMode && careerMode !== 'editor' && (
                <button
                  type="button"
                  onClick={() => setIsPersistentUiVisible(true)}
                  className="h-9 px-2.5 bg-blue-950/80 hover:bg-blue-900 border-2 border-blue-500/60 text-blue-300 font-pixel text-[9px] pixel-bevel-cyan flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="font-arcade">{t('NAV_SHOW_STORE_STATS')}</span>
                </button>
              )}

              {!isCharacterConfirmed && (
                <div
                  className={`h-9 px-2.5 flex items-center border-2 pixel-corners font-pixel text-[9px] uppercase tracking-wider shrink-0 ${
                    activeTier === 'goat'
                      ? 'bg-cyan-950 text-cyan-200 border-cyan-400/80 pixel-bevel-cyan shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                      : activeTier === 'legendary'
                      ? 'bg-amber-950 text-amber-300 border-amber-400/80 pixel-bevel-gold'
                      : activeTier === 'gold'
                      ? 'bg-yellow-950 text-yellow-300 border-yellow-500/80 pixel-bevel-gold'
                      : activeTier === 'silver'
                      ? 'bg-slate-850 text-slate-200 border-slate-400/80 pixel-bevel-raised'
                      : activeTier === 'bronze'
                      ? 'bg-amber-900/80 text-amber-400 border-amber-700/80 pixel-bevel-gold'
                      : 'bg-slate-800 text-slate-300 border-slate-600 pixel-bevel-raised'
                  }`}
                >
                  {activeTier === 'white' ? t('UC_COMMON') : activeTier} {t('UC_TIER')}
                </div>
              )}

              {/* 32-BIT GRAPHIC & PERFORMANCE SETTINGS BUTTON */}
              <button
                id="header-btn-graphic-settings"
                type="button"
                onClick={() => setShowGraphicSettingsModal(true)}
                className="h-9 px-2 sm:px-2.5 bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-amber-400 pixel-bevel-raised text-slate-200 font-pixel text-[9px] sm:text-[10px] flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                title="Graphic & Performance Settings (Super Fluid Optimization)"
              >
                <PixelGearIcon size={16} color="#f59e0b" />
                <span className="hidden lg:inline font-arcade">SETTINGS</span>
              </button>

              {/* SOUNDTRACK MUSIC WIDGET (32-BIT COMPACT OPERATOR) */}
              <CompactMusicPlayerButton />

              {/* GLOBE LANGUAGE PICKER BUTTON */}
              <LanguagePickerButton />

              {/* UNIVERSAL LANGUAGE PACKET HUB BUTTON */}
              <LanguagePacketButton />

              {/* PLAYER PROFILE BADGE */}
              <ProfileTopRightBadge showToast={showToast} embedded />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER: LIVE UI ON TOP, PERSISTENT UI BELOW */}
      <div ref={mainScrollRef} className="flex-1 max-w-[1700px] w-full mx-auto flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
        {/* LIVE UI CONTAINER (ALWAYS AT TOP WITH DYNAMIC COMPETITION BACKGROUND) */}
        <main
          className="w-full flex-1 flex flex-col p-2 sm:p-4 md:p-6 custom-scrollbar space-y-2.5 sm:space-y-4 transition-all duration-500"
          style={{ backgroundImage: activeCompTheme.theme.backgroundCss }}
        >
          {/* LIVE UI NAVIGATION BAR (RENDERED ONLY WHEN IN EDITOR OR WHEN CHARACTER CONFIRMED) */}
          {(isEditorMode || isCharacterConfirmed) && (
            <div
              className="border rounded-lg sm:rounded-xl p-1.5 sm:p-2 flex items-center justify-between gap-1.5 sm:gap-2 shadow-lg backdrop-blur-md transition-all duration-300"
              style={{
                backgroundColor: activeCompTheme.theme.panelBgTint,
                borderColor: activeCompTheme.theme.panelBorderColor,
                boxShadow: activeCompTheme.theme.panelShadow,
              }}
            >
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setLiveUiTab('character')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                    liveUiTab === 'character'
                      ? 'text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}
                  style={
                    liveUiTab === 'character'
                      ? {
                          backgroundColor: activeCompTheme.branding.primaryHex,
                          boxShadow: `0 0 15px ${activeCompTheme.branding.primaryHex}60`,
                        }
                      : {}
                  }
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {isEditorMode ? t('NAV_PLAYER_EDITOR') : isCharacterConfirmed ? t('NAV_CAREER_DASHBOARD') : t('NAV_CHARACTER_CREATION')}
                </button>

                {isEditorMode && (
                  <>
                    <button
                      onClick={() => setLiveUiTab('card_editor')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all ${
                        liveUiTab === 'card_editor'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      {t('NAV_CARD_EDITOR')}
                    </button>

                    <button
                      onClick={() => setLiveUiTab('team_editor')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all ${
                        liveUiTab === 'team_editor'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {t('NAV_TEAM_EDITOR')}
                    </button>

                    <button
                      onClick={() => setLiveUiTab('national_team_editor')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all ${
                        liveUiTab === 'national_team_editor'
                          ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      NATIONAL TEAM EDITOR
                    </button>

                    <button
                      onClick={() => setLiveUiTab('competitions_editor')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all ${
                        liveUiTab === 'competitions_editor'
                          ? 'bg-gradient-to-r from-indigo-500 via-blue-600 to-sky-500 text-white shadow-lg ring-1 ring-blue-400/50'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5 text-sky-400" />
                      {t('NAV_COMPETITIONS_EDITOR')}
                    </button>

                    <button
                      id="liveui-tab-option-file"
                      onClick={() => setShowOptionFileModal(true)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-600/40 shadow-sm cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      OPTION FILE
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    if (isCharacterConfirmed) {
                      setShowYouthSeasonDashboardModal(true);
                    } else {
                      showToast('🌱 Youth Academy activates immediately upon Character Creation completion!');
                    }
                  }}
                  className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-extrabold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  {t('NAV_YOUTH_ACADEMY')}
                </button>
              </div>

              <div className="text-[11px] font-mono text-gray-400 hidden sm:block">
                {t('NAV_MODE_LABEL')} <span className="text-emerald-400 font-bold">{isEditorMode ? t('NAV_MODE_SANDBOX') : t('NAV_MODE_ACTIVE')}</span>
              </div>
            </div>
          )}

          {/* LIVE UI MAIN CONTENT: CAREER DASHBOARD OR CHARACTER CREATION */}
          {liveUiTab === 'character' && (
            <div className="space-y-4 sm:space-y-6">
              {!isCharacterConfirmed ? (
                careerMode === 'unique_career' && !isEditorMode ? (
                  /* NEW STREAMLINED WONDERKID INITIALIZATION EXPERIENCE */
                  <WonderkidInitScreen
                    player={player}
                    onPlayerChange={setPlayer}
                    onConfirm={handleConfirmCharacter}
                    showToast={showToast}
                  />
                ) : (
                  /* SANDBOX PLAYER EDITOR / LEGEND CUSTOMIZATION SCREEN */
                  <div className="space-y-4 sm:space-y-6">
                    {/* CLEAN MINIMALIST HEADER */}
                    <div className="pb-2.5 sm:pb-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                            {isEditorMode ? t('NAV_PLAYER_EDITOR') : t('UC_INIT_HEADER')}
                          </span>
                          <span className="text-[10px] sm:text-xs text-slate-500 font-mono">
                            {isEditorMode ? 'Full Sandbox Customization' : t('UC_STEP_1_3')}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                          {isEditorMode ? t('NAV_PLAYER_EDITOR') : t('UC_TITLE')}
                        </h2>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 hidden xs:block">
                          {isEditorMode
                            ? 'Fully customize attributes, biometrics, kit, identity, positions, and perks without restrictions.'
                            : t('UC_SUBTITLE')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmCharacter}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-900 stroke-[2.5]" />
                        <span>{t('NAV_CONFIRM_CHARACTER')}</span>
                      </button>
                    </div>

                    {/* RESPONSIVE MULTI-COLUMN LAYOUT: PLAYER CARD FIRST */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
                      {/* LEFT COLUMN: PLAYER CARD PREVIEW (CLEAN & MINIMALIST) */}
                      <div className="lg:col-span-5 flex flex-col items-center space-y-2 sm:space-y-4 lg:sticky lg:top-16 z-10 w-full">
                        <div className="w-full flex flex-col items-center">
                          <div className="text-center mb-1 sm:mb-2">
                            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 justify-center">
                              <Sparkles className="w-3.5 h-3.5 text-slate-300" />
                              {t('NAV_CARD_PREVIEW')}
                            </span>
                          </div>

                          <div className="w-full flex justify-center py-1 sm:py-2 overflow-visible">
                            <div className="transform scale-[0.85] xs:scale-[0.92] sm:scale-100 origin-top transition-transform duration-200">
                              <PlayerCard
                                id="character-creation-card-render"
                                player={player}
                                isFlipped={isFlipped}
                                onFlip={handleFlipCard}
                                hideTeam={!isEditorMode && !isCharacterConfirmed}
                                hideNationality={!isEditorMode && !isCharacterConfirmed}
                                hidePosition={!isEditorMode && !isCharacterConfirmed}
                              />
                            </div>
                          </div>

                          {/* CARD CONTROLS */}
                          <div className="w-full max-w-xs mt-3 flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={handleRandomize}
                              className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                              <span>{t('NAV_RANDOM_PROSPECT')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleReset}
                              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            >
                              {t('NAV_RESET')}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleConfirmCharacter}
                            className="w-full max-w-xs mt-2.5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4 text-slate-900 stroke-[2.5]" />
                            <span>{t('NAV_CONFIRM_START')}</span>
                          </button>
                        </div>

                        {/* PRESETS & IMPORT/EXPORT */}
                        <div className="w-full">
                          <PresetManager
                            onSelectPreset={handleSelectPreset}
                            onExportPng={handleExportPng}
                            onExportJson={handleExportJson}
                            onImportJson={handleImportJson}
                            activePlayerId={player.id}
                            isExporting={isExporting}
                            careerMode={careerMode}
                            legendsList={legendsList}
                          />
                        </div>
                      </div>

                      {/* RIGHT COLUMN: 3 INDEPENDENT SECTIONS (PLAYER INFO, APPEARANCE, DEVELOPMENT) */}
                      <div className="lg:col-span-7">
                        <React.Suspense
                          fallback={
                            <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-cyan-400 font-pixel text-xs animate-pulse">
                              <span className="mb-2">⚡ LOADING CARD CUSTOMIZER...</span>
                              <span className="text-[10px] text-gray-500 font-mono">Unpacking 32-bit pixel sprites & biometrics</span>
                            </div>
                          }
                        >
                          <CardControls
                            player={player}
                            onChange={handlePlayerChange}
                            onRandomize={handleRandomize}
                            onReset={handleReset}
                            onConfirm={handleConfirmCharacter}
                            onSaveAsLegend={handleSaveAsLegend}
                            isEditorMode={isEditorMode}
                            isCharacterConfirmed={isCharacterConfirmed}
                            storeItems={storeItems}
                            careerMode={careerMode}
                            leagueDb={leagueDb}
                          />
                        </React.Suspense>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* ACTIVE CAREER GAMEPLAY VIEW (YOUTH ACADEMY / CAREER HUB) */
                <div className="space-y-6">
                  {/* SUGGESTED ACTIONS BOX: Rendered only outside unique career mode since CareerHub has its own 32-bit SuggestedActions */}
                  {careerMode !== 'unique_career' && (
                    <SuggestedActions
                      player={player}
                      accounting={accounting}
                      storeItems={storeItems}
                      callbacks={suggestedActionCallbacks}
                      onUpdatePlayer={(updated) => setPlayer(updated)}
                      onUpdateAccounting={(updatedAcc) => setAccounting(updatedAcc)}
                      onUpdateStoreItems={(updatedStore) => setStoreItems(updatedStore)}
                      showToast={showToast}
                    />
                  )}

                  {/* EMBEDDED YOUTH SEASON DASHBOARD IN CAREER GAMEPLAY MODE */}
                  {careerMode === 'unique_career' && showYouthSeasonDashboardModal && (
                    <YouthSeasonDashboardModal
                      isOpen={showYouthSeasonDashboardModal}
                      player={player}
                      accounting={accounting}
                      manager={manager}
                      storeItems={storeItems}
                      showToast={showToast}
                      onUpdatePlayer={(updated) => setPlayer(updated)}
                      onUpdateAccounting={(updatedAcc) => setAccounting(updatedAcc)}
                      onUpdateManager={(updatedMgr) => setManager(updatedMgr)}
                      onUpdateStoreItems={(items) => setStoreItems(items)}
                      onSeasonCompleted={handleSeasonCompleted}
                      onTriggerFirstContract={handleTriggerFirstContractFromYouth}
                      onTriggerYouthLeagueExit={handleTriggerYouthLeagueExit}
                      onTriggerCallUpModal={(callUp) => {
                        setActiveCallUp(callUp);
                      }}
                      onTriggerPerkUnlock={handleTriggerPerkUnlock}
                      onClose={() => setShowYouthSeasonDashboardModal(false)}
                      onOpenDevelopment={() => {
                        // Will be handled cleanly inside CareerHub overlay
                      }}
                      onOpenStore={() => {
                        // Handled cleanly inside CareerHub via UniqueCareerStoreModal
                      }}
                      onOpenCard={() => {
                        // Will be handled cleanly inside CareerHub overlay
                      }}
                      onOpenMenu={() => {
                        // Will be handled cleanly inside CareerHub overlay
                      }}
                      embedded={true}
                    />
                  )}

                  {/* LIVE GAMEPLAY UI SUBTLE CITY ATMOSPHERE BACKDROP */}
                  {player.startingCity && (
                    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 flex items-center justify-between text-xs backdrop-blur-sm shadow-lg transition-all">
                      {(() => {
                        const rawCity = STARTING_CITIES.find((c) => c.fullName === player.startingCity) || STARTING_CITIES[0];
                        const cityObj = getLocalizedCityOption(rawCity, language);
                        return (
                          <>
                            <div className={`absolute inset-0 bg-gradient-to-r ${cityObj.bgGradient} opacity-30 pointer-events-none`} />
                            <div className="flex items-center gap-3 z-10">
                              <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-white flex items-center gap-2 flex-wrap">
                                  <span>{t('NAV_ORIGIN_CITY')} <strong className="text-emerald-400 font-black">{cityObj.fullName}</strong></span>
                                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${cityObj.badgeColor}`}>
                                    {translateNationality(cityObj.nationality.name)} ({cityObj.nationality.code})
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 italic font-medium mt-0.5">
                                  "{cityObj.description}"
                                </p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CARD DECK EDITOR VIEW (SANDBOX ONLY) */}
          {isEditorMode && liveUiTab === 'card_editor' && (
            <div className="space-y-6">
              <CardDeckEditor
                showToast={showToast}
                player={player}
                onUpdatePlayer={handlePlayerChange}
                accounting={accounting}
                setAccounting={setAccounting}
                manager={manager}
                setManager={setManager}
              />
            </div>
          )}

          {/* TEAM EDITOR VIEW (SANDBOX ONLY) */}
          {isEditorMode && liveUiTab === 'team_editor' && (
            <div className="space-y-6">
              <TeamEditor leagueDb={leagueDb} onUpdateDb={setLeagueDb} showToast={showToast} />
            </div>
          )}

          {/* NATIONAL TEAM EDITOR VIEW (SANDBOX ONLY) */}
          {isEditorMode && liveUiTab === 'national_team_editor' && (
            <div className="space-y-6">
              <NationalTeamEditor leagueDb={leagueDb} showToast={showToast} />
            </div>
          )}

          {/* COMPETITIONS EDITOR VIEW (SANDBOX ONLY) */}
          {isEditorMode && liveUiTab === 'competitions_editor' && (
            <div className="space-y-6">
              <CompetitionsEditor leagueDb={leagueDb} onUpdateLeagueDb={setLeagueDb} showToast={showToast} />
            </div>
          )}
        </main>

        {/* PERSISTENT UI PANEL (RENDERED ONLY FOR SANDBOX / NON-UNIQUE CAREER MODES) */}
        {isPersistentUiVisible && isCharacterConfirmed && !isEditorMode && careerMode !== 'editor' && careerMode !== 'unique_career' && (
          <section className="w-full border-t-2 border-slate-800 bg-[#121319] p-4 sm:p-6 transition-all duration-300">
            <PersistentUiPanel
              player={player}
              onUpdatePlayer={handlePlayerChange}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
              onTrophiesChange={handleTrophiesChange}
              championCoins={championCoins}
              iconicCoins={iconicCoins}
              setChampionCoins={setChampionCoins}
              setIconicCoins={setIconicCoins}
              fontSize={fontSize}
              setFontSize={setFontSize}
              onSelectSpecialHair={handleSelectSpecialHair}
              showToast={showToast}
              isVisible={isPersistentUiVisible}
              onToggleVisibility={() => setIsPersistentUiVisible(false)}
              isEditorMode={isEditorMode}
              activeSaveSlotId={activeSaveSlotId}
              onSaveCareer={handleManualSaveActiveCareer}
              onOpenSaveManager={() => setSaveSlotModalMode('save_manager')}
              onOpenWorldResults={() => setShowWorldResultsAppModal(true)}
              externalCallUp={activeCallUp}
              setExternalCallUp={setActiveCallUp}
              storeItems={storeItems}
              setStoreItems={setStoreItems}
              accounting={accounting}
              setAccounting={setAccounting}
              manager={manager}
              setManager={setManager}
              onTriggerManagerPositionProposal={handleTriggerManagerPositionProposal}
              activeOverlayPanel={activeOverlayPanel}
              setActiveOverlayPanel={setActiveOverlayPanel}
              activeCompTheme={activeCompTheme}
              onReturnToYouthAcademy={() => {
                setActiveOverlayPanel(null);
                setLiveUiTab('character');
                if (isCharacterConfirmed) {
                  setShowYouthSeasonDashboardModal(true);
                }
                if (mainScrollRef.current) {
                  mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              onTriggerRetirement={handleTriggerRetirement}
              onOpenCareerSummary={handleOpenCareerSummary}
              onOpenChampionCelebration={handleOpenChampionCelebration}
              onTriggerPerkUnlock={handleTriggerPerkUnlock}
              onOpenSpecialChoiceModal={handleOpenSpecialChoiceModalDirect}
              onOpenSpecialSigningChain={handleOpenSpecialSigningChainDirect}
              onOpenSpecialRetryModal={handleOpenSpecialRetryModalDirect}
              onOpenSaudiOffer={() => {
                const isSpecialEligible = scanActiveSpecialClubInterests(player).filter(
                  (c) => c.config.category === 'saudi'
                );
                if (isSpecialEligible.length > 0) {
                  handleOpenSpecialSigningChainDirect('saudi_pro_league');
                  return;
                }
                const saudiOffers = generateCuratedClubOffers(player, 'money', manager, accounting, 2);
                if (saudiOffers.length > 0) {
                  setUnifiedClubOffers(saudiOffers);
                  setShowUnifiedClubOfferModal(true);
                } else {
                  showToast('⚠️ Saudi Pro League clubs require an established rating (85+ OVR or high-potential 80+ OVR) before issuing proposals.');
                }
              }}
              onOpenTransferOffer={() => {
                const specialInterests = scanActiveSpecialClubInterests(player);
                if (specialInterests.length > 1) {
                  const dilemma = categorizeSpecialChoiceDilemma(specialInterests);
                  setSpecialChoiceData(dilemma);
                  setShowSpecialClubChoiceModal(true);
                  return;
                }
                if (specialInterests.length === 1) {
                  setActiveSpecialSigningEvaluation(specialInterests[0]);
                  setShowSpecialSigningChainModal(true);
                  return;
                }

                // Check decay retries
                const { retryOffers } = processSpecialClubDecayRolls(player);
                if (retryOffers.length > 0) {
                  setActiveSpecialRetryEvaluation(retryOffers[0]);
                  setShowSpecialRetryModal(true);
                  return;
                }

                const transferOffers = generateProactiveSeasonOffers(player, accounting, manager);
                if (transferOffers.length > 0) {
                  setUnifiedClubOffers(transferOffers);
                  setShowUnifiedClubOfferModal(true);
                } else {
                  showToast('ℹ️ No active transfer proposals currently submitted. Your agent will explore options.');
                }
              }}
              onOpenCallUp={() => {
                const callUp: InternationalCallUp = {
                  id: `callup-test-${Date.now()}`,
                  nation: (typeof player.nationality === 'string' ? player.nationality : (player.nationality as any)?.name || 'Brazil') as any,
                  tier: 'Senior',
                  competitionName: 'International Friendly vs Germany',
                  managerName: 'National Team Head Coach',
                  role: 'Key Starter',
                  bonusFame: 5,
                  date: new Date().toLocaleDateString(),
                  isSeniorLockWarning: false,
                };
                setActiveCallUp(callUp);
              }}
              onOpenCardEditor={() => {
                setIsEditorMode(true);
                setLiveUiTab('card_editor');
              }}
            />
          </section>
        )}
      </div>

      {/* CAREER KEY MATCH FREQUENCY MODE MODAL (SLOW / DECISIVE / FINALS ONLY) */}
      <CareerModeSelectorModal
        isOpen={showCareerModeModal}
        currentMode={player.keyMatchPlayMode || 'decisive'}
        onSelectMode={handleConfirmCareerMatchMode}
        isInitialSetup={true}
        onClose={() => setShowCareerModeModal(false)}
      />

      {/* STARTING CITY SELECTION MODAL */}
      <StartingCityModal
        isOpen={showStartingCityModal}
        onConfirmCity={handleConfirmStartingCity}
      />

      {/* PARENT CARDS SELECTION MODAL (4 CARDS DRAW) */}
      <ParentCardModal
        isOpen={showParentCardModal}
        cards={drawnParentCards}
        onSelectParentCard={handleConfirmParentCard}
        onRedrawCards={(newCards) => {
          if (newCards) setDrawnParentCards(newCards);
        }}
        startingCityOrCountry={player.startingCity || player.city}
        playerNationalityCode={player.nationality?.code}
        showToast={showToast}
      />

      {/* PLAYER TYPE ARCHETYPE SELECTION MODAL (8 POSITION-NEUTRAL CARDS, 725 POINTS) */}
      <PlayerTypeSelectionModal
        isOpen={showPlayerTypeModal}
        playerName={player.name}
        startingCity={player.startingCity || player.city}
        selectedTypeId={player.playerTypeId || selectedPlayerTypeForCreation.id}
        onSelectType={handleConfirmPlayerType}
        onBack={() => {
          setShowPlayerTypeModal(false);
          setShowParentCardModal(true);
        }}
      />

      {/* POSITION SELECTION MODAL (POSITION-NEUTRAL ARCHETYPE APPLIED TO FIELD ROLE) */}
      <PositionSelectionModal
        isOpen={showPositionModal}
        preferredFoot={player.preferredFoot || 'Right'}
        selectedPlayerType={PLAYER_TYPES[player.playerTypeId || selectedPlayerTypeForCreation.id] || selectedPlayerTypeForCreation}
        selectedPosition={player.position && player.position !== 'UNSELECTED' ? (player.position as any) : undefined}
        selectedSubPosition={player.subPosition && player.subPosition !== 'UNSELECTED' ? player.subPosition : undefined}
        onConfirmPosition={handleConfirmPosition}
        onBack={() => {
          setShowPositionModal(false);
          setShowPlayerTypeModal(true);
        }}
      />

      {/* FINAL CAREER CONFIRMATION MODAL */}
      <FinalCareerConfirmationModal
        isOpen={showFinalConfirmationModal}
        player={player}
        playerType={PLAYER_TYPES[player.playerTypeId || selectedPlayerTypeForCreation.id] || selectedPlayerTypeForCreation}
        onConfirm={handleFinalStartCareer}
        onBackToEdit={() => {
          setShowFinalConfirmationModal(false);
          setShowPositionModal(true);
        }}
      />

      {/* BAD REPUTATION TUTORIAL MODAL */}
      <BadReputationTutorialModal
        isOpen={showBadRepTutorialModal}
        onClose={() => {
          markTutorialSeen('bad_reputation_tutorial');
          setShowBadRepTutorialModal(false);
        }}
      />

      {/* BAD REPUTATION TIER UP CELEBRATION MODAL */}
      <BadReputationTierModal
        isOpen={Boolean(badRepTierUpEvent)}
        event={badRepTierUpEvent}
        onAcknowledge={() => setBadRepTierUpEvent(null)}
      />

      {/* ICONIC PLAYER BREAKTHROUGH EVENT MODAL (99 POTENTIAL BREAKTHROUGH) */}
      <IconicPlayerEventModal
        isOpen={showIconicPlayerModal}
        player={player}
        onAcceptBreakthrough={handleAcceptIconicBreakthrough}
        onDismiss={handleDismissIconicModal}
      />

      {/* STREET DEVELOPMENT EVENT MODAL (1-60 STAT POINTS ROLL) */}
      {streetDevEventData && !isProfessionalPlayer(player) && !player.youthLeagueTeam && (!player.club || player.club === 'Free Agent' || !player.club.toLowerCase().includes('youth')) && (
        <StreetDevelopmentEventModal
          isOpen={showStreetDevEventModal}
          pointsRolled={streetDevEventData.points}
          message={streetDevEventData.message}
          tier={streetDevEventData.tier}
          age={streetDevEventData.age}
          totalAvailablePoints={streetDevEventData.totalPoints}
          onContinue={handleContinueFromStreetDevEvent}
        />
      )}

      {/* STREET CARD DRAW MODAL (3 CARDS DRAW) */}
      <StreetCardModal
        isOpen={showStreetCardModal}
        cards={drawnStreetCards}
        onSelectStreetCard={handleSelectStreetCard}
      />

      {/* FIRST CONTRACT EVENT MODAL (ICONIC STREET SCOUT) */}
      <FirstContractModal
        isOpen={showFirstContractModal}
        offers={firstContractOffers}
        player={player}
        manager={manager}
        onAcceptOffer={handleAcceptFirstContract}
        onDeclineAll={handleDeclineFirstContractAll}
      />

      {/* FIRST CONTRACT MANAGER PLAYSTYLE MODAL */}
      <ManagerPlaystyleModal
        isOpen={showManagerPlaystyleModal}
        offer={pendingProContractOffer}
        player={player}
        onConfirmPlaystyle={handleConfirmManagerPlaystyle}
      />

      {/* FIRST CONTRACT CINEMATIC INTRO MODAL */}
      {firstContractIntroOffer && (
        <FirstContractIntroModal
          isOpen={showFirstContractIntroModal}
          player={player}
          offer={firstContractIntroOffer}
          onProceedToCareer={handleProceedFromFirstContractIntro}
        />
      )}

      {/* YOUTH GRADUATION COMMENCEMENT MODAL */}
      <YouthGraduationModal
        isOpen={showYouthGraduationModal}
        player={player}
        managerName={manager?.name || player.youthCoachName}
        onComplete={handleCompleteYouthGraduation}
      />

      {/* TRANSFER INTEREST & NEGOTIATION MODAL */}
      <TransferInterestModal
        isOpen={showTransferInterestModal}
        offers={activeTransferOffers}
        player={player}
        accounting={accounting}
        manager={manager}
        onAcceptTransfer={handleAcceptTransferOffer}
        onRejectOffer={handleRejectTransferOffer}
        onOpenArabianMegaOffer={handleOpenArabianMegaOffer}
        onClose={() => setShowTransferInterestModal(false)}
      />

      {/* ARABIAN MEGA-OFFER SPECIAL EVENT MODAL */}
      <ArabianMegaOfferModal
        isOpen={showArabianMegaOfferModal}
        offer={pendingSaudiOffer}
        player={player}
        onAccept={handleAcceptArabianMegaOffer}
        onDecline={handleDeclineArabianMegaOffer}
      />

      {/* UNIFIED CLUB OFFER MODAL */}
      {showUnifiedClubOfferModal && unifiedClubOffers.length > 0 && (
        <UnifiedClubOfferModal
          isOpen={showUnifiedClubOfferModal}
          offers={unifiedClubOffers}
          player={player}
          manager={manager}
          accounting={accounting}
          onAcceptOffer={handleAcceptUnifiedClubOffer}
          onDeclineAll={() => {
            setShowUnifiedClubOfferModal(false);
            showToast('Declined club offers.');
            if (!isProfessionalPlayer(player) && (!player.youthLeagueTeam || player.league === 'Street Football' || player.club === 'Free Agent' || (player.age || 10) >= 17)) {
              setShowEarlyCareerDecisionModal(true);
            }
          }}
          onClose={() => {
            setShowUnifiedClubOfferModal(false);
            if (!isProfessionalPlayer(player) && (!player.youthLeagueTeam || player.league === 'Street Football' || player.club === 'Free Agent' || (player.age || 10) >= 17)) {
              setShowEarlyCareerDecisionModal(true);
            }
          }}
        />
      )}

      {/* SPECIAL CLUB INTEREST — CHOICE EVENT MODAL */}
      {showSpecialClubChoiceModal && specialChoiceData && (
        <SpecialClubChoiceModal
          isOpen={showSpecialClubChoiceModal}
          choiceData={specialChoiceData}
          player={player}
          onSelectClub={handleSelectSpecialClubFromChoice}
          onExplicitRejectBigThree={handleExplicitRejectBigThree}
          onRejectPsg={handleRejectPsg}
          onRejectSaudiTemporary={handleRejectSaudiTemporary}
          onRejectSaudiPermanent={handleRejectSaudiPermanent}
          onClose={() => setShowSpecialClubChoiceModal(false)}
        />
      )}

      {/* SPECIAL CLUB BOARDROOM SIGNING CHAIN & TRANSFER NEGOTIATION MODAL */}
      {showSpecialSigningChainModal && activeSpecialSigningEvaluation && (
        <SpecialClubSigningChainModal
          isOpen={showSpecialSigningChainModal}
          evaluation={activeSpecialSigningEvaluation}
          player={player}
          onCompleteTransferToUniversalOffer={handleCompleteSpecialTransferToUniversalOffer}
          onExplicitRejectBigThree={handleExplicitRejectBigThree}
          onRejectPsg={handleRejectPsg}
          onRejectSaudiTemporary={handleRejectSaudiTemporary}
          onRejectSaudiPermanent={handleRejectSaudiPermanent}
          onFailedTransferToDecay={handleSpecialFailedTransferToDecay}
          onHostagePenalty={handleSpecialHostagePenalty}
          onClose={() => setShowSpecialSigningChainModal(false)}
        />
      )}

      {/* SPECIAL CLUB SHORT RETRY MODAL (THEY'RE STILL INTERESTED) */}
      {showSpecialRetryModal && activeSpecialRetryEvaluation && (
        <SpecialClubRetryModal
          isOpen={showSpecialRetryModal}
          evaluation={activeSpecialRetryEvaluation}
          player={player}
          onAcceptTerms={(evalObj) => {
            setShowSpecialRetryModal(false);
            setActiveSpecialSigningEvaluation(evalObj);
            setShowSpecialSigningChainModal(true);
          }}
          onExplicitRejectBigThree={handleExplicitRejectBigThree}
          onRejectPsg={handleRejectPsg}
          onClose={() => setShowSpecialRetryModal(false)}
        />
      )}

      {/* PARENT CARD INTRODUCTION STORY MODAL */}
      {showParentCardIntroModal && (player.equippedParentCard || selectedParentForIntro) && (
        <ParentCardIntroModal
          card={(player.equippedParentCard || selectedParentForIntro)!}
          playerType={player.playerTypeId || selectedPlayerTypeForCreation?.id}
          onConfirm={handleConfirmParentCardIntro}
        />
      )}

      {/* EARLY CAREER DECISION MODAL */}
      <EarlyCareerDecisionModal
        isOpen={showEarlyCareerDecisionModal}
        player={player}
        onSelectChoice={handleSelectEarlyCareerChoice}
      />

      {/* FREE AGENT & STREET AGENT HUB MODAL */}
      <FreeAgentHubModal
        isOpen={showFreeAgentHubModal}
        player={player}
        manager={manager || undefined}
        accounting={accounting}
        onPlayStreets={() => {
          setShowFreeAgentHubModal(false);
          handleSelectEarlyCareerChoice('play_streets');
        }}
        onRunTryoutSuccess={(offers) => {
          setShowFreeAgentHubModal(false);
          setUnifiedClubOffers(offers);
          setShowUnifiedClubOfferModal(true);
        }}
        onRunTryoutFail={(message) => {
          showToast(message);
        }}
        onGetAgentSuccess={() => {
          showToast('🎉 Agent successfully hired!');
        }}
        onGetAgentFail={(message) => {
          showToast(message);
        }}
        onAgentFindClubs={(offers) => {
          setShowFreeAgentHubModal(false);
          setUnifiedClubOffers(offers);
          setShowUnifiedClubOfferModal(true);
        }}
        onClose={() => {
          setShowFreeAgentHubModal(false);
          setShowEarlyCareerDecisionModal(true);
        }}
      />

      {/* YOUTH CLUB CINEMATIC INTRO MODAL */}
      <YouthClubCinematicModal
        isOpen={showYouthCinematicModal}
        player={player}
        isBigClub={isBigClubYouth}
        onProceed={handleProceedFromYouthCinematic}
      />

      {/* YOUTH FIRST MANAGER MEETING MODAL */}
      <YouthManagerMeetingModal
        isOpen={showYouthManagerMeetingModal}
        player={player}
        onConfirmRole={handleConfirmYouthManagerRole}
      />

      {/* WARNING MODAL: UNASSIGNED ATTRIBUTE POINTS */}
      {unassignedWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Unassigned Attribute Points</h3>
              <p className="text-xs text-amber-300 mt-2 font-semibold leading-relaxed bg-amber-950/40 p-3.5 rounded-xl border border-amber-500/30">
                "You still have unassigned attribute points. Please assign and save all 5 points before continuing."
              </p>
            </div>

            <button
              onClick={() => setUnassignedWarningModal(false)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Assign Remaining Points
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION CHARACTER MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <UserCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">CAREER CHARACTER CONFIRMED!</h3>
              <p className="text-xs text-slate-400 mt-1">
                <span className="text-emerald-400 font-bold">{player.name}</span> has been officially initialized into Unique Career!
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-left text-xs space-y-1.5 font-mono">
              {player.startingCity && (
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Origin / Nationality:</span>
                  <span className="text-sky-300 font-bold">{player.startingCity} • {player.nationality?.name || 'Unassigned'}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Age / Weight / Height:</span>
                <span className="text-emerald-400 font-bold">{player.age} yrs • {player.weightKg || 75} kg • {player.heightCm || 180} cm</span>
              </div>
              {(() => {
                const h = player.heightCm || 180;
                const w = player.weightKg || 75;
                const ideal = Math.max(40, h - 100);
                const excess = Math.max(0, w - ideal);
                return (
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-400">Body Conditioning:</span>
                    <span className={`font-bold ${excess > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      Ideal: {ideal} kg {excess > 0 ? `(-${excess} PAC, -${excess} STA)` : '(Optimal)'}
                    </span>
                  </div>
                );
              })()}
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Rating & Weak Foot:</span>
                <span className="text-amber-400 font-bold">{player.ovr} OVR • {player.weakFootStars}★ Weak Foot</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Position / Secondary:</span>
                <span className="text-blue-400 font-bold">{player.position} / {player.subPosition}</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Playstyle & Perks:</span>
                <span className="text-purple-400 font-bold">
                  {player.playStyle || 'None'} {player.equippedParentCard ? `• ${player.equippedParentCard.perkTitle}` : ''}
                </span>
              </div>
              {player.equippedParentCard && (
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span className="text-slate-400">Parent Card:</span>
                  <span className="text-amber-300 font-bold">
                    {player.equippedParentCard.name} ({player.equippedParentCard.rarity.toUpperCase()})
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">Manager:</span>
                <span className="text-slate-200 font-bold">{manager.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Yearly Wage & Deals:</span>
                <span className="text-emerald-300 font-bold">€{accounting.yearlySalary} • None</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
              >
                Continue / Play
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleRequestMainMenu();
                }}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE UNIQUE CAREER PROMPT MODAL */}
      <LeaveUniqueCareerModal
        isOpen={showLeaveCareerModal}
        onSaveAndReturn={handleSaveAndReturnFromModal}
        onReturnWithoutSaving={handleReturnWithoutSavingFromModal}
        onCancel={handleCancelLeaveCareer}
        isCharacterCreation={!isCharacterConfirmed}
        activeSlotId={activeSaveSlotId}
      />

      {/* 5-SLOT SAVE SYSTEM SELECTION / MANAGER MODAL */}
      <SaveSlotSelectionModal
        isOpen={saveSlotModalMode !== null}
        mode={saveSlotModalMode || 'continue_career'}
        activeSlotId={activeSaveSlotId}
        onSelectSlotForNewCareer={handleSelectSlotForNewCareer}
        onSelectSlotForLoad={handleSelectSlotForLoad}
        onSelectSlotForSave={handleSelectSlotForSave}
        onClose={() => setSaveSlotModalMode(null)}
        showToast={showToast}
      />

      {/* JUDAS BETRAYAL EVENT MODAL */}
      {pendingJudasBetrayalData && (
        <JudasBetrayalEventModal
          player={player}
          betrayalData={pendingJudasBetrayalData.betrayalData}
          transferFeeFormatted={pendingJudasBetrayalData.transferFeeFormatted}
          weeklyWageFormatted={pendingJudasBetrayalData.weeklyWageFormatted}
          onAcceptTransfer={handleConfirmJudasBetrayal}
          onRejectTransfer={handleRejectJudasBetrayal}
        />
      )}

      {/* FIGO SAGA / RIVAL BETRAYAL NEWS MODAL (SNAKE / TRAIDOR / JUDAS PERK) */}
      {figoBetrayalModalData && (
        <FigoBetrayalNewsModal
          isOpen={figoBetrayalModalData.isOpen}
          player={player}
          betrayedClub={figoBetrayalModalData.betrayedClub}
          destinationClub={figoBetrayalModalData.destinationClub}
          rivalryName={figoBetrayalModalData.rivalryName}
          onClose={() => setFigoBetrayalModalData(null)}
        />
      )}

      {/* PERK UNLOCK STORY EVENT MODAL */}
      {showPerkStoryModal && unlockedPerkForStory && (
        <PerkUnlockStoryModal
          isOpen={showPerkStoryModal}
          perk={unlockedPerkForStory}
          player={player}
          onAccept={handleAcceptPerkFromStory}
          onClose={() => {
            setShowPerkStoryModal(false);
            setUnlockedPerkForStory(null);
          }}
        />
      )}

      {/* PERK REPLACEMENT MODAL */}
      {showPerkReplacementModal && pendingNewPerk && (
        <PerkReplacementModal
          player={player}
          newPerk={pendingNewPerk}
          isForced={pendingNewPerk.id === 'snake'}
          onReplace={handleConfirmPerkReplacement}
          onDiscard={handleDiscardNewPerk}
          onClose={() => {
            setShowPerkReplacementModal(false);
            setPendingNewPerk(null);
          }}
        />
      )}

      {/* FAREWELL MATCH MODAL */}
      <FarewellMatchModal
        isOpen={showFarewellMatchModal}
        player={player}
        onCompleteFarewell={handleCompleteFarewell}
      />

      {/* CAREER SUMMARY MODAL */}
      <CareerSummaryModal
        isOpen={showCareerSummaryModal}
        player={player}
        onClose={() => setShowCareerSummaryModal(false)}
      />

      {/* INJURY NOTIFICATION POPUP MODAL */}
      <InjuryNotificationModal
        isOpen={Boolean(player.isInjured && player.hasSeenInjuryModal === false)}
        player={player}
        onAcknowledge={() => {
          setPlayer((prev) => ({
            ...prev,
            hasSeenInjuryModal: true,
          }));
        }}
      />

      {/* FIT TO PLAY RECOVERY MODAL */}
      <FitToPlayModal
        isOpen={Boolean(!player.isInjured && player.justRecoveredFromInjury === true && player.hasSeenFitToPlayModal !== true)}
        player={player}
        onAcknowledge={() => {
          setPlayer((prev) => ({
            ...prev,
            justRecoveredFromInjury: false,
            hasSeenFitToPlayModal: true,
          }));
        }}
      />

      {/* POTENTIAL REACHED MILESTONE MODAL */}
      <PotentialReachedModal
        isOpen={showPotentialReachedModal}
        player={player}
        onApplyOutcome={(updatedPlayer) => {
          setPlayer(updatedPlayer);
          triggerConfetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
          if (showToast) {
            showToast(`🏆 Milestone Updated: ${updatedPlayer.ovr} OVR / ${updatedPlayer.potentialOvr} POT`);
          }
        }}
        onClose={() => setShowPotentialReachedModal(false)}
      />

      {/* FULL-SCREEN CHAMPIONS CELEBRATION MODAL */}
      {championModalData && (
        <ChampionsCelebrationModal
          isOpen={Boolean(championModalData)}
          data={championModalData}
          player={player}
          onClose={() => setChampionModalData(null)}
          onClaimTrophy={handleClaimTrophyFromModal}
        />
      )}

      {/* NICKNAME EVENT POPUP MODAL */}
      {showNicknameModal && (
        <NicknameEventModal
          isOpen={showNicknameModal}
          player={player}
          featConfig={pendingFeatNickname}
          isExProTrigger={isExProNicknameTrigger}
          isStartingTypeTrigger={isStartingTypeNicknameTrigger}
          startingNickname={pendingStartingNickname}
          startingTypeName={
            getOfficialPlayerTypeName(player.playerTypeId || selectedPlayerTypeForCreation?.id, language) ||
            'Archetype'
          }
          startingCityName={
            player.city || (player.startingCity ? player.startingCity.split(',')[0].trim() : 'Academy')
          }
          onAcceptNickname={handleAcceptNicknameFromApp}
          onDeclineNickname={handleDeclineNicknameFromApp}
        />
      )}

      {/* CAREER LIFECYCLE MILESTONE MODAL (AGE 10, 20, 28, 33) */}
      {careerLifecycleModalData && (
        <CareerLifecycleMilestoneModal
          isOpen={Boolean(careerLifecycleModalData)}
          data={careerLifecycleModalData}
          onClose={handleCloseCareerLifecycleModal}
        />
      )}

      {/* CONTINENTAL DASHBOARD MODAL */}
      {showContinentalModal && (
        <ContinentalDashboardModal
          isOpen={showContinentalModal}
          onClose={() => setShowContinentalModal(false)}
          player={player}
          leagueDb={leagueDb}
          currentSeasonYear={player.currentSeason || 2026}
          onPlayerUpdate={setPlayer}
        />
      )}

      {/* WORLD RESULTS & COMPETITIONS MODAL */}
      {showWorldResultsAppModal && (
        <WorldResultsModal
          isOpen={showWorldResultsAppModal}
          onClose={() => setShowWorldResultsAppModal(false)}
          player={player}
          seasonYear={`${player.currentSeason || 2026}/${(player.currentSeason || 2026) + 1}`}
          currentStage="block1"
          block1Count={19}
          block2Count={19}
        />
      )}

      {/* MANAGER POSITION CHANGE PROPOSAL MODAL */}
      {showManagerPositionModal && managerPositionProposal && (
        <ManagerPositionChangeModal
          isOpen={showManagerPositionModal}
          proposal={managerPositionProposal}
          player={player}
          onAccept={(updated) => {
            setPlayer(updated);
            setShowManagerPositionModal(false);
            setManagerPositionProposal(null);
            showToast(`✅ Accepted Manager's Plan: Added ${managerPositionProposal.subPosition} (Tier I)!`);
          }}
          onClose={() => {
            setShowManagerPositionModal(false);
            setManagerPositionProposal(null);
            showToast(`⚠️ Declined Manager: Prioritizing your established position.`);
          }}
        />
      )}

      {/* NATURAL POSITION SWITCH PROPOSAL MODAL */}
      {showNaturalSwitchModal && naturalSwitchSlot && (
        <NaturalPositionSwitchModal
          isOpen={showNaturalSwitchModal}
          eligibleSlot={naturalSwitchSlot}
          player={player}
          onConfirmSwitch={(updated) => {
            setPlayer(updated);
            setShowNaturalSwitchModal(false);
            setNaturalSwitchSlot(null);
            showToast(`⭐ Primary Position Evolved! You are now naturally a ${updated.subPosition}!`);
          }}
          onClose={() => {
            setShowNaturalSwitchModal(false);
            setNaturalSwitchSlot(null);
            showToast(`Maintained current primary position.`);
          }}
        />
      )}

      {/* LEGEND OBJECTIVE TRACKER MODAL */}
      <LegendObjectiveTrackerModal
        isOpen={showLegendObjectivesModal}
        player={player}
        onClose={() => setShowLegendObjectivesModal(false)}
        showToast={showToast}
      />

      {/* OPTION FILE UNIFIED DATABASE MODAL */}
      <OptionFileModal
        isOpen={showOptionFileModal}
        onClose={() => setShowOptionFileModal(false)}
        showToast={showToast}
      />

      {/* DRAWSTAR CARD STORE MODAL */}
      <CardStoreModal
        isOpen={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        showToast={showToast}
        onOpenCollection={() => setShowCardCollectionModal(true)}
      />

      {/* DRAWSTAR CARD COLLECTION MODAL */}
      <CardCollectionModal
        isOpen={showCardCollectionModal}
        onClose={() => setShowCardCollectionModal(false)}
        showToast={showToast}
        onOpenStore={() => setShowStoreModal(true)}
      />

      {/* GRAPHIC & PERFORMANCE SETTINGS MODAL */}
      <GraphicSettingsModal
        isOpen={showGraphicSettingsModal}
        onClose={() => setShowGraphicSettingsModal(false)}
      />

      {/* 32-BIT COMPACT MOBILE HEADER MENU MODAL */}
      <CompactHeaderMenuModal
        isOpen={showCompactHeaderMenu}
        onClose={() => setShowCompactHeaderMenu(false)}
        championCredits={championCredits}
        activeSaveSlotId={activeSaveSlotId}
        careerMode={careerMode}
        isEditorMode={isEditorMode}
        isCharacterConfirmed={isCharacterConfirmed}
        isTestMode={isTestMode}
        onOpenStore={() => setShowStoreModal(true)}
        onOpenCollection={() => setShowCardCollectionModal(true)}
        onOpenLegendObjectives={() => setShowLegendObjectivesModal(true)}
        onManualSave={handleManualSaveActiveCareer}
        onOpenSaveSlots={() => setSaveSlotModalMode('save_manager')}
        onOpenOptionFile={() => setShowOptionFileModal(true)}
        onOpenGraphicSettings={() => setShowGraphicSettingsModal(true)}
        onOpenLanguagePicker={() => setShowLanguagePickerModal(true)}
        onOpenLanguagePacket={() => setShowLanguagePacketModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSoundtrack={() => setShowSoundtrackModal(true)}
      />

      {/* USER PROFILE & STATS MODAL */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        showToast={showToast}
      />

      {/* GLOBE LANGUAGE PICKER MODAL */}
      <LanguagePickerModal
        isOpen={showLanguagePickerModal}
        onClose={() => setShowLanguagePickerModal(false)}
      />

      {/* SYSTEM LANGUAGE PACKET MODAL */}
      <LanguagePacketModal
        isOpen={showLanguagePacketModal}
        onClose={() => setShowLanguagePacketModal(false)}
      />

      {/* SOUNDTRACK CONTROLLER MODAL */}
      {showSoundtrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" />
                <h3 className="font-arcade text-sm font-black text-amber-300 uppercase">32-Bit Soundtrack Studio</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSoundtrackModal(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs border border-slate-700 hover:border-amber-400"
              >
                CLOSE
              </button>
            </div>
            <SoundtrackControlWidget />
          </div>
        </div>
      )}

      {/* IN-GAME TRANSLATION INSPECTOR & AUDIT MODAL */}
      <TranslationInspectorModal
        isOpen={showTranslationInspectorModal}
        onClose={() => setShowTranslationInspectorModal(false)}
        isInspectModeActive={isInspectModeActive}
        onToggleInspectMode={() => setIsInspectModeActive((prev) => !prev)}
        showToast={showToast}
      />

      {/* FLOATING TRANSLATION INSPECTOR HUD & AUDIT TOOL */}
      <TranslationInspector
        onToast={showToast}
        externalOpenReport={false}
      />

      {/* TOAST NOTIFICATION FLOATING BANNER */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce border border-blue-400">
          <CheckCircle2 className="w-4 h-4 text-white" />
          {toastMessage}
        </div>
      )}

      {/* ALWAYS-VISIBLE CRASH & BUG REPORT BUTTON */}
      <CrashReportButton />

      {/* 32-BIT ARCADE RETRO SELECTION FOCUS OVERLAY */}
      <PixelFocusOverlay />

      {/* FOOTER */}
      <footer className="border-t border-gray-800/80 bg-[#121216] py-3 text-center text-xs text-gray-500 z-10">
        Footballer Career Card Generator • Persistent & Live UI System
      </footer>
    </div>
    </React.Suspense>
  );
}
