export interface NationDistributionConfig {
  code: string;
  iso: string;
  name: string;
  flag: string;
  weight: number;
  firstNames: string[];
  lastNames: string[];
}

export const ENGLISH_LEAGUE_NATION_DISTRIBUTION: NationDistributionConfig[] = [
  {
    code: 'ENG',
    iso: 'ENG',
    name: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    weight: 42,
    firstNames: ['Oliver', 'George', 'Harry', 'Jack', 'Noah', 'Charlie', 'James', 'Thomas', 'William', 'Daniel', 'Henry', 'Oscar', 'Arthur', 'Leo', 'Alfie', 'Theodore', 'Freddie', 'Archie', 'Joshua', 'Edward'],
    lastNames: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts'],
  },
  {
    code: 'FR',
    iso: 'FRA',
    name: 'France',
    flag: '🇫🇷',
    weight: 5,
    firstNames: ['Lucas', 'Gabriel', 'Louis', 'Jules', 'Hugo', 'Arthur', 'Nathan', 'Théo', 'Mathis', 'Antoine'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard'],
  },
  {
    code: 'IRL',
    iso: 'IRL',
    name: 'Republic of Ireland',
    flag: '🇮🇪',
    weight: 4,
    firstNames: ['Jack', 'Sean', 'Conor', 'Cian', 'Liam', 'Oisín', 'Finn', 'Ryan'],
    lastNames: ['Murphy', 'Kelly', "O'Brien", 'Walsh', 'Byrne'],
  },
  {
    code: 'SCO',
    iso: 'SCO',
    name: 'Scotland',
    flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    weight: 4,
    firstNames: ['Callum', 'Lewis', 'Finlay', 'Cameron', 'Angus', 'Ewan', 'Hamish', 'Ross'],
    lastNames: ['Smith', 'Brown', 'Wilson', 'Robertson', 'Campbell'],
  },
  {
    code: 'WAL',
    iso: 'WAL',
    name: 'Wales',
    flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    weight: 4,
    firstNames: ['Rhys', 'Owen', 'Dylan', 'Ioan', 'Gareth', 'Gethin', 'Morgan', 'Dafydd'],
    lastNames: ['Jones', 'Williams', 'Davies', 'Evans', 'Thomas'],
  },
  {
    code: 'NED',
    iso: 'NED',
    name: 'Netherlands',
    flag: '🇳🇱',
    weight: 3,
    firstNames: ['Daan', 'Bram', 'Sem', 'Lars', 'Lucas', 'Finn'],
    lastNames: ['de Jong', 'van Dijk', 'Jansen', 'Bakker'],
  },
  {
    code: 'BRA',
    iso: 'BRA',
    name: 'Brazil',
    flag: '🇧🇷',
    weight: 3,
    firstNames: ['Gabriel', 'Lucas', 'João', 'Miguel', 'Pedro', 'Matheus'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza'],
  },
  {
    code: 'ESP',
    iso: 'ESP',
    name: 'Spain',
    flag: '🇪🇸',
    weight: 3,
    firstNames: ['Alejandro', 'Álvaro', 'Hugo', 'Pablo', 'Mateo', 'Daniel'],
    lastNames: ['García', 'Fernández', 'González', 'Rodríguez'],
  },
  {
    code: 'GER',
    iso: 'DEU',
    name: 'Germany',
    flag: '🇩🇪',
    weight: 2,
    firstNames: ['Lukas', 'Leon', 'Finn', 'Paul', 'Jonas', 'Felix'],
    lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer'],
  },
  {
    code: 'DEN',
    iso: 'DNK',
    name: 'Denmark',
    flag: '🇩🇰',
    weight: 2,
    firstNames: ['Emil', 'Mikkel', 'William', 'Magnus', 'Oliver', 'Noah'],
    lastNames: ['Nielsen', 'Jensen', 'Hansen', 'Pedersen'],
  },
  {
    code: 'POR',
    iso: 'PRT',
    name: 'Portugal',
    flag: '🇵🇹',
    weight: 2,
    firstNames: ['João', 'Diogo', 'Miguel', 'Pedro', 'Tiago', 'Rafael'],
    lastNames: ['Silva', 'Santos', 'Ferreira', 'Pereira'],
  },
  {
    code: 'BEL',
    iso: 'BEL',
    name: 'Belgium',
    flag: '🇧🇪',
    weight: 2,
    firstNames: ['Arthur', 'Louis', 'Jules', 'Lucas', 'Noah', 'Mathis'],
    lastNames: ['Peeters', 'Janssens', 'Maes', 'Dubois'],
  },
  {
    code: 'SWE',
    iso: 'SWE',
    name: 'Sweden',
    flag: '🇸🇪',
    weight: 2,
    firstNames: ['Elias', 'Oscar', 'Hugo', 'William', 'Axel', 'Leo'],
    lastNames: ['Andersson', 'Johansson', 'Karlsson', 'Nilsson'],
  },
  {
    code: 'ITA',
    iso: 'ITA',
    name: 'Italy',
    flag: '🇮🇹',
    weight: 2,
    firstNames: ['Matteo', 'Luca', 'Leonardo', 'Lorenzo', 'Francesco', 'Alessandro'],
    lastNames: ['Rossi', 'Romano', 'Ferrari', 'Esposito'],
  },
  {
    code: 'NOR',
    iso: 'NOR',
    name: 'Norway',
    flag: '🇳🇴',
    weight: 1,
    firstNames: ['Emil', 'Magnus', 'Sander', 'Oskar', 'Elias'],
    lastNames: ['Hansen', 'Johansen', 'Olsen'],
  },
  {
    code: 'NGA',
    iso: 'NGA',
    name: 'Nigeria',
    flag: '🇳🇬',
    weight: 1,
    firstNames: ['David', 'Chinedu', 'Emmanuel', 'Samuel', 'Daniel'],
    lastNames: ['Okafor', 'Eze', 'Adeyemi'],
  },
  {
    code: 'ARG',
    iso: 'ARG',
    name: 'Argentina',
    flag: '🇦🇷',
    weight: 1,
    firstNames: ['Mateo', 'Santiago', 'Thiago', 'Nicolás', 'Tomás'],
    lastNames: ['González', 'Fernández', 'Rodríguez'],
  },
  {
    code: 'USA',
    iso: 'USA',
    name: 'United States',
    flag: '🇺🇸',
    weight: 1,
    firstNames: ['Liam', 'Mason', 'Ethan', 'Noah', 'Jackson'],
    lastNames: ['Johnson', 'Williams', 'Davis'],
  },
  {
    code: 'JPN',
    iso: 'JPN',
    name: 'Japan',
    flag: '🇯🇵',
    weight: 1,
    firstNames: ['Haruto', 'Ren', 'Yuto', 'Sota', 'Kaito'],
    lastNames: ['Sato', 'Tanaka', 'Suzuki'],
  },
  {
    code: 'COL',
    iso: 'COL',
    name: 'Colombia',
    flag: '🇨🇴',
    weight: 1,
    firstNames: ['Juan', 'Santiago', 'Mateo', 'Sebastián', 'Andrés'],
    lastNames: ['Rodríguez', 'Martínez', 'González'],
  },
  {
    code: 'AUS',
    iso: 'AUS',
    name: 'Australia',
    flag: '🇦🇺',
    weight: 1,
    firstNames: ['Jack', 'Oliver', 'William', 'Noah', 'Lachlan'],
    lastNames: ['Smith', 'Jones', 'Williams'],
  },
  {
    code: 'CAN',
    iso: 'CAN',
    name: 'Canada',
    flag: '🇨🇦',
    weight: 1,
    firstNames: ['Liam', 'Noah', 'Lucas', 'Benjamin', 'Owen'],
    lastNames: ['Smith', 'Brown', 'Wilson'],
  },
  {
    code: 'CIV',
    iso: 'CIV',
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    weight: 1,
    firstNames: ['Jean', 'Serge', 'Yao', 'Koffi', 'Ibrahim'],
    lastNames: ['Kouassi', 'Traoré', 'Koné'],
  },
  {
    code: 'GHA',
    iso: 'GHA',
    name: 'Ghana',
    flag: '🇬🇭',
    weight: 1,
    firstNames: ['Daniel', 'Kwame', 'Samuel', 'Emmanuel', 'Kojo'],
    lastNames: ['Mensah', 'Asante', 'Owusu'],
  },
  {
    code: 'MAR',
    iso: 'MAR',
    name: 'Morocco',
    flag: '🇲🇦',
    weight: 1,
    firstNames: ['Youssef', 'Adam', 'Amine', 'Hamza', 'Zakaria'],
    lastNames: ['El Amrani', 'Benali', 'Alaoui'],
  },
  {
    code: 'CMR',
    iso: 'CMR',
    name: 'Cameroon',
    flag: '🇨🇲',
    weight: 1,
    firstNames: ['Jean', 'André', 'Emmanuel', 'Serge', 'Christian'],
    lastNames: ['Mbappe', 'Mvondo', 'Abanda'],
  },
  {
    code: 'COD',
    iso: 'COD',
    name: 'DR Congo',
    flag: '🇨🇩',
    weight: 1,
    firstNames: ['Christian', 'Emmanuel', 'Joël', 'Samuel', 'Patrick'],
    lastNames: ['Kabongo', 'Ilunga', 'Mbuyi'],
  },
  {
    code: 'SUI',
    iso: 'CHE',
    name: 'Switzerland',
    flag: '🇨🇭',
    weight: 1,
    firstNames: ['Noah', 'Luca', 'Leon', 'Nico', 'Julian'],
    lastNames: ['Müller', 'Meier', 'Keller'],
  },
  {
    code: 'AUT',
    iso: 'AUT',
    name: 'Austria',
    flag: '🇦🇹',
    weight: 1,
    firstNames: ['Lukas', 'Maximilian', 'Felix', 'David', 'Jakob'],
    lastNames: ['Gruber', 'Wagner', 'Huber'],
  },
  {
    code: 'CRO',
    iso: 'HRV',
    name: 'Croatia',
    flag: '🇭🇷',
    weight: 1,
    firstNames: ['Luka', 'Ivan', 'Mateo', 'Marko', 'Josip'],
    lastNames: ['Horvat', 'Kovač', 'Babić'],
  },
  {
    code: 'POL',
    iso: 'POL',
    name: 'Poland',
    flag: '🇵🇱',
    weight: 1,
    firstNames: ['Jakub', 'Antoni', 'Jan', 'Szymon', 'Kacper'],
    lastNames: ['Nowak', 'Kowalski', 'Wiśniewski'],
  },
  {
    code: 'SRB',
    iso: 'SRB',
    name: 'Serbia',
    flag: '🇷🇸',
    weight: 1,
    firstNames: ['Luka', 'Nikola', 'Marko', 'Stefan', 'Aleksandar'],
    lastNames: ['Jovanović', 'Petrović', 'Nikolić'],
  },
];

/**
 * Randomly samples a nationality and player name according to the exact English league probability distribution.
 */
export function generateEnglishPlayerNationalityAndName(): {
  name: string;
  nationality: { code: string; iso: string; name: string; flag: string };
} {
  const totalWeight = ENGLISH_LEAGUE_NATION_DISTRIBUTION.reduce((sum, n) => sum + n.weight, 0);
  let randomRoll = Math.random() * totalWeight;

  let selectedNation = ENGLISH_LEAGUE_NATION_DISTRIBUTION[0];
  for (const nation of ENGLISH_LEAGUE_NATION_DISTRIBUTION) {
    if (randomRoll < nation.weight) {
      selectedNation = nation;
      break;
    }
    randomRoll -= nation.weight;
  }

  const firstName = selectedNation.firstNames[Math.floor(Math.random() * selectedNation.firstNames.length)];
  const lastName = selectedNation.lastNames[Math.floor(Math.random() * selectedNation.lastNames.length)];

  return {
    name: `${firstName} ${lastName}`,
    nationality: {
      code: selectedNation.code,
      iso: selectedNation.iso,
      name: selectedNation.name,
      flag: selectedNation.flag,
    },
  };
}
