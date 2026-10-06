import { PlayerCardData } from '../types';
import { ProContractOffer } from '../types/streetCards';

export interface IntroNarrative {
  category: 'domestic_d1' | 'domestic_d2' | 'foreign_d1' | 'foreign_d2' | 'sa_to_eu_d1' | 'sa_to_eu_d2';
  categoryLabel: string;
  variant: 'A' | 'B';
  variantLabel: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeBg: string;
  narrativeText: string;
}

const IS_SOUTH_AMERICAN_COUNTRY = (cName?: string, cCode?: string): boolean => {
  const name = (cName || '').toLowerCase();
  const code = (cCode || '').toLowerCase();
  return (
    name.includes('argentina') ||
    name.includes('brazil') ||
    code === 'arg' ||
    code === 'bra'
  );
};

const IS_EUROPEAN_COUNTRY = (cName?: string, cCode?: string, isEuFlag?: boolean): boolean => {
  if (isEuFlag !== undefined) return isEuFlag;
  const name = (cName || '').toLowerCase();
  const code = (cCode || '').toLowerCase();
  return (
    name.includes('england') ||
    name.includes('spain') ||
    name.includes('france') ||
    name.includes('germany') ||
    name.includes('italy') ||
    name.includes('portugal') ||
    name.includes('netherlands') ||
    ['eng', 'esp', 'fra', 'ger', 'ita', 'por', 'ned'].includes(code)
  );
};

/**
 * GENERATES DYNAMIC FIRST CONTRACT INTRODUCTION NARRATIVE
 * Evaluates origin, target country, league tier, and South America -> Europe status.
 * Supports distinct Variant A and Variant B for every scenario category.
 */
export function generateFirstContractIntro(
  player: PlayerCardData,
  offer: ProContractOffer,
  preferredVariant: 'A' | 'B' = 'A'
): IntroNarrative {
  const pCountry = player.clubCountry || player.country || player.nationality?.name || 'England';
  const cCountry = offer.countryName || 'England';
  const cCode = offer.countryCode || 'ENG';
  const isTier1 = offer.leagueTier === 1;

  const isDomestic = pCountry.toLowerCase() === cCountry.toLowerCase() ||
    (cCode.toLowerCase() === 'eng' && pCountry.toLowerCase().includes('england')) ||
    (cCode.toLowerCase() === 'esp' && pCountry.toLowerCase().includes('spain'));

  const isSA = IS_SOUTH_AMERICAN_COUNTRY(pCountry, player.nationality?.code);
  const isEuropeClub = IS_EUROPEAN_COUNTRY(cCountry, cCode, offer.isEuropean);

  let category: IntroNarrative['category'] = 'domestic_d1';
  let categoryLabel = 'First-Division Domestic';

  if (isSA && isEuropeClub) {
    category = isTier1 ? 'sa_to_eu_d1' : 'sa_to_eu_d2';
    categoryLabel = isTier1 ? 'South America → European Top Tier' : 'South America → European Second Tier';
  } else if (isDomestic) {
    category = isTier1 ? 'domestic_d1' : 'domestic_d2';
    categoryLabel = isTier1 ? 'Domestic First Division' : 'Domestic Second Division';
  } else {
    category = isTier1 ? 'foreign_d1' : 'foreign_d2';
    categoryLabel = isTier1 ? 'Foreign Top Tier Opportunity' : 'Foreign Second Tier Opportunity';
  }

  // NARRATIVE VARIANT DICTIONARY
  const narratives: Record<IntroNarrative['category'], { A: IntroNarrative; B: IntroNarrative }> = {
    // 1. DOMESTIC FIRST DIVISION
    domestic_d1: {
      A: {
        category: 'domestic_d1',
        categoryLabel: 'Domestic First Division',
        variant: 'A',
        variantLabel: 'Home Turf Dream',
        title: `THE FIRST DIVISION DREAM WITH ${offer.clubName.toUpperCase()}`,
        subtitle: `Stepping straight into ${offer.leagueName} elite football.`,
        badgeText: `FIRST DIVISION DOMESTIC • ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        narrativeText: `Signing your first professional contract with ${offer.clubName} is the culmination of years of relentless academy sacrifice.

You step into the stadium corridor and run your hand across the official team badge. You are no longer watching from the stands—you are officially registered in ${offer.leagueName}.

Manager ${offer.managerName || 'Head Coach'} has outlined your immediate squad role as ${offer.initialSquadDestination || 'First Team'} (${offer.expectedRole || 'Starter'}).

Your country's top tier awaits. The noise of home supporters will follow every pass you make.`,
      },
      B: {
        category: 'domestic_d1',
        categoryLabel: 'Domestic First Division',
        variant: 'B',
        variantLabel: 'Spotlight & Pressure',
        title: `NATIONAL SPOTLIGHT AT ${offer.clubName.toUpperCase()}`,
        subtitle: `High expectations in ${offer.leagueName}.`,
        badgeText: `FIRST DIVISION DOMESTIC • ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        narrativeText: `The ink dries on your professional contract with ${offer.clubName}. Camera flashes fill the press room as local journalists welcome the new domestic prodigy.

Starting your professional career in ${offer.leagueName} means there is no quiet transition period. Every mistake will be analyzed on national television.

Assigned to the ${offer.initialSquadDestination || 'First Team'} setup under manager ${offer.managerName}, you are expected to operate as a ${offer.tacticalRole || 'Key Attacker'}.

The pressure is immediate, but so is the opportunity to make history at home.`,
      },
    },

    // 2. DOMESTIC SECOND DIVISION
    domestic_d2: {
      A: {
        category: 'domestic_d2',
        categoryLabel: 'Domestic Second Division',
        variant: 'A',
        variantLabel: 'Grind & Promotion Pursuit',
        title: `THE BATTLEGROUND AT ${offer.clubName.toUpperCase()}`,
        subtitle: `Starting professional football in ${offer.leagueName}.`,
        badgeText: `SECOND DIVISION DOMESTIC • ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        narrativeText: `You sign your first professional deal with ${offer.clubName} in ${offer.leagueName}.

Second-tier domestic football is famously grueling. Technical quality is tested by intense physicality, packed match schedules, and passionate local derbies.

Manager ${offer.managerName} brings you into the ${offer.initialSquadDestination || 'Reserves'} setup, emphasizing tactical discipline and work ethic.

This is where true professional character is forged. Earn your minutes and help push the club toward top-flight promotion.`,
      },
      B: {
        category: 'domestic_d2',
        categoryLabel: 'Domestic Second Division',
        variant: 'B',
        variantLabel: 'Proving Ground',
        title: `EARNING YOUR STRIPES WITH ${offer.clubName.toUpperCase()}`,
        subtitle: `A solid launchpad in ${offer.leagueName}.`,
        badgeText: `SECOND DIVISION DOMESTIC • ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        narrativeText: `Welcome to professional football at ${offer.clubName}.

Beginning in ${offer.leagueName} gives you a vital platform to gain men's football experience without being overwhelmed by immediate top-flight media circuses.

Manager ${offer.managerName} sees you as a key piece in their tactical blueprint for ${offer.expectedPosition}. You begin assigned to the ${offer.initialSquadDestination || 'First Team'} unit.

Prove yourself in this tough league, and the eyes of the football world will quickly follow.`,
      },
    },

    // 3. FOREIGN FIRST DIVISION
    foreign_d1: {
      A: {
        category: 'foreign_d1',
        categoryLabel: 'Foreign First Division',
        variant: 'A',
        variantLabel: 'International Passport',
        title: `NEW HORIZONS AT ${offer.clubName.toUpperCase()} (${offer.countryName.toUpperCase()})`,
        subtitle: `Crossing borders for ${offer.leagueName} top-flight football.`,
        badgeText: `FOREIGN TOP TIER • ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
        narrativeText: `Pack your bags. You have accepted a professional contract offer from ${offer.clubName} in ${offer.countryName}.

Leaving home as a young footballer is an intense rite of passage. You enter a brand new footballing culture, a foreign language, and high expectations for an overseas signing.

Assigned to ${offer.initialSquadDestination || 'First Team'} squad duties under manager ${offer.managerName}, you are trusted to bring distinct qualities to ${offer.leagueName}.

Adapt quickly off the pitch, and let your football do the talking on it.`,
      },
      B: {
        category: 'foreign_d1',
        categoryLabel: 'Foreign First Division',
        variant: 'B',
        variantLabel: 'The Overseas Pioneer',
        title: `INTERNATIONAL STAGE AT ${offer.clubName.toUpperCase()}`,
        subtitle: `A bold leap into ${offer.countryName}'s top division.`,
        badgeText: `FOREIGN TOP TIER • ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
        narrativeText: `Your talent has surpassed national borders. ${offer.clubName} has officially secured your signature to compete in ${offer.leagueName}.

In ${offer.countryName}, foreign recruits are scrutinized closely. The local fans expect foreign signings to elevate the team instantly.

Manager ${offer.managerName} has crafted a tactical role for you in the ${offer.initialSquadDestination || 'First Team'} as a ${offer.tacticalRole || 'Playmaker'}.

Embrace the new culture, overcome the language barrier, and establish yourself on European/international turf.`,
      },
    },

    // 4. FOREIGN SECOND DIVISION
    foreign_d2: {
      A: {
        category: 'foreign_d2',
        categoryLabel: 'Foreign Second Division',
        variant: 'A',
        variantLabel: 'Hard Working Foreigner',
        title: `THE OVERSEAS CLIMB WITH ${offer.clubName.toUpperCase()}`,
        subtitle: `Forging a career in ${offer.leagueName} (${offer.countryName}).`,
        badgeText: `FOREIGN SECOND TIER • ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
        narrativeText: `You sign professionally with ${offer.clubName} in ${offer.countryName}'s ${offer.leagueName}.

Joining a second-tier club abroad requires grit. You will face physical league battles, unfamiliar weather, and the challenge of settling into a new society.

Manager ${offer.managerName} places you in the ${offer.initialSquadDestination || 'Reserves'} squad to build match fitness and tactical familiarity.

Use this international second-tier platform to prove your quality and build a path to top-flight European/international glory.`,
      },
      B: {
        category: 'foreign_d2',
        categoryLabel: 'Foreign Second Division',
        variant: 'B',
        variantLabel: 'Unlocking New Potential',
        title: `ADAPTATION & AMBITION AT ${offer.clubName.toUpperCase()}`,
        subtitle: `Building a foundation in ${offer.countryName}.`,
        badgeText: `FOREIGN SECOND TIER • ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
        narrativeText: `A new country, a new league, and your first professional contract. ${offer.clubName} welcomes you to ${offer.leagueName}.

Starting in ${offer.countryName}'s competitive second division gives you a unique environment to develop specialized tactical versatility.

Manager ${offer.managerName} values your work rate and technical profile as a ${offer.expectedPosition}.

Show the club that signing an international youngster was their best decision of the year.`,
      },
    },

    // 5. SOUTH AMERICA -> EUROPE FIRST DIVISION
    sa_to_eu_d1: {
      A: {
        category: 'sa_to_eu_d1',
        categoryLabel: 'South America → European Top Tier',
        variant: 'A',
        variantLabel: 'Atlantic Crossing to Greatness',
        title: `SOUTH AMERICAN PRODIGY AT ${offer.clubName.toUpperCase()}`,
        subtitle: `Transatlantic transfer to ${offer.leagueName} European football.`,
        badgeText: `TRANSATLANTIC ELITE • SOUTH AMERICA → ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
        narrativeText: `The dream of every young South American footballer becomes reality. You step off the plane in Europe and put pen to paper with ${offer.clubName}.

From the street pitches and raw passion of South America to the elite tactical cathedrals of ${offer.leagueName}, this is the ultimate leap in world football.

Manager ${offer.managerName} integrated you directly into the ${offer.initialSquadDestination || 'First Team'} setup, eager to unleash your innate South American flare, dribbling, and competitive hunger.

European football is watching. Show them the magic of South American football.`,
      },
      B: {
        category: 'sa_to_eu_d1',
        categoryLabel: 'South America → European Top Tier',
        variant: 'B',
        variantLabel: 'Generational Promise',
        title: `LATIN FLARE IN EUROPE WITH ${offer.clubName.toUpperCase()}`,
        subtitle: `Joining ${offer.countryName}'s top flight in ${offer.leagueName}.`,
        badgeText: `TRANSATLANTIC ELITE • SOUTH AMERICA → ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
        narrativeText: `Scouts from Europe tracked your raw talent back home. Today, ${offer.clubName} officially completes your transatlantic contract signing.

Crossing the Atlantic to join a European top-flight giant in ${offer.leagueName} carries massive prestige and family pride back home in Argentina/Brazil.

Manager ${offer.managerName} envisions you mastering the ${offer.tacticalRole || 'Inverted Winger'} role in the ${offer.initialSquadDestination || 'First Team'}.

Bring your street-forged agility, fearless tempo, and South American grit to European pitch lights.`,
      },
    },

    // 6. SOUTH AMERICA -> EUROPE SECOND DIVISION
    sa_to_eu_d2: {
      A: {
        category: 'sa_to_eu_d2',
        categoryLabel: 'South America → European Second Tier',
        variant: 'A',
        variantLabel: 'European Launchpad',
        title: `FIRST EUROPEAN FOOTPRINT AT ${offer.clubName.toUpperCase()}`,
        subtitle: `Beginning European journey in ${offer.leagueName}.`,
        badgeText: `EUROPEAN LAUNCHPAD • SOUTH AMERICA → ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
        narrativeText: `Your journey to European football begins in the fiercely competitive second tier with ${offer.clubName} in ${offer.countryName}.

Leaving South America for a European second division is a classic path taken by world-class legends who forged their European adaptability step-by-step.

Assigned to the ${offer.initialSquadDestination || 'Reserves'} setup under manager ${offer.managerName}, you will adapt to European tactical tempo and cold weather conditions.

Master this stepping stone, and top-flight European clubs will soon line up for your signature.`,
      },
      B: {
        category: 'sa_to_eu_d2',
        categoryLabel: 'South America → European Second Tier',
        variant: 'B',
        variantLabel: 'Relentless Ambition',
        title: `FORGING A EUROPEAN LEGACY WITH ${offer.clubName.toUpperCase()}`,
        subtitle: `Conquering ${offer.leagueName} in ${offer.countryName}.`,
        badgeText: `EUROPEAN LAUNCHPAD • SOUTH AMERICA → ${offer.countryName.toUpperCase()}`,
        badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
        narrativeText: `From South American youth pitches to ${offer.clubName} in ${offer.countryName}.

This second-division contract gives you the perfect competitive furnace to refine your physical stamina while showcasing your South American technical superiority.

Manager ${offer.managerName} welcomes you to the ${offer.initialSquadDestination || 'First Team'} squad as a ${offer.expectedPosition}.

Write your first European chapter with passion and determination.`,
      },
    },
  };

  const categoryNarratives = narratives[category];
  return preferredVariant === 'B' ? categoryNarratives.B : categoryNarratives.A;
}
