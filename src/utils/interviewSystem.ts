import { PlayerCardData, CustomCard } from '../types';
import {
  InterviewCard,
  InterviewCardCategory,
  InterviewCardTier,
  InterviewQuestion,
  InterviewQuestionContext,
  InterviewOutcomeResult,
  ChemistryCeilingPenalty,
} from '../types/interviewCards';
import { applyChemistryCeiling } from './chemistrySystem';
import { safeGetItem } from './storageCleaner';
import { calculateModifiedBadReputationGain } from './perksSystem';

export interface JournalistOutlet {
  name: string;
  badge: string;
  country: string;
}

export const JOURNALIST_OUTLETS: JournalistOutlet[] = [
  { name: 'Sky Sports', badge: '📺 Sky Sports Live', country: 'England' },
  { name: 'Marca', badge: '🗞️ MARCA Exclusive', country: 'Spain' },
  { name: "L'Équipe", badge: '📰 L\'Équipe France', country: 'France' },
  { name: 'BBC Sport', badge: '🎙️ BBC Sport Matchday', country: 'England' },
  { name: 'La Gazzetta dello Sport', badge: '🗞️ La Gazzetta', country: 'Italy' },
  { name: 'TNT Sports', badge: '⚡ TNT Champions', country: 'International' },
  { name: 'The Athletic', badge: '✒️ The Athletic In-Depth', country: 'International' },
  { name: 'ESPN FC', badge: '🌐 ESPN FC Global', country: 'International' },
];

export const JOURNALIST_NAMES = [
  'Fabrizio Romano',
  'Guillem Balagué',
  'Henry Winter',
  'Julien Laurens',
  'James Horncastle',
  'Sid Lowe',
  'Laura Woods',
  'Kelly Cates',
  'Gabriele Marcotti',
  'Edu Aguirre',
];

/**
 * Generates ONE contextual interview question from actual match events & stakes
 */
export function generateInterviewQuestion(context: InterviewQuestionContext): InterviewQuestion {
  const outlet = JOURNALIST_OUTLETS[Math.floor(Math.random() * JOURNALIST_OUTLETS.length)];
  const journalist = JOURNALIST_NAMES[Math.floor(Math.random() * JOURNALIST_NAMES.length)];

  const {
    isWinner,
    isDraw,
    isFinal,
    isSemi,
    isDerby,
    derbyName,
    isTitleDecider,
    isRelegationDecider,
    playerGoals,
    playerAssists,
    playerRating,
    wentToPenalties,
    penaltyMissed,
    redCardOccurred,
    playerScore,
    opponentScore,
    opponentTeamName,
    matchTitle,
  } = context;

  // 1. CHAMPIONSHIP / TOURNAMENT FINAL SCENARIOS
  if (isFinal) {
    if (isWinner) {
      if (playerGoals >= 2) {
        return {
          id: `q-final-win-hero-${Date.now()}`,
          outletName: outlet.name,
          outletBadge: outlet.badge,
          journalistName: journalist,
          contextHeader: 'CHAMPIONSHIP FINAL • HEROIC VICTORY',
          tone: 'celebratory',
          questionText: `A monumental performance in the Grand Final! Two crucial goals against ${opponentTeamName} to bring home the silverware. Is this the defining moment of your career so far?`,
        };
      }
      return {
        id: `q-final-win-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: 'CHAMPIONSHIP FINAL • SILVERWARE SECURED',
        tone: 'celebratory',
        questionText: `You are champions of ${matchTitle}! You saw off ${opponentTeamName} (${playerScore}-${opponentScore}) in a high-octane battle. What was going through your mind at the final whistle?`,
      };
    } else {
      if (penaltyMissed || wentToPenalties) {
        return {
          id: `q-final-pen-heartbreak-${Date.now()}`,
          outletName: outlet.name,
          outletBadge: outlet.badge,
          journalistName: journalist,
          contextHeader: 'CHAMPIONSHIP FINAL • PENALTY HEARTBREAK',
          tone: 'critical',
          questionText: `Devastating heartbreak in the final shootout against ${opponentTeamName}. Tension was unbearable in the stadium. What went wrong when the decisive kicks were taken?`,
        };
      }
      return {
        id: `q-final-defeat-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: 'CHAMPIONSHIP FINAL • RUNNERS-UP DEFEAT',
        tone: 'critical',
        questionText: `To fall at the final hurdle against ${opponentTeamName} hurts deeply. Did the team fail to execute the manager's tactical instructions today, or were you simply outmatched?`,
      };
    }
  }

  // 2. TITLE DECIDER
  if (isTitleDecider) {
    if (isWinner) {
      return {
        id: `q-title-clinch-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: 'LEAGUE TITLE DECIDER • CHAMPIONS CROWNED',
        tone: 'celebratory',
        questionText: `You have officially clinched the League Championship today! Pundits doubted your squad's endurance across the grueling season. What is your message to the critics now?`,
      };
    } else {
      return {
        id: `q-title-bottled-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: 'TITLE DECIDER • MISSED CHAMPIONSHIP OPPORTUNITY',
        tone: 'provocative',
        questionText: `A catastrophic collapse in the title decider against ${opponentTeamName}. How do you explain throwing away the championship when destiny was in your own hands?`,
      };
    }
  }

  // 3. RELEGATION DECIDER / PLAYOFF
  if (isRelegationDecider) {
    if (isWinner) {
      return {
        id: `q-relegation-survival-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: 'RELEGATION DECIDER • SURVIVAL SECURED',
        tone: 'praising',
        questionText: `Incredible relief! With your survival hanging by a thread, you dug deep and beat ${opponentTeamName}. How did you handle the suffocating pressure in the locker room?`,
      };
    } else {
      return {
        id: `q-relegation-drop-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: 'RELEGATION DECIDER • CRUSHING DROP',
        tone: 'critical',
        questionText: `Relegation confirmed. The fans outside are furious with the board and the squad. Where does the blame lie for this disastrous campaign?`,
      };
    }
  }

  // 4. MAJOR DERBY CLASH
  if (isDerby) {
    const dName = derbyName || 'The Derby';
    if (isWinner) {
      return {
        id: `q-derby-win-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: `${dName.toUpperCase()} • SENSATIONAL VICTORY`,
        tone: 'celebratory',
        questionText: `Bragging rights secured in ${dName}! The atmosphere in the stadium was deafening. How special does it feel to humble your fiercest rivals on the biggest stage?`,
      };
    } else if (isDraw) {
      return {
        id: `q-derby-draw-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: `${dName.toUpperCase()} • FIERCE STALEMATE`,
        tone: 'investigative',
        questionText: `A fiery, ill-tempered battle in ${dName} ending ${playerScore}-${opponentScore}. Tackles were flying and the referee lost control at times. Are you satisfied with a point?`,
      };
    } else {
      return {
        id: `q-derby-loss-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: `${dName.toUpperCase()} • BITTER RIVALRY LOSS`,
        tone: 'provocative',
        questionText: `A painful defeat in ${dName}. Rival fans are already mocking your squad on social media. Did the team lack the fighting spirit required for a match of this magnitude?`,
      };
    }
  }

  // 5. SEMI-FINAL SHOWDOWN
  if (isSemi) {
    if (isWinner) {
      return {
        id: `q-semi-win-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: 'SEMI-FINAL • TICKET TO THE GRAND FINAL',
        tone: 'praising',
        questionText: `You're heading to the Final! Overcoming ${opponentTeamName} in such a tactical chess match was remarkable. Are you ready to go all the way and lift the trophy?`,
      };
    } else {
      return {
        id: `q-semi-loss-${Date.now()}`,
        outletName: outlet.name,
        outletBadge: outlet.badge,
        journalistName: journalist,
        contextHeader: 'SEMI-FINAL • KNOCKED OUT',
        tone: 'investigative',
        questionText: `Heartbreak just one step away from the Grand Final. Do you feel the manager's substitutions in the second half cost you momentum?`,
      };
    }
  }

  // 6. INDIVIDUAL HEROICS (Hat-trick, Brace, High Rating)
  if (playerGoals >= 2 || (playerGoals >= 1 && playerAssists >= 1) || playerRating >= 8.5) {
    return {
      id: `q-player-masterclass-${Date.now()}`,
      outletName: outlet.name,
      outletBadge: outlet.badge,
      journalistName: journalist,
      contextHeader: 'INDIVIDUAL MASTERCLASS • MAN OF THE MATCH',
      tone: 'praising',
      questionText: `An absolute masterclass from you today (${playerGoals} goals, ${playerAssists} assists, ${playerRating} rating). Transfer rumors are already swirling about Europe's elite watching you. What is your future?`,
    };
  }

  // 7. CONTROVERSY / POOR RATING / RED CARD
  if (redCardOccurred || playerRating < 6.0 || (!isWinner && !isDraw)) {
    return {
      id: `q-controversy-underperform-${Date.now()}`,
      outletName: outlet.name,
      outletBadge: outlet.badge,
      journalistName: journalist,
      contextHeader: 'POST-MATCH INQUEST • DISPUTED MOMENTS',
      tone: 'critical',
      questionText: `A frustrating afternoon on the pitch (${playerScore}-${opponentScore}). There were contentious refereeing calls and defensive lapses. What was the root cause of today's struggles?`,
    };
  }

  // 8. GENERAL HIGH-STAKES KEY MATCH
  return {
    id: `q-general-keymatch-${Date.now()}`,
    outletName: outlet.name,
    outletBadge: outlet.badge,
    journalistName: journalist,
    contextHeader: 'KEY MATCH MEDIA BRIEFING',
    tone: 'investigative',
    questionText: `A fiercely contested key fixture against ${opponentTeamName}. With the season reaching its climax, how will this result impact your locker room's mentality?`,
  };
}

/**
 * Draws 3 distinct interview cards reflecting the 4 Categories:
 * - GOOD: Bronze, Silver, Gold, Legendary
 * - BAD: Scrap, Rust, Ash, Disaster
 * - DOUBLE-EDGED: Obsidian Knife, Copper Dagger, Steel Blade, Muramasa Blade
 * - ICONIC: Iconic
 */
export function drawThreeInterviewCards(context: InterviewQuestionContext): InterviewCard[] {
  const { matchImportance, isWinner, isFinal, isDerby, playerGoals, playerRating } = context;
  const isDefinitive = matchImportance === 'DEFINITIVE';

  // Available pools for each category
  const goodPool: InterviewCard[] = [
    {
      id: `ic-good-humble-${Date.now()}-1`,
      name: 'Stay Humble & Praise the Team',
      category: 'good',
      tier: isDefinitive ? 'gold' : 'silver',
      quote: `"Football is 11 brothers fighting for each other. Today wasn't about me — every single player gave their blood and sweat for this badge."`,
      description: 'Deflects personal glory to praise teammates, elevating locker room harmony.',
      effects: {
        fameDelta: isDefinitive ? 30 : 15,
        badReputationDelta: -5,
        chemistryDelta: isDefinitive ? 15 : 10,
        managerRelationshipDelta: 10,
        fanReaction: 'adoration',
        mediaHeadline: 'Pure Class: Rising Star Gives Full Credit to Teammates & Collective Spirit',
      },
    },
    {
      id: `ic-good-leadership-${Date.now()}-2`,
      name: 'Show Mature Leadership',
      category: 'good',
      tier: isDefinitive ? 'legendary' : 'gold',
      quote: `"We hold ourselves to the highest standards. In victory or adversity, a true leader takes responsibility and pushes the standard higher."`,
      description: 'Displays captain-level maturity that impresses managers, scouts, and teammates.',
      effects: {
        fameDelta: isDefinitive ? 45 : 25,
        badReputationDelta: -10,
        chemistryDelta: isDefinitive ? 20 : 15,
        managerRelationshipDelta: 20,
        fanReaction: 'applause',
        mediaHeadline: 'Born Leader: Post-Match Maturity Stuns Pundits Across the Nation',
        bonusStatPoint: 1,
        statTarget: 'Mentality',
      },
    },
    {
      id: `ic-good-fans-${Date.now()}-3`,
      name: 'Dedicate Match to the Fans',
      category: 'good',
      tier: 'bronze',
      quote: `"Our supporters travel in the cold and rain to sing for 90 minutes. This result belongs 100% to our fans in the stands."`,
      description: 'Forges an unbreakable bond with the supporters.',
      effects: {
        fameDelta: 20,
        badReputationDelta: -3,
        chemistryDelta: 5,
        managerRelationshipDelta: 5,
        fanReaction: 'adoration',
        mediaHeadline: 'Fan Favorite: Heartfelt Tribute to Supporters Electrifies Stadium',
      },
    },
    {
      id: `ic-good-coach-${Date.now()}-4`,
      name: 'Credit Manager Tactics',
      category: 'good',
      tier: 'silver',
      quote: `"The manager prepared us perfectly all week. We executed the tactical gameplan to perfection."`,
      description: 'Strengthens manager trust and secures starting spot reliability.',
      effects: {
        fameDelta: 15,
        badReputationDelta: -5,
        chemistryDelta: 10,
        managerRelationshipDelta: 25,
        fanReaction: 'applause',
        mediaHeadline: 'Manager Masterstroke: Player Praises Tactical Genius in Press Room',
      },
    },
  ];

  const badPool: InterviewCard[] = [
    {
      id: `ic-bad-teammates-${Date.now()}-1`,
      name: 'Blame Teammates’ Incompetence',
      category: 'bad',
      tier: isDefinitive ? 'disaster' : 'ash',
      quote: `"I can't score the goals and defend our box alone. If certain players in this locker room don't wake up, we will never achieve anything."`,
      description: 'Explosive locker room betrayal. Destroys reputation and fractures squad chemistry.',
      effects: {
        fameDelta: isDefinitive ? -60 : -40,
        badReputationDelta: isDefinitive ? 70 : 50,
        chemistryDelta: isDefinitive ? -30 : -20,
        chemistryCeiling: {
          capPercent: isDefinitive ? 80 : 85,
          durationMonths: 6,
          reason: 'Locker room mutiny after publicly flaming teammates in press conference',
        },
        managerRelationshipDelta: -25,
        fanReaction: 'furious',
        mediaHeadline: 'Locker Room Civil War: Star Publicly Slams Teammates in Shock Interview!',
      },
    },
    {
      id: `ic-bad-manager-${Date.now()}-2`,
      name: 'Question Manager’s Tactical Competence',
      category: 'bad',
      tier: isDefinitive ? 'ash' : 'rust',
      quote: `"Our system is completely broken. We are playing negative football that holds back our attacking potential. Changes are needed."`,
      description: 'Direct insurrection against the manager. Sours relations with coaching staff.',
      effects: {
        fameDelta: isDefinitive ? -40 : -25,
        badReputationDelta: isDefinitive ? 50 : 35,
        chemistryDelta: isDefinitive ? -20 : -15,
        chemistryCeiling: {
          capPercent: isDefinitive ? 85 : 90,
          durationMonths: 6,
          reason: 'Tactical rebellion against coaching staff',
        },
        managerRelationshipDelta: -40,
        fanReaction: 'outrage',
        mediaHeadline: 'Mutiny! Player Challenges Manager Authority Live on Air',
      },
    },
    {
      id: `ic-bad-referee-${Date.now()}-3`,
      name: 'Attack the Referee & Corrupt Officiating',
      category: 'bad',
      tier: 'rust',
      quote: `"The referee was completely biased today. Playing 11 against 12 is impossible. It is a disgrace to football."`,
      description: 'Accuses officials of corruption. Media circus ensues and fine is possible.',
      effects: {
        fameDelta: -25,
        badReputationDelta: 35,
        chemistryDelta: -10,
        chemistryCeiling: {
          capPercent: 90,
          durationMonths: 6,
          reason: 'Disciplinary investigation after attacking match officials',
        },
        managerRelationshipDelta: -10,
        fanReaction: 'furious',
        mediaHeadline: 'Disgrace! Star Faces League Sanction After Torching Match Officials',
      },
    },
    {
      id: `ic-bad-disaster-club-${Date.now()}-4`,
      name: 'Call Out Club Ambition & Threaten Exit',
      category: 'bad',
      tier: 'disaster',
      quote: `"This club's ambition does not match mine. If the board isn't serious about winning major trophies, I will find a team that is."`,
      description: 'Nuclear ultimatum to the board. Sparks toxic media fallout and fan fury.',
      effects: {
        fameDelta: isDefinitive ? -80 : -60,
        badReputationDelta: isDefinitive ? 85 : 70,
        chemistryDelta: isDefinitive ? -35 : -30,
        chemistryCeiling: {
          capPercent: 80,
          durationMonths: 6,
          reason: 'Hostile transfer ultimatum toxic atmosphere',
        },
        managerRelationshipDelta: -35,
        fanReaction: 'furious',
        mediaHeadline: 'Transfer Bombshell: Star Threatens Immediate Exit Live on TV!',
      },
    },
    {
      id: `ic-bad-scrap-stormout-${Date.now()}-5`,
      name: 'Storm Out of the Press Room',
      category: 'bad',
      tier: 'scrap',
      quote: `(Knocks microphone aside, refuses to answer, and storms out of the press briefing in anger.)`,
      description: 'Petulant media blackout. Labeled unprofessional by journalists.',
      effects: {
        fameDelta: -15,
        badReputationDelta: 20,
        chemistryDelta: -5,
        chemistryCeiling: {
          capPercent: 95,
          durationMonths: 6,
          reason: 'Press room storm out and media boycott friction',
        },
        managerRelationshipDelta: -15,
        fanReaction: 'outrage',
        mediaHeadline: 'Unprofessional: Press Room Walkout Sparks Outcry Among Journalists',
      },
    },
  ];

  const doubleEdgedPool: InterviewCard[] = [
    {
      id: `ic-de-muramasa-guarantee-${Date.now()}-1`,
      name: 'Muramasa Blade: Guarantee Silverware Next Season',
      category: 'double_edged',
      tier: 'muramasa_blade',
      quote: `"Write this down in your newspapers: I GUARANTEE we will lift the trophy next season. Put it all on me. If we fail, I take 100% of the blame."`,
      description: 'All-or-nothing legendary declaration. Skyrockets fame (+80 Fame) but brings catastrophic bad reputation (+100 Bad Rep) and immense pressure.',
      effects: {
        fameDelta: 80,
        badReputationDelta: 100, // +100 Bad Rep strong tradeoff
        chemistryDelta: isWinner ? 15 : -15,
        chemistryCeiling: {
          capPercent: 80,
          durationMonths: 6,
          reason: 'Tremendous unfulfilled guarantee pressure in locker room',
        },
        managerRelationshipDelta: isWinner ? 15 : -20,
        fanReaction: 'viral_icon',
        mediaHeadline: 'Muramasa Guarantee: World Stunned by Audacious Championship Vow!',
        bonusStatPoint: 1,
        statTarget: 'Composure',
      },
    },
    {
      id: `ic-de-steel-truth-${Date.now()}-2`,
      name: 'Steel Blade: Brutal Honest Assessment',
      category: 'double_edged',
      tier: 'steel_blade',
      quote: `"I don't play politics. We played poorly in the first half, but we fought like gladiators in the second. Everyone must look in the mirror."`,
      description: 'Zero-sugarcoat assessment. Respected by purists (+35 Fame), but divides teammates (+30 Bad Rep).',
      effects: {
        fameDelta: 35,
        badReputationDelta: 30,
        chemistryDelta: -10,
        chemistryCeiling: {
          capPercent: 85,
          durationMonths: 6,
          reason: 'Strict unyielding locker room atmosphere',
        },
        managerRelationshipDelta: 10,
        fanReaction: 'applause',
        mediaHeadline: 'Zero Filter: Honest Assessment Cuts Through Football Clichés',
      },
    },
    {
      id: `ic-de-copper-bold-${Date.now()}-3`,
      name: 'Copper Dagger: Bold Prediction on Rival',
      category: 'double_edged',
      tier: 'copper_dagger',
      quote: `"Our rivals celebrated like they won the World Cup today. Let them enjoy it — when they visit our stadium, it will be a completely different story."`,
      description: 'Throws fuel on the rivalry fire (+30 Fame) but paints a massive target on your back (+35 Bad Rep).',
      effects: {
        fameDelta: 30,
        badReputationDelta: 35,
        chemistryDelta: -5,
        chemistryCeiling: {
          capPercent: 90,
          durationMonths: 6,
          reason: 'Rivalry provocation scrutiny',
        },
        managerRelationshipDelta: 0,
        fanReaction: 'viral_icon',
        mediaHeadline: 'Warning Shot: Bold Taunt Sets Up Explosive Return Fixture!',
      },
    },
    {
      id: `ic-de-obsidian-statement-${Date.now()}-4`,
      name: 'Obsidian Knife: No Regrets Declaration',
      category: 'double_edged',
      tier: 'obsidian_knife',
      quote: `"I play with my heart on my sleeve. I make no apologies for my passion or my style on the pitch."`,
      description: 'Unapologetic swagger (+25 Fame) that polarizes traditionalists (+25 Bad Rep).',
      effects: {
        fameDelta: 25,
        badReputationDelta: 25,
        chemistryDelta: -5,
        chemistryCeiling: {
          capPercent: 95,
          durationMonths: 6,
          reason: 'Maverick behavior friction',
        },
        managerRelationshipDelta: 5,
        fanReaction: 'mixed',
        mediaHeadline: 'No Apologies: Maverick Star Refuses to Dilute On-Pitch Fire',
      },
    },
  ];

  const iconicPool: InterviewCard[] = [
    {
      id: `ic-iconic-special-one-${Date.now()}-1`,
      name: 'Iconic: "I Am Destined For Greatness"',
      category: 'iconic',
      tier: 'iconic',
      quote: `"Generational players don't ask for permission. We take the stage and we make history. Remember this date, because greatness arrived today."`,
      description: 'An immortal, swaggering declaration that cements your name across football folklore.',
      effects: {
        fameDelta: 120,
        badReputationDelta: 15,
        chemistryDelta: 15,
        managerRelationshipDelta: 15,
        fanReaction: 'viral_icon',
        mediaHeadline: 'IMMORTAL DECLARATION: Global Football Welcomes Its Next Superstar Phenomenon!',
        bonusStatPoint: 2,
        statTarget: 'Mentality',
      },
      isIconicSpecial: true,
    },
    {
      id: `ic-iconic-football-life-${Date.now()}-2`,
      name: 'Iconic: "Football Is My Blood & Soul"',
      category: 'iconic',
      tier: 'iconic',
      quote: `"When I was a kid playing on broken concrete with no shoes, I dreamed of this exact night. Everything I have, everything I am, is given to the beautiful game."`,
      description: 'A poetic, deeply touching speech that moves millions to tears across the globe.',
      effects: {
        fameDelta: 100,
        badReputationDelta: -15,
        chemistryDelta: 30,
        managerRelationshipDelta: 30,
        fanReaction: 'adoration',
        mediaHeadline: 'THE HEART OF FOOTBALL: Emotional Speech Captivates Millions Globally!',
        bonusStatPoint: 2,
        statTarget: 'Composure',
      },
      isIconicSpecial: true,
    },
  ];

  // Load custom cards from storage if available and merge into pools
  try {
    const rawCustom = safeGetItem('footballer_custom_cards_v1');
    if (rawCustom) {
      const parsed = JSON.parse(rawCustom);
      if (Array.isArray(parsed)) {
        const customInterviews = parsed.filter((c: CustomCard) => c.category === 'interview');
        customInterviews.forEach((c: CustomCard) => {
          let fameDelta = 0;
          let badRepDelta = 0;
          let chemDelta = 0;
          let chemCeiling: ChemistryCeilingPenalty | undefined = undefined;
          let bonusStatPoint = 0;
          let statTarget = '';

          const isBadTier = ['scrap', 'rust', 'ash', 'disaster'].includes(c.tier);

          (c.modifiers || []).forEach((m) => {
            if (m.target === 'stat_fame') {
              fameDelta += m.operation === 'subtract' ? -Math.abs(m.value) : m.value;
            }
            if (m.target === 'bad_reputation') {
              badRepDelta += Math.abs(m.value);
            }
            if (m.target === 'team_chemistry') {
              chemDelta += m.operation === 'subtract' ? -Math.abs(m.value) : m.value;
            }
            if (m.target === 'chemistry_ceiling') {
              chemCeiling = {
                capPercent: m.value,
                durationMonths: 6, // 6 months temporal nerf
                reason: 'Controversial press conference statement',
              };
            }
            if (!isBadTier && (m.target === 'stat_men' || m.target === 'stat_composure' || m.target === 'stat_free_points')) {
              bonusStatPoint += m.value;
              statTarget = m.target === 'stat_composure' ? 'Composure' : m.target === 'stat_free_points' ? 'Free Points' : 'Mentality';
            }
          });

          // Negative interview cards must strictly reduce fame and never give positive stats
          if (isBadTier) {
            if (fameDelta > 0) fameDelta = -fameDelta;
            if (fameDelta === 0) fameDelta = c.tier === 'disaster' ? -60 : c.tier === 'ash' ? -40 : c.tier === 'rust' ? -25 : -15;
            if (badRepDelta <= 0) badRepDelta = c.tier === 'disaster' ? 70 : c.tier === 'ash' ? 50 : c.tier === 'rust' ? 35 : 20;
            if (!chemCeiling) {
              chemCeiling = {
                capPercent: c.tier === 'disaster' ? 80 : c.tier === 'ash' ? 85 : c.tier === 'rust' ? 90 : 95,
                durationMonths: 6,
                reason: 'Controversial press conference fallout',
              };
            }
            bonusStatPoint = 0;
            statTarget = '';
          }

          const customCardObj: InterviewCard = {
            id: c.id,
            name: c.name,
            category: (['bronze', 'silver', 'gold', 'legendary'].includes(c.tier)
              ? 'good'
              : isBadTier
              ? 'bad'
              : c.tier === 'iconic'
              ? 'iconic'
              : 'double_edged') as InterviewCardCategory,
            tier: c.tier as InterviewCardTier,
            quote: `"${c.description}"`,
            description: c.description,
            effects: {
              fameDelta,
              badReputationDelta: badRepDelta,
              chemistryDelta: chemDelta,
              chemistryCeiling: chemCeiling,
              managerRelationshipDelta: chemDelta,
              fanReaction: isBadTier ? 'furious' : fameDelta >= 50 ? 'viral_icon' : badRepDelta > 15 ? 'outrage' : 'applause',
              mediaHeadline: `Exclusive: ${c.name} - Statement Shakes Football Media`,
              bonusStatPoint: bonusStatPoint > 0 ? bonusStatPoint : undefined,
              statTarget: statTarget || undefined,
            },
          };

          if (customCardObj.category === 'good') goodPool.push(customCardObj);
          else if (customCardObj.category === 'bad') badPool.push(customCardObj);
          else if (customCardObj.category === 'iconic') iconicPool.push(customCardObj);
          else doubleEdgedPool.push(customCardObj);
        });
      }
    }
  } catch (err) {
    console.error('Error merging custom interview cards into draw pool', err);
  }

  // Helper to pick a card based on explicit odds: 60% Bad, 30% Double-Edged / Iconic, 10% Positive
  const drawWeightedCard = (usedNames: Set<string>): InterviewCard => {
    const roll = Math.random() * 100;
    let targetPool: InterviewCard[];

    if (roll < 60) {
      // 60% Bad (Scrap, Rust, Ash, Disaster)
      targetPool = badPool;
    } else if (roll < 90) {
      // 30% Double-Edged (Obsidian, Copper, Steel, Muramasa) or Iconic
      if ((isDefinitive || playerRating >= 8.5 || (playerGoals >= 2 && isWinner)) && Math.random() < 0.35 && iconicPool.length > 0) {
        targetPool = iconicPool;
      } else {
        targetPool = doubleEdgedPool;
      }
    } else {
      // 10% Positive / Good (Bronze, Silver, Gold, Legendary)
      targetPool = goodPool;
    }

    if (!targetPool || targetPool.length === 0) {
      targetPool = badPool.length > 0 ? badPool : goodPool;
    }

    // Filter out already chosen cards by name
    const available = targetPool.filter((c) => !usedNames.has(c.name));
    const poolToUse = available.length > 0 ? available : targetPool;
    const baseCard = poolToUse[Math.floor(Math.random() * poolToUse.length)] || goodPool[0];
    usedNames.add(baseCard.name);

    // Return unique instance with unique ID to avoid React key collision
    return {
      ...baseCard,
      id: `${baseCard.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      effects: {
        ...baseCard.effects,
      },
    };
  };

  const usedNames = new Set<string>();
  const card1 = drawWeightedCard(usedNames);
  const card2 = drawWeightedCard(usedNames);
  const card3 = drawWeightedCard(usedNames);

  return [card1, card2, card3];
}

/**
 * Applies the selected Interview Card effects to the player and returns full outcome details
 */
export function applyInterviewCardToPlayer(
  player: PlayerCardData,
  card: InterviewCard,
  context: InterviewQuestionContext
): {
  updatedPlayer: PlayerCardData;
  outcome: InterviewOutcomeResult;
} {
  const fameDelta = card.effects.fameDelta || 0;
  const rawBadRepDelta = card.effects.badReputationDelta || 0;
  const badRepDelta = calculateModifiedBadReputationGain(player, rawBadRepDelta);
  const chemDelta = card.effects.chemistryDelta || 0;
  const ceiling = card.effects.chemistryCeiling;

  // Clamped updates
  const curFame = player.fame ?? 50;
  const newFame = Math.min(1000, Math.max(0, curFame + fameDelta));

  const curBadRep = player.badReputation ?? 10;
  const newBadRep = Math.min(100, Math.max(1, curBadRep + badRepDelta));

  let curChem = player.chemistry ?? 50;
  curChem = Math.min(100, Math.max(0, curChem + chemDelta));

  let updatedPlayer: PlayerCardData = {
    ...player,
    fame: newFame,
    badReputation: newBadRep,
    chemistry: curChem,
  };

  // Apply Chemistry Ceiling if card demands it
  if (ceiling && ceiling.capPercent > 0) {
    updatedPlayer = applyChemistryCeiling(
      updatedPlayer,
      ceiling.capPercent,
      ceiling.durationMonths || 6,
      ceiling.reason
    );
  }

  // Apply stat bonus if specified (e.g. for Iconic cards)
  if (card.effects.bonusStatPoint) {
    updatedPlayer.freeStatPoints = (updatedPlayer.freeStatPoints || 0) + card.effects.bonusStatPoint;
  }

  // Add to player's collected cards
  const newCollected = [
    ...(updatedPlayer.collectedCards || []),
    {
      id: card.id,
      name: card.name,
      category: 'other_career' as any,
      rarity: (card.category === 'iconic' ? 'Iconic' : card.tier === 'legendary' ? 'Legendary' : card.tier === 'gold' ? 'Gold' : 'Silver') as any,
      effects: [
        `Fame: ${fameDelta >= 0 ? '+' : ''}${fameDelta}`,
        badRepDelta ? `Bad Rep: ${badRepDelta >= 0 ? '+' : ''}${badRepDelta}` : '',
        ceiling ? `Chem Capped @ ${ceiling.capPercent}% (${ceiling.durationMonths}m)` : chemDelta ? `Chemistry: ${chemDelta >= 0 ? '+' : ''}${chemDelta}` : '',
        `Quote: "${card.quote.slice(0, 40)}..."`,
      ].filter(Boolean),
      obtainedAt: `Post-Match Interview (${context.matchTitle})`,
      designColor: card.category === 'good' ? 'emerald' : card.category === 'bad' ? 'rose' : card.category === 'iconic' ? 'amber' : 'purple',
    },
  ];
  updatedPlayer.collectedCards = newCollected;

  const outcome: InterviewOutcomeResult = {
    declined: false,
    chosenCard: card,
    fameDelta,
    badRepDelta,
    chemistryDelta: chemDelta,
    appliedChemistryCeiling: ceiling,
    headline: card.effects.mediaHeadline,
    pressSummary: `You answered: "${card.quote}"`,
    fanReaction: card.effects.fanReaction,
  };

  return {
    updatedPlayer,
    outcome,
  };
}

/**
 * Handles interview decline (-10 Fame penalty)
 */
export function handleDeclineInterview(player: PlayerCardData): {
  updatedPlayer: PlayerCardData;
  outcome: InterviewOutcomeResult;
} {
  const famePenalty = 10;
  const curFame = player.fame ?? 50;
  const newFame = Math.max(0, curFame - famePenalty);

  const updatedPlayer: PlayerCardData = {
    ...player,
    fame: newFame,
  };

  const outcome: InterviewOutcomeResult = {
    declined: true,
    fameDelta: -famePenalty,
    badRepDelta: 0,
    chemistryDelta: 0,
    headline: 'Media Blackout: Player Declines Post-Match Press Conference',
    pressSummary: 'Refusing media access hurts your public visibility and sponsor perception (-10 Fame).',
    fanReaction: 'mixed',
  };

  return {
    updatedPlayer,
    outcome,
  };
}
