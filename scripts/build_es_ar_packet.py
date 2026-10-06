import json
import re

# Load UK English packet as base template to guarantee 100% key coverage
with open('src/data/ukEnglishLanguagePacket.json', 'r', encoding='utf-8') as f:
    uk_packet = json.load(f)

uk_translations = uk_packet['translations']

es_ar_translations = {}

# 1. Extract from localizationSystem.ts TRANSLATIONS['es-AR']
with open('src/utils/localizationSystem.ts', 'r', encoding='utf-8') as f:
    loc_text = f.read()

es_ar_match = re.search(r"const TRANSLATIONS:[^=]*=\s*\{[\s\S]*?['\"]es-AR['\"]:\s*\{([\s\S]*?)\n  \},", loc_text)
if es_ar_match:
    for line in es_ar_match.group(1).split('\n'):
        line_clean = line.strip()
        if not line_clean or line_clean.startswith('//'):
            continue
        kv = re.match(r"['\"]([^'\"]+)['\"]\s*:\s*(['\"`])([\s\S]*?)\2,?", line_clean)
        if kv:
            key = kv.group(1)
            val = kv.group(3).replace("\\'", "'").replace('\\"', '"')
            es_ar_translations[key] = val

print(f"Extracted {len(es_ar_translations)} keys from TRANSLATIONS['es-AR']")

# 2. Extract from cardTranslationsDatabase.ts
with open('src/utils/cardTranslationsDatabase.ts', 'r', encoding='utf-8') as f:
    card_db_text = f.read()

# Pattern for card entries:
# "cardId": { ... "es-AR": { "name": "...", "description": "..." } ... }
card_blocks = re.findall(r'[\'"]([a-zA-Z0-9_\-]+)[\'"]\s*:\s*\{([\s\S]*?)(?=\n  [\'"][a-zA-Z0-9_\-]+[\'"]\s*:|\n\};)', card_db_text)

card_count = 0
for cid, block in card_blocks:
    m_ar = re.search(r'[\'"]es-AR[\'"]\s*:\s*\{\s*[\'"]name[\'"]\s*:\s*([\'"`])(.*?)\1\s*,\s*[\'"]description[\'"]\s*:\s*([\'"`])(.*?)\3\s*\}', block, re.DOTALL)
    if m_ar:
        name = m_ar.group(2).replace("\\'", "'").replace('\\"', '"')
        desc = m_ar.group(4).replace("\\'", "'").replace('\\"', '"')
        card_count += 1
        es_ar_translations[f"CARD_{cid}_NAME"] = name
        es_ar_translations[f"CARD_{cid}_DESC"] = desc
        es_ar_translations[f"{cid}:name"] = name
        es_ar_translations[f"{cid}:desc"] = desc
        es_ar_translations[cid] = name

print(f"Extracted {card_count} cards with es-AR from cardTranslationsDatabase.ts")

# 3. Save draft so far
with open('src/data/es_ar_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(es_ar_translations, f, indent=2, ensure_ascii=False)
