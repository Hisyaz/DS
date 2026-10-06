import { PlayerConfig } from '../types';
import { YouthSeasonStats, YouthLeagueStanding } from '../types/youthLeague';
import { YOUTH_LEAGUES_DATABASE, getYouthLeagueByCity } from '../data/youthLeaguesDatabase';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { simulateFullProfessionalLeague } from './professionalLeagueEngine';

/**
 * Simulates a full Youth or Pro League season for the teams in the player's league.
 * For professional players, delegates to the authentic national professional league simulator.
 */
export function simulateFullYouthLeagueStandings(
  player: PlayerConfig,
  playerStats: YouthSeasonStats
): {
  standings: YouthLeagueStanding[];
  playerTeamStanding: YouthLeagueStanding;
  playerTeamQualified: boolean;
  leagueName: string;
} {
  const isPro = isProfessionalPlayer(player) || (player.age || 10) >= 16;

  if (isPro) {
    const proSim = simulateFullProfessionalLeague(player, playerStats);
    return {
      standings: proSim.standings,
      playerTeamStanding: proSim.playerTeamStanding,
      playerTeamQualified: false, // Professional leagues never qualify for youth cup
      leagueName: proSim.leagueName,
    };
  }

  const playerClubName = player.club || 'Youth Academy Club';
  const city = player.city || 'London';
  const leagueData = getYouthLeagueByCity(city) || YOUTH_LEAGUES_DATABASE.london;
  const leagueName = leagueData.name;
  let teams = leagueData.teams.map((t) => ({ id: t.id, name: t.name, ovr: t.ovr }));

  if (!teams.some((t) => t.name.toLowerCase() === playerClubName.toLowerCase())) {
    teams[0] = { ...teams[0], name: playerClubName };
  }

  const age = player.age || 10;
  const ageMultiplier = 1 + (age - 10) * 0.05;

  // Calculate team strengths
  const teamRatingsMap = new Map<string, number>();

  teams.forEach((t) => {
    let effectiveOvr = Math.round(t.ovr * ageMultiplier);
    const isMyTeam = t.name.toLowerCase() === playerClubName.toLowerCase();

    if (isMyTeam) {
      const playerOvr = player.ovr || 60;
      const playerContrib = (playerStats.avgRating - 6.0) * 2 + (playerStats.goals * 0.5) + (playerStats.assists * 0.3);
      effectiveOvr = Math.round((effectiveOvr * 0.7) + (playerOvr * 0.3) + playerContrib);
    } else {
      effectiveOvr += Math.floor(Math.random() * 7) - 3;
    }

    teamRatingsMap.set(t.id, Math.max(35, Math.min(99, effectiveOvr)));
  });

  // Track match results per team
  const statsMap = new Map<
    string,
    { teamId: string; teamName: string; W: number; D: number; L: number; GF: number; GA: number; pts: number; isPlayer: boolean; teamOvr: number }
  >();

  teams.forEach((t) => {
    statsMap.set(t.id, {
      teamId: t.id,
      teamName: t.name,
      W: 0,
      D: 0,
      L: 0,
      GF: 0,
      GA: 0,
      pts: 0,
      isPlayer: t.name.toLowerCase() === playerClubName.toLowerCase(),
      teamOvr: teamRatingsMap.get(t.id) || 45,
    });
  });

  // Double Round-Robin Simulation (18 matches total per team, 9 home / 9 away)
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const teamA = teams[i];
      const teamB = teams[j];

      // Simulate 2 legs (Home and Away)
      for (let leg = 0; leg < 2; leg++) {
        const homeTeam = leg === 0 ? teamA : teamB;
        const awayTeam = leg === 0 ? teamB : teamA;

        const homeOvr = (teamRatingsMap.get(homeTeam.id) || 45) + 3; // +3 Home advantage
        const awayOvr = teamRatingsMap.get(awayTeam.id) || 45;

        // Success ratio
        const winProbHome = 0.45 + (homeOvr - awayOvr) * 0.03;
        const roll = Math.random();

        let homeGoals = 0;
        let awayGoals = 0;

        if (roll < winProbHome - 0.1) {
          homeGoals = Math.floor(Math.random() * 3) + 1;
          awayGoals = Math.floor(Math.random() * homeGoals);
        } else if (roll < winProbHome + 0.15) {
          homeGoals = Math.floor(Math.random() * 3);
          awayGoals = homeGoals;
        } else {
          awayGoals = Math.floor(Math.random() * 3) + 1;
          homeGoals = Math.floor(Math.random() * awayGoals);
        }

        const homeStat = statsMap.get(homeTeam.id);
        const awayStat = statsMap.get(awayTeam.id);

        if (homeStat && awayStat) {
          homeStat.GF += homeGoals;
          homeStat.GA += awayGoals;
          awayStat.GF += awayGoals;
          awayStat.GA += homeGoals;

          if (homeGoals > awayGoals) {
            homeStat.W += 1;
            homeStat.pts += 3;
            awayStat.L += 1;
          } else if (homeGoals < awayGoals) {
            awayStat.W += 1;
            awayStat.pts += 3;
            homeStat.L += 1;
          } else {
            homeStat.D += 1;
            homeStat.pts += 1;
            awayStat.D += 1;
            awayStat.pts += 1;
          }
        }
      }
    }
  }

  // Convert to array and sort by Points desc, Goal Difference desc, Goals For desc
  const sorted = Array.from(statsMap.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.GF - a.GA;
    const gdB = b.GF - b.GA;
    if (gdB !== gdA) return gdB - gdA;
    return b.GF - a.GF;
  });

  // Assign ranks and top 2 qualification
  const standings: YouthLeagueStanding[] = sorted.map((s, idx) => {
    const rank = idx + 1;
    const qualifiedForIntCup = rank <= 2;

    return {
      rank,
      teamId: s.teamId,
      teamName: s.teamName,
      played: s.W + s.D + s.L,
      won: s.W,
      drawn: s.D,
      lost: s.L,
      goalsFor: s.GF,
      goalsAgainst: s.GA,
      goalDifference: s.GF - s.GA,
      points: s.pts,
      isPlayerTeam: s.isPlayer,
      qualifiedForIntCup,
      teamOvr: s.teamOvr,
      qualificationBadge: qualifiedForIntCup
        ? {
            type: 'youth_intl_cup',
            label: "Int'l Youth Cup",
            shortLabel: "Int'l Youth Cup",
            badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
            iconName: 'trophy',
          }
        : {
            type: 'none',
            label: 'Youth League',
            shortLabel: 'Youth League',
            badgeClass: 'bg-slate-800/50 text-slate-500 border-slate-700/50',
            iconName: 'shield',
          },
      qualificationText: qualifiedForIntCup ? "Int'l Youth Cup" : 'Youth League',
    };
  });

  const playerTeamStanding = standings.find((s) => s.isPlayerTeam) || standings[0];

  return {
    standings,
    playerTeamStanding,
    playerTeamQualified: playerTeamStanding.qualifiedForIntCup,
    leagueName,
  };
}
