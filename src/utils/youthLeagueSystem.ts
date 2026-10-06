import { PlayerConfig, OutfieldDetailedStats, GkDetailedStats } from '../types';
import {
  YouthCategory,
  TrainingGroup,
  TrainingGroupDefinition,
  YouthManagerRoleProposal,
  YouthSeasonStats,
  YouthSeasonAwards,
  NewspaperArticles,
  InternationalTournamentResult,
  TournamentMatch,
} from '../types/youthLeague';
import {
  getSubPositionInfo,
  validatePlayStyleForSubPosition,
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
} from './statCalculations';
import { sanitizeAndRepairPlayerIdentity, getYouthSelectableSubPositionsForCategory } from './playerIdentitySystem';
import { simulatePlayerGoalsAndAssists } from './goalAssistSimulationModifiers';

export const TRAINING_GROUPS: TrainingGroupDefinition[] = [
  {
    id: 'PHY',
    name: 'Physical Development',
    code: 'PHY',
    stats: ['stamina', 'strength', 'pace'],
    description: 'Build physical stamina, raw power, and explosive sprint pace.',
    iconName: 'Zap',
  },
  {
    id: 'SCO',
    name: 'Goalscoring & Finishing',
    code: 'SCO',
    stats: ['heading', 'shooting', 'longShots'],
    description: 'Master clinical finishing, aerial heading power, and long-range shooting threat.',
    iconName: 'Flame',
  },
  {
    id: 'PRO',
    name: 'Technique & Progression',
    code: 'PRO',
    stats: ['dribbling', 'retention', 'ballControl'],
    description: 'Master tight-space dribbling, ball retention under pressure, and elite first touch.',
    iconName: 'Sparkles',
  },
  {
    id: 'CRE',
    name: 'Creation & Playmaking',
    code: 'CRE',
    stats: ['shortPass', 'longPass', 'crossing'],
    description: 'Sharpen vision with pinpoint short passing, visionary long passes, and whipped crossing.',
    iconName: 'Target',
  },
  {
    id: 'MEN',
    name: 'Mental & Tactical',
    code: 'MEN',
    stats: ['composure', 'positioning', 'reactions'],
    description: 'Elevate ice-cold composure, intelligent pitch positioning, and lightning reactions.',
    iconName: 'Brain',
  },
  {
    id: 'DEF',
    name: 'Defensive Fortitude',
    code: 'DEF',
    stats: ['tackling', 'marking', 'interceptions'],
    description: 'Enhance tackle timing, defensive marking discipline, and anticipatory interceptions.',
    iconName: 'Shield',
  },
];

export interface PreseasonStatAllocation {
  statKey: string;
  originalValue: number;
  pointsAdded: number;
  finalValue: number;
  isMaxed: boolean;
}

export interface PreseasonTrainingResult {
  groupId: string;
  allocations: PreseasonStatAllocation[];
  directStatPointsAdded: number;
  totalPointsGranted: number;
  isGroupCompleted: boolean;
  areAllGroupsCompleted: boolean;
  hasExtendedPreseason: boolean;
}

export function normalizeStatKey(attr: string): string {
  if (attr === 'finishing') return 'shooting';
  if (attr === 'longShooting') return 'longShots';
  if (attr === 'interception') return 'interceptions';
  if (attr === 'reaction') return 'reactions';
  return attr;
}

export function getGkStatsForGroup(groupId: string): string[] {
  switch (groupId) {
    case 'PHY':
      return ['reflexes', 'aerialReach', 'positioning'];
    case 'SCO':
      return ['saving', 'oneOnOne', 'handling'];
    case 'PRO':
      return ['distribution', 'handling', 'reflexes'];
    case 'CRE':
      return ['distribution', 'positioning', 'saving'];
    case 'MEN':
      return ['positioning', 'reflexes', 'oneOnOne'];
    case 'DEF':
      return ['handling', 'oneOnOne', 'saving'];
    default:
      return ['saving', 'reflexes', 'handling'];
  }
}

export function isTrainingGroupCompleted(player: Partial<PlayerConfig>, groupId: string): boolean {
  const isGk = (player.subPosition || player.position || '').toUpperCase() === 'GK';
  const groupDef = TRAINING_GROUPS.find((g) => g.id === groupId);
  if (!groupDef) return false;

  const stats = (player.stats || { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 }) as any;
  if (isGk) {
    const gk = getOrCreateGkDetailed(stats);
    const gkStats = getGkStatsForGroup(groupId);
    return gkStats.every((st) => ((gk[st as keyof typeof gk] as number) || 40) >= 99);
  } else {
    const d = getOrCreateOutfieldDetailed(stats);
    return groupDef.stats.every((st) => {
      const key = normalizeStatKey(st) as keyof OutfieldDetailedStats;
      return ((d[key] as number) || 40) >= 99;
    });
  }
}

export function areAllTrainingGroupsCompleted(player: Partial<PlayerConfig>): boolean {
  return TRAINING_GROUPS.every((g) => isTrainingGroupCompleted(player, g.id));
}

export function getFirstAvailableTrainingGroup(player: Partial<PlayerConfig>): TrainingGroup | null {
  const found = TRAINING_GROUPS.find((g) => !isTrainingGroupCompleted(player, g.id));
  return found ? (found.id as TrainingGroup) : null;
}

export function previewPreseasonTrainingAllocations(
  player: Partial<PlayerConfig>,
  groupId: string
): PreseasonTrainingResult {
  const isGk = (player.subPosition || player.position || '').toUpperCase() === 'GK';
  const hasExtendedPreseason =
    (player.activePerkIds || []).includes('extended_pre_season') ||
    (player as any)?.perks?.some?.((p: any) => (typeof p === 'string' ? p : p?.id) === 'extended_pre_season');

  // With extended_pre_season perk: +5 to all 3 stats = 15 points total across group.
  // Standard: +1 to all 3 stats = 3 points total across group.
  const pointsPerStat = hasExtendedPreseason ? 5 : 1;
  const totalPoints = pointsPerStat * 3; // 15 or 3
  const allCompleted = areAllTrainingGroupsCompleted(player);

  if (allCompleted) {
    return {
      groupId,
      allocations: [],
      directStatPointsAdded: totalPoints,
      totalPointsGranted: totalPoints,
      isGroupCompleted: true,
      areAllGroupsCompleted: true,
      hasExtendedPreseason,
    };
  }

  const groupDef = TRAINING_GROUPS.find((g) => g.id === groupId) || TRAINING_GROUPS[0];
  const statKeys = isGk ? getGkStatsForGroup(groupDef.id) : groupDef.stats.map(normalizeStatKey);
  const stats = (player.stats || { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 }) as any;
  const currentDetailed = isGk ? getOrCreateGkDetailed(stats) : getOrCreateOutfieldDetailed(stats);

  // Stats at 100 or >= 99 cannot receive points. Cap base value consideration at 99.
  const rawValues = statKeys.map((k) => ((currentDetailed as any)[k] as number) || 40);
  const statValues = rawValues.map((v) => Math.max(0, v));
  const groupIsCompleted = statValues.every((v) => v >= 99);

  if (groupIsCompleted) {
    return {
      groupId: groupDef.id,
      allocations: statKeys.map((k, i) => ({
        statKey: k,
        originalValue: statValues[i],
        pointsAdded: 0,
        finalValue: statValues[i],
        isMaxed: true,
      })),
      directStatPointsAdded: totalPoints,
      totalPointsGranted: totalPoints,
      isGroupCompleted: true,
      areAllGroupsCompleted: false,
      hasExtendedPreseason,
    };
  }

  const finalValues = [...statValues];
  const pointsAdded = [0, 0, 0];
  let overflowPool = 0;

  // Phase 1: Assign initial quota (5 each for extended, 1 each for standard)
  for (let i = 0; i < 3; i++) {
    // If stat is >= 99 (or 100), it takes 0 points and its full quota goes into overflow
    if (finalValues[i] >= 99) {
      overflowPool += pointsPerStat;
    } else {
      const space = 99 - finalValues[i];
      const alloc = Math.min(pointsPerStat, space);
      finalValues[i] += alloc;
      pointsAdded[i] += alloc;
      overflowPool += (pointsPerStat - alloc);
    }
  }

  // Phase 2: Redistribute overflow points among group stats that are still below 99
  while (overflowPool > 0) {
    const eligibleIndices = [0, 1, 2].filter((i) => finalValues[i] < 99);
    if (eligibleIndices.length === 0) {
      // All stats in group reached 99! Remainder becomes direct stat points
      break;
    }

    let allocatedInPass = false;
    for (const idx of eligibleIndices) {
      if (overflowPool <= 0) break;
      if (finalValues[idx] < 99) {
        finalValues[idx]++;
        pointsAdded[idx]++;
        overflowPool--;
        allocatedInPass = true;
      }
    }
    if (!allocatedInPass) break;
  }

  const directStatPoints = overflowPool;

  const allocations: PreseasonStatAllocation[] = statKeys.map((k, i) => ({
    statKey: k,
    originalValue: statValues[i],
    pointsAdded: pointsAdded[i],
    finalValue: finalValues[i],
    isMaxed: finalValues[i] >= 99,
  }));

  return {
    groupId: groupDef.id,
    allocations,
    directStatPointsAdded: directStatPoints,
    totalPointsGranted: totalPoints,
    isGroupCompleted: false,
    areAllGroupsCompleted: false,
    hasExtendedPreseason,
  };
}

export function applyPreseasonTrainingToPlayer(
  player: PlayerConfig,
  groupId: string
): { updatedPlayer: PlayerConfig; result: PreseasonTrainingResult } {
  const result = previewPreseasonTrainingAllocations(player, groupId);
  const isGk = (player.subPosition || player.position || '').toUpperCase() === 'GK';
  let updatedStats = JSON.parse(JSON.stringify(player.stats || { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 }));

  if (result.areAllGroupsCompleted) {
    const currentFree = player.freeStatPoints || player.unassignedPoints || 0;
    const nextFree = currentFree + result.directStatPointsAdded;
    return {
      updatedPlayer: {
        ...player,
        freeStatPoints: nextFree,
        unassignedPoints: nextFree,
      },
      result,
    };
  }

  if (isGk) {
    const gk = getOrCreateGkDetailed(updatedStats);
    result.allocations.forEach((alloc) => {
      const key = alloc.statKey as keyof typeof gk;
      if (typeof gk[key] === 'number') {
        gk[key] = alloc.finalValue;
      }
    });
    updatedStats = syncCategoryStatsFromGkDetailed(updatedStats, gk);
    updatedStats.gkDetailed = gk;
  } else {
    const d = getOrCreateOutfieldDetailed(updatedStats);
    result.allocations.forEach((alloc) => {
      const key = alloc.statKey as keyof typeof d;
      if (typeof d[key] === 'number') {
        d[key] = alloc.finalValue;
      }
    });
    updatedStats = syncCategoryStatsFromDetailed(updatedStats, d);
    updatedStats.detailed = d;
  }

  const calculatedOvr = isGk
    ? calculateWeightedOvr('GK', 'GK', updatedStats, player.playStyle)
    : calculateWeightedOvr(
        player.position || 'ST',
        player.subPosition || player.position || 'ST',
        updatedStats,
        player.playStyle
      );

  const currentFree = player.freeStatPoints || player.unassignedPoints || 0;
  const nextFree = currentFree + result.directStatPointsAdded;

  const updatedPlayer: PlayerConfig = {
    ...player,
    stats: updatedStats,
    ovr: calculatedOvr,
    freeStatPoints: nextFree,
    unassignedPoints: nextFree,
  };

  return {
    updatedPlayer,
    result,
  };
}

export function getCategoryByAge(age: number): YouthCategory {
  if (age <= 10) return 'U10';
  if (age === 11) return 'U11';
  if (age === 12) return 'U12';
  if (age === 13) return 'U13';
  if (age === 14) return 'U14';
  if (age === 15) return 'U15';
  return 'U16';
}

/**
 * Manager Meeting logic when player joins a new youth club
 */
export function generateManagerRoleProposal(player: PlayerConfig): YouthManagerRoleProposal {
  const sanitized = sanitizeAndRepairPlayerIdentity(player);
  const primaryPos = (sanitized.position || 'ATT') as 'ATT' | 'MID' | 'DEF' | 'GK';
  const allowedSubPositions = getYouthSelectableSubPositionsForCategory(primaryPos);

  // Random selection with equal probability from all valid sub-positions for player's Position
  const randomIndex = Math.floor(Math.random() * allowedSubPositions.length);
  const proposedSub = allowedSubPositions[randomIndex] || allowedSubPositions[0];

  const subInfo = getSubPositionInfo(proposedSub);
  const subName = subInfo?.name ? subInfo.name.split(' (')[0] : proposedSub;

  return {
    proposedPosition: primaryPos,
    subPosition: proposedSub,
    playstyle: sanitized.playStyle || 'Balanced',
    warningNote: `The manager wanted you to play as a ${subName}. If you choose another role, you may receive less playing time.`,
    allowedSubPositions,
  };
}

/**
 * Simulates youth matches for a half-season block (12 matches total)
 */
export function simulateYouthBlock(
  player: PlayerConfig,
  blockNumber: 1 | 2,
  acceptedManagerRole: boolean = true
): YouthSeasonStats {
  const ovr = player.ovr || 60;
  const stamina = player.stats?.detailed?.stamina || player.stats?.phy || 70;
  const primaryPos = player.position || 'ATT';

  // Total matches in a half-season block
  const totalMatches = 12;

  // Playtime Percentage based on Stamina & Manager Role Acceptance
  let playtimePct = 0.5;
  if (stamina >= 90) playtimePct = 0.98;
  else if (stamina >= 80) playtimePct = 0.88;
  else if (stamina >= 60) playtimePct = 0.55;
  else playtimePct = 0.35;

  if (!acceptedManagerRole) {
    playtimePct *= 0.82; // Manager penalty for rejecting recommended role
  }

  // Injury calculation: Base risk = (100 - stamina)
  const injuryRiskFactor = Math.max(5, 100 - stamina);
  const isInjured = Math.random() * 100 < injuryRiskFactor * 0.25;
  const injuryMatchesMissed = isInjured ? Math.floor(Math.random() * 4) + 2 : 0;

  const gamesPlayed = Math.max(1, Math.min(totalMatches, Math.floor(totalMatches * playtimePct) - injuryMatchesMissed));

  // Opponent team average rating (58 - 66 OVR)
  const opponentOvr = 62;

  // Performance formula: Base success = (Player OVR / Opponent OVR) * 50
  const baseSuccessPct = (ovr / opponentOvr) * 50;

  let totalGoals = 0;
  let totalAssists = 0;
  let totalRatingSum = 0;
  let cleanSheets = 0;

  for (let i = 0; i < gamesPlayed; i++) {
    // Individual match performance score
    const matchVariance = (Math.random() - 0.45) * 20;
    const performanceScore = Math.min(100, Math.max(20, baseSuccessPct + matchVariance));

    // Match Rating (5.0 to 10.0 scale)
    const matchRating = Math.min(10.0, Math.max(5.5, 6.0 + (performanceScore - 50) * 0.08));
    totalRatingSum += matchRating;

    // Goal & Assist chances based on position
    if (primaryPos === 'ATT') {
      if (Math.random() * 100 < performanceScore * 0.85) totalGoals += 1;
      if (Math.random() * 100 < performanceScore * 0.5) totalAssists += 1;
    } else if (primaryPos === 'MID') {
      if (Math.random() * 100 < performanceScore * 0.4) totalGoals += 1;
      if (Math.random() * 100 < performanceScore * 0.8) totalAssists += 1;
    } else if (primaryPos === 'DEF') {
      if (Math.random() * 100 < performanceScore * 0.15) totalGoals += 1;
      if (Math.random() * 100 < performanceScore * 0.3) totalAssists += 1;
      if (Math.random() * 100 < performanceScore * 0.7) cleanSheets += 1;
    } else {
      // GK
      if (Math.random() * 100 < performanceScore * 0.8) cleanSheets += 1;
    }
  }

  const avgRating = gamesPlayed > 0 ? parseFloat((totalRatingSum / gamesPlayed).toFixed(1)) : 6.0;

  return {
    gamesPlayed,
    goals: totalGoals,
    assists: totalAssists,
    avgRating,
    cleanSheets,
    yellowCards: Math.floor(Math.random() * 2),
    redCards: Math.random() < 0.05 ? 1 : 0,
    injuryMatchesMissed,
  };
}

/**
 * Calculates end-of-season individual awards and Fame
 */
export function calculateSeasonAwards(stats: YouthSeasonStats): YouthSeasonAwards {
  const topScorer = stats.goals >= 15;
  const topAssist = stats.assists >= 15;
  const bestPlayer = stats.avgRating >= 7.5;
  const leagueWinner = stats.avgRating >= 7.2 && stats.gamesPlayed >= 15;

  let totalFameGained = 0;
  if (topScorer) totalFameGained += 1;
  if (topAssist) totalFameGained += 1;
  if (bestPlayer) totalFameGained += 1;
  if (leagueWinner) totalFameGained += 1;

  return {
    topScorer,
    topAssist,
    bestPlayer,
    leagueWinner,
    totalFameGained,
  };
}

/**
 * Generates dynamic team and player newspaper articles
 */
export function generateNewspaperArticles(
  player: PlayerConfig,
  stats: YouthSeasonStats,
  awards: YouthSeasonAwards,
  category: YouthCategory
): NewspaperArticles {
  const name = player.name || 'Young Prospect';
  const club = player.club || 'Youth Academy';
  const age = player.age || 10;

  const teamArticle = {
    headline: `${club} ${category} Finishes a Memorable Season`,
    content: `The ${category} squad at ${club} concluded their youth campaign with striking tactical growth. Coaching staff noted high determination across all competitive fixtures.`,
    date: 'June 2026',
    category: 'team' as const,
    imageStyle: 'bg-gradient-to-br from-blue-900 to-slate-900',
  };

  let playerHeadline = `${age}-Year-Old ${name} Shows Great Promise at ${club}`;
  let playerContent = `${name} demonstrated exceptional work ethic throughout the season, recording ${stats.gamesPlayed} appearances and earning an average match rating of ${stats.avgRating}.`;

  if (awards.bestPlayer || awards.topScorer) {
    playerHeadline = `Sensational Season! ${name} Wins ${category} Player of the Year`;
    playerContent = `With a staggering ${stats.goals} goals and ${stats.assists} assists, ${name} has ignited interest from youth scouts across the region.`;
  } else if (awards.leagueWinner) {
    playerHeadline = `${name} Champions Youth League with ${club}`;
    playerContent = `A triumphant campaign ends with trophy glory as ${name} plays a vital role in ${club}'s ${category} championship victory.`;
  }

  return {
    teamArticle,
    playerArticle: {
      headline: playerHeadline,
      content: playerContent,
      date: 'June 2026',
      category: 'player' as const,
      imageStyle: 'bg-gradient-to-br from-amber-900 to-slate-900',
    },
  };
}

/**
 * Simulates early stages of International Youth Tournament (Group Stage & Quarter Final)
 */
export function simulateTournamentEarlyStages(
  player: PlayerConfig,
  age: number
): {
  matches: TournamentMatch[];
  isQuarterFinalWinner: boolean;
  qualifiedForQuarterFinal: boolean;
  quarterOpponent: { name: string; ovr: number };
  semiOpponent: { name: string; ovr: number };
  finalOpponent: { name: string; ovr: number };
  thirdPlaceOpponent: { name: string; ovr: number };
} {
  const ovr = player.ovr || 65;
  const pos = player.position || 'ATT';

  const ageDiff = Math.max(0, age - 10);
  const invitedTeams = [
    { name: `U${age} FC Barcelona`, ovr: 68 + ageDiff * 2 },
    { name: `U${age} River Plate`, ovr: 66 + ageDiff * 2 },
    { name: `U${age} Manchester City`, ovr: 67 + ageDiff * 2 },
    { name: `U${age} Paris Saint-Germain`, ovr: 65 + ageDiff * 2 },
  ];

  const matches: TournamentMatch[] = [];
  const earlyStages = ['Group Stage 1', 'Group Stage 2', 'Group Stage 3', 'Quarter Final'];

  let isQuarterFinalWinner = true;

  for (let i = 0; i < earlyStages.length; i++) {
    const stageName = earlyStages[i];
    const opp = invitedTeams[i % invitedTeams.length];

    const playerSuccessPct = (ovr / opp.ovr) * 50;
    const teamScore = Math.floor(Math.random() * 3) + (playerSuccessPct > 50 ? 1 : 0);
    const opponentScore = Math.floor(Math.random() * 3) + (playerSuccessPct < 50 ? 1 : 0);

    const factor = ovr / opp.ovr;
    const sim = simulatePlayerGoalsAndAssists(player, factor, teamScore);
    const pGoals = sim.playerGoals;
    const pAssists = sim.playerAssists;

    const pRating = parseFloat((6.5 + (teamScore - opponentScore) * 0.8 + pGoals * 1.2 + pAssists * 0.8).toFixed(1));
    const isWinner = teamScore >= opponentScore;

    if (stageName === 'Quarter Final' && !isWinner) {
      isQuarterFinalWinner = false;
    }

    matches.push({
      matchId: `int-early-${i}`,
      stageName,
      opponentName: opp.name,
      opponentOvr: opp.ovr,
      teamScore,
      opponentScore,
      playerGoals: pGoals,
      playerAssists: pAssists,
      playerRating: pRating,
      isWinner,
    });
  }

  return {
    matches,
    isQuarterFinalWinner,
    qualifiedForQuarterFinal: true,
    quarterOpponent: { name: `U${age} River Plate`, ovr: 66 + ageDiff * 2 },
    semiOpponent: { name: `U${age} Manchester City`, ovr: 68 + ageDiff * 2 },
    finalOpponent: { name: `U${age} FC Barcelona`, ovr: 70 + ageDiff * 2 },
    thirdPlaceOpponent: { name: `U${age} Paris Saint-Germain`, ovr: 66 + ageDiff * 2 },
  };
}

/**
 * Simulates International Youth Tournament (June 4 - Mid July)
 */
export function simulateInternationalTournament(
  player: PlayerConfig,
  age: number
): InternationalTournamentResult {

  const ovr = player.ovr || 65;
  const pos = player.position || 'ATT';

  // Invited elite teams (ratings increase +2 per year from base)
  const ageDiff = Math.max(0, age - 10);
  const invitedTeams = [
    { name: `U${age} FC Barcelona`, baseOvr: 68 + ageDiff * 2 },
    { name: `U${age} River Plate`, baseOvr: 66 + ageDiff * 2 },
    { name: `U${age} Manchester City`, baseOvr: 67 + ageDiff * 2 },
    { name: `U${age} Paris Saint-Germain`, baseOvr: 65 + ageDiff * 2 },
  ];

  const matches: TournamentMatch[] = [];
  const stages = ['Group Stage 1', 'Group Stage 2', 'Group Stage 3', 'Quarter Final', 'Semi Final', 'Final'];

  let currentStageIndex = 0;
  let isEliminated = false;
  let totalGoals = 0;
  let totalAssists = 0;
  let totalRatingSum = 0;

  while (currentStageIndex < stages.length && !isEliminated) {
    const stageName = stages[currentStageIndex];
    const opp = invitedTeams[currentStageIndex % invitedTeams.length];

    const playerSuccessPct = (ovr / opp.baseOvr) * 50;
    const teamScore = Math.floor(Math.random() * 3) + (playerSuccessPct > 50 ? 1 : 0);
    const opponentScore = Math.floor(Math.random() * 3) + (playerSuccessPct < 50 ? 1 : 0);

    const factor = ovr / opp.baseOvr;
    const sim = simulatePlayerGoalsAndAssists(player, factor, teamScore);
    const pGoals = sim.playerGoals;
    const pAssists = sim.playerAssists;

    totalGoals += pGoals;
    totalAssists += pAssists;

    const pRating = parseFloat((6.5 + (teamScore - opponentScore) * 0.8 + pGoals * 1.2 + pAssists * 0.8).toFixed(1));
    totalRatingSum += pRating;

    const isWinner = teamScore >= opponentScore;

    matches.push({
      matchId: `int-match-${currentStageIndex}`,
      stageName,
      opponentName: opp.name,
      opponentOvr: opp.baseOvr,
      teamScore,
      opponentScore,
      playerGoals: pGoals,
      playerAssists: pAssists,
      playerRating: pRating,
      isWinner,
    });

    if (currentStageIndex >= 3 && !isWinner) {
      isEliminated = true;
    } else {
      currentStageIndex++;
    }
  }

  const reachedFinal = matches.some((m) => m.stageName === 'Final' && m.isWinner);
  const teamFinish = reachedFinal
    ? 'Tournament Champions 🏆'
    : isEliminated
    ? `Eliminated in ${matches[matches.length - 1]?.stageName || 'Group Stage'}`
    : 'Tournament Runners-Up 🥈';

  const topScorer = totalGoals >= 4;
  const topAssist = totalAssists >= 3;
  const bestPlayer = totalRatingSum / matches.length >= 8.0;
  const winner = reachedFinal;

  let fameGained = 0;
  if (topScorer) fameGained += 5;
  if (topAssist) fameGained += 5;
  if (bestPlayer) fameGained += 5;
  if (winner) fameGained += 5;

  return {
    qualified: true,
    teamFinish,
    matches,
    awards: {
      topScorer,
      topAssist,
      bestPlayer,
      winner,
      fameGained,
    },
  };
}
