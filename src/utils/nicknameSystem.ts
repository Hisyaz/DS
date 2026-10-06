import { PlayerCardData } from '../types';
import { LanguageCode, getStoredLanguage } from './localizationSystem';
import { formatPersonName } from './originLastNameSystem';

export type SubPositionGroup = 'ST' | 'LW_RW' | 'CAM' | 'CM' | 'CDM' | 'FB' | 'CB' | 'GK';

export interface NicknameLocalization {
  'en-GB': string;
  'fr-FR': string;
  'es-ES': string;
  'es-AR': string;
  'pt-BR': string;
  'de-DE'?: string;
  'pt-PT'?: string;
  'ar-SA'?: string;
}

export interface FeatNicknameConfig {
  id: 'golden_boy' | 'mr_champions' | 'o_rei';
  nickname: string;
  title: string;
  achievementDescription: string;
}

export const FEAT_NICKNAMES: Record<'golden_boy' | 'mr_champions' | 'o_rei', FeatNicknameConfig> = {
  golden_boy: {
    id: 'golden_boy',
    nickname: 'Wonderkid',
    title: 'International Youth Cup MVP',
    achievementDescription: 'Awarded to the most dazzling young prodigy after winning the International Youth Cup Player of the Tournament (MVP) title!',
  },
  mr_champions: {
    id: 'mr_champions',
    nickname: 'Mr. Champions',
    title: 'Three Consecutive UEFA Champions League Titles & Top Goalscorer',
    achievementDescription: 'An immortal European reign! Conquered 3 consecutive UEFA Champions League titles while finishing as the Top Goalscorer in all three campaigns!',
  },
  o_rei: {
    id: 'o_rei',
    nickname: 'O Rei',
    title: 'Three FIFA World Cup Victories as Starter',
    achievementDescription: 'Global football royalty! Crowned champion in 3 FIFA World Cups as a starting eleven superstar, reaching the absolute pinnacle of football immortality!',
  },
};

export type StartingCityKey = 'london' | 'madrid' | 'buenos_aires' | 'sao_paulo' | 'paris';

/**
 * Starting Player Type Nicknames mapping based on chosen Archetype and Starting Academy City / Country:
 * Speedster | Tank | Flair | Architect | Ice-Cold | Patient | Wasted Talent | Cannon
 * Across London, Madrid, Buenos Aires, São Paulo, and Paris.
 */
export const STARTING_TYPE_NICKNAMES: Record<string, Record<StartingCityKey, string>> = {
  speedster: {
    london: 'The Speed Merchant',
    madrid: 'El Velocista',
    buenos_aires: 'El Picante',
    sao_paulo: 'O Flecha',
    paris: 'La Flèche',
  },
  tank: {
    london: 'The Beast',
    madrid: 'El Tren',
    buenos_aires: 'El Bondi',
    sao_paulo: 'O Trator',
    paris: 'Le Roc',
  },
  flair: {
    london: 'The Wizard',
    madrid: 'El Mago',
    buenos_aires: 'El Lírico',
    sao_paulo: 'O Craque',
    paris: 'Le Magicien',
  },
  architect: {
    london: 'The Metronome',
    madrid: 'El Cerebro',
    buenos_aires: 'El Bocha',
    sao_paulo: 'O Maestro',
    paris: 'Le Métronome',
  },
  ice_cold: {
    london: 'The Assassin',
    madrid: 'El Androide',
    buenos_aires: 'El Matador',
    sao_paulo: 'O Frio',
    paris: 'Le Sang-Froid',
  },
  patient: {
    london: 'The Workhorse',
    madrid: 'El Pulmón',
    buenos_aires: 'El Caballito',
    sao_paulo: 'O Motorzinho',
    paris: "L'Aspirateur",
  },
  wasted_talent: {
    london: 'The Luxury Player',
    madrid: 'El Vago',
    buenos_aires: 'El Pechofrío',
    sao_paulo: 'O Chinelinho',
    paris: 'L’Intermittent',
  },
  cannon: {
    london: 'The Rocketman',
    madrid: 'El Cañonero',
    buenos_aires: 'El Rifle',
    sao_paulo: 'O Canhão',
    paris: 'Le Bombardier',
  },
};

/**
 * Resolves a city name, country name, or starting city string to a canonical StartingCityKey
 */
export function resolveStartingCityKey(cityOrCountry?: string): StartingCityKey {
  if (!cityOrCountry) return 'london';
  const val = cityOrCountry.toLowerCase().trim();
  if (val.includes('madrid') || val.includes('spain') || val.includes('españa') || val.includes('esp')) return 'madrid';
  if (val.includes('buenos aires') || val.includes('argentina') || val.includes('arg') || val.includes('rosario')) return 'buenos_aires';
  if (val.includes('são paulo') || val.includes('sao paulo') || val.includes('brazil') || val.includes('brasil') || val.includes('bra') || val.includes('rio')) return 'sao_paulo';
  if (val.includes('paris') || val.includes('france') || val.includes('fra') || val.includes('marseille') || val.includes('lyon')) return 'paris';
  if (val.includes('london') || val.includes('england') || val.includes('united kingdom') || val.includes('uk') || val.includes('eng') || val.includes('gbr') || val.includes('manchester')) return 'london';
  return 'london';
}

/**
 * Retrieves the starting nickname for a player's chosen archetype and starting city / country.
 */
export function getStartingTypeNickname(
  playerTypeId: string,
  cityOrCountryOrPlayer?: string | PlayerCardData
): string {
  const normTypeId = (playerTypeId || 'speedster').toLowerCase().replace(/[\s-]/g, '_');
  let cityKey: StartingCityKey = 'london';

  if (typeof cityOrCountryOrPlayer === 'object' && cityOrCountryOrPlayer !== null) {
    const p = cityOrCountryOrPlayer;
    const clubCountry = (p as any)?.clubCountry || '';
    if (clubCountry) {
      cityKey = resolveStartingCityKey(clubCountry);
    } else {
      cityKey = resolveStartingCityKey(p.startingCity || p.city);
    }
  } else if (typeof cityOrCountryOrPlayer === 'string') {
    cityKey = resolveStartingCityKey(cityOrCountryOrPlayer);
  }

  const typeMap = STARTING_TYPE_NICKNAMES[normTypeId] || STARTING_TYPE_NICKNAMES.speedster;
  return typeMap[cityKey] || typeMap.london || 'The Speed Merchant';
}

/**
 * Playstyle Nicknames database mapping strictly organized by:
 * SubPositionGroup -> Playstyle -> LanguageCode -> Culturally Localized Nickname
 * Including requested German (de-DE), European Portuguese (pt-PT), and Arabic (ar-SA) variants.
 */
export const PLAYSTYLE_NICKNAMES_DATABASE: Record<SubPositionGroup, Record<string, NicknameLocalization>> = {
  // ATTACKER — ST
  ST: {
    Poacher: {
      'en-GB': 'The Fox',
      'fr-FR': 'Le Renard',
      'es-ES': 'El Killer',
      'es-AR': 'El Pipa',
      'pt-BR': 'O Artilheiro',
      'de-DE': 'Der Torjäger',
      'pt-PT': 'O Matador',
      'ar-SA': 'الثعلب',
    },
    Target: {
      'en-GB': 'The Bull',
      'fr-FR': 'Le Bison',
      'es-ES': 'El Tanque',
      'es-AR': 'El Toro',
      'pt-BR': 'O Tanque',
      'de-DE': 'Der Panzer',
      'pt-PT': 'O Tanque',
      'ar-SA': 'الدبابة',
    },
    Complete: {
      'en-GB': 'The King',
      'fr-FR': 'Le Roi',
      'es-ES': 'El Crack',
      'es-AR': 'El Pibe de Oro',
      'pt-BR': 'O Fenomeno',
      'de-DE': 'Der König',
      'pt-PT': 'O Craque',
      'ar-SA': 'الملك',
    },
    Finisher: {
      'en-GB': 'The Assassin',
      'fr-FR': 'Le Tueur',
      'es-ES': 'El Pichichi',
      'es-AR': 'El Matador',
      'pt-BR': 'O Matador',
      'de-DE': 'Der Vollstrecker',
      'pt-PT': 'O Finalizador',
      'ar-SA': 'الهداف',
    },
    Decoy: {
      'en-GB': 'The Phantom',
      'fr-FR': 'Le Fantôme',
      'es-ES': 'El Tiburón',
      'es-AR': 'El Raton',
      'pt-BR': 'O Sacrifício',
      'de-DE': 'Das Phantom',
      'pt-PT': 'O Fantasma',
      'ar-SA': 'الشبح',
    },
  },

  // ATTACKER — LW/RW
  LW_RW: {
    Traditional: {
      'en-GB': 'The Winger',
      'fr-FR': 'Le Funambule',
      'es-ES': 'El Pisha',
      'es-AR': 'El Fideo',
      'pt-BR': 'O Ponta',
      'de-DE': 'Der Flügelflitzer',
      'pt-PT': 'O Extremo',
      'ar-SA': 'الجناح الطائر',
    },
    Inverted: {
      'en-GB': 'The Magician',
      'fr-FR': 'Le Magicien',
      'es-ES': 'El Mago',
      'es-AR': 'El Conejo',
      'pt-BR': 'O Driblador',
      'de-DE': 'Der Zauberer',
      'pt-PT': 'O Mágico',
      'ar-SA': 'الساحر',
    },
    Prolific: {
      'en-GB': 'The Sniper',
      'fr-FR': 'Le Buteur',
      'es-ES': 'El Comandante',
      'es-AR': 'El Genio',
      'pt-BR': 'O Brocador',
      'de-DE': 'Der Scharfschütze',
      'pt-PT': 'O Comandante',
      'ar-SA': 'القناص',
    },
    Pressing: {
      'en-GB': 'The Hound',
      'fr-FR': 'Le Harceleur',
      'es-ES': 'El Mosquito',
      'es-AR': 'El Rayo',
      'pt-BR': 'O Motorzinho',
      'de-DE': 'Die Rakete',
      'pt-PT': 'O Foguete',
      'ar-SA': 'الصاروخ',
    },
  },

  // MIDFIELDER — CAM
  CAM: {
    Creator: {
      'en-GB': 'The Maestro',
      'fr-FR': 'Le Magicien',
      'es-ES': 'El Brujo',
      'es-AR': 'El Mago',
      'pt-BR': 'O Maestro',
      'de-DE': 'Der Spielmacher',
      'pt-PT': 'O Maestro',
      'ar-SA': 'المايسترو',
    },
    Shadow: {
      'en-GB': 'The Shadow',
      'fr-FR': "L'Ombre",
      'es-ES': 'El Bicho',
      'es-AR': 'El Principe',
      'pt-BR': 'O Surpresa',
      'de-DE': 'Der Schatten',
      'pt-PT': 'A Sombra',
      'ar-SA': 'الظل',
    },
    'Classic N10': {
      'en-GB': 'The Number 10',
      'fr-FR': 'Le Numéro 10',
      'es-ES': 'El Diez',
      'es-AR': 'El Diez',
      'pt-BR': 'O Camisa 10',
      'de-DE': 'Die Nummer 10',
      'pt-PT': 'O Camisola 10',
      'ar-SA': 'رقم 10',
    },
    Engine: {
      'en-GB': 'The Engine',
      'fr-FR': 'Le Poumon',
      'es-ES': 'El Motor',
      'es-AR': 'El Pajarito',
      'pt-BR': 'O Motor',
      'de-DE': 'Der Motor',
      'pt-PT': 'O Motor',
      'ar-SA': 'المحرك',
    },
  },

  // MIDFIELDER — CM
  CM: {
    'Box-to-Box': {
      'en-GB': 'The Engine',
      'fr-FR': 'Le Poumon',
      'es-ES': 'El Pulmon',
      'es-AR': 'El Galgo',
      'pt-BR': 'O Motor',
      'de-DE': 'Die Lunge',
      'pt-PT': 'O Todo-o-Terreno',
      'ar-SA': 'الرئة',
    },
    Maestro: {
      'en-GB': 'The Conductor',
      'fr-FR': 'Le Métronome',
      'es-ES': 'El Cerebro',
      'es-AR': 'El Bocha',
      'pt-BR': 'O Maestro',
      'de-DE': 'Der Dirigent',
      'pt-PT': 'O Cérebro',
      'ar-SA': 'العقل المدبر',
    },
    Runner: {
      'en-GB': 'The Runner',
      'fr-FR': 'Le Marathonien',
      'es-ES': 'El Kaiser',
      'es-AR': 'El Capo',
      'pt-BR': 'O Incansável',
      'de-DE': 'Der Marathonmann',
      'pt-PT': 'O Incansável',
      'ar-SA': 'العداء',
    },
  },

  // MIDFIELDER — CDM
  CDM: {
    Enforcer: {
      'en-GB': 'The Enforcer',
      'fr-FR': 'Le Guerrier',
      'es-ES': 'El Mariscal',
      'es-AR': 'El Patrón',
      'pt-BR': 'O Xerife',
      'de-DE': 'Der Krieger',
      'pt-PT': 'O Guerreiro',
      'ar-SA': 'المحارب',
    },
    Anchor: {
      'en-GB': 'The Anchor',
      'fr-FR': 'Le Régulateur',
      'es-ES': 'El Elegido',
      'es-AR': 'El Elegante',
      'pt-BR': 'O Primeiro Passe',
      'de-DE': 'Der Anker',
      'pt-PT': 'O Pêndulo',
      'ar-SA': 'المرساة',
    },
  },

  // DEFENDER — FB
  FB: {
    Defensive: {
      'en-GB': 'The Lock',
      'fr-FR': 'Le Verrou',
      'es-ES': 'El Cerrojo',
      'es-AR': 'El Candado',
      'pt-BR': 'O Cadeado',
      'de-DE': 'Das Schloss',
      'pt-PT': 'O Fecho',
      'ar-SA': 'القفل',
    },
    Inverted: {
      'en-GB': 'The Architect',
      'fr-FR': "L'Architecte",
      'es-ES': 'El Director',
      'es-AR': 'El Profesor',
      'pt-BR': 'O Arquiteto',
      'de-DE': 'Der Architekt',
      'pt-PT': 'O Arquiteto',
      'ar-SA': 'المهندس',
    },
    Attacker: {
      'en-GB': 'The Flyer',
      'fr-FR': 'La Fusée',
      'es-ES': 'El Cohete',
      'es-AR': 'La Flecha',
      'pt-BR': 'O Foguete',
      'de-DE': 'Die Rakete',
      'pt-PT': 'A Flecha',
      'ar-SA': 'السهم',
    },
    Balanced: {
      'en-GB': 'The Complete',
      'fr-FR': 'Le Polyvalent',
      'es-ES': 'El Corazon',
      'es-AR': 'El Mister',
      'pt-BR': 'O Polivalente',
      'de-DE': 'Der Allrounder',
      'pt-PT': 'O Polivalente',
      'ar-SA': 'الشامل',
    },
  },

  // DEFENDER — CB
  CB: {
    Destroyer: {
      'en-GB': 'The Enforcer',
      'fr-FR': 'Le Boucher',
      'es-ES': 'El Carnicero',
      'es-AR': 'El Patrón',
      'pt-BR': 'O Xerife',
      'de-DE': 'Der Zerstörer',
      'pt-PT': 'O Xerife',
      'ar-SA': 'الصخرة',
    },
    Distributor: {
      'en-GB': 'The Distributor',
      'fr-FR': 'Le Relanceur',
      'es-ES': 'El Jefe',
      'es-AR': 'El Profesor',
      'pt-BR': 'O Lançador',
      'de-DE': 'Der Stratege',
      'pt-PT': 'O Patrão',
      'ar-SA': 'الزعيم',
    },
    Playmaker: {
      'en-GB': 'The General',
      'fr-FR': 'Le Général',
      'es-ES': 'El Mariscal',
      'es-AR': 'El Mariscal',
      'pt-BR': 'O General',
      'de-DE': 'Der General',
      'pt-PT': 'O General',
      'ar-SA': 'الجنرال',
    },
    Stopper: {
      'en-GB': 'The Wall',
      'fr-FR': 'Le Roc',
      'es-ES': 'El Cancerbero',
      'es-AR': 'El Cabezon',
      'pt-BR': 'A Muralha',
      'de-DE': 'Die Mauer',
      'pt-PT': 'A Muralha',
      'ar-SA': 'الجدار',
    },
  },

  // GOALKEEPER — GK
  GK: {
    Balanced: {
      'en-GB': 'The Guardian',
      'fr-FR': 'Le Gardien',
      'es-ES': 'El Guardián',
      'es-AR': 'El Uno',
      'pt-BR': 'O Guardião',
      'de-DE': 'Der Hexer',
      'pt-PT': 'O Guardião',
      'ar-SA': 'الحارس الأمين',
    },
    Sweeper: {
      'en-GB': 'The Libero',
      'fr-FR': 'Le Libéro',
      'es-ES': 'El Loco',
      'es-AR': 'El Loco',
      'pt-BR': 'O Líbero',
      'de-DE': 'Der Libero',
      'pt-PT': 'O Líbero',
      'ar-SA': 'الليبرو',
    },
    Wall: {
      'en-GB': 'The Wall',
      'fr-FR': 'Le Rempart',
      'es-ES': 'El Muro',
      'es-AR': 'El Muro',
      'pt-BR': 'A Muralha',
      'de-DE': 'Die Titan-Wand',
      'pt-PT': 'A Muralha',
      'ar-SA': 'السد المنيع',
    },
  },
};

/**
 * Resolves the SubPositionGroup from subPosition code or position category
 */
export function resolveSubPositionGroup(subPosition?: string, position?: string): SubPositionGroup {
  const sub = (subPosition || '').toUpperCase().trim();
  const pos = (position || '').toUpperCase().trim();

  if (['ST', 'CF'].includes(sub)) return 'ST';
  if (['LW', 'RW', 'LM', 'RM'].includes(sub)) return 'LW_RW';
  if (['CAM', 'AM'].includes(sub)) return 'CAM';
  if (['CM', 'MC'].includes(sub)) return 'CM';
  if (['CDM', 'DM'].includes(sub)) return 'CDM';
  if (['LB', 'RB', 'LWB', 'RWB', 'FB'].includes(sub)) return 'FB';
  if (['CB', 'SW'].includes(sub)) return 'CB';
  if (['GK'].includes(sub) || pos === 'GK') return 'GK';

  // Fallback based on high-level position category
  if (pos === 'ATT') return 'ST';
  if (pos === 'MID') return 'CAM';
  if (pos === 'DEF') return 'CB';
  if (pos === 'GK') return 'GK';

  return 'ST';
}

/**
 * Normalizes a name key for dictionary matching (lowercase, diacritics removed)
 */
function normalizeKey(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Formats a string to Title Case (First letter uppercase, rest lowercase)
 */
function toTitleCase(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Common Brazilian Football Nickname Mapping Table
 * (Known authentic cultural nicknames / hypocoristics)
 */
const BRAZILIAN_NAME_DICTIONARY: Record<string, { diminutive: string; augmentative: string }> = {
  carlos: { diminutive: 'Carlinhos', augmentative: 'Carlão' },
  renato: { diminutive: 'Renatinho', augmentative: 'Renatão' },
  bruno: { diminutive: 'Bruninho', augmentative: 'Brunão' },
  diego: { diminutive: 'Dieguinho', augmentative: 'Diegão' },
  ricardo: { diminutive: 'Ricardinho', augmentative: 'Ricardão' },
  rafaela: { diminutive: 'Rafaelinha', augmentative: 'Rafaelona' },
  juliana: { diminutive: 'Julianinha', augmentative: 'Julianona' },
  carla: { diminutive: 'Carlinha', augmentative: 'Carlona' },
  lucas: { diminutive: 'Luquinhas', augmentative: 'Lucão' },
  luka: { diminutive: 'Luquinhas', augmentative: 'Lucão' },
  luca: { diminutive: 'Luquinhas', augmentative: 'Lucão' },
  marcos: { diminutive: 'Marquinhos', augmentative: 'Marcão' },
  marcus: { diminutive: 'Marquinhos', augmentative: 'Marcão' },
  matheus: { diminutive: 'Matheuzinho', augmentative: 'Matheuzão' },
  mateus: { diminutive: 'Mateuzinho', augmentative: 'Mateuzão' },
  daniel: { diminutive: 'Danizinho', augmentative: 'Danielzão' },
  gabriel: { diminutive: 'Bielzinho', augmentative: 'Gabrielzão' },
  samuel: { diminutive: 'Samuelzinho', augmentative: 'Samuelzão' },
  igor: { diminutive: 'Igorinho', augmentative: 'Igorão' },
  vitor: { diminutive: 'Vitinho', augmentative: 'Vitão' },
  victor: { diminutive: 'Vitinho', augmentative: 'Victorão' },
  arthur: { diminutive: 'Arthurzinho', augmentative: 'Arthurzão' },
  artur: { diminutive: 'Arturzinho', augmentative: 'Arturzão' },
  joao: { diminutive: 'Juninho', augmentative: 'Joãozão' },
  caio: { diminutive: 'Caiozinho', augmentative: 'Caiozão' },
  paulo: { diminutive: 'Paulinho', augmentative: 'Paulão' },
  pedro: { diminutive: 'Pedrinho', augmentative: 'Pedrão' },
  eduardo: { diminutive: 'Dudu', augmentative: 'Eduardão' },
  rafael: { diminutive: 'Rafinha', augmentative: 'Rafaelzão' },
  fernando: { diminutive: 'Fernandinho', augmentative: 'Fernandão' },
  roberto: { diminutive: 'Robertinho', augmentative: 'Robertão' },
  marcelo: { diminutive: 'Marcelinho', augmentative: 'Marcelão' },
  andre: { diminutive: 'Andrezinho', augmentative: 'Andrézão' },
  thiago: { diminutive: 'Thiaguinho', augmentative: 'Thiagão' },
  tiago: { diminutive: 'Tiaguinho', augmentative: 'Tiagão' },
  rodrigo: { diminutive: 'Rodriguinho', augmentative: 'Rodrigão' },
  henrique: { diminutive: 'Henriquinho', augmentative: 'Henriquão' },
  felipe: { diminutive: 'Felipinho', augmentative: 'Felipão' },
  filipe: { diminutive: 'Filipinho', augmentative: 'Filipão' },
  alexandre: { diminutive: 'Xandinho', augmentative: 'Xandão' },
  alex: { diminutive: 'Alexzinho', augmentative: 'Alexzão' },
  sergio: { diminutive: 'Serginho', augmentative: 'Serjão' },
  fabio: { diminutive: 'Fabinho', augmentative: 'Fabião' },
  guilherme: { diminutive: 'Guilherminho', augmentative: 'Guilhermão' },
  gustavo: { diminutive: 'Gustavinho', augmentative: 'Gustavão' },
  bernardo: { diminutive: 'Bernardinho', augmentative: 'Bernardão' },
  leonardo: { diminutive: 'Leozinho', augmentative: 'Leonardão' },
  leo: { diminutive: 'Leozinho', augmentative: 'Leozão' },
  theo: { diminutive: 'Theozinho', augmentative: 'Theozão' },
  hugo: { diminutive: 'Huguinho', augmentative: 'Hugão' },
  luiz: { diminutive: 'Luizinho', augmentative: 'Luizão' },
  luis: { diminutive: 'Luizinho', augmentative: 'Luizão' },
  jose: { diminutive: 'Zezinho', augmentative: 'Josezão' },
  francisco: { diminutive: 'Chiquinho', augmentative: 'Chicão' },
  antonio: { diminutive: 'Toninho', augmentative: 'Tonhão' },
  ronaldo: { diminutive: 'Ronaldinho', augmentative: 'Ronaldão' },
  ronald: { diminutive: 'Ronaldinho', augmentative: 'Ronaldão' },
  robson: { diminutive: 'Robinho', augmentative: 'Robsão' },
  cesar: { diminutive: 'Cesinha', augmentative: 'Cesão' },
  walter: { diminutive: 'Valtinho', augmentative: 'Waltão' },
  valter: { diminutive: 'Valtinho', augmentative: 'Valtão' },
  roger: { diminutive: 'Rogerinho', augmentative: 'Rogerão' },
  rogerio: { diminutive: 'Rogerinho', augmentative: 'Rogerão' },
  heitor: { diminutive: 'Heitorzinho', augmentative: 'Heitorzão' },
  davi: { diminutive: 'Davizinho', augmentative: 'Davizão' },
  david: { diminutive: 'Davizinho', augmentative: 'Davidzão' },
  neymar: { diminutive: 'Neymarzinho', augmentative: 'Neymarzão' },
  vinicius: { diminutive: 'Vini', augmentative: 'Vinizão' },
  danilo: { diminutive: 'Danilinho', augmentative: 'Danilão' },
  otavio: { diminutive: 'Otavinho', augmentative: 'Otavião' },
  claudio: { diminutive: 'Claudinho', augmentative: 'Claudão' },
  mario: { diminutive: 'Marinho', augmentative: 'Marião' },
  lucio: { diminutive: 'Lucinho', augmentative: 'Lucião' },
  jorge: { diminutive: 'Jorginho', augmentative: 'Jorgão' },
  alessandro: { diminutive: 'Ale', augmentative: 'Alessandrão' },
  breno: { diminutive: 'Breninho', augmentative: 'Brenão' },
  cassio: { diminutive: 'Cassinho', augmentative: 'Cassiozão' },
  cleber: { diminutive: 'Clebinho', augmentative: 'Cleberzão' },
  dener: { diminutive: 'Deninho', augmentative: 'Denerzão' },
  everton: { diminutive: 'Evertonzinho', augmentative: 'Evertonzão' },
  fabricio: { diminutive: 'Fabricinho', augmentative: 'Fabricião' },
  geovane: { diminutive: 'Geovaninho', augmentative: 'Geovanão' },
  helio: { diminutive: 'Helinho', augmentative: 'Helião' },
  israel: { diminutive: 'Israelzinho', augmentative: 'Israelzão' },
  jadson: { diminutive: 'Jadsonzinho', augmentative: 'Jadsonzão' },
  kaio: { diminutive: 'Kaiozinho', augmentative: 'Kaiozão' },
  kleber: { diminutive: 'Klebinho', augmentative: 'Kleberzão' },
  leandro: { diminutive: 'Leandrinho', augmentative: 'Leandrão' },
  marcio: { diminutive: 'Marcinho', augmentative: 'Marcião' },
  nilton: { diminutive: 'Niltinho', augmentative: 'Niltão' },
  natan: { diminutive: 'Natanzinho', augmentative: 'Natanzão' },
  osvaldo: { diminutive: 'Osvaldinho', augmentative: 'Osvaldão' },
  patrick: { diminutive: 'Patrickinho', augmentative: 'Patrickão' },
  patrik: { diminutive: 'Patrikinho', augmentative: 'Patrikão' },
  ramon: { diminutive: 'Ramoncinho', augmentative: 'Ramonzão' },
  silvio: { diminutive: 'Silvinho', augmentative: 'Silvião' },
  tales: { diminutive: 'Talinho', augmentative: 'Talezão' },
  valdir: { diminutive: 'Valdirzinho', augmentative: 'Valdirzão' },
  wellington: { diminutive: 'Wellingtonzinho', augmentative: 'Wellingtonzão' },
  yuri: { diminutive: 'Yurizinho', augmentative: 'Yurizão' },
  alisson: { diminutive: 'Alissoninho', augmentative: 'Alissonzão' },
  ederson: { diminutive: 'Edersonzinho', augmentative: 'Edersonzão' },
  casemiro: { diminutive: 'Casemirinho', augmentative: 'Casemirão' },
};

/**
 * Generates a natural Brazilian diminutive nickname (-inho / -inha / -zinho)
 * dynamically transforming whatever first name the player entered.
 */
export function generateBrazilianDiminutive(rawFirstName: string): string {
  const clean = (rawFirstName || '').trim();
  if (!clean) return 'Menino';

  const first = clean.split(/\s+/)[0];
  const normalized = normalizeKey(first);

  // 1. Direct authentic dictionary match
  if (BRAZILIAN_NAME_DICTIONARY[normalized]?.diminutive) {
    return BRAZILIAN_NAME_DICTIONARY[normalized].diminutive;
  }

  const base = toTitleCase(first);
  const lower = first.toLowerCase();

  // 2. Special Brazilian phonetics
  if (/[aeiou][ií][oa]$/i.test(lower)) {
    return base + 'zinho';
  }

  if (/[bcdfghjklmnpqrstvwxyz][ií]o$/i.test(lower)) {
    if (/gio$/i.test(lower)) return base.replace(/gio$/i, 'ginho');
    if (/bio$/i.test(lower)) return base.replace(/bio$/i, 'binho');
    if (/tio$/i.test(lower) || /távio$/i.test(lower) || /tavio$/i.test(lower)) return base.replace(/(?:távio|tavio|tio)$/i, 'tinho');
    if (/dio$/i.test(lower)) return base.replace(/dio$/i, 'dinho');
    if (/cio$/i.test(lower)) return base.replace(/cio$/i, 'cinho');
    if (/nio$/i.test(lower)) return base.replace(/nio$/i, 'ninho');
    if (/lio$/i.test(lower)) return base.replace(/lio$/i, 'linho');
    if (/rio$/i.test(lower)) return base.replace(/rio$/i, 'rinho');
  }

  if (/el$/i.test(lower)) return base + 'zinho';
  if (/al$/i.test(lower)) return base + 'zinho';
  if (/ol$/i.test(lower)) return base + 'zinho';
  if (/ul$/i.test(lower)) return base + 'zinho';
  if (/m$/i.test(lower)) return base + 'zinho';
  if (/ão$/i.test(lower) || /ao$/i.test(lower)) return base + 'zinho';
  if (/on$/i.test(lower) || /an$/i.test(lower) || /en$/i.test(lower) || /in$/i.test(lower)) return base + 'zinho';

  if (/co$/i.test(lower)) return base.replace(/co$/i, 'quinho');
  if (/ca$/i.test(lower)) return base.replace(/ca$/i, 'quinha');
  if (/go$/i.test(lower)) return base.replace(/go$/i, 'guinho');
  if (/ga$/i.test(lower)) return base.replace(/ga$/i, 'guinha');
  if (/ç[oa]$/i.test(lower) || /c[oa]$/i.test(lower)) {
    return base.replace(/ç[oa]$/i, 'cinho').replace(/c[oa]$/i, 'quinho');
  }

  if (/a$/i.test(lower)) return base.slice(0, -1) + 'inha';
  if (/o$/i.test(lower)) return base.slice(0, -1) + 'inho';
  if (/e$/i.test(lower)) return base + 'zinho';
  if (/i$/i.test(lower)) return base + 'zinho';
  if (/u$/i.test(lower)) return base + 'zinho';

  if (/r$/i.test(lower)) return base + 'zinho';
  if (/s$/i.test(lower)) return base + 'inho';
  if (/z$/i.test(lower)) return base + 'inho';

  return base + 'inho';
}

/**
 * Generates a natural Brazilian augmentative nickname (-ão / -zão / -ona)
 * dynamically transforming whatever first name the player entered.
 */
export function generateBrazilianAugmentative(rawFirstName: string): string {
  const clean = (rawFirstName || '').trim();
  if (!clean) return 'Gigante';

  const first = clean.split(/\s+/)[0];
  const normalized = normalizeKey(first);

  // 1. Direct authentic dictionary match
  if (BRAZILIAN_NAME_DICTIONARY[normalized]?.augmentative) {
    return BRAZILIAN_NAME_DICTIONARY[normalized].augmentative;
  }

  const base = toTitleCase(first);
  const lower = first.toLowerCase();

  // 2. Special Brazilian phonetics
  if (/[aeiou][ií][oa]$/i.test(lower)) {
    return base + 'zão';
  }

  if (/gio$/i.test(lower)) return base.replace(/gio$/i, 'jão');
  if (/bio$/i.test(lower)) return base.replace(/bio$/i, 'bião');
  if (/tio$/i.test(lower) || /távio$/i.test(lower) || /tavio$/i.test(lower)) return base.replace(/(?:távio|tavio|tio)$/i, 'tião');
  if (/dio$/i.test(lower)) return base.replace(/dio$/i, 'dião');
  if (/cio$/i.test(lower)) return base.replace(/cio$/i, 'cião');

  if (/el$/i.test(lower)) return base + 'zão';
  if (/al$/i.test(lower)) return base + 'zão';
  if (/ol$/i.test(lower)) return base + 'zão';
  if (/ul$/i.test(lower)) return base + 'zão';
  if (/m$/i.test(lower)) return base + 'zão';
  if (/ão$/i.test(lower) || /ao$/i.test(lower)) return base + 'zão';
  if (/on$/i.test(lower) || /an$/i.test(lower) || /en$/i.test(lower) || /in$/i.test(lower)) return base + 'zão';

  if (/co$/i.test(lower)) return base.replace(/co$/i, 'cão');
  if (/ca$/i.test(lower)) return base.replace(/ca$/i, 'cona');
  if (/go$/i.test(lower)) return base.replace(/go$/i, 'gão');
  if (/ga$/i.test(lower)) return base.replace(/ga$/i, 'gona');

  if (/a$/i.test(lower)) return base.slice(0, -1) + 'ona';
  if (/o$/i.test(lower)) return base.slice(0, -1) + 'ão';
  if (/e$/i.test(lower)) return base + 'zão';
  if (/i$/i.test(lower)) return base + 'zão';
  if (/u$/i.test(lower)) return base + 'zão';

  if (/r$/i.test(lower)) return base + 'zão';
  if (/s$/i.test(lower)) return base.slice(0, -1) + 'zão';
  if (/z$/i.test(lower)) return base + 'ão';

  return base + 'ão';
}

/**
 * Extracts and calculates player's physical height in Centimeters (CM)
 */
export function getPlayerHeightCm(player: PlayerCardData): number {
  if (player.heightCm && typeof player.heightCm === 'number') {
    return player.heightCm;
  }
  const heightStr = (player as any).height || '';
  if (typeof heightStr === 'string' && heightStr.includes('cm')) {
    const parsed = parseInt(heightStr.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 100) return parsed;
  }
  if (typeof heightStr === 'string' && heightStr.includes("'")) {
    const parts = heightStr.split("'");
    const feet = parseInt(parts[0], 10);
    const inches = parseInt(parts[1]?.replace(/[^0-9]/g, '') || '0', 10);
    if (!isNaN(feet)) {
      return Math.round((feet * 12 + inches) * 2.54);
    }
  }
  return 178; // Default balanced height
}

/**
 * Checks if the player's CURRENT CLUB is located in Brazil.
 * As per rule: Current Club Country → Language/Culture → Position → Sub-Position → Playstyle.
 * Nationality / National team must NOT determine the standard nickname.
 */
export function isCurrentClubInBrazil(player: PlayerCardData): boolean {
  const clubCountry = (
    (player as any)?.clubCountry ||
    (player as any)?.clubCountryName ||
    ''
  ).toLowerCase().trim();

  if (clubCountry.includes('brazil') || clubCountry.includes('brasil') || clubCountry === 'bra') {
    return true;
  }

  const league = (player.league || (player as any)?.leagueName || '').toLowerCase().trim();
  if (
    league.includes('brasileir') ||
    league.includes('série a (brazil)') ||
    league.includes('serie a (brazil)') ||
    league.includes('paulista') ||
    league.includes('carioca')
  ) {
    return true;
  }

  const club = (player.club || '').toLowerCase().trim();
  if (
    club.includes('flamengo') ||
    club.includes('palmeiras') ||
    club.includes('santos') ||
    club.includes('são paulo') ||
    club.includes('sao paulo') ||
    club.includes('corinthians') ||
    club.includes('fluminense') ||
    club.includes('grêmio') ||
    club.includes('gremio') ||
    club.includes('internacional') ||
    club.includes('cruzeiro') ||
    club.includes('atlético mineiro') ||
    club.includes('botafogo') ||
    club.includes('vasco')
  ) {
    if (!clubCountry || clubCountry.includes('brazil') || clubCountry.includes('brasil')) {
      return true;
    }
  }

  return false;
}

/**
 * Helper to check if Brazilian culture applies (club or legacy heritage fallback)
 */
export function isBrazilianPlayer(player: PlayerCardData, language?: LanguageCode): boolean {
  if (isCurrentClubInBrazil(player)) return true;
  if (language === 'pt-BR') return true;
  if (player.isBrazilHeritage) return true;
  if (player.equippedParentCard?.isBrazilHeritage) return true;

  const natCode = (player.nationality?.code || player.countryCode || '').toUpperCase();
  if (natCode === 'BRA') return true;

  const natName = (player.nationality?.name || player.country || '').toLowerCase();
  if (natName.includes('brazil') || natName.includes('brasil')) return true;

  const iso = (player.nationality?.iso || '').toLowerCase();
  if (iso === 'br' || iso === 'bra') return true;

  return false;
}

/**
 * Resolves the language/culture from the Player's Current Club Country
 */
export function resolveClubCulture(player: PlayerCardData): string {
  if (isCurrentClubInBrazil(player)) {
    return 'pt-BR';
  }

  const clubCountry = (
    (player as any)?.clubCountry ||
    (player as any)?.clubCountryName ||
    ''
  ).toLowerCase().trim();

  const league = (player.league || (player as any)?.leagueName || '').toLowerCase().trim();

  if (
    clubCountry.includes('portugal') ||
    clubCountry === 'por' ||
    league.includes('liga portugal') ||
    league.includes('primeira liga')
  ) {
    return 'pt-PT';
  }
  if (
    clubCountry.includes('german') ||
    clubCountry.includes('deutsch') ||
    clubCountry === 'ger' ||
    clubCountry === 'deu' ||
    clubCountry.includes('austria') ||
    league.includes('bundesliga')
  ) {
    return 'de-DE';
  }
  if (
    clubCountry.includes('saudi') ||
    clubCountry === 'ksa' ||
    clubCountry === 'sau' ||
    clubCountry.includes('qatar') ||
    clubCountry.includes('emirates') ||
    clubCountry.includes('uae') ||
    clubCountry.includes('egypt') ||
    clubCountry.includes('morocco') ||
    league.includes('saudi') ||
    league.includes('roshn')
  ) {
    return 'ar-SA';
  }
  if (
    clubCountry.includes('franc') ||
    clubCountry === 'fra' ||
    league.includes('ligue 1') ||
    league.includes('ligue 2')
  ) {
    return 'fr-FR';
  }
  if (
    clubCountry.includes('argentin') ||
    clubCountry === 'arg' ||
    league.includes('liga profesional') ||
    league.includes('primera división (argentina)') ||
    league.includes('primera division (argentina)')
  ) {
    return 'es-AR';
  }
  if (
    clubCountry.includes('spain') ||
    clubCountry.includes('españ') ||
    clubCountry === 'esp' ||
    league.includes('la liga') ||
    clubCountry.includes('mexic') ||
    clubCountry.includes('colomb') ||
    clubCountry.includes('chile') ||
    clubCountry.includes('uruguay')
  ) {
    return 'es-ES';
  }

  return 'en-GB';
}

/**
 * Extracts and returns the player's true birth first name (handles compound names, safeguarding against nicknames)
 */
export function extractPlayerFirstName(player: PlayerCardData): string {
  if (player.birthFirstName && player.birthFirstName.trim()) {
    return player.birthFirstName.trim();
  }
  if (player.originalFirstName && player.originalFirstName.trim()) {
    return player.originalFirstName.trim();
  }
  if (player.birthFullName && player.birthFullName.trim()) {
    const parts = player.birthFullName.trim().split(/\s+/);
    if (parts.length > 0 && parts[0]) {
      return parts[0];
    }
  }

  // Check if player.firstName is safe (not currently set to an active or unlocked nickname)
  const isNick = (val?: string) => {
    if (!val || !val.trim()) return false;
    const clean = val.trim().toLowerCase();
    if (player.nickname && player.nickname.trim().toLowerCase() === clean) return true;
    if (player.obtainedNicknames && player.obtainedNicknames.some((n) => n.trim().toLowerCase() === clean)) return true;
    return false;
  };

  if (player.firstName && player.firstName.trim() && !isNick(player.firstName)) {
    return formatPersonName(player.firstName.trim());
  }

  const fullName = (player.name || '').trim();
  const lastName = player.birthLastName || player.lastName || player.familyName || player.equippedParentCard?.familyName;
  if (lastName && fullName.endsWith(lastName.trim()) && fullName !== lastName.trim()) {
    const firstPart = fullName.slice(0, fullName.length - lastName.trim().length).trim();
    if (firstPart && !isNick(firstPart)) return formatPersonName(firstPart);
  }

  if (fullName && !isNick(fullName)) {
    const tokens = fullName.split(/\s+/);
    if (tokens.length > 0 && !isNick(tokens[0])) {
      return formatPersonName(tokens[0]);
    }
    return formatPersonName(fullName);
  }

  return 'Prodigy';
}

/**
 * Extracts and returns the player's last name (or family name) without first name or previous nickname
 */
export function extractPlayerLastName(player: PlayerCardData): string {
  if (player.lastName && player.lastName.trim()) {
    return formatPersonName(player.lastName.trim());
  }
  if (player.familyName && player.familyName.trim()) {
    return formatPersonName(player.familyName.trim());
  }
  if (player.equippedParentCard?.familyName) {
    return formatPersonName(player.equippedParentCard.familyName.trim());
  }

  const fullName = (player.name || '').trim();
  if (!fullName) return '';

  // If the player currently has an active nickname and the fullName starts with it, strip the nickname
  if (player.nickname && player.nickname.trim()) {
    const nick = player.nickname.trim();
    if (fullName.startsWith(nick)) {
      const rest = fullName.slice(nick.length).trim();
      if (rest) return formatPersonName(rest);
    }
  }

  // If player has originalFirstName and fullName starts with it, strip it
  if (player.originalFirstName && player.originalFirstName.trim()) {
    const orig = player.originalFirstName.trim();
    if (fullName.startsWith(orig)) {
      const rest = fullName.slice(orig.length).trim();
      if (rest) return formatPersonName(rest);
    }
  }

  // If player has firstName and fullName starts with it, strip it
  if (player.firstName && player.firstName.trim()) {
    const fn = player.firstName.trim();
    if (fullName.startsWith(fn)) {
      const rest = fullName.slice(fn.length).trim();
      if (rest) return formatPersonName(rest);
    }
  }

  // Fallback: everything after the first word
  const tokens = fullName.split(/\s+/);
  if (tokens.length > 1) {
    return formatPersonName(tokens.slice(1).join(' '));
  }

  return '';
}

/**
 * Calculates what the player's full name will become if the nickname is embraced
 * (Replaces FIRST NAME with nickname while keeping LAST NAME unchanged)
 */
export function calculateEmbracedFullName(player: PlayerCardData, nickname: string): string {
  const lastName = formatPersonName(extractPlayerLastName(player));
  const explicitSuffix = player.nameSuffix?.trim();

  if (lastName) {
    if (explicitSuffix && !lastName.includes(explicitSuffix)) {
      return `${nickname} ${lastName} ${explicitSuffix}`.trim();
    }
    return `${nickname} ${lastName}`.trim();
  }

  if (explicitSuffix) {
    return `${nickname} ${explicitSuffix}`.trim();
  }

  return nickname;
}

/**
 * Reverts player nickname back to their original birth name
 */
export function revertPlayerNickname(player: PlayerCardData): PlayerCardData {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const birthFirst = formatPersonName(player.birthFirstName || player.originalFirstName || extractPlayerFirstName(player));
  const birthLast = formatPersonName(
    player.lastName ||
    (player.selectedLastNameType === 'origin' ? player.originLastName : player.originalLastName) ||
    player.birthLastName ||
    extractPlayerLastName(player)
  );
  const explicitSuffix = player.nameSuffix?.trim();

  let restoredFullName = '';
  if (birthLast) {
    if (explicitSuffix && !birthLast.includes(explicitSuffix)) {
      restoredFullName = `${birthFirst} ${birthLast} ${explicitSuffix}`.trim();
    } else {
      restoredFullName = `${birthFirst} ${birthLast}`.trim();
    }
  } else if (explicitSuffix) {
    restoredFullName = `${birthFirst} ${explicitSuffix}`.trim();
  } else {
    restoredFullName = birthFirst;
  }

  updated.name = restoredFullName;
  updated.firstName = birthFirst;
  updated.originalFirstName = birthFirst;
  updated.birthFirstName = birthFirst;
  updated.birthLastName = birthLast;
  updated.lastName = birthLast;
  updated.birthFullName = restoredFullName;
  updated.nickname = undefined;
  updated.nicknameAccepted = false;
  return updated;
}

/**
 * Gets the culturally localized nickname for a given sub-position, playstyle, and language/culture
 */
export function getPlaystyleNickname(
  subPosition: string | undefined,
  position: string | undefined,
  playStyle: string | undefined,
  language: string = getStoredLanguage()
): string {
  const group = resolveSubPositionGroup(subPosition, position);
  const groupData = PLAYSTYLE_NICKNAMES_DATABASE[group];
  if (!groupData) return 'The Phenomenon';

  // Find matching playstyle key (case-insensitive)
  const cleanPlayStyle = (playStyle || '').trim();
  const matchedKey = Object.keys(groupData).find(
    (key) => key.toLowerCase() === cleanPlayStyle.toLowerCase()
  );

  if (matchedKey && groupData[matchedKey]) {
    const localized = (groupData[matchedKey] as any)[language] || groupData[matchedKey]['en-GB'];
    if (localized) return localized;
  }

  // Fallback to first playstyle in the group if no exact match
  const firstKey = Object.keys(groupData)[0];
  if (firstKey && groupData[firstKey]) {
    return (groupData[firstKey] as any)[language] || groupData[firstKey]['en-GB'];
  }

  return 'The Star';
}

/**
 * Generates the Brazilian nickname based on First Name and Height:
 * - Under 175 CM: -inho / -inha natural Brazilian diminutive
 * - Above 185 CM: -ão natural Brazilian augmentative
 * - 175–185 CM: Normal Brazilian Playstyle nickname
 */
export function generateBrazilianNickname(
  firstName: string,
  heightCm: number,
  subPosition?: string,
  position?: string,
  playStyle?: string
): string {
  if (heightCm < 175) {
    return generateBrazilianDiminutive(firstName);
  }
  if (heightCm > 185) {
    return generateBrazilianAugmentative(firstName);
  }
  // 175–185 CM: Use standard Brazilian Playstyle nickname
  return getPlaystyleNickname(subPosition, position, playStyle, 'pt-BR');
}

/**
 * Returns the effective nickname for a player during the Nickname Event,
 * following: Current Club Country → Language/Culture → Position → Sub-Position → Current Playstyle.
 * When current club is in Brazil, applies Brazilian height-based naming conventions.
 */
export function getEffectivePlayerNickname(
  player: PlayerCardData,
  explicitLanguage?: LanguageCode
): string {
  const currentSub = player.subPosition || player.position || 'ST';
  const currentCat = player.position || 'ATT';
  const currentStyle = player.playStyle || 'Poacher';

  if (isCurrentClubInBrazil(player)) {
    const height = getPlayerHeightCm(player);
    const firstName = extractPlayerFirstName(player);
    return generateBrazilianNickname(firstName, height, currentSub, currentCat, currentStyle);
  }

  const culture = resolveClubCulture(player);
  return getPlaystyleNickname(currentSub, currentCat, currentStyle, explicitLanguage || culture);
}

/**
 * Applies the starting player type archetype nickname upon accepting.
 * Replaces first name with nickname, preserves last name, and saves to obtainedNicknames library.
 * Does NOT consume the mid-career pre-season nickname event (hasHadNicknameEvent stays false).
 */
export function applyStartingTypeNickname(player: PlayerCardData, nickname: string): PlayerCardData {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  
  const birthFirst = formatPersonName(player.birthFirstName || player.originalFirstName || extractPlayerFirstName(player));
  const birthLast = formatPersonName(player.birthLastName || player.lastName || extractPlayerLastName(player));
  const birthFull = formatPersonName(player.birthFullName || (player.name && !player.nicknameAccepted ? player.name : (birthLast ? `${birthFirst} ${birthLast}`.trim() : birthFirst)));

  updated.birthFirstName = birthFirst;
  updated.originalFirstName = birthFirst;
  updated.birthLastName = birthLast;
  updated.birthFullName = birthFull;
  if (!updated.lastName) {
    updated.lastName = birthLast;
  }

  const cleanNick = nickname.trim();
  const newFullName = calculateEmbracedFullName(player, cleanNick);

  updated.name = newFullName;
  updated.firstName = cleanNick;
  updated.nickname = cleanNick;
  updated.nicknameAccepted = true;

  const set = new Set<string>(updated.obtainedNicknames || []);
  set.add(cleanNick);
  updated.obtainedNicknames = Array.from(set);

  return updated;
}

/**
 * Discards the starting player type nickname upon decline.
 * Keeps the player's original birth name, does NOT set active nickname,
 * BUT saves it to obtainedNicknames library so it can be added back in Customization later!
 * Does NOT consume the mid-career pre-season nickname event (hasHadNicknameEvent stays false).
 */
export function rejectStartingTypeNickname(player: PlayerCardData, discardedNickname: string): PlayerCardData {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const originalFirst = formatPersonName(extractPlayerFirstName(player));
  const lastName = formatPersonName(extractPlayerLastName(player));
  const explicitSuffix = player.nameSuffix?.trim();

  let restoredFullName = originalFirst;
  if (lastName) {
    if (explicitSuffix && !lastName.includes(explicitSuffix)) {
      restoredFullName = `${originalFirst} ${lastName} ${explicitSuffix}`.trim();
    } else {
      restoredFullName = `${originalFirst} ${lastName}`.trim();
    }
  } else if (explicitSuffix) {
    restoredFullName = `${originalFirst} ${explicitSuffix}`.trim();
  }

  updated.name = restoredFullName;
  updated.firstName = originalFirst;
  updated.nickname = undefined;
  updated.nicknameAccepted = false;

  // CRITICAL: Save to obtainedNicknames so the player can add it back later in Customization!
  if (discardedNickname && discardedNickname.trim()) {
    const set = new Set<string>(updated.obtainedNicknames || []);
    set.add(discardedNickname.trim());
    updated.obtainedNicknames = Array.from(set);
  }

  return updated;
}

/**
 * Applies the accepted regular nickname to the player card, replacing FIRST NAME ONLY.
 * Preserves the original first name and last name.
 */
export function applyPlayerNickname(player: PlayerCardData, nickname: string): PlayerCardData {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  
  const birthFirst = formatPersonName(player.birthFirstName || player.originalFirstName || extractPlayerFirstName(player));
  const birthLast = formatPersonName(player.birthLastName || player.lastName || extractPlayerLastName(player));
  const birthFull = formatPersonName(player.birthFullName || (player.name && !player.nicknameAccepted ? player.name : (birthLast ? `${birthFirst} ${birthLast}`.trim() : birthFirst)));

  updated.birthFirstName = birthFirst;
  updated.originalFirstName = birthFirst;
  updated.birthLastName = birthLast;
  updated.birthFullName = birthFull;
  if (!updated.lastName) {
    updated.lastName = birthLast;
  }

  const cleanNick = nickname.trim();
  const newFullName = calculateEmbracedFullName(player, cleanNick);

  updated.name = newFullName;
  updated.firstName = cleanNick;
  updated.nickname = cleanNick;
  updated.hasHadNicknameEvent = true;
  updated.nicknameAccepted = true;

  const set = new Set<string>(updated.obtainedNicknames || []);
  set.add(cleanNick);
  updated.obtainedNicknames = Array.from(set);

  return updated;
}

/**
 * Permanently rejects the regular nickname and marks the regular event as completed for the career.
 * Discarded nickname is stored in obtainedNicknames so player can equip it in Customization if desired.
 */
export function rejectPlayerNickname(player: PlayerCardData, discardedNickname?: string): PlayerCardData {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  updated.hasHadNicknameEvent = true;
  updated.nicknameAccepted = false;

  if (discardedNickname && discardedNickname.trim()) {
    const set = new Set<string>(updated.obtainedNicknames || []);
    set.add(discardedNickname.trim());
    updated.obtainedNicknames = Array.from(set);
  }

  return updated;
}

/**
 * Applies a feat nickname to the player card, replacing active nickname or first name,
 * while preserving the player's real last name and original first name.
 * Feat nicknames do NOT consume the regular nickname event.
 */
export function applyFeatNickname(player: PlayerCardData, featConfig: FeatNicknameConfig): PlayerCardData {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  
  const birthFirst = player.birthFirstName || player.originalFirstName || extractPlayerFirstName(player);
  const birthLast = player.birthLastName || player.lastName || extractPlayerLastName(player);
  const birthFull = player.birthFullName || (player.name && !player.nicknameAccepted ? player.name : (birthLast ? `${birthFirst} ${birthLast}`.trim() : birthFirst));

  updated.birthFirstName = birthFirst;
  updated.originalFirstName = birthFirst;
  updated.birthLastName = birthLast;
  updated.birthFullName = birthFull;
  if (!updated.lastName) {
    updated.lastName = birthLast;
  }

  const nickname = featConfig.nickname;
  const newFullName = calculateEmbracedFullName(player, nickname);

  updated.name = newFullName;
  updated.firstName = nickname;
  updated.nickname = nickname;
  updated.nicknameAccepted = true;

  // Record feat as unlocked
  updated.unlockedFeatNicknames = Array.from(
    new Set([...(updated.unlockedFeatNicknames || []), featConfig.id])
  );

  return updated;
}

/**
 * Rejects a feat nickname (keeps current identity), recording feat as resolved.
 */
export function rejectFeatNickname(player: PlayerCardData, featConfig: FeatNicknameConfig): PlayerCardData {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  updated.unlockedFeatNicknames = Array.from(
    new Set([...(updated.unlockedFeatNicknames || []), featConfig.id])
  );
  return updated;
}

/**
 * Checks if the player qualifies for the Golden Boy feat nickname
 */
export function checkGoldenBoyFeat(player: PlayerCardData, wonMvp: boolean): boolean {
  if (!wonMvp) return false;
  const unlocked = player.unlockedFeatNicknames || [];
  return !unlocked.includes('golden_boy');
}

/**
 * Updates UCL streak and checks if player qualifies for Mr. Champions feat nickname
 */
export function processUclSeasonFeat(
  player: PlayerCardData,
  wonUcl: boolean,
  isTopScorer: boolean
): { player: PlayerCardData; unlocked: boolean } {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const currentStreak = updated.consecutiveUclTitlesWithTopScorer || 0;
  const unlockedFeats = updated.unlockedFeatNicknames || [];

  if (wonUcl && isTopScorer) {
    const newStreak = currentStreak + 1;
    updated.consecutiveUclTitlesWithTopScorer = newStreak;
    if (newStreak >= 3 && !unlockedFeats.includes('mr_champions')) {
      return { player: updated, unlocked: true };
    }
  } else if (wonUcl || isTopScorer || currentStreak > 0) {
    // Break the streak if participated in UCL season and didn't meet both conditions
    updated.consecutiveUclTitlesWithTopScorer = 0;
  }
  return { player: updated, unlocked: false };
}

/**
 * Updates World Cup win records and checks if player qualifies for O Rei feat nickname
 */
export function processWorldCupFeat(
  player: PlayerCardData,
  wonWorldCup: boolean,
  isStarter: boolean
): { player: PlayerCardData; unlocked: boolean } {
  const updated: PlayerCardData = JSON.parse(JSON.stringify(player));
  const unlockedFeats = updated.unlockedFeatNicknames || [];

  if (wonWorldCup && isStarter) {
    const currentWins = (updated.startingWorldCupWins || 0) + 1;
    updated.startingWorldCupWins = currentWins;
    if (currentWins >= 3 && !unlockedFeats.includes('o_rei')) {
      return { player: updated, unlocked: true };
    }
  }
  return { player: updated, unlocked: false };
}

/**
 * Checks if the player is eligible for the Ex-Pro early nickname roll (10% chance)
 */
export function shouldCheckExProNicknameEvent(player: PlayerCardData, parentTypeId?: string): boolean {
  if (player.hasHadNicknameEvent) return false;
  const isExPro =
    parentTypeId === 'ex_pro_player' ||
    player.equippedParentCard?.typeId === 'ex_pro_player';
  return Boolean(isExPro);
}

/**
 * Rolls 10% chance for Ex-Pro nickname event immediately after position selection
 */
export function rollExProNicknameEvent(player: PlayerCardData, parentTypeId?: string): boolean {
  if (!shouldCheckExProNicknameEvent(player, parentTypeId)) return false;
  return Math.random() < 0.10;
}

/**
 * Checks if the player is eligible for the Standard Pre-Season nickname event (Fame >= 10, once per career)
 */
export function isEligibleForStandardNicknameEvent(player: PlayerCardData): boolean {
  if (player.hasHadNicknameEvent) return false;
  const fame = player.fame || 0;
  return fame >= 10;
}

/**
 * Rolls 10% chance for Standard Pre-Season nickname event
 */
export function rollStandardNicknameEvent(player: PlayerCardData): boolean {
  if (!isEligibleForStandardNicknameEvent(player)) return false;
  return Math.random() < 0.10;
}
