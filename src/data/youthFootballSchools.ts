import {
  FootballSchoolId,
  FootballSchoolPhilosophy,
  PositionCategoryKey,
  DevelopmentStageInfo,
} from '../types/youthFootballSchools';
import { PlayerCardData } from '../types';

export const DEVELOPMENT_STAGES: Record<string, DevelopmentStageInfo> = {
  teenage: {
    key: 'teenage',
    name: 'Teenage Development',
    ageRange: '10–19',
    minAge: 10,
    maxAge: 19,
    playerPoints: 15,
    academyPoints: 15,
    playerPointsLabel: '+15',
    academyPointsLabel: '+10 to +30 (Club Tier)',
    quote: 'Your development continues as a young player.',
    description:
      'Formative development era. Receive +15 personal Stat Points per year, plus youth development points from your club (+10 to +30 based on Club Tier, or +15/+20 in Youth Academy) across all squad levels (U17, U20, Reserves, First Team).',
    colorClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    bgGradient: 'from-emerald-950/40 via-slate-900 to-slate-950',
    borderClass: 'border-emerald-500/50',
  },
  mature: {
    key: 'mature',
    name: 'Mature Development',
    ageRange: '20–27',
    minAge: 20,
    maxAge: 27,
    playerPoints: 5,
    academyPoints: 10,
    playerPointsLabel: '+5',
    academyPointsLabel: '+5 to +15 (Club Tier)',
    quote: 'Your development is becoming more focused on refinement and consistency.',
    description:
      'Mature development era. Receive +5 personal Stat Points per year, plus club tactical development points (+5 to +15 based on Club Tier: T1: 5, T2: 8, T3: 10, T4: 12, T5: 15) allocated as stat points based on club development style.',
    colorClass: 'text-cyan-400',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    bgGradient: 'from-cyan-950/40 via-slate-900 to-slate-950',
    borderClass: 'border-cyan-500/50',
  },
  peak: {
    key: 'peak',
    name: 'Peak Years',
    ageRange: '28–32',
    minAge: 28,
    maxAge: 32,
    playerPoints: 0,
    academyPoints: 10,
    playerPointsLabel: '+0',
    academyPointsLabel: '+5 to +15 (Club Tier)',
    quote: 'Your physical and technical development has reached the peak stage.',
    description:
      'Athletic and technical prime. Free personal stat points stabilize (+0), while club tactical development continues (+5 to +15 based on Club Tier) allocated as stat points based on club philosophy.',
    colorClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    bgGradient: 'from-amber-950/40 via-slate-900 to-slate-950',
    borderClass: 'border-amber-500/50',
  },
  declining: {
    key: 'declining',
    name: 'Declining Years',
    ageRange: '33+',
    minAge: 33,
    maxAge: 99,
    playerPoints: -3,
    academyPoints: 10,
    playerPointsLabel: '-3 PHY',
    academyPointsLabel: '+5 to +15 (Club Tier)',
    quote: 'Your physical attributes are beginning to decline.',
    description:
      'Veteran era. Natural physical regression (-3 PHY per year), while club technical training (+5 to +15 based on Club Tier) continues to preserve and hone tactical attributes.',
    colorClass: 'text-rose-400',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bgGradient: 'from-rose-950/40 via-slate-900 to-slate-950',
    borderClass: 'border-rose-500/50',
  },
};

export function getDevelopmentStageForAge(age: number = 10): DevelopmentStageInfo {
  if (age <= 19) return DEVELOPMENT_STAGES.teenage;
  if (age <= 27) return DEVELOPMENT_STAGES.mature;
  if (age <= 32) return DEVELOPMENT_STAGES.peak;
  return DEVELOPMENT_STAGES.declining;
}

export function mapPositionToCategory(position: string, subPosition?: string): PositionCategoryKey {
  const code = (subPosition || position || '').toUpperCase().trim();
  if (code === 'GK') return 'GK';
  if (['CB', 'SW', 'LIB'].includes(code)) return 'CB';
  if (['LB', 'RB', 'LWB', 'RWB', 'FULLBACK', 'WB'].includes(code)) return 'FULLBACK';
  if (['CDM', 'DM'].includes(code)) return 'CDM';
  if (['CM', 'MC'].includes(code)) return 'CM';
  if (['CAM', 'AM', 'AMC', 'SS', '10'].includes(code)) return 'CAM';
  if (['LW', 'RW', 'LM', 'RM', 'WINGER'].includes(code)) return 'WINGER';
  if (['ST', 'CF', 'STRIKER', 'FWD', 'ATT'].includes(code)) return 'ST';

  // Fallback to top-level position category
  const mainPos = (position || '').toUpperCase().trim();
  if (mainPos === 'GK') return 'GK';
  if (mainPos === 'DEF') return 'CB';
  if (mainPos === 'MID') return 'CM';
  return 'ST';
}

export const FOOTBALL_SCHOOLS: Record<FootballSchoolId, FootballSchoolPhilosophy> = {
  // 1. MADRID - STYLE 1: HIGH-INTENSITY DEFENSE
  high_intensity_defense: {
    id: 'high_intensity_defense',
    styleNumber: 1,
    name: 'High-Intensity Defense',
    leagueId: 'madrid',
    leagueName: 'Liga Madrileña Juvenil',
    city: 'Madrid',
    country: 'Spain',
    flag: '🇪🇸',
    inspiration: 'Inspired by Atlético Madrid & Getafe defensive intensity',
    corePhilosophy: 'Defend hard → win the ball → retain it → attack efficiently.',
    primaryAttributes: ['Interceptions', 'Stamina', 'Position', 'Short Pass', 'Retention'],
    allocations: {
      ST: {
        shooting: 4,
        heading: 2,
        positioning: 3,
        stamina: 2,
        retention: 2,
        shortPass: 1,
        strength: 1,
      },
      WINGER: {
        stamina: 3,
        positioning: 3,
        dribbling: 2,
        retention: 2,
        shortPass: 2,
        crossing: 1,
        interceptions: 1,
        strength: 1,
      },
      CAM: {
        positioning: 3,
        shortPass: 3,
        retention: 2,
        stamina: 2,
        interceptions: 2,
        longPass: 1,
        longShots: 1,
        ballControl: 1,
      },
      CM: {
        stamina: 3,
        interceptions: 3,
        shortPass: 3,
        retention: 2,
        positioning: 2,
        longPass: 1,
        strength: 1,
      },
      CDM: {
        interceptions: 4,
        stamina: 3,
        positioning: 3,
        retention: 2,
        shortPass: 2,
        strength: 1,
      },
      FULLBACK: {
        stamina: 4,
        interceptions: 2,
        positioning: 2,
        retention: 2,
        shortPass: 2,
        strength: 2,
        crossing: 1,
      },
      CB: {
        interceptions: 4,
        strength: 3,
        positioning: 3,
        tackling: 2,
        shortPass: 2,
        stamina: 1,
      },
      GK: {
        reflexes: 4,
        oneOnOne: 3,
        positioning: 3,
        handling: 2,
        saving: 2,
        aerialReach: 1,
      },
    },
    strengths: 'Tenacious stamina, ball-winning, defensive transitions, counter-attack efficiency',
    weaknesses: 'Lower pure flair and isolated dribbling trickery',
    badgeBg: 'bg-red-950/60',
    badgeBorder: 'border-red-500/60',
    textColor: 'text-red-300',
  },

  // 2. MADRID - STYLE 2: TIKI-TAKA
  tiki_taka: {
    id: 'tiki_taka',
    styleNumber: 2,
    name: 'Tiki-Taka',
    leagueId: 'madrid',
    leagueName: 'Liga Madrileña Juvenil',
    city: 'Madrid',
    country: 'Spain',
    flag: '🇪🇸',
    inspiration: 'Inspired by La Masia & Spanish positional football',
    corePhilosophy: 'Positioning → technical quality → short passing → ball retention → intelligent movement.',
    primaryAttributes: ['Position', 'Interceptions', 'Short Pass', 'Ball Control', 'Dribbling', 'Retention'],
    allocations: {
      ST: {
        positioning: 3,
        ballControl: 3,
        dribbling: 2,
        shooting: 3,
        shortPass: 2,
        longShots: 1,
        retention: 1,
      },
      WINGER: {
        dribbling: 3,
        ballControl: 3,
        positioning: 2,
        shortPass: 2,
        retention: 2,
        crossing: 2,
        shooting: 1,
      },
      CAM: {
        ballControl: 3,
        shortPass: 3,
        dribbling: 2,
        positioning: 2,
        retention: 2,
        longPass: 1,
        longShots: 2,
      },
      CM: {
        shortPass: 3,
        ballControl: 3,
        retention: 3,
        positioning: 2,
        interceptions: 2,
        dribbling: 1,
        longPass: 1,
      },
      CDM: {
        positioning: 3,
        interceptions: 3,
        shortPass: 3,
        retention: 3,
        ballControl: 2,
        dribbling: 1,
      },
      FULLBACK: {
        shortPass: 3,
        positioning: 2,
        interceptions: 2,
        ballControl: 2,
        crossing: 2,
        retention: 2,
        dribbling: 2,
      },
      CB: {
        shortPass: 3,
        interceptions: 3,
        positioning: 3,
        tackling: 2,
        retention: 2,
        ballControl: 1,
        strength: 1,
      },
      GK: {
        distribution: 5,
        positioning: 3,
        handling: 2,
        reflexes: 2,
        oneOnOne: 2,
        saving: 1,
      },
    },
    strengths: 'Supreme ball retention, pinpoint passing lanes, positional masterclass',
    weaknesses: 'Less emphasis on pure brute physicality and direct aerial duels',
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-500/60',
    textColor: 'text-amber-300',
  },

  // 3. LONDON - STYLE 3: BREXIT BALL
  brexit_ball: {
    id: 'brexit_ball',
    styleNumber: 3,
    name: 'Brexit Ball',
    leagueId: 'london',
    leagueName: 'London Youth League',
    city: 'London',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    inspiration: 'A physical, direct English development philosophy',
    corePhilosophy: 'Run → compete → cross → head → shoot → defend.',
    primaryAttributes: ['Strength', 'Stamina', 'Pace', 'Heading', 'Long Pass', 'Crossing', 'Shooting'],
    allocations: {
      ST: {
        shooting: 4,
        heading: 3,
        strength: 2,
        stamina: 2,
        positioning: 2,
        pace: 1,
        longShots: 1,
      },
      WINGER: {
        pace: 3,
        stamina: 3,
        crossing: 3,
        dribbling: 1,
        strength: 2,
        heading: 1,
        shooting: 2,
      },
      CAM: {
        stamina: 3,
        longPass: 3,
        longShots: 2,
        strength: 2,
        shooting: 2,
        positioning: 2,
        shortPass: 1,
      },
      CM: {
        stamina: 4,
        strength: 2,
        longPass: 3,
        tackling: 2,
        longShots: 2,
        positioning: 1,
        shortPass: 1,
      },
      CDM: {
        strength: 3,
        stamina: 3,
        tackling: 3,
        longPass: 2,
        interceptions: 2,
        positioning: 1,
        heading: 1,
      },
      FULLBACK: {
        stamina: 4,
        pace: 3,
        crossing: 2,
        strength: 2,
        tackling: 2,
        heading: 1,
        positioning: 1,
      },
      CB: {
        strength: 4,
        heading: 3,
        tackling: 3,
        stamina: 2,
        marking: 1,
        interceptions: 1,
        longPass: 1,
      },
      GK: {
        aerialReach: 5,
        handling: 3,
        saving: 3,
        reflexes: 2,
        positioning: 2,
      },
    },
    strengths: 'Aerial dominance, bone-crushing strength, direct crossing and thunderous long shots',
    weaknesses: 'Less intricate short-range ball retention under high press',
    badgeBg: 'bg-blue-950/60',
    badgeBorder: 'border-blue-500/60',
    textColor: 'text-blue-300',
  },

  // 4. LONDON - STYLE 4: MODERN ENGLISH
  modern_english: {
    id: 'modern_english',
    styleNumber: 4,
    name: 'Modern English',
    leagueId: 'london',
    leagueName: 'London Youth League',
    city: 'London',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    inspiration: 'Inspired by modern Manchester City / Arsenal youth academies',
    corePhilosophy: 'Technical football + positional intelligence + pressing + physical intensity.',
    primaryAttributes: ['Position', 'Short Pass', 'Dribbling', 'Stamina', 'Interceptions', 'Ball Control'],
    allocations: {
      ST: {
        positioning: 3,
        shooting: 3,
        ballControl: 2,
        dribbling: 2,
        stamina: 2,
        shortPass: 1,
        pace: 1,
        longShots: 1,
      },
      WINGER: {
        dribbling: 3,
        pace: 2,
        ballControl: 2,
        positioning: 2,
        shortPass: 2,
        crossing: 2,
        stamina: 1,
        shooting: 1,
      },
      CAM: {
        shortPass: 3,
        ballControl: 2,
        positioning: 2,
        dribbling: 2,
        stamina: 2,
        longPass: 1,
        longShots: 2,
        retention: 1,
      },
      CM: {
        shortPass: 3,
        stamina: 3,
        positioning: 2,
        retention: 2,
        ballControl: 2,
        interceptions: 1,
        longPass: 1,
        dribbling: 1,
      },
      CDM: {
        positioning: 3,
        interceptions: 3,
        retention: 2,
        shortPass: 2,
        stamina: 2,
        ballControl: 1,
        strength: 1,
        longPass: 1,
      },
      FULLBACK: {
        stamina: 3,
        pace: 2,
        positioning: 2,
        crossing: 2,
        shortPass: 2,
        interceptions: 2,
        dribbling: 1,
        ballControl: 1,
      },
      CB: {
        interceptions: 3,
        positioning: 3,
        shortPass: 2,
        tackling: 2,
        strength: 2,
        stamina: 1,
        ballControl: 1,
        retention: 1,
      },
      GK: {
        distribution: 4,
        positioning: 3,
        reflexes: 3,
        saving: 2,
        oneOnOne: 2,
        aerialReach: 1,
      },
    },
    strengths: 'Hybrid high press, sharp positional rotations, agile technical intensity',
    weaknesses: 'Demands relentless stamina and high focus across 90 minutes',
    badgeBg: 'bg-sky-950/60',
    badgeBorder: 'border-sky-500/60',
    textColor: 'text-sky-300',
  },

  // 5. ARGENTINA - STYLE 5: PALADAR NEGRO
  paladar_negro: {
    id: 'paladar_negro',
    styleNumber: 5,
    name: 'Paladar Negro',
    leagueId: 'buenos_aires',
    leagueName: 'Liga Bonaerense Juvenil',
    city: 'Buenos Aires',
    country: 'Argentina',
    flag: '🇦🇷',
    inspiration: 'Technical, creative and sophisticated Argentine football',
    corePhilosophy: 'Technique → dribbling → passing → retention → creativity → long-range quality.',
    primaryAttributes: ['Ball Control', 'Dribbling', 'Short Pass', 'Retention', 'Long Shots'],
    allocations: {
      ST: {
        ballControl: 3,
        dribbling: 2,
        shooting: 3,
        positioning: 2,
        retention: 2,
        longShots: 2,
        shortPass: 1,
      },
      WINGER: {
        dribbling: 4,
        ballControl: 3,
        retention: 2,
        shortPass: 2,
        crossing: 1,
        positioning: 1,
        longShots: 1,
        shooting: 1,
      },
      CAM: {
        dribbling: 3,
        ballControl: 3,
        shortPass: 3,
        retention: 2,
        longPass: 1,
        longShots: 2,
        positioning: 1,
      },
      CM: {
        shortPass: 3,
        retention: 3,
        ballControl: 2,
        dribbling: 2,
        longPass: 2,
        positioning: 1,
        stamina: 1,
        longShots: 1,
      },
      CDM: {
        retention: 3,
        shortPass: 3,
        positioning: 2,
        interceptions: 2,
        ballControl: 2,
        longPass: 2,
        strength: 1,
      },
      FULLBACK: {
        dribbling: 2,
        shortPass: 2,
        crossing: 2,
        stamina: 2,
        ballControl: 2,
        positioning: 2,
        retention: 2,
        interceptions: 1,
      },
      CB: {
        strength: 3,
        interceptions: 3,
        tackling: 2,
        shortPass: 2,
        positioning: 2,
        retention: 1,
        ballControl: 1,
        marking: 1,
      },
      GK: {
        distribution: 4,
        reflexes: 3,
        oneOnOne: 3,
        positioning: 2,
        saving: 2,
        handling: 1,
      },
    },
    strengths: 'Magical 1v1 dribbling, silky ball control, devastating long-range golazos',
    weaknesses: 'Lower raw physical stamina grinding in heavy pitch conditions',
    badgeBg: 'bg-indigo-950/60',
    badgeBorder: 'border-indigo-500/60',
    textColor: 'text-indigo-300',
  },

  // 6. ARGENTINA - STYLE 6: FÚTBOL CHAMPÁN
  futbol_champan: {
    id: 'futbol_champan',
    styleNumber: 6,
    name: 'Fútbol Champán',
    leagueId: 'buenos_aires',
    leagueName: 'Liga Bonaerense Juvenil',
    city: 'Buenos Aires',
    country: 'Argentina',
    flag: '🇦🇷',
    inspiration: 'Aggressive, competitive Argentine football ("Lo siento si te gané, hermano")',
    corePhilosophy: '"Lo siento si te gané, hermano: acá todos corren, pegan y marcan."',
    primaryAttributes: ['Tackling', 'Stamina', 'Strength', 'Marking', 'Shooting'],
    allocations: {
      ST: {
        shooting: 4,
        positioning: 3,
        heading: 2,
        strength: 2,
        stamina: 2,
        pace: 1,
        longShots: 1,
      },
      WINGER: {
        stamina: 3,
        crossing: 3,
        pace: 2,
        strength: 2,
        positioning: 2,
        shooting: 1,
        dribbling: 1,
        heading: 1,
      },
      CAM: {
        stamina: 3,
        shortPass: 2,
        longShots: 2,
        tackling: 2,
        strength: 2,
        positioning: 2,
        interceptions: 1,
        retention: 1,
      },
      CM: {
        stamina: 3,
        tackling: 3,
        shortPass: 2,
        longShots: 2,
        strength: 2,
        interceptions: 2,
        positioning: 1,
      },
      CDM: {
        tackling: 4,
        stamina: 3,
        strength: 3,
        interceptions: 2,
        marking: 1,
        shortPass: 1,
        positioning: 1,
      },
      FULLBACK: {
        stamina: 5,
        tackling: 2,
        pace: 2,
        marking: 2,
        strength: 2,
        crossing: 1,
        positioning: 1,
      },
      CB: {
        tackling: 4,
        strength: 3,
        marking: 3,
        interceptions: 2,
        stamina: 2,
        heading: 1,
      },
      GK: {
        aerialReach: 4,
        oneOnOne: 3,
        reflexes: 3,
        handling: 2,
        saving: 2,
        positioning: 1,
      },
    },
    strengths: 'Brutal defensive aggression, relentless pressing, physical resilience in clutch derby matches',
    weaknesses: 'Prone to accumulating foul cards and risk of high-intensity exhaustion',
    badgeBg: 'bg-emerald-950/60',
    badgeBorder: 'border-emerald-500/60',
    textColor: 'text-emerald-300',
  },

  // 7. BRAZIL - STYLE 7: JOGO BONITO
  jogo_bonito: {
    id: 'jogo_bonito',
    styleNumber: 7,
    name: 'Jogo Bonito',
    leagueId: 'sao_paulo',
    leagueName: 'Liga Paulista Juvenil',
    city: 'São Paulo',
    country: 'Brazil',
    flag: '🇧🇷',
    inspiration: 'Technical Brazilian football emphasizing individual flair and creativity',
    corePhilosophy: 'Dribble → control → creativity → flair → technique.',
    primaryAttributes: ['Dribbling', 'Ball Control', 'Retention', 'Pace', 'Shooting'],
    allocations: {
      ST: {
        dribbling: 3,
        ballControl: 3,
        shooting: 3,
        retention: 2,
        positioning: 2,
        pace: 1,
        longShots: 1,
      },
      WINGER: {
        dribbling: 5,
        ballControl: 3,
        retention: 2,
        pace: 2,
        shooting: 1,
        crossing: 1,
        positioning: 1,
      },
      CAM: {
        dribbling: 3,
        ballControl: 3,
        shortPass: 3,
        retention: 2,
        longPass: 1,
        longShots: 2,
        positioning: 1,
      },
      CM: {
        dribbling: 2,
        stamina: 3,
        ballControl: 2,
        shortPass: 2,
        positioning: 2,
        retention: 2,
        longPass: 1,
        interceptions: 1,
      },
      CDM: {
        tackling: 3,
        strength: 3,
        stamina: 3,
        retention: 2,
        interceptions: 2,
        ballControl: 1,
        positioning: 1,
      },
      FULLBACK: {
        dribbling: 3,
        stamina: 3,
        pace: 2,
        ballControl: 2,
        crossing: 2,
        retention: 1,
        positioning: 1,
        shortPass: 1,
      },
      CB: {
        strength: 3,
        tackling: 3,
        ballControl: 2,
        interceptions: 2,
        shortPass: 2,
        retention: 1,
        positioning: 1,
        stamina: 1,
      },
      GK: {
        distribution: 4,
        reflexes: 4,
        oneOnOne: 3,
        handling: 2,
        saving: 2,
      },
    },
    strengths: 'Samba footwork, unbelievable dribbling bursts, improvisational attacking genius',
    weaknesses: 'Occasional defensive over-committal when pushing forward',
    badgeBg: 'bg-yellow-950/60',
    badgeBorder: 'border-yellow-500/60',
    textColor: 'text-yellow-300',
  },

  // 8. BRAZIL - STYLE 8: RELATIONAL PLAY
  relational_play: {
    id: 'relational_play',
    styleNumber: 8,
    name: 'Relational Play',
    leagueId: 'sao_paulo',
    leagueName: 'Liga Paulista Juvenil',
    city: 'São Paulo',
    country: 'Brazil',
    flag: '🇧🇷',
    inspiration: 'Inspired by modern Brazilian relational/functional football (Fluminense style)',
    corePhilosophy: 'Positioning + technical ability + movement + coordinated pressing + intelligent rotations.',
    primaryAttributes: ['Position', 'Short Pass', 'Dribbling', 'Retention', 'Ball Control'],
    allocations: {
      ST: {
        positioning: 3,
        dribbling: 2,
        ballControl: 2,
        shooting: 3,
        shortPass: 2,
        retention: 2,
        stamina: 1,
      },
      WINGER: {
        dribbling: 3,
        positioning: 3,
        ballControl: 2,
        shortPass: 2,
        retention: 2,
        crossing: 1,
        stamina: 1,
        shooting: 1,
      },
      CAM: {
        positioning: 3,
        dribbling: 3,
        shortPass: 3,
        ballControl: 2,
        retention: 2,
        longPass: 1,
        longShots: 1,
      },
      CM: {
        positioning: 3,
        shortPass: 3,
        stamina: 2,
        retention: 2,
        dribbling: 2,
        ballControl: 1,
        interceptions: 1,
        longPass: 1,
      },
      CDM: {
        positioning: 3,
        interceptions: 3,
        retention: 2,
        shortPass: 2,
        stamina: 2,
        tackling: 1,
        strength: 1,
        ballControl: 1,
      },
      FULLBACK: {
        positioning: 3,
        stamina: 3,
        dribbling: 2,
        shortPass: 2,
        crossing: 2,
        interceptions: 1,
        ballControl: 1,
        retention: 1,
      },
      CB: {
        positioning: 3,
        interceptions: 3,
        shortPass: 2,
        tackling: 2,
        ballControl: 2,
        retention: 1,
        strength: 1,
        stamina: 1,
      },
      GK: {
        distribution: 4,
        positioning: 4,
        handling: 3,
        reflexes: 2,
        saving: 2,
      },
    },
    strengths: 'Hypnotic passing triangles, dynamic positional overloads, fluid team chemistry',
    weaknesses: 'Requires synchronized team positioning; vulnerable to rapid long-ball breaks',
    badgeBg: 'bg-teal-950/60',
    badgeBorder: 'border-teal-500/60',
    textColor: 'text-teal-300',
  },

  // 9. FRANCE - STYLE 9: COUNTER ATTACK
  counter_attack: {
    id: 'counter_attack',
    styleNumber: 9,
    name: 'Counter Attack',
    leagueId: 'paris',
    leagueName: 'Ligue Parisienne des Jeunes',
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    inspiration: 'Fast, athletic and transition-focused French football',
    corePhilosophy: 'Win the ball → explode forward → exploit space → finish quickly.',
    primaryAttributes: ['Pace', 'Shooting', 'Position', 'Dribbling', 'Interceptions'],
    allocations: {
      ST: {
        pace: 3,
        shooting: 4,
        positioning: 3,
        dribbling: 2,
        stamina: 1,
        ballControl: 1,
        strength: 1,
      },
      WINGER: {
        pace: 4,
        dribbling: 3,
        positioning: 2,
        shooting: 2,
        stamina: 2,
        crossing: 1,
        ballControl: 1,
      },
      CAM: {
        pace: 2,
        positioning: 3,
        dribbling: 2,
        shortPass: 2,
        longPass: 2,
        stamina: 2,
        longShots: 1,
        ballControl: 1,
      },
      CM: {
        stamina: 3,
        pace: 2,
        interceptions: 2,
        shortPass: 2,
        positioning: 2,
        longPass: 2,
        strength: 1,
        dribbling: 1,
      },
      CDM: {
        interceptions: 3,
        stamina: 3,
        positioning: 2,
        tackling: 2,
        strength: 2,
        shortPass: 2,
        pace: 1,
      },
      FULLBACK: {
        pace: 4,
        stamina: 3,
        crossing: 2,
        interceptions: 2,
        positioning: 2,
        dribbling: 1,
        strength: 1,
      },
      CB: {
        strength: 3,
        pace: 3,
        interceptions: 3,
        tackling: 2,
        positioning: 2,
        stamina: 1,
        shortPass: 1,
      },
      GK: {
        distribution: 4,
        reflexes: 4,
        saving: 3,
        oneOnOne: 2,
        aerialReach: 2,
      },
    },
    strengths: 'Blistering acceleration, lightning-fast transition breaks, lethal clinical finishing',
    weaknesses: 'Less patient buildup against deep low-block defenses',
    badgeBg: 'bg-purple-950/60',
    badgeBorder: 'border-purple-500/60',
    textColor: 'text-purple-300',
  },

  // 10. FRANCE - STYLE 10: FRENCH POSSESSION
  french_possession: {
    id: 'french_possession',
    styleNumber: 10,
    name: 'French Possession',
    leagueId: 'paris',
    leagueName: 'Ligue Parisienne des Jeunes',
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    inspiration: 'Athletic, structured possession football with French physical dominance',
    corePhilosophy: 'Physical quality + intelligent positioning + controlled possession + athletic movement.',
    primaryAttributes: ['Strength', 'Interceptions', 'Position', 'Pace', 'Short Pass', 'Stamina'],
    allocations: {
      ST: {
        shooting: 3,
        positioning: 3,
        strength: 2,
        pace: 2,
        ballControl: 2,
        shortPass: 1,
        stamina: 1,
        heading: 1,
      },
      WINGER: {
        pace: 3,
        dribbling: 2,
        crossing: 2,
        stamina: 2,
        positioning: 2,
        ballControl: 2,
        strength: 1,
        shooting: 1,
      },
      CAM: {
        shortPass: 3,
        positioning: 3,
        stamina: 2,
        ballControl: 2,
        strength: 2,
        longPass: 1,
        longShots: 1,
        dribbling: 1,
      },
      CM: {
        stamina: 3,
        shortPass: 2,
        positioning: 2,
        strength: 2,
        interceptions: 2,
        retention: 2,
        longPass: 1,
        ballControl: 1,
      },
      CDM: {
        strength: 3,
        interceptions: 3,
        stamina: 3,
        positioning: 2,
        tackling: 2,
        shortPass: 1,
        retention: 1,
      },
      FULLBACK: {
        stamina: 3,
        pace: 3,
        strength: 2,
        positioning: 2,
        crossing: 2,
        interceptions: 2,
        shortPass: 1,
      },
      CB: {
        strength: 3,
        interceptions: 3,
        positioning: 3,
        tackling: 2,
        pace: 2,
        shortPass: 1,
        stamina: 1,
      },
      GK: {
        aerialReach: 3,
        distribution: 3,
        reflexes: 3,
        positioning: 3,
        saving: 2,
        handling: 1,
      },
    },
    strengths: 'Towering athletic presence, commanded midfield dominance, resilient ball retention',
    weaknesses: 'Deliberately less extreme technical micro-specialization than Tiki-Taka',
    badgeBg: 'bg-violet-950/60',
    badgeBorder: 'border-violet-500/60',
    textColor: 'text-violet-300',
  },
};

export const ALL_FOOTBALL_SCHOOL_LIST = Object.values(FOOTBALL_SCHOOLS);

export function getFootballSchoolById(id?: string): FootballSchoolPhilosophy {
  if (!id) return FOOTBALL_SCHOOLS.tiki_taka;
  if (FOOTBALL_SCHOOLS[id as FootballSchoolId]) {
    return FOOTBALL_SCHOOLS[id as FootballSchoolId];
  }
  // Try case-insensitive or name match
  const found = ALL_FOOTBALL_SCHOOL_LIST.find(
    (s) =>
      s.id.toLowerCase() === id.toLowerCase() ||
      s.name.toLowerCase() === id.toLowerCase()
  );
  return found || FOOTBALL_SCHOOLS.tiki_taka;
}

export function getFootballSchoolForClub(
  clubName?: string,
  leagueName?: string,
  cityName?: string,
  countryName?: string
): FootballSchoolPhilosophy {
  const cName = (clubName || '').toLowerCase();
  const lName = (leagueName || '').toLowerCase();
  const city = (cityName || '').toLowerCase();
  const country = (countryName || '').toLowerCase();

  // 1. Madrid Clubs
  if (
    cName.includes('chamartín') ||
    cName.includes('retiro') ||
    cName.includes('malasaña') ||
    cName.includes('carabanchel') ||
    cName.includes('usera') ||
    cName.includes('atlético') ||
    cName.includes('getafe')
  ) {
    return FOOTBALL_SCHOOLS.high_intensity_defense;
  }
  if (
    cName.includes('salamanca') ||
    cName.includes('argüelles') ||
    cName.includes('lavapiés') ||
    cName.includes('vallecas') ||
    cName.includes('villaverde') ||
    lName.includes('madrid') ||
    city.includes('madrid') ||
    country.includes('spain')
  ) {
    return FOOTBALL_SCHOOLS.tiki_taka;
  }

  // 2. London Clubs
  if (
    cName.includes('kensington') ||
    cName.includes('westminster') ||
    cName.includes('islington') ||
    cName.includes('brixton') ||
    cName.includes('peckham')
  ) {
    return FOOTBALL_SCHOOLS.brexit_ball;
  }
  if (
    cName.includes('camden') ||
    cName.includes('greenwich') ||
    cName.includes('hackney') ||
    cName.includes('croydon') ||
    cName.includes('tottenham') ||
    lName.includes('london') ||
    city.includes('london') ||
    country.includes('england')
  ) {
    return FOOTBALL_SCHOOLS.modern_english;
  }

  // 3. Argentina Clubs
  if (
    cName.includes('palermo') ||
    cName.includes('recoleta') ||
    cName.includes('san telmo') ||
    cName.includes('la boca') ||
    cName.includes('mataderos')
  ) {
    return FOOTBALL_SCHOOLS.paladar_negro;
  }
  if (
    cName.includes('belgrano') ||
    cName.includes('caballito') ||
    cName.includes('flores') ||
    cName.includes('barracas') ||
    cName.includes('villa lugano') ||
    lName.includes('bonaerense') ||
    city.includes('buenos aires') ||
    country.includes('argentina')
  ) {
    return FOOTBALL_SCHOOLS.futbol_champan;
  }

  // 4. Brazil Clubs
  if (
    cName.includes('moema') ||
    cName.includes('vila mariana') ||
    cName.includes('liberdade') ||
    cName.includes('lapa') ||
    cName.includes('guaianases')
  ) {
    return FOOTBALL_SCHOOLS.jogo_bonito;
  }
  if (
    cName.includes('pinheiros') ||
    cName.includes('tatuapé') ||
    cName.includes('santana') ||
    cName.includes('ipiranga') ||
    cName.includes('capela do socorro') ||
    lName.includes('paulista') ||
    city.includes('são paulo') ||
    country.includes('brazil')
  ) {
    return FOOTBALL_SCHOOLS.relational_play;
  }

  // 5. France Clubs
  if (
    cName.includes('montmartre') ||
    cName.includes('bastille') ||
    cName.includes('marais') ||
    cName.includes('batignolles') ||
    cName.includes('clignancourt')
  ) {
    return FOOTBALL_SCHOOLS.counter_attack;
  }
  if (
    cName.includes('passy') ||
    cName.includes('belleville') ||
    cName.includes('montparnasse') ||
    cName.includes('la villette') ||
    cName.includes('auteuil') ||
    lName.includes('paris') ||
    city.includes('paris') ||
    country.includes('france')
  ) {
    return FOOTBALL_SCHOOLS.french_possession;
  }

  return FOOTBALL_SCHOOLS.tiki_taka;
}
