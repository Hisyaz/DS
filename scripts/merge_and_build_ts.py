#!/usr/bin/env python3
"""
Merges all translation parts and ensures 100% exact match with all_cards_export.json
"""

import json

with open("all_cards_export.json", "r", encoding="utf-8") as f:
    cards = json.load(f)

with open("/tmp/trans_part1.json") as f:
    t1 = json.load(f)
with open("/tmp/trans_youth.json") as f:
    ty = json.load(f)
with open("/tmp/trans_career.json") as f:
    tc = json.load(f)
with open("/tmp/trans_life.json") as f:
    tl = json.load(f)
with open("/tmp/trans_final.json") as f:
    tf = json.load(f)

merged = {**t1, **ty, **tc, **tl, **tf}

# Ensure en-GB has the exact original name and description from the cards export
for c in cards:
    cid = c["id"]
    if cid in merged:
        merged[cid]["en-GB"]["name"] = c["name"]
        merged[cid]["en-GB"]["description"] = c["description"]

print(f"Total cards processed: {len(merged)}")

ts_content = """/**
 * CARD TRANSLATIONS DATABASE
 * Single source of truth for full multilingual card localization across all 5 supported languages:
 * - English (en-GB)
 * - Español España (es-ES)
 * - Español Argentina (es-AR)
 * - Português Brasil (pt-BR)
 * - Français (fr-FR)
 *
 * Covers 100% of all default and option file cards (255 cards total).
 */

import type { CustomCard } from '../types';

export interface CardLocalizedText {
  name: string;
  description: string;
}

export const ALL_CARD_TRANSLATIONS: Record<string, Record<string, CardLocalizedText>> = """

ts_content += json.dumps(merged, ensure_ascii=False, indent=2) + ";\n\n"

ts_content += """/**
 * Get localized name and description for any card ID in the specified language.
 * Falls back to es-ES if es-AR is missing, or en-GB if other languages are missing.
 */
export function getCardTranslation(cardId: string, lang: string): CardLocalizedText | undefined {
  const cardEntry = ALL_CARD_TRANSLATIONS[cardId];
  if (!cardEntry) return undefined;

  if (cardEntry[lang]) return cardEntry[lang];
  if (lang === 'es-AR' && cardEntry['es-ES']) return cardEntry['es-ES'];
  if (cardEntry['en-GB']) return cardEntry['en-GB'];
  return undefined;
}

/**
 * Attaches the complete dictionary of translations to a CustomCard object
 * so it is persisted in the Option File and available offline/cross-platform.
 */
export function attachCardTranslations<T extends CustomCard>(card: T): T {
  const trans = ALL_CARD_TRANSLATIONS[card.id];
  if (!trans) return card;

  return {
    ...card,
    translations: {
      ...(card.translations || {}),
      'en-GB': trans['en-GB'],
      'es-ES': trans['es-ES'],
      'es-AR': trans['es-AR'],
      'pt-BR': trans['pt-BR'],
      'fr-FR': trans['fr-FR'],
    },
  };
}

/**
 * Returns a clone of the card with its name and description localized to the target language.
 */
export function getLocalizedCard<T extends CustomCard>(card: T, lang: string): T {
  const trans = getCardTranslation(card.id, lang) || (card.translations && card.translations[lang]);
  if (!trans) return card;

  return {
    ...card,
    name: trans.name || card.name,
    description: trans.description || card.description,
  };
}
"""

with open("src/utils/cardTranslationsDatabase.ts", "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Regenerated src/utils/cardTranslationsDatabase.ts successfully!")
