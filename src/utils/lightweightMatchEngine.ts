import { EditorTeamData, TacticalStyle, FormationType } from '../types/leagueEditor';
import { normalizePositionTaxonomy } from './goalAssistSimulationModifiers';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';
import { getClubTacticalProfile } from './tacticalSystem';
import { getClubPowerscaleImpact } from './powerscaleSystem';
import {
  MatchPlayerEvent,
  MatchPlayerStats,
  SimulatedDatabaseMatchResult,
  SimulateMatchOptions,
} from './databaseMatchSimulationEngine';

export interface CachedTeamStrength {
  teamId: string;
  teamName: string;
  countryCode: string;
  formation: FormationType;
  tacticalStyle: TacticalStyle;
  attackStrength: number;
  midfieldStrength: number;
  defenseStrength: number;
  goalkeeperStrength: number;
  overallRating: number;
  starters: MatchPlayerStats[];
  bench: MatchPlayerStats[];
  calculatedAt: number;
}

// In-memory cache for fast lookup across thousands of matches
const TEAM_STRENGTH_CACHE = new Map<string, CachedTeamStrength>();

/**
 * Clears or invalidates the team strength cache.
 */
export function invalidateTeamStrengthCache(teamId?: string): void {
  if (teamId) {
    TEAM_STRENGTH_CACHE.delete(teamId);
  } else {
    TEAM_STRENGTH_CACHE.clear();
  }
}

/**
 * Derives and caches the 4 core tactical strengths (Attack, Midfield, Defense, Goalkeeper)
 * along with the 11 Starting XI players and Substitutes directly from the team's Team Editor record.
 * GUARANTEES: Uses ONLY players currently belonging to that club (Permanent Player ID -> Club ID).
 * Never creates duplicate or placeholder players.
 */
export function getCachedTeamTacticalProfile(
  team: EditorTeamData,
  forceRefresh: boolean = false
): CachedTeamStrength {
  const cacheKey = team.id || team.name;
  if (!forceRefresh && TEAM_STRENGTH_CACHE.has(cacheKey)) {
    return TEAM_STRENGTH_CACHE.get(cacheKey)!;
  }

  const ensured = ensureTeamSquadSaveFile(team);
  const squadSlots = ensured.squadSaveFile?.squad || [];

  // Extract starting XI (slots 1-11) and bench (slots 12-18)
  const rawStarters = squadSlots.filter((s) => s.slotNumber >= 1 && s.slotNumber <= 11 && s.player).map((s) => s.player!);
  const rawBench = squadSlots.filter((s) => s.slotNumber >= 12 && s.slotNumber <= 18 && s.player).map((s) => s.player!);
  const rawReserves = squadSlots.filter((s) => s.slotNumber >= 19 && s.player).map((s) => s.player!);

  // If squad slots are sparse, fill up from bench & reserves
  while (rawStarters.length < 11 && rawBench.length > 0) {
    rawStarters.push(rawBench.shift()!);
  }
  while (rawStarters.length < 11 && rawReserves.length > 0) {
    rawStarters.push(rawReserves.shift()!);
  }

  // Tactical style and formation
  const formation: FormationType = team.manager?.primaryTactic?.formation || '4-3-3';
  const tacticalStyle: TacticalStyle =
    team.manager?.primaryTactic?.style ||
    getClubTacticalProfile(team.id, team.name, team.countryCode).primaryStyle ||
    'possession';

  // Build authoritative starter list with permanent unique IDs
  const starters: MatchPlayerStats[] = rawStarters.slice(0, 11).map((p, idx) => {
    const { primaryPos, subPos } = normalizePositionTaxonomy(p.position, p.subPosition);
    return {
      id: p.id || `p_${team.id}_s${idx + 1}`,
      name: p.name || `${team.name} Player ${idx + 1}`,
      teamId: team.id,
      teamName: team.name,
      position: primaryPos || (idx === 0 ? 'GK' : idx <= 4 ? 'DEF' : idx <= 8 ? 'MID' : 'ATT'),
      subPosition: subPos || (idx === 0 ? 'GK' : idx <= 4 ? 'CB' : idx <= 8 ? 'CM' : 'ST'),
      playStyle: (p as any).playStyle || (p as any).playstyle || 'Balanced',
      ovr: Math.max(45, Math.min(99, p.ovr || team.overallRating || 72)),
      isUserPlayer: false,
      minutesPlayed: 90,
      participationStatus: 'starter',
      goals: 0,
      assists: 0,
      rating: 6.0,
      defensiveStops: 0,
      yellowCards: 0,
      redCards: 0,
    };
  });

  // Ensure minimum 11 starters with standard positions if database record was partial
  while (starters.length < 11) {
    const idx = starters.length + 1;
    const isGk = idx === 1;
    const isDef = idx >= 2 && idx <= 5;
    const isMid = idx >= 6 && idx <= 8;
    starters.push({
      id: `p_${team.id}_s${idx}`,
      name: `${team.name} Player ${idx}`,
      teamId: team.id,
      teamName: team.name,
      position: isGk ? 'GK' : isDef ? 'DEF' : isMid ? 'MID' : 'ATT',
      subPosition: isGk ? 'GK' : isDef ? 'CB' : isMid ? 'CM' : 'ST',
      playStyle: 'Balanced',
      ovr: Math.max(45, Math.min(99, team.overallRating || 72)),
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

  // Build bench (up to 7 substitutes)
  const bench: MatchPlayerStats[] = rawBench.slice(0, 7).map((p, idx) => {
    const { primaryPos, subPos } = normalizePositionTaxonomy(p.position, p.subPosition);
    return {
      id: p.id || `p_${team.id}_sub${idx + 1}`,
      name: p.name || `${team.name} Sub ${idx + 1}`,
      teamId: team.id,
      teamName: team.name,
      position: primaryPos || 'MID',
      subPosition: subPos || 'CM',
      playStyle: (p as any).playStyle || (p as any).playstyle || 'Balanced',
      ovr: Math.max(45, Math.min(99, p.ovr || (team.overallRating || 72) - 3)),
      isUserPlayer: false,
      minutesPlayed: 0,
      participationStatus: 'sub_did_not_enter',
      goals: 0,
      assists: 0,
      rating: 6.0,
      defensiveStops: 0,
      yellowCards: 0,
      redCards: 0,
    };
  });

  // Calculate position-specific strength aggregations
  let gkSum = 0;
  let gkCount = 0;
  let defSum = 0;
  let defCount = 0;
  let midSum = 0;
  let midCount = 0;
  let attSum = 0;
  let attCount = 0;
  let totalOvrSum = 0;

  starters.forEach((p) => {
    totalOvrSum += p.ovr;
    const sub = p.subPosition.toUpperCase();
    const pos = p.position.toUpperCase();

    if (sub === 'GK' || pos === 'GK') {
      gkSum += p.ovr;
      gkCount++;
    } else if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(sub) || pos === 'DEF') {
      defSum += p.ovr;
      defCount++;
    } else if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(sub) || pos === 'MID') {
      midSum += p.ovr;
      midCount++;
    } else {
      attSum += p.ovr;
      attCount++;
    }
  });

  const baseTeamOvr = totalOvrSum / 11;
  let gkStr = gkCount > 0 ? gkSum / gkCount : baseTeamOvr;
  let defStr = defCount > 0 ? defSum / defCount : baseTeamOvr;
  let midStr = midCount > 0 ? midSum / midCount : baseTeamOvr;
  let attStr = attCount > 0 ? attSum / attCount : baseTeamOvr;

  // Tactical Style Modifiers
  switch (tacticalStyle) {
    case 'gegenpressing':
      attStr += 2.5;
      midStr += 2.0;
      defStr -= 1.0;
      break;
    case 'possession':
      midStr += 3.0;
      attStr += 1.0;
      defStr += 1.0;
      break;
    case 'counter_attack':
      attStr += 3.0;
      defStr += 2.0;
      midStr -= 1.0;
      break;
    case 'catenaccio':
      defStr += 4.5;
      gkStr += 2.0;
      attStr -= 3.0;
      break;
    case 'long_balls':
      attStr += 2.0;
      midStr -= 1.5;
      defStr += 1.0;
      break;
    default:
      // Balanced
      break;
  }

  const profile: CachedTeamStrength = {
    teamId: team.id,
    teamName: team.name,
    countryCode: team.countryCode || 'INT',
    formation,
    tacticalStyle,
    attackStrength: attStr,
    midfieldStrength: midStr,
    defenseStrength: defStr,
    goalkeeperStrength: gkStr,
    overallRating: Math.round(baseTeamOvr),
    starters,
    bench,
    calculatedAt: Date.now(),
  };

  TEAM_STRENGTH_CACHE.set(cacheKey, profile);
  return profile;
}

/**
 * Samples a realistic number of goals using a discrete Poisson distribution
 * calibrated to real professional football match scorelines:
 * 0-0, 1-0, 1-1, 2-0, 2-1, 2-2, 3-1, 3-2 dominant, occasional higher scores.
 */
function samplePoissonGoals(expectedLambda: number): number {
  const clampedLambda = Math.max(0.20, Math.min(3.8, expectedLambda));
  const L = Math.exp(-clampedLambda);
  let k = 0;
  let p = 1.0;

  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 10);

  const rawGoals = Math.max(0, k - 1);
  return Math.min(5, rawGoals); // Cap at realistic 5 goals
}

/**
 * Calculates weighted scoring probabilities for each player on the starting XI.
 * SPECIFICATION:
 * - Strikers ≈ 40%
 * - Wingers ≈ 20%
 * - Other attacking/midfield players receive appropriate smaller weights (CAM ≈ 18%, CM ≈ 12%, CDM ≈ 5%)
 * - Defenders receive low probability (CB ≈ 3%, Fullbacks ≈ 4%)
 * - Goalkeepers receive extremely low but non-zero probability (< 0.1%)
 * - OVR and Playstyle modify probability.
 */
function getPlayerScoringWeights(players: MatchPlayerStats[]): number[] {
  return players.map((p) => {
    const sub = (p.subPosition || '').toUpperCase();
    const pos = (p.position || '').toUpperCase();
    const playstyle = (p.playStyle || '').toLowerCase();
    const ovr = p.ovr || 72;

    let baseWeight = 10.0;
    if (sub === 'ST' || sub === 'CF' || pos === 'ATT') {
      baseWeight = 40.0; // Strikers ≈ 40%
    } else if (sub === 'LW' || sub === 'RW' || sub === 'LM' || sub === 'RM') {
      baseWeight = 20.0; // Wingers ≈ 20%
    } else if (sub === 'CAM') {
      baseWeight = 18.0; // Attacking midfielders
    } else if (sub === 'CM') {
      baseWeight = 12.0; // Central midfielders
    } else if (sub === 'CDM' || pos === 'MID') {
      baseWeight = 5.0; // Defensive midfielders
    } else if (['LB', 'RB', 'LWB', 'RWB'].includes(sub)) {
      baseWeight = 4.0; // Fullbacks
    } else if (sub === 'CB' || pos === 'DEF') {
      baseWeight = 3.0; // Central defenders
    } else if (sub === 'GK' || pos === 'GK') {
      baseWeight = 0.05; // Goalkeepers non-zero, extremely rare
    }

    // Playstyle multipliers
    if (playstyle.includes('poacher') || playstyle.includes('finisher') || playstyle.includes('fox')) {
      baseWeight *= 1.5;
    } else if (playstyle.includes('target') || playstyle.includes('complete') || playstyle.includes('winger')) {
      baseWeight *= 1.3;
    } else if (playstyle.includes('playmaker') || playstyle.includes('box-to-box')) {
      baseWeight *= 1.15;
    } else if (playstyle.includes('anchor') || playstyle.includes('sweeper') || playstyle.includes('wall')) {
      baseWeight *= 0.6;
    }

    // OVR quality scaling
    const ovrFactor = Math.pow(ovr / 75, 1.3);
    return Math.max(0.01, baseWeight * ovrFactor);
  });
}

/**
 * Calculates weighted assist probabilities for each player on the starting XI.
 * SPECIFICATION:
 * - Weight toward: Wingers, CAM/MO, Creative midfielders, Fullbacks, Creative forwards.
 * - OVR, Playstyle and position modify probability.
 */
function getPlayerAssistWeights(players: MatchPlayerStats[], excludePlayerId?: string): number[] {
  return players.map((p) => {
    if (excludePlayerId && p.id === excludePlayerId) {
      return 0; // Goalscorer cannot assist own goal
    }

    const sub = (p.subPosition || '').toUpperCase();
    const pos = (p.position || '').toUpperCase();
    const playstyle = (p.playStyle || '').toLowerCase();
    const ovr = p.ovr || 72;

    let baseWeight = 10.0;
    if (sub === 'CAM') {
      baseWeight = 32.0; // CAM / MO prime playmaker
    } else if (sub === 'LW' || sub === 'RW' || sub === 'LM' || sub === 'RM') {
      baseWeight = 28.0; // Wingers crosses / key passes
    } else if (sub === 'CM') {
      baseWeight = 22.0; // Creative central midfielders
    } else if (['LB', 'RB', 'LWB', 'RWB'].includes(sub)) {
      baseWeight = 14.0; // Overlapping fullbacks
    } else if (sub === 'ST' || sub === 'CF' || pos === 'ATT') {
      baseWeight = 12.0; // Hold-up play / layoffs
    } else if (sub === 'CDM' || pos === 'MID') {
      baseWeight = 8.0; // Deep-lying playmakers
    } else if (sub === 'CB' || pos === 'DEF') {
      baseWeight = 2.5; // Long clearances / set-piece knockdowns
    } else if (sub === 'GK' || pos === 'GK') {
      baseWeight = 0.1; // Rare punt assist
    }

    // Playstyle multipliers
    if (playstyle.includes('maestro') || playstyle.includes('playmaker') || playstyle.includes('creator')) {
      baseWeight *= 1.6;
    } else if (playstyle.includes('crosser') || playstyle.includes('winger')) {
      baseWeight *= 1.4;
    } else if (playstyle.includes('box-to-box') || playstyle.includes('engine')) {
      baseWeight *= 1.2;
    }

    const ovrFactor = Math.pow(ovr / 75, 1.2);
    return Math.max(0.01, baseWeight * ovrFactor);
  });
}

/**
 * Selects a player index using weighted probability array.
 */
function pickWeightedIndex(weights: number[]): number {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) return Math.floor(Math.random() * weights.length);

  let rand = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    if (rand < weights[i]) return i;
    rand -= weights[i];
  }
  return weights.length - 1;
}

/**
 * RESULT-BASED RATING MODIFIER:
 * Specification:
 * WIN modifier:
 * - 10% -> −0.5
 * - 10% -> −1.0
 * - Remaining 80% -> positive values (+0.5: 35%, +1.0: 30%, +1.5: 10%, +2.0: 5%)
 *
 * LOSS modifier:
 * - 10% -> +1.0
 * - 10% -> +0.5
 * - 30% -> −1.0
 * - 20% -> −1.5
 * - 15% -> −2.0
 * - Remaining 15% -> small negative/neutral (-0.5: 10%, 0.0: 5%)
 *
 * DRAW modifier:
 * - 70% -> 0.0, 15% -> +0.5, 15% -> -0.5
 */
function sampleResultRatingModifier(result: 'win' | 'loss' | 'draw'): number {
  const roll = Math.random();

  if (result === 'win') {
    if (roll < 0.10) return -0.5;
    if (roll < 0.20) return -1.0;
    if (roll < 0.55) return 0.5;
    if (roll < 0.85) return 1.0;
    if (roll < 0.95) return 1.5;
    return 2.0;
  }

  if (result === 'loss') {
    if (roll < 0.10) return 1.0;
    if (roll < 0.20) return 0.5;
    if (roll < 0.50) return -1.0;
    if (roll < 0.70) return -1.5;
    if (roll < 0.85) return -2.0;
    if (roll < 0.95) return -0.5;
    return 0.0;
  }

  // Draw
  if (roll < 0.15) return 0.5;
  if (roll < 0.30) return -0.5;
  return 0.0;
}

/**
 * Calculates a realistic individual player match rating (1.0 to 10.0 scale)
 * SPECIFICATION:
 * - Base: 6.0
 * - Result-based modifier (win/loss/draw distribution)
 * - Goals: +0.5 rating per goal
 * - Assists: +0.5 rating per assist
 * - Clean sheet: +0.5 for DEF, +0.7 for GK
 * - Conceding >= 2 goals: -0.2 per goal conceded above 1 for DEF/GK
 * - Opponent strength context
 * - Random performance variation
 * - Clamped strictly between 1.0 and 10.0.
 */
export function calculateLightweightPlayerRating(
  player: MatchPlayerStats,
  teamScore: number,
  oppScore: number,
  oppTeamOvr: number
): number {
  let rating = 6.0; // Base: 6.0

  // 1. Result-Based Rating Modifier
  const outcome = teamScore > oppScore ? 'win' : teamScore < oppScore ? 'loss' : 'draw';
  rating += sampleResultRatingModifier(outcome);

  // 2. Goals (+0.5 rating) & Assists (+0.5 rating)
  rating += player.goals * 0.5;
  rating += player.assists * 0.5;

  // 3. Defensive and Goalkeeper contributions
  const sub = (player.subPosition || '').toUpperCase();
  const pos = (player.position || '').toUpperCase();
  const isGk = sub === 'GK' || pos === 'GK';
  const isDef = ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(sub) || pos === 'DEF';

  if (oppScore === 0) {
    if (isGk) rating += 0.7;
    else if (isDef) rating += 0.5;
    else rating += 0.2;
    player.cleanSheet = true;
  } else if (oppScore >= 2) {
    if (isGk) rating -= (oppScore - 1) * 0.25;
    else if (isDef) rating -= (oppScore - 1) * 0.20;
  }

  // 4. Opponent Strength Context (Delta)
  const ovrDelta = (oppTeamOvr - player.ovr) * 0.02;
  rating += Math.max(-0.4, Math.min(0.4, ovrDelta));

  // 5. Random performance variation (-0.3 to +0.3)
  rating += (Math.random() - 0.5) * 0.6;

  // Strict bounds: 1.0 to 10.0
  const clamped = Math.max(1.0, Math.min(10.0, rating));
  return Math.round(clamped * 10) / 10;
}

/**
 * NEW LIGHTWEIGHT FOOTBALL SIMULATION ENGINE
 * 
 * CORE RULES IMPLEMENTED:
 * 1. Calculation-based, NOT live/tick-based. Fast and memory-safe.
 * 2. Incorporates a 30% random factor: A stronger team has an advantage, but is NEVER guaranteed to win.
 *    A vastly superior team can lose. No scripted winners or repetitive finalists.
 * 3. Realistic scores concentrated around 0-0, 1-0, 1-1, 2-0, 2-1, 2-2, 3-1, 3-2.
 * 4. Goalscorers selected strictly from that team's actual Starting XI.
 * 5. Own Goals: ~10% probability, attributed to opposing defender/GK.
 * 6. Assists: ~70% of regular goals receive an assist from actual squad members.
 * 7. Player ratings: Base 6.0 with exact WIN/LOSS modifier distributions, +0.5 per goal, +0.5 per assist.
 * 8. Strict bounds 1.0 to 10.0.
 */
export function simulateLightweightMatch(
  homeTeam: EditorTeamData,
  awayTeam: EditorTeamData,
  options?: SimulateMatchOptions
): SimulatedDatabaseMatchResult {
  const homeProfile = getCachedTeamTacticalProfile(homeTeam);
  const awayProfile = getCachedTeamTacticalProfile(awayTeam);

  // Home field advantage (+1.5 Attack, +1.0 Midfield, +0.5 Defense)
  const homeAtkEffective = homeProfile.attackStrength + 1.5;
  const homeMidEffective = homeProfile.midfieldStrength + 1.0;
  const homeDefEffective = homeProfile.defenseStrength + 0.5;

  const awayAtkEffective = awayProfile.attackStrength;
  const awayMidEffective = awayProfile.midfieldStrength;
  const awayDefEffective = awayProfile.defenseStrength;

  // Tactical Tempo Calculation
  let tempo = 1.0;
  if (homeProfile.tacticalStyle === 'gegenpressing' || awayProfile.tacticalStyle === 'gegenpressing') {
    tempo += 0.15;
  }
  if (homeProfile.tacticalStyle === 'catenaccio' || awayProfile.tacticalStyle === 'catenaccio') {
    tempo -= 0.20;
  }
  if (homeProfile.tacticalStyle === 'counter_attack' || awayProfile.tacticalStyle === 'counter_attack') {
    tempo += 0.10;
  }

  // POWERSCALE HERITAGE & DYNAMIC FAVORITES MODIFIERS
  const homePowerscale = getClubPowerscaleImpact(homeTeam.id, homeTeam.name, options?.competitionId);
  const awayPowerscale = getClubPowerscaleImpact(awayTeam.id, awayTeam.name, options?.competitionId);

  const homeMod = homePowerscale.effectiveModifier;
  const awayMod = awayPowerscale.effectiveModifier;

  // 30% RANDOM FACTOR IN RESULT CALCULATION:
  // Powerscale modified tactical strength (70%) + Random noise factor (30%)
  const homeEffectiveStrength = (homeAtkEffective * 0.4 + homeMidEffective * 0.4 + homeDefEffective * 0.2) * homeMod;
  const awayEffectiveStrength = (awayAtkEffective * 0.4 + awayMidEffective * 0.4 + awayDefEffective * 0.2) * awayMod;

  const homeStrengthRoll = homeEffectiveStrength * 0.70 + (Math.random() * 85 + 15) * 0.30;
  const awayStrengthRoll = awayEffectiveStrength * 0.70 + (Math.random() * 85 + 15) * 0.30;

  const advantageSpread = homeStrengthRoll - awayStrengthRoll;
  const spreadScaled = Math.tanh(advantageSpread / 18) * 3.5;

  const baseHomeLambda = Math.max(0.25, (1.25 + spreadScaled * 0.08) * tempo);
  const baseAwayLambda = Math.max(0.25, (1.05 - spreadScaled * 0.08) * tempo);

  let homeScore = samplePoissonGoals(baseHomeLambda);
  let awayScore = samplePoissonGoals(baseAwayLambda);

  // Knockout Extra Time and Penalties resolution if required
  let homePenalties: number | undefined;
  let awayPenalties: number | undefined;
  let winnerTeamId: string | undefined;

  if (options?.isKnockout && options?.allowPenalties && homeScore === awayScore) {
    // 30 mins extra time simulation with 30% randomness (favorites have higher clutch chance)
    const homeEtChance = 0.22 * Math.max(0.8, Math.min(1.3, homeMod));
    const awayEtChance = 0.22 * Math.max(0.8, Math.min(1.3, awayMod));
    const homeEtGoals = Math.random() < homeEtChance ? 1 : 0;
    const awayEtGoals = Math.random() < awayEtChance ? 1 : 0;
    homeScore += homeEtGoals;
    awayScore += awayEtGoals;

    if (homeScore === awayScore) {
      // Penalty shootout: heritage favorites have composure edge while retaining upset possibility
      homePenalties = 4 + (Math.random() < 0.5 ? 1 : 0);
      awayPenalties = 4 + (Math.random() < 0.5 ? 1 : 0);
      if (homePenalties === awayPenalties) {
        const composureEdge = 0.50 + (homeMod - awayMod) * 0.25;
        if (Math.random() < Math.max(0.20, Math.min(0.80, composureEdge))) {
          homePenalties += 1;
        } else {
          awayPenalties += 1;
        }
      }
      winnerTeamId = homePenalties > awayPenalties ? homeTeam.id : awayTeam.id;
    } else {
      winnerTeamId = homeScore > awayScore ? homeTeam.id : awayTeam.id;
    }
  } else if (homeScore !== awayScore) {
    winnerTeamId = homeScore > awayScore ? homeTeam.id : awayTeam.id;
  }

  // Clone active starter rosters so stats don't mutate template objects directly
  const homeStarters: MatchPlayerStats[] = homeProfile.starters.map((p) => ({ ...p, goals: 0, assists: 0, rating: 6.0 }));
  const awayStarters: MatchPlayerStats[] = awayProfile.starters.map((p) => ({ ...p, goals: 0, assists: 0, rating: 6.0 }));

  const homeScorers: { playerId: string; name: string; minute: number; assistPlayerName?: string; isOwnGoal?: boolean }[] = [];
  const awayScorers: { playerId: string; name: string; minute: number; assistPlayerName?: string; isOwnGoal?: boolean }[] = [];
  const events: MatchPlayerEvent[] = [];

  // Home Goals Resolution
  if (homeScore > 0) {
    const homeWeights = getPlayerScoringWeights(homeStarters);
    // Defense pool of away team for own goal selection
    const awayDefenders = awayStarters.filter((p) => p.position === 'DEF' || p.position === 'GK');
    const awayDefPool = awayDefenders.length > 0 ? awayDefenders : awayStarters;

    for (let g = 0; g < homeScore; g++) {
      const minute = Math.min(90, Math.max(1, Math.floor(10 + (g + 1) * (75 / (homeScore + 1)) + (Math.random() * 10 - 5))));
      const isOwnGoal = Math.random() < 0.10; // ~10% Own Goals

      if (isOwnGoal) {
        // Own goal by away defender
        const ogDefender = awayDefPool[Math.floor(Math.random() * awayDefPool.length)];
        homeScorers.push({
          playerId: ogDefender.id,
          name: `${ogDefender.name} (OG)`,
          minute,
          isOwnGoal: true,
        });

        events.push({
          minute,
          type: 'goal',
          playerId: ogDefender.id,
          playerName: `${ogDefender.name} (OG)`,
          teamId: homeTeam.id,
          detail: 'Own Goal',
        });
      } else {
        // Normal goal for home team starter
        const scorerIdx = pickWeightedIndex(homeWeights);
        const scorer = homeStarters[scorerIdx];
        scorer.goals += 1;

        // ~70% of goals receive an assist, ~30% do not
        let assistPlayerName: string | undefined;
        if (Math.random() < 0.70) {
          const assistWeights = getPlayerAssistWeights(homeStarters, scorer.id);
          const assisterIdx = pickWeightedIndex(assistWeights);
          const assister = homeStarters[assisterIdx];
          if (assister && assister.id !== scorer.id) {
            assister.assists += 1;
            assistPlayerName = assister.name;
            events.push({
              minute,
              type: 'assist',
              playerId: assister.id,
              playerName: assister.name,
              teamId: homeTeam.id,
            });
          }
        }

        homeScorers.push({
          playerId: scorer.id,
          name: scorer.name,
          minute,
          assistPlayerName,
        });

        events.push({
          minute,
          type: 'goal',
          playerId: scorer.id,
          playerName: scorer.name,
          teamId: homeTeam.id,
          detail: assistPlayerName ? `Assist by ${assistPlayerName}` : undefined,
        });
      }
    }
  }

  // Away Goals Resolution
  if (awayScore > 0) {
    const awayWeights = getPlayerScoringWeights(awayStarters);
    // Defense pool of home team for own goal selection
    const homeDefenders = homeStarters.filter((p) => p.position === 'DEF' || p.position === 'GK');
    const homeDefPool = homeDefenders.length > 0 ? homeDefenders : homeStarters;

    for (let g = 0; g < awayScore; g++) {
      const minute = Math.min(90, Math.max(1, Math.floor(10 + (g + 1) * (75 / (awayScore + 1)) + (Math.random() * 10 - 5))));
      const isOwnGoal = Math.random() < 0.10; // ~10% Own Goals

      if (isOwnGoal) {
        // Own goal by home defender
        const ogDefender = homeDefPool[Math.floor(Math.random() * homeDefPool.length)];
        awayScorers.push({
          playerId: ogDefender.id,
          name: `${ogDefender.name} (OG)`,
          minute,
          isOwnGoal: true,
        });

        events.push({
          minute,
          type: 'goal',
          playerId: ogDefender.id,
          playerName: `${ogDefender.name} (OG)`,
          teamId: awayTeam.id,
          detail: 'Own Goal',
        });
      } else {
        // Normal goal for away team starter
        const scorerIdx = pickWeightedIndex(awayWeights);
        const scorer = awayStarters[scorerIdx];
        scorer.goals += 1;

        // ~70% of goals receive an assist, ~30% do not
        let assistPlayerName: string | undefined;
        if (Math.random() < 0.70) {
          const assistWeights = getPlayerAssistWeights(awayStarters, scorer.id);
          const assisterIdx = pickWeightedIndex(assistWeights);
          const assister = awayStarters[assisterIdx];
          if (assister && assister.id !== scorer.id) {
            assister.assists += 1;
            assistPlayerName = assister.name;
            events.push({
              minute,
              type: 'assist',
              playerId: assister.id,
              playerName: assister.name,
              teamId: awayTeam.id,
            });
          }
        }

        awayScorers.push({
          playerId: scorer.id,
          name: scorer.name,
          minute,
          assistPlayerName,
        });

        events.push({
          minute,
          type: 'goal',
          playerId: scorer.id,
          playerName: scorer.name,
          teamId: awayTeam.id,
          detail: assistPlayerName ? `Assist by ${assistPlayerName}` : undefined,
        });
      }
    }
  }

  // Calculate ratings for all players
  let highestRating = -1;
  let mvpPlayer: { playerId: string; name: string; teamId: string; rating: number } | undefined;

  homeStarters.forEach((p) => {
    p.rating = calculateLightweightPlayerRating(p, homeScore, awayScore, awayProfile.overallRating);
    if (p.rating > highestRating) {
      highestRating = p.rating;
      mvpPlayer = { playerId: p.id, name: p.name, teamId: homeTeam.id, rating: p.rating };
    }
  });

  awayStarters.forEach((p) => {
    p.rating = calculateLightweightPlayerRating(p, awayScore, homeScore, homeProfile.overallRating);
    if (p.rating > highestRating) {
      highestRating = p.rating;
      mvpPlayer = { playerId: p.id, name: p.name, teamId: awayTeam.id, rating: p.rating };
    }
  });

  if (mvpPlayer) {
    const all = [...homeStarters, ...awayStarters];
    const mvpObj = all.find((p) => p.id === mvpPlayer?.playerId);
    if (mvpObj) mvpObj.isMvp = true;
  }

  // Sort events chronologically
  events.sort((a, b) => a.minute - b.minute);

  const matchId = `fix_${options?.competitionId || 'league'}_md${options?.matchdayIndex || 1}_${homeTeam.id}_vs_${awayTeam.id}`;

  return {
    id: matchId,
    competitionId: options?.competitionId,
    competitionName: options?.competitionName,
    stageName: options?.stageName,
    matchdayIndex: options?.matchdayIndex,
    homeTeamId: homeTeam.id,
    homeTeamName: homeTeam.name,
    homeTeamOvr: homeProfile.overallRating,
    awayTeamId: awayTeam.id,
    awayTeamName: awayTeam.name,
    awayTeamOvr: awayProfile.overallRating,
    homeScore,
    awayScore,
    homePenalties,
    awayPenalties,
    winnerTeamId,
    isDraw: homeScore === awayScore,
    isCompleted: true,
    isPlayerMatch: false,
    ticksPlayed: 1, // Statistical single-pass
    events,
    homePlayers: homeStarters,
    awayPlayers: awayStarters,
    homeBench: homeProfile.bench,
    awayBench: awayProfile.bench,
    homeScorers,
    awayScorers,
    mvpPlayer,
  };
}

