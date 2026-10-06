import React, { useState, useMemo, useRef } from 'react';
import {
  PlayerCardData,
  AccountingState,
  StoreUpgradeItem,
  ManagerState,
} from '../types';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { isProfessionalPlayer } from '../utils/playerIdentitySystem';
import { getFitnessPercentage } from '../utils/staminaInjurySystem';
import {
  getCalendarDateForMatchdayIndex,
  formatSimulationCalendarDate,
} from '../utils/calendarDateFormatter';
import { SuggestedActions } from './SuggestedActions';
const CareerSecondaryMenuModal = React.lazy(() => import('./CareerSecondaryMenuModal').then(m => ({ default: m.CareerSecondaryMenuModal })));
const ChangeAcademyModal = React.lazy(() => import('./ChangeAcademyModal').then(m => ({ default: m.ChangeAcademyModal })));
const UniqueCareerStoreModal = React.lazy(() => import('./UniqueCareerStoreModal').then(m => ({ default: m.UniqueCareerStoreModal })));
const CustomizationModal = React.lazy(() => import('./CustomizationModal').then(m => ({ default: m.CustomizationModal })));
const SeasonMatchesFullListModal = React.lazy(() => import('./SeasonMatchesFullListModal').then(m => ({ default: m.SeasonMatchesFullListModal })));
import { AgentModal32Bit } from './AgentModal32Bit';
import { getCardTier } from '../constants';
import { getRomanReputationTier } from '../utils/badReputationSystem';
import { getActiveCompetitionThemeForPlayer } from '../utils/leagueThemeHelper';
import { getCareerLeagueDatabase } from '../utils/careerSaveSystem';
import { PlayerDevelopmentPanel } from './PlayerDevelopmentPanel';
import { PlayerCard } from './PlayerCard';
import {
  getAttributeModifier,
  getEffectiveCategoryStats,
  getEffectivePlayerOvr,
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
} from '../utils/statCalculations';
import { getChemistryInfo } from '../utils/chemistrySystem';
import { isBiggerYouthClubActive } from '../utils/youthAdaptationSystem';
import { canUseTrainButton,
  applyTrainingProgressIncrement,
  getTrainingTransitionAge,
} from '../utils/developmentSystem';
import { useRecoveryPoint } from '../utils/staminaInjurySystem';
import { haptics } from '../utils/hapticsSystem';
import { triggerTactileNav, triggerTactileConfirm } from '../utils/tactileFeedback';
import {
  Play,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  Menu as MenuIcon,
  ArrowRightLeft,
  Heart,
  Users,
  Sparkles,
  Trophy,
  Calendar,
  FastForward,
  Shield,
  Zap,
  CheckCircle2,
  X,
  Volume2,
  Save,
  Globe,
  Settings,
  Flame,
  Award,
  LogOut,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  GraduationCap,
  Scissors,
  Dumbbell,
  Briefcase,
  Pause,
  ListFilter,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TrophyCabinet } from './TrophyCabinet';

const OUTFIELD_ATTR_DEFINITIONS: { key: string; label: string; cat: string }[] = [
  { key: 'pace', label: 'Pace', cat: 'PHY' },
  { key: 'stamina', label: 'Stamina', cat: 'PHY' },
  { key: 'strength', label: 'Strength', cat: 'PHY' },
  { key: 'ballControl', label: 'Ball Control', cat: 'PRO' },
  { key: 'retention', label: 'Retention', cat: 'PRO' },
  { key: 'dribbling', label: 'Dribbling', cat: 'PRO' },
  { key: 'shortPass', label: 'Short Passing', cat: 'CRE' },
  { key: 'longPass', label: 'Long Passing', cat: 'CRE' },
  { key: 'crossing', label: 'Crossing', cat: 'CRE' },
  { key: 'shooting', label: 'Shooting', cat: 'SCO' },
  { key: 'heading', label: 'Heading', cat: 'SCO' },
  { key: 'tackling', label: 'Tackling', cat: 'DEF' },
  { key: 'marking', label: 'Marking', cat: 'DEF' },
  { key: 'interceptions', label: 'Interceptions', cat: 'DEF' },
  { key: 'positioning', label: 'Positioning', cat: 'TAC' },
  { key: 'composure', label: 'Composure', cat: 'TAC' },
];

const GK_ATTR_DEFINITIONS: { key: string; label: string; cat: string }[] = [
  { key: 'saving', label: 'Shot Stopping', cat: 'GK' },
  { key: 'reflexes', label: 'Reflexes', cat: 'GK' },
  { key: 'handling', label: 'Handling', cat: 'GK' },
  { key: 'positioning', label: 'Positioning', cat: 'GK' },
  { key: 'aerialReach', label: 'Aerial Reach', cat: 'GK' },
  { key: 'oneOnOne', label: '1-on-1', cat: 'GK' },
];

export interface CareerHubProps {
  player: PlayerCardData;
  accounting?: AccountingState;
  storeItems?: StoreUpgradeItem[];
  manager?: ManagerState | null;
  seasonYear?: string;
  currentStage?: 'hub' | 'block1' | 'block2' | 'summary' | 'training' | 'national_tournament' | 'season_complete' | string;
  isSimulatingMatches?: boolean;
  isSeasonComplete?: boolean;
  // Simulation callbacks
  onMainSimulationAction: () => void;
  mainActionOverrideTitle?: string;
  mainActionOverrideSubtitle?: string;
  onSkipSeason?: () => void;
  // Primary navigation callbacks
  onOpenStore: () => void;
  onOpenCard: () => void;
  onOpenDevelopment: () => void;
  onOpenCustomization?: () => void;
  onOpenMenu?: () => void;
  onOpenTransfer: () => void;
  onOpenAgent?: () => void;
  onSwitchAcademy?: () => void;
  onTriggerAgentDirective?: (directive: 'pro_contract_renewal' | 'pro_request_transfer' | 'pro_playing_time' | 'tactical_meeting') => void;
  onFireAgent?: () => void;
  // Simulation live progress controls
  activeSimulatingBlock?: 1 | 2 | null;
  simulationSpeed?: 'slow' | 'normal' | 'fast';
  isPaused?: boolean;
  simulationComplete?: boolean;
  displayedMatchesCount?: number;
  totalBlockMatchesCount?: number;
  onTogglePauseSimulation?: () => void;
  onChangeSimulationSpeed?: (speed: 'slow' | 'normal' | 'fast') => void;
  onInstantSimulateAll?: () => void;
  onFinishBlockSimulation?: () => void;
  scheduledTournamentCallUp?: any;
  onStartScheduledTournament?: () => void;
  onSkipScheduledTournament?: () => void;
  // Secondary / context actions
  onRecoverFitness?: () => void;
  onAssignStatPoints?: () => void;
  onResumeTournament?: () => void;
  onOpenParentAdvice?: () => void;
  onWatchAwardsCeremony?: () => void;
  // Competition Draws:
  availableDraw?: {
    competitionName: string;
    shortName: string;
    isImportant?: boolean;
    onOpenDraw: () => void;
  } | null;
  // Yearly Awards:
  hasYearlyAwardsAvailable?: boolean;
  onOpenYearlyAwards?: () => void;
  // Optional secondary modal triggers for MENU
  onOpenWorldResults?: () => void;
  onOpenSaveSlots?: () => void;
  onOpenDatabaseViewer?: () => void;
  onOpenCareerSummary?: () => void;
  onOpenSoundtrack?: () => void;
  onOpenSettings?: () => void;
  onExitToMainMenu?: () => void;
  // State updates
  onUpdatePlayer?: (player: PlayerCardData) => void;
  onUpdateAccounting?: (accounting: AccountingState) => void;
  onUpdateStoreItems?: (items: StoreUpgradeItem[]) => void;
  showToast?: (message: string) => void;
  // Data
  recentMatches?: SimulatedMatchResult[];
  regularOffersCount?: number;
  hasSpecialContractNotification?: boolean;
  specialContractLabel?: string;
  isTestMode?: boolean;
  hasActiveTournament?: boolean;
  activeTournamentName?: string;
  className?: string;
}

const CareerHubComponent: React.FC<CareerHubProps> = ({
  player,
  accounting,
  storeItems = [],
  manager,
  seasonYear = '2026/2027',
  currentStage = 'hub',
  isSimulatingMatches = false,
  isSeasonComplete = false,
  onMainSimulationAction,
  mainActionOverrideTitle,
  mainActionOverrideSubtitle,
  onSkipSeason,
  onOpenStore,
  onOpenCard,
  onOpenDevelopment,
  onOpenCustomization,
  onOpenMenu,
  onOpenTransfer,
  onOpenAgent,
  onSwitchAcademy,
  onTriggerAgentDirective,
  onFireAgent,
  activeSimulatingBlock = null,
  simulationSpeed = 'normal',
  isPaused = false,
  simulationComplete = false,
  displayedMatchesCount = 0,
  totalBlockMatchesCount = 0,
  onTogglePauseSimulation,
  onChangeSimulationSpeed,
  onInstantSimulateAll,
  onFinishBlockSimulation,
  scheduledTournamentCallUp,
  onStartScheduledTournament,
  onSkipScheduledTournament,
  onRecoverFitness,
  onAssignStatPoints,
  onResumeTournament,
  onOpenParentAdvice,
  onWatchAwardsCeremony,
  availableDraw = null,
  hasYearlyAwardsAvailable = false,
  onOpenYearlyAwards,
  onOpenWorldResults,
  onOpenSaveSlots,
  onOpenDatabaseViewer,
  onOpenCareerSummary,
  onOpenSoundtrack,
  onOpenSettings,
  onExitToMainMenu,
  onUpdatePlayer,
  onUpdateAccounting,
  onUpdateStoreItems,
  showToast,
  recentMatches = [],
  regularOffersCount = 0,
  hasSpecialContractNotification = false,
  specialContractLabel,
  isTestMode = false,
  hasActiveTournament = false,
  activeTournamentName,
  className = '',
}) => {
  const { t } = useLanguage();
  const [showSecondaryMenu, setShowSecondaryMenu] = useState<boolean>(false);
  const [showCardPreviewModal, setShowCardPreviewModal] = useState<boolean>(false);
  const [showUniqueStoreModal, setShowUniqueStoreModal] = useState<boolean>(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState<boolean>(false);
  const [showDevelopmentModal, setShowDevelopmentModal] = useState<boolean>(false);
  const [showAgentModal, setShowAgentModal] = useState<boolean>(false);
  const [showFullSeasonMatchesModal, setShowFullSeasonMatchesModal] = useState<boolean>(false);
  const [showTrophyCabinetModal, setShowTrophyCabinetModal] = useState<boolean>(false);
  const [developmentSection, setDevelopmentSection] = useState<'player' | 'club'>('player');
  const [developmentSubTab, setDevelopmentSubTab] = useState<'attributes' | 'training' | 'stamina' | 'positions'>('attributes');

  // Determine stage & styling
  const isPro = isProfessionalPlayer(player);
  const playerAge = player.age || 15;
  const fitnessPct = getFitnessPercentage(player);
  const chemistryVal = Math.max(0, Math.min(100, player.chemistry ?? 50));
  const unassignedPoints = (player.unassignedPoints || 0) + (player.freeStatPoints || 0);
  const recoveryPoints = typeof player.recoveryPoints === 'number' ? player.recoveryPoints : 0;
  const recoverySupplements = player.recoverySupplements || 0;

  // Training & Transition Age
  const trainingProgress = typeof player.trainingProgress === 'number' ? player.trainingProgress : 0;
  const trainInfo = canUseTrainButton(player);
  const transitionAge = getTrainingTransitionAge(player);

  // OVR Badge Tier & Color-Coding (matches card tier: Bronze, Silver, Gold, Legendary, Iconic)
  const ovrTier = useMemo(() => {
    return getCardTier(player.ovr || 50);
  }, [player.ovr]);

  const ovrBadgeTierStyle = useMemo(() => {
    switch (ovrTier) {
      case 'white':
      case 'bronze':
        return 'bg-gradient-to-br from-[#b45309] via-[#92400e] to-[#78350f] text-amber-100 border-2 border-amber-500 pixel-bevel-gold shadow-[0_0_12px_rgba(180,83,9,0.5)]';
      case 'silver':
        return 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 text-slate-950 border-2 border-slate-300 pixel-bevel-raised shadow-[0_0_12px_rgba(203,213,225,0.5)]';
      case 'gold':
        return 'bg-gradient-to-br from-[#fef08a] via-[#eab308] to-[#ca8a04] text-slate-950 border-2 border-yellow-300 pixel-bevel-gold shadow-[0_0_15px_rgba(234,179,8,0.6)]';
      case 'legendary':
        return 'bg-gradient-to-br from-purple-600 via-purple-800 to-slate-950 text-purple-100 border-2 border-purple-400 pixel-bevel-raised shadow-[0_0_18px_rgba(168,85,247,0.6)]';
      case 'goat':
        return 'bg-gradient-to-br from-cyan-400 via-sky-600 to-indigo-900 text-white border-2 border-cyan-300 pixel-bevel-cyan shadow-[0_0_20px_rgba(6,182,212,0.7)]';
      default:
        return 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 text-amber-100 border-2 border-amber-500 pixel-bevel-gold';
    }
  }, [ovrTier]);

  // Career Fame and Bad Reputation
  const fameVal = Math.min(1000, Math.max(0, player.fame || 0));
  const badRepTier = Math.min(3, Math.max(0, player.badReputationTier ?? 0));
  const badRepMeter = Math.min(100, Math.max(0, player.badReputation ?? 0));
  const badRepRoman = getRomanReputationTier(badRepTier);
  const [showBadRepExplainer, setShowBadRepExplainer] = useState<boolean>(false);

  const handleOpenStore = () => {
    setShowUniqueStoreModal(true);
  };

  const handleOpenCustomization = () => {
    setShowCustomizationModal(true);
    if (onOpenCustomization) onOpenCustomization();
  };

  const handleOpenDevelopment = (
    section: 'player' | 'club' = 'player',
    tab: 'attributes' | 'training' | 'stamina' | 'positions' = 'attributes'
  ) => {
    setDevelopmentSection(section);
    setDevelopmentSubTab(tab);
    setShowDevelopmentModal(true);
    if (onOpenDevelopment) onOpenDevelopment();
  };

  const handleAssignStatPoints = () => {
    setDevelopmentSection('player');
    setDevelopmentSubTab('attributes');
    setShowDevelopmentModal(true);
    if (onAssignStatPoints) onAssignStatPoints();
  };

  const handleOpenTraining = () => {
    setDevelopmentSection('player');
    setDevelopmentSubTab('training');
    setShowDevelopmentModal(true);
  };

  const handleAdvanceTraining = () => {
    const currentTrain = canUseTrainButton(player);
    if (!currentTrain.canTrain) {
      showToast?.(`❌ ${currentTrain.reason}`);
      return;
    }
    const result = applyTrainingProgressIncrement(player, 10);
    const updated = result.updatedPlayer;
    if (currentTrain.windowLabel === 'preseason') {
      updated.usedPreseasonTrain = true;
    } else if (currentTrain.windowLabel === 'midseason') {
      updated.usedMidseasonTrain = true;
    }
    if (onUpdatePlayer) {
      onUpdatePlayer(updated);
    }
    showToast?.(result.message);
  };

  const handleUseRecoveryPoint = () => {
    const availablePoints = typeof player.recoveryPoints === 'number' ? player.recoveryPoints : 0;
    if (availablePoints <= 0) {
      showToast?.('❌ No Recovery Points available! Purchase supplements in the Unique Career Store.');
      return;
    }

    if (player.isInjured) {
      const res = useRecoveryPoint(player);
      if (res.success && onUpdatePlayer) {
        onUpdatePlayer(res.updatedPlayer);
      }
      showToast?.(res.message);
      return;
    }

    if (fitnessPct >= 100) {
      showToast?.('⚡ Fitness is already at maximum (100%)!');
      return;
    }

    const newFitness = Math.min(100, fitnessPct + 20);
    const newPoints = Math.max(0, availablePoints - 1);
    if (onUpdatePlayer) {
      onUpdatePlayer({
        ...player,
        fitness: newFitness,
        staminaCurrent: newFitness,
        recoveryPoints: newPoints,
      });
    }
    showToast?.(`⚡ Restored +20% Fitness! (${newFitness}%, Remaining Recovery Points: ${newPoints})`);
  };

  // Card Showcase & Sash Visibility State
  const cardSectionRef = useRef<HTMLDivElement>(null);
  const [isCardVisible, setIsCardVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('careerHub_showPlayerCard') !== 'false';
    } catch {
      return true;
    }
  });
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [showChangeAcademyModal, setShowChangeAcademyModal] = useState<boolean>(false);

  const toggleCardVisibility = () => {
    setIsCardVisible((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('careerHub_showPlayerCard', String(next));
      } catch {}
      return next;
    });
  };

  const isGoalkeeper = useMemo(() => {
    const pos = ((player.subPosition || player.position || '') as string).toUpperCase();
    return pos === 'GK';
  }, [player.position, player.subPosition]);

  const { categoryBonuses } = useMemo(() => {
    return getEffectiveCategoryStats(player);
  }, [player]);

  const ovrAnalysis = useMemo(() => {
    return getEffectivePlayerOvr(player);
  }, [player]);

  const detailedModifiers = useMemo(() => {
    const statsSource = isGoalkeeper
      ? getOrCreateGkDetailed(player.stats)
      : getOrCreateOutfieldDetailed(player.stats);
    const defs = isGoalkeeper ? GK_ATTR_DEFINITIONS : OUTFIELD_ATTR_DEFINITIONS;

    const positives: { key: string; label: string; bonus: number; cat: string }[] = [];
    const negatives: { key: string; label: string; penalty: number; cat: string }[] = [];

    defs.forEach((def) => {
      const baseVal = (statsSource as any)[def.key] || 40;
      const mod = getAttributeModifier(player, def.key, baseVal);
      if (mod.bonus > 0) {
        positives.push({ key: def.key, label: def.label, bonus: mod.bonus, cat: def.cat });
      }
      if (mod.penalty > 0) {
        negatives.push({ key: def.key, label: def.label, penalty: mod.penalty, cat: def.cat });
      }
    });

    // Specific positive sources
    const bonusReasons: string[] = [];
    if (Array.isArray(player.activeEquipment) && player.activeEquipment.length > 0) {
      player.activeEquipment.forEach((eq) => {
        const remaining = eq.durability?.current ?? eq.matchDuration ?? 0;
        if (remaining > 0) {
          bonusReasons.push(`Pro Equipment: ${eq.name} (${remaining} matches remaining)`);
        }
      });
    }
    if (Array.isArray(player.activeSeasonBoosts) && player.activeSeasonBoosts.length > 0) {
      player.activeSeasonBoosts.forEach((sb) => {
        bonusReasons.push(`Season Boost: ${sb.name || sb.id}`);
      });
    }
    if (Array.isArray(player.activeConsumables) && player.activeConsumables.length > 0) {
      player.activeConsumables.forEach((c) => {
        bonusReasons.push(`Active Consumable: ${c.name}`);
      });
    }
    if (typeof player.chemistry === 'number' && player.chemistry > 100) {
      bonusReasons.push(`Overflow Chemistry Synergy: +${player.chemistry - 100}% overflow (+1 cascading stat points)`);
    }
    const specialHair =
      player.biometrics?.specialHair ||
      (player.accessories as any)?.specialHair ||
      (player.biometrics as any)?.specialHairType;
    if (specialHair) {
      bonusReasons.push(`Styling Bonus: Special Hairstyle (${specialHair})`);
    }

    // Specific negative sources
    const penaltyReasons: string[] = [];
    const chemInfo = getChemistryInfo(
      player.chemistry,
      player.chemistryCeiling,
      player.chemistryCeilingMonthsRemaining,
      player.chemistryCeilingReason,
      player.chemistryGainHalvedMonthsRemaining,
      player.chemistryCaps
    );
    if (chemInfo.penaltyPercent > 0) {
      penaltyReasons.push(
        `Sub-100% Team Chemistry: -${chemInfo.penaltyPercent}% penalty across all base stats (${player.chemistry || 0}% / 100%)`
      );
    }
    if (player.youthLeagueStaminaPenalty && isBiggerYouthClubActive(player)) {
      penaltyReasons.push(
        `Bigger Youth Club Adaptation: -${Math.abs(player.youthLeagueStaminaPenalty)} Stamina drain in high-tempo academy tier`
      );
    }
    if ((player as any).relaxingVacationActive) {
      penaltyReasons.push('Off-Season Vacation Downtime: -10 Stamina');
    }
    if ((player.growthSpurtPenaltyMonthsRemaining ?? 0) > 0) {
      penaltyReasons.push(
        `Growth Spurt Biometric Adjustment: -10 Dribbling & -10 Ball Control (${player.growthSpurtPenaltyMonthsRemaining} months left)`
      );
    }
    if (Array.isArray(player.activeTemporalCards)) {
      player.activeTemporalCards.forEach((tc) => {
        if (tc.remainingMonths > 0 && tc.statDeltas) {
          Object.entries(tc.statDeltas).forEach(([st, d]) => {
            if (typeof d === 'number' && d < 0) {
              penaltyReasons.push(`${tc.name || 'Temporal Card'}: ${d} ${st}`);
            }
          });
        }
      });
    }

    return {
      positives,
      negatives,
      bonusReasons,
      penaltyReasons,
      totalBonusPoints: positives.reduce((acc, p) => acc + p.bonus, 0),
      totalPenaltyPoints: negatives.reduce((acc, n) => acc + n.penalty, 0),
    };
  }, [player, isGoalkeeper]);

  // Full season simulated matches in chronological order
  const seasonMatches = useMemo<SimulatedMatchResult[]>(() => {
    if (Array.isArray(recentMatches)) {
      return recentMatches;
    }
    return (player as any).lastSimulatedMatches || [];
  }, [recentMatches, (player as any).lastSimulatedMatches]);

  // Extract last 3 simulated matches:
  // Chronologically newest match is ALWAYS FIRST (index 0: top on mobile, left on desktop)
  // When match 1 is simulated: [m1] -> 1st spot is m1
  // When match 2 is simulated: [m2, m1] -> 1st spot is m2, 2nd spot is m1
  // When match 3 is simulated: [m3, m2, m1] -> 1st spot is m3, 2nd spot is m2, 3rd spot is m1
  // When match 4 is simulated: [m4, m3, m2] -> 1st spot is m4, 2nd spot is m3, 3rd spot is m2 (oldest m1 dropped)
  const last3Matches = useMemo(() => {
    if (!seasonMatches || seasonMatches.length === 0) return [];
    return seasonMatches.slice(-3).reverse();
  }, [seasonMatches]);

  // Determine Dynamic Next Calendar Action Title & Subtitle
  const { dynamicActionTitle, dynamicActionSubtitle } = useMemo(() => {
    // 1. Explicit override if provided
    if (mainActionOverrideTitle) {
      return {
        dynamicActionTitle: mainActionOverrideTitle,
        dynamicActionSubtitle: mainActionOverrideSubtitle || 'CALENDAR EVENT READY',
      };
    }

    // 2. Active Special Tournament
    if (hasActiveTournament && activeTournamentName) {
      return {
        dynamicActionTitle: `PROCEED TO ${activeTournamentName.toUpperCase()}`,
        dynamicActionSubtitle: 'INTERNATIONAL FIXTURES • SCHEDULE READY',
      };
    }

    // 3. Season completion -> Season Summary
    if (isSeasonComplete || currentStage === 'summary') {
      return {
        dynamicActionTitle: 'PROCEED TO SEASON SUMMARY',
        dynamicActionSubtitle: 'FINAL STANDINGS, COMPILATION & AWARDS • SEASON COMPLETE',
      };
    }

    // 4. Preseason / Training
    if (currentStage === 'training') {
      return {
        dynamicActionTitle: 'PROCEED TO PRESEASON',
        dynamicActionSubtitle: 'TRAINING SESSIONS & ATTRIBUTE PROGRESSION',
      };
    }

    // 5. Block 2 / Winter Block
    if (currentStage === 'block2') {
      return {
        dynamicActionTitle: 'PROCEED TO WINTER BLOCK',
        dynamicActionSubtitle: 'WINTER FIXTURES (JAN – MAY) • SCHEDULE READY',
      };
    }

    // 6. Block 1 / Summer Block
    return {
      dynamicActionTitle: isPro ? 'PROCEED TO SUMMER BLOCK' : 'SIMULATE NEXT BLOCK',
      dynamicActionSubtitle: 'BLOCK 1 FIXTURES (AUG – DEC) • 15 MATCHES',
    };
  }, [
    mainActionOverrideTitle,
    mainActionOverrideSubtitle,
    hasActiveTournament,
    activeTournamentName,
    isSeasonComplete,
    currentStage,
    isPro,
  ]);

  // Contextual action triggers
  const canQuickRecover = fitnessPct < 80 && (recoveryPoints > 0 || recoverySupplements > 0);

  // DYNAMIC LEAGUE BRANDING & DESIGN CONFIGURATION:
  // Shapes, bevels, gradients, and colors adjust to match the active league / tournament design.
  const compTheme = useMemo(() => {
    return getActiveCompetitionThemeForPlayer(player, getCareerLeagueDatabase(), activeTournamentName || undefined);
  }, [player, activeTournamentName]);

  const pDesign = compTheme.design;
  const primaryHex = compTheme.branding.primaryHex || (isPro ? '#F59E0B' : '#10B981');
  const secondaryHex = compTheme.branding.secondaryHex || '#0F172A';
  const accentHex = compTheme.branding.accentHex || (isPro ? '#38BDF8' : '#34D399');

  const shapeClass = useMemo(() => {
    switch (pDesign.shape) {
      case 'rhomboid_chamfer':
        return '[clip-path:polygon(12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%,0_12px)] rounded-sm';
      case 'architectural_double':
        return 'rounded-md border-4 border-double';
      case 'tactical_chalkboard':
        return 'rounded-lg border-2 border-dashed border-emerald-500/80';
      case 'modern_rounded':
        return 'rounded-2xl sm:rounded-3xl';
      case 'modern_square':
        return 'rounded-none border-2';
      case 'classic':
        return 'pixel-corners';
      case 'futuristic':
        return 'rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm';
      case 'simple':
        return 'rounded-lg';
      default:
        return 'pixel-corners';
    }
  }, [pDesign.shape]);

  const theme = useMemo(() => {
    const isChalkboard = pDesign.shape === 'tactical_chalkboard' || (!isPro && !pDesign.shape);
    const isChamfer = pDesign.shape === 'rhomboid_chamfer';
    const isDouble = pDesign.shape === 'architectural_double';
    const isRounded = pDesign.shape === 'modern_rounded';
    const isSquare = pDesign.shape === 'modern_square';

    let cardBg = 'bg-slate-900/90 border-slate-700/80 pixel-bevel-sunken';
    if (isChalkboard) {
      cardBg = 'bg-[#032318]/95 border-2 border-dashed border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.2)] rounded-lg';
    } else if (isChamfer) {
      cardBg = 'bg-slate-900/95 border-2 border-purple-500/60 shadow-[0_0_20px_rgba(168,85,247,0.25)] rounded-sm [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]';
    } else if (isDouble) {
      cardBg = 'bg-slate-900/90 border-4 border-double border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.2)] rounded-md';
    } else if (isRounded) {
      cardBg = 'bg-slate-900/90 border border-rose-500/40 rounded-2xl shadow-xl';
    } else if (isSquare) {
      cardBg = 'bg-slate-900/95 border-2 border-red-600/70 rounded-none shadow-2xl';
    }

    return {
      mode: isPro ? ('pro' as const) : ('youth' as const),
      stageLabel: activeTournamentName
        ? activeTournamentName.toUpperCase()
        : isPro
        ? (compTheme.competitionName ? `${compTheme.competitionName.toUpperCase()}` : 'PROFESSIONAL CAREER')
        : `YOUTH ACADEMY • U-${Math.min(18, Math.max(10, playerAge))}`,
      badgeBg: isPro
        ? `bg-slate-950/90 text-amber-300 border border-amber-500/80 pixel-bevel-gold shadow-[0_0_12px_${accentHex}40]`
        : `bg-[#021810] text-emerald-300 border border-emerald-500/80 pixel-bevel-emerald shadow-[0_0_12px_rgba(16,185,129,0.3)]`,
      stageIcon: activeTournamentName ? (
        <Trophy className="w-3.5 h-3.5 text-amber-400" />
      ) : isPro ? (
        <Trophy className="w-3.5 h-3.5 text-amber-400" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
      ),
      containerBg: isChalkboard ? 'bg-[#02140d]/95' : 'bg-slate-950/95',
      cardBg,
      cardBorder: isChalkboard ? 'border-emerald-500/70' : 'border-slate-700 hover:border-amber-400',
      hubBorder: `border-2 shadow-[0_0_35px_rgba(0,0,0,0.5)]`,
      primaryBtnGradient: isPro
        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 pixel-bevel-gold shadow-[0_4px_0_0_#713f12] active:translate-y-1 active:shadow-none border-2 border-amber-300'
        : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 pixel-bevel-emerald shadow-[0_4px_0_0_#022c22] active:translate-y-1 active:shadow-none border-2 border-emerald-300',
      accentColor: isPro ? 'text-amber-400' : 'text-emerald-400',
      secondaryPill: isPro
        ? 'bg-amber-950/80 border border-amber-500/60 text-amber-200'
        : 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-200',
      navHover: isPro
        ? 'hover:border-amber-400 hover:bg-amber-500/15'
        : 'hover:border-emerald-400 hover:bg-emerald-500/15',
      fitnessColor: isPro
        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
        : 'bg-gradient-to-r from-lime-400 to-emerald-500',
      chemistryColor: isPro
        ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
        : 'bg-gradient-to-r from-teal-400 to-cyan-400',
      topStripBg: isPro
        ? 'bg-slate-900/95 border-b-2 border-amber-500/60 pixel-bevel-raised'
        : 'bg-[#021810]/95 border-b-2 border-emerald-500/60 pixel-bevel-raised',
      matchItemBorder: isPro
        ? 'border-amber-500/40 hover:border-amber-400'
        : 'border-emerald-500/40 hover:border-emerald-400',
      badgeHex: primaryHex,
      accentHex: accentHex,
      shapeClass,
    };
  }, [isPro, playerAge, compTheme, primaryHex, accentHex, activeTournamentName, shapeClass, pDesign.shape]);

  return (
    <React.Suspense fallback={null}>
      <div
        id="career-hub-screen"
      className={`w-full max-w-7xl mx-auto flex flex-col justify-between text-slate-100 relative ${theme.hubBorder} ${theme.containerBg} pixel-corners p-2 sm:p-5 md:p-7 backdrop-blur-xl transition-all duration-200 shadow-2xl select-none font-pixel ${className}`}
    >
      {/* 32-Bit Scanline & Pitch/Dither Texture Overlay */}
      <div className="absolute inset-0 pixel-scanlines opacity-25 pointer-events-none z-0" />
      {isPro ? (
        <div className="absolute inset-0 pixel-dither-pattern opacity-10 pointer-events-none z-0" />
      ) : (
        <div className="absolute inset-0 pixel-pitch-stripes opacity-15 pointer-events-none z-0" />
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER STRIP: IDENTITY, STATUS BARS & TRANSFER (TOP-RIGHT) */}
      {/* ========================================================================= */}
      <div
        className={`relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-4 p-2.5 sm:p-4 ${theme.shapeClass} ${theme.topStripBg} mb-3 sm:mb-4 transition-all`}
        style={{
          borderColor: isPro ? `${primaryHex}cc` : undefined,
          boxShadow: isPro ? `0 0 22px ${primaryHex}25, 0 4px 6px -1px rgba(0, 0, 0, 0.5)` : undefined,
        }}
      >
        {/* PLAYER IDENTITY & STAGE BADGE */}
        <div className="flex items-center gap-3">
          {/* Nationality / Flag */}
          {player.nationality?.iso && (
            <img
              src={`https://flagcdn.com/w40/${player.nationality.iso.toLowerCase()}.png`}
              alt={player.nationality.name}
              className={`w-8 h-5 ${theme.shapeClass} object-cover shadow-sm border border-slate-600 shrink-0`}
              referrerPolicy="no-referrer"
            />
          )}

          {/* OVR RETRO BADGE - COLOR CODED BY CARD TIER WITH DYNAMIC LEAGUE GLOW */}
          <div
            id="career-hub-player-ovr"
            className={`w-11 h-11 sm:w-12 sm:h-12 flex flex-col items-center justify-center ${theme.shapeClass} ${ovrBadgeTierStyle} shrink-0 transition-all`}
            style={{
              borderColor: isPro ? primaryHex : undefined,
              boxShadow: isPro ? `0 0 16px ${primaryHex}80, inset 0 0 8px ${accentHex}60` : undefined,
            }}
            title={`Overall Rating: ${player.ovr || 50} (${ovrTier.toUpperCase()} TIER)`}
          >
            <span className="text-[8px] font-black tracking-tighter uppercase leading-none opacity-85">
              OVR
            </span>
            <span className="text-base sm:text-lg font-black font-arcade leading-none">
              {player.ovr || 50}
            </span>
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white truncate uppercase pixel-text-shadow">
                {player.firstName} {player.lastName}
              </h2>
              <span className={`text-[10px] font-black px-2 py-0.5 pixel-corners ${theme.secondaryPill}`}>
                {player.position || 'ST'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-retro text-slate-400 flex-wrap">
              <span className="font-semibold text-slate-300 truncate">
                {player.club || (isPro ? 'Free Agent' : 'Youth Academy')}
              </span>
              <span>•</span>
              <span className="text-amber-300 font-bold">AGE {playerAge}</span>
              <span>•</span>
              <span className="text-cyan-300">{seasonYear}</span>
            </div>
          </div>
        </div>

        {/* COMPACT 32-BIT STATUS BARS: FITNESS, CHEMISTRY, TRAINING, FAME & BAD REPUTATION */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 flex-1 max-w-4xl mx-auto md:mx-3 w-full">
          {/* FITNESS STATUS BAR */}
          <div
            onClick={handleUseRecoveryPoint}
            className={`bg-slate-950/90 border border-slate-700 ${theme.shapeClass} p-2 sm:px-2.5 sm:py-2 pixel-bevel-sunken shadow-inner cursor-pointer hover:border-rose-400/80 transition-all`}
            title={
              player.isInjured
                ? `Injured (${player.injuryWeeksRemaining || 1}w remaining). Tap to use 1 Recovery Point to reduce injury duration.`
                : fitnessPct < 100
                ? `Fitness ${fitnessPct}%. Tap to use 1 Recovery Point to restore +20% fitness. Available RP: ${recoveryPoints}`
                : `Fitness 100% (Peak Condition). Available RP: ${recoveryPoints}`
            }
          >
            <div className="flex items-center justify-between text-[10px] font-arcade mb-1.5">
              <span className="flex items-center gap-1 text-slate-300 font-black">
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                FITNESS
              </span>
              <div className="flex items-center gap-1">
                {recoveryPoints > 0 && (
                  <span className={`text-[8px] px-1 py-0.2 bg-rose-950 border border-rose-500/60 text-rose-300 ${theme.shapeClass} font-pixel`}>
                    {recoveryPoints}RP
                  </span>
                )}
                <span
                  className={
                    fitnessPct < 70
                      ? 'text-rose-400 font-black animate-pixel-blink'
                      : fitnessPct < 85
                      ? 'text-amber-400 font-black'
                      : 'text-emerald-400 font-black'
                  }
                >
                  {fitnessPct}%
                </span>
              </div>
            </div>
            {/* 8-segment pixel stamina block */}
            <div className={`grid grid-cols-8 gap-0.5 w-full h-2 bg-slate-900 p-0.5 border border-slate-800 ${theme.shapeClass}`}>
              {Array.from({ length: 8 }).map((_, i) => {
                const isActive = (fitnessPct / 100) * 8 > i;
                const segColor =
                  fitnessPct < 70
                    ? 'bg-rose-500 border-rose-400'
                    : fitnessPct < 85
                    ? 'bg-amber-400 border-amber-300'
                    : 'bg-emerald-400 border-emerald-300';
                return (
                  <div
                    key={i}
                    className={`h-full ${
                      isActive ? `${segColor} border-t` : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            {player.isInjured ? (
              <span className="text-[9px] font-black text-rose-400 uppercase tracking-tight block pt-1 animate-pixel-blink truncate">
                ⚠ INJURED ({player.injuryWeeksRemaining || 1}w) • TAP HEAL
              </span>
            ) : (
              <span className="text-[9px] font-retro text-slate-400 block pt-1 truncate">
                {recoveryPoints > 0 ? `${recoveryPoints} Recovery Pts` : 'Matchday Stamina'}
              </span>
            )}
          </div>

          {/* CHEMISTRY STATUS BAR */}
          <div
            onClick={() => setShowSecondaryMenu(true)}
            className={`bg-slate-950/90 border border-slate-700 ${theme.shapeClass} p-2 sm:px-2.5 sm:py-2 pixel-bevel-sunken shadow-inner cursor-pointer hover:border-teal-400/80 transition-all`}
            title={`Team Chemistry: ${chemistryVal}%. Tap to open Team Chemistry in Menu.`}
          >
            <div className="flex items-center justify-between text-[10px] font-arcade mb-1.5">
              <span className="flex items-center gap-1 text-slate-300 font-black">
                <Users className="w-3 h-3 text-teal-400" />
                CHEMISTRY
              </span>
              <span className="text-teal-300 font-black">{chemistryVal}%</span>
            </div>
            {/* 8-segment pixel chemistry block */}
            <div className={`grid grid-cols-8 gap-0.5 w-full h-2 bg-slate-900 p-0.5 border border-slate-800 ${theme.shapeClass}`}>
              {Array.from({ length: 8 }).map((_, i) => {
                const isActive = (chemistryVal / 100) * 8 > i;
                return (
                  <div
                    key={i}
                    className={`h-full ${
                      isActive ? 'bg-teal-400 border-t border-teal-300' : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-[9px] font-retro text-slate-400 block pt-1 truncate">
              Squad Harmony
            </span>
          </div>

          {/* TRAINING PROGRESS BAR */}
          <div
            onClick={handleOpenTraining}
            className={`bg-slate-950/90 border border-slate-700 ${theme.shapeClass} p-2 sm:px-2.5 sm:py-2 pixel-bevel-sunken shadow-inner cursor-pointer hover:border-purple-400/80 transition-all`}
            title={`Training Progress: ${Math.round(trainingProgress)}% / 100%. Next milestone: ${
              playerAge >= transitionAge
                ? 'Protects stats against age-related decline'
                : '+1 progression to all attributes at 100%'
            }. Tap to open Training.`}
          >
            <div className="flex items-center justify-between text-[10px] font-arcade mb-1.5">
              <span className="flex items-center gap-1 text-slate-300 font-black">
                <Dumbbell className="w-3 h-3 text-purple-400" />
                TRAIN
              </span>
              <div className="flex items-center gap-1">
                {trainInfo.canTrain && (
                  <span className={`text-[8px] px-1 py-0.2 bg-purple-950 border border-purple-400 text-purple-200 ${theme.shapeClass} font-pixel animate-pixel-blink`}>
                    READY
                  </span>
                )}
                <span className="text-purple-300 font-black">
                  {Math.round(trainingProgress)}%
                </span>
              </div>
            </div>
            {/* 8-segment pixel training block */}
            <div className={`grid grid-cols-8 gap-0.5 w-full h-2 bg-slate-900 p-0.5 border border-slate-800 ${theme.shapeClass}`}>
              {Array.from({ length: 8 }).map((_, i) => {
                const isActive = (trainingProgress / 100) * 8 > i;
                return (
                  <div
                    key={i}
                    className={`h-full ${
                      isActive ? 'bg-purple-400 border-t border-purple-300' : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[9px] font-retro text-slate-400 pt-1 truncate">
              <span className="truncate">
                {playerAge >= transitionAge ? 'Decline Shield' : 'Milestone: +1'}
              </span>
              {trainInfo.canTrain ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvanceTraining();
                  }}
                  className="text-[8px] font-black uppercase text-amber-300 hover:text-white underline cursor-pointer shrink-0 ml-1"
                >
                  Train
                </button>
              ) : null}
            </div>
          </div>

          {/* FAME STATUS BAR */}
          <div
            className={`bg-slate-950/90 border border-slate-700 ${theme.shapeClass} p-2 sm:px-2.5 sm:py-2 pixel-bevel-sunken shadow-inner cursor-pointer hover:border-amber-400/80 transition-all`}
            title={`World Fame: ${fameVal}/1000. Higher fame unlocks global commercial sponsorships, media spotlight, and prestigious club interest.`}
          >
            <div className="flex items-center justify-between text-[10px] font-arcade mb-1.5">
              <span className="flex items-center gap-1 text-slate-300 font-black">
                <Award className="w-3 h-3 text-amber-400" />
                FAME
              </span>
              <span className="text-amber-300 font-black">{fameVal}</span>
            </div>
            {/* 8-segment pixel fame block */}
            <div className={`grid grid-cols-8 gap-0.5 w-full h-2 bg-slate-900 p-0.5 border border-slate-800 ${theme.shapeClass}`}>
              {Array.from({ length: 8 }).map((_, i) => {
                const isActive = (fameVal / 1000) * 8 > i;
                return (
                  <div
                    key={i}
                    className={`h-full ${
                      isActive ? 'bg-amber-400 border-t border-amber-300' : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-[9px] font-retro text-slate-400 block pt-1 truncate">
              Global Prestige
            </span>
          </div>

          {/* BAD REPUTATION STATUS BAR */}
          <div
            onClick={() => setShowBadRepExplainer(true)}
            className={`bg-slate-950/90 border ${
              badRepTier >= 1 ? 'border-rose-600/80 hover:border-rose-400' : 'border-slate-700 hover:border-rose-400/80'
            } ${theme.shapeClass} p-2 sm:px-2.5 sm:py-2 pixel-bevel-sunken shadow-inner cursor-pointer transition-all col-span-2 sm:col-span-1`}
            title={`Bad Reputation: ${badRepTier > 0 ? `Tier ${badRepRoman} (${badRepMeter}%)` : `${badRepMeter}%`}. Tap to inspect active penalties and reputation floor.`}
          >
            <div className="flex items-center justify-between text-[10px] font-arcade mb-1.5">
              <span className="flex items-center gap-1 text-slate-300 font-black">
                <Flame className="w-3 h-3 text-rose-500 fill-rose-500/30" />
                BAD REP
              </span>
              <div className="flex items-center gap-1.5">
                {badRepTier > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[16px] h-3.5 px-1 text-[8px] font-pixel font-black bg-rose-950 text-rose-300 border border-rose-500 ${theme.shapeClass} shadow-[0_0_8px_rgba(244,63,94,0.5)]`}>
                    {badRepRoman}
                  </span>
                )}
                <span className={badRepTier > 0 ? 'text-rose-400 font-black' : 'text-slate-300 font-black'}>
                  {badRepTier >= 3 ? '100%' : `${badRepMeter}%`}
                </span>
              </div>
            </div>
            {/* 8-segment pixel bad rep block */}
            <div className={`grid grid-cols-8 gap-0.5 w-full h-2 bg-slate-900 p-0.5 border border-slate-800 ${theme.shapeClass}`}>
              {Array.from({ length: 8 }).map((_, i) => {
                const isActive = (badRepMeter / 100) * 8 > i || badRepTier >= 3;
                return (
                  <div
                    key={i}
                    className={`h-full ${
                      isActive ? 'bg-rose-500 border-t border-rose-400' : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-[9px] font-retro text-rose-400 block pt-1 truncate font-bold tracking-wide">
              {badRepTier === 0
                ? 'Clean Record'
                : badRepTier === 1
                ? 'I "Bad Boy"'
                : badRepTier === 2
                ? 'II "Menace"'
                : 'III "Psycho"'}
            </span>
          </div>
        </div>

        {/* TOP-RIGHT: TRANSFER OR CHANGE ACADEMY BUTTON & OFFER NOTIFICATIONS */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          {(!isPro || playerAge < 17 || (player.club || '').toLowerCase().includes('youth')) ? (
            // YOUTH ACADEMY (YOUTH LEAGUE):
            // Under 50 fame: nothing appears here!
            // 50-100 fame: Change Academy (same youth league)
            // > 100 fame: Change Academy (domestic + international youth leagues)
            (player.fame || 0) >= 50 ? (
              <button
                id="career-hub-change-academy-button"
                type="button"
                onClick={() => setShowChangeAcademyModal(true)}
                className="group relative px-3.5 sm:px-4 py-2 sm:py-2.5 pixel-corners border-2 border-emerald-500/80 bg-slate-900 hover:bg-slate-850 hover:border-emerald-400 pixel-bevel-emerald shadow-md flex items-center gap-2 transition-all active:translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
                title={
                  (player.fame || 0) > 100
                    ? 'Change Academy: Domestic & International Youth Academies Available (>100 Fame)'
                    : 'Change Academy: Domestic Youth League Academies Available (50-100 Fame)'
                }
              >
                <GraduationCap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  CHANGE ACADEMY
                </span>

                {(player.fame || 0) > 100 && (
                  <span
                    id="career-hub-international-academy-badge"
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 pixel-corners bg-sky-600 border border-sky-300 text-white text-[9px] font-black shadow-sm animate-pixel-blink"
                    title="International Academies Available (>100 Fame)"
                  >
                    INTL
                  </span>
                )}
              </button>
            ) : null
          ) : (
            // PROFESSIONAL (AGE 17+ WITH PRO CONTRACT):
            // TRANSFER BUTTON
            <button
              id="career-hub-transfer-button"
              type="button"
              onClick={onOpenTransfer}
              className="group relative px-3.5 sm:px-4 py-2 sm:py-2.5 pixel-corners border-2 border-amber-500/80 bg-slate-900 hover:bg-slate-850 hover:border-amber-400 pixel-bevel-gold shadow-md flex items-center gap-2 transition-all active:translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
              title="Open Transfer Offers & Contracts"
            >
              <ArrowRightLeft className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                TRANSFER
              </span>

              {/* RED ! [NUMBER] for Regular Offers (max 4) */}
              {regularOffersCount > 0 && (
                <span
                  id="career-hub-regular-transfer-badge"
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 pixel-corners bg-rose-600 border border-rose-300 text-white text-[10px] font-black shadow-sm animate-pixel-blink"
                  title={`${Math.min(4, regularOffersCount)} Regular Transfer Offers Available`}
                >
                  <span>!</span>
                  <span className="font-arcade">{Math.min(4, regularOffersCount)}</span>
                </span>
              )}

              {/* BLUE ! for Special Contract Opportunity */}
              {hasSpecialContractNotification && (
                <span
                  id="career-hub-special-transfer-badge"
                  className="inline-flex items-center justify-center px-1.5 py-0.5 pixel-corners bg-sky-600 border border-sky-300 text-white text-[10px] font-black shadow-sm animate-pixel-blink"
                  title="Special Sign-In Event Contract Opportunity Available"
                >
                  <span>!</span>
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SIMULATION HERO ACTION & CONTEXT ACTIONS */}
      {/* ========================================================================= */}
      <div className="my-4 sm:my-6 text-center space-y-3 relative z-10">
        {/* STAGE IDENTITY BADGE */}
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all">
          <span
            className={`px-3 py-1 ${theme.shapeClass} border flex items-center gap-1.5 shadow-md ${theme.badgeBg} transition-all`}
            style={{
              borderColor: isPro ? `${primaryHex}dd` : undefined,
              boxShadow: isPro ? `0 0 16px ${accentHex}50` : undefined,
            }}
          >
            {theme.stageIcon}
            <span>{theme.stageLabel}</span>
          </span>
        </div>

        {/* PRIMARY DYNAMIC CALENDAR SIMULATION BUTTON OR ACTIVE 32-BIT SIMULATION PANEL */}
        {activeSimulatingBlock !== null && simulationComplete ? (
          <div className="max-w-xl mx-auto px-2 space-y-2">
            {scheduledTournamentCallUp ? (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={onStartScheduledTournament}
                  className="py-4 px-6 pixel-corners bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base pixel-bevel-gold font-pixel uppercase cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-amber-400/30 active:scale-95 transition-all w-full sm:w-auto"
                >
                  <Trophy className="w-5 h-5 fill-current animate-bounce" />
                  <span>START {scheduledTournamentCallUp.competitionName?.toUpperCase() || 'TOURNAMENT'} DRAW →</span>
                </button>
                {onSkipScheduledTournament && (
                  <button
                    type="button"
                    onClick={onSkipScheduledTournament}
                    className="py-3 px-4 pixel-corners bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs pixel-bevel-raised font-pixel uppercase cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <FastForward className="w-4 h-4" />
                    <span>SKIP / SIMULATE</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onFinishBlockSimulation}
                className="w-full py-4 sm:py-5 px-6 pixel-corners font-black text-sm sm:text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer select-none bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 pixel-bevel-emerald shadow-[0_4px_0_0_#022c22] active:translate-y-1 active:shadow-none border-2 border-emerald-200"
              >
                <span>
                  {activeSimulatingBlock === 1
                    ? 'PROCEED TO MID-SEASON STOP →'
                    : 'PROCEED TO SEASON CONCLUSION →'}
                </span>
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </button>
            )}
          </div>
        ) : activeSimulatingBlock !== null ? (
          /* ACTIVE 32-BIT MATCH-BY-MATCH SIMULATION CONTROL BAR */
          <div className="max-w-2xl mx-auto px-2 space-y-3">
            <div className={`p-4 ${theme.shapeClass} bg-slate-900/95 border-2 border-amber-500/80 pixel-bevel-raised shadow-xl space-y-3`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs sm:text-sm font-black uppercase text-amber-300 font-pixel">
                    SIMULATING {activeSimulatingBlock === 1 ? 'BLOCK 1' : 'BLOCK 2'} • MATCH {displayedMatchesCount || recentMatches.length} OF {totalBlockMatchesCount || 9}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['slow', 'normal', 'fast'] as const).map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => onChangeSimulationSpeed && onChangeSimulationSpeed(spd)}
                      className={`px-2 py-1 text-[10px] font-pixel uppercase ${theme.shapeClass} border transition-all cursor-pointer ${
                        simulationSpeed === spd
                          ? 'bg-amber-400 text-slate-950 font-black border-amber-300 pixel-bevel-gold'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {spd === 'slow' ? '0.5x' : spd === 'normal' ? '1x' : '2x'}
                    </button>
                  ))}
                  {onInstantSimulateAll && (
                    <button
                      type="button"
                      onClick={onInstantSimulateAll}
                      className="px-2.5 py-1 text-[10px] font-pixel uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 font-black pixel-corners border border-amber-300 pixel-bevel-gold flex items-center gap-1 cursor-pointer"
                      title="Instantly simulate all remaining matches in this block"
                    >
                      <FastForward className="w-3 h-3 fill-current" />
                      INSTANT
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-3 pixel-corners border border-slate-800 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-200"
                  style={{
                    width: `${Math.min(100, Math.round(((displayedMatchesCount || recentMatches.length) / Math.max(1, totalBlockMatchesCount || 9)) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-arcade text-slate-400">
                <span>{isPaused ? '⏸ SIMULATION PAUSED' : '⚡ SIMULATING MATCHDAYS...'}</span>
                {onTogglePauseSimulation && (
                  <button
                    type="button"
                    onClick={onTogglePauseSimulation}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 font-pixel text-[10px] uppercase pixel-corners border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                    <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto px-2">
            <button
              id="career-hub-primary-simulation-button"
              type="button"
              onClick={() => {
                triggerTactileConfirm();
                onMainSimulationAction();
              }}
              disabled={isSimulatingMatches}
              className={`w-full py-4 sm:py-5 px-6 ${theme.shapeClass} font-black text-sm sm:text-base md:text-lg uppercase tracking-wider flex flex-col items-center justify-center gap-1 cursor-pointer select-none transition-all ${theme.primaryBtnGradient}`}
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                <span className="pixel-text-shadow">{dynamicActionTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs font-retro font-bold text-slate-900/90 tracking-normal normal-case">
                <span>{dynamicActionSubtitle}</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-slate-950/30 pixel-corners text-[9px] font-arcade text-slate-950 font-black">
                  [SPACE / TAP]
                </span>
              </div>
            </button>
          </div>
        )}

        {/* ADDITIONAL CONTEXT ACTIONS (Only display when relevant) */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
          {/* Quick Fitness Recovery */}
          {(canQuickRecover || recoveryPoints > 0) && (
            <button
              type="button"
              onClick={handleUseRecoveryPoint}
              className="px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider bg-rose-950 hover:bg-rose-900 border-2 border-rose-500 text-rose-200 pixel-bevel-crimson shadow-md flex items-center gap-1.5 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              QUICK RECOVERY ({recoveryPoints > 0 ? `${recoveryPoints} RP` : '+20%'})
            </button>
          )}

          {/* Unassigned Stat Points Available */}
          {unassignedPoints > 0 && (
            <button
              type="button"
              onClick={handleAssignStatPoints}
              className="px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider bg-amber-950 hover:bg-amber-900 border-2 border-amber-500 text-amber-200 pixel-bevel-gold shadow-md flex items-center gap-1.5 transition-all active:translate-y-0.5 cursor-pointer animate-pixel-blink"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              ASSIGN STAT POINTS (+{unassignedPoints})
            </button>
          )}

          {/* Quick Training Action */}
          {trainInfo.canTrain && (
            <button
              type="button"
              onClick={handleAdvanceTraining}
              className="px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider bg-purple-950 hover:bg-purple-900 border-2 border-purple-500 text-purple-200 pixel-bevel-raised shadow-md flex items-center gap-1.5 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Dumbbell className="w-3.5 h-3.5 text-purple-400" />
              {trainInfo.buttonText}
            </button>
          )}

          {/* Active International Tournament Call-up */}
          {hasActiveTournament && onResumeTournament && (
            <button
              type="button"
              onClick={onResumeTournament}
              className="px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider bg-indigo-950 hover:bg-indigo-900 border-2 border-indigo-400 text-indigo-200 pixel-bevel-raised shadow-md flex items-center gap-1.5 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              RESUME TOURNAMENT
            </button>
          )}

          {/* Competition Draw Button */}
          {availableDraw && (
            <button
              id="career-hub-competition-draw-button"
              type="button"
              onClick={availableDraw.onOpenDraw}
              className="px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider bg-indigo-950 hover:bg-indigo-900 border-2 border-indigo-400 text-indigo-200 pixel-bevel-raised shadow-md flex items-center gap-1.5 transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{availableDraw.shortName || availableDraw.competitionName} DRAW</span>
            </button>
          )}

          {/* Yearly Awards (Pro Career ONLY) */}
          {isPro && (hasYearlyAwardsAvailable || onWatchAwardsCeremony) && (onOpenYearlyAwards || onWatchAwardsCeremony) && (
            <button
              id="career-hub-yearly-awards-button"
              type="button"
              onClick={onOpenYearlyAwards || onWatchAwardsCeremony}
              className="px-3.5 py-2 pixel-corners text-xs font-black uppercase tracking-wider bg-amber-950 hover:bg-amber-900 border-2 border-amber-400 text-amber-200 pixel-bevel-gold shadow-md flex items-center gap-1.5 transition-all active:translate-y-0.5 cursor-pointer animate-pixel-blink"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>YEARLY AWARDS</span>
            </button>
          )}

          {/* Skip Season (Test Mode Only) */}
          {isTestMode && onSkipSeason && (
            <button
              type="button"
              onClick={onSkipSeason}
              className="px-3 py-1.5 pixel-corners text-xs font-arcade font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
              title="[Test Mode] Skip Season"
            >
              <FastForward className="w-3.5 h-3.5 text-red-400" />
              SKIP SEASON
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUGGESTED ACTIONS (ABOVE LAST 3 SIMULATED MATCHES - MAX 2 ACTIONS) */}
      {/* ========================================================================= */}
      <div className="space-y-4 my-2 relative z-10">
        <SuggestedActions
          player={player}
          accounting={accounting}
          storeItems={storeItems}
          maxActions={2}
          importantDraw={
            availableDraw?.isImportant
              ? {
                  competitionName: availableDraw.competitionName,
                  shortName: availableDraw.shortName,
                  onOpenDraw: availableDraw.onOpenDraw,
                }
              : null
          }
          callbacks={{
            onRecoverFitness: handleUseRecoveryPoint,
            onAssignStatPoints: handleAssignStatPoints,
            onTrain: handleOpenTraining,
            onBuyProEquipment: handleOpenStore,
            onBuySeasonBoost: handleOpenStore,
            onOpenParentAdvice,
          }}
          onUpdatePlayer={onUpdatePlayer}
          onUpdateAccounting={onUpdateAccounting}
          onUpdateStoreItems={onUpdateStoreItems}
          showToast={showToast}
        />

        {/* ======================================================================= */}
        {/* 4. LAST 3 SIMULATED MATCHES (32-BIT RETRO SCOREBOARD) */}
        {/* ======================================================================= */}
        <div className="bg-slate-950/90 border-2 border-slate-700 pixel-corners pixel-bevel-sunken p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 font-pixel">
                {t('LAST_3_SIMULATED_MATCHES') || 'LAST 3 SIMULATED MATCHES'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {/* FULL LIST BUTTON */}
              <button
                type="button"
                onClick={() => {
                  haptics.buttonPress();
                  setShowFullSeasonMatchesModal(true);
                }}
                className="px-2.5 py-1 text-[9px] font-pixel uppercase bg-slate-900 hover:bg-amber-950 hover:text-amber-300 text-slate-300 border border-slate-700 hover:border-amber-500/80 pixel-corners pixel-bevel-raised flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
                title={t('ALL_SEASON_MATCHES') || 'All Season Matches'}
              >
                <ListFilter className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('FULL_LIST') || 'FULL LIST'}</span>
                <span className="text-[8px] px-1 py-0.2 bg-slate-950 border border-slate-700 text-amber-400 font-arcade pixel-corners">
                  {seasonMatches.length}
                </span>
              </button>

              <span className="text-[10px] font-arcade text-slate-400 hidden sm:inline">
                {last3Matches.length > 0
                  ? `${last3Matches.length} ${t('MATCHES_RECORDED') || 'RECORDED'}`
                  : t('READY_FOR_KICKOFF') || 'READY FOR KICKOFF'}
              </span>
            </div>
          </div>

          {/* MATCHES LIST - When no matches simulated yet: NO MATCHES, NO PLACEHOLDERS, NOTHING */}
          {last3Matches.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {last3Matches.map((m, idx) => {
                const isWin = m.isPlayerHome
                  ? m.homeScore > m.awayScore
                  : m.awayScore > m.homeScore;
                const isDraw = m.homeScore === m.awayScore;
                const opponentName = m.isPlayerHome ? m.awayTeamName : m.homeTeamName;
                const scoreDisplay = `${m.homeScore} - ${m.awayScore}`;
                const resultBadge = isWin
                  ? { label: t('SEASON_WINS') || 'WIN', bg: 'bg-emerald-950 text-emerald-300 border-emerald-500/80 pixel-bevel-emerald' }
                  : isDraw
                  ? { label: t('SEASON_DRAWS') || 'DRAW', bg: 'bg-amber-950 text-amber-300 border-amber-500/80 pixel-bevel-gold' }
                  : { label: t('SEASON_LOSSES') || 'LOSS', bg: 'bg-rose-950 text-rose-300 border-rose-500/80 pixel-bevel-crimson' };

                const matchDate =
                  m.calendarDate && m.calendarDate.trim().length > 0
                    ? m.calendarDate
                    : (() => {
                        const matchday = m.matchIndex !== undefined ? m.matchIndex + 1 : idx + 1;
                        const d = getCalendarDateForMatchdayIndex(matchday, seasonYear);
                        const fmt = formatSimulationCalendarDate(d);
                        return `${fmt.dayNumber} ${fmt.monthName} ${fmt.year}`;
                      })();

                // Chronological position badge: index 0 is always LATEST (1st spot)
                const isLatest = idx === 0;

                return (
                  <div
                    key={m.matchId || `match-${m.matchIndex ?? idx}-${idx}`}
                    className={`bg-slate-900/90 border-2 ${isLatest ? 'border-amber-500/80' : theme.matchItemBorder} ${theme.shapeClass} pixel-bevel-raised p-2.5 flex flex-col justify-between gap-2 shadow-sm relative overflow-hidden transition-all`}
                  >
                    {/* Header: Date & Result & Latest indicator */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isLatest && (
                          <span className={`text-[8px] font-pixel px-1 py-0.2 bg-amber-500 text-slate-950 font-black ${theme.shapeClass}`}>
                            {t('LATEST_MATCH_BADGE') || 'LATEST'}
                          </span>
                        )}
                        <span className="text-[10px] font-arcade text-slate-400 truncate">
                          {matchDate}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 pixel-corners border shrink-0 ${resultBadge.bg}`}
                      >
                        {resultBadge.label} {scoreDisplay}
                      </span>
                    </div>

                    {/* Opponent & Matchup */}
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-white truncate font-arcade">
                        vs {opponentName || 'League Rival'}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-retro">
                        <span className="truncate">{m.competitionName || 'Domestic League'}</span>
                        <span className="text-[9px] font-pixel text-slate-400 shrink-0">
                          {m.isPlayerHome ? `🏠 ${t('VENUE_HOME') || 'HOME'}` : `✈️ ${t('VENUE_AWAY') || 'AWAY'}`}
                        </span>
                      </div>
                    </div>

                    {/* Player Performance Information */}
                    <div className="pt-1.5 border-t border-slate-800 flex flex-col gap-1 text-[10px] font-arcade">
                      {/* Status & Minutes */}
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        {m.playerStatus === 'suspended' || m.isSuspended ? (
                          <span className="font-black text-[9px] px-1.5 py-0.5 pixel-corners bg-rose-950 border border-rose-500/80 text-rose-300 truncate max-w-full">
                            🟥 {m.suspensionReason || t('ROLE_SUSPENDED') || 'SUSPENDED'}
                          </span>
                        ) : m.playerStatus === 'starter' ? (
                          <span className="font-bold text-[9px] px-1.5 py-0.5 pixel-corners bg-sky-950 border border-sky-500/60 text-sky-300">
                            {t('ROLE_STARTER') || 'STARTER'} • ⏱️ {m.minutesPlayed ?? 90}'
                          </span>
                        ) : m.playerStatus === 'sub_in' ? (
                          <span className="font-bold text-[9px] px-1.5 py-0.5 pixel-corners bg-emerald-950 border border-emerald-500/60 text-emerald-300">
                            {t('ROLE_SUB_IN') || 'SUB IN'} • ⏱️ {m.minutesPlayed ?? 25}'
                          </span>
                        ) : m.playerStatus === 'sub_out' ? (
                          <span className="font-bold text-[9px] px-1.5 py-0.5 pixel-corners bg-amber-950 border border-amber-500/60 text-amber-300">
                            {t('ROLE_SUB_OUT') || 'SUB OUT'} • ⏱️ {m.minutesPlayed ?? 60}'
                          </span>
                        ) : m.playerStatus === 'benched' || m.playerStatus === 'bench' ? (
                          <span className="font-bold text-[9px] px-1.5 py-0.5 pixel-corners bg-slate-800 border border-slate-600 text-slate-400">
                            {t('ROLE_BENCHED') || 'BENCHED'} • ⏱️ 0'
                          </span>
                        ) : (
                          <span className="font-bold text-[9px] px-1.5 py-0.5 pixel-corners bg-stone-900 border border-stone-700 text-stone-400">
                            {t('ROLE_RESERVES') || 'RESERVES'} • ⏱️ 0'
                          </span>
                        )}

                        {m.playerRating !== undefined && m.playerRating > 0 && !m.isSuspended && (
                          <span className="font-black text-amber-300 flex items-center gap-0.5">
                            ⭐ {m.playerRating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      {/* Match Stats: Goals, Assists, Cards, MVP */}
                      {!m.isSuspended && (m.playerGoals > 0 || m.playerAssists > 0 || m.yellowCard || m.redCard || m.isMvp) && (
                        <div className="flex items-center gap-1.5 flex-wrap text-[9px]">
                          {m.playerGoals > 0 && (
                            <span className="font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.5 border border-emerald-500/40 pixel-corners">
                              ⚽ {m.playerGoals} {m.playerGoals === 1 ? (t('GOAL_SINGULAR') || 'Goal') : (t('GOALS_PLURAL') || 'Goals')}
                            </span>
                          )}
                          {m.playerAssists > 0 && (
                            <span className="font-bold text-sky-400 bg-sky-950/60 px-1 py-0.5 border border-sky-500/40 pixel-corners">
                              🎯 {m.playerAssists} {m.playerAssists === 1 ? (t('ASSIST_SINGULAR') || 'Assist') : (t('ASSISTS_PLURAL') || 'Assists')}
                            </span>
                          )}
                          {m.redCard && (
                            <span className="font-black text-rose-300 bg-rose-950 px-1 py-0.5 border border-rose-500 pixel-corners">
                              🟥 {t('MATCH_RED_CARDS') || 'RED'}
                            </span>
                          )}
                          {m.yellowCard && (
                            <span className="font-black text-yellow-300 bg-amber-950 px-1 py-0.5 border border-yellow-500 pixel-corners">
                              🟨 {t('MATCH_YELLOW_CARDS') || 'YELLOW'}
                            </span>
                          )}
                          {m.isMvp && (
                            <span className="font-black text-amber-300 bg-amber-950/80 px-1 py-0.5 border border-amber-400 pixel-corners">
                              🏆 {t('MATCH_MAN_OF_MATCH') || 'MVP'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PRIMARY NAVIGATION DOCK (STORE, CARD, AGENT, DEV, TROPHIES, MENU) */}
      {/* ========================================================================= */}
      <div className="pt-3 border-t-2 border-slate-800/80 mt-3 relative z-10">
        <nav
          aria-label="Career Hub Primary Navigation"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5"
        >
          {/* 1. STORE */}
          <button
            id="career-nav-store-button"
            type="button"
            onClick={() => {
              triggerTactileNav();
              handleOpenStore();
            }}
            className={`py-3 px-3.5 ${theme.shapeClass} border-2 border-slate-700 bg-slate-900 hover:bg-slate-850 pixel-bevel-raised flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200 transition-all active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${theme.navHover}`}
            title="Open Unique Career Lifestyle & Upgrades Store"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>[1] {t('NAV_STORE') || 'STORE'}</span>
          </button>

          {/* 2. CARD (TOGGLES SHOW/HIDE) */}
          <button
            id="career-nav-card-button"
            type="button"
            onClick={() => {
              triggerTactileNav();
              setIsCardVisible((prev) => {
                const next = !prev;
                try {
                  localStorage.setItem('careerHub_showPlayerCard', String(next));
                } catch {}
                if (next && cardSectionRef.current) {
                  cardSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                if (showToast) {
                  showToast(next ? 'Player Card Visible' : 'Player Card Hidden');
                }
                return next;
              });
            }}
            className={`py-3 px-3.5 ${theme.shapeClass} border-2 border-slate-700 bg-slate-900 hover:bg-slate-850 pixel-bevel-raised flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200 transition-all active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${theme.navHover}`}
            title={isCardVisible ? 'Hide Player Card passport section' : 'Show Player Card passport section'}
          >
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>[2] {isCardVisible ? (t('HIDE_CARD') || 'HIDE CARD') : (t('CARD') || 'CARD')}</span>
          </button>

          {/* 3. AGENT */}
          <button
            id="career-nav-agent-button"
            type="button"
            onClick={() => {
              triggerTactileNav();
              if (onOpenAgent) {
                onOpenAgent();
              } else {
                setShowAgentModal(true);
              }
            }}
            className={`py-3 px-3.5 ${theme.shapeClass} border-2 border-slate-700 bg-slate-900 hover:bg-slate-850 pixel-bevel-raised flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200 transition-all active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${theme.navHover}`}
            title={isPro ? 'Open Agent Career Headquarters' : 'Open Youth Agent & Academy Transfer Liaison'}
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>[3] {t('NAV_AGENT') || 'AGENT'}</span>
          </button>

          {/* 4. DEVELOPMENT */}
          <button
            id="career-nav-development-button"
            type="button"
            onClick={() => {
              triggerTactileNav();
              handleOpenDevelopment('player', 'attributes');
            }}
            className={`py-3 px-3.5 ${theme.shapeClass} border-2 border-slate-700 bg-slate-900 hover:bg-slate-850 pixel-bevel-raised flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200 transition-all active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${theme.navHover}`}
            title="Open Player & Club Development (Attributes, Training, Facilities)"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>[4] {t('NAV_DEV') || 'DEV'}</span>
            {unassignedPoints > 0 && (
              <span className="w-2 h-2 pixel-corners bg-amber-400 animate-pixel-blink" />
            )}
          </button>

          {/* 5. TROPHIES / TROFEOS */}
          <button
            id="career-nav-trophies-button"
            type="button"
            onClick={() => {
              triggerTactileNav();
              setShowTrophyCabinetModal(true);
            }}
            className={`py-3 px-3.5 ${theme.shapeClass} border-2 border-slate-700 bg-slate-900 hover:bg-slate-850 pixel-bevel-raised flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200 transition-all active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${theme.navHover}`}
            title="Open Trophy Cabinet"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>[5] {t('TROPHIES') || t('NAV_TROPHIES') || 'TROFEOS'}</span>
          </button>

          {/* 6. MENU */}
          <button
            id="career-nav-menu-button"
            type="button"
            onClick={() => {
              triggerTactileNav();
              setShowSecondaryMenu(true);
            }}
            className={`py-3 px-3.5 ${theme.shapeClass} border-2 border-slate-700 bg-slate-900 hover:bg-slate-850 pixel-bevel-raised flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-slate-200 transition-all active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer ${theme.navHover}`}
            title="Open Career Menu"
          >
            <MenuIcon className="w-4 h-4 text-violet-400" />
            <span>[6] {t('NAV_MENU') || 'MENU'}</span>
          </button>
        </nav>
      </div>

      {/* ========================================================================= */}
      {/* 6. PLAYER CARD PASSPORT & STAT MODIFIERS SHOWCASE */}
      {/* ========================================================================= */}
      <div
        id="career-hub-player-card-section"
        ref={cardSectionRef}
        className="pt-4 border-t-2 border-slate-800/80 mt-4 relative z-10 space-y-3"
      >
        {!isCardVisible ? (
          <div className="bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-sky-400" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white font-pixel">
                    PLAYER CARD SECTION (HIDDEN)
                  </span>
                  <span className="text-[10px] font-pixel font-bold px-2 py-0.5 pixel-corners bg-slate-950 text-amber-300 border border-amber-500/40">
                    {player.ovr} OVR • {player.position}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-retro">
                  #{player.shirtNumber || 10} {player.name} • Tap &quot;SHOW PLAYER CARD SECTION&quot; to reveal card and stat modifiers
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleOpenCustomization}
                className="py-1.5 px-2.5 pixel-corners border-2 border-pink-600/70 bg-pink-950/60 hover:bg-pink-900 text-pink-300 pixel-bevel-raised flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5 text-[10px] font-pixel font-bold uppercase"
                title="Customize Player Appearance, Kit & Boots"
              >
                <Scissors className="w-3.5 h-3.5 text-pink-400" />
                <span>CUSTOMIZE</span>
              </button>

              <button
                id="career-hub-card-eye-toggle-collapsed"
                type="button"
                onClick={toggleCardVisibility}
                className="py-1.5 px-3 pixel-corners border-2 border-amber-500/70 bg-amber-950/60 hover:bg-amber-900 text-amber-300 pixel-bevel-gold flex items-center gap-1.5 cursor-pointer transition-all active:translate-y-0.5 text-[10px] font-pixel font-bold uppercase"
                title="Show Player Card Section"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>SHOW PLAYER CARD SECTION</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border-2 border-slate-700 pixel-corners pixel-bevel-raised p-4 sm:p-5 space-y-4">
            {/* HEADER BAR: TITLE & STATUS */}
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 gap-2 flex-wrap">
              <div className="flex items-center gap-2.5 flex-wrap">
                <CreditCard className="w-5 h-5 text-sky-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white font-pixel pixel-text-shadow">
                  {t('PLAYER_CARD_AND_PASSPORT') || 'PLAYER CARD & PASSPORT'}
                </h3>
                <span className="text-[10px] font-pixel font-bold px-2 py-0.5 pixel-corners bg-slate-950 text-amber-300 border border-amber-500/40">
                  {player.ovr} OVR • {player.position} {player.subPosition ? `(${player.subPosition})` : ''}
                </span>
                {ovrAnalysis.ovrDelta !== 0 && (
                  <span
                    className={`text-[10px] font-arcade font-black px-2 py-0.5 pixel-corners border ${
                      ovrAnalysis.ovrDelta > 0
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        : 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                    }`}
                  >
                    {ovrAnalysis.ovrDelta > 0 ? `+${ovrAnalysis.ovrDelta}` : ovrAnalysis.ovrDelta} OVR DELTA
                  </span>
                )}
              </div>
            </div>

            {/* PROMINENT CENTERED CUSTOMIZE KEY BUTTON */}
            <div className="flex items-center justify-center pt-1 pb-1">
              <button
                id="career-hub-card-customize-key-button"
                type="button"
                onClick={handleOpenCustomization}
                className="w-full sm:w-auto px-7 py-2.5 pixel-corners border-2 border-amber-400 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 hover:from-amber-400 hover:to-yellow-300 hover:text-slate-950 text-amber-300 pixel-bevel-gold flex items-center justify-center gap-2.5 cursor-pointer transition-all active:translate-y-0.5 text-xs font-pixel font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 group"
                title="Customize Player Appearance, Kit & Boots"
              >
                <Scissors className="w-4 h-4 text-amber-400 group-hover:text-slate-950 transition-colors" />
                <span>{t('CUSTOMIZE_PLAYER_CARD') || t('CUSTOMIZE') || 'PERSONALIZAR CARTA'}</span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 group-hover:text-slate-950 transition-colors animate-pulse" />
              </button>
            </div>

            {/* BEAUTIFUL CARD VISUALIZATION */}
            <div className="space-y-2">
              <div className="w-full flex flex-col items-center justify-center py-1 sm:py-2 relative">
                <div className="scale-[0.84] xs:scale-[0.90] sm:scale-100 transition-transform origin-top">
                  <PlayerCard
                    id="career-hub-active-player-card"
                    player={player}
                    isFlipped={isCardFlipped}
                    onFlip={() => setIsCardFlipped((prev) => !prev)}
                    onUpdatePlayer={onUpdatePlayer}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-pixel mt-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pixel-blink" />
                  <span>Click or tap card to flip &amp; inspect career bio and passport specs</span>
                </div>
              </div>
            </div>

          {/* ========================================================================= */}
          {/* BELOW THE CARD: MODIFIERS OF BONUS STATS (POSITIVE & NEGATIVE) */}
          {/* ========================================================================= */}
          <div className="space-y-3 pt-3 border-t-2 border-slate-800">
            {/* MODIFIERS HEADER */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-pixel">
                  ACTIVE STAT MODIFIERS & ATTRIBUTE IMPACT
                </h4>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-pixel flex-wrap">
                <span className="text-slate-400">NET DELTA:</span>
                <span
                  className={`font-arcade font-black px-2 py-0.5 pixel-corners border ${
                    detailedModifiers.totalBonusPoints - detailedModifiers.totalPenaltyPoints > 0
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                      : detailedModifiers.totalBonusPoints - detailedModifiers.totalPenaltyPoints < 0
                      ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {detailedModifiers.totalBonusPoints - detailedModifiers.totalPenaltyPoints > 0
                    ? `+${detailedModifiers.totalBonusPoints - detailedModifiers.totalPenaltyPoints} PTS`
                    : detailedModifiers.totalBonusPoints - detailedModifiers.totalPenaltyPoints < 0
                    ? `${detailedModifiers.totalBonusPoints - detailedModifiers.totalPenaltyPoints} PTS`
                    : '0 PTS (NEUTRAL)'}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-400">BASE OVR:</span>
                <span className="text-white font-arcade font-bold">{ovrAnalysis.baseOvr}</span>
                <span className="text-slate-400">→ EFF:</span>
                <span className="text-amber-300 font-arcade font-bold">{ovrAnalysis.effectiveOvr}</span>
              </div>
            </div>

            {/* CATEGORY DELTAS SUMMARY STRIP */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              {[
                { label: 'PHY', val: categoryBonuses.PHY },
                { label: 'PRO', val: categoryBonuses.PRO },
                { label: 'CRE', val: categoryBonuses.CRE },
                { label: 'SCO', val: categoryBonuses.SCO },
                { label: 'DEF', val: categoryBonuses.DEF },
                { label: 'TAC', val: categoryBonuses.MEN },
              ].map((cat) => {
                const isPos = cat.val > 0;
                const isNeg = cat.val < 0;
                return (
                  <div
                    key={cat.label}
                    className={`p-2 pixel-corners border pixel-bevel-raised text-center ${
                      isPos
                        ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                        : isNeg
                        ? 'bg-rose-950/70 border-rose-500/60 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-[9px] font-pixel font-bold uppercase">{cat.label}</div>
                    <div className="text-xs font-arcade font-black mt-0.5">
                      {isPos ? `+${cat.val}` : isNeg ? `${cat.val}` : '0'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TWO COLUMNS: POSITIVE BONUSES (+) vs NEGATIVE PENALTIES (-) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* POSITIVE BONUSES PANEL */}
              <div className="p-3 bg-slate-950/80 border-2 border-emerald-500/50 pixel-corners pixel-bevel-raised space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-900/50 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black font-pixel uppercase text-emerald-300">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>POSITIVE BONUSES (+{detailedModifiers.totalBonusPoints})</span>
                  </div>
                  <span className="text-[9px] font-arcade px-1.5 py-0.5 pixel-corners bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    {detailedModifiers.positives.length} ACTIVE
                  </span>
                </div>

                {detailedModifiers.positives.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {detailedModifiers.positives.map((item) => (
                      <span
                        key={item.key}
                        className="px-2 py-1 pixel-corners bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-[11px] font-arcade flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="text-[9px] font-pixel text-emerald-400/80 uppercase">{item.cat}</span>
                        <span className="font-bold">{item.label}</span>
                        <strong className="text-emerald-300 font-black">+{item.bonus}</strong>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 font-retro p-2 text-center bg-slate-900/50 pixel-corners border border-dashed border-slate-800">
                    No active equipment, season boost, or cosmetic stat bonuses equipped.
                  </div>
                )}

                {/* BONUS SOURCES BREAKDOWN */}
                {detailedModifiers.bonusReasons.length > 0 && (
                  <div className="pt-2 border-t border-emerald-950/80 space-y-1">
                    <div className="text-[9px] font-pixel uppercase tracking-wider text-emerald-400/80">
                      Bonus Sources Active:
                    </div>
                    {detailedModifiers.bonusReasons.map((reason, idx) => (
                      <div key={idx} className="text-[10px] text-slate-300 font-retro flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NEGATIVE PENALTIES PANEL */}
              <div className="p-3 bg-slate-950/80 border-2 border-rose-500/50 pixel-corners pixel-bevel-raised space-y-2.5">
                <div className="flex items-center justify-between border-b border-rose-900/50 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black font-pixel uppercase text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>NEGATIVE PENALTIES (-{detailedModifiers.totalPenaltyPoints})</span>
                  </div>
                  <span className="text-[9px] font-arcade px-1.5 py-0.5 pixel-corners bg-rose-950 text-rose-300 border border-rose-500/40">
                    {detailedModifiers.negatives.length} ACTIVE
                  </span>
                </div>

                {detailedModifiers.negatives.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {detailedModifiers.negatives.map((item) => (
                      <span
                        key={item.key}
                        className="px-2 py-1 pixel-corners bg-rose-950/90 border border-rose-500/60 text-rose-200 text-[11px] font-arcade flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="text-[9px] font-pixel text-rose-400/80 uppercase">{item.cat}</span>
                        <span className="font-bold">{item.label}</span>
                        <strong className="text-rose-300 font-black">-{item.penalty}</strong>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400/90 font-retro p-2.5 bg-slate-900/50 pixel-corners border border-emerald-900/40 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All clear! No active negative penalties impacting your player.</span>
                  </div>
                )}

                {/* PENALTY CONDITIONS BREAKDOWN */}
                {detailedModifiers.penaltyReasons.length > 0 && (
                  <div className="pt-2 border-t border-rose-950/80 space-y-1">
                    <div className="text-[9px] font-pixel uppercase tracking-wider text-rose-400/80">
                      Penalty Conditions:
                    </div>
                    {detailedModifiers.penaltyReasons.map((reason, idx) => (
                      <div key={idx} className="text-[10px] text-slate-300 font-retro flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ========================================================================= */}
      {/* 6. SECONDARY SYSTEMS MENU MODAL (DRAWSTAR 32-BIT FULL-SCREEN MENU) */}
      {/* ========================================================================= */}
      <CareerSecondaryMenuModal
        isOpen={showSecondaryMenu}
        onClose={() => setShowSecondaryMenu(false)}
        player={player}
        accounting={accounting}
        manager={manager}
        seasonYear={seasonYear}
        storeItems={storeItems}
        recentMatches={recentMatches}
        onOpenWorldResults={onOpenWorldResults}
        onOpenSaveSlots={onOpenSaveSlots}
        onOpenDatabaseViewer={onOpenDatabaseViewer}
        onOpenCareerSummary={onOpenCareerSummary}
        onOpenSoundtrack={onOpenSoundtrack}
        onOpenSettings={onOpenSettings}
        onExitToMainMenu={onExitToMainMenu}
        onOpenStore={handleOpenStore}
        onOpenCard={onOpenCard}
        onOpenDevelopment={handleOpenDevelopment}
        onOpenCustomization={handleOpenCustomization}
        onOpenTransfer={onOpenTransfer}
        onOpenParentAdvice={onOpenParentAdvice}
        onOpenYearlyAwards={onOpenYearlyAwards}
        onUpdatePlayer={onUpdatePlayer}
        onUpdateAccounting={onUpdateAccounting}
        showToast={showToast}
      />

      {/* ========================================================================= */}
      {/* 7. PLAYER CARD QUICK PREVIEW MODAL (32-BIT RETRO PASSPORT) */}
      {/* ========================================================================= */}
      {showCardPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-sky-500/80 pixel-corners pixel-bevel-cyan p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 text-left select-none font-pixel">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white pixel-text-shadow">
                  PLAYER PASSPORT CARD
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCardPreviewModal(false)}
                className="p-1 pixel-corners text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950/90 pixel-corners p-4 border-2 border-slate-700 pixel-bevel-sunken text-center space-y-3">
              <div className="text-2xl sm:text-3xl font-black font-arcade text-amber-400">
                {player.ovr} OVR
              </div>
              <div className="text-base font-black text-white uppercase pixel-text-shadow">
                {player.name}
              </div>
              <div className="text-[11px] text-slate-300 font-retro">
                {player.position} {player.subPosition ? `(${player.subPosition})` : ''} • AGE {player.age || 15}
              </div>
              <div className="text-[11px] text-emerald-400 font-black">
                {player.club || (isPro ? 'Free Agent' : 'Youth Academy')} • {player.nationality?.name || 'Unknown'}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-arcade text-xs">
                <div className="p-2 pixel-corners bg-slate-900 border border-slate-700 pixel-bevel-raised">
                  <div className="text-slate-400 text-[9px] font-pixel">POT</div>
                  <div className="font-black text-white">{player.potentialOvr}</div>
                </div>
                <div className="p-2 pixel-corners bg-slate-900 border border-slate-700 pixel-bevel-raised">
                  <div className="text-slate-400 text-[9px] font-pixel">FIT</div>
                  <div className="font-black text-emerald-400">{fitnessPct}%</div>
                </div>
                <div className="p-2 pixel-corners bg-slate-900 border border-slate-700 pixel-bevel-raised">
                  <div className="text-slate-400 text-[9px] font-pixel">CHEM</div>
                  <div className="font-black text-amber-300">{chemistryVal}%</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCardPreviewModal(false);
                if (onOpenCard) onOpenCard();
              }}
              className="w-full py-3 pixel-corners bg-sky-500 hover:bg-sky-400 border-2 border-sky-300 pixel-bevel-cyan text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              OPEN FULL CARD PASSPORT
            </button>
          </div>
        </div>
      )}

      {/* CHANGE ACADEMY MODAL */}
      {showChangeAcademyModal && (
        <ChangeAcademyModal
          isOpen={showChangeAcademyModal}
          player={player}
          onClose={() => setShowChangeAcademyModal(false)}
          onSwitchAcademy={(updatedPlayer) => {
            if (onUpdatePlayer) {
              onUpdatePlayer(updatedPlayer);
            }
          }}
          showToast={showToast}
        />
      )}

      {/* 7b. AGENT 32-BIT MODAL (YOUTH SWITCH ACADEMY vs PRO CAREER HEADQUARTERS) */}
      {showAgentModal && (
        <AgentModal32Bit
          isOpen={showAgentModal}
          onClose={() => setShowAgentModal(false)}
          player={player}
          manager={manager || undefined}
          accounting={accounting}
          onSwitchAcademy={() => {
            setShowAgentModal(false);
            if (onSwitchAcademy) {
              onSwitchAcademy();
            } else {
              setShowChangeAcademyModal(true);
            }
          }}
          onTriggerDirective={onTriggerAgentDirective}
          onFireAgent={onFireAgent}
          primaryHex={theme.badgeHex}
          accentHex={theme.accentHex}
        />
      )}

      {/* 8. UNIQUE CAREER STORE MODAL */}
      {showUniqueStoreModal && (
        <UniqueCareerStoreModal
          isOpen={showUniqueStoreModal}
          onClose={() => setShowUniqueStoreModal(false)}
          player={player}
          onUpdatePlayer={(updated) => {
            if (onUpdatePlayer) onUpdatePlayer(updated);
          }}
          accounting={accounting || undefined}
          onUpdateAccounting={onUpdateAccounting}
          storeItems={storeItems}
          onUpdateStoreItems={onUpdateStoreItems}
          showToast={showToast}
        />
      )}

      {/* 9. CUSTOMIZATION MODAL */}
      {showCustomizationModal && (
        <CustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          player={player}
          onUpdatePlayer={(updated) => {
            if (onUpdatePlayer) onUpdatePlayer(updated);
          }}
          accounting={accounting || undefined}
          setAccounting={
            onUpdateAccounting
              ? ((valOrFn: any) => {
                  if (typeof valOrFn === 'function') {
                    onUpdateAccounting(valOrFn(accounting));
                  } else {
                    onUpdateAccounting(valOrFn);
                  }
                })
              : undefined
          }
          storeItems={storeItems}
          setStoreItems={
            onUpdateStoreItems
              ? ((valOrFn: any) => {
                  if (typeof valOrFn === 'function') {
                    onUpdateStoreItems(valOrFn(storeItems));
                  } else {
                    onUpdateStoreItems(valOrFn);
                  }
                })
              : (() => {})
          }
          showToast={showToast || (() => {})}
        />
      )}

      {/* 10. PLAYER & CLUB DEVELOPMENT PANEL (TRUE FULL SCREEN ON MOBILE) */}
      {showDevelopmentModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950 sm:bg-black/90 sm:backdrop-blur-md flex flex-col sm:items-center sm:justify-center sm:p-4 overflow-hidden animate-in fade-in duration-200">
          <div className="w-full h-full sm:h-[92vh] sm:max-w-6xl flex flex-col bg-slate-950 sm:border-2 sm:border-slate-800 sm:pixel-corners sm:pixel-bevel-raised overflow-hidden shadow-2xl">
            <PlayerDevelopmentPanel
              player={player}
              onUpdatePlayer={(updated) => {
                if (onUpdatePlayer) onUpdatePlayer(updated);
              }}
              showToast={showToast || (() => {})}
              onClose={() => setShowDevelopmentModal(false)}
              initialSection={developmentSection}
              initialSubTab={developmentSubTab}
            />
          </div>
        </div>
      )}

      {/* 11. BAD REPUTATION EXPLAINER MODAL */}
      {showBadRepExplainer && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setShowBadRepExplainer(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-950 border-4 border-rose-600 pixel-corners pixel-bevel-gold p-5 text-white my-auto shadow-[0_0_50px_rgba(225,29,72,0.4)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-3">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 pixel-corners bg-rose-950 border border-rose-600 text-rose-300 text-[10px] font-pixel uppercase">
                  <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>BAD REPUTATION SYSTEM</span>
                </div>
                <h3 className="text-base font-black font-arcade uppercase tracking-wide text-white">
                  STATUS: {badRepTier === 0 ? 'CLEAN RECORD (NO TIER)' : badRepTier === 1 ? 'I "BAD BOY"' : badRepTier === 2 ? 'II "MENACE"' : 'III "PSYCHO"'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBadRepExplainer(false)}
                className="w-8 h-8 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center pixel-corners cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-retro text-slate-200">
              <p>
                Bad reputation is earned through straight red cards (+10 Bad Fame), training brawls, controversial nightlife choices, and disruptive conduct.
              </p>

              <div className="bg-slate-900 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">Meter Progress:</span>
                  <span className="font-arcade font-black text-rose-400">
                    {badRepTier >= 3 ? '100% (LOCKED AT TIER III)' : `${badRepMeter} / 100`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">Permanent Floor:</span>
                  <span className="font-arcade font-black text-white">
                    {badRepTier === 0 ? 'Tier 0 (Can stay clean)' : `Cannot drop below ${badRepTier === 1 ? 'I "Bad Boy"' : badRepTier === 2 ? 'II "Menace"' : 'III "Psycho"'}`}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="text-[11px] font-arcade font-black text-rose-400 uppercase tracking-wide">
                  ACTIVE PENALTIES FOR TIER {badRepRoman || '0'}:
                </h4>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-300">
                  <li>
                    <strong className="text-white">Match Red Card Risk:</strong>{' '}
                    {badRepTier === 0 ? '+0%' : badRepTier === 1 ? '+20%' : badRepTier === 2 ? '+40%' : '+60%'} higher chance of receiving a straight red card during match simulations.
                  </li>
                  <li>
                    <strong className="text-white">Transfer Drop Chance:</strong>{' '}
                    {badRepTier === 0 ? '0%' : badRepTier === 1 ? '25%' : badRepTier === 2 ? '50%' : '75%'} of interested clubs cancel offers due to your controversial reputation.
                  </li>
                  <li>
                    <strong className="text-white">New Club Starting Chemistry:</strong>{' '}
                    {badRepTier === 0 ? '50% (Normal)' : badRepTier === 1 ? '40% (-10 pts)' : badRepTier === 2 ? '30% (-20 pts)' : '20% (-30 pts)'}.
                  </li>
                  <li>
                    <strong className="text-white">Mid-Season Lifestyle Roll:</strong>{' '}
                    {badRepTier === 0 ? '0%' : badRepTier === 1 ? '10%' : badRepTier === 2 ? '20%' : '30%'} chance per mid-season to draw an unexpected negative lifestyle event.
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-slate-800 flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowBadRepExplainer(false)}
                className="px-4 py-2 pixel-corners bg-rose-600 hover:bg-rose-500 text-white font-black font-arcade text-xs uppercase"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL SEASON MATCHES MODAL */}
      {showFullSeasonMatchesModal && (
        <SeasonMatchesFullListModal
          isOpen={showFullSeasonMatchesModal}
          onClose={() => setShowFullSeasonMatchesModal(false)}
          matches={seasonMatches}
          seasonYear={seasonYear}
          clubName={player.club || (isPro ? 'First Team' : 'Youth Academy')}
          playerName={player.name || player.lastName || 'Player'}
        />
      )}

      {/* 32-BIT TROPHY CABINET MODAL */}
      {showTrophyCabinetModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-950 border-2 border-amber-400 pixel-corners pixel-bevel-gold max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 sm:p-4 border-b-2 border-slate-800 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-black text-white font-pixel uppercase tracking-wider">
                  {t('TROPHY_CABINET') || 'VITRINA DE TROFEOS'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTrophyCabinetModal(false)}
                className="px-2.5 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white bg-slate-950 border border-slate-700 pixel-corners cursor-pointer"
              >
                ✕ {t('CLOSE') || 'CERRAR'}
              </button>
            </div>
            <div className="p-3 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
              <TrophyCabinet
                trophies={player.trophies || []}
                player={player}
                readOnly={false}
                onChangeTrophies={(updated) => {
                  const updatedPlayer = { ...player, trophies: updated };
                  onUpdatePlayer(updatedPlayer);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    </React.Suspense>
  );
};

export const CareerHub = React.memo(CareerHubComponent);
