import React, { useState, useMemo } from 'react';
import { PlayerConfig, PlayerCardData, ManagerState, AccountingState } from '../types';
import {
  calculateEffectiveFame,
  isPlayerFromSouthAmericanYouthLeague,
  isPlayerStartedInArgentina,
  isPlayerStartedInBrazil,
} from '../utils/professionalOfferEligibility';
import confetti from 'canvas-confetti';
import { shouldDisableParticles } from '../utils/graphicSettingsSystem';

const triggerConfetti = () => {
  if (shouldDisableParticles()) return;
  try {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    } else if ((confetti as any)?.default && typeof (confetti as any).default === 'function') {
      (confetti as any).default({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    }
  } catch (e) {
    // ignore
  }
};
import {
  Trophy,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Banknote,
  Star,
  Clock,
  ShieldCheck,
  TrendingUp,
  Building2,
  Camera,
  Shirt,
  Users,
} from 'lucide-react';

export interface HotProspectClubPitch {
  id: string;
  clubName: string;
  shortName: string;
  badgeBg: string;
  countryName: string;
  leagueName: string;
  stadiumName: string;
  managerName: string;
  primaryAdvantage: 'Salary' | 'Starting role' | 'Contract length' | 'Release clause' | 'Development' | 'Prestige';
  advantageHighlight: string;
  weeklyWage: number;
  yearlySalary: number;
  signingBonus: number;
  contractYears: number;
  releaseClause: number;
  startingRole: string;
  roleDescription: string;
  developmentPoints: number;
  developmentPhilosophy: string;
  prestigeHonors: string;
  managerQuote: string;
  firstDayNarrative: {
    stadiumArrival: string;
    pressConferenceQuote: string;
    fanReaction: string;
  };
}

interface HotProspectEventModalProps {
  isOpen: boolean;
  player: PlayerConfig | PlayerCardData;
  manager?: ManagerState | null;
  accounting?: AccountingState;
  onCompleteTransfer: (selectedPitch: HotProspectClubPitch) => void;
  onClose: () => void;
}

export const HotProspectEventModal: React.FC<HotProspectEventModalProps> = ({
  isOpen,
  player,
  manager,
  accounting,
  onCompleteTransfer,
  onClose,
}) => {
  const [selectedClubIndex, setSelectedClubIndex] = useState<number>(0);
  const [stage, setStage] = useState<'selection' | 'first_day'>('selection');

  const ovr = player.ovr || 85;
  const effectiveFame = calculateEffectiveFame(player.fame || 0, manager);
  const isSouthAmericanYouth = isPlayerFromSouthAmericanYouthLeague(player);

  const eligiblePitches: HotProspectClubPitch[] = useMemo(() => {
    const basePitches: HotProspectClubPitch[] = [
      {
        id: 'hot_atletico',
        clubName: 'Atlético de Madrid',
        shortName: 'Atlético',
        badgeBg: 'from-red-800 via-blue-900 to-slate-950',
        countryName: 'Spain',
        leagueName: 'La Liga',
        stadiumName: 'Riyadh Air Metropolitano',
        managerName: 'Diego Simeone',
        primaryAdvantage: 'Prestige',
        advantageHighlight: 'UEFA Champions League Constant Contenders & Fearless Defensive Tenacity',
        weeklyWage: 135000,
        yearlySalary: 135000 * 52,
        signingBonus: 3500000,
        contractYears: 5,
        releaseClause: 130000000,
        startingRole: 'Key Senior Starter',
        roleDescription: 'Direct inclusion in Simeone’s intense pressing machine contesting La Liga & Champions League.',
        developmentPoints: 245,
        developmentPhilosophy: 'High-Intensity Tactical Fortitude & Unbreakable Mentality',
        prestigeHonors: '11x La Liga Titles, 3x UEFA Europa League, 3x Champions League Finalists',
        managerQuote: '"At Atlético, we don’t just admire talent; we demand courage and sacrifice. You have both."',
        firstDayNarrative: {
          stadiumArrival:
            'You step onto the pristine turf of the Metropolitano as thousands of Colchoneros cheer from the stands. Diego Simeone presents you with the iconic red-and-white stripes.',
          pressConferenceQuote:
            '"We signed a warrior with world-class feet. This club plays with heart, and today our future arrives."',
          fanReaction:
            'Front page of Marca & AS: "THE CHOSEN WARRIOR: Simeone secures Europe\'s most ferocious young prodigy!"',
        },
      },
      {
        id: 'hot_juventus',
        clubName: 'Juventus FC',
        shortName: 'Juventus',
        badgeBg: 'from-neutral-900 via-slate-800 to-amber-500',
        countryName: 'Italy',
        leagueName: 'Serie A',
        stadiumName: 'Allianz Stadium (Turin)',
        managerName: 'Thiago Motta',
        primaryAdvantage: 'Salary',
        advantageHighlight: 'Regal Italian Wage Package (€160k/wk) & Sovereign Silverware Pedigree',
        weeklyWage: 160000,
        yearlySalary: 160000 * 52,
        signingBonus: 4200000,
        contractYears: 4,
        releaseClause: 110000000,
        startingRole: 'Undisputed Focal Talisman',
        roleDescription: 'Guaranteed centerpiece of the Bianconeri tactical project targeting the Scudetto.',
        developmentPoints: 235,
        developmentPhilosophy: 'Tactical Precision, Tactical Versatility & Winning DNA',
        prestigeHonors: '36x Serie A Scudetti, 15x Coppa Italia, 2x European Champions',
        managerQuote: '"Fino Alla Fine. Juventus exists solely to win trophies. We want you to be the crown jewel of our attack."',
        firstDayNarrative: {
          stadiumArrival:
            'A private jet delivers you to Turin. Flanked by club icons in the trophy room, you sign your contract beneath 36 Italian championship trophies.',
          pressConferenceQuote:
            '"Juventus is royalty. We only recruit players who can bear the weight of black-and-white greatness."',
          fanReaction:
            'Gazzetta dello Sport: "JUVENTUS SCOOPS GENERATIONAL JEWEL: The new era of Turin dominance begins!"',
        },
      },
      {
        id: 'hot_benfica',
        clubName: 'SL Benfica',
        shortName: 'Benfica',
        badgeBg: 'from-red-700 via-rose-900 to-amber-400',
        countryName: 'Portugal',
        leagueName: 'Primeira Liga',
        stadiumName: 'Estádio da Luz (Lisbon)',
        managerName: 'Bruno Lage',
        primaryAdvantage: 'Release clause',
        advantageHighlight: 'Stepping-Stone Strategic Buyout Clause (€85M) & Premier Continental Showcase',
        weeklyWage: 95000,
        yearlySalary: 95000 * 52,
        signingBonus: 3000000,
        contractYears: 4,
        releaseClause: 85000000,
        startingRole: 'Marquee Attacking Lead',
        roleDescription: 'Complete freedom to express your football in the Champions League spotlight.',
        developmentPoints: 265,
        developmentPhilosophy: 'World-Renowned Caixa Futebol Campus Technical Mastery',
        prestigeHonors: '38x Portuguese Championships, 2x European Cup Champions',
        managerQuote: '"Estádio da Luz is the finest stage on earth for young artists. We will turn your talent into a legend."',
        firstDayNarrative: {
          stadiumArrival:
            'Beneath the majestic flight of the club eagle Vitória at Estádio da Luz, club legends welcome you into the cathedral of Portuguese football.',
          pressConferenceQuote:
            '"Benfica gives young talent the entire world. Here, you will shine across Europe with zero fear."',
          fanReaction:
            'A Bola & Record: "O NOVO REI DA LUZ: Benfica lands the continent’s most sought-after wunderkind!"',
        },
      },
      {
        id: 'hot_dortmund',
        clubName: 'Borussia Dortmund',
        shortName: 'Dortmund',
        badgeBg: 'from-yellow-400 via-amber-500 to-slate-950',
        countryName: 'Germany',
        leagueName: 'Bundesliga',
        stadiumName: 'Signal Iduna Park (Westfalenstadion)',
        managerName: 'Nuri Şahin',
        primaryAdvantage: 'Development',
        advantageHighlight: 'Global #1 Prodigy Development Engine (+260 Pts/Yr) & 81,000 Yellow Wall Passion',
        weeklyWage: 125000,
        yearlySalary: 125000 * 52,
        signingBonus: 3800000,
        contractYears: 5,
        releaseClause: 95000000,
        startingRole: 'Key Starter & Offensive Leader',
        roleDescription: 'Heavy regular minutes in the Bundesliga and UEFA Champions League.',
        developmentPoints: 260,
        developmentPhilosophy: 'Echte Liebe High-Velocity Youth Incubation & Vertical Mastery',
        prestigeHonors: '8x German Championships, 1997 UEFA Champions League Winners',
        managerQuote: '"Signal Iduna Park was built for players who thrill. 81,000 fans in the Yellow Wall will roar for you."',
        firstDayNarrative: {
          stadiumArrival:
            'Walking out of the tunnel into the imposing Yellow Wall at Signal Iduna Park, club executives hand you the black-and-yellow shirt amidst flashes from international journalists.',
          pressConferenceQuote:
            '"Dortmund is where great talent becomes immortal. We give our young masters the keys to the pitch."',
          fanReaction:
            'Kicker Sportmagazin: "GELBE WAND JUBELT: Dortmund beats the world to generational prodigy!"',
        },
      },
      {
        id: 'hot_monaco',
        clubName: 'AS Monaco',
        shortName: 'Monaco',
        badgeBg: 'from-red-600 via-rose-700 to-slate-900',
        countryName: 'France',
        leagueName: 'Ligue 1',
        stadiumName: 'Stade Louis-II (Fontvieille)',
        managerName: 'Adi Hütter',
        primaryAdvantage: 'Starting role',
        advantageHighlight: 'Guaranteed Immediate Key Starter Status & Principality Luxury Tax-Free Package',
        weeklyWage: 145000,
        yearlySalary: 145000 * 52,
        signingBonus: 3900000,
        contractYears: 4,
        releaseClause: 90000000,
        startingRole: 'Undisputed Starting Star',
        roleDescription: 'Immediate first-name on the team sheet contesting Ligue 1 and European competitions.',
        developmentPoints: 240,
        developmentPhilosophy: 'French Riviera Technical Polish & Explosive Transition Football',
        prestigeHonors: '8x Ligue 1 Titles, 5x Coupe de France, UEFA Champions League Semifinalists',
        managerQuote: '"In Monaco, you get elite European football with the absolute freedom to lead our squad."',
        firstDayNarrative: {
          stadiumArrival:
            'Overlooking the Mediterranean yacht harbor in Monaco, you complete your medical and sign your deal at the Prince’s Palace-backed training center.',
          pressConferenceQuote:
            '"Monaco is an incubator of world champions. Today, the next global superstar joins the Principality."',
          fanReaction:
            'L’Équipe: "LE COEUR DU ROCHER: Monaco signs generational dynamo to orchestrate Ligue 1 title charge!"',
        },
      },
      {
        id: 'hot_lille',
        clubName: 'LOSC Lille',
        shortName: 'Lille',
        badgeBg: 'from-red-600 via-red-800 to-blue-950',
        countryName: 'France',
        leagueName: 'Ligue 1',
        stadiumName: 'Decathlon Arena Stade Pierre-Mauroy (Lille)',
        managerName: 'Bruno Génésio',
        primaryAdvantage: 'Development',
        advantageHighlight: 'Top-Tier French Talent Incubator (+255 Pts/Yr) & Proven Global Supercarrier',
        weeklyWage: 110000,
        yearlySalary: 110000 * 52,
        signingBonus: 3200000,
        contractYears: 5,
        releaseClause: 80000000,
        startingRole: 'Marquee Attacking Lead',
        roleDescription: 'Immediate starting keys to the Lille offensive engine competing in Ligue 1 and Europe.',
        developmentPoints: 255,
        developmentPhilosophy: 'Domaine de Luchin Elite Academy Polish & Direct High-Pace Transition Football',
        prestigeHonors: '4x Ligue 1 Champions, 6x Coupe de France, 2021 Trophée des Champions Winners',
        managerQuote: '"Lille launched Hazard, Osimhen, and Leão. Here, you get immediate responsibility and the tactical freedom to explode."',
        firstDayNarrative: {
          stadiumArrival:
            'Under the retractable roof of the modern Stade Pierre-Mauroy, the Dogues unveil you before thousands of passionate northern French supporters.',
          pressConferenceQuote:
            '"Lille develops winners. We do not wait on world-class potential; we unleash it immediately onto the pitch."',
          fanReaction:
            'La Voix du Nord: "LE PRODIGE DU NORD: Lille wins international tug-of-war for wonderkid!"',
        },
      },
      {
        id: 'hot_inter',
        clubName: 'Inter Milan',
        shortName: 'Inter',
        badgeBg: 'from-blue-600 via-blue-900 to-slate-950',
        countryName: 'Italy',
        leagueName: 'Serie A',
        stadiumName: 'San Siro (Stadio Giuseppe Meazza)',
        managerName: 'Simone Inzaghi',
        primaryAdvantage: 'Prestige',
        advantageHighlight: 'Reigning Scudetto Champions & 20-Time Italian Champions (Second Star Royalty)',
        weeklyWage: 165000,
        yearlySalary: 165000 * 52,
        signingBonus: 4400000,
        contractYears: 5,
        releaseClause: 125000000,
        startingRole: 'Marquee Starting Talisman',
        roleDescription: 'Pivotal catalyst in Inzaghi’s devastating 3-5-2 system dominating Italian and European football.',
        developmentPoints: 245,
        developmentPhilosophy: 'Nerazzurri Tactical Fluidity, Ruthless Efficiency & Champions League Mastery',
        prestigeHonors: '20x Serie A Scudetti (Second Star), 3x UEFA Champions League, 9x Coppa Italia',
        managerQuote: '"Inter represents glory and historic passion. Put on the black-and-blue stripes and cement your name in San Siro lore."',
        firstDayNarrative: {
          stadiumArrival:
            'Arriving at the BPER Training Centre in Appiano Gentile, club president Beppe Marotta and Javier Zanetti personally welcome you with the famous shirt.',
          pressConferenceQuote:
            '"Inter only targets difference-makers. This player has the courage to wear our second star."',
          fanReaction:
            'La Gazzetta dello Sport: "NERAZZURRO DA SOGNO: Inter signs generational maestro to ignite the San Siro!"',
        },
      },
      {
        id: 'hot_milan',
        clubName: 'AC Milan',
        shortName: 'AC Milan',
        badgeBg: 'from-red-600 via-rose-900 to-neutral-950',
        countryName: 'Italy',
        leagueName: 'Serie A',
        stadiumName: 'San Siro (Stadio Giuseppe Meazza)',
        managerName: 'Paulo Fonseca',
        primaryAdvantage: 'Prestige',
        advantageHighlight: '7x UEFA Champions League Aristocracy & Iconic Milanello Heritage',
        weeklyWage: 155000,
        yearlySalary: 155000 * 52,
        signingBonus: 4100000,
        contractYears: 5,
        releaseClause: 120000000,
        startingRole: 'Key Attacking Conductor',
        roleDescription: 'Centerpiece of the Rossoneri tactical project hunting European and domestic silverware.',
        developmentPoints: 240,
        developmentPhilosophy: 'Milanello Laboratory Precision, Aesthetic Flair & European Aristocracy',
        prestigeHonors: '7x UEFA Champions League Champions, 19x Serie A Scudetti, 5x UEFA Super Cups',
        managerQuote: '"Milan is the home of legends. From Maldini to Kaká, this shirt demands greatness. You were born for this stage."',
        firstDayNarrative: {
          stadiumArrival:
            'At Casa Milan, you walk past the gleaming room of seven European Cups before holding up the Rossoneri shirt alongside Zlatan Ibrahimović.',
          pressConferenceQuote:
            '"AC Milan doesn’t buy hype; we create icons. Today, our newest superstar enters the San Siro."',
          fanReaction:
            'Corriere dello Sport: "MILAN COLPACCIO: The Rossoneri secure world football\'s hottest teenage jewel!"',
        },
      },
      {
        id: 'hot_porto',
        clubName: 'FC Porto',
        shortName: 'Porto',
        badgeBg: 'from-blue-700 via-blue-950 to-amber-400',
        countryName: 'Portugal',
        leagueName: 'Primeira Liga',
        stadiumName: 'Estádio do Dragão (Porto)',
        managerName: 'Vítor Bruno',
        primaryAdvantage: 'Release clause',
        advantageHighlight: 'Strategic Stepping-Stone Release Clause (€80M) & Fierce Dragons Competitive Grit',
        weeklyWage: 95000,
        yearlySalary: 95000 * 52,
        signingBonus: 3100000,
        contractYears: 4,
        releaseClause: 80000000,
        startingRole: 'Primary Offensive Starter',
        roleDescription: 'Unrestricted creative license spearheading the Dragões title assault and Champions League clashes.',
        developmentPoints: 260,
        developmentPhilosophy: 'Raça Dragão (Dragon Spirit), High-Intensity Pressing & South American-European Fusion',
        prestigeHonors: '30x Portuguese Champions, 2x UEFA Champions League Champions, 2x UEFA Europa League',
        managerQuote: '"At Porto, we forge fighters who play beautiful, devastating football. The Dragão will be your kingdom."',
        firstDayNarrative: {
          stadiumArrival:
            'Inside the roaring Estádio do Dragão, club directors unveil you flanked by blue smoke and the iconic dragon symbol.',
          pressConferenceQuote:
            '"Porto has turned countless South American stars into European champions. You are our next masterpiece."',
          fanReaction:
            'O Jogo: "RAÇA E MAGIA: Porto signs brilliant phenom in blockbuster deal!"',
        },
      },
      {
        id: 'hot_leipzig',
        clubName: 'RB Leipzig',
        shortName: 'RB Leipzig',
        badgeBg: 'from-red-600 via-slate-800 to-amber-300',
        countryName: 'Germany',
        leagueName: 'Bundesliga',
        stadiumName: 'Red Bull Arena (Leipzig)',
        managerName: 'Marco Rose',
        primaryAdvantage: 'Development',
        advantageHighlight: 'State-of-the-Art Red Bull Performance Academy (+265 Pts/Yr) & Relentless Vertical Gegenpressing',
        weeklyWage: 130000,
        yearlySalary: 130000 * 52,
        signingBonus: 3700000,
        contractYears: 5,
        releaseClause: 95000000,
        startingRole: 'Vital High-Press Engine',
        roleDescription: 'Dynamic starter executing lightning counter-attacks in the Bundesliga and Champions League.',
        developmentPoints: 265,
        developmentPhilosophy: 'Hyper-Fast Transition Science, Biometric Optimization & Elite Youth Acceleration',
        prestigeHonors: '2x DFB-Pokal Champions, 1x DFL-Supercup, UEFA Champions League Semifinalists',
        managerQuote: '"We play the fastest, most aggressive tactical football in modern Europe. Our science and data will elevate your ceiling higher than anyone else can."',
        firstDayNarrative: {
          stadiumArrival:
            'Touring the multi-million euro Red Bull Academy at Cottaweg, high-performance coaches present you with custom biometric metrics and your #7 shirt.',
          pressConferenceQuote:
            '"Leipzig provides the ultimate platform for generational athletes. We know how to take world-class talent to the absolute peak."',
          fanReaction:
            'Leipziger Volkszeitung: "TURBO-TRANSFER: RB Leipzig secures international wonderkid in coup of the summer!"',
        },
      },
      {
        id: 'hot_como',
        clubName: 'Como 1907',
        shortName: 'Como',
        badgeBg: 'from-sky-700 via-blue-900 to-slate-900',
        countryName: 'Italy',
        leagueName: 'Serie A',
        stadiumName: 'Stadio Giuseppe Sinigaglia (Lake Como)',
        managerName: 'Cesc Fàbregas',
        primaryAdvantage: 'Starting role',
        advantageHighlight: 'Guaranteed Immediate Undisputed Starting Protagonist & Cesc Fàbregas Masterclass Mentorship',
        weeklyWage: 120000,
        yearlySalary: 120000 * 52,
        signingBonus: 3400000,
        contractYears: 4,
        releaseClause: 70000000,
        startingRole: 'Undisputed Franchise Protagonist',
        roleDescription: 'Given complete central keys to Fàbregas’s ambitious, possession-heavy Serie A revolution on Lake Como.',
        developmentPoints: 250,
        developmentPhilosophy: 'Elite Spanish Possession DNA, Modern Technical Courage & Lakefront Ambition',
        prestigeHonors: 'Serie A Rising Phenomenon, International Investment Project backed by World Champions',
        managerQuote: '"I came through Barcelona and Arsenal as a teenager. I know exactly what a prodigy needs: absolute trust on the ball and the freedom to dictate the game. That is my promise to you."',
        firstDayNarrative: {
          stadiumArrival:
            'Stepping off a private wooden speedboat right at the lakefront dock of Stadio Giuseppe Sinigaglia, Cesc Fàbregas personally welcomes you with the Italian press looking on.',
          pressConferenceQuote:
            '"At Como, we are creating a unique, fearless project. This player has the vision and technique to make world football look at Lake Como."',
          fanReaction:
            'Sky Sport Italia: "LA RIVOLUZIONE DI COMO: Fàbregas convinces top global prospect to become the face of Lake Como!"',
        },
      },
      {
        id: 'hot_napoli',
        clubName: 'SSC Napoli',
        shortName: 'Napoli',
        badgeBg: 'from-sky-500 via-blue-700 to-slate-950',
        countryName: 'Italy',
        leagueName: 'Serie A',
        stadiumName: 'Stadio Diego Armando Maradona',
        managerName: 'Antonio Conte',
        primaryAdvantage: 'Salary',
        advantageHighlight: 'Lucrative Italian Salary Package (€150k/wk) & Eternal Neapolitan Religious Passion',
        weeklyWage: 150000,
        yearlySalary: 150000 * 52,
        signingBonus: 4000000,
        contractYears: 5,
        releaseClause: 115000000,
        startingRole: 'Crucial Senior Starter',
        roleDescription: 'Focal creative and physical force driving Antonio Conte’s relentless Scudetto charge.',
        developmentPoints: 245,
        developmentPhilosophy: 'Conte High-Octane Work Ethic & Passionate Neapolitan Creative Freedom',
        prestigeHonors: '3x Serie A Scudetti, 6x Coppa Italia, 1x UEFA Cup (Maradona Era)',
        managerQuote: '"In Naples, football is religion. If you sweat for this city and fight for every ball, the fans at the Maradona will revere you like a deity."',
        firstDayNarrative: {
          stadiumArrival:
            'Flashing blue smoke fills the streets of Fuorigrotta as you drive into the Stadio Diego Armando Maradona. Thousands of Neapolitan supporters chant your name outside.',
          pressConferenceQuote:
            '"Napoli has a storied history with South American and world geniuses. This young man possesses that special spark."',
          fanReaction:
            'Il Mattino: "L\'EREDE DEL MARADONA: Napoli explodes with joy as Conte secures generational superstar!"',
        },
      },
      {
        id: 'hot_betis',
        clubName: 'Real Betis Balompié',
        shortName: 'Real Betis',
        badgeBg: 'from-emerald-600 via-green-800 to-amber-400',
        countryName: 'Spain',
        leagueName: 'La Liga',
        stadiumName: 'Estadio Benito Villamarín (Seville)',
        managerName: 'Manuel Pellegrini',
        primaryAdvantage: 'Starting role',
        advantageHighlight: 'Unquestioned Starting Playmaker Role & 60,000 Fanatical Béticos Singing \'Viva el Betis\'',
        weeklyWage: 115000,
        yearlySalary: 115000 * 52,
        signingBonus: 3300000,
        contractYears: 4,
        releaseClause: 75000000,
        startingRole: 'Star Attacking Conductor',
        roleDescription: 'Total creative leadership in Pellegrini\'s free-flowing attacking brand in La Liga and Europe.',
        developmentPoints: 245,
        developmentPhilosophy: 'El Ingeniero Technical Football, Joyful Seville Flair & Unconditional Fan Loyalty',
        prestigeHonors: '1x La Liga Champions, 3x Copa del Rey Champions, Constant European Contenders',
        managerQuote: '"El Villamarín breathes joy and technical courage. With us, you will enjoy football every single weekend with 60,000 fans behind you."',
        firstDayNarrative: {
          stadiumArrival:
            'Under the warm Andalusian sun at Benito Villamarín, green-and-white flags wave as club legend Joaquín and Manuel Pellegrini hand you the Betis jersey.',
          pressConferenceQuote:
            '"Betis is pure passion. We signed a player who understands the poetry of football and isn\'t afraid to attack."',
          fanReaction:
            'Estadio Deportivo: "LOCURA VERDIBLANCA: Betis seals dream transfer for international prodigy!"',
        },
      },
      {
        id: 'hot_sevilla',
        clubName: 'Sevilla FC',
        shortName: 'Sevilla',
        badgeBg: 'from-red-600 via-rose-800 to-slate-900',
        countryName: 'Spain',
        leagueName: 'La Liga',
        stadiumName: 'Estadio Ramón Sánchez-Pizjuán',
        managerName: 'García Pimienta',
        primaryAdvantage: 'Prestige',
        advantageHighlight: '7x UEFA Europa League Kings & Ramón Sánchez-Pizjuán European Mystique',
        weeklyWage: 120000,
        yearlySalary: 120000 * 52,
        signingBonus: 3500000,
        contractYears: 4,
        releaseClause: 80000000,
        startingRole: 'Integral Senior Starter',
        roleDescription: 'Direct first-choice starter leading Sevilla\'s resurgence in La Liga and European knockouts.',
        developmentPoints: 240,
        developmentPhilosophy: 'Casta y Coraje (Courage and Heart), Intense Andalusian Pressure & Positional Football',
        prestigeHonors: '7x UEFA Europa League Champions (Record Holders), 1x La Liga, 5x Copa del Rey',
        managerQuote: '"Here at the Sánchez-Pizjuán, magical European nights are born. We play with \'Casta y Coraje\'. You have the heart to conquer Seville."',
        firstDayNarrative: {
          stadiumArrival:
            'Standing beneath the famous mosaic of the Ramón Sánchez-Pizjuán, club officials present you with the white-and-red shirt as the club anthem blasts through the stadium.',
          pressConferenceQuote:
            '"Sevilla never surrenders. Today we add a footballer capable of changing any game on the continent."',
          fanReaction:
            'Diario de Sevilla: "CASTA Y CORAJE: Sevilla FC beats continental giants to signature of young virtuoso!"',
        },
      },
      {
        id: 'hot_villarreal',
        clubName: 'Villarreal CF',
        shortName: 'Villarreal',
        badgeBg: 'from-yellow-400 via-amber-500 to-blue-900',
        countryName: 'Spain',
        leagueName: 'La Liga',
        stadiumName: 'Estadio de la Cerámica',
        managerName: 'Marcelino García Toral',
        primaryAdvantage: 'Development',
        advantageHighlight: 'World-Renowned Ciudad Deportiva Miralcamp (+250 Pts/Yr) & Yellow Submarine European Pedigree',
        weeklyWage: 118000,
        yearlySalary: 118000 * 52,
        signingBonus: 3300000,
        contractYears: 5,
        releaseClause: 85000000,
        startingRole: 'Key Starting Forward/Midfielder',
        roleDescription: 'Starting linchpin in Marcelino\'s lethal structured counter-attacking system.',
        developmentPoints: 250,
        developmentPhilosophy: 'Yellow Submarine Technical Precision, Miralcamp Academy Excellence & Tactically Disciplined Freedom',
        prestigeHonors: '2021 UEFA Europa League Champions, UEFA Champions League Semifinalists (2006, 2022)',
        managerQuote: '"Villarreal has shown the entire world that a focused club with elite training can defeat giants like Bayern and United. Here, your development is sacred."',
        firstDayNarrative: {
          stadiumArrival:
            'At the modern Estadio de la Cerámica, club president Fernando Roig gives you a personal tour of the yellow fortress before the official photo call.',
          pressConferenceQuote:
            '"We don\'t sign players just for a season; we build careers. This is one of the most exciting signings in Villarreal\'s history."',
          fanReaction:
            'El Periódico Mediterráneo: "EL SUBMARINO BOMBARDEA: Villarreal signs extraordinary prospect to lead La Liga campaign!"',
        },
      },
      {
        id: 'hot_sporting',
        clubName: 'Sporting CP',
        shortName: 'Sporting CP',
        badgeBg: 'from-emerald-700 via-green-900 to-amber-400',
        countryName: 'Portugal',
        leagueName: 'Primeira Liga',
        stadiumName: 'Estádio José Alvalade (Lisbon)',
        managerName: 'João Pereira',
        primaryAdvantage: 'Development',
        advantageHighlight: 'Academy of Cristiano Ronaldo & Figo (+260 Pts/Yr) & Reigning Portuguese Champions',
        weeklyWage: 100000,
        yearlySalary: 100000 * 52,
        signingBonus: 3100000,
        contractYears: 5,
        releaseClause: 85000000,
        startingRole: 'Marquee Starting Talisman',
        roleDescription: 'Complete tactical freedom leading Sporting\'s title defense and Champions League campaign.',
        developmentPoints: 260,
        developmentPhilosophy: 'Academia Cristiano Ronaldo Technical Wizardry, Dynamic 3-4-3 Fluency & Youth Fearlessness',
        prestigeHonors: '20x Portuguese League Champions, 17x Taça de Portugal, European Cup Winners\' Cup Champions',
        managerQuote: '"Our academy produced Cristiano Ronaldo, Luís Figo, and Nani. Sporting is where legends take flight. Estádio José Alvalade will adore you."',
        firstDayNarrative: {
          stadiumArrival:
            'Inside the green-and-white sanctuary of Estádio José Alvalade, club president Frederico Varandas hands you the green-and-white hoops in front of the club museum.',
          pressConferenceQuote:
            '"Sporting creates kings of football. Today we welcome a talent who embodies our motto: Effort, Dedication, Devotion, and Glory."',
          fanReaction:
            'A Bola: "O NOVO LEÃO DE ALVALADE: Sporting secures generational talent to defend the throne!"',
        },
      },
    ];

    // Argentine Giants (Included if you start in Argentina)
    const bocaPitch: HotProspectClubPitch = {
      id: 'hot_boca_juniors',
      clubName: 'CA Boca Juniors',
      shortName: 'Boca Juniors',
      badgeBg: 'from-blue-700 via-blue-900 to-yellow-400',
      countryName: 'Argentina',
      leagueName: 'Liga Profesional de Fútbol',
      stadiumName: 'Estadio Alberto J. Armando (La Bombonera)',
      managerName: 'Fernando Gago',
      primaryAdvantage: 'Prestige',
      advantageHighlight: 'La Bombonera Tembla • The Greatest Mystique in South America & El Jugador Número 12',
      weeklyWage: 92000,
      yearlySalary: 92000 * 52,
      signingBonus: 2700000,
      contractYears: 4,
      releaseClause: 65000000,
      startingRole: 'Marquee Boca Talisman Starter',
      roleDescription: 'Directly handed the iconic #10 shirt to conduct Boca Juniors in the Copa Libertadores and Superclásico.',
      developmentPoints: 235,
      developmentPhilosophy: 'Mística Xeneize, Garra Bostera & Fearless Argentine Street Creativity (Potrero)',
      prestigeHonors: '6x Copa Libertadores, 3x Intercontinental Cup Champions (defeating Real Madrid & Milan), 35x Argentine League',
      managerQuote: '"La Bombonera doesn\'t tremble; its heart beats. Wearing the blue and gold is the ultimate dream of every Argentine boy. You will be a god here."',
      firstDayNarrative: {
        stadiumArrival:
          'Stepping out of the tunnel onto the shaking pitch of La Bombonera as 54,000 Xeneizes chant in unison, Juan Román Riquelme personally hugs you and hands you the Boca shirt.',
        pressConferenceQuote:
          '"Boca is the biggest club in the world in feeling. This young man plays with the courage and magic required in La Boca."',
        fanReaction:
          'Diario Olé: "¡BOMBAZO EN LA BOCA! Xeneize secures generational potrero prodigy for Copa Libertadores title quest!"',
      },
    };

    const riverPitch: HotProspectClubPitch = {
      id: 'hot_river_plate',
      clubName: 'CA River Plate',
      shortName: 'River Plate',
      badgeBg: 'from-neutral-100 via-red-600 to-slate-900',
      countryName: 'Argentina',
      leagueName: 'Liga Profesional de Fútbol',
      stadiumName: 'Estadio Mâs Monumental (Buenos Aires)',
      managerName: 'Marcelo Gallardo',
      primaryAdvantage: 'Prestige',
      advantageHighlight: 'El Más Grande • 84,500 Fans at the Monumental & Marcelo Gallardo Elite Championship Culture',
      weeklyWage: 95000,
      yearlySalary: 95000 * 52,
      signingBonus: 2800000,
      contractYears: 4,
      releaseClause: 70000000,
      startingRole: 'Marquee Millonario Playmaker',
      roleDescription: 'Focal creative brain in Marcelo Gallardo\'s high-pressing, aesthetic football aiming for continental glory.',
      developmentPoints: 240,
      developmentPhilosophy: 'Paladar Negro Elegance, Gallardo Relentless Pressure & World-Renowned River Academy Heritage',
      prestigeHonors: '4x Copa Libertadores Champions (including Madrid 2018), 38x Argentine League Titles, 1x Intercontinental Cup',
      managerQuote: '"At River, victory is not enough; we must win with elegance, courage, and relentless hunger. You have the exact talent to lead our team."',
      firstDayNarrative: {
        stadiumArrival:
          'Before 84,500 roaring Millonarios at the magnificent Estadio Mâs Monumental, Marcelo Gallardo presents you with the famous red-sash white jersey amidst red smoke and fireworks.',
        pressConferenceQuote:
          '"River Plate demands absolute footballing excellence. This player possesses the paladar negro and fire to make history here."',
        fanReaction:
          'TyC Sports & Olé: "EL NUEVO PRÍNCIPE MONUMENTAL: River Plate signs dream wunderkind to lead Gallardo\'s dream project!"',
      },
    };

    // Brazilian Giants (Included if starting in Brazil)
    const flamengoPitch: HotProspectClubPitch = {
      id: 'hot_flamengo',
      clubName: 'CR Flamengo',
      shortName: 'Flamengo',
      badgeBg: 'from-red-900 via-rose-950 to-neutral-950',
      countryName: 'Brazil',
      leagueName: 'Brasileirão Série A',
      stadiumName: 'Estádio do Maracanã (Rio de Janeiro)',
      managerName: 'Filipe Luís',
      primaryAdvantage: 'Prestige',
      advantageHighlight: '45 Million Nação Rubro-Negra & Iconic Maracanã Talisman Status',
      weeklyWage: 95000,
      yearlySalary: 95000 * 52,
      signingBonus: 2800000,
      contractYears: 4,
      releaseClause: 70000000,
      startingRole: 'Marquee Talisman Starter',
      roleDescription: 'Central idol of Brazilian football commanding the attack in Copa Libertadores.',
      developmentPoints: 225,
      developmentPhilosophy: 'Ninho do Urubu Magic & Jogo Bonito Domination',
      prestigeHonors: '3x Copa Libertadores Champions, 8x Brasileirão, 1x Intercontinental Cup',
      managerQuote: '"To wear the Manto Sagrado at the Maracanã in front of 80,000 screaming fans is unlike anything in world football."',
      firstDayNarrative: {
        stadiumArrival:
          'A crowd of thousands of Flamengo supporters gathers outside Gávea and the Maracanã, setting off red-and-black flares as you hold up the legendary #10 jersey.',
        pressConferenceQuote:
          '"Playing for Flamengo is being part of a nation. Today we welcome a true footballing magician."',
        fanReaction:
          'Globo Esporte: "O MANTO TEM NOVO DONO: Maracanã in ecstasy as Flamengo signs prodigy!"',
      },
    };

    const corinthiansPitch: HotProspectClubPitch = {
      id: 'hot_corinthians',
      clubName: 'SC Corinthians Paulista',
      shortName: 'Corinthians',
      badgeBg: 'from-neutral-900 via-slate-800 to-neutral-950',
      countryName: 'Brazil',
      leagueName: 'Brasileirão Série A',
      stadiumName: 'Neo Química Arena (São Paulo)',
      managerName: 'Ramón Díaz',
      primaryAdvantage: 'Contract length',
      advantageHighlight: 'Fiel Torcida Unconditional Devotion & Optimal 4-Year European Gateway Deal',
      weeklyWage: 88000,
      yearlySalary: 88000 * 52,
      signingBonus: 2600000,
      contractYears: 4,
      releaseClause: 65000000,
      startingRole: 'Key Playmaking Starter',
      roleDescription: 'Commanding the midfield/attack with the backing of 35 million fanatical supporters.',
      developmentPoints: 220,
      developmentPhilosophy: 'Garra do Terrão & Relentless Competitive Spirit',
      prestigeHonors: '2x FIFA Club World Cup Champions, 1x Copa Libertadores, 7x Brasileirão',
      managerQuote: '"Aqui é Corinthians! You have the hunger, the spine, and the brilliance to become a god in São Paulo."',
      firstDayNarrative: {
        stadiumArrival:
          'The deafening drums of the Gaviões da Fiel echo outside the Neo Química Arena. Club directors unveil you in front of a battery of South American cameras.',
        pressConferenceQuote:
          '"Corinthians is passion and struggle. You will feel the heartbeat of 35 million supporters every minute on the pitch."',
        fanReaction:
          'Lance! & Gazeta Esportiva: "A FIEL ENLOUQUECE: Timão secures generational talent with massive buyout clause!"',
      },
    };

    const palmeirasPitch: HotProspectClubPitch = {
      id: 'hot_palmeiras',
      clubName: 'SE Palmeiras',
      shortName: 'Palmeiras',
      badgeBg: 'from-emerald-800 via-green-900 to-slate-950',
      countryName: 'Brazil',
      leagueName: 'Brasileirão Série A',
      stadiumName: 'Allianz Parque (São Paulo)',
      managerName: 'Abel Ferreira',
      primaryAdvantage: 'Development',
      advantageHighlight: 'Modern South American Serial Winner & State-of-the-Art Academia de Futebol',
      weeklyWage: 98000,
      yearlySalary: 98000 * 52,
      signingBonus: 2900000,
      contractYears: 4,
      releaseClause: 75000000,
      startingRole: 'Primary Senior Weapon',
      roleDescription: 'Integral starting asset in Abel Ferreira’s ruthlessly organized championship machine.',
      developmentPoints: 235,
      developmentPhilosophy: 'Academia de Futebol Tactical Discipline & Relentless Winning Mentality',
      prestigeHonors: '3x Copa Libertadores Champions, 12x Brasileirão (Record Brazilian Champions)',
      managerQuote: '"We have the best sporting infrastructure and competitive discipline in the Americas. We will win everything together."',
      firstDayNarrative: {
        stadiumArrival:
          'Inside the modern Allianz Parque, head coach Abel Ferreira personally welcomes you to the tactical center before handing you your green-and-white shirt.',
        pressConferenceQuote:
          '"We don’t settle for being good; we want to dominate South America and compete globally. This player is ready."',
        fanReaction:
          'UOL Esporte: "MAIOR CAMPEÃO DO BRASIL: Palmeiras beats European rivals to secure prodigy signing!"',
      },
    };

    const isStartedInArgentina = isPlayerStartedInArgentina(player);
    const isStartedInBrazil = isPlayerStartedInBrazil(player) || (isSouthAmericanYouth && !isStartedInArgentina);

    if (isStartedInArgentina) {
      // Guarantee at least 1 Argentine giant (Boca or River), with a high chance of both (Superclásico choice!)
      const argClubs = [bocaPitch, riverPitch].sort(() => 0.5 - Math.random());
      const euroClubs = [...basePitches].sort(() => 0.5 - Math.random());

      const selected: HotProspectClubPitch[] = [argClubs[0]];
      if (Math.random() < 0.5) {
        selected.push(argClubs[1]);
        selected.push(euroClubs[0]);
      } else {
        selected.push(euroClubs[0]);
        selected.push(euroClubs[1]);
      }
      return selected.sort(() => 0.5 - Math.random());
    }

    if (isStartedInBrazil) {
      const brClubs = [flamengoPitch, corinthiansPitch, palmeirasPitch].sort(() => 0.5 - Math.random());
      const euroClubs = [...basePitches].sort(() => 0.5 - Math.random());
      const selected: HotProspectClubPitch[] = [brClubs[0], euroClubs[0], euroClubs[1]];
      return selected.sort(() => 0.5 - Math.random());
    }

    // Default European or International: Randomly select EXACTLY 3 from the 16 European elite suitors
    const shuffled = [...basePitches].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [player, manager, isSouthAmericanYouth]);

  if (!isOpen || eligiblePitches.length === 0) return null;

  const currentPitch = eligiblePitches[selectedClubIndex] || eligiblePitches[0];

  const handleSelectClub = (index: number) => {
    setSelectedClubIndex(index);
    setStage('first_day');
    triggerConfetti();
  };

  const handleFinalizeSigning = () => {
    onCompleteTransfer(currentPitch);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn font-pixel select-none">
      <div className="bg-slate-900 border-2 border-amber-500 pixel-corners pixel-bevel-gold shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-auto relative text-white">
        {/* Glow Header Banner */}
        <div className="relative bg-amber-950/60 p-4 sm:p-5 border-b-2 border-amber-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 pixel-corners bg-amber-500/20 border-2 border-amber-400/50 pixel-bevel-raised flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Crown className="w-5 h-5 text-amber-300 fill-amber-400/20" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5 font-arcade">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  ELITE PRODIGY INTEREST • SECTION 8 HOT PROSPECT
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight pixel-text-shadow">
                  Hot Prospect: Continental Elite Summit
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 pixel-corners bg-slate-800 border-2 border-slate-700 pixel-bevel-raised transition"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-amber-200/90 mt-2 max-w-2xl leading-relaxed font-retro">
            With <strong className="text-white font-arcade">{ovr} OVR</strong> and <strong className="text-white font-arcade">{effectiveFame} Effective Fame</strong>, you have reached
            world-class wunderkind status. 3 premier football institutions have arrived at your table, each pitching a
            distinct competitive advantage to win your signature.
          </p>
        </div>

        {/* STEP 1: REVIEW THE 3 CLUBS AND THEIR ADVANTAGES */}
        {stage === 'selection' && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Choose Your Next Football Institution (Select 1 of 3)
              </h3>
              <span className="text-[10px] text-amber-400 font-retro">Each club offers a distinct advantage</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {eligiblePitches.map((pitch, idx) => (
                <div
                  key={pitch.id}
                  className="bg-slate-950 border-2 border-slate-700 hover:border-amber-400 pixel-corners pixel-bevel-sunken hover:pixel-bevel-gold p-3.5 sm:p-4 flex flex-col justify-between space-y-3 transition-all relative overflow-hidden group"
                >
                  <div className="space-y-2.5">
                    {/* Club Crest & Title */}
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-10 h-10 pixel-corners bg-gradient-to-br ${pitch.badgeBg} flex items-center justify-center font-black text-white text-sm shadow-md border-2 border-white/20 pixel-bevel-raised font-arcade`}
                      >
                        {pitch.shortName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm leading-snug group-hover:text-amber-300 transition pixel-text-shadow">
                          {pitch.clubName}
                        </h4>
                        <div className="text-[9px] text-slate-400 font-retro">
                          {pitch.leagueName} • {pitch.countryName}
                        </div>
                      </div>
                    </div>

                    {/* Primary Advantage Badge */}
                    <div className="p-2 pixel-corners bg-amber-950/70 border border-amber-500/40 text-xs space-y-0.5">
                      <div className="flex items-center gap-1 text-amber-300 font-black uppercase tracking-wider text-[9px] font-arcade">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ADVANTAGE: {pitch.primaryAdvantage.toUpperCase()}
                      </div>
                      <p className="text-[10px] text-amber-200 font-retro leading-tight">
                        {pitch.advantageHighlight}
                      </p>
                    </div>

                    {/* The Key Factors Breakdown */}
                    <div className="p-2.5 pixel-corners bg-slate-900 border border-slate-700/60 text-[11px] space-y-1 font-retro">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Weekly Wage:</span>
                        <strong className="text-emerald-400 font-arcade">€{pitch.weeklyWage.toLocaleString()}/wk</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Starting Role:</span>
                        <strong className="text-white">{pitch.startingRole}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contract Length:</span>
                        <strong className="text-sky-400 font-arcade">{pitch.contractYears} Yrs</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Release Clause:</span>
                        <strong className="text-rose-400 font-arcade">€{(pitch.releaseClause / 1000000).toFixed(0)}M</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Development:</span>
                        <strong className="text-purple-400 font-arcade">+{pitch.developmentPoints} Pts/Yr</strong>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 italic leading-relaxed border-t border-slate-800 pt-1.5 font-retro">
                      {pitch.managerQuote}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectClub(idx)}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider pixel-corners border-2 border-amber-200 pixel-bevel-gold shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer font-pixel"
                  >
                    <span>Sign with {pitch.shortName}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: UNIQUE FIRST-DAY-AT-THE-CLUB EVENT */}
        {stage === 'first_day' && (
          <div className="p-5 sm:p-6 space-y-4 animate-fadeIn">
            {/* Celebration Header */}
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 pixel-corners bg-amber-400 border-2 border-amber-200 pixel-bevel-gold flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-amber-500/20">
                <Crown className="w-6 h-6 fill-slate-950" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-arcade">
                OFFICIAL UNVEILING & FIRST DAY AT THE CLUB
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white pixel-text-shadow">
                Welcome to {currentPitch.clubName}!
              </h3>
              <p className="text-xs text-slate-300 max-w-xl mx-auto font-retro">
                {currentPitch.stadiumName} • {currentPitch.countryName}
              </p>
            </div>

            {/* Narrative Timeline of Day 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Stadium Arrival */}
              <div className="bg-slate-950 border-2 border-slate-700 pixel-corners pixel-bevel-sunken p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase font-pixel">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>1. Stadium Arrival</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-retro">
                  {currentPitch.firstDayNarrative.stadiumArrival}
                </p>
              </div>

              {/* 2. Official Press Conference */}
              <div className="bg-slate-950 border-2 border-slate-700 pixel-corners pixel-bevel-sunken p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-sky-400 text-[10px] font-bold uppercase font-pixel">
                  <Camera className="w-3.5 h-3.5" />
                  <span>2. Press Conference</span>
                </div>
                <p className="text-[11px] text-slate-300 italic leading-relaxed font-retro">
                  {currentPitch.firstDayNarrative.pressConferenceQuote}
                </p>
              </div>

              {/* 3. Fan Reaction */}
              <div className="bg-slate-950 border-2 border-slate-700 pixel-corners pixel-bevel-sunken p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase font-pixel">
                  <Users className="w-3.5 h-3.5" />
                  <span>3. Global Media Headline</span>
                </div>
                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed font-retro">
                  {currentPitch.firstDayNarrative.fanReaction}
                </p>
              </div>
            </div>

            {/* Official Contract Summary */}
            <div className="p-3 pixel-corners bg-slate-950 border-2 border-slate-800 pixel-bevel-sunken text-xs space-y-1.5">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px] font-pixel">
                Signed Professional Agreement Terms
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="bg-slate-900 p-2 pixel-corners border border-slate-700/60">
                  <div className="text-[9px] text-slate-400 uppercase font-retro">Weekly Wage</div>
                  <div className="text-xs font-black text-emerald-400 mt-0.5 font-arcade">
                    €{currentPitch.weeklyWage.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-900 p-2 pixel-corners border border-slate-700/60">
                  <div className="text-[9px] text-slate-400 uppercase font-retro">Signing Bonus</div>
                  <div className="text-xs font-black text-white mt-0.5 font-arcade">
                    €{currentPitch.signingBonus.toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-900 p-2 pixel-corners border border-slate-700/60">
                  <div className="text-[9px] text-slate-400 uppercase font-retro">Contract Length</div>
                  <div className="text-xs font-black text-sky-400 mt-0.5 font-arcade">
                    {currentPitch.contractYears} Years
                  </div>
                </div>
                <div className="bg-slate-900 p-2 pixel-corners border border-slate-700/60">
                  <div className="text-[9px] text-slate-400 uppercase font-retro">Release Clause</div>
                  <div className="text-xs font-black text-rose-400 mt-0.5 font-arcade">
                    €{(currentPitch.releaseClause / 1000000).toFixed(0)}M
                  </div>
                </div>
              </div>
            </div>

            {/* Complete & Enter Career Mode */}
            <button
              onClick={handleFinalizeSigning}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider pixel-corners border-2 border-amber-200 pixel-bevel-gold shadow-xl shadow-amber-500/20 transition hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-pixel"
            >
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>Begin Your Chapter at {currentPitch.clubName}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
