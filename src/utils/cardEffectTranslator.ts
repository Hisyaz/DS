import { LanguageCode, getStoredLanguage } from './localizationSystem';
import { getActiveLanguagePacket, isLanguagePacketLoaded } from './languagePacketSystem';

/**
 * COMPREHENSIVE CARD EFFECT TRANSLATIONS DICTIONARY
 * Supports English (en-GB) and Argentinean Spanish (es-AR), with automatic
 * pattern-based fallback for dynamic stat boosts and modifiers.
 */

// Common stat translations
export const STAT_NAME_TRANSLATIONS: Record<string, { 'en-GB': string; 'es-AR': string }> = {
  'shooting': { 'en-GB': 'Shooting', 'es-AR': 'Remate' },
  'finishing': { 'en-GB': 'Finishing', 'es-AR': 'Definición' },
  'longshots': { 'en-GB': 'Long Shots', 'es-AR': 'Tiros Lejanos' },
  'long shots': { 'en-GB': 'Long Shots', 'es-AR': 'Tiros Lejanos' },
  'volleys': { 'en-GB': 'Volleys', 'es-AR': 'Voleas' },
  'penalties': { 'en-GB': 'Penalties', 'es-AR': 'Penales' },
  'penalty': { 'en-GB': 'Penalties', 'es-AR': 'Penales' },
  'positioning': { 'en-GB': 'Positioning', 'es-AR': 'Posicionamiento' },
  'position': { 'en-GB': 'Positioning', 'es-AR': 'Posicionamiento' },
  'vision': { 'en-GB': 'Vision', 'es-AR': 'Visión' },
  'crossing': { 'en-GB': 'Crossing', 'es-AR': 'Centros' },
  'freekick': { 'en-GB': 'Free Kick', 'es-AR': 'Tiro Libre' },
  'free kick': { 'en-GB': 'Free Kick', 'es-AR': 'Tiro Libre' },
  'shortpass': { 'en-GB': 'Short Pass', 'es-AR': 'Pase Corto' },
  'short pass': { 'en-GB': 'Short Pass', 'es-AR': 'Pase Corto' },
  'longpass': { 'en-GB': 'Long Pass', 'es-AR': 'Pase Largo' },
  'long pass': { 'en-GB': 'Long Pass', 'es-AR': 'Pase Largo' },
  'curve': { 'en-GB': 'Curve', 'es-AR': 'Efecto' },
  'agility': { 'en-GB': 'Agility', 'es-AR': 'Agilidad' },
  'balance': { 'en-GB': 'Balance', 'es-AR': 'Equilibrio' },
  'reactions': { 'en-GB': 'Reactions', 'es-AR': 'Reacciones' },
  'reaction': { 'en-GB': 'Reactions', 'es-AR': 'Reacciones' },
  'ballcontrol': { 'en-GB': 'Ball Control', 'es-AR': 'Control de Balón' },
  'ball control': { 'en-GB': 'Ball Control', 'es-AR': 'Control de Balón' },
  'dribbling': { 'en-GB': 'Dribbling', 'es-AR': 'Gambeta' },
  'composure': { 'en-GB': 'Composure', 'es-AR': 'Serenidad' },
  'interceptions': { 'en-GB': 'Interceptions', 'es-AR': 'Intercepciones' },
  'heading': { 'en-GB': 'Heading', 'es-AR': 'Cabezazo' },
  'defensiveawareness': { 'en-GB': 'Defensive Awareness', 'es-AR': 'Conciencia Defensiva' },
  'defensive awareness': { 'en-GB': 'Defensive Awareness', 'es-AR': 'Conciencia Defensiva' },
  'marking': { 'en-GB': 'Marking', 'es-AR': 'Marca' },
  'tackling': { 'en-GB': 'Tackling', 'es-AR': 'Entradas' },
  'standingtackle': { 'en-GB': 'Standing Tackle', 'es-AR': 'Entrada Limpia' },
  'standing tackle': { 'en-GB': 'Standing Tackle', 'es-AR': 'Entrada Limpia' },
  'slidingtackle': { 'en-GB': 'Sliding Tackle', 'es-AR': 'Barrida' },
  'sliding tackle': { 'en-GB': 'Sliding Tackle', 'es-AR': 'Barrida' },
  'acceleration': { 'en-GB': 'Acceleration', 'es-AR': 'Aceleración' },
  'sprintspeed': { 'en-GB': 'Sprint Speed', 'es-AR': 'Velocidad' },
  'sprint speed': { 'en-GB': 'Sprint Speed', 'es-AR': 'Velocidad' },
  'pace': { 'en-GB': 'Pace', 'es-AR': 'Ritmo' },
  'jumping': { 'en-GB': 'Jumping', 'es-AR': 'Salto' },
  'stamina': { 'en-GB': 'Stamina', 'es-AR': 'Resistencia' },
  'strength': { 'en-GB': 'Strength', 'es-AR': 'Fuerza' },
  'aggression': { 'en-GB': 'Aggression', 'es-AR': 'Agresividad' },
  'retention': { 'en-GB': 'Retention', 'es-AR': 'Retención' },
  'gkdiving': { 'en-GB': 'GK Diving', 'es-AR': 'Atajada (ARQ)' },
  'gk diving': { 'en-GB': 'GK Diving', 'es-AR': 'Atajada (ARQ)' },
  'gkhandling': { 'en-GB': 'GK Handling', 'es-AR': 'Manejo (ARQ)' },
  'gk handling': { 'en-GB': 'GK Handling', 'es-AR': 'Manejo (ARQ)' },
  'gkkicking': { 'en-GB': 'GK Kicking', 'es-AR': 'Saque (ARQ)' },
  'gk kicking': { 'en-GB': 'GK Kicking', 'es-AR': 'Saque (ARQ)' },
  'gkpositioning': { 'en-GB': 'GK Positioning', 'es-AR': 'Colocación (ARQ)' },
  'gk positioning': { 'en-GB': 'GK Positioning', 'es-AR': 'Colocación (ARQ)' },
  'gkreflexes': { 'en-GB': 'GK Reflexes', 'es-AR': 'Reflejos (ARQ)' },
  'gk reflexes': { 'en-GB': 'GK Reflexes', 'es-AR': 'Reflejos (ARQ)' },
  'fame': { 'en-GB': 'Fame', 'es-AR': 'Fama' },
  'chemistry': { 'en-GB': 'Chemistry', 'es-AR': 'Química' },
  'team chemistry': { 'en-GB': 'Team Chemistry', 'es-AR': 'Química del Equipo' },
  'money': { 'en-GB': 'Money', 'es-AR': 'Dinero' },
  'bad reputation': { 'en-GB': 'Bad Reputation', 'es-AR': 'Mala Fama' },
  'potential': { 'en-GB': 'Potential', 'es-AR': 'Potencial' },
  'potential ovr': { 'en-GB': 'Potential OVR', 'es-AR': 'Media Potencial (POT)' },
  'injury risk': { 'en-GB': 'Injury Risk', 'es-AR': 'Riesgo de Lesión' },
  'injury risk factor': { 'en-GB': 'Injury Risk Factor', 'es-AR': 'Factor de Riesgo de Lesión' },
  'weak foot': { 'en-GB': 'Weak Foot', 'es-AR': 'Pie Débil' },
  'free stat points': { 'en-GB': 'Free Stat Points', 'es-AR': 'Puntos de Atributo Libres' },
  'free development stat points': { 'en-GB': 'Free Development Stat Points', 'es-AR': 'Puntos de Desarrollo Libres' },
};

// Explicit static card effects translations
export const CARD_EFFECT_EXPLICIT_TRANSLATIONS: Record<string, { 'en-GB': string; 'es-AR': string }> = {
  // Parent Iconic & Specific
  '+10 Stat Points every 5 years': {
    'en-GB': '+10 Stat Points every 5 years',
    'es-AR': '+10 Puntos de Atributo cada 5 años',
  },
  '+20% Fame gained from all Fame sources': {
    'en-GB': '+20% Fame gained from all Fame sources',
    'es-AR': '+20% Fama ganada de todas las fuentes',
  },
  'Fame Cards can NEVER become negative': {
    'en-GB': 'Fame Cards can NEVER become negative',
    'es-AR': 'Las Cartas de Fama NUNCA pueden volverse negativas',
  },
  '+5 Weak Foot & +40 Free Stat Points': {
    'en-GB': '+5 Weak Foot & +40 Free Stat Points',
    'es-AR': '+5 Pie Débil y +40 Puntos de Atributo Libres',
  },
  '+10 Chemistry on new club': {
    'en-GB': '+10 Chemistry on new club',
    'es-AR': '+10 Química al llegar a un nuevo club',
  },
  'Iconic Parent Agent (99/99/99)': {
    'en-GB': 'Iconic Parent Agent (99/99/99)',
    'es-AR': 'Agente Padre Icónico (99/99/99)',
  },
  'Upgradeable Parent Advice choice menu': {
    'en-GB': 'Upgradeable Parent Advice choice menu',
    'es-AR': 'Menú de Consejos Parentales mejorable',
  },
  'Perk: 50% chance of Fame Card becoming negative': {
    'en-GB': 'Perk: 50% chance of Fame Card becoming negative',
    'es-AR': 'Efecto: 50% de probabilidad de que la Carta de Fama sea negativa',
  },
  'Perk: -10 Chemistry when joining a new club': {
    'en-GB': 'Perk: -10 Chemistry when joining a new club',
    'es-AR': 'Efecto: -10 Química al llegar a un nuevo club',
  },
  'Perk: "Ask Parents for Advice" button unlocked (1x per season)': {
    'en-GB': 'Perk: "Ask Parents for Advice" button unlocked (1x per season)',
    'es-AR': 'Efecto: Botón "Pedir Consejo a los Padres" desbloqueado (1x por temporada)',
  },
  'Grants +10 Composure, +10 Chemistry, -10 Bad Rep, +10 Recovery, or +10 Focus': {
    'en-GB': 'Grants +10 Composure, +10 Chemistry, -10 Bad Rep, +10 Recovery, or +10 Focus',
    'es-AR': 'Otorga +10 Serenidad, +10 Química, -10 Mala Fama, +10 Recuperación o +10 Enfoque',
  },
  'Perk: Gain +1 Injury Recovery Point every month': {
    'en-GB': 'Perk: Gain +1 Injury Recovery Point every month',
    'es-AR': 'Efecto: Gana +1 Punto de Recuperación de Lesiones cada mes',
  },
  'Gain +1 Injury Recovery Point every month automatically.': {
    'en-GB': 'Gain +1 Injury Recovery Point every month automatically.',
    'es-AR': 'Gana +1 Punto de Recuperación de Lesiones cada mes automáticamente.',
  },
  'Efecto: Forced To Train - Gain': {
    'en-GB': 'Perk: Forced To Train - Gain',
    'es-AR': 'Efecto: Obligado a entrenar - Obtenida.',
  },
  'Perk: Forced To Train - Gain': {
    'en-GB': 'Perk: Forced To Train - Gain',
    'es-AR': 'Efecto: Obligado a entrenar - Obtenida.',
  },
  'Perk: Forced To Train - Gain +1 Injury Recovery Point every month automatically.': {
    'en-GB': 'Perk: Forced To Train - Gain +1 Injury Recovery Point every month automatically.',
    'es-AR': 'Efecto: Obligado a entrenar - Obtenida.',
  },
  'Eligible for Youth & Senior call-ups across dual nationalities': {
    'en-GB': 'Eligible for Youth & Senior call-ups across dual nationalities',
    'es-AR': 'Elegible para convocatorias juveniles y mayores de doble nacionalidad',
  },
  'Perk: +5 Chemistry upon joining a new club': {
    'en-GB': 'Perk: +5 Chemistry upon joining a new club',
    'es-AR': 'Efecto: +5 Química al llegar a un nuevo club',
  },
  'Perk: +1 Potential per new club transfer (max +5 career)': {
    'en-GB': 'Perk: +1 Potential per new club transfer (max +5 career)',
    'es-AR': 'Efecto: +1 Potencial por cada traspaso a un nuevo club (máx +5 en la carrera)',
  },
  'Perk: Play 1 additional match through injury before key finals': {
    'en-GB': 'Perk: Play 1 additional match through injury before key finals',
    'es-AR': 'Efecto: Juega 1 partido adicional lesionado antes de finales clave',
  },
  'Perk: +5 to ALL player stats & +10 Composure in Semi-Finals, Finals & Key Matches': {
    'en-GB': 'Perk: +5 to ALL player stats & +10 Composure in Semi-Finals, Finals & Key Matches',
    'es-AR': 'Efecto: +5 a TODOS los atributos y +10 Serenidad en semifinales, finales y partidos clave',
  },
  'Perk: -10 Composure in Semi-Finals, Finals & Key Matches': {
    'en-GB': 'Perk: -10 Composure in Semi-Finals, Finals & Key Matches',
    'es-AR': 'Efecto: -10 Serenidad en semifinales, finales y partidos clave',
  },
  'Perk: 5% greater chance of drawing negative Fame Cards': {
    'en-GB': 'Perk: 5% greater chance of drawing negative Fame Cards',
    'es-AR': 'Efecto: 5% más de probabilidad de robar Cartas de Fama negativas',
  },

  // Youth Iconic & Perks
  '⭐ Unlocks Iconic Perk: "Step on" (Pisarla)': {
    'en-GB': '⭐ Unlocks Iconic Perk: "Step on" (Pisarla)',
    'es-AR': '⭐ Desbloquea Hábito Icónico: "La Pisadita" (Pisarla)',
  },
  '🛡️ +30% Retention duel boost in matches': {
    'en-GB': '🛡️ +30% Retention duel boost in matches',
    'es-AR': '🛡️ +30% de bonificación en duelos de retención en partidos',
  },
  '⚡ +1 Retention yearly & Stat Break to 100 at 99': {
    'en-GB': '⚡ +1 Retention yearly & Stat Break to 100 at 99',
    'es-AR': '⚡ +1 Retención anual y Ruptura a 100 al llegar a 99',
  },
  '⚡ Unlocks Overflow Chemistry beyond 100% (+1 to all stats per 1%)': {
    'en-GB': '⚡ Unlocks Overflow Chemistry beyond 100% (+1 to all stats per 1%)',
    'es-AR': '⚡ Desbloquea Desborde de Química sobre 100% (+1 a todo atributo por cada 1%)',
  },
  'Boosts First Professional Contract Offer by +50%': {
    'en-GB': 'Boosts First Professional Contract Offer by +50%',
    'es-AR': 'Aumenta la primera oferta de contrato profesional en +50%',
  },

  // Street iconic & penalties
  'First Pro Contract Event Triggered': {
    'en-GB': 'First Pro Contract Event Triggered',
    'es-AR': 'Evento de Primer Contrato Profesional Activado',
  },
  'Unlocks Signature Skill: Outside Foot Shot (Trivela)': {
    'en-GB': 'Unlocks Signature Skill: Outside Foot Shot (Trivela)',
    'es-AR': 'Desbloquea Habilidad Distintiva: Tiro con tres dedos (Trivela)',
  },
  'Age > 28: No Street Gains': {
    'en-GB': 'Age > 28: No Street Gains',
    'es-AR': 'Edad > 28: Sin mejoras callejeras',
  },
  '50% Age Penalty: 21-28': {
    'en-GB': '50% Age Penalty: 21-28',
    'es-AR': '50% Penalización por edad: 21-28',
  },
};

/**
 * Translates a single card effect string according to active language packet
 * and localization settings.
 */
export function translateCardEffect(rawText: string, forcedLang?: LanguageCode): string {
  if (!rawText) return '';

  const activePacket = getActiveLanguagePacket();
  const isPacketActive = isLanguagePacketLoaded();

  const currentLang = forcedLang || (isPacketActive && activePacket?.meta?.languageCode as LanguageCode) || getStoredLanguage() || 'en-GB';
  const packetTr = (isPacketActive && activePacket?.translations) || {};

  // 1. Direct packet match
  if (packetTr[rawText]) {
    return packetTr[rawText];
  }
  if (packetTr[rawText.trim()]) {
    return packetTr[rawText.trim()];
  }

  // 2. Explicit dictionary match
  const explicit = CARD_EFFECT_EXPLICIT_TRANSLATIONS[rawText] || CARD_EFFECT_EXPLICIT_TRANSLATIONS[rawText.trim()];
  if (explicit) {
    const translation = currentLang === 'es-AR' || currentLang === 'es-ES' ? explicit['es-AR'] : explicit['en-GB'];
    if (translation) return translation;
  }

  // 3. Pattern: Inherited Height: +X CM (Label)
  const heightMatch = rawText.match(/^Inherited Height:\s*\+?(\d+)\s*CM\s*\(([^)]+)\)/i);
  if (heightMatch) {
    const cm = heightMatch[1];
    const label = heightMatch[2].trim();
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      let labelEs = label;
      if (label.toLowerCase() === 'short') labelEs = 'Bajo';
      else if (label.toLowerCase() === 'average') labelEs = 'Promedio';
      else if (label.toLowerCase() === 'tall') labelEs = 'Alto';
      else if (label.toLowerCase() === 'giant') labelEs = 'Gigante';
      return `Altura Heredada: +${cm} CM (${labelEs})`;
    }
    return `Inherited Height: +${cm} CM (${label})`;
  }

  // 4. Pattern: Family Identity: ...
  const familyMatch = rawText.match(/^Family Identity:\s*(.+)$/i);
  if (familyMatch) {
    const fam = familyMatch[1].trim();
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      return `Identidad Familiar: ${fam}`;
    }
    return `Family Identity: ${fam}`;
  }

  // 5. Pattern: Starting Cash: €X
  const cashMatch = rawText.match(/^Starting Cash:\s*€?([0-9.,]+)/i);
  if (cashMatch) {
    const amount = cashMatch[1];
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      return `Dinero Inicial: €${amount}`;
    }
    return `Starting Cash: €${amount}`;
  }

  // 6. Pattern: Starting Business: X (Tier Y)
  const bizMatch = rawText.match(/^Starting Business:\s*(.+)\s*\(Tier\s*(\d+)\)/i);
  if (bizMatch) {
    const bizName = bizMatch[1].trim();
    const tier = bizMatch[2];
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      return `Negocio Inicial: ${bizName} (Nivel ${tier})`;
    }
    return `Starting Business: ${bizName} (Tier ${tier})`;
  }

  // 7. Pattern: Permanent Agent: X (Y Rating)
  const agentMatch = rawText.match(/^Permanent Agent:\s*(.+?)\s*\((\d+)\s*Rating\)/i);
  if (agentMatch) {
    const agentName = agentMatch[1].trim();
    const rating = agentMatch[2];
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      return `Representante Permanente: ${agentName} (Val. ${rating})`;
    }
    return `Permanent Agent: ${agentName} (${rating} Rating)`;
  }

  // 8. Pattern: Grants X Representative / Agent
  const repMatch = rawText.match(/^Grants\s+(.+?)\s+Representative\s*\/\s*(?:Manager|Agent)/i);
  if (repMatch) {
    const quality = repMatch[1].trim();
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      let qualityEs = quality;
      if (quality.toLowerCase() === 'bronze') qualityEs = 'Bronce';
      else if (quality.toLowerCase() === 'silver') qualityEs = 'Plata';
      else if (quality.toLowerCase() === 'gold') qualityEs = 'Oro';
      else if (quality.toLowerCase() === 'legendary') qualityEs = 'Leyenda';
      else if (quality.toLowerCase() === 'elite') qualityEs = 'Élite';
      else if (quality.toLowerCase() === 'master') qualityEs = 'Maestro';
      return `Otorga Representante ${qualityEs}`;
    }
    return `Grants ${quality} Representative / Agent`;
  }

  // 9. Pattern: Extra Nationalities (X): ...
  const extraNatMatch = rawText.match(/^Extra Nationalities\s*\((\d+)\):\s*(.+)$/i);
  if (extraNatMatch) {
    const count = extraNatMatch[1];
    const nats = extraNatMatch[2].trim();
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      return `Nacionalidades Adicionales (${count}): ${nats}`;
    }
    return `Extra Nationalities (${count}): ${nats}`;
  }

  // 10. Pattern: Perk: X - Y / Efecto: X - Y
  const perkDescMatch = rawText.match(/^(?:Perk|Efecto):\s*([^-\n]+)\s*-\s*(.+)$/i);
  if (perkDescMatch) {
    const title = perkDescMatch[1].trim();
    const desc = perkDescMatch[2].trim();
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      const translatedTitle = packetTr[title] || CARD_EFFECT_EXPLICIT_TRANSLATIONS[title]?.['es-AR'] || (title === 'Forced To Train' ? 'Obligado a entrenar' : title);
      let translatedDesc = packetTr[desc] || CARD_EFFECT_EXPLICIT_TRANSLATIONS[desc]?.['es-AR'] || desc;
      if (title === 'Forced To Train' && desc.toLowerCase().startsWith('gain')) {
        translatedDesc = 'Obtenida.';
      }
      return `Efecto: ${translatedTitle} - ${translatedDesc}`;
    }
    return `Perk: ${title} - ${desc}`;
  }

  // 11. Pattern: +X Free Stat Points / Free Development Stat Points
  const freePointsMatch = rawText.match(/^\+?(\d+)\s*Free(?:\s*Development)?\s*Stat\s*Points/i);
  if (freePointsMatch) {
    const count = freePointsMatch[1];
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      return `+${count} Puntos de Atributo Libres`;
    }
    return `+${count} Free Stat Points`;
  }

  // 12. Pattern: +X Weak Foot
  const wfMatch = rawText.match(/^\+?(\d+)\s*Weak\s*Foot/i);
  if (wfMatch) {
    const count = wfMatch[1];
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      return `+${count} Pie Débil`;
    }
    return `+${count} Weak Foot`;
  }

  // 13. Pattern: +X Fame or Fame: +X
  const fameMatch = rawText.match(/^(?:\+?(\d+)\s*Fame|Fame:\s*([+-]?\d+))/i);
  if (fameMatch) {
    const count = fameMatch[1] || fameMatch[2];
    const sign = count.startsWith('-') ? '' : '+';
    if (currentLang === 'es-AR' || currentLang === 'es-ES') {
      return `Fama: ${sign}${count.replace('+', '')}`;
    }
    return `Fame: ${sign}${count.replace('+', '')}`;
  }

  // 14. Pattern: Stat bonuses: "+X StatName" or "StatName: +X" or "StatName: -X"
  const statPrefixMatch = rawText.match(/^([+-]?\d+)\s+([A-Za-z\s]+)$/);
  if (statPrefixMatch) {
    const val = statPrefixMatch[1];
    const statRaw = statPrefixMatch[2].trim().toLowerCase();
    const statTrans = STAT_NAME_TRANSLATIONS[statRaw];
    if (statTrans) {
      const translatedName = currentLang === 'es-AR' || currentLang === 'es-ES' ? statTrans['es-AR'] : statTrans['en-GB'];
      const sign = val.startsWith('-') ? '' : '+';
      return `${sign}${val.replace('+', '')} ${translatedName}`;
    }
  }

  const statColonMatch = rawText.match(/^([A-Za-z\s]+):\s*([+-]?\d+%?)(.*)$/);
  if (statColonMatch) {
    const statRaw = statColonMatch[1].trim().toLowerCase();
    const val = statColonMatch[2];
    const extra = statColonMatch[3];
    const statTrans = STAT_NAME_TRANSLATIONS[statRaw];
    if (statTrans) {
      const translatedName = currentLang === 'es-AR' || currentLang === 'es-ES' ? statTrans['es-AR'] : statTrans['en-GB'];
      let extraTranslated = extra;
      if (currentLang === 'es-AR' || currentLang === 'es-ES') {
        extraTranslated = extraTranslated
          .replace(/Age > 28: No Street Gains/g, 'Edad > 28: Sin mejoras callejeras')
          .replace(/50% Age Penalty: 21-28/g, '50% Penalización por edad: 21-28');
      }
      return `${translatedName}: ${val}${extraTranslated}`;
    }
  }

  // 15. Fallback for Argentinean Spanish: replace any known stat names & terms within rawText
  if (currentLang === 'es-AR' || currentLang === 'es-ES') {
    let replaced = rawText;
    Object.entries(STAT_NAME_TRANSLATIONS).forEach(([enKey, trans]) => {
      const regex = new RegExp(`\\b${enKey}\\b`, 'gi');
      replaced = replaced.replace(regex, trans['es-AR']);
    });
    replaced = replaced
      .replace(/\bPerk:\b/gi, 'Efecto:')
      .replace(/\bChemistry\b/gi, 'Química')
      .replace(/\bFame\b/gi, 'Fama')
      .replace(/\bMoney\b/gi, 'Dinero')
      .replace(/\bBad Reputation\b/gi, 'Mala Fama')
      .replace(/\bPotential\b/gi, 'Potencial')
      .replace(/\bInherited Height\b/gi, 'Altura Heredada')
      .replace(/\bFree Stat Points\b/gi, 'Puntos Libres')
      .replace(/\bWeak Foot\b/gi, 'Pie Débil');
    return replaced;
  }

  // Default UK English return: guarantees effect text is never lost
  return rawText;
}
