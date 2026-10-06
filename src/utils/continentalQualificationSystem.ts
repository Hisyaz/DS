import { LeagueDatabase, EditorTeamData } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import {
  ContinentalCompetitionId,
  ContinentalQualificationEntry,
} from '../types/continentalCompetitions';
import {
  getEligibleClubsForFederation,
  CONTINENTAL_COMPETITIONS_CATALOG,
} from './continentalDatabaseSystem';
import { getContinentalTournamentState } from './continentalTournamentEngine';
import { getClubFederation, isCompetitionValidForFederation } from './clubContextRebuilder';

export interface DomesticSeasonResultSnapshot {
  leagueId: string;
  countryCode: string;
  championTeamId?: string;
  cupWinnerTeamId?: string;
  rankedTeamIds: string[]; // 1st, 2nd, 3rd, 4th, etc.
}

export const CONTINENTAL_DOMESTIC_SNAPSHOTS_STORAGE_KEY_PREFIX = 'CONTINENTAL_DOMESTIC_SNAPSHOTS_';

export function saveDomesticSeasonSnapshotsForNextSeason(
  nextSeasonNumericYear: number,
  snapshots: DomesticSeasonResultSnapshot[]
): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        `${CONTINENTAL_DOMESTIC_SNAPSHOTS_STORAGE_KEY_PREFIX}${nextSeasonNumericYear}`,
        JSON.stringify(snapshots)
      );
    }
  } catch (e) {
    console.warn('Failed to save domestic snapshots for next season:', e);
  }
}

export function getDomesticSeasonSnapshotsForSeason(
  seasonYear: number
): DomesticSeasonResultSnapshot[] | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(
        `${CONTINENTAL_DOMESTIC_SNAPSHOTS_STORAGE_KEY_PREFIX}${seasonYear}`
      );
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.warn('Failed to load domestic snapshots for season:', e);
  }
  return null;
}

export interface ContinentalSlotConfig {
  type: 'spot' | 'fixed';
  pot: 1 | 2 | 3 | 4 | 5 | 6;
  // If type === 'spot'
  countryCode?: string;
  leagueId?: string;
  rank?: number; // 1 = 1st place in domestic league, 2 = 2nd place, etc.
  spotLabel?: string; // e.g. "SPOT 1 Spain (1st)"
  // If type === 'fixed'
  clubId?: string;
  clubName?: string;
}

/**
 * UEFA Champions League 2026/27 — 36 Slots (4 Pots of 9 Teams)
 * Dynamically resolves domestic SPOTS while honoring fixed/generated continental clubs.
 */
export const UEFA_CHAMPIONS_LEAGUE_SLOTS: ContinentalSlotConfig[] = [
  // Pot 1 (9 teams)
  { type: 'spot', pot: 1, countryCode: 'ESP', leagueId: 'spain_d1', rank: 1, spotLabel: 'SPOT 1 Spain (1st)' },
  { type: 'spot', pot: 1, countryCode: 'ENG', leagueId: 'england_d1', rank: 1, spotLabel: 'SPOT 1 England (1st)' },
  { type: 'spot', pot: 1, countryCode: 'GER', leagueId: 'germany_d1', rank: 1, spotLabel: 'SPOT 1 Germany (1st)' },
  { type: 'spot', pot: 1, countryCode: 'ENG', leagueId: 'england_d1', rank: 2, spotLabel: 'SPOT 2 England (2nd)' },
  { type: 'spot', pot: 1, countryCode: 'FRA', leagueId: 'france_d1', rank: 1, spotLabel: 'SPOT 1 France (1st)' },
  { type: 'spot', pot: 1, countryCode: 'ITA', leagueId: 'italy_d1', rank: 1, spotLabel: 'SPOT 1 Italy (1st)' },
  { type: 'spot', pot: 1, countryCode: 'ENG', leagueId: 'england_d1', rank: 3, spotLabel: 'SPOT 3 England (3rd)' },
  { type: 'spot', pot: 1, countryCode: 'GER', leagueId: 'germany_d1', rank: 2, spotLabel: 'SPOT 2 Germany (2nd)' },
  { type: 'spot', pot: 1, countryCode: 'ESP', leagueId: 'spain_d1', rank: 2, spotLabel: 'SPOT 2 Spain (2nd)' },

  // Pot 2 (9 teams)
  { type: 'spot', pot: 2, countryCode: 'ENG', leagueId: 'england_d1', rank: 4, spotLabel: 'SPOT 4 England (4th)' },
  { type: 'spot', pot: 2, countryCode: 'GER', leagueId: 'germany_d1', rank: 3, spotLabel: 'SPOT 3 Germany (3rd)' },
  { type: 'spot', pot: 2, countryCode: 'ESP', leagueId: 'spain_d1', rank: 3, spotLabel: 'SPOT 3 Spain (3rd)' },
  { type: 'spot', pot: 2, countryCode: 'POR', leagueId: 'portugal_d1', rank: 1, spotLabel: 'SPOT 1 Portugal (1st)' },
  { type: 'spot', pot: 2, countryCode: 'POR', leagueId: 'portugal_d1', rank: 2, spotLabel: 'SPOT 2 Portugal (2nd)' },
  { type: 'spot', pot: 2, countryCode: 'ITA', leagueId: 'italy_d1', rank: 2, spotLabel: 'SPOT 2 Italy (2nd)' },
  { type: 'spot', pot: 2, countryCode: 'ESP', leagueId: 'spain_d1', rank: 4, spotLabel: 'SPOT 4 Spain (4th)' },
  { type: 'spot', pot: 2, countryCode: 'ITA', leagueId: 'italy_d1', rank: 3, spotLabel: 'SPOT 3 Italy (3rd)' },
  { type: 'spot', pot: 2, countryCode: 'GER', leagueId: 'germany_d1', rank: 4, spotLabel: 'SPOT 4 Germany (4th)' },

  // Pot 3 (9 teams)
  { type: 'spot', pot: 3, countryCode: 'ENG', leagueId: 'england_d1', rank: 5, spotLabel: 'SPOT 5 England (5th)' },
  { type: 'fixed', pot: 3, clubId: 'uefa_club_brugge', clubName: 'Club Brugge KV' },
  { type: 'fixed', pot: 3, clubId: 'uefa_psv', clubName: 'PSV Eindhoven' },
  { type: 'fixed', pot: 3, clubId: 'uefa_ajax', clubName: 'AFC Ajax' },
  { type: 'spot', pot: 3, countryCode: 'ITA', leagueId: 'italy_d1', rank: 4, spotLabel: 'SPOT 4 Italy (4th)' },
  { type: 'fixed', pot: 3, clubId: 'uefa_olympiacos', clubName: 'Olympiacos FC' },
  { type: 'fixed', pot: 3, clubId: 'uefa_slavia_prague', clubName: 'SK Slavia Prague' },
  { type: 'fixed', pot: 3, clubId: 'uefa_bodo_glimt', clubName: 'FK Bodø/Glimt' },
  { type: 'spot', pot: 3, countryCode: 'FRA', leagueId: 'france_d1', rank: 2, spotLabel: 'SPOT 2 France (2nd)' },

  // Pot 4 (9 teams)
  { type: 'fixed', pot: 4, clubId: 'uefa_copenhagen', clubName: 'FC Copenhagen' },
  { type: 'spot', pot: 4, countryCode: 'FRA', leagueId: 'france_d1', rank: 3, spotLabel: 'SPOT 3 France (3rd)' },
  { type: 'fixed', pot: 4, clubId: 'uefa_galatasaray', clubName: 'Galatasaray SK' },
  { type: 'fixed', pot: 4, clubId: 'uefa_union_sg', clubName: 'Union Saint-Gilloise' },
  { type: 'fixed', pot: 4, clubId: 'uefa_qarabag', clubName: 'Qarabağ FK' },
  { type: 'spot', pot: 4, countryCode: 'ESP', leagueId: 'spain_d1', rank: 5, spotLabel: 'SPOT 5 Spain (5th)' },
  { type: 'spot', pot: 4, countryCode: 'ENG', leagueId: 'england_d1', rank: 6, spotLabel: 'SPOT 6 England (6th)' },
  { type: 'fixed', pot: 4, clubId: 'uefa_pafos', clubName: 'Pafos FC' },
  { type: 'fixed', pot: 4, clubId: 'uefa_kairat_almaty', clubName: 'FC Kairat Almaty' },
];

/**
 * UEFA Europa League 2026/27 — 36 Slots (4 Pots of 9 Teams)
 */
export const UEFA_EUROPA_LEAGUE_SLOTS: ContinentalSlotConfig[] = [
  // Pot 1 (9 teams)
  { type: 'spot', pot: 1, countryCode: 'GER', leagueId: 'germany_d1', rank: 5, spotLabel: 'SPOT 5 Germany (5th)' },
  { type: 'spot', pot: 1, countryCode: 'POR', leagueId: 'portugal_d1', rank: 3, spotLabel: 'SPOT 3 Portugal (3rd)' },
  { type: 'spot', pot: 1, countryCode: 'ITA', leagueId: 'italy_d1', rank: 5, spotLabel: 'SPOT 5 Italy (5th)' },
  { type: 'spot', pot: 1, countryCode: 'ITA', leagueId: 'italy_d1', rank: 6, spotLabel: 'SPOT 6 Italy (6th)' },
  { type: 'spot', pot: 1, countryCode: 'FRA', leagueId: 'france_d1', rank: 4, spotLabel: 'SPOT 4 France (4th)' },
  { type: 'fixed', pot: 1, clubId: 'uefa_az_alkmaar', clubName: 'AZ Alkmaar' },
  { type: 'fixed', pot: 1, clubId: 'uefa_paok', clubName: 'PAOK FC' },
  { type: 'spot', pot: 1, countryCode: 'ESP', leagueId: 'spain_d1', rank: 6, spotLabel: 'SPOT 6 Spain (6th)' },
  { type: 'spot', pot: 1, countryCode: 'FRA', leagueId: 'france_d1', rank: 5, spotLabel: 'SPOT 5 France (5th)' },

  // Pot 2 (9 teams)
  { type: 'fixed', pot: 2, clubId: 'uefa_ferencvaros', clubName: 'Ferencvárosi TC' },
  { type: 'fixed', pot: 2, clubId: 'uefa_viktoria_plzen', clubName: 'FC Viktoria Plzeň' },
  { type: 'fixed', pot: 2, clubId: 'uefa_fenerbahce', clubName: 'Fenerbahçe SK' },
  { type: 'fixed', pot: 2, clubId: 'uefa_dinamo_zagreb', clubName: 'GNK Dinamo Zagreb' },
  { type: 'fixed', pot: 2, clubId: 'uefa_rb_salzburg', clubName: 'Red Bull Salzburg' },
  { type: 'fixed', pot: 2, clubId: 'uefa_celtic', clubName: 'Celtic FC' },
  { type: 'fixed', pot: 2, clubId: 'uefa_sparta_prague', clubName: 'AC Sparta Prague' },
  { type: 'spot', pot: 2, countryCode: 'FRA', leagueId: 'france_d1', rank: 6, spotLabel: 'SPOT 6 France (6th)' },
  { type: 'fixed', pot: 2, clubId: 'uefa_anderlecht', clubName: 'RSC Anderlecht' },

  // Pot 3 (9 teams)
  { type: 'fixed', pot: 3, clubId: 'uefa_sturm_graz', clubName: 'SK Sturm Graz' },
  { type: 'fixed', pot: 3, clubId: 'uefa_lech_poznan', clubName: 'Lech Poznań' },
  { type: 'spot', pot: 3, countryCode: 'ENG', leagueId: 'england_d1', rank: 7, spotLabel: 'SPOT 7 England (7th)' },
  { type: 'spot', pot: 3, countryCode: 'ENG', leagueId: 'england_d1', rank: 8, spotLabel: 'SPOT 8 England (8th)' },
  { type: 'spot', pot: 3, countryCode: 'ENG', leagueId: 'england_d1', rank: 9, spotLabel: 'SPOT 9 England (9th)' },
  { type: 'fixed', pot: 3, clubId: 'uefa_celje', clubName: 'NK Celje' },
  { type: 'fixed', pot: 3, clubId: 'uefa_jagiellonia', clubName: 'Jagiellonia Białystok' },
  { type: 'fixed', pot: 3, clubId: 'uefa_omonia_nicosia', clubName: 'AC Omonia Nicosia' },
  { type: 'spot', pot: 3, countryCode: 'ESP', leagueId: 'spain_d1', rank: 7, spotLabel: 'SPOT 7 Spain (7th)' },

  // Pot 4 (9 teams)
  { type: 'spot', pot: 4, countryCode: 'GER', leagueId: 'germany_d1', rank: 6, spotLabel: 'SPOT 6 Germany (6th)' },
  { type: 'fixed', pot: 4, clubId: 'uefa_besiktas', clubName: 'Beşiktaş JK' },
  { type: 'fixed', pot: 4, clubId: 'uefa_shakhtar_donetsk', clubName: 'FC Shakhtar Donetsk' },
  { type: 'fixed', pot: 4, clubId: 'uefa_hapoel_beer_sheva', clubName: "Hapoel Be'er Sheva" },
  { type: 'fixed', pot: 4, clubId: 'uefa_nec_nijmegen', clubName: 'NEC Nijmegen' },
  { type: 'fixed', pot: 4, clubId: 'uefa_ofi_creta', clubName: 'OFI Crete FC' },
  { type: 'fixed', pot: 4, clubId: 'uefa_lillestrom', clubName: 'Lillestrøm SK' },
  { type: 'fixed', pot: 4, clubId: 'uefa_levski_sofia', clubName: 'PFC Levski Sofia' },
  { type: 'fixed', pot: 4, clubId: 'uefa_ararat_armenia', clubName: 'FC Ararat-Armenia' },
];

/**
 * UEFA Conference League 2026/27 — 36 Slots (6 Pots of 6 Teams)
 */
export const UEFA_CONFERENCE_LEAGUE_SLOTS: ContinentalSlotConfig[] = [
  // Pot 1 (6 teams)
  { type: 'spot', pot: 1, countryCode: 'ITA', leagueId: 'italy_d1', rank: 7, spotLabel: 'SPOT 7 Italy (7th)' },
  { type: 'spot', pot: 1, countryCode: 'POR', leagueId: 'portugal_d1', rank: 4, spotLabel: 'SPOT 4 Portugal (4th)' },
  { type: 'fixed', pot: 1, clubId: 'uefa_fc_twente', clubName: 'FC Twente' },
  { type: 'spot', pot: 1, countryCode: 'GER', leagueId: 'germany_d1', rank: 7, spotLabel: 'SPOT 7 Germany (7th)' },
  { type: 'spot', pot: 1, countryCode: 'FRA', leagueId: 'france_d1', rank: 7, spotLabel: 'SPOT 7 France (7th)' },
  { type: 'fixed', pot: 1, clubId: 'uefa_young_boys', clubName: 'BSC Young Boys' },

  // Pot 2 (6 teams)
  { type: 'fixed', pot: 2, clubId: 'uefa_midtjylland', clubName: 'FC Midtjylland' },
  { type: 'fixed', pot: 2, clubId: 'uefa_red_star_belgrade', clubName: 'Red Star Belgrade' },
  { type: 'fixed', pot: 2, clubId: 'uefa_kaa_gent', clubName: 'KAA Gent' },
  { type: 'fixed', pot: 2, clubId: 'uefa_panathinaikos', clubName: 'Panathinaikos FC' },
  { type: 'fixed', pot: 2, clubId: 'uefa_maccabi_tel_aviv', clubName: 'Maccabi Tel Aviv' },
  { type: 'spot', pot: 2, countryCode: 'ENG', leagueId: 'england_d1', rank: 10, spotLabel: 'SPOT 10 England (10th)' },

  // Pot 3 (6 teams)
  { type: 'fixed', pot: 3, clubId: 'uefa_lugano', clubName: 'FC Lugano' },
  { type: 'spot', pot: 3, countryCode: 'ESP', leagueId: 'spain_d1', rank: 8, spotLabel: 'SPOT 8 Spain (8th)' },
  { type: 'fixed', pot: 3, clubId: 'uefa_kups_kuopio', clubName: 'KuPS Kuopio' },
  { type: 'fixed', pot: 3, clubId: 'uefa_fc_utrecht', clubName: 'FC Utrecht' },
  { type: 'fixed', pot: 3, clubId: 'uefa_lincoln_red_imps', clubName: 'Lincoln Red Imps FC' },
  { type: 'fixed', pot: 3, clubId: 'uefa_borac_banja_luka', clubName: 'FK Borac Banja Luka' },

  // Pot 4 (6 teams)
  { type: 'fixed', pot: 4, clubId: 'uefa_sint_truidense', clubName: 'Sint-Truidense VV' },
  { type: 'fixed', pot: 4, clubId: 'uefa_sk_brann', clubName: 'SK Brann' },
  { type: 'fixed', pot: 4, clubId: 'uefa_hearts', clubName: 'Heart of Midlothian' },
  { type: 'fixed', pot: 4, clubId: 'uefa_astana', clubName: 'FC Astana' },
  { type: 'fixed', pot: 4, clubId: 'uefa_trabzonspor', clubName: 'Trabzonspor' },
  { type: 'fixed', pot: 4, clubId: 'uefa_universitatea_craiova', clubName: 'Universitatea Craiova' },

  // Pot 5 (6 teams)
  { type: 'fixed', pot: 5, clubId: 'uefa_riga_fc', clubName: 'Riga FC' },
  { type: 'fixed', pot: 5, clubId: 'uefa_hajduk_split', clubName: 'HNK Hajduk Split' },
  { type: 'fixed', pot: 5, clubId: 'uefa_nordsjaelland', clubName: 'FC Nordsjælland' },
  { type: 'fixed', pot: 5, clubId: 'uefa_agf_aarhus', clubName: 'AGF Aarhus' },
  { type: 'fixed', pot: 5, clubId: 'uefa_inter_escaldes', clubName: "Inter Club d'Escaldes" },
  { type: 'fixed', pot: 5, clubId: 'uefa_fk_jablonec', clubName: 'FK Jablonec' },

  // Pot 6 (6 teams)
  { type: 'fixed', pot: 6, clubId: 'uefa_fc_thun', clubName: 'FC Thun' },
  { type: 'fixed', pot: 6, clubId: 'uefa_cska_sofia', clubName: 'PFC CSKA Sofia' },
  { type: 'fixed', pot: 6, clubId: 'uefa_kauno_zalgiris', clubName: 'FK Kauno Žalgiris' },
  { type: 'fixed', pot: 6, clubId: 'uefa_mjallby', clubName: 'Mjällby AIF' },
  { type: 'fixed', pot: 6, clubId: 'uefa_iberia_1999', clubName: 'FC Iberia 1999' },
  { type: 'fixed', pot: 6, clubId: 'uefa_fk_egnatia', clubName: 'KF Egnatia' },
];

/**
 * Retrieves all club IDs already participating in other continental tournaments
 * in the same federation for the given season to guarantee strict mutual exclusivity.
 */
export function getAssignedContinentalClubsForSeason(
  federation: string,
  seasonYear: number,
  excludeCompId?: ContinentalCompetitionId
): Set<string> {
  const assigned = new Set<string>();
  const fedCompetitions = Object.values(CONTINENTAL_COMPETITIONS_CATALOG).filter(
    (c) => c.federation === federation && !c.isSuperCup && c.id !== excludeCompId
  );

  fedCompetitions.forEach((comp) => {
    const existingTourn = getContinentalTournamentState(comp.id, seasonYear);
    if (existingTourn && existingTourn.participatingTeamIds) {
      existingTourn.participatingTeamIds.forEach((tId) => assigned.add(tId));
    }
  });

  return assigned;
}

/**
 * Helper to sort teams by overall rating (and name fallback for determinism)
 */
function sortTeamsByStrength(teams: EditorTeamData[]): EditorTeamData[] {
  return [...teams].sort((a, b) => (b.overallRating || 70) - (a.overallRating || 70) || a.name.localeCompare(b.name));
}

/**
 * Builds domestic season snapshots from active world simulation leagues or league database fallback
 */
export function buildDomesticSeasonSnapshots(
  leagueDb: LeagueDatabase,
  worldState?: { leagues?: Record<string, { leagueId: string; countryCode: string; standings: Array<{ teamId: string }> }> }
): DomesticSeasonResultSnapshot[] {
  const snapshots: DomesticSeasonResultSnapshot[] = [];

  if (worldState && worldState.leagues) {
    Object.values(worldState.leagues).forEach((l) => {
      if (l.standings && l.standings.length > 0) {
        snapshots.push({
          leagueId: l.leagueId,
          countryCode: l.countryCode,
          championTeamId: l.standings[0]?.teamId,
          rankedTeamIds: l.standings.map((s) => s.teamId),
        });
      }
    });
  }

  // If some domestic leagues are missing from snapshots, populate from leagueDb preserving the league's defined team order
  Object.values(leagueDb.leagues || {}).forEach((league) => {
    if (!snapshots.some((s) => s.leagueId === league.id)) {
      const teamIds = (league.teamIds || []).filter((tid) => leagueDb.teams[tid]);
      snapshots.push({
        leagueId: league.id,
        countryCode: league.countryCode,
        championTeamId: teamIds[0],
        rankedTeamIds: teamIds,
      });
    }
  });

  return snapshots;
}

/**
 * Resolves a single slot configuration (either SPOT or FIXED club)
 */
function resolveSlot(
  slot: ContinentalSlotConfig,
  leagueDb: LeagueDatabase,
  domesticSnapshots: DomesticSeasonResultSnapshot[],
  allFedClubs: EditorTeamData[],
  assignedTeamIds: Set<string>,
  clubsById: Map<string, EditorTeamData>
): { team: EditorTeamData; desc: string; sourceType: ContinentalQualificationEntry['sourceType'] } | null {
  if (slot.type === 'spot') {
    const cc = (slot.countryCode || '').toUpperCase();
    const lId = slot.leagueId;
    const rank = slot.rank || 1;
    const rankIdx = rank - 1;

    // 1. Try to find domestic snapshot matching countryCode or leagueId
    const snap = domesticSnapshots.find(
      (s) =>
        (lId && s.leagueId === lId) ||
        s.countryCode?.toUpperCase() === cc ||
        (cc === 'FRA' && s.countryCode?.toUpperCase() === 'FR') ||
        (cc === 'GER' && s.countryCode?.toUpperCase() === 'DEU')
    );

    if (snap && snap.rankedTeamIds && snap.rankedTeamIds.length > 0) {
      // Find the team at exact rank or next available if already assigned
      let chosenTeamId = snap.rankedTeamIds[rankIdx];
      if (!chosenTeamId || assignedTeamIds.has(chosenTeamId)) {
        // Fallback to next unassigned team in the ranked snapshot
        const alt = snap.rankedTeamIds.find((id) => !assignedTeamIds.has(id));
        if (alt) chosenTeamId = alt;
      }
      if (chosenTeamId) {
        const team = clubsById.get(chosenTeamId) || leagueDb.teams[chosenTeamId];
        if (team && !assignedTeamIds.has(team.id)) {
          return {
            team,
            desc: `${team.name} (${slot.spotLabel || `SPOT ${rank} ${cc}`})`,
            sourceType: rank === 1 ? 'domestic_champion' : 'league_rank',
          };
        }
      }
    }

    // 2. If no snapshot or team not resolved from snapshot, resolve from leagueDb teams preserving defined league position
    let leagueTeams: EditorTeamData[] = [];
    if (lId && leagueDb.leagues[lId]?.teamIds) {
      leagueTeams = leagueDb.leagues[lId].teamIds
        .map((tid) => clubsById.get(tid) || leagueDb.teams[tid])
        .filter(Boolean) as EditorTeamData[];
      let chosenTeam = leagueTeams[rankIdx];
      if (!chosenTeam || assignedTeamIds.has(chosenTeam.id)) {
        chosenTeam = leagueTeams.find((t) => !assignedTeamIds.has(t.id))!;
      }
      if (chosenTeam && !assignedTeamIds.has(chosenTeam.id)) {
        return {
          team: chosenTeam,
          desc: `${chosenTeam.name} (${slot.spotLabel || `SPOT ${rank} ${cc}`})`,
          sourceType: rank === 1 ? 'domestic_champion' : 'league_rank',
        };
      }
    } else {
      leagueTeams = allFedClubs.filter(
        (c) =>
          (c.countryCode || '').toUpperCase() === cc ||
          (cc === 'FRA' && c.countryCode?.toUpperCase() === 'FR') ||
          (cc === 'GER' && c.countryCode?.toUpperCase() === 'DEU')
      );
      const sorted = sortTeamsByStrength(leagueTeams);
      let chosenTeam = sorted[rankIdx];
      if (!chosenTeam || assignedTeamIds.has(chosenTeam.id)) {
        chosenTeam = sorted.find((t) => !assignedTeamIds.has(t.id))!;
      }
      if (chosenTeam && !assignedTeamIds.has(chosenTeam.id)) {
        return {
          team: chosenTeam,
          desc: `${chosenTeam.name} (${slot.spotLabel || `SPOT ${rank} ${cc}`})`,
          sourceType: rank === 1 ? 'domestic_champion' : 'league_rank',
        };
      }
    }
  } else {
    // Fixed / named continental club
    let match: EditorTeamData | undefined;
    if (slot.clubId) {
      match = clubsById.get(slot.clubId) || leagueDb.teams[slot.clubId];
    }
    if (!match && slot.clubName) {
      const q = slot.clubName.toLowerCase();
      match = allFedClubs.find(
        (c) =>
          c.name.toLowerCase() === q ||
          c.name.toLowerCase().includes(q) ||
          q.includes(c.name.toLowerCase())
      );
    }
    if (match && !assignedTeamIds.has(match.id)) {
      return {
        team: match,
        desc: `${match.name} (Fixed Continental Club)`,
        sourceType: 'continental_pool',
      };
    }
  }
  return null;
}

/**
 * Calculates official continental qualification spots for all 36 (or 32) tournament slots in UEFA, CONMEBOL, etc.
 * Enforces STRICT mutual exclusivity: a club can only participate in one continental competition per season.
 */
export function determineContinentalQualifiers(
  competitionId: ContinentalCompetitionId,
  leagueDb: LeagueDatabase,
  domesticSnapshots: DomesticSeasonResultSnapshot[] = [],
  player?: PlayerCardData,
  seasonYear: number = 2026,
  externalAssignedTeamIds?: Set<string>
): ContinentalQualificationEntry[] {
  const meta = CONTINENTAL_COMPETITIONS_CATALOG[competitionId];
  if (!meta) return [];

  // Fallback to persisted next-season domestic snapshots if none were passed in directly
  let activeSnapshots = domesticSnapshots;
  if (!activeSnapshots || activeSnapshots.length === 0) {
    const persisted = getDomesticSeasonSnapshotsForSeason(seasonYear);
    if (persisted && persisted.length > 0) {
      activeSnapshots = persisted;
    }
  }

  const qualified: ContinentalQualificationEntry[] = [];
  const crossCompAssigned = externalAssignedTeamIds || getAssignedContinentalClubsForSeason(meta.federation, seasonYear, competitionId);
  const assignedTeamIds = new Set<string>(crossCompAssigned);

  const allFedClubs = getEligibleClubsForFederation(meta.federation, leagueDb);
  const clubsById = new Map<string, EditorTeamData>();
  allFedClubs.forEach((c) => clubsById.set(c.id, c));

  const addQualifier = (
    team: EditorTeamData,
    sourceType: ContinentalQualificationEntry['sourceType'],
    desc: string,
    pot: 1 | 2 | 3 | 4 | 5 | 6
  ): boolean => {
    if (!team || assignedTeamIds.has(team.id)) return false;
    assignedTeamIds.add(team.id);
    qualified.push({
      teamId: team.id,
      teamName: team.name,
      countryCode: (team.countryCode || 'INT').toUpperCase(),
      countryName: team.countryName || meta.federation,
      sourceType,
      sourceDescription: desc,
      competitionId,
      seedingPot: pot,
      teamOvr: team.overallRating || 75,
    });
    return true;
  };

  // 1. Process structured slots for UEFA competitions
  if (meta.federation === 'UEFA') {
    let slotList: ContinentalSlotConfig[] = [];
    if (competitionId === 'UEFA_CL') {
      slotList = UEFA_CHAMPIONS_LEAGUE_SLOTS;
    } else if (competitionId === 'UEFA_EL') {
      slotList = UEFA_EUROPA_LEAGUE_SLOTS;
    } else if (competitionId === 'UEFA_ECL') {
      slotList = UEFA_CONFERENCE_LEAGUE_SLOTS;
    }

    if (slotList.length > 0) {
      slotList.forEach((slot) => {
        const resolved = resolveSlot(
          slot,
          leagueDb,
          activeSnapshots,
          allFedClubs,
          assignedTeamIds,
          clubsById
        );
        if (resolved) {
          addQualifier(resolved.team, resolved.sourceType, resolved.desc, slot.pot);
        }
      });
    }
  } else if (meta.federation === 'CONMEBOL') {
    const getTeamsForCountry = (cc: string): EditorTeamData[] => {
      const list = allFedClubs.filter(
        (c) => (c.countryCode || '').toUpperCase() === cc.toUpperCase()
      );
      return sortTeamsByStrength(list);
    };

    const argTeams = getTeamsForCountry('ARG');
    const braTeams = getTeamsForCountry('BRA');
    const otherSa = allFedClubs.filter(
      (t) => !['ARG', 'BRA'].includes((t.countryCode || '').toUpperCase()) && !assignedTeamIds.has(t.id)
    );

    if (competitionId === 'CONMEBOL_LIB') {
      argTeams.slice(0, 6).forEach((t, i) => addQualifier(t, i === 0 ? 'domestic_champion' : 'league_rank', `${t.name} (Argentina)`, i < 2 ? 1 : 2));
      braTeams.slice(0, 6).forEach((t, i) => addQualifier(t, i === 0 ? 'domestic_champion' : 'league_rank', `${t.name} (Brazil)`, i < 2 ? 1 : 2));
      otherSa.slice(0, 20).forEach((t, i) => addQualifier(t, 'continental_pool', `${t.name} (CONMEBOL)`, ((i % 2) + 3) as any));
    } else if (competitionId === 'CONMEBOL_SUD') {
      argTeams.slice(6, 12).forEach((t) => addQualifier(t, 'league_rank', `${t.name} (Argentina)`, 2));
      braTeams.slice(6, 12).forEach((t) => addQualifier(t, 'league_rank', `${t.name} (Brazil)`, 2));
      otherSa.filter((t) => !assignedTeamIds.has(t.id)).slice(0, 20).forEach((t, i) => addQualifier(t, 'continental_pool', `${t.name} (Sudamericana)`, ((i % 4) + 1) as any));
    }
  } else if (meta.federation === 'AFC') {
    const getTeamsForCountry = (cc: string): EditorTeamData[] => {
      const list = allFedClubs.filter(
        (c) => (c.countryCode || '').toUpperCase() === cc.toUpperCase()
      );
      return sortTeamsByStrength(list);
    };

    const saudiTeams = getTeamsForCountry('KSA');
    const otherAfc = allFedClubs.filter((t) => !assignedTeamIds.has(t.id));
    saudiTeams.slice(0, 4).forEach((t, i) => addQualifier(t, 'league_rank', `${t.name} (Saudi Arabia)`, (i < 2 ? 1 : 2) as any));
    otherAfc.slice(0, 20).forEach((t, i) => addQualifier(t, 'continental_pool', `${t.name} (AFC)`, ((i % 4) + 1) as any));
  } else if (meta.federation === 'CONCACAF') {
    const getTeamsForCountry = (cc: string): EditorTeamData[] => {
      const list = allFedClubs.filter(
        (c) => (c.countryCode || '').toUpperCase() === cc.toUpperCase()
      );
      return sortTeamsByStrength(list);
    };

    const usaTeams = getTeamsForCountry('USA');
    const otherConcacaf = allFedClubs.filter((t) => !assignedTeamIds.has(t.id));
    usaTeams.slice(0, 6).forEach((t, i) => addQualifier(t, 'league_rank', `${t.name} (MLS)`, (i < 2 ? 1 : 2) as any));
    otherConcacaf.slice(0, 26).forEach((t, i) => addQualifier(t, 'continental_pool', `${t.name} (CONCACAF)`, ((i % 4) + 1) as any));
  }

  // 2. Ensure player club is included if explicitly flagged as qualified for this competition
  const pQualifiedCompId = (player as any)?.qualifiedContinentalCompId;
  const pQualifiedShort = (player as any)?.qualifiedContinental;
  const isTargetCompByShort =
    (pQualifiedShort === 'ucl' && competitionId === 'UEFA_CL') ||
    (pQualifiedShort === 'uel' && competitionId === 'UEFA_EL') ||
    (pQualifiedShort === 'uecl' && competitionId === 'UEFA_ECL') ||
    (pQualifiedShort === 'libertadores' && competitionId === 'CONMEBOL_LIB') ||
    (pQualifiedShort === 'sudamericana' && competitionId === 'CONMEBOL_SUD') ||
    (pQualifiedShort === 'afc_elite' && competitionId === 'AFC_CL') ||
    (pQualifiedShort === 'afc_two' && competitionId === 'AFC_CUP');

  const playerFederation = getClubFederation(player?.countryCode, player?.league, player?.clubCountry);
  const isValidFederationForComp = isCompetitionValidForFederation(competitionId, playerFederation);

  if (isValidFederationForComp && player?.clubId && (pQualifiedCompId === competitionId || isTargetCompByShort)) {
    const pClubId = player.clubId;
    const isAlreadyIn = qualified.some((q) => q.teamId === pClubId || q.teamName.toLowerCase() === (player.club || '').toLowerCase());
    if (!isAlreadyIn) {
      const pTeamData = leagueDb.teams[pClubId] || clubsById.get(pClubId);
      if (pTeamData) {
        // Replace lowest rated team in Pot 2 or Pot 3
        let replaceIdx = -1;
        for (let i = qualified.length - 1; i >= 0; i--) {
          if (qualified[i].seedingPot >= 2) {
            replaceIdx = i;
            break;
          }
        }
        const playerEntry: ContinentalQualificationEntry = {
          teamId: pTeamData.id,
          teamName: pTeamData.name,
          countryCode: (pTeamData.countryCode || player.countryCode || 'INT').toUpperCase(),
          countryName: pTeamData.countryName || player.country || 'Club Nation',
          sourceType: 'league_rank',
          sourceDescription: `${pTeamData.name} (Domestic Qualifier)`,
          competitionId,
          seedingPot: 2,
          teamOvr: pTeamData.overallRating || 76,
        };
        if (replaceIdx >= 0) {
          qualified[replaceIdx] = playerEntry;
        } else {
          qualified.push(playerEntry);
        }
      }
    }
  }

  // 3. Fill remaining spots with available pool clubs (up to minTeamsRequired, typically 36 or 32)
  const targetCount = meta.minTeamsRequired || (meta.format === '36_league_phase_knockout' ? 36 : 32);
  const remainingAvailable = allFedClubs.filter((c) => !assignedTeamIds.has(c.id));
  let fillerIdx = 0;

  while (qualified.length < targetCount && fillerIdx < remainingAvailable.length) {
    const t = remainingAvailable[fillerIdx++];
    addQualifier(t, 'continental_pool', `${t.name} (Pool Qualifier)`, ((qualified.length % 4) + 1) as any);
  }

  // 4. Final pot calibration
  const is36LeaguePhase = meta.format === '36_league_phase_knockout';
  const isEcl = competitionId === 'UEFA_ECL';

  if (isEcl) {
    // 6 pots of 6 teams
    const potBuckets: ContinentalQualificationEntry[][] = [[], [], [], [], [], []];
    qualified.forEach((q) => {
      const pIdx = Math.max(0, Math.min(5, (q.seedingPot || 1) - 1));
      potBuckets[pIdx].push(q);
    });

    const calibrated: ContinentalQualificationEntry[] = [];
    potBuckets.forEach((bucket, pIdx) => {
      bucket.forEach((item) => {
        item.seedingPot = (pIdx + 1) as 1 | 2 | 3 | 4 | 5 | 6;
        calibrated.push(item);
      });
    });

    if (calibrated.length === 36) {
      calibrated.forEach((entry, idx) => {
        entry.seedingPot = (Math.floor(idx / 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
      });
    }

    return calibrated;
  } else if (is36LeaguePhase) {
    // 4 pots of 9 teams
    const potBuckets: ContinentalQualificationEntry[][] = [[], [], [], []];
    qualified.forEach((q) => {
      const pIdx = Math.max(0, Math.min(3, (q.seedingPot || 1) - 1));
      potBuckets[pIdx].push(q);
    });

    const calibrated: ContinentalQualificationEntry[] = [];
    potBuckets.forEach((bucket, pIdx) => {
      bucket.forEach((item) => {
        item.seedingPot = (pIdx + 1) as 1 | 2 | 3 | 4;
        calibrated.push(item);
      });
    });

    if (calibrated.length === 36) {
      calibrated.forEach((entry, idx) => {
        entry.seedingPot = (Math.floor(idx / 9) + 1) as 1 | 2 | 3 | 4;
      });
    }

    return calibrated;
  }

  // Default 32-team 4 pots of 8 teams
  const champions = qualified.filter((q) => q.sourceType === 'domestic_champion');
  const nonChampions = qualified.filter((q) => q.sourceType !== 'domestic_champion').sort((a, b) => b.teamOvr - a.teamOvr);

  const calibrated: ContinentalQualificationEntry[] = [...champions];
  nonChampions.forEach((nc) => calibrated.push(nc));

  const potSize = Math.ceil(calibrated.length / 4);
  calibrated.forEach((entry, idx) => {
    const potNum = Math.min(4, Math.floor(idx / potSize) + 1) as 1 | 2 | 3 | 4;
    entry.seedingPot = potNum;
  });

  return calibrated;
}
