import { PlayerConfig } from '../types';
import {
  KeyMomentEvent,
  KeyMomentType,
  QTEActionType,
  QTEResultOutcome,
  QTEResultQuality,
  QTEZoneHit,
  QTETimingFeedback,
  FootballSpecificOutcome,
  MatchCommentaryLog,
  MatchMvpStatus,
  KeyMatchFinalSummary,
} from '../types/keyMatch';
import { audioManager } from './audioSystem';
import { DUEL_DEFINITIONS, calculateDuelMatchup, DuelTypeDefinition } from './duelSystem';

// Web Audio API Sound Synthesizer for Immersive Match Sounds (Integrated with AudioEngine)
class MatchSoundSynth {
  playWhistle() {
    audioManager.playWhistle();
  }

  playCrowdRoar() {
    audioManager.playCrowdRoar();
  }

  playKickSound() {
    audioManager.playKickSound();
  }

  playSuccessChime() {
    audioManager.playSuccessChime();
  }

  playFailBuzz() {
    audioManager.playFailBuzz();
  }
}

export const matchAudio = new MatchSoundSynth();

/**
 * Generates initial Key Moments for a Key Match tailored dynamically to player involvement,
 * position, OVR, playstyle, opponent quality, and match drama
 */
export function generateKeyMomentsForMatch(
  player: PlayerConfig,
  stageTitle: string = 'Key Match',
  opponentName: string = 'Opponent',
  opponentOvr: number = 70
): KeyMomentEvent[] {
  const pos = player.position || 'ATT';
  const ovr = player.ovr || 65;
  const isHighStakes =
    stageTitle.toLowerCase().includes('final') ||
    stageTitle.toLowerCase().includes('semi') ||
    stageTitle.toLowerCase().includes('derby') ||
    stageTitle.toLowerCase().includes('knockout') ||
    stageTitle.toLowerCase().includes('playoff') ||
    stageTitle.toLowerCase().includes('title');

  const createDuelMoment = (
    id: string,
    minute: number,
    duelId: string,
    actionType: QTEActionType,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CLUTCH',
    titleOverride?: string,
    descOverride?: string
  ): KeyMomentEvent => {
    const def = DUEL_DEFINITIONS[duelId];
    const matchup = def ? calculateDuelMatchup(player, def, stageTitle, opponentName, opponentOvr) : undefined;
    const momentType =
      def?.category === 'DEFENDING'
        ? 'DEFENDING_DUEL'
        : def?.category === 'CREATION'
        ? 'CREATION_DUEL'
        : def?.category === 'GOALSCORING'
        ? 'GOALSCORING_DUEL'
        : 'ONE_ON_ONE_DRIBBLE';

    return {
      id,
      minute,
      title: titleOverride || def?.name || 'Key Match Duel',
      description: descOverride || def?.description || 'Crucial in-match 1v1 contest.',
      actionType,
      momentType,
      relevantAttribute: def?.userStat || 'dribbling',
      difficulty,
      duelId,
      duelMatchup: matchup,
      stageTwoDuelId: def?.stageTwoDuelId,
    };
  };

  // Determine moment count based on player involvement, quality, and match importance (strictly capped at max 5 moments)
  let momentCount = 4;
  if (ovr >= 78 || isHighStakes) {
    momentCount = Math.random() < 0.6 ? 5 : 4;
  } else if (ovr < 60) {
    momentCount = Math.random() < 0.5 ? 3 : 4;
  }
  momentCount = Math.min(5, Math.max(3, momentCount));

  // Generate dynamically spaced minutes (non-fixed intervals, organic spacing)
  // First half: 1 to 2 moments (e.g. 10'-24' early pressure, 35'-44' approaching halftime)
  // Second half: 2 to 3 moments (e.g. 52'-63' tactical battle, 67'-78' push, 82'-89' late clutch drama)
  const generatedMinutes: number[] = [];
  const firstHalfCount = momentCount >= 5 ? 2 : (Math.random() < 0.5 ? 1 : 2);
  const secondHalfCount = momentCount - firstHalfCount;

  // First half minutes
  if (firstHalfCount === 1) {
    // Single moment in first half, either early spark or approaching halftime
    const m = Math.random() < 0.5
      ? Math.floor(Math.random() * 12) + 12 // 12' - 23'
      : Math.floor(Math.random() * 10) + 34; // 34' - 43'
    generatedMinutes.push(m);
  } else {
    // Two moments in first half
    const m1 = Math.floor(Math.random() * 12) + 10; // 10' - 21'
    const m2 = Math.floor(Math.random() * 11) + 34; // 34' - 44'
    generatedMinutes.push(m1, m2);
  }

  // Second half minutes (with possibility of organic clusters)
  if (secondHalfCount === 2) {
    const m3 = Math.floor(Math.random() * 14) + 52; // 52' - 65'
    const m4 = Math.floor(Math.random() * 8) + 82;  // 82' - 89' (late drama)
    generatedMinutes.push(m3, m4);
  } else {
    // 3 moments in second half (may have a tight cluster like 68' and 73')
    const m3 = Math.floor(Math.random() * 10) + 50; // 50' - 59'
    const hasCluster = Math.random() < 0.45;
    const m4 = hasCluster ? m3 + Math.floor(Math.random() * 4) + 5 : Math.floor(Math.random() * 9) + 68; // 68' - 76'
    const m5 = Math.floor(Math.random() * 8) + 82;  // 82' - 89' (late clutch)
    generatedMinutes.push(m3, Math.min(80, m4), m5);
  }

  // Sort minutes in ascending order, remove duplicates, strictly slice to maximum 5
  const uniqueMinutes = Array.from(new Set(generatedMinutes)).sort((a, b) => a - b).slice(0, 5);

  const moments: KeyMomentEvent[] = [];

  // Tailor moments according to position, player stats, and match drama
  if (pos === 'ATT') {
    uniqueMinutes.forEach((min, idx) => {
      const isLateClutch = min >= 80;
      const isHalftimeApproaching = min >= 35 && min <= 45;
      const difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CLUTCH' =
        isLateClutch || isHighStakes ? 'CLUTCH' : idx === 0 ? 'EASY' : 'MEDIUM';

      if (isLateClutch) {
        // Late clutch box breakthrough or penalty
        const isPenalty = Math.random() < 0.35;
        if (isPenalty) {
          moments.push({
            id: `km-att-${min}`,
            minute: min,
            title: isHighStakes ? 'Clutch Late Penalty Spot-Kick' : 'Decisive Match-Winning Penalty',
            description: 'Fouled inside the box under immense late pressure! Step up to the spot and beat the keeper.',
            actionType: 'PENALTY',
            momentType: 'PENALTY_KICK',
            relevantAttribute: 'shooting',
            difficulty: 'CLUTCH',
          });
        } else {
          moments.push(
            createDuelMoment(
              `km-att-${min}`,
              min,
              'GOAL_SHOOTING_VS_GK',
              'SHOOT',
              difficulty,
              'Decisive Match Finishing Duel (Shooting ↔️ Goalkeeper)',
              'Late box breakthrough! Test your clinical shooting composure against the opposing goalkeeper!'
            )
          );
        }
      } else if (isHalftimeApproaching) {
        moments.push(
          createDuelMoment(
            `km-att-${min}`,
            min,
            'CRE_SHORTPASS_VS_INTERCEPTIONS',
            'PASS',
            difficulty,
            'Approaching Halftime Through-Ball (Short Pass ↔️ Interceptions)',
            'Winger cuts inside into space. Thread a needle pass through the backline before the halftime whistle!'
          )
        );
      } else if (idx === 0) {
        moments.push(
          createDuelMoment(
            `km-att-${min}`,
            min,
            'CRE_DRIBBLING_VS_TACKLING',
            'DRIBBLE',
            difficulty,
            '1-on-1 Take-On Duel (Dribbling ↔️ Tackling)',
            'You isolate the fullback on the edge of the box. Use quick feet and burst of pace to beat their tackle!'
          )
        );
      } else if (idx % 2 === 1) {
        moments.push(
          createDuelMoment(
            `km-att-${min}`,
            min,
            'GOAL_LONGSHOTS_VS_TACKLING',
            'SHOOT',
            difficulty,
            'Long-Range Cannon Duel (Long Shots ↔️ Tackling)',
            'Space opens up 22 yards out! Uncork a venomous strike before the closing defender can block.'
          )
        );
      } else {
        moments.push(
          createDuelMoment(
            `km-att-${min}`,
            min,
            'GOAL_HEADING_VS_STRENGTH',
            'HEADER',
            difficulty,
            'Box Header Duel (Heading ↔️ Strength)',
            'Whipped cross floats toward the penalty spot! Outmuscle the center-back and power a header on goal.'
          )
        );
      }
    });
  } else if (pos === 'MID') {
    uniqueMinutes.forEach((min, idx) => {
      const isLateClutch = min >= 80;
      const isHalftimeApproaching = min >= 35 && min <= 45;
      const difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CLUTCH' =
        isLateClutch || isHighStakes ? 'CLUTCH' : idx === 0 ? 'EASY' : 'MEDIUM';

      if (isLateClutch) {
        moments.push(
          createDuelMoment(
            `km-mid-${min}`,
            min,
            'GOAL_LONGSHOTS_VS_GK',
            'SHOOT',
            'CLUTCH',
            'Late Arriving Strike Duel (Long Shots ↔️ Goalkeeper)',
            'Rebound spills out to the D-arc! Arrive late and strike cleanly with full power past the goalkeeper.'
          )
        );
      } else if (isHalftimeApproaching) {
        moments.push(
          createDuelMoment(
            `km-mid-${min}`,
            min,
            'CRE_SHORTPASS_VS_INTERCEPTIONS',
            'PASS',
            difficulty,
            'Laser Through-Pass Duel (Short Pass ↔️ Interceptions)',
            'Striker makes an overlapping blindside run. Thread a laser pass through the narrow defensive corridor!'
          )
        );
      } else if (idx === 0) {
        moments.push(
          createDuelMoment(
            `km-mid-${min}`,
            min,
            'DEF_SHORTPASS_VS_INTERCEPTIONS',
            'INTERCEPTION',
            difficulty,
            'Midfield Interception Duel (Short Pass ↔️ Interceptions)',
            'Opponent playmaker attempts a pass into the final third. Read the passing lane and intercept!'
          )
        );
      } else {
        moments.push(
          createDuelMoment(
            `km-mid-${min}`,
            min,
            'DEF_DRIBBLING_VS_TACKLING',
            'TACKLE',
            difficulty,
            'Clutch Pressing Recovery Duel (Dribbling ↔️ Tackling)',
            'High press in the middle third! Execute a clean tackle to dispossess the opponent attacker.'
          )
        );
      }
    });
  } else if (pos === 'DEF') {
    uniqueMinutes.forEach((min, idx) => {
      const isLateClutch = min >= 80;
      const difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CLUTCH' =
        isLateClutch || isHighStakes ? 'CLUTCH' : idx === 0 ? 'EASY' : 'HARD';

      if (isLateClutch) {
        moments.push(
          createDuelMoment(
            `km-def-${min}`,
            min,
            'DEF_DRIBBLING_VS_TACKLING',
            'TACKLE',
            'CLUTCH',
            'Goal-Saving Last-Man Tackle Duel (Dribbling ↔️ Tackling)',
            'Desperate late counterattack! Put your body on the line with a perfectly timed slide tackle to save the match!'
          )
        );
      } else if (idx === 0) {
        moments.push(
          createDuelMoment(
            `km-def-${min}`,
            min,
            'DEF_CROSSING_VS_INTERCEPTIONS',
            'INTERCEPTION',
            difficulty,
            'Box Clearance Duel (Crossing ↔️ Interceptions)',
            'Dangerous whipped cross into the 6-yard box! Read the trajectory and clear the danger cleanly.'
          )
        );
      } else if (idx % 2 === 1) {
        moments.push(
          createDuelMoment(
            `km-def-${min}`,
            min,
            'CRE_LONGPASS_VS_MARKING',
            'PASS',
            difficulty,
            'Escape Build-Up Long Pass (Long Pass ↔️ Marking)',
            'Pressed deep against your own goal-line. Pick out your target forward with a pinpoint long pass!'
          )
        );
      } else {
        moments.push(
          createDuelMoment(
            `km-def-${min}`,
            min,
            'GOAL_HEADING_VS_STRENGTH',
            'HEADER',
            difficulty,
            'Set-Piece Header Contest (Heading ↔️ Strength)',
            'Attacking corner delivery! Rise above the defense to contest the aerial duel.'
          )
        );
      }
    });
  } else {
    // Goalkeeper
    uniqueMinutes.forEach((min, idx) => {
      const isLateClutch = min >= 80;
      const difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CLUTCH' =
        isLateClutch || isHighStakes ? 'CLUTCH' : idx === 0 ? 'EASY' : 'HARD';

      if (isLateClutch) {
        moments.push(
          createDuelMoment(
            `km-gk-${min}`,
            min,
            'DEF_HEADING_VS_STRENGTH',
            'SAVE',
            'CLUTCH',
            'Corner Kick Aerial Claim (Strength ↔️ Heading)',
            'Crowded injury-time box! Burst through the traffic to command your penalty box and punch/catch the ball!'
          )
        );
      } else if (idx === 0) {
        moments.push(
          createDuelMoment(
            `km-gk-${min}`,
            min,
            'DEF_BALLCONTROL_VS_REACTION',
            'SAVE',
            difficulty,
            'Close-Range Reflex Save (Reaction ↔️ Shot)',
            'Deflected rocket from 8 yards out! React instinctively to tip it over the crossbar.'
          )
        );
      } else if (idx % 2 === 1) {
        moments.push(
          createDuelMoment(
            `km-gk-${min}`,
            min,
            'DEF_DRIBBLING_VS_TACKLING',
            'SAVE',
            difficulty,
            '1-on-1 Smother Save (Reaction ↔️ Dribble)',
            'Attacker breaks through the defensive offside trap! Rush out and smother the ball bravely at their feet.'
          )
        );
      } else {
        moments.push(
          createDuelMoment(
            `km-gk-${min}`,
            min,
            'GOAL_LONGSHOTS_VS_GK',
            'SAVE',
            difficulty,
            'Long-Range Diving Parry (Goalkeeper ↔️ Long Shots)',
            'Curling shot dipping toward the top corner! Full extension horizontal leap to push it wide.'
          )
        );
      }
    });
  }

  return moments.slice(0, 5);
}

/**
 * Generates Clutch Time moments (1 to 3 QTE events) past the 85th minute if match is a draw.
 * Clutch Time events award 25% more points to rating.
 */
export function generateClutchTimeMoments(
  player: PlayerConfig,
  stageTitle: string = 'Key Match',
  opponentName: string = 'Opponent',
  opponentOvr: number = 70,
  count: number = 2
): KeyMomentEvent[] {
  const pos = (player.position || 'ATT').toUpperCase();
  const numMoments = Math.min(3, Math.max(1, count));
  const candidateMinutes = [86, 88, 90].slice(0, numMoments);

  const defShoot = DUEL_DEFINITIONS['GOAL_SHOOTING_VS_GK'];
  const defTackle = DUEL_DEFINITIONS['DEF_DRIBBLING_VS_TACKLING'];
  const defDuel = pos === 'DEF' ? defTackle : defShoot;
  const matchup = defDuel ? calculateDuelMatchup(player, defDuel, stageTitle, opponentName, opponentOvr) : undefined;

  return candidateMinutes.map((minute, idx) => {
    let actionType: QTEActionType = 'SHOOT';
    let momentType: KeyMomentType = 'LATE_DECISIVE_STRIKE';
    let relevantAttr = 'shooting';

    if (pos === 'GK') {
      actionType = 'SAVE';
      momentType = 'CLOSE_REFLEX_SAVE';
      relevantAttr = 'goalkeeper';
    } else if (pos === 'DEF') {
      actionType = idx % 2 === 0 ? 'TACKLE' : 'HEADER';
      momentType = idx % 2 === 0 ? 'LAST_MAN_TACKLE' : 'CRUCIAL_CLEARANCE';
      relevantAttr = 'defending';
    } else if (pos === 'MID') {
      actionType = idx % 2 === 0 ? 'PASS' : 'SHOOT';
      momentType = idx % 2 === 0 ? 'THROUGH_BALL_PASS' : 'LATE_DECISIVE_STRIKE';
      relevantAttr = idx % 2 === 0 ? 'passing' : 'shooting';
    }

    return {
      id: `km-clutch-${minute}-${idx}-${Date.now()}`,
      minute,
      title: `🔥 CLUTCH TIME: ${actionType === 'SHOOT' ? 'Decisive Winner Strike' : actionType === 'SAVE' ? 'Heroic Last-Gasp Save' : actionType === 'PASS' ? 'Killer Decisive Through-Ball' : 'Critical Last-Ditch Challenge'}`,
      description: `Scores tied at ${minute}'! High-stakes Clutch Time opportunity (+25% Rating Points Bonus)!`,
      actionType,
      momentType,
      relevantAttribute: relevantAttr,
      difficulty: 'CLUTCH',
      duelMatchup: matchup,
      isClutchTime: true,
    };
  });
}

/**
 * Generates 1 to 3 QTE events per half of Extra Time for knockout matches
 */
export function generateExtraTimeHalfMoments(
  player: PlayerConfig,
  half: 1 | 2,
  stageTitle: string = 'Key Match Extra Time',
  opponentName: string = 'Opponent',
  opponentOvr: number = 70,
  count: number = 2
): KeyMomentEvent[] {
  const pos = (player.position || 'ATT').toUpperCase();
  const numMoments = Math.min(3, Math.max(1, count));
  const candidateMinutes = half === 1 ? [95, 100, 104].slice(0, numMoments) : [110, 114, 118].slice(0, numMoments);

  const defShoot = DUEL_DEFINITIONS['GOAL_SHOOTING_VS_GK'];
  const defTackle = DUEL_DEFINITIONS['DEF_DRIBBLING_VS_TACKLING'];
  const defDuel = pos === 'DEF' ? defTackle : defShoot;
  const matchup = defDuel ? calculateDuelMatchup(player, defDuel, stageTitle, opponentName, opponentOvr) : undefined;

  return candidateMinutes.map((minute, idx) => {
    let actionType: QTEActionType = 'SHOOT';
    let momentType: KeyMomentType = 'LATE_DECISIVE_STRIKE';
    let relevantAttr = 'shooting';

    if (pos === 'GK') {
      actionType = 'SAVE';
      momentType = 'CLOSE_REFLEX_SAVE';
      relevantAttr = 'goalkeeper';
    } else if (pos === 'DEF') {
      actionType = idx % 2 === 0 ? 'TACKLE' : 'CLEARANCE';
      momentType = idx % 2 === 0 ? 'LAST_MAN_TACKLE' : 'CRUCIAL_CLEARANCE';
      relevantAttr = 'defending';
    } else if (pos === 'MID') {
      actionType = idx % 2 === 0 ? 'PASS' : 'SHOOT';
      momentType = idx % 2 === 0 ? 'THROUGH_BALL_PASS' : 'LONG_SHOT';
      relevantAttr = idx % 2 === 0 ? 'passing' : 'shooting';
    }

    return {
      id: `km-et-h${half}-${minute}-${idx}-${Date.now()}`,
      minute,
      title: `⏱️ ET HALF ${half}: ${actionType === 'SHOOT' ? 'Extra-Time Breakthrough Strike' : actionType === 'SAVE' ? 'Crucial Extra-Time Reflex' : 'Decisive Extra-Time Play'}`,
      description: `Extra Time ${half === 1 ? '1st' : '2nd'} Half (${minute}')! Extreme fatigue and nerves testing both sides.`,
      actionType,
      momentType,
      relevantAttribute: relevantAttr,
      difficulty: 'CLUTCH',
      duelMatchup: matchup,
      isExtraTimeMoment: true,
    };
  });
}

/**
 * Generates dynamic Extra Time Key Moments when match extends past 90'
 */
export function generateExtraTimeMoments(
  player: PlayerConfig,
  stageTitle: string = 'Key Match Extra Time',
  opponentName: string = 'Opponent',
  opponentOvr: number = 70
): KeyMomentEvent[] {
  return generateExtraTimeHalfMoments(player, 1, stageTitle, opponentName, opponentOvr, 2);
}

/**
 * Gets match importance configuration (zone widths and constant arrow speed) based on stage title and moment
 * Automatically applies Duel Advantage / Disadvantage zone scaling
 */
export function getMatchImportanceConfig(stageTitle: string, moment?: KeyMomentEvent) {
  const isFinal = stageTitle.toLowerCase().includes('final') && !stageTitle.toLowerCase().includes('semi');
  const isSemi = stageTitle.toLowerCase().includes('semi');
  const isClutch = moment?.difficulty === 'CLUTCH';
  const isHard = moment?.difficulty === 'HARD';

  let blueWidth = 2.5; // Small fixed blue line in center (100% Success)
  let greenWidth = 12.0; // Green Zone (80% Success)
  let orangeWidth = 28.0; // Orange Zone (60% Success, Orange >= 2x Green)
  let importanceName = 'REGULAR MATCH MOMENT';
  let description = 'Standard Timing Zones (Blue / Green / Orange)';

  if (isFinal || isClutch) {
    importanceName = 'HIGH PRESSURE (FINAL / CLUTCH)';
    blueWidth = 2.0;
    greenWidth = 8.0;
    orangeWidth = 20.0; // 20 >= 2 * 8
    description = 'Tight Zones (High Difficulty)';
  } else if (isSemi || isHard) {
    importanceName = 'HIGH PRESSURE (SEMI-FINAL)';
    blueWidth = 2.2;
    greenWidth = 10.0;
    orangeWidth = 24.0; // 24 >= 2 * 10
    description = 'Narrowed Success Zones';
  } else {
    // Easy / Regular
    blueWidth = 3.0;
    greenWidth = 16.0;
    orangeWidth = 36.0; // 36 >= 2 * 16
    description = 'Standard Timing Zones';
  }

  // Apply Duel Advantage Scaling if this is a duel moment
  let duelMultiplier = 1.0;
  if (moment?.duelMatchup) {
    duelMultiplier = moment.duelMatchup.zoneMultiplier;
    blueWidth = Math.max(1.5, Math.min(6.0, parseFloat((blueWidth * duelMultiplier).toFixed(2))));
    greenWidth = Math.max(6.0, Math.min(28.0, parseFloat((greenWidth * duelMultiplier).toFixed(2))));
    orangeWidth = Math.max(16.0, Math.min(56.0, parseFloat((orangeWidth * duelMultiplier).toFixed(2))));

    const matchup = moment.duelMatchup;
    description = `Duel: ${matchup.duelDef.userStatLabel} (${matchup.userEffectiveScore}) vs ${matchup.opponent.statLabel} (${matchup.oppEffectiveScore}) • ${matchup.advantageLabel}`;
  }

  // IMPORTANT: Arrow speed is strictly CONSTANT across all difficulties per prompt requirements!
  const constantSpeed = 2.5;

  return {
    importanceName,
    blueWidth,
    greenWidth,
    orangeWidth,
    constantSpeed,
    speedMultiplier: 1.0, // Always constant speed 1.0
    duelMultiplier,
    description,
  };
}

/**
 * Evaluates gauge position into Timing Zone:
 * 1. 🔵 BLUE (Center line) — 100% Perfect Execution
 * 2. 🟢 GREEN (Surrounding Blue) — Genuinely Great Action
 * 3. 🟠 ORANGE (Surrounding Green) — Narrow / Scrappy Outcome
 * 4. ⚠️ NORMAL FAILURE (Outside Orange, before extreme edges) — Straightforward Mistake
 * 5. 💀 RED CRITICAL FAILURE (Far left / right extreme edges) — Catastrophic Execution Error
 */
export function calculateGaugeTiming(
  gaugePos: number,
  blueWidth: number = 2.5,
  greenWidth: number = 12.0,
  orangeWidth: number = 28.0
) {
  const center = 50;
  const dist = Math.abs(gaugePos - center);
  const blueHalf = blueWidth / 2;
  const greenHalf = greenWidth / 2;
  const orangeHalf = orangeWidth / 2;
  const isEarly = gaugePos < center;

  // 1. 🔵 BLUE ZONE — 100% PERFECT EXECUTION
  if (dist <= blueHalf) {
    return {
      quality: 'PERFECT' as QTEResultQuality,
      zoneHit: 'BLUE' as const,
      timingFeedback: '🔵 BLUE HIT — 100% PERFECT!' as const,
      precisionPercent: 100,
      successPercent: 100,
    };
  }

  // 2. 🟢 GREEN ZONE — EXCELLENT / GENUINELY GREAT ACTION
  if (dist <= greenHalf) {
    const ratio = (dist - blueHalf) / (greenHalf - blueHalf || 1);
    const prec = Math.round(96 - ratio * 14);
    return {
      quality: 'GOOD' as QTEResultQuality,
      zoneHit: 'GREEN' as const,
      timingFeedback: '🟢 GREEN HIT — EXCELLENT!' as const,
      precisionPercent: prec,
      successPercent: 84,
    };
  }

  // 3. 🟠 ORANGE ZONE — SCRAPPY / UNCERTAIN CONTEST
  if (dist <= orangeHalf) {
    const ratio = (dist - greenHalf) / (orangeHalf - greenHalf || 1);
    const prec = Math.round(75 - ratio * 15);
    return {
      quality: 'WEAK' as QTEResultQuality,
      zoneHit: 'ORANGE' as const,
      timingFeedback: '🟠 ORANGE HIT — SCRAPPY SUCCESS!' as const,
      precisionPercent: prec,
      successPercent: 60,
    };
  }

  // 4. 💀 RED CRITICAL FAILURE (Extreme outer edges: 0-14% and 86-100%)
  if (gaugePos <= 14 || gaugePos >= 86) {
    const edgeDist = isEarly ? gaugePos : 100 - gaugePos;
    const prec = Math.max(0, Math.round(edgeDist * 0.5));
    return {
      quality: (isEarly ? 'TOO_EARLY' : 'TOO_LATE') as QTEResultQuality,
      zoneHit: 'CRITICAL_FAIL' as const,
      timingFeedback: '💀 CRITICAL FAILURE — CATASTROPHIC ERROR!' as const,
      precisionPercent: prec,
      successPercent: 0,
    };
  }

  // 5. ⚠️ NORMAL FAILURE (Area outside orange, before extreme red edges)
  const normDist = dist - orangeHalf;
  const prec = Math.max(10, Math.round(42 - normDist * 1.5));
  return {
    quality: (isEarly ? 'TOO_EARLY' : 'TOO_LATE') as QTEResultQuality,
    zoneHit: 'NORMAL_FAIL' as const,
    timingFeedback: isEarly ? '❌ MISS — TOO EARLY!' : '❌ MISS — TOO LATE!',
    precisionPercent: prec,
    successPercent: 0,
  };
}

/**
 * Calculates outcome of a QTE taking into account the 5 distinct zones:
 * - RED: Catastrophic execution (humorous/embarrassing, severe mistake)
 * - NORMAL FAILURE: Ordinary mistake (straightforward, not over-dramatized)
 * - ORANGE SUCCESS: Scrappy / fortunate success ("not pretty, but it worked")
 * - ORANGE FAILURE: Almost worked, opponent prevented it (credit to opponent)
 * - GREEN SUCCESS: Excellent action (clearly above normal football)
 * - GREEN FAILURE: Nearly brilliant (rare, "nearly genius", tried something exceptional)
 * - BLUE: Perfect execution (rare, extraordinary, "everyone stopped to watch")
 *
 * Player Quality: Does NOT make high-OVR auto-succeed or low-OVR unable to hit Blue.
 * QTE execution is primary; attributes provide subtle organic probability modulation.
 */
export function evaluateQTEOutcome(
  player: PlayerConfig,
  moment: KeyMomentEvent,
  gaugePosOrQuality: number | QTEResultQuality,
  stageTitle: string = 'Key Match'
): QTEResultOutcome {
  const impConfig = getMatchImportanceConfig(stageTitle, moment);
  
  let timingResult;
  if (typeof gaugePosOrQuality === 'number') {
    timingResult = calculateGaugeTiming(
      gaugePosOrQuality,
      impConfig.blueWidth,
      impConfig.greenWidth,
      impConfig.orangeWidth
    );
  } else {
    // Fallback for quality string
    let zone: QTEZoneHit = 'BLUE';
    let prec = 100;
    let sPercent = 100;
    let feed: QTETimingFeedback = '🔵 BLUE HIT — 100% PERFECT!';

    if (gaugePosOrQuality === 'GOOD') {
      zone = 'GREEN';
      prec = 88;
      sPercent = 84;
      feed = '🟢 GREEN HIT — EXCELLENT!';
    } else if (gaugePosOrQuality === 'WEAK') {
      zone = 'ORANGE';
      prec = 68;
      sPercent = 60;
      feed = '🟠 ORANGE HIT — SCRAPPY SUCCESS!';
    } else if (gaugePosOrQuality === 'CRITICAL_FAIL') {
      zone = 'CRITICAL_FAIL';
      prec = 4;
      sPercent = 0;
      feed = '💀 CRITICAL FAILURE — CATASTROPHIC ERROR!';
    } else if (gaugePosOrQuality === 'NORMAL_FAIL') {
      zone = 'NORMAL_FAIL';
      prec = 25;
      sPercent = 0;
      feed = '⚠️ NORMAL FAILURE — MISTIMED ACTION';
    } else {
      zone = 'NORMAL_FAIL';
      prec = 20;
      sPercent = 0;
      feed = gaugePosOrQuality === 'TOO_EARLY' ? '❌ MISS — TOO EARLY!' : '❌ MISS — TOO LATE!';
    }

    timingResult = {
      quality: gaugePosOrQuality,
      zoneHit: zone,
      timingFeedback: feed,
      precisionPercent: prec,
      successPercent: sPercent,
    };
  }

  const { quality, zoneHit, precisionPercent, successPercent } = timingResult;
  let timingFeedback: QTETimingFeedback = timingResult.timingFeedback;

  // Player quality subtle modulation (Rule 8: QTE execution is primary decider)
  const relAttr = moment.relevantAttribute || 'composure';
  const playerStat = (player.stats as any)?.[relAttr] ?? (player as any).overall ?? (player as any).ovr ?? 75;
  const statModifier = ((playerStat - 70) / 100); // between -0.15 and +0.25

  let success = false;
  let performanceTier: 'PERFECT' | 'GOOD' | 'WEAK' | 'FAILED' = 'FAILED';
  let actionQualityTitle = 'Action Executed';
  let commentary = '';
  let duelOutcomeText = '';
  let footballOutcome: FootballSpecificOutcome | undefined;
  const statBonus = {
    goal: false,
    assist: false,
    save: false,
    tackle: false,
    concededGoal: false,
    ratingDelta: 0,
    timingBonus: 0,
    fameDelta: 0,
  };

  const matchup = moment.duelMatchup;
  const oppName = matchup?.opponent.name || 'the opponent';
  const isDefensiveAction =
    moment.actionType === 'SAVE' ||
    moment.actionType === 'TACKLE' ||
    moment.actionType === 'INTERCEPTION' ||
    moment.actionType === 'CLEARANCE' ||
    moment.momentType === 'DEFENDING_DUEL' ||
    moment.momentType === 'ONE_ON_ONE_SAVE' ||
    moment.momentType === 'CLOSE_REFLEX_SAVE' ||
    moment.momentType === 'LONG_RANGE_PARRY' ||
    moment.momentType === 'PENALTY_SAVE' ||
    moment.momentType === 'LAST_MAN_TACKLE' ||
    moment.momentType === 'KEY_INTERCEPTION' ||
    moment.momentType === 'CRUCIAL_CLEARANCE' ||
    moment.momentType === 'BOX_PRESSING';

  // ==========================================
  // 1. 🔵 BLUE ZONE — PERFECT EXECUTION (+0.25 bonus or +0.50 on defensive)
  // ==========================================
  if (zoneHit === 'BLUE') {
    success = true;
    performanceTier = 'PERFECT';
    timingFeedback = '🔵 BLUE HIT — 100% PERFECT!';
    matchAudio.playSuccessChime();
    matchAudio.playCrowdRoar();

    if (isDefensiveAction) {
      statBonus.timingBonus = 0.5;
      if (moment.actionType === 'SAVE') {
        actionQualityTitle = '🔵 MIRACULOUS GOALLINE SAVE';
        commentary = `MIRACULOUS SAVE! Cat-like aerial reflexes claw ${oppName}'s rocket off the goal line when everyone had already started celebrating! (+0.50 Defensive Timing Bonus)`;
        duelOutcomeText = `Heroic Save`;
        statBonus.save = true;
        statBonus.ratingDelta = 1.0; // 0.50 base save + 0.50 timing bonus
        footballOutcome = 'SAVE';
      } else {
        actionQualityTitle = '🔵 WORLD-CLASS SLIDING CHALLENGE';
        commentary = `WORLD-CLASS TACKLE! Impeccable timing! Glides in to cleanly pick ${oppName}'s pocket without a whisper of a foul, instantly turning defense into an attack! (+0.50 Defensive Timing Bonus)`;
        duelOutcomeText = `Flawless Duel Won`;
        statBonus.tackle = true;
        statBonus.ratingDelta = 1.0; // 0.50 base tackle + 0.50 timing bonus
        footballOutcome = 'CLEAN_POSSESSION';
      }
    } else {
      statBonus.timingBonus = 0.25;
      if (moment.actionType === 'SHOOT' || moment.actionType === 'HEADER' || moment.momentType === 'BOX_FINISHING' || moment.momentType === 'LATE_DECISIVE_STRIKE' || moment.momentType === 'GOALSCORING_DUEL') {
        actionQualityTitle = '🔵 UNSTOPPABLE WORLD-CLASS FINISH';
        commentary = matchup
          ? `LEGENDARY FINISH! Perfect Blue hit! Your ${matchup.duelDef.userStatLabel} unleashes an impossible-looking thunderous rocket into the top postage stamp! (+0.25 Timing Bonus)`
          : `WORLD-CLASS VOLLEY! Perfect Blue timing (100% Precision)! Unstoppable, jaw-dropping finish right into the top corner! (+0.25 Timing Bonus)`;
        duelOutcomeText = `Duel Masterclass (+${matchup?.statAdvantage || 0} Adv)`;
        statBonus.goal = true;
        statBonus.ratingDelta = 1.25; // 1.00 base goal + 0.25 timing bonus
        footballOutcome = 'GOAL';
      } else if (moment.actionType === 'PASS' || moment.momentType === 'THROUGH_BALL_PASS' || moment.momentType === 'CREATION_DUEL') {
        actionQualityTitle = '🔵 GODLIKE VISIONARY ASSIST';
        commentary = matchup
          ? `PURE GENIUS! Perfect Blue precision! Slices an impossible curved through-ball between four ${oppName} defenders right onto the tap-in! (+0.25 Timing Bonus)`
          : `PERFECT THROUGH BALL! Jaw-dropping vision! Slices the entire defense open with laser precision for a guaranteed goal! (+0.25 Timing Bonus)`;
        duelOutcomeText = `Creation Masterclass`;
        statBonus.assist = true;
        statBonus.ratingDelta = 0.95; // 0.70 base assist + 0.25 timing bonus
        footballOutcome = 'COMPLETE';
      } else {
        actionQualityTitle = '🔵 MESMERIZING MASTERCLASS DRIBBLE';
        commentary = `ICONIC MOMENT! Mesmerizing touch and lightning body feint leaves ${oppName} and the defense completely frozen! (+0.25 Timing Bonus)`;
        duelOutcomeText = `Masterclass Skill`;
        statBonus.ratingDelta = 0.65; // 0.40 base dribble + 0.25 timing bonus
        footballOutcome = 'BEAT_DEFENDER';
      }
    }
  }

  // ==========================================
  // 2. 🟢 GREEN ZONE — GENUINELY GREAT ACTION (+0.15 or +0.25 on def; 0.0 on fail)
  // ==========================================
  else if (zoneHit === 'GREEN') {
    // Green probability: ~84% base + slight player quality influence (78% to 92%)
    const greenProbability = Math.max(0.78, Math.min(0.92, 0.84 + statModifier * 0.10));
    const greenRoll = Math.random();

    if (greenRoll < greenProbability) {
      // 🟢 Green Success: Excellent execution
      success = true;
      performanceTier = 'GOOD';
      timingFeedback = '🟢 GREEN HIT — EXCELLENT!';
      matchAudio.playSuccessChime();

      if (isDefensiveAction) {
        statBonus.timingBonus = 0.25;
        if (moment.actionType === 'SAVE') {
          actionQualityTitle = '🟢 SUPERB REFLEX SAVE';
          commentary = `GREAT SAVE! Strong hand and decisive reflexes push ${oppName}'s dangerous strike wide for a corner! (+0.25 Defensive Timing Bonus)`;
          duelOutcomeText = `Duel Won`;
          statBonus.save = true;
          statBonus.ratingDelta = 0.75; // 0.50 base save + 0.25 timing bonus
          footballOutcome = 'SAVE';
        } else {
          actionQualityTitle = '🟢 PERFECTLY TIMED TACKLE';
          commentary = matchup
            ? `AUTHORITATIVE TACKLE! Solid challenge cleanly dispossesses ${oppName} in full stride. (+0.25 Defensive Timing Bonus)`
            : `PERFECT TACKLE! Clean, decisive challenge strips the attacker without committing a foul! (+0.25 Defensive Timing Bonus)`;
          duelOutcomeText = `Duel Won`;
          statBonus.tackle = true;
          statBonus.ratingDelta = 0.75; // 0.50 base tackle + 0.25 timing bonus
          footballOutcome = 'CLEAN_POSSESSION';
        }
      } else {
        statBonus.timingBonus = 0.15;
        if (moment.actionType === 'SHOOT' || moment.actionType === 'HEADER' || moment.momentType === 'GOALSCORING_DUEL') {
          actionQualityTitle = '🟢 CLINICAL CRISP FINISH';
          commentary = matchup
            ? `GOAL & DUEL WON! Excellent Green execution! Crisp, venomous strike drilled with authority inside the far post, giving ${oppName} no chance! (+0.15 Timing Bonus)`
            : `CLINICAL FINISH! Crisp, venomous strike drilled with pinpoint accuracy inside the far post! Excellent execution! (+0.15 Timing Bonus)`;
          duelOutcomeText = `Duel Won`;
          statBonus.goal = true;
          statBonus.ratingDelta = 1.15; // 1.00 base goal + 0.15 timing bonus
          footballOutcome = 'GOAL';
        } else if (moment.actionType === 'PASS' || moment.momentType === 'CREATION_DUEL') {
          actionQualityTitle = '🟢 OUTSTANDING INCISIVE PASS';
          commentary = matchup
            ? `SUPERB VISION! Pinpoint through-ball curved around ${oppName}'s backline right into the forward's stride! (+0.15 Timing Bonus)`
            : `OUTSTANDING PASS! Pinpoint delivery carved through the backline for a magnificent assist! (+0.15 Timing Bonus)`;
          duelOutcomeText = `Duel Won`;
          statBonus.assist = true;
          statBonus.ratingDelta = 0.85; // 0.70 base assist + 0.15 timing bonus
          footballOutcome = 'COMPLETE';
        } else {
          actionQualityTitle = '🟢 BRILLIANT DRIBBLE';
          commentary = `BRILLIANT SKILL! Smooth drop of the shoulder and electric burst of pace leaves ${oppName} chasing shadows! (+0.15 Timing Bonus)`;
          duelOutcomeText = `Duel Won`;
          statBonus.ratingDelta = 0.55; // 0.40 base dribble + 0.15 timing bonus
          footballOutcome = 'BEAT_DEFENDER';
        }
      }
    } else {
      // 🟢 Green Failure: Rare, "That was nearly genius" — NO PENALTY (0.0 rating delta)
      success = false;
      performanceTier = 'WEAK';
      timingFeedback = '🟢 GREEN HIT — NEARLY BRILLIANT!';
      matchAudio.playFailBuzz();
      statBonus.timingBonus = 0;
      statBonus.ratingDelta = 0.0; // User mandate: failure has no penalty on green actions

      if (moment.actionType === 'SHOOT' || moment.momentType === 'GOALSCORING_DUEL') {
        actionQualityTitle = '🟢 NEAR-GENIUS WOODWORK STRIKE';
        commentary = `NEARLY GENIUS! Audacious dipping curler completely beat ${oppName}'s keeper, but rattled violently off the underside of the crossbar! (0.00 Rating Penalty)`;
        footballOutcome = 'WOODWORK';
      } else if (moment.actionType === 'PASS' || moment.momentType === 'CREATION_DUEL') {
        actionQualityTitle = '🟢 VISIONARY BALL INCHES AWAY';
        commentary = `ALMOST SPECTACULAR! Visionary pass with magnificent curve; millimeter-precise idea, but ${oppName} made an exceptional desperate stretch to cut it out! (0.00 Rating Penalty)`;
        footballOutcome = 'CHANCE_CREATED';
      } else if (moment.actionType === 'SAVE') {
        actionQualityTitle = '🟢 HEROIC ATTEMPT BEATEN BY LUCK';
        commentary = `HEROIC EFFORT! Extraordinary full-stretch dive got fingertips to ${oppName}'s rocket, but it agonizingly clipped off the post and in! (0.00 Rating Penalty)`;
        statBonus.concededGoal = true;
        footballOutcome = 'WOODWORK';
      } else if (moment.actionType === 'TACKLE' || moment.momentType === 'DEFENDING_DUEL') {
        actionQualityTitle = '🟢 ACROBATIC CHALLENGE UNLUCKY';
        commentary = `ACROBATIC DEFENSE! Valiant, acrobatic challenge cleanly nicked the ball from ${oppName}, but the deflection spun out for a corner! (0.00 Rating Penalty)`;
        footballOutcome = 'DEFLECTION';
      } else {
        actionQualityTitle = '🟢 INCREDIBLE RUN NARROWLY HALTED';
        commentary = `BREATHTAKING RUN! Dazzling solo run beat two challenges, stopped only by a desperate last-ditch slide from ${oppName} at the final moment! (0.00 Rating Penalty)`;
        footballOutcome = 'CHANCE_CREATED';
      }
      duelOutcomeText = `Nearly Brilliant Duel`;
    }
  }

  // ==========================================
  // 3. 🟠 ORANGE ZONE — SCRAPPY / NARROW OUTCOME (No timing bonus; -0.25 penalty on failure)
  // ==========================================
  else if (zoneHit === 'ORANGE') {
    // Orange probability: 60% base + slight player quality influence (50% to 70%)
    const orangeProbability = Math.max(0.50, Math.min(0.70, 0.60 + statModifier * 0.12));
    const orangeRoll = Math.random();

    if (orangeRoll < orangeProbability) {
      // 🟠 Orange Success: Scrappy, zero timing bonus
      success = true;
      performanceTier = 'WEAK';
      timingFeedback = '🟠 ORANGE HIT — SCRAPPY SUCCESS!';
      matchAudio.playSuccessChime();
      statBonus.timingBonus = 0;

      if (moment.actionType === 'SHOOT' || moment.actionType === 'HEADER' || moment.momentType === 'GOALSCORING_DUEL') {
        actionQualityTitle = '🟠 SCRAPPY REBOUND GOAL';
        commentary = `SCRAPPY GOAL! The shot is parried by the goalkeeper, ricochets off ${oppName}'s shins, and trickles over the line! It wasn't pretty, but it worked! (No Timing Bonus)`;
        duelOutcomeText = `Scrappy Win`;
        statBonus.goal = true;
        statBonus.ratingDelta = 0.8;
        footballOutcome = 'REBOUND';
      } else if (moment.actionType === 'PASS' || moment.momentType === 'CREATION_DUEL') {
        actionQualityTitle = '🟠 DEFLECTED PASS FINDS TARGET';
        commentary = `FORTUNATE PASS! The pass takes a heavy deflection off ${oppName}'s boot, bobbles awkwardly, but finds your teammate in space! (No Timing Bonus)`;
        duelOutcomeText = `Scrappy Pass`;
        statBonus.assist = Math.random() < 0.5;
        statBonus.ratingDelta = 0.5;
        footballOutcome = 'DEFLECTION';
      } else if (moment.actionType === 'SAVE') {
        actionQualityTitle = '🟠 SCRAMBLED FUMBLED SAVE';
        commentary = `SCRAMBLED SAVE! Spilled the initial drive from ${oppName}, but recovered quickly to smother the ball on the line at the second attempt! (No Timing Bonus)`;
        duelOutcomeText = `Scrappy Save`;
        statBonus.save = true;
        statBonus.ratingDelta = 0.4;
        footballOutcome = 'SAVE';
      } else if (moment.actionType === 'TACKLE' || moment.actionType === 'INTERCEPTION' || moment.momentType === 'DEFENDING_DUEL') {
        actionQualityTitle = '🟠 AWKWARD CHALLENGE WON';
        commentary = `GRITTY CHALLENGE! Awkward, tangled challenge with ${oppName}, but you poke the ball away at full stretch to win scrappy possession! (No Timing Bonus)`;
        duelOutcomeText = `Scrappy Tackle`;
        statBonus.tackle = true;
        statBonus.ratingDelta = 0.4;
        footballOutcome = 'CLEAN_POSSESSION';
      } else {
        actionQualityTitle = '🟠 BUNDLED DRIBBLE THROUGH';
        commentary = `SCRAPPY DRIBBLE! Defender got a touch and the ball ricocheted, but you scrambled and bundled your way through! (No Timing Bonus)`;
        duelOutcomeText = `Scrappy Dribble`;
        statBonus.ratingDelta = 0.3;
        footballOutcome = 'BEAT_DEFENDER';
      }
    } else {
      // 🟠 Orange Failure: Opponent blocked — PENALTY OF -0.25
      success = false;
      performanceTier = 'FAILED';
      timingFeedback = '🟠 ORANGE HIT — OPPONENT BLOCKED!';
      matchAudio.playFailBuzz();
      statBonus.timingBonus = 0;
      statBonus.ratingDelta = -0.25; // User mandate: failure has a 0.25 penalty

      if (moment.actionType === 'SHOOT' || moment.momentType === 'GOALSCORING_DUEL') {
        actionQualityTitle = '🟠 CRUCIAL LAST-SECOND BLOCK';
        commentary = `DENIED! Solid strike on goal, but ${oppName} throws their body on the line with an exceptional last-second block! (-0.25 Rating Penalty)`;
        footballOutcome = 'BLOCK';
      } else if (moment.actionType === 'PASS' || moment.momentType === 'CREATION_DUEL') {
        actionQualityTitle = '🟠 LAST-INSTANT INTERCEPTION';
        commentary = `INTERCEPTED! Well-intended pass, but ${oppName} reads the channel and intercepts at the last instant with an outstretched boot. (-0.25 Rating Penalty)`;
        footballOutcome = 'INTERCEPTED';
      } else if (moment.actionType === 'SAVE') {
        actionQualityTitle = '🟠 NARROWLY BEATEN BY FINISH';
        commentary = `NARROW GOAL! Good diving effort, but ${oppName}'s placed strike creeps just inside the upright. (-0.25 Rating Penalty)`;
        statBonus.concededGoal = true;
        footballOutcome = 'SAVE';
      } else if (moment.actionType === 'TACKLE' || moment.momentType === 'DEFENDING_DUEL') {
        actionQualityTitle = '🟠 OPPONENT SHIELDS POSSESSION';
        commentary = `CLOSE TACKLE! Strong challenge, but ${oppName} shields the ball cleverly at the last millisecond to win a throw-in. (-0.25 Rating Penalty)`;
        footballOutcome = 'MISS';
      } else {
        actionQualityTitle = '🟠 SHARP TACKLE BY OPPONENT';
        commentary = `READ BY DEFENDER! Positive drive forward, but ${oppName} reads the cut at the last second and pokes it away cleanly. (-0.25 Rating Penalty)`;
        footballOutcome = 'RETAIN_POSSESSION';
      }
      duelOutcomeText = `Contested Duel Lost`;
    }
  }

  // ==========================================
  // 4. ⚠️ NORMAL FAILURE — ORDINARY MISTAKE (-0.25 penalty deducted from rating)
  // ==========================================
  else if (zoneHit === 'NORMAL_FAIL') {
    success = false;
    performanceTier = 'FAILED';
    matchAudio.playFailBuzz();
    statBonus.timingBonus = 0;
    statBonus.ratingDelta = -0.25; // User mandate: normal failure has a penalty of 0.25

    if (moment.actionType === 'SHOOT' || moment.momentType === 'GOALSCORING_DUEL') {
      actionQualityTitle = '⚠️ POOR STRIKE OFF TARGET';
      commentary = `POOR EFFORT! Bad shot dragged well wide of the target. A straightforward miss. (-0.25 Rating Penalty)`;
      footballOutcome = 'MISS';
    } else if (moment.actionType === 'PASS' || moment.momentType === 'CREATION_DUEL') {
      actionQualityTitle = '⚠️ INACCURATE PASS INTERCEPTED';
      commentary = `POOR PASS! Underhit delivery fails to reach the teammate and is cut out routinely by ${oppName}. (-0.25 Rating Penalty)`;
      footballOutcome = 'INTERCEPTED';
    } else if (moment.actionType === 'SAVE') {
      actionQualityTitle = '⚠️ SHOT BEATS GOALKEEPER';
      commentary = `BEATEN! Ordinary shot from ${oppName} slips into the corner as the save attempt comes up short. (-0.25 Rating Penalty)`;
      statBonus.concededGoal = true;
      footballOutcome = 'SAVE';
    } else if (moment.actionType === 'TACKLE' || moment.momentType === 'DEFENDING_DUEL') {
      actionQualityTitle = '⚠️ MISSED CHALLENGE';
      commentary = `TACKLE MISSES! Straightforward mistake, lunged in late and ${oppName} took a routine touch past. (-0.25 Rating Penalty)`;
      statBonus.concededGoal = moment.momentType === 'LAST_MAN_TACKLE' || Math.random() < 0.35;
      footballOutcome = 'MISS';
    } else {
      actionQualityTitle = '⚠️ DRIBBLE TACKLED CLEANLY';
      commentary = `BAD TOUCH! Lost control in traffic and ${oppName} dispossessed cleanly with an ordinary tackle. (-0.25 Rating Penalty)`;
      footballOutcome = 'LOSE_BALL';
    }
    duelOutcomeText = `Mistimed Action`;
  }

  // ==========================================
  // 5. 💀 RED — CRITICAL FAILURE (-0.5 penalty & -10 fame, laugh-worthy comedy)
  // ==========================================
  else {
    success = false;
    performanceTier = 'FAILED';
    timingFeedback = '💀 CRITICAL FAILURE — CATASTROPHIC ERROR!';
    matchAudio.playFailBuzz();
    statBonus.timingBonus = 0;
    statBonus.ratingDelta = -0.5; // User mandate: critical failure has a penalty of 0.5
    statBonus.fameDelta = -10; // User mandate: minus 10 fame

    if (moment.actionType === 'SHOOT' || moment.momentType === 'GOALSCORING_DUEL') {
      actionQualityTitle = '💀 AIR-KICK 360 COMEDY SLIP';
      commentary = `COMEDY GOLD! Swings with fury, completely whiffs on the ball, kicks his own shin, and does a 360° faceplant while the ball rolls two feet! Both benches are wiping tears of laughter and the GIF is already trending #1 worldwide! (-0.50 Rating, -10 Fame)`;
      footballOutcome = 'MISS';
    } else if (moment.actionType === 'PASS' || moment.momentType === 'CREATION_DUEL') {
      actionQualityTitle = '💀 NO-LOOK PASS TO THE OPPONENT\'S MANAGER';
      commentary = `ABSOLUTE CIRCUS PASS! Tries a flashy no-look pass, trips over his own boot, and delivers the ball straight to the opposing manager sipping a beverage in the technical area! The manager looks stunned while the whole stadium roars with laughter! (-0.50 Rating, -10 Fame)`;
      footballOutcome = 'INTERCEPTED';
    } else if (moment.actionType === 'SAVE') {
      actionQualityTitle = '💀 HISTORIC SLAPSTICK HOWLER';
      commentary = `BLOOPER OF THE CENTURY! A gentle 5-mph roller from 40 yards out nutmegs him between his knees, he slips like on an invisible banana peel scrambling back, and watches it crawl over the line! Slapstick gold destined for viral history! (-0.50 Rating, -10 Fame)`;
      statBonus.concededGoal = true;
      footballOutcome = 'MISS';
    } else if (moment.actionType === 'TACKLE' || moment.momentType === 'DEFENDING_DUEL') {
      actionQualityTitle = '💀 TWISTED PRETZEL SLIP & SLIDE';
      commentary = `SLAPSTICK SLIDE! Launches a wild slide, misses the ball by 10 yards, slides into the corner flag and gets tangled up like a pretzel while ${oppName} stops, chuckles, and strolls into open space! (-0.50 Rating, -10 Fame)`;
      statBonus.concededGoal = true;
      footballOutcome = 'FOUL_COMMITTED';
    } else {
      actionQualityTitle = '💀 THE ELASTICO SHOE-FLYING ACCIDENT';
      commentary = `FAIL OF THE SEASON! Steps directly on top of the ball, rolls backward like a cartoon character, and kicks his own boot flying into row Z while ${oppName} casually trots away with the ball! (-0.50 Rating, -10 Fame)`;
      footballOutcome = 'LOSE_BALL';
    }
    duelOutcomeText = `Laugh-Worthy Catastrophe`;
  }

  // 6. 🔥 CLUTCH TIME BONUS (+25% Points to Rating as they are more decisive)
  if (moment?.isClutchTime && statBonus.ratingDelta > 0) {
    statBonus.ratingDelta = Number((statBonus.ratingDelta * 1.25).toFixed(2));
    actionQualityTitle = `🔥 CLUTCH: ${actionQualityTitle} (+25% Rating Boost!)`;
    commentary = `🔥 [CLUTCH TIME BONUS] ${commentary}`;
  }

  return {
    quality,
    zoneHit,
    performanceTier,
    timingFeedback,
    precisionPercent,
    successPercent,
    actionQualityTitle,
    success,
    commentary,
    duelOutcomeText,
    footballOutcome,
    statBonus,
  };
}

/**
 * Calculates MVP status based on Key Match stats
 */
export function calculateMatchMvpStatus(
  goals: number,
  assists: number,
  saves: number,
  tackles: number,
  rating: number,
  isWinner: boolean
): MatchMvpStatus {
  if (isWinner && (goals >= 2 || (goals >= 1 && assists >= 1) || saves >= 4 || rating >= 8.8)) {
    return 'MVP 🏆';
  }
  if (rating >= 7.8 || goals >= 1 || assists >= 1 || saves >= 2) {
    return 'Top Performer ⭐';
  }
  if (rating >= 6.8) {
    return 'Solid Performance 👍';
  }
  if (rating >= 6.0) {
    return 'Average Performance ⚽';
  }
  if (rating >= 5.0) {
    return 'Poor Performance ⚠️';
  }
  return 'Match Villain 💔';
}
