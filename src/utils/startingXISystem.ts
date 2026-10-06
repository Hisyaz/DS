import { EditorTeamData, FormationType, PlayerRolePosition, SquadSlot, SquadGroupKey } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import { ensureTeamSquadSaveFile, SQUAD_GROUP_LIMITS } from './squadSaveFileSystem';
import { normalizePositionTaxonomy } from './goalAssistSimulationModifiers';
import { getFitnessPercentage } from './staminaInjurySystem';
import { ensurePlayerPositions, calculatePositionSlotOvr } from './positionMasterySystem';

export interface StartingXIPositionSlot {
  slotIndex: number; // 1 to 11
  role: PlayerRolePosition;
  roleLabel: string;
  category: 'GK' | 'DEF' | 'MID' | 'ATT';
  xPercent: number; // 0 to 100 (left to right)
  yPercent: number; // 0 to 100 (top attackers to bottom GK)
}

export interface SubstitutePositionSlot {
  slotNumber: number; // 12 to 18
  subIndex: number; // 1 to 7
  suggestedCategory: 'GK' | 'DEF' | 'MID' | 'ATT';
  suggestedRole: string;
}

/**
 * Tactical Formation slot coordinates and positional definitions for the 11 Starting XI spots.
 */
export const FORMATION_STARTING_XI_SLOTS: Record<FormationType, StartingXIPositionSlot[]> = {
  '4-3-3': [
    { slotIndex: 1, role: 'GK', roleLabel: 'Goalkeeper', category: 'GK', xPercent: 50, yPercent: 90 },
    { slotIndex: 2, role: 'LB', roleLabel: 'Left Back', category: 'DEF', xPercent: 15, yPercent: 72 },
    { slotIndex: 3, role: 'CB', roleLabel: 'Left Center Back', category: 'DEF', xPercent: 38, yPercent: 75 },
    { slotIndex: 4, role: 'CB', roleLabel: 'Right Center Back', category: 'DEF', xPercent: 62, yPercent: 75 },
    { slotIndex: 5, role: 'RB', roleLabel: 'Right Back', category: 'DEF', xPercent: 85, yPercent: 72 },
    { slotIndex: 6, role: 'CDM', roleLabel: 'Defensive Midfielder', category: 'MID', xPercent: 50, yPercent: 54 },
    { slotIndex: 7, role: 'CM', roleLabel: 'Left Central Mid', category: 'MID', xPercent: 30, yPercent: 44 },
    { slotIndex: 8, role: 'CAM', roleLabel: 'Right Central / Attacking Mid', category: 'MID', xPercent: 70, yPercent: 44 },
    { slotIndex: 9, role: 'LW', roleLabel: 'Left Winger', category: 'ATT', xPercent: 18, yPercent: 20 },
    { slotIndex: 10, role: 'ST', roleLabel: 'Striker / Center Forward', category: 'ATT', xPercent: 50, yPercent: 14 },
    { slotIndex: 11, role: 'RW', roleLabel: 'Right Winger', category: 'ATT', xPercent: 82, yPercent: 20 },
  ],
  '4-2-3-1': [
    { slotIndex: 1, role: 'GK', roleLabel: 'Goalkeeper', category: 'GK', xPercent: 50, yPercent: 90 },
    { slotIndex: 2, role: 'LB', roleLabel: 'Left Back', category: 'DEF', xPercent: 15, yPercent: 72 },
    { slotIndex: 3, role: 'CB', roleLabel: 'Left Center Back', category: 'DEF', xPercent: 38, yPercent: 75 },
    { slotIndex: 4, role: 'CB', roleLabel: 'Right Center Back', category: 'DEF', xPercent: 62, yPercent: 75 },
    { slotIndex: 5, role: 'RB', roleLabel: 'Right Back', category: 'DEF', xPercent: 85, yPercent: 72 },
    { slotIndex: 6, role: 'CDM', roleLabel: 'Left Holding Mid', category: 'MID', xPercent: 35, yPercent: 56 },
    { slotIndex: 7, role: 'CDM', roleLabel: 'Right Holding Mid', category: 'MID', xPercent: 65, yPercent: 56 },
    { slotIndex: 8, role: 'CAM', roleLabel: 'Attacking Midfielder', category: 'MID', xPercent: 50, yPercent: 36 },
    { slotIndex: 9, role: 'LW', roleLabel: 'Left Attacking Winger', category: 'ATT', xPercent: 18, yPercent: 32 },
    { slotIndex: 10, role: 'RW', roleLabel: 'Right Attacking Winger', category: 'ATT', xPercent: 82, yPercent: 32 },
    { slotIndex: 11, role: 'ST', roleLabel: 'Center Forward', category: 'ATT', xPercent: 50, yPercent: 14 },
  ],
  '4-4-2': [
    { slotIndex: 1, role: 'GK', roleLabel: 'Goalkeeper', category: 'GK', xPercent: 50, yPercent: 90 },
    { slotIndex: 2, role: 'LB', roleLabel: 'Left Back', category: 'DEF', xPercent: 15, yPercent: 72 },
    { slotIndex: 3, role: 'CB', roleLabel: 'Left Center Back', category: 'DEF', xPercent: 38, yPercent: 75 },
    { slotIndex: 4, role: 'CB', roleLabel: 'Right Center Back', category: 'DEF', xPercent: 62, yPercent: 75 },
    { slotIndex: 5, role: 'RB', roleLabel: 'Right Back', category: 'DEF', xPercent: 85, yPercent: 72 },
    { slotIndex: 6, role: 'CM', roleLabel: 'Left Wide Midfielder', category: 'MID', xPercent: 16, yPercent: 46 },
    { slotIndex: 7, role: 'CM', roleLabel: 'Left Central Mid', category: 'MID', xPercent: 38, yPercent: 50 },
    { slotIndex: 8, role: 'CM', roleLabel: 'Right Central Mid', category: 'MID', xPercent: 62, yPercent: 50 },
    { slotIndex: 9, role: 'CM', roleLabel: 'Right Wide Midfielder', category: 'MID', xPercent: 84, yPercent: 46 },
    { slotIndex: 10, role: 'ST', roleLabel: 'Left Striker', category: 'ATT', xPercent: 36, yPercent: 18 },
    { slotIndex: 11, role: 'ST', roleLabel: 'Right Striker', category: 'ATT', xPercent: 64, yPercent: 18 },
  ],
  '3-4-3': [
    { slotIndex: 1, role: 'GK', roleLabel: 'Goalkeeper', category: 'GK', xPercent: 50, yPercent: 90 },
    { slotIndex: 2, role: 'CB', roleLabel: 'Left Center Back', category: 'DEF', xPercent: 25, yPercent: 75 },
    { slotIndex: 3, role: 'CB', roleLabel: 'Central Sweeper / CB', category: 'DEF', xPercent: 50, yPercent: 77 },
    { slotIndex: 4, role: 'CB', roleLabel: 'Right Center Back', category: 'DEF', xPercent: 75, yPercent: 75 },
    { slotIndex: 5, role: 'LM', roleLabel: 'Left Wing-Back / LM', category: 'MID', xPercent: 14, yPercent: 48 },
    { slotIndex: 6, role: 'CM', roleLabel: 'Left Central Mid', category: 'MID', xPercent: 38, yPercent: 52 },
    { slotIndex: 7, role: 'CM', roleLabel: 'Right Central Mid', category: 'MID', xPercent: 62, yPercent: 52 },
    { slotIndex: 8, role: 'RM', roleLabel: 'Right Wing-Back / RM', category: 'MID', xPercent: 86, yPercent: 48 },
    { slotIndex: 9, role: 'LW', roleLabel: 'Left Forward', category: 'ATT', xPercent: 20, yPercent: 20 },
    { slotIndex: 10, role: 'ST', roleLabel: 'Center Forward', category: 'ATT', xPercent: 50, yPercent: 14 },
    { slotIndex: 11, role: 'RW', roleLabel: 'Right Forward', category: 'ATT', xPercent: 80, yPercent: 20 },
  ],
  '3-5-2': [
    { slotIndex: 1, role: 'GK', roleLabel: 'Goalkeeper', category: 'GK', xPercent: 50, yPercent: 90 },
    { slotIndex: 2, role: 'CB', roleLabel: 'Left Center Back', category: 'DEF', xPercent: 25, yPercent: 75 },
    { slotIndex: 3, role: 'CB', roleLabel: 'Central Sweeper / CB', category: 'DEF', xPercent: 50, yPercent: 77 },
    { slotIndex: 4, role: 'CB', roleLabel: 'Right Center Back', category: 'DEF', xPercent: 75, yPercent: 75 },
    { slotIndex: 5, role: 'LM', roleLabel: 'Left Wing Back', category: 'MID', xPercent: 14, yPercent: 48 },
    { slotIndex: 6, role: 'CDM', roleLabel: 'Anchor / CDM', category: 'MID', xPercent: 50, yPercent: 58 },
    { slotIndex: 7, role: 'CM', roleLabel: 'Central Midfielder', category: 'MID', xPercent: 36, yPercent: 44 },
    { slotIndex: 8, role: 'CAM', roleLabel: 'Attacking Midfielder', category: 'MID', xPercent: 64, yPercent: 44 },
    { slotIndex: 9, role: 'RM', roleLabel: 'Right Wing Back', category: 'MID', xPercent: 86, yPercent: 48 },
    { slotIndex: 10, role: 'ST', roleLabel: 'Left Striker', category: 'ATT', xPercent: 36, yPercent: 18 },
    { slotIndex: 11, role: 'ST', roleLabel: 'Right Striker', category: 'ATT', xPercent: 64, yPercent: 18 },
  ],
  '3-4-1-2': [
    { slotIndex: 1, role: 'GK', roleLabel: 'Goalkeeper', category: 'GK', xPercent: 50, yPercent: 90 },
    { slotIndex: 2, role: 'CB', roleLabel: 'Left Center Back', category: 'DEF', xPercent: 25, yPercent: 75 },
    { slotIndex: 3, role: 'CB', roleLabel: 'Center Back', category: 'DEF', xPercent: 50, yPercent: 77 },
    { slotIndex: 4, role: 'CB', roleLabel: 'Right Center Back', category: 'DEF', xPercent: 75, yPercent: 75 },
    { slotIndex: 5, role: 'LM', roleLabel: 'Left Midfielder', category: 'MID', xPercent: 15, yPercent: 50 },
    { slotIndex: 6, role: 'CM', roleLabel: 'Central Midfielder', category: 'MID', xPercent: 38, yPercent: 54 },
    { slotIndex: 7, role: 'CM', roleLabel: 'Central Midfielder', category: 'MID', xPercent: 62, yPercent: 54 },
    { slotIndex: 8, role: 'RM', roleLabel: 'Right Midfielder', category: 'MID', xPercent: 85, yPercent: 50 },
    { slotIndex: 9, role: 'CAM', roleLabel: 'Playmaker / CAM', category: 'MID', xPercent: 50, yPercent: 34 },
    { slotIndex: 10, role: 'ST', roleLabel: 'Left Striker', category: 'ATT', xPercent: 36, yPercent: 16 },
    { slotIndex: 11, role: 'ST', roleLabel: 'Right Striker', category: 'ATT', xPercent: 64, yPercent: 16 },
  ],
  '3-4-2-1': [
    { slotIndex: 1, role: 'GK', roleLabel: 'Goalkeeper', category: 'GK', xPercent: 50, yPercent: 90 },
    { slotIndex: 2, role: 'CB', roleLabel: 'Left Center Back', category: 'DEF', xPercent: 25, yPercent: 75 },
    { slotIndex: 3, role: 'CB', roleLabel: 'Center Back', category: 'DEF', xPercent: 50, yPercent: 77 },
    { slotIndex: 4, role: 'CB', roleLabel: 'Right Center Back', category: 'DEF', xPercent: 75, yPercent: 75 },
    { slotIndex: 5, role: 'LM', roleLabel: 'Left Wing-Back', category: 'MID', xPercent: 15, yPercent: 52 },
    { slotIndex: 6, role: 'CM', roleLabel: 'Central Midfielder', category: 'MID', xPercent: 38, yPercent: 56 },
    { slotIndex: 7, role: 'CM', roleLabel: 'Central Midfielder', category: 'MID', xPercent: 62, yPercent: 56 },
    { slotIndex: 8, role: 'RM', roleLabel: 'Right Wing-Back', category: 'MID', xPercent: 85, yPercent: 52 },
    { slotIndex: 9, role: 'CAM', roleLabel: 'Left Attacking Mid', category: 'MID', xPercent: 32, yPercent: 32 },
    { slotIndex: 10, role: 'CAM', roleLabel: 'Right Attacking Mid', category: 'MID', xPercent: 68, yPercent: 32 },
    { slotIndex: 11, role: 'ST', roleLabel: 'Solo Striker', category: 'ATT', xPercent: 50, yPercent: 14 },
  ],
  '5-3-2': [
    { slotIndex: 1, role: 'GK', roleLabel: 'Goalkeeper', category: 'GK', xPercent: 50, yPercent: 90 },
    { slotIndex: 2, role: 'LB', roleLabel: 'Left Wing-Back', category: 'DEF', xPercent: 12, yPercent: 68 },
    { slotIndex: 3, role: 'CB', roleLabel: 'Left Center Back', category: 'DEF', xPercent: 32, yPercent: 76 },
    { slotIndex: 4, role: 'CB', roleLabel: 'Central Sweeper', category: 'DEF', xPercent: 50, yPercent: 78 },
    { slotIndex: 5, role: 'CB', roleLabel: 'Right Center Back', category: 'DEF', xPercent: 68, yPercent: 76 },
    { slotIndex: 6, role: 'RB', roleLabel: 'Right Wing-Back', category: 'DEF', xPercent: 88, yPercent: 68 },
    { slotIndex: 7, role: 'CM', roleLabel: 'Left Central Mid', category: 'MID', xPercent: 30, yPercent: 48 },
    { slotIndex: 8, role: 'CDM', roleLabel: 'Holding Midfielder', category: 'MID', xPercent: 50, yPercent: 52 },
    { slotIndex: 9, role: 'CM', roleLabel: 'Right Central Mid', category: 'MID', xPercent: 70, yPercent: 48 },
    { slotIndex: 10, role: 'ST', roleLabel: 'Left Striker', category: 'ATT', xPercent: 36, yPercent: 18 },
    { slotIndex: 11, role: 'ST', roleLabel: 'Right Striker', category: 'ATT', xPercent: 64, yPercent: 18 },
  ],
  '5-4-1': [
    { slotIndex: 1, role: 'GK', roleLabel: 'Goalkeeper', category: 'GK', xPercent: 50, yPercent: 90 },
    { slotIndex: 2, role: 'LB', roleLabel: 'Left Wing-Back', category: 'DEF', xPercent: 12, yPercent: 68 },
    { slotIndex: 3, role: 'CB', roleLabel: 'Left Center Back', category: 'DEF', xPercent: 32, yPercent: 76 },
    { slotIndex: 4, role: 'CB', roleLabel: 'Center Back', category: 'DEF', xPercent: 50, yPercent: 78 },
    { slotIndex: 5, role: 'CB', roleLabel: 'Right Center Back', category: 'DEF', xPercent: 68, yPercent: 76 },
    { slotIndex: 6, role: 'RB', roleLabel: 'Right Wing-Back', category: 'DEF', xPercent: 88, yPercent: 68 },
    { slotIndex: 7, role: 'LM', roleLabel: 'Left Midfielder', category: 'MID', xPercent: 16, yPercent: 42 },
    { slotIndex: 8, role: 'CM', roleLabel: 'Left Central Mid', category: 'MID', xPercent: 38, yPercent: 48 },
    { slotIndex: 9, role: 'CM', roleLabel: 'Right Central Mid', category: 'MID', xPercent: 62, yPercent: 48 },
    { slotIndex: 10, role: 'RM', roleLabel: 'Right Midfielder', category: 'MID', xPercent: 84, yPercent: 42 },
    { slotIndex: 11, role: 'ST', roleLabel: 'Target Striker', category: 'ATT', xPercent: 50, yPercent: 16 },
  ],
};

/**
 * 7 Standard Bench Substitutes Slots (Slots 12 to 18)
 */
export const BENCH_SUBSTITUTE_SLOTS: SubstitutePositionSlot[] = [
  { slotNumber: 12, subIndex: 1, suggestedCategory: 'GK', suggestedRole: 'SUB GK (Backup Goalkeeper)' },
  { slotNumber: 13, subIndex: 2, suggestedCategory: 'DEF', suggestedRole: 'SUB DEF (Backup Center-Back / Fullback)' },
  { slotNumber: 14, subIndex: 3, suggestedCategory: 'DEF', suggestedRole: 'SUB DEF (Backup Fullback / Wing-Back)' },
  { slotNumber: 15, subIndex: 4, suggestedCategory: 'MID', suggestedRole: 'SUB MID (Backup Central / Defensive Mid)' },
  { slotNumber: 16, subIndex: 5, suggestedCategory: 'MID', suggestedRole: 'SUB MID (Backup Attacking Mid / Playmaker)' },
  { slotNumber: 17, subIndex: 6, suggestedCategory: 'ATT', suggestedRole: 'SUB ATT (Backup Striker / Center Forward)' },
  { slotNumber: 18, subIndex: 7, suggestedCategory: 'ATT', suggestedRole: 'SUB ATT (Backup Winger / Forward)' },
];

/**
 * Categorizes a player into GK, DEF, MID, or ATT based on their position/subPosition.
 */
export function getPlayerBroadCategory(player: PlayerCardData): 'GK' | 'DEF' | 'MID' | 'ATT' {
  const { primaryPos, subPos } = normalizePositionTaxonomy(player.position, player.subPosition);
  if (subPos === 'GK' || primaryPos === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(subPos) || primaryPos === 'DEF') return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(subPos) || primaryPos === 'MID') return 'MID';
  return 'ATT';
}

/**
 * Retrieves the organized Starting XI (slots 1-11), 7 Substitutes (slots 12-18), and Reserves (slots 19+).
 */
export function getStartingXIAndSubs(team: EditorTeamData): {
  starters: SquadSlot[];
  substitutes: SquadSlot[];
  reserves: SquadSlot[];
  allActivePlayers: PlayerCardData[];
} {
  const ensured = ensureTeamSquadSaveFile(team);
  const mainSquadSlots = ensured.squadSaveFile?.squad || [];

  const starters: SquadSlot[] = [];
  const substitutes: SquadSlot[] = [];
  const reserves: SquadSlot[] = [];
  const allActivePlayers: PlayerCardData[] = [];

  mainSquadSlots.forEach((slot) => {
    if (slot.player) {
      allActivePlayers.push(slot.player);
    }
    if (slot.slotNumber >= 1 && slot.slotNumber <= 11) {
      starters.push(slot);
    } else if (slot.slotNumber >= 12 && slot.slotNumber <= 18) {
      substitutes.push(slot);
    } else {
      reserves.push(slot);
    }
  });

  return { starters, substitutes, reserves, allActivePlayers };
}

/**
 * Calculates a suitability score for a player in a target tactical position.
 */
function calculatePositionSuitability(
  player: PlayerCardData,
  targetRole: PlayerRolePosition,
  targetCategory: 'GK' | 'DEF' | 'MID' | 'ATT'
): number {
  const playerPositions = ensurePlayerPositions(player);
  let bestScore = -999999;

  for (const slot of playerPositions) {
    const slotSub = (slot.subPosition || '').toUpperCase().trim();
    const slotCategory = (slot.position || getPlayerBroadCategory(player)).toUpperCase().trim();
    // Calculate effective OVR considering the slot's mastery tier penalty
    const effectiveOvr = calculatePositionSlotOvr(player, slot);

    // Strict goalkeeper isolation
    if (targetCategory === 'GK') {
      if (slotCategory === 'GK' || slotSub === 'GK') {
        const score = 10000 + effectiveOvr * 10;
        if (score > bestScore) bestScore = score;
      }
      continue;
    }
    if (slotCategory === 'GK' || slotSub === 'GK') {
      continue; // Goalkeepers never outfield
    }

    let score = effectiveOvr * 10;

    // Exact subPosition match
    if (slotSub === targetRole.toUpperCase()) {
      score += 80;
    } else if (
      (targetRole === 'LB' && (slotSub === 'LWB' || slotSub === 'RB')) ||
      (targetRole === 'RB' && (slotSub === 'RWB' || slotSub === 'LB')) ||
      (targetRole === 'LWB' && (slotSub === 'LB' || slotSub === 'LM' || slotSub === 'LW')) ||
      (targetRole === 'RWB' && (slotSub === 'RB' || slotSub === 'RM' || slotSub === 'RW')) ||
      (targetRole === 'ST' && (slotSub === 'CF' || slotSub === 'SS' || slotSub === 'LW' || slotSub === 'RW')) ||
      (targetRole === 'SS' && (slotSub === 'ST' || slotSub === 'CF' || slotSub === 'CAM' || slotSub === 'LW' || slotSub === 'RW')) ||
      (targetRole === 'LW' && (slotSub === 'LM' || slotSub === 'ST' || slotSub === 'CF' || slotSub === 'SS')) ||
      (targetRole === 'RW' && (slotSub === 'RM' || slotSub === 'ST' || slotSub === 'CF' || slotSub === 'SS')) ||
      (targetRole === 'LM' && (slotSub === 'LW' || slotSub === 'LWB' || slotSub === 'CM' || slotSub === 'CAM')) ||
      (targetRole === 'RM' && (slotSub === 'RW' || slotSub === 'RWB' || slotSub === 'CM' || slotSub === 'CAM')) ||
      (targetRole === 'CAM' && (slotSub === 'CM' || slotSub === 'SS' || slotSub === 'LM' || slotSub === 'RM')) ||
      (targetRole === 'CDM' && (slotSub === 'CM' || slotSub === 'CB')) ||
      (targetRole === 'CM' && (slotSub === 'CAM' || slotSub === 'CDM' || slotSub === 'LM' || slotSub === 'RM'))
    ) {
      score += 45;
    } else if (slotCategory === targetCategory) {
      score += 25;
    } else {
      score -= 300;
    }

    if (score > bestScore) {
      bestScore = score;
    }
  }

  if (targetCategory === 'GK' && bestScore < 0) return -100000;
  return bestScore;
}

/**
 * Auto-Picks the Best Starting XI and 7 Bench Substitutes for a team based on its formation and roster.
 * Allocates the top player for each of the 11 positions, the top 7 bench substitutes, and places the rest in reserves.
 */
export function autoPickBestStartingXIAndSubs(team: EditorTeamData): EditorTeamData {
  const ensured = ensureTeamSquadSaveFile(team);
  const formation: FormationType = ensured.manager?.primaryTactic?.formation || '4-3-3';
  const formationSlots = FORMATION_STARTING_XI_SLOTS[formation] || FORMATION_STARTING_XI_SLOTS['4-3-3'];

  // Collect all available active players from main squad (and reserves if needed)
  const squadSlots = ensured.squadSaveFile?.squad || [];
  const reserveGroupSlots = ensured.squadSaveFile?.reserves || [];

  const candidatePlayers: PlayerCardData[] = [];
  const seenIds = new Set<string>();

  [...squadSlots, ...reserveGroupSlots].forEach((s) => {
    if (s.player && !seenIds.has(s.player.id)) {
      seenIds.add(s.player.id);
      candidatePlayers.push(s.player);
    }
  });

  const assignedPlayerIds = new Set<string>();
  const newSquadSlots: SquadSlot[] = [];

  // 1. Pick the best player for each of the 11 Starting XI positions
  formationSlots.forEach((slotDef) => {
    let bestPlayer: PlayerCardData | null = null;
    let bestScore = -999999;

    candidatePlayers.forEach((p) => {
      if (assignedPlayerIds.has(p.id)) return;
      const score = calculatePositionSuitability(p, slotDef.role, slotDef.category);
      if (score > bestScore) {
        bestScore = score;
        bestPlayer = p;
      }
    });

    if (bestPlayer) {
      assignedPlayerIds.add((bestPlayer as PlayerCardData).id);
      newSquadSlots.push({
        slotNumber: slotDef.slotIndex,
        player: bestPlayer,
      });
    } else {
      newSquadSlots.push({
        slotNumber: slotDef.slotIndex,
        player: null,
      });
    }
  });

  // 2. Pick the 7 Bench Substitutes (Slots 12 to 18)
  BENCH_SUBSTITUTE_SLOTS.forEach((subDef) => {
    let bestPlayer: PlayerCardData | null = null;
    let bestScore = -999999;

    candidatePlayers.forEach((p) => {
      if (assignedPlayerIds.has(p.id)) return;
      const playerCategory = getPlayerBroadCategory(p);
      const ovr = p.ovr || p.overallRating || 70;

      let score = ovr * 10;
      if (subDef.suggestedCategory === 'GK') {
        if (playerCategory === 'GK') score += 1000;
        else score -= 5000;
      } else {
        if (playerCategory === 'GK') score -= 5000;
        else if (playerCategory === subDef.suggestedCategory) score += 60;
      }

      if (score > bestScore) {
        bestScore = score;
        bestPlayer = p;
      }
    });

    if (bestPlayer) {
      assignedPlayerIds.add((bestPlayer as PlayerCardData).id);
      newSquadSlots.push({
        slotNumber: subDef.slotNumber,
        player: bestPlayer,
      });
    } else {
      newSquadSlots.push({
        slotNumber: subDef.slotNumber,
        player: null,
      });
    }
  });

  // 3. Place remaining players into squad reserves (Slots 19 to 35)
  const remainingPlayers = candidatePlayers
    .filter((p) => !assignedPlayerIds.has(p.id))
    .sort((a, b) => (b.ovr || 70) - (a.ovr || 70));

  for (let slotNum = 19; slotNum <= 35; slotNum++) {
    const p = remainingPlayers.shift() || null;
    newSquadSlots.push({
      slotNumber: slotNum,
      player: p,
    });
  }

  const updatedTeam: EditorTeamData = {
    ...ensured,
    squadSaveFile: {
      ...ensured.squadSaveFile!,
      squad: newSquadSlots,
    },
  };

  return updatedTeam;
}

/**
 * Auto-Picks the Best Starting XI and 7 Bench Substitutes for ALL teams in a LeagueDatabase.
 */
export function autoPickStartingXIAndSubsForAllTeams(leagueDb: any): any {
  if (!leagueDb || !leagueDb.teams) return leagueDb;
  const updatedTeams: Record<string, EditorTeamData> = {};

  Object.entries(leagueDb.teams as Record<string, EditorTeamData>).forEach(([teamId, team]) => {
    updatedTeams[teamId] = autoPickBestStartingXIAndSubs(team);
  });

  return {
    ...leagueDb,
    teams: updatedTeams,
  };
}

/**
 * Swaps two player slots in the team squad save file.
 */
export function swapSquadSlots(
  team: EditorTeamData,
  slotNumA: number,
  slotNumB: number,
  groupKey: SquadGroupKey = 'squad'
): EditorTeamData {
  const ensured = ensureTeamSquadSaveFile(team);
  const slots = [...(ensured.squadSaveFile?.[groupKey] || [])];

  const idxA = slots.findIndex((s) => s.slotNumber === slotNumA);
  const idxB = slots.findIndex((s) => s.slotNumber === slotNumB);

  if (idxA === -1 || idxB === -1) return ensured;

  const playerA = slots[idxA].player;
  const playerB = slots[idxB].player;

  slots[idxA] = { slotNumber: slotNumA, player: playerB };
  slots[idxB] = { slotNumber: slotNumB, player: playerA };

  return {
    ...ensured,
    squadSaveFile: {
      ...ensured.squadSaveFile!,
      [groupKey]: slots,
    },
  };
}
