import { Nationality } from '../types';
import { NATIONALITIES } from '../constants';

export interface PortugueseNationalityDistribution {
  code: string;
  iso: string;
  name: string;
  weight: number;
  firstNames: string[];
  lastNames: string[];
}

export const PORTUGUESE_LEAGUE_NATIONALITIES: PortugueseNationalityDistribution[] = [
  // 1. PORTUGAL — 30%
  {
    code: 'POR',
    iso: 'pt',
    name: 'Portugal',
    weight: 30,
    firstNames: [
      'João', 'Diogo', 'Miguel', 'Pedro', 'Tiago', 'Rafael', 'Francisco', 'Gonçalo',
      'Rodrigo', 'André', 'António', 'Duarte', 'Martim', 'Tomás', 'Afonso', 'Bernardo',
      'Henrique', 'Luís', 'Ricardo'
    ],
    lastNames: [
      'Silva', 'Santos', 'Ferreira', 'Pereira', 'Costa', 'Oliveira', 'Rodrigues',
      'Martins', 'Fernandes', 'Sousa', 'Carvalho', 'Gomes', 'Lopes', 'Alves', 'Pinto'
    ],
  },
  // 2. BRAZIL — 24%
  {
    code: 'BRA',
    iso: 'br',
    name: 'Brazil',
    weight: 24,
    firstNames: ['Gabriel', 'Lucas', 'João', 'Miguel', 'Pedro', 'Matheus'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza'],
  },
  // 3. SPAIN — 10%
  {
    code: 'ESP',
    iso: 'es',
    name: 'Spain',
    weight: 10,
    firstNames: ['Alejandro', 'Álvaro', 'Hugo', 'Pablo', 'Mateo', 'Daniel'],
    lastNames: ['García', 'Fernández', 'González', 'Rodríguez'],
  },
  // 4. FRANCE — 5%
  {
    code: 'FRA',
    iso: 'fr',
    name: 'France',
    weight: 5,
    firstNames: ['Lucas', 'Gabriel', 'Louis', 'Jules', 'Hugo', 'Arthur', 'Nathan', 'Théo', 'Mathis', 'Antoine'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard'],
  },
  // 5. URUGUAY — 3%
  {
    code: 'URU',
    iso: 'uy',
    name: 'Uruguay',
    weight: 3,
    firstNames: ['Mateo', 'Santiago', 'Facundo', 'Nicolás', 'Agustín', 'Joaquín'],
    lastNames: ['Rodríguez', 'González', 'Fernández', 'Pereira'],
  },
  // 6. COLOMBIA — 2%
  {
    code: 'COL',
    iso: 'co',
    name: 'Colombia',
    weight: 2,
    firstNames: ['Juan', 'Santiago', 'Mateo', 'Sebastián', 'Andrés', 'Daniel'],
    lastNames: ['Rodríguez', 'Martínez', 'González', 'Gómez'],
  },
  // 7. GREECE — 2%
  {
    code: 'GRE',
    iso: 'gr',
    name: 'Greece',
    weight: 2,
    firstNames: ['Giorgos', 'Dimitris', 'Nikos', 'Kostas', 'Andreas', 'Vasilis'],
    lastNames: ['Papadopoulos', 'Pappas', 'Nikolaidis', 'Georgiou'],
  },
  // 8. NETHERLANDS — 2%
  {
    code: 'NED',
    iso: 'nl',
    name: 'Netherlands',
    weight: 2,
    firstNames: ['Daan', 'Bram', 'Sem', 'Lars', 'Lucas', 'Finn'],
    lastNames: ['de Jong', 'van Dijk', 'Jansen', 'Bakker'],
  },
  // 9. ANGOLA — 2%
  {
    code: 'ANG',
    iso: 'ao',
    name: 'Angola',
    weight: 2,
    firstNames: ['Manuel', 'José', 'António', 'Domingos', 'Adão', 'Mateus'],
    lastNames: ['Manuel', 'João', 'Domingos', 'António'],
  },
  // 10. ARGENTINA — 2%
  {
    code: 'ARG',
    iso: 'ar',
    name: 'Argentina',
    weight: 2,
    firstNames: ['Mateo', 'Santiago', 'Thiago', 'Nicolás', 'Tomás', 'Lautaro'],
    lastNames: ['González', 'Fernández', 'Rodríguez', 'Martínez'],
  },
  // 11. NIGERIA — 2%
  {
    code: 'NGA',
    iso: 'ng',
    name: 'Nigeria',
    weight: 2,
    firstNames: ['David', 'Chinedu', 'Emmanuel', 'Samuel', 'Daniel', 'Victor'],
    lastNames: ['Okafor', 'Eze', 'Adeyemi', 'Okoye'],
  },
  // 12. CÔTE D'IVOIRE — 2%
  {
    code: 'CIV',
    iso: 'ci',
    name: "Côte d'Ivoire",
    weight: 2,
    firstNames: ['Jean', 'Serge', 'Yao', 'Koffi', 'Ibrahim', 'Ousmane'],
    lastNames: ['Kouassi', 'Traoré', 'Koné', 'Doué'],
  },
  // 13. CAPE VERDE — 1%
  {
    code: 'CPV',
    iso: 'cv',
    name: 'Cape Verde',
    weight: 1,
    firstNames: ['Jovane', 'Dailon', 'Telmo', 'Ryan', 'Kevin'],
    lastNames: ['Cabral', 'Tavares', 'Monteiro'],
  },
  // 14. SWEDEN — 1%
  {
    code: 'SWE',
    iso: 'se',
    name: 'Sweden',
    weight: 1,
    firstNames: ['Elias', 'Oscar', 'Hugo', 'William', 'Axel'],
    lastNames: ['Andersson', 'Johansson', 'Karlsson'],
  },
  // 15. GUINEA-BISSAU — 1%
  {
    code: 'GNB',
    iso: 'gw',
    name: 'Guinea-Bissau',
    weight: 1,
    firstNames: ['Ibrahima', 'Mamadu', 'Buba', 'Alfa', 'Fode'],
    lastNames: ['Mané', 'Baldé', 'Sanhá'],
  },
  // 16. ENGLAND — 1%
  {
    code: 'ENG',
    iso: 'gb-eng',
    name: 'England',
    weight: 1,
    firstNames: ['Jack', 'Harry', 'Oliver', 'James', 'William'],
    lastNames: ['Smith', 'Jones', 'Taylor'],
  },
  // 17. SENEGAL — 1%
  {
    code: 'SEN',
    iso: 'sn',
    name: 'Senegal',
    weight: 1,
    firstNames: ['Amadou', 'Ibrahima', 'Mamadou', 'Ousmane', 'Abdoulaye'],
    lastNames: ['Ndiaye', 'Diop', 'Fall'],
  },
  // 18. MOROCCO — 1%
  {
    code: 'MAR',
    iso: 'ma',
    name: 'Morocco',
    weight: 1,
    firstNames: ['Youssef', 'Adam', 'Amine', 'Hamza', 'Zakaria'],
    lastNames: ['El Amrani', 'Benali', 'Alaoui'],
  },
  // 19. SERBIA — 1%
  {
    code: 'SRB',
    iso: 'rs',
    name: 'Serbia',
    weight: 1,
    firstNames: ['Luka', 'Nikola', 'Marko', 'Stefan', 'Aleksandar'],
    lastNames: ['Jovanović', 'Petrović', 'Nikolić'],
  },
  // 20. GERMANY — 1%
  {
    code: 'GER',
    iso: 'de',
    name: 'Germany',
    weight: 1,
    firstNames: ['Lukas', 'Leon', 'Finn', 'Paul', 'Jonas'],
    lastNames: ['Müller', 'Schmidt', 'Schneider'],
  },
  // 21. MOZAMBIQUE — 1%
  {
    code: 'MOZ',
    iso: 'mz',
    name: 'Mozambique',
    weight: 1,
    firstNames: ['Geny', 'Witi', 'Edson', 'Manuel', 'Domingos'],
    lastNames: ['Catamo', 'Langa', 'Mucavele'],
  },
  // 22. BELGIUM — 1%
  {
    code: 'BEL',
    iso: 'be',
    name: 'Belgium',
    weight: 1,
    firstNames: ['Arthur', 'Louis', 'Jules', 'Lucas', 'Noah'],
    lastNames: ['Peeters', 'Janssens', 'Maes'],
  },
  // 23. CROATIA — 1%
  {
    code: 'CRO',
    iso: 'hr',
    name: 'Croatia',
    weight: 1,
    firstNames: ['Luka', 'Ivan', 'Mateo', 'Marko', 'Josip'],
    lastNames: ['Horvat', 'Kovač', 'Babić'],
  },
  // 24. POLAND — 1%
  {
    code: 'POL',
    iso: 'pl',
    name: 'Poland',
    weight: 1,
    firstNames: ['Jakub', 'Antoni', 'Jan', 'Szymon', 'Kacper'],
    lastNames: ['Nowak', 'Kowalski', 'Wiśniewski'],
  },
  // 25. DENMARK — 1%
  {
    code: 'DEN',
    iso: 'dk',
    name: 'Denmark',
    weight: 1,
    firstNames: ['Emil', 'Mikkel', 'William', 'Magnus', 'Oliver'],
    lastNames: ['Nielsen', 'Jensen', 'Hansen'],
  },
  // 26. UKRAINE — 1%
  {
    code: 'UKR',
    iso: 'ua',
    name: 'Ukraine',
    weight: 1,
    firstNames: ['Oleksandr', 'Artem', 'Mykhailo', 'Dmytro', 'Andriy'],
    lastNames: ['Shevchenko', 'Kovalenko', 'Bondarenko'],
  },
  // 27. PARAGUAY — 1%
  {
    code: 'PAR',
    iso: 'py',
    name: 'Paraguay',
    weight: 1,
    firstNames: ['Diego', 'Miguel', 'Matías', 'Julio', 'Ángel'],
    lastNames: ['González', 'Martínez', 'Benítez'],
  },
  // 28. COSTA RICA — 1%
  {
    code: 'CRC',
    iso: 'cr',
    name: 'Costa Rica',
    weight: 1,
    firstNames: ['Patrick', 'Brandon', 'Kevin', 'José', 'Andrés'],
    lastNames: ['Sequeira', 'Aguilera', 'Chamorro'],
  },
];

const TOTAL_PORTUGUESE_WEIGHT = PORTUGUESE_LEAGUE_NATIONALITIES.reduce((acc, curr) => acc + curr.weight, 0);

/**
 * Randomly generates a realistic player name and nationality for Portuguese leagues based on official pool distribution.
 */
export function generatePortuguesePlayerNationalityAndName(): {
  name: string;
  nationality: Nationality;
} {
  const roll = Math.random() * TOTAL_PORTUGUESE_WEIGHT;
  let runningSum = 0;
  let selectedDist = PORTUGUESE_LEAGUE_NATIONALITIES[0];

  for (const dist of PORTUGUESE_LEAGUE_NATIONALITIES) {
    runningSum += dist.weight;
    if (roll <= runningSum) {
      selectedDist = dist;
      break;
    }
  }

  const firstName = selectedDist.firstNames[Math.floor(Math.random() * selectedDist.firstNames.length)];
  const lastName = selectedDist.lastNames[Math.floor(Math.random() * selectedDist.lastNames.length)];

  const matchedNat = NATIONALITIES.find(
    (n) => n.code.toUpperCase() === selectedDist.code.toUpperCase() || n.iso.toLowerCase() === selectedDist.iso.toLowerCase()
  );

  const finalNationality: Nationality = matchedNat || {
    code: selectedDist.code,
    iso: selectedDist.iso,
    name: selectedDist.name,
  };

  return {
    name: `${firstName} ${lastName}`,
    nationality: finalNationality,
  };
}
