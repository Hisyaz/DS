import {
  PlayerCardData,
  AccountingState,
  ManagerState,
  AgentState,
  AgentType,
  AgentTier,
  ShadyProposition,
  ShadyDealObjective,
  SponsorItem,
} from '../types';
import { drawUniqueCareerCategoryCards } from './storeCollectionSystem';
import { calculatePlayerMarketValue, formatEuroCurrency, getSellingClubImportance } from './transferMarketSystem';
import { PRO_CLUBS_DATABASE, ProClubDefinition } from './earlyCareerSystem';
import { YOUTH_LEAGUES_DATABASE, YouthTeamData } from '../data/youthLeaguesDatabase';
import { SPONSOR_CARDS_POOL } from './careerCardSystem';
import {
  evaluateClubInterest,
  getClubCompetitiveTier,
  CLUB_COMPETITIVE_TIERS,
  ClubCompetitiveTierNumber,
  ClubTierInfo,
  ClubInterestEvaluation,
  resolvePlayerSubPosition,
} from './clubRankingSystem';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';
import { EditorTeamData } from '../types/leagueEditor';
import {
  isPositionCompatibleForPlayer,
  getDefaultPlayStyleForSubPos,
  ensurePlayerPositions,
} from './positionMasterySystem';
import { isProfessionalPlayer, isAdvancedPosition } from './playerIdentitySystem';

// ========================================================================
// 1. STATS, EFFECTIVE FAME & DISCOVERY SYSTEM
// ========================================================================

/**
 * Checks if the player currently has an active, valid agent representation.
 */
export function hasActiveAgent(
  player?: PlayerCardData | null,
  manager?: ManagerState | null
): boolean {
  const checkName = (name?: string | null): boolean => {
    if (!name) return false;
    const trimmed = name.trim();
    if (!trimmed) return false;
    const lower = trimmed.toLowerCase();
    if (
      lower === 'unassigned' ||
      lower === 'null' ||
      lower === 'undefined' ||
      lower === 'none' ||
      lower === 'no agent'
    ) {
      return false;
    }
    if (
      lower.includes('no current') ||
      lower.includes('self-managed') ||
      lower.includes('unrepresented')
    ) {
      return false;
    }
    return true;
  };

  if (manager && checkName(manager.name)) return true;
  if (player?.managerState && checkName(player.managerState.name)) return true;
  if (player?.managerName && checkName(player.managerName)) return true;

  return false;
}

/**
 * Base skill used when no agent represents the player.
 */
export const BASE_NO_AGENT_SKILL = 20;

export function getAgentNegotiationSkill(agent?: AgentState | null): number {
  if (!agent || !agent.name || agent.name.includes('No current') || agent.name.includes('Self-Managed')) {
    return BASE_NO_AGENT_SKILL;
  }
  return agent.negotiation ?? BASE_NO_AGENT_SKILL;
}

export function getAgentNetworkSkill(agent?: AgentState | null): number {
  if (!agent || !agent.name || agent.name.includes('No current') || agent.name.includes('Self-Managed')) {
    return BASE_NO_AGENT_SKILL;
  }
  return agent.network ?? BASE_NO_AGENT_SKILL;
}

export function getAgentMarketingSkill(agent?: AgentState | null): number {
  if (!agent || !agent.name || agent.name.includes('No current') || agent.name.includes('Self-Managed')) {
    return BASE_NO_AGENT_SKILL;
  }
  return agent.marketing ?? BASE_NO_AGENT_SKILL;
}

/**
 * Agent Network Fame: Agent Networking skill mapped onto a 0–500 scale.
 */
export function calculateAgentNetworkFame(agent?: AgentState | null): number {
  const network = getAgentNetworkSkill(agent);
  return network * 5; // 0–100 * 5 = 0–500
}

/**
 * Effective Fame = (Player Fame / 2) + (Agent Network Fame / 2)
 */
export function calculateEffectiveFame(playerFame: number, agent?: AgentState | null): number {
  const agentNetworkFame = calculateAgentNetworkFame(agent);
  return Math.round((Math.max(0, playerFame) / 2) + (agentNetworkFame / 2));
}

/**
 * Club Visibility Thresholds based on Effective Fame:
 * Fame 10+: 2nd division clubs from player's country
 * Fame 100+: 2nd division clubs from other countries, Argentina 1st div, Brazil 1st div
 * Fame 200+: 1st division clubs from Portugal, France, Germany, Italy (except giants: PSG, Inter, Juventus, AC Milan, Napoli, Bayern Munich, Borussia Dortmund)
 * Fame 300+: England, Spain (except Real Madrid, Barcelona). Unlocks Juventus, AC Milan, Borussia Dortmund, Saudi / Arabian league
 * Fame 400+: All clubs
 * Fame 500+: Real Madrid & Barcelona actively pursue if player OVR > 90
 */
export function getVisibleClubsByFame(effectiveFame: number, playerCountry?: string): ProClubDefinition[] {
  const normCountry = (playerCountry || '').toLowerCase();

  const giantsList = [
    'paris saint-germain', 'psg', 'inter', 'internazionale', 'juventus',
    'ac milan', 'milan', 'napoli', 'bayern munich', 'bayern münchen',
    'borussia dortmund', 'dortmund', 'real madrid', 'fc barcelona', 'barcelona',
  ];

  return PRO_CLUBS_DATABASE.filter((club) => {
    const clubNameLower = club.clubName.toLowerCase();
    const clubCountryLower = club.countryName.toLowerCase();
    const isDomestic = normCountry ? clubCountryLower.includes(normCountry) : true;
    const isTier2 = club.leagueTier === 2 || club.leagueName.toLowerCase().includes('second') || club.leagueName.toLowerCase().includes('division 2') || club.leagueName.toLowerCase().includes('championship');
    const isTier1 = !isTier2 && club.leagueTier === 1;

    // Fame 500+
    if (effectiveFame >= 500) return true;

    // Fame 400+: All clubs
    if (effectiveFame >= 400) return true;

    // Fame 300+: England, Spain (except Real Madrid, Barcelona), plus Juventus, Milan, Dortmund, Saudi
    if (effectiveFame >= 300) {
      if (clubNameLower.includes('real madrid') || clubNameLower.includes('barcelona')) return false;
      if (clubCountryLower.includes('england') || clubCountryLower.includes('spain')) return true;
      if (clubCountryLower.includes('saudi') || club.leagueName.toLowerCase().includes('saudi')) return true;
      if (clubNameLower.includes('juventus') || clubNameLower.includes('milan') || clubNameLower.includes('dortmund')) return true;
      if (clubCountryLower.includes('portugal') || clubCountryLower.includes('france') || clubCountryLower.includes('germany') || clubCountryLower.includes('italy')) return true;
      if (clubCountryLower.includes('brazil') || clubCountryLower.includes('argentina')) return true;
      if (isTier2) return true;
    }

    // Fame 200+: 1st division Portugal, France, Germany, Italy (except giants)
    if (effectiveFame >= 200) {
      if (giantsList.some((g) => clubNameLower.includes(g))) return false;
      if (['portugal', 'france', 'germany', 'italy'].some((c) => clubCountryLower.includes(c)) && isTier1) return true;
      if (clubCountryLower.includes('brazil') || clubCountryLower.includes('argentina')) return true;
      if (isTier2) return true;
    }

    // Fame 100+: 2nd division other countries, Argentina 1st div, Brazil 1st div
    if (effectiveFame >= 100) {
      if (isTier2) return true;
      if (clubCountryLower.includes('argentina') || clubCountryLower.includes('brazil')) return true;
      if (isDomestic && isTier2) return true;
    }

    // Fame 10+: 2nd division clubs from player's country
    if (effectiveFame >= 10) {
      if (isDomestic && isTier2) return true;
      if (isDomestic && club.prestigeStars <= 3) return true;
    }

    return false;
  });
}

/**
 * Club Discovery Evaluation:
 * Evaluates OVR, Position, Sub-Position, Playstyle, and Tactical fit.
 */
export function evaluateClubDiscovery(
  club: ProClubDefinition,
  player: PlayerCardData
): {
  isCompatible: boolean;
  priorityRole: 'Starter' | 'Rotation' | 'Prospect' | 'Incompatible';
  tacticalVerdict: string;
} {
  const ovr = player.ovr || 50;
  const isSuperstar = ovr > 90;

  // Rule: If player OVR > 90, club wants the player regardless of tactical fit and will adapt tactics.
  if (isSuperstar) {
    return {
      isCompatible: true,
      priorityRole: 'Starter',
      tacticalVerdict: `World-class superstar (${ovr} OVR). ${club.clubName} is willing to restructure entire tactical formation to build around player.`,
    };
  }

  const starterOvrBenchmark = club.leagueTier === 1 ? 74 + Math.round(club.prestigeStars * 2) : 64 + Math.round(club.prestigeStars * 1.5);
  const isStarterReady = ovr >= starterOvrBenchmark;
  const isRotationReady = ovr >= starterOvrBenchmark - 6;

  if (isStarterReady) {
    return {
      isCompatible: true,
      priorityRole: 'Starter',
      tacticalVerdict: `Exceeds current starter quality (${ovr} vs ~${starterOvrBenchmark} OVR). Pursued as direct First Team starter.`,
    };
  }

  if (isRotationReady) {
    return {
      isCompatible: true,
      priorityRole: 'Rotation',
      tacticalVerdict: `High potential depth option with rotation minutes opportunities.`,
    };
  }

  return {
    isCompatible: false,
    priorityRole: 'Incompatible',
    tacticalVerdict: `Currently does not meet minimum technical benchmark for ${club.clubName}.`,
  };
}

// ========================================================================
// 2. CONTRACT RENEWAL & NEGOTIATION ENGINE
// ========================================================================

export interface ContractRenewalResult {
  isSuccess: boolean;
  successProbability: number;
  oldWeeklyWage: number;
  newWeeklyWage: number;
  oldYearlySalary: number;
  newYearlySalary: number;
  oldContractYears: number;
  newContractYears: number;
  signingBonus: number;
  percentageIncrease: number;
  newReleaseClause?: number;
  managerPitchText: string;
  clubResponseText: string;
  rejectionReason?: string;
  statusBreakdown: {
    importance: string;
    contractUrgency: string;
    negotiationSkillBonus: string;
    potentialBonus: string;
  };
}

export interface ReleaseClauseNegotiationResult {
  outcome: 'accepted' | 'counter_offer' | 'rejected';
  requestedAmount: number;
  agreedAmount: number;
  headline: string;
  narrative: string;
}

export function negotiateReleaseClause(
  player: PlayerCardData,
  requestedAmount: number,
  accounting?: AccountingState,
  agent?: AgentState
): ReleaseClauseNegotiationResult {
  const negotiation = getAgentNegotiationSkill(agent);
  const mv = calculatePlayerMarketValue(player).marketValue;

  // If requested amount is below market value, club resists strongly
  if (requestedAmount < mv * 0.9) {
    if (negotiation >= 80) {
      const compromise = Math.round((mv * 1.25) / 1000000) * 1000000;
      return {
        outcome: 'counter_offer',
        requestedAmount,
        agreedAmount: compromise,
        headline: 'BOARD COUNTER-OFFER: Realistic Valuation Demanded',
        narrative: `${player.club || 'The club'} refused an under-market release clause of €${(requestedAmount / 1000000).toFixed(1)}M, but your agent's negotiation rating (${negotiation}/100) secured a compromise buyout clause of €${(compromise / 1000000).toFixed(1)}M.`,
      };
    }
    return {
      outcome: 'rejected',
      requestedAmount,
      agreedAmount: accounting?.releaseClause || 0,
      headline: 'CLAUSE REJECTED: Value Too Low',
      narrative: `${player.club || 'The club'} flatly rejected setting a buyout clause below your current transfer market value (€${(mv / 1000000).toFixed(1)}M).`,
    };
  }

  const prob = Math.min(95, Math.max(25, 45 + Math.round(negotiation * 0.50)));
  const roll = Math.random() * 100;

  if (roll <= prob) {
    return {
      outcome: 'accepted',
      requestedAmount,
      agreedAmount: requestedAmount,
      headline: 'RELEASE CLAUSE ACCEPTED! ✍️',
      narrative: `The board agreed to insert a binding buyout clause of €${(requestedAmount / 1000000).toFixed(1)}M into your contract. Any interested club matching this fee can bypass board permission.`,
    };
  } else {
    const counter = Math.round((requestedAmount * 1.30) / 1000000) * 1000000;
    return {
      outcome: 'counter_offer',
      requestedAmount,
      agreedAmount: counter,
      headline: 'BOARD COUNTER-OFFER: Higher Clause Required',
      narrative: `${player.club || 'The club'} demands greater contractual protection and countered with a buyout fee of €${(counter / 1000000).toFixed(1)}M.`,
    };
  }
}

export function calculateContractRenewal(
  player: PlayerCardData,
  accounting?: AccountingState,
  agent?: AgentState
): ContractRenewalResult {
  const negotiation = getAgentNegotiationSkill(agent);
  const ovr = player.ovr || 65;
  const potential = player.potentialOvr || 78;
  const isFreeAgent = player.isFreeAgent || (accounting?.contractYears !== undefined && accounting.contractYears <= 0);
  const currentContractYears = isFreeAgent ? 0 : (accounting?.contractYears ?? 3);
  const currentSalary = isFreeAgent ? 0 : (accounting?.yearlySalary || 150000);
  const currentWeeklyWage = Math.round(currentSalary / 52);

  const { importance, multiplier: importanceMultiplier } = getSellingClubImportance(player);

  let contractUrgencyScore = 0;
  let contractUrgencyLabel = 'Normal (2 Years Left)';

  if (isFreeAgent) {
    contractUrgencyScore = 30;
    contractUrgencyLabel = 'Free Agent (Unattached: Direct Signing)';
  } else if (currentContractYears <= 1) {
    contractUrgencyScore = 20;
    contractUrgencyLabel = 'High Urgency (≤1 Year Left: Risk of Free Exit)';
  } else if (currentContractYears === 2) {
    contractUrgencyScore = 6;
    contractUrgencyLabel = 'Moderate Urgency (2 Years Remaining)';
  } else {
    contractUrgencyScore = -12;
    contractUrgencyLabel = 'Low Urgency (3+ Years Left on Contract)';
  }

  const importanceBonus = (importanceMultiplier - 1.0) * 15;
  const potentialBonus = potential >= 90 ? 8 : potential >= 84 ? 4 : 0;

  // Direct Probability Calculation from Negotiation skill
  const baseSuccessProb = isFreeAgent
    ? Math.min(98, 70 + negotiation * 0.3)
    : (negotiation * 0.75) + contractUrgencyScore + importanceBonus + potentialBonus;
  const successProbability = Math.min(96, Math.max(8, Math.round(baseSuccessProb)));

  // Roll
  const roll = Math.random() * 100;
  const isSuccess = roll <= successProbability;

  const baseRaisePercent = 0.15 + (negotiation / 100) * 0.35 + (importanceMultiplier - 0.9) * 0.20;
  const finalRaisePercent = Math.min(1.10, Math.max(0.12, baseRaisePercent));

  const targetOvrSalary = Math.round(Math.pow(1.13, ovr - 45) * 65000);
  const benchmarkSalary = Math.max(currentSalary, targetOvrSalary);
  let newYearlySalary = Math.round((benchmarkSalary * (1 + (isFreeAgent ? 0 : finalRaisePercent))) / 1000) * 1000;
  let signingBonus = Math.round(newYearlySalary * (isFreeAgent ? 0.25 : (0.08 + (negotiation / 100) * 0.12)));

  const isMercenary =
    Boolean(player.activePerkIds?.includes('mercenary')) ||
    (Array.isArray((player as any).perks) && (player as any).perks.includes('mercenary'));

  if (isMercenary) {
    newYearlySalary = Math.round(newYearlySalary * 1.20);
    signingBonus = Math.round(signingBonus * 1.20);
  }

  const newWeeklyWage = Math.round(newYearlySalary / 52);
  const newContractYears = isFreeAgent ? 3 : (currentContractYears <= 1 ? 4 : Math.min(5, currentContractYears + 2));
  const percentageIncrease = currentSalary > 0 ? Math.round(((newYearlySalary - currentSalary) / currentSalary) * 100) : 100;

  // Compute calculated new release clause based on player market value & salary
  const { marketValue } = calculatePlayerMarketValue(player);
  const calculatedReleaseClause = Math.max(5000000, Math.round((marketValue * 1.6) / 1000000) * 1000000);

  const agentName = agent?.name && !agent.name.includes('No current') ? agent.name : 'Your Representative';
  let managerPitch = `${agentName} entered boardroom negotiations highlighting your ${ovr} OVR, status as a ${importance}, and market valuation to command top-tier compensation.`;
  let clubResponse = '';
  let rejectionReason = '';

  if (isSuccess) {
    if (isFreeAgent) {
      clubResponse = `Contract terms finalized! The club signed you as a Free Agent on a ${newContractYears}-year contract with a €${signingBonus.toLocaleString()} signing bonus.`;
    } else if (currentContractYears <= 1) {
      clubResponse = `The board acknowledged the urgency of your expiring contract and moved quickly to secure your long-term future, offering a lucrative ${percentageIncrease}% wage upgrade.`;
    } else if (importanceMultiplier >= 1.6) {
      clubResponse = `The club recognizes you as an indispensable ${importance} and finalized an extended ${newContractYears}-year deal with a €${signingBonus.toLocaleString()} signing bonus.`;
    } else {
      clubResponse = `After rigorous back-and-forth negotiations driven by ${agentName}'s ${negotiation}/100 negotiation rating, the club accepted the new terms.`;
    }
  } else {
    if (currentContractYears >= 3) {
      rejectionReason = `The board declined renegotiations, stating that with ${currentContractYears} years remaining on your current contract, there is no immediate financial justification for a wage restructuring.`;
    } else if (importanceMultiplier < 1.1) {
      rejectionReason = `The sporting director felt your current squad impact (${importance}) does not yet warrant a substantial salary increase. Improve your match rating and OVR first.`;
    } else {
      rejectionReason = `Negotiations stalled due to wage structure constraints (${negotiation}/100 negotiation rating was insufficient to force boardroom compromise).`;
    }
    clubResponse = rejectionReason;
  }

  return {
    isSuccess,
    successProbability,
    oldWeeklyWage: currentWeeklyWage,
    newWeeklyWage,
    oldYearlySalary: currentSalary,
    newYearlySalary,
    oldContractYears: currentContractYears,
    newContractYears,
    signingBonus,
    percentageIncrease,
    newReleaseClause: calculatedReleaseClause,
    managerPitchText: managerPitch,
    clubResponseText: clubResponse,
    rejectionReason,
    statusBreakdown: {
      importance: `${importance} (${importanceMultiplier.toFixed(1)}x leverage)`,
      contractUrgency: contractUrgencyLabel,
      negotiationSkillBonus: `+${negotiation}% from Agent (${negotiation}/100)`,
      potentialBonus: potential >= 90 ? `+${potentialBonus}% World-Class Potential` : 'Standard Potential',
    },
  };
}

// ========================================================================
// 3. TRANSFER PROPOSALS & "FIND CLUBS" ENGINE
// ========================================================================

export interface ManagerTransferProposal {
  id: string;
  clubName: string;
  leagueName: string;
  countryName: string;
  countryFlag: string;
  leagueTier: number;
  prestigeStars: number;
  clubTier?: ClubCompetitiveTierNumber;
  clubTierInfo?: ClubTierInfo;
  interestEvaluation?: ClubInterestEvaluation;
  starterOvr?: number;
  starterComparisonText?: string;
  offeredFee: number;
  formattedFee: string;
  weeklyWage: number;
  yearlySalary: number;
  contractYears: number;
  signingBonus: number;
  releaseClause?: number;
  isReleaseClausePaid?: boolean;
  isExpiringContractMove?: boolean;
  isFreeAgentMove?: boolean;
  playerTransferFeeCutPercent?: number;
  playerTransferFeeCutAmount?: number;
  proposedSquad: 'First Team' | 'Reserves' | 'U20';
  expectedRole: 'Key Player' | 'First Team Starter' | 'Rotation Player' | 'Reserves Prospect';
  managerAssessment: string;
  isSaudiMegaOffer?: boolean;
  isBenchRaidTransfer?: boolean;
}

export function generateManagerTransferProposals(
  player: PlayerCardData,
  agent?: AgentState,
  accounting?: AccountingState
): ManagerTransferProposal[] {
  const currentClub = (player.club || '').toLowerCase();
  const ovr = player.ovr || 65;
  const fame = player.fame || 0;
  const subPos = resolvePlayerSubPosition(player);
  const effectiveFame = calculateEffectiveFame(fame, agent);
  const network = getAgentNetworkSkill(agent);
  const negotiation = getAgentNegotiationSkill(agent);
  const marketing = getAgentMarketingSkill(agent);
  const { marketValue } = calculatePlayerMarketValue(player);
  const currentContractYears = accounting?.contractYears ?? player.contractYearsRemaining ?? (player.isFreeAgent ? 0 : 3);
  const isFreeAgent = currentContractYears <= 0 || player.isFreeAgent;
  const hasReleaseClause = Boolean(accounting?.releaseClause && accounting.releaseClause > 0);
  const releaseClauseAmount = accounting?.releaseClause || 0;

  const flagMap: Record<string, string> = {
    England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    Spain: '🇪🇸',
    Germany: '🇩🇪',
    Italy: '🇮🇹',
    France: '🇫🇷',
    Portugal: '🇵🇹',
    Netherlands: '🇳🇱',
    Brazil: '🇧🇷',
    Argentina: '🇦🇷',
    USA: '🇺🇸',
    SaudiArabia: '🇸🇦',
  };

  // Get clubs visible through Effective Fame
  const visiblePool = getVisibleClubsByFame(effectiveFame, player.clubCountry || player.countryCode).filter(
    (c) => c.clubName.toLowerCase() !== currentClub
  );

  const candidateClubs = visiblePool.length >= 3 ? visiblePool : PRO_CLUBS_DATABASE.filter((c) => c.clubName.toLowerCase() !== currentClub);

  // Professional Agent Perk: Best Development Path for under-20
  const isProfessionalAgent = agent?.agentType === 'professional' || agent?.managerType === 'professional';
  let sortedPool = [...candidateClubs];

  // Evaluate interest for candidate clubs and filter/sort intelligently
  const evaluatedClubs = sortedPool.map((c) => ({
    club: c,
    interest: evaluateClubInterest(c, player, network),
  }));

  // Prioritize clubs with strong interest
  evaluatedClubs.sort((a, b) => {
    if (isProfessionalAgent && (player.age || 18) < 20) {
      return ((b.club as any).developmentTier || (b.club.prestigeStars * 20)) - ((a.club as any).developmentTier || (a.club.prestigeStars * 20));
    }
    return b.interest.interestScore - a.interest.interestScore;
  });

  const selectedEntries = evaluatedClubs.slice(0, 3);

  return selectedEntries.map(({ club, interest }, idx) => {
    let feeMultiplier = 0.85 + (network / 100) * 0.35 + (idx * 0.05);
    
    // Contract duration impact on transfer fee:
    if (currentContractYears === 1) {
      feeMultiplier *= 0.65; // Distress / final year discount
    }

    let offeredFee = isFreeAgent ? 0 : Math.round((marketValue * feeMultiplier) / 100000) * 100000;
    let isReleaseClausePaid = false;

    if (!isFreeAgent && hasReleaseClause && (club.leagueTier === 1 || club.prestigeStars >= 4)) {
      // High tier clubs can trigger release clauses
      if (offeredFee >= releaseClauseAmount * 0.85 || interest.classification === 'Aggressive Pursuit') {
        offeredFee = releaseClauseAmount;
        isReleaseClausePaid = true;
      }
    }

    const isSaudi =
      club.countryCode === 'KSA' ||
      club.countryCode === 'SAU' ||
      club.countryName.toLowerCase().includes('saudi') ||
      club.leagueName.toLowerCase().includes('saudi');

    let yearlySalary = 0;
    let weeklyWage = 0;

    if (isSaudi && (ovr >= 85 || fame >= 300)) {
      const eliteScale = Math.pow(1.22, Math.max(0, ovr - 84));
      const fameScale = 1 + (Math.min(1000, Math.max(0, fame - 300)) / 300) * 0.8;
      yearlySalary = Math.round(Math.max(35000000, (32000000 + (ovr - 85) * 15000000) * eliteScale * fameScale));
    } else {
      const baseSalary = 75000 + (ovr - 50) * 3500 + effectiveFame * 1200;
      const tierMultiplier = club.leagueTier === 1 ? (1.4 + club.prestigeStars * 0.3) : 1.1;
      yearlySalary = Math.round((baseSalary * tierMultiplier * (1 + (marketing * 0.003))) / 1000) * 1000;
    }
    
    let signingBonus = isFreeAgent
      ? Math.round(yearlySalary * (0.20 + (negotiation / 100) * 0.15))
      : Math.round(yearlySalary * (0.08 + (negotiation / 100) * 0.08));

    const isMercenary =
      Boolean(player.activePerkIds?.includes('mercenary')) ||
      (Array.isArray((player as any).perks) && (player as any).perks.includes('mercenary'));

    if (isMercenary) {
      yearlySalary = Math.round(yearlySalary * 1.20);
      signingBonus = Math.round(signingBonus * 1.20);
    }

    weeklyWage = Math.round(yearlySalary / 52);
    const playerTransferFeeCutPercent = isFreeAgent ? 0 : 5 + Math.floor(Math.random() * 6);
    const playerTransferFeeCutAmount = isFreeAgent ? 0 : Math.round(offeredFee * (playerTransferFeeCutPercent / 100));

    const isStarterUpgrade = interest.ovrDifferenceVsStarter >= 1 || (isSaudi && ovr >= 80);
    const isFirstTeam = isStarterUpgrade || ovr >= (club.leagueTier === 1 ? 74 : 65);
    const proposedSquad = isFirstTeam ? 'First Team' : ovr >= 62 ? 'Reserves' : 'U20';
    const expectedRole = ovr >= 82 ? 'Key Player' : isFirstTeam ? 'First Team Starter' : 'Rotation Player';
    const countryFlag = flagMap[club.countryName] || '🌍';

    const proposedReleaseClause = Math.max(5000000, Math.round((marketValue * 1.7) / 1000000) * 1000000);

    let formattedFee = isFreeAgent ? 'Free Transfer (€0 Fee)' : formatEuroCurrency(offeredFee);
    if (isReleaseClausePaid) {
      formattedFee = `Buyout Triggered (${formatEuroCurrency(offeredFee)})`;
    }

    return {
      id: `prop-${club.id}-${Date.now()}-${idx}`,
      clubName: club.clubName,
      leagueName: club.leagueName,
      countryName: club.countryName,
      countryFlag,
      leagueTier: club.leagueTier,
      prestigeStars: club.prestigeStars,
      clubTier: interest.clubTier,
      clubTierInfo: interest.clubTierInfo,
      interestEvaluation: interest,
      starterOvr: interest.starterOvr,
      starterComparisonText: `${subPos} Starter: ${interest.starterOvr} OVR ➔ You: ${ovr} OVR (${interest.ovrDifferenceVsStarter >= 0 ? '+' : ''}${interest.ovrDifferenceVsStarter})`,
      offeredFee,
      formattedFee,
      weeklyWage,
      yearlySalary,
      contractYears: isSaudi ? 3 : 3 + Math.floor(Math.random() * 2),
      signingBonus,
      releaseClause: proposedReleaseClause,
      isReleaseClausePaid,
      isExpiringContractMove: currentContractYears === 1,
      isFreeAgentMove: isFreeAgent,
      playerTransferFeeCutPercent,
      playerTransferFeeCutAmount,
      proposedSquad,
      expectedRole,
      isSaudiMegaOffer: interest.isSaudiMegaPursuit,
      isBenchRaidTransfer: interest.isBenchRaidOpportunity,
      managerAssessment: isFreeAgent
        ? `${agent?.name || 'Agent'} negotiated a direct Free Agent contract package with ${club.clubName} (€0 transfer fee required).`
        : isReleaseClausePaid
        ? `${club.clubName} triggered your €${(releaseClauseAmount / 1000000).toFixed(1)}M release clause. Current club cannot block.`
        : currentContractYears === 1
        ? `${club.clubName} aims to secure you before your contract expires with a discounted transfer bid.`
        : `${agent?.name || 'Agent'} placed your profile directly onto ${club.clubName}'s radar [Tier ${interest.clubTier}: ${interest.clubTierInfo.name}] (Interest: ${interest.classification} • Score ${interest.interestScore}/100).`,
    };
  });
}

/**
 * Free Agent Action: "Ask Agent to Find Clubs" in a specific league
 */
export function generateAgentLeagueClubOffers(
  player: PlayerCardData,
  leagueName: string,
  agent?: AgentState
): ManagerTransferProposal[] {
  const ovr = player.ovr || 60;
  const fame = player.fame || 0;
  const effectiveFame = calculateEffectiveFame(fame, agent);
  const network = getAgentNetworkSkill(agent);
  const negotiation = getAgentNegotiationSkill(agent);

  const matchingClubs = PRO_CLUBS_DATABASE.filter(
    (c) => c.leagueName.toLowerCase().includes(leagueName.toLowerCase()) ||
           c.countryName.toLowerCase().includes(leagueName.toLowerCase())
  );

  const pool = matchingClubs.length > 0 ? matchingClubs : PRO_CLUBS_DATABASE;
  const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);

  return shuffled.map((club, idx) => {
    const baseSalary = 50000 + (ovr - 50) * 3000 + (effectiveFame * 800);
    const tierMultiplier = club.leagueTier === 1 ? (1.3 + club.prestigeStars * 0.25) : 1.0;
    const yearlySalary = Math.round((baseSalary * tierMultiplier * (1 + (negotiation / 100) * 0.25)) / 1000) * 1000;
    const weeklyWage = Math.round(yearlySalary / 52);
    const signingBonus = Math.round(yearlySalary * (0.05 + (negotiation / 100) * 0.10));

    const isFirstTeam = ovr >= (club.leagueTier === 1 ? 72 : 62);
    const proposedSquad = isFirstTeam ? 'First Team' : 'Reserves';
    const expectedRole = ovr >= 78 ? 'Key Player' : isFirstTeam ? 'First Team Starter' : 'Rotation Player';

    return {
      id: `agent-league-offer-${club.id}-${idx}-${Date.now()}`,
      clubName: club.clubName,
      leagueName: club.leagueName,
      countryName: club.countryName,
      countryFlag: '⚽',
      leagueTier: club.leagueTier,
      prestigeStars: club.prestigeStars,
      offeredFee: 0,
      formattedFee: 'Free Transfer (No Fee)',
      weeklyWage,
      yearlySalary,
      contractYears: 2 + Math.floor(Math.random() * 2),
      signingBonus,
      playerTransferFeeCutPercent: 0,
      playerTransferFeeCutAmount: 0,
      proposedSquad,
      expectedRole,
      managerAssessment: `Your Agent utilized his ${network}/100 Networking skill in ${leagueName} to arrange a direct contract agreement with ${club.clubName}.`,
    };
  });
}

// ========================================================================
// 4. SPONSOR SYSTEM & MARKETING PERKS
// ========================================================================

/**
 * Rolls Pre-Season Sponsor Opportunities:
 * Base Marketing roll: Marketing * 0.25% (e.g., 50 -> 12.5%, 80 -> 20%, 90 -> 22.5%)
 * Famous Agent Perk: 50% separate chance for immediate Sponsor Card
 */
export function rollPreseasonSponsorOpportunities(
  player: PlayerCardData,
  agent?: AgentState,
  accounting?: AccountingState
): {
  hasSponsorOffer: boolean;
  sponsorCardOffer: SponsorItem | null;
  triggerSource: 'marketing_roll' | 'famous_agent_perk' | 'none';
  marketingRollChance: number;
} {
  const marketing = getAgentMarketingSkill(agent);
  const baseChance = marketing * 0.25; // Marketing * 0.25%

  const isFamousAgent = agent?.agentType === 'famous' || agent?.managerType === 'famous';

  // 1. Check Famous Agent 50% Perk
  if (isFamousAgent) {
    const perkRoll = Math.random() * 100;
    if (perkRoll <= 50 && SPONSOR_CARDS_POOL.length > 0) {
      const template = SPONSOR_CARDS_POOL[Math.floor(Math.random() * SPONSOR_CARDS_POOL.length)];
      const baseYearly = (template.sponsorDealDetails?.yearlyPayment || 25000) * (1 + (player.fame || 0) * 0.005);
      const sponsorItem: SponsorItem = {
        id: `sponsor-${Date.now()}`,
        name: template.name,
        category: template.sponsorDealDetails?.category || 'good',
        tier: template.tier || 'Bronze',
        yearlyPayment: Math.round(baseYearly),
        weeklyPay: Math.round(baseYearly / 52),
        initialPayment: template.sponsorDealDetails?.initialPayment || 10000,
        durationYears: template.sponsorDealDetails?.durationYears || 2,
        remainingYears: template.sponsorDealDetails?.durationYears || 2,
        logoColor: template.sponsorDealDetails?.logoColor || '#f59e0b',
        active: true,
      };

      return {
        hasSponsorOffer: true,
        sponsorCardOffer: sponsorItem,
        triggerSource: 'famous_agent_perk',
        marketingRollChance: baseChance,
      };
    }
  }

  // 2. Check Standard Marketing Roll
  const roll = Math.random() * 100;
  if (roll <= baseChance && SPONSOR_CARDS_POOL.length > 0) {
    const template = SPONSOR_CARDS_POOL[Math.floor(Math.random() * SPONSOR_CARDS_POOL.length)];
    const baseYearly = (template.sponsorDealDetails?.yearlyPayment || 20000) * (1 + (player.fame || 0) * 0.004);
    const sponsorItem: SponsorItem = {
      id: `sponsor-${Date.now()}`,
      name: template.name,
      category: template.sponsorDealDetails?.category || 'good',
      tier: template.tier || 'Bronze',
      yearlyPayment: Math.round(baseYearly),
      weeklyPay: Math.round(baseYearly / 52),
      initialPayment: template.sponsorDealDetails?.initialPayment || 5000,
      durationYears: template.sponsorDealDetails?.durationYears || 2,
      remainingYears: template.sponsorDealDetails?.durationYears || 2,
      logoColor: template.sponsorDealDetails?.logoColor || '#3b82f6',
      active: true,
    };

    return {
      hasSponsorOffer: true,
      sponsorCardOffer: sponsorItem,
      triggerSource: 'marketing_roll',
      marketingRollChance: baseChance,
    };
  }

  return {
    hasSponsorOffer: false,
    sponsorCardOffer: null,
    triggerSource: 'none',
    marketingRollChance: baseChance,
  };
}

/**
 * Handles acquiring a Sponsor Card:
 * Max 5 active Sponsor Cards. If full (5 sponsors), enables replacing the oldest sponsor (index 0).
 */
export function handleSponsorOfferAcquisition(
  newSponsor: SponsorItem,
  accounting: AccountingState,
  replaceOldestIfFull: boolean = false
): {
  updatedAccounting: AccountingState;
  replacedOldSponsor: SponsorItem | null;
  status: 'added' | 'replaced' | 'declined_full';
} {
  const currentSponsors = accounting.sponsors || [];

  if (currentSponsors.length < 5) {
    return {
      updatedAccounting: {
        ...accounting,
        sponsors: [...currentSponsors, newSponsor],
      },
      replacedOldSponsor: null,
      status: 'added',
    };
  }

  // Already has 5 sponsors
  if (replaceOldestIfFull) {
    const oldest = currentSponsors[0];
    const remaining = currentSponsors.slice(1);
    return {
      updatedAccounting: {
        ...accounting,
        sponsors: [...remaining, newSponsor],
      },
      replacedOldSponsor: oldest,
      status: 'replaced',
    };
  }

  return {
    updatedAccounting: accounting,
    replacedOldSponsor: null,
    status: 'declined_full',
  };
}

// ========================================================================
// 5. SHADY DEALS MID-SEASON SCHEMES
// ========================================================================

/**
 * Mid-Season Shady Deal Roll (10% chance for Shady Agents)
 */
export function rollShadyDealObjective(
  player: PlayerCardData,
  agent?: AgentState
): ShadyDealObjective | null {
  const isShady = agent?.agentType === 'shady' || agent?.managerType === 'shady';
  if (!isShady) return null;

  // 10% chance mid-season
  const roll = Math.random() * 100;
  if (roll > 10) return null;

  const schemes: {
    type: ShadyDealObjective['type'];
    title: string;
    description: string;
    cashReward: number;
    promisedPerk: string;
  }[] = [
    {
      type: 'red_card_next_match',
      title: 'The Red Card Syndicate',
      description: 'Get a red card next match and our syndicate will wire €5,000,000 to your offshore account.',
      cashReward: 5000000,
      promisedPerk: '€5,000,000 Tax-Free Syndicate Cash',
    },
    {
      type: 'dont_score_final',
      title: 'The Under-Goal Coup',
      description: "Don't score in the upcoming cup final and we'll secure a top-club contract offer for you.",
      cashReward: 2500000,
      promisedPerk: 'Top-Club Contract Transfer Link + €2.5M Cash',
    },
    {
      type: 'yellow_card_next_match',
      title: 'The Tactical Booking',
      description: 'Receive a yellow card in your next match and we will arrange a major transfer offer.',
      cashReward: 1500000,
      promisedPerk: 'Major Club Transfer Offer + €1.5M Cash',
    },
    {
      type: 'lose_next_duel',
      title: 'The Calculated Slip',
      description: "Lose your next key duel and we'll guarantee a +25% salary increase on your next contract.",
      cashReward: 1000000,
      promisedPerk: '+25% Guaranteed Contract Salary Upgrade',
    },
    {
      type: 'no_motm_final',
      title: 'The Low-Profile Final',
      description: 'Do not win Player of the Match in the final and we will arrange a major club opportunity.',
      cashReward: 3000000,
      promisedPerk: 'Major European Powerhouse Offer + €3.0M Cash',
    },
  ];

  const chosen = schemes[Math.floor(Math.random() * schemes.length)];

  return {
    id: `shady-deal-${Date.now()}`,
    type: chosen.type,
    title: chosen.title,
    description: chosen.description,
    cashReward: chosen.cashReward,
    promisedPerk: chosen.promisedPerk,
    isAccepted: false,
    isCompleted: false,
    isFailed: false,
  };
}

// ========================================================================
// 6. AGENT PROFILES, TIERS & RECRUITMENT GENERATOR
// ========================================================================

export interface AgentTypeProfile {
  type: AgentType;
  title: string;
  category: 'Family' | 'Agency' | 'Underground' | 'Celebrity' | 'Icon';
  badgeColor: string;
  tagline: string;
  description: string;
  preferredStat: 'negotiation' | 'network' | 'marketing';
  developmentBonus: string;
  financialBonus: string;
  riskFactor?: string;
  isParentCardExclusive: boolean;
}

export const AGENT_TYPE_PROFILES: Record<string, AgentTypeProfile> = {
  ex_pro_parents: {
    type: 'ex_pro_parents',
    title: 'Ex-Pro Footballer (Parent Agent)',
    category: 'Family',
    badgeColor: 'from-amber-500 to-yellow-600',
    tagline: 'Football Royalty & Insider Wisdom',
    description: 'One of your parents was a renowned professional footballer. They manage your career through personal contacts, tactical insights, and family legacy. Cannot be fired.',
    preferredStat: 'network',
    developmentBonus: '+10% Match XP & +5 Chemistry with veteran teammates',
    financialBonus: 'Zero agency commission cuts; family wealth protection',
    isParentCardExclusive: true,
  },
  helicopter_parents: {
    type: 'helicopter_parents',
    title: 'Helicopter Parent (Parent Agent)',
    category: 'Family',
    badgeColor: 'from-purple-500 to-indigo-700',
    tagline: 'Strict Discipline & Relentless Training',
    description: 'Hyper-protective parents who control every minute of your diet, sleep, and fitness. Demanding, but guarantees elite work ethic and resilience. Cannot be fired.',
    preferredStat: 'negotiation',
    developmentBonus: 'Gain +1 Recovery Point every month; fast injury healing',
    financialBonus: 'Demands strict financial budgeting and high savings floor',
    isParentCardExclusive: true,
  },
  professional: {
    type: 'professional',
    title: 'Professional Agent',
    category: 'Agency',
    badgeColor: 'from-blue-500 to-cyan-700',
    tagline: 'Strategic Career Development & Best Pathway',
    description: 'Licensed FIFA agent dedicated to holistic player growth. Specializes in Contract Negotiations. Perk: Best Development Path (Under 20 prioritizes highest development tier clubs, starting roles, European Top-5 leagues over higher salary).',
    preferredStat: 'negotiation',
    developmentBonus: 'Best Development Path: Prioritizes elite Tier academies & guaranteed starts',
    financialBonus: 'High negotiation leverage & consistent multi-year wage protection',
    isParentCardExclusive: false,
  },
  shady: {
    type: 'shady',
    title: 'Shady Agent',
    category: 'Underground',
    badgeColor: 'from-rose-600 via-red-700 to-slate-900',
    tagline: 'Mega Money, Underground Deals & Betting Schemes',
    description: 'A shadowy dealmaker with deep ties to high-stakes syndicates and mega-rich owners. Specializes in Networking. Perk: Shady Deals (10% chance mid-season of high-stakes objective schemes for instant cash).',
    preferredStat: 'network',
    developmentBonus: '+40% Transfer Salary multiplier & Mega Saudi/Commercial Offers',
    financialBonus: '10% Mid-Season Shady Deals with €1M–€5M cash payouts',
    riskFactor: 'Match manipulation investigation and FA penalty risk on failed schemes',
    isParentCardExclusive: false,
  },
  famous: {
    type: 'famous',
    title: 'Famous Agent',
    category: 'Celebrity',
    badgeColor: 'from-yellow-400 via-amber-500 to-orange-500',
    tagline: 'Global Stardom, Mega Endorsements & Brand Exposure',
    description: 'Celebrity super-agent with worldwide media connections. Specializes in Marketing. Perk: Sponsor Connection (50% pre-season chance to immediately offer a random Sponsor Card).',
    preferredStat: 'marketing',
    developmentBonus: '+25% Global Fanbase Growth & High-Profile Media Coverage',
    financialBonus: '50% Pre-Season Sponsor Connection Card Offer & Commercial Supremacy',
    isParentCardExclusive: false,
  },
  club_legend: {
    type: 'club_legend',
    title: 'Club Legend Representative',
    category: 'Icon',
    badgeColor: 'from-amber-400 via-orange-500 to-yellow-600',
    tagline: 'Dedicated Pathway to Legendary Club Immortality',
    description: 'A revered former icon of a specific club who mentors your career to reach and dominate at their beloved institution.',
    preferredStat: 'network',
    developmentBonus: '+80% Transfer probability to their iconic club & +10 Chemistry when signed',
    financialBonus: 'Club Icon endorsement bonuses and fanbase adoration',
    isParentCardExclusive: false,
  },
};

// Backwards compatibility alias
export const MANAGER_TYPE_PROFILES = AGENT_TYPE_PROFILES;
export type ManagerTypeProfile = AgentTypeProfile;

/**
 * Generates a random Agent Card matching tier, preferred stat (+5 to +15 higher), and agency details.
 */
export function generateRandomAgent(
  targetTier: AgentTier = 'bronze',
  targetType?: AgentType
): AgentState {
  const type: AgentType = targetType || (['professional', 'shady', 'famous'][Math.floor(Math.random() * 3)] as AgentType);

  let minStat = 50;
  let maxStat = 60;
  if (targetTier === 'silver') { minStat = 60; maxStat = 70; }
  else if (targetTier === 'gold') { minStat = 70; maxStat = 80; }
  else if (targetTier === 'legendary') { minStat = 80; maxStat = 90; }
  else if (targetTier === 'iconic') { minStat = 90; maxStat = 99; }

  const baseVal1 = Math.floor(minStat + Math.random() * (maxStat - minStat));
  const baseVal2 = Math.floor(minStat + Math.random() * (maxStat - minStat));
  const preferredBoost = 5 + Math.floor(Math.random() * 11); // 5 to 15 points higher
  const boostedVal = Math.min(99, Math.max(baseVal1, baseVal2) + preferredBoost);

  let negotiation = baseVal1;
  let network = baseVal2;
  let marketing = Math.floor(minStat + Math.random() * (maxStat - minStat));

  if (type === 'professional') {
    negotiation = boostedVal;
  } else if (type === 'shady') {
    network = boostedVal;
  } else if (type === 'famous') {
    marketing = boostedVal;
  }

  const proFirstNames = ['Marcus', 'Jonathan', 'Claire', 'Elena', 'Lucas', 'Julian', 'Sebastian', 'Valeria'];
  const proLastNames = ['Vance', 'Stern', 'De La Tour', 'Rostova', 'Kaufmann', 'Alvarez', 'Moreau', 'Davenport'];
  const shadyFirstNames = ['Vincenzo', 'Dmitri', 'Sylvain', 'Donovan', 'Bruno', 'Renato', 'Luciano'];
  const shadyLastNames = ['"The Shark" Moretti', '"The Fixer" Volkov', '"Goldfinger" Mercier', '"Cashout" Vance', '"The Broker" Rossi'];
  const famousFirstNames = ['Mino', 'Jorge', 'Giovanni', 'Maximilian', 'Cristiano', 'Victoria', 'Stella'];
  const famousLastNames = ['Mendes-Silva', 'Santoro', 'Castiglione', 'Van Der Berg', 'De Silva', 'Sinclair'];

  let firstName = proFirstNames[Math.floor(Math.random() * proFirstNames.length)];
  let lastName = proLastNames[Math.floor(Math.random() * proLastNames.length)];
  let agency = 'Apex Sports Group';
  let perkDesc = 'Best Development Path';

  if (type === 'professional') {
    agency = `${lastName} Athletic Management`;
    perkDesc = 'Best Development Path (Under-20 Top Tier & Starting Minutes Priority)';
  } else if (type === 'shady') {
    firstName = shadyFirstNames[Math.floor(Math.random() * shadyFirstNames.length)];
    lastName = shadyLastNames[Math.floor(Math.random() * shadyLastNames.length)];
    agency = 'Black Market Syndicate';
    perkDesc = 'Shady Deals (10% Mid-Season Scheme Offers with €1M–€5M Payouts)';
  } else if (type === 'famous') {
    firstName = famousFirstNames[Math.floor(Math.random() * famousFirstNames.length)];
    lastName = famousLastNames[Math.floor(Math.random() * famousLastNames.length)];
    agency = 'Global Icon Representation';
    perkDesc = 'Sponsor Connection (50% Pre-Season Sponsor Card Opportunity)';
  }

  const fullName = `${firstName} ${lastName}`;

  return {
    name: fullName,
    agentType: type,
    managerType: type,
    tier: targetTier,
    negotiation,
    network,
    marketing,
    bio: AGENT_TYPE_PROFILES[type]?.description || 'Licensed representative dedicated to advancing your football career.',
    agencyName: agency,
    specialTrait: perkDesc,
    isParentAgent: false,
  };
}

/**
 * Generates Candidate Agents for Recruitment (Professional, Shady, Famous).
 */
export function generateSinglePreseasonManagerOffer(player: PlayerCardData): AgentState {
  const ovr = player.ovr || 55;
  const fame = player.fame || 0;

  let targetTier: AgentTier = 'bronze';
  if (ovr >= 82 || fame >= 300) targetTier = 'legendary';
  else if (ovr >= 72 || fame >= 120) targetTier = 'gold';
  else if (ovr >= 62 || fame >= 40) targetTier = 'silver';

  const types: AgentType[] = ['professional', 'shady', 'famous'];
  const chosenType = types[Math.floor(Math.random() * types.length)];
  return generateRandomAgent(targetTier, chosenType);
}

export function generatePreseasonManagerOffers(player: PlayerCardData): AgentState[] {
  const drawnCustomCards = drawUniqueCareerCategoryCards('agent', 3);
  if (drawnCustomCards && drawnCustomCards.length > 0) {
    return drawnCustomCards.map((customCard) => {
      let type: AgentType = 'professional';
      if (customCard.id.includes('shady') || customCard.name.toLowerCase().includes('shady')) type = 'shady';
      else if (customCard.id.includes('famous') || customCard.name.toLowerCase().includes('famous')) type = 'famous';

      let tier: AgentTier = 'bronze';
      if (customCard.tier === 'silver') tier = 'silver';
      else if (customCard.tier === 'gold') tier = 'gold';
      else if (customCard.tier === 'legendary') tier = 'legendary';
      else if (customCard.tier === 'iconic') tier = 'iconic';

      const agent = generateRandomAgent(tier, type);
      if ((customCard as any)?.isNewCardGuaranteed) {
        agent.isNewCardGuaranteed = true;
      }
      return agent;
    });
  }

  const types: AgentType[] = ['professional', 'shady', 'famous'];
  return types.map((type) => generateRandomAgent('bronze', type));
}

// ========================================================================
// 7. SQUAD ACTIONS & PLAYING TIME INTERVENTIONS
// ========================================================================

export interface SquadCompetitorProfile {
  name: string;
  position: string;
  subPosition: string;
  ovr: number;
  potential: number;
  age: number;
  playStyle: string;
  form: string;
  status: string;
}

export interface ManagerTacticalEvaluation {
  playerOvr: number;
  playerPotential: number;
  playerAge: number;
  playerForm: string;
  playerTacticalFitScore: number;
  competitorsAhead: SquadCompetitorProfile[];
  tacticalVerdict: string;
}

export interface PlayingTimeInterventionResult {
  outcomeType:
    | 'first_team_starter'
    | 'first_team_rotation'
    | 'reserves_to_first_team'
    | 'u20_to_reserves'
    | 'u17_to_u20'
    | 'development_plan'
    | 'young_potential_succession'
    | 'suggest_learn_position'
    | 'season_loan_move'
    | 'transfer_list';
  headline: string;
  coachStatement: string;
  managerDebrief: string;
  previousSquad: string;
  newSquad: string;
  previousRole: string;
  newRole: string;
  evaluation?: ManagerTacticalEvaluation;
  loanClub?: {
    name: string;
    league: string;
    country: string;
    guaranteedRole: string;
  };
  chemistryDelta: number;
  starterSoldOrListedName?: string;
  learnPositionProposal?: {
    position: string;
    subPosition: string;
    playStyle: string;
    starterName: string;
    starterOvr: number;
    explanation: string;
  };
}

export function calculatePlayingTimeIntervention(
  player: PlayerCardData,
  managerOrAgent?: ManagerState | AgentState
): PlayingTimeInterventionResult {
  const playerOvr = Math.max(40, player.ovr || player.overallRating || 65);
  const playerPotential = Math.max(playerOvr, player.potentialOvr || (player as any).potential || 78);
  const age = player.age || 18;
  const agent: AgentState | undefined =
    managerOrAgent && 'negotiation' in managerOrAgent
      ? (managerOrAgent as AgentState)
      : ((player as any).agent as AgentState | undefined) ||
        ((managerOrAgent as any)?.agent as AgentState | undefined);
  const negotiation = getAgentNegotiationSkill(agent);
  const myPos = (player.position || 'ATT').toUpperCase().trim();
  const mySubPos = (player.subPosition || player.position || 'ST').toUpperCase().trim();
  const currentSquad = player.squadDestination || 'First Team';
  const currentRole = player.squadRole || 'Squad Member';
  const clubName = player.club || player.youthTeamName || 'Current Club';

  // 1. Load actual player's CURRENT TEAM from database or create calibrated team squad
  const db = getLeagueDatabase();
  const playerClubName = clubName.toLowerCase().trim();
  let currentTeam: EditorTeamData | null = null;

  if (playerClubName && playerClubName !== 'free agent' && playerClubName !== 'unassigned') {
    for (const t of Object.values(db.teams || {})) {
      if (
        t.name.toLowerCase().trim() === playerClubName ||
        (t.shortName && t.shortName.toLowerCase().trim() === playerClubName) ||
        playerClubName.includes(t.name.toLowerCase().trim()) ||
        t.name.toLowerCase().trim().includes(playerClubName)
      ) {
        currentTeam = t;
        break;
      }
    }
  }

  if (!currentTeam) {
    const fallbackTeam: EditorTeamData = {
      id: 'team_' + clubName.toLowerCase().replace(/\s+/g, '_'),
      name: clubName,
      shortName: clubName.substring(0, 3).toUpperCase(),
      countryCode: player.clubCountry || 'ENG',
      leagueId: player.league || 'Premier League',
      reputation: 75,
      tier: 1,
    } as any;
    currentTeam = fallbackTeam;
  }

  const ensuredTeam = ensureTeamSquadSaveFile(currentTeam);
  const squadFile = ensuredTeam.squadSaveFile;

  const getTeammates = (slots?: { player?: PlayerCardData; slotNumber: number }[]): PlayerCardData[] => {
    if (!slots) return [];
    return slots
      .map((s) => s.player)
      .filter((p): p is PlayerCardData => Boolean(p && p.id !== player.id && p.name !== player.name));
  };

  const u17Players = getTeammates(squadFile?.u17);
  const u20Players = getTeammates(squadFile?.u20);
  const reservePlayers = [
    ...getTeammates(squadFile?.reserves),
    ...getTeammates(squadFile?.squad?.slice(18)),
  ];
  const firstTeamStarters = getTeammates(squadFile?.squad?.slice(0, 11));
  const firstTeamSubs = getTeammates(squadFile?.squad?.slice(11, 18));
  const allFirstTeam = [...firstTeamStarters, ...firstTeamSubs];

  // Helper to filter teammates in the same position
  const filterSamePosition = (pool: PlayerCardData[]): PlayerCardData[] => {
    const exact = pool.filter(
      (p) => (p.subPosition || p.position || '').toUpperCase().trim() === mySubPos
    );
    if (exact.length > 0) return exact;
    return pool.filter((p) => (p.position || '').toUpperCase().trim() === myPos);
  };

  // Helper to convert PlayerCardData to SquadCompetitorProfile
  const toCompetitorProfile = (p: PlayerCardData, statusLabel: string): SquadCompetitorProfile => ({
    name: p.name,
    position: p.position || myPos,
    subPosition: p.subPosition || mySubPos,
    ovr: Math.max(40, p.ovr || p.overallRating || 70),
    potential: Math.max(40, p.potentialOvr || (p as any).potential || (p.ovr || 70) + 2),
    age: p.age || 22,
    playStyle: p.playStyle || 'Complete Player',
    form: 'Good (7.2 Rating)',
    status: statusLabel,
  });

  // 2. Identify Player's Current Hierarchy Tier
  const squadNorm = currentSquad.toUpperCase();
  const roleNorm = currentRole.toLowerCase();
  const isYouth =
    player.careerStage === 'YOUTH_ACADEMY' ||
    (player as any).isYouthCareer === true ||
    (!isProfessionalPlayer(player) && squadNorm !== 'FIRST TEAM');

  const isAtU17 =
    squadNorm.includes('U17') ||
    squadNorm.includes('17') ||
    (isYouth && age <= 16 && !squadNorm.includes('20') && !squadNorm.includes('RESERVE'));
  const isAtU20 =
    squadNorm.includes('U20') ||
    squadNorm.includes('20') ||
    (isYouth && age >= 17 && age <= 20 && !squadNorm.includes('RESERVE') && !squadNorm.includes('FIRST'));
  const isAtReserves = squadNorm.includes('RESERVE');
  const isAtFirstTeam = !isAtU17 && !isAtU20 && !isAtReserves;
  const isFirstTeamStarter =
    isAtFirstTeam &&
    (roleNorm.includes('starter') ||
      roleNorm.includes('pillar') ||
      roleNorm.includes('crucial') ||
      roleNorm.includes('key'));

  // Rise rule helper:
  // "if it makes sense they will rise you like maybe you're 3 or less lower than the starter but have higher potential"
  const canPromoteOverCompetitor = (competitorOvr: number, competitorPot: number): boolean => {
    if (playerOvr >= competitorOvr) return true;
    if (playerOvr >= competitorOvr - 3 && playerPotential > competitorPot) return true;
    if (negotiation >= 70 && playerOvr >= competitorOvr - 4 && playerPotential > competitorPot) return true;
    return false;
  };

  // -------------------------------------------------------------
  // Case A: Player is at U17 -> Weight first against U20 players
  // -------------------------------------------------------------
  if (isAtU17) {
    const u20SamePos = filterSamePosition(u20Players).sort((a, b) => (b.ovr || 70) - (a.ovr || 70));
    const rival = u20SamePos[0] || u20Players[0] || ({
      id: 'u20_rival',
      name: `${currentTeam.name} U20 Prospect`,
      position: myPos,
      subPosition: mySubPos,
      ovr: Math.max(45, playerOvr + 1),
      potential: Math.max(50, playerPotential - 2),
      age: 18,
      playStyle: getDefaultPlayStyleForSubPos(mySubPos),
    } as any);

    const rivalOvr = rival.ovr || rival.overallRating || 70;
    const rivalPot = rival.potentialOvr || rival.potential || rivalOvr + 2;

    const competitorsAhead = [toCompetitorProfile(rival, 'U20 Direct Competitor')];
    const secondRival = u20SamePos[1];
    if (secondRival) competitorsAhead.push(toCompetitorProfile(secondRival, 'U20 Rotation'));

    const evaluation: ManagerTacticalEvaluation = {
      playerOvr,
      playerPotential,
      playerAge: age,
      playerForm: 'Good',
      playerTacticalFitScore: 88,
      competitorsAhead,
      tacticalVerdict: `Agent weighed your level against U20 players in your position at ${currentTeam.name}. Primary competitor: ${rival.name} (${rivalOvr} OVR, ${rivalPot} POT).`,
    };

    if (canPromoteOverCompetitor(rivalOvr, rivalPot)) {
      return {
        outcomeType: 'u17_to_u20',
        headline: 'Promoted to U20 Youth Squad! 🌟',
        coachStatement: `"Your agent made a convincing case based on current squad data. Your ability (${playerOvr} OVR) and potential (${playerPotential} POT) show you are ready to compete with ${rival.name} in our U20 setup. Welcome to the U20s."`,
        managerDebrief: `Agent proved your readiness to move up from U17 to U20 over ${rival.name} (${rivalOvr} OVR).`,
        previousSquad: currentSquad || 'U17',
        newSquad: 'U20',
        previousRole: currentRole || 'U17 Prospect',
        newRole: playerOvr >= rivalOvr ? 'U20 Starter' : 'U20 Developing Talent',
        evaluation,
        chemistryDelta: 12,
      };
    }
  }

  // -------------------------------------------------------------
  // Case B: Player is at U20 -> Weight first against Reserves
  // -------------------------------------------------------------
  else if (isAtU20) {
    const reserveSamePos = filterSamePosition(reservePlayers).sort((a, b) => (b.ovr || 70) - (a.ovr || 70));
    const rival = reserveSamePos[0] || reservePlayers[0] || ({
      id: 'res_rival',
      name: `${currentTeam.name} Reserves Player`,
      position: myPos,
      subPosition: mySubPos,
      ovr: Math.max(55, playerOvr + 2),
      potential: Math.max(60, playerPotential - 2),
      age: 20,
      playStyle: getDefaultPlayStyleForSubPos(mySubPos),
    } as any);

    const rivalOvr = rival.ovr || rival.overallRating || 70;
    const rivalPot = rival.potentialOvr || rival.potential || rivalOvr + 2;

    const competitorsAhead = [toCompetitorProfile(rival, 'Reserves Competitor')];
    const secondRival = reserveSamePos[1];
    if (secondRival) competitorsAhead.push(toCompetitorProfile(secondRival, 'Reserves Depth'));

    const evaluation: ManagerTacticalEvaluation = {
      playerOvr,
      playerPotential,
      playerAge: age,
      playerForm: 'Good',
      playerTacticalFitScore: 88,
      competitorsAhead,
      tacticalVerdict: `Agent weighed your development against Reserve players at ${currentTeam.name}. Primary competitor: ${rival.name} (${rivalOvr} OVR, ${rivalPot} POT).`,
    };

    if (canPromoteOverCompetitor(rivalOvr, rivalPot)) {
      return {
        outcomeType: 'u20_to_reserves',
        headline: 'Promoted to Reserves Squad! ⚡',
        coachStatement: `"You have earned this promotion. Comparing you against ${rival.name}, your current level and high ceiling show you belong at Reserve squad level."`,
        managerDebrief: `Agent convinced the technical directors that your quality matches or exceeds ${rival.name} (${rivalOvr} OVR).`,
        previousSquad: currentSquad || 'U20',
        newSquad: 'Reserves',
        previousRole: currentRole || 'U20 Player',
        newRole: playerOvr >= rivalOvr ? 'Reserves Starter' : 'Reserves Prospect',
        evaluation,
        chemistryDelta: 12,
      };
    }
  }

  // -------------------------------------------------------------
  // Case C: Player is at Reserves -> Weight against First Team players
  // -------------------------------------------------------------
  else if (isAtReserves) {
    const ftSamePos = filterSamePosition(allFirstTeam).sort((a, b) => (b.ovr || 70) - (a.ovr || 70));
    // Weigh against rotation / bench option first, or starter
    const rival = ftSamePos[ftSamePos.length - 1] || ftSamePos[0] || allFirstTeam[0] || ({
      id: 'ft_rival',
      name: `${currentTeam.name} Senior Squad Player`,
      position: myPos,
      subPosition: mySubPos,
      ovr: Math.max(65, playerOvr + 2),
      potential: Math.max(70, playerPotential - 2),
      age: 24,
      playStyle: getDefaultPlayStyleForSubPos(mySubPos),
    } as any);

    const rivalOvr = rival.ovr || rival.overallRating || 70;
    const rivalPot = rival.potentialOvr || rival.potential || rivalOvr + 2;

    const competitorsAhead = [toCompetitorProfile(rival, 'First Team Senior Player')];
    if (ftSamePos[0] && ftSamePos[0].id !== rival.id) {
      competitorsAhead.unshift(toCompetitorProfile(ftSamePos[0], 'First Team Starter'));
    }

    const evaluation: ManagerTacticalEvaluation = {
      playerOvr,
      playerPotential,
      playerAge: age,
      playerForm: 'Good',
      playerTacticalFitScore: 88,
      competitorsAhead,
      tacticalVerdict: `Agent weighed you against First Team players in your position at ${currentTeam.name}. Benchmark player: ${rival.name} (${rivalOvr} OVR, ${rivalPot} POT).`,
    };

    if (canPromoteOverCompetitor(rivalOvr, rivalPot)) {
      return {
        outcomeType: 'reserves_to_first_team',
        headline: 'Promoted to Senior First Team! 🚀',
        coachStatement: `"Your agent presented the squad hierarchy comparison. You are ready to step up and challenge ${rival.name} in the senior First Team squad."`,
        managerDebrief: `Agent successfully secured your senior squad promotion over ${rival.name} (${rivalOvr} OVR).`,
        previousSquad: currentSquad || 'Reserves',
        newSquad: 'First Team',
        previousRole: currentRole || 'Reserves Player',
        newRole: 'First Team Squad Player',
        evaluation,
        chemistryDelta: 12,
      };
    }
  }

  // -------------------------------------------------------------
  // Case D: Player is a First Team Sub -> Weight against the Starter
  // -------------------------------------------------------------
  else if (!isFirstTeamStarter) {
    const starterSamePos = filterSamePosition(firstTeamStarters).sort((a, b) => (b.ovr || 70) - (a.ovr || 70));
    const starter = starterSamePos[0] || firstTeamStarters[0] || ({
      id: 'ft_starter',
      name: `${currentTeam.name} Starting ${mySubPos}`,
      position: myPos,
      subPosition: mySubPos,
      ovr: Math.max(70, playerOvr + 2),
      potential: Math.max(75, playerPotential - 2),
      age: 26,
      playStyle: getDefaultPlayStyleForSubPos(mySubPos),
    } as any);

    const starterOvr = starter.ovr || starter.overallRating || 70;
    const starterPot = starter.potentialOvr || starter.potential || starterOvr + 2;

    const subCompetitor = firstTeamSubs.find((s) => (s.subPosition || s.position || '') === mySubPos);
    const competitorsAhead = [toCompetitorProfile(starter, 'Starting XI Pillar')];
    if (subCompetitor && subCompetitor.id !== starter.id) {
      competitorsAhead.push(toCompetitorProfile(subCompetitor, 'Rotation Competitor'));
    }

    const evaluation: ManagerTacticalEvaluation = {
      playerOvr,
      playerPotential,
      playerAge: age,
      playerForm: 'Good',
      playerTacticalFitScore: 88,
      competitorsAhead,
      tacticalVerdict: `Agent weighed you against starting ${mySubPos} ${starter.name} (${starterOvr} OVR, ${starterPot} POT) at ${currentTeam.name}.`,
    };

    if (canPromoteOverCompetitor(starterOvr, starterPot)) {
      return {
        outcomeType: 'first_team_starter',
        headline: 'Starting XI Role Granted! ⭐',
        coachStatement: `"Your agent made an airtight tactical argument. Looking at ${starter.name} (${starterOvr} OVR) and your ceiling (${playerPotential} POT), you have earned the Starting XI spot."`,
        managerDebrief: `Negotiations succeeded with the Head Coach. Promoted to Starting XI over ${starter.name}.`,
        previousSquad: currentSquad || 'First Team',
        newSquad: 'First Team',
        previousRole: currentRole || 'Bench Option',
        newRole: 'First Team Starter',
        evaluation,
        chemistryDelta: 15,
      };
    }
  }

  // -------------------------------------------------------------
  // Case E: Player is already a First Team Starter
  // -------------------------------------------------------------
  else {
    const backup = firstTeamSubs.find((s) => (s.subPosition || s.position || '') === mySubPos) || firstTeamSubs[0];
    const competitorsAhead = backup ? [toCompetitorProfile(backup, 'Squad Backup')] : [];

    const evaluation: ManagerTacticalEvaluation = {
      playerOvr,
      playerPotential,
      playerAge: age,
      playerForm: 'Excellent',
      playerTacticalFitScore: 95,
      competitorsAhead,
      tacticalVerdict: `You are already the undisputed Starting XI pillar at ${mySubPos} for ${currentTeam.name}.`,
    };

    return {
      outcomeType: 'first_team_starter',
      headline: 'Undisputed Starting XI Pillar! 🏆',
      coachStatement: `"You are already our first-choice starter at ${mySubPos}. Your position in the starting lineup is completely secure."`,
      managerDebrief: `Coach confirmed your untouchable starting status for ${currentTeam.name}.`,
      previousSquad: currentSquad || 'First Team',
      newSquad: 'First Team',
      previousRole: currentRole || 'First Team Starter',
      newRole: 'First Team Starter',
      evaluation,
      chemistryDelta: 10,
    };
  }

  // -------------------------------------------------------------
  // RULE: Check if a starter in an obtainable position has a LOWER rating than the player!
  // "or if a starter has less rating than you and is a position you can learn, then you may trigger the learn position event and if you learn that position and get enough tier you may become a starter in other position"
  // -------------------------------------------------------------
  const existingPositions = new Set(
    ensurePlayerPositions(player).map((p) => p.subPosition.toUpperCase().trim())
  );
  const isPro = isProfessionalPlayer(player);

  interface WeakStarterOpportunity {
    starter: PlayerCardData;
    targetCat: string;
    targetSub: string;
    targetOvr: number;
    gap: number; // playerOvr - starterOvr
  }

  const weakStarterOpps: WeakStarterOpportunity[] = [];

  for (const starter of firstTeamStarters) {
    if (!starter || starter.id === player.id) continue;
    const sSub = (starter.subPosition || starter.position || '').toUpperCase().trim();
    const sCat = (starter.position || 'MID').toUpperCase().trim();
    const sOvr = Math.max(40, starter.ovr || starter.overallRating || 70);

    if (sSub === 'GK' || sCat === 'GK' || mySubPos === 'GK' || myPos === 'GK') continue;
    if (existingPositions.has(sSub)) continue;
    if (!isPositionCompatibleForPlayer(myPos, mySubPos, sCat, sSub)) continue;

    // Advanced positions restriction if not pro
    if (!isPro && isAdvancedPosition(sSub)) continue;

    // Starter must have LESS rating than the player!
    if (playerOvr > sOvr) {
      weakStarterOpps.push({
        starter,
        targetCat: sCat,
        targetSub: sSub,
        targetOvr: sOvr,
        gap: playerOvr - sOvr,
      });
    }
  }

  if (weakStarterOpps.length > 0) {
    // Sort by largest gap (lowest starter OVR = greatest opportunity)
    weakStarterOpps.sort((a, b) => b.gap - a.gap);
    const bestOpp = weakStarterOpps[0];
    const playStyle = getDefaultPlayStyleForSubPos(bestOpp.targetSub);

    const competitorsAhead = [
      toCompetitorProfile(bestOpp.starter, `Current Starting ${bestOpp.targetSub}`),
      ...filterSamePosition(firstTeamStarters).map((s) => toCompetitorProfile(s, `Starting ${mySubPos} (Ahead of You)`)),
    ];

    const evaluation: ManagerTacticalEvaluation = {
      playerOvr,
      playerPotential,
      playerAge: age,
      playerForm: 'Good',
      playerTacticalFitScore: 86,
      competitorsAhead,
      tacticalVerdict: `While starting ${mySubPos} is occupied, starting ${bestOpp.targetSub} ${bestOpp.starter.name} is rated ${bestOpp.targetOvr} OVR. You (${playerOvr} OVR) can claim that starting spot by learning the position.`,
    };

    return {
      outcomeType: 'suggest_learn_position',
      headline: `Tactical Opportunity: Learn ${bestOpp.targetSub}! 🔄`,
      coachStatement: `"Our starting ${mySubPos} spot is currently blocked, but ${bestOpp.starter.name} (${bestOpp.targetOvr} OVR) at ${bestOpp.targetSub} is performing below your level. If you learn ${bestOpp.targetSub} and gain enough mastery tier, you can become our starter there!"`,
      managerDebrief: `Agent unlocked a tactical route to the Starting XI: your ${playerOvr} OVR is higher than starting ${bestOpp.targetSub} ${bestOpp.starter.name} (${bestOpp.targetOvr} OVR). Adopt this position to start playing every week.`,
      previousSquad: currentSquad,
      newSquad: currentSquad,
      previousRole: currentRole,
      newRole: `Learning ${bestOpp.targetSub}`,
      evaluation,
      chemistryDelta: 10,
      learnPositionProposal: {
        position: bestOpp.targetCat,
        subPosition: bestOpp.targetSub,
        playStyle,
        starterName: bestOpp.starter.name,
        starterOvr: bestOpp.targetOvr,
        explanation: `With your quality (${playerOvr} OVR) surpassing starting ${bestOpp.targetSub} ${bestOpp.starter.name} (${bestOpp.targetOvr} OVR), learning this position opens an immediate path into the Starting XI.`,
      },
    };
  }

  // -------------------------------------------------------------
  // Default fallback if player is not ready and no weak starter to target
  // -------------------------------------------------------------
  const fallbackCompetitor = filterSamePosition(allFirstTeam)[0] || allFirstTeam[0] || ({
    name: `${currentTeam.name} Starter`,
    position: myPos,
    subPosition: mySubPos,
    ovr: playerOvr + 4,
    potential: playerPotential,
    age: 26,
    playStyle: 'Tactical Anchor',
    form: 'Solid',
    status: 'Established Starter',
  } as any);

  const competitorsAhead = [toCompetitorProfile(fallbackCompetitor, 'Ahead in Depth Chart')];
  const evaluation: ManagerTacticalEvaluation = {
    playerOvr,
    playerPotential,
    playerAge: age,
    playerForm: 'Developing',
    playerTacticalFitScore: 78,
    competitorsAhead,
    tacticalVerdict: `Agent evaluated competition at ${currentTeam.name}. ${fallbackCompetitor.name} (${fallbackCompetitor.ovr} OVR) is currently too far ahead.`,
  };

  if (isAtFirstTeam) {
    return {
      outcomeType: 'season_loan_move',
      headline: 'Guaranteed Starting Role Loan Arranged 🔄',
      coachStatement: `"You need regular match minutes that we cannot guarantee right now with ${fallbackCompetitor.name} starting. We have secured a 1-year loan move where you will start every week."`,
      managerDebrief: `Agent arranged a loan move with an affiliate club to guarantee weekly competitive minutes.`,
      previousSquad: currentSquad,
      newSquad: `${currentSquad} (On Loan)`,
      previousRole: currentRole,
      newRole: 'Loan Starter',
      loanClub: {
        name: `${currentTeam.name} Affiliate B`,
        league: 'National Second Division',
        country: player.clubCountry || 'Domestic',
        guaranteedRole: 'Starting XI Pillar',
      },
      evaluation,
      chemistryDelta: 6,
    };
  }

  return {
    outcomeType: 'development_plan',
    headline: 'Individual Training Focus Assigned 📈',
    coachStatement: `"You are developing well, but ${fallbackCompetitor.name} (${fallbackCompetitor.ovr} OVR) still holds the edge. We are setting up an intensive training plan to close the gap."`,
    managerDebrief: `Agent and coaching staff agreed on an accelerated development plan to prepare you for the next squad promotion.`,
    previousSquad: currentSquad,
    newSquad: currentSquad,
    previousRole: currentRole,
    newRole: 'Development Plan Focus',
    evaluation,
    chemistryDelta: 5,
  };
}

// ========================================================================
// 8. YOUTH PRO OFFERS & ACADEMY TRANSFERS
// ========================================================================

export interface YouthProOffer {
  id: string;
  clubName: string;
  leagueName: string;
  countryName: string;
  countryFlag: string;
  leagueTier: number;
  weeklyWage: number;
  yearlySalary: number;
  contractYears: number;
  signingBonus: number;
  squadDestination: 'First Team' | 'Reserves';
  expectedRole: 'First Team Starter' | 'Rotation Player' | 'Reserves Prospect';
  managerReview: string;
}

export interface TopYouthAcademyOffer {
  id: string;
  name: string;
  youthLeague: string;
  city: string;
  country: string;
  countryFlag: string;
  ovr: number;
  leagueStanding: string;
  academyTier: string;
  developmentPerk: string;
  managerPitch: string;
}

export function generateYouthProFastTrackOffers(
  player: PlayerCardData,
  agent?: AgentState
): YouthProOffer[] {
  if ((player.age || 10) < 16) return [];

  const ovr = player.ovr || 50;
  const potential = player.potentialOvr || 78;
  const network = getAgentNetworkSkill(agent);

  const clubs = [...PRO_CLUBS_DATABASE].sort(() => 0.5 - Math.random()).slice(0, 3);

  return clubs.map((club, idx) => {
    const isTier1 = club.leagueTier === 1;
    const baseSalary = 45000 + (ovr - 45) * 2500 + (network * 300);
    const yearlySalary = Math.round((baseSalary * (isTier1 ? 1.5 : 1.1)) / 1000) * 1000;
    const weeklyWage = Math.round(yearlySalary / 52);
    const signingBonus = Math.round(yearlySalary * 0.10);
    const isFirstTeam = ovr >= 60 || (potential >= 88 && network >= 60);

    return {
      id: `youth-pro-${club.id}-${idx}`,
      clubName: club.clubName,
      leagueName: club.leagueName,
      countryName: club.countryName,
      countryFlag: '⚽',
      leagueTier: club.leagueTier,
      weeklyWage,
      yearlySalary,
      contractYears: 3,
      signingBonus,
      squadDestination: isFirstTeam ? 'First Team' : 'Reserves',
      expectedRole: isFirstTeam ? 'First Team Starter' : 'Reserves Prospect',
      managerReview: `${agent?.name || 'Agent'} showcased your youth tape to ${club.clubName}'s Chief Scout, securing a direct 3-year professional contract offer!`,
    };
  });
}

export function generateTopYouthAcademyOffers(
  player: PlayerCardData,
  agent?: AgentState
): TopYouthAcademyOffer[] {
  const currentClub = (player.club || '').toLowerCase();
  const offers: TopYouthAcademyOffer[] = [];

  Object.values(YOUTH_LEAGUES_DATABASE).forEach((league) => {
    const sortedTeams = [...league.teams].sort((a, b) => b.ovr - a.ovr);
    const top2 = sortedTeams.slice(0, 2);

    top2.forEach((team, idx) => {
      if (team.name.toLowerCase() !== currentClub) {
        offers.push({
          id: `top-youth-${team.id}`,
          name: team.name,
          youthLeague: league.name,
          city: league.city,
          country: league.country,
          countryFlag: league.flag || '🌍',
          ovr: team.ovr,
          leagueStanding: idx === 0 ? 'Rank #1 (Title Contenders)' : 'Rank #2 (Elite Academy)',
          academyTier: team.ovr >= 50 ? 'Tier 1 Elite' : 'Tier 1 Prime',
          developmentPerk: '🏆 Top Tier Youth Development Facility',
          managerPitch: `${agent?.name || 'Your Agent'} leveraged his contacts to secure an immediate transfer to ${team.name} in ${league.city}, placing you into a championship-caliber academy!`,
        });
      }
    });
  });

  return offers.sort(() => 0.5 - Math.random()).slice(0, 3);
}

// ========================================================================
// 9. INCOMING OFFER NEGOTIATIONS WITH CLUBS
// ========================================================================

export interface ManagerNegotiationDetails {
  outcome: 'success' | 'partial' | 'dropped';
  successProbability: number;
  partialProbability: number;
  dropProbability: number;
  oldSalary: number;
  newSalary: number;
  oldWeeklyWage: number;
  newWeeklyWage: number;
  oldContractYears: number;
  newContractYears: number;
  oldRole: string;
  newRole: string;
  oldSquad: string;
  newSquad: string;
  percentageIncrease: number;
  managerPitch: string;
  clubResponse: string;
}

export function negotiateOfferWithClub(
  offer: {
    yearlySalary?: number;
    weeklyWage?: number;
    contractYears?: number;
    squadRole?: string;
    expectedRole?: string;
    initialSquadDestination?: string;
    proposedSquad?: string;
    countryCode?: string;
    countryName?: string;
    clubName?: string;
  },
  player: {
    ovr?: number;
    potentialOvr?: number;
    fame?: number;
    position?: string;
    subPosition?: string;
  },
  agent?: AgentState
): ManagerNegotiationDetails {
  const negotiationSkill = getAgentNegotiationSkill(agent);
  const ovr = player.ovr ?? 65;
  const fame = player.fame ?? 0;
  const potential = player.potentialOvr ?? 78;

  const isSaudi =
    offer.countryCode === 'KSA' ||
    offer.countryCode === 'SAU' ||
    (offer.countryName || '').toLowerCase().includes('saudi');

  let baseSuccess = 25 + Math.round((negotiationSkill / 100) * 35);
  if (ovr >= 85) baseSuccess += 16;
  else if (ovr >= 76) baseSuccess += 8;
  if (fame >= 300) baseSuccess += 14;
  if (potential >= 90) baseSuccess += 8;
  if (isSaudi) baseSuccess += 12;

  const successProbability = Math.min(88, Math.max(15, baseSuccess));
  let dropProb = 18;
  if (negotiationSkill >= 75) dropProb = 6;
  else if (negotiationSkill >= 50) dropProb = 12;
  else if (negotiationSkill < 35) dropProb = 25;

  const dropProbability = Math.max(5, Math.min(30, dropProb));
  const partialProbability = Math.max(10, 100 - successProbability - dropProbability);

  const roll = Math.random() * 100;
  const oldSalary = offer.yearlySalary || ((offer.weeklyWage || 40000) * 52);
  const oldWeeklyWage = offer.weeklyWage || Math.round(oldSalary / 52);
  const oldContractYears = offer.contractYears || 3;
  const oldRole = offer.expectedRole || offer.squadRole || 'Rotation Player';
  const oldSquad = offer.initialSquadDestination || offer.proposedSquad || 'First Team';

  if (roll <= successProbability) {
    const pctBoost = isSaudi
      ? 35 + Math.floor(Math.random() * 25)
      : 20 + Math.floor(Math.random() * 18);
    const newSalary = Math.round(oldSalary * (1 + pctBoost / 100));
    const newWeeklyWage = Math.round(newSalary / 52);
    const newContractYears = Math.min(5, Math.max(oldContractYears, oldContractYears + 1));
    const newRole = ovr >= 80 ? 'Key Player' : 'Starter';

    return {
      outcome: 'success',
      successProbability,
      partialProbability,
      dropProbability,
      oldSalary,
      newSalary,
      oldWeeklyWage,
      newWeeklyWage,
      oldContractYears,
      newContractYears,
      oldRole,
      newRole,
      oldSquad,
      newSquad: 'First Team',
      percentageIncrease: pctBoost,
      managerPitch: `${agent?.name || 'Agent'} presented a comprehensive market analysis demonstrating your high potential and starting impact.`,
      clubResponse: `The board of ${offer.clubName || 'the club'} agreed to all requests! They approved a +${pctBoost}% wage increase, guaranteed a Starting 11 role, and extended the contract.`,
    };
  } else if (roll <= successProbability + partialProbability) {
    const pctBoost = 10 + Math.floor(Math.random() * 8);
    const newSalary = Math.round(oldSalary * (1 + pctBoost / 100));
    const newWeeklyWage = Math.round(newSalary / 52);

    return {
      outcome: 'partial',
      successProbability,
      partialProbability,
      dropProbability,
      oldSalary,
      newSalary,
      oldWeeklyWage,
      newWeeklyWage,
      oldContractYears,
      newContractYears: oldContractYears,
      oldRole,
      newRole: oldRole,
      oldSquad,
      newSquad: oldSquad,
      percentageIncrease: pctBoost,
      managerPitch: `${agent?.name || 'Agent'} pushed for higher compensation and increased squad status.`,
      clubResponse: `${offer.clubName || 'The club'} resisted role changes but agreed to a +${pctBoost}% wage increase to seal the agreement.`,
    };
  } else {
    return {
      outcome: 'dropped',
      successProbability,
      partialProbability,
      dropProbability,
      oldSalary,
      newSalary: oldSalary,
      oldWeeklyWage,
      newWeeklyWage: oldWeeklyWage,
      oldContractYears,
      newContractYears: oldContractYears,
      oldRole,
      newRole: oldRole,
      oldSquad,
      newSquad: oldSquad,
      percentageIncrease: 0,
      managerPitch: `${agent?.name || 'Agent'} pushed hard on salary enhancements.`,
      clubResponse: `The board of ${offer.clubName || 'the club'} considered the demands unreasonable given squad hierarchy and withdrew their offer!`,
    };
  }
}

/**
 * Calculates Pre-Season Agent Offer Chance:
 * Exactly 1% at 0 fame, scaling up like tryouts rate with fame & potential.
 */
export function calculatePreseasonManagerOfferRate(player: PlayerCardData): {
  chancePercent: number;
  rollSuccess: boolean;
  formattedRate: string;
} {
  const fame = Math.max(0, player.fame || 0);

  let chancePercent = 1.0;
  if (fame <= 0) {
    chancePercent = 1.0;
  } else if (fame < 10) {
    // 0 to 10 Fame scales linearly from 1.0% to 30.0%
    chancePercent = 1.0 + fame * (29.0 / 10.0);
  } else if (fame < 100) {
    // 10 to 100 Fame scales linearly from 30.0% to 100.0%
    chancePercent = 30.0 + (fame - 10) * (70.0 / 90.0);
  } else {
    // 100+ Fame is 100%
    chancePercent = 100.0;
  }

  // Ensure bounded between 1.0% and 100.0% and rounded to 1 decimal place
  chancePercent = Math.min(100.0, Math.max(1.0, Math.round(chancePercent * 10) / 10));

  // ABSOLUTE PROBABILITY RULE: 100% = guaranteed success.
  const roll = Math.random() * 100;
  const rollSuccess = chancePercent >= 100.0 ? true : roll <= chancePercent;

  return {
    chancePercent,
    rollSuccess,
    formattedRate: `${chancePercent.toFixed(1)}%`,
  };
}

export function generateShadyPreseasonProposition(player: PlayerCardData): ShadyProposition | null {
  const roll = Math.random() * 100;
  if (roll > 20) return null;

  const scenarios: ShadyProposition[] = [
    {
      id: `shady-prop-${Date.now()}-1`,
      title: 'The Yellow Card Syndicate',
      scenario: 'High-Stakes Asian Betting Market',
      requestType: 'yellow_card',
      description: 'My overseas partners need a guaranteed booking in the first 20 minutes of your upcoming season opener. One reckless tackle gets the job done.',
      actionInstruction: 'Commit a deliberate tactical foul or argue with the referee to pick up an intentional yellow card in Match #1.',
      cashReward: 1000000,
      promisedClubBonus: 'Guaranteed Mega Transfer Link Next Window',
      investigationRiskPct: 25,
      sanctionFine: 250000,
      matchBanWeeks: 4,
      reputationPenalty: 25,
    },
  ];

  return scenarios[0];
}

export function resolveShadyProposition(
  proposition: ShadyProposition,
  accepted: boolean,
  player: PlayerCardData,
  accounting?: AccountingState
): {
  updatedPlayer: PlayerCardData;
  updatedAccounting: AccountingState;
  sanctioned: boolean;
  resultHeadline: string;
  resultNarrative: string;
  cashRewardEarned: number;
  fineIncurred: number;
} {
  let updatedAccounting: AccountingState = accounting
    ? { ...accounting }
    : {
        contractYears: 3,
        yearlySalary: 200000,
        sponsors: [],
        sanctions: [],
        businesses: [],
        totalSavings: 0,
      };

  let updatedPlayer: PlayerCardData = { ...player };

  if (!accepted) {
    return {
      updatedPlayer,
      updatedAccounting,
      sanctioned: false,
      resultHeadline: 'PROPOSITION REJECTED: Clean Integrity Maintained! 🛡️',
      resultNarrative: `You told your agent that you play with honor and will never manipulate matches.`,
      cashRewardEarned: 0,
      fineIncurred: 0,
    };
  }

  const currentSavings = updatedAccounting.totalSavings || 0;
  const newSavings = currentSavings + proposition.cashReward;
  updatedAccounting.totalSavings = newSavings;

  const investRoll = Math.random() * 100;
  const isBusted = investRoll <= proposition.investigationRiskPct;

  if (isBusted) {
    const updatedSanctions = [
      ...(updatedAccounting.sanctions || []),
      {
        id: `sanction-${Date.now()}`,
        reason: `FA Betting & Match Integrity Violation (${proposition.title})`,
        amount: proposition.sanctionFine,
        category: 'discipline' as const,
        date: new Date().toISOString().split('T')[0],
      },
    ];

    updatedAccounting.sanctions = updatedSanctions;
    updatedAccounting.totalSavings = Math.max(0, newSavings - proposition.sanctionFine);

    const newBadRep = (updatedPlayer.badReputation || 0) + proposition.reputationPenalty;
    updatedPlayer.badReputation = newBadRep;
    updatedPlayer.isInjured = true;
    updatedPlayer.injuryWeeksRemaining = proposition.matchBanWeeks;
    updatedPlayer.injuryName = `FA Disciplinary Suspension (${proposition.matchBanWeeks} Weeks)`;

    return {
      updatedPlayer,
      updatedAccounting,
      sanctioned: true,
      resultHeadline: 'BUSTED BY INTEGRITY COMMITTEE! 🚨',
      resultNarrative: `You accepted the €${proposition.cashReward.toLocaleString()} cash payout, but unusual betting patterns triggered an FA probe. You received a €${proposition.sanctionFine.toLocaleString()} fine and a ${proposition.matchBanWeeks}-week match ban!`,
      cashRewardEarned: proposition.cashReward,
      fineIncurred: proposition.sanctionFine,
    };
  } else {
    return {
      updatedPlayer,
      updatedAccounting,
      sanctioned: false,
      resultHeadline: 'SCHEME EXECUTED CLEANLY! 💰💶',
      resultNarrative: `The match incident unfolded flawlessly. Your agent transferred €${proposition.cashReward.toLocaleString()} into your accounts!`,
      cashRewardEarned: proposition.cashReward,
      fineIncurred: 0,
    };
  }
}
