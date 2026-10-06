import { PlayerCardData, AccountingState } from '../types';
import { PRO_CLUBS_DATABASE, ProClubDefinition } from './earlyCareerSystem';
import { calculateRealisticPlayerMarketValue, formatCurrencyEuro, checkTransferAffordability, createFallbackClubFinances } from './clubEconomySystem';
import {
  evaluateClubInterest,
  getClubCompetitiveTier,
  CLUB_COMPETITIVE_TIERS,
  ClubCompetitiveTierNumber,
  ClubTierInfo,
  ClubInterestEvaluation,
  resolvePlayerSubPosition,
  estimateClubStarterOvr,
} from './clubRankingSystem';
import { cleanTeamName } from './matchImportanceSystem';
import { isSpecialClubOfferExcluded } from './specialClubInterestSystem';

export interface MarketValueBreakdown {
  marketValue: number;
  formattedValue: string;
  ovrWeight: number; // percentage e.g. 70
  potentialWeight: number; // percentage e.g. 30
  weightedAbilityScore: number;
  baseValue: number;
  fameMultiplier: number;
  contractLengthMultiplier: number;
  badRepMultiplier: number;
}

export interface TransferNegotiationResult {
  marketValue: number;
  buyerClubName: string;
  buyerTransferCapacity: number;
  sellingClubName: string;
  sellingClubImportance: 'Squad Player' | 'Rotation Player' | 'Starter' | 'Key Player' | 'Club Star';
  importanceMultiplier: number;
  estimatedReplacementCost: number;
  contractYearsRemaining: number;
  contractLeverageMultiplier: number;
  competingBidsCount: number;
  competingBidsMultiplier: number;
  askingPrice: number;
  finalNegotiatedFee: number;
  formattedFinalFee: string;
  negotiationOutcome: 'accepted' | 'rejected_price_too_high' | 'rejected_vital_player';
  explanationText: string;
  isFreeAgent?: boolean;
}

export interface ClubTransferOffer {
  id: string;
  buyerClub: ProClubDefinition;
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
  playerTransferFeeCutPercent?: number; // 5% - 10%
  playerTransferFeeCutAmount?: number;
  releaseClause?: number;
  isReleaseClausePaid?: boolean;
  proposedSquad: 'First Team' | 'Reserves' | 'U20' | 'U17';
  expectedRole: 'Starter' | 'Rotation Player' | 'Develop With Reserves' | 'Youth Team' | 'Key Player';
  isExpiringContractMove?: boolean;
  isFreeAgentMove?: boolean;
  isClubDistressSale?: boolean;
  clubDistressMessage?: string;
  isSaudiMegaOffer?: boolean;
  isBenchRaidTransfer?: boolean;
}

/**
 * 1. PROGRESSIVE MARKET VALUE CALCULATOR
 * Formula rules:
 * - Age <= 18: Potential 50%, OVR 50%
 * - Age 19-21: Potential 40%, OVR 60%
 * - Age 22-24: Potential 30%, OVR 70%
 * - Age 25-29 (Prime): Potential 15%, OVR 85%
 * - Age 30+: Potential 5%, OVR 95%
 *
 * - Continuous Nonlinear Fame Multiplier:
 *   - Very Low Fame (<10): Heavily suppressed (0.20 to 0.35 multiplier)
 *   - Fame 10-50: 0.40 - 0.75
 *   - Fame 50-200: 0.80 - 1.25
 *   - Fame 200-500: 1.30 - 1.80
 *   - Fame 500-1000+: Continuous smooth growth beyond 500 without hard cap! (e.g. 1.80 + (Fame - 500) * 0.0015)
 */
export function calculatePlayerMarketValue(player: Partial<PlayerCardData> & { contractYearsRemaining?: number; accounting?: AccountingState }): MarketValueBreakdown {
  const ovr = player.ovr || 65;
  const potential = player.potentialOvr || 78;
  const age = player.age || 18;
  const fame = player.fame || 0;
  const badRep = player.badReputation || 1;
  const contractYears = (player as any).accounting?.contractYears || player.contractYearsRemaining || 3;

  // 1. Determine Progressive Age Weighting between OVR & Potential
  let potWeight = 0.50;
  let ovrWeight = 0.50;

  if (age <= 18) {
    potWeight = 0.50;
    ovrWeight = 0.50;
  } else if (age <= 21) {
    potWeight = 0.40;
    ovrWeight = 0.60;
  } else if (age <= 24) {
    potWeight = 0.28;
    ovrWeight = 0.72;
  } else if (age <= 29) {
    potWeight = 0.15;
    ovrWeight = 0.85;
  } else {
    potWeight = 0.05;
    ovrWeight = 0.95;
  }

  const weightedAbilityScore = ovr * ovrWeight + potential * potWeight;

  // 2. Base Exponential Ability Value Calculation
  // Exponential scaling so higher ratings command elite transfer values
  let baseValue = Math.pow(1.16, weightedAbilityScore - 45) * 85000;
  if (weightedAbilityScore < 50) baseValue = 100000 + (weightedAbilityScore - 40) * 20000;

  // 3. Continuous Nonlinear Fame Multiplier
  let fameMultiplier = 1.0;
  if (fame < 10) {
    // Very low Fame: heavily suppressed! (e.g., 99 OVR / 1 Fame is suppressed)
    fameMultiplier = 0.20 + (fame / 10) * 0.15; // 0.20 to 0.35
  } else if (fame <= 50) {
    fameMultiplier = 0.35 + ((fame - 10) / 40) * 0.40; // 0.35 to 0.75
  } else if (fame <= 200) {
    fameMultiplier = 0.75 + ((fame - 50) / 150) * 0.50; // 0.75 to 1.25
  } else if (fame <= 500) {
    fameMultiplier = 1.25 + ((fame - 200) / 300) * 0.55; // 1.25 to 1.80
  } else {
    // Continuous smooth growth for 500+ Fame up to 1000+ without artificial cap!
    fameMultiplier = 1.80 + (fame - 500) * 0.0016; // 500 Fame = 1.80x, 1000 Fame = 2.60x
  }

  // 4. Contract Length Multiplier
  let contractLengthMultiplier = 1.0;
  if (contractYears >= 4) contractLengthMultiplier = 1.20;
  else if (contractYears === 3) contractLengthMultiplier = 1.10;
  else if (contractYears === 2) contractLengthMultiplier = 1.00;
  else if (contractYears === 1) contractLengthMultiplier = 0.75;
  else contractLengthMultiplier = 0.50; // Expiring (<1 yr)

  // 5. Bad Reputation Penalty
  let badRepMultiplier = 1.0;
  if (badRep >= 50) badRepMultiplier = 0.70;
  else if (badRep >= 25) badRepMultiplier = 0.85;

  const rawMarketValue = baseValue * fameMultiplier * contractLengthMultiplier * badRepMultiplier;
  const marketValue = Math.max(250000, Math.round(rawMarketValue / 50000) * 50000);

  return {
    marketValue,
    formattedValue: formatEuroCurrency(marketValue),
    ovrWeight: Math.round(ovrWeight * 100),
    potentialWeight: Math.round(potWeight * 100),
    weightedAbilityScore: Math.round(weightedAbilityScore * 10) / 10,
    baseValue: Math.round(baseValue),
    fameMultiplier: Math.round(fameMultiplier * 100) / 100,
    contractLengthMultiplier,
    badRepMultiplier,
  };
}

/**
 * Formats a raw number to clean Euro currency string e.g. "€45,000,000" or "€45M"
 */
export function formatEuroCurrency(amount: number): string {
  if (amount >= 1000000) {
    const m = (amount / 1000000).toFixed(1);
    return `€${m.endsWith('.0') ? m.slice(0, -2) : m}M`;
  } else if (amount >= 1000) {
    const k = (amount / 1000).toFixed(0);
    return `€${k}K`;
  }
  return `€${amount.toLocaleString()}`;
}

/**
 * 2. SELLING CLUB IMPORTANCE CALCULATOR
 */
export function getSellingClubImportance(
  player: Partial<PlayerCardData>
): {
  importance: 'Squad Player' | 'Rotation Player' | 'Starter' | 'Key Player' | 'Club Star';
  multiplier: number;
} {
  const ovr = player.ovr || 65;
  const fame = player.fame || 0;

  if (ovr >= 85 || fame >= 300) {
    return { importance: 'Club Star', multiplier: 2.0 };
  } else if (ovr >= 80 || fame >= 150) {
    return { importance: 'Key Player', multiplier: 1.6 };
  } else if (ovr >= 74 || fame >= 50) {
    return { importance: 'Starter', multiplier: 1.3 };
  } else if (ovr >= 68) {
    return { importance: 'Rotation Player', multiplier: 1.1 };
  } else {
    return { importance: 'Squad Player', multiplier: 0.9 };
  }
}

/**
 * 3. ESTIMATES SELLING CLUB REPLACEMENT COST
 * Evaluates how difficult and expensive it would be to find a replacement player
 * with similar OVR, Potential, and Position.
 */
export function calculateReplacementCost(player: Partial<PlayerCardData>): number {
  const mv = calculatePlayerMarketValue(player).marketValue;
  const ovr = player.ovr || 65;
  const potential = player.potentialOvr || 78;
  const pos = player.position || 'ST';

  let rarityFactor = 1.25; // Rarity in market
  if (['ST', 'CAM', 'CB', 'GK'].includes(pos)) rarityFactor = 1.35;

  if (potential >= 92) rarityFactor *= 1.30;
  else if (potential >= 88) rarityFactor *= 1.15;

  if (ovr >= 82) rarityFactor *= 1.25;

  return Math.round(mv * rarityFactor);
}

/**
 * 4. FULL TRANSFER NEGOTIATION SIMULATOR
 * Combines Market Value, Buyer Financial Capacity, Replacement Cost,
 * Selling Club Importance, Contract Leverage, and Competing Bids.
 */
export function simulateTransferNegotiation(
  player: Partial<PlayerCardData>,
  buyerClub: ProClubDefinition,
  competingBidsCount: number = 1
): TransferNegotiationResult {
  const { marketValue } = calculatePlayerMarketValue(player);
  const { importance, multiplier: importanceMultiplier } = getSellingClubImportance(player);
  const replacementCost = calculateReplacementCost(player);
  const contractYears = (player as any).accounting?.contractYears ?? (player as any).contractYearsRemaining ?? 3;
  const isFreeAgent = contractYears <= 0;

  // Contract Leverage Factor:
  // 4+ yrs: 1.35x, 3 yrs: 1.20x, 2 yrs: 1.00x, 1 yr: 0.70x, Free Agent (0 yrs): 0x
  let contractLeverageMultiplier = 1.0;
  if (isFreeAgent) {
    contractLeverageMultiplier = 0.0;
  } else if (contractYears >= 4) {
    contractLeverageMultiplier = 1.35;
  } else if (contractYears === 3) {
    contractLeverageMultiplier = 1.20;
  } else if (contractYears === 2) {
    contractLeverageMultiplier = 1.00;
  } else if (contractYears === 1) {
    contractLeverageMultiplier = 0.70;
  }

  // Competing Bids Multiplier: Multiple clubs drive asking price up
  let competingBidsMultiplier = 1.0;
  if (!isFreeAgent) {
    if (competingBidsCount >= 3) competingBidsMultiplier = 1.35;
    else if (competingBidsCount === 2) competingBidsMultiplier = 1.20;
  }

  // Selling Club Asking Price Formula:
  // MarketValue * Importance * (ReplacementCost/MV)^0.5 * ContractLeverage * CompetingBids
  const replacementRatio = Math.sqrt(replacementCost / Math.max(1, marketValue));
  const rawAskingPrice = isFreeAgent
    ? 0
    : marketValue * importanceMultiplier * replacementRatio * contractLeverageMultiplier * competingBidsMultiplier;
  const askingPrice = Math.round(rawAskingPrice / 100000) * 100000;

  // Buyer Financial Capacity
  // Derived from Club Fame (0-10), financial profile, owner type, and league tier
  const isBuyerSaudi =
    buyerClub.countryCode === 'KSA' ||
    buyerClub.countryCode === 'SAU' ||
    buyerClub.countryName.toLowerCase().includes('saudi') ||
    buyerClub.leagueName.toLowerCase().includes('saudi');

  const buyerFame = typeof buyerClub.clubFame === 'number' ? buyerClub.clubFame : buyerClub.prestigeStars * 2;

  let buyerCapacity = 50000000;
  if (buyerClub.finances?.transferBudget) {
    buyerCapacity = buyerClub.finances.transferBudget;
  } else if (isBuyerSaudi) {
    // Saudi Pro League mega investment capacity scaled by prestige
    buyerCapacity = 90000000 + buyerClub.prestigeStars * 30000000; // €120M - €240M
  } else {
    // Hard ceiling based on Club Fame (0-10) scale
    const fameCapacityMap: Record<number, number> = {
      0: 50000,
      1: 150000,
      2: 400000,
      3: 1500000,
      4: 4000000,
      5: 9000000,
      6: 25000000,
      7: 65000000,
      8: 160000000,
      9: 260000000,
      10: 360000000,
    };
    buyerCapacity = fameCapacityMap[Math.min(10, Math.max(0, Math.round(buyerFame)))] || 15000000;
  }

  // Determine Final Negotiated Transfer Fee
  let finalNegotiatedFee = isFreeAgent ? 0 : Math.min(buyerCapacity, askingPrice);
  if (!isFreeAgent && contractYears === 1 && buyerCapacity < askingPrice) {
    // 1-year contract: selling club accepts lower fee rather than risk free transfer loss
    finalNegotiatedFee = Math.round((marketValue * 0.70) / 100000) * 100000;
  }

  let outcome: TransferNegotiationResult['negotiationOutcome'] = 'accepted';
  let explanation = isFreeAgent
    ? `${buyerClub.clubName} submitted a contract package to sign ${player.name || 'the player'} on a Free Transfer.`
    : `The transfer agreement was finalized between ${player.club || 'Current Club'} and ${buyerClub.clubName} for a fee of ${formatEuroCurrency(finalNegotiatedFee)}.`;

  if (!isFreeAgent && buyerCapacity < askingPrice * 0.65 && contractYears >= 2) {
    outcome = 'rejected_price_too_high';
    explanation = `${buyerClub.clubName} withdrew from negotiations after being unable to meet the ${formatEuroCurrency(askingPrice)} valuation set by ${player.club || 'Current Club'}.`;
  } else if (!isFreeAgent && importance === 'Club Star' && contractYears >= 3 && finalNegotiatedFee < askingPrice * 0.8) {
    outcome = 'rejected_vital_player';
    explanation = `${player.club || 'Current Club'} declared ${player.name || 'the player'} non-transferable as a vital Club Star.`;
  }

  return {
    marketValue,
    buyerClubName: buyerClub.clubName,
    buyerTransferCapacity: buyerCapacity,
    sellingClubName: player.club || 'Current Club',
    sellingClubImportance: importance,
    importanceMultiplier,
    estimatedReplacementCost: replacementCost,
    contractYearsRemaining: contractYears,
    contractLeverageMultiplier,
    competingBidsCount,
    competingBidsMultiplier,
    askingPrice,
    finalNegotiatedFee,
    formattedFinalFee: isFreeAgent ? 'Free Transfer (€0)' : formatEuroCurrency(finalNegotiatedFee),
    negotiationOutcome: outcome,
    explanationText: explanation,
    isFreeAgent,
  };
}

/**
 * Calculates transfer offer relevance score to rank the top 10 most relevant proposals.
 */
export function calculateTransferOfferRelevance(
  offer: ClubTransferOffer,
  player: Partial<PlayerCardData>
): number {
  let score = 0;
  
  // Base interest score contribution (0-100)
  if (offer.interestEvaluation) {
    score += offer.interestEvaluation.interestScore * 1.5;
  }

  // Financial appeal of transfer fee and salary
  score += Math.log10(Math.max(10000, offer.offeredFee || 100000)) * 15;
  score += Math.log10(Math.max(1000, offer.yearlySalary)) * 22;

  // Prestige and role
  score += (offer.buyerClub.prestigeStars || 3) * 8;
  if (offer.expectedRole === 'Starter' || offer.expectedRole === 'Key Player') score += 20;
  if (offer.proposedSquad === 'First Team') score += 15;

  const isSaudi =
    offer.buyerClub.countryCode === 'KSA' ||
    offer.buyerClub.countryCode === 'SAU' ||
    offer.buyerClub.countryName.toLowerCase().includes('saudi') ||
    offer.buyerClub.leagueName.toLowerCase().includes('saudi');

  const ovr = player.ovr || 65;
  const fame = player.fame || 0;
  const isMercenary =
    Boolean(player.activePerkIds?.includes('mercenary')) ||
    (Array.isArray((player as any).perks) && (player as any).perks.includes('mercenary'));

  // Mercenary perk: Lucrative and Saudi clubs gain huge priority, Top European giants hesitate slightly
  if (isMercenary && isSaudi) {
    score += 80;
  } else if (isMercenary && !isSaudi && (offer.buyerClub.prestigeStars || 3) >= 4.5) {
    score -= 30;
  }

  // Saudi mega contract boost when player is high fame / high ovr
  if (isSaudi && (fame >= 300 || ovr >= 85 || isMercenary)) {
    score += 75;
  }

  return score;
}

/**
 * 5. RUNS CAREER TRANSFER MARKET SCAN
 * Scans for interested buyer clubs during Career Mode transfer windows.
 * Evaluates OVR, Sub-position, Current Starter OVR, Club Competitive Tier (1-12),
 * Arabian League Exception, and Financial Affordability.
 * Returns up to the top 10 most relevant transfer offers.
 */
export function scanCareerTransferMarket(
  player: Partial<PlayerCardData>
): ClubTransferOffer[] {
  const currentClubName = (player.club || '').toLowerCase();
  const ovr = player.ovr || 65;
  const fame = player.fame || 0;
  const subPos = resolvePlayerSubPosition(player);
  const contractYears = (player as any).accounting?.contractYears ?? (player as any).contractYearsRemaining ?? 3;
  const isFreeAgent = contractYears <= 0 || player.isFreeAgent;
  const isMercenary =
    Boolean(player.activePerkIds?.includes('mercenary')) ||
    (Array.isArray((player as any).perks) && (player as any).perks.includes('mercenary'));
  const hasReleaseClause = Boolean((player as any).accounting?.releaseClause && (player as any).accounting.releaseClause > 0);
  const releaseClauseAmount = (player as any).accounting?.releaseClause || player.releaseClause || 0;

  // Check if current selling club is in financial distress (Fame <= 7 and under strain)
  const isSellingClubDistressed = (player.fame !== undefined) && ((player as any).currentClubFame <= 7 || (!isFreeAgent && ovr >= 78 && Math.random() < 0.35));

  // Filter clubs that are NOT current club, NOT special clubs (zero ordinary leaks), and NOT in betrayed clubs list
  const candidateClubs = PRO_CLUBS_DATABASE.filter((c) => {
    if (isSpecialClubOfferExcluded(c)) return false;
    if (c.clubName.toLowerCase() === currentClubName) return false;
    if (player.betrayedClubs && player.betrayedClubs.length > 0) {
      const cleanCandidate = cleanTeamName(c.clubName);
      const isBetrayed = player.betrayedClubs.some((betrayed) => {
        const cleanB = cleanTeamName(betrayed);
        return cleanB && (cleanB === cleanCandidate || cleanCandidate.includes(cleanB) || cleanB.includes(cleanCandidate));
      });
      if (isBetrayed) return false;
    }
    return true;
  });

  const offers: ClubTransferOffer[] = [];

  for (const buyer of candidateClubs) {
    const isSaudi =
      buyer.countryCode === 'KSA' ||
      buyer.countryCode === 'SAU' ||
      buyer.countryName.toLowerCase().includes('saudi') ||
      buyer.leagueName.toLowerCase().includes('saudi');

    // Run comprehensive Club Interest Evaluation
    const interestEval = evaluateClubInterest(buyer, player, 35);
    
    // Only generate offers if club has at least Strong Interest (score >= 55) or Free Agent eligible
    if (!interestEval.isOfferEligible && !isFreeAgent) {
      continue;
    }

    // If Mercenary perk is active, top European giants (4.5+ stars) are 70% less likely to generate a bid
    if (isMercenary && !isSaudi && buyer.prestigeStars >= 4.5 && Math.random() < 0.70) {
      continue;
    }

    const isExpiringMove = contractYears === 1;
    const negResult = simulateTransferNegotiation(player, buyer, 1);

    if (negResult.negotiationOutcome === 'accepted') {
      let yearlySalary = 0;
      let weeklyWage = 0;

      if (isSaudi) {
        if (ovr >= 85 || fame >= 300) {
          const eliteScale = Math.pow(1.22, Math.max(0, ovr - 84));
          const fameScale = 1 + (Math.min(1000, Math.max(0, fame - 300)) / 300) * 0.8;
          yearlySalary = Math.round(Math.max(35000000, (32000000 + (ovr - 85) * 15000000) * eliteScale * fameScale));
        } else if (ovr >= 80) {
          yearlySalary = Math.round(9000000 + (ovr - 80) * 3000000 + fame * 15000);
        } else {
          yearlySalary = Math.round(1500000 + Math.max(0, ovr - 70) * 450000 + fame * 4000);
        }
      } else {
        // Standard European / Global salary scaled to player quality and Club Fame
        const mvInfo = calculateRealisticPlayerMarketValue(player);
        const baseWeekly = mvInfo.weeklyWageEstimate;
        const buyerFameVal = typeof buyer.clubFame === 'number' ? buyer.clubFame : buyer.prestigeStars * 2;
        const fameWageMultiplier = 0.50 + (buyerFameVal / 10) * 0.70; // 0.5x for Fame 0 up to 1.2x for Fame 10
        weeklyWage = Math.max(300, Math.round(baseWeekly * fameWageMultiplier));
        yearlySalary = weeklyWage * 52;
      }

      // Mercenary perk: +20% to bonuses and contract renewal fees in your favor
      if (isMercenary) {
        yearlySalary = Math.round(yearlySalary * 1.20);
      }

      weeklyWage = Math.round(yearlySalary / 52);

      // Check Release Clause Triggering: If club is tier 1-4 and can pay release clause
      let offeredFee = isFreeAgent ? 0 : negResult.finalNegotiatedFee;
      let isReleaseClausePaid = false;
      if (!isFreeAgent && hasReleaseClause && releaseClauseAmount > 0) {
        if (offeredFee >= releaseClauseAmount * 0.85 || interestEval.classification === 'Aggressive Pursuit') {
          offeredFee = releaseClauseAmount;
          isReleaseClausePaid = true;
        }
      }

      // Calculate Signing Bonus & Player Fee Cut
      let signingBonus = 0;
      let playerTransferFeeCutPercent: number | undefined;
      let playerTransferFeeCutAmount: number | undefined;

      if (isFreeAgent) {
        // Free agent receives boosted signing bonus (no transfer fee paid to selling club)
        signingBonus = Math.round(yearlySalary * 0.35 + ovr * 25000);
      } else {
        signingBonus = Math.round(yearlySalary * (isSaudi ? 0.20 : 0.12));
        // Negotiated player cut of the transfer fee (5% to 10%)
        playerTransferFeeCutPercent = 5 + Math.floor(Math.random() * 6); // 5% to 10%
        playerTransferFeeCutAmount = Math.round(offeredFee * (playerTransferFeeCutPercent / 100));
      }

      if (isMercenary) {
        signingBonus = Math.round(signingBonus * 1.20);
      }

      // Financial sanity check: verify buyer can realistically afford the package
      const buyerFameVal = typeof buyer.clubFame === 'number' ? buyer.clubFame : buyer.prestigeStars * 2;
      const buyerFinances = buyer.finances || createFallbackClubFinances(
        buyerFameVal,
        buyer.countryCode
      );
      const affordCheck = checkTransferAffordability(buyerFinances, offeredFee, weeklyWage, isSaudi ? 3 : 4);
      if (!affordCheck.isAffordable && affordCheck.score < 40 && !interestEval.isSaudiMegaPursuit) {
        continue; // Club cannot realistically afford this deal
      }

      const distressMessage = isSellingClubDistressed && !isFreeAgent
        ? `MESSAGE FROM YOUR CLUB:\n"Hi ${player.name || 'there'}, we need the money. We'll have to sell you. Please check these offers — they can pay us for you."`
        : undefined;

      const proposedReleaseClause = Math.max(5000000, Math.round((negResult.marketValue * 1.7) / 1000000) * 1000000);
      const isStarterUpgrade = interestEval.ovrDifferenceVsStarter >= 1 || (isSaudi && ovr >= 80);

      offers.push({
        id: `transfer-bid-${buyer.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        buyerClub: buyer,
        clubTier: interestEval.clubTier,
        clubTierInfo: interestEval.clubTierInfo,
        interestEvaluation: interestEval,
        starterOvr: interestEval.starterOvr,
        starterComparisonText: `${subPos} Starter: ${interestEval.starterOvr} OVR ➔ You: ${ovr} OVR (${interestEval.ovrDifferenceVsStarter >= 0 ? '+' : ''}${interestEval.ovrDifferenceVsStarter})`,
        offeredFee,
        formattedFee: isFreeAgent
          ? 'Free Transfer (€0)'
          : isReleaseClausePaid
          ? `Buyout Triggered (${formatEuroCurrency(offeredFee)})`
          : formatEuroCurrency(offeredFee),
        weeklyWage,
        yearlySalary,
        contractYears: isSaudi ? 3 : 4,
        signingBonus,
        playerTransferFeeCutPercent,
        playerTransferFeeCutAmount,
        releaseClause: proposedReleaseClause,
        isReleaseClausePaid,
        proposedSquad: isStarterUpgrade || ovr >= 78 ? 'First Team' : ovr >= 68 ? 'Reserves' : 'U20',
        expectedRole: ovr >= 84 ? 'Key Player' : isStarterUpgrade ? 'Starter' : 'Rotation Player',
        isExpiringContractMove: isExpiringMove,
        isFreeAgentMove: isFreeAgent,
        isClubDistressSale: Boolean(distressMessage),
        clubDistressMessage: distressMessage,
        isSaudiMegaOffer: interestEval.isSaudiMegaPursuit,
        isBenchRaidTransfer: interestEval.isBenchRaidOpportunity,
      });
    }
  }

  // Sort by calculated relevance score and return the 10 most relevant transfer offers
  offers.sort((a, b) => calculateTransferOfferRelevance(b, player) - calculateTransferOfferRelevance(a, player));

  return offers.slice(0, 10);
}

/**
 * Checks if a transfer offer originates from a Saudi Pro League club
 */
export function isSaudiClubOffer(
  offer:
    | {
        buyerClub?:
          | ProClubDefinition
          | {
              countryCode?: string;
              countryName?: string;
              leagueName?: string;
              leagueId?: string;
              clubName?: string;
            };
      }
    | null
    | undefined
): boolean {
  if (!offer || !offer.buyerClub) return false;
  const { countryCode, countryName, leagueName, leagueId } = offer.buyerClub as any;
  const cc = (countryCode || '').toUpperCase();
  const cName = (countryName || '').toLowerCase();
  const lName = (leagueName || '').toLowerCase();
  const lId = (leagueId || '').toLowerCase();
  return (
    cc === 'KSA' ||
    cc === 'SAU' ||
    cName.includes('saudi') ||
    cName.includes('arabia') ||
    lName.includes('saudi') ||
    lName.includes('roshn') ||
    lId === 'saudi_d1' ||
    lId === 'sau_l1'
  );
}

