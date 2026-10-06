import { PlayerCardData, OutfieldDetailedStats } from '../types';
import { LanguageCode, getStoredLanguage } from './localizationSystem';
import { getOfficialPerk } from './gameVocabulary';
import { checkDerbyMatchup } from './matchImportanceSystem';
import {
  getOrCreateOutfieldDetailed,
  syncCategoryStatsFromDetailed,
  calculateWeightedOvr,
} from './statCalculations';

export type PerkCategory =
  | 'Stat'
  | 'Skill'
  | 'Iconic'
  | 'Money'
  | 'Fame'
  | 'Key Match'
  | 'Finance'
  | 'Lifestyle'
  | 'Transfer Market'
  | 'Parent Card';

export interface CareerPerk {
  id: string;
  name: string;
  category: PerkCategory;
  shortDescription: string;
  effect: string;
  howToObtain: string;
  iconName: string;
  badgeColor?: string;
  parentCardTypeId?: string;
  storyTitle?: string;
  storyNarrative?: string;
  statTargeted?: keyof OutfieldDetailedStats;
  isStatBreakPerk?: boolean;
  isSkillPerk?: boolean;
}

export const CAREER_PERKS_REGISTRY: CareerPerk[] = [
  // ==========================================
  // 1. STAT BREAK PERKS (PHY & MEN ATTRIBUTES ONLY)
  // ==========================================
  {
    id: 'bull',
    name: 'Bull',
    category: 'Stat',
    shortDescription: "You've got unnatural strength.",
    effect: '+1 Strength per year until 99. Stat Breaks Strength when it reaches 99 (-> 100).',
    howToObtain: 'The first time Strength reaches 80 while under 20: 10% chance to unlock (one roll only).',
    iconName: 'Dumbbell',
    badgeColor: 'from-amber-600 to-red-800',
    statTargeted: 'strength',
    isStatBreakPerk: true,
    storyTitle: 'Unnatural Primal Power',
    storyNarrative: 'Opponents bounce off your shoulders as if running into concrete pillars. You possess an innate, ferocious core strength that defies human limits.',
  },
  {
    id: 'three_lungs',
    name: 'Three Lungs',
    category: 'Stat',
    shortDescription: 'You never get tired.',
    effect: '+1 Stamina per year until 99. Stat Breaks Stamina at 99 (-> 100).',
    howToObtain: 'The first time Stamina reaches 80 while under 20: 10% chance to unlock (one roll only).',
    iconName: 'Activity',
    badgeColor: 'from-emerald-500 to-teal-700',
    statTargeted: 'stamina',
    isStatBreakPerk: true,
    storyTitle: 'The Infinite Engine',
    storyNarrative: 'While others gasp for air and collapse in extra time, your pulse remains steady. You possess a seemingly limitless biological endurance engine.',
  },
  {
    id: 'speed_merchant',
    name: 'Speed Merchant',
    category: 'Stat',
    shortDescription: "You're simply faster than everyone else.",
    effect: '+1 Pace per year until 99. Stat Breaks Pace at 99 (-> 100).',
    howToObtain: 'The first time Pace reaches 80 while under 20: 10% chance to unlock (one roll only).',
    iconName: 'Zap',
    badgeColor: 'from-yellow-500 to-amber-600',
    statTargeted: 'pace',
    isStatBreakPerk: true,
    storyTitle: 'Pure Unstoppable Velocity',
    storyNarrative: 'When you kick the ball past a defender into open space, no human on the pitch can catch you. Your acceleration leaves entire defenses in the dust.',
  },
  {
    id: 'positional_genius',
    name: 'Positional Genius',
    category: 'Stat',
    shortDescription: 'You always know where to be.',
    effect: '+1 Positioning per year until 99. Stat Breaks Positioning at 99 (-> 100).',
    howToObtain: 'The first time Positioning reaches 80 while under 20: 10% chance to unlock (one roll only).',
    iconName: 'Compass',
    badgeColor: 'from-blue-500 to-indigo-700',
    statTargeted: 'positioning',
    isStatBreakPerk: true,
    storyTitle: 'Master of Spatial Dimensions',
    storyNarrative: 'You don\'t chase the ball—you move where the ball will be three seconds from now. You have an uncanny sixth sense for exploiting defensive seams.',
  },
  {
    id: 'iron_mind',
    name: 'Iron Mind',
    category: 'Stat',
    shortDescription: "You're always focused.",
    effect: '+1 Composure per year until 99. Stat Breaks Composure at 99 (-> 100).',
    howToObtain: 'The first time Composure reaches 80 while under 20: 10% chance to unlock (one roll only).',
    iconName: 'Shield',
    badgeColor: 'from-slate-500 to-zinc-800',
    statTargeted: 'composure',
    isStatBreakPerk: true,
    storyTitle: 'Unshakeable Mental Steel',
    storyNarrative: 'Hostile crowds, deafening whistles, and fierce high pressing cannot shake your calm. Your mind remains ice-cold in the most intense pressure cauldrons.',
  },
  {
    id: 'reader_of_the_game',
    name: 'Reader of the Game',
    category: 'Stat',
    shortDescription: 'You seem to always be a step ahead of everyone.',
    effect: '+1 Reaction per year until 99. Stat Breaks Reaction at 99 (-> 100).',
    howToObtain: 'The first time Reaction reaches 80 while under 20: 10% chance to unlock (one roll only).',
    iconName: 'Eye',
    badgeColor: 'from-purple-500 to-violet-700',
    statTargeted: 'reactions',
    isStatBreakPerk: true,
    storyTitle: 'Precognition on Grass',
    storyNarrative: 'Before a pass is struck or a rebound bounces loose, your body is already in motion. You process football at double the speed of ordinary players.',
  },
  {
    id: 'step_on',
    name: 'Step on',
    category: 'Iconic',
    shortDescription: 'You seem to be impossible to dispossess thanks to your sole-control technique.',
    effect: '+30% to all Retention duels in matches. +1 Retention yearly until 99. Stat Breaks Retention at 99 (-> 100).',
    howToObtain: 'Unlocked exclusively via the Iconic Youth Card "Pisadita" (Step on the ball).',
    iconName: 'Footprints',
    badgeColor: 'from-amber-400 via-yellow-500 to-amber-700',
    statTargeted: 'retention',
    isStatBreakPerk: true,
    storyTitle: 'The Art of La Pisadita',
    storyNarrative: 'Putting the sole of your boot on the ball and shielding it with your body, you freeze defenders in their tracks. Dispossessing you becomes an impossible task.',
  },

  // ==========================================
  // 2. SKILL PERKS (18 CORE ATTRIBUTES - SIMULATION +15% EFFECTIVENESS)
  // ==========================================
  {
    id: 'close_control',
    name: 'Close Control',
    category: 'Skill',
    shortDescription: 'Mastery of close dribbling in tight spaces.',
    effect: '+15% Ball Control effectiveness in match simulation.',
    howToObtain: 'Master tight-space ball control drills or excel in close-quarter dribbling duels.',
    iconName: 'Sparkles',
    badgeColor: 'from-cyan-500 to-blue-700',
    statTargeted: 'ballControl',
    isSkillPerk: true,
    storyTitle: 'Velvet Footwork',
    storyNarrative: 'The ball never strays more than six inches from your boots. In crowded penalty boxes, your delicate touches leave defenders grasping at air.',
  },
  {
    id: 'stepover_merchant',
    name: 'Stepover Merchant',
    category: 'Skill',
    shortDescription: "You're unpredictable with the ball. Defenders don't know how to deal with you.",
    effect: '+15% Dribbling effectiveness in match simulation.',
    howToObtain: 'Execute multiple successful 1v1 take-ons in competitive fixtures.',
    iconName: 'Zap',
    badgeColor: 'from-yellow-400 to-amber-600',
    statTargeted: 'dribbling',
    isSkillPerk: true,
    storyTitle: 'Unpredictable Dazzle',
    storyNarrative: 'Fast feints, rapid stepovers, and deceptive body shifts leave the opposing fullback completely off balance before you burst past them.',
  },
  {
    id: 'first_touch_specialist',
    name: 'First-Touch Specialist',
    category: 'Skill',
    shortDescription: 'Velvet first touch that instantly kills high or awkward passes.',
    effect: '+15% Retention effectiveness in match simulation.',
    howToObtain: 'Sustain high ball retention and control under heavy pressing.',
    iconName: 'Award',
    badgeColor: 'from-blue-400 to-indigo-600',
    statTargeted: 'retention',
    isSkillPerk: true,
    storyTitle: 'The Softest Touch in Football',
    storyNarrative: 'Long booming clearances drop out of the sky and settle motionless at your feet. You instantly neutralize opponent pressing with your first contact.',
  },
  {
    id: 'needle_threader',
    name: 'Needle Threader',
    category: 'Skill',
    shortDescription: 'Uncanny ability to thread defense-splitting passes.',
    effect: '+15% Short Pass effectiveness in match simulation.',
    howToObtain: 'Deliver decisive through-balls and key short passes in key matches.',
    iconName: 'Target',
    badgeColor: 'from-teal-500 to-emerald-700',
    statTargeted: 'shortPass',
    isSkillPerk: true,
    storyTitle: 'Through the Eye of the Needle',
    storyNarrative: 'Where other midfielders see a wall of defenders, you spot millimeter-wide channels to slide devastating through-balls straight to your striker.',
  },
  {
    id: 'quarterback',
    name: 'Quarterback',
    category: 'Skill',
    shortDescription: 'Pinnacle diagonal switches and crossfield passes.',
    effect: '+15% Long Pass effectiveness in match simulation.',
    howToObtain: 'Complete accurate long diagonal switches and switches of play.',
    iconName: 'Globe',
    badgeColor: 'from-indigo-500 to-purple-800',
    statTargeted: 'longPass',
    isSkillPerk: true,
    storyTitle: 'The Long-Range Conductor',
    storyNarrative: 'Pinging sixty-yard passes with pinpoint accuracy to open up the opposite flank, you orchestrate team attacks from deep with masterful precision.',
  },
  {
    id: 'deadly_delivery',
    name: 'Deadly Delivery',
    category: 'Skill',
    shortDescription: 'Venomous whip and pinpoint accuracy on crosses.',
    effect: '+15% Crossing effectiveness in match simulation.',
    howToObtain: 'Provide decisive assists from wide deliveries and set pieces.',
    iconName: 'Flame',
    badgeColor: 'from-orange-500 to-red-700',
    statTargeted: 'crossing',
    isSkillPerk: true,
    storyTitle: 'Venomous Whip from the Flank',
    storyNarrative: 'Your crosses curve viciously between the goalkeeper and retreating defenders, begging for a striker\'s forehead or volley to finish the move.',
  },
  {
    id: 'clinical_striker',
    name: 'Clinical Striker',
    category: 'Skill',
    shortDescription: 'Lethal execution inside the penalty area with both feet.',
    effect: '+15% Shooting effectiveness in match simulation.',
    howToObtain: 'Maintain an elite goal-conversion rate in the penalty area.',
    iconName: 'Target',
    badgeColor: 'from-red-500 to-rose-700',
    statTargeted: 'shooting',
    isSkillPerk: true,
    storyTitle: 'Assassin in the 18-Yard Box',
    storyNarrative: 'Give you half a yard of space in the box and the ball is already nestling in the back of the net. You finish with cold, ruthless efficiency.',
  },
  {
    id: 'long_range_specialist',
    name: 'Long-Range Specialist',
    category: 'Skill',
    shortDescription: 'Unleashes ferocious dipping cannons from distance.',
    effect: '+15% Long Shoot effectiveness in match simulation.',
    howToObtain: 'Score spectacular screamers from outside the penalty area.',
    iconName: 'Zap',
    badgeColor: 'from-amber-500 to-rose-600',
    statTargeted: 'longShots',
    isSkillPerk: true,
    storyTitle: 'Thunderbolts from Distance',
    storyNarrative: 'Goalkeepers fear you lining up a shot from thirty yards. Your long-range strikes dip, swerve, and crash into the top corner with unstoppable power.',
  },
  {
    id: 'aerial_finisher',
    name: 'Aerial Finisher',
    category: 'Skill',
    shortDescription: 'Dominant hang time and bullet headers attacking the cross.',
    effect: '+15% Heading effectiveness in match simulation.',
    howToObtain: 'Win aerial battles and score headers in competitive fixtures.',
    iconName: 'Crown',
    badgeColor: 'from-yellow-600 to-amber-800',
    statTargeted: 'heading',
    isSkillPerk: true,
    storyTitle: 'King of the Air',
    storyNarrative: 'Towering above defenders with supreme hang time, you power bullet headers into the corners of the goal with unstoppable aerial authority.',
  },
  {
    id: 'patient_tackle',
    name: 'Patient Tackle',
    category: 'Skill',
    shortDescription: "You've learned to read your opponent and wait for that perfect moment.",
    effect: '+15% Tackling effectiveness in match simulation.',
    howToObtain: 'Execute clean standing tackles without diving in recklessly.',
    iconName: 'ShieldCheck',
    badgeColor: 'from-slate-600 to-blue-900',
    statTargeted: 'tackling',
    isSkillPerk: true,
    storyTitle: 'Patience of the Sentinel',
    storyNarrative: 'You don\'t jump into reckless challenges. You match the attacker\'s footwork, bait them into a mistake, and dispossess them with surgical precision.',
  },
  {
    id: 'shadow_marker',
    name: 'Shadow Marker',
    category: 'Skill',
    shortDescription: 'Suffocating close-quarter marking denying time to turn.',
    effect: '+15% Marking effectiveness in match simulation.',
    howToObtain: 'Neutralize opposing star forwards across crucial fixtures.',
    iconName: 'Shield',
    badgeColor: 'from-indigo-600 to-slate-900',
    statTargeted: 'marking',
    isSkillPerk: true,
    storyTitle: 'The Unshakeable Shadow',
    storyNarrative: 'The opposing talisman cannot breathe without finding you in their personal space. You deny them time to turn, think, or create danger.',
  },
  {
    id: 'anticipation_master',
    name: 'Anticipation Master',
    category: 'Skill',
    shortDescription: 'Telepathic reading of passing lanes to steal possession.',
    effect: '+15% Interception effectiveness in match simulation.',
    howToObtain: 'Consistently step into passing lanes to intercept opponent attacks.',
    iconName: 'Eye',
    badgeColor: 'from-purple-600 to-indigo-900',
    statTargeted: 'interceptions',
    isSkillPerk: true,
    storyTitle: 'Stealing Possession in Mid-Flight',
    storyNarrative: 'You read the opposing playmaker\'s eyes and step across the passing corridor right before the ball arrives, launching swift transitions.',
  },
  {
    id: 'powerhouse',
    name: 'Powerhouse',
    category: 'Skill',
    shortDescription: 'Imposing physical frame winning shoulder-to-shoulder duels.',
    effect: '+15% Strength effectiveness in match simulation.',
    howToObtain: 'Dominate physical challenges and shield the ball under pressure.',
    iconName: 'Dumbbell',
    badgeColor: 'from-amber-700 to-red-900',
    statTargeted: 'strength',
    isSkillPerk: true,
    storyTitle: 'The Unmovable Wall',
    storyNarrative: 'In direct shoulder-to-shoulder duels and shielding situations, your physical power ensures you keep possession against even the strongest opponents.',
  },
  {
    id: 'relentless_runner',
    name: 'Relentless Runner',
    category: 'Skill',
    shortDescription: 'Limitless engine providing relentless high-intensity sprints.',
    effect: '+15% Stamina effectiveness in match simulation.',
    howToObtain: 'Cover immense ground and maintain high sprint intensity over 90 minutes.',
    iconName: 'Activity',
    badgeColor: 'from-emerald-600 to-teal-800',
    statTargeted: 'stamina',
    isSkillPerk: true,
    storyTitle: 'The 90-Minute Motor',
    storyNarrative: 'From the 1st minute to the 90th, your pressing intensity never drops. You wear down opponents through non-stop running and stamina efficiency.',
  },
  {
    id: 'explosive_burst',
    name: 'Explosive Burst',
    category: 'Skill',
    shortDescription: 'Electric first five yards turning defenders inside out.',
    effect: '+15% Pace effectiveness in match simulation.',
    howToObtain: 'Beat defenders off the mark with sudden explosive bursts of speed.',
    iconName: 'Zap',
    badgeColor: 'from-yellow-400 to-orange-600',
    statTargeted: 'pace',
    isSkillPerk: true,
    storyTitle: 'Zero to Sixty in a Flash',
    storyNarrative: 'From a stationary standing position, your sudden explosive acceleration leaves defenders flat-footed and creates instant separation.',
  },
  {
    id: 'spatial_awareness',
    name: 'Spatial Awareness',
    category: 'Skill',
    shortDescription: 'Innate sixth sense finding pockets of space between lines.',
    effect: '+15% Positioning effectiveness in match simulation.',
    howToObtain: 'Constantly drift into unoccupied zones and exploit tactical gaps.',
    iconName: 'Compass',
    badgeColor: 'from-blue-600 to-cyan-800',
    statTargeted: 'positioning',
    isSkillPerk: true,
    storyTitle: 'Ghosting Between the Lines',
    storyNarrative: 'You have a natural radar for open pitch territory, drifting into dangerous half-spaces where opponent defenders cannot easily mark you.',
  },
  {
    id: 'ice_cold',
    name: 'Ice Cold',
    category: 'Skill',
    shortDescription: 'Absolute composure under heavy pressing and high-pressure moments.',
    effect: '+15% Composure effectiveness in match simulation.',
    howToObtain: 'Perform flawlessly in high-pressure match scenarios and hostile environments.',
    iconName: 'Snowflake',
    badgeColor: 'from-cyan-400 to-blue-800',
    statTargeted: 'composure',
    isSkillPerk: true,
    storyTitle: 'Pulse of a Sniper',
    storyNarrative: 'No matter how chaotic the match becomes or how aggressively opponents close you down, you make decisions with total, unhurried composure.',
  },
  {
    id: 'quick_reader',
    name: 'Quick Reader',
    category: 'Skill',
    shortDescription: 'Split-second instinctive reactions to loose balls and deflections.',
    effect: '+15% Reaction effectiveness in match simulation.',
    howToObtain: 'Pounce on loose balls and rebounds with instinctive speed.',
    iconName: 'Eye',
    badgeColor: 'from-purple-500 to-violet-800',
    statTargeted: 'reactions',
    isSkillPerk: true,
    storyTitle: 'Lightning Reflexes',
    storyNarrative: 'When the ball ricochets or a deflection occurs, your brain reacts instantly, allowing you to seize loose balls before anyone else can react.',
  },

  // ==========================================
  // 3. MONEY PERKS
  // ==========================================
  {
    id: 'early_investor',
    name: 'Early Investor',
    category: 'Money',
    shortDescription: 'Bought your first business early in your career.',
    effect: '+5% yearly business profit across all owned commercial ventures.',
    howToObtain: 'The first money the player spends in their career is used to buy a business.',
    iconName: 'Briefcase',
    badgeColor: 'from-emerald-500 to-teal-700',
    storyTitle: 'Commercial Pioneer',
    storyNarrative: 'While others bought supercars, you invested your earliest earnings straight into cash-flowing enterprises, building a commercial empire from day one.',
  },
  {
    id: 'competent_businessman',
    name: 'Competent Businessman',
    category: 'Money',
    shortDescription: 'Master of commercial expansion.',
    effect: '20% discount on all future business upgrades.',
    howToObtain: 'Fully upgrade one business (reach Tier 5).',
    iconName: 'Building',
    badgeColor: 'from-blue-500 to-indigo-800',
    storyTitle: 'Empire Builder',
    storyNarrative: 'Scaling an enterprise to maximum capacity taught you the intricate art of commercial expansion, unlocking massive cost savings on future growth.',
  },
  {
    id: 'competent_investor',
    name: 'Competent Investor',
    category: 'Money',
    shortDescription: 'Disciplined capital management.',
    effect: '+15% interest gain on savings every Pre-Season.',
    howToObtain: "Player's bank balance first becomes greater than $0 and never returns to $0 until age 20.",
    iconName: 'TrendingUp',
    badgeColor: 'from-amber-400 to-emerald-700',
    storyTitle: 'Compound Interest Master',
    storyNarrative: 'Maintaining unwavering financial discipline through your teenage years has laid an unbreakable foundation for high-yield passive compound wealth.',
  },

  // ==========================================
  // 4. FAME PERKS
  // ==========================================
  {
    id: 'bad_boy',
    name: 'Bad Boy',
    category: 'Fame',
    shortDescription: 'The news outlets love hating you.',
    effect: 'Gain +5 Fame for every Bad Fame point gained.',
    howToObtain: 'Reach 100 Bad Fame before age 22.',
    iconName: 'ShieldAlert',
    badgeColor: 'from-rose-600 to-red-900',
    storyTitle: 'Front-Page Notoriety',
    storyNarrative: 'Tabloids, television pundits, and internet commentators obsess over your rebellious reputation. Every controversy only magnifies your global fame.',
  },
  {
    id: 'fan_favourite',
    name: 'Fan Favourite',
    category: 'Fame',
    shortDescription: 'Beloved by supporters across the globe.',
    effect: '+25% Fame bonus from major positive performances (exceptional matches, trophies, finals, international achievements).',
    howToObtain: 'Achieve a major positive-performance milestone (e.g. 9.0+ match rating, cup final victory, hat-trick).',
    iconName: 'Heart',
    badgeColor: 'from-pink-500 to-rose-700',
    storyTitle: 'Idol of the Terraces',
    storyNarrative: 'Supporters sing your name with unbridled passion. Your magical displays forge an electric emotional bond that turns great matches into legendary acclaim.',
  },
  {
    id: 'marketing_magnet',
    name: 'Marketing Magnet',
    category: 'Fame',
    shortDescription: 'Global commercial icon.',
    effect: '+30% bonus Fame whenever Fame is awarded by a Sponsor Card.',
    howToObtain: 'Sign high-value commercial sponsorship deals.',
    iconName: 'Sparkles',
    badgeColor: 'from-yellow-400 to-amber-600',
    storyTitle: 'Billboard Sensation',
    storyNarrative: 'Your face graces city billboards, magazine covers, and international campaigns. Every brand partnership accelerates your rise as a worldwide icon.',
  },

  // ==========================================
  // 5. EXISTING PRESERVED PERKS & KEY MATCH PERKS
  // ==========================================
  {
    id: 'outside_foot',
    name: 'Outside Foot',
    category: 'Stat',
    shortDescription: 'Mastered outside foot technique instead of weak foot.',
    effect: 'Allows using the outside of the foot instead of the weak foot, granting 5★ weak foot efficiency (1.0x multiplier / 0% penalty) across all match simulation shots and assists.',
    howToObtain: 'Exclusive to the Iconic "Trivela" Street Card (1% draw chance in Street Football).',
    iconName: 'OutsideFoot',
    badgeColor: 'from-amber-400 via-yellow-500 to-amber-700',
    storyTitle: 'The Trivela Master',
    storyNarrative: 'You learned you don\'t need your weak foot at all—you mastered outside foot technique. Bending the ball with the outer instep of your dominant foot with deadly accuracy and venomous curl, defenders and keepers are left stunned.',
  },
  {
    id: 'iron_body',
    name: 'Iron Body',
    category: 'Stat',
    shortDescription: 'Forged like titanium after playing in every fixture of a full season.',
    effect: 'Grants permanent -25% injury risk reduction and raises base fitness floor from 50% to 60%.',
    howToObtain: 'Season Iron Man Milestone: Play in 100% of all official club fixtures across an entire season without missing a game.',
    iconName: 'Shield',
    badgeColor: 'from-slate-400 via-zinc-600 to-slate-900',
    storyTitle: 'Forged in Titanium',
    storyNarrative: 'After facing bone-crunching slide tackles and grueling wars without missing a single match all season, your body simply refuses to break.',
  },
  {
    id: 'magnetic_feet',
    name: 'Magnetic Feet',
    category: 'Stat',
    shortDescription: 'Unrivaled ball control and instant trapping in high-speed play.',
    effect: 'Immune to mis-controls under high pressure; +20% dribble and pass duel success rate.',
    howToObtain: 'Achieve 90+ Ball Control and 90+ Dribbling simultaneously.',
    iconName: 'Sparkles',
    badgeColor: 'from-indigo-500 to-blue-700',
    storyTitle: 'Glued to the Boots',
    storyNarrative: 'The ball adheres to your boots as if magnetized, making dispossession near impossible.',
  },
  {
    id: 'mercenary',
    name: 'Mercenary',
    category: 'Finance',
    shortDescription: 'Sacrificed European spotlight for generational wealth in the Arabian league.',
    effect: '-80% to all fame gains, +20% to bonuses and contract renewal fees in your favor, and makes top European teams less likely to sign you.',
    howToObtain: 'Earned during the Arabian League Mega-Contract Event by accepting a mega-deal from the Saudi Pro League.',
    iconName: 'DollarSign',
    badgeColor: 'from-emerald-500 via-amber-500 to-yellow-600',
    storyTitle: 'Bags of Cash & Zero Illusions',
    storyNarrative: 'Generational wealth is forever. You accepted the colossal financial bag and never looked back.',
  },
  {
    id: 'snake',
    name: 'Judas',
    category: 'Transfer Market',
    shortDescription: 'Betrayed your former club by transferring directly to their arch-rival as an established starter.',
    effect: 'Former club relationship becomes strongly negative (treated as traitor). Any Bad Reputation gained from any source is doubled (×2). Barred from ever returning to the betrayed club.',
    howToObtain: 'Earned by transferring directly from your current club to a fierce qualifying rival while having established starter status.',
    iconName: 'ShieldAlert',
    badgeColor: 'from-emerald-600 via-rose-600 to-slate-950',
    storyTitle: 'The Forbidden Crossing (Judas Saga)',
    storyNarrative: 'By crossing directly to the bitter enemy as a starter, you became the ultimate villain in your former fans\' eyes forever.',
  },
  {
    id: 'ice_in_the_veins',
    name: 'Ice in the Veins',
    category: 'Key Match',
    shortDescription: 'Cool-headed under intense match pressure.',
    effect: 'Reduces the penalty from difficult Tactical Decisions.',
    howToObtain: 'Earned by making 5+ calm, high-pressure tactical decisions successfully in Key Matches or derbies.',
    iconName: 'Snowflake',
    badgeColor: 'from-cyan-500 to-blue-700',
    storyTitle: 'A Chilling Serenity in the Crucible',
    storyNarrative: 'Where others panic in hostile stadiums, your pulse steadily drops. You are coldest when the heat is highest.',
  },
  {
    id: 'big_game_player',
    name: 'Big Game Player',
    category: 'Key Match',
    shortDescription: 'Rises to the occasion in high-stakes fixtures.',
    effect: 'Provides a +10% performance bonus when facing a stronger opponent in an important Key Match or cup final.',
    howToObtain: 'Earned by winning a cup final, title decider, or scoring/assisting against a top European giant.',
    iconName: 'Star',
    badgeColor: 'from-amber-400 to-yellow-600',
    storyTitle: 'Born for the Grandest Stage',
    storyNarrative: 'When the stadium floodlights shine brightest, you rise above everyone else on the pitch.',
  },
  {
    id: 'quick_thinker',
    name: 'Quick Thinker',
    category: 'Key Match',
    shortDescription: 'Sharp mental reflexes in fast-paced scenarios.',
    effect: 'Provides extended reaction time on interactive Tactical Decision prompts, granting +5 Composure during pressure moments.',
    howToObtain: 'Earned through maintaining a 100% tactical decision accuracy streak across 3 consecutive Key Matches.',
    iconName: 'Zap',
    badgeColor: 'from-yellow-400 to-amber-600',
    storyTitle: 'Slow Motion in Chaos',
    storyNarrative: 'To others the game is a blur; to you it unfolds in crystal-clear slow motion.',
  },
  {
    id: 'momentum_player',
    name: 'Momentum Player',
    category: 'Key Match',
    shortDescription: 'Rides positive momentum across decisions.',
    effect: 'Aligned consecutive Tactical Decisions receive compound match rating bonuses and stamina preservation.',
    howToObtain: 'Earned after chaining 3+ consecutive successful match decisions or sustaining a 5-game club win streak.',
    iconName: 'Flame',
    badgeColor: 'from-orange-500 to-red-700',
    storyTitle: 'The Unstoppable Snowball',
    storyNarrative: 'When momentum swings your way, you become an unstoppable avalanche dragging your team to victory.',
  },
  {
    id: 'rival_hunter',
    name: 'Rival Hunter',
    category: 'Key Match',
    shortDescription: 'Relishes direct duels with opposition Key Players.',
    effect: 'Provides a +10% direct duel win rate when facing the opponent team’s designated Star/Key Player in derbies.',
    howToObtain: 'Earned by decisively outperforming opponent star players in 2 local derbies or rivalry fixtures.',
    iconName: 'Target',
    badgeColor: 'from-rose-500 to-red-800',
    storyTitle: 'Predator in the Derby',
    storyNarrative: 'You take genuine pleasure in silencing your fiercest rivals on their home turf.',
  },
  {
    id: 'negotiator',
    name: 'Negotiator',
    category: 'Finance',
    shortDescription: 'Master of leverage in contract talks.',
    effect: 'Provides +15% higher starting wage demands and increases signing bonus offers across all contract negotiations.',
    howToObtain: 'Earned by successfully negotiating a contract extension with a +15% or higher wage raise with your club.',
    iconName: 'Handshake',
    badgeColor: 'from-emerald-500 to-teal-700',
    storyTitle: 'The Cold Art of Leverage',
    storyNarrative: 'You hold all the cards at the negotiating table and command top-dollar valuation.',
  },
  {
    id: 'agent_network',
    name: 'Agent Network',
    category: 'Transfer Market',
    shortDescription: 'Wide agency connections across top leagues.',
    effect: 'Increases the number and variety of transfer proposals received during transfer windows by +2 additional clubs.',
    howToObtain: 'Earned by signing with an elite Tier 1 football agent with 70+ Agency Network rating.',
    iconName: 'Globe',
    badgeColor: 'from-cyan-500 to-teal-700',
    storyTitle: 'Keys to the European Boardrooms',
    storyNarrative: 'Your representation holds direct lines to the most powerful sporting directors in world football.',
  },
  {
    id: 'bargaining_power',
    name: 'Bargaining Power',
    category: 'Transfer Market',
    shortDescription: 'Leverage in competing club bidding wars.',
    effect: 'Allows demanding +20% higher wage bonuses and lower release clause thresholds during transfer bidding wars.',
    howToObtain: 'Earned when 3 or more simultaneous transfer offers are received during a single transfer window.',
    iconName: 'Scale',
    badgeColor: 'from-stone-500 to-slate-800',
    storyTitle: 'The Power of the Bidding War',
    storyNarrative: 'With competing offers on the table, you dictate the terms of your next move.',
  },
  {
    id: 'healthy_lifestyle',
    name: 'Healthy Lifestyle',
    category: 'Lifestyle',
    shortDescription: 'Rigorous recovery and wellness routine.',
    effect: '+15% faster weekly fitness recovery and base fatigue accumulation is reduced during fixture-congested periods.',
    howToObtain: 'Earned by acquiring 2+ recovery/wellness upgrades in the Lifestyle Store and maintaining 85%+ fitness across a season.',
    iconName: 'Heart',
    badgeColor: 'from-rose-500 to-pink-700',
    storyTitle: 'The Temple of Longevity',
    storyNarrative: 'Elite nutrition and recovery routines keep your engine pristine all year round.',
  },
  {
    id: 'extended_pre_season',
    name: 'Extended Pre-Season',
    category: 'Lifestyle',
    shortDescription: 'Arrives early for Pre-Season to maximize training growth across all group stats.',
    effect: 'Grants +5 points in all 3 stats of the selected training group (+15 total). If a stat is near 99, points redistribute to others; if all reach 99, remaining points become free Stat Points.',
    howToObtain: 'Earned by reporting early to pre-season camp or achieving exceptional fitness milestones.',
    iconName: 'Calendar',
    badgeColor: 'from-amber-500 to-orange-700',
    storyTitle: 'First in, Last Out',
    storyNarrative: 'While teammates are still on holiday, you report weeks early to the training grounds, putting in relentless double sessions to hit peak physical condition.',
  },
  {
    id: 'relaxing_vacations',
    name: 'Relaxing Vacations',
    category: 'Lifestyle',
    shortDescription: 'Rest well during vacations with permanent 10% lower injury chance.',
    effect: 'You rest well during your vacation. You return with 10 less stamina during the first 2 months of the season until you recover form, but you have 10% less injury chance (always on).',
    howToObtain: 'Earned by choosing dedicated rest & vacation during the Pre-Season Crossroads event.',
    iconName: 'Sparkles',
    badgeColor: 'from-teal-500 to-emerald-700',
    storyTitle: 'Recharged & Invigorated',
    storyNarrative: 'Taking time to disconnect and relax leaves your muscular structure resilient, permanently cutting injury risks despite taking a few weeks to build full match stamina.',
  },

  // ==========================================
  // 6. PARENT CARD PERKS
  // ==========================================
  {
    id: 'in_the_shadow_of',
    name: 'In The Shadow Of',
    category: 'Parent Card',
    shortDescription: 'Ex-Pro parentage creates unrealistic expectations.',
    effect: 'Sponsor Card pool probability increases to 22.5%, negative Sponsor event probability doubled, higher media pressure.',
    howToObtain: 'Assigned automatically at career creation when starting with the "Ex-Pro Player" Parent Card background.',
    iconName: 'ShieldAlert',
    badgeColor: 'from-purple-600 to-slate-900',
    parentCardTypeId: 'ex_pro_player',
    storyTitle: 'Under the Giant Shadow',
    storyNarrative: 'Growing up bearing the famous name of an ex-pro, every touch is compared to your parent\'s legacy.',
  },
  {
    id: 'built_for_greatness',
    name: 'Iconic Parent',
    category: 'Parent Card',
    shortDescription: 'Iconic footballing lineage.',
    effect: '+10 Stat Points every 5 years, +20% Fame gained from all Fame sources, and +10 Chemistry upon joining any new club.',
    howToObtain: 'Assigned automatically at career creation when starting with the "Iconic Parent" Parent Card background.',
    iconName: 'Crown',
    badgeColor: 'from-yellow-400 to-amber-700',
    parentCardTypeId: 'iconic_parent',
    storyTitle: 'Born to Greatness',
    storyNarrative: 'Born into true footballing royalty, greatness is etched into your DNA.',
  },
  {
    id: 'ask_parents_for_advice',
    name: 'Ask Parents for Advice',
    category: 'Parent Card',
    shortDescription: 'Grounded guidance from a loving family.',
    effect: 'Unlocks a seasonal parental advice boost button in the Persistent UI granting instant morale, focus, or attribute recovery.',
    howToObtain: 'Assigned automatically at career creation when starting with the "Average Family" Parent Card background.',
    iconName: 'Heart',
    badgeColor: 'from-rose-400 to-pink-600',
    parentCardTypeId: 'average_family',
    storyTitle: 'Grounded in Love',
    storyNarrative: 'A loving family keeps you grounded amidst the intense pressures of the professional game.',
  },
  {
    id: 'forced_to_train',
    name: 'Forced To Train',
    category: 'Parent Card',
    shortDescription: 'Relentless family discipline.',
    effect: 'Automatically gain +1 Injury Recovery Point every month, accelerating recovery times from all minor fitness knocks.',
    howToObtain: 'Assigned automatically at career creation when starting with the "Helicopter Parents" Parent Card background.',
    iconName: 'Sparkles',
    badgeColor: 'from-purple-500 to-indigo-800',
    parentCardTypeId: 'helicopter_parents',
    storyTitle: 'Forged in Endless Drills',
    storyNarrative: 'Endless childhood drills forged an iron work ethic and exceptional physical resilience.',
  },
  {
    id: 'outsider_adaptability',
    name: 'Outsider Adaptability',
    category: 'Parent Card',
    shortDescription: 'Resilience forged as an immigrant.',
    effect: '+5 Chemistry immediately when joining any new club, plus +1 permanent Potential on every new club transfer (up to +5).',
    howToObtain: 'Assigned automatically at career creation when starting with the "Immigrant Family" Parent Card background.',
    iconName: 'Globe',
    badgeColor: 'from-emerald-500 to-teal-800',
    parentCardTypeId: 'immigrant_family',
    storyTitle: "The Immigrant's Fire",
    storyNarrative: 'Navigating unfamiliar cultures taught you profound adaptability and fearless drive.',
  },
  {
    id: 'street_survivor',
    name: 'Street Survivor',
    category: 'Parent Card',
    shortDescription: 'Rugged escape from tough beginnings.',
    effect: 'Allows playing 1 match through injury before key finals, plus grants +5 to ALL attributes in Key Matches.',
    howToObtain: 'Assigned automatically at career creation when starting with the "Raised in Ghetto" Parent Card background.',
    iconName: 'Shield',
    badgeColor: 'from-amber-600 to-red-900',
    parentCardTypeId: 'raised_in_ghetto',
    storyTitle: 'Cage Fighter',
    storyNarrative: 'Surviving the concrete street cages taught you to play through pain and never back down.',
  },
  {
    id: 'well_off',
    name: 'Well Off',
    category: 'Parent Card',
    shortDescription: 'Comfortable upbringing creates pressure weakness.',
    effect: 'Start career with €50,000 liquid savings, but suffers -10 Composure in key matches and +5% chance of negative Fame cards.',
    howToObtain: 'Assigned automatically at career creation when starting with the "Rich Parents" Parent Card background.',
    iconName: 'Coins',
    badgeColor: 'from-emerald-400 to-teal-700',
    parentCardTypeId: 'rich_parents',
    storyTitle: 'Silver Spoon Pedigree',
    storyNarrative: 'Raised in total financial comfort, you never lacked elite resources.',
  },
];

// Mapping for Stat Break Perks (PHY and MEN only + Retention from Iconic Youth Card)
export const STAT_BREAK_PERKS_MAP: Record<string, { perkId: string; statKey: keyof OutfieldDetailedStats }> = {
  strength: { perkId: 'bull', statKey: 'strength' },
  stamina: { perkId: 'three_lungs', statKey: 'stamina' },
  pace: { perkId: 'speed_merchant', statKey: 'pace' },
  positioning: { perkId: 'positional_genius', statKey: 'positioning' },
  composure: { perkId: 'iron_mind', statKey: 'composure' },
  reactions: { perkId: 'reader_of_the_game', statKey: 'reactions' },
  retention: { perkId: 'step_on', statKey: 'retention' },
};

// Mapping for 18 Skill Perks (simulation +15% effectiveness)
export const SKILL_PERKS_STAT_MAP: Record<string, string> = {
  ballControl: 'close_control',
  dribbling: 'stepover_merchant',
  retention: 'first_touch_specialist',
  shortPass: 'needle_threader',
  longPass: 'quarterback',
  crossing: 'deadly_delivery',
  shooting: 'clinical_striker',
  longShots: 'long_range_specialist',
  heading: 'aerial_finisher',
  tackling: 'patient_tackle',
  marking: 'shadow_marker',
  interceptions: 'anticipation_master',
  strength: 'powerhouse',
  stamina: 'relentless_runner',
  pace: 'explosive_burst',
  positioning: 'spatial_awareness',
  composure: 'ice_cold',
  reactions: 'quick_reader',
};

// Helper: Get Perk Definition by ID
export function getPerkById(perkId: string): CareerPerk | undefined {
  return CAREER_PERKS_REGISTRY.find((p) => p.id === perkId);
}

// Localized perk overrides dictionary
const PERK_LOCALIZATIONS: Record<string, Partial<Record<LanguageCode, Partial<CareerPerk>>>> = {
  outside_foot: {
    'es-AR': {
      name: 'Tres Dedos',
      shortDescription: 'Dominás el golpe de tres dedos en lugar de usar la pierna mala.',
      effect: 'Permite usar el golpe de tres dedos con el pie hábil en lugar de la pierna mala con 5★ de efectividad (multiplicador 1.0x / 0% de penalización) en tiros y pases.',
      storyTitle: 'El Maestro de los Tres Dedos',
      storyNarrative: 'Aprendiste que no necesitás usar tu pierna mala: dominás el golpe de tres dedos con la cara externa del botín con una comba endemoniada y precisión milimétrica.',
      howToObtain: 'Exclusivo de la Carta Icónica Callejera "Trivela" (1% de probabilidad de aparición).',
    },
    'es-ES': {
      name: 'Tiro de Exterior',
      shortDescription: 'Dominas el golpeo con el exterior del pie en lugar de la pierna mala.',
      effect: 'Permite utilizar el exterior del pie hábil en lugar de la pierna mala con 5★ de efectividad (multiplicador 1.0x / 0% de penalización) en tiros y asistencias.',
      storyTitle: 'El Maestro de la Trivela',
      storyNarrative: 'Descubriste que no necesitas tu pierna mala: perfeccionaste el golpeo con el exterior del pie con un efecto envenenado y precisión quirúrgica.',
      howToObtain: 'Exclusivo de la Carta Icónica Callejera "Trivela" (1% de probabilidad de aparición).',
    },
    'pt-BR': {
      name: 'Trivela',
      shortDescription: 'Dominou o chute de três dedos / trivela no lugar da perna ruim.',
      effect: 'Permite finalizar e cruzar de três dedos (trivela) em vez da perna ruim com 5★ de eficiência (multiplicador 1.0x / 0% de penalidade) em chutes e assistências.',
      storyTitle: 'O Mestre da Trivela',
      storyNarrative: 'Você aprendeu que não precisa da perna ruim: dominou a trivela com a parte externa do pé.',
      howToObtain: 'Exclusivo da Carta Icônica do Futebol de Rua "Trivela" (1% de chance de sorteio).',
    },
    'fr-FR': {
      name: 'Extérieur du pied',
      shortDescription: "Maîtrise la frappe de l'extérieur du pied (Trivela) plutôt que le mauvais pied.",
      effect: "Permet de frapper et passer de l'extérieur du pied à la place du mauvais pied avec 5★ d'efficacité (multiplicateur 1.0x / 0% de pénalité) sur les tirs et passes décisives.",
      storyTitle: "Le Maître de l'Extérieur du Pied",
      storyNarrative: "Vous avez appris que vous n'avez pas besoin de votre mauvais pied : vous maîtrisez parfaitement l'extérieur du pied.",
      howToObtain: 'Exclusif à la Carte Iconique de Rue "Trivela" (1% de chance de tirage).',
    },
  },
  snake: {
    'es-AR': {
      name: 'Judas',
      shortDescription: 'Traicionaste a tu club al fichar directamente por su máximo rival.',
      effect: 'Tu antiguo club te considera un traidor eterno. Duplica la Reputación Negativa de cualquier fuente (x2). Prohibido volver a vestir la camiseta del club traicionado.',
      storyTitle: 'La Traición Prohibida',
      storyNarrative: 'Al cruzar de vereda directamente hacia el enemigo acérrimo como titular indiscutido, te convertiste en el villano eterno para los hinchas.',
      howToObtain: 'Se obtiene al transferirse directamente a un club archirrival siendo titular consolidado.',
    },
    'es-ES': {
      name: 'Judas',
      shortDescription: 'Traicionaste a tu club al fichar directamente por su máximo rival.',
      effect: 'Tu antiguo club te considera un traidor absoluto. Duplica la Reputación Negativa obtenida de cualquier fuente (x2). Prohibido volver a jugar para el club traicionado.',
      storyTitle: 'El Traspaso Prohibido (Ecos de Figo)',
      storyNarrative: 'Al cruzar directamente hacia el eterno rival siendo titular indiscutible, te convertiste en el gran traidor y villano eterno para la afición.',
      howToObtain: 'Se obtiene al traspasarse directamente al eterno rival siendo titular consolidado.',
    },
    'pt-BR': {
      name: 'Judas',
      shortDescription: 'Traiu seu clube ao se transferir diretamente para o arquirrival.',
      effect: 'Seu antigo clube o considera um traidor supremo. Dobra a Reputação Negativa obtida de qualquer fonte (x2). Proíbe permanentemente de retornar ao clube traído.',
      storyTitle: 'A Travessia Proibida',
      storyNarrative: 'Ao assinar diretamente com o rival histórico como titular absoluto, você se tornou o maior vilão da torcida para sempre.',
      howToObtain: 'Conquistado ao se transferir diretamente para o maior rival como titular incontestável.',
    },
    'fr-FR': {
      name: 'Judas',
      shortDescription: 'A trahi son club en signant directement chez le rival juré.',
      effect: 'Votre ancien club vous traite en traître absolu. Double la Mauvaise Réputation obtenue de toute source (x2). Interdiction absolue de rejouer pour le club trahi.',
      storyTitle: 'Le Passage Interdit (Saga Judas)',
      storyNarrative: 'En signant directement chez l’ennemi historique en tant que titulaire indiscutable, vous êtes devenu le pire traître aux yeux de vos anciens supporters.',
      howToObtain: 'Obtenu lors d’un transfert direct vers un rival historique en étant titulaire établi.',
    },
  },
  step_on: {
    'es-AR': {
      name: 'Pisarla',
      shortDescription: 'Ponés la suela sobre la pelota y te volvés imposible de despojar.',
      effect: '+30% de bonificación en todos los duelos de retención durante los partidos. +1 de Retención anual hasta 99. Si la Retención está en 99, rompe el límite a 100.',
      storyTitle: 'El Arte de la Pisadita',
      storyNarrative: 'Esconder la pelota con el cuerpo y frenarla con la suela desconcierta a cualquier rival. Robarte la pelota se vuelve una misión imposible.',
      howToObtain: 'Exclusivo de la Carta Icónica de Juveniles "Pisadita" (1% de probabilidad de aparición).',
    },
    'es-ES': {
      name: 'Pisarla',
      shortDescription: 'Pisas el balón con la suela y resulta imposible quitártelo.',
      effect: '+30% de bonificación en todos los duelos de retención durante los partidos. +1 de Retención anual hasta 99. Si la Retención está en 99, rompe el límite a 100.',
      storyTitle: 'El Dominio de la Pisada',
      storyNarrative: 'Pisar el esférico y protegerlo con el cuerpo congela a los defensas. Despojarte del balón se convierte en una tarea titánica.',
      howToObtain: 'Exclusivo de la Carta Icónica de Juveniles "Pisadita" (1% de probabilidad de aparición).',
    },
    'pt-BR': {
      name: 'Pisar na Bola',
      shortDescription: 'Coloca a sola na bola e se torna impossível de ser desarmado.',
      effect: '+30% de bônus em todos os duelos de retenção durante as partidas. +1 de Retenção anual até 99. Se a Retenção estiver em 99, quebra o limite para 100.',
      storyTitle: 'A Arte da Pisadinha',
      storyNarrative: 'Esconder a bola com o corpo e prendê-la com a sola congela os adversários. Desarmá-lo é uma missão quase impossível.',
      howToObtain: 'Exclusivo da Carta Icônica da Base "Pisadita" (1% de chance de sorteio).',
    },
    'fr-FR': {
      name: 'Mettre le pied sur le ballon',
      shortDescription: 'Met la semelle sur le ballon et devient impossible à déposséder.',
      effect: '+30% de bonus dans tous les duels de conservation du ballon. +1 de Rétention par an jusqu’à 99. Si la Rétention est à 99, brise la limite à 100.',
      storyTitle: "L'Art de la Semelle",
      storyNarrative: 'Protéger le ballon du corps et le bloquer sous la semelle pétrifie les défenseurs.',
      howToObtain: 'Exclusif à la Carte Iconique des Jeunes "Pisadita" (1% de chance de tirage).',
    },
  },
};

/**
 * Returns localized CareerPerk object according to current selected language
 */
export function getLocalizedPerk(perk: CareerPerk, lang?: LanguageCode): CareerPerk {
  const currentLang = lang || getStoredLanguage();
  if (!perk) return perk;

  // Use authoritative game vocabulary
  const official = getOfficialPerk(perk, currentLang);
  if (official && official.name !== perk.name) {
    return official;
  }

  if (currentLang === 'en-GB') return perk;

  const overrides = PERK_LOCALIZATIONS[perk.id]?.[currentLang];
  if (!overrides) return official || perk;

  return {
    ...perk,
    ...overrides,
  };
}

// Helper: Check if Player has Active Perk
export function hasPerk(player: Partial<PlayerCardData> | null | undefined, perkId: string): boolean {
  if (!player) return false;
  return Boolean(
    player.activePerkIds?.includes(perkId) ||
    (Array.isArray((player as any).perks) && (player as any).perks.includes(perkId))
  );
}

// Helper: Check if Perk was Retired (Replaced)
export function isPerkRetired(player: PlayerCardData, perkId: string): boolean {
  return Boolean(player.retiredPerkIds?.includes(perkId));
}

// Helper: Get All Active Perk Objects
export function getActivePerks(player: PlayerCardData): CareerPerk[] {
  const activeIds = player.activePerkIds || [];
  const active: CareerPerk[] = [];
  for (const id of activeIds) {
    const p = getPerkById(id);
    if (p) active.push(p);
  }
  return active;
}

// Parent card perk mapper
export function getParentCardPerkId(typeId?: string, perkTitle?: string): string | undefined {
  if (typeId === 'ex_pro_player' || perkTitle === 'In The Shadow Of') return 'in_the_shadow_of';
  if (typeId === 'iconic_parent' || perkTitle === 'Built For Greatness') return 'built_for_greatness';
  if (typeId === 'average_family' || perkTitle === 'Ask Parents for Advice') return 'ask_parents_for_advice';
  if (typeId === 'helicopter_parents' || perkTitle === 'Forced To Train') return 'forced_to_train';
  if (typeId === 'immigrant_family' || perkTitle === 'Outsider Adaptability') return 'outsider_adaptability';
  if (typeId === 'raised_in_ghetto' || perkTitle === 'Street Survivor') return 'street_survivor';
  if (typeId === 'rich_parents' || perkTitle === 'Well Off') return 'well_off';
  return undefined;
}

// Ensure Player Perks are synced with equipped Parent Card & Defaults
export function ensurePlayerPerksSync(player: PlayerCardData): PlayerCardData {
  let activeIds = [...(player.activePerkIds || [])];
  const retiredIds = [...(player.retiredPerkIds || [])];

  // If equipped parent card has a perk, sync it into active perks if not already active or retired
  if (player.equippedParentCard) {
    const parentPerkId = getParentCardPerkId(
      player.equippedParentCard.typeId,
      player.equippedParentCard.perkTitle
    );

    if (parentPerkId && !activeIds.includes(parentPerkId) && !retiredIds.includes(parentPerkId)) {
      if (activeIds.length < 5) {
        activeIds.push(parentPerkId);
      }
    }
  }

  // Ensure activeIds max length is 5
  if (activeIds.length > 5) {
    activeIds = activeIds.slice(0, 5);
  }

  return {
    ...player,
    activePerkIds: activeIds,
    retiredPerkIds: retiredIds,
  };
}

// Earn Perk Action
export function earnPerk(
  player: PlayerCardData,
  perkId: string
): {
  updatedPlayer: PlayerCardData;
  added: boolean;
  requiresReplacement: boolean;
  perkToEarn?: CareerPerk;
} {
  const syncedPlayer = ensurePlayerPerksSync(player);
  const perk = getPerkById(perkId);

  if (!perk) {
    return { updatedPlayer: syncedPlayer, added: false, requiresReplacement: false };
  }

  // Check if perk is already retired or active
  if (isPerkRetired(syncedPlayer, perkId) || hasPerk(syncedPlayer, perkId)) {
    return { updatedPlayer: syncedPlayer, added: false, requiresReplacement: false, perkToEarn: perk };
  }

  const activeIds = [...(syncedPlayer.activePerkIds || [])];

  if (activeIds.length < 5) {
    activeIds.push(perkId);
    const updatedPlayer: PlayerCardData = {
      ...syncedPlayer,
      activePerkIds: activeIds,
    };
    return { updatedPlayer, added: true, requiresReplacement: false, perkToEarn: perk };
  }

  // Already at 5 active perks -> requires replacement!
  return { updatedPlayer: syncedPlayer, added: false, requiresReplacement: true, perkToEarn: perk };
}

// Replace Perk Action
export function replacePerk(
  player: PlayerCardData,
  oldPerkId: string,
  newPerkId: string
): PlayerCardData {
  const syncedPlayer = ensurePlayerPerksSync(player);
  const activeIds = [...(syncedPlayer.activePerkIds || [])];
  const retiredIds = [...(syncedPlayer.retiredPerkIds || [])];

  const index = activeIds.indexOf(oldPerkId);
  if (index !== -1) {
    activeIds.splice(index, 1);
  }

  if (!retiredIds.includes(oldPerkId)) {
    retiredIds.push(oldPerkId);
  }

  if (!activeIds.includes(newPerkId) && activeIds.length < 5) {
    activeIds.push(newPerkId);
  }

  return {
    ...syncedPlayer,
    activePerkIds: activeIds,
    retiredPerkIds: retiredIds,
  };
}

// Discard New Perk Action
export function discardPerk(
  player: PlayerCardData,
  discardedPerkId: string
): PlayerCardData {
  const syncedPlayer = ensurePlayerPerksSync(player);
  const retiredIds = [...(syncedPlayer.retiredPerkIds || [])];

  if (!retiredIds.includes(discardedPerkId)) {
    retiredIds.push(discardedPerkId);
  }

  return {
    ...syncedPlayer,
    retiredPerkIds: retiredIds,
  };
}

/**
 * Checks triggers for the 6 Stat Break Perks:
 * Bull (Strength), Three Lungs (Stamina), Speed Merchant (Pace),
 * Positional Genius (Positioning), Iron Mind (Composure), Reader of the Game (Reaction).
 * Condition: First time stat reaches >= 80 while under age 20 (10% chance - doubled from 5%).
 */
export function checkAndTriggerStatBreakPerks(
  player: PlayerCardData
): { updatedPlayer: PlayerCardData; unlockedPerks: CareerPerk[]; logs: string[] } {
  let copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  const age = copy.age || 18;
  const detailed = getOrCreateOutfieldDetailed(copy.stats);
  const rolledMap = { ...(copy.statBreakPerkRolled || {}) };
  const unlockedPerks: CareerPerk[] = [];
  const logs: string[] = [];

  if (age < 20) {
    for (const [statKey, info] of Object.entries(STAT_BREAK_PERKS_MAP)) {
      if (info.perkId === 'step_on') continue; // Step on is exclusively from Iconic Youth Card
      const val = (detailed as any)[statKey] || 0;
      if (val >= 80 && !rolledMap[statKey] && !hasPerk(copy, info.perkId) && !isPerkRetired(copy, info.perkId)) {
        rolledMap[statKey] = true;
        // 10% chance roll (doubled from 5%)
        const rolledSuccess = Math.random() < 0.10;
        if (rolledSuccess) {
          const earnRes = earnPerk(copy, info.perkId);
          copy = earnRes.updatedPlayer;
          const perk = getPerkById(info.perkId);
          if (perk) {
            unlockedPerks.push(perk);
            logs.push(`⭐ STAT BREAK PERK UNLOCKED: "${perk.name}"! (+1 ${statKey.toUpperCase()}/year until 99, Stat Breaks at 99 -> 100).`);
          }
        }
      }
    }
  }

  copy.statBreakPerkRolled = rolledMap;
  return { updatedPlayer: copy, unlockedPerks, logs };
}

/**
 * Applies annual +1 stat growth for active Stat Break Perks (Bull, Three Lungs, Speed Merchant, etc.)
 * If stat reaches 99 (or 100), executes Stat Break to 100 and permanently protects it!
 */
export function applyAnnualStatBreakPerkGrowth(
  player: PlayerCardData
): { updatedPlayer: PlayerCardData; logs: string[]; statBreakOccurred: boolean } {
  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  const detailed = getOrCreateOutfieldDetailed(copy.stats);
  const brokenMap = { ...(copy.statBreakStats || {}) };
  const logs: string[] = [];
  let statBreakOccurred = false;

  for (const [statKey, info] of Object.entries(STAT_BREAK_PERKS_MAP)) {
    if (hasPerk(copy, info.perkId)) {
      const currentVal = (detailed as any)[statKey] || 50;
      if (currentVal < 99) {
        (detailed as any)[statKey] = currentVal + 1;
        logs.push(`⚡ ${info.perkId.toUpperCase()} Perk Growth: +1 ${statKey.toUpperCase()} (${currentVal} ➔ ${currentVal + 1}).`);
      } else if (currentVal >= 99 && !brokenMap[statKey]) {
        // EXECUTE STAT BREAK TO 100!
        (detailed as any)[statKey] = 100;
        brokenMap[statKey] = 100;
        copy.statBreakActive = true;
        statBreakOccurred = true;
        const perk = getPerkById(info.perkId);
        logs.push(`👑 STAT BREAK ACHIEVED via ${perk?.name || 'Perk'}! ${statKey.toUpperCase()} reached 99 and broke through to 100 (Historic Masterclass)!`);

        // Record history
        copy.statBreakHistory = [
          ...(copy.statBreakHistory || []),
          {
            statKey,
            previousValue: currentVal,
            newValue: 100,
            cardName: `Perk: ${perk?.name || 'Stat Break Perk'}`,
            timestamp: copy.calendarDate || new Date().toISOString(),
          },
        ];
      }
    }
  }

  // Permanently lock all broken stats at 100
  Object.keys(brokenMap).forEach((k) => {
    if ((detailed as any)[k] !== undefined) {
      (detailed as any)[k] = 100;
    }
  });

  copy.statBreakStats = brokenMap;
  copy.stats = syncCategoryStatsFromDetailed(copy.stats, detailed);
  copy.ovr = calculateWeightedOvr(
    copy.position || 'ST',
    copy.subPosition || copy.position || 'ST',
    copy.stats,
    copy.playStyle
  );

  return { updatedPlayer: copy, logs, statBreakOccurred };
}

/**
 * Permanently locks all broken stats at 100, protecting them from any regression or decline.
 */
export function enforceStatBreakPermanence(player: PlayerCardData): PlayerCardData {
  if (!player || !player.stats) return player;
  const brokenMap = player.statBreakStats || {};
  if (Object.keys(brokenMap).length === 0) return player;

  const copy: PlayerCardData = JSON.parse(JSON.stringify(player));
  const detailed = getOrCreateOutfieldDetailed(copy.stats);

  let changed = false;
  Object.keys(brokenMap).forEach((k) => {
    if ((detailed as any)[k] !== undefined && (detailed as any)[k] < 100) {
      (detailed as any)[k] = 100;
      changed = true;
    }
  });

  if (changed) {
    copy.stats = syncCategoryStatsFromDetailed(copy.stats, detailed);
  }
  return copy;
}

/**
 * Returns the simulation multiplier for a given stat based on active Skill Perks (+15% effectiveness) or Step on perk (+30% retention).
 */
export function getSkillPerkSimulationMultiplier(
  player: Partial<PlayerCardData> | null | undefined,
  statKey: string
): number {
  if (!player) return 1.0;
  if (statKey === 'retention' && (hasPerk(player, 'step_on') || Boolean((player as any).hasStepOnPerk))) {
    return 1.30; // +30% effectiveness for Step On (Pisarla) perk in retention duels
  }
  const perkId = SKILL_PERKS_STAT_MAP[statKey];
  if (perkId && hasPerk(player, perkId)) {
    return 1.15; // +15% effectiveness in simulation
  }
  return 1.0;
}

/**
 * Evaluates and awards the "Iron Body" perk.
 */
export function checkAndGrantIronBodyPerk(
  player: PlayerCardData,
  block1Matches: { playerStatus?: string; status?: string; isInjured?: boolean; minutesPlayed?: number }[],
  block2Matches: { playerStatus?: string; status?: string; isInjured?: boolean; minutesPlayed?: number }[]
): {
  updatedPlayer: PlayerCardData;
  granted: boolean;
  message?: string;
  perk?: CareerPerk;
} {
  const allMatches = [...(block1Matches || []), ...(block2Matches || [])];
  if (allMatches.length === 0) {
    return { updatedPlayer: player, granted: false };
  }

  if (hasPerk(player, 'iron_body') || player.activePerkIds?.includes('iron_body')) {
    return { updatedPlayer: player, granted: false };
  }

  const playedEveryMatch = allMatches.every((m) => {
    if (m.isInjured && (!m.minutesPlayed || m.minutesPlayed === 0)) return false;
    const s = m.playerStatus || m.status;
    if (s === 'benched' || s === 'not_called' || s === 'bench' || s === 'sub_did_not_enter') {
      return false;
    }
    return (
      s === 'starter' ||
      s === 'sub_out' ||
      s === 'sub_in' ||
      s === 'sub' ||
      s === 'sub_entered' ||
      (m.minutesPlayed !== undefined && m.minutesPlayed > 0)
    );
  });

  if (!playedEveryMatch) {
    return { updatedPlayer: player, granted: false };
  }

  const ironBodyPerk = getPerkById('iron_body');
  const earnRes = earnPerk(player, 'iron_body');
  let nextPlayer = earnRes.updatedPlayer;

  if (earnRes.requiresReplacement || !nextPlayer.activePerkIds?.includes('iron_body')) {
    const currentActive = [...(nextPlayer.activePerkIds || [])];
    if (currentActive.length >= 5) {
      currentActive[currentActive.length - 1] = 'iron_body';
    } else {
      currentActive.push('iron_body');
    }
    nextPlayer = {
      ...nextPlayer,
      activePerkIds: currentActive,
    };
  }

  const currentFit = nextPlayer.fitness !== undefined ? nextPlayer.fitness : 100;
  const newFit = Math.max(60, currentFit);
  nextPlayer.fitness = newFit;
  nextPlayer.staminaCurrent = newFit;

  return {
    updatedPlayer: nextPlayer,
    granted: true,
    message: `🛡️ PERK UNLOCKED: "Iron Body"! You played in every single fixture this season without missing a game! Grants -25% permanent injury risk and raises your base fitness floor from 50% to 60%!`,
    perk: ironBodyPerk,
  };
}

export interface PerkMilestoneEvaluationContext {
  goalsThisSeason?: number;
  assistsThisSeason?: number;
  avgRating?: number;
  matchesPlayed?: number;
  consecutiveCleanSeasons?: number;
  businessCount?: number;
  hasMaxTierBusiness?: boolean;
  firstMoneySpentOnBusiness?: boolean;
  liquidSavings?: number;
  netWorth?: number;
  agentNetwork?: number;
  transferOffersCount?: number;
  wonCupFinal?: boolean;
  highPressureDecisionsStreak?: number;
  wellnessUpgradesCount?: number;
  isSaudiTransfer?: boolean;
  badFameReached100Under22?: boolean;
  majorPositivePerformance?: boolean;
  sponsorCardFameTriggered?: boolean;
}

/**
 * Evaluates career milestone conditions and returns the first eligible unlocked perk.
 */
export function checkCareerPerkMilestones(
  player: PlayerCardData,
  ctx: PerkMilestoneEvaluationContext = {}
): CareerPerk | null {
  const synced = ensurePlayerPerksSync(player);
  const active = synced.activePerkIds || [];
  const retired = synced.retiredPerkIds || [];

  const isEligible = (id: string) => !active.includes(id) && !retired.includes(id);

  // 1. Early Investor (Money Perk)
  if (isEligible('early_investor')) {
    if (ctx.firstMoneySpentOnBusiness || player.spentMoneyOnBusinessFirst) {
      return getPerkById('early_investor') || null;
    }
  }

  // 2. Competent Businessman (Money Perk)
  if (isEligible('competent_businessman')) {
    if (ctx.hasMaxTierBusiness) {
      return getPerkById('competent_businessman') || null;
    }
  }

  // 3. Competent Investor (Money Perk)
  if (isEligible('competent_investor')) {
    const age = player.age || 18;
    if (age >= 20 && player.hasNeverHitZeroBalanceSinceFirstDeposit) {
      return getPerkById('competent_investor') || null;
    }
  }

  // 4. Bad Boy (Fame Perk)
  if (isEligible('bad_boy')) {
    const badRep = player.badReputation || 1;
    const age = player.age || 18;
    if ((badRep >= 100 || ctx.badFameReached100Under22) && age <= 22) {
      return getPerkById('bad_boy') || null;
    }
  }

  // 5. Fan Favourite (Fame Perk)
  if (isEligible('fan_favourite')) {
    if (ctx.majorPositivePerformance || (ctx.avgRating && ctx.avgRating >= 8.5) || ctx.wonCupFinal) {
      return getPerkById('fan_favourite') || null;
    }
  }

  // 6. Marketing Magnet (Fame Perk)
  if (isEligible('marketing_magnet')) {
    if (ctx.sponsorCardFameTriggered || (player.fame && player.fame >= 250)) {
      return getPerkById('marketing_magnet') || null;
    }
  }

  // 7. Big Game Player
  if (isEligible('big_game_player')) {
    if (ctx.wonCupFinal) {
      return getPerkById('big_game_player') || null;
    }
  }

  // 8. Ice in the Veins
  if (isEligible('ice_in_the_veins')) {
    if (ctx.highPressureDecisionsStreak && ctx.highPressureDecisionsStreak >= 5) {
      return getPerkById('ice_in_the_veins') || null;
    }
  }

  // 9. Agent Network
  if (isEligible('agent_network')) {
    if (ctx.agentNetwork && ctx.agentNetwork >= 70) {
      return getPerkById('agent_network') || null;
    }
  }

  // 10. Bargaining Power
  if (isEligible('bargaining_power')) {
    if (ctx.transferOffersCount && ctx.transferOffersCount >= 3) {
      return getPerkById('bargaining_power') || null;
    }
  }

  // 11. Healthy Lifestyle
  if (isEligible('healthy_lifestyle')) {
    const fitness = player.fitness !== undefined ? player.fitness : 100;
    if ((ctx.wellnessUpgradesCount && ctx.wellnessUpgradesCount >= 2) && fitness >= 85) {
      return getPerkById('healthy_lifestyle') || null;
    }
  }

  // 12. Stat Break Perks (PHY & MEN stats reaching 80+ under age 20)
  // Double chance from 5% to 10% (one roll per eligible stat)
  const age = player.age || 18;
  if (age < 20) {
    const detailed = getOrCreateOutfieldDetailed(player.stats);
    const rolledMap = { ...(player.statBreakPerkRolled || {}) };
    for (const [statKey, info] of Object.entries(STAT_BREAK_PERKS_MAP)) {
      if (info.perkId === 'step_on') continue;
      if (!isEligible(info.perkId)) continue;
      if (rolledMap[statKey]) continue;

      const val = (detailed as any)[statKey] || 0;
      if (val >= 80) {
        rolledMap[statKey] = true;
        player.statBreakPerkRolled = rolledMap;
        // 10% chance roll (doubled from 5%)
        if (Math.random() < 0.10) {
          const perk = getPerkById(info.perkId);
          if (perk) {
            return perk;
          }
        }
      }
    }
    player.statBreakPerkRolled = rolledMap;
  }

  return null;
}

/**
 * Calculates modified fame gain considering Fame Perks and Mercenary.
 */
export function calculateModifiedFameGain(
  player: Partial<PlayerCardData>,
  rawFameGain: number,
  source?: 'sponsor' | 'performance' | 'bad_fame' | 'general'
): number {
  if (rawFameGain <= 0) return rawFameGain;
  let multiplier = 1.0;

  if (hasPerk(player, 'mercenary')) {
    multiplier *= 0.20; // -80% fame gain
  }

  if (source === 'performance' && hasPerk(player, 'fan_favourite')) {
    multiplier *= 1.25; // +25% fame bonus from major performances
  }

  if (source === 'sponsor' && hasPerk(player, 'marketing_magnet')) {
    multiplier *= 1.30; // +30% bonus fame from sponsors
  }

  return Math.max(1, Math.round(rawFameGain * multiplier));
}

/**
 * Checks if player has the Step On / Pisarla perk active (from Iconic Pisadita Youth Card).
 */
export function hasStepOnPerk(player: Partial<PlayerCardData> | null | undefined): boolean {
  if (!player) return false;
  return Boolean(
    player.hasStepOnPerk ||
    player.activePerkIds?.includes('step_on') ||
    (Array.isArray((player as any).perks) && (player as any).perks.includes('step_on'))
  );
}

/**
 * Checks if player has the Outside Foot perk active (from Iconic Trivela Street Card).
 */
export function hasOutsideFootPerk(player: Partial<PlayerCardData> | null | undefined): boolean {
  if (!player) return false;
  return Boolean(
    player.hasOutsideFootPerk ||
    player.activePerkIds?.includes('outside_foot') ||
    (Array.isArray((player as any).perks) && (player as any).perks.includes('outside_foot'))
  );
}

/**
 * Checks if player has the Snake perk active.
 */
export function hasSnakePerk(player: Partial<PlayerCardData> | null | undefined): boolean {
  if (!player) return false;
  return Boolean(
    player.hasSnakePerk ||
    player.activePerkIds?.includes('snake') ||
    (Array.isArray((player as any).perks) && (player as any).perks.includes('snake'))
  );
}

export interface RivalBetrayalCheckResult {
  isRivalTransfer: boolean;
  isBetrayal: boolean;
  betrayedClub: string;
  destinationClub: string;
  rivalryName?: string;
  wasStarter: boolean;
}

/**
 * Evaluates whether a direct transfer constitutes a Rival Betrayal (Judas system).
 */
export function checkRivalBetrayalTransfer(
  player: Partial<PlayerCardData>,
  destinationClubName: string,
  destinationClubRivals?: string[]
): RivalBetrayalCheckResult {
  const currentClub = (player.club || '').trim();

  if (
    !currentClub ||
    currentClub === 'Free Agent' ||
    currentClub === 'Youth Prospect' ||
    currentClub === 'Street Football' ||
    currentClub === 'Unassigned' ||
    player.isFreeAgent
  ) {
    return {
      isRivalTransfer: false,
      isBetrayal: false,
      betrayedClub: '',
      destinationClub: destinationClubName,
      wasStarter: false,
    };
  }

  const curLower = currentClub.toLowerCase();
  const destLower = (destinationClubName || '').toLowerCase();

  const isCurrentManCity = curLower.includes('manchester city') || curLower.includes('man city');
  const isDestManCity = destLower.includes('manchester city') || destLower.includes('man city');

  const isLondonClub = (name: string) =>
    name.includes('arsenal') ||
    name.includes('chelsea') ||
    name.includes('tottenham') ||
    name.includes('spurs');

  // MANCHESTER CITY SPECIAL RIVALRY RULES:
  // Judas triggered for: Man City ⇄ Man United, Man City ⇄ Liverpool
  // Judas NOT triggered for: Man City ⇄ Arsenal, Chelsea, Tottenham Hotspur
  if ((isCurrentManCity && isLondonClub(destLower)) || (isDestManCity && isLondonClub(curLower))) {
    return {
      isRivalTransfer: false,
      isBetrayal: false,
      betrayedClub: currentClub,
      destinationClub: destinationClubName,
      wasStarter: false,
    };
  }

  const derby = checkDerbyMatchup(
    currentClub,
    destinationClubName,
    player.clubId ? undefined : undefined,
    destinationClubRivals
  );

  const isRivalTransfer = Boolean(derby);
  const role = (player.squadRole || '').toLowerCase();
  const squadDest = (player.squadDestination || '').toLowerCase();
  const wasStarter =
    role.includes('starter') ||
    role.includes('key') ||
    role.includes('regular') ||
    role.includes('first team') ||
    squadDest.includes('first team') ||
    ((player.ovr || 0) >= 70 && !player.isYouthCareerActive && !role.includes('reserve') && !role.includes('u20'));

  return {
    isRivalTransfer,
    isBetrayal: isRivalTransfer && wasStarter,
    betrayedClub: currentClub,
    destinationClub: destinationClubName,
    rivalryName: derby?.name,
    wasStarter,
  };
}

/**
 * Doubles any Bad Reputation gained from any source if player has the Judas perk ('snake')
 */
export function calculateModifiedBadReputationGain(
  player: Partial<PlayerCardData> | null | undefined,
  rawDelta: number
): number {
  if (!player || rawDelta <= 0) return rawDelta;
  const isJudas = hasPerk(player, 'snake') || Boolean(player.hasSnakePerk);
  if (isJudas) {
    return rawDelta * 2;
  }
  return rawDelta;
}
