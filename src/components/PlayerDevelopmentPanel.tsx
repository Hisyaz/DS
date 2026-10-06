import React, { useState, useMemo } from 'react';
import { PlayerCardData, OutfieldDetailedStats, GkDetailedStats } from '../types';
import { StaminaInjuryPanel } from './StaminaInjuryPanel';
import { isProfessionalPlayer } from '../utils/playerIdentitySystem';
import { useLanguage } from '../context/LanguageContext';
import {
  translateAttributeName,
  translateAttributeAbbreviation,
  translateTrainingGroupName,
  translateTrainingGroupDesc,
} from '../utils/localizationSystem';
import {
  TRAINING_CATEGORIES,
  TrainingFocusId,
  getPlayerCareerPhase,
  simulatePreseasonTraining,
  simulateMidseasonReview,
  SeasonSimulationResult,
  getPlayerPeakInfo,
} from '../utils/developmentSystem';
import {
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
  previewAutoAssignOvr,
  getStatBreakBonus,
  getActiveBonusStats,
  getEffectiveStat,
  getAttributeModifier,
  getEffectivePlayerOvr,
  getEffectiveCategoryStats,
  calculateThreeStatGroupValue,
} from '../utils/statCalculations';
import { CareerPerk, checkCareerPerkMilestones } from '../utils/perksSystem';
import { DevelopmentStagePanel } from './DevelopmentStagePanel';
import { PositionMasteryDevelopmentPanel } from './PositionMasteryDevelopmentPanel';
import { DevelopmentTutorialModal } from './DevelopmentTutorialModal';
import {
  getClubDevelopmentInfo,
  applyClubDevelopmentPointsToPlayer,
  CLUB_DEVELOPMENT_TIERS,
} from '../utils/clubDevelopmentEngine';
import { getFootballSchoolForClub } from '../data/youthFootballSchools';
import {
  getStatTrainingProgressInfo,
  applyStatPointInvestment,
  refundStatPointInvestment,
  isStatWeaknessForPlayerType,
  getPlayerTypeStatRole,
} from '../utils/statProgressionSystem';
import {
  Dumbbell,
  Target,
  GitCommit,
  Footprints,
  Shield,
  Brain,
  Zap,
  TrendingUp,
  Sparkles,
  Calendar,
  Award,
  Activity,
  Plus,
  Minus,
  SlidersHorizontal,
  CheckCircle2,
  Info,
  Lock,
  RefreshCw,
  Crosshair,
  X,
  ShieldAlert,
  Compass,
  HelpCircle,
  GraduationCap,
  Building2,
  Trophy,
  Flame,
  User,
  Check,
  ArrowLeft,
} from 'lucide-react';

interface AutoAssignDiffItem {
  key: string;
  label: string;
  category: string;
  before: number;
  after: number;
  diff: number;
}

interface AutoAssignPreviewModalData {
  preview: ReturnType<typeof previewAutoAssignOvr>;
  diffs: AutoAssignDiffItem[];
}

interface PlayerDevelopmentPanelProps {
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  showToast: (msg: string) => void;
  triggerConfetti?: (opts?: any) => void;
  onReturnToYouthAcademy?: () => void;
  onTriggerPerkUnlock?: (perk: CareerPerk) => void;
  onClose?: () => void;
  initialSection?: 'player' | 'club';
  initialSubTab?: 'attributes' | 'training' | 'stamina' | 'positions';
}

export const PlayerDevelopmentPanel: React.FC<PlayerDevelopmentPanelProps> = ({
  player,
  onUpdatePlayer,
  showToast,
  triggerConfetti,
  onReturnToYouthAcademy,
  onTriggerPerkUnlock,
  onClose,
  initialSection = 'player',
  initialSubTab = 'attributes',
}) => {
  const { currentLanguage, t } = useLanguage();
  const [mainDevSection, setMainDevSection] = useState<'player' | 'club'>(initialSection);
  const [subTab, setSubTab] = useState<'attributes' | 'training' | 'stamina' | 'positions'>(initialSubTab);

  React.useEffect(() => {
    if (initialSection) setMainDevSection(initialSection);
  }, [initialSection]);

  React.useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);
  const [selectedFocus, setSelectedFocus] = useState<TrainingFocusId>('physical');
  const [lastSeasonResult, setLastSeasonResult] = useState<SeasonSimulationResult | null>(null);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [showAllAssignedModal, setShowAllAssignedModal] = useState<boolean>(false);
  const [autoAssignPreviewData, setAutoAssignPreviewData] = useState<AutoAssignPreviewModalData | null>(null);
  const [clubTrainingLogs, setClubTrainingLogs] = useState<string[]>([]);
  const [mobileCategoryFilter, setMobileCategoryFilter] = useState<string>('all');

  const isPro = isProfessionalPlayer(player);
  const clubDevInfo = useMemo(
    () =>
      getClubDevelopmentInfo(
        player.club,
        player.league,
        typeof player.nationality === 'string' ? player.nationality : player.nationality?.name,
        player.fame,
        isPro,
        player
      ),
    [player, isPro]
  );
  const footballSchool = useMemo(() => getFootballSchoolForClub(player.club || ''), [player.club]);
  const availableClubPoints = player.clubDevelopmentPoints !== undefined ? player.clubDevelopmentPoints : clubDevInfo.annualPoints;

  const phaseInfo = getPlayerCareerPhase(player);
  const { isGk, peakAge, deadlineAge } = getPlayerPeakInfo(player);

  const currentOvr = player.ovr || 50;
  const potentialOvr = player.potentialOvr ?? Math.max(currentOvr + 5, 80);

  const positionOvr = calculateWeightedOvr(
    player.position || 'ST',
    player.position || 'ST',
    player.stats,
    player.playStyle
  );

  const subPositionOvr = calculateWeightedOvr(
    player.position || 'ST',
    player.subPosition || player.position || 'ST',
    player.stats,
    player.playStyle
  );

  const availableStatPoints = (player.freeStatPoints || player.unassignedPoints || 0);

  // Detailed stats getters
  const outfieldDetailed = getOrCreateOutfieldDetailed(player.stats);
  const gkDetailed = getOrCreateGkDetailed(player.stats);
  const activeBonuses = useMemo(() => getActiveBonusStats(player), [player]);

  // First-time Development Tutorial Modal State
  const [showDevTutorial, setShowDevTutorial] = useState<boolean>(() => {
    if (player.tutorialEnabled === false) return false;
    if (player.hasSeenDevProgressionTutorial) return false;
    try {
      return localStorage.getItem('football_career_dev_tutorial_v1') !== 'true';
    } catch {
      return false;
    }
  });

  const handleCloseDevTutorial = () => {
    setShowDevTutorial(false);
    try {
      localStorage.setItem('football_career_dev_tutorial_v1', 'true');
    } catch {}
    if (!player.hasSeenDevProgressionTutorial) {
      onUpdatePlayer({
        ...player,
        hasSeenDevProgressionTutorial: true,
      });
    }
  };

  // Spend points handler for Outfield
  const handleSpendOutfieldPoint = (key: keyof OutfieldDetailedStats, amount = 1) => {
    if (player.statBreakStats?.[key] || (outfieldDetailed[key] || 40) >= 100) {
      showToast('🌟 Stat Break Active! This attribute is permanently locked at 100.');
      return;
    }
    if (currentOvr >= potentialOvr) {
      showToast('⛔ Potential Ceiling Reached! You cannot distribute stat points while your Overall matches or exceeds your Potential.');
      return;
    }
    if (availableStatPoints < amount) {
      showToast('⚠️ No unassigned stat points available!');
      return;
    }
    const currentVal = outfieldDetailed[key] || 40;
    const currentProg = player.statTrainingProgress?.[key] || 0;

    const actualAdd = Math.min(amount, availableStatPoints);
    if (actualAdd <= 0) return;

    const isWeakness = isStatWeaknessForPlayerType(player.playerTypeId, key);
    const res = applyStatPointInvestment(currentVal, currentProg, actualAdd, isWeakness);
    if (res.pointsSpent <= 0) return;

    const newDetailed = {
      ...outfieldDetailed,
      [key]: res.newLevel,
    };

    const syncedStats = syncCategoryStatsFromDetailed(player.stats, newDetailed);
    const calculatedOvr = calculateWeightedOvr(
      player.position || 'ST',
      player.subPosition || player.position || 'ST',
      syncedStats,
      player.playStyle
    );
    const newOvr = Math.min(potentialOvr, calculatedOvr);
    const newPoints = availableStatPoints - res.pointsSpent;

    const updated: PlayerCardData = {
      ...player,
      stats: syncedStats,
      ovr: newOvr,
      freeStatPoints: newPoints,
      unassignedPoints: newPoints,
      statTrainingProgress: {
        ...(player.statTrainingProgress || {}),
        [key]: res.newProgress,
      },
    };

    if (res.statBreakTriggered) {
      updated.statBreakActive = true;
      updated.statBreakStats = {
        ...(player.statBreakStats || {}),
        [key]: 100,
      };
      updated.statBreakHistory = [
        ...(player.statBreakHistory || []),
        {
          statKey: key,
          previousValue: 99,
          newValue: 100,
          cardName: 'Development Training',
          timestamp: player.calendarDate || `Season ${player.currentSeason || 1}`,
        },
      ];
      if (triggerConfetti) {
        triggerConfetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      }
      showToast(
        t('DEV_STAT_BREAK_CONFETTI', { stat: key.toUpperCase() }) ||
          `🌟 STAT BREAK IMMORTALITY! ${key.toUpperCase()} reached 100 through relentless training!`
      );
    } else if (res.levelsGained > 0) {
      showToast(`⬆️ ${key.toUpperCase()} upgraded to ${res.newLevel}! (+${res.levelsGained} level${res.levelsGained > 1 ? 's' : ''}) • ${newPoints} pts remaining`);
    } else {
      const trainInfo = getStatTrainingProgressInfo(res.newLevel, res.newProgress, false, isWeakness);
      showToast(`🎯 ${key.toUpperCase()} training advanced (${trainInfo.summaryLabel}) • ${newPoints} pts remaining`);
    }

    onUpdatePlayer(updated);

    if (onTriggerPerkUnlock) {
      const milestone = checkCareerPerkMilestones(updated);
      if (milestone) {
        onTriggerPerkUnlock(milestone);
      }
    }

    if (newPoints === 0) {
      setShowAllAssignedModal(true);
    }
  };

  // Refund points handler for Outfield
  const handleRefundOutfieldPoint = (key: keyof OutfieldDetailedStats) => {
    if (player.statBreakStats?.[key] || (outfieldDetailed[key] || 40) >= 100) {
      showToast('🔒 Stat Break Immortal! Broken stats are permanently locked at 100 and cannot be refunded or redistributed.');
      return;
    }
    const currentVal = outfieldDetailed[key] || 40;
    const currentProg = player.statTrainingProgress?.[key] || 0;

    const isWeakness = isStatWeaknessForPlayerType(player.playerTypeId, key);
    const res = refundStatPointInvestment(currentVal, currentProg, 40, isWeakness);
    if (!res.refunded) return;

    const newDetailed = {
      ...outfieldDetailed,
      [key]: res.newLevel,
    };

    const syncedStats = syncCategoryStatsFromDetailed(player.stats, newDetailed);
    const newOvr = calculateWeightedOvr(
      player.position || 'ST',
      player.subPosition || player.position || 'ST',
      syncedStats,
      player.playStyle
    );

    const newPoints = availableStatPoints + 1;

    const updated: PlayerCardData = {
      ...player,
      stats: syncedStats,
      ovr: newOvr,
      freeStatPoints: newPoints,
      unassignedPoints: newPoints,
      statTrainingProgress: {
        ...(player.statTrainingProgress || {}),
        [key]: res.newProgress,
      },
    };

    onUpdatePlayer(updated);
  };

  // Spend points handler for Goalkeeper
  const handleSpendGkPoint = (key: keyof GkDetailedStats, amount = 1) => {
    if (player.statBreakStats?.[key] || (gkDetailed[key] || 40) >= 100) {
      showToast('🌟 Stat Break Active! This attribute is permanently locked at 100.');
      return;
    }
    if (currentOvr >= potentialOvr) {
      showToast('⛔ Potential Ceiling Reached! You cannot distribute stat points while your Overall matches or exceeds your Potential.');
      return;
    }
    if (availableStatPoints < amount) {
      showToast('⚠️ No unassigned stat points available!');
      return;
    }
    const currentVal = gkDetailed[key] || 40;
    const currentProg = player.statTrainingProgress?.[key] || 0;

    const actualAdd = Math.min(amount, availableStatPoints);
    if (actualAdd <= 0) return;

    const res = applyStatPointInvestment(currentVal, currentProg, actualAdd);
    if (res.pointsSpent <= 0) return;

    const newDetailed = {
      ...gkDetailed,
      [key]: res.newLevel,
    };

    const syncedStats = syncCategoryStatsFromGkDetailed(player.stats, newDetailed);
    const calculatedOvr = calculateWeightedOvr('GK', 'GK', syncedStats, player.playStyle);
    const newOvr = Math.min(potentialOvr, calculatedOvr);
    const newPoints = availableStatPoints - res.pointsSpent;

    const updated: PlayerCardData = {
      ...player,
      stats: syncedStats,
      ovr: newOvr,
      freeStatPoints: newPoints,
      unassignedPoints: newPoints,
      statTrainingProgress: {
        ...(player.statTrainingProgress || {}),
        [key]: res.newProgress,
      },
    };

    if (res.statBreakTriggered) {
      updated.statBreakActive = true;
      updated.statBreakStats = {
        ...(player.statBreakStats || {}),
        [key]: 100,
      };
      updated.statBreakHistory = [
        ...(player.statBreakHistory || []),
        {
          statKey: key,
          previousValue: 99,
          newValue: 100,
          cardName: 'Development Training',
          timestamp: player.calendarDate || `Season ${player.currentSeason || 1}`,
        },
      ];
      if (triggerConfetti) {
        triggerConfetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      }
      showToast(
        t('DEV_STAT_BREAK_CONFETTI', { stat: key.toUpperCase() }) ||
          `🌟 STAT BREAK IMMORTALITY! ${key.toUpperCase()} reached 100 through relentless training!`
      );
    } else if (res.levelsGained > 0) {
      showToast(`⬆️ ${key.toUpperCase()} upgraded to ${res.newLevel}! (+${res.levelsGained} level${res.levelsGained > 1 ? 's' : ''}) • ${newPoints} pts remaining`);
    } else {
      const trainInfo = getStatTrainingProgressInfo(res.newLevel, res.newProgress, false);
      showToast(`🎯 ${key.toUpperCase()} training advanced (${trainInfo.summaryLabel}) • ${newPoints} pts remaining`);
    }

    onUpdatePlayer(updated);

    if (onTriggerPerkUnlock) {
      const milestone = checkCareerPerkMilestones(updated);
      if (milestone) {
        onTriggerPerkUnlock(milestone);
      }
    }

    if (newPoints === 0) {
      setShowAllAssignedModal(true);
    }
  };

  // Refund points handler for Goalkeeper
  const handleRefundGkPoint = (key: keyof GkDetailedStats) => {
    if (player.statBreakStats?.[key] || (gkDetailed[key] || 40) >= 100) {
      showToast('🔒 Stat Break Immortal! Broken stats are permanently locked at 100 and cannot be refunded or redistributed.');
      return;
    }
    const currentVal = gkDetailed[key] || 40;
    const currentProg = player.statTrainingProgress?.[key] || 0;

    const res = refundStatPointInvestment(currentVal, currentProg, 40);
    if (!res.refunded) return;

    const newDetailed = {
      ...gkDetailed,
      [key]: res.newLevel,
    };

    const syncedStats = syncCategoryStatsFromGkDetailed(player.stats, newDetailed);
    const newOvr = calculateWeightedOvr('GK', 'GK', syncedStats, player.playStyle);

    const newPoints = availableStatPoints + 1;

    const updated: PlayerCardData = {
      ...player,
      stats: syncedStats,
      ovr: newOvr,
      freeStatPoints: newPoints,
      unassignedPoints: newPoints,
      statTrainingProgress: {
        ...(player.statTrainingProgress || {}),
        [key]: res.newProgress,
      },
    };

    onUpdatePlayer(updated);
  };

  // =========================================================================
  // CLUB DEVELOPMENT SPENDING HANDLERS (REQUIREMENT 7)
  // =========================================================================
  const handleSpendClubFoundation = (pointsToInvest: number = 10) => {
    if (availableClubPoints < pointsToInvest) {
      showToast(`⚠️ You need at least ${pointsToInvest} Club Development Points!`);
      return;
    }
    const { updatedPlayer, result } = applyClubDevelopmentPointsToPlayer(player);
    const remainingPoints = Math.max(0, availableClubPoints - pointsToInvest);
    updatedPlayer.clubDevelopmentPoints = remainingPoints;
    onUpdatePlayer(updatedPlayer);
    setClubTrainingLogs(result.logs || []);
    if (triggerConfetti) triggerConfetti({ particleCount: 100, spread: 70 });
    showToast(`🌟 Invested ${pointsToInvest} Club Points! Improved ${result.allocatedStats.length} tactical attributes according to club philosophy.`);
  };

  const handleSpendTacticalDrill = (drillName: string, statKey: keyof OutfieldDetailedStats, bonus: number = 1, cost: number = 5) => {
    if (availableClubPoints < cost) {
      showToast(`⚠️ You need at least ${cost} Club Development Points!`);
      return;
    }
    const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
    const detailed = getOrCreateOutfieldDetailed(updated.stats);
    const oldVal = detailed[statKey] || 50;
    const newVal = Math.min(100, oldVal + bonus);
    detailed[statKey] = newVal;
    updated.stats.detailed = detailed;
    syncCategoryStatsFromDetailed(updated.stats, detailed);
    updated.ovr = calculateWeightedOvr(updated.position || 'ST', updated.subPosition || updated.position || 'ST', updated.stats, updated.playStyle);
    updated.clubDevelopmentPoints = Math.max(0, availableClubPoints - cost);
    onUpdatePlayer(updated);
    if (triggerConfetti) triggerConfetti({ particleCount: 60, spread: 60 });
    showToast(`⚽ ${drillName}: +${bonus} ${translateAttributeName(statKey, currentLanguage)}! (${oldVal} → ${newVal})`);
  };

  const handleSpendFacility = (facilityName: string, type: 'medical' | 'video_lab' | 'performance_gym', cost: number = 10) => {
    if (availableClubPoints < cost) {
      showToast(`⚠️ You need at least ${cost} Club Development Points!`);
      return;
    }
    const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
    updated.clubDevelopmentPoints = Math.max(0, availableClubPoints - cost);

    if (type === 'medical') {
      updated.fitness = Math.min(100, (updated.fitness || 80) + 20);
      updated.staminaCurrent = updated.fitness;
      if (updated.isInjured) {
        updated.injuryWeeksRemaining = Math.max(0, (updated.injuryWeeksRemaining || 1) - 2);
        if (updated.injuryWeeksRemaining === 0) {
          updated.isInjured = false;
          updated.healthStatus = 'healthy';
        }
      }
      showToast('🏥 High-Performance Medical Suite upgraded: +20% Fitness & accelerated recovery!');
    } else if (type === 'video_lab') {
      const detailed = getOrCreateOutfieldDetailed(updated.stats);
      detailed.shortPass = Math.min(100, (detailed.shortPass || 50) + 2);
      detailed.composure = Math.min(100, (detailed.composure || 50) + 1);
      updated.stats.detailed = detailed;
      syncCategoryStatsFromDetailed(updated.stats, detailed);
      updated.ovr = calculateWeightedOvr(updated.position || 'ST', updated.subPosition || updated.position || 'ST', updated.stats, updated.playStyle);
      showToast('📹 Video Analysis & Tactical Theater: +2 Short Passing & +1 Composure!');
    } else if (type === 'performance_gym') {
      const detailed = getOrCreateOutfieldDetailed(updated.stats);
      detailed.stamina = Math.min(100, (detailed.stamina || 50) + 2);
      detailed.strength = Math.min(100, (detailed.strength || 50) + 1);
      updated.stats.detailed = detailed;
      syncCategoryStatsFromDetailed(updated.stats, detailed);
      updated.ovr = calculateWeightedOvr(updated.position || 'ST', updated.subPosition || updated.position || 'ST', updated.stats, updated.playStyle);
      showToast('🏋️ Athletic Performance & Gym Suite: +2 Stamina & +1 Strength!');
    }
    if (triggerConfetti) triggerConfetti({ particleCount: 70, spread: 70 });
    onUpdatePlayer(updated);
  };

  // Helper to extract attribute diffs for Auto-Assign Preview
  const generateAttributeDiffs = (originalP: PlayerCardData, updatedP: PlayerCardData): AutoAssignDiffItem[] => {
    const diffs: AutoAssignDiffItem[] = [];
    if (isGk) {
      const oldGk = getOrCreateGkDetailed(originalP.stats);
      const newGk = getOrCreateGkDetailed(updatedP.stats);
      const gkLabels: Record<keyof GkDetailedStats, { label: string; category: string }> = {
        saving: { label: 'Saving (SAV)', category: 'Goalkeeping' },
        reflexes: { label: 'Reflexes (REF)', category: 'Goalkeeping' },
        handling: { label: 'Handling (HAN)', category: 'Goalkeeping' },
        positioning: { label: 'Positioning (POS)', category: 'Goalkeeping' },
        aerialReach: { label: 'Aerial Reach (AER)', category: 'Physical' },
        oneOnOne: { label: 'One-on-One (1v1)', category: 'Goalkeeping' },
        distribution: { label: 'Distribution (DIS)', category: 'Technical' },
      };
      (Object.keys(gkLabels) as (keyof GkDetailedStats)[]).forEach((k) => {
        const b = oldGk[k] || 40;
        const a = newGk[k] || 40;
        if (a > b) {
          diffs.push({
            key: k,
            label: gkLabels[k].label,
            category: gkLabels[k].category,
            before: b,
            after: a,
            diff: a - b,
          });
        }
      });
    } else {
      const oldOutfield = getOrCreateOutfieldDetailed(originalP.stats);
      const newOutfield = getOrCreateOutfieldDetailed(updatedP.stats);
      const outfieldLabels: Record<keyof OutfieldDetailedStats, { label: string; category: string }> = {
        pace: { label: 'Pace', category: 'Physical' },
        stamina: { label: 'Stamina', category: 'Physical' },
        strength: { label: 'Strength', category: 'Physical' },
        ballControl: { label: 'Ball Control', category: 'Technical' },
        retention: { label: 'Retention', category: 'Technical' },
        dribbling: { label: 'Dribbling', category: 'Technical' },
        shortPass: { label: 'Short Pass', category: 'Passing' },
        longPass: { label: 'Long Pass', category: 'Passing' },
        crossing: { label: 'Crossing', category: 'Passing' },
        shooting: { label: 'Shooting', category: 'Shooting' },
        heading: { label: 'Heading', category: 'Shooting' },
        longShots: { label: 'Long Shots', category: 'Shooting' },
        tackling: { label: 'Tackling', category: 'Defending' },
        marking: { label: 'Marking', category: 'Defending' },
        interceptions: { label: 'Interceptions', category: 'Defending' },
        positioning: { label: 'Positioning', category: 'Mental' },
        composure: { label: 'Composure', category: 'Mental' },
        reactions: { label: 'Reactions', category: 'Mental' },
      };
      (Object.keys(outfieldLabels) as (keyof OutfieldDetailedStats)[]).forEach((k) => {
        const b = oldOutfield[k] || 40;
        const a = newOutfield[k] || 40;
        if (a > b) {
          diffs.push({
            key: k,
            label: outfieldLabels[k].label,
            category: outfieldLabels[k].category,
            before: b,
            after: a,
            diff: a - b,
          });
        }
      });
    }
    return diffs;
  };

  // Transactional Auto-Assign: Trigger Preview Modal (DOES NOT CONSUME POINTS YET)
  const handleOpenAutoAssignPreview = () => {
    if (currentOvr >= potentialOvr) {
      showToast('⛔ Potential Ceiling Reached! You cannot distribute stat points while your Overall matches or exceeds your Potential.');
      return;
    }
    if (availableStatPoints <= 0) {
      showToast('⚠️ No unassigned stat points available!');
      return;
    }

    const preview = previewAutoAssignOvr(player);
    const diffs = generateAttributeDiffs(player, preview.updatedPlayer);

    if (diffs.length === 0 || preview.pointsSpent <= 0) {
      showToast('⚠️ No attributes can be upgraded with current points.');
      return;
    }

    setAutoAssignPreviewData({
      preview,
      diffs,
    });
  };

  // Confirm Auto-Assign Transaction: Permanently applies the points
  const handleConfirmAutoAssign = () => {
    if (!autoAssignPreviewData) return;
    const { preview } = autoAssignPreviewData;
    onUpdatePlayer(preview.updatedPlayer);
    if (showToast) {
      showToast(
        `⚡ Auto-allocated ${preview.pointsSpent} stat point(s)! OVR: ${preview.currentOvr} → ${preview.projectedOvr}`
      );
    }
    setAutoAssignPreviewData(null);

    if (onTriggerPerkUnlock) {
      const milestone = checkCareerPerkMilestones(preview.updatedPlayer);
      if (milestone) {
        onTriggerPerkUnlock(milestone);
      }
    }

    const remaining = preview.updatedPlayer.freeStatPoints ?? preview.updatedPlayer.unassignedPoints ?? 0;
    if (remaining === 0) {
      setShowAllAssignedModal(true);
    }
  };

  // Cancel Auto-Assign Transaction: Restores 100% of points untouched
  const handleCancelAutoAssign = () => {
    setAutoAssignPreviewData(null);
    if (showToast) {
      showToast('🛡️ Auto-assign cancelled. All stat points preserved.');
    }
  };

  const handleSimulateSeason = () => {
    const result = simulatePreseasonTraining(player, selectedFocus);
    setLastSeasonResult(result);
    onUpdatePlayer(result.updatedPlayer);
    setShowResultModal(true);

    if (onTriggerPerkUnlock) {
      const milestone = checkCareerPerkMilestones(result.updatedPlayer);
      if (milestone) {
        onTriggerPerkUnlock(milestone);
      }
    }

    if (result.cappedAtDeadline) {
      showToast(`🔒 Age limit reached! Potential cap permanently locked at OVR ${result.newPotential}.`);
    } else if (result.statPointsAwarded && result.statPointsAwarded > 0) {
      if (result.developmentResult?.isPro) {
        showToast(`📈 Preseason Complete! Age ${result.newAge} (${result.focusCategory.name}): +${result.statPointsAwarded} Stat Points awarded.`);
      } else if (result.developmentResult) {
        showToast(`⚽ Preseason Complete! Age ${result.newAge}: +${result.statPointsAwarded} Stat Points. "${result.developmentResult.message}"`);
      }
      if (triggerConfetti) {
        triggerConfetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } else if (result.newOvr > result.oldOvr) {
      showToast(`📈 Preseason Complete! Overall increased to ${result.newOvr} (${result.focusCategory.name}).`);
      if (triggerConfetti) {
        triggerConfetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      showToast(`🔄 Preseason Complete! Age advanced to ${result.newAge}.`);
    }
  };

  // Outfield Attribute Groups for clear visual layout
  const outfieldGroups: {
    id: string;
    title: string;
    icon: React.ReactNode;
    color: string;
    stats: { key: keyof OutfieldDetailedStats; label: string }[];
  }[] = [
    {
      id: 'PHY',
      title: translateTrainingGroupName('PHY', currentLanguage) || t('PHY_PHYSICAL') || 'Physical & Athleticism',
      icon: <Dumbbell className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-950/10',
      stats: [
        { key: 'pace', label: translateAttributeName('pace', currentLanguage) },
        { key: 'stamina', label: translateAttributeName('stamina', currentLanguage) },
        { key: 'strength', label: translateAttributeName('strength', currentLanguage) },
      ],
    },
    {
      id: 'PRO',
      title: translateTrainingGroupName('PRO', currentLanguage) || t('PRO_PROGRESSION') || 'Technical & Dribbling',
      icon: <Footprints className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-950/10',
      stats: [
        { key: 'ballControl', label: translateAttributeName('ballControl', currentLanguage) },
        { key: 'retention', label: translateAttributeName('retention', currentLanguage) },
        { key: 'dribbling', label: translateAttributeName('dribbling', currentLanguage) },
      ],
    },
    {
      id: 'CRE',
      title: translateTrainingGroupName('CRE', currentLanguage) || t('CRE_CREATION') || 'Creation & Playmaking',
      icon: <GitCommit className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/30 bg-blue-950/10',
      stats: [
        { key: 'shortPass', label: translateAttributeName('shortPass', currentLanguage) },
        { key: 'longPass', label: translateAttributeName('longPass', currentLanguage) },
        { key: 'crossing', label: translateAttributeName('crossing', currentLanguage) },
      ],
    },
    {
      id: 'GOA',
      title: translateTrainingGroupName('GOA', currentLanguage) || t('GOA_GOALSCORING') || 'Goalscoring & Finishing',
      icon: <Target className="w-4 h-4 text-rose-400" />,
      color: 'border-rose-500/30 bg-rose-950/10',
      stats: [
        { key: 'shooting', label: translateAttributeName('shooting', currentLanguage) },
        { key: 'heading', label: translateAttributeName('heading', currentLanguage) },
        { key: 'longShots', label: translateAttributeName('longShots', currentLanguage) },
      ],
    },
    {
      id: 'DEF',
      title: translateTrainingGroupName('DEF', currentLanguage) || t('DEF_DEFENDING') || 'Defending & Tackling',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-950/10',
      stats: [
        { key: 'tackling', label: translateAttributeName('tackling', currentLanguage) },
        { key: 'marking', label: translateAttributeName('marking', currentLanguage) },
        { key: 'interceptions', label: translateAttributeName('interceptions', currentLanguage) },
      ],
    },
    {
      id: 'MEN',
      title: translateTrainingGroupName('MEN', currentLanguage) || t('MEN_MENTAL') || 'Tactical & Mental',
      icon: <Brain className="w-4 h-4 text-cyan-400" />,
      color: 'border-cyan-500/30 bg-cyan-950/10',
      stats: [
        { key: 'positioning', label: translateAttributeName('positioning', currentLanguage) },
        { key: 'composure', label: translateAttributeName('composure', currentLanguage) },
        { key: 'reactions', label: translateAttributeName('reactions', currentLanguage) },
      ],
    },
  ];

  // Goalkeeper Attribute Group
  const gkGroup: { key: keyof GkDetailedStats; label: string }[] = [
    { key: 'saving', label: translateAttributeName('saving', currentLanguage) },
    { key: 'reflexes', label: translateAttributeName('reflexes', currentLanguage) },
    { key: 'handling', label: translateAttributeName('handling', currentLanguage) },
    { key: 'positioning', label: translateAttributeName('positioning', currentLanguage) },
    { key: 'aerialReach', label: translateAttributeName('aerialReach', currentLanguage) },
    { key: 'oneOnOne', label: translateAttributeName('oneOnOne', currentLanguage) },
    { key: 'distribution', label: translateAttributeName('distribution', currentLanguage) },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. STICKY TOP NAVIGATION BAR (Always reachable on mobile & desktop) */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b-2 border-slate-800 p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-lg shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {onClose && (
            <button
              type="button"
              id="dev-panel-sticky-back-btn"
              onClick={onClose}
              className="h-9 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white border-2 border-amber-400/80 pixel-corners pixel-bevel-gold font-arcade text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 shadow shrink-0"
              title={t('NAV_BACK') || 'Back'}
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>{t('NAV_BACK') || 'BACK'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 pixel-corners bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 hidden xs:flex">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-arcade text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider truncate">
                {t('DEV_CENTER_TITLE') || 'DEVELOPMENT CENTER'}
              </h2>
              <span className="text-[10px] text-slate-400 font-pixel block truncate">
                {player.name} • {player.position} ({currentOvr} OVR)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {availableStatPoints > 0 && (
            <span className="px-2.5 py-1 bg-rose-600 text-white font-pixel font-black text-[11px] pixel-corners border border-rose-400 animate-pixel-blink shadow">
              ! {availableStatPoints} PTS
            </span>
          )}

          {onReturnToYouthAcademy && (
            <button
              type="button"
              onClick={() => {
                if (availableStatPoints === 0) {
                  setShowAllAssignedModal(true);
                } else {
                  onReturnToYouthAcademy();
                }
              }}
              className="h-9 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-black text-xs uppercase pixel-bevel-emerald pixel-corners flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">{isProfessionalPlayer(player) ? (t('RETURN_TO_CAREER_HUB') || 'CAREER HUB') : (t('DONE') || 'DONE')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-2 sm:p-4 pb-28 sm:pb-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar smooth-scroll">
        {/* ========================================================================= */}
        {/* 2 MAIN SECTIONS / TABS: PLAYER DEVELOPMENT vs CLUB DEVELOPMENT (REQUIREMENT 7) */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between p-2 bg-slate-950 border-2 border-slate-800 pixel-corners pixel-bevel-raised gap-2 font-pixel">
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              id="tab-player-development"
              onClick={() => setMainDevSection('player')}
              className={`flex-1 py-3 px-3 sm:px-4 pixel-corners text-xs sm:text-sm font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                mainDevSection === 'player'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 pixel-bevel-gold shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-amber-500" />
              <span>1. PLAYER DEVELOPMENT</span>
              {availableStatPoints > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-pixel font-black px-1.5 py-0.5 pixel-corners border border-rose-400 animate-pixel-blink">
                  ! {availableStatPoints}
                </span>
              )}
            </button>

            <button
              type="button"
              id="tab-club-development"
              onClick={() => setMainDevSection('club')}
              className={`flex-1 py-3 px-3 sm:px-4 pixel-corners text-xs sm:text-sm font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                mainDevSection === 'club'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 pixel-bevel-emerald shadow-lg'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>2. CLUB DEVELOPMENT</span>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] font-pixel font-bold px-2 py-0.5 pixel-corners border border-emerald-500/50">
                {clubDevInfo.isYouthAcademy ? 'YOUTH ACADEMY' : `TIER ${clubDevInfo.tier || 3}`}
              </span>
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 pixel-corners bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700 pixel-bevel-raised cursor-pointer shrink-0"
              title="Close Development Panel"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

      {mainDevSection === 'player' ? (
        <>
          {/* SUB-TAB NAVIGATOR */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 p-1.5 bg-slate-950 border-2 border-slate-800 pixel-corners pixel-bevel-sunken font-pixel select-none">
            <button
              type="button"
              onClick={() => setSubTab('attributes')}
              className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 pixel-corners text-[11px] sm:text-xs font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer relative min-h-[38px] sm:min-h-[40px] border-2 truncate ${
                subTab === 'attributes'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 pixel-bevel-gold shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 pixel-bevel-raised'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
              <span className="truncate">{t('TAB_ATTRIBUTES') || 'Attributes'}</span>
              {availableStatPoints > 0 && (
                <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-pixel font-black px-1.5 py-0.2 pixel-corners border border-rose-400 shadow-md animate-pixel-blink shrink-0">
                  !{availableStatPoints}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSubTab('training')}
              className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 pixel-corners text-[11px] sm:text-xs font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] sm:min-h-[40px] border-2 truncate ${
                subTab === 'training'
                  ? 'bg-purple-400 text-slate-950 border-purple-300 pixel-bevel-raised shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 pixel-bevel-raised'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
              <span className="truncate">{t('CAREER_CURVE_TRAINING') || 'Training'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('stamina')}
              className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 pixel-corners text-[11px] sm:text-xs font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] sm:min-h-[40px] border-2 truncate ${
                subTab === 'stamina'
                  ? 'bg-emerald-400 text-slate-950 border-emerald-300 pixel-bevel-emerald shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 pixel-bevel-raised'
              }`}
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
              <span className="truncate">{t('FITNESS_STAMINA_MEDICAL') || 'Medical'}</span>
              {player.isInjured && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setSubTab('positions')}
              className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 pixel-corners text-[11px] sm:text-xs font-arcade font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] sm:min-h-[40px] border-2 truncate ${
                subTab === 'positions'
                  ? 'bg-sky-400 text-slate-950 border-sky-300 pixel-bevel-cyan shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 pixel-bevel-raised'
              }`}
            >
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
              <span className="truncate">{t('TAB_POSITIONS') || 'Positions'}</span>
              {player.positions && player.positions.length > 1 && (
                <span className="bg-amber-500 text-slate-950 text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 pixel-corners border border-amber-300 shadow shrink-0">
                  {player.positions.length}/4
                </span>
              )}
            </button>
          </div>

      {/* SUB TAB 1: ATTRIBUTES & STAT ALLOCATION */}
      {subTab === 'attributes' && (
        <div className="space-y-4 font-pixel">
          {/* HEADER RATINGS METRICS CARD */}
          <div className="bg-slate-950 border-2 border-slate-800 pixel-corners pixel-bevel-raised p-4 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 pixel-corners bg-slate-900 border border-slate-700 pixel-bevel-raised flex items-center justify-center text-white shadow-sm">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-arcade font-black text-white uppercase tracking-wide flex items-center gap-2">
                    <span>{t('PLAYER_RATING_CENTER') || 'Player Rating & Attribute Center'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 pixel-corners bg-blue-950 text-blue-300 font-extrabold border border-blue-500/40">
                      {player.position || 'ST'} • {player.subPosition || 'ST'}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-retro">
                    {t('DISTRIBUTE_STAT_POINTS_DESC') || 'Distribute stat points earned from completed seasons to upgrade your skills.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => setShowDevTutorial(true)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-pixel text-xs rounded-xl border border-amber-400/40 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0 active:scale-95 min-h-[38px]"
                  title={t('DEV_TRAINING_GUIDE_BTN') || 'Training Guide'}
                >
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>{t('DEV_TRAINING_GUIDE_BTN') || 'Training Guide'}</span>
                </button>

                {availableStatPoints > 0 && (
                  <button
                    onClick={handleOpenAutoAssignPreview}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm border border-slate-200 transition-all cursor-pointer shrink-0 active:scale-95 min-h-[38px]"
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    {t('AUTO_ALLOCATE') || 'Auto-Allocate'} ({availableStatPoints} pts)
                  </button>
                )}

                {onReturnToYouthAcademy && (
                  <button
                    onClick={() => {
                      if (availableStatPoints === 0) {
                        setShowAllAssignedModal(true);
                      } else {
                        onReturnToYouthAcademy();
                      }
                    }}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all flex items-center gap-1.5 shrink-0 active:scale-95 min-h-[38px]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span>{isProfessionalPlayer(player) ? (t('RETURN_TO_CAREER_HUB') || 'Return to Career Hub') : (t('RETURN_TO_YOUTH_ACADEMY') || 'Return to Youth Academy')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 5 KEY RATING METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              {/* 1. OVERALL (OVR) */}
              <div className="bg-[#12131c] border border-amber-500/30 p-3 rounded-xl space-y-0.5">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {t('STAT_OVR') || 'OVR'}
                </span>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-black text-amber-400">{currentOvr}</span>
                  {(() => {
                    const ovrInfo = getEffectivePlayerOvr(player);
                    if (ovrInfo.bonusOvr > 0) {
                      return (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[11px] border border-emerald-500/40">
                          +{ovrInfo.bonusOvr}
                        </span>
                      );
                    }
                    if (ovrInfo.bonusOvr < 0) {
                      return (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-black text-[11px] border border-rose-500/40">
                          {ovrInfo.bonusOvr}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                <span className="text-[10px] text-gray-500 font-bold block">{t('OVERALL_RATING') || 'Overall Rating'}</span>
              </div>

              {/* 2. POTENTIAL (POT) */}
              <div className="bg-[#12131c] border border-purple-500/30 p-3 rounded-xl space-y-0.5">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  {t('POTENTIAL_CAP') || 'POTENTIAL'}
                </span>
                <span className="text-xl font-black text-purple-300 block">{potentialOvr}</span>
                <span className="text-[10px] text-gray-500 font-bold block">{t('POTENTIAL_CAP') || 'Potential Cap'}</span>
              </div>

              {/* 3. POSITION OVR */}
              <div className="bg-[#12131c] border border-blue-500/30 p-3 rounded-xl space-y-0.5">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase flex items-center justify-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                  {t('POS_OVR') || 'POS OVR'}
                </span>
                <span className="text-xl font-black text-blue-300 block">{positionOvr}</span>
                <span className="text-[10px] text-gray-500 font-bold block">{player.position || 'ATT'}</span>
              </div>

              {/* 4. SUB-POSITION OVR */}
              <div className="bg-[#12131c] border border-cyan-500/30 p-3 rounded-xl space-y-0.5">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase flex items-center justify-center gap-1">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  {t('SUB_OVR') || 'SUB OVR'}
                </span>
                <span className="text-xl font-black text-cyan-300 block">{subPositionOvr}</span>
                <span className="text-[10px] text-gray-500 font-bold block">{player.subPosition || 'ST'}</span>
              </div>

              {/* 5. AVAILABLE STAT POINTS */}
              <div
                className={`col-span-2 sm:col-span-1 border p-3 rounded-xl space-y-0.5 transition-all ${
                  availableStatPoints > 0
                    ? 'bg-rose-950/60 border-rose-500/80 shadow-[0_0_15px_rgba(225,29,72,0.4)] animate-pulse'
                    : 'bg-[#12131c] border-gray-800'
                }`}
              >
                <span className="text-[10px] font-extrabold uppercase flex items-center justify-center gap-1 text-rose-300">
                  {availableStatPoints > 0 ? `🔴 ${t('STAT_POINTS') || 'STAT POINTS'}` : (t('STAT_POINTS') || 'STAT POINTS')}
                </span>
                <span
                  className={`text-xl font-black block ${
                    availableStatPoints > 0 ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {availableStatPoints}
                </span>
                <span className="text-[10px] text-rose-200/80 font-bold block">
                  {availableStatPoints > 0 ? (t('READY_TO_ASSIGN') || 'Ready To Assign!') : (t('ZERO_UNASSIGNED') || '0 Unassigned')}
                </span>
              </div>
            </div>

            {/* CATEGORY OVRS BREAKDOWN (PHY, PRO, CRE, GOA, DEF, MEN) */}
            {!isGk && (() => {
              const breakInfo = getStatBreakBonus(outfieldDetailed);
              const catInfo = getEffectiveCategoryStats(player);
              const phyVal = breakInfo.categoryOverrides.phy ?? calculateThreeStatGroupValue(outfieldDetailed.pace || 40, outfieldDetailed.stamina || 40, outfieldDetailed.strength || 40);
              const proVal = breakInfo.categoryOverrides.pro ?? calculateThreeStatGroupValue(outfieldDetailed.ballControl || 40, outfieldDetailed.retention || 40, outfieldDetailed.dribbling || 40);
              const creVal = breakInfo.categoryOverrides.cre ?? calculateThreeStatGroupValue(outfieldDetailed.shortPass || 40, outfieldDetailed.longPass || 40, outfieldDetailed.crossing || 40);
              const scoVal = breakInfo.categoryOverrides.goa ?? calculateThreeStatGroupValue(outfieldDetailed.shooting || 40, outfieldDetailed.heading || 40, outfieldDetailed.longShots || 40);
              const defVal = breakInfo.categoryOverrides.def ?? calculateThreeStatGroupValue(outfieldDetailed.tackling || 40, outfieldDetailed.marking || 40, outfieldDetailed.interceptions || 40);
              const menVal = breakInfo.categoryOverrides.men ?? calculateThreeStatGroupValue(outfieldDetailed.positioning || 40, outfieldDetailed.composure || 40, outfieldDetailed.reactions || 40);

              const phyAbbr = translateAttributeAbbreviation('physical', currentLanguage) || 'PHY';
              const proAbbr = translateAttributeAbbreviation('progression', currentLanguage) || 'PRO';
              const creAbbr = translateAttributeAbbreviation('creation', currentLanguage) || 'CRE';
              const goaAbbr = translateAttributeAbbreviation('goalscoring', currentLanguage) || 'GOA';
              const defAbbr = translateAttributeAbbreviation('defending', currentLanguage) || 'DEF';
              const menAbbr = translateAttributeAbbreviation('mental', currentLanguage) || 'MEN';

              return (
                <div className="pt-2 border-t border-gray-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{t('CATEGORY_RATINGS') || 'Category Ratings'}:</span>
                    {breakInfo.flatOvrBonus > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 text-[10px]">
                        🌟 +{breakInfo.flatOvrBonus} OVR STAT BREAK
                      </span>
                    )}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 font-extrabold flex items-center gap-1">
                      <span>{phyAbbr} {phyVal}</span>
                      {catInfo.categoryBonuses.PHY > 0 && <span className="text-emerald-400 font-black text-[10px]">+{catInfo.categoryBonuses.PHY}</span>}
                      {catInfo.categoryBonuses.PHY < 0 && <span className="text-rose-400 font-black text-[10px]">{catInfo.categoryBonuses.PHY}</span>}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border font-extrabold flex items-center gap-1 ${
                      proVal >= 117
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse'
                        : proVal >= 100
                        ? 'bg-purple-950/80 border-amber-400/80 text-amber-300'
                        : 'bg-purple-950/40 border-purple-500/30 text-purple-300'
                    }`}>
                      <span>{proAbbr} {proVal >= 117 ? `👑 ${proVal}` : proVal >= 100 ? `⭐ ${proVal}` : proVal}</span>
                      {proVal < 100 && catInfo.categoryBonuses.PRO > 0 && <span className="text-emerald-400 font-black text-[10px]">+{catInfo.categoryBonuses.PRO}</span>}
                      {proVal < 100 && catInfo.categoryBonuses.PRO < 0 && <span className="text-rose-400 font-black text-[10px]">{catInfo.categoryBonuses.PRO}</span>}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border font-extrabold flex items-center gap-1 ${
                      creVal >= 117
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse'
                        : creVal >= 100
                        ? 'bg-blue-950/80 border-amber-400/80 text-amber-300'
                        : 'bg-blue-950/40 border-blue-500/30 text-blue-300'
                    }`}>
                      <span>{creAbbr} {creVal >= 117 ? `👑 ${creVal}` : creVal >= 100 ? `⭐ ${creVal}` : creVal}</span>
                      {creVal < 100 && catInfo.categoryBonuses.CRE > 0 && <span className="text-emerald-400 font-black text-[10px]">+{catInfo.categoryBonuses.CRE}</span>}
                      {creVal < 100 && catInfo.categoryBonuses.CRE < 0 && <span className="text-rose-400 font-black text-[10px]">{catInfo.categoryBonuses.CRE}</span>}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border font-extrabold flex items-center gap-1 ${
                      scoVal >= 117
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse'
                        : scoVal >= 100
                        ? 'bg-rose-950/80 border-amber-400/80 text-amber-300'
                        : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                    }`}>
                      <span>{goaAbbr} {scoVal >= 117 ? `👑 ${scoVal}` : scoVal >= 100 ? `⭐ ${scoVal}` : scoVal}</span>
                      {scoVal < 100 && catInfo.categoryBonuses.SCO > 0 && <span className="text-emerald-400 font-black text-[10px]">+{catInfo.categoryBonuses.SCO}</span>}
                      {scoVal < 100 && catInfo.categoryBonuses.SCO < 0 && <span className="text-rose-400 font-black text-[10px]">{catInfo.categoryBonuses.SCO}</span>}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border font-extrabold flex items-center gap-1 ${
                      defVal >= 117
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse'
                        : defVal >= 100
                        ? 'bg-emerald-950/80 border-amber-400/80 text-amber-300'
                        : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <span>{defAbbr} {defVal >= 117 ? `👑 ${defVal}` : defVal >= 100 ? `⭐ ${defVal}` : defVal}</span>
                      {defVal < 100 && catInfo.categoryBonuses.DEF > 0 && <span className="text-emerald-400 font-black text-[10px]">+{catInfo.categoryBonuses.DEF}</span>}
                      {defVal < 100 && catInfo.categoryBonuses.DEF < 0 && <span className="text-rose-400 font-black text-[10px]">{catInfo.categoryBonuses.DEF}</span>}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-extrabold flex items-center gap-1">
                      <span>{menAbbr} {menVal}</span>
                      {catInfo.categoryBonuses.MEN > 0 && <span className="text-emerald-400 font-black text-[10px]">+{catInfo.categoryBonuses.MEN}</span>}
                      {catInfo.categoryBonuses.MEN < 0 && <span className="text-rose-400 font-black text-[10px]">{catInfo.categoryBonuses.MEN}</span>}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* RED ALERT BANNER & STAT POINT PREVIEW WHEN UNASSIGNED STAT POINTS EXIST */}
          {availableStatPoints > 0 && (() => {
            const preview = previewAutoAssignOvr(player);
            return (
              <div className="bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90 border-2 border-rose-500/80 p-4 rounded-2xl shadow-xl shadow-rose-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600/40 border border-rose-300 flex items-center justify-center text-rose-100 font-black text-xl shrink-0">
                    🔴 !
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                      <span>{availableStatPoints} {t('UNASSIGNED_POINTS_AVAILABLE') || 'UNASSIGNED STAT POINTS AVAILABLE'}</span>
                    </h4>
                    <p className="text-xs text-rose-100/90 font-medium">
                      {t('STAT_POINT_PREVIEW') || 'Stat Point Preview'}: {t('STAT_OVR') || 'OVR'} {currentOvr} → {t('PROJECTED_OVR') || 'Projected OVR'} {preview.projectedOvr} (+{preview.projectedOvr - currentOvr})
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleOpenAutoAssignPreview}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  {t('AUTO_ASSIGN') || 'Auto-Assign'} ({t('STAT_OVR') || 'OVR'} {preview.projectedOvr})
                </button>
              </div>
            );
          })()}

          {/* GROWTH SPURT TEMPORARY TECHNICAL PENALTY BANNER */}
          {!!(player.growthSpurtPenaltyMonthsRemaining && player.growthSpurtPenaltyMonthsRemaining > 0) && (
            <div className="bg-gradient-to-r from-amber-950/90 via-yellow-950/80 to-amber-950/90 border-2 border-amber-500/80 p-4 rounded-2xl shadow-xl shadow-amber-950/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/30 border border-amber-400 flex items-center justify-center text-amber-300 font-black text-xl shrink-0">
                🌱
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-300 uppercase tracking-wide flex items-center gap-2">
                  <span>GROWTH SPURT COORDINATION ADJUSTMENT ACTIVE</span>
                </h4>
                <p className="text-xs text-amber-100/90 font-medium">
                  Adapting to sudden growth spurt: <strong>Dribbling -10</strong>, <strong>Ball Control -10</strong> for 1 in-game month. Attributes will fully restore after 1 month.
                </p>
              </div>
            </div>
          )}

          {/* ATTRIBUTES LIST / GRID */}
          {isGk ? (
            /* GOALKEEPER ATTRIBUTES */
            <div className="bg-[#1a1c28] border border-gray-800 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Goalkeeping Core Attributes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gkGroup.map((item) => {
                  const baseVal = gkDetailed[item.key] || 40;
                  const modInfo = getAttributeModifier(player, item.key, baseVal);
                  const isStatBreak = modInfo.isStatBroken;
                  const effectiveVal = modInfo.effectiveVal;
                  const delta = modInfo.delta;
                  const currentProg = player.statTrainingProgress?.[item.key] || 0;
                  const trainInfo = getStatTrainingProgressInfo(baseVal, currentProg, isStatBreak);

                  return (
                    <div
                      key={item.key}
                      className={`border p-3.5 rounded-xl flex items-center justify-between gap-3 ${
                        isStatBreak
                          ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-900 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                          : 'bg-[#12131c] border-gray-800'
                      }`}
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${isStatBreak ? 'text-amber-300' : 'text-gray-200'}`}>
                            <span>{item.label}</span>
                            {isStatBreak && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-black text-[9px] border border-amber-400/60 uppercase animate-pulse">
                                ⭐ STAT BREAK
                              </span>
                            )}
                          </span>
                          <span className="text-xs font-black">
                            {isStatBreak ? (
                              <span className="text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse">
                                ⭐ {baseVal} / 100
                              </span>
                            ) : delta > 0 ? (
                              <span className="flex items-center gap-1">
                                <span className="text-gray-200">{baseVal}</span>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px] border border-emerald-500/40">
                                  +{delta}
                                </span>
                                <span className="text-emerald-400 font-extrabold text-[11px]">
                                  ({effectiveVal} / 99)
                                </span>
                              </span>
                            ) : delta < 0 ? (
                              <span className="flex items-center gap-1">
                                <span className="text-gray-200">{baseVal}</span>
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-black text-[10px] border border-rose-500/40">
                                  {delta}
                                </span>
                                <span className="text-rose-400 font-extrabold text-[11px]">
                                  ({effectiveVal} / 99)
                                </span>
                              </span>
                            ) : (
                              <span
                                className={
                                  baseVal >= 80
                                    ? 'text-emerald-400'
                                    : baseVal >= 70
                                    ? 'text-blue-400'
                                    : baseVal >= 60
                                    ? 'text-amber-400'
                                    : 'text-gray-300'
                                }
                              >
                                {baseVal} / 99
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isStatBreak
                                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
                                : effectiveVal >= 80
                                ? 'bg-emerald-500'
                                : effectiveVal >= 70
                                ? 'bg-blue-500'
                                : effectiveVal >= 60
                                ? 'bg-amber-500'
                                : 'bg-gray-500'
                            }`}
                            style={{ width: `${Math.min(100, (effectiveVal / (isStatBreak ? 100 : 99)) * 100)}%` }}
                          />
                          {!isStatBreak && delta > 0 && (
                            <div
                              className="h-full bg-emerald-400 transition-all duration-300"
                              style={{ width: `${Math.min(100 - (baseVal / 99) * 100, (delta / 99) * 100)}%` }}
                            />
                          )}
                          {!isStatBreak && delta < 0 && (
                            <div
                              className="h-full bg-rose-500/60 transition-all duration-300"
                              style={{ width: `${Math.min(100 - (effectiveVal / 99) * 100, (Math.abs(delta) / 99) * 100)}%` }}
                            />
                          )}
                        </div>

                        {/* TRAINING PROGRESS BAR & NEXT LEVEL REQUIREMENT */}
                        <div className="pt-1 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-pixel select-none">
                            <span className="text-slate-400 font-semibold flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5 text-amber-400" />
                              <span>
                                {isStatBreak
                                  ? (t('DEV_STAT_BREAK_MAX') || '⭐ STAT BREAK MAX')
                                  : trainInfo.isAt99StatBreak
                                  ? (t('DEV_STAT_BREAK_PROGRESS') || 'Stat Break Progress')
                                  : (t('DEV_TRAINING_LEVEL') || 'Training Level')}
                              </span>
                            </span>
                            <span
                              className={`font-bold font-mono text-[10px] ${
                                isStatBreak
                                  ? 'text-amber-300'
                                  : trainInfo.isAt99StatBreak
                                  ? 'text-yellow-300 font-black'
                                  : trainInfo.percent > 0
                                  ? 'text-cyan-300'
                                  : 'text-slate-400'
                              }`}
                            >
                              {trainInfo.summaryLabel}
                            </span>
                          </div>
                          <div className="w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden border border-slate-700/60 p-0.5 flex">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isStatBreak
                                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                                  : trainInfo.isAt99StatBreak
                                  ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse'
                                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]'
                              }`}
                              style={{ width: `${Math.max(trainInfo.percent > 0 ? 4 : 0, trainInfo.percent)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* STAT INCREMENT / DECREMENT CONTROLS */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleRefundGkPoint(item.key)}
                          disabled={(baseVal <= 40 && currentProg <= 0.0001) || isStatBreak}
                          className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 font-bold flex items-center justify-center text-sm cursor-pointer transition"
                          title="Refund Point"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSpendGkPoint(item.key, 1)}
                          disabled={availableStatPoints < 1 || isStatBreak || baseVal >= 100}
                          className={`w-8 h-8 rounded-lg font-black flex items-center justify-center text-base shadow-md transition-all cursor-pointer ${
                            isStatBreak || baseVal >= 100
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40'
                              : baseVal === 99
                              ? availableStatPoints > 0
                                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 border border-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse hover:scale-105 active:scale-95'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40'
                              : availableStatPoints > 0
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-300/40 hover:scale-105 active:scale-95'
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40'
                          }`}
                          title={
                            isStatBreak
                              ? 'Stat Break Active'
                              : baseVal === 99
                              ? 'Invest 1 Point towards 100 Stat Break'
                              : 'Spend 1 Point'
                          }
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                        {availableStatPoints >= 5 && (
                          <button
                            onClick={() => handleSpendGkPoint(item.key, 5)}
                            disabled={isStatBreak || baseVal >= 100}
                            className={`px-2 py-1 font-black text-[10px] rounded-lg shadow cursor-pointer transition ${
                              baseVal === 99
                                ? 'bg-amber-950 border border-amber-400 text-amber-300 hover:bg-amber-900'
                                : 'bg-emerald-950 border border-emerald-500/50 hover:bg-emerald-900 text-emerald-300'
                            }`}
                            title={baseVal === 99 ? 'Invest 5 Points towards 100 Stat Break' : 'Spend 5 Points'}
                          >
                            +5
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* OUTFIELD ATTRIBUTES CATEGORIES */
            <div className="space-y-3">
              {/* MOBILE CATEGORY SELECTOR PILLS */}
              <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setMobileCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-arcade font-black uppercase shrink-0 transition-all ${
                    mobileCategoryFilter === 'all'
                      ? 'bg-amber-400 text-slate-950 border-2 border-amber-300 shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  ALL (18)
                </button>
                {outfieldGroups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setMobileCategoryFilter(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-arcade font-black uppercase shrink-0 transition-all flex items-center gap-1 ${
                      mobileCategoryFilter === g.id
                        ? 'bg-amber-400 text-slate-950 border-2 border-amber-300 shadow-md'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <span>{g.id}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {outfieldGroups
                  .filter((group) => mobileCategoryFilter === 'all' || group.id === mobileCategoryFilter)
                  .map((group) => (
                <div
                  key={group.title}
                  className={`bg-[#1a1c28] border ${group.color} rounded-2xl p-4 space-y-3.5 shadow-lg`}
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
                    <div className="p-1.5 bg-slate-900 rounded-lg">{group.icon}</div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      {group.title}
                    </h4>
                  </div>

                    <div className="space-y-3">
                    {group.stats.map((st) => {
                      const baseVal = outfieldDetailed[st.key] || 40;
                      const modInfo = getAttributeModifier(player, st.key, baseVal);
                      const isStatBreak = modInfo.isStatBroken;
                      const effectiveVal = modInfo.effectiveVal;
                      const delta = modInfo.delta;
                      const currentProg = player.statTrainingProgress?.[st.key] || 0;
                      const isWeakness = isStatWeaknessForPlayerType(player.playerTypeId, st.key);
                      const statRole = getPlayerTypeStatRole(player.playerTypeId, st.key);
                      const trainInfo = getStatTrainingProgressInfo(baseVal, currentProg, isStatBreak, isWeakness);

                      return (
                        <div
                          key={st.key}
                          className={`border p-3 rounded-xl flex items-center justify-between gap-3 transition ${
                            isStatBreak
                              ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-slate-900 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                              : isWeakness
                              ? 'bg-[#141018] border-rose-900/40 hover:border-rose-700/60'
                              : 'bg-[#12131c] border-gray-800/80 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-extrabold flex items-center gap-1.5 flex-wrap ${isStatBreak ? 'text-amber-300' : 'text-gray-200'}`}>
                                <span>{st.label}</span>
                                {isStatBreak && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-black text-[9px] border border-amber-400/60 uppercase animate-pulse">
                                    ⭐ STAT BREAK
                                  </span>
                                )}
                                {!isStatBreak && statRole === 'primary' && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold text-[9px] border border-amber-400/40 uppercase tracking-tight flex items-center gap-0.5" title="Main Archetype Strength: +2 to attribute per year">
                                    <span>★</span>
                                    <span>{t('DEV_STRENGTH_PRIMARY_TAG') || 'Strength (+2/yr)'}</span>
                                  </span>
                                )}
                                {!isStatBreak && statRole === 'secondary' && (
                                  <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-bold text-[9px] border border-cyan-400/40 uppercase tracking-tight flex items-center gap-0.5" title="Secondary Archetype Strength: +1 to attribute per year">
                                    <span>✦</span>
                                    <span>{t('DEV_STRENGTH_SECONDARY_TAG') || 'Secondary (+1/yr)'}</span>
                                  </span>
                                )}
                                {!isStatBreak && statRole === 'weakness' && (
                                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px] border border-rose-500/40 uppercase tracking-tight flex items-center gap-0.5" title="Archetype Weakness: Requires 10% more stat points to advance">
                                    <span>⚠️</span>
                                    <span>{t('DEV_WEAKNESS_TAG') || 'Weakness (+10%)'}</span>
                                  </span>
                                )}
                              </span>
                              <span className="text-xs font-black">
                                {isStatBreak ? (
                                  <span className="text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse">
                                    ⭐ {baseVal} / 100
                                  </span>
                                ) : delta > 0 ? (
                                  <span className="flex items-center gap-1">
                                    <span className="text-gray-200">{baseVal}</span>
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px] border border-emerald-500/40">
                                      +{delta}
                                    </span>
                                    <span className="text-emerald-400 font-extrabold text-[11px]">
                                      ({effectiveVal} / 99)
                                    </span>
                                  </span>
                                ) : delta < 0 ? (
                                  <span className="flex items-center gap-1">
                                    <span className="text-gray-200">{baseVal}</span>
                                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-black text-[10px] border border-rose-500/40">
                                      {delta}
                                    </span>
                                    <span className="text-rose-400 font-extrabold text-[11px]">
                                      ({effectiveVal} / 99)
                                    </span>
                                  </span>
                                ) : (
                                  <span
                                    className={
                                      baseVal >= 80
                                        ? 'text-emerald-400'
                                        : baseVal >= 70
                                        ? 'text-blue-400'
                                        : baseVal >= 60
                                        ? 'text-amber-400'
                                        : 'text-gray-300'
                                    }
                                  >
                                    {baseVal} / 99
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isStatBreak
                                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-pulse'
                                    : effectiveVal >= 80
                                    ? 'bg-emerald-500'
                                    : effectiveVal >= 70
                                    ? 'bg-blue-500'
                                    : effectiveVal >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-gray-500'
                                }`}
                                style={{ width: `${Math.min(100, (effectiveVal / (isStatBreak ? 100 : 99)) * 100)}%` }}
                              />
                              {!isStatBreak && delta > 0 && (
                                <div
                                  className="h-full bg-emerald-400 transition-all duration-300"
                                  style={{ width: `${Math.min(100 - (baseVal / 99) * 100, (delta / 99) * 100)}%` }}
                                />
                              )}
                              {!isStatBreak && delta < 0 && (
                                <div
                                  className="h-full bg-rose-500/60 transition-all duration-300"
                                  style={{ width: `${Math.min(100 - (effectiveVal / 99) * 100, (Math.abs(delta) / 99) * 100)}%` }}
                                />
                              )}
                            </div>

                            {/* TRAINING PROGRESS BAR & NEXT LEVEL REQUIREMENT */}
                            <div className="pt-1 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-pixel select-none">
                                <span className="text-slate-400 font-semibold flex items-center gap-1">
                                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                                  <span>
                                    {isStatBreak
                                      ? (t('DEV_STAT_BREAK_MAX') || '⭐ STAT BREAK MAX')
                                      : trainInfo.isAt99StatBreak
                                      ? (t('DEV_STAT_BREAK_PROGRESS') || 'Stat Break Progress')
                                      : (t('DEV_TRAINING_LEVEL') || 'Training Level')}
                                  </span>
                                </span>
                                <span
                                  className={`font-bold font-mono text-[10px] ${
                                    isStatBreak
                                      ? 'text-amber-300'
                                      : trainInfo.isAt99StatBreak
                                      ? 'text-yellow-300 font-black'
                                      : trainInfo.percent > 0
                                      ? 'text-cyan-300'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {trainInfo.summaryLabel}
                                </span>
                              </div>
                              <div className="w-full bg-slate-900/90 h-1.5 rounded-full overflow-hidden border border-slate-700/60 p-0.5 flex">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isStatBreak
                                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                                      : trainInfo.isAt99StatBreak
                                      ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 shadow-[0_0_6px_rgba(251,191,36,0.6)] animate-pulse'
                                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_5px_rgba(6,182,212,0.5)]'
                                  }`}
                                  style={{ width: `${Math.max(trainInfo.percent > 0 ? 4 : 0, trainInfo.percent)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* CONTROLS */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleRefundOutfieldPoint(st.key)}
                              disabled={(baseVal <= 40 && currentProg <= 0.0001) || isStatBreak}
                              className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 font-bold flex items-center justify-center text-sm cursor-pointer transition"
                              title="Refund 1 Point"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSpendOutfieldPoint(st.key, 1)}
                              disabled={availableStatPoints < 1 || isStatBreak || baseVal >= 100}
                              className={`w-8 h-8 rounded-lg font-black flex items-center justify-center text-base shadow-md transition-all cursor-pointer ${
                                isStatBreak || baseVal >= 100
                                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40'
                                  : baseVal === 99
                                  ? availableStatPoints > 0
                                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 border border-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse hover:scale-105 active:scale-95'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40'
                                  : availableStatPoints > 0
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-300/40 hover:scale-105 active:scale-95'
                                  : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40'
                              }`}
                              title={
                                isStatBreak
                                  ? 'Stat Break Active'
                                  : baseVal === 99
                                  ? 'Invest 1 Point towards 100 Stat Break'
                                  : 'Spend 1 Point'
                              }
                            >
                              <Plus className="w-4 h-4 stroke-[3]" />
                            </button>
                            {availableStatPoints >= 5 && (
                              <button
                                onClick={() => handleSpendOutfieldPoint(st.key, 5)}
                                disabled={isStatBreak || baseVal >= 100}
                                className={`px-2 py-1 font-black text-[10px] rounded-lg shadow cursor-pointer transition ${
                                  baseVal === 99
                                    ? 'bg-amber-950 border border-amber-400 text-amber-300 hover:bg-amber-900'
                                    : 'bg-emerald-950 border border-emerald-500/50 hover:bg-emerald-900 text-emerald-300'
                                }`}
                                title={baseVal === 99 ? 'Invest 5 Points towards 100 Stat Break' : 'Spend 5 Points'}
                              >
                                +5
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 2: CAREER CURVE & PRESEASON TRAINING */}
      {subTab === 'training' && (
        <div className="space-y-4">
          <DevelopmentStagePanel player={player} />

          <div className="bg-[#1a1c28] border border-gray-800 rounded-xl p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    Career Curve & Growth Phase
                  </h2>
                  <p className="text-[10px] text-gray-400">
                    {isGk ? 'Goalkeeper' : 'Outfield Player'} Aging Curve & Physical Maintenance
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                  phaseInfo.phase === 'Youth Growth'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : phaseInfo.phase === 'Physical Peak'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : phaseInfo.phase === 'Post-Peak Adaptation'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {phaseInfo.phase}
              </span>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-[#12131c] border border-gray-800 p-2.5 rounded-lg space-y-0.5">
                <span className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" /> Current Age
                </span>
                <span className="text-base font-black text-white">{player.age || 20} Yrs</span>
              </div>

              <div className="bg-[#12131c] border border-gray-800 p-2.5 rounded-lg space-y-0.5">
                <span className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> Current Overall
                </span>
                <span className="text-base font-black text-amber-400">{currentOvr} OVR</span>
              </div>

              <div className="bg-[#12131c] border border-gray-800 p-2.5 rounded-lg space-y-0.5">
                <span className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Potential Cap
                </span>
                <span className="text-base font-black text-purple-300">{potentialOvr} POT</span>
              </div>

              <div className="bg-[#12131c] border border-gray-800 p-2.5 rounded-lg space-y-0.5">
                <span className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-rose-400" /> Peak Age Limit
                </span>
                <span className="text-base font-black text-rose-300">Age {peakAge}</span>
              </div>
            </div>

            {/* PHASE DESCRIPTION BOX */}
            <div className="bg-[#12131c] border border-purple-500/20 p-3 rounded-lg text-xs text-purple-200/90 leading-relaxed">
              <p className="font-semibold">{phaseInfo.description}</p>
            </div>
          </div>

          {/* PRESEASON TRAINING SELECTION */}
          <div className="bg-[#1a1c28] border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-amber-400" /> {t('PRESEASON_TRAINING_FOCUS') || 'Preseason Training Focus'}
              </h3>
              <button
                onClick={handleSimulateSeason}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('ADVANCE_PRESEASON') || 'Advance Preseason'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {TRAINING_CATEGORIES.map((cat) => {
                const isSelected = selectedFocus === cat.id;
                const locName = translateTrainingGroupName(cat.id, currentLanguage) || cat.name;
                const locDesc = translateTrainingGroupDesc(cat.id, currentLanguage) || cat.description;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedFocus(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white ring-1 ring-purple-500'
                        : 'bg-[#12131c] border-gray-800/80 hover:border-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs mb-1">
                      <span>{locName}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-snug">{locDesc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: STAMINA & MEDICAL DEPT */}
      {subTab === 'stamina' && (
        <StaminaInjuryPanel
          player={player}
          onUpdatePlayer={onUpdatePlayer}
          showToast={showToast}
          triggerConfetti={triggerConfetti}
        />
      )}

      {/* SUB TAB 4: POSITION DEVELOPMENT & MASTERY */}
      {subTab === 'positions' && (
        <PositionMasteryDevelopmentPanel
          player={player}
          onUpdatePlayer={onUpdatePlayer}
          showToast={showToast}
          triggerConfetti={triggerConfetti}
        />
      )}
    </>
  ) : (
    /* ========================================================================= */
    /* CLUB DEVELOPMENT INTERFACE (REQUIREMENT 7) */
    /* ========================================================================= */
    <div id="club-development-section" className="space-y-4 font-pixel select-none">
      {/* 1. CLUB TIER & PHILOSOPHY HERO CARD */}
      <div className="bg-slate-900 border-2 border-emerald-500/70 p-4 sm:p-5 pixel-corners pixel-bevel-emerald space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 pixel-corners bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 pixel-corners bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {clubDevInfo.isYouthAcademy ? 'YOUTH ACADEMY DEVELOPMENT' : 'PROFESSIONAL CLUB DEVELOPMENT'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {clubDevInfo.isYouthAcademy
                    ? 'YOUTH ACADEMY TIER'
                    : `PRO TIER ${clubDevInfo.tier} / 5 • ${clubDevInfo.name}`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
                {player.club || (clubDevInfo.isYouthAcademy ? 'Youth Academy' : 'Free Agent')}
              </h2>
              <p className="text-xs text-slate-300 font-retro">
                {footballSchool?.name || 'Balanced Football Foundation'} • Tactical Philosophy & Club Infrastructure
              </p>
            </div>
          </div>

          {/* AVAILABLE CLUB DEVELOPMENT POINTS BADGE */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto p-2.5 sm:p-0 bg-slate-950 sm:bg-transparent border sm:border-0 border-slate-800 pixel-corners">
            <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
              AVAILABLE CLUB POINTS
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pixel-blink" />
              <span className={`text-xl sm:text-2xl font-black font-arcade ${availableClubPoints > 0 ? 'text-amber-300' : 'text-slate-500'}`}>
                {availableClubPoints} PTS
              </span>
            </div>
            <div className="text-[9px] text-emerald-400 font-bold">
              +{clubDevInfo.annualPoints} PTS / SEASON
            </div>
          </div>
        </div>

        {/* CLUB DETAILS OVERVIEW GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
            <div className="text-[9px] text-slate-400 uppercase font-black">DEVELOPMENT TIER</div>
            <div className="text-sm font-black text-amber-300 mt-0.5">
              {clubDevInfo.name} (Tier {clubDevInfo.tier}/5)
            </div>
            <div className="text-[10px] text-slate-400 font-retro mt-1">
              Annual growth: +{clubDevInfo.annualPoints} pts/year
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
            <div className="text-[9px] text-slate-400 uppercase font-black">TACTICAL PHILOSOPHY</div>
            <div className="text-sm font-black text-emerald-300 mt-0.5">
              {footballSchool?.name || 'Technical & Positional'}
            </div>
            <div className="text-[10px] text-slate-400 font-retro mt-1">
              Aligned with club identity & DNA
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-corners">
            <div className="text-[9px] text-slate-400 uppercase font-black">SQUAD & LEAGUE CONTEXT</div>
            <div className="text-sm font-black text-sky-300 mt-0.5">
              {isPro ? (player.squadDestination || 'First Team') : 'Youth League U-16'}
            </div>
            <div className="text-[10px] text-slate-400 font-retro mt-1">
              {player.league || 'Domestic Competition'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPENDING ACTIONS: 3 PRIMARY MODULES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MODULE 1: POSITIONAL FOUNDATION TRAINING */}
        <div className="bg-slate-900 border-2 border-slate-700 hover:border-emerald-500/70 p-4 pixel-corners pixel-bevel-raised space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  FOUNDATION TRAINING
                </h3>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 pixel-corners bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                RECOMMENDED
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-retro leading-relaxed">
              Distribute club development points automatically across core tactical attributes based on club philosophy and your {player.position} position.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={availableClubPoints < 10}
              onClick={() => handleSpendClubFoundation(10)}
              className={`w-full py-2.5 px-3 pixel-corners text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 transition-all cursor-pointer ${
                availableClubPoints >= 10
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300 pixel-bevel-emerald active:translate-y-0.5 shadow-md'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>INVEST 10 CLUB PTS</span>
            </button>

            <button
              type="button"
              disabled={availableClubPoints < 5}
              onClick={() => handleSpendClubFoundation(5)}
              className={`w-full py-2 px-3 pixel-corners text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                availableClubPoints >= 5
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-emerald-500/60 pixel-bevel-raised active:translate-y-0.5'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <span>QUICK DRILL (5 PTS)</span>
            </button>
          </div>
        </div>

        {/* MODULE 2: TACTICAL IMMERSION DRILLS */}
        <div className="bg-slate-900 border-2 border-slate-700 hover:border-amber-500/70 p-4 pixel-corners pixel-bevel-raised space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  TACTICAL FOCUS DRILLS
                </h3>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 pixel-corners bg-amber-950 text-amber-300 border border-amber-500/50">
                5 PTS EACH
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-retro leading-relaxed">
              Target individual tactical competencies with dedicated 1-on-1 club coaching sessions.
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={availableClubPoints < 5}
              onClick={() => handleSpendTacticalDrill('Vision & Passing', 'shortPass', 1, 5)}
              className={`w-full py-1.5 px-2.5 pixel-corners text-[10px] font-black uppercase flex items-center justify-between border transition-all ${
                availableClubPoints >= 5
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer active:translate-y-0.5'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <span>PASSING & VISION</span>
              <span className="text-amber-400 font-arcade">+1 (5 PTS)</span>
            </button>

            <button
              type="button"
              disabled={availableClubPoints < 5}
              onClick={() => handleSpendTacticalDrill('Pressing & Interception', 'interceptions', 1, 5)}
              className={`w-full py-1.5 px-2.5 pixel-corners text-[10px] font-black uppercase flex items-center justify-between border transition-all ${
                availableClubPoints >= 5
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer active:translate-y-0.5'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <span>HIGH PRESS & INTERCEPT</span>
              <span className="text-amber-400 font-arcade">+1 (5 PTS)</span>
            </button>

            <button
              type="button"
              disabled={availableClubPoints < 5}
              onClick={() => handleSpendTacticalDrill('Transition & Finishing', 'shooting', 1, 5)}
              className={`w-full py-1.5 px-2.5 pixel-corners text-[10px] font-black uppercase flex items-center justify-between border transition-all ${
                availableClubPoints >= 5
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer active:translate-y-0.5'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <span>FINISHING & TRANSITION</span>
              <span className="text-amber-400 font-arcade">+1 (5 PTS)</span>
            </button>
          </div>
        </div>

        {/* MODULE 3: CLUB INFRASTRUCTURE & FACILITIES */}
        <div className="bg-slate-900 border-2 border-slate-700 hover:border-sky-500/70 p-4 pixel-corners pixel-bevel-raised space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  CLUB FACILITIES
                </h3>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 pixel-corners bg-sky-950 text-sky-300 border border-sky-500/50">
                10 PTS EACH
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-retro leading-relaxed">
              Unlock club medical suite recovery, video analysis theater, or athletic conditioning gym.
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              disabled={availableClubPoints < 10}
              onClick={() => handleSpendFacility('Medical Suite', 'medical', 10)}
              className={`w-full py-1.5 px-2.5 pixel-corners text-[10px] font-black uppercase flex items-center justify-between border transition-all ${
                availableClubPoints >= 10
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer active:translate-y-0.5'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <span>MEDICAL SUITE (+20% FIT)</span>
              <span className="text-sky-400 font-arcade">10 PTS</span>
            </button>

            <button
              type="button"
              disabled={availableClubPoints < 10}
              onClick={() => handleSpendFacility('Video Analysis', 'video_lab', 10)}
              className={`w-full py-1.5 px-2.5 pixel-corners text-[10px] font-black uppercase flex items-center justify-between border transition-all ${
                availableClubPoints >= 10
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer active:translate-y-0.5'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <span>VIDEO TACTICS (+2 VIS)</span>
              <span className="text-sky-400 font-arcade">10 PTS</span>
            </button>

            <button
              type="button"
              disabled={availableClubPoints < 10}
              onClick={() => handleSpendFacility('Athletic Gym', 'performance_gym', 10)}
              className={`w-full py-1.5 px-2.5 pixel-corners text-[10px] font-black uppercase flex items-center justify-between border transition-all ${
                availableClubPoints >= 10
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 cursor-pointer active:translate-y-0.5'
                  : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
              }`}
            >
              <span>ATHLETIC GYM (+2 STA)</span>
              <span className="text-sky-400 font-arcade">10 PTS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. RECENT CLUB TRAINING LOGS */}
      {clubTrainingLogs.length > 0 && (
        <div className="bg-slate-950 border border-emerald-500/50 p-3 pixel-corners space-y-1.5">
          <div className="text-[10px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>RECENT CLUB TRAINING INVESTMENTS:</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-300 font-retro">
            {clubTrainingLogs.slice(0, 4).map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-emerald-400">•</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TIER BENCHMARK & RULES NOTE */}
      <div className="bg-slate-950/80 border border-slate-800 p-3.5 pixel-corners flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-black text-slate-200 uppercase">
            Club Development Tier Mechanics
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-retro">
            {clubDevInfo.description}
          </p>
          {Boolean((clubDevInfo as any).tier && CLUB_DEVELOPMENT_TIERS[(clubDevInfo as any).tier as keyof typeof CLUB_DEVELOPMENT_TIERS]?.examples) && (
            <div className="text-[10px] text-slate-400 font-retro">
              <strong className="text-slate-300">Tier Benchmark Clubs:</strong>{' '}
              {CLUB_DEVELOPMENT_TIERS[(clubDevInfo as any).tier as keyof typeof CLUB_DEVELOPMENT_TIERS].examples.slice(0, 6).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  )}

      {/* ========================================================================= */}
      {/* TRANSACTIONAL AUTO-ASSIGN PREVIEW & CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {autoAssignPreviewData && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancelAutoAssign();
            }
          }}
        >
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black shrink-0">
                  <Zap className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    <span>{t('TRANSACTION_PREVIEW') || 'TRANSACTION PREVIEW'}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {t('AUTO_ASSIGN_PREVIEW_TITLE') || 'Auto-Assign Stat Points Preview'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelAutoAssign}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Cancel and preserve points"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* OVR & Points Summary Banner */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t('POINTS_TO_SPEND') || 'Points To Spend'}</div>
                  <div className="text-base font-black text-amber-400 mt-0.5">
                    {autoAssignPreviewData.preview.pointsSpent} <span className="text-xs text-slate-400 font-normal">pts</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t('OVR_IMPACT') || 'OVR Impact'}</div>
                  <div className="text-base font-black text-emerald-400 mt-0.5">
                    {autoAssignPreviewData.preview.currentOvr} → {autoAssignPreviewData.preview.projectedOvr}
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{t('REMAINING') || 'Remaining'}</div>
                  <div className="text-base font-black text-sky-300 mt-0.5">
                    {(autoAssignPreviewData.preview.updatedPlayer.freeStatPoints ?? autoAssignPreviewData.preview.updatedPlayer.unassignedPoints ?? 0)}
                  </div>
                </div>
              </div>

              {/* Proposed Attribute Upgrades Grid */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>{t('PROPOSED_UPGRADES') || 'Proposed Attribute Upgrades'} ({autoAssignPreviewData.diffs.length})</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {t('OPTIMIZED_FOR') || 'Optimized for'} {player.subPosition || player.position || 'ST'} {player.playStyle ? `(${player.playStyle})` : ''}
                  </span>
                </div>

                {/* Allocation Rule Tags */}
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400 font-semibold mb-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    ⚡ {t('MAX_OVR_GROWTH') || 'Max OVR Impact'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    🛡️ {t('MAX_15_PER_STAT') || 'Max 15 Pts/Stat'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    ⚖️ {t('LESS_THAN_50_PERCENT') || '<50% Per Stat Limit'}
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {autoAssignPreviewData.diffs.map((d) => (
                    <div
                      key={d.key}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-400/30 transition-all"
                    >
                      <div>
                        <div className="text-xs font-black text-white">{translateAttributeName(d.key, currentLanguage) || d.label}</div>
                        <div className="text-[10px] text-slate-400">{d.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">{d.before}</span>
                        <span className="text-xs text-slate-600 font-bold">→</span>
                        <span className="text-xs text-emerald-300 font-black">{d.after}</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                          +{d.diff}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Notice */}
              <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-300 leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>{t('SAFE_PREVIEW_NOTICE_TITLE') || 'Safe Preview Transaction'}:</strong> {t('SAFE_PREVIEW_NOTICE_DESC') || `Your stat points are NOT consumed until you click Confirm & Apply. Clicking Cancel restores all ${availableStatPoints} points untouched.`}
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="bg-slate-950 border-t border-slate-800 p-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelAutoAssign}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-black py-3 rounded-xl text-xs transition-all border border-slate-700 cursor-pointer uppercase tracking-wider"
              >
                {t('CANCEL_RESTORE_POINTS') || 'CANCEL (RESTORE POINTS)'}
              </button>

              <button
                type="button"
                onClick={handleConfirmAutoAssign}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>{t('CONFIRM_APPLY') || 'CONFIRM & APPLY'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL STAT POINTS ASSIGNED CONFIRMATION POPUP */}
      {showAllAssignedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {t('ALL_STAT_POINTS_ASSIGNED') || 'ALL STAT POINTS ASSIGNED'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 font-semibold leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                {t('ALL_STAT_POINTS_ASSIGNED_DESC') || 'You have assigned all available stat points. Your player development has been saved.'}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAllAssignedModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-black py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer uppercase tracking-wider"
              >
                {t('CONTINUE_EDITING') || 'CONTINUE EDITING'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAllAssignedModal(false);
                  if (onReturnToYouthAcademy) {
                    onReturnToYouthAcademy();
                  }
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer uppercase tracking-wider"
              >
                {t('DONE') || 'DONE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEVELOPMENT PROGRESSION TUTORIAL MODAL */}
      <DevelopmentTutorialModal
        isOpen={showDevTutorial}
        onClose={handleCloseDevTutorial}
      />
      </div>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM ACTION BAR (ONE-THUMB THUMB REACHABILITY) */}
      {/* ========================================================================= */}
      <div className="sm:hidden sticky bottom-0 z-40 bg-slate-950/95 backdrop-blur-md border-t-2 border-slate-800 p-2.5 flex items-center justify-between gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.8)] shrink-0 safe-bottom">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`px-2.5 py-1 pixel-corners text-[11px] font-pixel font-black border flex items-center gap-1 shrink-0 ${
              availableStatPoints > 0
                ? 'bg-rose-600 text-white border-rose-400 animate-pixel-blink shadow'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            {availableStatPoints > 0 ? `! ${availableStatPoints} PTS` : '0 PTS'}
          </div>
          <span className="text-[10px] text-slate-400 font-pixel truncate">
            {player.subPosition || player.position} ({currentOvr} OVR)
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {availableStatPoints > 0 && subTab === 'attributes' && (
            <button
              type="button"
              onClick={handleOpenAutoAssignPreview}
              className="px-2.5 py-1.5 bg-amber-400 text-slate-950 font-arcade font-black text-xs uppercase pixel-corners pixel-bevel-gold flex items-center gap-1 shadow cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>AUTO</span>
            </button>
          )}

          {onReturnToYouthAcademy ? (
            <button
              type="button"
              onClick={() => {
                if (availableStatPoints === 0) {
                  setShowAllAssignedModal(true);
                } else {
                  onReturnToYouthAcademy();
                }
              }}
              className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-arcade font-black text-xs uppercase pixel-corners pixel-bevel-emerald flex items-center gap-1 shadow cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isProfessionalPlayer(player) ? (t('RETURN_TO_CAREER_HUB') || 'HUB') : (t('DONE') || 'DONE')}</span>
            </button>
          ) : onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 text-slate-200 font-arcade font-black text-xs uppercase pixel-corners border border-slate-700 flex items-center gap-1 shadow cursor-pointer active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('CLOSE') || 'CLOSE'}</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
