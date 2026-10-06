import { FormationType, TacticalStyle, TacticalPositionSetup, PlaystyleAssignment } from '../types/leagueEditor';

export interface ClubTacticalProfile {
  managerName: string;
  managerNationality: string;
  primaryFormation: FormationType;
  primaryStyle: TacticalStyle;
  secondaryFormation: FormationType;
  secondaryStyle: TacticalStyle;
  starOverrides?: { role: string; playstyle: PlaystyleAssignment; slotId?: string }[];
}

export interface TacticalPreset {
  id: string;
  name: string;
  subtitle: string;
  flagEmoji: string;
  formation: FormationType;
  style: TacticalStyle;
  description: string;
  positions: TacticalPositionSetup[];
}

/**
 * 7 Definitive Tactical Blueprints & Archetypes
 */
export const TACTICAL_PRESETS: TacticalPreset[] = [
  {
    id: 'brexit_ball_442',
    name: 'The Brexit Ball (Direct 4-4-2)',
    subtitle: 'Burnley, Stoke, Millwall & Everton Physical Direct Football',
    flagEmoji: '🇬🇧',
    formation: '4-4-2',
    style: 'long_balls',
    description: 'Direct aerial football bypassing midfield. Dual strikers (Target Man hold-up + Poacher predator), Enforcer & Box-to-Box midfield, Traditional crossing wingers, Destroyer + Stopper CBs, and a Wall in goal.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Wall', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Defensive', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Balanced', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Enforcer', zoneRow: 5, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_lm', role: 'LW', playstyle: 'Traditional', zoneRow: 4, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_rm', role: 'RW', playstyle: 'Traditional', zoneRow: 4, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_st1', role: 'ST', playstyle: 'Poacher', zoneRow: 0, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st2', role: 'ST', playstyle: 'Target', zoneRow: 0, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'tiki_taka_433',
    name: 'Tiki-Taka / Positional (4-3-3)',
    subtitle: 'Pep Guardiola / Man City & Barça Positional Play',
    flagEmoji: '👑',
    formation: '4-3-3',
    style: 'possession',
    description: 'Dominant ball control with high line, Inverted Fullbacks, ball-playing CBs (Distributor + Playmaker), Anchor pivot, Maestro creator, Inverted Wingers cutting inside, and a Decoy False 9.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Sweeper', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Inverted', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Distributor', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Playmaker', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Inverted', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm', role: 'CDM', playstyle: 'Anchor', zoneRow: 6, zoneCol: 1, heightOffset: -1 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Maestro', zoneRow: 5, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_lw', role: 'LW', playstyle: 'Inverted', zoneRow: 1, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st', role: 'ST', playstyle: 'Decoy', zoneRow: 0, zoneCol: 1, heightOffset: 0 },
      { slotId: 'att_rw', role: 'RW', playstyle: 'Inverted', zoneRow: 1, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'gegenpressing_433',
    name: 'Heavy Metal Gegenpressing (4-3-3)',
    subtitle: 'Arne Slot / Klopp / Postecoglou High Intensity Press',
    flagEmoji: '⚡',
    formation: '4-3-3',
    style: 'gegenpressing',
    description: 'Relentless counter-pressing upon losing possession. High-flying attacking fullbacks, Pressing wingers suffocating defenders, Enforcer holding shield, and Complete dynamic striker.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Sweeper', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm', role: 'CDM', playstyle: 'Enforcer', zoneRow: 6, zoneCol: 1, heightOffset: -1 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Runner', zoneRow: 5, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_lw', role: 'LW', playstyle: 'Pressing', zoneRow: 1, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st', role: 'ST', playstyle: 'Complete', zoneRow: 0, zoneCol: 1, heightOffset: 0 },
      { slotId: 'att_rw', role: 'RW', playstyle: 'Pressing', zoneRow: 1, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'blitz_counter_4231',
    name: 'Mouball / Lethal Counter-Attack (4-2-3-1)',
    subtitle: 'José Mourinho / Real Madrid Ruthless Counter-Attacking Masterclass',
    flagEmoji: '🚀',
    formation: '4-2-3-1',
    style: 'counter_attack',
    description: 'Disciplined, compact mid-to-low block engineered by José Mourinho. Unforgiving defensive spine with dual holding pivots (Anchor + Enforcer / Box-to-Box), elite playmaking CAM launching rapid direct counters into blistering prolific wingers and a predatory lethal number 9.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Wall', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Distributor', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Balanced', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm1', role: 'CDM', playstyle: 'Anchor', zoneRow: 6, zoneCol: 0, heightOffset: -1 },
      { slotId: 'mid_cdm2', role: 'CDM', playstyle: 'Enforcer', zoneRow: 6, zoneCol: 2, heightOffset: -1 },
      { slotId: 'mid_cam', role: 'CAM', playstyle: 'Shadow', zoneRow: 3, zoneCol: 1, heightOffset: 1 },
      { slotId: 'mid_lw', role: 'LW', playstyle: 'Prolific', zoneRow: 3, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_rw', role: 'RW', playstyle: 'Prolific', zoneRow: 3, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_st', role: 'ST', playstyle: 'Poacher', zoneRow: 0, zoneCol: 1, heightOffset: 0 },
    ],
  },
  {
    id: 'catenaccio_532',
    name: 'Iron Fortress Catenaccio (5-3-2)',
    subtitle: 'Diego Simeone / Cholo Low Block & Steel Defense',
    flagEmoji: '🛡️',
    formation: '5-3-2',
    style: 'catenaccio',
    description: 'Impenetrable defensive fortress with 3 centerbacks (Distributor, Destroyer, Stopper), defensive fullbacks, Enforcer anchor, and lethal dual counter strikers (Finisher + Target Man).',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Wall', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Defensive', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Distributor', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb3', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Defensive', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm', role: 'CDM', playstyle: 'Enforcer', zoneRow: 6, zoneCol: 1, heightOffset: -1 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Runner', zoneRow: 5, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_st1', role: 'ST', playstyle: 'Finisher', zoneRow: 0, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st2', role: 'ST', playstyle: 'Target', zoneRow: 0, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'total_control_3421',
    name: 'Total Wingback Overload (3-4-2-1)',
    subtitle: 'Ruben Amorim / Xabi Alonso Tactical Dynamics',
    flagEmoji: '🌪️',
    formation: '3-4-2-1',
    style: 'possession',
    description: '3 CB build-up with wide wingback overloads, twin playmakers/shadow strikers in the pockets behind the striker, and relentless positional switching.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Sweeper', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Distributor', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb3', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_lm', role: 'LW', playstyle: 'Traditional', zoneRow: 4, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Maestro', zoneRow: 5, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Anchor', zoneRow: 5, zoneCol: 1, heightOffset: 0 },
      { slotId: 'mid_rm', role: 'RW', playstyle: 'Traditional', zoneRow: 4, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cam', role: 'CAM', playstyle: 'Creator', zoneRow: 3, zoneCol: 1, heightOffset: 1 },
      { slotId: 'att_st1', role: 'ST', playstyle: 'Poacher', zoneRow: 0, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st2', role: 'ST', playstyle: 'Complete', zoneRow: 0, zoneCol: 2, heightOffset: 0 },
    ],
  },
  {
    id: 'south_american_4312',
    name: 'La Nuestra & Garra Sudamericana (4-3-3 / 4-3-1-2)',
    subtitle: 'Marcelo Gallardo / River & Boca High Intensity and Flair',
    flagEmoji: '🇦🇷',
    formation: '4-3-3',
    style: 'gegenpressing',
    description: 'Fierce South American pressing with dribbling technical wingers, Enforcer pitbull CDM, Box-to-Box and Maestro midfielders, and relentless False 9 / Decoy striker.',
    positions: [
      { slotId: 'gk_1', role: 'GK', playstyle: 'Wall', zoneRow: 9, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_lb', role: 'LB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 0, heightOffset: 0 },
      { slotId: 'def_cb1', role: 'CB', playstyle: 'Destroyer', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_cb2', role: 'CB', playstyle: 'Stopper', zoneRow: 8, zoneCol: 1, heightOffset: 0 },
      { slotId: 'def_rb', role: 'RB', playstyle: 'Attacker', zoneRow: 8, zoneCol: 2, heightOffset: 0 },
      { slotId: 'mid_cdm', role: 'CDM', playstyle: 'Enforcer', zoneRow: 6, zoneCol: 1, heightOffset: -1 },
      { slotId: 'mid_cm1', role: 'CM', playstyle: 'Box-to-Box', zoneRow: 5, zoneCol: 0, heightOffset: 0 },
      { slotId: 'mid_cm2', role: 'CM', playstyle: 'Maestro', zoneRow: 5, zoneCol: 2, heightOffset: 0 },
      { slotId: 'att_lw', role: 'LW', playstyle: 'Pressing', zoneRow: 1, zoneCol: 0, heightOffset: 0 },
      { slotId: 'att_st', role: 'ST', playstyle: 'Decoy', zoneRow: 0, zoneCol: 1, heightOffset: 0 },
      { slotId: 'att_rw', role: 'RW', playstyle: 'Pressing', zoneRow: 1, zoneCol: 2, heightOffset: 0 },
    ],
  },
];

/**
 * Authentic tactical database of clubs across England, Spain, France, Argentina, Brazil & Youth.
 */
export const CLUB_TACTICAL_PROFILES: Record<string, ClubTacticalProfile> = {
  // === ENGLAND PREMIER LEAGUE ===
  eng_mancity: {
    managerName: 'Enzo Maresca',
    managerNationality: 'Italy',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'RW', playstyle: 'Inverted', slotId: 'att_rw' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
      { role: 'CB', playstyle: 'Distributor', slotId: 'def_cb1' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
    ],
  },
  eng_liverpool: {
    managerName: 'Arne Slot',
    managerNationality: 'Netherlands',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'LW', playstyle: 'Pressing', slotId: 'att_lw' },
      { role: 'RW', playstyle: 'Pressing', slotId: 'att_rw' },
      { role: 'ST', playstyle: 'Complete', slotId: 'att_st' },
      { role: 'CAM', playstyle: 'Creator', slotId: 'mid_cam' },
    ],
  },
  eng_arsenal: {
    managerName: 'Mikel Arteta',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
      { role: 'CM', playstyle: 'Box-to-Box', slotId: 'mid_cm1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb1' },
      { role: 'LB', playstyle: 'Inverted', slotId: 'def_lb' },
    ],
  },
  eng_chelsea: {
    managerName: 'Liam Rosenior',
    managerNationality: 'England',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'CAM', playstyle: 'Creator', slotId: 'mid_cam' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'RB', playstyle: 'Attacker', slotId: 'def_rb' },
    ],
  },
  eng_manutd: {
    managerName: 'Ruben Amorim',
    managerNationality: 'Portugal',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'CAM', playstyle: 'Shadow', slotId: 'mid_cam' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'CM', playstyle: 'Maestro', slotId: 'mid_cm1' },
    ],
  },
  eng_tottenham: {
    managerName: 'Thomas Frank',
    managerNationality: 'Denmark',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'CDM', playstyle: 'Enforcer', slotId: 'mid_cdm1' },
      { role: 'CDM', playstyle: 'Box-to-Box', slotId: 'mid_cdm2' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb1' },
      { role: 'LB', playstyle: 'Attacker', slotId: 'def_lb' },
      { role: 'CAM', playstyle: 'Creator', slotId: 'mid_cam' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
    ],
  },
  eng_newcastle: {
    managerName: 'Matthias Jaissle',
    managerNationality: 'Germany',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'RB', playstyle: 'Attacker', slotId: 'def_rb' },
      { role: 'ST', playstyle: 'Complete', slotId: 'att_st' },
    ],
  },
  eng_astonvilla: {
    managerName: 'Unai Emery',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'CDM', playstyle: 'Enforcer', slotId: 'mid_cdm1' },
    ],
  },
  eng_westham: {
    managerName: 'Julen Lopetegui',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  eng_brighton: {
    managerName: 'Fabian Hürzeler',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'gegenpressing',
  },
  eng_fulham: {
    managerName: 'Marco Silva',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  eng_brentford: {
    managerName: 'Thomas Frank',
    managerNationality: 'Denmark',
    primaryFormation: '3-5-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'long_balls',
    starOverrides: [
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
    ],
  },
  eng_palace: {
    managerName: 'Oliver Glasner',
    managerNationality: 'Austria',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  eng_wolves: {
    managerName: 'Gary O\'Neil',
    managerNationality: 'England',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  eng_everton: {
    managerName: 'Sean Dyche',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  eng_bournemouth: {
    managerName: 'Andoni Iraola',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  eng_nottingham: {
    managerName: 'Nuno Espírito Santo',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'catenaccio',
  },
  eng_leicester: {
    managerName: 'Steve Cooper',
    managerNationality: 'Wales',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  eng_ipswich: {
    managerName: 'Kieran McKenna',
    managerNationality: 'Northern Ireland',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  eng_southampton: {
    managerName: 'Russell Martin',
    managerNationality: 'Scotland',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'possession',
  },

  // === ENGLAND CHAMPIONSHIP (BREXIT BALL CENTRAL) ===
  eng_burnley: {
    managerName: 'Scott Parker',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'LB', playstyle: 'Defensive', slotId: 'def_lb' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'RB', playstyle: 'Balanced', slotId: 'def_rb' },
      { role: 'CM', playstyle: 'Box-to-Box', slotId: 'mid_cm1' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
      { role: 'LW', playstyle: 'Traditional', slotId: 'mid_lm' },
      { role: 'RW', playstyle: 'Traditional', slotId: 'mid_rm' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
    ],
  },
  eng_stoke: {
    managerName: 'Narcís Pèlach',
    managerNationality: 'Spain',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
    ],
  },
  eng_millwall: {
    managerName: 'Neil Harris',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  eng_luton: {
    managerName: 'Rob Edwards',
    managerNationality: 'Wales',
    primaryFormation: '3-5-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
    ],
  },
  eng_sheffield: {
    managerName: 'Chris Wilder',
    managerNationality: 'England',
    primaryFormation: '3-5-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
    ],
  },
  eng_leeds: {
    managerName: 'Daniel Farke',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  eng_wba: {
    managerName: 'Carlos Corberán',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
  },
  eng_norwich: {
    managerName: 'Johannes Hoff Thorup',
    managerNationality: 'Denmark',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },
  eng_sunderland: {
    managerName: 'Régis Le Bris',
    managerNationality: 'France',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  eng_preston: {
    managerName: 'Paul Heckingbottom',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'catenaccio',
  },
  eng_derby: {
    managerName: 'Paul Warne',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  eng_blackburn: {
    managerName: 'John Eustace',
    managerNationality: 'England',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'long_balls',
  },
  eng_middlesbrough: {
    managerName: 'Michael Carrick',
    managerNationality: 'England',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  eng_coventry: {
    managerName: 'Frank Lampard',
    managerNationality: 'England',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  eng_cardiff: {
    managerName: 'Omer Riza',
    managerNationality: 'England',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },

  // === SPAIN LA LIGA ===
  esp_realmadrid: {
    managerName: 'José Mourinho',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'LW', playstyle: 'Prolific', slotId: 'mid_lw' },
      { role: 'RW', playstyle: 'Prolific', slotId: 'mid_rw' },
      { role: 'CAM', playstyle: 'Shadow', slotId: 'mid_cam' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm1' },
      { role: 'CDM', playstyle: 'Enforcer', slotId: 'mid_cdm2' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
    ],
  },
  esp_barcelona: {
    managerName: 'Hansi Flick',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'RW', playstyle: 'Inverted', slotId: 'mid_rw' },
      { role: 'LW', playstyle: 'Pressing', slotId: 'mid_lw' },
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
    ],
  },
  esp_atletico: {
    managerName: 'Diego Simeone',
    managerNationality: 'Argentina',
    primaryFormation: '5-3-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st1' },
    ],
  },
  esp_realsociedad: {
    managerName: 'Imanol Alguacil',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'gegenpressing',
  },
  esp_athletic: {
    managerName: 'Ernesto Valverde',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'LW', playstyle: 'Pressing', slotId: 'mid_lw' },
      { role: 'RW', playstyle: 'Pressing', slotId: 'mid_rw' },
    ],
  },
  esp_villarreal: {
    managerName: 'Marcelino',
    managerNationality: 'Spain',
    primaryFormation: '4-4-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  esp_realbetis: {
    managerName: 'Manuel Pellegrini',
    managerNationality: 'Chile',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  esp_girona: {
    managerName: 'Míchel',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'possession',
  },
  esp_valencia: {
    managerName: 'Rubén Baraja',
    managerNationality: 'Spain',
    primaryFormation: '4-4-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'catenaccio',
  },
  esp_sevilla: {
    managerName: 'García Pimienta',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  esp_getafe: {
    managerName: 'José Bordalás',
    managerNationality: 'Spain',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CB', playstyle: 'Stopper', slotId: 'def_cb2' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  esp_mallorca: {
    managerName: 'Jagoba Arrasate',
    managerNationality: 'Spain',
    primaryFormation: '5-3-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'long_balls',
  },
  esp_osasuna: {
    managerName: 'Vicente Moreno',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
  },
  esp_celta: {
    managerName: 'Claudio Giráldez',
    managerNationality: 'Spain',
    primaryFormation: '3-4-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  esp_rayo: {
    managerName: 'Íñigo Pérez',
    managerNationality: 'Spain',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },

  // === ARGENTINA LIGA PROFESIONAL ===
  arg_river: {
    managerName: 'Marcelo Gallardo',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'ST', playstyle: 'Decoy', slotId: 'att_st' },
      { role: 'LW', playstyle: 'Pressing', slotId: 'att_lw' },
      { role: 'RW', playstyle: 'Pressing', slotId: 'att_rw' },
      { role: 'CM', playstyle: 'Maestro', slotId: 'mid_cm2' },
    ],
  },
  arg_boca: {
    managerName: 'Fernando Gago',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
    ],
  },
  arg_racing: {
    managerName: 'Gustavo Costas',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st' },
      { role: 'LW', playstyle: 'Prolific', slotId: 'att_lw' },
      { role: 'RW', playstyle: 'Prolific', slotId: 'att_rw' },
    ],
  },
  arg_independiente: {
    managerName: 'Julio Vaccari',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
  },
  arg_sanlorenzo: {
    managerName: 'Miguel Ángel Russo',
    managerNationality: 'Argentina',
    primaryFormation: '4-4-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  arg_velez: {
    managerName: 'Gustavo Quinteros',
    managerNationality: 'Argentina',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  arg_estudiantes: {
    managerName: 'Eduardo Domínguez',
    managerNationality: 'Argentina',
    primaryFormation: '5-3-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
  },
  arg_lanus: {
    managerName: 'Ricardo Zielinski',
    managerNationality: 'Argentina',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'ST', playstyle: 'Poacher', slotId: 'att_st1' },
    ],
  },
  arg_deportivoriestra: {
    managerName: 'Cristian Fabbiani',
    managerNationality: 'Argentina',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
    starOverrides: [
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st2' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
      { role: 'CM', playstyle: 'Enforcer', slotId: 'mid_cm2' },
    ],
  },
  arg_sarmiento: {
    managerName: 'Javier Sanguinetti',
    managerNationality: 'Argentina',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'catenaccio',
  },
  arg_argentinos: {
    managerName: 'Cristian Zermatten',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },
  arg_huracan: {
    managerName: 'Frank Darío Kudelka',
    managerNationality: 'Argentina',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
  },

  // === BRAZIL BRASILEIRÃO ===
  bra_flamengo: {
    managerName: 'Filipe Luís',
    managerNationality: 'Brazil',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'CAM', playstyle: 'Classic N10', slotId: 'mid_cam' },
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st' },
    ],
  },
  bra_palmeiras: {
    managerName: 'Abel Ferreira',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'RW', playstyle: 'Pressing', slotId: 'mid_rw' },
      { role: 'ST', playstyle: 'Complete', slotId: 'att_st' },
    ],
  },
  bra_botafogo: {
    managerName: 'Artur Jorge',
    managerNationality: 'Portugal',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'LW', playstyle: 'Pressing', slotId: 'mid_lw' },
      { role: 'RW', playstyle: 'Pressing', slotId: 'mid_rw' },
    ],
  },
  bra_atletico_mg: {
    managerName: 'Gabriel Milito',
    managerNationality: 'Argentina',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  bra_saopaulo: {
    managerName: 'Luis Zubeldía',
    managerNationality: 'Argentina',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  bra_cruzeiro: {
    managerName: 'Fernando Diniz',
    managerNationality: 'Brazil',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'GK', playstyle: 'Sweeper', slotId: 'gk_1' },
      { role: 'CM', playstyle: 'Maestro', slotId: 'mid_cm1' },
    ],
  },
  bra_corinthians: {
    managerName: 'Ramón Díaz',
    managerNationality: 'Argentina',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'CAM', playstyle: 'Classic N10', slotId: 'mid_cam' },
      { role: 'ST', playstyle: 'Finisher', slotId: 'att_st1' },
    ],
  },
  bra_fluminense: {
    managerName: 'Mano Menezes',
    managerNationality: 'Brazil',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'catenaccio',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
  },
  bra_gremio: {
    managerName: 'Renato Gaúcho',
    managerNationality: 'Brazil',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  bra_internacional: {
    managerName: 'Roger Machado',
    managerNationality: 'Brazil',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
  },
  bra_santos: {
    managerName: 'Leandro Zago',
    managerNationality: 'Brazil',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },

  // === FRANCE LIGUE 1 ===
  fr_psg: {
    managerName: 'Luis Enrique',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'LW', playstyle: 'Pressing', slotId: 'att_lw' },
      { role: 'ST', playstyle: 'Decoy', slotId: 'att_st' },
    ],
  },
  fr_monaco: {
    managerName: 'Adi Hütter',
    managerNationality: 'Austria',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'gegenpressing',
  },
  fr_marseille: {
    managerName: 'Roberto De Zerbi',
    managerNationality: 'Italy',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  fr_lille: {
    managerName: 'Bruno Génésio',
    managerNationality: 'France',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  fr_lyon: {
    managerName: 'Pierre Sage',
    managerNationality: 'France',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  fr_lens: {
    managerName: 'Will Still',
    managerNationality: 'Belgium',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  fr_nice: {
    managerName: 'Franck Haise',
    managerNationality: 'France',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'counter_attack',
  },

  // === GERMAN BUNDESLIGA (FIRST DIVISION) ===
  ger_bayern: {
    managerName: 'Vincent Kompany',
    managerNationality: 'Belgium',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Complete', slotId: 'att_st' },
      { role: 'RW', playstyle: 'Inverted', slotId: 'mid_rw' },
      { role: 'CDM', playstyle: 'Anchor', slotId: 'mid_cdm' },
      { role: 'LW', playstyle: 'Pressing', slotId: 'mid_lw' },
    ],
  },
  ger_leverkusen: {
    managerName: 'Xabi Alonso',
    managerNationality: 'Spain',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'LB', playstyle: 'Inverted', slotId: 'def_lb' },
    ],
  },
  ger_dortmund: {
    managerName: 'Nuri Şahin',
    managerNationality: 'Türkiye',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
    starOverrides: [
      { role: 'GK', playstyle: 'Balanced', slotId: 'gk_1' },
      { role: 'ST', playstyle: 'Target', slotId: 'att_st' },
      { role: 'CDM', playstyle: 'Enforcer', slotId: 'mid_cdm' },
      { role: 'CB', playstyle: 'Destroyer', slotId: 'def_cb1' },
    ],
  },
  ger_leipzig: {
    managerName: 'Marco Rose',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
    starOverrides: [
      { role: 'LB', playstyle: 'Attacker', slotId: 'def_lb' },
      { role: 'CAM', playstyle: 'Shadow', slotId: 'mid_cam' },
      { role: 'GK', playstyle: 'Wall', slotId: 'gk_1' },
    ],
  },
  ger_stuttgart: {
    managerName: 'Sebastian Hoeneß',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'gegenpressing',
    starOverrides: [
      { role: 'ST', playstyle: 'Prolific', slotId: 'att_st' },
    ],
  },
  ger_frankfurt: {
    managerName: 'Dino Toppmöller',
    managerNationality: 'Germany',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },
  ger_mgladbach: {
    managerName: 'Gerardo Seoane',
    managerNationality: 'Switzerland',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  ger_wolfsburg: {
    managerName: 'Ralph Hasenhüttl',
    managerNationality: 'Austria',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-4-1-2',
    secondaryStyle: 'long_balls',
  },
  ger_freiburg: {
    managerName: 'Julian Schuster',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'possession',
  },
  ger_unionberlin: {
    managerName: 'Bo Svensson',
    managerNationality: 'Denmark',
    primaryFormation: '3-5-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'counter_attack',
  },
  ger_hoffenheim: {
    managerName: 'Pellegrino Matarazzo',
    managerNationality: 'United States',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  ger_bremen: {
    managerName: 'Ole Werner',
    managerNationality: 'Germany',
    primaryFormation: '3-5-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '3-4-2-1',
    secondaryStyle: 'possession',
  },
  ger_augsburg: {
    managerName: 'Jess Thorup',
    managerNationality: 'Denmark',
    primaryFormation: '4-4-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'long_balls',
  },
  ger_mainz: {
    managerName: 'Bo Henriksen',
    managerNationality: 'Denmark',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-4-1-2',
    secondaryStyle: 'long_balls',
  },
  ger_heidenheim: {
    managerName: 'Frank Schmidt',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
  },
  ger_stpauli: {
    managerName: 'Alexander Blessin',
    managerNationality: 'Germany',
    primaryFormation: '3-4-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'catenaccio',
  },
  ger_kiel: {
    managerName: 'Marcel Rapp',
    managerNationality: 'Germany',
    primaryFormation: '3-5-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  ger_bochum: {
    managerName: 'Peter Zeidler',
    managerNationality: 'Germany',
    primaryFormation: '4-4-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'long_balls',
  },

  // === GERMAN 2. BUNDESLIGA (SECOND DIVISION) ===
  ger_hsv: {
    managerName: 'Steffen Baumgart',
    managerNationality: 'Germany',
    primaryFormation: '4-3-3',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'long_balls',
  },
  ger_koln: {
    managerName: 'Gerhard Struber',
    managerNationality: 'Austria',
    primaryFormation: '4-4-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  ger_schalke: {
    managerName: 'Kees van Wonderen',
    managerNationality: 'Netherlands',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'long_balls',
  },
  ger_hertha: {
    managerName: 'Cristian Fiél',
    managerNationality: 'Spain',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'possession',
  },
  ger_dusseldorf: {
    managerName: 'Daniel Thioune',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'possession',
  },
  ger_hannover: {
    managerName: 'Stefan Leitl',
    managerNationality: 'Germany',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'long_balls',
  },
  ger_nurnberg: {
    managerName: 'Miroslav Klose',
    managerNationality: 'Germany',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '4-2-3-1',
    secondaryStyle: 'counter_attack',
  },
  ger_kaiserslautern: {
    managerName: 'Markus Anfang',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  ger_karlsruhe: {
    managerName: 'Christian Eichner',
    managerNationality: 'Germany',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'counter_attack',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'long_balls',
  },
  ger_paderborn: {
    managerName: 'Lukas Kwasniok',
    managerNationality: 'Poland',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'possession',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'counter_attack',
  },
  ger_darmstadt: {
    managerName: 'Florian Kohfeldt',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'counter_attack',
  },
  ger_furth: {
    managerName: 'Alexander Zorniger',
    managerNationality: 'Germany',
    primaryFormation: '3-4-1-2',
    primaryStyle: 'gegenpressing',
    secondaryFormation: '3-5-2',
    secondaryStyle: 'long_balls',
  },
  ger_magdeburg: {
    managerName: 'Christian Titz',
    managerNationality: 'Germany',
    primaryFormation: '4-3-3',
    primaryStyle: 'possession',
    secondaryFormation: '3-4-3',
    secondaryStyle: 'possession',
  },
  ger_braunschweig: {
    managerName: 'Daniel Scherning',
    managerNationality: 'Germany',
    primaryFormation: '3-5-2',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'long_balls',
  },
  ger_elversberg: {
    managerName: 'Horst Steffen',
    managerNationality: 'Germany',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'possession',
    secondaryFormation: '4-3-3',
    secondaryStyle: 'counter_attack',
  },
  ger_munster: {
    managerName: 'Sascha Hildmann',
    managerNationality: 'Germany',
    primaryFormation: '4-4-2',
    primaryStyle: 'long_balls',
    secondaryFormation: '5-3-2',
    secondaryStyle: 'catenaccio',
  },
  ger_ulm: {
    managerName: 'Thomas Wörle',
    managerNationality: 'Germany',
    primaryFormation: '3-4-2-1',
    primaryStyle: 'catenaccio',
    secondaryFormation: '5-4-1',
    secondaryStyle: 'counter_attack',
  },
  ger_regensburg: {
    managerName: 'Joe Enochs',
    managerNationality: 'United States',
    primaryFormation: '4-2-3-1',
    primaryStyle: 'long_balls',
    secondaryFormation: '4-4-2',
    secondaryStyle: 'catenaccio',
  },

  // === YOUTH LEAGUE ACADEMIES ===
  eng_y_kensington: { managerName: 'Liam Vance', managerNationality: 'England', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  eng_y_camden: { managerName: 'Marcus Holloway', managerNationality: 'England', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '4-2-3-1', secondaryStyle: 'gegenpressing' },
  eng_y_westminster: { managerName: 'Arthur Sterling', managerNationality: 'England', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  eng_y_greenwich: { managerName: 'Callum O\'Connor', managerNationality: 'England', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  eng_y_islington: { managerName: 'Tariq Bennett', managerNationality: 'England', primaryFormation: '4-2-3-1', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },
  eng_y_hackney: { managerName: 'Darnell Cole', managerNationality: 'England', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '3-4-3', secondaryStyle: 'counter_attack' },
  eng_y_brixton: { managerName: 'Tyrese King', managerNationality: 'England', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },
  eng_y_croydon: { managerName: 'Gary Jenkins', managerNationality: 'England', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
  eng_y_peckham: { managerName: 'Jordan Miller', managerNationality: 'England', primaryFormation: '3-5-2', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'long_balls' },
  eng_y_tottenhamhale: { managerName: 'Ryan Cooper', managerNationality: 'England', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },

  arg_y_palermo: { managerName: 'Mateo Santillán', managerNationality: 'Argentina', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  arg_y_belgrano: { managerName: 'Joaquín Rossi', managerNationality: 'Argentina', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  arg_y_recoleta: { managerName: 'Bautista Menéndez', managerNationality: 'Argentina', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  arg_y_caballito: { managerName: 'Lucas Ferreyra', managerNationality: 'Argentina', primaryFormation: '4-4-2', primaryStyle: 'counter_attack', secondaryFormation: '4-3-3', secondaryStyle: 'gegenpressing' },
  arg_y_santelmo: { managerName: 'Gonzalo Benítez', managerNationality: 'Argentina', primaryFormation: '4-4-2', primaryStyle: 'catenaccio', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  arg_y_flores: { managerName: 'Facundo Giménez', managerNationality: 'Argentina', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },
  arg_y_laboca: { managerName: 'Diego Almada', managerNationality: 'Argentina', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
  arg_y_barracas: { managerName: 'Ignacio Romero', managerNationality: 'Argentina', primaryFormation: '5-3-2', primaryStyle: 'catenaccio', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
  arg_y_mataderos: { managerName: 'Rodrigo Blanco', managerNationality: 'Argentina', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  arg_y_villalugano: { managerName: 'Franco Carrizo', managerNationality: 'Argentina', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },

  esp_y_chamartin: { managerName: 'Álvaro Vega', managerNationality: 'Spain', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  esp_y_salamanca: { managerName: 'Gonzalo Serrano', managerNationality: 'Spain', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  esp_y_retiro: { managerName: 'Ignacio Montero', managerNationality: 'Spain', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '3-4-3', secondaryStyle: 'possession' },
  esp_y_arguelles: { managerName: 'Sergio Navarro', managerNationality: 'Spain', primaryFormation: '4-2-3-1', primaryStyle: 'gegenpressing', secondaryFormation: '4-3-3', secondaryStyle: 'gegenpressing' },
  esp_y_malasana: { managerName: 'Pablo Crespo', managerNationality: 'Spain', primaryFormation: '3-4-2-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  esp_y_lavapies: { managerName: 'Carlos Mendieta', managerNationality: 'Spain', primaryFormation: '4-4-2', primaryStyle: 'counter_attack', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  esp_y_carabanchel: { managerName: 'Borja Prieto', managerNationality: 'Spain', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  esp_y_vallecas: { managerName: 'Raúl Heredia', managerNationality: 'Spain', primaryFormation: '4-2-3-1', primaryStyle: 'gegenpressing', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  esp_y_usera: { managerName: 'David Salgado', managerNationality: 'Spain', primaryFormation: '5-3-2', primaryStyle: 'catenaccio', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
  esp_y_villaverde: { managerName: 'Rubén Casado', managerNationality: 'Spain', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },

  fr_y_montmartre: { managerName: 'Julien Moreau', managerNationality: 'France', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  fr_y_passy: { managerName: 'Sébastien Laurent', managerNationality: 'France', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  fr_y_bastille: { managerName: 'Maxime Dubois', managerNationality: 'France', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '4-2-3-1', secondaryStyle: 'gegenpressing' },
  fr_y_belleville: { managerName: 'Romain Marchand', managerNationality: 'France', primaryFormation: '4-2-3-1', primaryStyle: 'counter_attack', secondaryFormation: '3-4-2-1', secondaryStyle: 'counter_attack' },
  fr_y_lemarais: { managerName: 'Adrien Girard', managerNationality: 'France', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  fr_y_montparnasse: { managerName: 'Thomas Chevalier', managerNationality: 'France', primaryFormation: '4-4-2', primaryStyle: 'counter_attack', secondaryFormation: '4-2-3-1', secondaryStyle: 'catenaccio' },
  fr_y_batignolles: { managerName: 'Alexandre Roy', managerNationality: 'France', primaryFormation: '3-5-2', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'counter_attack' },
  fr_y_lavillette: { managerName: 'Fabien Colin', managerNationality: 'France', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  fr_y_clignancourt: { managerName: 'Florian Renaud', managerNationality: 'France', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  fr_y_auteuil: { managerName: 'Vincent Guérin', managerNationality: 'France', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },

  bra_y_moema: { managerName: 'Thiago Nogueira', managerNationality: 'Brazil', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  bra_y_pinheiros: { managerName: 'Rodrigo Alcantara', managerNationality: 'Brazil', primaryFormation: '4-2-3-1', primaryStyle: 'possession', secondaryFormation: '4-3-3', secondaryStyle: 'possession' },
  bra_y_vilamariana: { managerName: 'Bruno Vasconcelos', managerNationality: 'Brazil', primaryFormation: '4-3-3', primaryStyle: 'gegenpressing', secondaryFormation: '3-4-3', secondaryStyle: 'gegenpressing' },
  bra_y_tatuape: { managerName: 'Danilo Santana', managerNationality: 'Brazil', primaryFormation: '4-4-2', primaryStyle: 'counter_attack', secondaryFormation: '4-3-3', secondaryStyle: 'counter_attack' },
  bra_y_liberdade: { managerName: 'Kenji Takahashi', managerNationality: 'Brazil', primaryFormation: '4-2-3-1', primaryStyle: 'counter_attack', secondaryFormation: '4-4-2', secondaryStyle: 'possession' },
  bra_y_santana: { managerName: 'Caio Medeiros', managerNationality: 'Brazil', primaryFormation: '4-3-3', primaryStyle: 'counter_attack', secondaryFormation: '4-2-3-1', secondaryStyle: 'counter_attack' },
  bra_y_lapa: { managerName: 'Eduardo Farias', managerNationality: 'Brazil', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-3-2', secondaryStyle: 'catenaccio' },
  bra_y_ipiranga: { managerName: 'Matheus Brandão', managerNationality: 'Brazil', primaryFormation: '4-3-3', primaryStyle: 'possession', secondaryFormation: '4-2-3-1', secondaryStyle: 'possession' },
  bra_y_guaianases: { managerName: 'Wellington Silva', managerNationality: 'Brazil', primaryFormation: '4-4-2', primaryStyle: 'long_balls', secondaryFormation: '5-4-1', secondaryStyle: 'catenaccio' },
  bra_y_capela: { managerName: 'Leandro Barreto', managerNationality: 'Brazil', primaryFormation: '5-3-2', primaryStyle: 'catenaccio', secondaryFormation: '4-4-2', secondaryStyle: 'catenaccio' },
};

/**
 * Authentic Manager Name Bank per country
 */
const COUNTRY_COACH_NAMES: Record<string, { firstNames: string[]; lastNames: string[] }> = {
  ENG: {
    firstNames: ['Jack', 'Darren', 'Stuart', 'Nigel', 'Craig', 'Trevor', 'Duncan', 'Martin', 'Graham', 'Colin', 'Russell', 'Ian'],
    lastNames: ['Henderson', 'Walker', 'Campbell', 'Clarke', 'Holden', 'Wright', 'Robinson', 'Pearson', 'Hughes', 'Watson', 'Bennett', 'Taylor'],
  },
  ESP: {
    firstNames: ['Javier', 'Sergio', 'Álvaro', 'Borja', 'Ignacio', 'Gonzalo', 'Enrique', 'Raúl', 'Pablo', 'Marcos', 'Manuel', 'Fernando'],
    lastNames: ['Navarro', 'Morales', 'Vega', 'Serrano', 'Montero', 'Prieto', 'Heredia', 'Salgado', 'Crespo', 'Mendieta', 'Ibáñez', 'Garrido'],
  },
  FRA: {
    firstNames: ['Julien', 'Sébastien', 'Maxime', 'Romain', 'Adrien', 'Thomas', 'Alexandre', 'Fabien', 'Florian', 'Vincent', 'Benoît', 'Grégory'],
    lastNames: ['Moreau', 'Laurent', 'Dubois', 'Marchand', 'Girard', 'Chevalier', 'Roy', 'Colin', 'Renaud', 'Guérin', 'Tavenot', 'Poirier'],
  },
  ARG: {
    firstNames: ['Agustín', 'Leandro', 'Matías', 'Franco', 'Esteban', 'Hernán', 'Facundo', 'Luciano', 'Ramiro', 'Cristian', 'Damián', 'Mauro'],
    lastNames: ['Benítez', 'Peralta', 'Domínguez', 'Almada', 'Carrizo', 'Giménez', 'Blanco', 'Romero', 'Fabbiani', 'Sanguinetti', 'Vojvoda', 'Oldrá'],
  },
  BRA: {
    firstNames: ['Lucas', 'Marcelo', 'Gabriel', 'Thiago', 'Rodrigo', 'Bruno', 'Danilo', 'Caio', 'Eduardo', 'Matheus', 'Wellington', 'Leandro'],
    lastNames: ['Silveira', 'Guimarães', 'Ferreira', 'Nogueira', 'Alcantara', 'Vasconcelos', 'Santana', 'Medeiros', 'Farias', 'Brandão', 'Barreto', 'Machado'],
  },
  GER: {
    firstNames: ['Lukas', 'Leon', 'Finn', 'Paul', 'Jonas', 'Felix', 'Maximilian', 'Noah', 'Elias', 'Julian', 'Moritz', 'Florian', 'Niklas', 'David', 'Johannes'],
    lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein'],
  },
};

/**
 * Derives or retrieves a club's realistic tactical profile without bugs or duplicate defaults.
 */
export function getClubTacticalProfile(teamId: string = '', teamName: string = '', countryCode: string = 'ENG'): ClubTacticalProfile {
  const normId = (teamId || '').toLowerCase().trim();
  const normName = (teamName || '').toLowerCase().trim();

  // 1. Direct registry ID lookup
  if (normId && CLUB_TACTICAL_PROFILES[normId]) {
    return CLUB_TACTICAL_PROFILES[normId];
  }

  // 2. Normalized prefix matching (e.g. burnley matching eng_burnley)
  if (normId.length >= 4) {
    const strippedId = normId.replace(/^(eng_|esp_|fra_|fr_|arg_|bra_|ger_)/, '');
    for (const [key, profile] of Object.entries(CLUB_TACTICAL_PROFILES)) {
      const strippedKey = key.replace(/^(eng_|esp_|fra_|fr_|arg_|bra_|ger_)/, '');
      if (strippedKey === strippedId) {
        return profile;
      }
    }
  }

  // 3. Name-based match lookup with rich alias support
  if (normName.includes('bayern') || normName.includes('münchen') || normName.includes('munich')) return CLUB_TACTICAL_PROFILES.ger_bayern;
  if (normName.includes('leverkusen') || normName.includes('bayer 04')) return CLUB_TACTICAL_PROFILES.ger_leverkusen;
  if (normName.includes('dortmund') || normName.includes('bvb')) return CLUB_TACTICAL_PROFILES.ger_dortmund;
  if (normName.includes('leipzig') || normName.includes('rbl')) return CLUB_TACTICAL_PROFILES.ger_leipzig;
  if (normName.includes('stuttgart')) return CLUB_TACTICAL_PROFILES.ger_stuttgart;
  if (normName.includes('frankfurt') || normName.includes('eintracht')) return CLUB_TACTICAL_PROFILES.ger_frankfurt;
  if (normName.includes('mönchengladbach') || normName.includes('mgladbach') || normName.includes('gladbach')) return CLUB_TACTICAL_PROFILES.ger_mgladbach;
  if (normName.includes('wolfsburg')) return CLUB_TACTICAL_PROFILES.ger_wolfsburg;
  if (normName.includes('freiburg')) return CLUB_TACTICAL_PROFILES.ger_freiburg;
  if (normName.includes('union berlin')) return CLUB_TACTICAL_PROFILES.ger_unionberlin;
  if (normName.includes('hoffenheim')) return CLUB_TACTICAL_PROFILES.ger_hoffenheim;
  if (normName.includes('bremen') || normName.includes('werder')) return CLUB_TACTICAL_PROFILES.ger_bremen;
  if (normName.includes('augsburg')) return CLUB_TACTICAL_PROFILES.ger_augsburg;
  if (normName.includes('mainz')) return CLUB_TACTICAL_PROFILES.ger_mainz;
  if (normName.includes('heidenheim')) return CLUB_TACTICAL_PROFILES.ger_heidenheim;
  if (normName.includes('st. pauli') || normName.includes('st pauli')) return CLUB_TACTICAL_PROFILES.ger_stpauli;
  if (normName.includes('kiel') || normName.includes('holstein')) return CLUB_TACTICAL_PROFILES.ger_kiel;
  if (normName.includes('bochum')) return CLUB_TACTICAL_PROFILES.ger_bochum;
  if (normName.includes('hamburg') || normName.includes('hsv')) return CLUB_TACTICAL_PROFILES.ger_hsv;
  if (normName.includes('köln') || normName.includes('koln') || normName.includes('cologne')) return CLUB_TACTICAL_PROFILES.ger_koln;
  if (normName.includes('schalke')) return CLUB_TACTICAL_PROFILES.ger_schalke;
  if (normName.includes('hertha')) return CLUB_TACTICAL_PROFILES.ger_hertha;
  if (normName.includes('düsseldorf') || normName.includes('dusseldorf') || normName.includes('fortuna')) return CLUB_TACTICAL_PROFILES.ger_dusseldorf;
  if (normName.includes('hannover')) return CLUB_TACTICAL_PROFILES.ger_hannover;
  if (normName.includes('nürnberg') || normName.includes('nurnberg')) return CLUB_TACTICAL_PROFILES.ger_nurnberg;
  if (normName.includes('kaiserslautern')) return CLUB_TACTICAL_PROFILES.ger_kaiserslautern;
  if (normName.includes('karlsruhe') || normName.includes('ksc')) return CLUB_TACTICAL_PROFILES.ger_karlsruhe;
  if (normName.includes('paderborn')) return CLUB_TACTICAL_PROFILES.ger_paderborn;
  if (normName.includes('darmstadt')) return CLUB_TACTICAL_PROFILES.ger_darmstadt;
  if (normName.includes('fürth') || normName.includes('furth') || normName.includes('greuther')) return CLUB_TACTICAL_PROFILES.ger_furth;
  if (normName.includes('magdeburg')) return CLUB_TACTICAL_PROFILES.ger_magdeburg;
  if (normName.includes('braunschweig') || normName.includes('eintracht braunschweig')) return CLUB_TACTICAL_PROFILES.ger_braunschweig;
  if (normName.includes('elversberg')) return CLUB_TACTICAL_PROFILES.ger_elversberg;
  if (normName.includes('münster') || normName.includes('munster') || normName.includes('preußen')) return CLUB_TACTICAL_PROFILES.ger_munster;
  if (normName.includes('ulm')) return CLUB_TACTICAL_PROFILES.ger_ulm;
  if (normName.includes('regensburg') || normName.includes('jahn')) return CLUB_TACTICAL_PROFILES.ger_regensburg;

  if (normName.includes('burnley')) return CLUB_TACTICAL_PROFILES.eng_burnley;
  if (normName.includes('everton')) return CLUB_TACTICAL_PROFILES.eng_everton;
  if (normName.includes('stoke')) return CLUB_TACTICAL_PROFILES.eng_stoke;
  if (normName.includes('millwall')) return CLUB_TACTICAL_PROFILES.eng_millwall;
  if (normName.includes('luton')) return CLUB_TACTICAL_PROFILES.eng_luton;
  if (normName.includes('sheffield')) return CLUB_TACTICAL_PROFILES.eng_sheffield;
  if (normName.includes('preston')) return CLUB_TACTICAL_PROFILES.eng_preston;
  if (normName.includes('derby')) return CLUB_TACTICAL_PROFILES.eng_derby;
  if (normName.includes('manchester city') || normName.includes('man city')) return CLUB_TACTICAL_PROFILES.eng_mancity;
  if (normName.includes('liverpool')) return CLUB_TACTICAL_PROFILES.eng_liverpool;
  if (normName.includes('arsenal')) return CLUB_TACTICAL_PROFILES.eng_arsenal;
  if (normName.includes('chelsea')) return CLUB_TACTICAL_PROFILES.eng_chelsea;
  if (normName.includes('manchester united') || normName.includes('man utd')) return CLUB_TACTICAL_PROFILES.eng_manutd;
  if (normName.includes('tottenham') || normName.includes('spurs')) return CLUB_TACTICAL_PROFILES.eng_tottenham;
  if (normName.includes('newcastle')) return CLUB_TACTICAL_PROFILES.eng_newcastle;
  if (normName.includes('aston villa')) return CLUB_TACTICAL_PROFILES.eng_astonvilla;
  if (normName.includes('brighton')) return CLUB_TACTICAL_PROFILES.eng_brighton;
  if (normName.includes('brentford')) return CLUB_TACTICAL_PROFILES.eng_brentford;
  if (normName.includes('crystal palace') || normName.includes('palace')) return CLUB_TACTICAL_PROFILES.eng_palace;
  if (normName.includes('real madrid')) return CLUB_TACTICAL_PROFILES.esp_realmadrid;
  if (normName.includes('barcelona') || normName.includes('barça')) return CLUB_TACTICAL_PROFILES.esp_barcelona;
  if (normName.includes('atletico') || normName.includes('atlético')) return CLUB_TACTICAL_PROFILES.esp_atletico;
  if (normName.includes('getafe')) return CLUB_TACTICAL_PROFILES.esp_getafe;
  if (normName.includes('villarreal')) return CLUB_TACTICAL_PROFILES.esp_villarreal;
  if (normName.includes('athletic')) return CLUB_TACTICAL_PROFILES.esp_athletic;
  if (normName.includes('sociedad')) return CLUB_TACTICAL_PROFILES.esp_realsociedad;
  if (normName.includes('mallorca')) return CLUB_TACTICAL_PROFILES.esp_mallorca;
  if (normName.includes('river plate') || normName.includes('river')) return CLUB_TACTICAL_PROFILES.arg_river;
  if (normName.includes('boca juniors') || normName.includes('boca')) return CLUB_TACTICAL_PROFILES.arg_boca;
  if (normName.includes('racing')) return CLUB_TACTICAL_PROFILES.arg_racing;
  if (normName.includes('san lorenzo')) return CLUB_TACTICAL_PROFILES.arg_sanlorenzo;
  if (normName.includes('lanus') || normName.includes('lanús')) return CLUB_TACTICAL_PROFILES.arg_lanus;
  if (normName.includes('riestra')) return CLUB_TACTICAL_PROFILES.arg_deportivoriestra;
  if (normName.includes('flamengo')) return CLUB_TACTICAL_PROFILES.bra_flamengo;
  if (normName.includes('palmeiras')) return CLUB_TACTICAL_PROFILES.bra_palmeiras;
  if (normName.includes('botafogo')) return CLUB_TACTICAL_PROFILES.bra_botafogo;
  if (normName.includes('cruzeiro')) return CLUB_TACTICAL_PROFILES.bra_cruzeiro;
  if (normName.includes('corinthians')) return CLUB_TACTICAL_PROFILES.bra_corinthians;
  if (normName.includes('paris') || normName.includes('psg')) return CLUB_TACTICAL_PROFILES.fr_psg;
  if (normName.includes('monaco')) return CLUB_TACTICAL_PROFILES.fr_monaco;
  if (normName.includes('marseille')) return CLUB_TACTICAL_PROFILES.fr_marseille;
  if (normName.includes('lyon')) return CLUB_TACTICAL_PROFILES.fr_lyon;

  // 4. Deterministic generator with authentic name generation and tactical balance
  let hash = 0;
  const str = `${normId}_${normName}_${countryCode}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  // Tactical Style Archetype Pools
  const archetypes: {
    primaryStyle: TacticalStyle;
    primaryFormation: FormationType;
    secondaryStyle: TacticalStyle;
    secondaryFormation: FormationType;
  }[] = [
    { primaryStyle: 'long_balls', primaryFormation: '4-4-2', secondaryStyle: 'catenaccio', secondaryFormation: '5-4-1' },
    { primaryStyle: 'long_balls', primaryFormation: '3-5-2', secondaryStyle: 'counter_attack', secondaryFormation: '4-4-2' },
    { primaryStyle: 'counter_attack', primaryFormation: '4-2-3-1', secondaryStyle: 'catenaccio', secondaryFormation: '5-3-2' },
    { primaryStyle: 'counter_attack', primaryFormation: '4-4-2', secondaryStyle: 'long_balls', secondaryFormation: '4-4-2' },
    { primaryStyle: 'gegenpressing', primaryFormation: '4-3-3', secondaryStyle: 'possession', secondaryFormation: '4-2-3-1' },
    { primaryStyle: 'gegenpressing', primaryFormation: '4-2-3-1', secondaryStyle: 'counter_attack', secondaryFormation: '4-3-3' },
    { primaryStyle: 'possession', primaryFormation: '4-3-3', secondaryStyle: 'gegenpressing', secondaryFormation: '3-4-2-1' },
    { primaryStyle: 'possession', primaryFormation: '4-2-3-1', secondaryStyle: 'possession', secondaryFormation: '4-3-3' },
    { primaryStyle: 'catenaccio', primaryFormation: '5-3-2', secondaryStyle: 'counter_attack', secondaryFormation: '4-4-2' },
    { primaryStyle: 'catenaccio', primaryFormation: '5-4-1', secondaryStyle: 'long_balls', secondaryFormation: '4-4-2' },
  ];

  const selectedArchetype = archetypes[absHash % archetypes.length];

  const upperCC = (countryCode || 'ENG').toUpperCase();
  const natCode = ['ENG', 'GB', 'UK'].includes(upperCC) ? 'ENG' : ['ESP', 'ES'].includes(upperCC) ? 'ESP' : ['FRA', 'FR'].includes(upperCC) ? 'FRA' : ['GER', 'DE', 'DEU'].includes(upperCC) ? 'GER' : ['ARG', 'AR'].includes(upperCC) ? 'ARG' : ['BRA', 'BR'].includes(upperCC) ? 'BRA' : 'ENG';

  const bank = COUNTRY_COACH_NAMES[natCode] || COUNTRY_COACH_NAMES.ENG;
  const firstName = bank.firstNames[absHash % bank.firstNames.length];
  const lastName = bank.lastNames[(absHash >> 3) % bank.lastNames.length];
  const generatedCoachName = `${firstName} ${lastName}`;

  const nationalityMap: Record<string, string> = {
    ENG: 'England',
    FRA: 'France',
    ESP: 'Spain',
    GER: 'Germany',
    ARG: 'Argentina',
    BRA: 'Brazil',
  };
  const nat = nationalityMap[natCode] || 'International';

  return {
    managerName: generatedCoachName,
    managerNationality: nat,
    primaryFormation: selectedArchetype.primaryFormation,
    primaryStyle: selectedArchetype.primaryStyle,
    secondaryFormation: selectedArchetype.secondaryFormation,
    secondaryStyle: selectedArchetype.secondaryStyle,
  };
}
