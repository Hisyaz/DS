import { PlayerConfig, TrophyItem } from '../types';
import { resolveAuthoritativeClubContext } from './clubContextRebuilder';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { getSanitizedTeamsForLeague } from './leagueSanitizer';

export interface PreseasonFriendlyMatch {
  matchId: string;
  stageTitle: string; // e.g. "Pre-Season Friendly Semi-Final" or "Joan Gamper Trophy Final"
  trophyName: string;
  homeTeam: { name: string; ovr: number; isPlayerTeam: boolean };
  awayTeam: { name: string; ovr: number; isPlayerTeam: boolean };
  homeScore: number;
  awayScore: number;
  playerPlayed: boolean;
  playerMinutes: number; // e.g. 45 min
  playerGoals: number;
  playerAssists: number;
  playerRating: number;
  fitnessGain: number; // +15% - 20%
  substitutionsCount: number; // 7 substitutions applied at half-time
  halfTimeSubsCommentary: string;
  timeline: string[];
}

export interface PreseasonTournamentResult {
  tournamentTitle: string;
  trophyName: string;
  isWon: boolean;
  matches: PreseasonFriendlyMatch[];
  totalFitnessGained: number;
  trophyItem?: TrophyItem;
}

/**
 * Returns the club-specific or league-specific Pre-Season Friendly Trophy name and prestige.
 */
export function getClubPreseasonTrophyConfig(clubName: string, leagueName?: string): {
  trophyName: string;
  prestige: number;
  description: string;
  isUnique: boolean;
} {
  const norm = (clubName || '').trim().toLowerCase();

  // 1. Unique club-specific pre-season friendly trophies
  if (norm.includes('real madrid')) {
    return {
      trophyName: 'Trofeo Santiago Bernabéu',
      prestige: 72,
      description: 'The historic summer invitational trophy hosted by Real Madrid at the Santiago Bernabéu.',
      isUnique: true,
    };
  }
  if (norm.includes('barcelona') || norm.includes('fc barcelona') || norm.includes('barça')) {
    return {
      trophyName: 'Trofeo Joan Gamper',
      prestige: 72,
      description: 'The prestigious pre-season tournament hosted by FC Barcelona in honor of founder Joan Gamper.',
      isUnique: true,
    };
  }
  if (norm.includes('valencia')) {
    return {
      trophyName: 'Trofeo Naranja',
      prestige: 66,
      description: 'The iconic summer festival trophy of Valencia CF hosted at Mestalla since 1959.',
      isUnique: true,
    };
  }
  if (norm.includes('arsenal')) {
    return {
      trophyName: 'Emirates Cup',
      prestige: 70,
      description: 'The premier pre-season invitational tournament hosted by Arsenal FC at Emirates Stadium.',
      isUnique: true,
    };
  }
  if (norm.includes('milan') && !norm.includes('inter')) {
    return {
      trophyName: 'Trofeo Luigi Berlusconi',
      prestige: 68,
      description: 'The classic summer derby trophy inaugurated in 1991 in honor of Luigi Berlusconi.',
      isUnique: true,
    };
  }
  if (norm.includes('ajax')) {
    return {
      trophyName: 'Torneo de Ámsterdam',
      prestige: 66,
      description: 'The Amsterdam Tournament, hosted annually by AFC Ajax at the Johan Cruyff Arena.',
      isUnique: true,
    };
  }
  if (norm.includes('benfica')) {
    return {
      trophyName: 'Copa Eusébio',
      prestige: 66,
      description: 'The prestigious pre-season invitational hosted by SL Benfica honoring the legendary Eusébio.',
      isUnique: true,
    };
  }
  if (norm.includes('boca') || norm.includes('boca juniors')) {
    return {
      trophyName: 'Fútbol de Verano (Copa Desafío)',
      prestige: 65,
      description: 'The traditional pre-season summer championship tournament of Argentine football.',
      isUnique: true,
    };
  }
  if (norm.includes('river') || norm.includes('river plate')) {
    return {
      trophyName: 'Fútbol de Verano (Copa Luis B. Nofal)',
      prestige: 65,
      description: 'The classic Torneo de Verano pre-season cup contested during January/February in Argentina.',
      isUnique: true,
    };
  }

  // 2. League-specific fallback generic pre-season cups
  const lNorm = (leagueName || '').toLowerCase();
  if (lNorm.includes('premier') || lNorm.includes('championship')) {
    return {
      trophyName: 'Premier League Summer Trophy',
      prestige: 62,
      description: 'Summer pre-season fitness tournament featuring top-flight clubs.',
      isUnique: false,
    };
  }
  if (lNorm.includes('laliga') || lNorm.includes('la liga') || lNorm.includes('segunda')) {
    return {
      trophyName: 'Trofeo Ibérico de Verano',
      prestige: 62,
      description: 'Spanish pre-season invitational cup to prepare squad fitness before the season kickoff.',
      isUnique: false,
    };
  }
  if (lNorm.includes('serie a') || lNorm.includes('serie b') || lNorm.includes('italy')) {
    return {
      trophyName: 'Trofeo TIM / Serie A Summer Cup',
      prestige: 62,
      description: 'Italian summer fitness tournament.',
      isUnique: false,
    };
  }
  if (lNorm.includes('bundesliga')) {
    return {
      trophyName: 'Bundesliga Summer Cup',
      prestige: 62,
      description: 'German pre-season summer fitness cup.',
      isUnique: false,
    };
  }
  if (lNorm.includes('ligue 1') || lNorm.includes('ligue 2') || lNorm.includes('france')) {
    return {
      trophyName: 'Ligue 1 Summer Challenge',
      prestige: 60,
      description: 'French summer pre-season fitness cup.',
      isUnique: false,
    };
  }
  if (lNorm.includes('eredivisie')) {
    return {
      trophyName: 'Eredivisie Pre-Season Cup',
      prestige: 60,
      description: 'Dutch summer football festival trophy.',
      isUnique: false,
    };
  }
  if (lNorm.includes('primeira') || lNorm.includes('portugal')) {
    return {
      trophyName: 'Algarve Summer Cup',
      prestige: 60,
      description: 'Portuguese summer pre-season trophy.',
      isUnique: false,
    };
  }
  if (lNorm.includes('argentina') || lNorm.includes('profesional')) {
    return {
      trophyName: 'Torneo de Verano de Argentina',
      prestige: 60,
      description: 'Argentine pre-season friendly cup.',
      isUnique: false,
    };
  }
  if (lNorm.includes('brasil') || lNorm.includes('brazil') || lNorm.includes('brasileir')) {
    return {
      trophyName: 'Copa de Verão Brasil',
      prestige: 60,
      description: 'Brazilian pre-season warm-up tournament.',
      isUnique: false,
    };
  }
  if (lNorm.includes('saudi') || lNorm.includes('roshn')) {
    return {
      trophyName: 'Riyadh Season Summer Cup',
      prestige: 62,
      description: 'Saudi pre-season invitational cup.',
      isUnique: false,
    };
  }

  return {
    trophyName: `${leagueName || 'Summer'} Pre-Season Trophy`,
    prestige: 58,
    description: 'Pre-season friendly silverware contested to boost squad fitness and match sharpness.',
    isUnique: false,
  };
}

/**
 * Simulates a full Pre-Season Friendly Cup tournament with 7 substitutions per match.
 */
export function simulatePreseasonFriendlyTournament(
  player: PlayerConfig,
  seasonYear: number | string
): PreseasonTournamentResult {
  const careerDb = getCareerLeagueDatabase();
  const authContext = resolveAuthoritativeClubContext(player.club || '', careerDb);
  const playerClubName = authContext?.club || player.club || 'FC Club';
  const leagueName = authContext?.league || player.league || 'League';

  const trophyConfig = getClubPreseasonTrophyConfig(playerClubName, leagueName);

  // Retrieve 3 rival clubs for a 4-team mini pre-season cup
  let sanitized = getSanitizedTeamsForLeague(authContext.leagueId, careerDb);
  if (!sanitized || sanitized.length < 4) {
    sanitized = getSanitizedTeamsForLeague(authContext.canonicalD1Id, careerDb);
  }
  const rivals = sanitized
    .filter((t) => t.name.toLowerCase() !== playerClubName.toLowerCase() && !t.name.toLowerCase().includes(playerClubName.toLowerCase()))
    .slice(0, 3);

  const semiOpponent = rivals[0] || { name: 'Inter Milan', ovr: 78 };
  const finalOpponent = rivals[1] || { name: 'Bayern Munich', ovr: 82 };

  const playerOvr = player.ovr || 72;
  const isStarterFirstHalf = true; // Starter in 1st half, rotated out at 45' with 7 subs

  // Semi-Final Simulation
  const semiPlayerGoalChance = (playerOvr / 100) * 0.35;
  const semiPlayerGoals = Math.random() < semiPlayerGoalChance ? 1 : 0;
  const semiPlayerAssists = semiPlayerGoals === 0 && Math.random() < 0.25 ? 1 : 0;
  const semiTeamGoals1stHalf = semiPlayerGoals + (Math.random() < 0.4 ? 1 : 0);
  const semiTeamGoals2ndHalf = Math.random() < 0.5 ? 1 : 0;
  const semiTotalPlayerTeamScore = Math.max(1, semiTeamGoals1stHalf + semiTeamGoals2ndHalf);
  const semiOpponentScore = Math.floor(Math.random() * semiTotalPlayerTeamScore); // Bias to win semi

  const semiMatch: PreseasonFriendlyMatch = {
    matchId: `preseason-semi-${Date.now()}-1`,
    stageTitle: `${trophyConfig.trophyName} - Semi-Final`,
    trophyName: trophyConfig.trophyName,
    homeTeam: { name: playerClubName, ovr: playerOvr, isPlayerTeam: true },
    awayTeam: { name: semiOpponent.name, ovr: semiOpponent.ovr || 75, isPlayerTeam: false },
    homeScore: semiTotalPlayerTeamScore,
    awayScore: semiOpponentScore,
    playerPlayed: true,
    playerMinutes: 45, // 1st half starter
    playerGoals: semiPlayerGoals,
    playerAssists: semiPlayerAssists,
    playerRating: parseFloat((7.0 + (semiPlayerGoals * 0.8) + (semiPlayerAssists * 0.5) + (Math.random() * 0.4)).toFixed(1)),
    fitnessGain: 10,
    substitutionsCount: 7,
    halfTimeSubsCommentary: '45\' Half-Time: Manager executes 7 wholesale tactical substitutions to give rotation players pre-season match minutes.',
    timeline: [
      `15' Match tempo builds with energetic pre-season pressing from ${playerClubName}.`,
      semiPlayerGoals > 0 ? `32' ⚽ GOAL! ${player.name} finishes cleanly into the corner!` : `34' Close effort as ${playerClubName} tests the goalkeeper.`,
      `45' 🔄 HALF-TIME WHOLESALE ROTATION: 7 substitutions completed simultaneously for fitness conditioning.`,
      `68' Fresh substitutes maintain intense physical pressure.`,
      `90' Full-time whistle: ${playerClubName} qualifies for the pre-season cup final!`,
    ],
  };

  // Grand Final Simulation
  const wonFinal = Math.random() < 0.65; // High chance to lift friendly trophy
  const finalPlayerGoalChance = (playerOvr / 100) * 0.4;
  const finalPlayerGoals = Math.random() < finalPlayerGoalChance ? 1 : 0;
  const finalPlayerAssists = finalPlayerGoals === 0 && Math.random() < 0.3 ? 1 : 0;
  
  let finalHomeScore = 2;
  let finalAwayScore = 1;
  if (wonFinal) {
    finalHomeScore = Math.max(1, (finalPlayerGoals + (Math.random() < 0.6 ? 1 : 0) + (Math.random() < 0.4 ? 1 : 0)));
    finalAwayScore = Math.max(0, finalHomeScore - 1);
  } else {
    finalAwayScore = 2;
    finalHomeScore = 1;
  }

  const finalMatch: PreseasonFriendlyMatch = {
    matchId: `preseason-final-${Date.now()}-2`,
    stageTitle: `${trophyConfig.trophyName} - Grand Final`,
    trophyName: trophyConfig.trophyName,
    homeTeam: { name: playerClubName, ovr: playerOvr, isPlayerTeam: true },
    awayTeam: { name: finalOpponent.name, ovr: finalOpponent.ovr || 78, isPlayerTeam: false },
    homeScore: finalHomeScore,
    awayScore: finalAwayScore,
    playerPlayed: true,
    playerMinutes: 45, // 1st half starter
    playerGoals: finalPlayerGoals,
    playerAssists: finalPlayerAssists,
    playerRating: parseFloat((7.2 + (finalPlayerGoals * 0.9) + (finalPlayerAssists * 0.6) + (wonFinal ? 0.3 : 0)).toFixed(1)),
    fitnessGain: 10,
    substitutionsCount: 7,
    halfTimeSubsCommentary: '45\' Half-Time: 7 substitutions made across the squad to maximize conditioning before official league opening.',
    timeline: [
      `10' Electric atmosphere for the ${trophyConfig.trophyName} Grand Final.`,
      finalPlayerGoals > 0 ? `28' ⚽ GOAL! ${player.name} strikes beautifully for ${playerClubName}!` : `22' Sharp passing through midfield by ${playerClubName}.`,
      `45' 🔄 HALF-TIME WHOLESALE ROTATION: 7 substitutions made as planned to build complete squad sharpness.`,
      wonFinal ? `84' ⚽ Decisive winning goal converted by the second-half substitutes!` : `79' Competitive physical duel in the closing minutes.`,
      `90' Full-time: ${wonFinal ? `${playerClubName} wins the ${trophyConfig.trophyName}! 🏆` : `${finalOpponent.name} edges out the victory.`}`,
    ],
  };

  const isWon = wonFinal;
  const totalFitnessGained = semiMatch.fitnessGain + finalMatch.fitnessGain; // +20% fitness boost

  let trophyItem: TrophyItem | undefined = undefined;
  if (isWon) {
    const yr = String(seasonYear);
    trophyItem = {
      id: `trophy-friendly-${trophyConfig.trophyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${yr}-${Date.now()}`,
      name: trophyConfig.trophyName,
      category: 'friendly',
      year: yr,
      prestige: trophyConfig.prestige,
      iconType: 'friendly',
      clubWonWith: playerClubName,
      count: 1,
    };
  }

  return {
    tournamentTitle: trophyConfig.trophyName,
    trophyName: trophyConfig.trophyName,
    isWon,
    matches: [semiMatch, finalMatch],
    totalFitnessGained,
    trophyItem,
  };
}
