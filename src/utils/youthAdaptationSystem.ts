import { PlayerCardData, ActiveChemistryCap } from '../types';
import { isProfessionalPlayer } from './playerIdentitySystem';

export const BIGGER_YOUTH_CLUB_CAP_ID = 'bigger_youth_club_adaptation';

export interface YouthAdaptationStatus {
  isActive: boolean;
  clubName?: string;
  seasonsCompleted: number;
  currentSeason: 1 | 2 | 0; // 1 = Year 1, 2 = Year 2, 0 = adapted/none
  staminaPenalty: number;
  chemistryCap: number | null;
}

/**
 * Checks if the player is currently under an active Bigger Youth Club adaptation.
 * Active only while:
 * 1. Player is at the specific Bigger Youth Club they joined
 * 2. Player is under age 17 (Youth League age limit)
 * 3. Player is not professional or in pro career stage
 * 4. Player has not already completed the 2-season adaptation sequence (seasonsCompleted < 2)
 */
export function isBiggerYouthClubActive(player?: Partial<PlayerCardData> | null): boolean {
  if (!player) return false;

  // 1. Age constraint: Youth League participation finishes at 17
  const currentAge = player.age || 10;
  if (currentAge >= 17) return false;

  // 2. Pro contract constraint: Pro players never have youth adaptation penalties
  if (
    player.isProPlayer === true ||
    player.isProfessional === true ||
    (player.careerStage || '').toUpperCase() === 'PROFESSIONAL' ||
    player.careerStage === 'FREE_AGENT' ||
    player.isCareerModeActive === true
  ) {
    return false;
  }

  // 3. Free agent constraint
  if (player.isFreeAgent || player.club === 'Free Agent') {
    return false;
  }

  // 4. Must be registered at the designated Bigger Youth Club
  const targetClub = player.biggerYouthClubName;
  if (!targetClub) {
    // If legacy isBigClubYouth is true but no biggerYouthClubName, check if clubChoice is big_club
    if (player.isBigClubYouth && player.youthClubChoice === 'big_club' && player.club) {
      return (player.biggerYouthClubSeasonsCompleted ?? 0) < 2;
    }
    return false;
  }

  if (player.club !== targetClub) {
    return false;
  }

  // 5. Must still have pending adaptation seasons
  const completed = player.biggerYouthClubSeasonsCompleted ?? 0;
  return completed < 2;
}

/**
 * Returns current Bigger Youth Club adaptation status and penalties.
 */
export function getBiggerYouthClubStatus(player?: Partial<PlayerCardData> | null): YouthAdaptationStatus {
  if (!isBiggerYouthClubActive(player)) {
    return {
      isActive: false,
      clubName: player?.biggerYouthClubName,
      seasonsCompleted: player?.biggerYouthClubSeasonsCompleted ?? 0,
      currentSeason: 0,
      staminaPenalty: 0,
      chemistryCap: null,
    };
  }

  const completed = player?.biggerYouthClubSeasonsCompleted ?? 0;
  if (completed === 0) {
    return {
      isActive: true,
      clubName: player?.biggerYouthClubName || player?.club,
      seasonsCompleted: 0,
      currentSeason: 1,
      staminaPenalty: -20,
      chemistryCap: 80,
    };
  } else if (completed === 1) {
    return {
      isActive: true,
      clubName: player?.biggerYouthClubName || player?.club,
      seasonsCompleted: 1,
      currentSeason: 2,
      staminaPenalty: -10,
      chemistryCap: 90,
    };
  }

  return {
    isActive: false,
    clubName: player?.biggerYouthClubName,
    seasonsCompleted: completed,
    currentSeason: 0,
    staminaPenalty: 0,
    chemistryCap: null,
  };
}

/**
 * Applies initial Bigger Youth Club state when joining the pathway:
 * - Stamina penalty: -20
 * - Chemistry cap: 80%
 * - Sets tracking attributes on player
 */
export function applyBiggerYouthClubInitialState(
  player: PlayerCardData,
  clubName: string
): PlayerCardData {
  const existingCaps = (player.chemistryCaps || []).filter((c) => c.id !== BIGGER_YOUTH_CLUB_CAP_ID);
  const adaptationCap: ActiveChemistryCap = {
    id: BIGGER_YOUTH_CLUB_CAP_ID,
    capPercent: 80,
    penaltyReduction: 20,
    monthsRemaining: 999,
    originalDurationMonths: 999,
    reason: 'Bigger Youth Club Adaptation',
  };
  const updatedCaps = [...existingCaps, adaptationCap];

  return {
    ...player,
    club: clubName,
    biggerYouthClubName: clubName,
    biggerYouthClubSeasonsCompleted: 0,
    youthLeagueStaminaPenalty: -20,
    youthLeagueChemistryCap: 80,
    isBigClubYouth: true,
    youthClubChoice: 'big_club',
    chemistry: Math.min(80, player.chemistry ?? 50),
    chemistryCaps: updatedCaps,
    chemistryCeiling: 80,
    chemistryCeilingMonthsRemaining: 999,
    chemistryCeilingReason: 'Bigger Youth Club Adaptation',
    lastAdaptationSeasonYear: undefined,
  };
}

/**
 * Determines whether an adaptation event should be triggered at Season Summary.
 * Returns 1 (Season 1 summary adaptation event) or 2 (Season 2 summary adaptation event), or null.
 */
export function getPendingAdaptationEvent(
  player?: Partial<PlayerCardData> | null,
  currentSeasonIdentifier?: string | number
): 1 | 2 | null {
  if (!isBiggerYouthClubActive(player)) return null;

  const completed = player?.biggerYouthClubSeasonsCompleted ?? 0;
  const lastSeasonId = player?.lastAdaptationSeasonYear;

  // If already triggered for this exact season identifier, avoid duplicate prompt
  if (currentSeasonIdentifier && lastSeasonId && String(currentSeasonIdentifier) === String(lastSeasonId)) {
    return null;
  }

  if (completed === 0) {
    return 1;
  }
  if (completed === 1) {
    return 2;
  }

  return null;
}

/**
 * Advances the adaptation progression at Season Summary:
 * - Event 1 (after Season 1): Reduces penalties to -10 Stamina and 90% Chemistry cap
 * - Event 2 (after Season 2): Removes all penalties (0 Stamina penalty, no Chemistry cap)
 */
export function advanceBiggerYouthClubAdaptation(
  player: PlayerCardData,
  currentSeasonIdentifier?: string | number
): {
  updatedPlayer: PlayerCardData;
  eventSeason: 1 | 2;
} {
  const completed = player.biggerYouthClubSeasonsCompleted ?? 0;
  const seasonIdStr = currentSeasonIdentifier ? String(currentSeasonIdentifier) : String(player.age || 10);

  if (completed === 0) {
    // Advancing from Season 1 to Season 2
    const existingCaps = (player.chemistryCaps || []).filter((c) => c.id !== BIGGER_YOUTH_CLUB_CAP_ID);
    const adaptationCap: ActiveChemistryCap = {
      id: BIGGER_YOUTH_CLUB_CAP_ID,
      capPercent: 90,
      penaltyReduction: 10,
      monthsRemaining: 999,
      originalDurationMonths: 999,
      reason: 'Bigger Youth Club Adaptation',
    };
    const updatedCaps = [...existingCaps, adaptationCap];
    const totalDebuff = updatedCaps.reduce((acc, c) => acc + (c.penaltyReduction || Math.max(0, 100 - c.capPercent)), 0);
    const effectiveCeiling = Math.max(0, 100 - totalDebuff);

    const updatedPlayer: PlayerCardData = {
      ...player,
      biggerYouthClubSeasonsCompleted: 1,
      youthLeagueStaminaPenalty: -10,
      youthLeagueChemistryCap: 90,
      chemistryCaps: updatedCaps,
      chemistryCeiling: effectiveCeiling,
      chemistryCeilingMonthsRemaining: 999,
      chemistryCeilingReason: 'Bigger Youth Club Adaptation',
      lastAdaptationSeasonYear: seasonIdStr,
    };

    return {
      updatedPlayer,
      eventSeason: 1,
    };
  } else {
    // Advancing from Season 2 to Fully Adapted
    const existingCaps = (player.chemistryCaps || []).filter((c) => c.id !== BIGGER_YOUTH_CLUB_CAP_ID);
    let effectiveCeiling: number | undefined = undefined;
    let ceilingMonths: number | undefined = undefined;
    let ceilingReason: string | undefined = undefined;

    if (existingCaps.length > 0) {
      const totalDebuff = existingCaps.reduce((acc, c) => acc + (c.penaltyReduction || Math.max(0, 100 - c.capPercent)), 0);
      effectiveCeiling = Math.max(0, 100 - totalDebuff);
      ceilingMonths = Math.max(...existingCaps.map((c) => c.monthsRemaining));
      ceilingReason = existingCaps.map((c) => `${c.reason} (${c.capPercent}%)`).join(' & ');
    }

    const updatedPlayer: PlayerCardData = {
      ...player,
      biggerYouthClubSeasonsCompleted: 2,
      youthLeagueStaminaPenalty: 0,
      youthLeagueChemistryCap: undefined,
      chemistryCaps: existingCaps,
      chemistryCeiling: effectiveCeiling,
      chemistryCeilingMonthsRemaining: ceilingMonths,
      chemistryCeilingReason: ceilingReason,
      lastAdaptationSeasonYear: seasonIdStr,
    };

    return {
      updatedPlayer,
      eventSeason: 2,
    };
  }
}

/**
 * Completely removes all Bigger Youth Club adaptation penalties immediately:
 * 1. Player reaches age 17 and completes Youth League participation.
 * 2. Player signs for a professional club at age 16.
 * 3. Player leaves the Bigger Youth Club and joins another team.
 * 4. Player leaves the Bigger Youth Club and becomes a free agent.
 * 5. Any other legitimate transition causes the player to leave that Bigger Youth Club.
 */
export function cleanseBiggerYouthClubPenalties(player: PlayerCardData): PlayerCardData {
  const existingCaps = (player.chemistryCaps || []).filter((c) => c.id !== BIGGER_YOUTH_CLUB_CAP_ID);
  let effectiveCeiling: number | undefined = undefined;
  let ceilingMonths: number | undefined = undefined;
  let ceilingReason: string | undefined = undefined;

  if (existingCaps.length > 0) {
    const totalDebuff = existingCaps.reduce((acc, c) => acc + (c.penaltyReduction || Math.max(0, 100 - c.capPercent)), 0);
    effectiveCeiling = Math.max(0, 100 - totalDebuff);
    ceilingMonths = Math.max(...existingCaps.map((c) => c.monthsRemaining));
    ceilingReason = existingCaps.map((c) => `${c.reason} (${c.capPercent}%)`).join(' & ');
  }

  // Only reset youthLeagueStaminaPenalty if it was a negative penalty from youth adaptation
  const safeStaminaPenalty = typeof player.youthLeagueStaminaPenalty === 'number' && player.youthLeagueStaminaPenalty < 0
    ? 0
    : player.youthLeagueStaminaPenalty ?? 0;

  return {
    ...player,
    biggerYouthClubName: undefined,
    biggerYouthClubSeasonsCompleted: undefined,
    youthLeagueStaminaPenalty: safeStaminaPenalty,
    youthLeagueChemistryCap: undefined,
    isBigClubYouth: false,
    chemistryCaps: existingCaps,
    chemistryCeiling: effectiveCeiling,
    chemistryCeilingMonthsRemaining: ceilingMonths,
    chemistryCeilingReason: ceilingReason,
    lastAdaptationSeasonYear: undefined,
  };
}
