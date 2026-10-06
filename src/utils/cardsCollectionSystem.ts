import { CareerCollectedCard } from '../types';

export interface InfamyTierInfo {
  tierNumber: 0 | 1 | 2 | 3;
  tierRoman: 'None' | 'Tier I' | 'Tier II' | 'Tier III';
  name: 'Clean Record' | 'Bad Boy' | 'Menace' | 'Psycho' | 'I "Bad Boy"' | 'II "Menace"' | 'III "Psycho"';
  ovrValuationPenalty: number; // 0 for Normal, 10 for Tier 1, 20 for Tier 2, 30 for Tier 3
  maxContractYears: number; // 3 for Normal, 2 for Tier 1, 1 for Tier 2 & Tier 3
  description: string;
}

export function getInfamyTierInfo(badRep: number): InfamyTierInfo {
  const score = Math.max(1, badRep);
  if (score < 100) {
    return {
      tierNumber: 0,
      tierRoman: 'None',
      name: 'Clean Record',
      ovrValuationPenalty: 0,
      maxContractYears: 3,
      description: 'Clean reputation. Clubs offer standard long-term contracts (up to 3 years) with full OVR transfer valuation.',
    };
  }
  if (score < 125) {
    return {
      tierNumber: 1,
      tierRoman: 'Tier I',
      name: 'I "Bad Boy"',
      ovrValuationPenalty: 10,
      maxContractYears: 2,
      description: 'Infamy Tier 1 (Bad Boy). Increases match red card chance by +20% and reduces transfer valuation by ~10 OVR points. Max contract length: 2 years.',
    };
  }
  if (score < 150) {
    return {
      tierNumber: 2,
      tierRoman: 'Tier II',
      name: 'II "Menace"',
      ovrValuationPenalty: 20,
      maxContractYears: 1,
      description: 'Infamy Tier 2 (Menace). Increases match red card chance by +40% and reduces transfer valuation by ~20 OVR points. Max contract length: 1 year.',
    };
  }
  return {
    tierNumber: 3,
    tierRoman: 'Tier III',
    name: 'III "Psycho"',
    ovrValuationPenalty: 30,
    maxContractYears: 1,
    description: 'Infamy Tier 3 (Psycho). Increases match red card chance by +60% and causes 75% transfer boycott. Max contract length: 1 year.',
  };
}

export function getInfamyTier(badRep: number): 'None' | 'Tier I' | 'Tier II' | 'Tier III' {
  return getInfamyTierInfo(badRep).tierRoman;
}

/**
 * Calculates Bad Reputation draw chance percentage:
 * Formula: BadReputation * 0.1%
 * 1 -> 0.1%
 * 10 -> 1%
 * 50 -> 5%
 * 90 -> 9%
 * 100 -> 10%
 */
export function getBadFameDrawChancePercent(badRep: number): number {
  const score = Math.max(1, badRep);
  return Number((score * 0.1).toFixed(1));
}

export interface FameMilestone {
  minFame: number;
  title: string;
  description: string;
}

export const FAME_MILESTONES: FameMilestone[] = [
  { minFame: 1000, title: 'GOAT Status', description: 'Only players such as Cristiano Ronaldo, Messi, Pelé, Maradona, Cruyff and Beckenbauer occupy this tier.' },
  { minFame: 900, title: 'Best Ever', description: 'Recognized globally as one of the all-time footballing greats.' },
  { minFame: 800, title: 'World Cup Star', description: 'Key superstar leading national sides on football\'s grandest stage.' },
  { minFame: 700, title: 'Champions League Star', description: 'Decisive matchwinner in elite continental football.' },
  { minFame: 600, title: 'Elite', description: 'World-class standard player coveted by top European clubs.' },
  { minFame: 500, title: 'Top Player', description: 'Established international star and key club tactical pillar.' },
  { minFame: 400, title: 'Continental Talent', description: 'Prominent player competing in major continental competitions.' },
  { minFame: 300, title: 'Local Talent', description: 'Fan favorite and household name in your domestic league.' },
  { minFame: 200, title: 'Starter', description: 'Reliable first-team starter in professional league football.' },
  { minFame: 100, title: 'Professional Player', description: 'Established senior professional squad member.' },
  { minFame: 10, title: 'Known', description: 'Professional clubs begin scouting you based on your Potential.' },
  { minFame: 0, title: 'Nobody', description: 'Unproven youth prospect starting their career story.' },
];

export function getFameMilestone(fame: number): FameMilestone {
  const currentFame = Math.max(0, Math.min(1000, fame));
  return FAME_MILESTONES.find((m) => currentFame >= m.minFame) || FAME_MILESTONES[FAME_MILESTONES.length - 1];
}

export const BAD_FAME_CARD_POOL: Omit<CareerCollectedCard, 'id' | 'obtainedAt'>[] = [
  {
    name: 'Training Ground Bust-up',
    category: 'bad_fame',
    rarity: 'Rare',
    effects: ['+10 Bad Reputation Score', 'Teammate Tension', '+2 Aggression in Matches'],
    designColor: 'from-rose-800 via-red-950 to-slate-950',
    iconName: 'Flame',
  },
  {
    name: 'Nightclub Curfew Breach',
    category: 'bad_fame',
    rarity: 'Epic',
    effects: ['+12 Bad Reputation Score', 'Club Wage Fine Sanction', '-1 Conditioning'],
    designColor: 'from-purple-900 via-rose-950 to-slate-950',
    iconName: 'ShieldAlert',
  },
  {
    name: 'Referee Confrontation Fine',
    category: 'bad_fame',
    rarity: 'Common',
    effects: ['+8 Bad Reputation Score', 'League Conduct Warning', '+3 Match Intensity'],
    designColor: 'from-rose-700 via-red-900 to-slate-900',
    iconName: 'Flame',
  },
  {
    name: 'Social Media Controversy',
    category: 'bad_fame',
    rarity: 'Epic',
    effects: ['+15 Bad Reputation Score', 'Sponsorship Review', '+10 Brand Exposure'],
    designColor: 'from-amber-700 via-rose-900 to-slate-950',
    iconName: 'Flame',
  },
  {
    name: 'Tactical Disobedience Incident',
    category: 'bad_fame',
    rarity: 'Legendary',
    effects: ['+20 Bad Reputation Score', 'Manager Trust Penalty', 'Transfer List Risk'],
    designColor: 'from-red-800 via-rose-950 to-black',
    iconName: 'ShieldAlert',
  },
];

export function getRandomBadFameCard(currentSeasonAge: number): CareerCollectedCard {
  const template = BAD_FAME_CARD_POOL[Math.floor(Math.random() * BAD_FAME_CARD_POOL.length)];
  return {
    ...template,
    id: `badfame-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    obtainedAt: `Age ${currentSeasonAge} - Season Preseason/Midseason`,
  };
}

export const DEFAULT_COLLECTED_CARDS: CareerCollectedCard[] = [
  {
    id: 'parent-01',
    name: 'Former Pro Athlete Parent',
    category: 'parent',
    rarity: 'Rare',
    effects: [
      '+2 Physicality Base Rating',
      '+1 Stamina Growth Rate',
      'Elite Athletic Genetics & Discipline',
    ],
    obtainedAt: 'Age 16 - Youth Academy Entrance',
    designColor: 'from-blue-600 via-indigo-700 to-slate-900',
    iconName: 'Users',
  },
  {
    id: 'badfame-01',
    name: 'Heated Press Outburst',
    category: 'bad_fame',
    rarity: 'Epic',
    effects: [
      '+15 Bad Reputation Score',
      'Media Controversy Target',
      '+5 Composure Under Pressure',
    ],
    obtainedAt: 'Age 19 - Season 1 Matchday 12',
    designColor: 'from-rose-700 via-red-900 to-slate-950',
    iconName: 'Flame',
  },
  {
    id: 'career-01',
    name: 'Golden Boot Prospect Award',
    category: 'other_career',
    rarity: 'Legendary',
    effects: [
      '+5 Finishing & Shooting Power',
      '2x Sponsorship Deal Value',
      'Fan Favorite Status Unlocked',
    ],
    obtainedAt: 'Age 20 - Season 2 Preseason',
    designColor: 'from-amber-500 via-yellow-600 to-slate-900',
    iconName: 'Trophy',
  },
];
