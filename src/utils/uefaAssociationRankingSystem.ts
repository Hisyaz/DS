/**
 * UEFA-STYLE ASSOCIATION RANKING & COEFFICIENT SYSTEM
 * 
 * Dynamically computes UEFA association rankings and European Golden Shoe coefficients
 * based on European competition performances and historical association seeds.
 * 
 * Rules:
 * - Association ranks 1–5:  2.0 points per domestic league goal.
 * - Association ranks 6–22: 1.5 points per domestic league goal.
 * - Association ranks 23+:  1.0 point per domestic league goal.
 * - Non-European leagues:   0.0 (Not eligible for European Golden Shoe).
 * 
 * Dynamic: Does NOT permanently hardcode rankings. As clubs perform in UEFA
 * competitions (UCL, UEL, UECL), their country's association points shift,
 * and the ranking dynamically updates.
 */

import { LeagueDatabase, LeagueData } from '../types/leagueEditor';
import { WorldSimulationState, getWorldSimulationState } from './worldSimulationEngine';
import { EuropeanGoldenShoeEntry } from '../types/individualAwards';
import { PlayerCardData } from '../types';
import { isPlayerInProClub } from './worldSimulationEngine';
import { isProfessionalPlayer } from './playerIdentitySystem';

export interface UefaAssociationRankEntry {
  rank: number;
  countryCode: string;
  countryName: string;
  basePoints: number;
  seasonPoints: number;
  totalPoints: number;
  coefficient: number; // 2.0, 1.5, or 1.0
  clubsInEuropeCount: number;
}

/**
 * Base 5-year rolling coefficient seeds for European associations.
 * Refreshed dynamically by seasonal European competition match results.
 */
const BASE_EUROPEAN_ASSOCIATION_SEEDS: { countryCode: string; countryName: string; basePoints: number; clubsCount: number }[] = [
  { countryCode: 'ENG', countryName: 'England', basePoints: 89.5, clubsCount: 7 },
  { countryCode: 'ESP', countryName: 'Spain', basePoints: 84.0, clubsCount: 7 },
  { countryCode: 'ITA', countryName: 'Italy', basePoints: 82.5, clubsCount: 7 },
  { countryCode: 'GER', countryName: 'Germany', basePoints: 79.5, clubsCount: 7 },
  { countryCode: 'FRA', countryName: 'France', basePoints: 67.0, clubsCount: 6 },
  { countryCode: 'NED', countryName: 'Netherlands', basePoints: 61.5, clubsCount: 5 },
  { countryCode: 'POR', countryName: 'Portugal', basePoints: 59.5, clubsCount: 5 },
  { countryCode: 'BEL', countryName: 'Belgium', basePoints: 51.0, clubsCount: 5 },
  { countryCode: 'TUR', countryName: 'Turkey', basePoints: 42.5, clubsCount: 4 },
  { countryCode: 'CZE', countryName: 'Czech Republic', basePoints: 40.5, clubsCount: 4 },
  { countryCode: 'SCO', countryName: 'Scotland', basePoints: 37.5, clubsCount: 4 },
  { countryCode: 'AUT', countryName: 'Austria', basePoints: 35.5, clubsCount: 4 },
  { countryCode: 'NOR', countryName: 'Norway', basePoints: 34.5, clubsCount: 4 },
  { countryCode: 'GRE', countryName: 'Greece', basePoints: 33.5, clubsCount: 4 },
  { countryCode: 'DEN', countryName: 'Denmark', basePoints: 32.5, clubsCount: 4 },
  { countryCode: 'SUI', countryName: 'Switzerland', basePoints: 31.5, clubsCount: 4 },
  { countryCode: 'POL', countryName: 'Poland', basePoints: 29.5, clubsCount: 4 },
  { countryCode: 'CRO', countryName: 'Croatia', basePoints: 27.5, clubsCount: 4 },
  { countryCode: 'SWE', countryName: 'Sweden', basePoints: 25.5, clubsCount: 4 },
  { countryCode: 'CYP', countryName: 'Cyprus', basePoints: 23.5, clubsCount: 4 },
  { countryCode: 'HUN', countryName: 'Hungary', basePoints: 22.5, clubsCount: 4 },
  { countryCode: 'SRB', countryName: 'Serbia', basePoints: 21.5, clubsCount: 4 },
  { countryCode: 'UKR', countryName: 'Ukraine', basePoints: 20.0, clubsCount: 4 },
  { countryCode: 'ROU', countryName: 'Romania', basePoints: 18.5, clubsCount: 4 },
  { countryCode: 'BUL', countryName: 'Bulgaria', basePoints: 17.0, clubsCount: 4 },
  { countryCode: 'SVK', countryName: 'Slovakia', basePoints: 16.0, clubsCount: 3 },
  { countryCode: 'SVN', countryName: 'Slovenia', basePoints: 15.0, clubsCount: 3 },
  { countryCode: 'IRL', countryName: 'Republic of Ireland', basePoints: 13.5, clubsCount: 3 },
  { countryCode: 'FIN', countryName: 'Finland', basePoints: 12.0, clubsCount: 3 },
  { countryCode: 'NIR', countryName: 'Northern Ireland', basePoints: 10.5, clubsCount: 3 },
  { countryCode: 'WAL', countryName: 'Wales', basePoints: 9.5, clubsCount: 3 },
  { countryCode: 'ISL', countryName: 'Iceland', basePoints: 9.0, clubsCount: 3 },
];

/**
 * Mapping of club IDs or team names to their country association.
 */
function getClubCountryAssociation(clubIdOrName: string): string {
  const c = clubIdOrName.toLowerCase();
  if (c.startsWith('eng_') || c.includes('man city') || c.includes('arsenal') || c.includes('liverpool') || c.includes('chelsea') || c.includes('tottenham') || c.includes('manchester united') || c.includes('aston villa') || c.includes('newcastle')) return 'ENG';
  if (c.startsWith('esp_') || c.includes('real madrid') || c.includes('barcelona') || c.includes('atletico') || c.includes('sociedad') || c.includes('villarreal') || c.includes('athletic')) return 'ESP';
  if (c.startsWith('ita_') || c.includes('inter') || c.includes('milan') || c.includes('juventus') || c.includes('atalanta') || c.includes('roma') || c.includes('napoli') || c.includes('lazio')) return 'ITA';
  if (c.startsWith('ger_') || c.includes('bayern') || c.includes('dortmund') || c.includes('leverkusen') || c.includes('leipzig') || c.includes('stuttgart') || c.includes('frankfurt')) return 'GER';
  if (c.startsWith('fra_') || c.includes('psg') || c.includes('paris') || c.includes('monaco') || c.includes('lille') || c.includes('marseille') || c.includes('lyon') || c.includes('brest')) return 'FRA';
  if (c.startsWith('por_') || c.includes('benfica') || c.includes('sporting') || c.includes('porto') || c.includes('braga') || c.includes('vitoria')) return 'POR';
  if (c.startsWith('ned_') || c.includes('ajax') || c.includes('psv') || c.includes('feyenoord') || c.includes('alkmaar') || c.includes('twente')) return 'NED';
  if (c.startsWith('bel_') || c.includes('brugge') || c.includes('anderlecht') || c.includes('union sg') || c.includes('genk') || c.includes('gent')) return 'BEL';
  if (c.startsWith('tur_') || c.includes('galatasaray') || c.includes('fenerbahce') || c.includes('besiktas') || c.includes('trabzonspor')) return 'TUR';
  if (c.startsWith('sco_') || c.includes('celtic') || c.includes('rangers') || c.includes('hearts') || c.includes('aberdeen')) return 'SCO';
  if (c.startsWith('cze_') || c.includes('slavia') || c.includes('sparta') || c.includes('plzen')) return 'CZE';
  if (c.startsWith('aut_') || c.includes('salzburg') || c.includes('sturm') || c.includes('rapid wien')) return 'AUT';
  if (c.startsWith('gre_') || c.includes('olympiacos') || c.includes('panathinaikos') || c.includes('paok') || c.includes('aek')) return 'GRE';
  if (c.startsWith('den_') || c.includes('copenhagen') || c.includes('midtjylland') || c.includes('brondby')) return 'DEN';
  if (c.startsWith('sui_') || c.includes('young boys') || c.includes('basel') || c.includes('zurich') || c.includes('servette')) return 'SUI';
  if (c.startsWith('cro_') || c.includes('dinamo zagreb') || c.includes('hajduk')) return 'CRO';
  if (c.startsWith('nor_') || c.includes('bodo') || c.includes('molde') || c.includes('rosenborg')) return 'NOR';
  if (c.startsWith('pol_') || c.includes('legia') || c.includes('lech') || c.includes('rakow')) return 'POL';
  if (c.startsWith('swe_') || c.includes('malmo') || c.includes('djurgarden')) return 'SWE';
  if (c.startsWith('srb_') || c.includes('red star') || c.includes('crvena zvezda') || c.includes('partizan')) return 'SRB';

  return 'ENG';
}

/**
 * Dynamically computes UEFA association rankings for a given season.
 * Takes base coefficient seeds and adds in-season European competition points.
 */
export function getUefaAssociationRankings(
  seasonYear: string = '2026/27',
  worldState?: WorldSimulationState
): UefaAssociationRankEntry[] {
  const activeState = worldState || getWorldSimulationState(seasonYear);

  // In-season points accumulator: points earned by clubs for this association
  const associationSeasonPoints: Record<string, number> = {};
  BASE_EUROPEAN_ASSOCIATION_SEEDS.forEach((seed) => {
    associationSeasonPoints[seed.countryCode] = 0;
  });

  // Calculate points from continental matches (UCL, UEL, UECL)
  if (activeState && activeState.continental) {
    Object.values(activeState.continental).forEach((comp) => {
      // Group stages
      (comp.groups || []).forEach((grp) => {
        Object.values(grp.matchdays || {}).forEach((matches) => {
          matches.forEach((m) => {
            if (m && typeof m.homeScore === 'number' && typeof m.awayScore === 'number') {
              const homeAssoc = getClubCountryAssociation(m.homeTeamId || m.homeTeamName);
              const awayAssoc = getClubCountryAssociation(m.awayTeamId || m.awayTeamName);
              if (m.homeScore > m.awayScore) {
                associationSeasonPoints[homeAssoc] = (associationSeasonPoints[homeAssoc] || 0) + 2.0;
              } else if (m.awayScore > m.homeScore) {
                associationSeasonPoints[awayAssoc] = (associationSeasonPoints[awayAssoc] || 0) + 2.0;
              } else {
                associationSeasonPoints[homeAssoc] = (associationSeasonPoints[homeAssoc] || 0) + 1.0;
                associationSeasonPoints[awayAssoc] = (associationSeasonPoints[awayAssoc] || 0) + 1.0;
              }
            }
          });
        });
      });

      // Knockout rounds (Round of 16, QF, SF, Final bonus)
      (comp.knockoutRounds || []).forEach((round) => {
        (round.matches || []).forEach((m) => {
          if (m && typeof m.homeScore === 'number' && typeof m.awayScore === 'number') {
            const homeAssoc = getClubCountryAssociation(m.homeTeamId || m.homeTeamName);
            const awayAssoc = getClubCountryAssociation(m.awayTeamId || m.awayTeamName);
            if (m.homeScore > m.awayScore) {
              associationSeasonPoints[homeAssoc] = (associationSeasonPoints[homeAssoc] || 0) + 2.0;
            } else if (m.awayScore > m.homeScore) {
              associationSeasonPoints[awayAssoc] = (associationSeasonPoints[awayAssoc] || 0) + 2.0;
            } else {
              associationSeasonPoints[homeAssoc] = (associationSeasonPoints[homeAssoc] || 0) + 1.0;
              associationSeasonPoints[awayAssoc] = (associationSeasonPoints[awayAssoc] || 0) + 1.0;
            }
          }
        });
      });

      // Winner bonus
      if (comp.winner) {
        const winnerAssoc = getClubCountryAssociation(comp.winner.teamId || comp.winner.teamName);
        associationSeasonPoints[winnerAssoc] = (associationSeasonPoints[winnerAssoc] || 0) + 4.0;
      }
    });
  }

  // Compile entries with points divided by clubs count
  const list: UefaAssociationRankEntry[] = BASE_EUROPEAN_ASSOCIATION_SEEDS.map((seed) => {
    const rawSeasonPts = associationSeasonPoints[seed.countryCode] || 0;
    const seasonCoefficient = parseFloat((rawSeasonPts / Math.max(1, seed.clubsCount)).toFixed(3));
    const totalPoints = parseFloat((seed.basePoints + seasonCoefficient).toFixed(3));

    return {
      rank: 0,
      countryCode: seed.countryCode,
      countryName: seed.countryName,
      basePoints: seed.basePoints,
      seasonPoints: seasonCoefficient,
      totalPoints,
      coefficient: 1.0,
      clubsInEuropeCount: seed.clubsCount,
    };
  });

  // Sort descending by total association points
  list.sort((a, b) => b.totalPoints - a.totalPoints);

  // Assign dynamic rank and coefficient based on rank:
  // Rank 1–5:  2.0 points per domestic league goal
  // Rank 6–22: 1.5 points per domestic league goal
  // Rank 23+:  1.0 point per domestic league goal
  list.forEach((entry, idx) => {
    entry.rank = idx + 1;
    if (entry.rank <= 5) {
      entry.coefficient = 2.0;
    } else if (entry.rank <= 22) {
      entry.coefficient = 1.5;
    } else {
      entry.coefficient = 1.0;
    }
  });

  return list;
}

/**
 * Checks if a given country or league is in UEFA, and returns its dynamic Golden Shoe coefficient.
 */
export function getEuropeanGoldenShoeCoefficient(
  countryCodeOrLeagueId: string,
  seasonYear: string = '2026/27',
  worldState?: WorldSimulationState
): { coefficient: number; associationRank: number; associationName: string; isEligible: boolean } {
  const norm = (countryCodeOrLeagueId || '').toUpperCase();
  const lower = (countryCodeOrLeagueId || '').toLowerCase();

  // Explicit non-European associations: ineligible (coefficient 0)
  if (
    norm === 'SAU' ||
    norm === 'BRA' ||
    norm === 'ARG' ||
    norm === 'USA' ||
    norm === 'JPN' ||
    norm === 'KOR' ||
    lower.includes('saudi') ||
    lower.includes('brazil') ||
    lower.includes('argentina') ||
    lower.includes('mls')
  ) {
    return {
      coefficient: 0,
      associationRank: 999,
      associationName: 'Non-European Association',
      isEligible: false,
    };
  }

  // Derive country code
  let countryCode = norm;
  if (lower.includes('england') || lower.includes('premier')) countryCode = 'ENG';
  else if (lower.includes('spain') || lower.includes('la liga')) countryCode = 'ESP';
  else if (lower.includes('italy') || lower.includes('serie a')) countryCode = 'ITA';
  else if (lower.includes('germany') || lower.includes('bundesliga')) countryCode = 'GER';
  else if (lower.includes('france') || lower.includes('ligue 1')) countryCode = 'FRA';
  else if (lower.includes('portugal') || lower.includes('primeira')) countryCode = 'POR';
  else if (lower.includes('netherlands') || lower.includes('eredivisie')) countryCode = 'NED';
  else if (lower.includes('belgium') || lower.includes('pro league')) countryCode = 'BEL';
  else if (lower.includes('turkey') || lower.includes('super lig')) countryCode = 'TUR';
  else if (lower.includes('scotland') || lower.includes('scottish')) countryCode = 'SCO';

  const rankings = getUefaAssociationRankings(seasonYear, worldState);
  const found = rankings.find((r) => r.countryCode === countryCode || r.countryName.toUpperCase() === norm);

  if (found) {
    return {
      coefficient: found.coefficient,
      associationRank: found.rank,
      associationName: found.countryName,
      isEligible: true,
    };
  }

  // If in Europe but not in top 32 list: Rank 33+ => 1.0
  return {
    coefficient: 1.0,
    associationRank: 33,
    associationName: countryCode,
    isEligible: true,
  };
}

/**
 * Calculates the European Golden Shoe for the European Season Summary.
 * 
 * Strict constraints:
 * - Only domestic league goals count.
 * - Excludes UCL, UEL, UECL, domestic cups, and national team matches.
 * - Multiplies domestic goals by the dynamic UEFA association coefficient (2.0 for ranks 1-5, 1.5 for 6-22, 1.0 for 23+).
 * - Only European domestic leagues are eligible.
 */
export function calculateEuropeanGoldenShoe(
  seasonYear: string = '2026/27',
  db?: LeagueDatabase,
  userPlayer?: PlayerCardData,
  userDomesticGoals?: number
): EuropeanGoldenShoeEntry[] {
  const worldState = getWorldSimulationState(seasonYear, db, userPlayer);
  const uefaRankings = getUefaAssociationRankings(seasonYear, worldState);

  const candidatesMap: Map<string, EuropeanGoldenShoeEntry> = new Map();

  // Harvest goals from European domestic leagues in world simulation state
  Object.values(worldState.leagues || {}).forEach((league) => {
    if (league.divisionTier === 'youth') return; // Strictly ignore youth

    const coeffInfo = getEuropeanGoldenShoeCoefficient(league.countryCode || league.leagueId, seasonYear, worldState);
    if (!coeffInfo.isEligible) return; // Non-European leagues not eligible

    const statsSource = Object.values(league.playerStatsMap || (league as any).playerStats || {});
    statsSource.forEach((pStat: any) => {
      const pId = pStat.playerId;
      const goals = pStat.goals || 0;
      if (goals <= 0) return;

      const weightedPoints = parseFloat((goals * coeffInfo.coefficient).toFixed(1));

      candidatesMap.set(pId, {
        id: pId,
        name: pStat.playerName || pStat.name || 'Player',
        club: pStat.teamName || league.name,
        countryCode: pStat.countryCode || league.countryCode || 'ENG',
        mainPosition: 'ATT',
        subPosition: pStat.subPosition || pStat.position || 'ST',
        ovr: pStat.ovr || pStat.overallRating || 78,
        isUserPlayer: Boolean(pStat.isUserPlayer),
        rank: 0,
        domesticLeagueGoals: goals,
        goals,
        leagueId: league.leagueId,
        leagueName: league.name,
        associationRank: coeffInfo.associationRank,
        coefficient: coeffInfo.coefficient,
        weightedPoints,
        points: weightedPoints,
        isWinner: false,
      });
    });
  });

  // Ensure user player is evaluated if in an eligible European professional league
  if (userPlayer && isPlayerInProClub(userPlayer) && (userPlayer.age || 16) >= 17) {
    const userLeagueCountry = userPlayer.countryCode || 'ENG';
    const userLeagueId = (userPlayer as any).leagueId || 'england_d1';
    const coeffInfo = getEuropeanGoldenShoeCoefficient(userLeagueId, seasonYear, worldState);

    if (coeffInfo.isEligible) {
      const userGoals = typeof userDomesticGoals === 'number' ? userDomesticGoals : (((userPlayer.stats as any)?.goals) || (userPlayer as any)?.seasonGoals || 0);
      if (userGoals > 0) {
        const weightedPoints = parseFloat((userGoals * coeffInfo.coefficient).toFixed(1));
        candidatesMap.set(userPlayer.id, {
          id: userPlayer.id,
          name: userPlayer.name || 'User Player',
          club: userPlayer.club || 'Club',
          countryCode: userLeagueCountry,
          mainPosition: 'ATT',
          subPosition: userPlayer.subPosition || userPlayer.position || 'ST',
          ovr: userPlayer.ovr || 80,
          isUserPlayer: true,
          rank: 0,
          domesticLeagueGoals: userGoals,
          goals: userGoals,
          leagueId: userLeagueId,
          leagueName: (userPlayer as any).leagueName || 'Domestic League',
          associationRank: coeffInfo.associationRank,
          coefficient: coeffInfo.coefficient,
          weightedPoints,
          points: weightedPoints,
          isWinner: false,
        });
      }
    }
  }

  const sortedList = Array.from(candidatesMap.values()).sort((a, b) => {
    return b.weightedPoints - a.weightedPoints || b.domesticLeagueGoals - a.domesticLeagueGoals || b.ovr - a.ovr;
  });

  const topRankings = sortedList.slice(0, 10).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    isWinner: idx === 0,
  }));

  return topRankings;
}
