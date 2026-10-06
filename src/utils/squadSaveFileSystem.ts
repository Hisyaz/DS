import { EditorTeamData, TeamSquadSaveFile, SquadSlot, SquadGroupKey, TacticalStyle } from '../types/leagueEditor';
import { PlayerCardData } from '../types';
import { sanitizeAndRepairPlayerIdentity } from './playerIdentitySystem';
import { NATIONALITIES } from '../constants';
import { getTeamSimulationRatings } from './leagueThemeHelper';
import { generateEnglishPlayerNationalityAndName } from './englishNameGenerator';
import { generateFrenchPlayerNationalityAndName } from './frenchNameGenerator';
import { generateSpanishPlayerNationalityAndName } from './spanishNameGenerator';
import { generateArgentinePlayerNationalityAndName } from './argentinaNameGenerator';
import { generateBrazilianPlayerNationalityAndName, generateStateOnlyBrazilianPlayerNationalityAndName } from './brazilNameGenerator';
import { generateSaudiPlayerNationalityAndName } from './saudiNameGenerator';
import { generateItalianPlayerNationalityAndName } from './italianNameGenerator';
import { generateGermanPlayerNationalityAndName } from './germanNameGenerator';
import { generatePortuguesePlayerNationalityAndName } from './portugueseNameGenerator';
import { applyLeagueStrengthSystemToPlayer } from './playerOvrSystem';
import { enforceUniqueElitePlayersForTeam, applyGlobalOvrCap, isUniqueElitePlayer, getUniqueElitePlayerDef } from './uniquePlayerRegistry';
import { generatePlaystyleForRoleAndStyle, getClubTacticalProfile, createDefaultManager, adaptTacticsForStarPlayers } from './tacticalSystem';
import { getCalibratedClubStarterTarget, getClubYouthAndReserveOvrRanges, synchronizeTeamYouthAndReservesWithStarterOvr } from './leagueOvrCalibrationSystem';

export const SQUAD_GROUP_LIMITS: Record<SquadGroupKey, { min: number; max: number; startSlot: number; endSlot: number; label: string }> = {
  squad: { min: 19, max: 35, startSlot: 1, endSlot: 35, label: 'Main Squad' },
  reserves: { min: 19, max: 25, startSlot: 36, endSlot: 60, label: 'Reserves' },
  u20: { min: 19, max: 25, startSlot: 1, endSlot: 25, label: 'U20 Youth' },
  u17: { min: 19, max: 25, startSlot: 1, endSlot: 25, label: 'U17 Youth' },
};

export const DEFAULT_POSITIONS_SEQUENCE = [
  'GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'LW', 'RW', 'ST',
  'GK', 'CB', 'LB', 'RB', 'CM', 'CAM', 'ST', 'ST', 'CB', 'RW', 'CM', 'LW', 'ST'
];

/**
 * Gets team nationality object or fallback.
 */
export function getTeamNationality(countryCode: string) {
  const found = NATIONALITIES.find(
    (n) => n.code.toUpperCase() === countryCode.toUpperCase() || n.iso.toUpperCase() === countryCode.toUpperCase()
  );
  if (found) return found;
  return {
    code: countryCode,
    iso: countryCode,
    name: countryCode === 'ENG' ? 'England' : countryCode === 'FR' ? 'France' : countryCode === 'ESP' ? 'Spain' : countryCode === 'ARG' ? 'Argentina' : countryCode === 'BRA' ? 'Brazil' : countryCode,
  };
}

/**
 * Generates a default player record for a specific slot in a group.
 */
export function createDefaultPlayerForSlot(
  team: EditorTeamData,
  groupKey: SquadGroupKey,
  slotNumber: number,
  customPosition?: string
): PlayerCardData {
  const clubStarterTarget = getCalibratedClubStarterTarget(team);
  const ranges = getClubYouthAndReserveOvrRanges(clubStarterTarget);

  let targetOvr = clubStarterTarget;
  if (groupKey === 'squad') {
    if (slotNumber >= 12 && slotNumber <= 18) {
      // Subs: 2-4 points below Starter OVR
      const span = Math.max(1, ranges.subs.max - ranges.subs.min + 1);
      targetOvr = ranges.subs.min + (slotNumber % span);
    } else if (slotNumber >= 19) {
      // Reserves in squad: 3-5 points below Starter OVR
      const span = Math.max(1, ranges.reserves.max - ranges.reserves.min + 1);
      targetOvr = ranges.reserves.min + (slotNumber % span);
    } else {
      // Starting XI (slots 1-11)
      if (slotNumber <= 3) {
        targetOvr = clubStarterTarget + 1 + (slotNumber % 2); // Standouts +1 to +2
      } else if (slotNumber <= 8) {
        targetOvr = clubStarterTarget;
      } else {
        targetOvr = Math.max(40, clubStarterTarget - 1);
      }
    }
  } else if (groupKey === 'reserves') {
    // Reserves: 3-5 OVR points below THAT club's Starter OVR
    const span = Math.max(1, ranges.reserves.max - ranges.reserves.min + 1);
    targetOvr = ranges.reserves.min + (slotNumber % span);
  } else if (groupKey === 'u20') {
    // U20: 6-9 OVR points below THAT club's Starter OVR
    const span = Math.max(1, ranges.u20.max - ranges.u20.min + 1);
    targetOvr = ranges.u20.min + (slotNumber % span);
  } else if (groupKey === 'u17') {
    // U17: 10-15 OVR points below THAT club's Starter OVR
    const span = Math.max(1, ranges.u17.max - ranges.u17.min + 1);
    targetOvr = ranges.u17.min + (slotNumber % span);
  }

  const subPos = customPosition || DEFAULT_POSITIONS_SEQUENCE[(slotNumber - 1) % DEFAULT_POSITIONS_SEQUENCE.length] || 'ST';
  const isGk = subPos === 'GK';

  const isSouthAmerican =
    team.countryCode === 'BRA' ||
    team.countryCode === 'ARG' ||
    team.leagueId?.includes('brazil') ||
    team.leagueId?.includes('argentina') ||
    team.leagueId?.includes('paulista') ||
    team.leagueId?.includes('carioca');

  const maxCap = isSouthAmerican ? 84 : 90;
  const playerOvr = Math.min(maxCap, Math.max(40, targetOvr));

  let age = 24;
  if (groupKey === 'squad') age = 20 + ((slotNumber * 3) % 12);
  else if (groupKey === 'reserves') age = 18 + ((slotNumber * 2) % 8);
  else if (groupKey === 'u20') age = 17 + ((slotNumber) % 4);
  else if (groupKey === 'u17') age = 15 + ((slotNumber) % 3);

  // Determine available shirt number for this pool (1 to 999)
  let groupsForPool: SquadGroupKey[] = [groupKey];
  if (groupKey === 'squad' || groupKey === 'reserves') {
    groupsForPool = ['squad', 'reserves'];
  }
  const takenNumbers = new Set<number>();
  if (team.squadSaveFile) {
    groupsForPool.forEach((gk) => {
      const slots = team.squadSaveFile?.[gk] || [];
      slots.forEach((s) => {
        if (s.player) {
          const num = s.player.number ?? s.player.shirtNumber;
          if (num) takenNumbers.add(num);
        }
      });
    });
  }

  let assignedShirtNum = slotNumber;
  if (takenNumbers.has(assignedShirtNum)) {
    for (let candidate = 1; candidate <= 999; candidate++) {
      if (!takenNumbers.has(candidate)) {
        assignedShirtNum = candidate;
        break;
      }
    }
  }

  const teamNation = getTeamNationality(team.countryCode);
  let playerName = `${team.shortName || team.name.slice(0, 3)} Player #${assignedShirtNum}`;
  let playerNationality = teamNation;

  const isStateOnly = team.leagueId === 'brazil_state_only' || (team as any).isStateChampionshipsOnly || (team as any).isCupOnly;

  if (isStateOnly) {
    const stateOnlyIdentity = generateStateOnlyBrazilianPlayerNationalityAndName();
    playerName = stateOnlyIdentity.name;
    playerNationality = stateOnlyIdentity.nationality;
  } else if (team.countryCode === 'POR' || team.leagueId?.includes('portugal')) {
    const porIdentity = generatePortuguesePlayerNationalityAndName();
    playerName = porIdentity.name;
    playerNationality = porIdentity.nationality;
  } else if (team.countryCode === 'ENG' || team.leagueId?.includes('england') || team.leagueId?.includes('london')) {
    const engIdentity = generateEnglishPlayerNationalityAndName();
    playerName = engIdentity.name;
    playerNationality = engIdentity.nationality;
  } else if (team.countryCode === 'FR' || team.countryCode === 'FRA' || team.leagueId?.includes('france') || team.leagueId?.includes('paris')) {
    const frIdentity = generateFrenchPlayerNationalityAndName();
    playerName = frIdentity.name;
    playerNationality = frIdentity.nationality;
  } else if (team.countryCode === 'ESP' || team.leagueId?.includes('spain') || team.leagueId?.includes('madrid')) {
    const espIdentity = generateSpanishPlayerNationalityAndName();
    playerName = espIdentity.name;
    playerNationality = espIdentity.nationality;
  } else if (team.countryCode === 'ARG' || team.leagueId?.includes('argentina') || team.leagueId?.includes('buenosaires')) {
    const argIdentity = generateArgentinePlayerNationalityAndName();
    playerName = argIdentity.name;
    playerNationality = argIdentity.nationality;
  } else if (team.countryCode === 'BRA' || team.leagueId?.includes('brazil') || team.leagueId?.includes('rio') || team.leagueId?.includes('saopaulo') || team.leagueId?.includes('paulista') || team.leagueId?.includes('carioca')) {
    const braIdentity = generateBrazilianPlayerNationalityAndName();
    playerName = braIdentity.name;
    playerNationality = braIdentity.nationality;
  } else if (team.countryCode === 'KSA' || team.countryCode === 'SAU' || team.leagueId?.includes('saudi') || team.leagueId?.includes('riyadh')) {
    const sauIdentity = generateSaudiPlayerNationalityAndName();
    playerName = sauIdentity.name;
    playerNationality = sauIdentity.nationality;
  } else if (team.countryCode === 'ITA' || team.leagueId?.includes('italy') || team.leagueId?.includes('rome') || team.leagueId?.includes('milan')) {
    const itaIdentity = generateItalianPlayerNationalityAndName();
    playerName = itaIdentity.name;
    playerNationality = itaIdentity.nationality;
  } else if (team.countryCode === 'GER' || team.countryCode === 'DEU' || team.leagueId?.includes('germany') || team.leagueId?.includes('bundesliga')) {
    const gerIdentity = generateGermanPlayerNationalityAndName();
    playerName = gerIdentity.name;
    playerNationality = gerIdentity.nationality;
  }

  const teamTacticalStyle: TacticalStyle =
    team.manager?.primaryTactic?.style ||
    getClubTacticalProfile(team.id, team.name, team.countryCode).primaryStyle;

  const generatedPlaystyle = generatePlaystyleForRoleAndStyle(
    subPos,
    teamTacticalStyle,
    slotNumber + (team.id ? team.id.length * 17 : 0),
    playerOvr
  );

  const unformattedPlayer: Partial<PlayerCardData> = {
    id: `player_${team.id}_${groupKey}_slot${slotNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: playerName,
    number: assignedShirtNum,
    shirtNumber: assignedShirtNum,
    ovr: playerOvr,
    potentialOvr: Math.min(99, playerOvr + 6),
    age,
    club: team.name,
    clubCountry: team.countryCode,
    nationality: playerNationality,
    position: isGk ? 'GK' : ['ST', 'LW', 'RW'].includes(subPos) ? 'ATT' : ['CAM', 'CM', 'CDM'].includes(subPos) ? 'MID' : 'DEF',
    subPosition: subPos,
    playStyle: generatedPlaystyle,
    preferredFoot: slotNumber % 3 === 0 ? 'Left' : 'Right',
    weakFootStars: 3,
    heightCm: isGk ? 188 : 180,
    weightKg: isGk ? 82 : 75,
    stats: {
      pro: playerOvr,
      def: isGk ? playerOvr : Math.max(40, playerOvr - 10),
      cre: Math.max(40, playerOvr - 5),
      men: playerOvr,
      goa: isGk ? playerOvr : 20,
      phy: playerOvr,
    },
    biometrics: {
      strength: 70,
      skinColor: '#d2b48c',
      hairStyle: 'straight',
      hairLength: 'short',
      hairRoot: '#1c1917',
      hairDye: '#1c1917',
    },
    accessories: {
      accessory: 'none',
      headbandColor: '#000000',
    },
    kit: team.kit,
    emblem: team.emblem,
  };

  const cleanPlayer = sanitizeAndRepairPlayerIdentity(unformattedPlayer) as PlayerCardData;
  return applyLeagueStrengthSystemToPlayer(cleanPlayer, team, groupKey, slotNumber);
}

/**
 * Normalizes a squad group slot array, guaranteeing exact slot count and slot numbering.
 */
export function normalizeGroupSlots(
  existingSlots: SquadSlot[] | undefined,
  startSlot: number,
  endSlot: number,
  minActive: number,
  groupKey: SquadGroupKey,
  team: EditorTeamData
): SquadSlot[] {
  const isStateOnly = team.leagueId === 'brazil_state_only' || (team as any).isStateChampionshipsOnly || (team as any).isCupOnly;
  const isEnglish = team.countryCode === 'ENG' || team.leagueId?.includes('england') || team.leagueId?.includes('london');
  const isFrench = team.countryCode === 'FR' || team.countryCode === 'FRA' || team.leagueId?.includes('france') || team.leagueId?.includes('paris');
  const isSpanish = team.countryCode === 'ESP' || team.leagueId?.includes('spain') || team.leagueId?.includes('madrid');
  const isArgentine = team.countryCode === 'ARG' || team.leagueId?.includes('argentina') || team.leagueId?.includes('buenosaires');
  const isBrazilian = team.countryCode === 'BRA' || team.leagueId?.includes('brazil') || team.leagueId?.includes('rio') || team.leagueId?.includes('saopaulo') || team.leagueId?.includes('paulista') || team.leagueId?.includes('carioca');
  const isPortuguese = team.countryCode === 'POR' || team.leagueId?.includes('portugal');
  
  const teamTacticalStyle: TacticalStyle =
    team.manager?.primaryTactic?.style ||
    getClubTacticalProfile(team.id, team.name, team.countryCode).primaryStyle;

  const slotsMap = new Map<number, SquadSlot>();
  if (Array.isArray(existingSlots)) {
    existingSlots.forEach((slot) => {
      if (slot && typeof slot.slotNumber === 'number') {
        let playerObj = slot.player ? (sanitizeAndRepairPlayerIdentity(slot.player) as PlayerCardData) : null;
        if (playerObj && (playerObj.name.includes('Player #') || playerObj.name.includes('Player#'))) {
          if (isStateOnly) {
            const stateOnlyIdentity = generateStateOnlyBrazilianPlayerNationalityAndName();
            playerObj = { ...playerObj, name: stateOnlyIdentity.name, nationality: stateOnlyIdentity.nationality };
          } else if (isPortuguese) {
            const porIdentity = generatePortuguesePlayerNationalityAndName();
            playerObj = { ...playerObj, name: porIdentity.name, nationality: porIdentity.nationality };
          } else if (isEnglish) {
            const engIdentity = generateEnglishPlayerNationalityAndName();
            playerObj = { ...playerObj, name: engIdentity.name, nationality: engIdentity.nationality };
          } else if (isFrench) {
            const frIdentity = generateFrenchPlayerNationalityAndName();
            playerObj = { ...playerObj, name: frIdentity.name, nationality: frIdentity.nationality };
          } else if (isSpanish) {
            const espIdentity = generateSpanishPlayerNationalityAndName();
            playerObj = { ...playerObj, name: espIdentity.name, nationality: espIdentity.nationality };
          } else if (isArgentine) {
            const argIdentity = generateArgentinePlayerNationalityAndName();
            playerObj = { ...playerObj, name: argIdentity.name, nationality: argIdentity.nationality };
          } else if (isBrazilian) {
            const braIdentity = generateBrazilianPlayerNationalityAndName();
            playerObj = { ...playerObj, name: braIdentity.name, nationality: braIdentity.nationality };
          }
        }

        // Check if player has a stale/unvaried default playstyle that needs tactical alignment
        if (playerObj && !isUniqueElitePlayer(playerObj)) {
          const sub = (playerObj.subPosition || 'ST').toUpperCase();
          const pStyle = playerObj.playStyle || '';
          // If unassigned or generic 'Balanced' on a non-fullback or legacy default
          const isGeneric =
            !pStyle ||
            pStyle === 'UNSELECTED' ||
            pStyle === 'UNASSIGNED' ||
            (pStyle === 'Balanced' && !['LB', 'RB', 'LWB', 'RWB', 'GK'].includes(sub)) ||
            (teamTacticalStyle === 'gegenpressing' && sub === 'ST' && pStyle === 'Poacher' && slot.slotNumber % 2 === 0);

          if (isGeneric) {
            playerObj = {
              ...playerObj,
              playStyle: generatePlaystyleForRoleAndStyle(
                sub,
                teamTacticalStyle,
                slot.slotNumber + (team.id ? team.id.length * 13 : 0),
                playerObj.ovr || 75
              ),
            };
          }
        }

        if (playerObj) {
          playerObj = applyLeagueStrengthSystemToPlayer(playerObj, team, groupKey, slot.slotNumber);
        }

        slotsMap.set(slot.slotNumber, {
          slotNumber: slot.slotNumber,
          player: playerObj,
        });
      }
    });
  }

  const resultSlots: SquadSlot[] = [];
  let currentActiveCount = 0;

  for (let slotNum = startSlot; slotNum <= endSlot; slotNum++) {
    const existing = slotsMap.get(slotNum);
    if (existing && existing.player) {
      resultSlots.push(existing);
      currentActiveCount++;
    } else {
      resultSlots.push({ slotNumber: slotNum, player: null });
    }
  }

  // If active count is below required minimum (19), populate initial players up to minActive (e.g., 20 or 22)
  if (currentActiveCount < minActive) {
    const targetActiveCount = groupKey === 'squad' ? 22 : 20;
    let added = 0;
    for (let i = 0; i < resultSlots.length; i++) {
      if (!resultSlots[i].player) {
        resultSlots[i].player = createDefaultPlayerForSlot(team, groupKey, resultSlots[i].slotNumber);
        currentActiveCount++;
        added++;
        if (currentActiveCount >= targetActiveCount) break;
      }
    }
  }

  return resultSlots;
}

/**
 * Ensures team has a valid Squad Save File with all 4 persistent groups.
 */
export function ensureTeamSquadSaveFile(team: EditorTeamData): EditorTeamData {
  if (!team) return team;

  // Fast-path: If team already has a fully normalized squad save file and manager, return immediately
  if (
    team.squadSaveFile &&
    Array.isArray(team.squadSaveFile.squad) &&
    team.squadSaveFile.squad.length === 35 &&
    Array.isArray(team.squadSaveFile.reserves) &&
    team.squadSaveFile.reserves.length === 25 &&
    Array.isArray(team.squadSaveFile.u20) &&
    team.squadSaveFile.u20.length === 25 &&
    Array.isArray(team.squadSaveFile.u17) &&
    team.squadSaveFile.u17.length === 25 &&
    team.manager
  ) {
    return team;
  }

  const rawSaveFile = team.squadSaveFile || (team as any).squadFile;
  const saveFile: TeamSquadSaveFile = {
    squad: normalizeGroupSlots(rawSaveFile?.squad, 1, 35, 19, 'squad', team),
    reserves: normalizeGroupSlots(rawSaveFile?.reserves, 36, 60, 19, 'reserves', team),
    u20: normalizeGroupSlots(rawSaveFile?.u20, 1, 25, 19, 'u20', team),
    u17: normalizeGroupSlots(rawSaveFile?.u17, 1, 25, 19, 'u17', team),
  };

  // Ensure manager exists and adapts tactics to star players
  let manager = team.manager;
  if (!manager) {
    manager = createDefaultManager(team.name, team.countryCode, team.id, saveFile.squad.map((s) => s.player));
  } else {
    // Adapt existing manager's primary & secondary tactic position setups for star players (OVR >= 88 or unique elite players)
    const squadPlayers = saveFile.squad.map((s) => s.player);
    manager = {
      ...manager,
      primaryTactic: {
        ...manager.primaryTactic,
        positions: adaptTacticsForStarPlayers(manager.primaryTactic.positions, squadPlayers, team.id),
      },
      secondaryTactic: manager.secondaryTactic
        ? {
            ...manager.secondaryTactic,
            positions: adaptTacticsForStarPlayers(manager.secondaryTactic.positions, squadPlayers, team.id),
          }
        : undefined,
    };
  }

  const teamWithSaveFile: EditorTeamData = {
    ...team,
    manager,
    squadSaveFile: saveFile,
  };

  const withElites = enforceUniqueElitePlayersForTeam(teamWithSaveFile);
  return synchronizeTeamYouthAndReservesWithStarterOvr(withElites);
}

/**
 * Calculates active player count for a specific group.
 */
export function getActivePlayerCount(team: EditorTeamData, groupKey: SquadGroupKey): number {
  const normTeam = ensureTeamSquadSaveFile(team);
  const slots = normTeam.squadSaveFile?.[groupKey] || [];
  return slots.filter((s) => s.player !== null && s.player !== undefined).length;
}

/**
 * Adds a player to a squad group following all slot and limit rules.
 */
export function addPlayerToSquadGroup(
  team: EditorTeamData,
  groupKey: SquadGroupKey,
  customPlayerData?: Partial<PlayerCardData>
): { updatedTeam: EditorTeamData; error?: string; filledSlotNumber?: number } {
  const normTeam = ensureTeamSquadSaveFile(team);
  const limits = SQUAD_GROUP_LIMITS[groupKey];
  const activeCount = getActivePlayerCount(normTeam, groupKey);

  if (activeCount >= limits.max) {
    return {
      updatedTeam: normTeam,
      error: 'This squad group is full.',
    };
  }

  const groupSlots = [...(normTeam.squadSaveFile?.[groupKey] || [])];
  
  // Prefer filling an existing empty slot first
  let targetIndex = groupSlots.findIndex((s) => s.player === null || s.player === undefined);

  if (targetIndex === -1) {
    // If all existing slot objects are occupied but group length < max slots
    if (groupSlots.length >= (limits.endSlot - limits.startSlot + 1)) {
      return {
        updatedTeam: normTeam,
        error: 'This squad group is full.',
      };
    }
    const nextSlotNum = limits.startSlot + groupSlots.length;
    groupSlots.push({ slotNumber: nextSlotNum, player: null });
    targetIndex = groupSlots.length - 1;
  }

  const slotNum = groupSlots[targetIndex].slotNumber;
  const newPlayer = customPlayerData
    ? (sanitizeAndRepairPlayerIdentity({
        ...createDefaultPlayerForSlot(normTeam, groupKey, slotNum),
        ...customPlayerData,
      }) as PlayerCardData)
    : createDefaultPlayerForSlot(normTeam, groupKey, slotNum);

  groupSlots[targetIndex] = {
    slotNumber: slotNum,
    player: newPlayer,
  };

  const updatedTeam: EditorTeamData = {
    ...normTeam,
    squadSaveFile: {
      ...normTeam.squadSaveFile!,
      [groupKey]: groupSlots,
    },
  };

  return {
    updatedTeam,
    filledSlotNumber: slotNum,
  };
}

/**
 * Deletes a player from a squad group, converting slot to Empty Spot while preserving slot number.
 */
export function deletePlayerFromSquadGroup(
  team: EditorTeamData,
  groupKey: SquadGroupKey,
  slotNumber: number
): { updatedTeam: EditorTeamData; error?: string } {
  const normTeam = ensureTeamSquadSaveFile(team);
  const limits = SQUAD_GROUP_LIMITS[groupKey];
  const activeCount = getActivePlayerCount(normTeam, groupKey);

  // Minimum player protection check
  if (activeCount <= limits.min) {
    return {
      updatedTeam: normTeam,
      error: 'Minimum squad size reached. Add another player before removing this player.',
    };
  }

  const groupSlots = [...(normTeam.squadSaveFile?.[groupKey] || [])];
  const targetIndex = groupSlots.findIndex((s) => s.slotNumber === slotNumber);

  if (targetIndex === -1 || !groupSlots[targetIndex].player) {
    return {
      updatedTeam: normTeam,
      error: 'Player slot not found or already empty.',
    };
  }

  // Convert slot to Empty Spot (preserve slotNumber!)
  groupSlots[targetIndex] = {
    slotNumber,
    player: null,
  };

  const updatedTeam: EditorTeamData = {
    ...normTeam,
    squadSaveFile: {
      ...normTeam.squadSaveFile!,
      [groupKey]: groupSlots,
    },
  };

  return { updatedTeam };
}

/**
 * Transfers a player from source team group to destination team group.
 */
export function transferPlayerBetweenTeams(
  sourceTeam: EditorTeamData,
  destTeam: EditorTeamData,
  sourceGroupKey: SquadGroupKey,
  destGroupKey: SquadGroupKey,
  sourceSlotNumber: number
): { updatedSourceTeam: EditorTeamData; updatedDestTeam: EditorTeamData; error?: string } {
  const normSource = ensureTeamSquadSaveFile(sourceTeam);
  const normDest = ensureTeamSquadSaveFile(destTeam);

  const sourceLimits = SQUAD_GROUP_LIMITS[sourceGroupKey];
  const sourceActiveCount = getActivePlayerCount(normSource, sourceGroupKey);

  if (sourceActiveCount <= sourceLimits.min) {
    return {
      updatedSourceTeam: normSource,
      updatedDestTeam: normDest,
      error: 'Minimum squad size reached. Add another player before removing this player.',
    };
  }

  const destLimits = SQUAD_GROUP_LIMITS[destGroupKey];
  const destActiveCount = getActivePlayerCount(normDest, destGroupKey);

  if (destActiveCount >= destLimits.max) {
    return {
      updatedSourceTeam: normSource,
      updatedDestTeam: normDest,
      error: 'This squad group is full.',
    };
  }

  const sourceSlots = normSource.squadSaveFile?.[sourceGroupKey] || [];
  const sourceSlot = sourceSlots.find((s) => s.slotNumber === sourceSlotNumber);

  if (!sourceSlot || !sourceSlot.player) {
    return {
      updatedSourceTeam: normSource,
      updatedDestTeam: normDest,
      error: 'Source player record not found.',
    };
  }

  const playerToTransfer = {
    ...sourceSlot.player,
    club: normDest.name,
    clubCountry: normDest.countryCode,
    kit: normDest.kit,
    emblem: normDest.emblem,
  };

  // 1. Remove player from source team slot -> convert to Empty Spot
  const sourceDeleteResult = deletePlayerFromSquadGroup(normSource, sourceGroupKey, sourceSlotNumber);
  if (sourceDeleteResult.error) {
    return {
      updatedSourceTeam: normSource,
      updatedDestTeam: normDest,
      error: sourceDeleteResult.error,
    };
  }

  // 2. Add player to destination team group (preferring empty spot first)
  const destAddResult = addPlayerToSquadGroup(normDest, destGroupKey, playerToTransfer);
  if (destAddResult.error) {
    return {
      updatedSourceTeam: normSource,
      updatedDestTeam: normDest,
      error: destAddResult.error,
    };
  }

  return {
    updatedSourceTeam: sourceDeleteResult.updatedTeam,
    updatedDestTeam: destAddResult.updatedTeam,
  };
}

/**
 * Gets map of occupied shirt numbers (1 to 999) for a group pool in a team.
 * Main Squad and Reserves share a pool.
 * U20 and U17 each have unique standalone pools.
 */
export function getOccupiedNumbersForTeamGroup(
  team: EditorTeamData,
  groupKey: SquadGroupKey,
  excludePlayerId?: string
): Map<number, string> {
  const occupiedMap = new Map<number, string>();
  if (!team || !team.squadSaveFile) return occupiedMap;

  let groupsToCheck: SquadGroupKey[] = [];
  if (groupKey === 'squad' || groupKey === 'reserves') {
    groupsToCheck = ['squad', 'reserves'];
  } else {
    groupsToCheck = [groupKey];
  }

  groupsToCheck.forEach((gk) => {
    const slots = team.squadSaveFile?.[gk] || [];
    slots.forEach((s) => {
      if (s.player && s.player.id !== excludePlayerId) {
        const num = s.player.number ?? s.player.shirtNumber ?? s.slotNumber;
        if (num && num >= 1 && num <= 999) {
          const groupLabel = gk === 'squad' ? 'Main Squad' : gk === 'reserves' ? 'Reserves' : gk.toUpperCase();
          occupiedMap.set(num, `${s.player.name} (${groupLabel})`);
        }
      }
    });
  });

  return occupiedMap;
}

/**
 * Updates a player record in a squad slot.
 */
export function updatePlayerInSquadGroup(
  team: EditorTeamData,
  groupKey: SquadGroupKey,
  slotNumber: number,
  updatedPlayer: PlayerCardData
): EditorTeamData {
  const normTeam = ensureTeamSquadSaveFile(team);
  const groupSlots = [...(normTeam.squadSaveFile?.[groupKey] || [])];
  const idx = groupSlots.findIndex((s) => s.slotNumber === slotNumber);

  if (idx !== -1) {
    groupSlots[idx] = {
      slotNumber,
      player: sanitizeAndRepairPlayerIdentity(updatedPlayer) as PlayerCardData,
    };
  }

  return {
    ...normTeam,
    squadSaveFile: {
      ...normTeam.squadSaveFile!,
      [groupKey]: groupSlots,
    },
  };
}
