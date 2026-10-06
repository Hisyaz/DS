import { PlayerConfig } from '../types';
import { YouthSeasonStats } from '../types/youthLeague';
import { PlayerMatchStatus, SimulatedMatchResult, YouthBlockSimulationOutput } from '../types/matchSimulation';
import { YOUTH_LEAGUES_DATABASE, getYouthLeagueByCity } from '../data/youthLeaguesDatabase';
import { isProfessionalPlayer } from './playerIdentitySystem';
import { classifyMatchImportance } from './matchImportanceSystem';
import { detectPlayerContinentalCompetition } from './continentalScheduleIntegration';
import { CONTINENTAL_COMPETITIONS_CATALOG } from './continentalDatabaseSystem';
import { buildUnifiedSeasonBlockMatches } from './continentalScheduleIntegration';
import { injectNationalTeamMatchesIntoBlock } from './internationalScheduleIntegration';
import { simulatePlayerGoalsAndAssists } from './goalAssistSimulationModifiers';
import { resolveAuthoritativeClubContext } from './clubContextRebuilder';
import { getCareerLeagueDatabase } from './careerSaveSystem';
import { getSanitizedTeamsForLeague } from './leagueSanitizer';
import { getWorldSimulationState } from './worldSimulationEngine';
import {
  getPermanentStamina,
  getFitnessPercentage,
  calculateFitnessLoss,
  calculateFitnessRecovery,
  calculateFitnessChangeByStatus,
  calculateInjuryRisk,
  checkManagerSelection,
  generateRandomInjury,
} from './staminaInjurySystem';
import {
  getOrCreateDisciplinaryRecord,
  checkAndApplyStageYellowClear,
  checkIsSuspendedForMatch,
  serveSuspensionForMatch,
  recordMatchDisciplinaryEvents,
} from './competitionDisciplinarySystem';
import {
  getBadRepRedCardChanceMultiplier,
  addBadReputation,
} from './badReputationSystem';

export function getCountryCupName(countryCodeOrName?: string): string {
  const code = (countryCodeOrName || '').toUpperCase().trim();
  if (code === 'ENG' || code === 'ENGLAND' || code === 'GB' || code === 'UK') return 'FA Cup';
  if (code === 'ESP' || code === 'SPAIN') return 'Copa del Rey';
  if (code === 'FR' || code === 'FRA' || code === 'FRANCE') return 'Coupe de France';
  if (code === 'GER' || code === 'DEU' || code === 'GERMANY') return 'DFB-Pokal';
  if (code === 'ITA' || code === 'ITALY' || code === 'ITALIA') return 'Coppa Italia';
  if (code === 'POR' || code === 'PRT' || code === 'PORTUGAL') return 'Taça de Portugal';
  if (code === 'ARG' || code === 'ARGENTINA') return 'Copa Argentina';
  if (code === 'BRA' || code === 'BRAZIL' || code === 'BRASIL') return 'Copa do Brasil';
  if (code === 'KSA' || code === 'SAU' || code === 'SAUDI' || code === 'SAUDI ARABIA') return "King's Cup";
  return 'Domestic Cup';
}

/**
 * Generates individual match results for a Youth or Pro Career block (9 matches per half-season block)
 */
export function generateYouthBlockMatches(
  player: PlayerConfig,
  blockNumber: 1 | 2,
  acceptedManagerRole: boolean = true
): YouthBlockSimulationOutput {
  const isPro = isProfessionalPlayer(player) || (player.age || 10) >= 16;
  const age = player.age || 10;
  const squadDest = player.squadDestination || (isPro ? (age <= 16 ? 'U17' : age <= 18 ? 'U20' : 'First Team') : 'Youth');
  const city = player.city || 'London';
  const leagueData = getYouthLeagueByCity(city) || YOUTH_LEAGUES_DATABASE.london;
  const categoryLabel = isPro ? '' : `U${age}`;

  const careerDb = getCareerLeagueDatabase();

  // Resolve authoritative club and league context
  const authContext = isPro
    ? resolveAuthoritativeClubContext(player.club || '', careerDb)
    : null;

  const playerClubName = isPro
    ? (authContext?.club || player.club || 'Pro Club')
    : (player.club || leagueData.teams[0]?.name || 'Villa Lugano Deportivo');

  // Get opponent teams exclusively from the authoritative competition
  let opponentTeams: { name: string; ovr: number; leagueId?: string }[] = [];
  if (isPro && authContext) {
    const sanitizedTeams = getSanitizedTeamsForLeague(authContext.leagueId, careerDb);
    opponentTeams = sanitizedTeams
      .filter((t) => t.name.toLowerCase() !== playerClubName.toLowerCase() && !t.name.toLowerCase().includes(playerClubName.toLowerCase()))
      .map((t) => ({
        name: t.name,
        ovr: t.ovr || 75,
        leagueId: authContext.leagueId,
      }));

    if (opponentTeams.length === 0) {
      const fallbackLeagueTeams = getSanitizedTeamsForLeague(authContext.canonicalD1Id, careerDb);
      opponentTeams = fallbackLeagueTeams
        .filter((t) => t.name.toLowerCase() !== playerClubName.toLowerCase())
        .map((t) => ({ name: t.name, ovr: t.ovr || 75, leagueId: authContext.canonicalD1Id }));
    }
  } else {
    opponentTeams = leagueData.teams
      .filter((t) => t.name.toLowerCase() !== playerClubName.toLowerCase())
      .map((t) => ({ name: t.name, ovr: t.ovr }));
  }

  const totalMatchesInBlock = 9; // Double round robin = 18 total matches (9 per block)
  const ovr = player.ovr || 60;
  const staminaAttr = getPermanentStamina(player);
  let currentFitness = getFitnessPercentage(player);
  const primaryPos = player.position || 'ATT';

  const matches: SimulatedMatchResult[] = [];

  let gamesPlayed = 0;
  let starts = 0;
  let subs = 0;
  let benchCount = 0;
  let totalMinutesPlayed = 0;
  let totalMvps = 0;
  let totalGoals = 0;
  let totalAssists = 0;
  let totalRatingSum = 0;
  let cleanSheets = 0;
  let yellowCards = 0;
  let redCards = 0;
  let injuryMatchesMissed = 0;
  let remainingInjuryMatches = player.isInjured
    ? Math.max(1, Math.ceil((player.injuryWeeksRemaining || 2) / 2))
    : 0;

  for (let i = 0; i < totalMatchesInBlock; i++) {
    const matchNumber = (blockNumber - 1) * totalMatchesInBlock + i + 1;
    let opponent = opponentTeams[i % opponentTeams.length] || { name: 'Rivals FC', ovr: 60 };
    let isPlayerHome = i % 2 === 0;

    let homeTeamName = '';
    let awayTeamName = '';
    let competitionName = 'League Match';

    if (isPro && authContext) {
      // MATCHMAKING VALIDATION: Ensure domestic opponent matches the authoritative league
      const cupName = getCountryCupName(authContext.countryCode || authContext.clubCountry);
      const contCompId = detectPlayerContinentalCompetition(player, careerDb);
      const contMeta = contCompId ? CONTINENTAL_COMPETITIONS_CATALOG[contCompId] : null;
      const intlName = contMeta ? contMeta.name : null;

      if (squadDest === 'First Team') {
        if (i % 4 === 1) {
          competitionName = cupName;
          homeTeamName = isPlayerHome ? playerClubName : opponent.name;
          awayTeamName = isPlayerHome ? opponent.name : playerClubName;
        } else if (i % 4 === 3 && intlName) {
          competitionName = intlName;
          homeTeamName = isPlayerHome ? playerClubName : opponent.name;
          awayTeamName = isPlayerHome ? opponent.name : playerClubName;
        } else {
          competitionName = authContext.league;
          // Synchronize with authoritative World Results fixture schedule
          try {
            const worldState = getWorldSimulationState(undefined, careerDb, player as any);
            for (const league of Object.values(worldState.leagues)) {
              if (
                league.name.toLowerCase() === authContext.league.toLowerCase() ||
                (authContext.canonicalD1Id && league.leagueId === authContext.canonicalD1Id)
              ) {
                const fixtures = league.matchdays[matchNumber] || [];
                const matchedFix = fixtures.find(
                  (f) =>
                    f.homeTeamName.toLowerCase() === playerClubName.toLowerCase() ||
                    f.awayTeamName.toLowerCase() === playerClubName.toLowerCase()
                );
                if (matchedFix) {
                  const isUserHome = matchedFix.homeTeamName.toLowerCase() === playerClubName.toLowerCase();
                  isPlayerHome = isUserHome;
                  homeTeamName = matchedFix.homeTeamName;
                  awayTeamName = matchedFix.awayTeamName;
                  opponent = {
                    name: isUserHome ? matchedFix.awayTeamName : matchedFix.homeTeamName,
                    ovr: isUserHome ? (matchedFix.awayTeamOvr || 75) : (matchedFix.homeTeamOvr || 75),
                    leagueId: authContext.canonicalD1Id,
                  };
                  break;
                }
              }
            }
          } catch (e) {
            // graceful fallback
          }

          if (!homeTeamName) {
            homeTeamName = isPlayerHome ? playerClubName : opponent.name;
            awayTeamName = isPlayerHome ? opponent.name : playerClubName;
          }
        }
      } else if (squadDest === 'Reserves') {
        competitionName = i % 4 === 1 ? `${authContext.league} Reserves Cup` : `${authContext.league} Reserves`;
        homeTeamName = isPlayerHome ? `${playerClubName} Reserves` : `${opponent.name} Reserves`;
        awayTeamName = isPlayerHome ? `${opponent.name} Reserves` : `${playerClubName} Reserves`;
      } else if (squadDest === 'U20') {
        competitionName = i % 4 === 1 ? `${authContext.league} U20 Cup` : `${authContext.league} U20`;
        homeTeamName = isPlayerHome ? `${playerClubName} U20` : `${opponent.name} U20`;
        awayTeamName = isPlayerHome ? `${opponent.name} U20` : `${playerClubName} U20`;
      } else {
        // U17
        competitionName = i % 4 === 1 ? `${authContext.league} U17 Cup` : `${authContext.league} U17`;
        homeTeamName = isPlayerHome ? `${playerClubName} U17` : `${opponent.name} U17`;
        awayTeamName = isPlayerHome ? `${opponent.name} U17` : `${playerClubName} U17`;
      }
    } else {
      competitionName = `Youth League ${categoryLabel}`;
      homeTeamName = isPlayerHome ? `${playerClubName} ${categoryLabel}` : `${opponent.name} ${categoryLabel}`;
      awayTeamName = isPlayerHome ? `${opponent.name} ${categoryLabel}` : `${playerClubName} ${categoryLabel}`;
    }

    // Apply rest/recovery between matches (3.5 days)
    if (i > 0) {
      const recovered = calculateFitnessRecovery(staminaAttr, 3.5);
      currentFitness = Math.min(100, parseFloat((currentFitness + recovered).toFixed(1)));
    }

    // Check injury status
    let isInjuredThisMatch = false;
    if (remainingInjuryMatches > 0) {
      isInjuredThisMatch = true;
      remainingInjuryMatches--;
      injuryMatchesMissed++;
    }

    // Determine match selection and status
    // Statuses: 'starter', 'sub_out', 'sub_in', 'benched', 'not_called'
    let status: PlayerMatchStatus = 'benched';
    let minutesPlayed = 0;

    // Calculate dynamic match importance (Definitive, Important, Regular)
    const importanceEval = classifyMatchImportance({
      stageTitle: `Match ${matchNumber}`,
      competitionName,
      teamAName: isPlayerHome ? homeTeamName : awayTeamName,
      teamBName: isPlayerHome ? awayTeamName : homeTeamName,
      currentMatchIndex: matchNumber - 1,
      totalMatchesInSeason: 18,
      playerPlayMode: player.keyMatchPlayMode || 'decisive',
    });

    const isImportantMatch =
      importanceEval.category === 'DEFINITIVE' ||
      importanceEval.category === 'IMPORTANT' ||
      i === totalMatchesInBlock - 1;

    if (!isInjuredThisMatch) {
      const selection = checkManagerSelection(
        { ...player, fitness: currentFitness, staminaCurrent: currentFitness, isInjured: false },
        isImportantMatch
      );

      if (selection.recommendedStatus === 'starter') {
        // Decide if subbed out before minute 70 or plays 70+ mins
        const isSubbedOutEarly = !isImportantMatch && (currentFitness < 75 || Math.random() < 0.25);
        if (isSubbedOutEarly) {
          minutesPlayed = Math.floor(48 + Math.random() * 20); // 48 - 67 mins (< 70)
          status = 'sub_out';
        } else {
          minutesPlayed = Math.floor(70 + Math.random() * 21); // 70 - 90 mins
          status = 'starter';
        }
        starts++;
        gamesPlayed++;
      } else if (selection.recommendedStatus === 'sub') {
        // Roll if sub enters the match (~80% enters, ~20% benched all game)
        const willEnter = Math.random() < 0.80;
        if (willEnter) {
          minutesPlayed = Math.floor(18 + Math.random() * 28); // 18 - 45 mins
          status = 'sub_in';
          subs++;
          gamesPlayed++;
        } else {
          minutesPlayed = 0;
          status = 'benched';
          benchCount++;
        }
      } else {
        minutesPlayed = 0;
        status = 'benched';
        benchCount++;
      }
    } else {
      minutesPlayed = 0;
      status = 'not_called';
      benchCount++;
    }

    // Apply fitness change according to new status and minutes played
    const fitChange = calculateFitnessChangeByStatus(staminaAttr, status, minutesPlayed);
    currentFitness = Math.max(0, Math.min(100, parseFloat((currentFitness + fitChange.netChange).toFixed(1))));

    // Calculate match team score
    const playerTeamOvr = ovr + 2;
    const opponentOvr = opponent.ovr || 60;
    const teamOvrDiff = playerTeamOvr - opponentOvr;

    let playerTeamScore = Math.max(0, Math.floor(1.5 + teamOvrDiff * 0.05 + (Math.random() - 0.4) * 2));
    let opponentTeamScore = Math.max(0, Math.floor(1.2 - teamOvrDiff * 0.05 + (Math.random() - 0.4) * 2));

    const homeScore = isPlayerHome ? playerTeamScore : opponentTeamScore;
    const awayScore = isPlayerHome ? opponentTeamScore : playerTeamScore;

    let playerGoals = 0;
    let playerAssists = 0;
    let matchRating: number | undefined = undefined;
    let isMvp = false;
    let matchYellow = false;
    let matchRed = false;

    const isPlayed = status === 'starter' || status === 'sub_out' || status === 'sub_in';

    if (isPlayed && minutesPlayed > 0) {
      const perfFactor = (minutesPlayed / 90) * (ovr / opponentOvr);
      const matchVariance = (Math.random() - 0.45) * 1.8;

      // Base rating
      let rawRating = 6.0 + (perfFactor - 0.8) * 2.5 + matchVariance;
      if (playerTeamScore > opponentTeamScore) rawRating += 0.5;

      // Calculate goals & assists using Strategy -> Position -> Sub-Position -> Playstyle -> Weak Foot modifier engine
      const sim = simulatePlayerGoalsAndAssists(player, perfFactor, playerTeamScore, {
        teamStrategy: (player as any).teamStrategy || (player as any).tactics?.style,
        minutesPlayed,
        opponentOvr,
      });
      playerGoals = sim.playerGoals;
      playerAssists = sim.playerAssists;

      if ((primaryPos === 'DEF' || primaryPos === 'GK') && opponentTeamScore === 0) {
        cleanSheets++;
      }

      // Ensure goals do not exceed team score
      playerGoals = Math.min(playerGoals, playerTeamScore);
      if (playerGoals > 0 && playerTeamScore === 0) playerTeamScore = playerGoals;

      // Boost rating for goals & assists: dribble goals and assists add DOUBLE rating points
      const dribbleGoals = Math.min(playerGoals, (sim as any).dribbleGoals || 0);
      const regularGoals = playerGoals - dribbleGoals;
      const dribbleAssists = Math.min(playerAssists, (sim as any).dribbleAssists || 0);
      const regularAssists = playerAssists - dribbleAssists;

      rawRating += (regularGoals * 0.8 + dribbleGoals * 1.6) + (regularAssists * 0.5 + dribbleAssists * 1.0);
      matchRating = parseFloat(Math.min(10.0, Math.max(5.5, rawRating)).toFixed(1));

      totalGoals += playerGoals;
      totalAssists += playerAssists;
      totalRatingSum += matchRating;

      // Check MVP (highest contributor)
      if (matchRating >= 8.0 && (playerGoals > 0 || playerAssists > 0 || matchRating >= 8.8)) {
        isMvp = true;
        totalMvps++;
      }

      totalMinutesPlayed += minutesPlayed;

      // Check disciplinary cards with bad fame red card probability multiplier
      const redMultiplier = getBadRepRedCardChanceMultiplier(player.badReputationTier || 0);
      if (Math.random() < 0.12) {
        matchYellow = true;
        yellowCards++;
      } else if (Math.random() < (0.02 * redMultiplier)) {
        matchRed = true;
        redCards++;
        // Straight red card gives +10 bad fame (bad reputation)
        const repRes = addBadReputation(player as any, 10);
        player.badReputation = repRes.updatedPlayer.badReputation;
        player.badReputationTier = repRes.updatedPlayer.badReputationTier;
      }

      // Injury chance based on current Fitness
      const { riskPercentage } = calculateInjuryRisk({
        ...player,
        fitness: currentFitness,
        staminaCurrent: currentFitness,
      });

      if (Math.random() * 100 < riskPercentage) {
        isInjuredThisMatch = true;
        const inj = generateRandomInjury();
        remainingInjuryMatches = Math.max(1, Math.ceil((inj.weeks || 2) / 2));
      }
    }

    matches.push({
      matchId: `youth-b${blockNumber}-m${matchNumber}`,
      matchIndex: matchNumber,
      matchdayIndex: matchNumber,
      stageName: `MATCH ${matchNumber}`,
      homeTeamName,
      awayTeamName,
      homeScore,
      awayScore,
      playerTeamScore,
      opponentScore: opponentTeamScore,
      isPlayerHome,
      playerStatus: status,
      minutesPlayed,
      playerGoals,
      playerAssists,
      playerRating: matchRating,
      isMvp,
      yellowCard: matchYellow,
      redCard: matchRed,
      isInjured: isInjuredThisMatch,
      cleanSheet: isPlayed && opponentTeamScore === 0,
      playerFitness: Math.round(currentFitness),
      importanceCategory: importanceEval.category,
      isDerby: importanceEval.isDerby,
      derbyName: importanceEval.derbyName,
      importanceReason: importanceEval.reasonTitle,
      isKeyMatch: Boolean(importanceEval.isPlayableInCurrentMode && isPlayed && !isInjuredThisMatch && minutesPlayed > 0),
    });
  }

  const seasonYear = 2026 + ((player.age || 10) - 10);
  const { unifiedMatches: contUnifiedMatches } = buildUnifiedSeasonBlockMatches(player, blockNumber, matches, seasonYear);
  const { unifiedMatches } = injectNationalTeamMatchesIntoBlock(contUnifiedMatches, player, blockNumber, seasonYear);

  // Apply Authentic Disciplinary System across the complete unified match calendar
  const disciplinaryStore = (player as any).disciplinaryStore ? { ...(player as any).disciplinaryStore } : {};

  unifiedMatches.forEach((m) => {
    const compName = m.competitionName || (m.isNationalTeamMatch ? 'National Championship' : 'Domestic League');
    const compType = m.competitionType || (m.isNationalTeamMatch ? 'national' : 'league');
    const contId = m.continentalCompId;

    const { key, state: discState, rules } = getOrCreateDisciplinaryRecord(
      disciplinaryStore,
      compName,
      compType,
      contId
    );

    // 1. Stage-based Yellow Card Clears (World Cup group stage & QF; Champions league phase & QF)
    const stageName = m.stageName || (m as any).continentalStage || '';
    const { updatedState: clearedState } = checkAndApplyStageYellowClear(discState, stageName, rules);
    let activeState = clearedState;

    // 2. Check for active suspension for this specific competition
    const { isSuspended, reason: suspReason } = checkIsSuspendedForMatch(activeState);

    if (isSuspended) {
      // Player is barred from participating in this match of this competition!
      m.playerStatus = 'suspended';
      m.minutesPlayed = 0;
      m.playerGoals = 0;
      m.playerAssists = 0;
      m.playerRating = undefined;
      m.isMvp = false;
      m.yellowCard = false;
      m.redCard = false;
      m.isSuspended = true;
      m.suspensionReason = suspReason || 'Disciplinary Suspension';
      m.isKeyMatch = false;

      // Serve the suspension for this competition
      activeState = serveSuspensionForMatch(activeState);
      disciplinaryStore[key] = activeState;
    } else {
      m.isSuspended = false;
      m.suspensionReason = undefined;

      // 3. If player participated on the pitch, process cards
      const isPlayed = m.playerStatus === 'starter' || m.playerStatus === 'sub_out' || m.playerStatus === 'sub_in';
      if (isPlayed && (m.minutesPlayed || 0) > 0) {
        const gotYellow = Boolean(m.yellowCard);
        const gotRed = Boolean(m.redCard);

        if (gotYellow || gotRed) {
          const outcome = recordMatchDisciplinaryEvents(activeState, rules, gotYellow, gotRed);
          activeState = outcome.updatedState;
          disciplinaryStore[key] = activeState;
        }
      }
    }
  });

  (player as any).disciplinaryStore = disciplinaryStore;

  let finalGamesPlayed = 0;
  let finalMinutesPlayed = 0;
  let finalGoals = 0;
  let finalAssists = 0;
  let finalRatingSum = 0;
  let finalCleanSheets = 0;
  let finalYellowCards = 0;
  let finalRedCards = 0;
  let finalInjuryMatchesMissed = 0;
  let finalMvps = 0;

  unifiedMatches.forEach((m) => {
    // National team matches have separate international stat tracking and do not mix with domestic club league tables
    if (m.isNationalTeamMatch || m.competitionType === 'national') return;

    const isP = m.playerStatus === 'starter' || m.playerStatus === 'sub_out' || m.playerStatus === 'sub_in';
    if (isP) {
      finalGamesPlayed++;
      finalMinutesPlayed += m.minutesPlayed || 0;
      finalGoals += m.playerGoals || 0;
      finalAssists += m.playerAssists || 0;
      if (m.playerRating) finalRatingSum += m.playerRating;
      if (m.cleanSheet) finalCleanSheets++;
      if (m.isMvp) finalMvps++;
    }
    if (m.yellowCard) finalYellowCards++;
    if (m.redCard) finalRedCards++;
    if (m.isInjured) finalInjuryMatchesMissed++;
  });

  const finalAvgRating = finalGamesPlayed > 0 ? parseFloat((finalRatingSum / finalGamesPlayed).toFixed(1)) : 6.5;

  const aggregatedStats: YouthSeasonStats = {
    gamesPlayed: finalGamesPlayed,
    minutesPlayed: finalMinutesPlayed,
    goals: finalGoals,
    assists: finalAssists,
    avgRating: finalAvgRating,
    cleanSheets: finalCleanSheets,
    yellowCards: finalYellowCards,
    redCards: finalRedCards,
    injuryMatchesMissed: finalInjuryMatchesMissed,
    mvps: finalMvps,
  };

  return {
    matches: unifiedMatches,
    aggregatedStats,
  };
}

/**
 * Generates a single live match result for tournament stage matches, calculating fitness consumption
 * and returning the updated player career state.
 */
export function generateTournamentMatchResult(
  player: PlayerConfig,
  stageName: string,
  opponentName: string,
  opponentOvr: number
): {
  matchResult: SimulatedMatchResult;
  updatedPlayer: PlayerConfig;
} {
  const ovr = player.ovr || 60;
  const primaryPos = player.position || 'ATT';
  const playerClubName = player.club || 'Villa Lugano Deportivo';
  const age = player.age || 10;
  const categoryLabel = `U${age}`;

  const homeTeamName = `${playerClubName} ${categoryLabel}`;
  const awayTeamName = opponentName.includes('U') ? opponentName : `${opponentName} ${categoryLabel}`;

  const playerTeamOvr = ovr + 2;
  const diff = playerTeamOvr - opponentOvr;

  const playerTeamScore = Math.max(0, Math.floor(1.5 + diff * 0.05 + (Math.random() - 0.3) * 2));
  const opponentTeamScore = Math.max(0, Math.floor(1.2 - diff * 0.05 + (Math.random() - 0.3) * 2));

  // Read current authoritative fitness
  const staminaAttr = getPermanentStamina(player);
  let currentFitness = getFitnessPercentage(player);

  // Determine stage importance: Knockouts (Quarter, Semi, Final) are high stakes!
  const isKnockout =
    stageName.includes('Quarter') ||
    stageName.includes('Semi') ||
    stageName.includes('Final') ||
    stageName.includes('Decider');

  let status: PlayerMatchStatus = 'benched';
  let minutesPlayed = 0;

  if (player.isInjured) {
    status = 'not_called';
    minutesPlayed = 0;
  } else {
    const selection = checkManagerSelection(
      { ...player, fitness: currentFitness, staminaCurrent: currentFitness, isInjured: false },
      isKnockout
    );

    if (selection.recommendedStatus === 'starter') {
      const isSubbedOutEarly = !isKnockout && (currentFitness < 75 || Math.random() < 0.2);
      if (isSubbedOutEarly) {
        minutesPlayed = Math.floor(50 + Math.random() * 18); // 50 - 67 mins (< 70)
        status = 'sub_out';
      } else {
        minutesPlayed = Math.floor(70 + Math.random() * 21); // 70 - 90 mins
        status = 'starter';
      }
    } else if (selection.recommendedStatus === 'sub') {
      const willEnter = Math.random() < 0.85;
      if (willEnter) {
        minutesPlayed = Math.floor(18 + Math.random() * 28);
        status = 'sub_in';
      } else {
        minutesPlayed = 0;
        status = 'benched';
      }
    } else {
      minutesPlayed = 0;
      status = 'benched';
    }
  }

  // Calculate fitness change
  const fitChange = calculateFitnessChangeByStatus(staminaAttr, status, minutesPlayed);
  currentFitness = Math.max(0, Math.min(100, parseFloat((currentFitness + fitChange.netChange).toFixed(1))));

  const isPlayed = status === 'starter' || status === 'sub_out' || status === 'sub_in';

  // Roll for injury risk if played
  let isInjuredThisMatch = player.isInjured || false;
  let injuryName = player.injuryName;
  let injuryWeeksRemaining = player.injuryWeeksRemaining;
  let injuryTotalWeeks = player.injuryTotalWeeks;

  if (isPlayed && !player.isInjured && minutesPlayed > 0) {
    const { riskPercentage } = calculateInjuryRisk({
      ...player,
      fitness: currentFitness,
      staminaCurrent: currentFitness,
    });
    if (Math.random() * 100 < riskPercentage) {
      isInjuredThisMatch = true;
      const inj = generateRandomInjury();
      injuryName = inj.name;
      injuryWeeksRemaining = inj.weeks;
      injuryTotalWeeks = inj.weeks;
    }
  }

  let playerGoals = 0;
  let playerAssists = 0;

  if (isPlayed && minutesPlayed > 0) {
    const factor = (minutesPlayed / 90) * (ovr / opponentOvr);
    const sim = simulatePlayerGoalsAndAssists(player, factor, playerTeamScore);
    playerGoals = sim.playerGoals;
    playerAssists = sim.playerAssists;
  }

  playerGoals = Math.min(playerGoals, playerTeamScore);
  const perfFactor = (ovr / opponentOvr) + (playerGoals * 0.5) + (playerAssists * 0.3);
  const rawRating = 6.2 + perfFactor * 1.2 + (Math.random() - 0.4) * 1.2;
  const matchRating = isPlayed ? parseFloat(Math.min(10.0, Math.max(6.0, rawRating)).toFixed(1)) : undefined;

  const isMvp = matchRating ? matchRating >= 8.2 && (playerGoals > 0 || playerAssists > 0 || matchRating >= 8.8) : false;

  const roundedFit = Math.round(currentFitness);

  const importanceEval = classifyMatchImportance({
    stageTitle: stageName,
    competitionName: 'International Youth Cup',
    teamAName: homeTeamName,
    teamBName: awayTeamName,
    isFinalMatchday: stageName.toLowerCase().includes('final'),
    playerPlayMode: player.keyMatchPlayMode || 'decisive',
  });

  const redMultiplier = getBadRepRedCardChanceMultiplier(player.badReputationTier || 0);
  const matchYellow = Math.random() < 0.1;
  const matchRed = !matchYellow && Math.random() < (0.01 * redMultiplier);

  let updatedBadRep = player.badReputation;
  let updatedBadRepTier = player.badReputationTier;
  if (matchRed) {
    const repRes = addBadReputation(player as any, 10);
    updatedBadRep = repRes.updatedPlayer.badReputation;
    updatedBadRepTier = repRes.updatedPlayer.badReputationTier;
  }

  const matchResult: SimulatedMatchResult = {
    matchId: `tourn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    matchIndex: 1,
    stageName,
    homeTeamName,
    awayTeamName,
    homeScore: playerTeamScore,
    awayScore: opponentTeamScore,
    isPlayerHome: true,
    playerStatus: status,
    minutesPlayed,
    playerGoals,
    playerAssists,
    playerRating: matchRating,
    isMvp,
    yellowCard: matchYellow,
    redCard: matchRed,
    isInjured: isInjuredThisMatch,
    playerFitness: roundedFit,
    importanceCategory: importanceEval.category,
    isDerby: importanceEval.isDerby,
    derbyName: importanceEval.derbyName,
    importanceReason: importanceEval.reasonTitle,
    isKeyMatch: Boolean(importanceEval.isPlayableInCurrentMode && isPlayed && !isInjuredThisMatch && minutesPlayed > 0),
  };

  const updatedPlayer: PlayerConfig = {
    ...player,
    fitness: roundedFit,
    staminaCurrent: roundedFit,
    isInjured: isInjuredThisMatch,
    injuryName: isInjuredThisMatch ? injuryName : player.injuryName,
    injuryWeeksRemaining: isInjuredThisMatch ? injuryWeeksRemaining : player.injuryWeeksRemaining,
    injuryTotalWeeks: isInjuredThisMatch ? injuryTotalWeeks : player.injuryTotalWeeks,
    hasSeenInjuryModal: isInjuredThisMatch && !player.isInjured ? false : player.hasSeenInjuryModal,
    badReputation: updatedBadRep,
    badReputationTier: updatedBadRepTier,
  };

  return {
    matchResult,
    updatedPlayer,
  };
}

