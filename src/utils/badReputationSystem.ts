import { PlayerCardData, AccountingState } from '../types';
import { CareerSeasonRecord } from '../types/careerConclusion';

export type BadReputationTier = 0 | 1 | 2 | 3;

export interface BadRepTierUpEvent {
  previousTier: BadReputationTier;
  newTier: BadReputationTier;
  title: string;
  description: string;
  consequences: string[];
}

export function getRomanReputationTier(tier: number = 0): string {
  if (tier === 1) return 'I';
  if (tier === 2) return 'II';
  if (tier >= 3) return 'III';
  return '';
}

/**
 * Returns the official label for each bad reputation tier:
 * Tier 0: "Clean Record"
 * Tier I: I "Bad Boy"
 * Tier II: II "Menace"
 * Tier III: III "Psycho"
 */
export function getBadReputationTierName(tier: number = 0): string {
  if (tier === 1) return 'I "Bad Boy"';
  if (tier === 2) return 'II "Menace"';
  if (tier >= 3) return 'III "Psycho"';
  return 'Clean Record';
}

/**
 * Bad reputation increases red card chance during matches:
 * - Tier 1 ("Bad Boy"): increases red chance by +20% (1.20x multiplier)
 * - Tier 2 ("Menace"): increases red chance by +40% (1.40x multiplier)
 * - Tier 3 ("Psycho"): increases red chance by +60% (1.60x multiplier)
 */
export function getBadRepRedCardChanceMultiplier(tier: number = 0): number {
  if (tier === 1) return 1.20;
  if (tier === 2) return 1.40;
  if (tier >= 3) return 1.60;
  return 1.0;
}

export function getBadReputationTransferDropChance(tier: number = 0): number {
  if (tier === 1) return 0.25;
  if (tier === 2) return 0.50;
  if (tier >= 3) return 0.75;
  return 0;
}

export function getStartingClubChemistry(tier: number = 0): number {
  if (tier === 1) return 40;
  if (tier === 2) return 30;
  if (tier >= 3) return 20;
  return 50;
}

export function getMidseasonNegativeLifestyleDrawChance(tier: number = 0): number {
  if (tier === 1) return 0.10;
  if (tier === 2) return 0.20;
  if (tier >= 3) return 0.30;
  return 0;
}

/**
 * Broadcasts an event when bad reputation is gained so tutorial popups or UI effects can react.
 */
export function notifyBadReputationGained(amount: number, newScore: number, newTier: number): void {
  if (typeof window !== 'undefined' && amount > 0) {
    try {
      window.dispatchEvent(
        new CustomEvent('drawstar_bad_rep_gained', {
          detail: { amount, newScore, newTier },
        })
      );
    } catch {
      // safe fallback
    }
  }
}

/**
 * Adds bad reputation to player with irreversible tier-up thresholds and meter rollover.
 * - Tier 0: 0-100. At 100 -> jumps to Tier 1, meter resets to 0. Can never drop below Tier 1.
 * - Tier 1: 0-100. At 100 -> jumps to Tier 2, meter resets to 0. Can never drop below Tier 2.
 * - Tier 2: 0-100. At 100 -> jumps to Tier 3, meter locked at 100. Can never drop below Tier 3.
 * - Tier 3: Locked at Tier 3, 100%.
 */
export function addBadReputation(
  player: PlayerCardData,
  amount: number
): {
  updatedPlayer: PlayerCardData;
  tierUpEvent?: BadRepTierUpEvent;
} {
  const currentTier = (Math.min(3, Math.max(0, player.badReputationTier ?? 0))) as BadReputationTier;
  let currentMeter = Math.max(0, player.badReputation ?? 0);

  if (amount <= 0) {
    // Reductions can lower meter within current tier, but CAN NEVER go below current tier floor
    const newMeter = Math.max(0, currentMeter + amount);
    return {
      updatedPlayer: {
        ...player,
        badReputation: newMeter,
        badReputationTier: currentTier,
      },
    };
  }

  // If already at Tier 3, bad rep is locked at 100%
  if (currentTier >= 3) {
    return {
      updatedPlayer: {
        ...player,
        badReputation: 100,
        badReputationTier: 3,
      },
    };
  }

  let newTier = currentTier;
  let newMeter = currentMeter + amount;
  let tierUpEvent: BadRepTierUpEvent | undefined = undefined;

  // Process threshold jumps
  while (newMeter >= 100 && newTier < 3) {
    const prevT = newTier;
    newTier = (newTier + 1) as BadReputationTier;
    newMeter = newMeter - 100;

    tierUpEvent = createBadRepTierUpEvent(prevT, newTier);
  }

  if (newTier >= 3) {
    newTier = 3;
    newMeter = 100; // Locked at Tier 3
  }

  // Notify listeners that bad reputation was gained
  notifyBadReputationGained(amount, newMeter, newTier);

  // If tier-up occurred, broadcast event so UI celebration modal can trigger
  if (tierUpEvent && typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('drawstar_bad_rep_tier_up', {
          detail: { tierUpEvent },
        })
      );
    } catch {
      // safe fallback
    }
  }

  return {
    updatedPlayer: {
      ...player,
      badReputation: newMeter,
      badReputationTier: newTier,
    },
    tierUpEvent,
  };
}

export function createBadRepTierUpEvent(
  previousTier: BadReputationTier,
  newTier: BadReputationTier
): BadRepTierUpEvent {
  const roman = getRomanReputationTier(newTier);

  if (newTier === 1) {
    return {
      previousTier,
      newTier,
      title: `🚨 INFAMOUS REPUTATION: TIER ${roman} ("BAD BOY")!`,
      description:
        'Your off-pitch controversies, reckless tackles, and media leaks have earned you the "Bad Boy" label across world football.',
      consequences: [
        '🟥 Red Card Risk: +20% higher chance of receiving a red card during matches.',
        '🔻 Transfer Hesitation: 25% chance interested clubs drop transfer offers due to bad reputation.',
        '🔻 Dressing Room Skepticism: Starting chemistry on newly signed clubs reduced by 10% (starts at 40% instead of 50%).',
        '🔻 Mid-Season Distractions: 10% chance during mid-season of drawing a Negative Lifestyle Card.',
        '🔒 Irreversible Floor: Bad reputation can NEVER drop below Tier I again.',
      ],
    };
  }

  if (newTier === 2) {
    return {
      previousTier,
      newTier,
      title: `🚨 TOXIC REPUTATION: TIER ${roman} ("MENACE")!`,
      description:
        'Tabloids run constant exposes on your disruptive behavior. Sporting directors consider you a dangerous "Menace" and high-risk talent.',
      consequences: [
        '🟥 Red Card Risk: +40% higher chance of receiving a red card during matches.',
        '🔻 Transfer Market Pariah: 50% chance clubs drop interest and cancel prospective contracts.',
        '🔻 Dressing Room Friction: Starting chemistry on newly signed clubs reduced by 20% (starts at 30% instead of 50%).',
        '🔻 Chronic Drama: 20% chance during mid-season of drawing a Negative Lifestyle Card.',
        '🔒 Irreversible Floor: Bad reputation can NEVER drop below Tier II again.',
      ],
    };
  }

  return {
    previousTier,
    newTier,
    title: `🚨 UNTOUCHABLE REPUTATION: TIER ${roman} ("PSYCHO")!`,
    description:
      'You are branded a total "Psycho" and one of the most volatile athletes in sport. Top clubs actively refuse to touch your contract.',
    consequences: [
      '🟥 Red Card Risk: +60% higher chance of receiving a red card during matches.',
      '🔻 Boycotted by Top Clubs: 75% chance prospective buyers cancel transfer bids entirely.',
      '🔻 Severe Locker Room Hostility: Starting chemistry on newly signed clubs reduced by 30% (starts at 20% instead of 50%).',
      '🔻 Constant Scandals: 30% chance during mid-season of drawing a Negative Lifestyle Card.',
      '🔒 Maximum Lock: Permanently locked at Tier III (100% Bad Reputation).',
    ],
  };
}

/**
 * 5 NEW NEGATIVE LIFESTYLE CARDS (Bronze, Silver, Gold, Legendary)
 * + 1 DISASTER LIFESTYLE CARD (Arson & 3-Year Incarceration)
 */
export const NEW_NEGATIVE_LIFESTYLE_CARDS = [
  {
    id: 'card-life-neg-fines',
    name: 'Unpaid Court Fines',
    category: 'lifestyle' as const,
    type: 'negative' as const,
    rarity: 'Bronze' as const,
    description: 'Summoned to court over unpaid property fines and driving violations. Legal fees drain your account.',
    effects: ['-€25,000 Cash', '-2 Composure', '+15 Bad Reputation'],
    designColor: 'from-amber-950 via-rose-950 to-slate-950',
    iconName: 'AlertTriangle',
    modifiers: { cashDelta: -25000, composureDelta: -2, badRepDelta: 15 },
  },
  {
    id: 'card-life-neg-brawl',
    name: 'Late-Night VIP Club Brawl',
    category: 'lifestyle' as const,
    type: 'negative' as const,
    rarity: 'Silver' as const,
    description: 'Involved in a violent nightclub confrontation. Leaked CCTV shames the club and fractures locker room harmony.',
    effects: ['-15 Chemistry', 'Chemistry capped at 70% for 6 months', '+25 Bad Reputation'],
    designColor: 'from-slate-900 via-rose-950 to-slate-950',
    iconName: 'ShieldAlert',
    modifiers: { chemistryDelta: -15, badRepDelta: 25, chemistryCeiling: 70, chemistryCeilingMonths: 6 },
  },
  {
    id: 'card-life-neg-crash',
    name: 'Supercar Midnight Crash',
    category: 'lifestyle' as const,
    type: 'negative' as const,
    rarity: 'Gold' as const,
    description: 'Totaled an unregistered €280,000 sports car during an illegal street race. Whiplash and trauma degrade physical explosiveness.',
    effects: ['-€280,000 Cash', '-3 Pace', '-2 Reactions', '+30 Bad Reputation'],
    designColor: 'from-yellow-950 via-red-950 to-slate-950',
    iconName: 'Flame',
    modifiers: { cashDelta: -280000, paceDelta: -3, reactionsDelta: -2, badRepDelta: 30 },
  },
  {
    id: 'card-life-neg-yacht',
    name: 'Extravagant Yacht Scandal',
    category: 'lifestyle' as const,
    type: 'negative' as const,
    rarity: 'Legendary' as const,
    description: 'Sensational viral footage of reckless partying aboard a chartered superyacht causes national sponsor boycotts.',
    effects: ['-25 Chemistry', '-5 Stamina for 1 Year', '+40 Bad Reputation'],
    designColor: 'from-purple-950 via-rose-950 to-slate-950',
    iconName: 'Sparkles',
    modifiers: { chemistryDelta: -25, staminaDelta: -5, badRepDelta: 40 },
  },
  {
    id: 'card-life-neg-gambling',
    name: 'High-Stakes Gambling Ring',
    category: 'lifestyle' as const,
    type: 'negative' as const,
    rarity: 'Silver' as const,
    description: 'Underground casino debts spiral with shadowy syndicates. Relentless debt collectors shatter your peace of mind.',
    effects: ['-€75,000 Cash', '-4 Composure', '+35 Bad Reputation'],
    designColor: 'from-slate-900 via-amber-950 to-slate-950',
    iconName: 'DollarSign',
    modifiers: { cashDelta: -75000, composureDelta: -4, badRepDelta: 35 },
  },
  // DISASTER LIFESTYLE CARD
  {
    id: 'card-life-disaster-arson',
    name: 'Arson Scandal & 3-Year Incarceration',
    category: 'lifestyle' as const,
    type: 'negative' as const,
    rarity: 'Disaster' as const,
    tier: 'disaster' as const,
    isDisaster: true,
    description: 'A catastrophic late-night party ends in your villa burning to ashes with neighboring property damages. Convicted of reckless arson and insurance fraud, you are sentenced to 3 years in state prison. Your professional contract is terminated, 3 seasons elapse behind bars, and you return to football as a Free Agent, 3 years older.',
    effects: [
      '3-Season Prison Sentence (+3 Years Age Timeskip)',
      'Contract Terminated → Released as Free Agent',
      '-€500,000 Restitution & Legal Settlement',
      '+100 Bad Reputation (Tier III Locked)',
    ],
    designColor: 'from-red-950 via-black to-slate-950',
    iconName: 'Flame',
    modifiers: { isArsonDisaster: true, ageSkip: 3, badRepDelta: 100, cashDelta: -500000 },
  },
];

/**
 * Executes the Disaster Arson 3-year timeskip, logging 3 incarceration seasons and returning the player as a Free Agent 3 years older.
 */
export function applyArsonDisasterTimeskip(
  player: PlayerCardData,
  accounting?: AccountingState
): {
  updatedPlayer: PlayerCardData;
  updatedAccounting?: AccountingState;
  message: string;
} {
  const currentAge = player.age || 20;
  const newAge = currentAge + 3;
  const baseYear = 2026 + Math.max(0, currentAge - 10);

  const existingSeasons = player.careerHistory?.seasonsPlayed || [];
  const incarcerationSeasons: CareerSeasonRecord[] = [1, 2, 3].map((yearOffset) => ({
    seasonYear: `${baseYear + yearOffset - 1}/${(baseYear + yearOffset) % 100}`,
    age: currentAge + yearOffset,
    teamName: 'Incarcerated (Prison)',
    squadLevel: 'None',
    competitionName: 'Incarceration',
    isYouth: false,
    matches: 0,
    goals: 0,
    assists: 0,
    avgRating: 0,
    trophiesWon: [],
    awardsWon: [],
    keyHighlight: `Year ${yearOffset} of 3-year prison sentence following Arson Scandal.`,
  }));

  const updatedPlayer: PlayerCardData = {
    ...player,
    age: newAge,
    club: 'Free Agent',
    league: 'Free Agent',
    isFreeAgent: true,
    squadRole: 'Free Agent',
    contractYearsRemaining: 0,
    youthLeagueTeam: undefined,
    isBigClubYouth: false,
    chemistry: 20, // Tier 3 starting chemistry
    badReputationTier: 3,
    badReputation: 100, // Locked
    historyLog: [
      ...(player.historyLog || []),
      `🚨 [Age ${currentAge + 1}] Year 1 of Incarceration (Arson Scandal). Professional contract terminated.`,
      `🚨 [Age ${currentAge + 2}] Year 2 of Incarceration. Fitness maintenance and isolation.`,
      `🚨 [Age ${currentAge + 3}] Year 3 of Incarceration completed. Released as a Free Agent.`,
    ],
    careerHistory: player.careerHistory
      ? {
          ...player.careerHistory,
          seasonsPlayed: [...existingSeasons, ...incarcerationSeasons],
        }
      : undefined,
  };

  const currentSavings = accounting?.totalSavings ?? (player as any).savings ?? 0;
  const deduction = Math.min(500000, currentSavings);

  const updatedAccounting: AccountingState = accounting
    ? {
        ...accounting,
        contractYears: 0,
        yearlySalary: 0,
        totalSavings: Math.max(0, currentSavings - deduction),
      }
    : {
        contractYears: 0,
        yearlySalary: 0,
        sponsors: [],
        sanctions: [],
        businesses: [],
        totalSavings: Math.max(0, currentSavings - deduction),
      };

  return {
    updatedPlayer,
    updatedAccounting,
    message: `🔥 DISASTER OCCURRED: ARSON CONVICTION! You served 3 years in state prison. Contract voided. You return to football at Age ${newAge} as a Free Agent, determined to rebuild your life!`,
  };
}
