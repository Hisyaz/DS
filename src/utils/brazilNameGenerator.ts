import { Nationality } from '../types';
import { NATIONALITIES } from '../constants';

interface BrazilNationalityDistribution {
  code: string;
  iso: string;
  name: string;
  weight: number;
  firstNames: string[];
  lastNames: string[];
}

const BRAZIL_LEAGUE_NATIONALITIES: BrazilNationalityDistribution[] = [
  {
    code: 'BRA',
    iso: 'br',
    name: 'Brazil',
    weight: 86,
    firstNames: ['João', 'Gabriel', 'Lucas', 'Miguel', 'Pedro', 'Matheus', 'Arthur', 'Enzo', 'Rafael', 'Davi', 'Heitor', 'Bernardo', 'Samuel', 'Gustavo', 'Felipe', 'Nicolas', 'Henrique', 'Vinícius', 'Guilherme', 'Leonardo'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Ferreira', 'Alves', 'Carvalho', 'Gomes', 'Ribeiro', 'Martins', 'Lima'],
  },
  {
    code: 'ARG',
    iso: 'ar',
    name: 'Argentina',
    weight: 4,
    firstNames: ['Mateo', 'Santiago', 'Thiago', 'Nicolás', 'Tomás', 'Lautaro'],
    lastNames: ['González', 'Fernández', 'Rodríguez', 'Martínez'],
  },
  {
    code: 'URU',
    iso: 'uy',
    name: 'Uruguay',
    weight: 3,
    firstNames: ['Mateo', 'Santiago', 'Facundo', 'Nicolás', 'Agustín', 'Joaquín'],
    lastNames: ['Rodríguez', 'González', 'Fernández', 'Pereira'],
  },
  {
    code: 'COL',
    iso: 'co',
    name: 'Colombia',
    weight: 2,
    firstNames: ['Juan', 'Santiago', 'Mateo', 'Sebastián', 'Andrés', 'Daniel'],
    lastNames: ['Rodríguez', 'Martínez', 'González', 'Gómez'],
  },
  {
    code: 'PAR',
    iso: 'py',
    name: 'Paraguay',
    weight: 1,
    firstNames: ['Diego', 'Miguel', 'Matías', 'Julio', 'Ángel'],
    lastNames: ['González', 'Martínez', 'Benítez'],
  },
  {
    code: 'ECU',
    iso: 'ec',
    name: 'Ecuador',
    weight: 1,
    firstNames: ['José', 'Moisés', 'Kevin', 'Janner', 'Bryan'],
    lastNames: ['González', 'Caicedo', 'Valencia'],
  },
  {
    code: 'CHI',
    iso: 'cl',
    name: 'Chile',
    weight: 1,
    firstNames: ['Benjamín', 'Vicente', 'Matías', 'Diego', 'Nicolás'],
    lastNames: ['González', 'Muñoz', 'Rojas'],
  },
  {
    code: 'POR',
    iso: 'pt',
    name: 'Portugal',
    weight: 1,
    firstNames: ['João', 'Diogo', 'Miguel', 'Pedro', 'Tiago'],
    lastNames: ['Silva', 'Santos', 'Ferreira'],
  },
  {
    code: 'VEN',
    iso: 've',
    name: 'Venezuela',
    weight: 1,
    firstNames: ['José', 'Luis', 'Miguel', 'Carlos', 'Alejandro'],
    lastNames: ['González', 'Rodríguez', 'Martínez'],
  },
];

const TOTAL_WEIGHT = BRAZIL_LEAGUE_NATIONALITIES.reduce((sum, item) => sum + item.weight, 0);

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateBrazilianPlayerNationalityAndName(): { name: string; nationality: Nationality } {
  let roll = Math.random() * TOTAL_WEIGHT;
  let selected = BRAZIL_LEAGUE_NATIONALITIES[0];

  for (const item of BRAZIL_LEAGUE_NATIONALITIES) {
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

const STATE_ONLY_LEAGUE_NATIONALITIES: BrazilNationalityDistribution[] = [
  {
    code: 'BRA',
    iso: 'br',
    name: 'Brazil',
    weight: 95,
    firstNames: ['João', 'Gabriel', 'Lucas', 'Miguel', 'Pedro', 'Matheus', 'Arthur', 'Enzo', 'Rafael', 'Davi', 'Heitor', 'Bernardo', 'Samuel', 'Gustavo', 'Felipe', 'Nicolas', 'Henrique', 'Vinícius', 'Guilherme', 'Leonardo', 'Thiago', 'Danilo', 'Murilo', 'Kaio', 'Renan'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Ferreira', 'Alves', 'Carvalho', 'Gomes', 'Ribeiro', 'Martins', 'Lima', 'Barbosa', 'Ramos', 'Cardoso'],
  },
  {
    code: 'ARG',
    iso: 'ar',
    name: 'Argentina',
    weight: 1,
    firstNames: ['Mateo', 'Santiago', 'Thiago', 'Nicolás', 'Tomás', 'Lautaro'],
    lastNames: ['González', 'Fernández', 'Rodríguez', 'Martínez', 'López'],
  },
  {
    code: 'PAR',
    iso: 'py',
    name: 'Paraguay',
    weight: 1,
    firstNames: ['Diego', 'Miguel', 'Matías', 'Julio', 'Ángel', 'Gustavo'],
    lastNames: ['González', 'Martínez', 'Benítez', 'Almirón', 'Gómez'],
  },
  {
    code: 'URU',
    iso: 'uy',
    name: 'Uruguay',
    weight: 1,
    firstNames: ['Mateo', 'Santiago', 'Facundo', 'Nicolás', 'Agustín', 'Joaquín'],
    lastNames: ['Rodríguez', 'González', 'Fernández', 'Pereira', 'Olivera'],
  },
  {
    code: 'BOL',
    iso: 'bo',
    name: 'Bolivia',
    weight: 1,
    firstNames: ['Marcelo', 'Carlos', 'Ramiro', 'Jhasmani', 'Henry', 'Jaime'],
    lastNames: ['Martins', 'Vaca', 'Chumacero', 'Saucedo', 'Álvarez', 'Moreno'],
  },
  {
    code: 'CHI',
    iso: 'cl',
    name: 'Chile',
    weight: 1,
    firstNames: ['Benjamín', 'Vicente', 'Matías', 'Diego', 'Nicolás', 'Alexis'],
    lastNames: ['González', 'Muñoz', 'Rojas', 'Vidal', 'Sánchez', 'Díaz'],
  },
];

const STATE_ONLY_TOTAL_WEIGHT = STATE_ONLY_LEAGUE_NATIONALITIES.reduce((sum, item) => sum + item.weight, 0);

export function generateStateOnlyBrazilianPlayerNationalityAndName(): { name: string; nationality: Nationality } {
  let roll = Math.random() * STATE_ONLY_TOTAL_WEIGHT;
  let selected = STATE_ONLY_LEAGUE_NATIONALITIES[0];

  for (const item of STATE_ONLY_LEAGUE_NATIONALITIES) {
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

