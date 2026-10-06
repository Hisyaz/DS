#!/usr/bin/env python3
"""
Phase 2: Master Canonical Glossary Builder and Packet Injector.
Enforces 100% terminology consistency for:
  - Stats & Attributes (Category + Detailed Outfield + GK)
  - Positions & Sub-positions
  - Playstyles & Tactical Archetypes
  - Career Perks (Names, Effects, Descriptions, Unlock Criteria)
  - Core Game Mechanics (Bad Rep, Chemistry, Stamina, Financials, Trophies)
Injected into:
  - ukEnglishLanguagePacket.json ('en-GB')
  - castilianSpanishLanguagePacket.json ('es-ES')
  - argentineanSpanishLanguagePacket.json ('es-AR')
"""

import json
import os
import re

def build_glossary_dictionary():
    with open('scripts/extracted_glossary.json', 'r', encoding='utf-8') as f:
        glossary = json.load(f)
    with open('scripts/extracted_all_perks.json', 'r', encoding='utf-8') as f:
        all_perks = json.load(f)

    # Dictionary per target language
    lang_maps = {
        'en-GB': {},
        'es-ES': {},
        'es-AR': {}
    }

    # 1. STATS INJECTION
    stats = glossary.get('stats', {})
    for stat_key, stat_obj in stats.items():
        names = stat_obj.get('names', {})
        abbrs = stat_obj.get('abbr', {})
        for lang in ['en-GB', 'es-ES', 'es-AR']:
            name_val = names.get(lang) or names.get('en-GB', '')
            abbr_val = abbrs.get(lang) or abbrs.get('en-GB', '')
            if name_val:
                # Direct key & lower/upper forms
                lang_maps[lang][stat_key] = name_val
                lang_maps[lang][stat_key.lower()] = name_val
                lang_maps[lang][stat_key.capitalize()] = name_val
                lang_maps[lang][f"STAT_{stat_key.upper()}"] = name_val
                lang_maps[lang][f"STAT_{stat_key.lower()}"] = name_val
                lang_maps[lang][f"ATTR_{stat_key.upper()}"] = name_val
                lang_maps[lang][f"STAT_LABEL_{stat_key.upper()}"] = name_val
            if abbr_val:
                lang_maps[lang][f"STAT_{stat_key.upper()}_ABBR"] = abbr_val
                lang_maps[lang][f"ABBR_{stat_key.upper()}"] = abbr_val
                lang_maps[lang][stat_key.upper()] = abbr_val

    # Also handle standard 6 category stats explicitly
    cat_stats = {
        'phy': {'en-GB': 'Physicality', 'es-ES': 'Físico', 'es-AR': 'Físico'},
        'pro': {'en-GB': 'Progression', 'es-ES': 'Progresión', 'es-AR': 'Progresión'},
        'cre': {'en-GB': 'Creativity', 'es-ES': 'Creatividad', 'es-AR': 'Creación'},
        'sco': {'en-GB': 'Goalscoring', 'es-ES': 'Goleador', 'es-AR': 'Goleador'},
        'def': {'en-GB': 'Defending', 'es-ES': 'Defensa', 'es-AR': 'Defensa'},
        'men': {'en-GB': 'Mentality', 'es-ES': 'Mentalidad', 'es-AR': 'Mentalidad'},
        'goa': {'en-GB': 'Goalkeeping', 'es-ES': 'Portería', 'es-AR': 'Arquero'},
    }
    for cat_key, cat_obj in cat_stats.items():
        for lang in ['en-GB', 'es-ES', 'es-AR']:
            lang_maps[lang][f"CAT_{cat_key.upper()}"] = cat_obj[lang]
            lang_maps[lang][f"STAT_CAT_{cat_key.upper()}"] = cat_obj[lang]

    # 2. POSITIONS INJECTION
    positions = glossary.get('positions', {})
    category_alias = {
        'FW': 'ATT',
        'DF': 'DEF',
        'MF': 'MID',
    }
    for pos_key, pos_obj in positions.items():
        names = pos_obj.get('names', {})
        for lang in ['en-GB', 'es-ES', 'es-AR']:
            name_val = names.get(lang) or names.get('en-GB', '')
            if name_val:
                lang_maps[lang][f"POS_{pos_key.upper()}"] = name_val
                lang_maps[lang][f"POSITION_{pos_key.upper()}"] = name_val
                lang_maps[lang][f"POS_NAME_{pos_key.upper()}"] = name_val
                lang_maps[lang][pos_key.upper()] = name_val
                # If FW/DF/MF, map to ATT/DEF/MID as well
                if pos_key in category_alias:
                    alias = category_alias[pos_key]
                    lang_maps[lang][f"POS_{alias}"] = name_val
                    lang_maps[lang][f"POSITION_{alias}"] = name_val
                    lang_maps[lang][f"POS_NAME_{alias}"] = name_val
                    lang_maps[lang][alias] = name_val

    # 3. PLAYSTYLES INJECTION
    playstyles = glossary.get('playstyles', {})
    for style_key, style_obj in playstyles.items():
        names = style_obj.get('names', {})
        descs = style_obj.get('descriptions', {})
        for lang in ['en-GB', 'es-ES', 'es-AR']:
            name_val = names.get(lang) or names.get('en-GB', '')
            desc_val = descs.get(lang) or descs.get('en-GB', '')
            if name_val:
                lang_maps[lang][f"PLAYSTYLE_{style_key.upper()}_NAME"] = name_val
                lang_maps[lang][f"PLAYSTYLE_{style_key.upper()}"] = name_val
                lang_maps[lang][style_key] = name_val
            if desc_val:
                lang_maps[lang][f"PLAYSTYLE_{style_key.upper()}_DESC"] = desc_val

    # 4. TACTICS INJECTION
    tactics = glossary.get('tactics', {})
    for tac_key, tac_obj in tactics.items():
        names = tac_obj.get('names', {})
        descs = tac_obj.get('descriptions', {})
        for lang in ['en-GB', 'es-ES', 'es-AR']:
            name_val = names.get(lang) or names.get('en-GB', '')
            desc_val = descs.get(lang) or descs.get('en-GB', '')
            if name_val:
                lang_maps[lang][f"TACTIC_{tac_key.upper()}_NAME"] = name_val
                lang_maps[lang][f"TACTIC_{tac_key.upper()}"] = name_val
            if desc_val:
                lang_maps[lang][f"TACTIC_{tac_key.upper()}_DESC"] = desc_val

    # 5. CAREER PERKS INJECTION (All 54 perks)
    for perk_id, perk_langs in all_perks.items():
        upper_id = perk_id.upper()
        for lang in ['en-GB', 'es-ES', 'es-AR']:
            pdata = perk_langs.get(lang) or perk_langs.get('en-GB', {})
            name = pdata.get('name', '')
            short_desc = pdata.get('shortDescription', '')
            effect = pdata.get('effect', '')
            obtain = pdata.get('howToObtain', '')
            story_title = pdata.get('storyTitle', '')
            story_narrative = pdata.get('storyNarrative', '')

            if name:
                lang_maps[lang][f"PERK_{upper_id}_NAME"] = name
                lang_maps[lang][f"PERK_{perk_id}_NAME"] = name
                lang_maps[lang][f"PERK_{upper_id}"] = name
                lang_maps[lang][f"PERK_{perk_id}"] = name
            if short_desc:
                lang_maps[lang][f"PERK_{upper_id}_SHORT_DESC"] = short_desc
                lang_maps[lang][f"PERK_{perk_id}_SHORT_DESC"] = short_desc
                lang_maps[lang][f"PERK_{upper_id}_DESC"] = short_desc
            if effect:
                lang_maps[lang][f"PERK_{upper_id}_EFFECT"] = effect
                lang_maps[lang][f"PERK_{perk_id}_EFFECT"] = effect
            if obtain:
                lang_maps[lang][f"PERK_{upper_id}_OBTAIN"] = obtain
                lang_maps[lang][f"PERK_{perk_id}_OBTAIN"] = obtain
            if story_title:
                lang_maps[lang][f"PERK_{upper_id}_STORY_TITLE"] = story_title
            if story_narrative:
                lang_maps[lang][f"PERK_{upper_id}_STORY_NARRATIVE"] = story_narrative

    # 6. STARTING CITIES INJECTION (9 Cities)
    cities = glossary.get('cities', {})
    for city_id, city_langs in cities.items():
        for lang in ['en-GB', 'es-ES', 'es-AR']:
            cdata = city_langs.get(lang) or city_langs.get('en-GB', {})
            c_name = cdata.get('cityName', '')
            c_country = cdata.get('countryName', '')
            c_full = cdata.get('fullName', '')
            c_desc = cdata.get('description', '')
            c_landmark = cdata.get('landmark', '')
            c_label = cdata.get('statModifierLabel', '')

            if c_name:
                lang_maps[lang][f"CITY_{city_id.upper()}_NAME"] = c_name
            if c_country:
                lang_maps[lang][f"CITY_{city_id.upper()}_COUNTRY"] = c_country
            if c_full:
                lang_maps[lang][f"CITY_{city_id.upper()}_FULL"] = c_full
            if c_desc:
                lang_maps[lang][f"CITY_{city_id.upper()}_DESC"] = c_desc
            if c_landmark:
                lang_maps[lang][f"CITY_{city_id.upper()}_LANDMARK"] = c_landmark
            if c_label:
                lang_maps[lang][f"CITY_{city_id.upper()}_STAT_LABEL"] = c_label

    # 7. CORE MECHANICS CONSISTENCY TERMS
    mechanics = {
        'BAD_REP_TIER_LABEL': {'en-GB': 'REPUTATION TIER', 'es-ES': 'NIVEL DE REPUTACIÓN', 'es-AR': 'NIVEL DE REPUTACIÓN'},
        'BAD_REP_TITLE': {'en-GB': 'Bad Reputation', 'es-ES': 'Mala Reputación', 'es-AR': 'Mala Fama'},
        'ACTIVE_PROBLEM_PLAYER_PENALTIES': {'en-GB': 'ACTIVE PROBLEM-PLAYER PENALTIES:', 'es-ES': 'SANCIONES ACTIVAS DE JUGADOR PROBLEMÁTICO:', 'es-AR': 'PENALIZACIONES ACTIVAS DE JUGADOR CONFLICTIVO:'},
        'ACKNOWLEDGE_CONSEQUENCES': {'en-GB': 'ACKNOWLEDGE CONSEQUENCES', 'es-ES': 'ASUMIR CONSECUENCIAS', 'es-AR': 'ACEPTAR CONSECUENCIAS'},
        'CHEMISTRY_LABEL': {'en-GB': 'Team Chemistry', 'es-ES': 'Química de Equipo', 'es-AR': 'Química del Plantel'},
        'STAMINA_LABEL': {'en-GB': 'Stamina & Fitness', 'es-ES': 'Resistencia y Condición', 'es-AR': 'Físico y Energía'},
        'POTENTIAL_LABEL': {'en-GB': 'Potential', 'es-ES': 'Potencial', 'es-AR': 'Potencial'},
        'MARKET_VALUE_LABEL': {'en-GB': 'Market Value', 'es-ES': 'Valor de Mercado', 'es-AR': 'Valor de Mercado'},
        'WAGE_LABEL': {'en-GB': 'Weekly Wage', 'es-ES': 'Sueldo Semanal', 'es-AR': 'Salario Semanal'},
        'COMMERCIAL_INCOME_LABEL': {'en-GB': 'Commercial Revenue', 'es-ES': 'Ingresos Comerciales', 'es-AR': 'Ingresos Comerciales'},
        'TROPHY_CABINET_TITLE': {'en-GB': 'Trophy Cabinet', 'es-ES': 'Vitrina de Trofeos', 'es-AR': 'Vitrina de Trofeos'},
        'KEY_MATCH_LABEL': {'en-GB': 'Key Match', 'es-ES': 'Partido Clave', 'es-AR': 'Partido Clave'},
        'DERBY_MATCH_LABEL': {'en-GB': 'Derby Clash', 'es-ES': 'Derbi Histórico', 'es-AR': 'Clásico'},
        'SEASON_GOALS': {'en-GB': 'Goals', 'es-ES': 'Goles', 'es-AR': 'Goles'},
        'SEASON_ASSISTS': {'en-GB': 'Assists', 'es-ES': 'Asistencias', 'es-AR': 'Asistencias'},
        'AVERAGE_RATING': {'en-GB': 'Average Rating', 'es-ES': 'Valoración Media', 'es-AR': 'Promedio de Rendimiento'},
        'MATCH_MVP': {'en-GB': 'Man of the Match (MVP)', 'es-ES': 'Jugador del Partido (MVP)', 'es-AR': 'Figura del Partido (MVP)'},
    }
    for m_key, m_langs in mechanics.items():
        for lang in ['en-GB', 'es-ES', 'es-AR']:
            lang_maps[lang][m_key] = m_langs[lang]

    return lang_maps

def inject_glossary_into_packets():
    lang_maps = build_glossary_dictionary()

    packet_configs = [
        ('src/data/ukEnglishLanguagePacket.json', 'en-GB', 'src/data/defaultLanguagePacket.ts'),
        ('src/data/castilianSpanishLanguagePacket.json', 'es-ES', None),
        ('src/data/argentineanSpanishLanguagePacket.json', 'es-AR', None),
    ]

    for json_path, lang_code, ts_companion in packet_configs:
        with open(json_path, 'r', encoding='utf-8') as f:
            packet_data = json.load(f)

        translations = packet_data.setdefault('translations', {})
        glossary_items = lang_maps.get(lang_code, {})

        injected_count = 0
        updated_count = 0
        for k, v in glossary_items.items():
            if k not in translations:
                translations[k] = v
                injected_count += 1
            elif translations[k] != v:
                translations[k] = v
                updated_count += 1

        # Update meta count
        if 'meta' in packet_data:
            packet_data['meta']['totalKeys'] = len(translations)

        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(packet_data, f, ensure_ascii=False, indent=2)

        print(f"[{lang_code}] Updated {json_path}: {injected_count} new keys, {updated_count} authoritative updates. Total keys: {len(translations)}")

        # If UK English, sync ts companion file
        if ts_companion and os.path.exists(ts_companion):
            ts_content = f'import {{ LanguagePacket }} from "../types/languagePacket";\n\nexport const DEFAULT_UK_ENGLISH_PACKET: LanguagePacket = {json.dumps(packet_data, ensure_ascii=False, indent=2)};\n'
            with open(ts_companion, 'w', encoding='utf-8') as f_ts:
                f_ts.write(ts_content)
            print(f"[{lang_code}] Synced TS companion: {ts_companion}")

if __name__ == '__main__':
    inject_glossary_into_packets()
