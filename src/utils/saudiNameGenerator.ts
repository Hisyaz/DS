import { Nationality } from '../types';
import { NATIONALITIES } from '../constants';

interface SaudiLeagueNationalityDistribution {
  code: string;
  iso: string;
  name: string;
  weight: number;
  firstNames: string[];
  lastNames: string[];
}

export const SAUDI_LEAGUE_NATIONALITIES: SaudiLeagueNationalityDistribution[] = [
  // SAUDI ARABIA — 64%
  {
    code: 'KSA',
    iso: 'sa',
    name: 'Saudi Arabia',
    weight: 64,
    firstNames: [
      'Mohammed', 'Abdullah', 'Abdulrahman', 'Faisal', 'Omar',
      'Ahmed', 'Khalid', 'Saud', 'Sultan', 'Abdulaziz',
      'Fahad', 'Nasser', 'Yasser', 'Salem', 'Saleh',
      'Hassan', 'Ibrahim', 'Majed', 'Turki', 'Nawaf',
    ],
    lastNames: [
      'Al-Ghamdi', 'Al-Qahtani', 'Al-Harbi', 'Al-Dosari', 'Al-Otaibi',
      'Al-Shahrani', 'Al-Shehri', 'Al-Zahrani', 'Al-Mutairi', 'Al-Salem',
      'Al-Qahtani', 'Al-Anazi', 'Al-Hassan', 'Al-Rashidi', 'Al-Dawsari',
    ],
  },
  // PORTUGAL — 4%
  {
    code: 'POR',
    iso: 'pt',
    name: 'Portugal',
    weight: 4,
    firstNames: ['João', 'Diogo', 'Miguel', 'Pedro', 'Tiago', 'Rafael'],
    lastNames: ['Silva', 'Santos', 'Ferreira', 'Pereira'],
  },
  // BRAZIL — 4%
  {
    code: 'BRA',
    iso: 'br',
    name: 'Brazil',
    weight: 4,
    firstNames: ['Gabriel', 'Lucas', 'João', 'Miguel', 'Pedro', 'Matheus'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza'],
  },
  // FRANCE — 4%
  {
    code: 'FRA',
    iso: 'fr',
    name: 'France',
    weight: 4,
    firstNames: ['Lucas', 'Gabriel', 'Kylian', 'Hugo', 'Nathan', 'Théo'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas'],
  },
  // SENEGAL — 3%
  {
    code: 'SEN',
    iso: 'sn',
    name: 'Senegal',
    weight: 3,
    firstNames: ['Sadio', 'Amadou', 'Ibrahima', 'Mamadou', 'Ousmane', 'Abdoulaye'],
    lastNames: ['Ndiaye', 'Diop', 'Fall', 'Diallo'],
  },
  // MOROCCO — 3%
  {
    code: 'MAR',
    iso: 'ma',
    name: 'Morocco',
    weight: 3,
    firstNames: ['Youssef', 'Adam', 'Amine', 'Hamza', 'Zakaria', 'Ayoub'],
    lastNames: ['El Amrani', 'Benali', 'Alaoui', 'Idrissi'],
  },
  // ARGENTINA — 2%
  {
    code: 'ARG',
    iso: 'ar',
    name: 'Argentina',
    weight: 2,
    firstNames: ['Mateo', 'Santiago', 'Thiago', 'Nicolás', 'Tomás', 'Lautaro'],
    lastNames: ['González', 'Fernández', 'Rodríguez', 'Martínez'],
  },
  // ALGERIA — 2%
  {
    code: 'ALG',
    iso: 'dz',
    name: 'Algeria',
    weight: 2,
    firstNames: ['Yacine', 'Riyad', 'Amine', 'Ismaël', 'Youcef', 'Sofiane'],
    lastNames: ['Benali', 'Bensebaini', 'Belkebla', 'Slimani'],
  },
  // EGYPT — 2%
  {
    code: 'EGY',
    iso: 'eg',
    name: 'Egypt',
    weight: 2,
    firstNames: ['Mohamed', 'Omar', 'Ahmed', 'Mahmoud', 'Mostafa', 'Youssef'],
    lastNames: ['Mohamed', 'Hassan', 'Mahmoud', 'Ibrahim'],
  },
  // SPAIN — 2%
  {
    code: 'ESP',
    iso: 'es',
    name: 'Spain',
    weight: 2,
    firstNames: ['Alejandro', 'Álvaro', 'Hugo', 'Pablo', 'Mateo', 'Daniel'],
    lastNames: ['García', 'Fernández', 'González', 'Rodríguez'],
  },
  // CROATIA — 1%
  {
    code: 'CRO',
    iso: 'hr',
    name: 'Croatia',
    weight: 1,
    firstNames: ['Luka', 'Ivan', 'Mateo', 'Marko', 'Josip'],
    lastNames: ['Horvat', 'Kovač', 'Babić'],
  },
  // BELGIUM — 1%
  {
    code: 'BEL',
    iso: 'be',
    name: 'Belgium',
    weight: 1,
    firstNames: ['Arthur', 'Louis', 'Jules', 'Lucas', 'Noah'],
    lastNames: ['Peeters', 'Janssens', 'Maes'],
  },
  // URUGUAY — 1%
  {
    code: 'URU',
    iso: 'uy',
    name: 'Uruguay',
    weight: 1,
    firstNames: ['Mateo', 'Santiago', 'Facundo', 'Nicolás', 'Agustín'],
    lastNames: ['Rodríguez', 'González', 'Fernández'],
  },
  // ENGLAND — 1%
  {
    code: 'ENG',
    iso: 'gb-eng',
    name: 'England',
    weight: 1,
    firstNames: ['Jack', 'Harry', 'Oliver', 'James', 'William'],
    lastNames: ['Smith', 'Jones', 'Taylor'],
  },
  // CÔTE D'IVOIRE — 1%
  {
    code: 'CIV',
    iso: 'ci',
    name: 'Ivory Coast',
    weight: 1,
    firstNames: ['Jean', 'Serge', 'Yao', 'Koffi', 'Ibrahim'],
    lastNames: ['Kouassi', 'Traoré', 'Koné'],
  },
  // MALI — 1%
  {
    code: 'MLI',
    iso: 'ml',
    name: 'Mali',
    weight: 1,
    firstNames: ['Amadou', 'Moussa', 'Ibrahim', 'Oumar', 'Cheick'],
    lastNames: ['Traoré', 'Coulibaly', 'Diarra'],
  },
  // GHANA — 1%
  {
    code: 'GHA',
    iso: 'gh',
    name: 'Ghana',
    weight: 1,
    firstNames: ['Daniel', 'Kwame', 'Samuel', 'Emmanuel', 'Kojo'],
    lastNames: ['Mensah', 'Asante', 'Owusu'],
  },
  // NIGERIA — 1%
  {
    code: 'NGA',
    iso: 'ng',
    name: 'Nigeria',
    weight: 1,
    firstNames: ['David', 'Chinedu', 'Emmanuel', 'Samuel', 'Daniel'],
    lastNames: ['Okafor', 'Eze', 'Adeyemi'],
  },
  // THE GAMBIA — 1%
  {
    code: 'GMB',
    iso: 'gm',
    name: 'The Gambia',
    weight: 1,
    firstNames: ['Musa', 'Ebrima', 'Lamin', 'Alieu', 'Modou'],
    lastNames: ['Jallow', 'Darboe', 'Touray'],
  },
  // GUINEA — 1%
  {
    code: 'GIN',
    iso: 'gn',
    name: 'Guinea',
    weight: 1,
    firstNames: ['Mohamed', 'Ibrahima', 'Abdoulaye', 'Mamadou', 'Amadou'],
    lastNames: ['Camara', 'Diallo', 'Bangoura'],
  },
];

const TOTAL_WEIGHT = SAUDI_LEAGUE_NATIONALITIES.reduce((sum, item) => sum + item.weight, 0);

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateSaudiPlayerNationalityAndName(): { name: string; nationality: Nationality; isLocalSaudi: boolean } {
  let roll = Math.random() * TOTAL_WEIGHT;
  let selected = SAUDI_LEAGUE_NATIONALITIES[0];

  for (const item of SAUDI_LEAGUE_NATIONALITIES) {
    if (roll < item.weight) {
      selected = item;
      break;
    }
    roll -= item.weight;
  }

  const firstName = getRandomElement(selected.firstNames);
  const lastName = getRandomElement(selected.lastNames);
  const fullName = `${firstName} ${lastName}`;

  const matched = NATIONALITIES.find(
    (n) => n.code.toUpperCase() === selected.code.toUpperCase() || n.name.toLowerCase() === selected.name.toLowerCase()
  );

  const nationality: Nationality = matched || {
    code: selected.code,
    iso: selected.iso,
    name: selected.name,
  };

  const isLocalSaudi = selected.code === 'KSA' || selected.code === 'SAU';

  return {
    name: fullName,
    nationality,
    isLocalSaudi,
  };
}
