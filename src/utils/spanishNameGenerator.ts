import { Nationality } from '../types';
import { NATIONALITIES } from '../constants';

interface SpanishNationalityDistribution {
  code: string;
  iso: string;
  name: string;
  weight: number;
  firstNames: string[];
  lastNames: string[];
}

const SPANISH_LEAGUE_NATIONALITIES: SpanishNationalityDistribution[] = [
  {
    code: 'ESP',
    iso: 'es',
    name: 'Spain',
    weight: 66,
    firstNames: ['Alejandro', 'Daniel', 'Pablo', 'Álvaro', 'Hugo', 'Mateo', 'Lucas', 'Adrián', 'Javier', 'Carlos', 'Sergio', 'David', 'Diego', 'Marcos', 'Mario', 'Miguel', 'Iván', 'Antonio', 'Manuel'],
    lastNames: ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno'],
  },
  {
    code: 'FRA',
    iso: 'fr',
    name: 'France',
    weight: 4,
    firstNames: ['Lucas', 'Gabriel', 'Louis', 'Jules', 'Hugo', 'Arthur', 'Nathan', 'Théo', 'Mathis', 'Antoine'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard'],
  },
  {
    code: 'ARG',
    iso: 'ar',
    name: 'Argentina',
    weight: 3,
    firstNames: ['Mateo', 'Santiago', 'Thiago', 'Nicolás', 'Tomás', 'Lautaro'],
    lastNames: ['González', 'Fernández', 'Rodríguez', 'Martínez'],
  },
  {
    code: 'BRA',
    iso: 'br',
    name: 'Brazil',
    weight: 2,
    firstNames: ['Gabriel', 'Lucas', 'João', 'Miguel', 'Pedro', 'Matheus'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza'],
  },
  {
    code: 'MAR',
    iso: 'ma',
    name: 'Morocco',
    weight: 2,
    firstNames: ['Youssef', 'Adam', 'Amine', 'Hamza', 'Zakaria', 'Ayoub'],
    lastNames: ['El Amrani', 'Benali', 'Bennani', 'Haddad'],
  },
  {
    code: 'URU',
    iso: 'uy',
    name: 'Uruguay',
    weight: 2,
    firstNames: ['Federico', 'Ronald', 'Darwin', 'Rodrigo', 'José', 'Facundo'],
    lastNames: ['Valverde', 'Araújo', 'Núñez', 'Bentancur', 'Giménez', 'Pellistri'],
  },
  {
    code: 'POR',
    iso: 'pt',
    name: 'Portugal',
    weight: 2,
    firstNames: ['João', 'André', 'Gonçalo', 'Nelson', 'Domingos', 'Thierry'],
    lastNames: ['Félix', 'Silva', 'Guedes', 'Semedo', 'Duarte', 'Correia'],
  },
  {
    code: 'ENG',
    iso: 'gb-eng',
    name: 'England',
    weight: 2,
    firstNames: ['Jude', 'Conor', 'Mason', 'Kieran', 'Tammy', 'Carl'],
    lastNames: ['Bellingham', 'Gallagher', 'Greenwood', 'Trippier', 'Abraham', 'Starfelt'],
  },
  {
    code: 'COL',
    iso: 'co',
    name: 'Colombia',
    weight: 2,
    firstNames: ['Radamel', 'James', 'Luis', 'Johan', 'Jeison', 'Bernardo'],
    lastNames: ['Falcao', 'Rodríguez', 'Díaz', 'Mojica', 'Murillo', 'Espinosa'],
  },
  {
    code: 'SRB',
    iso: 'rs',
    name: 'Serbia',
    weight: 2,
    firstNames: ['Nemanja', 'Marko', 'Predrag', 'Aleksandar', 'Darko', 'Stefan'],
    lastNames: ['Maksimović', 'Dmitrović', 'Rajković', 'Sedlar', 'Lazović', 'Mitrović'],
  },
  {
    code: 'SEN',
    iso: 'sn',
    name: 'Senegal',
    weight: 1,
    firstNames: ['Youssouf', 'Pathé', 'Mamadou', 'Pape', 'Amath', 'Dion'],
    lastNames: ['Sabaly', 'Ciss', 'Loum', 'Gueye', 'Ndiaye', 'Lopy'],
  },
  {
    code: 'NGA',
    iso: 'ng',
    name: 'Nigeria',
    weight: 1,
    firstNames: ['Samuel', 'Umar', 'Akor', 'Kelechi', 'Terem', 'Alex'],
    lastNames: ['Chukwueze', 'Sadiq', 'Adams', 'Iheanacho', 'Moffi', 'Iwobi'],
  },
  {
    code: 'NED',
    iso: 'nl',
    name: 'Netherlands',
    weight: 1,
    firstNames: ['Memphis', 'Daley', 'Frenkie', 'Arnaut', 'Justin', 'Jasper'],
    lastNames: ['Depay', 'Blind', 'de Jong', 'Danjuma', 'Kluivert', 'Cillessen'],
  },
  {
    code: 'GER',
    iso: 'de',
    name: 'Germany',
    weight: 1,
    firstNames: ['Toni', 'Marc-André', 'Antonio', 'Ilkay', 'Thilo', 'Julian'],
    lastNames: ['Kroos', 'ter Stegen', 'Rüdiger', 'Gündoğan', 'Kehrer', 'Draxler'],
  },
  {
    code: 'BEL',
    iso: 'be',
    name: 'Belgium',
    weight: 1,
    firstNames: ['Thibaut', 'Yannick', 'Axel', 'Dodi', 'Adnan', 'Thomas'],
    lastNames: ['Courtois', 'Carrasco', 'Witsel', 'Lukebakio', 'Januzaj', 'Meunier'],
  },
  {
    code: 'JPN',
    iso: 'jp',
    name: 'Japan',
    weight: 1,
    firstNames: ['Takefusa', 'Takuma', 'Gaku', 'Hiroki', 'Shinji', 'Eiji'],
    lastNames: ['Kubo', 'Asano', 'Shibasaki', 'Abe', 'Okazaki', 'Kawashima'],
  },
  {
    code: 'USA',
    iso: 'us',
    name: 'United States',
    weight: 1,
    firstNames: ['Sergiño', 'Yunus', 'Luca', 'Johnny', 'Matthew', 'Konrad'],
    lastNames: ['Dest', 'Musah', 'de la Torre', 'Cardoso', 'Hoppe', 'de la Fuente'],
  },
  {
    code: 'GHA',
    iso: 'gh',
    name: 'Ghana',
    weight: 1,
    firstNames: ['Iñaki', 'Thomas', 'Abdul', 'Joseph', 'Baba', 'Kwabena'],
    lastNames: ['Williams', 'Partey', 'Moomin', 'Aidoo', 'Rahman', 'Owusu'],
  },
  {
    code: 'GEO',
    iso: 'ge',
    name: 'Georgia',
    weight: 1,
    firstNames: ['Giorgi', 'Khvicha', 'Zuriko', 'Otar', 'Beka', 'Guram'],
    lastNames: ['Mamardashvili', 'Kvaratskhelia', 'Davitashvili', 'Kakabadze', 'Burjanadze', 'Kashia'],
  },
  {
    code: 'UKR',
    iso: 'ua',
    name: 'Ukraine',
    weight: 1,
    firstNames: ['Viktor', 'Artem', 'Andriy', 'Roman', 'Yevhen', 'Ilya'],
    lastNames: ['Tsygankov', 'Dovbyk', 'Lunin', 'Yaremchuk', 'Konoplyanka', 'Zabarnyi'],
  },
  {
    code: 'CMR',
    iso: 'cm',
    name: 'Cameroon',
    weight: 1,
    firstNames: ['Karl', 'Pierre', 'Stéphane', 'Martin', 'Wilfrid', 'Samuel'],
    lastNames: ['Ekambi', 'Kunde', 'Mbia', 'Hongla', 'Kaptoum', 'Umtiti'],
  },
  {
    code: 'SUI',
    iso: 'ch',
    name: 'Switzerland',
    weight: 1,
    firstNames: ['Eray', 'Fabian', 'Silvan', 'Haris', 'Denis', 'Ruben'],
    lastNames: ['Cömert', 'Schär', 'Widmer', 'Seferović', 'Zakaria', 'Vargas'],
  },
  {
    code: 'CIV',
    iso: 'ci',
    name: "Côte d'Ivoire",
    weight: 1,
    firstNames: ['Eric', 'Serge', 'Franck', 'Nicolas', 'Wilfried', 'Max'],
    lastNames: ['Bailly', 'Aurier', 'Kessié', 'Pépé', 'Zaha', 'Gradel'],
  },
  {
    code: 'MEX',
    iso: 'mx',
    name: 'Mexico',
    weight: 1,
    firstNames: ['Andrés', 'Héctor', 'Guillermo', 'Diego', 'Julián', 'Hirving'],
    lastNames: ['Guardado', 'Moreno', 'Ochoa', 'Lainez', 'Araujo', 'Lozano'],
  },
];

const TOTAL_WEIGHT = SPANISH_LEAGUE_NATIONALITIES.reduce((sum, item) => sum + item.weight, 0);

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateSpanishPlayerNationalityAndName(): { name: string; nationality: Nationality } {
  let roll = Math.random() * TOTAL_WEIGHT;
  let selected = SPANISH_LEAGUE_NATIONALITIES[0];

  for (const item of SPANISH_LEAGUE_NATIONALITIES) {
    if (roll < item.weight) {
      selected = item;
      break;
    }
    roll -= item.weight;
  }

  const firstName = getRandomElement(selected.firstNames);
  const lastName = getRandomElement(selected.lastNames);

  const foundNat = NATIONALITIES.find(
    (n) => n.code.toUpperCase() === selected.code.toUpperCase()
  );

  return {
    name: `${firstName} ${lastName}`,
    nationality: foundNat || {
      code: selected.code,
      iso: selected.iso,
      name: selected.name,
    },
  };
}
