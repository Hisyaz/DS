import { OutfieldDetailedStats, GkDetailedStats, PlayerStats, PlayerCardData } from '../types';
import { getChemistryInfo } from './chemistrySystem';
import { isBiggerYouthClubActive } from './youthAdaptationSystem';
import { applyStatPointInvestment, isStatWeaknessForPlayerType } from './statProgressionSystem';

export interface PlayStyleInfo {
  name: string;
  description: string;
  modernExample: string;
  legendExample: string;
}

export interface SubPositionTaxonomy {
  code: string;
  name: string;
  playStyles: string[];
  playStyleDetails: PlayStyleInfo[];
}

export interface PositionTaxonomy {
  category: 'ATT' | 'MID' | 'DEF' | 'GK';
  categoryLabel: string;
  subPositions: SubPositionTaxonomy[];
}

export const POSITION_TAXONOMY: PositionTaxonomy[] = [
  {
    category: 'ATT',
    categoryLabel: 'Attackers (ATT)',
    subPositions: [
      {
        code: 'ST',
        name: 'Striker (ST)',
        playStyles: ['Poacher', 'Target', 'Complete', 'Finisher', 'Decoy'],
        playStyleDetails: [
          {
            name: 'Poacher',
            description: 'Waits inside the area for the perfect chance.',
            modernExample: 'Erling Haaland',
            legendExample: 'Gerd Müller',
          },
          {
            name: 'Target',
            description: 'Uses physical strength to hold the ball and create chances for teammates.',
            modernExample: 'Olivier Giroud',
            legendExample: 'Didier Drogba',
          },
          {
            name: 'Complete',
            description: 'Can dribble, run, shoot from distance, finish, and create danger everywhere.',
            modernExample: 'Kylian Mbappé',
            legendExample: 'Ronaldo Nazário',
          },
          {
            name: 'Finisher',
            description: 'Elite movement and timing inside the box, always knows how to end attacks.',
            modernExample: 'Lautaro Martínez',
            legendExample: 'Eusébio',
          },
          {
            name: 'Decoy',
            description: 'Creates space through movement and pressing, sacrificing personal chances for the team.',
            modernExample: 'Ferran Torres',
            legendExample: 'Roberto Firmino',
          },
        ],
      },
      {
        code: 'LW',
        name: 'Left Winger (LW)',
        playStyles: ['Traditional', 'Inverted', 'Prolific', 'Pressing'],
        playStyleDetails: [
          {
            name: 'Traditional',
            description: 'Stays wide and creates danger through crossing and wing play.',
            modernExample: 'Bukayo Saka',
            legendExample: 'Garrincha',
          },
          {
            name: 'Inverted',
            description: 'Uses elite dribbling to cut inside and attack centrally.',
            modernExample: 'Lamine Yamal',
            legendExample: 'Lionel Messi',
          },
          {
            name: 'Prolific',
            description: 'Master of positioning, entering spaces and scoring from wide areas.',
            modernExample: 'Cole Palmer',
            legendExample: 'Cristiano Ronaldo',
          },
          {
            name: 'Pressing',
            description: 'Relentlessly presses opponents and creates opportunities through work rate.',
            modernExample: 'Luis Díaz',
            legendExample: 'Park Ji-sung',
          },
        ],
      },
      {
        code: 'RW',
        name: 'Right Winger (RW)',
        playStyles: ['Traditional', 'Inverted', 'Prolific', 'Pressing'],
        playStyleDetails: [
          {
            name: 'Traditional',
            description: 'Stays wide and creates danger through crossing and wing play.',
            modernExample: 'Bukayo Saka',
            legendExample: 'Garrincha',
          },
          {
            name: 'Inverted',
            description: 'Uses elite dribbling to cut inside and attack centrally.',
            modernExample: 'Lamine Yamal',
            legendExample: 'Lionel Messi',
          },
          {
            name: 'Prolific',
            description: 'Master of positioning, entering spaces and scoring from wide areas.',
            modernExample: 'Cole Palmer',
            legendExample: 'Cristiano Ronaldo',
          },
          {
            name: 'Pressing',
            description: 'Relentlessly presses opponents and creates opportunities through work rate.',
            modernExample: 'Luis Díaz',
            legendExample: 'Park Ji-sung',
          },
        ],
      },
      {
        code: 'SS',
        name: 'Second Striker (SS)',
        playStyles: ['Creator', 'Shadow', 'Classic N10', 'Engine'],
        playStyleDetails: [
          {
            name: 'Creator',
            description: 'Operates behind the striker to orchestrate dangerous attacks, subtle through-balls, and key passes.',
            modernExample: 'Antoine Griezmann',
            legendExample: 'Dennis Bergkamp',
          },
          {
            name: 'Shadow',
            description: 'Exploits pockets of space left by the primary striker to finish with clinical instincts.',
            modernExample: 'Paulo Dybala',
            legendExample: 'Alessandro Del Piero',
          },
          {
            name: 'Classic N10',
            description: 'Master of touch, tight-space control, and unpredictable playmaking in the hole.',
            modernExample: 'João Félix',
            legendExample: 'Roberto Baggio',
          },
          {
            name: 'Engine',
            description: 'Covers tireless ground between midfield and forward lines, pressing high and linking counters.',
            modernExample: 'Thomas Müller',
            legendExample: 'Wayne Rooney',
          },
        ],
      },
    ],
  },
  {
    category: 'MID',
    categoryLabel: 'Midfielders (MID)',
    subPositions: [
      {
        code: 'CAM',
        name: 'Central Attacking Midfielder (CAM)',
        playStyles: ['Creator', 'Shadow', 'Classic N10', 'Engine'],
        playStyleDetails: [
          {
            name: 'Creator',
            description: 'Sees passes others cannot and creates chances with elite vision and shooting.',
            modernExample: 'Kevin De Bruyne',
            legendExample: 'Zinedine Zidane',
          },
          {
            name: 'Shadow',
            description: 'Reads spaces and attacks from deep positions to score.',
            modernExample: 'Jude Bellingham',
            legendExample: 'Johan Cruyff',
          },
          {
            name: 'Classic N10',
            description: 'A magical creative player who controls games through technique, dribbling and impossible passes.',
            modernExample: 'James Rodríguez',
            legendExample: 'Riquelme',
          },
          {
            name: 'Engine',
            description: 'A complete runner who attacks, defends and covers every area.',
            modernExample: 'Federico Valverde',
            legendExample: 'Pavel Nedvěd',
          },
        ],
      },
      {
        code: 'CM',
        name: 'Central Midfielder (CM)',
        playStyles: ['Box-to-Box', 'Maestro', 'Runner'],
        playStyleDetails: [
          {
            name: 'Box-to-Box',
            description: 'Provides presence in both areas with endless running.',
            modernExample: 'Dominik Szoboszlai',
            legendExample: 'Lothar Matthäus',
          },
          {
            name: 'Maestro',
            description: 'Controls the rhythm of the match through passing, timing and ball retention.',
            modernExample: 'Pedri',
            legendExample: 'Xavi Hernández',
          },
          {
            name: 'Runner',
            description: 'Uses intelligent movement to arrive from deep positions and contribute physically.',
            modernExample: 'Marcos Llorente',
            legendExample: 'Yaya Touré',
          },
        ],
      },
      {
        code: 'CDM',
        name: 'Central Defensive Midfielder (CDM)',
        playStyles: ['Enforcer', 'Anchor'],
        playStyleDetails: [
          {
            name: 'Enforcer',
            description: 'Uses physicality, tactical fouls and intimidation to dominate midfield.',
            modernExample: 'Casemiro',
            legendExample: 'Roy Keane',
          },
          {
            name: 'Anchor',
            description: 'Controls the game from deep, starting attacks and protecting the team.',
            modernExample: 'Rodri',
            legendExample: 'Sergio Busquets',
          },
        ],
      },
      {
        code: 'LM',
        name: 'Left Midfielder (LM)',
        playStyles: ['Traditional', 'Inverted', 'Prolific', 'Pressing'],
        playStyleDetails: [
          {
            name: 'Traditional',
            description: 'Hugs the left touchline, providing width and pinpoint crossing into the box.',
            modernExample: 'Kingsley Coman',
            legendExample: 'Ryan Giggs',
          },
          {
            name: 'Inverted',
            description: 'Drives inward from wide midfield positions to link centrally and test the goalkeeper.',
            modernExample: 'Federico Chiesa',
            legendExample: 'Pavel Nedvěd',
          },
          {
            name: 'Prolific',
            description: 'Times late runs into the penalty box from the left channel to score crucial goals.',
            modernExample: 'Son Heung-min',
            legendExample: 'Robert Pirès',
          },
          {
            name: 'Pressing',
            description: 'Provides relentless two-way defensive work rate, tracking back and winning balls out wide.',
            modernExample: 'Daichi Kamada',
            legendExample: 'Park Ji-sung',
          },
        ],
      },
      {
        code: 'RM',
        name: 'Right Midfielder (RM)',
        playStyles: ['Traditional', 'Inverted', 'Prolific', 'Pressing'],
        playStyleDetails: [
          {
            name: 'Traditional',
            description: 'Commands the right wing with crossing precision, pacing, and accurate delivery.',
            modernExample: 'Bukayo Saka',
            legendExample: 'David Beckham',
          },
          {
            name: 'Inverted',
            description: 'Cuts inside onto stronger foot from wide midfield to unbalance defensive lines.',
            modernExample: 'Jarrod Bowen',
            legendExample: 'Arjen Robben',
          },
          {
            name: 'Prolific',
            description: 'Attacks the back post and breaks forward from wide midfield with lethal efficiency.',
            modernExample: 'Serge Gnabry',
            legendExample: 'Freddie Ljungberg',
          },
          {
            name: 'Pressing',
            description: 'Relentlessly tracks opposition fullbacks and regains possession high up the pitch.',
            modernExample: 'Bryan Mbeumo',
            legendExample: 'Dirk Kuyt',
          },
        ],
      },
    ],
  },
  {
    category: 'DEF',
    categoryLabel: 'Defenders (DEF)',
    subPositions: [
      {
        code: 'LB',
        name: 'Left Back (LB)',
        playStyles: ['Defensive', 'Inverted', 'Attacker', 'Balanced'],
        playStyleDetails: [
          {
            name: 'Defensive',
            description: 'Prioritizes protecting the wing and staying back.',
            modernExample: 'Kyle Walker',
            legendExample: 'Lilian Thuram',
          },
          {
            name: 'Inverted',
            description: 'Moves into midfield to create numerical advantages.',
            modernExample: 'Pedro Porro',
            legendExample: 'Philipp Lahm',
          },
          {
            name: 'Attacker',
            description: 'Constantly attacks the wing like an additional winger.',
            modernExample: 'Achraf Hakimi',
            legendExample: 'Roberto Carlos',
          },
          {
            name: 'Balanced',
            description: 'Provides defense, attack and intelligent decisions.',
            modernExample: 'Andrew Robertson',
            legendExample: 'Paolo Maldini',
          },
        ],
      },
      {
        code: 'RB',
        name: 'Right Back (RB)',
        playStyles: ['Defensive', 'Inverted', 'Attacker', 'Balanced'],
        playStyleDetails: [
          {
            name: 'Defensive',
            description: 'Prioritizes protecting the wing and staying back.',
            modernExample: 'Kyle Walker',
            legendExample: 'Lilian Thuram',
          },
          {
            name: 'Inverted',
            description: 'Moves into midfield to create numerical advantages.',
            modernExample: 'Pedro Porro',
            legendExample: 'Philipp Lahm',
          },
          {
            name: 'Attacker',
            description: 'Constantly attacks the wing like an additional winger.',
            modernExample: 'Achraf Hakimi',
            legendExample: 'Roberto Carlos',
          },
          {
            name: 'Balanced',
            description: 'Provides defense, attack and intelligent decisions.',
            modernExample: 'Andrew Robertson',
            legendExample: 'Paolo Maldini',
          },
        ],
      },
      {
        code: 'LWB',
        name: 'Left Wing-Back (LWB)',
        playStyles: ['Defensive', 'Inverted', 'Attacker', 'Balanced'],
        playStyleDetails: [
          {
            name: 'Defensive',
            description: 'Prioritizes protecting the wing and staying back.',
            modernExample: 'Kyle Walker',
            legendExample: 'Lilian Thuram',
          },
          {
            name: 'Inverted',
            description: 'Moves into midfield to create numerical advantages.',
            modernExample: 'Pedro Porro',
            legendExample: 'Philipp Lahm',
          },
          {
            name: 'Attacker',
            description: 'Constantly attacks the wing like an additional winger.',
            modernExample: 'Achraf Hakimi',
            legendExample: 'Roberto Carlos',
          },
          {
            name: 'Balanced',
            description: 'Provides defense, attack and intelligent decisions.',
            modernExample: 'Andrew Robertson',
            legendExample: 'Paolo Maldini',
          },
        ],
      },
      {
        code: 'RWB',
        name: 'Right Wing-Back (RWB)',
        playStyles: ['Defensive', 'Inverted', 'Attacker', 'Balanced'],
        playStyleDetails: [
          {
            name: 'Defensive',
            description: 'Prioritizes protecting the wing and staying back.',
            modernExample: 'Kyle Walker',
            legendExample: 'Lilian Thuram',
          },
          {
            name: 'Inverted',
            description: 'Moves into midfield to create numerical advantages.',
            modernExample: 'Pedro Porro',
            legendExample: 'Philipp Lahm',
          },
          {
            name: 'Attacker',
            description: 'Constantly attacks the wing like an additional winger.',
            modernExample: 'Achraf Hakimi',
            legendExample: 'Roberto Carlos',
          },
          {
            name: 'Balanced',
            description: 'Provides defense, attack and intelligent decisions.',
            modernExample: 'Andrew Robertson',
            legendExample: 'Paolo Maldini',
          },
        ],
      },
      {
        code: 'CB',
        name: 'Center Back (CB)',
        playStyles: ['Destroyer', 'Distributor', 'Playmaker', 'Stopper'],
        playStyleDetails: [
          {
            name: 'Destroyer',
            description: 'Physical defender who aggressively steps forward to stop attackers.',
            modernExample: 'Antonio Rüdiger',
            legendExample: 'Nemanja Vidić',
          },
          {
            name: 'Distributor',
            description: 'Calm defender who builds play through passing and decision making.',
            modernExample: 'William Saliba',
            legendExample: 'Franco Baresi',
          },
          {
            name: 'Playmaker',
            description: 'Elite passing defender capable of creating attacks from deep.',
            modernExample: 'Virgil van Dijk',
            legendExample: 'Franz Beckenbauer',
          },
          {
            name: 'Stopper',
            description: 'Reads danger early and stops attacks through positioning and timing.',
            modernExample: 'Gabriel Magalhães',
            legendExample: 'Fabio Cannavaro',
          },
        ],
      },
    ],
  },
  {
    category: 'GK',
    categoryLabel: 'Goalkeeper (GK)',
    subPositions: [
      {
        code: 'GK',
        name: 'Goalkeeper (GK)',
        playStyles: ['Balanced', 'Sweeper', 'Wall'],
        playStyleDetails: [
          {
            name: 'Balanced',
            description: 'Combines shot stopping with distribution and defensive organization.',
            modernExample: 'Thibaut Courtois',
            legendExample: 'Iker Casillas',
          },
          {
            name: 'Sweeper',
            description: 'Acts like an additional defender/midfielder with passing ability and aggressive positioning.',
            modernExample: 'Manuel Neuer',
            legendExample: 'Lev Yashin',
          },
          {
            name: 'Wall',
            description: 'Pure shot stopper focused on saving everything near the goal.',
            modernExample: 'Emiliano Martínez',
            legendExample: 'Oliver Kahn',
          },
        ],
      },
    ],
  },
];

export function getSubPositionInfo(code: string) {
  if (!code || code === 'None' || code === 'NONE' || code === 'Unassigned' || code === 'UNASSIGNED') {
    return {
      category: 'UNASSIGNED' as const,
      code: '',
      name: 'Unassigned',
      playStyles: [],
      playStyleDetails: [],
    };
  }
  for (const cat of POSITION_TAXONOMY) {
    const sub = cat.subPositions.find((s) => s.code === code.toUpperCase());
    if (sub) {
      return { category: cat.category, ...sub };
    }
  }
  return {
    category: 'UNASSIGNED' as const,
    code: code ? code.toUpperCase() : '',
    name: code ? code.toUpperCase() : 'Unassigned',
    playStyles: [],
    playStyleDetails: [],
  };
}

export function getPlayStyleDetail(subPositionCode: string, playStyleName: string): PlayStyleInfo | undefined {
  if (playStyleName && playStyleName.toLowerCase() === 'basic') {
    return {
      name: 'Basic',
      description: 'Fundamental, unspecialized playstyle for young developing players. OVR is calculated purely based on position and sub-position without playstyle bias.',
      modernExample: 'Youth Academy Prospect',
      legendExample: 'Academy Graduate',
    };
  }
  const info = getSubPositionInfo(subPositionCode);
  if (!info.playStyleDetails) return undefined;
  return info.playStyleDetails.find((ps) => ps.name.toLowerCase() === playStyleName.toLowerCase());
}

export function validatePlayStyleForSubPosition(subPositionCode: string, currentStyle?: string): string {
  if (currentStyle && currentStyle.trim().toLowerCase() === 'basic') {
    return 'Basic';
  }
  const info = getSubPositionInfo(subPositionCode);
  const validStyles = info.playStyles || [];
  if (validStyles.length === 0) return 'Balanced';
  if (currentStyle && validStyles.some((s) => s.toLowerCase() === currentStyle.toLowerCase())) {
    const matched = validStyles.find((s) => s.toLowerCase() === currentStyle.toLowerCase());
    return matched || currentStyle;
  }
  return validStyles[0];
}

export function getOrCreateOutfieldDetailed(stats?: PlayerStats): OutfieldDetailedStats {
  const safeStats = stats || { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 };
  const pro = typeof safeStats.pro === 'number' && !isNaN(safeStats.pro) ? safeStats.pro : 70;
  const def = typeof safeStats.def === 'number' && !isNaN(safeStats.def) ? safeStats.def : 50;
  const cre = typeof safeStats.cre === 'number' && !isNaN(safeStats.cre) ? safeStats.cre : 70;
  const men = typeof safeStats.men === 'number' && !isNaN(safeStats.men) ? safeStats.men : 70;
  const sco = typeof safeStats.goa === 'number' && !isNaN(safeStats.goa) ? safeStats.goa : 70;
  const phy = typeof safeStats.phy === 'number' && !isNaN(safeStats.phy) ? safeStats.phy : 70;

  const base: OutfieldDetailedStats = {
    pace: phy,
    stamina: phy,
    strength: phy,
    ballControl: pro,
    retention: pro,
    dribbling: pro,
    shortPass: cre,
    longPass: cre,
    crossing: cre,
    shooting: sco,
    heading: sco,
    longShots: sco,
    tackling: def,
    marking: def,
    interceptions: def,
    positioning: men,
    composure: men,
    reactions: men,
  };

  if (safeStats.detailed) {
    const d = safeStats.detailed;
    return {
      pace: typeof d.pace === 'number' && !isNaN(d.pace) ? d.pace : base.pace,
      stamina: typeof d.stamina === 'number' && !isNaN(d.stamina) ? d.stamina : base.stamina,
      strength: typeof d.strength === 'number' && !isNaN(d.strength) ? d.strength : base.strength,
      ballControl: typeof d.ballControl === 'number' && !isNaN(d.ballControl) ? d.ballControl : base.ballControl,
      retention: typeof d.retention === 'number' && !isNaN(d.retention) ? d.retention : base.retention,
      dribbling: typeof d.dribbling === 'number' && !isNaN(d.dribbling) ? d.dribbling : base.dribbling,
      shortPass: typeof d.shortPass === 'number' && !isNaN(d.shortPass) ? d.shortPass : base.shortPass,
      longPass: typeof d.longPass === 'number' && !isNaN(d.longPass) ? d.longPass : base.longPass,
      crossing: typeof d.crossing === 'number' && !isNaN(d.crossing) ? d.crossing : base.crossing,
      shooting: typeof d.shooting === 'number' && !isNaN(d.shooting) ? d.shooting : base.shooting,
      heading: typeof d.heading === 'number' && !isNaN(d.heading) ? d.heading : base.heading,
      longShots: typeof d.longShots === 'number' && !isNaN(d.longShots) ? d.longShots : base.longShots,
      tackling: typeof d.tackling === 'number' && !isNaN(d.tackling) ? d.tackling : base.tackling,
      marking: typeof d.marking === 'number' && !isNaN(d.marking) ? d.marking : base.marking,
      interceptions: typeof d.interceptions === 'number' && !isNaN(d.interceptions) ? d.interceptions : base.interceptions,
      positioning: typeof d.positioning === 'number' && !isNaN(d.positioning) ? d.positioning : base.positioning,
      composure: typeof d.composure === 'number' && !isNaN(d.composure) ? d.composure : base.composure,
      reactions: typeof d.reactions === 'number' && !isNaN(d.reactions) ? d.reactions : base.reactions,
    };
  }
  return base;
}

/**
 * Returns growth spurt temporary technical penalty status (Dribbling -10, Ball Control -10 for 1 month).
 */
export function getGrowthSpurtPenaltyInfo(player: PlayerCardData): {
  isPenaltyActive: boolean;
  dribblingPenalty: number;
  ballControlPenalty: number;
  monthsRemaining: number;
} {
  const isPenaltyActive = !!(player.growthSpurtPenaltyMonthsRemaining && player.growthSpurtPenaltyMonthsRemaining > 0);
  return {
    isPenaltyActive,
    dribblingPenalty: isPenaltyActive ? -10 : 0,
    ballControlPenalty: isPenaltyActive ? -10 : 0,
    monthsRemaining: isPenaltyActive ? (player.growthSpurtPenaltyMonthsRemaining || 0) : 0,
  };
}

export const SPECIAL_HAIR_STAT_BONUSES: Record<string, Partial<OutfieldDetailedStats>> = {
  'el-shaarawy-spikes': { shooting: 2, dribbling: 2, pace: 2 },
  'taribo-west': { stamina: 2, pace: 2, crossing: 2, marking: 2 },
  'valderrama-afro': { longPass: 5, shortPass: 5, retention: 5 },
  'davids-goggles': { stamina: 5, tackling: 5, longShots: 5 },
  'pogba-razor': { longPass: 5, strength: 5, longShots: 15 },
  'beckham-mohawk': { crossing: 15, longPass: 10, longShots: 10 },
  'cucurella-afro': { tackling: 10, marking: 10, interceptions: 10 },
  'vidal-crest': { tackling: 15, stamina: 15, positioning: 10, shooting: 5, heading: 5 },
  'ronaldo-noodle': { shooting: 15, positioning: 15, composure: 15, heading: 15 },
  'puyol-curly': { stamina: 10, pace: 10, tackling: 15, heading: 15 },
  'neymar-mohawk': { dribbling: 20, ballControl: 15, pace: 10 },
  'r9-2002': { shooting: 15, positioning: 15, pace: 15, dribbling: 15 },
};

/**
 * Calculates Royal Beard's +18 bonus points:
 * Sequentially distributes +1 point at a time across ALL_ATTRIBUTE_KEYS in standard game order.
 * Strictly ignores stats at 99 and Stat Break stats at 100+.
 * Continues cycling through the stat list until exactly 18 points have been assigned.
 */
export function calculateRoyalBeardBonus(
  baseStats: OutfieldDetailedStats,
  statBreakStats?: Record<string, number>,
  otherBonuses: Record<string, number> = {}
): Record<string, number> {
  const beardBonuses: Record<string, number> = {};
  let pointsRemaining = 18;
  const statKeys = ALL_ATTRIBUTE_KEYS;

  let iterations = 0;
  const maxIterations = 50;

  while (pointsRemaining > 0 && iterations < maxIterations) {
    let distributedInPass = 0;
    for (const key of statKeys) {
      if (pointsRemaining <= 0) break;

      const baseVal = baseStats[key] || 40;
      const isStatBroken = baseVal >= 100 || Boolean(statBreakStats?.[key]);
      if (isStatBroken) continue; // Ignore Stat Break stats

      const currentBonus = (otherBonuses[key] || 0) + (beardBonuses[key] || 0);
      const currentEffective = baseVal + currentBonus;

      if (currentEffective < 99) {
        beardBonuses[key] = (beardBonuses[key] || 0) + 1;
        pointsRemaining--;
        distributedInPass++;
      }
    }

    if (distributedInPass === 0) {
      break; // No eligible stats under 99 left
    }
    iterations++;
  }

  return beardBonuses;
}

/**
 * Computes all active temporary cosmetic stat bonuses (Facial Hair, Tattoos).
 */
export function getCosmeticStatBonuses(player: PlayerCardData | Partial<PlayerCardData> | undefined): Record<string, number> {
  const bonuses: Record<string, number> = {};
  if (!player) return bonuses;

  const facialHair = player.biometrics?.facialHairStyle || (player.biometrics as any)?.facialHair || 'none';
  const neckTattoo = player.accessories?.tattooNeck;
  const armTattooL = player.accessories?.tattooArmL;
  const armTattooR = player.accessories?.tattooArmR;
  const faceTattoo = player.accessories?.tattooFace;
  const headwear = player.accessories?.headwear || player.accessories?.accessory;
  const eyewear = player.accessories?.eyewear || player.accessories?.accessory;
  const necklace = player.accessories?.necklace;
  const earringL = player.accessories?.earringL || player.accessories?.earring;
  const earringR = player.accessories?.earringR || player.accessories?.earring;

  // 1. Facial Hair equipped bonuses
  if (facialHair === '3-day-beard') {
    bonuses.strength = (bonuses.strength || 0) + 1;
  } else if (facialHair === 'well-kept') {
    bonuses.strength = (bonuses.strength || 0) + 5;
  } else if (facialHair === 'chin-strap') {
    bonuses.crossing = (bonuses.crossing || 0) + 5;
  } else if (facialHair === 'goatee') {
    bonuses.positioning = (bonuses.positioning || 0) + 5;
  } else if (facialHair === 'mutton-chops') {
    bonuses.strength = (bonuses.strength || 0) + 10;
  } else if (facialHair === 'wild-beard' || facialHair === 'full-beard') {
    bonuses.heading = (bonuses.heading || 0) + 10;
  }

  // 2. Headwear & Eyewear equipped bonuses
  if (headwear === 'headband') {
    bonuses.tackling = (bonuses.tackling || 0) + 3;
    bonuses.retention = (bonuses.retention || 0) + 3;
    bonuses.composure = (bonuses.composure || 0) + 3;
    bonuses.reactions = (bonuses.reactions || 0) + 3;
  } else if (headwear === 'performance-band') {
    bonuses.pace = (bonuses.pace || 0) + 5;
    bonuses.strength = (bonuses.strength || 0) + 5;
    bonuses.longShots = (bonuses.longShots || 0) + 5;
  }

  if (eyewear === 'sports-glasses') {
    bonuses.shortPass = (bonuses.shortPass || 0) + 10;
    bonuses.longPass = (bonuses.longPass || 0) + 10;
    bonuses.crossing = (bonuses.crossing || 0) + 10;
  }

  // 3. Necklace equipped bonuses
  if (necklace === 'dog-tags') {
    bonuses.composure = (bonuses.composure || 0) + 15;
  } else if (necklace === 'silver-chain') {
    bonuses.longPass = (bonuses.longPass || 0) + 5;
    bonuses.shortPass = (bonuses.shortPass || 0) + 5;
    bonuses.shooting = (bonuses.shooting || 0) + 5;
    bonuses.longShots = (bonuses.longShots || 0) + 5;
  } else if (necklace === 'gold-chain') {
    bonuses.shooting = (bonuses.shooting || 0) + 10;
    bonuses.dribbling = (bonuses.dribbling || 0) + 10;
    bonuses.retention = (bonuses.retention || 0) + 10;
    bonuses.positioning = (bonuses.positioning || 0) + 10;
  } else if (necklace === 'diamonds-incrusted' || necklace === 'diamond-chain') {
    bonuses.dribbling = (bonuses.dribbling || 0) + 15;
    bonuses.ballControl = (bonuses.ballControl || 0) + 15;
    bonuses.longPass = (bonuses.longPass || 0) + 15;
    bonuses.longShots = (bonuses.longShots || 0) + 15;
  }

  // 4. Earrings equipped bonuses
  const activeEarrings = [earringL, earringR].filter((e) => e && e !== 'none');
  const uniqueEarrings = Array.from(new Set(activeEarrings));
  uniqueEarrings.forEach((earring) => {
    if (earring === 'small-barbell') {
      bonuses.reactions = (bonuses.reactions || 0) + 5;
    } else if (earring === 'large-barbell') {
      bonuses.composure = (bonuses.composure || 0) + 10;
    } else if (earring === 'gem') {
      bonuses.retention = (bonuses.retention || 0) + 20;
    }
  });

  // 2. Neck Tattoo equipped bonuses
  if (neckTattoo === 'script') {
    bonuses.composure = (bonuses.composure || 0) + 1;
  } else if (neckTattoo === 'rose') {
    bonuses.composure = (bonuses.composure || 0) + 3;
  } else if (neckTattoo === 'wings') {
    bonuses.composure = (bonuses.composure || 0) + 5;
  } else if (neckTattoo === 'tribal') {
    bonuses.composure = (bonuses.composure || 0) + 10;
  } else if (neckTattoo === 'blackout') {
    bonuses.composure = (bonuses.composure || 0) + 30;
  }

  // 3. Arm Sleeve Tattoo equipped bonuses (evaluated for Left and Right arms)
  const armTattoos = [armTattooL, armTattooR].filter(Boolean);
  for (const arm of armTattoos) {
    if (arm === 'double-stripe' || arm === 'two-lines') {
      bonuses.shortPass = (bonuses.shortPass || 0) + 1;
    } else if (arm === 'script-sleeve' || arm === 'text-script') {
      bonuses.dribbling = (bonuses.dribbling || 0) + 3;
    } else if (arm === 'tribal') {
      bonuses.ballControl = (bonuses.ballControl || 0) + 5;
    } else if (arm === 'mandala-sleeve' || arm === 'full-sleeve-flowery') {
      bonuses.longPass = (bonuses.longPass || 0) + 10;
    } else if (arm === 'blackout-sleeve') {
      bonuses.strength = (bonuses.strength || 0) + 15;
    }
  }

  // 4. Face Tattoo equipped bonuses
  if (faceTattoo === 'star') {
    bonuses.retention = (bonuses.retention || 0) + 1;
  } else if (faceTattoo === 'script-cheek') {
    bonuses.marking = (bonuses.marking || 0) + 3;
  } else if (faceTattoo === 'crown-temple') {
    bonuses.interceptions = (bonuses.interceptions || 0) + 5;
  } else if (faceTattoo === 'heart') {
    bonuses.reactions = (bonuses.reactions || 0) + 10;
  } else if (faceTattoo === 'under-eye-cross') {
    bonuses.tackling = (bonuses.tackling || 0) + 15;
  }

  // 5. Royal Beard: +18 stat points distributed sequentially
  if (facialHair === 'royal-beard') {
    const baseStats = getOrCreateOutfieldDetailed((player as any).stats);
    const royalBonuses = calculateRoyalBeardBonus(baseStats, (player as any).statBreakStats, bonuses);
    Object.entries(royalBonuses).forEach(([k, v]) => {
      bonuses[k] = (bonuses[k] || 0) + v;
    });
  }

  return bonuses;
}

export interface StatModifierInfo {
  baseVal: number;
  effectiveVal: number;
  bonus: number;
  penalty: number;
  delta: number; // net change (bonus - penalty)
  isStatBroken: boolean;
}

/**
 * Normalizes effective stat calculation strictly following the hierarchy:
 * 1. Base Stats
 * 2. Stat Break System (Stats >= 100 are completely IMMUNE to bonus stats and penalties)
 * 3. Temporary Bonus Stats and Penalties (caps normal stats strictly between 1 and 99)
 */
export function getEffectiveStat(
  baseStat: number,
  bonus: number = 0,
  isStatBroken: boolean = false,
  penalty: number = 0
): number {
  const safeBase = typeof baseStat === 'number' && !isNaN(baseStat) ? baseStat : 40;
  // Stat-Broken stats are completely immune to Bonus Stats and Penalties
  if (isStatBroken || safeBase >= 100) {
    return safeBase;
  }
  const delta = bonus - penalty;
  return Math.min(99, Math.max(1, safeBase + delta));
}

/**
 * Calculates detailed attribute modifier (positive bonuses, negative penalties, and net delta)
 * for any outfield or goalkeeper stat attribute.
 */
export function getAttributeModifier(
  player: PlayerCardData | Partial<PlayerCardData> | undefined,
  key: string,
  baseVal: number
): StatModifierInfo {
  const safeBase = typeof baseVal === 'number' && !isNaN(baseVal) ? baseVal : 40;
  const isStatBroken = safeBase >= 100 || !!(player as any)?.statBreakStats?.[key];

  if (!player || isStatBroken) {
    return {
      baseVal: safeBase,
      effectiveVal: safeBase,
      bonus: 0,
      penalty: 0,
      delta: 0,
      isStatBroken,
    };
  }

  // 1. Positive bonuses
  const activeBonuses = getActiveBonusStats(player);
  const bonus = Math.max(0, activeBonuses[key] || 0);

  // 2. Penalties
  let penalty = 0;

  // 2a. Chemistry penalty under 100%
  const chemInfo = getChemistryInfo(
    player.chemistry,
    player.chemistryCeiling,
    player.chemistryCeilingMonthsRemaining,
    player.chemistryCeilingReason,
    player.chemistryGainHalvedMonthsRemaining,
    player.chemistryCaps
  );
  if (chemInfo.penaltyPercent > 0) {
    penalty += Math.round(safeBase * (chemInfo.penaltyPercent / 100));
  }

  // 2b. Youth League Stamina Penalty (applies only while active at designated Bigger Youth Club under age 17)
  if (key === 'stamina' && player.youthLeagueStaminaPenalty && isBiggerYouthClubActive(player)) {
    penalty += Math.abs(player.youthLeagueStaminaPenalty);
  }

  // 2c. Relaxing Vacation Stamina Penalty
  if (key === 'stamina' && (player as any).relaxingVacationActive) {
    penalty += 10;
  }

  // 2d. Growth Spurt Penalty (-10 Dribbling, -10 Ball Control)
  if (
    (key === 'dribbling' || key === 'ballControl') &&
    (player.growthSpurtPenaltyMonthsRemaining ?? 0) > 0
  ) {
    penalty += 10;
  }

  // 2e. Negative deltas from active temporal cards
  if (Array.isArray(player.activeTemporalCards)) {
    player.activeTemporalCards.forEach((tc) => {
      if (tc.remainingMonths > 0 && tc.statDeltas && typeof tc.statDeltas[key] === 'number') {
        const d = tc.statDeltas[key];
        if (d < 0) {
          penalty += Math.abs(d);
        }
      }
    });
  }

  // 2f. Negative deltas in player.activeBonusStats
  if (player.activeBonusStats && typeof player.activeBonusStats[key] === 'number' && player.activeBonusStats[key] < 0) {
    penalty += Math.abs(player.activeBonusStats[key]);
  }

  // 2g. Weight Penalty: Each kg above ideal weight (heightCm - 100) applies -1 Pace and -1 Stamina
  if (key === 'pace' || key === 'stamina') {
    const h = player.heightCm && !isNaN(player.heightCm) ? player.heightCm : 180;
    const w = player.weightKg && !isNaN(player.weightKg) ? player.weightKg : 75;
    const idealW = Math.max(40, h - 100);
    const excess = Math.max(0, w - idealW);
    if (excess > 0) {
      penalty += excess;
    }
  }

  const delta = bonus - penalty;
  const effectiveVal = Math.min(99, Math.max(1, safeBase + delta));

  return {
    baseVal: safeBase,
    effectiveVal,
    bonus,
    penalty,
    delta,
    isStatBroken: false,
  };
}

/**
 * Aggregates all temporary active bonus stats for a player (Equipment, Season Boosts, Consumables, Hairstyles, Cosmetics, etc.)
 */
export function getActiveBonusStats(player: PlayerCardData | Partial<PlayerCardData> | undefined): Record<string, number> {
  const bonuses: Record<string, number> = {};
  if (!player) return bonuses;

  // 1. Explicit temporary bonus map
  if (player.activeBonusStats) {
    Object.entries(player.activeBonusStats).forEach(([k, v]) => {
      if (typeof v === 'number' && v > 0) {
        bonuses[k] = (bonuses[k] || 0) + v;
      }
    });
  }

  // 2. Active Pro Equipment
  if (Array.isArray(player.activeEquipment)) {
    player.activeEquipment.forEach((eq) => {
      const matches = eq.durability?.current ?? eq.matchDuration ?? 0;
      if (matches > 0 && eq.statBonuses) {
        Object.entries(eq.statBonuses).forEach(([k, v]) => {
          if (typeof v === 'number' && v > 0) {
            bonuses[k] = (bonuses[k] || 0) + v;
          }
        });
      }
    });
  }

  // 3. Active Season Boosts
  if (Array.isArray(player.activeSeasonBoosts)) {
    player.activeSeasonBoosts.forEach((sb) => {
      if (sb.statBonuses) {
        Object.entries(sb.statBonuses).forEach(([k, v]) => {
          if (typeof v === 'number' && v > 0) {
            bonuses[k] = (bonuses[k] || 0) + v;
          }
        });
      } else {
        if (sb.id === 'sbt_pro_nutrition') {
          bonuses.stamina = (bonuses.stamina || 0) + 5;
        } else if (sb.id === 'sbt_david_goggins') {
          bonuses.composure = (bonuses.composure || 0) + 10;
          bonuses.stamina = (bonuses.stamina || 0) + 10;
          bonuses.strength = (bonuses.strength || 0) + 10;
          bonuses.pace = (bonuses.pace || 0) + 5;
        }
      }
    });
  }

  // 4. Active Consumables
  if (Array.isArray(player.activeConsumables)) {
    player.activeConsumables.forEach((c) => {
      if (c.statBonuses) {
        Object.entries(c.statBonuses).forEach(([k, v]) => {
          if (typeof v === 'number' && v > 0) {
            bonuses[k] = (bonuses[k] || 0) + v;
          }
        });
      }
    });
  }

  // 5. Special Hairstyle stat bonuses
  const specialHairType =
    player.biometrics?.specialHair ||
    (player.accessories as any)?.specialHair ||
    (player.biometrics as any)?.specialHairType;
  if (specialHairType && SPECIAL_HAIR_STAT_BONUSES[specialHairType]) {
    Object.entries(SPECIAL_HAIR_STAT_BONUSES[specialHairType]).forEach(([k, v]) => {
      if (typeof v === 'number' && v > 0) {
        bonuses[k] = (bonuses[k] || 0) + v;
      }
    });
  }

  // 6. Cosmetic Stat Bonuses (Beards, Neck/Arm/Face Tattoos)
  const cosmeticBonuses = getCosmeticStatBonuses(player);
  Object.entries(cosmeticBonuses).forEach(([k, v]) => {
    if (typeof v === 'number' && v > 0) {
      bonuses[k] = (bonuses[k] || 0) + v;
    }
  });

  // 7. Overflow Chemistry Bonus Stats (+1 to each stat per 1% overflow chemistry above 100%)
  // If a stat is at 99 or stat break, the point moves to the next available stat in order.
  if (typeof player.chemistry === 'number' && player.chemistry > 100) {
    const overflowBonuses = calculateOverflowChemistryBonuses(player, bonuses);
    Object.entries(overflowBonuses).forEach(([k, v]) => {
      if (typeof v === 'number' && v > 0) {
        bonuses[k] = (bonuses[k] || 0) + v;
      }
    });
  }

  return bonuses;
}

/**
 * Calculates Overflow Chemistry bonus stats:
 * - Every 1% above 100% (up to 100% overflow = 200% total chemistry) gives +1 to all stats.
 * - If a stat is at 99 or stat break, that +1 cascades to the next available stat in order.
 * - If all available stats reach 99 or stat break, point addition stops.
 */
export function calculateOverflowChemistryBonuses(
  player: PlayerCardData | Partial<PlayerCardData> | undefined,
  existingBonuses: Record<string, number> = {}
): Record<string, number> {
  const result: Record<string, number> = {};
  if (!player || typeof player.chemistry !== 'number' || player.chemistry <= 100) {
    return result;
  }

  const overflowPercent = Math.min(100, Math.floor(player.chemistry - 100));
  if (overflowPercent <= 0) return result;

  const posCode = ((player.subPosition || player.position || '') as string).toUpperCase();
  const isGk = posCode === 'GK' || ((player.position || '').toUpperCase() === 'GK');

  const statKeys: string[] = isGk ? (ALL_GK_KEYS as string[]) : (ALL_ATTRIBUTE_KEYS as string[]);
  const baseStats: Record<string, number> = isGk
    ? (getOrCreateGkDetailed((player as any).stats) as any)
    : (getOrCreateOutfieldDetailed((player as any).stats) as any);

  const statBreakStats: Record<string, number> = (player as any).statBreakStats || {};

  const canReceivePoint = (key: string): boolean => {
    // Stats that have a stat break (e.g. 100+) or base >= 100 cannot receive bonus stats
    if (statBreakStats[key] || (baseStats[key] || 0) >= 100) {
      return false;
    }
    const currentVal = (baseStats[key] || 0) + (existingBonuses[key] || 0) + (result[key] || 0);
    return currentVal < 99;
  };

  // For each 1% of overflow chemistry:
  for (let step = 0; step < overflowPercent; step++) {
    let anyPointGivenInStep = false;

    for (let i = 0; i < statKeys.length; i++) {
      const primaryKey = statKeys[i];

      if (canReceivePoint(primaryKey)) {
        result[primaryKey] = (result[primaryKey] || 0) + 1;
        anyPointGivenInStep = true;
      } else {
        // If primary stat is at 99 or stat break, move +1 to another stat in order of available stats
        let moved = false;
        for (let offset = 1; offset < statKeys.length; offset++) {
          const nextIndex = (i + offset) % statKeys.length;
          const candidateKey = statKeys[nextIndex];
          if (canReceivePoint(candidateKey)) {
            result[candidateKey] = (result[candidateKey] || 0) + 1;
            moved = true;
            anyPointGivenInStep = true;
            break;
          }
        }
        // If no available stats can receive more, stop adding
        if (!moved) {
          // All stats are at 99 or stat break
          return result;
        }
      }
    }

    if (!anyPointGivenInStep) {
      // Cannot receive more
      break;
    }
  }

  return result;
}

/**
 * Gets effective detailed outfield stats, applying temporary bonuses (min(Base + Bonus, 99))
 * and temporary growth spurt penalties if active. Stat-broken attributes are immune.
 */
export function getEffectiveOutfieldDetailed(player: PlayerCardData | Partial<PlayerCardData>): OutfieldDetailedStats {
  const base = getOrCreateOutfieldDetailed((player as any).stats);
  const effective: OutfieldDetailedStats = { ...base };

  for (const key of ALL_ATTRIBUTE_KEYS) {
    const baseVal = base[key] || 40;
    effective[key] = getAttributeModifier(player, key, baseVal).effectiveVal;
  }

  return effective;
}

export function getEffectiveGkDetailed(player: PlayerCardData | Partial<PlayerCardData>): GkDetailedStats {
  const base = getOrCreateGkDetailed((player as any).stats);
  const effective: GkDetailedStats = { ...base };

  for (const key of ALL_GK_KEYS) {
    const baseVal = base[key] || 40;
    effective[key] = getAttributeModifier(player, key, baseVal).effectiveVal;
  }

  return effective;
}

/**
 * Computes base and effective category ratings, together with category bonus deltas (+X or -X).
 */
export function getEffectiveCategoryStats(player: PlayerCardData | Partial<PlayerCardData>): {
  effectiveStats: PlayerStats;
  baseStats: PlayerStats;
  categoryBonuses: { PRO: number; SCO: number; CRE: number; DEF: number; PHY: number; MEN: number };
} {
  const isGk = ((player.subPosition || player.position || '') as string).toUpperCase() === 'GK';
  if (isGk) {
    const baseGk = getOrCreateGkDetailed((player as any).stats);
    const effGk = getEffectiveGkDetailed(player);
    const baseSync = syncCategoryStatsFromGkDetailed((player as any).stats, baseGk);
    const effSync = syncCategoryStatsFromGkDetailed((player as any).stats, effGk);
    return {
      effectiveStats: effSync,
      baseStats: baseSync,
      categoryBonuses: {
        PRO: (effSync.pro || 0) - (baseSync.pro || 0),
        SCO: (effSync.goa || 0) - (baseSync.goa || 0),
        CRE: (effSync.cre || 0) - (baseSync.cre || 0),
        DEF: (effSync.def || 0) - (baseSync.def || 0),
        PHY: (effSync.phy || 0) - (baseSync.phy || 0),
        MEN: (effSync.men || 0) - (baseSync.men || 0),
      },
    };
  }

  const baseDetailed = getOrCreateOutfieldDetailed((player as any).stats);
  const effDetailed = getEffectiveOutfieldDetailed(player);
  const baseSync = syncCategoryStatsFromDetailed((player as any).stats, baseDetailed);
  const effSync = syncCategoryStatsFromDetailed((player as any).stats, effDetailed);

  const breakInfo = getStatBreakBonus(baseDetailed);
  const catBonuses = {
    PRO: breakInfo.categoryOverrides.pro !== undefined ? 0 : (effSync.pro || 0) - (baseSync.pro || 0),
    SCO: breakInfo.categoryOverrides.goa !== undefined ? 0 : (effSync.goa || 0) - (baseSync.goa || 0),
    CRE: breakInfo.categoryOverrides.cre !== undefined ? 0 : (effSync.cre || 0) - (baseSync.cre || 0),
    DEF: breakInfo.categoryOverrides.def !== undefined ? 0 : (effSync.def || 0) - (baseSync.def || 0),
    PHY: breakInfo.categoryOverrides.phy !== undefined ? 0 : (effSync.phy || 0) - (baseSync.phy || 0),
    MEN: breakInfo.categoryOverrides.men !== undefined ? 0 : (effSync.men || 0) - (baseSync.men || 0),
  };

  return {
    effectiveStats: effSync,
    baseStats: baseSync,
    categoryBonuses: catBonuses,
  };
}

/**
 * Computes base OVR, effective OVR (with bonuses and penalties applied), and OVR bonus delta.
 */
export function getEffectivePlayerOvr(player: PlayerCardData | Partial<PlayerCardData>): {
  effectiveOvr: number;
  baseOvr: number;
  bonusOvr: number;
  ovrDelta: number;
  isBoosted: boolean;
  isPenalized: boolean;
} {
  const isGk = ((player.subPosition || player.position || '') as string).toUpperCase() === 'GK';
  const pos = player.position || 'ST';
  const subPos = player.subPosition || pos;
  const style = player.playStyle;

  let baseOvr = 50;
  let effectiveOvr = 50;

  if (isGk) {
    const baseGk = getOrCreateGkDetailed((player as any).stats);
    const effGk = getEffectiveGkDetailed(player);
    const weights = getGkWeights(style);
    let baseSum = 0;
    let effSum = 0;
    for (const key of ALL_GK_KEYS) {
      baseSum += (baseGk[key] || 40) * weights[key];
      effSum += (effGk[key] || 40) * weights[key];
    }
    baseOvr = Math.min(99, Math.max(40, Math.round(baseSum)));
    effectiveOvr = Math.min(99, Math.max(40, Math.round(effSum)));
  } else {
    const baseOutfield = getOrCreateOutfieldDetailed((player as any).stats);
    const effOutfield = getEffectiveOutfieldDetailed(player);
    baseOvr = calculatePlayerOvr(subPos, style, baseOutfield);
    effectiveOvr = calculatePlayerOvr(subPos, style, effOutfield);
  }

  const ovrDelta = effectiveOvr - baseOvr;
  return {
    effectiveOvr,
    baseOvr,
    bonusOvr: ovrDelta,
    ovrDelta,
    isBoosted: effectiveOvr > baseOvr,
    isPenalized: effectiveOvr < baseOvr,
  };
}

export function getOrCreateGkDetailed(stats?: PlayerStats): GkDetailedStats {
  const safeStats = stats || { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 };
  const goa = typeof safeStats.goa === 'number' && !isNaN(safeStats.goa) ? safeStats.goa : 75;
  const phy = typeof safeStats.phy === 'number' && !isNaN(safeStats.phy) ? safeStats.phy : 70;
  const cre = typeof safeStats.cre === 'number' && !isNaN(safeStats.cre) ? safeStats.cre : 65;

  const base: GkDetailedStats = {
    saving: goa,
    reflexes: goa,
    handling: goa,
    positioning: goa,
    aerialReach: phy,
    oneOnOne: goa,
    distribution: cre,
  };

  if (safeStats.gkDetailed) {
    const d = safeStats.gkDetailed;
    return {
      saving: typeof d.saving === 'number' && !isNaN(d.saving) ? d.saving : base.saving,
      reflexes: typeof d.reflexes === 'number' && !isNaN(d.reflexes) ? d.reflexes : base.reflexes,
      handling: typeof d.handling === 'number' && !isNaN(d.handling) ? d.handling : base.handling,
      positioning: typeof d.positioning === 'number' && !isNaN(d.positioning) ? d.positioning : base.positioning,
      aerialReach: typeof d.aerialReach === 'number' && !isNaN(d.aerialReach) ? d.aerialReach : base.aerialReach,
      oneOnOne: typeof d.oneOnOne === 'number' && !isNaN(d.oneOnOne) ? d.oneOnOne : base.oneOnOne,
      distribution: typeof d.distribution === 'number' && !isNaN(d.distribution) ? d.distribution : base.distribution,
    };
  }
  return base;
}

export const CARD_STAT_BREAK_GROUPS = {
  PRO: ['ballControl', 'retention', 'dribbling'] as (keyof OutfieldDetailedStats)[],
  CRE: ['shortPass', 'longPass', 'crossing'] as (keyof OutfieldDetailedStats)[],
  SCO: ['shooting', 'longShots', 'heading'] as (keyof OutfieldDetailedStats)[],
  DEF: ['tackling', 'marking', 'interceptions'] as (keyof OutfieldDetailedStats)[],
};

export const PERK_STAT_BREAK_GROUPS = {
  PHY: ['strength', 'stamina', 'pace'] as (keyof OutfieldDetailedStats)[],
  MEN: ['positioning', 'composure', 'reactions'] as (keyof OutfieldDetailedStats)[],
};

export const STAT_BREAK_GROUPS = {
  ...CARD_STAT_BREAK_GROUPS,
  ...PERK_STAT_BREAK_GROUPS,
};

export const CARD_STAT_BREAK_ELIGIBLE_STATS: (keyof OutfieldDetailedStats)[] = [
  'ballControl',
  'retention',
  'dribbling',
  'shortPass',
  'longPass',
  'crossing',
  'shooting',
  'longShots',
  'heading',
  'tackling',
  'marking',
  'interceptions',
];

export const PERK_STAT_BREAK_ELIGIBLE_STATS: (keyof OutfieldDetailedStats)[] = [
  'strength',
  'stamina',
  'pace',
  'positioning',
  'composure',
  'reactions',
];

export const ALL_STAT_BREAK_ELIGIBLE_STATS: (keyof OutfieldDetailedStats)[] = [
  ...CARD_STAT_BREAK_ELIGIBLE_STATS,
  ...PERK_STAT_BREAK_ELIGIBLE_STATS,
];

export interface StatBreakBonusResult {
  flatOvrBonus: number;
  brokenStatsCount: number;
  masteredGroups: ('PRO' | 'SCO' | 'CRE' | 'DEF' | 'PHY' | 'MEN')[];
  groupBrokenCounts: Record<'PRO' | 'SCO' | 'CRE' | 'DEF' | 'PHY' | 'MEN', number>;
  categoryOverrides: { pro?: number; cre?: number; goa?: number; def?: number; phy?: number; men?: number };
}

export function getStatBreakBonus(detailed: OutfieldDetailedStats | undefined): StatBreakBonusResult {
  const groupBrokenCounts: Record<'PRO' | 'SCO' | 'CRE' | 'DEF' | 'PHY' | 'MEN', number> = {
    PRO: 0,
    SCO: 0,
    CRE: 0,
    DEF: 0,
    PHY: 0,
    MEN: 0,
  };

  if (!detailed) {
    return {
      flatOvrBonus: 0,
      brokenStatsCount: 0,
      masteredGroups: [],
      groupBrokenCounts,
      categoryOverrides: {},
    };
  }

  STAT_BREAK_GROUPS.PRO.forEach((k) => {
    if ((detailed[k] || 0) >= 100) groupBrokenCounts.PRO++;
  });
  STAT_BREAK_GROUPS.SCO.forEach((k) => {
    if ((detailed[k] || 0) >= 100) groupBrokenCounts.SCO++;
  });
  STAT_BREAK_GROUPS.CRE.forEach((k) => {
    if ((detailed[k] || 0) >= 100) groupBrokenCounts.CRE++;
  });
  STAT_BREAK_GROUPS.DEF.forEach((k) => {
    if ((detailed[k] || 0) >= 100) groupBrokenCounts.DEF++;
  });
  STAT_BREAK_GROUPS.PHY.forEach((k) => {
    if ((detailed[k] || 0) >= 100) groupBrokenCounts.PHY++;
  });
  STAT_BREAK_GROUPS.MEN.forEach((k) => {
    if ((detailed[k] || 0) >= 100) groupBrokenCounts.MEN++;
  });

  const totalBroken =
    groupBrokenCounts.PRO +
    groupBrokenCounts.SCO +
    groupBrokenCounts.CRE +
    groupBrokenCounts.DEF +
    groupBrokenCounts.PHY +
    groupBrokenCounts.MEN;
  const masteredGroups: ('PRO' | 'SCO' | 'CRE' | 'DEF' | 'PHY' | 'MEN')[] = [];
  let flatOvrBonus = 0;

  // Stat Break OVR calculation:
  // 1 Stat Break in a group: +1 OVR
  // 2 Stat Breaks in the SAME group: +3 OVR total
  // 3 Stat Breaks in the SAME group: +5 OVR total
  // Different groups: each group calculates its own bonus independently.
  const groupKeys: ('PRO' | 'SCO' | 'CRE' | 'DEF' | 'PHY' | 'MEN')[] = ['PRO', 'SCO', 'CRE', 'DEF', 'PHY', 'MEN'];
  groupKeys.forEach((g) => {
    const count = groupBrokenCounts[g];
    if (count === 3) {
      masteredGroups.push(g);
      flatOvrBonus += 5;
    } else if (count === 2) {
      flatOvrBonus += 3;
    } else if (count === 1) {
      flatOvrBonus += 1;
    }
  });

  const categoryOverrides: { pro?: number; cre?: number; goa?: number; def?: number; phy?: number; men?: number } = {};
  if (groupBrokenCounts.PRO === 3) categoryOverrides.pro = 117;
  else if (groupBrokenCounts.PRO === 2) categoryOverrides.pro = 101;

  if (groupBrokenCounts.SCO === 3) categoryOverrides.goa = 117;
  else if (groupBrokenCounts.SCO === 2) categoryOverrides.goa = 101;

  if (groupBrokenCounts.CRE === 3) categoryOverrides.cre = 117;
  else if (groupBrokenCounts.CRE === 2) categoryOverrides.cre = 101;

  if (groupBrokenCounts.DEF === 3) categoryOverrides.def = 117;
  else if (groupBrokenCounts.DEF === 2) categoryOverrides.def = 101;

  if (groupBrokenCounts.PHY === 3) categoryOverrides.phy = 117;
  else if (groupBrokenCounts.PHY === 2) categoryOverrides.phy = 101;

  if (groupBrokenCounts.MEN === 3) categoryOverrides.men = 117;
  else if (groupBrokenCounts.MEN === 2) categoryOverrides.men = 101;

  return {
    flatOvrBonus,
    brokenStatsCount: totalBroken,
    masteredGroups,
    groupBrokenCounts,
    categoryOverrides,
  };
}

/**
 * Calculates a 3-stat group value by sorting the 3 attributes in descending numerical order
 * and applying the specific weighting:
 * - Highest stat: 55% of group value (0.55)
 * - Second-highest stat: 35% of group value (0.35)
 * - Lowest stat: 10% of group value (0.10)
 *
 * This ensures that a player who excels at two attributes still excels at the entire group,
 * even if the third attribute is a weakness.
 */
export function calculateThreeStatGroupValue(a: number, b: number, c: number): number {
  const sorted = [Number(a) || 0, Number(b) || 0, Number(c) || 0].sort((x, y) => y - x);
  return Math.round(sorted[0] * 0.55 + sorted[1] * 0.35 + sorted[2] * 0.10);
}

export function syncCategoryStatsFromDetailed(
  stats: PlayerStats | undefined,
  detailed: OutfieldDetailedStats
): PlayerStats {
  const baseStats = stats || { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 };
  const safe = getOrCreateOutfieldDetailed({ ...baseStats, detailed });
  let phyAvg = calculateThreeStatGroupValue(safe.pace, safe.stamina, safe.strength);
  let proAvg = calculateThreeStatGroupValue(safe.ballControl, safe.retention, safe.dribbling);
  let creAvg = calculateThreeStatGroupValue(safe.shortPass, safe.longPass, safe.crossing);
  let scoAvg = calculateThreeStatGroupValue(safe.shooting, safe.heading, safe.longShots);
  let defAvg = calculateThreeStatGroupValue(safe.tackling, safe.marking, safe.interceptions);
  let menAvg = calculateThreeStatGroupValue(safe.positioning, safe.composure, safe.reactions);

  const breakInfo = getStatBreakBonus(safe);
  if (breakInfo.categoryOverrides.pro !== undefined) proAvg = breakInfo.categoryOverrides.pro;
  if (breakInfo.categoryOverrides.cre !== undefined) creAvg = breakInfo.categoryOverrides.cre;
  if (breakInfo.categoryOverrides.goa !== undefined) scoAvg = breakInfo.categoryOverrides.goa;
  if (breakInfo.categoryOverrides.def !== undefined) defAvg = breakInfo.categoryOverrides.def;
  if (breakInfo.categoryOverrides.phy !== undefined) phyAvg = breakInfo.categoryOverrides.phy;
  if (breakInfo.categoryOverrides.men !== undefined) menAvg = breakInfo.categoryOverrides.men;

  return {
    ...baseStats,
    phy: isNaN(phyAvg) ? 40 : phyAvg,
    pro: isNaN(proAvg) ? 40 : proAvg,
    cre: isNaN(creAvg) ? 40 : creAvg,
    goa: isNaN(scoAvg) ? 40 : scoAvg,
    def: isNaN(defAvg) ? 40 : defAvg,
    men: isNaN(menAvg) ? 40 : menAvg,
    detailed: safe,
  };
}

export function syncCategoryStatsFromGkDetailed(
  stats: PlayerStats | undefined,
  gkDetailed: GkDetailedStats
): PlayerStats {
  const baseStats = stats || { pro: 40, def: 40, cre: 40, men: 40, goa: 40, phy: 40 };
  const safe = getOrCreateGkDetailed({ ...baseStats, gkDetailed });
  const avgGk = Math.round(
    (safe.saving +
      safe.reflexes +
      safe.handling +
      safe.positioning +
      safe.oneOnOne) /
      5
  );

  return {
    ...baseStats,
    goa: isNaN(avgGk) ? 40 : avgGk,
    pro: safe.distribution,
    cre: safe.distribution,
    phy: safe.aerialReach,
    def: safe.positioning,
    men: safe.reflexes,
    gkDetailed: safe,
  };
}

/**
 * Calculates weighted OVR rating from the detailed stats ecosystem based on position
 */
export function calculateWeightedOvr(
  position: string,
  subPosition: string,
  stats: PlayerStats,
  playStyle?: string
): number {
  const posCode = (subPosition || position || '').toUpperCase();
  const isGk = posCode === 'GK' || (position && position.toUpperCase() === 'GK');
  const style = playStyle || (stats as any)?.playStyle || (stats as any)?.playstyle || '';

  if (!posCode || posCode === 'NONE' || posCode === 'UNASSIGNED') {
    const d = getOrCreateOutfieldDetailed(stats);
    return calculatePlayerOvr('CM', style, d);
  }

  if (isGk) {
    const gk = getOrCreateGkDetailed(stats);
    const weights = getGkWeights(style);
    let sum = 0;
    for (const key of ALL_GK_KEYS) {
      sum += (gk[key] || 40) * weights[key];
    }
    return Math.min(99, Math.max(40, Math.round(sum)));
  }

  const d = getOrCreateOutfieldDetailed(stats);
  return calculatePlayerOvr(posCode, style, d);
}

export type AttributeKey = keyof OutfieldDetailedStats;

export const ALL_ATTRIBUTE_KEYS: AttributeKey[] = [
  'pace',
  'stamina',
  'strength',
  'ballControl',
  'retention',
  'dribbling',
  'shortPass',
  'longPass',
  'crossing',
  'shooting',
  'heading',
  'longShots',
  'tackling',
  'marking',
  'interceptions',
  'positioning',
  'composure',
  'reactions',
];

export const ALL_GK_KEYS: (keyof GkDetailedStats)[] = [
  'saving',
  'reflexes',
  'handling',
  'positioning',
  'aerialReach',
  'oneOnOne',
  'distribution',
];

export function getGkWeights(playStyle?: string): Record<keyof GkDetailedStats, number> {
  const style = (playStyle || '').toLowerCase();
  let raw: Record<keyof GkDetailedStats, number>;
  if (style === 'basic') {
    // Pure GK position weights ignoring playstyle
    raw = { saving: 0.22, reflexes: 0.22, handling: 0.18, positioning: 0.18, oneOnOne: 0.10, aerialReach: 0.05, distribution: 0.05 };
  } else if (style.includes('sweeper')) {
    raw = { saving: 0.20, reflexes: 0.20, handling: 0.15, positioning: 0.15, distribution: 0.15, oneOnOne: 0.10, aerialReach: 0.05 };
  } else if (style.includes('shot stopper') || style.includes('stopper')) {
    raw = { saving: 0.28, reflexes: 0.28, positioning: 0.18, handling: 0.12, oneOnOne: 0.08, aerialReach: 0.03, distribution: 0.03 };
  } else if (style.includes('commanding') || style.includes('wall')) {
    raw = { handling: 0.22, aerialReach: 0.22, positioning: 0.20, saving: 0.18, reflexes: 0.10, oneOnOne: 0.05, distribution: 0.03 };
  } else {
    raw = { saving: 0.22, reflexes: 0.22, handling: 0.18, positioning: 0.18, oneOnOne: 0.10, aerialReach: 0.05, distribution: 0.05 };
  }
  return raw;
}

export function normalizeWeights(raw: Partial<Record<AttributeKey, number>>): Record<AttributeKey, number> {
  const result: Record<AttributeKey, number> = {} as any;
  let sum = 0;
  for (const key of ALL_ATTRIBUTE_KEYS) {
    const val = Math.max(0.01, raw[key] || 0.01);
    result[key] = val;
    sum += val;
  }
  for (const key of ALL_ATTRIBUTE_KEYS) {
    result[key] = result[key] / sum;
  }
  return result;
}

export function getOvrWeights(subPosition?: string, playStyle?: string): Record<AttributeKey, number> {
  const pos = (subPosition || 'ST').toUpperCase();
  const style = (playStyle || '').trim();
  const isBasic = style.toLowerCase() === 'basic';

  let raw: Partial<Record<AttributeKey, number>> = {};

  if (['ST', 'CF'].includes(pos)) {
    if (!isBasic && style.toLowerCase() === 'poacher') {
      raw = { shooting: 0.24, positioning: 0.20, reactions: 0.12, composure: 0.08, pace: 0.08, heading: 0.06, ballControl: 0.06, longShots: 0.04, dribbling: 0.04, strength: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'target') {
      raw = { strength: 0.20, heading: 0.18, shooting: 0.16, retention: 0.12, ballControl: 0.10, positioning: 0.08, composure: 0.04, shortPass: 0.04, reactions: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'finisher') {
      raw = { shooting: 0.26, composure: 0.14, positioning: 0.14, longShots: 0.10, reactions: 0.10, ballControl: 0.08, dribbling: 0.06, pace: 0.04, heading: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'complete') {
      raw = { shooting: 0.18, dribbling: 0.12, pace: 0.12, ballControl: 0.10, positioning: 0.10, shortPass: 0.08, strength: 0.08, longShots: 0.06, heading: 0.04, composure: 0.04, reactions: 0.04 };
    } else if (!isBasic && style.toLowerCase() === 'decoy') {
      raw = { positioning: 0.18, reactions: 0.14, stamina: 0.12, shortPass: 0.10, pace: 0.10, composure: 0.08, shooting: 0.08, dribbling: 0.06, ballControl: 0.06 };
    } else {
      // Basic / pure position weights
      raw = { shooting: 0.22, positioning: 0.12, pace: 0.12, heading: 0.10, ballControl: 0.08, dribbling: 0.08, longShots: 0.06, strength: 0.05, composure: 0.04, reactions: 0.04, shortPass: 0.02, retention: 0.02, stamina: 0.02 };
    }
  } else if (['LW', 'RW', 'WINGER', 'LM', 'RM'].includes(pos)) {
    if (!isBasic && style.toLowerCase() === 'traditional') {
      raw = { crossing: 0.22, pace: 0.20, dribbling: 0.16, stamina: 0.10, ballControl: 0.08, shortPass: 0.08, positioning: 0.04, longPass: 0.04, reactions: 0.02, composure: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'inverted') {
      raw = { dribbling: 0.22, shooting: 0.16, longShots: 0.12, ballControl: 0.12, shortPass: 0.10, pace: 0.10, positioning: 0.06, composure: 0.04, reactions: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'prolific') {
      raw = { positioning: 0.20, shooting: 0.18, pace: 0.16, composure: 0.10, dribbling: 0.10, ballControl: 0.08, reactions: 0.06, longShots: 0.04, heading: 0.02, shortPass: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'pressing') {
      raw = { stamina: 0.20, pace: 0.18, tackling: 0.10, reactions: 0.10, interceptions: 0.08, shortPass: 0.08, dribbling: 0.08, ballControl: 0.06, marking: 0.04 };
    } else {
      // Basic / pure position weights
      raw = { pace: 0.20, dribbling: 0.16, crossing: 0.14, ballControl: 0.10, shooting: 0.08, shortPass: 0.08, stamina: 0.06, longShots: 0.04, positioning: 0.04, retention: 0.02, composure: 0.02, reactions: 0.02 };
    }
  } else if (pos === 'CAM' || pos === 'SS') {
    if (!isBasic && style.toLowerCase() === 'creator') {
      raw = pos === 'SS'
        ? { shortPass: 0.20, ballControl: 0.16, positioning: 0.14, dribbling: 0.12, shooting: 0.12, longPass: 0.10, composure: 0.08, pace: 0.04, reactions: 0.04 }
        : { shortPass: 0.22, longPass: 0.16, ballControl: 0.16, positioning: 0.12, dribbling: 0.10, longShots: 0.06, composure: 0.06, crossing: 0.04, shooting: 0.02, reactions: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'shadow') {
      raw = { shooting: 0.20, positioning: 0.18, pace: 0.12, longShots: 0.12, reactions: 0.10, ballControl: 0.10, shortPass: 0.10, dribbling: 0.06, composure: 0.02 };
    } else if (!isBasic && (style.toLowerCase() === 'classic n10' || style.toLowerCase().includes('n10'))) {
      raw = { dribbling: 0.20, ballControl: 0.20, shortPass: 0.18, composure: 0.12, longPass: 0.08, retention: 0.08, longShots: 0.08, positioning: 0.06 };
    } else if (!isBasic && style.toLowerCase() === 'engine') {
      raw = { stamina: 0.18, shortPass: 0.14, pace: 0.12, reactions: 0.10, tackling: 0.08, ballControl: 0.08, dribbling: 0.08, positioning: 0.08, shooting: 0.08, longPass: 0.06 };
    } else {
      // Basic / pure position weights
      raw = pos === 'SS'
        ? { shooting: 0.18, positioning: 0.16, shortPass: 0.14, ballControl: 0.14, dribbling: 0.12, pace: 0.10, composure: 0.08, reactions: 0.04, longShots: 0.04 }
        : { shortPass: 0.18, ballControl: 0.16, dribbling: 0.12, positioning: 0.10, longPass: 0.08, longShots: 0.08, shooting: 0.06, crossing: 0.06, composure: 0.04, reactions: 0.04, pace: 0.02 };
    }
  } else if (pos === 'CM') {
    if (!isBasic && style.toLowerCase() === 'box-to-box') {
      raw = { stamina: 0.18, shortPass: 0.14, tackling: 0.10, reactions: 0.10, shooting: 0.08, pace: 0.08, ballControl: 0.08, interceptions: 0.06, strength: 0.06, longPass: 0.04, positioning: 0.04 };
    } else if (!isBasic && style.toLowerCase() === 'maestro') {
      raw = { shortPass: 0.22, longPass: 0.18, ballControl: 0.18, composure: 0.12, retention: 0.10, reactions: 0.08, positioning: 0.04, dribbling: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'runner') {
      raw = { pace: 0.18, stamina: 0.16, dribbling: 0.12, positioning: 0.10, strength: 0.10, shortPass: 0.08, ballControl: 0.08, reactions: 0.08, tackling: 0.04 };
    } else {
      // Basic / pure position weights
      raw = { shortPass: 0.16, ballControl: 0.14, longPass: 0.12, stamina: 0.12, retention: 0.08, composure: 0.08, reactions: 0.08, positioning: 0.06, tackling: 0.04, pace: 0.04, strength: 0.02, dribbling: 0.02, interceptions: 0.02 };
    }
  } else if (pos === 'CDM') {
    if (!isBasic && style.toLowerCase() === 'enforcer') {
      raw = { strength: 0.20, tackling: 0.20, interceptions: 0.16, marking: 0.14, stamina: 0.10, reactions: 0.08, heading: 0.04, shortPass: 0.02, composure: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'anchor') {
      raw = { interceptions: 0.22, marking: 0.18, tackling: 0.18, positioning: 0.10, composure: 0.08, shortPass: 0.08, reactions: 0.06, longPass: 0.04, stamina: 0.02 };
    } else {
      // Basic / pure position weights
      raw = { tackling: 0.18, interceptions: 0.16, marking: 0.14, strength: 0.10, shortPass: 0.10, stamina: 0.10, reactions: 0.08, longPass: 0.04, composure: 0.02, positioning: 0.02 };
    }
  } else if (['LB', 'RB', 'LWB', 'RWB', 'FB'].includes(pos)) {
    if (!isBasic && style.toLowerCase() === 'defensive') {
      raw = { marking: 0.20, tackling: 0.20, interceptions: 0.18, strength: 0.12, stamina: 0.10, pace: 0.08, reactions: 0.04, heading: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'inverted') {
      raw = { shortPass: 0.18, ballControl: 0.14, interceptions: 0.14, composure: 0.10, tackling: 0.12, marking: 0.10, longPass: 0.08, stamina: 0.06, pace: 0.04 };
    } else if (!isBasic && style.toLowerCase() === 'attacker') {
      raw = { pace: 0.22, crossing: 0.20, dribbling: 0.14, stamina: 0.12, shortPass: 0.08, ballControl: 0.08, tackling: 0.06, interceptions: 0.04 };
    } else if (!isBasic && style.toLowerCase() === 'balanced') {
      raw = { pace: 0.14, tackling: 0.14, stamina: 0.12, crossing: 0.12, marking: 0.12, interceptions: 0.12, shortPass: 0.08, ballControl: 0.06, dribbling: 0.04, strength: 0.02 };
    } else {
      // Basic / pure position weights
      raw = { pace: 0.18, tackling: 0.16, stamina: 0.14, marking: 0.12, interceptions: 0.12, crossing: 0.08, shortPass: 0.06, strength: 0.04, dribbling: 0.02, ballControl: 0.02 };
    }
  } else if (pos === 'CB') {
    if (!isBasic && style.toLowerCase() === 'destroyer') {
      raw = { strength: 0.24, tackling: 0.22, heading: 0.16, marking: 0.14, interceptions: 0.10, stamina: 0.06, reactions: 0.04 };
    } else if (!isBasic && style.toLowerCase() === 'distributor') {
      raw = { shortPass: 0.16, longPass: 0.14, tackling: 0.16, interceptions: 0.16, composure: 0.12, marking: 0.12, strength: 0.06, reactions: 0.04 };
    } else if (!isBasic && style.toLowerCase() === 'playmaker') {
      raw = { longPass: 0.20, shortPass: 0.16, interceptions: 0.16, ballControl: 0.10, marking: 0.12, tackling: 0.12, composure: 0.08, strength: 0.02 };
    } else if (!isBasic && style.toLowerCase() === 'stopper') {
      raw = { interceptions: 0.22, marking: 0.20, tackling: 0.18, positioning: 0.10, reactions: 0.10, strength: 0.10, heading: 0.04 };
    } else {
      // Basic / pure position weights
      raw = { tackling: 0.20, marking: 0.20, interceptions: 0.18, strength: 0.14, heading: 0.10, reactions: 0.06, composure: 0.04, stamina: 0.02 };
    }
  } else {
    raw = { shortPass: 0.10, ballControl: 0.10, pace: 0.10, stamina: 0.10, tackling: 0.10, shooting: 0.10, positioning: 0.10, reactions: 0.10, composure: 0.10, dribbling: 0.10 };
  }

  return normalizeWeights(raw);
}

export function calculatePlayerOvrDecimal(
  subPosition: string | undefined,
  playStyle: string | undefined,
  attributes: OutfieldDetailedStats
): number {
  const weights = getOvrWeights(subPosition, playStyle);
  let sum = 0;
  for (const key of ALL_ATTRIBUTE_KEYS) {
    const val = Math.min(99, Math.max(40, attributes[key] ?? 40));
    sum += val * weights[key];
  }
  return sum;
}

export function calculatePlayerOvr(
  subPosition: string | undefined,
  playStyle: string | undefined,
  attributes: OutfieldDetailedStats
): number {
  const decimalSum = calculatePlayerOvrDecimal(subPosition, playStyle, attributes);
  const baseOvr = Math.min(99, Math.max(40, Math.round(decimalSum)));
  const breakInfo = getStatBreakBonus(attributes);
  return baseOvr + breakInfo.flatOvrBonus;
}

export interface AutoAssignResult {
  updatedDetailed: OutfieldDetailedStats;
  pointsSpent: number;
  initialOvr: number;
  finalOvr: number;
  updatedProgress?: Record<string, number>;
  statBreakStats?: Record<string, number>;
}

export function autoAssignStatPoints(
  subPosition: string | undefined,
  playStyle: string | undefined,
  currentDetailed: OutfieldDetailedStats,
  pointsAvailable: number,
  statBreakStats?: Record<string, number>,
  currentProgress?: Record<string, number>,
  playerTypeId?: string
): AutoAssignResult {
  let working = { ...currentDetailed };
  let workingProgress = { ...(currentProgress || {}) };
  let workingBreakStats = { ...(statBreakStats || {}) };
  const initialOvr = calculatePlayerOvr(subPosition, playStyle, working);
  let pointsSpent = 0;

  if (pointsAvailable <= 0) {
    return {
      updatedDetailed: working,
      pointsSpent: 0,
      initialOvr,
      finalOvr: initialOvr,
      updatedProgress: workingProgress,
      statBreakStats: workingBreakStats,
    };
  }

  const weights = getOvrWeights(subPosition, playStyle);
  const allocated: Record<AttributeKey, number> = {} as any;
  for (const key of ALL_ATTRIBUTE_KEYS) {
    allocated[key] = 0;
  }

  // Stat cap determination:
  // Normal maximum = 99; Stat Break = 100.
  const getCap = (key: AttributeKey): number => {
    const isBroken = (working[key] || 40) >= 100 || !!statBreakStats?.[key];
    return isBroken ? 100 : 99;
  };

  for (let pt = 0; pt < pointsAvailable; pt++) {
    // Determine candidate eligibility according to distribution limits:
    // 1. Stat is below its applicable maximum (99 or 100 for Stat Break).
    // 2. Maximum 15 points per stat per allocation action (allocated[k] < 15).
    // 3. 50% limit: No individual stat may receive 50% or more of total available points.
    //
    // Tiered Pass Logic (handling exceptions and seamless continuation to next-best stats):
    // - Pass 1 (Strict Rules): Stat < Cap, Alloc < 15, (Alloc + 1) < 50% of pointsAvailable (for pointsAvailable > 2; for 2, Alloc < 1; for 1, Alloc < 1)
    // - Pass 2 (50% Exception): If all other stats reached 50% limit or caps, relax 50% restriction up to 15-point limit
    // - Pass 3 (15-Max Exception): If no other eligible stats exist and remaining points must be allocated, relax 15-point limit up to stat cap

    // Pass 1: Strict < 50% and max 15 per stat
    let candidates = ALL_ATTRIBUTE_KEYS.filter((k) => {
      const currentVal = working[k] || 40;
      if (currentVal >= getCap(k)) return false;
      const currentAlloc = allocated[k] || 0;
      if (currentAlloc >= 15) return false;

      if (pointsAvailable > 2) {
        if ((currentAlloc + 1) >= pointsAvailable * 0.5) return false;
      } else if (pointsAvailable === 2) {
        if (currentAlloc >= 1) return false;
      }
      return true;
    });

    // Pass 2: Relax 50% restriction when other stats are capped or unavailable
    if (candidates.length === 0) {
      candidates = ALL_ATTRIBUTE_KEYS.filter((k) => {
        const currentVal = working[k] || 40;
        if (currentVal >= getCap(k)) return false;
        const currentAlloc = allocated[k] || 0;
        return currentAlloc < 15;
      });
    }

    // Pass 3: Relax 15 max limit if no other eligible stats exist at all
    if (candidates.length === 0) {
      candidates = ALL_ATTRIBUTE_KEYS.filter((k) => {
        const currentVal = working[k] || 40;
        return currentVal < getCap(k);
      });
    }

    // If no candidate exists across all passes, every single attribute is at 99 or Stat Break 100
    if (candidates.length === 0) break;

    // Evaluate candidates to maximize position/sub-position specific OVR growth
    let bestOvr = -1;
    let bestCandidates: AttributeKey[] = [];

    for (const key of candidates) {
      const tempDetailed = { ...working, [key]: (working[key] || 40) + 1 };
      const tempOvr = calculatePlayerOvr(subPosition, playStyle, tempDetailed);

      if (tempOvr > bestOvr) {
        bestOvr = tempOvr;
        bestCandidates = [key];
      } else if (tempOvr === bestOvr) {
        bestCandidates.push(key);
      }
    }

    if (bestCandidates.length === 0) break;

    let winner = bestCandidates[0];
    if (bestCandidates.length > 1) {
      bestCandidates.sort((a, b) => {
        // 1. Highest positional & playstyle weight
        const wA = weights[a] || 0;
        const wB = weights[b] || 0;
        if (Math.abs(wA - wB) > 0.00001) {
          return wB - wA;
        }

        // 2. Unrounded decimal OVR sum
        const tempA = { ...working, [a]: (working[a] || 40) + 1 };
        const tempB = { ...working, [b]: (working[b] || 40) + 1 };
        const decA = calculatePlayerOvrDecimal(subPosition, playStyle, tempA);
        const decB = calculatePlayerOvrDecimal(subPosition, playStyle, tempB);
        if (Math.abs(decA - decB) > 0.00001) {
          return decB - decA;
        }

        // 3. Lower current attribute value (smooth development curve / smallest spread)
        const valA = working[a] || 40;
        const valB = working[b] || 40;
        if (valA !== valB) {
          return valA - valB;
        }

        // 4. Deterministic taxonomy index order
        return ALL_ATTRIBUTE_KEYS.indexOf(a) - ALL_ATTRIBUTE_KEYS.indexOf(b);
      });
      winner = bestCandidates[0];
    }

    const curVal = working[winner] || 40;
    const curProg = workingProgress[winner] || 0;
    const isWeakness = isStatWeaknessForPlayerType(playerTypeId, winner);
    const invRes = applyStatPointInvestment(curVal, curProg, 1, isWeakness);
    working[winner] = invRes.newLevel;
    workingProgress[winner] = invRes.newProgress;
    if (invRes.statBreakTriggered) {
      workingBreakStats[winner] = 100;
    }
    allocated[winner] = (allocated[winner] || 0) + 1;
    pointsSpent++;
  }

  const finalOvr = calculatePlayerOvr(subPosition, playStyle, working);

  return {
    updatedDetailed: working,
    pointsSpent,
    initialOvr,
    finalOvr,
    updatedProgress: workingProgress,
    statBreakStats: workingBreakStats,
  };
}

export function autoAssignGkStatPoints(
  playStyle: string | undefined,
  currentGkDetailed: GkDetailedStats,
  pointsAvailable: number,
  statBreakStats?: Record<string, number>,
  currentProgress?: Record<string, number>
) {
  let working = { ...currentGkDetailed };
  let workingProgress = { ...(currentProgress || {}) };
  let workingBreakStats = { ...(statBreakStats || {}) };
  let pointsSpent = 0;
  const weights = getGkWeights(playStyle);

  const allocated: Record<keyof GkDetailedStats, number> = {} as any;
  for (const key of ALL_GK_KEYS) {
    allocated[key] = 0;
  }

  const getCap = (key: keyof GkDetailedStats): number => {
    const isBroken = (working[key] || 40) >= 100 || !!workingBreakStats[key];
    return isBroken ? 100 : 99;
  };

  const calculateGkOvrVal = (statsObj: GkDetailedStats): number => {
    let sum = 0;
    for (const k of ALL_GK_KEYS) {
      sum += (statsObj[k] || 40) * (weights[k] || 0);
    }
    return Math.min(99, Math.max(40, Math.round(sum)));
  };

  const calculateGkDecimalSum = (statsObj: GkDetailedStats): number => {
    let sum = 0;
    for (const k of ALL_GK_KEYS) {
      sum += (statsObj[k] || 40) * (weights[k] || 0);
    }
    return sum;
  };

  const initialOvr = calculateGkOvrVal(working);

  for (let pt = 0; pt < pointsAvailable; pt++) {
    // Pass 1: Strict < 50% and max 15 per stat
    let candidates = ALL_GK_KEYS.filter((k) => {
      const currentVal = working[k] || 40;
      if (currentVal >= getCap(k)) return false;
      const currentAlloc = allocated[k] || 0;
      if (currentAlloc >= 15) return false;

      if (pointsAvailable > 2) {
        if ((currentAlloc + 1) >= pointsAvailable * 0.5) return false;
      } else if (pointsAvailable === 2) {
        if (currentAlloc >= 1) return false;
      }
      return true;
    });

    // Pass 2: Relax 50% restriction when other stats are capped
    if (candidates.length === 0) {
      candidates = ALL_GK_KEYS.filter((k) => {
        const currentVal = working[k] || 40;
        if (currentVal >= getCap(k)) return false;
        const currentAlloc = allocated[k] || 0;
        return currentAlloc < 15;
      });
    }

    // Pass 3: Relax 15 max limit if no other eligible stats exist
    if (candidates.length === 0) {
      candidates = ALL_GK_KEYS.filter((k) => {
        const currentVal = working[k] || 40;
        return currentVal < getCap(k);
      });
    }

    if (candidates.length === 0) break;

    let bestOvr = -1;
    let bestCandidates: (keyof GkDetailedStats)[] = [];

    for (const key of candidates) {
      const tempGk = { ...working, [key]: (working[key] || 40) + 1 };
      const tempOvr = calculateGkOvrVal(tempGk);

      if (tempOvr > bestOvr) {
        bestOvr = tempOvr;
        bestCandidates = [key];
      } else if (tempOvr === bestOvr) {
        bestCandidates.push(key);
      }
    }

    if (bestCandidates.length === 0) break;

    let winner = bestCandidates[0];
    if (bestCandidates.length > 1) {
      bestCandidates.sort((a, b) => {
        // 1. Highest GK weight
        const wA = weights[a] || 0;
        const wB = weights[b] || 0;
        if (Math.abs(wA - wB) > 0.00001) return wB - wA;

        // 2. Unrounded decimal sum
        const tempA = { ...working, [a]: (working[a] || 40) + 1 };
        const tempB = { ...working, [b]: (working[b] || 40) + 1 };
        const decA = calculateGkDecimalSum(tempA);
        const decB = calculateGkDecimalSum(tempB);
        if (Math.abs(decA - decB) > 0.00001) return decB - decA;

        // 3. Lower attribute value
        const valA = working[a] || 40;
        const valB = working[b] || 40;
        if (valA !== valB) return valA - valB;

        // 4. Deterministic order
        return ALL_GK_KEYS.indexOf(a) - ALL_GK_KEYS.indexOf(b);
      });
      winner = bestCandidates[0];
    }

    const curVal = working[winner] || 40;
    const curProg = workingProgress[winner] || 0;
    const invRes = applyStatPointInvestment(curVal, curProg, 1);
    working[winner] = invRes.newLevel;
    workingProgress[winner] = invRes.newProgress;
    if (invRes.statBreakTriggered) {
      workingBreakStats[winner] = 100;
    }
    allocated[winner] = (allocated[winner] || 0) + 1;
    pointsSpent++;
  }

  const finalOvr = calculateGkOvrVal(working);

  return {
    updatedGkDetailed: working,
    pointsSpent,
    initialOvr,
    finalOvr,
    updatedProgress: workingProgress,
    statBreakStats: workingBreakStats,
  };
}

export function previewAutoAssignOvr(player: PlayerCardData) {
  const subPos = player.subPosition || player.position || 'ST';
  const isGk = subPos.toUpperCase() === 'GK' || (player.position && player.position.toUpperCase() === 'GK');
  const availablePoints = player.freeStatPoints || player.unassignedPoints || 0;
  const potential = player.potentialOvr ?? Math.max((player.ovr || 50) + 5, 80);
  const currentOvr = player.ovr || 50;

  if (currentOvr >= potential || availablePoints <= 0) {
    return {
      currentOvr,
      projectedOvr: currentOvr,
      pointsSpent: 0,
      pointsAvailable: availablePoints,
      updatedPlayer: player,
    };
  }

  if (isGk) {
    const currentGk = getOrCreateGkDetailed(player.stats);
    const res = autoAssignGkStatPoints(player.playStyle, currentGk, availablePoints, player.statBreakStats, player.statTrainingProgress);
    const cappedOvr = Math.min(potential, res.finalOvr);
    const syncedStats = syncCategoryStatsFromGkDetailed(player.stats, res.updatedGkDetailed);
    const hasNewStatBreak = Object.keys(res.statBreakStats || {}).length > Object.keys(player.statBreakStats || {}).length;
    const updatedPlayer: PlayerCardData = {
      ...player,
      stats: syncedStats,
      ovr: cappedOvr,
      freeStatPoints: availablePoints - res.pointsSpent,
      unassignedPoints: availablePoints - res.pointsSpent,
      statTrainingProgress: res.updatedProgress,
      statBreakStats: res.statBreakStats,
      statBreakActive: player.statBreakActive || hasNewStatBreak,
    };
    return {
      currentOvr,
      projectedOvr: cappedOvr,
      pointsSpent: res.pointsSpent,
      pointsAvailable: availablePoints,
      updatedPlayer,
    };
  } else {
    const currentDetailed = getOrCreateOutfieldDetailed(player.stats);
    const res = autoAssignStatPoints(subPos, player.playStyle, currentDetailed, availablePoints, player.statBreakStats, player.statTrainingProgress, player.playerTypeId);
    const cappedOvr = Math.min(potential, res.finalOvr);
    const syncedStats = syncCategoryStatsFromDetailed(player.stats, res.updatedDetailed);
    const hasNewStatBreak = Object.keys(res.statBreakStats || {}).length > Object.keys(player.statBreakStats || {}).length;
    const updatedPlayer: PlayerCardData = {
      ...player,
      stats: syncedStats,
      ovr: cappedOvr,
      freeStatPoints: availablePoints - res.pointsSpent,
      unassignedPoints: availablePoints - res.pointsSpent,
      statTrainingProgress: res.updatedProgress,
      statBreakStats: res.statBreakStats,
      statBreakActive: player.statBreakActive || hasNewStatBreak,
    };
    return {
      currentOvr,
      projectedOvr: cappedOvr,
      pointsSpent: res.pointsSpent,
      pointsAvailable: availablePoints,
      updatedPlayer,
    };
  }
}


/**
 * Point allocation system helper functions for New Game stat customizer
 */
export function getStatPointCost(statVal: number): number {
  if (statVal <= 40) {
    return statVal - 40;
  }
  let total = 0;
  if (statVal > 40) total += (Math.min(statVal, 50) - 40) * 1;
  if (statVal > 50) total += (Math.min(statVal, 60) - 50) * 2;
  if (statVal > 60) total += (Math.min(statVal, 70) - 60) * 3;
  if (statVal > 70) total += (Math.min(statVal, 80) - 70) * 4;
  if (statVal > 80) total += (Math.min(statVal, 90) - 80) * 5;
  if (statVal > 90) total += (Math.min(statVal, 95) - 90) * 10;
  if (statVal > 95) total += (Math.min(statVal, 99) - 95) * 20;
  return total;
}

export function getCostToIncrement(currentVal: number): number {
  if (currentVal < 50) return 1;
  if (currentVal < 60) return 2;
  if (currentVal < 70) return 3;
  if (currentVal < 80) return 4;
  if (currentVal < 90) return 5;
  if (currentVal < 95) return 10;
  return 20;
}

export function getRefundFromDecrement(currentVal: number): number {
  if (currentVal <= 40) return 1;
  if (currentVal <= 50) return 1;
  if (currentVal <= 60) return 2;
  if (currentVal <= 70) return 3;
  if (currentVal <= 80) return 4;
  if (currentVal <= 90) return 5;
  if (currentVal <= 95) return 10;
  return 20;
}


