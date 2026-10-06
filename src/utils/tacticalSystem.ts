import {
  FormationType,
  TacticalStyle,
  TacticalPositionSetup,
  ManagerData,
  PlayerRolePosition,
  PlaystyleAssignment,
} from '../types/leagueEditor';
import { getSubPositionInfo } from './statCalculations';
import { PlayerCardData } from '../types';
import { UNIQUE_ELITE_PLAYERS_REGISTRY, getUniqueElitePlayerDef } from './uniquePlayerRegistry';

export const TACTICAL_STYLES: {
  id: TacticalStyle;
  label: string;
  desc: string;
  aiBehavior: string;
}[] = [
  {
    id: 'possession',
    label: 'Possession',
    desc: 'Patient build-up from the back with short passes, dominant tempo & positional rotation.',
    aiBehavior: 'High ball possession, safe pass selection, defenders step into midfield.',
  },
  {
    id: 'gegenpressing',
    label: 'Counter-Pressing (Gegenpressing)',
    desc: 'Aggressive high press instantly upon ball loss to win possession in the opponent half.',
    aiBehavior: 'Extreme high line, relentless stamina usage, explosive counter-attacks.',
  },
  {
    id: 'counter_attack',
    label: 'Counter Attack',
    desc: 'Solid compact defensive block with fast vertical transitions to wingers and strikers.',
    aiBehavior: 'Deep defensive stance, direct long passes into space, fast forward wing runs.',
  },
  {
    id: 'long_balls',
    label: 'Long Balls (Type 1 Play)',
    desc: 'Bypasses midfield with aerial passes directed towards a physical target man striker.',
    aiBehavior: 'Direct vertical long balls, wingers collapse for second ball rebounds.',
  },
  {
    id: 'catenaccio',
    label: 'Catenaccio (Park the Bus / Haramball)',
    desc: 'Ultra-defensive low block with double pivot shielding, denying central space.',
    aiBehavior: '10 players behind the ball, heavy tackling, slow tempo restart.',
  },
];

export const FORMATION_LIST: { id: FormationType; label: string; defenders: number; midfielders: number; attackers: number }[] = [
  { id: '4-3-3', label: '4-3-3 (Classic Attack)', defenders: 4, midfielders: 3, attackers: 3 },
  { id: '4-2-3-1', label: '4-2-3-1 (Balanced Pivot)', defenders: 4, midfielders: 5, attackers: 1 },
  { id: '4-4-2', label: '4-4-2 (Dual Striker)', defenders: 4, midfielders: 4, attackers: 2 },
  { id: '3-4-3', label: '3-4-3 (Wide Attack)', defenders: 3, midfielders: 4, attackers: 3 },
  { id: '3-5-2', label: '3-5-2 (Midfield Control)', defenders: 3, midfielders: 5, attackers: 2 },
  { id: '3-4-1-2', label: '3-4-1-2 (Trequartista)', defenders: 3, midfielders: 5, attackers: 2 },
  { id: '5-3-2', label: '5-3-2 (Solid Wingbacks)', defenders: 5, midfielders: 3, attackers: 2 },
  { id: '5-4-1', label: '5-4-1 (Ultra Defensive)', defenders: 5, midfielders: 4, attackers: 1 },
];

export function getPlaystylesForRole(role: PlayerRolePosition): string[] {
  const info = getSubPositionInfo(role);
  return info.playStyles && info.playStyles.length > 0
    ? info.playStyles
    : ['Balanced'];
}

export function validateRolePlaystyle(role: PlayerRolePosition, playstyle: string): string {
  const validStyles = getPlaystylesForRole(role);
  if (validStyles.some((s) => s.toLowerCase() === playstyle.toLowerCase())) {
    const matched = validStyles.find((s) => s.toLowerCase() === playstyle.toLowerCase());
    return matched || playstyle;
  }
  return validStyles[0] || 'Balanced';
}

/**
 * Generates an authentic, probabilistic playstyle for an individual player
 * based on their sub-position and their team's tactical style philosophy.
 */
export function generatePlaystyleForRoleAndStyle(
  role: string,
  style: TacticalStyle = 'possession',
  seedValue: number = 0,
  ovr: number = 75
): PlaystyleAssignment {
  const r = (role || 'ST').toUpperCase();
  // Pseudo-random deterministic or randomized selection
  const rand = seedValue > 0 ? (Math.sin(seedValue * 997 + 13) + 1) / 2 : Math.random();

  switch (r) {
    case 'ST': {
      if (style === 'gegenpressing') {
        // Gegenpressing strikers: heavy on Decoy (False 9/pressing) and Pressing/Complete
        if (rand < 0.45) return 'Decoy';
        if (rand < 0.70) return 'Complete';
        if (rand < 0.85) return 'Finisher';
        return 'Poacher';
      }
      if (style === 'possession') {
        // Possession strikers: Decoy (False 9) / Complete
        if (rand < 0.45) return 'Decoy';
        if (rand < 0.75) return 'Complete';
        if (rand < 0.90) return 'Finisher';
        return 'Poacher';
      }
      if (style === 'counter_attack') {
        // Fast vertical counter strikers: Poachers & Lethal Finishers
        if (rand < 0.45) return 'Poacher';
        if (rand < 0.75) return 'Finisher';
        if (rand < 0.90) return 'Complete';
        return 'Target';
      }
      if (style === 'long_balls') {
        // Long ball target strikers
        if (rand < 0.65) return 'Target';
        if (rand < 0.85) return 'Poacher';
        return 'Finisher';
      }
      if (style === 'catenaccio') {
        // Catenaccio lone poachers or target hold-up
        if (rand < 0.55) return 'Poacher';
        if (rand < 0.85) return 'Target';
        return 'Finisher';
      }
      return 'Poacher';
    }

    case 'LW':
    case 'RW':
    case 'LM':
    case 'RM': {
      if (style === 'gegenpressing') {
        // Gegenpressing wingers: Pressing wingers are most common!
        if (rand < 0.60) return 'Pressing';
        if (rand < 0.85) return 'Inverted';
        return 'Prolific';
      }
      if (style === 'possession') {
        // Possession wingers: Inverted half-space operators & Prolific scorers
        if (rand < 0.45) return 'Inverted';
        if (rand < 0.75) return 'Prolific';
        return 'Traditional';
      }
      if (style === 'counter_attack') {
        // Counter transition runners
        if (rand < 0.50) return 'Prolific';
        if (rand < 0.80) return 'Inverted';
        return 'Traditional';
      }
      if (style === 'long_balls') {
        // Long ball flank crossers
        if (rand < 0.60) return 'Traditional';
        if (rand < 0.85) return 'Pressing';
        return 'Prolific';
      }
      if (style === 'catenaccio') {
        // Tracking defensive wingers
        if (rand < 0.55) return 'Traditional';
        if (rand < 0.85) return 'Pressing';
        return 'Inverted';
      }
      return 'Inverted';
    }

    case 'CAM': {
      if (style === 'gegenpressing') {
        if (rand < 0.50) return 'Engine';
        if (rand < 0.80) return 'Shadow';
        return 'Creator';
      }
      if (style === 'possession') {
        if (rand < 0.50) return 'Creator';
        if (rand < 0.80) return 'Classic N10';
        return 'Shadow';
      }
      if (style === 'counter_attack') {
        if (rand < 0.45) return 'Creator';
        if (rand < 0.80) return 'Shadow';
        return 'Engine';
      }
      if (style === 'long_balls') {
        if (rand < 0.55) return 'Shadow';
        if (rand < 0.85) return 'Engine';
        return 'Classic N10';
      }
      if (style === 'catenaccio') {
        if (rand < 0.50) return 'Classic N10';
        if (rand < 0.80) return 'Engine';
        return 'Creator';
      }
      return 'Creator';
    }

    case 'CM': {
      if (style === 'gegenpressing') {
        if (rand < 0.55) return 'Box-to-Box';
        if (rand < 0.85) return 'Runner';
        return 'Maestro';
      }
      if (style === 'possession') {
        if (rand < 0.60) return 'Maestro';
        if (rand < 0.85) return 'Box-to-Box';
        return 'Runner';
      }
      if (style === 'counter_attack') {
        if (rand < 0.50) return 'Runner';
        if (rand < 0.85) return 'Box-to-Box';
        return 'Maestro';
      }
      if (style === 'long_balls') {
        if (rand < 0.55) return 'Box-to-Box';
        if (rand < 0.85) return 'Runner';
        return 'Maestro';
      }
      if (style === 'catenaccio') {
        if (rand < 0.60) return 'Box-to-Box';
        if (rand < 0.85) return 'Runner';
        return 'Maestro';
      }
      return 'Box-to-Box';
    }

    case 'CDM': {
      if (style === 'gegenpressing') {
        return rand < 0.65 ? 'Enforcer' : 'Anchor';
      }
      if (style === 'possession') {
        return rand < 0.75 ? 'Anchor' : 'Enforcer';
      }
      if (style === 'counter_attack') {
        return rand < 0.55 ? 'Anchor' : 'Enforcer';
      }
      if (style === 'long_balls') {
        return rand < 0.70 ? 'Enforcer' : 'Anchor';
      }
      if (style === 'catenaccio') {
        return rand < 0.65 ? 'Enforcer' : 'Anchor';
      }
      return 'Anchor';
    }

    case 'CB': {
      if (style === 'gegenpressing') {
        if (rand < 0.55) return 'Stopper';
        if (rand < 0.85) return 'Destroyer';
        return 'Distributor';
      }
      if (style === 'possession') {
        if (rand < 0.50) return 'Distributor';
        if (rand < 0.80) return 'Playmaker';
        return 'Stopper';
      }
      if (style === 'counter_attack') {
        if (rand < 0.50) return 'Destroyer';
        if (rand < 0.80) return 'Stopper';
        return 'Distributor';
      }
      if (style === 'long_balls') {
        if (rand < 0.60) return 'Stopper';
        if (rand < 0.85) return 'Destroyer';
        return 'Distributor';
      }
      if (style === 'catenaccio') {
        if (rand < 0.60) return 'Destroyer';
        if (rand < 0.85) return 'Stopper';
        return 'Distributor';
      }
      return 'Stopper';
    }

    case 'LB':
    case 'RB':
    case 'LWB':
    case 'RWB': {
      if (style === 'gegenpressing') {
        if (rand < 0.45) return 'Attacker';
        if (rand < 0.75) return 'Inverted';
        return 'Balanced';
      }
      if (style === 'possession') {
        if (rand < 0.45) return 'Inverted';
        if (rand < 0.75) return 'Balanced';
        return 'Attacker';
      }
      if (style === 'counter_attack') {
        if (rand < 0.45) return 'Balanced';
        if (rand < 0.75) return 'Attacker';
        return 'Defensive';
      }
      if (style === 'long_balls') {
        if (rand < 0.55) return 'Defensive';
        if (rand < 0.85) return 'Balanced';
        return 'Attacker';
      }
      if (style === 'catenaccio') {
        if (rand < 0.60) return 'Defensive';
        if (rand < 0.85) return 'Balanced';
        return 'Inverted';
      }
      return 'Balanced';
    }

    case 'GK': {
      if (style === 'possession' || style === 'gegenpressing') {
        return rand < 0.80 ? 'Sweeper' : 'Balanced';
      }
      if (style === 'catenaccio' || style === 'long_balls') {
        return rand < 0.75 ? 'Wall' : 'Balanced';
      }
      return rand < 0.50 ? 'Wall' : rand < 0.80 ? 'Balanced' : 'Sweeper';
    }

    default:
      return 'Balanced';
  }
}

/**
 * Returns authentic tactical positioning tailored to both the Formation AND the Tactical Style.
 */
export function getDefaultTacticalPositions(
  formation: FormationType,
  style: TacticalStyle = 'possession'
): TacticalPositionSetup[] {
  switch (formation) {
    case '4-3-3': {
      let gkStyle: PlaystyleAssignment = style === 'possession' || style === 'gegenpressing' ? 'Sweeper' : style === 'catenaccio' ? 'Wall' : 'Balanced';
      let lbStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Attacker' : style === 'possession' ? 'Inverted' : style === 'catenaccio' ? 'Defensive' : 'Balanced';
      let rbStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Attacker' : style === 'possession' ? 'Inverted' : style === 'catenaccio' ? 'Defensive' : 'Balanced';
      let cb1Style: PlaystyleAssignment = style === 'possession' ? 'Distributor' : style === 'gegenpressing' ? 'Stopper' : 'Destroyer';
      let cb2Style: PlaystyleAssignment = style === 'possession' ? 'Playmaker' : style === 'gegenpressing' ? 'Destroyer' : 'Stopper';
      let cdmStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Enforcer' : 'Anchor';
      let cm1Style: PlaystyleAssignment = style === 'gegenpressing' ? 'Box-to-Box' : style === 'possession' ? 'Maestro' : 'Runner';
      let cm2Style: PlaystyleAssignment = style === 'gegenpressing' ? 'Runner' : style === 'possession' ? 'Box-to-Box' : 'Maestro';
      let lwStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : style === 'possession' ? 'Inverted' : style === 'long_balls' ? 'Traditional' : 'Prolific';
      let rwStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : style === 'possession' ? 'Inverted' : style === 'long_balls' ? 'Traditional' : 'Prolific';
      let stStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Decoy' : style === 'possession' ? 'Decoy' : style === 'long_balls' ? 'Target' : 'Poacher';

      return [
        { slotId: 'gk_1', role: 'GK', playstyle: gkStyle, zoneRow: 9, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_lb', role: 'LB', playstyle: lbStyle, zoneRow: 8, zoneCol: 0, heightOffset: 0 },
        { slotId: 'def_cb1', role: 'CB', playstyle: cb1Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb2', role: 'CB', playstyle: cb2Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_rb', role: 'RB', playstyle: rbStyle, zoneRow: 8, zoneCol: 2, heightOffset: 0 },
        { slotId: 'mid_cdm', role: 'CDM', playstyle: cdmStyle, zoneRow: 6, zoneCol: 1, heightOffset: -1 },
        { slotId: 'mid_cm1', role: 'CM', playstyle: cm1Style, zoneRow: 5, zoneCol: 0, heightOffset: 0 },
        { slotId: 'mid_cm2', role: 'CM', playstyle: cm2Style, zoneRow: 5, zoneCol: 2, heightOffset: 0 },
        { slotId: 'att_lw', role: 'LW', playstyle: lwStyle, zoneRow: 1, zoneCol: 0, heightOffset: 0 },
        { slotId: 'att_st', role: 'ST', playstyle: stStyle, zoneRow: 0, zoneCol: 1, heightOffset: 0 },
        { slotId: 'att_rw', role: 'RW', playstyle: rwStyle, zoneRow: 1, zoneCol: 2, heightOffset: 0 },
      ];
    }

    case '4-2-3-1': {
      let gkStyle: PlaystyleAssignment = style === 'possession' || style === 'gegenpressing' ? 'Sweeper' : style === 'catenaccio' ? 'Wall' : 'Balanced';
      let lbStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Attacker' : style === 'possession' ? 'Inverted' : style === 'catenaccio' ? 'Defensive' : 'Balanced';
      let rbStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Attacker' : style === 'possession' ? 'Inverted' : style === 'catenaccio' ? 'Defensive' : 'Balanced';
      let cb1Style: PlaystyleAssignment = style === 'possession' ? 'Distributor' : style === 'gegenpressing' ? 'Stopper' : 'Destroyer';
      let cb2Style: PlaystyleAssignment = style === 'possession' ? 'Playmaker' : style === 'gegenpressing' ? 'Destroyer' : 'Stopper';
      let cdm1Style: PlaystyleAssignment = 'Anchor';
      let cdm2Style: PlaystyleAssignment = style === 'gegenpressing' ? 'Enforcer' : 'Box-to-Box';
      let camStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Engine' : style === 'possession' ? 'Creator' : style === 'counter_attack' ? 'Shadow' : 'Classic N10';
      let lwStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : style === 'possession' ? 'Inverted' : 'Prolific';
      let rwStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : style === 'possession' ? 'Inverted' : 'Prolific';
      let stStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Decoy' : style === 'possession' ? 'Decoy' : style === 'long_balls' ? 'Target' : 'Poacher';

      return [
        { slotId: 'gk_1', role: 'GK', playstyle: gkStyle, zoneRow: 9, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_lb', role: 'LB', playstyle: lbStyle, zoneRow: 8, zoneCol: 0, heightOffset: 0 },
        { slotId: 'def_cb1', role: 'CB', playstyle: cb1Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb2', role: 'CB', playstyle: cb2Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_rb', role: 'RB', playstyle: rbStyle, zoneRow: 8, zoneCol: 2, heightOffset: 0 },
        { slotId: 'mid_cdm1', role: 'CDM', playstyle: cdm1Style, zoneRow: 6, zoneCol: 0, heightOffset: -1 },
        { slotId: 'mid_cdm2', role: 'CDM', playstyle: cdm2Style, zoneRow: 6, zoneCol: 2, heightOffset: -1 },
        { slotId: 'mid_cam', role: 'CAM', playstyle: camStyle, zoneRow: 3, zoneCol: 1, heightOffset: 1 },
        { slotId: 'mid_lw', role: 'LW', playstyle: lwStyle, zoneRow: 3, zoneCol: 0, heightOffset: 0 },
        { slotId: 'mid_rw', role: 'RW', playstyle: rwStyle, zoneRow: 3, zoneCol: 2, heightOffset: 0 },
        { slotId: 'att_st', role: 'ST', playstyle: stStyle, zoneRow: 0, zoneCol: 1, heightOffset: 0 },
      ];
    }

    case '4-4-2': {
      let gkStyle: PlaystyleAssignment = style === 'possession' || style === 'gegenpressing' ? 'Sweeper' : 'Wall';
      let lbStyle: PlaystyleAssignment = style === 'long_balls' ? 'Defensive' : style === 'catenaccio' ? 'Defensive' : style === 'gegenpressing' ? 'Attacker' : 'Balanced';
      let rbStyle: PlaystyleAssignment = style === 'long_balls' ? 'Balanced' : style === 'catenaccio' ? 'Defensive' : style === 'gegenpressing' ? 'Attacker' : 'Balanced';
      let cb1Style: PlaystyleAssignment = style === 'possession' ? 'Distributor' : style === 'long_balls' ? 'Destroyer' : style === 'gegenpressing' ? 'Stopper' : 'Destroyer';
      let cb2Style: PlaystyleAssignment = style === 'possession' ? 'Playmaker' : style === 'long_balls' ? 'Stopper' : 'Stopper';
      let cm1Style: PlaystyleAssignment = style === 'long_balls' ? 'Box-to-Box' : style === 'gegenpressing' ? 'Box-to-Box' : style === 'possession' ? 'Maestro' : 'Box-to-Box';
      let cm2Style: PlaystyleAssignment = style === 'long_balls' ? 'Enforcer' : style === 'possession' ? 'Box-to-Box' : style === 'counter_attack' ? 'Runner' : 'Enforcer';
      let lmStyle: PlaystyleAssignment = style === 'long_balls' ? 'Traditional' : style === 'gegenpressing' ? 'Pressing' : style === 'possession' ? 'Inverted' : 'Traditional';
      let rmStyle: PlaystyleAssignment = style === 'long_balls' ? 'Traditional' : style === 'gegenpressing' ? 'Pressing' : style === 'possession' ? 'Inverted' : 'Traditional';
      let st1Style: PlaystyleAssignment = style === 'long_balls' ? 'Poacher' : style === 'gegenpressing' ? 'Decoy' : style === 'possession' ? 'Decoy' : 'Poacher';
      let st2Style: PlaystyleAssignment = style === 'long_balls' ? 'Target' : style === 'catenaccio' ? 'Target' : 'Finisher';

      return [
        { slotId: 'gk_1', role: 'GK', playstyle: gkStyle, zoneRow: 9, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_lb', role: 'LB', playstyle: lbStyle, zoneRow: 8, zoneCol: 0, heightOffset: 0 },
        { slotId: 'def_cb1', role: 'CB', playstyle: cb1Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb2', role: 'CB', playstyle: cb2Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_rb', role: 'RB', playstyle: rbStyle, zoneRow: 8, zoneCol: 2, heightOffset: 0 },
        { slotId: 'mid_cm1', role: 'CM', playstyle: cm1Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_cm2', role: 'CM', playstyle: cm2Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_lm', role: 'LW', playstyle: lmStyle, zoneRow: 4, zoneCol: 0, heightOffset: 0 },
        { slotId: 'mid_rm', role: 'RW', playstyle: rmStyle, zoneRow: 4, zoneCol: 2, heightOffset: 0 },
        { slotId: 'att_st1', role: 'ST', playstyle: st1Style, zoneRow: 0, zoneCol: 0, heightOffset: 0 },
        { slotId: 'att_st2', role: 'ST', playstyle: st2Style, zoneRow: 0, zoneCol: 2, heightOffset: 0 },
      ];
    }

    case '3-4-3': {
      let gkStyle: PlaystyleAssignment = style === 'possession' || style === 'gegenpressing' ? 'Sweeper' : 'Balanced';
      let cb1Style: PlaystyleAssignment = style === 'possession' ? 'Distributor' : 'Stopper';
      let cb2Style: PlaystyleAssignment = style === 'possession' ? 'Playmaker' : 'Destroyer';
      let cb3Style: PlaystyleAssignment = 'Stopper';
      let cm1Style: PlaystyleAssignment = style === 'gegenpressing' ? 'Box-to-Box' : 'Maestro';
      let cm2Style: PlaystyleAssignment = style === 'possession' ? 'Anchor' : 'Runner';
      let lmStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : 'Traditional';
      let rmStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : 'Traditional';
      let lwStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : 'Inverted';
      let rwStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : 'Inverted';
      let stStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Decoy' : style === 'possession' ? 'Decoy' : 'Target';

      return [
        { slotId: 'gk_1', role: 'GK', playstyle: gkStyle, zoneRow: 9, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb1', role: 'CB', playstyle: cb1Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb2', role: 'CB', playstyle: cb2Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb3', role: 'CB', playstyle: cb3Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_cm1', role: 'CM', playstyle: cm1Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_cm2', role: 'CM', playstyle: cm2Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_lm', role: 'LW', playstyle: lmStyle, zoneRow: 4, zoneCol: 0, heightOffset: 0 },
        { slotId: 'mid_rm', role: 'RW', playstyle: rmStyle, zoneRow: 4, zoneCol: 2, heightOffset: 0 },
        { slotId: 'att_lw', role: 'LW', playstyle: lwStyle, zoneRow: 1, zoneCol: 0, heightOffset: 0 },
        { slotId: 'att_st', role: 'ST', playstyle: stStyle, zoneRow: 0, zoneCol: 1, heightOffset: 0 },
        { slotId: 'att_rw', role: 'RW', playstyle: rwStyle, zoneRow: 1, zoneCol: 2, heightOffset: 0 },
      ];
    }

    case '3-5-2': {
      let gkStyle: PlaystyleAssignment = style === 'possession' || style === 'gegenpressing' ? 'Sweeper' : 'Wall';
      let cb1Style: PlaystyleAssignment = style === 'possession' ? 'Distributor' : 'Stopper';
      let cb2Style: PlaystyleAssignment = 'Destroyer';
      let cb3Style: PlaystyleAssignment = 'Stopper';
      let cdmStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Enforcer' : 'Anchor';
      let cm1Style: PlaystyleAssignment = 'Box-to-Box';
      let cm2Style: PlaystyleAssignment = style === 'possession' ? 'Maestro' : 'Runner';
      let lmStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : 'Traditional';
      let rmStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : 'Traditional';
      let st1Style: PlaystyleAssignment = style === 'gegenpressing' ? 'Decoy' : 'Poacher';
      let st2Style: PlaystyleAssignment = style === 'possession' ? 'Complete' : 'Target';

      return [
        { slotId: 'gk_1', role: 'GK', playstyle: gkStyle, zoneRow: 9, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb1', role: 'CB', playstyle: cb1Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb2', role: 'CB', playstyle: cb2Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb3', role: 'CB', playstyle: cb3Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_cdm', role: 'CDM', playstyle: cdmStyle, zoneRow: 6, zoneCol: 1, heightOffset: -1 },
        { slotId: 'mid_cm1', role: 'CM', playstyle: cm1Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_cm2', role: 'CM', playstyle: cm2Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_lm', role: 'LW', playstyle: lmStyle, zoneRow: 4, zoneCol: 0, heightOffset: 0 },
        { slotId: 'mid_rm', role: 'RW', playstyle: rmStyle, zoneRow: 4, zoneCol: 2, heightOffset: 0 },
        { slotId: 'att_st1', role: 'ST', playstyle: st1Style, zoneRow: 0, zoneCol: 0, heightOffset: 0 },
        { slotId: 'att_st2', role: 'ST', playstyle: st2Style, zoneRow: 0, zoneCol: 2, heightOffset: 0 },
      ];
    }

    case '3-4-1-2':
    case '3-4-2-1': {
      let gkStyle: PlaystyleAssignment = style === 'possession' || style === 'gegenpressing' ? 'Sweeper' : 'Wall';
      let cb1Style: PlaystyleAssignment = style === 'possession' ? 'Distributor' : 'Stopper';
      let cb2Style: PlaystyleAssignment = 'Destroyer';
      let cb3Style: PlaystyleAssignment = 'Stopper';
      let cm1Style: PlaystyleAssignment = style === 'possession' ? 'Maestro' : 'Box-to-Box';
      let cm2Style: PlaystyleAssignment = style === 'gegenpressing' ? 'Runner' : 'Anchor';
      let lmStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : 'Traditional';
      let rmStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Pressing' : 'Traditional';
      let camStyle: PlaystyleAssignment = style === 'possession' ? 'Creator' : style === 'gegenpressing' ? 'Engine' : 'Shadow';
      let st1Style: PlaystyleAssignment = style === 'gegenpressing' ? 'Decoy' : 'Poacher';
      let st2Style: PlaystyleAssignment = style === 'possession' ? 'Complete' : 'Target';

      return [
        { slotId: 'gk_1', role: 'GK', playstyle: gkStyle, zoneRow: 9, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb1', role: 'CB', playstyle: cb1Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb2', role: 'CB', playstyle: cb2Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb3', role: 'CB', playstyle: cb3Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_cm1', role: 'CM', playstyle: cm1Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_cm2', role: 'CM', playstyle: cm2Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_lm', role: 'LW', playstyle: lmStyle, zoneRow: 4, zoneCol: 0, heightOffset: 0 },
        { slotId: 'mid_rm', role: 'RW', playstyle: rmStyle, zoneRow: 4, zoneCol: 2, heightOffset: 0 },
        { slotId: 'mid_cam', role: 'CAM', playstyle: camStyle, zoneRow: 3, zoneCol: 1, heightOffset: 1 },
        { slotId: 'att_st1', role: 'ST', playstyle: st1Style, zoneRow: 0, zoneCol: 0, heightOffset: 0 },
        { slotId: 'att_st2', role: 'ST', playstyle: st2Style, zoneRow: 0, zoneCol: 2, heightOffset: 0 },
      ];
    }

    case '5-3-2': {
      let gkStyle: PlaystyleAssignment = style === 'catenaccio' || style === 'long_balls' ? 'Wall' : 'Balanced';
      let lbStyle: PlaystyleAssignment = style === 'catenaccio' ? 'Defensive' : 'Attacker';
      let rbStyle: PlaystyleAssignment = style === 'catenaccio' ? 'Defensive' : 'Attacker';
      let cb1Style: PlaystyleAssignment = 'Distributor';
      let cb2Style: PlaystyleAssignment = 'Destroyer';
      let cb3Style: PlaystyleAssignment = 'Stopper';
      let cdmStyle: PlaystyleAssignment = style === 'gegenpressing' ? 'Enforcer' : 'Anchor';
      let cm1Style: PlaystyleAssignment = 'Box-to-Box';
      let cm2Style: PlaystyleAssignment = style === 'possession' ? 'Maestro' : 'Runner';
      let st1Style: PlaystyleAssignment = style === 'counter_attack' ? 'Poacher' : 'Finisher';
      let st2Style: PlaystyleAssignment = style === 'catenaccio' || style === 'long_balls' ? 'Target' : 'Complete';

      return [
        { slotId: 'gk_1', role: 'GK', playstyle: gkStyle, zoneRow: 9, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_lb', role: 'LB', playstyle: lbStyle, zoneRow: 8, zoneCol: 0, heightOffset: 0 },
        { slotId: 'def_cb1', role: 'CB', playstyle: cb1Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb2', role: 'CB', playstyle: cb2Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb3', role: 'CB', playstyle: cb3Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_rb', role: 'RB', playstyle: rbStyle, zoneRow: 8, zoneCol: 2, heightOffset: 0 },
        { slotId: 'mid_cdm', role: 'CDM', playstyle: cdmStyle, zoneRow: 6, zoneCol: 1, heightOffset: -1 },
        { slotId: 'mid_cm1', role: 'CM', playstyle: cm1Style, zoneRow: 5, zoneCol: 0, heightOffset: 0 },
        { slotId: 'mid_cm2', role: 'CM', playstyle: cm2Style, zoneRow: 5, zoneCol: 2, heightOffset: 0 },
        { slotId: 'att_st1', role: 'ST', playstyle: st1Style, zoneRow: 0, zoneCol: 0, heightOffset: 0 },
        { slotId: 'att_st2', role: 'ST', playstyle: st2Style, zoneRow: 0, zoneCol: 2, heightOffset: 0 },
      ];
    }

    case '5-4-1':
    default: {
      let gkStyle: PlaystyleAssignment = 'Wall';
      let lbStyle: PlaystyleAssignment = 'Defensive';
      let rbStyle: PlaystyleAssignment = 'Defensive';
      let cb1Style: PlaystyleAssignment = 'Stopper';
      let cb2Style: PlaystyleAssignment = 'Destroyer';
      let cb3Style: PlaystyleAssignment = 'Stopper';
      let cm1Style: PlaystyleAssignment = 'Box-to-Box';
      let cm2Style: PlaystyleAssignment = 'Enforcer';
      let lmStyle: PlaystyleAssignment = 'Traditional';
      let rmStyle: PlaystyleAssignment = 'Traditional';
      let stStyle: PlaystyleAssignment = style === 'counter_attack' ? 'Poacher' : 'Target';

      return [
        { slotId: 'gk_1', role: 'GK', playstyle: gkStyle, zoneRow: 9, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_lb', role: 'LB', playstyle: lbStyle, zoneRow: 8, zoneCol: 0, heightOffset: 0 },
        { slotId: 'def_cb1', role: 'CB', playstyle: cb1Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb2', role: 'CB', playstyle: cb2Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_cb3', role: 'CB', playstyle: cb3Style, zoneRow: 8, zoneCol: 1, heightOffset: 0 },
        { slotId: 'def_rb', role: 'RB', playstyle: rbStyle, zoneRow: 8, zoneCol: 2, heightOffset: 0 },
        { slotId: 'mid_cm1', role: 'CM', playstyle: cm1Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_cm2', role: 'CM', playstyle: cm2Style, zoneRow: 5, zoneCol: 1, heightOffset: 0 },
        { slotId: 'mid_lm', role: 'LW', playstyle: lmStyle, zoneRow: 4, zoneCol: 0, heightOffset: 0 },
        { slotId: 'mid_rm', role: 'RW', playstyle: rmStyle, zoneRow: 4, zoneCol: 2, heightOffset: 0 },
        { slotId: 'att_st', role: 'ST', playstyle: stStyle, zoneRow: 0, zoneCol: 1, heightOffset: 0 },
      ];
    }
  }
}

import {
  ClubTacticalProfile,
  TacticalPreset,
  TACTICAL_PRESETS,
  CLUB_TACTICAL_PROFILES,
  getClubTacticalProfile,
} from '../data/clubTacticalDatabase';

export {
  type ClubTacticalProfile,
  type TacticalPreset,
  TACTICAL_PRESETS,
  CLUB_TACTICAL_PROFILES,
  getClubTacticalProfile,
};

/**
 * Star Player Tactical Adaptation Rule:
 * "If a player is too good / high in rating the team will adjust its tactics to it.
 * E.g. Man City plays Possession, but Hal of Norway is a 99 OVR Poacher -> ST slot adapts to Poacher!
 * Real Madrid plays Counter Attack, but Kiki Mobutu is a 99 OVR Complete Striker -> ST slot adapts to Complete!"
 */
export function adaptTacticsForStarPlayers(
  positions: TacticalPositionSetup[],
  squadPlayers?: (PlayerCardData | null | undefined)[] | null,
  teamId?: string
): TacticalPositionSetup[] {
  if (!positions || positions.length === 0) return positions;

  const result = positions.map((p) => ({ ...p }));
  const eliteCandidates: { role: string; playstyle: PlaystyleAssignment; ovr: number; slotId?: string }[] = [];

  // 1. Check Unique Elite Players registry for this team
  if (teamId) {
    const normTid = teamId.toLowerCase();
    UNIQUE_ELITE_PLAYERS_REGISTRY.forEach((u) => {
      if (normTid === u.teamId.toLowerCase()) {
        eliteCandidates.push({
          role: u.subPosition,
          playstyle: u.playStyle as PlaystyleAssignment,
          ovr: u.ovr,
        });
      }
    });
  }

  // 2. Check squad for high-rating cracks (OVR >= 84 or unique elite)
  if (Array.isArray(squadPlayers)) {
    squadPlayers.forEach((p) => {
      if (!p) return;
      const ovr = p.overallRating || p.ovr || 70;
      if ((ovr >= 84 || p.isUniqueElite) && p.subPosition && p.playStyle) {
        eliteCandidates.push({
          role: p.subPosition,
          playstyle: p.playStyle as PlaystyleAssignment,
          ovr: ovr,
        });
      }
    });
  }

  // Sort candidates by highest OVR first so the best crack gets priority
  eliteCandidates.sort((a, b) => b.ovr - a.ovr);

  // Apply adaptations to tactical position slots
  eliteCandidates.forEach((crack) => {
    const targetSlot = result.find((slot) => {
      const sRole = slot.role.toUpperCase();
      const cRole = crack.role.toUpperCase();
      if (sRole === cRole) return true;
      if (['LW', 'RW'].includes(sRole) && ['LW', 'RW'].includes(cRole)) return true;
      if (['CAM', 'CM'].includes(sRole) && ['CAM', 'CM'].includes(cRole)) return true;
      if (['LB', 'RB', 'LWB', 'RWB'].includes(sRole) && ['LB', 'RB', 'LWB', 'RWB'].includes(cRole)) return true;
      return false;
    });

    if (targetSlot) {
      targetSlot.playstyle = crack.playstyle;
    }
  });

  return result;
}

/**
 * Creates an authentic ManagerData object for a team, initialized with
 * realistic tactical profiles and star player overrides.
 */
export function createDefaultManager(
  teamName: string,
  countryCode: string = 'ENG',
  teamId: string = '',
  squadPlayers?: (PlayerCardData | null | undefined)[] | null
): ManagerData {
  const profile = getClubTacticalProfile(teamId, teamName, countryCode);

  let primaryPositions = getDefaultTacticalPositions(profile.primaryFormation, profile.primaryStyle);
  let secondaryPositions = getDefaultTacticalPositions(profile.secondaryFormation, profile.secondaryStyle);

  // Apply explicit profile overrides if present (e.g. Man City, Liverpool, Real Madrid)
  if (profile.starOverrides && profile.starOverrides.length > 0) {
    profile.starOverrides.forEach((ov) => {
      const pSlot = primaryPositions.find((s) => (ov.slotId && s.slotId === ov.slotId) || s.role === ov.role);
      if (pSlot) pSlot.playstyle = ov.playstyle;

      const sSlot = secondaryPositions.find((s) => (ov.slotId && s.slotId === ov.slotId) || s.role === ov.role);
      if (sSlot) sSlot.playstyle = ov.playstyle;
    });
  }

  // Adapt to active cracks in squad (e.g. 88+ OVR players or unique players)
  primaryPositions = adaptTacticsForStarPlayers(primaryPositions, squadPlayers, teamId);
  secondaryPositions = adaptTacticsForStarPlayers(secondaryPositions, squadPlayers, teamId);

  return {
    name: profile.managerName,
    nationality: profile.managerNationality,
    hasSecondaryTactic: true,
    primaryTactic: {
      formation: profile.primaryFormation,
      style: profile.primaryStyle,
      positions: primaryPositions,
    },
    secondaryTactic: {
      formation: profile.secondaryFormation,
      style: profile.secondaryStyle,
      positions: secondaryPositions,
    },
  };
}
