import { PlayerCardData, OutfieldDetailedStats, GkDetailedStats } from '../types';
import {
  getOrCreateOutfieldDetailed,
  getOrCreateGkDetailed,
  syncCategoryStatsFromDetailed,
  syncCategoryStatsFromGkDetailed,
  calculateWeightedOvr,
} from './statCalculations';
import {
  getFootballSchoolForClub,
  getFootballSchoolById,
  mapPositionToCategory,
  DEVELOPMENT_STAGES,
  getDevelopmentStageForAge,
} from '../data/youthFootballSchools';
import {
  FootballSchoolPhilosophy,
  PositionCategoryKey,
  DevelopmentStageInfo,
} from '../types/youthFootballSchools';
import {
  applyStatPointInvestment,
  isStatWeaknessForPlayerType,
} from './statProgressionSystem';

export type DevelopmentTierNumber = 1 | 2 | 3 | 4 | 5;
export type DevelopmentTierName = 'Exceptional' | 'Elite' | 'Very Good' | 'Good' | 'Basic';

export interface ClubDevelopmentTierInfo {
  tier: DevelopmentTierNumber;
  name: DevelopmentTierName;
  annualPoints: number; // Under-20 points
  seniorAnnualPoints: number; // Past age 20: Tier 1: 5, Tier 2: 8, Tier 3: 10, Tier 4: 12, Tier 5: 15
  pointsLabel: string;
  seniorPointsLabel: string;
  description: string;
  badgeClass: string;
  colorClass: string;
  examples: string[];
}

export const CLUB_DEVELOPMENT_TIERS: Record<DevelopmentTierNumber, ClubDevelopmentTierInfo> = {
  5: {
    tier: 5,
    name: 'Exceptional',
    annualPoints: 30,
    seniorAnnualPoints: 15,
    pointsLabel: '+30/year',
    seniorPointsLabel: '+15/year',
    description: 'Tier 5/5 — Exceptional (+30/year youth, +15/year age 20+): Elite development environments with the highest standard of infrastructure and coaching.',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    colorClass: 'text-amber-400',
    examples: [
      'SL Benfica',
      'FC Barcelona',
      'River Plate',
      'Ajax',
      'Boca Juniors',
      'Sporting CP',
      'Dinamo Zagreb',
      'Defensor Sporting',
      'Real Madrid',
      'Vélez Sarsfield',
    ],
  },
  4: {
    tier: 4,
    name: 'Elite',
    annualPoints: 25,
    seniorAnnualPoints: 12,
    pointsLabel: '+25/year',
    seniorPointsLabel: '+12/year',
    description: 'Tier 4/5 — Elite (+25/year youth, +12/year age 20+): Continental development powerhouses with renowned coaching and talent progression.',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    colorClass: 'text-purple-400',
    examples: [
      'Red Star Belgrade',
      'São Paulo FC',
      'Dynamo Kyiv',
      'Corinthians',
      'Flamengo',
      'San Lorenzo',
      'Nacional',
      'Palmeiras',
      'PSG',
      'Partizan Belgrade',
      'Manchester City',
      'Atlético Nacional',
      'Lanús',
      'Rosario Central',
      'Anderlecht',
      "Newell's Old Boys",
      'Genk',
      'Cerro Porteño',
      'Danubio',
      'PSV',
      'Santos',
      'Independiente del Valle',
      'Grêmio',
      'Lyon',
      'Cruzeiro',
    ],
  },
  3: {
    tier: 3,
    name: 'Very Good',
    annualPoints: 20,
    seniorAnnualPoints: 10,
    pointsLabel: '+20/year',
    seniorPointsLabel: '+10/year',
    description: 'Tier 3/5 — Very Good (+20/year youth, +10/year age 20+): High-quality professional development infrastructure with strong training setups.',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    colorClass: 'text-emerald-400',
    examples: [
      'Libertad',
      'Internacional',
      'Fluminense',
      'Red Bull Salzburg',
      'Peñarol',
      'Estudiantes',
      'Shakhtar Donetsk',
      'AZ Alkmaar',
      'Stade Rennais',
      'Argentinos Juniors',
      'Hajduk Split',
      'Racing Club',
      'Arsenal',
      'Envigado',
    ],
  },
  2: {
    tier: 2,
    name: 'Good',
    annualPoints: 15,
    seniorAnnualPoints: 8,
    pointsLabel: '+15/year',
    seniorPointsLabel: '+8/year',
    description: 'Tier 2/5 — Good (+15/year youth, +8/year age 20+): Established professional first-division clubs with active development setups.',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    colorClass: 'text-blue-400',
    examples: [
      'TSG 1899 Hoffenheim',
      'Chelsea',
      'Liverpool',
      'Manchester United',
      'Tottenham',
      'Borussia Dortmund',
      'Bayern Munich',
      'Atlético Madrid',
      'Bayer Leverkusen',
      'AS Monaco',
      'Real Sociedad',
      'Porto',
      'Sevilla',
      'Villarreal',
      'Athletic Bilbao',
      'Mid-to-top division clubs with established academies',
    ],
  },
  1: {
    tier: 1,
    name: 'Basic',
    annualPoints: 10,
    seniorAnnualPoints: 5,
    pointsLabel: '+10/year',
    seniorPointsLabel: '+5/year',
    description: 'Tier 1/5 — Basic (+10/year youth, +5/year age 20+): Lower-resource professional clubs and lower-tier professional league setups.',
    badgeClass: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    colorClass: 'text-slate-400',
    examples: [
      'Lower-rated first-division clubs',
      'Low-rated Argentine second-division clubs',
      'Low-rated Brazilian second-division clubs',
      'Lower-resource professional clubs with limited youth infrastructure',
    ],
  },
};

/**
 * Calculates annual club development stat points based on player age, club tier, and youth status.
 * - Under age 20:
 *   - Youth Academy: 15 (Average) or 20 (Top Tier)
 *   - Pro Club: Tier 1: 10, Tier 2: 15, Tier 3: 20, Tier 4: 25, Tier 5: 30
 * - Past age 20 (Age 20+):
 *   - Tier 1: 5 stat points
 *   - Tier 2: 8 stat points
 *   - Tier 3: 10 stat points
 *   - Tier 4: 12 stat points
 *   - Tier 5: 15 stat points
 */
export function getClubAnnualDevelopmentPoints(
  tier: DevelopmentTierNumber,
  age: number,
  isYouth?: boolean,
  isBigClub?: boolean
): number {
  if (isYouth) {
    if (age >= 20) {
      return isBigClub ? 10 : 8;
    }
    return isBigClub ? 20 : 15;
  }

  if (age >= 20) {
    switch (tier) {
      case 1:
        return 5;
      case 2:
        return 8;
      case 3:
        return 10;
      case 4:
        return 12;
      case 5:
        return 15;
      default:
        return 8;
    }
  }

  switch (tier) {
    case 1:
      return 10;
    case 2:
      return 15;
    case 3:
      return 20;
    case 4:
      return 25;
    case 5:
      return 30;
    default:
      return 15;
  }
}

/**
 * Checks if a club/league represents a Youth Academy rather than a professional club.
 */
export function isYouthAcademyClub(clubName?: string, leagueName?: string, isPro?: boolean): boolean {
  if (isPro === false) return true;
  const cName = (clubName || '').toLowerCase().trim();
  const lName = (leagueName || '').toLowerCase().trim();
  if (!cName && !lName) return true;
  return (
    lName.includes('juvenil') ||
    lName.includes('youth') ||
    lName.includes('jeunes') ||
    lName.includes('paulista') ||
    lName.includes('bonaerense') ||
    lName.includes('madrileña') ||
    lName.includes('madrilena') ||
    lName.includes('academy') ||
    cName.includes('academy') ||
    cName.includes('youth') ||
    cName.includes('juvenil') ||
    cName.includes('sub-17') ||
    cName.includes('u17') ||
    cName.includes('sub-20') ||
    cName.includes('u20')
  );
}

export interface ClubDevelopmentDisplayInfo {
  isYouthAcademy: boolean;
  tier?: DevelopmentTierNumber;
  name: string;
  annualPoints: number;
  pointsLabel: string;
  displayText: string;
  badgeClass: string;
  colorClass: string;
  description: string;
}

export function getClubDevelopmentInfo(
  clubName?: string,
  leagueName?: string,
  countryName?: string,
  fame?: number,
  isPro?: boolean,
  playerOrOptions?: PlayerCardData | { isBigClub?: boolean; youthAcademyTier?: string; youthDevelopmentPoints?: number; youthClubChoice?: string; isBigClubYouth?: boolean; age?: number }
): ClubDevelopmentDisplayInfo {
  const isYouth = isYouthAcademyClub(clubName, leagueName, isPro);
  const age = (playerOrOptions as any)?.age ?? 16;
  const isPast20 = age >= 20;

  if (isYouth) {
    const isBig = Boolean(
      (playerOrOptions as any)?.isBigClubYouth ||
      (playerOrOptions as any)?.youthClubChoice === 'big_club' ||
      (playerOrOptions as any)?.youthAcademyTier === 'Youth Academy Top Tier' ||
      (playerOrOptions as any)?.youthDevelopmentPoints === 20 ||
      (playerOrOptions as any)?.isBigClub
    );

    const annualPoints = getClubAnnualDevelopmentPoints(isBig ? 3 : 2, age, true, isBig);

    if (isBig) {
      return {
        isYouthAcademy: true,
        name: 'Youth Academy Top Tier',
        annualPoints,
        pointsLabel: `+${annualPoints}/year`,
        displayText: `YOUTH ACADEMY TOP TIER — +${annualPoints}/year`,
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        colorClass: 'text-amber-400',
        description: `Youth Academy Top Tier provides ${annualPoints} development stat points per year through elite coaching, superior facilities, and high-intensity tactical training.`,
      };
    }

    return {
      isYouthAcademy: true,
      name: 'Average Youth Academy Tier',
      annualPoints,
      pointsLabel: `+${annualPoints}/year`,
      displayText: `AVERAGE YOUTH ACADEMY TIER — +${annualPoints}/year`,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      colorClass: 'text-emerald-400',
      description: `Average Youth Academy Tier provides ${annualPoints} development stat points per year in a steady developmental environment.`,
    };
  }

  const proTier = getClubDevelopmentTier(clubName, leagueName, countryName, fame);
  const annualPoints = getClubAnnualDevelopmentPoints(proTier.tier, age);
  const pointsLabel = `+${annualPoints}/year`;

  return {
    isYouthAcademy: false,
    tier: proTier.tier,
    name: proTier.name,
    annualPoints,
    pointsLabel,
    displayText: `TIER ${proTier.tier}/5 — ${proTier.name} (${pointsLabel})`,
    badgeClass: proTier.badgeClass,
    colorClass: proTier.colorClass,
    description: isPast20
      ? `Tier ${proTier.tier}/5 — ${proTier.name} (+${annualPoints}/year): Senior club development providing ${annualPoints} stat points per year distributed according to club development style.`
      : proTier.description,
  };
}

/**
 * Normalizes club name for robust matching:
 * Strips accents, lowers case, removes punctuation and extra whitespace.
 */
function normalizeName(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics / accents
    .replace(/[.'’"´`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * AUTHORITATIVE CLUB DEVELOPMENT DATABASE:
 * Tiers 5, 4, and 3 are defined strictly from the supplied source of truth.
 */
const TIER_5_CANONICAL_NAMES: string[] = [
  'sl benfica',
  'benfica',
  'sport lisboa e benfica',
  'fc barcelona',
  'barcelona',
  'barca',
  'river plate',
  'ca river plate',
  'ajax',
  'afc ajax',
  'ajax amsterdam',
  'boca juniors',
  'ca boca juniors',
  'boca',
  'sporting cp',
  'sporting lisbon',
  'sporting clube de portugal',
  'dinamo zagreb',
  'gnk dinamo zagreb',
  'defensor sporting',
  'defensor sporting club',
  'defensor',
  'real madrid',
  'real madrid cf',
  'velez sarsfield',
  'ca velez sarsfield',
  'velez',
];

const TIER_4_CANONICAL_NAMES: string[] = [
  'red star belgrade',
  'crvena zvezda',
  'fk crvena zvezda',
  'red star',
  'sao paulo fc',
  'sao paulo',
  'spfc',
  'dynamo kyiv',
  'dynamo kiev',
  'fc dynamo kyiv',
  'dinamo kiev',
  'dinamo kyiv',
  'corinthians',
  'sc corinthians',
  'corinthians paulista',
  'sccp',
  'flamengo',
  'cr flamengo',
  'san lorenzo',
  'ca san lorenzo',
  'san lorenzo de almagro',
  'nacional de montevideo',
  'club nacional de football',
  'nacional uru',
  'nacional', // handled with care in matching helper
  'palmeiras',
  'se palmeiras',
  'psg',
  'paris saint germain',
  'paris saint-germain',
  'paris sg',
  'partizan belgrade',
  'fk partizan',
  'partizan',
  'manchester city',
  'man city',
  'mancity',
  'atletico nacional',
  'ca atletico nacional',
  'lanus',
  'ca lanus',
  'rosario central',
  'ca rosario central',
  'anderlecht',
  'rsc anderlecht',
  'newells old boys',
  'newell s old boys',
  'newells',
  'newell s',
  'nob',
  'genk',
  'krc genk',
  'cerro porteno',
  'club cerro porteno',
  'danubio',
  'danubio fc',
  'psv',
  'psv eindhoven',
  'santos',
  'santos fc',
  'independiente del valle',
  'idv',
  'gremio',
  'gremio fbpa',
  'lyon',
  'olympique lyonnais',
  'olympique lyon',
  'ol',
  'cruzeiro',
  'cruzeiro ec',
];

const TIER_3_CANONICAL_NAMES: string[] = [
  'libertad',
  'club libertad',
  'internacional',
  'sc internacional',
  'inter de porto alegre',
  'inter rs',
  'fluminense',
  'fluminense fc',
  'red bull salzburg',
  'rb salzburg',
  'salzburg',
  'fc red bull salzburg',
  'penarol',
  'ca penarol',
  'estudiantes',
  'estudiantes de la plata',
  'edlp',
  'shakhtar donetsk',
  'shakhtar',
  'fc shakhtar',
  'az alkmaar',
  'az',
  'stade rennais',
  'rennes',
  'stade rennais fc',
  'argentinos juniors',
  'argentinos jrs',
  'argentinos',
  'hajduk split',
  'hnk hajduk split',
  'hajduk',
  'racing club',
  'racing club de avellaneda',
  'racing',
  'arsenal',
  'arsenal fc',
  'envigado',
  'envigado fc',
];

/**
 * Checks if normalized query matches a candidate name list.
 * Includes token boundary matching to avoid false substrings (e.g., prevents "internacional" matching "nacional").
 */
function matchesClubList(query: string, candidateList: string[]): boolean {
  if (!query) return false;
  const q = normalizeName(query);

  // Exact match first
  if (candidateList.includes(q)) return true;

  for (const candidate of candidateList) {
    const c = normalizeName(candidate);
    if (q === c) return true;

    // Word boundary / token match
    // E.g. "ca river plate" matches "river plate"
    if (c.length >= 4) {
      const regex = new RegExp(`(^|\\b)${c}(\\b|$)`, 'i');
      if (regex.test(q)) {
        // Special guard: "nacional" alone should not match "internacional" or "atletico nacional"
        if (c === 'nacional' && (q.includes('internacional') || q.includes('atletico'))) {
          continue;
        }
        // Special guard: "racing" alone should not match "racing santander" unless specified
        if (c === 'racing' && q.includes('santander')) {
          continue;
        }
        // Special guard: "arsenal" alone should not match "arsenal de sarandi" (Argentina)
        if (c === 'arsenal' && q.includes('sarandi')) {
          continue;
        }
        // Special guard: "inter" alone should not match "internazionale"
        if (c === 'inter' && q.includes('internazionale')) {
          continue;
        }
        return true;
      }
    }
  }
  return false;
}

/**
 * Returns the club's Development Tier (1 to 5) and associated metadata.
 * Tier 5: +30 pts/year (Elite Development: SL Benfica, FC Barcelona, River Plate, Ajax, Boca Juniors, Sporting CP, Dinamo Zagreb, Defensor Sporting, Real Madrid, Vélez Sarsfield)
 * Tier 4: +20 pts/year (Continental Development: Red Star Belgrade, São Paulo, Dynamo Kyiv, Corinthians, Flamengo, San Lorenzo, Nacional, Palmeiras, PSG, Partizan, Man City, Atlético Nacional, Lanús, Rosario Central, Anderlecht, Newell's, Genk, Cerro Porteño, Danubio, PSV, Santos, IDV, Grêmio, Lyon, Cruzeiro)
 * Tier 3: +15 pts/year (Strong Development: Libertad, Internacional, Fluminense, RB Salzburg, Peñarol, Estudiantes, Shakhtar, AZ Alkmaar, Stade Rennais, Argentinos Juniors, Hajduk Split, Racing Club, Arsenal, Envigado, and all Youth League academies)
 * Tier 2: +10 pts/year (Good Professional Development: Established professional first-division clubs with active academies)
 * Tier 1: +5 pts/year (Basic/Low Development: Lower-rated first-division clubs, low-rated Argentine second-division clubs, low-rated Brazilian second-division clubs, lower-resource professional clubs)
 */
export function getClubDevelopmentTier(
  clubName?: string,
  leagueName?: string,
  countryName?: string,
  fame?: number
): ClubDevelopmentTierInfo {
  const cName = normalizeName(clubName);
  const lName = normalizeName(leagueName);

  // If in a Youth League / Academy, it is automatically Tier 3
  if (
    !cName ||
    lName.includes('juvenil') ||
    lName.includes('youth') ||
    lName.includes('jeunes') ||
    lName.includes('paulista') ||
    lName.includes('bonaerense') ||
    lName.includes('madrileña') ||
    lName.includes('madrilena') ||
    lName.includes('academy')
  ) {
    return CLUB_DEVELOPMENT_TIERS[3];
  }

  // 1. TIER 5 — ELITE DEVELOPMENT (+30 points)
  if (matchesClubList(cName, TIER_5_CANONICAL_NAMES)) {
    return CLUB_DEVELOPMENT_TIERS[5];
  }

  // 2. TIER 4 — CONTINENTAL DEVELOPMENT (+20 points)
  if (matchesClubList(cName, TIER_4_CANONICAL_NAMES)) {
    return CLUB_DEVELOPMENT_TIERS[4];
  }

  // 3. TIER 3 — STRONG DEVELOPMENT (+15 points)
  if (matchesClubList(cName, TIER_3_CANONICAL_NAMES)) {
    return CLUB_DEVELOPMENT_TIERS[3];
  }

  // 4. TIER 1 — BASIC/LOW DEVELOPMENT (+5 points)
  // Low-rated Argentine second-division / regional leagues
  const isArgentineSecondTier =
    lName.includes('primera nacional') ||
    lName.includes('b nacional') ||
    lName.includes('torneo federal') ||
    lName.includes('b metro') ||
    lName.includes('primera b') ||
    lName.includes('segunda argentina');

  // Low-rated Brazilian second-division / lower leagues
  const isBrazilianSecondTier =
    lName.includes('serie b') ||
    lName.includes('serie c') ||
    lName.includes('serie d') ||
    lName.includes('brasileirao b') ||
    lName.includes('brasileirao c');

  // Other lower-tier professional leagues
  const isLowerTierLeague =
    isArgentineSecondTier ||
    isBrazilianSecondTier ||
    lName.includes('championship') ||
    lName.includes('segunda') ||
    lName.includes('2. bundesliga') ||
    lName.includes('ligue 2') ||
    lName.includes('liga 2') ||
    lName.includes('division 2') ||
    lName.includes('eerste divisie') ||
    lName.includes('liga pro');

  // Specific low-rated second-division clubs in Argentina & Brazil
  const lowTierClubs = [
    'brown de adrogue',
    'tristan suarez',
    'flandria',
    'alvarado',
    'guemes',
    'patronato',
    'almagro',
    'agropecuario',
    'mitre',
    'deportivo maipu',
    'chaco for ever',
    'villa dalmine',
    'sacachispas',
    'all boys',
    'estudiantes de rio cuarto',
    'amazonas',
    'brusque',
    'operario',
    'ituano',
    'mirassol',
    'novorizontino',
    'crb',
    'vila nova',
    'paysandu',
    'chapecoense',
    'botafogo sp',
    'ponte preta',
    'guarani',
    'avai',
    'sampaio correa',
    'tombense',
    'londrina',
    'abc',
  ];

  if (isLowerTierLeague || matchesClubList(cName, lowTierClubs)) {
    return CLUB_DEVELOPMENT_TIERS[1];
  }

  // 5. TIER 2 — GOOD PROFESSIONAL DEVELOPMENT (+10 points)
  // Default professional first-division clubs with established academy setups
  return CLUB_DEVELOPMENT_TIERS[2];
}

// -----------------------------------------------------------------------------------------
// POSITION → SUB-POSITION → PLAYSTYLE PRIORITY DEFINITIONS
// -----------------------------------------------------------------------------------------

export interface OutfieldPlayStylePriority {
  primaryStats: (keyof OutfieldDetailedStats)[];
  secondaryStats: (keyof OutfieldDetailedStats)[];
}

export interface GkPlayStylePriority {
  primaryStats: (keyof GkDetailedStats)[];
  secondaryStats: (keyof GkDetailedStats)[];
}

/**
 * Comprehensive Outfield PlayStyle priority mappings
 */
export const OUTFIELD_PLAYSTYLE_PRIORITIES: Record<string, OutfieldPlayStylePriority> = {
  // ST Playstyles
  poacher: {
    primaryStats: ['shooting', 'positioning', 'reactions', 'composure'],
    secondaryStats: ['heading', 'strength', 'pace', 'longShots'],
  },
  target: {
    primaryStats: ['strength', 'heading', 'retention', 'shortPass'],
    secondaryStats: ['shooting', 'positioning', 'ballControl', 'composure'],
  },
  complete: {
    primaryStats: ['shooting', 'dribbling', 'pace', 'ballControl', 'longShots'],
    secondaryStats: ['strength', 'shortPass', 'reactions', 'composure', 'heading'],
  },
  finisher: {
    primaryStats: ['shooting', 'positioning', 'composure', 'reactions'],
    secondaryStats: ['longShots', 'heading', 'ballControl', 'strength'],
  },
  decoy: {
    primaryStats: ['stamina', 'pace', 'positioning', 'reactions'],
    secondaryStats: ['shortPass', 'strength', 'retention', 'interceptions'],
  },

  // Winger (LW / RW) Playstyles
  traditional: {
    primaryStats: ['pace', 'crossing', 'dribbling', 'stamina'],
    secondaryStats: ['shortPass', 'ballControl', 'reactions', 'retention'],
  },
  inverted: {
    primaryStats: ['dribbling', 'shooting', 'ballControl', 'longShots'],
    secondaryStats: ['pace', 'shortPass', 'composure', 'positioning'],
  },
  prolific: {
    primaryStats: ['positioning', 'shooting', 'pace', 'reactions'],
    secondaryStats: ['dribbling', 'composure', 'heading', 'longShots'],
  },
  pressing: {
    primaryStats: ['stamina', 'pace', 'interceptions', 'tackling'],
    secondaryStats: ['reactions', 'strength', 'shortPass', 'retention'],
  },

  // CAM Playstyles
  creator: {
    primaryStats: ['shortPass', 'longPass', 'ballControl', 'dribbling', 'shooting'],
    secondaryStats: ['composure', 'reactions', 'longShots', 'positioning'],
  },
  shadow: {
    primaryStats: ['positioning', 'shooting', 'pace', 'reactions'],
    secondaryStats: ['shortPass', 'ballControl', 'composure', 'longShots'],
  },
  'classic n10': {
    primaryStats: ['ballControl', 'dribbling', 'shortPass', 'longPass', 'composure'],
    secondaryStats: ['longShots', 'shooting', 'retention', 'positioning'],
  },
  engine: {
    primaryStats: ['stamina', 'pace', 'shortPass', 'strength'],
    secondaryStats: ['tackling', 'interceptions', 'ballControl', 'shooting'],
  },

  // CM Playstyles
  'box-to-box': {
    primaryStats: ['stamina', 'shortPass', 'tackling', 'shooting', 'strength'],
    secondaryStats: ['interceptions', 'pace', 'longPass', 'positioning', 'reactions'],
  },
  maestro: {
    primaryStats: ['shortPass', 'longPass', 'ballControl', 'retention', 'composure'],
    secondaryStats: ['reactions', 'positioning', 'longShots', 'shortPass'],
  },
  runner: {
    primaryStats: ['pace', 'stamina', 'strength', 'positioning', 'reactions'],
    secondaryStats: ['shortPass', 'shooting', 'ballControl', 'tackling'],
  },

  // CDM Playstyles
  enforcer: {
    primaryStats: ['strength', 'tackling', 'marking', 'interceptions', 'stamina'],
    secondaryStats: ['shortPass', 'reactions', 'composure', 'heading'],
  },
  anchor: {
    primaryStats: ['interceptions', 'marking', 'positioning', 'shortPass', 'longPass'],
    secondaryStats: ['ballControl', 'composure', 'stamina', 'reactions'],
  },

  // Fullback (LB / RB / LWB / RWB) Playstyles
  defensive: {
    primaryStats: ['tackling', 'marking', 'interceptions', 'strength', 'positioning'],
    secondaryStats: ['stamina', 'pace', 'composure', 'reactions'],
  },
  attacker: {
    primaryStats: ['pace', 'crossing', 'dribbling', 'stamina', 'shortPass'],
    secondaryStats: ['retention', 'reactions', 'positioning', 'ballControl'],
  },
  balanced: {
    primaryStats: ['stamina', 'tackling', 'crossing', 'shortPass', 'pace'],
    secondaryStats: ['interceptions', 'marking', 'positioning', 'reactions'],
  },

  // CB Playstyles
  destroyer: {
    primaryStats: ['strength', 'tackling', 'marking', 'heading', 'reactions'],
    secondaryStats: ['stamina', 'interceptions', 'composure', 'positioning'],
  },
  distributor: {
    primaryStats: ['shortPass', 'longPass', 'ballControl', 'composure', 'marking'],
    secondaryStats: ['interceptions', 'tackling', 'positioning', 'reactions'],
  },
  playmaker: {
    primaryStats: ['shortPass', 'longPass', 'ballControl', 'composure', 'interceptions'],
    secondaryStats: ['tackling', 'marking', 'positioning', 'retention', 'reactions'],
  },
  stopper: {
    primaryStats: ['positioning', 'interceptions', 'tackling', 'marking', 'reactions'],
    secondaryStats: ['strength', 'heading', 'composure', 'stamina'],
  },
};

/**
 * Goalkeeper PlayStyle priority mappings
 */
export const GK_PLAYSTYLE_PRIORITIES: Record<string, GkPlayStylePriority> = {
  wall: {
    primaryStats: ['saving', 'reflexes', 'oneOnOne', 'handling'],
    secondaryStats: ['positioning', 'aerialReach', 'distribution'],
  },
  sweeper: {
    primaryStats: ['distribution', 'positioning', 'oneOnOne', 'reflexes'],
    secondaryStats: ['saving', 'handling', 'aerialReach'],
  },
  balanced: {
    primaryStats: ['saving', 'reflexes', 'handling', 'positioning'],
    secondaryStats: ['aerialReach', 'oneOnOne', 'distribution'],
  },
};

/**
 * Sub-Position core attribute sequence
 */
export const SUB_POSITION_CORE_STATS: Record<string, (keyof OutfieldDetailedStats)[]> = {
  ST: ['shooting', 'positioning', 'heading', 'ballControl', 'dribbling', 'pace', 'strength', 'reactions', 'composure', 'longShots'],
  LW: ['pace', 'dribbling', 'crossing', 'ballControl', 'shooting', 'stamina', 'positioning', 'reactions', 'shortPass'],
  RW: ['pace', 'dribbling', 'crossing', 'ballControl', 'shooting', 'stamina', 'positioning', 'reactions', 'shortPass'],
  CAM: ['shortPass', 'longPass', 'ballControl', 'dribbling', 'shooting', 'positioning', 'composure', 'reactions', 'longShots'],
  CM: ['shortPass', 'longPass', 'stamina', 'ballControl', 'positioning', 'tackling', 'retention', 'interceptions', 'reactions', 'strength'],
  CDM: ['tackling', 'marking', 'interceptions', 'stamina', 'strength', 'shortPass', 'positioning', 'composure', 'longPass'],
  LB: ['pace', 'stamina', 'crossing', 'tackling', 'interceptions', 'shortPass', 'marking', 'positioning', 'dribbling'],
  RB: ['pace', 'stamina', 'crossing', 'tackling', 'interceptions', 'shortPass', 'marking', 'positioning', 'dribbling'],
  LWB: ['pace', 'stamina', 'crossing', 'tackling', 'interceptions', 'shortPass', 'dribbling', 'retention', 'positioning'],
  RWB: ['pace', 'stamina', 'crossing', 'tackling', 'interceptions', 'shortPass', 'dribbling', 'retention', 'positioning'],
  CB: ['tackling', 'marking', 'interceptions', 'strength', 'heading', 'positioning', 'reactions', 'composure', 'shortPass'],
};

/**
 * Position category fallback sequence
 */
export const POSITION_CATEGORY_CORE_STATS: Record<PositionCategoryKey, (keyof OutfieldDetailedStats)[]> = {
  ST: ['shooting', 'dribbling', 'pace', 'positioning', 'ballControl', 'heading', 'longShots', 'reactions', 'composure', 'retention', 'strength'],
  WINGER: ['pace', 'dribbling', 'crossing', 'ballControl', 'shooting', 'stamina', 'positioning', 'reactions', 'shortPass', 'retention'],
  CAM: ['shortPass', 'longPass', 'ballControl', 'dribbling', 'shooting', 'positioning', 'composure', 'reactions', 'longShots', 'retention'],
  CM: ['shortPass', 'longPass', 'ballControl', 'stamina', 'dribbling', 'retention', 'positioning', 'interceptions', 'tackling', 'composure'],
  CDM: ['tackling', 'marking', 'interceptions', 'stamina', 'strength', 'shortPass', 'positioning', 'composure', 'longPass'],
  FULLBACK: ['pace', 'stamina', 'crossing', 'tackling', 'interceptions', 'shortPass', 'marking', 'positioning', 'dribbling'],
  CB: ['tackling', 'marking', 'interceptions', 'strength', 'heading', 'stamina', 'pace', 'positioning', 'reactions', 'shortPass'],
  GK: [],
};

const ALL_OUTFIELD_KEYS: (keyof OutfieldDetailedStats)[] = [
  'pace', 'stamina', 'strength', 'ballControl', 'retention', 'dribbling',
  'shortPass', 'longPass', 'crossing', 'shooting', 'heading', 'longShots',
  'tackling', 'marking', 'interceptions', 'positioning', 'composure', 'reactions'
];

const ALL_GK_KEYS: (keyof GkDetailedStats)[] = [
  'saving', 'reflexes', 'handling', 'positioning', 'aerialReach', 'oneOnOne', 'distribution'
];

export interface ClubStatDistributionResult {
  applied: boolean;
  tier: ClubDevelopmentTierInfo;
  philosophy: FootballSchoolPhilosophy;
  positionCategory: PositionCategoryKey;
  totalPoints: number;
  allocatedStats: Array<{
    key: string;
    label: string;
    gain: number;
    oldVal: number;
    newVal: number;
    statPointsInvested?: number;
    newProgress?: number;
  }>;
  overflowRedirectsCount: number;
  logs: string[];
}

/**
 * Distributes club development stat points across the player's attributes based on their
 * Position → Sub-Position → Playstyle hierarchy and Club Football School Philosophy.
 *
 * Each point is allocated as a STAT POINT using applyStatPointInvestment to progress
 * the attribute level and training bar towards Stat Break 100.
 *
 * 100 STAT OVERFLOW REDIRECTION:
 * When a stat point is assigned to a stat already at 100 (Stat Break Max), it is NEVER lost.
 * It is redirected to the next relevant stat below 100 according to priority.
 */
export function applyClubDevelopmentPointsToPlayer(
  player: PlayerCardData,
  explicitClub?: string,
  explicitLeague?: string,
  explicitTier?: DevelopmentTierNumber
): { updatedPlayer: PlayerCardData; result: ClubStatDistributionResult } {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const age = updated.age || 10;
  const isGk = (updated.subPosition || updated.position || '').toUpperCase() === 'GK';
  const subPosCode = (updated.subPosition || updated.position || 'ST').toUpperCase().trim();
  const playStyleKey = (updated.playStyle || '').toLowerCase().trim();
  const posCategory = mapPositionToCategory(updated.position || 'ST', updated.subPosition);

  const countryName =
    typeof updated.nationality === 'string'
      ? updated.nationality
      : updated.nationality?.name || updated.country || updated.clubCountry || '';

  const clubName = explicitClub || updated.club;
  const leagueName = explicitLeague || updated.league;

  const isYouth = isYouthAcademyClub(clubName, leagueName, (updated as any).isProPlayer);
  const isBigClub = Boolean(
    (updated as any).isBigClubYouth ||
    updated.youthClubChoice === 'big_club' ||
    updated.youthAcademyTier === 'Youth Academy Top Tier' ||
    updated.youthDevelopmentPoints === 20 ||
    (updated as any).isBigClub
  );

  const youthTierInfo: ClubDevelopmentTierInfo = isBigClub
    ? {
        tier: 3,
        name: 'Youth Academy Top Tier' as any,
        annualPoints: 20,
        seniorAnnualPoints: 10,
        pointsLabel: '+20/year',
        seniorPointsLabel: '+10/year',
        description: 'Youth Academy Top Tier provides elite development points per year.',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        colorClass: 'text-amber-400',
        examples: [],
      }
    : {
        tier: 2,
        name: 'Average Youth Academy Tier' as any,
        annualPoints: 15,
        seniorAnnualPoints: 8,
        pointsLabel: '+15/year',
        seniorPointsLabel: '+8/year',
        description: 'Average Youth Academy Tier provides steady development points per year.',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        colorClass: 'text-emerald-400',
        examples: [],
      };

  const tierInfo = isYouth
    ? youthTierInfo
    : (explicitTier
        ? CLUB_DEVELOPMENT_TIERS[explicitTier]
        : getClubDevelopmentTier(clubName, leagueName, countryName, updated.fame));

  const philosophy = getFootballSchoolForClub(
    clubName,
    leagueName,
    updated.city || updated.startingCity,
    countryName
  );

  const hasClubContract = Boolean(
    (clubName && clubName !== 'Free Agent' && leagueName !== 'Street Football') ||
    isYouth ||
    updated.youthLeagueTeam
  );

  if (!hasClubContract) {
    return {
      updatedPlayer: updated,
      result: {
        applied: false,
        tier: tierInfo,
        philosophy,
        positionCategory: posCategory,
        totalPoints: 0,
        allocatedStats: [],
        overflowRedirectsCount: 0,
        logs: [`Age ${age}: Player has no active club contract. Club development points require a team.`],
      },
    };
  }

  // Calculate annual development points based on age and club tier
  // Age < 20: Tier 1: 10, Tier 2: 15, Tier 3: 20, Tier 4: 25, Tier 5: 30 (Youth: 15 or 20)
  // Age >= 20: Tier 1: 5, Tier 2: 8, Tier 3: 10, Tier 4: 12, Tier 5: 15 (Youth: 8 or 10)
  const pointsToDistribute = getClubAnnualDevelopmentPoints(tierInfo.tier, age, isYouth, isBigClub);

  if (pointsToDistribute <= 0) {
    return {
      updatedPlayer: updated,
      result: {
        applied: false,
        tier: tierInfo,
        philosophy,
        positionCategory: posCategory,
        totalPoints: 0,
        allocatedStats: [],
        overflowRedirectsCount: 0,
        logs: [`Age ${age}: Club development points are 0 for this tier.`],
      },
    };
  }

  // Ensure progress and stat break structures exist
  if (!updated.statTrainingProgress) {
    updated.statTrainingProgress = {};
  }
  if (!updated.statBreakStats) {
    updated.statBreakStats = {};
  }

  const logs: string[] = [];
  let overflowRedirectsCount = 0;
  const finalAllocatedStats: ClubStatDistributionResult['allocatedStats'] = [];

  if (isGk) {
    const gk = getOrCreateGkDetailed(updated.stats);
    const initialGk = { ...gk };

    const labelMap: Record<keyof GkDetailedStats, string> = {
      saving: 'Saving Agility',
      reflexes: 'Reflexes',
      handling: 'Handling',
      positioning: 'Positioning',
      aerialReach: 'Aerial Reach',
      oneOnOne: 'One-on-One',
      distribution: 'Distribution',
    };

    // Construct priority chain for Goalkeeper
    const gkPsPriority = GK_PLAYSTYLE_PRIORITIES[playStyleKey] || GK_PLAYSTYLE_PRIORITIES.balanced;
    const priority1 = gkPsPriority.primaryStats;
    const priority2 = gkPsPriority.secondaryStats.filter((k) => !priority1.includes(k));
    const priority3 = ALL_GK_KEYS.filter((k) => !priority1.includes(k) && !priority2.includes(k));

    // Full priority sequence
    const gkPriorityChain: (keyof GkDetailedStats)[] = [...priority1, ...priority2, ...priority3];

    // Compute base weights from Philosophy & PlayStyle
    const gkAlloc = philosophy.allocations.GK;
    const targetWeights: Record<keyof GkDetailedStats, number> = {
      saving: (gkAlloc.saving || 2) + (priority1.includes('saving') ? 4 : priority2.includes('saving') ? 2 : 1),
      reflexes: (gkAlloc.reflexes || 2) + (priority1.includes('reflexes') ? 4 : priority2.includes('reflexes') ? 2 : 1),
      handling: (gkAlloc.handling || 2) + (priority1.includes('handling') ? 4 : priority2.includes('handling') ? 2 : 1),
      positioning: (gkAlloc.positioning || 2) + (priority1.includes('positioning') ? 4 : priority2.includes('positioning') ? 2 : 1),
      aerialReach: (gkAlloc.aerialReach || 1) + (priority1.includes('aerialReach') ? 4 : priority2.includes('aerialReach') ? 2 : 1),
      oneOnOne: (gkAlloc.oneOnOne || 1) + (priority1.includes('oneOnOne') ? 4 : priority2.includes('oneOnOne') ? 2 : 1),
      distribution: (gkAlloc.distribution || 1) + (priority1.includes('distribution') ? 4 : priority2.includes('distribution') ? 2 : 1),
    };

    const totalWeight = Object.values(targetWeights).reduce((a, b) => a + b, 0) || 1;

    // Distribute stat points point-by-point with 100 overflow redirection
    const pointsTracker: Partial<Record<keyof GkDetailedStats, number>> = {};
    ALL_GK_KEYS.forEach((k) => (pointsTracker[k] = 0));

    for (let p = 0; p < pointsToDistribute; p++) {
      let chosenKey: keyof GkDetailedStats = gkPriorityChain[0];
      let bestScore = -9999;

      for (const key of ALL_GK_KEYS) {
        const currentGain = pointsTracker[key] || 0;
        const expectedShare = (targetWeights[key] / totalWeight) * (p + 1);
        const deficit = expectedShare - currentGain;
        if (deficit > bestScore) {
          bestScore = deficit;
          chosenKey = key;
        }
      }

      let targetKey: keyof GkDetailedStats = chosenKey;

      // Check if target key is already at 100 (Stat Break Max)
      if ((gk[targetKey] || 45) >= 100) {
        let redirected = false;
        for (const candidate of gkPriorityChain) {
          if ((gk[candidate] || 45) < 100) {
            targetKey = candidate;
            overflowRedirectsCount++;
            redirected = true;
            break;
          }
        }
        if (!redirected) {
          // All GK stats are at 100
          break;
        }
      }

      // Invest 1 stat point into targetKey using stat points progression
      const curLevel = gk[targetKey] || 45;
      const curProg = updated.statTrainingProgress[targetKey] || 0;
      const isWeakness = isStatWeaknessForPlayerType(updated.playerTypeId, targetKey);
      const invRes = applyStatPointInvestment(curLevel, curProg, 1, isWeakness);

      gk[targetKey] = invRes.newLevel;
      updated.statTrainingProgress[targetKey] = invRes.newProgress;
      if (invRes.statBreakTriggered) {
        updated.statBreakActive = true;
        updated.statBreakStats[targetKey] = 100;
      }
      pointsTracker[targetKey] = (pointsTracker[targetKey] || 0) + 1;
    }

    // Build allocatedStats record for GK
    ALL_GK_KEYS.forEach((key) => {
      const pts = pointsTracker[key] || 0;
      if (pts > 0) {
        const oldVal = initialGk[key] || 45;
        const newVal = gk[key] || 45;
        finalAllocatedStats.push({
          key,
          label: labelMap[key] || key,
          gain: newVal - oldVal,
          oldVal,
          newVal,
          statPointsInvested: pts,
          newProgress: updated.statTrainingProgress[key] || 0,
        });
      }
    });

    updated.stats = syncCategoryStatsFromGkDetailed(updated.stats, gk);
  } else {
    // OUTFIELD PLAYER
    const d = getOrCreateOutfieldDetailed(updated.stats);
    const initialOutfield = { ...d };

    const labelMap: Record<keyof OutfieldDetailedStats, string> = {
      pace: 'Pace',
      stamina: 'Stamina',
      strength: 'Strength',
      ballControl: 'Ball Control',
      retention: 'Retention',
      dribbling: 'Dribbling',
      shortPass: 'Short Pass',
      longPass: 'Long Pass',
      crossing: 'Crossing',
      shooting: 'Shooting',
      heading: 'Heading',
      longShots: 'Long Shots',
      tackling: 'Tackling',
      marking: 'Marking',
      interceptions: 'Interceptions',
      positioning: 'Positioning',
      composure: 'Composure',
      reactions: 'Reactions',
    };

    // 1. PlayStyle Priority Lists
    const psConfig = OUTFIELD_PLAYSTYLE_PRIORITIES[playStyleKey];
    const priority1 = psConfig ? psConfig.primaryStats : [];
    const priority2 = psConfig ? psConfig.secondaryStats.filter((k) => !priority1.includes(k)) : [];

    // 2. Sub-Position Core Stats
    const subPosStats = (SUB_POSITION_CORE_STATS[subPosCode] || SUB_POSITION_CORE_STATS.ST).filter(
      (k) => !priority1.includes(k) && !priority2.includes(k)
    );

    // 3. Position Category & Philosophy Allocations
    const posCatStats = (POSITION_CATEGORY_CORE_STATS[posCategory] || POSITION_CATEGORY_CORE_STATS.ST).filter(
      (k) => !priority1.includes(k) && !priority2.includes(k) && !subPosStats.includes(k)
    );

    // 4. Remaining fallback stats
    const remainingStats = ALL_OUTFIELD_KEYS.filter(
      (k) =>
        !priority1.includes(k) &&
        !priority2.includes(k) &&
        !subPosStats.includes(k) &&
        !posCatStats.includes(k)
    );

    // Full 5-tier Priority Chain
    const outfieldPriorityChain: (keyof OutfieldDetailedStats)[] = [
      ...priority1,
      ...priority2,
      ...subPosStats,
      ...posCatStats,
      ...remainingStats,
    ];

    // Compute Base Weights combining Philosophy allocations with Position, SubPos, and PlayStyle
    const outfieldAlloc = philosophy.allocations[posCategory] || philosophy.allocations.ST;
    const targetWeights: Record<keyof OutfieldDetailedStats, number> = {} as any;

    ALL_OUTFIELD_KEYS.forEach((k) => {
      let weight = (outfieldAlloc[k] || 0) * 1.5;
      if (priority1.includes(k)) weight += 6;
      else if (priority2.includes(k)) weight += 4;
      else if (subPosStats.includes(k)) weight += 2.5;
      else if (posCatStats.includes(k)) weight += 1.5;
      else weight += 0.5;

      targetWeights[k] = Math.max(0.5, weight);
    });

    const totalWeight = Object.values(targetWeights).reduce((a, b) => a + b, 0) || 1;

    // Distribute stat points point-by-point with 100 overflow redirection
    const pointsTracker: Partial<Record<keyof OutfieldDetailedStats, number>> = {};
    ALL_OUTFIELD_KEYS.forEach((k) => (pointsTracker[k] = 0));

    for (let p = 0; p < pointsToDistribute; p++) {
      let chosenKey: keyof OutfieldDetailedStats = outfieldPriorityChain[0];
      let bestScore = -9999;

      for (const key of ALL_OUTFIELD_KEYS) {
        const currentGain = pointsTracker[key] || 0;
        const expectedShare = (targetWeights[key] / totalWeight) * (p + 1);
        const deficit = expectedShare - currentGain;
        if (deficit > bestScore) {
          bestScore = deficit;
          chosenKey = key;
        }
      }

      let targetKey: keyof OutfieldDetailedStats = chosenKey;

      // Check if target key is already at 100 (Stat Break Max)
      if ((d[targetKey] || 45) >= 100) {
        let redirected = false;
        for (const candidate of outfieldPriorityChain) {
          if ((d[candidate] || 45) < 100) {
            targetKey = candidate;
            overflowRedirectsCount++;
            redirected = true;
            break;
          }
        }
        if (!redirected) {
          // All stats are 100
          break;
        }
      }

      // Invest 1 stat point into targetKey using stat points progression
      const curLevel = d[targetKey] || 45;
      const curProg = updated.statTrainingProgress[targetKey] || 0;
      const isWeakness = isStatWeaknessForPlayerType(updated.playerTypeId, targetKey);
      const invRes = applyStatPointInvestment(curLevel, curProg, 1, isWeakness);

      d[targetKey] = invRes.newLevel;
      updated.statTrainingProgress[targetKey] = invRes.newProgress;
      if (invRes.statBreakTriggered) {
        updated.statBreakActive = true;
        updated.statBreakStats[targetKey] = 100;
      }
      pointsTracker[targetKey] = (pointsTracker[targetKey] || 0) + 1;
    }

    // Build allocatedStats record for Outfield
    ALL_OUTFIELD_KEYS.forEach((key) => {
      const pts = pointsTracker[key] || 0;
      if (pts > 0) {
        const oldVal = initialOutfield[key] || 45;
        const newVal = d[key] || 45;
        finalAllocatedStats.push({
          key,
          label: labelMap[key] || key,
          gain: newVal - oldVal,
          oldVal,
          newVal,
          statPointsInvested: pts,
          newProgress: updated.statTrainingProgress[key] || 0,
        });
      }
    });

    updated.stats = syncCategoryStatsFromDetailed(updated.stats, d);
    updated.stats.detailed = d;
  }

  // Recalculate OVR after club development
  const newOvr = isGk
    ? calculateWeightedOvr('GK', 'GK', updated.stats, updated.playStyle)
    : calculateWeightedOvr(
        updated.position || 'ST',
        updated.subPosition || updated.position || 'ST',
        updated.stats,
        updated.playStyle
      );
  updated.ovr = newOvr;

  // Generate logs
  const boostSummary = finalAllocatedStats
    .map((s) => {
      const pts = s.statPointsInvested || 0;
      const lvlGain = s.gain > 0 ? ` (+${s.gain} LVL)` : ` (${Math.round((s.newProgress || 0) * 100)}%)`;
      return `+${pts} ${s.label} PTS${lvlGain}`;
    })
    .join(', ');

  const overflowNote =
    overflowRedirectsCount > 0 ? ` (🔄 ${overflowRedirectsCount} pts redirected from 100 overflow)` : '';

  const eraLabel = age >= 20 ? 'Senior Club' : (isYouth ? 'Youth Academy' : 'Club Youth');
  logs.push(
    `🌟 [${clubName || 'Club'} Development • Tier ${tierInfo.tier} (${tierInfo.name} • ${eraLabel})] +${pointsToDistribute} Stat PTS via ${philosophy.name} (${boostSummary})${overflowNote}`
  );

  return {
    updatedPlayer: updated,
    result: {
      applied: true,
      tier: tierInfo,
      philosophy,
      positionCategory: posCategory,
      totalPoints: pointsToDistribute,
      allocatedStats: finalAllocatedStats,
      overflowRedirectsCount,
      logs,
    },
  };
}

export interface AnnualDevelopmentSummary {
  age: number;
  stage: DevelopmentStageInfo;
  personalPoints: number;
  clubPoints: number;
  totalPoints: number;
  tierInfo: ClubDevelopmentTierInfo;
  philosophy: FootballSchoolPhilosophy;
  clubDistribution?: ClubStatDistributionResult;
  regressionApplied?: boolean;
}

/**
 * Unified Yearly Development Progression:
 * 1. Personal Development Points:
 *    - Ages 10–19: +15 personal PTS (unassigned)
 *    - Ages 20–27: +5 personal PTS (unassigned)
 *    - Ages 28–32: +0 personal PTS
 *    - Ages 33+: -3 PHY PTS per year
 * 2. Club Development Points (continues throughout career, slower past age 20):
 *    - Age < 20: Tier 1: 10, Tier 2: 15, Tier 3: 20, Tier 4: 25, Tier 5: 30 (Youth: 15/20)
 *    - Age >= 20: Tier 1: 5, Tier 2: 8, Tier 3: 10, Tier 4: 12, Tier 5: 15 (Youth: 8/10)
 *    - Allocated as STAT POINTS via club development style & position.
 */
export function calculateUnifiedAnnualProgression(
  player: PlayerCardData,
  targetAge?: number
): { updatedPlayer: PlayerCardData; summary: AnnualDevelopmentSummary } {
  let updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const age = targetAge !== undefined ? targetAge : (updated.age || 10);
  const stage = getDevelopmentStageForAge(age);

  let personalPoints = 0;
  if (age <= 19) {
    personalPoints = 15;
  } else if (age <= 27) {
    personalPoints = 5;
  } else {
    personalPoints = 0;
  }

  // Add personal points to player's freeStatPoints
  const currentUnassigned = updated.freeStatPoints ?? updated.unassignedPoints ?? 0;
  const newUnassigned = currentUnassigned + personalPoints;
  updated.freeStatPoints = newUnassigned;
  updated.unassignedPoints = newUnassigned;

  const countryName =
    typeof updated.nationality === 'string'
      ? updated.nationality
      : updated.nationality?.name || updated.country || updated.clubCountry || '';

  const tierInfo = getClubDevelopmentTier(
    updated.club,
    updated.league,
    countryName,
    updated.fame
  );

  const philosophy = getFootballSchoolForClub(
    updated.club,
    updated.league,
    updated.city || updated.startingCity,
    countryName
  );

  let clubDistribution: ClubStatDistributionResult | undefined;
  let clubPoints = 0;

  if (updated.club || updated.league) {
    const clubResult = applyClubDevelopmentPointsToPlayer(updated);
    updated = clubResult.updatedPlayer;
    clubDistribution = clubResult.result;
    clubPoints = clubResult.result.totalPoints;
  }

  const summary: AnnualDevelopmentSummary = {
    age,
    stage,
    personalPoints,
    clubPoints,
    totalPoints: personalPoints + clubPoints,
    tierInfo,
    philosophy,
    clubDistribution,
  };

  return {
    updatedPlayer: updated,
    summary,
  };
}
