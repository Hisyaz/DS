import { PlayerConfig, PlayerCardData, AccountingState, ManagerState } from '../types';
import {
  ProClubDefinition,
  getProClubsFromDatabase,
  getPositionFullName,
  getTacticalRoleName,
  getPositionLineKey,
} from './earlyCareerSystem';
import {
  calculateRealisticPlayerMarketValue,
  formatCurrencyEuro,
  createFallbackClubFinances,
} from './clubEconomySystem';
import {
  evaluateClubInterest,
  getClubCompetitiveTier,
  estimateClubStarterOvr,
  resolvePlayerSubPosition,
  ClubTierInfo,
} from './clubRankingSystem';
import { getClubDevelopmentTier, ClubDevelopmentTierInfo } from './clubDevelopmentEngine';
import { getFootballSchoolForClub } from '../data/youthFootballSchools';
import { calculatePlayerMarketValue } from './transferMarketSystem';
import { cleanTeamName } from './matchImportanceSystem';
import { validateAndRepairPlaystyle, getValidPlayStylesForSubPosition, isProfessionalPlayer } from './playerIdentitySystem';
import { resolveAuthoritativeClubContext } from './clubContextRebuilder';

function resolveProTacticalPlaystyle(subPos: string, candidateStyle?: string): string {
  const repaired = validateAndRepairPlaystyle(subPos, candidateStyle);
  if (repaired.toLowerCase() === 'basic') {
    const validTactical = getValidPlayStylesForSubPosition(subPos).filter((s) => s.toLowerCase() !== 'basic');
    return validTactical[0] || 'Balanced';
  }
  return repaired;
}
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { calculateLeagueAvgStarterOvr } from './leagueOvrCalibrationSystem';
import { isSpecialClubOfferExcluded } from './specialClubInterestSystem';
import {
  evaluateClubNormalOfferEligibility,
  isSouthAmericanOfferAllowed,
  isClubDomesticToPlayer,
  calculateEffectiveFame,
} from './professionalOfferEligibility';

export { drawFourStreetCards } from './streetCardSystem';

export type AgentSearchDirective = 'glory' | 'potential' | 'money' | 'any' | 'renewal';

export type OfferTransferType =
  | 'regular_transfer'
  | 'last_year_discount'
  | 'pre_contract_free'
  | 'free_agent_direct'
  | 'first_contract'
  | 'tryout_contract'
  | 'club_renewal';

export interface UnifiedClubOffer {
  id: string;
  buyerClub: ProClubDefinition;
  clubBadgeBg: string;
  leagueName: string;
  countryName: string;
  countryCode: string;
  prestigeStars: number;
  leagueTier: number;
  isEuropean?: boolean;
  clubFame: number;

  // Football Project & Development Tier
  developmentTier: number;
  developmentTierName: string;
  developmentPhilosophy?: string;
  youthDevelopmentPoints?: number;

  // Tactical & Manager Context
  managerName: string;
  managerNationality: string;
  managerFormation: string;
  managerTacticalStyle: string;
  secondaryTacticalStyle?: string;

  // Position & Playstyle
  expectedPosition: string;
  expectedSubPosition?: string;
  tacticalRole?: string;
  expectedPlaystyle: string;

  // Squad Role & Playing Time
  squadRole: 'Key Player' | 'First Team Regular' | 'Rotation' | 'Young Prospect';
  expectedRole: 'Starter' | 'Rotation Player' | 'Key Player' | 'Young Prospect' | 'First Team Regular' | 'Develop With Reserves';
  initialSquadDestination: 'First Team' | 'Reserves' | 'U20' | 'U17';
  proposedSquad?: 'First Team' | 'Reserves' | 'U20' | 'U17';
  playingTimeExpectation?: 'STARTER' | 'FIRST TEAM' | 'ROTATION' | 'RESERVES' | 'U20 PROSPECT' | 'U17 PROSPECT';
  roleDescription?: string;

  // Starter Comparison
  starterOvr: number;
  starterDiff: number;
  starterComparisonText: string;

  // Financial Terms
  transferType: OfferTransferType;
  transferFee: number;
  formattedFee: string;
  weeklyWage: number;
  yearlySalary: number;
  contractYears: number;
  signingBonus: number;
  signingBonusPercent: number;
  playerTransferFeeCutPercent?: number;
  playerTransferFeeCutAmount?: number;
  releaseClause: number;
  isReleaseClausePaid?: boolean;

  // Reason & Flags
  curatedReason: string;
  directive?: AgentSearchDirective | 'tryout' | 'unsolicited' | 'renewal';
  isNegotiated?: boolean;
  isSaudiMegaOffer?: boolean;
  isExpiringContractMove?: boolean;
  isFreeAgentMove?: boolean;
  isRenewalOffer?: boolean;
  clubRetentionDesireText?: string;
  loyaltyBonus?: number;
  economicConstraintNote?: string;
  isCareerRestartEvent?: boolean;
  eligibilityNote?: string;
}

export interface TryoutLeagueOption {
  leagueId: string;
  leagueName: string;
  countryName: string;
  countryCode: string;
  flagEmoji: string;
  divisionTier: number;
  averageStarterOvr: number;
  prestigeLevel: string;
  clubCount: number;
}

/**
 * Authoritative League Quality & Prestige Hierarchy Ranking
 * First Divisions:
 * 1. Premier League — England
 * 2. La Liga — Spain
 * 3. Serie A — Italy
 * 4. Bundesliga — Germany
 * 5. Ligue 1 — France
 * 6. Liga Portugal
 * 7. Eredivisie — Netherlands
 * 8. Saudi Pro League — Saudi Arabia
 * 9. Brasileirão Série A — Brazil
 * 10. Argentine Primera División — Argentina
 *
 * Second Divisions (England & Spain priority):
 * 9. England 2nd Division (EFL Championship) -> 9.1
 * 10. Spain 2nd Division (LaLiga 2 / Segunda) -> 10.1
 * 11. Serie B (Italy 2nd)
 * 12. 2. Bundesliga (Germany 2nd)
 * 13. Ligue 2 (France 2nd)
 * 14. Liga Portugal 2 (Portugal 2nd)
 * 15. Eerste Divisie (Netherlands 2nd)
 * 16. Saudi 1st Division (Saudi 2nd)
 * 17. Brasileirão Série B (Brazil 2nd)
 * 18. Primera Nacional (Argentina 2nd)
 */
export function getLeaguePrestigeRank(
  leagueName: string = '',
  countryCode: string = '',
  divisionTier: number = 1
): number {
  const l = (leagueName || '').toLowerCase();
  const c = (countryCode || '').toUpperCase();

  const isSecondDiv =
    divisionTier === 2 ||
    l.includes('2') ||
    l.includes('championship') ||
    l.includes('segunda') ||
    l.includes('hypermotion') ||
    l.includes('b') ||
    l.includes('nacional');

  if (!isSecondDiv) {
    if (l.includes('premier') || c === 'ENG' || c === 'GB') return 1;
    if (l.includes('la liga') || l.includes('laliga') || l.includes('primera división') && c === 'ESP' || c === 'ESP') return 2;
    if (l.includes('serie a') || c === 'ITA') return 3;
    if (l.includes('bundesliga') || c === 'GER') return 4;
    if (l.includes('ligue 1') || c === 'FRA' || c === 'FR') return 5;
    if (l.includes('portugal') || l.includes('primeira') || c === 'POR') return 6;
    if (l.includes('eredivisie') || c === 'NED') return 7;
    if (l.includes('saudi') || l.includes('roshn') || c === 'SAU' || c === 'KSA') return 8;
    if (l.includes('brasil') || l.includes('brasileir') || c === 'BRA') return 9;
    if (l.includes('argentin') || l.includes('profesional') || c === 'ARG') return 10;
    return 10.5;
  }

  // Second Divisions
  if (l.includes('championship') || (c === 'ENG' && isSecondDiv)) return 9.1;
  if (l.includes('la liga 2') || l.includes('hypermotion') || l.includes('segunda') || (c === 'ESP' && isSecondDiv)) return 10.1;
  if (l.includes('serie b') || (c === 'ITA' && isSecondDiv)) return 11;
  if (l.includes('2. bundesliga') || (c === 'GER' && isSecondDiv)) return 12;
  if (l.includes('ligue 2') || (c === 'FRA' && isSecondDiv)) return 13;
  if (l.includes('liga 2') || l.includes('portugal 2') || (c === 'POR' && isSecondDiv)) return 14;
  if (l.includes('eerste') || (c === 'NED' && isSecondDiv)) return 15;
  if (l.includes('saudi 1') || (c === 'SAU' && isSecondDiv)) return 16;
  if (l.includes('série b') || l.includes('serie b') || (c === 'BRA' && isSecondDiv)) return 17;
  if (l.includes('nacional') || (c === 'ARG' && isSecondDiv)) return 18;

  return 20;
}

/**
 * Resolves available leagues for Tryouts
 */
export function getAvailableTryoutLeagues(): TryoutLeagueOption[] {
  const allClubs = getProClubsFromDatabase();
  const leagueMap = new Map<string, TryoutLeagueOption>();

  const flagMap: Record<string, string> = {
    ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    GB: '🇬🇧',
    ESP: '🇪🇸',
    ITA: '🇮🇹',
    GER: '🇩🇪',
    FR: '🇫🇷',
    FRA: '🇫🇷',
    POR: '🇵🇹',
    NED: '🇳🇱',
    SAU: '🇸🇦',
    KSA: '🇸🇦',
    USA: '🇺🇸',
    BRA: '🇧🇷',
    ARG: '🇦🇷',
    TUR: '🇹🇷',
    BEL: '🇧🇪',
    SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    MEX: '🇲🇽',
    JPN: '🇯🇵',
  };

  const db = getLeagueDatabase();
  allClubs.forEach((club) => {
    const key = `${club.leagueName}-${club.countryCode}`;
    if (!leagueMap.has(key)) {
      const clubsInLeague = allClubs.filter((c) => c.leagueName === club.leagueName);
      const calculatedAvg = calculateLeagueAvgStarterOvr(club.leagueName, db);
      const avgOvr = Math.round(calculatedAvg);

      const prestige =
        club.leagueTier === 1
          ? club.prestigeStars >= 4.5
            ? 'World Class'
            : club.prestigeStars >= 3.5
            ? 'Top Tier'
            : 'Major League'
          : 'Championship / 2nd Tier';

      leagueMap.set(key, {
        leagueId: club.leagueName.toLowerCase().replace(/\s+/g, '_'),
        leagueName: club.leagueName,
        countryName: club.countryName,
        countryCode: club.countryCode,
        flagEmoji: flagMap[club.countryCode.toUpperCase()] || '⚽',
        divisionTier: club.leagueTier,
        averageStarterOvr: avgOvr,
        prestigeLevel: prestige,
        clubCount: clubsInLeague.length,
      });
    }
  });

  return Array.from(leagueMap.values()).sort((a, b) => b.averageStarterOvr - a.averageStarterOvr);
}

/**
 * SIGNING BONUS — ALWAYS REQUIRED
 * Every professional contract includes a Signing Bonus (5–25%).
 *
 * Transfer Signing:
 * If the player is being transferred from another club:
 * Signing Bonus = 5–25% of the player's transfer value / transfer fee.
 *
 * First Contract / Free Agent / Tryout / Renewal:
 * If the player is signing without a transfer fee:
 * Signing Bonus = 5–25% of yearly salary.
 *
 * Negotiation Skill:
 * Determined by Agent Negotiation skill. If the player has no agent, use:
 * Negotiation Skill = 20 as the fixed negotiation value.
 */
export function calculateNegotiatedSigningBonus(
  transferType: OfferTransferType,
  transferFeeOrValue: number,
  yearlySalary: number,
  agent?: ManagerState,
  buyerClubFame: number = 5
): { signingBonus: number; bonusPercent: number } {
  // If player has no agent, use fixed Negotiation Skill = 20
  const agentSkill = typeof agent?.negotiation === 'number' && agent.negotiation > 0 ? agent.negotiation : 20;

  // Scale bonus percentage between 5% and 25% based on negotiation skill (20 -> 5%, 100 -> 25%)
  // with small realistic negotiation variation (±2%)
  const skillFactor = Math.max(0, Math.min(1, (agentSkill - 20) / 80));
  const basePercent = 5 + skillFactor * 18;
  const variation = (Math.random() * 4) - 2; // -2% to +2% variation
  const finalPercent = Math.min(25, Math.max(5, Math.round(basePercent + variation)));

  const isTransfer = transferType === 'regular_transfer' || transferType === 'last_year_discount';
  let signingBonus = 0;

  if (isTransfer && transferFeeOrValue > 0) {
    signingBonus = Math.round(transferFeeOrValue * (finalPercent / 100));
  } else {
    // First Contract, Free Agent, Tryout, Renewal (signing without a transfer fee)
    signingBonus = Math.round(yearlySalary * (finalPercent / 100));
  }

  // Minimum floor
  signingBonus = Math.max(1000, signingBonus);

  return { signingBonus, bonusPercent: finalPercent };
}

/**
 * GLORY PRESTIGE SCORING ENGINE (Section 7: I Want Glory)
 * Special prestige hierarchy:
 * 1. Real Madrid
 * 2. Barcelona
 * 3. Bayern Munich
 * 4. PSG
 * These four clubs override the normal league-ranking order.
 * After PSG, prioritize major Premier League clubs including traditional Big Six
 * (Man City, Liverpool, Arsenal, Chelsea, Man United, Tottenham).
 * Then continue using: League ranking, Club OVR, Domestic reputation, Continental reputation, Current strength.
 */
export function calculateGloryPrestigeScore(
  club: ProClubDefinition,
  starterOvr: number
): number {
  const n = club.clubName.toLowerCase();

  // 1. Real Madrid
  if (n.includes('real madrid')) return 2000;
  // 2. Barcelona
  if (n.includes('barcelona')) return 1900;
  // 3. Bayern Munich
  if (n.includes('bayern')) return 1800;
  // 4. PSG
  if (n.includes('paris saint-germain') || n.includes('psg') || n.includes('paris sg')) return 1700;

  // Premier League Big Six
  if (n.includes('manchester city') || n.includes('man city')) return 1600;
  if (n.includes('liverpool')) return 1580;
  if (n.includes('arsenal')) return 1560;
  if (n.includes('chelsea')) return 1540;
  if (n.includes('manchester united') || n.includes('man utd')) return 1520;
  if (n.includes('tottenham')) return 1500;

  // Other clubs ranked by League Ranking + Fame + Stars + Starter OVR
  const leagueRank = getLeaguePrestigeRank(club.leagueName, club.countryCode, club.leagueTier);
  const leagueScore = Math.max(0, 1000 - leagueRank * 40);
  const starsScore = (club.prestigeStars || 3) * 50;
  const fameScore = (club.clubFame || 5) * 30;
  const ovrScore = starterOvr * 3;

  return leagueScore + starsScore + fameScore + ovrScore;
}

/**
 * DEVELOPMENT SCORING ENGINE (Section 8: I Want to Develop)
 * Primary ranking:
 * 1. Development Tier (Tier 5 > Tier 4 > Tier 3 > Tier 2 > Tier 1)
 * 2. Development points/year (+30 > +25 > +20 > +15 > +10)
 * 3. Player's projected squad role (Key Player / Starter > Rotation > Reserves)
 * 4. Position compatibility (tactical role & sub-position match)
 * 5. Club OVR
 * 6. League quality
 * A lower-OVR club with substantially better development is preferred over a stronger club with poor development.
 */
export function calculateDevelopmentScore(
  club: ProClubDefinition,
  subPos: string,
  devTier: ClubDevelopmentTierInfo,
  squadRole: string,
  starterOvr: number
): number {
  // 1. Development Tier (500 pts for Tier 5 down to 100 pts for Tier 1)
  const tierScore = devTier.tier * 200;
  // 2. Dev points/year (e.g. +30 pts/yr -> 300 pts)
  const pointsScore = (devTier.annualPoints || 10) * 15;
  // 3. Projected squad role
  const roleScore =
    squadRole === 'Key Player' ? 180 :
    squadRole === 'First Team Regular' ? 150 :
    squadRole === 'Starter' ? 150 :
    squadRole === 'Rotation' ? 80 : 30;
  // 4. Position compatibility (is sub-position utilized in club formation)
  const posFit = (club.preferredPlaystyles?.[subPos] || club.preferredPlaystyles?.[subPos.slice(0, 2)]) ? 100 : 50;
  // 5. Club OVR
  const ovrScore = starterOvr * 0.8;
  // 6. League quality
  const leagueRank = getLeaguePrestigeRank(club.leagueName, club.countryCode, club.leagueTier);
  const leagueScore = Math.max(0, 50 - leagueRank * 2);

  return tierScore + pointsScore + roleScore + posFit + ovrScore + leagueScore;
}

/**
 * FINANCIAL SCORING ENGINE (Section 9: I Want Money)
 * Primary factors:
 * 1. Salary (yearly wage package)
 * 2. Signing bonus
 * 3. Contract value
 * 4. Other financial terms
 */
export function calculateMoneyPackageScore(
  yearlySalary: number,
  signingBonus: number,
  contractYears: number,
  playerCutAmount: number = 0
): number {
  const totalContractValue = yearlySalary * contractYears + signingBonus + playerCutAmount;
  return totalContractValue + yearlySalary * 2 + signingBonus * 3;
}

/**
 * Evaluates reality-based club desire score for a player
 */
export function calculateClubDesireScore(
  club: ProClubDefinition,
  player: Partial<PlayerCardData>,
  directive?: AgentSearchDirective
): {
  desireScore: number;
  starterOvr: number;
  starterDiff: number;
  isSaudi: boolean;
  proposedSquad: 'First Team' | 'Reserves' | 'U20';
  expectedRole: 'Starter' | 'Rotation Player' | 'Key Player' | 'Young Prospect';
  curatedReason: string;
  isEligible: boolean;
} {
  const ovr = player.ovr || 60;
  const potential = player.potentialOvr || 75;
  const age = player.age || 18;
  const fame = player.fame || 0;
  const subPos = resolvePlayerSubPosition(player);
  const isFreeAgent = Boolean(player.isFreeAgent || player.club === 'Free Agent' || ((player as any).accounting?.contractYears ?? 3) <= 0);
  const contractYears = isFreeAgent ? 0 : ((player as any).accounting?.contractYears ?? 3);
  const hasReleaseClause = Boolean((player as any).accounting?.releaseClause && (player as any).accounting.releaseClause > 0);

  const starterOvr = estimateClubStarterOvr(club, subPos);
  const starterDiff = ovr - starterOvr;

  const isSaudi =
    club.countryCode === 'KSA' ||
    club.countryCode === 'SAU' ||
    club.countryName.toLowerCase().includes('saudi') ||
    club.leagueName.toLowerCase().includes('saudi');

  // SAUDI ARABIA PLAYER REQUIREMENT:
  // Saudi clubs generally require 85+ OVR (or 90+ Potential AND 80+ OVR) to generate interest.
  // Below those thresholds, Saudi clubs do NOT generate interest.
  if (isSaudi) {
    const meetsSaudiRequirement = ovr >= 85 || (potential >= 90 && ovr >= 80);
    if (!meetsSaudiRequirement) {
      return {
        desireScore: 0,
        starterOvr,
        starterDiff,
        isSaudi: true,
        proposedSquad: 'Reserves',
        expectedRole: 'Young Prospect',
        curatedReason: 'Club requires 85+ OVR superstar status or 90+ Potential project pedigree.',
        isEligible: false,
      };
    }
  }

  let baseDesire = 50;

  // 1. STARTER COMPARISON & SQUAD FIT
  if (starterDiff >= 5) baseDesire += 40;
  else if (starterDiff >= 2) baseDesire += 30;
  else if (starterDiff >= 0) baseDesire += 20;
  else if (starterDiff >= -3) baseDesire += 10;
  else if (starterDiff >= -6) baseDesire += 0;
  else baseDesire -= 25; // Player far below club level

  // 2. AGE & POTENTIAL (<28 years old)
  if (age < 28) {
    const potDiff = potential - starterOvr;
    if (potDiff >= 5) baseDesire += 25;
    else if (potDiff >= 0) baseDesire += 15;
    if (age <= 21 && potential >= 80) baseDesire += 15;
  } else if (age >= 32) {
    baseDesire -= 10;
  }

  // 3. FAME
  baseDesire += Math.min(25, Math.floor(fame / 25));

  // 4. CONTRACT STATUS & RELEASE CLAUSE
  if (isFreeAgent) {
    baseDesire += 30; // Free agent bargain!
  } else if (contractYears === 1) {
    baseDesire += 25; // Expiring contract opportunity!
  }

  if (hasReleaseClause) {
    baseDesire += 10; // Release clause removes transfer hurdles
  }

  // Determine Squad & Role
  let proposedSquad: 'First Team' | 'Reserves' | 'U20' = 'First Team';
  let expectedRole: 'Starter' | 'Rotation Player' | 'Key Player' | 'Young Prospect' = 'Rotation Player';

  if (starterDiff >= 3 || (isSaudi && ovr >= 78)) {
    proposedSquad = 'First Team';
    expectedRole = ovr >= 84 ? 'Key Player' : 'Starter';
  } else if (starterDiff >= -2 || ovr >= 72) {
    proposedSquad = 'First Team';
    expectedRole = 'Rotation Player';
  } else if (age <= 20 && potential >= 75) {
    proposedSquad = 'Reserves';
    expectedRole = 'Young Prospect';
  } else {
    proposedSquad = 'Reserves';
    expectedRole = 'Rotation Player';
  }

  let curatedReason = `Fits squad profile with ${starterOvr} OVR starter at ${subPos}.`;
  if (directive === 'glory') {
    curatedReason = `🏆 International Trophy Ambition: High-prestige project competing for top silverware with manager ${club.managerName}.`;
  } else if (directive === 'potential') {
    const devTier = getClubDevelopmentTier(club.clubName);
    curatedReason = `🌱 World-Class Academy & Development: ${devTier.name} (${devTier.annualPoints} pts/yr) with high-intensity coaching.`;
  } else if (directive === 'money') {
    curatedReason = `💰 Lucrative Financial Package: Premium wage structure with competitive signing bonuses and bonuses.`;
  }

  return {
    desireScore: Math.max(10, baseDesire),
    starterOvr,
    starterDiff,
    isSaudi,
    proposedSquad,
    expectedRole,
    curatedReason,
    isEligible: baseDesire >= 35,
  };
}

/**
 * Curates up to 5 best club offers tailored to Agent directive and player parameters
 */
export function generateCuratedClubOffers(
  player: Partial<PlayerCardData>,
  directive: AgentSearchDirective = 'any',
  agent?: ManagerState,
  accounting?: AccountingState,
  limit: number = 5
): UnifiedClubOffer[] {
  // Youth Academy players under 17 develop in youth leagues and cannot receive senior professional club offers
  if ((player.age || 10) < 17 || !isProfessionalPlayer(player) || (player.club || '').toLowerCase().includes('youth')) {
    return [];
  }

  const allClubs = getProClubsFromDatabase();
  const currentClubName = (player.club || '').toLowerCase();
  const ovr = player.ovr || 60;
  const fame = player.fame || 0;
  const contractYears = (player as any).isFreeAgent ? 0 : (accounting?.contractYears ?? (player as any).contractYearsRemaining ?? 3);
  const isFreeAgent = contractYears <= 0 || Boolean(player.isFreeAgent || player.club === 'Free Agent');
  const subPos = resolvePlayerSubPosition(player);

  const candidateClubs = allClubs.filter((c) => {
    // Zero Leaks: Never allow special clubs in ordinary agent searches or transfer offers
    if (isSpecialClubOfferExcluded(c, player)) return false;
    if (c.clubName.toLowerCase() === currentClubName) return false;
    // Betrayed clubs permanently refuse to sign or bid on the player
    if (player.betrayedClubs && player.betrayedClubs.length > 0) {
      const cleanCandidate = cleanTeamName(c.clubName);
      const isBetrayed = player.betrayedClubs.some((betrayed) => {
        const cleanB = cleanTeamName(betrayed);
        return cleanB && (cleanB === cleanCandidate || cleanCandidate.includes(cleanB) || cleanB.includes(cleanCandidate));
      });
      if (isBetrayed) return false;
    }
    // Professional normal offer eligibility (fame tiers, domestic priority, 2nd division, South American rules)
    const eligibility = evaluateClubNormalOfferEligibility(player, c, agent);
    if (!eligibility.eligible) return false;

    return true;
  });

  // Evaluate candidate clubs for desire & realistic interest
  const evaluated = candidateClubs
    .map((club) => {
      const desire = calculateClubDesireScore(club, player, directive);
      const interest = evaluateClubInterest(
        club,
        player,
        agent?.network ?? agent?.negotiation ?? 20
      );

      return { club, desire, interest };
    })
    .filter(({ desire, interest }) => {
      // Must be eligible and have positive realistic club interest
      return desire.isEligible && (interest.isOfferEligible || interest.interestScore >= 35);
    });

  // If filtered pool is small, relax filtering slightly while enforcing Saudi criteria
  let eligiblePool = evaluated;
  if (eligiblePool.length < limit) {
    eligiblePool = candidateClubs
      .map((club) => {
        const desire = calculateClubDesireScore(club, player, directive);
        const interest = evaluateClubInterest(
          club,
          player,
          agent?.network ?? agent?.negotiation ?? 20
        );
        return { club, desire, interest };
      })
      .filter(({ desire }) => desire.isEligible);
  }

  // Fallback to avoid empty pool
  if (eligiblePool.length === 0) {
    eligiblePool = candidateClubs.slice(0, 10).map((club) => ({
      club,
      desire: calculateClubDesireScore(club, player, directive),
      interest: evaluateClubInterest(club, player),
    }));
  }

  // Pre-calculate full offer data for sorting by exact directive priorities
  const constructedOffers: { offer: UnifiedClubOffer; directiveScore: number }[] = eligiblePool.map(
    ({ club, desire, interest }, idx) => {
      const clubFameVal = typeof club.clubFame === 'number' ? club.clubFame : club.prestigeStars * 2;
      const devTier = getClubDevelopmentTier(club.clubName, club.leagueName, club.countryName, clubFameVal);
      const devSchool = getFootballSchoolForClub(club.clubName, club.leagueName, '', club.countryName);

      const pos = (player.position || 'ST').toUpperCase();
      const rawStyle = club.preferredPlaystyles?.[subPos] || club.preferredPlaystyles?.[pos] || player.playStyle || 'Balanced';
      const validPlaystyle = resolveProTacticalPlaystyle(subPos, rawStyle);

      // Calculate Transfer Type
      let transferType: OfferTransferType = 'regular_transfer';
      let transferFee = 0;

      if (isFreeAgent) {
        transferType = 'free_agent_direct';
        transferFee = 0;
      } else if (contractYears === 1) {
        transferType = idx % 2 === 0 ? 'last_year_discount' : 'pre_contract_free';
        if (transferType === 'last_year_discount') {
          const mv = calculateRealisticPlayerMarketValue(player).marketValue;
          transferFee = Math.round((mv * 0.60) / 100000) * 100000;
        } else {
          transferFee = 0;
        }
      } else {
        transferType = 'regular_transfer';
        const mv = calculateRealisticPlayerMarketValue(player).marketValue;
        transferFee = Math.round((mv * (0.95 + club.prestigeStars * 0.1)) / 100000) * 100000;
      }

      // Salary & Weekly Wage calculation
      let weeklyWage = 0;
      let yearlySalary = 0;

      if (desire.isSaudi) {
        if (ovr >= 85 || fame >= 300) {
          const eliteScale = Math.pow(1.22, Math.max(0, ovr - 84));
          yearlySalary = Math.round(Math.max(30000000, (28000000 + (ovr - 85) * 12000000) * eliteScale));
        } else if (ovr >= 80) {
          yearlySalary = Math.round(8000000 + (ovr - 80) * 2500000 + fame * 12000);
        } else {
          yearlySalary = Math.round(1500000 + Math.max(0, ovr - 65) * 350000 + fame * 4000);
        }
        weeklyWage = Math.round(yearlySalary / 52);
      } else {
        const mvInfo = calculateRealisticPlayerMarketValue(player);
        const baseWeekly = mvInfo.weeklyWageEstimate;
        const fameWageMult = 0.60 + (clubFameVal / 10) * 0.70;
        const agentWageBonus = 1 + ((agent?.negotiation ?? 20) / 100) * 0.20;
        weeklyWage = Math.max(400, Math.round(baseWeekly * fameWageMult * agentWageBonus));
        yearlySalary = weeklyWage * 52;
      }

      // Universal Negotiated Signing Bonus (5% - 25%)
      const { signingBonus, bonusPercent } = calculateNegotiatedSigningBonus(
        transferType,
        transferFee,
        yearlySalary,
        agent,
        clubFameVal
      );

      // Player fee cut if transfer fee paid
      let playerCutPercent: number | undefined;
      let playerCutAmount: number | undefined;
      if (transferFee > 0) {
        playerCutPercent = 5 + Math.floor(((agent?.negotiation ?? 20) / 100) * 5); // 5% to 10%
        playerCutAmount = Math.round(transferFee * (playerCutPercent / 100));
      }

      const proposedReleaseClause = Math.max(
        8000000,
        Math.round((yearlySalary * 6 + transferFee * 1.5) / 1000000) * 1000000
      );

      const formattedFee =
        transferType === 'free_agent_direct' || transferType === 'pre_contract_free'
          ? 'Free (€0 Transfer Fee)'
          : transferType === 'last_year_discount'
          ? `Discounted (${formatCurrencyEuro(transferFee)})`
          : formatCurrencyEuro(transferFee);

      const squadRole =
        desire.expectedRole === 'Key Player'
          ? 'Key Player'
          : desire.expectedRole === 'Starter'
          ? 'First Team Regular'
          : desire.expectedRole === 'Young Prospect'
          ? 'Young Prospect'
          : 'Rotation';

      const offer: UnifiedClubOffer = {
        id: `offer-${club.id}-${Date.now()}-${idx}`,
        buyerClub: club,
        clubBadgeBg: club.clubBadgeBg || 'from-blue-900 to-slate-950',
        leagueName: club.leagueName,
        countryName: club.countryName,
        countryCode: club.countryCode,
        prestigeStars: club.prestigeStars,
        leagueTier: club.leagueTier,
        isEuropean: club.isEuropean,
        clubFame: clubFameVal,
        developmentTier: devTier.tier,
        developmentTierName: `TIER ${devTier.tier}/5 — ${devTier.name} (${devTier.pointsLabel})`,
        developmentPhilosophy: devSchool.name,
        youthDevelopmentPoints: devTier.annualPoints,
        managerName: club.managerName || 'Head Coach',
        managerNationality: club.managerNationality || club.countryCode,
        managerFormation: club.managerFormation || '4-3-3',
        managerTacticalStyle: club.managerTacticalStyle || 'Attacking Possession',
        expectedPosition: getPositionFullName(pos),
        expectedSubPosition: subPos,
        tacticalRole: getTacticalRoleName(subPos, pos),
        expectedPlaystyle: validPlaystyle,
        squadRole,
        expectedRole: desire.expectedRole,
        initialSquadDestination: desire.proposedSquad,
        proposedSquad: desire.proposedSquad,
        playingTimeExpectation:
          desire.expectedRole === 'Key Player' || desire.expectedRole === 'Starter' ? 'STARTER' : 'FIRST TEAM',
        roleDescription: `Tactical fit in ${club.managerFormation || '4-3-3'} formation under manager ${club.managerName}.`,
        starterOvr: desire.starterOvr,
        starterDiff: desire.starterDiff,
        starterComparisonText: `${subPos} Starter: ${desire.starterOvr} OVR ➔ You: ${ovr} OVR (${desire.starterDiff >= 0 ? '+' : ''}${desire.starterDiff})`,
        transferType,
        transferFee,
        formattedFee,
        weeklyWage,
        yearlySalary,
        contractYears: desire.isSaudi ? 3 : transferType === 'pre_contract_free' ? 4 : 3 + (idx % 2),
        signingBonus,
        signingBonusPercent: bonusPercent,
        playerTransferFeeCutPercent: playerCutPercent,
        playerTransferFeeCutAmount: playerCutAmount,
        releaseClause: proposedReleaseClause,
        curatedReason: desire.curatedReason,
        directive,
        isSaudiMegaOffer: desire.isSaudi,
        isExpiringContractMove: transferType === 'last_year_discount' || transferType === 'pre_contract_free',
        isFreeAgentMove: isFreeAgent,
      };

      // Directive Ranking Scoring
      let directiveScore = desire.desireScore;
      if (directive === 'glory') {
        directiveScore = calculateGloryPrestigeScore(club, desire.starterOvr);
      } else if (directive === 'potential') {
        directiveScore = calculateDevelopmentScore(club, subPos, devTier, squadRole, desire.starterOvr);
      } else if (directive === 'money') {
        directiveScore = calculateMoneyPackageScore(yearlySalary, signingBonus, offer.contractYears, playerCutAmount || 0);
      } else {
        // 'any' / balanced
        directiveScore = desire.desireScore + (interest.interestScore || 0);
      }

      // Priority boost based on fame:
      // At lowest fame (effectiveFame <= 100), domestic 2nd division clubs get absolute first priority!
      const effectiveFame = calculateEffectiveFame(player.fame || 0, agent);
      const isDomestic = isClubDomesticToPlayer(club, player);
      if (effectiveFame <= 100) {
        if (isDomestic && club.leagueTier === 2) {
          directiveScore += 5000; // First priority for domestic 2nd division
        }
      } else if (isDomestic) {
        directiveScore += 300;
      }

      return { offer, directiveScore };
    }
  );

  // Sort by directiveScore descending
  constructedOffers.sort((a, b) => b.directiveScore - a.directiveScore);

  return constructedOffers.slice(0, limit).map((item) => item.offer);
}

/**
 * Generates Unified First Professional Contract Proposals for:
 * - Youth Academy Graduation (Age 16/17+)
 * - Street Discovery First Contract Cards
 * - Early Career Tryouts
 */
export function generateFirstContractUnifiedOffers(
  player: Partial<PlayerCardData>,
  agent?: ManagerState,
  accountingOrLimit?: AccountingState | number,
  limitParam: number = 3
): UnifiedClubOffer[] {
  const limit = typeof accountingOrLimit === 'number' ? accountingOrLimit : limitParam;
  const accounting = typeof accountingOrLimit === 'object' ? accountingOrLimit : undefined;

  const allClubs = getProClubsFromDatabase().filter((c) => !isSpecialClubOfferExcluded(c, player));
  const ovr = player.ovr || 55;
  const pos = (player.position || 'ST').toUpperCase();
  const subPos = resolvePlayerSubPosition(player);
  const rawNat = typeof player.nationality === 'string' ? player.nationality : (player.nationality as any)?.code || (player.nationality as any)?.name || 'ENG';
  const nat = String(rawNat).toUpperCase();

  // Authoritative filter: evaluate every club against the Professional Offer Eligibility Rules
  const eligibleCandidates = allClubs
    .map((club) => {
      const eligibility = evaluateClubNormalOfferEligibility(player, club, agent);
      return { club, eligibility };
    })
    .filter(({ eligibility }) => eligibility.eligible);

  if (eligibleCandidates.length === 0) {
    return [];
  }

  // Prefer clubs in player's nationality or nearby developmental tier clubs
  const sortedClubs = [...eligibleCandidates].sort((a, b) => {
    const aNatMatch = a.club.countryCode.toUpperCase() === nat ? 50 : 0;
    const bNatMatch = b.club.countryCode.toUpperCase() === nat ? 50 : 0;
    const aDiff = Math.abs(ovr - estimateClubStarterOvr(a.club, subPos));
    const bDiff = Math.abs(ovr - estimateClubStarterOvr(b.club, subPos));
    return (bNatMatch - bDiff) - (aNatMatch - aDiff);
  });

  const candidatePicks = sortedClubs.slice(0, Math.min(10, sortedClubs.length));
  const selectedPicks = [...candidatePicks].sort(() => 0.5 - Math.random()).slice(0, limit);

  return selectedPicks.map(({ club, eligibility }, idx) => {
    const clubFameVal = typeof club.clubFame === 'number' ? club.clubFame : club.prestigeStars * 2;
    const devTier = getClubDevelopmentTier(club.clubName, club.leagueName, club.countryName, clubFameVal);
    const devSchool = getFootballSchoolForClub(club.clubName, club.leagueName, '', club.countryName);

    const starterOvr = estimateClubStarterOvr(club, subPos);
    const starterDiff = ovr - starterOvr;

    const baseWeekly = Math.max(350, Math.round(500 + ovr * 20 + clubFameVal * 50));
    const weeklyWage = baseWeekly;
    const yearlySalary = weeklyWage * 52;

    const { signingBonus, bonusPercent } = calculateNegotiatedSigningBonus(
      'first_contract',
      0,
      yearlySalary,
      agent,
      clubFameVal
    );

    const rawStyle = club.preferredPlaystyles?.[subPos] || club.preferredPlaystyles?.[pos] || player.playStyle || 'Balanced';
    const validPlaystyle = resolveProTacticalPlaystyle(subPos, rawStyle);

    return {
      id: `first-contract-${club.id}-${Date.now()}-${idx}`,
      buyerClub: club,
      clubBadgeBg: club.clubBadgeBg || 'from-blue-900 to-slate-950',
      leagueName: club.leagueName,
      countryName: club.countryName,
      countryCode: club.countryCode,
      prestigeStars: club.prestigeStars,
      leagueTier: club.leagueTier,
      isEuropean: club.isEuropean,
      clubFame: clubFameVal,
      developmentTier: devTier.tier,
      developmentTierName: `TIER ${devTier.tier}/5 — ${devTier.name} (${devTier.pointsLabel})`,
      developmentPhilosophy: devSchool.name,
      youthDevelopmentPoints: devTier.annualPoints,
      managerName: club.managerName || 'Head Coach',
      managerNationality: club.managerNationality || club.countryCode,
      managerFormation: club.managerFormation || '4-3-3',
      managerTacticalStyle: club.managerTacticalStyle || 'Attacking',
      expectedPosition: getPositionFullName(pos),
      expectedSubPosition: subPos,
      tacticalRole: getTacticalRoleName(subPos, pos),
      expectedPlaystyle: validPlaystyle,
      squadRole: starterDiff >= 0 ? 'First Team Regular' : 'Young Prospect',
      expectedRole: starterDiff >= 0 ? 'Starter' : 'Young Prospect',
      initialSquadDestination: starterDiff >= 0 ? 'First Team' : 'Reserves',
      proposedSquad: starterDiff >= 0 ? 'First Team' : 'Reserves',
      playingTimeExpectation: starterDiff >= 0 ? 'STARTER' : 'FIRST TEAM',
      roleDescription: `First professional contract graduation into ${club.clubName}.`,
      starterOvr,
      starterDiff,
      starterComparisonText: `${subPos} Starter: ${starterOvr} OVR ➔ You: ${ovr} OVR (${starterDiff >= 0 ? '+' : ''}${starterDiff})`,
      transferType: 'first_contract',
      transferFee: 0,
      formattedFee: 'First Contract (€0)',
      weeklyWage,
      yearlySalary,
      contractYears: 3,
      signingBonus,
      signingBonusPercent: bonusPercent,
      releaseClause: Math.max(3000000, Math.round((yearlySalary * 6) / 500000) * 500000),
      curatedReason: eligibility.isCareerRestart && eligibility.reason
        ? `${eligibility.reason} ⭐ First professional terms offered.`
        : `⭐ First professional terms offered following academy graduation / scouting evaluation.`,
      directive: 'unsolicited',
      isFreeAgentMove: true,
      isCareerRestartEvent: eligibility.isCareerRestart,
      eligibilityNote: eligibility.reason,
    };
  });
}

/**
 * Generates a club renewal offer from the player's current professional club
 * when the club desires to retain the player as a valuable asset.
 */
export function generateClubRenewalOffer(
  player: Partial<PlayerCardData> & { contractYearsRemaining?: number; squadRole?: string; squadDestination?: string },
  accounting?: AccountingState,
  manager?: ManagerState
): UnifiedClubOffer | null {
  const currentClubName = player.club;
  if (!currentClubName || currentClubName === 'Free Agent' || currentClubName.toLowerCase().includes('youth') || currentClubName.toLowerCase().includes('street')) {
    return null;
  }

  const allClubs = getProClubsFromDatabase();
  const currentClean = cleanTeamName(currentClubName);
  let clubDef = allClubs.find(
    (c) => cleanTeamName(c.clubName) === currentClean || c.clubName.toLowerCase() === currentClubName.toLowerCase()
  );

  const authContext = resolveAuthoritativeClubContext(currentClubName);
  if (!clubDef) {
    clubDef = {
      id: authContext.clubId || 'current_club',
      clubName: authContext.club || currentClubName,
      clubBadgeBg: 'from-blue-900 to-slate-950',
      countryName: authContext.clubCountry || 'England',
      countryCode: authContext.countryCode || 'ENG',
      leagueName: authContext.league || 'Premier League',
      leagueTier: authContext.leagueTier || 1,
      isEuropean: true,
      positionalLevels: { ATT: 78, MID: 77, DEF: 76, GK: 76 },
      positionalNeeds: { ATT: 'BALANCED', MID: 'BALANCED', DEF: 'BALANCED', GK: 'BALANCED' },
      prestigeStars: authContext.leagueTier === 1 ? 4 : 3,
      clubFame: authContext.leagueTier === 1 ? 7 : 4,
      managerName: 'Head Coach',
      managerNationality: authContext.countryCode || 'ENG',
      managerTacticalStyle: 'Attacking Possession',
      managerFormation: '4-3-3',
      preferredPlaystyles: {},
    };
  }

  const ovr = player.ovr || 65;
  const potential = player.potentialOvr || 78;
  const age = player.age || 20;
  const pos = (player.position || 'ST').toUpperCase();
  const subPos = resolvePlayerSubPosition(player);
  const starterOvr = estimateClubStarterOvr(clubDef, subPos);
  const starterDiff = ovr - starterOvr;

  // Evaluate retention desire:
  // Is player starting caliber or high potential asset?
  const isStarter = starterDiff >= -2 || ovr >= 72;
  const isHighPotentialAsset = age <= 23 && potential >= starterOvr;
  const isKeyPlayer = starterDiff >= 2 || ovr >= 80;

  if (!isStarter && !isHighPotentialAsset && starterDiff < -6) {
    // Club does not prioritize retention of player far below squad standard
    return null;
  }

  const devTier = getClubDevelopmentTier(clubDef.clubName, clubDef.leagueName, clubDef.countryName, clubDef.clubFame || clubDef.prestigeStars * 2);
  const devSchool = getFootballSchoolForClub(clubDef.clubName, clubDef.leagueName, '', clubDef.countryName);

  // Financial raise & extension terms
  const currentSalary = accounting?.yearlySalary || 50000;
  const realisticMv = calculateRealisticPlayerMarketValue(player);
  const baseWeekly = realisticMv.weeklyWageEstimate;

  const agentSkill = manager?.negotiation ?? 25;
  const retentionRaiseMultiplier = isKeyPlayer ? 1.35 : isStarter ? 1.25 : 1.15;
  const agentBoost = 1 + (agentSkill / 100) * 0.15;

  const targetWeekly = Math.max(
    Math.round((currentSalary / 52) * retentionRaiseMultiplier),
    Math.round(baseWeekly * retentionRaiseMultiplier * agentBoost),
    500
  );
  const yearlySalary = targetWeekly * 52;
  const weeklyWage = targetWeekly;

  const contractYears = isKeyPlayer || isHighPotentialAsset ? 4 : 3;
  const loyaltyBonusPercent = 12 + Math.floor((agentSkill / 100) * 8); // 12% - 20%
  const signingBonus = Math.round(yearlySalary * (loyaltyBonusPercent / 100));

  const releaseClause = Math.max(
    15000000,
    Math.round((yearlySalary * 7 + (realisticMv.marketValue || 5000000) * 1.6) / 1000000) * 1000000
  );

  const rawStyle = clubDef.preferredPlaystyles?.[subPos] || clubDef.preferredPlaystyles?.[pos] || player.playStyle || 'Balanced';
  const validPlaystyle = resolveProTacticalPlaystyle(subPos, rawStyle);

  let squadRole: 'Key Player' | 'First Team Regular' | 'Rotation' | 'Young Prospect' = isKeyPlayer
    ? 'Key Player'
    : isStarter
    ? 'First Team Regular'
    : isHighPotentialAsset
    ? 'Young Prospect'
    : 'Rotation';

  let expectedRole: 'Starter' | 'Rotation Player' | 'Key Player' | 'Young Prospect' = isKeyPlayer
    ? 'Key Player'
    : isStarter
    ? 'Starter'
    : 'Rotation Player';

  const retentionText = isKeyPlayer
    ? `💎 Indispensable Cornerstone: Club hierarchy considers you central to future trophy ambitions. Massive salary bump & +${contractYears} year extension offered.`
    : isStarter
    ? `⭐ First Team Regular: Vital matchday starter with continuous tactical trust from manager ${clubDef.managerName}.`
    : isHighPotentialAsset
    ? `🌱 Strategic Youth Asset: Club values your high ceiling (${potential} POT) and offers long-term commitment.`
    : `🤝 Squad Extension: Management seeks depth continuity for upcoming domestic and cup campaigns.`;

  return {
    id: `renewal-${clubDef.id}-${Date.now()}`,
    buyerClub: clubDef,
    clubBadgeBg: clubDef.clubBadgeBg || 'from-blue-900 to-slate-950',
    leagueName: clubDef.leagueName,
    countryName: clubDef.countryName,
    countryCode: clubDef.countryCode,
    prestigeStars: clubDef.prestigeStars,
    leagueTier: clubDef.leagueTier,
    isEuropean: clubDef.isEuropean,
    clubFame: clubDef.clubFame ?? clubDef.prestigeStars * 2,
    developmentTier: devTier.tier,
    developmentTierName: `TIER ${devTier.tier}/5 — ${devTier.name} (${devTier.pointsLabel})`,
    developmentPhilosophy: devSchool.name,
    youthDevelopmentPoints: devTier.annualPoints,
    managerName: clubDef.managerName || 'Head Coach',
    managerNationality: clubDef.managerNationality || clubDef.countryCode,
    managerFormation: clubDef.managerFormation || '4-3-3',
    managerTacticalStyle: clubDef.managerTacticalStyle || 'Attacking',
    expectedPosition: getPositionFullName(pos),
    expectedSubPosition: subPos,
    tacticalRole: getTacticalRoleName(subPos, pos),
    expectedPlaystyle: validPlaystyle,
    squadRole,
    expectedRole,
    initialSquadDestination: 'First Team',
    proposedSquad: 'First Team',
    playingTimeExpectation: isKeyPlayer || isStarter ? 'STARTER' : 'FIRST TEAM',
    roleDescription: `Core contributor in ${clubDef.managerFormation || '4-3-3'} formation under manager ${clubDef.managerName}.`,
    starterOvr,
    starterDiff,
    starterComparisonText: `${subPos} Starter: ${starterOvr} OVR ➔ You: ${ovr} OVR (${starterDiff >= 0 ? '+' : ''}${starterDiff})`,
    transferType: 'club_renewal',
    transferFee: 0,
    formattedFee: 'Contract Renewal (Extension)',
    weeklyWage,
    yearlySalary,
    contractYears,
    signingBonus,
    signingBonusPercent: loyaltyBonusPercent,
    releaseClause,
    curatedReason: retentionText,
    directive: 'renewal',
    isRenewalOffer: true,
    clubRetentionDesireText: retentionText,
    loyaltyBonus: signingBonus,
  };
}

/**
 * Proactively generates a curated bundle of season offers:
 * - A Club Renewal offer (if player is valuable to current club)
 * - 2 to 4 competitive Transfer / Pre-contract offers based on player desirability and market status
 */
export function generateProactiveSeasonOffers(
  player: Partial<PlayerCardData> & { contractYearsRemaining?: number; squadRole?: string },
  accounting?: AccountingState,
  manager?: ManagerState
): UnifiedClubOffer[] {
  // Youth Academy players under 17 develop in youth leagues and cannot receive senior professional transfer offers
  if ((player.age || 10) < 17 || !isProfessionalPlayer(player) || (player.club || '').toLowerCase().includes('youth')) {
    return [];
  }

  const isFreeAgent = Boolean(
    player.isFreeAgent ||
    player.club === 'Free Agent' ||
    ((player as any).accounting?.contractYears ?? accounting?.contractYears ?? 3) <= 0
  );

  const offers: UnifiedClubOffer[] = [];

  // 1. If currently signed to a club, check if current club desires to renew
  if (!isFreeAgent && player.club && !player.club.toLowerCase().includes('youth')) {
    const renewal = generateClubRenewalOffer(player, accounting, manager);
    if (renewal) {
      offers.push(renewal);
    }
  }

  // 2. Generate proactive transfer / market offers based on player desirability
  const marketOffers = generateCuratedClubOffers(player, 'any', manager, accounting, 4);
  offers.push(...marketOffers);

  return offers;
}

/**
 * Runs Tryout for a Free Agent in a specific selected League
 */
export function runLeagueTryoutEvaluation(
  player: Partial<PlayerCardData>,
  leagueName: string,
  agent?: ManagerState
): {
  isSuccess: boolean;
  successRate: number;
  offers: UnifiedClubOffer[];
  message: string;
} {
  const allClubs = getProClubsFromDatabase().filter((c) => !isSpecialClubOfferExcluded(c, player));
  const matchingClubs = allClubs.filter(
    (c) => c.leagueName.toLowerCase().includes(leagueName.toLowerCase()) ||
           c.countryName.toLowerCase().includes(leagueName.toLowerCase())
  );

  const pool = matchingClubs.length > 0 ? matchingClubs : allClubs;
  const ovr = player.ovr || 60;
  const fame = player.fame || 0;
  const pos = (player.position || 'ST').toUpperCase();
  const subPos = resolvePlayerSubPosition(player);

  const avgStarterOvr = Math.round(
    pool.reduce((sum, c) => sum + estimateClubStarterOvr(c, subPos), 0) / pool.length
  );

  // Success rate formula:
  // Base 50% + 5% for each OVR point vs avg starter + Fame bonus + Agent network bonus
  const ovrDiff = ovr - avgStarterOvr;
  const agentNetwork = agent?.network ?? 20;
  const fameBonus = Math.min(20, Math.floor(fame / 20));
  const networkBonus = Math.floor((agentNetwork / 100) * 15);

  let successRate = Math.min(95, Math.max(15, 50 + ovrDiff * 6 + fameBonus + networkBonus));

  const roll = Math.random() * 100;
  const isSuccess = roll <= successRate;

  if (!isSuccess) {
    return {
      isSuccess: false,
      successRate,
      offers: [],
      message: `Tryout scout report in ${leagueName}: Evaluators noted raw talent, but clubs opted not to offer a contract this window. Keep training!`,
    };
  }

  // Generate 1 to 3 contract offers from clubs in this league
  const candidatePicks = [...pool].sort(() => 0.5 - Math.random()).slice(0, Math.min(3, pool.length));

  const offers: UnifiedClubOffer[] = candidatePicks.map((club, idx) => {
    const starterOvr = estimateClubStarterOvr(club, subPos);
    const starterDiff = ovr - starterOvr;
    const clubFameVal = typeof club.clubFame === 'number' ? club.clubFame : club.prestigeStars * 2;
    const devTier = getClubDevelopmentTier(club.clubName, club.leagueName, club.countryName, clubFameVal);
    const devSchool = getFootballSchoolForClub(club.clubName, club.leagueName, '', club.countryName);

    const mvInfo = calculateRealisticPlayerMarketValue(player);
    const baseWeekly = mvInfo.weeklyWageEstimate;
    const weeklyWage = Math.max(350, Math.round(baseWeekly * (0.65 + (clubFameVal / 10) * 0.5)));
    const yearlySalary = weeklyWage * 52;

    const { signingBonus, bonusPercent } = calculateNegotiatedSigningBonus(
      'tryout_contract',
      0,
      yearlySalary,
      agent,
      clubFameVal
    );

    const rawStyle = club.preferredPlaystyles?.[subPos] || club.preferredPlaystyles?.[pos] || player.playStyle || 'Balanced';
    const validPlaystyle = resolveProTacticalPlaystyle(subPos, rawStyle);

    return {
      id: `tryout-offer-${club.id}-${Date.now()}-${idx}`,
      buyerClub: club,
      clubBadgeBg: club.clubBadgeBg || 'from-blue-900 to-slate-950',
      leagueName: club.leagueName,
      countryName: club.countryName,
      countryCode: club.countryCode,
      prestigeStars: club.prestigeStars,
      leagueTier: club.leagueTier,
      isEuropean: club.isEuropean,
      clubFame: clubFameVal,
      developmentTier: devTier.tier,
      developmentTierName: `TIER ${devTier.tier}/5 — ${devTier.name} (${devTier.pointsLabel})`,
      developmentPhilosophy: devSchool.name,
      youthDevelopmentPoints: devTier.annualPoints,
      managerName: club.managerName || 'Head Coach',
      managerNationality: club.managerNationality || club.countryCode,
      managerFormation: club.managerFormation || '4-3-3',
      managerTacticalStyle: club.managerTacticalStyle || 'Attacking',
      expectedPosition: getPositionFullName(pos),
      expectedSubPosition: subPos,
      tacticalRole: getTacticalRoleName(subPos, pos),
      expectedPlaystyle: validPlaystyle,
      squadRole: starterDiff >= 2 ? 'First Team Regular' : 'Rotation',
      expectedRole: starterDiff >= 2 ? 'Starter' : 'Rotation Player',
      initialSquadDestination: starterDiff >= 0 ? 'First Team' : 'Reserves',
      playingTimeExpectation: starterDiff >= 2 ? 'STARTER' : 'FIRST TEAM',
      roleDescription: `Tryout signing under manager ${club.managerName}.`,
      starterOvr,
      starterDiff,
      starterComparisonText: `${subPos} Starter: ${starterOvr} OVR ➔ You: ${ovr} OVR (${starterDiff >= 0 ? '+' : ''}${starterDiff})`,
      transferType: 'tryout_contract',
      transferFee: 0,
      formattedFee: 'Free (€0 Tryout Sign-on)',
      weeklyWage,
      yearlySalary,
      contractYears: 2 + (idx % 2),
      signingBonus,
      signingBonusPercent: bonusPercent,
      releaseClause: Math.max(5000000, Math.round((yearlySalary * 5) / 1000000) * 1000000),
      curatedReason: `⭐ Impressed coaching staff during open tryouts in ${leagueName}.`,
      directive: 'tryout',
      isFreeAgentMove: true,
    };
  });

  return {
    isSuccess: true,
    successRate,
    offers,
    message: `🎉 TRYOUT SUCCESS! ${offers.length} club(s) in ${leagueName} have offered you a professional contract!`,
  };
}
