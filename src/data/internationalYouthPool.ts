import { FederationName, RepresentativePlayer, InternationalYouthClub } from '../types/youthLeague';

export interface FederationClubTemplate {
  id: string;
  name: string;
  country: string;
  federation: FederationName;
  flag: string;
  primaryColor: string;
  secondaryColor: string;
  preferredFormation: string;
}

export const FEDERATION_CLUB_POOLS: Record<FederationName, FederationClubTemplate[]> = {
  UEFA: [
    { id: 'uefa-barcelona', name: 'FC Barcelona', country: 'Spain', federation: 'UEFA', flag: '🇪🇸', primaryColor: '#a50044', secondaryColor: '#004d98', preferredFormation: '4-3-3' },
    { id: 'uefa-real-madrid', name: 'Real Madrid', country: 'Spain', federation: 'UEFA', flag: '🇪🇸', primaryColor: '#ffffff', secondaryColor: '#febe10', preferredFormation: '4-3-3' },
    { id: 'uefa-man-city', name: 'Manchester City', country: 'England', federation: 'UEFA', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', primaryColor: '#6cabdd', secondaryColor: '#1c2c5b', preferredFormation: '4-3-3' },
    { id: 'uefa-chelsea', name: 'Chelsea FC', country: 'England', federation: 'UEFA', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', primaryColor: '#034694', secondaryColor: '#ee242c', preferredFormation: '4-2-3-1' },
    { id: 'uefa-arsenal', name: 'Arsenal FC', country: 'England', federation: 'UEFA', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', primaryColor: '#ef0107', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'uefa-psg', name: 'Paris Saint-Germain', country: 'France', federation: 'UEFA', flag: '🇫🇷', primaryColor: '#004170', secondaryColor: '#da291c', preferredFormation: '4-3-3' },
    { id: 'uefa-bayern', name: 'Bayern Munich', country: 'Germany', federation: 'UEFA', flag: '🇩🇪', primaryColor: '#dc052d', secondaryColor: '#0066b2', preferredFormation: '4-2-3-1' },
    { id: 'uefa-dortmund', name: 'Borussia Dortmund', country: 'Germany', federation: 'UEFA', flag: '🇩🇪', primaryColor: '#fde100', secondaryColor: '#000000', preferredFormation: '4-3-3' },
    { id: 'uefa-ajax', name: 'Ajax Amsterdam', country: 'Netherlands', federation: 'UEFA', flag: '🇳🇱', primaryColor: '#d2122e', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'uefa-benfica', name: 'SL Benfica', country: 'Portugal', federation: 'UEFA', flag: '🇵🇹', primaryColor: '#ff0000', secondaryColor: '#ffffff', preferredFormation: '4-4-2' },
    { id: 'uefa-sporting', name: 'Sporting CP', country: 'Portugal', federation: 'UEFA', flag: '🇵🇹', primaryColor: '#008000', secondaryColor: '#ffffff', preferredFormation: '3-4-3' },
    { id: 'uefa-juventus', name: 'Juventus', country: 'Italy', federation: 'UEFA', flag: '🇮🇹', primaryColor: '#000000', secondaryColor: '#ffffff', preferredFormation: '3-5-2' },
    { id: 'uefa-milan', name: 'AC Milan', country: 'Italy', federation: 'UEFA', flag: '🇮🇹', primaryColor: '#fb090b', secondaryColor: '#000000', preferredFormation: '4-2-3-1' },
    { id: 'uefa-dinamo', name: 'Dinamo Zagreb', country: 'Croatia', federation: 'UEFA', flag: '🇭🇷', primaryColor: '#0000ff', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'uefa-salzburg', name: 'Red Bull Salzburg', country: 'Austria', federation: 'UEFA', flag: '🇦🇹', primaryColor: '#e20111', secondaryColor: '#ffffff', preferredFormation: '4-4-2' },
    { id: 'uefa-anderlecht', name: 'RSC Anderlecht', country: 'Belgium', federation: 'UEFA', flag: '🇧🇪', primaryColor: '#5c2d91', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
  ],
  CONMEBOL: [
    { id: 'con-river', name: 'River Plate', country: 'Argentina', federation: 'CONMEBOL', flag: '🇦🇷', primaryColor: '#ffffff', secondaryColor: '#eb1c24', preferredFormation: '4-3-1-2' },
    { id: 'con-boca', name: 'Boca Juniors', country: 'Argentina', federation: 'CONMEBOL', flag: '🇦🇷', primaryColor: '#0047ab', secondaryColor: '#f7d117', preferredFormation: '4-3-3' },
    { id: 'con-flamengo', name: 'Flamengo', country: 'Brazil', federation: 'CONMEBOL', flag: '🇧🇷', primaryColor: '#c3281e', secondaryColor: '#000000', preferredFormation: '4-2-3-1' },
    { id: 'con-palmeiras', name: 'Palmeiras', country: 'Brazil', federation: 'CONMEBOL', flag: '🇧🇷', primaryColor: '#006437', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'con-santos', name: 'Santos FC', country: 'Brazil', federation: 'CONMEBOL', flag: '🇧🇷', primaryColor: '#ffffff', secondaryColor: '#000000', preferredFormation: '4-3-3' },
    { id: 'con-sao-paulo', name: 'São Paulo FC', country: 'Brazil', federation: 'CONMEBOL', flag: '🇧🇷', primaryColor: '#fe0000', secondaryColor: '#000000', preferredFormation: '4-2-3-1' },
    { id: 'con-penarol', name: 'Peñarol', country: 'Uruguay', federation: 'CONMEBOL', flag: '🇺🇾', primaryColor: '#fcd116', secondaryColor: '#000000', preferredFormation: '4-4-2' },
    { id: 'con-nacional', name: 'Nacional', country: 'Uruguay', federation: 'CONMEBOL', flag: '🇺🇾', primaryColor: '#002f6c', secondaryColor: '#ba0c2f', preferredFormation: '4-3-3' },
    { id: 'con-idv', name: 'Independiente del Valle', country: 'Ecuador', federation: 'CONMEBOL', flag: '🇪🇨', primaryColor: '#000000', secondaryColor: '#1d70b8', preferredFormation: '4-3-3' },
    { id: 'con-atletico-nac', name: 'Atlético Nacional', country: 'Colombia', federation: 'CONMEBOL', flag: '🇨🇴', primaryColor: '#008751', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
  ],
  CAF: [
    { id: 'caf-al-ahly', name: 'Al Ahly SC', country: 'Egypt', federation: 'CAF', flag: '🇪🇬', primaryColor: '#e30613', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'caf-sundowns', name: 'Mamelodi Sundowns', country: 'South Africa', federation: 'CAF', flag: '🇿🇦', primaryColor: '#f7ce00', secondaryColor: '#00853f', preferredFormation: '4-3-3' },
    { id: 'caf-wydad', name: 'Wydad Casablanca', country: 'Morocco', federation: 'CAF', flag: '🇲🇦', primaryColor: '#e20613', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'caf-asec', name: 'ASEC Mimosas', country: "Côte d'Ivoire", federation: 'CAF', flag: '🇨🇮', primaryColor: '#ff8200', secondaryColor: '#000000', preferredFormation: '4-3-3' },
    { id: 'caf-generation', name: 'Génération Foot', country: 'Senegal', federation: 'CAF', flag: '🇸🇳', primaryColor: '#00853f', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'caf-tp-mazembe', name: 'TP Mazembe', country: 'DR Congo', federation: 'CAF', flag: '🇨🇩', primaryColor: '#000000', secondaryColor: '#ffffff', preferredFormation: '4-4-2' },
  ],
  AFC: [
    { id: 'afc-al-hilal', name: 'Al Hilal SFC', country: 'Saudi Arabia', federation: 'AFC', flag: '🇸🇦', primaryColor: '#0033a0', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'afc-urawa', name: 'Urawa Red Diamonds', country: 'Japan', federation: 'AFC', flag: '🇯🇵', primaryColor: '#d7000f', secondaryColor: '#000000', preferredFormation: '4-2-3-1' },
    { id: 'afc-jeonbuk', name: 'Jeonbuk Hyundai Motors', country: 'South Korea', federation: 'AFC', flag: '🇰🇷', primaryColor: '#005a2b', secondaryColor: '#84be00', preferredFormation: '4-1-4-1' },
    { id: 'afc-marinos', name: 'Yokohama F. Marinos', country: 'Japan', federation: 'AFC', flag: '🇯🇵', primaryColor: '#000080', secondaryColor: '#ff0000', preferredFormation: '4-3-3' },
    { id: 'afc-al-ain', name: 'Al Ain FC', country: 'UAE', federation: 'AFC', flag: '🇦🇪', primaryColor: '#4b0082', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'afc-melbourne', name: 'Melbourne City', country: 'Australia', federation: 'AFC', flag: '🇦🇺', primaryColor: '#6cabdd', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
  ],
  OFC: [
    { id: 'ofc-auckland', name: 'Auckland City FC', country: 'New Zealand', federation: 'OFC', flag: '🇳🇿', primaryColor: '#0000ff', secondaryColor: '#ffffff', preferredFormation: '4-3-3' },
    { id: 'ofc-wellington', name: 'Team Wellington', country: 'New Zealand', federation: 'OFC', flag: '🇳🇿', primaryColor: '#ffff00', secondaryColor: '#000000', preferredFormation: '4-4-2' },
    { id: 'ofc-hekari', name: 'Hekari United', country: 'Papua New Guinea', federation: 'OFC', flag: '🇵🇬', primaryColor: '#ff0000', secondaryColor: '#000000', preferredFormation: '4-4-2' },
    { id: 'ofc-suva', name: 'Suva FC', country: 'Fiji', federation: 'OFC', flag: '🇫🇯', primaryColor: '#ffffff', secondaryColor: '#000000', preferredFormation: '4-3-3' },
  ],
  CONCACAF: [
    { id: 'cnc-pachuca', name: 'CF Pachuca', country: 'Mexico', federation: 'CONCACAF', flag: '🇲🇽', primaryColor: '#002f6c', secondaryColor: '#ffffff', preferredFormation: '4-2-3-1' },
    { id: 'cnc-america', name: 'Club América', country: 'Mexico', federation: 'CONCACAF', flag: '🇲🇽', primaryColor: '#ffff99', secondaryColor: '#000080', preferredFormation: '4-3-3' },
    { id: 'cnc-dallas', name: 'FC Dallas', country: 'United States', federation: 'CONCACAF', flag: '🇺🇸', primaryColor: '#e31837', secondaryColor: '#002d62', preferredFormation: '4-2-3-1' },
    { id: 'cnc-la-galaxy', name: 'LA Galaxy', country: 'United States', federation: 'CONCACAF', flag: '🇺🇸', primaryColor: '#00245d', secondaryColor: '#ffd100', preferredFormation: '4-3-3' },
    { id: 'cnc-saprissa', name: 'Deportivo Saprissa', country: 'Costa Rica', federation: 'CONCACAF', flag: '🇨🇷', primaryColor: '#7b002c', secondaryColor: '#ffffff', preferredFormation: '4-4-2' },
    { id: 'cnc-seattle', name: 'Seattle Sounders', country: 'United States', federation: 'CONCACAF', flag: '🇺🇸', primaryColor: '#5d9732', secondaryColor: '#005595', preferredFormation: '4-2-3-1' },
  ],
};

const FIRST_NAMES_BY_COUNTRY: Record<string, string[]> = {
  Spain: ['Juan', 'Mateo', 'Lucas', 'Pablo', 'Hugo', 'Leo', 'Alejandro', 'Daniel'],
  England: ['Harry', 'Oliver', 'George', 'Noah', 'Jack', 'Arthur', 'Leo', 'Charlie'],
  France: ['Gabriel', 'Léo', 'Raphaël', 'Louis', 'Arthur', 'Jules', 'Maël', 'Lucas'],
  Germany: ['Noah', 'Matteo', 'Finn', 'Leon', 'Paul', 'Elias', 'Lukas', 'Felix'],
  Netherlands: ['Noah', 'Sem', 'Lucas', 'Liam', 'Mees', 'Daan', 'Milan', 'Levi'],
  Portugal: ['Francisco', 'Afonso', 'Duarte', 'Lourenço', 'Tomas', 'Martim', 'Rodrigo'],
  Italy: ['Leonardo', 'Francesco', 'Tommaso', 'Edoardo', 'Alessandro', 'Lorenzo', 'Mattia'],
  Croatia: ['Luka', 'David', 'Jakov', 'Petar', 'Ivan', 'Mateo', 'Roko', 'Filip'],
  Argentina: ['Mateo', 'Thiago', 'Benjamín', 'Joaquín', 'Bautista', 'Felipe', 'Santiago'],
  Brazil: ['Gabriel', 'Lucas', 'Pedro', 'Matheus', 'Enzo', 'Guilherme', 'Nicolas'],
  Uruguay: ['Mateo', 'Santiago', 'Agustín', 'Joaquín', 'Lucas', 'Ignacio', 'Facundo'],
  Ecuador: ['Mateo', 'Thiago', 'Lucas', 'Matías', 'Gabriel', 'Alejandro', 'Dylan'],
  Colombia: ['Emiliano', 'Luciana', 'Mateo', 'Thiago', 'Matías', 'Alejandro', 'Samuel'],
  Egypt: ['Mohamed', 'Ahmed', 'Youssef', 'Omar', 'Ali', 'Hamza', 'Hassan', 'Ibrahim'],
  'South Africa': ['Siyabonga', 'Junior', 'Thabo', 'Lethabo', 'Bandile', 'Kutlwano', 'Kagiso'],
  Morocco: ['Adam', 'Youssef', 'Amine', 'Rayane', 'Yassin', 'Mehdi', 'Omar', 'Hamza'],
  "Côte d'Ivoire": ['Sekou', 'Franck', 'Yao', 'Kouassi', 'Ibrahim', 'Moussa', 'Abdoulaye'],
  Senegal: ['Mamadou', 'Ibrahima', 'Ousmane', 'Aliou', 'Cheikh', 'Pape', 'Abdoulaye'],
  'DR Congo': ['Dieumerci', 'Cedric', 'Junior', 'Glody', 'Tresor', 'Chancel', 'Joel'],
  'Saudi Arabia': ['Mohammed', 'Abdullah', 'Abdulrahman', 'Ali', 'Fahad', 'Sultan', 'Khalid'],
  Japan: ['Ren', 'Minato', 'Itsuki', 'Yamato', 'Hinata', 'Souta', 'Yuto', 'Takumi'],
  'South Korea': ['Min-jun', 'Seo-jun', 'Do-yun', 'Ha-joon', 'Eun-woo', 'Si-woo', 'Ji-ho'],
  Australia: ['Oliver', 'Noah', 'Jack', 'Henry', 'William', 'Leo', 'Lucas', 'Thomas'],
  'New Zealand': ['Oliver', 'Noah', 'Leo', 'Jack', 'Lucas', 'Ezra', 'Hudson', 'Liam'],
  'Papua New Guinea': ['John', 'Paul', 'David', 'Samuel', 'Michael', 'Peter', 'Junior'],
  Fiji: ['Tevita', 'Sisa', 'Filimoni', 'Jone', 'Mosese', 'Ratu', 'Waisea', 'Viliame'],
  Mexico: ['Santiago', 'Mateo', 'Matías', 'Diego', 'Sebastian', 'Leonardo', 'Emiliano'],
  'United States': ['Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry'],
  'Costa Rica': ['Mateo', 'Santiago', 'Thiago', 'Sebastian', 'Gabriel', 'Felipe', 'Lucas'],
};

const LAST_NAMES_BY_COUNTRY: Record<string, string[]> = {
  Spain: ['Martínez', 'García', 'López', 'González', 'Rodríguez', 'Fernández', 'Pérez'],
  England: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Davies'],
  France: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit'],
  Germany: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner'],
  Netherlands: ['de Jong', 'Jansen', 'de Vries', 'van de Berg', 'Bakker', 'Smit', 'Meijer'],
  Portugal: ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues'],
  Italy: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo'],
  Croatia: ['Horvat', 'Kovačić', 'Babić', 'Jurić', 'Novak', 'Petrović', 'Marić'],
  Argentina: ['González', 'Rodríguez', 'Gómez', 'Fernández', 'López', 'Díaz', 'Martínez'],
  Brazil: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Ferreira', 'Lima'],
  Uruguay: ['Rodríguez', 'González', 'Gómez', 'Fernández', 'López', 'Pérez', 'Silva'],
  Ecuador: ['Zambrano', 'Sánchez', 'Mendoza', 'Vera', 'Cedeño', 'Morales', 'López'],
  Colombia: ['Rodríguez', 'Gómez', 'González', 'Martínez', 'García', 'López', 'Hernández'],
  Egypt: ['Mohamed', 'Hassan', 'Ali', 'Ibrahim', 'Ahmed', 'Mahmoud', 'Elsayed'],
  'South Africa': ['Dlamini', 'Nkosi', 'Ndlovu', 'Sithole', 'Khumalo', 'Mokoena', 'Makhanya'],
  Morocco: ['Alaoui', 'Bennani', 'El Amrani', 'Chraibi', 'Idrissi', 'Berrada', 'El Mansouri'],
  "Côte d'Ivoire": ['Kouassi', 'Koffi', 'Koné', 'Yao', 'Diallo', 'Touré', 'Traoré'],
  Senegal: ['Ndiaye', 'Diop', 'Sow', 'Faye', 'Ba', 'Diallo', 'Fall'],
  'DR Congo': ['Lukaku', 'Kabamba', 'Mukendi', 'Ilunga', 'Tshilombo', 'Mbala', 'Kazadi'],
  'Saudi Arabia': ['Al-Harbi', 'Al-Ghamdi', 'Al-Qahtani', 'Al-Otaibi', 'Al-Dosari', 'Al-Shehri'],
  Japan: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto'],
  'South Korea': ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho'],
  Australia: ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Johnson'],
  'New Zealand': ['Smith', 'Wilson', 'Brown', 'Williams', 'Jones', 'Taylor', 'Patel'],
  'Papua New Guinea': ['Kila', 'Waqa', 'Pora', 'Kare', 'Aua', 'Mani', 'Vele'],
  Fiji: ['Tawake', 'Ratuvou', 'Nakarawa', 'Naivalu', 'Vatubua', 'Cakobau', 'Burotu'],
  Mexico: ['Hernández', 'García', 'Martínez', 'López', 'González', 'Pérez', 'Rodríguez'],
  'United States': ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'],
  'Costa Rica': ['Mora', 'Jiménez', 'González', 'Rodríguez', 'Vargas', 'Monge', 'Castro'],
};

export function createRepresentativePlayers(
  clubName: string,
  country: string,
  teamOvr: number,
  attOvr: number,
  midOvr: number,
  defOvr: number
): RepresentativePlayer[] {
  const firsts = FIRST_NAMES_BY_COUNTRY[country] || FIRST_NAMES_BY_COUNTRY['Spain'];
  const lasts = LAST_NAMES_BY_COUNTRY[country] || LAST_NAMES_BY_COUNTRY['Spain'];

  const getRandomName = () => {
    const f = firsts[Math.floor(Math.random() * firsts.length)];
    const l = lasts[Math.floor(Math.random() * lasts.length)];
    return `${f} ${l}`;
  };

  const positions: Array<'GK' | 'DEF' | 'MID' | 'ATT'> = ['GK', 'DEF', 'MID', 'ATT'];

  return positions.map((pos) => {
    let base = teamOvr;
    if (pos === 'GK' || pos === 'DEF') base = defOvr;
    else if (pos === 'MID') base = midOvr;
    else if (pos === 'ATT') base = attOvr;

    const varOvr = Math.max(35, Math.min(99, base + Math.floor(Math.random() * 5) - 2));

    return {
      id: `${clubName.toLowerCase().replace(/\s+/g, '-')}-${pos.toLowerCase()}`,
      name: getRandomName(),
      position: pos,
      ovr: varOvr,
      country,
    };
  });
}
