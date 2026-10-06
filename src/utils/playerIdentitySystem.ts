import {
  getSubPositionInfo,
  POSITION_TAXONOMY,
  calculateWeightedOvr,
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
} from './statCalculations';
import { PlayerCardData, CareerStage, OutfieldDetailedStats, GkDetailedStats } from '../types';
import { resolveAuthoritativeClubContext } from './clubContextRebuilder';
import { formatPersonName, getOriginLastNameForCity } from './originLastNameSystem';

export const ADVANCED_POSITIONS: readonly string[] = ['SS', 'CF', 'LM', 'RM', 'LWB', 'RWB'];

/**
 * Checks if a position is an advanced position:
 * SS (Second Striker), LM, RM, LWB and RWB are advanced positions.
 * They must NEVER be selectable as the player's first position in Youth Career,
 * and can ONLY be obtained later through the Add New Position event after joining a professional team.
 */
export function isAdvancedPosition(pos?: string): boolean {
  if (!pos) return false;
  return ADVANCED_POSITIONS.includes(pos.toUpperCase().trim());
}

/**
 * Returns broad normal sub-positions selectable during Youth Career (excludes all advanced positions).
 */
export function getYouthSelectableSubPositionsForCategory(category: string): string[] {
  const all = getValidSubPositionsForCategory(category);
  return all.filter((sub) => !isAdvancedPosition(sub));
}

/**
 * Maps an advanced position code to its normal broad baseline equivalent.
 */
export function getFallbackBroadPositionForAdvanced(subPos: string): string {
  const code = (subPos || '').toUpperCase().trim();
  switch (code) {
    case 'SS':
    case 'CF':
      return 'ST';
    case 'LM':
    case 'RM':
      return 'CM';
    case 'LWB':
      return 'LB';
    case 'RWB':
      return 'RB';
    default:
      return 'ST';
  }
}

export function getValidSubPositionsForCategory(category: string): string[] {
  const cat = POSITION_TAXONOMY.find((c) => c.category === (category || 'ATT').toUpperCase());
  if (cat && cat.subPositions.length > 0) {
    return cat.subPositions.map((s) => s.code);
  }
  switch ((category || 'ATT').toUpperCase()) {
    case 'ATT':
      return ['ST', 'LW', 'RW', 'SS'];
    case 'MID':
      return ['CAM', 'CM', 'CDM', 'LM', 'RM'];
    case 'DEF':
      return ['CB', 'LB', 'RB', 'LWB', 'RWB'];
    case 'GK':
      return ['GK'];
    default:
      return ['ST', 'LW', 'RW'];
  }
}

export function getValidPlayStylesForSubPosition(subPositionCode: string): string[] {
  const info = getSubPositionInfo(subPositionCode);
  if (info && info.playStyles && info.playStyles.length > 0) {
    return info.playStyles;
  }
  return ['Balanced'];
}

export function isPlayStyleValidForSubPosition(subPositionCode: string, playStyleName?: string): boolean {
  if (!playStyleName) return false;
  const validStyles = getValidPlayStylesForSubPosition(subPositionCode);
  return validStyles.some((s) => s.toLowerCase() === playStyleName.toLowerCase());
}

export function validateAndRepairPlaystyle(subPositionCode: string, currentPlaystyle?: string): string {
  if (currentPlaystyle && currentPlaystyle.trim().toLowerCase() === 'basic') {
    return 'Basic';
  }
  const validStyles = getValidPlayStylesForSubPosition(subPositionCode);
  if (validStyles.length === 0) return 'Balanced';
  if (!currentPlaystyle) return validStyles[0];

  const cleanCurrent = currentPlaystyle.trim().toLowerCase();

  // 1. Exact match
  const exactMatch = validStyles.find((s) => s.toLowerCase() === cleanCurrent);
  if (exactMatch) return exactMatch;

  // 2. Substring / Prefix / Suffix / Alias match (e.g., 'Complete ST' -> 'Complete', 'Target Forward' -> 'Target')
  const partialMatch = validStyles.find(
    (s) => cleanCurrent.includes(s.toLowerCase()) || s.toLowerCase().includes(cleanCurrent)
  );
  if (partialMatch) return partialMatch;

  // 3. Known special mappings
  if (cleanCurrent.includes('target')) return validStyles.find((s) => s.toLowerCase() === 'target') || validStyles[0];
  if (cleanCurrent.includes('complete')) return validStyles.find((s) => s.toLowerCase() === 'complete') || validStyles[0];
  if (cleanCurrent.includes('finisher') || cleanCurrent.includes('fox')) return validStyles.find((s) => s.toLowerCase() === 'finisher') || validStyles[0];
  if (cleanCurrent.includes('poacher')) return validStyles.find((s) => s.toLowerCase() === 'poacher') || validStyles[0];
  if (cleanCurrent.includes('box')) return validStyles.find((s) => s.toLowerCase() === 'box-to-box') || validStyles[0];
  if (cleanCurrent.includes('playmaker') || cleanCurrent.includes('creator')) return validStyles.find((s) => s.toLowerCase().includes('playmaker') || s.toLowerCase().includes('creator')) || validStyles[0];
  if (cleanCurrent.includes('sweeper')) return validStyles.find((s) => s.toLowerCase() === 'sweeper') || validStyles[0];

  // 4. If current playstyle has meaningful value, preserve it rather than forcibly overriding with default
  if (currentPlaystyle && currentPlaystyle !== 'UNSELECTED' && currentPlaystyle !== 'UNASSIGNED') {
    return currentPlaystyle;
  }

  return validStyles[0];
}

/**
 * Sanitizes and repairs a player's core identity:
 * - Position ('ATT' | 'MID' | 'DEF' | 'GK')
 * - Sub-Position (valid child of Position)
 * - Playstyle (valid style for Sub-Position)
 * 
 * Crucially: NEVER changes the primary Position category when repairing sub-position or playstyle.
 */
export function sanitizeAndRepairPlayerIdentity<T extends Partial<PlayerCardData>>(player: T): T {
  if (!player) return player;
  const copy = { ...player };

  const rawPos = (copy.position || '').toUpperCase();
  const rawSub = (copy.subPosition || '').toUpperCase();

  if (
    rawPos === 'UNSELECTED' ||
    rawPos === 'UNASSIGNED' ||
    !rawPos ||
    rawSub === 'UNSELECTED' ||
    rawSub === 'UNASSIGNED'
  ) {
    copy.position = 'UNSELECTED';
    copy.subPosition = 'UNSELECTED';
    copy.playStyle = 'UNSELECTED';
    return copy;
  }

  let primaryCategory: 'ATT' | 'MID' | 'DEF' | 'GK' = 'ATT';

  if (['ATT', 'MID', 'DEF', 'GK'].includes(rawPos)) {
    primaryCategory = rawPos as 'ATT' | 'MID' | 'DEF' | 'GK';
  } else {
    // If position was stored as a subPosition code e.g. 'ST', 'CAM', 'CB', 'GK'
    const posInfo = getSubPositionInfo(copy.position || copy.subPosition || 'ST');
    if (posInfo.category && posInfo.category !== 'UNASSIGNED') {
      primaryCategory = posInfo.category as 'ATT' | 'MID' | 'DEF' | 'GK';
    }
  }

  copy.position = primaryCategory;

  // 2. Resolve Sub-Position
  const isPro = isProfessionalPlayer(copy);
  const allowedSubPositions = isPro
    ? getValidSubPositionsForCategory(primaryCategory)
    : getYouthSelectableSubPositionsForCategory(primaryCategory);
  let currentSub = (copy.subPosition || '').toUpperCase();

  // Advanced positions (SS, LM, RM, LWB, RWB) must NEVER be the player's position in Youth Career
  if (!isPro && isAdvancedPosition(currentSub)) {
    currentSub = getFallbackBroadPositionForAdvanced(currentSub);
  }

  // If subPosition is missing or invalid for primaryCategory or equal to primaryCategory
  if (!allowedSubPositions.includes(currentSub)) {
    // Check if raw copy.position was a valid subPosition code
    if (allowedSubPositions.includes(rawPos)) {
      currentSub = rawPos;
    } else {
      currentSub = allowedSubPositions[0]; // e.g. ST for ATT, CAM for MID, CB for DEF, GK for GK
    }
  }

  copy.subPosition = currentSub;

  // 3. Resolve Playstyle
  copy.playStyle = validateAndRepairPlaystyle(currentSub, copy.playStyle);

  // 4. Resolve & Deduplicate Secondary Nationalities
  const combinedNats = [
    ...(copy.otherNationalities || []),
    ...(copy.extraNationalities || []),
  ];
  if (combinedNats.length > 0) {
    const mainCode = copy.nationality?.code;
    const cleanOther = combinedNats.filter(
      (nat, index, self) =>
        nat &&
        nat.code &&
        nat.code !== mainCode &&
        index === self.findIndex((n) => n && n.code === nat.code)
    );
    copy.otherNationalities = cleanOther;
    copy.extraNationalities = cleanOther;
  }

  // 5. Ensure birth identity and origin last name fields are preserved and formatted
  const originCity = copy.startingCity || copy.city;
  if (originCity && !copy.originLastName) {
    copy.originLastName = getOriginLastNameForCity(originCity);
  }

  if (!copy.originalLastName && (copy.birthLastName || copy.lastName || copy.familyName || copy.equippedParentCard?.familyName)) {
    copy.originalLastName = formatPersonName(copy.birthLastName || copy.lastName || copy.familyName || copy.equippedParentCard?.familyName);
  }

  if (!copy.selectedLastNameType) {
    if (copy.originLastName && copy.lastName === copy.originLastName) {
      copy.selectedLastNameType = 'origin';
    } else {
      copy.selectedLastNameType = 'original';
    }
  }

  if (copy.firstName) copy.firstName = formatPersonName(copy.firstName);
  if (copy.originalFirstName) copy.originalFirstName = formatPersonName(copy.originalFirstName);
  if (copy.birthFirstName) copy.birthFirstName = formatPersonName(copy.birthFirstName);
  if (copy.lastName) copy.lastName = formatPersonName(copy.lastName);
  if (copy.originalLastName) copy.originalLastName = formatPersonName(copy.originalLastName);
  if (copy.originLastName) copy.originLastName = formatPersonName(copy.originLastName);
  if (copy.familyName) copy.familyName = formatPersonName(copy.familyName);
  if (copy.birthLastName) copy.birthLastName = formatPersonName(copy.birthLastName);

  if (copy.name && !copy.nicknameAccepted) {
    copy.name = formatPersonName(copy.name);
    if (!copy.birthFullName) {
      copy.birthFullName = copy.name;
    } else {
      copy.birthFullName = formatPersonName(copy.birthFullName);
    }
    if (!copy.birthFirstName) {
      const parts = copy.name.split(/\s+/);
      const fn = (copy.firstName || copy.originalFirstName || parts[0] || '').trim();
      if (fn) {
        copy.birthFirstName = formatPersonName(fn);
        if (!copy.originalFirstName) {
          copy.originalFirstName = copy.birthFirstName;
        }
      }
    }
  } else if (copy.birthFullName) {
    copy.birthFullName = formatPersonName(copy.birthFullName);
  }

  // 6. Ensure Bigger Youth Club adaptation integrity (cleansed if age >= 17, pro, left club, or free agent)
  const isProOrSenior =
    copy.isProPlayer === true ||
    copy.isProfessional === true ||
    (copy.careerStage || '').toUpperCase() === 'PROFESSIONAL' ||
    copy.careerStage === 'FREE_AGENT' ||
    copy.isCareerModeActive === true;
  const isOverYouthAge = (copy.age || 10) >= 17;
  const isAtDifferentClub = Boolean(copy.biggerYouthClubName && copy.club && copy.club !== copy.biggerYouthClubName);
  const isFreeAgentClub = copy.club === 'Free Agent' || copy.isFreeAgent === true;

  if (isProOrSenior || isOverYouthAge || isAtDifferentClub || isFreeAgentClub) {
    if (
      copy.youthLeagueStaminaPenalty ||
      copy.youthLeagueChemistryCap ||
      copy.biggerYouthClubName ||
      copy.isBigClubYouth ||
      copy.chemistryCaps?.some((c) => c && (c.id === 'bigger_youth_club_adaptation' || c.reason === 'Bigger Youth Club Adaptation'))
    ) {
      copy.biggerYouthClubName = undefined;
      copy.biggerYouthClubSeasonsCompleted = undefined;
      copy.youthLeagueChemistryCap = undefined;
      copy.lastAdaptationSeasonYear = undefined;
      copy.isBigClubYouth = false;
      if (typeof copy.youthLeagueStaminaPenalty === 'number' && copy.youthLeagueStaminaPenalty < 0) {
        copy.youthLeagueStaminaPenalty = 0;
      }
      if (copy.chemistryCaps) {
        copy.chemistryCaps = copy.chemistryCaps.filter((c) => c && c.id !== 'bigger_youth_club_adaptation' && c.reason !== 'Bigger Youth Club Adaptation');
        if (copy.chemistryCaps.length === 0) {
          copy.chemistryCeiling = undefined;
          copy.chemistryCeilingMonthsRemaining = undefined;
          copy.chemistryCeilingReason = undefined;
        }
      }
    }
  }

  return copy;
}

/**
 * Centralized resolution of authoritative CareerStage:
 * 'YOUTH_ACADEMY' | 'PROFESSIONAL' | 'FREE_AGENT'
 */
export function getPlayerCareerStage(player?: {
  careerStage?: string;
  isProPlayer?: boolean;
  isProfessional?: boolean;
  isFreeAgent?: boolean;
  isYouthCareerActive?: boolean;
  isCareerModeActive?: boolean;
  club?: string;
  age?: number;
} | null): 'YOUTH_ACADEMY' | 'PROFESSIONAL' | 'FREE_AGENT' {
  if (!player) return 'YOUTH_ACADEMY';
  const stage = (player.careerStage || '').toUpperCase();
  if (stage === 'PROFESSIONAL' || stage === 'PRO' || stage === 'SENIOR') return 'PROFESSIONAL';
  if (stage === 'FREE_AGENT' || player.isFreeAgent === true || player.club === 'Free Agent') return 'FREE_AGENT';
  if (stage === 'YOUTH_ACADEMY' || stage === 'YOUTH') return 'YOUTH_ACADEMY';
  if (player.isProPlayer === true || player.isProfessional === true || player.isCareerModeActive === true) return 'PROFESSIONAL';
  if (player.isYouthCareerActive === false && player.club && !player.club.toLowerCase().includes('youth') && player.club !== 'Free Agent') {
    return 'PROFESSIONAL';
  }
  return 'YOUTH_ACADEMY';
}

/**
 * Centralized, strict determination of whether a player has signed a professional contract.
 * Returns true if the player is in Pro Career mode (not in Youth Academy).
 */
export function isProfessionalPlayer(player?: {
  isProPlayer?: boolean;
  careerStage?: string;
  isCareerModeActive?: boolean;
  isYouthCareerActive?: boolean;
  isProfessional?: boolean;
  club?: string;
  age?: number;
  squadDestination?: string;
  league?: string;
} | null): boolean {
  if (!player) return false;
  const stage = (player.careerStage || '').toUpperCase();
  if (stage === 'PROFESSIONAL' || stage === 'PRO' || stage === 'SENIOR') return true;
  if (player.isProPlayer === true || (player as any).isProfessional === true) return true;
  if (player.isCareerModeActive === true) return true;
  if (player.isYouthCareerActive === false && player.club && !player.club.toLowerCase().includes('youth academy') && player.club !== 'Free Agent') {
    return true;
  }
  if ((player.age || 10) >= 16) {
    if (player.squadDestination && ['First Team', 'Reserves', 'U20', 'U17'].includes(player.squadDestination)) {
      return true;
    }
    if (player.club && !player.club.toLowerCase().includes('youth academy') && !player.club.toLowerCase().includes('deportivo') && player.club !== 'Free Agent' && player.club !== 'Youth Prospect') {
      return true;
    }
  }
  return false;
}

export interface ProTransitionOptions {
  clubName: string;
  leagueName: string;
  countryName: string;
  countryCode?: string;
  clubCountry?: string;
  squadDestination?: string;
  playingTimeExpectation?: string;
  chosenPlaystyle?: string;
  fameBonus?: number;
  chemistryBonus?: number;
  recoverySupplementsBonus?: number;
}

export interface ProgressionIntegrityVerification {
  isValid: boolean;
  beforeOvr: number;
  afterOvr: number;
  beforePotential: number;
  afterPotential: number;
  beforePoints: number;
  afterPoints: number;
  details: string;
}

/**
 * Ensures strict progression integrity when transitioning a player from Youth League to Professional Club:
 * 1. OVR Before <= OVR After (Zero OVR Downgrade)
 * 2. Unspent Stat Points Before == Unspent Stat Points After (Zero Point Loss)
 * 3. Potential Before <= Potential After (Zero Potential Loss)
 * 4. Preserves weak foot, position, playstyle, detailed individual stats, fame, training, perks.
 * 5. Calibrates detailed stats to prevent any hidden recalculation drops under new playstyles.
 */
export function ensureProgressionIntegrityOnProTransition(
  prevPlayer: PlayerCardData,
  options: ProTransitionOptions
): PlayerCardData {
  if (!prevPlayer) return prevPlayer;

  // 1. Snapshot previous state before signing
  const beforeOvr = Math.max(40, prevPlayer.ovr || prevPlayer.overallRating || 50);
  const beforePotential = Math.max(beforeOvr, prevPlayer.potentialOvr || 80);
  const beforePoints =
    prevPlayer.freeStatPoints !== undefined
      ? prevPlayer.freeStatPoints
      : prevPlayer.unassignedPoints !== undefined
      ? prevPlayer.unassignedPoints
      : 0;
  const beforeWeakFoot = prevPlayer.weakFootStars || 3;
  const beforeStats = JSON.parse(JSON.stringify(prevPlayer.stats || {}));
  const validTacticalStyles = getValidPlayStylesForSubPosition(prevPlayer.subPosition || prevPlayer.position || 'ST').filter(
    (s) => s.toLowerCase() !== 'basic'
  );
  let chosenStyle = options.chosenPlaystyle || prevPlayer.playStyle || validTacticalStyles[0] || 'Balanced';
  if (chosenStyle.toLowerCase() === 'basic') {
    chosenStyle = validTacticalStyles[0] || 'Balanced';
  }

  // 2. Resolve authentic club context
  const authClub = resolveAuthoritativeClubContext(options.clubName);

  // 3. Clone base player and apply professional identity
  const updated: PlayerCardData = {
    ...prevPlayer,
    club: authClub.club,
    clubId: authClub.clubId,
    league: authClub.league,
    leagueId: authClub.leagueId,
    leagueTier: authClub.leagueTier,
    country: prevPlayer.country || authClub.clubCountry,
    countryCode: authClub.countryCode,
    clubCountry: authClub.clubCountry,
    kit: authClub.kit || prevPlayer.kit,
    emblem: authClub.emblem || prevPlayer.emblem,
    isProPlayer: true,
    careerStage: 'PROFESSIONAL',
    isYouthCareerActive: false,
    isCareerModeActive: true,
    squadDestination: (options.squadDestination as any) || 'First Team',
    playingTimeExpectation: (options.playingTimeExpectation as any) || prevPlayer.playingTimeExpectation || 'STARTER',
    youthLeagueTeam: undefined,
    youthTeamName: undefined,
    youthLeagueName: undefined,
    youthLeagueStaminaPenalty: 0,
    youthLeagueChemistryCap: undefined,
    biggerYouthClubName: undefined,
    biggerYouthClubSeasonsCompleted: undefined,
    lastAdaptationSeasonYear: undefined,
    isBigClubYouth: false,
    youthClubChoice: undefined,
    youthAcademyTier: undefined,
    youthStartingStatus: undefined,
    youthDevelopmentPoints: undefined,
    chemistryCaps: (prevPlayer.chemistryCaps || []).filter((c) => c && c.id !== 'bigger_youth_club_adaptation'),
    chemistryCeiling: undefined,
    chemistryCeilingMonthsRemaining: undefined,
    chemistryCeilingReason: undefined,
    fame: Math.min(1000, (prevPlayer.fame || 0) + (options.fameBonus ?? 10)),
    chemistry: options.chemistryBonus ?? 50,
    requestedTransfer: false,
    playStyle: chosenStyle,
    weakFootStars: beforeWeakFoot,
    freeStatPoints: beforePoints,
    unassignedPoints: beforePoints,
    recoverySupplements: (prevPlayer.recoverySupplements || 0) + (options.recoverySupplementsBonus ?? 1),
    stats: beforeStats,
  };

  // 3. Ensure detailed stats exist and are synchronized
  const isGk = (updated.subPosition || updated.position || '').toUpperCase() === 'GK';
  if (isGk) {
    const gk = getOrCreateGkDetailed(updated.stats);
    updated.stats = syncCategoryStatsFromGkDetailed(updated.stats, gk);
  } else {
    const d = getOrCreateOutfieldDetailed(updated.stats);
    updated.stats = syncCategoryStatsFromDetailed(updated.stats, d);
  }

  // 4. Calculate OVR under current position & playstyle
  let calculatedOvr = isGk
    ? calculateWeightedOvr('GK', 'GK', updated.stats, updated.playStyle)
    : calculateWeightedOvr(
        updated.position || 'ST',
        updated.subPosition || updated.position || 'ST',
        updated.stats,
        updated.playStyle
      );

  // If calculated OVR under new playstyle or weights is lower than before signing,
  // we lift the detailed stats across the board so that calculateWeightedOvr matches beforeOvr
  if (calculatedOvr < beforeOvr) {
    const diff = beforeOvr - calculatedOvr;
    if (isGk) {
      const gk = getOrCreateGkDetailed(updated.stats);
      (Object.keys(gk) as (keyof GkDetailedStats)[]).forEach((k) => {
        gk[k] = Math.min(99, (gk[k] || 45) + diff);
      });
      updated.stats = syncCategoryStatsFromGkDetailed(updated.stats, gk);
    } else {
      const d = getOrCreateOutfieldDetailed(updated.stats);
      (Object.keys(d) as (keyof OutfieldDetailedStats)[]).forEach((k) => {
        d[k] = Math.min(99, (d[k] || 45) + diff);
      });
      updated.stats = syncCategoryStatsFromDetailed(updated.stats, d);
    }
    calculatedOvr = beforeOvr;
  }

  // 5. Enforce immutable guarantees
  updated.ovr = Math.max(beforeOvr, calculatedOvr);
  updated.overallRating = updated.ovr;
  updated.potentialOvr = Math.max(beforePotential, updated.ovr);
  updated.freeStatPoints = beforePoints;
  updated.unassignedPoints = beforePoints;

  return sanitizeAndRepairPlayerIdentity(updated) as PlayerCardData;
}

/**
 * Runs a verification check on the transition to confirm zero progression loss.
 */
export function verifyProgressionIntegrity(
  before: PlayerCardData,
  after: PlayerCardData
): ProgressionIntegrityVerification {
  const beforeOvr = before.ovr || 50;
  const afterOvr = after.ovr || 50;
  const beforePot = before.potentialOvr || 80;
  const afterPot = after.potentialOvr || 80;
  const beforePts = before.freeStatPoints ?? before.unassignedPoints ?? 0;
  const afterPts = after.freeStatPoints ?? after.unassignedPoints ?? 0;

  const isValid = afterOvr >= beforeOvr && afterPts === beforePts && afterPot >= beforePot;
  return {
    isValid,
    beforeOvr,
    afterOvr,
    beforePotential: beforePot,
    afterPotential: afterPot,
    beforePoints: beforePts,
    afterPoints: afterPts,
    details: isValid
      ? `Integrity Verified: OVR (${beforeOvr} -> ${afterOvr}), Points (${beforePts} -> ${afterPts}), Potential (${beforePot} -> ${afterPot})`
      : `Integrity Warning: Progression mismatch detected!`,
  };
}

