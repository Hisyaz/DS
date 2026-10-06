import { PlayerConfig, PlayerCardData } from '../types';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { SeasonCompetitionRecord, SeasonTeamStandingsSummary, CareerSeasonRecord } from '../types/careerConclusion';
import { YouthSeasonStats, YouthSeasonAwards, TournamentMatch, YouthLeagueStanding } from '../types/youthLeague';
import { SquadLeagueAwards } from '../types/individualAwards';
import { isProfessionalPlayer } from './playerIdentitySystem';
import {
  getWorldSimulationState,
  saveWorldSimulationState,
  resolveAuthoritativeSeasonYear,
  advanceWorldSimulationToMatchday,
  recalculateLeaguePlayerStats,
  recalculateLeagueLeaderboards,
  getAuthoritativeLeagueLeaderboards,
} from './worldSimulationEngine';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { resolvePlayerProfessionalLeague } from './professionalLeagueEngine';
import { getSanitizedTeamsForLeague } from './leagueSanitizer';
import { ensureTeamSquadSaveFile } from './squadSaveFileSystem';

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  clubName: string;
  value: number;
  isPlayer: boolean;
  avatarText?: string;
}

export interface SeasonLeaderboards {
  topScorers: LeaderboardEntry[];
  topAssists: LeaderboardEntry[];
  playerGoalRank?: number;
  playerAssistRank?: number;
  isPlayerTop5Goals: boolean;
  isPlayerTop5Assists: boolean;
}

export interface IndividualAwardItem {
  id: string;
  name: string;
  category: 'mvp' | 'top_scorer' | 'top_assist' | 'best_gk' | 'championship';
  icon: string;
  description: string;
  competitionName: string;
}

/**
 * Calculates top goalscorer and assist leaderboards for the season and checks if player is in top 5.
 * Uses strictly real database players from the live world simulation state and actual squad databases.
 */
export function calculateGoalAndAssistLeaderboards(
  player: PlayerCardData,
  totalGoals: number,
  totalAssists: number,
  isPro: boolean,
  leagueName: string = 'Youth League',
  seasonYear?: string
): SeasonLeaderboards {
  const playerName = player.name || 'Player';
  const playerClub = player.club || 'Academy FC';

  const db = getCareerLeagueDatabase();
  const targetSeasonYear = seasonYear || resolveAuthoritativeSeasonYear(player, (player as any).seasonYear);
  let worldState = getWorldSimulationState(targetSeasonYear, db, player);

  let authoritativeLeagueId = 'england_d1';
  if (isPro) {
    const resolved = resolvePlayerProfessionalLeague(player, db);
    authoritativeLeagueId = resolved.league?.id || 'england_d1';
  } else {
    const cCode = (player.countryCode || player.clubCountry || player.country || 'ENG').toUpperCase();
    if (cCode.includes('ESP')) authoritativeLeagueId = 'spain_d1';
    else if (cCode.includes('ITA')) authoritativeLeagueId = 'italy_d1';
    else if (cCode.includes('GER')) authoritativeLeagueId = 'germany_d1';
    else if (cCode.includes('FRA')) authoritativeLeagueId = 'france_d1';
    else if (cCode.includes('POR')) authoritativeLeagueId = 'portugal_d1';
    else if (cCode.includes('BRA')) authoritativeLeagueId = 'brazil_d1';
    else if (cCode.includes('ARG')) authoritativeLeagueId = 'argentina_d1';
    else authoritativeLeagueId = 'england_d1';
  }

  let liveLeague = worldState.leagues[authoritativeLeagueId];

  // If this is a professional league and fixtures have not been fully simulated up to MD 38
  if (isPro && (!liveLeague || liveLeague.topScorers.length === 0 || liveLeague.currentMatchday < (liveLeague.totalMatchdays || 38))) {
    advanceWorldSimulationToMatchday(
      liveLeague?.totalMatchdays || 38,
      player,
      player.clubId,
      undefined,
      db,
      targetSeasonYear
    );
    worldState = getWorldSimulationState(targetSeasonYear, db, player);
    liveLeague = worldState.leagues[authoritativeLeagueId];
  }

  if (liveLeague) {
    if (!liveLeague.playerStatsMap || Object.keys(liveLeague.playerStatsMap).length === 0) {
      recalculateLeaguePlayerStats(liveLeague);
      recalculateLeagueLeaderboards(liveLeague);
      saveWorldSimulationState(worldState);
    }
  }

  // If live simulation state has accumulated player stats for this league
  if (liveLeague && (liveLeague.topScorers.length > 0 || liveLeague.topAssists.length > 0)) {
    const allScorers: { name: string; club: string; value: number; isPlayer: boolean }[] = [];
    let playerIncludedInScorers = false;

    liveLeague.topScorers.forEach((entry) => {
      const isPlayer = entry.isUserPlayer || entry.playerName === playerName;
      if (isPlayer) {
        playerIncludedInScorers = true;
        allScorers.push({
          name: playerName,
          club: playerClub,
          value: Math.max(totalGoals, entry.value),
          isPlayer: true,
        });
      } else {
        allScorers.push({
          name: entry.playerName,
          club: entry.teamName,
          value: entry.value,
          isPlayer: false,
        });
      }
    });

    if (!playerIncludedInScorers && totalGoals > 0) {
      allScorers.push({
        name: playerName,
        club: playerClub,
        value: totalGoals,
        isPlayer: true,
      });
    }

    allScorers.sort((a, b) => b.value - a.value || (a.isPlayer ? -1 : 1));

    const topScorers: LeaderboardEntry[] = allScorers.slice(0, 5).map((entry, idx) => ({
      rank: idx + 1,
      playerName: entry.name,
      clubName: entry.club,
      value: entry.value,
      isPlayer: entry.isPlayer,
    }));

    const playerGoalIndex = allScorers.findIndex((e) => e.isPlayer);
    const playerGoalRank = playerGoalIndex !== -1 ? playerGoalIndex + 1 : undefined;
    const isPlayerTop5Goals = playerGoalRank !== undefined && playerGoalRank <= 5 && totalGoals > 0;

    // Assists
    const allAssists: { name: string; club: string; value: number; isPlayer: boolean }[] = [];
    let playerIncludedInAssists = false;

    liveLeague.topAssists.forEach((entry) => {
      const isPlayer = entry.isUserPlayer || entry.playerName === playerName;
      if (isPlayer) {
        playerIncludedInAssists = true;
        allAssists.push({
          name: playerName,
          club: playerClub,
          value: Math.max(totalAssists, entry.value),
          isPlayer: true,
        });
      } else {
        allAssists.push({
          name: entry.playerName,
          club: entry.teamName,
          value: entry.value,
          isPlayer: false,
        });
      }
    });

    if (!playerIncludedInAssists && totalAssists > 0) {
      allAssists.push({
        name: playerName,
        club: playerClub,
        value: totalAssists,
        isPlayer: true,
      });
    }

    allAssists.sort((a, b) => b.value - a.value || (a.isPlayer ? -1 : 1));

    const topAssists: LeaderboardEntry[] = allAssists.slice(0, 5).map((entry, idx) => ({
      rank: idx + 1,
      playerName: entry.name,
      clubName: entry.club,
      value: entry.value,
      isPlayer: entry.isPlayer,
    }));

    const playerAssistIndex = allAssists.findIndex((e) => e.isPlayer);
    const playerAssistRank = playerAssistIndex !== -1 ? playerAssistIndex + 1 : undefined;
    const isPlayerTop5Assists = playerAssistRank !== undefined && playerAssistRank <= 5 && totalAssists > 0;

    return {
      topScorers,
      topAssists,
      playerGoalRank,
      playerAssistRank,
      isPlayerTop5Goals,
      isPlayerTop5Assists,
    };
  }

  // Fallback: Query actual database players from teams in the league with realistic stats based on OVR
  const teams = getSanitizedTeamsForLeague(authoritativeLeagueId, db);
  const realDatabaseAttackers: { name: string; club: string; ovr: number }[] = [];
  const realDatabasePlaymakers: { name: string; club: string; ovr: number }[] = [];

  teams.forEach((t) => {
    const fullTeam = db.teams?.[t.id] || {
      id: t.id,
      name: t.name,
      countryCode: t.countryCode,
      leagueId: authoritativeLeagueId,
      overallRating: t.ovr,
    };
    const ensured = ensureTeamSquadSaveFile(fullTeam as any);
    (ensured.squadSaveFile?.squad || []).slice(0, 11).forEach((slot) => {
      const p = slot.player;
      if (!p || p.name === playerName) return;
      const sub = (p.subPosition || p.position || '').toUpperCase();
      if (['ST', 'CF', 'LW', 'RW'].includes(sub)) {
        realDatabaseAttackers.push({ name: p.name, club: t.name, ovr: p.ovr || 70 });
      } else if (['CAM', 'CM', 'LM', 'RM'].includes(sub)) {
        realDatabasePlaymakers.push({ name: p.name, club: t.name, ovr: p.ovr || 70 });
      }
    });
  });

  // Sort attackers by OVR so the best players lead
  realDatabaseAttackers.sort((a, b) => b.ovr - a.ovr);
  realDatabasePlaymakers.sort((a, b) => b.ovr - a.ovr);

  const allScorers: { name: string; club: string; value: number; isPlayer: boolean }[] = [
    { name: playerName, club: playerClub, value: totalGoals, isPlayer: true },
  ];

  realDatabaseAttackers.slice(0, 4).forEach((att, idx) => {
    // Realistic goals distributed by ranking: 22, 19, 17, 15
    const baseGoals = Math.max(10, Math.floor(22 - idx * 2.5 + (att.ovr - 75) * 0.4));
    allScorers.push({
      name: att.name,
      club: att.club,
      value: baseGoals,
      isPlayer: false,
    });
  });

  allScorers.sort((a, b) => b.value - a.value || (a.isPlayer ? -1 : 1));

  const topScorers: LeaderboardEntry[] = allScorers.slice(0, 5).map((entry, idx) => ({
    rank: idx + 1,
    playerName: entry.name,
    clubName: entry.club,
    value: entry.value,
    isPlayer: entry.isPlayer,
  }));

  const playerGoalIndex = allScorers.findIndex((e) => e.isPlayer);
  const playerGoalRank = playerGoalIndex !== -1 && totalGoals > 0 ? playerGoalIndex + 1 : undefined;
  const isPlayerTop5Goals = playerGoalRank !== undefined && playerGoalRank <= 5 && totalGoals > 0;

  const allAssists: { name: string; club: string; value: number; isPlayer: boolean }[] = [
    { name: playerName, club: playerClub, value: totalAssists, isPlayer: true },
  ];

  realDatabasePlaymakers.slice(0, 4).forEach((pm, idx) => {
    // Realistic assists distributed by ranking: 14, 12, 10, 9
    const baseAssists = Math.max(6, Math.floor(14 - idx * 1.8 + (pm.ovr - 75) * 0.3));
    allAssists.push({
      name: pm.name,
      club: pm.club,
      value: baseAssists,
      isPlayer: false,
    });
  });

  allAssists.sort((a, b) => b.value - a.value || (a.isPlayer ? -1 : 1));

  const topAssists: LeaderboardEntry[] = allAssists.slice(0, 5).map((entry, idx) => ({
    rank: idx + 1,
    playerName: entry.name,
    clubName: entry.club,
    value: entry.value,
    isPlayer: entry.isPlayer,
  }));

  const playerAssistIndex = allAssists.findIndex((e) => e.isPlayer);
  const playerAssistRank = playerAssistIndex !== -1 && totalAssists > 0 ? playerAssistIndex + 1 : undefined;
  const isPlayerTop5Assists = playerAssistRank !== undefined && playerAssistRank <= 5 && totalAssists > 0;

  return {
    topScorers,
    topAssists,
    playerGoalRank,
    playerAssistRank,
    isPlayerTop5Goals,
    isPlayerTop5Assists,
  };
}

/**
 * Calculates official squad division individual awards for U17, U20, or Reserves tournaments:
 * - Top Goalscorer (Golden Boot)
 * - Top Assist Provider (Playmaker)
 * - Best Goalkeeper (Golden Glove / Least Goals Conceded)
 * - Player of the Season (Tournament MVP)
 */
export function calculateSquadLeagueAwards(
  player: PlayerCardData,
  totalGoals: number,
  totalAssists: number,
  avgRating: number,
  cleanSheets: number,
  squadLevel: 'U17' | 'U20' | 'Reserves' | string,
  standings: YouthLeagueStanding[] = [],
  leagueName: string = 'Squad Division'
): SquadLeagueAwards {
  const playerName = player.name || 'Player';
  const playerClub = player.club || 'Academy FC';
  const isGk = (player.position || '').toUpperCase().includes('GK') || (player.subPosition || '').toUpperCase().includes('GK');

  const sortedStandings = [...(standings || [])].sort((a, b) => a.rank - b.rank);
  const championTeam = sortedStandings[0] || { teamName: `${playerClub} ${squadLevel}`, rank: 1, goalsAgainst: 14, played: 18 };
  const runnerUpTeam = sortedStandings[1] || { teamName: `Rival Athletic ${squadLevel}`, rank: 2, goalsAgainst: 16, played: 18 };
  const thirdTeam = sortedStandings[2] || { teamName: `Sporting Club ${squadLevel}`, rank: 3, goalsAgainst: 18, played: 18 };

  // Find team with best defensive record (lowest goalsAgainst)
  const bestDefenseTeam = [...sortedStandings].sort((a, b) => (a.goalsAgainst || 99) - (b.goalsAgainst || 99))[0] || championTeam;

  // 1. Top Goalscorer
  const simulatedRivalGoals = 14 + (championTeam.rank === 1 ? 3 : 1);
  const isPlayerTopScorer = totalGoals >= simulatedRivalGoals && totalGoals > 0;
  const topScorerWinner = isPlayerTopScorer
    ? { playerName, clubName: `${playerClub} (${squadLevel})`, value: totalGoals, isPlayer: true }
    : {
        playerName: `${championTeam.teamName.replace(/\s*(U17|U20|Reserves)/gi, '').trim()} Striker`,
        clubName: championTeam.teamName,
        value: Math.max(simulatedRivalGoals, totalGoals + 1),
        isPlayer: false,
      };

  // 2. Top Assist Provider
  const simulatedRivalAssists = 11 + (runnerUpTeam.rank === 2 ? 2 : 1);
  const isPlayerTopAssists = totalAssists >= simulatedRivalAssists && totalAssists > 0;
  const topAssistsWinner = isPlayerTopAssists
    ? { playerName, clubName: `${playerClub} (${squadLevel})`, value: totalAssists, isPlayer: true }
    : {
        playerName: `${runnerUpTeam.teamName.replace(/\s*(U17|U20|Reserves)/gi, '').trim()} Playmaker`,
        clubName: runnerUpTeam.teamName,
        value: Math.max(simulatedRivalAssists, totalAssists + 1),
        isPlayer: false,
      };

  // 3. Best Goalkeeper (Least Goals Conceded / Golden Glove)
  const leastGa = Math.max(6, bestDefenseTeam.goalsAgainst || 12);
  const bestGkCleanSheets = Math.max(7, Math.floor((bestDefenseTeam.played || 18) * 0.55));
  const isPlayerBestGk = isGk && (cleanSheets >= bestGkCleanSheets || cleanSheets >= 8);
  const bestGoalkeeperWinner = isPlayerBestGk
    ? { playerName, clubName: `${playerClub} (${squadLevel})`, cleanSheets: Math.max(cleanSheets, 8), goalsConceded: Math.max(4, Math.floor(leastGa * 0.75)), isPlayer: true }
    : {
        playerName: `${bestDefenseTeam.teamName.replace(/\s*(U17|U20|Reserves)/gi, '').trim()} Goalkeeper`,
        clubName: bestDefenseTeam.teamName,
        cleanSheets: bestGkCleanSheets,
        goalsConceded: leastGa,
        isPlayer: false,
      };

  // 4. Tournament / Season MVP
  const simulatedRivalRating = 7.7;
  const isPlayerMvp = avgRating >= simulatedRivalRating || (isPlayerTopScorer && isPlayerTopAssists);
  const bestPlayerWinner = isPlayerMvp
    ? { playerName, clubName: `${playerClub} (${squadLevel})`, value: avgRating, isPlayer: true }
    : {
        playerName: `${championTeam.teamName.replace(/\s*(U17|U20|Reserves)/gi, '').trim()} Captain`,
        clubName: championTeam.teamName,
        value: 7.8,
        isPlayer: false,
      };

  return {
    squadLevel,
    leagueName,
    topScorerWinner,
    topAssistsWinner,
    bestGoalkeeperWinner,
    bestPlayerWinner,
  };
}

/**
 * Builds detailed competition-by-competition statistics breakdown from all matches simulated in a season
 */
export function buildSeasonCompetitionBreakdown(
  player: PlayerCardData,
  allSeasonMatches: SimulatedMatchResult[],
  tournamentMatches: TournamentMatch[] = [],
  playerStanding?: { rank: number; points: number; won: number; drawn: number; lost: number; goalDifference: number; promoted?: boolean; inPlayoff?: boolean } | null,
  leagueName: string = 'Youth League',
  seasonAwards?: YouthSeasonAwards | null,
  tournamentWinner?: boolean
): SeasonCompetitionRecord[] {
  const isPro = isProfessionalPlayer(player);
  const position = (player.position || 'ST').toUpperCase();
  const isGkOrDef = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'DEF'].some((p) => position.includes(p));

  // Map to group matches by competitionName
  const compMap = new Map<string, SimulatedMatchResult[]>();

  allSeasonMatches.forEach((m) => {
    // Detect or extract competition name
    let comp = m.competitionName || '';
    const stage = m.stageName || '';
    if (!comp) {
      if (m.homeTeamName.includes('Reserve') || m.awayTeamName.includes('Reserve') || stage.includes('Reserve')) {
        comp = m.stageName?.includes('Cup') ? `${player.club || 'Club'} Reserve Cup` : `${player.league || 'National'} Reserve Division`;
      } else if (stage.includes('Sudamericana')) {
        comp = 'Copa Sudamericana';
      } else if (stage.includes('Libertadores')) {
        comp = 'Copa Libertadores';
      } else if (stage.includes('Champions') || stage.includes('Continental') || stage.includes('UCL')) {
        comp = 'UEFA Champions League';
      } else if (stage.includes('Europa') || stage.includes('UEL')) {
        comp = 'UEFA Europa League';
      } else if (stage.includes('Conference') || stage.includes('UECL')) {
        comp = 'UEFA Conference League';
      } else if (stage.includes('FA Cup') || stage.includes('Copa del Rey') || stage.includes('Coupe') || stage.includes('Cup')) {
        comp = stage.includes('FA Cup') ? 'FA Cup' : stage.includes('Copa del Rey') ? 'Copa del Rey' : stage.includes('Coupe') ? 'Coupe de France' : 'Domestic Cup';
      } else if (stage.includes('Qualifiers') || stage.includes('World Cup') || stage.includes('Euro') || stage.includes('Copa América')) {
        comp = stage;
      } else {
        comp = isPro ? (player.league || 'First Division') : leagueName;
      }
    }

    if (!compMap.has(comp)) {
      compMap.set(comp, []);
    }
    compMap.get(comp)!.push(m);
  });

  const results: SeasonCompetitionRecord[] = [];

  compMap.forEach((matches, compName) => {
    let matchesCount = 0;
    let minutesTotal = 0;
    let goalsTotal = 0;
    let assistsTotal = 0;
    let mvpsTotal = 0;
    let ratingSum = 0;
    let ratingMatches = 0;
    let cleanSheetsCount = 0;
    let yellowCardsCount = 0;
    let redCardsCount = 0;

    matches.forEach((m) => {
      const isPlayed = m.playerStatus === 'starter' || m.playerStatus === 'sub_out' || m.playerStatus === 'sub_in' || (m.minutesPlayed || 0) > 0;
      if (isPlayed) {
        matchesCount++;
        minutesTotal += m.minutesPlayed || 0;
        goalsTotal += m.playerGoals || 0;
        assistsTotal += m.playerAssists || 0;
        if (m.isMvp) mvpsTotal++;
        if (typeof m.playerRating === 'number' && !isNaN(m.playerRating)) {
          ratingSum += m.playerRating;
          ratingMatches++;
        }
        if (m.cleanSheet) cleanSheetsCount++;
        if (m.yellowCard) yellowCardsCount++;
        if (m.redCard) redCardsCount++;
      }
    });

    const avgRating = ratingMatches > 0 ? parseFloat((ratingSum / ratingMatches).toFixed(1)) : 6.5;

    // Detect Competition Type
    let compType: 'league' | 'cup' | 'continental' | 'national_team' | 'youth_cup' | 'other' = 'league';
    if (compName.toLowerCase().includes('cup') && !compName.toLowerCase().includes('youth cup')) {
      compType = 'cup';
    } else if (compName.toLowerCase().includes('champions') || compName.toLowerCase().includes('libertadores') || compName.toLowerCase().includes('europa') || compName.toLowerCase().includes('sudamericana')) {
      compType = 'continental';
    } else if (compName.toLowerCase().includes('qualifiers') || compName.toLowerCase().includes('world cup') || compName.toLowerCase().includes('euro') || compName.toLowerCase().includes('copa américa')) {
      compType = 'national_team';
    } else if (compName.toLowerCase().includes('youth cup') || compName.toLowerCase().includes('international youth')) {
      compType = 'youth_cup';
    }

    // Determine Stage Reached / Standing
    let standingRank: number | undefined = undefined;
    let stageReached = 'Completed';
    let wonTrophy = false;

    if (compType === 'league') {
      standingRank = playerStanding?.rank || 1;
      wonTrophy = standingRank === 1;
      stageReached = wonTrophy ? 'Champions 🏆' : `Finished Rank #${standingRank}`;
    } else if (compType === 'cup') {
      // If win rate is high in cup fixtures, won cup or reached deep rounds
      const wins = matches.filter((m) => m.homeScore > m.awayScore || (m.awayScore > m.homeScore && !m.isPlayerHome)).length;
      if (wins >= matches.length && matches.length >= 3) {
        stageReached = 'Winners 🏆';
        wonTrophy = true;
      } else if (wins >= matches.length - 1) {
        stageReached = 'Final 🥈';
      } else if (wins >= 2) {
        stageReached = 'Semi-Final';
      } else {
        stageReached = 'Quarter-Final';
      }
    } else if (compType === 'continental') {
      const wins = matches.filter((m) => m.homeScore > m.awayScore || (m.awayScore > m.homeScore && !m.isPlayerHome)).length;
      if (wins >= matches.length && matches.length >= 3) {
        stageReached = 'Champions 🏆';
        wonTrophy = true;
      } else if (wins >= 2) {
        stageReached = 'Semi-Final';
      } else {
        stageReached = 'Quarter-Final';
      }
    }

    // Leaderboards rank
    const topScorerRank = goalsTotal >= 12 ? 1 : goalsTotal >= 8 ? 2 : goalsTotal >= 5 ? 4 : undefined;
    const topAssistRank = assistsTotal >= 10 ? 1 : assistsTotal >= 7 ? 2 : assistsTotal >= 4 ? 4 : undefined;

    const trophiesWonList: string[] = [];
    const awardsWonList: string[] = [];

    if (wonTrophy) trophiesWonList.push(`${compName} Champion`);
    if (topScorerRank === 1) awardsWonList.push(`${compName} Golden Boot (Top Scorer)`);
    if (topAssistRank === 1) awardsWonList.push(`${compName} Most Assists`);
    if (avgRating >= 8.0 && matchesCount >= 4) awardsWonList.push(`${compName} Player of the Tournament`);

    results.push({
      competitionName: compName,
      competitionType: compType,
      matches: matchesCount,
      minutes: minutesTotal,
      goals: goalsTotal,
      assists: assistsTotal,
      mvps: mvpsTotal,
      avgRating,
      cleanSheets: isGkOrDef ? cleanSheetsCount : undefined,
      yellowCards: yellowCardsCount,
      redCards: redCardsCount,
      standingRank,
      stageReached,
      wonTrophy,
      topScorerRank,
      topAssistRank,
      trophiesWon: trophiesWonList,
      awardsWon: awardsWonList,
    });
  });

  // If there are tournament matches from International Youth Cup
  if (tournamentMatches && tournamentMatches.length > 0) {
    let tMatches = 0;
    let tMinutes = 0;
    let tGoals = 0;
    let tAssists = 0;
    let tMvps = 0;
    let tRatingSum = 0;

    tournamentMatches.forEach((tm) => {
      tMatches++;
      tMinutes += 90;
      tGoals += tm.playerGoals || 0;
      tAssists += tm.playerAssists || 0;
      if ((tm.playerRating || 0) >= 8.5) tMvps++;
      tRatingSum += tm.playerRating || 7.0;
    });

    const tAvgRating = tMatches > 0 ? parseFloat((tRatingSum / tMatches).toFixed(1)) : 7.2;
    const isWinner = Boolean(tournamentWinner);

    results.push({
      competitionName: 'International Youth Cup (32 Clubs)',
      competitionType: 'youth_cup',
      matches: tMatches,
      minutes: tMinutes,
      goals: tGoals,
      assists: tAssists,
      mvps: tMvps,
      avgRating: tAvgRating,
      stageReached: isWinner ? 'Champions 🏆' : 'Knockout Stage',
      wonTrophy: isWinner,
      trophiesWon: isWinner ? ['International Youth Cup Champion'] : [],
      awardsWon: isWinner && tAvgRating >= 8.0 ? ['Youth Cup Golden Ball (MVP)'] : [],
    });
  }

  // Guarantee at least the primary League entry exists
  if (results.length === 0) {
    results.push({
      competitionName: isPro ? (player.league || 'First Division') : leagueName,
      competitionType: 'league',
      matches: allSeasonMatches.length || 18,
      minutes: (allSeasonMatches.length || 18) * 78,
      goals: 0,
      assists: 0,
      mvps: 0,
      avgRating: 7.0,
      stageReached: playerStanding?.rank === 1 ? 'Champions 🏆' : `Rank #${playerStanding?.rank || 1}`,
      wonTrophy: playerStanding?.rank === 1,
    });
  }

  return results;
}

/**
 * Builds SeasonTeamStandingsSummary containing team finish in League, Cup, Continental Cup, and National Team
 */
export function buildSeasonTeamStandingsSummary(
  player: PlayerCardData,
  playerStanding?: { rank: number; points: number; won: number; drawn: number; lost: number; goalDifference: number; promoted?: boolean; inPlayoff?: boolean; qualifiedContinental?: boolean } | null,
  leagueName: string = 'Youth League',
  tournamentFinish?: string | null,
  isCupWinner: boolean = false
): SeasonTeamStandingsSummary {
  const isPro = isProfessionalPlayer(player);
  const country = player.countryCode || player.clubCountry || player.country || 'ENG';
  const isEng = country.toUpperCase().includes('ENG');
  const isEsp = country.toUpperCase().includes('ESP');
  const isBra = country.toUpperCase().includes('BRA');
  const isArg = country.toUpperCase().includes('ARG');

  const leagueRank = playerStanding?.rank || 1;
  const isChampion = leagueRank === 1;

  let leagueStatus = 'Mid-Table';
  if (isChampion) leagueStatus = 'Champions 🏆';
  else if (leagueRank <= 2 && isPro && player.leagueTier === 2) leagueStatus = 'Promoted 🚀';
  else if (leagueRank <= 4 && isPro) leagueStatus = 'Continental Qualified ⭐';
  else if (leagueRank >= 9 && isPro) leagueStatus = 'Relegation Zone ⚠️';
  else if (leagueRank <= 2 && !isPro) leagueStatus = "Int'l Cup Qualified ⭐";

  // Continental Cup / International Youth Cup Resolution
  let continentalCup: { name: string; roundReached: string; isWinner: boolean } | undefined = undefined;

  if (isPro) {
    const isContinentalQualified = Boolean(playerStanding?.qualifiedContinental) || (player.leagueTier === 1 && leagueRank <= 4);
    if (isContinentalQualified || tournamentFinish) {
      const contName = (isBra || isArg) ? 'Copa Libertadores' : 'UEFA Champions League';
      continentalCup = {
        name: contName,
        roundReached: tournamentFinish || (isChampion ? 'Champions 🏆' : 'Round of 16'),
        isWinner: tournamentFinish ? (tournamentFinish.includes('Champion') || tournamentFinish.includes('Winner')) : false,
      };
    }
  } else {
    // For Youth Players: Only International Youth Cup exists, and ONLY if qualified/participated
    if (tournamentFinish) {
      continentalCup = {
        name: 'International Youth Cup (32 Clubs)',
        roundReached: tournamentFinish,
        isWinner: tournamentFinish.includes('Champion') || tournamentFinish.includes('Winner'),
      };
    }
  }

  // Domestic Cup Resolution
  let domesticCup: { name: string; roundReached: string; isWinner: boolean } | undefined = undefined;
  if (isPro) {
    const cupName = isEng ? 'FA Cup' : isEsp ? 'Copa del Rey' : isBra ? 'Copa do Brasil' : isArg ? 'Copa Argentina' : 'Domestic Cup';
    domesticCup = {
      name: cupName,
      roundReached: isCupWinner ? 'Champions 🏆' : isChampion ? 'Final 🥈' : 'Semi-Final',
      isWinner: isCupWinner,
    };
  } else if (isCupWinner) {
    domesticCup = {
      name: 'Youth Academy Cup',
      roundReached: 'Champions 🏆',
      isWinner: true,
    };
  }

  return {
    league: {
      name: isPro ? (player.league || 'First Division') : leagueName,
      rank: leagueRank,
      points: playerStanding?.points || 42,
      played: 18,
      won: playerStanding?.won || 12,
      drawn: playerStanding?.drawn || 3,
      lost: playerStanding?.lost || 3,
      goalDifference: playerStanding?.goalDifference || 18,
      status: leagueStatus,
    },
    domesticCup,
    continentalCup,
    nationalTeam: (Boolean((player as any).nationalTeam) || (typeof player.internationalCaps === 'number' && player.internationalCaps > 0))
      ? {
          teamName: `${player.nationality?.name || player.country || 'National'} Team`,
          competitionName: 'World Cup Qualifiers',
          roundOrStatus: '1st Place - Qualified for World Cup',
          matchesPlayed: player.internationalCaps || 4,
          goals: player.internationalGoals || 2,
          assists: 1,
          isWinner: true,
        }
      : undefined,
  };
}

/**
 * Calculates individual award objects (MVP, Top Goalscorer, Top Assist, Championship) for the season summary
 */
export function calculateIndividualAwardsWon(
  player: PlayerCardData,
  seasonAwards: YouthSeasonAwards | null | undefined,
  leaderboards: SeasonLeaderboards,
  avgRating: number,
  isChampion: boolean,
  leagueName: string,
  goalsCount: number = 0,
  assistsCount: number = 0,
  isPro: boolean = false
): IndividualAwardItem[] {
  const awards: IndividualAwardItem[] = [];

  const wonTopScorer = isPro
    ? (leaderboards.playerGoalRank === 1 || Boolean(seasonAwards?.topScorer))
    : (goalsCount >= 15 || Boolean(seasonAwards?.topScorer));

  if (wonTopScorer) {
    awards.push({
      id: 'golden_boot',
      name: isPro ? 'Golden Boot (Top Goalscorer) ⚽' : 'Top Goalscorer ⚽',
      category: 'top_scorer',
      icon: '⚽',
      description: isPro
        ? `Finished #1 in the goalscoring charts with ${leaderboards.topScorers[0]?.value || goalsCount} goals!`
        : `Led the youth division scoring charts with ${goalsCount} goals!`,
      competitionName: leagueName,
    });
  }

  const wonTopAssist = isPro
    ? (leaderboards.playerAssistRank === 1 || Boolean(seasonAwards?.topAssist))
    : (assistsCount >= 15 || Boolean(seasonAwards?.topAssist));

  if (wonTopAssist) {
    awards.push({
      id: 'top_playmaker',
      name: isPro ? 'Playmaker of the Year (Top Assists) 🎯' : 'Top Assist Provider 🎯',
      category: 'top_assist',
      icon: '🎯',
      description: isPro
        ? `Provided the most assists in the competition (${leaderboards.topAssists[0]?.value || assistsCount} assists)!`
        : `Created the most chances in the youth league with ${assistsCount} assists!`,
      competitionName: leagueName,
    });
  }

  const wonMvp = isPro
    ? (Boolean(seasonAwards?.bestPlayer) || (avgRating >= 7.8 && leaderboards.playerGoalRank && leaderboards.playerGoalRank <= 3))
    : (avgRating >= 7.5 || Boolean(seasonAwards?.bestPlayer));

  if (wonMvp) {
    awards.push({
      id: 'season_mvp',
      name: 'Player of the Season (MVP) 🏆',
      category: 'mvp',
      icon: '⭐',
      description: isPro
        ? `Voted overall Most Valuable Player with a stellar ${avgRating} average match rating.`
        : `Awarded Most Valuable Player of the Youth League with an outstanding ${avgRating} average rating.`,
      competitionName: leagueName,
    });
  }

  if (isChampion) {
    awards.push({
      id: 'champion_medal',
      name: 'Championship Winner Gold Medal 🥇',
      category: 'championship',
      icon: '🥇',
      description: `Finished 1st place in the standings to lift the ${leagueName} trophy!`,
      competitionName: leagueName,
    });
  }

  return awards;
}
