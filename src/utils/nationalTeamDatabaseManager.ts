import { NationalTeam } from '../types/nationalTeam';
import { PlayerCardData, Nationality } from '../types';
import { LeagueDatabase, EditorTeamData, TacticalStyle, FormationType } from '../types/leagueEditor';
import { TOP_50_NATIONAL_TEAMS_SEEDS, Top50NationSeedData, Confederation } from '../data/top50NationalTeamsData';
import { getDefaultTacticalPositions, generatePlaystyleForRoleAndStyle } from './tacticalSystem';
import { generateEnglishPlayerNationalityAndName } from './englishNameGenerator';
import { generateFrenchPlayerNationalityAndName } from './frenchNameGenerator';
import { generateSpanishPlayerNationalityAndName } from './spanishNameGenerator';
import { generateArgentinePlayerNationalityAndName } from './argentinaNameGenerator';
import { generateBrazilianPlayerNationalityAndName } from './brazilNameGenerator';
import { NATIONALITIES } from '../constants';
import { safeSetItem, safeGetItem } from './storageCleaner';

const STORAGE_KEY = 'FOOTBALL_CAREER_NATIONAL_TEAMS_DB_V2';

let cachedNationalTeams: NationalTeam[] | null = null;

/**
 * Calculates Senior generated OVR based on FIFA World Ranking and probability curve.
 * Rank 1–10: 75–89 (Below 80 = 25% more likely)
 * Rank 11–30: 70–89 (Below 80 = 45% more likely)
 * Rank 31–50: 65–89 (Below 80 = 60% more likely)
 *
 * Youth tiers:
 * U20 = Senior - 5
 * U17 = Senior - 10
 */
export function generateOvrForRank(rank: number, tier: 'Senior' | 'U20' | 'U17'): number {
  const clampedRank = Math.max(1, Math.min(60, rank || 25));

  if (tier === 'U17') {
    // Realistic U17 range: 55–75 OVR (Top 5: 71-75, Top 15: 66-70, Mid 60-65, Low 55-60)
    let minOvr = 55;
    let maxOvr = 63;
    if (clampedRank <= 5) {
      minOvr = 71;
      maxOvr = 75;
    } else if (clampedRank <= 15) {
      minOvr = 66;
      maxOvr = 70;
    } else if (clampedRank <= 30) {
      minOvr = 60;
      maxOvr = 65;
    }
    const variance = Math.floor(Math.random() * (maxOvr - minOvr + 1));
    return minOvr + variance;
  }

  if (tier === 'U20') {
    // Realistic U20 range: 62–82 OVR (Top 5: 77-82, Top 15: 72-76, Mid 66-71, Low 62-65)
    let minOvr = 62;
    let maxOvr = 69;
    if (clampedRank <= 5) {
      minOvr = 77;
      maxOvr = 82;
    } else if (clampedRank <= 15) {
      minOvr = 72;
      maxOvr = 76;
    } else if (clampedRank <= 30) {
      minOvr = 66;
      maxOvr = 71;
    }
    const variance = Math.floor(Math.random() * (maxOvr - minOvr + 1));
    return minOvr + variance;
  }

  // Senior: Realistic 68–89 OVR
  let minSeniorOvr = 68;
  let maxSeniorOvr = 78;
  if (clampedRank <= 5) {
    minSeniorOvr = 84;
    maxSeniorOvr = 89;
  } else if (clampedRank <= 15) {
    minSeniorOvr = 79;
    maxSeniorOvr = 83;
  } else if (clampedRank <= 30) {
    minSeniorOvr = 74;
    maxSeniorOvr = 78;
  }
  const variance = Math.floor(Math.random() * (maxSeniorOvr - minSeniorOvr + 1));
  return minSeniorOvr + variance;
}

/**
 * Positional sequence for a 35-player squad
 */
const SQUAD_35_POSITIONS = [
  'GK', 'GK', 'GK', 'GK',
  'CB', 'CB', 'CB', 'CB', 'LB', 'LB', 'RB', 'RB', 'CB', 'CB', 'LB', 'RB',
  'CDM', 'CDM', 'CM', 'CM', 'CM', 'CAM', 'CAM', 'CDM', 'CM', 'CAM', 'CM',
  'LW', 'LW', 'RW', 'RW', 'ST', 'ST', 'ST', 'ST'
];

/**
 * Procedural name generator per nation code
 */
function generateProceduralNameForNation(nationCode: string, nationName: string): { firstName: string; lastName: string } {
  const code = nationCode.toUpperCase();

  const helperToNames = (fn: () => { name: string }) => {
    const full = fn().name;
    const parts = full.split(' ');
    return {
      firstName: parts[0] || 'Player',
      lastName: parts.slice(1).join(' ') || 'Name',
    };
  };

  if (code === 'ENG' || code === 'USA' || code === 'WAL' || code === 'SCO' || code === 'CAN' || code === 'NZL' || code === 'AUS' || code === 'JAM') {
    return helperToNames(generateEnglishPlayerNationalityAndName);
  }
  if (code === 'FRA') {
    return helperToNames(generateFrenchPlayerNationalityAndName);
  }
  if (code === 'ESP' || code === 'MEX' || code === 'COL' || code === 'ECU' || code === 'PER' || code === 'CHI' || code === 'CRC' || code === 'PAN') {
    return helperToNames(generateSpanishPlayerNationalityAndName);
  }
  if (code === 'ARG' || code === 'URU') {
    return helperToNames(generateArgentinePlayerNationalityAndName);
  }
  if (code === 'BRA' || code === 'POR') {
    return helperToNames(generateBrazilianPlayerNationalityAndName);
  }

  // Nation specific pools for remaining top nations
  const pools: Record<string, { first: string[]; last: string[] }> = {
    GER: {
      first: ['Lukas', 'Florian', 'Maximilian', 'Felix', 'Leon', 'Julian', 'Jonas', 'Paul', 'Noah', 'Elias', 'Finn', 'Nico', 'Benedikt', 'Jan'],
      last: ['Müller', 'Weber', 'Hoffmann', 'Schäfer', 'Wagner', 'Becker', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Schwarz', 'Zimmermann', 'Krüger']
    },
    ITA: {
      first: ['Matteo', 'Marco', 'Lorenzo', 'Alessandro', 'Andrea', 'Francesco', 'Leonardo', 'Gabriele', 'Mattia', 'Riccardo', 'Tommaso', 'Federico'],
      last: ['Rossi', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Galli', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano']
    },
    NED: {
      first: ['Daan', 'Sander', 'Jan', 'Bram', 'Lars', 'Thijs', 'Jesse', 'Luuk', 'Milan', 'Stijn', 'Sven', 'Joris', 'Koen', 'Tim'],
      last: ['van Dijk', 'de Jong', 'Bakker', 'Jansen', 'de Vries', 'van de Berg', 'Visser', 'Smit', 'Meijer', 'de Boer', 'Mulder', 'Bos', 'Vos']
    },
    BEL: {
      first: ['Arthur', 'Liam', 'Noah', 'Jules', 'Lucas', 'Louis', 'Victor', 'Gabriel', 'Adam', 'Wout', 'Kevin', 'Romain', 'Thibaut'],
      last: ['Peeters', 'Janssens', 'Maes', 'Jacobs', 'Mertens', 'Willems', 'Claes', 'Goossens', 'Wouters', 'De Smet', 'Hermans', 'Hendrickx']
    },
    CRO: {
      first: ['Luka', 'Ivan', 'Marko', 'Filip', 'Borna', 'Josip', 'Mateo', 'Dominik', 'Lovro', 'Nikola', 'Mario', 'Kristijan'],
      last: ['Horvat', 'Kovačević', 'Babić', 'Marić', 'Jurić', 'Novak', 'Kovačić', 'Knežević', 'Vuković', 'Marković', 'Matić', 'Petrović']
    },
    SUI: {
      first: ['Noah', 'Liam', 'Luca', 'Matteo', 'Gabriel', 'Nico', 'Elias', 'Fabian', 'Sven', 'Simon', 'Pascal', 'Jan'],
      last: ['Frei', 'Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Schneider', 'Huber', 'Brunner', 'Steiner', 'Baumann', 'Graf']
    },
    DEN: {
      first: ['William', 'Noah', 'Oscar', 'Lucas', 'Victor', 'Malthe', 'Emil', 'Oliver', 'Alfred', 'Carl', 'Frederik', 'Christian'],
      last: ['Nielsen', 'Jensen', 'Hansen', 'Pedersen', 'Andersen', 'Christensen', 'Larsen', 'Sørensen', 'Rasmussen', 'Jørgensen']
    },
    AUT: {
      first: ['Paul', 'David', 'Jakob', 'Maximilian', 'Felix', 'Alexander', 'Tobias', 'Moritz', 'Jonas', 'Sebastian'],
      last: ['Gruber', 'Bauer', 'Pichler', 'Steiner', 'Moser', 'Mayer', 'Hofer', 'Leitner', 'Berger', 'Fuchs']
    },
    UKR: {
      first: ['Andriy', 'Artem', 'Mykhailo', 'Viktor', 'Vitaliy', 'Oleksandr', 'Taras', 'Illia', 'Danylo', 'Vladyslav', 'Bohdan'],
      last: ['Shevchenko', 'Bondarenko', 'Tkachenko', 'Kovalenko', 'Kravchenko', 'Oliynyk', 'Boyko', 'Shevchuk', 'Koval', 'Marchenko']
    },
    TUR: {
      first: ['Arda', 'Yusuf', 'Kerem', 'Kenan', 'Hakan', 'Cenk', 'Barış', 'Semih', 'Salih', 'Kaan', 'Mert', 'Orkun'],
      last: ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Arslan', 'Doğan', 'Kılıç']
    },
    POL: {
      first: ['Jakub', 'Antoni', 'Jan', 'Szymon', 'Filip', 'Kacper', 'Mikolaj', 'Aleksander', 'Franciszek', 'Michal'],
      last: ['Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański']
    },
    SWE: {
      first: ['William', 'Liam', 'Noah', 'Lucas', 'Oliver', 'Oscar', 'Hugo', 'Alexander', 'Elias', 'Viktor'],
      last: ['Johansson', 'Andersson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 'Olsson', 'Persson', 'Svensson', 'Gustafsson']
    },
    HUN: {
      first: ['Dominik', 'Bence', 'Máté', 'Levente', 'Dániel', 'Ádám', 'Dávid', 'Balázs', 'Gergő', 'Péter'],
      last: ['Nagy', 'Kovács', 'Tóth', 'Szabó', 'Horváth', 'Varga', 'Kiss', 'Molnár', 'Németh', 'Farkas']
    },
    SRB: {
      first: ['Dušan', 'Aleksandar', 'Nikola', 'Strahinja', 'Luka', 'Marko', 'Lazar', 'Filip', 'Miloš', 'Nemanja'],
      last: ['Jovanović', 'Petrović', 'Nikolić', 'Marković', 'Đorđević', 'Stojanović', 'Ilić', 'Stanković', 'Pavlović']
    },
    RUS: {
      first: ['Aleksandr', 'Artem', 'Dmitry', 'Ivan', 'Mikhail', 'Maxim', 'Danil', 'Roman', 'Sergey', 'Nikita'],
      last: ['Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Vasiliev', 'Petrov', 'Sokolov', 'Mikhailov', 'Fedorov', 'Morozov']
    },
    SVK: {
      first: ['Jakub', 'Samuel', 'Adam', 'Michal', 'Tomas', 'Martin', 'Lukas', 'Filip', 'Marek', 'David'],
      last: ['Varga', 'Tóth', 'Horváth', 'Kováč', 'Varga', 'Polák', 'Nagy', 'Balaž', 'Kollár', 'Kováčik']
    },
    ROU: {
      first: ['Andrei', 'Alexandru', 'Gabriel', 'Stefan', 'Ionut', 'Mihai', 'Florin', 'Cristian', 'Dennis', 'Darius'],
      last: ['Popa', 'Popescu', 'Radu', 'Ionescu', 'Dumitru', 'Stoica', 'Stan', 'Gheorghe', 'Rusu', 'Munteanu']
    },
    CZE: {
      first: ['Jakub', 'Jan', 'Tomas', 'Adam', 'Matyás', 'Filip', 'Vojtech', 'Lukas', 'David', 'Ondrej'],
      last: ['Novák', 'Svoboda', 'Novotný', 'Dvořák', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec']
    },
    MAR: {
      first: ['Achraf', 'Youssef', 'Hakim', 'Sofyan', 'Azzedine', 'Bilal', 'Zakaria', 'Amine', 'Ilias', 'Brahim', 'Abde'],
      last: ['Hakimi', 'En-Nesyri', 'Ziyech', 'Amrabat', 'Ounahi', 'El Khannouss', 'Abqar', 'Harit', 'Adli', 'Saiss']
    },
    SEN: {
      first: ['Sadio', 'Kalidou', 'Nicolas', 'Ismaïla', 'Pape', 'Habib', 'Idrissa', 'Lamine', 'Formose', 'Bamba'],
      last: ['Mané', 'Koulibaly', 'Jackson', 'Sarr', 'Gueye', 'Diallo', 'Mendy', 'Camara', 'Diatta', 'Ndiaye']
    },
    NGA: {
      first: ['Victor', 'Ademola', 'Alex', 'Wilfred', 'Samuel', 'Kelechi', 'Terem', 'Calvin', 'Bright', 'Frank'],
      last: ['Osimhen', 'Lookman', 'Iwobi', 'Ndidi', 'Chukwueze', 'Iheanacho', 'Moffi', 'Bassey', 'Osayi-Samuel', 'Onyeka']
    },
    EGY: {
      first: ['Mohamed', 'Omar', 'Mahmoud', 'Mostafa', 'Trezegeut', 'Ahmed', 'Emam', 'Marwan', 'Hamdi', 'Zizo'],
      last: ['Salah', 'Marmoush', 'Trezeguet', 'Mohamed', 'Ashour', 'Fathi', 'Hany', 'Abdelmonem', 'El Shenawy', 'Hassan']
    },
    CIV: {
      first: ['Franck', 'Simon', 'Seko', 'Ibrahim', 'Evan', 'Oumar', 'Nicolas', 'Sébastien', 'Wilfried', 'Jeremie'],
      last: ['Kessié', 'Adingra', 'Fofana', 'Sangaré', 'Ndicka', 'Diakité', 'Pépé', 'Haller', 'Singa', 'Boga']
    },
    TUN: {
      first: ['Youssef', 'Aissa', 'Ellyes', 'Hannibal', 'Montassar', 'Ali', 'Hamza', 'Anis', 'Nader', 'Mohamed'],
      last: ['Msakni', 'Laïdouni', 'Skhiri', 'Mejbri', 'Talbi', 'Abdi', 'Rafia', 'Ben Slimane', 'Ghandri', 'Dahmen']
    },
    ALG: {
      first: ['Riyad', 'Ismaël', 'Rayan', 'Youcef', 'Ramy', 'Aïssa', 'Houssem', 'Said', 'Farès', 'Amine'],
      last: ['Mahrez', 'Bennacer', 'Aït-Nouri', 'Atal', 'Bensebaini', 'Mandi', 'Aouar', 'Benrahma', 'Chaïbi', 'Gouiri']
    },
    MLI: {
      first: ['Yves', 'Amadou', 'Kamory', 'El Bilal', 'Hamari', 'Falaye', 'Moussa', 'Adama', 'Aliou', 'Lassine'],
      last: ['Bissouma', 'Haidara', 'Doumbia', 'Touré', 'Traoré', 'Sacko', 'Djenepo', 'Diarra', 'Coulibaly', 'Camara']
    },
    CMR: {
      first: ['Bryan', 'Vincent', 'André', 'Frank', 'Christopher', 'Carlos', 'Jackson', 'Georges-Kévin', 'Jean-Charles'],
      last: ['Mbeumo', 'Aboubakar', 'Onana', 'Anguissa', 'Wooh', 'Baleba', 'Tchatchoua', 'Nkoudou', 'Castelletto', 'Castel']
    },
    JPN: {
      first: ['Takefusa', 'Kaoru', 'Wataru', 'Ritsu', 'Takumi', 'Keito', 'Daichi', 'Hidemasa', 'Ko', 'Yukinari', 'Shogo'],
      last: ['Kubo', 'Mitoma', 'Endo', 'Doan', 'Minamino', 'Nakamura', 'Kamada', 'Morita', 'Itakura', 'Sugawara', 'Taniguchi']
    },
    IRN: {
      first: ['Mehdi', 'Sardar', 'Alireza', 'Saman', 'Mehdi', 'Saeid', 'Ramin', 'Milad', 'Shoja', 'Hossein', 'Alireza'],
      last: ['Taremi', 'Azmoun', 'Jahanbakhsh', 'Ghoddos', 'Torabi', 'Ezatolahi', 'Rezaeian', 'Mohammadi', 'Khalilzadeh', 'Beiranvand']
    },
    KOR: {
      first: ['Heung-min', 'Kang-in', 'Min-jae', 'Hee-chan', 'In-beom', 'Jae-sung', 'Hyun-gyu', 'Young-woo', 'Kyu-baek'],
      last: ['Son', 'Lee', 'Kim', 'Hwang', 'Choi', 'Park', 'Jung', 'Kang', 'Yoon', 'Cho']
    },
    AUS: {
      first: ['Jackson', 'Harry', 'Riley', 'Craig', 'Ajdin', 'Martin', 'Cameron', 'Mathew', 'Kusini', 'Mitchell'],
      last: ['Irvine', 'Souttar', 'McGree', 'Goodwin', 'Hrustic', 'Boyle', 'Burgess', 'Ryan', 'Yengi', 'Duke']
    },
    QAT: {
      first: ['Akram', 'Almoez', 'Hassan', 'Bassam', 'Tarek', 'Pedro', 'Homam', 'Jassem', 'Boualem', 'Meshaal'],
      last: ['Afif', 'Ali', 'Al-Haydos', 'Al-Rawi', 'Salman', 'Miguel', 'Ahmed', 'Jaber', 'Khoukhi', 'Barsham']
    },
  };

  const p = pools[code] || {
    first: ['Alex', 'Marco', 'David', 'Lucas', 'Mateo', 'Leo', 'Gabriel', 'Daniel', 'Julian', 'Adrian'],
    last: ['Silva', 'Santos', 'Fernandez', 'Gomez', 'Novak', 'Kovacs', 'Smit', 'Taylor', 'Martin', 'Rossi']
  };

  const firstName = p.first[Math.floor(Math.random() * p.first.length)];
  const lastName = p.last[Math.floor(Math.random() * p.last.length)];
  return { firstName, lastName };
}

/**
 * Creates a generated player for a specific slot, position, and OVR target
 */
function createGeneratedNationalPlayer(
  nationCode: string,
  nationName: string,
  iso: string,
  position: string,
  ovr: number,
  tier: 'Senior' | 'U20' | 'U17',
  slotIdx: number,
  tacticStyle: TacticalStyle = 'possession'
): PlayerCardData {
  const { firstName, lastName } = generateProceduralNameForNation(nationCode, nationName);
  const fullName = `${firstName} ${lastName}`;

  let age = 25;
  if (tier === 'U20') {
    age = Math.floor(18 + Math.random() * 3); // 18-20
  } else if (tier === 'U17') {
    age = Math.floor(15 + Math.random() * 3); // 15-17
  } else {
    age = Math.floor(21 + Math.random() * 12); // 21-32
  }

  // Generate realistic balanced attributes based on target OVR and position
  const isGk = position === 'GK';
  const pace = isGk ? Math.round(ovr * 0.7) : Math.round(ovr + (Math.random() * 10 - 5));
  const shooting = isGk ? Math.round(ovr * 0.4) : position === 'ST' || position === 'LW' || position === 'RW' ? Math.round(ovr + 3) : Math.round(ovr - 5);
  const passing = isGk ? Math.round(ovr * 0.6) : position === 'CM' || position === 'CAM' ? Math.round(ovr + 4) : Math.round(ovr - 2);
  const dribbling = isGk ? Math.round(ovr * 0.5) : position === 'LW' || position === 'RW' || position === 'CAM' ? Math.round(ovr + 5) : Math.round(ovr - 3);
  const defending = isGk ? Math.round(ovr * 0.4) : position === 'CB' || position === 'CDM' || position === 'LB' || position === 'RB' ? Math.round(ovr + 5) : Math.round(ovr - 12);
  const physical = isGk ? Math.round(ovr * 0.8) : Math.round(ovr + (Math.random() * 8 - 4));

  const clamp = (val: number) => Math.max(40, Math.min(99, val));

  const generatedPlaystyle = generatePlaystyleForRoleAndStyle(position, tacticStyle, slotIdx, ovr);

  return {
    id: `nat-${nationCode.toLowerCase()}-${tier.toLowerCase()}-${slotIdx}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    firstName,
    lastName,
    name: fullName,
    position: position as any,
    subPosition: position as any,
    playStyle: generatedPlaystyle,
    ovr,
    overallRating: ovr,
    age,
    club: `${nationName} National Pool`,
    nationality: {
      code: nationCode,
      iso,
      name: nationName,
    },
    stats: {
      pro: clamp(passing),
      def: clamp(defending),
      cre: clamp(dribbling),
      men: clamp(shooting),
      goa: clamp(shooting),
      phy: clamp(physical),
    },
    biometrics: {
      strength: clamp(physical),
      skinColor: '#f1c27d',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#000000',
      hairDye: '#000000',
    },
    accessories: {
      accessory: 'none',
      headbandColor: '#000000',
    },
    kit: {
      style: 'normal',
      color1: '#38bdf8',
      color2: '#ffffff',
      pattern: 'solid',
      collar: 'crew',
    },
    emblem: {
      shape: 'circle',
      mode: '1',
      color1: '#1e3a8a',
      color2: '#f59e0b',
    },
    shirtNumber: slotIdx + 1,
  };
}

/**
 * Searches the existing database for eligible players for a national team and tier.
 */
function findEligiblePlayersFromDatabase(
  leagueDb: LeagueDatabase | undefined,
  nationCode: string,
  nationName: string,
  tier: 'Senior' | 'U20' | 'U17'
): PlayerCardData[] {
  if (!leagueDb || !leagueDb.teams) return [];

  const eligible: PlayerCardData[] = [];
  const addedIds = new Set<string>();

  const isNationMatch = (player: PlayerCardData) => {
    if (!player.nationality) return false;
    const pNatCode = (typeof player.nationality === 'object' ? player.nationality?.code : player.nationality) || '';
    const pNatName = (typeof player.nationality === 'object' ? player.nationality?.name : player.nationality) || '';
    const targetCode = (nationCode || '').toUpperCase();
    const targetName = (nationName || '').toLowerCase();

    if ((pNatCode && pNatCode.toUpperCase() === targetCode) || (pNatName && pNatName.toLowerCase() === targetName)) return true;
    if (player.otherNationalities && Array.isArray(player.otherNationalities)) {
      return player.otherNationalities.some(
        (n) => (n?.code && n.code.toUpperCase() === targetCode) || (n?.name && n.name.toLowerCase() === targetName)
      );
    }
    return false;
  };

  const isAgeMatch = (player: PlayerCardData) => {
    const age = player.age || 24;
    if (tier === 'Senior') return age >= 21;
    if (tier === 'U20') return age >= 18 && age <= 20;
    if (tier === 'U17') return age <= 17;
    return true;
  };

  // Iterate over all club teams in database
  Object.values(leagueDb.teams).forEach((team: EditorTeamData) => {
    const rawSlots: any[] = [
      ...(team.squadSaveFile?.squad || []),
      ...(team.squadSaveFile?.reserves || []),
      ...(team.squadSaveFile?.u20 || []),
      ...(team.squadSaveFile?.u17 || []),
    ];

    rawSlots.forEach((slot: any) => {
      const p: PlayerCardData = slot?.player || slot;
      if (p && p.id && !addedIds.has(p.id) && isNationMatch(p) && isAgeMatch(p)) {
        addedIds.add(p.id);
        eligible.push(p);
      }
    });
  });

  return eligible;
}

/**
 * Generates or populates a complete 35-player squad for a tier.
 */
function buildFull35SquadForTier(
  leagueDb: LeagueDatabase | undefined,
  seed: Top50NationSeedData,
  tier: 'Senior' | 'U20' | 'U17'
): PlayerCardData[] {
  const existingEligible = findEligiblePlayersFromDatabase(leagueDb, seed.code, seed.name, tier);
  const resultSquad: PlayerCardData[] = [...existingEligible];

  const needed = 35 - resultSquad.length;

  if (needed > 0) {
    for (let i = 0; i < needed; i++) {
      const slotIdx = resultSquad.length;
      const targetPos = SQUAD_35_POSITIONS[slotIdx % SQUAD_35_POSITIONS.length];
      const targetOvr = generateOvrForRank(seed.rank, tier);

      const generatedPlayer = createGeneratedNationalPlayer(
        seed.code,
        seed.name,
        seed.iso,
        targetPos,
        targetOvr,
        tier,
        slotIdx,
        seed.primaryTacticStyle
      );

      resultSquad.push(generatedPlayer);
    }
  }

  // Sort squad by OVR descending
  resultSquad.sort((a, b) => (b.overallRating || b.ovr || 70) - (a.overallRating || a.ovr || 70));

  // Assign clean shirt numbers 1 to 35
  resultSquad.forEach((p, idx) => {
    p.shirtNumber = idx + 1;
  });

  return resultSquad.slice(0, 35);
}

/**
 * Calculates overall team OVR from top Senior squad players
 */
function calculateNationalTeamOvrFromSquad(seniorSquad: PlayerCardData[]): number {
  if (!seniorSquad || seniorSquad.length === 0) return 75;
  const top11 = seniorSquad.slice(0, 11);
  const sum = top11.reduce((acc, p) => acc + (p.overallRating || p.ovr || 70), 0);
  return Math.round(sum / top11.length);
}

/**
 * Returns the full Top 50 National Teams Database.
 */
export function getNationalTeamsDatabase(leagueDb?: LeagueDatabase): NationalTeam[] {
  if (cachedNationalTeams) {
    return cachedNationalTeams;
  }

  // Try loading from localStorage
  try {
    const saved = safeGetItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as NationalTeam[];
      if (Array.isArray(parsed) && parsed.length >= 50) {
        cachedNationalTeams = parsed;
        return cachedNationalTeams;
      }
    }
  } catch (e) {
    console.warn('Failed to load national teams database from localStorage', e);
  }

  // Initialize from TOP_50_NATIONAL_TEAMS_SEEDS
  const teams: NationalTeam[] = TOP_50_NATIONAL_TEAMS_SEEDS.map((seed) => {
    const seniorSquad = buildFull35SquadForTier(leagueDb, seed, 'Senior');
    const u20Squad = buildFull35SquadForTier(leagueDb, seed, 'U20');
    const u17Squad = buildFull35SquadForTier(leagueDb, seed, 'U17');

    const calculatedOvr = calculateNationalTeamOvrFromSquad(seniorSquad);

    const primaryTacticalPositions = getDefaultTacticalPositions(seed.primaryTacticFormation, seed.primaryTacticStyle);
    const secondaryTacticalPositions = getDefaultTacticalPositions(seed.secondaryTacticFormation, seed.secondaryTacticStyle);

    return {
      id: `nat-team-${seed.code.toLowerCase()}`,
      nation: {
        code: seed.code,
        iso: seed.iso,
        name: seed.name,
      },
      confederation: seed.confederation,
      fifaRanking: seed.rank,
      teamOvr: calculatedOvr,
      manager: {
        name: seed.managerName,
        nationality: seed.managerNationality,
        hasSecondaryTactic: true,
        primaryTactic: {
          formation: seed.primaryTacticFormation,
          style: seed.primaryTacticStyle,
          positions: primaryTacticalPositions,
        },
        secondaryTactic: {
          formation: seed.secondaryTacticFormation,
          style: seed.secondaryTacticStyle,
          positions: secondaryTacticalPositions,
        },
      },
      stadium: {
        name: seed.stadiumName,
        capacity: seed.stadiumCapacity,
        tier: 5,
      },
      homeKit: seed.homeKit,
      awayKit: seed.awayKit,
      squad: seniorSquad,
      u20Squad,
      u17Squad,
      competitions: ['FIFA World Cup', 'Continental Championship', 'International Friendly Series'],
    };
  });

  cachedNationalTeams = teams;
  return teams;
}

/**
 * Saves the updated National Teams Database to localStorage and memory cache.
 */
export function saveNationalTeamsDatabase(teams: NationalTeam[]): void {
  cachedNationalTeams = teams;
  try {
    const compact = teams.map((t) => {
      const stripPlayerDups = (p: PlayerCardData) => {
        if (!p) return p;
        const { kit, emblem, ...rest } = p;
        return rest as PlayerCardData;
      };

      return {
        ...t,
        squad: t.squad?.map(stripPlayerDups),
        u20Squad: t.u20Squad?.map(stripPlayerDups),
        u17Squad: t.u17Squad?.map(stripPlayerDups),
      };
    });
    safeSetItem(STORAGE_KEY, JSON.stringify(compact));
  } catch (e) {
    console.warn('Failed to save national teams database to localStorage', e);
  }
}

/**
 * Updates a single national team in the database.
 */
export function updateNationalTeamInDatabase(updatedTeam: NationalTeam): NationalTeam[] {
  const current = getNationalTeamsDatabase();
  const idx = current.findIndex((t) => t.id === updatedTeam.id || t.nation.code === updatedTeam.nation.code);

  if (idx !== -1) {
    current[idx] = { ...updatedTeam };
  } else {
    current.push(updatedTeam);
  }

  saveNationalTeamsDatabase(current);
  return [...current];
}
