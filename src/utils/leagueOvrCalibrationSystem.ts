import { EditorTeamData, LeagueDatabase, SquadGroupKey } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import { isUniqueElitePlayer } from './uniquePlayerRegistry';
import { getStartingXI } from './teamStrengthSystem';
import { getLeagueDatabase } from './leagueDatabaseSystem';

/**
 * CALIBRATION TARGET LEAGUE STARTER OVR TABLE
 * Exactly 17 professional/main leagues calibrated to target database averages.
 */
export const TARGET_LEAGUE_STARTER_OVRS: Record<string, { name: string; tier: '1st' | '2nd'; country: string; target: number }> = {
  england_d1: { name: 'Premier League', tier: '1st', country: 'England', target: 78 },
  spain_d1: { name: 'La Liga EA Sports', tier: '1st', country: 'Spain', target: 78 },
  italy_d1: { name: 'Serie A', tier: '1st', country: 'Italy', target: 77 },
  germany_d1: { name: 'Bundesliga', tier: '1st', country: 'Germany', target: 76 },
  france_d1: { name: 'Ligue 1 Uber Eats', tier: '1st', country: 'France', target: 75 },
  portugal_d1: { name: 'Liga Portugal', tier: '1st', country: 'Portugal', target: 74 },
  brazil_d1: { name: 'Brasileirão Série A', tier: '1st', country: 'Brazil', target: 73 },
  england_d2: { name: 'EFL Championship', tier: '2nd', country: 'England', target: 73 },
  saudi_d1: { name: 'Saudi Pro League', tier: '1st', country: 'Saudi Arabia', target: 72 },
  spain_d2: { name: 'La Liga Hypermotion', tier: '2nd', country: 'Spain', target: 72 },
  argentina_d1: { name: 'Liga Profesional de Fútbol', tier: '1st', country: 'Argentina', target: 71 },
  italy_d2: { name: 'Serie B', tier: '2nd', country: 'Italy', target: 70 },
  france_d2: { name: 'Ligue 2 BKT', tier: '2nd', country: 'France', target: 70 },
  brazil_d2: { name: 'Brasileirão Série B', tier: '2nd', country: 'Brazil', target: 69 },
  portugal_d2: { name: 'Liga Portugal 2', tier: '2nd', country: 'Portugal', target: 69 },
  germany_d2: { name: '2. Bundesliga', tier: '2nd', country: 'Germany', target: 69 },
  argentina_d2: { name: 'Primera Nacional', tier: '2nd', country: 'Argentina', target: 68 },
};

/**
 * Normalizes league ID or name to matching key in TARGET_LEAGUE_STARTER_OVRS.
 */
export function resolveTargetLeagueKey(leagueIdOrName?: string): string | null {
  if (!leagueIdOrName) return null;
  const lower = leagueIdOrName.toLowerCase().trim().replace(/[\s\.\-_]+/g, '_');

  // 1. Exact match by key or full name
  for (const [key, info] of Object.entries(TARGET_LEAGUE_STARTER_OVRS)) {
    if (lower === key) return key;
    const infoNameLower = info.name.toLowerCase().replace(/[\s\.\-_]+/g, '_');
    if (lower === infoNameLower) return key;
  }

  // 2. Division 2 Specific checks (checked FIRST to avoid substring overlap with Div 1)
  if (lower.includes('championship') || (lower.includes('england') && (lower.includes('2') || lower.includes('d2')))) return 'england_d2';
  if (lower.includes('hypermotion') || lower.includes('segunda') || (lower.includes('spain') && (lower.includes('2') || lower.includes('d2'))) || (lower.includes('la_liga') && (lower.includes('2') || lower.includes('hypermotion')))) return 'spain_d2';
  if (lower.includes('serie_b') || (lower.includes('italy') && (lower.includes('2') || lower.includes('d2')))) return 'italy_d2';
  if (lower.includes('2_bundesliga') || (lower.includes('bundesliga') && lower.includes('2')) || (lower.includes('germany') && (lower.includes('2') || lower.includes('d2')))) return 'germany_d2';
  if (lower.includes('ligue_2') || (lower.includes('france') && (lower.includes('2') || lower.includes('d2')))) return 'france_d2';
  if (lower.includes('portugal_2') || (lower.includes('portugal') && (lower.includes('2') || lower.includes('d2')))) return 'portugal_d2';
  if (lower.includes('nacional') || (lower.includes('argentina') && (lower.includes('2') || lower.includes('d2')))) return 'argentina_d2';
  if (lower.includes('serie_b') || (lower.includes('brazil') && (lower.includes('2') || lower.includes('d2') || lower.includes('b')))) return 'brazil_d2';

  // 3. Division 1 Specific checks
  if (lower.includes('premier') || (lower.includes('england') && (lower.includes('1') || lower.includes('d1') || lower.includes('epl')))) return 'england_d1';
  if (lower.includes('la_liga') || (lower.includes('spain') && (lower.includes('1') || lower.includes('d1')))) return 'spain_d1';
  if (lower.includes('serie_a') || (lower.includes('italy') && (lower.includes('1') || lower.includes('d1')))) return 'italy_d1';
  if (lower.includes('bundesliga') || (lower.includes('germany') && (lower.includes('1') || lower.includes('d1')))) return 'germany_d1';
  if (lower.includes('ligue_1') || (lower.includes('france') && (lower.includes('1') || lower.includes('d1')))) return 'france_d1';
  if (lower.includes('portugal') || lower.includes('primeira')) return 'portugal_d1';
  if (lower.includes('saudi') || lower.includes('spl') || lower.includes('roshn')) return 'saudi_d1';
  if (lower.includes('argentina') || lower.includes('profesional')) return 'argentina_d1';
  if (lower.includes('brazil') || lower.includes('brasileirao') || lower.includes('serie_a')) return 'brazil_d1';

  return null;
}

/**
 * Returns the target average starter OVR for a league.
 */
export function getLeagueTargetStarterOvr(leagueIdOrName?: string): number {
  const key = resolveTargetLeagueKey(leagueIdOrName);
  if (key && TARGET_LEAGUE_STARTER_OVRS[key]) {
    return TARGET_LEAGUE_STARTER_OVRS[key].target;
  }
  return 74; // Standard fallback
}

/**
 * Calculates a club's ACTUAL Starter OVR directly from its starting XI players.
 * The player database is the single source of truth.
 */
export function calculateClubStarterOvr(team: EditorTeamData): number {
  if (!team) return 70;

  const starters = getStartingXI(team);
  if (starters && starters.length > 0) {
    const sum = starters.reduce((acc, s) => {
      const pOvr = s.player?.ovr ?? 70;
      return acc + pOvr;
    }, 0);
    return Math.round((sum / starters.length) * 10) / 10;
  }

  // Fallback to calibrated target if squad slots are not loaded
  return getCalibratedClubStarterTarget(team);
}

/**
 * Calculates the league's ACTUAL Avg. Starter OVR from all clubs in that league.
 * Does not force or hardcode: it strictly iterates the clubs in the database and averages their Starter OVRs.
 */
export function calculateLeagueAvgStarterOvr(
  leagueIdOrName: string,
  db?: LeagueDatabase
): number {
  const currentDb = db || getLeagueDatabase();
  if (!currentDb || !currentDb.leagues || !currentDb.teams) {
    return getLeagueTargetStarterOvr(leagueIdOrName);
  }

  const leagueKey = resolveTargetLeagueKey(leagueIdOrName);
  
  // Find league object
  let leagueObj = Object.values(currentDb.leagues).find((l) => {
    if (!l) return false;
    if (l.id === leagueIdOrName || l.name === leagueIdOrName) return true;
    if (leagueKey && (l.id === leagueKey || resolveTargetLeagueKey(l.id) === leagueKey || resolveTargetLeagueKey(l.name) === leagueKey)) {
      return true;
    }
    return false;
  });

  const teamIds = leagueObj?.teamIds || [];
  let leagueTeams = teamIds.map((id) => currentDb.teams[id]).filter(Boolean);

  if (leagueTeams.length === 0) {
    // Search teams by leagueId or matching country/division
    leagueTeams = Object.values(currentDb.teams).filter((t) => {
      if (!t) return false;
      if (t.leagueId === leagueIdOrName || (leagueObj && t.leagueId === leagueObj.id)) return true;
      if (leagueKey && resolveTargetLeagueKey(t.leagueId) === leagueKey) return true;
      return false;
    });
  }

  if (leagueTeams.length === 0) {
    return getLeagueTargetStarterOvr(leagueIdOrName);
  }

  const starterOvrs = leagueTeams.map((t) => calculateClubStarterOvr(t));
  const avg = starterOvrs.reduce((a, b) => a + b, 0) / starterOvrs.length;
  return Math.round(avg * 10) / 10;
}

/**
 * Calculates a club's calibrated starter target within its league's hierarchy.
 * Preserves realistic hierarchy (top clubs above average, mid-table at average, lower below).
 */
export function getCalibratedClubStarterTarget(team: EditorTeamData, leagueId?: string): number {
  const lid = team.leagueId || leagueId;
  const targetLeagueKey = resolveTargetLeagueKey(lid);
  if (!targetLeagueKey || !TARGET_LEAGUE_STARTER_OVRS[targetLeagueKey]) {
    return team.reputation ?? team.overallRating ?? 70;
  }

  const info = TARGET_LEAGUE_STARTER_OVRS[targetLeagueKey];
  const target = info.target;
  const tid = (team.id || '').toLowerCase();
  const rep = team.reputation ?? team.overallRating ?? 70;

  // Compute league average reputation from known database benchmarks
  let baseLeagueRep = 75;
  if (targetLeagueKey === 'england_d1') baseLeagueRep = 78.2;
  else if (targetLeagueKey === 'spain_d1') baseLeagueRep = 77.8;
  else if (targetLeagueKey === 'italy_d1') baseLeagueRep = 77.9;
  else if (targetLeagueKey === 'germany_d1') baseLeagueRep = 78.9;
  else if (targetLeagueKey === 'france_d1') baseLeagueRep = 76.6;
  else if (targetLeagueKey === 'portugal_d1') baseLeagueRep = 73.7;
  else if (targetLeagueKey === 'brazil_d1') baseLeagueRep = 79.7;
  else if (targetLeagueKey === 'england_d2') baseLeagueRep = 67.04;
  else if (targetLeagueKey === 'saudi_d1') baseLeagueRep = 73.2;
  else if (targetLeagueKey === 'spain_d2') baseLeagueRep = 69.55;
  else if (targetLeagueKey === 'argentina_d1') baseLeagueRep = 77.07;
  else if (targetLeagueKey === 'italy_d2') baseLeagueRep = 69.5;
  else if (targetLeagueKey === 'france_d2') baseLeagueRep = 67.2;
  else if (targetLeagueKey === 'brazil_d2') baseLeagueRep = 72.65;
  else if (targetLeagueKey === 'portugal_d2') baseLeagueRep = 66.1;
  else if (targetLeagueKey === 'germany_d2') baseLeagueRep = 71.7;
  else if (targetLeagueKey === 'argentina_d2') baseLeagueRep = 69.6;

  const repDiff = rep - baseLeagueRep;

  // Custom calibration per league to hit target averages precisely while maintaining hierarchy
  if (targetLeagueKey === 'england_d1') {
    if (tid.includes('mancity')) return 85;
    if (tid.includes('arsenal') || tid.includes('liverpool')) return 84;
    if (tid.includes('chelsea') || tid.includes('manutd') || tid.includes('tottenham')) return 81;
    if (tid.includes('astonvilla') || tid.includes('newcastle')) return 80;
    return Math.round(target + repDiff * 0.55 - 0.45);
  }

  if (targetLeagueKey === 'spain_d1') {
    if (tid.includes('realmadrid')) return 86;
    if (tid.includes('barcelona')) return 85;
    if (tid.includes('atletico')) return 83;
    if (tid.includes('realsociedad') || tid.includes('bilbao') || tid.includes('villarreal') || tid.includes('girona')) return 79;
    return Math.round(target + repDiff * 0.55 - 0.4);
  }

  if (targetLeagueKey === 'italy_d1') {
    if (tid.includes('inter')) return 84;
    if (tid.includes('milan') || tid.includes('juventus') || tid.includes('napoli')) return 82;
    if (tid.includes('atalanta') || tid.includes('roma') || tid.includes('lazio') || tid.includes('fiorentina')) return 79;
    return Math.round(target + repDiff * 0.55 - 0.7);
  }

  if (targetLeagueKey === 'germany_d1') {
    if (tid.includes('bayern')) return 85;
    if (tid.includes('dortmund') || tid.includes('leverkusen') || tid.includes('leipzig')) return 80;
    if (tid.includes('frankfurt') || tid.includes('stuttgart')) return 77;
    return Math.round(target + repDiff * 0.55 - 0.35);
  }

  if (targetLeagueKey === 'france_d1') {
    if (tid.includes('psg')) return 84;
    if (tid.includes('marseille') || tid.includes('monaco') || tid.includes('lille') || tid.includes('lyon')) return 78;
    return Math.round(target + repDiff * 0.55 - 0.3);
  }

  if (targetLeagueKey === 'portugal_d1') {
    if (tid.includes('benfica') || tid.includes('sporting') || tid.includes('porto')) return 80;
    if (tid.includes('braga') || tid.includes('vitoria')) return 75;
    return Math.round(target + repDiff * 0.55 + 0.1);
  }

  if (targetLeagueKey === 'brazil_d1') {
    if (tid.includes('flamengo') || tid.includes('palmeiras') || tid.includes('botafogo') || tid.includes('atleticomineiro')) return 76;
    if (tid.includes('saopaulo') || tid.includes('corinthians') || tid.includes('fluminense') || tid.includes('internacional') || tid.includes('gremio')) return 74;
    return Math.round(target + repDiff * 0.55 - 0.4);
  }

  if (targetLeagueKey === 'england_d2') {
    return Math.round(target + repDiff * 0.55);
  }

  if (targetLeagueKey === 'saudi_d1') {
    if (tid.includes('alhilal') || tid.includes('alnassr') || tid.includes('alittihad') || tid.includes('alahli')) return 77;
    if (tid.includes('alshabab') || tid.includes('alettifaq') || tid.includes('alqadsiah')) return 73;
    return Math.round(target + repDiff * 0.55 - 0.1);
  }

  if (targetLeagueKey === 'spain_d2') {
    return Math.round(target + repDiff * 0.55 - 0.1);
  }

  if (targetLeagueKey === 'argentina_d1') {
    if (tid.includes('river') || tid.includes('boca')) return 76;
    if (tid.includes('racing') || tid.includes('velez') || tid.includes('estudiantes') || tid.includes('talleres')) return 73;
    return Math.round(target + repDiff * 0.55 - 0.2);
  }

  if (targetLeagueKey === 'italy_d2') {
    return Math.round(target + repDiff * 0.55);
  }

  if (targetLeagueKey === 'france_d2') {
    return Math.round(target + repDiff * 0.55);
  }

  if (targetLeagueKey === 'brazil_d2') {
    return Math.round(target + repDiff * 0.55 - 0.1);
  }

  if (targetLeagueKey === 'portugal_d2') {
    return Math.round(target + repDiff * 0.55 - 0.1);
  }

  if (targetLeagueKey === 'germany_d2') {
    return Math.round(target + repDiff * 0.55);
  }

  if (targetLeagueKey === 'argentina_d2') {
    return Math.round(target + repDiff * 0.55);
  }

  return Math.round(target + repDiff * 0.55);
}

/**
 * Calculates Youth and Reserve OVR ranges strictly relative to THAT club's actual Starter OVR.
 * 
 * Rules:
 * - RESERVES: 3–5 OVR points below the club's Starter OVR. (e.g. Starter 78 -> 73–75)
 * - U20: 6–9 OVR points below the club's Starter OVR. (e.g. Starter 78 -> 69–72)
 * - U17: 10–15 OVR points below the club's Starter OVR. (e.g. Starter 78 -> 63–68)
 * - SUBS (slots 12-18): 2–4 OVR points below the club's Starter OVR.
 */
export function getClubYouthAndReserveOvrRanges(clubStarterOvr: number): {
  starterOvr: number;
  subs: { min: number; max: number; target: number };
  reserves: { min: number; max: number; target: number };
  u20: { min: number; max: number; target: number };
  u17: { min: number; max: number; target: number };
} {
  const roundedStarter = Math.round(clubStarterOvr);

  return {
    starterOvr: roundedStarter,
    subs: {
      min: Math.max(40, roundedStarter - 4),
      max: Math.max(40, roundedStarter - 2),
      target: Math.max(40, roundedStarter - 3),
    },
    reserves: {
      min: Math.max(40, roundedStarter - 5),
      max: Math.max(40, roundedStarter - 3),
      target: Math.max(40, roundedStarter - 4),
    },
    u20: {
      min: Math.max(40, roundedStarter - 9),
      max: Math.max(40, roundedStarter - 6),
      target: Math.max(40, roundedStarter - 8),
    },
    u17: {
      min: Math.max(40, roundedStarter - 15),
      max: Math.max(40, roundedStarter - 10),
      target: Math.max(40, roundedStarter - 13),
    },
  };
}

/**
 * Recalibrates a team's Reserve, U20, and U17 squads to stay strictly within
 * the required relationship to their parent club's actual Starter OVR.
 * Preserves player identity, unique elite cards, positions, playstyles, and traits.
 */
export function synchronizeTeamYouthAndReservesWithStarterOvr(team: EditorTeamData): EditorTeamData {
  if (!team || !team.squadSaveFile) return team;

  const actualStarterOvr = calculateClubStarterOvr(team);
  const ranges = getClubYouthAndReserveOvrRanges(actualStarterOvr);

  const saveFile = team.squadSaveFile;
  const groupsToSync: { groupKey: SquadGroupKey; targetRange: { min: number; max: number; target: number } }[] = [
    { groupKey: 'reserves', targetRange: ranges.reserves },
    { groupKey: 'u20', targetRange: ranges.u20 },
    { groupKey: 'u17', targetRange: ranges.u17 },
  ];

  let hasChanges = false;
  const updatedSaveFile = { ...saveFile };

  groupsToSync.forEach(({ groupKey, targetRange }) => {
    const slots = saveFile[groupKey] || [];
    const updatedSlots = slots.map((slot) => {
      if (!slot || !slot.player) return slot;
      if (isUniqueElitePlayer(slot.player)) return slot;

      const p = slot.player;
      const currentOvr = p.ovr || targetRange.target;

      // Check if player OVR falls outside this club's relative target bracket
      if (currentOvr < targetRange.min || currentOvr > targetRange.max) {
        hasChanges = true;
        // Deterministic variation across slots within the bracket
        const slotOffset = (slot.slotNumber % (targetRange.max - targetRange.min + 1));
        const newOvr = Math.min(targetRange.max, Math.max(targetRange.min, targetRange.min + slotOffset));
        const delta = newOvr - currentOvr;

        const updatedStats = p.stats
          ? {
              pro: Math.max(30, Math.min(99, p.stats.pro + delta)),
              def: Math.max(30, Math.min(99, p.stats.def + delta)),
              cre: Math.max(30, Math.min(99, p.stats.cre + delta)),
              men: Math.max(30, Math.min(99, p.stats.men + delta)),
              goa: p.position === 'GK' || p.subPosition === 'GK' ? Math.max(30, Math.min(99, p.stats.goa + delta)) : p.stats.goa,
              phy: Math.max(30, Math.min(99, p.stats.phy + delta)),
            }
          : undefined;

        const updatedPlayer: PlayerCardData = {
          ...p,
          ovr: newOvr,
          potentialOvr: Math.min(99, Math.max(newOvr + 4, (p.potentialOvr || newOvr + 6) + delta)),
          stats: updatedStats || p.stats,
        };

        return {
          ...slot,
          player: updatedPlayer,
        };
      }

      return slot;
    });

    updatedSaveFile[groupKey] = updatedSlots;
  });

  if (!hasChanges) return team;

  return {
    ...team,
    squadSaveFile: updatedSaveFile,
  };
}
