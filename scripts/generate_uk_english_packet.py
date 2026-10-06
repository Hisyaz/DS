import json
import re
import os

packet = {
    "meta": {
        "formatVersion": "1.0.0",
        "packetId": "en-GB-official",
        "languageCode": "en-GB",
        "languageName": "British English",
        "nativeName": "English (UK)",
        "region": "United Kingdom",
        "flag": "🇬🇧",
        "author": "SEP Core Development Team",
        "description": "Comprehensive Master UK English Language Packet covering every player-readable UI element, menu, card, store item, business, choice, event, perk, stat, position, playstyle, and trophy.",
        "createdAt": "2026-09-07T11:25:00Z",
        "totalKeys": 0
    },
    "translations": {}
}

tr = packet["translations"]

# 1. Parse TRANSLATIONS['en-GB'] from localizationSystem.ts
with open("src/utils/localizationSystem.ts", "r", encoding="utf-8") as f:
    loc_content = f.read()

# Match the en-GB section inside TRANSLATIONS
en_gb_match = re.search(r"const TRANSLATIONS:[^=]*=\s*\{[\s\S]*?['\"]en-GB['\"]:\s*\{([\s\S]*?)\n  \},", loc_content)
if en_gb_match:
    en_gb_text = en_gb_match.group(1)
    # Extract key-value pairs
    for line in en_gb_text.split('\n'):
        line_clean = line.strip()
        if not line_clean or line_clean.startswith('//'):
            continue
        kv = re.match(r"['\"]([^'\"]+)['\"]\s*:\s*(['\"`])([\s\S]*?)\2,?", line_clean)
        if kv:
            key = kv.group(1)
            val = kv.group(3)
            # handle escaped quotes
            val = val.replace("\\'", "'").replace('\\"', '"')
            tr[key] = val

print(f"Extracted from localizationSystem TRANSLATIONS: {len(tr)} keys")

# 2. Add All Cards from all_cards_export.json
with open("all_cards_export.json", "r", encoding="utf-8") as f:
    cards = json.load(f)

for c in cards:
    cid = c.get("id", "")
    cname = c.get("name", "")
    cdesc = c.get("description", "")
    if cid:
        tr[f"CARD_{cid}_NAME"] = cname
        tr[f"CARD_{cid}_DESC"] = cdesc
        tr[f"{cid}:name"] = cname
        tr[f"{cid}:desc"] = cdesc
        tr[cid] = cname
    if cname:
        tr[cname] = cname
        tr[cname.lower().strip()] = cname
    if cdesc:
        tr[cdesc] = cdesc
        tr[cdesc.strip()] = cdesc

print(f"After cards: {len(tr)} keys")

# 3. Add Store Items from storeItems.ts
with open("src/data/storeItems.ts", "r", encoding="utf-8") as f:
    store_text = f.read()

# Extract store items objects: id, name, description, effectSummary, category, tier
item_matches = re.finditer(r"id:\s*['\"]([a-zA-Z0-9_-]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],(?:\s*category:\s*['\"]([^'\"]+)['\"],)?(?:\s*tier:\s*([0-9]+),)?[\s\S]*?description:\s*['\"]([^'\"]+)['\"],(?:\s*effectSummary:\s*['\"]([^'\"]+)['\"],)?", store_text)
count_store = 0
for m in item_matches:
    item_id = m.group(1)
    item_name = m.group(2)
    item_desc = m.group(5)
    item_effect = m.group(6) if m.group(6) else ""
    
    tr[f"STORE_ITEM_{item_id}_NAME"] = item_name
    tr[f"STORE_ITEM_{item_id}_DESC"] = item_desc
    tr[f"{item_id}:name"] = item_name
    tr[f"{item_id}:desc"] = item_desc
    tr[item_id] = item_name
    tr[item_name] = item_name
    tr[item_desc] = item_desc
    if item_effect:
        tr[f"STORE_ITEM_{item_id}_EFFECT"] = item_effect
        tr[f"{item_id}:effect"] = item_effect
        tr[item_effect] = item_effect
    count_store += 1

print(f"Added {count_store} store items, total keys now: {len(tr)}")

# 4. Add Store Categories & Tiers
store_categories = {
    "all": "All Store",
    "consumables": "Consumables",
    "upgrade": "Facilities & Upgrades",
    "season_boost": "Season Boosts",
    "pro_equipment": "Pro Equipment",
    "special_hair": "Cosmetics",
    "cosmetics": "Cosmetics",
    "equipment": "Pro Equipment"
}
for cid, cname in store_categories.items():
    tr[f"STORE_CAT_{cid}"] = cname
    tr[f"STORE_CAT_{cid.upper()}"] = cname
    tr[cname] = cname

store_tiers = {
    1: "Tier 1 (Bronze)",
    2: "Tier 2 (Silver)",
    3: "Tier 3 (Gold)",
    4: "Tier 4 (Platinum)",
    5: "Tier 5 (Diamond)",
    6: "Tier 6 (Shiny Purple)"
}
for tid, tname in store_tiers.items():
    tr[f"STORE_TIER_{tid}"] = tname
    tr[f"TIER_{tid}"] = f"Tier {tid}"
    tr[tname] = tname

# 5. Add Businesses from businesses.ts
with open("src/data/businesses.ts", "r", encoding="utf-8") as f:
    biz_text = f.read()

biz_matches = re.finditer(r"id:\s*['\"]([a-zA-Z0-9_-]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],\s*category:\s*['\"]([^'\"]+)['\"],\s*description:\s*['\"]([^'\"]+)['\"]", biz_text)
for b in biz_matches:
    b_id = b.group(1)
    b_name = b.group(2)
    b_cat = b.group(3)
    b_desc = b.group(4)
    tr[f"BIZ_{b_id}_NAME"] = b_name
    tr[f"BIZ_{b_id}_CAT"] = b_cat
    tr[f"BIZ_{b_id}_DESC"] = b_desc
    tr[f"{b_id}:name"] = b_name
    tr[f"{b_id}:desc"] = b_desc
    tr[b_name] = b_name
    tr[b_cat] = b_cat
    tr[b_desc] = b_desc

# 6. Add Perks from perksSystem.ts
with open("src/utils/perksSystem.ts", "r", encoding="utf-8") as f:
    perk_text = f.read()

perk_matches = re.finditer(r"id:\s*['\"]([a-zA-Z0-9_-]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],\s*category:\s*['\"]([^'\"]+)['\"],\s*shortDescription:\s*['\"]([^'\"]+)['\"],\s*effect:\s*['\"]([^'\"]+)['\"],\s*howToObtain:\s*['\"]([^'\"]+)['\"][\s\S]*?(?:storyTitle:\s*['\"]([^'\"]+)['\"],)?[\s\S]*?(?:storyNarrative:\s*['\"]([^'\"]+)['\"],)?", perk_text)
for p in perk_matches:
    p_id = p.group(1)
    p_name = p.group(2)
    p_cat = p.group(3)
    p_short = p.group(4)
    p_effect = p.group(5)
    p_obtain = p.group(6)
    p_stitle = p.group(7) if p.group(7) else ""
    p_snarrative = p.group(8) if p.group(8) else ""
    
    tr[f"PERK_{p_id}_NAME"] = p_name
    tr[f"PERK_{p_id}_SHORT_DESC"] = p_short
    tr[f"PERK_{p_id}_EFFECT"] = p_effect
    tr[f"PERK_{p_id}_OBTAIN"] = p_obtain
    tr[f"{p_id}:name"] = p_name
    tr[f"{p_id}:desc"] = p_short
    tr[f"{p_id}:effect"] = p_effect
    tr[p_name] = p_name
    tr[p_short] = p_short
    tr[p_effect] = p_effect
    tr[p_obtain] = p_obtain
    if p_stitle:
        tr[f"PERK_{p_id}_STORY_TITLE"] = p_stitle
        tr[p_stitle] = p_stitle
    if p_snarrative:
        tr[f"PERK_{p_id}_STORY_NARRATIVE"] = p_snarrative
        tr[p_snarrative] = p_snarrative

print(f"After perks & businesses: {len(tr)} keys")

# 7. Add Player Types from playerTypes.ts
with open("src/data/playerTypes.ts", "r", encoding="utf-8") as f:
    ptype_text = f.read()

ptypes = [
    ("speedster", "Speedster", "⚡ VELOCITY", "Lightning Pace & Explosive Burst", "Pure Kinetic Engine", "Outrunning defensive lines before they can even set their shape.", "Born with explosive twitch muscle fibers and blazing acceleration. The Speedster relies on pure kinetic velocity, sharp transitional burst, and reflexive reactions to tear past opponents in open space."),
    ("tank", "Tank", "🛡️ POWERHOUSE", "Imposing Physicality & Aerial Dominance", "Physical Colossus", "Overpowering challenges, anchoring duels, and commanding physical presence.", "Built with brute muscular mass and unmatched physical resilience. The Tank bullies defenders, shields possession under suffocating pressure, and wins aerial battles across the entire pitch."),
    ("flair", "Flair", "✨ VIRTUOSO", "Sublime Dribbling & Trickster Magic", "Unpredictable Artist", "Twisting defenders inside out with dazzling improvisation and audacious tricks.", "Endowed with natural street flair, loose hips, and mesmerizing ball manipulation. The Flair artist thrives on one-versus-one isolations, elastico cuts, and audacious moments of sheer improvisation."),
    ("architect", "Architect", "📐 MAESTRO", "Incisive Vision & Precision Passing", "Tactical General", "Dissecting defensive blocks with millimeter-accurate through balls and tempo control.", "Possesses a bird's-eye spatial understanding and flawless passing range. The Architect dictates the match rhythm, effortlessly threading defense-splitting passes through impenetrable defensive low-blocks."),
    ("ice_cold", "Ice Cold", "❄️ FINISHER", "Lethal Composure & Clinical Execution", "Cold-Blooded Goalscorer", "Never blinking in front of goal; placing shots with merciless composure.", "Ice runs through their veins inside the penalty box. The Ice Cold finisher needs only half a yard of space to slot the ball into the corner, indifferent to goalkeeper intimidation or crowd noise."),
    ("patient", "Patient", "🧠 STRATEGIST", "Elite Game-Reading & Disciplined Positioning", "Disciplined Tactician", "Reading the play three steps ahead and occupying the spaces opponents leave unguarded.", "A master of timing, space recognition, and tactical maturity. The Patient footballer rarely wastes motion, calculating the optimum time to strike or intercept with ruthless intellectual clarity."),
    ("wasted_talent", "Wasted Talent", "🔥 UNLEASHED GENIUS", "God-Given Touch & Mercurial Fireworks", "Raw Unfiltered Genius", "Capable of Ballon d'Or brilliance one moment and erratic decisions the next.", "Blessed with the supreme raw footballing gifts of a once-in-a-generation icon, coupled with an unpredictable edge. Every touch carries electrifying world-class danger and unpredictable genius."),
    ("cannon", "Cannon", "💥 THUNDER-FOOT", "Devastating Ball Striking & Long-Range Power", "Ballistic Striker", "Unleashing unstoppable thunderbolts from 35 yards that goalkeepers can only watch.", "Equipped with ballistic leg whip power and heavy ball-striking physics. The Cannon can score from anywhere within the attacking half, turning routine clearances into lethal long-range rockets.")
]

for pid, pname, pbadge, psub, prole, ptag, pdesc in ptypes:
    tr[f"PLAYER_TYPE_{pid.upper()}_NAME"] = pname
    tr[f"PLAYER_TYPE_{pid.upper()}_BADGE"] = pbadge
    tr[f"PLAYER_TYPE_{pid.upper()}_SUBTITLE"] = psub
    tr[f"PLAYER_TYPE_{pid.upper()}_ROLE"] = prole
    tr[f"PLAYER_TYPE_{pid.upper()}_TAGLINE"] = ptag
    tr[f"PLAYER_TYPE_{pid.upper()}_DESC"] = pdesc
    tr[pname] = pname
    tr[pbadge] = pbadge
    tr[psub] = psub
    tr[prole] = prole
    tr[ptag] = ptag
    tr[pdesc] = pdesc

# 8. Add Stats & Positions & Sub-positions & Playstyles
stats_vocab = {
    "pace": "Pace", "shooting": "Shooting", "passing": "Passing",
    "dribbling": "Dribbling", "defending": "Defending", "physical": "Physicality",
    "physicality": "Physicality",
    "sprintSpeed": "Sprint Speed", "acceleration": "Acceleration",
    "finishing": "Finishing", "longShots": "Long Shots", "longShooting": "Long Shots",
    "shotPower": "Shot Power", "penalties": "Penalties", "heading": "Heading",
    "shortPass": "Short Pass", "longPass": "Long Pass", "vision": "Vision",
    "crossing": "Crossing", "ballControl": "Ball Control", "retention": "Retention",
    "agility": "Agility", "balance": "Balance", "marking": "Marking",
    "tackling": "Tackling", "interceptions": "Interceptions", "interception": "Interceptions",
    "strength": "Strength", "stamina": "Stamina", "jumping": "Jumping",
    "aggression": "Aggression", "positioning": "Positioning", "composure": "Composure",
    "reactions": "Reactions", "reaction": "Reactions",
    "saving": "Saving", "handling": "Handling", "reflexes": "Reflexes",
    "aerialReach": "Aerial Reach", "aerial": "Aerial Reach", "oneOnOne": "1-on-1",
    "distribution": "Distribution", "fitness": "Fitness"
}
for sid, sname in stats_vocab.items():
    tr[f"STAT_{sid.upper()}"] = sname
    tr[f"ATTR_{sid.upper()}"] = sname
    tr[sname] = sname

abbr_vocab = {
    "PAC": "PAC", "SHO": "SHO", "PAS": "PAS", "DRI": "DRI", "DEF": "DEF", "PHY": "PHY",
    "SPD": "SPD", "ACC": "ACC", "FIN": "FIN", "LSH": "LSH", "POW": "POW", "PEN": "PEN",
    "HEA": "HEA", "SPA": "SPA", "LPA": "LPA", "VIS": "VIS", "CRO": "CRO", "CON": "CON",
    "RET": "RET", "AGI": "AGI", "BAL": "BAL", "MAR": "MAR", "TAC": "TAC", "INT": "INT",
    "STR": "STR", "STA": "STA", "JMP": "JMP", "AGG": "AGG", "POS": "POS", "CMP": "CMP",
    "REA": "REA", "SAV": "SAV", "HAN": "HAN", "REF": "REF", "AER": "AER", "ONE": "ONE", "DIS": "DIS"
}
for aid, aname in abbr_vocab.items():
    tr[f"ABBR_{aid}"] = aname

positions_vocab = {
    "GK": "Goalkeeper",
    "CB": "Centre Back",
    "LB": "Left Back",
    "RB": "Right Back",
    "LWB": "Left Wing Back",
    "RWB": "Right Wing Back",
    "CDM": "Defensive Midfielder",
    "CM": "Central Midfielder",
    "CAM": "Attacking Midfielder",
    "LM": "Left Midfielder",
    "RM": "Right Midfielder",
    "LW": "Left Winger",
    "RW": "Right Winger",
    "ST": "Striker",
    "CF": "Centre Forward"
}
for pid, pname in positions_vocab.items():
    tr[f"POS_{pid}"] = pname
    tr[pname] = pname
    tr[pid] = pid

subpos_vocab = {
    "sweeper_keeper": "Sweeper Keeper",
    "shot_stopper": "Shot Stopper",
    "ball_playing_cb": "Ball-Playing Defender",
    "stopper_cb": "Stopper",
    "no_nonsense_cb": "No-Nonsense Defender",
    "inverted_fb": "Inverted Fullback",
    "attacking_wb": "Attacking Wingback",
    "defensive_fb": "Defensive Fullback",
    "deep_lying_pm": "Deep-Lying Playmaker",
    "box_to_box": "Box-to-Box Midfielder",
    "ball_winner": "Ball-Winning Midfielder",
    "advanced_pm": "Advanced Playmaker",
    "mezzala": "Mezzala",
    "shadow_striker": "Shadow Striker",
    "wide_playmaker": "Wide Playmaker",
    "inverted_winger": "Inverted Winger",
    "touchline_winger": "Touchline Winger",
    "poacher": "Poacher",
    "target_man": "Target Man",
    "complete_forward": "Complete Forward",
    "false_nine": "False 9"
}
for spid, spname in subpos_vocab.items():
    tr[f"SUBPOS_{spid.upper()}"] = spname
    tr[spname] = spname

# 9. Add Starting Cities & Landmarks
cities_vocab = {
    "paris": ("Paris", "France", "Paris, France", "City of Lights, street cages, and explosive counter-attacking youth.", "Saint-Denis & Paris Street Cages"),
    "sao_paulo": ("São Paulo", "Brazil", "São Paulo, Brazil", "Street football, creativity, and attacking talent shaped by generations of players.", "Várzea Pitches & Futsal Courts"),
    "london": ("London", "England", "London, England", "Historic football culture, intense competition, and one of the deepest talent networks.", "Wembley & South London Cage Arenas"),
    "madrid": ("Madrid", "Spain", "Madrid, Spain", "Technical football, tactical education, and development of complete players.", "Valdebebas & Castilian Academies"),
    "buenos_aires": ("Buenos Aires", "Argentina", "Buenos Aires, Argentina", "Potrero grit, supreme passion, dribbling in tight spaces, and fierce mentality.", "Potreros de Barrio & La Paternal"),
    "milan": ("Milan", "Italy", "Milan, Italy", "Tactical discipline, defensive artistry, and historic championship pedigree.", "San Siro Grounds & Lombardy Arenas"),
    "munich": ("Munich", "Germany", "Munich, Germany", "Physical power, systematic execution, relentless pressing, and winning mentality.", "Olympiapark & Säbener Training Grounds"),
    "lisbon": ("Lisbon", "Portugal", "Lisbon, Portugal", "Winger academy, trickery, individual technique, and maritime resilience.", "Tagus Coastal Pitches & Alcochete Grounds")
}
for cid, (cname, ccountry, cfull, cdesc, clandmark) in cities_vocab.items():
    tr[f"CITY_{cid.upper()}_NAME"] = cname
    tr[f"CITY_{cid.upper()}_COUNTRY"] = ccountry
    tr[f"CITY_{cid.upper()}_FULL"] = cfull
    tr[f"CITY_{cid.upper()}_DESC"] = cdesc
    tr[f"CITY_{cid.upper()}_LANDMARK"] = clandmark
    tr[cname] = cname
    tr[ccountry] = ccountry
    tr[cfull] = cfull
    tr[cdesc] = cdesc
    tr[clandmark] = clandmark

# 10. Add Development Stages & Youth Football Schools
stages_vocab = {
    "teenage": ("Teenage Development", "Formative development era. Receive personal Stat Points per year, plus youth development points from your club across all squad levels."),
    "mature": ("Mature Development", "Mature development era. Receive personal Stat Points per year to refine and master your tactical skills."),
    "peak": ("Peak Years", "Athletic and technical prime. Stat points stabilize at peak capacity with no annual free stat allocations."),
    "veteran": ("Veteran Mastery", "Experienced veteran leadership. Use tactical acumen, composure, and veteran perks as physical attributes naturally soften."),
    "twilight": ("Twilight Career", "Final twilight era before hanging up the boots. Farewell matches, legacy cementing, and transition to legendary status.")
}
for stid, (stname, stdesc) in stages_vocab.items():
    tr[f"STAGE_{stid.upper()}_NAME"] = stname
    tr[f"STAGE_{stid.upper()}_DESC"] = stdesc
    tr[stname] = stname
    tr[stdesc] = stdesc

# 11. Add Nationalities
nationalities = [
    "Argentina", "France", "Belgium", "Brazil", "England", "Portugal", "Netherlands", "Spain",
    "Croatia", "Italy", "Uruguay", "Morocco", "Colombia", "Mexico", "United States", "Germany",
    "Senegal", "Japan", "Iran", "Switzerland", "Denmark", "Korea Republic", "Australia", "Ukraine",
    "Austria", "Poland", "Sweden", "Hungary", "Wales", "Nigeria", "Ecuador", "Chile", "Algeria",
    "Egypt", "Scotland", "Turkey", "Norway", "Cameroon", "Canada", "Ivory Coast", "Ghana", "Serbia",
    "Czech Republic", "Slovakia", "Romania", "Greece", "Peru", "Costa Rica", "Saudi Arabia", "South Africa"
]
for nat in nationalities:
    tr[f"NAT_{nat.upper().replace(' ', '_')}"] = nat
    tr[nat] = nat

# 12. Add Trophies & Awards
trophies_vocab = {
    "ballon_dor": ("Ballon d'Or", "Awarded annually to the greatest footballer on planet Earth."),
    "golden_boot": ("European Golden Shoe", "Awarded to the top league goalscorer across the European football pyramid."),
    "best_playmaker": ("World's Best Playmaker", "Awarded to the premier assist provider and creative visionary of the season."),
    "golden_glove": ("World Golden Glove", "Awarded to the elite goalkeeper with the highest clean sheet percentage."),
    "puskas_award": ("FIFA Puskás Award", "Awarded for the most aesthetically extraordinary goal scored in world football."),
    "world_player_year": ("The Best FIFA Men's Player", "Global football federation award for supreme individual excellence."),
    "nxgn_award": ("NXGN Wonderkid of the Year", "Awarded to the world's most promising teenage football prodigy."),
    "champions_league": ("Continental Champions Trophy", "The pinnacle of club football. Awarded to the champions of Europe."),
    "europa_league": ("Europa Continental Cup", "Prestigious second continental European tournament trophy."),
    "world_cup": ("FIFA World Cup", "The ultimate holy grail of international sport, contested every four years."),
    "domestic_league": ("Domestic League Championship", "Awarded to the team finishing first place over the gruelling league campaign."),
    "domestic_cup": ("National FA Cup", "Historic national knockout cup competition trophy."),
    "super_cup": ("Continental Super Cup", "Curtain-raiser clash between the Continental Champions and Europa winners.")
}
for tid, (tname, tdesc) in trophies_vocab.items():
    tr[f"TROPHY_{tid.upper()}_NAME"] = tname
    tr[f"TROPHY_{tid.upper()}_DESC"] = tdesc
    tr[tname] = tname
    tr[tdesc] = tdesc

# Update totalKeys
packet["meta"]["totalKeys"] = len(tr)

# Write to file
output_path = "src/data/ukEnglishLanguagePacket.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(packet, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {output_path} with {len(tr)} keys!")
