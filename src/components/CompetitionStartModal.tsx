import React from 'react';
import {
  Trophy,
  Sparkles,
  Swords,
  ShieldAlert,
  Flame,
  Crown,
  Globe,
  Award,
  Star,
  ChevronRight,
  Newspaper,
  Shield,
  Zap,
  Target,
  Flag,
  Users,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../utils/localizationSystem';

export type CompetitionStartType =
  | 'epl'
  | 'brasileirao'
  | 'laliga'
  | 'ligue1'
  | 'ligaprofesional'
  | 'ucl'
  | 'libertadores'
  | 'sudamericana'
  | 'world_cup'
  | 'copa_america'
  | 'eurocopa'
  | 'local_league'
  | 'local_cup'
  | 'youth_league'
  | 'youth_cup'
  | 'u17_league_cup'
  | 'u20_league_cup'
  | 'u17_qualifiers_wc'
  | 'u20_qualifiers_wc'
  | 'sudamericano_u17'
  | 'sudamericano_u20'
  | 'generic_international';

export type TeamExpectationType =
  | 'favorites'
  | 'candidates'
  | 'dark_horse'
  | 'mid_table'
  | 'bottom'
  | 'out_in_first_round'
  | 'out_in_groups'
  | 'relegation';

export interface CompetitionStartData {
  competitionName: string;
  category?: 'national' | 'continental' | 'international' | 'youth' | 'club';
  competitionType?: CompetitionStartType;
  teamName: string;
  teamOvr?: number;
  firstRivalName: string;
  firstRivalOvr?: number;
  venue?: string; // e.g. "Home Match", "Away Match", "Neutral Stadium", "International Stadium"
  expectation?: TeamExpectationType;
  newsHeadline?: string;
  newsSummary?: string;
  isPro?: boolean;
  division?: number | string;
  isFirstDivision?: boolean;
}

interface CompetitionStartModalProps {
  isOpen: boolean;
  data: CompetitionStartData;
  onStart: () => void;
}

/**
 * Automatically classifies competition into standard tournament categories
 */
export function detectCompetitionType(
  compName: string,
  category?: string
): CompetitionStartType {
  const name = compName.toLowerCase();

  // Sudamericano Sub-17
  if (
    (name.includes('sudamericano') || name.includes('conmebol')) &&
    (name.includes('sub-17') || name.includes('sub 17') || name.includes('u17') || name.includes('u-17'))
  ) {
    return 'sudamericano_u17';
  }

  // Sudamericano Sub-20
  if (
    (name.includes('sudamericano') || name.includes('conmebol')) &&
    (name.includes('sub-20') || name.includes('sub 20') || name.includes('u20') || name.includes('u-20'))
  ) {
    return 'sudamericano_u20';
  }

  // U17 Qualifiers & WC
  if (
    (name.includes('u17') || name.includes('u-17') || name.includes('under 17') || name.includes('under-17') || name.includes('sub-17') || name.includes('sub 17')) &&
    (name.includes('qualifier') || name.includes('clasificatoria') || name.includes('world cup') || name.includes('wc') || name.includes('international') || name.includes('mundial'))
  ) {
    return 'u17_qualifiers_wc';
  }

  // U20 Qualifiers & WC
  if (
    (name.includes('u20') || name.includes('u-20') || name.includes('under 20') || name.includes('under-20') || name.includes('sub-20') || name.includes('sub 20')) &&
    (name.includes('qualifier') || name.includes('clasificatoria') || name.includes('world cup') || name.includes('wc') || name.includes('international') || name.includes('mundial'))
  ) {
    return 'u20_qualifiers_wc';
  }

  // U17 League / Cup
  if (name.includes('u17') || name.includes('u-17') || name.includes('under 17') || name.includes('under-17') || name.includes('sub-17') || name.includes('sub 17')) {
    return 'u17_league_cup';
  }

  // U20 League / Cup
  if (name.includes('u20') || name.includes('u-20') || name.includes('under 20') || name.includes('under-20') || name.includes('sub-20') || name.includes('sub 20')) {
    return 'u20_league_cup';
  }

  // Brasileirão (Série A & Série B)
  if (
    name.includes('brasileirão') ||
    name.includes('brasileirao') ||
    name.includes('série a') ||
    name.includes('série b') ||
    name.includes('serie a') ||
    name.includes('serie b') ||
    name.includes('brazil') ||
    name.includes('brasil')
  ) {
    return 'brasileirao';
  }

  // LaLiga (EA Sports & Hypermotion)
  if (
    name.includes('laliga') ||
    name.includes('la liga') ||
    name.includes('hypermotion') ||
    name.includes('primera división de españa') ||
    name.includes('spain') ||
    name.includes('españa')
  ) {
    return 'laliga';
  }

  // Ligue 1 / Ligue 2
  if (
    name.includes('ligue 1') ||
    name.includes('ligue 2') ||
    name.includes('mcdonald') ||
    name.includes('france') ||
    name.includes('francia')
  ) {
    return 'ligue1';
  }

  // Liga Profesional de Fútbol / Primera Nacional (Argentina)
  if (
    name.includes('profesional') ||
    name.includes('nacional') ||
    name.includes('argentina') ||
    name.includes('torneo betano')
  ) {
    return 'ligaprofesional';
  }

  // EPL (English Premier League)
  if (
    (name.includes('premier league') || name.includes('epl') || name.includes('english premier')) &&
    !name.includes('youth') && !name.includes('u18') && !name.includes('u21')
  ) {
    return 'epl';
  }

  // UCL (UEFA Champions League)
  if (
    name.includes('champions league') ||
    name.includes('ucl') ||
    name.includes('uefa champions') ||
    name.includes('champion league')
  ) {
    return 'ucl';
  }

  // Copa Libertadores
  if (name.includes('libertadores') || name.includes('copa libertadores')) {
    return 'libertadores';
  }

  // Copa Sudamericana
  if (name.includes('sudamericana') || name.includes('copa sudamericana') || name.includes('conmebol sudamericana')) {
    return 'sudamericana';
  }

  // FIFA World Cup
  if (
    (name.includes('world cup') || name.includes('fifa world cup') || name.includes('mundial') || name.includes('copa del mundo')) &&
    !name.includes('u17') && !name.includes('u20') && !name.includes('sub-17') && !name.includes('sub-20') && !name.includes('youth')
  ) {
    return 'world_cup';
  }

  // Copa America
  if (name.includes('copa américa') || name.includes('copa america') || name.includes('conmebol copa america')) {
    return 'copa_america';
  }

  // Eurocopa (UEFA Euro)
  if (
    name.includes('eurocopa') ||
    name.includes('uefa euro') ||
    name.includes('european championship') ||
    (name.includes('euro') && !name.includes('europa') && !name.includes('europe'))
  ) {
    return 'eurocopa';
  }

  // Youth League & Youth Cup
  if (name.includes('youth cup') || name.includes('academy cup') || name.includes('international youth cup') || name.includes('copa juvenil') || name.includes('copa internacional juvenil')) {
    return 'youth_cup';
  }

  if (
    name.includes('youth league') ||
    name.includes('academy league') ||
    name.includes('liga de cantera') ||
    name.includes('liga juvenil') ||
    name.includes('youth') ||
    name.includes('reserves') ||
    name.includes('reserva') ||
    name.includes('filial') ||
    name.includes('u11') || name.includes('u12') || name.includes('u13') || name.includes('u14') || name.includes('u15') || name.includes('u16')
  ) {
    return 'youth_league';
  }

  // Local Cup / Knockout Cup
  if (
    name.includes('knockout') ||
    name.includes('fa cup') ||
    name.includes('copa del rey') ||
    name.includes('copa de la liga') ||
    name.includes('coppa italia') ||
    name.includes('coupe de') ||
    name.includes('dfb-pokal') ||
    name.includes('pokal') ||
    name.includes('taça de') ||
    name.includes('supercup') ||
    name.includes('supercopa') ||
    (name.includes('copa') && !name.includes('libertadores') && !name.includes('america') && !name.includes('américa') && !name.includes('mundial')) ||
    (name.includes('cup') && !name.includes('world') && !name.includes('youth') && !name.includes('champions'))
  ) {
    return 'local_cup';
  }

  // Local League
  if (
    name.includes('league') ||
    name.includes('liga') ||
    name.includes('serie') ||
    name.includes('division') ||
    name.includes('división') ||
    name.includes('championship') ||
    name.includes('premiership') ||
    name.includes('bundesliga') ||
    name.includes('eredivisie') ||
    name.includes('ligue') ||
    name.includes('primera')
  ) {
    return 'local_league';
  }

  if (category === 'international' || category === 'continental') {
    return 'generic_international';
  }

  return 'local_league';
}

/**
 * Normalizes team expectation to ensure:
 * - Only 1st divisions for senior 1st teams have relegation
 * - Reserves, U20, U17, Youth leagues have no relegation (they use "bottom" since they are tied to 1st team)
 * - Elimination tournaments use "out_in_first_round"
 * - Group stage tournaments use "out_in_groups"
 */
export function normalizeTeamExpectation(
  expectation: TeamExpectationType,
  compType: CompetitionStartType,
  category?: string,
  isPro?: boolean,
  division?: number | string
): TeamExpectationType {
  const groupStageTournaments: CompetitionStartType[] = [
    'ucl',
    'libertadores',
    'world_cup',
    'copa_america',
    'eurocopa',
    'u17_qualifiers_wc',
    'u20_qualifiers_wc',
    'youth_cup',
    'generic_international',
  ];

  const isTournamentWithGroups = groupStageTournaments.includes(compType) || category === 'international' || category === 'continental';
  const isKnockoutCup = compType === 'local_cup';
  const isYouthOrReserves =
    compType === 'youth_league' ||
    compType === 'u17_league_cup' ||
    compType === 'u20_league_cup' ||
    category === 'youth' ||
    isPro === false ||
    division === 'reserves' ||
    division === 'u20' ||
    division === 'u17' ||
    division === 'u18' ||
    division === 'u21' ||
    division === 'youth';

  if (expectation === 'relegation' || expectation === 'bottom' || expectation === 'out_in_first_round' || expectation === 'out_in_groups') {
    if (isTournamentWithGroups) {
      return 'out_in_groups';
    }
    if (isKnockoutCup) {
      return 'out_in_first_round';
    }
    if (isYouthOrReserves) {
      return 'bottom';
    }
    // Only 1st Division senior league has relegation
    return 'relegation';
  }

  return expectation;
}

/**
 * Calculates dynamic team expectation with strict division & format rules
 */
export function calculateTeamExpectation(
  teamOvr: number = 70,
  rivalOvr: number = 70,
  compType?: CompetitionStartType,
  category?: 'national' | 'continental' | 'international' | 'youth' | 'club',
  isPro?: boolean,
  division?: number | string
): TeamExpectationType {
  let tier: 'favorites' | 'candidates' | 'dark_horse' | 'mid_table' | 'low';
  if (teamOvr >= 83) tier = 'favorites';
  else if (teamOvr >= 77) tier = 'candidates';
  else if (teamOvr >= 72) tier = 'dark_horse';
  else if (teamOvr >= 65) tier = 'mid_table';
  else tier = 'low';

  if (tier !== 'low') {
    return tier;
  }

  const type = compType || (category === 'international' ? 'world_cup' : 'local_league');
  return normalizeTeamExpectation('relegation', type, category, isPro, division);
}

/**
 * Returns localized expectation badge information and description
 */
export function getLocalizedExpectationBadge(
  exp: TeamExpectationType,
  lang: LanguageCode = 'en-GB'
) {
  const isEs = lang === 'es-ES' || lang === 'es-AR';
  const isPt = lang === 'pt-BR';
  const isFr = lang === 'fr-FR';

  switch (exp) {
    case 'favorites':
      return {
        label: isEs ? 'FAVORITOS AL TÍTULO' : isPt ? 'FAVORITOS AO TÍTULO' : isFr ? 'LES FAVORIS' : 'THE FAVORITES',
        icon: Trophy,
        color: 'from-amber-500/30 to-yellow-500/10 border-amber-400 text-amber-300',
        desc: isEs
          ? 'Máximos candidatos en los pronósticos para dominar la competición y alzar el trofeo.'
          : isPt
          ? 'Grandes favoritos para dominar a competição e erguer a taça de campeão.'
          : isFr
          ? 'Grands favoris pressentis pour dominer la compétition et soulever le trophée.'
          : 'Heavy bookmaker favorites tipped to dominate and lift the trophy.',
      };

    case 'candidates':
      return {
        label: isEs ? 'CANDIDATOS AL TÍTULO' : isPt ? 'CANDIDATOS AO TÍTULO' : isFr ? 'CANDIDATS AU TITRE' : 'TITLE CANDIDATES',
        icon: Crown,
        color: 'from-emerald-500/30 to-teal-500/10 border-emerald-400 text-emerald-300',
        desc: isEs
          ? 'Contendientes de élite con plantilla profunda para pelear firmemente por el campeonato.'
          : isPt
          ? 'Fortes concorrentes com elenco de alto nível para disputar o título até o fim.'
          : isFr
          ? 'Prétendants de premier ordre dotés d\'un effectif capable de viser le titre.'
          : 'Top-tier contenders with squad depth capable of making a fierce title push.',
      };

    case 'dark_horse':
      return {
        label: isEs ? 'EQUIPO REVELACIÓN' : isPt ? 'ZEBRA PERIGOSA / REVELAÇÃO' : isFr ? 'OUTSIDER / RÉVÉLATION' : 'DARK HORSE',
        icon: Zap,
        color: 'from-purple-500/30 to-indigo-500/10 border-purple-400 text-purple-300',
        desc: isEs
          ? 'Plantilla peligrosa y de gran talento, capaz de sorprender a los gigantes y llegar muy lejos.'
          : isPt
          ? 'Equipe perigosa e talentosa, capaz de surpreender gigantes e ir longe na disputa.'
          : isFr
          ? 'Équipe redoutable capable de surprendre les cadors et de réaliser un parcours d\'exploit.'
          : 'A dangerous, high-potential squad capable of stunning top giants and making a deep run.',
      };

    case 'mid_table':
      return {
        label: isEs ? 'ZONA MEDIA' : isPt ? 'MEIO DE TABELA' : isFr ? 'MILIEU DE TABLEAU' : 'MID-TABLE CONTENDERS',
        icon: Target,
        color: 'from-sky-500/30 to-blue-500/10 border-sky-400 text-sky-300',
        desc: isEs
          ? 'Conjunto ordenado y competitivo que busca regularidad y estabilidad en la tabla.'
          : isPt
          ? 'Equipe sólida e equilibrada buscando regularidade e estabilidade na classificação.'
          : isFr
          ? 'Équipe solide cherchant la régularité, la stabilité et des coups d\'éclat.'
          : 'Solid, well-drilled side aiming for consistency, stability, and tournament upsets.',
      };

    case 'bottom':
      return {
        label: isEs ? 'FONDO DE LA TABLA' : isPt ? 'PARTE INFERIOR DA TABELA' : isFr ? 'BAS DE TABLEAU' : 'BOTTOM OF THE TABLE',
        icon: Users,
        color: 'from-slate-600/30 to-zinc-700/10 border-slate-400 text-slate-300',
        desc: isEs
          ? 'Plantilla formativa proyectada en la parte baja; busca ganar rodaje y química sin presión de descenso.'
          : isPt
          ? 'Equipe em formação focada em ganhar rodagem e entrosamento sem risco de rebaixamento.'
          : isFr
          ? 'Équipe en formation cherchant à s\'aguerrir et construire des automatismes sans risque de relégation.'
          : 'Developing squad predicted near the bottom; focused on building chemistry with no relegation threat.',
      };

    case 'out_in_first_round':
      return {
        label: isEs ? 'ELIMINADO EN 1.ª RONDA' : isPt ? 'ELIMINADO NA 1ª FASE' : isFr ? 'ÉLIMINÉ AU 1ER TOUR' : 'OUT IN FIRST ROUND',
        icon: Swords,
        color: 'from-orange-500/30 to-rose-500/10 border-orange-400 text-orange-300',
        desc: isEs
          ? 'Equipo modesto con pronóstico adverso en eliminatoria directa, obligado a dar la gran sorpresa.'
          : isPt
          ? 'Azarão enfrentando um confronto difícil em mata-mata eliminatório, buscando surpreender.'
          : isFr
          ? 'Outsider confronté à un défi très relevé en élimination directe, en quête d\'un exploit.'
          : 'Underdogs facing an immediate uphill battle in elimination knockout football, seeking a major upset.',
      };

    case 'out_in_groups':
      return {
        label: isEs ? 'ELIMINADO EN FASE DE GRUPOS' : isPt ? 'ELIMINADO NA FASE DE GRUPOS' : isFr ? 'ÉLIMINÉ EN GROUPES' : 'OUT IN GROUPS',
        icon: Globe,
        color: 'from-rose-500/30 to-red-500/10 border-rose-400 text-rose-300',
        desc: isEs
          ? 'Grupo muy exigente; la meta primordial será competir con orgullo para evitar quedar fuera en fase de grupos.'
          : isPt
          ? 'Chave muito difícil; o objetivo principal será lutar com bravura para evitar a queda na fase de grupos.'
          : isFr
          ? 'Groupe relevé ; le défi principal sera de se surpasser pour éviter l\'élimination précoce.'
          : 'Tough tournament draw; the primary goal is battling fiercely to avoid an early group stage exit.',
      };

    case 'relegation':
    default:
      return {
        label: isEs ? 'LUCHA POR LA PERMANENCIA' : isPt ? 'LUTA CONTRA O REBAIXAMENTO' : isFr ? 'LUTTE POUR LE MAINTIEN' : 'FIGHTING RELEGATION',
        icon: ShieldAlert,
        color: 'from-rose-600/30 to-red-600/10 border-rose-500 text-rose-300',
        desc: isEs
          ? 'Equipo modesto inmerso en una dramática lucha por la permanencia en la máxima categoría.'
          : isPt
          ? 'Equipe modesta encarando uma dura batalha para evitar o rebaixamento na primeira divisão.'
          : isFr
          ? 'Équipe engagée dans une lutte acharnée pour assurer son maintien dans l\'élite.'
          : 'Underdogs facing an intense top-flight relegation battle where every single point counts for survival.',
      };
  }
}

/**
 * Returns localized expectation label for inline journalistic news text
 */
function getExpectationInlineLabel(
  expectation: TeamExpectationType,
  lang: LanguageCode = 'en-GB'
): string {
  const isEs = lang === 'es-ES' || lang === 'es-AR';
  const isPt = lang === 'pt-BR';
  const isFr = lang === 'fr-FR';

  switch (expectation) {
    case 'favorites':
      return isEs ? 'máximos favoritos al título' : isPt ? 'grandes favoritos ao título' : isFr ? 'grands favoris' : 'tournament favorites';
    case 'candidates':
      return isEs ? 'firmes candidatos al campeonato' : isPt ? 'fortes candidatos ao título' : isFr ? 'prétendants au titre' : 'title candidates';
    case 'dark_horse':
      return isEs ? 'equipo revelación' : isPt ? 'zebra perigosa' : isFr ? 'outsider dangereux' : 'dangerous dark horses';
    case 'mid_table':
      return isEs ? 'aspirantes de mitad de tabla' : isPt ? 'competidores de meio de tabela' : isFr ? 'prétendants au milieu de tableau' : 'mid-table contenders';
    case 'bottom':
      return isEs ? 'equipo del fondo de la tabla' : isPt ? 'equipe da parte de baixo da tabela' : isFr ? 'équipe de bas de tableau' : 'bottom-table contenders';
    case 'out_in_first_round':
      return isEs ? 'candidatos a caer en primera ronda' : isPt ? 'candidatos à eliminação precoce na 1ª fase' : isFr ? 'outsiders du premier tour' : 'first-round underdogs';
    case 'out_in_groups':
      return isEs ? 'candidatos a quedar eliminados en fase de grupos' : isPt ? 'candidatos à eliminação na fase de grupos' : isFr ? 'candidats à l\'élimination en poules' : 'group-stage underdogs';
    case 'relegation':
    default:
      return isEs ? 'luchadores por evitar el descenso' : isPt ? 'lutadores contra o rebaixamento' : isFr ? 'engagés dans la course au maintien' : 'relegation survival fighters';
  }
}

/**
 * Returns localized venue string
 */
export function getLocalizedVenue(venue?: string, lang: LanguageCode = 'en-GB'): string {
  const isEs = lang === 'es-ES' || lang === 'es-AR';
  const isPt = lang === 'pt-BR';
  const isFr = lang === 'fr-FR';

  if (!venue) {
    return isEs ? 'Partido de Local' : isPt ? 'Em Casa' : isFr ? 'À Domicile' : 'Home Match';
  }

  const v = venue.toLowerCase();
  if (v.includes('home') || v.includes('local') || v.includes('casa')) {
    return isEs ? (lang === 'es-AR' ? 'De Local' : 'Partido en Casa') : isPt ? 'Em Casa' : isFr ? 'À Domicile' : 'Home Match';
  }
  if (v.includes('away') || v.includes('visitante') || v.includes('fuera')) {
    return isEs ? (lang === 'es-AR' ? 'De Visitante' : 'Partido Fuera') : isPt ? 'Fora de Casa' : isFr ? 'À l\'Extérieur' : 'Away Match';
  }
  if (v.includes('neutral')) {
    return isEs ? 'Estadio Neutral' : isPt ? 'Estádio Neutro' : isFr ? 'Terrain Neutre' : 'Neutral Stadium';
  }
  if (v.includes('international') || v.includes('internacional')) {
    return isEs ? 'Estadio Internacional' : isPt ? 'Estádio Internacional' : isFr ? 'Stade International' : 'International Stadium';
  }

  return venue;
}

/**
 * Localizes standard competition names if known
 */
export function getLocalizedCompetitionName(name: string, lang: LanguageCode = 'en-GB'): string {
  const isEs = lang === 'es-ES' || lang === 'es-AR';
  const isPt = lang === 'pt-BR';
  const isFr = lang === 'fr-FR';

  if (!name) return name;

  if (name.includes('32-Team International Youth Cup')) {
    return isEs ? 'Copa Internacional Juvenil (32 Clubes)' : isPt ? 'Copa Internacional Juvenil (32 Clubes)' : isFr ? 'Coupe Internationale des Jeunes (32 Clubs)' : name;
  }
  if (name.includes('Youth Academy League')) {
    return isEs ? 'Liga de Canteras Juveniles' : isPt ? 'Liga de Academias de Base' : isFr ? 'Ligue des Académies' : name;
  }

  let translated = name;

  if (isEs) {
    translated = translated
      .replace(/Youth League/gi, 'Liga Juvenil')
      .replace(/Reserves League/gi, 'Liga de Reservas')
      .replace(/Under-17 League|U17 League/gi, 'Liga Sub-17')
      .replace(/Under-20 League|U20 League/gi, 'Liga Sub-20')
      .replace(/Knockout Cup|Domestic Cup/gi, 'Copa Eliminatoria')
      .replace(/Domestic League/gi, 'Liga Nacional')
      .replace(/ - Cup & Second Half/gi, ' - Copa y 2.ª Vuelta')
      .replace(/ - Second Half/gi, ' - 2.ª Vuelta')
      .replace(/ - Opening Half/gi, ' - 1.ª Vuelta')
      .replace(/ - Block 1/gi, ' - Fase 1')
      .replace(/ - Block 2/gi, ' - Fase 2');
  } else if (isPt) {
    translated = translated
      .replace(/Youth League/gi, 'Liga Juvenil de Base')
      .replace(/Reserves League/gi, 'Liga de Aspirantes')
      .replace(/Under-17 League|U17 League/gi, 'Liga Sub-17')
      .replace(/Under-20 League|U20 League/gi, 'Liga Sub-20')
      .replace(/Knockout Cup|Domestic Cup/gi, 'Copa Eliminatória')
      .replace(/Domestic League/gi, 'Liga Nacional')
      .replace(/ - Cup & Second Half/gi, ' - Copa e 2º Turno')
      .replace(/ - Second Half/gi, ' - 2º Turno')
      .replace(/ - Opening Half/gi, ' - 1º Turno')
      .replace(/ - Block 1/gi, ' - Fase 1')
      .replace(/ - Block 2/gi, ' - Fase 2');
  } else if (isFr) {
    translated = translated
      .replace(/Youth League/gi, 'Ligue des Jeunes')
      .replace(/Reserves League/gi, 'Ligue Réserve')
      .replace(/Under-17 League|U17 League/gi, 'Ligue U17')
      .replace(/Under-20 League|U20 League/gi, 'Ligue U20')
      .replace(/Knockout Cup|Domestic Cup/gi, 'Coupe Éliminatoire')
      .replace(/Domestic League/gi, 'Ligue Nationale')
      .replace(/ - Cup & Second Half/gi, ' - Coupe & 2e Phase')
      .replace(/ - Second Half/gi, ' - 2e Phase')
      .replace(/ - Opening Half/gi, ' - 1ère Phase')
      .replace(/ - Block 1/gi, ' - Phase 1')
      .replace(/ - Block 2/gi, ' - Phase 2');
  }

  return translated;
}

/**
 * Generates fully localized newspaper story based on language and tournament format
 */
export function generateNewsStory(
  compType: CompetitionStartType,
  compName: string,
  teamName: string,
  rivalName: string,
  expectation: TeamExpectationType,
  lang: LanguageCode = 'en-GB'
): { headline: string; summary: string } {
  const expLabel = getExpectationInlineLabel(expectation, lang);
  const isEs = lang === 'es-ES' || lang === 'es-AR';
  const isPt = lang === 'pt-BR';
  const isFr = lang === 'fr-FR';

  if (isEs) {
    switch (compType) {
      case 'brasileirao':
        return {
          headline: `¡ARRANCA EL BRASILEIRÃO: PASIÓN Y FÚTBOL TOTAL EN LA FECHA 1!`,
          summary: `Uno de los campeonatos más disputados del mundo abre el telón. ${teamName} se estrena frente a ${rivalName}. Catalogados como ${expLabel}, el ritmo y la exigencia física serán implacables desde el arranque.`,
        };
      case 'laliga':
        return {
          headline: `¡ARRANCA LALIGA: ARTE Y EXIGENCIA EN EL FÚTBOL ESPAÑOL!`,
          summary: `Los estadios españoles se visten de gala. ${teamName} debuta ante ${rivalName}. Valorados como ${expLabel}, el rigor táctico y el talento individual buscarán imponerse.`,
        };
      case 'ligue1':
        return {
          headline: `¡COMIENZA LA LIGUE 1: VELOCIDAD Y TALENTO EN EL DEBUT!`,
          summary: `El fútbol francés entra en acción. ${teamName} cruza caminos con ${rivalName}. Considerados como ${expLabel}, el objetivo es sumar los tres puntos desde el pitazo inicial.`,
        };
      case 'ligaprofesional':
        return {
          headline: `¡FÚTBOL ARGENTINO AL MÁXIMO: ARRANCA LA LIGA PROFESIONAL!`,
          summary: `La pasión y el fervor sudamericano vibran en las tribunas. ${teamName} se enfrenta a ${rivalName}. Con expectativa de ${expLabel}, cada balón disputado se jugará como una final.`,
        };
      case 'sudamericano_u17':
        return {
          headline: `CONMEBOL SUDAMERICANO SUB-17: ¡TODOS CONTRA TODOS POR EL BOLETO AL MUNDIAL!`,
          summary: `Las 10 selecciones del continente disputan el torneo en sede única. ${teamName} Sub-17 debuta ante ${rivalName}. Con cartel de ${expLabel}, clasificar entre los 4 primeros otorga el pasaje directo al Mundial Sub-17.`,
        };
      case 'sudamericano_u20':
        return {
          headline: `CONMEBOL SUDAMERICANO SUB-20: ¡FUTURAS ESTRELLAS POR EL CUPO MUNDIALISTA!`,
          summary: `El certamen juvenil más exigente de Sudamérica entra en escena. ${teamName} Sub-20 se mide a ${rivalName}. Con expectativa de ${expLabel}, meterse en el Top 4 de la tabla asegura el pase a la Copa del Mundo Sub-20.`,
        };
      case 'epl':
        return {
          headline: `¡REGRESA LA PREMIER LEAGUE: TODAS LAS MIRADAS EN LA JORNADA 1!`,
          summary: `Bajo los focos del estadio, ${teamName} arranca su campaña en la Premier League inglesa enfrentándose a ${rivalName}. Con expectativa de ${expLabel}, el equipo salta a la cancha con ajustes tácticos e ilusión.`,
        };
      case 'ucl':
        return {
          headline: `NOCHES MÁGICAS EN EUROPA: ¡EL HIMNO DE LA CHAMPIONS RETUMBA!`,
          summary: `El balón estrellado rueda de nuevo en el continente. ${teamName} se mide a ${rivalName} en un vibrante debut de fase de grupos de la UEFA Champions League. Catalogados como ${expLabel}, sumar de a tres hoy es vital para encaminar la clasificación.`,
        };
      case 'libertadores':
        return {
          headline: `LA GLORIA ETERNA: ¡ARRANCA LA BATALLA SUDAMERICANA!`,
          summary: `La pasión y el orgullo continental arden en el terreno de juego. ${teamName} salta al césped frente a ${rivalName} en la CONMEBOL Libertadores. Con la etiqueta de ${expLabel}, cada balón disputado valdrá oro en busca de la gloria eterna.`,
        };
      case 'sudamericana':
        return {
          headline: `¡ARRANCA LA CONMEBOL SUDAMERICANA: EN BUSCA DE LA OTRA MITAD DE LA GLORIA!`,
          summary: `El continente vibra con el inicio de la Copa Sudamericana. ${teamName} se estrena frente a ${rivalName}. Catalogados como ${expLabel}, el objetivo es sumar en la fase de grupos.`,
        };
      case 'world_cup':
        return {
          headline: `EL MUNDO SE DETIENE: ¡COMIENZA LA COPA MUNDIAL DE LA FIFA!`,
          summary: `Millones de hinchas alientan desde cada rincón. ${teamName} hace su debut en la Copa Mundial de la FIFA contra ${rivalName}. Considerados como ${expLabel}, todo el país sueña con un arranque victorioso.`,
        };
      case 'copa_america':
        return {
          headline: `FIESTA CONTINENTAL: ¡ARRANCA LA COPA AMÉRICA CON PURA PASIÓN!`,
          summary: `Fútbol de alta intensidad, garra y calidad sudamericana. ${teamName} cruza caminos con ${rivalName}. Valorados como ${expLabel}, la concentración será máxima desde el silbatazo inicial.`,
        };
      case 'eurocopa':
        return {
          headline: `SUPREMACÍA EUROPEA EN JUEGO: ¡ARRANCA LA EUROCOPA!`,
          summary: `Las grandes potencias del fútbol europeo se dan cita. ${teamName} se enfrenta a ${rivalName} en un choque de alto voltaje en la fase de grupos. Catalogados como ${expLabel}, el rigor táctico será decisivo.`,
        };
      case 'u17_qualifiers_wc':
        return {
          headline: `ESCENARIO MUNDIAL SUB-17: ¡PROMESAS EN BUSCA DE LA GLORIA!`,
          summary: `Las joyas más brillantes de la categoría Sub-17 entran en acción. ${teamName} Sub-17 se enfrenta a ${rivalName} en un intenso duelo inaugural. Con expectativa de ${expLabel}, los jóvenes buscan dejar en alto a su país.`,
        };
      case 'u20_qualifiers_wc':
        return {
          headline: `MUNDIAL SUB-20: ¡ES LA HORA DE LA PRÓXIMA GENERACIÓN!`,
          summary: `Ojeadores de los mejores clubes del planeta observan desde las gradas mientras ${teamName} Sub-20 se mide a ${rivalName}. Proyectados como ${expLabel}, el combinado juvenil busca un inicio brillante.`,
        };
      case 'u17_league_cup':
        return {
          headline: `ARRANQUE DEL CAMPEONATO SUB-17: ¡CANTERANOS LISTOS PARA EL RETO!`,
          summary: `La temporada Sub-17 da inicio con gran intensidad táctica cuando ${teamName} Sub-17 se enfrenta a ${rivalName}. Catalogados como ${expLabel}, los canteranos buscan marcar diferencias desde la jornada inaugural.`,
        };
      case 'u20_league_cup':
        return {
          headline: `CAMPEONATO SUB-20: ¡INTENSO DUELO EN LA DIVISIÓN JUVENIL!`,
          summary: `Gran batalla física y técnica en puerta. ${teamName} Sub-20 se enfrenta a ${rivalName}. Considerados como ${expLabel}, la cohesión del plantel se pondrá a prueba desde el primer minuto.`,
        };
      case 'youth_league':
        return {
          headline: `COMIENZA LA LIGA DE CANTERAS: ¡FUTURAS ESTRELLAS A LA CANCHA!`,
          summary: `El desarrollo formativo y la ambición competitiva se combinan en el debut de ${teamName} frente a ${rivalName}. Catalogados como ${expLabel}, el cuerpo técnico exige máxima entrega y precisión técnica.`,
        };
      case 'youth_cup':
        return {
          headline: `COPA INTERNACIONAL JUVENIL: ¡ARRANCA EL TORNEO DE 32 CLUBES DE ÉLITE!`,
          summary: `Las canteras más prestigiosas del fútbol internacional chocan en el torneo juvenil. ${teamName} enfrenta a ${rivalName} en la jornada 1. Con expectativa de ${expLabel}, sumar confianza de entrada es indispensable.`,
        };
      case 'local_cup':
        return {
          headline: `DRAMA DE COPA A PARTIDO ÚNICO: ¡SIN MARGEN DE ERROR EN EL ESTRENO!`,
          summary: `¡Vuelve la emoción del fútbol de eliminación directa! ${teamName} batalla contra ${rivalName} en un duelo decisivo. Catalogados como ${expLabel}, las sorpresas coperas siempre están al acecho.`,
        };
      case 'generic_international':
        return {
          headline: `DUELO INTERNACIONAL: ¡SELECCIONES LISTAS PARA EL ESTRENO!`,
          summary: `La emoción de representar a la nación llega al máximo cuando ${teamName} salta al campo contra ${rivalName} en ${compName}. Con expectativa de ${expLabel}, cada jugada cuenta.`,
        };
      case 'local_league':
      default:
        return {
          headline: `ARRANCA LA NUEVA TEMPORADA DE LIGA: ¡PLANTILLAS LISTAS PARA LA JORNADA 1!`,
          summary: `Meses de preparación previa culminan hoy cuando ${teamName} sale a disputar los primeros puntos ante ${rivalName} en ${compName}. Catalogados como ${expLabel}, cada jornada cuenta desde el inicio.`,
        };
    }
  }

  if (isPt) {
    switch (compType) {
      case 'brasileirao':
        return {
          headline: `COMEÇA O BRASILEIRÃO: RAÇA, TÉCNICA E EMOÇÃO NA 1ª RODADA!`,
          summary: `Uma das ligas mais equilibradas do futebol mundial começa agora. O ${teamName} enfrenta o ${rivalName} em um confronto de alta voltagem. Cotados como ${expLabel}, cada rodada é uma batalha direta na tabela.`,
        };
      case 'laliga':
        return {
          headline: `A LA LIGA COMEÇA: O FUTEBOL ESPANHOL DE VOLTA AOS GRAMADOS!`,
          summary: `Grandes craques em ação. O ${teamName} encara o ${rivalName} na rodada inaugural. Apontados como ${expLabel}, a organização defensiva e a qualidade de passe serão determinantes.`,
        };
      case 'ligue1':
        return {
          headline: `LIGUE 1 EM AÇÃO: VELOCIDADE E TALENTO NO JOGO DE ESTREIA!`,
          summary: `O campeonato francês dá o pontapé inicial. O ${teamName} duela com o ${rivalName}. Cotados como ${expLabel}, estrear com os 3 pontos é fundamental.`,
        };
      case 'ligaprofesional':
        return {
          headline: `FUTEBOL ARGENTINO FERVENDO: ARRANCA A LIGA PROFISSIONAL!`,
          summary: `Muita raça e paixão sul-americana. O ${teamName} mede forças com o ${rivalName}. Avaliados como ${expLabel}, a intensidade será máxima em cada jogada.`,
        };
      case 'sudamericano_u17':
        return {
          headline: `CONMEBOL SUL-AMERICANO SUB-17: TODOS CONTRA TODOS PELA VAGA NO MUNDIAL!`,
          summary: `As 10 seleções sul-americanas duelam em sede única. O ${teamName} Sub-17 estreia diante do ${rivalName}. Cotados como ${expLabel}, terminar no G4 garante a vaga direta na Copa do Mundo Sub-17.`,
        };
      case 'sudamericano_u20':
        return {
          headline: `CONMEBOL SUL-AMERICANO SUB-20: JOVENS TALENTOS EM BUSCA DA VAGA MUNDIAL!`,
          summary: `A principal competição de base do continente começa com jogos decisivos. O ${teamName} Sub-20 enfrenta o ${rivalName}. Cotados como ${expLabel}, garantir vaga no Top 4 leva a seleção ao Mundial Sub-20.`,
        };
      case 'epl':
        return {
          headline: `A PREMIER LEAGUE ESTÁ DE VOLTA: TODOS OS OLHOS NA RODADA DE ABERTURA!`,
          summary: `Sob os holofotes do estádio, o ${teamName} inicia sua trajetória na Premier League enfrentando o ${rivalName}. Cotados como ${expLabel}, a equipe entra em campo com ambição e ajustes táticos.`,
        };
      case 'ucl':
        return {
          headline: `NOITES MÁGICAS NA EUROPA: O HINO DA CHAMPIONS VOLTA A ECOAR!`,
          summary: `As estrelas do futebol continental voltam a brilhar. O ${teamName} encara o ${rivalName} em uma estreia eletrizante pela UEFA Champions League. Cotados como ${expLabel}, a vitória é crucial para o mata-mata.`,
        };
      case 'libertadores':
        return {
          headline: `A GLÓRIA ETERNA: COMEÇA A GRANDE BATALHA DA AMÉRICA DO SUL!`,
          summary: `A paixão sul-americana explode nos gramados. O ${teamName} enfrenta o ${rivalName} pela CONMEBOL Libertadores. Cotados como ${expLabel}, cada dividida valerá ouro em busca da glória eterna.`,
        };
      case 'sudamericana':
        return {
          headline: `A COPA SUL-AMERICANA COMEÇA: EM BUSCA DA GLÓRIA CONTINENTAL!`,
          summary: `O torneio continental entra em ação. O ${teamName} estreia diante do ${rivalName}. Cotados como ${expLabel}, estrear com vitória é fundamental na fase de grupos.`,
        };
      case 'world_cup':
        return {
          headline: `O MUNDO PÁRA PARA ASSISTIR: COMEÇA A COPA DO MUNDO FIFA!`,
          summary: `Milhões de torcedores sintonizados. O ${teamName} estreia na Copa do Mundo FIFA contra o ${rivalName}. Apontados como ${expLabel}, a nação inteira torce por uma largada triunfal.`,
        };
      case 'copa_america':
        return {
          headline: `SHOW CONTINENTAL: A COPA AMÉRICA COMEÇA COM PURA RAÇA!`,
          summary: `Puro talento e dedicação na abertura do torneio. O ${teamName} encara o ${rivalName}. Classificados como ${expLabel}, a concentração será total desde o apito inicial.`,
        };
      case 'youth_league':
      case 'u17_league_cup':
      case 'u20_league_cup':
        return {
          headline: `LIGA DE BASE EM AÇÃO: FUTURAS ESTRELAS ENTRAM EM CAMPO!`,
          summary: `Desenvolvimento técnico e ambição competitiva se unem na estreia do ${teamName} contra o ${rivalName}. Avaliados como ${expLabel}, a comissão técnica cobra intensidade máxima.`,
        };
      case 'youth_cup':
        return {
          headline: `COPA INTERNACIONAL JUVENIL: COMEÇA A DISPUTA DE 32 CLUBES!`,
          summary: `As maiores academias do futebol mundial duelam na primeira rodada. O ${teamName} enfrenta o ${rivalName}. Cotados como ${expLabel}, começar bem é fundamental.`,
        };
      case 'local_cup':
        return {
          headline: `EMOÇÃO DE MATA-MATA: SEM SEGUNDA CHANCE NA COPA!`,
          summary: `O futebol eliminatório está de volta! O ${teamName} duela com o ${rivalName} em jogo decisivo. Cotados como ${expLabel}, zebras podem pintar a qualquer instante.`,
        };
      default:
        return {
          headline: `COMEÇA O CAMPEONATO: CLUBES PRONTOS PARA A RODADA 1!`,
          summary: `Meses de pré-temporada chegam ao fim. O ${teamName} entra em campo contra o ${rivalName} em ${compName}. Cotados como ${expLabel}, cada ponto é decisivo.`,
        };
    }
  }

  if (isFr) {
    switch (compType) {
      case 'brasileirao':
        return {
          headline: `COUP D'ENVOI DU BRASILEIRÃO : PASSION ET RYTHME EFFRÉNÉ AU BRÉSIL !`,
          summary: `L'un des championnats les plus intenses de la planète ouvre ses portes. ${teamName} défie ${rivalName} pour cette 1ère journée. Évalué comme ${expLabel}, chaque point comptera énormément.`,
        };
      case 'laliga':
        return {
          headline: `COUP D'ENVOI DE LALIGA : LE FOOTBALL ESPAGNOL DE RETOUR !`,
          summary: `Les pelouses espagnoles s'illuminent. ${teamName} affronte ${rivalName}. Classé comme ${expLabel}, la rigueur tactique et la maîtrise technique feront la différence.`,
        };
      case 'ligue1':
        return {
          headline: `RETOUR DE LA LIGUE 1 : VITESSE ET JEUNES TALENTS EN ACTION !`,
          summary: `Le championnat de France reprend ses droits. ${teamName} rencontre ${rivalName} lors de cette journée inaugurale. Évalué comme ${expLabel}, l'objectif est d'imposer son style dès le coup d'envoi.`,
        };
      case 'ligaprofesional':
        return {
          headline: `PASSION ARGENTINE : LA LIGA PROFESIONAL EST DE RETOUR !`,
          summary: `Ferveur inégalée dans les tribunes. ${teamName} se mesure à ${rivalName}. Considéré comme ${expLabel}, l'intensité physique et la détermination seront de mise.`,
        };
      case 'sudamericano_u17':
        return {
          headline: `CONMEBOL SUDAMERICANO U17 : TOUS CONTRE TOUS POUR LA QUALIFICATION MONDIALE !`,
          summary: `Les 10 sélections d'Amérique du Sud s'affrontent sur un site unique. ${teamName} U17 affronte ${rivalName}. Visant le statut de ${expLabel}, terminer dans le Top 4 valide le billet pour la Coupe du Monde U17.`,
        };
      case 'sudamericano_u20':
        return {
          headline: `CONMEBOL SUDAMERICANO U20 : LES ESPOIRS EN QUÊTE DU BILLET MONDIAL !`,
          summary: `Le grand tournoi de jeunes débute avec des chocs intenses. ${teamName} U20 défie ${rivalName}. Évalué comme ${expLabel}, le Top 4 offre une place directe pour le Mondial U20.`,
        };
      case 'epl':
        return {
          headline: `RETOUR DE LA PREMIER LEAGUE : TOUS LES REGARDS SUR LA 1ÈRE JOURNÉE !`,
          summary: `Sous les projecteurs du stade, ${teamName} lance sa saison de Premier League face à ${rivalName}. Évalué comme ${expLabel}, le club entame l'exercice avec de grands objectifs.`,
        };
      case 'ucl':
        return {
          headline: `LES SOIRÉES EUROPÉENNES SONT DE RETOUR : L'HYMNE DE LA CHAMPIONS RÉSONNE !`,
          summary: `Le ballon étoilé brille à nouveau. ${teamName} défie ${rivalName} pour l'ouverture de la phase de groupes d'UEFA Champions League. Classé comme ${expLabel}, la victoire est essentielle.`,
        };
      case 'sudamericana':
        return {
          headline: `DÉBUT DE LA COPA SUDAMERICANA : EN ROUTE VERS LA GLOIRE CONTINENTALE !`,
          summary: `La compétition sud-américaine démarre. ${teamName} affronte ${rivalName}. Considéré comme ${expLabel}, chaque point comptera pour la qualification.`,
        };
      case 'world_cup':
        return {
          headline: `LE MONDE S'ARRÊTE : DÉBUT DE LA COUPE DU MONDE DE LA FIFA !`,
          summary: `Des millions de supporters vibrent à l'unisson. ${teamName} effectue ses débuts en Coupe du Monde face à ${rivalName}. Considéré comme ${expLabel}, tout un pays rêve d'un grand départ.`,
        };
      case 'youth_cup':
        return {
          headline: `COUPE INTERNATIONALE DES JEUNES : 32 CLUBS D'ÉLITE EN COMPÉTITION !`,
          summary: `Les centres de formation les plus prestigieux s'affrontent. ${teamName} rencontre ${rivalName} lors du match 1. Évalué comme ${expLabel}, une bonne entame est cruciale.`,
        };
      default:
        return {
          headline: `COUP D'ENVOI DU CHAMPIONNAT : LES ÉQUIPES PRÊTES POUR LE MATCH 1 !`,
          summary: `Des mois de préparation s'achèvent alors que ${teamName} affronte ${rivalName} en ${compName}. Classé comme ${expLabel}, chaque point compte dès aujourd'hui.`,
        };
    }
  }

  // English default
  switch (compType) {
    case 'brasileirao':
      return {
        headline: `BRASILEIRÃO KICKOFF: FLAIR, PASSION, AND INTENSE TITLE RACE BEGINS!`,
        summary: `One of the most fiercely contested leagues in world football begins today. ${teamName} faces ${rivalName} in a high-octane opening clash. Rated as ${expLabel}, every single matchday is a test of depth and technical resolve.`,
      };
    case 'laliga':
      return {
        headline: `LALIGA ACTION UNDERWAY: SPANISH FOOTBALL RETURNS WITH A BANG!`,
        summary: `Spanish stadiums light up as ${teamName} takes on ${rivalName}. Evaluated as ${expLabel}, precise passing, tactical mastery, and individual flair will be on full display.`,
      };
    case 'ligue1':
      return {
        headline: `LIGUE 1 CAMPAIGN LAUNCHES: SPEED AND YOUNG TALENT ON DISPLAY!`,
        summary: `The French championship takes flight as ${teamName} lines up against ${rivalName}. Rated as ${expLabel}, securing maximum points in the opener sets the tone for the entire season.`,
      };
    case 'ligaprofesional':
      return {
        headline: `ARGENTINE PASSION UNLEASHED: LIGA PROFESIONAL COMMENCES!`,
        summary: `Atmospheric roaring crowds greet ${teamName} as they battle ${rivalName}. Ranked as ${expLabel}, unwavering grit and relentless fight will decide every duel on the pitch.`,
      };
    case 'sudamericano_u17':
      return {
        headline: `CONMEBOL SUDAMERICANO U17: ALL-PLAY-ALL BATTLE FOR WORLD CUP SPOTS!`,
        summary: `South America's top 10 nations clash in a single host country. ${teamName} U17 opens their campaign against ${rivalName}. Entering as ${expLabel}, finishing in the top 4 secures direct qualification to the FIFA U-17 World Cup.`,
      };
    case 'sudamericano_u20':
      return {
        headline: `CONMEBOL SUDAMERICANO U20: CRADLE OF STARS COMPETING FOR GLORY!`,
        summary: `The premier youth tournament in South America is underway. ${teamName} U20 takes the field against ${rivalName}. Ranked as ${expLabel}, securing a Top 4 finish guarantees entry into the FIFA U-20 World Cup.`,
      };
    case 'epl':
      return {
        headline: `THE PREMIER LEAGUE RETURNS: ALL EYES ON OPENING DAY FIXTURE!`,
        summary: `Under the roaring stadium floodlights, ${teamName} kicks off their English Premier League campaign against ${rivalName}. Rated as ${expLabel}, the squad enters opening week with tactical tweaks and high expectations.`,
      };
    case 'ucl':
      return {
        headline: `EUROPEAN NIGHTS RETURN: THE CHAMPIONS LEAGUE ANTHEM ECHOES!`,
        summary: `The iconic starry banner rolls out across Europe as ${teamName} takes on ${rivalName} in a high-voltage UEFA Champions League group stage opener. Placed as ${expLabel}, victory tonight is essential for knockout momentum.`,
      };
    case 'libertadores':
      return {
        headline: `LA GLORIA ETERNA: SOUTH AMERICA'S ULTIMATE BATTLE BEGINS!`,
        summary: `Passion flares across South American soil as ${teamName} steps onto the pitch against ${rivalName} in CONMEBOL Libertadores. Entering as ${expLabel}, every tackle will count in this pursuit of eternal glory.`,
      };
    case 'sudamericana':
      return {
        headline: `CONMEBOL SUDAMERICANA KICKS OFF: PURSUING CONTINENTAL GLORY!`,
        summary: `South America's high-stakes continental stage opens up as ${teamName} takes on ${rivalName}. Rated as ${expLabel}, claiming points in group stage matchday 1 is crucial for progression.`,
      };
    case 'world_cup':
      return {
        headline: `GLOBAL SPECTACLE BEGINS: THE WORLD WATCHES MATCHDAY 1!`,
        summary: `Millions of international supporters tune in as ${teamName} makes their grand FIFA World Cup entrance against ${rivalName}. Tipped as ${expLabel}, the entire nation holds its breath for a glorious tournament start.`,
      };
    case 'copa_america':
      return {
        headline: `CONTINENTAL SHOWDOWN: COPA AMÉRICA ACTION UNDERWAY!`,
        summary: `Pure Latin flare and intense physical grit open the tournament as ${teamName} locks horns with ${rivalName}. Ranked as ${expLabel}, team leaders demand focus from the opening whistle.`,
      };
    case 'eurocopa':
      return {
        headline: `EUROPEAN SUPREMACY AT STAKE: EURO CAMPAIGN LAUNCHES!`,
        summary: `Europe's elite footballing powerhouses converge. ${teamName} meets ${rivalName} in a high-stakes UEFA European Championship group fixture. Rated as ${expLabel}, tactical discipline will be paramount.`,
      };
    case 'u17_qualifiers_wc':
      return {
        headline: `U17 WORLD STAGE: PROSPECTS FIGHT FOR INTERNATIONAL GLORY!`,
        summary: `The brightest Under-17 talents take center stage. ${teamName} U17 faces ${rivalName} in an intense opening match. Entering as ${expLabel}, young prodigies seek to make their country proud.`,
      };
    case 'u20_qualifiers_wc':
      return {
        headline: `U20 WORLD CHAMPIONSHIP: THE NEXT GENERATION'S TIME IS NOW!`,
        summary: `Scouts from elite global clubs gather in the stands as ${teamName} U20 takes on ${rivalName}. Tipped as ${expLabel}, the young national team aims for an explosive tournament debut.`,
      };
    case 'u17_league_cup':
      return {
        headline: `U17 CHAMPIONSHIP KICKOFF: YOUTH ACADEMY TALENTS READY!`,
        summary: `The Under-17 season kicks off with tactical intensity as ${teamName} U17 lines up against ${rivalName}. Positioned as ${expLabel}, players look to make an immediate statement.`,
      };
    case 'u20_league_cup':
      return {
        headline: `U20 HIGH-TEMPO SEASON KICKS OFF WITH FIERCE MATCH!`,
        summary: `Fast-paced physical battles lie ahead as ${teamName} U20 clashes with ${rivalName}. Operating as ${expLabel}, squad chemistry will be tested from game one.`,
      };
    case 'youth_league':
      return {
        headline: `YOUTH ACADEMY SEASON BEGINS: FUTURE STARS TAKE THE PITCH!`,
        summary: `Development goals and competitive ambition collide as ${teamName} opens their youth league campaign against ${rivalName}. Rated as ${expLabel}, coaches demand sharp technical execution.`,
      };
    case 'youth_cup':
      return {
        headline: `INTERNATIONAL YOUTH CUP KNOCKOUT DRAMA BEGINS TODAY!`,
        summary: `Top academy setups clash in tournament football. ${teamName} meets ${rivalName} in a high-stakes matchday 1 fixture. Ranked as ${expLabel}, momentum is key.`,
      };
    case 'local_cup':
      return {
        headline: `KNOCKOUT CUP DRAMA: NO SECOND CHANCES ON OPENING DAY!`,
        summary: `High-stakes cup football returns! ${teamName} battles ${rivalName} in an electric elimination-style fixture. Tipped as ${expLabel}, cup upsets are always around the corner.`,
      };
    case 'generic_international':
      return {
        headline: `INTERNATIONAL FIXTURE: NATIONS TAKE TO THE FIELD!`,
        summary: `International football excitement peaks as ${teamName} takes on ${rivalName} in ${compName}. Rated as ${expLabel}, pride and passion will drive every minute of the contest.`,
      };
    case 'local_league':
    default:
      return {
        headline: `NEW LEAGUE SEASON KICKOFF: SQUADS READY FOR OPENING MATCHDAY!`,
        summary: `Months of pre-season preparation culminate today as ${teamName} takes the field against ${rivalName} in ${compName}. Considered as ${expLabel}, every point counts from day one.`,
      };
  }
}

/**
 * Returns localized theme configuration for the competition modal header and accents
 */
export function getThemeConfig(type: CompetitionStartType, lang: LanguageCode = 'en-GB') {
  const isEs = lang === 'es-ES' || lang === 'es-AR';
  const isPt = lang === 'pt-BR';
  const isFr = lang === 'fr-FR';

  switch (type) {
    case 'epl':
      return {
        outerBorder: 'border-cyan-400/80 shadow-[0_0_60px_rgba(0,255,133,0.3)]',
        headerBg: 'bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950',
        accentText: 'text-cyan-300',
        accentBg: 'bg-purple-900/80 border-cyan-400/50',
        badgeText: isEs ? 'PREMIER LEAGUE INGLESA 🦁' : isPt ? 'PREMIER LEAGUE INGLESA 🦁' : isFr ? 'PREMIER LEAGUE ANGLAISE 🦁' : 'ENGLISH PREMIER LEAGUE 🦁',
        btnGradient: 'from-emerald-400 via-teal-400 to-cyan-500 text-purple-950 hover:brightness-110 shadow-cyan-500/30',
        icon: Crown,
        subHeader: isEs
          ? 'LA LIGA MÁS COMPETITIVA DEL MUNDO'
          : isPt
          ? 'A LIGA MAIS COMPETITIVA DO MUNDO'
          : isFr
          ? 'LE CHAMPIONNAT LE PLUS COMPÉTITIF DU MONDE'
          : 'THE GREATEST LEAGUE ON EARTH',
      };

    case 'ucl':
      return {
        outerBorder: 'border-cyan-400/80 shadow-[0_0_70px_rgba(6,182,212,0.4)]',
        headerBg: 'bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950',
        accentText: 'text-cyan-300',
        accentBg: 'bg-blue-900/80 border-cyan-400/50',
        badgeText: 'UEFA CHAMPIONS LEAGUE ⭐⭐⭐',
        btnGradient: 'from-cyan-400 via-sky-400 to-blue-500 text-slate-950 hover:brightness-110 shadow-cyan-400/30',
        icon: Sparkles,
        subHeader: isEs
          ? '¡LA GLORIA EUROPEA! DUELO DE ÉLITE CONTINENTAL'
          : isPt
          ? 'A GLÓRIA EUROPEIA! DUELO DA ELITE CONTINENTAL'
          : isFr
          ? 'LE SOMMET EUROPÉEN ! CHOC DE L\'ÉLITE CONTINENTALE'
          : 'THE CHAAAAAMPIONS! EUROPEAN ELITE SHOWDOWN',
      };

    case 'libertadores':
      return {
        outerBorder: 'border-amber-500/80 shadow-[0_0_60px_rgba(245,158,11,0.35)]',
        headerBg: 'bg-gradient-to-r from-red-950 via-slate-950 to-amber-950',
        accentText: 'text-amber-400',
        accentBg: 'bg-red-950/80 border-amber-500/50',
        badgeText: 'CONMEBOL LIBERTADORES 🏆',
        btnGradient: 'from-amber-400 via-orange-500 to-red-600 text-slate-950 hover:brightness-110 shadow-amber-500/30',
        icon: Flame,
        subHeader: isEs
          ? 'LA GLORIA ETERNA • PASIÓN SUDAMERICANA'
          : isPt
          ? 'A GLÓRIA ETERNA • PAIXÃO SUL-AMERICANA'
          : isFr
          ? 'LA GLOIRE ÉTERNELLE • PASSION SUD-AMÉRICAINE'
          : 'LA GLORIA ETERNA • SOUTH AMERICAN PASSION',
      };

    case 'sudamericana':
      return {
        outerBorder: 'border-sky-400/80 shadow-[0_0_70px_rgba(56,189,248,0.4)]',
        headerBg: 'bg-gradient-to-r from-sky-950 via-slate-900 to-blue-950',
        accentText: 'text-sky-300',
        accentBg: 'bg-sky-950/80 border-sky-400/50',
        badgeText: 'CONMEBOL SUDAMERICANA 🏆',
        btnGradient: 'from-sky-400 via-blue-500 to-indigo-600 text-white hover:brightness-110 shadow-sky-500/30',
        icon: Trophy,
        subHeader: isEs
          ? 'LA OTRA MITAD DE LA GLORIA • CONMEBOL SUDAMERICANA'
          : isPt
          ? 'A OUTRA METADE DA GLÓRIA • COPA SUL-AMERICANA'
          : isFr
          ? 'COPA SUDAMERICANA • GLOIRE CONTINENTALE'
          : 'CONMEBOL SUDAMERICANA • CONTINENTAL PURSUIT',
      };

    case 'world_cup':
      return {
        outerBorder: 'border-amber-400/90 shadow-[0_0_80px_rgba(212,175,55,0.4)]',
        headerBg: 'bg-gradient-to-r from-rose-950 via-slate-950 to-amber-950',
        accentText: 'text-amber-300',
        accentBg: 'bg-rose-950/80 border-amber-400/50',
        badgeText: isEs ? 'COPA MUNDIAL DE LA FIFA 🌍🏆' : isPt ? 'COPA DO MUNDO FIFA 🌍🏆' : isFr ? 'COUPE DU MONDE DE LA FIFA 🌍🏆' : 'FIFA WORLD CUP 🌍🏆',
        btnGradient: 'from-amber-300 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-400/40',
        icon: Globe,
        subHeader: isEs
          ? 'LA CÚSPIDE DEL FÚTBOL MUNDIAL'
          : isPt
          ? 'O ÁPICE DO FUTEBOL MUNDIAL'
          : isFr
          ? 'LE SOMMET DU FOOTBALL MONDIAL'
          : 'THE PINNACLE OF GLOBAL FOOTBALL',
      };

    case 'copa_america':
      return {
        outerBorder: 'border-sky-400/80 shadow-[0_0_60px_rgba(56,189,248,0.3)]',
        headerBg: 'bg-gradient-to-r from-sky-950 via-slate-900 to-blue-950',
        accentText: 'text-sky-300',
        accentBg: 'bg-sky-900/80 border-sky-400/50',
        badgeText: 'COPA AMÉRICA ⭐️',
        btnGradient: 'from-sky-400 via-blue-500 to-indigo-600 text-white hover:brightness-110 shadow-sky-400/30',
        icon: Shield,
        subHeader: isEs
          ? 'PASIÓN, GARRA Y GLORIA CONTINENTAL'
          : isPt
          ? 'PAIXÃO, RAÇA E GLÓRIA CONTINENTAL'
          : isFr
          ? 'PASSION ET GLOIRE CONTINENTALE'
          : 'CONTINENTAL LATIN PASSION & GLORY',
      };

    case 'eurocopa':
      return {
        outerBorder: 'border-indigo-400/80 shadow-[0_0_60px_rgba(99,102,241,0.35)]',
        headerBg: 'bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950',
        accentText: 'text-indigo-300',
        accentBg: 'bg-indigo-900/80 border-indigo-400/50',
        badgeText: isEs ? 'EUROCOPA DE LA UEFA 🇪🇺' : isPt ? 'EUROCOPA DA UEFA 🇪🇺' : isFr ? 'CHAMPIONNAT D\'EUROPE UEFA 🇪🇺' : 'UEFA EURO CHAMPIONSHIP 🇪🇺',
        btnGradient: 'from-indigo-400 via-blue-500 to-sky-400 text-white hover:brightness-110 shadow-indigo-400/30',
        icon: Award,
        subHeader: isEs
          ? 'SUPREMACÍA DE SELECCIONES EUROPEAS'
          : isPt
          ? 'SUPREMACIA DAS SELEÇÕES EUROPEIAS'
          : isFr
          ? 'SUPRÉMATIE DES SÉLECTIONS EUROPÉENNES'
          : 'EUROPEAN NATIONAL SUPREMACY',
      };

    case 'u17_qualifiers_wc':
      return {
        outerBorder: 'border-teal-400/80 shadow-[0_0_50px_rgba(20,184,166,0.3)]',
        headerBg: 'bg-gradient-to-r from-teal-950 via-slate-900 to-cyan-950',
        accentText: 'text-teal-300',
        accentBg: 'bg-teal-900/80 border-teal-400/50',
        badgeText: isEs ? 'MUNDIAL SUB-17 Y CLASIFICATORIAS ⚡' : isPt ? 'MUNDIAL SUB-17 E ELIMINATÓRIAS ⚡' : isFr ? 'COUPE DU MONDE U17 & ÉLIMINATOIRES ⚡' : 'FIFA U-17 WORLD CUP & QUALIFIERS ⚡',
        btnGradient: 'from-teal-400 via-cyan-500 to-blue-500 text-slate-950 hover:brightness-110 shadow-teal-400/30',
        icon: Flag,
        subHeader: isEs
          ? 'EL CAMINO DE LAS SELECCIONES SUB-17'
          : isPt
          ? 'O CAMINHO DAS SELEÇÕES SUB-17'
          : isFr
          ? 'LE PARCOURS DES SÉLECTIONS U17'
          : 'U17 NATIONAL TEAMS PATHWAY',
      };

    case 'u20_qualifiers_wc':
      return {
        outerBorder: 'border-rose-400/80 shadow-[0_0_50px_rgba(244,63,94,0.3)]',
        headerBg: 'bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950',
        accentText: 'text-rose-300',
        accentBg: 'bg-rose-900/80 border-rose-400/50',
        badgeText: isEs ? 'MUNDIAL SUB-20 Y CLASIFICATORIAS 🌟' : isPt ? 'MUNDIAL SUB-20 E ELIMINATÓRIAS 🌟' : isFr ? 'COUPE DU MONDE U20 & ÉLIMINATOIRES 🌟' : 'FIFA U-20 WORLD CUP & QUALIFIERS 🌟',
        btnGradient: 'from-rose-400 via-amber-400 to-orange-500 text-slate-950 hover:brightness-110 shadow-rose-400/30',
        icon: Globe,
        subHeader: isEs
          ? 'VITRINA MUNDIAL DE PROMESAS SUB-20'
          : isPt
          ? 'VITRINE MUNDIAL DE JOVENS PROMESSAS SUB-20'
          : isFr
          ? 'VITRINE MONDIALE DES ESPOIRS U20'
          : 'U20 GLOBAL PROSPECT SHOWCASE',
      };

    case 'u17_league_cup':
      return {
        outerBorder: 'border-orange-400/80 shadow-[0_0_50px_rgba(249,115,22,0.3)]',
        headerBg: 'bg-gradient-to-r from-orange-950 via-slate-900 to-teal-950',
        accentText: 'text-orange-300',
        accentBg: 'bg-orange-900/80 border-orange-400/50',
        badgeText: isEs ? 'CAMPEONATO SUB-17 DE PROMESAS 🔥' : isPt ? 'CAMPEONATO SUB-17 DE PROMESSAS 🔥' : isFr ? 'CHAMPIONNAT ESPOIRS U17 🔥' : 'U17 PROSPECT CHAMPIONSHIP 🔥',
        btnGradient: 'from-orange-400 via-amber-400 to-teal-500 text-slate-950 hover:brightness-110 shadow-orange-400/30',
        icon: Zap,
        subHeader: isEs
          ? 'DIVISIÓN COMPETITIVA FORMATIVA SUB-17'
          : isPt
          ? 'DIVISÃO COMPETITIVA FORMATIVA SUB-17'
          : isFr
          ? 'DIVISION COMPÉTITIVE FORMATIVE U17'
          : 'UNDER-17 COMPETITIVE DIVISION',
      };

    case 'u20_league_cup':
      return {
        outerBorder: 'border-purple-400/80 shadow-[0_0_50px_rgba(168,85,247,0.3)]',
        headerBg: 'bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950',
        accentText: 'text-purple-300',
        accentBg: 'bg-purple-900/80 border-purple-400/50',
        badgeText: isEs ? 'CAMPEONATO SUB-20 NEXT GEN 👑' : isPt ? 'CAMPEONATO SUB-20 NEXT GEN 👑' : isFr ? 'CHAMPIONNAT U20 NEXT GEN 👑' : 'U20 NEXT GEN CHAMPIONSHIP 👑',
        btnGradient: 'from-purple-400 via-violet-500 to-amber-400 text-white hover:brightness-110 shadow-purple-400/30',
        icon: Star,
        subHeader: isEs
          ? 'DIVISIÓN PRE-PROFESIONAL SUB-20'
          : isPt
          ? 'DIVISÃO PRÉ-PROFISSIONAL SUB-20'
          : isFr
          ? 'DIVISION PRÉ-PROFESSIONNELLE U20'
          : 'UNDER-20 PRO PATHWAY DIVISION',
      };

    case 'youth_cup':
      return {
        outerBorder: 'border-violet-400/80 shadow-[0_0_50px_rgba(139,92,246,0.3)]',
        headerBg: 'bg-gradient-to-r from-violet-950 via-slate-900 to-amber-950',
        accentText: 'text-violet-300',
        accentBg: 'bg-violet-900/80 border-violet-400/50',
        badgeText: isEs ? 'COPA INTERNACIONAL JUVENIL 🏆' : isPt ? 'COPA INTERNACIONAL JUVENIL 🏆' : isFr ? 'COUPE INTERNATIONALE DES JEUNES 🏆' : 'INTERNATIONAL YOUTH CUP 🏆',
        btnGradient: 'from-violet-400 via-indigo-500 to-amber-400 text-white hover:brightness-110 shadow-violet-400/30',
        icon: Trophy,
        subHeader: isEs
          ? 'TORNEO DE CANTERAS DE 32 CLUBES'
          : isPt
          ? 'TORNEIO DE ACADEMIAS COM 32 CLUBES'
          : isFr
          ? 'TOURNOI DE FORMATION À 32 CLUBS'
          : '32-CLUB ACADEMY TOURNAMENT',
      };

    case 'youth_league':
      return {
        outerBorder: 'border-lime-400/80 shadow-[0_0_50px_rgba(132,204,22,0.3)]',
        headerBg: 'bg-gradient-to-r from-lime-950 via-slate-900 to-cyan-950',
        accentText: 'text-lime-300',
        accentBg: 'bg-lime-900/80 border-lime-400/50',
        badgeText: isEs ? 'LIGA DE CANTERAS Y ACADEMIAS 🌱' : isPt ? 'LIGA DE ACADEMIAS DE BASE 🌱' : isFr ? 'LIGUE DES ACADÉMIES 🌱' : 'YOUTH ACADEMY LEAGUE 🌱',
        btnGradient: 'from-lime-400 via-emerald-400 to-cyan-500 text-slate-950 hover:brightness-110 shadow-lime-400/30',
        icon: Zap,
        subHeader: isEs
          ? 'CIRCUITO FORMATIVO DE FUTURAS ESTRELLAS'
          : isPt
          ? 'CIRCUITO FORMATIVO DE FUTURAS ESTRELAS'
          : isFr
          ? 'CIRCUIT FORMATIF DES FUTURES ÉTOILES'
          : 'FUTURE STARS ACADEMY CIRCUIT',
      };

    case 'local_cup':
      return {
        outerBorder: 'border-slate-300/80 shadow-[0_0_50px_rgba(203,213,225,0.3)]',
        headerBg: 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950',
        accentText: 'text-slate-200',
        accentBg: 'bg-slate-800/80 border-slate-400/50',
        badgeText: isEs ? 'COPA NACIONAL POR ELIMINACIÓN 🛡️' : isPt ? 'COPA NACIONAL DE ELIMINAÇÃO 🛡️' : isFr ? 'COUPE NATIONALE ÉLIMINATOIRE 🛡️' : 'DOMESTIC KNOCKOUT CUP 🛡️',
        btnGradient: 'from-slate-200 via-slate-300 to-blue-400 text-slate-950 hover:brightness-110 shadow-slate-300/30',
        icon: Swords,
        subHeader: isEs
          ? 'PRIMERA RONDA ELIMINATORIA'
          : isPt
          ? 'PRIMEIRA RODADA ELIMINATÓRIA'
          : isFr
          ? 'PREMIER TOUR ÉLIMINATOIRE'
          : 'ELIMINATION MATCHDAY 1',
      };

    case 'generic_international':
      return {
        outerBorder: 'border-blue-400/80 shadow-[0_0_50px_rgba(96,165,250,0.3)]',
        headerBg: 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950',
        accentText: 'text-blue-300',
        accentBg: 'bg-blue-900/80 border-blue-400/50',
        badgeText: isEs ? 'TORNEO DE SELECCIONES 🌐' : isPt ? 'TORNEIO DE SELEÇÕES 🌐' : isFr ? 'TOURNOI DE SÉLECTIONS 🌐' : 'INTERNATIONAL TOURNAMENT 🌐',
        btnGradient: 'from-blue-400 via-indigo-500 to-sky-400 text-white hover:brightness-110 shadow-blue-400/30',
        icon: Globe,
        subHeader: isEs
          ? 'DUELO INTERNACIONAL DE SELECCIONES'
          : isPt
          ? 'DUELO INTERNACIONAL DE SELEÇÕES'
          : isFr
          ? 'CHOC DES SÉLECTIONS INTERNATIONALES'
          : 'INTERNATIONAL NATIONS SHOWDOWN',
      };

    case 'local_league':
    default:
      return {
        outerBorder: 'border-emerald-400/80 shadow-[0_0_50px_rgba(16,185,129,0.3)]',
        headerBg: 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950',
        accentText: 'text-emerald-300',
        accentBg: 'bg-emerald-900/80 border-emerald-400/50',
        badgeText: isEs ? 'CAMPEONATO DE LIGA NACIONAL ⚽' : isPt ? 'CAMPEONATO DE LIGA NACIONAL ⚽' : isFr ? 'CHAMPIONNAT DE LIGUE NATIONALE ⚽' : 'DOMESTIC LEAGUE CHAMPIONSHIP ⚽',
        btnGradient: 'from-emerald-400 via-teal-400 to-cyan-500 text-slate-950 hover:brightness-110 shadow-emerald-400/30',
        icon: Trophy,
        subHeader: isEs
          ? 'JORNADA INAUGURAL DE LIGA'
          : isPt
          ? 'RODADA DE ABERTURA DA LIGA'
          : isFr
          ? 'JOURNÉE INAUGURALE DE CHAMPIONNAT'
          : 'OPENING MATCHDAY FIXTURE',
      };
  }
}

export const CompetitionStartModal: React.FC<CompetitionStartModalProps> = ({
  isOpen,
  data,
  onStart,
}) => {
  const { currentLanguage } = useLanguage();

  if (!isOpen) return null;

  const isEs = currentLanguage === 'es-ES' || currentLanguage === 'es-AR';
  const isAr = currentLanguage === 'es-AR';
  const isPt = currentLanguage === 'pt-BR';
  const isFr = currentLanguage === 'fr-FR';

  const compType = data.competitionType || detectCompetitionType(data.competitionName, data.category);
  const rawExpectation = data.expectation || calculateTeamExpectation(
    data.teamOvr,
    data.firstRivalOvr,
    compType,
    data.category,
    data.isPro,
    data.division
  );
  const expectation = normalizeTeamExpectation(rawExpectation, compType, data.category, data.isPro, data.division);

  const localizedCompName = getLocalizedCompetitionName(data.competitionName, currentLanguage);
  const localizedVenue = getLocalizedVenue(data.venue, currentLanguage);

  const news = {
    headline: data.newsHeadline || generateNewsStory(compType, localizedCompName, data.teamName, data.firstRivalName, expectation, currentLanguage).headline,
    summary: data.newsSummary || generateNewsStory(compType, localizedCompName, data.teamName, data.firstRivalName, expectation, currentLanguage).summary,
  };

  const expInfo = getLocalizedExpectationBadge(expectation, currentLanguage);
  const ExpIcon = expInfo.icon;
  const theme = getThemeConfig(compType, currentLanguage);
  const HeaderIcon = theme.icon;

  // Localized UI Text
  const matchdayLabel = isAr ? 'FECHA 1' : isEs ? 'JORNADA 1' : isPt ? 'RODADA 1' : isFr ? 'JOURNÉE 1' : 'MATCHDAY 1';
  const headerMainTitle = isAr
    ? `¡${localizedCompName.toUpperCase()} ESTÁ POR ARRANCAR!`
    : isEs
    ? `¡${localizedCompName.toUpperCase()} ESTÁ POR COMENZAR!`
    : isPt
    ? `¡${localizedCompName.toUpperCase()} ESTÁ PRESTES A COMEÇAR!`
    : isFr
    ? `${localizedCompName.toUpperCase()} EST SUR LE POINT DE COMMENCER !`
    : `${localizedCompName.toUpperCase()} IS ABOUT TO START!`;

  const newsBadgeText = isEs ? 'NOTICIA DE ÚLTIMA HORA' : isPt ? 'ÚLTIMAS NOTÍCIAS' : isFr ? 'DERNIÈRE MINUTE' : 'BREAKING NEWS REPORT';
  const firstRivalLabel = isEs ? 'PRIMER RIVAL' : isPt ? 'PRIMEIRO ADVERSÁRIO' : isFr ? 'PREMIER ADVERSAIRE' : 'FIRST RIVAL';
  const expectationLabel = isEs ? 'EXPECTATIVA' : isPt ? 'EXPECTATIVA' : isFr ? 'OBJECTIF' : 'EXPECTATION';

  const actionButtonText = isAr
    ? 'ENTRAR A LA COMPETENCIA Y JUGAR FECHA 1'
    : isEs
    ? 'ENTRAR A LA COMPETICIÓN Y JUGAR JORNADA 1'
    : isPt
    ? 'ENTRAR NA COMPETIÇÃO E JOGAR RODADA 1'
    : isFr
    ? 'ENTRER DANS LA COMPÉTITION & JOUER LE MATCH 1'
    : 'ENTER COMPETITION & START MATCH 1';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto text-left"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`bg-slate-900 border-2 ${theme.outerBorder} rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col relative overflow-hidden shadow-2xl my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge & Title (Fixed Header) */}
        <div className={`p-4 sm:p-5 border-b border-slate-800 shrink-0 ${theme.headerBg} space-y-2 relative overflow-hidden`}>
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.accentBg} ${theme.accentText}`}>
              <HeaderIcon className="w-3.5 h-3.5" />
              {theme.badgeText}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              {matchdayLabel}
            </span>
          </div>

          <div>
            <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-tight leading-tight">
              {headerMainTitle}
            </h2>
            <p className="text-xs font-bold text-slate-300 mt-0.5">
              {theme.subHeader}
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-1 py-3">
          {/* Small News Piece */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Newspaper className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{newsBadgeText}</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
              {news.headline}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {news.summary}
            </p>
          </div>

          {/* Matchday 1 First Rival & Expectation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* First Rival Card */}
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2 flex flex-col justify-between">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-rose-400" /> {firstRivalLabel}
              </div>
              <div>
                <div className="text-sm font-black text-white truncate">
                  {data.firstRivalName}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {data.firstRivalOvr !== undefined && (
                    <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono font-bold text-amber-400">
                      OVR {data.firstRivalOvr}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-400">
                    {localizedVenue}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Expectations Card */}
            <div className={`p-3 rounded-xl border bg-gradient-to-br ${expInfo.color} space-y-1 flex flex-col justify-between`}>
              <div className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <ExpIcon className="w-3.5 h-3.5" /> {expectationLabel}
              </div>
              <div>
                <div className="text-xs font-black uppercase text-white tracking-wide">
                  {expInfo.label}
                </div>
                <p className="text-[10px] text-slate-200 leading-tight mt-0.5">
                  {expInfo.desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button to Launch Season / Tournament (Fixed Footer) */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/95 shrink-0">
          <button
            onClick={onStart}
            className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${theme.btnGradient} font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95`}
          >
            <span>{actionButtonText}</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

