/**
 * Competition Disciplinary & Suspension Rules System
 *
 * Enforces authentic competition-specific disciplinary regulations:
 * 1. World Cup & Major International Tournaments (World Cup, Euros, Copa America, Asian Cup, AFCON, Gold Cup, U20/U17 WC):
 *    - 2 Yellow Cards = 1-match suspension for the next match of that competition.
 *    - Yellow card count CLEARS after the Group Stage.
 *    - Yellow card count CLEARS again after the Quarter-Finals (preventing a yellow in the semi-final from barring a player from the final).
 *    - Red Card = 1-match suspension for the next match of that competition.
 *
 * 2. Champions / Continental Tournaments (UEFA Champions League, Europa League, Conference League, Copa Libertadores, etc.):
 *    - 2 Yellow Cards = 1-match suspension for the next match of that competition.
 *    - Yellow card count CLEARS after the League Phase / Group Stage.
 *    - Yellow card count CLEARS again after the Quarter-Finals.
 *    - Red Card = 1-match suspension for the next match of that competition.
 *
 * 3. Domestic Leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Youth Leagues, Reserves):
 *    - 4 Yellow Cards = 1-match suspension for the next match of that league.
 *    - NO midway clearing (accumulation stays active across the league season).
 *    - Red Card = 1-match suspension for the next match of that league.
 *
 * 4. Domestic Cups (FA Cup, Copa del Rey, DFB-Pokal, etc.):
 *    - 2 Yellow Cards = 1-match suspension.
 *    - Red Card = 1-match suspension.
 *
 * Crucial Rule: Suspensions are isolated strictly per competition. A red card in Champions League
 * suspends the player from the next Champions League match, not the domestic league match.
 */

export type CompetitionDisciplinaryCategory =
  | 'world_cup'
  | 'international'
  | 'continental'
  | 'league'
  | 'domestic_cup';

export interface CompetitionDisciplinaryRules {
  category: CompetitionDisciplinaryCategory;
  name: string;
  yellowsForSuspension: number;
  clearsAfterGroupOrLeaguePhase: boolean;
  clearsAfterQuarterFinals: boolean;
  redCardSuspensionMatches: number;
  description: string;
}

export interface CompetitionDisciplinaryState {
  competitionKey: string;
  competitionName: string;
  category: CompetitionDisciplinaryCategory;
  activeYellowCount: number;
  totalYellowsSeason: number;
  totalRedsSeason: number;
  isSuspendedForNextMatch: boolean;
  suspendedMatchesRemaining: number;
  suspensionReason?: 'red_card' | 'yellow_accumulation';
  suspensionDetail?: string;
  clearedGroupStage?: boolean;
  clearedQuarterFinals?: boolean;
}

export type CompetitionDisciplinaryStore = Record<string, CompetitionDisciplinaryState>;

/**
 * Classifies a competition into its appropriate disciplinary rules category.
 */
export function getCompetitionDisciplinaryCategory(
  competitionName: string = '',
  compType: string = '',
  continentalCompId: string = ''
): CompetitionDisciplinaryCategory {
  const normName = competitionName.toLowerCase();
  const normType = compType.toLowerCase();
  const normId = continentalCompId.toLowerCase();

  // 1. World Cup / Major International Competitions
  if (
    normType === 'national' ||
    normName.includes('world cup') ||
    normName.includes('copa mundial') ||
    normName.includes('mundial') ||
    normName.includes('fifa') ||
    normName.includes('euro') ||
    normName.includes('copa américa') ||
    normName.includes('copa america') ||
    normName.includes('asian cup') ||
    normName.includes('afcon') ||
    normName.includes('gold cup') ||
    normName.includes('eliminatorias') ||
    normName.includes('qualifier') ||
    normName.includes('nations league')
  ) {
    if (normName.includes('world cup') || normName.includes('mundial')) {
      return 'world_cup';
    }
    return 'international';
  }

  // 2. Champions / Continental Competitions
  if (
    normType === 'continental' ||
    normId.length > 0 ||
    normName.includes('champions league') ||
    normName.includes('uefa_cl') ||
    normName.includes('europa league') ||
    normName.includes('conference league') ||
    normName.includes('libertadores') ||
    normName.includes('sudamericana') ||
    normName.includes('afc champions') ||
    normName.includes('caf champions') ||
    normName.includes('super cup') ||
    normName.includes('recopa')
  ) {
    return 'continental';
  }

  // 3. Domestic Cups
  if (
    normType === 'cup' ||
    normName.includes('fa cup') ||
    normName.includes('copa del rey') ||
    normName.includes('dfb-pokal') ||
    normName.includes('coppa italia') ||
    normName.includes('coupe de france') ||
    normName.includes('taça de portugal') ||
    normName.includes('copa argentina') ||
    normName.includes('copa do brasil') ||
    normName.includes("king's cup") ||
    normName.includes('domestic cup') ||
    normName.includes('carabao cup')
  ) {
    return 'domestic_cup';
  }

  // 4. Default: Domestic League (Premier League, La Liga, Serie A, Youth League, etc.)
  return 'league';
}

/**
 * Returns the exact rule set for a given competition.
 */
export function getCompetitionDisciplinaryRules(
  competitionName: string = '',
  compType: string = '',
  continentalCompId: string = ''
): CompetitionDisciplinaryRules {
  const category = getCompetitionDisciplinaryCategory(competitionName, compType, continentalCompId);

  switch (category) {
    case 'world_cup':
      return {
        category: 'world_cup',
        name: 'World Cup Rules',
        yellowsForSuspension: 2,
        clearsAfterGroupOrLeaguePhase: true,
        clearsAfterQuarterFinals: true,
        redCardSuspensionMatches: 1,
        description: '2 yellows = 1-match ban. Yellows clear after group stage and after quarter-finals. Red = 1-match ban.',
      };
    case 'international':
      return {
        category: 'international',
        name: 'International Championship Rules',
        yellowsForSuspension: 2,
        clearsAfterGroupOrLeaguePhase: true,
        clearsAfterQuarterFinals: true,
        redCardSuspensionMatches: 1,
        description: '2 yellows = 1-match ban. Yellows clear after group stage and after quarter-finals. Red = 1-match ban.',
      };
    case 'continental':
      return {
        category: 'continental',
        name: 'Continental / Champions League Rules',
        yellowsForSuspension: 2,
        clearsAfterGroupOrLeaguePhase: true,
        clearsAfterQuarterFinals: true,
        redCardSuspensionMatches: 1,
        description: '2 yellows = 1-match ban. Yellows clear after league/group phase and after quarter-finals. Red = 1-match ban.',
      };
    case 'domestic_cup':
      return {
        category: 'domestic_cup',
        name: 'Domestic Cup Rules',
        yellowsForSuspension: 2,
        clearsAfterGroupOrLeaguePhase: false,
        clearsAfterQuarterFinals: false,
        redCardSuspensionMatches: 1,
        description: '2 yellows = 1-match ban. Red = 1-match ban.',
      };
    case 'league':
    default:
      return {
        category: 'league',
        name: 'Domestic League Rules',
        yellowsForSuspension: 4, // 3-4 yellows sanction rule, standard 4
        clearsAfterGroupOrLeaguePhase: false, // No clears then
        clearsAfterQuarterFinals: false,
        redCardSuspensionMatches: 1,
        description: '4 yellows = 1-match ban (no clears during season). Red = 1-match ban.',
      };
  }
}

/**
 * Produces a stable competition identifier key for disciplinary state storage.
 * Ensures isolation so a card in Champions League only affects Champions League, etc.
 */
export function resolveCompetitionDisciplinaryKey(
  competitionName: string = '',
  compType: string = '',
  continentalCompId: string = ''
): string {
  const category = getCompetitionDisciplinaryCategory(competitionName, compType, continentalCompId);

  if (category === 'continental') {
    if (continentalCompId && continentalCompId.trim().length > 0) {
      return `cont_${continentalCompId.toLowerCase()}`;
    }
    if (competitionName.toLowerCase().includes('europa')) return 'cont_uefa_el';
    if (competitionName.toLowerCase().includes('conference')) return 'cont_uefa_ecl';
    if (competitionName.toLowerCase().includes('libertadores')) return 'cont_conmebol_lib';
    return 'cont_uefa_cl';
  }

  if (category === 'world_cup') {
    return 'national_world_cup';
  }

  if (category === 'international') {
    return 'national_tournament';
  }

  if (category === 'domestic_cup') {
    return 'domestic_cup';
  }

  return 'domestic_league';
}

/**
 * Creates an empty disciplinary record for a competition.
 */
export function createInitialDisciplinaryState(
  compKey: string,
  compName: string,
  category: CompetitionDisciplinaryCategory
): CompetitionDisciplinaryState {
  return {
    competitionKey: compKey,
    competitionName: compName,
    category,
    activeYellowCount: 0,
    totalYellowsSeason: 0,
    totalRedsSeason: 0,
    isSuspendedForNextMatch: false,
    suspendedMatchesRemaining: 0,
  };
}

/**
 * Retrieves or initializes the disciplinary state for a competition.
 */
export function getOrCreateDisciplinaryRecord(
  store: CompetitionDisciplinaryStore,
  competitionName: string = '',
  compType: string = '',
  continentalCompId: string = ''
): { key: string; state: CompetitionDisciplinaryState; rules: CompetitionDisciplinaryRules } {
  const key = resolveCompetitionDisciplinaryKey(competitionName, compType, continentalCompId);
  const rules = getCompetitionDisciplinaryRules(competitionName, compType, continentalCompId);

  const existing = store[key];
  if (existing) {
    return { key, state: existing, rules };
  }

  const newState = createInitialDisciplinaryState(key, competitionName, rules.category);
  return { key, state: newState, rules };
}

/**
 * Checks if yellow cards should be cleared based on the stage transition.
 * e.g.,
 * - Clearing after Group Stage / League Phase
 * - Clearing after Quarter-Finals
 */
export function checkAndApplyStageYellowClear(
  state: CompetitionDisciplinaryState,
  stageName: string = '',
  rules: CompetitionDisciplinaryRules
): { updatedState: CompetitionDisciplinaryState; didClear: boolean; reason?: string } {
  const normStage = stageName.toLowerCase();
  let didClear = false;
  let reason: string | undefined;

  const nextState: CompetitionDisciplinaryState = { ...state };

  // Check group stage / league phase completion clear
  if (rules.clearsAfterGroupOrLeaguePhase && !nextState.clearedGroupStage) {
    const isEnteringKnockout =
      normStage.includes('round of 16') ||
      normStage.includes('r16') ||
      normStage.includes('octavos') ||
      normStage.includes('round of 32') ||
      normStage.includes('r32') ||
      normStage.includes('playoff') ||
      normStage.includes('knockout') ||
      normStage.includes('quarter') ||
      normStage.includes('cuartos');

    if (isEnteringKnockout) {
      if (nextState.activeYellowCount > 0) {
        reason = `Yellow cards reset after Group Stage (${nextState.activeYellowCount} cleared)`;
        nextState.activeYellowCount = 0;
      }
      nextState.clearedGroupStage = true;
      didClear = true;
    }
  }

  // Check quarter-finals completion clear (before Semi-Finals)
  if (rules.clearsAfterQuarterFinals && !nextState.clearedQuarterFinals) {
    const isEnteringSemiFinal =
      normStage.includes('semi-final') ||
      normStage.includes('semifinal') ||
      normStage.includes('semi final') ||
      normStage.includes('semis') ||
      normStage.includes('final');

    if (isEnteringSemiFinal) {
      if (nextState.activeYellowCount > 0) {
        reason = `Yellow cards reset after Quarter-Finals (${nextState.activeYellowCount} cleared)`;
        nextState.activeYellowCount = 0;
      }
      nextState.clearedQuarterFinals = true;
      didClear = true;
    }
  }

  return { updatedState: nextState, didClear, reason };
}

/**
 * Checks if the player is currently serving a suspension for this competition match.
 */
export function checkIsSuspendedForMatch(state: CompetitionDisciplinaryState): {
  isSuspended: boolean;
  reason?: string;
} {
  if (state.suspendedMatchesRemaining > 0 || state.isSuspendedForNextMatch) {
    return {
      isSuspended: true,
      reason: state.suspensionDetail || (state.suspensionReason === 'red_card' ? 'Red Card Suspension' : 'Yellow Card Accumulation Ban'),
    };
  }
  return { isSuspended: false };
}

/**
 * Serves one match of a suspension.
 */
export function serveSuspensionForMatch(
  state: CompetitionDisciplinaryState
): CompetitionDisciplinaryState {
  const remaining = Math.max(0, (state.suspendedMatchesRemaining || (state.isSuspendedForNextMatch ? 1 : 0)) - 1);
  return {
    ...state,
    suspendedMatchesRemaining: remaining,
    isSuspendedForNextMatch: remaining > 0,
    suspensionReason: remaining > 0 ? state.suspensionReason : undefined,
    suspensionDetail: remaining > 0 ? state.suspensionDetail : undefined,
  };
}

/**
 * Records card events in a match and applies competition sanction rules.
 * - Red card -> player suspended for NEXT match of this competition!
 * - Yellow card -> increment active count. If count reaches rules.yellowsForSuspension:
 *   player suspended for NEXT match of this competition, and active count resets to 0.
 */
export function recordMatchDisciplinaryEvents(
  state: CompetitionDisciplinaryState,
  rules: CompetitionDisciplinaryRules,
  gotYellow: boolean,
  gotRed: boolean
): {
  updatedState: CompetitionDisciplinaryState;
  becameSuspended: boolean;
  suspensionReason?: 'red_card' | 'yellow_accumulation';
  suspensionNotice?: string;
} {
  let activeYellows = state.activeYellowCount;
  let totalYellows = state.totalYellowsSeason;
  let totalReds = state.totalRedsSeason;
  let isSuspended = false;
  let reason: 'red_card' | 'yellow_accumulation' | undefined;
  let notice: string | undefined;

  if (gotRed) {
    totalReds++;
    isSuspended = true;
    reason = 'red_card';
    notice = `🟥 RED CARD! Suspended for the next match of ${rules.name}.`;
  } else if (gotYellow) {
    activeYellows++;
    totalYellows++;
    if (activeYellows >= rules.yellowsForSuspension) {
      isSuspended = true;
      reason = 'yellow_accumulation';
      notice = `🟨 ${activeYellows} YELLOW CARDS! Suspended for the next match of ${rules.name}.`;
      activeYellows = 0; // Reset active accumulator after sanction is triggered
    }
  }

  const updatedState: CompetitionDisciplinaryState = {
    ...state,
    activeYellowCount: activeYellows,
    totalYellowsSeason: totalYellows,
    totalRedsSeason: totalReds,
    isSuspendedForNextMatch: isSuspended ? true : state.isSuspendedForNextMatch,
    suspendedMatchesRemaining: isSuspended ? 1 : state.suspendedMatchesRemaining,
    suspensionReason: reason || state.suspensionReason,
    suspensionDetail: notice || state.suspensionDetail,
  };

  return {
    updatedState,
    becameSuspended: isSuspended,
    suspensionReason: reason,
    suspensionNotice: notice,
  };
}

/**
 * Creates a human-readable badge text describing a suspension.
 */
export function formatSuspensionBadge(detail?: string, reason?: string): string {
  if (detail) return detail;
  if (reason === 'red_card') return 'Suspended (Red Card)';
  if (reason === 'yellow_accumulation') return 'Suspended (Yellow Accumulation)';
  return 'Suspended';
}
