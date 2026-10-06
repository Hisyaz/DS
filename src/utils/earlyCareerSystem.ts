import { PlayerConfig } from '../types';
import { ProContractOffer } from '../types/streetCards';
import { YouthLeagueTeamChoice } from '../types/earlyCareer';
import { getYouthLeagueByCity, YOUTH_LEAGUES_DATABASE } from '../data/youthLeaguesDatabase';
import { getLeagueDatabase, isLeagueProfessional } from './leagueDatabaseSystem';
import { createDefaultManager } from './tacticalSystem';
import { validateAndRepairPlaystyle, isProfessionalPlayer as isProIdentity, getValidPlayStylesForSubPosition } from './playerIdentitySystem';
import { ClubFinances } from '../types/clubEconomy';
import { getClubDevelopmentTier } from './clubDevelopmentEngine';
import { getFootballSchoolForClub } from '../data/youthFootballSchools';
import { isSpecialClubOfferExcluded } from './specialClubInterestSystem';

export type ClubEconomicTier = 'ELITE_FINANCES' | 'STRONG_BUDGET' | 'MODERATE_BUDGET' | 'CONSTRAINED_BUDGET';

export interface ProClubDefinition {
  id: string;
  clubName: string;
  clubBadgeBg: string;
  countryName: string;
  countryCode: string;
  leagueName: string;
  leagueTier: 1 | 2; // 1 = First Division, 2 = Second Division
  isEuropean: boolean;
  positionalLevels: {
    ATT: number;
    MID: number;
    DEF: number;
    GK: number;
  };
  positionalNeeds: {
    ATT: 'WEAK' | 'BALANCED' | 'STRONG';
    MID: 'WEAK' | 'BALANCED' | 'STRONG';
    DEF: 'WEAK' | 'BALANCED' | 'STRONG';
    GK: 'WEAK' | 'BALANCED' | 'STRONG';
  };
  prestigeStars: number;
  clubFame?: number; // 0 to 10 scale
  finances?: ClubFinances;
  economicTier?: ClubEconomicTier;
  managerName: string;
  managerNationality: string;
  managerTacticalStyle: string;
  managerFormation: string;
  preferredPlaystyles: Record<string, string>; // e.g. { RW: 'Inverted Winger', ST: 'Poacher' }
}

/**
 * Resolves standard country code to full country display name
 */
export function getCountryNameByCode(countryCode?: string): string {
  const code = (countryCode || '').toUpperCase();
  if (code === 'ENG' || code === 'GB') return 'England';
  if (code === 'FR') return 'France';
  if (code === 'ESP') return 'Spain';
  if (code === 'ITA') return 'Italy';
  if (code === 'GER') return 'Germany';
  if (code === 'ARG') return 'Argentina';
  if (code === 'BRA') return 'Brazil';
  if (code === 'POR') return 'Portugal';
  if (code === 'NED') return 'Netherlands';
  return countryCode || 'International';
}

/**
 * DYNAMICALLY LOADS PROFESSIONAL CLUBS FROM SAVED COMPETITION EDITOR DATABASE
 * The Competition Editor save is the single source of truth for all football entities.
 * 
 * STRICT TRANSFER ELIGIBILITY RULE:
 * A club can only scout, offer contracts, or appear as transfer destinations if:
 * 1. Its domestic league currently exists in the game database (db.leagues).
 * 2. The league is a registered professional playable league (Tier 1 or Tier 2).
 * 3. The club belongs to that playable domestic league.
 * 4. The club and its league are NOT under 'OTHERS' (temporary continental-only participants).
 */
export function getProClubsFromDatabase(): ProClubDefinition[] {
  const db = getLeagueDatabase();
  const proClubs: ProClubDefinition[] = [];

  if (db && db.leagues && db.teams) {
    // Iterate over leagues in the saved database
    Object.values(db.leagues).forEach((league) => {
      // Only search professional leagues in the saved database, strictly excluding 'OTHERS'
      if (
        !league ||
        !isLeagueProfessional(league) ||
        league.divisionTier === 'youth' ||
        league.divisionTier === 'state_only' ||
        league.isStateChampionshipsOnly ||
        league.isCupOnly ||
        league.id === 'brazil_state_only' ||
        league.countryCode === 'OTHERS' ||
        (league.countryName && league.countryName.toLowerCase() === 'others')
      ) {
        return;
      }

      // Find all teams belonging to this professional league
      const leagueTeams = Object.values(db.teams).filter((team) => {
        if (!team || !team.id || !team.name) return false;
        // Strictly exclude clubs classified under OTHERS or state-only
        if (team.countryCode === 'OTHERS') return false;
        if (team.isStateChampionshipsOnly || team.isCupOnly || team.leagueId === 'brazil_state_only') return false;
        if (team.leagueId === league.id) return true;
        if (league.teamIds && Array.isArray(league.teamIds) && league.teamIds.includes(team.id)) return true;
        return false;
      });

      leagueTeams.forEach((team) => {
        const countryCode = team.countryCode || league.countryCode || 'ENG';
        // Double check countryCode is not OTHERS
        if (countryCode === 'OTHERS') return;

        const countryName = league.countryName || getCountryNameByCode(countryCode);
        const leagueTierNum = league.divisionTier === '1st' ? 1 : 2;
        const isEuropean = ['ENG', 'ESP', 'FR', 'FRA', 'ITA', 'GER', 'POR', 'NED', 'SCO', 'BEL'].includes(countryCode.toUpperCase());

        const att = team.attackRating || team.overallRating || 70;
        const mid = team.midfieldRating || team.overallRating || 70;
        const def = team.defenseRating || team.overallRating || 70;
        const gk = team.overallRating || 70;

        const calcNeed = (rating: number): 'WEAK' | 'BALANCED' | 'STRONG' => {
          if (rating < 68) return 'WEAK';
          if (rating > 78) return 'STRONG';
          return 'BALANCED';
        };

        const manager = team.manager || createDefaultManager(team.name, countryCode);
        const managerName = manager.name || 'Head Coach';
        const managerNationality = manager.nationality || countryCode;
        const managerFormation = manager.primaryTactic?.formation || '4-3-3';
        const managerTacticalStyle = manager.primaryTactic?.style || 'possession';

        const preferredPlaystyles: Record<string, string> = {};
        if (manager.primaryTactic?.positions && Array.isArray(manager.primaryTactic.positions)) {
          manager.primaryTactic.positions.forEach((posSetup) => {
            if (posSetup.role && posSetup.playstyle) {
              preferredPlaystyles[posSetup.role] = posSetup.playstyle;
            }
          });
        }

        let clubBadgeBg = 'from-slate-800 to-slate-950';
        if (team.emblem?.color1) {
          clubBadgeBg = `from-[${team.emblem.color1}] to-slate-900`;
        }

        const prestigeStars = Math.max(1, Math.min(5, Math.ceil((team.reputation || team.overallRating || 70) / 20)));
        let economicTier: ClubEconomicTier = 'MODERATE_BUDGET';
        if (prestigeStars >= 5 || (team.reputation && team.reputation >= 85)) {
          economicTier = 'ELITE_FINANCES';
        } else if (prestigeStars >= 4 || (team.reputation && team.reputation >= 78)) {
          economicTier = 'STRONG_BUDGET';
        } else if (leagueTierNum === 2 || prestigeStars <= 2) {
          economicTier = 'CONSTRAINED_BUDGET';
        }

        proClubs.push({
          id: team.id,
          clubName: team.name,
          clubBadgeBg,
          countryName,
          countryCode,
          leagueName: league.name,
          leagueTier: leagueTierNum as 1 | 2,
          isEuropean,
          positionalLevels: {
            ATT: att,
            MID: mid,
            DEF: def,
            GK: gk,
          },
          positionalNeeds: {
            ATT: calcNeed(att),
            MID: calcNeed(mid),
            DEF: calcNeed(def),
            GK: calcNeed(gk),
          },
          prestigeStars,
          clubFame: team.finances?.clubFame ?? (prestigeStars * 2),
          finances: team.finances,
          economicTier,
          managerName,
          managerNationality,
          managerTacticalStyle,
          managerFormation,
          preferredPlaystyles,
        });
      });
    });
  }

  // Filter to eligible professional clubs whose domestic league is present and non-empty
  const filtered = proClubs.filter((c) => {
    const code = (c.countryCode || '').toUpperCase();
    const isOthers = code === 'OTHERS' || c.countryName.toLowerCase() === 'others';
    const isAllowedTier = c.leagueTier === 1 || c.leagueTier === 2;
    return !isOthers && isAllowedTier;
  });

  if (filtered.length > 0) {
    return filtered;
  }

  // Fallback 1st & 2nd division clubs for France, Spain, England, Argentina, Brazil, Saudi Arabia, Italy
  return [
    // ENGLAND TIER 1 & 2
    { id: 'eng_1', clubName: 'Arsenal FC', clubBadgeBg: 'from-red-800 to-slate-950', countryName: 'England', countryCode: 'ENG', leagueName: 'Premier League', leagueTier: 1, isEuropean: true, positionalLevels: { ATT: 86, MID: 85, DEF: 85, GK: 84 }, positionalNeeds: { ATT: 'BALANCED', MID: 'BALANCED', DEF: 'BALANCED', GK: 'BALANCED' }, prestigeStars: 5, economicTier: 'ELITE_FINANCES', managerName: 'M. Arteta', managerNationality: 'ESP', managerTacticalStyle: 'possession', managerFormation: '4-3-3', preferredPlaystyles: {} },
    { id: 'eng_2', clubName: 'Leeds United', clubBadgeBg: 'from-yellow-700 to-slate-950', countryName: 'England', countryCode: 'ENG', leagueName: 'EFL Championship', leagueTier: 2, isEuropean: false, positionalLevels: { ATT: 74, MID: 73, DEF: 72, GK: 72 }, positionalNeeds: { ATT: 'WEAK', MID: 'BALANCED', DEF: 'WEAK', GK: 'WEAK' }, prestigeStars: 3, economicTier: 'CONSTRAINED_BUDGET', managerName: 'D. Farke', managerNationality: 'GER', managerTacticalStyle: 'attacking', managerFormation: '4-2-3-1', preferredPlaystyles: {} },
    // SPAIN TIER 1 & 2
    { id: 'esp_1', clubName: 'Real Madrid', clubBadgeBg: 'from-blue-900 to-slate-950', countryName: 'Spain', countryCode: 'ESP', leagueName: 'La Liga', leagueTier: 1, isEuropean: true, positionalLevels: { ATT: 89, MID: 88, DEF: 86, GK: 88 }, positionalNeeds: { ATT: 'STRONG', MID: 'STRONG', DEF: 'STRONG', GK: 'STRONG' }, prestigeStars: 5, economicTier: 'ELITE_FINANCES', managerName: 'C. Ancelotti', managerNationality: 'ITA', managerTacticalStyle: 'counter_attack', managerFormation: '4-3-3', preferredPlaystyles: {} },
    { id: 'esp_2', clubName: 'Real Zaragoza', clubBadgeBg: 'from-cyan-800 to-slate-950', countryName: 'Spain', countryCode: 'ESP', leagueName: 'La Liga 2', leagueTier: 2, isEuropean: false, positionalLevels: { ATT: 71, MID: 70, DEF: 70, GK: 69 }, positionalNeeds: { ATT: 'WEAK', MID: 'WEAK', DEF: 'WEAK', GK: 'WEAK' }, prestigeStars: 2, economicTier: 'CONSTRAINED_BUDGET', managerName: 'V. Fernández', managerNationality: 'ESP', managerTacticalStyle: 'balanced', managerFormation: '4-4-2', preferredPlaystyles: {} },
    // ITALY TIER 1 & 2
    { id: 'ita_1', clubName: 'Inter Milan', clubBadgeBg: 'from-blue-900 to-slate-950', countryName: 'Italy', countryCode: 'ITA', leagueName: 'Serie A', leagueTier: 1, isEuropean: true, positionalLevels: { ATT: 86, MID: 86, DEF: 85, GK: 85 }, positionalNeeds: { ATT: 'BALANCED', MID: 'BALANCED', DEF: 'BALANCED', GK: 'BALANCED' }, prestigeStars: 5, economicTier: 'ELITE_FINANCES', managerName: 'S. Inzaghi', managerNationality: 'ITA', managerTacticalStyle: 'attacking', managerFormation: '3-5-2', preferredPlaystyles: {} },
    { id: 'ita_2', clubName: 'Palermo FC', clubBadgeBg: 'from-pink-900 to-slate-950', countryName: 'Italy', countryCode: 'ITA', leagueName: 'Serie B', leagueTier: 2, isEuropean: false, positionalLevels: { ATT: 71, MID: 70, DEF: 70, GK: 69 }, positionalNeeds: { ATT: 'WEAK', MID: 'WEAK', DEF: 'WEAK', GK: 'WEAK' }, prestigeStars: 2, economicTier: 'CONSTRAINED_BUDGET', managerName: 'A. Dionisi', managerNationality: 'ITA', managerTacticalStyle: 'balanced', managerFormation: '4-3-3', preferredPlaystyles: {} },
    // FRANCE TIER 1 & 2
    { id: 'fr_1', clubName: 'Paris Saint-Germain', clubBadgeBg: 'from-blue-800 to-slate-950', countryName: 'France', countryCode: 'FR', leagueName: 'Ligue 1', leagueTier: 1, isEuropean: true, positionalLevels: { ATT: 87, MID: 85, DEF: 84, GK: 85 }, positionalNeeds: { ATT: 'STRONG', MID: 'BALANCED', DEF: 'BALANCED', GK: 'BALANCED' }, prestigeStars: 5, economicTier: 'ELITE_FINANCES', managerName: 'L. Enrique', managerNationality: 'ESP', managerTacticalStyle: 'possession', managerFormation: '4-3-3', preferredPlaystyles: {} },
    { id: 'fr_2', clubName: 'AS Saint-Étienne', clubBadgeBg: 'from-green-800 to-slate-950', countryName: 'France', countryCode: 'FR', leagueName: 'Ligue 2', leagueTier: 2, isEuropean: false, positionalLevels: { ATT: 72, MID: 71, DEF: 71, GK: 70 }, positionalNeeds: { ATT: 'WEAK', MID: 'WEAK', DEF: 'WEAK', GK: 'WEAK' }, prestigeStars: 3, economicTier: 'CONSTRAINED_BUDGET', managerName: 'O. Dall\'Oglio', managerNationality: 'FR', managerTacticalStyle: 'balanced', managerFormation: '4-3-3', preferredPlaystyles: {} },
    // ARGENTINA TIER 1 & 2
    { id: 'arg_1', clubName: 'Boca Juniors', clubBadgeBg: 'from-blue-700 to-yellow-950', countryName: 'Argentina', countryCode: 'ARG', leagueName: 'Liga Profesional', leagueTier: 1, isEuropean: false, positionalLevels: { ATT: 78, MID: 77, DEF: 76, GK: 76 }, positionalNeeds: { ATT: 'BALANCED', MID: 'BALANCED', DEF: 'BALANCED', GK: 'BALANCED' }, prestigeStars: 4, economicTier: 'STRONG_BUDGET', managerName: 'D. Martínez', managerNationality: 'ARG', managerTacticalStyle: 'attacking', managerFormation: '4-4-2', preferredPlaystyles: {} },
    { id: 'arg_2', clubName: 'Ferro Carril Oeste', clubBadgeBg: 'from-emerald-800 to-slate-950', countryName: 'Argentina', countryCode: 'ARG', leagueName: 'Primera Nacional', leagueTier: 2, isEuropean: false, positionalLevels: { ATT: 67, MID: 66, DEF: 66, GK: 65 }, positionalNeeds: { ATT: 'WEAK', MID: 'WEAK', DEF: 'WEAK', GK: 'WEAK' }, prestigeStars: 2, economicTier: 'CONSTRAINED_BUDGET', managerName: 'J. Cordon', managerNationality: 'ARG', managerTacticalStyle: 'balanced', managerFormation: '4-4-2', preferredPlaystyles: {} },
    // BRAZIL TIER 1 & 2
    { id: 'bra_1', clubName: 'Flamengo', clubBadgeBg: 'from-red-900 to-slate-950', countryName: 'Brazil', countryCode: 'BRA', leagueName: 'Brasileirão Série A', leagueTier: 1, isEuropean: false, positionalLevels: { ATT: 81, MID: 80, DEF: 79, GK: 78 }, positionalNeeds: { ATT: 'BALANCED', MID: 'BALANCED', DEF: 'BALANCED', GK: 'BALANCED' }, prestigeStars: 4, economicTier: 'STRONG_BUDGET', managerName: 'Tite', managerNationality: 'BRA', managerTacticalStyle: 'possession', managerFormation: '4-2-3-1', preferredPlaystyles: {} },
    { id: 'bra_2', clubName: 'Sport Recife', clubBadgeBg: 'from-red-800 to-amber-950', countryName: 'Brazil', countryCode: 'BRA', leagueName: 'Brasileirão Série B', leagueTier: 2, isEuropean: false, positionalLevels: { ATT: 69, MID: 68, DEF: 68, GK: 67 }, positionalNeeds: { ATT: 'WEAK', MID: 'WEAK', DEF: 'WEAK', GK: 'WEAK' }, prestigeStars: 2, economicTier: 'CONSTRAINED_BUDGET', managerName: 'M. Silva', managerNationality: 'BRA', managerTacticalStyle: 'balanced', managerFormation: '4-3-3', preferredPlaystyles: {} },
    // SAUDI ARABIA TIER 1
    { id: 'sau_1', clubName: 'Al-Hilal SFC', clubBadgeBg: 'from-blue-800 to-slate-950', countryName: 'Saudi Arabia', countryCode: 'KSA', leagueName: 'Saudi Pro League', leagueTier: 1, isEuropean: false, positionalLevels: { ATT: 84, MID: 83, DEF: 82, GK: 82 }, positionalNeeds: { ATT: 'BALANCED', MID: 'BALANCED', DEF: 'BALANCED', GK: 'BALANCED' }, prestigeStars: 5, economicTier: 'ELITE_FINANCES', managerName: 'J. Jesus', managerNationality: 'POR', managerTacticalStyle: 'attacking', managerFormation: '4-2-3-1', preferredPlaystyles: {} },
    { id: 'sau_2', clubName: 'Al-Nassr FC', clubBadgeBg: 'from-yellow-600 to-blue-950', countryName: 'Saudi Arabia', countryCode: 'KSA', leagueName: 'Saudi Pro League', leagueTier: 1, isEuropean: false, positionalLevels: { ATT: 85, MID: 82, DEF: 80, GK: 80 }, positionalNeeds: { ATT: 'BALANCED', MID: 'BALANCED', DEF: 'BALANCED', GK: 'BALANCED' }, prestigeStars: 5, economicTier: 'ELITE_FINANCES', managerName: 'S. Pioli', managerNationality: 'ITA', managerTacticalStyle: 'attacking', managerFormation: '4-2-3-1', preferredPlaystyles: {} },
  ];
}

/**
 * Proxy for backward compatibility with external references to PRO_CLUBS_DATABASE
 */
export const PRO_CLUBS_DATABASE: ProClubDefinition[] = new Proxy([], {
  get(target, prop, receiver) {
    const currentClubs = getProClubsFromDatabase();
    if (prop === 'length') return currentClubs.length;
    if (prop === 'filter') return currentClubs.filter.bind(currentClubs);
    if (prop === 'map') return currentClubs.map.bind(currentClubs);
    if (prop === 'find') return currentClubs.find.bind(currentClubs);
    if (prop === 'forEach') return currentClubs.forEach.bind(currentClubs);
    if (prop === 'slice') return currentClubs.slice.bind(currentClubs);
    if (typeof prop === 'string' && !isNaN(Number(prop))) {
      return currentClubs[Number(prop)];
    }
    return Reflect.get(currentClubs, prop, receiver);
  },
});

/**
 * Maps player primary position to position line key
 */
export function getPositionLineKey(pos?: string): 'ATT' | 'MID' | 'DEF' | 'GK' {
  const p = (pos || 'ST').toUpperCase();
  if (['ST', 'CF', 'RW', 'LW', 'RF', 'LF'].includes(p)) return 'ATT';
  if (['CAM', 'CM', 'CDM', 'RM', 'LM'].includes(p)) return 'MID';
  if (['CB', 'RB', 'LB', 'RWB', 'LWB'].includes(p)) return 'DEF';
  return 'GK';
}

/**
 * Maps position to descriptive full position name
 */
export function getPositionFullName(pos?: string): string {
  const p = (pos || 'ST').toUpperCase();
  const map: Record<string, string> = {
    ST: 'Striker',
    CF: 'Center Forward',
    RW: 'Right Winger',
    LW: 'Left Winger',
    CAM: 'Attacking Midfielder',
    CM: 'Central Midfielder',
    CDM: 'Defensive Midfielder',
    RM: 'Right Midfielder',
    LM: 'Left Midfielder',
    CB: 'Center Back',
    RB: 'Right Back',
    LB: 'Left Back',
    GK: 'Goalkeeper',
  };
  return map[p] || 'Forward';
}

/**
 * Maps sub-position to tactical role description
 */
export function getTacticalRoleName(subPos?: string, pos?: string): string {
  const sub = (subPos || pos || 'ST').toUpperCase();
  const map: Record<string, string> = {
    ST: 'Advanced Striker',
    CF: 'False Nine Operator',
    RW: 'Right Touchline Winger',
    LW: 'Left Cut-Inside Winger',
    CAM: 'Creative Playmaker',
    CM: 'Central Midfield Engine',
    CDM: 'Defensive Anchor',
    RM: 'Right Midfield Outlet',
    LM: 'Left Midfield Outlet',
    CB: 'Central Defender',
    RB: 'Right Full-Back',
    LB: 'Left Full-Back',
    GK: 'Goalkeeper',
  };
  return map[sub] || 'First Team Contender';
}

/**
 * Calculates Tryout Success Probability
 */
export function calculateTryoutSuccessRate(player: PlayerConfig | number, fameParam?: number): {
  successRate: number;
  isGuaranteedFame: boolean;
  formattedRate: string;
} {
  let ovr = 65;
  let fame = 0;
  let potential = 78;

  if (typeof player === 'number') {
    ovr = player;
    fame = fameParam || 0;
  } else {
    ovr = player.ovr || 65;
    fame = player.fame || 0;
    potential = player.potentialOvr || 78;
  }

  if (fame >= 10) {
    return {
      successRate: 100,
      isGuaranteedFame: true,
      formattedRate: '100% (Guaranteed by Fame)',
    };
  }

  let rate = 0;
  if (ovr <= 40) {
    rate = 1.0;
  } else if (ovr < 60) {
    rate = 1.0 + Math.pow(ovr - 40, 2) * 0.12;
  } else if (ovr < 70) {
    rate = 50 + (ovr - 60) * 4.5;
  } else {
    rate = 95;
  }

  if (potential >= 95) rate += 20;
  else if (potential >= 90) rate += 10;

  const clamped = Math.min(100, Math.max(1.0, rate));
  return {
    successRate: clamped,
    isGuaranteedFame: false,
    formattedRate: clamped < 1 ? `${clamped.toFixed(2)}%` : `${clamped.toFixed(1)}%`,
  };
}

/**
 * Computes Dynamic Contract Salary
 */
export function calculateContractSalary(
  player: PlayerConfig,
  club: ProClubDefinition,
  ovrVsClubDiff: number,
  salaryMultiplier: number = 1.0
): { yearlySalary: number; weeklyWage: number } {
  const ovr = player.ovr || 65;
  const potential = player.potentialOvr || 78;
  const fame = player.fame || 0;
  const badRep = player.badReputation || 0;

  const isSaudi =
    club.countryCode === 'KSA' ||
    club.countryCode === 'SAU' ||
    club.countryName.toLowerCase().includes('saudi') ||
    club.leagueName.toLowerCase().includes('saudi');

  let baseYearly = 40000 + (ovr - 50) * 1200 + (potential - 75) * 800 + fame * 1000;
  baseYearly = Math.max(25000, Math.min(150000, baseYearly));

  if (club.isEuropean) {
    baseYearly *= 1.5;
  }

  if (club.leagueTier === 1) {
    baseYearly *= 2.0;
  }

  if (potential >= 95) {
    baseYearly *= 1.25;
  } else if (potential >= 90) {
    baseYearly *= 1.12;
  }

  if (ovrVsClubDiff > 5) {
    baseYearly *= 1.15;
  }

  if (badRep >= 50) {
    baseYearly *= 0.65;
  } else if (badRep >= 20) {
    baseYearly *= 0.85;
  }

  if (isSaudi) {
    // Saudi Pro League contracts:
    if (ovr >= 85 || fame >= 300) {
      // Elite stars (85+ OVR or 300+ Fame): €30M - €200M/year
      const eliteScale = Math.pow(1.22, Math.max(0, ovr - 84));
      const fameScale = 1 + (Math.min(1000, Math.max(0, fame - 300)) / 300) * 0.8;
      const baseSaudiMega = (30000000 + (ovr - 85) * 15000000) * eliteScale * fameScale;
      baseYearly = Math.max(30000000, Math.min(200000000, baseSaudiMega));
    } else if (ovr >= 80) {
      // 80-84 OVR: €5M - €12M/year
      baseYearly = 5000000 + (ovr - 80) * 1800000 + fame * 10000;
    } else if (ovr >= 70) {
      // 70-79 OVR: €700K - €2.2M/year
      baseYearly = 700000 + (ovr - 70) * 150000 + fame * 3000;
    } else {
      // Youth / Early Career prospect (under 70 OVR): €95K - €260K/year (attractive 1.5x - 2.5x of European youth wages)
      baseYearly = 95000 + Math.max(0, ovr - 50) * 8000 + fame * 500;
    }
  }

  // Apply same-league bidding penalty multiplier (e.g. 2.0x for 3rd team from same league)
  baseYearly *= salaryMultiplier;

  const yearlySalary = Math.round(baseYearly);
  const weeklyWage = Math.round(yearlySalary / 52);

  return { yearlySalary, weeklyWage };
}

/**
 * Builds a single ProContractOffer object for a given player & club.
 */
export function buildContractOfferFromClub(
  player: PlayerConfig,
  club: ProClubDefinition,
  options?: {
    salaryMultiplier?: number;
    isSameLeagueBiddingPenalty?: boolean;
    leagueBidCount?: number;
    economicConstraintNote?: string;
  }
): ProContractOffer {
  const ovr = player.ovr || 65;
  const potential = player.potentialOvr || 78;
  const badRep = player.badReputation || 0;
  const pos = player.position || 'ST';
  const subPos = player.subPosition || pos;
  const posLine = getPositionLineKey(pos);
  const clubPosOvr = club.positionalLevels[posLine];
  const ovrDiff = ovr - clubPosOvr;

  let contractYears = 3;
  if (potential >= 95) contractYears = 5;
  else if (potential >= 90 || ovrDiff >= 3) contractYears = 4;

  if (badRep >= 40 || ovrDiff < -10) contractYears = Math.min(contractYears, 2);
  if (badRep >= 70) contractYears = 1;

  let playingTimeExpectation: 'STARTER' | 'FIRST TEAM' | 'ROTATION' | 'RESERVES' | 'U20 PROSPECT' | 'U17 PROSPECT' = 'U20 PROSPECT';
  let initialSquadDestination: 'First Team' | 'Reserves' | 'U20' | 'U17' = 'U20';
  let expectedRole: 'Starter' | 'Rotation Player' | 'Develop With Reserves' | 'Youth Team' = 'Youth Team';
  let squadRole: 'Key Player' | 'First Team Regular' | 'Rotation' | 'Young Prospect' = 'Young Prospect';
  let roleDescription = 'Train with youth setups while adapting to professional intensity.';

  if (ovrDiff >= 5) {
    playingTimeExpectation = 'STARTER';
    initialSquadDestination = 'First Team';
    expectedRole = 'Starter';
    squadRole = 'Key Player';
    roleDescription = 'Expected to feature directly in the starting 11 every matchday.';
  } else if (ovrDiff >= 0) {
    playingTimeExpectation = 'FIRST TEAM';
    initialSquadDestination = 'First Team';
    expectedRole = 'Starter';
    squadRole = 'First Team Regular';
    roleDescription = 'Core first-team squad player competing for starting roles.';
  } else if (ovrDiff >= -5) {
    playingTimeExpectation = 'ROTATION';
    initialSquadDestination = 'First Team';
    expectedRole = 'Rotation Player';
    squadRole = 'Rotation';
    roleDescription = 'First-team bench player getting regular substitution minutes.';
  } else if (ovrDiff >= -12 || potential >= 90) {
    playingTimeExpectation = 'RESERVES';
    initialSquadDestination = 'Reserves';
    expectedRole = 'Develop With Reserves';
    squadRole = 'Young Prospect';
    roleDescription = 'Train with first team squad and play competitive reserve league matches.';
  } else if (player.age && player.age <= 16) {
    playingTimeExpectation = 'U17 PROSPECT';
    initialSquadDestination = 'U17';
    expectedRole = 'Youth Team';
    squadRole = 'Young Prospect';
    roleDescription = 'Assigned to official U17 academy setup.';
  } else {
    playingTimeExpectation = 'U20 PROSPECT';
    initialSquadDestination = 'U20';
    expectedRole = 'Youth Team';
    squadRole = 'Young Prospect';
    roleDescription = 'Assigned to official U20 development squad.';
  }

  const salaryMultiplier = options?.salaryMultiplier || 1.0;
  const { yearlySalary, weeklyWage } = calculateContractSalary(player, club, ovrDiff, salaryMultiplier);

  // Proposed Playstyle is guaranteed to be valid for the player's position / sub-position (tactical style, never Basic)
  const rawStyle = club.preferredPlaystyles[subPos] || club.preferredPlaystyles[pos] || player.playStyle || 'Balanced';
  let validPlaystyle = validateAndRepairPlaystyle(subPos, rawStyle);
  if (validPlaystyle.toLowerCase() === 'basic') {
    const validTactical = getValidPlayStylesForSubPosition(subPos).filter((s) => s.toLowerCase() !== 'basic');
    validPlaystyle = validTactical[0] || 'Balanced';
  }

  const isSaudi =
    club.countryCode === 'KSA' ||
    club.countryCode === 'SAU' ||
    club.countryName.toLowerCase().includes('saudi') ||
    club.leagueName.toLowerCase().includes('saudi');
  const signingBonus = Math.round(yearlySalary * (isSaudi ? 0.20 : 0.10));

  const devTier = getClubDevelopmentTier(
    club.clubName,
    club.leagueName,
    club.countryName,
    club.clubFame || club.prestigeStars * 2
  );
  const devSchool = getFootballSchoolForClub(
    club.clubName,
    club.leagueName,
    '',
    club.countryName
  );

  return {
    id: `pro-offer-${club.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    clubName: club.clubName,
    clubBadgeBg: club.clubBadgeBg,
    countryName: club.countryName,
    countryCode: club.countryCode,
    leagueName: club.leagueName,
    leagueTier: club.leagueTier,
    isEuropean: club.isEuropean,
    squadRole,
    expectedRole,
    playingTimeExpectation,
    initialSquadDestination,
    roleDescription,
    managerName: club.managerName,
    managerNationality: club.managerNationality,
    managerTacticalStyle: club.managerTacticalStyle,
    managerFormation: club.managerFormation,
    expectedPosition: getPositionFullName(pos),
    expectedSubPosition: subPos,
    tacticalRole: getTacticalRoleName(subPos, pos),
    expectedPlaystyle: validPlaystyle,
    yearlySalary,
    weeklyWage,
    contractYears,
    signingBonus,
    minOvrRequired: Math.max(40, clubPosOvr - 10),
    matchesProfile: true,
    prestigeStars: club.prestigeStars,
    clubFame: club.clubFame ?? Math.min(10, Math.max(1, club.prestigeStars * 2)),
    developmentTier: devTier.tier,
    developmentTierName: devTier.name,
    developmentPhilosophy: devSchool.name,
    youthDevelopmentPoints: devTier.annualPoints,
    clubEconomicTier: club.economicTier,
    isSameLeagueBiddingPenalty: options?.isSameLeagueBiddingPenalty,
    leagueBidCount: options?.leagueBidCount,
    salaryMultiplier: options?.salaryMultiplier,
    economicConstraintNote: options?.economicConstraintNote,
  };
}

/**
 * Calculates offer relevance score to ensure player receives only the most compelling offers.
 */
export function calculateContractOfferRelevance(offer: ProContractOffer, player: PlayerConfig): number {
  let score = 0;
  // Financial appeal on a balanced logarithmic scale
  score += Math.log10(Math.max(1000, offer.yearlySalary || 40000)) * 18;
  
  // Club prestige
  score += (offer.prestigeStars || 3) * 14;
  
  // Tier bonus
  if (offer.leagueTier === 1) score += 18;
  
  // Role bonus
  if (offer.squadRole === 'Key Player') score += 30;
  else if (offer.squadRole === 'First Team Regular') score += 20;
  else if (offer.squadRole === 'Rotation') score += 10;
  
  // Domestic bonus for young players: local pathway is highly desirable
  const pCountry = player.clubCountry || player.country || (player.nationality as any)?.name || 'England';
  const isDomestic =
    offer.countryName?.toLowerCase() === pCountry.toLowerCase() ||
    pCountry.toLowerCase().includes(offer.countryName?.toLowerCase() || '') ||
    (offer.countryCode?.toLowerCase() === ((player as any).countryCode || player.nationality?.code || '').toLowerCase());
  if (isDomestic) {
    score += 35;
  }

  // European top tier bonus
  if (offer.isEuropean && offer.leagueTier === 1) {
    score += 20;
  }

  // 3rd League Bidder 2x Salary Premium player financial appeal
  if (offer.isSameLeagueBiddingPenalty) {
    score += 25;
  }

  // Saudi mega contract boost ONLY for world-class elite players (85+ OVR or 300+ Fame)
  const isSaudi =
    offer.countryCode === 'KSA' ||
    offer.countryCode === 'SAU' ||
    offer.countryName?.toLowerCase().includes('saudi') ||
    offer.leagueName?.toLowerCase().includes('saudi');
  if (isSaudi && ((player.ovr || 0) >= 85 || (player.fame || 0) >= 300)) {
    score += 45;
  }

  return score;
}

/**
 * TRYOUT CONTRACT OFFER GENERATOR
 * Successful Tryout generates EXACTLY ONE contract offer from ONE appropriate club in the saved database.
 */
export function generateTryoutContractOffer(player: PlayerConfig): ProContractOffer[] {
  if ((player.age || 10) < 16) {
    return [];
  }
  const fame = player.fame || 0;
  const ovr = player.ovr || 65;
  const potential = player.potentialOvr || 78;
  const posLine = getPositionLineKey(player.position);

  const allProClubs = getProClubsFromDatabase();
  if (allProClubs.length === 0) {
    return [];
  }

  let eligibleClubs = allProClubs.filter((club) => {
    if (isSpecialClubOfferExcluded(club)) return false;
    if (fame < 10 && club.leagueTier === 1 && potential < 95) return false;
    const clubPosOvr = club.positionalLevels[posLine];
    return ovr >= clubPosOvr - 20;
  });

  if (eligibleClubs.length === 0) {
    eligibleClubs = allProClubs.filter((c) => !isSpecialClubOfferExcluded(c));
  }

  const randomIndex = Math.floor(Math.random() * eligibleClubs.length);
  const selectedClub = eligibleClubs[randomIndex];

  return [buildContractOfferFromClub(player, selectedClub)];
}

/**
 * YEARLY PROFESSIONAL RECRUITMENT SCAN
 * Evaluates player against all eligible clubs in the saved Competition Editor database.
 * Returns up to the top 10 most relevant offers with guaranteed league variety.
 */
export function runProfessionalRecruitmentScan(player: PlayerConfig): ProContractOffer[] {
  if ((player.age || 10) < 16) {
    return [];
  }
  const fame = player.fame || 0;
  const ovr = player.ovr || 65;
  const potential = player.potentialOvr || 78;
  const badRep = player.badReputation || 0;
  const playerCountry = player.clubCountry || player.country || (player.nationality as any)?.name || 'England';
  const playerCountryCode = (player as any).countryCode || player.nationality?.code || '';
  const posLine = getPositionLineKey(player.position);

  const allProClubs = getProClubsFromDatabase();
  if (allProClubs.length === 0) {
    return [];
  }

  const isClubDomestic = (club: ProClubDefinition): boolean => {
    if (playerCountryCode && club.countryCode) {
      if (club.countryCode.toLowerCase() === playerCountryCode.toLowerCase()) return true;
    }
    const cName = (club.countryName || '').toLowerCase();
    const pCountry = playerCountry.toLowerCase();
    return (
      cName === pCountry ||
      pCountry.includes(cName) ||
      cName.includes(pCountry)
    );
  };

  // Shuffle clubs to avoid deterministic bias
  const shuffledClubs = [...allProClubs].sort(() => Math.random() - 0.5);

  const offers: ProContractOffer[] = [];
  const leagueOfferCounts: Record<string, number> = {};
  let saudiOffersCount = 0;

  for (const club of shuffledClubs) {
    // Strict Special-Club Exclusion (Zero Leaks):
    // Real Madrid, FC Barcelona, FC Bayern, PSG, EPL Big Six, and Saudi clubs must NEVER appear in ordinary offer generators
    if (isSpecialClubOfferExcluded(club)) {
      continue;
    }

    const isDomestic = isClubDomestic(club);
    const isSaudi =
      club.countryCode === 'KSA' ||
      club.countryCode === 'SAU' ||
      club.countryName.toLowerCase().includes('saudi') ||
      club.leagueName.toLowerCase().includes('saudi');

    // Rule 1: Saudi Arabia / Arabia Offer Cap (Max 1 or 2 offers across entire scan)
    if (isSaudi) {
      if (saudiOffersCount >= 2) {
        continue; // Strictly cap at max 2 offers from Saudi Arabia
      }
      // If young prospect with modest fame/ovr, make a 2nd Saudi offer rare (80% drop) so other leagues have room
      if (saudiOffersCount >= 1 && (ovr < 80 && fame < 150)) {
        if (Math.random() < 0.80) {
          continue;
        }
      }
    }

    // Eligibility check
    let isEligible = false;
    if (isSaudi && ovr >= 85 && fame >= 300) {
      isEligible = true;
    } else if (fame >= 30) {
      isEligible = true; // International & domestic
    } else if (fame >= 20) {
      isEligible = isDomestic || club.leagueTier === 2 || potential >= 85;
    } else if (fame >= 10) {
      isEligible = isDomestic || club.leagueTier === 2 || potential >= 88;
    } else {
      isEligible = isDomestic || club.leagueTier === 2 || potential >= 88 || ovr >= 60;
    }

    if (!isEligible) continue;

    const clubPosOvr = club.positionalLevels[posLine];
    const need = club.positionalNeeds[posLine];

    let interestProbability = 35;
    const ovrDiff = ovr - clubPosOvr;
    interestProbability += ovrDiff * 4;

    if (isDomestic) {
      interestProbability += 20; // Domestic clubs scout local talent more actively
    }

    if (isSaudi && ovr >= 85 && fame >= 300) {
      interestProbability = 95;
    }

    if (need === 'WEAK') {
      interestProbability += 25;
    } else if (need === 'STRONG') {
      interestProbability -= 30;
    }

    if (potential >= 95) {
      interestProbability += 50;
      if (ovrDiff < -10) interestProbability += 25;
    } else if (potential >= 90) {
      interestProbability += 20;
      if (ovrDiff < -5) interestProbability += 15;
    }

    if (badRep >= 50) {
      interestProbability -= 35;
    } else if (badRep >= 25) {
      interestProbability -= 15;
    }

    const finalProb = Math.min(95, Math.max(5, interestProbability));
    const roll = Math.random() * 100;
    if (roll > finalProb) {
      continue;
    }

    // --- LEAGUE BIDDING & CLUB ECONOMIC SYSTEM EVALUATION ---
    const leagueKey = club.leagueName || club.countryName;
    const currentLeagueCount = leagueOfferCounts[leagueKey] || 0;

    let salaryMultiplier = 1.0;
    let isSameLeagueBiddingPenalty = false;
    let leagueBidCount = currentLeagueCount + 1;
    let economicConstraintNote: string | undefined;

    if (currentLeagueCount >= 2) {
      // 3rd (or 4th+) team from the SAME league wanting the player!
      // Penalty: The third team has to pay DOUBLE the salary.
      // Club Economic System: makes this undesirable for clubs with tighter budgets to diversify offers across leagues.
      const ecoTier = club.economicTier || (club.prestigeStars >= 5 ? 'ELITE_FINANCES' : club.prestigeStars >= 4 ? 'STRONG_BUDGET' : club.prestigeStars >= 3 ? 'MODERATE_BUDGET' : 'CONSTRAINED_BUDGET');

      let boardDropOutRate = 0.85;
      if (ecoTier === 'CONSTRAINED_BUDGET') boardDropOutRate = 0.95;
      else if (ecoTier === 'MODERATE_BUDGET') boardDropOutRate = 0.85;
      else if (ecoTier === 'STRONG_BUDGET') boardDropOutRate = 0.70;
      else if (ecoTier === 'ELITE_FINANCES') boardDropOutRate = 0.50;

      // Generational talents have slightly higher willingness from boards
      if (potential >= 95 || ovr >= 82) {
        boardDropOutRate = Math.max(0.35, boardDropOutRate - 0.20);
      }

      if (Math.random() < boardDropOutRate) {
        // Board refuses to pay double salary penalty and pulls out, keeping offers varied across leagues!
        continue;
      }

      // If the club board approved the costly bidding war:
      salaryMultiplier = 2.0; // Double salary penalty!
      isSameLeagueBiddingPenalty = true;
      economicConstraintNote = `3rd ${club.leagueName} Bidder: Board approved 2.0x Double Salary Penalty in domestic bidding war.`;
    }

    const offer = buildContractOfferFromClub(player, club, {
      salaryMultiplier,
      isSameLeagueBiddingPenalty,
      leagueBidCount,
      economicConstraintNote,
    });

    offers.push(offer);
    leagueOfferCounts[leagueKey] = currentLeagueCount + 1;
    if (isSaudi) {
      saudiOffersCount++;
    }
  }

  // Sort candidate offers by calculated relevance
  offers.sort((a, b) => calculateContractOfferRelevance(b, player) - calculateContractOfferRelevance(a, player));

  // Build final balanced set (up to 10 offers) with guaranteed league diversity:
  // - Enforce hard cap of max 2 Saudi Arabia offers
  // - Enforce max 2 per league unless 3rd paid double salary penalty
  const finalOffers: ProContractOffer[] = [];
  const finalLeagueCounts: Record<string, number> = {};
  let finalSaudiCount = 0;

  for (const offer of offers) {
    const isSaudi =
      offer.countryCode === 'KSA' ||
      offer.countryCode === 'SAU' ||
      offer.countryName?.toLowerCase().includes('saudi') ||
      offer.leagueName?.toLowerCase().includes('saudi');

    if (isSaudi && finalSaudiCount >= 2) {
      continue; // Strictly enforce max 2 from Saudi Arabia
    }

    const lKey = offer.leagueName;
    const lCount = finalLeagueCounts[lKey] || 0;

    // Normal cap of 2 per league in the final top list, unless it's a 3rd team that paid the 2x bidding war penalty
    if (lCount >= 2 && !offer.isSameLeagueBiddingPenalty) {
      continue;
    }
    if (lCount >= 3) {
      continue;
    }

    finalOffers.push(offer);
    finalLeagueCounts[lKey] = lCount + 1;
    if (isSaudi) finalSaudiCount++;

    if (finalOffers.length >= 10) break;
  }

  return finalOffers.length > 0 ? finalOffers : offers.slice(0, 10);
}

/**
 * Backward compatibility wrapper for existing generateFirstContractOffers
 */
export function generateFirstContractOffers(player: PlayerConfig): ProContractOffer[] {
  const scanOffers = runProfessionalRecruitmentScan(player);
  if (scanOffers.length > 0) return scanOffers;
  return generateTryoutContractOffer(player);
}

/**
 * Retrieves official Youth League team options
 */
export function getYouthLeagueTeams(cityName?: string): YouthLeagueTeamChoice[] {
  const league = getYouthLeagueByCity(cityName) || YOUTH_LEAGUES_DATABASE.london || Object.values(YOUTH_LEAGUES_DATABASE)[0];
  if (!league) return [];

  return league.teams.map((team, idx) => ({
    id: team.id,
    name: team.name,
    ovrRating: team.ovr,
    isTopHalf: idx < 5,
    city: team.city,
    country: team.country,
    divisionName: team.youthLeague,
  }));
}

export function getRandomBiggerYouthClub(cityName?: string): YouthLeagueTeamChoice | null {
  const teams = getYouthLeagueTeams(cityName);
  if (!teams || teams.length === 0) return null;
  const sorted = [...teams].sort((a, b) => b.ovrRating - a.ovrRating);
  const topHalf = sorted.slice(0, 5);
  const randomIndex = Math.floor(Math.random() * topHalf.length);
  return topHalf[randomIndex];
}

export function isProfessionalPlayer(player: Partial<PlayerConfig>): boolean {
  return isProIdentity(player as any);
}

export function getRandomLocalYouthClub(cityName?: string): YouthLeagueTeamChoice | null {
  const teams = getYouthLeagueTeams(cityName);
  if (!teams || teams.length === 0) return null;
  const sorted = [...teams].sort((a, b) => a.ovrRating - b.ovrRating);
  const lowestTwo = sorted.slice(0, 2);
  const randomIndex = Math.floor(Math.random() * lowestTwo.length);
  return lowestTwo[randomIndex];
}
