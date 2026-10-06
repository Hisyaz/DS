import { EditorTeamData, TeamKeyRoles, StadiumConfig, StadiumTier } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import { REAL_CLUB_STADIUM_REGISTRY } from '../data/realClubPresets';

/**
 * POSITION LOCK VALIDATORS FOR KEY PLAYER SYSTEM
 */
export function isGoalkeeperPosition(pos: string | undefined): boolean {
  if (!pos) return false;
  const p = pos.trim().toUpperCase();
  return p === 'GK' || p === 'GOALKEEPER' || p === 'POR';
}

export function isDefenderPosition(pos: string | undefined): boolean {
  if (!pos) return false;
  const p = pos.trim().toUpperCase();
  if (isGoalkeeperPosition(p)) return false;
  return (
    p === 'CB' ||
    p === 'LB' ||
    p === 'RB' ||
    p === 'LWB' ||
    p === 'RWB' ||
    p === 'DEF' ||
    p === 'DF' ||
    p === 'SW' ||
    p.startsWith('D') ||
    p.includes('CB') ||
    p.includes('LB') ||
    p.includes('RB')
  );
}

export function isCreatorPosition(pos: string | undefined): boolean {
  if (!pos) return false;
  const p = pos.trim().toUpperCase();
  if (isGoalkeeperPosition(p) || isDefenderPosition(p)) return false;
  return (
    p === 'CM' ||
    p === 'CAM' ||
    p === 'CDM' ||
    p === 'LM' ||
    p === 'RM' ||
    p === 'MID' ||
    p === 'MF' ||
    p === 'AM' ||
    p === 'DM' ||
    p.startsWith('M') ||
    p.includes('CAM') ||
    p.includes('CM') ||
    p.includes('CDM')
  );
}

export function isGoalscorerPosition(pos: string | undefined): boolean {
  if (!pos) return false;
  const p = pos.trim().toUpperCase();
  if (isGoalkeeperPosition(p)) return false;
  return (
    p === 'ST' ||
    p === 'CF' ||
    p === 'LW' ||
    p === 'RW' ||
    p === 'ATT' ||
    p === 'FW' ||
    p === 'FWD' ||
    p.startsWith('A') ||
    p.startsWith('S') ||
    p.startsWith('F') ||
    p.includes('ST') ||
    p.includes('CF') ||
    p.includes('LW') ||
    p.includes('RW')
  );
}

export interface ValidKeyRolePlayer {
  id: string;
  name: string;
  position: string;
  ovr: number;
  slotNumber: number;
}

/**
 * Gets all valid candidate players from the FIRST TEAM SQUAD for a specific key role.
 */
export function getValidPlayersForKeyRole(
  team: EditorTeamData,
  roleKey: 'goalkeeperPlayerId' | 'defenderPlayerId' | 'creatorPlayerId' | 'goalscorerPlayerId' | 'captainPlayerId'
): ValidKeyRolePlayer[] {
  if (!team || !team.squadSaveFile || !team.squadSaveFile.squad) return [];

  const firstTeamSlots = team.squadSaveFile.squad.filter((s) => s.player !== null && s.player !== undefined);

  const players: ValidKeyRolePlayer[] = firstTeamSlots.map((s) => ({
    id: s.player!.id,
    name: s.player!.name,
    position: s.player!.position || 'ATT',
    ovr: s.player!.ovr || 50,
    slotNumber: s.slotNumber,
  }));

  switch (roleKey) {
    case 'goalkeeperPlayerId':
      return players.filter((p) => isGoalkeeperPosition(p.position));
    case 'defenderPlayerId':
      return players.filter((p) => isDefenderPosition(p.position));
    case 'creatorPlayerId':
      return players.filter((p) => isCreatorPosition(p.position));
    case 'goalscorerPlayerId':
      return players.filter((p) => isGoalscorerPosition(p.position));
    case 'captainPlayerId':
    default:
      return players; // Captain can be any player in first team
  }
}

/**
 * Automatically assigns the HIGHEST RATED (OVR-wise) option in each key role
 * from the first team squad matching the exact position requirements.
 */
export function autoAssignTeamKeyRoles(team: EditorTeamData): EditorTeamData {
  if (!team) return team;

  const validGks = getValidPlayersForKeyRole(team, 'goalkeeperPlayerId').sort((a, b) => b.ovr - a.ovr);
  const validDefs = getValidPlayersForKeyRole(team, 'defenderPlayerId').sort((a, b) => b.ovr - a.ovr);
  const validCreators = getValidPlayersForKeyRole(team, 'creatorPlayerId').sort((a, b) => b.ovr - a.ovr);
  const validGoalscorers = getValidPlayersForKeyRole(team, 'goalscorerPlayerId').sort((a, b) => b.ovr - a.ovr);
  const validCaptains = getValidPlayersForKeyRole(team, 'captainPlayerId').sort((a, b) => b.ovr - a.ovr);

  const bestGkId = validGks[0]?.id || team.goalkeeperPlayerId;
  const bestDefId = validDefs[0]?.id || team.defenderPlayerId;
  const bestCreatorId = validCreators[0]?.id || team.creatorPlayerId;
  const bestGoalscorerId = validGoalscorers[0]?.id || team.goalscorerPlayerId;
  const bestCaptainId = team.captainPlayerId || validCaptains[0]?.id;

  const updatedKeyRoles: TeamKeyRoles = {
    captainPlayerId: bestCaptainId,
    goalkeeperPlayerId: bestGkId,
    defenderPlayerId: bestDefId,
    creatorPlayerId: bestCreatorId,
    goalscorerPlayerId: bestGoalscorerId,
  };

  return {
    ...team,
    captainPlayerId: bestCaptainId,
    goalkeeperPlayerId: bestGkId,
    defenderPlayerId: bestDefId,
    creatorPlayerId: bestCreatorId,
    goalscorerPlayerId: bestGoalscorerId,
    keyRoles: updatedKeyRoles,
  };
}

/**
 * STADIUM TIER DEFINITIONS & METADATA
 */
export interface StadiumTierInfo {
  tier: StadiumTier;
  title: string;
  subtitle: string;
  description: string;
  defaultCapacity: number;
  capacityRange: [number, number];
  badgeColor: string;
  badgeBg: string;
  examples: string;
  features: string[];
}

export const STADIUM_TIERS: Record<StadiumTier, StadiumTierInfo> = {
  1: {
    tier: 1,
    title: 'Tier 1 — Potrero & Local Wood Pitch',
    subtitle: 'Grass Pitch with Wooden Stands & Basic Benches',
    description:
      'Literal potrero pitch with simple wood stands, open perimeter fencing, and minimal infrastructure. Represents early grassroots grounds.',
    defaultCapacity: 2500,
    capacityRange: [500, 8000],
    badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    badgeBg: 'from-amber-950/30 to-amber-900/10 border-amber-500/30',
    examples: 'Barrio Potreros, Local Municipal Field, Grassroots Grounds',
    features: ['Wooden Benches & Earthen Banks', 'Manual Scoreboard', 'Open Air Sidelines', 'Grass / Dirt Surface'],
  },
  2: {
    tier: 2,
    title: 'Tier 2 — Regional Municipal Grounds',
    subtitle: 'Concrete Bleachers & Basic Lighting',
    description:
      'Regional venue with concrete terraces, floodlight towers, press box, and basic ticket gates for domestic league action.',
    defaultCapacity: 12500,
    capacityRange: [5000, 25000],
    badgeColor: 'text-sky-400 border-sky-500/40 bg-sky-950/40',
    badgeBg: 'from-sky-950/30 to-sky-900/10 border-sky-500/30',
    examples: 'Estadio Alfredo Terrera, Estadio Ciudad de Vicente López',
    features: ['Concrete Terraces', 'Floodlight Pylons', 'Local Dressing Rooms', 'Electronic Scoreboard'],
  },
  3: {
    tier: 3,
    title: 'Tier 3 — Classic Iconic Stadium',
    subtitle: 'Historical Steep Stands & Intimidating Wall of Sound',
    description:
      'Famous classic arena featuring steep, multi-tiered brick-and-metal stands, intense acoustic echo, and legendary matchday atmosphere.',
    defaultCapacity: 48000,
    capacityRange: [20000, 60000],
    badgeColor: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/40',
    badgeBg: 'from-indigo-950/30 to-indigo-900/10 border-indigo-500/30',
    examples: 'La Bombonera (Boca), Estadio Monumental, Elland Road, Mestalla',
    features: ['Steep Multi-Tier Stands', 'Atmospheric Acoustic Roof', 'Fan Zone & Trophy Hall', 'Press Conference Suites'],
  },
  4: {
    tier: 4,
    title: 'Tier 4 — Modern Continental Arena',
    subtitle: 'Fully Covered All-Seater & Digital Infrastructure',
    description:
      'High-specification modern stadium with full roof canopy, LED perimeter boards, modern concourses, and UEFA/CONMEBOL grade facilities.',
    defaultCapacity: 62000,
    capacityRange: [40000, 78000],
    badgeColor: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
    badgeBg: 'from-purple-950/30 to-purple-900/10 border-purple-500/30',
    examples: 'Riyadh Air Metropolitano, Groupama Stadium, Emirates Stadium',
    features: ['All-Seater Covered Canopy', 'LED Ribbon Boards & Jumbotrons', 'VIP Executive Suites', 'Integrated Metro Access'],
  },
  5: {
    tier: 5,
    title: 'Tier 5 — State-of-the-Art Ultra-Modern Arena',
    subtitle: 'Futuristic Architectural Marvel with Retractable Pitch & Roof',
    description:
      'The pinnacle of sports engineering: retractable roof and pitch systems, 360° halo screens, luxury climate control, and futuristic exterior lighting.',
    defaultCapacity: 82000,
    capacityRange: [60000, 105000],
    badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    badgeBg: 'from-emerald-950/30 to-emerald-900/10 border-emerald-500/30',
    examples: 'Renovated Santiago Bernabéu, Tottenham Hotspur Stadium, Allianz Arena',
    features: [
      'Retractable Pitch & Roof System',
      '360° Continuous LED Halo Screen',
      'Hyper-Modern Luxury Hospitality',
      'Acoustic sound amplifier canopy',
    ],
  },
};

/**
 * Ensures team has a valid stadium configuration initialized.
 */
export function ensureTeamStadium(team: EditorTeamData): StadiumConfig {
  if (team && team.stadium && team.stadium.name && team.stadium.capacity && team.stadium.tier) {
    // If the stadium is a generic placeholder like "Team Stadium", replace with official database stadium if available
    if (!team.stadium.name.includes(' Stadium') || REAL_CLUB_STADIUM_REGISTRY[team.id]) {
      const match = REAL_CLUB_STADIUM_REGISTRY[team.id];
      if (match && (team.stadium.name === `${team.name} Stadium` || team.stadium.name === 'Default Arena')) {
        return {
          name: match.name,
          capacity: match.capacity,
          tier: match.tier,
        };
      }
      return team.stadium;
    }
  }

  const tid = (team?.id || '').toLowerCase();
  const tname = (team?.name || '').toLowerCase();
  const rep = team?.reputation ?? team?.overallRating ?? 70;

  // Direct lookup from real stadium registry
  if (REAL_CLUB_STADIUM_REGISTRY[tid]) {
    const reg = REAL_CLUB_STADIUM_REGISTRY[tid];
    return {
      name: reg.name,
      capacity: reg.capacity,
      tier: reg.tier,
    };
  }

  // Key match lookup in registry
  const matchKey = Object.keys(REAL_CLUB_STADIUM_REGISTRY).find((k) => tid.includes(k) || k.includes(tid));
  if (matchKey) {
    const reg = REAL_CLUB_STADIUM_REGISTRY[matchKey];
    return {
      name: reg.name,
      capacity: reg.capacity,
      tier: reg.tier,
    };
  }

  let name = `${team?.name || 'Club'} Stadium`;
  let tier: StadiumTier = 3;
  let capacity = 35000;

  if (rep >= 84) {
    tier = 5;
    capacity = 72000;
  } else if (rep >= 76) {
    tier = 4;
    capacity = 52000;
  } else if (rep >= 68) {
    tier = 3;
    capacity = 30000;
  } else if (rep >= 58) {
    tier = 2;
    capacity = 14000;
  } else {
    tier = 1;
    capacity = 3500;
    name = `${team?.name || 'Local'} Ground`;
  }

  return {
    name,
    capacity,
    tier,
  };
}
