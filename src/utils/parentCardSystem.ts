import { ParentCardInstance, ParentCardRarity, ParentCardTypeId, ParentAdviceEffect } from '../types/parentCards';
import { NATIONALITIES } from '../constants';
import { Nationality, PlayerCardData, ManagerState, AccountingState, BusinessItem, CustomCard, CustomCardTier, CardModifier } from '../types';
import { drawUniqueCareerCategoryCards } from './storeCollectionSystem';

import { rollInheritedHeight, getInheritedHeightInfo } from './playerGrowthSystem';
import { rollParentCardPotentialBonus, getPotentialBonusColor, BASE_PLAYER_POTENTIAL, clampDisplayedPotential } from './potentialSystem';
import { formatPersonName } from './originLastNameSystem';

export { rollParentCardPotentialBonus, getPotentialBonusColor, BASE_PLAYER_POTENTIAL, clampDisplayedPotential };

// FIFA Top 10, 15, and 50 indices from NATIONALITIES
const TOP_10_NATIONS = NATIONALITIES.slice(0, 10);
const TOP_15_NATIONS = NATIONALITIES.slice(0, 15);
const TOP_50_NATIONS = NATIONALITIES.slice(0, 50);

// ----------------------------------------------------
// FAMILY NAME & FOOTBALL HERITAGE SYSTEM DATABASES
// ----------------------------------------------------

export const NORMAL_FAMILY_DATABASE: Record<string, string[]> = {
  England: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Patel', 'Robinson'],
  France: ['Martin', 'Bernard', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Simon', 'Laurent', 'Michel'],
  Spain: ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín'],
  Argentina: ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'García', 'Sánchez'],
  Brazil: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Ferreira', 'Lima', 'Alves', 'Rodrigues', 'Costa'],
};

export const IMMIGRANT_FAMILY_DATABASE: Record<string, [string, string]> = {
  Argentina: ['González', 'Rodríguez'],
  Spain: ['Fernández', 'López'],
  France: ['Martin', 'Bernard'],
  England: ['Smith', 'Jones'],
  Brazil: ['Silva', 'Santos'],
  Portugal: ['Fernandes', 'Pereira'],
  Netherlands: ['de Jong', 'Jansen'],
  Germany: ['Müller', 'Schmidt'],
  Italy: ['Rossi', 'Russo'],
  Belgium: ['Peeters', 'Janssens'],
  Croatia: ['Horvat', 'Kovačić'],
  Colombia: ['Martínez', 'Gómez'],
  Morocco: ['Alaoui', 'Bennani'],
  Senegal: ['Ndiaye', 'Diop'],
  Mexico: ['Hernández', 'Ramírez'],
  'United States': ['Johnson', 'Anderson'],
  Japan: ['Sato', 'Suzuki'],
  Switzerland: ['Meier', 'Keller'],
  Denmark: ['Nielsen', 'Jensen'],
  Iran: ['Mohammadi', 'Hosseini'],
  Ecuador: ['Mendoza', 'Cedeño'],
  Austria: ['Gruber', 'Huber'],
  'South Korea': ['Kim', 'Lee'],
  Türkiye: ['Yılmaz', 'Kaya'],
  Ukraine: ['Melnyk', 'Shevchenko'],
  Canada: ['MacDonald', 'Campbell'],
  Norway: ['Hansen', 'Johansen'],
  Australia: ['Williams', 'Thompson'],
  Algeria: ['Benali', 'Bensalem'],
  Egypt: ['Mohamed', 'Hassan'],
  Panama: ['Castillo', 'Moreno'],
  "Côte d'Ivoire": ['Kouassi', 'Koffi'],
  Nigeria: ['Okafor', 'Adeyemi'],
  Scotland: ['MacLeod', 'Robertson'],
  Serbia: ['Jovanović', 'Petrović'],
  Paraguay: ['Benítez', 'Cáceres'],
  Tunisia: ['Trabelsi', 'Ben Salah'],
  Poland: ['Nowak', 'Kowalski'],
  Peru: ['Quispe', 'Flores'],
  Sweden: ['Andersson', 'Johansson'],
  Czechia: ['Novák', 'Svoboda'],
  Wales: ['Evans', 'Griffiths'],
  Romania: ['Popescu', 'Ionescu'],
  Hungary: ['Nagy', 'Kovács'],
  Cameroon: ['Njoya', 'Ngono'],
  Mali: ['Traoré', 'Coulibaly'],
  'Costa Rica': ['Vargas', 'Solano'],
  Venezuela: ['Rojas', 'Herrera'],
};

export const GOLD_FOOTBALL_HERITAGE: Record<string, string[]> = {
  England: ['Lampard', 'Scholes', 'Ferdinand', 'Neville', 'Lineker'],
  France: ['Griezmann', 'Vieira', 'Deschamps', 'Ribéry', 'Benzema'],
  Spain: ['Casillas', 'Ramos', 'Puyol', 'Torres', 'Cazorla'],
  Argentina: ['Riquelme', 'Batistuta', 'Zanetti', 'Redondo', 'Verón'],
  Brazil: ['Kaká', 'Rivaldo', 'Cafu', 'Roberto Carlos', 'Adriano'],
};

export const LEGENDARY_FOOTBALL_HERITAGE: Record<string, string[]> = {
  England: ['Beckham', 'Gerrard', 'Rooney', 'Charlton', 'Shearer'],
  France: ['Zidane', 'Henry', 'Platini', 'Cantona', 'Mbappé'],
  Spain: ['Iniesta', 'Xavi', 'Busquets', 'Villa', 'Hierro'],
  Argentina: ['Messi', 'Maradona', 'Di Stéfano', 'Crespo', 'Agüero'],
  Brazil: ['Pelé', 'Ronaldo', 'Ronaldinho', 'Romário', 'Neymar'],
};

export function getCountryFromStartingCity(startingCityOrCountry?: string): string {
  if (!startingCityOrCountry) return 'England';
  const val = startingCityOrCountry.toLowerCase();
  if (val.includes('london') || val.includes('eng')) return 'England';
  if (val.includes('paris') || val.includes('fr')) return 'France';
  if (val.includes('madrid') || val.includes('esp')) return 'Spain';
  if (val.includes('buenos') || val.includes('arg')) return 'Argentina';
  if (val.includes('sao_paulo') || val.includes('bra') || val.includes('são paulo')) return 'Brazil';
  return 'England';
}

export function generateParentFamilyIdentity(
  typeId: ParentCardTypeId,
  rarity: ParentCardRarity,
  startingCityOrCountry?: string,
  extraNationalityName?: string
): {
  familyName: string;
  familyDisplay: string;
  familyCountry: string;
  isBrazilHeritage: boolean;
  nameSuffix: string;
} {
  const country = getCountryFromStartingCity(startingCityOrCountry);

  // IMMIGRANT FAMILY: Uses Immigrant Nationality fixed database
  if (typeId === 'immigrant_family') {
    const natName = extraNationalityName || country;
    const available = IMMIGRANT_FAMILY_DATABASE[natName] || IMMIGRANT_FAMILY_DATABASE[country] || ['Smith', 'Jones'];
    const chosen = available[Math.floor(Math.random() * available.length)];
    return {
      familyName: chosen,
      familyDisplay: `${chosen} Family`,
      familyCountry: natName,
      isBrazilHeritage: false,
      nameSuffix: '',
    };
  }

  // EX-PRO GOLD & LEGENDARY: Football Heritage
  if (typeId === 'ex_pro_player' && (rarity === 'gold' || rarity === 'legendary')) {
    const poolMap = rarity === 'legendary' ? LEGENDARY_FOOTBALL_HERITAGE : GOLD_FOOTBALL_HERITAGE;
    const countryPool = poolMap[country] || poolMap['England'];
    const chosen = countryPool[Math.floor(Math.random() * countryPool.length)];
    const isBrazil = country === 'Brazil';
    return {
      familyName: chosen,
      familyDisplay: `${chosen}'s Family`,
      familyCountry: country,
      isBrazilHeritage: isBrazil,
      nameSuffix: isBrazil ? 'Jr.' : '',
    };
  }

  // ICONIC PARENT: Uses Legendary Football Heritage
  if (typeId === 'iconic_parent') {
    const countryPool = LEGENDARY_FOOTBALL_HERITAGE[country] || LEGENDARY_FOOTBALL_HERITAGE['England'];
    const chosen = countryPool[Math.floor(Math.random() * countryPool.length)];
    const isBrazil = country === 'Brazil';
    return {
      familyName: chosen,
      familyDisplay: `${chosen}'s Family`,
      familyCountry: country,
      isBrazilHeritage: isBrazil,
      nameSuffix: isBrazil ? 'Jr.' : '',
    };
  }

  // NORMAL FAMILY POOL: Average Family, Helicopter Parents, Raised in Ghetto, Rich Parents, Ex-Pro Bronze & Silver
  const normalPool = NORMAL_FAMILY_DATABASE[country] || NORMAL_FAMILY_DATABASE['England'];
  const chosen = normalPool[Math.floor(Math.random() * normalPool.length)];
  return {
    familyName: chosen,
    familyDisplay: `${chosen} Family`,
    familyCountry: country,
    isBrazilHeritage: false,
    nameSuffix: '',
  };
}

export function buildPlayerFullName(firstName: string, card: ParentCardInstance): string {
  let cleanFirst = formatPersonName((firstName || '').trim());
  if (!cleanFirst) cleanFirst = 'Mateo';

  const familyName = formatPersonName(card.familyName || 'González');
  const suffix = card.nameSuffix || (card.isBrazilHeritage ? 'Jr.' : '');

  if (suffix) {
    return `${cleanFirst} ${familyName} ${suffix}`.trim();
  }
  return `${cleanFirst} ${familyName}`.trim();
}

function getRandomNation(pool: Nationality[], excludeCodes: string[] = []): Nationality {
  const available = pool.filter((n) => !excludeCodes.includes(n.code));
  if (available.length === 0) return pool[Math.floor(Math.random() * pool.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export const PARENT_ADVICE_EFFECTS: ParentAdviceEffect[] = [
  {
    id: 'composure_boost',
    title: '+10 Composure',
    description: '+10 Composure boost until season end.',
    type: 'composure',
  },
  {
    id: 'chemistry_boost',
    title: '+10 Chemistry',
    description: '+10 Immediate Squad Chemistry.',
    type: 'chemistry',
  },
  {
    id: 'bad_rep_reduction',
    title: '-10 Bad Reputation',
    description: '-10 Bad Reputation Score.',
    type: 'bad_rep',
  },
  {
    id: 'injury_recovery',
    title: '+10 Injury Recovery Points',
    description: '+10 Stored Injury Recovery Points for faster healing.',
    type: 'injury_recovery',
  },
  {
    id: 'focus_boost',
    title: '+10 Focus',
    description: '+10 Matchday Mental Focus until season end.',
    type: 'focus',
  },
];

/**
 * Roll rarity tier based on specified draw chances:
 * Bronze: 100%
 * Silver: 50%
 * Gold: 25%
 * Legendary: 5%
 */
export function rollRarityTier(): ParentCardRarity {
  const rand = Math.random();
  if (rand < 0.05) return 'legendary';
  if (rand < 0.25) return 'gold';
  if (rand < 0.50) return 'silver';
  return 'bronze';
}

/**
 * Generate a single Parent Card instance based on typeId and rarity
 */
export function createParentCardInstance(
  typeId: ParentCardTypeId,
  rarity: ParentCardRarity,
  playerNationalityCode: string = '',
  startingCityOrCountry: string = ''
): ParentCardInstance {
  const id = `parent-${typeId}-${rarity}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const inheritedHeightCm = rollInheritedHeight();
  const geneInfo = getInheritedHeightInfo(inheritedHeightCm);
  const heightEffect = `Inherited Height: +${inheritedHeightCm} CM (${geneInfo.label})`;
  const rolledPotentialBonus = rollParentCardPotentialBonus(rarity);

  let card: ParentCardInstance;

  if (typeId === 'iconic_parent') {
    card = {
      id,
      typeId: 'iconic_parent',
      name: 'Iconic Parent',
      rarity: 'iconic',
      description:
        'An exceptionally rare football upbringing inspired by football’s greatest legends. Your parent sacrificed everything for your dream, instilling elite mentality, discipline, and constant emotional support.',
      iconName: 'Crown',
      gradient: 'from-amber-400 via-yellow-500 to-amber-700',
      borderColor: 'border-amber-400',
      badgeText: '⭐ ICONIC PARENT',
      inheritedHeightCm,
      weakFootBonus: 5,
      freeStatPointsBonus: 40,
      potentialBonus: 18,
      composureBonus: 20,
      staminaBonus: 15,
      reactionsBonus: 15,
      positioningBonus: 15,
      fameBonus: 20,
      managerName: 'Parent Agent (Iconic Master)',
      managerRating: 99,
      perkTitle: 'Iconic Parent',
      perkDescription:
        '+10 Stat Points every 5 years and +20% Fame gained from all Fame sources.',
      perkEffects: [
        '+10 Stat Points every 5 years',
        '+20% Fame gained from all Fame sources',
        'Fame Cards can NEVER become negative',
        '+5 Weak Foot & +40 Free Stat Points',
        '+10 Chemistry on new club',
        'Iconic Parent Agent (99/99/99)',
        'Upgradeable Parent Advice choice menu',
      ],
    };
  } else {

  switch (typeId) {
    case 'ex_pro_player': {
      const weakFootMap: Record<ParentCardRarity, number> = { bronze: 1, silver: 2, gold: 3, legendary: 5, iconic: 5 };
      const freePointsMap: Record<ParentCardRarity, number> = { bronze: 10, silver: 15, gold: 20, legendary: 30, iconic: 40 };
      const fameMap: Record<ParentCardRarity, number> = { bronze: 3, silver: 5, gold: 7, legendary: 10, iconic: 20 };
      const mgrRatingMap: Record<ParentCardRarity, number> = { bronze: 55, silver: 65, gold: 75, legendary: 85, iconic: 95 };
      const mgrNameMap: Record<ParentCardRarity, string> = {
        bronze: 'Parent Agent (Pro)',
        silver: 'Parent Agent (Ex-Pro)',
        gold: 'Parent Agent (Pro Legend)',
        legendary: 'Parent Agent (World Class)',
        iconic: 'Parent Agent (Master)',
      };

      card = {
        id,
        typeId,
        name: 'Ex-Pro Player',
        rarity,
        description: 'One of your parents played professional football and now represents your career with insider experience.',
        iconName: 'Trophy',
        gradient: getRarityGradient(rarity),
        borderColor: getRarityBorder(rarity),
        badgeText: getRarityBadgeText(rarity, 'EX-PRO PLAYER'),
        weakFootBonus: weakFootMap[rarity],
        freeStatPointsBonus: freePointsMap[rarity],
        potentialBonus: rolledPotentialBonus,
        fameBonus: fameMap[rarity],
        managerName: mgrNameMap[rarity],
        managerRating: mgrRatingMap[rarity],
        perkTitle: 'In The Shadow Of',
        perkDescription: "Your parent's reputation creates unrealistic expectations: 50% chance Fame Cards become negative, -10 Chemistry on joining a new club.",
        perkEffects: [
          `+${weakFootMap[rarity]} Weak Foot`,
          `+${freePointsMap[rarity]} Free Stat Points`,
          `+${fameMap[rarity]} Fame`,
          `Permanent Agent: ${mgrNameMap[rarity]} (${mgrRatingMap[rarity]} Rating)`,
          'Perk: 50% chance of Fame Card becoming negative',
          'Perk: -10 Chemistry when joining a new club',
        ],
      };
      break;
    }

    case 'average_family': {
      const composureMap: Record<ParentCardRarity, number> = { bronze: 5, silver: 10, gold: 15, legendary: 30, iconic: 30 };

      card = {
        id,
        typeId,
        name: 'Average Family',
        rarity,
        description: 'Raised in a supportive, loving household that always believed in you and kept you grounded.',
        iconName: 'Heart',
        gradient: getRarityGradient(rarity),
        borderColor: getRarityBorder(rarity),
        badgeText: getRarityBadgeText(rarity, 'AVERAGE FAMILY'),
        composureBonus: composureMap[rarity],
        potentialBonus: rolledPotentialBonus,
        perkTitle: 'Ask Parents for Advice',
        perkDescription: 'Unlocks a button in the Persistent UI. Can be used once per season to randomly receive a powerful advice boost.',
        perkEffects: [
          `+${composureMap[rarity]} Composure`,
          'Perk: "Ask Parents for Advice" button unlocked (1x per season)',
          'Grants +10 Composure, +10 Chemistry, -10 Bad Rep, +10 Recovery, or +10 Focus',
        ],
      };
      break;
    }

    case 'helicopter_parents': {
      const weakFootMap: Record<ParentCardRarity, number> = { bronze: 1, silver: 1, gold: 2, legendary: 3, iconic: 5 };
      const mgrRatingMap: Record<ParentCardRarity, number> = { bronze: 55, silver: 65, gold: 75, legendary: 85, iconic: 95 };
      const mgrNameMap: Record<ParentCardRarity, string> = {
        bronze: 'Parent Agent (Strict)',
        silver: 'Parent Agent (Demanding)',
        gold: 'Parent Agent (Disciplinarian)',
        legendary: 'Parent Agent (Elite Taskmaster)',
        iconic: 'Parent Agent (Master)',
      };

      card = {
        id,
        typeId,
        name: 'Helicopter Parents',
        rarity,
        description: 'Your parents controlled every aspect of your football upbringing and represent you with fierce loyalty.',
        iconName: 'Sparkles',
        gradient: getRarityGradient(rarity),
        borderColor: getRarityBorder(rarity),
        badgeText: getRarityBadgeText(rarity, 'HELICOPTER PARENTS'),
        potentialBonus: rolledPotentialBonus,
        weakFootBonus: weakFootMap[rarity],
        managerName: mgrNameMap[rarity],
        managerRating: mgrRatingMap[rarity],
        perkTitle: 'Forced To Train',
        perkDescription: 'Gain +1 Injury Recovery Point every month automatically.',
        perkEffects: [
          `+${weakFootMap[rarity]} Weak Foot`,
          `Permanent Agent: ${mgrNameMap[rarity]} (${mgrRatingMap[rarity]} Rating)`,
          'Perk: Gain +1 Injury Recovery Point every month',
        ],
      };
      break;
    }

    case 'immigrant_family': {
      const staminaMap: Record<ParentCardRarity, number> = { bronze: 5, silver: 10, gold: 15, legendary: 30, iconic: 30 };
      const extraNatCountMap: Record<ParentCardRarity, number> = { bronze: 1, silver: 1, gold: 2, legendary: 2, iconic: 2 };

      // Generate extra nationalities
      const extraNats: Nationality[] = [];
      const exclude = [playerNationalityCode];

      if (rarity === 'bronze' || rarity === 'silver') {
        const n1 = getRandomNation(TOP_50_NATIONS, exclude);
        extraNats.push(n1);
      } else if (rarity === 'gold') {
        const n1 = getRandomNation(TOP_15_NATIONS, exclude);
        exclude.push(n1.code);
        const n2 = getRandomNation(TOP_50_NATIONS, exclude);
        extraNats.push(n1, n2);
      } else {
        // Legendary
        const n1 = getRandomNation(TOP_10_NATIONS, exclude);
        exclude.push(n1.code);
        const n2 = getRandomNation(TOP_10_NATIONS, exclude);
        extraNats.push(n1, n2);
      }

      const extraNatNames = extraNats.map((n) => `${n.name} (${n.code})`).join(', ');

      card = {
        id,
        typeId,
        name: 'Immigrant Family',
        rarity,
        description: 'Your family moved in search of a better future. Growing up as an outsider made adapting second nature.',
        iconName: 'Globe',
        gradient: getRarityGradient(rarity),
        borderColor: getRarityBorder(rarity),
        badgeText: getRarityBadgeText(rarity, 'IMMIGRANT FAMILY'),
        potentialBonus: rolledPotentialBonus,
        staminaBonus: staminaMap[rarity],
        extraNationalities: extraNats,
        perkTitle: 'Outsider Adaptability',
        perkDescription: '+5 Chemistry when joining a new club. +1 Potential every time you switch clubs (max +5 career). Represent multiple youth NTs.',
        perkEffects: [
          `+${staminaMap[rarity]} Stamina`,
          `Extra Nationalities (${extraNatCountMap[rarity]}): ${extraNatNames}`,
          'Eligible for Youth & Senior call-ups across dual nationalities',
          'Perk: +5 Chemistry upon joining a new club',
          'Perk: +1 Potential per new club transfer (max +5 career)',
        ],
      };
      break;
    }

    case 'raised_in_ghetto': {
      const strMap: Record<ParentCardRarity, number> = { bronze: 5, silver: 10, gold: 15, legendary: 30, iconic: 30 };
      const dribMap: Record<ParentCardRarity, number> = { bronze: 5, silver: 10, gold: 15, legendary: 30, iconic: 30 };

      card = {
        id,
        typeId,
        name: 'Raised in the Ghetto',
        rarity,
        description: 'Football was your escape from a difficult childhood (orphan/single parent), forging unmatched resilience.',
        iconName: 'Shield',
        gradient: getRarityGradient(rarity),
        borderColor: getRarityBorder(rarity),
        badgeText: getRarityBadgeText(rarity, 'RAISED IN GHETTO'),
        potentialBonus: rolledPotentialBonus,
        strengthBonus: strMap[rarity],
        dribblingBonus: dribMap[rarity],
        perkTitle: 'Street Survivor',
        perkDescription: 'If injured before Semi-Final, Final or Key Match: play 1 extra match before injury rest. +5 to ALL stats and +10 Composure during key matches.',
        perkEffects: [
          `+${strMap[rarity]} Strength`,
          `+${dribMap[rarity]} Dribbling`,
          'Perk: Play 1 additional match through injury before key finals',
          'Perk: +5 to ALL player stats & +10 Composure in Semi-Finals, Finals & Key Matches',
        ],
      };
      break;
    }

    case 'rich_parents': {
      const bizMap: Record<ParentCardRarity, { name: string; tier: number }> = {
        bronze: { name: 'Premium Sportswear Line', tier: 1 },
        silver: { name: 'Premium Sportswear Line', tier: 2 },
        gold: { name: 'Fitness Center Franchise', tier: 1 },
        legendary: { name: 'Tech Venture Capital Fund', tier: 1 },
        iconic: { name: 'Tech Venture Capital Fund', tier: 2 },
      };

      const cashMap: Record<ParentCardRarity, number> = {
        bronze: 1000000,
        silver: 2500000,
        gold: 4000000,
        legendary: 7500000,
        iconic: 12000000,
      };

      const startingCash = cashMap[rarity] || 4000000;
      const bizInfo = bizMap[rarity];

      card = {
        id,
        typeId,
        name: 'Rich Parents',
        rarity,
        description: 'Your family gave you access to elite academies, facilities, and significant initial wealth.',
        iconName: 'Coins',
        gradient: getRarityGradient(rarity),
        borderColor: getRarityBorder(rarity),
        badgeText: getRarityBadgeText(rarity, 'RICH PARENTS'),
        potentialBonus: rolledPotentialBonus,
        startingCashBonus: startingCash,
        startingBusinessName: bizInfo.name,
        startingBusinessTier: bizInfo.tier,
        perkTitle: 'Well Off',
        perkDescription: 'Growing up without adversity makes pressure harder: -10 Composure in key matches, +5% chance of negative Fame Cards.',
        perkEffects: [
          `Starting Cash: €${startingCash.toLocaleString()}`,
          `Starting Business: ${bizInfo.name} (Tier ${bizInfo.tier})`,
          'Perk: -10 Composure in Semi-Finals, Finals & Key Matches',
          'Perk: 5% greater chance of drawing negative Fame Cards',
        ],
      };
      break;
    }

    default:
      card = createParentCardInstance('average_family', 'bronze', playerNationalityCode, startingCityOrCountry);
      break;
  }
  }

  // Generate Family Identity & Heritage
  const extraNatName = card.extraNationalities && card.extraNationalities.length > 0 ? card.extraNationalities[0].name : '';
  const identity = generateParentFamilyIdentity(typeId, rarity, startingCityOrCountry, extraNatName);

  card.familyName = identity.familyName;
  card.familyDisplay = identity.familyDisplay;
  card.familyCountry = identity.familyCountry;
  card.isBrazilHeritage = identity.isBrazilHeritage;
  card.nameSuffix = identity.nameSuffix;

  card.inheritedHeightCm = inheritedHeightCm;
  card.perkEffects = [`Family Identity: ${identity.familyDisplay}`, heightEffect, ...(card.perkEffects || [])];
  return card;
}

/**
 * Draw 3 Parent Cards for Unique Career initial selection.
 * Directly draws from the player's persistent Unique Career Active Deck:
 * - Default: Bronze parent cards.
 * - Store Unlocked: Owned Silver, Gold, Legendary, and Iconic parent cards.
 * - Draw probability is strictly proportional to individual owned copies (no rarity/tier weighting).
 */
export function drawThreeParentCards(
  startingCityOrCountry: string = '',
  playerNationalityCode: string = ''
): ParentCardInstance[] {
  const drawnCustomCards = drawUniqueCareerCategoryCards('parents', 3);
  const cards: ParentCardInstance[] = [];

  for (const customCard of drawnCustomCards) {
    let typeId: ParentCardTypeId = 'average_family';
    let rarity: ParentCardRarity = 'bronze';

    if (customCard.id === 'default-parent-iconic_parent-iconic' || customCard.tier === 'iconic') {
      typeId = 'iconic_parent';
      rarity = 'iconic';
    } else {
      const parts = customCard.id.replace('default-parent-', '').split('-');
      const r = parts.pop() as ParentCardRarity;
      const t = parts.join('-') as ParentCardTypeId;
      if (r) rarity = r;
      if (t) typeId = t;
    }

    const card = createParentCardInstance(typeId, rarity, playerNationalityCode, startingCityOrCountry);
    if ((customCard as any).isNewCardGuaranteed) {
      card.isNewCardGuaranteed = true;
    }
    cards.push(card);
  }

  // Fallback safety if drawn cards are less than 3
  if (cards.length < 3) {
    const standardTypes: ParentCardTypeId[] = [
      'ex_pro_player',
      'average_family',
      'helicopter_parents',
      'immigrant_family',
      'raised_in_ghetto',
      'rich_parents',
    ];
    while (cards.length < 3) {
      const t = standardTypes[cards.length % standardTypes.length];
      cards.push(createParentCardInstance(t, 'bronze', playerNationalityCode, startingCityOrCountry));
    }
  }

  return cards;
}

// Backward compatibility alias: drawFourParentCards now defaults to streamlined 3-card draw
export const drawFourParentCards = drawThreeParentCards;

export function getRarityGradient(rarity: ParentCardRarity): string {
  switch (rarity) {
    case 'bronze':
      return 'from-amber-800 via-amber-900 to-slate-950';
    case 'silver':
      return 'from-slate-400 via-slate-600 to-slate-950';
    case 'gold':
      return 'from-amber-500 via-yellow-600 to-slate-950';
    case 'legendary':
      return 'from-purple-600 via-indigo-900 to-slate-950';
    case 'iconic':
      return 'from-amber-400 via-yellow-500 to-amber-700';
    default:
      return 'from-slate-800 to-slate-950';
  }
}

export function getRarityBorder(rarity: ParentCardRarity): string {
  switch (rarity) {
    case 'bronze':
      return 'border-amber-700/80';
    case 'silver':
      return 'border-slate-400/80';
    case 'gold':
      return 'border-yellow-400';
    case 'legendary':
      return 'border-purple-400';
    case 'iconic':
      return 'border-amber-300';
    default:
      return 'border-slate-700';
  }
}

export function getRarityBadgeText(rarity: ParentCardRarity, baseTitle: string): string {
  switch (rarity) {
    case 'bronze':
      return `🥉 BRONZE • ${baseTitle}`;
    case 'silver':
      return `🥈 SILVER • ${baseTitle}`;
    case 'gold':
      return `🥇 GOLD • ${baseTitle}`;
    case 'legendary':
      return `👑 LEGENDARY • ${baseTitle}`;
    case 'iconic':
      return `⭐ ICONIC • ${baseTitle}`;
  }
}

/**
 * Converts a ParentCardInstance into a CustomCard for the Card Deck Editor.
 */
export function convertParentInstanceToCustomCard(card: ParentCardInstance): CustomCard {
  const modifiers: CardModifier[] = [];

  if (card.weakFootBonus) {
    modifiers.push({
      id: `mod-wf-${card.id}`,
      target: 'stat_weak_foot',
      operation: 'add',
      valueType: 'flat',
      value: card.weakFootBonus,
    });
  }
  if (card.freeStatPointsBonus || card.freeStatPoints) {
    modifiers.push({
      id: `mod-fsp-${card.id}`,
      target: 'stat_free_points',
      operation: 'add',
      valueType: 'flat',
      value: card.freeStatPointsBonus || card.freeStatPoints || 0,
    });
  }
  if (card.fameBonus) {
    modifiers.push({
      id: `mod-fame-${card.id}`,
      target: 'stat_fame',
      operation: 'add',
      valueType: 'flat',
      value: card.fameBonus,
    });
  }
  if (card.potentialBonus) {
    modifiers.push({
      id: `mod-pot-${card.id}`,
      target: 'stat_potential',
      operation: 'add',
      valueType: 'flat',
      value: card.potentialBonus,
    });
  }
  if (card.composureBonus) {
    modifiers.push({
      id: `mod-comp-${card.id}`,
      target: 'stat_composure',
      operation: 'add',
      valueType: 'flat',
      value: card.composureBonus,
    });
  }
  if (card.staminaBonus) {
    modifiers.push({
      id: `mod-sta-${card.id}`,
      target: 'stat_stamina',
      operation: 'add',
      valueType: 'flat',
      value: card.staminaBonus,
    });
  }
  if (card.strengthBonus) {
    modifiers.push({
      id: `mod-str-${card.id}`,
      target: 'stat_strength',
      operation: 'add',
      valueType: 'flat',
      value: card.strengthBonus,
    });
  }
  if (card.dribblingBonus) {
    modifiers.push({
      id: `mod-drib-${card.id}`,
      target: 'stat_dribbling',
      operation: 'add',
      valueType: 'flat',
      value: card.dribblingBonus,
    });
  }
  if (card.reactionsBonus) {
    modifiers.push({
      id: `mod-reac-${card.id}`,
      target: 'stat_reaction',
      operation: 'add',
      valueType: 'flat',
      value: card.reactionsBonus,
    });
  }
  if (card.positioningBonus) {
    modifiers.push({
      id: `mod-pos-${card.id}`,
      target: 'stat_position',
      operation: 'add',
      valueType: 'flat',
      value: card.positioningBonus,
    });
  }
  if (card.extraNationalities && card.extraNationalities.length > 0) {
    modifiers.push({
      id: `mod-nat-${card.id}`,
      target: 'extra_nationalities',
      operation: 'add',
      valueType: 'flat',
      value: card.extraNationalities.length,
    });
  }
  if (card.startingCashBonus) {
    modifiers.push({
      id: `mod-cash-${card.id}`,
      target: 'starting_cash',
      operation: 'add',
      valueType: 'flat',
      value: card.startingCashBonus,
    });
  }
  if (card.startingBusinessName) {
    modifiers.push({
      id: `mod-biz-${card.id}`,
      target: 'starting_business',
      operation: 'add',
      valueType: 'flat',
      value: card.startingBusinessTier || 1,
      perkName: `${card.startingBusinessName} (Tier ${card.startingBusinessTier || 1})`,
    });
  }
  if (card.managerRating) {
    modifiers.push({
      id: `mod-mgr-${card.id}`,
      target: 'manager_quality',
      operation: 'add',
      valueType: 'flat',
      value: card.managerRating,
      perkName: card.managerName || 'Parent Manager',
    });
  }

  // Perk modifier
  if (card.perkTitle && card.perkDescription) {
    modifiers.push({
      id: `mod-perk-${card.id}`,
      target: 'perk',
      operation: 'add',
      valueType: 'flat',
      value: 1,
      perkName: `${card.perkTitle}: ${card.perkDescription}`,
      perkAction: 'add',
    });
  }

  return {
    id: `default-parent-${card.typeId}-${card.rarity}`,
    name: `${card.name} (${card.rarity === 'iconic' ? '⭐ ICONIC' : card.rarity.toUpperCase()})`,
    category: 'parents',
    tier: card.rarity as CustomCardTier,
    description: card.description,
    modifiers,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generates all 25 default Parent CustomCards for the Card Deck Editor.
 */
export function generateDefaultParentCustomCards(): CustomCard[] {
  const customCards: CustomCard[] = [];
  const standardTypes: ParentCardTypeId[] = [
    'ex_pro_player',
    'average_family',
    'helicopter_parents',
    'immigrant_family',
    'raised_in_ghetto',
    'rich_parents',
  ];
  const rarities: ParentCardRarity[] = ['bronze', 'silver', 'gold', 'legendary'];

  // Add standard parent cards for all 4 rarities
  standardTypes.forEach((typeId) => {
    rarities.forEach((rarity) => {
      const card = createParentCardInstance(typeId, rarity);
      customCards.push(convertParentInstanceToCustomCard(card));
    });
  });

  // Add Iconic Parent card
  const iconicCard = createParentCardInstance('iconic_parent', 'iconic');
  customCards.push(convertParentInstanceToCustomCard(iconicCard));

  return customCards;
}

/**
 * Returns all available Parent Cards sorted strictly from HIGHEST to LOWEST tier
 * (Iconic -> Legendary -> Gold -> Silver -> Bronze).
 */
export function getAllAvailableParentCards(
  startingCityOrCountry?: string,
  playerNationalityCode?: string
): ParentCardInstance[] {
  const cards: ParentCardInstance[] = [];

  // 1. Iconic Parent
  cards.push(createParentCardInstance('iconic_parent', 'iconic', startingCityOrCountry, playerNationalityCode));

  // 2. Standard parent types
  const standardTypes: ParentCardTypeId[] = [
    'ex_pro_player',
    'rich_parents',
    'raised_in_ghetto',
    'immigrant_family',
    'helicopter_parents',
    'average_family',
  ];

  const rarityOrder: ParentCardRarity[] = ['legendary', 'gold', 'silver', 'bronze'];

  rarityOrder.forEach((rarity) => {
    standardTypes.forEach((typeId) => {
      cards.push(createParentCardInstance(typeId, rarity, startingCityOrCountry, playerNationalityCode));
    });
  });

  return cards;
}

/**
 * Calculates Fame gained with bonuses applied (e.g. +20% from Iconic Parent Card)
 * Applies to match fame, goals, assists, awards, titles, milestones, etc.
 */
export function calculateFameGainWithPerks(baseGain: number, player?: Partial<PlayerCardData>): number {
  if (!baseGain || baseGain <= 0) return baseGain || 0;
  if (!player) return baseGain;

  const isIconic =
    player.equippedParentCard?.typeId === 'iconic_parent' ||
    player.activePerkIds?.includes('built_for_greatness') ||
    player.activePerkIds?.includes('iconic_parent');

  if (isIconic) {
    return Math.round(baseGain * 1.20);
  }
  return baseGain;
}

/**
 * Applies Fame gain to player while respecting 0–1000 bounds and Iconic Parent +20% bonus
 */
export function applyFameToPlayer(currentFame: number = 0, gainedFame: number, player?: Partial<PlayerCardData>): number {
  const actualGain = calculateFameGainWithPerks(gainedFame, player);
  return Math.min(1000, Math.max(0, currentFame + actualGain));
}
