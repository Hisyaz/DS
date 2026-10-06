import { PlayerCardData, PlayerConfig } from '../types';
import { getStartingClubChemistry } from './badReputationSystem';
import { EditorTeamData, LeagueDatabase } from '../types/leagueEditor';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { findClubInLeagueDatabase } from './kitResolutionSystem';
import { cleanLeagueName, getCanonicalLeagueIds, getExpectedCountryForLeague } from './leagueSanitizer';
import { calculatePlayerMarketValue } from './transferMarketSystem';
import { PRO_CLUBS_DATABASE, ProClubDefinition } from './earlyCareerSystem';
import { detectPlayerContinentalCompetition } from './continentalScheduleIntegration';

export interface ClubCompetitiveContext {
  club: string;
  clubId: string;
  clubCountry: string;
  countryCode: string;
  league: string;
  leagueId: string;
  leagueTier: 1 | 2;
  canonicalD1Id?: string;
  canonicalD2Id?: string;
  kit?: any;
  emblem?: any;
}

/**
 * Resolves authoritative club, country, league, and kit data for any club name or ID.
 * Guarantees strict club-to-country ecosystem belonging:
 * - Tottenham -> England (ENG) -> Premier League (england_d1)
 * - Hoffenheim -> Germany (GER) -> Bundesliga (germany_d1)
 * - Real Madrid -> Spain (ESP) -> La Liga (spain_d1)
 */
export function resolveAuthoritativeClubContext(
  clubIdentifier: string,
  providedLeagueDb?: LeagueDatabase
): ClubCompetitiveContext {
  const db = providedLeagueDb || getCareerLeagueDatabase() || getLeagueDatabase();
  const matchedDbClub: EditorTeamData | null = findClubInLeagueDatabase(clubIdentifier, db);

  // Check early career pro clubs catalog if not in DB
  const proClubDef: ProClubDefinition | undefined = PRO_CLUBS_DATABASE.find(
    (c) => c.clubName.toLowerCase() === clubIdentifier.toLowerCase() || c.id === clubIdentifier
  );

  let clubName = matchedDbClub?.name || proClubDef?.clubName || clubIdentifier;
  let clubId = matchedDbClub?.id || proClubDef?.id || `club_${clubName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  // Determine Country Code & Country Name
  let countryCode = (matchedDbClub?.countryCode || proClubDef?.countryCode || '').toUpperCase().trim();
  let countryName = matchedDbClub?.countryName || proClubDef?.countryName || '';

  // If country is missing or ambiguous, derive strictly from team ID prefix or club name
  if (!countryCode || countryCode === 'INT') {
    const idLower = clubId.toLowerCase();
    const nameLower = clubName.toLowerCase();

    if (idLower.startsWith('eng_') || idLower.startsWith('england') || nameLower.includes('tottenham') || nameLower.includes('arsenal') || nameLower.includes('chelsea') || nameLower.includes('liverpool') || nameLower.includes('manchester') || nameLower.includes('aston villa') || nameLower.includes('newcastle')) {
      countryCode = 'ENG';
      countryName = 'England';
    } else if (idLower.startsWith('ger_') || idLower.startsWith('germany') || nameLower.includes('hoffenheim') || nameLower.includes('bayern') || nameLower.includes('dortmund') || nameLower.includes('leverkusen') || nameLower.includes('leipzig') || nameLower.includes('frankfurt') || nameLower.includes('stuttgart') || nameLower.includes('munster') || nameLower.includes('münster') || nameLower.includes('preussen') || nameLower.includes('preußen') || nameLower.includes('schalke') || nameLower.includes('hamburg') || nameLower.includes('hertha') || nameLower.includes('koln') || nameLower.includes('köln') || nameLower.includes('paderborn') || nameLower.includes('nürnberg') || nameLower.includes('nurnberg') || nameLower.includes('braunschweig') || nameLower.includes('magdeburg') || nameLower.includes('elversberg') || nameLower.includes('karlsruhe') || nameLower.includes('kaiserslautern') || nameLower.includes('darmstadt') || nameLower.includes('hannover')) {
      countryCode = 'GER';
      countryName = 'Germany';
    } else if (idLower.startsWith('esp_') || idLower.startsWith('spain') || nameLower.includes('madrid') || nameLower.includes('barcelona') || nameLower.includes('sevilla') || nameLower.includes('valencia') || nameLower.includes('sociedad') || nameLower.includes('betis') || nameLower.includes('bilbao')) {
      countryCode = 'ESP';
      countryName = 'Spain';
    } else if (idLower.startsWith('ita_') || idLower.startsWith('italy') || nameLower.includes('juventus') || nameLower.includes('inter') || nameLower.includes('milan') || nameLower.includes('roma') || nameLower.includes('napoli') || nameLower.includes('lazio') || nameLower.includes('atalanta')) {
      countryCode = 'ITA';
      countryName = 'Italy';
    } else if (idLower.startsWith('fr_') || idLower.startsWith('france') || nameLower.includes('paris') || nameLower.includes('psg') || nameLower.includes('marseille') || nameLower.includes('monaco') || nameLower.includes('lyon') || nameLower.includes('lille') || nameLower.includes('rennes')) {
      countryCode = 'FR';
      countryName = 'France';
    } else if (idLower.startsWith('por_') || idLower.startsWith('portugal') || nameLower.includes('benfica') || nameLower.includes('sporting') || nameLower.includes('porto') || nameLower.includes('braga')) {
      countryCode = 'POR';
      countryName = 'Portugal';
    } else if (idLower.startsWith('arg_') || idLower.startsWith('argentina') || nameLower.includes('boca') || nameLower.includes('river') || nameLower.includes('racing') || nameLower.includes('independiente')) {
      countryCode = 'ARG';
      countryName = 'Argentina';
    } else if (idLower.startsWith('bra_') || idLower.startsWith('brazil') || nameLower.includes('flamengo') || nameLower.includes('palmeiras') || nameLower.includes('santos') || nameLower.includes('corinthians') || nameLower.includes('sao paulo')) {
      countryCode = 'BRA';
      countryName = 'Brazil';
    } else if (idLower.startsWith('sau_') || idLower.startsWith('saudi') || nameLower.includes('hilal') || nameLower.includes('nassr') || nameLower.includes('ittihad') || nameLower.includes('ahli')) {
      countryCode = 'KSA';
      countryName = 'Saudi Arabia';
    } else {
      countryCode = 'ENG';
      countryName = 'England';
    }
  }

  if (!countryName) {
    if (countryCode === 'ENG') countryName = 'England';
    else if (countryCode === 'ESP') countryName = 'Spain';
    else if (countryCode === 'GER' || countryCode === 'DEU') countryName = 'Germany';
    else if (countryCode === 'ITA') countryName = 'Italy';
    else if (countryCode === 'FR' || countryCode === 'FRA') countryName = 'France';
    else if (countryCode === 'POR' || countryCode === 'PRT') countryName = 'Portugal';
    else if (countryCode === 'ARG') countryName = 'Argentina';
    else if (countryCode === 'BRA') countryName = 'Brazil';
    else if (countryCode === 'KSA' || countryCode === 'SAU') countryName = 'Saudi Arabia';
    else countryName = 'International';
  }

  // Derive Canonical Leagues for Country
  const canonicalLeagues = getCanonicalLeagueIds(countryCode);
  let leagueId = matchedDbClub?.leagueId;

  // Verify whether team is in D1 or D2
  let isTier2 = false;
  if (leagueId) {
    if (leagueId === canonicalLeagues.d2Id || leagueId.endsWith('_d2') || (db.leagues?.[leagueId] as any)?.tier === 2 || proClubDef?.leagueTier === 2) {
      isTier2 = true;
    }
  } else {
    if (db.leagues?.[canonicalLeagues.d2Id]?.teamIds?.includes(clubId) || proClubDef?.leagueTier === 2) {
      isTier2 = true;
      leagueId = canonicalLeagues.d2Id;
    } else {
      leagueId = canonicalLeagues.d1Id;
    }
  }

  const leagueData = db.leagues?.[leagueId];
  let leagueName = cleanLeagueName(leagueData?.name || proClubDef?.leagueName || (isTier2 ? '2nd Division' : '1st Division'));

  return {
    club: clubName,
    clubId,
    clubCountry: countryName,
    countryCode,
    league: leagueName,
    leagueId,
    leagueTier: isTier2 ? 2 : 1,
    canonicalD1Id: canonicalLeagues.d1Id,
    canonicalD2Id: canonicalLeagues.d2Id,
    kit: matchedDbClub?.kit ? { ...matchedDbClub.kit } : undefined,
    emblem: matchedDbClub?.emblem ? { ...matchedDbClub.emblem } : undefined,
  };
}

/**
 * Rebuilds the player's competitive ecosystem completely upon a transfer or pro transition.
 * Wipes out all residue from previous club/country/competitions.
 */
export type ClubFederation = 'UEFA' | 'CONMEBOL' | 'AFC' | 'CAF' | 'CONCACAF' | 'OFC';

/**
 * Returns the canonical continental federation for a club based on country code and league
 */
export function getClubFederation(countryCode?: string, leagueName?: string, clubCountry?: string): ClubFederation {
  const code = (countryCode || clubCountry || '').toUpperCase();
  const lName = (leagueName || '').toLowerCase();

  // Europe (UEFA)
  if (
    ['ENG', 'ESP', 'GER', 'DEU', 'ITA', 'FR', 'FRA', 'NED', 'POR', 'BEL', 'SCO', 'TUR', 'AUT', 'SUI', 'GRE', 'UKR', 'RUS', 'POL', 'CZE', 'CRO', 'DEN', 'NOR', 'SWE'].includes(code) ||
    lName.includes('premier league') || lName.includes('laliga') || lName.includes('la liga') || lName.includes('serie a') || lName.includes('bundesliga') || lName.includes('ligue 1') || lName.includes('ligue 2') || lName.includes('eredivisie') || lName.includes('liga portugal') || lName.includes('championship')
  ) {
    return 'UEFA';
  }

  // South America (CONMEBOL)
  if (
    ['ARG', 'BRA', 'COL', 'CHI', 'URU', 'PAR', 'ECU', 'PER', 'VEN', 'BOL'].includes(code) ||
    lName.includes('brasileir') || lName.includes('argentin') || lName.includes('libertadores') || lName.includes('sudamericana')
  ) {
    return 'CONMEBOL';
  }

  // Asia (AFC)
  if (
    ['SAU', 'QAT', 'UAE', 'JPN', 'KOR', 'CHN', 'AUS', 'IRN', 'UZB', 'IRQ'].includes(code) ||
    lName.includes('saudi') || lName.includes('roshn') || lName.includes('j-league') || lName.includes('k league')
  ) {
    return 'AFC';
  }

  // North/Central America (CONCACAF)
  if (['USA', 'MEX', 'CAN', 'CRC', 'HON', 'JAM', 'PAN'].includes(code) || lName.includes('mls') || lName.includes('liga mx')) {
    return 'CONCACAF';
  }

  // Africa (CAF)
  if (['EGY', 'MAR', 'NGA', 'RSA', 'GHA', 'SEN', 'ALG', 'TUN'].includes(code)) {
    return 'CAF';
  }

  return 'UEFA'; // Default to UEFA
}

/**
 * Checks whether a continental competition ID belongs to the given federation
 */
export function isCompetitionValidForFederation(compId: string, federation: ClubFederation): boolean {
  if (federation === 'UEFA') {
    return ['UEFA_CL', 'UEFA_EL', 'UEFA_ECL', 'UEFA_SC'].includes(compId);
  }
  if (federation === 'CONMEBOL') {
    return ['CONMEBOL_LIB', 'CONMEBOL_SUD'].includes(compId);
  }
  if (federation === 'AFC') {
    return ['AFC_CL', 'AFC_CUP'].includes(compId);
  }
  if (federation === 'CAF') {
    return ['CAF_CL', 'CAF_CC'].includes(compId);
  }
  if (federation === 'CONCACAF') {
    return ['CONCACAF_CC'].includes(compId);
  }
  return false;
}

export function rebuildPlayerCompetitiveContextOnTransfer<T extends PlayerConfig | PlayerCardData>(
  player: T,
  newClubIdentifier: string,
  overrides?: Partial<T>,
  providedLeagueDb?: LeagueDatabase
): T {
  const authoritative = resolveAuthoritativeClubContext(newClubIdentifier, providedLeagueDb);
  const newFederation = getClubFederation(authoritative.countryCode, authoritative.league, authoritative.clubCountry);

  const updated: any = {
    ...player,
    ...overrides,
    club: authoritative.club,
    clubId: authoritative.clubId,
    clubCountry: authoritative.clubCountry,
    countryCode: authoritative.countryCode,
    country: player.country || authoritative.clubCountry,
    league: authoritative.league,
    leagueId: authoritative.leagueId,
    leagueTier: authoritative.leagueTier,
    kit: authoritative.kit || (player as any).kit,
    emblem: authoritative.emblem || (player as any).emblem,
    isFreeAgent: false,
    chemistry: overrides?.chemistry ?? getStartingClubChemistry((player as any).badReputationTier || 0), // Starting chemistry modified by Bad Reputation Tier
    requestedTransfer: false,
    activeInternationalDuty: undefined,
    isRepresentingNationalTeam: false,
    // Clear old match cache
    activeMatchResult: undefined,
  };

  const isSameClub =
    Boolean(player.clubId && player.clubId === authoritative.clubId) ||
    Boolean((player.club || '').trim().toLowerCase() === authoritative.club.trim().toLowerCase());

  // Clean detection object: strip previous club's continental qualification flags and ranks
  const cleanPlayerForDetection = {
    ...player,
    ...overrides,
    club: authoritative.club,
    clubId: authoritative.clubId,
    clubCountry: authoritative.clubCountry,
    countryCode: authoritative.countryCode,
    league: authoritative.league,
    leagueId: authoritative.leagueId,
    leagueTier: authoritative.leagueTier,
    isProfessional: true,
    squadDestination: 'First Team',
    // Strictly strip previous club's continental context when transferring
    qualifiedContinental: isSameClub ? (player as any).qualifiedContinental : undefined,
    qualifiedContinentalCompId: isSameClub ? (player as any).qualifiedContinentalCompId : undefined,
    previousLeagueFinish: isSameClub ? (player as any).previousLeagueFinish : undefined,
    leagueFinishRank: isSameClub ? (player as any).leagueFinishRank : undefined,
    lastSeasonRank: isSameClub ? (player as any).lastSeasonRank : undefined,
    isDomesticCupWinner: isSameClub ? Boolean((player as any).isDomesticCupWinner) : false,
  };

  // Detect if destination club has continental qualification for next season
  const detectedNewComp = detectPlayerContinentalCompetition(
    cleanPlayerForDetection as any,
    providedLeagueDb
  );

  // Validate that detected competition strictly matches the destination club's federation
  const validCompId = detectedNewComp && isCompetitionValidForFederation(detectedNewComp, newFederation)
    ? detectedNewComp
    : undefined;

  let newCompShort: 'ucl' | 'uel' | 'uecl' | 'libertadores' | 'sudamericana' | 'afc_elite' | 'afc_two' | undefined;
  if (validCompId === 'UEFA_CL') newCompShort = 'ucl';
  else if (validCompId === 'UEFA_EL') newCompShort = 'uel';
  else if (validCompId === 'UEFA_ECL') newCompShort = 'uecl';
  else if (validCompId === 'CONMEBOL_LIB') newCompShort = 'libertadores';
  else if (validCompId === 'CONMEBOL_SUD') newCompShort = 'sudamericana';
  else if (validCompId === 'AFC_CL') newCompShort = 'afc_elite';
  else if (validCompId === 'AFC_CUP') newCompShort = 'afc_two';

  // If overrides specify a comp, ensure it is valid for the new club's federation
  const overrideCompId = (overrides as any)?.qualifiedContinentalCompId;
  const validOverrideCompId = overrideCompId && isCompetitionValidForFederation(overrideCompId, newFederation)
    ? overrideCompId
    : undefined;

  (updated as any).qualifiedContinental = (overrides as any)?.qualifiedContinental !== undefined
    ? ((overrides as any).qualifiedContinental && isCompetitionValidForFederation(validOverrideCompId || validCompId || '', newFederation) ? (overrides as any).qualifiedContinental : newCompShort)
    : isSameClub
    ? (isCompetitionValidForFederation((player as any).qualifiedContinentalCompId || '', newFederation) ? ((player as any).qualifiedContinental || newCompShort) : newCompShort)
    : newCompShort;

  (updated as any).qualifiedContinentalCompId = validOverrideCompId !== undefined
    ? validOverrideCompId
    : isSameClub
    ? (isCompetitionValidForFederation((player as any).qualifiedContinentalCompId || '', newFederation) ? ((player as any).qualifiedContinentalCompId || validCompId || undefined) : (validCompId || undefined))
    : (validCompId || undefined);

  (updated as any).previousLeagueFinish = (overrides as any)?.previousLeagueFinish !== undefined
    ? (overrides as any).previousLeagueFinish
    : isSameClub
    ? (player as any).previousLeagueFinish
    : undefined;

  (updated as any).leagueFinishRank = (overrides as any)?.leagueFinishRank !== undefined
    ? (overrides as any).leagueFinishRank
    : isSameClub
    ? (player as any).leagueFinishRank
    : undefined;

  (updated as any).lastSeasonRank = (overrides as any)?.lastSeasonRank !== undefined
    ? (overrides as any).lastSeasonRank
    : isSameClub
    ? (player as any).lastSeasonRank
    : undefined;

  (updated as any).isDomesticCupWinner = (overrides as any)?.isDomesticCupWinner !== undefined
    ? (overrides as any).isDomesticCupWinner
    : isSameClub
    ? Boolean((player as any).isDomesticCupWinner)
    : false;

  // Recalculate market value based on new context
  if (typeof updated.marketValue === 'number' || typeof (player as any).marketValue === 'number') {
    try {
      const mvRes = calculatePlayerMarketValue(updated);
      updated.marketValue = mvRes.marketValue;
    } catch {
      // ignore
    }
  }

  return updated as T;
}
