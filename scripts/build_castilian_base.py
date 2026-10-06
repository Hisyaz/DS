import json
import re

# Load base dictionaries
with open('src/data/argentineanSpanishLanguagePacket.json', 'r', encoding='utf-8') as f:
    es_ar_packet = json.load(f)

# Also check defaultLanguagePacket.ts
with open('src/data/defaultLanguagePacket.ts', 'r', encoding='utf-8') as f:
    default_ts = f.read()

# Also cardTranslationsDatabase.ts for exact es-ES entries
with open('src/utils/cardTranslationsDatabase.ts', 'r', encoding='utf-8') as f:
    card_db_text = f.read()

# Extract cards es-ES translations
es_es_cards = {}
card_blocks = re.findall(r'[\'"]([a-zA-Z0-9_\-]+)[\'"]\s*:\s*\{([\s\S]*?)(?=\n  [\'"][a-zA-Z0-9_\-]+[\'"]\s*:|\n\};)', card_db_text)
for cid, block in card_blocks:
    m_es = re.search(r'[\'"]es-ES[\'"]\s*:\s*\{\s*[\'"]name[\'"]\s*:\s*([\'"`])(.*?)\1\s*,\s*[\'"]description[\'"]\s*:\s*([\'"`])(.*?)\3\s*\}', block, re.DOTALL)
    if m_es:
        name = m_es.group(2).replace("\\'", "'").replace('\\"', '"')
        desc = m_es.group(4).replace("\\'", "'").replace('\\"', '"')
        es_es_cards[f"CARD_{cid}_NAME"] = name
        es_es_cards[f"CARD_{cid}_DESC"] = desc
        es_es_cards[f"{cid}:name"] = name
        es_es_cards[f"{cid}:desc"] = desc
        es_es_cards[cid] = name

print(f"Extracted {len(es_es_cards)} card translations for es-ES from database.")

# Castilian Spanish football terminology replacements
CASTILIAN_REPLACEMENTS = [
    (r'\bpenal\b', 'penalti'),
    (r'\bpenales\b', 'penaltis'),
    (r'\barquero\b', 'portero'),
    (r'\barqueros\b', 'porteros'),
    (r'\barquera\b', 'portera'),
    (r'\bArquero\b', 'Portero'),
    (r'\bArqueros\b', 'Porteros'),
    (r'\bPenal\b', 'Penalti'),
    (r'\bPenales\b', 'Penaltis'),
    (r'\bcomputadora\b', 'ordenador'),
    (r'\bcomputadoras\b', 'ordenadores'),
    (r'\bComputadora\b', 'Ordenador'),
    (r'\bbotines\b', 'botas'),
    (r'\bBotines\b', 'Botas'),
    (r'\bbalompié\b', 'fútbol'),
    (r'\bpatear\b', 'chutar'),
    (r'\bpateó\b', 'chutó'),
    (r'\bpateas\b', 'chutas'),
    (r'\bpatea\b', 'chuta'),
    (r'\bchuta\b', 'chuta'),
    (r'\bremate al arco\b', 'disparo a puerta'),
    (r'\bremates al arco\b', 'disparos a puerta'),
    (r'\bal arco\b', 'a puerta'),
    (r'\bhinchas\b', 'aficionados'),
    (r'\bHinchas\b', 'Aficionados'),
    (r'\bla hinchada\b', 'la afición'),
    (r'\bLa hinchada\b', 'La afición'),
    (r'\bpotrero\b', 'campo de barrio'),
    (r'\bpotreros\b', 'campos de barrio'),
    (r'\bPotrero\b', 'Fútbol de Barrio'),
    (r'\bcancha\b', 'campo'),
    (r'\bcanchas\b', 'campos'),
    (r'\bCancha\b', 'Campo'),
    (r'\bCanchas\b', 'Campos'),
    (r'\bcanchita\b', 'pista'),
    (r'\bDT\b', 'Míster'),
    (r'\bDirector Técnico\b', 'Entrenador'),
    (r'\bdirector técnico\b', 'entrenador'),
    (r'\bjugás\b', 'juegas'),
    (r'\btenés\b', 'tienes'),
    (r'\bhacés\b', 'haces'),
    (r'\bpodés\b', 'puedes'),
    (r'\belegí\b', 'elige'),
    (r'\bmirá\b', 'mira'),
    (r'\bcomprá\b', 'compra'),
    (r'\bganá\b', 'gana'),
    (r'\bentrená\b', 'entrena'),
    (r'\bdesbloqueá\b', 'desbloquea'),
    (r'\bconseguí\b', 'consigue'),
    (r'\bponete\b', 'ponte'),
    (r'\bprobalo\b', 'pruébalo'),
    (r'\barmá\b', 'arma'),
    (r'\bguardá\b', 'guarda'),
    (r'\bsumá\b', 'suma'),
    (r'\bquedate\b', 'quédate'),
    (r'\bQuedate\b', 'Quédate'),
]

def to_castilian(text: str) -> str:
    if not isinstance(text, str):
        return text
    res = text
    for pattern, repl in CASTILIAN_REPLACEMENTS:
        res = re.sub(pattern, repl, res)
    return res

# Build base translations from es_ar
castilian_translations = {}
for k, v in es_ar_packet.get('translations', {}).items():
    castilian_translations[k] = to_castilian(v)

# Apply card translations
for k, v in es_es_cards.items():
    castilian_translations[k] = v

# Save intermediate
with open('scripts/castilian_base.json', 'w', encoding='utf-8') as f:
    json.dump(castilian_translations, f, ensure_ascii=False, indent=2)

print(f"Base castilian dictionary generated with {len(castilian_translations)} keys.")
