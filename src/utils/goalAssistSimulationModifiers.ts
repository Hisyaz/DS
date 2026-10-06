import { PlayerConfig } from '../types';

export interface GoalAssistModifiers {
  baseGoalChance: number;
  baseAssistChance: number;
  goalChanceMultiplier: number;
  assistChanceMultiplier: number;
  multiGoalChance: number;
  multiAssistChance: number;
  description: string;
}

/**
 * Normalizes sub-position and primary position into standardized taxonomy codes.
 */
export function normalizePositionTaxonomy(
  position?: string,
  subPosition?: string
): { primaryPos: 'ATT' | 'MID' | 'DEF' | 'GK'; subPos: string } {
  const rawPos = (position || '').trim().toUpperCase();
  const rawSub = (subPosition || '').trim().toUpperCase();

  let subPos = rawSub;
  if (!subPos) {
    if (['ST', 'CF', 'SS', 'LW', 'RW'].includes(rawPos)) subPos = rawPos;
    else if (['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(rawPos)) subPos = rawPos;
    else if (['LB', 'RB', 'LWB', 'RWB', 'CB'].includes(rawPos)) subPos = rawPos;
    else if (rawPos === 'GK') subPos = 'GK';
    else if (rawPos === 'ATT') subPos = 'ST';
    else if (rawPos === 'MID') subPos = 'CM';
    else if (rawPos === 'DEF') subPos = 'CB';
    else subPos = 'ST';
  }

  let primaryPos: 'ATT' | 'MID' | 'DEF' | 'GK' = 'ATT';
  if (['ST', 'CF', 'SS', 'LW', 'RW'].includes(subPos) || rawPos === 'ATT') {
    primaryPos = 'ATT';
  } else if (['CAM', 'CM', 'CDM', 'LM', 'RM'].includes(subPos) || rawPos === 'MID') {
    primaryPos = 'MID';
  } else if (['LB', 'RB', 'LWB', 'RWB', 'CB'].includes(subPos) || rawPos === 'DEF') {
    primaryPos = 'DEF';
  } else if (subPos === 'GK' || rawPos === 'GK') {
    primaryPos = 'GK';
  }

  return { primaryPos, subPos };
}

/**
 * Calculates the layered modifiers for Goal & Assist simulation:
 * Baseline Probability -> Position Modifier -> Sub-Position Modifier -> Playstyle Modifier
 */
export function getGoalAssistModifiers(
  position?: string,
  subPosition?: string,
  playStyle?: string
): GoalAssistModifiers {
  const { primaryPos, subPos } = normalizePositionTaxonomy(position, subPosition);
  const style = (playStyle || '').trim().toLowerCase();

  // 1. ATTACKER (ATT)
  if (primaryPos === 'ATT') {
    // ST / Striker
    if (subPos === 'ST' || subPos === 'CF' || (!['LW', 'RW'].includes(subPos))) {
      // Baseline ST: Increased scoring tendency + slightly reduced assist tendency
      // Ensures Normal ST -> Goals > Assists
      let baseGoalChance = 0.48;
      let baseAssistChance = 0.22;
      let goalMult = 1.0;
      let assistMult = 1.0;
      let multiGoal = 0.28;
      let multiAssist = 0.12;
      let desc = 'ST Baseline';

      if (style.includes('poacher')) {
        goalMult = 1.12; // Slightly increase goal prob
        assistMult = 0.75; // Slightly decrease assist prob
        multiGoal = 0.32;
        desc = 'Poacher ST: High goal focus, low assists';
      } else if (style.includes('target')) {
        goalMult = 1.08; // Slightly increase goal prob
        assistMult = 1.25; // Small increase to assist prob via hold-up play
        multiGoal = 0.28;
        desc = 'Target ST: Physical presence, hold-up link assists';
      } else if (style.includes('complete')) {
        goalMult = 1.16; // Moderately increase goal prob
        assistMult = 1.18; // Slightly increase assist prob
        multiGoal = 0.32;
        desc = 'Complete ST: All-round attacking threat';
      } else if (style.includes('finisher')) {
        goalMult = 1.15; // Increase goal prob
        assistMult = 0.80; // Slightly decrease assist prob
        multiGoal = 0.30;
        desc = 'Finisher ST: Lethal box finishing';
      } else if (style.includes('decoy')) {
        // Major ST Exception: Decoy STs trend toward more assists relative to goals
        goalMult = 0.68; // Decrease goal prob
        assistMult = 1.85; // Increase assist prob
        multiGoal = 0.15;
        multiAssist = 0.25;
        desc = 'Decoy ST: Space creator, assist-oriented';
      }

      return {
        baseGoalChance,
        baseAssistChance,
        goalChanceMultiplier: goalMult,
        assistChanceMultiplier: assistMult,
        multiGoalChance: multiGoal,
        multiAssistChance: multiAssist,
        description: desc,
      };
    }

    // Wingers (LW / RW)
    if (subPos === 'LW' || subPos === 'RW') {
      // Baseline Winger: Reduced scoring tendency to ~half ST baseline modifier,
      // increased assist tendency to ~twice ST baseline assist modifier.
      let baseGoalChance = 0.36;
      let baseAssistChance = 0.42;
      let goalMult = 1.0;
      let assistMult = 1.0;
      let multiGoal = 0.20;
      let multiAssist = 0.22;
      let desc = 'Winger Baseline';

      if (style.includes('traditional')) {
        goalMult = 0.84; // Small decrease to goals
        assistMult = 1.25; // Moderate increase to assists
        desc = 'Traditional Winger: Wide crossing & playmaking';
      } else if (style.includes('inverted')) {
        goalMult = 1.20; // Moderate increase to goals
        assistMult = 1.08; // Small increase to assists
        multiGoal = 0.24;
        desc = 'Inverted Winger: Cutting inside to score & create';
      } else if (style.includes('prolific')) {
        goalMult = 1.35; // Strongest winger goal modifier
        assistMult = 1.12; // Small-to-moderate assist modifier
        multiGoal = 0.28;
        desc = 'Prolific Winger: Goal-scoring wide threat';
      } else if (style.includes('pressing')) {
        goalMult = 0.88; // Small decrease to goals
        assistMult = 1.10; // Small increase to assists
        desc = 'Pressing Winger: High work-rate chance creation';
      }

      return {
        baseGoalChance,
        baseAssistChance,
        goalChanceMultiplier: goalMult,
        assistChanceMultiplier: assistMult,
        multiGoalChance: multiGoal,
        multiAssistChance: multiAssist,
        description: desc,
      };
    }
  }

  // 2. MIDFIELDER (MID)
  if (primaryPos === 'MID') {
    // CAM / Central Attacking Midfielder
    if (subPos === 'CAM') {
      // Baseline CAM: Similar attacking output range to wingers
      let baseGoalChance = 0.34;
      let baseAssistChance = 0.45;
      let goalMult = 1.0;
      let assistMult = 1.0;
      let multiGoal = 0.18;
      let multiAssist = 0.24;
      let desc = 'CAM Baseline';

      if (style.includes('creator')) {
        goalMult = 0.85; // Decrease goals slightly
        assistMult = 1.25; // Increase assists moderately
        multiAssist = 0.30;
        desc = 'Creator CAM: Vision & playmaking maestro';
      } else if (style.includes('shadow')) {
        // Shadow CAM should trend toward more goals than assists
        goalMult = 1.32; // Increase goals moderately
        assistMult = 0.82; // Slightly reduce assists
        multiGoal = 0.26;
        desc = 'Shadow CAM: Arriving from deep to score';
      } else if (style.includes('classic n10') || style.includes('n10') || style.includes('classic')) {
        goalMult = 1.08; // Small increase to goals
        assistMult = 1.20; // Moderate increase to assists
        desc = 'Classic N10 CAM: Pure creative controller';
      } else if (style.includes('engine')) {
        goalMult = 1.10; // Small increase to both goals and assists
        assistMult = 1.10;
        desc = 'Engine CAM: Dynamic all-pitch threat';
      }

      return {
        baseGoalChance,
        baseAssistChance,
        goalChanceMultiplier: goalMult,
        assistChanceMultiplier: assistMult,
        multiGoalChance: multiGoal,
        multiAssistChance: multiAssist,
        description: desc,
      };
    }

    // CM / Central Midfielder (or LM / RM)
    if (subPos === 'CM' || subPos === 'LM' || subPos === 'RM') {
      // Baseline CM: Lower scoring than CAM/wingers, moderate assists
      let baseGoalChance = 0.20;
      let baseAssistChance = 0.32;
      let goalMult = 1.0;
      let assistMult = 1.0;
      let multiGoal = 0.14;
      let multiAssist = 0.18;
      let desc = 'CM Baseline';

      if (style.includes('box-to-box') || style.includes('box to box')) {
        goalMult = 1.20; // Small increase to goals
        assistMult = 1.15; // Small increase to assists
        desc = 'Box-to-Box CM: Presence in both penalty boxes';
      } else if (style.includes('maestro')) {
        goalMult = 0.78; // Decrease goals slightly
        assistMult = 1.28; // Increase assists moderately
        multiAssist = 0.24;
        desc = 'Maestro CM: Rhythm & tempo controller';
      } else if (style.includes('runner')) {
        // Runner CM should noticeably score more than normal CM
        goalMult = 1.45; // Moderate increase to goals
        assistMult = 1.10; // Small increase to assists
        multiGoal = 0.20;
        desc = 'Runner CM: High-frequency late box arrivals';
      }

      return {
        baseGoalChance,
        baseAssistChance,
        goalChanceMultiplier: goalMult,
        assistChanceMultiplier: assistMult,
        multiGoalChance: multiGoal,
        multiAssistChance: multiAssist,
        description: desc,
      };
    }

    // CDM / Central Defensive Midfielder
    if (subPos === 'CDM') {
      // Baseline CDM: Mid-low scoring, low assist probability
      let baseGoalChance = 0.11;
      let baseAssistChance = 0.18;
      let goalMult = 1.0;
      let assistMult = 1.0;
      let multiGoal = 0.08;
      let multiAssist = 0.10;
      let desc = 'CDM Baseline';

      if (style.includes('enforcer')) {
        goalMult = 0.75; // Slight decrease to goals
        assistMult = 0.85; // Keep assists low
        desc = 'Enforcer CDM: Physical shielding & ball winner';
      } else if (style.includes('anchor')) {
        goalMult = 0.75; // Slight decrease to goals
        assistMult = 1.25; // Small increase to assists through buildup
        desc = 'Anchor CDM: Deep distribution & build-up';
      }

      return {
        baseGoalChance,
        baseAssistChance,
        goalChanceMultiplier: goalMult,
        assistChanceMultiplier: assistMult,
        multiGoalChance: multiGoal,
        multiAssistChance: multiAssist,
        description: desc,
      };
    }
  }

  // 3. DEFENDER (DEF)
  if (primaryPos === 'DEF') {
    // FB / Fullbacks (LB, RB, LWB, RWB)
    if (['LB', 'RB', 'LWB', 'RWB'].includes(subPos)) {
      // Baseline FB: Low scoring probability, moderate assist probability
      let baseGoalChance = 0.07;
      let baseAssistChance = 0.24;
      let goalMult = 1.0;
      let assistMult = 1.0;
      let multiGoal = 0.05;
      let multiAssist = 0.12;
      let desc = 'Fullback Baseline';

      if (style.includes('defensive')) {
        goalMult = 0.65; // Decrease goals slightly
        assistMult = 0.75; // Keep assists low
        desc = 'Defensive FB: Wing lockdown & staying back';
      } else if (style.includes('inverted')) {
        goalMult = 1.25; // Small increase to goals
        assistMult = 1.18; // Small increase to assists
        desc = 'Inverted FB: Underlapping & central midfield support';
      } else if (style.includes('attacker')) {
        // Attacking fullbacks clearly contribute more offensively
        goalMult = 1.65; // Increase goals moderately
        assistMult = 1.45; // Increase assists moderately
        desc = 'Attacking FB: Overlapping winger-like output';
      } else if (style.includes('balanced')) {
        goalMult = 1.05; // Small increase to both compared with Defensive
        assistMult = 1.08;
        desc = 'Balanced FB: Disciplined transition play';
      }

      return {
        baseGoalChance,
        baseAssistChance,
        goalChanceMultiplier: goalMult,
        assistChanceMultiplier: assistMult,
        multiGoalChance: multiGoal,
        multiAssistChance: multiAssist,
        description: desc,
      };
    }

    // CB / Center Back
    if (subPos === 'CB' || primaryPos === 'DEF') {
      // Baseline CB: Moderate possibility of scoring through set pieces, low assist probability
      let baseGoalChance = 0.10;
      let baseAssistChance = 0.07;
      let goalMult = 1.0;
      let assistMult = 1.0;
      let multiGoal = 0.05;
      let multiAssist = 0.05;
      let desc = 'Center Back Baseline';

      if (style.includes('destroyer')) {
        goalMult = 1.25; // Slight increase to goals through defensive set pieces
        assistMult = 0.60; // Keep assists very low
        desc = 'Destroyer CB: Aggressive aerial set-piece threat';
      } else if (style.includes('distributor')) {
        goalMult = 0.75; // Keep goals low
        assistMult = 1.50; // Small increase to assists
        desc = 'Distributor CB: Calm long-range passing & build-up';
      } else if (style.includes('playmaker')) {
        // Playmaker CB is the most assist-oriented CB
        goalMult = 1.15; // Small increase to goals
        assistMult = 2.10; // Moderate increase to assists
        desc = 'Playmaker CB: Deep ball progression & assists';
      } else if (style.includes('stopper')) {
        goalMult = 1.35; // Small increase to goals through set pieces
        assistMult = 0.60; // Keep assists low
        desc = 'Stopper CB: Set-piece header specialist';
      }

      return {
        baseGoalChance,
        baseAssistChance,
        goalChanceMultiplier: goalMult,
        assistChanceMultiplier: assistMult,
        multiGoalChance: multiGoal,
        multiAssistChance: multiAssist,
        description: desc,
      };
    }
  }

  // 4. GOALKEEPER (GK)
  if (primaryPos === 'GK' || subPos === 'GK') {
    // Baseline GK: Extremely low attacking probabilities
    let baseGoalChance = 0.002;
    let baseAssistChance = 0.015;
    let goalMult = 1.0;
    let assistMult = 1.0;
    let desc = 'Goalkeeper Baseline';

    if (style.includes('sweeper')) {
      goalMult = 1.0; // No meaningful goal increase
      assistMult = 1.85; // Small increase to assist prob through distribution
      desc = 'Sweeper GK: Long distribution counter-attack assists';
    } else if (style.includes('wall')) {
      goalMult = 0.5; // Slightly decrease attacking contribution
      assistMult = 0.5;
      desc = 'Wall GK: Pure shot-stopping focus';
    }

    return {
      baseGoalChance,
      baseAssistChance,
      goalChanceMultiplier: goalMult,
      assistChanceMultiplier: assistMult,
      multiGoalChance: 0.0,
      multiAssistChance: 0.0,
      description: desc,
    };
  }

  // General Fallback
  return {
    baseGoalChance: 0.25,
    baseAssistChance: 0.25,
    goalChanceMultiplier: 1.0,
    assistChanceMultiplier: 1.0,
    multiGoalChance: 0.15,
    multiAssistChance: 0.15,
    description: 'Standard Fallback',
  };
}

import { simulateTacticalMatchScoring, TacticalChanceResult } from './tacticalChanceSystem';

/**
 * Executes a simulated match roll for goals and assists based on player config, performance factor, team score,
 * and team tactical strategy with weak foot mechanics.
 */
export function simulatePlayerGoalsAndAssists(
  player: PlayerConfig,
  perfFactor: number,
  playerTeamScore: number,
  options?: {
    teamStrategy?: string;
    minutesPlayed?: number;
    opponentOvr?: number;
  }
): { playerGoals: number; playerAssists: number; chanceEvents?: TacticalChanceResult[] } {
  // If team strategy / match context is available, use the detailed tactical chance engine
  if (options?.teamStrategy || (player as any).teamStrategy || player.playStyle) {
    const tacticalSim = simulateTacticalMatchScoring(
      player,
      options?.teamStrategy || (player as any).teamStrategy,
      perfFactor,
      playerTeamScore,
      options?.minutesPlayed || 90,
      options?.opponentOvr || 75
    );
    return tacticalSim;
  }

  const pStyle = player.playStyle || (player as any).playstyle || '';
  const mods = getGoalAssistModifiers(player.position, player.subPosition, pStyle);

  // Final probabilities (bounded safely)
  const finalGoalProb = Math.min(0.95, Math.max(0.001, mods.baseGoalChance * perfFactor * mods.goalChanceMultiplier));
  const finalAssistProb = Math.min(0.95, Math.max(0.001, mods.baseAssistChance * perfFactor * mods.assistChanceMultiplier));

  let playerGoals = 0;
  let playerAssists = 0;

  // Roll Goal
  if (Math.random() < finalGoalProb) {
    if (Math.random() < mods.multiGoalChance) {
      playerGoals = Math.random() < 0.15 ? 3 : 2;
    } else {
      playerGoals = 1;
    }
  }

  // Roll Assist
  if (Math.random() < finalAssistProb) {
    if (Math.random() < mods.multiAssistChance) {
      playerAssists = 2;
    } else {
      playerAssists = 1;
    }
  }

  // Ensure goals do not exceed team score unless team scored 0 and player scored
  playerGoals = Math.min(playerGoals, Math.max(1, playerTeamScore));

  return {
    playerGoals,
    playerAssists,
  };
}

