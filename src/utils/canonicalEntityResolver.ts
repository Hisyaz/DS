/**
 * CANONICAL ENTITY RESOLVER
 * Ensures 100% vocabulary consistency across all UI components, modals,
 * the Player & Club Editor, cards, popups, and translations.
 *
 * If a club, manager, stat, position, perk, or playstyle is edited or translated,
 * all parts of the game referencing it resolve to the same canonical representation.
 */

import { LanguageCode, getStoredLanguage } from './localizationSystem';

// =========================================================================
// 1. CANONICAL STAT NAMES & ABBREVIATIONS
// =========================================================================
export interface CanonicalStatInfo {
  key: string;
  name: Record<LanguageCode, string>;
  abbr: Record<LanguageCode, string>;
  category: 'PAC' | 'SHO' | 'PAS' | 'DRI' | 'DEF' | 'PHY' | 'GK';
}

export const CANONICAL_STATS: Record<string, CanonicalStatInfo> = {
  // Pace
  acceleration: {
    key: 'acceleration',
    name: { 'en-GB': 'Acceleration', 'es-ES': 'Aceleración', 'es-AR': 'Aceleración', 'pt-BR': 'Aceleração', 'fr-FR': 'Accélération' },
    abbr: { 'en-GB': 'ACC', 'es-ES': 'ACE', 'es-AR': 'ACE', 'pt-BR': 'ACE', 'fr-FR': 'ACC' },
    category: 'PAC',
  },
  sprintSpeed: {
    key: 'sprintSpeed',
    name: { 'en-GB': 'Sprint Speed', 'es-ES': 'Velocidad', 'es-AR': 'Velocidad Punta', 'pt-BR': 'Velocidade', 'fr-FR': 'Vitesse' },
    abbr: { 'en-GB': 'SPD', 'es-ES': 'VEL', 'es-AR': 'VEL', 'pt-BR': 'VEL', 'fr-FR': 'VIT' },
    category: 'PAC',
  },
  pace: {
    key: 'pace',
    name: { 'en-GB': 'Pace', 'es-ES': 'Ritmo', 'es-AR': 'Ritmo', 'pt-BR': 'Ritmo', 'fr-FR': 'Vitesse' },
    abbr: { 'en-GB': 'PAC', 'es-ES': 'RIT', 'es-AR': 'RIT', 'pt-BR': 'RIT', 'fr-FR': 'VIT' },
    category: 'PAC',
  },

  // Shooting
  finishing: {
    key: 'finishing',
    name: { 'en-GB': 'Finishing', 'es-ES': 'Definición', 'es-AR': 'Definición', 'pt-BR': 'Finalização', 'fr-FR': 'Finition' },
    abbr: { 'en-GB': 'FIN', 'es-ES': 'DEF', 'es-AR': 'DEF', 'pt-BR': 'FIN', 'fr-FR': 'FIN' },
    category: 'SHO',
  },
  shotPower: {
    key: 'shotPower',
    name: { 'en-GB': 'Shot Power', 'es-ES': 'Potencia de Tiro', 'es-AR': 'Potencia de Tiro', 'pt-BR': 'Força do Chute', 'fr-FR': 'Puissance Tir' },
    abbr: { 'en-GB': 'PWR', 'es-ES': 'POT', 'es-AR': 'POT', 'pt-BR': 'FOR', 'fr-FR': 'PUI' },
    category: 'SHO',
  },
  longShots: {
    key: 'longShots',
    name: { 'en-GB': 'Long Shots', 'es-ES': 'Tiros Lejanos', 'es-AR': 'Tiros Lejanos', 'pt-BR': 'Chutes de Longe', 'fr-FR': 'Tirs Lointains' },
    abbr: { 'en-GB': 'LGS', 'es-ES': 'LEJ', 'es-AR': 'LEJ', 'pt-BR': 'LON', 'fr-FR': 'LOI' },
    category: 'SHO',
  },
  volleys: {
    key: 'volleys',
    name: { 'en-GB': 'Volleys', 'es-ES': 'Voleas', 'es-AR': 'Voleas', 'pt-BR': 'Voleios', 'fr-FR': 'Volées' },
    abbr: { 'en-GB': 'VOL', 'es-ES': 'VOL', 'es-AR': 'VOL', 'pt-BR': 'VOL', 'fr-FR': 'VOL' },
    category: 'SHO',
  },
  penalties: {
    key: 'penalties',
    name: { 'en-GB': 'Penalties', 'es-ES': 'Penaltis', 'es-AR': 'Penales', 'pt-BR': 'Pênaltis', 'fr-FR': 'Penaltys' },
    abbr: { 'en-GB': 'PEN', 'es-ES': 'PEN', 'es-AR': 'PEN', 'pt-BR': 'PEN', 'fr-FR': 'PEN' },
    category: 'SHO',
  },
  positioning: {
    key: 'positioning',
    name: { 'en-GB': 'Positioning', 'es-ES': 'Posicionamiento', 'es-AR': 'Posicionamiento', 'pt-BR': 'Posicionamento', 'fr-FR': 'Placement' },
    abbr: { 'en-GB': 'POS', 'es-ES': 'POS', 'es-AR': 'POS', 'pt-BR': 'POS', 'fr-FR': 'PLA' },
    category: 'SHO',
  },
  shooting: {
    key: 'shooting',
    name: { 'en-GB': 'Shooting', 'es-ES': 'Tiro', 'es-AR': 'Remate', 'pt-BR': 'Finalização', 'fr-FR': 'Tir' },
    abbr: { 'en-GB': 'SHO', 'es-ES': 'TIR', 'es-AR': 'REM', 'pt-BR': 'FIN', 'fr-FR': 'TIR' },
    category: 'SHO',
  },

  // Passing
  vision: {
    key: 'vision',
    name: { 'en-GB': 'Vision', 'es-ES': 'Visión', 'es-AR': 'Visión', 'pt-BR': 'Visão', 'fr-FR': 'Vision' },
    abbr: { 'en-GB': 'VIS', 'es-ES': 'VIS', 'es-AR': 'VIS', 'pt-BR': 'VIS', 'fr-FR': 'VIS' },
    category: 'PAS',
  },
  crossing: {
    key: 'crossing',
    name: { 'en-GB': 'Crossing', 'es-ES': 'Centros', 'es-AR': 'Centros', 'pt-BR': 'Cruzamentos', 'fr-FR': 'Centres' },
    abbr: { 'en-GB': 'CRS', 'es-ES': 'CEN', 'es-AR': 'CEN', 'pt-BR': 'CRU', 'fr-FR': 'CEN' },
    category: 'PAS',
  },
  freeKick: {
    key: 'freeKick',
    name: { 'en-GB': 'Free Kick', 'es-ES': 'Tiros Libres', 'es-AR': 'Tiros Libres', 'pt-BR': 'Faltas', 'fr-FR': 'Coups Francs' },
    abbr: { 'en-GB': 'FK', 'es-ES': 'TL', 'es-AR': 'TL', 'pt-BR': 'FLT', 'fr-FR': 'CF' },
    category: 'PAS',
  },
  shortPassing: {
    key: 'shortPassing',
    name: { 'en-GB': 'Short Passing', 'es-ES': 'Pase Corto', 'es-AR': 'Pase Corto', 'pt-BR': 'Passe Curto', 'fr-FR': 'Passes Courtes' },
    abbr: { 'en-GB': 'SPA', 'es-ES': 'PCO', 'es-AR': 'PCO', 'pt-BR': 'PCU', 'fr-FR': 'PCO' },
    category: 'PAS',
  },
  longPassing: {
    key: 'longPassing',
    name: { 'en-GB': 'Long Passing', 'es-ES': 'Pase Largo', 'es-AR': 'Pase Largo', 'pt-BR': 'Passe Longo', 'fr-FR': 'Passes Longues' },
    abbr: { 'en-GB': 'LPA', 'es-ES': 'PLA', 'es-AR': 'PLA', 'pt-BR': 'PLO', 'fr-FR': 'PLO' },
    category: 'PAS',
  },
  curve: {
    key: 'curve',
    name: { 'en-GB': 'Curve', 'es-ES': 'Efecto', 'es-AR': 'Efecto / Rosca', 'pt-BR': 'Curva', 'fr-FR': 'Effet' },
    abbr: { 'en-GB': 'CRV', 'es-ES': 'EFE', 'es-AR': 'EFE', 'pt-BR': 'CUR', 'fr-FR': 'EFF' },
    category: 'PAS',
  },
  passing: {
    key: 'passing',
    name: { 'en-GB': 'Passing', 'es-ES': 'Pase', 'es-AR': 'Pase', 'pt-BR': 'Passe', 'fr-FR': 'Passe' },
    abbr: { 'en-GB': 'PAS', 'es-ES': 'PAS', 'es-AR': 'PAS', 'pt-BR': 'PAS', 'fr-FR': 'PAS' },
    category: 'PAS',
  },

  // Dribbling
  agility: {
    key: 'agility',
    name: { 'en-GB': 'Agility', 'es-ES': 'Agilidad', 'es-AR': 'Agilidad', 'pt-BR': 'Agilidade', 'fr-FR': 'Agilité' },
    abbr: { 'en-GB': 'AGI', 'es-ES': 'AGI', 'es-AR': 'AGI', 'pt-BR': 'AGI', 'fr-FR': 'AGI' },
    category: 'DRI',
  },
  balance: {
    key: 'balance',
    name: { 'en-GB': 'Balance', 'es-ES': 'Equilibrio', 'es-AR': 'Equilibrio', 'pt-BR': 'Equilíbrio', 'fr-FR': 'Équilibre' },
    abbr: { 'en-GB': 'BAL', 'es-ES': 'EQU', 'es-AR': 'EQU', 'pt-BR': 'EQU', 'fr-FR': 'EQU' },
    category: 'DRI',
  },
  reactions: {
    key: 'reactions',
    name: { 'en-GB': 'Reactions', 'es-ES': 'Reacción', 'es-AR': 'Reacciones', 'pt-BR': 'Reatividade', 'fr-FR': 'Réactivité' },
    abbr: { 'en-GB': 'REA', 'es-ES': 'REA', 'es-AR': 'REA', 'pt-BR': 'REA', 'fr-FR': 'REA' },
    category: 'DRI',
  },
  ballControl: {
    key: 'ballControl',
    name: { 'en-GB': 'Ball Control', 'es-ES': 'Control del Balón', 'es-AR': 'Control de Pelota', 'pt-BR': 'Controle de Bola', 'fr-FR': 'Contrôle' },
    abbr: { 'en-GB': 'BCL', 'es-ES': 'CTR', 'es-AR': 'CTR', 'pt-BR': 'CTR', 'fr-FR': 'CTR' },
    category: 'DRI',
  },
  dribbling: {
    key: 'dribbling',
    name: { 'en-GB': 'Dribbling', 'es-ES': 'Regate', 'es-AR': 'Gambeta / Drible', 'pt-BR': 'Drible', 'fr-FR': 'Dribble' },
    abbr: { 'en-GB': 'DRI', 'es-ES': 'REG', 'es-AR': 'GAM', 'pt-BR': 'DRI', 'fr-FR': 'DRI' },
    category: 'DRI',
  },
  composure: {
    key: 'composure',
    name: { 'en-GB': 'Composure', 'es-ES': 'Compostura', 'es-AR': 'Serenidad / Frialdad', 'pt-BR': 'Frieza', 'fr-FR': 'Calme' },
    abbr: { 'en-GB': 'COM', 'es-ES': 'CMP', 'es-AR': 'SER', 'pt-BR': 'FRI', 'fr-FR': 'CAL' },
    category: 'DRI',
  },

  // Defending
  interceptions: {
    key: 'interceptions',
    name: { 'en-GB': 'Interceptions', 'es-ES': 'Intercepciones', 'es-AR': 'Intercepciones', 'pt-BR': 'Interceptações', 'fr-FR': 'Interceptions' },
    abbr: { 'en-GB': 'INT', 'es-ES': 'INT', 'es-AR': 'INT', 'pt-BR': 'INT', 'fr-FR': 'INT' },
    category: 'DEF',
  },
  headingAccuracy: {
    key: 'headingAccuracy',
    name: { 'en-GB': 'Heading Accuracy', 'es-ES': 'Precisión de Cabeza', 'es-AR': 'Cabezazo', 'pt-BR': 'Cabeceio', 'fr-FR': 'Précision Tête' },
    abbr: { 'en-GB': 'HEA', 'es-ES': 'CAB', 'es-AR': 'CAB', 'pt-BR': 'CAB', 'fr-FR': 'TET' },
    category: 'DEF',
  },
  defensiveAwareness: {
    key: 'defensiveAwareness',
    name: { 'en-GB': 'Defensive Awareness', 'es-ES': 'Conciencia Defensiva', 'es-AR': 'Atención Defensiva', 'pt-BR': 'Noção Defensiva', 'fr-FR': 'Conscience Déf.' },
    abbr: { 'en-GB': 'DEF_A', 'es-ES': 'C_DEF', 'es-AR': 'A_DEF', 'pt-BR': 'N_DEF', 'fr-FR': 'C_DEF' },
    category: 'DEF',
  },
  standingTackle: {
    key: 'standingTackle',
    name: { 'en-GB': 'Standing Tackle', 'es-ES': 'Entrada Limpia', 'es-AR': 'Entrada / Quite', 'pt-BR': 'Dividida em Pé', 'fr-FR': 'Tacle Debout' },
    abbr: { 'en-GB': 'STA', 'es-ES': 'ENT', 'es-AR': 'QUI', 'pt-BR': 'DIV', 'fr-FR': 'TAC' },
    category: 'DEF',
  },
  slidingTackle: {
    key: 'slidingTackle',
    name: { 'en-GB': 'Sliding Tackle', 'es-ES': 'Entrada Agresiva', 'es-AR': 'Barrida / Quite Deslizante', 'pt-BR': 'Carrinho', 'fr-FR': 'Tacle Glissé' },
    abbr: { 'en-GB': 'SLI', 'es-ES': 'BAR', 'es-AR': 'BAR', 'pt-BR': 'CAR', 'fr-FR': 'GLI' },
    category: 'DEF',
  },
  defending: {
    key: 'defending',
    name: { 'en-GB': 'Defending', 'es-ES': 'Defensa', 'es-AR': 'Defensa', 'pt-BR': 'Defesa', 'fr-FR': 'Défense' },
    abbr: { 'en-GB': 'DEF', 'es-ES': 'DEF', 'es-AR': 'DEF', 'pt-BR': 'DEF', 'fr-FR': 'DEF' },
    category: 'DEF',
  },

  // Physical
  jumping: {
    key: 'jumping',
    name: { 'en-GB': 'Jumping', 'es-ES': 'Salto', 'es-AR': 'Salto', 'pt-BR': 'Impulsão', 'fr-FR': 'Détente' },
    abbr: { 'en-GB': 'JMP', 'es-ES': 'SAL', 'es-AR': 'SAL', 'pt-BR': 'IMP', 'fr-FR': 'DET' },
    category: 'PHY',
  },
  stamina: {
    key: 'stamina',
    name: { 'en-GB': 'Stamina', 'es-ES': 'Resistencia', 'es-AR': 'Resistencia', 'pt-BR': 'Fôlego', 'fr-FR': 'Endurance' },
    abbr: { 'en-GB': 'STA', 'es-ES': 'RES', 'es-AR': 'RES', 'pt-BR': 'FOL', 'fr-FR': 'END' },
    category: 'PHY',
  },
  strength: {
    key: 'strength',
    name: { 'en-GB': 'Strength', 'es-ES': 'Fuerza', 'es-AR': 'Fuerza Física', 'pt-BR': 'Força', 'fr-FR': 'Force' },
    abbr: { 'en-GB': 'STR', 'es-ES': 'FUE', 'es-AR': 'FUE', 'pt-BR': 'FOR', 'fr-FR': 'FOR' },
    category: 'PHY',
  },
  aggression: {
    key: 'aggression',
    name: { 'en-GB': 'Aggression', 'es-ES': 'Agresividad', 'es-AR': 'Garra / Agresividad', 'pt-BR': 'Agressividade', 'fr-FR': 'Agressivité' },
    abbr: { 'en-GB': 'AGG', 'es-ES': 'AGR', 'es-AR': 'GAR', 'pt-BR': 'AGR', 'fr-FR': 'AGR' },
    category: 'PHY',
  },
  physical: {
    key: 'physical',
    name: { 'en-GB': 'Physical', 'es-ES': 'Físico', 'es-AR': 'Físico', 'pt-BR': 'Físico', 'fr-FR': 'Physique' },
    abbr: { 'en-GB': 'PHY', 'es-ES': 'FIS', 'es-AR': 'FIS', 'pt-BR': 'FIS', 'fr-FR': 'PHY' },
    category: 'PHY',
  },

  // Goalkeeper
  gkDiving: {
    key: 'gkDiving',
    name: { 'en-GB': 'GK Diving', 'es-ES': 'Estirada', 'es-AR': 'Atajada / Vuelo', 'pt-BR': 'Salto do Goleiro', 'fr-FR': 'Plongeon' },
    abbr: { 'en-GB': 'DIV', 'es-ES': 'EST', 'es-AR': 'ATA', 'pt-BR': 'SLT', 'fr-FR': 'PLO' },
    category: 'GK',
  },
  gkHandling: {
    key: 'gkHandling',
    name: { 'en-GB': 'GK Handling', 'es-ES': 'Paradas', 'es-AR': 'Manejo / Bloqueo', 'pt-BR': 'Segurança', 'fr-FR': 'Prise de Balle' },
    abbr: { 'en-GB': 'HAN', 'es-ES': 'PAR', 'es-AR': 'MAN', 'pt-BR': 'SEG', 'fr-FR': 'PRI' },
    category: 'GK',
  },
  gkKicking: {
    key: 'gkKicking',
    name: { 'en-GB': 'GK Kicking', 'es-ES': 'Saque', 'es-AR': 'Saque de Arco', 'pt-BR': 'Chute do Goleiro', 'fr-FR': 'Dégagement' },
    abbr: { 'en-GB': 'KIC', 'es-ES': 'SAQ', 'es-AR': 'SAQ', 'pt-BR': 'CHU', 'fr-FR': 'DEG' },
    category: 'GK',
  },
  gkPositioning: {
    key: 'gkPositioning',
    name: { 'en-GB': 'GK Positioning', 'es-ES': 'Colocación', 'es-AR': 'Ubicación bajo los tres palos', 'pt-BR': 'Posicionamento Goleiro', 'fr-FR': 'Placement Gardien' },
    abbr: { 'en-GB': 'POS', 'es-ES': 'COL', 'es-AR': 'UBI', 'pt-BR': 'POS', 'fr-FR': 'PLA' },
    category: 'GK',
  },
  gkReflexes: {
    key: 'gkReflexes',
    name: { 'en-GB': 'GK Reflexes', 'es-ES': 'Reflejos', 'es-AR': 'Reflejos', 'pt-BR': 'Reflexos', 'fr-FR': 'Réflexes' },
    abbr: { 'en-GB': 'REF', 'es-ES': 'REF', 'es-AR': 'REF', 'pt-BR': 'REF', 'fr-FR': 'REF' },
    category: 'GK',
  },
};

// =========================================================================
// 2. CANONICAL POSITIONS & SUB-POSITIONS
// =========================================================================
export interface CanonicalPositionInfo {
  code: string;
  name: Record<LanguageCode, string>;
  group: 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper';
}

export const CANONICAL_POSITIONS: Record<string, CanonicalPositionInfo> = {
  ST: { code: 'ST', name: { 'en-GB': 'Striker', 'es-ES': 'Delantero Centro', 'es-AR': 'Centrodelantero (9)', 'pt-BR': 'Centroavante', 'fr-FR': 'Buteur' }, group: 'Forward' },
  CF: { code: 'CF', name: { 'en-GB': 'Centre Forward', 'es-ES': 'Segundo Delantero', 'es-AR': 'Segundo Delantero', 'pt-BR': 'Segundo Atacante', 'fr-FR': 'Avant-Centre' }, group: 'Forward' },
  LW: { code: 'LW', name: { 'en-GB': 'Left Winger', 'es-ES': 'Extremo Izquierdo', 'es-AR': 'Extremo Izquierdo (11)', 'pt-BR': 'Ponta Esquerda', 'fr-FR': 'Ailier Gauche' }, group: 'Forward' },
  RW: { code: 'RW', name: { 'en-GB': 'Right Winger', 'es-ES': 'Extremo Derecho', 'es-AR': 'Extremo Derecho (7)', 'pt-BR': 'Ponta Direita', 'fr-FR': 'Ailier Droit' }, group: 'Forward' },
  CAM: { code: 'CAM', name: { 'en-GB': 'Attacking Midfielder', 'es-ES': 'Mediapunta', 'es-AR': 'Enganche / Diez (10)', 'pt-BR': 'Meia Atacante', 'fr-FR': 'Milieu Offensif' }, group: 'Midfielder' },
  CM: { code: 'CM', name: { 'en-GB': 'Central Midfielder', 'es-ES': 'Mediocentro', 'es-AR': 'Volante Central (8)', 'pt-BR': 'Meio-Campista', 'fr-FR': 'Milieu Central' }, group: 'Midfielder' },
  CDM: { code: 'CDM', name: { 'en-GB': 'Defensive Midfielder', 'es-ES': 'Pivote Defensivo', 'es-AR': 'Volante de Marca / Cinco (5)', 'pt-BR': 'Volante', 'fr-FR': 'Milieu Défensif' }, group: 'Midfielder' },
  LM: { code: 'LM', name: { 'en-GB': 'Left Midfielder', 'es-ES': 'Interior Izquierdo', 'es-AR': 'Volante por Izquierda', 'pt-BR': 'Meia Esquerda', 'fr-FR': 'Milieu Gauche' }, group: 'Midfielder' },
  RM: { code: 'RM', name: { 'en-GB': 'Right Midfielder', 'es-ES': 'Interior Derecho', 'es-AR': 'Volante por Derecha', 'pt-BR': 'Meia Direita', 'fr-FR': 'Milieu Droit' }, group: 'Midfielder' },
  CB: { code: 'CB', name: { 'en-GB': 'Centre Back', 'es-ES': 'Defensa Central', 'es-AR': 'Primer / Segundo Central (2/6)', 'pt-BR': 'Zagueiro', 'fr-FR': 'Défenseur Central' }, group: 'Defender' },
  LB: { code: 'LB', name: { 'en-GB': 'Left Back', 'es-ES': 'Lateral Izquierdo', 'es-AR': 'Lateral Izquierdo (3)', 'pt-BR': 'Lateral Esquerdo', 'fr-FR': 'Latéral Gauche' }, group: 'Defender' },
  RB: { code: 'RB', name: { 'en-GB': 'Right Back', 'es-ES': 'Lateral Derecho', 'es-AR': 'Lateral Derecho (4)', 'pt-BR': 'Lateral Direito', 'fr-FR': 'Latéral Droit' }, group: 'Defender' },
  GK: { code: 'GK', name: { 'en-GB': 'Goalkeeper', 'es-ES': 'Portero', 'es-AR': 'Arquero (1)', 'pt-BR': 'Goleiro', 'fr-FR': 'Gardien' }, group: 'Goalkeeper' },
};

// =========================================================================
// 3. CANONICAL PERKS & PLAYSTYLES
// =========================================================================
export const CANONICAL_PLAYSTYLES: Record<string, Record<LanguageCode, string>> = {
  'Poacher': { 'en-GB': 'Poacher', 'es-ES': 'Cazagoles', 'es-AR': 'Goleador de Área', 'pt-BR': 'Oportunista', 'fr-FR': 'Renard des Surfaces' },
  'Target Forward': { 'en-GB': 'Target Forward', 'es-ES': 'Delantero Tanque', 'es-AR': 'Delantero de Referencia', 'pt-BR': 'Homem de Área', 'fr-FR': 'Pivot Attaquant' },
  'Speed Merchant': { 'en-GB': 'Speed Merchant', 'es-ES': 'Velocista', 'es-AR': 'Bala / Velocista', 'pt-BR': 'Velocista Nato', 'fr-FR': 'Flèche' },
  'Dribble Magician': { 'en-GB': 'Dribble Magician', 'es-ES': 'Mago del Regate', 'es-AR': 'Gambeteador Mágico', 'pt-BR': 'Mágico do Drible', 'fr-FR': 'Magicien du Dribble' },
  'Free Kick Specialist': { 'en-GB': 'Free Kick Specialist', 'es-ES': 'Especialista a Balón Parado', 'es-AR': 'Especialista en Tiros Libres', 'pt-BR': 'Especialista em Faltas', 'fr-FR': 'Tireur d\'Élite' },
  'Long Shot Demon': { 'en-GB': 'Long Shot Demon', 'es-ES': 'Cañonero Lejano', 'es-AR': 'Cañonero de Afuera', 'pt-BR': 'Chute Canhão', 'fr-FR': 'Frappe Lointaine' },
  'Deep Lying Playmaker': { 'en-GB': 'Deep Lying Playmaker', 'es-ES': 'Organizador Retrasado', 'es-AR': 'Cinco de Juego / Distribuidor', 'pt-BR': 'Armador Recuado', 'fr-FR': 'Meneur Reculé' },
  'Box to Box Engine': { 'en-GB': 'Box to Box Engine', 'es-ES': 'Todocampista Incansable', 'es-AR': 'Motor Box-to-Box', 'pt-BR': 'Meia Motorzinho', 'fr-FR': 'Infatigable Box-to-Box' },
  'Ball Winning Enforcer': { 'en-GB': 'Ball Winning Enforcer', 'es-ES': 'Recuperador Implacable', 'es-AR': 'Patrón del Medio', 'pt-BR': 'Cão de Guarda', 'fr-FR': 'Récupérateur d\'Élite' },
  'Aerial Threat': { 'en-GB': 'Aerial Threat', 'es-ES': 'Amenaza Aérea', 'es-AR': 'Dominador Aéreo', 'pt-BR': 'Ameaça Aérea', 'fr-FR': 'Menace Aérienne' },
  'Brick Wall Stopper': { 'en-GB': 'Brick Wall Stopper', 'es-ES': 'Muro Infranqueable', 'es-AR': 'Muro de Contención', 'pt-BR': 'Paredão', 'fr-FR': 'Mur Infranchissable' },
  'Sweeper Keeper': { 'en-GB': 'Sweeper Keeper', 'es-ES': 'Portero Líbero', 'es-AR': 'Arquero Líbero', 'pt-BR': 'Goleiro Líbero', 'fr-FR': 'Gardien Libéro' },
  'Reflex Shot Stopper': { 'en-GB': 'Reflex Shot Stopper', 'es-ES': 'Paradas Felinas', 'es-AR': 'Atajador de Reflejos', 'pt-BR': 'Muralha de Reflexos', 'fr-FR': 'Génie des Réflexes' },
  'In The Shadow Of': { 'en-GB': 'In The Shadow Of', 'es-ES': 'Bajo la Sombra de...', 'es-AR': 'Bajo la Sombra Familiar', 'pt-BR': 'Sob a Sombra de...', 'fr-FR': 'Dans l\'Ombre de...' },
  'Ask Parents for Advice': { 'en-GB': 'Ask Parents for Advice', 'es-ES': 'Consejo de los Padres', 'es-AR': 'Pedir Consejo a los Viejos', 'pt-BR': 'Conselho dos Pais', 'fr-FR': 'Conseil des Parents' },
  'Born in the Shadows': { 'en-GB': 'Born in the Shadows', 'es-ES': 'Nacido en las Sombras', 'es-AR': 'Forjado en el Potrero', 'pt-BR': 'Forjado nas Sombras', 'fr-FR': 'Né dans l\'Ombre' },
  'Pressure Cooker': { 'en-GB': 'Pressure Cooker', 'es-ES': 'Olla a Presión', 'es-AR': 'Bajo Presión Extrema', 'pt-BR': 'Panela de Pressão', 'fr-FR': 'Cocotte-Minute' },
  'Silver Spoon Syndrome': { 'en-GB': 'Silver Spoon Syndrome', 'es-ES': 'Cuna de Oro', 'es-AR': 'Cuna de Oro / Mimado', 'pt-BR': 'Berço de Ouro', 'fr-FR': 'Cuillère d\'Argent' },
  'Cultural Chameleon': { 'en-GB': 'Cultural Chameleon', 'es-ES': 'Camaleón Cultural', 'es-AR': 'Adaptación Inmediata', 'pt-BR': 'Camaleão Cultural', 'fr-FR': 'Caméléon Culturel' },
};

// =========================================================================
// 4. CANONICAL TROPHIES & REWARDS
// =========================================================================
export const CANONICAL_TROPHIES: Record<string, Record<LanguageCode, string>> = {
  'Ballon d\'Or': { 'en-GB': 'Ballon d\'Or', 'es-ES': 'Balón de Oro', 'es-AR': 'Balón de Oro', 'pt-BR': 'Bola de Ouro', 'fr-FR': 'Ballon d\'Or' },
  'Golden Boot': { 'en-GB': 'Golden Boot', 'es-ES': 'Bota de Oro', 'es-AR': 'Bota de Oro / Pichichi', 'pt-BR': 'Chuteira de Ouro', 'fr-FR': 'Soulier d\'Or' },
  'Golden Glove': { 'en-GB': 'Golden Glove', 'es-ES': 'Guante de Oro', 'es-AR': 'Guante de Oro', 'pt-BR': 'Luva de Ouro', 'fr-FR': 'Gant d\'Or' },
  'Golden Boy': { 'en-GB': 'Golden Boy Award', 'es-ES': 'Premio Golden Boy', 'es-AR': 'Premio Golden Boy', 'pt-BR': 'Prêmio Golden Boy', 'fr-FR': 'Trophée Golden Boy' },
  'Playmaker Award': { 'en-GB': 'Playmaker Award', 'es-ES': 'Máximo Asistente', 'es-AR': 'Líder en Asistencias', 'pt-BR': 'Líder de Assistências', 'fr-FR': 'Meilleur Passeur' },
  'Player of the Season': { 'en-GB': 'Player of the Season', 'es-ES': 'Jugador de la Temporada', 'es-AR': 'Mejor Jugador de la Temporada', 'pt-BR': 'Melhor Jogador da Temporada', 'fr-FR': 'Joueur de la Saison' },
  'League Title': { 'en-GB': 'League Title', 'es-ES': 'Título de Liga', 'es-AR': 'Campeonato de Liga', 'pt-BR': 'Campeonato da Liga', 'fr-FR': 'Titre de Champion' },
  'Domestic Cup': { 'en-GB': 'Domestic Cup', 'es-ES': 'Copa Nacional', 'es-AR': 'Copa Nacional', 'pt-BR': 'Copa Nacional', 'fr-FR': 'Coupe Nationale' },
  'Continental Champions Cup': { 'en-GB': 'Continental Champions Cup', 'es-ES': 'Copa Continental de Campeones', 'es-AR': 'Copa Continental de Campeones', 'pt-BR': 'Copa dos Campeões Continental', 'fr-FR': 'Ligue des Champions Continentale' },
  'World Cup': { 'en-GB': 'World Championship', 'es-ES': 'Copa Mundial', 'es-AR': 'Copa del Mundo', 'pt-BR': 'Copa do Mundo', 'fr-FR': 'Coupe du Monde' },
  'Nations League': { 'en-GB': 'Nations League', 'es-ES': 'Liga de Naciones', 'es-AR': 'Liga de las Naciones', 'pt-BR': 'Liga das Nações', 'fr-FR': 'Ligue des Nations' },
  'Continental Championship': { 'en-GB': 'Continental Championship', 'es-ES': 'Eurocopa / Copa América', 'es-AR': 'Copa América / Eurocopa', 'pt-BR': 'Copa América / Eurocopa', 'fr-FR': 'Championnat Continental' },
};

// =========================================================================
// 5. RESOLVER HELPER FUNCTIONS
// =========================================================================

/**
 * Returns canonical localized name for any stat attribute
 */
export function getCanonicalStatName(statKey: string, lang: LanguageCode = getStoredLanguage()): string {
  if (!statKey) return '';
  const normalized = statKey.trim();
  // Lookup in canonical
  const lower = normalized.toLowerCase();
  for (const [key, info] of Object.entries(CANONICAL_STATS)) {
    if (key.toLowerCase() === lower || info.name['en-GB'].toLowerCase() === lower) {
      return info.name[lang] || info.name['es-ES'] || info.name['en-GB'];
    }
  }
  return normalized;
}

/**
 * Returns canonical localized abbreviation for any stat attribute (e.g. FIN, PAC, VOL)
 */
export function getCanonicalStatAbbr(statKey: string, lang: LanguageCode = getStoredLanguage()): string {
  if (!statKey) return '';
  const lower = statKey.trim().toLowerCase();
  for (const [key, info] of Object.entries(CANONICAL_STATS)) {
    if (key.toLowerCase() === lower || info.name['en-GB'].toLowerCase() === lower) {
      return info.abbr[lang] || info.abbr['es-ES'] || info.abbr['en-GB'];
    }
  }
  return statKey.slice(0, 3).toUpperCase();
}

/**
 * Returns canonical localized position label (e.g. ST -> Delantero Centro / Centrodelantero)
 */
export function getCanonicalPositionName(posCode: string, lang: LanguageCode = getStoredLanguage()): string {
  if (!posCode) return '';
  const upper = posCode.trim().toUpperCase();
  const found = CANONICAL_POSITIONS[upper];
  if (found) {
    return found.name[lang] || found.name['es-ES'] || found.name['en-GB'];
  }
  return posCode;
}

/**
 * Returns canonical localized playstyle or perk title
 */
export function getCanonicalPlaystyleName(styleName: string, lang: LanguageCode = getStoredLanguage()): string {
  if (!styleName) return '';
  const trimmed = styleName.trim();
  const lower = trimmed.toLowerCase();
  for (const [key, transMap] of Object.entries(CANONICAL_PLAYSTYLES)) {
    if (key.toLowerCase() === lower) {
      return transMap[lang] || transMap['es-ES'] || transMap['en-GB'];
    }
  }
  return trimmed;
}

/**
 * Returns canonical localized trophy name
 */
export function getCanonicalTrophyName(trophyName: string, lang: LanguageCode = getStoredLanguage()): string {
  if (!trophyName) return '';
  const trimmed = trophyName.trim();
  const lower = trimmed.toLowerCase();
  for (const [key, transMap] of Object.entries(CANONICAL_TROPHIES)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase())) {
      return transMap[lang] || transMap['es-ES'] || transMap['en-GB'];
    }
  }
  return trimmed;
}

/**
 * Custom Club & Manager In-Memory / LocalStorage Bindings
 * Allows users to rename clubs or managers in the Editor and have them
 * seamlessly bound and updated across every table, card, and modal!
 */
const STORAGE_CUSTOM_CLUBS = 'drawstar_canonical_clubs_v1';
const STORAGE_CUSTOM_MANAGERS = 'drawstar_canonical_managers_v1';

export function getCanonicalClubName(clubNameOrId: string): string {
  if (!clubNameOrId) return '';
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_CLUBS);
    if (raw) {
      const overrides = JSON.parse(raw);
      if (overrides[clubNameOrId]) return overrides[clubNameOrId];
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return clubNameOrId;
}

export function setCanonicalClubNameOverride(originalName: string, newName: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_CLUBS);
    const overrides = raw ? JSON.parse(raw) : {};
    overrides[originalName] = newName;
    localStorage.setItem(STORAGE_CUSTOM_CLUBS, JSON.stringify(overrides));
  } catch (e) {
    // Ignore storage write errors
  }
}

export function getCanonicalManagerName(managerNameOrId: string): string {
  if (!managerNameOrId) return '';
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_MANAGERS);
    if (raw) {
      const overrides = JSON.parse(raw);
      if (overrides[managerNameOrId]) return overrides[managerNameOrId];
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return managerNameOrId;
}

export function setCanonicalManagerNameOverride(originalName: string, newName: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_MANAGERS);
    const overrides = raw ? JSON.parse(raw) : {};
    overrides[originalName] = newName;
    localStorage.setItem(STORAGE_CUSTOM_MANAGERS, JSON.stringify(overrides));
  } catch (e) {
    // Ignore storage write errors
  }
}

/**
 * Convenient alias methods for Translation Inspector and entity verification
 */
export function getCanonicalPosition(posCode: string, lang: LanguageCode = getStoredLanguage()): string {
  return getCanonicalPositionName(posCode, lang);
}

export function getCanonicalStat(statKey: string, lang: LanguageCode = getStoredLanguage()): string {
  return getCanonicalStatName(statKey, lang);
}

export function getCanonicalPerk(perkNameOrId: string, lang: LanguageCode = getStoredLanguage()): string {
  return getCanonicalPlaystyleName(perkNameOrId, lang);
}

