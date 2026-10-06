import { PlayerConfig } from '../types';
import { YouthLeagueStanding } from '../types/youthLeague';

export type MatchImportanceCategory = 'DEFINITIVE' | 'IMPORTANT' | 'REGULAR';
export type KeyMatchPlayMode = 'slow' | 'decisive' | 'finals_only';

export interface DerbyDefinition {
  id: string;
  name: string;
  shortName: string;
  clubA: string[]; // List of aliases for club A
  clubB: string[]; // List of aliases for club B
  country: string;
  description: string;
}

/**
 * Traditional Derby & Major Rivalry Database
 */
export const MAJOR_DERBIES_DATABASE: DerbyDefinition[] = [
  // SPAIN
  {
    id: 'el_clasico',
    name: 'El Clásico',
    shortName: 'El Clásico 🔥',
    clubA: ['real madrid', 'madrid', 'los blancos', 'rmcf'],
    clubB: ['barcelona', 'fc barcelona', 'barca', 'blaugrana'],
    country: 'Spain',
    description: 'The biggest rivalry in world football between Real Madrid and FC Barcelona.',
  },
  {
    id: 'madrid_derby',
    name: 'Derbi Madrileño (Madrid Derby)',
    shortName: 'Madrid Derby ⚔️',
    clubA: ['real madrid', 'madrid'],
    clubB: ['atletico madrid', 'atletico de madrid', 'atlético madrid', 'atleti', 'colchoneros'],
    country: 'Spain',
    description: 'The fierce cross-city clash of the Spanish capital.',
  },
  {
    id: 'derbi_barcelones',
    name: 'Derbi Barcelonés',
    shortName: 'Barcelona Derby 🛡️',
    clubA: ['barcelona', 'fc barcelona'],
    clubB: ['espanyol', 'rcd espanyol'],
    country: 'Spain',
    description: 'Catalan derby between FC Barcelona and RCD Espanyol.',
  },
  {
    id: 'gran_derbi',
    name: 'El Gran Derbi (Seville Derby)',
    shortName: 'Seville Derby 🔥',
    clubA: ['sevilla', 'sevilla fc'],
    clubB: ['real betis', 'betis'],
    country: 'Spain',
    description: 'The passionate and heated battle of Andalusia.',
  },
  {
    id: 'basque_derby',
    name: 'Basque Derby',
    shortName: 'Basque Derby 🛡️',
    clubA: ['athletic bilbao', 'athletic club'],
    clubB: ['real sociedad', 'la real'],
    country: 'Spain',
    description: 'Historic Basque Country derby between Athletic Club and Real Sociedad.',
  },

  // ENGLAND
  {
    id: 'north_london_derby',
    name: 'North London Derby',
    shortName: 'North London Derby ⚔️',
    clubA: ['arsenal', 'gunners'],
    clubB: ['tottenham', 'tottenham hotspur', 'spurs'],
    country: 'England',
    description: 'Fierce North London rivalry between Arsenal and Tottenham Hotspur.',
  },
  {
    id: 'london_derby_arsenal_chelsea',
    name: 'London Derby (Arsenal vs Chelsea)',
    shortName: 'London Derby ⚡',
    clubA: ['arsenal'],
    clubB: ['chelsea', 'chelsea fc', 'blues'],
    country: 'England',
    description: 'Heavyweight clash between London powerhouses Arsenal and Chelsea.',
  },
  {
    id: 'london_derby_chelsea_spurs',
    name: 'London Derby (Chelsea vs Tottenham)',
    shortName: 'London Derby ⚡',
    clubA: ['chelsea'],
    clubB: ['tottenham', 'spurs'],
    country: 'England',
    description: 'Bad-tempered rivalry between West London Chelsea and North London Tottenham.',
  },
  {
    id: 'manchester_derby',
    name: 'Manchester Derby',
    shortName: 'Manchester Derby ⚔️',
    clubA: ['manchester city', 'man city', 'city', 'citizens'],
    clubB: ['manchester united', 'man united', 'man utd', 'united', 'red devils'],
    country: 'England',
    description: 'The battle for Manchester bragging rights between City and United.',
  },
  {
    id: 'north_west_derby',
    name: 'North West Derby',
    shortName: 'North West Derby 🏆',
    clubA: ['liverpool', 'liverpool fc', 'reds'],
    clubB: ['manchester united', 'man united', 'man utd', 'united'],
    country: 'England',
    description: 'The most decorated English rivalry between Liverpool and Manchester United.',
  },
  {
    id: 'merseyside_derby',
    name: 'Merseyside Derby',
    shortName: 'Merseyside Derby 🛡️',
    clubA: ['liverpool', 'liverpool fc'],
    clubB: ['everton', 'everton fc', 'toffees'],
    country: 'England',
    description: 'The historic Merseyside derby across Stanley Park in Liverpool.',
  },
  {
    id: 'city_liverpool_rivalry',
    name: 'Manchester City vs Liverpool Modern Title Rivalry',
    shortName: 'City vs Liverpool ⚔️',
    clubA: ['manchester city', 'man city', 'city', 'citizens'],
    clubB: ['liverpool', 'liverpool fc', 'reds'],
    country: 'England',
    description: 'The explosive Premier League title rivalry between Manchester City and Liverpool.',
  },

  // ARGENTINA
  {
    id: 'superclasico',
    name: 'El Superclásico',
    shortName: 'Superclásico 🔥',
    clubA: ['river plate', 'river', 'los millonarios'],
    clubB: ['boca juniors', 'boca', 'xeneize'],
    country: 'Argentina',
    description: 'The world-famous explosive Buenos Aires Superclásico between River Plate and Boca Juniors.',
  },
  {
    id: 'clasico_avellaneda',
    name: 'Clásico de Avellaneda',
    shortName: 'Avellaneda Derby ⚔️',
    clubA: ['racing club', 'racing', 'la academia'],
    clubB: ['independiente', 'cai', 'el rojo'],
    country: 'Argentina',
    description: 'The intense Avellaneda neighborhood rivalry between Racing and Independiente separated by just 300 meters.',
  },
  {
    id: 'clasico_rosarino',
    name: 'Clásico Rosarino',
    shortName: 'Rosario Derby 🔥',
    clubA: ['rosario central', 'central'],
    clubB: ['newells', 'newell\'s old boys', 'newell\'s', 'nob'],
    country: 'Argentina',
    description: 'Fervent Argentine rivalry in Rosario between Rosario Central and Newell\'s.',
  },
  {
    id: 'clasico_porteno',
    name: 'Clásico Porteño',
    shortName: 'Clásico Porteño 🛡️',
    clubA: ['san lorenzo', 'cuervo'],
    clubB: ['huracan', 'huracán', 'globo'],
    country: 'Argentina',
    description: 'Historic Buenos Aires derby between San Lorenzo and Huracán.',
  },

  // ITALY
  {
    id: 'derby_madonnina',
    name: 'Derby della Madonnina (Milan Derby)',
    shortName: 'Milan Derby ⚔️',
    clubA: ['inter', 'inter milan', 'internazionale', 'nerazzurri'],
    clubB: ['milan', 'ac milan', 'rossoneri'],
    country: 'Italy',
    description: 'The iconic San Siro derby between Inter Milan and AC Milan.',
  },
  {
    id: 'derby_d_italia',
    name: 'Derby d\'Italia',
    shortName: 'Derby d\'Italia 🏆',
    clubA: ['juventus', 'juve', 'bianconeri'],
    clubB: ['inter', 'inter milan', 'internazionale'],
    country: 'Italy',
    description: 'Italy\'s most prestigious historic rivalry between Juventus and Inter.',
  },
  {
    id: 'derby_della_capitale',
    name: 'Derby della Capitale (Rome Derby)',
    shortName: 'Rome Derby 🔥',
    clubA: ['roma', 'as roma', 'giallorossi'],
    clubB: ['lazio', 'ss lazio', 'biancocelesti'],
    country: 'Italy',
    description: 'The heated battle for the Italian capital in the Stadio Olimpico.',
  },
  {
    id: 'derby_della_mole',
    name: 'Derby della Mole (Turin Derby)',
    shortName: 'Turin Derby 🛡️',
    clubA: ['juventus', 'juve'],
    clubB: ['torino', 'torino fc', 'granata'],
    country: 'Italy',
    description: 'The Turin city derby between Juventus and Torino.',
  },

  // FRANCE
  {
    id: 'le_classique',
    name: 'Le Classique',
    shortName: 'Le Classique 🔥',
    clubA: ['paris saint-germain', 'paris sg', 'psg'],
    clubB: ['marseille', 'olympique de marseille', 'om'],
    country: 'France',
    description: 'The bitter cultural and sporting clash between Paris Saint-Germain and Marseille.',
  },
  {
    id: 'derby_rhone_alpes',
    name: 'Derby Rhône-Alpes',
    shortName: 'Rhône-Alpes Derby ⚔️',
    clubA: ['lyon', 'olympique lyonnais', 'ol'],
    clubB: ['saint-etienne', 'saint-Étienne', 'asse', 'les verts'],
    country: 'France',
    description: 'Historic French regional derby between Lyon and Saint-Étienne.',
  },

  // GERMANY
  {
    id: 'der_klassiker',
    name: 'Der Klassiker',
    shortName: 'Der Klassiker 🏆',
    clubA: ['bayern', 'bayern munich', 'bayern münchen', 'fc bayern'],
    clubB: ['borussia dortmund', 'dortmund', 'bvb'],
    country: 'Germany',
    description: 'Germany\'s premier football rivalry between Bayern Munich and Borussia Dortmund.',
  },
  {
    id: 'revierderby',
    name: 'Revierderby (Ruhr Derby)',
    shortName: 'Revierderby 🔥',
    clubA: ['borussia dortmund', 'dortmund', 'bvb'],
    clubB: ['schalke', 'schalke 04', 's04'],
    country: 'Germany',
    description: 'The intense Ruhr valley industrial rivalry between Dortmund and Schalke 04.',
  },

  // PORTUGAL
  {
    id: 'o_classico_portugal',
    name: 'O Clássico',
    shortName: 'O Clássico ⚔️',
    clubA: ['benfica', 'sl benfica', 'as aguias'],
    clubB: ['porto', 'fc porto', 'os dragoes'],
    country: 'Portugal',
    description: 'Portugal\'s marquee rivalry between Lisbon\'s Benfica and northern giant FC Porto.',
  },
  {
    id: 'derby_de_lisboa',
    name: 'Derbi de Lisboa',
    shortName: 'Lisbon Derby 🛡️',
    clubA: ['benfica', 'sl benfica'],
    clubB: ['sporting', 'sporting cp', 'sporting lisbon', 'leoes'],
    country: 'Portugal',
    description: 'The classic battle of Lisbon between Benfica and Sporting CP.',
  },

  // BRAZIL
  {
    id: 'fla_flu',
    name: 'Fla-Flu (Clássico das Multidões)',
    shortName: 'Fla-Flu 🔥',
    clubA: ['flamengo', 'cr flamengo', 'mengao'],
    clubB: ['fluminense', 'fluminense fc', 'tricolor'],
    country: 'Brazil',
    description: 'Rio de Janeiro\'s legendary Maracanã showdown between Flamengo and Fluminense.',
  },
  {
    id: 'derby_paulista',
    name: 'Derby Paulista',
    shortName: 'Derby Paulista ⚔️',
    clubA: ['corinthians', 'sc corinthians', 'timao'],
    clubB: ['palmeiras', 'se palmeiras', 'verdao'],
    country: 'Brazil',
    description: 'São Paulo\'s most fiercely contested derby between Corinthians and Palmeiras.',
  },
  {
    id: 'gre_nal',
    name: 'Gre-Nal',
    shortName: 'Gre-Nal 🔥',
    clubA: ['gremio', 'grêmio', 'imortal'],
    clubB: ['internacional', 'inter de porto alegre', 'colorado'],
    country: 'Brazil',
    description: 'The passionate Porto Alegre derby between Grêmio and Internacional.',
  },
  {
    id: 'classico_dos_milhoes',
    name: 'Clássico dos Milhões',
    shortName: 'Clássico dos Milhões ⚔️',
    clubA: ['flamengo', 'cr flamengo'],
    clubB: ['vasco', 'vasco da gama', 'cr vasco da gama'],
    country: 'Brazil',
    description: 'Rio de Janeiro\'s most attended derby between Flamengo and Vasco da Gama.',
  },

  // SAUDI ARABIA
  {
    id: 'riyadh_derby',
    name: 'Riyadh Derby',
    shortName: 'Riyadh Derby ⚔️',
    clubA: ['al hilal', 'al-hilal', 'hilal'],
    clubB: ['al nassr', 'al-nassr', 'nassr'],
    country: 'Saudi Arabia',
    description: 'The monumental capital rivalry of Saudi Arabia between Al-Hilal and Al-Nassr.',
  },
  {
    id: 'saudi_el_clasico',
    name: 'Saudi El Clásico',
    shortName: 'Saudi Clásico 🔥',
    clubA: ['al hilal', 'al-hilal', 'hilal'],
    clubB: ['al ittihad', 'al-ittihad', 'ittihad'],
    country: 'Saudi Arabia',
    description: 'The premier Saudi clash between Riyadh giant Al-Hilal and Jeddah powerhouse Al-Ittihad.',
  },
  {
    id: 'jeddah_derby',
    name: 'Jeddah Derby',
    shortName: 'Jeddah Derby 🛡️',
    clubA: ['al ittihad', 'al-ittihad', 'ittihad'],
    clubB: ['al ahli', 'al-ahli', 'ahli'],
    country: 'Saudi Arabia',
    description: 'The heated Red Sea coast battle between Al-Ittihad and Al-Ahli.',
  },

  // TURKEY
  {
    id: 'intercontinental_derby',
    name: 'Intercontinental Derby',
    shortName: 'Istanbul Derby 🔥',
    clubA: ['galatasaray', 'gala'],
    clubB: ['fenerbahce', 'fenerbahçe', 'fener'],
    country: 'Turkey',
    description: 'The electric cross-continental Istanbul clash across the Bosphorus strait.',
  },

  // NETHERLANDS & SCOTLAND
  {
    id: 'de_klassieker',
    name: 'De Klassieker',
    shortName: 'De Klassieker ⚔️',
    clubA: ['ajax', 'afc ajax'],
    clubB: ['feyenoord', 'feyenoord rotterdam'],
    country: 'Netherlands',
    description: 'The Dutch rivalry between Amsterdam (Ajax) and Rotterdam (Feyenoord).',
  },
  {
    id: 'old_firm',
    name: 'Old Firm Derby',
    shortName: 'Old Firm ⚔️',
    clubA: ['celtic', 'celtic fc'],
    clubB: ['rangers', 'rangers fc'],
    country: 'Scotland',
    description: 'The historic Glasgow derby between Celtic and Rangers.',
  },
];

/**
 * Normalizes team strings for fuzzy alias checking
 */
export function cleanTeamName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/u\d+/gi, '')
    .replace(/academy|youth|reserves|under \d+|deportivo|fc|cf|sc|sl|afc|cd|rcd|ca/gi, '')
    .replace(/[^\w\s]/gi, '')
    .trim();
}

/**
 * Checks whether two team names match a known Derby rivalry or a custom rival configured in team editor
 */
export function checkDerbyMatchup(
  teamAName: string,
  teamBName: string,
  teamARivals?: string[],
  teamBRivals?: string[]
): DerbyDefinition | null {
  const normA = cleanTeamName(teamAName);
  const normB = cleanTeamName(teamBName);

  if (!normA || !normB || normA === normB) return null;

  // 1. Check custom team editor rivals array (supports up to 5 rivals per team)
  if (teamARivals && teamARivals.length > 0) {
    const isCustomRival = teamARivals.some((r) => {
      const cleanR = cleanTeamName(r);
      return cleanR && (cleanR === normB || normB.includes(cleanR) || cleanR.includes(normB));
    });
    if (isCustomRival) {
      return {
        id: `custom_rival_${normA}_${normB}`,
        name: `${teamAName} vs ${teamBName} Derby`,
        shortName: `${teamAName} vs ${teamBName} Derby 🔥`,
        clubA: [normA],
        clubB: [normB],
        country: 'Club Rivalry',
        description: `Official designated historic club rivalry between ${teamAName} and ${teamBName}.`,
      };
    }
  }

  if (teamBRivals && teamBRivals.length > 0) {
    const isCustomRival = teamBRivals.some((r) => {
      const cleanR = cleanTeamName(r);
      return cleanR && (cleanR === normA || normA.includes(cleanR) || cleanR.includes(normA));
    });
    if (isCustomRival) {
      return {
        id: `custom_rival_${normB}_${normA}`,
        name: `${teamAName} vs ${teamBName} Derby`,
        shortName: `${teamAName} vs ${teamBName} Derby 🔥`,
        clubA: [normA],
        clubB: [normB],
        country: 'Club Rivalry',
        description: `Official designated historic club rivalry between ${teamAName} and ${teamBName}.`,
      };
    }
  }

  // 2. Check predefined Worldwide Major Derbies Database
  for (const derby of MAJOR_DERBIES_DATABASE) {
    const aMatchesA = derby.clubA.some((alias) => normA.includes(alias) || alias.includes(normA));
    const bMatchesB = derby.clubB.some((alias) => normB.includes(alias) || alias.includes(normB));

    if (aMatchesA && bMatchesB) {
      return derby;
    }

    const aMatchesB = derby.clubB.some((alias) => normA.includes(alias) || alias.includes(normA));
    const bMatchesA = derby.clubA.some((alias) => normB.includes(alias) || alias.includes(normB));

    if (aMatchesB && bMatchesA) {
      return derby;
    }
  }

  return null;
}

export interface MatchImportanceEvaluation {
  category: MatchImportanceCategory;
  badgeLabel: string;
  badgeColor: 'rose' | 'amber' | 'blue' | 'slate';
  reasonTitle: string;
  reasonDescription: string;
  isPlayableInCurrentMode: boolean;
  isDerby: boolean;
  derbyName?: string;
  isBetrayedClubMatch?: boolean;
  betrayedClubName?: string;
  isTitleDecider: boolean;
  isRelegationDecider: boolean;
  isPlayoff: boolean;
  isKnockoutFinal: boolean;
  isKnockoutSemi: boolean;
  stageTitleDisplay: string;
}

export interface MatchClassificationContext {
  stageTitle?: string;
  competitionName?: string;
  teamAName: string; // Player's team
  teamBName: string; // Opponent
  teamARivals?: string[]; // Custom rivals for player's team
  teamBRivals?: string[]; // Custom rivals for opponent's team
  betrayedClubs?: string[]; // Clubs the player betrayed via direct rival transfer
  currentMatchIndex?: number; // 0 to totalMatches - 1
  totalMatchesInSeason?: number; // e.g. 18 or 38
  tableStandings?: YouthLeagueStanding[] | null;
  playerTeamRank?: number;
  opponentTeamRank?: number;
  pointsGapWithSecond?: number;
  isRelegationPlayoff?: boolean;
  isPromotionPlayoff?: boolean;
  isFinalMatchday?: boolean;
  knockoutStage?: 'quarter_final' | 'semi_final' | 'final' | 'third_place' | 'group' | 'round_of_16' | 'round_of_32';
  playerPlayMode?: KeyMatchPlayMode;
}

/**
 * Dynamically classifies any match into 1 of the 3 Match Importance categories:
 * 1. DEFINITIVE: Decides a major outcome (Cup Final, Tournament Final, Title Clincher, Relegation/Survival Decider)
 * 2. IMPORTANT: Knockout matches (Semis, Quarters, R16, R32), 1st vs 2nd table clashes, Major Derbies, Continental knockouts
 * 3. REGULAR: Standard week-to-week league matches and early cup rounds
 */
export function classifyMatchImportance(
  context: MatchClassificationContext
): MatchImportanceEvaluation {
  const {
    stageTitle = '',
    competitionName = 'League',
    teamAName,
    teamBName,
    teamARivals,
    teamBRivals,
    betrayedClubs,
    currentMatchIndex = 0,
    totalMatchesInSeason = 18,
    tableStandings,
    playerTeamRank,
    opponentTeamRank,
    isRelegationPlayoff = false,
    isPromotionPlayoff = false,
    knockoutStage,
    playerPlayMode = 'decisive',
  } = context;

  const normStage = (stageTitle || '').toLowerCase();
  const normComp = (competitionName || '').toLowerCase();

  // 1. Check Derby
  const derby = checkDerbyMatchup(teamAName, teamBName, teamARivals, teamBRivals);
  const isDerby = Boolean(derby);
  const derbyName = derby ? derby.shortName : undefined;

  // 1b. Check Betrayed Club (Snake / Judas match)
  let isBetrayedClubMatch = false;
  let betrayedClubName: string | undefined = undefined;
  if (betrayedClubs && betrayedClubs.length > 0) {
    const normOpp = cleanTeamName(teamBName);
    const matched = betrayedClubs.find((b) => {
      const cleanB = cleanTeamName(b);
      return cleanB && (cleanB === normOpp || normOpp.includes(cleanB) || cleanB.includes(normOpp));
    });
    if (matched) {
      isBetrayedClubMatch = true;
      betrayedClubName = matched;
    }
  }

  // 2. Check Tournament / Cup Knockout Stages
  const isFinal =
    knockoutStage === 'final' ||
    (normStage.includes('final') &&
      !normStage.includes('semi') &&
      !normStage.includes('quarter') &&
      !normStage.includes('matchday') &&
      !normStage.includes('round') &&
      !normStage.includes('league') &&
      !normComp.includes('league'));
  const isSemi =
    knockoutStage === 'semi_final' || normStage.includes('semi');
  const isQuarter =
    knockoutStage === 'quarter_final' || normStage.includes('quarter') || normStage.includes('cuartos') || normStage.includes('1/4');
  const isRoundOf16 =
    knockoutStage === 'round_of_16' || normStage.includes('round of 16') || normStage.includes('r16') || normStage.includes('octavos') || normStage.includes('1/8');
  const isRoundOf32 =
    knockoutStage === 'round_of_32' || normStage.includes('round of 32') || normStage.includes('r32') || normStage.includes('dieciseisavos') || normStage.includes('1/16');
  const isThirdPlace =
    knockoutStage === 'third_place' || normStage.includes('third');
  const isGeneralKnockout =
    isQuarter || isRoundOf16 || isRoundOf32 || normStage.includes('knockout') || normStage.includes('playoff');

  // 3. Dynamic League Context: Calculate Table Positions and Title/Relegation deciders
  let pRank = playerTeamRank;
  let oppRank = opponentTeamRank;

  if (tableStandings && tableStandings.length > 0) {
    const cleanP = cleanTeamName(teamAName);
    const cleanOpp = cleanTeamName(teamBName);

    const pEntry = tableStandings.find((s) => cleanTeamName(s.teamName).includes(cleanP) || cleanP.includes(cleanTeamName(s.teamName)));
    const oppEntry = tableStandings.find((s) => cleanTeamName(s.teamName).includes(cleanOpp) || cleanOpp.includes(cleanTeamName(s.teamName)));

    if (pEntry) pRank = pEntry.rank;
    if (oppEntry) oppRank = oppEntry.rank;
  }

  const isFirstVsSecond =
    (pRank === 1 && oppRank === 2) || (pRank === 2 && oppRank === 1);

  const remainingMatches = Math.max(0, totalMatchesInSeason - (currentMatchIndex + 1));
  const isLateSeason = remainingMatches <= 2; // Final 2 matchdays

  // Title decider: If 1st vs 2nd in the last 2 matchdays, or late-season title clinch
  const isTitleDecider =
    (isFirstVsSecond && isLateSeason) ||
    (pRank === 1 && isLateSeason && (normStage.includes('match 18') || normStage.includes('match 38') || remainingMatches === 0));

  // Relegation decider: Relegation playoffs or final matches where in bottom 2
  const isRelegationDecider =
    isRelegationPlayoff ||
    (isLateSeason && pRank !== undefined && pRank >= (tableStandings ? tableStandings.length - 1 : 9));

  // Determine Category
  let category: MatchImportanceCategory = 'REGULAR';
  let badgeLabel = '⚽ REGULAR MATCH';
  let badgeColor: 'rose' | 'amber' | 'blue' | 'slate' = 'slate';
  let reasonTitle = 'Regular Fixture';
  let reasonDescription = 'Standard week-to-week league match contributing to the season campaign.';
  let stageTitleDisplay = stageTitle || 'Matchday Fixture';

  // CATEGORY 1: DEFINITIVE MATCH
  if (isFinal) {
    category = 'DEFINITIVE';
    badgeLabel = '🏆 DEFINITIVE MATCH';
    badgeColor = 'rose';
    reasonTitle = 'Championship Final 🏆';
    reasonDescription = 'Direct title decider! The winner will lift the championship trophy.';
    stageTitleDisplay = `${stageTitle || 'Tournament Final'} 🏆`;
  } else if (isTitleDecider) {
    category = 'DEFINITIVE';
    badgeLabel = '🏆 DEFINITIVE MATCH';
    badgeColor = 'rose';
    reasonTitle = 'League Title Decider 🏆';
    reasonDescription = 'This match mathematically decides the league title championship.';
    stageTitleDisplay = `${teamAName} vs ${teamBName} (Title Decider 🏆)`;
  } else if (isRelegationDecider || isRelegationPlayoff || isPromotionPlayoff) {
    category = 'DEFINITIVE';
    badgeLabel = '🏆 DEFINITIVE MATCH';
    badgeColor = 'rose';
    reasonTitle = isPromotionPlayoff ? 'Promotion Playoff Final ⬆️' : 'Relegation Survival Decider 🚨';
    reasonDescription = isPromotionPlayoff
      ? 'Direct playoff decider determining promotion to the higher division!'
      : 'Survival on the line! This match directly determines relegation or top-flight survival.';
    stageTitleDisplay = isPromotionPlayoff
      ? `Promotion Playoff Final ⬆️`
      : `Relegation Decider Match 🚨`;
  }
  // CATEGORY 2: IMPORTANT MATCH (Knockouts, 1st vs 2nd, Derbies, Continental)
  else if (isSemi) {
    category = 'IMPORTANT';
    badgeLabel = '🔥 IMPORTANT MATCH';
    badgeColor = 'amber';
    reasonTitle = 'Semi-Final Showdown ⚡';
    reasonDescription = 'High-stakes knockout fixture! The winner advances directly to the Grand Final.';
    stageTitleDisplay = `${stageTitle || 'Tournament Semi-Final'} ⚡`;
  } else if (isDerby) {
    category = 'IMPORTANT';
    badgeLabel = '🔥 IMPORTANT MATCH';
    badgeColor = 'amber';
    reasonTitle = `${derby?.name || 'Local Derby'} 🔥`;
    reasonDescription = `${derby?.description || 'Iconic traditional rivalry with massive pride and intensity on the line.'}`;
    stageTitleDisplay = `${derby?.shortName || 'Derby Clash'} ⚔️`;
  } else if (isFirstVsSecond) {
    category = 'IMPORTANT';
    badgeLabel = '🔥 IMPORTANT MATCH';
    badgeColor = 'amber';
    reasonTitle = '1st vs 2nd Clash ⚔️';
    reasonDescription = 'Clash of the top 2 teams in the standings! 6-point swing for the league lead.';
    stageTitleDisplay = `1st vs 2nd Table Showdown ⚔️`;
  } else if (isQuarter) {
    category = 'IMPORTANT';
    badgeLabel = '🔥 IMPORTANT MATCH';
    badgeColor = 'amber';
    reasonTitle = 'Quarter-Final Knockout ⚡';
    reasonDescription = 'High-tension quarter-final knockout match with semi-final spot at stake.';
    stageTitleDisplay = `${stageTitle || 'Quarter-Final'} ⚡`;
  } else if (isRoundOf16 || isRoundOf32) {
    category = 'IMPORTANT';
    badgeLabel = '🔥 IMPORTANT MATCH';
    badgeColor = 'amber';
    reasonTitle = isRoundOf16 ? 'Round of 16 Knockout ⚔️' : 'Round of 32 Knockout ⚔️';
    reasonDescription = 'Direct knockout stage match where victory is essential to avoid elimination.';
    stageTitleDisplay = `${stageTitle || (isRoundOf16 ? 'Round of 16' : 'Round of 32')} ⚔️`;
  } else if (isThirdPlace) {
    category = 'IMPORTANT';
    badgeLabel = '🔥 IMPORTANT MATCH';
    badgeColor = 'amber';
    reasonTitle = 'Third-Place Bronze Match 🥉';
    reasonDescription = 'International tournament medal fixture determining 3rd place on the podium.';
    stageTitleDisplay = `${stageTitle || 'Third-Place Match'} 🥉`;
  } else if (
    normComp.includes('champions') ||
    normComp.includes('libertadores') ||
    isGeneralKnockout
  ) {
    category = 'IMPORTANT';
    badgeLabel = '🔥 IMPORTANT MATCH';
    badgeColor = 'amber';
    reasonTitle = 'Continental / Knockout Clash 🌟';
    reasonDescription = 'Elite competitive stage with continental glory and knockout progression at stake.';
    stageTitleDisplay = `${stageTitle || 'Knockout Fixture'} ⚡`;
  } else if (isBetrayedClubMatch) {
    category = 'IMPORTANT';
    badgeLabel = '💀 BETRAYED CLUB REUNION';
    badgeColor = 'rose';
    reasonTitle = `Hostile Reunion: ${teamBName} 💀`;
    reasonDescription = `You betrayed ${teamBName} by transferring directly to their rival. The stadium is an inferno of deafening whistles and venomous chants targeting your every touch!`;
    stageTitleDisplay = `${teamAName} vs ${teamBName} (Hostile Reunion 💀)`;
  }

  const isPlayableInCurrentMode = isKeyMatchForPlayer(category, playerPlayMode);

  return {
    category,
    badgeLabel,
    badgeColor,
    reasonTitle,
    reasonDescription,
    isPlayableInCurrentMode,
    isDerby,
    derbyName,
    isBetrayedClubMatch,
    betrayedClubName,
    isTitleDecider,
    isRelegationDecider,
    isPlayoff: isRelegationPlayoff || isPromotionPlayoff,
    isKnockoutFinal: isFinal,
    isKnockoutSemi: isSemi,
    stageTitleDisplay,
  };
}

/**
 * Determines if a given match should trigger the interactive Key Match QTE flow
 * based on the user's selected KeyMatchPlayMode:
 * - 'slow': All matches (Definitive, Important, Regular) trigger Key Match.
 * - 'decisive': Definitive (1) and Important (2) trigger Key Match. Regular are simulated.
 * - 'finals_only': ONLY Definitive (1) trigger Key Match.
 */
export function isKeyMatchForPlayer(
  category: MatchImportanceCategory,
  mode: KeyMatchPlayMode = 'decisive'
): boolean {
  if (mode === 'slow') {
    return true; // 1, 2, and 3 are all key matches
  }
  if (mode === 'decisive') {
    return category === 'DEFINITIVE' || category === 'IMPORTANT'; // 1 and 2
  }
  if (mode === 'finals_only') {
    return category === 'DEFINITIVE'; // 1 only
  }
  return category === 'DEFINITIVE' || category === 'IMPORTANT';
}

export interface CareerModeOption {
  id: KeyMatchPlayMode;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  playsCategories: MatchImportanceCategory[];
  recommendedTag?: string;
  highlights: string[];
}

export const CAREER_PLAY_MODES: Record<KeyMatchPlayMode, CareerModeOption> = {
  slow: {
    id: 'slow',
    name: 'Slow Mode',
    badge: 'Play All Matches (1, 2, 3)',
    tagline: 'Maximum immersion — step onto the pitch for every single match.',
    description:
      'Every Definitive, Important, and Regular match triggers the interactive Key Match experience. Perfect for players who want to build their career match-by-match.',
    playsCategories: ['DEFINITIVE', 'IMPORTANT', 'REGULAR'],
    highlights: [
      'Play all 18+ league matches per season',
      'Experience all cup, group, and friendly ties',
      'Maximum control over your match ratings and goal tally',
    ],
  },
  decisive: {
    id: 'decisive',
    name: 'Decisive Mode',
    badge: 'Definitive + Important (1 & 2)',
    tagline: 'The ideal balance — play finals, title deciders, semi-finals & iconic derbies.',
    description:
      'Play all Definitive Finals, Title Clinchers, Relegation battles, Semi-Finals, 1st vs 2nd table clashes, and traditional Derbies (El Clásico, Madrid Derby, London Derby, Superclásico). Standard matches are auto-simulated.',
    playsCategories: ['DEFINITIVE', 'IMPORTANT'],
    recommendedTag: 'RECOMMENDED',
    highlights: [
      'Play Cup & Tournament Finals and Semi-Finals',
      'Play all major Derbies & rivalries (El Clásico, Superclásico, etc.)',
      'Play title deciders & relegation battles',
      'Auto-simulates ordinary mid-table fixtures for swift season pacing',
    ],
  },
  finals_only: {
    id: 'finals_only',
    name: 'Finals Only',
    badge: 'Definitive Only (1)',
    tagline: 'Fast-paced career — play only the matches that decide major silverware or survival.',
    description:
      'Only matches that directly determine a trophy, championship title, promotion, or relegation are played as Key Matches. All regular league games, derbies, and semi-finals are simulated.',
    playsCategories: ['DEFINITIVE'],
    highlights: [
      'Play Cup Finals & Tournament Finals (World Cup / Youth Cup)',
      'Play mathematical League Title Clinchers & Relegation Deciders',
      'Fastest career progression through seasons',
    ],
  },
};
