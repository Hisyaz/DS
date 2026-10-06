import { PlayerCardData, PlayerPositionSlot, PositionMasteryTier, OutfieldDetailedStats, GkDetailedStats } from '../types';
import {
  POSITION_TAXONOMY,
  calculatePlayerOvr,
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  ALL_ATTRIBUTE_KEYS,
  AttributeKey,
} from './statCalculations';

import { getLeagueDatabase } from './leagueDatabaseSystem';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';
import { isProfessionalPlayer } from './playerIdentitySystem';

export const POSITION_MASTERY_CONFIG: Record<
  PositionMasteryTier,
  {
    tier: PositionMasteryTier;
    penalty: number; // Penalty to non-physical stats (0.40, 0.30, 0.15, 0.0)
    label: string;
    title: string;
    description: string;
    upgradeCost: number; // 10 stat points
    nextTier: PositionMasteryTier | null;
  }
> = {
  I: {
    tier: 'I',
    penalty: 0.40,
    label: 'Tier I',
    title: 'Novice (40% Stat Penalty)',
    description: '40% penalty applied to all non-physical attributes. High tactical disorientation.',
    upgradeCost: 10,
    nextTier: 'II',
  },
  II: {
    tier: 'II',
    penalty: 0.30,
    label: 'Tier II',
    title: 'Adaptable (30% Stat Penalty)',
    description: '30% penalty applied to all non-physical attributes. Better positional awareness.',
    upgradeCost: 10,
    nextTier: 'III',
  },
  III: {
    tier: 'III',
    penalty: 0.15,
    label: 'Tier III',
    title: 'Proficient (15% Stat Penalty)',
    description: '15% penalty applied to all non-physical attributes. High competence.',
    upgradeCost: 10,
    nextTier: 'IV',
  },
  IV: {
    tier: 'IV',
    penalty: 0.00,
    label: 'Tier IV',
    title: 'Mastered (0% Penalty)',
    description: '0% penalty. Full natural capability at this position. Eligible to become Main Position!',
    upgradeCost: 0,
    nextTier: null,
  },
  V: {
    tier: 'V',
    penalty: 0.00,
    label: 'Tier V',
    title: 'Main Position (100% Proficiency)',
    description: 'Your native, primary position. Zero penalties and optimal tactical synergy.',
    upgradeCost: 0,
    nextTier: null,
  },
};

/**
 * Physical stats that are immune to mastery tier penalties:
 * Pace, Stamina, Strength remain at 100% efficiency.
 */
export const PHYSICAL_ATTRIBUTE_KEYS: AttributeKey[] = ['pace', 'stamina', 'strength'];

/**
 * Non-physical stats that suffer the tier penalty (40%, 30%, 15%, 0%):
 */
export const NON_PHYSICAL_ATTRIBUTE_KEYS: AttributeKey[] = ALL_ATTRIBUTE_KEYS.filter(
  (k) => !PHYSICAL_ATTRIBUTE_KEYS.includes(k)
);

/**
 * Ensures player has a properly initialized positions array with up to 5 slots.
 * Slot 1 is always the Main Position (Tier V).
 */
export function ensurePlayerPositions(player: PlayerCardData): PlayerPositionSlot[] {
  if (player.positions && Array.isArray(player.positions) && player.positions.length > 0) {
    // Ensure slot 1 is marked as main and has tier V
    return player.positions.map((slot, idx) => {
      if (idx === 0 || slot.isMain) {
        return {
          ...slot,
          slotIndex: 1,
          isMain: true,
          tier: 'V' as PositionMasteryTier,
        };
      }
      return {
        ...slot,
        slotIndex: idx + 1,
        isMain: false,
      };
    });
  }

  // Derive initial main position from player card data
  const mainPos: PlayerPositionSlot = {
    id: `pos_main_${player.id || 'player'}`,
    slotIndex: 1,
    position: player.position || 'ATT',
    subPosition: player.subPosition || player.position || 'ST',
    playStyle: (player as any).playStyle || (player as any).playstyle || 'Balanced',
    tier: 'V',
    isMain: true,
  };

  return [mainPos];
}

/**
 * Returns the effective detailed stats of a player when deployed in a specific position slot,
 * applying the mastery tier penalty (40%, 30%, 15%, 0%) to all non-physical stats.
 */
export function getPenalizedDetailedStats(
  player: PlayerCardData,
  tier: PositionMasteryTier
): OutfieldDetailedStats {
  const original = getOrCreateOutfieldDetailed(player.stats);
  const config = POSITION_MASTERY_CONFIG[tier] || POSITION_MASTERY_CONFIG.I;
  const penalty = config.penalty;

  if (penalty <= 0) {
    return { ...original };
  }

  const multiplier = 1 - penalty;
  const penalized: OutfieldDetailedStats = { ...original };

  NON_PHYSICAL_ATTRIBUTE_KEYS.forEach((key) => {
    const rawVal = original[key] ?? 40;
    penalized[key] = Math.max(1, Math.round(rawVal * multiplier));
  });

  return penalized;
}

/**
 * Calculates the exact OVR rating for any position slot of a player,
 * considering the sub-position weightings and the mastery tier penalty.
 */
export function calculatePositionSlotOvr(
  player: PlayerCardData,
  slot: PlayerPositionSlot
): number {
  const isGk = slot.subPosition === 'GK' || slot.position === 'GK';
  if (isGk) {
    const gk = getOrCreateGkDetailed(player.stats);
    const config = POSITION_MASTERY_CONFIG[slot.tier] || POSITION_MASTERY_CONFIG.I;
    const mult = 1 - config.penalty;
    // For GK, saving, handling, reflexes, etc. are scaled if penalty applies
    const avg = Object.values(gk).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(gk).length);
    return Math.max(40, Math.min(99, Math.round(avg * mult)));
  }

  const penalizedStats = getPenalizedDetailedStats(player, slot.tier);
  return calculatePlayerOvr(slot.subPosition, slot.playStyle, penalizedStats);
}

/**
 * Upgrades a position slot from its current tier to the next tier (costing 10 stat points).
 */
export function upgradePositionTier(
  player: PlayerCardData,
  slotId: string,
  cost: number = 10
): { success: boolean; updatedPlayer: PlayerCardData; message: string; newTier?: PositionMasteryTier } {
  const positions = ensurePlayerPositions(player);
  const slotIdx = positions.findIndex((s) => s.id === slotId);

  if (slotIdx === -1) {
    return { success: false, updatedPlayer: player, message: 'Position slot not found.' };
  }

  const targetSlot = positions[slotIdx];
  if (targetSlot.isMain || targetSlot.tier === 'V') {
    return { success: false, updatedPlayer: player, message: 'Main Position is already at maximum mastery (Tier V).' };
  }

  if (targetSlot.tier === 'IV') {
    return { success: false, updatedPlayer: player, message: 'This position is already fully mastered (Tier IV).' };
  }

  const availablePoints = (player.freeStatPoints || player.unassignedPoints || 0);
  if (availablePoints < cost) {
    return {
      success: false,
      updatedPlayer: player,
      message: `Not enough stat points. Upgrading to the next mastery tier requires ${cost} stat points (you have ${availablePoints}).`,
    };
  }

  const nextTier = POSITION_MASTERY_CONFIG[targetSlot.tier].nextTier;
  if (!nextTier) {
    return { success: false, updatedPlayer: player, message: 'Cannot upgrade beyond Tier IV.' };
  }

  const updatedSlot: PlayerPositionSlot = {
    ...targetSlot,
    tier: nextTier,
  };

  const updatedPositions = [...positions];
  updatedPositions[slotIdx] = updatedSlot;

  const newFreePoints = Math.max(0, (player.freeStatPoints || 0) - cost);
  const newUnassigned = Math.max(0, (player.unassignedPoints || 0) - cost);

  const updatedPlayer: PlayerCardData = {
    ...player,
    positions: updatedPositions,
    freeStatPoints: newFreePoints,
    unassignedPoints: newUnassigned,
  };

  return {
    success: true,
    updatedPlayer,
    newTier: nextTier,
    message: `Upgraded ${targetSlot.subPosition} to ${POSITION_MASTERY_CONFIG[nextTier].label} (${POSITION_MASTERY_CONFIG[nextTier].title})!`,
  };
}

/**
 * Checks compatibility rules for manager suggesting a new position:
 * - You will NEVER be asked to play as Goalkeeper.
 * - If you are an Attacker, you will NEVER be asked to play as any Defender position.
 * - If you are a Defender, you will NEVER be asked to play as any Attacker position.
 * - EXEMPTION: Fullbacks (LB, RB, LWB, RWB) CAN be asked to play as Winger (LW, RW, LM, RM) and vice-versa!
 * - Midfielders can play other midfield positions, wingers, or fullbacks/wingbacks.
 */
export function isPositionCompatibleForPlayer(
  playerCurrentPos: string,
  playerCurrentSub: string,
  targetPos: string,
  targetSub: string
): boolean {
  const pPos = (playerCurrentPos || '').toUpperCase().trim();
  const pSub = (playerCurrentSub || '').toUpperCase().trim();
  const tPos = (targetPos || '').toUpperCase().trim();
  const tSub = (targetSub || '').toUpperCase().trim();

  // Rule 1: Never Goalkeeper
  if (tPos === 'GK' || tSub === 'GK' || pPos === 'GK' || pSub === 'GK') {
    return false;
  }

  // Check fullback & winger exemption
  const isPlayerFullback = ['LB', 'RB', 'LWB', 'RWB'].includes(pSub);
  const isTargetFullback = ['LB', 'RB', 'LWB', 'RWB'].includes(tSub);
  const isPlayerWinger = ['LW', 'RW', 'LM', 'RM'].includes(pSub);
  const isTargetWinger = ['LW', 'RW', 'LM', 'RM'].includes(tSub);

  // Fullback to Winger exemption
  if (isPlayerFullback && (isTargetWinger || isTargetFullback || tSub === 'CDM' || tSub === 'CM')) {
    return true;
  }
  // Winger to Fullback exemption
  if (isPlayerWinger && (isTargetFullback || isTargetWinger || tPos === 'ATT' || tSub === 'CAM' || tSub === 'CM')) {
    return true;
  }

  // Midfield flexibility
  if (pPos === 'MID') {
    // Midfielders can play anywhere except pure CB/GK (they can play CDM, CM, CAM, LM, RM, LW, RW, and LB/RB/LWB/RWB)
    if (tSub === 'CB') return false;
    return true;
  }

  // Rule 2: Attacker never Defender
  if (pPos === 'ATT' && tPos === 'DEF') {
    return false;
  }

  // Rule 3: Defender never Attacker
  if (pPos === 'DEF' && tPos === 'ATT') {
    return false;
  }

  return true;
}

export interface ManagerPositionProposal {
  position: 'ATT' | 'MID' | 'DEF' | 'GK' | string;
  subPosition: string;
  playStyle: string;
  rivalStarName: string;
  rivalStarOvr: number;
  weakStarterName: string;
  weakStarterOvr: number;
  explanation: string;
}

/**
 * Evaluates whether the manager triggers the "Add New Position" event:
 * 1. Constraint: Advanced positions (SS, LM, RM, LWB, RWB) can ONLY be obtained through
 *    the Add New Position event after joining a professional team.
 * 2. Constraint: Maximum 5 position slots allowed (1 main + 4 additional).
 * 3. Trigger 1 (Same-position competition):
 *    Another player at the player's current position has an OVR equal to the player,
 *    or is up to 5 OVR lower (e.g. Player = 80 OVR ST, Other ST = 80, 79, 78, 77 or 76).
 * 4. Trigger 2 (Team-need opportunity):
 *    The player has higher OVR than a starter in an obtainable position.
 *    (e.g. Player = 80 OVR ST, Starters: ST=78, LW=70, RW=77 -> Manager suggests LW).
 */
export function checkManagerPositionChangeEvent(
  player: PlayerCardData,
  teamPlayers: PlayerCardData[]
): ManagerPositionProposal | null {
  // Advanced positions & Add New Position event are only available after joining a professional team
  if (!isProfessionalPlayer(player)) {
    return null;
  }

  const currentPositions = ensurePlayerPositions(player);

  // Maximum 5 position slots allowed (1 main + 4 additional)
  if (currentPositions.length >= 5) {
    return null;
  }

  const playerOvr = Math.max(40, player.ovr || player.overallRating || 70);
  const mySubPos = (player.subPosition || player.position || 'ST').toUpperCase().trim();
  const myPos = (player.position || 'ATT').toUpperCase().trim();

  // TRIGGER 1: Same-position competition
  // Another player at the player's current position has an OVR equal to the player, or is up to 5 OVR lower.
  // Example: Player = 80 OVR ST -> Other ST = 80, 79, 78, 77, or 76.
  const samePositionCompetitors = teamPlayers.filter((tp) => {
    if (!tp || tp.id === player.id || tp.name === player.name) return false;
    const tpSub = (tp.subPosition || tp.position || '').toUpperCase().trim();
    if (tpSub !== mySubPos) return false;
    const tpOvr = Math.max(40, tp.ovr || tp.overallRating || 70);
    return tpOvr <= playerOvr && tpOvr >= playerOvr - 5;
  });

  if (samePositionCompetitors.length === 0) {
    return null;
  }

  // Pick the highest-rated / closest rival in that range
  const rivalCompetitor = [...samePositionCompetitors].sort(
    (a, b) => (b.ovr || b.overallRating || 70) - (a.ovr || a.overallRating || 70)
  )[0];
  const rivalOvr = rivalCompetitor.ovr || rivalCompetitor.overallRating || playerOvr;

  // TRIGGER 2: Team-need opportunity
  // The player has higher OVR than a starter in an obtainable position.
  const existingSubPositions = new Set(
    currentPositions.map((p) => (p.subPosition || '').toUpperCase().trim())
  );

  interface CandidateNeed {
    targetPos: string;
    targetSub: string;
    targetName: string;
    starterName: string;
    starterOvr: number;
    needGap: number; // playerOvr - starterOvr (higher = bigger squad improvement)
  }

  const candidateNeeds: CandidateNeed[] = [];

  for (const cat of POSITION_TAXONOMY) {
    const targetCat = cat.category;
    for (const sub of cat.subPositions) {
      const targetSub = sub.code.toUpperCase().trim();

      // Rule 1: Never Goalkeeper
      if (targetSub === 'GK' || targetCat === 'GK' || mySubPos === 'GK' || myPos === 'GK') {
        continue;
      }

      // Must not already have this position
      if (existingSubPositions.has(targetSub)) {
        continue;
      }

      // Must be eligible to learn based on positional compatibility rules
      if (!isPositionCompatibleForPlayer(myPos, mySubPos, targetCat, targetSub)) {
        continue;
      }

      // Find players at this target position in the squad
      const playersAtPos = teamPlayers.filter(
        (tp) =>
          tp &&
          tp.id !== player.id &&
          tp.name !== player.name &&
          (tp.subPosition || tp.position || '').toUpperCase().trim() === targetSub
      );

      // Genuine team need requires an actual starter at that position in the team
      if (playersAtPos.length === 0) {
        continue;
      }

      // Highest rated player at target position is currently starting
      const starter = [...playersAtPos].sort(
        (a, b) => (b.ovr || b.overallRating || 70) - (a.ovr || a.overallRating || 70)
      )[0];
      const starterName = starter.name || `Starting ${targetSub}`;
      const starterOvr = starter.ovr || starter.overallRating || 70;

      // The player must have higher OVR than the starter in this obtainable position
      if (playerOvr > starterOvr) {
        candidateNeeds.push({
          targetPos: targetCat,
          targetSub,
          targetName: sub.name,
          starterName,
          starterOvr,
          needGap: playerOvr - starterOvr,
        });
      }
    }
  }

  // If no obtainable position benefits the squad, do not trigger
  if (candidateNeeds.length === 0) {
    return null;
  }

  // Sort candidate targets by greatest team need (highest needGap = lowest starter OVR)
  candidateNeeds.sort((a, b) => b.needGap - a.needGap);
  const bestTarget = candidateNeeds[0];
  const chosenPlayStyle = getDefaultPlayStyleForSubPos(bestTarget.targetSub);

  return {
    position: bestTarget.targetPos,
    subPosition: bestTarget.targetSub,
    playStyle: chosenPlayStyle,
    rivalStarName: rivalCompetitor.name || 'Competitor',
    rivalStarOvr: rivalOvr,
    weakStarterName: bestTarget.starterName,
    weakStarterOvr: bestTarget.starterOvr,
    explanation: `You are good enough to compete here at ${mySubPos} alongside ${rivalCompetitor.name} (${rivalOvr} OVR), but the team needs help at ${bestTarget.targetSub}. ${bestTarget.starterName} is currently starting at ${bestTarget.starterOvr} OVR, and having your quality (${playerOvr} OVR) there will significantly strengthen our squad.`,
  };
}

/**
 * Adds a new position slot to the player at Tier I (40% penalty).
 */
export function addPlayerNewPosition(
  player: PlayerCardData,
  proposal: { position: string; subPosition: string; playStyle: string }
): PlayerCardData {
  const currentPositions = ensurePlayerPositions(player);

  if (currentPositions.length >= 5) {
    return player; // Maximum 5 position slots
  }

  // Verify not duplicate
  const exists = currentPositions.some(
    (p) => p.subPosition.toUpperCase() === proposal.subPosition.toUpperCase()
  );
  if (exists) {
    return player;
  }

  const newSlot: PlayerPositionSlot = {
    id: `pos_${Date.now()}_${proposal.subPosition.toLowerCase()}`,
    slotIndex: currentPositions.length + 1,
    position: proposal.position,
    subPosition: proposal.subPosition,
    playStyle: proposal.playStyle,
    tier: 'I',
    isMain: false,
  };

  return {
    ...player,
    positions: [...currentPositions, newSlot],
  };
}

/**
 * Returns default playstyle for a given sub-position based on taxonomy.
 */
export function getDefaultPlayStyleForSubPos(subPos: string): string {
  const code = (subPos || '').toUpperCase();
  for (const cat of POSITION_TAXONOMY) {
    const found = cat.subPositions.find((sp) => sp.code === code);
    if (found && found.playStyles && found.playStyles.length > 0) {
      return found.playStyles[0];
    }
  }
  return 'Balanced';
}

/**
 * Checks if the player is eligible to switch their Main Position at end of season:
 * - Has another position at Tier IV (0% penalty).
 * - Played 80% or more of matches in that position during the season.
 * - Minimum of 5 total season matches.
 */
export function checkNaturalPositionSwitchEligibility(
  player: PlayerCardData
): PlayerPositionSlot | null {
  const positions = ensurePlayerPositions(player);
  const secondaryTierIVSlots = positions.filter((s) => !s.isMain && s.tier === 'IV');

  if (secondaryTierIVSlots.length === 0) {
    return null;
  }

  const matchCounts = player.seasonMatchesByPosition || {};
  const totalMatches =
    player.totalSeasonMatchesPlayed ||
    Object.values(matchCounts).reduce((sum, count) => sum + count, 0);

  if (totalMatches < 5) {
    return null;
  }

  for (const slot of secondaryTierIVSlots) {
    const playedAtPos = matchCounts[slot.subPosition] || 0;
    const ratio = playedAtPos / totalMatches;
    if (ratio >= 0.80) {
      return slot;
    }
  }

  return null;
}

/**
 * Switches the player's Main Position to a Tier IV secondary position.
 * The chosen position becomes Main (Tier V).
 * The previous Main becomes secondary at Tier IV.
 */
export function switchMainPosition(
  player: PlayerCardData,
  newMainSlotId: string
): PlayerCardData {
  const positions = ensurePlayerPositions(player);
  const targetSlotIdx = positions.findIndex((s) => s.id === newMainSlotId);

  if (targetSlotIdx === -1) return player;

  const targetSlot = positions[targetSlotIdx];
  const oldMainSlot = positions[0];

  const updatedPositions: PlayerPositionSlot[] = positions.map((slot) => {
    if (slot.id === targetSlot.id) {
      return {
        ...slot,
        slotIndex: 1,
        tier: 'V' as PositionMasteryTier,
        isMain: true,
      };
    }
    if (slot.isMain || slot.id === oldMainSlot.id) {
      return {
        ...slot,
        slotIndex: targetSlot.slotIndex || 2,
        tier: 'IV' as PositionMasteryTier, // Previous main becomes secondary at Tier IV
        isMain: false,
      };
    }
    return slot;
  });

  // Re-sort so that slotIndex 1 (Main) is first
  updatedPositions.sort((a, b) => (a.isMain ? -1 : b.isMain ? 1 : a.slotIndex - b.slotIndex));

  // Recalculate player OVR and attributes at the new main position
  const newOvr = calculatePlayerOvr(
    targetSlot.subPosition,
    targetSlot.playStyle,
    getOrCreateOutfieldDetailed(player.stats)
  );

  return {
    ...player,
    position: targetSlot.position,
    subPosition: targetSlot.subPosition,
    playStyle: targetSlot.playStyle,
    ovr: newOvr,
    overallRating: newOvr,
    positions: updatedPositions,
  };
}

/**
 * Records a match played by the user player in a specific sub-position.
 */
export function recordMatchPlayedAtPosition(
  player: PlayerCardData,
  subPosition: string
): PlayerCardData {
  const posMap = { ...(player.seasonMatchesByPosition || {}) };
  posMap[subPosition] = (posMap[subPosition] || 0) + 1;
  const newTotal = (player.totalSeasonMatchesPlayed || 0) + 1;

  return {
    ...player,
    seasonMatchesByPosition: posMap,
    totalSeasonMatchesPlayed: newTotal,
  };
}

/**
 * High-level evaluator that loads the player's team roster from the league database,
 * and checks if the manager should trigger the Add New Position proposal.
 */
export function evaluateManagerPositionChangeForPlayer(
  player: PlayerCardData
): ManagerPositionProposal | null {
  // Advanced positions & Add New Position event can ONLY trigger after joining a professional team
  if (!isProfessionalPlayer(player)) {
    return null;
  }

  const currentPositions = ensurePlayerPositions(player);
  if (currentPositions.length >= 5) {
    return null; // Maximum 5 position slots
  }

  // Retrieve player's team players from database
  const db = getLeagueDatabase();
  const clubName = (player.club || player.youthTeamName || '').toLowerCase().trim();
  let teamPlayers: PlayerCardData[] = [];

  for (const team of Object.values(db.teams || {})) {
    if (team.name.toLowerCase().trim() === clubName) {
      const ensured = ensureTeamSquadSaveFile(team);
      teamPlayers = (ensured.squadSaveFile?.squad || [])
        .map((s) => s.player)
        .filter((p): p is PlayerCardData => Boolean(p));
      break;
    }
  }

  const playerOvr = Math.max(40, player.ovr || player.overallRating || 70);
  const myPos = (player.position || 'ATT').toUpperCase().trim();
  const mySub = (player.subPosition || player.position || 'ST').toUpperCase().trim();

  // If no team found or small roster (<5 players), generate realistic contextual squad
  // that provides a same-position competitor (within playerOvr - 5 to playerOvr)
  // and team-need starters in obtainable positions (e.g. LW, RW, SS, LM, RM, etc.)
  if (teamPlayers.length < 5) {
    // 1. Same-position competitor (within 5 OVR of player, e.g. playerOvr - 2)
    const competitorOvr = Math.max(40, playerOvr - 2);
    const competitor: PlayerCardData = {
      id: 'contextual_same_pos_competitor',
      name: 'Julian Alvarez',
      position: myPos,
      subPosition: mySub,
      playStyle: getDefaultPlayStyleForSubPos(mySub),
      ovr: competitorOvr,
      stats: { ...player.stats },
    } as any;

    // 2. Obtainable position starters with varying OVRs to reflect realistic squad depth
    const contextualStarters: PlayerCardData[] = [];

    if (myPos === 'ATT') {
      if (mySub === 'ST') {
        contextualStarters.push(
          { id: 'starter_lw', name: 'Jérémy Doku', position: 'ATT', subPosition: 'LW', playStyle: 'Inverted', ovr: Math.max(40, playerOvr - 10), stats: { ...player.stats } } as any,
          { id: 'starter_rw', name: 'Bernardo Silva', position: 'ATT', subPosition: 'RW', playStyle: 'Prolific', ovr: Math.max(40, playerOvr - 3), stats: { ...player.stats } } as any,
          { id: 'starter_ss', name: 'Christopher Nkunku', position: 'ATT', subPosition: 'SS', playStyle: 'Shadow', ovr: Math.max(40, playerOvr - 6), stats: { ...player.stats } } as any
        );
      } else {
        contextualStarters.push(
          { id: 'starter_st', name: 'Victor Osimhen', position: 'ATT', subPosition: 'ST', playStyle: 'Finisher', ovr: Math.max(40, playerOvr - 8), stats: { ...player.stats } } as any,
          { id: 'starter_alt_winger', name: 'Jack Grealish', position: 'ATT', subPosition: mySub === 'LW' ? 'RW' : 'LW', playStyle: 'Traditional', ovr: Math.max(40, playerOvr - 4), stats: { ...player.stats } } as any,
          { id: 'starter_ss', name: 'Paulo Dybala', position: 'ATT', subPosition: 'SS', playStyle: 'Creative', ovr: Math.max(40, playerOvr - 9), stats: { ...player.stats } } as any
        );
      }
    } else if (myPos === 'MID') {
      contextualStarters.push(
        { id: 'starter_lm', name: 'Marcus Rashford', position: 'MID', subPosition: 'LM', playStyle: 'Traditional', ovr: Math.max(40, playerOvr - 10), stats: { ...player.stats } } as any,
        { id: 'starter_rm', name: 'Bukayo Saka', position: 'MID', subPosition: 'RM', playStyle: 'Inverted', ovr: Math.max(40, playerOvr - 5), stats: { ...player.stats } } as any,
        { id: 'starter_cam', name: 'Martin Ødegaard', position: 'MID', subPosition: 'CAM', playStyle: 'Playmaker', ovr: Math.max(40, playerOvr - 4), stats: { ...player.stats } } as any,
        { id: 'starter_cdm', name: 'Declan Rice', position: 'MID', subPosition: 'CDM', playStyle: 'Anchor', ovr: Math.max(40, playerOvr - 3), stats: { ...player.stats } } as any
      );
    } else {
      contextualStarters.push(
        { id: 'starter_lwb', name: 'Destiny Udogie', position: 'DEF', subPosition: 'LWB', playStyle: 'Attacking', ovr: Math.max(40, playerOvr - 9), stats: { ...player.stats } } as any,
        { id: 'starter_rwb', name: 'Pedro Porro', position: 'DEF', subPosition: 'RWB', playStyle: 'Attacking', ovr: Math.max(40, playerOvr - 6), stats: { ...player.stats } } as any,
        { id: 'starter_rb', name: 'Trent Alexander-Arnold', position: 'DEF', subPosition: 'RB', playStyle: 'Inverted', ovr: Math.max(40, playerOvr - 4), stats: { ...player.stats } } as any,
        { id: 'starter_cb', name: 'William Saliba', position: 'DEF', subPosition: 'CB', playStyle: 'Stopper', ovr: Math.max(40, playerOvr - 2), stats: { ...player.stats } } as any
      );
    }

    teamPlayers = [competitor, ...contextualStarters];
  }

  return checkManagerPositionChangeEvent(player, teamPlayers);
}
