import { EditorTeamData, TacticalStyle, FormationType } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import { normalizePositionTaxonomy, getGoalAssistModifiers } from './goalAssistSimulationModifiers';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';
import { getClubTacticalProfile } from './tacticalSystem';
import { getFitnessPercentage } from './staminaInjurySystem';
import { getPlayerBroadCategory } from './startingXISystem';
import { simulateLightweightMatch } from './lightweightMatchEngine';

export type { EditorTeamData, TacticalStyle, FormationType };

export interface MatchPlayerEvent {
  minute: number;
  type: 'goal' | 'assist' | 'yellow' | 'red' | 'save' | 'defensive_stop' | 'sub';
  playerId: string;
  playerName: string;
  teamId: string;
  detail?: string;
}

export interface MatchPlayerStats {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  position: string;
  subPosition: string;
  playStyle: string;
  ovr: number;
  isUserPlayer?: boolean;
  minutesPlayed: number;
  participationStatus?: 'starter' | 'sub_out' | 'sub_in' | 'sub_did_not_enter' | 'benched' | 'rested';
  goals: number;
  assists: number;
  rating: number;
  isMvp?: boolean;
  cleanSheet?: boolean;
  defensiveStops: number;
  yellowCards: number;
  redCards: number;
}

export interface SimulatedDatabaseMatchResult {
  id: string;
  competitionId?: string;
  competitionName?: string;
  stageName?: string;
  matchdayIndex?: number;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamOvr: number;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamOvr: number;
  homeScore: number;
  awayScore: number;
  homePenalties?: number;
  awayPenalties?: number;
  winnerTeamId?: string;
  isDraw: boolean;
  isCompleted: boolean;
  isPlayerMatch: boolean;
  ticksPlayed: number;
  events: MatchPlayerEvent[];
  homePlayers: MatchPlayerStats[];
  awayPlayers: MatchPlayerStats[];
  homeBench?: MatchPlayerStats[];
  awayBench?: MatchPlayerStats[];
  managerRotations?: string[];
  homeScorers: { playerId: string; name: string; minute: number; assistPlayerName?: string }[];
  awayScorers: { playerId: string; name: string; minute: number; assistPlayerName?: string }[];
  mvpPlayer?: { playerId: string; name: string; teamId: string; rating: number };
}

export interface SimulateMatchOptions {
  competitionId?: string;
  competitionName?: string;
  stageName?: string;
  matchdayIndex?: number;
  isKnockout?: boolean;
  isSingleLeg?: boolean;
  allowPenalties?: boolean;
  userPlayer?: PlayerCardData;
}

/**
 * Calculates tick distribution (1–10 ticks) based on manager tactical styles of both teams.
 */
export function calculateMatchTickCount(homeStyle: TacticalStyle, awayStyle: TacticalStyle): number {
  const getStyleBaseTicks = (style: TacticalStyle): number => {
    switch (style) {
      case 'gegenpressing':
        return 7 + Math.floor(Math.random() * 4); // 7 - 10
      case 'possession':
        return 5 + Math.floor(Math.random() * 3); // 5 - 7
      case 'counter_attack':
        return 3 + Math.floor(Math.random() * 3); // 3 - 5
      case 'long_balls':
        return 2 + Math.floor(Math.random() * 3); // 2 - 4
      case 'catenaccio':
        return 1 + Math.floor(Math.random() * 3); // 1 - 3
      default:
        return 4 + Math.floor(Math.random() * 3); // 4 - 6
    }
  };

  const homeTicks = getStyleBaseTicks(homeStyle);
  const awayTicks = getStyleBaseTicks(awayStyle);
  const blended = Math.round((homeTicks + awayTicks) / 2);
  return Math.max(1, Math.min(10, blended));
}

/**
 * Transforms a PlayerCardData object into MatchPlayerStats.
 */
function createMatchPlayerStats(
  player: PlayerCardData,
  team: EditorTeamData,
  defaultIndex: number,
  userPlayer?: PlayerCardData,
  defaultMinutes: number = 90,
  defaultStatus: MatchPlayerStats['participationStatus'] = 'starter'
): MatchPlayerStats {
  const isUser = userPlayer && (player.id === userPlayer.id || player.name === userPlayer.name);
  const resolved = isUser ? { ...player, ...userPlayer } : player;
  const { subPos } = normalizePositionTaxonomy(resolved.position, resolved.subPosition);

  return {
    id: resolved.id || `slot_${team.id}_${defaultIndex}`,
    name: resolved.name || `Player ${defaultIndex}`,
    teamId: team.id,
    teamName: team.name,
    position: resolved.position || 'MID',
    subPosition: subPos || 'CM',
    playStyle: (resolved as any).playStyle || (resolved as any).playstyle || 'Balanced',
    ovr: Math.max(40, Math.min(99, resolved.ovr || 70)),
    isUserPlayer: !!isUser,
    minutesPlayed: defaultMinutes,
    participationStatus: defaultStatus,
    goals: 0,
    assists: 0,
    rating: 6.0,
    defensiveStops: 0,
    yellowCards: 0,
    redCards: 0,
  };
}

/**
 * Resolves the matchday Starting XI (11 players) and Bench (7 Substitutes),
 * handling dynamic manager rotation:
 * If a starter is injured or fatigued/resting (fitness < 70), the manager modifies the starting lineup
 * by promoting the best available, fit bench substitute. Once fully fit, the player returns to the Starting XI.
 */
export function resolveMatchdaySquadAndSubs(
  team: EditorTeamData,
  userPlayer?: PlayerCardData
): {
  starters: MatchPlayerStats[];
  bench: MatchPlayerStats[];
  rotations: string[];
} {
  const ensured = ensureTeamSquadSaveFile(team);
  const allSquadSlots = ensured.squadSaveFile?.squad || [];

  const rawStartingSlots = allSquadSlots.filter((s) => s.slotNumber >= 1 && s.slotNumber <= 11 && s.player);
  const rawBenchSlots = allSquadSlots.filter((s) => s.slotNumber >= 12 && s.slotNumber <= 18 && s.player);
  const rawReserveSlots = allSquadSlots.filter((s) => s.slotNumber >= 19 && s.player);

  const starters: MatchPlayerStats[] = [];
  const bench: MatchPlayerStats[] = [];
  const rotations: string[] = [];

  // Working pools of player cards
  const startingPlayers: PlayerCardData[] = rawStartingSlots.map((s) => s.player!);
  const benchPlayers: PlayerCardData[] = rawBenchSlots.map((s) => s.player!);
  const reservePlayers: PlayerCardData[] = rawReserveSlots.map((s) => s.player!);

  // If Starting XI is less than 11, top up from bench & reserves
  while (startingPlayers.length < 11 && benchPlayers.length > 0) {
    startingPlayers.push(benchPlayers.shift()!);
  }
  while (startingPlayers.length < 11 && reservePlayers.length > 0) {
    startingPlayers.push(reservePlayers.shift()!);
  }

  // Check each starting player for injuries or rest (fatigue)
  const finalStarters: PlayerCardData[] = [];
  const restingPlayers: PlayerCardData[] = [];

  startingPlayers.forEach((p, idx) => {
    const isUser = userPlayer && (p.id === userPlayer.id || p.name === userPlayer.name);
    const resolved = isUser ? { ...p, ...userPlayer } : p;

    const isInjured =
      Boolean(resolved.isInjured) ||
      resolved.healthStatus === 'injured' ||
      (resolved.injuryWeeksRemaining !== undefined && resolved.injuryWeeksRemaining > 0);

    const fitness = getFitnessPercentage(resolved);
    const needsRest = fitness < 70; // Rest fatigued players with <70% fitness

    if (isInjured || needsRest) {
      const reason = isInjured ? 'Injured' : `Resting (${fitness}% Fitness)`;
      const category = getPlayerBroadCategory(resolved);

      // Find best available fit substitute from bench or reserves
      let subIdx = benchPlayers.findIndex((bp) => {
        const bFitness = getFitnessPercentage(bp);
        const bInjured = Boolean(bp.isInjured) || bp.healthStatus === 'injured' || (bp.injuryWeeksRemaining && bp.injuryWeeksRemaining > 0);
        return !bInjured && bFitness >= 70 && getPlayerBroadCategory(bp) === category;
      });

      // Fallback: any fit bench player
      if (subIdx === -1) {
        subIdx = benchPlayers.findIndex((bp) => {
          const bFitness = getFitnessPercentage(bp);
          const bInjured = Boolean(bp.isInjured) || bp.healthStatus === 'injured' || (bp.injuryWeeksRemaining && bp.injuryWeeksRemaining > 0);
          return !bInjured && bFitness >= 70;
        });
      }

      if (subIdx !== -1) {
        const replacement = benchPlayers.splice(subIdx, 1)[0];
        finalStarters.push(replacement);
        restingPlayers.push(resolved);
        rotations.push(`${replacement.name} starts in place of ${resolved.name} [${reason}]`);
      } else {
        // No fit sub found, starter must play or fallback
        finalStarters.push(resolved);
      }
    } else {
      // Fully fit player plays in starting XI
      finalStarters.push(resolved);
    }
  });

  // Convert final starters to MatchPlayerStats
  finalStarters.slice(0, 11).forEach((p, index) => {
    starters.push(createMatchPlayerStats(p, team, index + 1, userPlayer, 90, 'starter'));
  });

  // Ensure 11 starters
  while (starters.length < 11) {
    const idx = starters.length + 1;
    starters.push({
      id: `filler_${team.id}_${idx}`,
      name: `${team.name} Player ${idx}`,
      teamId: team.id,
      teamName: team.name,
      position: idx === 1 ? 'GK' : idx <= 5 ? 'DEF' : idx <= 9 ? 'MID' : 'ATT',
      subPosition: idx === 1 ? 'GK' : idx <= 5 ? 'CB' : idx <= 9 ? 'CM' : 'ST',
      playStyle: 'Balanced',
      ovr: Math.max(50, Math.min(95, (team.overallRating || 72) - 2)),
      isUserPlayer: false,
      minutesPlayed: 90,
      participationStatus: 'starter',
      goals: 0,
      assists: 0,
      rating: 6.0,
      defensiveStops: 0,
      yellowCards: 0,
      redCards: 0,
    });
  }

  // Populate the 7 Bench Substitutes
  const benchCandidatePool = [...benchPlayers, ...restingPlayers, ...reservePlayers];
  const selectedBenchCards = benchCandidatePool.slice(0, 7);

  selectedBenchCards.forEach((p, index) => {
    bench.push(createMatchPlayerStats(p, team, 12 + index, userPlayer, 0, 'sub_did_not_enter'));
  });

  // Top up bench to 7 if needed
  while (bench.length < 7) {
    const idx = 12 + bench.length;
    bench.push({
      id: `bench_filler_${team.id}_${idx}`,
      name: `${team.name} Sub ${bench.length + 1}`,
      teamId: team.id,
      teamName: team.name,
      position: bench.length === 0 ? 'GK' : bench.length <= 2 ? 'DEF' : bench.length <= 4 ? 'MID' : 'ATT',
      subPosition: bench.length === 0 ? 'GK' : bench.length <= 2 ? 'CB' : bench.length <= 4 ? 'CM' : 'ST',
      playStyle: 'Balanced',
      ovr: Math.max(45, Math.min(90, (team.overallRating || 72) - 4)),
      isUserPlayer: false,
      minutesPlayed: 0,
      participationStatus: 'sub_did_not_enter',
      goals: 0,
      assists: 0,
      rating: 6.0,
      defensiveStops: 0,
      yellowCards: 0,
      redCards: 0,
    });
  }

  return { starters, bench, rotations };
}

/**
 * Extracts and prepares the active Starting XI for a team from its database records.
 */
export function getStartingLineupForTeam(team: EditorTeamData, userPlayer?: PlayerCardData): MatchPlayerStats[] {
  const { starters } = resolveMatchdaySquadAndSubs(team, userPlayer);
  return starters;
}

/**
 * Categorizes a lineup into tactical groups: Midfielders, Attackers, Defenders, GK.
 */
function categorizeLineup(lineup: MatchPlayerStats[]) {
  const gks: MatchPlayerStats[] = [];
  const defenders: MatchPlayerStats[] = [];
  const midfielders: MatchPlayerStats[] = [];
  const forwards: MatchPlayerStats[] = [];

  lineup.forEach((p) => {
    const { primaryPos, subPos } = normalizePositionTaxonomy(p.position, p.subPosition);
    if (subPos === 'GK' || primaryPos === 'GK') {
      gks.push(p);
    } else if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(subPos) || primaryPos === 'DEF') {
      defenders.push(p);
    } else if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(subPos) || primaryPos === 'MID') {
      midfielders.push(p);
    } else {
      forwards.push(p);
    }
  });

  return { gks, defenders, midfielders, forwards };
}

/**
 * Selects an individual midfield player from a team for the Midfield Roll.
 * Weights playstyle and OVR (Maestro, Box-to-Box, Engine, Anchor receive natural engagement weights).
 */
function selectMidfieldContender(lineup: MatchPlayerStats[]): MatchPlayerStats {
  const { midfielders, defenders, forwards, gks } = categorizeLineup(lineup);
  const candidates = midfielders.length > 0 ? midfielders : [...forwards, ...defenders, ...gks];

  const weights = candidates.map((p) => {
    let w = 10.0;
    const style = (p.playStyle || '').toLowerCase();
    const sub = (p.subPosition || '').toUpperCase();

    if (sub === 'CM') w += 5.0;
    if (sub === 'CDM') w += 4.0;
    if (sub === 'CAM') w += 3.0;

    if (style.includes('box-to-box') || style.includes('engine') || style.includes('maestro') || style.includes('runner')) {
      w += 4.0;
    }
    w *= (p.ovr / 75);
    return Math.max(1.0, w);
  });

  return pickWeightedPlayer(candidates, weights);
}

/**
 * Selects an attacking player from the team squad to attempt the attack roll.
 * Every player has a non-zero probability (including GK at ~0.1%).
 */
function selectAttackingPlayer(lineup: MatchPlayerStats[]): MatchPlayerStats {
  const weights = lineup.map((p) => {
    const { primaryPos, subPos } = normalizePositionTaxonomy(p.position, p.subPosition);
    const style = (p.playStyle || '').toLowerCase();
    const sub = subPos.toUpperCase();

    let baseWeight = 2.0;

    if (sub === 'ST' || sub === 'CF') {
      baseWeight = 30.0;
      if (style.includes('poacher')) baseWeight = 38.0;
      else if (style.includes('finisher')) baseWeight = 36.0;
      else if (style.includes('complete')) baseWeight = 34.0;
      else if (style.includes('target')) baseWeight = 28.0;
      else if (style.includes('decoy')) baseWeight = 20.0;
    } else if (sub === 'LW' || sub === 'RW') {
      baseWeight = 15.0;
      if (style.includes('inverted') || style.includes('prolific')) baseWeight = 20.0;
      else if (style.includes('pressing')) baseWeight = 14.0;
      else if (style.includes('creator') || style.includes('traditional')) baseWeight = 12.0;
    } else if (sub === 'CAM') {
      baseWeight = 12.0;
      if (style.includes('shadow')) baseWeight = 18.0;
      else if (style.includes('classic n10')) baseWeight = 10.0;
      else if (style.includes('engine')) baseWeight = 11.0;
    } else if (sub === 'CM' || sub === 'LM' || sub === 'RM') {
      baseWeight = 6.0;
      if (style.includes('runner') || style.includes('box-to-box')) baseWeight = 10.0;
      else if (style.includes('maestro')) baseWeight = 5.0;
    } else if (sub === 'LB' || sub === 'RB' || sub === 'LWB' || sub === 'RWB') {
      baseWeight = 2.5;
      if (style.includes('attacker') || style.includes('inverted')) baseWeight = 5.0;
    } else if (sub === 'CDM') {
      baseWeight = 2.0;
    } else if (sub === 'CB') {
      baseWeight = 3.0; // Set-piece headers & aerial threat
    } else if (sub === 'GK' || primaryPos === 'GK') {
      baseWeight = 0.1; // Extremely rare ~0.1% minimum
    }

    const modifiers = getGoalAssistModifiers(p.position, p.subPosition, p.playStyle);
    const goalMultiplier = modifiers.goalChanceMultiplier || 1.0;
    const ovrScaling = Math.pow(p.ovr / 75, 1.4);

    return Math.max(0.1, baseWeight * goalMultiplier * ovrScaling);
  });

  return pickWeightedPlayer(lineup, weights);
}

/**
 * Selects an opposing defensive player (CB, LB, RB, or defensive CDM) to contest the attack.
 */
function selectDefenderPlayer(defendingLineup: MatchPlayerStats[]): MatchPlayerStats {
  const { defenders, midfielders, gks } = categorizeLineup(defendingLineup);

  const candidates = defenders.length > 0 ? defenders : midfielders.length > 0 ? midfielders : gks;

  const weights = candidates.map((p) => {
    const sub = (p.subPosition || '').toUpperCase();
    const style = (p.playStyle || '').toLowerCase();

    let w = 10.0;
    if (sub === 'CB') w = 35.0;
    else if (sub === 'LB' || sub === 'RB') w = 22.0;
    else if (sub === 'CDM') w = 18.0;
    else if (sub === 'CM') w = 8.0;

    if (style.includes('stopper') || style.includes('destroyer') || style.includes('enforcer') || style.includes('anchor')) {
      w += 10.0;
    }
    w *= (p.ovr / 75);
    return Math.max(1.0, w);
  });

  return pickWeightedPlayer(candidates, weights);
}

/**
 * Selects an assister after a goal is scored.
 * Prioritizes Creator wingers, Attacking fullbacks, CAMs, Maestro CMs, and complete forwards.
 */
function selectAssisterPlayer(attackingLineup: MatchPlayerStats[], scorer: MatchPlayerStats): MatchPlayerStats | null {
  // ~16% chance of solo goal / unassisted (rebound, individual solo run, direct set piece)
  if (Math.random() < 0.16) {
    return null;
  }

  const candidates = attackingLineup.filter((p) => p.id !== scorer.id);
  if (candidates.length === 0) return null;

  const weights = candidates.map((p) => {
    const { primaryPos, subPos } = normalizePositionTaxonomy(p.position, p.subPosition);
    const style = (p.playStyle || '').toLowerCase();
    const sub = subPos.toUpperCase();

    let baseWeight = 5.0;

    if (sub === 'LW' || sub === 'RW') {
      baseWeight = 22.0;
      if (style.includes('creator') || style.includes('traditional')) baseWeight = 30.0;
      else if (style.includes('prolific') || style.includes('inverted')) baseWeight = 20.0;
    } else if (sub === 'CAM') {
      baseWeight = 25.0;
      if (style.includes('creator') || style.includes('classic n10')) baseWeight = 32.0;
      else if (style.includes('shadow')) baseWeight = 16.0;
    } else if (sub === 'CM' || sub === 'LM' || sub === 'RM') {
      baseWeight = 18.0;
      if (style.includes('maestro') || style.includes('box-to-box')) baseWeight = 25.0;
    } else if (sub === 'ST' || sub === 'CF') {
      baseWeight = 14.0;
      if (style.includes('decoy')) baseWeight = 28.0; // Decoy strikers create huge assist volume
      else if (style.includes('complete') || style.includes('target')) baseWeight = 18.0;
      else if (style.includes('poacher')) baseWeight = 6.0;
    } else if (sub === 'LB' || sub === 'RB' || sub === 'LWB' || sub === 'RWB') {
      baseWeight = 12.0;
      if (style.includes('attacker') || style.includes('inverted')) baseWeight = 18.0;
    } else if (sub === 'CDM') {
      baseWeight = 6.0;
    } else if (sub === 'CB') {
      baseWeight = 3.0; // Long ball / flick-on assists
    } else if (sub === 'GK' || primaryPos === 'GK') {
      baseWeight = 0.1; // Extremely rare long distribution assist
    }

    const modifiers = getGoalAssistModifiers(p.position, p.subPosition, p.playStyle);
    const assistMultiplier = modifiers.assistChanceMultiplier || 1.0;
    const ovrScaling = Math.pow(p.ovr / 75, 1.2);

    return Math.max(0.1, baseWeight * assistMultiplier * ovrScaling);
  });

  return pickWeightedPlayer(candidates, weights);
}

/**
 * Standard roulette-wheel picker for weighted arrays.
 */
function pickWeightedPlayer<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (roll < weights[i]) {
      return items[i];
    }
    roll -= weights[i];
  }
  return items[items.length - 1];
}

/**
 * Authoritative unified background match simulation function.
 * ALL background matches across all competitions use the calculation-based Lightweight Match Engine.
 */
export function simulateDatabaseMatch(
  homeTeam: EditorTeamData,
  awayTeam: EditorTeamData,
  options: SimulateMatchOptions = {}
): SimulatedDatabaseMatchResult {
  return simulateLightweightMatch(homeTeam, awayTeam, options);
}

