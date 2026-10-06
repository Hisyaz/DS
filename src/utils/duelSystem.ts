import { PlayerCardData } from '../types';
import { getOrCreateOutfieldDetailed, getOrCreateGkDetailed, getStatBreakBonus } from './statCalculations';
import { EditorTeamData, SquadGroupKey } from '../types/leagueEditor';
import { getLeagueDatabase } from './leagueDatabaseSystem';
import { isGoalkeeperPosition, isDefenderPosition, isCreatorPosition, isGoalscorerPosition } from './stadiumAndKeyRoleSystem';
import { getSkillPerkSimulationMultiplier } from './perksSystem';

export type DuelCategory = 'DEFENDING' | 'CREATION' | 'GOALSCORING';

export type DuelStatName =
  | 'pace'
  | 'strength'
  | 'ballControl'
  | 'retention'
  | 'dribbling'
  | 'shortPass'
  | 'longPass'
  | 'crossing'
  | 'shooting'
  | 'heading'
  | 'longShots'
  | 'tackling'
  | 'marking'
  | 'interceptions'
  | 'positioning'
  | 'composure'
  | 'reactions'
  | 'goalkeeper';

export interface DuelTypeDefinition {
  id: string;
  category: DuelCategory;
  name: string;
  userStat: DuelStatName;
  userStatLabel: string;
  oppStat: DuelStatName;
  oppStatLabel: string;
  description: string;
  userActionText: string;
  oppActionText: string;
  keyOpponentRole: 'defender' | 'creator' | 'goalscorer' | 'goalkeeper' | 'squad';
  isTwoStageScoring?: boolean;
  stageTwoDuelId?: string;
}

export const DUEL_DEFINITIONS: Record<string, DuelTypeDefinition> = {
  // ================= 1. DEFENDING DUELS =================
  'DEF_POSITION_VS_PACE': {
    id: 'DEF_POSITION_VS_PACE',
    category: 'DEFENDING',
    name: 'Covering Run (Position ↔️ Pace)',
    userStat: 'pace',
    userStatLabel: 'Pace',
    oppStat: 'positioning',
    oppStatLabel: 'Positioning',
    description: 'Opponent makes a darting run into space. Use your recovery pace to track and stop the run.',
    userActionText: 'Sprint & Recover',
    oppActionText: 'Attacking Run',
    keyOpponentRole: 'goalscorer',
  },
  'DEF_BALLCONTROL_VS_REACTION': {
    id: 'DEF_BALLCONTROL_VS_REACTION',
    category: 'DEFENDING',
    name: 'First Touch Press (Ball Control ↔️ Reaction)',
    userStat: 'reactions',
    userStatLabel: 'Reaction',
    oppStat: 'ballControl',
    oppStatLabel: 'Ball Control',
    description: 'Opponent receives a pass. Pounce on their first touch before they can stabilize control.',
    userActionText: 'Fast Reaction Close-down',
    oppActionText: 'Ball Control Under Pressure',
    keyOpponentRole: 'creator',
  },
  'DEF_DRIBBLING_VS_TACKLING': {
    id: 'DEF_DRIBBLING_VS_TACKLING',
    category: 'DEFENDING',
    name: '1v1 Stand Tackle (Dribbling ↔️ Tackling)',
    userStat: 'tackling',
    userStatLabel: 'Tackling',
    oppStat: 'dribbling',
    oppStatLabel: 'Dribbling',
    description: 'Opponent attempts to dribble past you. Stand your ground and execute a clean tackle.',
    userActionText: 'Execute Tackle',
    oppActionText: 'Take-on Dribble',
    keyOpponentRole: 'goalscorer',
  },
  'DEF_SHORTPASS_VS_INTERCEPTIONS': {
    id: 'DEF_SHORTPASS_VS_INTERCEPTIONS',
    category: 'DEFENDING',
    name: 'Cut Passing Lane (Short Pass ↔️ Interceptions)',
    userStat: 'interceptions',
    userStatLabel: 'Interceptions',
    oppStat: 'shortPass',
    oppStatLabel: 'Short Pass',
    description: 'Opponent playmaker attempts a short through-ball. Read the passing lane and intercept.',
    userActionText: 'Cut Passing Lane',
    oppActionText: 'Short Pass Delivery',
    keyOpponentRole: 'creator',
  },
  'DEF_LONGPASS_VS_MARKING': {
    id: 'DEF_LONGPASS_VS_MARKING',
    category: 'DEFENDING',
    name: 'Mark Long Delivery (Long Pass ↔️ Marking)',
    userStat: 'marking',
    userStatLabel: 'Marking',
    oppStat: 'longPass',
    oppStatLabel: 'Long Pass',
    description: 'Opponent launches a long delivery over the top. Mark your runner tightly to neutralize the threat.',
    userActionText: 'Tight Marking',
    oppActionText: 'Long Delivery',
    keyOpponentRole: 'creator',
  },
  'DEF_CROSSING_VS_INTERCEPTIONS': {
    id: 'DEF_CROSSING_VS_INTERCEPTIONS',
    category: 'DEFENDING',
    name: 'Block Wide Cross (Crossing ↔️ Interceptions)',
    userStat: 'interceptions',
    userStatLabel: 'Interceptions',
    oppStat: 'crossing',
    oppStatLabel: 'Crossing',
    description: 'Opponent whips a dangerous cross into the box. Stick out a leg to block and intercept the delivery.',
    userActionText: 'Block Cross',
    oppActionText: 'Whipped Cross',
    keyOpponentRole: 'creator',
  },
  'DEF_RETENTION_VS_STRENGTH': {
    id: 'DEF_RETENTION_VS_STRENGTH',
    category: 'DEFENDING',
    name: 'Dispossess Shield (Retention ↔️ Strength)',
    userStat: 'strength',
    userStatLabel: 'Strength',
    oppStat: 'retention',
    oppStatLabel: 'Retention',
    description: 'Opponent shields the ball with their back to goal. Use upper body power to dispossess them.',
    userActionText: 'Physical Challenge',
    oppActionText: 'Ball Shielding',
    keyOpponentRole: 'goalscorer',
  },
  'DEF_HEADING_VS_STRENGTH': {
    id: 'DEF_HEADING_VS_STRENGTH',
    category: 'DEFENDING',
    name: 'Aerial Battle (Heading ↔️ Strength)',
    userStat: 'strength',
    userStatLabel: 'Strength',
    oppStat: 'heading',
    oppStatLabel: 'Heading',
    description: 'Opponent leaps for an aerial cross. Use physical strength and body position to disrupt the header.',
    userActionText: 'Aerial Disrupt',
    oppActionText: 'Target Header',
    keyOpponentRole: 'goalscorer',
  },

  // ================= 2. CREATION DUELS =================
  'CRE_POSITION_VS_PACE': {
    id: 'CRE_POSITION_VS_PACE',
    category: 'CREATION',
    name: 'Exploit Space Run (Position ↔️ Pace)',
    userStat: 'positioning',
    userStatLabel: 'Positioning',
    oppStat: 'pace',
    oppStatLabel: 'Pace',
    description: 'You make a smart run between defenders into open space. Exploit the space before they recover.',
    userActionText: 'Smart Movement Run',
    oppActionText: 'Recovery Sprint',
    keyOpponentRole: 'defender',
  },
  'CRE_BALLCONTROL_VS_REACTION': {
    id: 'CRE_BALLCONTROL_VS_REACTION',
    category: 'CREATION',
    name: 'Press Resistant Touch (Ball Control ↔️ Reaction)',
    userStat: 'ballControl',
    userStatLabel: 'Ball Control',
    oppStat: 'reactions',
    oppStatLabel: 'Reaction',
    description: 'You receive a pass under high defensive pressure. Cushion the ball away from incoming tackles.',
    userActionText: 'Silky First Touch',
    oppActionText: 'Aggressive Close-down',
    keyOpponentRole: 'defender',
  },
  'CRE_DRIBBLING_VS_TACKLING': {
    id: 'CRE_DRIBBLING_VS_TACKLING',
    category: 'CREATION',
    name: '1v1 Take-On (Dribbling ↔️ Tackling)',
    userStat: 'dribbling',
    userStatLabel: 'Dribbling',
    oppStat: 'tackling',
    oppStatLabel: 'Tackling',
    description: 'Take on the defender in a 1v1 situation. Use skill and acceleration to slice past.',
    userActionText: 'Take-on Dribble',
    oppActionText: 'Standing Tackle',
    keyOpponentRole: 'defender',
  },
  'CRE_SHORTPASS_VS_INTERCEPTIONS': {
    id: 'CRE_SHORTPASS_VS_INTERCEPTIONS',
    category: 'CREATION',
    name: 'Penetrative Short Pass (Short Pass ↔️ Interceptions)',
    userStat: 'shortPass',
    userStatLabel: 'Short Pass',
    oppStat: 'interceptions',
    oppStatLabel: 'Interceptions',
    description: 'Thread a surgical pass through the opponent midfield line to your open teammate.',
    userActionText: 'Thread Short Pass',
    oppActionText: 'Intercepting Lane',
    keyOpponentRole: 'creator',
  },
  'CRE_LONGPASS_VS_MARKING': {
    id: 'CRE_LONGPASS_VS_MARKING',
    category: 'CREATION',
    name: 'Pinpoint Long Delivery (Long Pass ↔️ Marking)',
    userStat: 'longPass',
    userStatLabel: 'Long Pass',
    oppStat: 'marking',
    oppStatLabel: 'Marking',
    description: 'Deliver an inch-perfect long diagonal pass over the defense to find the runner.',
    userActionText: 'Pinpoint Long Pass',
    oppActionText: 'Tight Defensive Marking',
    keyOpponentRole: 'defender',
  },
  'CRE_CROSSING_VS_INTERCEPTIONS': {
    id: 'CRE_CROSSING_VS_INTERCEPTIONS',
    category: 'CREATION',
    name: 'Dangerous Cross (Crossing ↔️ Interceptions)',
    userStat: 'crossing',
    userStatLabel: 'Crossing',
    oppStat: 'interceptions',
    oppStatLabel: 'Interceptions',
    description: 'Whip a venomous cross from the flank past the defender into the danger zone.',
    userActionText: 'Whipped Cross',
    oppActionText: 'Cross Block',
    keyOpponentRole: 'defender',
  },

  // ================= 3. GOALSCORING DUELS =================
  'GOAL_SHOOTING_VS_INTERCEPTIONS': {
    id: 'GOAL_SHOOTING_VS_INTERCEPTIONS',
    category: 'GOALSCORING',
    name: 'Create Shot Angle (Shooting ↔️ Interceptions)',
    userStat: 'shooting',
    userStatLabel: 'Shooting',
    oppStat: 'interceptions',
    oppStatLabel: 'Interceptions',
    description: 'Find shooting space in the box. Beat the defender block to unleash a clean strike!',
    userActionText: 'Strike Shot',
    oppActionText: 'Block Shot Angle',
    keyOpponentRole: 'defender',
    isTwoStageScoring: true,
    stageTwoDuelId: 'GOAL_SHOOTING_VS_GK',
  },
  'GOAL_LONGSHOTS_VS_TACKLING': {
    id: 'GOAL_LONGSHOTS_VS_TACKLING',
    category: 'GOALSCORING',
    name: 'Long-Range Strike (Long Shots ↔️ Tackling)',
    userStat: 'longShots',
    userStatLabel: 'Long Shots',
    oppStat: 'tackling',
    oppStatLabel: 'Tackling',
    description: 'Unleash a cannon from outside the box before the closing defender can tackle or deflect.',
    userActionText: 'Long Range Cannon',
    oppActionText: 'Close Down Strike',
    keyOpponentRole: 'defender',
    isTwoStageScoring: true,
    stageTwoDuelId: 'GOAL_LONGSHOTS_VS_GK',
  },
  'GOAL_HEADING_VS_STRENGTH': {
    id: 'GOAL_HEADING_VS_STRENGTH',
    category: 'GOALSCORING',
    name: 'Aerial Goal Contest (Heading ↔️ Strength)',
    userStat: 'heading',
    userStatLabel: 'Heading',
    oppStat: 'strength',
    oppStatLabel: 'Strength',
    description: 'Battle the center back in the air to power a scoring header toward goal!',
    userActionText: 'Power Header',
    oppActionText: 'Physical Shielding',
    keyOpponentRole: 'defender',
    isTwoStageScoring: true,
    stageTwoDuelId: 'GOAL_HEADING_VS_GK',
  },
  'GOAL_SHOOTING_VS_GK': {
    id: 'GOAL_SHOOTING_VS_GK',
    category: 'GOALSCORING',
    name: 'Clinical Finish (Shooting ↔️ Goalkeeper)',
    userStat: 'shooting',
    userStatLabel: 'Shooting',
    oppStat: 'goalkeeper',
    oppStatLabel: 'Goalkeeper OVR',
    description: 'Shot is unleashed on goal! Place the ball cleanly past the diving goalkeeper.',
    userActionText: 'Clinical Finish',
    oppActionText: 'Goalkeeper Dive',
    keyOpponentRole: 'goalkeeper',
  },
  'GOAL_LONGSHOTS_VS_GK': {
    id: 'GOAL_LONGSHOTS_VS_GK',
    category: 'GOALSCORING',
    name: 'Top Corner Screamer (Long Shots ↔️ Goalkeeper)',
    userStat: 'longShots',
    userStatLabel: 'Long Shots',
    oppStat: 'goalkeeper',
    oppStatLabel: 'Goalkeeper OVR',
    description: 'Long-range rocket heading for the top corner! Beat the outstretched keeper hands.',
    userActionText: 'Top Corner Strike',
    oppActionText: 'Fingertip Parry',
    keyOpponentRole: 'goalkeeper',
  },
  'GOAL_HEADING_VS_GK': {
    id: 'GOAL_HEADING_VS_GK',
    category: 'GOALSCORING',
    name: 'Downward Header (Heading ↔️ Goalkeeper)',
    userStat: 'heading',
    userStatLabel: 'Heading',
    oppStat: 'goalkeeper',
    oppStatLabel: 'Goalkeeper OVR',
    description: 'Direct the powerful header into the bottom corner beyond the keeper reach.',
    userActionText: 'Downward Header',
    oppActionText: 'Reflex Save',
    keyOpponentRole: 'goalkeeper',
  },
};

export interface ResolvedDuelOpponent {
  name: string;
  roleLabel: string;
  statValue: number;
  statLabel: string;
  composure: number;
  isSquadRating: boolean;
  squadLabel?: string;
  avatarSeed?: string;
}

export interface DuelCalculationResult {
  duelDef: DuelTypeDefinition;
  userStatValue: number;
  userComposure: number;
  userEffectiveScore: number;
  oppStatValue: number;
  oppComposure: number;
  oppEffectiveScore: number;
  statAdvantage: number;
  zoneMultiplier: number;
  isUserAdvantage: boolean;
  advantageLabel: string;
  opponent: ResolvedDuelOpponent;
}

/**
 * Extracts a specific stat value from a player object
 */
export function getPlayerDuelStat(player: PlayerCardData, statKey: DuelStatName): number {
  if (!player) return 70;

  const outfield = getOrCreateOutfieldDetailed(player.stats);
  const gk = getOrCreateGkDetailed(player.stats);
  const multiplier = getSkillPerkSimulationMultiplier(player, statKey);

  let val = 70;
  switch (statKey) {
    case 'pace':
      val = outfield.pace || player.stats?.phy || 70;
      break;
    case 'strength':
      val = outfield.strength || player.stats?.phy || 70;
      break;
    case 'ballControl':
      val = outfield.ballControl || player.stats?.pro || 70;
      break;
    case 'retention':
      val = outfield.retention || player.stats?.pro || 70;
      break;
    case 'dribbling':
      val = outfield.dribbling || player.stats?.pro || 70;
      break;
    case 'shortPass':
      val = outfield.shortPass || player.stats?.cre || 70;
      break;
    case 'longPass':
      val = outfield.longPass || player.stats?.cre || 70;
      break;
    case 'crossing':
      val = outfield.crossing || player.stats?.cre || 70;
      break;
    case 'shooting':
      val = outfield.shooting || player.stats?.goa || 70;
      break;
    case 'heading':
      val = outfield.heading || player.stats?.goa || 70;
      break;
    case 'longShots':
      val = outfield.longShots || player.stats?.goa || 70;
      break;
    case 'tackling':
      val = outfield.tackling || player.stats?.def || 70;
      break;
    case 'marking':
      val = outfield.marking || player.stats?.def || 70;
      break;
    case 'interceptions':
      val = outfield.interceptions || player.stats?.def || 70;
      break;
    case 'positioning':
      val = outfield.positioning || player.stats?.men || 70;
      break;
    case 'composure':
      val = outfield.composure || player.stats?.men || 70;
      break;
    case 'reactions':
      val = outfield.reactions || player.stats?.men || 70;
      break;
    case 'goalkeeper':
      val = player.ovr || (gk.saving + gk.reflexes + gk.positioning) / 3 || 70;
      break;
    default:
      val = player.ovr || 70;
      break;
  }

  return Math.round(val * multiplier);
}

/**
 * Calculates squad OVR strictly for a specific squad group from squadSaveFile
 */
export function calculateSquadGroupOvr(team: EditorTeamData, groupKey: SquadGroupKey): number {
  if (!team || !team.squadSaveFile || !team.squadSaveFile[groupKey]) {
    return team.overallRating || team.reputation || 70;
  }
  const slots = team.squadSaveFile[groupKey].filter((s) => s.player !== null && s.player !== undefined);
  if (slots.length === 0) {
    return team.overallRating || team.reputation || 70;
  }
  const total = slots.reduce((acc, s) => acc + (s.player?.ovr || 60), 0);
  return Math.round(total / slots.length);
}

/**
 * Checks whether the current match is a Youth or Reserve match
 */
export function isYouthOrReserveMatch(stageTitle: string): {
  isYouthOrReserve: boolean;
  groupKey: SquadGroupKey;
  label: string;
} {
  const t = stageTitle.toLowerCase();
  if (t.includes('u17') || t.includes('under 17') || t.includes('under-17')) {
    return { isYouthOrReserve: true, groupKey: 'u17', label: 'U17 Squad OVR' };
  }
  if (t.includes('u20') || t.includes('under 20') || t.includes('under-20')) {
    return { isYouthOrReserve: true, groupKey: 'u20', label: 'U20 Squad OVR' };
  }
  if (t.includes('reserve') || t.includes('reserves')) {
    return { isYouthOrReserve: true, groupKey: 'reserves', label: 'Reserves Squad OVR' };
  }
  if (t.includes('youth') || t.includes('academy') || t.includes('grassroots') || t.includes('international youth')) {
    return { isYouthOrReserve: true, groupKey: 'u20', label: 'Youth Squad OVR' };
  }
  return { isYouthOrReserve: false, groupKey: 'squad', label: 'First Team' };
}

/**
 * Resolves the opposing player or squad OVR for a duel
 */
export function resolveDuelOpponent(
  duelDef: DuelTypeDefinition,
  stageTitle: string,
  opponentName: string,
  opponentOvr: number
): ResolvedDuelOpponent {
  const youthCheck = isYouthOrReserveMatch(stageTitle);
  const db = getLeagueDatabase();

  // Look up opponent team in database
  let foundTeam: EditorTeamData | undefined;
  if (db && db.teams) {
    foundTeam = Object.values(db.teams).find(
      (t) => t.name.toLowerCase() === opponentName.toLowerCase() || t.id.toLowerCase() === opponentName.toLowerCase()
    );
  }

  // 1. If Youth or Reserve match -> Use calculated Squad OVR
  if (youthCheck.isYouthOrReserve) {
    let squadOvr = opponentOvr || 70;
    if (foundTeam) {
      squadOvr = calculateSquadGroupOvr(foundTeam, youthCheck.groupKey);
    }
    return {
      name: `${opponentName} ${youthCheck.label}`,
      roleLabel: youthCheck.label,
      statValue: squadOvr,
      statLabel: `${duelDef.oppStatLabel} (${squadOvr})`,
      composure: squadOvr,
      isSquadRating: true,
      squadLabel: youthCheck.label,
    };
  }

  // 2. Professional First Team match -> Use existing 4 Key Players
  if (foundTeam && foundTeam.squadSaveFile?.squad) {
    const squadSlots = foundTeam.squadSaveFile.squad.filter((s) => s.player);
    let targetPlayerId: string | undefined;

    switch (duelDef.keyOpponentRole) {
      case 'goalkeeper':
        targetPlayerId = foundTeam.goalkeeperPlayerId;
        break;
      case 'defender':
        targetPlayerId = foundTeam.defenderPlayerId;
        break;
      case 'creator':
        targetPlayerId = foundTeam.creatorPlayerId;
        break;
      case 'goalscorer':
        targetPlayerId = foundTeam.goalscorerPlayerId;
        break;
    }

    let targetPlayer = squadSlots.find((s) => s.player?.id === targetPlayerId)?.player;

    // Fallback if role player id not found: find highest rated in position category
    if (!targetPlayer) {
      if (duelDef.keyOpponentRole === 'goalkeeper') {
        targetPlayer = squadSlots.find((s) => isGoalkeeperPosition(s.player?.position))?.player;
      } else if (duelDef.keyOpponentRole === 'defender') {
        targetPlayer = squadSlots.find((s) => isDefenderPosition(s.player?.position))?.player;
      } else if (duelDef.keyOpponentRole === 'creator') {
        targetPlayer = squadSlots.find((s) => isCreatorPosition(s.player?.position))?.player;
      } else if (duelDef.keyOpponentRole === 'goalscorer') {
        targetPlayer = squadSlots.find((s) => isGoalscorerPosition(s.player?.position))?.player;
      }
    }

    if (targetPlayer) {
      const oppStatVal = getPlayerDuelStat(targetPlayer, duelDef.oppStat);
      const oppComp = getPlayerDuelStat(targetPlayer, 'composure');
      const roleName =
        duelDef.keyOpponentRole === 'goalkeeper'
          ? 'Key Goalkeeper'
          : duelDef.keyOpponentRole === 'defender'
          ? 'Key Defender'
          : duelDef.keyOpponentRole === 'creator'
          ? 'Key Creator'
          : 'Key Goalscorer';

      return {
        name: targetPlayer.name,
        roleLabel: `${roleName} • ${targetPlayer.position || 'PRO'}`,
        statValue: oppStatVal,
        statLabel: `${duelDef.oppStatLabel}: ${oppStatVal}`,
        composure: oppComp,
        isSquadRating: false,
        avatarSeed: targetPlayer.id,
      };
    }
  }

  // Generic fallback if professional team has no specific player file
  const genericStat = opponentOvr || 70;
  const genericRoleName =
    duelDef.keyOpponentRole === 'goalkeeper'
      ? `${opponentName} Goalkeeper`
      : duelDef.keyOpponentRole === 'defender'
      ? `${opponentName} Defender`
      : duelDef.keyOpponentRole === 'creator'
      ? `${opponentName} Playmaker`
      : `${opponentName} Striker`;

  return {
    name: genericRoleName,
    roleLabel: `${duelDef.keyOpponentRole.toUpperCase()} (${genericStat} OVR)`,
    statValue: genericStat,
    statLabel: `${duelDef.oppStatLabel}: ${genericStat}`,
    composure: genericStat,
    isSquadRating: false,
  };
}

/**
 * Calculates complete duel matchup, composure weighting, and QTE zone scale factor
 *
 * Formula per user prompt:
 * (Relevant Duel Stat * 0.60) + (Composure * 0.40)
 */
export function calculateDuelMatchup(
  player: PlayerCardData,
  duelDef: DuelTypeDefinition,
  stageTitle: string,
  opponentName: string,
  opponentOvr: number
): DuelCalculationResult {
  const userStatValue = getPlayerDuelStat(player, duelDef.userStat);
  const userComposure = getPlayerDuelStat(player, 'composure');

  // User Effective Score: 60% Relevant Stat + 40% Composure
  let userEffectiveScore = parseFloat((userStatValue * 0.6 + userComposure * 0.4).toFixed(1));

  // Stat Break bonus in duels
  const isStatBreak = userStatValue >= 100;
  const breakInfo = getStatBreakBonus(player.stats?.detailed);
  const isGroupMastery =
    (duelDef.category === 'DEFENDING' && breakInfo.masteredGroups.includes('DEF')) ||
    (duelDef.category === 'CREATION' && breakInfo.masteredGroups.includes('CRE')) ||
    (duelDef.category === 'GOALSCORING' && breakInfo.masteredGroups.includes('SCO'));

  if (isGroupMastery) {
    userEffectiveScore = parseFloat((userEffectiveScore * 1.4).toFixed(1));
  } else if (isStatBreak) {
    userEffectiveScore = parseFloat((userEffectiveScore * 1.25).toFixed(1));
  }

  const opponent = resolveDuelOpponent(duelDef, stageTitle, opponentName, opponentOvr);

  // Opponent Effective Score: 60% Relevant Stat + 40% Composure (or 100% OVR for squad)
  const oppEffectiveScore = opponent.isSquadRating
    ? opponent.statValue
    : parseFloat((opponent.statValue * 0.6 + opponent.composure * 0.4).toFixed(1));

  const statAdvantage = parseFloat((userEffectiveScore - oppEffectiveScore).toFixed(1));
  const isUserAdvantage = statAdvantage >= 0;

  // QTE Zone Scaling:
  // Base scale is enhanced by user's effective score (higher = wider)
  // And boosted / tightened by the differential against opponent
  // Example: High dribbling & composure widens zones up to ~99% larger
  const baseScoreScale = userEffectiveScore / 100; // 0.4 to 0.99
  const diffScale = statAdvantage * 0.015; // e.g. +10 advantage = +0.15, -10 = -0.15
  let zoneMultiplier = Math.max(0.6, Math.min(2.5, 1.0 + (baseScoreScale - 0.7) * 0.8 + diffScale));
  if (isGroupMastery) {
    zoneMultiplier = Math.min(3.0, zoneMultiplier * 1.8);
  } else if (isStatBreak) {
    zoneMultiplier = Math.min(2.8, zoneMultiplier * 1.5);
  }

  let advantageLabel = 'Evenly Matched ⚖️';
  if (isGroupMastery) {
    advantageLabel = `👑 IMMORTAL GROUP MASTERY (117 Rating: +${statAdvantage}) ⭐`;
  } else if (isStatBreak) {
    advantageLabel = `🌟 STAT BREAK IMMORTALITY (100 Rating: +${statAdvantage}) 👑`;
  } else if (statAdvantage >= 12) {
    advantageLabel = `Decisive Advantage (+${statAdvantage}) 🚀`;
  } else if (statAdvantage >= 5) {
    advantageLabel = `Tactical Advantage (+${statAdvantage}) 🟢`;
  } else if (statAdvantage <= -12) {
    advantageLabel = `Heavy Disadvantage (${statAdvantage}) ⚠️`;
  } else if (statAdvantage <= -5) {
    advantageLabel = `Tough Matchup (${statAdvantage}) 🟠`;
  }

  return {
    duelDef,
    userStatValue,
    userComposure,
    userEffectiveScore,
    oppStatValue: opponent.statValue,
    oppComposure: opponent.composure,
    oppEffectiveScore,
    statAdvantage,
    zoneMultiplier,
    isUserAdvantage,
    advantageLabel,
    opponent,
  };
}
