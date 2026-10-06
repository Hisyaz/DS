import { PlayerConfig, PlayerCardData, ManagerState } from '../types';
import { AgentState } from '../types';
import {
  ProClubDefinition,
  getProClubsFromDatabase,
  getPositionFullName,
  getTacticalRoleName,
  getPositionLineKey,
} from './earlyCareerSystem';
import { getClubDevelopmentTier } from './clubDevelopmentEngine';
import { getFootballSchoolForClub } from '../data/youthFootballSchools';
import { resolvePlayerSubPosition } from './clubRankingSystem';
import { isSpecialClubOfferExcluded } from './specialClubInterestSystem';
import {
  evaluateClubNormalOfferEligibility,
  calculateEffectiveFame,
  isClubDomesticToPlayer,
} from './professionalOfferEligibility';

export interface SquadPlacementInfo {
  tierLabel: string;
  squadName: 'First-team squad (Starter/Rotation)' | 'Rotation/First-team squad' | 'U20 development squad' | 'U17 development squad';
  initialSquadDestination: 'First Team' | 'U20' | 'U17';
  proposedSquad: 'First Team' | 'U20' | 'U17';
  squadRole: 'Starter' | 'Rotation' | 'Young Prospect';
  expectedRole: 'Starter' | 'Rotation Player' | 'Develop With Reserves' | 'Youth Team';
  playingTimeExpectation: 'STARTER' | 'ROTATION' | 'U20 PROSPECT' | 'U17 PROSPECT';
  badgeColor: 'emerald' | 'cyan' | 'amber' | 'orange';
  badgeText: string;
  description: string;
}

export interface Age16TransferOffer {
  id: string;
  club: ProClubDefinition;
  clubName: string;
  leagueName: string;
  leagueTier: 1 | 2;
  countryName: string;
  countryCode: string;
  clubBadgeBg: string;
  isEuropean: boolean;
  prestigeStars: number;
  clubFame: number;
  developmentTier: number;
  developmentTierName: string;
  developmentPhilosophy: string;
  youthDevelopmentPoints: number;
  managerName: string;
  managerFormation: string;
  managerTacticalStyle: string;
  expectedPosition: string;
  expectedSubPosition: string;
  tacticalRole: string;
  squadPlacement: SquadPlacementInfo;
  weeklyWage: number;
  yearlySalary: number;
  contractYears: number;
  signingBonus: number;
  releaseClause: number;
  curatedReason: string;
  tierRequirementLabel: string;
  isCareerRestartEvent?: boolean;
  eligibilityNote?: string;
  offerCategory: 'local' | 'money' | 'development' | 'glory';
  offerCategoryLabel: string;
  transferFee: number;
  formattedTransferFee: string;
}

export interface YouthCareerSummary {
  playerName: string;
  academyName: string;
  directorName: string;
  startAge: number;
  graduatingAge: number;
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  totalCleanSheets?: number;
  totalMvps: number;
  avgRating: number;
  startOvr: number;
  finalOvr: number;
  ovrGrowth: number;
  totalDevPoints: number;
  fameGained: number;
  finalYouthStatus: string;
  trophies: Array<{
    id: string;
    title: string;
    category: string;
    year: string;
    description: string;
  }>;
  awards: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  directorFarewellLetter: string;
}

/**
 * 1. SQUAD PLACEMENT BY OVR
 * Placement within the offering club strictly follows:
 * - 80+ OVR: First-team squad (Starter/Rotation)
 * - 75-79 OVR: Rotation/First-team squad
 * - <75 OVR (70-74): U20 development squad
 * - <70 OVR: U17 development squad
 */
export function getSquadPlacementByOvr(ovr: number): SquadPlacementInfo {
  if (ovr >= 80) {
    return {
      tierLabel: '80+ OVR: Elite Prodigy',
      squadName: 'First-team squad (Starter/Rotation)',
      initialSquadDestination: 'First Team',
      proposedSquad: 'First Team',
      squadRole: 'Starter',
      expectedRole: 'Starter',
      playingTimeExpectation: 'STARTER',
      badgeColor: 'emerald',
      badgeText: '⭐ First-Team Squad (Starter/Rotation)',
      description:
        'Immediate first-team inclusion. The coaching staff has designated you as a vital starter/primary rotation asset in senior domestic competition.',
    };
  }

  if (ovr >= 75) {
    return {
      tierLabel: '75-79 OVR: High-Ceiling Senior Asset',
      squadName: 'Rotation/First-team squad',
      initialSquadDestination: 'First Team',
      proposedSquad: 'First Team',
      squadRole: 'Rotation',
      expectedRole: 'Rotation Player',
      playingTimeExpectation: 'ROTATION',
      badgeColor: 'cyan',
      badgeText: '🔷 Rotation / First-Team Squad',
      description:
        'Integrated directly into the senior first-team roster. You will contest high-leverage cup ties and regular league rotation minutes.',
    };
  }

  if (ovr >= 70) {
    return {
      tierLabel: '<75 OVR: Advanced Reserve Tier',
      squadName: 'U20 development squad',
      initialSquadDestination: 'U20',
      proposedSquad: 'U20',
      squadRole: 'Young Prospect',
      expectedRole: 'Develop With Reserves',
      playingTimeExpectation: 'U20 PROSPECT',
      badgeColor: 'amber',
      badgeText: '⚡ U20 Development Squad',
      description:
        'Assigned to the U20 reserve squad. High-intensity competitive development with scheduled training sessions alongside senior first-team pros.',
    };
  }

  return {
    tierLabel: '<70 OVR: Youth Academy Pipeline',
    squadName: 'U17 development squad',
    initialSquadDestination: 'U17',
    proposedSquad: 'U17',
    squadRole: 'Young Prospect',
    expectedRole: 'Youth Team',
    playingTimeExpectation: 'U17 PROSPECT',
    badgeColor: 'orange',
    badgeText: '🌱 U17 Development Squad',
    description:
      'Assigned to the U17 development squad. Focus on foundational tactical conditioning, technical refinement, and physical maturity.',
  };
}

/**
 * 2. COMPILES COMPLETE YOUTH CAREER SUMMARY
 */
export function compileYouthCareerSummary(player: PlayerConfig): YouthCareerSummary {
  const name = player.name || 'Academy Prospect';
  const academy = player.club || player.youthLeagueTeam?.teamName || 'Youth Football Academy';
  const directorName = player.managerName || 'Youth Academy Director & Coaching Staff';

  // Read historic season records if available
  const history = (player as any).youthSeasonHistory || (player as any).seasonHistory || [];
  let totalMatches = 0;
  let totalGoals = 0;
  let totalAssists = 0;
  let totalMvps = 0;
  let totalRatingSum = 0;
  let ratingCount = 0;

  if (Array.isArray(history) && history.length > 0) {
    history.forEach((h: any) => {
      totalMatches += h.matchesPlayed || h.apps || h.matches || 0;
      totalGoals += h.goals || 0;
      totalAssists += h.assists || 0;
      totalMvps += h.mvps || h.motm || 0;
      if (h.avgRating || h.rating) {
        totalRatingSum += Number(h.avgRating || h.rating);
        ratingCount += 1;
      }
    });
  }

  // If minimal or unrecorded history (e.g. simulated start), generate proportional career metrics across ages 10 to 17
  const ageSpan = Math.max(1, ((player.age || 17) - 10));
  if (totalMatches < 20) {
    totalMatches = ageSpan * 24 + Math.floor(Math.random() * 10);
    const ovr = player.ovr || 68;
    const isAttacker = ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(player.position || 'ST');
    const isMidfielder = ['CM', 'CDM', 'RM', 'LM'].includes(player.position || 'ST');

    if (isAttacker) {
      totalGoals = Math.round(totalMatches * (0.45 + (ovr / 200)));
      totalAssists = Math.round(totalMatches * 0.28);
    } else if (isMidfielder) {
      totalGoals = Math.round(totalMatches * 0.22);
      totalAssists = Math.round(totalMatches * 0.42);
    } else {
      totalGoals = Math.round(totalMatches * 0.08);
      totalAssists = Math.round(totalMatches * 0.15);
    }
    totalMvps = Math.round(totalMatches * 0.22);
    totalRatingSum = 7.6 * 5;
    ratingCount = 5;
  }

  const avgRating = ratingCount > 0 ? Number((totalRatingSum / ratingCount).toFixed(2)) : 7.65;
  const finalOvr = player.ovr || 68;
  const startOvr = Math.max(48, Math.min(56, finalOvr - 16));
  const ovrGrowth = finalOvr - startOvr;
  const totalDevPoints = Math.round(ovrGrowth * 8.5 + 45);
  const fameGained = player.fame || 0;
  const finalYouthStatus =
    fameGained >= 150
      ? 'Academy Valedictorian • Graduated to Senior Football'
      : ovrGrowth >= 15
        ? 'Elite Youth Graduate — High Potential Pathway'
        : 'Youth League Honors Graduate • Senior Football Ready';

  const trophies = [
    {
      id: 'u14-league',
      title: 'Youth League Championship (U14/U15)',
      category: 'League Title',
      year: 'Graduation Year - 2',
      description: 'Gold Medalists in the Regional Academy Youth Championship.',
    },
    {
      id: 'intl-cup',
      title: 'International Youth Supercup Finalist',
      category: 'Tournament Cup',
      year: 'Graduation Year - 1',
      description: 'Stood out against top European and continental youth academies.',
    },
  ];

  if ((player.fame || 0) >= 150 || finalOvr >= 72) {
    trophies.unshift({
      id: 'u17-invitational',
      title: 'National Elite Youth Shield (U17)',
      category: 'National Trophy',
      year: 'Graduation Year',
      description: 'Led the academy to glory in the end-of-cycle national youth tournament.',
    });
  }

  const awards = [
    {
      id: 'grad-valedictorian',
      title: 'Academy Graduate with Distinction',
      description: 'Awarded for exceptional discipline, relentless work ethic, and athletic progression from age 10 to 17.',
    },
    {
      id: 'mvp-prospect',
      title: 'Golden Boot & Playmaker Recognition',
      description: `${totalGoals} career youth goals and ${totalAssists} assists recorded in youth fixtures.`,
    },
  ];

  const directorFarewellLetter = `Dear ${name},

From the very first day you laced your boots on our academy training pitches, your drive and natural footballing instinct stood out. Across hundreds of training sessions and intense youth fixtures, you wore our academy colors with pride, courage, and relentless sportsmanship.

Now, at age 17, your youth academy journey reaches its formal graduation. You are no longer just an academy prospect — you are officially graduating into senior professional football.

Our coaches, scouts, and entire staff thank you for everything you brought to this club. We take immense pride in sending you forth to test your talents in professional football. Represent us with honor, stay hungry, and go fulfill your potential.

With gratitude and eternal support,
${directorName}
${academy}`;

  return {
    playerName: name,
    academyName: academy,
    directorName,
    startAge: 10,
    graduatingAge: 17,
    totalMatches,
    totalGoals,
    totalAssists,
    totalMvps,
    avgRating,
    startOvr,
    finalOvr,
    ovrGrowth,
    totalDevPoints,
    fameGained,
    finalYouthStatus,
    trophies,
    awards,
    directorFarewellLetter,
  };
}

/**
 * 3. AUTHORITATIVE 4-CATEGORY AGE 16 PROFESSIONAL TRANSFER OFFER GENERATOR
 * When eligible, generates candidates for:
 * A. LOCAL OPTION: Strongest appropriate club from the player's current country/local pathway.
 * B. MONEY OPTION: Eligible club willing to pay the highest transfer fee to the current youth club.
 * C. DEVELOPMENT OPTION: Eligible club with the strongest development tier (Benfica, Sporting, Ajax, etc.).
 *    Strictly prioritizes development infrastructure, youth runway, and coaching over English financial power.
 * D. GLORY OPTION: The highest-ranked eligible club that currently wants the player.
 *
 * Only shows the final 4 best distinct offers. Never shows duplicate clubs!
 */
export function generateAge16TransferOffers(
  player: PlayerConfig,
  agent?: AgentState | ManagerState | null
): Age16TransferOffer[] {
  const ovr = player.ovr || 65;
  const effectiveFame = calculateEffectiveFame(player.fame || 0, agent);
  const pos = (player.position || 'ST').toUpperCase();
  const subPos = resolvePlayerSubPosition(player);

  const allClubs = getProClubsFromDatabase();

  // Evaluate candidate clubs strictly using Authoritative Professional Offer Eligibility Rules
  const evaluatedClubs = allClubs
    .map((club) => {
      const eligibility = evaluateClubNormalOfferEligibility(player, club, agent);
      return { club, eligibility };
    })
    .filter(({ eligibility }) => eligibility.eligible);

  // If no clubs are eligible (e.g. Effective Fame <= 100 at OVR 50-69, etc.), return empty array
  if (evaluatedClubs.length === 0) {
    return [];
  }

  // Base market value for youth prospect
  const baseMv = Math.max(
    650000,
    Math.round(((ovr - 54) * 75000 + effectiveFame * 8500) / 25000) * 25000
  );

  // Club scoring functions
  const getClubData = (c: ProClubDefinition) => {
    const clubFameVal = typeof c.clubFame === 'number' ? c.clubFame : (c.prestigeStars || 3) * 2;
    const devTier = getClubDevelopmentTier(c.clubName, c.leagueName, c.countryName, clubFameVal);
    const isDomestic = isClubDomesticToPlayer(c, player);
    const cleanName = c.clubName.toLowerCase();

    // Canonical top global development academies (Tier 5 powerhouses)
    const isCanonicalDevPowerhouse = [
      'benfica',
      'sporting',
      'ajax',
      'river plate',
      'boca juniors',
      'vélez',
      'velez',
      'dinamo zagreb',
      'defensor sporting',
      'red bull salzburg',
      'porto',
      'atalanta',
      'feyenoord',
      'anderlecht',
      'partizan',
      'santos',
      'são paulo',
      'sao paulo',
      'flamengo',
    ].some((k) => cleanName.includes(k));

    return { clubFameVal, devTier, isDomestic, isCanonicalDevPowerhouse };
  };

  // 1. LOCAL OPTION candidate: Strongest domestic pathway club
  const localCandidates = evaluatedClubs
    .filter(({ club }) => getClubData(club).isDomestic)
    .sort((a, b) => {
      const aData = getClubData(a.club);
      const bData = getClubData(b.club);
      const aScore = a.club.prestigeStars * 20 + aData.clubFameVal * 2 + (a.club.leagueTier === 1 ? 30 : 15);
      const bScore = b.club.prestigeStars * 20 + bData.clubFameVal * 2 + (b.club.leagueTier === 1 ? 30 : 15);
      return bScore - aScore;
    });

  // 2. MONEY OPTION candidate: Highest transfer fee willing to be paid to the youth academy
  const moneyCandidates = [...evaluatedClubs].sort((a, b) => {
    const aData = getClubData(a.club);
    const bData = getClubData(b.club);
    // Financial power evaluation
    const aFinancial =
      (a.club.economicTier === 'ELITE_FINANCES' ? 50 : a.club.economicTier === 'STRONG_BUDGET' ? 35 : 15) +
      a.club.prestigeStars * 15 +
      aData.clubFameVal;
    const bFinancial =
      (b.club.economicTier === 'ELITE_FINANCES' ? 50 : b.club.economicTier === 'STRONG_BUDGET' ? 35 : 15) +
      b.club.prestigeStars * 15 +
      bData.clubFameVal;
    return bFinancial - aFinancial;
  });

  // 3. DEVELOPMENT OPTION candidate: Strongest development tier & youth pathway
  // Notice: English wealth does NOT prioritize this slot; Benfica, Sporting, Ajax, River Plate, etc. shine here!
  const devCandidates = [...evaluatedClubs].sort((a, b) => {
    const aData = getClubData(a.club);
    const bData = getClubData(b.club);

    let aScore = aData.devTier.tier * 600 + aData.devTier.annualPoints * 25;
    let bScore = bData.devTier.tier * 600 + bData.devTier.annualPoints * 25;

    if (aData.isCanonicalDevPowerhouse) aScore += 800;
    if (bData.isCanonicalDevPowerhouse) bScore += 800;

    // League tier & realistic development runway
    if (a.club.leagueTier === 1) aScore += 120;
    if (b.club.leagueTier === 1) bScore += 120;

    // European / continental pedigree
    if (a.club.isEuropean) aScore += 100;
    if (b.club.isEuropean) bScore += 100;

    return bScore - aScore;
  });

  // 4. GLORY OPTION candidate: Highest prestige stars & global stature wanting the player
  const gloryCandidates = [...evaluatedClubs].sort((a, b) => {
    const aData = getClubData(a.club);
    const bData = getClubData(b.club);
    const aScore = a.club.prestigeStars * 100 + aData.clubFameVal * 20 + (a.club.leagueTier === 1 ? 50 : 0);
    const bScore = b.club.prestigeStars * 100 + bData.clubFameVal * 20 + (b.club.leagueTier === 1 ? 50 : 0);
    return bScore - aScore;
  });

  // Deduplicate and assemble up to 4 distinct offers across categories
  const selectedOffers: {
    item: (typeof evaluatedClubs)[0];
    category: 'local' | 'money' | 'development' | 'glory';
    categoryLabel: string;
    feeMultiplier: number;
  }[] = [];
  const chosenClubIds = new Set<string>();

  const tryAdd = (
    candidates: typeof evaluatedClubs,
    category: 'local' | 'money' | 'development' | 'glory',
    categoryLabel: string,
    feeMultiplier: number
  ) => {
    for (const cand of candidates) {
      const cleanName = cand.club.clubName.toLowerCase();
      if (!chosenClubIds.has(cand.club.id) && !chosenClubIds.has(cleanName)) {
        chosenClubIds.add(cand.club.id);
        chosenClubIds.add(cleanName);
        selectedOffers.push({ item: cand, category, categoryLabel, feeMultiplier });
        return true;
      }
    }
    return false;
  };

  // Priority slot 1: Elite Development Option (ensures Benfica / Sporting / Ajax appear when qualified)
  tryAdd(devCandidates, 'development', '🌟 Elite Development Option', 1.15);

  // Priority slot 2: Local Option
  if (!tryAdd(localCandidates, 'local', '🏛️ Local Pathway Option', 0.95)) {
    // If no domestic club available, use top development or glory alternative
    tryAdd(gloryCandidates, 'glory', '🏆 High Prestige Glory Option', 1.35);
  }

  // Priority slot 3: Money Option (Highest Transfer Fee)
  tryAdd(moneyCandidates, 'money', '💰 Highest Transfer Fee Option', 1.65);

  // Priority slot 4: Glory Option (Highest Prestige)
  tryAdd(gloryCandidates, 'glory', '🏆 High Prestige Glory Option', 1.35);

  // If still fewer than 4 distinct clubs, fill from best remaining eligible clubs
  for (const cand of gloryCandidates) {
    if (selectedOffers.length >= 4) break;
    const cleanName = cand.club.clubName.toLowerCase();
    if (!chosenClubIds.has(cand.club.id) && !chosenClubIds.has(cleanName)) {
      chosenClubIds.add(cand.club.id);
      chosenClubIds.add(cleanName);
      selectedOffers.push({
        item: cand,
        category: 'glory',
        categoryLabel: '🏆 Professional Opportunity',
        feeMultiplier: 1.2,
      });
    }
  }

  let tierLabel = 'Authoritative Professional Youth Offer';
  if (ovr >= 50 && ovr <= 69) {
    tierLabel = 'OVR 50–69 (Effective Fame >100): Domestic 2nd Division Pathway';
  } else if (ovr >= 70 && ovr <= 75) {
    tierLabel =
      effectiveFame > 200
        ? 'OVR 70–75 (Effective Fame >200): Domestic & International 2nd Division Pathway'
        : 'OVR 70–75 (Effective Fame 100–200): Domestic 1st & 2nd Division Opportunities';
  } else if (ovr >= 76 && ovr <= 84) {
    tierLabel =
      effectiveFame > 200
        ? 'OVR 76–84 (Effective Fame >200): International 1st Division Pro Opportunities'
        : 'OVR 76–84 (Effective Fame 101–200): Domestic 1st Division Pro Opportunities';
  } else if (ovr >= 85) {
    tierLabel = 'OVR 85+ World Elite Prodigy Opportunities';
  }

  const squadPlacement = getSquadPlacementByOvr(ovr);

  return selectedOffers.slice(0, 4).map(({ item, category, categoryLabel, feeMultiplier }, idx) => {
    const { club, eligibility } = item;
    const clubFameVal = typeof club.clubFame === 'number' ? club.clubFame : (club.prestigeStars || 3) * 2;
    const devTier = getClubDevelopmentTier(club.clubName, club.leagueName, club.countryName, clubFameVal);
    const devSchool = getFootballSchoolForClub(club.clubName, club.leagueName, '', club.countryName);

    // Realistic wage scaling for a 16-year-old talent
    const baseWageByTier = club.leagueTier === 1 ? 2400 : 1050;
    const ovrWageBonus = Math.max(0, (ovr - 60) * 150);
    const fameWageBonus = Math.round((effectiveFame / 20) * 85);
    const categoryWageMultiplier = category === 'money' ? 1.35 : category === 'glory' ? 1.15 : 1.0;
    const weeklyWage = Math.round(((baseWageByTier + ovrWageBonus + fameWageBonus) * categoryWageMultiplier) / 50) * 50;
    const yearlySalary = weeklyWage * 52;

    const signingBonus = Math.round(yearlySalary * 0.25 + ovr * 250);
    const releaseClause = Math.max(2500000, Math.round((yearlySalary * 12) / 250000) * 250000);

    // Transfer fee offered directly to the player's Youth Academy
    const transferFee = Math.round((baseMv * feeMultiplier) / 25000) * 25000;
    const formattedTransferFee = `€${transferFee.toLocaleString('en-US')}`;

    let curatedReason =
      category === 'development'
        ? `🌟 World-Class Academy: ${club.clubName} scouts identified you as a centerpiece for their renowned youth-to-first-team pathway.`
        : category === 'money'
          ? `💰 Top Academy Bid: ${club.clubName} submitted a massive ${formattedTransferFee} transfer fee offer to secure your registration.`
          : category === 'local'
            ? `🏛️ Local Pathway: Direct domestic pathway keeping you rooted in your home nation while ascending to professional ranks.`
            : `🏆 Senior Ambition: High-prestige environment offering immediate immersion in top-flight competitive football.`;

    if (eligibility.isCareerRestart && eligibility.reason) {
      curatedReason = `${eligibility.reason} ${curatedReason}`;
    }

    return {
      id: `age16-offer-${club.id}-${Date.now()}-${idx}`,
      club,
      clubName: club.clubName,
      leagueName: club.leagueName,
      leagueTier: club.leagueTier,
      countryName: club.countryName,
      countryCode: club.countryCode,
      clubBadgeBg: club.clubBadgeBg || 'from-indigo-900 to-slate-950',
      isEuropean: club.isEuropean,
      prestigeStars: club.prestigeStars,
      clubFame: clubFameVal,
      developmentTier: devTier.tier,
      developmentTierName: `TIER ${devTier.tier}/5 — ${devTier.name} (${devTier.pointsLabel})`,
      developmentPhilosophy: devSchool.name,
      youthDevelopmentPoints: devTier.annualPoints,
      managerName: club.managerName || 'Head Coach',
      managerFormation: club.managerFormation || '4-3-3',
      managerTacticalStyle: club.managerTacticalStyle || 'Attacking',
      expectedPosition: getPositionFullName(pos),
      expectedSubPosition: subPos,
      tacticalRole: getTacticalRoleName(subPos, pos),
      squadPlacement,
      weeklyWage,
      yearlySalary,
      contractYears: 3, // 3-year initial professional contract
      signingBonus,
      releaseClause,
      curatedReason,
      tierRequirementLabel: tierLabel,
      isCareerRestartEvent: eligibility.isCareerRestart,
      eligibilityNote: eligibility.reason,
      offerCategory: category,
      offerCategoryLabel: categoryLabel,
      transferFee,
      formattedTransferFee,
    };
  });
}
