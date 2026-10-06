import { Nationality, PlayerCardData } from '../types';
import { NationalTeam, NationalTeamTier, InternationalCallUp } from '../types/nationalTeam';
import { NATIONALITIES } from '../constants';
import { generateEnglishPlayerNationalityAndName } from './englishNameGenerator';
import { generateFrenchPlayerNationalityAndName } from './frenchNameGenerator';
import { generateSpanishPlayerNationalityAndName } from './spanishNameGenerator';
import { generateArgentinePlayerNationalityAndName } from './argentinaNameGenerator';
import { generateBrazilianPlayerNationalityAndName } from './brazilNameGenerator';
import { isTop20NationalTeam, checkU17QualifiersEligibility, checkU17WorldCupEligibility } from './u17NationalTeamEngine';
import {
  getU20EligibleCallUpQueue,
  checkU20QualifiersEligibility,
  checkU20WorldCupEligibility,
} from './u20NationalTeamEngine';

// Default Managers per major country
export const NATIONAL_MANAGERS: Record<string, { name: string; tactic: string }> = {
  ENG: { name: 'Thomas Tuchel', tactic: '4-2-3-1 High Press' },
  FRA: { name: 'Didier Deschamps', tactic: '4-3-3 Counter Attack' },
  ESP: { name: 'Luis de la Fuente', tactic: '4-3-3 Tiki-Taka' },
  ARG: { name: 'Lionel Scaloni', tactic: '4-4-2 Fluid' },
  BRA: { name: 'Dorival Júnior', tactic: '4-2-3-1 Samba Attack' },
  GER: { name: 'Julian Nagelsmann', tactic: '4-2-3-1 Heavy Metal' },
  ITA: { name: 'Luciano Spalletti', tactic: '3-5-2 Tactical Defense' },
  POR: { name: 'Roberto Martínez', tactic: '4-3-3 Offensive' },
  NED: { name: 'Ronald Koeman', tactic: '4-3-3 Dutch Total Football' },
  BEL: { name: 'Domenico Tedesco', tactic: '4-2-3-1 Wing Play' },
  IRL: { name: 'Heimir Hallgrímsson', tactic: '4-4-2 Solid Block' },
  SCO: { name: 'Steve Clarke', tactic: '3-4-2-1 High Energy' },
  WAL: { name: 'Craig Bellamy', tactic: '4-3-3 Transition' },
  USA: { name: 'Mauricio Pochettino', tactic: '4-2-3-1 Pressing' },
  MEX: { name: 'Javier Aguirre', tactic: '4-3-3 Aggressive' },
  JPN: { name: 'Hajime Moriyasu', tactic: '4-2-3-1 High Pace' },
};

/**
 * Get all eligible nationalities for a player.
 * If Senior Locked, ONLY returns the Senior Nation / active nationality.
 * Otherwise, returns active nationality + all secondary/other nationalities.
 */
export function getEligibleNationalities(player: PlayerCardData): Nationality[] {
  const activeNat = player.nationality || { code: 'ENG', iso: 'gb-eng', name: 'England' };

  // If Senior Locked, ONLY return active nationality
  if (player.isSeniorLocked || player.seniorNationalTeamLocked) {
    return [activeNat];
  }

  const rawOthers = [
    ...(player.otherNationalities || []),
    ...(player.extraNationalities || []),
  ];

  const pool = [activeNat, ...rawOthers];

  // Deduplicate by nation code/name
  const uniqueNats: Nationality[] = [];
  pool.forEach((nat) => {
    if (nat && nat.code && !uniqueNats.some((u) => u.code === nat.code)) {
      uniqueNats.push(nat);
    }
  });

  return uniqueNats.length > 0 ? uniqueNats : [activeNat];
}

/**
 * Procedurally generate a name appropriate for a nation code.
 */
export function generateNationPlayerName(nationCode: string): string {
  const upperCode = nationCode.toUpperCase();
  if (upperCode === 'ENG') {
    return generateEnglishPlayerNationalityAndName().name;
  }
  if (upperCode === 'FRA') {
    return generateFrenchPlayerNationalityAndName().name;
  }
  if (upperCode === 'ESP') {
    return generateSpanishPlayerNationalityAndName().name;
  }
  if (upperCode === 'ARG') {
    return generateArgentinePlayerNationalityAndName().name;
  }
  if (upperCode === 'BRA') {
    return generateBrazilianPlayerNationalityAndName().name;
  }

  // Fallback generic name generation
  const genericFirsts = ['Mateo', 'Leo', 'Lucas', 'Julian', 'Marco', 'Oliver', 'Noah', 'Elias', 'Sami', 'Milan'];
  const genericLasts = ['Silva', 'Santos', 'Kovac', 'Novak', 'Rossi', 'Müller', 'Jansen', 'Dimitrov', 'Popov', 'Popa'];
  const f = genericFirsts[Math.floor(Math.random() * genericFirsts.length)];
  const l = genericLasts[Math.floor(Math.random() * genericLasts.length)];
  return `${f} ${l}`;
}

/**
 * Generate or populate a full National Team squad (23 players)
 */
export function generateNationalTeamSquad(
  nation: Nationality,
  tier: NationalTeamTier,
  existingPlayers: PlayerCardData[] = []
): PlayerCardData[] {
  const matchedPlayers = existingPlayers.filter((p) => {
    const el = getEligibleNationalities(p);
    return el.some((n) => n.code === nation.code);
  });

  const squad: PlayerCardData[] = [...matchedPlayers];

  // Define position distribution & target OVR ranges per tier
  const positions = [
    'GK', 'GK', 'GK',
    'CB', 'CB', 'CB', 'CB', 'LB', 'LB', 'RB', 'RB',
    'CDM', 'CDM', 'CM', 'CM', 'CAM', 'CAM',
    'LW', 'LW', 'RW', 'RW', 'ST', 'ST'
  ];

  let minAge = 15;
  let maxAge = 17;
  let baseOvr = 63;
  let ovrSpread = 6;
  let maxOvrCap = 73;

  if (tier === 'U20') {
    minAge = 18;
    maxAge = 20;
    baseOvr = 69;
    ovrSpread = 7;
    maxOvrCap = 79;
  } else if (tier === 'Senior') {
    minAge = 21;
    maxAge = 33;
    baseOvr = 77;
    ovrSpread = 10;
    maxOvrCap = 88;
  }

  // Fill up to 23 players
  let idx = 0;
  while (squad.length < 23) {
    const pos = positions[idx % positions.length];
    const generatedName = generateNationPlayerName(nation.code);
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const generatedOvr = Math.min(maxOvrCap, Math.max(50, baseOvr + Math.floor(Math.random() * ovrSpread) - 2));

    const genPlayer: PlayerCardData = {
      id: `nat-${nation.code}-${tier}-${squad.length + 1}-${Date.now()}`,
      name: generatedName,
      ovr: generatedOvr,
      age,
      club: `${nation.name} ${tier} Squad`,
      nationality: nation,
      position: pos,
      stats: {
        pro: generatedOvr,
        def: Math.max(40, generatedOvr - 6),
        cre: Math.max(40, generatedOvr - 3),
        men: Math.max(40, generatedOvr - 2),
        goa: Math.max(40, generatedOvr - 4),
        phy: Math.max(40, generatedOvr - 2),
      },
      heightCm: 180,
      weightKg: 74,
      biometrics: {
        strength: 70,
        skinColor: '#d4a373',
        hairStyle: 'straight',
        hairLength: 'short',
        hairRoot: '#1e293b',
        hairDye: '#1e293b',
      },
      accessories: { accessory: 'none', headbandColor: '#ffffff' },
      kit: { style: 'normal', color1: '#1e3a8a', color2: '#ffffff', pattern: 'solid', collar: 'crew' },
      emblem: { shape: 'crested-shield', mode: '1', color1: '#1e3a8a', color2: '#ffffff' },
    };

    squad.push(genPlayer);
    idx++;
  }

  return squad;
}

/**
 * Factory function to create a National Team object
 */
export function createNationalTeam(
  nation: Nationality,
  tier: NationalTeamTier,
  existingPlayers: PlayerCardData[] = []
): NationalTeam {
  const squad = generateNationalTeamSquad(nation, tier, existingPlayers);
  const totalOvr = squad.reduce((sum, p) => sum + p.ovr, 0);
  const avgOvr = Math.round(totalOvr / squad.length);

  const mgrInfo = NATIONAL_MANAGERS[nation.code] || {
    name: `${nation.name} Head Coach`,
    tactic: '4-3-3 Balanced',
  };

  const comps =
    tier === 'U17'
      ? [`${nation.name} U17 International Cup`, 'U17 World Championship']
      : tier === 'U20'
      ? [`${nation.name} U20 Continental Championship`, 'U20 World Cup']
      : ['FIFA World Cup', 'Continental Cup', 'Nations League'];

  return {
    id: `${nation.code}-${tier}`,
    nation,
    tier,
    ovr: avgOvr,
    manager: {
      name: mgrInfo.name,
      nationality: nation.name,
      tactic: mgrInfo.tactic,
    },
    squad,
    competitions: comps,
  };
}

/**
 * Check if the player is eligible for an International Call-Up.
 * Evaluates age, OVR, active/eligible nationalities, and senior lock status.
 * U17 FOUNDATION RULES:
 * - Age <= 16: Eligible for U17 Qualifiers (OVR 70+ Top 20, 68+ others; Starter 74+ Top 20, 72+ others)
 * - Age <= 17: Eligible for U17 World Cup (OVR 70+ Top 20, 68+ others; Starter 74+ Top 20, 72+ others)
 * - Age >= 18: Never called for U17.
 */
export function checkForInternationalCallUp(player: PlayerCardData): InternationalCallUp | null {
  const eligibleNats = getEligibleNationalities(player);

  if (!eligibleNats || eligibleNats.length === 0) return null;

  const age = player.age || 10;
  const ovr = player.ovr || player.overallRating || 60;

  // Pick nation to call up from eligible list
  let callingNation = eligibleNats[0];
  if (player.isSeniorLocked && player.seniorNation) {
    const found = eligibleNats.find((n) => n.name.toLowerCase() === player.seniorNation?.toLowerCase());
    if (found) callingNation = found;
  } else if (eligibleNats.length > 1) {
    callingNation = eligibleNats[Math.floor(Math.random() * eligibleNats.length)];
  }

  // SECTION 1: U17 FOUNDATION SHUTDOWN AT AGE 18
  // Once the Unique Career player turns 18:
  // - Permanently stop simulating U17 qualifiers & World Cups
  // - Disable all U17 call-up checks/events
  if (age < 18) {
    const isQualifiersEligible = age <= 16;
    const evalRes = isQualifiersEligible
      ? checkU17QualifiersEligibility(player, callingNation)
      : checkU17WorldCupEligibility(player, callingNation, true);

    if (evalRes.isEligible) {
      const compName = isQualifiersEligible
        ? `${callingNation.name} U17 International Championship Qualifiers`
        : 'FIFA U17 World Cup';
      const mgr = NATIONAL_MANAGERS[callingNation.code]?.name || `${callingNation.name} U17 Head Coach`;

      return {
        id: `callup-${callingNation.code}-U17-${Date.now()}`,
        nation: callingNation,
        tier: 'U17',
        competitionName: compName,
        managerName: mgr,
        role: evalRes.role,
        bonusFame: 40,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        isSeniorLockWarning: false,
      };
    }
  }

  // SECTION 2 & 7: U20 CALL-UP EVALUATION (Lowest-to-Highest Ranked Queue)
  if (age >= 17 && age <= 20) {
    const isWc = age >= 19;
    const u20Queue = getU20EligibleCallUpQueue(
      player,
      isWc,
      (code) => Boolean(player.u20Qualified),
      player.declinedInternationalCallUps?.['U20'] || []
    );

    if (u20Queue.length > 0) {
      const pick = u20Queue[0];
      const compName = isWc ? '2035 FIFA U20 World Cup' : `${pick.nation.name} 2034 U20 Continental Qualifiers`;
      const mgr = NATIONAL_MANAGERS[pick.nation.code]?.name || `${pick.nation.name} U20 Head Coach`;

      return {
        id: `callup-${pick.nation.code}-U20-${Date.now()}`,
        nation: pick.nation,
        tier: 'U20',
        competitionName: compName,
        managerName: mgr,
        role: pick.role,
        bonusFame: isWc ? 100 : 60,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        isSeniorLockWarning: false,
      };
    }
  }

  return null;
}

/**
 * Accepts an International Call-Up:
 * - Switches active nationality to callUp.nation
 * - Former active nationality is retained in otherNationalities
 * - Other nationalities remain visible in "OTHER NATIONALITIES" section
 * - If tier === 'Senior': locks Senior nationality permanently!
 */
export function acceptInternationalCallUp(
  player: PlayerCardData,
  callUp: InternationalCallUp
): { updatedPlayer: PlayerCardData; message: string } {
  const currentActiveNat = player.nationality || { code: 'ENG', iso: 'gb-eng', name: 'England' };
  const targetNat = callUp.nation;

  // 1. Maintain list of other nationalities
  const currentOthers = [
    ...(player.otherNationalities || []),
    ...(player.extraNationalities || []),
  ];

  // Add former active nationality to otherNationalities if it's different from new target
  const updatedOthersList: Nationality[] = [...currentOthers];
  if (currentActiveNat.code !== targetNat.code) {
    if (!updatedOthersList.some((n) => n.code === currentActiveNat.code)) {
      updatedOthersList.push(currentActiveNat);
    }
  }

  // Remove targetNat from otherNationalities list since it is now ACTIVE
  const cleanOthers = updatedOthersList.filter((n) => n.code !== targetNat.code);

  const startYear = 2026 + ((player.age || 10) - 10);
  const updatedResolved = Array.from(new Set([...(player.resolvedInternationalSeasons || []), startYear]));
  const eventId = `int-cycle-${callUp.tier}-${callUp.tier === 'Senior' ? 'tournament' : 'qualifier'}-${startYear}`;
  const updatedCompletedEvents = Array.from(new Set([...(player.completedInternationalEvents || []), eventId, callUp.id]));

  const updatedPlayer: PlayerCardData = {
    ...player,
    nationality: targetNat,
    otherNationalities: cleanOthers,
    extraNationalities: cleanOthers,
    fame: (player.fame || 0) + callUp.bonusFame,
    resolvedInternationalSeasons: updatedResolved,
    completedInternationalEvents: updatedCompletedEvents,
    activeInternationalDuty: {
      tier: callUp.tier,
      nation: targetNat,
      competitionName: callUp.competitionName,
      seasonYear: startYear,
      isResolved: false,
    },
  };

  let msg = '';

  if (callUp.tier === 'U17') {
    updatedPlayer.u17Nation = targetNat.name;
    updatedPlayer.u17Caps = (updatedPlayer.u17Caps || 0) + 1;
    updatedPlayer.internationalCaps = (updatedPlayer.internationalCaps || 0) + 1;
    msg = `🎉 Accepted ${targetNat.name} U17 call-up! Active nationality switched to ${targetNat.name}.`;
  } else if (callUp.tier === 'U20') {
    updatedPlayer.u20Nation = targetNat.name;
    updatedPlayer.u20Caps = (updatedPlayer.u20Caps || 0) + 1;
    updatedPlayer.internationalCaps = (updatedPlayer.internationalCaps || 0) + 1;
    msg = `🎉 Accepted ${targetNat.name} U20 call-up! Active nationality switched to ${targetNat.name}.`;
  } else if (callUp.tier === 'Senior') {
    updatedPlayer.seniorNation = targetNat.name;
    updatedPlayer.isSeniorLocked = true;
    updatedPlayer.seniorNationalTeamLocked = true;
    updatedPlayer.seniorCaps = (updatedPlayer.seniorCaps || 0) + 1;
    updatedPlayer.internationalCaps = (updatedPlayer.internationalCaps || 0) + 1;
    msg = `🔒 SENIOR NATIONALITY LOCKED to ${targetNat.name}! You are now permanently committed to ${targetNat.name} Senior National Team.`;
  }

  return { updatedPlayer, message: msg };
}

/**
 * Declines an International Call-Up (Standard Decline):
 * Section 6: Normally lose Fame (-20) and gain Bad Reputation (+15).
 * - Records that the player declined this nation for this specific tier (U17, U20, Senior)
 * - Marks current season as resolved
 */
export function declineInternationalCallUp(
  player: PlayerCardData,
  callUp: InternationalCallUp
): { updatedPlayer: PlayerCardData; message: string } {
  const tier = callUp.tier;
  const nationCode = callUp.nation.code.toUpperCase();
  const currentDeclined = player.declinedInternationalCallUps || {};
  const currentTierDeclined = currentDeclined[tier] || [];

  const updatedDeclined = {
    ...currentDeclined,
    [tier]: Array.from(new Set([...currentTierDeclined, nationCode])),
  };

  const startYear = 2026 + ((player.age || 10) - 10);
  const updatedResolved = Array.from(new Set([...(player.resolvedInternationalSeasons || []), startYear]));
  const eventId = `int-cycle-${callUp.tier}-${callUp.tier === 'Senior' ? 'tournament' : 'qualifier'}-${startYear}`;
  const updatedCompletedEvents = Array.from(new Set([...(player.completedInternationalEvents || []), eventId, callUp.id]));

  const updatedPlayer: PlayerCardData = {
    ...player,
    fame: Math.max(0, (player.fame || 0) - 20),
    badReputation: Math.min(100, (player.badReputation || 0) + 15),
    declinedInternationalCallUps: updatedDeclined,
    resolvedInternationalSeasons: updatedResolved,
    completedInternationalEvents: updatedCompletedEvents,
  };

  return {
    updatedPlayer,
    message: `Declined ${callUp.nation.name} ${callUp.tier} call-up (-20 Fame, +15 Bad Reputation). You will not be called up by ${callUp.nation.name} for ${callUp.tier} again.`,
  };
}

/**
 * Section 6: "I WANT TO PLAY FOR ANOTHER NATION"
 * Declines the current call-up WITHOUT Fame or Bad Reputation penalties,
 * allowing subsequent call-ups from other eligible nationalities in the lowest-to-highest queue.
 */
export function chooseAnotherNationForCallUp(
  player: PlayerCardData,
  callUp: InternationalCallUp
): { updatedPlayer: PlayerCardData; message: string } {
  const tier = callUp.tier;
  const nationCode = callUp.nation.code.toUpperCase();
  const currentDeclined = player.declinedInternationalCallUps || {};
  const currentTierDeclined = currentDeclined[tier] || [];

  const updatedDeclined = {
    ...currentDeclined,
    [tier]: Array.from(new Set([...currentTierDeclined, nationCode])),
  };

  // Do NOT add to resolvedInternationalSeasons so the dashboard can check other eligible nations!
  const updatedPlayer: PlayerCardData = {
    ...player,
    declinedInternationalCallUps: updatedDeclined,
  };

  return {
    updatedPlayer,
    message: `Passed on ${callUp.nation.name} without penalty to explore opportunities with other eligible nations.`,
  };
}
