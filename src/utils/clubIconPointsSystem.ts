import { PlayerCardData } from '../types';

export type ClubStatusTier = 'Standard' | 'Club Hero' | 'Club Icon' | 'Club Legend';

export interface ClubIconPointBreakdown {
  clubName: string;
  totalPoints: number;
  status: ClubStatusTier;
  seasonsCompleted: number;
  seasonsPoints: number;
  leagueTrophiesPoints: number;
  continentalTrophiesPoints: number;
  historyLog: {
    year: string | number;
    reason: string;
    points: number;
  }[];
}

export interface ClubStatusInfo {
  status: ClubStatusTier;
  badge: string;
  title: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  isHero: boolean;
  isIcon: boolean;
  isLegend: boolean;
  specialReceptionMessage?: string;
}

export const CLUB_STATUS_CONFIG: Record<
  ClubStatusTier,
  {
    minPoints: number;
    badge: string;
    title: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  Standard: {
    minPoints: 0,
    badge: '⚽',
    title: 'Squad Member',
    colorClass: 'text-slate-400',
    bgClass: 'bg-slate-800/80',
    borderClass: 'border-slate-700',
  },
  'Club Hero': {
    minPoints: 100,
    badge: '🛡️',
    title: 'Club Hero',
    colorClass: 'text-sky-300',
    bgClass: 'bg-sky-950/80',
    borderClass: 'border-sky-400',
  },
  'Club Icon': {
    minPoints: 200,
    badge: '⭐',
    title: 'Club Icon',
    colorClass: 'text-amber-300',
    bgClass: 'bg-amber-950/80',
    borderClass: 'border-amber-400',
  },
  'Club Legend': {
    minPoints: 300,
    badge: '👑',
    title: 'Club Legend',
    colorClass: 'text-yellow-200',
    bgClass: 'bg-gradient-to-r from-amber-900/90 via-yellow-950/90 to-amber-900/90',
    borderClass: 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.35)]',
  },
};

/**
 * Calculates the club status for a given Icon Points total.
 */
export function getClubStatusFromPoints(points: number = 0): ClubStatusInfo {
  let status: ClubStatusTier = 'Standard';
  if (points >= 300) {
    status = 'Club Legend';
  } else if (points >= 200) {
    status = 'Club Icon';
  } else if (points >= 100) {
    status = 'Club Hero';
  }

  const cfg = CLUB_STATUS_CONFIG[status];
  const isHero = points >= 100 && points < 200;
  const isIcon = points >= 200 && points < 300;
  const isLegend = points >= 300;

  let specialReceptionMessage: string | undefined;
  if (isLegend) {
    specialReceptionMessage =
      '👑 CLUB LEGEND RETURN: The entire stadium rises in a thunderous standing ovation as the immortal hero steps back onto familiar turf!';
  } else if (isIcon) {
    specialReceptionMessage =
      '⭐ ICONIC WELCOME: The supporters erupt with beloved chants honoring the return of an established club idol!';
  }

  return {
    status,
    badge: cfg.badge,
    title: cfg.title,
    colorClass: cfg.colorClass,
    bgClass: cfg.bgClass,
    borderClass: cfg.borderClass,
    isHero,
    isIcon,
    isLegend,
    specialReceptionMessage,
  };
}

/**
 * Computes League Trophy Icon Points based on league tier:
 * Tier 1: +10
 * Tier 2: +20
 * Tier 3: +40
 * Tier 4: +100
 * Tier 5: +200
 */
export function getLeagueTrophyIconPoints(leagueTier: number = 1): number {
  if (leagueTier >= 5) return 200;
  if (leagueTier === 4) return 100;
  if (leagueTier === 3) return 40;
  if (leagueTier === 2) return 20;
  return 10; // Tier 1
}

/**
 * Computes Champions League / Libertadores (or regional tier 1 continental) Icon Points based on club tier:
 * Tier 1: +20
 * Tier 2: +40
 * Tier 3: +50
 * Tier 4–5: +100
 */
export function getContinentalTrophyIconPoints(clubOrLeagueTier: number = 1): number {
  if (clubOrLeagueTier >= 4) return 100;
  if (clubOrLeagueTier === 3) return 50;
  if (clubOrLeagueTier === 2) return 40;
  return 20; // Tier 1
}

/**
 * Authoritatively adds Icon Points for a club upon season completion or trophy triumph.
 * Ensures points are permanent and never reset.
 */
export function awardClubIconPoints(
  player: PlayerCardData,
  clubName: string,
  params: {
    completedSeason?: boolean;
    wonLeague?: boolean;
    leagueTier?: number;
    wonContinental?: boolean;
    clubTier?: number;
    customPoints?: number;
    reason?: string;
  }
): {
  updatedPlayer: PlayerCardData;
  pointsAdded: number;
  previousPoints: number;
  newTotalPoints: number;
  previousStatus: ClubStatusTier;
  newStatus: ClubStatusTier;
  statusPromoted: boolean;
} {
  const normClub = clubName || player.club || 'Current Club';
  const existingMap: Record<string, number> = { ...(player.clubIconPoints || {}) };
  const previousPoints = existingMap[normClub] || 0;

  let pointsToAdd = 0;

  if (params.completedSeason) {
    pointsToAdd += 10; // +10 per completed season
  }

  if (params.wonLeague) {
    pointsToAdd += getLeagueTrophyIconPoints(params.leagueTier || 1);
  }

  if (params.wonContinental) {
    pointsToAdd += getContinentalTrophyIconPoints(params.clubTier || params.leagueTier || 1);
  }

  if (params.customPoints) {
    pointsToAdd += params.customPoints;
  }

  const newTotalPoints = previousPoints + pointsToAdd;
  existingMap[normClub] = newTotalPoints;

  const previousStatus = getClubStatusFromPoints(previousPoints).status;
  const newStatus = getClubStatusFromPoints(newTotalPoints).status;
  const statusPromoted = previousStatus !== newStatus && newTotalPoints > previousPoints;

  const updatedPlayer: PlayerCardData = {
    ...player,
    clubIconPoints: existingMap,
  };

  return {
    updatedPlayer,
    pointsAdded: pointsToAdd,
    previousPoints,
    newTotalPoints,
    previousStatus,
    newStatus,
    statusPromoted,
  };
}

/**
 * Checks if the player is recognized as a Club Legend (300+ pts) at the given club.
 */
export function isClubLegendAt(player: PlayerCardData, clubName?: string): boolean {
  if (!clubName) clubName = player.club;
  if (!clubName) return false;
  const pts = player.clubIconPoints?.[clubName] || 0;
  return pts >= 300;
}

/**
 * Returns the current Icon Points for the player's active club.
 */
export function getActiveClubIconPoints(player: PlayerCardData): number {
  const club = player.club || '';
  if (!club) return 0;
  return player.clubIconPoints?.[club] || 0;
}

/**
 * Calculates total accumulated Global Icon Points across all clubs the player has represented.
 */
export function calculateAccumulatedGlobalIconPoints(player: PlayerCardData): number {
  const map = player.clubIconPoints || {};
  let total = 0;
  for (const key of Object.keys(map)) {
    total += map[key] || 0;
  }
  return total;
}

/**
 * Retrieves the stored Global Icon Points total from localStorage or player data.
 */
export function getStoredGlobalIconPoints(player?: PlayerCardData): number {
  let stored = 0;
  try {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('global_icon_points_total');
      if (val) {
        stored = parseInt(val, 10) || 0;
      }
    }
  } catch (e) {
    console.warn('Storage access blocked:', e);
  }

  if (player?.globalIconPoints) {
    stored = Math.max(stored, player.globalIconPoints);
  }

  if (player?.clubIconPoints) {
    const currentCareerTotal = calculateAccumulatedGlobalIconPoints(player);
    stored = Math.max(stored, currentCareerTotal);
  }

  return stored;
}

/**
 * Finalizes and saves career-end Global Icon Points upon retirement / career conclusion.
 */
export function finalizeCareerEndGlobalIconPoints(player: PlayerCardData): {
  accumulatedFromCareer: number;
  newGlobalTotal: number;
} {
  const careerPoints = calculateAccumulatedGlobalIconPoints(player);
  const previousGlobal = getStoredGlobalIconPoints();
  const newGlobalTotal = previousGlobal + careerPoints;

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('global_icon_points_total', String(newGlobalTotal));
    }
  } catch (e) {
    console.warn('Storage access blocked:', e);
  }

  return {
    accumulatedFromCareer: careerPoints,
    newGlobalTotal,
  };
}
