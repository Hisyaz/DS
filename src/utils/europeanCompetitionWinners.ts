import { ContinentalTournamentSeasonState, ContinentalKnockoutTie } from '../types/continentalCompetitions';

export interface EuropeanCompetitionFinalist {
  teamId: string;
  teamName: string;
  isWinner: boolean;
  ovr: number;
}

export interface EuropeanCompetitionWinnerRecord {
  competitionId: string; // 'UEFA_CL' | 'UEFA_EL' | 'UEFA_ECL'
  seasonYear: string;    // e.g. "2026/27"
  seasonNum: number;     // e.g. 2026
  winnerTeamId: string;  // Authoritative TeamID (e.g. 'esp_realmadrid')
  winnerTeamName: string;
  runnerUpTeamId: string; // Authoritative TeamID (e.g. 'eng_mancity')
  runnerUpTeamName: string;
  finalScore: string;     // e.g. "2 - 1"
  finalVenue?: {
    stadium: string;
    city: string;
    country: string;
  };
  finalists: [EuropeanCompetitionFinalist, EuropeanCompetitionFinalist];
  stats?: {
    totalGoals?: number;
    totalMatches?: number;
    topScorerName?: string;
    topScorerGoals?: number;
  };
  timestamp: number;
}

const WINNERS_STORAGE_KEY = 'EUROPEAN_COMPETITION_WINNERS_REGISTRY';

function normalizeSeasonYear(year: string | number): string {
  if (typeof year === 'number') {
    return `${year}/${String((year + 1) % 100).padStart(2, '0')}`;
  }
  return String(year);
}

/**
 * Loads the complete registry of European competition winners.
 */
export function getAllEuropeanCompetitionWinners(): Record<string, EuropeanCompetitionWinnerRecord> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = localStorage.getItem(WINNERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to load European competition winners registry:', err);
    return {};
  }
}

/**
 * Persists a European competition winner record.
 * Keyed by `${competitionId}_${seasonYear}`.
 */
export function saveEuropeanCompetitionWinner(record: EuropeanCompetitionWinnerRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const registry = getAllEuropeanCompetitionWinners();
    const key = `${record.competitionId}_${record.seasonYear}`;
    registry[key] = record;
    localStorage.setItem(WINNERS_STORAGE_KEY, JSON.stringify(registry));
  } catch (err) {
    console.error('Failed to save European competition winner:', err);
  }
}

/**
 * Retrieves the winner record for a specific competition and season.
 * E.g. getEuropeanCompetitionWinner('UEFA_CL', '2026/27') -> winnerTeamId
 */
export function getEuropeanCompetitionWinner(
  competitionId: string,
  seasonYear: string | number
): EuropeanCompetitionWinnerRecord | null {
  const normYear = normalizeSeasonYear(seasonYear);
  const registry = getAllEuropeanCompetitionWinners();
  const directKey = `${competitionId}_${normYear}`;
  if (registry[directKey]) {
    return registry[directKey];
  }

  // Fallback by matching numeric year or season string prefix
  const numericPart = typeof seasonYear === 'number' ? seasonYear : parseInt(String(seasonYear).split('/')[0], 10);
  const found = Object.values(registry).find(
    (r) => r.competitionId === competitionId && (r.seasonNum === numericPart || r.seasonYear === String(seasonYear))
  );
  return found || null;
}

/**
 * Automatically records and persists the winner of a European tournament state.
 */
export function recordEuropeanFinalWinner(
  state: ContinentalTournamentSeasonState,
  finalTie: ContinentalKnockoutTie,
  seasonYearStr?: string
): EuropeanCompetitionWinnerRecord {
  const seasonNum = state.seasonYear || 2026;
  const seasonYear = seasonYearStr || normalizeSeasonYear(seasonNum);

  const winnerTeamId = finalTie.winnerTeamId || finalTie.teamA.id;
  const isTeamAWinner = winnerTeamId === finalTie.teamA.id;
  const winnerTeamName = isTeamAWinner ? finalTie.teamA.name : finalTie.teamB.name;
  const runnerUpTeamId = isTeamAWinner ? finalTie.teamB.id : finalTie.teamA.id;
  const runnerUpTeamName = isTeamAWinner ? finalTie.teamB.name : finalTie.teamA.name;

  const leg = finalTie.leg1;
  let finalScore = '1 - 0';
  if (leg && leg.isCompleted) {
    finalScore = `${leg.homeScore} - ${leg.awayScore}`;
    if (leg.homePenalties !== undefined && leg.awayPenalties !== undefined) {
      finalScore += ` (${leg.homePenalties} - ${leg.awayPenalties} pen)`;
    }
  }

  // Calculate competition statistics if league phase / knockout fixtures exist
  let totalGoals = 0;
  let totalMatches = 0;
  if (state.leaguePhaseFixtures) {
    state.leaguePhaseFixtures.forEach((f) => {
      if (f.isCompleted) {
        totalMatches++;
        totalGoals += (f.homeScore || 0) + (f.awayScore || 0);
      }
    });
  }

  const record: EuropeanCompetitionWinnerRecord = {
    competitionId: state.competitionId,
    seasonYear,
    seasonNum,
    winnerTeamId,
    winnerTeamName,
    runnerUpTeamId,
    runnerUpTeamName,
    finalScore,
    finalVenue: state.finalVenue,
    finalists: [
      {
        teamId: finalTie.teamA.id,
        teamName: finalTie.teamA.name,
        isWinner: isTeamAWinner,
        ovr: finalTie.teamA.ovr || 80,
      },
      {
        teamId: finalTie.teamB.id,
        teamName: finalTie.teamB.name,
        isWinner: !isTeamAWinner,
        ovr: finalTie.teamB.ovr || 80,
      },
    ],
    stats: {
      totalGoals,
      totalMatches,
    },
    timestamp: Date.now(),
  };

  saveEuropeanCompetitionWinner(record);
  return record;
}
