import { Nationality } from '../types';
import { NATIONALITIES } from '../constants';

interface GermanNationalityDistribution {
  code: string;
  iso: string;
  name: string;
  weight: number;
  firstNames: string[];
  lastNames: string[];
}

export const GERMAN_LEAGUE_NATIONALITIES: GermanNationalityDistribution[] = [
  // 1. GERMANY — 41%
  {
    code: 'GER',
    iso: 'de',
    name: 'Germany',
    weight: 41,
    firstNames: [
      'Lukas', 'Leon', 'Finn', 'Paul', 'Jonas', 'Felix', 'Maximilian',
      'Noah', 'Elias', 'Louis', 'Luca', 'Julian', 'Moritz', 'Felix',
      'Tim', 'Florian', 'Niklas', 'David', 'Jan', 'Johannes'
    ],
    lastNames: [
      'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber',
      'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
      'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein'
    ],
  },
  // 2. FRANCE — 6%
  {
    code: 'FRA',
    iso: 'fr',
    name: 'France',
    weight: 6,
    firstNames: ['Lucas', 'Gabriel', 'Louis', 'Jules', 'Hugo', 'Arthur', 'Nathan', 'Théo', 'Mathis', 'Antoine'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard'],
  },
  // 3. AUSTRIA — 5%
  {
    code: 'AUT',
    iso: 'at',
    name: 'Austria',
    weight: 5,
    firstNames: ['Lukas', 'Maximilian', 'Felix', 'David', 'Jakob', 'Florian'],
    lastNames: ['Gruber', 'Wagner', 'Huber', 'Bauer'],
  },
  // 4. DENMARK — 4%
  {
    code: 'DEN',
    iso: 'dk',
    name: 'Denmark',
    weight: 4,
    firstNames: ['Emil', 'Mikkel', 'William', 'Magnus', 'Oliver', 'Noah'],
    lastNames: ['Nielsen', 'Jensen', 'Hansen', 'Pedersen'],
  },
  // 5. SWITZERLAND — 3%
  {
    code: 'SUI',
    iso: 'ch',
    name: 'Switzerland',
    weight: 3,
    firstNames: ['Noah', 'Luca', 'Leon', 'Nico', 'Julian', 'Yann'],
    lastNames: ['Müller', 'Meier', 'Keller', 'Schmid'],
  },
  // 6. JAPAN — 3%
  {
    code: 'JPN',
    iso: 'jp',
    name: 'Japan',
    weight: 3,
    firstNames: ['Haruto', 'Ren', 'Yuto', 'Sota', 'Kaito', 'Daiki'],
    lastNames: ['Sato', 'Tanaka', 'Suzuki', 'Watanabe'],
  },
  // 7. BELGIUM — 3%
  {
    code: 'BEL',
    iso: 'be',
    name: 'Belgium',
    weight: 3,
    firstNames: ['Arthur', 'Louis', 'Jules', 'Lucas', 'Noah', 'Mathis'],
    lastNames: ['Peeters', 'Janssens', 'Maes', 'Dubois'],
  },
  // 8. UNITED STATES — 2%
  {
    code: 'USA',
    iso: 'us',
    name: 'United States',
    weight: 2,
    firstNames: ['Liam', 'Mason', 'Ethan', 'Noah', 'Jackson', 'Tyler'],
    lastNames: ['Johnson', 'Williams', 'Davis', 'Brown'],
  },
  // 9. NETHERLANDS — 2%
  {
    code: 'NED',
    iso: 'nl',
    name: 'Netherlands',
    weight: 2,
    firstNames: ['Daan', 'Bram', 'Sem', 'Lars', 'Lucas', 'Finn'],
    lastNames: ['de Jong', 'van Dijk', 'Jansen', 'Bakker'],
  },
  // 10. PORTUGAL — 2%
  {
    code: 'POR',
    iso: 'pt',
    name: 'Portugal',
    weight: 2,
    firstNames: ['João', 'Diogo', 'Miguel', 'Pedro', 'Tiago', 'Rafael'],
    lastNames: ['Silva', 'Santos', 'Ferreira', 'Pereira'],
  },
  // 11. CROATIA — 2%
  {
    code: 'CRO',
    iso: 'hr',
    name: 'Croatia',
    weight: 2,
    firstNames: ['Luka', 'Ivan', 'Mateo', 'Marko', 'Josip', 'Ante'],
    lastNames: ['Horvat', 'Kovač', 'Babić', 'Marić'],
  },
  // 12. BRAZIL — 2%
  {
    code: 'BRA',
    iso: 'br',
    name: 'Brazil',
    weight: 2,
    firstNames: ['Gabriel', 'Lucas', 'João', 'Miguel', 'Pedro', 'Matheus'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza'],
  },
  // 13. NORWAY — 1%
  {
    code: 'NOR',
    iso: 'no',
    name: 'Norway',
    weight: 1,
    firstNames: ['Emil', 'Magnus', 'Sander', 'Oskar', 'Elias'],
    lastNames: ['Hansen', 'Johansen', 'Olsen'],
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
  // 15. CZECH REPUBLIC — 1%
  {
    code: 'CZE',
    iso: 'cz',
    name: 'Czech Republic',
    weight: 1,
    firstNames: ['Jan', 'Jakub', 'Tomáš', 'Matěj', 'Adam'],
    lastNames: ['Novák', 'Svoboda', 'Dvořák'],
  },
  // 16. TÜRKIYE — 1%
  {
    code: 'TUR',
    iso: 'tr',
    name: 'Türkiye',
    weight: 1,
    firstNames: ['Arda', 'Emir', 'Kerem', 'Can', 'Mert'],
    lastNames: ['Yılmaz', 'Kaya', 'Demir'],
  },
  // 17. ARGENTINA — 1%
  {
    code: 'ARG',
    iso: 'ar',
    name: 'Argentina',
    weight: 1,
    firstNames: ['Mateo', 'Santiago', 'Thiago', 'Nicolás', 'Tomás'],
    lastNames: ['González', 'Fernández', 'Rodríguez'],
  },
  // 18. ITALY — 1%
  {
    code: 'ITA',
    iso: 'it',
    name: 'Italy',
    weight: 1,
    firstNames: ['Matteo', 'Luca', 'Leonardo', 'Lorenzo', 'Francesco'],
    lastNames: ['Rossi', 'Romano', 'Ferrari'],
  },
  // 19. NIGERIA — 1%
  {
    code: 'NGA',
    iso: 'ng',
    name: 'Nigeria',
    weight: 1,
    firstNames: ['David', 'Chinedu', 'Emmanuel', 'Samuel', 'Daniel'],
    lastNames: ['Okafor', 'Eze', 'Adeyemi'],
  },
  // 20. GHANA — 1%
  {
    code: 'GHA',
    iso: 'gh',
    name: 'Ghana',
    weight: 1,
    firstNames: ['Daniel', 'Kwame', 'Samuel', 'Emmanuel', 'Kojo'],
    lastNames: ['Mensah', 'Asante', 'Owusu'],
  },
  // 21. CAMEROON — 1%
  {
    code: 'CMR',
    iso: 'cm',
    name: 'Cameroon',
    weight: 1,
    firstNames: ['Jean', 'André', 'Emmanuel', 'Serge', 'Christian'],
    lastNames: ['Mvondo', 'Abanda', 'Ngono'],
  },
  // 22. CÔTE D'IVOIRE — 1%
  {
    code: 'CIV',
    iso: 'ci',
    name: "Côte d'Ivoire",
    weight: 1,
    firstNames: ['Jean', 'Serge', 'Yao', 'Koffi', 'Ibrahim'],
    lastNames: ['Kouassi', 'Traoré', 'Koné'],
  },
  // 23. POLAND — 1%
  {
    code: 'POL',
    iso: 'pl',
    name: 'Poland',
    weight: 1,
    firstNames: ['Jakub', 'Antoni', 'Jan', 'Szymon', 'Kacper'],
    lastNames: ['Nowak', 'Kowalski', 'Wiśniewski'],
  },
  // 24. SERBIA — 1%
  {
    code: 'SRB',
    iso: 'rs',
    name: 'Serbia',
    weight: 1,
    firstNames: ['Luka', 'Nikola', 'Marko', 'Stefan', 'Aleksandar'],
    lastNames: ['Jovanović', 'Petrović', 'Nikolić'],
  },
  // 25. SPAIN — 1%
  {
    code: 'ESP',
    iso: 'es',
    name: 'Spain',
    weight: 1,
    firstNames: ['Alejandro', 'Álvaro', 'Hugo', 'Pablo', 'Mateo'],
    lastNames: ['García', 'Fernández', 'González'],
  },
  // 26. SCOTLAND — 1%
  {
    code: 'SCO',
    iso: 'gb-sct',
    name: 'Scotland',
    weight: 1,
    firstNames: ['Callum', 'Lewis', 'Finlay', 'Cameron', 'Angus'],
    lastNames: ['Smith', 'Brown', 'Campbell'],
  },
  // 27. ENGLAND — 1%
  {
    code: 'ENG',
    iso: 'gb-eng',
    name: 'England',
    weight: 1,
    firstNames: ['Jack', 'Harry', 'Oliver', 'James', 'William'],
    lastNames: ['Smith', 'Jones', 'Taylor'],
  },
];

const TOTAL_WEIGHT = GERMAN_LEAGUE_NATIONALITIES.reduce((acc, curr) => acc + curr.weight, 0);

/**
 * Randomly generates a realistic player name and nationality for German leagues based on official pool distribution.
 */
export function generateGermanPlayerNationalityAndName(): {
  name: string;
  nationality: Nationality;
} {
  const roll = Math.random() * TOTAL_WEIGHT;
  let runningSum = 0;
  let selectedDist = GERMAN_LEAGUE_NATIONALITIES[0];

  for (const dist of GERMAN_LEAGUE_NATIONALITIES) {
    runningSum += dist.weight;
    if (roll <= runningSum) {
      selectedDist = dist;
      break;
    }
  }

  const firstName = selectedDist.firstNames[Math.floor(Math.random() * selectedDist.firstNames.length)];
  const lastName = selectedDist.lastNames[Math.floor(Math.random() * selectedDist.lastNames.length)];

  // Find standard Nationality object from constants
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
