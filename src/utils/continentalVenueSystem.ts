import {
  ContinentalCompetitionId,
  ContinentalFinalVenue,
} from '../types/continentalCompetitions';
import { LanguageCode, getStoredLanguage } from './localizationSystem';

/**
 * 1. FINAL VENUE POOLS
 * Each competition has an authentic pool of final venues.
 * Rules:
 * - No city is duplicated within the same competition pool.
 * - Maximum 2 venues per country where possible.
 * - Official and historical host stadiums.
 */
export const CONTINENTAL_FINAL_VENUE_POOLS: Record<ContinentalCompetitionId, ContinentalFinalVenue[]> = {
  // UEFA Champions League — 11 venues (Existing 10 + Glasgow)
  UEFA_CL: [
    { city: 'London', country: 'England', stadium: 'Wembley Stadium', capacity: 90000 },
    { city: 'Istanbul', country: 'Türkiye', stadium: 'Atatürk Olympic Stadium', capacity: 76000 },
    { city: 'Paris', country: 'France', stadium: 'Stade de France', capacity: 80000 },
    { city: 'Madrid', country: 'Spain', stadium: 'Santiago Bernabéu', capacity: 83000 },
    { city: 'Munich', country: 'Germany', stadium: 'Allianz Arena', capacity: 75000 },
    { city: 'Rome', country: 'Italy', stadium: 'Stadio Olimpico', capacity: 70000 },
    { city: 'Lisbon', country: 'Portugal', stadium: 'Estádio da Luz', capacity: 65000 },
    { city: 'Cardiff', country: 'Wales', stadium: 'Millennium Stadium', capacity: 74000 },
    { city: 'Athens', country: 'Greece', stadium: 'Olympic Stadium', capacity: 69000 },
    { city: 'Glasgow', country: 'Scotland', stadium: 'Hampden Park', capacity: 52000 },
    { city: 'Berlin', country: 'Germany', stadium: 'Olympiastadion', capacity: 74475 },
  ],

  // UEFA Europa League — 10 venues
  UEFA_EL: [
    { city: 'Dublin', country: 'Ireland', stadium: 'Aviva Stadium', capacity: 51700 },
    { city: 'Seville', country: 'Spain', stadium: 'Ramón Sánchez Pizjuán', capacity: 43800 },
    { city: 'Baku', country: 'Azerbaijan', stadium: 'Baku Olympic Stadium', capacity: 68700 },
    { city: 'Gdańsk', country: 'Poland', stadium: 'Stadion Gdańsk', capacity: 41600 },
    { city: 'Lyon', country: 'France', stadium: 'Groupama Stadium', capacity: 59100 },
    { city: 'Stockholm', country: 'Sweden', stadium: 'Friends Arena', capacity: 50000 },
    { city: 'Basel', country: 'Switzerland', stadium: 'St. Jakob-Park', capacity: 38500 },
    { city: 'Budapest', country: 'Hungary', stadium: 'Puskás Aréna', capacity: 67200 },
    { city: 'Turin', country: 'Italy', stadium: 'Juventus Stadium', capacity: 41500 },
    { city: 'Bilbao', country: 'Spain', stadium: 'San Mamés', capacity: 53200 },
  ],

  // UEFA Conference League — 10 venues
  UEFA_ECL: [
    { city: 'Tirana', country: 'Albania', stadium: 'Arena Kombëtare', capacity: 22500 },
    { city: 'Prague', country: 'Czech Republic', stadium: 'Fortuna Arena', capacity: 19300 },
    { city: 'Athens', country: 'Greece', stadium: 'Agia Sophia Stadium', capacity: 32500 },
    { city: 'Wrocław', country: 'Poland', stadium: 'Stadion Wrocław', capacity: 45100 },
    { city: 'Leipzig', country: 'Germany', stadium: 'Red Bull Arena', capacity: 47000 },
    { city: 'Vienna', country: 'Austria', stadium: 'Ernst-Happel-Stadion', capacity: 50800 },
    { city: 'Rotterdam', country: 'Netherlands', stadium: 'De Kuip', capacity: 51100 },
    { city: 'Helsinki', country: 'Finland', stadium: 'Olympic Stadium', capacity: 36200 },
    { city: 'Copenhagen', country: 'Denmark', stadium: 'Parken Stadium', capacity: 38000 },
    { city: 'Warsaw', country: 'Poland', stadium: 'PGE Narodowy', capacity: 58500 },
  ],

  // UEFA Super Cup — 6 venues
  UEFA_SC: [
    { city: 'Helsinki', country: 'Finland', stadium: 'Olympic Stadium', capacity: 36200 },
    { city: 'Piraeus', country: 'Greece', stadium: 'Karaiskakis Stadium', capacity: 32115 },
    { city: 'Warsaw', country: 'Poland', stadium: 'PGE Narodowy', capacity: 58500 },
    { city: 'Belfast', country: 'Northern Ireland', stadium: 'Windsor Park', capacity: 18500 },
    { city: 'Budapest', country: 'Hungary', stadium: 'Puskás Aréna', capacity: 67200 },
    { city: 'Tallinn', country: 'Estonia', stadium: 'Lilleküla Stadium', capacity: 14300 },
  ],

  // CONMEBOL Libertadores — 10 venues
  CONMEBOL_LIB: [
    { city: 'Rio de Janeiro', country: 'Brazil', stadium: 'Maracanã', capacity: 78838 },
    { city: 'Buenos Aires', country: 'Argentina', stadium: 'Estadio Monumental', capacity: 84567 },
    { city: 'Montevideo', country: 'Uruguay', stadium: 'Estadio Centenario', capacity: 60235 },
    { city: 'Lima', country: 'Peru', stadium: 'Estadio Monumental', capacity: 80093 },
    { city: 'Santiago', country: 'Chile', stadium: 'Estadio Nacional', capacity: 48665 },
    { city: 'Guayaquil', country: 'Ecuador', stadium: 'Estadio Monumental Isidro Romero', capacity: 59283 },
    { city: 'São Paulo', country: 'Brazil', stadium: 'Estádio do Morumbi', capacity: 66795 },
    { city: 'Córdoba', country: 'Argentina', stadium: 'Estadio Mario Alberto Kempes', capacity: 57000 },
    { city: 'Asunción', country: 'Paraguay', stadium: 'Estadio Defensores del Chaco', capacity: 42354 },
    { city: 'Barranquilla', country: 'Colombia', stadium: 'Estadio Metropolitano', capacity: 46692 },
  ],

  // CONMEBOL Sudamericana — 10 venues
  CONMEBOL_SUD: [
    { city: 'Asunción', country: 'Paraguay', stadium: 'Estadio General Pablo Rojas', capacity: 45000 },
    { city: 'Córdoba', country: 'Argentina', stadium: 'Estadio Mario Alberto Kempes', capacity: 57000 },
    { city: 'Maldonado', country: 'Uruguay', stadium: 'Estadio Domingo Burgueño', capacity: 25000 },
    { city: 'Brasília', country: 'Brazil', stadium: 'Estádio Mané Garrincha', capacity: 72788 },
    { city: 'Quito', country: 'Ecuador', stadium: 'Estadio Rodrigo Paz Delgado', capacity: 41575 },
    { city: 'Viña del Mar', country: 'Chile', stadium: 'Estadio Sausalito', capacity: 23000 },
    { city: 'Santa Cruz', country: 'Bolivia', stadium: 'Estadio Ramón Tahuichi Aguilera', capacity: 38500 },
    { city: 'Belo Horizonte', country: 'Brazil', stadium: 'Mineirão', capacity: 61846 },
    { city: 'Rosario', country: 'Argentina', stadium: 'Estadio Marcelo Bielsa', capacity: 42000 },
    { city: 'Pereira', country: 'Colombia', stadium: 'Estadio Hernán Ramírez Villegas', capacity: 30297 },
  ],

  // CONMEBOL Recopa — 4 venues
  CONMEBOL_REC: [
    { city: 'Rio de Janeiro', country: 'Brazil', stadium: 'Maracanã', capacity: 78838 },
    { city: 'Buenos Aires', country: 'Argentina', stadium: 'Estadio Monumental', capacity: 84567 },
    { city: 'Montevideo', country: 'Uruguay', stadium: 'Estadio Centenario', capacity: 60235 },
    { city: 'Quito', country: 'Ecuador', stadium: 'Estadio Rodrigo Paz Delgado', capacity: 41575 },
  ],

  // CONCACAF Champions Cup — 10 venues
  CONCACAF_CC: [
    { city: 'Mexico City', country: 'Mexico', stadium: 'Estadio Azteca', capacity: 87523 },
    { city: 'Los Angeles', country: 'USA', stadium: 'Rose Bowl', capacity: 88565 },
    { city: 'Guadalajara', country: 'Mexico', stadium: 'Estadio Akron', capacity: 46355 },
    { city: 'Atlanta', country: 'USA', stadium: 'Mercedes-Benz Stadium', capacity: 71000 },
    { city: 'San José', country: 'Costa Rica', stadium: 'Estadio Nacional', capacity: 35100 },
    { city: 'Toronto', country: 'Canada', stadium: 'BMO Field', capacity: 30000 },
    { city: 'Monterrey', country: 'Mexico', stadium: 'Estadio BBVA', capacity: 53500 },
    { city: 'Miami', country: 'USA', stadium: 'Hard Rock Stadium', capacity: 65326 },
    { city: 'San Salvador', country: 'El Salvador', stadium: 'Estadio Cuscatlán', capacity: 44836 },
    { city: 'Tegucigalpa', country: 'Honduras', stadium: 'Estadio Chelato Uclés', capacity: 35000 },
  ],

  // CONCACAF Central American Cup
  CONCACAF_CAC: [
    { city: 'San José', country: 'Costa Rica', stadium: 'Estadio Nacional', capacity: 35100 },
    { city: 'Panama City', country: 'Panama', stadium: 'Estadio Rommel Fernández', capacity: 32000 },
    { city: 'Tegucigalpa', country: 'Honduras', stadium: 'Estadio Chelato Uclés', capacity: 35000 },
    { city: 'Guatemala City', country: 'Guatemala', stadium: 'Estadio Doroteo Guamuch Flores', capacity: 26000 },
    { city: 'San Salvador', country: 'El Salvador', stadium: 'Estadio Cuscatlán', capacity: 44836 },
    { city: 'Alajuela', country: 'Costa Rica', stadium: 'Estadio Alejandro Morera Soto', capacity: 17895 },
  ],

  // AFC Champions League — 10 venues
  AFC_CL: [
    { city: 'Riyadh', country: 'Saudi Arabia', stadium: 'King Fahd International Stadium', capacity: 68752 },
    { city: 'Saitama', country: 'Japan', stadium: 'Saitama Stadium 2002', capacity: 63700 },
    { city: 'Doha', country: 'Qatar', stadium: 'Lusail Stadium', capacity: 88966 },
    { city: 'Seoul', country: 'South Korea', stadium: 'Seoul World Cup Stadium', capacity: 66704 },
    { city: 'Abu Dhabi', country: 'UAE', stadium: 'Zayed Sports City Stadium', capacity: 43206 },
    { city: 'Tehran', country: 'Iran', stadium: 'Azadi Stadium', capacity: 78116 },
    { city: 'Guangzhou', country: 'China', stadium: 'Tianhe Stadium', capacity: 54856 },
    { city: 'Jeddah', country: 'Saudi Arabia', stadium: 'King Abdullah Sports City', capacity: 62345 },
    { city: 'Sydney', country: 'Australia', stadium: 'Stadium Australia', capacity: 83500 },
    { city: 'Tashkent', country: 'Uzbekistan', stadium: 'Milliy Stadium', capacity: 34000 },
  ],

  // AFC Cup — 8 venues
  AFC_CUP: [
    { city: 'Kuala Lumpur', country: 'Malaysia', stadium: 'Bukit Jalil National Stadium', capacity: 87411 },
    { city: 'Amman', country: 'Jordan', stadium: 'Amman International Stadium', capacity: 17645 },
    { city: 'Kuwait City', country: 'Kuwait', stadium: 'Jaber Al-Ahmad International Stadium', capacity: 60000 },
    { city: 'Hanoi', country: 'Vietnam', stadium: 'Mỹ Đình National Stadium', capacity: 40192 },
    { city: 'Muscat', country: 'Oman', stadium: 'Sultan Qaboos Sports Complex', capacity: 34000 },
    { city: 'Manila', country: 'Philippines', stadium: 'Rizal Memorial Stadium', capacity: 12873 },
    { city: 'Beirut', country: 'Lebanon', stadium: 'Camille Chamoun Sports City', capacity: 49500 },
    { city: 'Basra', country: 'Iraq', stadium: 'Basra International Stadium', capacity: 65227 },
  ],

  // CAF Champions League — 10 venues
  CAF_CL: [
    { city: 'Cairo', country: 'Egypt', stadium: 'Cairo International Stadium', capacity: 75000 },
    { city: 'Casablanca', country: 'Morocco', stadium: 'Stade Mohammed V', capacity: 45891 },
    { city: 'Johannesburg', country: 'South Africa', stadium: 'FNB Stadium (Soccer City)', capacity: 94736 },
    { city: 'Tunis', country: 'Tunisia', stadium: 'Stade Hammadi Agrebi (Radès)', capacity: 60000 },
    { city: 'Algiers', country: 'Algeria', stadium: 'Stade 5 Juillet 1962', capacity: 64000 },
    { city: 'Alexandria', country: 'Egypt', stadium: 'Borg El Arab Stadium', capacity: 86000 },
    { city: 'Rabat', country: 'Morocco', stadium: 'Prince Moulay Abdellah Stadium', capacity: 53000 },
    { city: 'Kinshasa', country: 'DR Congo', stadium: 'Stade des Martyrs', capacity: 80000 },
    { city: 'Lagos', country: 'Nigeria', stadium: 'National Stadium', capacity: 45000 },
    { city: 'Yaoundé', country: 'Cameroon', stadium: "Stade d'Olembe", capacity: 60000 },
  ],

  // CAF Confederation Cup — 8 venues
  CAF_CONFED_CUP: [
    { city: 'Abidjan', country: 'Ivory Coast', stadium: 'Stade Alassane Ouattara', capacity: 60000 },
    { city: 'Dakar', country: 'Senegal', stadium: 'Stade Abdoulaye Wade', capacity: 50000 },
    { city: 'Kumasi', country: 'Ghana', stadium: 'Baba Yara Stadium', capacity: 40528 },
    { city: 'Uyo', country: 'Nigeria', stadium: 'Godswill Akpabio International Stadium', capacity: 30000 },
    { city: 'Oran', country: 'Algeria', stadium: 'Miloud Hadefi Stadium', capacity: 40143 },
    { city: 'Sousse', country: 'Tunisia', stadium: 'Stade Olympique de Sousse', capacity: 40000 },
    { city: 'Fez', country: 'Morocco', stadium: 'Fez Stadium', capacity: 45000 },
    { city: 'Suez', country: 'Egypt', stadium: 'Suez Stadium', capacity: 27000 },
  ],

  // CAF Super Cup
  CAF_SC: [
    { city: 'Doha', country: 'Qatar', stadium: 'Ahmad bin Ali Stadium', capacity: 45032 },
    { city: 'Cairo', country: 'Egypt', stadium: 'Cairo International Stadium', capacity: 75000 },
    { city: 'Rabat', country: 'Morocco', stadium: 'Prince Moulay Abdellah Stadium', capacity: 53000 },
    { city: 'Riyadh', country: 'Saudi Arabia', stadium: 'Kingdom Arena', capacity: 30000 },
  ],

  // OFC Champions League — 10 venues
  OFC_CL: [
    { city: 'Auckland', country: 'New Zealand', stadium: 'Eden Park', capacity: 50000 },
    { city: 'Wellington', country: 'New Zealand', stadium: 'Sky Stadium', capacity: 34500 },
    { city: 'Port Moresby', country: 'Papua New Guinea', stadium: 'Sir John Guise Stadium', capacity: 15000 },
    { city: 'Suva', country: 'Fiji', stadium: 'HFC Bank Stadium', capacity: 15000 },
    { city: 'Honiara', country: 'Solomon Islands', stadium: 'Lawson Tama Stadium', capacity: 22000 },
    { city: 'Nouméa', country: 'New Caledonia', stadium: 'Stade Numa-Daly Magenta', capacity: 10000 },
    { city: 'Port Vila', country: 'Vanuatu', stadium: 'Korman Stadium', capacity: 10000 },
    { city: 'Papeete', country: 'Tahiti', stadium: 'Stade Pater Te Hono Nui', capacity: 11700 },
    { city: 'Lautoka', country: 'Fiji', stadium: 'Churchill Park', capacity: 18000 },
    { city: 'Christchurch', country: 'New Zealand', stadium: 'Orangetheory Stadium', capacity: 18000 },
  ],
};

/**
 * Deterministically selects and locks the final venue for the given competition and seasonYear.
 * Since the rule states the venue is chosen one season before the final and then locked,
 * using a hash of the competition ID and season year produces a consistent, stable selection.
 */
export function getContinentalFinalVenue(
  competitionId: ContinentalCompetitionId | string,
  seasonYear: number
): ContinentalFinalVenue {
  const pool = CONTINENTAL_FINAL_VENUE_POOLS[competitionId as ContinentalCompetitionId] ||
    CONTINENTAL_FINAL_VENUE_POOLS.UEFA_CL;

  // Calculate stable hash
  let hash = 0;
  const str = `${competitionId}_${seasonYear}_continental_venue_lock`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

/**
 * Returns the final venue that has been locked for the upcoming season (N + 1).
 */
export function getNextSeasonContinentalFinalVenue(
  competitionId: ContinentalCompetitionId | string,
  currentSeasonYear: number
): ContinentalFinalVenue {
  return getContinentalFinalVenue(competitionId, currentSeasonYear + 1);
}

/**
 * Localized city translations for natural phrasing in titles.
 */
const LOCALIZED_CITIES: Record<string, Record<LanguageCode, string>> = {
  London: { 'en-GB': 'London', 'es-ES': 'Londres', 'es-AR': 'Londres', 'pt-BR': 'Londres', 'fr-FR': 'Londres' },
  Paris: { 'en-GB': 'Paris', 'es-ES': 'París', 'es-AR': 'París', 'pt-BR': 'Paris', 'fr-FR': 'Paris' },
  Munich: { 'en-GB': 'Munich', 'es-ES': 'Múnich', 'es-AR': 'Múnich', 'pt-BR': 'Munique', 'fr-FR': 'Munich' },
  Rome: { 'en-GB': 'Rome', 'es-ES': 'Roma', 'es-AR': 'Roma', 'pt-BR': 'Roma', 'fr-FR': 'Rome' },
  Lisbon: { 'en-GB': 'Lisbon', 'es-ES': 'Lisboa', 'es-AR': 'Lisboa', 'pt-BR': 'Lisboa', 'fr-FR': 'Lisbonne' },
  Berlin: { 'en-GB': 'Berlin', 'es-ES': 'Berlín', 'es-AR': 'Berlín', 'pt-BR': 'Berlim', 'fr-FR': 'Berlin' },
  Istanbul: { 'en-GB': 'Istanbul', 'es-ES': 'Estambul', 'es-AR': 'Estambul', 'pt-BR': 'Istambul', 'fr-FR': 'Istanbul' },
  Glasgow: { 'en-GB': 'Glasgow', 'es-ES': 'Glasgow', 'es-AR': 'Glasgow', 'pt-BR': 'Glasgow', 'fr-FR': 'Glasgow' },
  Madrid: { 'en-GB': 'Madrid', 'es-ES': 'Madrid', 'es-AR': 'Madrid', 'pt-BR': 'Madri', 'fr-FR': 'Madrid' },
  Athens: { 'en-GB': 'Athens', 'es-ES': 'Atenas', 'es-AR': 'Atenas', 'pt-BR': 'Atenas', 'fr-FR': 'Athènes' },
  Cardiff: { 'en-GB': 'Cardiff', 'es-ES': 'Cardiff', 'es-AR': 'Cardiff', 'pt-BR': 'Cardiff', 'fr-FR': 'Cardiff' },
  Dublin: { 'en-GB': 'Dublin', 'es-ES': 'Dublín', 'es-AR': 'Dublín', 'pt-BR': 'Dublin', 'fr-FR': 'Dublin' },
  Seville: { 'en-GB': 'Seville', 'es-ES': 'Sevilla', 'es-AR': 'Sevilla', 'pt-BR': 'Sevilha', 'fr-FR': 'Séville' },
  Warsaw: { 'en-GB': 'Warsaw', 'es-ES': 'Varsovia', 'es-AR': 'Varsovia', 'pt-BR': 'Varsóvia', 'fr-FR': 'Varsovie' },
  Prague: { 'en-GB': 'Prague', 'es-ES': 'Praga', 'es-AR': 'Praga', 'pt-BR': 'Praga', 'fr-FR': 'Prague' },
  Vienna: { 'en-GB': 'Vienna', 'es-ES': 'Viena', 'es-AR': 'Viena', 'pt-BR': 'Viena', 'fr-FR': 'Vienne' },
  Cairo: { 'en-GB': 'Cairo', 'es-ES': 'El Cairo', 'es-AR': 'El Cairo', 'pt-BR': 'Cairo', 'fr-FR': 'Le Caire' },
  Riyadh: { 'en-GB': 'Riyadh', 'es-ES': 'Riad', 'es-AR': 'Riad', 'pt-BR': 'Riad', 'fr-FR': 'Riyad' },
};

export function getLocalizedCity(city: string, lang: LanguageCode): string {
  if (LOCALIZED_CITIES[city] && LOCALIZED_CITIES[city][lang]) {
    return LOCALIZED_CITIES[city][lang];
  }
  return city;
}

export interface LegendaryFinalAnalysisParams {
  city: string;
  isWon: boolean;
  teamConsecutiveWins: number; // e.g. 1, 2, 3, 4, 5+
  playerTotalWins: number;      // e.g. 1, 2, 3, 4, 5+
  trailedByTwoOrMore?: boolean; // Trailed by 2+ goals at any point before winning
  playerGoals?: number;
  playerAssists?: number;
  playerRating?: number;
  isMvp?: boolean;
  finalGoalDiff?: number;       // Math.abs(homeScore - awayScore)
  redCardsCount?: number;       // Red cards in the match
  wonOnPenalties?: boolean;
  wonInExtraTime?: boolean;
  lastMinuteWinner?: boolean;   // Winning goal scored in 88'+ or stoppage time
  isGoalkeeperMasterclass?: boolean; // GK MVP or 8+ saves / clean sheet under heavy attack
  isHistoricUnderdogVictory?: boolean; // Team with significantly lower OVR won
  language?: LanguageCode;
}

/**
 * 3. LEGENDARY FINAL NAME SYSTEM + PRIORITY RESOLUTION
 *
 * Evaluates the final match outcome and returns the legendary title if earned.
 * Priority Order:
 * 1. Team Consecutive Trophy Legends (2nd, 3rd, 4th, 5th+ in a row)
 * 2. Player Trophy Legends (2nd, 3rd, 4th, 5th+ career wins)
 * 3. The Miracle of [City] (Comeback from 2+ goals down)
 * 4. Other Major Match-Event Legends (Masterpiece, Hero, Battle, Stoppage-Time, Extra-Time, Shootout, Wall, Fairytale, Glory)
 * 5. No Legendary Title (Normal headline)
 */
export function calculateLegendaryFinalTitle(params: LegendaryFinalAnalysisParams): {
  title: string | null;
  priorityCategory: 'DYNASTY' | 'PLAYER_CROWNS' | 'MIRACLE' | 'MATCH_EVENT' | 'NONE';
  description: string | null;
} {
  if (!params.isWon) {
    return { title: null, priorityCategory: 'NONE', description: null };
  }

  const lang = params.language || getStoredLanguage();
  const city = getLocalizedCity(params.city, lang);

  // Helper for preposition handling: in Spanish/French/Portuguese, "de" / "d'" / "do"
  const formatCityTitle = (templates: Record<LanguageCode, (c: string) => string>): string => {
    const fn = templates[lang] || templates['en-GB'];
    return fn(city);
  };

  // =========================================================================
  // PRIORITY 1 — DYNASTY / CONSECUTIVE TROPHY LEGENDS (Winning Team)
  // =========================================================================
  if (params.teamConsecutiveWins >= 2) {
    const streak = params.teamConsecutiveWins;

    if (streak === 2) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Reign of ${c}`,
        'es-ES': (c) => `El Reinado de ${c}`,
        'es-AR': (c) => `El Reinado de ${c}`,
        'pt-BR': (c) => `O Reinado de ${c}`,
        'fr-FR': (c) => `Le Règne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `Back-to-back continental supremacy crowned in ${city}!`,
      };
    } else if (streak === 3) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Dynasty of ${c}`,
        'es-ES': (c) => `La Dinastía de ${c}`,
        'es-AR': (c) => `La Dinastía de ${c}`,
        'pt-BR': (c) => `A Dinastia de ${c}`,
        'fr-FR': (c) => `La Dynastie de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `A legendary continental three-peat established forever in ${city}!`,
      };
    } else if (streak === 4) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Empire of ${c}`,
        'es-ES': (c) => `El Imperio de ${c}`,
        'es-AR': (c) => `El Imperio de ${c}`,
        'pt-BR': (c) => `O Império de ${c}`,
        'fr-FR': (c) => `L'Empire de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `A four-in-a-row football empire cemented in ${city}!`,
      };
    } else if (streak === 5) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Golden Era of ${c}`,
        'es-ES': (c) => `La Era Dorada de ${c}`,
        'es-AR': (c) => `La Era Dorada de ${c}`,
        'pt-BR': (c) => `A Era Dourada de ${c}`,
        'fr-FR': (c) => `L'Ère Dorée de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `Five consecutive continental crowns write the greatest era in football history!`,
      };
    } else if (streak === 6) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Immortals of ${c}`,
        'es-ES': (c) => `Los Inmortales de ${c}`,
        'es-AR': (c) => `Los Inmortales de ${c}`,
        'pt-BR': (c) => `Os Imortais de ${c}`,
        'fr-FR': (c) => `Les Immortels de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `Six consecutive triumphs ascend into pure immortality in ${city}!`,
      };
    } else if (streak === 7) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Unbreakable of ${c}`,
        'es-ES': (c) => `Los Invencibles de ${c}`,
        'es-AR': (c) => `Los Indestructibles de ${c}`,
        'pt-BR': (c) => `Os Invencíveis de ${c}`,
        'fr-FR': (c) => `Les Invincibles de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `Seven straight continental championships — an unbreakable empire!`,
      };
    } else {
      // 8+ in a row
      const title = formatCityTitle({
        'en-GB': (c) => `The Eternal Champions of ${c}`,
        'es-ES': (c) => `Los Campeones Eternos de ${c}`,
        'es-AR': (c) => `Los Campeones Eternos de ${c}`,
        'pt-BR': (c) => `Os Campeões Eternos de ${c}`,
        'fr-FR': (c) => `Les Champions Éternels de ${c}`,
      });
      return {
        title,
        priorityCategory: 'DYNASTY',
        description: `${streak} consecutive triumphs — the undisputed eternal sovereigns of world football!`,
      };
    }
  }

  // =========================================================================
  // PRIORITY 2 — PLAYER PERSONAL TROPHY LEGENDS
  // =========================================================================
  if (params.playerTotalWins >= 2) {
    const wins = params.playerTotalWins;

    if (wins === 2) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Second Crown of ${c}`,
        'es-ES': (c) => `La Segunda Corona de ${c}`,
        'es-AR': (c) => `La Segunda Corona de ${c}`,
        'pt-BR': (c) => `A Segunda Coroa de ${c}`,
        'fr-FR': (c) => `La Deuxième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `Lifting the continental trophy for the 2nd time in career history!`,
      };
    } else if (wins === 3) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Three Crowns of ${c}`,
        'es-ES': (c) => `Las Tres Coronas de ${c}`,
        'es-AR': (c) => `Las Tres Coronas de ${c}`,
        'pt-BR': (c) => `As Três Coroas de ${c}`,
        'fr-FR': (c) => `Les Trois Couronnes de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `A historic 3rd personal continental crown earned in ${city}!`,
      };
    } else if (wins === 4) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Fourth Crown of ${c}`,
        'es-ES': (c) => `La Cuarta Corona de ${c}`,
        'es-AR': (c) => `La Cuarta Corona de ${c}`,
        'pt-BR': (c) => `A Quarta Coroa de ${c}`,
        'fr-FR': (c) => `La Quatrième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `A 4th career continental winner medal secured in ${city}!`,
      };
    } else if (wins === 5) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Fifth Crown of ${c}`,
        'es-ES': (c) => `La Quinta Corona de ${c}`,
        'es-AR': (c) => `La Quinta Corona de ${c}`,
        'pt-BR': (c) => `A Quinta Coroa de ${c}`,
        'fr-FR': (c) => `La Cinquième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `Five-time continental king crowned under the floodlights of ${city}!`,
      };
    } else if (wins === 6) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Sixth Crown of ${c}`,
        'es-ES': (c) => `La Sexta Corona de ${c}`,
        'es-AR': (c) => `La Sexta Corona de ${c}`,
        'pt-BR': (c) => `A Sexta Coroa de ${c}`,
        'fr-FR': (c) => `La Sixième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `Six continental trophies — matching the greatest individual champions of all time!`,
      };
    } else if (wins === 7) {
      const title = formatCityTitle({
        'en-GB': (c) => `The Seventh Crown of ${c}`,
        'es-ES': (c) => `La Séptima Corona de ${c}`,
        'es-AR': (c) => `La Séptima Corona de ${c}`,
        'pt-BR': (c) => `A Sétima Coroa de ${c}`,
        'fr-FR': (c) => `La Septième Couronne de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `The legendary Hepta! Seven career continental crowns!`,
      };
    } else {
      const title = formatCityTitle({
        'en-GB': (c) => `The Immortal Crown of ${c}`,
        'es-ES': (c) => `La Corona Inmortal de ${c}`,
        'es-AR': (c) => `La Corona Inmortal de ${c}`,
        'pt-BR': (c) => `A Coroa Imortal de ${c}`,
        'fr-FR': (c) => `La Couronne Immortelle de ${c}`,
      });
      return {
        title,
        priorityCategory: 'PLAYER_CROWNS',
        description: `${wins} career continental titles — an untouchable record in world football!`,
      };
    }
  }

  // =========================================================================
  // PRIORITY 3 — THE MIRACLE OF [CITY] (Comeback from 2+ goals down)
  // =========================================================================
  if (params.trailedByTwoOrMore) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Miracle of ${c}`,
      'es-ES': (c) => `El Milagro de ${c}`,
      'es-AR': (c) => `El Milagro de ${c}`,
      'pt-BR': (c) => `O Milagre de ${c}`,
      'fr-FR': (c) => `Le Miracle de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MIRACLE',
      description: `An impossible comeback from 2+ goals down to steal continental glory!`,
    };
  }

  // =========================================================================
  // PRIORITY 4 — OTHER MAJOR MATCH-EVENT LEGENDS
  // =========================================================================

  // Hat-trick (3+ goals scored in final)
  if ((params.playerGoals || 0) >= 3) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Masterpiece of ${c}`,
      'es-ES': (c) => `La Obra Maestra de ${c}`,
      'es-AR': (c) => `La Obra Maestra de ${c}`,
      'pt-BR': (c) => `A Obra-Prima de ${c}`,
      'fr-FR': (c) => `Le Chef-d'œuvre de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A breathtaking hat-trick masterclass in the continental showpiece!`,
    };
  }

  // The Hero: Player scored 2+ goals and was MVP / decisive
  if ((params.playerGoals || 0) >= 2 && params.isMvp) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Hero of ${c}`,
      'es-ES': (c) => `El Héroe de ${c}`,
      'es-AR': (c) => `El Héroe de ${c}`,
      'pt-BR': (c) => `O Herói de ${c}`,
      'fr-FR': (c) => `Le Héros de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A decisive brace that carried the squad to continental glory!`,
    };
  }

  // The Battle: 2+ players received red cards during the final
  if ((params.redCardsCount || 0) >= 2) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Battle of ${c}`,
      'es-ES': (c) => `La Batalla de ${c}`,
      'es-AR': (c) => `La Batalla de ${c}`,
      'pt-BR': (c) => `A Batalha de ${c}`,
      'fr-FR': (c) => `La Bataille de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A fiercely contested final filled with cards, tension, and raw grit!`,
    };
  }

  // Stoppage-time / Last-minute winner
  if (params.lastMinuteWinner) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Stoppage-Time Triumph of ${c}`,
      'es-ES': (c) => `El Triunfo en el Descuento de ${c}`,
      'es-AR': (c) => `El Triunfo en el Descuento de ${c}`,
      'pt-BR': (c) => `O Triunfo nos Acréscimos de ${c}`,
      'fr-FR': (c) => `Le Triomphe dans le Temps Additionnel de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A dramatic last-gasp winner in the dying moments of the final!`,
    };
  }

  // Extra-time epic (120 minutes)
  if (params.wonInExtraTime) {
    const title = formatCityTitle({
      'en-GB': (c) => `The 120-Minute Epic of ${c}`,
      'es-ES': (c) => `La Epopeya de 120 Minutos de ${c}`,
      'es-AR': (c) => `La Épica de 120 Minutos de ${c}`,
      'pt-BR': (c) => `A Épica de 120 Minutos de ${c}`,
      'fr-FR': (c) => `L'Épopée de 120 Minutes de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `An exhausting, heroic 120-minute battle won in extra time!`,
    };
  }

  // Penalty Shootout drama
  if (params.wonOnPenalties) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Shootout of ${c}`,
      'es-ES': (c) => `Los Penales de ${c}`,
      'es-AR': (c) => `Los Penales de ${c}`,
      'pt-BR': (c) => `A Disputa de ${c}`,
      'fr-FR': (c) => `La Séance de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `Nerves of steel in a high-stakes penalty shootout drama!`,
    };
  }

  // Goalkeeper Masterclass
  if (params.isGoalkeeperMasterclass) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Wall of ${c}`,
      'es-ES': (c) => `El Muro de ${c}`,
      'es-AR': (c) => `El Muro de ${c}`,
      'pt-BR': (c) => `A Muralha de ${c}`,
      'fr-FR': (c) => `Le Mur de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `An impenetrable goalkeeping clinic that denied every opposing assault!`,
    };
  }

  // Historic Underdog Upset / Fairytale
  if (params.isHistoricUnderdogVictory) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Fairytale of ${c}`,
      'es-ES': (c) => `El Cuento de Hadas de ${c}`,
      'es-AR': (c) => `La Hazaña Soñada de ${c}`,
      'pt-BR': (c) => `O Conto de Fadas de ${c}`,
      'fr-FR': (c) => `Le Conte de Fées de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A sensational underdog story shocking the continental giants!`,
    };
  }

  // The Glory of [City]: Decisive win by 2+ goals
  if ((params.finalGoalDiff || 0) >= 2) {
    const title = formatCityTitle({
      'en-GB': (c) => `The Glory of ${c}`,
      'es-ES': (c) => `La Gloria de ${c}`,
      'es-AR': (c) => `La Gloria de ${c}`,
      'pt-BR': (c) => `A Glória de ${c}`,
      'fr-FR': (c) => `La Gloire de ${c}`,
    });
    return {
      title,
      priorityCategory: 'MATCH_EVENT',
      description: `A commanding victory by two or more goals in ${city}!`,
    };
  }

  // =========================================================================
  // PRIORITY 5 — NO LEGENDARY TITLE (Normal headline)
  // =========================================================================
  return { title: null, priorityCategory: 'NONE', description: null };
}
