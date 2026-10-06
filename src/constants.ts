import { Nationality, SkinColor, PlayerCardData, CardTier } from './types';

export const NATIONALITIES: Nationality[] = [
  { code: 'ARG', iso: 'ar', name: 'Argentina' },
  { code: 'FRA', iso: 'fr', name: 'France' },
  { code: 'BEL', iso: 'be', name: 'Belgium' },
  { code: 'BRA', iso: 'br', name: 'Brazil' },
  { code: 'ENG', iso: 'gb-eng', name: 'England' },
  { code: 'POR', iso: 'pt', name: 'Portugal' },
  { code: 'NED', iso: 'nl', name: 'Netherlands' },
  { code: 'ESP', iso: 'es', name: 'Spain' },
  { code: 'CRO', iso: 'hr', name: 'Croatia' },
  { code: 'ITA', iso: 'it', name: 'Italy' },
  { code: 'URU', iso: 'uy', name: 'Uruguay' },
  { code: 'MAR', iso: 'ma', name: 'Morocco' },
  { code: 'COL', iso: 'co', name: 'Colombia' },
  { code: 'MEX', iso: 'mx', name: 'Mexico' },
  { code: 'USA', iso: 'us', name: 'United States' },
  { code: 'GER', iso: 'de', name: 'Germany' },
  { code: 'SEN', iso: 'sn', name: 'Senegal' },
  { code: 'JPN', iso: 'jp', name: 'Japan' },
  { code: 'IRN', iso: 'ir', name: 'Iran' },
  { code: 'SUI', iso: 'ch', name: 'Switzerland' },
  { code: 'DEN', iso: 'dk', name: 'Denmark' },
  { code: 'UKR', iso: 'ua', name: 'Ukraine' },
  { code: 'KOR', iso: 'kr', name: 'South Korea' },
  { code: 'AUS', iso: 'au', name: 'Australia' },
  { code: 'AUT', iso: 'at', name: 'Austria' },
  { code: 'POL', iso: 'pl', name: 'Poland' },
  { code: 'HUN', iso: 'hu', name: 'Hungary' },
  { code: 'SWE', iso: 'se', name: 'Sweden' },
  { code: 'WAL', iso: 'gb-wls', name: 'Wales' },
  { code: 'SRB', iso: 'rs', name: 'Serbia' },
  { code: 'PER', iso: 'pe', name: 'Peru' },
  { code: 'ECU', iso: 'ec', name: 'Ecuador' },
  { code: 'QAT', iso: 'qa', name: 'Qatar' },
  { code: 'TUN', iso: 'tn', name: 'Tunisia' },
  { code: 'EGY', iso: 'eg', name: 'Egypt' },
  { code: 'ALG', iso: 'dz', name: 'Algeria' },
  { code: 'CHI', iso: 'cl', name: 'Chile' },
  { code: 'NGA', iso: 'ng', name: 'Nigeria' },
  { code: 'CMR', iso: 'cm', name: 'Cameroon' },
  { code: 'CAN', iso: 'ca', name: 'Canada' },
  { code: 'TUR', iso: 'tr', name: 'Turkey' },
  { code: 'CZE', iso: 'cz', name: 'Czechia' },
  { code: 'SVK', iso: 'sk', name: 'Slovakia' },
  { code: 'ROU', iso: 'ro', name: 'Romania' },
  { code: 'GRE', iso: 'gr', name: 'Greece' },
  { code: 'NOR', iso: 'no', name: 'Norway' },
  { code: 'MLI', iso: 'ml', name: 'Mali' },
  { code: 'KSA', iso: 'sa', name: 'Saudi Arabia' },
  { code: 'SAU', iso: 'sa', name: 'Saudi Arabia' },
  { code: 'GHA', iso: 'gh', name: 'Ghana' },
  { code: 'GMB', iso: 'gm', name: 'The Gambia' },
  { code: 'GIN', iso: 'gn', name: 'Guinea' },
  { code: 'CRC', iso: 'cr', name: 'Costa Rica' },
  { code: 'CIV', iso: 'ci', name: 'Ivory Coast' },
  { code: 'NZL', iso: 'nz', name: 'New Zealand' },
  { code: 'HON', iso: 'hn', name: 'Honduras' },
  { code: 'PAR', iso: 'py', name: 'Paraguay' },
  { code: 'VEN', iso: 've', name: 'Venezuela' },
  { code: 'ALB', iso: 'al', name: 'Albania' },
  { code: 'SCO', iso: 'gb-sct', name: 'Scotland' },
];

export const SKIN_COLORS: SkinColor[] = [
  { name: 'Pale', hex: '#fff2e6' },
  { name: 'Fair', hex: '#f7beab' },
  { name: 'Tanned', hex: '#e0ac69' },
  { name: 'Sun Kissed', hex: '#c68642' },
  { name: 'Olive', hex: '#8d5524' },
  { name: 'Dark', hex: '#5c3818' },
  { name: 'Ebony', hex: '#3b220c' },
];

export const PALETTE_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#111111' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#9333ea' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Maroon (Vinotinto)', hex: '#7f1d1d' },
];

export const HAIR_ROOT_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'Dark Brown', hex: '#241408' },
  { name: 'Light Brown', hex: '#a66d40' },
  { name: 'Auburn / Ginger', hex: '#78350f' },
  { name: 'Blonde', hex: '#e5c158' },
  { name: 'Red', hex: '#a52a2a' },
];

export const FACIAL_HAIR_STYLES = [
  { id: 'full-beard', name: 'Full Beard' },
  { id: 'well-kept', name: 'Well-Kept Beard' },
  { id: '3-day-beard', name: '3-Day Stubble' },
  { id: 'mutton-chops', name: 'Mutton Chops' },
  { id: 'royal-beard', name: 'Royal Beard' },
  { id: 'goatee', name: 'Goatee' },
  { id: 'chin-strap', name: 'Chin Strap' },
  { id: 'moustache', name: 'Mustache' },
  { id: 'pointy-moustache', name: 'Pointy Mustache' },
  { id: 'classic-moustache', name: 'Classic Mustache' },
  { id: 'none', name: 'None' },
] as const;

export const HAIR_DYE_COLORS = [
  { name: 'None (Natural)', hex: 'none' },
  { name: 'Silver White', hex: '#cbd5e1' },
  { name: 'Platinum', hex: '#e5e4e2' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#ffeb3b' },
  { name: 'Pink', hex: '#ff69b4' },
  { name: 'Blue', hex: '#00a2ff' },
  { name: 'Green', hex: '#00ff66' },
];

export const NECK_TATTOO_OPTIONS = [
  { id: 'none', name: 'None', tier: 0 },
  { id: 'script', name: 'Script Lettering (Tier 1)', tier: 1 },
  { id: 'rose', name: 'Rose Tattoo (Tier 2)', tier: 2 },
  { id: 'blackout', name: 'Blackout Neck Tattoo (Tier 3)', tier: 3 },
  { id: 'wings', name: 'Winged Crest Tattoo (Tier 4)', tier: 4 },
] as const;

export const ARM_TATTOO_OPTIONS = [
  { id: 'none', name: 'None', tier: 0 },
  { id: 'double-stripe', name: 'Double Stripe Band (Tier 1)', tier: 1 },
  { id: 'script-sleeve', name: 'Script / Name Sleeve (Tier 2)', tier: 2 },
  { id: 'tribal', name: 'Tribal Sleeve (Tier 3)', tier: 3 },
  { id: 'mandala-sleeve', name: 'Floral Mandala Sleeve (Tier 4)', tier: 4 },
  { id: 'blackout-sleeve', name: 'Blackout Sleeve (Tier 4)', tier: 4 },
] as const;

export const FACE_TATTOO_OPTIONS = [
  { id: 'none', name: 'None', tier: 0 },
  { id: 'star', name: 'Cheek Star (Tier 1)', tier: 1 },
  { id: 'under-eye-cross', name: 'Under-Eye Cross (Tier 2)', tier: 2 },
  { id: 'script-cheek', name: 'Cheek Script (Tier 3)', tier: 3 },
  { id: 'crown-temple', name: 'Temple Crown (Tier 4)', tier: 4 },
] as const;

export const ACCESSORY_COLOR_OPTIONS = [
  { id: 'white', name: 'White', hex: '#ffffff' },
  { id: 'black', name: 'Black', hex: '#09090b' },
  { id: 'green', name: 'Green', hex: '#16a34a' },
  { id: 'red', name: 'Red', hex: '#dc2626' },
  { id: 'blue', name: 'Blue', hex: '#2563eb' },
  { id: 'orange', name: 'Orange', hex: '#ea580c' },
  { id: 'sky-blue', name: 'Sky Blue', hex: '#0284c7' },
  { id: 'yellow', name: 'Yellow', hex: '#eab308' },
  { id: 'pink', name: 'Pink', hex: '#ec4899' },
] as const;

export const EARRING_OPTIONS = [
  { id: 'none', name: 'None', tier: 0 },
  { id: 'small-barbell', name: 'Small Barbell (Tier 1)', tier: 1 },
  { id: 'large-barbell', name: 'Large Barbell (Tier 2)', tier: 2 },
  { id: 'silver', name: 'Silver Studs (Tier 1)', tier: 1 },
  { id: 'gold', name: 'Gold Studs (Tier 3)', tier: 3 },
  { id: 'steel', name: 'Steel Studs (Tier 1)', tier: 1 },
  { id: 'gem', name: 'Diamond / Gem (Tier 5)', tier: 5 },
] as const;

export const EARRING_MATERIAL_OPTIONS = [
  { id: 'silver', name: 'Silver', color: '#cbd5e1' },
  { id: 'gold', name: 'Gold', color: '#fbbf24' },
  { id: 'bronze', name: 'Bronze', color: '#cd7f32' },
  { id: 'black', name: 'Black', color: '#1e293b' },
] as const;

export const EARRING_GEM_OPTIONS = [
  { id: 'diamond', name: 'Diamond (Cyan White)', color: '#38bdf8' },
  { id: 'white', name: 'White Pearl', color: '#ffffff' },
  { id: 'emerald', name: 'Emerald (Green)', color: '#10b981' },
  { id: 'sapphire', name: 'Sapphire (Blue)', color: '#3b82f6' },
  { id: 'amethyst', name: 'Amethyst (Purple)', color: '#a855f7' },
] as const;

export const NECKLACE_OPTIONS = [
  { id: 'none', name: 'None', tier: 0 },
  { id: 'dog-tags', name: 'Military Dog Tag (Tier 2)', tier: 2 },
  { id: 'silver-chain', name: 'Silver Necklace (Tier 3)', tier: 3 },
  { id: 'gold-chain', name: 'Gold Necklace (Tier 4)', tier: 4 },
  { id: 'diamonds-incrusted', name: 'Diamond-Encrusted Gold (Tier 5)', tier: 5 },
] as const;

export function getCardTier(ovr: number): CardTier {
  if (ovr < 50) return 'white';
  if (ovr < 70) return 'bronze';
  if (ovr < 80) return 'silver';
  if (ovr < 90) return 'gold';
  if (ovr < 95) return 'legendary';
  return 'goat';
}

export const PRESET_PLAYERS: PlayerCardData[] = [
  {
    id: 'prodigy',
    name: 'New Prodigy',
    firstName: 'New',
    lastName: 'Prodigy',
    ovr: 40,
    potentialOvr: 80,
    age: 10,
    heightCm: 145,
    weightKg: 45,
    club: 'Youth Prospect',
    clubCountry: 'Unassigned',
    league: 'Youth Division',
    position: 'CAM',
    subPosition: 'CAM',
    playStyle: 'Creator',
    preferredFoot: 'Right',
    weakFootStars: 3,
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    activePerkIds: [],
    fame: 0,
    badReputation: 0,
    retirementAge: 35,
    expectedPeak: 28,
    collectedCards: [],
    trophies: [],
    stats: { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 },
    biometrics: {
      strength: 40,
      skinColor: '#f5d0b1',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#111111',
      hairDye: 'none',
    },
    accessories: {
      accessory: 'none',
      headbandColor: '#000000',
      tattooNeck: 'none',
      tattooArmL: 'none',
      tattooArmR: 'none',
      tattooFace: 'none',
      earring: 'none',
      earringL: 'none',
      earringR: 'none',
      necklace: 'none',
    },
    kit: {
      style: 'normal',
      color1: '#2563eb',
      color2: '#ffffff',
      pattern: 'solid',
      collar: 'crew',
    },
    emblem: {
      shape: 'arrow',
      mode: '1',
      color1: '#eab308',
      color2: '#111111',
    },
    customBio: 'A promising young prospect taking their first steps in professional football. High growth potential!',
  },
  {
    id: 'messi',
    name: 'L. MESSI',
    ovr: 80,
    potentialOvr: 99,
    internalPotentialOvr: 99,
    age: 16,
    club: 'FC Barcelona',
    clubCountry: 'Spain',
    league: 'La Liga',
    position: 'RW',
    subPosition: 'RW',
    playStyle: 'Inverted',
    preferredFoot: 'Left',
    weakFootStars: 4,
    nationality: { code: 'ARG', iso: 'ar', name: 'Argentina' },
    otherNationalities: [{ code: 'ESP', iso: 'es', name: 'Spain' }],
    stats: {
      pro: 90,
      def: 40,
      cre: 80,
      men: 75,
      goa: 80,
      phy: 65,
      detailed: {
        pace: 85,
        stamina: 70,
        strength: 55,
        ballControl: 90,
        retention: 88,
        dribbling: 99,
        shortPass: 82,
        longPass: 76,
        crossing: 78,
        shooting: 82,
        heading: 52,
        longShots: 78,
        tackling: 40,
        marking: 40,
        interceptions: 40,
        positioning: 80,
        composure: 86,
        reactions: 85,
      },
    },
    biometrics: {
      strength: 55,
      skinColor: '#f5d0b1',
      hairStyle: 'straight',
      hairLength: 'medium',
      hairRoot: '#3b220c',
      hairDye: 'none',
    },
    accessories: {
      accessory: 'none',
      headbandColor: '#ffffff',
      tattooNeck: 'none',
      tattooArmL: 'none',
      tattooArmR: 'none',
    },
    kit: {
      style: 'normal',
      color1: '#a50044',
      color2: '#004d98',
      pattern: 'stripes',
      collar: 'crew',
    },
    emblem: {
      shape: 'barcelona',
      mode: '3',
      color1: '#a50044',
      color2: '#004d98',
      color3: '#facc15',
    },
    customBio: 'A 16-year-old phenom at FC Barcelona with dual Argentinean and Spanish nationality. Renowned for mesmerizing dribbling, rapid acceleration, and incredible left foot.',
    trophies: [],
    isLegend: true,
    legendPerk: {
      name: 'MAGNETIC FEET',
      description: 'The ball never seems to separate from his feet, grants one extra action during 1V1 situations.',
    },
    legendChallenge: {
      title: 'Can you build a better career than Lionel Messi?',
      description: "Surpass Messi's legendary career achievements across these 10 objectives.",
      objectives: [
        { id: 'world_cup', text: 'Win 2 FIFA World Cups', target: 2, current: 0 },
        { id: 'ballon_dor', text: "Win 9 Ballon d'Or awards", target: 9, current: 0 },
        { id: 'golden_shoe', text: 'Win 7 European Golden Shoes', target: 7, current: 0 },
        { id: 'ucl', text: 'Win 5 UEFA Champions League titles', target: 5, current: 0 },
        { id: 'top5_leagues', text: "Win 12 league titles in Europe's Top 5 leagues", target: 12, current: 0 },
        { id: 'copa_america', text: 'Win 3 Copa América titles', target: 3, current: 0 },
        { id: 'club_world_cup', text: 'Win 5 FIFA Club World Cups', target: 5, current: 0 },
        { id: 'domestic_cups', text: 'Win 3 domestic league cups', target: 3, current: 0 },
        { id: 'top_scorer_leagues', text: 'Become top scorer in 3 different leagues', target: 3, current: 0 },
        { id: 'assists', text: 'Record 400+ career assists', target: 400, current: 0 },
      ],
    },
  },
];

export interface CityStatModifier {
  statKey: 'stamina' | 'composure' | 'dribbling' | 'pace' | 'shortPass' | 'tackling' | 'interceptions' | 'ballControl' | 'crossing';
  statName: string;
  value: number;
  label: string;
}

export interface StartingCityOption {
  id: string;
  cityName: string;
  countryName: string;
  fullName: string;
  nationality: Nationality;
  description: string;
  originLastName?: string;
  badgeColor: string;
  bgGradient: string;
  landmark: string;
  imageUrl: string;
  titleColor: string;
  fontClass: string;
  isUpcoming?: boolean;
  statModifier: CityStatModifier;
}

export const STARTING_CITIES: StartingCityOption[] = [
  {
    id: 'paris',
    cityName: 'Paris',
    countryName: 'France',
    fullName: 'Paris, France',
    nationality: { code: 'FRA', iso: 'fr', name: 'France' },
    originLastName: 'Parisien',
    description: 'Elite academies, technical development, and a pathway surrounded by world-class talent.',
    badgeColor: 'border-blue-500/50 text-blue-300 bg-blue-950/60',
    bgGradient: 'from-blue-900/30 via-slate-900 to-indigo-950/40',
    landmark: 'Clairefontaine & Parisian Banlieues',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    titleColor: 'text-sky-300 group-hover:text-sky-200',
    fontClass: 'font-serif tracking-normal',
    statModifier: {
      statKey: 'stamina',
      statName: 'Stamina',
      value: 1,
      label: '+1 Stamina',
    },
  },
  {
    id: 'buenos_aires',
    cityName: 'Buenos Aires',
    countryName: 'Argentina',
    fullName: 'Buenos Aires, Argentina',
    nationality: { code: 'ARG', iso: 'ar', name: 'Argentina' },
    originLastName: 'El Porteño',
    description: 'Passion, creativity, and a tradition of producing technical players with strong mentality.',
    badgeColor: 'border-sky-400/50 text-sky-300 bg-sky-950/60',
    bgGradient: 'from-sky-900/30 via-slate-900 to-amber-950/30',
    landmark: 'La Bombonera & Potrero Grounds',
    imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80',
    titleColor: 'text-amber-300 group-hover:text-amber-200',
    fontClass: 'font-sans font-black tracking-tight',
    statModifier: {
      statKey: 'composure',
      statName: 'Composure',
      value: 1,
      label: '+1 Composure',
    },
  },
  {
    id: 'sao_paulo',
    cityName: 'São Paulo',
    countryName: 'Brazil',
    fullName: 'São Paulo, Brazil',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    originLastName: 'Paulista',
    description: 'Street football, creativity, and attacking talent shaped by generations of players.',
    badgeColor: 'border-emerald-400/50 text-emerald-300 bg-emerald-950/60',
    bgGradient: 'from-amber-900/30 via-slate-900 to-emerald-950/40',
    landmark: 'Várzea Pitches & Futsal Courts',
    imageUrl: 'https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=800&q=80',
    titleColor: 'text-emerald-400 group-hover:text-emerald-300',
    fontClass: 'font-sans font-extrabold tracking-wide',
    statModifier: {
      statKey: 'dribbling',
      statName: 'Dribbling',
      value: 1,
      label: '+1 Dribbling',
    },
  },
  {
    id: 'london',
    cityName: 'London',
    countryName: 'England',
    fullName: 'London, England',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    originLastName: 'Londoner',
    description: 'Historic football culture, intense competition, and one of the deepest talent networks.',
    badgeColor: 'border-rose-400/50 text-rose-300 bg-rose-950/60',
    bgGradient: 'from-rose-900/30 via-slate-900 to-indigo-950/40',
    landmark: 'Wembley & South London Cage Arenas',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    titleColor: 'text-rose-300 group-hover:text-rose-200',
    fontClass: 'font-mono font-bold tracking-tight',
    statModifier: {
      statKey: 'pace',
      statName: 'Pace',
      value: 1,
      label: '+1 Pace',
    },
  },
  {
    id: 'madrid',
    cityName: 'Madrid',
    countryName: 'Spain',
    fullName: 'Madrid, Spain',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    originLastName: 'De Madrid',
    description: 'Technical football, tactical education, and development of complete players.',
    badgeColor: 'border-amber-400/50 text-amber-300 bg-amber-950/60',
    bgGradient: 'from-amber-900/30 via-slate-900 to-red-950/40',
    landmark: 'Valdebebas & Castilian Academies',
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    titleColor: 'text-amber-400 group-hover:text-amber-300',
    fontClass: 'font-serif font-black tracking-wide',
    statModifier: {
      statKey: 'shortPass',
      statName: 'Short Pass',
      value: 1,
      label: '+1 Short Pass',
    },
  },
  {
    id: 'roma',
    cityName: 'Roma',
    countryName: 'Italy',
    fullName: 'Roma, Italy',
    nationality: { code: 'ITA', iso: 'it', name: 'Italy' },
    originLastName: 'Romano',
    description: 'Tactical discipline, defensive mastery, and the timeless football heritage of the Eternal City.',
    badgeColor: 'border-yellow-500/50 text-yellow-300 bg-yellow-950/60',
    bgGradient: 'from-yellow-900/30 via-slate-900 to-blue-950/40',
    landmark: 'Colosseo & Stadio Olimpico',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    titleColor: 'text-yellow-400 group-hover:text-yellow-300',
    fontClass: 'font-serif font-extrabold tracking-widest uppercase',
    isUpcoming: true,
    statModifier: {
      statKey: 'tackling',
      statName: 'Tackling',
      value: 1,
      label: '+1 Tackling',
    },
  },
  {
    id: 'berlin',
    cityName: 'Berlin',
    countryName: 'Germany',
    fullName: 'Berlin, Germany',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    originLastName: 'Berliner',
    description: 'Precision engineering, high-intensity pressing, and grassroots urban street football hubs.',
    badgeColor: 'border-zinc-400/50 text-zinc-300 bg-zinc-950/60',
    bgGradient: 'from-zinc-900/30 via-slate-900 to-amber-950/30',
    landmark: 'Brandenburg Gate & Olympiastadion',
    imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80',
    titleColor: 'text-zinc-200 group-hover:text-white',
    fontClass: 'font-mono font-black tracking-tighter uppercase',
    isUpcoming: true,
    statModifier: {
      statKey: 'interceptions',
      statName: 'Interceptions',
      value: 1,
      label: '+1 Interception',
    },
  },
  {
    id: 'lisboa',
    cityName: 'Lisboa',
    countryName: 'Portugal',
    fullName: 'Lisboa, Portugal',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    originLastName: 'Alfacinha',
    description: 'Renowned winger academies, flair dribbling, and coastal technical street development.',
    badgeColor: 'border-teal-400/50 text-teal-300 bg-teal-950/60',
    bgGradient: 'from-teal-900/30 via-slate-900 to-rose-950/30',
    landmark: 'Torre de Belém & Alcântara Courts',
    imageUrl: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80',
    titleColor: 'text-teal-300 group-hover:text-teal-200',
    fontClass: 'font-serif font-bold italic tracking-wide',
    isUpcoming: true,
    statModifier: {
      statKey: 'crossing',
      statName: 'Crossing',
      value: 1,
      label: '+1 Crossing',
    },
  },
  {
    id: 'riyadh',
    cityName: 'Riyadh',
    countryName: 'Saudi Arabia',
    fullName: 'Riyadh, Saudi Arabia',
    nationality: { code: 'KSA', iso: 'sa', name: 'Saudi Arabia' },
    description: 'Rapidly rising football powerhouse, state-of-the-art facilities, and passionate fanbases.',
    badgeColor: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/60',
    bgGradient: 'from-emerald-900/30 via-slate-900 to-amber-950/30',
    landmark: 'Kingdom Centre & King Fahd Stadium',
    imageUrl: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80',
    titleColor: 'text-emerald-300 group-hover:text-emerald-200',
    fontClass: 'font-sans font-black tracking-widest uppercase',
    isUpcoming: true,
    statModifier: {
      statKey: 'ballControl',
      statName: 'Ball Control',
      value: 1,
      label: '+1 Ball Control',
    },
  },
];

