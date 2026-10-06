import { Nationality } from '../types';
import { NATIONALITIES } from '../constants';

interface ItalianNationalityDistribution {
  code: string;
  iso: string;
  name: string;
  weight: number;
  firstNames: string[];
  lastNames: string[];
}

export const ITALIAN_LEAGUE_NATIONALITIES: ItalianNationalityDistribution[] = [
  // 1. ITALY — 61%
  {
    code: 'ITA',
    iso: 'it',
    name: 'Italy',
    weight: 61,
    firstNames: [
      'Alessandro', 'Francesco', 'Lorenzo', 'Leonardo', 'Matteo',
      'Luca', 'Marco', 'Andrea', 'Giuseppe', 'Davide',
      'Federico', 'Riccardo', 'Antonio', 'Stefano', 'Giovanni',
      'Simone', 'Tommaso', 'Gabriele', 'Filippo', 'Niccolò'
    ],
    lastNames: [
      'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi',
      'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco',
      'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini'
    ],
  },
  // 2. FRANCE — 5%
  {
    code: 'FRA',
    iso: 'fr',
    name: 'France',
    weight: 5,
    firstNames: ['Lucas', 'Gabriel', 'Louis', 'Jules', 'Hugo', 'Arthur', 'Nathan', 'Théo', 'Mathis', 'Antoine'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard'],
  },
  // 3. BRAZIL — 4%
  {
    code: 'BRA',
    iso: 'br',
    name: 'Brazil',
    weight: 4,
    firstNames: ['Gabriel', 'Lucas', 'João', 'Miguel', 'Pedro', 'Matheus'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza'],
  },
  // 4. ARGENTINA — 4%
  {
    code: 'ARG',
    iso: 'ar',
    name: 'Argentina',
    weight: 4,
    firstNames: ['Mateo', 'Santiago', 'Thiago', 'Nicolás', 'Tomás', 'Lautaro'],
    lastNames: ['González', 'Fernández', 'Rodríguez', 'Martínez'],
  },
  // 5. NETHERLANDS — 3%
  {
    code: 'NED',
    iso: 'nl',
    name: 'Netherlands',
    weight: 3,
    firstNames: ['Daan', 'Bram', 'Sem', 'Lars', 'Lucas', 'Finn'],
    lastNames: ['de Jong', 'van Dijk', 'Jansen', 'Bakker'],
  },
  // 6. ALBANIA — 3%
  {
    code: 'ALB',
    iso: 'al',
    name: 'Albania',
    weight: 3,
    firstNames: ['Kristjan', 'Ernest', 'Armando', 'Mario', 'Klaus', 'Rey'],
    lastNames: ['Hoxha', 'Kola', 'Dervishi', 'Laci'],
  },
  // 7. SERBIA — 3%
  {
    code: 'SRB',
    iso: 'rs',
    name: 'Serbia',
    weight: 3,
    firstNames: ['Luka', 'Nikola', 'Marko', 'Stefan', 'Aleksandar', 'Filip'],
    lastNames: ['Jovanović', 'Petrović', 'Nikolić', 'Stojanović'],
  },
  // 8. SPAIN — 2%
  {
    code: 'ESP',
    iso: 'es',
    name: 'Spain',
    weight: 2,
    firstNames: ['Alejandro', 'Álvaro', 'Hugo', 'Pablo', 'Mateo', 'Daniel'],
    lastNames: ['García', 'Fernández', 'González', 'Rodríguez'],
  },
  // 9. CROATIA — 2%
  {
    code: 'CRO',
    iso: 'hr',
    name: 'Croatia',
    weight: 2,
    firstNames: ['Luka', 'Ivan', 'Mateo', 'Marko', 'Josip', 'Ante'],
    lastNames: ['Horvat', 'Kovač', 'Babić', 'Marić'],
  },
  // 10. ROMANIA — 2%
  {
    code: 'ROU',
    iso: 'ro',
    name: 'Romania',
    weight: 2,
    firstNames: ['Andrei', 'Alexandru', 'David', 'Luca', 'Mihai', 'Radu'],
    lastNames: ['Popescu', 'Ionescu', 'Dumitru', 'Stan'],
  },
  // 11. COLOMBIA — 2%
  {
    code: 'COL',
    iso: 'co',
    name: 'Colombia',
    weight: 2,
    firstNames: ['Juan', 'Santiago', 'Mateo', 'Sebastián', 'Andrés', 'Daniel'],
    lastNames: ['Rodríguez', 'Martínez', 'González', 'Gómez'],
  },
  // 12. GERMANY — 2%
  {
    code: 'GER',
    iso: 'de',
    name: 'Germany',
    weight: 2,
    firstNames: ['Lukas', 'Leon', 'Finn', 'Paul', 'Jonas', 'Felix'],
    lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer'],
  },
  // 13. SWITZERLAND — 1%
  {
    code: 'SUI',
    iso: 'ch',
    name: 'Switzerland',
    weight: 1,
    firstNames: ['Noah', 'Luca', 'Leon', 'Nico', 'Julian'],
    lastNames: ['Müller', 'Meier', 'Keller'],
  },
  // 14. POLAND — 1%
  {
    code: 'POL',
    iso: 'pl',
    name: 'Poland',
    weight: 1,
    firstNames: ['Jakub', 'Antoni', 'Jan', 'Szymon', 'Kacper'],
    lastNames: ['Nowak', 'Kowalski', 'Wiśniewski'],
  },
  // 15. PORTUGAL — 1%
  {
    code: 'POR',
    iso: 'pt',
    name: 'Portugal',
    weight: 1,
    firstNames: ['João', 'Diogo', 'Miguel', 'Pedro', 'Tiago'],
    lastNames: ['Silva', 'Santos', 'Ferreira'],
  },
  // 16. BELGIUM — 1%
  {
    code: 'BEL',
    iso: 'be',
    name: 'Belgium',
    weight: 1,
    firstNames: ['Arthur', 'Louis', 'Jules', 'Lucas', 'Noah'],
    lastNames: ['Peeters', 'Janssens', 'Maes'],
  },
  // 17. NIGERIA — 1%
  {
    code: 'NGA',
    iso: 'ng',
    name: 'Nigeria',
    weight: 1,
    firstNames: ['David', 'Chinedu', 'Emmanuel', 'Samuel', 'Daniel'],
    lastNames: ['Okafor', 'Eze', 'Adeyemi'],
  },
  // 18. GHANA — 1%
  {
    code: 'GHA',
    iso: 'gh',
    name: 'Ghana',
    weight: 1,
    firstNames: ['Daniel', 'Kwame', 'Samuel', 'Emmanuel', 'Kojo'],
    lastNames: ['Mensah', 'Asante', 'Owusu'],
  },
  // 19. CÔTE D'IVOIRE — 1%
  {
    code: 'CIV',
    iso: 'ci',
    name: "Côte d'Ivoire",
    weight: 1,
    firstNames: ['Jean', 'Serge', 'Yao', 'Koffi', 'Ibrahim'],
    lastNames: ['Kouassi', 'Traoré', 'Koné'],
  },
  // 20. MOROCCO — 1%
  {
    code: 'MAR',
    iso: 'ma',
    name: 'Morocco',
    weight: 1,
    firstNames: ['Youssef', 'Adam', 'Amine', 'Hamza', 'Zakaria'],
    lastNames: ['El Amrani', 'Benali', 'Alaoui'],
  },
  // 21. ALGERIA — 1%
  {
    code: 'ALG',
    iso: 'dz',
    name: 'Algeria',
    weight: 1,
    firstNames: ['Yacine', 'Riyad', 'Amine', 'Ismaël', 'Youcef'],
    lastNames: ['Benali', 'Bensebaini', 'Belkebla'],
  },
  // 22. TURKEY — 1%
  {
    code: 'TUR',
    iso: 'tr',
    name: 'Turkey',
    weight: 1,
    firstNames: ['Arda', 'Emir', 'Kerem', 'Can', 'Mert'],
    lastNames: ['Yılmaz', 'Kaya', 'Demir'],
  },
  // 23. GREECE — 1%
  {
    code: 'GRE',
    iso: 'gr',
    name: 'Greece',
    weight: 1,
    firstNames: ['Giorgos', 'Dimitris', 'Nikos', 'Kostas', 'Andreas'],
    lastNames: ['Papadopoulos', 'Pappas', 'Nikolaidis'],
  },
  // 24. NORWAY — 1%
  {
    code: 'NOR',
    iso: 'no',
    name: 'Norway',
    weight: 1,
    firstNames: ['Emil', 'Magnus', 'Sander', 'Oskar', 'Elias'],
    lastNames: ['Hansen', 'Johansen', 'Olsen'],
  },
  // 25. SWEDEN — 1%
  {
    code: 'SWE',
    iso: 'se',
    name: 'Sweden',
    weight: 1,
    firstNames: ['Elias', 'Oscar', 'Hugo', 'William', 'Axel'],
    lastNames: ['Andersson', 'Johansson', 'Karlsson'],
  },
  // 26. URUGUAY — 1%
  {
    code: 'URU',
    iso: 'uy',
    name: 'Uruguay',
    weight: 1,
    firstNames: ['Mateo', 'Santiago', 'Facundo', 'Nicolás', 'Agustín'],
    lastNames: ['Rodríguez', 'González', 'Fernández'],
  },
  // 27. CHILE — 1%
  {
    code: 'CHI',
    iso: 'cl',
    name: 'Chile',
    weight: 1,
    firstNames: ['Benjamín', 'Vicente', 'Matías', 'Diego', 'Nicolás'],
    lastNames: ['González', 'Muñoz', 'Rojas'],
  },
];

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomItalianWeightedNationality(): ItalianNationalityDistribution {
  const totalWeight = ITALIAN_LEAGUE_NATIONALITIES.reduce((sum, n) => sum + n.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of ITALIAN_LEAGUE_NATIONALITIES) {
    if (random < item.weight) {
      return item;
    }
    random -= item.weight;
  }

  return ITALIAN_LEAGUE_NATIONALITIES[0];
}

export function generateItalianPlayerNationalityAndName(): {
  name: string;
  firstName: string;
  lastName: string;
  nationality: Nationality;
} {
  const selected = getRandomItalianWeightedNationality();
  const firstName = getRandomElement(selected.firstNames);
  const lastName = getRandomElement(selected.lastNames);

  // Match or fallback to nationality constants
  const matchedNat = NATIONALITIES.find(
    (n) => n.code.toUpperCase() === selected.code.toUpperCase()
  );

  const nationality: Nationality = matchedNat || {
    code: selected.code,
    iso: selected.iso,
    name: selected.name,
  };

  return {
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    nationality,
  };
}
