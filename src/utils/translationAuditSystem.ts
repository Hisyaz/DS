/**
 * TRANSLATION AUDIT SYSTEM
 * Tracks untranslated, partially translated, or inconsistent in-game text.
 * Allows picking text directly in-game, reviewing the list, and exporting
 * as JSON or CSV to resubmit for clean, consistent translations.
 */

import { LanguageCode, getStoredLanguage } from './localizationSystem';

export interface TranslationAuditItem {
  id: string;
  textKey?: string;
  screen: string;
  category: 'Card Description' | 'Wonderkid Profile' | 'Stat / Attribute' | 'Perk / Playstyle' | 'Position' | 'Club / Manager' | 'Trophy' | 'Popup / Explainer' | 'UI Label' | 'Other';
  englishText: string;
  currentRenderedText: string;
  targetLanguage: LanguageCode;
  suggestedTranslation?: string;
  elementTag?: string;
  cssSelector?: string;
  timestamp: number;
}

const STORAGE_KEY = 'drawstar_translation_audit_items_v1';

export function getAuditItems(): TranslationAuditItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load audit items:', e);
    return [];
  }
}

export function saveAuditItems(items: TranslationAuditItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save audit items:', e);
  }
}

export function addAuditItem(item: Omit<TranslationAuditItem, 'id' | 'timestamp'>): TranslationAuditItem {
  const current = getAuditItems();
  // Check if item with identical english text & screen already exists
  const existingIdx = current.findIndex(
    (existing) => existing.englishText.trim().toLowerCase() === item.englishText.trim().toLowerCase() && existing.screen === item.screen
  );

  const fullItem: TranslationAuditItem = {
    ...item,
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  if (existingIdx >= 0) {
    current[existingIdx] = {
      ...current[existingIdx],
      ...item,
      timestamp: Date.now(),
    };
  } else {
    current.unshift(fullItem);
  }

  saveAuditItems(current);
  return fullItem;
}

export function removeAuditItem(id: string): void {
  const current = getAuditItems();
  const filtered = current.filter((item) => item.id !== id);
  saveAuditItems(filtered);
}

export function clearAuditItems(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Exports current audit items as formatted JSON string
 */
export function exportAuditAsJson(items: TranslationAuditItem[] = getAuditItems()): string {
  const report = {
    generatedAt: new Date().toISOString(),
    totalItems: items.length,
    language: getStoredLanguage(),
    items: items.map((it) => ({
      key: it.textKey || it.englishText.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30),
      screen: it.screen,
      category: it.category,
      english: it.englishText,
      current: it.currentRenderedText,
      suggested: it.suggestedTranslation || '',
    })),
  };
  return JSON.stringify(report, null, 2);
}

/**
 * Exports current audit items as standard CSV string
 */
export function exportAuditAsCsv(items: TranslationAuditItem[] = getAuditItems()): string {
  const headers = ['Category', 'Screen', 'Key', 'English Text', 'Current Rendered Text', 'Suggested Translation'];
  const rows = items.map((it) => [
    `"${(it.category || '').replace(/"/g, '""')}"`,
    `"${(it.screen || '').replace(/"/g, '""')}"`,
    `"${(it.textKey || '').replace(/"/g, '""')}"`,
    `"${(it.englishText || '').replace(/"/g, '""')}"`,
    `"${(it.currentRenderedText || '').replace(/"/g, '""')}"`,
    `"${(it.suggestedTranslation || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Built-in Quick Scanner:
 * Generates an initial list of commonly reported untranslated card descriptions,
 * Wonderkid creator strings, and explanation modals.
 */
export function runPredefinedScan(currentLanguage: LanguageCode = getStoredLanguage()): TranslationAuditItem[] {
  const candidates: Array<Omit<TranslationAuditItem, 'id' | 'timestamp'>> = [
    {
      screen: 'Heritage / Parent Card Selection',
      category: 'Card Description',
      englishText: 'One of your parents played professional football and now represents your career with insider experience.',
      currentRenderedText: 'One of your parents played professional football...',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Uno de tus padres jugó al fútbol profesional y ahora gestiona tu desarrollo con conocimiento interno del deporte.',
    },
    {
      screen: 'Heritage / Parent Card Selection',
      category: 'Card Description',
      englishText: 'Raised in a supportive, loving household that always believed in you and kept you grounded.',
      currentRenderedText: 'Raised in a supportive, loving household...',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Criado en un hogar cariñoso y comprensivo que siempre creyó en ti y te mantuvo con los pies en la tierra.',
    },
    {
      screen: 'Heritage / Parent Card Selection',
      category: 'Card Description',
      englishText: 'Your parents controlled every aspect of your football upbringing and represent you with fierce loyalty.',
      currentRenderedText: 'Your parents controlled every aspect...',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Tus padres controlaron cada aspecto de tu formación futbolística y te representan con lealtad feroz.',
    },
    {
      screen: 'Heritage / Parent Card Selection',
      category: 'Card Description',
      englishText: 'Your family moved in search of a better future. Growing up as an outsider made adapting second nature.',
      currentRenderedText: 'Your family moved in search of a better future...',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Tu familia emigró en busca de un futuro mejor. Crecer adaptándote forjó un carácter resiliente único.',
    },
    {
      screen: 'Heritage / Parent Card Selection',
      category: 'Perk / Playstyle',
      englishText: "Your parent's reputation creates unrealistic expectations: 50% chance Fame Cards become negative, -10 Chemistry on joining a new club.",
      currentRenderedText: "Your parent's reputation creates unrealistic expectations...",
      targetLanguage: currentLanguage,
      suggestedTranslation: 'La reputación de tu padre crea expectativas desmedidas: 50% de probabilidad de que las cartas de fama sean negativas, -10 Química al llegar a un nuevo club.',
    },
    {
      screen: 'Wonderkid Profile Creator',
      category: 'Wonderkid Profile',
      englishText: 'Age 10 Appropriate Style',
      currentRenderedText: 'Age 10 Appropriate Style',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Estilo adecuado para 10 años',
    },
    {
      screen: 'Wonderkid Profile Creator',
      category: 'Wonderkid Profile',
      englishText: 'Roll a random kid football appearance with age-appropriate hair and biometrics',
      currentRenderedText: 'Roll a random kid football appearance...',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Genera un aspecto infantil aleatorio con peinado y fisonomía adecuados para su edad',
    },
    {
      screen: 'Player Development Panel',
      category: 'Popup / Explainer',
      englishText: 'Player Rating & Attribute Center',
      currentRenderedText: 'Player Rating & Attribute Center',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Centro de Atributos y Valoración del Jugador',
    },
    {
      screen: 'Parent Card Selection',
      category: 'UI Label',
      englishText: 'AVAILABLE ROLES',
      currentRenderedText: 'AVAILABLE ROLES',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Roles disponibles.',
    },
    {
      screen: 'Parent Card Selection',
      category: 'UI Label',
      englishText: 'ATT_POSITION_DESCRIPTION',
      currentRenderedText: 'ATT_POSITION_DESCRIPTION',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Te gusta jugar cerca de la porteria rival.',
    },
    {
      screen: 'Parent Card Selection',
      category: 'UI Label',
      englishText: 'ATT / ATTACKER',
      currentRenderedText: 'ATT / ATTACKER',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'DEL / Delantero',
    },
    {
      screen: 'Cards Collection',
      category: 'UI Label',
      englishText: 'Discard "O Flecha" and retain your birth name. Saved to Customization so you can add it back later if you want.',
      currentRenderedText: 'Discard "O Flecha" and retain your birth name. Saved to Customization so you can add it back later if you want.',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Rechazas el apodo "O Flecha" y prefieres que te sigan llamando por tu nombre de nacimiento, puedes cambiar a este apodo mas adelante en la ventana de personalizacion.',
    },
    {
      screen: 'Cards Collection',
      category: 'UI Label',
      englishText: 'DISCARD / KEEP BIRTH NAME',
      currentRenderedText: 'DISCARD / KEEP BIRTH NAME',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Rechazar / Mantener Nombre de nacimiento',
    },
    {
      screen: 'Cards Collection',
      category: 'UI Label',
      englishText: 'Based on your chosen Speedster archetype in São Paulo, the local supporters and scouts have already given you a signature nickname!',
      currentRenderedText: 'Based on your chosen Speedster archetype in São Paulo, the local supporters and scouts have already given you a signature nickname!',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Segun tu arquetipo la gente de São Paulo empezo a llamarte "O Flecha", los reclutadores ya tomaron nota de to singular apodo.',
    },
    {
      screen: 'Cards Collection',
      category: 'UI Label',
      englishText: 'Fans are calling you "O Flecha"',
      currentRenderedText: 'Fans are calling you "O Flecha"',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Los fans te llaman "O Flecha"',
    },
    {
      screen: 'Parent Card Selection',
      category: 'UI Label',
      englishText: 'KEY WEAKNESSES (+10% PTS)',
      currentRenderedText: 'KEY WEAKNESSES (+10% PTS)',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Debilidates (Desarrollo 10% mas lento)',
    },
    {
      screen: 'Parent Card Selection',
      category: 'UI Label',
      englishText: 'PRIMARY STRENGTHS (+2/YR)',
      currentRenderedText: 'PRIMARY STRENGTHS (+2/YR)',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Ventajas primatias (+2/Año)',
    },
    {
      screen: 'Parent Card Selection',
      category: 'Stat / Attribute',
      englishText: 'Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space.',
      currentRenderedText: 'Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space.',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Naciste con explosividad, tus fibras son potentes y llenas de aceleracion, El bala depende en pura velocidad, transiciones explosivas y reacciones rapidas siendo imbatible en espacios abiertos.',
    },
    {
      screen: 'TYPE SELECTION',
      category: 'UI Label',
      englishText: 'SPEEDSTER',
      currentRenderedText: 'SPEEDSTER',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'BALA',
    },
    {
      screen: 'Parent Card Selection',
      category: 'UI Label',
      englishText: 'Efecto: Forced To Train - Gain',
      currentRenderedText: 'Efecto: Forced To Train - Gain',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Efecto: Obligado a entrenar - Obtenida.',
    },
    {
      screen: 'Parent Card Selection',
      category: 'UI Label',
      englishText: 'POTENTIAL',
      currentRenderedText: 'POTENTIAL',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Potencial.',
    },
    {
      screen: 'Cards Collection',
      category: 'UI Label',
      englishText: 'REVEAL & CHOOSE HERITAGE CARD',
      currentRenderedText: 'REVEAL & CHOOSE HERITAGE CARD',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Revelar y elegir cartas de padres.',
    },
    {
      screen: 'Cards Collection',
      category: 'UI Label',
      englishText: '🎲 RE-ROLL PARENT CARDS',
      currentRenderedText: '🎲 RE-ROLL PARENT CARDS',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Sacar nuevas cartas.',
    },
    {
      screen: 'Cards Collection',
      category: 'UI Label',
      englishText: '3 HERITAGE CARDS DRAWN',
      currentRenderedText: '3 HERITAGE CARDS DRAWN',
      targetLanguage: currentLanguage,
      suggestedTranslation: '3 Cartas de Padres Repartidas.',
    },
    {
      screen: 'Cards Collection',
      category: 'UI Label',
      englishText: 'Childhood upbringing, household stability, surname origin, and early habits.',
      currentRenderedText: 'Childhood upbringing, household stability, surname origin, and early habits.',
      targetLanguage: currentLanguage,
      suggestedTranslation: 'Determina tu infancia, origenes, apellido y habitos.',
    },
  ];

  candidates.forEach((cand) => addAuditItem(cand));
  return getAuditItems();
}

export const TRIGGER_MAGIC_INSPECT_EVENT = 'drawstar:trigger_magic_inspect';
export const TRIGGER_MAGIC_AUDIT_EVENT = 'drawstar:trigger_magic_audit';

export function triggerMagicInspect(active: boolean = true, toggle: boolean = false): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TRIGGER_MAGIC_INSPECT_EVENT, { detail: { active, toggle } }));
  }
}

export function triggerMagicAuditModal(open: boolean = true): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TRIGGER_MAGIC_AUDIT_EVENT, { detail: { open } }));
  }
}
