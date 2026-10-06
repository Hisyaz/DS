import { PlayerConfig } from '../types';
import {
  FederationName,
  InternationalYouthClub,
  YouthLeagueStanding,
  GroupStageGroup,
  KnockoutStageMatch,
  TournamentMatch,
} from '../types/youthLeague';
import { YOUTH_LEAGUES_DATABASE } from '../data/youthLeaguesDatabase';
import { FEDERATION_CLUB_POOLS, createRepresentativePlayers } from '../data/internationalYouthPool';

export interface FullInternationalYouthCupData {
  all32Clubs: InternationalYouthClub[];
  groups: GroupStageGroup[];
  playerGroup: GroupStageGroup;
  playerGroupRank: number;
  playerGroupQualified: boolean;
  knockoutMatches: KnockoutStageMatch[];
  playerStageMatches: TournamentMatch[];
  isQuarterFinalWinner: boolean;
  quarterOpponent: InternationalYouthClub;
  semiOpponent: InternationalYouthClub;
  finalOpponent: InternationalYouthClub;
  thirdPlaceOpponent: InternationalYouthClub;
  playerGroupNonPlayerMatches?: { teamAId: string; teamBId: string; gA: number; gB: number; round: number }[];
}

/**
 * Generates the 32 clubs for the International Youth Cup.
 */
export function generate32ClubsForCup(
  player: PlayerConfig,
  playerLeagueStandings?: YouthLeagueStanding[]
): InternationalYouthClub[] {
  const age = Math.min(16, player.age || 10);
  const playerClubName = player.club || 'Kensington United';
  const playerCity = player.city || player.startingCity || 'London';

  // 1. Calculate Baseline Youth League OVR
  const baseYouthLeagueOvr = Math.min(80, 45 + (age - 10) * 3);

  const all32Clubs: InternationalYouthClub[] = [];

  // 2. Extract 10 Youth League Qualifying Teams (Top 2 from each of the 5 Youth Leagues)
  const youthLeagueKeys = Object.keys(YOUTH_LEAGUES_DATABASE);

  youthLeagueKeys.forEach((lKey) => {
    const league = YOUTH_LEAGUES_DATABASE[lKey];

    let top2Names: string[] = [];
    if (
      playerLeagueStandings &&
      (league.city.toLowerCase().includes(playerCity.toLowerCase()) ||
        playerCity.toLowerCase().includes(league.city.toLowerCase()))
    ) {
      // Use actual simulated standings for player's league
      top2Names = playerLeagueStandings.filter((s) => s.rank <= 2).map((s) => s.teamName);
    }

    if (top2Names.length < 2) {
      // Use top 2 OVR teams for other leagues or fallback
      const sortedTeams = [...league.teams].sort((a, b) => b.ovr - a.ovr);
      top2Names = sortedTeams.slice(0, 2).map((t) => t.name);
    }

    top2Names.forEach((tName) => {
      const isPlayer = tName.toLowerCase() === playerClubName.toLowerCase();

      // Team OVR calculation
      let teamOvr = isPlayer ? (player.ovr || 60) : baseYouthLeagueOvr + Math.floor(Math.random() * 5) - 2;
      teamOvr = Math.max(35, Math.min(99, teamOvr));

      const attOvr = teamOvr + (Math.floor(Math.random() * 3) - 1);
      const midOvr = teamOvr + (Math.floor(Math.random() * 3) - 1);
      const defOvr = teamOvr + (Math.floor(Math.random() * 3) - 1);

      let federation: FederationName = 'UEFA';
      if (league.country === 'Argentina' || league.country === 'Brazil') federation = 'CONMEBOL';

      const reps = createRepresentativePlayers(tName, league.country, teamOvr, attOvr, midOvr, defOvr);

      all32Clubs.push({
        id: `yl-${tName.toLowerCase().replace(/\s+/g, '-')}`,
        name: tName,
        country: league.country,
        federation,
        flag: league.flag,
        primaryColor: isPlayer ? '#f59e0b' : '#3b82f6',
        secondaryColor: '#ffffff',
        preferredFormation: '4-3-3',
        teamOvr,
        attOvr,
        midOvr,
        defOvr,
        representativePlayers: reps,
        sourceType: 'youth_league',
      });
    });
  });

  // 3. Draw 22 International Federation Pool Clubs
  const fedRequirements: { fed: FederationName; count: number; ovrMinMod: number; ovrMaxMod: number }[] = [
    { fed: 'UEFA', count: 10, ovrMinMod: 5, ovrMaxMod: 10 },
    { fed: 'CONMEBOL', count: 4, ovrMinMod: 1, ovrMaxMod: 5 },
    { fed: 'CAF', count: 3, ovrMinMod: 1, ovrMaxMod: 5 },
    { fed: 'AFC', count: 3, ovrMinMod: -3, ovrMaxMod: -1 },
    { fed: 'OFC', count: 1, ovrMinMod: -10, ovrMaxMod: -5 },
    { fed: 'CONCACAF', count: 1, ovrMinMod: -1, ovrMaxMod: 2 },
  ];

  fedRequirements.forEach(({ fed, count, ovrMinMod, ovrMaxMod }) => {
    const pool = [...FEDERATION_CLUB_POOLS[fed]];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const selectedTemplates = pool.slice(0, count);

    selectedTemplates.forEach((tmpl) => {
      const mod = Math.floor(Math.random() * (ovrMaxMod - ovrMinMod + 1)) + ovrMinMod;
      const teamOvr = Math.max(30, Math.min(99, baseYouthLeagueOvr + mod));

      const attOvr = Math.max(30, teamOvr + (Math.floor(Math.random() * 5) - 2));
      const midOvr = Math.max(30, teamOvr + (Math.floor(Math.random() * 5) - 2));
      const defOvr = Math.max(30, teamOvr + (Math.floor(Math.random() * 5) - 2));

      const reps = createRepresentativePlayers(tmpl.name, tmpl.country, teamOvr, attOvr, midOvr, defOvr);

      all32Clubs.push({
        id: tmpl.id,
        name: tmpl.name,
        country: tmpl.country,
        federation: tmpl.federation,
        flag: tmpl.flag,
        primaryColor: tmpl.primaryColor,
        secondaryColor: tmpl.secondaryColor,
        preferredFormation: tmpl.preferredFormation,
        teamOvr,
        attOvr,
        midOvr,
        defOvr,
        representativePlayers: reps,
        sourceType: 'federation_pool',
      });
    });
  });

  // Ensure player's club is present in all32Clubs
  let playerClub = all32Clubs.find((c) => c.name.toLowerCase() === playerClubName.toLowerCase());

  if (!playerClub) {
    const natName = player.nationality?.name || 'England';
    const flagIso = player.nationality?.iso ? `https://flagcdn.com/w40/${player.nationality.iso.toLowerCase()}.png` : '🇬🇧';
    playerClub = {
      id: `yl-${playerClubName.toLowerCase().replace(/\s+/g, '-')}`,
      name: playerClubName,
      country: natName,
      federation: 'UEFA',
      flag: flagIso,
      primaryColor: '#f59e0b',
      secondaryColor: '#ffffff',
      preferredFormation: '4-3-3',
      teamOvr: Math.max(35, Math.min(99, player.ovr || 60)),
      attOvr: Math.max(35, Math.min(99, (player.ovr || 60) + 1)),
      midOvr: Math.max(35, Math.min(99, player.ovr || 60)),
      defOvr: Math.max(35, Math.min(99, (player.ovr || 60) - 1)),
      representativePlayers: createRepresentativePlayers(
        playerClubName,
        natName,
        player.ovr || 60,
        player.ovr || 60,
        player.ovr || 60,
        player.ovr || 60
      ),
      sourceType: 'youth_league',
    };
    all32Clubs[0] = playerClub;
  } else {
    playerClub.primaryColor = '#f59e0b';
    playerClub.teamOvr = Math.max(35, Math.min(99, player.ovr || 60));
  }

  return all32Clubs;
}

/**
 * Draws 32 clubs into 8 Groups of 4 (Groups A-H) with constraints:
 * - Max 2 UEFA teams per group.
 * - Max 1 team per other association (CONMEBOL, CAF, AFC, CONCACAF, OFC) per group.
 */
export function drawConstrainedGroups(all32Clubs: InternationalYouthClub[]): GroupStageGroup[] {
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  for (let attempt = 0; attempt < 500; attempt++) {
    const shuffled = [...all32Clubs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const tempGroups = groupLetters.map((letter) => ({
      groupName: `Group ${letter}`,
      teams: [] as InternationalYouthClub[],
      standings: [],
    }));

    let valid = true;

    for (const club of shuffled) {
      const validIndices: number[] = [];

      tempGroups.forEach((g, idx) => {
        if (g.teams.length >= 4) return;

        if (club.federation === 'UEFA') {
          const uefaCount = g.teams.filter((t) => t.federation === 'UEFA').length;
          if (uefaCount >= 2) return; // Max 2 UEFA
        } else {
          const sameFedCount = g.teams.filter((t) => t.federation === club.federation).length;
          if (sameFedCount >= 1) return; // Max 1 for non-UEFA
        }

        validIndices.push(idx);
      });

      if (validIndices.length === 0) {
        valid = false;
        break;
      }

      const chosenIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
      tempGroups[chosenIdx].teams.push(club);
    }

    if (valid && tempGroups.every((g) => g.teams.length === 4)) {
      return tempGroups;
    }
  }

  // Fallback if random shuffle gets blocked
  return groupLetters.map((letter, i) => ({
    groupName: `Group ${letter}`,
    teams: all32Clubs.slice(i * 4, (i + 1) * 4),
    standings: [],
  }));
}

/**
 * Simulates group matches and knockouts for pre-drawn groups.
 */
export function simulateGroupStageMatches(
  player: PlayerConfig,
  groups: GroupStageGroup[],
  all32Clubs: InternationalYouthClub[]
): FullInternationalYouthCupData {
  const playerClubName = player.club || 'Kensington United';
  const playerClub = all32Clubs.find((c) => c.name.toLowerCase() === playerClubName.toLowerCase()) || all32Clubs[0];

  let playerGroupNonPlayerMatches: { teamAId: string; teamBId: string; gA: number; gB: number; round: number }[] = [];

  const simulatedGroups: GroupStageGroup[] = groups.map((group) => {
    const groupTeams = group.teams;
    const isPlayerGroup = groupTeams.some(
      (t) => t.id === playerClub.id || t.name.toLowerCase() === playerClubName.toLowerCase()
    );

    if (isPlayerGroup) {
      // For player group, generate non-player matches for rounds 1, 2, 3
      const pTeam =
        groupTeams.find((t) => t.id === playerClub.id || t.name.toLowerCase() === playerClubName.toLowerCase()) ||
        groupTeams[0];
      const opponents = groupTeams.filter((t) => t.id !== pTeam.id);
      const o1 = opponents[0];
      const o2 = opponents[1];
      const o3 = opponents[2];

      const simMatch = (tA: InternationalYouthClub, tB: InternationalYouthClub, round: number) => {
        const probA = 0.5 + (tA.teamOvr - tB.teamOvr) * 0.04;
        const roll = Math.random();
        let gA = 0;
        let gB = 0;
        if (roll < probA - 0.08) {
          gA = Math.floor(Math.random() * 3) + 1;
          gB = Math.floor(Math.random() * gA);
        } else if (roll < probA + 0.12) {
          gA = Math.floor(Math.random() * 3);
          gB = gA;
        } else {
          gB = Math.floor(Math.random() * 3) + 1;
          gA = Math.floor(Math.random() * gB);
        }
        return { teamAId: tA.id, teamBId: tB.id, gA, gB, round };
      };

      if (o1 && o2 && o3) {
        playerGroupNonPlayerMatches = [
          simMatch(o2, o3, 1),
          simMatch(o1, o3, 2),
          simMatch(o1, o2, 3),
        ];
      }

      // Initial standings for player group (0 matches played before live matches)
      const initialStandings = groupTeams.map((gt) => ({
        clubId: gt.id,
        clubName: gt.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      }));

      return {
        groupName: group.groupName,
        teams: groupTeams,
        standings: initialStandings,
      };
    }

    // Non-player groups: simulate all group matches
    const groupStandingsMap = new Map<
      string,
      {
        clubId: string;
        clubName: string;
        played: number;
        won: number;
        drawn: number;
        lost: number;
        gf: number;
        ga: number;
        gd: number;
        points: number;
      }
    >();

    groupTeams.forEach((gt) => {
      groupStandingsMap.set(gt.id, {
        clubId: gt.id,
        clubName: gt.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      });
    });

    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        const teamA = groupTeams[i];
        const teamB = groupTeams[j];

        const ovrA = teamA.teamOvr;
        const ovrB = teamB.teamOvr;

        const probA = 0.5 + (ovrA - ovrB) * 0.04;
        const roll = Math.random();

        let gA = 0;
        let gB = 0;

        if (roll < probA - 0.08) {
          gA = Math.floor(Math.random() * 3) + 1;
          gB = Math.floor(Math.random() * gA);
        } else if (roll < probA + 0.12) {
          gA = Math.floor(Math.random() * 3);
          gB = gA;
        } else {
          gB = Math.floor(Math.random() * 3) + 1;
          gA = Math.floor(Math.random() * gB);
        }

        const sA = groupStandingsMap.get(teamA.id);
        const sB = groupStandingsMap.get(teamB.id);

        if (sA && sB) {
          sA.played += 1;
          sB.played += 1;
          sA.gf += gA;
          sA.ga += gB;
          sA.gd = sA.gf - sA.ga;
          sB.gf += gB;
          sB.ga += gA;
          sB.gd = sB.gf - sB.ga;

          if (gA > gB) {
            sA.won += 1;
            sA.points += 3;
            sB.lost += 1;
          } else if (gA < gB) {
            sB.won += 1;
            sB.points += 3;
            sA.lost += 1;
          } else {
            sA.drawn += 1;
            sA.points += 1;
            sB.drawn += 1;
            sB.points += 1;
          }
        }
      }
    }

    const sortedStandings = Array.from(groupStandingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    return {
      groupName: group.groupName,
      teams: groupTeams,
      standings: sortedStandings,
    };
  });

  const playerGroup =
    simulatedGroups.find((g) =>
      g.teams.some((t) => t.id === playerClub.id || t.name.toLowerCase() === playerClubName.toLowerCase())
    ) || simulatedGroups[0];

  const playerInGroupStandings = playerGroup.standings.findIndex(
    (s) => s.clubId === playerClub.id || s.clubName.toLowerCase() === playerClubName.toLowerCase()
  );
  const playerGroupRank = playerInGroupStandings >= 0 ? playerInGroupStandings + 1 : 1;
  const playerGroupQualified = true; // Pending live match completion

  // Select Knockout Stage Opponents
  const nonPlayerClubs = all32Clubs
    .filter((c) => c.id !== playerClub.id && c.name.toLowerCase() !== playerClubName.toLowerCase())
    .sort((a, b) => b.teamOvr - a.teamOvr);

  const quarterOpponent = nonPlayerClubs[0] || {
    id: 'opp-qf',
    name: 'FC Barcelona Youth',
    country: 'Spain',
    federation: 'UEFA',
    flag: '🇪🇸',
    primaryColor: '#004d98',
    secondaryColor: '#a50044',
    preferredFormation: '4-3-3',
    teamOvr: 68,
    attOvr: 70,
    midOvr: 68,
    defOvr: 66,
    representativePlayers: [],
    sourceType: 'federation_pool',
  };

  const semiOpponent = nonPlayerClubs[1] || {
    id: 'opp-sf',
    name: 'Real Madrid Youth',
    country: 'Spain',
    federation: 'UEFA',
    flag: '🇪🇸',
    primaryColor: '#ffffff',
    secondaryColor: '#febe10',
    preferredFormation: '4-3-3',
    teamOvr: 70,
    attOvr: 72,
    midOvr: 70,
    defOvr: 68,
    representativePlayers: [],
    sourceType: 'federation_pool',
  };

  const finalOpponent = nonPlayerClubs[2] || {
    id: 'opp-fn',
    name: 'Flamengo Youth',
    country: 'Brazil',
    federation: 'CONMEBOL',
    flag: '🇧🇷',
    primaryColor: '#c1272d',
    secondaryColor: '#000000',
    preferredFormation: '4-3-3',
    teamOvr: 72,
    attOvr: 74,
    midOvr: 72,
    defOvr: 70,
    representativePlayers: [],
    sourceType: 'federation_pool',
  };

  const thirdPlaceOpponent = nonPlayerClubs[3] || {
    id: 'opp-3rd',
    name: 'Bayern Munich Youth',
    country: 'Germany',
    federation: 'UEFA',
    flag: '🇩🇪',
    primaryColor: '#dc052d',
    secondaryColor: '#0066b2',
    preferredFormation: '4-3-3',
    teamOvr: 67,
    attOvr: 68,
    midOvr: 67,
    defOvr: 66,
    representativePlayers: [],
    sourceType: 'federation_pool',
  };

  const groupOpponents = playerGroup.teams.filter((t) => t.name.toLowerCase() !== playerClubName.toLowerCase());
  const opp1 = groupOpponents[0] || quarterOpponent;
  const opp2 = groupOpponents[1] || semiOpponent;
  const opp3 = groupOpponents[2] || thirdPlaceOpponent;

  const playerStageMatches: TournamentMatch[] = [
    {
      matchId: 'int-32-g1',
      stageName: 'Group Stage Match 1',
      opponentName: opp1.name,
      opponentOvr: opp1.teamOvr,
      teamScore: 2,
      opponentScore: 1,
      playerGoals: 1,
      playerAssists: 1,
      playerRating: 8.2,
      isWinner: true,
    },
    {
      matchId: 'int-32-g2',
      stageName: 'Group Stage Match 2',
      opponentName: opp2.name,
      opponentOvr: opp2.teamOvr,
      teamScore: 1,
      opponentScore: 1,
      playerGoals: 1,
      playerAssists: 0,
      playerRating: 7.5,
      isWinner: true,
    },
    {
      matchId: 'int-32-g3',
      stageName: 'Group Stage Match 3',
      opponentName: opp3.name,
      opponentOvr: opp3.teamOvr,
      teamScore: 3,
      opponentScore: 0,
      playerGoals: 2,
      playerAssists: 0,
      playerRating: 8.8,
      isWinner: true,
    },
  ];

  return {
    all32Clubs,
    groups: simulatedGroups,
    playerGroup,
    playerGroupRank,
    playerGroupQualified,
    knockoutMatches: [],
    playerStageMatches,
    isQuarterFinalWinner: true,
    quarterOpponent,
    semiOpponent,
    finalOpponent,
    thirdPlaceOpponent,
    playerGroupNonPlayerMatches,
  };
}

export interface NonQualifiedCupSummary {
  champion: InternationalYouthClub;
  runnerUp: InternationalYouthClub;
  score: string;
}

/**
 * Generates a random champion from the 32-team pool for a year when player did not qualify.
 */
export function generateNonQualifiedCupChampion(player: PlayerConfig): NonQualifiedCupSummary {
  const all32 = generate32ClubsForCup(player);
  const sorted = [...all32].sort((a, b) => b.teamOvr - a.teamOvr);

  // Pick random champion from top 8 contenders
  const champIdx = Math.floor(Math.random() * Math.min(8, sorted.length));
  const champion = sorted[champIdx];

  const remaining = sorted.filter((c) => c.id !== champion.id);
  const runnerUpIdx = Math.floor(Math.random() * Math.min(8, remaining.length));
  const runnerUp = remaining[runnerUpIdx];

  const cGoals = Math.floor(Math.random() * 3) + 1;
  const rGoals = Math.floor(Math.random() * cGoals);
  const score = `${cGoals} - ${rGoals}`;

  return { champion, runnerUp, score };
}

/**
 * Builds and simulates the 32-team International Youth Cup.
 * Combines 10 Youth League top qualifiers with 22 Federation Pool clubs.
 */
export function buildInternationalYouthCup32(
  player: PlayerConfig,
  playerLeagueStandings?: YouthLeagueStanding[]
): FullInternationalYouthCupData {
  const all32Clubs = generate32ClubsForCup(player, playerLeagueStandings);
  const constrainedGroups = drawConstrainedGroups(all32Clubs);
  return simulateGroupStageMatches(player, constrainedGroups, all32Clubs);
}
