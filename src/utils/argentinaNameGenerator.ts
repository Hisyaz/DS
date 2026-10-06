import { Nationality } from '../types';
import { NATIONALITIES } from '../constants';

interface ArgentinaNationalityDistribution {
  code: string;
  iso: string;
  name: string;
  weight: number;
  firstNames: string[];
  lastNames: string[];
}

const ARGENTINA_LEAGUE_NATIONALITIES: ArgentinaNationalityDistribution[] = [
  {
    code: 'ARG',
    iso: 'ar',
    name: 'Argentina',
    weight: 94,
    firstNames: ['Santiago', 'Mateo', 'Nicolás', 'Tomás', 'Juan', 'Lautaro', 'Thiago', 'Joaquín', 'Agustín', 'Facundo', 'Martín', 'Lucas', 'Valentín', 'Franco', 'Gonzalo', 'Sebastián', 'Matías', 'Federico', 'Ignacio', 'Bruno'],
    lastNames: ['González', 'Rodríguez', 'Fernández', 'Gómez', 'López', 'Martínez', 'Díaz', 'Pérez', 'Sánchez', 'Romero', 'Sosa', 'Torres', 'Álvarez', 'Ramírez', 'Acosta'],
  },
  {
    code: 'URU',
    iso: 'uy',
    name: 'Uruguay',
    weight: 2,
    firstNames: ['Mateo', 'Santiago', 'Facundo', 'Nicolás', 'Agustín', 'Joaquín'],
    lastNames: ['Rodríguez', 'González', 'Fernández', 'Pereira'],
  },
  {
    code: 'COL',
    iso: 'co',
    name: 'Colombia',
    weight: 1,
    firstNames: ['Juan', 'Santiago', 'Mateo', 'Sebastián', 'Andrés'],
    lastNames: ['Rodríguez', 'Martínez', 'González'],
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
    code: 'CHI',
    iso: 'cl',
    name: 'Chile',
    weight: 1,
    firstNames: ['Benjamín', 'Vicente', 'Matías', 'Diego', 'Nicolás'],
    lastNames: ['González', 'Muñoz', 'Rojas'],
  },
  {
    code: 'BRA',
    iso: 'br',
    name: 'Brazil',
    weight: 1,
    firstNames: ['Gabriel', 'Lucas', 'João', 'Miguel', 'Pedro'],
    lastNames: ['Silva', 'Santos', 'Oliveira'],
  },
];

const TOTAL_WEIGHT = ARGENTINA_LEAGUE_NATIONALITIES.reduce((sum, item) => sum + item.weight, 0);

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateArgentinePlayerNationalityAndName(): { name: string; nationality: Nationality } {
  let roll = Math.random() * TOTAL_WEIGHT;
  let selected = ARGENTINA_LEAGUE_NATIONALITIES[0];

  for (const item of ARGENTINA_LEAGUE_NATIONALITIES) {
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
