import { CustomCard, CustomCardTier, CardModifier, ModifierTarget } from '../types';
import { YouthCardTemplate, YouthCardRarity, YouthCardStatBonus, YouthCardEffectSet } from '../types/youthLeagueCards';
import { CareerStageCardInstance } from '../utils/careerCardSystem';
import { StreetCardDefinition, StreetCardId, TierValues } from '../types/streetCards';

/**
 * Master Outfield Stats Metadata (18 stats across 6 groups)
 * Group 1: PHY (Physical): Pace, Stamina, Strength
 * Group 2: PRO (Progression): Ball Control, Ball Retention, Dribbling
 * Group 3: CRE (Creation): Short Pass, Long Pass, Crossing
 * Group 4: SCO (Goalscoring): Shooting, Heading, Long Shots
 * Group 5: DEF (Defensive): Tackling, Marking, Interceptions
 * Group 6: MEN (Mental): Position, Composure, Reaction
 */
export interface SingleStatMetadata {
  statKey: string;
  statLabel: string;
  groupKey: 'PHY' | 'PRO' | 'CRE' | 'SCO' | 'DEF' | 'MEN' | 'GK';
  groupLabel: string;
  iconName: string;
  designColor: string;
  // Football fantasy names & descriptions
  streetFlatName: string;
  streetFlatDesc: string;
  streetPointsName: string;
  streetPointsDesc: string;

  youthFlatName: string;
  youthFlatDesc: string;
  youthPointsName: string;
  youthPointsDesc: string;

  careerFlatName: string;
  careerFlatDesc: string;
  careerPointsName: string;
  careerPointsDesc: string;
}

export const OUTFIELD_STAT_METADATA: SingleStatMetadata[] = [
  // PHY (Physical)
  {
    statKey: 'pace',
    statLabel: 'Pace',
    groupKey: 'PHY',
    groupLabel: 'Physical',
    iconName: 'Zap',
    designColor: 'from-amber-600 via-orange-600 to-slate-950',
    streetFlatName: 'Alleyway Breakaway',
    streetFlatDesc: 'A blistering burst of speed down the concrete alley leaving asphalt defenders completely in the dust.',
    streetPointsName: 'Asphalt Footrace',
    streetPointsDesc: 'Winning an all-out footrace to a loose ball bouncing off the neighborhood curb.',
    youthFlatName: 'Trial Sprint Burst',
    youthFlatDesc: 'Exploding past your marker during an academy trial match to leave the scouts speechless.',
    youthPointsName: 'Touchline Burner',
    youthPointsDesc: 'Torching the full-back down the flank in a decisive youth league duel.',
    careerFlatName: 'Counter-Attack Surge',
    careerFlatDesc: 'A lung-busting 70-yard counter-attack sprint that turns defense into a match-winning chance.',
    careerPointsName: 'Fastbreak Sprint',
    careerPointsDesc: 'Accelerating through the defensive channel on a rapid breakaway sprint.',
  },
  {
    statKey: 'stamina',
    statLabel: 'Stamina',
    groupKey: 'PHY',
    groupLabel: 'Physical',
    iconName: 'Activity',
    designColor: 'from-emerald-600 via-teal-700 to-slate-950',
    streetFlatName: 'Sunset Cage Marathon',
    streetFlatDesc: 'Playing four non-stop hours in the metal cage until dusk without catching a single breath.',
    streetPointsName: 'No-Sub Grinder',
    streetPointsDesc: 'Grinding through a grueling concrete street final with zero substitutions available.',
    youthFlatName: 'Youth Cup Extra-Time',
    youthFlatDesc: 'Powering through 120 agonizing minutes of a high-stakes youth tournament elimination match.',
    youthPointsName: 'Full-Pitch Press',
    youthPointsDesc: 'Leading the team-wide high press for 90 continuous minutes across heavy academy pitches.',
    careerFlatName: '90th-Minute Roar',
    careerFlatDesc: 'Summoning an electrifying surge of energy deep into stoppage time to chase down the title decider.',
    careerPointsName: 'Second-Wind Surge',
    careerPointsDesc: 'Finding boundless extra energy when opponents are running on empty.',
  },
  {
    statKey: 'strength',
    statLabel: 'Strength',
    groupKey: 'PHY',
    groupLabel: 'Physical',
    iconName: 'Dumbbell',
    designColor: 'from-red-600 via-rose-700 to-slate-950',
    streetFlatName: 'Cage Wall-Check',
    streetFlatDesc: 'Winning a fierce physical shoulder clash and pinning the defender against the cage chain-link fence.',
    streetPointsName: 'Shoulder-Drop Duel',
    streetPointsDesc: 'Absorbing a brutal body check from an older street veteran without budging an inch.',
    youthFlatName: 'Shielded Hold',
    youthFlatDesc: 'Holding off two towering center-backs to protect the ball and draw an academy set piece.',
    youthPointsName: 'Post-Up Turn',
    youthPointsDesc: 'Posting up the opposing stopper with low center of gravity to spin into open grass.',
    careerFlatName: 'Bulldozer Duel',
    careerFlatDesc: 'Overpowering elite international defenders in a ferocious physical duel inside the penalty box.',
    careerPointsName: 'Power Shield',
    careerPointsDesc: 'Using immovable core strength to seal off the defender and keep possession under heavy contact.',
  },

  // PRO (Progression)
  {
    statKey: 'ballControl',
    statLabel: 'Ball Control',
    groupKey: 'PRO',
    groupLabel: 'Progression',
    iconName: 'Footprints',
    designColor: 'from-blue-600 via-indigo-700 to-slate-950',
    streetFlatName: 'Cobblestone Dead-Stop',
    streetFlatDesc: 'Killing an erratic bouncing ball completely dead on uneven cobblestone with one sublime touch.',
    streetPointsName: 'Plucked from Sky',
    streetPointsDesc: 'Bringing a soaring 50-yard clearance out of the clouds with an effortless cushioned boot.',
    youthFlatName: 'First-Touch Turn',
    youthFlatDesc: 'Directing a hard-driven academy pass with an instantaneous first-touch spin into space.',
    youthPointsName: 'Cushioned Take',
    youthPointsDesc: 'Absorbing a stinging half-volley directly onto your instep while surrounded by pressing markers.',
    careerFlatName: 'Velvet Trapping',
    careerFlatDesc: 'Trapping an awkward spinning ball instantly in tight midfield traffic on live television.',
    careerPointsName: 'Pocket Cushion',
    careerPointsDesc: 'Receiving the ball on the half-turn between defensive lines with flawless velvet precision.',
  },
  {
    statKey: 'retention',
    statLabel: 'Ball Retention',
    groupKey: 'PRO',
    groupLabel: 'Progression',
    iconName: 'Shield',
    designColor: 'from-violet-600 via-purple-700 to-slate-950',
    streetFlatName: 'Corner-Box Trap',
    streetFlatDesc: 'Trapping the ball against the street corner wall and shielding it away from three hungry pickpockets.',
    streetPointsName: 'Body-Shield Pivot',
    streetPointsDesc: 'Spinning smoothly on your pivot foot to absorb contact and keep the ball under your spell.',
    youthFlatName: 'Press-Break Spin',
    youthFlatDesc: 'Wriggling out of a coordinated three-man academy pressing trap without conceding possession.',
    youthPointsName: 'Tight-Space Hold',
    youthPointsDesc: 'Holding onto the ball in an impossibly congested midfield pocket under intense pressure.',
    careerFlatName: 'Iron-Grip Hold',
    careerFlatDesc: 'Holding up play against world-class defenders draped all over you until your teammates arrive.',
    careerPointsName: 'Escape the Trap',
    careerPointsDesc: 'Rolling away cleanly from an aggressive double-team tackle to unlock an attacking lane.',
  },
  {
    statKey: 'dribbling',
    statLabel: 'Dribbling',
    groupKey: 'PRO',
    groupLabel: 'Progression',
    iconName: 'Flame',
    designColor: 'from-orange-500 via-amber-600 to-slate-950',
    streetFlatName: 'Nutmeg & Go',
    streetFlatDesc: 'Slipping the ball clean through the defender’s legs and retrieving it with an audacious flick.',
    streetPointsName: 'Ankle-Breaker Feint',
    streetPointsDesc: 'Dropping your shoulder with lightning speed to send the asphalt marker sliding the wrong way.',
    youthFlatName: 'Slalom Solo Run',
    youthFlatDesc: 'Weaving through three academy defenders in a dazzling solo slalom into the penalty box.',
    youthPointsName: 'Elastic Cut',
    youthPointsDesc: 'Executing an instantaneous body swerve and razor-sharp cut past the lunging full-back.',
    careerFlatName: 'Solo Maze Run',
    careerFlatDesc: 'Carving open a compact top-flight defense with an iconic solo dribble that lifts the stadium.',
    careerPointsName: 'Step-Over Burst',
    careerPointsDesc: 'A dizzying double step-over followed by an explosive change of direction to beat your man.',
  },

  // CRE (Creation)
  {
    statKey: 'shortPass',
    statLabel: 'Short Pass',
    groupKey: 'CRE',
    groupLabel: 'Creation',
    iconName: 'Share2',
    designColor: 'from-cyan-600 via-blue-700 to-slate-950',
    streetFlatName: 'Pavement Wall-Pass',
    streetFlatDesc: 'Bouncing a rapid give-and-go off the curb to bypass two defenders in a flash.',
    streetPointsName: 'Quick One-Two',
    streetPointsDesc: 'Executing an instinctive one-touch combination to split a packed street defense wide open.',
    youthFlatName: 'Line-Breaking Slip',
    youthFlatDesc: 'Threading a laser-sharp ground pass through the opposing midfield line right into the striker’s feet.',
    youthPointsName: 'Pocket Thread',
    youthPointsDesc: 'Sliding a delicate disguised pass into the half-space between center-back and full-back.',
    careerFlatName: 'Tiki-Taka One-Touch',
    careerFlatDesc: 'Orchestrating a fluid five-pass one-touch sequence that culminates in an open goal.',
    careerPointsName: 'Through-Ball Split',
    careerPointsDesc: 'Weighting a perfect through-ball that bisects two central defenders on a knife-edge.',
  },
  {
    statKey: 'longPass',
    statLabel: 'Long Pass',
    groupKey: 'CRE',
    groupLabel: 'Creation',
    iconName: 'Compass',
    designColor: 'from-sky-600 via-indigo-700 to-slate-950',
    streetFlatName: 'End-to-End Hail Mary',
    streetFlatDesc: 'Booming an audacious end-to-end lofted pass over the crowded street cage onto a running teammate.',
    streetPointsName: 'Direct Cage Switch',
    streetPointsDesc: 'Flipping play with an accurate aerial drop to the opposite asphalt touchline.',
    youthFlatName: 'Pinpoint Diagonal',
    youthFlatDesc: 'Pinging a majestic 50-yard crossfield diagonal straight onto the winger’s outside boot.',
    youthPointsName: 'Over-the-Top Ball',
    youthPointsDesc: 'Floating a delicate chipped pass over the defensive line to beat an academy offside trap.',
    careerFlatName: 'Crossfield Switch',
    careerFlatDesc: 'Launching a laser-guided 60-yard switch that completely turns the match tempo on its head.',
    careerPointsName: 'Quarterback Launch',
    careerPointsDesc: 'Dropping a pinpoint ball from deep into the stride of a sprinting striker on the break.',
  },
  {
    statKey: 'crossing',
    statLabel: 'Crossing',
    groupKey: 'CRE',
    groupLabel: 'Creation',
    iconName: 'Wind',
    designColor: 'from-teal-500 via-emerald-700 to-slate-950',
    streetFlatName: 'Curved Byline Cut',
    streetFlatDesc: 'Whipping a wicked curving cross from the asphalt touchline right across the mini goalmouth.',
    streetPointsName: 'Back-Post Floater',
    streetPointsDesc: 'Floating a high, accurate cross to the far post over the heads of crowded defenders.',
    youthFlatName: 'Whipped Inswinger',
    youthFlatDesc: 'Curling a vicious inswinging delivery right between the goalkeeper and the retreating defense.',
    youthPointsName: 'Byline Cutback',
    youthPointsDesc: 'Racing to the end line and pulling back an inch-perfect pass to the penalty spot.',
    careerFlatName: 'Corridor of Uncertainty',
    careerFlatDesc: 'Delivering the textbook cross into the corridor of uncertainty that forces an inevitable tap-in.',
    careerPointsName: 'Trivela Cross',
    careerPointsDesc: 'Curving an outside-of-the-boot delivery around the full-back with jaw-dropping swerve.',
  },

  // SCO (Goalscoring)
  {
    statKey: 'shooting',
    statLabel: 'Shooting',
    groupKey: 'SCO',
    groupLabel: 'Goalscoring',
    iconName: 'Crosshair',
    designColor: 'from-yellow-500 via-amber-600 to-slate-950',
    streetFlatName: 'Toe-Poke Stunner',
    streetFlatDesc: 'Uncoiling a sudden toe-poke rocket into the bottom corner before the street keeper can blink.',
    streetPointsName: 'First-Time Snap',
    streetPointsDesc: 'Snapping an instinctive first-time strike off a loose ball straight into the side netting.',
    youthFlatName: 'Near-Post Finisher',
    youthFlatDesc: 'Catching the academy keeper off-guard with a ruthless, early finish whipped inside the near post.',
    youthPointsName: 'Clinical 1v1 Goal',
    youthPointsDesc: 'Coolly picking your spot and slotting the ball past the rushing goalkeeper in a high-pressure 1v1.',
    careerFlatName: 'Bottom-Corner Dart',
    careerFlatDesc: 'Burying a first-time strike with minimal backlift into the side netting with surgical precision.',
    careerPointsName: "Poacher's Tap-In",
    careerPointsDesc: 'Reacting fastest inside the 6-yard box to turn a spilled ball into the decisive goal.',
  },
  {
    statKey: 'heading',
    statLabel: 'Heading',
    groupKey: 'SCO',
    groupLabel: 'Goalscoring',
    iconName: 'Award',
    designColor: 'from-amber-600 via-orange-700 to-slate-950',
    streetFlatName: 'Curb-Bounce Header',
    streetFlatDesc: 'Diving low to nod a rebound off the curb into the improvised street goal.',
    streetPointsName: 'Airborne Clash',
    streetPointsDesc: 'Out-jumping a much taller opponent to win an aerial header in a crowded pickup game.',
    youthFlatName: 'Corner-Kick Bullet',
    youthFlatDesc: 'Attacking the near post on an academy corner to power a bullet header into the roof of the net.',
    youthPointsName: 'Glancing Nod',
    youthPointsDesc: 'Glancing a delicate header across the goalkeeper’s dive into the far corner.',
    careerFlatName: 'Towering Hangtime',
    careerFlatDesc: 'Soaring above elite central defenders with incredible hangtime to nod home a matchwinner.',
    careerPointsName: 'Back-Post Hammer',
    careerPointsDesc: 'Rising at the back post to hammer a downward header past the stranded goalkeeper.',
  },
  {
    statKey: 'longShots',
    statLabel: 'Long Shots',
    groupKey: 'SCO',
    groupLabel: 'Goalscoring',
    iconName: 'Target',
    designColor: 'from-orange-600 via-red-700 to-slate-950',
    streetFlatName: 'Half-Court Thump',
    streetFlatDesc: 'Smashing an audacious strike from your own half that flies into the top netting.',
    streetPointsName: 'Knuckleball Blast',
    streetPointsDesc: 'Catching the ball flush to produce an erratic, dipping knuckleball that deceives everyone.',
    youthFlatName: 'Top-Bin Rocket',
    youthFlatDesc: 'Unleashing an unstoppable 25-yard rocket into the top corner in an academy cup tie.',
    youthPointsName: 'Volley on the Drop',
    youthPointsDesc: 'Striking a falling ball cleanly on the half-volley from distance with thunderous power.',
    careerFlatName: 'Upper-90 Screamer',
    careerFlatDesc: 'Curling a sensational 30-yard screamer into the upper 90 on matchday to send the fans into ecstasy.',
    careerPointsName: 'Dipping Thunderbolt',
    careerPointsDesc: 'Uncorking a wicked long-range missile that dips violently right under the crossbar.',
  },

  // DEF (Defensive)
  {
    statKey: 'tackling',
    statLabel: 'Tackling',
    groupKey: 'DEF',
    groupLabel: 'Defensive',
    iconName: 'Scissors',
    designColor: 'from-emerald-700 via-teal-900 to-slate-950',
    streetFlatName: 'Concrete Slide Hook',
    streetFlatDesc: 'Braving scraped knees on raw concrete to hook the ball cleanly away from the dribbler.',
    streetPointsName: 'Clean Toe Strip',
    streetPointsDesc: 'Poking the ball away cleanly from a tricky opponent before they can execute a trick.',
    youthFlatName: 'Standing Tackle Stop',
    youthFlatDesc: 'Timing a textbook standing tackle on the academy attacker to dispossess them without a foul.',
    youthPointsName: 'Last-Man Strip',
    youthPointsDesc: 'Stripping the striker of the ball in a desperate 1v1 situation to avert a certain goal.',
    careerFlatName: 'Last-Ditch Slide',
    careerFlatDesc: 'Flying in with an immaculate goal-saving slide tackle on the penalty spot to preserve the lead.',
    careerPointsName: 'Crunching Ball-Win',
    careerPointsDesc: 'Executing an authoritative, crunching tackle that wins the ball and sparks an instant break.',
  },
  {
    statKey: 'marking',
    statLabel: 'Marking',
    groupKey: 'DEF',
    groupLabel: 'Defensive',
    iconName: 'Eye',
    designColor: 'from-teal-600 via-slate-800 to-slate-950',
    streetFlatName: 'Velcro Shadow Tag',
    streetFlatDesc: 'Sticking to the street king like glue all match, suffocating their rhythm and space.',
    streetPointsName: 'Deny-the-Turn Clamp',
    streetPointsDesc: 'Breathing down the attacker’s neck so tightly they cannot turn toward goal.',
    youthFlatName: 'Pocket the Striker',
    youthFlatDesc: 'Completely neutralizing the opponent’s star forward in an intense academy derby.',
    youthPointsName: 'Tight Shadow Step',
    youthPointsDesc: 'Staying half a step ahead of every forward run to deny the pass before it is made.',
    careerFlatName: 'Lockdown Defender',
    careerFlatDesc: 'Putting a world-class winger completely in your pocket across 90 unforgiving match minutes.',
    careerPointsName: 'Touch-Tight Stifler',
    careerPointsDesc: 'Maintaining touch-tight discipline to shut down any glimpse of space in the final third.',
  },
  {
    statKey: 'interceptions',
    statLabel: 'Interceptions',
    groupKey: 'DEF',
    groupLabel: 'Defensive',
    iconName: 'GitBranch',
    designColor: 'from-blue-700 via-slate-900 to-slate-950',
    streetFlatName: 'Wall-Bounce Read',
    streetFlatDesc: 'Reading the erratic ricochet off the brick wall to snatch possession before anyone else.',
    streetPointsName: 'Passing-Lane Snatch',
    streetPointsDesc: 'Stepping smartly across the asphalt passing lane right as the pass is released.',
    youthFlatName: 'Telepathic Read',
    youthFlatDesc: 'Anticipating the playmaker’s through-ball two seconds early to intercept clean on the front foot.',
    youthPointsName: 'Cut-Off Step',
    youthPointsDesc: 'Stepping decisively out of the defensive backline to cut off a dangerous low cross.',
    careerFlatName: 'Anticipation Steal',
    careerFlatDesc: 'Reading the entire pitch to intercept a dangerous attack and immediately launch a counter.',
    careerPointsName: 'Counter-Kill Snatch',
    careerPointsDesc: 'Snapping an interception in midfield to kill off the opponent’s momentum on the spot.',
  },

  // MEN (Mental)
  {
    statKey: 'positioning',
    statLabel: 'Position',
    groupKey: 'MEN',
    groupLabel: 'Mental',
    iconName: 'MapPin',
    designColor: 'from-purple-600 via-indigo-800 to-slate-950',
    streetFlatName: 'Blindside Sneak',
    streetFlatDesc: 'Drifting unnoticed to the far post while defenders ball-watch in the street cage.',
    streetPointsName: 'Space Ghost Drift',
    streetPointsDesc: 'Ghosting silently into open space between parked cars to receive an open pass.',
    youthFlatName: 'Off-Shoulder Run',
    youthFlatDesc: 'Timing a clever run on the center-back’s blind shoulder to beat the offside trap.',
    youthPointsName: 'Channel Drift',
    youthPointsDesc: 'Finding pockets of space between the lines to receive on the half-turn and attack.',
    careerFlatName: 'Fox-in-the-Box Poach',
    careerFlatDesc: 'Always being in the exact right spot at the right moment to pounce on loose matchday balls.',
    careerPointsName: 'Far-Post Blindside',
    careerPointsDesc: 'Attacking the blindside of the defense to meet the cross ahead of the covering center-back.',
  },
  {
    statKey: 'composure',
    statLabel: 'Composure',
    groupKey: 'MEN',
    groupLabel: 'Mental',
    iconName: 'Smile',
    designColor: 'from-cyan-700 via-slate-800 to-slate-950',
    streetFlatName: 'Hostile Crowd Ice',
    streetFlatDesc: 'Remaining icy cool with hostile spectators inches from the cage fence shouting at you.',
    streetPointsName: 'Chaos Calm',
    streetPointsDesc: 'Slowing down the tempo and making the calm, mature decision amid hectic street scrambles.',
    youthFlatName: 'Clutch Derby Nerves',
    youthFlatDesc: 'Executing with total poise while the academy derby boils over in front of loud parents.',
    youthPointsName: 'Press Immunity',
    youthPointsDesc: 'Staying cool and composed under aggressive pressing to keep the team in control.',
    careerFlatName: 'Ice-in-Veins Penalty',
    careerFlatDesc: 'Stepping up to chip a Panenka penalty in front of 80,000 screaming fans without blinking.',
    careerPointsName: 'High-Stakes Poise',
    careerPointsDesc: 'Holding your nerve and picking the clinical pass in the final seconds of a title decider.',
  },
  {
    statKey: 'reactions',
    statLabel: 'Reaction',
    groupKey: 'MEN',
    groupLabel: 'Mental',
    iconName: 'Sparkles',
    designColor: 'from-fuchsia-700 via-slate-800 to-slate-950',
    streetFlatName: 'Cage Ricochet Pounce',
    streetFlatDesc: 'Reacting instantaneously to an unpredictable metal-pole rebound and tucking it home.',
    streetPointsName: 'Split-Second Snap',
    streetPointsDesc: 'Sticking your boot out to redirect a wicked deflection into the net before anyone reacts.',
    youthFlatName: 'Loose-Ball Pounce',
    youthFlatDesc: 'Pouncing first on a loose ball scramble in the 6-yard box to poke home a derby winner.',
    youthPointsName: 'Cat-Like Twitch',
    youthPointsDesc: 'Twitching into action in a split second to capitalize on a sudden defensive turnover.',
    careerFlatName: 'Lightning Rebound',
    careerFlatDesc: 'Reacting faster than any defender on the pitch to pounce on a goalkeeper save.',
    careerPointsName: 'Snap-Reflex Strike',
    careerPointsDesc: 'Redirecting a blistering deflection into the net in the blink of an eye.',
  },
];

/**
 * 6 Stat Groups Metadata
 */
export interface StatGroupMetadata {
  id: string;
  name: string;
  groupKey: 'PHY' | 'PRO' | 'CRE' | 'SCO' | 'DEF' | 'MEN';
  stats: Array<{ statKey: string; statLabel: string }>;
  iconName: string;
  designColor: string;
  // Category specific names
  streetFlatName: string;
  streetFlatDesc: string;
  streetPointsName: string;
  streetPointsDesc: string;

  youthFlatName: string;
  youthFlatDesc: string;
  youthPointsName: string;
  youthPointsDesc: string;

  careerFlatName: string;
  careerFlatDesc: string;
  careerPointsName: string;
  careerPointsDesc: string;
}

export const STAT_GROUP_METADATA: StatGroupMetadata[] = [
  {
    id: 'group-phy',
    name: 'Physical Group',
    groupKey: 'PHY',
    stats: [
      { statKey: 'pace', statLabel: 'Pace' },
      { statKey: 'stamina', statLabel: 'Stamina' },
      { statKey: 'strength', statLabel: 'Strength' },
    ],
    iconName: 'Dumbbell',
    designColor: 'from-amber-600 via-orange-700 to-slate-950',
    streetFlatName: 'Street Beast Clash',
    streetFlatDesc: 'A dominant physical showing combining blinding burst speed, endless cage stamina, and raw street power.',
    streetPointsName: 'Cage Brawler Shift',
    streetPointsDesc: 'Grinding through hard-hitting concrete duels that condition your Pace, Stamina, and Strength.',
    youthFlatName: 'Academy Athlete Peak',
    youthFlatDesc: 'Dominating the physical metrics testing with superior speed, aerobic engine, and core shielding strength.',
    youthPointsName: 'Athletic Combine Push',
    youthPointsDesc: 'Academy combine training maximizing development across Pace, Stamina, and Strength attributes.',
    careerFlatName: 'Powerhouse Masterclass',
    careerFlatDesc: 'An unstoppable physical performance that dominates elite top-flight defenders from kickoff to final whistle.',
    careerPointsName: 'Peak Physical Surge',
    careerPointsDesc: 'Sports-science periodization channeling peak development into Pace, Stamina, and Strength.',
  },
  {
    id: 'group-pro',
    name: 'Progression Group',
    groupKey: 'PRO',
    stats: [
      { statKey: 'ballControl', statLabel: 'Ball Control' },
      { statKey: 'retention', statLabel: 'Ball Retention' },
      { statKey: 'dribbling', statLabel: 'Dribbling' },
    ],
    iconName: 'Footprints',
    designColor: 'from-blue-600 via-indigo-700 to-slate-950',
    streetFlatName: 'Asphalt Juggler',
    streetFlatDesc: 'Dazzling the crowd with spellbinding ball control, unbreakable body shielding, and electric dribbles.',
    streetPointsName: 'Concrete Moves',
    streetPointsDesc: 'Improvising tricky ball-rolling routines and tight feints across the uneven street pavement.',
    youthFlatName: 'Academy Technician',
    youthFlatDesc: 'Displaying textbook technical purity with effortless first touches, press resistance, and slalom runs.',
    youthPointsName: 'Ball-Mastery Showcase',
    youthPointsDesc: 'Mastering tight-space technical skills across Ball Control, Retention, and Dribbling.',
    careerFlatName: 'Maestro in Traffic',
    careerFlatDesc: 'Gliding effortlessly through compact midfield blocks under the gaze of millions of spectators.',
    careerPointsName: 'Touchline Wizardry',
    careerPointsDesc: 'Refining micro-touches and explosive escape dribbles against world-class defenders.',
  },
  {
    id: 'group-cre',
    name: 'Creation Group',
    groupKey: 'CRE',
    stats: [
      { statKey: 'shortPass', statLabel: 'Short Pass' },
      { statKey: 'longPass', statLabel: 'Long Pass' },
      { statKey: 'crossing', statLabel: 'Crossing' },
    ],
    iconName: 'Share2',
    designColor: 'from-cyan-600 via-blue-700 to-slate-950',
    streetFlatName: 'Street Architect',
    streetFlatDesc: 'Pulling the strings in the street game with rapid give-and-gos, lofted chips, and curving byline balls.',
    streetPointsName: 'Pickup Playmaker',
    streetPointsDesc: 'Reading every angle in the cage to set up teammates with pinpoint short and long distribution.',
    youthFlatName: 'Visionary Derby Pass',
    youthFlatDesc: 'Splitting the defense wide open in an academy derby with visionary passing and inch-perfect crosses.',
    youthPointsName: 'Playmaker Showcase',
    youthPointsDesc: 'Honing game-breaking vision across Short Pass, Long Pass, and Crossing in competitive matches.',
    careerFlatName: 'Master Conductor',
    careerFlatDesc: 'Controlling the tempo of a European knockout tie with masterclass passes and pinpoint wide deliveries.',
    careerPointsName: 'Symphony Orchestration',
    careerPointsDesc: 'Directing the attack with elite distribution range and razor-sharp crossing accuracy.',
  },
  {
    id: 'group-sco',
    name: 'Goalscoring Group',
    groupKey: 'SCO',
    stats: [
      { statKey: 'shooting', statLabel: 'Shooting' },
      { statKey: 'heading', statLabel: 'Heading' },
      { statKey: 'longShots', statLabel: 'Long Shots' },
    ],
    iconName: 'Target',
    designColor: 'from-yellow-500 via-amber-600 to-slate-950',
    streetFlatName: 'Cage Goal Machine',
    streetFlatDesc: 'Scoring every imaginable goal in the street cage: driven finishes, brave headers, and booming long strikes.',
    streetPointsName: 'Street Net-Bulger',
    streetPointsDesc: 'Finding the back of the net over and over again from every angle in high-stakes pickup games.',
    youthFlatName: 'Golden Boot Hunt',
    youthFlatDesc: 'Leading the tournament scoring charts with clinical finishing, aerial dominance, and long-range rockets.',
    youthPointsName: 'Youth Cup Hat-Trick',
    youthPointsDesc: 'Sealing an unforgettable hat-trick in the youth cup final with ruthless striking precision.',
    careerFlatName: 'Matchday Hat-Trick',
    careerFlatDesc: 'A historic matchday performance tearing the opposition apart with finishes, headers, and screamers.',
    careerPointsName: 'Golden Boot Masterclass',
    careerPointsDesc: 'Refining elite striker finishing from inside the box, aerial duels, and 30-yard strikes.',
  },
  {
    id: 'group-def',
    name: 'Defensive Group',
    groupKey: 'DEF',
    stats: [
      { statKey: 'tackling', statLabel: 'Tackling' },
      { statKey: 'marking', statLabel: 'Marking' },
      { statKey: 'interceptions', statLabel: 'Interceptions' },
    ],
    iconName: 'ShieldCheck',
    designColor: 'from-emerald-700 via-teal-900 to-slate-950',
    streetFlatName: 'Iron Curtain Wall',
    streetFlatDesc: 'Transforming into an impassable brick wall with crunching challenges, tight shadow marking, and alert steals.',
    streetPointsName: 'Cage Lockdown',
    streetPointsDesc: 'Denying every single attack in the cage through fearless tackles and anticipation.',
    youthFlatName: 'Academy Wall Defiance',
    youthFlatDesc: 'Commanding the backline with impeccable standing tackles, sticky marking, and lane interceptions.',
    youthPointsName: 'Shutout Clean-Sheet',
    youthPointsDesc: 'Guiding the academy defense to an emphatic clean-sheet in a fierce rivalry match.',
    careerFlatName: 'Fortress Clean-Sheet',
    careerFlatDesc: 'An imperious defensive masterclass neutralizing world-class attackers to secure the championship clean sheet.',
    careerPointsName: 'Championship Lockdown',
    careerPointsDesc: 'Total defensive cohesion shutting down the opposition with tactical tackles, marking, and steals.',
  },
  {
    id: 'group-men',
    name: 'Mental Group',
    groupKey: 'MEN',
    stats: [
      { statKey: 'positioning', statLabel: 'Position' },
      { statKey: 'composure', statLabel: 'Composure' },
      { statKey: 'reactions', statLabel: 'Reaction' },
    ],
    iconName: 'Brain',
    designColor: 'from-purple-600 via-indigo-900 to-slate-950',
    streetFlatName: 'King of the Pitch',
    streetFlatDesc: 'Owning the court through instinctive positioning, ice-cold composure under trash talk, and lightning reflexes.',
    streetPointsName: 'Asphalt Swagger',
    streetPointsDesc: 'Playing with unshakable poise and quick mental sharpness on chaotic neighborhood courts.',
    youthFlatName: 'Ice-Cold Prospect',
    youthFlatDesc: 'Displaying mature football intelligence with clever off-ball movement, cool composure, and razor-sharp reactions.',
    youthPointsName: 'Clutch Youth Leader',
    youthPointsDesc: 'Leading by example in tense elimination matches through smart positioning and composure.',
    careerFlatName: "Captain's Roar",
    careerFlatDesc: 'Inspiring the entire team with calm tactical positioning, ice-in-the-veins poise, and split-second game-changing reactions.',
    careerPointsName: 'Unshakable Mentality',
    careerPointsDesc: 'Peak cognitive composure and lightning reflexes delivering under massive matchday pressure.',
  },
];

/**
 * 8 Mixed Synergies Metadata (Each with 3 stats from 3 DIFFERENT groups)
 */
export interface MixedSynergyMetadata {
  id: string;
  name: string;
  stats: Array<{ statKey: string; statLabel: string; groupKey: string }>;
  iconName: string;
  designColor: string;
  description: string;
}

export const MIXED_SYNERGY_METADATA: MixedSynergyMetadata[] = [
  // 1. PERFECT HIT (Required)
  {
    id: 'synergy-perfect-hit',
    name: 'Perfect Strike',
    stats: [
      { statKey: 'longShots', statLabel: 'Long Shots', groupKey: 'SCO' },
      { statKey: 'longPass', statLabel: 'Long Pass', groupKey: 'CRE' },
      { statKey: 'ballControl', statLabel: 'Ball Control', groupKey: 'PRO' },
    ],
    iconName: 'Crosshair',
    designColor: 'from-orange-600 via-amber-700 to-slate-950',
    description: 'Catching the ball flush on the half-volley to deliver pinpoint diagonal switches, rocket strikes, and velvet cushioning.',
  },
  // 2. SMALL TOUCH (Required)
  {
    id: 'synergy-small-touch',
    name: 'Tiki-Taka Flick',
    stats: [
      { statKey: 'shooting', statLabel: 'Shooting', groupKey: 'SCO' },
      { statKey: 'shortPass', statLabel: 'Short Pass', groupKey: 'CRE' },
      { statKey: 'dribbling', statLabel: 'Dribbling', groupKey: 'PRO' },
    ],
    iconName: 'Sparkles',
    designColor: 'from-amber-500 via-yellow-600 to-slate-950',
    description: 'Deft micro-touches carving open defenses with quick wall-passes, subtle feints, and surgical bottom-corner finishes.',
  },
  // 3. INCISIVE (Required)
  {
    id: 'synergy-incisive',
    name: 'Enforcer Clash',
    stats: [
      { statKey: 'tackling', statLabel: 'Tackling', groupKey: 'DEF' },
      { statKey: 'heading', statLabel: 'Heading', groupKey: 'SCO' },
      { statKey: 'strength', statLabel: 'Strength', groupKey: 'PHY' },
    ],
    iconName: 'Zap',
    designColor: 'from-red-600 via-rose-700 to-slate-950',
    description: 'Dominating physical duels through bone-crunching standing tackles, commanding aerial headers, and brute shoulder charges.',
  },
  // 4. QUICK FEET (Additional 1)
  {
    id: 'synergy-quick-feet',
    name: 'Electric Burst',
    stats: [
      { statKey: 'pace', statLabel: 'Pace', groupKey: 'PHY' },
      { statKey: 'dribbling', statLabel: 'Dribbling', groupKey: 'PRO' },
      { statKey: 'reactions', statLabel: 'Reaction', groupKey: 'MEN' },
    ],
    iconName: 'Wind',
    designColor: 'from-amber-500 via-orange-600 to-slate-950',
    description: 'Exploding into action with sudden acceleration, rapid slalom footwork, and lightning twitch reactions that freeze markers.',
  },
  // 5. CREATIVE VISION (Additional 2)
  {
    id: 'synergy-creative-vision',
    name: 'Visionary Pocket',
    stats: [
      { statKey: 'positioning', statLabel: 'Position', groupKey: 'MEN' },
      { statKey: 'shortPass', statLabel: 'Short Pass', groupKey: 'CRE' },
      { statKey: 'retention', statLabel: 'Ball Retention', groupKey: 'PRO' },
    ],
    iconName: 'Eye',
    designColor: 'from-indigo-600 via-blue-700 to-slate-950',
    description: 'Ghosting between defensive lines, shielding the ball from pressing markers, and sliding defense-splitting passes.',
  },
  // 6. COMPLETE DEFENDER (Additional 3)
  {
    id: 'synergy-complete-defender',
    name: 'Iron Wall Stand',
    stats: [
      { statKey: 'marking', statLabel: 'Marking', groupKey: 'DEF' },
      { statKey: 'strength', statLabel: 'Strength', groupKey: 'PHY' },
      { statKey: 'composure', statLabel: 'Composure', groupKey: 'MEN' },
    ],
    iconName: 'Shield',
    designColor: 'from-emerald-700 via-teal-900 to-slate-950',
    description: 'Uncompromising defensive stoicism and brute physical power holding firm under heavy pressure in the penalty area.',
  },
  // 7. BOX PREDATOR (Additional 4)
  {
    id: 'synergy-box-predator',
    name: 'Predator Strike',
    stats: [
      { statKey: 'shooting', statLabel: 'Shooting', groupKey: 'SCO' },
      { statKey: 'pace', statLabel: 'Pace', groupKey: 'PHY' },
      { statKey: 'positioning', statLabel: 'Position', groupKey: 'MEN' },
    ],
    iconName: 'Crosshair',
    designColor: 'from-yellow-600 via-rose-700 to-slate-950',
    description: 'Instinctive penalty-box movement and short-burst acceleration pouncing into open pockets to finish first-time chances.',
  },
  // 8. WING DYNAMO (Additional 5)
  {
    id: 'synergy-wing-dynamo',
    name: 'Touchline Flyer',
    stats: [
      { statKey: 'crossing', statLabel: 'Crossing', groupKey: 'CRE' },
      { statKey: 'pace', statLabel: 'Pace', groupKey: 'PHY' },
      { statKey: 'dribbling', statLabel: 'Dribbling', groupKey: 'PRO' },
    ],
    iconName: 'Flame',
    designColor: 'from-teal-500 via-cyan-600 to-slate-950',
    description: 'Electric wide progression burning defenders down the touchline before delivering pinpoint crosses across the goalmouth.',
  },
];

/**
 * Universal Distributable Stat Point Cards (1 progression per category)
 */
export const DISTRIBUTABLE_POINT_METADATA = {
  street: {
    id: 'street-distributable-points',
    name: 'Street King Crown',
    description: 'Earning undisputed respect across the concrete cages grants unassigned development points to forge your identity.',
    iconName: 'Award',
    designColor: 'from-amber-500 via-yellow-600 to-slate-950',
    values: { bronze: 1, silver: 2, gold: 3, legendary: 50 },
  },
  youth: {
    id: 'yc-stat-distributable-points',
    name: 'Scout Showcase Triumph',
    description: 'Dazzling visiting European scouts in the youth tournament grants unassigned development points to allocate freely.',
    iconName: 'Star',
    designColor: 'from-emerald-500 via-teal-600 to-slate-950',
    values: { bronze: 5, silver: 10, gold: 15, legendary: 25 },
  },
  career: {
    id: 'career-distributable-points',
    name: 'Derby Masterclass',
    description: 'Delivering an unforgettable MVP performance in the heated derby grants unassigned development points to elevate your game.',
    iconName: 'Crown',
    designColor: 'from-blue-600 via-indigo-700 to-slate-950',
    values: { bronze: 3, silver: 6, gold: 9, legendary: 15 },
  },
};

// ==========================================
// BALANCE MATRICES
// ==========================================

export const STREET_BALANCE = {
  singleStatFlat: { bronze: 1, silver: 2, gold: 5, legendary: 50 },
  singleStatPoints: { bronze: 2, silver: 4, gold: 10, legendary: 100 },
  groupFlat: { bronze: 1, silver: 2, gold: 3, legendary: 25 },
  groupPoints: { bronze: 2, silver: 4, gold: 6, legendary: 50 },
  synergyFlat: { bronze: 1, silver: 2, gold: 3, legendary: 25 },
  synergyPoints: { bronze: 2, silver: 4, gold: 6, legendary: 50 },
  distributablePoints: { bronze: 1, silver: 2, gold: 3, legendary: 50 },
};

export const YOUTH_BALANCE = {
  singleStatFlat: { Bronze: 2, Silver: 4, Gold: 6, Legendary: 12 },
  singleStatPoints: { Bronze: 4, Silver: 8, Gold: 15, Legendary: 30 },
  groupFlat: { Bronze: 1, Silver: 2, Gold: 4, Legendary: 8 },
  groupPoints: { Bronze: 3, Silver: 6, Gold: 10, Legendary: 18 },
  synergyFlat: { Bronze: 1, Silver: 2, Gold: 4, Legendary: 8 },
  synergyPoints: { Bronze: 3, Silver: 6, Gold: 10, Legendary: 18 },
  distributablePoints: { Bronze: 5, Silver: 10, Gold: 15, Legendary: 25 },
};

export const CAREER_BALANCE = {
  singleStatFlat: { Bronze: 1, Silver: 2, Gold: 3, Legendary: 6 },
  singleStatPoints: { Bronze: 2, Silver: 5, Gold: 9, Legendary: 16 },
  groupFlat: { Bronze: 1, Silver: 1, Gold: 2, Legendary: 4 },
  groupPoints: { Bronze: 2, Silver: 3, Gold: 6, Legendary: 10 },
  synergyFlat: { Bronze: 1, Silver: 1, Gold: 2, Legendary: 4 },
  synergyPoints: { Bronze: 2, Silver: 3, Gold: 6, Legendary: 10 },
  distributablePoints: { Bronze: 3, Silver: 6, Gold: 9, Legendary: 15 },
};

// ==========================================
// 1. STREET CARD DEFINITIONS GENERATOR
// ==========================================

export function getStreetOverhauledCardDefinitions(): StreetCardDefinition[] {
  const cards: StreetCardDefinition[] = [];

  // A. Single Stat Flat Cards (18)
  for (const s of OUTFIELD_STAT_METADATA) {
    cards.push({
      id: `street_flat_${s.statKey}`,
      name: s.streetFlatName,
      type: 'positive',
      description: s.streetFlatDesc,
      iconName: s.iconName,
      designColor: s.designColor,
      effects: {
        [s.statKey]: { ...STREET_BALANCE.singleStatFlat },
      },
    });
  }

  // B. Single Stat Point Cards (18)
  for (const s of OUTFIELD_STAT_METADATA) {
    cards.push({
      id: `street_points_${s.statKey}`,
      name: s.streetPointsName,
      type: 'positive',
      description: s.streetPointsDesc,
      iconName: s.iconName,
      designColor: s.designColor,
      isStatPoints: true,
      statPointsBonus: { statKey: s.statKey, statLabel: s.statLabel },
      effects: {
        [s.statKey]: { ...STREET_BALANCE.singleStatPoints },
      },
    });
  }

  // C. Stat Group Flat Cards (6)
  for (const g of STAT_GROUP_METADATA) {
    const effects: Record<string, TierValues> = {};
    g.stats.forEach((st) => {
      effects[st.statKey] = { ...STREET_BALANCE.groupFlat };
    });

    cards.push({
      id: `street_group_flat_${g.groupKey.toLowerCase()}`,
      name: g.streetFlatName,
      type: 'positive',
      description: g.streetFlatDesc,
      iconName: g.iconName,
      designColor: g.designColor,
      effects,
    });
  }

  // D. Stat Group Point Cards (6)
  for (const g of STAT_GROUP_METADATA) {
    const effects: Record<string, TierValues> = {};
    g.stats.forEach((st) => {
      effects[st.statKey] = { ...STREET_BALANCE.groupPoints };
    });

    cards.push({
      id: `street_group_points_${g.groupKey.toLowerCase()}`,
      name: g.streetPointsName,
      type: 'positive',
      description: g.streetPointsDesc,
      iconName: g.iconName,
      designColor: g.designColor,
      isStatPoints: true,
      statPointsBonuses: g.stats.map((st) => ({ statKey: st.statKey, statLabel: st.statLabel })),
      effects,
    });
  }

  // E. Mixed Synergy Flat Cards (8)
  for (const syn of MIXED_SYNERGY_METADATA) {
    const effects: Record<string, TierValues> = {};
    syn.stats.forEach((st) => {
      effects[st.statKey] = { ...STREET_BALANCE.synergyFlat };
    });

    cards.push({
      id: `street_synergy_flat_${syn.id.replace('synergy-', '')}`,
      name: syn.name,
      type: 'positive',
      description: syn.description,
      iconName: syn.iconName,
      designColor: syn.designColor,
      effects,
    });
  }

  // F. Mixed Synergy Point Cards (8)
  for (const syn of MIXED_SYNERGY_METADATA) {
    const effects: Record<string, TierValues> = {};
    syn.stats.forEach((st) => {
      effects[st.statKey] = { ...STREET_BALANCE.synergyPoints };
    });

    cards.push({
      id: `street_synergy_points_${syn.id.replace('synergy-', '')}`,
      name: `${syn.name} Focus`,
      type: 'positive',
      description: `${syn.description} Repetitive training drills invest development points across all three attributes.`,
      iconName: syn.iconName,
      designColor: syn.designColor,
      isStatPoints: true,
      statPointsBonuses: syn.stats.map((st) => ({ statKey: st.statKey, statLabel: st.statLabel })),
      effects,
    });
  }

  // G. Universal Distributable Stat Point Card (1)
  cards.push({
    id: DISTRIBUTABLE_POINT_METADATA.street.id,
    name: DISTRIBUTABLE_POINT_METADATA.street.name,
    type: 'positive',
    description: DISTRIBUTABLE_POINT_METADATA.street.description,
    iconName: DISTRIBUTABLE_POINT_METADATA.street.iconName,
    designColor: DISTRIBUTABLE_POINT_METADATA.street.designColor,
    isDistributablePoints: true,
    effects: {
      unassignedPoints: { ...DISTRIBUTABLE_POINT_METADATA.street.values },
    },
  });

  return cards;
}

// ==========================================
// 2. YOUTH CARD TEMPLATES GENERATOR
// ==========================================

export function getYouthStatCardTemplates(): YouthCardTemplate[] {
  const templates: YouthCardTemplate[] = [];
  const rarities: YouthCardRarity[] = ['Bronze', 'Silver', 'Gold', 'Legendary'];

  // A. Single Stat Flat Cards (18)
  for (const s of OUTFIELD_STAT_METADATA) {
    const effectsByRarity: Record<YouthCardRarity, YouthCardEffectSet> = {} as any;
    for (const r of rarities) {
      const val = YOUTH_BALANCE.singleStatFlat[r as 'Bronze' | 'Silver' | 'Gold' | 'Legendary'];
      effectsByRarity[r] = {
        statBonuses: [{ statKey: s.statKey, statLabel: s.statLabel, value: val }],
      };
    }

    templates.push({
      id: `yc-stat-flat-${s.statKey}`,
      name: s.youthFlatName,
      category: 'positive_stat',
      description: s.youthFlatDesc,
      iconName: s.iconName,
      effectsByRarity,
    });
  }

  // B. Single Stat Point Cards (18)
  for (const s of OUTFIELD_STAT_METADATA) {
    const effectsByRarity: Record<YouthCardRarity, YouthCardEffectSet> = {} as any;
    for (const r of rarities) {
      const pts = YOUTH_BALANCE.singleStatPoints[r as 'Bronze' | 'Silver' | 'Gold' | 'Legendary'];
      effectsByRarity[r] = {
        statPointsBonus: { statKey: s.statKey, statLabel: s.statLabel, points: pts },
        statBonuses: [{ statKey: s.statKey, statLabel: s.statLabel, value: pts, isStatPoints: true }],
      };
    }

    templates.push({
      id: `yc-stat-points-${s.statKey}`,
      name: s.youthPointsName,
      category: 'positive_stat',
      description: s.youthPointsDesc,
      iconName: s.iconName,
      effectsByRarity,
    });
  }

  // C. Stat Group Flat Cards (6)
  for (const g of STAT_GROUP_METADATA) {
    const effectsByRarity: Record<YouthCardRarity, YouthCardEffectSet> = {} as any;
    for (const r of rarities) {
      const val = YOUTH_BALANCE.groupFlat[r as 'Bronze' | 'Silver' | 'Gold' | 'Legendary'];
      effectsByRarity[r] = {
        statBonuses: g.stats.map((st) => ({ statKey: st.statKey, statLabel: st.statLabel, value: val })),
      };
    }

    templates.push({
      id: `yc-stat-group-flat-${g.groupKey.toLowerCase()}`,
      name: g.youthFlatName,
      category: 'positive_stat',
      description: g.youthFlatDesc,
      iconName: g.iconName,
      effectsByRarity,
    });
  }

  // D. Stat Group Point Cards (6)
  for (const g of STAT_GROUP_METADATA) {
    const effectsByRarity: Record<YouthCardRarity, YouthCardEffectSet> = {} as any;
    for (const r of rarities) {
      const pts = YOUTH_BALANCE.groupPoints[r as 'Bronze' | 'Silver' | 'Gold' | 'Legendary'];
      effectsByRarity[r] = {
        statBonuses: g.stats.map((st) => ({
          statKey: st.statKey,
          statLabel: st.statLabel,
          value: pts,
          isStatPoints: true,
        })),
      };
    }

    templates.push({
      id: `yc-stat-group-points-${g.groupKey.toLowerCase()}`,
      name: g.youthPointsName,
      category: 'positive_stat',
      description: g.youthPointsDesc,
      iconName: g.iconName,
      effectsByRarity,
    });
  }

  // E. Mixed Synergy Flat Cards (8)
  for (const syn of MIXED_SYNERGY_METADATA) {
    const effectsByRarity: Record<YouthCardRarity, YouthCardEffectSet> = {} as any;
    for (const r of rarities) {
      const val = YOUTH_BALANCE.synergyFlat[r as 'Bronze' | 'Silver' | 'Gold' | 'Legendary'];
      effectsByRarity[r] = {
        statBonuses: syn.stats.map((st) => ({ statKey: st.statKey, statLabel: st.statLabel, value: val })),
      };
    }

    templates.push({
      id: `yc-stat-synergy-flat-${syn.id.replace('synergy-', '')}`,
      name: syn.name,
      category: 'positive_stat',
      description: syn.description,
      iconName: syn.iconName,
      effectsByRarity,
    });
  }

  // F. Mixed Synergy Point Cards (8)
  for (const syn of MIXED_SYNERGY_METADATA) {
    const effectsByRarity: Record<YouthCardRarity, YouthCardEffectSet> = {} as any;
    for (const r of rarities) {
      const pts = YOUTH_BALANCE.synergyPoints[r as 'Bronze' | 'Silver' | 'Gold' | 'Legendary'];
      effectsByRarity[r] = {
        statBonuses: syn.stats.map((st) => ({
          statKey: st.statKey,
          statLabel: st.statLabel,
          value: pts,
          isStatPoints: true,
        })),
      };
    }

    templates.push({
      id: `yc-stat-synergy-points-${syn.id.replace('synergy-', '')}`,
      name: `${syn.name} Focus`,
      category: 'positive_stat',
      description: `${syn.description} Academy drills systematically build development points across all three attributes.`,
      iconName: syn.iconName,
      effectsByRarity,
    });
  }

  // G. Universal Distributable Stat Point Card (1)
  const distEffByRarity: Record<YouthCardRarity, YouthCardEffectSet> = {} as any;
  for (const r of rarities) {
    distEffByRarity[r] = {
      freeStatPoints: YOUTH_BALANCE.distributablePoints[r as 'Bronze' | 'Silver' | 'Gold' | 'Legendary'],
    };
  }

  templates.push({
    id: DISTRIBUTABLE_POINT_METADATA.youth.id,
    name: DISTRIBUTABLE_POINT_METADATA.youth.name,
    category: 'positive_stat',
    description: DISTRIBUTABLE_POINT_METADATA.youth.description,
    iconName: DISTRIBUTABLE_POINT_METADATA.youth.iconName,
    effectsByRarity: distEffByRarity,
  });

  return templates;
}

// ==========================================
// 3. CAREER CARD POOL GENERATOR
// ==========================================

export function getCareerStatCardPool(): Omit<CareerStageCardInstance, 'id'>[] {
  const cards: Omit<CareerStageCardInstance, 'id'>[] = [];
  const tiers: ('Bronze' | 'Silver' | 'Gold' | 'Legendary')[] = ['Bronze', 'Silver', 'Gold', 'Legendary'];

  // A. Single Stat Flat Cards (18)
  for (const s of OUTFIELD_STAT_METADATA) {
    for (const tier of tiers) {
      const val = CAREER_BALANCE.singleStatFlat[tier];
      const cardName = tier === 'Bronze' ? s.careerFlatName : `${s.careerFlatName} (${tier})`;

      cards.push({
        name: cardName,
        category: 'career',
        type: 'good',
        rarity: tier,
        description: s.careerFlatDesc,
        effects: [`+${val} ${s.statLabel} (Capped at 99)`],
        designColor: s.designColor,
        iconName: s.iconName,
        modifiers: {
          statDeltas: { [s.statKey]: val },
        },
      });
    }
  }

  // B. Single Stat Point Cards (18)
  for (const s of OUTFIELD_STAT_METADATA) {
    for (const tier of tiers) {
      const pts = CAREER_BALANCE.singleStatPoints[tier];
      const cardName = tier === 'Bronze' ? s.careerPointsName : `${s.careerPointsName} (${tier})`;

      cards.push({
        name: cardName,
        category: 'career',
        type: 'good',
        rarity: tier,
        description: s.careerPointsDesc,
        effects: [
          `+${pts} Stat Development Point${pts > 1 ? 's' : ''} for ${s.statLabel}`,
          `📈 Directly advances ${s.statLabel} progress toward next level`,
        ],
        designColor: s.designColor,
        iconName: s.iconName,
        modifiers: {
          statPointsBonus: { stat: s.statKey, points: pts, statLabel: s.statLabel },
        },
      });
    }
  }

  // C. Stat Group Flat Cards (6)
  for (const g of STAT_GROUP_METADATA) {
    for (const tier of tiers) {
      const val = CAREER_BALANCE.groupFlat[tier];
      const cardName = tier === 'Bronze' ? g.careerFlatName : `${g.careerFlatName} (${tier})`;
      const statDeltas: Record<string, number> = {};
      const effects: string[] = [];
      g.stats.forEach((st) => {
        statDeltas[st.statKey] = val;
        effects.push(`+${val} ${st.statLabel} (Capped at 99)`);
      });

      cards.push({
        name: cardName,
        category: 'career',
        type: 'good',
        rarity: tier,
        description: g.careerFlatDesc,
        effects,
        designColor: g.designColor,
        iconName: g.iconName,
        modifiers: { statDeltas },
      });
    }
  }

  // D. Stat Group Point Cards (6)
  for (const g of STAT_GROUP_METADATA) {
    for (const tier of tiers) {
      const pts = CAREER_BALANCE.groupPoints[tier];
      const cardName = tier === 'Bronze' ? g.careerPointsName : `${g.careerPointsName} (${tier})`;
      const effects: string[] = [];
      const statPointsBonuses = g.stats.map((st) => {
        effects.push(`+${pts} Points for ${st.statLabel}`);
        return { stat: st.statKey, points: pts, statLabel: st.statLabel };
      });

      cards.push({
        name: cardName,
        category: 'career',
        type: 'good',
        rarity: tier,
        description: g.careerPointsDesc,
        effects,
        designColor: g.designColor,
        iconName: g.iconName,
        modifiers: { statPointsBonuses },
      });
    }
  }

  // E. Mixed Synergy Flat Cards (8)
  for (const syn of MIXED_SYNERGY_METADATA) {
    for (const tier of tiers) {
      const val = CAREER_BALANCE.synergyFlat[tier];
      const cardName = tier === 'Bronze' ? syn.name : `${syn.name} (${tier})`;
      const statDeltas: Record<string, number> = {};
      const effects: string[] = [];
      syn.stats.forEach((st) => {
        statDeltas[st.statKey] = val;
        effects.push(`+${val} ${st.statLabel} (Capped at 99)`);
      });

      cards.push({
        name: cardName,
        category: 'career',
        type: 'good',
        rarity: tier,
        description: syn.description,
        effects,
        designColor: syn.designColor,
        iconName: syn.iconName,
        modifiers: { statDeltas },
      });
    }
  }

  // F. Mixed Synergy Point Cards (8)
  for (const syn of MIXED_SYNERGY_METADATA) {
    for (const tier of tiers) {
      const pts = CAREER_BALANCE.synergyPoints[tier];
      const cardName = tier === 'Bronze' ? `${syn.name} Focus` : `${syn.name} Focus (${tier})`;
      const effects: string[] = [];
      const statPointsBonuses = syn.stats.map((st) => {
        effects.push(`+${pts} Points for ${st.statLabel}`);
        return { stat: st.statKey, points: pts, statLabel: st.statLabel };
      });

      cards.push({
        name: cardName,
        category: 'career',
        type: 'good',
        rarity: tier,
        description: `${syn.description} Repetitive pro training protocols dedicate development points across all three attributes.`,
        effects,
        designColor: syn.designColor,
        iconName: syn.iconName,
        modifiers: { statPointsBonuses },
      });
    }
  }

  // G. Universal Distributable Stat Point Card (1)
  for (const tier of tiers) {
    const pts = CAREER_BALANCE.distributablePoints[tier];
    const cardName = tier === 'Bronze' ? DISTRIBUTABLE_POINT_METADATA.career.name : `${DISTRIBUTABLE_POINT_METADATA.career.name} (${tier})`;

    cards.push({
      name: cardName,
      category: 'career',
      type: 'good',
      rarity: tier,
      description: DISTRIBUTABLE_POINT_METADATA.career.description,
      effects: [
        `+${pts} Distributable Development Stat Points`,
        '⭐ Choose where to allocate these points later from your player dashboard',
      ],
      designColor: DISTRIBUTABLE_POINT_METADATA.career.designColor,
      iconName: DISTRIBUTABLE_POINT_METADATA.career.iconName,
      modifiers: {
        freeStatPoints: pts,
      },
    });
  }

  // Iconic Card: Superior Training (PRESERVED)
  cards.push({
    name: 'Superior Training',
    category: 'career',
    type: 'good',
    rarity: 'Iconic',
    description: 'You discovered a new form of training.',
    effects: [
      '⭐ ICONIC CAREER MASTERCLASS',
      '⚡ +100 Development Stat Points instantly added to Unassigned Points',
      '📈 Distribute across attributes or unlock massive Stat Break thresholds',
    ],
    designColor: 'from-amber-400 via-yellow-500 to-amber-950',
    iconName: 'Crown',
    modifiers: {
      freeStatPoints: 100,
    },
  });

  return cards;
}

// ==========================================
// 4. CUSTOM CARDS BUILDERS (FOR DECKS & STORE)
// ==========================================

export function getYouthStatCustomCards(): CustomCard[] {
  const customCards: CustomCard[] = [];
  const tiers: ('Bronze' | 'Silver' | 'Gold' | 'Legendary')[] = ['Bronze', 'Silver', 'Gold', 'Legendary'];

  // Single Stat Flat CustomCards
  for (const s of OUTFIELD_STAT_METADATA) {
    for (const tier of tiers) {
      const val = YOUTH_BALANCE.singleStatFlat[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? s.youthFlatName : `${s.youthFlatName} (${tier})`;

      customCards.push({
        id: `card-youth-stat-flat-${s.statKey}-${tierLower}`,
        name: cardName,
        category: 'youth',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${s.youthFlatDesc} Grants +${val} ${s.statLabel} directly (capped at 99).`,
        iconName: s.iconName,
        modifiers: [
          {
            id: `mod-yc-flat-${s.statKey}-${tierLower}`,
            target: 'stat_specific' as ModifierTarget,
            operation: 'add',
            valueType: 'flat',
            value: val,
            statKey: s.statKey,
          },
        ],
        createdAt: '2025-01-01',
      });
    }
  }

  // Single Stat Points CustomCards
  for (const s of OUTFIELD_STAT_METADATA) {
    for (const tier of tiers) {
      const pts = YOUTH_BALANCE.singleStatPoints[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? s.youthPointsName : `${s.youthPointsName} (${tier})`;

      customCards.push({
        id: `card-youth-stat-points-${s.statKey}-${tierLower}`,
        name: cardName,
        category: 'youth',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${s.youthPointsDesc} Grants +${pts} Development Points to ${s.statLabel}.`,
        iconName: s.iconName,
        modifiers: [
          {
            id: `mod-yc-pts-${s.statKey}-${tierLower}`,
            target: 'stat_point_investment',
            operation: 'add',
            valueType: 'flat',
            value: pts,
            statKey: s.statKey,
            isStatPointProgression: true,
          },
        ],
        statPointsBonus: {
          statKey: s.statKey,
          statLabel: s.statLabel,
          points: pts,
        },
        createdAt: '2025-01-01',
      });
    }
  }

  // Stat Group Flat CustomCards
  for (const g of STAT_GROUP_METADATA) {
    for (const tier of tiers) {
      const val = YOUTH_BALANCE.groupFlat[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? g.youthFlatName : `${g.youthFlatName} (${tier})`;

      customCards.push({
        id: `card-youth-group-flat-${g.groupKey.toLowerCase()}-${tierLower}`,
        name: cardName,
        category: 'youth',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${g.youthFlatDesc} Grants +${val} to each attribute in the ${g.name} (capped at 99).`,
        iconName: g.iconName,
        modifiers: g.stats.map((st) => ({
          id: `mod-yc-gf-${g.groupKey.toLowerCase()}-${st.statKey}-${tierLower}`,
          target: 'stat_specific' as ModifierTarget,
          operation: 'add',
          valueType: 'flat',
          value: val,
          statKey: st.statKey,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Stat Group Points CustomCards
  for (const g of STAT_GROUP_METADATA) {
    for (const tier of tiers) {
      const pts = YOUTH_BALANCE.groupPoints[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? g.youthPointsName : `${g.youthPointsName} (${tier})`;

      customCards.push({
        id: `card-youth-group-points-${g.groupKey.toLowerCase()}-${tierLower}`,
        name: cardName,
        category: 'youth',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${g.youthPointsDesc} Grants +${pts} Development Points to each attribute in the ${g.name}.`,
        iconName: g.iconName,
        modifiers: g.stats.map((st) => ({
          id: `mod-yc-gp-${g.groupKey.toLowerCase()}-${st.statKey}-${tierLower}`,
          target: 'stat_point_investment',
          operation: 'add',
          valueType: 'flat',
          value: pts,
          statKey: st.statKey,
          isStatPointProgression: true,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Mixed Synergy Flat CustomCards
  for (const syn of MIXED_SYNERGY_METADATA) {
    for (const tier of tiers) {
      const val = YOUTH_BALANCE.synergyFlat[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? syn.name : `${syn.name} (${tier})`;

      customCards.push({
        id: `card-youth-synergy-flat-${syn.id.replace('synergy-', '')}-${tierLower}`,
        name: cardName,
        category: 'youth',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${syn.description} Grants +${val} to each synergy attribute (capped at 99).`,
        iconName: syn.iconName,
        modifiers: syn.stats.map((st) => ({
          id: `mod-yc-sf-${syn.id}-${st.statKey}-${tierLower}`,
          target: 'stat_specific' as ModifierTarget,
          operation: 'add',
          valueType: 'flat',
          value: val,
          statKey: st.statKey,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Mixed Synergy Points CustomCards
  for (const syn of MIXED_SYNERGY_METADATA) {
    for (const tier of tiers) {
      const pts = YOUTH_BALANCE.synergyPoints[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? `${syn.name} Focus` : `${syn.name} Focus (${tier})`;

      customCards.push({
        id: `card-youth-synergy-points-${syn.id.replace('synergy-', '')}-${tierLower}`,
        name: cardName,
        category: 'youth',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${syn.description} Grants +${pts} Development Points to each synergy attribute.`,
        iconName: syn.iconName,
        modifiers: syn.stats.map((st) => ({
          id: `mod-yc-sp-${syn.id}-${st.statKey}-${tierLower}`,
          target: 'stat_point_investment',
          operation: 'add',
          valueType: 'flat',
          value: pts,
          statKey: st.statKey,
          isStatPointProgression: true,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Universal Distributable Stat Point CustomCards
  for (const tier of tiers) {
    const pts = YOUTH_BALANCE.distributablePoints[tier];
    const tierLower = tier.toLowerCase() as CustomCardTier;
    const cardName = tier === 'Bronze' ? DISTRIBUTABLE_POINT_METADATA.youth.name : `${DISTRIBUTABLE_POINT_METADATA.youth.name} (${tier})`;

    customCards.push({
      id: `card-youth-distributable-points-${tierLower}`,
      name: cardName,
      category: 'youth',
      tier: tierLower,
      effectCategory: 'positive',
      duration: 'none',
      description: `${DISTRIBUTABLE_POINT_METADATA.youth.description} Grants +${pts} Unassigned Development Points.`,
      iconName: DISTRIBUTABLE_POINT_METADATA.youth.iconName,
      modifiers: [
        {
          id: `mod-yc-free-${tierLower}`,
          target: 'stat_free_points',
          operation: 'add',
          valueType: 'flat',
          value: pts,
        },
      ],
      createdAt: '2025-01-01',
    });
  }

  return customCards;
}

export function getCareerStatCustomCards(): CustomCard[] {
  const customCards: CustomCard[] = [];
  const tiers: ('Bronze' | 'Silver' | 'Gold' | 'Legendary')[] = ['Bronze', 'Silver', 'Gold', 'Legendary'];

  // Single Stat Flat
  for (const s of OUTFIELD_STAT_METADATA) {
    for (const tier of tiers) {
      const val = CAREER_BALANCE.singleStatFlat[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? s.careerFlatName : `${s.careerFlatName} (${tier})`;

      customCards.push({
        id: `card-career-stat-flat-${s.statKey}-${tierLower}`,
        name: cardName,
        category: 'career',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${s.careerFlatDesc} Grants +${val} ${s.statLabel} directly (capped at 99).`,
        iconName: s.iconName,
        modifiers: [
          {
            id: `mod-car-flat-${s.statKey}-${tierLower}`,
            target: 'stat_specific' as ModifierTarget,
            operation: 'add',
            valueType: 'flat',
            value: val,
            statKey: s.statKey,
          },
        ],
        createdAt: '2025-01-01',
      });
    }
  }

  // Single Stat Points
  for (const s of OUTFIELD_STAT_METADATA) {
    for (const tier of tiers) {
      const pts = CAREER_BALANCE.singleStatPoints[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? s.careerPointsName : `${s.careerPointsName} (${tier})`;

      customCards.push({
        id: `card-career-stat-points-${s.statKey}-${tierLower}`,
        name: cardName,
        category: 'career',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${s.careerPointsDesc} Grants +${pts} Development Points to ${s.statLabel}.`,
        iconName: s.iconName,
        modifiers: [
          {
            id: `mod-car-pts-${s.statKey}-${tierLower}`,
            target: 'stat_point_investment',
            operation: 'add',
            valueType: 'flat',
            value: pts,
            statKey: s.statKey,
            isStatPointProgression: true,
          },
        ],
        statPointsBonus: {
          statKey: s.statKey,
          statLabel: s.statLabel,
          points: pts,
        },
        createdAt: '2025-01-01',
      });
    }
  }

  // Stat Group Flat
  for (const g of STAT_GROUP_METADATA) {
    for (const tier of tiers) {
      const val = CAREER_BALANCE.groupFlat[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? g.careerFlatName : `${g.careerFlatName} (${tier})`;

      customCards.push({
        id: `card-career-group-flat-${g.groupKey.toLowerCase()}-${tierLower}`,
        name: cardName,
        category: 'career',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${g.careerFlatDesc} Grants +${val} to each attribute in the ${g.name} (capped at 99).`,
        iconName: g.iconName,
        modifiers: g.stats.map((st) => ({
          id: `mod-car-gf-${g.groupKey.toLowerCase()}-${st.statKey}-${tierLower}`,
          target: 'stat_specific' as ModifierTarget,
          operation: 'add',
          valueType: 'flat',
          value: val,
          statKey: st.statKey,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Stat Group Points
  for (const g of STAT_GROUP_METADATA) {
    for (const tier of tiers) {
      const pts = CAREER_BALANCE.groupPoints[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? g.careerPointsName : `${g.careerPointsName} (${tier})`;

      customCards.push({
        id: `card-career-group-points-${g.groupKey.toLowerCase()}-${tierLower}`,
        name: cardName,
        category: 'career',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${g.careerPointsDesc} Grants +${pts} Development Points to each attribute in the ${g.name}.`,
        iconName: g.iconName,
        modifiers: g.stats.map((st) => ({
          id: `mod-car-gp-${g.groupKey.toLowerCase()}-${st.statKey}-${tierLower}`,
          target: 'stat_point_investment',
          operation: 'add',
          valueType: 'flat',
          value: pts,
          statKey: st.statKey,
          isStatPointProgression: true,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Mixed Synergy Flat
  for (const syn of MIXED_SYNERGY_METADATA) {
    for (const tier of tiers) {
      const val = CAREER_BALANCE.synergyFlat[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? syn.name : `${syn.name} (${tier})`;

      customCards.push({
        id: `card-career-synergy-flat-${syn.id.replace('synergy-', '')}-${tierLower}`,
        name: cardName,
        category: 'career',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${syn.description} Grants +${val} to each synergy attribute (capped at 99).`,
        iconName: syn.iconName,
        modifiers: syn.stats.map((st) => ({
          id: `mod-car-sf-${syn.id}-${st.statKey}-${tierLower}`,
          target: 'stat_specific' as ModifierTarget,
          operation: 'add',
          valueType: 'flat',
          value: val,
          statKey: st.statKey,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Mixed Synergy Points
  for (const syn of MIXED_SYNERGY_METADATA) {
    for (const tier of tiers) {
      const pts = CAREER_BALANCE.synergyPoints[tier];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? `${syn.name} Focus` : `${syn.name} Focus (${tier})`;

      customCards.push({
        id: `card-career-synergy-points-${syn.id.replace('synergy-', '')}-${tierLower}`,
        name: cardName,
        category: 'career',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${syn.description} Grants +${pts} Development Points to each synergy attribute.`,
        iconName: syn.iconName,
        modifiers: syn.stats.map((st) => ({
          id: `mod-car-sp-${syn.id}-${st.statKey}-${tierLower}`,
          target: 'stat_point_investment',
          operation: 'add',
          valueType: 'flat',
          value: pts,
          statKey: st.statKey,
          isStatPointProgression: true,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Distributable Stat Points
  for (const tier of tiers) {
    const pts = CAREER_BALANCE.distributablePoints[tier];
    const tierLower = tier.toLowerCase() as CustomCardTier;
    const cardName = tier === 'Bronze' ? DISTRIBUTABLE_POINT_METADATA.career.name : `${DISTRIBUTABLE_POINT_METADATA.career.name} (${tier})`;

    customCards.push({
      id: `card-career-distributable-points-${tierLower}`,
      name: cardName,
      category: 'career',
      tier: tierLower,
      effectCategory: 'positive',
      duration: 'none',
      description: `${DISTRIBUTABLE_POINT_METADATA.career.description} Grants +${pts} Unassigned Development Points.`,
      iconName: DISTRIBUTABLE_POINT_METADATA.career.iconName,
      modifiers: [
        {
          id: `mod-car-free-${tierLower}`,
          target: 'stat_free_points',
          operation: 'add',
          valueType: 'flat',
          value: pts,
        },
      ],
      createdAt: '2025-01-01',
    });
  }

  // Iconic Card: Superior Training
  customCards.push({
    id: 'card-career-superior-training',
    name: 'Superior Training',
    category: 'career',
    tier: 'iconic',
    effectCategory: 'positive',
    duration: 'none',
    description: 'You discovered a new form of training. Grants +100 Development Stat Points instantly.',
    iconName: 'Crown',
    modifiers: [
      {
        id: 'mod-car-superior-training-100',
        target: 'stat_free_points',
        operation: 'add',
        valueType: 'flat',
        value: 100,
      },
    ],
    createdAt: '2025-01-01',
  });

  return customCards;
}

/**
 * 3. STREET CUSTOM CARDS GENERATOR (For OptionFile & CardDeckEditor)
 * Generates CustomCard objects for all Street positive overhauled stat cards.
 */
export function getStreetStatCustomCards(): CustomCard[] {
  const customCards: CustomCard[] = [];
  const tiers: Array<'Bronze' | 'Silver' | 'Gold' | 'Legendary'> = ['Bronze', 'Silver', 'Gold', 'Legendary'];

  // Single Stat Flat CustomCards
  for (const s of OUTFIELD_STAT_METADATA) {
    for (const tier of tiers) {
      const tierKey = tier.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'legendary';
      const val = STREET_BALANCE.singleStatFlat[tierKey];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? s.streetFlatName : `${s.streetFlatName} (${tier})`;

      customCards.push({
        id: `card-street-stat-flat-${s.statKey}-${tierLower}`,
        name: cardName,
        category: 'street',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${s.streetFlatDesc} Grants +${val} ${s.statLabel} directly (capped at 99).`,
        iconName: s.iconName,
        modifiers: [
          {
            id: `mod-str-sf-${s.statKey}-${tierLower}`,
            target: 'stat_specific' as ModifierTarget,
            operation: 'add',
            valueType: 'flat',
            value: val,
            statKey: s.statKey,
          },
        ],
        createdAt: '2025-01-01',
      });
    }
  }

  // Single Stat Points CustomCards
  for (const s of OUTFIELD_STAT_METADATA) {
    for (const tier of tiers) {
      const tierKey = tier.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'legendary';
      const pts = STREET_BALANCE.singleStatPoints[tierKey];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? s.streetPointsName : `${s.streetPointsName} (${tier})`;

      customCards.push({
        id: `card-street-stat-points-${s.statKey}-${tierLower}`,
        name: cardName,
        category: 'street',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${s.streetPointsDesc} Grants +${pts} Development Points to ${s.statLabel}.`,
        iconName: s.iconName,
        modifiers: [
          {
            id: `mod-str-sp-${s.statKey}-${tierLower}`,
            target: 'stat_point_investment',
            operation: 'add',
            valueType: 'flat',
            value: pts,
            statKey: s.statKey,
            isStatPointProgression: true,
          },
        ],
        statPointsBonus: {
          statKey: s.statKey,
          statLabel: s.statLabel,
          points: pts,
        },
        createdAt: '2025-01-01',
      });
    }
  }

  // Stat Group Flat CustomCards
  for (const g of STAT_GROUP_METADATA) {
    for (const tier of tiers) {
      const tierKey = tier.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'legendary';
      const val = STREET_BALANCE.groupFlat[tierKey];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? g.streetFlatName : `${g.streetFlatName} (${tier})`;

      customCards.push({
        id: `card-street-group-flat-${g.groupKey.toLowerCase()}-${tierLower}`,
        name: cardName,
        category: 'street',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${g.streetFlatDesc} Grants +${val} to each attribute in the ${g.name} (capped at 99).`,
        iconName: g.iconName,
        modifiers: g.stats.map((st) => ({
          id: `mod-str-gf-${g.groupKey.toLowerCase()}-${st.statKey}-${tierLower}`,
          target: 'stat_specific' as ModifierTarget,
          operation: 'add',
          valueType: 'flat',
          value: val,
          statKey: st.statKey,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Stat Group Points CustomCards
  for (const g of STAT_GROUP_METADATA) {
    for (const tier of tiers) {
      const tierKey = tier.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'legendary';
      const pts = STREET_BALANCE.groupPoints[tierKey];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? g.streetPointsName : `${g.streetPointsName} (${tier})`;

      customCards.push({
        id: `card-street-group-points-${g.groupKey.toLowerCase()}-${tierLower}`,
        name: cardName,
        category: 'street',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${g.streetPointsDesc} Grants +${pts} Development Points to each attribute in the ${g.name}.`,
        iconName: g.iconName,
        modifiers: g.stats.map((st) => ({
          id: `mod-str-gp-${g.groupKey.toLowerCase()}-${st.statKey}-${tierLower}`,
          target: 'stat_point_investment',
          operation: 'add',
          valueType: 'flat',
          value: pts,
          statKey: st.statKey,
          isStatPointProgression: true,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Mixed Synergy Flat CustomCards
  for (const syn of MIXED_SYNERGY_METADATA) {
    for (const tier of tiers) {
      const tierKey = tier.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'legendary';
      const val = STREET_BALANCE.synergyFlat[tierKey];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? syn.name : `${syn.name} (${tier})`;

      customCards.push({
        id: `card-street-synergy-flat-${syn.id.replace('synergy-', '')}-${tierLower}`,
        name: cardName,
        category: 'street',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${syn.description} Grants +${val} to each synergy attribute (capped at 99).`,
        iconName: syn.iconName,
        modifiers: syn.stats.map((st) => ({
          id: `mod-str-sf-${syn.id}-${st.statKey}-${tierLower}`,
          target: 'stat_specific' as ModifierTarget,
          operation: 'add',
          valueType: 'flat',
          value: val,
          statKey: st.statKey,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Mixed Synergy Points CustomCards
  for (const syn of MIXED_SYNERGY_METADATA) {
    for (const tier of tiers) {
      const tierKey = tier.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'legendary';
      const pts = STREET_BALANCE.synergyPoints[tierKey];
      const tierLower = tier.toLowerCase() as CustomCardTier;
      const cardName = tier === 'Bronze' ? `${syn.name} Focus` : `${syn.name} Focus (${tier})`;

      customCards.push({
        id: `card-street-synergy-points-${syn.id.replace('synergy-', '')}-${tierLower}`,
        name: cardName,
        category: 'street',
        tier: tierLower,
        effectCategory: 'positive',
        duration: 'none',
        description: `${syn.description} Grants +${pts} Development Points to each synergy attribute.`,
        iconName: syn.iconName,
        modifiers: syn.stats.map((st) => ({
          id: `mod-str-sp-${syn.id}-${st.statKey}-${tierLower}`,
          target: 'stat_point_investment',
          operation: 'add',
          valueType: 'flat',
          value: pts,
          statKey: st.statKey,
          isStatPointProgression: true,
        })),
        createdAt: '2025-01-01',
      });
    }
  }

  // Distributable Stat Points
  for (const tier of tiers) {
    const tierKey = tier.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'legendary';
    const pts = STREET_BALANCE.distributablePoints[tierKey];
    const tierLower = tier.toLowerCase() as CustomCardTier;
    const cardName = tier === 'Bronze' ? DISTRIBUTABLE_POINT_METADATA.street.name : `${DISTRIBUTABLE_POINT_METADATA.street.name} (${tier})`;

    customCards.push({
      id: `card-street-distributable-points-${tierLower}`,
      name: cardName,
      category: 'street',
      tier: tierLower,
      effectCategory: 'positive',
      duration: 'none',
      description: `${DISTRIBUTABLE_POINT_METADATA.street.description} Grants +${pts} Unassigned Development Points.`,
      iconName: DISTRIBUTABLE_POINT_METADATA.street.iconName,
      modifiers: [
        {
          id: `mod-str-free-${tierLower}`,
          target: 'stat_free_points',
          operation: 'add',
          valueType: 'flat',
          value: pts,
        },
      ],
      createdAt: '2025-01-01',
    });
  }

  return customCards;
}

// ==========================================
// BACKWARD COMPATIBILITY EXPORTS
// ==========================================

export interface StatCardDefinition {
  statKey: string;
  statLabel: string;
  category: 'outfield' | 'gk';
  youthName: string;
  youthDescription: string;
  careerName: string;
  careerDescription: string;
  iconName: string;
  designColor: string;
}

export const STAT_CARD_DEFINITIONS: StatCardDefinition[] = OUTFIELD_STAT_METADATA.map((s) => ({
  statKey: s.statKey,
  statLabel: s.statLabel,
  category: 'outfield',
  youthName: s.youthPointsName,
  youthDescription: s.youthPointsDesc,
  careerName: s.careerPointsName,
  careerDescription: s.careerPointsDesc,
  iconName: s.iconName,
  designColor: s.designColor,
}));

export const TIER_DEVELOPMENT_POINTS: Record<'Bronze' | 'Silver' | 'Gold' | 'Legendary', number> = {
  Bronze: 1,
  Silver: 2,
  Gold: 5,
  Legendary: 10,
};
