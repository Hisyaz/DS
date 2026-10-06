/**
 * TRANSLATION INSPECTOR SYSTEM
 * In-game audit and text-picker tool for capturing, tracking, and exporting
 * untranslated strings, card descriptions, popups, and ensuring 100% canonical
 * consistency across player stats, perks, positions, clubs, managers, and trophies.
 */

export interface InspectedTranslationItem {
  id: string;
  originalText: string;
  screenContext: string;
  activeLanguage: string;
  suggestedKey?: string;
  notes?: string;
  timestamp: string;
}

const STORAGE_KEY = 'drawstar_untranslated_audit_items_v1';

/**
 * Retrieves all currently logged untranslated strings from localStorage
 */
export function getInspectedItems(): InspectedTranslationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[TranslationInspector] Failed to read inspected items:', err);
    return [];
  }
}

/**
 * Saves or updates the list of inspected translation items
 */
export function saveInspectedItems(items: InspectedTranslationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[TranslationInspector] Failed to save inspected items:', err);
  }
}

/**
 * Captures a new string into the audit log
 */
export function recordInspectedText(
  originalText: string,
  screenContext: string,
  activeLanguage: string,
  notes?: string
): InspectedTranslationItem {
  const trimmed = originalText.trim();
  const items = getInspectedItems();

  // Avoid exact duplicates in the same screen
  const existing = items.find(
    (i) => i.originalText.toLowerCase() === trimmed.toLowerCase() && i.screenContext === screenContext
  );

  if (existing) {
    if (notes && notes !== existing.notes) {
      existing.notes = notes;
      saveInspectedItems(items);
    }
    return existing;
  }

  // Generate suggested dictionary key
  const cleanKey = trimmed
    .toUpperCase()
    .replace(/[^A-Z0-9\s_]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 36);

  const newItem: InspectedTranslationItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    originalText: trimmed,
    screenContext,
    activeLanguage,
    suggestedKey: `TRANS_${cleanKey}`,
    notes: notes || '',
    timestamp: new Date().toISOString(),
  };

  items.unshift(newItem);
  saveInspectedItems(items);
  return newItem;
}

/**
 * Removes an item from the audit list
 */
export function removeInspectedItem(id: string): void {
  const items = getInspectedItems().filter((item) => item.id !== id);
  saveInspectedItems(items);
}

/**
 * Clears all audited items
 */
export function clearAllInspectedItems(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Exports all inspected items as a cleanly formatted JSON string ready to submit
 */
export function exportInspectedItemsAsJson(): string {
  const items = getInspectedItems();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalItems: items.length,
      untranslatedStrings: items.map((i) => ({
        text: i.originalText,
        screen: i.screenContext,
        language: i.activeLanguage,
        suggestedKey: i.suggestedKey,
        notes: i.notes,
      })),
    },
    null,
    2
  );
}

/**
 * Exports all inspected items as a plain text / Markdown list
 */
export function exportInspectedItemsAsMarkdown(): string {
  const items = getInspectedItems();
  if (items.length === 0) {
    return 'No untranslated texts recorded yet.';
  }

  let output = `# Untranslated Texts Audit Report\nTotal Items: ${items.length}\nDate: ${new Date().toLocaleDateString()}\n\n`;
  output += `| # | Screen Context | Original Text | Active Lang | Suggested Key | Notes |\n`;
  output += `|---|---|---|---|---|---|\n`;

  items.forEach((item, index) => {
    const escapedText = item.originalText.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const escapedNotes = (item.notes || '-').replace(/\|/g, '\\|');
    output += `| ${index + 1} | ${item.screenContext} | "${escapedText}" | ${item.activeLanguage} | \`${item.suggestedKey}\` | ${escapedNotes} |\n`;
  });

  return output;
}
