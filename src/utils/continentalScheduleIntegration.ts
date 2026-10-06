import { PlayerConfig, PlayerCardData } from '../types';
import { LeagueDatabase } from '../types/leagueEditor';
import {
  ContinentalCompetitionId,
  ContinentalTournamentSeasonState,
  ContinentalMatchResult,
} from '../types/continentalCompetitions';
import { SimulatedMatchResult } from '../types/matchSimulation';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import {
  CONTINENTAL_COMPETITIONS_CATALOG,
  getEligibleClubsForFederation,
} from './continentalDatabaseSystem';
import {
  determineContinentalQualifiers,
  DomesticSeasonResultSnapshot,
  getDomesticSeasonSnapshotsForSeason,
} from './continentalQualificationSystem';
import {
  getContinentalTournamentState,
  saveContinentalTournamentState,
  generateContinentalTournamentDraw,
  simulateContinentalGroupMatchday,
  advanceContinentalKnockoutStage,
  generateRoundOf16Draw,
} from './continentalTournamentEngine';
import { getOrCreateContinentalSquadRegistration } from './continentalSquadRegistrationSystem';
import { classifyMatchImportance } from './matchImportanceSystem';
import { awardTrophiesToPlayer } from './trophySystem';
import { generateContinentalVictoryNews } from './continentalVictoryNewsSystem';
import { isSouthAmericanContext } from './seasonCalendarManager';
import { getClubFederation, isCompetitionValidForFederation } from './clubContextRebuilder';

/**
 * Detects which continental competition the player's club qualifies for or participates in.
 */
export function detectPlayerContinentalCompetition(
  player: PlayerConfig,
  leagueDb?: LeagueDatabase
): ContinentalCompetitionId | null {
  const isPro = isProfessionalPlayer(player);
  if (!isPro) return null;

  const federation = getClubFederation(player.countryCode, player.league, player.clubCountry);

  // If player is explicitly assigned a continental comp id or explicitly set to NONE
  if ((player as any).qualifiedContinentalCompId !== undefined) {
    const explicitId = (player as any).qualifiedContinentalCompId;
    if (!explicitId || explicitId === 'NONE' || explicitId === 'none') {
      return null;
    }
    // Only accept if strictly valid for the club's continental federation
    if (isCompetitionValidForFederation(explicitId, federation)) {
      return explicitId as ContinentalCompetitionId;
    }
  }

  // If player has short qualifiedContinental identifier from domestic finish
  if ((player as any).qualifiedContinental) {
    const q = (player as any).qualifiedContinental;
    let mappedComp: ContinentalCompetitionId | null = null;
    if (q === 'ucl') mappedComp = 'UEFA_CL';
    else if (q === 'uel') mappedComp = 'UEFA_EL';
    else if (q === 'uecl') mappedComp = 'UEFA_ECL';
    else if (q === 'libertadores') mappedComp = 'CONMEBOL_LIB';
    else if (q === 'sudamericana') mappedComp = 'CONMEBOL_SUD';
    else if (q === 'afc_elite') mappedComp = 'AFC_CL';
    else if (q === 'afc_two') mappedComp = 'AFC_CUP';

    // Only accept if strictly valid for the club's continental federation
    if (mappedComp && isCompetitionValidForFederation(mappedComp, federation)) {
      return mappedComp;
    }
  }

  const squadDest = player.squadDestination || 'First Team';
  if (squadDest !== 'First Team' && squadDest !== 'Reserves') {
    return null;
  }

  const leagueTier = typeof player.leagueTier === 'number' ? player.leagueTier : 1;
  const isCupWinner = Boolean((player as any).isDomesticCupWinner);
  if (leagueTier > 1 && !isCupWinner) {
    return null;
  }

  const countryCode = (player.countryCode || player.clubCountry || player.country || '').toUpperCase();
  const finishRank = (player as any).previousLeagueFinish || (player as any).leagueFinishRank || (player as any).lastSeasonRank;

  // Europe (UEFA)
  if (['ENG', 'ESP', 'GER', 'DEU', 'ITA', 'FR', 'FRA', 'NED', 'POR', 'BEL', 'SCO', 'TUR'].includes(countryCode)) {
    if (finishRank) {
      if (countryCode === 'POR') {
        if (finishRank <= 2) return 'UEFA_CL';
        if (finishRank === 3 || isCupWinner) return 'UEFA_EL';
        if (finishRank === 4) return 'UEFA_ECL';
        return null;
      }
      if (finishRank <= 4) return 'UEFA_CL';
      if (finishRank <= 6 || isCupWinner) return 'UEFA_EL';
      if (finishRank === 7) return 'UEFA_ECL';
      return null;
    }

    const clubId = player.clubId || '';
    const clubName = (player.club || '').toLowerCase();
    const dbTeam = leagueDb?.teams?.[clubId] || Object.values(leagueDb?.teams || {}).find(
      (t) => t.name.toLowerCase() === clubName
    );

    const teamOvr = dbTeam?.overallRating || (player.ovr ? player.ovr + 3 : 75);
    if (teamOvr >= 83) {
      return 'UEFA_CL';
    } else if (teamOvr >= 79) {
      return 'UEFA_EL';
    } else if (teamOvr >= 76) {
      return 'UEFA_ECL';
    }
    return null;
  }

  // South America (CONMEBOL)
  if (['ARG', 'BRA', 'COL', 'CHI', 'URU', 'PAR', 'ECU', 'PER'].includes(countryCode)) {
    if (finishRank) {
      if (finishRank <= 4) return 'CONMEBOL_LIB';
      if (finishRank <= 8 || isCupWinner) return 'CONMEBOL_SUD';
      return null;
    }

    const clubId = player.clubId || '';
    const clubName = (player.club || '').toLowerCase();
    const dbTeam = leagueDb?.teams?.[clubId] || Object.values(leagueDb?.teams || {}).find(
      (t) => t.name.toLowerCase() === clubName
    );
    const teamOvr = dbTeam?.overallRating || 74;
    if (teamOvr >= 78) return 'CONMEBOL_LIB';
    if (teamOvr >= 74) return 'CONMEBOL_SUD';
    return null;
  }

  // North / Central America
  if (['USA', 'MEX', 'CAN', 'CRC', 'HON'].includes(countryCode)) {
    if (finishRank && finishRank <= 3) return 'CONCACAF_CC';
    return null;
  }

  // Asia / Middle East
  if (['SAU', 'QAT', 'UAE', 'JPN', 'KOR', 'CHN', 'AUS'].includes(countryCode)) {
    if (finishRank && finishRank <= 3) return 'AFC_CL';
    if (finishRank && finishRank <= 5) return 'AFC_CUP';
    return null;
  }

  // Africa
  if (['EGY', 'MAR', 'NGA', 'RSA', 'GHA', 'SEN', 'ALG', 'TUN'].includes(countryCode)) {
    if (finishRank && finishRank <= 2) return 'CAF_CL';
    return null;
  }

  return null;
}

/**
 * Gets or initializes the authentic continental tournament state for the given season.
 */
export function getOrInitContinentalStateForSeason(
  player: PlayerConfig,
  seasonYear: number,
  compIdOverride?: ContinentalCompetitionId,
  leagueDbOverride?: LeagueDatabase
): {
  tournamentState: ContinentalTournamentSeasonState | null;
  playerClubInTournament: boolean;
  competitionId: ContinentalCompetitionId | null;
} {
  const compId = compIdOverride || detectPlayerContinentalCompetition(player);
  if (!compId) {
    return { tournamentState: null, playerClubInTournament: false, competitionId: null };
  }

  const federation = getClubFederation(player.countryCode, player.league, player.clubCountry);
  if (!isCompetitionValidForFederation(compId, federation)) {
    return { tournamentState: null, playerClubInTournament: false, competitionId: null };
  }

  const leagueDb = leagueDbOverride || getLeagueDatabase();
  let tourn = getContinentalTournamentState(compId, seasonYear);

  const playerClubName = player.club || 'Club';
  const playerClubId = player.clubId || `club_${playerClubName.toLowerCase().replace(/\s+/g, '_')}`;

  if (!tourn) {
    const storedSnapshots = getDomesticSeasonSnapshotsForSeason(seasonYear) || [];
    const qualifiers = determineContinentalQualifiers(
      compId,
      leagueDb,
      storedSnapshots,
      player as any,
      seasonYear
    );

    const hasPlayerClub = qualifiers.some(
      (q) => q.teamId === playerClubId || q.teamName.toLowerCase() === playerClubName.toLowerCase()
    );

    const isExplicitlyQualifiedForThisComp =
      isCompetitionValidForFederation(compId, federation) && (
      (player as any).qualifiedContinentalCompId === compId ||
      ((player as any).qualifiedContinental === 'ucl' && compId === 'UEFA_CL') ||
      ((player as any).qualifiedContinental === 'uel' && compId === 'UEFA_EL') ||
      ((player as any).qualifiedContinental === 'uecl' && compId === 'UEFA_ECL') ||
      ((player as any).qualifiedContinental === 'libertadores' && compId === 'CONMEBOL_LIB') ||
      ((player as any).qualifiedContinental === 'sudamericana' && compId === 'CONMEBOL_SUD') ||
      ((player as any).qualifiedContinental === 'afc_elite' && compId === 'AFC_CL') ||
      ((player as any).qualifiedContinental === 'afc_two' && compId === 'AFC_CUP'));

    if (!hasPlayerClub && isExplicitlyQualifiedForThisComp) {
      qualifiers.push({
        teamId: playerClubId,
        teamName: playerClubName,
        countryCode: (player.countryCode || player.clubCountry || 'INT').toUpperCase(),
        countryName: player.country || player.clubCountry || 'International',
        sourceType: 'league_rank',
        sourceDescription: `${playerClubName} (Domestic League Qualifier)`,
        competitionId: compId,
        seedingPot: 2,
        teamOvr: Math.max(74, (player.ovr || 72) + 2),
      });
    }

    tourn = generateContinentalTournamentDraw(
      compId,
      seasonYear,
      qualifiers,
      playerClubId
    );
  }

  // Ensure isPlayer flag strictly matches current club and clean up stale isPlayer from previous transfers
  let mutated = false;
  tourn.groups.forEach((g) => {
    g.teams.forEach((t) => {
      const isCurrentClub = t.id === playerClubId || t.name.toLowerCase() === playerClubName.toLowerCase();
      if (t.isPlayer && !isCurrentClub) {
        t.isPlayer = false;
        mutated = true;
      } else if (!t.isPlayer && isCurrentClub) {
        t.isPlayer = true;
        mutated = true;
      }
    });
  });
  if (mutated) {
    saveContinentalTournamentState(tourn);
  }

  const playerClubInTournament = tourn.groups.some((g) =>
    g.teams.some((t) => (t.id === playerClubId || t.name.toLowerCase() === playerClubName.toLowerCase()) && t.isPlayer)
  );

  return { tournamentState: tourn, playerClubInTournament, competitionId: compId };
}

/**
 * Injects continental matches into the half-season schedule (Block 1: Group Matchdays 1-6; Block 2: Knockout Stage).
 */
export function buildUnifiedSeasonBlockMatches(
  player: PlayerConfig,
  blockNumber: 1 | 2,
  baseLeagueMatches: SimulatedMatchResult[],
  seasonYear: number,
  leagueDb?: LeagueDatabase
): {
  unifiedMatches: SimulatedMatchResult[];
  continentalMatchesCount: number;
} {
  const isPro = isProfessionalPlayer(player);
  if (!isPro) {
    return { unifiedMatches: baseLeagueMatches, continentalMatchesCount: 0 };
  }

  const { tournamentState, playerClubInTournament, competitionId } = getOrInitContinentalStateForSeason(
    player,
    seasonYear,
    undefined,
    leagueDb
  );

  if (!tournamentState || !playerClubInTournament || !competitionId) {
    return { unifiedMatches: baseLeagueMatches, continentalMatchesCount: 0 };
  }

  const meta = CONTINENTAL_COMPETITIONS_CATALOG[competitionId];
  const compShort = meta?.shortName || 'UCL';
  const compFull = meta?.name || 'UEFA Champions League';
  const playerClubName = player.club || 'Club';
  const playerClubId = player.clubId || `club_${playerClubName.toLowerCase().replace(/\s+/g, '_')}`;

  const unifiedList: SimulatedMatchResult[] = [];

  const isSouthAmerica = isSouthAmericanContext(player);

  if (isSouthAmerica && blockNumber === 1) {
    // In South America, continental competitions (Libertadores/Sudamericana) are drawn at the July mid-season stop.
    // Block 1 is the domestic Winter Block (Feb-Jun), so no continental matches are injected yet.
    return { unifiedMatches: baseLeagueMatches, continentalMatchesCount: 0 };
  }

  const isGroupStageBlock = isSouthAmerica ? blockNumber === 2 : blockNumber === 1;

  if (isGroupStageBlock) {
    // Group Stage (Matchdays 1 to 6)
    const playerGroup = tournamentState.groups.find((g) =>
      g.teams.some((t) => t.id === playerClubId || t.name.toLowerCase() === playerClubName.toLowerCase() || t.isPlayer)
    );

    if (!playerGroup) {
      return { unifiedMatches: baseLeagueMatches, continentalMatchesCount: 0 };
    }

    const playerGroupFixtures = playerGroup.fixtures
      .filter((f) => f.homeTeamId === playerClubId || f.awayTeamId === playerClubId || f.isPlayerMatch || f.homeTeamName.toLowerCase() === playerClubName.toLowerCase() || f.awayTeamName.toLowerCase() === playerClubName.toLowerCase())
      .sort((a, b) => (a.matchdayIndex || 1) - (b.matchdayIndex || 1));

    let contIdx = 0;
    let leagueIdx = 0;
    const totalSteps = baseLeagueMatches.length + playerGroupFixtures.length;

    for (let step = 0; step < totalSteps; step++) {
      const isContinentalSlot = (step % 2 === 1 || leagueIdx >= baseLeagueMatches.length) && contIdx < playerGroupFixtures.length;

      if (isContinentalSlot) {
        const fix = playerGroupFixtures[contIdx];
        contIdx++;

        const isPlayerHome = fix.homeTeamId === playerClubId || fix.homeTeamName.toLowerCase() === playerClubName.toLowerCase();
        const opponentName = isPlayerHome ? fix.awayTeamName : fix.homeTeamName;
        const opponentTeamObj = playerGroup.teams.find((t) => t.name.toLowerCase() === opponentName.toLowerCase());
        const opponentOvr = opponentTeamObj?.ovr || Math.max(76, (player.ovr || 72) + 3);

        const importanceEval = classifyMatchImportance({
          stageTitle: `${compShort} Group Stage - MD${fix.matchdayIndex}`,
          competitionName: compFull,
          teamAName: playerClubName,
          teamBName: opponentName,
          currentMatchIndex: unifiedList.length,
          totalMatchesInSeason: totalSteps,
          playerPlayMode: player.keyMatchPlayMode || 'decisive',
        });

        const homeScore = fix.isCompleted ? fix.homeScore : isPlayerHome ? 2 : 1;
        const awayScore = fix.isCompleted ? fix.awayScore : isPlayerHome ? 1 : 2;

        unifiedList.push({
          matchId: fix.id || `cont_md_${fix.matchdayIndex}_${Date.now()}_${step}`,
          matchIndex: unifiedList.length,
          stageName: `${compShort} • MD${fix.matchdayIndex}`,
          homeTeamName: isPlayerHome ? playerClubName : opponentName,
          awayTeamName: isPlayerHome ? opponentName : playerClubName,
          homeScore,
          awayScore,
          playerTeamScore: isPlayerHome ? homeScore : awayScore,
          opponentScore: isPlayerHome ? awayScore : homeScore,
          isPlayerHome,
          playerStatus: 'starter',
          minutesPlayed: 90,
          playerGoals: isPlayerHome ? (homeScore > 0 ? 1 : 0) : (awayScore > 0 ? 1 : 0),
          playerAssists: 0,
          playerRating: 7.6,
          isMvp: false,
          isInjured: false,
          playerFitness: 90,
          importanceCategory: importanceEval.category,
          importanceReason: `${compFull} Group Stage Matchday ${fix.matchdayIndex}`,
          isKeyMatch: Boolean(importanceEval.isPlayableInCurrentMode),
          competitionName: compFull,
          competitionType: 'continental',
          continentalCompId: competitionId,
          continentalMatchday: fix.matchdayIndex,
          continentalStage: 'group',
        });
      } else if (leagueIdx < baseLeagueMatches.length) {
        const baseMatch = baseLeagueMatches[leagueIdx++];
        unifiedList.push({
          ...baseMatch,
          matchIndex: unifiedList.length,
        });
      }
    }

    return { unifiedMatches: unifiedList, continentalMatchesCount: playerGroupFixtures.length };
  } else {
    // Block 2: Knockout Stage
    // Check if player's team qualified for knockouts (top 2 of group)
    const playerGroup = tournamentState.groups.find((g) =>
      g.teams.some((t) => t.id === playerClubId || t.name.toLowerCase() === playerClubName.toLowerCase() || t.isPlayer)
    );

    let playerQualified = false;
    if (playerGroup && playerGroup.standings) {
      const top2 = playerGroup.standings.slice(0, 2);
      playerQualified = top2.some(
        (s) => s.teamId === playerClubId || s.teamName.toLowerCase() === playerClubName.toLowerCase() || s.isPlayerTeam
      );
    }

    if (!playerQualified) {
      return { unifiedMatches: baseLeagueMatches, continentalMatchesCount: 0 };
    }

    // Ensure R16 ties exist
    let tourn = tournamentState;
    if (!tourn.r16Ties || tourn.r16Ties.length === 0) {
      const r16Ties = generateRoundOf16Draw(tourn.groups, competitionId, seasonYear, playerClubId);
      tourn = { ...tourn, r16Ties, currentStage: 'round_of_16' };
      saveContinentalTournamentState(tourn);
    }

    // Find player's R16 opponent from the unscripted draw
    const playerR16Tie = tourn.r16Ties?.find(
      (t) => t.teamA.id === playerClubId || t.teamB.id === playerClubId || t.teamA.name.toLowerCase() === playerClubName.toLowerCase() || t.teamB.name.toLowerCase() === playerClubName.toLowerCase()
    );

    const r16Opponent = playerR16Tie
      ? (playerR16Tie.teamA.id === playerClubId ? playerR16Tie.teamB : playerR16Tie.teamA)
      : { id: 'r16_opp', name: 'European Challenger', ovr: 83 };

    // Dynamically build potential knockout path strictly from tournament bracket tree
    const r16Index = tourn.r16Ties?.findIndex(
      (t) => t.teamA.id === playerClubId || t.teamB.id === playerClubId ||
             t.teamA.name.toLowerCase() === playerClubName.toLowerCase() || t.teamB.name.toLowerCase() === playerClubName.toLowerCase()
    ) ?? -1;

    // QF Opponent: determined by bracket tree pairing (adjacent R16 tie in same quadrant)
    const pairedR16Index = r16Index >= 0 ? (r16Index % 2 === 0 ? r16Index + 1 : r16Index - 1) : 1;
    const pairedR16Tie = tourn.r16Ties?.[pairedR16Index];
    let qfOpponent = tourn.qfTies?.find((t) => t.teamA.id === playerClubId || t.teamB.id === playerClubId)?.teamA;
    if (!qfOpponent && pairedR16Tie) {
      const projected = (pairedR16Tie.teamA.ovr >= pairedR16Tie.teamB.ovr) ? pairedR16Tie.teamA : pairedR16Tie.teamB;
      qfOpponent = { id: projected.id, name: projected.name, ovr: projected.ovr, isPlayer: false };
    }
    if (!qfOpponent) {
      qfOpponent = { id: 'qf_opp', name: 'Quarter-Finalist', ovr: 85, isPlayer: false };
    }

    // SF Opponent: determined by semifinal branch pairing adjacent quadrants
    const qfBranch = Math.floor((r16Index >= 0 ? r16Index : 0) / 2);
    const pairedQfBranch = qfBranch % 2 === 0 ? qfBranch + 1 : qfBranch - 1;
    const sfCandidateR16Indices = [pairedQfBranch * 2, pairedQfBranch * 2 + 1];
    const sfCandidateTeams = sfCandidateR16Indices
      .map((idx) => tourn.r16Ties?.[idx])
      .filter(Boolean)
      .flatMap((tie) => [tie!.teamA, tie!.teamB])
      .sort((a, b) => b.ovr - a.ovr);
    const sfOpponent = sfCandidateTeams[0] || { id: 'sf_opp', name: 'Semi-Finalist', ovr: 86, isPlayer: false };

    // Final Opponent: top contender from opposite half of tournament bracket
    const oppositeHalfR16Indices = qfBranch < 2 ? [4, 5, 6, 7] : [0, 1, 2, 3];
    const finalCandidateTeams = oppositeHalfR16Indices
      .map((idx) => tourn.r16Ties?.[idx])
      .filter(Boolean)
      .flatMap((tie) => [tie!.teamA, tie!.teamB])
      .sort((a, b) => b.ovr - a.ovr);
    const finalOpponent = finalCandidateTeams[0] || { id: 'final_opp', name: 'Grand Finalist', ovr: 87, isPlayer: false };

    const knockoutFixturesToSchedule: {
      stage: 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';
      stageLabel: string;
      opponentName: string;
      opponentOvr: number;
      isHome: boolean;
      isFinal?: boolean;
    }[] = [
      {
        stage: 'round_of_16',
        stageLabel: `${compShort} • Round of 16 (1st Leg)`,
        opponentName: r16Opponent.name,
        opponentOvr: r16Opponent.ovr || 82,
        isHome: false,
      },
      {
        stage: 'round_of_16',
        stageLabel: `${compShort} • Round of 16 (2nd Leg)`,
        opponentName: r16Opponent.name,
        opponentOvr: r16Opponent.ovr || 82,
        isHome: true,
      },
      {
        stage: 'quarter_final',
        stageLabel: `${compShort} • Quarter-Final (1st Leg)`,
        opponentName: qfOpponent.name,
        opponentOvr: qfOpponent.ovr || 84,
        isHome: false,
      },
      {
        stage: 'quarter_final',
        stageLabel: `${compShort} • Quarter-Final (2nd Leg)`,
        opponentName: qfOpponent.name,
        opponentOvr: qfOpponent.ovr || 84,
        isHome: true,
      },
      {
        stage: 'semi_final',
        stageLabel: `${compShort} • Semi-Final (1st Leg)`,
        opponentName: sfOpponent.name,
        opponentOvr: sfOpponent.ovr || 85,
        isHome: false,
      },
      {
        stage: 'semi_final',
        stageLabel: `${compShort} • Semi-Final (2nd Leg)`,
        opponentName: sfOpponent.name,
        opponentOvr: sfOpponent.ovr || 85,
        isHome: true,
      },
      {
        stage: 'final',
        stageLabel: `${compShort} • Grand Final 🏆`,
        opponentName: finalOpponent.name,
        opponentOvr: finalOpponent.ovr || 86,
        isHome: true,
        isFinal: true,
      },
    ];

    const nonFinalKoRounds = knockoutFixturesToSchedule.filter((f) => f.stage !== 'final');
    const finalRound = knockoutFixturesToSchedule.find((f) => f.stage === 'final');

    let nonFinalIdx = 0;
    let legIdx = 0;

    while (legIdx < baseLeagueMatches.length || nonFinalIdx < nonFinalKoRounds.length) {
      const shouldPlaceKnockout =
        nonFinalIdx < nonFinalKoRounds.length &&
        (legIdx >= baseLeagueMatches.length || (unifiedList.length > 0 && unifiedList.length % 3 === 0));

      if (shouldPlaceKnockout) {
        const kFix = nonFinalKoRounds[nonFinalIdx++];
        unifiedList.push({
          matchId: `cont_ko_${kFix.stage}_${nonFinalIdx}_${Date.now()}_${unifiedList.length}`,
          matchIndex: unifiedList.length,
          stageName: kFix.stageLabel,
          homeTeamName: kFix.isHome ? playerClubName : kFix.opponentName,
          awayTeamName: kFix.isHome ? kFix.opponentName : playerClubName,
          homeScore: kFix.isHome ? 2 : 1,
          awayScore: kFix.isHome ? 1 : 2,
          playerTeamScore: 2,
          opponentScore: 1,
          isPlayerHome: kFix.isHome,
          playerStatus: 'starter',
          minutesPlayed: 90,
          playerGoals: 0,
          playerAssists: 1,
          playerRating: 7.8,
          isMvp: false,
          isInjured: false,
          playerFitness: 90,
          importanceCategory: 'IMPORTANT',
          importanceReason: `${compFull} Knockout Stage Showdown ⚡`,
          isKeyMatch: player.keyMatchPlayMode !== 'finals_only',
          competitionName: compFull,
          competitionType: 'continental',
          continentalCompId: competitionId,
          continentalStage: kFix.stage,
        });
      } else if (legIdx < baseLeagueMatches.length) {
        const baseMatch = baseLeagueMatches[legIdx++];
        unifiedList.push({
          ...baseMatch,
          matchIndex: unifiedList.length,
        });
      }
    }

    if (finalRound) {
      unifiedList.push({
        matchId: `cont_ko_final_${competitionId}_${Date.now()}`,
        matchIndex: unifiedList.length,
        stageName: finalRound.stageLabel,
        homeTeamName: finalRound.isHome ? playerClubName : finalRound.opponentName,
        awayTeamName: finalRound.isHome ? finalRound.opponentName : playerClubName,
        homeScore: 2,
        awayScore: 1,
        playerTeamScore: 2,
        opponentScore: 1,
        isPlayerHome: true,
        playerStatus: 'starter',
        minutesPlayed: 90,
        playerGoals: 1,
        playerAssists: 1,
        playerRating: 8.5,
        isMvp: true,
        isInjured: false,
        playerFitness: 90,
        importanceCategory: 'DEFINITIVE',
        importanceReason: `${compFull} Grand Final 🏆 — Continental championship decider!`,
        isKeyMatch: true,
        competitionName: compFull,
        competitionType: 'continental',
        continentalCompId: competitionId,
        continentalStage: 'final',
      });
    }

    return { unifiedMatches: unifiedList, continentalMatchesCount: knockoutFixturesToSchedule.length };
  }
}

/**
 * Synchronizes the continental tournament state when a continental fixture completes in the main simulation.
 */
export function syncContinentalSimulationAfterMatch(
  player: PlayerConfig,
  match: SimulatedMatchResult,
  seasonYear: number,
  onPlayerUpdate?: (updated: PlayerConfig) => void
): ContinentalTournamentSeasonState | null {
  if (!match.continentalCompId) return null;

  const compId = match.continentalCompId as ContinentalCompetitionId;
  let tourn = getContinentalTournamentState(compId, seasonYear);
  if (!tourn) return null;

  const playerClubName = player.club || 'Club';
  const playerClubId = player.clubId || `club_${playerClubName.toLowerCase().replace(/\s+/g, '_')}`;

  if (match.continentalStage === 'group' && match.continentalMatchday) {
    const md = match.continentalMatchday;
    const playerGroup = tourn.groups.find((g) =>
      g.teams.some((t) => t.id === playerClubId || t.name.toLowerCase() === playerClubName.toLowerCase() || t.isPlayer)
    );

    if (playerGroup) {
      const fix = playerGroup.fixtures.find(
        (f) => f.matchdayIndex === md && (f.homeTeamId === playerClubId || f.awayTeamId === playerClubId || f.homeTeamName.toLowerCase() === playerClubName.toLowerCase() || f.awayTeamName.toLowerCase() === playerClubName.toLowerCase() || f.isPlayerMatch)
      );

      if (fix) {
        fix.homeScore = match.homeScore;
        fix.awayScore = match.awayScore;
        fix.isCompleted = true;
      }
    }

    tourn = simulateContinentalGroupMatchday(tourn, md, player as any);
  } else if (match.continentalStage) {
    if (match.continentalStage === 'round_of_16') {
      const isLeg2 = match.stageName?.includes('2nd Leg') || match.matchIndex % 2 === 0;
      const tie = tourn.r16Ties?.find(
        (t) => t.teamA.id === playerClubId || t.teamB.id === playerClubId ||
               t.teamA.name.toLowerCase() === playerClubName.toLowerCase() || t.teamB.name.toLowerCase() === playerClubName.toLowerCase()
      );
      if (tie) {
        if (isLeg2 && tie.leg2) {
          tie.leg2.homeScore = match.isPlayerHome ? match.homeScore : match.awayScore;
          tie.leg2.awayScore = match.isPlayerHome ? match.awayScore : match.homeScore;
          tie.leg2.isCompleted = true;
          const aggA = tie.leg1.homeScore + tie.leg2.awayScore;
          const aggB = tie.leg1.awayScore + tie.leg2.homeScore;
          tie.winnerTeamId = aggA >= aggB ? tie.teamA.id : tie.teamB.id;
          tie.winnerTeamName = aggA >= aggB ? tie.teamA.name : tie.teamB.name;
          tie.aggregateHomeScore = aggA;
          tie.aggregateAwayScore = aggB;
        } else if (tie.leg1) {
          tie.leg1.homeScore = match.isPlayerHome ? match.homeScore : match.awayScore;
          tie.leg1.awayScore = match.isPlayerHome ? match.awayScore : match.homeScore;
          tie.leg1.isCompleted = true;
        }
        saveContinentalTournamentState(tourn);
      }
    } else if (match.continentalStage === 'quarter_final') {
      const isLeg2 = match.stageName?.includes('2nd Leg');
      const tie = tourn.qfTies?.find(
        (t) => t.teamA.id === playerClubId || t.teamB.id === playerClubId ||
               t.teamA.name.toLowerCase() === playerClubName.toLowerCase() || t.teamB.name.toLowerCase() === playerClubName.toLowerCase()
      );
      if (tie) {
        if (isLeg2 && tie.leg2) {
          tie.leg2.homeScore = match.isPlayerHome ? match.homeScore : match.awayScore;
          tie.leg2.awayScore = match.isPlayerHome ? match.awayScore : match.homeScore;
          tie.leg2.isCompleted = true;
          const aggA = tie.leg1.homeScore + tie.leg2.awayScore;
          const aggB = tie.leg1.awayScore + tie.leg2.homeScore;
          tie.winnerTeamId = aggA >= aggB ? tie.teamA.id : tie.teamB.id;
          tie.winnerTeamName = aggA >= aggB ? tie.teamA.name : tie.teamB.name;
          tie.aggregateHomeScore = aggA;
          tie.aggregateAwayScore = aggB;
        } else if (tie.leg1) {
          tie.leg1.homeScore = match.isPlayerHome ? match.homeScore : match.awayScore;
          tie.leg1.awayScore = match.isPlayerHome ? match.awayScore : match.homeScore;
          tie.leg1.isCompleted = true;
        }
        saveContinentalTournamentState(tourn);
      }
    } else if (match.continentalStage === 'semi_final') {
      const isLeg2 = match.stageName?.includes('2nd Leg');
      const tie = tourn.sfTies?.find(
        (t) => t.teamA.id === playerClubId || t.teamB.id === playerClubId ||
               t.teamA.name.toLowerCase() === playerClubName.toLowerCase() || t.teamB.name.toLowerCase() === playerClubName.toLowerCase()
      );
      if (tie) {
        if (isLeg2 && tie.leg2) {
          tie.leg2.homeScore = match.isPlayerHome ? match.homeScore : match.awayScore;
          tie.leg2.awayScore = match.isPlayerHome ? match.awayScore : match.homeScore;
          tie.leg2.isCompleted = true;
          const aggA = tie.leg1.homeScore + tie.leg2.awayScore;
          const aggB = tie.leg1.awayScore + tie.leg2.homeScore;
          tie.winnerTeamId = aggA >= aggB ? tie.teamA.id : tie.teamB.id;
          tie.winnerTeamName = aggA >= aggB ? tie.teamA.name : tie.teamB.name;
          tie.aggregateHomeScore = aggA;
          tie.aggregateAwayScore = aggB;
        } else if (tie.leg1) {
          tie.leg1.homeScore = match.isPlayerHome ? match.homeScore : match.awayScore;
          tie.leg1.awayScore = match.isPlayerHome ? match.awayScore : match.homeScore;
          tie.leg1.isCompleted = true;
        }
        saveContinentalTournamentState(tourn);
      }
    } else if (match.continentalStage === 'final') {
      if (tourn.finalTie?.leg1) {
        tourn.finalTie.leg1.homeScore = match.isPlayerHome ? match.homeScore : match.awayScore;
        tourn.finalTie.leg1.awayScore = match.isPlayerHome ? match.awayScore : match.homeScore;
        tourn.finalTie.leg1.isCompleted = true;
      }
      const isWon = match.playerTeamScore !== undefined && match.opponentScore !== undefined ? match.playerTeamScore > match.opponentScore : match.homeScore > match.awayScore;
      if (isWon) {
        tourn.championTeamId = playerClubId;
        tourn.championTeamName = playerClubName;
        tourn.playerClubIsChampion = true;
        tourn.playerClubStageReached = 'Champion 🏆';
        tourn.currentStage = 'completed';
        if (tourn.finalTie) {
          tourn.finalTie.winnerTeamId = playerClubId;
          tourn.finalTie.winnerTeamName = playerClubName;
        }

        if (onPlayerUpdate) {
          const compMeta = CONTINENTAL_COMPETITIONS_CATALOG[compId];
          const prestige = compMeta?.tier === 1 ? 100 : compMeta?.tier === 2 ? 80 : 60;
          const updatedPlayer = awardTrophiesToPlayer(player, [
            {
              name: compMeta?.name || 'Continental Champions Cup',
              category: 'continental',
              year: String(seasonYear),
              prestige: prestige,
              iconType: compMeta?.tier === 1 ? 'champions-league' : 'cup',
            },
          ]);
          onPlayerUpdate(updatedPlayer);
        }
      } else {
        tourn.playerClubStageReached = 'Runner-Up 🥈';
        tourn.currentStage = 'completed';
      }
      saveContinentalTournamentState(tourn);
    }
  }

  return tourn;
}
