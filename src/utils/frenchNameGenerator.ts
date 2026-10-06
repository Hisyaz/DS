import { Nationality } from '../types';
import { NATIONALITIES } from '../constants';

interface FrenchNationalityDistribution {
  code: string;
  iso: string;
  name: string;
  weight: number;
  firstNames: string[];
  lastNames: string[];
}

const FRENCH_LEAGUE_NATIONALITIES: FrenchNationalityDistribution[] = [
  {
    code: 'FRA',
    iso: 'fr',
    name: 'France',
    weight: 49,
    firstNames: ['Lucas', 'Hugo', 'Théo', 'Enzo', 'Mathis', 'Nathan', 'Gabriel', 'Louis', 'Jules', 'Antoine', 'Maxime', 'Alexandre', 'Arthur', 'Ethan', 'Nolan', 'Noé', 'Mathéo', 'Yanis', 'Kylian', 'Rayan'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia'],
  },
  {
    code: 'SEN',
    iso: 'sn',
    name: 'Senegal',
    weight: 5,
    firstNames: ['Amadou', 'Ibrahima', 'Mamadou', 'Ousmane', 'Abdoulaye', 'Cheikh', 'Pape', 'Sadio', 'Ismaïla', 'Boubacar', 'Moustapha', 'Lamine', 'Idrissa', 'Moussa', 'Seydou'],
    lastNames: ['Diop', 'Ndiaye', 'Fall', 'Sarr', 'Diallo', 'Ba', 'Sow', 'Cissé', 'Sy', 'Faye'],
  },
  {
    code: 'MAR',
    iso: 'ma',
    name: 'Morocco',
    weight: 4,
    firstNames: ['Youssef', 'Amine', 'Ayoub', 'Hamza', 'Zakaria', 'Bilal', 'Anas', 'Othmane', 'Ismail', 'Sofiane', 'Ilyas', 'Mehdi'],
    lastNames: ['El Amrani', 'Bennani', 'Alaoui', 'Idrissi', 'Haddad', 'Amrabat', 'Berrada', 'Tazi'],
  },
  {
    code: 'CIV',
    iso: 'ci',
    name: "Côte d'Ivoire",
    weight: 3,
    firstNames: ['Yannick', 'Serge', 'Franck', 'Ibrahim', 'Nicolas', 'Max', 'Cheick', 'Wilfried', 'Didier', 'Seko', 'Jérémie', 'Jean', 'Oumar', 'Souleymane', 'Eric'],
    lastNames: ['Koné', 'Touré', 'Coulibaly', 'Diallo', 'Traoré', 'Bamba', 'Fofana', 'Sangaré', 'Kessié', 'Diomandé', 'Bony', 'Zaha', 'Aurier', 'Gervinho', 'Yaya'],
  },
  {
    code: 'CMR',
    iso: 'cm',
    name: 'Cameroon',
    weight: 3,
    firstNames: ['Karl', 'Vincent', 'Eric', 'Samuel', 'André', 'Bryan', 'Nicolas', 'Georges', 'Stéphane', 'Jean', 'Frank', 'Ambroise', 'Michael', 'Clinton', 'Ignatius'],
    lastNames: ['Mbeumo', 'Choupo-Moting', 'Aboubakar', 'Ekambi', 'Zambo Anguissa', 'Onana', 'Song', 'Eto\'o', 'N\'Koulou', 'Bassogog', 'Oyongo', 'Castelleto', 'Kunde', 'Gouet', 'Neyou'],
  },
  {
    code: 'ALG',
    iso: 'dz',
    name: 'Algeria',
    weight: 3,
    firstNames: ['Riyad', 'Ismaël', 'Saïd', 'Ramy', 'Islam', 'Yacine', 'Sofiane', 'Adam', 'Youcef', 'Rayan', 'Houssem', 'Baghdad', 'Rais', 'Andy', 'Nabil'],
    lastNames: ['Mahrez', 'Bennacer', 'Bensebaini', 'Slimani', 'Feghouli', 'Brahimi', 'Ounas', 'Belaili', 'Zerrouki', 'Aouar', 'Bounedjah', 'M\'Bolhi', 'Delort', 'Bentaleb', 'Atal'],
  },
  {
    code: 'COD',
    iso: 'cd',
    name: 'DR Congo',
    weight: 2,
    firstNames: ['Chancel', 'Cédric', 'Yoane', 'Gaël', 'Arthur', 'Samuel', 'Edo', 'Aaron', 'Silas', 'Ngal\'ayel', 'Paul-José', 'Théo', 'Jackson', 'Britt', 'Dieumerci'],
    lastNames: ['Mbemba', 'Bakambu', 'Wissa', 'Kakuta', 'Masuaku', 'Moutoussamy', 'Kayembe', 'Tshibola', 'Wamangituka', 'Mukiele', 'M\'Poku', 'Bongonda', 'Muleka', 'Assombalonga', 'Mbokani'],
  },
  {
    code: 'MLI',
    iso: 'ml',
    name: 'Mali',
    weight: 2,
    firstNames: ['Yves', 'Amadou', 'Hamari', 'Moussa', 'Adama', 'El Bilal', 'Sekou', 'Cheick', 'Lassana', 'Diadie', 'Falaye', 'Massadio', 'Mohamed'],
    lastNames: ['Bissouma', 'Haidara', 'Traoré', 'Djenepo', 'Touré', 'Samassékou', 'Sacko', 'Coulibaly', 'Camara', 'Doumbia', 'Konaté', 'Marega', 'Niakaté', 'Diarra', 'Niane'],
  },
  {
    code: 'BEL',
    iso: 'be',
    name: 'Belgium',
    weight: 2,
    firstNames: ['Kevin', 'Romelu', 'Thibaut', 'Eden', 'Youri', 'Lois', 'Jérémy', 'Leandro', 'Amadou', 'Charles', 'Arthur', 'Zeno', 'Dodi', 'Alexis', 'Orel'],
    lastNames: ['De Bruyne', 'Lukaku', 'Courtois', 'Hazard', 'Tielemans', 'Openda', 'Doku', 'Trossard', 'Onana', 'De Ketelaere', 'Theate', 'Debast', 'Lukebakio', 'Saelemaekers', 'Mangala'],
  },
  {
    code: 'POR',
    iso: 'pt',
    name: 'Portugal',
    weight: 2,
    firstNames: ['Bernardo', 'Bruno', 'Rúben', 'Diogo', 'João', 'Rafael', 'Gonçalo', 'Pedro', 'Nuno', 'Vitinha', 'Otávio', 'Matheus', 'André', 'Rui'],
    lastNames: ['Silva', 'Fernandes', 'Dias', 'Jota', 'Félix', 'Leão', 'Ramos', 'Neto', 'Mendes', 'Vitinha', 'Nunes', 'Neves', 'Patrício', 'Costa'],
  },
  {
    code: 'ESP',
    iso: 'es',
    name: 'Spain',
    weight: 2,
    firstNames: ['Rodri', 'Pedri', 'Gavi', 'Marco', 'Mikel', 'Dani', 'Marc', 'Alejandro', 'Pau', 'Aymeric', 'Robin', 'Unai', 'Ferran', 'David', 'Kepa'],
    lastNames: ['Hernández', 'González', 'Paéz', 'Asensio', 'Oyarzabal', 'Olmo', 'Cucurella', 'Grimaldo', 'Torres', 'Laporte', 'Le Normand', 'Simón', 'Raya', 'Arrizabalaga'],
  },
  {
    code: 'BRA',
    iso: 'br',
    name: 'Brazil',
    weight: 2,
    firstNames: ['Vinícius', 'Rodrygo', 'Richarlison', 'Gabriel', 'Lucas', 'Antony', 'Casemiro', 'Bruno', 'Marquinhos', 'Éder', 'Bremer', 'Alisson', 'Ederson', 'Renan'],
    lastNames: ['Júnior', 'Silva', 'Andrade', 'Jesus', 'Paquetá', 'Guimarães', 'Militão', 'Becker', 'Moraes', 'Lodi', 'Santos', 'Oliveira', 'Souza', 'Pereira'],
  },
  {
    code: 'ARG',
    iso: 'ar',
    name: 'Argentina',
    weight: 2,
    firstNames: ['Lionel', 'Julián', 'Enzo', 'Alexis', 'Lautaro', 'Rodrigo', 'Emiliano', 'Lisandro', 'Nahuel', 'Cristian', 'Nicolás', 'Ángel', 'Exequiel', 'Paulo', 'Giovani'],
    lastNames: ['Messi', 'Álvarez', 'Fernández', 'Mac Allister', 'Martínez', 'De Paul', 'Romero', 'Molina', 'Otamendi', 'Di María', 'Palacios', 'Dybala', 'Lo Celso', 'Montiel'],
  },
  {
    code: 'ENG',
    iso: 'gb-eng',
    name: 'England',
    weight: 2,
    firstNames: ['Jude', 'Harry', 'Bukayo', 'Declan', 'Phil', 'Marcus', 'Trent', 'Cole', 'Ollie', 'Jarrod', 'Kobbie', 'James', 'Jack', 'John', 'Kyle'],
    lastNames: ['Bellingham', 'Kane', 'Saka', 'Rice', 'Foden', 'Rashford', 'Alexander-Arnold', 'Palmer', 'Watkins', 'Bowen', 'Mainoo', 'Maddison', 'Grealish', 'Stones', 'Walker'],
  },
  {
    code: 'NED',
    iso: 'nl',
    name: 'Netherlands',
    weight: 1,
    firstNames: ['Virgil', 'Frenkie', 'Memphis', 'Cody', 'Nathan', 'Denzel', 'Matthijs', 'Ryan', 'Xavi', 'Teun', 'Jeremie', 'Bart', 'Micky', 'Tijjani', 'Brian'],
    lastNames: ['van Dijk', 'de Jong', 'Depay', 'Gakpo', 'Aké', 'Dumfries', 'de Ligt', 'Gravenberch', 'Simons', 'Koopmeiners', 'Frimpong', 'Verbruggen', 'van de Ven', 'Reijnders', 'Brobbey'],
  },
  {
    code: 'ITA',
    iso: 'it',
    name: 'Italy',
    weight: 1,
    firstNames: ['Nicolò', 'Federico', 'Gianluigi', 'Alessandro', 'Mateo', 'Davide', 'Giacomo', 'Sandro', 'Jorginho', 'Riccardo', 'Gianluca', 'Lorenzo', 'Bryan', 'Stephan', 'Destiny'],
    lastNames: ['Barella', 'Chiesa', 'Donnarumma', 'Bastoni', 'Retegui', 'Frattesi', 'Raspadori', 'Tonali', 'Fagioli', 'Calafiori', 'Scamacca', 'Pellegrini', 'Cristante', 'El Shaarawy', 'Udogie'],
  },
  {
    code: 'GER',
    iso: 'de',
    name: 'Germany',
    weight: 1,
    firstNames: ['Jamal', 'Florian', 'Leroy', 'Joshua', 'Kai', 'Antonio', 'Manuel', 'Toni', 'İlkay', 'Jonathan', 'Niclas', 'Maximilain', 'David', 'Waldemar', 'Deniz'],
    lastNames: ['Musiala', 'Wirtz', 'Sané', 'Kimmich', 'Havertz', 'Rüdiger', 'Neuer', 'Kroos', 'Gündoğan', 'Tah', 'Füllkrug', 'Mittelstädt', 'Raum', 'Anton', 'Undav'],
  },
  {
    code: 'GUI',
    iso: 'gn',
    name: 'Guinea',
    weight: 1,
    firstNames: ['Naby', 'Serhou', 'Ilaix', 'Amadou', 'Mohamed', 'Mouctar', 'Issiaga', 'François', 'Aguibou', 'Saïdou', 'Antoine', 'Morgan', 'Julian', 'Ibrahim'],
    lastNames: ['Keïta', 'Guirassy', 'Moriba', 'Diawara', 'Bayo', 'Diakhaby', 'Sylla', 'Kamano', 'Camara', 'Sow', 'Conte', 'Guilavogui', 'Jeanvier', 'Diakité', 'Ali Camara'],
  },
  {
    code: 'MAD',
    iso: 'mg',
    name: 'Madagascar',
    weight: 1,
    firstNames: ['Rayan', 'Melvin', 'Thomas', 'Loïc', 'Romain', 'Clément', 'Bastien', 'William', 'Lalaina', 'Paulin', 'Nicolas', 'Carolus', 'Hakim', 'Marco', 'Ibrahim'],
    lastNames: ['Raveloson', 'Zadi', 'Fontaine', 'Lapoussin', 'Métanire', 'Couturier', 'Ilaimaharitra', 'N\'zi', 'Nomena', 'Voavy', 'Randriambololona', 'Andriamatsinoro', 'Abdallah', 'Amada'],
  },
  {
    code: 'TUN',
    iso: 'tn',
    name: 'Tunisia',
    weight: 1,
    firstNames: ['Ellyes', 'Hannibal', 'Aïssa', 'Youssef', 'Montassar', 'Ali', 'Yan', 'Anis', 'Hamza', 'Mortadha', 'Naïm', 'Wajdi', 'Dylan', 'Mohamed', 'Bechir'],
    lastNames: ['Skhiri', 'Mejbri', 'Laïdouni', 'Msakni', 'Talbi', 'Abdi', 'Valery', 'Ben Slimane', 'Rafia', 'Ben Ouanes', 'Sliti', 'Kechrida', 'Bronn', 'Ali Ben Romdhane', 'Ben Saïd'],
  },
  {
    code: 'SUI',
    iso: 'ch',
    name: 'Switzerland',
    weight: 1,
    firstNames: ['Granit', 'Manuel', 'Breel', 'Yann', 'Denis', 'Remo', 'Fabian', 'Dan', 'Ruben', 'Michel', 'Ricardo', 'Silvan', 'Zeki', 'Vincent', 'Xherdan'],
    lastNames: ['Xhaka', 'Akanji', 'Embolo', 'Sommer', 'Zakaria', 'Freuler', 'Schär', 'Ndoye', 'Vargas', 'Aebischer', 'Rodríguez', 'Widmer', 'Amdouni', 'Sierro', 'Shaqiri'],
  },
];

const TOTAL_WEIGHT = FRENCH_LEAGUE_NATIONALITIES.reduce((sum, item) => sum + item.weight, 0);

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateFrenchPlayerNationalityAndName(): { name: string; nationality: Nationality } {
  let roll = Math.random() * TOTAL_WEIGHT;
  let selected = FRENCH_LEAGUE_NATIONALITIES[0];

  for (const item of FRENCH_LEAGUE_NATIONALITIES) {
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
