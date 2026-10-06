import { EditorTeamData, FormationType, TacticalStyle } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import { getDefaultTacticalPositions } from './tacticalSystem';

export interface TeamLineRatings {
  attack: number;
  midfield: number;
  defense: number;
  overall: number;
}

/**
 * Maps a position code or category to one of the 4 standard categories.
 */
export function getPositionCategory(pos?: string): 'ATT' | 'MID' | 'DEF' | 'GK' {
  if (!pos) return 'ATT';
  const norm = pos.trim().toUpperCase();
  if (['GK'].includes(norm)) return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].includes(norm)) return 'DEF';
  if (['CM', 'CAM', 'CDM', 'LM', 'RM', 'MID'].includes(norm)) return 'MID';
  return 'ATT'; // ST, CF, RW, LW, SS, RF, LF, ATT
}

/**
 * Calculates Out-Of-Position (OOP) penalty for a player placed in a target slot role.
 * Rules:
 * - Same position category or exact match or subPosition match: 0 penalty
 * - 1 category shift (e.g. MID <-> ATT or DEF <-> MID): -5 OVR penalty
 * - 2 category shifts (e.g. DEF <-> ATT): -10 OVR penalty
 * - Outfield playing GK or GK playing outfield: -25 OVR penalty
 */
export function getPositionPenalty(player: PlayerCardData, targetRole: string): number {
  const targetCategory = getPositionCategory(targetRole);
  const playerCategory = getPositionCategory(player.position || player.subPosition);

  // Exact subPosition or position code match
  if (
    (player.subPosition && player.subPosition.toUpperCase() === targetRole.toUpperCase()) ||
    (player.position && player.position.toUpperCase() === targetRole.toUpperCase())
  ) {
    return 0;
  }

  // Same category (e.g. ST playing RW)
  if (playerCategory === targetCategory) {
    return 0;
  }

  // Goalkeeper mismatch
  if (playerCategory === 'GK' || targetCategory === 'GK') {
    return 25; // -25 penalty
  }

  // Category shift calculation between ATT (3), MID (2), DEF (1)
  const categoryLevel: Record<'ATT' | 'MID' | 'DEF', number> = {
    ATT: 3,
    MID: 2,
    DEF: 1,
  };

  const pLevel = categoryLevel[playerCategory as 'ATT' | 'MID' | 'DEF'] || 3;
  const tLevel = categoryLevel[targetCategory as 'ATT' | 'MID' | 'DEF'] || 3;
  const shift = Math.abs(pLevel - tLevel);

  if (shift === 1) return 5;  // -5 penalty
  if (shift === 2) return 10; // -10 penalty

  return 0;
}

/**
 * Computes the effective OVR of a player for a specific tactical position, applying OOP penalties and hard min of 40.
 */
export function getEffectivePlayerOvr(player: PlayerCardData, targetRole: string): number {
  const baseOvr = player.ovr || 40;
  const penalty = getPositionPenalty(player, targetRole);
  return Math.max(40, baseOvr - penalty);
}

/**
 * Extracts the Starting XI (first 11 active players) from a team's squad save file.
 */
export function getStartingXI(team: EditorTeamData): { player: PlayerCardData; slotNumber: number }[] {
  const squadSlots = team.squadSaveFile?.squad || [];
  const activeSlots = squadSlots.filter((s) => s.player !== null && s.player !== undefined);
  return activeSlots.slice(0, 11).map((s) => ({
    player: s.player!,
    slotNumber: s.slotNumber,
  }));
}

/**
 * Calculates dynamic team strength line ratings (ATT, MID, DEF, OVERALL) derived strictly from the Starting XI.
 */
export function calculateTeamLineRatings(team: EditorTeamData): TeamLineRatings {
  const startingXI = getStartingXI(team);

  if (startingXI.length === 0) {
    // Fallback if team has no active players loaded
    const defaultRating = Math.max(40, (team.reputation ? team.reputation - 10 : 50));
    return {
      attack: defaultRating,
      midfield: defaultRating,
      defense: defaultRating,
      overall: defaultRating,
    };
  }

  // Determine formation setup
  const formation = (team.manager?.primaryTactic?.formation || '4-3-3') as FormationType;
  const style = (team.manager?.primaryTactic?.style || 'possession') as TacticalStyle;
  const positions = team.manager?.primaryTactic?.positions || getDefaultTacticalPositions(formation, style);

  const attRatings: number[] = [];
  const midRatings: number[] = [];
  const defRatings: number[] = [];
  const allRatings: number[] = [];

  startingXI.forEach((item, index) => {
    const targetSetup = positions[index] || positions[positions.length - 1] || { role: 'ST' };
    const targetRole = targetSetup.role || 'ST';
    const targetCategory = getPositionCategory(targetRole);

    const effOvr = getEffectivePlayerOvr(item.player, targetRole);
    allRatings.push(effOvr);

    if (targetCategory === 'ATT') {
      attRatings.push(effOvr);
    } else if (targetCategory === 'MID') {
      midRatings.push(effOvr);
    } else {
      // DEF & GK belong to DEF line
      defRatings.push(effOvr);
    }
  });

  const avgAll = Math.round(allRatings.reduce((a, b) => a + b, 0) / allRatings.length);

  const attack = attRatings.length > 0
    ? Math.round(attRatings.reduce((a, b) => a + b, 0) / attRatings.length)
    : avgAll;

  const midfield = midRatings.length > 0
    ? Math.round(midRatings.reduce((a, b) => a + b, 0) / midRatings.length)
    : avgAll;

  const defense = defRatings.length > 0
    ? Math.round(defRatings.reduce((a, b) => a + b, 0) / defRatings.length)
    : avgAll;

  const overall = Math.round((attack + midfield + defense) / 3);

  return {
    attack: Math.max(40, attack),
    midfield: Math.max(40, midfield),
    defense: Math.max(40, defense),
    overall: Math.max(40, overall),
  };
}
