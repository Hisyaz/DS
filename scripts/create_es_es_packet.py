import json
import re

# Load current Argentinean Spanish as Spanish base and UK English as master
with open('src/data/argentineanSpanishLanguagePacket.json', 'r', encoding='utf-8') as f:
    es_ar_data = json.load(f)

# Load user provided translations from user prompt
user_provided_raw = """{USER_INPUT_PLACEHOLDER}"""
