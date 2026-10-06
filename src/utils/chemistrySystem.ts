import { PlayerCardData, ActiveChemistryCap } from '../types';

export interface ChemistryInfo {
  chemistry: number;
  baseChemistry: number;
  overflowChemistry: number;
  isOverflow: boolean;
  penaltyPercent: number; // 0, 10, 20, 30, 40, or 50
  statusLabel: string;
  badgeColor: string;
  description: string;
  hasCeiling: boolean;
  ceilingPercent?: number;
  ceilingMonthsRemaining?: number;
  ceilingReason?: string;
  activeCaps?: ActiveChemistryCap[];
  hasHalvedGain?: boolean;
  halvedGainMonthsRemaining?: number;
}

export const INITIAL_NEW_CLUB_CHEMISTRY = 50;
export const TRANSFER_REQUEST_PENALTY = 30;
export const MAX_BASE_CHEMISTRY = 100;
export const MAX_TOTAL_CHEMISTRY = 200;
export const MAX_OVERFLOW_CHEMISTRY = 100;
export const OVERFLOW_MONTHLY_DECAY = 5;

/**
 * Calculates effective stacked chemistry ceiling and active debuffs.
 * Stacking Rule:
 * If player is capped at 80% (a -20% debuff) and receives another 80% cap (another -20% debuff),
 * the debuffs stack to -40%, making the player capped at 60%!
 * Each cap tracks its own duration. Once the first cap expires, the player goes to 80% from the newest cap.
 * When all caps expire, player returns to 100%.
 */
export function getActiveChemistryCeiling(player?: Partial<PlayerCardData> | null): {
  effectiveCeiling: number;
  hasCeiling: boolean;
  activeCaps: ActiveChemistryCap[];
  maxMonthsRemaining: number;
  primaryReason: string;
} {
  if (!player) {
    return { effectiveCeiling: 100, hasCeiling: false, activeCaps: [], maxMonthsRemaining: 0, primaryReason: '' };
  }

  const caps = player.chemistryCaps || [];
  const validCaps = caps.filter((c) => c && c.monthsRemaining > 0);

  // If no structured chemistryCaps array but legacy fields are active, backfill legacy cap
  if (validCaps.length === 0 && typeof player.chemistryCeiling === 'number' && (player.chemistryCeilingMonthsRemaining ?? 0) > 0) {
    const legacyCap: ActiveChemistryCap = {
      id: 'legacy-cap',
      capPercent: player.chemistryCeiling,
      penaltyReduction: Math.max(0, 100 - player.chemistryCeiling),
      monthsRemaining: player.chemistryCeilingMonthsRemaining || 12,
      originalDurationMonths: player.chemistryCeilingMonthsRemaining || 12,
      reason: player.chemistryCeilingReason || 'Manager Tactical Defiance',
    };
    validCaps.push(legacyCap);
  }

  if (validCaps.length === 0) {
    return {
      effectiveCeiling: 100,
      hasCeiling: false,
      activeCaps: [],
      maxMonthsRemaining: 0,
      primaryReason: '',
    };
  }

  // Stack all debuffs together:
  // Each cap reduces from 100% by its penaltyReduction (e.g. 80% cap = -20% ceiling)
  const totalDebuff = validCaps.reduce((acc, c) => acc + (c.penaltyReduction || Math.max(0, 100 - c.capPercent)), 0);
  const effectiveCeiling = Math.max(0, 100 - totalDebuff);
  const maxMonthsRemaining = Math.max(...validCaps.map((c) => c.monthsRemaining));
  const primaryReason = validCaps.map((c) => `${c.reason} (${c.capPercent}% cap, ${c.monthsRemaining}m left)`).join(' & ');

  return {
    effectiveCeiling,
    hasCeiling: true,
    activeCaps: validCaps,
    maxMonthsRemaining,
    primaryReason,
  };
}

/**
 * Resolves the effective active chemistry ceiling percentage (e.g. 80%, 60%) if one is active.
 * Returns undefined if no active ceiling exists.
 */
export function getActiveChemistryCap(
  ceilingPercent?: number,
  ceilingMonthsRemaining?: number,
  chemistryCaps?: ActiveChemistryCap[]
): number | undefined {
  const validCaps = (chemistryCaps || []).filter((c) => c && c.monthsRemaining > 0);
  let effectiveCeil = typeof ceilingPercent === 'number' && ceilingPercent > 0 && ceilingPercent < 100 && (ceilingMonthsRemaining ?? 1) > 0 ? ceilingPercent : undefined;
  if (validCaps.length > 0) {
    const totalDebuff = validCaps.reduce((acc, c) => acc + (c.penaltyReduction || Math.max(0, 100 - c.capPercent)), 0);
    effectiveCeil = Math.max(0, 100 - totalDebuff);
  }
  return typeof effectiveCeil === 'number' && effectiveCeil < 100 ? effectiveCeil : undefined;
}

/**
 * Calculates Chemistry penalty and status based on rules:
 * Starting at New Club: 50%
 * Monthly Growth: +10% per completed month (Max 100% or active ceiling)
 * Overflow Chemistry: 101% - 200% from cards and special events (+1 stat per 1% overflow)
 * Overflow Decay: -5% per month down to 100%
 * At 100 -> 0% (Full Chemistry)
 * Below 100 -> -10% attributes
 * Below 80 -> -20%
 * Below 70 -> -30%
 * Below 60 -> -40%
 * Below 50 -> -50%
 */
export function getChemistryInfo(
  chemistryValue?: number,
  ceilingPercent?: number,
  ceilingMonthsRemaining?: number,
  ceilingReason?: string,
  halvedGainMonthsRemaining?: number,
  chemistryCaps?: ActiveChemistryCap[]
): ChemistryInfo {
  let chemistry = Math.max(0, Math.min(MAX_TOTAL_CHEMISTRY, chemistryValue ?? INITIAL_NEW_CLUB_CHEMISTRY));

  // Determine active ceiling, considering stacked chemistry caps
  const validCaps = (chemistryCaps || []).filter((c) => c && c.monthsRemaining > 0);
  let effectiveCeil = typeof ceilingPercent === 'number' && ceilingPercent > 0 && ceilingPercent < 100 && (ceilingMonthsRemaining ?? 1) > 0 ? ceilingPercent : undefined;
  let maxMonths = ceilingMonthsRemaining;
  let reason = ceilingReason;

  if (validCaps.length > 0) {
    const totalDebuff = validCaps.reduce((acc, c) => acc + (c.penaltyReduction || Math.max(0, 100 - c.capPercent)), 0);
    effectiveCeil = Math.max(0, 100 - totalDebuff);
    maxMonths = Math.max(...validCaps.map((c) => c.monthsRemaining));
    reason = validCaps.map((c) => `${c.reason} (${c.capPercent}%, ${c.monthsRemaining}m left)`).join(' & ');
  }

  const hasCeiling = typeof effectiveCeil === 'number' && effectiveCeil < 100 && (maxMonths ?? 1) > 0;
  const hasHalvedGain = typeof halvedGainMonthsRemaining === 'number' && halvedGainMonthsRemaining > 0;

  // Active ceilings constrain baseline chemistry growth.
  // However, card bonuses can temporarily overflow beyond the ceiling and beyond 100%!
  // If player is not in an overflow/boosted state (> 100%), their base chemistry cannot exceed the ceiling.
  if (hasCeiling && typeof effectiveCeil === 'number' && chemistry <= 100) {
    chemistry = Math.min(chemistry, effectiveCeil);
  }

  const isOverflow = chemistry > 100;
  const overflowChemistry = isOverflow ? Math.min(MAX_OVERFLOW_CHEMISTRY, Math.round(chemistry - 100)) : 0;
  const baseChemistry = Math.min(MAX_BASE_CHEMISTRY, chemistry);

  let baseInfo: ChemistryInfo;

  if (isOverflow) {
    const ceilDesc = hasCeiling && typeof effectiveCeil === 'number' ? ` (Underlying base ceiling: ${effectiveCeil}% active)` : '';
    baseInfo = {
      chemistry,
      baseChemistry: hasCeiling && typeof effectiveCeil === 'number' ? effectiveCeil : 100,
      overflowChemistry,
      isOverflow: true,
      penaltyPercent: 0,
      statusLabel: `Overflow Synergy (+${overflowChemistry}%)`,
      badgeColor: 'bg-sky-500/25 text-sky-200 border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.25)] font-black',
      description: `Transcendent squad cohesion! +${overflowChemistry}% Overflow Chemistry grants +1 bonus to all eligible attributes per 1% overflow. Decays down to ${hasCeiling ? `${effectiveCeil}% base ceiling` : '100%'} by -5%/month.${ceilDesc}`,
      hasCeiling,
      ceilingPercent: effectiveCeil,
      ceilingMonthsRemaining: maxMonths,
      ceilingReason: reason,
    };
  } else if (chemistry >= 100) {
    baseInfo = {
      chemistry,
      baseChemistry: 100,
      overflowChemistry: 0,
      isOverflow: false,
      penaltyPercent: 0,
      statusLabel: 'Perfect Chemistry (100%)',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Optimal team synergy! Full player attributes unlocked (0% penalty). Chemistry remains at 100%.',
      hasCeiling: false,
    };
  } else if (chemistry >= 80) {
    baseInfo = {
      chemistry,
      baseChemistry: chemistry,
      overflowChemistry: 0,
      isOverflow: false,
      penaltyPercent: 10,
      statusLabel: 'Good Fit',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description: 'Minor tactical friction (-10% attribute penalty). Growing +10%/month.',
      hasCeiling: false,
    };
  } else if (chemistry >= 70) {
    baseInfo = {
      chemistry,
      baseChemistry: chemistry,
      overflowChemistry: 0,
      isOverflow: false,
      penaltyPercent: 20,
      statusLabel: 'Developing Fit',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: 'Moderate cohesion issues (-20% attribute penalty). Growing +10%/month.',
      hasCeiling: false,
    };
  } else if (chemistry >= 60) {
    baseInfo = {
      chemistry,
      baseChemistry: chemistry,
      overflowChemistry: 0,
      isOverflow: false,
      penaltyPercent: 30,
      statusLabel: 'Incohesive',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      description: 'Struggling team integration (-30% attribute penalty). Growing +10%/month.',
      hasCeiling: false,
    };
  } else if (chemistry >= 50) {
    baseInfo = {
      chemistry,
      baseChemistry: chemistry,
      overflowChemistry: 0,
      isOverflow: false,
      penaltyPercent: 40,
      statusLabel: 'New Arrival / Poor Fit',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description: 'Adapting to club environment (-40% attribute penalty). Growing +10%/month.',
      hasCeiling: false,
    };
  } else {
    baseInfo = {
      chemistry,
      baseChemistry: chemistry,
      overflowChemistry: 0,
      isOverflow: false,
      penaltyPercent: 50,
      statusLabel: 'Unsettled Outcast',
      badgeColor: 'bg-red-600/30 text-red-200 border-red-500/60 font-black',
      description: 'Severe locker room dysfunction (-50% attribute penalty). Growing +10%/month.',
      hasCeiling: false,
    };
  }

  const penaltyNotes: string[] = [];
  if (hasCeiling && typeof effectiveCeil === 'number') {
    penaltyNotes.push(`Chemistry capped at ${effectiveCeil}% for ${maxMonths} more month(s) due to: ${reason || ceilingReason || 'Defying manager'}.`);
  }
  if (hasHalvedGain) {
    penaltyNotes.push(`Chemistry gain halved (50%) for ${halvedGainMonthsRemaining} more month(s).`);
  }

  if (hasCeiling || penaltyNotes.length > 0) {
    return {
      ...baseInfo,
      hasCeiling,
      ceilingPercent: hasCeiling ? effectiveCeil : undefined,
      ceilingMonthsRemaining: hasCeiling ? maxMonths : undefined,
      ceilingReason: hasCeiling ? (reason || ceilingReason || 'Defying manager') : undefined,
      hasHalvedGain,
      halvedGainMonthsRemaining: hasHalvedGain ? halvedGainMonthsRemaining : undefined,
      description: penaltyNotes.length > 0 ? `${baseInfo.description} ⚠️ ${penaltyNotes.join(' ')}` : baseInfo.description,
    };
  }

  return baseInfo;
}

/**
 * Applies monthly chemistry changes:
 * - When Chemistry > 100% (Overflow Chemistry): decays down to 100% at -5% per month. Normal gain does not apply.
 * - When Chemistry === 100%: normal chemistry gain stops.
 * - When Chemistry < 100%: grows +10% per month (+5% if halved) up to ceiling or 100%.
 * Also decrements active Chemistry Ceiling months and Halved Gain months.
 */
export function applyMonthlyChemistryGrowth(
  currentChemistry?: number,
  ceilingPercent?: number,
  ceilingMonths?: number,
  halvedGainMonths?: number,
  chemistryCaps?: ActiveChemistryCap[]
): {
  newChemistry: number;
  gained: number;
  newCeilingMonths?: number;
  activeCeiling?: number;
  newHalvedGainMonths?: number;
  newChemistryCaps?: ActiveChemistryCap[];
} {
  const current = Math.max(0, Math.min(MAX_TOTAL_CHEMISTRY, currentChemistry ?? INITIAL_NEW_CLUB_CHEMISTRY));
  const isHalved = typeof halvedGainMonths === 'number' && halvedGainMonths > 0;

  // Process structured stacked caps if present
  let activeCaps: ActiveChemistryCap[] = [];
  if (chemistryCaps && chemistryCaps.length > 0) {
    activeCaps = chemistryCaps
      .map((c) => {
        if (c.id === 'bigger_youth_club_adaptation') {
          return { ...c };
        }
        return { ...c, monthsRemaining: c.monthsRemaining - 1 };
      })
      .filter((c) => c.monthsRemaining > 0);
  } else if (typeof ceilingPercent === 'number' && ceilingPercent > 0 && ceilingPercent < 100 && (ceilingMonths ?? 0) > 0) {
    // Migrate legacy cap
    const remMonths = Math.max(0, (ceilingMonths ?? 1) - 1);
    if (remMonths > 0) {
      activeCaps = [
        {
          id: 'legacy-cap',
          capPercent: ceilingPercent,
          penaltyReduction: Math.max(0, 100 - ceilingPercent),
          monthsRemaining: remMonths,
          originalDurationMonths: ceilingMonths ?? 12,
          reason: 'Tactical Defiance',
        },
      ];
    }
  }

  let activeCeiling: number | undefined = undefined;
  let newCeilingMonths: number | undefined = undefined;

  if (activeCaps.length > 0) {
    const totalDebuff = activeCaps.reduce((acc, c) => acc + (c.penaltyReduction || Math.max(0, 100 - c.capPercent)), 0);
    activeCeiling = Math.max(0, 100 - totalDebuff);
    newCeilingMonths = Math.max(...activeCaps.map((c) => c.monthsRemaining));
  }

  const maxLimit = typeof activeCeiling === 'number' && activeCeiling < 100 ? activeCeiling : MAX_BASE_CHEMISTRY;

  let newChemistry = current;
  let gained = 0;

  if (current > maxLimit) {
    // Decays down towards the active limit (100% normally, or activeCeiling if a cap is active)
    const excess = current - maxLimit;
    const decay = Math.min(OVERFLOW_MONTHLY_DECAY, excess);
    newChemistry = current - decay;
    gained = -decay;
  } else if (current >= maxLimit) {
    // Cannot exceed current active ceiling
    newChemistry = maxLimit;
    gained = 0;
  } else {
    // Normal monthly growth towards maxLimit
    const monthlyIncrement = isHalved ? 5 : 10;
    newChemistry = Math.min(maxLimit, current + monthlyIncrement);
    gained = newChemistry - current;
  }

  let newHalvedGainMonths: number | undefined = undefined;
  if (isHalved && typeof halvedGainMonths === 'number') {
    const decr = Math.max(0, halvedGainMonths - 1);
    newHalvedGainMonths = decr > 0 ? decr : undefined;
  }

  return {
    newChemistry,
    gained,
    newCeilingMonths,
    activeCeiling,
    newHalvedGainMonths,
    newChemistryCaps: activeCaps,
  };
}

/**
 * Sets a temporary team chemistry ceiling on the player (e.g. 80% for 12 months)
 * Supports stacking debuffs: e.g. 80% cap + 80% cap = 60% cap!
 */
export function applyChemistryCeiling(
  player: PlayerCardData,
  capPercent: number,
  durationMonths: number = 12,
  reason: string = 'Post-match controversy'
): PlayerCardData {
  const currentCaps = [...(player.chemistryCaps || [])].filter((c) => c && c.monthsRemaining > 0);

  // Migrate legacy fields if array was empty
  if (currentCaps.length === 0 && typeof player.chemistryCeiling === 'number' && (player.chemistryCeilingMonthsRemaining ?? 0) > 0) {
    currentCaps.push({
      id: 'legacy-cap',
      capPercent: player.chemistryCeiling,
      penaltyReduction: Math.max(0, 100 - player.chemistryCeiling),
      monthsRemaining: player.chemistryCeilingMonthsRemaining || 12,
      originalDurationMonths: player.chemistryCeilingMonthsRemaining || 12,
      reason: player.chemistryCeilingReason || 'Manager Defiance',
    });
  }

  // Add new cap to the stack
  const newCap: ActiveChemistryCap = {
    id: `cap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    capPercent,
    penaltyReduction: Math.max(0, 100 - capPercent),
    monthsRemaining: durationMonths,
    originalDurationMonths: durationMonths,
    reason,
    appliedDate: player.calendarDate,
  };
  currentCaps.push(newCap);

  // Calculate stacked effective ceiling
  const totalDebuff = currentCaps.reduce((sum, c) => sum + (c.penaltyReduction || Math.max(0, 100 - c.capPercent)), 0);
  const effectiveCeiling = Math.max(0, 100 - totalDebuff);
  const maxMonths = Math.max(...currentCaps.map((c) => c.monthsRemaining));
  const combinedReason = currentCaps.map((c) => `${c.reason} (${c.capPercent}%, ${c.monthsRemaining}m left)`).join(' & ');

  const currentChem = Math.max(0, Math.min(200, player.chemistry ?? INITIAL_NEW_CLUB_CHEMISTRY));
  const newChem = Math.min(currentChem, effectiveCeiling);

  return {
    ...player,
    chemistry: newChem,
    chemistryCaps: currentCaps,
    chemistryCeiling: effectiveCeiling,
    chemistryCeilingMonthsRemaining: maxMonths,
    chemistryCeilingReason: combinedReason,
  };
}

/**
 * Penalizes chemistry when going against the manager:
 * - Halves monthly chemistry gain (50%) for 1 year (12 months)
 * - Caps chemistry at max 80% for 1 year (12 months), stacking with any prior caps
 */
export function applyDefiancePenalty(
  player: PlayerCardData,
  reason: string = "Defied Manager's Tactical Choice",
  durationMonths: number = 12
): PlayerCardData {
  const playerWithCap = applyChemistryCeiling(player, 80, durationMonths, reason);
  return {
    ...playerWithCap,
    chemistryGainHalvedMonthsRemaining: durationMonths,
  };
}

/**
 * Resets chemistry to 50% whenever joining a new club.
 */
export function applyNewClubChemistry(player: PlayerCardData): PlayerCardData {
  const safeStaminaPenalty = typeof player.youthLeagueStaminaPenalty === 'number' && player.youthLeagueStaminaPenalty < 0
    ? 0
    : player.youthLeagueStaminaPenalty ?? 0;

  return {
    ...player,
    chemistry: INITIAL_NEW_CLUB_CHEMISTRY,
    chemistryCeiling: undefined,
    chemistryCeilingMonthsRemaining: undefined,
    chemistryCeilingReason: undefined,
    chemistryCaps: [],
    chemistryGainHalvedMonthsRemaining: undefined,
    requestedTransfer: false,
    biggerYouthClubName: undefined,
    biggerYouthClubSeasonsCompleted: undefined,
    youthLeagueChemistryCap: undefined,
    youthLeagueStaminaPenalty: safeStaminaPenalty,
    isBigClubYouth: false,
  };
}

/**
 * Applies immediate -30 percentage points penalty to Chemistry when requesting a transfer.
 * Clamps Chemistry to a minimum of 0%.
 */
export function applyTransferRequestPenalty(player: PlayerCardData): {
  updatedPlayer: PlayerCardData;
  penaltyApplied: number;
  oldChem: number;
  newChem: number;
} {
  const oldChem = Math.max(0, Math.min(200, player.chemistry ?? INITIAL_NEW_CLUB_CHEMISTRY));
  const newChem = Math.max(0, oldChem - TRANSFER_REQUEST_PENALTY);
  const penaltyApplied = oldChem - newChem;

  const updatedPlayer: PlayerCardData = {
    ...player,
    chemistry: newChem,
    requestedTransfer: true,
  };

  return {
    updatedPlayer,
    penaltyApplied,
    oldChem,
    newChem,
  };
}

/**
 * Decrements active chemistry ceiling months and active caps by the specified number of months.
 * If all caps/ceilings reach 0 months remaining, removes the ceiling and allows chemistry to return to 100%.
 * Also recalculates and updates the effective ceiling and remaining duration.
 */
export function discountChemistryPenaltyMonths(
  player: PlayerCardData,
  monthsToDiscount: number = 1
): PlayerCardData {
  if (monthsToDiscount <= 0) return player;

  const currentCaps = [...(player.chemistryCaps || [])];
  const legacyCeil = player.chemistryCeiling;
  const legacyMonths = player.chemistryCeilingMonthsRemaining ?? 0;

  // If no structured caps but legacy ceiling exists, create structured cap
  if (currentCaps.length === 0 && typeof legacyCeil === 'number' && legacyCeil > 0 && legacyCeil < 100 && legacyMonths > 0) {
    currentCaps.push({
      id: 'legacy-cap',
      capPercent: legacyCeil,
      penaltyReduction: Math.max(0, 100 - legacyCeil),
      monthsRemaining: legacyMonths,
      originalDurationMonths: legacyMonths,
      reason: player.chemistryCeilingReason || 'Manager Defiance',
    });
  }

  // Update halved gain if active
  let updatedHalved = player.chemistryGainHalvedMonthsRemaining;
  if (typeof updatedHalved === 'number' && updatedHalved > 0) {
    const rem = Math.max(0, updatedHalved - monthsToDiscount);
    updatedHalved = rem > 0 ? rem : undefined;
  }

  if (currentCaps.length === 0 && (player.chemistryCeilingMonthsRemaining ?? 0) <= 0) {
    return {
      ...player,
      chemistryCeiling: undefined,
      chemistryCeilingMonthsRemaining: undefined,
      chemistryCeilingReason: undefined,
      chemistryCaps: [],
      chemistryGainHalvedMonthsRemaining: updatedHalved,
    };
  }

  // Decrement each cap by monthsToDiscount (adaptation caps are managed by season summary progression)
  const decrementedCaps: ActiveChemistryCap[] = currentCaps
    .map((cap) => {
      if (cap.id === 'bigger_youth_club_adaptation') {
        return { ...cap };
      }
      return {
        ...cap,
        monthsRemaining: Math.max(0, cap.monthsRemaining - monthsToDiscount),
      };
    })
    .filter((cap) => cap.monthsRemaining > 0);

  if (decrementedCaps.length === 0) {
    // All caps have expired! Player is liberated!
    return {
      ...player,
      chemistryCaps: [],
      chemistryCeiling: undefined,
      chemistryCeilingMonthsRemaining: undefined,
      chemistryCeilingReason: undefined,
      chemistryGainHalvedMonthsRemaining: updatedHalved,
    };
  }

  // Recalculate stacked ceiling from remaining active caps
  const totalDebuff = decrementedCaps.reduce((acc, c) => acc + (c.penaltyReduction || Math.max(0, 100 - c.capPercent)), 0);
  const effectiveCeiling = Math.max(0, 100 - totalDebuff);
  const maxMonths = Math.max(...decrementedCaps.map((c) => c.monthsRemaining));
  const combinedReason = decrementedCaps.map((c) => `${c.reason} (${c.capPercent}%, ${c.monthsRemaining}m left)`).join(' & ');

  return {
    ...player,
    chemistryCaps: decrementedCaps,
    chemistryCeiling: effectiveCeiling,
    chemistryCeilingMonthsRemaining: maxMonths,
    chemistryCeilingReason: combinedReason,
    chemistryGainHalvedMonthsRemaining: updatedHalved,
  };
}
