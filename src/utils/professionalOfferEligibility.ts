import { PlayerConfig, PlayerCardData, ManagerState } from '../types';
import { AgentState } from '../types';
import { ProClubDefinition, getProClubsFromDatabase } from './earlyCareerSystem';
import { isSpecialClubOfferExcluded } from './specialClubInterestSystem';
import { calculateEffectiveFame } from './managerInteractionSystem';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { YOUTH_LEAGUES_DATABASE } from '../data/youthLeaguesDatabase';

export { calculateEffectiveFame };

export interface SouthAmericanRestrictionResult {
  isAllowed: boolean;
  reason?: string;
  isCareerRestartEvent?: boolean;
}

export interface ClubEligibilityResult {
  eligible: boolean;
  reason?: string;
  isCareerRestart?: boolean;
  suggestion?: 'tryout' | 'agent' | null;
}

export const SOUTH_AMERICAN_COUNTRY_CODES = ['ARG', 'BRA', 'URU', 'COL', 'CHI', 'PAR', 'ECU', 'PER', 'VEN', 'BOL'];
export const SOUTH_AMERICAN_COUNTRY_NAMES = [
  'argentina',
  'brazil',
  'brasil',
  'uruguay',
  'colombia',
  'chile',
  'paraguay',
  'ecuador',
  'peru',
  'venezuela',
  'bolivia',
];

/**
 * Checks if the player's main nationality is Brazilian
 */
export function isBrazilianPlayer(player: Partial<PlayerConfig | PlayerCardData>): boolean {
  const nat = (
    typeof player.nationality === 'string'
      ? player.nationality
      : (player.nationality as any)?.name || (player.nationality as any)?.code || ''
  )
    .toLowerCase()
    .trim();
  const code = ((player as any).countryCode || (player.nationality as any)?.code || '').toLowerCase().trim();
  return nat.includes('brazil') || nat.includes('brasil') || code === 'bra' || code === 'br';
}

/**
 * Checks if the player's nationality is from South America
 */
export function isSouthAmericanNationality(player: Partial<PlayerConfig | PlayerCardData>): boolean {
  const nat = (
    typeof player.nationality === 'string'
      ? player.nationality
      : (player.nationality as any)?.name || ''
  )
    .toLowerCase()
    .trim();
  const code = ((player as any).countryCode || (player.nationality as any)?.code || '').toUpperCase().trim();

  if (SOUTH_AMERICAN_COUNTRY_CODES.includes(code)) return true;
  return SOUTH_AMERICAN_COUNTRY_NAMES.some((c) => nat.includes(c));
}

/**
 * Checks if the club is an Argentine club
 */
export function isArgentineClub(club: {
  countryCode?: string;
  countryName?: string;
  leagueName?: string;
  clubName?: string;
}): boolean {
  const code = (club.countryCode || '').toUpperCase().trim();
  const cName = (club.countryName || '').toLowerCase().trim();
  const lName = (club.leagueName || '').toLowerCase().trim();
  return (
    code === 'ARG' ||
    cName.includes('argentina') ||
    lName.includes('argentin') ||
    lName.includes('liga profesional') ||
    lName.includes('primera división')
  );
}

/**
 * Checks if the club is from South America
 */
export function isSouthAmericanClub(club: {
  countryCode?: string;
  countryName?: string;
  leagueName?: string;
  clubName?: string;
}): boolean {
  const code = (club.countryCode || '').toUpperCase().trim();
  const cName = (club.countryName || '').toLowerCase().trim();
  const lName = (club.leagueName || '').toLowerCase().trim();

  if (SOUTH_AMERICAN_COUNTRY_CODES.includes(code)) return true;
  return (
    cName.includes('argentina') ||
    cName.includes('brazil') ||
    cName.includes('brasil') ||
    lName.includes('brasileir') ||
    lName.includes('argentin') ||
    SOUTH_AMERICAN_COUNTRY_NAMES.some((c) => cName.includes(c))
  );
}

/**
 * Checks if player graduated from or belongs to a South American Youth League
 */
export function isPlayerFromSouthAmericanYouthLeague(player: Partial<PlayerConfig | PlayerCardData>): boolean {
  const yTeam = (player as any).youthLeagueTeam;
  if (yTeam?.country && (yTeam.country.toLowerCase().includes('argentina') || yTeam.country.toLowerCase().includes('brazil'))) {
    return true;
  }
  const yLeagueName = ((player as any).youthLeagueName || '').toLowerCase();
  if (
    yLeagueName.includes('bonaerense') ||
    yLeagueName.includes('buenos aires') ||
    yLeagueName.includes('paulista') ||
    yLeagueName.includes('são paulo') ||
    yLeagueName.includes('sao paulo')
  ) {
    return true;
  }
  const startingCity = ((player as any).startingCity || '').toLowerCase();
  if (startingCity.includes('buenos aires') || startingCity.includes('são paulo') || startingCity.includes('sao paulo')) {
    return true;
  }
  return false;
}

/**
 * Checks if the player started their career in Argentina (city, nationality, youth league)
 */
export function isPlayerStartedInArgentina(player: Partial<PlayerConfig | PlayerCardData>): boolean {
  const startingCity = ((player as any).startingCity || '').toLowerCase();
  if (
    startingCity.includes('buenos aires') ||
    startingCity.includes('argentina') ||
    startingCity.includes('rosario') ||
    startingCity.includes('córdoba') ||
    startingCity.includes('cordoba') ||
    startingCity.includes('mendoza') ||
    startingCity.includes('la plata')
  ) {
    return true;
  }

  const city = ((player as any).city || '').toLowerCase();
  if (
    city.includes('buenos aires') ||
    city.includes('argentina') ||
    city.includes('rosario') ||
    city.includes('córdoba') ||
    city.includes('cordoba')
  ) {
    return true;
  }

  const yTeam = (player as any).youthLeagueTeam;
  if (yTeam?.country && yTeam.country.toLowerCase().includes('argentina')) {
    return true;
  }

  const yLeagueName = ((player as any).youthLeagueName || '').toLowerCase();
  if (
    yLeagueName.includes('bonaerense') ||
    yLeagueName.includes('buenos aires') ||
    yLeagueName.includes('argentin')
  ) {
    return true;
  }

  const country = ((player as any).country || (player as any).clubCountry || '').toLowerCase();
  if (country.includes('argentina')) {
    return true;
  }

  const rawNat = typeof player.nationality === 'string'
    ? player.nationality
    : (player.nationality as any)?.code || (player.nationality as any)?.name || '';
  const nat = String(rawNat).toUpperCase();
  if (nat === 'ARG' || nat.includes('ARGENTIN')) {
    return true;
  }

  return false;
}

/**
 * Checks if the player started their career in Brazil (city, nationality, youth league)
 */
export function isPlayerStartedInBrazil(player: Partial<PlayerConfig | PlayerCardData>): boolean {
  const startingCity = ((player as any).startingCity || '').toLowerCase();
  if (
    startingCity.includes('são paulo') ||
    startingCity.includes('sao paulo') ||
    startingCity.includes('rio de janeiro') ||
    startingCity.includes('brazil') ||
    startingCity.includes('brasil')
  ) {
    return true;
  }

  const city = ((player as any).city || '').toLowerCase();
  if (
    city.includes('são paulo') ||
    city.includes('sao paulo') ||
    city.includes('rio de janeiro') ||
    city.includes('brazil') ||
    city.includes('brasil')
  ) {
    return true;
  }

  const yTeam = (player as any).youthLeagueTeam;
  if (yTeam?.country && (yTeam.country.toLowerCase().includes('brazil') || yTeam.country.toLowerCase().includes('brasil'))) {
    return true;
  }

  const yLeagueName = ((player as any).youthLeagueName || '').toLowerCase();
  if (
    yLeagueName.includes('paulista') ||
    yLeagueName.includes('são paulo') ||
    yLeagueName.includes('sao paulo') ||
    yLeagueName.includes('carioca') ||
    yLeagueName.includes('brasileir')
  ) {
    return true;
  }

  const country = ((player as any).country || (player as any).clubCountry || '').toLowerCase();
  if (country.includes('brazil') || country.includes('brasil')) {
    return true;
  }

  const rawNat = typeof player.nationality === 'string'
    ? player.nationality
    : (player.nationality as any)?.code || (player.nationality as any)?.name || '';
  const nat = String(rawNat).toUpperCase();
  if (nat === 'BRA' || nat.includes('BRAZIL') || nat.includes('BRASIL')) {
    return true;
  }

  return false;
}

/**
 * SECTION 9: SOUTH AMERICAN OFFER RESTRICTIONS
 *
 * If the player's main nationality is Brazilian:
 * Argentine clubs cannot send normal offers unless:
 * - Age >= 22
 * - OVR < 80
 * If both conditions are met, Argentine offers become possible.
 *
 * If the player's main nationality is from outside South America:
 * South American clubs cannot send normal offers unless:
 * - Age >= 25
 * - OVR < 84
 * When this exception occurs, create an event about the player attempting to restart their career in that country.
 */
export function checkSouthAmericanRestrictions(
  player: Partial<PlayerConfig | PlayerCardData>,
  club: { countryCode?: string; countryName?: string; leagueName?: string; clubName?: string }
): SouthAmericanRestrictionResult {
  const age = player.age || 16;
  const ovr = player.ovr || 60;

  // 1. Brazilian player vs Argentine club
  if (isBrazilianPlayer(player) && isArgentineClub(club)) {
    if (age >= 22 && ovr < 80) {
      return { isAllowed: true };
    }
    return {
      isAllowed: false,
      reason: 'Brazilian players cannot receive normal offers from Argentine clubs unless Age ≥ 22 and OVR < 80.',
    };
  }

  // 2. Player from outside South America vs South American club
  const isSouthAmerican = isSouthAmericanNationality(player);
  if (!isSouthAmerican && isSouthAmericanClub(club)) {
    if (age >= 25 && ovr < 84) {
      return {
        isAllowed: true,
        isCareerRestartEvent: true,
        reason: `🔄 South American Career Restart: Seeking a passionate footballing revival in ${club.countryName || 'South America'}.`,
      };
    }
    return {
      isAllowed: false,
      reason: 'Players from outside South America cannot receive normal offers from South American clubs unless Age ≥ 25 and OVR < 84.',
    };
  }

  return { isAllowed: true };
}

export function isSouthAmericanOfferAllowed(
  player: Partial<PlayerConfig | PlayerCardData>,
  club: { countryCode?: string; countryName?: string; leagueName?: string; clubName?: string }
): { allowed: boolean; reason?: string; isCareerRestart?: boolean } {
  const res = checkSouthAmericanRestrictions(player, club);
  return {
    allowed: res.isAllowed,
    reason: res.reason,
    isCareerRestart: res.isCareerRestartEvent,
  };
}

/**
 * SECTION 6: LOCKED ELITE CLUBS
 * The following clubs cannot send normal offers:
 * - EPL Big 6
 * - Real Madrid
 * - Barcelona
 * - PSG
 * - Bayern
 * - Saudi Arabian clubs
 * These clubs can only become available through their dedicated events.
 */
export function isLockedEliteClub(
  club: {
    id?: string;
    clubName?: string;
    countryCode?: string;
    countryName?: string;
    leagueName?: string;
    leagueId?: string;
    leagueTier?: number;
  },
  player?: Partial<PlayerCardData | PlayerConfig>
): boolean {
  return isSpecialClubOfferExcluded(club, player as any);
}

/**
 * Resolves player's Youth League country or current domestic country
 */
export function getPlayerYouthOrCurrentCountry(player: Partial<PlayerConfig | PlayerCardData>): {
  countryName: string;
  countryCode: string;
} {
  const yTeam = (player as any).youthLeagueTeam;
  if (yTeam?.country) {
    const cName = yTeam.country;
    let code = 'ENG';
    if (cName.toLowerCase().includes('argentina')) code = 'ARG';
    else if (cName.toLowerCase().includes('brazil') || cName.toLowerCase().includes('brasil')) code = 'BRA';
    else if (cName.toLowerCase().includes('spain') || cName.toLowerCase().includes('españa')) code = 'ESP';
    else if (cName.toLowerCase().includes('england')) code = 'ENG';
    else if (cName.toLowerCase().includes('france')) code = 'FRA';
    return { countryName: cName, countryCode: code };
  }

  const yLeagueName = ((player as any).youthLeagueName || '').toLowerCase();
  if (yLeagueName.includes('bonaerense') || yLeagueName.includes('buenos aires')) {
    return { countryName: 'Argentina', countryCode: 'ARG' };
  }
  if (yLeagueName.includes('paulista') || yLeagueName.includes('são paulo') || yLeagueName.includes('sao paulo')) {
    return { countryName: 'Brazil', countryCode: 'BRA' };
  }
  if (yLeagueName.includes('madrileña') || yLeagueName.includes('madrid')) {
    return { countryName: 'Spain', countryCode: 'ESP' };
  }
  if (yLeagueName.includes('london') || yLeagueName.includes('england')) {
    return { countryName: 'England', countryCode: 'ENG' };
  }
  if (yLeagueName.includes('paris') || yLeagueName.includes('france')) {
    return { countryName: 'France', countryCode: 'FRA' };
  }

  const rawCity = (player.startingCity || (player as any).city || '').toLowerCase();
  if (rawCity.includes('são paulo') || rawCity.includes('sao paulo') || rawCity.includes('brazil') || rawCity.includes('brasil')) {
    return { countryName: 'Brazil', countryCode: 'BRA' };
  }
  if (rawCity.includes('buenos aires') || rawCity.includes('argentina')) {
    return { countryName: 'Argentina', countryCode: 'ARG' };
  }
  if (rawCity.includes('madrid') || rawCity.includes('spain') || rawCity.includes('españa')) {
    return { countryName: 'Spain', countryCode: 'ESP' };
  }
  if (rawCity.includes('london') || rawCity.includes('england')) {
    return { countryName: 'England', countryCode: 'ENG' };
  }
  if (rawCity.includes('paris') || rawCity.includes('france')) {
    return { countryName: 'France', countryCode: 'FRA' };
  }

  const rawClub = (player.club || (player as any).youthTeamName || '').toLowerCase();
  if (rawClub) {
    for (const t of YOUTH_LEAGUES_DATABASE.sao_paulo.teams) {
      if (t.name.toLowerCase() === rawClub) return { countryName: 'Brazil', countryCode: 'BRA' };
    }
    for (const t of YOUTH_LEAGUES_DATABASE.buenos_aires.teams) {
      if (t.name.toLowerCase() === rawClub) return { countryName: 'Argentina', countryCode: 'ARG' };
    }
    for (const t of YOUTH_LEAGUES_DATABASE.madrid.teams) {
      if (t.name.toLowerCase() === rawClub) return { countryName: 'Spain', countryCode: 'ESP' };
    }
    for (const t of YOUTH_LEAGUES_DATABASE.london.teams) {
      if (t.name.toLowerCase() === rawClub) return { countryName: 'England', countryCode: 'ENG' };
    }
    for (const t of YOUTH_LEAGUES_DATABASE.paris.teams) {
      if (t.name.toLowerCase() === rawClub) return { countryName: 'France', countryCode: 'FRA' };
    }
  }

  const rawNat = typeof player.nationality === 'string'
    ? player.nationality
    : (player.nationality as any)?.name || (player.nationality as any)?.code || '';
  if (rawNat.toLowerCase().includes('brazil') || rawNat.toLowerCase().includes('brasil') || rawNat.toUpperCase() === 'BRA') {
    return { countryName: 'Brazil', countryCode: 'BRA' };
  }
  if (rawNat.toLowerCase().includes('argentina') || rawNat.toUpperCase() === 'ARG') {
    return { countryName: 'Argentina', countryCode: 'ARG' };
  }
  if (rawNat.toLowerCase().includes('spain') || rawNat.toLowerCase().includes('españa') || rawNat.toUpperCase() === 'ESP') {
    return { countryName: 'Spain', countryCode: 'ESP' };
  }
  if (rawNat.toLowerCase().includes('france') || rawNat.toUpperCase() === 'FRA') {
    return { countryName: 'France', countryCode: 'FRA' };
  }

  const pCountry = player.clubCountry || player.country || (player.nationality as any)?.name || 'England';
  const pCode = (player as any).countryCode || (player.nationality as any)?.code || 'ENG';
  return { countryName: pCountry, countryCode: pCode };
}

/**
 * Checks if a club is in the player's Youth League country (or current domestic country)
 */
export function isClubDomesticToPlayer(
  club: { countryCode?: string; countryName?: string },
  player: Partial<PlayerConfig | PlayerCardData>
): boolean {
  const { countryName, countryCode } = getPlayerYouthOrCurrentCountry(player);
  const clubCode = (club.countryCode || '').toUpperCase().trim();
  const clubName = (club.countryName || '').toLowerCase().trim();
  const pCode = countryCode.toUpperCase().trim();
  const pName = countryName.toLowerCase().trim();

  if (clubCode && pCode && clubCode === pCode) return true;
  if (clubName && pName && (clubName === pName || clubName.includes(pName) || pName.includes(clubName))) return true;
  return false;
}

/**
 * AUTHORITATIVE NORMAL OFFER ELIGIBILITY EVALUATOR
 *
 * Rules:
 * 1. Youth Academy (< 17 or youth team): Zero senior professional offers. Players develop in youth leagues.
 * 2. Over 16 (17+) with professional status:
 *    - At lowest fame (effectiveFame <= 100): First priority and ONLY clubs to send offers are
 *      the player's current country's second division (Tier 2 domestic). Foreign clubs (e.g. German 2nd division for a player in Brazil)
 *      are strictly prohibited from making offers.
 *    - Effective Fame 101–200: Domestic first-division and second-division clubs can send offers.
 *    - Effective Fame > 200: Foreign clubs can send offers (tier 2 if OVR <= 75, tier 1 if OVR > 75).
 * 3. Locked Elite Clubs cannot send normal offers.
 * 4. South American restrictions strictly enforced.
 */
export function evaluateClubNormalOfferEligibility(
  player: Partial<PlayerConfig | PlayerCardData>,
  club: {
    id?: string;
    clubName?: string;
    countryCode?: string;
    countryName?: string;
    leagueName?: string;
    leagueTier?: 1 | 2;
  },
  agent?: AgentState | ManagerState | null
): ClubEligibilityResult {
  const age = player.age || 16;
  const ovr = player.ovr || 60;
  const tier = club.leagueTier || 1;

  // RULE 1: Youth Academy Players (< 17 or in youth league/academy) cannot receive senior pro offers
  if (age < 17 || !isProfessionalPlayer(player as any) || (player.club || '').toLowerCase().includes('youth')) {
    return {
      eligible: false,
      reason: 'Youth Academy prospects under 17 develop in youth leagues and are not eligible for senior professional club offers.',
    };
  }

  // Locked Elite Clubs rule
  if (isLockedEliteClub(club, player)) {
    return {
      eligible: false,
      reason: 'Locked Elite Club: Available only via dedicated special events.',
    };
  }

  // South American restrictions
  const saCheck = checkSouthAmericanRestrictions(player, club);
  if (!saCheck.isAllowed) {
    return {
      eligible: false,
      reason: saCheck.reason,
    };
  }

  // Calculate Effective Fame
  const effectiveFame = calculateEffectiveFame(player.fame || 0, agent);
  const isDomestic = isClubDomesticToPlayer(club, player);

  // RULE 2: LOWEST FAME (effectiveFame <= 100)
  // First priority and ONLY clubs to send offers are player's current country's second division!
  if (effectiveFame <= 100) {
    if (!isDomestic) {
      return {
        eligible: false,
        reason: 'At lowest fame (≤100), foreign clubs cannot make offers. Only domestic second-division clubs in your current country are eligible.',
      };
    }

    if (tier !== 2) {
      return {
        eligible: false,
        reason: 'At lowest fame (≤100), first-division clubs do not make offers. First priority is your current country’s second division.',
      };
    }

    return {
      eligible: true,
      isCareerRestart: saCheck.isCareerRestartEvent,
    };
  }

  // RULE 3: MID FAME (effectiveFame 101–200)
  // Domestic 1st & 2nd division clubs can make offers. Foreign clubs cannot yet make normal offers.
  if (effectiveFame > 100 && effectiveFame <= 200) {
    if (isDomestic) {
      return {
        eligible: true,
        isCareerRestart: saCheck.isCareerRestartEvent,
      };
    }

    return {
      eligible: false,
      reason: 'Effective Fame 101–200 is restricted to clubs in your current country. Foreign clubs require international fame (>200).',
    };
  }

  // RULE 4: HIGH FAME (effectiveFame > 200)
  // Domestic clubs always eligible.
  if (isDomestic) {
    return {
      eligible: true,
      isCareerRestart: saCheck.isCareerRestartEvent,
    };
  }

  // Foreign clubs: If OVR <= 75, foreign clubs must be second-division unless elite fame/event
  if (ovr <= 75) {
    if (tier === 2) {
      return {
        eligible: true,
        isCareerRestart: saCheck.isCareerRestartEvent,
      };
    }
    return {
      eligible: false,
      reason: 'At OVR ≤75, foreign normal offers are restricted to second-division clubs.',
    };
  }

  // High OVR (>75) & high fame (>200): foreign first-division clubs eligible
  return {
    eligible: true,
    isCareerRestart: saCheck.isCareerRestartEvent,
  };
}

/**
 * SECTION 7: PREMIER LEAGUE EVENT TRIGGER
 * Trigger:
 * - OVR >= 75
 * - Effective Fame >= 200
 * - Player is at least 16
 * - Player has completed applicable youth graduation pathway when relevant
 */
export function shouldTriggerPremierLeagueEvent(
  player: Partial<PlayerConfig | PlayerCardData>,
  agent?: AgentState | ManagerState | null
): boolean {
  if ((player as any).eplSigningEventUnlocked || (player as any).eplSigningEventDismissed) {
    return false;
  }
  const age = player.age || 16;
  const ovr = player.ovr || 60;
  const effectiveFame = calculateEffectiveFame(player.fame || 0, agent);
  const isEnglish = isEnglishPlayer(player);
  const isLondonYouth = isLondonYouthLeaguePlayer(player);

  if (age < 16) return false;

  // English domestic talent or London youth league graduates: OVR >= 68
  if (isEnglish || isLondonYouth) {
    return ovr >= 68;
  }

  // Continental/international youth prospects: OVR >= 72 or OVR >= 70 with moderate fame
  return ovr >= 72 || (ovr >= 70 && effectiveFame >= 30);
}

/**
 * SECTION 8: HOT PROSPECT EVENT TRIGGER
 * Trigger:
 * - OVR >= 80, or OVR >= 75 with moderate fame
 * - Age >= 16
 */
export function shouldTriggerHotProspectEvent(
  player: Partial<PlayerConfig | PlayerCardData>,
  agent?: AgentState | ManagerState | null
): boolean {
  const age = player.age || 16;
  const ovr = player.ovr || 60;
  const effectiveFame = calculateEffectiveFame(player.fame || 0, agent);

  if (age < 16) return false;
  return ovr >= 80 || (ovr >= 75 && effectiveFame >= 50);
}

/**
 * Checks if a player has English nationality
 */
export function isEnglishPlayer(player: Partial<PlayerConfig | PlayerCardData>): boolean {
  const nat = (
    typeof player.nationality === 'string'
      ? player.nationality
      : (player.nationality as any)?.name || (player.nationality as any)?.code || ''
  )
    .toLowerCase()
    .trim();
  const code = ((player as any).countryCode || (player.nationality as any)?.code || '').toLowerCase().trim();
  return nat.includes('england') || nat.includes('english') || code === 'eng' || code === 'gb-eng' || code === 'gb';
}

/**
 * Checks if player attended London Youth League
 */
export function isLondonYouthLeaguePlayer(player: Partial<PlayerConfig | PlayerCardData>): boolean {
  const yLeagueName = ((player as any).youthLeagueName || '').toLowerCase();
  const yTeam = (player as any).youthLeagueTeam;
  if (yTeam?.youthLeague && yTeam.youthLeague.toLowerCase().includes('london')) return true;
  if (yLeagueName.includes('london')) return true;
  return false;
}
