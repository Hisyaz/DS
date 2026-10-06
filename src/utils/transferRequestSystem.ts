import { PlayerConfig, PlayerCardData, AccountingState, ManagerState, Nationality } from '../types';
import {
  UnifiedClubOffer,
  calculateNegotiatedSigningBonus,
  OfferTransferType,
} from './clubOfferSystem';
import {
  ProClubDefinition,
  getProClubsFromDatabase,
  isProfessionalPlayer,
} from './earlyCareerSystem';
import { calculateRealisticPlayerMarketValue } from './clubEconomySystem';
import { isSpecialClubOfferExcluded } from './specialClubInterestSystem';
import { cleanTeamName } from './matchImportanceSystem';
import { getLeagueDatabase, saveLeagueDatabase } from './leagueDatabaseSystem';
import { rebuildPlayerCompetitiveContextOnTransfer } from './clubContextRebuilder';
import {
  YOUTH_LEAGUES_DATABASE,
  YouthTeamData,
  YouthLeagueData,
} from '../data/youthLeaguesDatabase';
import { isSouthAmericanContext } from './seasonCalendarManager';
import { getFootballSchoolForClub } from '../data/youthFootballSchools';
import { getClubDevelopmentTier } from './clubDevelopmentEngine';
import { applyTransferRequestPenalty } from './chemistrySystem';
import { resolvePlayerSubPosition } from './clubRankingSystem';

export interface YouthTransferOffer {
  id: string;
  type: 'youth';
  destinationClub: string;
  destinationLeague: string;
  destinationCity: string;
  destinationCountry: string;
  flag: string;
  ovr: number;
  developmentStyle?: string;
  academyTier: string;
  isInternational: boolean;
  earnedNationalityCountry?: string;
  reason: string;
}

export interface TransferWindowInfo {
  isOpen: boolean;
  windowType: 'summer' | 'winter';
  windowName: string;
  approximateDates: string;
}

export interface TransferRequestPipelineResult {
  success: boolean;
  message: string;
  readyImmediate: boolean;
  windowInfo: TransferWindowInfo;
  updatedPlayer: PlayerCardData;
  youthOffers?: YouthTransferOffer[];
  proOffers?: UnifiedClubOffer[];
  selectedOffer?: UnifiedClubOffer | YouthTransferOffer;
}

export const COUNTRY_TO_NATIONALITY: Record<string, Nationality> = {
  Spain: { code: 'ESP', iso: 'ES', name: 'Spain' },
  England: { code: 'ENG', iso: 'GB', name: 'England' },
  France: { code: 'FRA', iso: 'FR', name: 'France' },
  Germany: { code: 'GER', iso: 'DE', name: 'Germany' },
  Italy: { code: 'ITA', iso: 'IT', name: 'Italy' },
  Portugal: { code: 'POR', iso: 'PT', name: 'Portugal' },
  Argentina: { code: 'ARG', iso: 'AR', name: 'Argentina' },
  Brazil: { code: 'BRA', iso: 'BR', name: 'Brazil' },
  Netherlands: { code: 'NED', iso: 'NL', name: 'Netherlands' },
  Belgium: { code: 'BEL', iso: 'BE', name: 'Belgium' },
};

/**
 * Determines whether a transfer window is currently open for the player's context.
 * Two transfer windows per season:
 * 1. Summer Transfer Window
 * 2. Winter Transfer Window
 */
export function getTransferWindowStatus(
  player: PlayerCardData,
  calendarDate?: string,
  seasonStage?: string
): TransferWindowInfo {
  const isSouthAmerican = isSouthAmericanContext(player);

  // If explicitly given a season stage from dashboard
  if (seasonStage) {
    if (
      seasonStage === 'preseason' ||
      seasonStage === 'draw' ||
      (seasonStage === 'hub' && (!player.totalSeasonMatchesPlayed || player.totalSeasonMatchesPlayed === 0))
    ) {
      return {
        isOpen: true,
        windowType: 'summer',
        windowName: 'Summer Transfer Window',
        approximateDates: isSouthAmerican ? 'January – February' : 'July – August',
      };
    }
    if (seasonStage === 'mid_cards') {
      return {
        isOpen: true,
        windowType: 'winter',
        windowName: 'Winter Transfer Window',
        approximateDates: isSouthAmerican ? 'July – August' : 'January',
      };
    }
  }

  // Parse calendarDate or currentMonth (1-12)
  let month = player.currentMonth;
  if (!month && calendarDate) {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const lower = calendarDate.toLowerCase();
    for (let i = 0; i < months.length; i++) {
      if (lower.includes(months[i])) {
        month = i + 1;
        break;
      }
    }
  }

  if (month) {
    if (!isSouthAmerican) {
      // European season: Summer = July (7), August (8), September (9 early); Winter = January (1)
      if (month === 7 || month === 8) {
        return {
          isOpen: true,
          windowType: 'summer',
          windowName: 'Summer Transfer Window',
          approximateDates: '1 July – 31 August',
        };
      }
      if (month === 1) {
        return {
          isOpen: true,
          windowType: 'winter',
          windowName: 'Winter Transfer Window',
          approximateDates: '1 January – 31 January',
        };
      }
      const isNextWinter = month >= 9 || month === 12;
      return {
        isOpen: false,
        windowType: isNextWinter ? 'winter' : 'summer',
        windowName: isNextWinter ? 'Winter Transfer Window' : 'Summer Transfer Window',
        approximateDates: isNextWinter ? 'Opens 1 January' : 'Opens 1 July',
      };
    } else {
      // South American calendar season: Summer = January (1), February (2); Winter = July (7), August (8)
      if (month === 1 || month === 2) {
        return {
          isOpen: true,
          windowType: 'summer',
          windowName: 'Summer Transfer Window',
          approximateDates: '1 January – 28 February',
        };
      }
      if (month === 7 || month === 8) {
        return {
          isOpen: true,
          windowType: 'winter',
          windowName: 'Winter Transfer Window',
          approximateDates: '1 July – 31 August',
        };
      }
      const isNextWinter = month >= 3 && month <= 6;
      return {
        isOpen: false,
        windowType: isNextWinter ? 'winter' : 'summer',
        windowName: isNextWinter ? 'Winter Transfer Window' : 'Summer Transfer Window',
        approximateDates: isNextWinter ? 'Opens 1 July' : 'Opens 1 January',
      };
    }
  }

  return {
    isOpen: false,
    windowType: 'summer',
    windowName: 'Summer Transfer Window',
    approximateDates: isSouthAmerican ? 'Opens 1 January' : 'Opens 1 July',
  };
}

/**
 * Checks if the player can use Request Transfer right now.
 * Limit: Once per season.
 */
export function canPlayerRequestTransfer(player: PlayerCardData): { canRequest: boolean; reason?: string } {
  if (player.transferRequestUsedThisSeason) {
    return {
      canRequest: false,
      reason: 'You have already used your Transfer Request this season. Recharges automatically at preseason.',
    };
  }
  if ((player.chemistry ?? 50) <= 0) {
    return {
      canRequest: false,
      reason: 'Team Chemistry is already at 0%. You cannot absorb the -30% chemistry transfer penalty.',
    };
  }
  return { canRequest: true };
}

/**
 * YOUTH TRANSFER REQUEST SEARCH (Requirement 3 & 8)
 * Searches for Youth League clubs outside the player's current Youth League.
 * Prioritizes foreign academies in other countries.
 * Does NOT use professional transfer-fee ranking.
 */
export function generateYouthTransferOpportunities(player: PlayerCardData): YouthTransferOffer[] {
  const currentYouthLeague = (player.youthLeagueName || '').toLowerCase();
  const currentTeam = (player.youthTeamName || player.club || '').toLowerCase();
  const playerCountry = (player.nationality?.name || player.country || '').toLowerCase();

  const eligibleLeagues = Object.values(YOUTH_LEAGUES_DATABASE).filter((league) => {
    return league.name.toLowerCase() !== currentYouthLeague;
  });

  const offers: YouthTransferOffer[] = [];

  // Sort leagues to prioritize foreign opportunities
  const sortedLeagues = [...eligibleLeagues].sort((a, b) => {
    const aIsForeign = a.country.toLowerCase() !== playerCountry ? 1 : 0;
    const bIsForeign = b.country.toLowerCase() !== playerCountry ? 1 : 0;
    return bIsForeign - aIsForeign;
  });

  for (const league of sortedLeagues) {
    // Pick top academies from this youth league
    const sortedTeams = [...league.teams].sort((a, b) => b.ovr - a.ovr);
    const candidateTeam = sortedTeams.find((t) => t.name.toLowerCase() !== currentTeam) || sortedTeams[0];
    if (!candidateTeam) continue;

    const isInternational = candidateTeam.country.toLowerCase() !== playerCountry;

    offers.push({
      id: `youth_req_${candidateTeam.id}_${Date.now()}`,
      type: 'youth',
      destinationClub: candidateTeam.name,
      destinationLeague: candidateTeam.youthLeague,
      destinationCity: candidateTeam.city,
      destinationCountry: candidateTeam.country,
      flag: league.flag,
      ovr: candidateTeam.ovr,
      developmentStyle: candidateTeam.developmentStyle,
      academyTier: candidateTeam.ovr >= 48 ? 'Top Tier Youth Academy' : 'Regional Youth Academy',
      isInternational,
      earnedNationalityCountry: isInternational ? candidateTeam.country : undefined,
      reason: isInternational
        ? `🌍 International Youth Pathway: Move to ${candidateTeam.country} to develop in the ${candidateTeam.youthLeague}. Turning 18 here grants ${candidateTeam.country} nationality!`
        : `🌟 Domestic Youth Challenge: Step into ${candidateTeam.name} to train in the ${candidateTeam.youthLeague}.`,
    });

    if (offers.length >= 4) break;
  }

  return offers;
}

/**
 * PROFESSIONAL TRANSFER REQUEST SEARCH (Requirement 4, 5 & 10)
 * Searches eligible professional clubs outside the player's current league.
 * Strictly respects all existing special-event club locks (Zero Leaks).
 * Ranks eligible clubs by HIGHEST TRANSFER FEE offered to the current club!
 * Does NOT rank by player salary.
 */
export function generateProfessionalTransferRequestOffers(
  player: PlayerCardData,
  accounting?: AccountingState,
  manager?: ManagerState
): UnifiedClubOffer[] {
  const allClubs = getProClubsFromDatabase();
  const currentClubName = (player.club || '').toLowerCase();
  const currentLeagueName = cleanTeamName(player.league || '');
  const ovr = player.ovr || 60;
  const fame = player.fame || 0;
  const subPos = resolvePlayerSubPosition(player);
  const baseMv = calculateRealisticPlayerMarketValue(player).marketValue || 1000000;
  const contractDuration = accounting?.contractYears ?? player.contractYearsRemaining ?? 3;

  // 1. Filter eligible destination clubs outside current league
  const candidateClubs = allClubs.filter((c) => {
    // Zero Leaks: Never bypass special club locks (Big 6, Spanish giants, PSG, Bayern, Saudi)
    if (isSpecialClubOfferExcluded(c)) return false;

    // Must be outside current club
    if (c.clubName.toLowerCase() === currentClubName) return false;

    // Must be outside current league
    const destLeague = cleanTeamName(c.leagueName || '');
    if (destLeague && currentLeagueName && destLeague === currentLeagueName) return false;

    // Betrayed clubs permanently refuse to sign or bid
    if (player.betrayedClubs && player.betrayedClubs.length > 0) {
      const cleanCandidate = cleanTeamName(c.clubName);
      const isBetrayed = player.betrayedClubs.some((b) => {
        const cleanB = cleanTeamName(b);
        return cleanB && (cleanB === cleanCandidate || cleanCandidate.includes(cleanB) || cleanB.includes(cleanCandidate));
      });
      if (isBetrayed) return false;
    }

    return true;
  });

  // 2. Score transfer fee offered by buyer club to player's current club
  const evaluatedClubs = candidateClubs
    .map((club) => {
      // Club prestige and financial aggressiveness determine transfer fee bid
      const prestige = club.prestigeStars || 3.0;
      let bidMultiplier = 1.0;
      if (prestige >= 4.5) bidMultiplier = 1.40;
      else if (prestige >= 4.0) bidMultiplier = 1.25;
      else if (prestige >= 3.5) bidMultiplier = 1.12;
      else if (prestige >= 3.0) bidMultiplier = 1.02;
      else bidMultiplier = 0.90;

      // Contract duration impact on transfer fee
      if (contractDuration === 1) {
        bidMultiplier *= 0.70; // 1 year left discount
      } else if (contractDuration >= 4) {
        bidMultiplier *= 1.15; // Locked contract premium
      }

      // Calculate the transfer fee bid offered to current club
      const transferFee = Math.max(500000, Math.round((baseMv * bidMultiplier) / 100000) * 100000);

      // Determine realistic fit for player
      const starterOvr = club.leagueTier === 1 ? (prestige >= 4 ? 82 : 77) : 70;
      const starterDiff = ovr - starterOvr;

      return {
        club,
        transferFee,
        starterOvr,
        starterDiff,
        isEligible: starterDiff >= -8, // Realistic sporting eligibility
      };
    })
    .filter((e) => e.isEligible);

  // 3. RANK STRICTLY BY HIGHEST TRANSFER FEE OFFERED TO CURRENT CLUB (Requirement 4 & 10)
  evaluatedClubs.sort((a, b) => b.transferFee - a.transferFee);

  // Take top bids
  const topBids = evaluatedClubs.slice(0, 4);

  // Build UnifiedClubOffer objects
  return topBids.map(({ club, transferFee, starterDiff }, idx) => {
    const clubFameVal = typeof club.clubFame === 'number' ? club.clubFame : (club.prestigeStars || 3) * 2;
    const devTier = getClubDevelopmentTier(club.clubName, club.leagueName, club.countryName, clubFameVal);

    // Determine proposed squad & role
    let proposedSquad: 'First Team' | 'Reserves' | 'U20' = 'First Team';
    let expectedRole: 'Starter' | 'Rotation Player' | 'Key Player' | 'Young Prospect' = 'Rotation Player';

    if (starterDiff >= 3) {
      proposedSquad = 'First Team';
      expectedRole = ovr >= 84 ? 'Key Player' : 'Starter';
    } else if (starterDiff >= -2 || ovr >= 72) {
      proposedSquad = 'First Team';
      expectedRole = 'Rotation Player';
    } else {
      proposedSquad = 'Reserves';
      expectedRole = 'Young Prospect';
    }

    // Determine wage (salary is separate and does not dictate the transfer ranking)
    const baseWeekly = Math.max(2500, Math.round((baseMv * 0.0035 * (club.prestigeStars / 3)) / 500) * 500);
    const yearlySalary = baseWeekly * 52;
    const offerDuration = Math.min(5, Math.max(2, (club.prestigeStars >= 4 ? 4 : 3)));

    const bonusResult = calculateNegotiatedSigningBonus(
      'regular_transfer',
      transferFee,
      yearlySalary,
      manager,
      club.prestigeStars * 2
    );

    const formattedFee = `€${(transferFee / 1000000).toFixed(1)}M`;
    const compText = starterDiff >= 0 ? `+${starterDiff} OVR advantage over incumbent starter` : `${starterDiff} OVR vs current starter`;

    const unifiedOffer: UnifiedClubOffer = {
      id: `req_transfer_pro_${club.clubName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${idx}`,
      buyerClub: club,
      clubBadgeBg: (club as any).badgeBgColor || '#1e293b',
      leagueName: club.leagueName,
      countryName: club.countryName,
      countryCode: club.countryCode,
      prestigeStars: club.prestigeStars,
      leagueTier: club.leagueTier,
      clubFame: clubFameVal,
      developmentTier: devTier.tier,
      developmentTierName: devTier.name,
      managerName: club.managerName || 'Chief Head Coach',
      managerNationality: club.countryName,
      managerFormation: '4-3-3',
      managerTacticalStyle: 'Balanced Dynamic',
      expectedPosition: player.position || 'ST',
      expectedSubPosition: subPos,
      expectedPlaystyle: 'Balanced',
      squadRole: starterDiff >= 3 ? 'Key Player' : starterDiff >= -2 ? 'First Team Regular' : 'Rotation',
      expectedRole,
      initialSquadDestination: proposedSquad,
      proposedSquad,
      starterOvr: starterDiff + ovr,
      starterDiff,
      starterComparisonText: compText,
      transferType: 'regular_transfer' as OfferTransferType,
      transferFee,
      formattedFee,
      releaseClause: Math.round(yearlySalary * 3.5),
      signingBonus: bonusResult.signingBonus,
      signingBonusPercent: bonusResult.bonusPercent,
      yearlySalary,
      weeklyWage: baseWeekly,
      contractYears: offerDuration,
      curatedReason: `💰 TOP TRANSFER BID: Offered ${formattedFee} transfer fee directly to ${player.club || 'your current club'}. Fits sporting project at ${club.leagueName}.`,
    };

    return unifiedOffer;
  });
}

/**
 * AUTHORITATIVE TRANSFER-REQUEST PIPELINE (Requirement 10)
 * Pipeline:
 * Request Transfer → Determine player type → Find eligible destinations →
 * Apply all existing restrictions → Rank appropriate destinations →
 * Create offer → Deliver at next transfer window → Transfer canonical PlayerID
 */
export function executeTransferRequestPipeline(
  player: PlayerCardData,
  accounting?: AccountingState,
  manager?: ManagerState,
  calendarDate?: string,
  seasonStage?: string
): TransferRequestPipelineResult {
  // 1. Eligibility & Limit Check
  const check = canPlayerRequestTransfer(player);
  if (!check.canRequest) {
    return {
      success: false,
      message: check.reason || 'Transfer request currently unavailable.',
      readyImmediate: false,
      windowInfo: getTransferWindowStatus(player, calendarDate, seasonStage),
      updatedPlayer: player,
    };
  }

  // 2. Apply -30% Chemistry Penalty & Mark 1/Season Used
  const penaltyResult = applyTransferRequestPenalty(player);
  let updatedPlayer: PlayerCardData = {
    ...penaltyResult.updatedPlayer,
    transferRequestUsedThisSeason: true,
    requestedTransfer: true,
  };

  // 3. Determine Player Type & Window Status
  const isPro = isProfessionalPlayer(player);
  const windowStatus = getTransferWindowStatus(player, calendarDate, seasonStage);

  if (!isPro) {
    // YOUTH TRANSFER
    const youthOffers = generateYouthTransferOpportunities(updatedPlayer);
    if (youthOffers.length === 0) {
      return {
        success: false,
        message: 'No eligible youth leagues found outside your current youth competition.',
        readyImmediate: false,
        windowInfo: windowStatus,
        updatedPlayer,
      };
    }

    const topOffer = youthOffers[0];
    updatedPlayer = {
      ...updatedPlayer,
      pendingTransferRequest: {
        type: 'youth',
        targetWindow: windowStatus.isOpen ? windowStatus.windowType : (windowStatus.windowType === 'winter' ? 'winter' : 'summer'),
        offers: youthOffers,
        selectedOffer: topOffer,
        requestedSeason: player.currentSeason || 1,
      },
    };

    const message = windowStatus.isOpen
      ? `📋 Youth Transfer Request processed! Found ${youthOffers.length} eligible youth opportunities. Transfer window is currently OPEN.`
      : `📋 Youth Transfer Request lodged! Found top youth opportunities (including ${topOffer.destinationClub}, ${topOffer.destinationCountry}). Offer will be delivered at the upcoming ${windowStatus.windowName}.`;

    return {
      success: true,
      message,
      readyImmediate: windowStatus.isOpen,
      windowInfo: windowStatus,
      updatedPlayer,
      youthOffers,
      selectedOffer: topOffer,
    };
  } else {
    // PROFESSIONAL TRANSFER
    const proOffers = generateProfessionalTransferRequestOffers(updatedPlayer, accounting, manager);
    if (proOffers.length === 0) {
      return {
        success: false,
        message: 'No eligible clubs outside your current league met the bidding criteria.',
        readyImmediate: false,
        windowInfo: windowStatus,
        updatedPlayer,
      };
    }

    const topBid = proOffers[0];
    updatedPlayer = {
      ...updatedPlayer,
      pendingTransferRequest: {
        type: 'pro',
        targetWindow: windowStatus.isOpen ? windowStatus.windowType : (windowStatus.windowType === 'winter' ? 'winter' : 'summer'),
        offers: proOffers,
        selectedOffer: topBid,
        requestedSeason: player.currentSeason || 1,
      },
    };

    const message = windowStatus.isOpen
      ? `📋 Transfer Request Accepted! Top bid from ${topBid.buyerClub.clubName} offering ${topBid.formattedFee} to ${player.club || 'your club'}. Window is currently OPEN.`
      : `📋 Transfer Request lodged! Solicits top bid from ${topBid.buyerClub.clubName} (${topBid.formattedFee} fee to your club). Formal offer will be delivered at the upcoming ${windowStatus.windowName}.`;

    return {
      success: true,
      message,
      readyImmediate: windowStatus.isOpen,
      windowInfo: windowStatus,
      updatedPlayer,
      proOffers,
      selectedOffer: topBid,
    };
  }
}

/**
 * CANONICAL TRANSFER EXECUTION (Requirement 7, 8 & 9)
 * Transfers the EXACT canonical PlayerID without cloning.
 * Updates club finances (transfer fee belongs to current club).
 * Moves player record in canonical LeagueDatabase.
 * Records youth foreign training countries for international nationality grant at age 18.
 */
export function executeCanonicalTransfer(
  player: PlayerCardData,
  offer: UnifiedClubOffer | YouthTransferOffer,
  accounting?: AccountingState
): { updatedPlayer: PlayerCardData; updatedAccounting: AccountingState; message: string } {
  const canonicalId = player.id; // STRICT PRESERVATION OF CANONICAL PLAYER ID
  const db = getLeagueDatabase();

  let nextPlayer: PlayerCardData = { ...player };
  let nextAccounting: AccountingState = accounting
    ? { ...accounting }
    : {
        contractYears: 3,
        yearlySalary: 150000,
        totalSavings: 0,
        sponsors: [],
        sanctions: [],
        businesses: [],
      };

  const isYouth = 'destinationClub' in offer || (offer as any).type === 'youth';

  if (isYouth) {
    // YOUTH TRANSFER
    const youthOffer = offer as YouthTransferOffer;
    const isForeign = youthOffer.isInternational;

    const trainedCountries = [...(player.youthTrainedCountries || [])];
    if (isForeign && !trainedCountries.includes(youthOffer.destinationCountry)) {
      trainedCountries.push(youthOffer.destinationCountry);
    }

    nextPlayer = {
      ...nextPlayer,
      id: canonicalId,
      club: youthOffer.destinationClub,
      youthTeamName: youthOffer.destinationClub,
      youthLeagueName: youthOffer.destinationLeague,
      city: youthOffer.destinationCity,
      clubCountry: youthOffer.destinationCountry,
      youthTrainedCountries: trainedCountries,
      pendingTransferRequest: undefined,
      requestedTransfer: false,
    };

    const msg = isForeign
      ? `🛫 Youth International Transfer Complete: Successfully transferred to ${youthOffer.destinationClub} (${youthOffer.destinationCountry})! Developing in this youth academy will grant ${youthOffer.destinationCountry} nationality upon turning 18.`
      : `🏃 Youth Transfer Complete: Successfully joined ${youthOffer.destinationClub} in the ${youthOffer.destinationLeague}!`;

    return {
      updatedPlayer: nextPlayer,
      updatedAccounting: nextAccounting,
      message: msg,
    };
  } else {
    // PROFESSIONAL TRANSFER
    const proOffer = offer as UnifiedClubOffer;
    const transferFee = proOffer.transferFee || 0;
    const destClub = proOffer.buyerClub.clubName;
    const sellingClub = player.club || '';

    // 1. Financial Update: Selling club receives transfer fee; buying club pays transfer fee
    if (db && db.teams) {
      const sourceTeamEntry = Object.values(db.teams).find(
        (t) => cleanTeamName(t.name) === cleanTeamName(sellingClub)
      );
      const destTeamEntry = Object.values(db.teams).find(
        (t) => cleanTeamName(t.name) === cleanTeamName(destClub)
      );

      // Credit selling club with transfer fee
      if (sourceTeamEntry && sourceTeamEntry.finances) {
        sourceTeamEntry.finances.cashBalance = (sourceTeamEntry.finances.cashBalance || 0) + transferFee;
        sourceTeamEntry.finances.transferBudget = (sourceTeamEntry.finances.transferBudget || 0) + Math.round(transferFee * 0.8);
        if (!sourceTeamEntry.finances.revenue) {
          sourceTeamEntry.finances.revenue = {
            matchday: 0,
            broadcasting: 0,
            sponsorships: 0,
            merchandising: 0,
            memberships: 0,
            prizeMoney: 0,
            continentalCompetitions: 0,
            domesticCompetitions: 0,
            playerSales: 0,
            loanIncome: 0,
            otherIncome: 0,
            totalRevenue: 0,
          };
        }
        sourceTeamEntry.finances.revenue.playerSales = (sourceTeamEntry.finances.revenue.playerSales || 0) + transferFee;
        sourceTeamEntry.finances.revenue.totalRevenue = (sourceTeamEntry.finances.revenue.totalRevenue || 0) + transferFee;
      }

      // Deduct fee from buyer club
      if (destTeamEntry && destTeamEntry.finances) {
        destTeamEntry.finances.cashBalance = Math.max(0, (destTeamEntry.finances.cashBalance || 0) - transferFee);
        destTeamEntry.finances.transferBudget = Math.max(0, (destTeamEntry.finances.transferBudget || 0) - transferFee);
      }

      saveLeagueDatabase(db);
    }

    // 2. Rebuild Competitive Context while preserving canonical PlayerID and all permanent stats
    nextPlayer = rebuildPlayerCompetitiveContextOnTransfer(nextPlayer, destClub, undefined, db);
    nextPlayer.id = canonicalId; // Strictly preserve canonical ID
    nextPlayer.pendingTransferRequest = undefined;
    nextPlayer.requestedTransfer = false;
    nextPlayer.squadDestination = proOffer.proposedSquad;
    nextPlayer.squadRole = proOffer.expectedRole;

    // 3. Update player accounting
    nextAccounting = {
      ...nextAccounting,
      contractYears: proOffer.contractYears,
      yearlySalary: proOffer.yearlySalary,
      totalSavings: (nextAccounting.totalSavings || 0) + proOffer.signingBonus,
      transferStatus: 'not_listed',
      releaseClause: proOffer.releaseClause || Math.round(proOffer.yearlySalary * 3.5),
    };

    const feeText = `€${(transferFee / 1000000).toFixed(1)}M`;
    const msg = `✍️ Transfer Executed: Transferred to ${destClub} for ${feeText}! ${sellingClub} received the agreed ${feeText} fee. Signed ${proOffer.contractYears}-year contract at €${proOffer.yearlySalary.toLocaleString()}/yr with €${proOffer.signingBonus.toLocaleString()} signing bonus.`;

    return {
      updatedPlayer: nextPlayer,
      updatedAccounting: nextAccounting,
      message: msg,
    };
  }
}

/**
 * AGE 18 EARNED NATIONALITY CHECK (Requirement 8)
 * When a player turns 18, grants earned nationalities for countries
 * where they developed in youth academies.
 * Main nationality is strictly preserved.
 */
export function checkAndGrantYouthEarnedNationalities(player: PlayerCardData): {
  updatedPlayer: PlayerCardData;
  newlyEarned: string[];
  messages: string[];
} {
  if ((player.age || 10) < 18) {
    return { updatedPlayer: player, newlyEarned: [], messages: [] };
  }

  const youthCountries = player.youthTrainedCountries || [];
  if (youthCountries.length === 0) {
    return { updatedPlayer: player, newlyEarned: [], messages: [] };
  }

  const primaryCountry = (player.nationality?.name || player.country || '').toLowerCase();
  const existingEarned = player.earnedNationalities || [];
  const otherNats = [...(player.otherNationalities || [])];
  const newlyEarned: string[] = [];
  const messages: string[] = [];

  for (const country of youthCountries) {
    if (country.toLowerCase() === primaryCountry) continue;
    if (existingEarned.includes(country)) continue;

    // Grant earned nationality!
    const natConfig = COUNTRY_TO_NATIONALITY[country] || {
      code: country.slice(0, 3).toUpperCase(),
      iso: country.slice(0, 2).toUpperCase(),
      name: country,
    };

    if (!otherNats.some((n) => n.name.toLowerCase() === country.toLowerCase())) {
      otherNats.push(natConfig);
    }

    newlyEarned.push(country);
    messages.push(
      `🎖️ Dual Nationality Earned: Through your youth academy development in ${country}, you have officially earned ${country} nationality alongside your primary ${player.nationality?.name || 'national'} citizenship!`
    );
  }

  if (newlyEarned.length === 0) {
    return { updatedPlayer: player, newlyEarned: [], messages: [] };
  }

  const updatedPlayer: PlayerCardData = {
    ...player,
    earnedNationalities: [...existingEarned, ...newlyEarned],
    otherNationalities: otherNats,
  };

  return { updatedPlayer, newlyEarned, messages };
}

/**
 * PRESEASON RECHARGE (Requirement 2)
 * Recharges the once-per-season transfer request limit automatically at preseason.
 */
export function rechargeTransferRequestForPreseason(player: PlayerCardData): PlayerCardData {
  return {
    ...player,
    transferRequestUsedThisSeason: false,
    requestedTransfer: false,
    pendingTransferRequest: undefined,
  };
}
