import { PlayerCardData, AccountingState, StoreUpgradeItem, BusinessItem } from '../types';
import { BUSINESS_TEMPLATES, BusinessTemplate, calculateSeasonFinancials, createBusinessInstance } from '../data/businesses';

export interface PurchaseTarget {
  type: 'store_upgrade' | 'business' | 'business_upgrade' | 'pro_equipment' | 'consumable' | 'season_boost' | 'cosmetic';
  id: string;
  name: string;
  categoryLabel: string;
  cost: number;
  benefit: string;
  detailedDescription?: string;
  iconType: 'upgrade' | 'business' | 'business_upgrade' | 'equipment' | 'consumable' | 'season_boost' | 'cosmetic' | 'advice';
  rawItem?: StoreUpgradeItem | BusinessTemplate | BusinessItem;
}

/**
 * Calculates current available cash / savings from AccountingState
 */
export function getAvailableFunds(accounting?: AccountingState): number {
  if (accounting && typeof accounting.totalSavings === 'number') {
    return Math.max(0, accounting.totalSavings);
  }
  return 0;
}

/**
 * Executes a direct purchase transaction atomically across player, accounting, and store state
 */
export function executeDirectPurchase(
  target: PurchaseTarget,
  player: PlayerCardData,
  accounting?: AccountingState,
  storeItems: StoreUpgradeItem[] = []
): {
  updatedPlayer: PlayerCardData;
  updatedAccounting: AccountingState;
  updatedStoreItems: StoreUpgradeItem[];
  success: boolean;
  message: string;
} {
  const currentCash = getAvailableFunds(accounting);
  const defaultAccounting: AccountingState = {
    contractYears: 0,
    yearlySalary: 0,
    sponsors: [],
    sanctions: [],
    businesses: [],
    totalSavings: currentCash,
  };

  if (currentCash < target.cost) {
    return {
      updatedPlayer: player,
      updatedAccounting: accounting || defaultAccounting,
      updatedStoreItems: storeItems,
      success: false,
      message: `❌ Not enough funds! Requires €${target.cost.toLocaleString()} (Available: €${currentCash.toLocaleString()}).`,
    };
  }

  let updatedPlayer: PlayerCardData = JSON.parse(JSON.stringify(player));
  let updatedAcc: AccountingState = accounting
    ? JSON.parse(JSON.stringify(accounting))
    : defaultAccounting;
  let updatedStore: StoreUpgradeItem[] = JSON.parse(JSON.stringify(storeItems));

  // Deduct cost
  const newSavings = Math.max(0, currentCash - target.cost);
  updatedAcc.totalSavings = newSavings;

  let message = `✅ Purchased ${target.name} for €${target.cost.toLocaleString()}!`;

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

  // 1. STORE UPGRADE (FACILITIES & UPGRADES)
  if (target.type === 'store_upgrade') {
    updatedStore = updatedStore.map((item) => (item.id === target.id ? { ...item, unlocked: true } : item));
    const existingFacilities = (updatedPlayer as any).unlockedFacilityIds || [];
    if (!existingFacilities.includes(target.id)) {
      (updatedPlayer as any).unlockedFacilityIds = [...existingFacilities, target.id];
    }

    if (target.id === 'upg_genetic_activation') {
      return {
        updatedPlayer: player,
        updatedAccounting: accounting || defaultAccounting,
        updatedStoreItems: storeItems,
        success: false,
        message: `⚠️ Genetic Potential Activation requires undergoing the experimental procedure directly in the Store or Action Hub!`,
      };
    } else if (target.id === 'upg_pro_kitchen') {
      if (updatedPlayer.stats.detailed) {
        updatedPlayer.stats.detailed.stamina = Math.min(99, (updatedPlayer.stats.detailed.stamina || 50) + 1);
      }
    } else if (target.id === 'upg_perf_complex') {
      const currentFree = updatedPlayer.freeStatPoints !== undefined ? updatedPlayer.freeStatPoints : (updatedPlayer.unassignedPoints || 0);
      updatedPlayer.freeStatPoints = currentFree + 5;
      updatedPlayer.unassignedPoints = currentFree + 5;
    } else if (target.id === 'upg_perf_center') {
      updatedPlayer.bonusRetirementYears = 5;
    }
    message = `🏗️ Purchased ${target.name}! Permanent Preseason bonuses activated. (-€${target.cost.toLocaleString()})`;
  }

  // 2. NEW BUSINESS PURCHASE
  else if (target.type === 'business') {
    const template = BUSINESS_TEMPLATES.find((t) => t.id === target.id) || (target.rawItem as BusinessTemplate);
    if (template) {
      const alreadyOwned = (updatedAcc.businesses || []).some(
        (b) => b && (b.templateId === template.id || b.name === template.name)
      );
      if (alreadyOwned) {
        return {
          updatedPlayer: player,
          updatedAccounting: accounting || defaultAccounting,
          updatedStoreItems: storeItems,
          success: false,
          message: `❌ You already own ${template.name}! You can only own one of each business type. Upgrade it in your Business Portfolio.`,
        };
      }
      const newBiz = createBusinessInstance(template);
      updatedAcc.businesses = [...(updatedAcc.businesses || []), newBiz];
      message = `🏢 Invested in ${template.name}! Generates +€${(newBiz.netProfit || 0).toLocaleString()}/yr profit. (-€${target.cost.toLocaleString()})`;
    }
  }

  // 3. BUSINESS UPGRADE
  else if (target.type === 'business_upgrade') {
    const bizList = updatedAcc.businesses || [];
    const biz = bizList.find((b) => b.id === target.id);
    if (biz) {
      const currTier = biz.tier || 1;
      const nextTier = currTier + 1;
      const template =
        BUSINESS_TEMPLATES.find((t) => t.id === biz.templateId) ||
        BUSINESS_TEMPLATES.find((t) => t.name === biz.name) ||
        BUSINESS_TEMPLATES[0];
      const newFinancials = calculateSeasonFinancials(template, nextTier);

      updatedAcc.businesses = bizList.map((b) =>
        b.id === target.id
          ? {
              ...b,
              tier: nextTier,
              revenue: newFinancials.revenue,
              expenses: newFinancials.expenses,
              netProfit: newFinancials.netProfit,
            }
          : b
      );
      message = `🚀 Upgraded ${biz.name} to Tier ${nextTier}! Net profit increased to +€${newFinancials.netProfit.toLocaleString()}/yr. (-€${target.cost.toLocaleString()})`;
    }
  }

  // 4. PRO EQUIPMENT
  else if (target.type === 'pro_equipment') {
    const storeItem = updatedStore.find((i) => i.id === target.id) || (target.rawItem as StoreUpgradeItem);
    if (storeItem) {
      updatedStore = updatedStore.map((i) =>
        i.id === target.id ? { ...i, availableStock: Math.max(0, (i.availableStock ?? 1) - 1) } : i
      );
      const matches = storeItem.matchDuration || storeItem.durability?.current || 15;
      const newEquip: StoreUpgradeItem = {
        ...storeItem,
        matchDuration: matches,
        durability: { current: matches, max: matches },
      };
      updatedPlayer.activeEquipment = [...(updatedPlayer.activeEquipment || []), newEquip];
      message = `👟 Equipped ${storeItem.name}! ${target.benefit} (${matches} matches active). (-€${target.cost.toLocaleString()})`;
    }
  }

  // 5. CONSUMABLES
  else if (target.type === 'consumable') {
    const storeItem = updatedStore.find((i) => i.id === target.id) || (target.rawItem as StoreUpgradeItem);
    if (storeItem) {
      updatedStore = updatedStore.map((i) =>
        i.id === target.id ? { ...i, availableStock: Math.max(0, (i.availableStock ?? 1) - 1) } : i
      );

      if (target.id === 'con_ankle_taping') {
        updatedPlayer.activeTapingMonths = 6;
        message = `🩹 Applied Ankle Taping! -15% injury risk for 6 months. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'con_hydrating_drink') {
        updatedPlayer.activeConsumables = [
          ...(updatedPlayer.activeConsumables || []),
          { id: target.id, name: storeItem.name, matchDuration: 1, statBonuses: { stamina: 5 } },
        ];
        updatedPlayer.fitness = Math.min(100, (updatedPlayer.fitness || 100) + 5);
        updatedPlayer.staminaCurrent = updatedPlayer.fitness;
        message = `🥤 Drank Hydrating Drink! +5 Bonus Stamina (1 match), +5% Fitness. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'con_recovery_supplement') {
        updatedPlayer.recoveryPoints = (updatedPlayer.recoveryPoints || 0) + 1;
        message = `💊 Ingested Recovery Supplement! +1 Recovery Point. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'con_performance_taping') {
        updatedPlayer.activeConsumables = [
          ...(updatedPlayer.activeConsumables || []),
          { id: target.id, name: storeItem.name, matchDuration: 24, statBonuses: { strength: 5, stamina: 5 } },
        ];
        updatedPlayer.activeTapingMonths = 6;
        message = `⚡ Applied Performance Taping! +5 Bonus Strength, +5 Bonus Stamina, -50% injury chance for 6 months. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'con_experimental_supplement') {
        updatedPlayer.recoveryPoints = (updatedPlayer.recoveryPoints || 0) + 5;
        message = `🧪 Consumed Experimental Supplement! +5 Recovery Points awarded. (-€${target.cost.toLocaleString()})`;
      }
    }
  }

  // 6. SEASON BOOST
  else if (target.type === 'season_boost') {
    const storeItem = updatedStore.find((i) => i.id === target.id) || (target.rawItem as StoreUpgradeItem);
    if (storeItem) {
      updatedStore = updatedStore.map((i) => (i.id === target.id ? { ...i, unlocked: true } : i));

      if (target.id === 'sbt_extra_training') {
        const statsKeys = [
          'pace', 'shooting', 'shortPass', 'longPass', 'crossing', 'dribbling', 'ballControl',
          'retention', 'positioning', 'tackling', 'interceptions', 'marking', 'heading',
          'stamina', 'strength', 'reactions', 'composure', 'longShots',
        ];
        const chosenKey = statsKeys[Math.floor(Math.random() * statsKeys.length)];
        const boostItem: StoreUpgradeItem = {
          ...storeItem,
          statBonuses: { [chosenKey]: 1 },
        };
        updatedPlayer.activeSeasonBoosts = [...(updatedPlayer.activeSeasonBoosts || []), boostItem];
        message = `⚡ Extra Training activated! +1 Bonus ${String(chosenKey).toUpperCase()} for current season. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'sbt_pro_nutrition') {
        const boostItem: StoreUpgradeItem = {
          ...storeItem,
          statBonuses: { stamina: 5 },
        };
        updatedPlayer.activeSeasonBoosts = [...(updatedPlayer.activeSeasonBoosts || []), boostItem];
        message = `🥗 Nutrition Program active: +5 Bonus Stamina for current season. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'sbt_kinesiologist') {
        updatedPlayer.activeSeasonBoosts = [...(updatedPlayer.activeSeasonBoosts || []), storeItem];
        message = `🩺 Personal Kinesiologist hired: -30% injury risk for current season. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'sbt_david_goggins') {
        const boostItem: StoreUpgradeItem = {
          ...storeItem,
          statBonuses: { composure: 10, stamina: 10, strength: 10, pace: 5 },
        };
        updatedPlayer.activeSeasonBoosts = [...(updatedPlayer.activeSeasonBoosts || []), boostItem];
        message = `🔥 David Goggins Hired! +10 Composure, +10 Stamina, +10 Strength, +5 Pace Bonus for current season. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'sbt_genetic_activation') {
        updatedPlayer.activeSeasonBoosts = [...(updatedPlayer.activeSeasonBoosts || []), storeItem];
        updatedPlayer.potentialOvr = (updatedPlayer.potentialOvr || updatedPlayer.ovr + 5) + 5;
        updatedPlayer.freeStatPoints = (updatedPlayer.freeStatPoints || 0) + 10;
        message = `🧬 Genetic Potential Activated! +5 Potential & +10 temporary Stat Points for current season. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'sbt_experimental_chemical') {
        if (updatedPlayer.stats?.detailed) {
          Object.keys(updatedPlayer.stats.detailed).forEach((k) => {
            const key = k as keyof typeof updatedPlayer.stats.detailed;
            (updatedPlayer.stats.detailed as any)[key] = Math.min(99, ((updatedPlayer.stats.detailed as any)[key] || 50) + 10);
          });
        }
        updatedPlayer.activeChemicalEnhancementSeason = true;
        updatedPlayer.activeSeasonBoosts = [...(updatedPlayer.activeSeasonBoosts || []), storeItem];
        message = `🧪 Experimental Chemical Enhancement activated! +10 to ALL stats for 12 months. (-€${target.cost.toLocaleString()})`;
      } else if (target.id === 'sbt_luxury_car_bonus') {
        updatedPlayer.chemistry = 200;
        updatedPlayer.activeSeasonBoosts = [...(updatedPlayer.activeSeasonBoosts || []), storeItem];
        message = `🏎️ Luxury Car Team Bonus purchased! Team chemistry set to 200%! (-€${target.cost.toLocaleString()})`;
      }
    }
  }

  // 7. COSMETICS
  else if (target.type === 'cosmetic') {
    const storeItem = updatedStore.find((i) => i.id === target.id) || (target.rawItem as StoreUpgradeItem);
    if (storeItem) {
      updatedStore = updatedStore.map((i) => (i.id === target.id ? { ...i, unlocked: true } : i));
      if (storeItem.specialHairType) {
        if (!updatedPlayer.biometrics) {
          updatedPlayer.biometrics = {} as any;
        }
        updatedPlayer.biometrics.specialHair = storeItem.specialHairType;
      }
      message = `✨ Unlocked cosmetic ${storeItem.name}! (-€${target.cost.toLocaleString()})`;
    }
  }

  return {
    updatedPlayer,
    updatedAccounting: updatedAcc,
    updatedStoreItems: updatedStore,
    success: true,
    message,
  };
}
