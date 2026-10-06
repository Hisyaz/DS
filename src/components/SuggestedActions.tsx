import React, { useState } from 'react';
import { PlayerCardData, AccountingState, StoreUpgradeItem } from '../types';
import { getFitnessPercentage } from '../utils/staminaInjurySystem';
import { canUseTrainButton } from '../utils/developmentSystem';
import { BUSINESS_TEMPLATES, BusinessTemplate, calculateSeasonFinancials } from '../data/businesses';
import { useLanguage } from '../context/LanguageContext';
import {
  PurchaseTarget,
  getAvailableFunds,
  executeDirectPurchase,
} from '../utils/directPurchaseSystem';
import { ParentAdviceEffect } from '../types/parentCards';
const ParentAdviceModal = React.lazy(() => import('./ParentAdviceModal').then(m => ({ default: m.ParentAdviceModal })));
import { getActiveChemistryCap } from '../utils/chemistrySystem';
import { calculateWeightedOvr, getOrCreateOutfieldDetailed, getOrCreateGkDetailed, syncCategoryStatsFromDetailed, syncCategoryStatsFromGkDetailed } from '../utils/statCalculations';
import type { GeneticOutcomeDetail } from './GeneticActivationModal';
const GeneticActivationModal = React.lazy(() => import('./GeneticActivationModal').then(m => ({ default: m.GeneticActivationModal })));
import { StoreItemIcon } from './StoreItemIcon';
import { STORE_TIER_NAMES, STORE_CATEGORY_THEMES } from '../data/storeItems';
import {
  Zap,
  Dumbbell,
  ShoppingBag,
  Building2,
  Sparkles,
  TrendingUp,
  Heart,
  ArrowRight,
  Shield,
  CheckCircle2,
  X,
  Coins,
  Scissors,
  Check,
  AlertCircle,
  Globe,
} from 'lucide-react';

export interface SuggestedActionCallbacks {
  onRecoverFitness?: () => void;
  onUseRecoverySupplement?: () => void;
  onBuyRecoverySupplement?: () => void;
  onRestRehab?: () => void;
  onAssignStatPoints?: () => void;
  onTrain?: () => void;
  onBuyProEquipment?: () => void;
  onBuySeasonBoost?: () => void;
  onBuyProperty?: () => void;
  onUpgradeProperty?: () => void;
  onImproveChemistry?: () => void;
  onOpenParentAdvice?: () => void;
}

export interface SuggestedActionsProps {
  player: PlayerCardData;
  accounting?: AccountingState;
  storeItems?: StoreUpgradeItem[];
  callbacks?: SuggestedActionCallbacks;
  onUpdatePlayer?: (player: PlayerCardData) => void;
  onUpdateAccounting?: (accounting: AccountingState) => void;
  onUpdateStoreItems?: (items: StoreUpgradeItem[]) => void;
  onOpenParentAdvice?: () => void;
  showToast?: (message: string) => void;
  className?: string;
  maxActions?: number;
  importantDraw?: {
    competitionName: string;
    shortName?: string;
    explanation?: string;
    onOpenDraw: () => void;
  } | null;
}

interface ActionCandidate {
  id: string;
  title: string;
  categoryTag?: string;
  tierBadge?: { name: string; badgeClass: string };
  explanation: string;
  benefitText?: string;
  priceText?: string;
  cost?: number;
  buttonText: string;
  priority: number; // Lower number = higher priority
  icon: React.ReactNode;
  badgeColor: string;
  buttonStyle: string;
  purchaseTarget?: PurchaseTarget;
  action?: () => void;
}

export const SuggestedActions: React.FC<SuggestedActionsProps> = ({
  player,
  accounting,
  storeItems = [],
  callbacks = {} as SuggestedActionCallbacks,
  onUpdatePlayer,
  onUpdateAccounting,
  onUpdateStoreItems,
  onOpenParentAdvice,
  showToast,
  className = '',
  maxActions = 2,
  importantDraw,
}) => {
  const { t } = useLanguage();
  const [selectedPurchaseTarget, setSelectedPurchaseTarget] = useState<PurchaseTarget | null>(null);
  const [showAdviceModal, setShowAdviceModal] = useState<boolean>(false);
  const [isGeneticActivationModalOpen, setIsGeneticActivationModalOpen] = useState<boolean>(false);

  // Genetic Activation Procedure Outcome Handler
  const handleApplyGeneticOutcome = (
    updatedPlayer: PlayerCardData,
    updatedAccounting: AccountingState,
    outcome: GeneticOutcomeDetail
  ) => {
    (updatedPlayer as any).geneticActivationCompleted = true;
    if (onUpdatePlayer) {
      onUpdatePlayer(updatedPlayer);
    }
    if (onUpdateAccounting) {
      onUpdateAccounting(updatedAccounting);
    }
    if (onUpdateStoreItems && storeItems) {
      onUpdateStoreItems(
        storeItems.map((i) => (i.id === 'upg_genetic_activation' ? { ...i, unlocked: true } : i))
      );
    }

    if (outcome.tier === 'critical_failure') {
      if (showToast) showToast('💥 CRITICAL FAILURE: Severe cellular rejection! -10 on all stats, -5 Potential.');
    } else if (outcome.tier === 'failure') {
      if (showToast) showToast('⚠️ PROCEDURE INERT: No physiological alteration occurred.');
    } else {
      if (showToast) showToast(`🧬 ${outcome.label.toUpperCase()}! +${outcome.potentialChange} Potential & +${outcome.statPointsBonus} Stat Points.`);
    }
  };

  const fitnessPct = getFitnessPercentage(player);
  const recoveryPoints = player.recoveryPoints || 0;
  const recoverySupplements = player.recoverySupplements || 0;
  const unassignedPoints = (player.unassignedPoints || 0) + (player.freeStatPoints || 0);

  const availableCash = getAvailableFunds(accounting);

  const hasAdvicePerk =
    player.equippedParentCard?.typeId === 'working_class' ||
    player.equippedParentCard?.typeId === 'wealthy_family' ||
    player.equippedParentCard?.typeId === 'average_family' ||
    player.equippedParentCard?.typeId === 'iconic_parent';

  const isIconicParent = player.equippedParentCard?.typeId === 'iconic_parent';

  const candidates: ActionCandidate[] = [];

  // Helper to open purchase confirmation
  const handleInitiatePurchase = (target: PurchaseTarget) => {
    setSelectedPurchaseTarget(target);
  };

  // Helper to confirm purchase execution
  const handleConfirmPurchase = () => {
    if (!selectedPurchaseTarget) return;
    const target = selectedPurchaseTarget;

    const result = executeDirectPurchase(target, player, accounting, storeItems);
    if (result.success) {
      if (onUpdatePlayer) onUpdatePlayer(result.updatedPlayer);
      if (onUpdateAccounting) onUpdateAccounting(result.updatedAccounting);
      if (onUpdateStoreItems) onUpdateStoreItems(result.updatedStoreItems);
      if (showToast) showToast(result.message);
    } else {
      if (showToast) showToast(result.message);
    }

    setSelectedPurchaseTarget(null);
  };

  // Parent Advice Handler
  const handleApplyAdvice = (effect: ParentAdviceEffect) => {
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
    if (showToast) {
      showToast(`❤️ Received Parents' Advice: ${effect.title}!`);
    }
  };

  // =========================================================================
  // VITAL & CONTEXTUAL ACTIONS (Priority 0 - 4)
  // =========================================================================

  // 0. IMPORTANT COMPETITION DRAW (e.g. World Trophy Draw)
  if (importantDraw) {
    candidates.push({
      id: 'important_draw',
      title: `${(importantDraw.shortName || importantDraw.competitionName).toUpperCase()} DRAW`,
      categoryTag: 'Major Draw',
      explanation:
        importantDraw.explanation ||
        `Official ${importantDraw.competitionName} tournament draw is open! Reveal your group fixtures and opponents.`,
      benefitText: 'Tournament Group Stage Scheduling',
      buttonText: 'ENTER DRAW',
      priority: 0,
      icon: <Globe className="w-4 h-4 text-amber-400 shrink-0" />,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      buttonStyle:
        'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-amber-950/40',
      action: importantDraw.onOpenDraw,
    });
  }

  // 1. FITNESS & INJURY RECOVERY
  if (fitnessPct < 85 || (fitnessPct < 100 && (recoveryPoints > 0 || recoverySupplements > 0)) || player.isInjured) {
    if (recoveryPoints > 0) {
      candidates.push({
        id: 'recover_fitness',
        title: 'RECOVER FITNESS',
        categoryTag: 'Medical Rehab',
        explanation: `Condition at ${fitnessPct}%. Use 1 Recovery Point (+20% Fitness / -1 Wk Injury).`,
        benefitText: '+20% Fitness or -1 Week Rehab',
        buttonText: `USE 1 POINT (${recoveryPoints} LEFT)`,
        priority: 1,
        icon: <Heart className="w-4 h-4 text-rose-400 shrink-0" />,
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        buttonStyle: 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-950/40',
        action: callbacks.onRecoverFitness,
      });
    }

    if (recoverySupplements > 0 && fitnessPct < 100) {
      candidates.push({
        id: 'use_supplement',
        title: 'USE RECOVERY SUPPLEMENT',
        categoryTag: 'Nutrition & Energy',
        explanation: `Instantly restore physical condition to 100% (${recoverySupplements} available).`,
        benefitText: 'Instant 100% Fitness Condition',
        buttonText: `USE SUPPLEMENT (${recoverySupplements})`,
        priority: 1,
        icon: <Zap className="w-4 h-4 text-emerald-400 shrink-0" />,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        buttonStyle: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40',
        action: callbacks.onUseRecoverySupplement,
      });
    }

    if (recoveryPoints <= 0 && recoverySupplements <= 0 && fitnessPct < 75) {
      candidates.push({
        id: 'rest_rehab',
        title: 'REST / REHAB',
        categoryTag: 'Conditioning',
        explanation: 'Recover naturally before your next match (+30% Fitness).',
        benefitText: '+30% Natural Fitness Restoration',
        buttonText: 'REST / REHAB (+30%)',
        priority: 1,
        icon: <Zap className="w-4 h-4 text-amber-400 shrink-0" />,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        buttonStyle: 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-950/40',
        action: callbacks.onRestRehab,
      });
    }
  }

  // 2. UNASSIGNED ATTRIBUTE POINTS
  if (unassignedPoints > 0) {
    candidates.push({
      id: 'assign_stat_points',
      title: 'ASSIGN STAT POINTS',
      categoryTag: 'Development',
      explanation: `Upgrade your key attributes before matchday (${unassignedPoints} point${unassignedPoints > 1 ? 's' : ''} available).`,
      benefitText: `+${unassignedPoints} Attribute Point${unassignedPoints > 1 ? 's' : ''}`,
      buttonText: 'ASSIGN STAT POINTS',
      priority: 2,
      icon: <Dumbbell className="w-4 h-4 text-blue-400 shrink-0" />,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-950/40',
      action: callbacks.onAssignStatPoints,
    });
  }

  // 3. TRAINING OPPORTUNITY
  const trainInfo = canUseTrainButton(player);
  if (trainInfo.canTrain) {
    candidates.push({
      id: 'train',
      title: 'TRAIN PROGRESS',
      categoryTag: 'Training',
      explanation: 'Use your available training session to gain skill progress.',
      benefitText: '+10% Training Progress towards Stat Points',
      buttonText: 'START TRAINING',
      priority: 3,
      icon: <Dumbbell className="w-4 h-4 text-purple-400 shrink-0" />,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/40',
      action: callbacks.onTrain,
    });
  }

  // 4. PARENTS' ADVICE (High priority when available)
  if (hasAdvicePerk && !player.parentAdviceUsedThisSeason) {
    candidates.push({
      id: 'parents_advice',
      title: "PARENTS' ADVICE",
      categoryTag: 'Family Guidance',
      explanation: 'Your parents are ready to give advice. Receive a major seasonal boost (Composure, Chemistry, Reputation, or Recovery)!',
      benefitText: isIconicParent
        ? 'Choose 1 Powerful Advice Boost (+10 Composure, +10 Chemistry, etc.)'
        : 'Random Advice Boost (+10 Composure, +10 Chemistry, or +10 Recovery)',
      buttonText: 'SEEK PARENTS’ ADVICE',
      priority: 4,
      icon: <Heart className="w-4 h-4 text-rose-400 shrink-0" />,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      buttonStyle: 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-950/40',
      action: () => {
        if (onOpenParentAdvice) {
          onOpenParentAdvice();
        } else {
          setShowAdviceModal(true);
        }
      },
    });
  }

  // =========================================================================
  // DIRECT PURCHASES (STRICT PRIORITY ORDER & AFFORDABILITY FILTER)
  // 1. Store Upgrades (Facilities & Upgrades) -> Priority 10
  // 2. Businesses & Business Upgrades -> Priority 20 / 21
  // 3. Pro Equipment -> Priority 30
  // 4. Consumables -> Priority 40
  // 5. Seasonal Upgrades -> Priority 50
  // 6. Cosmetics -> Priority 60
  // =========================================================================

  // --- 1. STORE UPGRADES (FACILITIES & UPGRADES) ---
  // Check for Genetic Activation Upgrade
  const geneticActivationItem = storeItems.find((i) => i.id === 'upg_genetic_activation');
  const geneticCompleted = (player as any)?.geneticActivationCompleted || geneticActivationItem?.unlocked;
  if (!geneticCompleted && availableCash >= 100000000) {
    const tierInfo = STORE_TIER_NAMES[6];
    candidates.push({
      id: 'upgrade_genetic_activation',
      title: '🧬 EXPERIMENTAL GENETIC ACTIVATION',
      categoryTag: 'Upgrade',
      tierBadge: { name: tierInfo.name, badgeClass: tierInfo.color },
      explanation: 'Undergo irreversible experimental biological therapy. 5% critical cell breakdown risk, or massive potential & stat surges.',
      benefitText: '+1 to +10 Potential & +10 to +50 Stat Points (Odds-Based)',
      priceText: '€100,000,000',
      cost: 100000000,
      buttonText: '🧬 UNDERGO SURGERY',
      priority: 15,
      icon: <StoreItemIcon item={geneticActivationItem || ({ id: 'upg_genetic_activation', category: 'upgrade', tier: 6 } as any)} size="sm" />,
      badgeColor: STORE_CATEGORY_THEMES.upgrade.badge,
      buttonStyle: 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black shadow-lg shadow-purple-900/50 ring-1 ring-purple-400/50 animate-pulse',
      action: () => setIsGeneticActivationModalOpen(true),
    });
  }

  const affordableStoreUpgrades = storeItems
    .filter((item) => {
      if (item.category !== 'upgrade') return false;
      if (item.id === 'upg_genetic_activation') return false; // Handled specifically above
      if (item.unlocked) return false;
      const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
      return availableCash >= cost;
    })
    .sort((a, b) => (b.tier || 1) - (a.tier || 1)); // Best tier first

  affordableStoreUpgrades.forEach((item) => {
    const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
    const benefit = item.effectSummary || item.effect || 'Permanent Preseason development upgrade';
    const tierInfo = STORE_TIER_NAMES[item.tier || 1] || STORE_TIER_NAMES[1];
    const categoryTheme = STORE_CATEGORY_THEMES.upgrade;
    const target: PurchaseTarget = {
      type: 'store_upgrade',
      id: item.id,
      name: item.name,
      categoryLabel: 'Facility Upgrade',
      cost,
      benefit,
      detailedDescription: item.description,
      iconType: 'upgrade',
      rawItem: item,
    };

    candidates.push({
      id: `upgrade_${item.id}`,
      title: `BUY ${item.name.toUpperCase()}`,
      categoryTag: 'Upgrade',
      tierBadge: { name: tierInfo.name, badgeClass: tierInfo.color },
      explanation: `${item.description || 'Permanent facility upgrade'}. Gives: ${benefit}.`,
      benefitText: benefit,
      priceText: `€${cost.toLocaleString()}`,
      cost,
      buttonText: `BUY FOR €${cost.toLocaleString()}`,
      priority: 10,
      icon: <StoreItemIcon item={item} size="sm" />,
      badgeColor: categoryTheme.badge,
      buttonStyle: `${categoryTheme.buttonGradient} font-black text-white`,
      purchaseTarget: target,
      action: () => handleInitiatePurchase(target),
    });
  });

  // --- 2. BUSINESSES & BUSINESS UPGRADES ---
  if (accounting) {
    const ownedIds = (accounting.businesses || []).map((b) => b.templateId);

    // Business Purchases (New Templates)
    const affordableNewBusinesses = BUSINESS_TEMPLATES
      .filter((tmpl) => {
        if (ownedIds.includes(tmpl.id)) return false;
        const cost = tmpl.tiers[1]?.cost || 0;
        return availableCash >= cost;
      })
      .sort((a, b) => (b.tiers[1]?.cost || 0) - (a.tiers[1]?.cost || 0));

    affordableNewBusinesses.forEach((tmpl) => {
      const cost = tmpl.tiers[1]?.cost || 100000;
      const financials = calculateSeasonFinancials(tmpl, 1);
      const benefit = `Generates +€${financials.netProfit.toLocaleString()}/yr passive profit`;
      const target: PurchaseTarget = {
        type: 'business',
        id: tmpl.id,
        name: tmpl.name,
        categoryLabel: tmpl.category || 'Business Investment',
        cost,
        benefit,
        detailedDescription: tmpl.description,
        iconType: 'business',
        rawItem: tmpl,
      };

      candidates.push({
        id: `buy_biz_${tmpl.id}`,
        title: `INVEST IN ${tmpl.name.toUpperCase()}`,
        categoryTag: 'Business Investment',
        explanation: `${tmpl.description}. Gives: ${benefit}.`,
        benefitText: benefit,
        priceText: `€${cost.toLocaleString()}`,
        cost,
        buttonText: `INVEST (€${cost.toLocaleString()})`,
        priority: 20,
        icon: <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />,
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        buttonStyle: 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-950/40',
        purchaseTarget: target,
        action: () => handleInitiatePurchase(target),
      });
    });

    // Business Upgrades (Owned Businesses)
    const affordableUpgrades = (accounting.businesses || [])
      .filter((b) => {
        if ((b.tier || 1) >= 5) return false;
        const tmpl = BUSINESS_TEMPLATES.find((t) => t.id === b.templateId) || BUSINESS_TEMPLATES.find((t) => t.name === b.name);
        if (!tmpl) return false;
        const nextTier = (b.tier || 1) + 1;
        const upgradeCost = tmpl.tiers[nextTier]?.cost || 999999999;
        return availableCash >= upgradeCost;
      });

    affordableUpgrades.forEach((biz) => {
      const tmpl = BUSINESS_TEMPLATES.find((t) => t.id === biz.templateId) || BUSINESS_TEMPLATES.find((t) => t.name === biz.name) || BUSINESS_TEMPLATES[0];
      const nextTier = (biz.tier || 1) + 1;
      const upgradeCost = tmpl.tiers[nextTier]?.cost || 0;
      const nextFinancials = calculateSeasonFinancials(tmpl, nextTier);
      const profitIncrease = nextFinancials.netProfit - (biz.netProfit || 0);
      const benefit = `Tier ${nextTier}: +€${nextFinancials.netProfit.toLocaleString()}/yr profit (+€${profitIncrease.toLocaleString()}/yr boost)`;
      const target: PurchaseTarget = {
        type: 'business_upgrade',
        id: biz.id,
        name: `Upgrade ${biz.name} (Tier ${nextTier})`,
        categoryLabel: 'Business Upgrade',
        cost: upgradeCost,
        benefit,
        detailedDescription: `Upgrade ${biz.name} to Tier ${nextTier} to increase annual revenue and cash flow.`,
        iconType: 'business_upgrade',
        rawItem: biz,
      };

      candidates.push({
        id: `upgrade_biz_${biz.id}`,
        title: `UPGRADE ${biz.name.toUpperCase()} (TIER ${nextTier})`,
        categoryTag: 'Business Upgrade',
        explanation: `Upgrade ${biz.name} to Tier ${nextTier}. Gives: ${benefit}.`,
        benefitText: benefit,
        priceText: `€${upgradeCost.toLocaleString()}`,
        cost: upgradeCost,
        buttonText: `UPGRADE (€${upgradeCost.toLocaleString()})`,
        priority: 21,
        icon: <TrendingUp className="w-4 h-4 text-sky-400 shrink-0" />,
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        buttonStyle: 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sky-950/40',
        purchaseTarget: target,
        action: () => handleInitiatePurchase(target),
      });
    });
  }

  // --- 3. PRO EQUIPMENT ---
  const affordableProEquipment = storeItems
    .filter((item) => {
      if (item.category !== 'equipment' && item.category !== 'pro_equipment') return false;
      if (item.unlocked) return false;
      if (item.availableStock !== undefined && item.availableStock <= 0) return false;
      const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
      return availableCash >= cost;
    })
    .sort((a, b) => (b.tier || 1) - (a.tier || 1));

  affordableProEquipment.forEach((item) => {
    const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
    const matches = item.matchDuration || item.durability?.current || 15;
    const benefit = `${item.effectSummary || item.effect || 'Match stat & injury performance gear'} (${matches} matches)`;
    const tierInfo = STORE_TIER_NAMES[item.tier || 1] || STORE_TIER_NAMES[1];
    const categoryTheme = STORE_CATEGORY_THEMES.pro_equipment;
    const target: PurchaseTarget = {
      type: 'pro_equipment',
      id: item.id,
      name: item.name,
      categoryLabel: 'Pro Equipment',
      cost,
      benefit,
      detailedDescription: item.description,
      iconType: 'equipment',
      rawItem: item,
    };

    candidates.push({
      id: `equip_${item.id}`,
      title: `BUY ${item.name.toUpperCase()}`,
      categoryTag: 'Pro Equipment',
      tierBadge: { name: tierInfo.name, badgeClass: tierInfo.color },
      explanation: `${item.description || 'Match performance gear'}. Gives: ${benefit}.`,
      benefitText: benefit,
      priceText: `€${cost.toLocaleString()}`,
      cost,
      buttonText: `BUY (€${cost.toLocaleString()})`,
      priority: 30,
      icon: <StoreItemIcon item={item} size="sm" />,
      badgeColor: categoryTheme.badge,
      buttonStyle: `${categoryTheme.buttonGradient} font-black text-white`,
      purchaseTarget: target,
      action: () => handleInitiatePurchase(target),
    });
  });

  // --- 4. CONSUMABLES ---
  const affordableConsumables = storeItems
    .filter((item) => {
      if (item.category !== 'consumables') return false;
      if (item.availableStock !== undefined && item.availableStock <= 0) return false;
      const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
      return availableCash >= cost;
    })
    .sort((a, b) => (b.tier || 1) - (a.tier || 1));

  affordableConsumables.forEach((item) => {
    const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
    const benefit = item.effectSummary || item.effect || 'Single-use athletic recovery/performance item';
    const tierInfo = STORE_TIER_NAMES[item.tier || 1] || STORE_TIER_NAMES[1];
    const categoryTheme = STORE_CATEGORY_THEMES.consumables;
    const target: PurchaseTarget = {
      type: 'consumable',
      id: item.id,
      name: item.name,
      categoryLabel: 'Consumable Item',
      cost,
      benefit,
      detailedDescription: item.description,
      iconType: 'consumable',
      rawItem: item,
    };

    candidates.push({
      id: `consumable_${item.id}`,
      title: `BUY ${item.name.toUpperCase()}`,
      categoryTag: 'Consumable',
      tierBadge: { name: tierInfo.name, badgeClass: tierInfo.color },
      explanation: `${item.description || 'Instant consumable'}. Gives: ${benefit}.`,
      benefitText: benefit,
      priceText: `€${cost.toLocaleString()}`,
      cost,
      buttonText: `BUY (€${cost.toLocaleString()})`,
      priority: 40,
      icon: <StoreItemIcon item={item} size="sm" />,
      badgeColor: categoryTheme.badge,
      buttonStyle: `${categoryTheme.buttonGradient} font-black text-white`,
      purchaseTarget: target,
      action: () => handleInitiatePurchase(target),
    });
  });

  // --- 5. SEASONAL UPGRADES (SEASON BOOSTS) ---
  const affordableSeasonBoosts = storeItems
    .filter((item) => {
      if (item.category !== 'season_boost') return false;
      if (item.unlocked) return false;
      const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
      return availableCash >= cost;
    })
    .sort((a, b) => (b.tier || 1) - (a.tier || 1));

  affordableSeasonBoosts.forEach((item) => {
    const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
    const benefit = item.effectSummary || item.effect || 'Temporary development boost for the current season';
    const tierInfo = STORE_TIER_NAMES[item.tier || 1] || STORE_TIER_NAMES[1];
    const categoryTheme = STORE_CATEGORY_THEMES.season_boost;
    const target: PurchaseTarget = {
      type: 'season_boost',
      id: item.id,
      name: item.name,
      categoryLabel: 'Season Boost',
      cost,
      benefit,
      detailedDescription: item.description,
      iconType: 'season_boost',
      rawItem: item,
    };

    candidates.push({
      id: `boost_${item.id}`,
      title: `BUY ${item.name.toUpperCase()}`,
      categoryTag: 'Season Boost',
      tierBadge: { name: tierInfo.name, badgeClass: tierInfo.color },
      explanation: `${item.description || 'Current season booster'}. Gives: ${benefit}.`,
      benefitText: benefit,
      priceText: `€${cost.toLocaleString()}`,
      cost,
      buttonText: `BUY (€${cost.toLocaleString()})`,
      priority: 50,
      icon: <StoreItemIcon item={item} size="sm" />,
      badgeColor: categoryTheme.badge,
      buttonStyle: `${categoryTheme.buttonGradient} font-black text-white`,
      purchaseTarget: target,
      action: () => handleInitiatePurchase(target),
    });
  });

  // --- 6. COSMETICS ---
  const affordableCosmetics = storeItems
    .filter((item) => {
      if (item.category !== 'special_hair' && item.category !== 'cosmetics') return false;
      if (item.unlocked) return false;
      const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
      return availableCash >= cost;
    })
    .sort((a, b) => (b.tier || 1) - (a.tier || 1));

  affordableCosmetics.forEach((item) => {
    const cost = item.costEuros || (item.tier === 2 ? 20000 : item.tier === 3 ? 75000 : item.tier === 4 ? 250000 : item.tier === 5 ? 1000000 : item.tier === 6 ? 100000000 : 5000);
    const benefit = item.effectSummary || item.effect || 'Unique iconic visual hairstyle & style perk';
    const tierInfo = STORE_TIER_NAMES[item.tier || 1] || STORE_TIER_NAMES[1];
    const categoryTheme = STORE_CATEGORY_THEMES.special_hair;
    const target: PurchaseTarget = {
      type: 'cosmetic',
      id: item.id,
      name: item.name,
      categoryLabel: 'Cosmetic',
      cost,
      benefit,
      detailedDescription: item.description,
      iconType: 'cosmetic',
      rawItem: item,
    };

    candidates.push({
      id: `cosmetic_${item.id}`,
      title: `BUY ${item.name.toUpperCase()}`,
      categoryTag: 'Cosmetic',
      tierBadge: { name: tierInfo.name, badgeClass: tierInfo.color },
      explanation: `${item.description || 'Special cosmetic haircut'}. Gives: ${benefit}.`,
      benefitText: benefit,
      priceText: `€${cost.toLocaleString()}`,
      cost,
      buttonText: `BUY (€${cost.toLocaleString()})`,
      priority: 60,
      icon: <StoreItemIcon item={item} size="sm" />,
      badgeColor: categoryTheme.badge,
      buttonStyle: `${categoryTheme.buttonGradient} font-black text-white`,
      purchaseTarget: target,
      action: () => handleInitiatePurchase(target),
    });
  });

  // Sort candidates by priority ascending
  candidates.sort((a, b) => a.priority - b.priority);

  // Take top recommendations (max 2)
  const selectedActions = candidates.slice(0, Math.min(2, maxActions));

  if (selectedActions.length === 0) {
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <div
        className={`bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl shadow-black/50 space-y-3 backdrop-blur-md transition-all ${className}`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              SUGGESTED ACTIONS & DIRECT PURCHASES
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              SAVINGS: €{availableCash.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 hidden sm:inline-block">
              {selectedActions.length} AVAILABLE
            </span>
          </div>
        </div>

        {/* SUGGESTIONS GRID */}
        <div
          className={`grid gap-3 ${
            selectedActions.length === 1
              ? 'grid-cols-1'
              : selectedActions.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {selectedActions.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-3.5 rounded-xl flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01] relative group shadow-md"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${item.badgeColor}`}
                    >
                      {item.icon}
                      <span>{item.categoryTag || item.title}</span>
                    </span>
                    {item.tierBadge && (
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${item.tierBadge.badgeClass}`}>
                        {item.tierBadge.name}
                      </span>
                    )}
                  </div>
                  {item.priceText && (
                    <span className="text-xs font-black font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                      {item.priceText}
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-black text-white leading-snug pt-0.5">
                  {item.title}
                </h4>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {item.explanation}
                </p>

                {item.benefitText && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-[11px] font-bold text-emerald-300 flex items-start gap-1.5 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Gives: {item.benefitText}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => item.action && item.action()}
                className={`w-full py-2.5 px-3 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${item.buttonStyle}`}
              >
                <span>{item.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= DIRECT PURCHASE CONFIRMATION MODAL ================= */}
      {selectedPurchaseTarget && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
          style={{ touchAction: 'pan-y' }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPurchaseTarget(null);
          }}
        >
          <div
            className="w-full max-w-md bg-slate-950 border-4 border-emerald-500 pixel-corners pixel-bevel-gold shadow-[0_0_50px_rgba(16,185,129,0.4)] p-5 sm:p-6 text-white my-auto flex flex-col text-left relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-3 shrink-0 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-pixel uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                {selectedPurchaseTarget.categoryLabel}
              </div>
              <h3 className="text-base sm:text-lg font-black font-arcade text-white uppercase tracking-wide pixel-text-shadow">
                Confirm: {selectedPurchaseTarget.name}
              </h3>
            </div>

            {/* Content Details */}
            <div className="py-4 space-y-3.5 text-xs font-retro">
              {/* Financial breakdown */}
              <div className="bg-slate-900 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-3.5 space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-retro">
                  <span>Available Funds:</span>
                  <span className="font-arcade font-black text-white text-xs">
                    €{availableCash.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-amber-300 border-t border-slate-800/80 pt-2 font-retro">
                  <span className="font-bold">Item Cost:</span>
                  <span className="font-arcade font-black text-amber-400 text-xs">
                    -€{selectedPurchaseTarget.cost.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-emerald-300 border-t border-slate-800/80 pt-2 font-retro">
                  <span className="font-bold">Remaining Balance:</span>
                  <span className="font-arcade font-black text-emerald-400 text-xs">
                    €{Math.max(0, availableCash - selectedPurchaseTarget.cost).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Benefit box */}
              <div className="bg-emerald-950/40 border border-emerald-500/60 pixel-corners p-3.5 space-y-1.5">
                <span className="text-[10px] font-arcade font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  CONFIRMED UPGRADE EFFECT:
                </span>
                <p className="text-xs sm:text-sm font-retro font-bold text-white leading-snug">
                  {selectedPurchaseTarget.benefit}
                </p>
                {selectedPurchaseTarget.detailedDescription && (
                  <p className="text-[11px] font-retro text-slate-300 pt-1 leading-relaxed">
                    {selectedPurchaseTarget.detailedDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t-2 border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedPurchaseTarget(null)}
                className="px-4 py-2.5 pixel-corners text-xs font-arcade uppercase text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="px-5 py-2.5 pixel-corners pixel-bevel-gold text-xs font-black font-arcade uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-1.5 transition-all cursor-pointer active:translate-y-0.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Confirm Purchase (€{selectedPurchaseTarget.cost.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PARENTS' ADVICE MODAL ================= */}
      {showAdviceModal && (
        <ParentAdviceModal
          isOpen={showAdviceModal}
          onClose={() => setShowAdviceModal(false)}
          isIconicUpgraded={isIconicParent}
          onApplyAdvice={handleApplyAdvice}
        />
      )}

      {/* ================= GENETIC ACTIVATION EXPERIMENTAL MODAL ================= */}
      <GeneticActivationModal
        isOpen={isGeneticActivationModalOpen}
        onClose={() => setIsGeneticActivationModalOpen(false)}
        player={player}
        accounting={accounting}
        onApplyOutcome={handleApplyGeneticOutcome}
        showToast={showToast || ((msg: string) => console.log(msg))}
      />
    </React.Suspense>
  );
};
