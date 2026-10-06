import { EditorTeamData } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import {
  ContinentalCompetitionId,
  ContinentalClubRegistration,
} from '../types/continentalCompetitions';
import { safeGetItem, safeSetItem } from './storageCleaner';

const REGISTRATION_STORAGE_KEY_PREFIX = 'FOOTBALL_CONTINENTAL_REGISTRATION_';

/**
 * Builds or retrieves the official 25-player continental squad registration for a club.
 */
export function getOrCreateContinentalSquadRegistration(
  team: EditorTeamData,
  competitionId: ContinentalCompetitionId,
  seasonYear: number,
  userPlayer?: PlayerCardData
): ContinentalClubRegistration {
  const storageKey = `${REGISTRATION_STORAGE_KEY_PREFIX}${team.id}_${competitionId}_${seasonYear}`;
  try {
    const raw = safeGetItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as ContinentalClubRegistration;
      if (parsed && Array.isArray(parsed.registeredPlayers) && parsed.registeredPlayers.length === 25) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse continental squad registration:', e);
  }

  // Generate standard 25-man squad
  const registeredPlayers: ContinentalClubRegistration['registeredPlayers'] = [];
  const registeredPlayerIds: string[] = [];

  const rawSquadSlots = team.squadSaveFile?.squad || [];
  const activePlayers = rawSquadSlots
    .filter((s) => s && s.player)
    .map((s) => s.player!);

  // If user is on this team, ensure user is registered
  const isUserOnThisTeam = userPlayer && (userPlayer.clubId === team.id || userPlayer.club?.toLowerCase() === team.name.toLowerCase());
  if (isUserOnThisTeam && userPlayer) {
    const userPos = userPlayer.position || 'ATT';
    registeredPlayers.push({
      id: userPlayer.id || 'user_player',
      name: userPlayer.name,
      position: userPos,
      ovr: userPlayer.ovr || 75,
      isUserPlayer: true,
    });
    registeredPlayerIds.push(userPlayer.id || 'user_player');
  }

  // Fill remainder from team roster sorted by OVR
  const sortedRoster = [...activePlayers].sort((a, b) => (b.ovr || 70) - (a.ovr || 70));
  for (const p of sortedRoster) {
    if (registeredPlayers.length >= 25) break;
    const pId = p.id || `p_${team.id}_${registeredPlayers.length}`;
    if (!registeredPlayerIds.includes(pId)) {
      registeredPlayers.push({
        id: pId,
        name: p.name,
        position: p.position || 'CM',
        ovr: p.ovr || 72,
        isUserPlayer: false,
      });
      registeredPlayerIds.push(pId);
    }
  }

  // If roster had fewer than 25 players, generate filler registered players
  while (registeredPlayers.length < 25) {
    const idx = registeredPlayers.length + 1;
    const pos = idx <= 3 ? 'GK' : idx <= 10 ? 'DEF' : idx <= 18 ? 'MID' : 'ATT';
    const fillerId = `reg_filler_${team.id}_${idx}`;
    registeredPlayers.push({
      id: fillerId,
      name: `Squad Member ${idx}`,
      position: pos,
      ovr: Math.max(68, (team.overallRating || 75) - 6),
      isUserPlayer: false,
    });
    registeredPlayerIds.push(fillerId);
  }

  const registration: ContinentalClubRegistration = {
    teamId: team.id,
    teamName: team.name,
    competitionId,
    season: seasonYear,
    registeredPlayerIds,
    registeredPlayers,
    midSeasonChangesUsed: 0,
    isComplete: true,
  };

  saveContinentalSquadRegistration(registration);
  return registration;
}

/**
 * Saves a 25-man squad registration to persistent storage.
 */
export function saveContinentalSquadRegistration(registration: ContinentalClubRegistration): void {
  const storageKey = `${REGISTRATION_STORAGE_KEY_PREFIX}${registration.teamId}_${registration.competitionId}_${registration.season}`;
  try {
    safeSetItem(storageKey, JSON.stringify(registration));
  } catch (err) {
    console.warn('Failed to save continental squad registration:', err);
  }
}

/**
 * Replaces a player in the 25-man registration (up to 3 mid-season changes).
 */
export function applyMidSeasonContinentalSquadChange(
  registration: ContinentalClubRegistration,
  playerToRemoveId: string,
  newPlayer: { id: string; name: string; position: string; ovr: number; isUserPlayer?: boolean }
): { success: boolean; message: string; updatedRegistration: ContinentalClubRegistration } {
  if (registration.midSeasonChangesUsed >= 3) {
    return {
      success: false,
      message: 'Maximum mid-season squad changes (3/3) already utilized.',
      updatedRegistration: registration,
    };
  }

  const removeIdx = registration.registeredPlayers.findIndex((p) => p.id === playerToRemoveId);
  if (removeIdx === -1) {
    return {
      success: false,
      message: 'Player to remove not found in registered 25-man squad.',
      updatedRegistration: registration,
    };
  }

  const updatedPlayers = [...registration.registeredPlayers];
  updatedPlayers[removeIdx] = newPlayer;

  const updatedIds = [...registration.registeredPlayerIds];
  updatedIds[removeIdx] = newPlayer.id;

  const updatedRegistration: ContinentalClubRegistration = {
    ...registration,
    registeredPlayers: updatedPlayers,
    registeredPlayerIds: updatedIds,
    midSeasonChangesUsed: registration.midSeasonChangesUsed + 1,
  };

  saveContinentalSquadRegistration(updatedRegistration);

  return {
    success: true,
    message: `Squad updated! (${updatedRegistration.midSeasonChangesUsed}/3 mid-season changes used).`,
    updatedRegistration,
  };
}

/**
 * Verifies whether the player is currently registered for continental competitions.
 */
export function isPlayerRegisteredForContinental(
  userPlayer: PlayerCardData,
  teamId: string,
  competitionId: ContinentalCompetitionId,
  seasonYear: number
): boolean {
  const storageKey = `${REGISTRATION_STORAGE_KEY_PREFIX}${teamId}_${competitionId}_${seasonYear}`;
  try {
    const raw = safeGetItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as ContinentalClubRegistration;
      if (parsed && Array.isArray(parsed.registeredPlayers)) {
        return parsed.registeredPlayers.some(
          (p) => p.isUserPlayer || p.id === userPlayer.id || p.name === userPlayer.name
        );
      }
    }
  } catch (e) {
    // fallback
  }
  return true;
}
