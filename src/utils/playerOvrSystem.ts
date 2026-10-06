import { EditorTeamData, SquadGroupKey } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import { isUniqueElitePlayer, getUniqueElitePlayerDef, buildUniquePlayerCard, applyGlobalOvrCap } from './uniquePlayerRegistry';

export interface OvrRange {
  min: number;
  max: number;
}

/**
 * Calculates a weighted random integer roll between [min, max].
 * The probability density increases linearly toward the center (MIN + MAX) / 2,
 * and the minimum and maximum boundaries are exactly 25% less likely than the center.
 */
export function getWeightedRandomIncrease(min: number, max: number): number {
  const minVal = Math.round(min);
  const maxVal = Math.round(max);

  if (minVal >= maxVal) return minVal;

  const center = (minVal + maxVal) / 2;
  const halfRange = (maxVal - minVal) / 2;

  const options: { val: number; weight: number }[] = [];
  let totalWeight = 0;

  for (let x = minVal; x <= maxVal; x++) {
    const dist = Math.abs(x - center);
    // Weight decays linearly from 1.0 at center to 0.75 at boundaries (25% less likely)
    const weight = halfRange > 0 ? 1.0 - 0.25 * (dist / halfRange) : 1.0;
    options.push({ val: x, weight });
    totalWeight += weight;
  }

  let roll = Math.random() * totalWeight;
  for (const opt of options) {
    if (roll < opt.weight) {
      return opt.val;
    }
    roll -= opt.weight;
  }

  return options[options.length - 1].val;
}

/**
 * Identifies if a team is one of the Major Outliers with custom hardcoded roll formulas.
 */
export function getMajorOutlierRange(
  teamId: string,
  groupKey: SquadGroupKey,
  slotNumber: number
): OvrRange | null {
  const tid = teamId.toLowerCase();

  // 1. ENGLAND PREMIER LEAGUE - BIG SIX
  const isPlBigSix = [
    'eng_mancity',
    'eng_liverpool',
    'eng_arsenal',
    'eng_manutd',
    'eng_chelsea',
    'eng_tottenham',
  ].some((id) => tid.includes(id));

  if (isPlBigSix) {
    if (groupKey === 'squad' && slotNumber <= 11) {
      return { min: 1, max: 3 };
    }
    if (groupKey === 'squad' || groupKey === 'reserves') {
      return { min: 0, max: 2 };
    }
    if (groupKey === 'u20' || groupKey === 'u17') {
      return { min: 0, max: 2 };
    }
  }

  // 2. SPAIN LA LIGA - TOP THREE OUTLIERS
  const isLaLigaOutlier = [
    'esp_realmadrid',
    'esp_barcelona',
    'esp_atletico',
  ].some((id) => tid.includes(id));

  if (isLaLigaOutlier) {
    if (groupKey === 'squad' && slotNumber <= 11) {
      return { min: 1, max: 3 };
    }
    if (groupKey === 'squad' || groupKey === 'reserves') {
      return { min: 0, max: 2 };
    }
    if (groupKey === 'u20' || groupKey === 'u17') {
      return { min: 0, max: 2 };
    }
  }

  // 3. PORTUGAL BIG THREE OUTLIERS (Benfica, Sporting, Porto: +1 to +3 OVR)
  const isPortugalBigThree = [
    'por_benfica',
    'por_sporting',
    'por_porto',
  ].some((id) => tid.includes(id));

  if (isPortugalBigThree) {
    if (groupKey === 'squad' && slotNumber <= 11) {
      return { min: 1, max: 3 };
    }
    if (groupKey === 'squad' || groupKey === 'reserves') {
      return { min: 1, max: 2 };
    }
    if (groupKey === 'u20' || groupKey === 'u17') {
      return { min: 1, max: 2 };
    }
  }

  return null;
}

/**
 * Determines base league tier ranges for standard clubs.
 */
export function getBaseLeagueTierRange(
  leagueId: string | undefined,
  countryCode: string | undefined,
  groupKey: SquadGroupKey,
  slotNumber: number
): OvrRange {
  const lid = (leagueId || '').toLowerCase();
  const cCode = (countryCode || '').toUpperCase();

  const isStarter = groupKey === 'squad' && slotNumber <= 11;

  // TIER 1 — ELITE: England Premier League, Spain La Liga, Italy Serie A
  if (
    lid === 'england_d1' ||
    lid === 'spain_d1' ||
    lid === 'italy_d1' ||
    (cCode === 'ENG' && lid.includes('1')) ||
    (cCode === 'ESP' && lid.includes('1')) ||
    (cCode === 'ITA' && lid.includes('1'))
  ) {
    if (isStarter) return { min: 0, max: 2 };
    return { min: 0, max: 1 };
  }

  // TIER 2 — VERY STRONG: France Ligue 1
  if (lid === 'france_d1' || ((cCode === 'FRA' || cCode === 'FR') && lid.includes('1'))) {
    if (isStarter) return { min: 0, max: 2 };
    return { min: 0, max: 1 };
  }

  // TIER 3 — STRONG: Brazil Brasileirão Série A, Saudi Pro League, Portugal Primeira Liga
  if (lid === 'brazil_d1' || lid === 'saudi_d1' || lid === 'portugal_d1' || (cCode === 'BRA' && lid.includes('1')) || ((cCode === 'KSA' || cCode === 'SAU') && lid.includes('1')) || (cCode === 'POR' && (lid.includes('1') || !lid.includes('2')))) {
    if (isStarter) return { min: 0, max: 2 };
    return { min: 0, max: 1 };
  }

  // TIER 4A — CHAMPIONSHIP: England Championship
  if (lid === 'england_d2' || lid.includes('championship')) {
    if (isStarter) return { min: 0, max: 1 };
    return { min: 0, max: 1 };
  }

  // TIER 4 — STRONG/MID: Argentina Primera División, Spain La Liga 2
  if (
    lid === 'argentina_d1' ||
    lid === 'spain_d2' ||
    (cCode === 'ARG' && lid.includes('1')) ||
    (cCode === 'ESP' && lid.includes('2'))
  ) {
    if (isStarter) return { min: 0, max: 1 };
    return { min: 0, max: 1 };
  }

  // TIER 5 — SECOND-TIER: France Ligue 2, Brazil Brasileirão Série B, Italy Serie B
  if (
    lid === 'france_d2' ||
    lid === 'brazil_d2' ||
    lid === 'italy_d2' ||
    ((cCode === 'FRA' || cCode === 'FR') && lid.includes('2')) ||
    (cCode === 'BRA' && lid.includes('2')) ||
    (cCode === 'ITA' && lid.includes('2'))
  ) {
    if (isStarter) return { min: 0, max: 1 };
    return { min: 0, max: 1 };
  }

  // TIER 6 — LOWER SECOND DIVISION & YOUTH
  if (isStarter) return { min: 0, max: 1 };
  return { min: 0, max: 1 };
}

/**
 * Calculates club performance modifier for non-outlier clubs based on team reputation or explicit performance tier.
 */
export function getClubPerformanceModifier(team: EditorTeamData): number {
  const tid = team.id.toLowerCase();
  const rep = team.reputation ?? team.overallRating ?? 70;

  // Specific high-performing / top clubs
  const topClubs = [
    'eng_astonvilla', 'eng_newcastle', 'esp_bilbao', 'esp_girona', 'fra_monaco', 'fra_lille',
    'bra_palmeiras', 'bra_flamengo', 'arg_river', 'arg_boca', 'arg_velez',
    'sau_alhilal', 'sau_alnassr', 'sau_alittihad', 'sau_alahli', 'sau_alqadsiah',
    'ita_inter', 'ita_milan', 'ita_napoli', 'ita_juventus', 'ita_atalanta',
    'por_braga', 'por_vitoria'
  ];
  if (topClubs.some((id) => tid.includes(id))) return 1;

  const strongHighPerformers = [
    'eng_brighton', 'eng_bournemouth', 'fra_brest', 'fra_lyon', 'fra_nice',
    'bra_botafogo', 'bra_fortaleza', 'bra_bahia', 'arg_racing', 'arg_estudiantes', 'arg_rosariocentral',
    'sau_alshabab', 'sau_alettifaq', 'sau_altaawoun',
    'ita_roma', 'ita_lazio', 'ita_fiorentina', 'ita_bologna'
  ];
  if (strongHighPerformers.some((id) => tid.includes(id))) return 1;

  // Specific poor-performing / weak clubs
  const poorPerformers = [
    'eng_everton', 'eng_nottingham', 'eng_ipswich', 'eng_southampton',
    'esp_sevilla', 'esp_laspalmas', 'esp_leganes', 'esp_valladolid',
    'fra_montpellier', 'fra_nantes', 'fra_lehavre', 'fra_auxerre', 'fra_angers',
    'bra_cuiaba', 'bra_criciuma', 'bra_juventude',
    'arg_tigre', 'arg_centralcordoba', 'arg_barracas', 'arg_sarmiento', 'arg_riestra', 'arg_independienteriv',
    'sau_alorobah', 'sau_alkholood', 'sau_alokhdood', 'sau_alriyadh',
    'ita_venezia', 'ita_empoli', 'ita_lecce', 'ita_como'
  ];
  if (poorPerformers.some((id) => tid.includes(id))) return -1;

  // Rating fallback tiers
  if (rep >= 82) return 1;
  if (rep <= 68) return -1;

  return 0;
}

/**
 * Calculates the exact [MIN, MAX] OVR increase range for a player slot on a team.
 */
export function getOvrIncreaseRange(
  team: EditorTeamData,
  groupKey: SquadGroupKey,
  slotNumber: number
): OvrRange {
  // Check Major Outlier first
  const outlierRange = getMajorOutlierRange(team.id, groupKey, slotNumber);
  if (outlierRange) {
    return outlierRange;
  }

  // Standard league tier base range
  const baseRange = getBaseLeagueTierRange(team.leagueId, team.countryCode, groupKey, slotNumber);
  const modifier = getClubPerformanceModifier(team);

  const effectiveMin = Math.max(0, baseRange.min + modifier);
  const effectiveMax = Math.max(effectiveMin, baseRange.max + modifier);

  return { min: effectiveMin, max: effectiveMax };
}

/**
 * Upgrades an existing player's OVR using the League Strength System rules.
 * Preserves player identity and individual attribute balance while capping strictly
 * to regional ceilings (South America <= 82, Europe non-unique <= 87).
 */
export function applyLeagueStrengthSystemToPlayer(
  player: PlayerCardData,
  team: EditorTeamData,
  groupKey: SquadGroupKey,
  slotNumber: number
): PlayerCardData {
  if (!player) return player;

  const uDef = getUniqueElitePlayerDef(player);
  if (uDef) {
    return buildUniquePlayerCard(uDef, player);
  }

  // Idempotency check: if player has already been upgraded by this system, apply global cap and return
  if ((player as any).leagueStrengthOvrApplied) {
    return applyGlobalOvrCap(player);
  }

  const isSouthAmerican =
    team.countryCode === 'BRA' ||
    team.countryCode === 'ARG' ||
    player.clubCountry === 'BRA' ||
    player.clubCountry === 'ARG' ||
    team.leagueId?.includes('brazil') ||
    team.leagueId?.includes('argentina');

  const isSaudiLeague =
    team.countryCode === 'KSA' ||
    team.countryCode === 'SAU' ||
    player.clubCountry === 'KSA' ||
    player.clubCountry === 'SAU' ||
    team.leagueId?.includes('saudi');

  const isLocalSaudi =
    isSaudiLeague &&
    (player.nationality?.code === 'KSA' ||
      player.nationality?.code === 'SAU' ||
      player.nationality?.name?.toLowerCase().includes('saudi'));

  const isPortugalD2 =
    team.leagueId === 'portugal_d2' ||
    (team.countryCode === 'POR' && team.leagueId?.includes('d2')) ||
    (player as any).leagueId === 'portugal_d2';

  const isPortugalD1 =
    (team.countryCode === 'POR' && !isPortugalD2) ||
    team.leagueId === 'portugal_d1' ||
    (player as any).leagueId === 'portugal_d1';

  const isStateOnly =
    team.leagueId === 'brazil_state_only' ||
    (team as any).isStateChampionshipsOnly ||
    (team as any).isCupOnly ||
    (player as any).leagueId === 'brazil_state_only';

  let maxCap = 87;
  let minFloor = 40;

  if (isStateOnly) {
    maxCap = 64;
    minFloor = 55;
  } else if (isSouthAmerican) {
    maxCap = 82;
  } else if (isPortugalD2) {
    maxCap = 74;
  } else if (isPortugalD1) {
    maxCap = 81;
  } else if (isSaudiLeague) {
    if (isLocalSaudi) {
      maxCap = 78; // Local players 60-78 OVR (registered 80+ stars handled via unique registry)
      minFloor = groupKey === 'squad' && slotNumber <= 11 ? 68 : 60;
    } else {
      maxCap = 92; // Foreign stars 80-92 OVR
      minFloor = 80;
    }
  }

  const range = getOvrIncreaseRange(team, groupKey, slotNumber);
  const increase = getWeightedRandomIncrease(range.min, range.max);

  const currentOvr = player.ovr || 50;
  const finalOvr = Math.min(maxCap, Math.max(minFloor, currentOvr + increase));

  // Keep individual stats scaled proportionally so attributes remain distinct and un-equalized
  const updatedStats = player.stats
    ? {
        pro: Math.min(maxCap, Math.max(20, player.stats.pro + increase)),
        def: Math.min(maxCap, Math.max(20, player.stats.def + increase)),
        cre: Math.min(maxCap, Math.max(20, player.stats.cre + increase)),
        men: Math.min(maxCap, Math.max(20, player.stats.men + increase)),
        goa: Math.min(maxCap, Math.max(20, player.stats.goa + (player.position === 'GK' || player.subPosition === 'GK' ? increase : 0))),
        phy: Math.min(maxCap, Math.max(20, player.stats.phy + increase)),
      }
    : {
        pro: finalOvr,
        def: player.position === 'GK' ? finalOvr : Math.max(30, finalOvr - 10),
        cre: Math.max(30, finalOvr - 5),
        men: finalOvr,
        goa: player.position === 'GK' ? finalOvr : 20,
        phy: finalOvr,
      };

  const updatedPlayer: PlayerCardData = {
    ...player,
    ovr: finalOvr,
    potentialOvr: Math.min(maxCap, Math.max(finalOvr + 2, (player.potentialOvr || currentOvr + 4) + increase)),
    stats: updatedStats,
    leagueStrengthOvrApplied: true,
  } as PlayerCardData;

  return applyGlobalOvrCap(updatedPlayer);
}

/**
 * Upgrades all existing players across all squad save groups in a team using current OVR.
 */
export function applyLeagueStrengthSystemToTeam(team: EditorTeamData): EditorTeamData {
  if (!team || !team.squadSaveFile) return team;

  const saveFile = team.squadSaveFile;
  const groupKeys: SquadGroupKey[] = ['squad', 'reserves', 'u20', 'u17'];

  const updatedSaveFile = { ...saveFile };

  groupKeys.forEach((gk) => {
    const slots = saveFile[gk] || [];
    updatedSaveFile[gk] = slots.map((slot) => {
      if (!slot || !slot.player) return slot;
      return {
        ...slot,
        player: applyLeagueStrengthSystemToPlayer(slot.player, team, gk, slot.slotNumber),
      };
    });
  });

  return {
    ...team,
    squadSaveFile: updatedSaveFile,
  };
}
