import { FootballSchoolId } from '../types/youthFootballSchools';

export interface YouthTeamData {
  id: string;
  name: string;
  youthLeague: string;
  city: string;
  country: string;
  ovr: number;
  developmentStyle?: FootballSchoolId;
}

export interface YouthLeagueData {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  teams: YouthTeamData[];
}

export const YOUTH_LEAGUES_DATABASE: Record<string, YouthLeagueData> = {
  buenos_aires: {
    id: 'buenos_aires',
    name: 'Liga Bonaerense Juvenil',
    city: 'Buenos Aires',
    country: 'Argentina',
    flag: '🇦🇷',
    teams: [
      { id: 'ba-1', name: 'Palermo Juniors', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 50, developmentStyle: 'paladar_negro' },
      { id: 'ba-2', name: 'Belgrano Plate', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 48, developmentStyle: 'futbol_champan' },
      { id: 'ba-3', name: 'Recoleta Estudiantes', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 47, developmentStyle: 'paladar_negro' },
      { id: 'ba-4', name: 'Caballito Atlético', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 45, developmentStyle: 'futbol_champan' },
      { id: 'ba-5', name: 'San Telmo Deportivo', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 43, developmentStyle: 'paladar_negro' },
      { id: 'ba-6', name: 'Flores FC', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 42, developmentStyle: 'futbol_champan' },
      { id: 'ba-7', name: 'La Boca Unión', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 41, developmentStyle: 'paladar_negro' },
      { id: 'ba-8', name: 'Barracas Sportivo', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 40, developmentStyle: 'futbol_champan' },
      { id: 'ba-9', name: 'Mataderos Juniors', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 40, developmentStyle: 'paladar_negro' },
      { id: 'ba-10', name: 'Villa Lugano Deportivo', youthLeague: 'Liga Bonaerense Juvenil', city: 'Buenos Aires', country: 'Argentina', ovr: 40, developmentStyle: 'futbol_champan' },
    ],
  },
  sao_paulo: {
    id: 'sao_paulo',
    name: 'Liga Paulista Juvenil',
    city: 'São Paulo',
    country: 'Brazil',
    flag: '🇧🇷',
    teams: [
      { id: 'sp-1', name: 'Moema Atlético Clube', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 50, developmentStyle: 'jogo_bonito' },
      { id: 'sp-2', name: 'Pinheiros Futebol Clube', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 48, developmentStyle: 'relational_play' },
      { id: 'sp-3', name: 'Vila Mariana Esporte Clube', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 47, developmentStyle: 'jogo_bonito' },
      { id: 'sp-4', name: 'Tatuapé Atlético', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 45, developmentStyle: 'relational_play' },
      { id: 'sp-5', name: 'Liberdade Futebol Clube', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 43, developmentStyle: 'jogo_bonito' },
      { id: 'sp-6', name: 'Santana União Esportiva', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 42, developmentStyle: 'relational_play' },
      { id: 'sp-7', name: 'Lapa Associação Futebol', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 41, developmentStyle: 'jogo_bonito' },
      { id: 'sp-8', name: 'Ipiranga Esporte Clube', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 40, developmentStyle: 'relational_play' },
      { id: 'sp-9', name: 'Guaianases Juventude', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 40, developmentStyle: 'jogo_bonito' },
      { id: 'sp-10', name: 'Capela do Socorro Atlético', youthLeague: 'Liga Paulista Juvenil', city: 'São Paulo', country: 'Brazil', ovr: 40, developmentStyle: 'relational_play' },
    ],
  },
  madrid: {
    id: 'madrid',
    name: 'Liga Madrileña Juvenil',
    city: 'Madrid',
    country: 'Spain',
    flag: '🇪🇸',
    teams: [
      { id: 'mad-1', name: 'Chamartín Atlético', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 50, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-2', name: 'Salamanca Club Deportivo', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 48, developmentStyle: 'tiki_taka' },
      { id: 'mad-3', name: 'Retiro Deportivo', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 47, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-4', name: 'Argüelles Unión Deportiva', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 45, developmentStyle: 'tiki_taka' },
      { id: 'mad-5', name: 'Malasaña Racing Club', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 43, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-6', name: 'Lavapiés Atlético', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 42, developmentStyle: 'tiki_taka' },
      { id: 'mad-7', name: 'Carabanchel Sporting', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 41, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-8', name: 'Vallecas Deportivo', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 40, developmentStyle: 'tiki_taka' },
      { id: 'mad-9', name: 'Usera Cultural', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 40, developmentStyle: 'high_intensity_defense' },
      { id: 'mad-10', name: 'Villaverde Gimnástico', youthLeague: 'Liga Madrileña Juvenil', city: 'Madrid', country: 'Spain', ovr: 40, developmentStyle: 'tiki_taka' },
    ],
  },
  london: {
    id: 'london',
    name: 'London Youth League',
    city: 'London',
    country: 'England',
    flag: '🏴',
    teams: [
      { id: 'lon-1', name: 'Kensington United', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 50, developmentStyle: 'brexit_ball' },
      { id: 'lon-2', name: 'Camden Athletic', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 48, developmentStyle: 'modern_english' },
      { id: 'lon-3', name: 'Westminster FC', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 47, developmentStyle: 'brexit_ball' },
      { id: 'lon-4', name: 'Greenwich Rovers', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 45, developmentStyle: 'modern_english' },
      { id: 'lon-5', name: 'Islington Town', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 43, developmentStyle: 'brexit_ball' },
      { id: 'lon-6', name: 'Hackney Borough', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 42, developmentStyle: 'modern_english' },
      { id: 'lon-7', name: 'Brixton Athletic', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 41, developmentStyle: 'brexit_ball' },
      { id: 'lon-8', name: 'Croydon FC', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 40, developmentStyle: 'modern_english' },
      { id: 'lon-9', name: 'Peckham Rovers', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 40, developmentStyle: 'brexit_ball' },
      { id: 'lon-10', name: 'Tottenham Hale Town', youthLeague: 'London Youth League', city: 'London', country: 'England', ovr: 40, developmentStyle: 'modern_english' },
    ],
  },
  paris: {
    id: 'paris',
    name: 'Ligue Parisienne des Jeunes',
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    teams: [
      { id: 'par-1', name: 'Montmartre Olympique', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 50, developmentStyle: 'counter_attack' },
      { id: 'par-2', name: 'Passy Racing Club', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 48, developmentStyle: 'french_possession' },
      { id: 'par-3', name: 'Bastille Athletic', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 47, developmentStyle: 'counter_attack' },
      { id: 'par-4', name: 'Belleville Football Club', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 45, developmentStyle: 'french_possession' },
      { id: 'par-5', name: 'Le Marais Union Sportive', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 43, developmentStyle: 'counter_attack' },
      { id: 'par-6', name: 'Montparnasse Stade', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 42, developmentStyle: 'french_possession' },
      { id: 'par-7', name: 'Batignolles Sporting', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 41, developmentStyle: 'counter_attack' },
      { id: 'par-8', name: 'La Villette FC', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 40, developmentStyle: 'french_possession' },
      { id: 'par-9', name: 'Clignancourt Olympique', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 40, developmentStyle: 'counter_attack' },
      { id: 'par-10', name: 'Auteuil Athletic Club', youthLeague: 'Ligue Parisienne des Jeunes', city: 'Paris', country: 'France', ovr: 40, developmentStyle: 'french_possession' },
    ],
  },
};

/**
  Finds the official Youth League matching a city/country input.
  Returns null if no matching league exists in the database.
 */
export function getYouthLeagueByCity(cityName?: string): YouthLeagueData | null {
  if (!cityName) return null;
  const normalized = cityName.toLowerCase().trim();

  if (normalized.includes('buenos aires') || normalized.includes('argentina') || normalized.includes('bonaerense')) {
    return YOUTH_LEAGUES_DATABASE.buenos_aires;
  }
  if (normalized.includes('são paulo') || normalized.includes('sao paulo') || normalized.includes('brazil') || normalized.includes('brasil') || normalized.includes('paulista')) {
    return YOUTH_LEAGUES_DATABASE.sao_paulo;
  }
  if (normalized.includes('madrid') || normalized.includes('spain') || normalized.includes('españa') || normalized.includes('madrileña')) {
    return YOUTH_LEAGUES_DATABASE.madrid;
  }
  if (normalized.includes('london') || normalized.includes('england') || normalized.includes('english')) {
    return YOUTH_LEAGUES_DATABASE.london;
  }
  if (normalized.includes('paris') || normalized.includes('france') || normalized.includes('parisienne')) {
    return YOUTH_LEAGUES_DATABASE.paris;
  }

  return null;
}

/**
 * Resolves the player's authoritative current youth league.
 * Matches by youthLeagueName, youth team / club name, city, or nationality/country.
 */
export function getPlayerCurrentYouthLeague(player?: {
  youthLeagueName?: string;
  youthTeamName?: string;
  club?: string;
  city?: string;
  startingCity?: string;
  clubCountry?: string;
  country?: string;
  nationality?: { name?: string; code?: string } | string;
} | null): YouthLeagueData {
  if (!player) return YOUTH_LEAGUES_DATABASE.sao_paulo;

  // 1. By explicit youth league name
  const yLeague = (player.youthLeagueName || '').toLowerCase().trim();
  if (yLeague) {
    for (const league of Object.values(YOUTH_LEAGUES_DATABASE)) {
      if (league.name.toLowerCase() === yLeague || league.id.toLowerCase() === yLeague) {
        return league;
      }
    }
  }

  // 2. By club / youth team name
  const clubName = (player.youthTeamName || player.club || '').toLowerCase().trim();
  if (clubName) {
    for (const league of Object.values(YOUTH_LEAGUES_DATABASE)) {
      if (league.teams.some((t) => t.name.toLowerCase() === clubName)) {
        return league;
      }
    }
  }

  // 3. By city / starting city
  const city = player.city || player.startingCity || '';
  const byCity = getYouthLeagueByCity(city);
  if (byCity) return byCity;

  // 4. By club country / nationality
  const country =
    player.clubCountry ||
    player.country ||
    (typeof player.nationality === 'string' ? player.nationality : player.nationality?.name) ||
    '';
  const byCountry = getYouthLeagueByCity(country);
  if (byCountry) return byCountry;

  return YOUTH_LEAGUES_DATABASE.sao_paulo;
}
