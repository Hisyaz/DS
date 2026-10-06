import json
import os

es_translations = {
    "AVAILABLE ROLES": "Roles disponibles.",
    "AVAILABLE_ROLES": "Roles disponibles.",
    "ATT_POSITION_DESCRIPTION": "Te gusta jugar cerca de la porteria rival.",
    "ATT / ATTACKER": "DEL / Delantero",
    "ATT_SLASH_ATTACKER": "DEL / Delantero",
    "Discard \"O Flecha\" and retain your birth name. Saved to Customization so you can add it back later if you want.": "Rechazas el apodo \"O Flecha\" y prefieres que te sigan llamando por tu nombre de nacimiento, puedes cambiar a este apodo mas adelante en la ventana de personalizacion.",
    "NICKNAME_STARTING_DISCARD_DESC": "Rechazas el apodo \"{nickname}\" y prefieres que te sigan llamando por tu nombre de nacimiento, puedes cambiar a este apodo mas adelante en la ventana de personalizacion.",
    "NICKNAME_DISCARD_BIRTH_DESC": "Rechazas el apodo \"{nickname}\" y prefieres que te sigan llamando por tu nombre de nacimiento, puedes cambiar a este apodo mas adelante en la ventana de personalizacion.",
    "DISCARD / KEEP BIRTH NAME": "Rechazar / Mantener Nombre de nacimiento",
    "NICKNAME_DISCARD_KEEP_BIRTH_NAME": "Rechazar / Mantener Nombre de nacimiento",
    "Based on your chosen Speedster archetype in São Paulo, the local supporters and scouts have already given you a signature nickname!": "Segun tu arquetipo la gente de São Paulo empezo a llamarte \"O Flecha\", los reclutadores ya tomaron nota de to singular apodo.",
    "NICKNAME_STARTING_SUBTITLE": "Segun tu arquetipo la gente de {city} empezo a llamarte \"{nickname}\", los reclutadores ya tomaron nota de to singular apodo.",
    "Fans are calling you \"O Flecha\"": "Los fans te llaman \"O Flecha\"",
    "NICKNAME_STARTING_HEADLINE": "Los fans te llaman \"{nickname}\"",
    "KEY WEAKNESSES (+10% PTS)": "Debilidates (Desarrollo 10% mas lento)",
    "KEY_WEAKNESSES_PTS": "Debilidates (Desarrollo 10% mas lento)",
    "PRIMARY STRENGTHS (+2/YR)": "Ventajas primatias (+2/Año)",
    "PRIMARY_STRENGTHS_YR": "Ventajas primatias (+2/Año)",
    "Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space.": "Naciste con explosividad, tus fibras son potentes y llenas de aceleracion, El bala depende en pura velocidad, transiciones explosivas y reacciones rapidas siendo imbatible en espacios abiertos.",
    "TYPE_SPEEDSTER_DESC": "Naciste con explosividad, tus fibras son potentes y llenas de aceleracion, El bala depende en pura velocidad, transiciones explosivas y reacciones rapidas siendo imbatible en espacios abiertos.",
    "SPEEDSTER": "BALA",
    "Speedster": "Bala",
    "Efecto: Forced To Train - Gain": "Efecto: Obligado a entrenar - Obtenida.",
    "Forced To Train": "Obligado a entrenar",
    "forced_to_train": "Obligado a entrenar",
    "PERK_forced_to_train_NAME": "Obligado a entrenar",
    "PERK_FORCED_TO_TRAIN_NAME": "Obligado a entrenar",
    "PERK_FORCED_TO_TRAIN": "Obligado a entrenar",
    "Perk: Forced To Train - Gain +1 Injury Recovery Point every month automatically.": "Efecto: Obligado a entrenar - Obtenida.",
    "POTENTIAL": "Potencial.",
    "Potential": "Potencial.",
    "REVEAL & CHOOSE HERITAGE CARD": "Revelar y elegir cartas de padres.",
    "PARENT_MODAL_REVEAL_BTN": "Revelar y elegir cartas de padres.",
    "🎲 RE-ROLL PARENT CARDS": "Sacar nuevas cartas.",
    "PARENT_MODAL_REROLL_BTN": "Sacar nuevas cartas.",
    "3 HERITAGE CARDS DRAWN": "3 Cartas de Padres Repartidas.",
    "4 HERITAGE CARDS DRAWN": "4 Cartas de Padres Repartidas.",
    "HERITAGE_CARDS_DRAWN": "{count} Cartas de Padres Repartidas.",
    "Childhood upbringing, household stability, surname origin, and early habits.": "Determina tu infancia, origenes, apellido y habitos.",
    "PARENT_MODAL_FAMILY_DESC": "Determina tu infancia, origenes, apellido y habitos.",
    "FAMILY BACKGROUND": "HISTORIA FAMILIAR",
    "PARENT_MODAL_FAMILY_TITLE": "HISTORIA FAMILIAR",
    "SELECTED": "ELEGIR",
    "SELECT": "ELEGIR",
    "CARD_BTN_SELECT": "ELEGIR",
    "WK_WEAK_FOOT_NOTE": "DETERMINA TU PIE HABIL.",
    "WK_RANDOMIZER": "GENERAR ",
    "WK_RANDOMIZE_BTN": "ALEATORIO"
}

en_translations = {
    "AVAILABLE ROLES": "AVAILABLE ROLES",
    "AVAILABLE_ROLES": "AVAILABLE ROLES",
    "ATT_POSITION_DESCRIPTION": "The spearhead of the attack. Your primary job is finishing chances, exploiting defensive gaps, converting high-pressure moments into goals, and creating scoring opportunities.",
    "ATT / ATTACKER": "ATT / Attacker",
    "ATT_SLASH_ATTACKER": "ATT / Attacker",
    "Discard \"O Flecha\" and retain your birth name. Saved to Customization so you can add it back later if you want.": "Discard \"O Flecha\" and retain your birth name. Saved to Customization so you can add it back later if you want.",
    "NICKNAME_STARTING_DISCARD_DESC": "Discard \"{nickname}\" and retain your birth name. Saved to Customization so you can add it back later if you want.",
    "NICKNAME_DISCARD_BIRTH_DESC": "Discard \"{nickname}\" and retain your birth name. Saved to Customization so you can add it back later if you want.",
    "DISCARD / KEEP BIRTH NAME": "DISCARD / KEEP BIRTH NAME",
    "NICKNAME_DISCARD_KEEP_BIRTH_NAME": "DISCARD / KEEP BIRTH NAME",
    "Based on your chosen Speedster archetype in São Paulo, the local supporters and scouts have already given you a signature nickname!": "Based on your chosen Speedster archetype in São Paulo, the local supporters and scouts have already given you a signature nickname!",
    "NICKNAME_STARTING_SUBTITLE": "Based on your chosen {archetype} archetype in {city}, the local supporters and scouts have already given you a signature nickname!",
    "Fans are calling you \"O Flecha\"": "Fans are calling you \"O Flecha\"",
    "NICKNAME_STARTING_HEADLINE": "Fans are calling you \"{nickname}\"",
    "KEY WEAKNESSES (+10% PTS)": "KEY WEAKNESSES (+10% PTS)",
    "KEY_WEAKNESSES_PTS": "KEY WEAKNESSES (+10% PTS)",
    "PRIMARY STRENGTHS (+2/YR)": "PRIMARY STRENGTHS (+2/YR)",
    "PRIMARY_STRENGTHS_YR": "PRIMARY STRENGTHS (+2/YR)",
    "Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space.": "Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space.",
    "TYPE_SPEEDSTER_DESC": "Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space.",
    "SPEEDSTER": "SPEEDSTER",
    "Speedster": "Speedster",
    "Efecto: Forced To Train - Gain": "Perk: Forced To Train - Gain",
    "Forced To Train": "Forced To Train",
    "forced_to_train": "Forced To Train",
    "PERK_forced_to_train_NAME": "Forced To Train",
    "PERK_FORCED_TO_TRAIN_NAME": "Forced To Train",
    "PERK_FORCED_TO_TRAIN": "Forced To Train",
    "Perk: Forced To Train - Gain +1 Injury Recovery Point every month automatically.": "Perk: Forced To Train - Gain +1 Injury Recovery Point every month automatically.",
    "POTENTIAL": "POTENTIAL",
    "Potential": "Potential",
    "REVEAL & CHOOSE HERITAGE CARD": "REVEAL & CHOOSE HERITAGE CARD",
    "PARENT_MODAL_REVEAL_BTN": "REVEAL & CHOOSE HERITAGE CARD",
    "🎲 RE-ROLL PARENT CARDS": "🎲 RE-ROLL PARENT CARDS",
    "PARENT_MODAL_REROLL_BTN": "🎲 RE-ROLL PARENT CARDS",
    "3 HERITAGE CARDS DRAWN": "3 HERITAGE CARDS DRAWN",
    "4 HERITAGE CARDS DRAWN": "4 HERITAGE CARDS DRAWN",
    "HERITAGE_CARDS_DRAWN": "{count} HERITAGE CARDS DRAWN",
    "Childhood upbringing, household stability, surname origin, and early habits.": "Childhood upbringing, household stability, surname origin, and early habits.",
    "PARENT_MODAL_FAMILY_DESC": "Childhood upbringing, household stability, surname origin, and early habits.",
    "FAMILY BACKGROUND": "FAMILY BACKGROUND",
    "PARENT_MODAL_FAMILY_TITLE": "FAMILY BACKGROUND",
    "SELECTED": "SELECTED",
    "SELECT": "SELECT",
    "CARD_BTN_SELECT": "SELECT",
    "WK_WEAK_FOOT_NOTE": "Weak Foot: 0 ★ (Trained in matches)",
    "WK_RANDOMIZER": "Randomizer",
    "WK_RANDOMIZE_BTN": "RANDOMIZE LOOK"
}

def update_packet(path, translations):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if 'translations' in data:
        data['translations'].update(translations)
        if 'meta' in data and 'totalKeys' in data['meta']:
            data['meta']['totalKeys'] = len(data['translations'])
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {path} with {len(translations)} keys. Total: {len(data.get('translations', {}))}")

update_packet('src/data/castilianSpanishLanguagePacket.json', es_translations)
update_packet('src/data/argentineanSpanishLanguagePacket.json', es_translations)
update_packet('src/data/ukEnglishLanguagePacket.json', en_translations)
